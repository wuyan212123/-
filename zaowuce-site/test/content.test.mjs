import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadContent, visibleItems } from '../lib/content.mjs';
import { ReleaseStore } from '../lib/releases.mjs';
import { loadConfig } from '../lib/config.mjs';

const config = loadConfig({});

test('仓库内容与发布清单没有错误', () => {
  const lib = loadContent(config.contentDir);
  assert.deepEqual(lib.errors, []);
  assert.ok(lib.items.length > 0);
  const rel = new ReleaseStore(config.releasesDir, config.downloadDir).load();
  assert.deepEqual(rel.errors, []);
});

function tmpContent(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zw-content-'));
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  }
  return dir;
}

test('草稿不出现；仅所有者可见的内容只给所有者', () => {
  const dir = tmpContent({
    'docs/a.md': '---\nid: a\nname: A\nsummary: s\nkind: 入门\nupdated: 2026-10-16\n---\n',
    'docs/b.md': '---\nid: b\nname: B\nsummary: s\nkind: 入门\nstatus: draft\nupdated: 2026-10-16\n---\n',
    'docs/c.md': '---\nid: c\nname: C\nsummary: s\nkind: 入门\nvisibility: owner\nupdated: 2026-10-16\n---\n'
  });
  const lib = loadContent(dir);
  assert.deepEqual(lib.errors, []);
  assert.deepEqual(visibleItems(lib, { role: 'member' }).map(i => i.id), ['a']);
  assert.deepEqual(visibleItems(lib, { role: 'owner' }).map(i => i.id).sort(), ['a', 'c']);
});

test('缺字段、错误枚举、断开的关联、重复别名都会报错', () => {
  const dir = tmpContent({
    'tools/z.md': '---\nid: z\nname: Z\nupdated: 2026-10-16\nrun_mode: doc\nmaturity: formal\n---\n',
    'tools/x.md': '---\nid: x\nname: X\nsummary: s\nrun_mode: cloud\nmaturity: formal\nupdated: 2026-10-16\naliases: [旧名]\n---\n',
    'tools/y.md': '---\nid: y\nname: Y\nsummary: s\nrun_mode: doc\nmaturity: formal\nupdated: 2026-10-16\naliases: [旧名]\n---\n',
    'docs/d.md': '---\nid: d\nname: D\nsummary: s\nkind: 入门\nupdated: 2026-10-16\ntools: [none]\n---\n'
  });
  const { errors } = loadContent(dir);
  const all = errors.join('\n');
  assert.match(all, /run_mode/);
  assert.match(all, /缺少「summary」/);
  assert.match(all, /tool:none/);
});
