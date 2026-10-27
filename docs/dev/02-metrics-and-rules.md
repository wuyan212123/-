# 02 · 指标口径与判断规则

本章是所有计算的规格。伪代码用 Python 风格书写，便于直接落到 FastAPI 后端；括号里的函数名是原型中的参考实现。所有阈值来自项目级“分析规则”（第 4 节），不得写死在代码里。

> 如果仓库现有的已验证口径与本章不一致，以现有口径为准，并在 PR 中列出差异。

## 1. 基础量与派生指标

### 1.1 基础量

每条明细（一天 × 活动 × 广告组 × 投放 × 匹配 × 搜索词）有五个基础量：

| 字段 | 含义 |
| --- | --- |
| `impr` | 曝光 |
| `clicks` | 点击 |
| `spend` | 花费 |
| `sales` | 广告销售额（7 天归因） |
| `orders` | 广告订单（与“销售件数 units”是两个字段，不能混用） |

任意范围的指标 = 先对基础量求和，再派生比率（`derive()`）：

```python
def derive(z):
    return {**z,
        'ctr':  z.clicks / z.impr    if z.impr   else None,
        'cvr':  z.orders / z.clicks  if z.clicks else None,
        'cpc':  z.spend  / z.clicks  if z.clicks else None,
        'acos': z.spend  / z.sales   if z.sales  else None,
        'roas': z.sales  / z.spend   if z.spend  else None,
        'cpa':  z.spend  / z.orders  if z.orders else None}
```

### 1.2 四种“空”

| 状态 | 含义 | 显示 |
| --- | --- | --- |
| 无数据 | 该日期没有导入任何报表（缺日） | 日历和趋势上标出缺日，曲线断开 |
| 无匹配记录 | 范围筛选后没有任何明细 | 空状态：“当前范围没有匹配记录”，并说明“不代表真实零值” |
| 真实 0 | 有记录且值为 0 | 显示 0 |
| 不可计算 | 比率的分母为 0 | 显示“—”，悬停提示“分母为 0，不可计算” |

### 1.3 数值格式（`fv()`）

| 指标 | 格式 |
| --- | --- |
| 曝光、点击、订单 | 千分位整数 |
| 花费、销售额、CPC、CPA | 币种符号 + 两位小数（币种来自项目站点，如 `$`、`€`） |
| CTR | 两位小数百分比 |
| CVR、ACOS | 一位小数百分比 |
| ROAS | 两位小数 |

紧凑格式（`fc()`，热力表与小图用）：金额 ≥ 1000 显示为 `$1.2k`，否则取整；ACOS 取整百分比。

### 1.4 变化值与颜色（`dlt()`、`SEM`）

```python
SEM = {'impr':0,'clicks':0,'spend':0,'sales':1,'orders':1,'ctr':1,'cvr':1,'cpc':-1,'acos':-1,'roas':1,'cpa':-1}

def delta(metric, a, b):
    if a is None or b is None: return ('na', '—')
    if metric in ('ctr','cvr','acos'):            # 百分比指标：用百分点
        d = (a - b) * 100
        if abs(d) < 0.05: return ('flat', '持平')
        text = f'{d:+.1f}pt'
    else:
        if b == 0: return ('na', '新出现')
        d = (a - b) / b * 100
        if abs(d) < 0.5: return ('flat', '持平')
        text = '+999%' if d >= 999 else f'{d:+.1f}%'
    s = SEM[metric]
    tone = 'neu' if s == 0 else ('good' if (d > 0) == (s > 0) else 'bad')
    return (tone, text)
```

`good` 绿、`bad` 红、`neu` 灰；同时带上升 / 下降箭头图标，颜色不是唯一信号。

## 2. 日期与覆盖

1. 日期范围首尾均计入；单日 = `s == e`。
2. 日报按实际日期累计；历史周期报表只统计被**完整包含**的周期，不按比例拆成单日；日数据与周期数据重叠时按既定实体范围处理，同一天不重复计入。
3. 覆盖（`coverage()`）：

```python
coverage(s, e) = {
  'n': 有数据的天数,           # 不含缺日、不含超出数据范围的天
  'days': e - s + 1,
  'miss': [缺日列表],          # 在数据范围内但没有数据的日期
  'inData': 落在数据范围内的天数 }
```

