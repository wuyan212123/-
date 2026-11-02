"""一次性迁移：product_map.json 从 V1 结构升级到 V2 结构（2026-11-02 执行）。

- 保留全部 V1 字段；V1 的头部单品数字另存到 v1_snapshot，来源标为 C 级（搜索引擎收录页面）。
- 新增 V2 字段，值为空，等工具导出后由 ingest.py 计算填充。
- risk_flags 按 V1 风险文字归类；meeden_asins 从 V1 证据里解析 ASIN。
重复运行是安全的：已是 V2 的记录不会被改动。
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, "data", "product_map.json")
ASIN_RE = re.compile(r"\bB0[0-9A-Z]{8}\b")

def risk_flags(text):
    t = text or ""
    flags = []
    if re.search(r"易燃|气雾|危险品", t): flags.append("hazmat")
    if re.search(r"儿童|CPSIA", t): flags.append("child")
    if "专利" in t: flags.append("patent")
    if "液体" in t: flags.append("liquid")
    if re.search(r"大件|超大", t): flags.append("oversize")
    if "易碎" in t: flags.append("fragile")
    return flags

def levels_from_ref(ref):
    hint = {"L1": None, "L2": None, "L3": None}
    for lv in ("L1", "L2", "L3"):
        if lv in (ref or ""): hint[lv] = ref
    return {lv: {"price_range": None, "top1": None, "seg_units": None, "meeden_asins": [], "framework_hint": hint[lv]} for lv in hint}

def migrate(db):
    meta = db["meta"]
    if meta.get("schema_version") == 2:
        return db, 0
    meta.update({
        "version": "V2.0", "schema_version": 2, "updated": "2026-11-02",
        "thresholds": {"pass_units": 1500, "pass_revenue_usd": 40000, "g1_min_pass": 2, "g2_cr1_max": 0.6, "g2_yoy_min": -0.2},
        "mos": {"tier_a": 70, "tier_b": 55},
        "level_method": "优先锚定 MEEDEN 已有分级售价（record.level_anchors）；否则 Top 50 售价 P33 / P80 切档",
        "data_tool": None,
        "big_brands": ["crayola", "faber-castell", "winsor & newton", "liquitex", "golden", "prismacolor", "sharpie", "strathmore",
                       "canson", "copic", "tombow", "sakura", "pentel", "staedtler", "daler-rowney", "speedball", "amazon basics"],
        "attack_categories": ["艺术家具&收纳", "耗材"],
        "future_categories": ["DIY 产品", "儿童产品"],
        "decisions": {
            "confirmed_on": "2026-11-02",
            "g1": "至少 2 个单品过门槛（V1 单品口径保留为参考列）",
            "levels": "锚定 MEEDEN 分级 → 价格分位 → 属性，按顺序组合",
            "mos_weights": "按 V2 方案 3.9 建议值，耗材试点后校准",
            "qa": "每大类抽检 10%；A 档与空白 100% 复核",
            "evidence": "导出文件存进仓库 selection_map/imports 与 evidence",
            "pending_from_business": ["主力数据工具", "SKU–ASIN 对照表", "领星自有销量", "执行环境能否访问亚马逊"]}})
    n = 0
    for r in db["records"]:
        if "v1_snapshot" in r: continue
        n += 1
        conf = None
        if r.get("monthly_units") is not None:
            conf = "低" if re.search(r"归属不明|较旧|复核", (r.get("risk") or "") + (r.get("note") or "")) else "中"
        r["v1_snapshot"] = {k: r.get(k) for k in ("benchmark", "monthly_units", "price_usd", "meeden_status", "conclusion")}
        asins = []
        for a in ASIN_RE.findall((r.get("evidence_asin") or "") + " " + (r.get("evidence_other") or "")):
            if a not in [x["asin"] for x in asins]:
                asins.append({"asin": a, "status": "待确认", "level": None})
        r.update({
            "browse_nodes": [], "keyword_cluster": [], "scene": [],
            "levels": levels_from_ref(r.get("framework_ref")), "level_anchors": None,
            "meeden_asins": asins, "own_units": None, "own_share": None, "own_rating": None, "own_return_rate": None,
            "seg_units_top10": None, "seg_revenue_top10": None, "n_pass": None, "search_volume": None,
            "yoy_growth": None, "season_index": None, "peak_months": None,
            "cr1": None, "cr3": None, "reviews_median_top10": None, "n_new_top50": None, "new_avg_units": None,
            "share_cn_sellers": None, "share_big_brand": None, "rating_avg_top10": None, "low_star_share": None, "cpc_suggested": None,
            "price_p25": None, "price_p50": None, "price_p75": None, "size_tier": None, "fba_fee_est": None, "price_fee_ratio": None,
            "risk_flags": risk_flags((r.get("risk") or "") + " " + (r.get("opp_risk") or "")),
            "gate_g1": None, "gate_g2": None, "gate_g3": None, "mos_score": None, "mos_breakdown": None, "mos_complete": False,
            "conclusion_suggested": None,
            "data_source": "C:搜索引擎收录的亚马逊页面（bought in past month 标签）" if conf else None,
            "as_of": "2026-11-02" if conf else None, "confidence": conf, "evidence_ref": None,
        })
    for k, v in (("browse_node_map", []), ("keyword_map", []), ("meeden_asin_list", []), ("changelog", []), ("imports_log", [])):
        db.setdefault(k, v)
    db["changelog"].append({"date": "2026-11-02", "type": "结构升级", "detail": f"V1 → V2 数据结构，迁移 {n} 条记录；V1 快照见 data/snapshots/product_map_V1_20261102.json"})
    return db, n

if __name__ == "__main__":
    db = json.load(open(PATH, encoding="utf-8"))
    db, n = migrate(db)
    json.dump(db, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("migrated", n)
