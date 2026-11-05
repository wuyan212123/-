
/* ======================================================================
   开品维度图谱 · 通用引擎
   读取 CATS（每个品类一个对象，见 src/categories/_template.js），渲染：
   思维导图 / 详情 / 白地图 / 类型档案 / 对照表 / 机会评估 / 方法与规则
   ====================================================================== */
const SCORE_DEF = [
  {k:"d", n:"需求信号",   w:.25, desc:"搜索量、销量信号、人群规模。5 = 有明确强需求"},
  {k:"c", n:"竞争空间",   w:.20, desc:"5 = 几乎没有同类产品，1 = 红海"},
  {k:"x", n:"差异化可展示", w:.15, desc:"卖点能否在主图 / 视频里一眼看懂"},
  {k:"s", n:"供应链可行", w:.15, desc:"工厂能力、开模、品控难度。5 = 现成供应链"},
  {k:"p", n:"利润空间",   w:.15, desc:"建议售价与成本、广告费的差距"},
  {k:"e", n:"依据强度",   w:.10, desc:"5 = 有多个直接来源，1 = 纯推断"}
];
const PRI_NAME = {A:"A 优先验证", B:"B 次优先", C:"C 先观察", Q:"线索（证据不足，待验证）", X:"已排除（核实后不成立）"};
const FLAG = {m:["厂家","f-m"], s:["卖家","f-s"], t:["评测","f-t"], u:["未披露","f-u"], j:["推断",""]};
const VOL = {"主流":"", "细分":"v2", "小众":"v3"};
const INFO = [["ex","示例商品"],["map","对应分类维度"],["pc","优势与缺点"],["up","升级方向与机会判断"],["chk","新品属性清单"]];

/* ---------- 评分 ---------- */
function scoreOf(o){ if(!o.score) return null; return Math.round(SCORE_DEF.reduce((a,d)=>a+(o.score[d.k]||0)*d.w,0)*100)/100; }
function priOf(o){ if(o.state==="clue") return "Q"; if(o.state==="out") return "X"; const t=scoreOf(o); return t>=3.5?"A":t>=3.0?"B":"C"; }
CATS.forEach(cat=>cat.opps.forEach(o=>{ o.total=scoreOf(o); o.pri=priOf(o); }));
/* 示例商品可以写成 [参考商品 key, 快照说明]，这里展开成 {n,u,s} */
CATS.forEach(cat=>cat.types.forEach(g=>g.items.forEach(it=>{
  it.ex=(it.ex||[]).map(e=>Array.isArray(e) ? (cat.refs[e[0]] ? {n:cat.refs[e[0]][0], u:cat.refs[e[0]][1], s:e[1]||""} : {n:"（缺少参考商品 "+e[0]+"）", u:"#", s:""}) : e);
})));

/* ---------- 组装三大块 ---------- */
function build(cat){
  let hue=0;
  const catNode=(c)=>{ hue++; return {t:c.t, role:"cat", hc:`var(--w${((hue-1)%10)+1})`, c:(c.c||[]).map(d=>({...d, role:"dim", c:(d.c||[]).map(v=>({...v, role:"val"}))}))}; };
  const nType=cat.types.reduce((a,g)=>a+g.items.length,0), nDim=cat.dims.reduce((a,g)=>a+g.cats.reduce((b,c)=>b+c.c.length,0),0);
  const order=["A","B","C","Q","X"];
  return {t:cat.name, sub:cat.en, role:"root", scope:cat.scope, c:[
    {t:"① 市场在售商品类型", role:"sec", sec:"types", hc:"var(--s1)", n:`${cat.types.length} 组 · ${nType} 个类型`,
     about:"已观察到的在售类型，先按结构分组，再标市场体量。每个类型下有五项：示例商品、对应分类维度、优势与缺点、升级方向与机会判断、新品属性清单。",
     c:cat.types.map(g=>({t:g.g, role:"grp", about:g.about, c:g.items.map(it=>({...it, role:"type", grp:g.g, c:INFO.map(([k,t])=>({t, role:"info", kind:k, ref:it}))}))}))},
    {t:"② 分类维度", role:"sec", sec:"dims", hc:"var(--s2)", n:`${nDim} 个维度，分 ${cat.dims.length} 组`,
     about:"所有分类维度及取值。产品本体决定“是什么”，销售形态决定“怎么卖”，市场定位决定“卖给谁、卖什么价”。",
     c:cat.dims.map(g=>({t:g.g, role:"grp", about:g.about, c:g.cats.map(catNode)}))},
    {t:"③ 缺口与开品机会", role:"sec", sec:"opps", hc:"var(--s3)", n:`${cat.opps.filter(o=>"ABC".includes(o.pri)).length} 个机会 · ${cat.opps.filter(o=>o.pri==="Q").length} 条线索 · ${cat.opps.filter(o=>o.pri==="X").length} 个已排除`,
     about:"对比 ① 找出的缺口（假设）。按评分分 A / B / C，证据不足的列为线索，核实后不成立的列为已排除并保留原因。",
     c:order.map(p=>({t:PRI_NAME[p], role:"grp", pk:p, c:cat.opps.filter(o=>o.pri===p).sort((a,b)=>(b.total||0)-(a.total||0)).map(o=>({...o, role:"opp"}))})).filter(g=>g.c.length)}
  ]};
}
const DATA = {}; CATS.forEach(c=>DATA[c.id]=build(c));
const catById = id => CATS.find(c=>c.id===id);

/* ---------- 状态 ---------- */
const st = {tab:CATS[0].id, scale:1, sel:null, q:""};
const collapsed = {}; CATS.forEach(c=>collapsed[c.id]=new Set());
const idx = {};
function prep(root,key){ let i=0; const walk=(n,d,p,hc)=>{ n.id=key+"-"+(i++); n.d=d; n.p=p; n.hc=n.hc||hc; idx[n.id]=n; (n.c||[]).forEach(ch=>walk(ch,d+1,n,n.hc)); }; walk(root,0,null,"var(--ink-3)"); }
CATS.forEach(c=>prep(DATA[c.id],c.id));
const all = key => Object.values(idx).filter(n=>n.id.startsWith(key+"-"));
function foldDefault(key){ const s=collapsed[key]; s.clear(); all(key).forEach(n=>{ if(n.role==="cat"||n.role==="type"||(n.role==="grp"&&n.pk==="X")) s.add(n.id); }); }
CATS.forEach(c=>foldDefault(c.id));
try{ const t=localStorage.getItem("mm-tab"); if(t && DATA[t]) st.tab=t; }catch(e){}
const CUR = () => catById(st.tab);

