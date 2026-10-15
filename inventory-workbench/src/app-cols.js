/* ========== 列配置（参照领星 ERP：分组勾选 + 已选排序 + 固定列 + 模板） ========== */
const COL_GROUPS = ['商品信息', '库存', '销量', '计划与发货', '状态'];
const PIN_MAX = 4;
/** 列目录。cc 为国家时：副标题写本国源列，appl 为 false 的列在该国视图中不出现（不补造无字段列）。cc 为空（跨国人员视图）时逐行显示“无字段”。 */
function colCatalog(cc, listAttr) {
  const cfg = cc ? D.CMAP[cc] : null;
  const src = cfg ? cfg.src : {};
  const cf = l => D.CMAP[l.country];
  const nextHalf = D.HALF.findIndex(h => h.start > S.baseDate);
  const wkLast = D.WEEKS.length - 1;
  const sel = cc ? selOf(cc) : undefined;
  const planCol = cfg && cfg.stocking ? '备货数量' : '本次发货量';
  const C = [
    // 商品信息
    { key: 'country', g: '商品信息', label: '国家', cls: 'l', render: l => `<b>${l.country}</b>` },
    { key: 'sku', g: '商品信息', label: 'SKU', sub: '领星SKU', lock: true, cls: 'l', sort: true, render: l => skuCell(l, listAttr) },
    { key: 'name', g: '商品信息', label: '品名', cls: 'l', render: nameCell },
    { key: 'asin', g: '商品信息', label: 'ASIN', cls: 'l mono', render: l => esc(l.asin) },
    { key: 'msku', g: '商品信息', label: 'MSKU', cls: 'l mono', render: l => esc(l.msku) },
    { key: 'owner', g: '商品信息', label: cfg ? cfg.ownerField : '负责人', sub: cfg ? `${src.id ? 'F列 · ' : ''}原字段名` : '原字段名随国家不同', cls: 'l', sort: true,
      render: l => cfg ? ownerHtml(l) : `${ownerHtml(l)} <span class="tiny muted">${esc(cf(l).ownerField)}</span>${l.country === 'EU' ? ' ' + tag('line', '发货角色', null, 'EU 原字段为“负责人（发货）”，不是销售负责人') : ''}` },
    { key: 'grade', g: '商品信息', label: '产品等级', sub: '人工值', cls: 'c', render: l => esc(l.grade) },
    { key: 'labels', g: '商品信息', label: '原产品标签', cls: 'l', render: l => l.labels.map(x => tag('line', x)).join(' ') },
    { key: 'size', g: '商品信息', label: '尺寸分段', cls: 'l', render: l => esc(P(l.pid).size) },
    { key: 'pack', g: '商品信息', label: '装率', sub: '箱规 B/L 查找', render: l => P(l.pid).packRate ? V(P(l.pid).packRate) : tag('warn', '缺装率', 'warn') },
    { key: 'variant', g: '商品信息', label: '变体比例', sub: 'G列', appl: c => c.variant, cls: 'l', render: l => variantHtml(l.variant) },
    { key: 'row', g: '商品信息', label: '源行', cls: 'c', render: l => `<span class="mono">${l.srcRow}</span>` },
    // 库存
    { key: 'fba', g: '库存', label: 'FBA可售', sub: cfg && cfg.fbaPool ? 'EU 共享池 · 取 DE' : '源“FBA可用库存”', sort: true, render: l => V(l.fba) },
    { key: 'transit', g: '库存', label: '当前在途', sub: !cfg ? '按各国所选批次' : sel == null ? '保留原范围' : `所选 ${sel.length} 批`, sort: true, render: l => V(transitOf(l.lid), { keepZero: true }) },
    { key: 'dom', g: '库存', label: '国内现货', sub: '共享池·引用', appl: c => c.domestic, title: '国内库存是跨国共享的 SKU 库存池：此处只是引用，全局汇总只计一次', render: l => !cf(l).domestic ? V('NF') : (l.domesticBlank ? `${V(null, { nullText: '空白' })} ${tag('warn', '待核对')}` : V(P(l.pid).domestic.avail, { keepZero: true })) },
    { key: 'transfer', g: '库存', label: '调拨库存', sub: '5 个白名单仓', appl: c => c.tier === 'full', render: l => cf(l).tier === 'full' ? V(domesticOf(l.pid).transfer, { keepZero: true }) : V('NF') },
    { key: 'a1', g: '库存', label: '180天以内', render: l => V(l.aging.lt180) },
    { key: 'a2', g: '库存', label: '180–365天', render: l => V(l.aging.m180_365) },
    { key: 'a3', g: '库存', label: '365天以上', render: l => V(l.aging.gt365) },
    { key: 'v180', g: '库存', label: '180+库龄货值', sub: '原值回查', render: l => V(l.value180) },
    { key: 'cover', g: '库存', label: '可撑天数', sub: '演示估算 · FBA+所选在途', title: '条形：深色 = FBA 可撑天数，红色 = 到仓前断档，浅色 = 在途到仓后可撑；竖线 = 补货线（运输期 + 安全 14 天，示例参数）。演示估算，非原公式', appl: c => c.half, sort: true, cls: 'l cv-c', render: l => coverCell(l) },
    { key: 'daysNow', g: '库存', label: 'FBA当前可售天数', sub: '源值·原公式待接入', appl: c => c.half, render: l => cf(l).half ? (l.daysNow == null ? tag('warn', '均销为0') : V(l.daysNow)) + (S.staleFba ? ' ' + tag('warn', '依赖旧库存') : '') : V('NF') },
    { key: 'daysTotal', g: '库存', label: 'FBA共计可售天数', sub: '源值·原公式待接入', appl: c => c.half, render: l => cf(l).half ? (l.daysTotal == null ? tag('warn', '均销为0') : V(l.daysTotal)) : V('NF') },
    { key: 'awd', g: '库存', label: 'AWD可用库存', sub: 'AG · 可用+预留+转FBA', appl: c => c.awd, render: l => l.awd ? `${V(l.awd.available + l.awd.reserved + l.awd.outbound)} <button class="link small" data-act="awd" data-lid="${l.lid}">组成</button>` : V('NF') },
    { key: 'overseas', g: '库存', label: '海外仓总数量', sub: 'AH', appl: c => c.awd, render: l => l.awd ? V(l.overseas, { keepZero: true }) : V('NF') },
    { key: 'awdU', g: '库存', label: 'AWD&海外仓总数', sub: 'U · 源值', appl: c => c.awd, render: l => { if (!l.awd) return V('NF'); const s = l.awd.available + l.awd.reserved + l.awd.outbound + l.overseas; return `${V(l.awdOverseasSrc)}${s !== l.awdOverseasSrc ? ' ' + tag('warn', '≠AG+AH', 'warn', `组成合计 ${fmt(s)}，待核对`) : ''}`; } },
    // 销量
    { key: 'trend', g: '销量', label: '趋势图', sub: '近 18 个月月销量', cls: 'c spark-c', render: l => sparkCell(l) },
    { key: 'avg4', g: '销量', label: '近4周均销', sub: cfg && src.avg ? `${(src.avg.split('/')[1] || '').trim()} · 源值` : '源值', appl: c => c.half, sort: true, render: l => cf(l).half ? V(l.avg4, { keepZero: true }) : V('NF') },
    { key: 'weight', g: '销量', label: '加权系数', sub: cfg && src.avg ? `${src.avg.split('/')[0].trim()} · 源值` : '源值', appl: c => c.half, render: l => cf(l).half ? l.weight.toFixed(2) : V('NF') },
    { key: 'wLatest', g: '销量', label: `最新周 W${D.WEEKS[wkLast].week}`, flag: `${D.WEEKS[wkLast].start.slice(5).replace('-', '/')}–${D.WEEKS[wkLast].end.slice(5).replace('-', '/')}`, appl: c => c.weeks, render: l => l.weekly ? V(l.weekly[wkLast]) : V('NF') },
    { key: 'm9', g: '销量', label: '2026-09', sub: '月实际', appl: c => c.monthYears.includes(2026), sort: true, render: l => V(l.monthly[2026] ? l.monthly[2026][8] : 'NF') },
    { key: 'm10', g: '销量', label: '2026-10', flag: curMonthLabel(), appl: c => c.monthYears.includes(2026), render: l => V(l.monthly[2026] ? l.monthly[2026][9] : 'NF') },
    { key: 'y2025', g: '销量', label: '2025年总销量', sub: '年度源值', render: l => V(l.annual[2025] ?? 'NF') },
    { key: 'y2026', g: '销量', label: '2026年总销量', flag: curMonthLabel(), title: `${curMonthLabel()}，非全年合计`, render: l => V(l.annual[2026] ?? 'NF') },
    // 计划与发货
    { key: 'half', g: '计划与发货', label: '下期计划', flag: nextHalf >= 0 ? D.HALF[nextHalf].label : '', sub: '下一期半月销售计划', appl: c => c.half, render: l => S.half[l.lid] && nextHalf >= 0 ? V(S.half[l.lid][nextHalf], { nullText: '未设置' }) : V('NF') },
    { key: 'plan', g: '计划与发货', label: planCol, sub: !cfg ? '人工计划' : cfg.stocking ? `AE · ${String(src.stocking || 'I').split(' ')[0]}列` : src.plan ? `${src.plan.split(':')[0]}列 · 人工` : '人工计划', appl: c => c.half || c.stocking, sort: true, tdCls: l => planOf(l.lid) ? 'edit-c' : '', render: l => planOf(l.lid) ? editNum('plan', l.lid, planQty(l.lid), { dirty: isDirtyPlan(l.lid), aria: `${l.country} ${l.sku} ${l.msku} ${cf(l).stocking ? '备货数量' : '本次发货量'}` }) : V(null, { nullText: '原表未设' }) },
    { key: 'box', g: '计划与发货', label: '箱数', sub: !cfg ? '仅 US 局部已证' : cc === 'US' ? 'J=HT/I（局部已证）' : '示例·未逐国核验', appl: c => c.half || c.stocking, render: boxCell },
    { key: 'note', g: '计划与发货', label: '备注', cls: 'l', appl: c => c.half || c.stocking, tdCls: l => planOf(l.lid) ? 'edit-c' : '', render: noteInput },
    { key: 'enough', g: '计划与发货', label: '国内够发', sub: '国库充盈 · 源值', appl: c => c.half, cls: 'c', render: l => cf(l).half ? esc(l.domesticEnough) : V('NF') },
    { key: 'td', g: '计划与发货', label: '运输提前期', sub: 'D1 · 示例参数', appl: c => !!c.transitDays, render: l => cf(l).transitDays ? `${cf(l).transitDays} 天` : V('NF') },
    { key: 'sea', g: '计划与发货', label: '运输期末库存', sub: cfg && src.sea ? `${src.sea} · 源值` : '源值', appl: c => c.half, render: l => cf(l).half ? V(l.seaEnd, { keepZero: true }) : V('NF') },
    { key: 'hx', g: '计划与发货', label: '补货后可售天数', sub: !cfg ? '仅 US 局部已证' : cc === 'US' ? 'HX=(HS+HT)/(HO/7)' : '原公式待接入', appl: c => c.half, render: l => { if (!cf(l).half) return V('NF'); const d = daysAfterOf(l.lid); if (d.why && d.v !== 'PENDING') return tag('warn', d.why, 'warn'); return `<span data-derived="hx-${l.lid}">${d.v === 'PENDING' ? V('PENDING') : fmt1(d.v)}</span>`; } },
    { key: 'me', g: '计划与发货', label: '未来月末剩余', sub: cfg && src.monthEnd ? `${src.monthEnd} · 源值` : '源值·三个月', appl: c => c.half, cls: 'l', render: l => cf(l).half ? l.monthEnd.map(x => fmt(x)).join(' / ') : V('NF') },
    { key: 'med', g: '计划与发货', label: '月底可售天数', sub: cfg && src.days ? `${src.days} · 源值` : '源值·三个月', appl: c => c.half, cls: 'l', render: l => cf(l).half ? l.monthEndDays.map(x => x == null ? '—' : fmt(x)).join(' / ') : V('NF') },
    { key: 'sug', g: '计划与发货', label: '建议', sub: '源值·不新增算法', appl: c => c.half, cls: 'l', render: l => cf(l).half ? (l.suggest ? esc(l.suggest) : V(null)) : V('NF') },
    // 状态
    { key: 'st', g: '状态', label: '状态', cls: 'l', render: statusCell },
  ];
  return cfg ? C.filter(c => !c.appl || c.appl(cfg)) : C;
}
const COL_DEFAULTS = {
  overview: { cols: ['sku', 'name', 'owner', 'trend', 'cover', 'fba', 'transit', 'dom', 'avg4', 'm10', 'plan', 'st'], pin: ['sku', 'name'] },
  plan: { cols: ['sku', 'name', 'msku', 'pack', 'plan', 'box', 'note', 'dom', 'enough', 'avg4', 'td', 'sea', 'hx', 'me', 'med', 'sug', 'st'], pin: ['sku', 'name'] },
  stock: { cols: ['sku', 'name', 'fba', 'a1', 'a2', 'a3', 'v180', 'dom', 'transfer', 'daysNow', 'daysTotal', 'transit', 'awd', 'overseas', 'awdU'], pin: ['sku', 'name'] },
  info: { cols: ['sku', 'name', 'row', 'asin', 'msku', 'owner', 'variant', 'size', 'pack', 'box', 'grade', 'labels'], pin: ['sku', 'name'] },
  people: { cols: ['country', 'sku', 'name', 'msku', 'owner', 'cover', 'fba', 'transit', 'plan', 'st'], pin: ['country', 'sku'] },
};
const COL_VIEWS = Object.keys(COL_DEFAULTS);
const COL_VIEW_NAME = { overview: '综合总览', plan: '发货计划', stock: '库存明细', info: '商品资料', people: '运营人员视图' };
const BUILTIN_TPL = [
  { name: '库存核对', cols: ['sku', 'name', 'fba', 'transit', 'dom', 'transfer', 'a1', 'a2', 'a3', 'daysNow', 'daysTotal', 'awd'], pin: ['sku'] },
  { name: '发货决策', cols: ['sku', 'name', 'cover', 'trend', 'avg4', 'fba', 'transit', 'dom', 'half', 'plan', 'box', 'hx', 'enough', 'note', 'st'], pin: ['sku', 'name'] },
  { name: '销量对比', cols: ['sku', 'name', 'owner', 'trend', 'avg4', 'weight', 'wLatest', 'm9', 'm10', 'y2025', 'y2026'], pin: ['sku', 'name'] },
];
const ALL_COL_KEYS = new Set(colCatalog(null, '').map(c => c.key));
/** 校验从浏览器存储读回的配置：结构不对或含未知列时丢弃，避免旧版本数据让页面崩溃 */
function cleanCfg(c) {
  if (!c || !Array.isArray(c.cols) || !Array.isArray(c.pin)) return null;
  const cols = c.cols.filter(k => typeof k === 'string' && ALL_COL_KEYS.has(k));
  if (!cols.length) return null;
  if (!cols.includes('sku')) cols.unshift('sku');
  return { cols: [...new Set(cols)], pin: c.pin.filter(k => cols.includes(k)).slice(0, PIN_MAX) };
}
S.colcfg = (() => { const raw = store.get('colcfg', {}); const o = {}; if (raw && typeof raw === 'object') COL_VIEWS.forEach(v => { const c = cleanCfg(raw[v]); if (c) o[v] = c; }); return o; })();
S.tpls = (() => { const raw = store.get('tpls', []); return Array.isArray(raw) ? raw.map(t => t && typeof t.name === 'string' ? Object.assign({ name: t.name.slice(0, 40) }, cleanCfg(t)) : null).filter(t => t && t.cols) : []; })();
function colCfg(view) { return S.colcfg[view] || COL_DEFAULTS[view]; }
/** 按配置挑出并排序列；固定列排在最前，带 pin 序号。本国不适用的列不出现。 */
function configuredCols(view, cc, listAttr) {
  const cat = colCatalog(cc, listAttr); const by = Object.fromEntries(cat.map(c => [c.key, c]));
  const cfg = colCfg(view);
  const pin = cfg.pin.filter(k => cfg.cols.includes(k) && by[k]);
  const order = [...pin, ...cfg.cols.filter(k => !pin.includes(k) && by[k])];
  return order.map((k, i) => Object.assign({}, by[k], { pin: i < pin.length ? i : null, pinLast: i === pin.length - 1 }));
}
function colBtn(view, cc) { const keys = new Set(colCatalog(cc || null, '').map(c => c.key)); const n = colCfg(view).cols.filter(k => keys.has(k)).length; return `<button class="btn sm" data-act="colcfg" data-view="${view}" title="选择、排序和固定要显示的列">${icon('columns')} 列配置 <span class="tiny muted">${n}</span></button>`; }

