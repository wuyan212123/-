/* 一比一还原的视觉对比工具（只依赖 playwright）
   用法：
     node tools/visual.cjs baseline                 截取原型全部状态 → docs/dev/baseline/（供人工参考）
     node tools/visual.cjs compare <候选URL>         原型与候选实现逐状态逐像素对比 → docs/dev/visual-report/
       可选：--ref <URL>（默认本仓库 index.html） --only id1,id2 --variants desktop-light,mobile-light --max 0.5
   两边页面都必须提供 window.wbTest（见 src/app-test.js 与 docs/dev/07-验收与一比一还原.md）。
   参照与候选在同一台机器、同一个浏览器里渲染，字体与抗锯齿一致，所以差异只来自实现本身。 */
const path = require('path');
const fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }

const ROOT = path.join(__dirname, '..');
const PROTO = 'file://' + path.join(ROOT, 'index.html');
const VARIANTS = {
  'desktop-light': { viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  'desktop-dark': { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  'mobile-light': { viewport: { width: 390, height: 844 }, colorScheme: 'light', isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
};
const FIXED_NOW = new Date('2026-10-14T10:00:00+08:00'); // 底部来源条的“今天”
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const mode = args[0];
if (!['baseline', 'compare'].includes(mode)) { console.log('用法：node tools/visual.cjs baseline | compare <候选URL> [--ref URL] [--only ids] [--variants v1,v2] [--max 0.5]'); process.exit(2); }

async function shoot(browser, url, variant, id) {
  const v = VARIANTS[variant];
  const ctx = await browser.newContext({ viewport: v.viewport, colorScheme: v.colorScheme, reducedMotion: 'reduce', isMobile: !!v.isMobile, hasTouch: !!v.hasTouch, deviceScaleFactor: v.deviceScaleFactor || 1, locale: 'zh-CN', timezoneId: 'Asia/Shanghai' });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(url);
  await page.waitForFunction(() => window.wbTest && typeof window.wbTest.open === 'function', null, { timeout: 15000 });
  await page.evaluate(sid => window.wbTest.open(sid), id);
  await page.waitForTimeout(120);
  const png = await page.screenshot({ animations: 'disabled', caret: 'hide' });
  await ctx.close();
  return { png, errors };
}

async function listStates(browser, url) {
  const page = await browser.newPage(); await page.goto(url);
  await page.waitForFunction(() => window.wbTest && typeof window.wbTest.states === 'function', null, { timeout: 15000 });
  const s = await page.evaluate(() => window.wbTest.states()); await page.close(); return s;
}

/** 在浏览器画布里逐像素对比：任一通道差 > 32 记为不同；返回不同像素占比与标红的差异图 */
async function diff(browser, a, b) {
  const page = await browser.newPage();
  const r = await page.evaluate(async ([A, B]) => {
    const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = 'data:image/png;base64,' + src; });
    const [ia, ib] = await Promise.all([load(A), load(B)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { ratio: 1, note: `尺寸不同 ${ia.width}×${ia.height} vs ${ib.width}×${ib.height}` };
    const w = ia.width, h = ia.height; const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, w, h).data; g.clearRect(0, 0, w, h); g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, w, h).data;
    const out = g.createImageData(w, h); let bad = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      const gray = 255 - (255 - (da[i] * 0.3 + da[i + 1] * 0.59 + da[i + 2] * 0.11)) * 0.25;
      if (d > 32) { bad++; out.data[i] = 230; out.data[i + 1] = 30; out.data[i + 2] = 30; } else { out.data[i] = out.data[i + 1] = out.data[i + 2] = gray; }
      out.data[i + 3] = 255;
    }
    g.putImageData(out, 0, 0);
    return { ratio: bad / (w * h), img: c.toDataURL('image/png').split(',')[1] };
  }, [a.toString('base64'), b.toString('base64')]);
  await page.close(); return r;
}