/* ---------- 工具 ---------- */
const esc = s => String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const compLabel = {hi:"竞争 高", mid:"竞争 中", lo:"竞争 低"};
const vClass = v => v.startsWith("可做") ? "go" : v==="谨慎" ? "warn" : "no";
const verdictTag = v => v ? `<span class="vd ${vClass(v[0])}">${esc(v[0])}</span>` : "";
const volTag = v => v ? `<span class="vol ${VOL[v]||""}">${esc(v)}</span>` : "";
const tagPill = t => t ? `<i class="pill ${t}">${t==="L0"?"门槛":t}</i>` : "";
const flagTag = f => f && FLAG[f] ? `<i class="fl ${FLAG[f][1]}">${FLAG[f][0]}</i>` : "";
const priTag = p => `<i class="pri ${p}">${p==="Q"?"?":p==="X"?"×":p}</i>`;
const li = a => (a||[]).map(x=>`<li>${esc(x)}</li>`).join("");
function hay(n){ return [n.t,n.n,(n.kw||[]).join(" "),(n.combo||[]).join(" "),(n.spec||[]).join(" "),n.rep,n.why,n.pain,(n.ex||[]).map(e=>e.n).join(" ")].filter(Boolean).join(" ").toLowerCase(); }
const matches = n => !!st.q && n.role!=="info" && hay(n).includes(st.q.toLowerCase());
const evLinks = keys => { const S=CUR().src; return (keys||[]).filter(k=>S[k]).map(k=>`<li><a href="${S[k][1]}" target="_blank" rel="noopener">${esc(S[k][0])}</a></li>`).join(""); };
const dimNode = (tab,name) => all(tab).find(x=>x.role==="dim" && x.t===name);
const oppByTitle = t => CUR().opps.find(x=>x.t===t);
function scoreHTML(o){
  if(!o.score) return "";
  return `<div class="score">${SCORE_DEF.map(d=>`<span title="${esc(d.desc)}">${d.n} ×${d.w}</span><span class="bar5"><i style="width:${(o.score[d.k]||0)*20}%"></i></span><b>${o.score[d.k]||0}</b>`).join("")}</div><p class="fine">总分 <span class="stotal">${o.total.toFixed(2)}</span> → ${priTag(o.pri)} 优先级。悬停项目名查看评分口径。</p>`;
}
const miniScore = o => o.score ? `<span class="mini5">${SCORE_DEF.map(d=>`<i style="--h:${(o.score[d.k]||0)*20}%" title="${d.n} ${o.score[d.k]}"></i>`).join("")}</span>` : "";

/* 类型五项内容（画布卡片和详情面板共用） */
function infoHTML(kind, it, tab){
  switch(kind){
    case "ex": return `${it.fig?fig(it.fig):""}<ol class="exl">${(it.ex||[]).map(e=>`<li><a href="${e.u}" target="_blank" rel="noopener">${esc(e.n)}</a><span>${esc(e.s)}</span></li>`).join("")}</ol><p class="fine">示意图是结构示意，不是实拍。评分、价格、徽章为搜索时的页面快照（${esc(CUR().updated)}），以链接实时页面为准。</p>`;
    case "map": return `<table class="dmap">${(it.map||[]).map(([d,v,f])=>{ const dn=dimNode(tab,d); return `<tr><th><button type="button" class="dlink" data-dim="${esc(d)}" title="在 ② 中定位">${tagPill(dn&&dn.tag)}${esc(d)}</button></th><td>${esc(v)}${flagTag(f)}</td></tr>`; }).join("")}</table>`;
    case "pc": return `<div class="pc"><div><h5 class="plus">优势</h5><ul>${li(it.pros)}</ul></div><div><h5 class="minus">缺点 / 差评</h5><ul>${li(it.cons)}</ul></div></div>`;
    case "up": return `<h5>可升级的方向</h5><ul>${li(it.up)}</ul><h5>能否作为新品机会 ${verdictTag(it.verdict)}</h5><p>${esc(it.verdict&&it.verdict[1])}</p>`;
    case "chk": return `<div class="chk"><div><h5 class="must">必须具备</h5><ul>${li(it.must)}</ul></div><div><h5 class="plus">建议加分</h5><ul>${li(it.plus)}</ul></div><div><h5 class="minus">必须避免</h5><ul>${li(it.avoid)}</ul></div></div>`;
  }
}