4. **日均对照**：`per = (covA.n != covB.n)`。`per` 为真时，量类指标（曝光、点击、花费、销售额、订单）先除以各自的 `n` 再比较；比率指标不做日均，直接比较。界面必须标出“日均”。
5. **无 B 基准**：`hasB = covB.n > 0`。为假时，所有依赖对比的判断（新增、消失、提升、恶化、变动、拆解、上期回看）暂停，只给按目标阈值的判断。
6. **周**：一律周一到周日；周号用 ISO 周（`isoW()`）。“归档周”列表从数据截至日往前每 7 天一段。
7. **日期预设**（以数据截至日 `LAST` 为参照）：

| 分组 | 预设 | 范围 |
| --- | --- | --- |
| 按天 | 最新一天 / 最近 7 天 / 最近 30 天 | `[LAST, LAST]` / `[LAST-6, LAST]` / `[LAST-29, LAST]` |
| 按周 | 本周 / 上周 / 最近 4 周 | 截至日所在周（周一起，截到 LAST）/ 上一个自然周 / 本周往前共 4 个自然周 |
| 按月 | 本月 / 上月 | 本月 1 日到 LAST / 上一个自然月 |
| 相对 A（仅 B） | A 的前一期（同天数）/ 此前 28 天基准 | `[A.s-n, A.s-1]` / `[A.s-28, A.s-1]` |

“最近 4 周”与“此前 28 天基准”口径不同，日期弹层底部必须写明。

8. **此前 28 天基准**（总览“数据覆盖与口径”）：`[A.s-28, A.s-1]`，总量按周均（÷ 覆盖天数 × 7，即原型 `wk = n/7`）对照，比率直接比较；覆盖为 0 时显示“A 之前没有足够历史数据”。

## 3. 关键词聚合（`calc()`）

```python
rows = [r for r in project_rows(source)
        if (not f.campaigns or r.camp in f.campaigns)
        and (not f.adgroups or r.ag in f.adgroups)
        and (not f.match or r.match in f.match)
        and (not f.target or f.target.lower() in r.target.lower())
        and (not f.term or r.term == f.term.strip().lower())]

for r in rows:
    a, b = sum(r, A), sum(r, B)
    if a.impr == 0 and b.impr == 0: continue          # 两期都没有曝光的行不进入分析
    key = r.term if source == 'term' else r.target
    kw[key].rows.append({'r': r, 'a': derive(a), 'b': derive(b)})

for k in kw:
    k.A, k.B = derive(Σ rows.a), derive(Σ rows.b)
    k.rows 按 A 花费降序
    k.tags = tagsOf(k.A, k.B, hasB, rules); 每行 x.tags = tagsOf(x.a, x.b, hasB, rules)
    追加“活动分化”（第 5.2 节）；k.tags 按 TAGORDER 排序
    k.sugg = suggestOf(k, rules, hasB, source)
    k.matches / k.camps / k.ags / k.targets = 去重列表
```

结果还要带：A、B 总指标，`covA`、`covB`、`hasB`、明细行数 `nRows`、各标签计数 `tagCount`、日序列 `daily(s, e)`（缺日返回 `null`）。

### 3.1 关键词类型（`kwType()`）

| 条件（按顺序） | 类型 |
| --- | --- |
| 投放报表且匹配为 auto | 自动投放 |
| 投放报表且匹配为 asin，或投放 / 搜索词是 ASIN（`asin="B0…"` 或 10 位 `b0` 开头编码） | ASIN |
| 命中品牌保护词表（包含任一品牌词，不区分大小写） | 品牌词 |
| 命中竞品词表 | 竞品词 |
| 单词数 ≥ 4 | 长尾词 |
| 其他 | 通用词 |

> 原型的合成数据自带类型字段；正式版必须按保护词表与上表判定。

## 4. 规则参数

项目级，默认值如下（`DEF_RULES`）：

| 键 | 名称 | 默认 | 用途 |
| --- | --- | --- | --- |
| `acos` | 目标 ACOS | 35% | 超标、恶化、可放大、收割、调价 |
| `cpa` | 目标 CPA | 18（币种同项目） | 否定、效率分层、报告目标 |
| `minClicks` | 最低点击样本 | 10 | 样本不足、恶化、降价 |
| `minImpr` | CTR 判断最低曝光 | 500 | CTR 提升 |
| `chg` | 变化阈值 | 20% | 提升、恶化 |
| `noConv` | 无转化点击阈值 | 15 | 高点击无转化、否定、暂停 |
| `newMode` | 新品模式 | 关 | 放宽阈值（见下） |
| `be` | 盈亏平衡 ACOS（≈ 广告前毛利率） | 42% | 目标合理性检查、报告目标 |
| `harvestMin` | 收割最少订单 | 2 | 收割 |
| `up` | 盈利提价幅度 | 15% | 调价 |
| `noOrdDown` | 无单阶梯降价 | 20% | 调价 |
| `maxDown` | 单次降价上限 | 30% | 调价 |
| `lag` | 排除最近未结算天数 | 3 | 决策窗口、归因提示 |
| `brand` | 品牌保护词表 | — | 品牌词判定，品牌词只复核不直接否定 |
| `comp` | 竞品词表 | — | 竞品词判定 |

