// 登记下载文件：把文件复制到 downloads/，计算大小与 SHA256，写回发布清单。
//   npm run release -- --asset inventory-1.0.10-win --file ~/Desktop/xxx.zip
//   npm run release -- --tool inventory-table-update --recommend 1.0.10
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../lib/config.mjs';
import { sha256File } from '../lib/releases.mjs';
import { parseArgs } from './args.mjs';

const args = parseArgs();
const config = loadConfig();
const manifests = fs.readdirSync(config.releasesDir).filter(f => f.endsWith('.json')).map(f => {
  const file = path.join(config.releasesDir, f);
  return { file, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
});
const save = m => fs.writeFileSync(m.file, JSON.stringify(m.data, null, 2) + '\n');

if (args.recommend) {
  const m = manifests.find(x => x.data.tool === args.tool);
  if (!m) { console.error(`没有找到工具 ${args.tool} 的发布清单`); process.exit(1); }
  const rel = m.data.releases.find(r => r.version === args.recommend && r.status === 'current');
  if (!rel) { console.error(`v${args.recommend} 不存在或不是当前可用的发布`); process.exit(1); }
  const pending = (rel.assets || []).filter(a => !a.sha256);
  if (pending.length) { console.error(`v${args.recommend} 还有 ${pending.length} 个文件未登记，先登记再设为推荐`); process.exit(1); }
  m.data.recommended = args.recommend;
  save(m);
  console.log(`已将 v${args.recommend} 设为 ${args.tool} 的推荐版本`);
  process.exit(0);
}

if (!args.asset || !args.file) {
  console.error('用法：npm run release -- --asset <文件 ID> --file <本机文件路径>');
  process.exit(1);
}
let target = null;
for (const m of manifests) {
  const all = [...(m.data.attachments || []), ...m.data.releases.flatMap(r => r.assets || [])];
  const a = all.find(x => x.id === args.asset);
  if (a) { target = { m, a }; break; }
}
if (!target) { console.error(`发布清单中没有文件 ID「${args.asset}」`); process.exit(1); }

const src = path.resolve(String(args.file).replace(/^~(?=$|\/)/, process.env.HOME || '~'));
if (!fs.existsSync(src)) { console.error(`找不到文件：${src}`); process.exit(1); }
fs.mkdirSync(config.downloadDir, { recursive: true });
const dest = path.join(config.downloadDir, target.a.file);
if (path.resolve(src) !== path.resolve(dest)) fs.copyFileSync(src, dest);
target.a.size = fs.statSync(dest).size;
target.a.sha256 = await sha256File(dest);
save(target.m);
console.log(`已登记 ${target.a.label}\n  文件：downloads/${target.a.file}\n  大小：${target.a.size} 字节\n  SHA256：${target.a.sha256}`);
