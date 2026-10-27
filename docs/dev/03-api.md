# 03 · 后端接口与数据结构（建议契约）

本章给出前端改版需要的接口。**现有接口已覆盖的，保留现有路径与字段，只补齐缺少的字段**；新增接口按本章实现。所有接口前缀 `/api`，JSON，UTF-8，日期为 `YYYY-MM-DD`（首尾都计入），金额为数字（不带币种符号，币种由项目给出）。

## 1. 公共类型

```ts
type Source = 'term' | 'target';
type MatchType = 'auto' | 'broad' | 'phrase' | 'exact' | 'asin';
type Tone = 'good' | 'warn' | 'bad' | 'neu';

interface DateRange { s: string; e: string }
interface ScopeFilters { campaigns: string[]; adgroups: string[]; match: MatchType[]; target: string; term: string }
interface Scope { source: Source; A: DateRange; B: DateRange; f: ScopeFilters }

interface Base { impr: number; clicks: number; orders: number; spend: number; sales: number }
interface Metrics extends Base {
  ctr: number | null; cvr: number | null; cpc: number | null;
  acos: number | null; roas: number | null; cpa: number | null;   // null = 不可计算
}
interface Coverage { n: number; days: number; miss: string[]; inData: number }

type Tag = 'ACOS恶化' | 'ACOS超目标' | '高点击无转化' | '消失' | '可放大' | '核心词'
         | 'CTR提升' | 'CVR提升' | '新增' | '活动分化' | '样本不足';
type KwType = '通用词' | '长尾词' | '品牌词' | '竞品词' | 'ASIN' | '自动投放';

interface Suggestion {
  action: string; obj: { camp: string; ag: string; target: string; match: MatchType };
  fact: string; conds: string[]; risk: string; pri: 'hi' | 'mid' | 'lo'; kind: 'risk' | 'opp';
}
interface KeywordRow {           // 来源活动行
  rowId: string; camp: string; ag: string; target: string; term: string; match: MatchType;
  a: Metrics; b: Metrics; tags: Tag[];
}
interface Keyword {
  key: string; kwtype: KwType; A: Metrics; B: Metrics; tags: Tag[]; sugg: Suggestion[];
  matches: MatchType[]; camps: string[]; ags: string[]; targets: string[];
  rows: KeywordRow[];            // 按 A 花费降序
}
interface Rules {
  acos: number; cpa: number; minClicks: number; minImpr: number; chg: number; noConv: number; newMode: boolean;
  be: number; harvestMin: number; up: number; noOrdDown: number; maxDown: number; lag: number;
  brand: string[]; comp: string[];
  harvestTarget?: { exact: { camp: string; ag: string }; asin: { camp: string; ag: string } };   // 新增，见 08 待决问题
}
interface ApiError { code: string; message: string; detail?: unknown }   // message 直接给用户看，写清原因与处理办法
```

### 1.1 范围指纹与旧结果保护

- 所有分析类响应都带 `scopeHash`（对 `projectId + scope + rules 版本 + 数据版本` 的哈希）与 `computedAt`。
- 前端把成功响应的范围记为 `shown`。导出、生成报告、完成周期等写操作必须带上 `scopeHash`；后端发现与当前数据版本不一致时返回 `409 STALE_SCOPE`，前端提示“结果已过期，请刷新后再导出”。
- 前端在范围变化时取消上一次未完成的请求（AbortController），只接受最后一次请求的结果。

## 2. 项目

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/projects?q=` | 列表；`q` 匹配名称、ASIN、SKU |
| POST | `/projects` | 新建：`{name, product, site, asin, sku, note}` |
| PATCH | `/projects/{id}` | 编辑 |
| DELETE | `/projects/{id}` | 删除（连同归档文件、明细、报告、项目规则）；返回删除计数 |

```ts
interface Project {
  id: string; name: string; product: string; site: string; asin: string; sku: string; note: string;
  currency: string;               // 由站点决定，如 '$'、'€'
  dataFrom: string | null; dataTo: string | null;   // 数据覆盖起止，dataTo 即“数据截至日”
  coverDays: number; files: number; reports: number;
}
```

## 3. 数据导入与归档

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/projects/{id}/imports/preview` | multipart 多文件；识别类型、粒度、日期，返回每个文件的预览，**不写库** |
| PATCH | `/projects/{id}/imports/{previewId}/files/{fileId}` | 为缺少日期的文件补充 `{s, e}`，返回该文件新的预览 |
| POST | `/projects/{id}/imports/{previewId}/commit` | 确认导入：`{fileIds: string[]}`（可跳过待补充的文件）；返回结果汇总 |
| GET | `/projects/{id}/archives` | 归档台账 |
| DELETE | `/projects/{id}/archives/{archiveId}` | 删除归档；请求体 `{confirm: true}`；返回受影响明细行数 |
| GET | `/projects/{id}/coverage` | 每种来源的逐日覆盖，用于数据中心覆盖日历与日期弹层 |