/* ---------- 思维导图画布 ---------- */
const cv=document.getElementById("cv"), lk=document.getElementById("lk"), sizer=document.getElementById("sizer"), vp=document.getElementById("vp");
function nodeHTML(n, isCol){
  const cnt = isCol && n.c ? `<span class="cnt">+${n.c.length}</span>` : "";
  switch(n.role){
    case "root": return `${esc(n.t)}<small>${esc(n.sub)}</small>`;
    case "sec":  return `${esc(n.t)}${cnt}<span class="n">${esc(n.n)}</span>`;
    case "grp": case "cat": return `${esc(n.t)}${cnt}`;
    case "dim":  return `${tagPill(n.tag)}${esc(n.t)}${cnt}`;
    case "val":  return `${esc(n.t)}${n.n?`<span class="n">${esc(n.n)}</span>`:""}`;
    case "type": return `<div class="tt"><b>${esc(n.t)}</b>${volTag(n.vol)}<span class="comp ${n.comp}">${compLabel[n.comp]}</span>${verdictTag(n.verdict)}</div><div class="combo">${n.combo.map(esc).join(" · ")}</div><div class="meta">${esc(n.price)}${isCol?` · <span class="more">展开 5 项 ▸</span>`:""}</div>`;
    case "opp":  return `<div class="tt">${priTag(n.pri)}<b>${esc(n.t)}</b><span class="gap">${esc(n.gap)}</span></div><div class="combo">${n.spec.map(esc).join(" · ")}</div><div class="meta">${n.pri==="X"?"已排除："+esc(n.outWhy||""):n.pri==="Q"?"线索 · 待验证 · "+esc(n.price||""):`评分 ${n.total.toFixed(2)} · ${esc(n.price)} · 依据：${esc(n.evl)}`}</div>`;
    case "info": return `<div class="ih">${esc(n.t)}</div>${infoHTML(n.kind, n.ref, st.tab)}`;
  }
}
function render(){
  const root=DATA[st.tab], cs=collapsed[st.tab];
  cv.querySelectorAll(".node").forEach(e=>e.remove());
  const vis=[]; const walk=n=>{ vis.push(n); if(n.c && !cs.has(n.id)) n.c.forEach(walk); }; walk(root);
  const els={};
  vis.forEach(n=>{
    const e=document.createElement("div");
    e.className=`node ${n.role}${n.kind?" k-"+n.kind:""}${n.role==="opp"?" st-"+n.pri:""}${st.sel===n.id?" sel":""}${matches(n)?" hit":""}`;
    e.tabIndex=0; e.dataset.id=n.id; e.style.setProperty("--hue",n.hc);
    e.innerHTML=nodeHTML(n, cs.has(n.id)); cv.appendChild(e); els[n.id]=e;
    n.w=e.offsetWidth; n.h=e.offsetHeight;
  });
  const gapX = n => n.role==="root"?56 : n.role==="sec"?48 : 40;
  const gapY = n => ({sec:28, grp:16, cat:12, type:12, opp:10, dim:8, info:10})[n.role] ?? 4;
  let y=56;
  const lay=n=>{
    n.x = n.p ? n.p.x + n.p.w + gapX(n.p) : 24;
    const kids = n.c && !cs.has(n.id) ? n.c : null;
    if(!kids){ n.y=y; y+=n.h+gapY(n); return; }
    kids.forEach(lay);
    if(n.role==="sec") y+=24; else if(["grp","cat","type"].includes(n.role)) y+=8;
    const a=kids[0], b=kids[kids.length-1];
    n.y=Math.max((a.y+a.h/2 + b.y+b.h/2)/2 - n.h/2, 0);
  };
  lay(root);
  let W=0,H=0;
  vis.forEach(n=>{ els[n.id].style.left=n.x+"px"; els[n.id].style.top=n.y+"px"; W=Math.max(W,n.x+n.w); H=Math.max(H,n.y+n.h); });
  W+=40; H+=40;
  let p="";
  vis.forEach(n=>{ if(!n.p) return; const a=n.p; const x1=a.x+a.w, y1=a.y+a.h/2, x2=n.x, y2=n.y+Math.min(n.h/2,22), mx=(x1+x2)/2;
    const sw = n.role==="sec"?2.4 : (n.role==="grp"||n.role==="cat")?1.8 : n.role==="val"?1:1.4;
    p+=`<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" stroke="${n.hc}" stroke-width="${sw}" stroke-opacity="${n.role==="val"||n.role==="info"?.55:.85}" fill="none"${n.role==="opp"&&n.pri==="X"?' stroke-dasharray="4 3"':""}/>`; });
  lk.setAttribute("width",W); lk.setAttribute("height",H); lk.innerHTML=p;
  cv.style.width=W+"px"; cv.style.height=H+"px"; cv.style.transform=`scale(${st.scale})`;
  sizer.style.width=W*st.scale+"px"; sizer.style.height=H*st.scale+"px";
  document.getElementById("z-fit").textContent=Math.round(st.scale*100)+"%";
}
function scrollToNode(n, smooth){
  if(!n || n.y===undefined) return;
  vp.scrollTo({left:Math.max(0,(n.x-40)*st.scale), top:Math.max(0, sizer.offsetTop + n.y*st.scale - 70), behavior:smooth?"smooth":"auto"});
}
function centerRoot(){ const r=DATA[st.tab]; if(r.y===undefined) return; vp.scrollTop=Math.max(0, sizer.offsetTop + (r.y+r.h/2)*st.scale - vp.clientHeight/2); vp.scrollLeft=0; }
function focusNode(n, opts={}){
  const s=collapsed[st.tab]; let c=n.p; while(c){ s.delete(c.id); c=c.p; }
  if(opts.open) s.delete(n.id);
  st.sel=n.id; render(); showDetail(n); scrollToNode(n,true);
}
function goMap(){ document.getElementById("s-map").scrollIntoView({behavior:"smooth",block:"start"}); }
function jumpDim(name){ const d=dimNode(st.tab,name); if(d){ focusNode(d,{open:true}); goMap(); } }

