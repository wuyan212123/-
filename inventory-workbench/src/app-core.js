'use strict';
/* ========== 核心：状态、工具、外壳、导航 ========== */
const D = DEMO;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NF = new Intl.NumberFormat('zh-CN');
const fmt = n => (typeof n === 'number' && isFinite(n)) ? NF.format(Math.round(n)) : '';
const fmt1 = n => (typeof n === 'number' && isFinite(n)) ? n.toFixed(1) : '';
const pct = n => (typeof n === 'number' && isFinite(n)) ? (n * 100).toFixed(1) + '%' : '';
const clone = o => JSON.parse(JSON.stringify(o));
const isNum = v => typeof v === 'number' && isFinite(v);
const sumNums = arr => arr.reduce((a, v) => a + (isNum(v) ? v : 0), 0);
const norm = s => String(s ?? '').toLowerCase().replace(/[\s\-_./·]/g, '');
const store = { get(k, d) { try { const v = localStorage.getItem('ivw:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('ivw:' + k, JSON.stringify(v)); } catch (e) { /* 存储不可用时忽略 */ } } };

/** 偏好读回时只接受已知取值，坏值回到默认 */
const pick = (v, ok, d) => ok.includes(v) ? v : d;
const ROLES = { editor: { name: '运营甲', label: '运营甲 · 可编辑', canEdit: true }, viewer: { name: '查看者', label: '查看者 · 只读', canEdit: false } };

const S = {
  page: 'country', country: 'US', cui: {}, detail: null,
  baseDate: D.BASE_DATE, baseDay: D.BASE.d,
  theme: pick(store.get('theme', 'system'), ['system', 'light', 'dark'], 'system'), density: pick(store.get('density', 'comfortable'), ['comfortable', 'compact'], 'comfortable'), collapsed: store.get('collapsed', false) === true, expanded: false,
  role: 'editor', hideZero: false, hl: {}, tp: {}, showInfo: store.get('showInfo', false) === true, moreF: false, years: null, heat: false,
  plans: clone(D.PLANS), plansSaved: clone(D.PLANS),
  half: Object.fromEntries(D.LISTINGS.filter(l => l.half).map(l => [l.lid, l.half.slice()])),
  halfSaved: Object.fromEntries(D.LISTINGS.filter(l => l.half).map(l => [l.lid, l.half.slice()])),
  transitSel: Object.fromEntries(Object.entries(D.TRANSIT_SEL).map(([k, v]) => [k, v ? v.slice() : null])),
  remote: {}, log: [], runs: [], freshness: clone(D.FRESHNESS), staleFba: false,
  people: { person: '运营甲', country: 'ALL', status: 'all', page: 1, size: 12 },
  search: { q: '', mode: 'text', multi: '', country: 'ALL', owner: 'ALL', page: 1, size: 8 },
  total: { tab: 'month', q: '', owner: 'ALL', page: 1, size: 8, blk: 'forecast' },
  stock: { tab: 'total', q: '' },
  plan: { q: '', country: 'ALL', status: 'all', onlyPlanned: false, open: {} },
  upd: null, coverage: { tab: 'sheets' }, fiscalAssume: {},
  nav: [],
};
function cui(cc) { return S.cui[cc] || (S.cui[cc] = { view: 'overview', q: '', owner: 'ALL', grade: 'ALL', label: 'ALL', issue: false, page: 1, size: 12, sort: null, wyear: '2026', wfrom: null, wto: null, fut: 'half', shipDate: '2026-10-20' }); }

/* ========== 图标（统一线性） ========== */
const ICONS = {
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z"/>',
  people: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.8 14.2c2.2.2 3.9 1.7 4.4 4.3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  sum: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/>',
  checklist: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.3 1.3L7 5M3.5 12l1.3 1.3L7 11M3.5 18l1.3 1.3L7 17"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  sidebar: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
  left: '<path d="M14.5 6l-6 6 6 6"/>', right: '<path d="M9.5 6l6 6-6 6"/>', up: '<path d="M6 14.5l6-6 6 6"/>', down: '<path d="M6 9.5l6 6 6-6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  moon: '<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/>',
  auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  warn: '<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
  density: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  flask: '<path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4A1.5 1.5 0 0 0 19 19l-5-10V3"/><path d="M7.5 15h9"/>',
  layers: '<path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M3 14l9 5 9-5"/>',
  columns: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15M14.5 4.5v15"/>',
  pin: '<path d="M9 3.5h6l-1 5 3.5 3.5H6.5L10 8.5z"/><path d="M12 12v8.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>',
};
const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ========== 值与状态渲染 ========== */
function V(v, o = {}) {
  if (isNum(v)) {
    if (v === 0 && S.hideZero && !o.keepZero) return `<span class="zero-hidden" title="真实0（零值隐藏显示，底层仍为0）"></span>`;
    const cls = v < 0 ? 'num neg' : 'num';
    const txt = o.dec ? fmt1(v) : (o.signed && v > 0 ? '+' + fmt(v) : fmt(v));
    return `<span class="${cls}">${txt}</span>`;
  }
  switch (v) {
    case 'NF': return `<span class="na" title="源表无该字段：不是0">无字段</span>`;
    case 'NP': return `<span class="na np" title="来源缺报/未提供：不是0">未提供</span>`;
    case 'FU': return `<span class="na" title="期间未到">未发生</span>`;
    case 'EMPTY': return `<span class="na" title="源表该期为空，不显示为0">空</span>`;
    case 'ERR': return `<span class="na err" title="上游错误值">#REF!</span>`;
    case 'PENDING': return `<span class="na" title="原公式结果尚未接入">待接入</span>`;
    case undefined: case null: case '': return `<span class="na" title="${esc(o.nullTitle || '未填写/无数据')}">${esc(o.nullText || '—')}</span>`;
    default: return esc(v);
  }
}
const tag = (cls, txt, ic, title) => `<span class="tag ${cls}"${title ? ` title="${esc(title)}"` : ''}>${ic ? icon(ic) : ''}${esc(txt)}</span>`;
const DEMO_PILL = tag('demo', '演示数据', 'flask', '纯虚构演示数据，非真实业务');
const DEMO_TAG = ''; // 演示标识统一放在侧栏、工具栏副标题与底部状态栏，避免每块重复
const layerTag = l => tag('layer', { sku: 'SKU聚合层', country: '国家层', listing: 'Listing层', product: '商品层' }[l] || l);
const ownerHtml = (l) => l.owner ? esc(l.owner) : tag('warn', '未分配', 'warn', '源记录负责人为空；不沿用上一行、不从其他国家补人');
const ownerFieldOf = cc => D.CMAP[cc].ownerField;

/* ========== 领域派生（只读，不改事实） ========== */
const L = lid => D.byId[lid];
const P = pid => D.pById[pid];
// Listing、批次在运行期不增减，按国家/商品建一次索引（真实规模约 3,000 条 Listing，避免每格都全表过滤）
const IDX = { cc: {}, pid: {}, bcc: {} };
D.LISTINGS.forEach(l => { (IDX.cc[l.country] = IDX.cc[l.country] || []).push(l); (IDX.pid[l.pid] = IDX.pid[l.pid] || []).push(l); });
D.BATCHES.forEach(b => { (IDX.bcc[b.country] = IDX.bcc[b.country] || []).push(b); });
const listingsOf = cc => (IDX.cc[cc] || []).slice();
const listingsOfP = pid => (IDX.pid[pid] || []).slice();
const batchesOf = cc => IDX.bcc[cc] || [];
function selOf(cc) { const s = S.transitSel[cc]; return s == null ? null : s; }
function isSelected(b) { const s = selOf(b.country); return s == null ? true : s.includes(b.bid); }
function transitOf(lid) {
  const l = L(lid); let t = 0;
  batchesOf(l.country).forEach(b => { if (!isSelected(b)) return; b.lines.forEach(ln => { if (ln.lid === lid) t += ln.current; }); });
  return t;
}
function batchLinesOf(lid) { const out = []; D.BATCHES.forEach(b => b.lines.forEach(ln => { if (ln.lid === lid) out.push({ b, ln }); })); return out; }
function domesticOf(pid) { const d = P(pid).domestic; return { avail: d.avail, pending: d.pending, transfer: sumNums(Object.values(d.transfer)), parts: d.transfer }; }
function planOf(lid) { return S.plans[lid] || null; }
function planQty(lid) { const p = planOf(lid); return p && isNum(p.qty) ? p.qty : null; }
function boxesOf(lid) { const l = L(lid); const pk = P(l.pid).packRate; const q = planQty(lid); if (q == null) return { v: null }; if (!pk) return { v: null, why: '缺装率' }; return { v: q / pk }; }
function daysAfterOf(lid) {
  const l = L(lid); if (l.country !== 'US') return { v: 'PENDING', why: '该国原公式待接入' };
  if (!l.avg4) return { v: null, why: '均销为0，无法计算' };
  const q = planQty(lid) || 0; return { v: (l.seaEnd + q) / (l.avg4 / 7) };
}
function issuesOfL(lid) { return D.ISSUES.filter(i => i.lid === lid); }
function issuesOfP(pid) { const lids = listingsOfP(pid).map(l => l.lid); return D.ISSUES.filter(i => (i.lid && lids.includes(i.lid)) || i.pid === pid); }
function variantHtml(v) {
  if (!v) return '';
  switch (v.kind) {
    case 'na': return V('NF');
    case 'standalone': return `${pct(1)} ${tag('mute', '独立商品')}`;
    case 'manual': return `${pct(v.ratio)} ${tag('info', '人工比例', 'edit')}`;
    case 'formula': return v.ratio == null ? tag('warn', '零分母·待核对', 'warn') : `${pct(v.ratio)} ${tag('line', v.group)}`;
    case 'zeroden': return tag('warn', '零分母·待核对', 'warn');
    case 'outgroup': return tag('warn', '组外引用·待核对', 'warn');
    case 'referr': return `${V('ERR')} ${tag('bad', '上游错误', 'warn')}`;
  }
  return '';
}
const halfPast = k => { const n = D.HALF[k + 1]; return n ? n.start <= S.baseDate : false; };
const halfCur = k => D.HALF[k].start <= S.baseDate && !halfPast(k);
const curMonthLabel = () => `截至${Number(S.baseDate.slice(5, 7))}/${Number(S.baseDate.slice(8))}`;
function isDirtyPlan(lid) { const a = S.plans[lid], b = S.plansSaved[lid]; return a && b && (a.qty !== b.qty || a.note !== b.note); }
function isDirtyHalf(lid, k) { return S.half[lid] && S.half[lid][k] !== S.halfSaved[lid][k]; }
function dirtyCount() { let n = 0; Object.keys(S.plans).forEach(l => { if (isDirtyPlan(l)) n++; }); Object.keys(S.half).forEach(l => S.half[l].forEach((_, k) => { if (isDirtyHalf(l, k)) n++; })); return n; }
const canEdit = () => ROLES[S.role].canEdit;

/* ========== 外壳 ========== */
const NAV = [
  { sec: '工作台' },
  { id: 'country', label: '国家进销存', ic: 'globe' },
  { id: 'people', label: '运营人员视图', ic: 'people' },
  { id: 'search', label: '全局搜索', ic: 'search' },
  { sec: '汇总与计划' },
  { id: 'total', label: '总销量', ic: 'sum' },
  { id: 'stock', label: '库存汇总', ic: 'box' },
  { id: 'plan', label: '发货计划', ic: 'truck' },
  { sec: '数据与核对' },
  { id: 'update', label: '数据更新与异常', ic: 'refresh', count: () => D.ISSUES.length },
  { id: 'versions', label: '版本记录', ic: 'history' },
  { id: 'coverage', label: '原表覆盖与验收', ic: 'checklist' },
  { id: 'notes', label: '方案说明', ic: 'doc' },
];
function renderSidebar() {
  const cur = S.page === 'detail' ? (S.detail.from?.page || 'country') : S.page;
  $('#sidebar').innerHTML = `
    <div class="traffic" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="brand"><div class="brand-mark">${icon('layers')}</div><div class="brand-txt"><div class="brand-t">进销存协作工作台</div><div class="brand-s">前端方案 · 演示版</div></div></div>
    <nav aria-label="主导航">${NAV.map(n => n.sec ? `<div class="nav-sec">${n.sec}</div>` : `<button class="nav-btn" data-act="nav" data-page="${n.id}" ${cur === n.id ? 'aria-current="page"' : ''} title="${n.label}" aria-label="${n.label}">${icon(n.ic)}<span class="nav-label">${n.label}</span>${n.count ? `<span class="nav-count">${n.count()}</span>` : ''}</button>`).join('')}</nav>
    <div class="side-foot">
      <div class="demo-note" title="全部数据为纯虚构演示数据">${icon('flask')}<span> 纯虚构演示数据。保存、导入、协作均为本页内存模拟，刷新即重置。</span></div>
      <button class="nav-btn" data-act="collapse" aria-label="${S.collapsed ? '展开侧栏' : '收起侧栏'}" title="${S.collapsed ? '展开侧栏' : '收起侧栏'}">${icon('sidebar')}<span class="nav-label">${S.collapsed ? '展开侧栏' : '收起侧栏'}</span></button>
    </div>`;
}
const PAGE_TITLE = { country: '国家进销存', people: '运营人员视图', search: '全局搜索', total: '总销量', stock: '库存汇总', plan: '发货计划', update: '数据更新与异常', versions: '版本记录', coverage: '原表覆盖与验收', notes: '方案说明' };
function renderToolbarState() {
  $('#role').value = S.role;
  if (S.page === 'detail' && S.detail) { $('#tbTitle').textContent = P(S.detail.pid).sku; $('#tbSub').textContent = `SKU 统一详情 · 来自 ${S.detail.from ? S.detail.from.label : '国家主表'}`; }
  else { $('#tbTitle').textContent = PAGE_TITLE[S.page] || '进销存协作工作台'; $('#tbSub').textContent = S.page === 'country' ? `${D.CMAP[S.country].name} ${S.country} · ${viewName(cui(S.country).view)} · 演示数据` : '进销存协作工作台 · 演示数据'; }
  const th = { system: ['auto', '主题：跟随系统'], light: ['sun', '主题：浅色'], dark: ['moon', '主题：深色'] }[S.theme];
  $('#themeBtn').innerHTML = icon(th[0]); $('#themeBtn').title = th[1] + '（点击切换）'; $('#themeBtn').setAttribute('aria-label', th[1] + '，点击切换');
  $('#densBtn').title = S.density === 'compact' ? '密度：紧凑（点击切换为舒适）' : '密度：舒适（点击切换为紧凑）';
  $('#densBtn').setAttribute('aria-label', $('#densBtn').title);
  document.documentElement.toggleAttribute('data-theme', S.theme !== 'system');
  if (S.theme !== 'system') document.documentElement.setAttribute('data-theme', S.theme);
  document.body.classList.toggle('density-compact', S.density === 'compact');
  document.body.classList.toggle('show-info', !!S.showInfo);
  const ib = $('#infoBtn'); if (ib) { ib.innerHTML = icon('info'); ib.setAttribute('aria-pressed', String(!!S.showInfo)); ib.title = S.showInfo ? '隐藏说明与字段来源' : '显示说明与字段来源'; ib.setAttribute('aria-label', ib.title); }
  const app = $('#app'); app.classList.toggle('collapsed', !!S.collapsed); app.classList.toggle('expanded', !!S.expanded);
}
function renderSrcbar() {
  const today = new Date(); const td = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const chips = S.freshness.map(f => `<span title="${esc(f.note || '')}">${esc(f.label)} <b>${f.date}</b>${f.state === 'stale' ? ' ' + tag('warn', '沿用旧周期', 'warn') : ''}${f.state === 'blocked' ? ' ' + tag('bad', '本次阻断', 'warn') : ''}</span>`).join('<span aria-hidden="true">·</span>');
  $('#srcbar').innerHTML = `${DEMO_PILL}<span>数据基准日 <b>${S.baseDate}</b></span><span aria-hidden="true">·</span>${chips}<span aria-hidden="true">·</span><span title="浏览器当天日期，与数据基准日分开">今天 <b>${td}</b></span>`;
}
function renderSavebar() {
  const n = dirtyCount(); const el = $('#savebar');
  if (!n) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="savebar" role="region" aria-label="未保存修改"><span class="dot" aria-hidden="true"></span><span><b>${n}</b> 项未保存的演示修改</span><span class="muted small">保存只写入本页内存，不会同步给同事</span><button class="btn sm" data-act="discard">放弃修改</button><button class="btn sm primary" data-act="save">保存到本次演示</button></div>`;
}
function toast(msg, kind) {
  const el = document.createElement('div');
  el.innerHTML = `<div class="t-ic" style="${kind === 'warn' ? 'background:linear-gradient(180deg,#ffb340,#ff9500)' : ''}">${icon(kind === 'warn' ? 'warn' : 'layers')}</div><div style="min-width:0"><div class="t-ttl">进销存工作台<span>现在</span></div><div>${msg}</div></div>`;
  const box = $('#toast'); box.appendChild(el); const max = window.innerWidth < 720 ? 1 : 2; while (box.children.length > max) box.firstElementChild.remove();
  setTimeout(() => el.remove(), 3200);
}
let modalReturn = null;
function modal(html, cls = '') {
  if (!$('#modal-root').innerHTML) modalReturn = document.activeElement;
  $('#modal-root').innerHTML = `<div class="modal-back" data-act="modal-bg"><div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div></div>`;
  const h = $('#modal-root .modal-h h2'); if (h) { h.id = h.id || 'modal-title'; $('#modal-root .modal').setAttribute('aria-labelledby', h.id); }
  const f = $('#modal-root [autofocus], #modal-root .modal-h ~ * button:not([disabled]), #modal-root button:not([disabled]), #modal-root input'); f && f.focus();
}
function closeModal() {
  if (!$('#modal-root').innerHTML) return;
  $('#modal-root').innerHTML = '';
  const r = modalReturn; modalReturn = null;
  if (r && document.contains(r)) r.focus({ preventScroll: true });
}
/** 对话框内 Tab 循环，不跑到背后的页面 */
function trapModalTab(e) {
  const m = $('#modal-root .modal'); if (!m || e.key !== 'Tab') return;
  const items = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])', m).filter(x => x.offsetParent !== null);
  if (!items.length) return; const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (!m.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
}

/* ========== 渲染调度 ========== */
const PAGES = {};
const ACT_EXTRA = {}, INP_EXTRA = {};
function render(opts = {}) {
  renderSidebar(); renderToolbarState(); renderSrcbar();
  const main = $('#main');
  const fn = PAGES[S.page] || PAGES.country;
  main.innerHTML = fn();
  renderSavebar();
  if (opts.top) main.scrollTop = 0;
  afterRender();
}
/** 记住焦点：有 id 用 id；否则用 data-act 及其参数拼出选择器，重绘后把焦点放回“同一个”控件（键盘用户不会被甩回页首） */
const FOCUS_KEYS = ['act', 'v', 'key', 'page', 'bid', 'lid', 'scope', 'p', 'm', 'hk', 'y', 'id', 'g', 'view', 'pid', 'cc', 't', 's', 'q', 'd'];
function focusSig(el) {
  if (!el || el === document.body) return null;
  if (el.id) return '#' + CSS.escape(el.id);
  if (!el.dataset || !el.dataset.act) return null;
  return FOCUS_KEYS.filter(k => el.dataset[k] != null).map(k => `[data-${k}="${CSS.escape(el.dataset[k])}"]`).join('');
}
function rerenderKeep() {
  const main = $('#main'); const st = main.scrollTop; const sc = captureTables();
  const sig = focusSig(document.activeElement);
  render(); main.scrollTop = st; restoreTables(sc);
  let el = sig && $(sig);
  if (el && el.disabled) el = el.closest('.pager, .row, .detail-head') && el.closest('.pager, .row, .detail-head').querySelector('button:not(:disabled)') || $('#main');
  if (el) { el.focus({ preventScroll: true }); if (el.setSelectionRange && el.type === 'text') { const n = el.value.length; el.setSelectionRange(n, n); } }
}
function captureTables() { const o = {}; $$('.tbl-wrap[id]').forEach(w => { o[w.id] = [w.scrollLeft, w.scrollTop]; }); return o; }
function restoreTables(o) { Object.entries(o || {}).forEach(([id, [x, y]]) => { const w = document.getElementById(id); if (w) { w.scrollLeft = x; w.scrollTop = y; } }); }
function afterRender() {
  // 二级表头偏移
  $$('table.t').forEach(t => { const r = t.tHead && t.tHead.rows[0]; if (r && t.tHead.rows.length > 1) t.style.setProperty('--th1', r.getBoundingClientRect().height + 'px'); });
  applyPins(); drawCharts(); markScrollRegions();
  if (S.page === 'detail') setupAnchors();
}

/** 可横向/纵向滚动、但内部没有可聚焦控件的表格区域：加 tabindex，键盘用户也能用方向键滚动 */
function markScrollRegions() {
  const used = {};
  $$('.tbl-wrap').forEach(w => {
    const scrolls = w.scrollWidth > w.clientWidth + 1 || w.scrollHeight > w.clientHeight + 1;
    const hasFocusable = !!w.querySelector('button, input, select, a[href], [tabindex]');
    if (scrolls && !hasFocusable) { w.tabIndex = 0; w.setAttribute('role', 'region'); const h = w.closest('.panel, .sec, .modal'); const t = h && h.querySelector('h1, h2, h3'); let name = (t ? t.textContent.trim() : '表格') + '（可滚动）'; used[name] = (used[name] || 0) + 1; if (used[name] > 1) name += ` ${used[name]}`; w.setAttribute('aria-label', name); }
    else if (w.getAttribute('role') === 'region') { w.removeAttribute('tabindex'); w.removeAttribute('role'); w.removeAttribute('aria-label'); }
  });
}
/* ========== 导航 ========== */
function go(page, extra = {}) {
  if (S.page === 'detail' && page !== 'detail') S.detail = null;
  S.page = page; S.expanded = false; Object.assign(S, extra); render({ top: true });
  $('#main').focus({ preventScroll: true });
}
function contextLabel() {
  switch (S.page) {
    case 'country': { const c = cui(S.country); return `${D.CMAP[S.country].name} ${S.country} · ${viewName(c.view)}${c.page > 1 ? `（第${c.page}页）` : ''}`; }
    case 'people': return `运营人员视图 · ${S.people.person === '__none' ? '未分配' : S.people.person}${S.people.page > 1 ? `（第${S.people.page}页）` : ''}`;
    case 'search': return `搜索结果${S.search.q ? `“${S.search.q}”` : ''}${S.search.page > 1 ? `（第${S.search.page}页）` : ''}`;
    case 'total': return '总销量'; case 'versions': return '版本记录'; case 'stock': return '库存汇总'; case 'plan': return '发货计划'; case 'update': return '数据更新与异常'; case 'coverage': return '原表覆盖与验收';
    default: return '上一页';
  }
}
function openSku(pid, o = {}) {
  const main = $('#main');
  if (S.page !== 'detail') S.nav = [{ page: S.page, label: contextLabel(), scroll: main.scrollTop, tables: captureTables(), list: o.list || null }];
  const from = S.page === 'detail' ? S.detail.from : S.nav[0];
  const cc = o.country || (S.page === 'country' ? S.country : null);
  const ls = listingsOfP(pid);
  const country = cc && ls.some(l => l.country === cc) ? cc : 'ALL';
  const lid = o.lid || (country !== 'ALL' ? ls.find(l => l.country === country).lid : null);
  S.detail = { pid, country, lid, from, list: o.list || (from && from.list) || D.PRODUCTS.map(p => p.pid), wyear: '2026', wfrom: null, wto: null };
  S.page = 'detail'; render({ top: true });
  $('#main').focus({ preventScroll: true });
}
function goBack() {
  const f = S.nav[0]; if (!f) { go('country'); return; }
  S.page = f.page; S.detail = null; render();
  requestAnimationFrame(() => { $('#main').scrollTop = f.scroll; restoreTables(f.tables); });
  $('#main').focus({ preventScroll: true });
  toast(`已返回 ${esc(f.label)}，搜索/筛选/页码/排序与表格滚动位置已恢复`);
}
function viewName(v) { return { overview: '综合总览', month: '月历史', week: '周历史', future: '未来计划/目标', plan: '发货计划', batch: '批次与在途', stock: '库存明细', info: '商品资料' }[v] || v; }

/* ========== 通用表格 ========== */
function th(c, sort, sortKey) {
  const s = c.sort ? ` sortable" data-act="sort" data-key="${c.key}" data-scope="${sortKey}` : '';
  const ind = sort && sort.key === c.key ? `<span class="sort-ind" aria-hidden="true">${sort.dir > 0 ? '▲' : '▼'}</span>` : '';
  const aria = c.sort ? ` aria-sort="${sort && sort.key === c.key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}" tabindex="0" role="columnheader"` : '';
  return `<th class="${c.cls || ''} ${c.fz ? 'fz' + c.fz : ''}${c.pin != null ? ` pin pin-${c.pin}${c.pinLast ? ' pin-last' : ''}` : ''}${s}"${aria} ${c.w ? `style="min-width:${c.w}px"` : ''} ${c.title ? `title="${esc(c.title)}"` : ''}>${esc(c.label)}${ind}${c.flag ? `<span class="th-flag">${esc(c.flag)}</span>` : ''}${c.sub ? `<span class="th-sub">${esc(c.sub)}</span>` : ''}</th>`;
}
function table(id, cols, rows, o = {}) {
  const fz1w = o.fz1w || 172;
  const head = `<thead><tr>${cols.map(c => th(c, o.sort, o.sortKey || id)).join('')}</tr></thead>`;
  const body = rows.length ? rows.map(r => `<tr ${o.rowAttr ? o.rowAttr(r) : ''}>${cols.map(c => `<td class="${c.cls || ''} ${c.fz ? 'fz' + c.fz : ''}${c.pin != null ? ` pin pin-${c.pin}${c.pinLast ? ' pin-last' : ''}` : ''} ${c.tdCls ? c.tdCls(r) : ''}">${c.render(r)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols.length}" class="l"><div class="empty"><h2>${o.emptyTitle || '没有匹配的记录'}</h2><div>${o.emptyText || '调整或清空筛选条件后重试。'}</div></div></td></tr>`;
  return `<div class="tbl-wrap ${o.wrapCls || ''}" id="${id}" style="--fz1w:${fz1w}px"><table class="t" data-pins="${cols.filter(c => c.pin != null).length}">${head}<tbody>${body}</tbody>${o.foot || ''}</table></div>`;
}
function sortRows(rows, sort, getters) {
  if (!sort || !getters[sort.key]) return rows;
  const g = getters[sort.key];
  return rows.slice().sort((a, b) => { const x = g(a), y = g(b); const xn = x == null || x === '' ? -Infinity : x, yn = y == null || y === '' ? -Infinity : y; return (xn > yn ? 1 : xn < yn ? -1 : 0) * sort.dir; });
}
function pager(scope, total, page, size, sizes = [8, 12, 25, 50]) {
  const pages = Math.max(1, Math.ceil(total / size));
  return `<div class="pager"><span>共 <b>${total}</b> 条</span><span class="spacer"></span>
    <label class="row">每页 <select class="sel" data-in="pagesize" data-scope="${scope}" id="ps-${scope}" aria-label="每页条数">${sizes.map(s => `<option ${s === size ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
    <button class="btn sm" id="pg-${scope}-prev" data-act="page" data-scope="${scope}" data-p="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="上一页">${icon('left')}</button>
    <span>第 ${page} / ${pages} 页</span>
    <button class="btn sm" id="pg-${scope}-next" data-act="page" data-scope="${scope}" data-p="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="下一页">${icon('right')}</button></div>`;
}
const paginate = (rows, page, size) => rows.slice((page - 1) * size, page * size);
/** 分页状态：主列表沿用各自的状态，其余表格（库存明细、过程记录等）按表格键各自记住页码 */
function pstate(sc) {
  if (sc === 'country') return cui(S.country);
  if (['people', 'search', 'total'].includes(sc)) return S[sc];
  return S.tp[sc] || (S.tp[sc] = { page: 1, size: 25 });
}
/** 带分页的表格：真实数据可达上万行（国内库存约 1 万、FBA 导出约 8,700），一次只渲染一页 */
function pagedTable(sc, id, cols, rows, o = {}) {
  const st = pstate(sc); const pages = Math.max(1, Math.ceil(rows.length / st.size)); if (st.page > pages) st.page = pages;
  return table(id, cols, paginate(rows, st.page, st.size), o) + pager(sc, rows.length, st.page, st.size, o.sizes || [25, 50, 100]);
}
function seg(items, cur, act, extra = '') { return `<div class="seg" role="tablist">${items.map(it => `<button role="tab" aria-selected="${it.id === cur}" data-act="${act}" data-v="${it.id}" ${extra}>${it.label}${it.cnt != null ? ` <span class="cnt">${it.cnt}</span>` : ''}</button>`).join('')}</div>`; }
function editNum(kind, lid, val, o = {}) {
  const dis = !canEdit() || o.disabled;
  const dirty = o.dirty ? ' dirty' : '';
  return `<input class="ein${dirty}" type="text" inputmode="numeric" id="${kind}-${lid}${o.k != null ? '-' + o.k : ''}" data-in="${kind}" data-lid="${lid}" ${o.k != null ? `data-k="${o.k}"` : ''} value="${val == null ? '' : val}" ${dis ? 'disabled' : ''} aria-label="${esc(o.aria || '编辑')}" placeholder="${o.ph || ''}" title="${dis ? (o.disabled ? esc(o.disTitle || '不可编辑') : '只读（演示权限）') : '人工计划字段：可编辑'}">`;
}