```ts
interface ImportFilePreview {
  fileId: string; fileName: string;
  reportType: Source | null;                 // 识别不出时为 null
  grain: 'daily' | 'period';
  range: DateRange | null; days: number | null; rows: number;
  status: 'ok' | 'needRange' | 'error';
  counts: { add: number; update: number; same: number; reject: number };
  rejects: { rows: string; reason: string }[];   // 例：{rows: '第 214、215 行', reason: '花费为负数'}
  notes: string[];                               // 例：'10/01–10/18 与已归档记录重叠：按“日期 + 业务对象”更新，不会重复累加'
}
interface ImportResult { add: number; update: number; same: number; reject: number; dataTo: string; failedFile?: string; error?: string }
interface Archive {
  id: string; fileName: string; reportType: Source; range: DateRange; grain: 'daily' | 'period';
  coverDays: number; periods: number | null; rows: number; uploadedAt: string; status: 'ok' | 'missingDays'; note: string;
}
interface CoverageMap { from: string; to: string; term: ('ok' | 'miss' | 'none')[]; target: ('ok' | 'miss' | 'none')[] }
```

导入规则（保持现有）：重复导入不重复累加；以日期 + 业务对象为单位更新；本次文件没有出现的旧记录不删除；原文件与来源行号保留。导入失败时**不写入任何数据**。

## 4. 规则与 AI 配置

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET / PUT | `/projects/{id}/rules` | 项目级规则（`Rules`）。PUT 成功后该项目的分析缓存失效 |
| GET / PUT | `/ai-config` | 所有项目共用：`{provider, model, apiKeyMasked, saved: boolean, verifiedAt: string \| null}`；Key 只保存在本机后端 |
| POST | `/ai-config/test` | 测试连接，成功后写入 `verifiedAt`；失败返回 `ApiError` |

## 5. 分析

### 5.1 主分析（关键词页、总览、周期、报告共用）

`POST /projects/{id}/analysis`，请求体 `{ scope: Scope, include?: ('rows' | 'daily')[] }`。

```ts
interface AnalysisResult {
  scopeHash: string; computedAt: string; dataTo: string;
  A: Metrics; B: Metrics; covA: Coverage; covB: Coverage; hasB: boolean;
  nRows: number;                        // 明细行数
  tagCount: Partial<Record<Tag, number>>;
  keywords: Keyword[];                  // include 含 'rows' 时带来源活动行
  dimensions: { campaigns: string[]; adgroups: string[] };   // 筛选弹层的选项
}
```

### 5.2 日序列

`POST /projects/{id}/analysis/daily`，`{scope, from, to}` → `{days: {date: string; m: Metrics | null}[]}`（缺日为 `null`，不补零）。总览趋势图默认 `from = min(A.s, B.s) − 7`，`to = max(A.e, B.e)`。

### 5.3 变化拆解

`POST /projects/{id}/analysis/decompose`，`{scope, kind: 'sales' | 'spend' | 'acos', key?: string}` → `Decomposition | null`。

```ts
interface Decomposition {
  kind: 'sales' | 'spend' | 'acos'; tA: number; tB: number; per: boolean; unit: 'money' | 'pt';
  steps: { l: string; a: number; b: number; chg: number; v: number }[];   // v 为贡献，Σv = tA − tB
}
```

总览“本期结论”需要的三种拆解可在 5.1 的响应里一并返回（字段 `decomp: {sales, spend, acos}`），减少请求数。

### 5.4 复盘分析

`POST /projects/{id}/review`，`{scope, parts: ('weekly' | 'movement' | 'structure' | 'weekday')[], exclude_events?: boolean}`。

