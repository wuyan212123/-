"""MEEDEN 选品地图构建脚本（V2）。

唯一数据源：selection_map/data/product_map.json
流程：python3 selection_map/ingest.py   # 导入工具导出、计算指标、闸门、评分（没有新文件时只重算评分）
      python3 selection_map/build.py    # 生成 Excel 和思维导图
产出（仓库根目录）：
  MEEDEN选品地图.xlsx         —— Excel 选品地图
  MEEDEN选品地图_思维导图.html —— 可交互思维导图
生成 Excel 后请运行 xlsx 技能的 recalc.py（或用 LibreOffice 打开另存）以写入公式缓存值。
"""
import json, os, re, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.comments import Comment

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import scoring

import argparse
_ap = argparse.ArgumentParser()
_ap.add_argument("--data", default=os.path.join(HERE, "data", "product_map.json"))
_ap.add_argument("--out-dir", default=ROOT)
_args = _ap.parse_args()
DB = json.load(open(_args.data, encoding="utf-8"))
scoring.score_all(DB)
META = DB["meta"]
# 已归档的形态（网页里「归档」）保留在 JSON 里、编号不复用，但不进 Excel 和思维导图
RECS = [r for r in DB["records"] if not r.get("archived")]
TH = META["thresholds"]
OUT_XLSX = os.path.join(_args.out_dir, "MEEDEN选品地图.xlsx")
OUT_HTML = os.path.join(_args.out_dir, "MEEDEN选品地图_思维导图.html")
ORDER = META["category_order"]
RECS.sort(key=lambda r: (ORDER.index(r["category"]) if r["category"] in ORDER else 99, r["id"]))
SCANNED = [c for c in ORDER if any(r["category"] == c for r in RECS)]
PENDING = [c for c in ORDER if c not in SCANNED]
FLAG_CN = {"hazmat": "危险品", "lithium": "锂电池", "child": "儿童合规", "prop65": "Prop 65", "patent": "专利", "brand_ip": "品牌词",
           "oversize": "超大件", "fragile": "易碎", "liquid": "液体"}

