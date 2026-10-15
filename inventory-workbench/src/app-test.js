/* ========== 一比一还原的测试钩子 window.wbTest ==========
   tools/visual.cjs 用它把“原型”和“新实现”打开到同一个界面状态再逐像素对比。
   新实现必须提供同名钩子、同样的状态 ID 与同样的界面状态（见 docs/dev/07-验收与一比一还原.md）。
   约定：每个状态都在“刚加载的页面”上调用一次（工具会为每个状态重新加载页面），不依赖前一个状态。 */
(() => {
  const pidOf = sku => D.PRODUCTS.find(p => p.sku === sku).pid;
  const scrollTo = id => { const el = document.getElementById(id); if (el) { const m = $('#main'); m.scrollTop = el.offsetTop - 12; } };
  const country = (cc, view, extra) => () => { S.country = cc; Object.assign(cui(cc), { view }, extra || {}); go('country'); };
  const STATES = [
    ['country-us-overview', '国家主表 · US · 综合总览', country('US', 'overview')],
    ['country-us-overview-cover-sort', '国家主表 · US · 按可撑天数排序', country('US', 'overview', { sort: { key: 'cover', dir: 1 } })],
    ['country-us-month', '国家主表 · US · 月历史', country('US', 'month')],
    ['country-us-month-heat-hl', '国家主表 · US · 月历史（色阶 + 高亮 10 月）', () => { S.heat = true; S.hl['cm-US'] = 9; country('US', 'month')(); }],
    ['country-us-week', '国家主表 · US · 周历史', country('US', 'week')],
    ['country-us-future', '国家主表 · US · 未来计划/目标', country('US', 'future')],
    ['country-us-plan', '国家主表 · US · 发货计划', country('US', 'plan')],
    ['country-us-batch-list', '国家主表 · US · 批次与在途（清单）', country('US', 'batch')],
    ['country-us-batch-time', '国家主表 · US · 批次与在途（时间线）', country('US', 'batch', { bmode: 'time' })],
    ['country-us-stock', '国家主表 · US · 库存明细', country('US', 'stock')],
    ['country-us-info', '国家主表 · US · 商品资料', country('US', 'info')],
    ['country-ca-batch-empty', '国家主表 · CA · 批次明确空选', () => { S.transitSel.CA = []; country('CA', 'batch')(); }],
    ['country-ae-plan', '国家主表 · AE · 发货计划（部分结构）', country('AE', 'plan')],
    ['country-sa-week', '国家主表 · SA · 周历史（简表）', country('SA', 'week')],
    ['modal-colcfg', '弹层 · 列配置（综合总览）', () => { country('US', 'overview')(); openColCfg('overview'); }],
    ['modal-batch', '弹层 · 批次详情 US 0720', () => { country('US', 'batch')(); batchModal('B-US-2026-07-20'); }],
    ['detail-top', 'SKU 详情 · 顶部（DEMO-ACR-24 · US）', () => openSku(pidOf('DEMO-ACR-24'), { country: 'US' })],
    ['detail-history', 'SKU 详情 · 历史销量', () => { openSku(pidOf('DEMO-ACR-24'), { country: 'US' }); scrollTo('sec-hist'); }],
    ['detail-plan', 'SKU 详情 · 发货计划与库存推演（DEMO-BRS-20 · US）', () => { openSku(pidOf('DEMO-BRS-20'), { country: 'US' }); scrollTo('sec-plan'); }],
    ['detail-batch', 'SKU 详情 · 批次/在途', () => { openSku(pidOf('DEMO-ACR-24'), { country: 'ALL' }); scrollTo('sec-batch'); }],
    ['people', '运营人员视图', () => go('people')],
    ['people-matrix', '运营人员视图 · 人员 × 国家矩阵', () => { S.people.matrix = true; go('people'); }],
    ['search-acr', '全局搜索 · acr', () => { S.search.q = 'acr'; go('search'); }],
    ['search-empty', '全局搜索 · 空结果', () => { S.search.q = 'zzz-无结果'; go('search'); }],
    ['total-month', '总销量 · 月历史', () => { S.total.tab = 'month'; go('total'); }],
    ['total-stock', '总销量 · 库存·周转·货值', () => { S.total.tab = 'stock'; go('total'); }],
    ['total-blocks', '总销量 · 右侧区块', () => { S.total.tab = 'blocks'; go('total'); }],
    ['stock-total', '库存汇总 · 原总库存', () => { S.stock.tab = 'total'; go('stock'); }],
    ['stock-domestic', '库存汇总 · 国内库存', () => { S.stock.tab = 'domestic'; go('stock'); }],
    ['stock-fba', '库存汇总 · FBA·ERP导出', () => { S.stock.tab = 'fba'; go('stock'); }],
    ['stock-aging', '库存汇总 · 库龄', () => { S.stock.tab = 'aging'; go('stock'); }],
    ['stock-awd', '库存汇总 · AWD', () => { S.stock.tab = 'awd'; go('stock'); }],
    ['plan', '发货计划', () => go('plan')],
    ['update', '数据更新与异常', () => { S.upd = null; go('update'); }],
    ['versions', '版本记录', () => go('versions')],
    ['coverage', '原表覆盖与验收', () => go('coverage')],
    ['notes', '方案说明', () => go('notes')],
  ];
  const frames = n => new Promise(r => { const f = () => (n-- <= 0 ? r() : requestAnimationFrame(f)); f(); });
  window.wbTest = {
    /** 状态清单：[{ id, title }] */
    states: () => STATES.map(([id, title]) => ({ id, title })),
    /** 打开到某个状态；返回的 Promise 在图表与固定列绘制完成后结算 */
    open: async id => {
      const s = STATES.find(x => x[0] === id); if (!s) throw new Error('未知状态 ' + id);
      s[2](); await frames(3);
      const t = document.getElementById('toast'); if (t) t.innerHTML = '';
      return true;
    },
  };
})();
