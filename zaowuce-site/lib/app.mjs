import fs from 'node:fs';
import path from 'node:path';
import { json, error, send, readJson, parseCookies, cookie, serveStatic, clientIp, SECURITY_HEADERS } from './http.mjs';
import { AccountStore, SessionStore, LoginLimiter, publicAccount, tempPassword } from './auth.mjs';
import { loadContent, visibleItems, summary, detail } from './content.mjs';
import { ReleaseStore } from './releases.mjs';
import { PrefStore, FeedbackLog } from './prefs.mjs';

const SID = 'zw_sid';

export function createApp(config) {
  const accounts = new AccountStore(config.dataDir);
  const sessions = new SessionStore({ idleMs: config.sessionIdleMs, maxMs: config.sessionMaxMs });
  const limiter = new LoginLimiter();
  const releases = new ReleaseStore(config.releasesDir, config.downloadDir).load();
  const prefs = new PrefStore(config.dataDir);
  const feedback = new FeedbackLog(config.dataDir);
  let lib = loadContent(config.contentDir);

  const problems = () => [...lib.errors, ...releases.errors];

  function reload() {
    const next = loadContent(config.contentDir);
    releases.load();
    // 新内容有错误时保留旧内容继续服务
    if (!next.errors.length) lib = next;
    return next.errors.concat(releases.errors);
  }

  function logDownload(entry) {
    try {
      fs.mkdirSync(config.dataDir, { recursive: true, mode: 0o700 });
      fs.appendFileSync(path.join(config.dataDir, 'downloads.log'), JSON.stringify(entry) + '\n', { mode: 0o600 });
    } catch (e) {
      console.error('写入下载记录失败', e.message);
    }
  }

  function readDownloadLog(limit = 30) {
    try {
      const lines = fs.readFileSync(path.join(config.dataDir, 'downloads.log'), 'utf8').trim().split('\n');
      return lines.slice(-limit).reverse().map(l => JSON.parse(l));
    } catch { return []; }
  }

  /** 每次请求都重新确认账号仍可用：停用后旧会话立即失效。 */
  function currentUser(req) {
    const token = parseCookies(req.headers.cookie)[SID];
    const s = sessions.get(token);
    if (!s) return null;
    const a = accounts.get(s.account);
    if (!a || !a.enabled) { sessions.destroy(token); return null; }
    return { ...a, token };
  }

  function sameOrigin(req) {
    if (req.headers['x-zaowuce'] !== '1') return false;
    const origin = req.headers.origin;
    if (!origin) return true;
    try { return new URL(origin).host === req.headers.host; } catch { return false; }
  }

  const sessionCookie = (token, maxAge) => cookie(SID, token, { maxAge, secure: config.cookieSecure });

  const routes = [];
  const route = (method, pattern, handler, opts = {}) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ method, re, keys, handler, auth: opts.auth ?? true, owner: !!opts.owner, allowMustChange: !!opts.allowMustChange });
  };

  route('GET', '/healthz', (req, res) => send(res, 200, 'ok', { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }), { auth: false });

  route('POST', '/api/login', async (req, res) => {
    const { account, password } = await readJson(req);
    const ip = clientIp(req, config.trustProxy);
    const acc = String(account || '').trim().toLowerCase();
    if (limiter.blocked(`ip:${ip}`, `acc:${acc}`)) return error(res, 429, 'too_many', '尝试次数过多，请 15 分钟后再试');
    const a = await accounts.verify(acc, password);
    if (!a) { limiter.fail(`ip:${ip}`, `acc:${acc}`); return error(res, 401, 'bad_login', '账号或密码不正确'); }
    if (!a.enabled) return error(res, 403, 'disabled', '这个账号已停用，如有疑问请联系站主');
    limiter.reset(`acc:${acc}`);
    accounts.update(a.account, { lastLoginAt: new Date().toISOString() });
    const token = sessions.create(a.account);
    json(res, 200, { user: publicAccount(a) }, { 'Set-Cookie': sessionCookie(token, config.sessionMaxMs) });
  }, { auth: false });

  route('POST', '/api/logout', (req, res, { user }) => {
    sessions.destroy(user.token);
    json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
  }, { allowMustChange: true });

  route('GET', '/api/me', (req, res, { user }) => json(res, 200, { user: publicAccount(user) }), { allowMustChange: true });

  route('POST', '/api/password', async (req, res, { user }) => {
    const { current, next } = await readJson(req);
    if (!(await accounts.verify(user.account, current))) return error(res, 400, 'bad_current', '当前密码不正确');
    if (String(next || '') === String(current)) return error(res, 400, 'same_password', '新密码不能与当前密码相同');
    await accounts.setPassword(user.account, next, { mustChange: false });
    sessions.revokeAccount(user.account, user.token);
    json(res, 200, { ok: true });
  }, { allowMustChange: true });

  route('GET', '/api/catalog', (req, res, { user }) => {
    const items = visibleItems(lib, user);
    const pick = t => items.filter(i => i.type === t).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'zh')).map(summary);
    const updates = [...items].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6).map(i => ({ type: i.type, id: i.id, name: i.name, updated: i.updated }));
    json(res, 200, { tools: pick('tool'), skills: pick('skill'), docs: pick('doc'), updates, changelog: lib.changelog.slice(0, 2).map(e => ({ date: e.date, items: e.items })) });
  });

  route('GET', '/api/changelog', (req, res) => json(res, 200, { entries: lib.changelog.map(e => ({ date: e.date, html: e.html })) }));

  const visibleKeys = user => new Set(visibleItems(lib, user).map(i => `${i.type}:${i.id}`));

  route('GET', '/api/favorites', (req, res, { user }) => {
    const keys = visibleKeys(user);
    json(res, 200, { favorites: prefs.favorites(user.account).filter(k => keys.has(k)) });
  });

  route('POST', '/api/favorites', async (req, res, { user }) => {
    const { key, on } = await readJson(req);
    const keys = visibleKeys(user);
    if (!keys.has(String(key))) return error(res, 404, 'not_found', '没有找到这条内容');
    const list = prefs.setFavorite(user.account, String(key), !!on);
    json(res, 200, { favorites: list.filter(k => keys.has(k)) });
  });

  route('POST', '/api/feedback', async (req, res, { user }) => {
    const { key, helpful, comment } = await readJson(req);
    if (!visibleKeys(user).has(String(key))) return error(res, 404, 'not_found', '没有找到这条内容');
    if (typeof helpful !== 'boolean') return error(res, 400, 'bad_feedback', '请选择有帮助或没帮助');
    const text = String(comment || '').trim();
    if (text.length > 500) return error(res, 400, 'too_long', '补充说明最多 500 字');
    feedback.add({ at: new Date().toISOString(), account: user.account, key: String(key), helpful, comment: text });
    json(res, 201, { ok: true });
  });

  route('GET', '/api/items/:type/:id', async (req, res, { user, params }) => {
    const item = visibleItems(lib, user).find(i => i.type === params.type && i.id === params.id);
    if (!item) return error(res, 404, 'not_found', '没有找到这条内容，它可能已被撤回或你没有查看权限');
    const out = detail(lib, item, user);
    if (item.type === 'tool') out.release = await releases.forTool(item.id);
    json(res, 200, out);
  });

  route('GET', '/api/skills/:id/file', (req, res, { user, params }) => {
    const item = visibleItems(lib, user).find(i => i.type === 'skill' && i.id === params.id);
    if (!item) return error(res, 404, 'not_found', '没有找到这份 SKILL');
    const name = encodeURIComponent(`${item.name}-${item.meta.version}.md`);
    send(res, 200, `# ${item.name}\n\n${item.raw}`, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${name}`,
      'Cache-Control': 'no-store'
    });
  });

  route('GET', '/downloads/:asset', async (req, res, { user, params }) => {
    const found = releases.find(params.asset);
    if (!found) return error(res, 404, 'not_found', '没有这个下载文件');
    const tool = visibleItems(lib, user).find(i => i.type === 'tool' && i.id === found.manifest.tool);
    if (!tool) return error(res, 404, 'not_found', '没有这个下载文件');
    const state = await releases.check(found.asset, found.release);
    if (state !== 'ok') {
      const msg = { pending: '这个文件还没有上传或登记', withdrawn: '这个版本已撤回，请改用替代版本', integrity_failed: '文件校验未通过，已暂停下载，站主修复后会恢复' }[state];
      return error(res, 409, state, msg);
    }
    logDownload({ at: new Date().toISOString(), account: user.account, asset: found.asset.id, version: found.release.version });
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/octet-stream',
      'Content-Length': found.asset.size,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(found.asset.file)}`,
      'Cache-Control': 'no-store',
      'X-Checksum-SHA256': found.asset.sha256
    });
    fs.createReadStream(found.path).pipe(res);
  });

  // ---------- 所有者 ----------
  route('GET', '/api/admin/members', (req, res) => json(res, 200, { members: accounts.list().map(publicAccount) }), { owner: true });

  route('POST', '/api/admin/members', async (req, res) => {
    const { account, name, role } = await readJson(req);
    const { account: a, password } = await accounts.create({ account, name, role: role === 'owner' ? 'owner' : 'member' });
    json(res, 201, { member: publicAccount(a), password });
  }, { owner: true });

  route('POST', '/api/admin/members/:account/:action', async (req, res, { user, params }) => {
    const target = accounts.get(params.account);
    if (!target) return error(res, 404, 'not_found', '账号不存在');
    if (target.account === user.account) return error(res, 400, 'self', '不能对自己的账号做这个操作');
    if (params.action === 'disable') {
      accounts.update(target.account, { enabled: false });
      sessions.revokeAccount(target.account);
      return json(res, 200, { member: publicAccount(accounts.get(target.account)) });
    }
    if (params.action === 'enable') {
      accounts.update(target.account, { enabled: true });
      return json(res, 200, { member: publicAccount(accounts.get(target.account)) });
    }
    if (params.action === 'reset') {
      const password = tempPassword();
      await accounts.setPassword(target.account, password, { mustChange: true });
      sessions.revokeAccount(target.account);
      return json(res, 200, { member: publicAccount(accounts.get(target.account)), password });
    }
    error(res, 404, 'not_found', '不支持这个操作');
  }, { owner: true });

  route('GET', '/api/admin/status', async (req, res) => {
    const assets = [];
    for (const m of releases.manifests.values()) {
      const r = await releases.forTool(m.tool);
      for (const rel of r.releases) for (const a of rel.assets) assets.push({ tool: m.tool, version: rel.version, release: rel.status, ...a });
    }
    const counts = { tool: 0, skill: 0, doc: 0, draft: 0, ownerOnly: 0 };
    for (const i of lib.items) {
      if (i.status === 'draft') counts.draft++;
      else { counts[i.type]++; if (i.visibility === 'owner') counts.ownerOnly++; }
    }
    const names = new Map(lib.items.map(i => [`${i.type}:${i.id}`, i.name]));
    const fb = feedback.all();
    const byKey = new Map();
    for (const f of fb) {
      const s = byKey.get(f.key) || { key: f.key, name: names.get(f.key) || f.key, up: 0, down: 0 };
      f.helpful ? s.up++ : s.down++;
      byKey.set(f.key, s);
    }
    const feedbackSummary = [...byKey.values()].sort((a, b) => b.down - a.down || b.up + b.down - (a.up + a.down));
    const recentFeedback = fb.slice(-30).reverse().map(f => ({ ...f, name: names.get(f.key) || f.key }));
    json(res, 200, { problems: problems(), counts, assets, downloads: readDownloadLog(), sessions: sessions.map.size, feedback: { summary: feedbackSummary, recent: recentFeedback } });
  }, { owner: true });

  async function handle(req, res) {
    const url = new URL(req.url, 'http://local');
    const p = url.pathname;
    try {
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = p.match(r.re);
        if (!m) continue;
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        if (req.method !== 'GET' && !sameOrigin(req)) return error(res, 403, 'bad_origin', '请求来源不正确，请刷新页面后重试');
        let user = null;
        if (r.auth) {
          user = currentUser(req);
          if (!user) return error(res, 401, 'login_required', '请先登录');
          if (user.mustChange && !r.allowMustChange) return error(res, 403, 'must_change', '请先修改初始密码');
          if (r.owner && user.role !== 'owner') return error(res, 403, 'forbidden', '只有站点所有者可以进行这个操作');
        }
        return await r.handler(req, res, { user, params, url });
      }
      if (p.startsWith('/api/') || p.startsWith('/downloads/')) return error(res, 404, 'not_found', '接口不存在');
      if (req.method !== 'GET' && req.method !== 'HEAD') return error(res, 405, 'method', '不支持的请求方式');
      // 前端文件：页面外壳可匿名加载，所有内容都来自需要登录的接口
      if (p !== '/' && serveStatic(res, config.publicDir, p)) return;
      if (path.extname(p)) return error(res, 404, 'not_found', '文件不存在');
      serveStatic(res, config.publicDir, '/index.html');
    } catch (e) {
      if (e.status && e.status < 500) return error(res, e.status, e.code || 'bad_request', e.message);
      console.error(e);
      if (!res.headersSent) error(res, 500, 'server_error', '服务器出错了，请稍后重试');
    }
  }

  return { handle, accounts, sessions, releases, prefs, feedback, reload, problems, get lib() { return lib; } };
}
