import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../lib/markdown.mjs';
import { parseFrontMatter } from '../lib/frontmatter.mjs';

test('正文中的 HTML 被转义，不会执行', () => {
  const { html } = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('只保留安全的链接地址', () => {
  const { html } = renderMarkdown('[坏](javascript:alert(1)) [好](/tools/x) [外](https://example.com)');
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('href="/tools/x"'));
  assert.ok(html.includes('href="https://example.com" target="_blank" rel="noopener noreferrer"'));
});

test('标题生成目录，提示框、核对清单、表格、提示词代码块', () => {
  const src = '## 准备\n\n> [!warn] 注意\n> 正文\n\n- [ ] 第一项\n- [x] 第二项\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n\n```prompt\n你好 <b>\n```';
  const { html, toc, codeBlocks } = renderMarkdown(src);
  assert.deepEqual(toc, [{ id: 's1', title: '准备' }]);
  assert.ok(html.includes('<div class="callout warn"><strong>注意</strong><p>正文</p></div>'));
  assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
  assert.ok(html.includes(' checked'));
  assert.ok(html.includes('<td>1</td><td>2</td>'));
  assert.ok(html.includes('data-copyable="true"'));
  assert.ok(html.includes('你好 &lt;b&gt;'));
  assert.equal(codeBlocks[0].lang, 'prompt');
});

test('中文换行直接相连，英文补空格', () => {
  const { html } = renderMarkdown('第一行\n第二行\n\nhello\nworld');
  assert.ok(html.includes('<p>第一行第二行</p>'));
  assert.ok(html.includes('<p>hello world</p>'));
});

test('解析头部信息', () => {
  const { data, body } = parseFrontMatter('---\nid: a-b\nname: 名称\nlist: [x, "y z"]\nflag: true\nn: 3\nver: 1.0.10\n# 注释\nitems:\n  - 一\n  - 二\n---\n正文\n');
  assert.deepEqual(data, { id: 'a-b', name: '名称', list: ['x', 'y z'], flag: true, n: 3, ver: '1.0.10', items: ['一', '二'] });
  assert.equal(body, '正文\n');
});