```ts
interface WeekBlock { s: string; e: string; n: number; inA: boolean; inB: boolean }
interface ReviewResult {
  scopeHash: string;
  blocks: WeekBlock[];                                                  // 12 段
  weekly?: {
    total: Metrics[];                                                   // 与 blocks 对齐
    camps: { name: string; A: Metrics; B: Metrics; w: Metrics[]; trend: [Tone, string] }[];
    topKeywords: { key: string; w: Metrics[] }[];                       // 近 12 周销售额前 20
  };
  movement?: {
    items: { key: string; mv: 'new'|'up'|'down'|'lost'|'flat'; a: number; b: number; d: number; r: number | null;
             per: boolean; cause: string }[];                          // 按销售额
    concentration: { top1: [number, number]; top5: [number, number]; top10: [number, number];
                     longtail: [number, number]; ordering: [number, number] };   // [A, B]
  };
  structure?: {
    match: { m: MatchType; A: Metrics; B: Metrics; weekly: number[] }[];   // weekly = 每周花费
    types: { t: KwType; n: number; A: Metrics; B: Metrics }[];
    nonBrand: { A: Metrics; B: Metrics }; brand: { A: Metrics };
    waste: { e: string; waste: number; total: number; p: number | null }[];   // 与 blocks 对齐
    cannibal: { key: string; spend: number; rows: { camp: string; ag: string; match: MatchType; a: Metrics; keep: boolean }[] }[];
    quad: { key: string; spend: number; acos: number | null; orders: number; seg: 'nos'|'low'|'hi'|'ok'|'star' }[];
  };
  weekday?: { from: string; to: string; events: string[]; excluded: boolean;
              days: (Metrics & { n: number })[]; total: Metrics & { n: number } };   // days 为周一…周日
}
```

变动的其他依据（订单 / 点击 / 花费）在关键词页由前端用 `Keyword.A/B` 按 `02` 第 7 节计算即可，不需要单独接口。

## 6. 人工判断（新增）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/projects/{id}/decisions?cycle=A.s..A.e` | 本期判断列表 |
| PUT | `/projects/{id}/decisions/{key}` | `{st: 'adopt' \| 'skip', action: string}`；服务端记录时间 |
| DELETE | `/projects/{id}/decisions/{key}` | 撤销 |
| POST | `/projects/{id}/decisions/bulk` | `{keys: string[], st}`（批量操作条） |

```ts
interface Decision { key: string; st: 'adopt' | 'skip'; action: string; at: string; cycle: DateRange }
```

## 7. 周期优化（新增）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/projects/{id}/cycle` | `{scope}` → 窗口检查、收割、否定、调价候选、默认勾选、影响估算 |
| PUT | `/projects/{id}/cycle/selection` | `{scopeHash, sel: Record<actionId, boolean>}` 保存勾选覆盖 |
| POST | `/projects/{id}/cycle/export/bulk` | `{scopeHash}` → 亚马逊批量操作表 `.xlsx` |
| POST | `/projects/{id}/cycle/export/log` | `{scopeHash}` → 动作日志 `.csv` |
| POST | `/projects/{id}/cycle/complete` | `{scopeHash}` → 写入动作日志，标记本周期完成；返回 `{completedAt}` |
| GET | `/projects/{id}/cycle/previous?A=s..e` | 上期动作回看（读取上一周期日志，与本期 A 对比） |

```ts
type Conf = 'high' | 'mid' | 'low';
interface Harvest { id: string; key: string; asin: boolean; a: Metrics; rpc: number; bid: number;
                    from: { camp: string; ag: string; match: MatchType }[]; to: { camp: string; ag: string }; conf: Conf }
interface Negative { id: string; key: string; row: { camp: string; ag: string; match: MatchType }; a: Metrics;
                     asin: boolean; brand: boolean; comp: boolean; allZero: boolean; nCamp: number; waste: number; conf: Conf }
interface BidItem { id: string; kind: 'down'|'down0'|'pause'|'up'|'keep'|'watch'; chg: number; ref: number | null;
                    g: { camp: string; ag: string; target: string; match: MatchType }; a: Metrics; why: string;
                    kwEnt: boolean; save: number; extra: number; conf: Conf }
interface CycleResult {
  scopeHash: string; week: number;                               // ISO 周
  checks: { tone: 'ok' | 'warn'; title: string; detail?: string; action?: 'window14' | 'srcTerm' | 'data' | 'rules' }[];
  harvest: Harvest[]; neg: Negative[]; bids: BidItem[];
  sel: Record<string, boolean>;                                  // 已保存的勾选覆盖
  impact: { h: number; n: number; down: number; pause: number; up: number; negSave: number; bidSave: number; upCost: number; total: number };
  completedAt: string | null;
}
interface PrevAction {
  act: '降价' | '提价' | '否定精准'; d: string; obj: string; ctx: string;
  m: 'acos' | 'sales' | 'spend'; bv: number | null; av: number | null; per: boolean;
  res: [Tone, string];                                           // 例：['good', '跑赢整体']
  executed?: boolean | null;                                     // 新增：是否已在后台执行（用户核对后填写）
}
```

