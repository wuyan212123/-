import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { createApp } from '../lib/app.mjs';
import { loadConfig } from '../lib/config.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zw-server-'));
const dirs = { data: path.join(tmp, 'data'), downloads: path.join(tmp, 'downloads'), releases: path.join(tmp, 'releases') };
Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));

// 一个真实存在的下载文件 + 一个内容被篡改的文件
const okBytes = Buffer.from('zip-ok');
const badBytes = Buffer.from('zip-bad');
fs.writeFileSync(path.join(dirs.downloads, 'ok.zip'), okBytes);
fs.writeFileSync(path.join(dirs.downloads, 'bad.zip'), badBytes);
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
fs.writeFileSync(path.join(dirs.releases, 'inventory-table-update.json'), JSON.stringify({
  tool: 'inventory-table-update', recommended: null, versions: {},
  releases: [{ version: '9.9.9', status: 'current', assets: [
    { id: 'ok', label: 'OK', file: 'ok.zip', size: okBytes.length, sha256: sha(okBytes) },
    { id: 'bad', label: 'BAD', file: 'bad.zip', size: badBytes.length, sha256: sha(Buffer.from('zip-xxx')) },
    { id: 'pending', label: 'P', file: 'p.zip', size: null, sha256: null }
  ] }]
}));

const config = { ...loadConfig({}), dataDir: dirs.data, downloadDir: dirs.downloads, releasesDir: dirs.releases, port: 0 };
let app, server, base;