**有效阈值** `thr(rules)`：

```python
T.acos   = rules.acos * 1.4            if rules.newMode else rules.acos
T.minC   = round(rules.minClicks * 1.5) if rules.newMode else rules.minClicks
T.noConv = rules.noConv + 10            if rules.newMode else rules.noConv
```

下文中 `T.*` 指有效阈值，`rules.*` 指原值。

## 5. 标签

### 5.1 单行 / 单词标签（`tagsOf(A, B, hasB, rules)`）

```python
tags = []
if hasB:
    if B.impr == 0 and A.impr > 0:                                   tags += ['新增']
    if A.impr == 0 and (B.orders > 0 or B.clicks >= 5):              tags += ['消失']
    if A.ctr is not None and B.ctr is not None and A.impr >= rules.minImpr and B.impr >= rules.minImpr \
       and A.ctr > B.ctr * (1 + rules.chg):                           tags += ['CTR提升']
    if A.cvr is not None and B.cvr is not None and A.clicks >= T.minC and B.clicks >= T.minC \
       and A.cvr > B.cvr * (1 + rules.chg):                           tags += ['CVR提升']

hi = A.acos is not None and A.acos > T.acos and A.clicks >= T.minC
if hi and hasB and ((B.spend > 0 and B.clicks >= T.minC) if B.acos is None
                    else A.acos > B.acos * (1 + rules.chg)):          tags += ['ACOS恶化']
elif hi:                                                              tags += ['ACOS超目标']
if A.clicks >= T.noConv and A.orders == 0:                            tags += ['高点击无转化']
if A.orders >= 5 and A.acos is not None and A.acos <= T.acos:         tags += ['核心词']
if A.orders >= 3 and A.acos is not None and A.acos <= T.acos * 0.7:   tags += ['可放大']
if not tags and A.impr > 0 and A.clicks < T.minC:                     tags += ['样本不足']
```

### 5.2 活动分化（关键词级派生）

一个词的来源活动行超过 1 条，且满足任一条件时追加“活动分化”：

- 汇总有机会标签（核心词或可放大），但某一行有风险标签；
- 汇总有风险标签，但某一行有“可放大”或“核心词”。

### 5.3 标签分类与清单视图

| 标签 | 分类 | 颜色 |
| --- | --- | --- |
| ACOS恶化、ACOS超目标、高点击无转化、消失 | 风险 `risk` | 红 |
| 可放大、核心词 | 机会 `opp` | 绿 |
| CTR提升、CVR提升、新增 | 提升 `chg` | 强调蓝 |
| 活动分化 | 需核查 `warn` | 琥珀 |
| 样本不足 | 观察 `obs` | 灰 |

显示顺序（`TAGORDER`）同上表从上到下。清单视图：

| 视图 | 条件 |
| --- | --- |
| 全部 | 所有词 |
| 风险 | 有任一风险标签 |
| 机会 | 有任一机会标签，或任一建议为“转 Exact” |
| 提升 | 有任一提升标签 |
| 需核查 | 有“活动分化”或“样本不足” |
| 已处理 | 本期有人工判断记录 |

## 6. 建议（`suggestOf()`）

按**来源活动行**逐行判断，每行最多一条，命中第一条即停：

| 顺序 | 条件（`a` = 该行 A，`b` = 该行 B） | 动作 | 优先级 | 类型 |
| --- | --- | --- | --- | --- |
| 1 | `a.clicks ≥ T.noConv` 且 `a.orders = 0` | 品牌词 → 人工复核品牌词；匹配为 asin → 否定 ASIN；否则 → 否定词 | 花费 > 25 为高，否则中 | 风险 |
| 2 | `a.acos > T.acos` 且 `a.clicks ≥ T.minC` 且（无 B，或 `b.acos` 为空，或 `a.acos > b.acos × (1+chg)`） | 品牌词 → 人工复核品牌词；否则 → 降低竞价 | 花费 > 40 为高，否则中 | 风险 |
| 3 | `a.orders ≥ 3` 且 `a.acos ≤ T.acos × 0.7` | 搜索词报表、该行不是 exact / asin、该词没有任何 exact 行 → 转 Exact；否则 → 提高竞价 | 订单 ≥ 6 为中，否则低 | 机会 |
| 4 | 有 B，`a.ctr ≥ b.ctr × 0.9`，`a.cvr < b.cvr × 0.6`，`b.cvr > 0`，`a.clicks ≥ 20` | 检查 Listing | 中 | 风险 |

