/* ======================================================================
   品类数据：丙烯颜料（颜料系列）
   结构说明见 _template.js。数据快照：2026-11
   ====================================================================== */
CATS.push({
id:"acrylic", name:"丙烯颜料", en:"Acrylic Paint", updated:"2026-11",
series:"颜料", pos:"干后防水、基底最广；艺术、手工、倾倒、布料多条赛道并行",

scope:{
  def:"以丙烯酸乳液为粘合剂、干后防水的颜料，可用于画布、纸、木、石、陶、布等多种基底；包括管装、瓶装、倾倒预混、重身，以及布料、户外等专用丙烯。",
  include:"上述颜料的单色和套装；以丙烯为主体的画布画架套装、倾倒画套装。",
  exclude:"丙烯马克笔、丙烯水粉（见水粉颜料）、喷漆、墙漆。",
  adjacent:"丙烯马克笔、画布与画架、媒介剂（倾倒剂、硅油、光油、织物媒介剂）。",
  kw:["acrylic paint set","acrylic paint tubes","craft acrylic paint","acrylic pouring paint","fabric paint","丙烯颜料","丙烯套装"]
},

rules:[
  "按用途配方分：通用艺术丙烯、手工丙烯、倾倒预混、布料丙烯、户外 / 多基底丙烯；同一品牌不同系列分开记。",
  "容量统一记 ml：2 fl oz ≈ 59ml，8 fl oz ≈ 237ml，16 fl oz ≈ 473ml，32 fl oz ≈ 946ml。",
  "稠度按厂家写的记（Heavy Body / Soft Body / Fluid / High Flow / 预混倾倒），不按观感判断。",
  "布料丙烯要记录是否需要热定型、多久后可水洗；页面前后矛盾的（如 Castle 一处写永久、一处写不耐水）记“页面矛盾”。",
  "倾倒套装要分开记：颜料瓶数、是否含硅油、是否含倾倒剂、杯和工具件数。",
  "“Non-toxic”只认 AP 认证或 ASTM D-4236；户外耐候、耐洗只认厂家声明或实测。",
  "套装里的画布、画架、画笔、调色盘件数，不计入颜料数量。"
],

dims:[
 {g:"产品本体", about:"颜料本身是什么：用途配方、剂型、性能、颜色。", cats:[
  {t:"A 用途配方与剂型", c:[
   {t:"用途配方", tag:"L1", def:"同是丙烯，为不同用途做的配方差别很大，是不同的品。",
    kw:["artist acrylic","craft acrylic","pouring paint","fabric paint","outdoor acrylic"],
    c:[{t:"通用艺术丙烯",n:"Liquitex、Arteza、Golden"},{t:"手工丙烯",n:"Apple Barrel、FolkArt、DecoArt"},{t:"倾倒预混丙烯",n:"Pouring Masters、Arteza、Funto"},{t:"布料丙烯",n:"Tulip、Castle 3D"},{t:"户外 / 多基底丙烯",n:"FolkArt Outdoor、Multi-Surface"}]},
   {t:"剂型", tag:"L1", c:[{t:"管装",n:"12–59ml"},{t:"挤压瓶",n:"2oz 手工丙烯"},{t:"大瓶 / 罐",n:"8–32oz"},{t:"倾倒预混瓶",n:"2oz / 100ml"},{t:"尖嘴立体瓶",n:"3D 布料丙烯"}]},
   {t:"单件容量", tag:"L2", rule:"统一记 ml。",
    c:[{t:"12ml"},{t:"22ml"},{t:"59ml（2 fl oz）"},{t:"100–120ml"},{t:"237ml（8 fl oz）"},{t:"473–946ml（16–32 fl oz）"}]},
   {t:"容器与盖型", tag:"L3", def:"卡盖和管口干结是管装丙烯的常见抱怨。",
    c:[{t:"旋盖管"},{t:"翻盖挤压瓶"},{t:"尖嘴瓶"},{t:"罐 / 桶"}]}]},
  {t:"B 性能", c:[
   {t:"稠度", tag:"L2", c:[{t:"高流动 / 流体",n:"High Flow、倾倒预混"},{t:"软体 Soft Body",n:"手工丙烯、学生丙烯"},{t:"重身 Heavy Body",n:"Golden、Liquitex HB"}]},
   {t:"光泽", tag:"L2", c:[{t:"哑光",n:"Apple Barrel Matte"},{t:"缎光",n:"Apple Barrel Multi-Surface"},{t:"亮光",n:"FolkArt Outdoor Gloss"}]},
   {t:"覆盖力", tag:"L3", c:[{t:"高覆盖"},{t:"需多层",n:"手工丙烯常见"},{t:"透明 / 半透明"},{t:"未披露"}]},
   {t:"干后色变", tag:"L3", def:"丙烯干后通常比湿时略深，影响调色。", c:[{t:"干后变深"},{t:"基本一致"},{t:"未披露"}]},
   {t:"柔韧与耐洗", tag:"L3", def:"布料、柔性基底上是否开裂、能否机洗。",
    rule:"记录是否需要热定型和可水洗时间。",
    c:[{t:"软而有弹性，可机洗",n:"Tulip Soft，72 小时后"},{t:"需熨烫热定型",n:"Castle 3D"},{t:"硬膜，不适合布料"},{t:"页面矛盾"}]},
   {t:"耐候与 UV", tag:"L3", c:[{t:"户外耐候（厂家声明）",n:"FolkArt Outdoor"},{t:"室内用"},{t:"未披露"}]},
   {t:"颜料信息披露", tag:"L3", c:[{t:"每色写明颜料编码",n:"Golden、Liquitex"},{t:"只有色名",n:"多数手工、白牌"},{t:"未披露"}]},
   {t:"耐光等级", tag:"L3", rule:"按原标尺记录。", c:[{t:"ASTM I / II"},{t:"品牌星级"},{t:"未披露"}]}]},
  {t:"C 颜色", c:[
   {t:"色数规格", tag:"L2", c:[{t:"≤ 12 色"},{t:"18–24 色"},{t:"30–48 色"},{t:"60 色以上",n:"Arteza 60、Liquitex BASICS 72"}]},
   {t:"特效色", tag:"L2", kw:["metallic acrylic","neon acrylic","glow in the dark"],
    c:[{t:"常规色"},{t:"金属色",n:"Castle 24 金属"},{t:"荧光"},{t:"珠光"},{t:"夜光",n:"Tulip Glow"},{t:"闪粉"}]},
   {t:"配色方案", tag:"L3", c:[{t:"基础全色"},{t:"主题色（自然、粉彩）"},{t:"三原色 + 黑白"}]}]},
  {t:"D 合规", c:[
   {t:"合规与安全", tag:"L0", rule:"ASTM D-4236；面向 12 岁以下需 CPSIA / CPC；含镉、钴颜料注意 Prop 65。",
    c:[{t:"ASTM D-4236"},{t:"ACMI AP 认证",n:"Apple Barrel"},{t:"CPSIA / CPC（儿童）"},{t:"Prop 65 警示"}]}]}
 ]},
 {g:"销售形态", about:"怎么卖：混装、包装、配件。", cats:[
  {t:"E 混装与数量", c:[
   {t:"混装方式", tag:"L2", c:[{t:"单色单支 / 单瓶"},{t:"同配方多色套装"},{t:"多特效混装"},{t:"颜料 + 媒介剂",n:"倾倒套装含硅油"},{t:"跨工具组合",n:"+ 画布、画架、画笔、视频课"}]},
   {t:"数量登记口径", tag:"L3", c:[{t:"色数"},{t:"支数 / 瓶数"},{t:"单件容量 × 数量"},{t:"配件件数（画布、画架、画笔、杯）"}]}]},
  {t:"F 包装与配件", c:[
   {t:"外包装", tag:"L3", c:[{t:"纸盒"},{t:"塑料收纳盒"},{t:"吸塑卡"},{t:"手提箱 / 礼盒"}]},
   {t:"随附配件", tag:"L3", c:[{t:"画笔"},{t:"画布 / 画板"},{t:"画架"},{t:"调色盘"},{t:"调色刀"},{t:"倾倒杯 / 硅油"},{t:"视频课程"}]}]}
 ]},
 {g:"市场定位", about:"卖给谁、卖什么价、画在什么上。", cats:[
  {t:"G 等级", c:[
   {t:"颜料等级", tag:"L1", c:[{t:"手工 / 儿童级",n:"Apple Barrel、FolkArt"},{t:"学生级（白牌）",n:"Arteza、Castle"},{t:"学院级（品牌学生线）",n:"Liquitex BASICS、Amazon Basics"},{t:"艺术家级",n:"Golden、Liquitex Heavy Body"}]}]},
  {t:"H 场景与基底", c:[
   {t:"适用基底", tag:"L2", c:[{t:"画布 / 纸"},{t:"木"},{t:"石头"},{t:"陶瓷 / 玻璃"},{t:"布料"},{t:"户外表面"}]},
   {t:"使用场景", tag:"L3", c:[{t:"画布绘画"},{t:"倾倒画"},{t:"石头彩绘"},{t:"木器 / 手工"},{t:"布料 DIY"},{t:"户外装饰"},{t:"初学者课程"}]},
   {t:"目标人群", tag:"L3", c:[{t:"初学者 / 成人兴趣"},{t:"手工爱好者"},{t:"专业画家"},{t:"儿童 / 家长"},{t:"礼品购买者"}]}]}
 ]}
],

types:[
 {g:"艺术丙烯", about:"画布绘画为主", items:[
  {t:"管装学生丙烯套装", vol:"主流", volWhy:"Liquitex BASICS 24 色在 Art Paints 类目 #40；Amazon Basics 24 色周购 200+。",
   combo:["通用艺术丙烯","管装","学生 / 学院级","12–72 色","12–22ml"],
   rep:"Liquitex BASICS 24 / 72 × 22ml、Arteza 24 / 60 × 22ml、Amazon Basics 24 色、Castle 24 × 12ml",
   price:"US $12–60（BASICS 24 色约 $38.67，Arteza 约 $24.64）", who:"初学者、画布绘画、学生", comp:"hi", compT:"高：品牌 + 平台自营 + 白牌",
   pain:"卡盖、管口干结；颜色干后变深", ev:["liqBasicsLink","goldenTube","wnCap"], evl:"有来源",
   fig:{k:"tubes",n:12,label:"22ml 管装"},
   ex:[["liqBasics24","Art Paints 类目 #40，约 $38.67"],["artezaAcr24","约 $24.64，月购 100+"],["amzBasicsAcr","Amazon 自营，周购 200+"],["castle24","24 × 12ml"]],
   map:[["用途配方","通用艺术丙烯"],["剂型","管装"],["单件容量","12ml / 22ml"],["容器与盖型","旋盖管"],["稠度","软体 Soft Body"],["颜料等级","学生级（白牌）/ 学院级"],["色数规格","18–24 色 / 60 色以上"],["适用基底","画布 / 纸、木"],["使用场景","画布绘画"]],
   pros:["需求大","单色补货方便"], cons:["卡盖、干结（论坛常见抱怨）","平台自营也在做，价格被压"],
   up:["防卡盖管口","大容量白色"], verdict:["谨慎","价格带被品牌和自营占满；防卡盖是小改进（③ 中为 C）。"],
   must:["AP / D-4236","色卡准确"], plus:["大容量白色"], avoid:["卡盖"]},
  {t:"专业重身丙烯", vol:"细分", volWhy:"Liquitex Heavy Body 24 色带 Amazon's Choice；Golden 多款套装在售。",
   combo:["通用艺术丙烯","管装","艺术家级","4–24 色","22–59ml","重身"],
   rep:"Golden Heavy Body（Intro 6、Mixing 12、Essentials 6 × 2oz）、Liquitex Heavy Body（Essentials 24、Classic 12）",
   price:"US $40–150", who:"专业画家、美术生", comp:"mid", compT:"中：两大品牌",
   pain:"贵；同名套装容量不同，需按每 ml 比价", ev:["goldenLink"], evl:"有来源",
   fig:{k:"tubes",n:6,label:"重身丙烯 22–59ml"},
   ex:[["goldenMix","12 × 22ml + 罩染液"],["goldenIntro","6 × 22ml"],["liqHBSearch","Liquitex Heavy Body 24 × 22ml Essentials"]],
   map:[["用途配方","通用艺术丙烯"],["稠度","重身 Heavy Body","m"],["颜料等级","艺术家级"],["颜料信息披露","每色写明颜料编码","m"],["使用场景","画布绘画"]],
   pros:["品质最好"], cons:["价格高"], up:["不正面进入"], verdict:["不建议","专业品牌壁垒高。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"手工丙烯", about:"瓶装，多基底", items:[
  {t:"瓶装手工丙烯", vol:"主流", volWhy:"Apple Barrel、FolkArt、DecoArt 多款套装在售；Apple Barrel 8 × 8oz 约 $22。",
   combo:["手工丙烯","挤压瓶","手工 / 儿童级","8–24 色","2 fl oz / 8 fl oz"],
   rep:"Apple Barrel（哑光 / 缎光 / 亮光，AP 认证）、FolkArt 24 × 2oz + 画笔、DecoArt Crafter’s 24 色、白牌 24 色 2oz + 画笔",
   price:"US $10–35", who:"手工、石头彩绘、木器、课堂", comp:"hi", compT:"高：老牌手工品牌 + 白牌",
   pain:"覆盖力弱，需要多涂几层", ev:["appleLink"], evl:"有来源",
   fig:{k:"bottles",n:6},
   ex:[["appleB8","8 × 8 fl oz 哑光，约 $22；AP 认证"],["appleB18","18 × 2 fl oz 哑光"],["folkart24","24 × 2oz + 10 支画笔"],["decoart24","DecoArt 24 × 2oz"]],
   map:[["用途配方","手工丙烯"],["剂型","挤压瓶"],["单件容量","59ml（2 fl oz）/ 237ml（8 fl oz）"],["容器与盖型","翻盖挤压瓶"],["光泽","哑光 / 缎光 / 亮光","m"],["覆盖力","需多层","t"],["合规与安全","ACMI AP 认证（Apple Barrel）","m"],["适用基底","木、石头、陶瓷 / 玻璃"]],
   pros:["单价低、量大","多光泽可选","翻盖瓶不卡盖"], cons:["覆盖力弱","老品牌 + 白牌拥挤"],
   up:["—"], verdict:["谨慎","老牌手工品牌已覆盖。"], must:["AP 认证"], plus:["多光泽"], avoid:["覆盖力虚标"]},
  {t:"户外 / 多基底丙烯", vol:"细分", volWhy:"FolkArt Outdoor、Multi-Surface 系列和 Apple Barrel 多基底套装在售。",
   combo:["户外 / 多基底丙烯","挤压瓶","手工级","5–16 色","2 fl oz"],
   rep:"FolkArt Outdoor 亮光 12 × 2oz（用于石头彩绘）、FolkArt Multi-Surface 16 色、Apple Barrel 多基底缎光 12 色",
   price:"US $15–35", who:"石头彩绘、花园装饰、陶罐", comp:"mid", compT:"中：老牌手工品牌已覆盖",
   pain:"户外耐候时间有限，常需再上光油", ev:["folkartLink"], evl:"有来源",
   fig:{k:"bottles",n:5,label:"户外 / 多基底"},
   ex:[["folkartMS16","FolkArt 多基底 16 色粉彩"],["appleMS12","Apple Barrel 多基底缎光 12 色"]],
   map:[["用途配方","户外 / 多基底丙烯"],["耐候与 UV","户外耐候（厂家声明）","m"],["光泽","缎光 / 亮光"],["适用基底","石头、陶瓷 / 玻璃、户外表面"],["使用场景","石头彩绘、户外装饰"]],
   pros:["一瓶多用"], cons:["耐候有限"], up:["—"], verdict:["谨慎","已有成熟品牌（③ 中已排除）。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"倾倒与特效", about:"倾倒画预混、金属荧光", items:[
  {t:"倾倒画预混丙烯", vol:"细分", volWhy:"Pouring Masters 8–48 色、Arteza 32 色、Funto 36 瓶等大量在售。",
   combo:["倾倒预混丙烯","倾倒预混瓶","学生级（白牌）","8–48 色","2oz / 100ml","颜料 + 硅油"],
   rep:"Pouring Masters 8 / 12 / 18 / 36 / 48 色（部分含硅油）、Arteza 32 × 2oz、Funto 36 瓶含硅油、8 × 100ml 套装（约 $26.99）",
   price:"US $20–60", who:"倾倒画爱好者、减压手工", comp:"hi", compT:"高：卖家多",
   pain:"稠度不对：太稠会开裂、细胞起不来，太稀会露底；硅油加多了会出坑、发浑", ev:["pourGuide","pourLink"], evl:"有来源",
   fig:{k:"bottles",n:6,label:"倾倒预混 2oz"},
   ex:[["pourMasters18","Pouring Masters 18 色 2oz"],["artezaPour32","Arteza 32 × 2oz（金属、荧光、粉彩）"],["funto36","Funto 36 瓶，含硅油"],["pour8x100","8 × 100ml + 2 个调色杯，约 $26.99"]],
   map:[["用途配方","倾倒预混丙烯"],["剂型","倾倒预混瓶"],["稠度","高流动 / 流体"],["混装方式","颜料 + 媒介剂"],["随附配件","倾倒杯 / 硅油"],["使用场景","倾倒画"]],
   pros:["开瓶即用，入门快","短视频传播强"], cons:["稠度和硅油是成败关键","卖家多"],
   up:["稠度指引 + 定量硅油 + 教程"], verdict:["谨慎","卖家多；差异化在“成功率”（③ 中为 C）。"],
   must:["稠度一致"], plus:["定量硅油、教程"], avoid:["太稠或太稀"]},
  {t:"金属 / 荧光特效丙烯", vol:"细分", volWhy:"Castle 24 色金属套装（新旧两版）在售。",
   combo:["通用艺术丙烯","管装","金属 / 荧光","12–24 色","12ml"],
   rep:"Castle 24 色金属丙烯（新配方）",
   price:"US $15–30", who:"手工、装饰画", comp:"mid", compT:"中",
   pain:"金属感在不同底色上差异大", ev:["castleMetalLink"], evl:"有来源",
   fig:{k:"tubes",n:8,cols:["#c9a227","#b87333","#d4af37","#a8a9ad","#c0c0c0","#e5c07b","#9a7b4f","#d9a5b3"],label:"金属丙烯"},
   ex:[["castleMetal","Castle 24 色金属，新配方"],["metalAcrSearch","搜索页：金属 / 荧光丙烯套装"]],
   map:[["特效色","金属色"],["剂型","管装"],["色数规格","18–24 色"]],
   pros:["装饰效果强"], cons:["场景窄"], up:["—"], verdict:["谨慎","作为套装特效色即可。"], must:["—"], plus:["—"], avoid:["—"]}
 ]},
 {g:"布料丙烯", about:"衣物、鞋、帆布包", items:[
  {t:"布料丙烯", vol:"细分", volWhy:"Tulip Soft Fabric、Castle 3D 布料丙烯多款在售。",
   combo:["布料丙烯","挤压瓶 / 尖嘴立体瓶","手工级","5–24 色","1–4 fl oz"],
   rep:"Tulip Soft Fabric（永久、柔软、72 小时后可机洗）、Tulip 夜光款、Castle 3D 布料丙烯 24 色（需熨烫热定型）、Tulip 织物媒介剂（把普通丙烯变成布料用）",
   price:"US $10–30", who:"衣物 DIY、帆布包、鞋", comp:"mid", compT:"中：Tulip 为主",
   pain:"热定型步骤麻烦；Castle 页面一处写永久、一处写不耐水", ev:["tulipLink","castleFabricLink"], evl:"有来源",
   fig:{k:"bottles",n:5,label:"布料丙烯"},
   ex:[["tulipSoft10","Tulip 10 色 1oz，72 小时后可机洗"],["castleFabric","Castle 3D 24 色，需熨烫热定型；页面描述矛盾"],["tulipMedium","Tulip 织物媒介剂 8oz"]],
   map:[["用途配方","布料丙烯"],["柔韧与耐洗","软而有弹性，可机洗（Tulip）/ 需熨烫热定型（Castle）","m"],["特效色","夜光（Tulip Glow）"],["适用基底","布料"],["使用场景","布料 DIY"]],
   pros:["DIY 需求稳定"], cons:["热定型麻烦","耐洗宣称参差"],
   up:["免热定型的可水洗配方（线索）"], verdict:["谨慎","Tulip 占位；免热定型是线索。"], must:["写清热定型和可洗时间"], plus:["—"], avoid:["耐洗宣称不实"]}
 ]},
 {g:"跨工具", about:"颜料 + 画布 / 画架 / 课程", items:[
  {t:"丙烯 + 画布画架套装", vol:"主流", volWhy:"ESRICH 52 件、Nicpro 68 件等带 Best Seller / Amazon's Choice 标签。",
   combo:["通用艺术丙烯","管装","学生级（白牌）","12–30 色","跨工具组合：+ 画布 / 画架 / 画笔"],
   rep:"ESRICH 26 / 52 件、Nicpro 68 件、KEFF、Shuttle Art 54 件、Arteza 35 件；Apple Barrel 课程套装（23 色 + 10 支笔 + 6 节视频）",
   price:"US $20–60", who:"初学者、礼品、亲子", comp:"hi", compT:"高：白牌堆件数",
   pain:"件数多但颜料量少（12ml）；画布、画架品质差", ev:["esrichLink","appleLessonsLink"], evl:"有来源",
   fig:{k:"easel"},
   ex:[["esrich52","2 个画架、20 支画笔、24 支 12ml 颜料、4 块圆画布"],["shuttle54","30 色 + 木画架 + 画布"],["artezaKit35","24 色 + 5 支笔 + 调色刀 + 画本"],["appleLessons","Apple Barrel 23 色 + 10 支笔 + 6 节视频课"]],
   map:[["用途配方","通用艺术丙烯"],["单件容量","12ml"],["混装方式","跨工具组合"],["数量登记口径","配件件数（画布、画架、画笔、杯）"],["随附配件","画布、画架、画笔、调色盘、视频课程"],["目标人群","初学者 / 成人兴趣、礼品购买者"]],
   pros:["礼品属性强，客单价高"], cons:["件数虚高","颜料量少"],
   up:["课程内容化（参考 Apple Barrel 视频课）","更大容量颜料"], verdict:["可做","对应机会 B“内容化丙烯入门套装”。"],
   must:["主图写清颜料支数、容量和配件件数"], plus:["视频课程"], avoid:["件数虚高"]}
 ]}
],

opps:[
 {t:"内容化丙烯入门套装（课程 + 套装）", gap:"场景缺口", score:{d:3,c:3,x:4,s:4,p:3,e:3},
  why:"画布画架套装卖得好，但白牌主要靠堆件数（52、68 件），颜料多是 12ml。Apple Barrel 做了“颜料 + 画笔 + 6 节视频课”，说明内容能成为差异点；白牌套装里带系统课程的少。",
  spec:["通用艺术丙烯","管装 22ml","18–24 色","画布 + 画笔","分阶段视频课（二维码）"],
  diff:"“跟着课画完第一幅”，主图展示课程成品", price:"US $30–45",
  risk:"课程制作成本；版权；内容要持续更新", verify:"拉 acrylic painting kit for beginners with lessons 的搜索量；看 Apple Barrel 课程套装的评论数和评价重点",
  from:"丙烯 + 画布画架套装", ev:["appleLessonsLink","esrichLink"], evl:"部分来源"},
 {t:"高成功率倾倒画套装", gap:"痛点缺口", score:{d:3,c:2,x:3,s:4,p:3,e:3},
  why:"倾倒画失败的主要原因是稠度不对和硅油用量不对（太稠开裂、太稀露底、硅油多了出坑）。现有预混套装多只卖颜料，指引不足。",
  spec:["倾倒预混丙烯 12–24 色","统一稠度","定量硅油（滴管）","倾倒剂","步骤卡 / 视频"],
  diff:"“第一次就出细胞”的成功率卖点", price:"US $28–40",
  risk:"卖家多，卖点易被模仿", verify:"抓倾倒套装 Top 20 差评里 too thick / no cells / cracking 的占比",
  from:"倾倒画预混丙烯", ev:["pourGuide","pourLink"], evl:"有来源"},
 {t:"防卡盖管装丙烯", gap:"痛点缺口", score:{d:3,c:2,x:3,s:3,p:2,e:3},
  why:"管装丙烯卡盖、管口干结是论坛常见抱怨，Golden、W&N 都专门写了处理方法。但瓶装手工丙烯已用翻盖解决，管装价格带被品牌和自营占满。",
  spec:["通用艺术丙烯","管装","防粘管口 / 翻盖","24 色 22ml"], diff:"演示“不卡盖”", price:"US $22–30",
  risk:"改进点小；成本上升", verify:"抓管装丙烯 Top 20 差评里 cap / stuck / dried 的占比",
  from:"管装学生丙烯套装", ev:["goldenTube","wnCap","paintersCaps"], evl:"有来源"},
 {t:"免热定型的可水洗布料丙烯", state:"clue", gap:"痛点缺口",
  why:"布料丙烯多数需要熨烫热定型，步骤麻烦；Tulip Soft 写明 72 小时后可机洗，Castle 页面前后矛盾。是否有“免热定型、风干即耐洗”的明确需求，证据不足。",
  spec:["布料丙烯","免热定型","可机洗"], verify:"抓布料丙烯差评里 heat set / washed off / cracked 的占比", from:"布料丙烯", ev:["tulipLink","castleFabricLink"], evl:"部分来源"},
 {t:"户外 / 多基底手工丙烯", state:"out", gap:"场景缺口",
  why:"最初判断石头彩绘、户外手工需要专门的耐候丙烯。",
  outWhy:"核实后 FolkArt 已有户外亮光和多基底系列（用于石头彩绘），Apple Barrel 有多基底缎光套装，老牌手工品牌已覆盖。",
  spec:["户外 / 多基底丙烯","挤压瓶"], from:"户外 / 多基底丙烯", ev:["folkartLink"], evl:"有来源"}
],

grids:[
 {id:"form",name:"用途配方 × 剂型",q:"每种配方在哪种剂型上还没人做？",rowT:"用途配方",colT:"剂型",
  cols:["管装","挤压瓶","大瓶 / 罐","倾倒预混瓶"],
  rk:["acrylic paint","craft acrylic paint","acrylic pouring paint","fabric paint","outdoor acrylic paint"], ck:["tubes set","bottles 2oz","8 oz bottles","pre-mixed"],
  rc:["丙烯","手工 丙烯","流体 丙烯","布料 丙烯","户外 丙烯"], cc:["管装","瓶装","大瓶","预混"],
  rows:[
   ["通用艺术丙烯",[["R3","Liquitex BASICS、Arteza、Amazon Basics、Castle",{r:["liqBasics24","artezaAcr24","amzBasicsAcr"],t:["管装学生丙烯套装","专业重身丙烯"],o:"防卡盖管装丙烯",tier:[2,2,2]}],["S1","—"],["S2","大瓶白色等",{k:["acrylic paint 16 oz"]}],["X","—"]]],
   ["手工丙烯",[["X","—"],["R3","Apple Barrel、FolkArt、DecoArt",{r:["appleB18","folkart24","decoart24"],t:["瓶装手工丙烯"]}],["S3","Apple Barrel 8oz",{r:["appleB8"]}],["X","—"]]],
   ["倾倒预混",[["X","—"],["X","—"],["S1","—"],["R3","Pouring Masters、Arteza、Funto",{r:["pourMasters18","artezaPour32","funto36"],t:["倾倒画预混丙烯"],o:"高成功率倾倒画套装"}]]],
   ["布料丙烯",[["S1","Tulip 管装",{r:["tulipSoft10"]}],["S2","Tulip、Castle 3D",{r:["tulipSoft10","castleFabric"],t:["布料丙烯"]}],["S1","Tulip 大瓶"],["X","—"]]],
   ["户外 / 多基底",[["X","—"],["S2","FolkArt、Apple Barrel",{r:["folkartMS16","appleMS12"],t:["户外 / 多基底丙烯"],o:"户外 / 多基底手工丙烯"}],["S1","—"],["X","—"]]]]},

 {id:"grade",name:"等级 × 稠度",q:"每个等级在哪种稠度上还没人做？",rowT:"颜料等级",colT:"稠度",
  cols:["高流动 / 流体","软体","重身"],
  rk:["craft acrylic","acrylic paint set","liquitex basics","professional acrylic"], ck:["fluid","soft body","heavy body"],
  rc:["手工 丙烯","丙烯 套装","学院级 丙烯","专业 丙烯"], cc:["流体","软体","重身"],
  rows:[
   ["手工 / 儿童级",[["S2","倾倒预混",{r:["pourMasters18"]}],["R3","Apple Barrel、FolkArt",{r:["appleB18","folkart24"]}],["X","—"]]],
   ["学生级（白牌）",[["S3","倾倒套装",{r:["artezaPour32","funto36"]}],["R3","Arteza、Castle",{r:["artezaAcr24","castle24"]}],["S1","—"]]],
   ["学院级",[["S1","—"],["R3","Liquitex BASICS、Amazon Basics",{r:["liqBasics24","amzBasicsAcr"]}],["S1","—"]]],
   ["艺术家级",[["S2","Golden Fluid、High Flow",{k:["golden fluid acrylic set"]}],["S1","—"],["S2","Golden、Liquitex HB",{r:["goldenMix","goldenIntro"]}]]]]},

 {id:"price",name:"套装结构 × 价格带",q:"每种套装在哪个价位还空着？",rowT:"套装结构",colT:"整套售价（美国站）",
  cols:["< $15","$15–30","$30–60","$60+"], price:["0-1500","1500-3000","3000-6000","6000-100000"],
  rk:["acrylic paint tubes set 24","craft acrylic paint set","acrylic pouring paint set","fabric paint set","heavy body acrylic set","acrylic paint set with canvas easel"],
  rc:["丙烯 管装 24色","手工 丙烯 套装","流体 丙烯 套装","布料 丙烯","专业 丙烯","丙烯 画布 画架 套装"], cc:["","","",""],
  rows:[
   ["管装 24 色",[["S2","Castle 12ml",{r:["castle24"]}],["R3","Arteza 约 $24.64、Amazon Basics",{r:["artezaAcr24","amzBasicsAcr"]}],["S2","Liquitex BASICS 约 $38.67",{r:["liqBasics24"]}],["S1","Liquitex HB 24",{r:["liqHBSearch"]}]]],
   ["瓶装手工",[["S2","—",{r:["appleB18"]}],["R3","Apple Barrel 8 × 8oz 约 $22",{r:["appleB8","folkart24"]}],["S1","—",{r:["decoart24"]}],["X","—"]]],
   ["倾倒套装",[["X","—"],["R3","8 × 100ml 约 $26.99、Pouring Masters",{r:["pour8x100","pourMasters18"]}],["S2","Funto 36、Arteza 32",{r:["funto36","artezaPour32"]}],["L1","—"]]],
   ["布料丙烯",[["S2","Tulip 10 色",{r:["tulipSoft10"]}],["S2","Castle 3D 24",{r:["castleFabric"]}],["L1","—"],["X","—"]]],
   ["专业重身",[["X","—"],["L1","—"],["S2","Golden Intro",{r:["goldenIntro"]}],["S2","Golden Mixing、Liquitex HB",{r:["goldenMix","liqHBSearch"]}]]],
   ["丙烯 + 画布画架",[["S1","—"],["R3","ESRICH 26 / 52 件",{r:["esrich52","shuttle54"]}],["L2","带系统课程的套装少",{r:["appleLessons"],o:"内容化丙烯入门套装（课程 + 套装）",ev:"部分来源"}],["L1","—"]]]]},

 {id:"scene",name:"使用场景 × 关键卖点",q:"每个场景最在意的卖点，有没有产品明确满足？",rowT:"使用场景",colT:"关键卖点",
  cols:["不卡盖 / 不干结","高覆盖","耐候 / 耐洗","开瓶即用的稠度","课程 / 教程","多基底"],
  rk:["canvas painting","acrylic pouring","rock painting","fabric painting","beginner acrylic"], ck:["no dry cap","high coverage","weather resistant washable","pre-mixed","lessons","multi surface"],
  rc:["画布 丙烯","流体画","石头 彩绘","布料 丙烯","丙烯 入门"], cc:["不卡盖","覆盖","耐候 耐洗","预混","教程","多基底"],
  rows:[
   ["画布绘画",[["L2","管装卡盖常见",{r:["liqBasics24"],o:"防卡盖管装丙烯",ev:"有来源"}],["S2","—",{r:["goldenMix"]}],["X","—"],["X","—"],["L1","—"],["X","—"]]],
   ["倾倒画",[["S2","瓶装",{r:["pourMasters18"]}],["X","—"],["X","—"],["L3","有预混，但成功率指引不足",{r:["pourMasters18","funto36"],o:"高成功率倾倒画套装",ev:"有来源"}],["L2","—",{o:"高成功率倾倒画套装"}],["S1","—"]]],
   ["石头彩绘",[["S3","翻盖瓶",{r:["appleB18"]}],["L1","手工丙烯需多层"],["S2","FolkArt Outdoor",{r:["folkartMS16"],o:"户外 / 多基底手工丙烯"}],["X","—"],["S1","—"],["S3","—",{r:["appleMS12"]}]]],
   ["布料 DIY",[["S2","—"],["S1","—"],["L0","免热定型的款少",{r:["tulipSoft10","castleFabric"],o:"免热定型的可水洗布料丙烯",clue:true}],["X","—"],["S1","—"],["S1","—"]]],
   ["初学者入门",[["S1","—"],["S1","—"],["X","—"],["X","—"],["L3","白牌套装少有系统课程",{r:["appleLessons","esrich52"],o:"内容化丙烯入门套装（课程 + 套装）",ev:"部分来源"}],["S2","—"]]]]}
],

refs:{
 liqBasics24:["Liquitex BASICS 24 × 22ml","https://www.amazon.com/dp/B075ZBN845"], artezaAcr24:["Arteza 丙烯 24 × 22ml","https://www.amazon.com/dp/B078CYM62J"], amzBasicsAcr:["Amazon Basics 丙烯 24 色","https://www.amazon.com/clp/B0B7QP2JGM"], castle24:["Castle 丙烯 24 × 12ml","https://www.amazon.com/dp/B017P5FFCU"],
 goldenMix:["Golden Heavy Body Mixing 12 支","https://www.amazon.com/dp/B0BQL273D7"], goldenIntro:["Golden Heavy Body Intro 6 支","https://www.amazon.com/clp/B0BQKGS1HH"],
 liqHBSearch:["Liquitex Heavy Body 套装（搜索页）","https://www.amazon.com/liquitex-heavy-body-acrylic-paint-set/s?k=liquitex+heavy+body+acrylic+paint+set"],
 appleB8:["Apple Barrel 8 × 8oz 哑光","https://www.amazon.com/dp/B08WHP8FX1"], appleB18:["Apple Barrel 18 × 2oz","https://www.amazon.com/dp/B00ATJSD8I"], appleMS12:["Apple Barrel 多基底缎光 12 色","https://www.amazon.com/clp/B0D9R46NK3"],
 folkart24:["FolkArt 24 × 2oz + 画笔","https://www.amazon.com/clp/B085ZBT1J7"], folkartMS16:["FolkArt 多基底 16 色","https://www.amazon.com/clp/B076CSZPB5"], decoart24:["DecoArt 24 × 2oz","https://www.amazon.com/clp/B0CSRS31QR"],
 appleLessons:["Apple Barrel 课程套装（含视频）","https://www.amazon.com/dp/B09LP3RQF4"],
 pourMasters18:["Pouring Masters 18 色倾倒丙烯","https://www.amazon.com/dp/B07ZG129D3"], artezaPour32:["Arteza 倾倒丙烯 32 × 2oz","https://www.amazon.com/dp/B07YGTXZSR"], funto36:["Funto 倾倒丙烯 36 瓶（含硅油）","https://www.amazon.com/dp/B09CPJ8R6L"], pour8x100:["倾倒丙烯 8 × 100ml","https://www.amazon.com/dp/B0C262C3RQ"],
 castleMetal:["Castle 金属丙烯 24 色","https://www.amazon.com/clp/B0DP344BF5"],
 metalAcrSearch:["Amazon 搜索：metallic acrylic paint set","https://www.amazon.com/s?k=metallic+acrylic+paint+set"],
 tulipSoft10:["Tulip 布料丙烯 10 色","https://www.amazon.com/dp/B00DV930EA"], castleFabric:["Castle 3D 布料丙烯 24 色","https://www.amazon.com/dp/B07531MSVC"], tulipMedium:["Tulip 织物媒介剂 8oz","https://www.amazon.com/clp/B08J9N3M86"],
 esrich52:["ESRICH 52 件丙烯画布套装","https://www.amazon.com/clp/B0BZZ2MF9L"], shuttle54:["Shuttle Art 54 件套装","https://www.amazon.com/clp/B0CGLHVV7L"], artezaKit35:["Arteza 35 件丙烯套装","https://www.amazon.com/dp/B09GVHPTP7"]
},

src:{
 liqBasicsLink:["Liquitex BASICS 24 色（Amazon）","https://www.amazon.com/dp/B075ZBN845"],
 goldenTube:["Golden：管装颜料保养（防干、卡盖）","https://justpaint.org/tube-maintenance-for-golden-artist-colors-products/"],
 wnCap:["Winsor & Newton：清理管口防卡盖","https://www.winsornewton.com/int/education/guides/cleaning-acrylic-paint-from-tube-caps/"],
 paintersCaps:["Painters Online：管盖断裂讨论","https://www.painters-online.co.uk/forum/general-art-discussion/caps-breaking-on-tubes-of-paint/"],
 goldenLink:["Golden Heavy Body Mixing Set（Amazon）","https://www.amazon.com/dp/B0BQL273D7"],
 appleLink:["Apple Barrel 8 × 8oz（Amazon，AP 认证）","https://www.amazon.com/dp/B08WHP8FX1"],
 folkartLink:["FolkArt 多基底丙烯（Amazon）","https://www.amazon.com/clp/B076CSZPB5"],
 pourGuide:["倾倒画常见问题：稠度和硅油","https://acrylicpouring.com/acrylic-pouring-problem-solving/"],
 pourLink:["Amazon：倾倒丙烯预混套装","https://www.amazon.com/Acrylic-Paints-Pouring/s?k=Acrylic+Paints+for+Pouring"],
 castleMetalLink:["Castle 金属丙烯（Amazon）","https://www.amazon.com/clp/B0DP344BF5"],
 tulipLink:["Tulip 布料丙烯（Amazon）","https://www.amazon.com/dp/B00DV930EA"],
 castleFabricLink:["Castle 3D 布料丙烯（Amazon，页面描述矛盾）","https://www.amazon.com/dp/B07531MSVC"],
 esrichLink:["ESRICH 52 件套装（Amazon）","https://www.amazon.com/clp/B0BZZ2MF9L"],
 appleLessonsLink:["Apple Barrel 课程套装（Amazon）","https://www.amazon.com/dp/B09LP3RQF4"]
}
});
