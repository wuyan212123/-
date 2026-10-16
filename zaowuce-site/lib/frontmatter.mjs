/**
 * 解析内容文件头部的 --- 块。只支持本站用到的 YAML 子集：
 *   key: 文本 | true | false | null | 数字
 *   key: [a, b, "c d"]
 *   key:
 *     - a
 *     - b
 */
export function parseFrontMatter(src) {
  const text = src.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 4);
  if (end < 0) throw new Error('头部信息缺少结尾的 ---');
  const head = text.slice(4, end);
  const body = text.slice(text.indexOf('\n', end + 1) + 1);
  const data = {};
  let listKey = null;
  head.split('\n').forEach((line, i) => {
    if (!line.trim() || line.trimStart().startsWith('#')) return;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) { data[listKey].push(scalar(item[1])); return; }
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) throw new Error(`头部第 ${i + 1} 行无法识别：${line}`);
    const [, key, raw] = m;
    listKey = null;
    if (raw === '') { data[key] = []; listKey = key; return; }
    if (raw.startsWith('[')) {
      if (!raw.endsWith(']')) throw new Error(`头部第 ${i + 1} 行的列表缺少 ]`);
      data[key] = splitList(raw.slice(1, -1)).map(scalar);
      return;
    }
    data[key] = scalar(raw);
  });
  return { data, body };
}

function splitList(s) {
  const out = [];
  let cur = '', q = null;
  for (const ch of s) {
    if (q) { if (ch === q) q = null; else cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; continue; }
    if (ch === ',') { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function scalar(raw) {
  let v = raw.replace(/\s+#.*$/, '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}
