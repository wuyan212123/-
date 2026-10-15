/* ========== 可撑天数（断货风险）、库存推演、批次时间线、库龄构成 ==========
   口径（演示估算，非原公式）：
   - 日均销量 = 近4周均销 ÷ 7；只对有该字段的五国（US/CA/AU/UK/EU）计算，AE/SA 显示“不适用”。
   - 到仓日：已发货批次 = 最晚实际发货日 + 本国运输提前期 D1（示例参数）；新建待发批次 = 预计发货日（基准日后 3 天）+ D1；
     接收中 / 已完成批次视为已到仓。只计入国家页所选的在途批次，数量取批次行“当前值”（正数）。
   - 补货线 = D1 + 安全天数 14（示例参数）；可撑天数低于补货线 = 需尽快发货；到仓前 FBA 已卖完 = 断档；超过 120 天 = 偏多。 */
const SAFETY_DAYS = 14, PLAN_LEAD = 7, OVER_DAYS = 120, PROJ_DAYS = 140;
const ymdMs = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const dDiff = (a, b) => Math.round((ymdMs(b) - ymdMs(a)) / 864e5);
const dAdd = (s, n) => new Date(ymdMs(s) + Math.round(n) * 864e5).toISOString().slice(0, 10);
const mdOf = s => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`;
const tdOf = cc => D.CMAP[cc].transitDays || 40;

/** 批次的发货日与预计到仓日（示例推算，不是货件系统的预计日） */
function batchEta(b) {
  const td = tdOf(b.country);
  const created = b.ships.map(x => x.created).sort();
  const shipped = b.ships.map(x => x.shipped).filter(Boolean).sort().pop();
  let ship = shipped, est = false;
  if (!ship) { const c = created[created.length - 1] || b.bizDate; ship = dAdd(c > S.baseDate ? c : S.baseDate, 3); est = true; }
  const eta = dAdd(ship, td);
  const arrived = b.status === 'receiving' || b.status === 'closed';
  return { first: created[0] || b.bizDate, ship, shipEst: est, eta, td, arrived, overdue: !arrived && eta < S.baseDate };
}
function arrivalsOf(l) {
  const out = [];
  batchesOf(l.country).forEach(b => {
    if (!isSelected(b)) return;
    b.lines.forEach(ln => {
      if (ln.lid !== l.lid || !(ln.current > 0)) return;
      const e = batchEta(b);
      out.push({ day: e.arrived ? 0 : Math.max(0, dDiff(S.baseDate, e.eta)), qty: ln.current, label: b.label, eta: e.arrived ? S.baseDate : e.eta });
    });
  });
  return out.sort((a, b) => a.day - b.day);
}
/** 逐批模拟：FBA 按日均销量消耗，批次到仓补入。返回可撑天数、首次断档区间与状态 */
function simCover(fba, daily, arr) {
  let t = 0, stock = fba, gapFrom = null, gapTo = null;
  arr.forEach(a => {
    const out = t + stock / daily;
    if (out < a.day) { if (gapFrom == null) { gapFrom = out; gapTo = a.day; } stock = a.qty; } else stock = stock - (a.day - t) * daily + a.qty;
    t = a.day;
  });
  return { total: t + stock / daily, gapFrom, gapTo };
}
const COVER_MEMO = new Map();
function coverOf(l) {
  const cfg = D.CMAP[l.country];
  if (!cfg.half) return { na: true };
  const sig = `${S.baseDate}|${l.fba}|${l.avg4}|${String(selOf(l.country))}`;
  const hit = COVER_MEMO.get(l.lid); if (hit && hit.sig === sig) return hit.v;
  const arr = arrivalsOf(l); const daily = isNum(l.avg4) && l.avg4 > 0 ? l.avg4 / 7 : 0;
  let v;
  if (!daily) v = { none: true, arr };
  else {
    const s = simCover(l.fba, daily, arr); const line = tdOf(l.country) + SAFETY_DAYS;
    const gap = s.gapFrom == null ? 0 : Math.round(s.gapTo - s.gapFrom);
    const st = gap > 0 ? 'bad' : s.total < line ? 'warn' : s.total > OVER_DAYS ? 'mute' : 'ok';
    v = { daily, arr, fbaDays: l.fba / daily, total: s.total, gap, gapFrom: s.gapFrom, gapTo: s.gapTo, line, st };
  }
  COVER_MEMO.set(l.lid, { sig, v }); return v;
}
const COVER_ST = { bad: '断档', warn: '需发货', mute: '偏多', ok: '正常' };
function coverWord(c) { return c.st === 'bad' ? `断档${c.gap}天` : COVER_ST[c.st]; }
/** 排序：越急越靠前（升序）。断档按“卖完的那天”，其余按可撑天数；无销量与不适用排最后 */
function coverSortKey(l) { const c = coverOf(l); return c.na || c.none ? 1e9 : c.st === 'bad' ? c.gapFrom - 1000 : c.total; }

/* —— ① 断货风险条（表格单元格） —— */
function coverCell(l) {
  const c = coverOf(l);
  if (c.na) return V('NF');
  if (c.none) return `<span class="na" title="近4周均销为 0，无法估算可撑天数">无销量</span>`;
  const W = 60, H = 12, MAX = OVER_DAYS; const x = d => Math.min(d, MAX) / MAX * W;
  const fbaEnd = x(c.fbaDays);
  let g = `<rect class="cv-fba" x="0" y="2" width="${Math.max(1, fbaEnd).toFixed(1)}" height="8" rx="2"/>`;
  let softFrom = c.fbaDays;
  if (c.gap > 0) { g += `<rect class="cv-gap" x="${(x(c.gapFrom) + 1).toFixed(1)}" y="2" width="${Math.max(1.5, x(c.gapTo) - x(c.gapFrom) - 2).toFixed(1)}" height="8"/>`; softFrom = c.gapTo; }
  if (c.total > softFrom + 0.5) g += `<rect class="cv-soft" x="${(x(softFrom) + 1).toFixed(1)}" y="2" width="${Math.max(1, x(c.total) - x(softFrom) - 1).toFixed(1)}" height="8" rx="2"/>`;
  g += `<line class="cv-line" x1="${x(c.line).toFixed(1)}" x2="${x(c.line).toFixed(1)}" y1="0" y2="${H}"/>`;
  const next = c.arr.find(a => a.day > 0);
  const desc = `可撑约 ${Math.round(c.total)} 天（FBA ${Math.round(c.fbaDays)} 天${c.arr.length ? ` + 在途 ${c.arr.length} 批` : ''}）；${c.gap > 0 ? `${mdOf(dAdd(S.baseDate, c.gapFrom))} 卖完，${mdOf(dAdd(S.baseDate, c.gapTo))} 才到仓，断档 ${c.gap} 天` : COVER_ST[c.st]}${next ? `；下一批 ${next.label} 预计 ${mdOf(next.eta)} 到仓` : ''}；补货线 ${c.line} 天。演示估算，非原公式`;
  return `<span class="cv" title="${esc(desc)}"><svg class="cv-bar" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(desc)}">${g}</svg><span class="cv-n">${Math.round(c.total)}</span>${c.st === 'ok' ? '' : `<span class="cv-w cv-${c.st}">${esc(coverWord(c))}</span>`}</span>`;
}