# ---------------- 样式 ----------------
F = "Arial"
def font(**k): return Font(name=F, **k)
HDR = PatternFill("solid", fgColor="1F3864"); HFONT = font(bold=True, color="FFFFFF", size=10)
SUB = PatternFill("solid", fgColor="D9E1F2"); INPUT = PatternFill("solid", fgColor="FFFF00")
thin = Side(style="thin", color="BFBFBF"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top"); CEN = Alignment(horizontal="center", vertical="top", wrap_text=True)
LINK = dict(color="0563C1", underline="single")
def amz(a): return f"https://www.amazon.com/dp/{a}"
def header(ws, row, cols, height=40):
    for j, (h, w) in enumerate(cols, 1):
        c = ws.cell(row, j, h); c.font = HFONT; c.fill = HDR; c.alignment = CEN; c.border = BOX
        ws.column_dimensions[CL(j)].width = w
    ws.row_dimensions[row].height = height
def cell(ws, r, c, v, center=False, **fk):
    x = ws.cell(r, c, v); x.font = font(size=9, **fk); x.alignment = CEN if center else WRAP; x.border = BOX; return x
def link(ws, r, c, url):
    ws.cell(r, c).hyperlink = url; ws.cell(r, c).font = font(size=9, **LINK)
def title(ws, text, sub=None):
    ws["A1"] = text; ws["A1"].font = font(bold=True, size=14)
    if sub:
        ws["A2"] = sub; ws["A2"].font = font(size=9, italic=True, color="595959")
def sub_name(r): return r["group"] + ("·" + r["subcategory"] if r["subcategory"] else "")
def first_kw(r): return r["keyword_en"].split("/")[0].strip()
def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def lv_text(r):
    lv = r.get("levels") or {}
    if all((lv.get(k) or {}).get("seg_units") is None for k in ("L1", "L2", "L3")):
        return "待导出"
    out = []
    for k in ("L1", "L2", "L3"):
        L = lv.get(k) or {}
        if not L.get("seg_units"): out.append(f"{k}:无市场")
        else: out.append(f"{k}:{'✓' if L.get('meeden_asins') else '空'}")
    return " ".join(out)
def flags_text(r): return "、".join(FLAG_CN.get(f, f) for f in r.get("risk_flags") or [])

wb = Workbook()

# ============ 使用说明 ============
ws = wb.active; ws.title = "使用说明"
ws.column_dimensions["A"].width = 22; ws.column_dimensions["B"].width = 104
info = [
    (f"MEEDEN 选品地图（{META['version']}）", None), ("更新日期", META["updated"]),
    ("用途", "长期使用的选品地图：按公司 2027 产品规划导图的框架，列出每个小类的全部细分形态；标出 MEEDEN 美国站覆盖到哪一级（L1/L2/L3）；用细分市场指标、三道闸和机会评分筛出开品机会。"),
    ("已扫描大类", "、".join(SCANNED) + f"（共 {len(RECS)} 个细分形态）"),
    ("待扫描大类", "、".join(PENDING) if PENDING else "无"),
    ("", None), ("更新流程", None),
    ("1 导出", "产品部按「待导出清单」页导出工具数据，按建议文件名放进 selection_map/imports/<大类>/。"),
    ("2 导入", "python3 selection_map/ingest.py —— 解析导出文件，计算细分市场指标、三道闸、机会评分和建议结论，写回 product_map.json。"),
    ("3 生成", "python3 selection_map/build.py —— 生成本文件和思维导图。数据只在 product_map.json 维护，直接改本文件会在下次生成时被覆盖。"),
    ("", None), ("判断规则", None),
    ("三道闸", f"G1 需求：Top 50 中至少 {TH['g1_min_pass']} 个单品月销 ≥ {TH['pass_units']:,} 或月销售额 ≥ ${TH['pass_revenue_usd']:,}；G2 健康：第一品牌份额 ≤ {TH['g2_cr1_max']:.0%} 且同比不低于 {TH['g2_yoy_min']:.0%}；G3 硬伤：非危险品。"),
    ("机会评分（MOS）", "满分 100：需求规模 25、可进入性 20、增长 10、经济性 15、战略契合 20，再减风险扣分。≥ 70 为 A 档（立项评审），55–69 为 B 档（观察池）。评分由 scoring.py 计算，Excel 里是结果值。"),
    ("建议结论 vs 结论", "「建议结论」由脚本按规则给出；「结论」是人工评审后的决定，两者可以不同。"),
    ("V1 单品门槛", "保留 V1 口径（只看一个头部单品）作参考，方便和 V2 对比。"),
    ("", None), ("数据可信度", None),
    ("高", "A 级来源：卖家精灵 / Helium 10 / Jungle Scout 导出、领星。进入 A 档机会必须是高可信度。"),
    ("中", "B/C 级来源：亚马逊前台页面、搜索引擎收录的页面（V1 数据属于这一级）。"),
    ("低", "数据归属不清或页面过旧。"),
    ("", None),
    ("黄色单元格", "「产品全景图」第 2 行的门槛可改，G1/G2 和 V1 单品门槛列会自动重算；机会评分和建议结论按 product_map.json 里的阈值计算，改阈值请改 JSON 后重新运行 ingest.py。"),
]
for i, (k, v) in enumerate(info, 1):
    ws.cell(i, 1, k).font = font(bold=True, size=14 if i == 1 else 10); ws.cell(i, 1).alignment = WRAP
    if v is not None:
        c = ws.cell(i, 2, v); c.font = font(size=10); c.alignment = WRAP
for r in (7, 12, 18): ws.cell(r, 1).fill = SUB
ws.sheet_view.showGridLines = False

# ============ 产品全景图 ============
ws = wb.create_sheet("产品全景图")
cols = [("编号", 7), ("大类", 8), ("组", 8), ("小类", 11), ("细分类型 / 形态", 22), ("规格维度", 18), ("英文核心词", 20), ("导图对应", 18), ("场景", 10),
        ("MEEDEN 状态", 9), ("MEEDEN ASIN 数", 8), ("主要 ASIN", 12), ("级别覆盖（L1/L2/L3）", 16),
        ("头部单品", 24), ("头部月销（单，下限）", 10), ("头部售价（$）", 8), ("头部月销售额（$）", 11), ("V1 单品门槛", 9),
        ("Top10 月销售额（$）", 12), ("达标单品数", 8), ("第一品牌份额", 8), ("前三品牌份额", 8), ("Top10 评论中位数", 9), ("近 12 月新品数", 8),
        ("价格 P50（$）", 8), ("同比增长", 8), ("季节指数", 7), ("风险标识", 12), ("G1 需求", 7), ("G2 健康", 7), ("G3 硬伤", 7),
        ("机会评分", 7), ("建议结论", 14), ("结论（人工）", 11), ("可信度", 7), ("数据来源", 18), ("数据日期", 10), ("备注 / 下一步", 28), ("核对日期", 10)]
title(ws, "MEEDEN 选品地图 · 产品全景图")
row2 = [("A2", "门槛："), ("B2", "单品月销 ≥"), ("C2", TH["pass_units"]), ("D2", "或月销售额（$）≥"), ("E2", TH["pass_revenue_usd"]),
        ("F2", "G1 达标单品数 ≥"), ("G2", TH["g1_min_pass"]), ("H2", "G2 第一品牌份额 ≤"), ("I2", TH["g2_cr1_max"]), ("J2", "G2 同比 ≥"), ("K2", TH["g2_yoy_min"])]
for ref, v in row2:
    ws[ref] = v; ws[ref].font = font(bold=ref == "A2", size=9)
for ref, fmt in (("C2", "#,##0"), ("E2", "#,##0"), ("G2", "0"), ("I2", "0%"), ("K2", "0%")):
    ws[ref].fill = INPUT; ws[ref].font = font(color="0000FF", bold=True, size=9); ws[ref].number_format = fmt
HR = 4; header(ws, HR, cols, 48)
r0 = HR + 1
for i, x in enumerate(RECS):
    r = r0 + i
    asins = x.get("meeden_asins") or []
    vals = [x["id"], x["category"], x["group"], x["subcategory"], x["form"], x["spec"], x["keyword_en"], x["framework_ref"], "、".join(x.get("scene") or []),
            x["meeden_status"], len(asins) or None, x["evidence_asin"] or (asins[0]["asin"] if asins else None), lv_text(x),
            x["benchmark"], x["monthly_units"], x["price_usd"], None, None,
            x.get("seg_revenue_top10"), x.get("n_pass"), x.get("cr1"), x.get("cr3"), x.get("reviews_median_top10"), x.get("n_new_top50"),
            x.get("price_p50"), x.get("yoy_growth"), x.get("season_index"), flags_text(x), None, None, x.get("gate_g3"),
            x.get("mos_score") if x.get("mos_complete") else None, x.get("conclusion_suggested"), x["conclusion"],
            x.get("confidence"), x.get("data_source"), x.get("as_of"), x["note"], x["checked_on"]]
    for j, v in enumerate(vals, 1): cell(ws, r, j, v, center=j in (1, 2, 10, 11, 18, 20, 24, 29, 30, 31, 32, 35))
    ws.cell(r, 17, f'=IF(AND(ISNUMBER(O{r}),ISNUMBER(P{r})),O{r}*P{r},"")')
    ws.cell(r, 18, f'=IF(NOT(ISNUMBER(O{r})),IF(OR(J{r}="已有",J{r}="部分覆盖"),"—","待查"),IF(OR(O{r}>=$C$2,AND(ISNUMBER(Q{r}),Q{r}>=$E$2)),"达标","未达标"))')
    ws.cell(r, 29, f'=IF(ISNUMBER(T{r}),IF(T{r}>=$G$2,"过","不过"),"待数据")')
    ws.cell(r, 30, f'=IF(ISNUMBER(U{r}),IF(AND(U{r}<=$I$2,OR(NOT(ISNUMBER(Z{r})),Z{r}>=$K$2)),"过","不过"),"待数据")')
    for j in (17, 18, 29, 30): ws.cell(r, j).font = font(size=9); ws.cell(r, j).border = BOX; ws.cell(r, j).alignment = CEN
    for j, fmt in ((15, "#,##0"), (16, "$#,##0.00"), (17, "$#,##0"), (19, "$#,##0"), (21, "0%"), (22, "0%"), (23, "#,##0"), (25, "$#,##0.00"), (26, "0%"), (27, "0.0")):
        ws.cell(r, j).number_format = fmt
    if vals[11]: link(ws, r, 12, amz(vals[11]))
last = r0 + len(RECS) - 1
ws.freeze_panes = ws.cell(r0, 6); ws.auto_filter.ref = f"A{HR}:{CL(len(cols))}{last}"
dv1 = DataValidation(type="list", formula1='"%s"' % ",".join(META["status_values"]), allow_blank=True); ws.add_data_validation(dv1); dv1.add(f"J{r0}:J{last+300}")
dv2 = DataValidation(type="list", formula1='"%s"' % ",".join(META["conclusion_values"]), allow_blank=True); ws.add_data_validation(dv2); dv2.add(f"AH{r0}:AH{last+300}")
def cf(rng, first, text, color, op="="):
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'{first}{op}"{text}"'], fill=PatternFill("solid", fgColor=color)))
def cfs(col, text, color): cf(f"{col}{r0}:{col}{last+300}", f"{col}{r0}", text, color)
for t, c in [("已有", "E2EFDA"), ("部分覆盖", "FFF2CC"), ("规划中", "DDEBF7"), ("空白", "FCE4D6"), ("未核对", "EDEDED")]: cfs("J", t, c)
for col in ("AC", "AD", "AE"): cfs(col, "过", "C6EFCE"); cfs(col, "不过", "FFC7CE")
for t, c in [("立项评审", "C6EFCE"), ("观察池", "FFF2CC"), ("淘汰", "EDEDED"), ("待人工复核", "FCE4D6")]: cfs("AH", t, c)
for t, c in [("高", "C6EFCE"), ("中", "FFF2CC"), ("低", "FFC7CE")]: cfs("AI", t, c)
ws.conditional_formatting.add(f"AG{r0}:AG{last+300}", FormulaRule(formula=[f'LEFT(AG{r0},4)="立项评审"'], fill=PatternFill("solid", fgColor="C6EFCE")))
ws.conditional_formatting.add(f"AG{r0}:AG{last+300}", FormulaRule(formula=[f'LEFT(AG{r0},3)="待数据"'], fill=PatternFill("solid", fgColor="EDEDED")))
ws.cell(HR, 15).comment = Comment("Top 1 单品月销。V1 数据为亚马逊「bought in past month」标签下限；导入工具数据后为工具估算值。", "MEEDEN")
ws.cell(HR, 32).comment = Comment("由 scoring.py 计算；只有细分市场销售额和达标单品数都有数据时才显示。", "MEEDEN")
sr = last + 2; ws.cell(sr, 4, "汇总").font = font(bold=True)
labels = [(s, "J") for s in META["status_values"]] + [("过", "AC"), ("过", "AD"), ("高", "AI"), ("立项评审", "AH"), ("观察池", "AH"), ("淘汰", "AH")]
names = {"J": "状态", "AC": "G1", "AD": "G2", "AI": "可信度", "AH": "结论"}
for k, (lab, col) in enumerate(labels):
    ws.cell(sr + 1 + k, 4, f"{names[col]}：{lab}").font = font(size=9)
    ws.cell(sr + 1 + k, 5, f'=COUNTIF({col}{r0}:{col}{last},"{lab}")').font = font(size=9)

