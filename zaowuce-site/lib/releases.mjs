import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RELEASE_STATUS = ['current', 'archived', 'withdrawn'];
// 练习样表等附件不属于某个版本，按「当前可用」处理
const ATTACHMENT_RELEASE = { version: '附件', status: 'current' };

export function sha256File(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(file).on('error', reject).on('data', d => h.update(d)).on('end', () => resolve(h.digest('hex')));
  });
}

/**
 * 发布清单：releases/<工具 ID>.json。
 * 每个下载文件都登记大小和 SHA256；服务器上的实际文件与登记不一致时停止提供下载。
 */
export class ReleaseStore {
  constructor(releasesDir, downloadDir) {
    this.releasesDir = releasesDir;
    this.downloadDir = downloadDir;
    this.manifests = new Map();
    this.hashCache = new Map();
    this.errors = [];
  }

  load() {
    this.manifests.clear();
    this.errors = [];
    let files = [];
    try { files = fs.readdirSync(this.releasesDir).filter(f => f.endsWith('.json')); } catch { return this; }
    for (const f of files) {
      try {
        const m = JSON.parse(fs.readFileSync(path.join(this.releasesDir, f), 'utf8'));
        this.validate(m, f);
        this.manifests.set(m.tool, m);
      } catch (e) {
        this.errors.push(`releases/${f}：${e.message}`);
      }
    }
    return this;
  }

  validate(m, f) {
    if (path.basename(f, '.json') !== m.tool) throw new Error('文件名应与 tool 字段一致');
    if (!Array.isArray(m.releases)) throw new Error('缺少 releases 列表');
    const ids = new Set();
    const assetCheck = (a, where) => {
      if (!a.id || !a.file || !a.label) throw new Error(`${where}有文件缺少 id、file 或 label`);
      if (ids.has(a.id)) throw new Error(`文件 ID「${a.id}」重复`);
      if (a.file.includes('/') || a.file.includes('\\') || a.file.startsWith('.')) throw new Error(`文件名「${a.file}」不能包含路径`);
      if (a.sha256 != null && !/^[a-f0-9]{64}$/.test(a.sha256)) throw new Error(`「${a.id}」的 sha256 格式不对`);
      ids.add(a.id);
    };
    for (const a of m.attachments || []) assetCheck(a, '附件中');
    for (const r of m.releases) {
      if (!r.version) throw new Error('有一个发布缺少 version');
      if (!RELEASE_STATUS.includes(r.status)) throw new Error(`v${r.version} 的 status 只能是 ${RELEASE_STATUS.join('／')}`);
      for (const a of r.assets || []) assetCheck(a, `v${r.version} `);
    }
    if (m.recommended != null && !m.releases.some(r => r.version === m.recommended && r.status === 'current')) {
      throw new Error(`推荐版本 ${m.recommended} 不在可用的发布中`);
    }
  }

  /** 核对一个文件：未登记或未上传为 pending，内容不符为 integrity_failed。 */
  async check(asset, release) {
    if (release.status === 'withdrawn') return 'withdrawn';
    if (!asset.sha256 || !asset.size) return 'pending';
    const file = path.join(this.downloadDir, asset.file);
    let stat;
    try { stat = fs.statSync(file); } catch { return 'pending'; }
    if (stat.size !== asset.size) return 'integrity_failed';
    const cached = this.hashCache.get(file);
    let hash = cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size ? cached.sha256 : null;
    if (!hash) {
      hash = await sha256File(file);
      this.hashCache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, sha256: hash });
    }
    return hash === asset.sha256 ? 'ok' : 'integrity_failed';
  }

  /** 给页面用的发布信息：带上每个文件的实时状态，不暴露服务器路径。 */
  async forTool(toolId) {
    const m = this.manifests.get(toolId);
    if (!m) return null;
    const releases = [];
    for (const r of m.releases) {
      const assets = [];
      for (const a of r.assets || []) {
        assets.push({ id: a.id, label: a.label, os: a.os || null, variant: a.variant || null, size: a.size || null, sha256: a.sha256 || null, state: await this.check(a, r) });
      }
      releases.push({ version: r.version, status: r.status, date: r.date || null, notes: r.notes || '', verified_on: r.verified_on || [], replaced_by: r.replaced_by || null, assets });
    }
    const attachments = [];
    for (const a of m.attachments || []) attachments.push({ id: a.id, label: a.label, size: a.size || null, sha256: a.sha256 || null, state: await this.check(a, ATTACHMENT_RELEASE) });
    return { tool: m.tool, attachments, recommended: m.recommended ?? null, versions: m.versions || {}, notice: m.notice || null, known_limits: m.known_limits || [], releases };
  }

  find(assetId) {
    for (const m of this.manifests.values()) {
      const att = (m.attachments || []).find(x => x.id === assetId);
      if (att) return { manifest: m, release: ATTACHMENT_RELEASE, asset: att, path: path.join(this.downloadDir, att.file) };
      for (const r of m.releases) {
        const a = (r.assets || []).find(x => x.id === assetId);
        if (a) return { manifest: m, release: r, asset: a, path: path.join(this.downloadDir, a.file) };
      }
    }
    return null;
  }
}
