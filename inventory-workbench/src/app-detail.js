/* ========== SKU 统一详情 ========== */
const SECS = [['sec-ov', '总览'], ['sec-hist', '历史销量'], ['sec-fut', '未来计划/目标'], ['sec-plan', '发货计划'], ['sec-batch', '批次/在途'], ['sec-stock', '库存明细'], ['sec-src', '资料/来源']];
PAGES.detail = function () {
  const d = S.detail; const p = P(d.pid); const ls = listingsOfP(d.pid);
  const ccs = D.COUNTRIES.map(c => c.code);
  const idx = d.list.indexOf(d.pid); const prev = idx > 0 ? d.list[idx - 1] : null; const next = idx >= 0 && idx < d.list.length - 1 ? d.list[idx + 1] : null;
  const inC = d.country === 'ALL' ? ls : ls.filter(l => l.country === d.country);
  const cur = d.lid ? L(d.lid) : null;
  const iss = issuesOfP(d.pid);
  return `
  <div class="detail-head">
    <button class="btn" data-act="back" title="返回 ${esc(d.from ? d.from.label : '国家主表')}">${icon('left')} 返回</button>
    <div class="grow" style="min-width:0"><h1>${esc(p.sku)} <span class="h1-name">${esc(p.name)}</span></h1>
      <div class="small muted">${[...new Set(ls.map(l => l.country))].length} 个国家 · ${ls.length} 条 Listing · 装率 ${p.packRate ?? '缺'} · 等级 ${esc(p.grade)}${iss.length ? ` · <span class="st warn">待核对 ${iss.length}</span>` : ''}</div></div>
    <div class="row" style="gap:4px"><span class="small muted">${idx >= 0 ? `${idx + 1} / ${d.list.length}` : ''}</span>
      <button class="icon-btn" data-act="pn" data-pid="${prev || ''}" ${prev ? '' : 'disabled'} aria-label="上一个 SKU" title="上一个 SKU">${icon('up')}</button>
      <button class="icon-btn" data-act="pn" data-pid="${next || ''}" ${next ? '' : 'disabled'} aria-label="下一个 SKU" title="下一个 SKU">${icon('down')}</button></div>
  </div>
  <div class="row" style="margin:14px 0 4px" role="group" aria-label="国家切换">
    <div class="seg">${[{ id: 'ALL', label: '全部国家' }, ...ccs.map(c => ({ id: c, label: c, cnt: ls.filter(l => l.country === c).length }))].map(it => `<button aria-pressed="${it.id === d.country}" data-act="dcountry" data-v="${it.id}" ${it.id !== 'ALL' && !it.cnt ? `disabled title="该SKU在${it.id}没有记录"` : ''}>${it.label}</button>`).join('')}</div>
    ${d.country !== 'ALL' && inC.length > 1 ? `<label class="grp small muted">Listing <select class="sel" id="dlid" data-in="dlid" aria-label="选择 Listing">${inC.map(l => `<option value="${l.lid}" ${l.lid === d.lid ? 'selected' : ''}>${esc(l.msku)} · ${esc(l.owner || '未分配')}</option>`).join('')}</select></label>` : ''}
  </div>
  <nav class="anchors" aria-label="详情分区">${SECS.map(([id, t]) => `<button data-act="anchor" data-id="${id}">${t}</button>`).join('')}</nav>
  ${secOverview(p, ls, d)}
  ${secHistory(p, ls, d, cur)}
  ${secFuture(p, ls, d, cur)}
  ${secPlan(p, ls, d)}
  ${secBatch(p, ls, d)}
  ${secStock(p, ls, d)}
  ${secSource(p, ls, d, iss)}`;
};
function setupAnchors() {
  const main = $('#main');
  const onScroll = () => { let cur = SECS[0][0]; SECS.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 220) cur = id; }); $$('.anchors button').forEach(b => b.classList.toggle('on', b.dataset.id === cur)); };
  main.onscroll = S.page === 'detail' ? onScroll : null; onScroll();
}
const scopeLs = (ls, d) => d.country === 'ALL' ? ls : ls.filter(l => l.country === d.country);
const ccName = cc => `${cc} ${D.CMAP[cc].name}`;

