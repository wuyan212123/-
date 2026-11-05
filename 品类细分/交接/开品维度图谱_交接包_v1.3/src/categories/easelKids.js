/* ======================================================================
   品类数据：儿童画架（画架系列）
   结构说明见 _template.js。数据快照：2026-11
   ====================================================================== */
CATS.push({
id:"easelKids", name:"儿童画架", en:"Kids' Art Easel", updated:"2026-11",
series:"画架", pos:"玩具属性强、配件多；双面白板 + 黑板 + 卷纸是标配，卷纸是复购耗材",

scope:{
  def:"给 2–12 岁儿童用的画架：落地双面画架（白板 + 黑板 + 卷纸）、桌面儿童画架、带收纳的儿童画架、LED 灯光画板，以及配套的画架卷纸。",
  include:"上述画架单卖、带配件套装，以及画架卷纸补充装。",
  exclude:"成人画架（见落地 / 桌面画架）、普通白板和黑板。",
  adjacent:"儿童颜料、磁性字母、白板笔、粉笔、儿童画桌。",
  kw:["kids easel","toddler easel","art easel for kids","easel paper roll","儿童画架","宝宝画板"]
},

rules:[
  "按结构分：落地双面画架、桌面儿童画架、带收纳儿童画架、LED 灯光画板；卷纸补充装单独一类。",
  "适用年龄按页面原样记（如 3–8 岁、2–4 岁）；高度范围按页面记（如 36–50\"、95–110.5 cm）。",
  "板面分开记：磁性白板、黑板、卷纸夹；“3 合 1”拆开登记。",
  "卷纸记宽度和长度（如 15\"×20 m、18\"×75 ft），以及纸张类型（书写纸、牛皮纸）；页面宽度前后矛盾的（17\" / 18\"）记“页面矛盾”。",
  "配件件数（字母磁贴、粉笔、马克笔、颜料杯）单独记，不计入画架数量。",
  "面向 12 岁以下必须有 CPSIA / CPC；小零件按页面记窒息警示。"
],

dims:[
 {g:"产品本体", about:"画架本身：结构、板面、尺寸年龄、稳定性。", cats:[
  {t:"A 结构与材质", c:[
   {t:"结构类型", tag:"L1", c:[{t:"落地双面画架",n:"Melissa & Doug、Hape、白牌"},{t:"桌面儿童画架",n:"Melissa & Doug 桌面款、Joycat"},{t:"带收纳儿童画架",n:"带收纳盒 / 托盘"},{t:"LED 灯光画板"}]},
   {t:"材质", tag:"L1", c:[{t:"松木"},{t:"其他实木 / 多层板"},{t:"塑料"}]}]},
  {t:"B 板面与功能", c:[
   {t:"板面组合", tag:"L2", c:[{t:"白板 + 黑板"},{t:"白板 + 黑板 + 卷纸",n:"主流"},{t:"磁性白板"},{t:"只有卷纸"}]},
   {t:"卷纸规格", tag:"L2", def:"影响补充装能不能通用。", c:[{t:"15\"（Hape）",n:"非标准宽度"},{t:"17–18\"",n:"Melissa & Doug、通用卷纸"},{t:"页面矛盾"},{t:"未披露"}]},
   {t:"卷纸结构", tag:"L3", def:"卷纸会不会往下掉、能不能裁。", c:[{t:"带锁定卷纸架",n:"Melissa & Doug"},{t:"带裁纸刀"},{t:"卷纸和板之间有缝、易滑落",n:"Hape 评论"}]},
   {t:"配件", tag:"L3", c:[{t:"颜料杯"},{t:"磁性字母数字"},{t:"粉笔 / 白板笔"},{t:"夹子"},{t:"收纳托盘"}]}]},
  {t:"C 尺寸与稳定", c:[
   {t:"适用年龄", tag:"L2", c:[{t:"2–3 岁",n:"桌面款"},{t:"3–8 岁",n:"主流"},{t:"3–12 岁"}]},
   {t:"高度调节", tag:"L3", c:[{t:"不可调"},{t:"多档可调",n:"36–50\"、47–57\"、95–110.5 cm"}]},
   {t:"稳定性", tag:"L3", def:"评论里“晃”的比例：Hape 7%、Delta 13%、Melissa & Doug 26%（评论汇总站数据）。", c:[{t:"宽底座"},{t:"折叠锁扣"},{t:"评论提到晃"}]},
   {t:"可折叠", tag:"L3", c:[{t:"可折叠收纳"},{t:"不可折叠"}]}]},
  {t:"D 合规", c:[
   {t:"安全与合规", tag:"L0", rule:"CPSIA / CPC；ASTM F963；小零件窒息警示；FSC 木材按页面记。", c:[{t:"CPSIA / CPC"},{t:"ASTM F963"},{t:"窒息警示"},{t:"FSC 认证"},{t:"GREENGUARD Gold",n:"Delta Children"}]}]}
 ]},
 {g:"销售形态", about:"怎么卖：配件、耗材。", cats:[
  {t:"E 组合与耗材", c:[
   {t:"销售组合", tag:"L2", c:[{t:"画架单卖"},{t:"画架 + 配件",n:"字母、粉笔、马克笔"},{t:"画架 + 颜料画笔全套"},{t:"卷纸补充装"}]},
   {t:"卷纸纸张", tag:"L3", c:[{t:"书写纸 / 道林纸",n:"Melissa & Doug"},{t:"牛皮纸",n:"Bryco"},{t:"加厚可湿画"},{t:"未披露"}]},
   {t:"卷纸数量", tag:"L3", c:[{t:"1 卷"},{t:"2–4 卷"},{t:"长卷（175 ft）"}]}]}
 ]},
 {g:"市场定位", about:"卖给谁、用在哪。", cats:[
  {t:"F 场景与人群", c:[
   {t:"使用场景", tag:"L3", c:[{t:"家庭涂鸦"},{t:"幼儿园 / 课堂"},{t:"早教（字母数字）"},{t:"节日礼物"}]},
   {t:"购买人", tag:"L3", c:[{t:"父母"},{t:"祖父母 / 亲友（礼物）"},{t:"老师"}]},
   {t:"价格带", tag:"L2", c:[{t:"< $30"},{t:"$30–60"},{t:"$60–100"},{t:"$100 以上"}]}]}
 ]}
],

types:[
 {g:"落地画架", about:"双面 + 卷纸", items:[
  {t:"品牌双面落地儿童画架", vol:"主流", volWhy:"Melissa & Doug Deluxe 约 9,759 条评论；Hape E1010 长期在售。",
   combo:["落地双面画架","松木 / 实木","白板 + 黑板 + 卷纸","3–8 岁","可折叠"],
   rep:"Melissa & Doug Deluxe 双面落地画架（47\" 高，带锁定卷纸架、裁纸刀、4 个夹子、2 个托盘）、Melissa & Doug 磁性款（39 个字母数字磁贴）、Hape E1010（95–110.5 cm，3 个颜料杯，15\" 卷纸）",
   price:"US $50–90", who:"3–8 岁、父母、礼物", comp:"mid", compT:"中：两大品牌 + 白牌",
   pain:"卷纸遇湿颜料易破；Hape 卷纸会往下滑、宽度非标；有人觉得晃（Melissa & Doug 约 26%）", ev:["kidsReview","mdEasel"], evl:"有来源",
   fig:{k:"stand",v:"kids"},
   ex:[["mdDeluxe","47\" 高，锁定卷纸架 + 裁纸刀，3–8 岁"],["mdMagnetic","磁性款，39 个字母数字磁贴"],["hapeE1010","95–110.5 cm，15\" 卷纸，3 个颜料杯"]],
   map:[["结构类型","落地双面画架"],["板面组合","白板 + 黑板 + 卷纸","m"],["卷纸规格","15\"（Hape） / 17–18\"","m"],["卷纸结构","带锁定卷纸架 / 卷纸和板之间有缝、易滑落","t"],["适用年龄","3–8 岁","m"],["稳定性","评论提到晃","t"],["安全与合规","FSC 认证、窒息警示","m"]],
   pros:["品牌信任","配件全"], cons:["卷纸问题","部分评论说晃"],
   up:["加厚通用卷纸（见 ③ B）"], verdict:["谨慎","品牌占位；机会在卷纸耗材。"], must:["CPC"], plus:["—"], avoid:["—"]},
  {t:"白牌多配件儿童画架", vol:"主流", volWhy:"JOYOOSS、Costzon、Vinlon 及大量 3 合 1 白牌在售。",
   combo:["落地双面画架","松木","白板 + 黑板 + 卷纸","3–12 岁","多档可调","画架 + 配件"],
   rep:"JOYOOSS（36–50\" 可调）、Costzon（47–57\"，字母磁贴、8 支粉笔、4 支马克笔、4 个颜料杯）、Vinlon（3 卷卷纸）、3 合 1 白牌",
   price:"US $30–60", who:"父母、礼物", comp:"hi", compT:"高",
   pain:"配件多但品质参差；组装评价不一", ev:["kidsReview"], evl:"部分来源",
   fig:{k:"stand",v:"kids",label:"白牌儿童画架 + 配件"},
   ex:[["joyooss","36–50\" 可调，磁性双面 + 卷纸"],["costzon","47–57\"，字母磁贴 + 粉笔 + 马克笔 + 颜料杯"],["vinlon","含 3 卷卷纸"],["kids3in1","3 合 1，含 3 卷卷纸"]],
   map:[["结构类型","落地双面画架"],["材质","松木","s"],["高度调节","多档可调","s"],["配件","磁性字母数字、粉笔 / 白板笔、颜料杯","s"],["销售组合","画架 + 配件"]],
   pros:["性价比"], cons:["同质化"], up:["防翻倒宽底座"], verdict:["谨慎","红海。"], must:["CPC"], plus:["—"], avoid:["配件数量虚高"]},
  {t:"带收纳儿童画架", vol:"细分", volWhy:"Delta Children MySize 带收纳画架（GREENGUARD Gold）、Costzon 带收纳托盘款在售。",
   combo:["带收纳儿童画架","实木 / 多层板","白板 + 黑板 + 卷纸","收纳盒 / 托盘"],
   rep:"Delta Children MySize 双面带收纳画架、Costzon 带收纳托盘款",
   price:"US $50–100", who:"父母、教室", comp:"mid", compT:"中",
   pain:"占地；Delta 约 13% 评论说晃", ev:["kidsReview"], evl:"部分来源",
   fig:{k:"stand",v:"kids",label:"儿童画架 + 收纳"},
   ex:[["deltaSearch","Delta Children MySize 带收纳画架（搜索页）"],["costzonStorage","Costzon 带收纳托盘款"]],
   map:[["结构类型","带收纳儿童画架"],["配件","收纳托盘"],["安全与合规","GREENGUARD Gold（Delta Children）","m"],["稳定性","评论提到晃","t"]],
   pros:["收纳方便"], cons:["占地"], up:["—"], verdict:["谨慎","—"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"桌面与灯光", about:"小龄、桌面", items:[
  {t:"儿童桌面画架", vol:"细分", volWhy:"Melissa & Doug 桌面款、Joycat（$28.34）、2–4 岁 4 合 1 款在售。",
   combo:["桌面儿童画架","木","白板 + 黑板 + 卷纸","2–4 岁 / 3 岁以上","可折叠"],
   rep:"Melissa & Doug 双面磁性桌面画架（50 ft 卷纸、36 个磁贴）、Joycat 免组装桌面画架（65 件配件）、2–4 岁 4 合 1 桌面画架",
   price:"US $20–40", who:"2–4 岁、小空间", comp:"mid", compT:"中",
   pain:"画面小", ev:["kidsTableLink"], evl:"有来源",
   fig:{k:"stand",v:"kidstable"},
   ex:[["mdTable","磁性双面，50 ft 卷纸，36 个磁贴"],["joycat","免组装，65 件配件，约 $28.34"],["toddler24","面向 2–4 岁"]],
   map:[["结构类型","桌面儿童画架"],["适用年龄","2–3 岁 / 3–8 岁"],["可折叠","可折叠收纳","m"]],
   pros:["小空间可用"], cons:["画面小"], up:["—"], verdict:["谨慎","—"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"LED 灯光画板", vol:"小众", volWhy:"双面 LED 发光桌面画板等少量在售。",
   combo:["LED 灯光画板","塑料","发光板 + 白板"],
   rep:"双面 LED 发光磁性桌面画板",
   price:"US $20–40", who:"3 岁以上", comp:"lo", compT:"低",
   pain:"要电池；偏玩具", ev:["ledLink"], evl:"有来源",
   fig:{k:"stand",v:"kidstable",label:"LED 灯光画板"},
   ex:[["ledBoard","双面 LED 发光磁性画板"],["ledSearch","搜索页：LED drawing board kids"]],
   map:[["结构类型","LED 灯光画板"],["材质","塑料"]],
   pros:["新奇"], cons:["偏玩具"], up:["—"], verdict:["不建议","属于玩具类目。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"配套与耗材", about:"全套、卷纸", items:[
  {t:"儿童画架 + 颜料画笔全套", vol:"细分", volWhy:"Melissa & Doug Deluxe 全套配件款、Blue Squid（100+ 配件）在售。",
   combo:["落地双面画架","画架 + 颜料画笔全套"],
   rep:"Melissa & Doug Deluxe 画架 + 颜料、画笔、粉笔全套、Blue Squid 100+ 配件",
   price:"US $60–120", who:"礼物", comp:"mid", compT:"中",
   pain:"配件多，品质不一", ev:["kidsReview"], evl:"部分来源",
   fig:{k:"stand",v:"kids",label:"画架 + 颜料全套"},
   ex:[["mdComplete","画架 + 颜料、画笔、粉笔全套"],["blueSquid","Blue Squid（搜索页）"]],
   map:[["销售组合","画架 + 颜料画笔全套"],["购买人","祖父母 / 亲友（礼物）"]],
   pros:["礼物属性"], cons:["—"], up:["分龄课程卡"], verdict:["谨慎","对应 ③ C。"], must:["—"], plus:["—"], avoid:["—"]},
  {t:"画架卷纸补充装", vol:"主流", volWhy:"Melissa & Doug、Hape 原厂补充装，Little Artists、Bryco、The Paper Store、Belleur 等通用卷纸在售。",
   combo:["卷纸补充装","15\" / 17–18\"","书写纸 / 牛皮纸","1–4 卷"],
   rep:"Melissa & Doug 补充装 3 卷（页面写 17\" 和 18\"）、Hape 补充装（15\"×20 m）、Little Artists 18\" 3 卷、The Paper Store 18\"×175 ft、Bryco 牛皮纸",
   price:"US $10–30", who:"已有画架的家庭、教室", comp:"mid", compT:"中：原厂 + 通用纸",
   pain:"湿颜料易破；宽度不通用（Hape 15\"）；页面宽度 17\" / 18\" 矛盾", ev:["kidsReview","paperRollLink"], evl:"有来源",
   fig:{k:"stand",v:"roll"},
   ex:[["mdRefill","3 卷，页面写 17\" 和 18\"","u"],["hapeRefill","15\"×20 m，只适配 Hape"],["paperStore","18\"×175 ft"],["littleArtists","18\" 3 卷"]],
   map:[["卷纸规格","15\"（Hape） / 17–18\" / 页面矛盾","m"],["卷纸纸张","书写纸 / 道林纸 / 牛皮纸","m"],["卷纸数量","1 卷 / 2–4 卷 / 长卷（175 ft）"],["销售组合","卷纸补充装"]],
   pros:["复购耗材"], cons:["湿画易破","不通用"],
   up:["加厚可湿画、多宽度通用"], verdict:["可做","对应 ③ B“加厚可湿画的通用画架卷纸”。"],
   must:["写明宽度和适配型号"], plus:["多宽度"], avoid:["宽度写错"]}
 ]}
],

opps:[
 {t:"加厚可湿画的通用画架卷纸", gap:"痛点缺口", score:{d:3,c:3,x:3,s:4,p:4,e:3},
  why:"卷纸是儿童画架的复购耗材。评论提到 Melissa & Doug 卷纸遇湿颜料易破；Hape 卷纸宽 15\"，非标准；Melissa & Doug 补充装页面同时写 17\" 和 18\"。通用卷纸多是书写纸或牛皮纸，很少写“可湿画、适配哪些型号”。",
  spec:["卷纸补充装","加厚（可湿画）","15\" / 17\" / 18\" 三种宽度","适配型号表","2–3 卷"], diff:"主图：湿颜料不破对比 + 适配表", price:"US $15–25",
  risk:"纸张成本；运费占比高", verify:"抓卷纸补充装差评里 tears / thin / doesn't fit / wrong size 的占比",
  from:"画架卷纸补充装、品牌双面落地儿童画架", ev:["kidsReview","paperRollLink"], evl:"有来源"},
 {t:"宽底座防翻倒的儿童画架", gap:"痛点缺口", score:{d:3,c:2,x:3,s:4,p:3,e:3},
  why:"评论汇总里提到“晃”的比例：Hape 约 7%、Delta 约 13%、Melissa & Doug 约 26%。儿童画架很少把防翻倒、宽底座、翻倒测试当卖点。",
  spec:["落地双面画架","加宽底座","折叠锁扣","卷纸锁定","CPC + ASTM F963"], diff:"推一下不倒的对比视频", price:"US $55–75",
  risk:"白牌多，改进易被模仿", verify:"抓儿童画架差评里 wobbly / tips over / unstable 的占比",
  from:"品牌双面落地儿童画架、白牌多配件儿童画架", ev:["kidsReview"], evl:"部分来源"},
 {t:"儿童画架 + 分龄绘画课程卡", gap:"场景缺口", score:{d:2,c:3,x:3,s:4,p:3,e:2},
  why:"儿童画架全套主要堆配件数量，很少附“画什么、怎么玩”的内容。分龄课程卡能提高礼物属性。",
  spec:["落地双面画架","颜料画笔","分龄课程卡 30 张"], diff:"“每天一张卡，跟着画”", price:"US $60–80",
  risk:"内容制作；差异不易在主图体现", verify:"看儿童画架评论里 ideas / what to draw 的提及",
  from:"儿童画架 + 颜料画笔全套", ev:["kidsReview"], evl:"经验判断"},
 {t:"小户型壁挂 / 门挂儿童画板", state:"clue", gap:"场景缺口",
  why:"落地儿童画架占地，小户型家长可能需要壁挂或门挂画板，但没有找到直接需求证据。",
  spec:["壁挂双面画板","卷纸架"], verify:"拉 wall mounted kids easel 搜索量", from:"带收纳儿童画架", ev:["kidsReview"], evl:"经验判断"},
 {t:"可折叠收纳的儿童画架", state:"out", gap:"场景缺口",
  why:"最初判断儿童画架不好收纳。",
  outWhy:"核实后 Melissa & Doug Deluxe、Costzon 等多款写明可折叠收纳，已普遍满足。",
  spec:["可折叠"], from:"品牌双面落地儿童画架", ev:["mdEasel"], evl:"有来源"}
],

grids:[
 {id:"age",name:"结构 × 年龄",q:"每种结构在哪个年龄段还没人做？",rowT:"结构类型",colT:"适用年龄",
  cols:["2–3 岁","3–8 岁","8 岁以上"],
  rk:["kids easel","tabletop easel kids","kids easel with storage","led drawing board kids"], ck:["toddler","3-8 years","8-12 years"],
  rc:["儿童 画架","儿童 桌面 画架","儿童 画架 收纳","LED 画板"], cc:["2岁","3岁","8岁"],
  rows:[
   ["落地双面",[["S1","—"],["R3","Melissa & Doug、Hape、白牌",{r:["mdDeluxe","hapeE1010","joyooss"],t:["品牌双面落地儿童画架","白牌多配件儿童画架"]}],["S2","3–12 岁白牌",{r:["costzon"]}]]],
   ["桌面",[["S2","2–4 岁款",{r:["toddler24","joycat"],t:["儿童桌面画架"]}],["S2","Melissa & Doug",{r:["mdTable"]}],["S1","—"]]],
   ["带收纳",[["X","—"],["S2","Delta、Costzon",{r:["deltaSearch","costzonStorage"],t:["带收纳儿童画架"]}],["S1","—"]]],
   ["LED 画板",[["S1","—"],["S1","—",{r:["ledBoard"],t:["LED 灯光画板"]}],["X","—"]]]]},

 {id:"price",name:"结构 × 价格带",q:"每种结构在哪个价位还空着？",rowT:"结构类型",colT:"售价（美国站）",
  cols:["< $30","$30–60","$60–100","$100+"], price:["0-3000","3000-6000","6000-10000","10000-100000"],
  rk:["kids easel","tabletop easel kids","kids easel with storage","kids easel set with paint","easel paper roll"],
  rc:["儿童 画架","儿童 桌面 画架","儿童 画架 收纳","儿童 画架 套装","画架 卷纸"], cc:["","","",""],
  rows:[
   ["落地双面",[["S1","—"],["R3","白牌",{r:["joyooss","costzon","vinlon"]}],["S3","Melissa & Doug、Hape",{r:["mdDeluxe","hapeE1010"]}],["S1","—"]]],
   ["桌面",[["S3","Joycat 约 $28",{r:["joycat","mdTable"]}],["S2","—"],["X","—"],["X","—"]]],
   ["带收纳",[["X","—"],["S1","—",{r:["costzonStorage"]}],["S2","Delta",{r:["deltaSearch"]}],["X","—"]]],
   ["画架全套",[["X","—"],["S1","—"],["S2","Melissa & Doug 全套",{r:["mdComplete"]}],["L2","带课程内容的少",{o:"儿童画架 + 分龄绘画课程卡",ev:"经验判断"}]]],
   ["卷纸补充装",[["R3","原厂 + 通用",{r:["mdRefill","littleArtists","paperStore"],t:["画架卷纸补充装"]}],["S1","—"],["X","—"],["X","—"]]]]},

 {id:"paper",name:"卷纸宽度 × 纸张",q:"哪种宽度、哪种纸还没人做？",rowT:"卷纸宽度",colT:"纸张类型",
  cols:["书写纸 / 道林纸","牛皮纸","加厚可湿画"],
  rk:["hape easel paper roll","easel paper roll 18 inch","easel paper roll 17 inch"], ck:["bond paper","kraft paper","heavyweight paint"],
  rc:["画架 卷纸 15寸","画架 卷纸 18寸","画架 卷纸 17寸"], cc:["","牛皮纸","加厚"],
  rows:[
   ["15\"（Hape）",[["S2","Hape 原厂",{r:["hapeRefill"]}],["L1","—"],["L2","非标准宽度，加厚款少",{o:"加厚可湿画的通用画架卷纸",ev:"有来源"}]]],
   ["18\"",[["R3","Little Artists、The Paper Store",{r:["littleArtists","paperStore"]}],["S2","Bryco",{k:["kraft paper roll 18 inch"]}],["L3","遇湿颜料易破",{r:["mdRefill"],o:"加厚可湿画的通用画架卷纸",ev:"有来源",d:"Melissa & Doug 卷纸被评论说遇湿颜料易破；通用卷纸很少写“可湿画”。"}]]],
   ["17\"",[["S2","Melissa & Doug（页面 17\" / 18\" 矛盾）",{r:["mdRefill"]}],["S1","—"],["L2","—",{o:"加厚可湿画的通用画架卷纸"}]]]]},

 {id:"scene",name:"使用场景 × 关键卖点",q:"每个场景最在意的卖点，有没有产品明确满足？",rowT:"使用场景",colT:"关键卖点",
  cols:["稳不倒","卷纸好用","可调高","收纳","安全认证","玩法内容"],
  rk:["kids easel home","preschool classroom easel","toddler easel","kids easel gift"], ck:["sturdy","paper roll","adjustable","storage","safety certified","activities"],
  rc:["儿童 画架","幼儿园 画架","宝宝 画架","儿童 画架 礼物"], cc:["稳","卷纸","可调","收纳","安全","玩法"],
  rows:[
   ["家庭涂鸦",[["L3","部分评论说晃",{r:["mdDeluxe","hapeE1010"],o:"宽底座防翻倒的儿童画架",ev:"部分来源"}],["L3","卷纸易破、会往下滑",{r:["mdRefill","hapeRefill"],o:"加厚可湿画的通用画架卷纸",ev:"有来源"}],["R3","—",{r:["joyooss","costzon"]}],["S2","—"],["S2","—"],["L1","—"]]],
   ["幼儿园 / 课堂",[["S2","—"],["L2","耗材用量大",{r:["paperStore"],o:"加厚可湿画的通用画架卷纸",ev:"有来源"}],["S1","—"],["S2","Delta",{r:["deltaSearch"]}],["S2","GREENGUARD"],["S1","—"]]],
   ["小龄（2–3 岁）",[["S2","—"],["S1","—"],["S1","—"],["S1","—"],["S2","—",{r:["toddler24"]}],["S1","—"]]],
   ["节日礼物",[["S2","—"],["S2","—"],["S2","—"],["S1","—"],["S2","—"],["L2","主要堆配件数量",{r:["mdComplete"],o:"儿童画架 + 分龄绘画课程卡",ev:"经验判断"}]]]]}
],

refs:{
 mdDeluxe:["Melissa & Doug Deluxe 双面落地画架","https://www.amazon.com/dp/B002JCS5JA"], mdMagnetic:["Melissa & Doug 磁性落地画架","https://www.amazon.com/dp/B00MC7TC6M"], mdComplete:["Melissa & Doug 画架 + 颜料全套","https://www.amazon.com/dp/B0FXJ5Z63L"], mdTable:["Melissa & Doug 双面磁性桌面画架","https://www.amazon.com/dp/B01B1UUNCW"],
 hapeE1010:["Hape E1010 儿童画架","https://www.amazon.com/dp/B00II021GK"], hapeRefill:["Hape 卷纸补充装 15\"×20 m","https://www.amazon.com/dp/B00II022O6"], mdRefill:["Melissa & Doug 卷纸补充装 3 卷","https://www.amazon.com/dp/B000PXVQI2"],
 littleArtists:["Little Artists 18\" 卷纸 3 卷","https://www.amazon.com/clp/B01N984JHS"], paperStore:["The Paper Store 18\"×175 ft 卷纸","https://www.amazon.com/clp/B07P8NBMTD"],
 joyooss:["JOYOOSS 儿童画架（36–50\"）","https://www.amazon.com/dp/B07NRX5QJ3"], costzon:["Costzon 儿童画架（47–57\"）","https://www.amazon.com/dp/B098QRXFXB"], costzonStorage:["Costzon 带收纳托盘儿童画架","https://www.amazon.com/dp/B0G8FZF73J"], vinlon:["Vinlon 儿童画架（3 卷卷纸）","https://www.amazon.com/dp/B0DHZH1WTH"], kids3in1:["3 合 1 儿童画架（3 卷卷纸）","https://www.amazon.com/dp/B0DJT4D7HY"],
 joycat:["Joycat 儿童桌面画架","https://www.amazon.com/dp/B0DFNYMK13"], toddler24:["2–4 岁 4 合 1 桌面画架","https://us.amazon.com/dp/B0F4XZ886C"],
 ledBoard:["双面 LED 发光桌面画板","https://www.amazon.com/dp/B0GYFBY8YR"], ledSearch:["Amazon 搜索：LED drawing board kids","https://www.amazon.com/s?k=led+light+up+drawing+board+kids+easel"],
 deltaSearch:["Delta Children MySize 带收纳画架（搜索页）","https://www.amazon.com/s?k=delta+children+mysize+easel+storage"], blueSquid:["Blue Squid 儿童画架套装（搜索页）","https://www.amazon.com/s?k=blue+squid+kids+easel"]
},

src:{
 kidsReview:["儿童画架评测汇总（晃的比例、卷纸问题）","https://momjunction.com/articles/best-kids-easels_00607164"],
 mdEasel:["Melissa & Doug Deluxe 落地画架（Amazon）","https://www.amazon.com/dp/B002JCS5JA"],
 kidsTableLink:["Melissa & Doug 桌面画架（Amazon）","https://www.amazon.com/dp/B01B1UUNCW"],
 ledLink:["LED 发光画板（Amazon）","https://www.amazon.com/dp/B0GYFBY8YR"],
 paperRollLink:["Amazon：18\" 画架卷纸（宽度、纸张差异）","https://www.amazon.com/18-inch-easel-paper-roll/s?k=18+inch+easel+paper+roll"]
}
});
