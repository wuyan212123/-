"""导入工具导出文件，计算细分市场指标，回写 product_map.json。

用法：
  python3 selection_map/ingest.py                 # 导入 selection_map/imports/ 下所有新文件
  python3 selection_map/ingest.py --data <json>   # 指定数据文件（测试用）
  python3 selection_map/ingest.py --imports <dir>

文件放在 selection_map/imports/<大类>/ 下，按文件名识别类型（日期 YYYYMMDD 放在文件名最后）：
  <形态编号>_<关键词>_<YYYYMMDD>.xlsx|csv   该形态核心词搜索结果 Top 50（必需）
  KW_<小类>_<YYYYMMDD>.xlsx|csv             关键词挖掘
  TREND_<形态编号>_<YYYYMMDD>.xlsx|csv      近 12–24 个月月度销量或搜索量（可选）
  MEEDEN_ASIN_<YYYYMMDD>.xlsx|csv           MEEDEN 全量 ASIN（SKU–ASIN 对照表）
  MEEDEN_SALES_<YYYYMMDD>.xlsx|csv          MEEDEN 各 ASIN 近 3 个月月均销量（每个 ASIN 一行）
  NODES_<大类>_<YYYYMMDD>.xlsx|csv          亚马逊末级类目清单
列名别名在 selection_map/config/columns.json 配置。已导入的文件记在 imports_log，不会重复导入（--force 可重导）。
"""
import argparse, datetime as dt, json, os, re, statistics, sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scoring

HERE = os.path.dirname(os.path.abspath(__file__))
COLS = json.load(open(os.path.join(HERE, "config", "columns.json"), encoding="utf-8"))
DATE_RE = re.compile(r"_(\d{8})\.(xlsx|xls|csv)$", re.I)
TRACK = ["meeden_status", "monthly_units", "seg_revenue_top10", "n_pass", "cr1", "gate_g1", "gate_g2", "gate_g3", "mos_score", "conclusion_suggested"]


def norm(s):
    s = re.sub(r"[\(（\[【].*?[\)）\]】]", "", str(s))
    return re.sub(r"\s+", "", s).lower()


def read_table(path, kind):
    aliases = {k: [norm(a) for a in v] for k, v in COLS[kind].items()}
    if path.lower().endswith(".csv"):
        import csv
        for enc in ("utf-8-sig", "gb18030"):
            try:
                with open(path, encoding=enc, newline="") as fh: rows = list(csv.reader(fh))
                break
            except UnicodeDecodeError:
                continue
        width = max((len(x) for x in rows), default=0)
        raw = pd.DataFrame([x + [None] * (width - len(x)) for x in rows], dtype=object)
        raw = raw.where(raw.map(lambda v: not (isinstance(v, str) and v.strip() == "")), None)
    else:
        raw = pd.read_excel(path, header=None, dtype=str)
    hdr = None
    for i in range(min(15, len(raw))):
        cells = [norm(x) for x in raw.iloc[i].tolist() if isinstance(x, str)]
        hits = sum(1 for al in aliases.values() if any(c in al for c in cells))
        if hits >= 2:
            hdr = i; break
    if hdr is None:
        raise ValueError(f"{os.path.basename(path)}：前 15 行里找不到表头，请在 config/columns.json 补充列名别名")
    df = raw.iloc[hdr + 1:].reset_index(drop=True)
    df.columns = [norm(c) for c in raw.iloc[hdr].tolist()]
    out, missing = pd.DataFrame(index=df.index), []
    for k, al in aliases.items():
        col = next((c for c in df.columns if c in al), None)
        if col is None: missing.append(k)
        else: out[k] = df[col]
    return out.dropna(how="all"), missing