(async () => {
  const browser = await pw.chromium.launch();
  const ref = opt('ref', PROTO);
  const variants = (opt('variants', Object.keys(VARIANTS).join(','))).split(',');
  let states = await listStates(browser, ref);
  const only = opt('only', null); if (only) states = states.filter(s => only.split(',').includes(s.id));
  if (mode === 'baseline') {
    const dir = path.join(ROOT, 'docs', 'dev', 'baseline'); fs.mkdirSync(dir, { recursive: true });
    const index = [];
    for (const s of states) for (const v of variants) {
      const { png, errors } = await shoot(browser, ref, v, s.id);
      const f = `${s.id}@${v}.png`; fs.writeFileSync(path.join(dir, f), png); index.push({ id: s.id, title: s.title, variant: v, file: f });
      if (errors.length) console.log('脚本错误', s.id, v, errors);
    }
    // 与已有清单合并（--only / --variants 只更新部分截图时不丢其他条目），按状态顺序排列
    let old = []; try { old = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')); } catch (e) { /* 首次生成 */ }
    const keyOf = r => r.id + '@' + r.variant; const merged = new Map(old.map(r => [keyOf(r), r])); index.forEach(r => merged.set(keyOf(r), r));
    const order = (await listStates(browser, ref)).map(s => s.id);
    const all = [...merged.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id) || a.variant.localeCompare(b.variant));
    fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(all, null, 1));
    console.log(`已截取 ${index.length} 张（清单共 ${all.length} 张）→ docs/dev/baseline/`);
  } else {
    const cand = args[1]; if (!cand || cand.startsWith('--')) { console.log('compare 需要候选 URL'); process.exit(2); }
    const max = Number(opt('max', 0.5)); // 允许的不同像素百分比
    const dir = path.join(ROOT, 'docs', 'dev', 'visual-report'); fs.mkdirSync(dir, { recursive: true });
    const candStates = new Set((await listStates(browser, cand)).map(s => s.id));
    const rows = [];
    for (const s of states) for (const v of variants) {
      const key = `${s.id}@${v}`;
      if (!candStates.has(s.id)) { rows.push({ key, title: s.title, pct: 100, ok: false, note: '候选实现缺少该状态' }); continue; }
      const A = await shoot(browser, ref, v, s.id), B = await shoot(browser, cand, v, s.id);
      const d = await diff(browser, A.png, B.png); const pct = Math.round(d.ratio * 10000) / 100;
      fs.writeFileSync(path.join(dir, `${key}.ref.png`), A.png); fs.writeFileSync(path.join(dir, `${key}.cand.png`), B.png);
      if (d.img) fs.writeFileSync(path.join(dir, `${key}.diff.png`), Buffer.from(d.img, 'base64'));
      rows.push({ key, title: s.title, pct, ok: pct <= max && !B.errors.length, note: [d.note, B.errors.length ? '候选脚本错误：' + B.errors[0] : ''].filter(Boolean).join('；') });
      console.log(`${pct <= max ? '通过' : '不通过'}  ${String(pct).padStart(6)}%  ${key}  ${s.title}`);
    }
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify({ ref, cand, max, rows }, null, 1));
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><meta charset="utf-8"><title>视觉对比报告</title><style>body{font:13px -apple-system,"PingFang SC",sans-serif;margin:24px}table{border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:6px 8px;vertical-align:top;text-align:left}img{width:300px;border:1px solid #ccc}.bad{color:#b42720;font-weight:600}</style>
<h1>视觉对比报告</h1><p>参照：${esc(ref)}<br>候选：${esc(cand)}<br>阈值：不同像素 ≤ ${max}%（任一通道差 > 32 计为不同）</p><table><tr><th>状态</th><th>不同像素</th><th>参照</th><th>候选</th><th>差异（红色）</th></tr>
${rows.map(r => `<tr><td>${esc(r.key)}<br><small>${esc(r.title)}</small><br><small>${esc(r.note || '')}</small></td><td class="${r.ok ? '' : 'bad'}">${r.pct}%</td><td><img src="${esc(r.key)}.ref.png"></td><td><img src="${esc(r.key)}.cand.png"></td><td><img src="${esc(r.key)}.diff.png"></td></tr>`).join('\n')}</table>`);
    const fail = rows.filter(r => !r.ok);
    console.log(`\n${rows.length - fail.length}/${rows.length} 通过。报告：docs/dev/visual-report/index.html`);
    await browser.close(); process.exit(fail.length ? 1 : 0);
  }
  await browser.close();
})();