function secOverview(p, ls, d) {
  const dm = domesticOf(p.pid);
  const five = ls.filter(l => D.FIVE.includes(l.country));
  const fiveFba = sumNums(five.map(l => l.fba)), fiveTr = sumNums(five.map(l => transitOf(l.lid)));
  const awd = sumNums(ls.filter(l => l.country === 'US').map(l => l.awd.available + l.awd.reserved + l.awd.outbound));
  const cols = [
    { key: 'cc', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` },
    { key: 'msku', label: 'MSKU / ASIN', cls: 'l mono', render: l => `${esc(l.msku)}<span class="muted"> · ${esc(l.asin)}</span>` },
    { key: 'owner', label: '负责人', sub: '原字段名', cls: 'l', render: l => `${ownerHtml(l)} <span class="tiny muted">${esc(ownerFieldOf(l.country))}</span>` },
    { key: 'fba', label: 'FBA可售', render: l => V(l.fba) },
    { key: 'tr', label: '当前在途', sub: '本国所选批次', render: l => V(transitOf(l.lid), { keepZero: true }) },
    { key: 'plan', label: '本次计划', sub: '发货量/备货', render: l => planOf(l.lid) ? V(planQty(l.lid), { nullText: '未填' }) : V(null, { nullText: '原表未设' }) },
    { key: 'avg', label: '近4周均销', render: l => D.CMAP[l.country].half ? V(l.avg4, { keepZero: true }) : V('NF') },
    { key: 'm9', label: '2026-09 实际', render: l => V(l.monthly[2026] ? l.monthly[2026][8] : 'NF') },
    { key: 'st', label: '状态', cls: 'l', render: statusCell },
    { key: 'go', label: '', cls: 'l', render: l => `<button class="link small" data-act="dlisting" data-lid="${l.lid}" data-setcc="1">看此国</button>` },
  ];
  return `<section class="sec" id="sec-ov"><h2 class="sec-title">总览 ${layerTag('sku')}</h2>
    <div class="grid3" style="margin-bottom:12px">
      <div class="metric"><div class="k">国内现货 · 共享池（只计一次）</div><div class="v">${fmt(dm.avail)}</div><div class="d">亚马逊二部 · 亚马逊仓可用；各国页面只引用</div></div>
      <div class="metric"><div class="k">国内采购在途（仅展示）</div><div class="v">${fmt(dm.pending)}</div><div class="d">待到货；本轮不做采购计算</div></div>
      <div class="metric"><div class="k">国内可调拨（5个白名单仓）</div><div class="v">${fmt(dm.transfer)}</div><div class="d">${D.TRANSFER_WH.map(w => `${w} ${dm.parts[w]}`).join(' · ')}</div></div>
      <div class="metric"><div class="k">原总库存口径（五国 FBA + 在途 + US AWD）</div><div class="v">${fmt(fiveFba + fiveTr + awd)}</div><div class="d">FBA ${fmt(fiveFba)} · 在途 ${fmt(fiveTr)} · US AWD ${fmt(awd)}；AE/SA 不在原口径</div></div>
    </div>
    <div class="panel"><div class="panel-h"><h3>各国家 / Listing</h3>${layerTag('listing')}<span class="hint">同 SKU 多个 ASIN/MSKU 保持独立行；负责人按国家记录保存，非 SKU 全局单值</span></div>
    ${table('tbl-d-ov', cols, ls, { wrapCls: 'auto-h', rowAttr: l => d.lid === l.lid ? 'style="outline:2px solid var(--accent-line);outline-offset:-2px"' : '' })}</div></section>`;
}

function secHistory(p, ls, d, cur) {
  const scope = scopeLs(ls, d);
  const groups = scope.map(l => ({ c1: `<b>${l.country}</b> <span class="tiny muted">${esc(ownerFieldOf(l.country))}：${esc(l.owner || '未分配')}</span>`, c2: `<span class="mono small">${esc(l.msku)}</span>`, rows: yearRowsForListing(l) }));
  const wk = scope.filter(l => l.weekly);
  const st = d;
  return `<section class="sec" id="sec-hist"><h2 class="sec-title">历史销量 ${layerTag(d.country === 'ALL' ? 'listing' : 'country')}<span class="small muted" style="font-weight:400">全部可用年份同时展开 · 年份为行、1—12月为列</span></h2>
    <div class="panel"><div class="panel-h"><h3>月销量 · ${d.country === 'ALL' ? '全部国家/Listing' : ccName(d.country)}</h3><span class="spacer"></span>${yearPicker([...new Set(scope.flatMap(l => D.CMAP[l.country].annualOnly.concat(D.CMAP[l.country].monthYears))), 2023])}<span class="hint">点击月份表头高亮所有年份的同一月；${curMonthLabel()} 只标在 2026×10 这一格</span></div>
      ${monthMatrix('tbl-d-month', groups, { hlKey: 'dm', c1: '国家 / 负责人', c2: 'MSKU', fz1w: 190, wrapCls: 'auto-h' })}
      <div class="note">${icon('info')} US/CA/AU/UK 的 2022/2023 只有年总量，单独成行标“仅年总量”；EU 未设早年字段；AE 从 2025 起；SA 仅部分 2025 月份。缺失与真实 0 分开显示。未生成不等期同比。</div></div>
    <div class="panel"><div class="panel-h"><h3>总销量 · 月历史 2023—2026</h3>${layerTag('sku')}${tag('warn', '汇总覆盖国家待逐公式核验', 'warn')}<span class="hint">总销量 L:BK；2023 有月历史，不按“仅年总量”处理</span></div>
      ${monthMatrix('tbl-d-total', [{ c1: '', c2: '', rows: yearRowsForProduct(p) }], { hlKey: 'dm', ident: false, wrapCls: 'auto-h', fz1w: 72 })}</div>
    <div class="panel"><div class="panel-h"><h3>周历史</h3><span class="hint">按源周区年份/周范围切换；显示真实起止日期与 ISO 周</span></div>
      ${wk.length ? `<div class="filters">${weekControls('detail', st)}</div>${weekTable('tbl-d-week', wk.map(l => ({ c1: `<b>${l.country}</b>`, c2: `<span class="mono small">${esc(l.msku)}</span>`, vals: l.weekly })), st, { c1: '国家', c2: 'MSKU', fz1w: 70 })}` : `<div class="empty"><h3>所选国家没有周历史区</h3><div>${d.country === 'ALL' ? '' : `${d.country} 原表未设周销量区；不补造。`}</div></div>`}
    </div></section>`;
}

function secFuture(p, ls, d, cur) {
  const scope = scopeLs(ls, d).filter(l => l.half);
  const halfCols = [
    { key: 'cc', label: '国家', fz: 1, cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'msku', label: 'MSKU', fz: 2, cls: 'l mono', render: l => esc(l.msku) },
    ...D.HALF.map((h, k) => ({ key: 'h' + k, label: h.label, sub: halfPast(k) ? '已过期间' : halfCur(k) ? '当前期间' : '', tdCls: () => 'edit-c', render: l => editNum('half', l.lid, S.half[l.lid][k], { k, dirty: isDirtyHalf(l.lid, k), ph: '未设置', aria: `${l.country} ${h.label} 销售计划` }) })),
    { key: 'sum', label: '20期合计', render: l => `<span data-derived="hsum-${l.lid}">${fmt(sumNums(S.half[l.lid]))}</span>` },
  ];
  const fiscalCols = [
    { key: 'cc', label: '国家', fz: 1, cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'msku', label: 'MSKU', fz: 2, cls: 'l mono', render: l => esc(l.msku) },
    ...D.FISCAL.map((m, k) => ({ key: 'f' + k, label: m, render: l => V(l.fiscal[k]) })),
    { key: 'sum', label: '合计', render: l => fmt(sumNums(l.fiscal)) },
  ];
  // 总销量右侧：DL:EE 20期（DL:DQ 空，DR:EE 按源公式描述汇总五国同名半月字段）
  const fiveLs = ls.filter(l => l.half);
  const dlee = D.HALF.map((h, k) => k < 6 ? 'EMPTY' : sumNums(fiveLs.map(l => S.half[l.lid][k])));
  const tblRow = (label, sub, vals, heads, cls = '') => `<div class="tbl-wrap auto-h" id="tbl-d-${label.slice(0, 2)}${heads.length}" style="--fz1w:140px"><table class="t"><thead><tr><th class="l fz1" style="min-width:130px">${label}<span class="th-sub">${sub}</span></th>${heads.map(h => `<th class="c" style="min-width:74px">${h.label}</th>`).join('')}</tr></thead><tbody><tr><td class="l fz1 last">${esc(p.sku)}</td>${vals.map(v => `<td class="${cls}">${V(v, { nullText: '未设置' })}</td>`).join('')}</tr></tbody></table></div>`;
  const vRows = ls.filter(l => D.CMAP[l.country].variant).map(l => ({ l }));
  const vCols = [
    { key: 'cc', label: '国家', cls: 'l', render: r => `<b>${r.l.country}</b>` }, { key: 'msku', label: 'MSKU', cls: 'l mono', render: r => esc(r.l.msku) },
    { key: 'v', label: '变体比例', cls: 'l', render: r => variantHtml(r.l.variant) },
    { key: 'dep', label: '依赖（可回查）', cls: 'l wrap', render: r => { const v = r.l.variant; if (v.kind === 'formula') return `本行 2025 年合计 ${fmt(v.num)} ÷ 组 ${esc(v.group)} 年销量合计 ${fmt(v.den)}（组内 ${v.members.length} 行，按原分组）<span class="muted">；引用年度待核验</span>`; if (v.kind === 'manual') return '人工比例：保留原值，不重算'; if (v.kind === 'standalone') return '独立商品：100%'; if (v.kind === 'zeroden') return '组内年销量合计为 0：不均分、不填 0'; if (v.kind === 'outgroup') return '分子引用了组外行：不按 SKU 前缀或相邻行重组'; if (v.kind === 'referr') return '上游 #REF!：不当作 0 参与计算'; return ''; } },
  ];
  return `<section class="sec" id="sec-fut"><h2 class="sec-title">未来计划/目标 ${layerTag('listing')}<span class="small muted" style="font-weight:400">半月销售计划、财年月目标、总销量保存预测与发货计划分别存放</span></h2>
    <div class="panel"><div class="panel-h"><h3>半月销量计划 · 20期（26年7月上—27年4月下）</h3><span class="hint">可编辑；修改不影响实际销量、发货计划或库存</span></div>
      ${scope.length ? table('tbl-d-half', halfCols, scope, { wrapCls: 'auto-h', fz1w: 60 }) : `<div class="empty"><h3>所选国家没有半月计划区</h3><div>AE/SA 原表未设该区，不补成 20 期。</div></div>`}</div>
    <div class="panel"><div class="panel-h"><h3>财年月目标 APR—MAR</h3>${tag('warn', '财年起止年份待确认', 'warn')}<span class="hint">与实际对照请在国家主表“未来计划/目标”中选择对照假设</span></div>
      ${scope.length ? table('tbl-d-fiscal', fiscalCols, scope, { wrapCls: 'auto-h', fz1w: 60 }) : `<div class="empty"><h3>所选国家没有财年月目标区</h3></div>`}</div>
    <div class="panel"><div class="panel-h"><h3>总销量右侧区块</h3>${layerTag('sku')}<span class="hint">三块分别展示，不合并成一组 40 期</span></div>
      <div class="panel-b stack">
        <div><div class="row small" style="margin-bottom:6px"><b>DL:EE · 20期国家半月计划汇总</b><span class="muted">DL:DQ 旧期源表为空（显示“空”，不补0）；DR:EE 按源公式描述汇总 US/CA/EU/UK/AU 同名半月字段，随上方编辑实时变化</span></div>${tblRow('国家预测汇总', 'DL:EE', dlee, D.HALF)}</div>
        <div><div class="row small" style="margin-bottom:6px"><b>EG:EU · 另15期保存预测（至27年2月上）</b><span class="muted">保存数值，不是机器预测，不与上一块互相覆盖</span></div>${tblRow('保存预测', 'EG:EU', p.saved15, D.HALF15)}</div>
        <details><summary class="small"><b>CR:DK · 20期净缺口</b> <span class="muted">采购计算关联区，本轮排除，仅回查源值</span></summary><div style="margin-top:6px">${tblRow('净缺口(回查)', 'CR:DK · 不重算', p.netGap, D.HALF, 'excluded')}</div></details>
      </div></div>
    <div class="panel"><div class="panel-h"><h3>变体比例与年销量依赖</h3><span class="hint">国家层按原分组；总销量 K 列：${variantHtml(p.variant)}</span></div>
      ${vRows.length ? table('tbl-d-var', vCols, vRows, { wrapCls: 'auto-h' }) : '<div class="empty">该SKU所在国家没有变体比例字段</div>'}</div>
  </section>`;
}

function secPlan(p, ls, d) {
  const scope = ls.filter(l => planOf(l.lid));
  const dm = domesticOf(p.pid);
  const total = sumNums(scope.map(l => planQty(l.lid)));
  const pipe = l => { const r = { created: 0, shipped: 0, diff: 0 }; batchLinesOf(l.lid).forEach(({ b, ln }) => { if (b.status === 'created') r.created += ln.declared; else if (b.status === 'shipped') r.shipped += ln.declared; else if (ln.received != null) r.diff += ln.current; }); return r; };
  const cols = [
    { key: 'cc', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
    { key: 'pid', label: '计划ID / 版本', cls: 'l mono', render: l => `${planOf(l.lid).planId} · v${planOf(l.lid).version}` },
    { key: 'qty', label: '计划量', sub: '本次发货量 / AE备货数量', tdCls: () => 'edit-c', render: l => editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.country} 本次计划量` }) },
    { key: 'box', label: '箱数', render: boxCell },
    { key: 'hx', label: '补货后可售天数', sub: 'US 局部公式', render: l => { if (!D.CMAP[l.country].half) return V('NF'); const x = daysAfterOf(l.lid); if (x.why && x.v !== 'PENDING') return tag('warn', x.why, 'warn'); return `<span data-derived="hx-${l.lid}">${x.v === 'PENDING' ? V('PENDING') : fmt1(x.v)}</span>`; } },
    { key: 'note', label: '备注', cls: 'l', tdCls: () => 'edit-c', render: noteInput },
    { key: 'st', label: '计划状态', cls: 'l', render: l => planStatusTag(l.lid) },
    { key: 'by', label: '最后修改', cls: 'l small', render: l => `${esc(planOf(l.lid).editedBy || '—')} · ${esc(planOf(l.lid).updatedAt)}` },
    { key: 'c1', label: '已建货件待发', sub: '申报量', render: l => V(pipe(l).created, { keepZero: true }) },
    { key: 'c2', label: '已发未接收', render: l => V(pipe(l).shipped, { keepZero: true }) },
    { key: 'c3', label: '接收差异', sub: '带符号', render: l => V(pipe(l).diff, { keepZero: true }) },
  ];
  return `<section class="sec" id="sec-plan"><h2 class="sec-title">发货计划 ${layerTag('listing')}</h2>
    <div class="grid3" style="margin-bottom:12px">
      <div class="metric"><div class="k">各国计划合计（含未保存）</div><div class="v" data-derived="ptotal-${p.pid}">${fmt(total)}</div><div class="d">${scope.map(l => `${l.country} ${planQty(l.lid) ?? '—'}`).join(' · ')}</div></div>
      <div class="metric"><div class="k">对同一份国内现货核对</div><div class="v">${fmt(dm.avail)}</div><div class="d" data-derived="pcheck-${p.pid}">${total > dm.avail ? `计划超出现货 ${fmt(total - dm.avail)}（演示核对，非原 HW 公式）` : '现货可覆盖计划合计（演示核对）'}</div></div>
      <div class="metric"><div class="k">计划不会改变</div><div class="v" style="font-size:14px;font-weight:500;line-height:1.5">FBA · 国内真实库存 · 实际在途 · 真实货件</div></div>
    </div>
    <div class="panel">${scope.length ? table('tbl-d-plan', cols, scope, { wrapCls: 'auto-h' }) : '<div class="empty">该 SKU 所在国家没有可编辑的计划字段（SA 原表未设补货数量区）</div>'}
      <div class="note">${icon('info')} “计划→已建货件待发→已发→接收差异”分开显示：新建批次按申报量导入，不等于实际已发货。计划何时冲销、如何对应部分执行仍待业务确认。</div></div></section>`;
}
function planStatusTag(lid) { const p = planOf(lid); if (!p) return ''; const m = { draft: ['mute', '草稿'], confirmed: ['ok', '已确认（示例状态）'], partial: ['info', '部分执行（示例）'] }[p.status] || ['mute', p.status]; return tag(m[0], m[1]) + (isDirtyPlan(lid) ? ' ' + tag('warn', '未保存', 'edit') : '') + (S.remote[lid] ? ' ' + tag('bad', '同事已改', 'people') : ''); }

