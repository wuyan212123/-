// 开通账号：npm run user -- --account owner --name 站主 --role owner
// 不传 --password 时生成临时密码，首次登录必须修改。
import { loadConfig } from '../lib/config.mjs';
import { AccountStore } from '../lib/auth.mjs';
import { parseArgs } from './args.mjs';

const args = parseArgs();
if (!args.account || !args.name) {
  console.error('用法：npm run user -- --account <账号> --name <姓名> [--role owner|member] [--password <密码>]');
  process.exit(1);
}
const store = new AccountStore(loadConfig().dataDir);
try {
  const { account, password } = await store.create({
    account: args.account,
    name: args.name,
    role: args.role || 'member',
    password: typeof args.password === 'string' ? args.password : undefined,
    mustChange: typeof args.password !== 'string'
  });
  console.log(`已开通：${account.name}（${account.account}，${account.role === 'owner' ? '所有者' : '成员'}）`);
  if (typeof args.password !== 'string') console.log(`临时密码：${password}\n这个密码只显示这一次，首次登录后需要修改。`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
