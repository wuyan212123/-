"""把「MEEDEN 产品地图」网页导出的 JSON 合并回仓库的 product_map.json。

分工：
- 网页是人工字段的权威：MEEDEN 状态、ASIN 证据、降级模式手填的头部单品、风险、结论、备注、归档等
  （导出文件 meta.manual_fields 列出的字段）。
- 仓库 ingest.py 是计算字段的权威：seg_*、cr*、levels、own_* 等。本脚本绝不改计算字段，
  合并后重新跑 scoring.score_all 刷新三道闸、评分和建议结论。

规则：
- 仓库已有的编号：只覆盖人工字段，有变化才写，并在 changelog 记「网页编辑」。
- 网页新增的编号：整条加入（去掉网页专用的 created_*/updated_* 字段，缺的字段补 null）。
  编号必须是「大类前缀 + 3 位数字」，且没在仓库用过。
- 仓库有、导出里没有的编号：只提示，不删除（编号永不删除、不复用）。
- 状态为「已有」却没有任何 MEEDEN ASIN 的记录：拒绝合并该条并提示。

用法：
  python3 selection_map/sync_app_export.py 导出文件.json [--data selection_map/data/product_map.json] [--dry-run]
合并后照常运行 python3 selection_map/build.py 生成 Excel 和思维导图。
"""
import argparse, json, os, re, sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import scoring

DEFAULT_MANUAL = ["category", "group", "subcategory", "form", "spec", "keyword_en", "framework_ref", "scene", "meeden_status",
                  "evidence_asin", "evidence_other", "meeden_asins", "benchmark", "monthly_units", "price_usd", "data_source", "as_of",
                  "confidence", "evidence_ref", "trend_signal", "risk", "risk_flags", "conclusion", "note", "checked_on", "priority",
                  "synergy", "opp_risk", "next_step", "level_anchors", "archived", "archived_note"]
# 计算字段永远以仓库为准，即使导出文件把它们列进 manual_fields 也不接受
COMPUTED = {"browse_nodes", "keyword_cluster", "levels", "level_cut", "own_units", "own_share", "own_rating", "own_return_rate",
            "seg_units_top10", "seg_revenue_top10", "n_pass", "search_volume", "yoy_growth", "season_index", "peak_months", "cr1", "cr3",
            "reviews_median_top10", "n_new_top50", "new_avg_units", "share_cn_sellers", "share_big_brand", "rating_avg_top10",
            "low_star_share", "cpc_suggested", "price_p25", "price_p50", "price_p75", "size_tier", "fba_fee_est", "price_fee_ratio",
            "gate_g1", "gate_g2", "gate_g3", "mos_score", "mos_breakdown", "mos_complete", "data_gaps", "conclusion_suggested", "v1_snapshot"}
APP_ONLY = {"created_at", "created_by", "updated_at", "updated_by"}
PREFIXES = {"耗材": "C", "画架": "E", "艺术家具&收纳": "F", "快消工具": "T", "礼品&套装": "G", "DIY 产品": "D", "儿童产品": "K"}
ASIN = re.compile(r"^B0[0-9A-Z]{8}$")


def has_asin(r):
    return bool(r.get("evidence_asin")) or any(a.get("asin") for a in (r.get("meeden_asins") or []))


def _blank(v):
    # 没填的几种写法（缺字段、null、""、[]、{}、false）视为同一个值，避免网页默认值产生无意义的变更
    return v is None or v is False or v == "" or v == [] or v == {}


def same(a, b):
    if _blank(a) and _blank(b):
        return True
    return json.dumps(a, ensure_ascii=False, sort_keys=True) == json.dumps(b, ensure_ascii=False, sort_keys=True)