/* ---------- 详情面板 ---------- */
const det=document.getElementById("detail");
function crumbs(n){ const a=[]; let c=n.p; while(c){ a.unshift(c.t); c=c.p; } return a.join(" › "); }
function showDetail(n){
  n = n || DATA[st.tab];
  if(n.role==="info") n=n.p;
  const lv={L1:"品类定义维度：决定开什么品",L2:"规格变体维度：决定 SKU / 变体",L3:"卖点差异维度：决定溢价和卖点",L0:"合规门槛：不满足就不能卖"};
  let h=`<div class="eyebrow">${esc(crumbs(n)||"品类定义与范围")}</div>`;
  if(n.role==="type"){
    h+=`<h2>${esc(n.t)}</h2><div class="row">${volTag(n.vol)}<span class="comp ${n.comp}">${esc(n.compT)}</span>${verdictTag(n.verdict)}</div>`;
    if(n.volWhy) h+=`<p class="fine">体量依据：${esc(n.volWhy)}</p>`;
    h+=`<h3>维度组合</h3><div class="chips">${n.combo.map(c=>`<span class="chip">${esc(c)}</span>`).join("")}</div>`;
    h+=`<h3>代表品牌 / 商品</h3><p>${esc(n.rep)}</p><h3>价格带</h3><p>${esc(n.price)}</p><h3>主力人群与场景</h3><p>${esc(n.who)}</p><h3>常见差评</h3><p>${esc(n.pain)}</p>`;
    INFO.forEach(([k,t])=>{ h+=`<h3>${t}</h3><div class="dinfo">${infoHTML(k,n,st.tab)}</div>`; });
    const rel=CUR().opps.filter(o=>(o.from||"").includes(n.t));
    if(rel.length) h+=`<h3>相关开品机会</h3><ul>${rel.map(o=>`<li>${priTag(o.pri)} ${esc(o.t)}</li>`).join("")}</ul>`;
    h+=`<h3>依据 <span class="evtag">${esc(n.evl)}</span></h3><ul class="ev">${evLinks(n.ev)}</ul>`;
  } else if(n.role==="opp"){
    h+=`<h2>${esc(n.t)}</h2><div class="row">${priTag(n.pri)}<span class="gap">${esc(n.gap)}</span><span class="evtag">依据：${esc(n.evl)}</span></div>`;
    if(n.pri==="X") h+=`<h3>排除原因</h3><p>${esc(n.outWhy)}</p>`;
    h+=`<h3>${n.pri==="X"?"最初的判断":"缺口依据"}</h3><p>${esc(n.why)}</p>`;
    if(n.score) h+=`<h3>评分卡</h3>${scoreHTML(n)}`;
    h+=`<h3>机会品维度组合</h3><div class="chips">${n.spec.map(c=>`<span class="chip">${esc(c)}</span>`).join("")}</div>`;
    if(n.diff) h+=`<h3>差异化</h3><p>${esc(n.diff)}</p>`;
    if(n.price) h+=`<h3>建议价格</h3><p>${esc(n.price)}</p>`;
    h+=`<h3>对标的在售类型</h3><p>${esc(n.from)}</p>`;
    if(n.risk) h+=`<h3>风险</h3><p>${esc(n.risk)}</p>`;
    if(n.verify) h+=`<h3>验证方法</h3><p>${esc(n.verify)}</p>`;
    if(n.ev && n.ev.length) h+=`<h3>来源</h3><ul class="ev">${evLinks(n.ev)}</ul>`;
  } else if(n.role==="sec"||n.role==="grp"){
    h+=`<h2>${esc(n.t)}</h2>`;
    if(n.about) h+=`<p>${esc(n.about)}</p>`;
    h+=`<h3>包含（${n.c.length}）</h3><ul>${n.c.map(c=>`<li>${c.pri?priTag(c.pri)+" ":""}${tagPill(c.tag)}${esc(c.t)}${c.vol?" "+volTag(c.vol):""}${c.n?`：<span style="color:var(--ink-3)">${esc(c.n)}</span>`:""}</li>`).join("")}</ul>`;
  } else {
    h+=`<h2>${tagPill(n.tag)}${esc(n.t)}</h2>`;
    if(n.tag) h+=`<p><b>${lv[n.tag]}</b></p>`;
    if(n.role==="root"){ const sc=n.scope;
      h+=`<h3>品类定义</h3><p>${esc(sc.def)}</p><h3>纳入</h3><p>${esc(sc.include)}</p><h3>不纳入</h3><p>${esc(sc.exclude)}</p><h3>邻近品类（单独记录）</h3><p>${esc(sc.adjacent)}</p>`;
      if(sc.kw) h+=`<h3>平台搜索关键词</h3><div class="chips">${sc.kw.map(k=>`<span class="kw">${esc(k)}</span>`).join("")}</div>`;
      h+=`<h3>怎么读这张图</h3><p>根节点下分三块：① 在售类型（已观察）、② 分类维度、③ 缺口与机会（假设）。① 的类型卡片展开后有五项；“对应分类维度”里的维度名可以点，会跳到 ② 里对应的位置。</p>`;
    } else {
      if(n.def) h+=`<h3>定义</h3><p>${esc(n.def)}</p>`; else if(n.n) h+=`<h3>说明</h3><p>${esc(n.n)}</p>`;
      if(n.rule) h+=`<h3>判定 / 登记规则</h3><p>${esc(n.rule)}</p>`;
      if(n.c && n.role==="dim") h+=`<h3>取值（${n.c.length}）</h3><ul>${n.c.map(c=>`<li>${esc(c.t)}${c.n?`：<span style="color:var(--ink-3)">${esc(c.n)}</span>`:""}</li>`).join("")}</ul>`;
      if(n.role==="dim"){ const used=all(st.tab).filter(x=>x.role==="type" && (x.map||[]).some(([d])=>d===n.t)); if(used.length) h+=`<h3>在售类型在这个维度上的取值</h3><ul>${used.map(x=>{ const m=x.map.find(([d])=>d===n.t); return `<li><b>${esc(x.t)}</b>：${esc(m[1])}${flagTag(m[2])}</li>`; }).join("")}</ul>`; }
      if(n.c && n.role==="cat") h+=`<h3>包含维度</h3><ul>${n.c.map(c=>`<li>${tagPill(c.tag)}${esc(c.t)}</li>`).join("")}</ul>`;
      if(n.kw) h+=`<h3>平台搜索关键词</h3><div class="chips">${n.kw.map(k=>`<span class="kw">${esc(k)}</span>`).join("")}</div>`;
      if(n.role==="val" && !n.n) h+=`<p class="empty">这是一个取值。点击上一级维度查看定义和登记规则。</p>`;
    }
  }
  det.innerHTML=h;
}
det.addEventListener("click",e=>{ const b=e.target.closest("[data-dim]"); if(b) jumpDim(b.dataset.dim); });

/* ---------- 白地图 ---------- */
const SUP = {R:"红海",S:"有供给",L:"稀少",E:"空白",X:"不成立"};
const DEM = {3:"强",2:"中",1:"弱",0:"待验证"};
const gst = {view:{}, cell:null, only:false};
function cellInfo(c){ const code=c[0], sup=code[0], dem=code.length>1?+code[1]:null, o=c[2]||{};
  const low = sup==="L"||sup==="E"; const clue = !!o.clue || (low && dem===0); const opp = low && dem>=2 && !clue;
  return {sup, dem, note:c[1], o, opp, clue}; }
