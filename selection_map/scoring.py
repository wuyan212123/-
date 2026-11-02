"""三道闸、地图级机会评分（MOS）和建议结论。规则见 docs/选品地图_V2优化方案.md 第 3.5、3.9 节。

只用记录里已有的数据计算；缺数据的维度记 0 分，并在 data_gaps 里列出，不做任何推算。
建议结论写在 conclusion_suggested，人工结论 conclusion 不会被改动。
"""
import re

HARD_FLAGS = {"hazmat"}
GAP_PAT = re.compile(r"规划中|？|\?|新小类|新形态|空位")


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def gates(r, th):
    g1 = None if not _num(r.get("n_pass")) else ("过" if r["n_pass"] >= th["g1_min_pass"] else "不过")
    if _num(r.get("cr1")):
        ok = r["cr1"] <= th["g2_cr1_max"] and (not _num(r.get("yoy_growth")) or r["yoy_growth"] >= th["g2_yoy_min"])
        g2 = "过" if ok else "不过"
    else:
        g2 = None
    g3 = "不过" if HARD_FLAGS & set(r.get("risk_flags") or []) else "过"
    return g1, g2, g3


def _synergy_count(text):
    if not text or text.strip() in ("—", "-"):
        return 0
    return len([p for p in re.split(r"[、；;,，]", text) if p.strip()])


def mos(r, meta):
    b, gaps = {}, []
    rev = r.get("seg_revenue_top10")
    if _num(rev):
        b["需求规模"] = 25 if rev >= 500000 else 20 if rev >= 200000 else 15 if rev >= 100000 else 10 if rev >= 50000 else 5
    else:
        b["需求规模"] = 0; gaps.append("细分市场销售额")

    s = 0; miss = []
    if _num(r.get("n_pass")): s += 8 if r["n_pass"] >= 3 else 5 if r["n_pass"] >= 2 else 0
    else: miss.append("达标单品数")
    if _num(r.get("cr3")): s += 6 if r["cr3"] < 0.5 else 3 if r["cr3"] <= 0.7 else 0
    else: miss.append("CR3")
    if _num(r.get("n_new_top50")): s += 6 if r["n_new_top50"] >= 2 else 3 if r["n_new_top50"] >= 1 else 0
    else: miss.append("新品数")
    b["可进入性"] = s; gaps += miss

    y = r.get("yoy_growth")
    if _num(y): b["增长"] = 10 if y >= 0.2 else 6 if y >= 0 else 2 if y >= -0.2 else 0
    else: b["增长"] = 0; gaps.append("同比增长")

    flags = set(r.get("risk_flags") or [])
    pfr, p50 = r.get("price_fee_ratio"), r.get("price_p50")
    if "hazmat" in flags: e = 0
    elif _num(pfr): e = 15 if pfr >= 5 else 10 if pfr >= 3 else 6 if pfr >= 2 else 3
    elif _num(p50): e = 12 if p50 >= 25 else 9 if p50 >= 15 else 5
    else: e = 0; gaps.append("价格带 / FBA 费用")
    if "oversize" in flags or "大件" in str(r.get("size_tier") or "").lower() or "oversize" in str(r.get("size_tier") or "").lower():
        e = max(0, e - 3)
    b["经济性"] = e

    st = 0
    if r.get("meeden_status") in ("空白", "部分覆盖") and GAP_PAT.search(r.get("framework_ref") or ""): st += 8
    n_syn = _synergy_count(r.get("synergy"))
    st += 6 if n_syn >= 2 else 3 if n_syn == 1 else 0
    lv = r.get("levels") or {}
    l23_gap = any(((lv.get(k) or {}).get("seg_units") or 0) > 0 and not (lv.get(k) or {}).get("meeden_asins") for k in ("L2", "L3"))
    cat_fit = r.get("category") in meta.get("attack_categories", [])
    low_end = r.get("category") == "快消工具" and _num(p50) and p50 < 10
    if (cat_fit or l23_gap) and not low_end: st += 6
    b["战略契合"] = st

    d = 0
    if "child" in flags: d -= 4
    if "patent" in flags: d -= 4
    if _num(r.get("cr1")) and r["cr1"] > 0.5: d -= 3
    if _num(r.get("season_index")) and r["season_index"] > 3: d -= 2
    if r.get("confidence") == "低": d -= 2
    b["风险扣分"] = max(d, -15)

    score = sum(b.values())
    complete = "细分市场销售额" not in gaps and "达标单品数" not in gaps
    return max(score, 0), b, complete, gaps


def suggest(r, meta):
    th = meta["thresholds"]
    st, g1, g3 = r.get("meeden_status"), r.get("gate_g1"), r.get("gate_g3")
    if st == "已有":
        return "老品升级"
    if g3 == "不过":
        return "淘汰（硬伤）"
    if st == "规划中":
        if r.get("mos_complete") and (r.get("mos_score") or 0) >= meta["mos"]["tier_a"]:
            return "按导图推进（建议提前）"
        return "按导图推进"
    if g1 is None:
        u = r.get("monthly_units")
        if _num(u):
            single = u >= th["pass_units"] or (_num(r.get("price_usd")) and u * r["price_usd"] >= th["pass_revenue_usd"])
            return "待数据（V1 单品达标）" if single else ("待数据（V1 单品偏低）" if u < 500 else "待数据（V1 单品接近）")
        return "待数据"
    if g1 == "不过":
        u = r.get("monthly_units")
        return "观察池" if (_num(u) and u >= 500) or r.get("trend_signal") else "淘汰"
    if r.get("gate_g2") == "不过":
        return "观察池（市场集中或萎缩）"
    if r.get("gate_g2") is None:
        return "待数据（缺集中度）"
    if r.get("category") in meta.get("future_categories", []) or "child" in set(r.get("risk_flags") or []):
        return "观察池（2028 产品线）"
    s = r.get("mos_score") or 0
    if s >= meta["mos"]["tier_a"]: return "立项评审"
    if s >= meta["mos"]["tier_b"]: return "观察池"
    return "C 档（暂不做）"


def score_all(db):
    meta = db["meta"]
    for r in db["records"]:
        r["gate_g1"], r["gate_g2"], r["gate_g3"] = gates(r, meta["thresholds"])
        s, b, complete, gaps = mos(r, meta)
        r["mos_score"], r["mos_breakdown"], r["mos_complete"], r["data_gaps"] = s, b, complete, gaps
        r["conclusion_suggested"] = suggest(r, meta)
    return db
