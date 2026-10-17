import { icon } from './icons.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);

export const MATURITY = {
  formal: ['正式', 'ok'],
  trial: ['试用', 'info'],
  sample: ['示例', 'warn'],
  history: ['历史', ''],
  upcoming: ['待开放', 'info']
};
export const RUN_MODE = {
  download: ['下载后本机运行', 'laptop'],
  browser: ['浏览器内使用', 'globe'],
  online: ['在线服务', 'cloud'],
  doc: ['仅文档', 'file']
};
export const ASSET_STATE = {
  ok: ['校验通过', 'ok'],
  pending: ['待上传', 'warn'],
  integrity_failed: ['校验未通过', 'bad'],
  withdrawn: ['已撤回', '']
};
export const TYPE_LABEL = { tool: '工具', skill: 'SKILL', doc: '知识库' };
export const TYPE_ICON = { tool: 'tools', skill: 'skill', doc: 'book' };

export const maturityTag = m => {
  if (!m) return '';
  const [label, tone] = MATURITY[m] || [m, ''];
  return `<span class="tag dot ${tone}">${esc(label)}</span>`;
};
export const tag = (text, tone = '') => `<span class="tag ${tone}">${esc(text)}</span>`;

export function tile(item) {
  if (item.type === 'tool') return `<span class="tile ${esc(item.run_mode)}">${icon(RUN_MODE[item.run_mode]?.[1] || 'tools')}</span>`;
  if (item.type === 'skill') return `<span class="tile skill">${icon('skill')}</span>`;
  return `<span class="tile doc">${icon('book')}</span>`;
}

export function callout(tone, title, body = '', iconName) {
  const ic = iconName || { info: 'info', ok: 'checkCircle', warn: 'alert', danger: 'alert', bad: 'alert' }[tone] || 'info';
  return `<div class="callout ${tone}">${icon(ic)}<div class="callout-body"><strong>${esc(title)}</strong>${body ? `<span class="soft small">${body}</span>` : ''}</div></div>`;
}

export function fmtBytes(n) {
  if (!n) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i ? 1 : 0)} ${u[i]}`;
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return '夜深了';
  if (h < 11) return '早上好';
  if (h < 13) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export function todayLabel(d = new Date()) {
  const w = '日一二三四五六'[d.getDay()];
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${w}`;
}

/** 在已转义的文本里高亮关键词。 */
export function highlight(text, q) {
  const safe = esc(text);
  if (!q) return safe;
  const needle = esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(needle, 'gi'), m => `<mark>${m}</mark>`);
}

let toastHost;
export function toast(message, tone = '') {
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.className = 'toast-host';
    toastHost.setAttribute('role', 'status');
    toastHost.setAttribute('aria-live', 'polite');
    document.body.append(toastHost);
  }
  const t = document.createElement('div');
  t.className = `toast ${tone}`;
  t.innerHTML = `${icon(tone === 'bad' ? 'alert' : 'check', 'sm')}<span>${esc(message)}</span>`;
  toastHost.append(t);
  setTimeout(() => t.remove(), 2800);
}

export async function copyText(text, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制');
    return true;
  } catch {
    if (fallbackEl) {
      const r = document.createRange();
      r.selectNodeContents(fallbackEl);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
    toast('无法自动复制，已选中文字，请手动复制', 'bad');
    return false;
  }
}
