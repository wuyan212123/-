/* ======================================================================
   品类数据：画柜（画架系列）
   结构说明见 _template.js。数据快照：2026-11
   ====================================================================== */
CATS.push({
id:"artCabinet", name:"画柜", en:"Studio Storage · Taboret · Flat File · Canvas Rack · Drying Rack", updated:"2026-11",
series:"画架", pos:"画室家具：边柜推车放颜料工具，图纸柜放纸和作品，画布架、晾画架放画；大件、运费高",

scope:{
  def:"画室里收纳画材和作品的家具：画室边柜 / 推车（Taboret）、平面图纸柜（Flat File）、画布收纳架、晾画架，以及画架 + 收纳柜一体款。",
  include:"上述家具单卖和组合。",
  exclude:"手提画箱、画材箱（见画箱）；通用书柜、文件柜、厨房推车。",
  adjacent:"画桌 / 绘图桌、画包、作品夹、通用三层推车。",
  kw:["artist taboret","art cart","flat file cabinet","canvas storage rack","art drying rack","画柜","画材收纳柜","晾画架"]
},

rules:[
  "按结构分：画室边柜 / 推车、平面图纸柜、画布收纳架、晾画架、画架 + 收纳柜一体、国内画室收纳柜。",
  "尺寸按页面原样记（宽 × 深 × 高）；图纸柜额外记抽屉内尺寸和可放最大纸张（如 36×48\"）。",
  "晾画架记层数和每层承重（如 25 层、每层 4 lbs；50 层、每层 2 lbs），不要只记总层数。",
  "画布收纳架记可放画布尺寸范围（如 14–48\"、10–40\"）和总承重（如 130 lbs）。",
  "推车记层数、抽屉数、是否带调色盘 / 洗笔杯 / 笔架、轮子是否可锁。",
  "页面描述过于简单的（如 SDRFQQO 画架柜）记“描述不足”，不要推断结构。"
],

dims:[
 {g:"产品本体", about:"家具本身：结构、材质、尺寸、承重、功能件。", cats:[
  {t:"A 结构与材质", c:[
   {t:"结构类型", tag:"L1", c:[{t:"画室边柜 / 推车",n:"GDLF、MEEDEN、Artograph"},{t:"平面图纸柜",n:"Diversified Spaces、AdirOffice"},{t:"画布收纳架",n:"UNZERO、lukar、Evellstor"},{t:"晾画架",n:"U.S. Art Supply、VsoxA"},{t:"画架 + 收纳柜一体",n:"SDRFQQO、ARTIFY"},{t:"国内画室收纳柜"}]},
   {t:"材质", tag:"L1", c:[{t:"榉木",n:"推车、画布架"},{t:"硬木 / 板材",n:"图纸柜"},{t:"钢（粉末喷涂）",n:"Artograph、晾画架、钢制图纸柜"},{t:"铁 / 金属线"}]}]},
  {t:"B 尺寸与承重", c:[
   {t:"规格", tag:"L2", c:[{t:"桌面 / 小型"},{t:"中型（家用）"},{t:"大型（画室 / 教室）"}]},
   {t:"图纸柜最大纸张", tag:"L2", c:[{t:"≤ A3"},{t:"≤ 24×36\""},{t:"≤ 36×48\"",n:"AdirOffice"}]},
   {t:"画布尺寸范围", tag:"L2", c:[{t:"7.8–23\"",n:"桌面画布架"},{t:"10–40\"",n:"金属画布架"},{t:"14–48\"",n:"Evellstor"},{t:"≤ 60\" 以上"}]},
   {t:"晾画架层数", tag:"L2", c:[{t:"15–20 层"},{t:"25 层"},{t:"40–50 层"}]},
   {t:"每层承重", tag:"L3", def:"晾画架每层承重普遍低。", c:[{t:"≤ 2 lbs",n:"VsoxA 50 层"},{t:"3–4 lbs",n:"U.S. Art Supply 25 层"},{t:"5 lbs 以上"},{t:"未披露"}]},
   {t:"总承重", tag:"L3", c:[{t:"≤ 50 lbs"},{t:"50–150 lbs",n:"Evellstor 130 lbs"},{t:"未披露"}]}]},
  {t:"C 功能件", c:[
   {t:"抽屉与层板", tag:"L2", c:[{t:"2 抽"},{t:"3 抽"},{t:"5–7 抽",n:"图纸柜"},{t:"3–5 层开放层板"}]},
   {t:"作画功能件", tag:"L2", def:"推车上是否能直接调色、洗笔。", c:[{t:"钢化玻璃调色盘",n:"GDLF"},{t:"洗笔杯 + 笔架",n:"GDLF、MEEDEN"},{t:"可升降台面",n:"MEEDEN"},{t:"侧托盘",n:"MEEDEN"},{t:"无"}]},
   {t:"移动", tag:"L3", c:[{t:"带锁万向轮"},{t:"普通轮"},{t:"固定 / 壁挂"}]},
   {t:"纸张保护", tag:"L3", c:[{t:"压纸条（前后）",n:"AdirOffice"},{t:"抽屉底孔（方便取纸）"},{t:"防尘罩"},{t:"无"}]}]},
  {t:"D 合规", c:[
   {t:"安全与合规", tag:"L0", c:[{t:"防倾倒（高柜需固定墙面）"},{t:"Prop 65 警示"},{t:"低排放涂层",n:"Diversified Spaces UV 涂层"}]}]}
 ]},
 {g:"销售形态", about:"怎么卖：组装、运输。", cats:[
  {t:"E 组装与组合", c:[
   {t:"组装状态", tag:"L3", c:[{t:"整装"},{t:"需组装"},{t:"可叠放",n:"AdirOffice 图纸柜"}]},
   {t:"销售组合", tag:"L3", c:[{t:"单件"},{t:"可组合扩展（两架拼接到 72\"）"},{t:"画架 + 柜一体"}]}]}
 ]},
 {g:"市场定位", about:"卖给谁、用在哪。", cats:[
  {t:"F 场景与人群", c:[
   {t:"使用场景", tag:"L3", c:[{t:"家用画室"},{t:"小户型"},{t:"学校课堂"},{t:"专业画室 / 工作室"},{t:"国内画室 / 艺考"}]},
   {t:"目标人群", tag:"L3", c:[{t:"成人爱好者"},{t:"专业画家"},{t:"老师 / 学校采购"},{t:"画室经营者"}]},
   {t:"价格带", tag:"L2", c:[{t:"< $50"},{t:"$50–150"},{t:"$150–400"},{t:"$400 以上"}]}]}
 ]}
],

types:[
 {g:"工具收纳", about:"边柜、推车", items:[
  {t:"画室边柜 / 推车（Taboret）", vol:"细分", volWhy:"GDLF、MEEDEN（多款）、Artograph 钢制款、5 层榉木推车在售。",
   combo:["画室边柜 / 推车","榉木 / 钢","2–3 抽 + 层板","带锁万向轮","调色盘 / 洗笔杯"],
   rep:"GDLF 榉木推车（2 抽 + 钢化玻璃调色盘 + 2 个洗笔杯 + 笔架，39.4\" 宽）、MEEDEN 加大 5 层推车（3 抽 + 侧托盘）、MEEDEN 可升降台面推车、Artograph 钢制推车（3 层 18×18\" 可翻转层板）、5 层榉木推车（3 抽）",
   price:"US $80–300", who:"家用画室、专业画家", comp:"mid", compT:"中：MEEDEN 等",
   pain:"尺寸差异大，有的比想象小；需组装", ev:["taboretLink"], evl:"有来源",
   fig:{k:"stand",v:"taboret"},
   ex:[["gdlf","2 抽 + 玻璃调色盘 + 洗笔杯 + 笔架"],["meedenCart5","5 层，3 抽，侧托盘"],["meedenTaboret","可升降台面，带锁轮"],["artograph","钢制，3 层可翻转层板"]],
   map:[["结构类型","画室边柜 / 推车"],["材质","榉木 / 钢（粉末喷涂）"],["抽屉与层板","2 抽 / 3 抽 / 3–5 层开放层板"],["作画功能件","钢化玻璃调色盘、洗笔杯 + 笔架、可升降台面","m"],["移动","带锁万向轮","m"],["价格带","$150–400"]],
   pros:["画画时工具在手边"], cons:["占地、贵"], up:["小户型、平价工作台款"], verdict:["谨慎","对应 ③ C。"], must:["写明尺寸"], plus:["调色盘、洗笔杯"], avoid:["尺寸不清"]},
  {t:"画架 + 收纳柜一体", vol:"小众", volWhy:"SDRFQQO 画架柜（4 层，描述简单）、ARTIFY H 架 + 抽屉在售。",
   combo:["画架 + 收纳柜一体","木"],
   rep:"SDRFQQO 画架 + 4 层收纳柜（描述不足）、ARTIFY H 架 + 抽屉 + 层板",
   price:"US $100–250", who:"小空间画室", comp:"lo", compT:"低",
   pain:"描述不足，难判断结构", ev:["easelCab"], evl:"部分来源",
   fig:{k:"stand",v:"easelcab"},
   ex:[["sdrfqqo","4 层收纳柜，描述不足","u"],["artifyC","H 架 + 抽屉 + 层板"]],
   map:[["结构类型","画架 + 收纳柜一体"],["销售组合","画架 + 柜一体"]],
   pros:["省地方"], cons:["选择少"], up:["见落地画架 ③ C"], verdict:["谨慎","机会已在落地画架里记录。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"作品收纳", about:"纸、画布、湿画", items:[
  {t:"平面图纸柜（Flat File）", vol:"细分", volWhy:"Diversified Spaces（木质，5 抽 / 7 抽 + 3 层）、AdirOffice 钢制 5 抽（≤ 36×48\"）在售。",
   combo:["平面图纸柜","硬木 / 钢","5–7 抽","≤ 24×36\" – 36×48\""],
   rep:"Diversified Spaces 大幅面 5 抽（40.5\" 宽，抽屉内 37×24.8×1.5\"）、Diversified Spaces 7 抽 + 3 层（48×30×84\"，可上锁）、AdirOffice 钢制 5 抽（41×53\"，≤ 36×48\"，可叠放）",
   price:"US $300–2,000", who:"专业画家、学校、建筑设计", comp:"mid", compT:"中：办公家具品牌",
   pain:"大、贵、重；家用尺寸少", ev:["flatFileLink"], evl:"有来源",
   fig:{k:"stand",v:"flatfile"},
   ex:[["dsFlat5","5 抽，40.5\" 宽，木质"],["dsFlat7","48×30×84\"，7 抽 + 3 层，可上锁"],["adirFlat","钢制 5 抽，≤ 36×48\"，压纸条，可叠放"]],
   map:[["结构类型","平面图纸柜"],["材质","硬木 / 板材 / 钢（粉末喷涂）"],["图纸柜最大纸张","≤ 36×48\"","m"],["抽屉与层板","5–7 抽"],["纸张保护","压纸条（前后）、抽屉底孔（方便取纸）","m"],["价格带","$400 以上"]],
   pros:["纸张平放不卷"], cons:["大、贵"], up:["家用小型（A3 / A2）"], verdict:["可做","对应 ③ B“家用小型平面图纸柜”。"], must:["写明抽屉内尺寸"], plus:["压纸条"], avoid:["—"]},
  {t:"画布收纳架", vol:"细分", volWhy:"UNZERO、lukar、NinPeen、Evellstor、桌面画布架、Somime 木质画布架在售。",
   combo:["画布收纳架","榉木 / 铁","画布 10–48\"","带锁轮"],
   rep:"Evellstor 9 格榉木（14–48\"，130 lbs）、lukar 金属（10–40\"，9 格）、UNZERO（带提手和轮）、桌面画布架（7.8–23\"）、Somime 大号木质画布架（兼晾干）",
   price:"US $50–200", who:"画室、画廊", comp:"mid", compT:"中",
   pain:"大画布放不下；格距不合适", ev:["canvasRackLink"], evl:"有来源",
   fig:{k:"stand",v:"rack"},
   ex:[["evellstor","9 格，14–48\"，130 lbs"],["lukar","金属，10–40\"，9 格"],["unzero","带提手和轮"],["somimeRack","大号木质，兼晾干"]],
   map:[["结构类型","画布收纳架"],["画布尺寸范围","10–40\" / 14–48\"","s"],["总承重","50–150 lbs","s"],["移动","带锁万向轮"],["销售组合","可组合扩展（两架拼接到 72\"）"]],
   pros:["画布竖放省地"], cons:["—"], up:["—"], verdict:["谨慎","已有多款。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"晾画架", vol:"细分", volWhy:"U.S. Art Supply 25 层、VsoxA 50 层、UWYTGF 40 层、桌面 20 层、壁挂款在售，主要卖给学校。",
   combo:["晾画架","钢 / 金属线","15–50 层","带轮 / 桌面 / 壁挂"],
   rep:"U.S. Art Supply 25 层（每层 4 lbs，可壁挂）、VsoxA 50 层（每层 2 lbs）、UWYTGF 40 层、桌面 20 层（A3）、壁挂 20 层",
   price:"US $60–200", who:"学校、画室、家长", comp:"mid", compT:"中",
   pain:"每层承重低（2–4 lbs），只能放纸、薄画板", ev:["dryRackLink"], evl:"有来源",
   fig:{k:"stand",v:"dryrack"},
   ex:[["usasDry25","25 层，每层 4 lbs，可壁挂"],["vsoxa50","50 层，每层 2 lbs"],["dryTable20","桌面 20 层，A3"],["dryWall","壁挂 20 层"]],
   map:[["结构类型","晾画架"],["晾画架层数","25 层 / 40–50 层 / 15–20 层"],["每层承重","≤ 2 lbs / 3–4 lbs","m"],["移动","带锁万向轮 / 固定 / 壁挂"],["使用场景","学校课堂"]],
   pros:["课堂刚需"], cons:["承重低"], up:["承重升级"], verdict:["谨慎","对应 ③ C“每层承重升级的晾画架”。"], must:["写明每层承重"], plus:["—"], avoid:["—"]}
 ]},
 {g:"国内", about:"画室收纳", items:[
  {t:"国内画室收纳柜 / 推车", vol:"细分", volWhy:"京东有画材收纳柜、画室推车、画板收纳架等多款。",
   combo:["国内画室收纳柜","板材 / 铁","多层"],
   rep:"画材收纳柜、画室推车、画板收纳架（京东多店铺）",
   price:"¥100–800", who:"画室经营者、家庭", comp:"mid", compT:"中",
   pain:"—", ev:["jdCab"], evl:"部分来源",
   fig:{k:"stand",v:"taboret",label:"画室收纳柜"},
   ex:[["jdCab","京东：画材收纳柜"],["jdCart","京东：画室推车"]],
   map:[["结构类型","国内画室收纳柜"],["使用场景","国内画室 / 艺考"]],
   pros:["—"], cons:["—"], up:["—"], verdict:["谨慎","证据不足。"], must:["—"], plus:["—"], avoid:["—"]}
 ]}
],

opps:[
 {t:"家用小型平面图纸柜（A3 / A2）", gap:"价格带缺口", score:{d:3,c:4,x:3,s:3,p:3,e:2},
  why:"水彩纸、版画、作品需要平放不卷。现有平面图纸柜面向学校和设计院：40–53\" 宽、可放 36×48\"，木质和钢制都偏大、偏贵。家用 A3 / A2、能放书桌下或叠放的小型图纸柜少。",
  spec:["平面图纸柜","A2 抽屉内尺寸","5 抽","可叠放","压纸条"], diff:"“放在书桌下的作品柜”", price:"US $150–250",
  risk:"大件运费；需求可能偏小", verify:"拉 small flat file cabinet、art paper storage drawers 的搜索量和价格分布",
  from:"平面图纸柜（Flat File）", ev:["flatFileLink"], evl:"部分来源"},
 {t:"小户型画室工作台推车", gap:"场景缺口", score:{d:3,c:3,x:3,s:3,p:3,e:2},
  why:"GDLF 已有“抽屉 + 玻璃调色盘 + 洗笔杯”的推车，但宽 39.4\"，占地；小户型需要更窄、能推到桌边的工作台推车。",
  spec:["画室边柜 / 推车","宽 ≤ 24\"","玻璃调色盘","洗笔杯","3 层 + 2 抽","带锁轮"], diff:"“推到哪里都能调色”", price:"US $90–130",
  risk:"和通用三层推车竞争", verify:"拉 art cart with drawers、artist taboret 搜索量；看 GDLF 评论",
  from:"画室边柜 / 推车（Taboret）", ev:["taboretLink"], evl:"部分来源"},
 {t:"每层承重升级的晾画架", gap:"痛点缺口", score:{d:2,c:3,x:3,s:4,p:3,e:3},
  why:"晾画架每层承重只有 2–4 lbs，只能放纸和薄画板；学生的画布板、厚纸板作品放不了。",
  spec:["晾画架","每层 ≥ 6 lbs","20–25 层","可放 A3 画布板"], diff:"承重数字对比", price:"US $90–140",
  risk:"学校采购价格敏感", verify:"抓晾画架差评里 bent / weak / sag 的占比",
  from:"晾画架", ev:["dryRackLink"], evl:"有来源"},
 {t:"国内画室一体收纳柜（颜料 + 画板 + 画架）", state:"clue", gap:"场景缺口",
  why:"国内画室需要同时收纳颜料、画板、画架，但没有找到直接证据说明需求量和现有供给。",
  spec:["多层收纳柜","画板竖格"], verify:"在京东 / 1688 搜“画室收纳柜”看销量", from:"国内画室收纳柜 / 推车", ev:["jdCab"], evl:"经验判断"},
 {t:"家用小型晾画架", state:"out", gap:"场景缺口",
  why:"最初判断晾画架只有教室用的大号款。",
  outWhy:"核实后已有桌面 20 层（A3）和壁挂 20 层款。",
  spec:["晾画架","桌面 / 壁挂"], from:"晾画架", ev:["dryRackLink"], evl:"有来源"}
],

grids:[
 {id:"size",name:"结构 × 规格",q:"每种结构在哪个规格上还没人做？",rowT:"结构类型",colT:"规格",
  cols:["桌面 / 小型","中型（家用）","大型（画室 / 教室）"],
  rk:["art cart taboret","flat file cabinet","canvas storage rack","art drying rack"], ck:["small","home","large"],
  rc:["画室 推车","图纸柜","画布 收纳架","晾画架"], cc:["小号","家用","大号"],
  rows:[
   ["边柜 / 推车",[["S1","—"],["S3","MEEDEN、GDLF",{r:["meedenTaboret","gdlf"],t:["画室边柜 / 推车（Taboret）"]}],["S2","MEEDEN 加大、Artograph",{r:["meedenCart5","artograph"]}]]],
   ["平面图纸柜",[["L2","家用小型少",{o:"家用小型平面图纸柜（A3 / A2）",k:["small flat file cabinet"],ev:"部分来源"}],["L2","—",{r:["dsFlat5"],o:"家用小型平面图纸柜（A3 / A2）"}],["S3","Diversified Spaces、AdirOffice",{r:["dsFlat7","adirFlat"],t:["平面图纸柜（Flat File）"]}]]],
   ["画布收纳架",[["S2","桌面款 7.8–23\"",{r:["canvasTable"]}],["R3","lukar、UNZERO",{r:["lukar","unzero"],t:["画布收纳架"]}],["S2","Evellstor、Somime",{r:["evellstor","somimeRack"]}]]],
   ["晾画架",[["S2","桌面 20 层、壁挂",{r:["dryTable20","dryWall"],o:"家用小型晾画架"}],["S2","—"],["R3","25–50 层",{r:["usasDry25","vsoxa50"],t:["晾画架"]}]]]]},

 {id:"price",name:"结构 × 价格带",q:"每种结构在哪个价位还空着？",rowT:"结构类型",colT:"售价（美国站）",
  cols:["< $50","$50–150","$150–400","$400+"], price:["0-5000","5000-15000","15000-40000","40000-1000000"],
  rk:["art cart taboret","flat file cabinet","canvas storage rack","art drying rack"],
  rc:["画室 推车","图纸柜","画布 收纳架","晾画架"], cc:["","","",""],
  rows:[
   ["边柜 / 推车",[["S1","通用推车"],["L2","窄型工作台推车少",{o:"小户型画室工作台推车",ev:"部分来源"}],["S3","—",{r:["gdlf","meedenCart5"]}],["S1","—",{r:["artograph"]}]]],
   ["平面图纸柜",[["X","—"],["X","—"],["L3","家用小型少",{o:"家用小型平面图纸柜（A3 / A2）",ev:"部分来源"}],["S3","—",{r:["dsFlat5","adirFlat"]}]]],
   ["画布收纳架",[["S2","桌面款",{r:["canvasTable"]}],["R3","—",{r:["lukar","unzero","evellstor"]}],["S1","—"],["X","—"]]],
   ["晾画架",[["S1","桌面",{r:["dryTable20"]}],["R3","—",{r:["usasDry25","vsoxa50"]}],["S1","—"],["X","—"]]]]},

 {id:"load",name:"晾画架 · 层数 × 每层承重",q:"晾画架有没有承重够的？",rowT:"层数",colT:"每层承重",
  cols:["≤ 2 lbs","3–4 lbs","5 lbs 以上"],
  rk:["art drying rack 20 shelves","art drying rack 25 shelves","art drying rack 50 shelves"], ck:["","","heavy duty"],
  rc:["晾画架 20层","晾画架 25层","晾画架 50层"], cc:["","","承重"],
  rows:[
   ["15–20 层",[["S1","—",{r:["dryTable20"]}],["S1","—",{r:["dryWall"]}],["L2","—",{o:"每层承重升级的晾画架"}]]],
   ["25 层",[["S1","—"],["S3","U.S. Art Supply 4 lbs",{r:["usasDry25"]}],["L3","承重够放画布板的少",{r:["usasDry25"],o:"每层承重升级的晾画架",ev:"有来源"}]]],
   ["40–50 层",[["S3","VsoxA 2 lbs",{r:["vsoxa50"]}],["S1","—"],["X","—"]]]]},

 {id:"scene",name:"使用场景 × 关键卖点",q:"每个场景最在意的卖点，有没有产品明确满足？",rowT:"使用场景",colT:"关键卖点",
  cols:["收纳量","可移动","占地小","承重","调色 / 洗笔","纸张平放"],
  rk:["home art studio storage","small space art storage","classroom art storage","professional studio storage","art studio storage cabinet"], ck:["storage","rolling","compact","heavy duty","palette","flat"],
  rc:["家用 画室 收纳","小户型 画材 收纳","教室 画材 收纳","画室 收纳柜","画室 收纳柜 一体"], cc:["收纳","带轮","小","承重","调色","平放"],
  rows:[
   ["家用画室",[["S3","—",{r:["meedenCart5"]}],["S3","—",{r:["meedenTaboret"]}],["S1","—"],["S1","—"],["S2","GDLF",{r:["gdlf"]}],["L3","家用图纸柜少",{r:["dsFlat5"],o:"家用小型平面图纸柜（A3 / A2）",ev:"部分来源"}]]],
   ["小户型",[["S1","—"],["S2","—"],["L3","工作台推车偏宽",{r:["gdlf"],o:"小户型画室工作台推车",ev:"部分来源"}],["S1","—"],["L2","—",{o:"小户型画室工作台推车"}],["L2","—",{o:"家用小型平面图纸柜（A3 / A2）"}]]],
   ["学校课堂",[["R3","晾画架",{r:["usasDry25","vsoxa50"]}],["S3","—"],["S2","—"],["L2","每层 2–4 lbs",{r:["usasDry25"],o:"每层承重升级的晾画架",ev:"有来源"}],["X","—"],["S2","—"]]],
   ["专业画室",[["S3","—",{r:["evellstor"]}],["S3","—"],["S1","—"],["S2","Evellstor 130 lbs",{r:["evellstor"]}],["S1","—"],["S3","—",{r:["adirFlat"]}]]],
   ["国内画室",[["S2","—",{r:["jdCab"]}],["S1","—",{r:["jdCart"]}],["S1","—"],["S1","—"],["S1","—"],["L0","一体收纳柜（未证实）",{r:["jdCab"],o:"国内画室一体收纳柜（颜料 + 画板 + 画架）",clue:true}]]]]}
],

refs:{
 gdlf:["GDLF 榉木画室推车（玻璃调色盘 + 洗笔杯）","https://www.amazon.com/dp/B0H3K1VGMS"], meedenCart5:["MEEDEN 加大 5 层画材推车","https://www.amazon.com/dp/B0GWHBXV1N"], meedenTaboret:["MEEDEN 可升降台面推车","https://www.amazon.com/clp/B09YQ1LWSX"], artograph:["Artograph 钢制推车","https://www.amazon.com/dp/B000OAR60I"], beech5:["5 层榉木推车（3 抽）","https://us.amazon.com/clp/B0GSXYJ53Z"],
 sdrfqqo:["SDRFQQO 画架 + 4 层收纳柜","https://www.amazon.com/dp/B0DCG5FSK9"], artifyC:["ARTIFY H 架 + 抽屉 + 层板","https://www.amazon.com/clp/B0BY1R1Y4D"],
 dsFlat5:["Diversified Spaces 5 抽图纸柜","https://www.amazon.com/clp/B09SNJVFKB"], dsFlat7:["Diversified Spaces 7 抽 + 3 层图纸柜","https://www.amazon.com/dp/B09SBTW19D"], adirFlat:["AdirOffice 钢制 5 抽图纸柜","https://www.amazon.com/dp/B0GTRX7CV8"],
 evellstor:["Evellstor 9 格画布收纳架（14–48\"）","https://www.amazon.com/dp/B0F536PMXD"], lukar:["lukar 金属画布收纳架","https://www.amazon.com/dp/B0CBC47HZ6"], unzero:["UNZERO 画布收纳架","https://www.amazon.com/dp/B0BXSXT58D"], canvasTable:["桌面画布收纳架（7.8–23\"）","https://www.amazon.com/dp/B0DJ6MXLRV"], somimeRack:["Somime 大号木质画布架（兼晾干）","https://www.amazon.com/dp/B0BVY5DZQV"],
 usasDry25:["U.S. Art Supply 25 层晾画架","https://www.amazon.com/dp/B0CTB58JN5"], vsoxa50:["VsoxA 50 层晾画架","https://www.amazon.com/dp/B0CTTS4ZDN"], dryTable20:["桌面 20 层晾画架","https://www.amazon.com/clp/B0F6LMHRZ1"], dryWall:["壁挂 20 层晾画架","https://www.amazon.com/dp/B0BPSMS88J"],
 jdCab:["京东 · 画材收纳柜（搜索页）","https://search.jd.com/Search?keyword=%E7%94%BB%E6%9D%90%E6%94%B6%E7%BA%B3%E6%9F%9C&enc=utf-8"], jdCart:["京东 · 画室推车（搜索页）","https://search.jd.com/Search?keyword=%E7%94%BB%E5%AE%A4%E6%8E%A8%E8%BD%A6&enc=utf-8"]
},

src:{
 taboretLink:["GDLF / MEEDEN 画室推车（Amazon）","https://www.amazon.com/dp/B0H3K1VGMS"],
 easelCab:["SDRFQQO 画架柜（Amazon，描述不足）","https://www.amazon.com/dp/B0DCG5FSK9"],
 flatFileLink:["AdirOffice / Diversified Spaces 图纸柜（Amazon）","https://www.amazon.com/dp/B0GTRX7CV8"],
 canvasRackLink:["Evellstor 画布收纳架（Amazon，130 lbs）","https://www.amazon.com/dp/B0F536PMXD"],
 dryRackLink:["U.S. Art Supply 晾画架（Amazon，每层 4 lbs）","https://www.amazon.com/dp/B0CTB58JN5"],
 jdCab:["京东 · 画材收纳柜（搜索页）","https://search.jd.com/Search?keyword=%E7%94%BB%E6%9D%90%E6%94%B6%E7%BA%B3%E6%9F%9C&enc=utf-8"]
}
});
