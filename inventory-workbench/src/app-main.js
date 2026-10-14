/* ========== 保存 / 冲突（仅本页内存） ========== */
const nowStr = () => { const d = new Date(); return `${D.BASE.y}-10-14 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
function commitAll() {
  const who = ROLES[S.role].name; let n = 0;
  Object.keys(S.plans).forEach(lid => {
    if (!isDirtyPlan(lid)) return;
    const a = S.plans[lid], b = S.plansSaved[lid]; const l = L(lid);
    a.version += 1; a.editedBy = who; a.updatedAt = nowStr();
    S.log.unshift({ pid: l.pid, lid, at: a.updatedAt, who, what: `${l.country} ${l.msku} 计划 ${b.qty ?? '空'} → ${a.qty ?? '空'}${a.note !== b.note ? `；备注“${a.note}”` : ''}（v${a.version}）` });
    S.plansSaved[lid] = clone(a); n++;
  });
  Object.keys(S.half).forEach(lid => {
    const ks = S.half[lid].map((_, k) => k).filter(k => isDirtyHalf(lid, k)); if (!ks.length) return;
    const l = L(lid); S.log.unshift({ pid: l.pid, lid, at: nowStr(), who, what: `${l.country} ${l.msku} 半月销售计划修改 ${ks.length} 期（${ks.map(k => D.HALF[k].label).join('、')}）` });
    S.halfSaved[lid] = S.half[lid].slice(); n += ks.length;
  });
  rerenderKeep();
  toast(`已保存 ${n} 项到本次演示。<br><span class="muted">只写入当前页面内存，未同步给任何同事；刷新后重置。</span>`);
}
function save() {
  if (!canEdit()) { toast('当前为只读演示身份，不能保存。', 'warn'); return; }
  const conflicts = Object.keys(S.plans).filter(lid => isDirtyPlan(lid) && S.remote[lid] && S.remote[lid].version > S.plans[lid].version);
  if (conflicts.length) return conflictModal(conflicts);
  commitAll();
}
function conflictModal(lids) {
  modal(`<div class="modal-h"><h2>版本冲突：同事已先更新 ${lids.length} 条计划</h2>${tag('demo', '模拟冲突')}<span class="spacer"></span><button class="icon-btn" data-act="close" aria-label="关闭">${icon('close')}</button></div>
  <div class="modal-b stack"><p class="small">你的修改基于旧版本。为避免后写静默覆盖前写，请逐条选择处理方式。未处理前，你的修改保持“未保存”。</p>
  ${lids.map(lid => { const l = L(lid), a = S.plans[lid], r = S.remote[lid], b = S.plansSaved[lid]; return `<div class="metric"><div class="row"><b>${l.country} · ${esc(l.sku)}</b><span class="mono small">${esc(l.msku)} · ${a.planId}</span></div>
    <dl class="kv" style="margin:8px 0"><dt>你基于的版本</dt><dd>v${a.version}：${b.qty ?? '空'}</dd><dt>你的修改</dt><dd><b>${a.qty ?? '空'}</b></dd><dt>同事的新版本</dt><dd>v${r.version}：<b>${r.qty}</b>（${esc(r.by)}，${esc(r.at)}）</dd></dl>
    <div class="row"><label class="chk"><input type="radio" name="cr-${lid}" value="theirs" checked> 采用同事的值</label><label class="chk"><input type="radio" name="cr-${lid}" value="mine"> 重新核对后用我的值覆盖</label></div></div>`; }).join('')}
  <label class="chk"><input type="checkbox" id="cr-ack"> 我已核对同事的新版本（选择“用我的值覆盖”时必须勾选）</label></div>
  <div class="modal-f"><button class="btn" data-act="close">取消，保留未保存修改</button><button class="btn primary" data-act="cresolve" data-lids="${lids.join(',')}">确认处理并保存</button></div>`);
}
function resolveConflicts(lids) {
  const ack = $('#cr-ack') && $('#cr-ack').checked; const choice = {};
  lids.forEach(lid => { const r = $(`input[name="cr-${lid}"]:checked`); choice[lid] = r ? r.value : 'theirs'; });
  if (Object.values(choice).includes('mine') && !ack) { toast('请先勾选“我已核对同事的新版本”。', 'warn'); return; }
  lids.forEach(lid => {
    const r = S.remote[lid]; const l = L(lid);
    if (choice[lid] === 'theirs') { Object.assign(S.plans[lid], { qty: r.qty, version: r.version, editedBy: r.by, updatedAt: r.at }); S.plansSaved[lid] = clone(S.plans[lid]); S.log.unshift({ pid: l.pid, lid, at: nowStr(), who: ROLES[S.role].name, what: `冲突处理：采用同事 v${r.version} 的值 ${r.qty}` }); }
    else { S.plans[lid].version = r.version; S.log.unshift({ pid: l.pid, lid, at: nowStr(), who: ROLES[S.role].name, what: `冲突处理：核对 v${r.version} 后以本人值覆盖` }); }
    delete S.remote[lid];
  });
  closeModal(); commitAll();
}
function simRemote() {
  let lid = Object.keys(S.plans).find(isDirtyPlan) || D.LISTINGS.find(l => l.country === 'US' && planOf(l.lid)).lid;
  const p = S.plans[lid]; const base = S.plansSaved[lid];
  S.remote[lid] = { version: base.version + 1, qty: (isNum(base.qty) ? base.qty : 0) + 24, by: '运营乙（模拟）', at: nowStr() };
  const l = L(lid); S.plan.open[l.pid] = true;
  rerenderKeep();
  toast(`模拟：运营乙已把 ${l.country} ${esc(l.sku)} 的计划保存为 ${S.remote[lid].qty}（v${S.remote[lid].version}）。<br><span class="muted">修改并保存同一记录时会提示冲突。</span>`, 'warn');
}

/* ========== 编辑联动（不整页重绘，保持焦点） ========== */
function parseQty(v) { v = String(v).trim().replace(/,/g, ''); if (v === '') return { ok: true, v: null }; if (!/^\d+$/.test(v)) return { ok: false }; return { ok: true, v: Number(v) }; }
function setDerived(key, html) { $$(`[data-derived="${key}"]`).forEach(el => { el.innerHTML = html; }); }
function refreshPlanDerived(lid) {
  const l = L(lid); const b = boxesOf(lid); setDerived('box-' + lid, b.v == null ? V(null) : fmt1(b.v));
  const d = daysAfterOf(lid); if (d.v !== 'PENDING' && !d.why) setDerived('hx-' + lid, fmt1(d.v));
  const p = P(l.pid); const ls = listingsOfP(p.pid).filter(x => planOf(x.lid)); const tot = sumNums(ls.map(x => planQty(x.lid)));
  setDerived('ptot-' + p.pid, fmt(tot)); setDerived('ptotal-' + p.pid, fmt(tot));
  setDerived(`pcc-${p.pid}-${l.country}`, V(sumNums(ls.filter(x => x.country === l.country).map(x => planQty(x.lid)))));
  setDerived('pchk-' + p.pid, tot > p.domestic.avail ? tag('warn', `超出现货 ${fmt(tot - p.domestic.avail)}`, 'warn') : tag('ok', '现货可覆盖'));
  setDerived('pcheck-' + p.pid, tot > p.domestic.avail ? `计划超出现货 ${fmt(tot - p.domestic.avail)}（演示核对，非原 HW 公式）` : '现货可覆盖计划合计（演示核对）');
  setDerived('pgrand', fmt(sumNums(D.LISTINGS.map(x => planQty(x.lid)))));
  renderSavebar();
}

/* ========== 事件 ========== */
const ACT = {
  nav: t => go(t.dataset.page),
  collapse: () => { if (window.innerWidth <= 1100) S.expanded = !S.expanded; else { S.collapsed = !S.collapsed; store.set('collapsed', S.collapsed); } renderSidebar(); renderToolbarState(); },
  scrim: () => { S.expanded = false; renderToolbarState(); },
  theme: () => { S.theme = { system: 'light', light: 'dark', dark: 'system' }[S.theme]; store.set('theme', S.theme); renderToolbarState(); toast({ system: '主题：跟随系统', light: '主题：浅色', dark: '主题：深色' }[S.theme]); },
  density: () => { S.density = S.density === 'compact' ? 'comfortable' : 'compact'; store.set('density', S.density); renderToolbarState(); },
  country: t => { const v = cui(S.country).view, f = cui(S.country).fut; S.country = t.dataset.v; cui(S.country).view = v; cui(S.country).fut = f; go('country'); },
  cview: t => { cui(S.country).view = t.dataset.v; rerenderKeep(); },
  cclear: () => { Object.assign(cui(S.country), { q: '', owner: 'ALL', grade: 'ALL', label: 'ALL', issue: false, page: 1 }); rerenderKeep(); },
  sort: t => { const sc = t.dataset.scope; const st = sc === 'country' ? cui(S.country) : null; if (!st) return; const k = t.dataset.key; st.sort = st.sort && st.sort.key === k ? (st.sort.dir > 0 ? { key: k, dir: -1 } : null) : { key: k, dir: 1 }; rerenderKeep(); },
  page: t => { const sc = t.dataset.scope; const st = sc === 'country' ? cui(S.country) : S[sc]; st.page = Number(t.dataset.p); rerenderKeep(); const w = $('.tbl-wrap'); },
  hlmonth: t => { const k = t.dataset.hk, m = Number(t.dataset.m); S.hl[k] = S.hl[k] === m ? null : m; rerenderKeep(); },
  wyear: t => { const st = t.dataset.scope === 'detail' ? S.detail : cui(S.country); st.wyear = t.dataset.v; st.wfrom = st.wto = null; rerenderKeep(); },
  wquick: t => { const st = t.dataset.scope === 'detail' ? S.detail : cui(S.country); st.wyear = 'ALL'; st.wto = null; st.wfrom = t.dataset.q === 'last8' ? D.WEEKS[D.WEEKS.length - 8].key : null; rerenderKeep(); },
  fut: t => { cui(S.country).fut = t.dataset.v; rerenderKeep(); },
  batch: t => batchModal(t.dataset.bid),
  awd: t => awdModal(t.dataset.lid),
  close: () => closeModal(),
  'modal-bg': (t, e) => { if (e.target === t) closeModal(); },
  bselall: t => { S.transitSel[t.dataset.cc] = batchesOf(t.dataset.cc).map(b => b.bid); rerenderKeep(); toast(`${t.dataset.cc}：已全选批次计入在途（演示）`); },
  bselnone: t => { S.transitSel[t.dataset.cc] = []; rerenderKeep(); toast(`${t.dataset.cc}：已明确空选，本国当前在途 = 0；批次与原量历史保留`); },
  bselorig: t => { S.transitSel[t.dataset.cc] = D.TRANSIT_SEL[t.dataset.cc] ? D.TRANSIT_SEL[t.dataset.cc].slice() : null; rerenderKeep(); },
  sku: t => { closeModal(); openSku(t.dataset.pid, { country: t.dataset.cc, lid: t.dataset.lid, list: t.dataset.list ? t.dataset.list.split(',') : null }); },
  back: () => goBack(),
  pn: t => { if (!t.dataset.pid) return; const d = S.detail; const ls = listingsOfP(t.dataset.pid); const cc = d.country !== 'ALL' && ls.some(l => l.country === d.country) ? d.country : 'ALL'; Object.assign(d, { pid: t.dataset.pid, country: cc, lid: cc !== 'ALL' ? ls.find(l => l.country === cc).lid : null }); render({ top: true }); },
  dcountry: t => { const d = S.detail; d.country = t.dataset.v; d.lid = d.country === 'ALL' ? null : listingsOfP(d.pid).find(l => l.country === d.country).lid; rerenderKeep(); },
  dlisting: t => { const d = S.detail; const l = L(t.dataset.lid); d.lid = l.lid; d.country = l.country; rerenderKeep(); if (t.dataset.setcc) document.getElementById('sec-hist').scrollIntoView({ block: 'start' }); },
  anchor: t => { const el = document.getElementById(t.dataset.id); if (el) el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); },
  person: t => { S.people.person = t.dataset.v; S.people.page = 1; rerenderKeep(); },
  pcountry: t => { S.people.country = t.dataset.v; S.people.page = 1; rerenderKeep(); },
  pstatus: t => { S.people.status = t.dataset.v; S.people.page = 1; rerenderKeep(); },
  pcell: t => { S.people.person = t.dataset.p; S.people.country = t.dataset.c; S.people.page = 1; rerenderKeep(); },
  smode: t => { S.search.mode = t.dataset.v; S.search.page = 1; rerenderKeep(); },
  smultigo: () => { S.search.multi = $('#smulti').value; S.search.page = 1; rerenderKeep(); },
  sclearq: () => { S.search.q = ''; S.search.multi = ''; S.search.page = 1; rerenderKeep(); },
  sclearf: () => { S.search.country = 'ALL'; S.search.owner = 'ALL'; S.search.page = 1; rerenderKeep(); },
  try: t => { S.search.q = t.dataset.q; S.search.page = 1; rerenderKeep(); },
  ttab: t => { S.total.tab = t.dataset.v; rerenderKeep(); }, tblk: t => { S.total.blk = t.dataset.v; rerenderKeep(); },
  stab: t => { S.stock.tab = t.dataset.v; rerenderKeep(); },
  plcountry: t => { S.plan.country = t.dataset.v; rerenderKeep(); }, plstatus: t => { S.plan.status = t.dataset.v; rerenderKeep(); },
  popen: t => { const id = t.dataset.pid; if (S.plan.open[id]) delete S.plan.open[id]; else S.plan.open[id] = true; rerenderKeep(); },
  pexpand: () => { if (Object.keys(S.plan.open).length) S.plan.open = {}; else D.PRODUCTS.forEach(p => { S.plan.open[p.pid] = true; }); rerenderKeep(); },
  simremote: () => simRemote(),
  ustep: t => { const s = Number(t.dataset.s); if (s < 1 || s > 5) return; S.upd.step = s; if (s < 5) S.upd.result = null; rerenderKeep(); },
  ureset: () => { S.upd = newUpd(); rerenderKeep(); },
  uapply: () => applyUpdate(),
  covtab: t => { S.coverage.tab = t.dataset.v; rerenderKeep(); },
  goto: t => gotoTarget(t.dataset.t),
  save: () => save(),
  discard: () => { S.plans = clone(S.plansSaved); Object.keys(S.halfSaved).forEach(k => { S.half[k] = S.halfSaved[k].slice(); }); rerenderKeep(); toast('已放弃未保存的演示修改，恢复为上次保存的值。'); },
  cresolve: t => resolveConflicts(t.dataset.lids.split(',')),
  popsku: t => { hidePop(); $('#gq').blur(); openSku(t.dataset.pid, { country: t.dataset.cc, lid: t.dataset.lid }); },
  popall: () => { hidePop(); S.search.mode = 'text'; S.search.q = $('#gq').value; S.search.page = 1; go('search'); },
};
const INP = {
  cq: t => { cui(S.country).q = t.value; cui(S.country).page = 1; rerenderKeep(); },
  cowner: t => { cui(S.country).owner = t.value; cui(S.country).page = 1; rerenderKeep(); },
  cgrade: t => { cui(S.country).grade = t.value; cui(S.country).page = 1; rerenderKeep(); },
  clabel: t => { cui(S.country).label = t.value; cui(S.country).page = 1; rerenderKeep(); },
  cissue: t => { cui(S.country).issue = t.checked; cui(S.country).page = 1; rerenderKeep(); },
  hidezero: t => { S.hideZero = t.checked; rerenderKeep(); },
  pagesize: t => { const sc = t.dataset.scope; const st = sc === 'country' ? cui(S.country) : S[sc]; st.size = Number(t.value); st.page = 1; rerenderKeep(); },
  wfrom: t => { const st = t.dataset.scope === 'detail' ? S.detail : cui(S.country); st.wfrom = t.value || null; rerenderKeep(); },
  wto: t => { const st = t.dataset.scope === 'detail' ? S.detail : cui(S.country); st.wto = t.value || null; rerenderKeep(); },
  plan: t => { const r = parseQty(t.value); t.setCustomValidity(r.ok ? '' : '请输入非负整数'); t.style.borderColor = r.ok ? '' : 'var(--bad)'; t.title = r.ok ? '人工计划字段：可编辑' : '请输入非负整数；未写入'; if (!r.ok) return; S.plans[t.dataset.lid].qty = r.v; t.classList.toggle('dirty', isDirtyPlan(t.dataset.lid)); $$(`[data-in="plan"][data-lid="${t.dataset.lid}"]`).forEach(x => { if (x !== t) { x.value = t.value; x.classList.toggle('dirty', isDirtyPlan(t.dataset.lid)); } }); refreshPlanDerived(t.dataset.lid); },
  note: t => { S.plans[t.dataset.lid].note = t.value; t.classList.toggle('dirty', S.plans[t.dataset.lid].note !== S.plansSaved[t.dataset.lid].note); renderSavebar(); },
  half: t => { const r = parseQty(t.value); t.style.borderColor = r.ok ? '' : 'var(--bad)'; if (!r.ok) return; const lid = t.dataset.lid, k = Number(t.dataset.k); S.half[lid][k] = r.v; t.classList.toggle('dirty', isDirtyHalf(lid, k)); setDerived('hsum-' + lid, fmt(sumNums(S.half[lid]))); renderSavebar(); },
  shipdate: t => { cui(S.country).shipDate = t.value; rerenderKeep(); },
  fassume: t => { S.fiscalAssume[S.country] = t.value; rerenderKeep(); },
  bsel: t => { const b = D.BATCHES.find(x => x.bid === t.dataset.bid); let s = selOf(b.country); if (s == null) s = batchesOf(b.country).map(x => x.bid); s = t.checked ? [...new Set([...s, b.bid])] : s.filter(x => x !== b.bid); S.transitSel[b.country] = s; rerenderKeep(); toast(`${b.country} ${b.label}：${t.checked ? '已计入在途' : '已取消计入（批次与原量历史保留）'}`); },
  sq: t => { S.search.q = t.value; S.search.page = 1; rerenderKeep(); },
  smulti: t => { S.search.multi = t.value; },
  scountry: t => { S.search.country = t.value; S.search.page = 1; rerenderKeep(); },
  sowner: t => { S.search.owner = t.value; S.search.page = 1; rerenderKeep(); },
  tq: t => { S.total.q = t.value; S.total.page = 1; rerenderKeep(); }, towner: t => { S.total.owner = t.value; S.total.page = 1; rerenderKeep(); },
  plq: t => { S.plan.q = t.value; rerenderKeep(); }, plonly: t => { S.plan.onlyPlanned = t.checked; rerenderKeep(); },
  ufile: t => { S.upd.files.find(f => f.id === t.dataset.id).on = t.checked; },
  ubase: t => { S.upd.baseDate = t.value; }, unb: t => { S.upd.newBatch = t.checked; rerenderKeep(); },
  unbd: t => { S.upd.nbDate = t.value; }, unbf: t => { S.upd.nbFrom = t.value; }, unbt: t => { S.upd.nbTo = t.value; },
  uvc: t => { S.upd.versionChanged = t.checked; },
  umode: null,
  role: t => { S.role = t.value; rerenderKeep(); toast(ROLES[S.role].canEdit ? '演示身份：运营甲，可编辑计划（不是真实权限）' : '演示身份：查看者，所有输入只读（不是真实权限）'); },
};
ACT.umode = t => { S.upd.salesMode = t.dataset.v; rerenderKeep(); };
const LIVE = new Set(['plan', 'note', 'half', 'smulti']);          // 每次输入都处理
const DEBOUNCE = new Set(['cq', 'sq', 'tq', 'plq']);                // 文本筛选：输入停止后再重绘

/* ========== 全局搜索浮层 ========== */
function hidePop() { const p = $('#gpop'); p.hidden = true; p.innerHTML = ''; $('#gq').setAttribute('aria-expanded', 'false'); }
function showPop() {
  const q = $('#gq').value; const p = $('#gpop');
  if (!q.trim()) { hidePop(); return; }
  const r = searchProducts(q);
  p.innerHTML = (r.length ? r.slice(0, 6).map(x => { const l = L(x.lids[0]); return `<button class="pop-item" data-act="popsku" data-pid="${x.p.pid}" data-cc="${l.country}" data-lid="${l.lid}" role="option"><span class="mono" style="font-weight:600">${markHit(x.p.sku, q)}</span><span class="small muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${markHit(x.p.name, q)}</span>${x.hits.map(h => tag('line', h)).join(' ')}<span class="tiny muted">${x.lids.length} 条</span></button>`; }).join('') : `<div class="pop-foot">没有匹配“${esc(q)}”的 SKU / 品名 / ASIN / MSKU</div>`) + `<button class="pop-item" data-act="popall"><span class="small">查看全部 ${r.length} 个结果（可组合国家/负责人） ↵</span></button>`;
  p.hidden = false; $('#gq').setAttribute('aria-expanded', 'true');
}

