import fs from 'node:fs';
import path from 'node:path';

const MAX_FAVORITES = 200;

/** 每个成员的个人设置（目前只有收藏），保存在服务器上，换设备登录也在。 */
export class PrefStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.file = path.join(dataDir, 'prefs.json');
    this.data = null;
  }

  load() {
    if (this.data) return this.data;
    try { this.data = JSON.parse(fs.readFileSync(this.file, 'utf8')); } catch { this.data = { accounts: {} }; }
    this.data.accounts ||= {};
    return this.data;
  }

  save() {
    fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, this.file);
  }

  favorites(account) {
    return [...(this.load().accounts[account]?.favorites || [])];
  }

  setFavorite(account, key, on) {
    const d = this.load();
    const p = (d.accounts[account] ||= { favorites: [] });
    p.favorites = p.favorites.filter(k => k !== key);
    if (on) {
      if (p.favorites.length >= MAX_FAVORITES) throw Object.assign(new Error(`收藏最多 ${MAX_FAVORITES} 条`), { status: 400, code: 'too_many' });
      p.favorites.unshift(key);
    }
    this.save();
    return [...p.favorites];
  }
}

/** 「这篇有帮助吗」的反馈，逐行追加，站主在站点状态里查看。 */
export class FeedbackLog {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.file = path.join(dataDir, 'feedback.log');
  }

  add(entry) {
    fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    fs.appendFileSync(this.file, JSON.stringify(entry) + '\n', { mode: 0o600 });
  }

  all() {
    try {
      return fs.readFileSync(this.file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    } catch { return []; }
  }
}