/* —— ② 库存推演图（SKU 详情 · 发货计划） —— */
function projSlot(id, lid) { CHARTS[id] = { type: 'proj', lid }; return `<div class="yoy proj" id="${id}" tabindex="0" role="group" aria-label="未来 20 周 FBA 库存推演，左右方向键按周查看"></div>`; }
function projSeries(l, extra) {
  const c = coverOf(l); const daily = c.daily; const arr = c.arr.slice(); if (extra) { arr.push(extra); arr.sort((a, b) => a.day - b.day); }
  const pts = []; let stock = l.fba;
  for (let t = 0; t <= PROJ_DAYS; t++) {
    if (t > 0) stock = Math.max(0, stock - daily);
    arr.forEach(a => { if (a.day === t) stock += a.qty; });
    pts.push(stock);
  }
  return { pts, arr };
}
function projPlan(l) { const q = planQty(l.lid); return q > 0 ? { day: PLAN_LEAD + tdOf(l.country), qty: q, label: '本次发货', eta: dAdd(S.baseDate, PLAN_LEAD + tdOf(l.country)), plan: true } : null; }
function projText(l) {
  const c = coverOf(l); const p = projPlan(l);
  const base = c.gap > 0 ? `只靠现有在途：${mdOf(dAdd(S.baseDate, c.gapFrom))} 卖完，${mdOf(dAdd(S.baseDate, c.gapTo))} 才有货到仓（断档 ${c.gap} 天），之后可撑到 ${mdOf(dAdd(S.baseDate, c.total))}`
    : `只靠现有在途：可撑到 ${mdOf(dAdd(S.baseDate, c.total))}（约 ${Math.round(c.total)} 天）`;
  if (!p) return `${base}。填写本次发货量后，图中会加一条“含本次发货”的推演线。`;
  const s = simCover(l.fba, c.daily, [...c.arr, p].sort((a, b) => a.day - b.day));
  return `${base}。加上本次发货 ${fmt(p.qty)} 件（预计 ${mdOf(p.eta)} 到仓）：${s.gapFrom != null && s.gapFrom < p.day ? `仍会在 ${mdOf(dAdd(S.baseDate, s.gapFrom))} 卖完、断档到 ${mdOf(dAdd(S.baseDate, s.gapTo))}，之后` : ''}可撑到 ${mdOf(dAdd(S.baseDate, s.total))}（约 ${Math.round(s.total)} 天）。`;
}
function drawProj(el, spec) {
  const l = L(spec.lid); const c = coverOf(l);
  const txt = el.parentElement && el.parentElement.querySelector(`[data-derived="projtxt-${l.lid}"]`); if (txt) txt.textContent = projText(l);
  const W = Math.max(280, Math.round(el.clientWidth)); const narrow = W < 560;
  const H = narrow ? 210 : 240; const m = { l: 44, r: narrow ? 12 : 128, t: 14, b: 26 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const p = projPlan(l); const A = projSeries(l, null); const B = p ? projSeries(l, p) : null;
  const safety = c.daily * SAFETY_DAYS;
  const ymax = niceMax(Math.max(...A.pts, ...(B ? B.pts : []), safety, 1));
  const X = t => m.l + t / PROJ_DAYS * iw, Y = v => m.t + ih - v / ymax * ih;
  const path = (pts, from = 0) => pts.map((v, t) => t < from ? '' : `${t === from ? 'M' : 'L'}${X(t).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:${W}px;height:${H}px" aria-hidden="true">`;
  // 断货区间（只靠现有在途）
  let zs = null; A.pts.forEach((v, t) => { if (v === 0 && zs == null && t > 0) zs = t; if (v > 0 && zs != null) { svg += `<rect class="pz" x="${X(zs - 1).toFixed(1)}" y="${m.t}" width="${(X(t) - X(zs - 1)).toFixed(1)}" height="${ih}"/>`; zs = null; } });
  if (zs != null) svg += `<rect class="pz" x="${X(zs - 1).toFixed(1)}" y="${m.t}" width="${(X(PROJ_DAYS) - X(zs - 1)).toFixed(1)}" height="${ih}"/>`;
  [0, 0.25, 0.5, 0.75, 1].forEach(f => { const v = f * ymax; svg += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="tick" x="${m.l - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end">${compact(v)}</text>`; });
  for (let t = 0; t <= PROJ_DAYS; t += narrow ? 56 : 28) svg += `<text class="tick" x="${X(t).toFixed(1)}" y="${H - 8}" text-anchor="${t === 0 ? 'start' : t === PROJ_DAYS ? 'end' : 'middle'}">${t === 0 ? '基准日 ' : ''}${mdOf(dAdd(S.baseDate, t))}</text>`;
  svg += `<line class="psafe" x1="${m.l}" x2="${W - m.r}" y1="${Y(safety).toFixed(1)}" y2="${Y(safety).toFixed(1)}"/>`;
  if (!narrow) svg += `<text class="tick" x="${W - m.r + 6}" y="${(Y(safety) + 3.5).toFixed(1)}">安全库存 ${fmt(Math.round(safety))}</text>`;
  svg += `<line class="xhair" id="${el.id}-x" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" style="display:none"/>`;
  svg += `<path class="pl-base" d="${path(A.pts)}"/>`;
  if (B) svg += `<path class="pl-plan" d="${path(B.pts, Math.max(0, p.day - 1))}"/>`;
  A.arr.filter(a => a.day > 0 && a.day <= PROJ_DAYS).forEach(a => { svg += `<circle class="pdot" cx="${X(a.day).toFixed(1)}" cy="${Y(A.pts[a.day]).toFixed(1)}" r="4"/>`; });
  if (B && p.day <= PROJ_DAYS) svg += `<circle class="pdot plan" cx="${X(p.day).toFixed(1)}" cy="${Y(B.pts[p.day]).toFixed(1)}" r="4.5"/>`;
  if (!narrow) {
    const ends = [{ y: Y(A.pts[PROJ_DAYS]), t: '只靠现有在途', cls: '' }]; if (B) ends.push({ y: Y(B.pts[PROJ_DAYS]), t: '含本次发货', cls: ' cur' });
    if (ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 13) ends[ends[0].y < ends[1].y ? 0 : 1].y -= 13 - Math.abs(ends[0].y - ends[1].y);
    ends.forEach(e => { svg += `<text class="endlab${e.cls}" x="${(X(PROJ_DAYS) + 6).toFixed(1)}" y="${(e.y + 4).toFixed(1)}">${e.t}</text>`; });
  }
  svg += `<rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}"/></svg>`;
  const legend = `<div class="yoy-legend"><span><i class="lg-base"></i>只靠现有在途</span>${B ? `<span><i class="lg-plan"></i>含本次发货 ${fmt(p.qty)} 件（预计 ${mdOf(p.eta)} 到仓）</span>` : ''}<span><i class="lg-dot"></i>在途批次到仓</span><span><i class="lg-zone"></i>断货区间（只靠现有在途）</span></div>`;
  el.innerHTML = legend + `<div class="yoy-plot">${svg}<div class="yoy-tip" hidden></div></div>`;
  const plot = el.querySelector('.yoy-plot'), tip = el.querySelector('.yoy-tip'), xh = el.querySelector(`#${CSS.escape(el.id)}-x`);
  const show = t => {
    if (t == null) { tip.hidden = true; xh.style.display = 'none'; return; }
    xh.setAttribute('x1', X(t)); xh.setAttribute('x2', X(t)); xh.style.display = '';
    tip.textContent = '';
    const h = document.createElement('div'); h.className = 'tt-h'; h.textContent = `${mdOf(dAdd(S.baseDate, t))}（第 ${t} 天）`; tip.appendChild(h);
    [[A, 'lg-base', '现有在途'], ...(B ? [[B, 'lg-plan', '含本次发货']] : [])].forEach(([s, cls, name]) => { const r = document.createElement('div'); r.className = 'tt-r'; const k = document.createElement('i'); k.className = cls; r.appendChild(k); const v = document.createElement('b'); v.textContent = s.pts[t] > 0 ? fmt(Math.round(s.pts[t])) : '断货'; r.appendChild(v); const n = document.createElement('span'); n.textContent = name; r.appendChild(n); tip.appendChild(r); });
    const hits = [...A.arr, ...(p ? [p] : [])].filter(a => a.day === t); hits.forEach(a => { const r = document.createElement('div'); r.className = 'tt-r'; const n = document.createElement('span'); n.textContent = `${a.label} 到仓 +${fmt(a.qty)}`; r.appendChild(n); tip.appendChild(r); });
    tip.hidden = false; const tx = X(t) + 12, tw = tip.offsetWidth; tip.style.left = (tx + tw > W ? X(t) - tw - 12 : tx) + 'px'; tip.style.top = m.t + 'px';
  };
  const tAt = cx => { const r = plot.getBoundingClientRect(); const t = Math.round((cx - r.left - m.l) / iw * PROJ_DAYS); return t >= 0 && t <= PROJ_DAYS ? t : null; };
  plot.onpointermove = ev => show(tAt(ev.clientX)); plot.onpointerleave = () => show(null);
  el.onkeydown = ev => { if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return; ev.preventDefault(); el._i = el._i == null ? 0 : Math.min(PROJ_DAYS, Math.max(0, el._i + (ev.key === 'ArrowRight' ? 7 : -7))); show(el._i); };
  el.onblur = () => { el._i = null; show(null); };
}
/** 编辑计划量后只重画对应推演图，不整页重绘 */
function redrawProj(lid) { Object.keys(CHARTS).forEach(id => { const sp = CHARTS[id]; if (sp.type === 'proj' && sp.lid === lid) { const el = document.getElementById(id); if (el) drawProj(el, sp); } }); }
function projSection(p, ls, d) {
  const cand = ls.filter(l => D.CMAP[l.country].half);
  if (!cand.length) return '';
  let l = (d.projLid && cand.find(x => x.lid === d.projLid)) || (d.lid && cand.find(x => x.lid === d.lid));
  if (!l && d.country !== 'ALL') l = cand.find(x => x.country === d.country);
  if (!l) l = cand.slice().sort((a, b) => coverSortKey(a) - coverSortKey(b))[0];
  const c = coverOf(l);
  const pick = cand.length > 1 ? `<label class="grp small muted">推演对象 <select class="sel" id="projlid" data-in="projlid" aria-label="选择推演的 Listing">${cand.map(x => `<option value="${x.lid}" ${x.lid === l.lid ? 'selected' : ''}>${x.country} · ${esc(x.msku)}</option>`).join('')}</select></label>` : '';
  const head = `<div class="panel-h"><h3>库存推演 · ${l.country} ${esc(l.msku)}</h3>${tag('demo', '演示估算')}<span class="spacer"></span>${pick}</div>`;
  if (c.none) return `<div class="panel proj-panel">${head}<div class="empty small"><h2>近4周均销为 0</h2><div>没有销量就无法推演库存消耗。</div></div></div>`;
  return `<div class="panel proj-panel">${head}<div class="panel-b"><p class="proj-txt" data-derived="projtxt-${l.lid}">${esc(projText(l))}</p>${projSlot('proj-d', l.lid)}
    <div class="note">${icon('info')} 演示估算，非原公式：日均销量 = 近4周均销 ÷ 7；在途按所选批次、到仓日 = 发货日 + 运输期 ${tdOf(l.country)} 天（示例参数）；本次发货假设 ${PLAN_LEAD} 天后发出。改上方计划量时图会立即更新。</div></div></div>`;
}

/* —— ⑤ 批次时间线（批次与在途 · 另一种查看方式） —— */
function batchTimeline(cc, bs) {
  const es = bs.map(b => ({ b, e: batchEta(b) }));
  const lo = dAdd(es.map(x => x.e.ship < x.e.first ? x.e.ship : x.e.first).sort()[0], -4);
  const hi = dAdd([...es.map(x => x.e.eta), S.baseDate].sort().pop(), 8);
  const span = dDiff(lo, hi); const pct = s => (dDiff(lo, s) / span * 100).toFixed(2) + '%';
  const months = []; for (let y = +lo.slice(0, 4), mo = +lo.slice(5, 7); ; mo++) { if (mo > 12) { mo = 1; y++; } const s = `${y}-${String(mo).padStart(2, '0')}-01`; if (s > hi) break; if (s >= lo && dDiff(lo, s) / span < 0.95) months.push(s); }
  const base = pct(S.baseDate);
  const stText = ({ b, e }) => {
    if (b.status === 'closed') return '已完成';
    if (b.status === 'receiving') return '接收中';
    if (b.status === 'created') return `新建待发 · 预计 ${mdOf(e.eta)} 到`;
    if (e.overdue) return `超期 ${dDiff(e.eta, S.baseDate)} 天未到`;
    return `在途 · ${dDiff(S.baseDate, e.eta)} 天后到`;
  };
  const cls = ({ b, e }) => b.status === 'closed' ? 'done' : b.status === 'receiving' ? 'recv' : b.status === 'created' ? 'new' : e.overdue ? 'late' : 'transit';
  const rows = es.map(x => {
    const { b, e } = x; const on = isSelected(b);
    const tip = `${cc} ${b.label}：${e.shipEst ? '预计发货' : '发货'} ${e.ship} → 预计到仓 ${e.eta}（发货日 + 运输期 ${e.td} 天，示例推算）${on ? '' : '；未计入在途'}`;
    return `<div class="tl-row${on ? '' : ' off'}"><div class="tl-lab"><button class="link mono" data-act="batch" data-bid="${b.bid}">${esc(b.label)}</button></div>
      <div class="tl-track"><span class="tl-base" style="left:${base}"></span><span class="tl-bar ${cls(x)}${b.kind === 'SY' ? ' sy' : ''}" style="left:${pct(e.ship)};width:max(6px, calc(${pct(e.eta)} - ${pct(e.ship)}))" title="${esc(tip)}"></span><span class="tl-eta" style="left:${pct(e.eta)}">${mdOf(e.eta)}</span></div>
      <div class="tl-st"><span class="dot-s ${cls(x)}"></span>${esc(stText(x))}${on ? '' : ' <span class="tiny muted">未计入</span>'}</div></div>`;
  }).join('');
  return `<div class="tl" role="group" aria-label="${cc} 批次时间线：每行从发货日到预计到仓日">
    <div class="tl-row tl-axis" aria-hidden="true"><div class="tl-lab"></div><div class="tl-track">${months.map(s => `<span class="tl-m" style="left:${pct(s)}">${Number(s.slice(5, 7))}月</span>`).join('')}<span class="tl-base-lab" style="left:${base}">基准日 ${mdOf(S.baseDate)}</span></div><div class="tl-st"></div></div>
    ${rows}
    <div class="tl-legend"><span><i class="done"></i>已完成</span><span><i class="recv"></i>接收中</span><span><i class="transit"></i>在途</span><span><i class="late"></i>超期未到</span><span><i class="new"></i>新建待发</span><span>到仓日为示例推算：发货日 + 运输期 ${tdOf(cc)} 天</span></div></div>`;
}

/* —— ⑥ 库龄构成条 —— */
const agingParts = l => [l.aging.lt180, l.aging.m180_365, l.aging.gt365];
const agingOldShare = l => { const t = sumNums(agingParts(l)); return t ? l.aging.gt365 / t : 0; };
function agingMixCell(l) {
  const v = agingParts(l); const t = sumNums(v); if (!t) return V(null);
  const W = 110; let x = 0; const segs = v.map((n, k) => { const w = n / t * W; const r = n ? `<rect class="ag${k + 1}" x="${(x + (k && x > 0 ? 1 : 0)).toFixed(1)}" y="1" width="${Math.max(0, w - (k && x > 0 ? 1 : 0)).toFixed(1)}" height="10"/>` : ''; x += w; return r; }).join('');
  const desc = `180 天以内 ${fmt(v[0])}，180–365 天 ${fmt(v[1])}，365 天以上 ${fmt(v[2])}（${Math.round(v[2] / t * 100)}%）`;
  return `<span class="cv" title="${esc(desc)}"><svg class="ag-bar" width="${W}" height="12" viewBox="0 0 ${W} 12" role="img" aria-label="${esc(desc)}">${segs}</svg><span class="cv-n">${Math.round(v[2] / t * 100)}%</span></span>`;
}
function agingTop(n = 8) {
  const rows = D.LISTINGS.filter(l => sumNums(agingParts(l)) > 0).sort((a, b) => agingOldShare(b) - agingOldShare(a) || b.aging.gt365 - a.aging.gt365).slice(0, n);
  return `<div class="ag-top"><div class="ag-legend"><span><i class="ag1"></i>180 天以内</span><span><i class="ag2"></i>180–365 天</span><span><i class="ag3"></i>365 天以上</span></div>
    ${rows.map(l => { const v = agingParts(l), t = sumNums(v); const desc = `${l.country} ${l.sku}：180 天以内 ${fmt(v[0])}，180–365 天 ${fmt(v[1])}，365 天以上 ${fmt(v[2])}`; return `<div class="ag-row"><div class="ag-lab"><button class="sku-btn" data-act="sku" data-pid="${l.pid}" data-cc="${l.country}" data-lid="${l.lid}">${esc(l.sku)}</button> <span class="tiny muted">${l.country} · ${esc(P(l.pid).name)}</span></div>
      <div class="ag-track" role="img" aria-label="${esc(desc)}" title="${esc(desc)}">${v.map((x, k) => x ? `<span class="ag${k + 1}" style="flex:${x} 1 0"></span>` : '').join('')}</div>
      <div class="ag-v"><b>${Math.round(v[2] / t * 100)}%</b> <span class="tiny muted">365+ ${fmt(v[2])} 件</span></div></div>`; }).join('')}</div>`;
}

Object.assign(ACT_EXTRA, { bmode: t => { cui(S.country).bmode = t.dataset.v; rerenderKeep(); } });
Object.assign(INP_EXTRA, { projlid: t => { S.detail.projLid = t.value; rerenderKeep(); } });
