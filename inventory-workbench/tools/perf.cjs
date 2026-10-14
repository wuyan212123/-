/* 真实规模性能检查：node tools/perf.cjs [scale]
   打开 index.html?scale=N（默认 25：约 550 个 SKU、2,600 条 Listing、1 万行国内库存明细），
   逐页测量同步渲染耗时与 DOM 节点数，并测几项高频交互。结果写入 docs/screenshots/perf.json。 */
const path = require('path');
const fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const SCALE = Number(process.argv[2] || 25);
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '?scale=' + SCALE;
(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  const t0 = Date.now(); await page.goto(URL); await page.waitForSelector('#tbl-US-overview'); const loadMs = Date.now() - t0;
  const size = await page.evaluate(() => ({ products: DEMO.PRODUCTS.length, listings: DEMO.LISTINGS.length, domesticRaw: DEMO.DOMESTIC_RAW.length, fbaRaw: DEMO.FBA_RAW.length, us: listingsOf('US').length }));
  const measure = (label, fn) => page.evaluate(([label, src]) => { const f = new Function(src); const t = performance.now(); f(); const ms = performance.now() - t; return { label, ms: Math.round(ms * 10) / 10, nodes: document.querySelectorAll('#main *').length }; }, [label, fn]);
  const steps = [
    ['国家主表 · 综合总览（US）', "S.country='US'; cui('US').view='overview'; go('country');"],
    ['国家主表 · 每页 100 条', "cui('US').size=100; go('country');"],
    ['国家主表 · 月历史（100 条 × 全部年份）', "cui('US').view='month'; go('country');"],
    ['国家主表 · 周历史（全部 125 周）', "cui('US').view='week'; cui('US').wyear='ALL'; go('country');"],
    ['国家主表 · 批次与在途', "cui('US').view='batch'; go('country');"],
    ['本国筛选（输入关键词后重绘）', "cui('US').view='overview'; cui('US').size=12; cui('US').q='acr'; rerenderKeep();"],
    ['SKU 统一详情（含逐年对比图）', "cui('US').q=''; openSku(DEMO.PRODUCTS[0].pid,{country:'US'});"],
    ['运营人员视图（矩阵展开）', "S.people.matrix=true; go('people');"],
    ['全局搜索 “acr”', "S.search.q='acr'; go('search');"],
    ['总销量 · 月历史', "S.total.tab='month'; go('total');"],
    ['库存汇总 · 原总库存', "S.stock.tab='total'; go('stock');"],
    ['库存汇总 · 国内库存（含原始明细）', "S.stock.tab='domestic'; go('stock');"],
    ['库存汇总 · FBA 导出', "S.stock.tab='fba'; go('stock');"],
    ['库存汇总 · 库龄', "S.stock.tab='aging'; go('stock');"],
    ['发货计划（全部展开）', "D.PRODUCTS.forEach(p=>{S.plan.open[p.pid]=true}); go('plan');"],
    ['数据更新 · 发货历史记录', "S.recTab='shiphist'; go('update');"],
    ['数据更新 · 变体比例核验', "S.recTab='variant'; go('update');"],
    ['版本记录（两版本对比）', "S.ver={sel:['V-1005','V-1012']}; go('versions');"],
  ];
  const results = [];
  for (const [label, src] of steps) { results.push(await measure(label, src)); }
  // 编辑联动：在综合总览里改一个计划量
  await page.evaluate(() => { S.plan.open = {}; S.country = 'US'; cui('US').view = 'overview'; go('country'); });
  const editMs = await page.evaluate(() => { const el = document.querySelector('#tbl-US-overview input[data-in="plan"]'); const t = performance.now(); el.value = '96'; el.dispatchEvent(new Event('input', { bubbles: true })); return Math.round((performance.now() - t) * 10) / 10; });
  results.push({ label: '编辑一个计划量（联动箱数、合计）', ms: editMs, nodes: null });
  await browser.close();
  const out = { scale: SCALE, size, loadMs, results, errors };
  const dir = path.join(__dirname, '..', 'docs', 'screenshots'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'perf.json'), JSON.stringify(out, null, 1));
  console.log(`scale=${SCALE}`, JSON.stringify(size), `load=${loadMs}ms`);
  results.forEach(r => console.log(`${String(r.ms).padStart(8)} ms  ${r.nodes == null ? '' : String(r.nodes).padStart(6) + ' nodes  '}${r.label}`));
  if (errors.length) console.log('ERRORS', errors);
})();