def num(x):
    if x is None or (isinstance(x, float) and pd.isna(x)): return None
    s = str(x).strip().replace(",", "").replace("$", "").replace("￥", "").replace("%", "")
    m = re.match(r"^(-?\d+(?:\.\d+)?)\s*([kKwW万]?)\+?$", s)
    if not m: return None
    v = float(m.group(1))
    return v * {"k": 1e3, "w": 1e4, "万": 1e4}.get(m.group(2).lower(), 1)


def to_date(x):
    if x is None or (isinstance(x, float) and pd.isna(x)): return None
    try: return pd.to_datetime(str(x), errors="coerce").date()
    except Exception: return None


def toks(text):
    """把英文词拆成词集合，去掉括号说明，简单处理复数。"""
    text = re.sub(r"[（(].*?[)）]", " ", str(text).lower())
    out = set()
    for w in re.findall(r"[a-z0-9']+", text):
        if len(w) > 3 and w.endswith("es") and not w.endswith("ses"): w = w[:-2]
        elif len(w) > 3 and w.endswith("s"): w = w[:-1]
        out.add(w)
    return out


def truthy(x):
    return str(x).strip().lower() in ("是", "y", "yes", "true", "1", "广告", "sponsored", "ad")


def pct(vals, q):
    vals = sorted(vals)
    if not vals: return None
    k = (len(vals) - 1) * q; f = int(k); c = min(f + 1, len(vals) - 1)
    return round(vals[f] + (vals[c] - vals[f]) * (k - f), 2)