每条建议包含：

```ts
interface Suggestion {
  action: string;                          // 动作名
  obj: { camp; ag; target; match };        // 作用对象
  fact: string;                            // “A 点击 x · 花费 y · 订单 z · ACOS w”
  conds: string[];                         // 命中的条件，逐条写出阈值与实际值
  risk: string;                            // 执行风险说明
  pri: 'hi' | 'mid' | 'lo';
  kind: 'risk' | 'opp';
}
```

同一个词的建议按优先级排序。风险文案：

- 否定：“否定后该活动不再为此词展示；若与产品高度相关，可先降价观察”；品牌词：“品牌词受保护：先检查落地页与竞价，再决定”。
- 降价：“降价会减少曝光；如该词在其他活动仍贡献订单，请只调整本活动”。
- 转 Exact：“新建 Exact 后原活动需加否定精准词，避免自我竞争”；提价：“提价后 CPC 上升，需观察 ACOS 是否仍在目标内”。
- 检查 Listing：“转化下降可能来自价格、评论、库存或竞品，系统无法判断具体原因”。

“检查活动预算”只是总览提示（第 13 节），没有预算使用率证据，不作为关键词建议。

## 7. 关键词变动（`mvOf()`、`kwMoves()`）

关键词页“变动”筛选与列、复盘分析“关键词变动”、报告“关键词”章节共用同一规则。

```python
MVFLOOR = {'sales': 20, 'orders': 2, 'clicks': 5, 'spend': 10}   # 最小差额（原始总量，不是日均）

def mv_of(k, m, R):                      # m ∈ sales / orders / clicks / spend
    if not R.hasB: return None
    per = R.covA.n != R.covB.n
    a = k.A[m] / R.covA.n if per else k.A[m]
    b = k.B[m] / R.covB.n if per else k.B[m]
    if a == 0 and b == 0: return None
    big = abs(k.A[m] - k.B[m]) >= MVFLOOR[m]
    if b == 0: return {'t': 'new',  'a': a, 'b': b, 'd': a - b, 'r': None, 'per': per}
    if a == 0: return {'t': 'lost', 'a': a, 'b': b, 'd': a - b, 'r': -1,   'per': per}
    r = a / b - 1
    t = 'up' if big and r >= 0.2 else 'down' if big and r <= -0.2 else 'flat'
    return {'t': t, 'a': a, 'b': b, 'd': a - b, 'r': r, 'per': per}
```

- 名称：新增、增长、下滑、消失、稳定。
- 按“变动”排序 = 按 `|d|`（变化幅度）降序。
- **主因**（`kwMoves()`，固定按销售额）：
  - 新增：B 曝光为 0 → “新获得流量”；B 点击为 0 → “开始有点击并转化”；否则 “开始转化”。
  - 消失：A 曝光为 0 → “流量消失”；A 点击为 0 → “有曝光无点击”；否则 “有点击无转化”。
  - 增长 / 下滑 / 稳定：对该词做销售额拆解（第 8 节），取贡献绝对值最大的因素，写成 “CVR ↓72%”。

## 8. 变化拆解（LMDI，`decompAB()`）

对数均值分解：各因素贡献相加正好等于总变化，没有残差。

| 拆法 | 总量 | 因素 | 方向 |
| --- | --- | --- | --- |
| 销售额 | sales | 曝光 × CTR × CVR × 客单价 | 都为 +1 |
| 花费 | spend | 曝光 × CTR × CPC | 都为 +1 |
| ACOS | acos | CPC ÷ (CVR × 客单价) | CPC +1，CVR −1，客单价 −1 |

```python
def decomp(A, B, nA, nB, kind):
    per = nA != nB; fa = 1/nA if per else 1; fb = 1/nB if per else 1
    aov = lambda x: x.sales / x.orders if x.orders else None
    if kind == 'sales':
        tA, tB = A.sales*fa, B.sales*fb
        fac = [('曝光', A.impr*fa, B.impr*fb, 1), ('CTR', A.ctr, B.ctr, 1), ('CVR', A.cvr, B.cvr, 1), ('客单价', aov(A), aov(B), 1)]
    elif kind == 'spend':
        tA, tB = A.spend*fa, B.spend*fb
        fac = [('曝光', A.impr*fa, B.impr*fb, 1), ('CTR', A.ctr, B.ctr, 1), ('CPC', A.cpc, B.cpc, 1)]
    else:  # acos，单位为百分点
        tA, tB = A.acos, B.acos
        fac = [('CPC', A.cpc, B.cpc, 1), ('CVR', A.cvr, B.cvr, -1), ('客单价', aov(A), aov(B), -1)]
    if not (tA and tA > 0 and tB and tB > 0) or any(not (a and a > 0 and b and b > 0) for _, a, b, _ in fac):
        return None                                # 有因素为 0（如无订单）时不拆
    L = tA if abs(tA - tB) < 1e-12 else (tA - tB) / ln(tA / tB)
    steps = [{'l': l, 'a': a, 'b': b, 'chg': a/b - 1, 'v': L * ln(a/b) * s} for l, a, b, s in fac]
    return {'kind': kind, 'tA': tA, 'tB': tB, 'per': per, 'steps': steps}
```