function boot() {
  $('#role').innerHTML = Object.entries(ROLES).map(([k, r]) => `<option value="${k}">${r.label}</option>`).join('');
  $('#menuBtn').innerHTML = icon('sidebar'); $('#densBtn').innerHTML = icon('density'); $('#gsIcon').outerHTML = icon('search');
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]'); if (!t) { if (!e.target.closest('.gsearch')) hidePop(); return; }
    if (t.disabled) return; const fn = ACT[t.dataset.act]; if (fn) fn(t, e);
  });
  let deb = null;
  document.addEventListener('input', e => {
    const t = e.target; if (t.id === 'gq') { showPop(); return; }
    const k = t.dataset && t.dataset.in; if (!k || !INP[k]) return;
    if (LIVE.has(k)) INP[k](t); else if (DEBOUNCE.has(k)) { clearTimeout(deb); deb = setTimeout(() => INP[k](t), 260); }
  });
  document.addEventListener('change', e => { const t = e.target; const k = t.dataset && t.dataset.in; if (!k || !INP[k] || LIVE.has(k) || DEBOUNCE.has(k)) return; INP[k](t); });
  document.addEventListener('keydown', e => {
    const tg = e.target;
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tg.tagName)) { e.preventDefault(); $('#gq').focus(); $('#gq').select(); return; }
    if (e.key === 'Escape') { if ($('#modal-root').innerHTML) closeModal(); hidePop(); if (S.expanded) { S.expanded = false; renderToolbarState(); } return; }
    if (tg.id === 'gq' && e.key === 'Enter') { ACT.popall(); return; }
    if (tg.id === 'gq' && e.key === 'ArrowDown') { const f = $('#gpop .pop-item'); if (f) { e.preventDefault(); f.focus(); } return; }
    if (tg.classList && tg.classList.contains('pop-item') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); const n = e.key === 'ArrowDown' ? tg.nextElementSibling : tg.previousElementSibling; (n && n.classList.contains('pop-item') ? n : $('#gq')).focus(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && tg.matches('th[data-act]')) { e.preventDefault(); tg.click(); }
    if (e.key === 'Enter' && tg.classList && tg.classList.contains('ein')) { // Enter 移到下一行同列
      e.preventDefault(); const td = tg.closest('td'); const tr = td.parentElement; const idx = [...tr.children].indexOf(td); let nx = tr.nextElementSibling; while (nx) { const c = nx.children[idx]; const inp = c && c.querySelector('input.ein:not(:disabled)'); if (inp) { inp.focus(); inp.select(); break; } nx = nx.nextElementSibling; }
    }
  });
  window.addEventListener('beforeunload', e => { if (dirtyCount()) { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('resize', () => { if (window.innerWidth > 1100 && S.expanded) { S.expanded = false; renderToolbarState(); } });
  render({ top: true });
}
boot();