function secBatch(p, ls, d) {
  const rows = []; ls.forEach(l => batchLinesOf(l.lid).forEach(x => rows.push({ ...x, l })));
  rows.sort((a, b) => a.l.country.localeCompare(b.l.country) || a.b.bizDate.localeCompare(b.b.bizDate));
  const cols = [
    { key: 'cc', label: '国家', cls: 'l', render: r => `<b>${r.l.country}</b>` },
    { key: 'b', label: '业务批次', cls: 'l', render: r => `<button class="link" data-act="batch" data-bid="${r.b.bid}">${esc(r.b.label)}</button> <span class="mono tiny muted">${r.b.bizDate}</span>` },
    { key: 'st', label: '批次状态', cls: 'l', render: r => tag(BSTATUS[r.b.status][0], BSTATUS[r.b.status][1]) },
    { key: 'ship', label: '货件', cls: 'l mono', render: r => esc(r.ln.shipId) },
    { key: 'msku', label: 'MSKU', cls: 'l mono', render: r => esc(r.l.msku) },
    { key: 'dec', label: '原申报/原发货量', sub: '归档', render: r => V(r.ln.declared) },
    { key: 'rec', label: '已接收', render: r => r.ln.writtenOff ? tag('mute', '快照未列出·核销0') : (r.ln.received == null ? V(null, { nullText: '未开始' }) : V(r.ln.received, { keepZero: true })) },
    { key: 'cur', label: '当前值', sub: '带符号', render: r => `<b>${V(r.ln.current, { keepZero: true })}</b>` },
    { key: 'in', label: '计入在途', cls: 'c', render: r => `<label class="chk"><input type="checkbox" id="dbs-${r.b.bid}-${r.l.lid}" data-in="bsel" data-bid="${r.b.bid}" ${isSelected(r.b) && selOf(r.b.country) != null ? 'checked' : ''} ${!canEdit() ? 'disabled' : ''}>${selOf(r.b.country) == null ? '<span class="tiny muted">原范围</span>' : ''}</label>` },
    { key: 'rm', label: '提醒', cls: 'c', render: r => r.ln.received != null && r.ln.current !== 0 ? tag(r.ln.current < 0 ? 'bad' : 'warn', r.ln.current < 0 ? '多收' : '少收', 'warn') : '' },
  ];
  return `<section class="sec" id="sec-batch"><h2 class="sec-title">批次 / 在途 ${layerTag('listing')}</h2>
    <div class="panel">${rows.length ? table('tbl-d-batch', cols, rows, { wrapCls: 'auto-h' }) : '<div class="empty">该SKU没有批次记录</div>'}
    <div class="note">${icon('info')} “计入在途”按国家整批生效，与国家主表“批次与在途”是同一份选择状态。当前在途只累加所选批次的当前值；原申报量是历史，不重复计入。</div></div></section>`;
}

