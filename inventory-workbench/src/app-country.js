/* ========== 共享：月矩阵 / 周历史 / 半月计划 ========== */
function yearRowsForListing(l) {
  const cfg = D.CMAP[l.country]; const rows = [];
  const years = [...cfg.annualOnly.map(y => ({ y, t: 'annual' })), ...cfg.monthYears.map(y => ({ y, t: 'month' }))].sort((a, b) => a.y - b.y);
  years.forEach(({ y, t }) => {
    if (t === 'annual') { rows.push({ y, type: 'annual', total: l.annual[y], note: l.country === 'SA' ? 'SA 年度字段（Z列）' : '仅年总量' }); return; }
    const arr = l.monthly[y]; const s = sumNums(arr); const src = l.annual[y];
    let flag = '';
    if (l.country === 'SA') flag = tag('mute', '年度源值含未列月份，不拆分');
    else if (isNum(src) && src !== s) flag = tag('warn', `月合计 ${fmt(s)} ≠ 年度源值 · 待核对`, 'warn');
    rows.push({ y, type: 'month', arr, total: src, cutM: y === D.BASE.y ? D.BASE.m : null, flag });
  });
  return rows;
}
function yearRowsForProduct(p) {
  return [2023, 2024, 2025, 2026].map(y => ({ y, type: 'month', arr: p.total.monthly[y], total: p.total.annual[y], cutM: y === D.BASE.y ? D.BASE.m : null, flag: '' }));
}
function monthMatrix(id, groups, o = {}) {
  const hk = o.hlKey || id; const hm = S.hl[hk];
  const ident = o.ident !== false;
  const mh = D.MONTHS.map((m, i) => `<th class="c matrix-cell sortable ${hm === i ? 'hl' : ''}" data-act="hlmonth" data-hk="${hk}" data-m="${i}" tabindex="0" title="点击高亮所有年份的${m}" aria-pressed="${hm === i}">${m}${hm === i ? '<span class="th-flag">● 已高亮</span>' : ''}</th>`).join('');
  const head = `<thead><tr>${ident ? `<th class="l fz1" style="min-width:${o.fz1w || 172}px">${o.c1 || 'SKU'}</th><th class="l fz2" style="min-width:170px">${o.c2 || '品名 / Listing'}</th>` : ''}<th class="l ${ident ? '' : 'fz1 last'}" style="min-width:64px">年份</th>${mh}<th style="min-width:96px">年合计<span class="th-sub">年度源值</span></th><th class="l" style="min-width:120px">核对</th></tr></thead>`;
  const body = groups.map(g => g.rows.map((r, ri) => {
    const idc = ident ? `<td class="l fz1 ${ri ? 'ghost-cell' : ''}">${ri ? '' : g.c1}</td><td class="l fz2">${ri ? '' : g.c2}</td>` : '';
    const yc = `<td class="year-c ${ident ? '' : 'fz1 last'}">${r.y}</td>`;
    if (r.type === 'annual') return `<tr class="${ri ? '' : 'g-start'}">${idc}${yc}<td colspan="12" class="l dim" title="源表该年没有月份字段：不拆分、不平均、不反推月份">${tag('mute', r.note || '仅年总量')}<span class="note-inline"> 源表该年无月份字段，不拆分</span></td><td class="sum-c">${V(r.total)}</td><td class="l"></td></tr>`;
    const cells = r.arr.map((v, i) => `<td class="${hm === i ? 'hl' : ''}">${V(v)}${r.cutM === i + 1 && isNum(v) ? `<span class="cut" title="该记录只统计到 ${S.baseDate}，与往年完整月不可直接同比">${curMonthLabel()}</span>` : ''}</td>`).join('');
    const tn = r.cutM ? `<span class="cut-sum" title="截至基准日累计，非全年合计">累计</span>` : '';
    return `<tr class="${ri ? '' : 'g-start'}">${idc}${yc}${cells}<td class="sum-c">${V(r.total)}${tn}</td><td class="l">${r.flag || ''}</td></tr>`;
  }).join('')).join('');
  return `<div class="tbl-wrap ${o.wrapCls || ''}" id="${id}" style="--fz1w:${o.fz1w || 172}px"><table class="t">${head}<tbody>${body || `<tr><td colspan="16"><div class="empty"><h3>没有匹配的记录</h3></div></td></tr>`}</tbody></table></div>`;
}
function weekIdx(st) {
  let idx = D.WEEKS.map((w, i) => i).filter(i => st.wyear === 'ALL' || String(D.WEEKS[i].srcYear) === st.wyear);
  if (st.wfrom) { const a = D.WEEKS.findIndex(w => w.key === st.wfrom); idx = idx.filter(i => i >= a); }
  if (st.wto) { const b = D.WEEKS.findIndex(w => w.key === st.wto); idx = idx.filter(i => i <= b); }
  return idx;
}
function weekControls(scope, st) {
  const opts = D.WEEKS.filter(w => st.wyear === 'ALL' || String(w.srcYear) === st.wyear);
  const years = [...new Set(D.WEEKS.map(w => String(w.srcYear)))];
  return `<div class="row small">
    <span class="muted">源周区年份</span>${seg([{ id: 'ALL', label: '全部' }, ...years.map(y => ({ id: y, label: y, cnt: D.WEEKS.filter(w => String(w.srcYear) === y).length }))], st.wyear, 'wyear', `data-scope="${scope}"`)}
    <label class="row">从 <select class="sel" id="wf-${scope}" data-in="wfrom" data-scope="${scope}" aria-label="起始周"><option value="">最早</option>${opts.map(w => `<option value="${w.key}" ${st.wfrom === w.key ? 'selected' : ''}>${w.key}（${w.start.slice(5)}）</option>`).join('')}</select></label>
    <label class="row">到 <select class="sel" id="wt-${scope}" data-in="wto" data-scope="${scope}" aria-label="结束周"><option value="">最新</option>${opts.map(w => `<option value="${w.key}" ${st.wto === w.key ? 'selected' : ''}>${w.key}（${w.end.slice(5)}）</option>`).join('')}</select></label>
    <button class="btn sm" data-act="wquick" data-scope="${scope}" data-q="last8">最近8周</button><button class="btn sm" data-act="wquick" data-scope="${scope}" data-q="all">全部已有周（${D.WEEKS.length}）</button>
  </div>`;
}
function weekHead(i) {
  const w = D.WEEKS[i];
  return `<th class="c" style="min-width:86px" title="${w.start} ~ ${w.end}；ISO ${w.isoYear}-W${String(w.week).padStart(2, '0')}">${w.key}<span class="th-flag">${w.start.slice(2).replace(/-/g, '/')}–${w.end.slice(5).replace('-', '/')}</span>${w.crossYear ? '<span class="th-flag">跨年周</span>' : ''}${w.latest ? '<span class="th-flag">最新完整周</span>' : ''}</th>`;
}
function weekTable(id, items, st, o = {}) {
  const idx = weekIdx(st);
  if (!idx.length) return `<div class="empty"><h3>所选范围没有周期</h3><div>调整起止周。</div></div>`;
  const head = `<thead><tr><th class="l fz1" style="min-width:${o.fz1w || 172}px">${o.c1 || 'SKU'}</th><th class="l fz2" style="min-width:150px">${o.c2 || 'MSKU'}</th>${idx.map(weekHead).join('')}<th style="min-width:90px">区间合计<span class="th-sub">仅数值周</span></th></tr></thead>`;
  const body = items.map(it => `<tr><td class="l fz1">${it.c1}</td><td class="l fz2">${it.c2}</td>${idx.map(i => `<td>${it.vals ? V(it.vals[i]) : V('NF')}</td>`).join('')}<td class="sum-c">${it.vals ? fmt(sumNums(idx.map(i => it.vals[i]))) : ''}</td></tr>`).join('');
  return `<div class="tbl-wrap" id="${id}" style="--fz1w:${o.fz1w || 172}px"><table class="t">${head}<tbody>${body}</tbody></table></div>`;
}
function arrivalIdx(cc, shipDate) {
  const cfg = D.CMAP[cc]; if (!cfg.transitDays || !shipDate) return -1;
  const d = new Date(shipDate + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + cfg.transitDays); const ds = d.toISOString().slice(0, 10);
  let k = -1; D.HALF.forEach((h, i) => { if (h.start <= ds) k = i; }); return { k, date: ds };
}
function halfHead(i, arr) { const h = D.HALF[i]; return `<th class="c ${arr === i ? 'arrive' : ''}" style="min-width:84px" title="${h.y}年${h.m}月${h.h}半月">${h.label}${arr === i ? '<span class="th-flag">◆ 预计到仓</span>' : ''}</th>`; }