/* —— 列配置弹层 —— */
function ccCatalog(e) { return colCatalog(null, '').filter(c => e.view === 'people' || c.key !== 'country'); }
/** 左侧某分组当前可见的字段（搜索过滤后）；“全选/取消”与列表显示共用 */
function ccVisible(e, g) { const q = norm(e.q); return ccCatalog(e).filter(c => c.g === g && (!q || norm(c.label).includes(q) || norm(c.sub || '').includes(q))); }
function openColCfg(view) {
  const c = colCfg(view);
  S.colEdit = { view, cols: c.cols.slice(), pin: c.pin.slice(), q: '', saving: false };
  modal(`<div class="modal-h"><h2 id="cc-title">列配置 · ${COL_VIEW_NAME[view]}</h2><span class="spacer"></span><button class="icon-btn" data-act="close" aria-label="关闭">${icon('close')}</button></div><div id="colcfg-body"></div>`, 'wide colcfg');
  renderColCfg();
}
function ccGroupsHtml(e) {
  const label = c => esc(c.label) + (c.flag ? ` <span class="tiny muted">${esc(c.flag)}</span>` : '');
  const html = COL_GROUPS.map(g => { const items = ccVisible(e, g); if (!items.length) return ''; const allOn = items.every(c => e.cols.includes(c.key));
    return `<div class="cc-group"><div class="cc-gh"><b>${g}</b><button class="link small" data-act="ccgroup" data-g="${g}" data-on="${allOn ? 0 : 1}">${allOn ? '取消' : '全选'}</button></div>
    <div class="cc-items">${items.map(c => `<label class="chk cc-item${c.lock ? ' locked' : ''}" title="${esc(c.sub || '')}"><input type="checkbox" data-in="cccol" data-key="${c.key}" ${e.cols.includes(c.key) ? 'checked' : ''} ${c.lock ? 'disabled' : ''}> ${label(c)}</label>`).join('')}</div></div>`; }).join('');
  return html || `<div class="empty small"><h2>没有匹配“${esc(e.q)}”的字段</h2></div>`;
}
function renderColCfg() {
  const e = S.colEdit; if (!e) return;
  const box = $('#colcfg-body'); if (!box) return;
  const keepL = $('#cc-left') ? $('#cc-left').scrollTop : 0, keepR = $('#cc-right') ? $('#cc-right').scrollTop : 0;
  const by = Object.fromEntries(ccCatalog(e).map(c => [c.key, c]));
  const tpls = [...BUILTIN_TPL.map(t => ({ ...t, builtin: true })), ...S.tpls];
  const pinned = e.pin.filter(k => e.cols.includes(k));
  const ordered = [...pinned, ...e.cols.filter(k => !pinned.includes(k))];
  box.innerHTML = `
    <div class="cc-top"><label class="grp">选择模版 <select class="sel" id="cc-tpl" data-in="cctpl" aria-label="选择模版"><option value="">— 当前配置 —</option><option value="__default">默认（${COL_VIEW_NAME[e.view]}）</option>${tpls.map((t, i) => `<option value="${i}">${esc(t.name)}${t.builtin ? '' : '（我的）'}</option>`).join('')}</select></label>
      <span class="spacer"></span>
      ${e.saving ? `<input class="inp" id="cc-tplname" maxlength="40" placeholder="模版名称" aria-label="模版名称" style="width:160px"><button class="btn sm primary" data-act="cctplsave">保存</button><button class="btn sm" data-act="cctplcancel">取消</button>` : `<button class="link" data-act="cctplnew">保存为新模版</button>`}</div>
    <div class="cc-grid">
      <div class="cc-left" id="cc-left">
        <div class="cc-search">${icon('search')}<input class="inp" id="cc-q" data-in="ccq" placeholder="搜索字段" value="${esc(e.q)}" aria-label="搜索字段" autocomplete="off"></div>
        <div id="cc-groups">${ccGroupsHtml(e)}</div>
        ${e.view !== 'people' ? `<p class="tiny muted" style="margin-top:14px">部分字段只在部分国家存在（如 AWD 仅 US、半月计划仅五国）；在不适用的国家视图中这些列自动隐藏，不补造“无字段”列。</p>` : ''}
      </div>
      <div class="cc-right" id="cc-right">
        <div class="cc-rh"><b>已选（${e.cols.length}）</b><span class="tiny muted">最多可固定 ${PIN_MAX} 项 · 拖拽或用箭头排序</span></div>
        <ol class="cc-list" aria-label="已选列，按显示顺序">${ordered.map((k, i) => { const c = by[k]; if (!c) return ''; const isPin = pinned.includes(k);
          return `<li draggable="${isPin ? 'false' : 'true'}" data-key="${k}" class="${isPin ? 'pinned' : ''}"><span class="cc-handle" aria-hidden="true">⠿</span><span class="cc-idx">${i + 1}</span><span class="cc-name">${esc(c.label)}</span>
            <span class="cc-acts">${isPin ? '' : `<button class="icon-btn" data-act="ccmove" data-key="${k}" data-d="-1" aria-label="上移 ${esc(c.label)}">${icon('up')}</button><button class="icon-btn" data-act="ccmove" data-key="${k}" data-d="1" aria-label="下移 ${esc(c.label)}">${icon('down')}</button>`}
            <button class="icon-btn${isPin ? ' on' : ''}" data-act="ccpin" data-key="${k}" aria-pressed="${isPin}" aria-label="${isPin ? '取消固定' : '固定'} ${esc(c.label)}" title="${isPin ? '取消固定' : '固定在左侧'}">${icon('pin')}</button>
            ${c.lock ? '' : `<button class="icon-btn" data-act="ccdel" data-key="${k}" aria-label="移除 ${esc(c.label)}">${icon('close')}</button>`}</span></li>`; }).join('')}</ol>
      </div>
    </div>
    <div class="modal-f"><button class="btn" data-act="ccreset">恢复默认</button><span class="spacer"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="ccapply">保存并应用</button></div>`;
  $('#cc-left').scrollTop = keepL; $('#cc-right').scrollTop = keepR;
  // 拖拽排序（固定列不参与拖拽）：落点在目标下半部时插到其后，因此可以下移一位或移到末尾
  let drag = null;
  const clearMarks = () => $$('.cc-list li').forEach(x => x.classList.remove('over-top', 'over-bottom'));
  $$('.cc-list li[draggable="true"]').forEach(li => {
    li.addEventListener('dragstart', ev => { drag = li.dataset.key; li.classList.add('dragging'); ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', drag); } catch (x) { /* 部分浏览器不允许 */ } });
    li.addEventListener('dragend', () => { li.classList.remove('dragging'); clearMarks(); });
    li.addEventListener('dragover', ev => { ev.preventDefault(); const r = li.getBoundingClientRect(); const after = ev.clientY > r.top + r.height / 2; clearMarks(); li.classList.add(after ? 'over-bottom' : 'over-top'); });
    li.addEventListener('dragleave', () => li.classList.remove('over-top', 'over-bottom'));
    li.addEventListener('drop', ev => {
      ev.preventDefault(); clearMarks(); const to = li.dataset.key; if (!drag || drag === to) return;
      const r = li.getBoundingClientRect(); const after = ev.clientY > r.top + r.height / 2;
      const a = e.cols.filter(k => k !== drag); a.splice(a.indexOf(to) + (after ? 1 : 0), 0, drag); e.cols = a; renderColCfg();
    });
  });
}
Object.assign(ACT_EXTRA, {
  colcfg: t => openColCfg(t.dataset.view),
  ccgroup: t => {
    const e = S.colEdit; const items = ccVisible(e, t.dataset.g);
    if (t.dataset.on === '1') items.forEach(c => { if (!e.cols.includes(c.key)) e.cols.push(c.key); });
    else { const off = new Set(items.filter(c => !c.lock).map(c => c.key)); e.cols = e.cols.filter(k => !off.has(k)); e.pin = e.pin.filter(k => !off.has(k)); }
    renderColCfg();
  },
  ccmove: t => { const e = S.colEdit; const k = t.dataset.key; const free = e.cols.filter(x => !e.pin.includes(x)); const i = free.indexOf(k), j = i + Number(t.dataset.d); if (j < 0 || j >= free.length) return; [free[i], free[j]] = [free[j], free[i]]; e.cols = [...e.cols.filter(x => e.pin.includes(x)), ...free]; renderColCfg(); const b = $(`.cc-list [data-act="ccmove"][data-key="${k}"][data-d="${t.dataset.d}"]`); b && b.focus(); },
  ccpin: t => { const e = S.colEdit; const k = t.dataset.key; e.pin = e.pin.filter(x => e.cols.includes(x)); if (e.pin.includes(k)) e.pin = e.pin.filter(x => x !== k); else { if (e.pin.length >= PIN_MAX) { toast(`最多固定 ${PIN_MAX} 列`, 'warn'); return; } e.pin.push(k); } renderColCfg(); const b = $(`.cc-list [data-act="ccpin"][data-key="${k}"]`); b && b.focus(); },
  ccdel: t => { const e = S.colEdit; e.cols = e.cols.filter(x => x !== t.dataset.key); e.pin = e.pin.filter(x => x !== t.dataset.key); renderColCfg(); },
  ccreset: () => { const e = S.colEdit; const d = COL_DEFAULTS[e.view]; e.cols = d.cols.slice(); e.pin = d.pin.slice(); renderColCfg(); },
  ccapply: () => {
    const e = S.colEdit; if (!e.cols.includes('sku')) e.cols.unshift('sku');
    S.colcfg[e.view] = { cols: e.cols.slice(), pin: e.pin.filter(k => e.cols.includes(k)).slice(0, PIN_MAX) }; store.set('colcfg', S.colcfg);
    S.colEdit = null; closeModal(); rerenderKeep(); toast(`已应用列配置：${COL_VIEW_NAME[e.view]} 显示 ${e.cols.length} 列`);
  },
  cctplnew: () => { S.colEdit.saving = true; renderColCfg(); const i = $('#cc-tplname'); i && i.focus(); },
  cctplcancel: () => { S.colEdit.saving = false; renderColCfg(); },
  cctplsave: () => { const e = S.colEdit; const n = ($('#cc-tplname').value || '').trim().slice(0, 40); if (!n) { toast('请填写模版名称', 'warn'); return; } S.tpls = S.tpls.filter(t => t.name !== n).concat([{ name: n, cols: e.cols.slice(), pin: e.pin.slice() }]); store.set('tpls', S.tpls); e.saving = false; renderColCfg(); toast(`已保存模版“${esc(n)}”（仅保存在本浏览器）`); },
});
Object.assign(INP_EXTRA, {
  // 只刷新左侧字段列表，不替换搜索框，中文输入法拼写过程不会被打断
  ccq: t => { S.colEdit.q = t.value; const g = $('#cc-groups'); if (g) g.innerHTML = ccGroupsHtml(S.colEdit); },
  cccol: t => { const e = S.colEdit; const k = t.dataset.key; if (t.checked) { if (!e.cols.includes(k)) e.cols.push(k); } else { e.cols = e.cols.filter(x => x !== k); e.pin = e.pin.filter(x => x !== k); } renderColCfg(); const x = $(`input[data-in="cccol"][data-key="${k}"]`); x && x.focus(); },
  cctpl: t => { const e = S.colEdit; const v = t.value; if (!v) return; let tp; if (v === '__default') tp = COL_DEFAULTS[e.view]; else tp = [...BUILTIN_TPL, ...S.tpls][Number(v)]; if (!tp) return; e.cols = tp.cols.filter(k => e.view === 'people' || k !== 'country'); if (e.view === 'people' && !e.cols.includes('country')) e.cols.unshift('country'); e.pin = tp.pin.filter(k => e.cols.includes(k)); renderColCfg(); },
});

/* —— 固定列：渲染后按实际宽度计算 left（同一帧内合并，避免拖动窗口时反复重排） —— */
let pinFrame = 0;
function applyPins() {
  if (pinFrame) return;
  pinFrame = requestAnimationFrame(() => {
    pinFrame = 0;
    $$('table.t[data-pins]').forEach(t => {
      const n = Number(t.dataset.pins); if (!n) return;
      const head = t.tHead.rows[0]; let left = 0; const lefts = [];
      for (let i = 0; i < n; i++) { lefts.push(left); left += head.cells[i].getBoundingClientRect().width; }
      for (const row of t.rows) { for (let i = 0; i < n && i < row.cells.length; i++) { if (row.cells[i].colSpan > 1) break; row.cells[i].style.left = lefts[i] + 'px'; } }
    });
  });
}