function secStock(p, ls, d) {
  const raw = D.DOMESTIC_RAW.filter(r => r.sku === p.sku);
  const rawCols = [
    { key: 'dept', label: '产品标签/部门', cls: 'l', render: r => esc(r.dept) }, { key: 'wh', label: '仓库', cls: 'l', render: r => esc(r.wh) },
    { key: 'a', label: '可用量', render: r => V(r.avail, { keepZero: true }) }, { key: 'p', label: '待到货', render: r => V(r.pending, { keepZero: true }) },
    { key: 'use', label: '业务统计', cls: 'l', render: r => r.dept !== '亚马逊二部' ? tag('mute', '不纳入：非亚马逊二部') : r.wh === '亚马逊仓' ? tag('ok', '国内现货 / 采购在途') : D.TRANSFER_WH.includes(r.wh) ? tag('info', '可调拨（白名单）') : tag('mute', '不纳入：非白名单仓') },
  ];
  const fba = D.FBA_RAW.filter(r => ls.some(l => l.lid === r.lid));
  const fbaCols = [
    { key: 'site', label: 'ERP站点', cls: 'l', render: r => esc(r.site) }, { key: 'phy', label: '物理/业务国家', cls: 'l', render: r => `${esc(r.physical)} → ${esc(L(r.lid).country)}` },
    { key: 'msku', label: 'MSKU', cls: 'l mono', render: r => esc(r.msku) }, { key: 'v', label: 'FBA可用库存', sub: '映射为“FBA可售库存”', render: r => V(r.fbaAvail) },
    { key: 'u', label: '采用', cls: 'l', render: r => r.used ? tag('ok', '采用') : tag('mute', '重复呈现·不相加') },
  ];
  const agCols = [
    { key: 'cc', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
    { key: 'a', label: '180天以内', render: l => V(l.aging.lt180) }, { key: 'b', label: '180–365天', render: l => V(l.aging.m180_365) }, { key: 'c', label: '365天以上', render: l => V(l.aging.gt365) }, { key: 'v', label: '180+货值', sub: '原值回查', render: l => V(l.value180) },
  ];
  const us = ls.filter(l => l.country === 'US');
  return `<section class="sec" id="sec-stock"><h2 class="sec-title">库存明细</h2>
    <div class="grid2">
      <div class="panel"><div class="panel-h"><h3>国内库存原始明细</h3>${layerTag('product')}<span class="hint">全部部门原始保留；业务统计只纳入“亚马逊二部”</span></div>${table('tbl-d-dom', rawCols, raw, { wrapCls: 'auto-h' })}</div>
      <div class="panel"><div class="panel-h"><h3>FBA · ERP 导出</h3>${layerTag('listing')}<span class="hint">EU 共享池在多个站点重复出现，只取 DE</span></div>${table('tbl-d-fba', fbaCols, fba, { wrapCls: 'auto-h' })}</div>
    </div>
    <div class="grid2" style="margin-top:14px">
      <div class="panel"><div class="panel-h"><h3>库龄</h3><span class="hint">同 Listing/ASIN 重复 MSKU 行按最大值，不累加</span></div>${table('tbl-d-age', agCols, ls, { wrapCls: 'auto-h' })}</div>
      <div class="panel"><div class="panel-h"><h3>US AWD / 海外仓</h3><span class="hint">AWD = 可用 + 预留 + 转往FBA；海外仓另列</span></div>
        ${us.length ? `<div class="panel-b">${us.map(l => `<dl class="kv"><dt>MSKU</dt><dd class="mono">${esc(l.msku)}</dd><dt>Available / Reserved / Outbound</dt><dd>${fmt(l.awd.available)} / ${fmt(l.awd.reserved)} / ${fmt(l.awd.outbound)}</dd><dt>AWD 合计（AG）</dt><dd><b>${fmt(l.awd.available + l.awd.reserved + l.awd.outbound)}</b> ${S.freshness.find(f => f.key === 'awd').state === 'stale' ? tag('warn', '沿用 ' + S.freshness.find(f => f.key === 'awd').date) : ''}</dd><dt>海外仓（AH）</dt><dd>${fmt(l.overseas)}</dd><dt>U 列源值</dt><dd>${fmt(l.awdOverseasSrc)}${l.awdOverseasSrc !== l.awd.available + l.awd.reserved + l.awd.outbound + l.overseas ? ' ' + tag('warn', '与组成不一致·待核对', 'warn') : ''}</dd></dl>`).join('<hr style="border:0;border-top:1px solid var(--line);margin:10px 0">')}</div>` : '<div class="empty">该SKU没有 US 记录</div>'}</div>
    </div></section>`;
}

function secSource(p, ls, d, iss) {
  const logs = S.log.filter(x => x.pid === p.pid);
  const idCols = [
    { key: 'cc', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` }, { key: 'lid', label: '稳定ID', cls: 'l mono', render: l => `${l.lid}` },
    { key: 'sku', label: 'SKU', cls: 'l mono', render: l => esc(l.sku) }, { key: 'asin', label: 'ASIN', cls: 'l mono', render: l => esc(l.asin) }, { key: 'msku', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
    { key: 'of', label: '负责人原字段', cls: 'l', render: l => `${esc(ownerFieldOf(l.country))}：${ownerHtml(l)}` },
    { key: 'g', label: '产品等级/标签', cls: 'l', render: l => `${esc(l.grade)} · ${l.labels.map(esc).join('、')}` },
    { key: 'row', label: '源行', cls: 'l mono', render: l => `${l.country}!第${l.srcRow}行` },
    { key: 'cols', label: '来源列（本输入版本）', cls: 'l small', render: l => { const s = D.CMAP[l.country].src; return esc(`身份 ${s.id} · 库存 ${s.inv}${s.m2025 ? ' · 2025月 ' + s.m2025 : ''}${s.half ? ' · 半月 ' + s.half : ''}`); } },
  ];
  return `<section class="sec" id="sec-src"><h2 class="sec-title">资料 / 来源</h2>
    <div class="grid2">
      <div class="panel"><div class="panel-h"><h3>商品资料</h3>${layerTag('product')}</div><div class="panel-b"><dl class="kv">
        <dt>稳定商品ID</dt><dd class="mono">${p.pid}</dd><dt>领星SKU</dt><dd class="mono">${esc(p.sku)}</dd><dt>品名</dt><dd>${esc(p.name)}</dd>
        <dt>装率</dt><dd>${p.packRate ? `${p.packRate}（箱规 B/L 查找）` : tag('warn', '缺装率', 'warn')}</dd><dt>尺寸分段</dt><dd>${esc(p.size)}</dd>
        <dt>产品等级</dt><dd>${esc(p.grade)}（人工值，不自动重新分级）</dd><dt>变体组</dt><dd>${p.group ? esc(p.group) + '（原公式指定组）' : '独立商品'}</dd>
        <dt>总销量负责人（J列）</dt><dd>${esc(p.totalOwner)} <span class="tiny muted">与各国 F 列分别保存，不互相覆盖</span></dd>
        <dt>原成本/采购价</dt><dd><span class="muted">原表回查保留；演示不提供金额，本轮不重算</span></dd>
      </dl></div></div>
      <div class="panel"><div class="panel-h"><h3>逐模块来源日期</h3></div><div class="panel-b"><dl class="kv">${S.freshness.map(f => `<dt>${esc(f.label)}</dt><dd>${f.date} ${f.state === 'stale' ? tag('warn', '沿用旧周期', 'warn') : f.state === 'blocked' ? tag('bad', '本次阻断') : tag('ok', '已更新')}${f.note ? ` <span class="tiny muted">${esc(f.note)}</span>` : ''}</dd>`).join('')}</dl></div></div>
    </div>
    <div class="panel"><div class="panel-h"><h3>身份与来源映射</h3>${layerTag('listing')}<span class="hint">匹配键：国家 + SKU + ASIN + MSKU；不凭行号、品名或 SKU 前缀猜身份</span></div>${table('tbl-d-id', idCols, ls, { wrapCls: 'auto-h' })}</div>
    <div class="grid2" style="margin-top:14px">
      <div class="panel"><div class="panel-h"><h3>异常与待核对</h3><span class="hint">${iss.length} 项</span></div><div class="panel-b">${iss.length ? `<ul class="clean">${iss.map(i => `<li>${tag(i.level === 'error' ? 'bad' : 'warn', i.module)} <b>${esc(i.title)}</b><div class="small muted">${esc(i.detail)} · 来源 ${esc(i.source)}</div></li>`).join('')}</ul>` : '<span class="muted">无</span>'}</div></div>
      <div class="panel"><div class="panel-h"><h3>修改记录（本次演示）</h3><span class="hint">只记录本页内存中的演示保存</span></div><div class="panel-b">${logs.length ? `<ul class="clean">${logs.map(x => `<li><span class="mono small">${x.at}</span> ${esc(x.who)}：${esc(x.what)}</li>`).join('')}</ul>` : '<span class="muted">暂无。保存计划修改后在此出现。</span>'}
        ${ls.some(l => S.remote[l.lid]) ? `<div class="callout warn" style="margin-top:8px">${icon('warn')}<div>模拟：另一位同事已更新该 SKU 的计划记录。保存你的修改时会提示版本冲突。</div></div>` : ''}</div></div>
    </div></section>`;
}