- 主因 = `|v|` 最大的因素。
- 瀑布图颜色：销售额拆解中 `v > 0` 绿、`v < 0` 红；花费拆解一律灰（花费涨跌不分好坏）；ACOS 拆解中压低 ACOS 为绿、推高为红；`|chg| < 0.5%` 为灰。

## 9. 本期结论句（`insight()`）

总览左上和周期优化“诊断”步骤顶部使用。规则生成，标注“非 AI”。

```text
无 B：     “B 期没有可用数据，暂不生成对比结论。”
销售额变化 |sChg| < 0.5%：“广告销售额[日均]与 B 期基本持平”
否则：     “广告销售额[日均]{增长|下降} x.x%，主要来自{主因}{上升|下降}”
副句：     “[日均]销售额 A（B …）；花费[日均]{上升|下降} y%，ACOS 从 b 变为 a。下方为拆解。”
因素卡：   四个因素的变化与贡献，主因高亮
相关词：   销售额下降时取变化最负的 3 个词（“拖累最大的词”），上升时取最正的 3 个词
```

## 10. 周序列与趋势

### 10.1 12 周区间（`wkBlocks()`）

从 A 期结束日往前，每 7 天一段，共 12 段（与分析窗口对齐，避免半周）。每段记录 `n`（有数据的天数）、是否完全落在 A 内（`inA`）或 B 内（`inB`）。缺日的段在热力表单元格右上角加圆点。

- 量类指标的周值用于比较时取日均（周总量 ÷ n）；比率按周汇总后重算。

### 10.2 连续变化（`streak()`）

从最后一周往前数连续同向变化的周数：上升要求 `本周 > 上周 × 1.02`，下降要求 `本周 < 上周 × 0.98`；遇到空值即停。

### 10.3 活动趋势判断（`trendOf()`）

输入该活动 12 周的 ACOS 序列 `ac` 与日均花费序列 `sp`，按顺序命中第一条：

| 条件 | 结果 | 文案 |
| --- | --- | --- |
| 最近一周花费 = 0 | neu | 最近一周无花费 |
| 最近一周 ACOS 为空（有花费无销售） | bad | 最近一周有花费无销售 |
| ACOS 连升 ≥ 2 周 且 最近 ACOS > T.acos × 1.1 | bad | ACOS 连续 n 周上升，已超目标 |
| 日均花费连降 ≥ 3 周 | warn | 花费连续 n 周下降 |
| 日均花费连升 ≥ 2 周 且 最近 ACOS ≤ T.acos | good | 放量中：花费连续 n 周增长，ACOS 达标 |
| ACOS 连降 ≥ 2 周 | good | ACOS 连续 n 周下降 |
| ACOS 连升 ≥ 2 周 | 最近 ACOS > T.acos × 0.8 → warn（接近目标），否则 neu（小幅上升，仍低于目标） | ACOS 连续 n 周上升… |
| 最近 ACOS > T.acos × 1.1 | bad | ACOS 超目标 |
| 其他 | neu | 平稳 |

### 10.4 热力表着色

- ACOS：以目标为中点的双色发散。`t = clamp((v − T.acos) / (T.acos × 0.6), −1, 1)`，`t < 0` 用“有利”色（蓝），`t > 0` 用“不利”色（红），强度 `|t|`；无销售有花费的格子显示“无单”。
- 其他指标：按行着色的单色顺序色阶（每个对象和自己的 12 周比）。
- 末列为“周环比”：最近一周对比前一周，量类按日均。

## 11. 结构指标