# ============ 分级覆盖矩阵 ============
ws = wb.create_sheet("分级覆盖矩阵")
title(ws, "分级覆盖矩阵", "每个形态按 L1 入门 / L2 进阶 / L3 专业拆开：市场价格区间、档内 Top50 月销合计、档内头部、MEEDEN 在该档的 ASIN。导入工具数据后自动填充。")
cm = [("编号", 7), ("大类", 8), ("小类", 14), ("形态", 22), ("MEEDEN 状态", 9), ("分档方法", 12)]
for lv in ("L1", "L2", "L3"):
    cm += [(f"{lv} 价格区间", 12), (f"{lv} 档内月销", 9), (f"{lv} 档内头部", 18), (f"{lv} MEEDEN", 14)]
cm += [("空档提示", 18)]
header(ws, 4, cm, 40)
for i, x in enumerate(RECS):
    r = 5 + i; lv = x.get("levels") or {}
    cut = x.get("level_cut") or {}
    vals = [x["id"], x["category"], sub_name(x), x["form"], x["meeden_status"], cut.get("method") or ("锚定" if x.get("level_anchors") else "待导出")]
    gaps = []
    for k in ("L1", "L2", "L3"):
        L = lv.get(k) or {}
        pr = L.get("price_range"); top = L.get("top1")
        vals += [f"${pr[0]:g}–${pr[1]:g}" if pr else None, L.get("seg_units"),
                 f"{top.get('brand') or ''} {top.get('units'):,}" if top else None, "、".join(L.get("meeden_asins") or []) or (L.get("framework_hint") and "导图：" + L["framework_hint"]) or None]
        if (L.get("seg_units") or 0) > 0 and not L.get("meeden_asins"): gaps.append(k)
    vals.append(("MEEDEN 缺 " + "、".join(gaps)) if gaps else None)
    for j, v in enumerate(vals, 1): cell(ws, r, j, v, center=j in (1, 5))
    for j in (8, 12, 16): ws.cell(r, j).number_format = "#,##0"