动作 `id` 需稳定：收割 `h|{key}`，否定 `n|{rowId}`，调价 `b|{camp}|{ag}|{target}|{match}`。

## 8. 复盘报告（新增 / 改造）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/projects/{id}/reports/generate` | `{scope, type: 'weekly'\|'cmp'\|'kw', src: 'rule'\|'ai', sections?: string[]}` → `ReportDoc`（草稿，不入历史） |
| GET | `/projects/{id}/reports/draft` | 当前草稿（含运营补充、负责人、章节开关、确认状态） |
| PATCH | `/projects/{id}/reports/draft` | 局部更新：`{notes?, owners?, sections?, confirmed?}` |
| POST | `/projects/{id}/reports` | 保存到历史：把草稿和全部章节数据存为**快照**；之后不随数据变化 |
| GET | `/projects/{id}/reports` | 历史列表：`{id, title, type, A, B, src, model?, savedAt, confirmed}` |
| GET | `/projects/{id}/reports/{rid}` | 历史快照（`ReportDoc`） |
| GET | `/projects/{id}/reports/{rid}/markdown` | 导出 Markdown（草稿用 `draft/markdown`） |

```ts
interface ReportSection {
  id: 'sum'|'loop'|'why'|'trend'|'camp'|'kw'|'term'|'struct'|'ro'|'plan'|'learn'|'appx';
  no: number;                 // 在本报告中的序号（只计开启的章节）
  label: string;              // 章节名
  tone: Tone;                 // 需处理 / 需关注 / 正常 / 参考
  title: string;              // 结论句（可含 <em>、<em class="up">、<b>，前端白名单渲染）
  data: unknown;              // 该章节图表与列表需要的结构化数据，见 05-report.md
  md: string;                 // 该章节的 Markdown 正文（导出用）
  note?: string;              // 运营补充
}
interface ReportDoc {
  id?: string; projectId: string; type: 'weekly' | 'cmp' | 'kw'; src: 'rule' | 'ai'; model?: string;
  title: string;              // 例：W43 广告周报 / 10/19 – 10/25 对比 10/12 – 10/18
  scope: Scope; covA: Coverage; covB: Coverage; generatedAt: string; confirmed: boolean;
  sectionsOn: Record<string, boolean>; owners: Record<string, string>;
  sections: ReportSection[];
}
```

`src = 'ai'` 时：章节结构、数字、图表数据仍由规则计算；AI 只改写各节的 `title` 与要点文字，并在报告元信息中写明服务商与模型。未验证连接时拒绝生成（`412 AI_NOT_VERIFIED`）。

## 9. 导出

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/projects/{id}/exports/excel` | `{scopeHash}` → 分析范围内完整活动明细（29 字段 + 标签 + 建议与依据），见 `02` 第 14 节 |

所有导出接口在 `scopeHash` 过期时返回 409，在 `loading` 中由前端禁用。

## 10. 错误与状态码

| 状态码 | code | 场景 | 前端表现 |
| --- | --- | --- | --- |
| 400 | `INVALID_SCOPE` | 日期倒置、来源非法 | 弹层内提示，不发请求 |
| 404 | `NOT_FOUND` | 项目、归档、报告不存在 | 空状态 |
| 409 | `STALE_SCOPE` | 导出 / 生成时数据已变 | 提示刷新 |
| 412 | `AI_NOT_VERIFIED` | AI 未验证 | 提示去分析规则测试连接 |
| 422 | `IMPORT_UNRECOGNIZED` | 文件无法识别 | 导入失败横幅，写明文件名、行号与缺少的列 |
| 500 / 超时 | `ANALYSIS_FAILED` | 分析服务异常 | 保留旧结果 + “更新失败 · 重试”横幅；首次加载失败显示“读取分析结果失败”空状态 |