| 指标 | 函数 | 规则 |
| --- | --- | --- |
| 匹配方式结构 | `matchSplit()`、`mixSeries()` | 按 auto / broad / phrase / exact / asin 汇总 A、B；每周花费占比用于堆叠柱。拓词（自动 / 广泛）→ 控制（词组）→ 放量（精准） |
| 品牌 / 非品牌 | `typeSplit()` | 按关键词类型汇总；非品牌 = 除“品牌词”外全部。展示整体 ACOS、非品牌 ACOS、品牌词 ACOS 与花费占比 |
| 无效花费率 | `wasteSeries()` | 每个周区间的结束日 e，窗口 `[e−13, e]`（14 天滚动）。**按明细行**判断：窗口内 `orders = 0` 且 `clicks ≥ T.noConv` 的行，其花费计入无效花费。比率 = 无效花费 ÷ 窗口总花费。参考带 10%–20%（部分代理商的拓词期参考，**不是行业标准**） |
| 同词多活动 | 报告 / 结构页 | 仅搜索词报表：A 期有花费的来源活动行分布在 ≥ 2 个不同活动的搜索词。保留建议 = 订单最多、其次 ACOS 最低的那一行；其余可加否定精准 |
| 效率分层散点 | `quadChart()` | A 期有花费的每个词：横轴花费（平方根刻度），纵轴 ACOS。分组：订单 0 且花费 ≥ 目标 CPA → 高花费无单；订单 0 或 ACOS 为空 → 样本不足；ACOS > 目标 → ACOS 超标；ACOS ≤ 目标 × 0.7 且订单 ≥ 2 → 可放大；其余 → 达标 |
| 集中度 | 关键词变动页 | 前 1 / 5 / 10 个词（按该期销售额排序）的销售占比、长尾词销售占比、出单词数（订单 > 0 的词数），A 与 B 各一组 |
| 花费占比 vs 销售占比 | 活动趋势页 | A 期各活动花费占比与销售占比；效率 = 销售占比 ÷ 花费占比，< 1 为花得多卖得少 |
| 星期规律 | `weekdayData()` | A 结束日往前 56 天（8 周），跳过缺日；异常日 = 当日销售额 > 均值 + 2.5σ，可勾选排除（默认排除）。按周一到周日汇总，比率重算，量类取日均。CVR 最高与最低之差 / 整体 CVR < 10% 时提示“不建议按星期调整” |

## 12. 总览专用规则

| 模块 | 规则 |
| --- | --- |
| KPI 条 | 广告花费、广告销售额、广告订单、ACOS、CVR、CPC。`per` 时量类显示日均变化与“日均 A · B”。小图：A 逐日（实线）与 B 逐日（虚线），按第 N 天对齐 |
| 需要优先处理 · 风险 | ACOS 恶化（金额 = 这些词的 A 花费合计）、高点击无转化（A 花费合计，即无单花费）、历史有单本期消失（B 订单合计） |
| 需要优先处理 · 机会 | 可放大（A 销售额合计）、转 Exact 候选（有“转 Exact”建议的词数） |
| 需要优先处理 · 提示 | 检查活动预算：活动 A 日均花费 ÷ B 日均花费 > 1.3 时列出（**只基于花费趋势**，没有预算使用率） |
| 重点关键词 | A 花费前 8，附近 8 周花费小图、A ACOS、销售额变化、首条建议 |
| 本轮进度 | 数据截至日 ✓、A/B 已设定 ✓、周期优化第 n/6 步或已完成、生成复盘 |

## 13. 周期优化规则（`cycleData()`）

### 13.1 决策窗口检查（准备与回看）

| 检查 | 通过条件 | 不通过时 |
| --- | --- | --- |
| 数据新鲜度 | 始终显示“数据已更新至 LAST” | — |
| 未结算数据 | A 期不含最近 `lag` 天 | 提示 A 含最近 n 天未结算数据，提供“改用推荐窗口：近 14 天，截至 LAST−lag” |
| 样本量 | A 覆盖天数 ≥ 10 | 提示样本偏少，建议 14 天窗口 |
| 覆盖 | A、B 均无缺日 | 提示缺日与“已按日均对比”，链接数据中心 |
| 来源 | 搜索词报表 | 投放报表只能调价，提供“切换” |
| 目标合理性 | `T.acos < rules.be` | 提示按此目标投放会亏损 |

推荐窗口：`A = [LAST − (lag + 13), LAST − lag]`，`B = A 之前 14 天`。

### 13.2 收割（仅搜索词报表）

