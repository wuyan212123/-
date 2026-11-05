/* ======================================================================
   品类数据：油画颜料（颜料系列）
   结构说明见 _template.js。数据快照：2026-11
   ====================================================================== */
CATS.push({
id:"oil", name:"油画颜料", en:"Oil Paint · Water-Mixable · Alkyd · Oil Stick", updated:"2026-11",
series:"颜料", pos:"干得慢、要用溶剂；入门门槛是气味和清洗，改性油（水溶、醇酸）和颜料棒是分支",

scope:{
  def:"以干性油（亚麻油、红花油等）为粘合剂的颜料，包括传统油画、水溶性油画（改性油，湿时可用水清洗）、醇酸快干油画和油画颜料棒（Oil stick / Oilbar）。",
  include:"上述颜料的单色和套装；以油画颜料为主体的入门全套（+ 画布、画笔、调色刀、媒介剂）。",
  exclude:"油画棒（蜡质 Oil pastel）、数字油画（Paint by number）、丙烯（见丙烯颜料）。",
  adjacent:"油画媒介剂（亚麻油、调色油、光油）、无味稀释剂、画布与画框、调色刀、数字油画。",
  kw:["oil paint set","water mixable oil paint","alkyd oil paint","oil paint sticks","油画颜料","水溶性油画","油画套装"]
},

rules:[
  "按配方分四类：传统油画、水溶性油画、醇酸快干油画、油画颜料棒。水溶性油画只有湿时可用水清洗，干后和普通油画一样；不能和蜡质“油画棒（Oil pastel）”混记。",
  "容量统一记 ml；“大管”指 50ml 以上。",
  "干燥时间按厂家说明记录（指触干 / 可叠加），页面前后矛盾的记“页面矛盾”。",
  "清洗方式必须写清：需松节油 / 无味稀释剂，还是水即可；只有厂家明确写“water mixable / water soluble”才算水溶。",
  "管口出油（打开先流出一摊油）是常见差评，宣称“不出油”需要实测或看评论。",
  "颜料编码、耐光等级按原标尺记录，未披露记“未披露”；含镉、钴颜料注意 Prop 65。",
  "套装里的画布、画笔、调色刀、媒介剂件数，不计入颜料数量。"
],

dims:[
 {g:"产品本体", about:"颜料本身是什么：配方、剂型、性能、颜色。", cats:[
  {t:"A 配方与剂型", c:[
   {t:"油画类型", tag:"L1", def:"按配方分的油画大类。决定清洗方式、干燥时间和使用门槛。",
    kw:["oil paint","water mixable oil","alkyd","oil stick","oilbar"],
    c:[{t:"传统油画",n:"亚麻油 / 红花油，需溶剂清洗"},{t:"水溶性油画",n:"改性油，湿时可用水清洗：Artisan、Cobra、Mont Marte H2O"},{t:"醇酸快干油画",n:"Griffin Alkyd，约 24 小时指触干"},{t:"油画颜料棒",n:"Sennelier、R&F、Shiva；PHOENIX 水溶颜料棒"}]},
   {t:"剂型", tag:"L1", c:[{t:"管装膏状",n:"12–200ml"},{t:"颜料棒",n:"37–38ml"},{t:"罐装 / 大管",n:"150–200ml 白色等"}]},
   {t:"单件容量", tag:"L2", rule:"统一记 ml。",
    c:[{t:"12ml",n:"入门白牌"},{t:"18–21ml",n:"Mont Marte H2O、Winton"},{t:"37–40ml",n:"标准管、颜料棒"},{t:"50–60ml",n:"Paul Rubens、PHOENIX 大管"},{t:"150–200ml",n:"大管白色、Cobra"}]},
   {t:"管材与管口", tag:"L3", c:[{t:"铝管"},{t:"塑料复合管"},{t:"旋盖"},{t:"颜料棒外膜（使用前削去）"}]}]},
  {t:"B 性能", c:[
   {t:"清洗方式", tag:"L1", def:"用完怎么洗笔、有没有溶剂气味。在家画油画的主要门槛。",
    c:[{t:"需松节油 / 无味稀释剂",n:"传统油画、醇酸"},{t:"湿时可用水清洗",n:"水溶性油画"},{t:"未披露 / 页面矛盾"}]},
   {t:"干燥时间", tag:"L2", rule:"按厂家说明；页面矛盾单独记。",
    c:[{t:"约 1 天指触干",n:"醇酸 Griffin，4–8 小时可操作"},{t:"数天",n:"传统油画"},{t:"页面矛盾",n:"如 Arteza 一处写快干、一处写慢干"}]},
   {t:"稠度与出油", tag:"L2", def:"膏体是否均匀；打开后先流出一摊油，是低价油画和水溶油画的常见差评。",
    c:[{t:"膏体均匀"},{t:"偏硬",n:"Winton"},{t:"管口出油 / 分层",n:"Mont Marte H2O 评测提到"},{t:"有干块"}]},
   {t:"光泽", tag:"L3", c:[{t:"亮光"},{t:"缎光",n:"Mont Marte H2O 36 色页面"},{t:"哑光",n:"Paul Rubens 页面"}]},
   {t:"颜料信息披露", tag:"L3", c:[{t:"每色写明颜料编码",n:"艺术家级"},{t:"只有色名",n:"多数白牌"},{t:"未披露"}]},
   {t:"耐光等级", tag:"L3", rule:"按原标尺记录。", c:[{t:"ASTM I / II"},{t:"品牌星级"},{t:"未披露"}]}]},
  {t:"C 颜色", c:[
   {t:"色数规格", tag:"L2", c:[{t:"≤ 10 色",n:"品牌入门套装"},{t:"12–24 色",n:"白牌主流"},{t:"36–40 色",n:"Paul Rubens 38 / 40、PHOENIX 40、Mont Marte H2O 36"}]},
   {t:"特效色", tag:"L3", c:[{t:"常规色"},{t:"金属色",n:"Paul Rubens 9 色金属"},{t:"荧光",n:"Paul Rubens 荧光"}]},
   {t:"配色方案", tag:"L3", c:[{t:"基础全色"},{t:"人像色"},{t:"风景色"},{t:"三原色 + 黑白"}]}]},
  {t:"D 合规", c:[
   {t:"合规与安全", tag:"L0", rule:"ASTM D-4236；溶剂类配件需看运输限制；含镉、钴颜料注意 Prop 65。",
    c:[{t:"ASTM D-4236"},{t:"ACMI AP / CL 认证"},{t:"Prop 65 警示"},{t:"溶剂运输限制"}]}]}
 ]},
 {g:"销售形态", about:"怎么卖：混装、包装、配件。", cats:[
  {t:"E 混装与数量", c:[
   {t:"混装方式", tag:"L2", c:[{t:"单支"},{t:"同配方多色套装"},{t:"颜料 + 媒介剂 / 稀释剂"},{t:"跨工具全套",n:"+ 画布、画笔、调色刀、调色盘"}]},
   {t:"数量登记口径", tag:"L3", c:[{t:"色数"},{t:"支数（白色常给两支）"},{t:"单支容量 × 支数"},{t:"配件件数"}]}]},
  {t:"F 包装与配件", c:[
   {t:"外包装", tag:"L3", c:[{t:"纸盒"},{t:"木盒",n:"Sennelier 36 色颜料棒"},{t:"金属盒"},{t:"手提箱"}]},
   {t:"随附配件", tag:"L3", c:[{t:"画笔"},{t:"调色刀"},{t:"画布 / 画板"},{t:"调色盘"},{t:"亚麻油 / 调色油"},{t:"无味稀释剂"},{t:"清洗说明"}]}]}
 ]},
 {g:"市场定位", about:"卖给谁、卖什么价。", cats:[
  {t:"G 等级", c:[
   {t:"颜料等级", tag:"L1", c:[{t:"学生级（白牌）",n:"Ohuhu、Arteza、Mont Marte"},{t:"学院级",n:"Winton、Georgian、马利"},{t:"艺术家级",n:"W&N Artists'、Gamblin、Michael Harding、M. Graham"}]}]},
  {t:"H 场景与人群", c:[
   {t:"使用场景", tag:"L3", c:[{t:"在家 / 公寓作画"},{t:"画室 / 课堂"},{t:"户外写生"},{t:"大幅 / 厚涂"},{t:"艺考 / 美院"}]},
   {t:"目标人群", tag:"L3", c:[{t:"成人初学者"},{t:"美术生"},{t:"专业画家"},{t:"对气味敏感的人"},{t:"礼品购买者"}]}]}
 ]}
],

types:[
 {g:"传统油画", about:"需溶剂清洗", items:[
  {t:"学生级油画套装（12ml 白牌）", vol:"主流", volWhy:"Ohuhu 24 色油画带 Amazon's Choice，月购 600+；Arteza、Mont Marte Signature 24 色在售。",
   combo:["传统油画","管装膏状","学生级（白牌）","12–24 色","12ml"],
   rep:"Ohuhu 24 × 12ml、Arteza 24 × 12ml、Mont Marte Signature 24 × 12ml、XXL 24 色 + 25 支笔 + 画布",
   price:"US $15–30", who:"成人初学者、礼品", comp:"hi", compT:"高：白牌多",
   pain:"需要溶剂、气味大；干得慢；页面干燥时间描述矛盾；管口出油", ev:["ohuhuOilLink","wmoOilSep"], evl:"有来源",
   fig:{k:"tubes",n:12,label:"12ml 油画管"},
   ex:[["ohuhuOil","Amazon's Choice，月购 600+"],["artezaOil","24 × 12ml；页面一处写快干、一处写慢干","u"],["mmSignature24","24 × 12ml，页面写用松节油清洗"],["xxlOil","24 色 + 25 支画笔 + 画布 + 调色盘"]],
   map:[["油画类型","传统油画"],["剂型","管装膏状"],["单件容量","12ml"],["清洗方式","需松节油 / 无味稀释剂"],["干燥时间","页面矛盾（Arteza）","u"],["颜料等级","学生级（白牌）"],["色数规格","12–24 色"]],
   pros:["需求稳定","单价低"], cons:["溶剂门槛","白牌同质"],
   up:["水溶配方（见机会 B）","不出油的稠度控制"], verdict:["谨慎","竞争一般；升级方向是水溶和稠度稳定。"],
   must:["AP / D-4236","写清清洗方式"], plus:["白色两支"], avoid:["干燥时间描述矛盾"]},
  {t:"大管大色数油画套装（50ml）", vol:"细分", volWhy:"Paul Rubens 20 / 38 / 40 色 × 50ml、PHOENIX 40 × 50ml 在售。",
   combo:["传统油画","管装膏状","学生级（白牌）","20–40 色","50ml"],
   rep:"Paul Rubens 38 色 × 50ml（页面写较快干燥）、Paul Rubens 40 色 × 50ml、PHOENIX Studio 40 × 50ml",
   price:"US $60–150", who:"进阶爱好者、大幅作画", comp:"mid", compT:"中：两三个品牌占位",
   pain:"总价高；色数多但部分颜色用不完", ev:["rubens40Link"], evl:"有来源",
   fig:{k:"tubes",n:12,label:"50ml 大管 · 40 色"},
   ex:[["rubens40","40 × 50ml，页面写亚麻油，总量 2000ml"],["rubens38","38 × 50ml"],["phoenix40","PHOENIX 40 × 50ml"]],
   map:[["油画类型","传统油画"],["单件容量","50–60ml"],["色数规格","36–40 色"],["光泽","哑光（Paul Rubens 页面）","s"],["颜料等级","学生级（白牌）"]],
   pros:["用量足","客单价高"], cons:["总价高"], up:["—"], verdict:["谨慎","已有品牌占位（③ 中已排除）。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"学院级油画（Winton、Georgian）", vol:"主流", volWhy:"Winton 10 × 12ml 入门套装、Georgian 单支 75ml 长期在售。",
   combo:["传统油画","管装膏状","学院级","5–10 色","12–200ml"],
   rep:"Winsor & Newton Winton 10 × 12ml、Daler-Rowney Georgian 75ml 单支、Van Gogh 200ml 单支",
   price:"US $20–40 / 套；单支 $6–20", who:"美术生、进阶爱好者", comp:"mid", compT:"中：老品牌",
   pain:"Winton 偏硬；套装色数少", ev:["wintonLink"], evl:"有来源",
   fig:{k:"tubes",n:10,label:"Winton 12ml × 10"},
   ex:[["winton10","Winton 10 × 12ml 入门套装"],["georgian75","Georgian 75ml 单支"],["vangogh200","Van Gogh 200ml 单支"]],
   map:[["油画类型","传统油画"],["颜料等级","学院级"],["稠度与出油","偏硬（Winton）","t"],["色数规格","≤ 10 色"]],
   pros:["品牌信任"], cons:["色数少"], up:["不正面进入"], verdict:["不建议","品牌壁垒。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"艺术家级油画", vol:"小众", volWhy:"以单支为主：W&N Artists'、Gamblin、Michael Harding、M. Graham、Rembrandt。",
   combo:["传统油画","管装膏状","艺术家级","单支为主","37–40ml"],
   rep:"Winsor & Newton Artists' 37ml、Michael Harding 40ml、M. Graham 37ml、Rembrandt 40ml",
   price:"单支 US $12–60", who:"专业画家", comp:"mid", compT:"中：老牌专业品牌",
   pain:"贵", ev:["harding"], evl:"有来源",
   fig:{k:"tubes",n:6,label:"37–40ml 艺术家级"},
   ex:[["harding","Michael Harding 钛白 40ml"],["mgraham","M. Graham 37ml"],["wnArtists","W&N Artists' 37ml"]],
   map:[["油画类型","传统油画"],["颜料等级","艺术家级"],["颜料信息披露","每色写明颜料编码","m"],["耐光等级","ASTM I / II","m"]],
   pros:["品质最好"], cons:["贵"], up:["不进入"], verdict:["不建议","专业品牌壁垒。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"国内学生油画（马利等）", vol:"主流", volWhy:"国内美术生、艺考常用马利、温莎牛顿 Winton 等；京东多款在售。",
   combo:["传统油画","管装膏状","学院级","12–24 色","50ml / 170ml"],
   rep:"马利油画 12 / 18 / 24 色套装、马利 170ml 大支钛白、温莎牛顿 Winton 国内装",
   price:"¥40–200", who:"国内美术生、艺考", comp:"hi", compT:"高：国产老品牌价格低",
   pain:"大支白色消耗快；学生看重价格", ev:["jdOil"], evl:"部分来源",
   fig:{k:"tubes",n:12,label:"国产学生油画"},
   ex:[["jdOilMarie","京东：马利油画颜料"],["jdOilWinton","京东：温莎牛顿 Winton 油画"]],
   map:[["油画类型","传统油画"],["颜料等级","学院级"],["使用场景","艺考 / 美院"],["目标人群","美术生"]],
   pros:["国内需求大"], cons:["价格低、老品牌强"], up:["—"], verdict:["谨慎","国产老品牌价格低。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"改性油画", about:"水溶、醇酸快干", items:[
  {t:"水溶性油画", vol:"细分", volWhy:"W&N Artisan、Cobra、Lukas 以单支和小套装为主；Mont Marte H2O 有 8 色和 36 色 × 18ml。",
   combo:["水溶性油画","管装膏状","学生 / 学院 / 艺术家级","8–36 色","18–200ml"],
   rep:"Winsor & Newton Artisan（37ml 单支、6 / 10 支套装）、Royal Talens Cobra 150ml、Lukas Berlin 入门套装、Mont Marte H2O 8 × 18ml / 36 × 18ml",
   price:"US $25–80 / 套", who:"在家画油画、怕溶剂气味的人", comp:"mid", compT:"中：Mont Marte 已有 36 色平价套装，但出油评价多",
   pain:"管口出油、分层、有干块（Mont Marte H2O 评测）；不同品牌之间未必能混用", ev:["wmoReview","wmoOilSep","artisanLink"], evl:"有来源",
   fig:{k:"tubes",n:12,label:"水溶油画 · 湿时可用水清洗"},
   ex:[["artisan","Artisan 37ml；页面称可用水清洗、无需溶剂"],["cobra","Cobra 150ml"],["lukas","Lukas Berlin 入门套装"],["mmH2O36","Mont Marte H2O 36 × 18ml，页面写可用水稀释，最多 25%"],["mmH2O8","Mont Marte H2O 8 × 18ml，各页面对光泽、耐水的描述不一","u"]],
   map:[["油画类型","水溶性油画"],["清洗方式","湿时可用水清洗","m"],["稠度与出油","管口出油 / 分层（Mont Marte H2O 评测）","t"],["色数规格","≤ 10 色 / 36–40 色"],["单件容量","18–21ml / 37–40ml"],["颜料等级","学生级（白牌）/ 艺术家级"]],
   pros:["去掉溶剂门槛","在家可画"], cons:["配方难，出油差评集中","平价款口碑差"],
   up:["不出油、稠度稳定的平价多色水溶套装"], verdict:["可做","对应机会 B“不出油的平价多色水溶性油画套装”；必须解决出油问题。"],
   must:["湿时可用水清洗（实测）","出管不出油（实测）"], plus:["清洗说明视频"], avoid:["普通油画冒充水溶"]},
  {t:"醇酸快干油画", vol:"小众", volWhy:"基本只有 W&N Griffin Alkyd：48 色单支、6 × 37ml 入门套装。",
   combo:["醇酸快干油画","管装膏状","学院级","6 色套装 / 单支","37ml"],
   rep:"Winsor & Newton Griffin Alkyd 6 × 37ml 入门套装（约 24 小时指触干）、37ml 单支 3 支装",
   price:"US $30–50 / 套", who:"想画得快的油画用户、打底", comp:"lo", compT:"低：几乎只有 Griffin",
   pain:"套装只有 6 色；仍需溶剂", ev:["griffinLink"], evl:"有来源",
   fig:{k:"tubes",n:6,label:"醇酸 37ml × 6"},
   ex:[["griffin6","6 × 37ml，约 24 小时指触干"],["griffinWhite","钛白 37ml 单支"]],
   map:[["油画类型","醇酸快干油画"],["干燥时间","约 1 天指触干","m"],["清洗方式","需松节油 / 无味稀释剂"],["单件容量","37–40ml"],["色数规格","≤ 10 色"]],
   pros:["一天可叠加","可与普通油画混用"], cons:["色数少","仍需溶剂"],
   up:["平价多色醇酸套装"], verdict:["谨慎","需求偏小（③ 中为 C）。"], must:["写清干燥时间"], plus:["—"], avoid:["—"]}
 ]},
 {g:"颜料棒与特效", about:"Oil stick、金属荧光", items:[
  {t:"油画颜料棒（Oil stick）", vol:"小众", volWhy:"Sennelier、R&F、Shiva、W&N Oilbar 为主；PHOENIX 有水溶颜料棒 6 / 24 色。",
   combo:["油画颜料棒","颜料棒","艺术家级 / 学生级","6–36 色","37–38ml"],
   rep:"Sennelier 6 × 38ml / 36 色木盒、R&F 6 色、Shiva Paintstik 6 / 9 / 12 色、PHOENIX 水溶颜料棒 6 / 24 × 37ml",
   price:"US $40–300", who:"表现性绘画、混合媒介", comp:"mid", compT:"中：专业品牌贵，PHOENIX 已做平价水溶款",
   pain:"贵；外膜需削去；容易和蜡质油画棒混淆", ev:["oilStickLink","phoenixStickLink"], evl:"有来源",
   fig:{k:"sticks",n:6,label:"颜料棒 37–38ml"},
   ex:[["sennelier6","Sennelier 6 × 38ml"],["rf6","R&F 6 色不透明"],["phoenixStick24","PHOENIX 水溶颜料棒 24 × 37ml，含调色刀套装约 $66"]],
   map:[["油画类型","油画颜料棒"],["剂型","颜料棒"],["单件容量","37–40ml"],["管材与管口","颜料棒外膜（使用前削去）","m"],["颜料等级","艺术家级 / 学生级（白牌）"]],
   pros:["不用笔、直接画"], cons:["场景窄、贵"], up:["平价颜料棒（线索）"], verdict:["谨慎","PHOENIX 已有平价水溶款，空间待验证。"], must:["标明不是蜡质油画棒"], plus:["—"], avoid:["与油画棒混淆"]},
  {t:"金属 / 荧光油画", vol:"小众", volWhy:"Paul Rubens 9 色金属 × 60ml、荧光套装在售。",
   combo:["传统油画","管装膏状","金属 / 荧光","9–12 色","50–60ml"],
   rep:"Paul Rubens 9 色金属 × 60ml、Paul Rubens 荧光套装",
   price:"US $25–45", who:"装饰画、抽象画", comp:"lo", compT:"低",
   pain:"场景窄", ev:["rubensMetalLink"], evl:"有来源",
   fig:{k:"tubes",n:9,cols:["#c9a227","#b87333","#d4af37","#a8a9ad","#c0c0c0","#e5c07b","#9a7b4f","#d9a5b3","#8fbcd4"],label:"金属油画 60ml"},
   ex:[["rubensMetal","Paul Rubens 9 色金属 × 60ml"],["neonOilSearch","搜索页：荧光油画"]],
   map:[["特效色","金属色 / 荧光"],["单件容量","50–60ml"]],
   pros:["装饰效果"], cons:["场景窄"], up:["—"], verdict:["不建议","需求小。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"跨工具", about:"颜料 + 画布 + 画笔 + 媒介", items:[
  {t:"油画入门全套", vol:"细分", volWhy:"XXL 24 色 + 25 支画笔 + 画布 + 调色盘等全套在售。",
   combo:["传统油画","管装膏状","学生级（白牌）","12–24 色","跨工具全套"],
   rep:"XXL 24 色 + 25 支画笔 + 画布 + 调色盘、Ohuhu / Arteza 油画 + 画笔套装",
   price:"US $25–50", who:"成人初学者、礼品", comp:"mid", compT:"中",
   pain:"不含稀释剂和清洗说明，新手不会洗笔、不会处理废溶剂", ev:["xxlLink","gamblinSafety"], evl:"部分来源",
   fig:{k:"easel"},
   ex:[["xxlOil","24 色 + 25 支笔 + 画布 + 金属调色盘"],["oilKitSearch","搜索页：油画入门全套，多数不含稀释剂"]],
   map:[["混装方式","跨工具全套"],["随附配件","画笔、画布 / 画板、调色盘"],["目标人群","成人初学者、礼品购买者"]],
   pros:["礼品属性"], cons:["缺稀释剂和清洗指引"],
   up:["加入无味稀释剂 + 清洗指引（见机会 C）"], verdict:["谨慎","对应机会 C“无溶剂困扰的油画入门套装”。"], must:["写清清洗方式"], plus:["清洗视频"], avoid:["—"]}
 ]}
],

opps:[
 {t:"不出油的平价多色水溶性油画套装", gap:"品质缺口", score:{d:3,c:3,x:4,s:2,p:3,e:3},
  why:"油画入门的最大门槛是溶剂气味和清洗。水溶性油画能去掉溶剂，但品牌款（Artisan、Cobra）贵、套装色数少；平价多色只有 Mont Marte H2O 36 色，评测提到每支先流出一摊油、部分颜色有干块。“平价 + 多色 + 出管不出油”的水溶套装还没有口碑好的。",
  spec:["水溶性油画","管装膏状","24 色","18–21ml","湿时可用水清洗","出管不出油"],
  diff:"主图演示水洗笔刷 + 挤出无油", price:"US $30–45",
  risk:"配方难，需要找到成熟工厂；必须实测清洗和出油，否则差评集中",
  verify:"拉 water mixable oil paint set 搜索量；抓 Mont Marte H2O 差评里 oil / separated / dry 的占比",
  from:"水溶性油画、学生级油画套装（12ml 白牌）", ev:["wmoReview","wmoOilSep","mmH2OLink"], evl:"有来源"},
 {t:"稠度稳定不出油的学生油画", gap:"痛点缺口", score:{d:4,c:3,x:2,s:3,p:3,e:3},
  why:"管口出油、分层是油画论坛的常见抱怨（W&N、Mont Marte 都有），原因多是颜料和油分离、出厂前静置不够。学生油画需求大，但“出管不出油”很少被当作卖点。",
  spec:["传统油画","管装膏状","24 色","12–21ml","出厂静置 / 稳定剂","白色两支"],
  diff:"“出管不出油”演示", price:"US $18–28",
  risk:"改进不易被看到；白牌竞争激烈", verify:"抓学生油画 Top 20 差评里 oily / separated / runny 的占比",
  from:"学生级油画套装（12ml 白牌）", ev:["wmoOilSep","ohuhuOilLink"], evl:"部分来源"},
 {t:"无溶剂困扰的油画入门套装（跨品类）", gap:"场景缺口", score:{d:3,c:3,x:3,s:3,p:3,e:2},
  why:"油画入门全套多只配颜料、画笔、画布，不配无味稀释剂、媒介剂和清洗说明。新手不会洗笔、不会处理废溶剂，是放弃油画的常见原因。",
  spec:["油画 12–24 色","无味稀释剂（或水溶配方）","亚麻油","洗笔罐","清洗与废液处理指引卡"],
  diff:"“第一次画油画不用担心气味和清洗”", price:"US $35–50",
  risk:"溶剂运输受限；需要内容制作", verify:"拉 oil painting kit for beginners 的评论里 smell / clean up 的占比",
  from:"油画入门全套、学生级油画套装（12ml 白牌）", ev:["gamblinSafety","xxlLink"], evl:"部分来源"},
 {t:"平价多色醇酸快干套装", gap:"价格带缺口", score:{d:2,c:4,x:3,s:2,p:3,e:3},
  why:"醇酸油画约 24 小时指触干，适合想画得快的用户，但几乎只有 Griffin，套装只有 6 色。需求偏小。",
  spec:["醇酸快干油画","12–24 色","20ml"], diff:"“一天可叠加”", price:"US $30–40",
  risk:"需求小；仍需溶剂", verify:"拉 alkyd oil paint set、fast drying oil paint 的搜索量",
  from:"醇酸快干油画", ev:["griffinLink"], evl:"有来源"},
 {t:"平价油画颜料棒", state:"clue", gap:"价格带缺口",
  why:"专业颜料棒（Sennelier、R&F、Shiva）贵；PHOENIX 已有水溶颜料棒 24 × 37ml（含调色刀约 $66）。是否还有更低价位的空间、需求多大，证据不足。",
  spec:["油画颜料棒","12–24 色"], verify:"拉 oil paint sticks 搜索量；看 PHOENIX 颜料棒评论数", from:"油画颜料棒（Oil stick）", ev:["oilStickLink","phoenixStickLink"], evl:"部分来源"},
 {t:"大色数油画套装（36 色以上）", state:"out", gap:"价格带缺口",
  why:"最初判断白牌油画多为 12–24 色，36 色以上空缺。",
  outWhy:"核实后 Paul Rubens 有 38 / 40 色 × 50ml，PHOENIX 有 40 × 50ml，Mont Marte H2O 有 36 色，已有人做。",
  spec:["传统油画","36 色以上"], from:"大管大色数油画套装（50ml）", ev:["rubens40Link"], evl:"有来源"}
],

grids:[
 {id:"type",name:"油画类型 × 色数",q:"每种油画在哪个色数上还没人做？",rowT:"油画类型",colT:"色数规格",
  cols:["≤ 10 色","12–24 色","36 色以上"],
  rk:["oil paint set","water mixable oil paint set","alkyd oil paint","oil paint sticks"], ck:["6 colors","24 colors","36 colors"],
  rc:["油画颜料","水溶性 油画","醇酸 油画","油画 颜料棒"], cc:["6色","24色","36色"],
  rows:[
   ["传统油画",[["S3","Winton 10 色",{r:["winton10"]}],["R3","Ohuhu、Arteza、Mont Marte",{r:["ohuhuOil","artezaOil","mmSignature24"],t:["学生级油画套装（12ml 白牌）"]}],["S2","Paul Rubens 38 / 40、PHOENIX 40",{r:["rubens40","rubens38","phoenix40"],t:["大管大色数油画套装（50ml）"],o:"大色数油画套装（36 色以上）"}]]],
   ["水溶性油画",[["S2","Artisan、Mont Marte H2O 8 色",{r:["artisan","mmH2O8","lukas"]}],["L3","平价多色款少，口碑差",{r:["mmH2O36"],o:"不出油的平价多色水溶性油画套装",k:["water mixable oil paint set 24"],ev:"有来源",d:"Mont Marte H2O 36 色是少数平价多色款，评测提到出油、干块。"}],["L2","Mont Marte H2O 36",{r:["mmH2O36"],t:["水溶性油画"]}]]],
   ["醇酸快干",[["L1","Griffin 6 色",{r:["griffin6"],t:["醇酸快干油画"]}],["E1","—",{o:"平价多色醇酸快干套装",k:["alkyd oil paint set"]}],["X","—"]]],
   ["颜料棒",[["S2","Sennelier、R&F、Shiva",{r:["sennelier6","rf6"],t:["油画颜料棒（Oil stick）"]}],["L1","PHOENIX 水溶 24 色",{r:["phoenixStick24"],o:"平价油画颜料棒",clue:true}],["L1","Sennelier 36 色木盒",{r:["sennelier36"]}]]]]},

 {id:"clean",name:"油画类型 × 清洗方式",q:"不用溶剂的油画，供给够不够？",rowT:"油画类型",colT:"清洗方式",
  cols:["需溶剂","湿时可用水清洗"],
  rk:["oil paint set","water mixable oil paint","alkyd oil paint","oil paint sticks"], ck:["","water clean up"],
  rc:["油画","水溶性 油画","醇酸 油画","油画 颜料棒"], cc:["","水洗"],
  rows:[
   ["传统油画",[["R3","绝大多数",{r:["ohuhuOil","winton10"]}],["X","—"]]],
   ["水溶性油画",[["X","—"],["L3","品牌贵、平价款出油",{r:["artisan","mmH2O36","cobra"],o:"不出油的平价多色水溶性油画套装",ev:"有来源"}]]],
   ["醇酸快干",[["L1","Griffin",{r:["griffin6"]}],["X","—"]]],
   ["颜料棒",[["S1","Sennelier、R&F",{r:["sennelier6","rf6"]}],["L1","PHOENIX 水溶颜料棒",{r:["phoenixStick24"]}]]]]},

 {id:"price",name:"套装结构 × 价格带",q:"每种套装在哪个价位还空着？",rowT:"套装结构",colT:"整套售价（美国站）",
  cols:["< $20","$20–40","$40–80","$80+"], price:["0-2000","2000-4000","4000-8000","8000-100000"],
  rk:["oil paint set 24 colors","oil paint set 50ml tubes","water mixable oil paint set","alkyd oil paint set","oil paint sticks set","oil painting kit beginners"],
  rc:["油画 24色","油画 大支 套装","水溶性 油画","醇酸 油画","油画 颜料棒","油画 入门 全套"], cc:["","","",""],
  rows:[
   ["白牌 24 色 12ml",[["S3","Ohuhu、Arteza",{r:["ohuhuOil","artezaOil"]}],["S2","Mont Marte Signature",{r:["mmSignature24"]}],["X","—"],["X","—"]]],
   ["大管 50ml 套装",[["X","—"],["S1","Paul Rubens 20 色"],["S2","Paul Rubens 38",{r:["rubens38"]}],["S2","Paul Rubens 40、PHOENIX 40",{r:["rubens40","phoenix40"]}]]],
   ["水溶性油画套装",[["L1","—"],["L3","有 Mont Marte H2O，出油差评多",{r:["mmH2O8","mmH2O36"],o:"不出油的平价多色水溶性油画套装",ev:"有来源"}],["S2","Artisan 套装、Lukas",{r:["artisan","lukas"]}],["S1","—",{r:["cobra"]}]]],
   ["醇酸套装",[["X","—"],["E1","—",{o:"平价多色醇酸快干套装"}],["L1","Griffin 6 × 37ml",{r:["griffin6"]}],["X","—"]]],
   ["颜料棒套装",[["X","—"],["L1","—",{o:"平价油画颜料棒",clue:true}],["S2","PHOENIX 24 约 $66、Sennelier 6",{r:["phoenixStick24","sennelier6"]}],["S2","Sennelier 36 木盒、R&F",{r:["sennelier36","rf6"]}]]],
   ["入门全套",[["S1","—"],["S2","XXL 24 色 + 25 支笔",{r:["xxlOil"]}],["L2","配稀释剂和清洗指引的少",{o:"无溶剂困扰的油画入门套装（跨品类）",ev:"部分来源"}],["X","—"]]]]},

 {id:"scene",name:"使用场景 × 关键卖点",q:"每个场景最在意的卖点，有没有产品明确满足？",rowT:"使用场景",colT:"关键卖点",
  cols:["无溶剂 / 低气味","快干","出管不出油","大容量","清洗指引"],
  rk:["oil paint for apartment","oil painting class","plein air oil painting","large oil painting","oil painting beginners"], ck:["odorless","fast drying","no oil separation","large tubes","how to clean brushes"],
  rc:["油画 室内","油画 课堂","油画 写生","大幅 油画","油画 入门"], cc:["无味","快干","不出油","大支","清洗"],
  rows:[
   ["在家 / 公寓作画",[["L3","水溶贵或口碑差",{r:["artisan","mmH2O36"],o:"不出油的平价多色水溶性油画套装",ev:"有来源"}],["S1","—"],["L2","—",{o:"稠度稳定不出油的学生油画"}],["S1","—"],["L2","—",{o:"无溶剂困扰的油画入门套装（跨品类）"}]]],
   ["画室 / 课堂",[["S1","—"],["S1","—"],["L2","—",{o:"稠度稳定不出油的学生油画"}],["S3","大支白色",{r:["vangogh200"]}],["S1","—"]]],
   ["户外写生",[["S2","水溶、颜料棒",{r:["artisan","sennelier6"]}],["L1","Griffin",{r:["griffin6"],o:"平价多色醇酸快干套装"}],["S1","—"],["X","—"],["S1","—"]]],
   ["大幅 / 厚涂",[["S1","—"],["X","—"],["S1","—"],["S3","Paul Rubens 50ml、Van Gogh 200ml",{r:["rubens40","vangogh200"]}],["X","—"]]],
   ["初学者入门",[["L2","—",{o:"无溶剂困扰的油画入门套装（跨品类）"}],["X","—"],["L2","—",{o:"稠度稳定不出油的学生油画"}],["S1","—"],["L3","全套少有清洗指引",{r:["xxlOil"],o:"无溶剂困扰的油画入门套装（跨品类）",ev:"部分来源"}]]]]}
],

refs:{
 ohuhuOil:["Ohuhu 油画 24 × 12ml","https://www.amazon.com/dp/B0758ZJ3CF"], artezaOil:["Arteza 油画 24 × 12ml","https://www.amazon.com/dp/B0788DDC4T"], mmSignature24:["Mont Marte Signature 油画 24 × 12ml","https://www.amazon.com/dp/B08VDZYKPR"], xxlOil:["XXL 油画全套（24 色 + 25 支笔）","https://www.amazon.com/dp/B0781346C3"],
 rubens40:["Paul Rubens 油画 40 × 50ml","https://www.amazon.com/dp/B0CQ7PKFJ1"], rubens38:["Paul Rubens 油画 38 × 50ml","https://www.amazon.com/dp/B09TPH1QQX"], phoenix40:["PHOENIX Studio 油画 40 × 50ml（搜索页）","https://www.amazon.com/s?k=PHOENIX+Studio+Oil+Paint+Set+40+Colors+50ml"], rubensMetal:["Paul Rubens 金属油画 9 × 60ml","https://www.amazon.com/clp/B0FR8P36RL"],
 winton10:["Winton 油画 10 × 12ml","https://www.amazon.com/dp/B08NJYJRD1"], georgian75:["Georgian 油画 75ml","https://www.amazon.com/clp/B000FJ7BWQ"], vangogh200:["Van Gogh 油画 200ml","https://www.amazon.com/clp/B0053UZTM6"],
 harding:["Michael Harding 钛白 40ml","https://www.amazon.com/clp/B005SBKF7E"], mgraham:["M. Graham 油画 37ml","https://www.amazon.com/clp/B0044TT824"], wnArtists:["W&N Artists' 油画 37ml","https://www.amazon.com/clp/B001E208T6"],
 jdOilMarie:["京东 · 马利油画颜料（搜索页）","https://search.jd.com/Search?keyword=%E9%A9%AC%E5%88%A9%E6%B2%B9%E7%94%BB%E9%A2%9C%E6%96%99"],
 jdOilWinton:["京东 · 温莎牛顿 Winton 油画（搜索页）","https://search.jd.com/Search?keyword=%E6%B8%A9%E8%8E%8E%E7%89%9B%E9%A1%BF%E6%B2%B9%E7%94%BB%E9%A2%9C%E6%96%99"],
 artisan:["W&N Artisan 水溶油画 37ml","https://www.amazon.com/clp/B0060KWDTK"], cobra:["Cobra 水溶油画 150ml","https://www.amazon.com/clp/B006W8JFRI"], lukas:["Lukas Berlin 水溶油画入门套装","https://www.amazon.com/clp/B01M16U3WJ"],
 mmH2O36:["Mont Marte H2O 水溶油画 36 × 18ml","https://www.amazon.com/dp/B01MR45W4Z"], mmH2O8:["Mont Marte H2O 水溶油画 8 × 18ml","https://www.amazon.com/dp/B083J3YKX3"],
 griffin6:["W&N Griffin 醇酸油画 6 × 37ml","https://www.amazon.com/dp/B0DJC5MWJS"], griffinWhite:["W&N Griffin 醇酸钛白 37ml","https://www.amazon.com/dp/B00264151Q"],
 neonOilSearch:["Amazon 搜索：neon oil paint set","https://www.amazon.com/s?k=neon+fluorescent+oil+paint+set"], oilKitSearch:["Amazon 搜索：oil painting kit for beginners","https://www.amazon.com/s?k=oil+painting+kit+for+beginners"],
 sennelier6:["Sennelier 颜料棒 6 × 38ml","https://www.amazon.com/dp/B0053V171C"], sennelier36:["Sennelier 颜料棒 36 色木盒","https://www.amazon.com/dp/B001FDMB5I"], rf6:["R&F 颜料棒 6 色","https://www.amazon.com/clp/B002ITIXWI"], phoenixStick24:["PHOENIX 水溶颜料棒 24 × 37ml","https://www.amazon.com/dp/B0DH2FQ3G5"]
},

src:{
 ohuhuOilLink:["Ohuhu 24 色油画（Amazon，月购 600+）","https://www.amazon.com/dp/B0758ZJ3CF"],
 rubens40Link:["Paul Rubens 40 × 50ml（Amazon）","https://us.amazon.com/Paul-Rubens-LargeTubes-Professional-Consistency/dp/B0CQ7PKFJ1"],
 wintonLink:["Winton 10 × 12ml（Amazon）","https://www.amazon.com/dp/B08NJYJRD1"],
 harding:["Michael Harding 40ml（Amazon）","https://www.amazon.com/clp/B005SBKF7E"],
 jdOil:["京东 · 马利油画颜料（搜索页）","https://search.jd.com/Search?keyword=%E9%A9%AC%E5%88%A9%E6%B2%B9%E7%94%BB%E9%A2%9C%E6%96%99"],
 artisanLink:["W&N Artisan 水溶油画（Amazon）","https://www.amazon.com/clp/B0060KWDTK"],
 mmH2OLink:["Mont Marte H2O 36 色水溶油画（Amazon）","https://www.amazon.com/dp/B01MR45W4Z"],
 wmoReview:["Creative Bloq：Mont Marte H2O 水溶油画评测（出油、干块）","https://creativebloq.com/reviews/review-mont-marte-h20-water-mixable-oil-paints"],
 wmoOilSep:["WetCanvas：管装油画出油讨论","https://www.wetcanvas.com/forums/topic/every-winsor-amp-newton-oil-tube-i-have-leaks-oil"],
 griffinLink:["W&N Griffin 醇酸入门套装（Amazon）","https://www.amazon.com/dp/B0DJC5MWJS"],
 oilStickLink:["Sennelier 颜料棒 6 色（Amazon）","https://www.amazon.com/dp/B0053V171C"],
 phoenixStickLink:["PHOENIX 水溶颜料棒 24 色（Amazon）","https://www.amazon.com/dp/B0DH2FQ3G5"],
 rubensMetalLink:["Paul Rubens 金属油画（Amazon）","https://www.amazon.com/clp/B0FR8P36RL"],
 xxlLink:["XXL 油画全套（Amazon）","https://www.amazon.com/dp/B0781346C3"],
 gamblinSafety:["Gamblin：画室安全与溶剂使用","https://gamblincolors.com/studio-notes/studio-safety/"]
}
});