def product_metrics(df, file_date, meta, rec):
    th = meta["thresholds"]
    if "sponsored" in df: df = df[~df["sponsored"].map(truthy)]
    df = df.head(50).copy()
    df["units_n"] = df["units"].map(num) if "units" in df else None
    df["price_n"] = df["price"].map(num) if "price" in df else None
    if "revenue" in df: df["rev_n"] = df["revenue"].map(num)
    else: df["rev_n"] = None
    df["rev_n"] = [r if r is not None else (u * p if u is not None and p is not None else None) for r, u, p in zip(df["rev_n"], df["units_n"], df["price_n"])]
    df["brand_n"] = df["brand"].map(lambda b: str(b).strip().lower() if isinstance(b, str) else "") if "brand" in df else ""
    rows = [r for _, r in df.iterrows() if r["units_n"] is not None]
    top10 = sorted(rows, key=lambda r: r["units_n"], reverse=True)[:10]
    m = {}
    if not top10: return m
    u10 = sum(r["units_n"] for r in top10)
    m["seg_units_top10"] = int(u10)
    m["seg_revenue_top10"] = round(sum(r["rev_n"] or 0 for r in top10))
    m["n_pass"] = sum(1 for r in rows if r["units_n"] >= th["pass_units"] or (r["rev_n"] or 0) >= th["pass_revenue_usd"])
    by_brand = {}
    for r in top10: by_brand[r["brand_n"]] = by_brand.get(r["brand_n"], 0) + r["units_n"]
    shares = sorted(by_brand.values(), reverse=True)
    if u10 > 0:
        m["cr1"] = round(shares[0] / u10, 3); m["cr3"] = round(sum(shares[:3]) / u10, 3)
    if "reviews" in df:
        rv = [num(r["reviews"]) for r in top10 if num(r["reviews"]) is not None]
        m["reviews_median_top10"] = int(statistics.median(rv)) if rv else None
    if "rating" in df:
        rt = [num(r["rating"]) for r in top10 if num(r["rating"]) is not None]
        m["rating_avg_top10"] = round(sum(rt) / len(rt), 2) if rt else None
    if "launch_date" in df and file_date:
        new = [r for r in rows if to_date(r["launch_date"]) and (file_date - to_date(r["launch_date"])).days <= 365]
        m["n_new_top50"] = len(new)
        m["new_avg_units"] = int(sum(r["units_n"] for r in new) / len(new)) if new else None
    if "seller_country" in df:
        sc = [str(r["seller_country"]) for r in rows if isinstance(r["seller_country"], str) and r["seller_country"].strip()]
        if sc: m["share_cn_sellers"] = round(sum(1 for s in sc if re.search(r"cn|china|中国", s, re.I)) / len(sc), 3)
    big = set(meta.get("big_brands", []))
    if rows: m["share_big_brand"] = round(sum(1 for r in rows if r["brand_n"] in big) / len(rows), 3)
    prices = [r["price_n"] for r in rows if r["price_n"] is not None]
    m["price_p25"], m["price_p50"], m["price_p75"] = pct(prices, .25), pct(prices, .5), pct(prices, .75)
    t1 = top10[0]
    m["benchmark"] = f'{t1.get("brand") or ""} {str(t1.get("title") or "")[:48]}'.strip()
    m["monthly_units"] = int(t1["units_n"]); m["price_usd"] = t1["price_n"]
    if "size_tier" in df and isinstance(t1.get("size_tier"), str): m["size_tier"] = t1["size_tier"]
    if "fba_fee" in df:
        fees = [num(r["fba_fee"]) for r in top10 if num(r["fba_fee"]) is not None]
        if fees:
            m["fba_fee_est"] = round(statistics.median(fees), 2)
            if m["price_p50"]: m["price_fee_ratio"] = round(m["price_p50"] / m["fba_fee_est"], 2)
    # 分级
    anchors = rec.get("level_anchors") or {}
    l1 = anchors.get("L1_max") or pct(prices, 1 / 3); l2 = anchors.get("L2_max") or pct(prices, .8)
    levels = {k: {"price_range": None, "top1": None, "seg_units": 0, "meeden_asins": [], "framework_hint": (rec.get("levels") or {}).get(k, {}).get("framework_hint")} for k in ("L1", "L2", "L3")}
    for r in rows:
        if r["price_n"] is None: continue
        k = "L1" if r["price_n"] <= l1 else "L2" if r["price_n"] <= l2 else "L3"
        L = levels[k]; L["seg_units"] += int(r["units_n"])
        pr = L["price_range"] or [r["price_n"], r["price_n"]]; L["price_range"] = [min(pr[0], r["price_n"]), max(pr[1], r["price_n"])]
        if L["top1"] is None or r["units_n"] > L["top1"]["units"]:
            L["top1"] = {"brand": r.get("brand"), "asin": r.get("asin"), "units": int(r["units_n"]), "price": r["price_n"]}
        if r["brand_n"] == "meeden" and isinstance(r.get("asin"), str): L["meeden_asins"].append(r["asin"].strip())
    m["levels"] = levels
    m["level_cut"] = {"L1_max": l1, "L2_max": l2, "method": "anchors" if anchors else "P33/P80"}
    mee = [r for r in rows if r["brand_n"] == "meeden"]
    if mee: m["own_units_in_export"] = int(sum(r["units_n"] for r in mee))
    return m


def trend_metrics(df):
    vals = [num(v) for v in df["value"]] if "value" in df else []
    vals = [v for v in vals if v is not None]
    m = {}
    if len(vals) >= 12:
        last12 = vals[-12:]; avg = sum(last12) / 12
        if avg > 0: m["season_index"] = round(max(last12) / avg, 2)
        if "month" in df:
            months = list(df["month"])[-12:]
            top = sorted(range(12), key=lambda i: last12[i], reverse=True)[:2]
            m["peak_months"] = [str(months[i]) for i in top]
    if len(vals) >= 24:
        prev = sum(vals[-24:-12])
        if prev > 0: m["yoy_growth"] = round(sum(vals[-12:]) / prev - 1, 3)
    return m