```python
for k in keywords:
    if k.kwtype == '品牌词': continue
    has_exact = any(x.r.match in ('exact', 'asin') for x in k.rows)
    src = [x for x in k.rows if x.r.match in ('auto', 'broad', 'phrase')]
    if has_exact or not src: continue
    a = derive(Σ x.a for x in src)
    if a.orders >= rules.harvestMin and a.acos is not None and a.acos <= T.acos:
        rpc = a.sales / a.clicks                                   # 每次点击收入
        bid = r2(min(a.cpc * 1.6, max(a.cpc * 0.9, rpc * T.acos)))  # r2 = 四舍五入到分，最低 0.02
        to  = 收割去向（ASIN → 商品投放活动 / 广告组；否则 → 精准活动 / 广告组）
        conf = 'high' if a.orders >= 3 else 'mid'
排序：订单降序，其次 ACOS 升序
```

> 收割去向活动与广告组在原型中写死（`SP-Exact-Core / AG-Exact-Growth`、`SP-ASIN-Competitor / AG-PAT-Rival-ASIN`）。正式版需在项目规则中可配置，见 `08` 待决问题。

### 13.3 否定（仅搜索词报表）

```python
wk = 7 / covA.n                                   # 换算成每周
for k in keywords:
    for x in k.rows:
        if x.r.match in ('exact', 'asin'): continue  # 精准投放不在这里否定，去“调价”暂停
        a = x.a
        if a.orders == 0 and a.clicks >= T.minC and (a.clicks >= T.noConv or a.spend >= rules.cpa * 1.5):
            brand = 命中品牌词表(k.key)
            item = {key, row: x.r, a, asin: k.kwtype == 'ASIN', brand, comp: 命中竞品词表(k.key),
                    allZero: k.A.orders == 0, nCamp: len(k.camps), waste: a.spend * wk,
                    conf: 'low' if brand else ('high' if a.clicks >= T.noConv * 1.5 or a.spend >= rules.cpa * 2 else 'mid')}
排序：花费降序
```

方式：品牌词 → “人工复核 · 品牌词”；ASIN → 否定 ASIN；其他 → 否定精准。说明：多个活动都无订单 → “n 个活动均无订单”；其他活动有订单 → “其他活动有订单，只否定这里”。

### 13.4 调价（按投放组：活动 × 广告组 × 投放 × 匹配）

```python
for g in target_groups:
    a = derive(g.A)
    if a.impr == 0: continue
    if a.orders == 0 and a.clicks < T.minC:      kind, chg, why = 'watch', 0, f'点击 {clicks} 次，未到最低样本 {T.minC}'
    elif a.orders == 0 and a.clicks >= T.noConv:
        if g.match == 'auto':                    kind, chg = 'down0', -rules.maxDown      # 自动组降到上限
        else:                                    kind, chg = 'pause', -1
    elif a.orders == 0:                          kind, chg = 'down0', -rules.noOrdDown     # 阶梯降价
    elif a.acos > T.acos * 1.1:                  kind, chg = 'down', max(-rules.maxDown, min(-0.05, T.acos / a.acos - 1))
    elif a.orders >= 2 and a.acos <= T.acos * 0.7:
        low = a.impr * wk < 1500                 # 曝光偏少再加 5%
        kind, chg = 'up', rules.up + (0.05 if low else 0)
    else:                                        kind, chg = 'keep', 0
    brand = 命中品牌词表(g.target)
    ref   = r2(a.cpc * (1 + chg)) if kind in ('down', 'down0', 'up') else None   # 参考出价（报表不含当前出价）
    save  = a.spend * wk if kind == 'pause' else a.clicks * wk * (a.cpc - ref) if kind in ('down', 'down0') else 0
    extra = a.clicks * wk * (ref - a.cpc) if kind == 'up' else 0
    conf  = 'low' if brand and kind in ('pause', 'down0') else ('high' if a.clicks >= T.minC * 2 or a.orders >= 3 else 'mid')
排序：save + extra 降序，其次花费降序
```

分桶显示：亏损降价 `down`、无单降价 `down0`、暂停 `pause`、盈利提价 `up`、维持 `keep`、观察 `watch`。只有前四类是可勾选的动作。

### 13.5 勾选与影响

- 默认勾选 = 置信度不是“需复核”（`low`）；用户勾选覆盖默认值。
- 影响估算（`cycImpact()`，均为每周、按点击量不变粗估）：否定节省 = Σ waste；降价 / 暂停节省 = Σ save；提价最多增加花费 = Σ extra；动作总数 = 收割 + 否定 + 降价 + 暂停 + 提价。

### 13.6 批量操作表（`bulkRows()`）

列：Entity、Operation、Campaign、Ad Group、Keyword / Targeting、Match Type、Bid、State。