/* ========== 国家主表 ========== */
function filteredListings(cc) {
  const c = cui(cc); const q = norm(c.q);
  let rows = listingsOf(cc).filter(l => {
    const p = P(l.pid);
    if (q && ![l.sku, p.name, l.asin, l.msku].some(x => norm(x).includes(q))) return false;
    if (c.owner === '__none' ? l.owner : (c.owner !== 'ALL' && l.owner !== c.owner)) return false;
    if (c.grade !== 'ALL' && l.grade !== c.grade) return false;
    if (c.label !== 'ALL' && !l.labels.includes(c.label)) return false;
    if (c.issue && !issuesOfL(l.lid).length && !(l.variant && ['zeroden', 'outgroup', 'referr'].includes(l.variant.kind))) return false;
    return true;
  });
  rows = sortRows(rows, c.sort, { sku: r => r.sku, fba: r => r.fba, transit: r => transitOf(r.lid), avg4: r => r.avg4, plan: r => planQty(r.lid), m9: r => isNum(r.monthly[2026]?.[8]) ? r.monthly[2026][8] : null, owner: r => r.owner || '' });
  return rows;
}
const VIEWS = [
  { id: 'overview', label: '综合总览' }, { id: 'month', label: '月历史' }, { id: 'week', label: '周历史', need: 'weeks' }, { id: 'future', label: '未来计划/目标', need: 'half' },
  { id: 'plan', label: '发货计划', need: 'plan' }, { id: 'batch', label: '批次与在途' }, { id: 'stock', label: '库存明细' }, { id: 'info', label: '商品资料' },
];
function viewAvailable(cc, v) { const cfg = D.CMAP[cc]; if (v.need === 'weeks') return cfg.weeks; if (v.need === 'half') return cfg.half; if (v.need === 'plan') return cfg.half || cfg.stocking; return true; }
const TIER_TXT = { full: '五国完整结构', ae: 'AE 部分结构', sa: 'SA 简表' };

