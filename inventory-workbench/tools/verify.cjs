/* 前端交互验证脚本：node tools/verify.cjs [输出目录]
   用 Playwright 打开 index.html，逐项执行验收场景并截图。只验证前端交互，不代表业务公式或多人服务已通过。 */
const path = require('path');
const fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = process.argv[2] || path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
const results = [];
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`); };

(async () => {
  const browser = await pw.chromium.launch({ });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await page.waitForSelector('#tbl-US-overview');
  const act = async (sel) => { await page.click(sel); await page.waitForTimeout(60); };
  const text = async (sel) => (await page.locator(sel).first().innerText());
  const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1 && document.body.scrollWidth <= document.documentElement.clientWidth + 1);

  // A02 七国
  for (const cc of ['US', 'CA', 'AU', 'UK', 'EU', 'AE', 'SA']) { await act(`[data-act="country"][data-v="${cc}"]`); }
  check('A02', 'SA 页面显示简表覆盖说明', (await text('#main')).includes('SA 简表'));
  await act('[data-act="cview"][data-v="week"]');
  check('UI-15', 'SA 周历史显示“不适用”而非0', (await text('#main')).includes('周历史：不适用'));
  await act('[data-act="cview"][data-v="month"]');
  const saMonth = await text('#tbl-SA-month');
  check('A06', 'SA 月表：2025部分月份“无字段”，2026仅年总量', saMonth.includes('无字段') && saMonth.includes('SA 年度字段'));
  await act('[data-act="country"][data-v="AE"]');
  const ae = await text('#tbl-AE-month');
  check('A06', 'AE 月表从2025起，无2024行', ae.includes('2025') && !/\n2024\t/.test(ae) && !ae.includes('2024'));
  await act('[data-act="country"][data-v="EU"]');
  const eu = await text('#tbl-EU-month');
  check('UI-04', 'EU 不补造2022/2023早年字段', !eu.includes('2022') && !eu.includes('2023'));
  await act('[data-act="country"][data-v="US"]');
  const us = await text('#tbl-US-month');
  check('UI-02', 'US 月表同时展开2022/2023(仅年总量)与2024—2026', ['2022', '2023', '2024', '2025', '2026'].every(y => us.includes(y)) && us.includes('仅年总量'));
  const cuts = await page.locator('#tbl-US-month .cut').count();
  const groups = await page.locator('#tbl-US-month tr.g-start').count();
  check('UI-03', '“截至10/11”只标在 2026×10 记录（每个 Listing 一处）', cuts === groups, `cut=${cuts} groups=${groups}`);
  await act('#tbl-US-month th button[data-m="9"]');
  const hlCount = await page.locator('#tbl-US-month td.hl').count();
  check('UI-03', '点击10月表头高亮所有年份同月，且表头有文字标记', hlCount > 0 && (await page.locator('#tbl-US-month th:has(button[data-m="9"])').innerText()).includes('已高亮'), `hl cells=${hlCount}`);
  check('A06', '缺报月份显示“未提供”而不是0', us.includes('未提供') && (await page.locator('#tbl-US-month .na.np').count()) >= 1);
  await page.screenshot({ path: path.join(OUT, '02-us-month-matrix.png') });

  // 周历史
  await act('[data-act="cview"][data-v="week"]');
  const wk = await text('#tbl-US-week');
  check('A07', '周历史显示起止日期与“最新完整周”', wk.includes('2026-W41') && wk.includes('最新完整周'));
  await act('[data-act="wyear"][data-v="ALL"]');
  const wkAll = await page.locator('#tbl-US-week thead th').count();
  check('A07', '“全部”年份可访问全部已有周', wkAll - 3 === 32 + 52 + 41, `周列=${wkAll - 3}`);
  check('A07', '跨年周标注', (await text('#tbl-US-week')).includes('跨年周'));
  await act('[data-act="wquick"][data-q="last8"]');
  check('A07', '最近8周范围切换', (await page.locator('#tbl-US-week thead th').count()) - 3 === 8);
  await page.screenshot({ path: path.join(OUT, '03-us-week-range.png') });

  // 综合总览默认列（含趋势图列）
  await act('[data-act="cview"][data-v="overview"]');
  await page.screenshot({ path: path.join(OUT, '01-us-overview.png') });
  // UI-08 第2页进入详情再返回
  await page.evaluate(() => { S.colcfg.overview = { cols: colCatalog('US', '').map(c => c.key).filter(k => k !== 'country'), pin: ['sku', 'name'] }; });
  await act('[data-act="cview"][data-v="overview"]');
  await page.fill('#cq-US', 'DEMO'); await page.waitForTimeout(400);
  await act('[data-act="page"][data-scope="country"][data-p="2"]');
  const setLeft = await page.evaluate(() => { const w = document.getElementById('tbl-US-overview'); w.scrollLeft = 420; return w.scrollLeft; });
  const firstSku = await text('#tbl-US-overview .sku-btn');
  await page.locator('#tbl-US-overview .sku-btn').first().click(); await page.waitForTimeout(80);
  const det = await text('#main');
  check('UI-01', '点击SKU进入统一详情，含全部分区', ['总览', '历史销量', '未来计划/目标', '发货计划', '批次 / 在途', '库存明细', '资料 / 来源'].every(s => det.includes(s)));
  check('A04', '详情默认定位来源国家 US', (await page.locator('[data-act="dcountry"][data-v="US"][aria-pressed="true"]').count()) === 1);
  await page.screenshot({ path: path.join(OUT, '04-sku-detail.png') });
  await act('[data-act="back"]'); await page.waitForTimeout(120);
  const restored = await page.evaluate(() => ({ left: document.getElementById('tbl-US-overview').scrollLeft, q: document.getElementById('cq-US').value, pg: document.querySelector('.pager').innerText }));
  check('UI-08', '返回后恢复关键词/页码/横向位置', setLeft > 0 && restored.left === setLeft && restored.q === 'DEMO' && restored.pg.includes('第 2 /'), JSON.stringify(restored) + ' set=' + setLeft);
  await page.fill('#cq-US', ''); await page.waitForTimeout(400);

  // UI-10 修改US计划，切CA不变；FBA不变
  await act('[data-act="cview"][data-v="plan"]');
  const inp = page.locator('#tbl-US-plan input[data-in="plan"]').first();
  const lid = await inp.getAttribute('data-lid');
  const fbaBefore = await page.evaluate(l => DEMO.byId[l].fba, lid);
  const trBefore = await page.evaluate(l => transitOf(l), lid);
  await inp.fill('480'); await page.waitForTimeout(60);
  const caBefore = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(S.plans).filter(([k]) => k.startsWith('L-CA')))));
  await act('[data-act="country"][data-v="CA"]');
  const caAfter = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(S.plans).filter(([k]) => k.startsWith('L-CA')))));
  const fbaAfter = await page.evaluate(l => DEMO.byId[l].fba, lid); const trAfter = await page.evaluate(l => transitOf(l), lid);
  check('UI-10', '修改US计划后CA计划、FBA与在途不变', caBefore === caAfter && fbaBefore === fbaAfter && trBefore === trAfter);
  check('A23', '未保存修改出现保存条', (await page.locator('.savebar').count()) === 1);
  // US 箱数 J=HT/I 联动
  await act('[data-act="country"][data-v="US"]');
  const pk = await page.evaluate(l => DEMO.pById[DEMO.byId[l].pid].packRate, lid);
  const boxTxt = await page.locator(`[data-derived="box-${lid}"]`).first().innerText();
  check('A12', 'US 箱数按 J=HT/I 联动（无取整）', pk ? Math.abs(Number(boxTxt) - 480 / pk) < 0.06 : boxTxt.includes('缺装率'), `box=${boxTxt} pack=${pk}`);
  await page.screenshot({ path: path.join(OUT, '05-us-plan-edit.png') });

  // UI-11 编辑半月预测不影响实际
  await act('[data-act="cview"][data-v="future"]');
  const hin = page.locator('#tbl-US-half input[data-in="half"]').nth(6);
  const hl = await hin.getAttribute('data-lid');
  const mBefore = await page.evaluate(l => JSON.stringify(DEMO.byId[l].monthly), hl); const pBefore = await page.evaluate(l => JSON.stringify(S.plans[l]), hl);
  await hin.fill('999'); await page.waitForTimeout(60);
  check('UI-11', '编辑半月计划不改实际销量与发货计划', mBefore === await page.evaluate(l => JSON.stringify(DEMO.byId[l].monthly), hl) && pBefore === await page.evaluate(l => JSON.stringify(S.plans[l]), hl));
  await page.screenshot({ path: path.join(OUT, '06-us-half-month.png') });
  await act('[data-act="fut"][data-v="fiscal"]');
  check('A09', '财年 APR—MAR 默认不对照，年份待确认', (await text('#main')).includes('财年起止年份待确认') && (await page.locator('#fa-US').inputValue()) === '');

  // 保存 + 模拟冲突
  await act('[data-act="nav"][data-page="plan"]');
  await act('[data-act="simremote"]');
  await act('[data-act="save"]');
  check('UI-17', '同一记录被同事更新后保存出现冲突对话框', (await page.locator('.modal').innerText()).includes('版本冲突'));
  await page.screenshot({ path: path.join(OUT, '07-conflict.png') });
  await act('[data-act="cresolve"]');
  check('A21', '冲突处理后保存为演示状态（无同步宣称）', (await page.locator('#toast').innerText()).includes('未同步给任何同事'));

  // A16 / UI-12 批次
  await act('[data-act="nav"][data-page="country"]');
  await act('[data-act="country"][data-v="US"]'); await act('[data-act="cview"][data-v="batch"]');
  await act('[data-act="batch"][data-bid="B-US-2026-07-20"]');
  const bm = await page.locator('.modal').innerText();
  check('A16', '批次详情含原量100与差异4/−4/0', bm.includes('100') && /−4|-4/.test(bm) && bm.includes('多收') && bm.includes('少收'));
  await page.screenshot({ path: path.join(OUT, '08-batch-detail.png') });
  await act('[data-act="close"]');
  await act('[data-act="country"][data-v="CA"]'); await act('[data-act="batch"][data-bid="B-CA-2026-08-02"]');
  const cam = await page.locator('.modal').innerText();
  check('UI-12', '已报72接收74显示-2，原报72保留', cam.includes('72') && /ERP收发差异 \+2/.test(cam) && /-2|−2/.test(cam));
  await act('[data-act="close"]');
  // A17 空选
  const caTr0 = await page.evaluate(() => listingsOf('CA').reduce((a, l) => a + transitOf(l.lid), 0));
  await act('[data-act="bselnone"][data-cc="CA"]');
  const caTr1 = await page.evaluate(() => listingsOf('CA').reduce((a, l) => a + transitOf(l.lid), 0));
  const usSel = await page.evaluate(() => S.transitSel.US.length);
  check('A17', 'CA 明确空选 → 在途0，US 选择不受影响，批次未删', caTr0 > 0 && caTr1 === 0 && usSel === 4 && (await page.evaluate(() => batchesOf('CA').length)) === 3);
  await page.screenshot({ path: path.join(OUT, '09-ca-empty-selection.png') });
  await act('[data-act="bselorig"][data-cc="CA"]');

  // 搜索
  await act('[data-act="nav"][data-page="search"]');
  const sq = async q => { await page.fill('#sq', q); await page.waitForTimeout(420); return page.locator('#tbl-search .sku-btn').allInnerTexts().catch(() => []); };
  let r = await sq('acr'); check('UI-05', '容错搜 acr 命中 DEMO-ACR-*', r.length && r[0].startsWith('DEMO-ACR'));
  r = await sq('B0DEMO1001'); check('UI-05', 'ASIN 精确命中', r[0] === 'DEMO-ACR-24');
  r = await sq('US-WC36-FBA'); check('UI-05', 'MSKU 精确命中', r[0] === 'DEMO-WC-36');
  r = await sq('丙烯颜料'); check('UI-05', '中文品名命中 3 个 SKU', r.length === 3);
  r = await sq('DEMO-ACR-24'); check('UI-09', '同SKU多Listing保留（US 2个）', (await text('#tbl-search')).includes('B0DEMO1000') && (await text('#tbl-search')).includes('B0DEMO1001'));
  await page.selectOption('#sc', 'US'); await page.selectOption('#so', '运营乙'); await page.waitForTimeout(80);
  check('UI-06', '国家+负责人组合筛选生效', (await text('#tbl-search')).includes('运营乙') && !(await text('#tbl-search')).includes('运营甲'));
  r = await sq('zzz-无结果'); check('A23', '空结果状态可恢复', (await text('#main')).includes('没有找到'));
  await page.screenshot({ path: path.join(OUT, '10-search-empty.png') });
  await act('[data-act="sclearq"]'); await act('[data-act="sclearf"]');
  await act('[data-act="smode"][data-v="multi"]');
  await page.fill('#smulti', 'DEMO-ACR-24\nDEMO-OIL-24, DEMO-NOPE'); await act('[data-act="smultigo"]');
  const multi = await text('#main');
  check('UI-06', '多SKU粘贴：找到2个，未找到1个', multi.includes('DEMO-OIL-24') && multi.includes('未找到 1 个'));
  await page.screenshot({ path: path.join(OUT, '11-search-multi.png') });

  // 人员
  await act('[data-act="nav"][data-page="people"]');
  await act('[data-act="person"][data-v="__none"]');
  const pp = await text('#main');
  check('A05', '未分配入口可查', pp.includes('未分配') && (await page.locator('#tbl-people tbody tr').count()) >= 3);
  await act('[data-act="person"][data-v="ALL"]');
  const dom = await page.evaluate(() => { const s = new Set(DEMO.LISTINGS.map(l => l.pid)); return [...s].reduce((a, p) => a + DEMO.pById[p].domestic.avail, 0); });
  check('A13', '全部人员时国内现货按SKU去重只计一次', (await text('#main')).includes(`国内现货（按SKU去重计一次）${new Intl.NumberFormat('zh-CN').format(dom)}`));
  await page.screenshot({ path: path.join(OUT, '12-people.png') });

  // 库存汇总
  await act('[data-act="nav"][data-page="stock"]');
  check('A15', '原总库存注明五国+US AWD，AE/SA单列', (await text('#main')).includes('AE / SA 自身库存（不在原总库存）'));
  await act('[data-act="stab"][data-v="fba"]');
  check('A14', 'EU 多站点重复不相加', (await text('#main')).includes('EU池重复·不相加'));
  await act('[data-act="stab"][data-v="aging"]');
  check('A14', '库龄重复MSKU取最大值说明', (await text('#main')).includes('按最大值口径'));
  await act('[data-act="stab"][data-v="domestic"]');
  check('A22', '采购在途仅展示，无采购计算入口', (await text('#main')).includes('采购在途') && (await page.locator('button', { hasText: /采购下单|生成采购|采购建议/ }).count()) === 0);

  // 总销量
  await act('[data-act="nav"][data-page="total"]');
  check('UI-04', '总销量 2023 月历史完整可达', (await text('#tbl-total-month')).includes('2023'));
  await act('[data-act="ttab"][data-v="blocks"]');
  const blk = await text('#main');
  check('A08', '总销量 20期汇总旧期显示“空”', blk.includes('空') && blk.includes('DL:EE'));
  await act('[data-act="tblk"][data-v="saved"]');
  check('A08', '15期保存预测单独展示', (await page.locator('#tbl-total-blk thead th').count()) === 16);

  // 详情：变体零分母
  await act('[data-act="nav"][data-page="coverage"]');
  await act('[data-act="covtab"][data-v="accept"]');
  await act('[data-act="goto"][data-t="sku:DEMO-BRS-10:AU"]');
  check('A10', 'AU LED 变体零分母显示待核对', (await text('#main')).includes('零分母'));
  await act('[data-act="back"]');
  await act('[data-act="covtab"][data-v="sheets"]');
  const cov = await text('#tbl-cov');
  check('A01', '16 张原表均有映射，Craft&Fresh/Sheet1 角色待确认', (await page.locator('#tbl-cov tbody tr').count()) === 16 && cov.includes('Craft&Fresh') && (cov.match(/角色待确认/g) || []).length >= 2);

  // 更新流程：不提供FBA → 沿用旧周期
  await act('[data-act="nav"][data-page="update"]');
  await page.uncheck('#uf-f3'); await act('[data-act="ustep"][data-s="2"]'); await act('[data-act="ustep"][data-s="3"]');
  check('A19', '重复文件识别为重复不相加', (await text('#main')).includes('识别为重复'));
  await act('[data-act="ustep"][data-s="4"]'); await act('[data-act="ustep"][data-s="5"]'); await act('[data-act="uapply"]');
  const fr = await page.evaluate(() => S.freshness.map(f => `${f.key}:${f.state}:${f.date}`).join(','));
  check('A20', 'FBA 未提供沿用旧周期，销量更新到10/13', fr.includes('fba:stale:2026-10-11') && fr.includes('sales:updated:2026-10-13'), fr);
  check('UI-16', '应用结果明确为演示，人工计划保留', (await text('#main')).includes('没有写入正式数据'));
  await page.screenshot({ path: path.join(OUT, '13-update-result.png') });
  await act('[data-act="ureset"]'); await act('[data-act="ustep"][data-s="2"]'); await act('[data-act="umode"][data-v="strict"]'); await act('[data-act="ustep"][data-s="3"]');
  check('A19', '严格日期检查阻断销量模块', (await text('#main')).includes('阻断销量模块'));

  // 只读身份
  await page.selectOption('#role', 'viewer'); await page.waitForTimeout(60);
  await act('[data-act="nav"][data-page="country"]'); await act('[data-act="country"][data-v="US"]'); await act('[data-act="cview"][data-v="plan"]');
  check('A21', '只读身份下计划输入禁用', await page.locator('#tbl-US-plan input[data-in="plan"]').first().isDisabled());
  await page.selectOption('#role', 'editor');

  // 键盘
  await page.keyboard.press('Escape'); await page.locator('body').click({ position: { x: 5, y: 880 } }).catch(() => {});
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('/');
  check('UI-19', '按 / 聚焦全局搜索', await page.evaluate(() => document.activeElement.id === 'gq'));
  await page.keyboard.type('oil'); await page.waitForTimeout(80);
  check('UI-19', '搜索浮层出现候选', (await page.locator('#gpop .pop-item').count()) >= 2);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  check('UI-19', '键盘选择候选打开SKU详情', (await page.evaluate(() => S.page)) === 'detail');


  // 第四版：年份多选 / 列配置 / 人员卡片 / 版本记录 / 不显示“累计”
  await page.evaluate(() => { S.colcfg = {}; S.country = 'US'; cui('US').view = 'month'; S.years = null; go('country'); });
  check('R1', '月表不出现“累计”字样', !(await text('#tbl-US-month')).includes('累计'));
  await act('[data-act="ytoggle"][data-y="2025"]'); await act('[data-act="ytoggle"][data-y="2026"]');
  const ym = await text('#tbl-US-month');
  check('R2', '年份多选：只显示 2025、2026', ym.includes('2025') && ym.includes('2026') && !ym.includes('2024') && !ym.includes('2022'));
  await page.screenshot({ path: path.join(OUT, '14-year-filter.png') });
  await act('[data-act="yall"]');
  check('R2', '恢复“全部”年份', (await text('#tbl-US-month')).includes('2022'));
  await act('[data-act="cview"][data-v="overview"]');
  await act('[data-act="colcfg"][data-view="overview"]');
  check('R3', '列配置弹层：分组、已选列表、模板', (await page.locator('.cc-group').count()) === 5 && (await page.locator('.cc-list li').count()) === 12 && (await page.locator('#cc-tpl').count()) === 1);
  await page.check('input[data-in="cccol"][data-key="asin"]'); await page.waitForTimeout(60);
  await page.uncheck('input[data-in="cccol"][data-key="avg4"]'); await page.waitForTimeout(60);
  await act('[data-act="ccpin"][data-key="asin"]');
  await page.screenshot({ path: path.join(OUT, '15-column-config.png') });
  await act('[data-act="ccapply"]');
  const hdr = await page.locator('#tbl-US-overview thead th').allInnerTexts();
  check('R3', '保存并应用：ASIN 固定为第3列，近4周均销隐藏', hdr[2].startsWith('ASIN') && !hdr.some(h => h.startsWith('近4周均销')), hdr.slice(0, 4).join('/'));
  const pinOk = await page.evaluate(() => { const w = document.getElementById('tbl-US-overview'); w.scrollLeft = 300; const c = w.querySelector('tbody td.pin-2'); return Math.abs(c.getBoundingClientRect().left - (w.getBoundingClientRect().left + parseFloat(c.style.left))) < 2; });
  check('R3', '固定列横向滚动时保持在左侧', pinOk);
  await act('[data-act="colcfg"][data-view="overview"]');
  await page.selectOption('#cc-tpl', '0'); await page.waitForTimeout(60); await act('[data-act="ccapply"]');
  check('R3', '内置模版“库存核对”可一键应用', (await page.locator('#tbl-US-overview thead th').allInnerTexts()).some(h => h.startsWith('180天以内')));
  await act('[data-act="cview"][data-v="plan"]');
  check('R3', '发货计划视图也有列配置', (await page.locator('[data-act="colcfg"][data-view="plan"]').count()) === 1);
  await page.evaluate(() => { S.colcfg = {}; go('people'); });
  check('R4', '人员卡片布局（6 张）', (await page.locator('.pcard').count()) === 6);
  await page.screenshot({ path: path.join(OUT, '16-people-cards.png') });
  await page.evaluate(() => go('versions'));
  const vtxt = await text('#main');
  check('R5', '版本记录：列表与默认对比', (await page.locator('#tbl-versions tbody tr').count()) >= 7 && (await page.locator('#tbl-vcmp').count()) === 1 && vtxt.includes('已作废'));
  await page.screenshot({ path: path.join(OUT, '17-versions.png') });
  await act('[data-act="vdetail"][data-id="V-1012"]');
  check('R5', '版本详情弹层', (await page.locator('.modal').innerText()).includes('数据基准日'));
  await act('[data-act="close"]');

  // 第五版：审查修复回归 + 新可视化
  await page.evaluate(() => { S.colcfg = {}; S.years = null; S.country = 'US'; cui('US').view = 'overview'; go('country'); });
  check('V1', '综合总览默认含趋势小图（每行一张）', (await page.locator('#tbl-US-overview svg.spark').count()) >= 10);
  await act('[data-act="colcfg"][data-view="overview"]');
  await act('[data-act="ccgroup"][data-g="库存"][data-on="1"]');
  await act('[data-act="ccpin"][data-key="fba"]'); await act('[data-act="ccpin"][data-key="transit"]');
  await act('[data-act="ccgroup"][data-g="库存"][data-on="0"]');
  const pinAfter = await page.evaluate(() => S.colEdit.pin.join(','));
  check('F1', '分组“取消”同时清掉该组固定列', pinAfter === 'sku,name', pinAfter);
  await page.fill('#cc-q', '库存'); await page.dispatchEvent('#cc-q', 'input'); await page.waitForTimeout(60);
  const sameInput = await page.evaluate(() => document.activeElement && document.activeElement.id === 'cc-q');
  check('F5', '字段搜索只刷新列表、不替换输入框（输入法不中断）', sameInput && (await page.locator('.cc-item').count()) >= 2);
  await act('[data-act="close"]');
  await page.evaluate(() => { S.country = 'CA'; cui('CA').view = 'stock'; go('country'); });
  const caHdr = (await page.locator('#tbl-CA-stock thead th').allInnerTexts()).join('|');
  check('F8', 'CA 库存明细不出现 US 专属 AWD/海外仓列', !caHdr.includes('AWD') && !caHdr.includes('海外仓'));
  await page.evaluate(() => { S.country = 'AE'; cui('AE').view = 'plan'; go('country'); });
  const aeHdr = (await page.locator('#tbl-AE-plan thead th').allInnerTexts()).join('|');
  check('F8', 'AE 发货计划不补造运输期/可售天数列', aeHdr.includes('备货数量') && !aeHdr.includes('运输期末库存') && !aeHdr.includes('补货后可售天数'));
  await page.evaluate(() => { S.country = 'US'; cui('US').view = 'plan'; go('country'); });
  check('F9', 'US 发货计划副标题保留本国源列与局部公式', (await page.evaluate(() => document.querySelector('#tbl-US-plan thead').textContent)).includes('HX=(HS+HT)/(HO/7)'));
  await page.evaluate(() => { S.country = 'CA'; cui('CA').view = 'plan'; go('country'); });
  check('F9', 'CA 补货后天数标“原公式待接入”', (await page.evaluate(() => document.querySelector('#tbl-CA-plan thead').textContent)).includes('原公式待接入'));
  await page.evaluate(() => { S.people.person = 'ALL'; S.people.sort = null; go('people'); });
  await act('#tbl-people th[data-key="fba"]');
  const fbaCol = await page.evaluate(() => [...document.querySelectorAll('#tbl-people tbody tr')].map(tr => tr.querySelector('td:nth-child(' + ([...document.querySelectorAll('#tbl-people thead th')].findIndex(t => t.dataset.key === 'fba') + 1) + ')').textContent.replace(/,/g, '')).map(Number));
  check('F2', '人员视图表头可排序（FBA 升序）', fbaCol.length > 3 && fbaCol.every((v, i) => !i || fbaCol[i - 1] <= v), fbaCol.slice(0, 5).join(','));
  await page.evaluate(() => { S.people.country = 'EU'; S.people.page = 1; go('people'); });
  check('F10', '人员视图 EU 行标“发货角色”', (await text('#tbl-people')).includes('发货角色'));
  await page.evaluate(() => { S.people.country = 'ALL'; });
  await page.evaluate(() => { S.country = 'US'; cui('US').view = 'month'; S.years = [2022]; go('country'); });
  await page.evaluate(() => { S.country = 'EU'; cui('EU').view = 'month'; go('country'); });
  const euTxt = await text('#tbl-EU-month');
  check('F7', 'US 选 2022 后切到 EU：不出现空表，选择器显示“全部”', !euTxt.includes('所选年份没有') && (await page.locator('[data-act="yall"][aria-pressed="true"]').count()) === 1);
  await page.evaluate(() => { S.years = null; });
  await act('#heat');
  check('V3', '色阶开关为月表单元格着色（未完整月除外）', (await page.locator('#tbl-EU-month td[class*="heat-"]').count()) > 20);
  await page.evaluate(() => { S.heat = false; openSku('P-001', { country: 'US' }); });
  await page.waitForTimeout(150);
  check('V2', '详情页逐年同月对比图已绘制（多条年线 + 图例）', (await page.locator('#yoy-d svg path.ln').count()) >= 2 && (await page.locator('#yoy-d .yoy-legend span').count()) >= 2);
  await page.focus('#yoy-d'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  check('V2', '键盘左右键逐月显示提示框（数值在前）', !(await page.locator('#yoy-d .yoy-tip').isHidden()) && (await page.locator('#yoy-d .yoy-tip').innerText()).includes('2月'));
  await page.screenshot({ path: path.join(OUT, '18-yoy-chart.png') });
  // 版本：演示更新后 V-1012 不被混入
  await page.evaluate(() => { S.upd = null; go('update'); });
  await act('[data-act="ustep"][data-s="5"]'); await act('[data-act="uapply"]');
  await page.evaluate(() => { S.ver = { sel: [] }; go('versions'); });
  const runId = await page.evaluate(() => S.runs[0].id);
  await page.check(`#vs-${runId}`); await page.check('#vs-V-1012'); await page.waitForTimeout(80);
  const vcmp = await page.evaluate(() => [...document.querySelectorAll('#tbl-vcmp tbody tr')].pop().innerText);
  check('F3', 'V-1012 与演示版本对比能看到演示带来的 FBA 变化', /[+-]\d/.test(vcmp), vcmp.replace(/\s+/g, ' '));
  await page.selectOption('#role', 'viewer'); await page.waitForTimeout(60);
  check('F11', '切换身份后版本生成人不变', (await text('#tbl-versions')).includes(runId) && (await page.evaluate(id => versions().find(v => v.id === id).by, runId)) === '运营甲');
  await page.selectOption('#role', 'editor');
  await act('[data-act="vdetail"][data-id="V-1012"]'); await act('.modal [data-act="goto"]');
  check('F4', '版本详情跳转过程记录时关闭弹层', (await page.locator('.modal').count()) === 0 && (await page.evaluate(() => S.page)) === 'update');
  const ime = await page.evaluate(async () => { S.country = 'US'; cui('US').view = 'overview'; cui('US').q = ''; go('country'); const el = document.getElementById('cq-US'); el.focus(); el.value = 'ac'; el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true })); await new Promise(r => setTimeout(r, 400)); const kept = document.getElementById('cq-US') === el; el.value = 'acr'; el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })); await new Promise(r => setTimeout(r, 400)); return kept && cui('US').q === 'acr'; });
  check('F5', '输入法拼写中不重绘，结束后才筛选', ime);
  // 第六版：可撑天数 / 库存推演 / 批次时间线 / 库龄构成
  await page.evaluate(() => { S.colcfg = {}; S.country = 'US'; const c = cui('US'); c.view = 'overview'; c.q = ''; c.sort = null; c.page = 1; c.size = 12; go('country'); });
  const fit = await page.evaluate(() => { const w = document.getElementById('tbl-US-overview'); return w.scrollWidth - w.clientWidth; });
  check('P1', '综合总览默认含“可撑天数”条形列，1440 宽无需横向滚动', (await page.locator('#tbl-US-overview svg.cv-bar').count()) >= 10 && fit <= 0, `溢出 ${fit}px`);
  await act('#tbl-US-overview th[data-key="cover"]');
  const keys = await page.evaluate(() => filteredListings('US').map(coverSortKey));
  const firstW = await page.locator('#tbl-US-overview tbody tr').first().innerText();
  check('P1', '按可撑天数排序：最急的（断档）排最前', keys.every((k, i) => !i || k >= keys[i - 1]) && firstW.includes('断档'), firstW.replace(/\s+/g, ' ').slice(0, 60));
  await page.screenshot({ path: path.join(OUT, '19-cover-sort.png') });
  const model = await page.evaluate(() => { const l = listingsOf('US').find(x => coverOf(x).st === 'bad'); const before = coverOf(l); const keep = S.transitSel.US; S.transitSel.US = []; const c = coverOf(l); S.transitSel.US = keep; const back = coverOf(l); return { gapBefore: before.gap, noTransit: Math.abs(c.total - c.fbaDays) < 0.01 && c.gap === 0 && !c.arr.length, restored: back.gap === before.gap }; });
  check('P2', '在途明确空选后只剩 FBA 天数，恢复选择后断档复现（随批次选择联动）', model.gapBefore > 0 && model.noTransit && model.restored, JSON.stringify(model));
  const pl = await page.evaluate(() => { const l = listingsOf('US').find(x => coverOf(x).st === 'bad' && planOf(x.lid)); openSku(l.pid, { country: 'US' }); return l.lid; });
  await page.waitForTimeout(150);
  check('P3', 'SKU 详情显示库存推演图（现有在途线 + 断货区间）', (await page.locator('#proj-d path.pl-base').count()) === 1 && (await page.locator('#proj-d rect.pz').count()) >= 1);
  await page.fill(`#sec-plan input[data-in="plan"][data-lid="${pl}"]`, '500'); await page.waitForTimeout(120);
  const ptxt = await text(`[data-derived="projtxt-${pl}"]`);
  check('P3', '改计划量后推演图立即加出“含本次发货”线，文字同步', (await page.locator('#proj-d path.pl-plan').count()) === 1 && ptxt.includes('本次发货 500'), ptxt.slice(0, 60));
  await page.evaluate(() => document.getElementById('sec-plan').scrollIntoView());
  await page.locator('#proj-d').focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  check('P3', '推演图键盘左右键按周查看', !(await page.locator('#proj-d .yoy-tip').isHidden()) && (await page.locator('#proj-d .yoy-tip').innerText()).includes('第 7 天'));
  await page.screenshot({ path: path.join(OUT, '20-projection.png') });
  await act('[data-act="discard"]').catch(() => {});
  await page.evaluate(() => { S.country = 'US'; cui('US').view = 'batch'; go('country'); });
  await act('[data-act="bmode"][data-v="time"]');
  check('P4', '批次时间线：每批一条，标出基准日', (await page.locator('.tl .tl-bar').count()) === (await page.evaluate(() => batchesOf('US').length)) && (await text('.tl')).includes('基准日'));
  check('P4', '时间线里点批次仍可打开批次详情', await (async () => { await act('.tl [data-act="batch"]'); const ok = (await page.locator('.modal').count()) === 1; await act('.modal [data-act="close"]'); return ok; })());
  await page.screenshot({ path: path.join(OUT, '21-batch-timeline.png') });
  await act('[data-act="bmode"][data-v="list"]');
  check('P4', '切回清单', (await page.locator('#tbl-US-batches').count()) === 1);
  await page.evaluate(() => { S.stock.tab = 'aging'; go('stock'); });
  const ag = await page.evaluate(() => [...document.querySelectorAll('.ag-top .ag-v b')].map(b => parseInt(b.textContent)));
  check('P5', '库龄构成：压货最多的 8 条按 365 天以上占比降序', ag.length === 8 && ag.every((v, i) => !i || v <= ag[i - 1]), ag.join(','));
  check('P5', '库龄表每行有构成条', (await page.locator('#tbl-stock-aging svg.ag-bar').count()) >= 10);
  await page.screenshot({ path: path.join(OUT, '22-aging-mix.png') });
  // 第七版：开发文档审查发现的行为修正
  await page.evaluate(() => { S.colcfg = {}; S.country = 'US'; Object.assign(cui('US'), { view: 'overview', q: '', sort: null, page: 1, size: 12 }); closeModal(); go('country'); });
  await page.locator('#pg-country-next').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(80);
  check('Q1', '翻页后键盘焦点仍在分页按钮上', await page.evaluate(() => !!document.activeElement.closest('.pager')), await page.evaluate(() => document.activeElement.id));
  await page.evaluate(() => { cui('US').page = 1; openSku(D.PRODUCTS[0].pid, { country: 'US' }); });
  await page.locator('#pn-next').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(80);
  check('Q2', '上一个/下一个 SKU 后焦点留在同一按钮', await page.evaluate(() => document.activeElement.id === 'pn-next' && S.detail.pid === D.PRODUCTS[1].pid));
  await act('[data-act="back"]'); await page.waitForTimeout(80);
  check('Q3', '返回后焦点在主区', await page.evaluate(() => document.activeElement.id === 'main'));
  const cf = await page.evaluate(async () => {
    const l = listingsOf('US').find(x => planOf(x.lid)); const lid = l.lid; S.country = 'US'; cui('US').view = 'plan'; go('country');
    S.plans[lid].qty = 777; S.plans[lid].note = '我的备注'; simRemote(); save();
    const shown = !!document.querySelector('.modal'); document.querySelector('[data-act="cresolve"]').click();
    const toastTxt = document.getElementById('toast').innerText;
    return { shown, qty: S.plans[lid].qty, note: S.plans[lid].note, savedNote: S.plansSaved[lid].note, remote: !!S.remote[lid], toastTxt, dirty: dirtyCount() };
  });
  check('Q4', '冲突时“采用同事的值”放弃本人对该记录的全部修改（含备注），提示采用条数', cf.shown && cf.qty !== 777 && cf.note === cf.savedNote && cf.note !== '我的备注' && !cf.remote && cf.dirty === 0 && cf.toastTxt.includes('采用同事的值 1 条'), JSON.stringify(cf).slice(0, 160));
  const ds = await page.evaluate(() => { simRemote(); const n1 = Object.keys(S.remote).length; ACT.discard(); return { n1, n2: Object.keys(S.remote).length, txt: document.getElementById('toast').innerText }; });
  check('Q5', '放弃修改时同步同事的新版本，不再挂着“同事已改”', ds.n1 === 1 && ds.n2 === 0 && ds.txt.includes('同步了同事的新版本'), JSON.stringify(ds).slice(0, 120));
  await page.evaluate(() => { S.country = 'US'; cui('US').view = 'overview'; go('country'); });
  const lid0 = await page.evaluate(() => document.querySelector('#tbl-US-overview input[data-in="plan"]').dataset.lid);
  await page.fill(`#tbl-US-overview input[data-in="plan"][data-lid="${lid0}"]`, '123'); await page.waitForTimeout(60);
  check('Q6', '改计划量后状态列立即显示“未保存”（不整页重绘）', (await text(`[data-derived="st-${lid0}"]`)).includes('未保存') && await page.evaluate(l => document.activeElement.dataset.lid === l, lid0));
  await page.evaluate(() => ACT.discard());
  const hv = await page.evaluate(() => { const l = D.LISTINGS.find(x => x.country === 'US' && x.half); openSku(l.pid, { country: 'ALL' }); const k = 8; const el = document.querySelector(`[data-in="half"][data-lid="${l.lid}"][data-k="${k}"]`); el.value = '999'; el.dispatchEvent(new Event('input', { bubbles: true })); const exp = sumNums(listingsOfP(l.pid).filter(x => x.half).map(x => S.half[x.lid][k])); return { dl: document.querySelector(`[data-derived="dlee-${l.pid}-${k}"]`).textContent.replace(/,/g, ''), exp: String(exp) }; });
  check('Q7', '改半月计划后 DL:EE 汇总立即更新', hv.dl === hv.exp, JSON.stringify(hv));
  await page.evaluate(() => ACT.discard());
  const cnt = await page.evaluate(() => { S.colcfg = { overview: { cols: colCatalog(null, '').map(c => c.key).filter(k => k !== 'country'), pin: ['sku', 'name'] } }; S.country = 'AE'; cui('AE').view = 'overview'; go('country'); const n = Number(document.querySelector('[data-act="colcfg"] .muted').textContent); const shown = document.querySelectorAll('#tbl-AE-overview thead th').length; S.colcfg = {}; return { n, shown }; });
  check('Q8', '列配置按钮计数只算本国适用的列', cnt.n === cnt.shown, JSON.stringify(cnt));
  const al = await page.evaluate(() => { S.plan.open = {}; go('plan'); const p = D.PRODUCTS.find(x => listingsOfP(x.pid).filter(l => planOf(l.lid)).length >= 2); S.plan.open[p.pid] = true; go('plan'); const ths = [...document.querySelectorAll('#tbl-plan thead th')].map(th => th.firstChild.textContent.trim()); return [...document.querySelectorAll('#tbl-plan input[data-in="plan"]')].map(inp => { const td = inp.closest('td'); let idx = 0; for (const c of [...td.parentElement.children]) { if (c === td) break; idx += c.colSpan; } return ths[idx] === L(inp.dataset.lid).country; }); });
  check('Q9', '发货计划展开行：计划量输入落在本国列下', al.length >= 2 && al.every(Boolean), JSON.stringify(al));
  await page.evaluate(() => { S.plan.open = {}; });
  check('ERR', '无脚本错误', errors.length === 0, errors.slice(0, 3).join(' | '));

  // 宽度 × 主题
  const views = [
    ['country', async () => { await page.evaluate(() => { S.country = 'US'; cui('US').view = 'overview'; go('country'); }); }],
    ['detail', async () => { await page.evaluate(() => { go('country'); openSku('P-001', { country: 'US' }); }); }],
    ['update', async () => { await page.evaluate(() => go('update')); }],
    ['plan', async () => { await page.evaluate(() => go('plan')); }],
  ];
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    for (const w of [1440, 1024, 768, 375, 320]) {
      await page.setViewportSize({ width: w, height: w < 500 ? 780 : 900 });
      for (const [name, fn] of views) {
        await fn(); await page.waitForTimeout(80);
        const ok = await noOverflow();
        check('UI-18', `${scheme} ${w}px ${name} 无外层横向溢出`, ok);
        if ((w === 1440 || w === 375) && (name === 'country' || name === 'detail') || (w === 1024 && name === 'country') || (w === 768 && name === 'detail') || (w === 320 && name === 'country')) await page.screenshot({ path: path.join(OUT, `w${w}-${scheme}-${name}.png`) });
      }
    }
  }
  // 窄屏冻结列可见
  await page.setViewportSize({ width: 375, height: 780 }); await page.emulateMedia({ colorScheme: 'light' });
  await page.evaluate(() => { S.country = 'US'; cui('US').view = 'month'; go('country'); });
  await page.evaluate(() => { document.getElementById('tbl-US-month').scrollLeft = 600; });
  const fzVisible = await page.evaluate(() => { const c = document.querySelector('#tbl-US-month td.fz1'); const r = c.getBoundingClientRect(); const w = document.getElementById('tbl-US-month').getBoundingClientRect(); return r.left >= w.left - 1 && r.left < w.left + 5; });
  check('UI-18', '375px 横向滚动后 SKU 列仍冻结可读', fzVisible);
  await page.screenshot({ path: path.join(OUT, 'w375-light-month-scrolled.png') });

  await browser.close();
  const pass = results.filter(r => r.ok).length;
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ pass, total: results.length, results }, null, 1));
  console.log(`\n${pass}/${results.length} passed`);
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