| 来源 | 行 |
| --- | --- |
| 收割（关键词） | `Keyword, Create, 去向活动, 去向广告组, 搜索词, Exact, 建议出价, enabled`；并对每个（去重后的）来源活动 / 广告组加一行 `Negative Keyword, Create, 来源活动, 来源广告组, 搜索词, Negative Exact, , enabled` |
| 收割（ASIN） | `Product Targeting, Create, …, asin="B0…", —, 建议出价, enabled`；来源加 `Negative Product Targeting` |
| 否定 | `Negative Keyword, Create, 活动, 广告组, 搜索词, Negative Exact, , enabled`（ASIN 用 `Negative Product Targeting`） |
| 调价 | 关键词投放（exact / phrase / broad）→ `Keyword, Update, …, 投放词, Exact\|Phrase\|Broad, 参考出价, enabled`；其他 → `Product Targeting, Update, …`；暂停 → Bid 为空、State 为 `paused` |

导出文件需按亚马逊 Sponsored Products 批量操作模板生成；Campaign ID、Ad Group ID、Keyword ID 要用后台下载的批量表匹配后再上传（工具内提示）。

### 13.7 动作日志与上期回看（`prevCycle()`）

正式版：点“完成本周期”时把已勾选动作写入动作日志（周期 = A 期，含动作、对象、上下文、执行前指标、参考出价、置信度）。下一个周期读取上一个周期的日志，对比“执行前（上期 A）”与“执行后（本期 A）”。

> 原型没有日志，用 B 期数据推算“上期动作”。规则一致，可直接沿用：

```python
per = covA.n != covB.n; fa = 1/covA.n if per else 1; fb = 1/covB.n if per else 1
rS = (A.sales * fa) / (B.sales * fb)            # 整体销售变化，用于剔除全账户共同波动

降价（执行前 ACOS > T.acos × 1.1、有订单、点击 ≥ T.minC）：
    执行后无花费 → neu“已无花费”；无订单 → bad“无订单”
    ACOS 下降 > 5% → good“改善”；上升 > 5% → bad“变差”；否则 neu“持平”
提价（执行前订单 ≥ 2、ACOS ≤ T.acos × 0.7、点击 ≥ T.minC）：
    执行后无销售 → bad“无销售”；ACOS > T.acos → bad“ACOS 超标”
    rel = (sa / sb) / rS（sa、sb 为日均销售额）
    rel > 1.05 → good“跑赢整体”；rel < 0.9 → bad“跑输整体”；否则 neu“持平”
否定精准（执行前订单 0、点击 ≥ T.noConv，非 exact / asin）：
    执行后花费 < 0.5 → good“已止损”；否则 warn“仍有花费，需核实”
取执行前花费最高的 14 个。花费、销售额按日均展示（标注“日均”）。
```

结果分组：见效（good）、持平（neu）、需核实（warn）、变差（bad）。回看只作方向参考，不当作因果结论（未剔除季节、竞品、库存）。

## 14. Excel 导出

- 内容 = **分析范围内的完整活动明细**：全部来源活动行 × 29 个字段 + 标签 + 建议与依据。
- 不随清单视图（视图、标签、搜索、排序、隐藏列）缩减；导出弹层要写明这一点，并在清单被过滤时提示“清单当前只显示 n 个词，导出仍包含全部 m 个”。
- `loading || error` 时禁用。

29 个字段：关键词、标签、匹配方式；A 的 11 项指标；B 的 11 项指标；建议操作、广告组、投放词、关键词类型（11 项 = 曝光、点击、花费、销售额、订单、CTR、CVR、CPC、ACOS、ROAS、CPA）。原型额外的“变动”列是派生列，导出时可作为第 30 列（待决问题）。

## 15. 回归参考值

原型默认状态（项目“便携榨汁杯 · US”，搜索词报表，A = 2026-10-19 – 10-25（7/7 天），B = 2026-10-12 – 10-18（6/7 天，缺 10/12），默认规则）下的部分结果，可用于把原型当作“对照实现”做回归（方法见 `08`）：

| 项 | 值 |
| --- | --- |
| A / B 花费 | $2,049.55 / $1,741.88（日均 +0.9%） |
| A / B 销售额 | $6,284.73 / $6,862.00（日均 −21.5%） |
| A / B 订单 | 174 / 198 |
| A / B ACOS | 32.6% / 25.4% |
| 关键词数 | 171 |
| 销售额变动 | 新增 10、增长 8、下滑 11、消失 14、稳定 11 |
| 销售额拆解主因 | CVR 13.03% → 9.85%（−24.4%） |
| 周期候选（默认勾选） | 收割 9、否定 5、调价 22（降价 + 暂停 + 提价）；本周动作合计 36 |
| 上期回看 | 14 个动作：见效 4、持平 3、需核实 1、变差 6 |
