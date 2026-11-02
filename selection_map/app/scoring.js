/* MEEDEN 选品地图评分（scoring.py 的 JS 版，规则必须与 scoring.py 完全一致）。
 * 浏览器里挂在 window.MeedenScoring，node 里 module.exports。
 * 改规则时两边一起改，并运行 python3 selection_map/app/check_scoring.py 对比。 */
(function (root) {
  "use strict";
  var GAP_PAT = /规划中|？|\?|新小类|新形态|空位/;
  function num(x) { return typeof x === "number" && isFinite(x); }
  function gates(r, th) {
    var g1 = num(r.n_pass) ? (r.n_pass >= th.g1_min_pass ? "过" : "不过") : null;
    var g2 = null;
    if (num(r.cr1)) {
      var ok = r.cr1 <= th.g2_cr1_max && (!num(r.yoy_growth) || r.yoy_growth >= th.g2_yoy_min);
      g2 = ok ? "过" : "不过";
    }
    var flags = r.risk_flags || [];
    var g3 = flags.indexOf("hazmat") >= 0 ? "不过" : "过";
    return [g1, g2, g3];
  }
  function synergyCount(t) {
    if (!t || t.trim() === "—" || t.trim() === "-") return 0;
    return t.split(/[、；;,，]/).filter(function (p) { return p.trim(); }).length;
  }
  function mos(r, meta) {
    var b = {}, gaps = [], rev = r.seg_revenue_top10;
    if (num(rev)) b["需求规模"] = rev >= 500000 ? 25 : rev >= 200000 ? 20 : rev >= 100000 ? 15 : rev >= 50000 ? 10 : 5;
    else { b["需求规模"] = 0; gaps.push("细分市场销售额"); }
    var s = 0, miss = [];
    if (num(r.n_pass)) s += r.n_pass >= 3 ? 8 : r.n_pass >= 2 ? 5 : 0; else miss.push("达标单品数");
    if (num(r.cr3)) s += r.cr3 < 0.5 ? 6 : r.cr3 <= 0.7 ? 3 : 0; else miss.push("CR3");
    if (num(r.n_new_top50)) s += r.n_new_top50 >= 2 ? 6 : r.n_new_top50 >= 1 ? 3 : 0; else miss.push("新品数");
    b["可进入性"] = s; gaps = gaps.concat(miss);
    var y = r.yoy_growth;
    if (num(y)) b["增长"] = y >= 0.2 ? 10 : y >= 0 ? 6 : y >= -0.2 ? 2 : 0; else { b["增长"] = 0; gaps.push("同比增长"); }
    var flags = r.risk_flags || [], has = function (f) { return flags.indexOf(f) >= 0; };
    var pfr = r.price_fee_ratio, p50 = r.price_p50, e;
    if (has("hazmat")) e = 0;
    else if (num(pfr)) e = pfr >= 5 ? 15 : pfr >= 3 ? 10 : pfr >= 2 ? 6 : 3;
    else if (num(p50)) e = p50 >= 25 ? 12 : p50 >= 15 ? 9 : 5;
    else { e = 0; gaps.push("价格带 / FBA 费用"); }
    var st = String(r.size_tier == null ? "None" : r.size_tier).toLowerCase();
    if (has("oversize") || st.indexOf("大件") >= 0 || st.indexOf("oversize") >= 0) e = Math.max(0, e - 3);
    b["经济性"] = e;
    var sc = 0;
    if ((r.meeden_status === "空白" || r.meeden_status === "部分覆盖") && GAP_PAT.test(r.framework_ref || "")) sc += 8;
    var n = synergyCount(r.synergy); sc += n >= 2 ? 6 : n === 1 ? 3 : 0;
    var lv = r.levels || {};
    var l23 = ["L2", "L3"].some(function (k) { var L = lv[k] || {}; return (L.seg_units || 0) > 0 && !(L.meeden_asins && L.meeden_asins.length); });
    var catFit = (meta.attack_categories || []).indexOf(r.category) >= 0;
    var lowEnd = r.category === "快消工具" && num(p50) && p50 < 10;
    if ((catFit || l23) && !lowEnd) sc += 6;
    b["战略契合"] = sc;
    var d = 0;
    if (has("child")) d -= 4;
    if (has("patent")) d -= 4;
    if (num(r.cr1) && r.cr1 > 0.5) d -= 3;
    if (num(r.season_index) && r.season_index > 3) d -= 2;
    if (r.confidence === "低") d -= 2;
    b["风险扣分"] = Math.max(d, -15);
    var score = 0; for (var k in b) score += b[k];
    var complete = gaps.indexOf("细分市场销售额") < 0 && gaps.indexOf("达标单品数") < 0;
    return { score: Math.max(score, 0), breakdown: b, complete: complete, gaps: gaps };
  }
  function suggest(r, meta) {
    var th = meta.thresholds, st = r.meeden_status, g1 = r.gate_g1, g3 = r.gate_g3;
    if (st === "已有") return "老品升级";
    if (g3 === "不过") return "淘汰（硬伤）";
    if (st === "规划中") {
      if (r.mos_complete && (r.mos_score || 0) >= meta.mos.tier_a) return "按导图推进（建议提前）";
      return "按导图推进";
    }
    if (g1 == null) {
      var u = r.monthly_units;
      if (num(u)) {
        var single = u >= th.pass_units || (num(r.price_usd) && u * r.price_usd >= th.pass_revenue_usd);
        return single ? "待数据（V1 单品达标）" : (u < 500 ? "待数据（V1 单品偏低）" : "待数据（V1 单品接近）");
      }
      return "待数据";
    }
    if (g1 === "不过") {
      var u2 = r.monthly_units;
      return ((num(u2) && u2 >= 500) || r.trend_signal) ? "观察池" : "淘汰";
    }
    if (r.gate_g2 === "不过") return "观察池（市场集中或萎缩）";
    if (r.gate_g2 == null) return "待数据（缺集中度）";
    if ((meta.future_categories || []).indexOf(r.category) >= 0 || (r.risk_flags || []).indexOf("child") >= 0) return "观察池（2028 产品线）";
    var s = r.mos_score || 0;
    if (s >= meta.mos.tier_a) return "立项评审";
    if (s >= meta.mos.tier_b) return "观察池";
    return "C 档（暂不做）";
  }
  /* 返回计算结果，不修改传入的记录 */
  function score(r, meta) {
    var g = gates(r, meta.thresholds), m = mos(r, meta);
    var tmp = Object.assign({}, r, { gate_g1: g[0], gate_g2: g[1], gate_g3: g[2], mos_score: m.score, mos_breakdown: m.breakdown, mos_complete: m.complete, data_gaps: m.gaps });
    tmp.conclusion_suggested = suggest(tmp, meta);
    return { gate_g1: g[0], gate_g2: g[1], gate_g3: g[2], mos_score: m.score, mos_breakdown: m.breakdown, mos_complete: m.complete, data_gaps: m.gaps, conclusion_suggested: tmp.conclusion_suggested };
  }
  var api = { gates: gates, mos: mos, suggest: suggest, score: score };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.MeedenScoring = api;
})(typeof window !== "undefined" ? window : this);
