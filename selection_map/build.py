"""MEEDEN 选品地图构建脚本。

唯一数据源：selection_map/data/product_map.json
运行：python3 selection_map/build.py
产出（仓库根目录）：
  MEEDEN选品地图.xlsx        —— Excel 选品地图（全景图、机会清单、已有产品、趋势、流程、待扫描大类）
  MEEDEN选品地图_思维导图.html —— 可交互思维导图（发布为 Artifact 或直接浏览器打开）
生成 Excel 后请运行 xlsx 技能的 recalc.py（或用 LibreOffice 打开另存）以写入公式缓存值。
"""
import json, os, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.comments import Comment

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DB = json.load(open(os.path.join(HERE, "data", "product_map.json"), encoding="utf-8"))
META, RECS = DB["meta"], DB["records"]
OUT_XLSX = os.path.join(ROOT, "MEEDEN选品地图.xlsx")
OUT_HTML = os.path.join(ROOT, "MEEDEN选品地图_思维导图.html")

ORDER = META["category_order"]
RECS.sort(key=lambda r: (ORDER.index(r["category"]) if r["category"] in ORDER else 99, r["id"]))
SCANNED = [c for c in ORDER if any(r["category"] == c for r in RECS)]
PENDING = [c for c in ORDER if c not in SCANNED]