function curView(){ const g=CUR().grids; return g.find(v=>v.id===gst.view[st.tab]) || g[0]; }
function refLinks(v,ri,ci,ii){
  const o=ii.o, RF=CUR().refs, prods=(o.r||[]).map(k=>RF[k]).filter(Boolean).map(([n,u])=>({kind:"商品",n,u}));
  const q=(o.k&&o.k[0]) || [v.rk[ri], v.price?"":(v.ck||[])[ci]].filter(Boolean).join(" ");
  const search={kind:"Amazon 搜索",n:q+(v.price?`（${v.cols[ci]}）`:""),u:"https://www.amazon.com/s?k="+encodeURIComponent(q)+(v.price?"&rh=p_36%3A"+v.price[ci]:"")};
  const low=ii.sup==="L"||ii.sup==="E";
  const list = low ? prods.slice(0,2).concat([search]) : (prods.length>=3 ? prods.slice(0,3) : prods.concat([search]));
  const cq=[(v.rc||[])[ri],(v.cc||[])[ci]].filter(Boolean).join(" ");
  const jd = cq ? {n:cq,u:"https://search.jd.com/Search?keyword="+encodeURIComponent(cq)+"&enc=utf-8"} : null;
  return {list, jd, low};
}
function oppBadge(t){ const op=oppByTitle(t); if(!op) return ""; return op.pri==="X" ? `<div class="co out">${priTag("X")}已排除：${esc(op.t)}</div>` : `<div class="co">${priTag(op.pri)}${esc(op.t)}</div>`; }
function renderGrid(){
  const views=CUR().grids, v=curView();
  document.getElementById("gv-tabs").innerHTML=views.map(x=>`<button type="button" class="gv-tab" data-v="${x.id}" aria-pressed="${x.id===v.id}">${esc(x.name)}</button>`).join("");
  document.getElementById("gv-q").textContent="这张图回答："+v.q;
  const list={opp:[],clue:[],R:0,S:0,L:0,E:0,X:0};
  v.rows.forEach(([rn,cells],ri)=>cells.forEach((c,ci)=>{ const ii=cellInfo(c); list[ii.sup]++; if(ii.opp) list.opp.push([ri,ci,rn,ii]); else if(ii.clue) list.clue.push([ri,ci,rn,ii]); }));
  const chip=([ri,ci,rn,ii])=>{ const op=ii.o.o&&oppByTitle(ii.o.o); return `<button type="button" class="gv-chip ${ii.opp?"is-opp":"is-clue"}" data-ri="${ri}" data-ci="${ci}">${esc(rn)} × ${esc(v.cols[ci])}${op&&op.pri!=="X"?` <b>→ ${op.pri==="Q"?"线索":op.pri}</b>`:""}</button>`; };
  document.getElementById("gv-sum").innerHTML=`<div class="gv-counts"><span class="n-opp">${list.opp.length} 个机会格</span><span class="n-clue">${list.clue.length} 个待验证</span><span>${list.R} 红海 · ${list.S} 有供给 · ${list.L} 稀少 · ${list.E} 空白 · ${list.X} 不成立</span></div>
    <div class="gv-chips">${list.opp.map(chip).join("")}${list.clue.map(chip).join("")}</div>`;
  let h=`<thead><tr><th class="corner"><span>${esc(v.rowT)}</span><span>${esc(v.colT)} →</span></th>${v.cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>`;
  v.rows.forEach(([rn,cells],ri)=>{
    h+=`<tr><th scope="row">${esc(rn)}</th>`;
    cells.forEach((c,ci)=>{
      const ii=cellInfo(c), sel=gst.cell&&gst.cell[0]===ri&&gst.cell[1]===ci;
      const cls=`c-${ii.sup}${ii.opp?" is-opp":""}${ii.clue?" is-clue":""}${sel?" is-sel":""}${gst.only&&!ii.opp&&!ii.clue?" is-dim":""}`;
      let inner=`<div class="ct"><span class="sl">${SUP[ii.sup]}</span>${ii.sup!=="X"&&ii.dem!==null?`<span class="dm d${ii.dem}" title="需求信号：${DEM[ii.dem]}">需求 ${ii.dem?"●".repeat(ii.dem)+"○".repeat(3-ii.dem):"?"}</span>`:""}</div>${ii.note&&ii.note!=="—"?`<div class="cn">${esc(ii.note)}</div>`:""}`;
      if(ii.o.tier) inner+=`<div class="tier" title="价位分布：低 / 中 / 高">${ii.o.tier.map((x,i)=>`<i class="t${x}"><em>${"低中高"[i]}</em></i>`).join("")}</div>`;
      if(ii.sup!=="X"){ const L=refLinks(v,ri,ci,ii); inner+=`<div class="lkc">${L.list.length} 个参考链接</div>`; }
      if(ii.o.o) inner+=oppBadge(ii.o.o); else if(ii.clue) inner+=`<div class="co clue">新线索，待验证</div>`;
      h+=`<td class="${cls}" data-ri="${ri}" data-ci="${ci}" tabindex="${ii.sup==="X"?-1:0}">${inner}</td>`;
    });
    h+="</tr>";
  });
  document.getElementById("t-grid").innerHTML=h+"</tbody>";
  document.getElementById("gv-only").checked=gst.only;
  renderCell();
}
function renderCell(){
  const box=document.getElementById("gv-detail"), v=curView();
  if(!gst.cell){ box.innerHTML=`<p class="empty">点任意一格查看：判断依据、1–3 个参考链接、价位分布、验证关键词，以及关联的类型和机会。</p>`; return; }
  const [ri,ci]=gst.cell, [rn,cells]=v.rows[ri], ii=cellInfo(cells[ci]), o=ii.o;
  let h=`<div class="gd-head"><h3>${esc(rn)} × ${esc(v.cols[ci])}</h3><span class="sl s-${ii.sup}">${SUP[ii.sup]}</span>${ii.sup!=="X"&&ii.dem!==null?`<span class="evtag">需求信号：${DEM[ii.dem]}</span>`:""}<span class="evtag">依据：${esc(o.ev||"经验判断")}</span>${ii.opp?`<span class="vd go">机会格</span>`:ii.clue?`<span class="vd warn">待验证</span>`:""}</div>`;
  h+=`<div class="gd-grid"><div><h5>判断</h5><p>${esc(o.d||(ii.note!=="—"?ii.note:"这一格目前只有供给判断，没有补充说明。"))}</p>`;
  if(o.tier) h+=`<h5>价位分布</h5><p>${o.tier.map((x,i)=>`${"低中高"[i]}价位：${["无","少量","较多"][x]}`).join("；")}</p>`;
  h+=`</div><div>`;
  if(ii.sup!=="X"){ const L=refLinks(v,ri,ci,ii);
    h+=`<h5>参考链接（${L.list.length}）</h5><ol class="exl reflinks">${L.list.map(x=>`<li><span class="rk ${x.kind==="商品"?"rk-p":"rk-s"}">${x.kind}</span><a href="${x.u}" target="_blank" rel="noopener">${esc(x.n)}</a></li>`).join("")}</ol>`;
    if(L.low) h+=`<p class="fine">这一格供给少，打开搜索链接看前两页：对口商品越少，说明空档越真实。</p>`;
    if(L.jd) h+=`<p class="fine">国内参考：<a href="${L.jd.u}" target="_blank" rel="noopener">京东搜索“${esc(L.jd.n)}”</a></p>`; }
  if(o.k&&o.k.length) h+=`<h5>验证关键词 <button type="button" class="btn mini" id="gd-copy">复制</button></h5><div class="chips">${o.k.map(k=>`<span class="kw">${esc(k)}</span>`).join("")}</div><p class="fine">去卖家精灵 / Helium 10 查月搜索量和 Top 50 竞品数，搜索量高、竞品少才算真机会。</p>`;
  const rel=[...(o.t||[]).map(t=>["type",t]), ...(o.o?[["opp",o.o]]:[])];
  if(rel.length) h+=`<h5>在思维导图中查看</h5><div class="chips">${rel.map(([k,t])=>`<button type="button" class="btn mini gd-go" data-k="${k}" data-t="${esc(t)}">${k==="opp"?"机会：":"类型："}${esc(t)}</button>`).join("")}</div>`;
  h+=`</div></div>`;
  box.innerHTML=h;
  const cp=document.getElementById("gd-copy");
  if(cp) cp.addEventListener("click",()=>{ const txt=o.k.join("\n"); try{ navigator.clipboard.writeText(txt).then(()=>toast("已复制 "+o.k.length+" 个关键词"),()=>toast("复制失败，请手动选中")); }catch(e){ toast("复制失败，请手动选中"); } });
}
function selectCell(ri,ci){ gst.cell=[ri,ci]; renderGrid(); document.getElementById("gv-detail").scrollIntoView({behavior:"smooth",block:"nearest"}); }
document.getElementById("gv-tabs").addEventListener("click",e=>{ const b=e.target.closest(".gv-tab"); if(!b) return; gst.view[st.tab]=b.dataset.v; gst.cell=null; renderGrid(); });
document.getElementById("gv-sum").addEventListener("click",e=>{ const b=e.target.closest(".gv-chip"); if(b) selectCell(+b.dataset.ri,+b.dataset.ci); });
document.getElementById("t-grid").addEventListener("click",e=>{ const td=e.target.closest("td[data-ri]"); if(td && !td.classList.contains("c-X")) selectCell(+td.dataset.ri,+td.dataset.ci); });
document.getElementById("t-grid").addEventListener("keydown",e=>{ if(e.key!=="Enter"&&e.key!==" ") return; const td=e.target.closest("td[data-ri]"); if(td){ e.preventDefault(); selectCell(+td.dataset.ri,+td.dataset.ci); } });
document.getElementById("gv-only").addEventListener("change",e=>{ gst.only=e.target.checked; renderGrid(); });
document.getElementById("gv-detail").addEventListener("click",e=>{
  const b=e.target.closest(".gd-go"); if(!b) return;
  const n=all(st.tab).find(x=>x.role===b.dataset.k && x.t===b.dataset.t); if(!n) return;
  focusNode(n,{open:b.dataset.k==="type"}); goMap();
});

