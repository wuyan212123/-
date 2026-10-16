import http from 'node:http';
import { loadConfig } from './lib/config.mjs';
import { createApp } from './lib/app.mjs';

const config = loadConfig();
const app = createApp(config);

const problems = app.problems();
if (problems.length) {
  console.error('内容或发布清单有错误，请先修正（npm run check 查看详情）：');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
if (!app.accounts.list().some(a => a.role === 'owner')) {
  console.warn('还没有所有者账号。请运行：npm run user -- --account owner --name 站主 --role owner');
}

const server = http.createServer(app.handle);
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.listen(config.port, config.host, () => {
  console.log(`造物册已启动：http://${config.host}:${config.port}`);
});

// systemctl reload 发送 SIGHUP：重新读取内容和发布清单，不中断已登录的会话
process.on('SIGHUP', () => {
  const errs = app.reload();
  if (errs.length) console.error('重新加载发现错误，继续使用上一版内容：\n  - ' + errs.join('\n  - '));
  else console.log('内容已重新加载');
});

const stop = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
