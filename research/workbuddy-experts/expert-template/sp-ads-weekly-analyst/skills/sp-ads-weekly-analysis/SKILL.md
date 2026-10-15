---
name: sp-ads-weekly-analysis
description: 亚马逊 SP 广告周度分析脚本集。解析 Search Term / Targeting Report（csv/xlsx），完成清洗、周环比对比、标签、六类优化建议、Excel 导出和周报生成。当需要计算任何 SP 广告指标或生成广告周报时必须使用本技能，不要手算。
---

# SP 广告周度分析技能

## 准备
把《SP广告周度分析助手》的 `core/` 目录整体复制到本技能的 `scripts/core/`，依赖见 `scripts/requirements.txt`（pandas、openpyxl）。

## 调用
```bash
python scripts/run_weekly.py \
  --inputs <本周报表> <上周报表> [更早的报表...] \
  --asin <ASIN> --marketplace US \
  --target-acos 0.30 [--new-product] [--brand-words mybrand,另一个品牌词] \
  --out deliverables/sp-ads/
```

输出：`<ASIN>-<结束日>-actions.xlsx`、`<ASIN>-<结束日>-weekly-report.md`，以及在 stdout 打印的 JSON 摘要（总览指标、各类动作数量、缺失字段）。

## TODO（上架前完成）
- 参考原项目 `scripts/e2e_test.py` 把 Streamlit 依赖去掉，封装出 `run_weekly.py` 命令行入口。e2e_test 已经跑通“清洗 → 存储 → 对比 → 打标签 → 建议 → 导出 → 周报”全流程。
- 数据库改用临时 SQLite（每次会话一份），避免在用户机器上留下历史数据。
- 字段映射表（`core/field_mapping.py`）的中英文表头说明放到 `references/field-mapping.md`。
