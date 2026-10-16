import fs from 'node:fs';
import path from 'node:path';
import { parseFrontMatter } from './frontmatter.mjs';
import { renderMarkdown, plainText } from './markdown.mjs';

export const TYPES = ['tool', 'skill', 'doc'];
const DIRS = { tool: 'tools', skill: 'skills', doc: 'docs' };

export const ENUMS = {
  run_mode: ['download', 'browser', 'online', 'doc'],
  maturity: ['formal', 'trial', 'sample', 'history', 'upcoming'],
  status: ['published', 'draft'],
  visibility: ['team', 'owner'],
  kind: ['入门', '教程', '常见问题', '案例']
};

const REQUIRED = {
  tool: ['id', 'name', 'summary', 'run_mode', 'maturity', 'updated'],
  skill: ['id', 'name', 'summary', 'topic', 'maturity', 'version', 'updated'],
  doc: ['id', 'name', 'summary', 'kind', 'updated']
};

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const asList = v => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * 读取 content/ 下全部内容文件，返回内容库与校验错误。
 * 有错误时不应发布：check-content 会以非零状态退出，服务启动也会拒绝。
 */
export function loadContent(contentDir) {
  const items = [];
  const errors = [];

  for (const type of TYPES) {
    const dir = path.join(contentDir, DIRS[type]);
    let files = [];
    try { files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort(); } catch { continue; }
    for (const f of files) {
      const file = path.join(DIRS[type], f);
      try {
        const src = fs.readFileSync(path.join(dir, f), 'utf8');
        const { data, body } = parseFrontMatter(src);
        const item = normalize(type, data, body, file, errors);
        if (item) items.push(item);
      } catch (e) {
        errors.push(`${file}：${e.message}`);
      }
    }
  }

  const byKey = new Map();
  for (const it of items) {
    const key = `${it.type}:${it.id}`;
    if (byKey.has(key)) errors.push(`${it.file}：ID「${it.id}」与 ${byKey.get(key).file} 重复`);
    else byKey.set(key, it);
  }

  // 关联只需在一侧填写，另一侧自动反查
  for (const it of items) {
    for (const ref of [...it.tools.map(t => `tool:${t}`), ...it.related]) {
      if (!byKey.has(ref)) errors.push(`${it.file}：关联的「${ref}」不存在`);
    }
  }
  const tools = items.filter(i => i.type === 'tool');
  for (const t of tools) {
    for (const a of t.aliases) {
      const dup = tools.find(o => o !== t && (o.name === a || o.aliases.includes(a)));
      if (dup) errors.push(`${t.file}：别名「${a}」也被 ${dup.file} 使用，搜索会指向两个工具`);
    }
  }

  return { items, byKey, errors };
}

function normalize(type, d, body, file, errors) {
  const before = errors.length;
  for (const k of REQUIRED[type]) if (d[k] == null || d[k] === '') errors.push(`${file}：缺少「${k}」`);
  if (d.id != null && !ID_RE.test(String(d.id))) errors.push(`${file}：ID「${d.id}」只能用小写字母、数字和 -`);
  if (d.id != null && path.basename(file, '.md') !== String(d.id)) errors.push(`${file}：文件名应与 ID「${d.id}」一致`);
  if (d.updated != null && !DATE_RE.test(String(d.updated))) errors.push(`${file}：updated 应写成 2026-10-16 这样的日期`);
  for (const [k, allowed] of Object.entries(ENUMS)) {
    if (d[k] != null && !allowed.includes(d[k])) errors.push(`${file}：「${k}」只能是 ${allowed.join('／')}，现在是「${d[k]}」`);
  }
  if (errors.length > before) return null;

  const { html, toc, codeBlocks } = renderMarkdown(body);
  return {
    type,
    id: String(d.id),
    file,
    name: String(d.name),
    summary: String(d.summary),
    status: d.status || 'published',
    visibility: d.visibility || 'team',
    updated: String(d.updated),
    order: Number(d.order ?? 100),
    aliases: asList(d.aliases).map(String),
    tags: asList(d.tags).map(String),
    tools: asList(d.tools).map(String),
    related: asList(d.related).map(String),
    // 各类型特有字段原样保留
    meta: Object.fromEntries(Object.entries(d).filter(([k]) => !['id', 'name', 'summary', 'status', 'visibility', 'updated', 'order', 'aliases', 'tags', 'tools', 'related'].includes(k))),
    html,
    toc,
    prompt: codeBlocks.find(c => c.lang === 'prompt')?.code || null,
    raw: body,
    text: plainText(body)
  };
}

/** 当前用户能看到的内容：草稿一律不出现；owner 可见范围仅所有者能看。 */
export function visibleItems(lib, user) {
  return lib.items.filter(i => i.status === 'published' && (i.visibility === 'team' || user?.role === 'owner'));
}

export function summary(i) {
  return { type: i.type, id: i.id, name: i.name, summary: i.summary, updated: i.updated, order: i.order, aliases: i.aliases, tags: i.tags, tools: i.tools, visibility: i.visibility, ...i.meta };
}

/** 详情 = 摘要 + 正文 + 双向关联（只包含当前用户能看的条目）。 */
export function detail(lib, item, user) {
  const visible = new Set(visibleItems(lib, user).map(i => `${i.type}:${i.id}`));
  const key = `${item.type}:${item.id}`;
  const rel = new Map();
  const add = k => { if (k !== key && visible.has(k)) rel.set(k, lib.byKey.get(k)); };
  item.tools.forEach(t => add(`tool:${t}`));
  item.related.forEach(add);
  for (const o of lib.items) {
    const ok = `${o.type}:${o.id}`;
    if (o.related.includes(key) || (item.type === 'tool' && o.tools.includes(item.id))) add(ok);
  }
  return {
    ...summary(item),
    html: item.html,
    toc: item.toc,
    hasPrompt: !!item.prompt,
    related: [...rel.values()].sort((a, b) => a.order - b.order).map(summary)
  };
}