PAGES.country = function () {
  const cc = S.country, cfg = D.CMAP[cc], c = cui(cc);
  const all = listingsOf(cc); const rows = filteredListings(cc);
  const pages = Math.max(1, Math.ceil(rows.length / c.size)); if (c.page > pages) c.page = pages;
  const pageRows = paginate(rows, c.page, c.size);
  const owners = [...new Set(all.map(l => l.owner).filter(Boolean))].sort();
  const hasNone = all.some(l => !l.owner);
  const v = VIEWS.find(x => x.id === c.view) || VIEWS[0];
  const moreCount = (c.grade !== 'ALL') + (c.label !== 'ALL') + !!c.issue + !!S.hideZero;
  const filtersOn = c.q || c.owner !== 'ALL' || c.grade !== 'ALL' || c.label !== 'ALL' || c.issue;
  const covMissing = cfg.tier === 'ae' ? ['周历史', '运输期', '变体比例', '20期半月计划', '财年月目标', '五国发货推演'] : cfg.tier === 'sa' ? ['完整12个月区', '周历史', '国内库存字段', '补货数量区', '半月计划', '财年月目标', '变体比例'] : [];
  return `
  <div class="page-h"><div class="grow"><h1>${cfg.name} ${cc} · 国家进销存</h1>
    <div class="sub">${listingsOf(cc).length} 条 Listing · 点击 SKU 查看统一详情${cfg.fbaPool ? ' · FBA 共享库存池取 DE' : ''}</div></div>
    <div class="seg country-tabs" role="tablist" aria-label="国家">${D.COUNTRIES.map(x => `<button role="tab" aria-selected="${x.code === cc}" data-act="country" data-v="${x.code}" title="${x.name} · ${TIER_TXT[x.tier]}">${x.code}${x.tier !== 'full' ? ` <span class="cov">${x.tier === 'ae' ? '部分' : '简表'}</span>` : ''}</button>`).join('')}</div>
  </div>
  ${covMissing.length ? `<div class="callout warn" style="margin-bottom:12px">${icon('warn')}<div><b>${TIER_TXT[cfg.tier]}</b>　原表未设${covMissing.join('、')}，这些位置显示“不适用”，不补 0。</div></div>` : ''}
  <div class="panel">
    <div class="panel-h">
      <div class="seg" role="tablist" aria-label="工作视图">${VIEWS.map(x => `<button role="tab" aria-selected="${x.id === c.view}" data-act="cview" data-v="${x.id}">${x.label}${viewAvailable(cc, x) ? '' : ' <span class="cnt">未设</span>'}</button>`).join('')}</div>
    </div>
    <div class="filters">
      <input class="inp" id="cq-${cc}" data-in="cq" placeholder="本国内筛选 SKU / 品名 / ASIN / MSKU" value="${esc(c.q)}" style="flex:1 1 220px;min-width:0;max-width:320px" aria-label="本国内筛选">
      <label class="grp" title="原字段：${esc(cfg.ownerField)}">${esc(cfg.ownerField)} <select class="sel" id="co-${cc}" data-in="cowner" aria-label="负责人筛选"><option value="ALL">全部</option>${owners.map(o => `<option ${c.owner === o ? 'selected' : ''}>${o}</option>`).join('')}${hasNone ? `<option value="__none" ${c.owner === '__none' ? 'selected' : ''}>未分配</option>` : ''}</select></label>
      <button class="btn sm${S.moreF ? ' on' : ''}" data-act="morefilters" aria-expanded="${S.moreF}">${icon('density')} 更多筛选${moreCount ? ` <span class="badge">${moreCount}</span>` : ''}</button>
      <span class="spacer"></span>
      <span class="small muted">${rows.length === all.length ? `${all.length} 条` : `筛选出 <b>${rows.length}</b> / ${all.length} 条`}</span>
      ${filtersOn ? `<button class="link small" data-act="cclear">清空筛选</button>` : ''}
    </div>
    ${S.moreF ? `<div class="filters more"><label class="grp">等级 <select class="sel" id="cg-${cc}" data-in="cgrade" aria-label="产品等级"><option value="ALL">全部</option>${['A', 'B', 'C', '新品'].map(g => `<option ${c.grade === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label><label class="grp">标签 <select class="sel" id="cl-${cc}" data-in="clabel" aria-label="产品标签"><option value="ALL">全部</option>${['常规', '季节性', '清货', '新品'].map(g => `<option ${c.label === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label><label class="chk"><input type="checkbox" class="sw" id="ci-${cc}" data-in="cissue" ${c.issue ? 'checked' : ''}> 仅看待核对</label><label class="chk" title="显示选项：真实0显示为空白，底层仍为0；未知/缺失仍显示文字"><input type="checkbox" class="sw" id="hz" data-in="hidezero" ${S.hideZero ? 'checked' : ''}> 零值显示为空白</label><label class="chk" title="显示 ASIN、MSKU、等级、箱数等全部列"><input type="checkbox" class="sw" id="ac" data-in="allcols" ${S.allCols ? 'checked' : ''}> 显示全部列</label></div>` : ''}
    ${viewAvailable(cc, v) ? countryView(cc, c, pageRows, rows) : notApplicable(cc, v)}
    ${['overview', 'month', 'week', 'future', 'plan', 'stock', 'info'].includes(c.view) && viewAvailable(cc, v) ? pager('country', rows.length, c.page, c.size, [8, 12, 25, 50]) : ''}
  </div>`;
};
function notApplicable(cc, v) {
  const why = { week: '本国原表没有周销量区', future: '本国原表没有 20 期半月计划与 APR—MAR 财年月目标区', plan: '本国原表未设补货数量区（发货推演）' }[v.id];
  return `<div class="empty" style="border-top:1px solid var(--line)"><h3>${esc(v.label)}：不适用</h3><div>${why}。这里不补造同样结构，也不用 0 代替。该国已有的数据可在“综合总览 / 月历史 / 批次与在途 / 库存明细”及 SKU 统一详情中查看。</div></div>`;
}
const skuCell = (l, list) => `<button class="sku-btn" data-act="sku" data-pid="${l.pid}" data-cc="${l.country}" data-lid="${l.lid}" ${list ? `data-list="${list}"` : ''} title="打开 ${esc(l.sku)} 统一详情">${esc(l.sku)}</button>${listingsOfP(l.pid).filter(x => x.country === l.country).length > 1 ? `<span class="multi" title="同国同 SKU 有 ${listingsOfP(l.pid).filter(x => x.country === l.country).length} 个 Listing（ASIN/MSKU 各自独立）">×${listingsOfP(l.pid).filter(x => x.country === l.country).length}</span>` : ''}`;
const nameCell = l => `<span class="cell-name" title="${esc(P(l.pid).name)}">${esc(P(l.pid).name)}</span>`;
function statusCell(l) {
  const out = []; const iss = issuesOfL(l.lid);
  if (S.remote[l.lid]) out.push(['bad', '同事已改', '模拟：另一位同事已更新该计划记录']);
  if (isDirtyPlan(l.lid)) out.push(['warn', '未保存', '计划修改尚未保存']);
  if (iss.length) out.push(['warn', '待核对', iss.map(i => i.title).join('；')]);
  else if (l.variant && ['zeroden', 'outgroup', 'referr'].includes(l.variant.kind)) out.push(['warn', '待核对', '变体比例待核对']);
  if (!l.owner) out.push(['warn', '未分配', '负责人为空']);
  if (!out.length) return `<span class="st ok">正常</span>`;
  const [k, t, tip] = out[0];
  return `<span class="st ${k}" title="${esc(out.map(x => x[2]).join('；'))}">${t}${out.length > 1 ? `<span class="tiny muted"> +${out.length - 1}</span>` : ''}</span>`;
}
function listCtx(rows) { return rows.map(r => r.pid).filter((v, i, a) => a.indexOf(v) === i).join(','); }

function countryView(cc, c, rows, allRows) {
  const cfg = D.CMAP[cc]; const listAttr = listCtx(allRows);
  const ID = [
    { key: 'sku', label: 'SKU', sub: '领星SKU', fz: 1, cls: 'l', sort: true, render: l => skuCell(l, listAttr) },
    { key: 'name', label: '品名', fz: 2, cls: 'l', render: nameCell },
  ];
  const nextHalf = cfg.half ? D.HALF.findIndex(h => h.start > S.baseDate) : -1;
  const sel = selOf(cc);
  switch (c.view) {
    case 'overview': {
      const cols = [...ID,
        { key: 'asin', opt: 1, label: 'ASIN', cls: 'l mono', render: l => esc(l.asin) },
        { key: 'msku', opt: 1, label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
        { key: 'owner', label: esc(cfg.ownerField), cls: 'l', sort: true, render: ownerHtml },
        { key: 'grade', opt: 1, label: '等级', cls: 'c', render: l => esc(l.grade) },
        { key: 'fba', label: 'FBA可售', sub: cfg.fbaPool ? 'EU池·取DE' : 'L/H列', sort: true, render: l => V(l.fba) },
        { key: 'transit', label: '当前在途', sub: sel == null ? '保留原范围' : `所选 ${sel.length} 批`, sort: true, render: l => V(transitOf(l.lid), { keepZero: true }) },
        { key: 'dom', label: '国内现货', sub: cfg.domestic ? '共享池·引用' : '本表无字段', render: l => !cfg.domestic ? V('NF') : (l.domesticBlank ? `${V(null, { nullText: '空白' })} ${tag('warn', '待核对')}` : `${V(P(l.pid).domestic.avail, { keepZero: true })}`), title: '国内库存是跨国共享的SKU库存池：此处只是引用，全局汇总只计一次' },
        { key: 'avg4', label: '近4周均销', sub: cfg.half ? '源值' : '', sort: true, render: l => cfg.half ? V(l.avg4, { keepZero: true }) : V('NF') },
        { key: 'm9', label: '2026-09', sub: '月实际', sort: true, render: l => V(l.monthly[2026] ? l.monthly[2026][8] : 'NF') },
        { key: 'm10', label: '2026-10', flag: curMonthLabel(), render: l => V(l.monthly[2026] ? l.monthly[2026][9] : 'NF') },
        { key: 'h', label: cfg.half ? D.HALF[nextHalf].label + ' 计划' : '半月计划', sub: '下一期销售计划', render: l => cfg.half ? V(S.half[l.lid][nextHalf], { nullText: '未设置' }) : V('NF') },
        { key: 'plan', label: cfg.stocking ? '备货数量' : '本次发货量', sub: cfg.stocking ? 'AE·I列' : '人工计划', sort: true, tdCls: () => (cfg.half || cfg.stocking) ? 'edit-c' : '', render: l => (cfg.half || cfg.stocking) ? editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.sku} ${l.msku} 本次发货量` }) : `${V(null, { nullText: '未设' })}` },
        { key: 'box', opt: 1, label: '箱数', sub: cc === 'US' ? 'US局部公式 J=HT/I' : '示例·未核验', render: l => boxCell(l) },
        { key: 'st', label: '状态', cls: 'l', render: statusCell },
      ].filter(x => S.allCols || !x.opt);
      return table(`tbl-${cc}-overview`, cols, rows, { sort: c.sort, sortKey: 'country' }) + legendRow(['edit']);
    }
    case 'month': {
      const groups = rows.map(l => ({ c1: skuCell(l, listAttr), c2: `<span class="mono small">${esc(l.msku)}</span>`, rows: yearRowsForListing(l) }));
      const yrs = [...cfg.annualOnly, ...cfg.monthYears].sort();
      return `<div class="note">${icon('info')} 全部可用年份默认同时展开：${yrs.map(y => cfg.annualOnly.includes(y) ? `${y}（仅年总量）` : `${y}`).join('、')}。点击月份表头可高亮所有年份的同一月。${cc === 'EU' ? ' EU 未设 2022/2023 年度字段，不补造。' : ''}</div>` + monthMatrix(`tbl-${cc}-month`, groups, { hlKey: 'cm-' + cc, c2: 'MSKU' }) + legendRow(['hl', 'na']);
    }
    case 'week': {
      const items = rows.map(l => ({ c1: skuCell(l, listAttr), c2: `<span class="mono small">${esc(l.msku)}</span>`, vals: l.weekly }));
      return `<div class="filters" style="padding-top:0">${weekControls('country', c)}</div><div class="note">周历史与月实际分别保存：不从周量拼凑月实际。2024 源周区从 W21 开始（不是每年都从 WK1 起）。${cc === 'EU' ? ' EU 2026 周区年份证据来自 FE2/GR2 对 US!FZ2/HM2 的跨表引用。' : ''}</div>` + weekTable(`tbl-${cc}-week`, items, c);
    }
    case 'future': return futureView(cc, c, rows, listAttr);
    case 'plan': return planView(cc, c, rows, listAttr);
    case 'batch': return batchView(cc, c);
    case 'stock': {
      const cols = [...ID,
        { key: 'fba', label: 'FBA可售', sub: '源“FBA可用库存”', sort: true, render: l => V(l.fba) },
        { key: 'a1', label: '180天以内', render: l => V(l.aging.lt180) }, { key: 'a2', label: '180–365天', render: l => V(l.aging.m180_365) }, { key: 'a3', label: '365天以上', render: l => V(l.aging.gt365) },
        { key: 'v', label: '180+库龄货值', sub: '原值回查', render: l => V(l.value180) },
        { key: 'q', label: '国内库存', sub: cfg.domestic ? '共享池引用' : '无字段', render: l => cfg.domestic ? (l.domesticBlank ? `${V(null, { nullText: '空白' })} ${tag('warn', '待核对')}` : V(P(l.pid).domestic.avail, { keepZero: true })) : V('NF') },
        { key: 'r', label: '调拨库存', sub: cfg.tier === 'full' ? '5个白名单仓' : '无字段', render: l => cfg.tier === 'full' ? V(domesticOf(l.pid).transfer, { keepZero: true }) : V('NF') },
        { key: 's', label: 'FBA当前可售天数', sub: '源值·原公式待接入', render: l => cfg.half ? (l.daysNow == null ? tag('warn', '均销为0') : V(l.daysNow)) + (S.staleFba ? ' ' + tag('warn', '依赖旧库存') : '') : V('NF') },
        { key: 't', label: 'FBA共计可售天数', sub: '源值·原公式待接入', render: l => cfg.half ? (l.daysTotal == null ? tag('warn', '均销为0') : V(l.daysTotal)) : V('NF') },
        { key: 'transit', label: '当前在途', sub: '按所选批次', render: l => V(transitOf(l.lid), { keepZero: true }) },
      ];
      if (cc === 'US') cols.push(
        { key: 'ag', label: 'AWD可用库存', sub: 'AG · Avail+Resv+Outbound', render: l => `${V(l.awd.available + l.awd.reserved + l.awd.outbound)} <button class="link small" data-act="awd" data-lid="${l.lid}">组成</button>` },
        { key: 'ah', label: '海外仓总数量', sub: 'AH', render: l => V(l.overseas, { keepZero: true }) },
        { key: 'u', label: 'AWD&海外仓总数', sub: 'U · 源值', render: l => { const s = l.awd.available + l.awd.reserved + l.awd.outbound + l.overseas; return `${V(l.awdOverseasSrc)}${s !== l.awdOverseasSrc ? ' ' + tag('warn', `≠AG+AH(${fmt(s)})`, 'warn') : ''}`; } });
      return table(`tbl-${cc}-stock`, cols, rows, { sort: c.sort, sortKey: 'country' });
    }
    case 'info': {
      const cols = [...ID,
        { key: 'row', label: '序号', sub: '源行', cls: 'c', render: l => `<span class="mono">${l.srcRow}</span>` },
        { key: 'asin', label: 'ASIN', cls: 'l mono', render: l => esc(l.asin) },
        { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
        { key: 'owner', label: '负责人', sub: esc(cfg.ownerField), cls: 'l', render: ownerHtml },
        { key: 'var', label: '变体比例', sub: cfg.variant ? 'G列' : '无字段', cls: 'l', render: l => variantHtml(l.variant) },
        { key: 'size', label: '尺寸分段', cls: 'l', render: l => esc(P(l.pid).size) },
        { key: 'pack', label: '装率', sub: '箱规 B/L 查找', render: l => P(l.pid).packRate ? V(P(l.pid).packRate) : tag('warn', '缺装率', 'warn') },
        { key: 'box', label: '箱数', render: l => boxCell(l) },
        { key: 'grade', label: '产品等级', sub: '人工值', cls: 'c', render: l => esc(l.grade) },
        { key: 'lab', label: '原产品标签', cls: 'l', render: l => l.labels.map(x => tag('line', x)).join(' ') },
      ];
      return table(`tbl-${cc}-info`, cols, rows, { sort: c.sort, sortKey: 'country' }) + `<div class="note">${icon('info')} 序号、ASIN、品名、领星SKU、MSKU、负责人、变体比例、尺寸分段、装率、箱数对应源表 ${esc(cfg.src.id)}；产品等级/标签对应 ${esc(cfg.src.grade || '—')}。等级按原字段保存人工值，不自动重新分级。</div>`;
    }
  }
  return '';
}
function boxCell(l) {
  const cfg = D.CMAP[l.country]; if (!cfg.half && !cfg.stocking) return V('NF');
  const b = boxesOf(l.lid);
  if (b.why) return tag('warn', b.why, 'warn');
  if (b.v == null) return `<span data-derived="box-${l.lid}">${V(null)}</span>`;
  return `<span data-derived="box-${l.lid}">${fmt1(b.v)}</span>${l.country === 'US' ? '' : ' <span class="tiny muted">示例</span>'}`;
}
function legendRow(keys) {
  const m = { edit: '<span><i class="sw-edit"></i>可编辑的人工计划字段（只改计划，不改实际库存/在途）</span>', hl: '<span><i class="sw-hl"></i>高亮月份（表头另有“● 已高亮”文字）</span>', na: '<span>“未提供”=缺报 · “无字段”=源表未设 · “未发生”=期间未到 · 数字0=真实0</span>', ex: '<span><i class="sw-ex"></i>采购关联区：仅回查，本轮不计算</span>', arr: '<span><i class="sw-arr"></i>预计到仓半月（只高亮表头，不改预测值）</span>' };
  return `<div class="filters legend">${keys.map(k => m[k]).join('')}</div>`;
}

function futureView(cc, c, rows, listAttr) {
  const cfg = D.CMAP[cc];
  const sub = seg([{ id: 'half', label: '半月销量计划 · 20期' }, { id: 'fiscal', label: '财年月目标 APR—MAR' }], c.fut, 'fut');
  if (c.fut === 'fiscal') {
    const fa = S.fiscalAssume[cc] || '';
    const actualFor = (l, k) => { if (!fa) return null; const y0 = Number(fa); const mi = (k + 3) % 12; const y = k < 9 ? y0 : y0 + 1; return l.monthly[y] ? l.monthly[y][mi] : 'NF'; };
    const cols = [
      { key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: l => skuCell(l, listAttr) }, { key: 'msku', label: 'MSKU', fz: 2, cls: 'l mono', render: l => esc(l.msku) },
      { key: 'kind', label: '类型', cls: 'l', render: () => `<div>目标</div>${fa ? '<div class="muted">实际（假设对照）</div>' : ''}` },
      ...D.FISCAL.map((m, k) => ({ key: 'f' + k, label: m, cls: '', render: l => `<div>${V(l.fiscal[k])}</div>${fa ? `<div class="muted">${V(actualFor(l, k))}</div>` : ''}` })),
      { key: 'ft', label: '目标合计', render: l => `<div>${fmt(sumNums(l.fiscal))}</div>${fa ? `<div class="muted">${fmt(sumNums(D.FISCAL.map((_, k) => actualFor(l, k))))}</div>` : ''}` },
    ];
    return `<div class="filters" style="padding-top:0">${sub}<span class="spacer"></span>
      <label class="grp">对照实际 <select class="sel" id="fa-${cc}" data-in="fassume" aria-label="财年对照假设"><option value="">不对照（财年起止年份待确认）</option><option value="2025" ${fa === '2025' ? 'selected' : ''}>假设 2025-04 ~ 2026-03（演示对照）</option><option value="2026" ${fa === '2026' ? 'selected' : ''}>假设 2026-04 ~ 2027-03（演示对照）</option></select></label></div>
      <div class="filters" style="padding-top:0"><div class="callout warn" style="flex:1">${icon('warn')}<div>源字段只有 APR—MAR 标签（${esc(cfg.src.fiscal)}），没有可确认的财年起止年份。默认不对照；选择“假设”后才显示实际销量，且只作演示比较，不计算完成率。目标、预测、实际、本次发货量分别存放。</div></div></div>
      ${table(`tbl-${cc}-fiscal`, cols, rows, { wrapCls: '' })}`;
  }
  const ai = arrivalIdx(cc, c.shipDate);
  const cols = [
    { key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: l => skuCell(l, listAttr) }, { key: 'msku', label: 'MSKU', fz: 2, cls: 'l mono', render: l => esc(l.msku) },
    ...D.HALF.map((h, k) => ({ key: 'h' + k, label: h.label, flag: ai.k === k ? '◆ 预计到仓' : (halfPast(k) ? '已过期间' : halfCur(k) ? '当前期间' : ''), cls: ai.k === k ? 'arrive' : '', tdCls: () => 'edit-c' + (ai.k === k ? ' arrive' : ''), render: l => editNum('half', l.lid, S.half[l.lid][k], { k, dirty: isDirtyHalf(l.lid, k), ph: '未设置', aria: `${l.sku} ${h.label} 销售计划` }) })),
    { key: 'sum', label: '20期合计', render: l => `<span data-derived="hsum-${l.lid}">${fmt(sumNums(S.half[l.lid]))}</span>` },
  ];
  return `<div class="filters" style="padding-top:0">${sub}<span class="spacer"></span>
    <label class="grp">计划发货日 <input class="inp" type="date" id="sd-${cc}" data-in="shipdate" value="${c.shipDate}" aria-label="计划发货日"></label>
    <span class="small muted">+ 运输天数 ${cfg.transitDays} 天（D1·示例参数）→ 预计到仓 <b>${ai.date || '—'}</b></span></div>
    <div class="note">${icon('info')} 20 期覆盖 2026年7月上 至 2027年4月下（${esc(cfg.src.half)}），源表为保存数值、非公式。编辑只改销售计划，不改实际销量、发货计划或库存。空格表示“未设置”，不是0。</div>
    ${table(`tbl-${cc}-half`, cols, rows)}${legendRow(['edit', 'arr'])}`;
}

function planView(cc, c, rows, listAttr) {
  const cfg = D.CMAP[cc];
  if (cfg.stocking) {
    const cols = [
      { key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: l => skuCell(l, listAttr) }, { key: 'name', label: '品名', fz: 2, cls: 'l', render: nameCell },
      { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) }, { key: 'owner', label: '负责人', sub: esc(cfg.ownerField), cls: 'l', render: ownerHtml },
      { key: 'plan', label: '备货数量', sub: 'AE · I列', tdCls: () => 'edit-c', render: l => editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.sku} 备货数量` }) },
      { key: 'note', label: '备注', cls: 'l', tdCls: () => 'edit-c', render: l => noteInput(l) },
      { key: 'fba', label: 'FBA可售', render: l => V(l.fba) }, { key: 'tr', label: '当前在途', render: l => V(transitOf(l.lid), { keepZero: true }) },
      { key: 'dom', label: '国内现货', sub: '共享池', render: l => l.domesticBlank ? tag('warn', 'Q列空白·待核对') : V(P(l.pid).domestic.avail, { keepZero: true }) },
      { key: 'st', label: '状态', cls: 'l', render: statusCell },
    ];
    return `<div class="note">${icon('info')} AE 原表只有“备货数量”输入，无运输期、海运期末库存、可售天数推演区；这里不补造这些列。</div>` + table(`tbl-${cc}-plan`, cols, rows) + legendRow(['edit']);
  }
  const cols = [
    { key: 'sku', label: 'SKU', fz: 1, cls: 'l', sort: true, render: l => skuCell(l, listAttr) }, { key: 'name', label: '品名', fz: 2, cls: 'l', render: nameCell },
    { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
    { key: 'pack', label: '装率', sub: '箱规', render: l => P(l.pid).packRate ? V(P(l.pid).packRate) : tag('warn', '缺装率', 'warn') },
    { key: 'plan', label: '本次发货量', sub: cfg.src.plan.split(':')[0] + '列 · 人工', sort: true, tdCls: () => 'edit-c', render: l => editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.sku} ${l.msku} 本次发货量` }) },
    { key: 'box', label: '箱数', sub: cc === 'US' ? 'J=HT/I（局部已证）' : '示例·未逐国核验', render: boxCell },
    { key: 'note', label: '备注', cls: 'l', tdCls: () => 'edit-c', render: noteInput },
    { key: 'dom', label: '国内现货', sub: '共享池·引用', render: l => V(P(l.pid).domestic.avail, { keepZero: true }) },
    { key: 'enough', label: '国内够发', sub: '国库充盈 · 源值', cls: 'c', render: l => esc(l.domesticEnough) },
    { key: 'avg4', label: '近4周均销', sub: (cfg.src.avg.split('/')[1] || '').trim() + ' · 源值', sort: true, render: l => V(l.avg4, { keepZero: true }) },
    { key: 'td', label: '运输提前期', sub: 'D1 · 示例参数', render: () => `${cfg.transitDays} 天` },
    { key: 'sea', label: '运输期末库存', sub: esc(cfg.src.sea) + ' · 源值', render: l => V(l.seaEnd, { keepZero: true }) },
    { key: 'hx', label: '补货后可售天数', sub: cc === 'US' ? 'HX=(HS+HT)/(HO/7)' : '原公式待接入', render: l => { const d = daysAfterOf(l.lid); if (d.why && d.v !== 'PENDING') return tag('warn', d.why, 'warn'); return `<span data-derived="hx-${l.lid}">${d.v === 'PENDING' ? V('PENDING') : fmt1(d.v)}</span>`; } },
    { key: 'me', label: '未来月末剩余', sub: esc(cfg.src.monthEnd) + ' · 源值', cls: 'l', render: l => l.monthEnd.map(x => fmt(x)).join(' / ') },
    { key: 'med', label: '月底可售天数', sub: esc(cfg.src.days) + ' · 源值', cls: 'l', render: l => l.monthEndDays.map(x => x == null ? '—' : fmt(x)).join(' / ') },
    { key: 'sug', label: '建议', sub: '源值·不新增算法', cls: 'l', render: l => l.suggest ? esc(l.suggest) : V(null) },
    { key: 'st', label: '状态', cls: 'l', render: statusCell },
  ];
  return `<div class="note">${icon('info')} 只有 US 的箱数（J=HT/I）与补货后可售天数（HX=(HS+HT)/(HO/7)）按局部已证公式实时示例计算，不做整箱向上取整。其他国家与月末/月底字段显示源值或“待接入”，不套用通用算法。填写发货量只改计划，不改 FBA、国内库存或实际在途。</div>` + table(`tbl-${cc}-plan`, cols, rows, { sort: c.sort, sortKey: 'country' }) + legendRow(['edit']);
}
function noteInput(l) { const p = planOf(l.lid); if (!p) return V(null); const dis = !canEdit(); return `<input class="ein wide ${isDirtyPlan(l.lid) && p.note !== S.plansSaved[l.lid].note ? 'dirty' : ''}" id="note-${l.lid}" data-in="note" data-lid="${l.lid}" value="${esc(p.note)}" ${dis ? 'disabled title="只读（演示权限）"' : ''} aria-label="${esc(l.sku)} 备注" placeholder="备注">`; }

const BSTATUS = { created: ['info', '新建待发（申报量）'], shipped: ['mute', '已发货·未接收'], receiving: ['warn', '接收中'], closed: ['ok', '接收完成'] };
function batchView(cc, c) {
  const bs = batchesOf(cc); const sel = selOf(cc); const lsts = listingsOf(cc);
  if (!bs.length) return `<div class="empty"><h3>本国没有批次记录</h3></div>`;
  const chips = bs.map(b => {
    const on = isSelected(b); const st = BSTATUS[b.status];
    const remind = b.lines.some(ln => ln.received != null && ln.current !== 0);
    return `<div class="metric" style="min-width:210px;flex:0 1 240px">
      <div class="row"><b class="mono">${esc(b.label)}</b>${b.kind === 'SY' ? tag('line', '海外仓 SY') : ''}<span class="mono small muted">${b.bizDate}</span><span class="spacer"></span>${tag(st[0], st[1])}</div>
      <div class="small muted" style="margin:4px 0">${b.ships.length} 个货件 · 创建 ${b.ships.map(s => s.created.slice(5)).join(', ')}${remind ? ' · ' + tag('warn', '接收差异提醒', 'warn') : ''}${b.evidence ? '' : ' · ' + tag('bad', '无原发货依据', 'warn')}</div>
      <div class="row"><label class="chk"><input type="checkbox" id="bs-${b.bid}" data-in="bsel" data-bid="${b.bid}" ${on && sel != null ? 'checked' : ''} ${!canEdit() ? 'disabled' : ''}> 计入在途</label><span class="spacer"></span><button class="btn sm" data-act="batch" data-bid="${b.bid}">批次详情</button></div>
    </div>`;
  }).join('');
  const lines = lsts.filter(l => bs.some(b => b.lines.some(x => x.lid === l.lid)));
  const cols = [
    { key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: l => skuCell(l) }, { key: 'msku', label: 'MSKU', fz: 2, cls: 'l mono', render: l => esc(l.msku) },
    ...bs.map(b => ({ key: b.bid, label: `${b.label}`, sub: (b.kind === 'SY' ? '海外仓SY · ' : '') + `${isSelected(b) ? (sel == null ? '原范围' : '✓ 计入') : '未计入'} · 当前值/原量`, cls: isSelected(b) ? '' : 'batch-off', tdCls: () => isSelected(b) ? '' : 'batch-off', render: l => { const ln = b.lines.find(x => x.lid === l.lid); if (!ln) return ''; const rem = ln.received != null && ln.current !== 0; return `${V(ln.current, { keepZero: true, signed: false })}${rem ? ' <span title="已开始接收且差异非0" aria-label="差异提醒">⚑</span>' : ''}<span class="tiny muted"> ／${fmt(ln.declared)}</span>`; } })),
    { key: 'sum', label: '当前在途合计', sub: sel == null ? '保留原范围' : `所选 ${sel.length} 批`, render: l => `<b>${V(transitOf(l.lid), { keepZero: true })}</b>` },
  ];
  const tot = lines.reduce((a, l) => a + transitOf(l.lid), 0);
  return `<div class="panel-b">
    <div class="row" style="margin-bottom:8px"><b>批次（按业务归属日期）</b><span class="muted small">各国独立选择计入在途的批次，不限最近五批；取消选择不删除批次与原发货历史。</span><span class="spacer"></span>
      <button class="btn sm" data-act="bselall" data-cc="${cc}" ${!canEdit() ? 'disabled' : ''}>全选</button><button class="btn sm" data-act="bselnone" data-cc="${cc}" ${!canEdit() ? 'disabled' : ''}>明确空选</button>${sel == null ? '' : `<button class="btn sm" data-act="bselorig" data-cc="${cc}" ${!canEdit() ? 'disabled' : ''}>恢复原范围</button>`}</div>
    ${sel == null ? `<div class="callout info" style="margin-bottom:8px">${icon('info')}<div>本次未上传 ${cc} 货件文件：在途保留原组成与原周期（全部 ${bs.length} 批）。勾选任一批次即切换为“本次明确选择”。</div></div>` : ''}
    ${sel != null && sel.length === 0 ? `<div class="callout warn" style="margin-bottom:8px">${icon('warn')}<div><b>已明确空选：</b>本国当前在途 = 0。这是有意选择，不是缺数据；批次与原发货历史仍保留。</div></div>` : ''}
    <div class="row" style="align-items:stretch">${chips}</div>
    <div class="row small" style="margin-top:8px"><span>本国当前在途合计（所选批次，所有 Listing）：<b class="num">${fmt(tot)}</b></span><span class="muted">原发货量只作历史，不再计入；单元格“当前值／原量”，负数=多收。</span></div>
  </div>` + table(`tbl-${cc}-batch`, cols, lines);
}
function batchModal(bid) {
  const b = D.BATCHES.find(x => x.bid === bid); const st = BSTATUS[b.status];
  const rows = b.lines.map(ln => { const l = L(ln.lid); const sh = b.ships.find(s => s.shipId === ln.shipId); return { ln, l, sh }; });
  const cols = [
    { key: 'ship', label: '货件单号', cls: 'l mono', render: r => esc(r.ln.shipId) },
    { key: 'sku', label: 'SKU', cls: 'l', render: r => `<button class="sku-btn" data-act="sku" data-pid="${r.l.pid}" data-cc="${r.l.country}" data-lid="${r.l.lid}">${esc(r.l.sku)}</button>` },
    { key: 'asin', label: 'ASIN / MSKU', cls: 'l mono', render: r => `${esc(r.l.asin)} · ${esc(r.l.msku)}` },
    { key: 'cr', label: '创建日', cls: 'c', render: r => r.sh.created }, { key: 'sp', label: '实际发货日', cls: 'c', render: r => r.sh.shipped || V(null, { nullText: '未发货' }) },
    { key: 'dec', label: '原申报/原发货量', sub: '归档·不再计入', render: r => V(r.ln.declared) },
    { key: 'rec', label: '已接收', render: r => r.ln.writtenOff ? tag('mute', '完整快照未列出') : (r.ln.received == null ? V(null, { nullText: '未开始' }) : V(r.ln.received, { keepZero: true })) },
    { key: 'df', label: '差异口径', cls: 'l', render: r => r.ln.received == null && !r.ln.writtenOff && r.ln.diffField !== '收发差异' ? '<span class="muted">未开始接收：当前值=申报</span>' : r.ln.diffField === '收发差异' ? `ERP收发差异 ${r.ln.diffRaw > 0 ? '+' : ''}${r.ln.diffRaw} → 反号写入` : r.ln.writtenOff ? '按契约核销为0' : '接收差异（少收正、多收负）' },
    { key: 'cur', label: '当前值', sub: '带符号', render: r => `<b>${V(r.ln.current, { keepZero: true })}</b>` },
    { key: 'rm', label: '提醒', cls: 'c', render: r => r.ln.received != null && r.ln.current !== 0 ? tag(r.ln.current < 0 ? 'bad' : 'warn', r.ln.current < 0 ? '多收' : '少收', 'warn') : '' },
    { key: 'src', label: '来源', cls: 'l', render: r => `<span class="mono small">货件详情 · 第${r.ln.srcRow}行</span>` },
  ];
  modal(`<div class="modal-h"><h2>${esc(b.country)} · 批次 ${esc(b.label)}</h2>${b.kind === 'SY' ? tag('line', '海外仓 SY') : ''}${tag(st[0], st[1])}<span class="spacer"></span><button class="icon-btn" data-act="close" aria-label="关闭">${icon('close')}</button></div>
    <div class="modal-b stack">
      <dl class="kv"><dt>业务批次日期</dt><dd>${b.bizDate}（人工指定，不等于创建日或实际发货日）</dd><dt>货件</dt><dd>${b.ships.map(s => `<span class="mono">${s.shipId}</span>（创建 ${s.created}${s.shipped ? '，发货 ' + s.shipped : '，未 SHIPPED'}）`).join('；')}</dd><dt>计入在途</dt><dd>${isSelected(b) ? (selOf(b.country) == null ? '是（保留原范围）' : '是（本次选择）') : '否（批次与原量历史仍保留）'}</dd><dt>原发货依据</dt><dd>${b.evidence ? '有：同国同批次原量记录' : tag('bad', '无：只有日期表头，接收快照整批跳过', 'warn')}</dd>${b.note ? `<dt>说明</dt><dd>${esc(b.note)}</dd>` : ''}</dl>
      ${table('tbl-batch-modal', cols, rows, { wrapCls: 'auto-h' })}
      <div class="callout info">${icon('info')}<div>示例：原量 100 收 96 → 当前 4；收 104 → 当前 −4；收 100 → 当前 0（底层仍为0）。正负不取绝对值，不与原发货量重复计入。接收差异使用完整批次快照，不按创建时间截取。</div></div>
    </div><div class="modal-f"><button class="btn" data-act="close">关闭</button></div>`, 'wide');
}
function awdModal(lid) {
  const l = L(lid);
  modal(`<div class="modal-h"><h2>US AWD 组成 · ${esc(l.sku)}</h2>${DEMO_TAG}<span class="spacer"></span><button class="icon-btn" data-act="close" aria-label="关闭">${icon('close')}</button></div>
  <div class="modal-b"><dl class="kv"><dt>Available</dt><dd>${fmt(l.awd.available)}</dd><dt>Reserved</dt><dd>${fmt(l.awd.reserved)}</dd><dt>Outbound to FBA</dt><dd>${fmt(l.awd.outbound)}</dd><dt>AWD 合计（AG）</dt><dd><b>${fmt(l.awd.available + l.awd.reserved + l.awd.outbound)}</b></dd><dt>海外仓（AH，另列）</dt><dd>${fmt(l.overseas)}</dd><dt>U列源值</dt><dd>${fmt(l.awdOverseasSrc)}</dd><dt>AWD 来源日期</dt><dd>${S.freshness.find(f => f.key === 'awd').date} ${S.freshness.find(f => f.key === 'awd').state === 'stale' ? tag('warn', '沿用旧周期') : ''}</dd></dl>
  <p class="small muted" style="margin-top:10px">AWD = 可用 + 预留 + 转往FBA；不只取 Available，也不用 AWD 代替全部海外仓。空文件或缺字段不是库存为0的证据。</p></div><div class="modal-f"><button class="btn" data-act="close">关闭</button></div>`);
}
