/* 数据校验：检查每个品类的交叉引用是否写对。
   用法：node 品类细分/src/check.js   （需要 playwright；会打开构建好的 开品维度图谱.html）
   检查项：维度名、类型名、机会名、参考商品 key、来源 key、评分完整性、白地图行列数、必填字段、页面报错。 */
const path = require("path");
const { chromium } = require("playwright");
(async () => {
  const file = path.resolve(__dirname, "..", "开品维度图谱.html");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(e.message));
  page.on("console", m => { if (m.type() === "error") pageErrors.push(m.text()); });
  await page.goto("file://" + file);
  await page.waitForTimeout(800);
  const report = await page.evaluate(() => {
    const out = [];
    for (const cat of CATS) {
      const errs = [], warn = [];
      const dimNames = new Set(); cat.dims.forEach(g => g.cats.forEach(c => c.c.forEach(d => dimNames.add(d.t))));
      const typeNames = new Set(); cat.types.forEach(g => g.items.forEach(t => typeNames.add(t.t)));
      const oppNames = new Set(cat.opps.map(o => o.t));
      const need = ["t","vol","combo","rep","price","who","comp","compT","pain","evl","fig","ex","map","pros","cons","up","verdict","must","plus","avoid"];
      cat.types.forEach(g => g.items.forEach(t => {
        need.forEach(k => { if (t[k] === undefined) errs.push(`类型「${t.t}」缺少字段 ${k}`); });
        (t.map || []).forEach(([d]) => { if (!dimNames.has(d)) errs.push(`类型「${t.t}」的维度映射里有不存在的维度「${d}」`); });
        (t.ev || []).forEach(k => { if (!cat.src[k]) errs.push(`类型「${t.t}」引用了不存在的来源 ${k}`); });
        (t.ex || []).forEach(e => { if (e.u === "#") errs.push(`类型「${t.t}」示例商品 ${e.n}`); });
        if ((t.ex || []).length < 2) warn.push(`类型「${t.t}」示例商品少于 2 个`);
      }));
      cat.opps.forEach(o => {
        if (!o.state && !o.score) errs.push(`机会「${o.t}」没有评分`);
        if (o.score) ["d","c","x","s","p","e"].forEach(k => { if (!(o.score[k] >= 1 && o.score[k] <= 5)) errs.push(`机会「${o.t}」评分项 ${k} 不在 1–5`); });
        if (o.state === "out" && !o.outWhy) errs.push(`已排除的「${o.t}」没写排除原因`);
        (o.from || "").split("、").forEach(f => { if (f && !typeNames.has(f)) errs.push(`机会「${o.t}」的对标类型「${f}」不存在`); });
        (o.ev || []).forEach(k => { if (!cat.src[k]) errs.push(`机会「${o.t}」引用了不存在的来源 ${k}`); });
      });
      cat.grids.forEach(v => {
        ["rk","rc","cc"].forEach(k => { if (!v[k]) warn.push(`白地图「${v.name}」缺少 ${k}（搜索链接会变少）`); });
        if (v.rk && v.rk.length !== v.rows.length) errs.push(`白地图「${v.name}」rk 数量和行数不一致`);
        if (v.price && v.price.length !== v.cols.length) errs.push(`白地图「${v.name}」price 数量和列数不一致`);
        v.rows.forEach(([rn, cells]) => {
          if (cells.length !== v.cols.length) errs.push(`白地图「${v.name}」行「${rn}」有 ${cells.length} 格，应为 ${v.cols.length}`);
          cells.forEach((c, ci) => {
            const o = c[2] || {}, where = `白地图「${v.name}」${rn} × ${v.cols[ci]}`;
            if (!/^[RSLEX][0-3]?$/.test(c[0])) errs.push(`${where} 代码 ${c[0]} 不合法`);
            (o.r || []).forEach(k => { if (!cat.refs[k]) errs.push(`${where} 参考商品 key ${k} 不存在`); });
            (o.t || []).forEach(t => { if (!typeNames.has(t)) errs.push(`${where} 关联类型「${t}」不存在`); });
            if (o.o && !oppNames.has(o.o)) errs.push(`${where} 关联机会「${o.o}」不存在`);
          });
        });
      });
      const nType = [...typeNames].length, nDim = dimNames.size, nRef = Object.keys(cat.refs).length;
      out.push({ cat: cat.name, stats: `${nType} 类型 · ${nDim} 维度 · ${cat.opps.length} 机会 · ${cat.grids.length} 张白地图 · ${nRef} 个参考商品`, errs, warn });
    }
    return out;
  });
  let bad = pageErrors.length;
  if (pageErrors.length) console.log("页面报错：\n  " + pageErrors.join("\n  "));
  for (const r of report) {
    console.log(`\n【${r.cat}】${r.stats}`);
    r.errs.forEach(e => console.log("  ✗ " + e)); r.warn.forEach(w => console.log("  ! " + w));
    if (!r.errs.length) console.log("  ✓ 交叉引用全部通过");
    bad += r.errs.length;
  }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