ws.freeze_panes = "E5"; ws.auto_filter.ref = f"A4:{CL(len(cm))}{4 + len(RECS)}"

# ============ 机会清单 ============
ws = wb.create_sheet("机会清单")
title(ws, "机会清单", "第一部分：人工确认的 A/B 档机会；第二部分：脚本按 V2 规则建议、尚未人工确认的机会。数据可信度为「高」之前，不建议进入立项。")
co = [("优先级", 7), ("编号", 7), ("大类", 8), ("方向", 22), ("头部单品", 24), ("头部月销", 9), ("Top10 月销售额（$）", 12), ("达标单品数", 8),
      ("第一品牌份额", 8), ("机会评分", 7), ("建议结论", 14), ("可信度", 7), ("组套协同", 30), ("风险 / 难点", 24), ("下一步", 30)]
header(ws, 4, co)
def opp_row(r, x, pri):
    vals = [pri, x["id"], x["category"], x["form"], x["benchmark"], x["monthly_units"], x.get("seg_revenue_top10"), x.get("n_pass"), x.get("cr1"),
            x.get("mos_score") if x.get("mos_complete") else None, x.get("conclusion_suggested"), x.get("confidence"), x.get("synergy"), x.get("opp_risk"), x.get("next_step")]
    for j, v in enumerate(vals, 1): cell(ws, r, j, v, center=j in (1, 2, 3, 8, 9, 10, 12))
    ws.cell(r, 6).number_format = "#,##0"; ws.cell(r, 7).number_format = "$#,##0"; ws.cell(r, 9).number_format = "0%"
