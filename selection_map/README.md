# selection_map

MEEDEN 选品地图的数据和生成脚本。完整说明见 `docs/选品地图_执行手册.md`。

```bash
python3 selection_map/build.py      # 生成仓库根目录的 MEEDEN选品地图.xlsx 和 MEEDEN选品地图_思维导图.html
```

- `data/product_map.json`：唯一数据源（records / skeleton / extra_existing / trends / meta）
- `build.py`：读取 JSON，生成 Excel（openpyxl）和思维导图（填充模板）
- `mindmap_template.html`：思维导图模板，数据占位符 `__DATA__`、副标题占位符 `__SUBTITLE__`

生成 Excel 后需要重算一次公式（xlsx 技能的 `scripts/recalc.py`，或用 LibreOffice 打开另存），否则部分查看器里公式单元格显示为空。

依赖：Python 3、openpyxl。
