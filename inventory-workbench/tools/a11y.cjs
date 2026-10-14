/* 无障碍检查：node tools/a11y.cjs [axe.min.js 路径]
   用 axe-core 扫描每个页面和主要弹层（浅色、深色各一次），按规则汇总违规。axe-core 需另行安装（npm i axe-core）。 */
const path = require('path');
const fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const axePath = process.argv[2] || (() => { try { return require.resolve('axe-core/axe.min.js'); } catch (e) { return null; } })();
if (!axePath || !fs.existsSync(axePath)) { console.error('找不到 axe-core：npm i axe-core，或把 axe.min.js 路径作为参数传入'); process.exit(2); }
const AXE = fs.readFileSync(axePath, 'utf8');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
const VIEWS = [
  ['国家·综合总览', "S.country='US'; cui('US').view='overview'; go('country');"],
  ['国家·月历史', "cui('US').view='month'; go('country');"],
  ['国家·周历史', "cui('US').view='week'; go('country');"],
  ['国家·未来计划', "cui('US').view='future'; go('country');"],
  ['国家·发货计划', "cui('US').view='plan'; go('country');"],
  ['国家·批次与在途', "cui('US').view='batch'; go('country');"],
  ['国家·库存明细', "cui('US').view='stock'; go('country');"],
  ['国家·商品资料', "cui('US').view='info'; go('country');"],
  ['SA 简表·周历史', "S.country='SA'; cui('SA').view='week'; go('country');"],
  ['SKU 详情', "openSku('P-001',{country:'US'});"],
  ['运营人员视图', "S.people.matrix=true; go('people');"],
  ['全局搜索', "S.search.q='acr'; go('search');"],
  ['总销量', "S.total.tab='month'; go('total');"],
  ['库存汇总·国内', "S.stock.tab='domestic'; go('stock');"],
  ['发货计划', "go('plan');"],
  ['数据更新', "S.upd=null; S.recTab='ledger'; go('update');"],
  ['版本记录', "go('versions');"],
  ['原表覆盖', "go('coverage');"],
  ['方案说明', "go('notes');"],
  ['弹层·列配置', "S.country='US'; cui('US').view='overview'; go('country'); openColCfg('overview');"],
  ['弹层·批次详情', "closeModal(); batchModal('B-US-2026-07-20');"],
];
(async () => {
  const browser = await pw.chromium.launch();
  const summary = {};
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto(URL); await page.waitForSelector('#tbl-US-overview');
    await page.addScriptTag({ content: AXE });
    for (const [label, src] of VIEWS) {
      await page.evaluate(s => new Function(s)(), src); await page.waitForTimeout(80);
      const res = await page.evaluate(async () => { const r = await axe.run(document, { resultTypes: ['violations'] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, ex: v.nodes.slice(0, 2).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 2).join('')) })); });
      res.forEach(v => { const k = v.id; const s = summary[k] || (summary[k] = { impact: v.impact, help: v.help, total: 0, where: new Set(), ex: v.ex }); s.total += v.n; s.where.add(`${scheme}:${label}`); });
    }
    await page.close();
  }
  await browser.close();
  const rows = Object.entries(summary).map(([id, s]) => ({ id, impact: s.impact, help: s.help, total: s.total, pages: s.where.size, where: [...s.where].slice(0, 6), ex: s.ex }));
  rows.sort((a, b) => ({ critical: 0, serious: 1, moderate: 2, minor: 3 }[a.impact] - { critical: 0, serious: 1, moderate: 2, minor: 3 }[b.impact]) || b.total - a.total);
  const dir = path.join(__dirname, '..', 'docs', 'screenshots'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'a11y.json'), JSON.stringify(rows, null, 1));
  if (!rows.length) console.log('axe：无违规');
  rows.forEach(r => { console.log(`[${r.impact}] ${r.id} ×${r.total}（${r.pages} 处）${r.help}`); r.ex.forEach(e => console.log('    ' + e.slice(0, 220))); console.log('    @ ' + r.where.join(' | ')); });
})();
