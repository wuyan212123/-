/**
 * 开品维度图谱 · 品类数据结构（字段说明）
 * selection_map/data/dimension_atlas/<id>.json 都符合 Category。样板：book.json（水彩本）。
 * 规范与最低要求见 docs/开品维度图谱规范.md；build_dimension_data.py 会按规范校验。
 * 已确认的品类数据不得随意改写；改名会断开关联（类型名、维度名、机会名、白地图 id 都是关联键）。
 */

export type DimTag = "L1" | "L2" | "L3" | "L0";          // L1 定义品类 / L2 规格变体 / L3 卖点差异 / L0 合规门槛（显示为“门槛”）
export type Vol = "主流" | "细分" | "小众";               // 市场体量
export type Comp = "hi" | "mid" | "lo";                    // 竞争：高 / 中 / 低
export type Flag = "m" | "s" | "t" | "u" | "j";            // 属性来源：厂家 / 卖家 / 评测 / 未披露 / 推断
export type VerdictLevel = "可做" | "可做（配套）" | "谨慎" | "不建议";
export type EvidenceLevel = "有来源" | "部分来源" | "经验判断";
export type LinkPair = [name: string, url: string];

export interface Category {
  id: string;            // 英文 id，如 "pen"
  name: string;          // 中文名，如 "针管笔"
  en: string;            // 英文副标题
  updated: string;       // 数据快照月份 "YYYY-MM"
  series?: string;       // 可选：所属系列，如 "颜料"、"画架"。同系列在标签栏归组，并显示“系列总览”
  pos?: string;          // 可选：一句话定位，显示在系列总览卡片里
  scope: { def: string; include: string; exclude: string; adjacent: string; kw?: string[] };
  rules: string[];       // 本品类专用登记规则
  dims: DimGroup[];      // ② 分类维度（固定三组：产品本体 / 销售形态 / 市场定位）
  types: TypeGroup[];    // ① 在售类型（已观察）
  opps: Opportunity[];   // ③ 缺口与机会（假设）
  grids: GridView[];     // 白地图视图
  refs: Record<string, LinkPair>;  // 参考商品（示例商品和白地图格子共用）
  src: Record<string, LinkPair>;   // 来源（类型和机会的 ev 引用）
}

export interface DimGroup { g: string; about: string; cats: DimCat[] }
export interface DimCat { t: string; c: Dimension[] }            // t 如 "A 笔头结构"
export interface Dimension {
  t: string;             // 维度名（全品类内唯一，被 TypeItem.map 按名称引用）
  tag: DimTag;
  def?: string;          // 定义
  rule?: string;         // 判定 / 登记规则
  kw?: string[];         // 平台搜索关键词
  c: { t: string; n?: string }[];   // 取值（n 为备注）
}

export interface TypeGroup { g: string; about?: string; items: TypeItem[] }
export interface TypeItem {
  t: string;             // 类型名（被 Opportunity.from 和 GridCell.t 按名称引用）
  vol: Vol; volWhy?: string;
  combo: string[];       // 维度组合（展示为 chip）
  rep: string;           // 代表品牌 / 商品
  price: string; who: string;
  comp: Comp; compT: string;
  pain: string;          // 常见差评
  ev: string[];          // → src 的 key
  evl: EvidenceLevel;
  fig: FigSpec;          // 结构示意图
  ex: ([refKey: string, snapshot: string] | [string, string, string] | { n: string; u: string; s: string })[];
                         // 示例商品。数组形式 = [refs 的 key, 快照说明]，渲染前展开为 {n,u,s}
  map: ([dimName: string, value: string] | [dimName: string, value: string, flag: Flag])[];  // 对应分类维度
  pros: string[]; cons: string[]; up: string[];
  verdict: [VerdictLevel, string];
  must: string[]; plus: string[]; avoid: string[];   // 新品属性清单
}

export interface FigSpec {
  k: "pens" | "dual" | "kit" | "spring" | "erase" | "refill" | "brush" | "pad" | "multi" | "book" | "block" | "cards" | "accordion" | "workbook" | "bookkit" | "pans" | "tubes" | "cups" | "bottles" | "droppers" | "easel" | "sticks" | "stand";
  /** k = "stand"（画架 / 画箱 / 画柜）时必填：aframe | hframe | crank | flat | easelcab | tripod | wc | pochade | french | kit | cn | tablebox | tableh | tablea | tablemetal | board | kids | kidstable | display | displaywood | mini | artbox | toolbox | taboret | flatfile | rack | dryrack | roll */
  v?: string;
  /** k = "stand"、v = "french" 时可选：true 画成铝合金腿 */
  alu?: boolean;
  [opt: string]: unknown;   // 见 src/engine/figs.js
}

export interface Opportunity {
  t: string;             // 机会名（被 GridCell.o 按名称引用）
  state?: "clue" | "out";// 不填 = 正常打分；clue = 线索（不打分）；out = 已排除
  gap: string;           // 缺口类型
  score?: Score;         // 正常机会必填；线索、已排除不填
  why: string;           // 缺口依据（已排除时为“最初的判断”）
  outWhy?: string;       // 已排除必填：排除原因
  spec: string[];        // 机会品维度组合
  diff?: string; price?: string; risk?: string; verify?: string;
  from: string;          // 对标的在售类型名，多个用“、”分隔
  ev: string[]; evl: EvidenceLevel;
}
export interface Score { d: number; c: number; x: number; s: number; p: number; e: number }  // 均为 1–5 的整数

export interface GridView {
  id: string; name: string; q: string;   // q = “这张图回答：…”
  rowT: string; colT: string;
  cols: string[];
  rows: [rowName: string, cells: GridCell[]][];   // 每行格数 = cols.length
  rk: string[];          // 每行的英文搜索词（长度 = 行数）
  ck?: string[];         // 每列的英文搜索词
  rc?: string[]; cc?: string[];   // 京东搜索用中文词
  price?: string[];      // 列为价格带时，Amazon p_36 筛选值（美分），长度 = 列数
}
/** 代码：第 1 位供给 R 红海 / S 有供给 / L 稀少 / E 空白 / X 不成立；第 2 位需求 3 强 / 2 中 / 1 弱 / 0 待验证（X 可省略） */
export type GridCell = [code: string, note: string, opts?: {
  r?: string[];          // → refs 的 key
  k?: string[];          // 验证关键词
  o?: string;            // 关联机会名
  t?: string[];          // 关联类型名
  tier?: [0|1|2, 0|1|2, 0|1|2];   // 低 / 中 / 高价位：无 / 少量 / 较多
  ev?: EvidenceLevel; d?: string; clue?: boolean;
}];
