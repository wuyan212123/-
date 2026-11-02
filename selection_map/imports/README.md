# imports

产品部导出的工具数据放在这里，按大类分子目录（如 `imports/耗材/`）。`ingest.py` 按文件名识别类型，导入过的文件记在 `product_map.json` 的 `imports_log` 里，不会重复导入。

| 文件名 | 内容 |
| --- | --- |
| `<形态编号>_<关键词>_<YYYYMMDD>.xlsx` | 该形态核心词搜索结果 Top 50（必需） |
| `KW_<小类>_<YYYYMMDD>.xlsx` | 关键词挖掘 |
| `TREND_<形态编号>_<YYYYMMDD>.xlsx` | 近 12–24 个月月度销量或搜索量（可选） |
| `NODES_<大类>_<YYYYMMDD>.xlsx` | 亚马逊末级类目清单 |
| `MEEDEN_ASIN_<YYYYMMDD>.xlsx` | MEEDEN SKU–ASIN 对照表（放在 `imports/` 根目录） |
| `MEEDEN_SALES_<YYYYMMDD>.xlsx` | MEEDEN 各 ASIN 近 3 个月月均销量（每个 ASIN 一行） |

要导哪些、用什么文件名，见 Excel 的「待导出清单」页。字段要求见 `docs/选品地图_V2优化方案.md` 第 5 节。导出文件本身就是证据，不要修改；列名对不上时改 `selection_map/config/columns.json`。