# ---------------- Excel ----------------
F = "Arial"
def font(**k): return Font(name=F, **k)
HDR = PatternFill("solid", fgColor="1F3864"); HFONT = font(bold=True, color="FFFFFF", size=10)
SUB = PatternFill("solid", fgColor="D9E1F2"); INPUT = PatternFill("solid", fgColor="FFFF00")
thin = Side(style="thin", color="BFBFBF"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top"); CEN = Alignment(horizontal="center", vertical="top", wrap_text=True)
LINK = dict(color="0563C1", underline="single")
def amz(a): return f"https://www.amazon.com/dp/{a}"
def header(ws, row, cols):
    for j, (h, w) in enumerate(cols, 1):
        c = ws.cell(row, j, h); c.font = HFONT; c.fill = HDR; c.alignment = CEN; c.border = BOX
        ws.column_dimensions[get_column_letter(j)].width = w
def cell(ws, r, c, v, center=False, **fk):
    x = ws.cell(r, c, v); x.font = font(size=9, **fk); x.alignment = CEN if center else WRAP; x.border = BOX; return x

wb = Workbook()
ws = wb.active; ws.title = "使用说明"
ws.column_dimensions["A"].width = 22; ws.column_dimensions["B"].width = 100
info = [
    ("MEEDEN 选品地图（%s）" % META["version"], None), ("更新日期", META["updated"]),
    ("用途", "长期使用的选品地图：把市场上每个小类的全部细分形态列出来，逐一标出 MEEDEN 美国站是否已有，找出「市场有、我们没有」的空白，再用销量门槛和风险筛出开品机会。"),
    ("已扫描大类", "、".join(SCANNED) + f"（共 {len(RECS)} 个细分形态）"),
    ("待扫描大类", "、".join(PENDING) if PENDING else "无"),
    ("", None), ("怎么用", None),
    ("1", "在「产品全景图」用筛选：状态=空白，门槛判断=达标 → 得到候选；结论列记录评审决定。"),
    ("2", "「机会清单」是筛出的优先方向，含组套协同和下一步，用于立项评审会。"),
    ("3", "数据只在 selection_map/data/product_map.json 维护，改完运行 build.py 重新生成本文件和思维导图。直接改 Excel 的内容会在下次生成时被覆盖。"),
    ("", None),
    ("门槛（可改）", "月销量 ≥ %s 单，或月销售额 ≥ $%s，满足其一即「达标」。阈值在「产品全景图」第 2 行黄色单元格。" % (f'{META["thresholds"]["monthly_units"]:,}', f'{META["thresholds"]["monthly_revenue_usd"]:,}')),
    ("", None), ("字段说明", None),
    ("MEEDEN 美国站状态", "已有 = 搜索能看到 MEEDEN 在售；部分覆盖 = 只覆盖该形态的一部分；规划中 = 导图里已排期；空白 = 没搜到 MEEDEN 产品；未核对 = 还没查。"),
    ("主要证据", "MEEDEN 在售产品的 ASIN，点击可打开亚马逊页面。"),
    ("头部月购买量", "对标头部单品在亚马逊显示的「bought in past month」标签下限（如 6K+ 记 6000），单位：单/月。"),
    ("估算月销售额", "头部月购买量 × 参考售价，只作数量级参考，自动计算。"),
    ("门槛判断", "自动计算：达标 / 未达标 / 待查（无销量数据）/ —（MEEDEN 已有且无对标数据）。"),
    ("结论", "立项评审 / 观察池 / 淘汰 / 老品升级 / 按导图推进 / 待查 / 待人工复核。"),
    ("", None),
    ("数据来源与局限", "MEEDEN 状态来自「MEEDEN + 关键词」的美国站搜索核对；销量来自亚马逊「bought in past month」标签下限，抓取日期不一。标「空白」的需前台复核，立项前用卖家精灵 / H10 复核销量。"),
]
for i, (k, v) in enumerate(info, 1):
    ws.cell(i, 1, k).font = font(bold=True, size=14 if i == 1 else 10); ws.cell(i, 1).alignment = WRAP
    if v is not None:
        c = ws.cell(i, 2, v); c.font = font(size=10); c.alignment = WRAP
for r in (7, 14): ws.cell(r, 1).fill = SUB
ws.sheet_view.showGridLines = False

ws = wb.create_sheet("产品全景图")
cols = [("编号", 7), ("大类", 9), ("组", 9), ("小类", 12), ("细分类型 / 形态", 24), ("规格维度", 20), ("英文核心词", 24), ("导图对应", 22),
        ("MEEDEN 美国站状态", 11), ("主要证据 ASIN", 13), ("其他证据", 30), ("头部对标单品", 28), ("头部月购买量（单/月，下限）", 12),
        ("参考售价（$）", 9), ("估算月销售额（$）", 12), ("门槛判断", 9), ("新增 / 上升信号", 18), ("风险 / 限制", 20), ("结论", 11),
        ("备注 / 下一步", 30), ("最近核对日期", 11)]
ws["A1"] = "MEEDEN 选品地图 · 产品全景图"; ws["A1"].font = font(bold=True, size=14)
ws["A2"] = "门槛："; ws["A2"].font = font(bold=True)
ws["B2"] = "月销量 ≥"; ws["D2"] = META["thresholds"]["monthly_units"]
ws["E2"] = "或 月销售额（$）≥"; ws["F2"] = META["thresholds"]["monthly_revenue_usd"]
for c in ("D2", "F2"): ws[c].fill = INPUT; ws[c].font = font(color="0000FF", bold=True); ws[c].number_format = "#,##0"
ws["G2"] = "← 黄色单元格可改，全表自动重算"; ws["G2"].font = font(italic=True, color="7F7F7F", size=9)
HR = 4; header(ws, HR, cols); ws.row_dimensions[HR].height = 42
r0 = HR + 1
for i, x in enumerate(RECS):
    r = r0 + i
    vals = [x["id"], x["category"], x["group"], x["subcategory"], x["form"], x["spec"], x["keyword_en"], x["framework_ref"], x["meeden_status"],
            x["evidence_asin"], x["evidence_other"], x["benchmark"], x["monthly_units"], x["price_usd"], None, None, x["trend_signal"],
            x["risk"], x["conclusion"], x["note"], x["checked_on"]]
    for j, v in enumerate(vals, 1): cell(ws, r, j, v, center=j in (1, 2, 9, 16, 19, 21))
    ws.cell(r, 15, f'=IF(AND(ISNUMBER(M{r}),ISNUMBER(N{r})),M{r}*N{r},"")')
    ws.cell(r, 16, f'=IF(NOT(ISNUMBER(M{r})),IF(OR(I{r}="已有",I{r}="部分覆盖"),"—","待查"),IF(OR(M{r}>=$D$2,AND(ISNUMBER(O{r}),O{r}>=$F$2)),"达标","未达标"))')
    ws.cell(r, 13).number_format = "#,##0"; ws.cell(r, 14).number_format = "$#,##0.00"; ws.cell(r, 15).number_format = "$#,##0"
    for j in (13, 14): ws.cell(r, j).font = font(size=9, color="0000FF")
    if x["evidence_asin"]: ws.cell(r, 10).hyperlink = amz(x["evidence_asin"]); ws.cell(r, 10).font = font(size=9, **LINK)
last = r0 + len(RECS) - 1
ws.freeze_panes = ws.cell(r0, 6); ws.auto_filter.ref = f"A{HR}:U{last}"
dv1 = DataValidation(type="list", formula1='"%s"' % ",".join(META["status_values"]), allow_blank=True); ws.add_data_validation(dv1); dv1.add(f"I{r0}:I{last+300}")
dv2 = DataValidation(type="list", formula1='"%s"' % ",".join(META["conclusion_values"]), allow_blank=True); ws.add_data_validation(dv2); dv2.add(f"S{r0}:S{last+300}")
def cf(col, text, color):
    ws.conditional_formatting.add(f"{col}{r0}:{col}{last+300}", FormulaRule(formula=[f'{col}{r0}="{text}"'], fill=PatternFill("solid", fgColor=color)))
for t, c in [("已有", "E2EFDA"), ("部分覆盖", "FFF2CC"), ("规划中", "DDEBF7"), ("空白", "FCE4D6"), ("未核对", "EDEDED")]: cf("I", t, c)
cf("P", "达标", "C6EFCE"); cf("P", "未达标", "F2F2F2")
for t, c in [("立项评审", "C6EFCE"), ("观察池", "FFF2CC"), ("淘汰", "EDEDED"), ("待人工复核", "FCE4D6")]: cf("S", t, c)
ws.cell(HR, 13).comment = Comment("亚马逊「bought in past month」标签下限。立项前用卖家精灵复核。", "MEEDEN")
sr = last + 2; ws.cell(sr, 4, "汇总").font = font(bold=True)
labels = [(s, "I") for s in META["status_values"]] + [("达标", "P"), ("立项评审", "S"), ("观察池", "S"), ("淘汰", "S")]
for k, (lab, col) in enumerate(labels):
    ws.cell(sr + 1 + k, 4, {"I": "状态", "P": "门槛", "S": "结论"}[col] + "：" + lab).font = font(size=9)
    ws.cell(sr + 1 + k, 5, f'=COUNTIF({col}{r0}:{col}{last},"{lab}")').font = font(size=9)
ws.cell(sr + 1 + len(labels), 4, "空白且达标").font = font(size=9, bold=True)
ws.cell(sr + 1 + len(labels), 5, f'=COUNTIFS(I{r0}:I{last},"空白",P{r0}:P{last},"达标")').font = font(size=9, bold=True)

ws2 = wb.create_sheet("机会清单")
ws2["A1"] = "机会清单"; ws2["A1"].font = font(bold=True, size=14)
ws2["A2"] = "从全景图筛出：空白或部分覆盖、且头部单品过门槛（A 档 = 立项评审，B 档 = 观察或待复核）。销量为亚马逊月购买量标签下限，立项前需复核。"
ws2["A2"].font = font(size=9, italic=True); ws2.merge_cells("A2:M2"); ws2["A2"].alignment = WRAP; ws2.row_dimensions[2].height = 28
header(ws2, 4, [("优先级", 7), ("编号", 7), ("大类", 9), ("方向", 24), ("对标头部单品", 28), ("头部月购买量", 11), ("参考售价（$）", 9),
                ("估算月销售额（$）", 12), ("与现有产品的组套协同", 34), ("风险 / 难点", 26), ("建议结论", 11), ("下一步", 32), ("状态", 9)])
opps = sorted([x for x in RECS if x["priority"]], key=lambda x: x["priority"])
for k, x in enumerate(opps):
    r = 5 + k
    vals = [x["priority"], x["id"], x["category"], x["form"], x["benchmark"], x["monthly_units"], x["price_usd"], None, x["synergy"], x["opp_risk"], x["conclusion"], x["next_step"], x["meeden_status"]]
    for j, v in enumerate(vals, 1): cell(ws2, r, j, v, center=j in (1, 2, 3, 11, 13))
    ws2.cell(r, 8, f'=IF(AND(ISNUMBER(F{r}),ISNUMBER(G{r})),F{r}*G{r},"")')
    ws2.cell(r, 6).number_format = "#,##0"; ws2.cell(r, 7).number_format = "$#,##0.00"; ws2.cell(r, 8).number_format = "$#,##0"
ws2.freeze_panes = "D5"

ws3 = wb.create_sheet("MEEDEN已有产品")
ws3["A1"] = "MEEDEN 美国站已有产品（搜索可见）"; ws3["A1"].font = font(bold=True, size=14)
header(ws3, 3, [("大类", 10), ("小类", 16), ("形态", 26), ("状态", 10), ("主要 ASIN", 14), ("其他证据", 44), ("导图对应", 26)])
k = 4
for x in RECS:
    if x["meeden_status"] in ("已有", "部分覆盖"):
        sub = x["group"] + ("·" + x["subcategory"] if x["subcategory"] else "")
        for j, v in enumerate([x["category"], sub, x["form"], x["meeden_status"], x["evidence_asin"], x["evidence_other"], x["framework_ref"]], 1): cell(ws3, k, j, v)
        if x["evidence_asin"]: ws3.cell(k, 5).hyperlink = amz(x["evidence_asin"]); ws3.cell(k, 5).font = font(size=9, **LINK)
        k += 1
k += 1; ws3.cell(k, 1, "扫描中顺带发现、属于待扫描大类的已有产品（扫描该大类时直接标已有）").font = font(bold=True); k += 1
for e in DB["extra_existing"]:
    for j, v in enumerate(["", e["area"], e["item"], "已有", e["asin"], "", ""], 1): cell(ws3, k, j, v)
    ws3.cell(k, 5).hyperlink = amz(e["asin"]); ws3.cell(k, 5).font = font(size=9, **LINK); k += 1

ws4 = wb.create_sheet("新增与趋势")
ws4["A1"] = "新增与上升类型"; ws4["A1"].font = font(bold=True, size=14)
header(ws4, 3, [("信号", 36), ("来源", 30), ("对应全景图", 22), ("对 MEEDEN 的含义", 44)])
for k, t in enumerate(DB["trends"]):
    r = 4 + k
    for j, v in enumerate([t["signal"], t["source"], t["maps_to"], t["implication"]], 1): cell(ws4, r, j, v)
    ws4.cell(r, 2).hyperlink = t["url"]; ws4.cell(r, 2).font = font(size=9, **LINK)

ws5 = wb.create_sheet("开品流程")
ws5["A1"] = "新品开品流程（7 步，每步一个闸门）"; ws5["A1"].font = font(bold=True, size=14)
header(ws5, 3, [("步骤", 6), ("做什么", 40), ("产出", 30), ("闸门：通过条件", 34), ("负责", 14), ("频率", 12)])
steps = [
    (1, "建品类全景图：按导图大类 → 小类 → 形态，以亚马逊类目和 Blick 分类为准全部罗列", "全景图", "每个小类的主流形态都已列出", "Codex/Claude + 产品部", "每季度复扫"),
    (2, "标自有状态：用「MEEDEN + 关键词」核对美国站，记 ASIN 证据", "状态列", "每行有状态和证据", "Codex/Claude；产品部前台复核空白项", "每季度"),
    (3, "标新增/上升类型：看新品榜、上升榜、社媒话题", "「新增与趋势」页", "新形态已加入全景图", "Codex/Claude", "每季度"),
    (4, "门槛初筛：空白位看头部单品月销量和销售额", "门槛判断列", "月销 ≥ 1500 单或月销售额 ≥ $4 万", "Codex/Claude", "每轮"),
    (5, "深挖打分：竞争、差评痛点、利润测算，按 100 分模型打分", "小类市场报告 + 评分", "≥ 75 分进入立项评审", "Codex/Claude；产品部提供工厂报价", "每轮"),
    (6, "立项：询价、打样、合规确认、利润测算、组套方案", "立项单", "净利 ≥ 17%、可做到评分 ≥ 4.3、合规无硬伤", "产品部 / 供应链 / 负责人", "评审会"),
    (7, "上市复盘：上市 3 个月看是否达标，结论回填全景图", "复盘记录", "达标 → 扩展 L2/L3；不达标 → 调整或下架", "运营 + 产品部", "上市后 3 个月"),
]
for k, row in enumerate(steps):
    for j, v in enumerate(row, 1): cell(ws5, 4 + k, j, v, center=j == 1)

ws6 = wb.create_sheet("待扫描大类")
ws6["A1"] = "待扫描大类（导图结构，按执行手册逐个补齐）"; ws6["A1"].font = font(bold=True, size=14)
header(ws6, 3, [("大类", 14), ("小类", 16), ("导图现状（L1 / L2 / L3）", 30), ("导图空位", 34), ("待纳入的市场形态（扫描时核对）", 50), ("状态", 10)])
k = 4
for s in DB["skeleton"]:
    if s["category"] in PENDING:
        for j, v in enumerate([s["category"], s["subcategory"], s["framework_now"], s["framework_gaps"], s["forms_to_check"], s["status"]], 1): cell(ws6, k, j, v)
        k += 1
wb.save(OUT_XLSX)

# ---------------- 思维导图 ----------------
def leaf(x):
    return {"n": x["form"], "st": x["meeden_status"], "id": x["id"], "spec": x["spec"], "kw": x["keyword_en"], "map": x["framework_ref"],
            "asin": x["evidence_asin"], "other": x["evidence_other"], "bench": x["benchmark"], "units": x["monthly_units"],
            "price": x["price_usd"], "new": x["trend_signal"], "risk": x["risk"], "concl": x["conclusion"], "note": x["note"],
            "pri": x["priority"] if x["conclusion"] == "立项评审" else ""}
tree = {"n": "MEEDEN 选品地图", "children": []}
for c in ORDER:
    rs = [x for x in RECS if x["category"] == c]
    if rs:
        cn = {"n": c, "children": []}; groups = {}
        for x in rs:
            g = groups.get(x["group"])
            if g is None: g = {"n": x["group"], "children": [], "_s": {}}; groups[x["group"]] = g; cn["children"].append(g)
            if x["subcategory"]:
                s = g["_s"].get(x["subcategory"])
                if s is None: s = {"n": x["subcategory"], "children": []}; g["_s"][x["subcategory"]] = s; g["children"].append(s)
                s["children"].append(leaf(x))
            else:
                g["children"].append(leaf(x))
        for g in groups.values(): g.pop("_s")
        tree["children"].append(cn)
    else:
        sk = [s for s in DB["skeleton"] if s["category"] == c]
        if sk:
            tree["children"].append({"n": c, "pending": True, "children": [
                {"n": s["subcategory"], "st": "待扫描", "now": s["framework_now"], "gap": s["framework_gaps"], "forms": s["forms_to_check"]} for s in sk]})
tpl = open(os.path.join(HERE, "mindmap_template.html"), encoding="utf-8").read()
subtitle = "按 2027 产品规划导图的结构展开 · 已扫描：%s · 待扫描：%s · 更新 %s" % ("、".join(SCANNED), "、".join(PENDING) or "无", META["updated"])
open(OUT_HTML, "w", encoding="utf-8").write(tpl.replace("__DATA__", json.dumps(tree, ensure_ascii=False)).replace("__SUBTITLE__", subtitle))
print(f"OK  records={len(RECS)}  scanned={SCANNED}  pending={PENDING}")
print(OUT_XLSX); print(OUT_HTML)
