// 生成演示版：npm run demo → demo/
// 演示版不需要服务器，接口由 scripts/demo/demo.js 在页面内模拟，用于手机上预览和评审。
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../lib/config.mjs';
import { loadContent, visibleItems, summary, detail } from '../lib/content.mjs';
import { ReleaseStore } from '../lib/releases.mjs';

const config = loadConfig();
const out = path.join(config.root, 'demo');
const lib = loadContent(config.contentDir);
if (lib.errors.length) { console.error(lib.errors.join('\n')); process.exit(1); }
const releases = new ReleaseStore(config.releasesDir, config.downloadDir).load();
const owner = { role: 'owner' };
const items = visibleItems(lib, owner);

const pick = t => items.filter(i => i.type === t).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'zh')).map(summary);
const catalog = {
  tools: pick('tool'), skills: pick('skill'), docs: pick('doc'),
  changelog: lib.changelog.slice(0, 2).map(e => ({ date: e.date, items: e.items })),
  updates: [...items].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6).map(i => ({ type: i.type, id: i.id, name: i.name, updated: i.updated }))
};
const details = {};
const assets = [];
for (const it of items) {
  const d = detail(lib, it, owner);
  if (it.type === 'tool') {
    d.release = await releases.forTool(it.id);
    for (const rel of d.release?.releases || []) for (const a of rel.assets) assets.push({ tool: it.id, version: rel.version, release: rel.status, ...a });
  }
  // 演示版用 # 路由，正文中的站内链接改为 #/ 开头
  d.html = d.html.replace(/href="\/(tools|skills|docs)\//g, 'href="#/$1/');
  details[`${it.type}:${it.id}`] = d;
}
const status = {
  problems: [],
  counts: { tool: catalog.tools.length, skill: catalog.skills.length, doc: catalog.docs.length, draft: lib.items.filter(i => i.status === 'draft').length, ownerOnly: items.filter(i => i.visibility === 'owner').length },
  assets,
  downloads: []
};

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'js'), { recursive: true });
for (const f of ['icons.js', 'api.js', 'ui.js', 'app.js', 'palette.js']) fs.copyFileSync(path.join(config.publicDir, 'js', f), path.join(out, 'js', f));
fs.copyFileSync(path.join(config.publicDir, 'styles.css'), path.join(out, 'styles.css'));
fs.copyFileSync(path.join(config.root, 'scripts/demo/demo.js'), path.join(out, 'js/demo.js'));
const changelog = lib.changelog.map(e => ({ date: e.date, html: e.html.replace(/href="\/(tools|skills|docs)\//g, 'href="#/$1/') }));
fs.writeFileSync(path.join(out, 'js/demo-data.js'), `export const DATA = ${JSON.stringify({ catalog, items: details, status, changelog })};\n`);
fs.writeFileSync(path.join(out, 'index.html'), `<title>造物册</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="zw-demo" content="1">
<link rel="stylesheet" href="styles.css">
<style>.demo-flag{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:60;font:600 12px/1 system-ui,sans-serif;background:rgba(29,29,31,.86);color:#fff;padding:8px 14px;border-radius:980px;backdrop-filter:blur(12px)}</style>
<div id="app"></div>
<div class="demo-flag">演示版 · 数据为本站真实内容，操作不会保存</div>
<script type="module" src="js/app.js"></script>
`);
console.log(`演示版已生成：${path.relative(config.root, out)}/（${items.length} 条内容）`);
