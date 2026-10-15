"""按「花叔文档审稿专家」描述的三层保护实现：Schema 校验 → 精确字符串定位 → 单条失败隔离。
输入：原 docx + decisions.json；输出：<原名>.reviewed.docx（原文件不覆盖）。"""
import copy, json, sys, zipfile, datetime
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = {"w": W}
q = lambda t: f"{{{W}}}{t}"
REQUIRED = {"id", "severity", "type", "match_text", "comment"}
TYPES = {"comment", "revision", "comment+revision"}

def validate(d):
    missing = REQUIRED - d.keys()
    if missing: return f"缺字段 {missing}"
    if d["type"] not in TYPES: return f"非法 type {d['type']}"
    if "revision" in d["type"] and not d.get("replace_with"): return "revision 缺 replace_with"
    return None

def make_run(rpr, text, deleted=False):
    r = etree.Element(q("r"))
    if rpr is not None: r.append(copy.deepcopy(rpr))
    t = etree.SubElement(r, q("delText" if deleted else "t"))
    t.text = text; t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    return r

def main(src, decisions_path):
    data = json.load(open(decisions_path, encoding="utf-8"))
    author, now = data.get("author", "AI 审稿"), datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    zin = zipfile.ZipFile(src)
    doc = etree.fromstring(zin.read("word/document.xml"))
    comments = etree.Element(q("comments"), nsmap={"w": W})
    log, cid, rid = [], 0, 1000
    for d in data["decisions"]:
        err = validate(d)
        if err: log.append((d.get("id"), "SKIP-schema", err)); continue
        hit = None
        for run in doc.iter(q("r")):
            t = run.find("w:t", NS)
            if t is not None and t.text and d["match_text"] in t.text: hit = (run, t); break
        if not hit: log.append((d["id"], "SKIP-nomatch", d["match_text"])); continue
        run, t = hit
        before, after = t.text.split(d["match_text"], 1)
        rpr = run.find("w:rPr", NS)
        parent, idx = run.getparent(), run.getparent().index(run)
        new = []
        if before: new.append(make_run(rpr, before))
        has_comment = "comment" in d["type"]
        if has_comment:
            cs = etree.Element(q("commentRangeStart")); cs.set(q("id"), str(cid)); new.append(cs)
        if "revision" in d["type"]:
            dl = etree.Element(q("del")); ins = etree.Element(q("ins"))
            for el in (dl, ins):
                el.set(q("id"), str(rid)); el.set(q("author"), author); el.set(q("date"), now); rid += 1
            dl.append(make_run(rpr, d["match_text"], deleted=True)); ins.append(make_run(rpr, d["replace_with"]))
            new += [dl, ins]
        else:
            new.append(make_run(rpr, d["match_text"]))
        if has_comment:
            ce = etree.Element(q("commentRangeEnd")); ce.set(q("id"), str(cid)); new.append(ce)
            ref = etree.Element(q("r")); cr = etree.SubElement(ref, q("commentReference")); cr.set(q("id"), str(cid)); new.append(ref)
            c = etree.SubElement(comments, q("comment"))
            c.set(q("id"), str(cid)); c.set(q("author"), author); c.set(q("date"), now); c.set(q("initials"), "AI")
            p = etree.SubElement(c, q("p")); r_ = etree.SubElement(p, q("r")); tt = etree.SubElement(r_, q("t"))
            tt.text = f"[{d['severity']}] {d['comment']}"
            cid += 1
        if after: new.append(make_run(rpr, after))
        parent.remove(run)
        for i, el in enumerate(new): parent.insert(idx + i, el)
        log.append((d["id"], "OK", d["type"]))
    out = src.replace(".docx", ".reviewed.docx")
    ct = zin.read("[Content_Types].xml").decode()
    if "comments.xml" not in ct:
        ct = ct.replace("</Types>", '<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/></Types>')
    rels = zin.read("word/_rels/document.xml.rels").decode()
    if "comments.xml" not in rels:
        rels = rels.replace("</Relationships>", f'<Relationship Id="rIdCmt1" Type="{R}/comments" Target="comments.xml"/></Relationships>')
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename == "word/document.xml": zout.writestr(item, etree.tostring(doc, xml_declaration=True, encoding="UTF-8", standalone=True))
            elif item.filename == "[Content_Types].xml": zout.writestr(item, ct)
            elif item.filename == "word/_rels/document.xml.rels": zout.writestr(item, rels)
            else: zout.writestr(item, zin.read(item.filename))
        zout.writestr("word/comments.xml", etree.tostring(comments, xml_declaration=True, encoding="UTF-8", standalone=True))
    for row in log: print(*row, sep=" | ")
    return out

if __name__ == "__main__":
    print("->", main(sys.argv[1], sys.argv[2]))
