// 发布前检查：内容文件与发布清单。有错误时以非零状态退出。
import { loadConfig } from '../lib/config.mjs';
import { loadContent } from '../lib/content.mjs';
import { ReleaseStore } from '../lib/releases.mjs';

const config = loadConfig();
const lib = loadContent(config.contentDir);
const releases = new ReleaseStore(config.releasesDir, config.downloadDir).load();
const errors = [...lib.errors, ...releases.errors];

const count = t => lib.items.filter(i => i.type === t && i.status === 'published').length;
console.log(`内容：工具 ${count('tool')} · SKILL ${count('skill')} · 教程与问答 ${count('doc')} · 草稿 ${lib.items.filter(i => i.status === 'draft').length}`);

for (const t of lib.items.filter(i => i.type === 'tool' && i.meta.run_mode === 'download')) {
  if (!releases.manifests.has(t.id)) errors.push(`${t.file}：下载型工具缺少发布清单 releases/${t.id}.json`);
}

const states = { ok: '可下载', pending: '待上传或登记', integrity_failed: '校验未通过', withdrawn: '已撤回' };
for (const m of releases.manifests.values()) {
  const r = await releases.forTool(m.tool);
  console.log(`\n${m.tool}（推荐版本：${r.recommended ?? '未确定'}）`);
  for (const a of r.attachments) console.log(`  附件 ${a.label.padEnd(16)} ${states[a.state]}`);
  for (const rel of r.releases) for (const a of rel.assets) {
    console.log(`  v${rel.version} ${a.label.padEnd(14)} ${states[a.state]}`);
    if (a.state === 'integrity_failed') errors.push(`${a.id}：服务器上的文件与登记的大小或 SHA256 不一致`);
  }
}

if (errors.length) {
  console.error(`\n发现 ${errors.length} 个问题：`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\n检查通过。');
