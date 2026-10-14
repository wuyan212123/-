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
  await act('#tbl-US-month th[data-m="9"]');
  const hlCount = await page.locator('#tbl-US-month td.hl').count();
  check('UI-03', '点击10月表头高亮所有年份同月，且表头有文字标记', hlCount > 0 && (await text('#tbl-US-month th[data-m="9"]')).includes('已高亮'), `hl cells=${hlCount}`);
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

  // UI-08 第2页进入详情再返回
  await act('[data-act="cview"][data-v="overview"]');
  await page.fill('#cq-US', 'DEMO'); await page.waitForTimeout(400);
  await act('[data-act="page"][data-scope="country"][data-p="2"]');
  const setLeft = await page.evaluate(() => { const w = document.getElementById('tbl-US-overview'); w.scrollLeft = 420; return w.scrollLeft; });
  await page.screenshot({ path: path.join(OUT, '01-us-overview.png') });
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
  let r = await sq('cup500'); check('UI-05', '容错搜 cup500 命中 DEMO-CUP-500*', r.length && r[0].startsWith('DEMO-CUP-500'));
  r = await sq('B0DEMO1001'); check('UI-05', 'ASIN 精确命中', r[0] === 'DEMO-CUP-500BK');
  r = await sq('US-LINTRMV-FBA'); check('UI-05', 'MSKU 精确命中', r[0] === 'DEMO-LINT-RMV');
  r = await sq('保温杯'); check('UI-05', '中文品名命中 3 个 SKU', r.length === 3);
  r = await sq('DEMO-CUP-500BK'); check('UI-09', '同SKU多Listing保留（US 2个）', (await text('#tbl-search')).includes('B0DEMO1000') && (await text('#tbl-search')).includes('B0DEMO1001'));
  await page.selectOption('#sc', 'US'); await page.selectOption('#so', '运营乙'); await page.waitForTimeout(80);
  check('UI-06', '国家+负责人组合筛选生效', (await text('#tbl-search')).includes('运营乙') && !(await text('#tbl-search')).includes('运营甲'));
  r = await sq('zzz-无结果'); check('A23', '空结果状态可恢复', (await text('#main')).includes('没有找到'));
  await page.screenshot({ path: path.join(OUT, '10-search-empty.png') });
  await act('[data-act="sclearq"]'); await act('[data-act="sclearf"]');
  await act('[data-act="smode"][data-v="multi"]');
  await page.fill('#smulti', 'DEMO-CUP-500BK\nDEMO-PET-2L, DEMO-NOPE'); await act('[data-act="smultigo"]');
  const multi = await text('#main');
  check('UI-06', '多SKU粘贴：找到2个，未找到1个', multi.includes('DEMO-PET-2L') && multi.includes('未找到 1 个'));
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
  await act('[data-act="goto"][data-t="sku:DEMO-LED-5M:AU"]');
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
  await page.keyboard.type('pet'); await page.waitForTimeout(80);
  check('UI-19', '搜索浮层出现候选', (await page.locator('#gpop .pop-item').count()) >= 2);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  check('UI-19', '键盘选择候选打开SKU详情', (await page.evaluate(() => S.page)) === 'detail');

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
