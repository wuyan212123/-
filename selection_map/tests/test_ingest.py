"""用合成样例验证 ingest.py 与 scoring.py。在临时副本上运行，不改真实数据。
运行：python3 selection_map/tests/test_ingest.py
"""
import json, os, shutil, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
SM = os.path.dirname(HERE)
sys.path.insert(0, SM)
import ingest

tmp = tempfile.mkdtemp()
data = os.path.join(tmp, "product_map.json")
shutil.copy(os.path.join(SM, "data", "product_map.json"), data)
log = ingest.run(data, os.path.join(HERE, "fixtures"))
assert all(s == "OK" for s, _, _ in log), log
db = json.load(open(data, encoding="utf-8"))
r = next(x for x in db["records"] if x["id"] == "C071")

# 广告行被剔除；Top10 按销量：6000,2000,1600,900,700,300,150
assert r["seg_units_top10"] == 11650, r["seg_units_top10"]
assert r["n_pass"] == 4, r["n_pass"]                       # 6000、2000、1600 过 1500 单；Copic 150×$399 过 $4 万
assert abs(r["cr1"] - round((6000 + 900) / 11650, 3)) < 1e-9, r["cr1"]   # BrandA 两个单品
assert r["n_new_top50"] == 3, r["n_new_top50"]            # 2026-03、2026-06、2026-08 上架（12 个月内）
assert r["monthly_units"] == 6000 and r["price_usd"] == 19.99
assert r["confidence"] == "高" and r["data_source"].startswith("A:")
assert r["season_index"] == round(400 / ((130 * 11 + 400) / 12), 2), r["season_index"]
assert r["yoy_growth"] == round((130 * 11 + 400) / 1200 - 1, 3), r["yoy_growth"]
assert r["search_volume"] == 120000
assert "alcohol based markers" in r["keyword_cluster"]
assert any(x["asin"] == "B0TEST0005" and x["level"] for x in r["meeden_asins"])
assert r["own_units"] == 310 and r["own_share"] == round(310 / 11650, 3)
assert r["gate_g1"] == "过" and r["gate_g2"] == "过" and r["gate_g3"] == "过"
assert r["mos_complete"] and r["mos_score"] > 0
lst = {x["asin"]: x for x in db["meeden_asin_list"]}
assert lst["B0TEST0005"]["form_id"] == "C071"
assert lst["B0BGM5CNS2"]["form_id"] == "C001"              # V1 证据里的 ASIN 反向映射
assert lst["B0TESTZZZZ"]["form_id"] is None                # 挂不上地图 → 需要补形态
km = {x["keyword"]: x for x in db["keyword_map"]}
assert km["unmatched weird term"]["form_id"] is None
assert any(c.get("form_id") == "C071" for c in db["changelog"])
# 重复运行不重复导入
assert ingest.run(data, os.path.join(HERE, "fixtures")) == []
print("PASS", {k: r[k] for k in ("seg_revenue_top10", "n_pass", "cr1", "cr3", "price_p50", "mos_score", "conclusion_suggested")}, r["mos_breakdown"])
shutil.rmtree(tmp)
