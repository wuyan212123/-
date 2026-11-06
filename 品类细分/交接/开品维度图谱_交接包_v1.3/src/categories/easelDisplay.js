/* ======================================================================
   品类数据：展示画架（画架系列）
   结构说明见 _template.js。数据快照：2026-11
   ====================================================================== */
CATS.push({
id:"easelDisplay", name:"展示画架", en:"Display Easel", updated:"2026-11",
series:"画架", pos:"不是用来画画，是用来摆：婚礼迎宾牌、海报、展览和迷你画架；多件装、颜色和承重是关键",

scope:{
  def:"用来摆放展示的画架：黑色金属婚礼指示牌架、重型多层金属展示架、木质展示架、双折木质展示架、迷你画架多支装，以及迷你画布 + 画架派对套装。",
  include:"上述展示架单卖、多件装和派对套装。",
  exclude:"画画用的落地 / 桌面画架（见对应品类）、人行道 A 字广告牌、易拉宝、海报架。",
  adjacent:"KT 板 / 泡沫板、迎宾牌、相框、餐盘架。",
  kw:["display easel","easel stand for wedding sign","sign easel","mini easel","展示画架","婚礼迎宾牌架子","迷你画架"]
},

rules:[
  "按结构分：金属婚礼指示牌架、重型多层金属展示架、木质展示架、双折木质展示架、迷你画架；派对套装单独一类。",
  "高度按页面原样记（如 47\"、63\"、65\"、66\"）；迷你画架记 5\" / 6\" / 8\"。",
  "承重只记页面写明的数字（从 5 lbs 到 50 lbs 差别很大），没写记“未披露”。",
  "多件装按支数记，价格按单支折算后另记。",
  "颜色按页面记（黑、金、玫瑰金、银、白、原木）。",
  "派对套装记画布尺寸（4×4\"、4×6\"）、套数、颜料类型（页面有时写水彩、有时写丙烯，矛盾的记“页面矛盾”）。"
],

dims:[
 {g:"产品本体", about:"展示架本身：结构、材质、高度、承重、颜色。", cats:[
  {t:"A 结构与材质", c:[
   {t:"结构类型", tag:"L1", c:[{t:"金属婚礼指示牌架",n:"单杆三脚，63\""},{t:"重型多层金属展示架",n:"47\" 4 层"},{t:"木质展示架",n:"A 字，65\""},{t:"双折木质展示架",n:"Displays2go"},{t:"迷你画架",n:"5–9\""}]},
   {t:"材质", tag:"L1", c:[{t:"铁 / 钢"},{t:"铝合金"},{t:"实木"},{t:"松木"}]},
   {t:"颜色", tag:"L2", c:[{t:"黑色",n:"主流"},{t:"金 / 玫瑰金"},{t:"银"},{t:"白"},{t:"原木"}]}]},
  {t:"B 尺寸与承重", c:[
   {t:"高度", tag:"L2", c:[{t:"≤ 12\"",n:"迷你画架"},{t:"13–47\""},{t:"48–66\"",n:"63\"、65\"、66\""},{t:"66\" 以上"}]},
   {t:"承重", tag:"L2", def:"页面差别很大：5 lbs 到 50 lbs。", c:[{t:"≤ 5 lbs"},{t:"6–20 lbs",n:"Displays2go 20 lbs"},{t:"21–50 lbs",n:"30 lbs、50 lbs 款"},{t:"未披露"}]},
   {t:"可托板宽", tag:"L3", c:[{t:"≤ 24\""},{t:"24–36\""},{t:"36\" 以上"}]},
   {t:"整架重量", tag:"L3", c:[{t:"≤ 2.5 lbs",n:"单杆铁架 2.1 lbs、木架 < 2 lbs"},{t:"2.5 lbs 以上"}]}]},
  {t:"C 稳定与安全", c:[
   {t:"稳定措施", tag:"L2", c:[{t:"加粗管 / 多层托"},{t:"可锁定支腿"},{t:"配重挂钩 / 沙袋"},{t:"无"}]},
   {t:"安全与合规", tag:"L0", c:[{t:"Prop 65 警示"},{t:"儿童窒息警示（迷你、派对套装）"},{t:"ASTM D-4236（派对套装颜料）"}]}]}
 ]},
 {g:"销售形态", about:"怎么卖：多件装、收纳包、套装。", cats:[
  {t:"D 组合与数量", c:[
   {t:"件数", tag:"L2", c:[{t:"单支"},{t:"2–3 支装"},{t:"12–24 支装"},{t:"40–100 支装",n:"迷你画架"}]},
   {t:"随附配件", tag:"L3", c:[{t:"收纳包"},{t:"无"},{t:"迷你画布 + 颜料 + 画笔",n:"派对套装"}]}]}
 ]},
 {g:"市场定位", about:"卖给谁、用在哪。", cats:[
  {t:"E 场景与人群", c:[
   {t:"使用场景", tag:"L3", c:[{t:"婚礼迎宾牌"},{t:"活动 / 展会海报"},{t:"画廊 / 展览"},{t:"餐桌座位卡 / 照片"},{t:"派对 DIY 画画"}]},
   {t:"购买人", tag:"L3", c:[{t:"新人 / 婚礼策划"},{t:"活动公司"},{t:"商家"},{t:"老师 / 家长"}]},
   {t:"价格带（单支）", tag:"L2", c:[{t:"< $1（迷你）"},{t:"$10–30"},{t:"$30–60"},{t:"$60 以上"}]}]}
 ]}
],

types:[
 {g:"落地展示架", about:"婚礼、海报、展览", items:[
  {t:"黑色金属婚礼指示牌架", vol:"主流", volWhy:"STARHOO、DANMO、DDEAT 63\" 等大量在售，2–3 支装常见（2 支装约 $25.49）。",
   combo:["金属婚礼指示牌架","铁 / 钢","黑色","63\"","2–3 支装","收纳包"],
   rep:"STARHOO 63\"、DANMO 63\"、DDEAT 63\"、63\" 3 支装带收纳包",
   price:"US $10–30 / 支", who:"新人、婚礼策划、活动", comp:"hi", compT:"高：白牌多",
   pain:"晃、易倒；有风会倒；承重写得不清（5 lbs 到 50 lbs 都有）", ev:["signReview","signWind"], evl:"有来源",
   fig:{k:"stand",v:"display"},
   ex:[["starhoo","63\"，可调"],["danmo","63\" 即开即用"],["ddeat","63\" 可调"],["sign3pack","63\" 3 支装带收纳包"]],
   map:[["结构类型","金属婚礼指示牌架"],["材质","铁 / 钢"],["颜色","黑色"],["高度","48–66\""],["承重","≤ 5 lbs / 未披露","s"],["件数","2–3 支装"],["随附配件","收纳包"],["使用场景","婚礼迎宾牌、活动 / 展会海报"]],
   pros:["便宜、轻","多件装"], cons:["晃、易倒","承重不清"],
   up:["承重写明 + 可锁定 + 配重挂钩"], verdict:["可做","对应 ③ B“承重写明、防风的婚礼指示牌架”。"], must:["写明承重和托板宽"], plus:["配重挂钩"], avoid:["只写 heavy duty"]},
  {t:"重型多层金属展示架", vol:"细分", volWhy:"47\" 4 层重型展示架、承重 30 / 50 lbs 款在售。",
   combo:["重型多层金属展示架","铁 / 钢","47\"","承重 30–50 lbs"],
   rep:"47\" 4 层重型金属展示架、承重 50 lbs（托 36\" 标牌）款",
   price:"US $30–60", who:"商家、活动公司", comp:"mid", compT:"中",
   pain:"重、贵", ev:["signReview"], evl:"部分来源",
   fig:{k:"stand",v:"display",label:"重型金属展示架"},
   ex:[["heavySignSearch","搜索页：heavy duty easel stand for sign"],["blackMetalSearch","搜索页：black metal easel stand for wedding sign"]],
   map:[["结构类型","重型多层金属展示架"],["承重","21–50 lbs","s"],["稳定措施","加粗管 / 多层托"]],
   pros:["稳"], cons:["重"], up:["—"], verdict:["谨慎","—"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"木质展示架（65\"，多色）", vol:"细分", volWhy:"CBT 65\" 5 色（美国制造）、KINGART 65\" 松木、Falling in Art 65\" 黑色、婚礼花艺木架在售。",
   combo:["木质展示架","实木 / 松木","65\"","原木 / 金 / 玫瑰金 / 银 / 白 / 黑"],
   rep:"CBT 65\" 婚礼展示架（5 色，美国制造，可落地 65\" / 桌面 35\"）、KINGART 65\" 松木（< 2 lbs，≤ 40\"）、Falling in Art 65\" 黑色、婚礼花艺木架",
   price:"US $20–60", who:"婚礼、花艺、画廊", comp:"mid", compT:"中",
   pain:"轻、承重低", ev:["woodDisplayLink"], evl:"有来源",
   fig:{k:"stand",v:"displaywood"},
   ex:[["cbt65","65\"，5 色，美国制造"],["kingart65d","65\" 松木，< 2 lbs，≤ 40\""],["fia65","65\" 黑色 A 字架"],["floral65","婚礼花艺木架 65\""]],
   map:[["结构类型","木质展示架"],["材质","实木 / 松木"],["颜色","金 / 玫瑰金 / 银 / 白 / 原木","m"],["高度","48–66\""],["整架重量","≤ 2.5 lbs","s"]],
   pros:["好看"], cons:["承重低"], up:["—"], verdict:["谨慎","多色已有（③ 中已排除）。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"双折木质展示架", vol:"小众", volWhy:"Displays2go 65\" 双折木架（承重 20 lbs）在售。",
   combo:["双折木质展示架","实木","65\"","承重 20 lbs"],
   rep:"Displays2go 65\" 双折木质展示架（樱桃木色，2 个可调托钉）",
   price:"US $40–80", who:"画廊、商家", comp:"lo", compT:"低",
   pain:"需组装", ev:["d2go"], evl:"有来源",
   fig:{k:"stand",v:"displaywood",label:"双折木质展示架"},
   ex:[["d2go","65\"，承重 20 lbs，需组装"],["woodEaselSearch","搜索页：wood easel stand"]],
   map:[["结构类型","双折木质展示架"],["承重","6–20 lbs","m"]],
   pros:["稳、好看"], cons:["贵"], up:["—"], verdict:["不建议","需求小。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"迷你与派对", about:"5–8\" 小画架", items:[
  {t:"迷你画架多支装", vol:"主流", volWhy:"EBOOT 24 支、Thenshop 40 支、Mimorou 60 支、U.S. Art Supply 12 支等大量在售。",
   combo:["迷你画架","松木","5–8\"","12–100 支装"],
   rep:"EBOOT 5\" 24 支、Thenshop 6\" 40 支、Mimorou 5\" 60 支、U.S. Art Supply 5\" 12 支（黑 / 原木）、8\" 48 支",
   price:"US $8–25 / 包", who:"婚礼座位卡、照片、手工", comp:"hi", compT:"高",
   pain:"角度大时会滑", ev:["miniLink"], evl:"有来源",
   fig:{k:"stand",v:"mini"},
   ex:[["eboot24","5\" 24 支"],["thenshop40","6\" 40 支"],["mimorou60","5\" 60 支"],["usasMini12","5\" 12 支"]],
   map:[["结构类型","迷你画架"],["材质","松木"],["高度","≤ 12\""],["件数","40–100 支装"],["使用场景","餐桌座位卡 / 照片"]],
   pros:["便宜、复购"], cons:["红海"], up:["—"], verdict:["不建议","低价红海。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"迷你画布 + 画架派对套装", vol:"主流", volWhy:"CRAFTY HAPPITOYS 12 套、Teling 24 套、CIYOJA 16 套（4×6\"）、NNHOM 96 件等大量在售。",
   combo:["迷你画架","4×4\" / 4×6\" 画布","12–24 套","迷你画布 + 颜料 + 画笔"],
   rep:"CRAFTY HAPPITOYS 12 套（10 色颜料条）、Teling 24 套、CIYOJA 16 套 4×6\"、NNHOM 96 件（含围裙、手提袋）、预印线稿款",
   price:"US $15–35", who:"生日派对、课堂、家长", comp:"hi", compT:"高",
   pain:"颜料类型页面写法不一（水彩 / 丙烯）", ev:["partyLink"], evl:"有来源",
   fig:{k:"stand",v:"mini",label:"迷你画布 + 画架套装"},
   ex:[["happitoys12","12 套，10 色颜料条"],["teling24","24 套 4×4\""],["ciyoja16","16 套 4×6\""],["nnhom96","96 件，含围裙、手提袋"]],
   map:[["随附配件","迷你画布 + 颜料 + 画笔"],["件数","12–24 支装"],["使用场景","派对 DIY 画画"],["安全与合规","儿童窒息警示（迷你、派对套装）"]],
   pros:["派对刚需"], cons:["红海"], up:["—"], verdict:["不建议","已饱和（③ 中已排除）。"], must:["—"], plus:["—"], avoid:["—"]}
 ]}
],

opps:[
 {t:"承重写明、防风的婚礼指示牌架", gap:"痛点缺口", score:{d:4,c:2,x:3,s:4,p:3,e:3},
  why:"婚礼指示牌架销量大，但评论常说晃、被碰就倒、比想象的单薄；页面承重从 5 lbs 到 50 lbs 不等，很多不写。户外婚礼还要靠沙袋压后腿。把“承重数字 + 支腿锁定 + 配重挂钩”写清楚的款少。",
  spec:["金属婚礼指示牌架","63\"","承重 ≥ 25 lbs（写明）","支腿锁定","配重挂钩 + 小沙袋","2 支装 + 收纳包"], diff:"主图：承重测试 + 户外风中不倒", price:"US $28–38 / 2 支",
  risk:"价格敏感；加重会增加运费", verify:"抓婚礼牌架 Top 20 差评里 flimsy / fell / wobbly / wind 的占比",
  from:"黑色金属婚礼指示牌架", ev:["signReview","signWind"], evl:"有来源"},
 {t:"婚庆批量装木质展示架（多支 + 收纳包）", gap:"场景缺口", score:{d:3,c:3,x:2,s:3,p:3,e:2},
  why:"婚礼策划、婚庆租赁公司需要成批、颜色统一的展示架；木质展示架多单支卖，金属架才有 2–3 支装和收纳包。",
  spec:["木质展示架","65\"","4–6 支装","统一颜色","收纳包"], diff:"批量装 + 统一色号", price:"US $80–140 / 4 支",
  risk:"B 端需求难在 Amazon 验证", verify:"拉 wedding easel bulk、wooden easel set of 4 搜索量",
  from:"木质展示架（65\"，多色）", ev:["woodDisplayLink"], evl:"经验判断"},
 {t:"户外商用防风展示架", state:"clue", gap:"场景缺口",
  why:"商家门口、户外活动需要防风展示架；但这和人行道 A 字广告牌重叠，需求是否落在“画架”品类，证据不足。",
  spec:["加重底座","防风"], verify:"拉 outdoor easel stand for sign 搜索量", from:"重型多层金属展示架", ev:["signWind"], evl:"经验判断"},
 {t:"迷你画布 + 画架派对套装", state:"out", gap:"场景缺口",
  why:"最初判断迷你画架可以和小画布、颜料做成派对套装。",
  outWhy:"核实后已有大量 12–24 套的迷你画布 + 画架 + 颜料套装（CRAFTY HAPPITOYS、Teling、CIYOJA、NNHOM 等）。",
  spec:["迷你画架","迷你画布"], from:"迷你画布 + 画架派对套装", ev:["partyLink"], evl:"有来源"},
 {t:"多色木质婚礼展示架", state:"out", gap:"场景缺口",
  why:"最初判断婚礼展示架颜色单一。",
  outWhy:"核实后 CBT 65\" 已有原木、金、玫瑰金、银、白 5 色。",
  spec:["木质展示架","多色"], from:"木质展示架（65\"，多色）", ev:["woodDisplayLink"], evl:"有来源"}
],

grids:[
 {id:"height",name:"结构 × 高度",q:"每种结构在哪个高度段还没人做？",rowT:"结构类型",colT:"高度",
  cols:["≤ 12\"","13–47\"","48–66\"","66\" 以上"],
  rk:["metal easel stand for sign","heavy duty sign easel","wooden display easel","mini easel"], ck:["","47 inch","63 inch","72 inch"],
  rc:["展示 画架 金属","重型 展示架","木质 展示 画架","迷你 画架"], cc:["","","",""],
  rows:[
   ["金属婚礼牌架",[["X","—"],["S1","—"],["R3","63\" 白牌",{r:["starhoo","danmo","ddeat"],t:["黑色金属婚礼指示牌架"]}],["S2","66\"",{k:["66 inch display easel"]}]]],
   ["重型多层",[["X","—"],["S2","47\" 4 层",{r:["heavySignSearch"],t:["重型多层金属展示架"]}],["S1","—"],["X","—"]]],
   ["木质展示架",[["X","—"],["S1","桌面 35\"（CBT 两用）",{r:["cbt65"]}],["S3","65\"",{r:["cbt65","kingart65d","fia65"],t:["木质展示架（65\"，多色）","双折木质展示架"]}],["S1","—"]]],
   ["迷你画架",[["R3","5–8\"",{r:["eboot24","thenshop40","mimorou60"],t:["迷你画架多支装","迷你画布 + 画架派对套装"]}],["X","—"],["X","—"],["X","—"]]]]},

 {id:"load",name:"结构 × 承重",q:"承重写清楚了吗？",rowT:"结构类型",colT:"页面写明的承重",
  cols:["≤ 5 lbs","6–20 lbs","21–50 lbs","未披露"],
  rk:["metal easel stand for sign","heavy duty sign easel","wooden display easel"], ck:["","20 lbs","50 lbs",""],
  rc:["展示 画架 金属","重型 展示架","木质 展示 画架"], cc:["","","",""],
  rows:[
   ["金属婚礼牌架",[["S2","—"],["S1","—"],["L3","承重写明的稳固款少",{r:["starhoo"],o:"承重写明、防风的婚礼指示牌架",ev:"有来源"}],["R3","多数不写",{r:["danmo","ddeat"]}]]],
   ["重型多层",[["X","—"],["S1","—"],["S2","30 / 50 lbs",{r:["heavySignSearch"]}],["S1","—"]]],
   ["木质展示架",[["S1","—"],["S2","Displays2go 20 lbs",{r:["d2go"]}],["S1","25 lbs 推荐",{r:["kingart65d"]}],["S3","—",{r:["cbt65"]}]]]]},

 {id:"price",name:"结构 × 价格带",q:"每种展示架在哪个价位还空着？",rowT:"结构 / 件数",colT:"整件售价（美国站）",
  cols:["< $15","$15–30","$30–60","$60+"], price:["0-1500","1500-3000","3000-6000","6000-100000"],
  rk:["easel stand for wedding sign","heavy duty sign easel","wooden display easel","wooden easel set of 4","mini easel bulk","mini canvas and easel set"],
  rc:["婚礼 迎宾牌 架子","重型 展示架","木质 展示 画架","木质 展示架 多支","迷你 画架","迷你 画布 画架 套装"], cc:["","","",""],
  rows:[
   ["金属婚礼牌架（单支 / 2–3 支）",[["S3","63\" 单支白牌",{r:["starhoo","danmo"]}],["R3","2–3 支装 + 收纳包（2 支约 $25.49）",{r:["sign3pack","ddeat"]}],["L2","承重写明、稳固的款少",{r:["starhoo"],o:"承重写明、防风的婚礼指示牌架",ev:"部分来源"}],["X","—"]]],
   ["重型多层金属架",[["X","—"],["S1","—"],["S2","47\" 4 层、承重 30 / 50 lbs",{r:["heavySignSearch"]}],["S1","—"]]],
   ["木质展示架（单支）",[["S1","—"],["S2","KINGART、Falling in Art 65\"",{r:["kingart65d","fia65"]}],["S2","CBT 5 色、双折木架",{r:["cbt65","d2go","floral65"],o:"多色木质婚礼展示架"}],["S1","—"]]],
   ["木质展示架（4–6 支批量）",[["X","—"],["X","—"],["L1","—"],["L2","婚庆批量装少",{o:"婚庆批量装木质展示架（多支 + 收纳包）",k:["wooden easel set of 4 wedding"],ev:"经验判断"}]]],
   ["迷你画架多支装",[["R3","5\" 12–24 支",{r:["eboot24","usasMini12"]}],["S2","40–60 支",{r:["thenshop40","mimorou60"]}],["X","—"],["X","—"]]],
   ["迷你画布 + 画架套装",[["S1","—"],["R3","12–24 套",{r:["happitoys12","teling24"],o:"迷你画布 + 画架派对套装"}],["S2","16 套 4×6\"、96 件派对装",{r:["ciyoja16","nnhom96"]}],["X","—"]]]]},

 {id:"scene",name:"使用场景 × 关键卖点",q:"每个场景最在意的卖点，有没有产品明确满足？",rowT:"使用场景",colT:"关键卖点",
  cols:["稳 / 防风","承重写明","颜色好看","多件装","便携收纳"],
  rk:["wedding sign easel","poster easel event","gallery display easel","place card mini easel","paint party kit"], ck:["sturdy wind","weight capacity","gold","pack","storage bag"],
  rc:["婚礼 迎宾牌 架子","展会 海报 架","画廊 展示 画架","座位卡 小画架","派对 画画 套装"], cc:["稳","承重","金色","多支","收纳包"],
  rows:[
   ["婚礼迎宾牌",[["L3","评论说晃、会倒",{r:["starhoo","danmo"],o:"承重写明、防风的婚礼指示牌架",ev:"有来源"}],["L3","5–50 lbs 不等，多数不写",{r:["ddeat"],o:"承重写明、防风的婚礼指示牌架",ev:"有来源"}],["S3","CBT 5 色",{r:["cbt65"],o:"多色木质婚礼展示架"}],["S2","—",{r:["sign3pack"]}],["S2","—",{r:["sign3pack"]}]]],
   ["活动 / 展会海报",[["S2","重型款",{r:["heavySignSearch"]}],["S2","—"],["S1","—"],["S2","—"],["S2","—"]]],
   ["画廊 / 展览",[["S2","—",{r:["d2go"]}],["S2","—"],["S2","—"],["L1","—"],["S1","—"]]],
   ["座位卡 / 照片",[["S1","角度大会滑"],["X","—"],["S2","黑 / 原木",{r:["usasMini12"]}],["R3","—",{r:["thenshop40"]}],["S1","—"]]],
   ["派对 DIY",[["S1","—"],["X","—"],["S1","—"],["R3","—",{r:["happitoys12","teling24"]}],["S2","—"]]]]}
],

refs:{
 starhoo:["STARHOO 63\" 婚礼指示牌架","https://www.amazon.com/dp/B096LSGHCH"], danmo:["DANMO 63\" 指示牌架","https://www.amazon.com/dp/B09RQVG6BC"], ddeat:["DDEAT 63\" 指示牌架","https://www.amazon.com/dp/B09NPMW78C"], sign3pack:["63\" 指示牌架 3 支装（带收纳包）","https://www.amazon.com/dp/B0H14LG2Q2"],
 heavySignSearch:["Amazon 搜索：heavy duty easel stand for sign","https://www.amazon.com/s?k=heavy+duty+easel+stand+for+sign"], blackMetalSearch:["Amazon 搜索：black metal easel stand for wedding sign","https://www.amazon.com/black-metal-easel-stand-wedding-sign/s?k=black+metal+easel+stand+for+wedding+sign"],
 cbt65:["CBT 65\" 婚礼展示架（5 色）","https://www.amazon.com/clp/B07RXNMDJ1"], kingart65d:["KINGART 65\" 松木展示架","https://www.amazon.com/dp/B07HYKWZBX"], fia65:["Falling in Art 65\" 黑色木架","https://www.amazon.com/dp/B0B8QZV61S"], floral65:["65\" 婚礼花艺木架","https://www.amazon.com/dp/B081KRXMSZ"],
 d2go:["Displays2go 65\" 双折木质展示架","https://www.amazon.com/dp/B00B5ZX182"], woodEaselSearch:["Amazon 搜索：wood easel stand","https://www.amazon.com/wood-easel-stand/s?k=wood+easel+stand"],
 eboot24:["EBOOT 5\" 迷你画架 24 支","https://www.amazon.com/dp/B06XRS28JW"], thenshop40:["Thenshop 6\" 迷你画架 40 支","https://www.amazon.com/dp/B0B51CN9Z9"], mimorou60:["Mimorou 5\" 迷你画架 60 支","https://www.amazon.com/dp/B09XR18GSK"], usasMini12:["U.S. Art Supply 5\" 迷你画架 12 支","https://www.amazon.com/clp/B00NLNRVFU"],
 happitoys12:["CRAFTY HAPPITOYS 迷你画布画架 12 套","https://www.amazon.com/dp/B0B437J66Z"], teling24:["Teling 迷你画布画架 24 套","https://www.amazon.com/clp/B0BNQ97CW7"], ciyoja16:["CIYOJA 4×6\" 画布画架 16 套","https://www.amazon.com/dp/B0GXFKSNG9"], nnhom96:["迷你画布画架派对 96 件","https://www.amazon.com/clp/B0CSJZTGK1"]
},

src:{
 signReview:["婚礼牌架评论：单薄、被碰会倒、承重差异","https://www.staples.com/ptd/review/1682317"],
 signWind:["婚礼迎宾牌展示指南：户外后腿压沙袋","https://icustomlabel.com/blogs/wedding-decor-and-gifts/how-to-display-wedding-welcome-sign-easels"],
 woodDisplayLink:["CBT 65\" 婚礼展示架（Amazon，5 色）","https://www.amazon.com/clp/B07RXNMDJ1"],
 d2go:["Displays2go 双折展示架（Amazon，承重 20 lbs）","https://www.amazon.com/dp/B00B5ZX182"],
 miniLink:["Amazon：迷你画架多支装","https://www.amazon.com/mini-easel-stand/s?k=mini+easel+stand"],
 partyLink:["Amazon：迷你画布 + 画架派对套装","https://www.amazon.com/clp/B0B437J66Z"]
}
});
