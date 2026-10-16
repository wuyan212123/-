import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const int = (v, fallback) => {
  const n = Number.parseInt(v ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
};

export function loadConfig(env = process.env) {
  return {
    root: ROOT,
    host: env.HOST || '127.0.0.1',
    port: int(env.PORT, 8080),
    contentDir: path.resolve(env.CONTENT_DIR || path.join(ROOT, 'content')),
    releasesDir: path.resolve(env.RELEASES_DIR || path.join(ROOT, 'releases')),
    downloadDir: path.resolve(env.DOWNLOAD_DIR || path.join(ROOT, 'downloads')),
    dataDir: path.resolve(env.DATA_DIR || path.join(ROOT, 'data')),
    publicDir: path.join(ROOT, 'public'),
    // 生产环境经 HTTPS 访问时必须为 1，Cookie 才会带 Secure
    cookieSecure: env.COOKIE_SECURE === '1',
    // 无操作多久后会话失效；会话最长存活时间
    sessionIdleMs: int(env.SESSION_IDLE_HOURS, 12) * 3600_000,
    sessionMaxMs: int(env.SESSION_MAX_DAYS, 7) * 86400_000,
    // Nginx 反向代理时信任 X-Forwarded-For，用于登录限速
    trustProxy: env.TRUST_PROXY === '1'
  };
}