def sync(export_path, data_path, dry_run=False):
    exp = json.load(open(export_path, encoding="utf-8"))
    db = json.load(open(data_path, encoding="utf-8"))
    if not isinstance(exp.get("records"), list):
        raise SystemExit("导出文件里没有 records 列表")
    manual = [k for k in (exp.get("meta", {}).get("manual_fields") or DEFAULT_MANUAL) if k not in COMPUTED and k not in APP_ONLY]
    prefixes = dict(PREFIXES, **(db["meta"].get("prefixes") or {}))
    repo = {r["id"]: r for r in db["records"]}
    template_keys = list(db["records"][0].keys()) if db["records"] else []
    used_ids = set(repo) | {c.get("form_id") for c in db.get("changelog", []) if c.get("form_id")}
    today = date.today().isoformat()
    report = {"updated": [], "added": [], "rejected": [], "missing_in_export": []}

    for e in exp["records"]:
        rid = e.get("id")
        if not rid:
            report["rejected"].append(("?", "没有编号"))
            continue
        bad = [a.get("asin") for a in (e.get("meeden_asins") or []) if a.get("asin") and not ASIN.match(a["asin"])]
        if bad:
            report["rejected"].append((rid, "ASIN 格式不对：" + "、".join(bad)))
            continue
        if e.get("meeden_status") == "已有" and not has_asin(e):
            report["rejected"].append((rid, "状态为「已有」但没有 MEEDEN ASIN"))
            continue
        if rid in repo:
            r = repo[rid]
            ch = {}
            for k in manual:
                if k in e and not same(r.get(k), e.get(k)):
                    ch[k] = [r.get(k), e.get(k)]
                    r[k] = e.get(k)
            if ch:
                db["changelog"].append({"date": today, "type": "网页编辑", "form_id": rid, "form": r["form"], "changes": ch})
                report["updated"].append((rid, sorted(ch)))
        else:
            pre = prefixes.get(e.get("category"))
            if not pre or not re.fullmatch(re.escape(pre) + r"\d{3,}", rid):
                report["rejected"].append((rid, f"编号和大类「{e.get('category')}」的前缀 {pre} 对不上"))
                continue
            if rid in used_ids:
                report["rejected"].append((rid, "这个编号在仓库里用过，不能复用"))
                continue
            if not e.get("form") or not e.get("group") or not e.get("keyword_en"):
                report["rejected"].append((rid, "缺少形态、组或英文核心词"))
                continue
            new = {k: None for k in template_keys}
            new.update({k: v for k, v in e.items() if k not in APP_ONLY})
            for k in COMPUTED:          # 计算字段由 ingest/score 产生，新记录先置空
                if k in new and k != "levels":
                    new[k] = None
            new.setdefault("levels", {L: {"price_range": None, "top1": None, "seg_units": None, "meeden_asins": [], "framework_hint": None} for L in ("L1", "L2", "L3")})
            db["records"].append(new)
            repo[rid] = new
            used_ids.add(rid)
            db["changelog"].append({"date": today, "type": "网页新增", "form_id": rid, "form": new["form"], "changes": None})
            report["added"].append(rid)

    exported = {e.get("id") for e in exp["records"]}
    report["missing_in_export"] = sorted(i for i in repo if i not in exported)

    order = {c: i for i, c in enumerate(db["meta"].get("category_order", []))}
    db["records"].sort(key=lambda r: (order.get(r.get("category"), 99), r["id"][0], int(re.sub(r"\D", "", r["id"]) or 0)))
    scoring.score_all(db)
    if not dry_run and (report["updated"] or report["added"]):
        db.setdefault("imports_log", []).append({"file": os.path.basename(export_path), "imported_on": today,
                                                 "data_date": (exp.get("meta", {}).get("exported_at") or "")[:10] or None,
                                                 "result": "成功", "note": f"网页导出合并：更新 {len(report['updated'])}，新增 {len(report['added'])}，拒绝 {len(report['rejected'])}"})
        json.dump(db, open(data_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return report


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("export")
    ap.add_argument("--data", default=os.path.join(HERE, "data", "product_map.json"))
    ap.add_argument("--dry-run", action="store_true", help="只报告，不写文件")
    a = ap.parse_args()
    rep = sync(a.export, a.data, a.dry_run)
    print(f"更新 {len(rep['updated'])} 条：")
    for i, ks in rep["updated"]:
        print(f"  {i}：{'、'.join(ks)}")
    print(f"新增 {len(rep['added'])} 条：{'、'.join(rep['added']) or '无'}")
    if rep["rejected"]:
        print(f"拒绝 {len(rep['rejected'])} 条（未合并，请在网页里改好再导出）：")
        for i, why in rep["rejected"]:
            print(f"  {i}：{why}")
    if rep["missing_in_export"]:
        print(f"仓库有、导出里没有的编号（未删除）：{'、'.join(rep['missing_in_export'])}")
    print("（试运行，未写文件）" if a.dry_run else "完成。下一步：python3 selection_map/build.py")


if __name__ == "__main__":
    main()