row = 5
for x in sorted([x for x in RECS if x.get("priority")], key=lambda x: x["priority"]):
    opp_row(row, x, x["priority"]); row += 1
row += 1; ws.cell(row, 1, "脚本建议（未人工确认）").font = font(bold=True); row += 1
for x in sorted([x for x in RECS if not x.get("priority") and (x.get("conclusion_suggested") or "").startswith(("立项评审", "按导图推进（建议提前）", "待数据（V1 单品达标）"))],
                key=lambda x: (-(x.get("mos_score") or 0), x["id"])):
    opp_row(row, x, "建议"); row += 1
ws.freeze_panes = "E5"

# ============ 待导出清单 ============
ws = wb.create_sheet("待导出清单")
title(ws, "待导出清单（给产品部）", "按顺序导出，文件放进 selection_map/imports/<大类>/，文件名里的 YYYYMMDD 换成导出日期。导出规范见 docs/选品地图_V2优化方案.md 第 5 节。")
header(ws, 4, [("顺序", 6), ("类型", 14), ("编号", 7), ("大类", 9), ("形态 / 范围", 24), ("导出关键词", 30), ("建议文件名", 40), ("目录", 22), ("当前状态", 12)])
todo = []
if not DB["meeden_asin_list"]:
    todo.append((0, "", "MEEDEN 全量 ASIN", "", "全部", "SKU–ASIN 对照表（ERP / 领星）", "", "MEEDEN_ASIN_YYYYMMDD.xlsx", "imports/", "待导出"))
todo.append((0, "", "MEEDEN 自有销量", "", "全部", "各 ASIN 近 3 个月月均销量、退货率、评分", "", "MEEDEN_SALES_YYYYMMDD.xlsx", "imports/", "待导出"))
def rank(x):
    s = x.get("conclusion_suggested") or ""
    if x.get("priority"): return 1
    if x["meeden_status"] == "已有": return 6
    if "V1 单品达标" in s: return 2
    if "V1 单品接近" in s or x["meeden_status"] == "规划中": return 3
    if s == "待数据": return 4
    return 5
for x in RECS:
    if (x.get("conclusion_suggested") or "").startswith("淘汰（硬伤）"): continue
    kw = first_kw(x)
    todo.append((rank(x), x.get("priority") or "Z", "形态 Top 50", x["id"], x["category"], x["form"], kw, f"{x['id']}_{slug(kw)}_YYYYMMDD.xlsx", f"imports/{x['category']}/",
                 "已导入 " + (x.get("as_of") or "") if x.get("confidence") == "高" else "待导出"))
subs = {}
for x in RECS: subs.setdefault((x["category"], sub_name(x)), []).append(first_kw(x))
for (cat, sn), kws in subs.items():
    seen = []
    for k in kws:
        if k not in seen: seen.append(k)
    todo.append((7, "", "关键词挖掘", "", cat, sn, " / ".join(seen[:5]), f"KW_{sn.split('·')[-1].replace('/', '-')}_YYYYMMDD.xlsx", f"imports/{cat}/",
                 "已导入" if any(k.get("subcategory") == sn.split('·')[-1].replace('/', '-') for k in DB["keyword_map"]) else "待导出"))
for cat in SCANNED:
    todo.append((8, "", "类目节点清单", "", cat, "亚马逊相关根类目下全部末级类目", "", f"NODES_{cat}_YYYYMMDD.xlsx", f"imports/{cat}/", "待导出" if not DB["browse_node_map"] else "已导入"))
todo.sort(key=lambda t: (t[0], t[1], t[3]))
for i, t in enumerate(todo):
    vals = [i + 1] + list(t[2:])
    for j, v in enumerate(vals, 1): cell(ws, 5 + i, j, v, center=j in (1, 3, 9))
ws.conditional_formatting.add(f"I5:I{5 + len(todo)}", FormulaRule(formula=['LEFT(I5,3)="已导入"'], fill=PatternFill("solid", fgColor="C6EFCE")))
ws.freeze_panes = "A5"; ws.auto_filter.ref = f"A4:I{4 + len(todo)}"