def run(data_path, imports_dir, force=False):
    db = json.load(open(data_path, encoding="utf-8"))
    meta, recs = db["meta"], {r["id"]: r for r in db["records"]}
    done = {e["file"] for e in db.get("imports_log", [])}
    before = {i: {k: r.get(k) for k in TRACK} for i, r in recs.items()}
    log, today, touched = [], dt.date.today().isoformat(), set()
    files = []
    for root, _, fs in os.walk(imports_dir):
        for f in fs:
            if DATE_RE.search(f): files.append(os.path.join(root, f))
    def order(p):
        f = os.path.basename(p)
        for i, pre in enumerate(("NODES_", "MEEDEN_ASIN", "KW_", "TREND_", "MEEDEN_SALES")):
            if f.startswith(pre): return (i + 1 if pre != "MEEDEN_SALES" else 9, f)
        return (0, f)                                   # 形态 Top 50 导出最先处理
    for path in sorted(files, key=order):
        rel = os.path.relpath(path, os.path.dirname(HERE)); f = os.path.basename(path)
        if rel in done and not force: continue
        d = dt.datetime.strptime(DATE_RE.search(f).group(1), "%Y%m%d").date()
        stem = f[:DATE_RE.search(f).start()]
        try:
            if stem.startswith("MEEDEN_ASIN"):
                df, miss = read_table(path, "meeden_asin")
                lst = {x["asin"]: x for x in db["meeden_asin_list"]}
                for _, r in df.iterrows():
                    a = str(r.get("asin") or "").strip()
                    if not a: continue
                    lst[a] = {"asin": a, "sku": r.get("sku") if isinstance(r.get("sku"), str) else None, "title": r.get("title") if isinstance(r.get("title"), str) else None,
                              "status": r.get("status") if isinstance(r.get("status"), str) else None, "as_of": d.isoformat(), "form_id": lst.get(a, {}).get("form_id")}
                db["meeden_asin_list"] = list(lst.values()); note = f"{len(df)} 个 ASIN"
            elif stem.startswith("MEEDEN_SALES"):
                df, miss = read_table(path, "meeden_sales")
                sales = {str(r["asin"]).strip(): r for _, r in df.iterrows() if isinstance(r.get("asin"), str)}
                for rec in recs.values():
                    mine = [x["asin"] for x in rec.get("meeden_asins", [])]
                    hit = [sales[a] for a in mine if a in sales]
                    if not hit: continue
                    touched.add(rec["id"])
                    rec["own_units"] = int(sum(num(h.get("units")) or 0 for h in hit))
                    rr = [num(h.get("return_rate")) for h in hit if num(h.get("return_rate")) is not None]
                    rt = [num(h.get("rating")) for h in hit if num(h.get("rating")) is not None]
                    rec["own_return_rate"] = round(sum(rr) / len(rr), 2) if rr else None
                    rec["own_rating"] = round(sum(rt) / len(rt), 2) if rt else None
                    if rec.get("seg_units_top10"): rec["own_share"] = round(rec["own_units"] / rec["seg_units_top10"], 3)
                note = f"{len(sales)} 个 ASIN 的销量"
            elif stem.startswith("KW_"):
                df, miss = read_table(path, "keyword")
                sub = stem[3:]
                km = {(x["keyword"], x.get("subcategory")): x for x in db["keyword_map"]}
                cand = [r for r in recs.values() if sub in (r.get("subcategory"), r.get("group"))] or list(recs.values())
                for _, r in df.iterrows():
                    kw = str(r.get("keyword") or "").strip()
                    if not kw: continue
                    key = (kw, sub); old = km.get(key, {})
                    fid = old.get("form_id")
                    if not fid:
                        best = None
                        kt = toks(kw)
                        for rec in cand:
                            for t in [toks(t) for t in rec["keyword_en"].split("/") if t.strip()]:
                                if t and t <= kt and (best is None or len(t) > best[0]): best = (len(t), rec["id"])
                        fid = best[1] if best else None
                    km[key] = {"keyword": kw, "subcategory": sub, "volume": num(r.get("volume")), "form_id": fid, "as_of": d.isoformat(), "source": "A:" + rel}
                    if fid and fid in recs:
                        rec = recs[fid]
                        if kw not in rec["keyword_cluster"]: rec["keyword_cluster"].append(kw)
                        first = rec["keyword_en"].split("/")[0].strip().lower()
                        if kw.lower() == first: rec["search_volume"] = num(r.get("volume"))
                db["keyword_map"] = list(km.values()); note = f"{len(df)} 个关键词"
            elif stem.startswith("NODES_"):
                df, miss = read_table(path, "nodes")
                nm = {x["node_id"]: x for x in db["browse_node_map"]}
                for _, r in df.iterrows():
                    nid = str(r.get("node_id") or "").strip()
                    if nid and nid not in nm:
                        nm[nid] = {"node_id": nid, "path": r.get("node_path"), "form_ids": [], "excluded_reason": None, "as_of": d.isoformat()}
                db["browse_node_map"] = list(nm.values()); note = f"{len(df)} 个类目节点"
            elif stem.startswith("TREND_"):
                fid = stem.split("_")[1]
                if fid not in recs: raise ValueError(f"找不到形态编号 {fid}")
                df, miss = read_table(path, "trend")
                recs[fid].update(trend_metrics(df)); touched.add(fid); note = "趋势"
            else:
                fid = stem.split("_")[0]
                if fid not in recs: raise ValueError(f"文件名开头的形态编号 {fid} 不在地图里")
                df, miss = read_table(path, "product")
                need = [k for k in ("asin", "brand", "price", "units") if k in miss]
                if need: raise ValueError(f"缺少必需列 {need}，请在 config/columns.json 补充别名")
                m = product_metrics(df, d, meta, recs[fid])
                rec = recs[fid]; touched.add(fid)
                for k, v in m.items():
                    if k == "own_units_in_export": continue
                    rec[k] = v
                for lv in ("L1", "L2", "L3"):
                    for a in m.get("levels", {}).get(lv, {}).get("meeden_asins", []):
                        if a not in [x["asin"] for x in rec["meeden_asins"]]:
                            rec["meeden_asins"].append({"asin": a, "status": "在售（导出可见）", "level": lv})
                        for x in rec["meeden_asins"]:
                            if x["asin"] == a: x["level"] = lv; x["status"] = "在售（导出可见）"
                rec.update({"data_source": "A:" + (meta.get("data_tool") or "工具导出"), "as_of": d.isoformat(), "confidence": "高", "evidence_ref": rel})
                note = f"Top{min(len(df),50)}，缺可选列 {sorted(set(miss) - {'sponsored'})}" if miss else f"Top{min(len(df),50)}"
            db.setdefault("imports_log", []).append({"file": rel, "imported_on": today, "data_date": d.isoformat(), "result": "成功", "note": note})
            log.append(("OK", f, note))
        except Exception as e:
            log.append(("ERR", f, str(e)))
    # ASIN 反向映射
    owner = {x["asin"]: r["id"] for r in db["records"] for x in r.get("meeden_asins", [])}
    for x in db["meeden_asin_list"]:
        x["form_id"] = owner.get(x["asin"], x.get("form_id"))
    scoring.score_all(db)
    for i, r in recs.items():
        ch = {k: [before[i][k], r.get(k)] for k in TRACK if before[i][k] != r.get(k) and (i in touched or before[i][k] is not None)}
        if ch: db["changelog"].append({"date": today, "type": "数据更新", "form_id": i, "form": r["form"], "changes": ch})
    meta["updated"] = today
    json.dump(db, open(data_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return log


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=os.path.join(HERE, "data", "product_map.json"))
    ap.add_argument("--imports", default=os.path.join(HERE, "imports"))
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    res = run(a.data, a.imports, a.force)
    for s, f, n in res: print(f"[{s}] {f}  {n}")
    if not res: print("没有新的导入文件；已重新计算闸门和评分")
    if any(s == "ERR" for s, _, _ in res): sys.exit(1)
