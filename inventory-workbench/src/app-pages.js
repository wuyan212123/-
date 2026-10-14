/* ========== 运营人员视图 ========== */
PAGES.people = function () {
  const st = S.people; const persons = [...D.OWNERS, '__none'];
  const match = (l, person = st.person, cc = st.country) => (person === 'ALL' || (person === '__none' ? !l.owner : l.owner === person)) && (cc === 'ALL' || l.country === cc);
  const statusOk = l => st.status === 'all' || (st.status === 'plan' && planQty(l.lid) > 0) || (st.status === 'issue' && (issuesOfL(l.lid).length || ['zeroden', 'outgroup', 'referr'].includes(l.variant.kind))) || (st.status === 'transit' && transitOf(l.lid) > 0);
  let rows = D.LISTINGS.filter(l => match(l) && statusOk(l));
  const pages = Math.max(1, Math.ceil(rows.length / st.size)); if (st.page > pages) st.page = pages;
  const skus = [...new Set(rows.map(l => l.pid))];
  const domOnce = sumNums(skus.map(pid => P(pid).domestic.avail));
  const pname = x => x === '__none' ? '未分配' : x === 'ALL' ? '全部人员' : x;
  const matrix = `<div class="tbl-wrap auto-h" id="tbl-pm"><table class="t"><thead><tr><th class="l fz1" style="min-width:110px">人员 \\ 国家</th>${D.COUNTRIES.map(c => `<th class="c" title="${esc(c.ownerField)}">${c.code}<span class="th-sub">${esc(c.ownerField)}</span></th>`).join('')}<th>合计</th></tr></thead><tbody>${persons.map(pp => `<tr><td class="l fz1 last"><b>${pname(pp)}</b></td>${D.COUNTRIES.map(c => { const n = D.LISTINGS.filter(l => match(l, pp, c.code)).length; return `<td class="c ${st.person === pp && st.country === c.code ? 'hl' : ''}">${n ? `<button class="link" data-act="pcell" data-p="${pp}" data-c="${c.code}" aria-label="${pname(pp)} ${c.code} ${n} 条">${n}</button>` : '<span class="na">0</span>'}</td>`; }).join('')}<td class="sum-c">${D.LISTINGS.filter(l => match(l, pp, 'ALL')).length}</td></tr>`).join('')}</tbody></table></div>`;
  const cols = [
    { key: 'cc', label: '国家', cls: 'l fz1', render: l => `<b>${l.country}</b>` },
    { key: 'sku', label: 'SKU', cls: 'l', render: l => skuCell(l, listCtx(rows)) },
    { key: 'name', label: '品名', cls: 'l', render: nameCell }, { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
    { key: 'own', label: '负责人（原字段）', cls: 'l', render: l => `${ownerHtml(l)} <span class="tiny muted">${esc(ownerFieldOf(l.country))}</span>${l.country === 'EU' ? ' ' + tag('line', '发货角色') : ''}` },
    { key: 'fba', label: 'FBA可售', render: l => V(l.fba) }, { key: 'tr', label: '当前在途', render: l => V(transitOf(l.lid), { keepZero: true }) },
    { key: 'plan', label: '本次计划', tdCls: l => planOf(l.lid) ? 'edit-c' : '', render: l => planOf(l.lid) ? editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.country} ${l.sku} 本次计划` }) : V(null, { nullText: '原表未设' }) },
    { key: 'st', label: '状态', cls: 'l', render: statusCell },
  ];
  return `<div class="page-h"><div class="grow"><h1>运营人员视图</h1><div class="sub">归属按国家/Listing 记录保存原字段与角色。按人员筛选只是查询条件（如“运营甲的商品”），不代表登录身份，也不是访问权限。</div></div>${DEMO_TAG}</div>
  <div class="grid2" style="grid-template-columns:minmax(0,220px) minmax(0,1fr)">
    <div class="panel" style="align-self:start"><div class="panel-h"><h3>人员</h3></div><div class="panel-b people-list">${['ALL', ...persons].map(pp => `<button aria-pressed="${st.person === pp}" data-act="person" data-v="${pp}"><span>${pp === '__none' ? tag('warn', '未分配', 'warn') : pname(pp)}</span><span class="small muted">${D.LISTINGS.filter(l => match(l, pp, 'ALL')).length}</span></button>`).join('')}</div></div>
    <div class="stack" style="min-width:0">
      <div class="panel"><div class="panel-h"><h3>人员 × 国家</h3><span class="hint">点击数字组合筛选；同 SKU 不同国家可分属不同运营</span></div>${matrix}</div>
      <div class="panel">
        <div class="filters">${seg([{ id: 'ALL', label: '全部国家' }, ...D.COUNTRIES.map(c => ({ id: c.code, label: c.code }))], st.country, 'pcountry')}
          ${seg([{ id: 'all', label: '全部状态' }, { id: 'plan', label: '有本次计划' }, { id: 'transit', label: '在途>0' }, { id: 'issue', label: '待核对' }], st.status, 'pstatus')}</div>
        <div class="filters small" style="padding-top:0"><span><b>当前筛选</b>：${rows.length} 条 Listing · ${skus.length} 个 SKU</span><span class="muted">FBA 小计 ${fmt(sumNums(rows.map(l => l.fba)))}</span><span class="muted">本次计划小计 ${fmt(sumNums(rows.map(l => planQty(l.lid))))}</span><span class="muted" title="国内库存是SKU共享池：按SKU去重只计一次">国内现货（按SKU去重计一次）${fmt(domOnce)}</span></div>
        ${table('tbl-people', cols, paginate(rows, st.page, st.size), { emptyTitle: '该组合下没有记录', emptyText: '换一个人员或国家，或清空状态筛选。' })}
        ${pager('people', rows.length, st.page, st.size)}
      </div>
    </div>
  </div>`;
};

/* ========== 全局搜索 ========== */
function scoreField(q, qn, val, field) {
  const vn = norm(val); if (!vn || !qn) return 0;
  if (vn === qn) return field === 'SKU' ? 100 : 95;
  if (vn.startsWith(qn)) return 60;
  if (vn.includes(qn)) return 40;
  if (field === '品名' && String(val).includes(q.trim())) return 30;
  return 0;
}
function searchProducts(q, o = {}) {
  const qn = norm(q); if (!qn) return [];
  const res = [];
  D.PRODUCTS.forEach(p => {
    let best = 0; const hits = new Set(); const lids = [];
    listingsOfP(p.pid).forEach(l => {
      if (o.country && o.country !== 'ALL' && l.country !== o.country) return;
      if (o.owner && o.owner !== 'ALL' && (o.owner === '__none' ? l.owner : l.owner !== o.owner)) return;
      let lb = 0;
      [['SKU', l.sku], ['品名', p.name], ['ASIN', l.asin], ['MSKU', l.msku]].forEach(([f, v]) => { const s = scoreField(q, qn, v, f); if (s) { hits.add(f); lb = Math.max(lb, s); } });
      if (lb) { lids.push(l.lid); best = Math.max(best, lb); }
    });
    if (best) res.push({ p, score: best, hits: [...hits], lids });
  });
  return res.sort((a, b) => b.score - a.score || a.p.sku.localeCompare(b.p.sku));
}
function markHit(text, q) { const t = String(text); if (!q) return esc(t); const qn = norm(q); const i = t.toLowerCase().indexOf(q.toLowerCase().trim()); if (i >= 0 && q.trim()) return esc(t.slice(0, i)) + `<mark class="mark">${esc(t.slice(i, i + q.trim().length))}</mark>` + esc(t.slice(i + q.trim().length)); if (norm(t).includes(qn)) return `<mark class="mark">${esc(t)}</mark>`; return esc(t); }
PAGES.search = function () {
  const st = S.search;
  let results = [], missing = [];
  if (st.mode === 'multi') {
    const keys = st.multi.split(/[\s,，;；]+/).map(x => x.trim()).filter(Boolean);
    keys.forEach(k => { const r = searchProducts(k, st).filter(x => x.score >= 95); if (r.length) r.forEach(x => { if (!results.some(y => y.p.pid === x.p.pid)) results.push(Object.assign({ key: k }, x)); }); else missing.push(k); });
  } else results = searchProducts(st.q, st);
  const pages = Math.max(1, Math.ceil(results.length / st.size)); if (st.page > pages) st.page = pages;
  const pr = paginate(results, st.page, st.size);
  const q = st.mode === 'multi' ? '' : st.q;
  const owners = [...D.OWNERS];
  const list = results.map(r => r.p.pid).join(',');
  const rowsHtml = pr.map(r => {
    const ls = r.lids.map(L);
    return `<tr><td class="l fz1"><button class="sku-btn" data-act="sku" data-pid="${r.p.pid}" data-cc="${st.country !== 'ALL' ? st.country : ls[0].country}" data-lid="${ls[0].lid}" data-list="${list}">${markHit(r.p.sku, q)}</button></td>
      <td class="l"><span class="cell-name" title="${esc(r.p.name)}">${markHit(r.p.name, q)}</span></td>
      <td class="l">${r.hits.map(h => tag(r.score >= 95 && h !== '品名' ? 'info' : 'line', '命中 ' + h)).join(' ')}${r.score >= 95 ? ' ' + tag('ok', '精确') : ''}</td>
      <td class="c">${ls.length}${listingsOfP(r.p.pid).length > ls.length ? `<span class="tiny muted">/${listingsOfP(r.p.pid).length}</span>` : ''}</td>
      <td class="l wrap">${ls.map(l => `<button class="link small" data-act="sku" data-pid="${l.pid}" data-cc="${l.country}" data-lid="${l.lid}" data-list="${list}"><b>${l.country}</b> · ${esc(l.owner || '未分配')} · <span class="mono">${markHit(l.asin, q)} / ${markHit(l.msku, q)}</span></button>`).join('<br>')}</td></tr>`;
  }).join('');
  const searched = st.mode === 'multi' ? st.multi.trim() : st.q.trim();
  return `<div class="page-h"><div class="grow"><h1>全局搜索</h1><div class="sub">搜索 SKU / 品名 / ASIN / MSKU；部分匹配，精确标识优先；忽略大小写与常见分隔符（只用于候选匹配，不改业务主键）。</div></div>${DEMO_TAG}</div>
  <div class="panel">
    <div class="filters">${seg([{ id: 'text', label: '关键词' }, { id: 'multi', label: '多个 SKU 粘贴' }], st.mode, 'smode')}
      ${st.mode === 'text' ? `<input class="inp" id="sq" data-in="sq" value="${esc(st.q)}" placeholder="如 cup500、B0DEMO1001、US-CUP500BK-FBA、保温杯" style="flex:1 1 260px;min-width:0" aria-label="搜索关键词">` : `<textarea class="inp" id="smulti" data-in="smulti" rows="3" style="flex:1 1 260px;min-width:0" placeholder="每行或用逗号分隔一个 SKU，例如：\nDEMO-CUP-500BK\nDEMO-PET-2L" aria-label="多个SKU">${esc(st.multi)}</textarea><button class="btn primary" data-act="smultigo">查找</button>`}
      <label class="grp">国家 <select class="sel" id="sc" data-in="scountry" aria-label="国家"><option value="ALL">全部</option>${D.COUNTRIES.map(c => `<option ${st.country === c.code ? 'selected' : ''} value="${c.code}">${c.code}</option>`).join('')}</select></label>
      <label class="grp">负责人 <select class="sel" id="so" data-in="sowner" aria-label="负责人"><option value="ALL">全部</option>${owners.map(o => `<option ${st.owner === o ? 'selected' : ''}>${o}</option>`).join('')}<option value="__none" ${st.owner === '__none' ? 'selected' : ''}>未分配</option></select></label>
    </div>
    <div class="note">条件共同生效：关键词 ∧ 国家 ∧ 负责人。清空某一条件时其他条件保持。${searched ? `结果 <b>${results.length}</b> 个 SKU。` : ''}
      ${st.q || st.multi ? `<button class="btn sm" data-act="sclearq">清空关键词</button>` : ''}${st.country !== 'ALL' || st.owner !== 'ALL' ? `<button class="btn sm" data-act="sclearf">清空国家/负责人</button>` : ''}</div>
    ${missing.length ? `<div class="filters" style="padding-top:0"><div class="callout warn" style="flex:1">${icon('warn')}<div>未找到 ${missing.length} 个：${missing.map(esc).join('、')}（在当前国家/负责人条件下没有精确匹配）</div></div></div>` : ''}
    ${!searched ? `<div class="empty"><h3>输入关键词开始搜索</h3><div>也可在顶部工具栏随时按 <kbd>/</kbd> 搜索。试试：<button class="link" data-act="try" data-q="cup500">cup500</button> · <button class="link" data-act="try" data-q="B0DEMO1001">B0DEMO1001</button> · <button class="link" data-act="try" data-q="保温杯">保温杯</button> · <button class="link" data-act="try" data-q="US-LINTRMV-FBA">US-LINTRMV-FBA</button></div></div>` :
      results.length ? `<div class="tbl-wrap" id="tbl-search" style="--fz1w:160px"><table class="t"><thead><tr><th class="l fz1" style="min-width:160px">SKU</th><th class="l">品名</th><th class="l">命中字段</th><th class="c">Listing 数</th><th class="l">国家 · 负责人 · ASIN / MSKU</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>${pager('search', results.length, st.page, st.size, [8, 12, 25])}` :
      `<div class="empty"><h3>没有找到“${esc(searched)}”</h3><div>当前条件：国家 ${st.country === 'ALL' ? '全部' : st.country} · 负责人 ${st.owner === 'ALL' ? '全部' : st.owner === '__none' ? '未分配' : st.owner}。<button class="link" data-act="sclearf">清空国家/负责人</button> 或 <button class="link" data-act="sclearq">清空关键词</button>。</div></div>`}
  </div>`;
};

/* ========== 总销量 ========== */
PAGES.total = function () {
  const st = S.total; const qn = norm(st.q);
  let ps = D.PRODUCTS.filter(p => (!qn || [p.sku, p.name].some(x => norm(x).includes(qn))) && (st.owner === 'ALL' || p.totalOwner === st.owner));
  const pages = Math.max(1, Math.ceil(ps.length / st.size)); if (st.page > pages) st.page = pages;
  const pr = paginate(ps, st.page, st.size); const list = ps.map(p => p.pid).join(',');
  const skuB = p => `<button class="sku-btn" data-act="sku" data-pid="${p.pid}" data-list="${list}">${esc(p.sku)}</button>`;
  let body = '';
  if (st.tab === 'month') {
    body = monthMatrix('tbl-total-month', pr.map(p => ({ c1: skuB(p), c2: `<span class="cell-name">${esc(p.name)}</span>`, rows: yearRowsForProduct(p) })), { hlKey: 'tm', c2: '品名' });
  } else if (st.tab === 'stock') {
    const cols = [
      { key: 'sku', label: '领星SKU', sub: 'H', fz: 1, cls: 'l', render: skuB }, { key: 'own', label: '负责人', sub: 'J · 总销量原字段', cls: 'l', render: p => esc(p.totalOwner) },
      { key: 'pk', label: '装率', sub: 'I', render: p => p.packRate ? V(p.packRate) : tag('warn', '缺装率') },
      { key: 'bl', label: '国内可调拨', sub: 'BL', render: p => V(domesticOf(p.pid).transfer, { keepZero: true }) }, { key: 'bm', label: '国内现货', sub: 'BM', render: p => V(p.domestic.avail, { keepZero: true }) },
      { key: 'bn', label: '国内采购在途', sub: 'BN · 仅展示', render: p => V(p.domestic.pending, { keepZero: true }) },
      { key: 'bo', label: 'FBA总库存', sub: 'BO · 覆盖待核验', render: p => `${V(sumNums(listingsOfP(p.pid).filter(l => D.FIVE.includes(l.country)).map(l => l.fba)))} <span class="tiny muted">示例</span>` },
      { key: 'bp', label: '国内总库存', sub: 'BP', render: p => V(p.domestic.avail + p.domestic.pending + domesticOf(p.pid).transfer) },
      { key: 'bq', label: 'AVG', sub: 'BQ · 前3个完整月×权重', render: p => `${V(p.avg3)}` , title: '按已确认规则：前3个完整月（2026-07/08/09）平均 × 原权重；不是最近30天平均' },
      { key: 'br', label: '权重', sub: 'BR', render: p => p.weight.toFixed(2) }, { key: 'bs', label: '库转周期', sub: 'BS · 源值', render: p => `${p.turnover} 天` },
      { key: 'iv', label: '库存货值', sub: 'BT:CI · 原值回查', render: p => V(p.invValue) }, { key: 'av', label: '国内库龄货值', sub: '原值回查', render: p => V(p.agingValue) },
      { key: 'cost', label: '采购价', sub: '原表回查', cls: 'l', render: () => '<span class="na">演示不提供</span>' },
      { key: 'ck', label: '采购量 / 备注', sub: 'CK/CL · 外部采购程序', cls: 'excluded l', tdCls: () => 'excluded', render: () => '<span class="na">只读回查·本轮不操作</span>' },
    ];
    body = table('tbl-total-stock', cols, pr) + `<div class="note">AVG 已确认规则：前 3 个完整月平均 × 原权重滚动（基准日 ${S.baseDate} → 取 2026-07/08/09），不是“最近30天平均”。货值/成本保持原值回查，本轮不新增金额重算或采购操作。</div>`;
  } else if (st.tab === 'blocks') {
    const blk = st.blk;
    const heads = blk === 'saved' ? D.HALF15 : D.HALF;
    const cols = [
      { key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: skuB },
      ...heads.map((h, k) => ({ key: 'b' + k, label: h.label, cls: blk === 'gap' ? 'excluded' : '', tdCls: () => blk === 'gap' ? 'excluded' : '', render: p => {
        if (blk === 'gap') return V(p.netGap[k]);
        if (blk === 'saved') return V(p.saved15[k], { nullText: '未设置' });
        if (k < 6) return V('EMPTY');
        return V(sumNums(listingsOfP(p.pid).filter(l => l.half).map(l => S.half[l.lid][k])));
      } })),
    ];
    const desc = { forecast: 'DL:EE · 20期国家半月计划汇总：DL:DQ 旧期源表为空（显示“空”，不补0）；DR:EE 依源公式描述按 SKU 汇总 US/CA/EU/UK/AU 同名半月字段（演示实时汇总）。', saved: 'EG:EU · 另 15 期保存预测（至 2027年2月上）：保存数值，不宣称机器预测，不与 20 期汇总合并。', gap: 'CR:DK · 20期净缺口：采购计算关联区，本轮排除；只保留源值以便回查，不重算、不生成采购建议。' }[blk];
    body = `<div class="filters" style="padding-top:0">${seg([{ id: 'forecast', label: 'DL:EE 预测汇总 · 20期' }, { id: 'saved', label: 'EG:EU 保存预测 · 15期' }, { id: 'gap', label: 'CR:DK 净缺口 · 回查' }], blk, 'tblk')}</div><div class="note">${icon('info')} ${desc} CR:DK 与 DL:EE 相邻、标题日期重复，但不是一组 40 期。</div>` + table('tbl-total-blk', cols, pr) + (blk === 'gap' ? legendRow(['ex']) : '');
  } else {
    const cols = [{ key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: skuB }, { key: 'g', label: '原分组', cls: 'l', render: p => p.group || '—' }, { key: 'k', label: '变体比例', sub: 'K列', cls: 'l', render: p => variantHtml(p.variant) }, { key: 'dep', label: '依赖', cls: 'l wrap', render: p => p.variant.kind === 'formula' ? `2025年合计 ${fmt(p.variant.num)} ÷ 组合计 ${fmt(p.variant.den)}（引用年度待核验）` : '独立商品 100%' }];
    body = table('tbl-total-var', cols, pr);
  }
  return `<div class="page-h"><div class="grow"><h1>总销量</h1><div class="sub">跨国 SKU 销量、库存周转与右侧计划区块。月历史从 2023 年起，年份为行。</div></div>${DEMO_TAG}</div>
  <div class="callout warn" style="margin-bottom:12px">${icon('warn')}<div>总销量各历史指标实际汇总了哪些国家/Listing 尚待逐公式核验：不套用总库存的五国口径，也不宣称七国全量。演示月销量为独立虚构值，不由国家页加总。</div></div>
  <div class="panel"><div class="panel-h">${seg([{ id: 'month', label: '月历史 2023—2026' }, { id: 'stock', label: '库存·周转·货值' }, { id: 'blocks', label: '右侧计划区块' }, { id: 'var', label: '变体比例 K' }], st.tab, 'ttab')}<span class="spacer"></span>
    <input class="inp" id="tq" data-in="tq" value="${esc(st.q)}" placeholder="筛选 SKU / 品名" aria-label="筛选SKU" style="width:180px">
    <label class="grp small">负责人(J) <select class="sel" id="to" data-in="towner" aria-label="总销量负责人"><option value="ALL">全部</option>${D.OWNERS.map(o => `<option ${st.owner === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label></div>
    ${body}${pager('total', ps.length, st.page, st.size, [8, 12, 25])}</div>`;
};

/* ========== 库存汇总 ========== */
PAGES.stock = function () {
  const st = S.stock; let body = '';
  const skuB = p => `<button class="sku-btn" data-act="sku" data-pid="${p.pid}">${esc(p.sku)}</button>`;
  if (st.tab === 'total') {
    const fbaOf = (p, cc) => { const ls = listingsOfP(p.pid).filter(l => l.country === cc); return ls.length ? sumNums(ls.map(l => l.fba)) : null; };
    const trOf = (p, cc) => { const ls = listingsOfP(p.pid).filter(l => l.country === cc); return ls.length ? sumNums(ls.map(l => transitOf(l.lid))) : null; };
    const awd = p => sumNums(listingsOfP(p.pid).filter(l => l.country === 'US').map(l => l.awd.available + l.awd.reserved + l.awd.outbound));
    const cols = [{ key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: skuB },
      ...D.FIVE.map(cc => ({ key: 'f' + cc, label: cc + ' FBA', sub: 'E:I', render: p => V(fbaOf(p, cc), { nullText: '无记录' }) })),
      ...D.FIVE.map(cc => ({ key: 't' + cc, label: cc + ' 在途', sub: 'J:N · 所选批次', render: p => V(trOf(p, cc), { nullText: '无记录', keepZero: true }) })),
      { key: 'o', label: 'FBA总库存', sub: 'O', render: p => fmt(sumNums(D.FIVE.map(cc => fbaOf(p, cc)))) },
      { key: 'p', label: 'US AWD', sub: 'P · 另列', render: p => V(awd(p), { keepZero: true }) },
      { key: 'q', label: '总库存', sub: 'Q · 五国+US AWD', render: p => `<b>${fmt(sumNums(D.FIVE.map(cc => fbaOf(p, cc))) + sumNums(D.FIVE.map(cc => trOf(p, cc))) + awd(p))}</b>` }];
    const aeSa = D.LISTINGS.filter(l => !D.CMAP[l.country].inTotalStock);
    const c2 = [{ key: 'cc', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'sku', label: 'SKU', cls: 'l', render: l => skuCell(l) }, { key: 'm', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) }, { key: 'f', label: 'FBA', render: l => V(l.fba) }, { key: 't', label: '当前在途', render: l => V(transitOf(l.lid), { keepZero: true }) }];
    body = `<div class="panel-b"><div class="callout info">${icon('info')}<div>原“总库存”口径只汇总 <b>US/CA/AU/EU/UK</b> 五国 FBA 与在途，<b>US AWD 另列</b>；不是七国全量。AE/SA 在下方及各自国家页、SKU 详情中可查，未经授权不并入。国内共享库存不在本表重复相加。</div></div></div>${table('tbl-stock-total', cols, D.PRODUCTS)}
      <div class="panel-h"><h3>AE / SA 自身库存（不在原总库存）</h3></div>${table('tbl-stock-aesa', c2, aeSa, { wrapCls: 'auto-h' })}`;
  } else if (st.tab === 'domestic') {
    const cols = [{ key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: skuB }, { key: 'a', label: '国内现货', sub: '亚马逊仓可用', render: p => V(p.domestic.avail, { keepZero: true }) }, { key: 'p', label: '采购在途', sub: '待到货 · 仅展示', render: p => V(p.domestic.pending, { keepZero: true }) },
      ...D.TRANSFER_WH.map(w => ({ key: w, label: w, sub: '可调拨', render: p => V(p.domestic.transfer[w], { keepZero: true }) })), { key: 's', label: '可调拨合计', render: p => `<b>${fmt(domesticOf(p.pid).transfer)}</b>` }];
    const rawCols = [{ key: 'sku', label: 'SKU', cls: 'l mono', render: r => esc(r.sku) }, { key: 'd', label: '产品标签/部门', cls: 'l', render: r => esc(r.dept) }, { key: 'w', label: '仓库', cls: 'l', render: r => esc(r.wh) }, { key: 'a', label: '可用量', render: r => V(r.avail, { keepZero: true }) }, { key: 'p', label: '待到货', render: r => V(r.pending, { keepZero: true }) }, { key: 'u', label: '业务统计', cls: 'l', render: r => r.dept !== '亚马逊二部' ? tag('mute', '不纳入：非亚马逊二部') : (r.wh === '亚马逊仓' ? tag('ok', '现货/采购在途') : D.TRANSFER_WH.includes(r.wh) ? tag('info', '可调拨白名单') : tag('mute', '不纳入：非白名单仓')) }];
    const tot = sumNums(D.PRODUCTS.map(p => p.domestic.avail));
    body = `<div class="panel-b"><div class="row small"><span>国内现货合计（每SKU计一次）<b class="num">${fmt(tot)}</b></span><span class="muted">可调拨白名单：${D.TRANSFER_WH.join('、')}（精确仓库名）。采购在途只展示，不据此生成采购计算。</span></div></div>${table('tbl-stock-dom', cols, D.PRODUCTS)}<div class="panel-h"><h3>国内库存原始明细（全部部门保留）</h3><span class="hint">${D.DOMESTIC_RAW.length} 行</span></div>${table('tbl-stock-domraw', rawCols, D.DOMESTIC_RAW)}`;
  } else if (st.tab === 'fba') {
    const cols = [{ key: 'cc', label: '业务国家', cls: 'l', render: r => `<b>${L(r.lid).country}</b>` }, { key: 'site', label: 'ERP站点', cls: 'l', render: r => esc(r.site) }, { key: 'phy', label: '物理库存池', cls: 'l', render: r => esc(r.physical) }, { key: 'sku', label: 'SKU', cls: 'l', render: r => skuCell(L(r.lid)) }, { key: 'asin', label: 'ASIN', cls: 'l mono', render: r => esc(r.asin) }, { key: 'msku', label: 'MSKU', cls: 'l mono', render: r => esc(r.msku) }, { key: 'v', label: 'FBA可用库存', sub: '→ 原“FBA可售库存”', render: r => V(r.fbaAvail) }, { key: 'u', label: '采用', cls: 'l', render: r => r.used ? tag('ok', '采用') : tag('mute', 'EU池重复·不相加') }];
    body = `<div class="panel-b"><div class="callout info">${icon('info')}<div>源“FBA可用库存”（或允许的“FBA可用”别名）映射到原“FBA可售库存”；不混用实际在途、标发在途、计划入库、入库中字段。EU 共享池在 DE/FR/IT/ES 重复呈现，业务只取 DE。</div></div></div>${table('tbl-stock-fba', cols, D.FBA_RAW)}`;
  } else if (st.tab === 'aging') {
    const cols = [{ key: 'cc', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'sku', label: 'SKU', cls: 'l', render: l => skuCell(l) }, { key: 'm', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) }, { key: 'a', label: '180天以内', render: l => V(l.aging.lt180) }, { key: 'b', label: '180–365天', render: l => V(l.aging.m180_365) }, { key: 'c', label: '365天以上', render: l => V(l.aging.gt365) }, { key: 'v', label: '180+库龄货值', render: l => V(l.value180) }];
    const r = D.AGING_RAW; const mx = k => Math.max(...r.map(x => x[k])); const sm = k => sumNums(r.map(x => x[k]));
    body = `<div class="panel-b"><div class="callout warn">${icon('warn')}<div><b>重复 MSKU 示例</b>（${esc(L(r[0].lid).sku)}，ASIN ${esc(r[0].asin)}）：两行 MSKU（${r.map(x => esc(x.msku)).join('、')}）。按最大值口径：180内 ${mx('lt180')}、180–365 ${mx('m180_365')}、365+ ${mx('gt365')}；若直接累加会得到 ${sm('lt180')} / ${sm('m180_365')} / ${sm('gt365')}（错误）。</div></div></div>${table('tbl-stock-aging', cols, D.LISTINGS)}`;
  } else {
    const us = listingsOf('US');
    const cols = [{ key: 'sku', label: 'SKU', fz: 1, cls: 'l', render: l => skuCell(l) }, { key: 'm', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) }, { key: 'a', label: 'Available', render: l => V(l.awd.available, { keepZero: true }) }, { key: 'r', label: 'Reserved', render: l => V(l.awd.reserved, { keepZero: true }) }, { key: 'o', label: 'Outbound to FBA', render: l => V(l.awd.outbound, { keepZero: true }) }, { key: 's', label: 'AWD合计', sub: 'AG', render: l => `<b>${fmt(l.awd.available + l.awd.reserved + l.awd.outbound)}</b>` }, { key: 'h', label: '海外仓', sub: 'AH', render: l => V(l.overseas, { keepZero: true }) }, { key: 'u', label: 'U列源值', render: l => { const s = l.awd.available + l.awd.reserved + l.awd.outbound + l.overseas; return `${fmt(l.awdOverseasSrc)}${s !== l.awdOverseasSrc ? ' ' + tag('warn', '小计差异·待核对', 'warn') : ''}`; } }];
    const f = S.freshness.find(x => x.key === 'awd');
    body = `<div class="panel-b"><div class="callout ${f.state === 'stale' ? 'warn' : 'info'}">${icon(f.state === 'stale' ? 'warn' : 'info')}<div>AWD 来源日期 <b>${f.date}</b>${f.state === 'stale' ? '（本次未提供 AWD 文件，沿用旧周期；依赖 AWD 的总库存合计同样使用旧来源）' : ''}。AWD = Available + Reserved + Outbound to FBA；不把 AWD 代替全部海外仓。</div></div></div>${table('tbl-stock-awd', cols, us)}`;
  }
  return `<div class="page-h"><div class="grow"><h1>库存汇总</h1><div class="sub">每项合计可回到组成与来源；FBA、所选在途、AWD、海外仓、国内库存分别呈现。</div></div>${DEMO_TAG}</div>
  <div class="panel"><div class="panel-h">${seg([{ id: 'total', label: '原总库存（五国+US AWD）' }, { id: 'domestic', label: '国内库存' }, { id: 'fba', label: 'FBA · ERP导出' }, { id: 'aging', label: '库龄' }, { id: 'awd', label: 'US AWD / 海外仓' }], st.tab, 'stab')}</div>${body}</div>`;
};

/* ========== 发货计划（按 SKU 汇总各国） ========== */
PAGES.plan = function () {
  const st = S.plan; const qn = norm(st.q);
  const planCcs = D.COUNTRIES.filter(c => c.half || c.stocking).map(c => c.code);
  let ps = D.PRODUCTS.filter(p => {
    if (qn && ![p.sku, p.name].some(x => norm(x).includes(qn)) && !listingsOfP(p.pid).some(l => norm(l.msku).includes(qn) || norm(l.asin).includes(qn))) return false;
    const ls = listingsOfP(p.pid).filter(l => planOf(l.lid) && (st.country === 'ALL' || l.country === st.country));
    if (!ls.length) return false;
    if (st.onlyPlanned && !ls.some(l => planQty(l.lid) > 0)) return false;
    if (st.status !== 'all' && !ls.some(l => (st.status === 'dirty' ? isDirtyPlan(l.lid) : st.status === 'conflict' ? S.remote[l.lid] : planOf(l.lid).status === st.status))) return false;
    return true;
  });
  const list = ps.map(p => p.pid).join(',');
  const rows = ps.map(p => {
    const ls = listingsOfP(p.pid).filter(l => planOf(l.lid));
    const by = cc => { const x = ls.filter(l => l.country === cc); return x.length ? sumNums(x.map(l => planQty(l.lid))) : null; };
    const tot = sumNums(ls.map(l => planQty(l.lid)));
    const pipe = { created: 0, shipped: 0, diff: 0 }; listingsOfP(p.pid).forEach(l => batchLinesOf(l.lid).forEach(({ b, ln }) => { if (b.status === 'created') pipe.created += ln.declared; else if (b.status === 'shipped') pipe.shipped += ln.declared; else if (ln.received != null) pipe.diff += ln.current; }));
    const open = st.open[p.pid];
    const head = `<tr class="g-start"><td class="l fz1"><button class="icon-btn" style="width:24px;height:24px" data-act="popen" data-pid="${p.pid}" aria-expanded="${!!open}" aria-label="${open ? '收起' : '展开'} ${esc(p.sku)} 明细">${icon(open ? 'down' : 'right')}</button><button class="sku-btn" data-act="sku" data-pid="${p.pid}" data-list="${list}">${esc(p.sku)}</button></td><td class="l"><span class="cell-name">${esc(p.name)}</span></td><td>${p.packRate ? fmt(p.packRate) : tag('warn', '缺装率')}</td>
      ${planCcs.map(cc => `<td>${by(cc) == null ? '<span class="na">—</span>' : `<span data-derived="pcc-${p.pid}-${cc}">${V(by(cc), { nullText: '未填' })}</span>`}</td>`).join('')}
      <td class="sum-c"><span data-derived="ptot-${p.pid}">${fmt(tot)}</span></td><td>${V(p.domestic.avail, { keepZero: true })}</td>
      <td class="l"><span data-derived="pchk-${p.pid}">${tot > p.domestic.avail ? tag('warn', `超出现货 ${fmt(tot - p.domestic.avail)}`, 'warn') : tag('ok', '现货可覆盖')}</span></td>
      <td>${V(pipe.created, { keepZero: true })}</td><td>${V(pipe.shipped, { keepZero: true })}</td><td>${V(pipe.diff, { keepZero: true })}</td></tr>`;
    const sub = open ? ls.map(l => `<tr><td class="l fz1 sub-row" style="padding-left:34px"><b>${l.country}</b> <span class="mono small">${esc(l.msku)}</span></td><td class="l small">${ownerHtml(l)} · <span class="mono">${planOf(l.lid).planId} v${planOf(l.lid).version}</span></td><td class="edit-c">${editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.country} ${l.sku} 计划量` })}</td><td colspan="${planCcs.length}" class="l edit-c">${noteInput(l)} ${planStatusTag(l.lid)} <span class="tiny muted">${esc(planOf(l.lid).editedBy || '')} ${esc(planOf(l.lid).updatedAt)}</span></td><td>${boxCell(l)}</td><td colspan="5" class="l small muted">${S.remote[l.lid] ? tag('bad', `同事 v${S.remote[l.lid].version}：${S.remote[l.lid].qty}`, 'people') : ''}</td></tr>`).join('') : '';
    return head + sub;
  }).join('');
  const grand = sumNums(D.LISTINGS.map(l => planQty(l.lid)));
  return `<div class="page-h"><div class="grow"><h1>发货计划</h1><div class="sub">按 SKU 汇总各国计划量，对同一份国内现货核对（共享池只计一次）。计划只改变计划记录，不改 FBA、国内真实库存、真实货件或实际在途。</div></div>${DEMO_TAG}</div>
  <div class="panel">
    <div class="filters"><input class="inp" id="plq" data-in="plq" value="${esc(st.q)}" placeholder="SKU / 品名 / ASIN / MSKU" style="flex:1 1 200px;min-width:0;max-width:280px" aria-label="筛选">
      ${seg([{ id: 'ALL', label: '全部国家' }, ...planCcs.map(c => ({ id: c, label: c }))], st.country, 'plcountry')}
      ${seg([{ id: 'all', label: '全部' }, { id: 'draft', label: '草稿' }, { id: 'confirmed', label: '已确认' }, { id: 'dirty', label: '未保存' }, { id: 'conflict', label: '有冲突' }], st.status, 'plstatus')}
      <label class="chk"><input type="checkbox" id="plonly" data-in="plonly" ${st.onlyPlanned ? 'checked' : ''}> 仅看已填计划</label>
      <span class="spacer"></span><button class="btn sm" data-act="simremote" title="模拟另一位同事先保存了同一条计划记录">${icon('people')} 模拟同事修改同一记录</button><button class="btn sm" data-act="pexpand">${Object.keys(st.open).length ? '全部收起' : '全部展开'}</button></div>
    <div class="filters small" style="padding-top:0"><span>全部计划量合计 <b class="num" data-derived="pgrand">${fmt(grand)}</b>（含未保存）</span><span class="muted">SA 原表未设补货数量区，不出现在计划列；AE 使用“备货数量”。计划状态（草稿/已确认/部分执行）为建议规则的示例。</span></div>
    <div class="tbl-wrap" id="tbl-plan" style="--fz1w:200px"><table class="t"><thead><tr><th class="l fz1" style="min-width:200px">SKU</th><th class="l">品名</th><th>装率</th>${planCcs.map(cc => `<th>${cc}${cc === 'AE' ? '<span class="th-sub">备货数量</span>' : '<span class="th-sub">本次发货量</span>'}</th>`).join('')}<th>计划合计</th><th>国内现货<span class="th-sub">共享·一次</span></th><th class="l">核对<span class="th-sub">演示·非原HW公式</span></th><th>已建货件待发<span class="th-sub">申报量</span></th><th>已发未接收</th><th>接收差异<span class="th-sub">带符号</span></th></tr></thead><tbody>${rows || `<tr><td colspan="14"><div class="empty"><h3>没有匹配的计划</h3><div>清空筛选后重试。</div></div></td></tr>`}</tbody></table></div>
  </div>`;
};

/* ========== 数据更新与异常 ========== */
function newUpd() {
  return { step: 1, baseDate: '2026-10-13', salesMode: 'continuous', newBatch: false, nbDate: '2026-10-15', nbFrom: '2026-10-12', nbTo: '2026-10-13', versionChanged: false,
    files: [
      { id: 'f1', name: '博达-1012进销存（演示占位）.xlsx', purpose: '上一版主表', on: true, fp: 'a1c9…e70', required: true },
      { id: 'f2', name: '更新记录-1012（演示占位）.xlsx', purpose: '配套更新记录', on: true, fp: '6b02…41d', required: true },
      { id: 'f3', name: 'FBA库存_1013（演示）.xlsx', purpose: 'FBA库存', on: true, fp: '93fe…0aa' },
      { id: 'f4', name: '国内库存_1013（演示）.xlsx', purpose: '国内库存', on: true, fp: '1d7c…b35' },
      { id: 'f5', name: '销量日明细_1001-1013（演示）.xlsx', purpose: '销量（日明细）', on: true, fp: 'ce44…912' },
      { id: 'f6', name: '销量日明细_1001-1013（副本）.xlsx', purpose: '销量（日明细）', on: true, fp: 'ce44…912', dup: true },
      { id: 'f7', name: '货件详情_1013（演示）.xlsx', purpose: '货件（完整接收快照）', on: true, fp: '5a80…c1e' },
    ] };
}
function updPlan(u) {
  const on = p => u.files.some(f => f.on && f.purpose.startsWith(p) && !f.dup);
  const mods = [];
  mods.push(on('FBA') ? { m: 'FBA库存', st: 'ok', t: '可更新：匹配 98 条；未匹配 1 条（DEMO-XXX-UNK）隔离待核对' } : { m: 'FBA库存', st: 'keep', t: '未提供：沿用 10/11 旧周期；依赖它的可售天数标“依赖旧库存来源”' });
  mods.push(on('国内') ? { m: '国内库存', st: 'ok', t: '可更新：全部部门原始明细保留，业务统计仅“亚马逊二部”' } : { m: '国内库存', st: 'keep', t: '未提供：沿用 10/11' });
  mods.push({ m: 'US AWD', st: 'keep', t: '未提供 AWD 文件：沿用 10/04；空文件或缺字段不当作0' });
  if (on('销量')) {
    if (u.salesMode === 'strict') mods.push({ m: '销量', st: 'block', t: '严格日期检查：10/12 无数据行且无法证明为0 → 阻断销量模块，保留旧值（日期缺失不默认按0）' });
    else mods.push({ m: '销量', st: 'ok', t: '连续报表确认：更新 2026-10（截至10/13）；W41 已有非空 → 保持；W42 未完整 → 不写；历史月份保持。同键同量 12 行去重，同键不同量 1 行冲突隔离' });
  } else mods.push({ m: '销量', st: 'keep', t: '未提供：沿用 10/11' });
  if (u.files.find(f => f.dup && f.on)) mods.push({ m: '重复文件', st: 'skip', t: '“销量日明细（副本）”与另一文件指纹相同 → 识别为重复，不相加' });
  if (on('货件')) mods.push({ m: '货件/批次', st: 'warn', t: 'US 8.15 接收快照更新 3 行；CA 8.2 两份快照冲突 → 整批跳过保持旧值；EU 9.3 无原发货依据 → 跳过；UK 未知SKU 1 行隔离' + (u.newBatch ? `；新建批次 ${u.nbDate}（创建日 ${u.nbFrom}~${u.nbTo} 含首尾）按申报量写入` : '') });
  else mods.push({ m: '货件/批次', st: 'keep', t: '未提供：各国在途保留原范围' });
  return mods;
}
function updPreview(u) {
  const mods = updPlan(u); const ok = m => mods.find(x => x.m === m && x.st === 'ok');
  const rows = [];
  ['DEMO-CUP-500BK', 'DEMO-PET-2L', 'DEMO-LINT-RMV'].forEach((sku, i) => {
    const l = D.LISTINGS.find(x => x.sku === sku && x.country === 'US');
    if (ok('FBA库存')) rows.push({ l, f: 'FBA可售', a: l.fba, b: l.fba - 6 - i * 3, src: 'FBA库存_1013 · 第' + (12 + i) + '行' });
    if (ok('销量')) rows.push({ l, f: '2026-10 月销量', a: l.monthly[2026][9], b: l.monthly[2026][9] + Math.round(l.monthly[2026][9] * 2 / Math.max(1, S.baseDay)), src: '销量日明细 10/12–10/13' });
  });
  if (mods.find(x => x.m === '货件/批次' && x.st !== 'keep')) { const b = D.BATCHES.find(x => x.bid === 'B-US-2026-08-15'); b.lines.filter(ln => ln.received == null).slice(0, 3).forEach(ln => rows.push({ l: L(ln.lid), f: 'US 8.15 当前值', a: ln.current, b: ln.declared - (ln.declared - 2), src: '货件详情_1013 完整快照', batch: ln })); }
  return rows;
}
PAGES.update = function () {
  const u = S.upd || (S.upd = newUpd());
  const steps = ['添加文件/确认用途', '基准日与更新范围', '候选预检', '变化预览', '应用到本次演示'];
  let body = '';
  if (u.step === 1) body = `<div class="callout demo">${icon('flask')}<div>演示流程：文件均为占位名称，不读取、不上传任何本地文件。正式版由受控后端预检。</div></div>
    ${table('tbl-upd-files', [
      { key: 'on', label: '纳入', cls: 'c', render: f => `<input type="checkbox" id="uf-${f.id}" data-in="ufile" data-id="${f.id}" ${f.on ? 'checked' : ''} ${f.required ? 'disabled' : ''} aria-label="纳入 ${esc(f.name)}">` },
      { key: 'n', label: '文件', cls: 'l', render: f => esc(f.name) + (f.required ? ' ' + tag('mute', '必需') : '') },
      { key: 'p', label: '用途', cls: 'l', render: f => esc(f.purpose) }, { key: 'fp', label: '指纹', cls: 'l mono', render: f => f.fp + (f.dup ? ' ' + tag('warn', '与另一文件相同') : '') },
    ], u.files, { wrapCls: 'auto-h' })}
    <div class="row small muted">未出现：US AWD 文件（本次未提供）。<button class="btn sm" disabled title="正式版接入">添加本地文件（正式版接入）</button></div>`;
  if (u.step === 2) body = `<div class="grid2"><div class="stack"><label class="row">数据基准日 <input class="inp" type="date" id="ubd" data-in="ubase" value="${u.baseDate}"></label>
      <div class="row">销量模式 ${seg([{ id: 'continuous', label: '连续报表确认' }, { id: 'strict', label: '严格日期检查' }], u.salesMode, 'umode')}</div>
      <p class="small muted">月销量只更新基准日所在年月（2026-10）；历史月份保持。最新完整周（周一至周日）可更新；更早遗漏周只有完整来源才补。</p></div>
    <div class="stack"><label class="chk"><input type="checkbox" id="unb" data-in="unb" ${u.newBatch ? 'checked' : ''}> 本次同时新建批次（按申报量）</label>
      <div class="row ${u.newBatch ? '' : 'muted'}">业务归属批次日 <input class="inp" type="date" id="unbd" data-in="unbd" value="${u.nbDate}" ${u.newBatch ? '' : 'disabled'}></div>
      <div class="row ${u.newBatch ? '' : 'muted'}">创建日期范围（含首尾全天） <input class="inp" type="date" id="unbf" data-in="unbf" value="${u.nbFrom}" ${u.newBatch ? '' : 'disabled'}> – <input class="inp" type="date" id="unbt" data-in="unbt" value="${u.nbTo}" ${u.newBatch ? '' : 'disabled'}></div>
      <p class="small muted">接收差异固定使用完整批次快照，不按创建时间截取。</p></div></div>`;
  if (u.step === 3) { const mods = updPlan(u); const M = { ok: ['ok', '可更新'], keep: ['mute', '沿用旧值'], block: ['bad', '阻断'], skip: ['warn', '跳过'], warn: ['warn', '部分需核对'] };
    body = table('tbl-upd-pre', [{ key: 'm', label: '模块', cls: 'l', render: x => `<b>${x.m}</b>` }, { key: 's', label: '预检结果', cls: 'l', render: x => tag(M[x.st][0], M[x.st][1]) }, { key: 't', label: '说明', cls: 'l wrap', render: x => esc(x.t) }], mods, { wrapCls: 'auto-h' }) + `<p class="small muted" style="margin-top:8px">不可信模块保持旧事实和旧周期，其他独立模块继续；批次写入、原发货历史与在途求和共同成功或共同撤回。</p>`; }
  if (u.step === 4) { const rows = updPreview(u);
    body = `${rows.length ? table('tbl-upd-diff', [{ key: 'sku', label: 'SKU', cls: 'l', render: r => skuCell(r.l) }, { key: 'cc', label: '国家', cls: 'l', render: r => r.l.country }, { key: 'f', label: '字段', cls: 'l', render: r => esc(r.f) }, { key: 'a', label: '更新前', render: r => V(r.a, { keepZero: true }) }, { key: 'b', label: '候选值', render: r => `<b>${V(r.b, { keepZero: true })}</b>` }, { key: 's', label: '来源', cls: 'l small', render: r => esc(r.src) }], rows, { wrapCls: 'auto-h' }) : '<div class="empty"><h3>没有可应用的变化</h3><div>所有模块都沿用旧值或被阻断。</div></div>'}
    <div class="callout info" style="margin-top:10px">${icon('info')}<div><b>保留范围：</b>人工发货计划 ${Object.values(S.plans).filter(p => isNum(p.qty)).length} 条、备注、半月销售计划、财年月目标、产品等级不被覆盖。示例行只列出部分变化。</div></div>
    <label class="chk" style="margin-top:10px"><input type="checkbox" id="uvc" data-in="uvc" ${u.versionChanged ? 'checked' : ''}> 模拟：预检后正式版本已被他人更新</label>`; }
  if (u.step === 5) body = u.result ? `<div class="callout ${u.result.ok ? 'demo' : 'warn'}">${icon(u.result.ok ? 'flask' : 'warn')}<div>${u.result.html}</div></div>` : `<p>确认后，候选变化只写入本页内存中的演示数据：</p><ul class="clean small"><li>不写入任何正式数据，不通知或同步任何同事</li><li>未提供/被阻断的模块保持旧值与旧日期</li><li>刷新页面后全部演示修改都会重置</li></ul><div class="row" style="margin-top:12px"><button class="btn primary" data-act="uapply">应用到本次演示</button></div>`;
  const issues = D.ISSUES;
  const LV = { review: ['warn', '待核对'], error: ['bad', '错误值'], skip: ['warn', '跳过·保持旧值'], isolated: ['bad', '隔离'] };
  const icols = [{ key: 'id', label: '编号', cls: 'l mono', render: i => i.id }, { key: 'm', label: '模块', cls: 'l', render: i => esc(i.module) }, { key: 'lv', label: '处理结果', cls: 'l', render: i => tag(LV[i.level][0], LV[i.level][1]) }, { key: 't', label: '问题', cls: 'l wrap', render: i => `<b>${esc(i.title)}</b><div class="small muted">${esc(i.detail)}</div>` }, { key: 'sc', label: '受影响范围', cls: 'l', render: i => i.lid ? skuCell(L(i.lid)) + ` <span class="small muted">${L(i.lid).country}</span>` : i.pid ? `<button class="sku-btn" data-act="sku" data-pid="${i.pid}">${esc(P(i.pid).sku)}</button>` : esc(i.country || '') }, { key: 's', label: '来源', cls: 'l small', render: i => esc(i.source) }];
  const fcols = [{ key: 'm', label: '模块', cls: 'l', render: f => `<b>${esc(f.label)}</b>` }, { key: 'd', label: '来源日期', cls: 'l mono', render: f => f.date }, { key: 's', label: '状态', cls: 'l', render: f => f.state === 'stale' ? tag('warn', '沿用旧周期', 'warn') : f.state === 'blocked' ? tag('bad', '本次阻断') : tag('ok', '已更新', 'check') }, { key: 'n', label: '说明', cls: 'l', render: f => esc(f.note || '') }];
  return `<div class="page-h"><div class="grow"><h1>数据更新与异常</h1><div class="sub">保留“导入源报表 → 核对候选变化 → 确认更新”的流程；本页全部为前端模拟。</div></div>${DEMO_TAG}</div>
  <div class="panel"><div class="panel-h"><div class="steps">${steps.map((s, i) => `<button class="${u.step === i + 1 ? 'on' : u.step > i + 1 ? 'done' : ''}" data-act="ustep" data-s="${i + 1}"><span class="n">${u.step > i + 1 ? '✓' : i + 1}</span>${s}</button>`).join('')}</div><span class="spacer"></span><button class="btn sm" data-act="ureset">重新开始</button></div>
    <div class="panel-b stack">${body}<div class="row"><button class="btn" data-act="ustep" data-s="${u.step - 1}" ${u.step <= 1 ? 'disabled' : ''}>上一步</button><span class="spacer"></span>${u.step < 5 ? `<button class="btn primary" data-act="ustep" data-s="${u.step + 1}">下一步</button>` : ''}</div></div></div>
  <div class="grid2" style="margin-top:14px">
    <div class="panel"><div class="panel-h"><h3>逐模块来源状态</h3><span class="hint">不同模块可有不同更新时间</span></div>${table('tbl-fresh', fcols, S.freshness, { wrapCls: 'auto-h' })}</div>
    <div class="panel"><div class="panel-h"><h3>演示运行记录</h3><span class="hint">过程记录与业务数据分开</span></div><div class="panel-b">${S.runs.length ? `<ul class="clean small">${S.runs.map(r => `<li><span class="mono">${r.id}</span> · ${r.at} · ${esc(r.summary)}</li>`).join('')}</ul>` : '<span class="muted small">暂无。完成上方流程后在此记录。</span>'}</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><div class="panel-h"><h3>异常与待核对</h3><span class="hint">${issues.length} 项 · 条数不等于商品数；错误值与未知值不填0；隔离的正负不相抵</span></div>${table('tbl-issues', icols, issues, { wrapCls: 'auto-h' })}</div>`;
};
function applyUpdate() {
  const u = S.upd;
  if (u.versionChanged) { u.result = { ok: false, html: '<b>未应用：</b>预检后正式版本已变化（模拟他人已更新）。请返回“候选预检”重新核对差异后再确认。本次没有任何数据被写入。' }; u.versionChanged = false; rerenderKeep(); toast('版本已变化：需要重新预检', 'warn'); return; }
  const mods = updPlan(u); const ok = m => mods.find(x => x.m === m && x.st === 'ok');
  const prev = updPreview(u); const applied = [];
  prev.forEach(r => { if (r.f === 'FBA可售') r.l.fba = r.b; if (r.f.startsWith('2026-10')) r.l.monthly[2026][9] = r.b; if (r.batch) { r.batch.received = r.batch.declared - 2; r.batch.diffRaw = 2; r.batch.current = 2; } applied.push(r); });
  const fr = k => S.freshness.find(f => f.key === k);
  if (ok('FBA库存')) { fr('fba').date = u.baseDate; fr('fba').state = 'updated'; fr('fba').note = ''; S.staleFba = false; } else { fr('fba').state = 'stale'; fr('fba').note = '本次未提供 FBA 文件，沿用旧周期；可售天数依赖旧库存来源'; S.staleFba = true; }
  if (ok('国内库存')) { fr('domestic').date = u.baseDate; } else { fr('domestic').state = 'stale'; fr('domestic').note = '本次未提供，沿用旧周期'; }
  const sm = mods.find(x => x.m === '销量');
  if (sm.st === 'ok') { fr('sales').date = u.baseDate; fr('sales').state = 'updated'; S.baseDate = u.baseDate; S.baseDay = Number(u.baseDate.slice(8)); }
  else if (sm.st === 'block') { fr('sales').state = 'blocked'; fr('sales').note = '严格日期检查阻断，保留 10/11 旧值'; }
  const shipMod = mods.find(x => x.m === '货件/批次'); if (shipMod.st !== 'keep') fr('ship').date = u.baseDate;
  const id = `RUN-${String(S.runs.length + 1).padStart(3, '0')}`; const at = new Date().toTimeString().slice(0, 5);
  S.runs.unshift({ id, at, summary: `基准日 ${u.baseDate}；应用 ${applied.length} 项示例变化；${mods.filter(m => m.st !== 'ok').map(m => m.m + (m.st === 'block' ? '阻断' : m.st === 'keep' ? '沿用' : '部分')).join('、')}` });
  u.result = { ok: true, html: `<b>已应用到本次演示（${id}）。</b>写入 ${applied.length} 项示例变化，只存在于本页内存；没有写入正式数据，也没有同步给任何同事。${sm.st === 'block' ? '销量模块被阻断，保持旧值。' : ''}${S.staleFba ? 'FBA 未更新：相关可售天数已标“依赖旧库存”。' : ''} 人工计划与备注未被覆盖。` };
  render(); toast(`已应用到本次演示（${id}）。未写入正式数据。`);
}

/* ========== 原表覆盖与验收 ========== */
const ACCEPT = [
  ['A01', '16张原表均有映射；Craft&Fresh/Sheet1 角色待确认', 'coverage:sheets'], ['A02', '七国切换；五国完整/AE部分/SA简表区别', 'country:AE'], ['A03', '搜SKU/品名/ASIN/MSKU；多Listing保留', 'search:cup500'],
  ['A04', '从国家页进详情默认定位该国，可切其他国家/Listing', 'sku:DEMO-CUP-500BK:US'], ['A05', '同SKU不同国家不同运营；EU发货负责人；未分配可查', 'people:__none'], ['A06', '月表全部年份同时展开；早年仅年总量；缺失≠0', 'country:US:month'],
  ['A07', '当月截至日只标该记录；周按年份/范围切换、跨年日期', 'country:US:week'], ['A08', '国家20期半月；总销量20期与15期不混', 'total:blocks'], ['A09', '目标/实际/预测/计划分开；财年归属不猜', 'country:US:future'],
  ['A10', '人工预测、变体比例依赖可回查；零分母/组外待核验', 'sku:DEMO-LED-5M:AU'], ['A11', '填发货量只影响计划汇总', 'plan'], ['A12', '装率/箱数/天数仅局部公式；缺装率/均销0状态', 'country:US:plan'],
  ['A13', '同SKU多国引用同一国内库存不翻倍', 'people:ALL'], ['A14', 'EU多站不相加；库龄重复MSKU取最大；AWD组成', 'stock:fba'], ['A15', '原总库存五国+US AWD；AE/SA不塞入', 'stock:total'],
  ['A16', '原量100及差异4/−4/0', 'batch:B-US-2026-07-20'], ['A17', '各国独立选在途批次；空选；取消不删历史', 'country:US:batch'], ['A18', '新建申报≠实际发货；无依据/未知SKU/正负不抵消', 'update'],
  ['A19', '重复/冲突销量与同批次快照不相加；预览前后变化', 'update'], ['A20', '未提供库存沿用旧周期，销量可更新', 'update'], ['A21', '两人同改计划冲突；运营筛选≠权限', 'plan'],
  ['A22', '采购在途可看；无采购计算/下单', 'stock:domestic'], ['A23', '保存/更新反馈为演示状态；未保存/空结果/取消', 'search:zzz-无结果'], ['A24', '宽屏与窄屏、固定列、键盘', 'notes'],
];
PAGES.coverage = function () {
  const st = S.coverage;
  const sheetCols = [{ key: 'n', label: '原工作表', cls: 'l fz1', render: r => `<b>${esc(r[0])}</b>` }, { key: 'e', label: '程序内入口', cls: 'l', render: r => `<button class="link" data-act="goto" data-t="${r[2]}">${esc(r[1])}</button>` }, { key: 's', label: '状态', cls: 'l', render: r => /待确认/.test(r[3]) ? tag('warn', '角色待确认', 'warn') : tag('ok', '已映射', 'check') }, { key: 'd', label: '差异或边界', cls: 'l wrap', render: r => esc(r[3]) }];
  const acols = [{ key: 'id', label: '编号', cls: 'l mono', render: r => r[0] }, { key: 't', label: '场景', cls: 'l wrap', render: r => esc(r[1]) }, { key: 'g', label: '去验证', cls: 'l', render: r => `<button class="btn sm" data-act="goto" data-t="${r[2]}">打开 ${icon('right')}</button>` }];
  return `<div class="page-h"><div class="grow"><h1>原表覆盖与验收</h1><div class="sub">16 张原工作表的入口映射，以及验收场景的一键定位。业务数据与过程记录分开组织，可互相跳转。</div></div>${DEMO_TAG}</div>
  <div class="panel"><div class="panel-h">${seg([{ id: 'sheets', label: '16 张原表映射' }, { id: 'accept', label: '验收场景 A01–A24' }], st.tab, 'covtab')}</div>
    ${st.tab === 'sheets' ? table('tbl-cov', sheetCols, D.SHEETS, { wrapCls: 'auto-h', fz1w: 130 }) + `<div class="note">${icon('info')} Craft&amp;Fresh、Sheet1 仅确认工作表存在，业务角色与字段依赖待确认：保留回查入口，不删除、不猜映射。</div>` : table('tbl-acc', acols, ACCEPT, { wrapCls: 'auto-h' })}</div>`;
};
function gotoTarget(t) {
  const [k, a, b] = t.split(':');
  if (k === 'country') { S.country = a; if (b) cui(a).view = b; go('country'); }
  else if (k === 'sku') { const p = D.PRODUCTS.find(x => x.sku === a); S.page = 'coverage'; openSku(p.pid, { country: b }); }
  else if (k === 'search') { S.search.mode = 'text'; S.search.q = a; S.search.page = 1; go('search'); }
  else if (k === 'people') { S.people.person = a; S.people.country = 'ALL'; go('people'); }
  else if (k === 'stock') { S.stock.tab = a; go('stock'); }
  else if (k === 'total') { S.total.tab = a; go('total'); }
  else if (k === 'coverage') { S.coverage.tab = a || 'sheets'; go('coverage'); }
  else if (k === 'batch') { const b2 = D.BATCHES.find(x => x.bid === a); S.country = 'US'; cui('US').view = 'batch'; go('country'); batchModal(b2.bid); }
  else go(k);
}

/* ========== 方案说明 ========== */
PAGES.notes = function () {
  return `<div class="page-h"><div class="grow"><h1>方案说明</h1><div class="sub">设计说明 · 状态说明 · 待确认项。完整文档另见仓库 inventory-workbench/docs。</div></div>${DEMO_TAG}</div>
  <div class="grid2">
    <div class="panel"><div class="panel-h"><h2>设计说明</h2></div><div class="panel-b small">
      <p><b>核心布局。</b>可收起的轻材质侧栏 + 常驻全局搜索 + 逐模块来源日期条。默认进入国家主表：SKU 行为主体，同一张表内用“视图”切换综合/月/周/未来/发货/批次/库存/资料，筛选、分页、横向位置按国家各自保留。SKU 详情是整页工作区，顶部固定返回、上一个/下一个、国家与 Listing 切换和分区锚点。</p>
      <p><b>为什么适合进销存。</b>数据实体只有一份（Listing、计划、批次选择、半月计划），国家页、人员页、搜索、发货计划和详情读写同一状态；月历史固定为“年份行 × 1—12 月列”，同月纵向对齐；每个数字旁标注层级（SKU/国家/Listing）、来源列和状态，缺失、真实0、未发生、待接入分开显示。</p>
      <p><b>与另一方案最显著的区别。</b>不用抽屉或弹层承载 SKU：详情是带锚点的完整页面，能同时容纳多年月矩阵、全部周与 20 期宽表；国家主表把八类工作视图放进同一张表，靠视图切换而不是拆成独立模块。</p></div></div>
    <div class="panel"><div class="panel-h"><h2>状态说明</h2></div><div class="panel-b small">
      <p><b>真实可交互（前端本地状态）：</b>国家/视图切换与各国筛选保留；全局与多 SKU 搜索；人员×国家组合；SKU 详情与返回恢复；月份高亮；周范围切换；编辑发货量/备注/半月计划并实时联动箱数（US）、补货后天数（US）、计划汇总、总销量 DL:EE 汇总；批次选入在途（各国独立、空选、恢复原范围）；保存/放弃；模拟同事冲突与解决；只读身份；更新流程模拟（预检、阻断、预览、版本变化、应用）；主题与密度切换。</p>
      <p><b>设计占位（未实现）：</b>登录与权限、真实多人同步与版本服务、文件读取与导入、数据库持久化、原公式结果接口、审计存储、通知。所有“保存/应用”只写本页内存，刷新即重置。</p></div></div>
  </div>
  <div class="panel" style="margin-top:14px"><div class="panel-h"><h2>待确认项（不自行补造公式）</h2></div><div class="panel-b small"><ol style="margin:0;padding-left:18px">
    <li>Craft&amp;Fresh、Sheet1 的业务角色及字段依赖。</li><li>年度/月/周、财年目标、半月预测、海运期末/月底库存、可售天数、变体依赖的逐字段公式与人工输入边界（目前仅 US 局部公式 J、HO、HX 有证据）。</li>
    <li>总销量各“全球”指标的实际国家/Listing 覆盖。</li><li>财年目标的起止年份、形成与分摊、是否锁定。</li><li>发货计划如何对应已建货件、实际发货与部分执行，何时冲销。</li>
    <li>运营角色、记录负责人、正式更新确认人、历史修正人及并发冲突最终规则。</li><li>原表疑点、缺失月份、错误公式与未匹配商品的逐项复核流程。</li>
    <li>变体比例分子引用的年度；SA 部分月份标题的确切范围；各国运输天数 D1 的真实取值（演示为示例参数）。</li></ol></div></div>`;
};
