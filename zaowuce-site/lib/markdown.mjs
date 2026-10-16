/**
 * 本站内容用的 Markdown 渲染器。先转义全部 HTML，再生成有限的标签，
 * 内容文件里写的 HTML 不会被执行。
 *
 * 支持：## 标题、段落、- 列表、1. 列表、- [ ] 核对清单、表格、``` 代码块、
 * > [!info|ok|warn|danger] 标题 提示框、---、**粗体**、`代码`、[链接](地址)。
 */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ESC[c]);

const CALLOUTS = new Set(['info', 'ok', 'warn', 'danger']);

function safeUrl(url) {
  const u = url.trim();
  if (/^(https?:\/\/|\/|#|mailto:)/i.test(u)) return u;
  return null;
}

export function inline(text) {
  const codes = [];
  let s = escapeHtml(text).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    // url 已被转义，还原 &amp; 后再判断
    const raw = url.replace(/&amp;/g, '&');
    const ok = safeUrl(raw);
    if (!ok) return label;
    const ext = /^https?:/i.test(ok);
    return `<a href="${escapeHtml(ok)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

export function renderMarkdown(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const toc = [];
  const codeBlocks = [];
  let i = 0;

  const isBlockStart = l => /^(#{2,4}\s|```|>\s?|[-*]\s|\d+\.\s|\|)/.test(l) || /^---+\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^```\s*([\w-]*)/);
    if (fence) {
      const lang = fence[1] || '';
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      const code = buf.join('\n');
      codeBlocks.push({ lang, code });
      const cls = lang ? ` class="lang-${escapeHtml(lang)}"` : '';
      const copy = lang === 'prompt' ? ' data-copyable="true"' : '';
      out.push(`<pre${cls}${copy}><code>${escapeHtml(code)}</code></pre>`);
      continue;
    }

    const h = line.match(/^(#{2,4})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      if (level === 2) {
        const id = `s${toc.length + 1}`;
        toc.push({ id, title: text });
        out.push(`<h2 id="${id}">${inline(text)}</h2>`);
      } else {
        out.push(`<h${level}>${inline(text)}</h${level}>`);
      }
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const m = buf[0].match(/^\[!(\w+)\]\s*(.*)$/);
      if (m && CALLOUTS.has(m[1])) {
        const rest = buf.slice(1).join(' ').trim();
        out.push(`<div class="callout ${m[1]}"><strong>${inline(m[2])}</strong>${rest ? `<p>${inline(rest)}</p>` : ''}</div>`);
      } else {
        out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      }
      continue;
    }

    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const row = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = row(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(row(lines[i++]));
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${head.map((_, k) => `<td>${inline(r[k] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ''));
      if (items.every(t => /^\[[ xX]\]\s/.test(t))) {
        out.push(`<ul class="checklist">${items.map(t => `<li><label><input type="checkbox"${/^\[[xX]\]/.test(t) ? ' checked' : ''}> <span>${inline(t.slice(4))}</span></label></li>`).join('')}</ul>`);
      } else {
        out.push(`<ul>${items.map(t => `<li>${inline(t)}</li>`).join('')}</ul>`);
      }
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ''));
      out.push(`<ol>${items.map(t => `<li>${inline(t)}</li>`).join('')}</ol>`);
      continue;
    }

    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(joinLines(buf))}</p>`);
  }

  return { html: out.join('\n'), toc, codeBlocks };
}

/** 中文换行直接相连，英文之间补一个空格。 */
function joinLines(lines) {
  const cjk = /[　-鿿＀-￯]/;
  return lines.map(l => l.trim()).reduce((acc, l) => {
    if (!acc) return l;
    return cjk.test(acc.at(-1)) || cjk.test(l[0]) ? acc + l : `${acc} ${l}`;
  }, '');
}

/** 去掉 Markdown 标记后的纯文本，用于搜索。 */
export function plainText(src) {
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`|\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