/* ---------- 类型档案 ---------- */
function renderProfiles(){
  let h="";
  CUR().types.forEach(g=>{
    h+=`<div class="pf-group"><h3>${esc(g.g)}${g.about?`<span>${esc(g.about)}</span>`:""}</h3><div class="profiles">`;
    g.items.forEach(it=>{
      h+=`<article class="prof"><div class="pf-fig">${it.fig?fig(it.fig):""}</div><div class="pf-body">
        <h4><button type="button" class="pf-t" data-t="${esc(it.t)}">${esc(it.t)}</button></h4>
        <div class="row">${volTag(it.vol)}<span class="comp ${it.comp}">${compLabel[it.comp]}</span>${verdictTag(it.verdict)}<span class="pf-price">${esc(it.price)}</span></div>
        <p class="pf-combo">${it.combo.map(esc).join(" · ")}</p>
        <h5>示例商品</h5><ol class="exl">${(it.ex||[]).slice(0,3).map(e=>`<li><a href="${e.u}" target="_blank" rel="noopener">${esc(e.n)}</a><span>${esc(e.s)}</span></li>`).join("")}</ol>
        ${infoHTML("pc",it,st.tab)}
        <h5>新品要求</h5><p class="pf-req"><b>必须</b>：${(it.must||[]).map(esc).join("；")}<br><b>避免</b>：${(it.avoid||[]).map(esc).join("；")}</p>
        <p class="pf-v">${esc(it.verdict&&it.verdict[1])}</p></div></article>`;
    });
    h+=`</div></div>`;
  });
  document.getElementById("profiles").innerHTML=h;
}
document.getElementById("profiles").addEventListener("click",e=>{
  const b=e.target.closest(".pf-t"); if(!b) return;
  const n=all(st.tab).find(x=>x.role==="type" && x.t===b.dataset.t); if(!n) return;
  focusNode(n,{open:true}); goMap();
});