# ============ 老品升级清单 ============
ws = wb.create_sheet("老品升级清单")
title(ws, "老品升级清单", "MEEDEN 已有的形态，按「细分市场规模 × (1 − MEEDEN 份额)」排序：市场大、份额低的优先升级。缺数据的排在后面。")
header(ws, 4, [("编号", 7), ("大类", 8), ("小类", 14), ("形态", 22), ("主要 ASIN", 12), ("头部对标", 26), ("Top10 月销售额（$）", 12), ("MEEDEN 月销", 9),
               ("MEEDEN 份额", 8), ("MEEDEN 评分", 7), ("退货率", 7), ("升级空间指数", 10), ("备注", 30)])
ex = [x for x in RECS if x["meeden_status"] in ("已有", "部分覆盖")]
def room(x):
    rev, sh = x.get("seg_revenue_top10"), x.get("own_share")
    return rev * (1 - sh) if isinstance(rev, (int, float)) and isinstance(sh, (int, float)) else None
ex.sort(key=lambda x: (room(x) is None, -(room(x) or 0), x["id"]))
for i, x in enumerate(ex):
    r = 5 + i
    vals = [x["id"], x["category"], sub_name(x), x["form"], x["evidence_asin"] or None, x["benchmark"], x.get("seg_revenue_top10"), x.get("own_units"),
            x.get("own_share"), x.get("own_rating"), x.get("own_return_rate"), None, x["note"]]
    for j, v in enumerate(vals, 1): cell(ws, r, j, v, center=j in (1, 2, 9, 10, 11))
    ws.cell(r, 12, f'=IF(AND(ISNUMBER(G{r}),ISNUMBER(I{r})),G{r}*(1-I{r}),"")')
    for j, fmt in ((7, "$#,##0"), (8, "#,##0"), (9, "0%"), (12, "$#,##0")): ws.cell(r, j).number_format = fmt
    ws.cell(r, 12).font = font(size=9); ws.cell(r, 12).border = BOX
    if x["evidence_asin"]: link(ws, r, 5, amz(x["evidence_asin"]))
ws.freeze_panes = "E5"

# ============ MEEDEN ASIN 清单 ============
ws = wb.create_sheet("MEEDEN ASIN 清单")
title(ws, "MEEDEN ASIN 清单与映射", "每个 MEEDEN ASIN 都必须挂到地图里的某个形态上；「未挂到形态」的说明地图漏了形态，或属于其他大类。")
header(ws, 4, [("ASIN", 13), ("内部 SKU", 12), ("标题", 30), ("在售状态", 10), ("挂到形态", 9), ("形态", 22), ("级别", 6), ("来源", 18)])
form_of = {x["id"]: x for x in RECS}
rows = {}
for x in RECS:
    for a in x.get("meeden_asins") or []:
        rows[a["asin"]] = {"asin": a["asin"], "sku": None, "title": None, "status": a.get("status"), "form_id": x["id"], "level": a.get("level"), "src": "地图证据 / 导出"}
for a in DB["meeden_asin_list"]:
    r_ = rows.setdefault(a["asin"], {"asin": a["asin"], "level": None, "src": ""})
    r_.update({"sku": a.get("sku"), "title": a.get("title"), "status": a.get("status") or r_.get("status"), "form_id": a.get("form_id") or r_.get("form_id")})
    r_["src"] = (r_["src"] + "；" if r_["src"] else "") + "SKU–ASIN 对照表"
for e in DB.get("extra_existing", []):
    rows.setdefault(e["asin"], {"asin": e["asin"], "sku": None, "title": e["item"], "status": "已有", "form_id": None, "level": None, "src": f"顺带发现（{e['area']}）", "other_cat": True})
for i, a in enumerate(sorted(rows.values(), key=lambda a: (a.get("form_id") is not None, bool(a.get("other_cat")), a.get("form_id") or "", a["asin"]))):
    r = 5 + i; fx = form_of.get(a.get("form_id"))
    vals = [a["asin"], a.get("sku"), a.get("title"), a.get("status"), a.get("form_id") or ("其他大类待扫描" if a.get("other_cat") else "未挂到形态"), fx["form"] if fx else None, a.get("level"), a.get("src")]
    for j, v in enumerate(vals, 1): cell(ws, r, j, v, center=j in (4, 5, 7))
    link(ws, r, 1, amz(a["asin"]))
ws.conditional_formatting.add(f"E5:E{5 + len(rows)}", FormulaRule(formula=['E5="未挂到形态"'], fill=PatternFill("solid", fgColor="FCE4D6")))
ws.freeze_panes = "B5"

