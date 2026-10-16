// 演示版接口：数据由 build-demo 从真实内容生成，账号与操作只保存在当前页面内存里
import { DATA } from './demo-data.js';
import { ApiError } from './api.js';

let user = null;
const members = [
  { account: 'owner', name: '站主', role: 'owner', enabled: true, mustChange: false, lastLoginAt: new Date().toISOString() },
  { account: 'member-a', name: '示例成员 A', role: 'member', enabled: true, mustChange: false, lastLoginAt: null },
  { account: 'member-b', name: '示例成员 B', role: 'member', enabled: true, mustChange: true, lastLoginAt: null },
  { account: 'member-c', name: '示例成员 C', role: 'member', enabled: false, mustChange: false, lastLoginAt: null }
];
const fakePassword = () => Array.from({ length: 12 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');

export async function demoBackend(path, { method, body }) {
  await new Promise(r => setTimeout(r, 120));
  const p = path.split('?')[0];
  if (p === '/api/login') {
    user = { account: 'owner', name: '站主', role: 'owner', enabled: true, mustChange: false };
    return { user };
  }
  if (p === '/api/logout') { user = null; return { ok: true }; }
  if (!user) throw new ApiError(401, 'login_required', '请先登录');
  if (p === '/api/me') return { user };
  if (p === '/api/password') {
    if (!body?.next || body.next.length < 8) throw new ApiError(400, 'weak_password', '密码至少 8 位');
    return { ok: true };
  }
  if (p === '/api/catalog') return DATA.catalog;
  let m = p.match(/^\/api\/items\/(\w+)\/([\w-]+)$/);
  if (m) {
    const it = DATA.items[`${m[1]}:${m[2]}`];
    if (!it) throw new ApiError(404, 'not_found', '没有找到这条内容');
    return it;
  }
  if (p === '/api/admin/members' && method === 'GET') return { members };
  if (p === '/api/admin/members' && method === 'POST') {
    if (!/^[a-z0-9][a-z0-9_.-]{1,31}$/.test(body.account || '')) throw new ApiError(400, 'bad_account', '账号只能使用小写字母、数字和 . _ -，长度 2～32 位');
    if (members.some(x => x.account === body.account)) throw new ApiError(400, 'exists', '这个账号已经存在');
    const member = { account: body.account, name: body.name, role: body.role, enabled: true, mustChange: true, lastLoginAt: null };
    members.push(member);
    return { member, password: fakePassword() };
  }
  m = p.match(/^\/api\/admin\/members\/([\w.-]+)\/(\w+)$/);
  if (m) {
    const t = members.find(x => x.account === m[1]);
    if (m[2] === 'disable') t.enabled = false;
    if (m[2] === 'enable') t.enabled = true;
    if (m[2] === 'reset') { t.mustChange = true; return { member: t, password: fakePassword() }; }
    return { member: t };
  }
  if (p === '/api/admin/status') return { ...DATA.status, sessions: 1 };
  throw new ApiError(404, 'not_found', '接口不存在');
}