/* ---------- 对照表与机会评估 ---------- */
function renderTables(){
  const cat=CUR();
  let h=`<thead><tr><th>类型</th><th>体量</th><th>维度组合</th><th>代表品牌 / 商品</th><th>价格带</th><th>主力人群</th><th>竞争</th><th>判断</th><th>常见差评</th></tr></thead><tbody>`;
  cat.types.forEach(g=>{ h+=`<tr class="grp-row"><td colspan="9">${esc(g.g)}</td></tr>`;
    g.items.forEach(it=>{ h+=`<tr data-t="${esc(it.t)}"><td class="name">${esc(it.t)}</td><td>${volTag(it.vol)}</td><td class="small combo">${it.combo.map(esc).join(" · ")}</td><td class="small">${esc(it.rep)}</td><td class="small">${esc(it.price)}</td><td class="small">${esc(it.who)}</td><td><span class="comp ${it.comp}">${compLabel[it.comp]}</span></td><td>${verdictTag(it.verdict)}</td><td class="small">${esc(it.pain)}</td></tr>`; }); });
  document.getElementById("t-types").innerHTML=h+"</tbody>";
  const order={A:0,B:1,C:2,Q:3,X:4};
  const O=[...cat.opps].sort((a,b)=>order[a.pri]-order[b.pri] || (b.total||0)-(a.total||0));
  h=`<thead><tr><th>优先级</th><th>机会品</th><th>缺口类型</th><th>评分</th><th>缺口依据 / 排除原因</th><th>机会品维度组合</th><th>建议价格</th><th>风险</th><th>验证方法</th></tr></thead><tbody>`;
  O.forEach(o=>{ h+=`<tr data-t="${esc(o.t)}"><td>${priTag(o.pri)}</td><td class="name">${esc(o.t)}<span class="grpl">依据：${esc(o.evl)}</span></td><td><span class="gap">${esc(o.gap)}</span></td><td>${o.total!=null?`<span class="stotal">${o.total.toFixed(2)}</span><br>${miniScore(o)}`:`<span class="fine">${o.pri==="Q"?"待验证":"—"}</span>`}</td><td class="small">${o.pri==="X"?"<b>排除：</b>"+esc(o.outWhy):esc(o.why)}</td><td class="small combo">${o.spec.map(esc).join(" · ")}</td><td class="small">${esc(o.price||"")}</td><td class="small">${esc(o.risk||"")}</td><td class="small">${esc(o.verify||"")}</td></tr>`; });
  document.getElementById("t-opps").innerHTML=h+"</tbody>";
}
document.querySelectorAll("#t-types,#t-opps").forEach(t=>t.addEventListener("click",e=>{
  const tr=e.target.closest("tr[data-t]"); if(!tr) return;
  const n=all(st.tab).find(x=>(x.role==="type"||x.role==="opp") && x.t===tr.dataset.t); if(!n) return;
  focusNode(n); goMap();
}));

/* ---------- 页头、范围、规则、来源 ---------- */
function renderChrome(){
  const cat=CUR(), root=DATA[st.tab];
  const nType=cat.types.reduce((a,g)=>a+g.items.length,0), nDim=cat.dims.reduce((a,g)=>a+g.cats.reduce((b,c)=>b+c.c.length,0),0);
  document.getElementById("h1").textContent=`品类开品维度图谱 · ${CATS.map(c=>c.name).join(" / ")}`;
  document.getElementById("meta-line").innerHTML=[`模板 v1.0`,`${CATS.length} 个品类`,`当前：${cat.name}`,`数据快照 ${cat.updated}`,`${nType} 个类型 · ${nDim} 个维度 · ${cat.opps.length} 个机会假设`].map(x=>`<span>${esc(x)}</span>`).join("");
  document.getElementById("h-map").textContent=`${cat.name}思维导图`;
  document.getElementById("h-grid").textContent=`${cat.name}白地图`;
  document.getElementById("h-prof").textContent=`${cat.name}类型档案`;
  document.getElementById("h-types").textContent=`${cat.name}类型对照表`;
  document.getElementById("h-opps").textContent=`${cat.name}机会评估`;
  const sc=cat.scope;
  document.getElementById("scopecard").innerHTML=`<div><h5>品类定义</h5><p>${esc(sc.def)}</p></div><div><h5>纳入</h5><p>${esc(sc.include)}</p></div><div><h5>不纳入</h5><p>${esc(sc.exclude)}</p></div><div><h5>邻近品类（单独记录）</h5><p>${esc(sc.adjacent)}</p></div>`;
  document.getElementById("score-def").innerHTML=SCORE_DEF.map(d=>`<b>${d.n} ×${d.w}</b><span>${esc(d.desc)}</span>`).join("");
  document.getElementById("cat-rules").innerHTML=`<h4>${esc(cat.name)}专用登记规则</h4><ul>${li(cat.rules)}</ul>`;
  document.getElementById("srclist").innerHTML=`${esc(cat.name)}参考来源：`+Object.values(cat.src).map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(" · ");
  document.getElementById("cat-tabs").innerHTML=CATS.map(c=>`<button type="button" data-tab="${c.id}" aria-pressed="${c.id===st.tab}">${esc(c.name)}</button>`).join("");
}