# ============ 关键词归类表 ============
ws = wb.create_sheet("关键词归类表")
title(ws, "关键词归类表", "关键词挖掘导出后自动归类；没归上的词逐个看，可能是漏掉的形态。完成标准：每个小类已归类搜索量 / 总搜索量 ≥ 95%。")
header(ws, 4, [("小类", 16), ("关键词", 30), ("月搜索量", 10), ("归到形态", 9), ("形态", 22), ("数据日期", 10)])
km = sorted(DB["keyword_map"], key=lambda k: (k.get("subcategory") or "", -(k.get("volume") or 0)))
for i, k in enumerate(km):
    r = 5 + i; fx = form_of.get(k.get("form_id"))
    for j, v in enumerate([k.get("subcategory"), k["keyword"], k.get("volume"), k.get("form_id"), fx["form"] if fx else None, k.get("as_of")], 1): cell(ws, r, j, v, center=j == 4)
    ws.cell(r, 3).number_format = "#,##0"
end = 4 + max(len(km), 1)
ws.cell(2, 8, "覆盖率汇总").font = font(bold=True)
header_r = 3
for j, h in enumerate(["小类", "总搜索量", "已归类搜索量", "覆盖率"], 8):
    c = ws.cell(header_r, j, h); c.font = HFONT; c.fill = HDR; c.alignment = CEN
    ws.column_dimensions[CL(j)].width = 14
for i, sname in enumerate(sorted({k.get("subcategory") for k in km if k.get("subcategory")})):
    r = 4 + i
    ws.cell(r, 8, sname).font = font(size=9)
    ws.cell(r, 9, f'=SUMIFS($C$5:$C${end},$A$5:$A${end},H{r})').font = font(size=9)
    ws.cell(r, 10, f'=SUMIFS($C$5:$C${end},$A$5:$A${end},H{r},$D$5:$D${end},"<>")').font = font(size=9)
    ws.cell(r, 11, f'=IF(I{r}>0,J{r}/I{r},"")').font = font(size=9); ws.cell(r, 11).number_format = "0%"
if not km: ws.cell(5, 1, "尚未导入关键词挖掘文件（见「待导出清单」）").font = font(size=9, italic=True)

# ============ 类目映射表 ============
ws = wb.create_sheet("类目映射表")
title(ws, "类目映射表", "亚马逊相关根类目下的每个末级类目，都要对应到形态（形态编号）或写明排除原因。完成标准：覆盖率 100%。")
header(ws, 4, [("节点 ID", 14), ("类目路径", 60), ("对应形态编号", 18), ("排除原因", 24), ("数据日期", 10)])
bn = DB["browse_node_map"]
for i, n in enumerate(bn):
    for j, v in enumerate([n["node_id"], n.get("path"), "、".join(n.get("form_ids") or []) or None, n.get("excluded_reason"), n.get("as_of")], 1): cell(ws, 5 + i, j, v)
if bn:
    e = 4 + len(bn)
    ws.cell(2, 7, "覆盖率").font = font(bold=True)
    ws.cell(3, 7, f'=IF(COUNTA(A5:A{e})>0,SUMPRODUCT(--((C5:C{e}<>"")+(D5:D{e}<>"")>0))/COUNTA(A5:A{e}),"")').number_format = "0%"
else:
    ws.cell(5, 1, "尚未导入类目节点清单（见「待导出清单」）").font = font(size=9, italic=True)

# ============ 证据日志 / 导入记录 / 变更记录 ============
ws = wb.create_sheet("证据日志")
title(ws, "证据日志", "每个形态当前数据的来源、日期、可信度和证据文件。")
header(ws, 4, [("编号", 7), ("形态", 22), ("可信度", 7), ("数据来源", 36), ("数据日期", 10), ("证据文件", 40), ("缺失的数据", 30)])
for i, x in enumerate(RECS):
    for j, v in enumerate([x["id"], x["form"], x.get("confidence"), x.get("data_source"), x.get("as_of"), x.get("evidence_ref"), "、".join(x.get("data_gaps") or []) or None], 1):
        cell(ws, 5 + i, j, v, center=j == 3)
ws.freeze_panes = "C5"
ws = wb.create_sheet("导入记录")
title(ws, "导入记录")
header(ws, 4, [("导入日期", 11), ("数据日期", 11), ("文件", 50), ("结果", 8), ("说明", 40)])
for i, l in enumerate(DB.get("imports_log", [])):
    for j, v in enumerate([l["imported_on"], l["data_date"], l["file"], l["result"], l.get("note")], 1): cell(ws, 5 + i, j, v)
ws = wb.create_sheet("变更记录")
title(ws, "变更记录", "每次导入后，状态、头部销量、细分规模、闸门、评分、建议结论的变化。")
header(ws, 4, [("日期", 11), ("类型", 10), ("编号", 7), ("形态", 22), ("变化", 80)])
for i, c in enumerate(reversed(DB.get("changelog", []))):
    ch = c.get("changes")
    detail = "；".join(f"{k}: {v[0]} → {v[1]}" for k, v in ch.items()) if ch else c.get("detail")
    for j, v in enumerate([c["date"], c["type"], c.get("form_id"), c.get("form"), detail], 1): cell(ws, 5 + i, j, v)

