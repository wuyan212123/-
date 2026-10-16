import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const SCRYPT = { N: 16384, r: 8, p: 1 };
const ACCOUNT_RE = /^[a-z0-9][a-z0-9_.-]{1,31}$/;
export const MIN_PASSWORD = 8;

export async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const key = await scrypt(String(password), salt, 64, SCRYPT);
  return { salt, hash: key.toString('hex') };
}

async function verifyPassword(password, salt, hash) {
  const key = await scrypt(String(password), salt, 64, SCRYPT);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === key.length && crypto.timingSafeEqual(key, expected);
}

/** 不含易混淆字符的临时密码，交给成员首次登录后自行修改。 */
export function tempPassword(len = 12) {
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes, b => abc[b % abc.length]).join('');
}

export function publicAccount(a) {
  return { account: a.account, name: a.name, role: a.role, enabled: a.enabled, mustChange: !!a.mustChange, createdAt: a.createdAt, lastLoginAt: a.lastLoginAt || null };
}

/**
 * 账号保存在一个 JSON 文件里（成员不多，不需要数据库）。
 * 每次读取前检查文件修改时间，命令行脚本改动后无需重启服务。
 */
export class AccountStore {
  constructor(dataDir) {
    this.file = path.join(dataDir, 'accounts.json');
    this.dataDir = dataDir;
    this.mtime = 0;
    this.accounts = [];
  }

  load() {
    let stat;
    try { stat = fs.statSync(this.file); } catch { this.accounts = []; this.mtime = 0; return this.accounts; }
    if (stat.mtimeMs !== this.mtime) {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.accounts = Array.isArray(raw.accounts) ? raw.accounts : [];
      this.mtime = stat.mtimeMs;
    }
    return this.accounts;
  }

  save() {
    fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ accounts: this.accounts }, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, this.file);
    this.mtime = fs.statSync(this.file).mtimeMs;
  }

  list() { return this.load(); }
  get(account) { return this.load().find(a => a.account === account) || null; }

  async create({ account, name, role = 'member', password, mustChange = true }) {
    account = String(account || '').trim().toLowerCase();
    name = String(name || '').trim();
    if (!ACCOUNT_RE.test(account)) throw fail('bad_account', '账号只能使用小写字母、数字和 . _ -，长度 2～32 位，且以字母或数字开头');
    if (!name || name.length > 40) throw fail('bad_name', '请填写 1～40 个字的姓名');
    if (!['owner', 'member'].includes(role)) throw fail('bad_role', '角色只能是所有者或成员');
    if (this.get(account)) throw fail('exists', '这个账号已经存在');
    const pw = password ?? tempPassword();
    if (String(pw).length < MIN_PASSWORD) throw fail('weak_password', `密码至少 ${MIN_PASSWORD} 位`);
    const now = new Date().toISOString();
    const rec = { account, name, role, enabled: true, mustChange, ...(await hashPassword(pw)), createdAt: now, updatedAt: now };
    this.accounts.push(rec);
    this.save();
    return { account: rec, password: pw };
  }

  async verify(account, password) {
    const a = this.get(String(account || '').trim().toLowerCase());
    // 账号不存在时也计算一次哈希，避免通过响应时间判断账号是否存在
    if (!a) { await hashPassword(password, 'x'.repeat(32)); return null; }
    const ok = await verifyPassword(password, a.salt, a.hash);
    return ok ? a : null;
  }

  async setPassword(account, password, { mustChange = false } = {}) {
    const a = this.get(account);
    if (!a) throw fail('not_found', '账号不存在');
    if (String(password).length < MIN_PASSWORD) throw fail('weak_password', `密码至少 ${MIN_PASSWORD} 位`);
    Object.assign(a, await hashPassword(password), { mustChange, updatedAt: new Date().toISOString() });
    this.save();
    return a;
  }

  update(account, fields) {
    const a = this.get(account);
    if (!a) throw fail('not_found', '账号不存在');
    Object.assign(a, fields, { updatedAt: new Date().toISOString() });
    this.save();
    return a;
  }
}

export class SessionStore {
  constructor({ idleMs, maxMs }) {
    this.idleMs = idleMs;
    this.maxMs = maxMs;
    this.map = new Map();
    this.timer = setInterval(() => this.sweep(), 10 * 60_000);
    this.timer.unref();
  }

  create(account) {
    const token = crypto.randomBytes(32).toString('base64url');
    const now = Date.now();
    this.map.set(token, { account, created: now, last: now });
    return token;
  }

  get(token) {
    if (!token) return null;
    const s = this.map.get(token);
    if (!s) return null;
    const now = Date.now();
    if (now - s.last > this.idleMs || now - s.created > this.maxMs) { this.map.delete(token); return null; }
    s.last = now;
    return s;
  }

  destroy(token) { this.map.delete(token); }

  /** 停用、重置密码时调用：该账号所有已登录的设备立即失效。 */
  revokeAccount(account, except) {
    for (const [t, s] of this.map) if (s.account === account && t !== except) this.map.delete(t);
  }

  sweep() { for (const t of this.map.keys()) this.get(t); }
  close() { clearInterval(this.timer); }
}

/** 同一来源 15 分钟内失败 5 次即暂停登录。 */
export class LoginLimiter {
  constructor({ max = 5, windowMs = 15 * 60_000 } = {}) {
    this.max = max;
    this.windowMs = windowMs;
    this.fails = new Map();
  }
  recent(key) {
    const now = Date.now();
    const list = (this.fails.get(key) || []).filter(t => now - t < this.windowMs);
    this.fails.set(key, list);
    return list;
  }
  blocked(...keys) { return keys.some(k => this.recent(k).length >= this.max); }
  fail(...keys) { for (const k of keys) this.recent(k).push(Date.now()); }
  reset(...keys) { for (const k of keys) this.fails.delete(k); }
}

function fail(code, message, status = 400) {
  return Object.assign(new Error(message), { code, status });
}
