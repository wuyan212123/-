"""验证 sync_app_export.py：网页导出合并回 product_map.json。在临时副本上运行，不改真实数据。
运行：python3 selection_map/tests/test_sync.py
"""
import copy, json, os, shutil, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
SM = os.path.dirname(HERE)
sys.path.insert(0, SM)
import sync_app_export as S

tmp = tempfile.mkdtemp()
data = os.path.join(tmp, "product_map.json")
shutil.copy(os.path.join(SM, "data", "product_map.json"), data)
orig = json.load(open(data, encoding="utf-8"))
recs = copy.deepcopy(orig["records"])
by = {r["id"]: r for r in recs}
by["C001"]["note"] = "网页改的备注"
by["C001"]["seg_units_top10"] = 999999                 # 计算字段：不应被网页覆盖
by["C002"]["archived"] = True
for r in recs:                                          # 网页默认值：archived=false、空串 → 不算改动
    r.setdefault("archived", False)
    if r.get("evidence_ref") is None: r["evidence_ref"] = ""
by["C006"]["meeden_status"] = "已有"                    # 没有 ASIN → 拒绝
by["C006"]["evidence_asin"] = ""; by["C006"]["meeden_asins"] = []
new = copy.deepcopy(by["C010"]); new.update(id="C120", form="测试新形态", note="", created_at="x", updated_by="u_x")
bad = copy.deepcopy(new); bad.update(id="E001", form="前缀不对")      # 耗材却用 E 前缀
recs = [r for r in recs if r["id"] != "C119"] + [new, bad]           # 导出缺 C119 → 只提示
exp = os.path.join(tmp, "export.json")
json.dump({"meta": {"exported_from": "MEEDEN 产品地图（网页）", "exported_at": "2026-11-02T08:00:00Z",
                    "manual_fields": S.DEFAULT_MANUAL + ["seg_units_top10"]}, "records": recs}, open(exp, "w", encoding="utf-8"), ensure_ascii=False)

rep = S.sync(exp, data)
db = json.load(open(data, encoding="utf-8"))
m = {r["id"]: r for r in db["records"]}
assert m["C001"]["note"] == "网页改的备注"
assert m["C001"]["seg_units_top10"] == orig["records"][0]["seg_units_top10"]
assert m["C002"]["archived"] is True
assert m["C006"]["meeden_status"] != "已有" and any(i == "C006" for i, _ in rep["rejected"])
assert "C120" in m and "created_at" not in m["C120"] and "updated_by" not in m["C120"]
assert m["C120"]["conclusion_suggested"] and m["C120"]["gate_g3"]
assert "E001" not in m and any(i == "E001" for i, _ in rep["rejected"])
assert rep["missing_in_export"] == ["C119"] and "C119" in m
assert sorted(i for i, _ in rep["updated"]) == ["C001", "C002"], rep["updated"]
assert rep["added"] == ["C120"]
assert any(c.get("type") == "网页新增" and c["form_id"] == "C120" for c in db["changelog"])
assert db["imports_log"][-1]["file"] == "export.json"
# 再合并一次：没有变化，也不能把 C120 当新编号再加
rep2 = S.sync(exp, data)
assert not rep2["updated"] and not rep2["added"], rep2
shutil.rmtree(tmp)
print("test_sync OK")