# ============ 新增与趋势 / 开品流程 / 待扫描大类 ============
ws = wb.create_sheet("新增与趋势")
title(ws, "新增与上升类型")
header(ws, 4, [("信号", 36), ("来源", 30), ("对应全景图", 22), ("对 MEEDEN 的含义", 44)])
for k, t in enumerate(DB["trends"]):
    for j, v in enumerate([t["signal"], t["source"], t["maps_to"], t["implication"]], 1): cell(ws, 5 + k, j, v)
    link(ws, 5 + k, 2, t["url"])
ws = wb.create_sheet("开品流程")
title(ws, "开品流程 V2（每个大类 10 步）")
header(ws, 4, [("步", 5), ("做什么", 44), ("产出", 26), ("完成标准", 36)])
steps = [
    (1, "读导图骨架和种子形态", "初始形态清单", "导图每个小类和空位都有形态"),
    (2, "亚马逊类目树映射", "类目映射表", "节点覆盖率 100%"),
    (3, "关键词挖掘与归类", "关键词归类表", "每个小类搜索量覆盖率 ≥ 95%"),
    (4, "Top 10 竞品品牌产品线对照", "补充形态", "Top 10 品牌产品线都已对照"),
    (5, "MEEDEN 全量 ASIN 映射", "ASIN 清单、分级覆盖矩阵", "每个 ASIN 都挂到形态"),
    (6, "导入工具数据，计算细分市场指标", "全景图指标列", "空白 / 部分覆盖 / 规划中的形态可信度为高"),
    (7, "三道闸 + 机会评分", "G1–G3、机会评分、建议结论", "每个形态都有闸门结果"),
    (8, "风险、趋势、老品升级排序", "风险标识、新增与趋势、老品升级清单", "风险清单逐项勾选"),
    (9, "生成、校验、抽检", "Excel、思维导图、变更记录", "检查清单通过；抽检错误率 < 5%"),
    (10, "交付与回填", "交付说明", "执行手册进度已更新"),
]
for k, s in enumerate(steps):
    for j, v in enumerate(s, 1): cell(ws, 5 + k, j, v, center=j == 1)
ws = wb.create_sheet("待扫描大类")
title(ws, "待扫描大类（导图结构）")
header(ws, 4, [("大类", 14), ("小类", 16), ("导图现状（L1 / L2 / L3）", 30), ("导图空位", 34), ("待纳入的市场形态", 50), ("状态", 10)])
k = 5
for s in DB["skeleton"]:
    if s["category"] in PENDING:
        for j, v in enumerate([s["category"], s["subcategory"], s["framework_now"], s["framework_gaps"], s["forms_to_check"], s["status"]], 1): cell(ws, k, j, v)
        k += 1
wb.save(OUT_XLSX)

# ---------------- 思维导图 ----------------
def leaf(x):
    return {"n": x["form"], "st": x["meeden_status"], "id": x["id"], "spec": x["spec"], "kw": x["keyword_en"], "map": x["framework_ref"],
            "asin": x["evidence_asin"], "other": x["evidence_other"], "bench": x["benchmark"], "units": x["monthly_units"],
            "price": x["price_usd"], "new": x["trend_signal"], "risk": "、".join(filter(None, [x["risk"], flags_text(x)])), "concl": x["conclusion"], "note": x["note"],
            "pri": x["priority"] if x["conclusion"] == "立项评审" else "",
            "mos": x.get("mos_score") if x.get("mos_complete") else None, "sugg": x.get("conclusion_suggested"),
            "g": [x.get("gate_g1"), x.get("gate_g2"), x.get("gate_g3")], "conf": x.get("confidence"), "src": x.get("data_source"), "asof": x.get("as_of"),
            "lv": lv_text(x), "seg": x.get("seg_revenue_top10"), "npass": x.get("n_pass"), "cr1": x.get("cr1")}
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
n_high = sum(1 for x in RECS if x.get("confidence") == "高")
subtitle = "按 2027 产品规划导图的结构展开 · 已扫描：%s · 待扫描：%s · 高可信度数据 %d/%d · 更新 %s" % ("、".join(SCANNED), "、".join(PENDING) or "无", n_high, len(RECS), META["updated"])
open(OUT_HTML, "w", encoding="utf-8").write(tpl.replace("__DATA__", json.dumps(tree, ensure_ascii=False)).replace("__SUBTITLE__", subtitle))
print(f"OK  {META['version']}  records={len(RECS)}  scanned={SCANNED}  high_conf={n_high}")
print(OUT_XLSX); print(OUT_HTML)