/* ---------- 交互 ---------- */
cv.addEventListener("click",e=>{
  if(e.target.closest("a")) return;
  const d=e.target.closest("[data-dim]"); if(d){ jumpDim(d.dataset.dim); return; }
  const el=e.target.closest(".node"); if(!el) return; const n=idx[el.dataset.id];
  if(n.role==="info"){ st.sel=n.id; render(); showDetail(n); return; }
  st.sel=n.id; if(n.c && n.role!=="root"){ const s=collapsed[st.tab]; s.has(n.id)?s.delete(n.id):s.add(n.id); }
  render(); showDetail(n);
});
cv.addEventListener("keydown",e=>{ if((e.key==="Enter"||e.key===" ") && e.target.classList.contains("node")){ e.preventDefault(); const id=e.target.dataset.id; e.target.click(); const again=cv.querySelector(`[data-id="${id}"]`); again&&again.focus(); } });
function switchTab(t){
  st.tab=t; st.sel=null; gst.cell=null;
  try{ localStorage.setItem("mm-tab",t); }catch(e){}
  applySearch(); renderAll(); centerRoot();
}
document.getElementById("cat-tabs").addEventListener("click",e=>{ const b=e.target.closest("button[data-tab]"); if(b) switchTab(b.dataset.tab); });
document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>{
  const n=all(st.tab).find(x=>x.role==="sec" && x.sec===b.dataset.jump); focusNode(n,{open:true});
}));
document.getElementById("btn-all").addEventListener("click",()=>{ collapsed[st.tab].clear(); render(); });
document.getElementById("btn-fold").addEventListener("click",()=>{ foldDefault(st.tab); render(); centerRoot(); });
const setScale=v=>{ st.scale=Math.min(1.6,Math.max(.4,Math.round(v*10)/10)); render(); };
document.getElementById("z-in").addEventListener("click",()=>setScale(st.scale+.1));
document.getElementById("z-out").addEventListener("click",()=>setScale(st.scale-.1));
document.getElementById("z-fit").addEventListener("click",()=>setScale(1));
function applySearch(){ if(!st.q) return; const s=collapsed[st.tab]; all(st.tab).forEach(n=>{ if(matches(n)){ let c=n.p; while(c){ s.delete(c.id); c=c.p; } } }); }
let qt; document.getElementById("q").addEventListener("input",e=>{ clearTimeout(qt); qt=setTimeout(()=>{ st.q=e.target.value.trim(); applySearch(); render();
  const hit=cv.querySelector(".node.hit"); if(hit) scrollToNode(idx[hit.dataset.id],true); },180); });

/* ---------- 导出 ---------- */
function outline(n,dep){
  if(n.role==="info") return "";
  const ind="  ".repeat(dep), sub="  ".repeat(dep+1), sub2="  ".repeat(dep+2);
  const L=(t,a)=>a&&a.length?`\n${sub}- ${t}\n${a.map(x=>`${sub2}- ${x}`).join("\n")}`:"";
  let line=`${ind}- ${n.pri?`[${n.pri==="Q"?"线索":n.pri==="X"?"已排除":n.pri}] `:""}${n.tag?`[${n.tag==="L0"?"门槛":n.tag}] `:""}${n.t}${n.n&&n.role==="val"?`（${n.n}）`:""}`;
  if(n.role==="type"){
    line+=`\n${sub}- 体量：${n.vol||""}；竞争：${n.compT}\n${sub}- 维度组合：${n.combo.join(" · ")}\n${sub}- 价格带：${n.price}`;
    line+=L("示例商品",(n.ex||[]).map(e=>`${e.n}：${e.u}`))+L("对应分类维度",(n.map||[]).map(([d,v,f])=>`${d}：${v}${f&&FLAG[f]?`（${FLAG[f][0]}）`:""}`));
    line+=L("优势",n.pros)+L("缺点",n.cons)+L("升级方向",n.up)+`\n${sub}- 机会判断：${n.verdict?n.verdict.join("，"):""}`+L("新品必须具备",n.must)+L("建议加分",n.plus)+L("必须避免",n.avoid);
    return line;
  }
  if(n.role==="opp"){ line+=`\n${sub}- 缺口类型：${n.gap}`+(n.total!=null?`\n${sub}- 评分：${n.total.toFixed(2)}（${SCORE_DEF.map(d=>d.n+" "+n.score[d.k]).join("，")}）`:"")+(n.pri==="X"?`\n${sub}- 排除原因：${n.outWhy}`:"")+`\n${sub}- 依据：${n.why}\n${sub}- 维度组合：${n.spec.join(" · ")}`+(n.price?`\n${sub}- 建议价格：${n.price}`:"")+(n.risk?`\n${sub}- 风险：${n.risk}`:"")+(n.verify?`\n${sub}- 验证方法：${n.verify}`:""); return line; }
  if(n.role==="dim"&&n.def) line+=`\n${sub}- 定义：${n.def}`;
  if(n.role==="dim"&&n.rule) line+=`\n${sub}- 登记规则：${n.rule}`;
  return [line].concat((n.c||[]).map(c=>outline(c,dep+1)).filter(Boolean)).join("\n");
}
function toast(m){ const t=document.createElement("div"); t.className="toast"; t.textContent=m; document.body.appendChild(t); setTimeout(()=>t.remove(),2200); }
function copyText(txt,okMsg){
  const fallback=()=>{ const ta=document.createElement("textarea"); ta.value=txt; ta.style.cssText="position:fixed;left:16px;right:16px;bottom:16px;height:40vh;z-index:30"; document.body.appendChild(ta); ta.select(); toast("已选中文本，按 Ctrl/⌘+C 复制"); ta.addEventListener("blur",()=>ta.remove()); };
  try{ navigator.clipboard.writeText(txt).then(()=>toast(okMsg),fallback); }catch(e){ fallback(); }
}
document.getElementById("btn-copy").addEventListener("click",()=>{ const r=DATA[st.tab]; copyText("# "+r.t+"\n"+r.c.map(c=>outline(c,0)).join("\n"), `已复制${r.t}大纲，可粘贴到 XMind`); });
document.getElementById("btn-json").addEventListener("click",()=>{ copyText(JSON.stringify(CUR(),(k,v)=>k==="total"||k==="pri"?undefined:v,2), `已复制${CUR().name}数据（JSON），可作为新品类模板参考`); });

/* ---------- 启动 ---------- */
function renderAll(){ renderChrome(); render(); showDetail(null); renderGrid(); renderProfiles(); renderTables(); }
function setNavH(){ const n=document.getElementById("snav"); if(n) document.documentElement.style.setProperty("--nav-h",n.offsetHeight+"px"); }
renderAll(); centerRoot(); setNavH();
window.addEventListener("resize",setNavH);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(()=>{ render(); centerRoot(); setNavH(); });
</script>
