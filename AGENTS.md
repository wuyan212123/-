# AGENTS.md

本仓库用于 MEEDEN（美术用品品牌，亚马逊美国站为主）的选品工作。

## 当前任务：完善 MEEDEN 选品地图

开始前先完整阅读 **`docs/选品地图_执行手册.md`**。它规定了开品思路、地图结构、数据字段、逐步操作流程、结论决策表、质量检查清单和扫描队列。

关键规则：

1. 唯一数据源是 `selection_map/data/product_map.json`。不要手改 `MEEDEN选品地图.xlsx` 或 `MEEDEN选品地图_思维导图.html`。流程：`python3 selection_map/ingest.py`（导入工具导出、算指标与评分）→ `python3 selection_map/build.py`（生成）；改过脚本必须跑通 `python3 selection_map/tests/test_ingest.py`。
2. 分类结构必须挂在公司 2027 产品规划导图的框架上（大类 → 组 → 小类 → 形态），不要自创大类。
3. 每个「已有」必须有 MEEDEN 的 ASIN 证据；每个销量数字必须有对标单品和来源。查不到就填 `null` 并标「待查」，**绝不编造或推算数字**。
4. 已分配的编号（如 `C001`）永不修改、不复用。
5. 下一个要扫描的大类见手册第 10 节（当前：快消工具；艺术家具&收纳已按降级模式完成第 1–5 步）。
6. 交付前跑完手册第 8 节的质量检查清单，并更新手册第 11 节的进度。
7. V2 已生效（2026-11-02）。指标定义、评分规则和导出规范见 `docs/选品地图_V2优化方案.md`；没有工具导出数据时按手册第 6 节的「降级模式」执行。
8. 指标由脚本计算，不要手填 `seg_*`、`cr*`、`n_pass`、`gate_*`、`mos_*`、`conclusion_suggested` 等字段；脚本不会改人工结论 `conclusion`。
9. 团队在网页版「MEEDEN 产品地图」（https://claude.ai/artifact/CUpXen3UurqdVRNi6ejMbi ）里记录人工字段。开工前先拿网页最新导出的 JSON 跑 `python3 selection_map/sync_app_export.py 导出文件.json`，交付后把新的 `product_map.json` 导入网页；改同步脚本要跑通 `python3 selection_map/tests/test_sync.py`。分工见手册第 6.1 节。
10. 改 `scoring.py` 时必须同步改 `selection_map/app/scoring.js`，并跑 `python3 selection_map/app/check_scoring.py` 直到输出 ALL MATCH。