before(async () => {
  app = createApp(config);
  await app.accounts.create({ account: 'owner', name: '站主', role: 'owner', password: 'owner-pass-1', mustChange: false });
  await app.accounts.create({ account: 'mem', name: '成员', role: 'member', password: 'member-pass-1', mustChange: false });
  server = http.createServer(app.handle);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); app.sessions.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

async function req(p, { method = 'GET', body, cookie, headers = {} } = {}) {
  const res = await fetch(base + p, {
    method,
    redirect: 'manual',
    headers: { ...(method !== 'GET' ? { 'X-Zaowuce': '1' } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data, headers: res.headers };
}
async function login(account, password) {
  const r = await req('/api/login', { method: 'POST', body: { account, password } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.headers.get('set-cookie').split(';')[0];
}

test('未登录不能读取内容、下载或调用接口', async () => {
  assert.equal((await req('/api/catalog')).status, 401);
  assert.equal((await req('/api/items/tool/inventory-table-update')).status, 401);
  assert.equal((await req('/downloads/ok')).status, 401);
  assert.equal((await req('/api/skills/inventory-check/file')).status, 401);
  // 页面外壳可以匿名加载，但不含任何内容
  const shell = await req('/tools/inventory-table-update');
  assert.equal(shell.status, 200);
  assert.ok(!shell.data.includes('主表'));
});

test('写操作必须带站内请求头，且来源一致', async () => {
  const noHeader = await fetch(base + '/api/login', { method: 'POST', body: '{}' });
  assert.equal(noHeader.status, 403);
  const cross = await req('/api/login', { method: 'POST', body: { account: 'owner', password: 'owner-pass-1' }, headers: { Origin: 'https://evil.example' } });
  assert.equal(cross.status, 403);
});

test('登录后可以读取目录和详情；会话 Cookie 为 HttpOnly', async () => {
  const r = await req('/api/login', { method: 'POST', body: { account: 'mem', password: 'member-pass-1' } });
  assert.match(r.headers.get('set-cookie'), /HttpOnly/);
  assert.match(r.headers.get('set-cookie'), /SameSite=Lax/);
  const cookie = r.headers.get('set-cookie').split(';')[0];
  const cat = await req('/api/catalog', { cookie });
  assert.equal(cat.status, 200);
  assert.ok(cat.data.tools.some(t => t.id === 'inventory-table-update'));
  const item = await req('/api/items/tool/inventory-table-update', { cookie });
  assert.equal(item.status, 200);
  assert.ok(item.data.html.includes('<h2'));
  assert.deepEqual(item.data.release.releases[0].assets.map(a => a.state), ['ok', 'integrity_failed', 'pending']);
});

test('下载：校验通过才提供，篡改或未上传的文件被拒绝', async () => {
  const cookie = await login('mem', 'member-pass-1');
  const ok = await fetch(base + '/downloads/ok', { headers: { Cookie: cookie } });
  assert.equal(ok.status, 200);
  assert.equal(Buffer.from(await ok.arrayBuffer()).toString(), 'zip-ok');
  assert.equal((await req('/downloads/bad', { cookie })).status, 409);
  assert.equal((await req('/downloads/pending', { cookie })).status, 409);
  assert.equal((await req('/downloads/nope', { cookie })).status, 404);
  const log = fs.readFileSync(path.join(dirs.data, 'downloads.log'), 'utf8');
  assert.match(log, /"account":"mem"/);
});

test('成员不能访问管理接口', async () => {
  const cookie = await login('mem', 'member-pass-1');
  assert.equal((await req('/api/admin/members', { cookie })).status, 403);
  assert.equal((await req('/api/admin/members', { method: 'POST', cookie, body: { account: 'x1', name: 'X' } })).status, 403);
});

test('停用成员后，已登录的会话立即失效且无法再登录', async () => {
  const owner = await login('owner', 'owner-pass-1');
  const created = await req('/api/admin/members', { method: 'POST', cookie: owner, body: { account: 'temp', name: '临时' } });
  assert.equal(created.status, 201);
  const pw = created.data.password;
  const tempCookie = await login('temp', pw);
  // 临时密码登录后只能改密码
  assert.equal((await req('/api/catalog', { cookie: tempCookie })).status, 403);
  assert.equal((await req('/api/password', { method: 'POST', cookie: tempCookie, body: { current: pw, next: 'new-pass-123' } })).status, 200);
  assert.equal((await req('/api/catalog', { cookie: tempCookie })).status, 200);

  assert.equal((await req('/api/admin/members/temp/disable', { method: 'POST', cookie: owner })).status, 200);
  assert.equal((await req('/api/catalog', { cookie: tempCookie })).status, 401);
  assert.equal((await req('/api/login', { method: 'POST', body: { account: 'temp', password: 'new-pass-123' } })).status, 403);
  assert.equal((await req('/api/admin/members/owner/disable', { method: 'POST', cookie: owner })).status, 400);
});

test('重置密码后旧密码失效，新的临时密码需要修改', async () => {
  const owner = await login('owner', 'owner-pass-1');
  await req('/api/admin/members', { method: 'POST', cookie: owner, body: { account: 'reset-me', name: '重置' } });
  const r = await req('/api/admin/members/reset-me/reset', { method: 'POST', cookie: owner });
  assert.equal(r.status, 200);
  const c = await login('reset-me', r.data.password);
  assert.equal((await req('/api/me', { cookie: c })).data.user.mustChange, true);
});

test('连续输错密码会被暂停登录', async () => {
  for (let i = 0; i < 5; i++) {
    const r = await req('/api/login', { method: 'POST', body: { account: 'owner', password: 'wrong' }, headers: { 'X-Forwarded-For': '10.0.0.' + i } });
    assert.equal(r.status, 401);
  }
  const blocked = await req('/api/login', { method: 'POST', body: { account: 'owner', password: 'owner-pass-1' } });
  assert.equal(blocked.status, 429);
  app.sessions.close();
});

test('静态文件不能越界读取服务器文件', async () => {
  const raw = await new Promise(resolve => {
    http.get({ host: '127.0.0.1', port: server.address().port, path: '/../lib/auth.mjs' }, res => resolve(res.statusCode));
  });
  assert.notEqual(raw, 200);
  assert.equal((await req('/%2e%2e/lib/auth.mjs')).status, 404);
});
