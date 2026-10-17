import { icon, brandMark } from './icons.js';
import { api, ApiError, useBackend } from './api.js';
import { createPalette } from './palette.js';
import {
  esc, tag, maturityTag, tile, callout, fmtBytes, fmtDateTime, greeting, todayLabel, highlight, toast, copyText,
  MATURITY, RUN_MODE, ASSET_STATE, TYPE_LABEL, TYPE_ICON
} from './ui.js';

const DEMO = !!document.querySelector('meta[name="zw-demo"]');
const HASH = DEMO; // 演示版放在单个页面里，用 # 路由
const root = document.getElementById('app');

const state = {
  user: null,
  catalog: null,
  filters: { run: 'all', maturity: 'all', topic: 'all' },
  adminSecret: null,
  confirm: null,
  favorites: new Set(),
  palette: null
};
const IS_MAC = /mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform || '');

/* ---------- 路由 ---------- */
const href = p => (HASH ? '#' + p : p);
function currentUrl() {
  const raw = HASH ? (location.hash.slice(1) || '/') : location.pathname + location.search;
  return new URL(raw, 'http://local');
}
function navigate(path, { replace = false } = {}) {
  if (HASH) {
    if (replace) history.replaceState(null, '', '#' + path); else location.hash = path;
    if (replace) render();
    return;
  }
  history[replace ? 'replaceState' : 'pushState'](null, '', path);
  render();
}

const ROUTES = [
  [/^\/$/, () => viewHome()],
  [/^\/tools$/, () => viewTools()],
  [/^\/tools\/([\w-]+)$/, m => viewItem('tool', m[1])],
  [/^\/skills$/, () => viewSkills()],
  [/^\/skills\/([\w-]+)$/, m => viewItem('skill', m[1])],
  [/^\/docs$/, () => viewDocs()],
  [/^\/docs\/([\w-]+)$/, m => viewItem('doc', m[1])],
  [/^\/changelog$/, () => viewChangelog()],
  [/^\/search$/, (m, url) => viewSearch(url.searchParams.get('q') || '')],
  [/^\/admin$/, () => viewAdmin('members')],
  [/^\/admin\/status$/, () => viewAdmin('status')],
  [/^\/account$/, () => viewAccount()]
];

/* ---------- 启动 ---------- */
async function boot() {
  applyTheme();
  if (DEMO) {
    const { demoBackend } = await import('./demo.js');
    useBackend(demoBackend);
  }
  bindGlobal();
  initPalette();
  try {
    state.user = (await api('/api/me')).user;
  } catch (e) {
    if (e.status === 401 || e.status === 403) return renderLogin();
    return renderFatal(e);
  }
  render();
}

async function ensureCatalog(force = false) {
  if (!state.catalog || force) {
    const [catalog, fav] = await Promise.all([api('/api/catalog'), api('/api/favorites').catch(() => ({ favorites: [] }))]);
    state.catalog = catalog;
    state.favorites = new Set(fav.favorites);
  }
  return state.catalog;
}

let renderSeq = 0;
async function render() {
  if (!state.user) return renderLogin();
  if (state.user.mustChange) return renderForcedPassword();
  const seq = ++renderSeq;
  const url = currentUrl();
  try {
    await ensureCatalog();
  } catch (e) {
    if (e.status === 401) { state.user = null; return renderLogin(); }
    return renderFatal(e);
  }
  if (!document.getElementById('content')) renderShell();
  updateShell(url.pathname);
  const content = document.getElementById('content');
  content.innerHTML = skeleton();

  let view;
  const route = ROUTES.find(([re]) => re.test(url.pathname));
  try {
    view = route ? await route[1](url.pathname.match(route[0]), url) : notFound();
  } catch (e) {
    if (e.status === 401) { state.user = null; return renderLogin(); }
    view = e.status === 404 ? notFound(e.message) : e.status === 403 ? forbidden(e.message) : errorView(e);
  }
  if (seq !== renderSeq) return;
  document.title = view.title ? `${view.title} · 造物册` : '造物册';
  content.innerHTML = view.html;
  window.scrollTo(0, 0);
  closeMenu();
  view.after?.(content);
}

/* ---------- 外壳 ---------- */
function renderShell() {
  const u = state.user;
  root.innerHTML = `
  <div class="app">
    <aside class="side" id="side" aria-label="主导航">
      <a class="brand" href="${href('/')}">${brandMark()}<span class="brand-name"><b>造物册</b><span>zaowuce.com</span></span></a>
      <nav class="nav" id="nav"></nav>
      <div class="side-foot">
        <div class="me">
          <span class="avatar" aria-hidden="true">${esc(u.name.slice(0, 1))}</span>
          <span class="me-text"><b>${esc(u.name)}</b><span>${u.role === 'owner' ? '站点所有者' : '团队成员'} · ${esc(u.account)}</span></span>
        </div>
        <div class="side-actions">
          <a class="btn sm ghost" href="${href('/account')}">${icon('key', 'sm')}修改密码</a>
          <button class="btn sm ghost icon-only" data-act="theme" aria-label="切换深浅色">${icon('moon', 'sm')}</button>
          <button class="btn sm ghost icon-only" data-act="logout" aria-label="退出登录">${icon('logout', 'sm')}</button>
        </div>
      </div>
    </aside>
    <div class="scrim" id="scrim" hidden></div>
    <div class="main">
      <header class="topbar" id="topbar">
        <button class="btn sm ghost icon-only menu-btn" data-act="menu" aria-label="打开菜单">${icon('menu')}</button>
        <button class="top-search" type="button" data-act="palette" aria-label="快速搜索（${IS_MAC ? '⌘' : 'Ctrl'} K）">
          ${icon('search', 'sm')}<span class="ph">搜索工具、SKILL、教程，也能用旧称</span><span class="kbd" aria-hidden="true">${IS_MAC ? '⌘' : 'Ctrl'} K</span>
        </button>
        <div class="top-links">
          <a class="btn sm ghost hide-sm" href="${href('/docs/getting-started')}">${icon('compass', 'sm')}使用指南</a>
        </div>
      </header>
      <main class="content" id="content" tabindex="-1"></main>
    </div>
  </div>`;
}

function updateShell(path) {
  const c = state.catalog;
  const items = [
    ['/', '工作台', 'home', ''],
    ['/tools', '工具', 'tools', c.tools.length],
    ['/skills', 'SKILL', 'skill', c.skills.length],
    ['/docs', '知识库', 'book', c.docs.length],
    ['/changelog', '更新记录', 'history', '']
  ];
  const active = p => (p === '/' ? path === '/' : path === p || path.startsWith(p + '/'));
  let html = items.map(([p, label, ic, n]) => `<a href="${href(p)}"${active(p) ? ' aria-current="page"' : ''}>${icon(ic)}<span>${label}</span><span class="count">${n}</span></a>`).join('');
  if (state.user.role === 'owner') {
    html += `<div class="nav-label">站点管理</div>
      <a href="${href('/admin')}"${path === '/admin' ? ' aria-current="page"' : ''}>${icon('users')}<span>成员</span></a>
      <a href="${href('/admin/status')}"${path === '/admin/status' ? ' aria-current="page"' : ''}>${icon('activity')}<span>站点状态</span></a>`;
  }
  document.getElementById('nav').innerHTML = html;
  const q = document.getElementById('top-q');
  if (q && path !== '/search') q.value = '';
  const themeBtn = root.querySelector('[data-act="theme"]');
  if (themeBtn) themeBtn.innerHTML = icon(isDark() ? 'sun' : 'moon', 'sm');
}

function openMenu() {
  document.getElementById('side')?.classList.add('open');
  const s = document.getElementById('scrim');
  if (s) s.hidden = false;
}
function closeMenu() {
  document.getElementById('side')?.classList.remove('open');
  const s = document.getElementById('scrim');
  if (s) s.hidden = true;
}

/* ---------- 主题 ---------- */
function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyTheme() {
  try {
    const t = localStorage.getItem('zw-theme');
    if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
  } catch { /* 浏览器禁用存储时跟随系统 */ }
}
function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('zw-theme', next); } catch { /* 忽略 */ }
  const btn = root.querySelector('[data-act="theme"]');
  if (btn) btn.innerHTML = icon(isDark() ? 'sun' : 'moon', 'sm');
}

/* ---------- 通用片段 ---------- */
const skeleton = () => '<div class="skeleton sk-title"></div><div class="skeleton sk-block"></div><div class="skeleton sk-block short"></div>';
const crumbs = list => `<nav class="crumbs" aria-label="位置">${list.map(([p, l], i) => (i < list.length - 1 ? `<a href="${href(p)}">${esc(l)}</a>${icon('chevron', 'sm')}` : `<span>${esc(l)}</span>`)).join('')}</nav>`;
const itemPath = i => ({ tool: '/tools/', skill: '/skills/', doc: '/docs/' }[i.type] + i.id);
const keyOf = i => `${i.type}:${i.id}`;
const allItems = () => (state.catalog ? [...state.catalog.tools, ...state.catalog.skills, ...state.catalog.docs] : []);
const byKey = k => allItems().find(i => keyOf(i) === k);

/* ---------- 最近访问（只保存在这台设备） ---------- */
const recentKey = () => `zw-recent:${state.user?.account || ''}`;
function recentItems() {
  let keys = [];
  try { keys = JSON.parse(localStorage.getItem(recentKey()) || '[]'); } catch { /* 存储不可用 */ }
  return keys.map(byKey).filter(Boolean);
}
function recordRecent(item) {
  try {
    const k = keyOf(item);
    const keys = JSON.parse(localStorage.getItem(recentKey()) || '[]').filter(x => x !== k);
    localStorage.setItem(recentKey(), JSON.stringify([k, ...keys].slice(0, 10)));
  } catch { /* 存储不可用时不记录 */ }
}

/* ---------- 电脑系统识别（下载页参考 VS Code：优先给出适合这台电脑的安装包） ---------- */
function detectOS() {
  const ua = navigator.userAgent || '';
  if (/iphone|ipad|android|mobile/i.test(ua)) return 'mobile';
  const p = (navigator.userAgentData?.platform || navigator.platform || ua).toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'macos';
  return null;
}
const OS_LABEL = { windows: 'Windows', macos: 'macOS' };

function favButton(item) {
  const on = state.favorites.has(keyOf(item));
  return `<button class="btn lg fav" data-act="fav" data-key="${esc(keyOf(item))}" aria-pressed="${on}">${icon('star', 'sm')}<span>${on ? '已收藏' : '收藏'}</span></button>`;
}

function feedbackBox(item) {
  return `<section class="card feedback" data-key="${esc(keyOf(item))}" aria-label="反馈">
    <div class="fb-ask"><b>这篇内容对你有帮助吗？</b><div class="row">
      <button class="btn sm" data-act="fb-vote" data-v="1">${icon('check', 'sm')}有帮助</button>
      <button class="btn sm" data-act="fb-vote" data-v="0">${icon('x', 'sm')}没帮助</button>
    </div></div>
  </section>`;
}

function entryCard(i) {
  const foot = [];
  if (i.type === 'tool') {
    foot.push(`<span>${icon(RUN_MODE[i.run_mode][1], 'sm')}${RUN_MODE[i.run_mode][0]}</span>`);
    if (i.platforms?.length) foot.push(`<span>${esc(i.platforms.join(' · '))}</span>`);
    if (i.output) foot.push(`<span>输出：${esc(i.output)}</span>`);
  } else if (i.type === 'skill') {
    foot.push(`<span>${icon('hash', 'sm')}${esc(i.topic)}</span>`, `<span class="mono">${esc(i.version)}</span>`);
  }
  foot.push(`<span>${icon('clock', 'sm')}${esc(i.updated)}</span>`);
  return `<a class="card entry" href="${href(itemPath(i))}">
    <div class="entry-head">${tile(i)}<div class="entry-title"><div class="row">${maturityTag(i.maturity)}${i.visibility === 'owner' ? tag('仅所有者', 'outline') : ''}</div><h3>${esc(i.name)}</h3></div></div>
    <p>${esc(i.summary)}</p>
    <div class="entry-foot">${foot.join('')}</div>
  </a>`;
}

function emptyState(title, body, actions = '') {
  return `<div class="empty"><span class="tile">${icon('search', 'lg')}</span><b>${esc(title)}</b><span>${esc(body)}</span>${actions ? `<div class="row">${actions}</div>` : ''}</div>`;
}

/* ---------- 工作台 ---------- */
async function viewHome() {
  const c = state.catalog;
  const featured = c.tools.find(t => t.featured) || c.tools[0];
  let release = null;
  if (featured?.run_mode === 'download') {
    try { release = (await api(`/api/items/tool/${featured.id}`)).release; } catch { /* 首页不因发布信息失败而失败 */ }
  }
  const first = (state.user.name || '').trim();
  const flowIcons = ['folder', 'play', 'checkCircle', 'archive'];
  const steps = featured?.steps?.length ? featured.steps : [];
  const inventory = c.tools.filter(t => t.scene === featured?.scene).slice(0, 3);
  const guide = c.docs.find(d => d.id === 'getting-started');
  const tutorial = c.docs.find(d => d.id === featured?.tutorial) || c.docs.find(d => d.kind === '教程' && d.tools?.includes(featured?.id));
  const smallTool = c.tools.find(t => t.run_mode === 'browser');
  const learn = c.docs.filter(d => d.kind === '入门' || d.kind === '教程').slice(0, 4);

  const releaseTags = release
    ? [release.recommended ? tag(`推荐 v${release.recommended}`, 'ok') : tag('推荐版本未确定', 'warn'), release.versions?.package ? tag(`下载包 v${release.versions.package}`) : ''].join('')
    : '';

  return {
    title: '工作台',
    html: `
    <section class="hero">
      <span class="date">${todayLabel()}</span>
      <div class="stack sm">
        <h1>${greeting()}，${esc(first)}</h1>
        <p class="soft">今天要做什么？从下面的任务开始，或直接搜索工具、SKILL 和教程。</p>
      </div>
      <form class="hero-search" role="search" data-search>
        ${icon('search')}
        <input type="search" name="q" placeholder="例如：报表更新器、预检、关键词" aria-label="搜索" autocomplete="off">
        <button class="btn primary" type="submit">搜索</button>
      </form>
      <div class="hero-hints">常用：${['报表更新器', '预检', '更新记录', '关键词'].map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    </section>

    ${featured ? `
    <section class="featured" aria-label="最常用的任务">
      <div class="stack">
        <span class="eyebrow">最常用的任务</span>
        <h2>更新进销存表格</h2>
        <p>${esc(featured.summary)}</p>
        <div class="featured-meta">${tag(RUN_MODE[featured.run_mode][0])}${tag(MATURITY[featured.maturity][0])}${releaseTags}</div>
        <div class="row">
          <a class="btn primary lg" href="${href('/tools/' + featured.id)}">开始更新 ${icon('arrow', 'sm')}</a>
          ${tutorial ? `<a class="btn ghost-light lg" href="${href('/docs/' + tutorial.id)}">${icon('book', 'sm')}先看教程</a>` : ''}
        </div>
      </div>
      ${steps.length ? `<ol class="flow">${steps.map((s, i) => `<li><span class="dot">${icon(flowIcons[i] || 'check', 'sm')}</span><span>${esc(s)}</span></li>`).join('')}</ol>` : ''}
    </section>` : ''}

    ${personalSection()}

    <section class="tasks" aria-label="其他任务">
      <a class="card task" href="${href('/skills')}">
        <span class="tile skill">${icon('skill')}</span>
        <h3>找一个 AI 工作方法</h3>
        <p>${c.skills.length} 份 SKILL，复制到你自己的 AI 工具里使用，每份都写明输入和检查方法。</p>
        <span class="go">浏览 SKILL ${icon('arrow', 'sm')}</span>
      </a>
      ${guide ? `<a class="card task" href="${href('/docs/' + guide.id)}">
        <span class="tile doc">${icon('compass')}</span>
        <h3>第一次使用</h3>
        <p>${esc(guide.summary)}</p>
        <span class="go">阅读入门 ${icon('arrow', 'sm')}</span>
      </a>` : ''}
      ${smallTool ? `<a class="card task" href="${href('/tools/' + smallTool.id)}">
        <span class="tile browser">${icon('globe')}</span>
        <h3>${esc(smallTool.name)}</h3>
        <p>${esc(smallTool.summary)}</p>
        <span class="go">直接使用 ${icon('arrow', 'sm')}</span>
      </a>` : ''}
    </section>

    ${inventory.length > 1 ? `
    <section class="stack">
      <div class="section-title"><h2>进销存相关程序，用哪个？</h2><a href="${href('/docs/which-tool')}">详细对比 ${icon('arrow', 'sm')}</a></div>
      <div class="card trio">
        ${inventory.map(t => `<a href="${href('/tools/' + t.id)}" class="${t.id === featured.id ? 'rec' : ''}">
          <div class="trio-head">${maturityTag(t.maturity)}${t.id === featured.id ? tag('推荐', 'info') : ''}</div>
          <h3>${esc(t.name)}</h3>
          <p>${esc(t.summary)}</p>
        </a>`).join('')}
      </div>
    </section>` : ''}

    <section class="two">
      <div class="stack">
        <div class="section-title"><h2>网站更新</h2><a href="${href('/changelog')}">全部更新记录 ${icon('arrow', 'sm')}</a></div>
        ${c.changelog?.length ? `<div class="card log-mini">${c.changelog.slice(0, 1).map(e => `<div class="log-mini-date">${esc(e.date)}</div><ul>${e.items.slice(0, 4).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`).join('')}</div>` : '<p class="soft small">还没有更新记录。</p>'}
      </div>
      <div class="stack">
        <div class="section-title"><h2>入门与教程</h2><a href="${href('/docs')}">全部 ${icon('arrow', 'sm')}</a></div>
        <div class="card linklist">
          ${learn.map(d => `<a href="${href('/docs/' + d.id)}">${icon('book', 'sm')}<span class="grow"><b>${esc(d.name)}</b><span>${esc(d.kind)}</span></span>${icon('chevron', 'sm')}</a>`).join('')}
        </div>
      </div>
    </section>`
  };
}

function personalSection() {
  const favs = [...state.favorites].map(byKey).filter(Boolean).slice(0, 6);
  const recents = recentItems().slice(0, 5);
  const row = i => `<a href="${href(itemPath(i))}">${tile(i)}<span class="grow"><b>${esc(i.name)}</b><span>${esc(TYPE_LABEL[i.type])}${i.kind ? ' · ' + esc(i.kind) : ''}</span></span>${icon('chevron', 'sm')}</a>`;
  return `<section class="two" aria-label="我的常用">
    <div class="stack">
      <div class="section-title"><h2>我的收藏</h2><span class="small muted">保存在你的账号里，换设备也在</span></div>
      ${favs.length ? `<div class="card linklist tiled">${favs.map(row).join('')}</div>`
        : `<div class="card pad hint-card">${icon('star')}<span>在任意工具、SKILL 或文章页面点「收藏」，常用内容会出现在这里。</span></div>`}
    </div>
    <div class="stack">
      <div class="section-title"><h2>最近访问</h2><span class="small muted">仅这台设备</span></div>
      ${recents.length ? `<div class="card linklist tiled">${recents.map(row).join('')}</div>`
        : `<div class="card pad hint-card">${icon('clock')}<span>你打开过的工具和文章会列在这里。也可以随时按 <kbd>${IS_MAC ? '⌘' : 'Ctrl'} K</kbd> 快速查找。</span></div>`}
    </div>
  </section>`;
}

/* ---------- 更新记录（参考 Linear：按日期倒序的时间线） ---------- */
async function viewChangelog() {
  const { entries } = await api('/api/changelog');
  return {
    title: '更新记录',
    html: `
    <header class="page-head">
      <span class="eyebrow">更新记录</span>
      <h1>造物册有什么新变化</h1>
      <p>新增的工具、内容和网站功能都记在这里，新的在上。</p>
    </header>
    ${entries.length ? `<div class="changelog">${entries.map(e => `
      <article class="log-entry">
        <div class="log-date"><time datetime="${esc(e.date)}">${esc(e.date)}</time></div>
        <div class="card pad prose log-body">${e.html}</div>
      </article>`).join('')}</div>` : emptyState('还没有更新记录', '站主发布更新后会出现在这里。')}`
  };
}

/* ---------- 工具目录 ---------- */
function viewTools() {
  const f = state.filters;
  const list = state.catalog.tools.filter(t => (f.run === 'all' || t.run_mode === f.run) && (f.maturity === 'all' || t.maturity === f.maturity));
  const chips = (key, opts) => opts.map(([v, l]) => `<button class="chip" data-filter="${key}" data-v="${v}" aria-pressed="${f[key] === v}">${l}</button>`).join('');
  return {
    title: '工具',
    html: `
    <header class="page-head">
      <span class="eyebrow">工具</span>
      <h1>工具目录</h1>
      <p>每个工具只有一个页面。同一工具的不同版本、系统和安装包，都在它的页面里。</p>
    </header>
    <div class="filters">
      <div class="chips"><span class="chips-label">运行方式</span>${chips('run', [['all', '全部'], ['download', '下载后本机'], ['browser', '浏览器内'], ['online', '在线服务'], ['doc', '仅文档']])}</div>
      <div class="chips"><span class="chips-label">状态</span>${chips('maturity', [['all', '全部'], ['formal', '正式'], ['trial', '试用'], ['upcoming', '待开放'], ['history', '历史']])}</div>
    </div>
    ${list.length ? `<div class="grid-cards">${list.map(entryCard).join('')}</div>`
      : emptyState('没有符合条件的工具', '换一个筛选条件试试。', '<button class="btn sm" data-act="clear-filters">清除筛选</button>')}`
  };
}

/* ---------- SKILL ---------- */
function viewSkills() {
  const f = state.filters;
  const topics = [...new Set(state.catalog.skills.map(s => s.topic))];
  const list = state.catalog.skills.filter(s => f.topic === 'all' || s.topic === f.topic);
  return {
    title: 'SKILL',
    html: `
    <header class="page-head">
      <span class="eyebrow">SKILL</span>
      <h1>AI 工作方法</h1>
      <p>每份 SKILL 写明适用场景、需要准备的输入和检查方法。复制到你自己的 AI 工具中使用，造物册本身不运行 AI，也不会收到你粘贴给 AI 的内容。</p>
    </header>
    <div class="chips"><span class="chips-label">主题</span>${[['all', '全部'], ...topics.map(t => [t, t])].map(([v, l]) => `<button class="chip" data-filter="topic" data-v="${esc(v)}" aria-pressed="${f.topic === v}">${esc(l)}</button>`).join('')}</div>
    ${list.length ? `<div class="grid-cards">${list.map(entryCard).join('')}</div>` : emptyState('这个主题下还没有 SKILL', '换一个主题看看。')}`
  };
}

/* ---------- 知识库 ---------- */
const DOC_KINDS = ['入门', '教程', '常见问题', '案例'];
function viewDocs() {
  const order = DOC_KINDS;
  const groups = order.map(k => [k, state.catalog.docs.filter(d => d.kind === k)]).filter(([, l]) => l.length);
  return {
    title: '知识库',
    html: `
    <header class="page-head">
      <span class="eyebrow">知识库</span>
      <h1>教程与常见问题</h1>
      <p>每篇都标明适用的程序版本。版本不一致时，文章顶部会提示。</p>
    </header>
    ${groups.map(([k, list]) => `
      <section class="doc-group">
        <div class="section-title"><h2>${esc(k)}</h2><span class="small muted">${list.length} 篇</span></div>
        <div class="card doc-list">${list.map(d => `<a href="${href('/docs/' + d.id)}"><b>${esc(d.name)}</b><span>${esc(d.summary)}</span><span class="side-meta">${(d.applies_to || []).map(v => tag('v' + v, 'outline')).join('')}</span></a>`).join('')}</div>
      </section>`).join('')}`
  };
}

/* ---------- 详情（工具／SKILL／文章） ---------- */
async function viewItem(type, id) {
  const item = await api(`/api/items/${type}/${id}`);
  recordRecent(item);
  const os = detectOS();
  const parent = { tool: ['/tools', '工具'], skill: ['/skills', 'SKILL'], doc: ['/docs', '知识库'] }[type];
  let hero = '', aside = '', top = '', bottom = '';
  const numbered = type === 'tool' && item.run_mode === 'download';

  if (type === 'tool') {
    const r = item.release;
    const sample = r?.attachments?.[0];
    const tutorial = item.related.find(x => x.type === 'doc' && x.id === item.tutorial) || item.related.find(x => x.type === 'doc' && x.kind === '教程');
    const actions = [];
    if (item.run_mode === 'download') {
      const cur = r?.releases.find(x => x.status === 'current' && (!r.recommended || x.version === r.recommended));
      const mine = OS_LABEL[os] && cur?.assets.find(a => a.os === os && (a.variant || 'standard') === 'standard');
      const label = OS_LABEL[os] ? `下载 ${OS_LABEL[os]} 版` : '下载安装包';
      actions.push(mine?.state === 'ok'
        ? `<a class="btn primary lg" href="/downloads/${esc(mine.id)}" data-download>${icon('download', 'sm')}${label} · v${esc(cur.version)}</a>`
        : `<button class="btn primary lg" data-act="goto-downloads">${icon('download', 'sm')}${label}</button>`);
      if (sample) actions.push(sample.state === 'ok' ? `<a class="btn lg" href="/downloads/${esc(sample.id)}" data-download>${icon('file', 'sm')}${esc(sample.label)}</a>` : `<button class="btn lg" disabled>${icon('file', 'sm')}${esc(sample.label)}（${ASSET_STATE[sample.state][0]}）</button>`);
      if (tutorial) actions.push(`<a class="btn ghost lg" href="${href('/docs/' + tutorial.id)}">${icon('book', 'sm')}教程</a>`);
    } else if (item.run_mode === 'browser') {
      actions.push(`<button class="btn primary lg" data-act="goto-widget">${icon('play', 'sm')}开始使用</button>`);
    } else if (item.run_mode === 'online') {
      actions.push(item.maturity === 'upcoming' ? `<button class="btn primary lg" disabled>${icon('lock', 'sm')}尚未开放</button>` : `<a class="btn primary lg" href="${esc(item.url || '#')}">${icon('arrow', 'sm')}打开工具</a>`);
    }
    actions.push(favButton(item));
    hero = heroBlock(item, crumbs([['/', '工作台'], parent, ['', item.name]]), actions.join(''));
    const notes = [];
    if (item.run_mode === 'download' && os === 'mobile') notes.push(callout('warn', '请在电脑上下载', '这个工具需要在 Windows 或 macOS 电脑上运行。手机上可以先阅读步骤和教程。'));
    if (item.data_location) notes.push(callout('info', '文件在哪里处理', esc(item.data_location), 'lock'));
    if (item.unavailable_reason) notes.push(callout('warn', '为什么还没开放', esc(item.unavailable_reason)));
    if (r?.notice) notes.push(callout('warn', '版本提示', esc(r.notice)));
    top = notes.length ? `<div class="stack">${notes.join('')}</div>` : '';
    if (r) top += versionStrip(r);
    if (item.widget === 'dedupe') top += dedupeWidget();
    aside = (r ? downloadsCard(r, os) : '') + infoCard([
      ['运行方式', RUN_MODE[item.run_mode][0]],
      ['适用', (item.platforms || []).join('、') || '—'],
      ['输出', item.output || '—'],
      ['负责人', item.owner || '—'],
      ['更新', item.updated]
    ]);
  } else if (type === 'skill') {
    const actions = [
      item.hasPrompt ? `<button class="btn primary lg" data-act="copy-prompt">${icon('copy', 'sm')}复制提示词</button>` : '',
      `<a class="btn lg" href="${DEMO ? '#' : `/api/skills/${esc(item.id)}/file`}" data-download>${icon('download', 'sm')}下载 SKILL 文件</a>`,
      favButton(item)
    ].join('');
    hero = heroBlock(item, crumbs([['/', '工作台'], parent, ['', item.name]]), actions);
    if (item.maturity === 'sample') top = callout('warn', '这是一份示例', '还没有用真实任务验证过。请对照「检查 AI 的输出」逐项核对结果。');
    aside = infoCard([
      ['版本', `<span class="mono">${esc(item.version)}</span>`, true],
      ['主题', item.topic],
      ['适用环境', item.env || '—'],
      ['更新', item.updated]
    ]) + (item.inputs?.length ? `<div class="card"><h3>${icon('folder', 'sm')}需要准备</h3><ul class="small soft plain-list">${item.inputs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
  } else {
    hero = heroBlock(item, crumbs([['/', '工作台'], parent, ['', item.name]]), favButton(item));
    const tool = item.related.find(x => x.type === 'tool');
    if (item.applies_to?.length && tool) {
      try {
        const t = await api(`/api/items/tool/${tool.id}`);
        const pkg = t.release?.recommended || t.release?.versions?.package;
        if (pkg && !item.applies_to.includes(pkg)) top = callout('warn', '版本可能不一致', `本文适用于 v${esc(item.applies_to.join('、v'))}，${esc(tool.name)} 当前推荐的是 v${esc(pkg)}。步骤可能有差异。`);
      } catch { /* 工具不可见时不提示 */ }
    }
    aside = infoCard([['类型', item.kind], ['适用版本', item.applies_to?.length ? item.applies_to.map(v => 'v' + v).join('、') : '—'], ['更新', item.updated]]);
  }

  if (item.toc.length > 1) aside += `<div class="card toc-card"><h3>${icon('hash', 'sm')}本页目录</h3><nav class="toc" id="toc">${item.toc.map(t => `<a href="#${t.id}" data-toc="${t.id}">${esc(t.title)}</a>`).join('')}</nav></div>`;

  if (item.related.length) {
    bottom = `<section class="stack"><h2>相关内容</h2><div class="related-grid">${item.related.map(r => `<a class="card" href="${href(itemPath(r))}">${tile(r)}<span class="grow"><span>${esc(TYPE_LABEL[r.type])}${r.kind ? ' · ' + esc(r.kind) : ''}</span><b>${esc(r.name)}</b></span></a>`).join('')}</div></section>`;
  }

  let docNav = '', pager = '';
  if (type === 'doc') {
    const ordered = DOC_KINDS.flatMap(k => state.catalog.docs.filter(d => d.kind === k));
    const at = ordered.findIndex(d => d.id === item.id);
    const prev = ordered[at - 1], next = ordered[at + 1];
    docNav = `<nav class="doc-nav" aria-label="知识库文章">${DOC_KINDS.map(k => {
      const list = state.catalog.docs.filter(d => d.kind === k);
      return list.length ? `<div class="doc-nav-group"><span>${esc(k)}</span>${list.map(d => `<a href="${href('/docs/' + d.id)}"${d.id === item.id ? ' aria-current="page"' : ''}>${esc(d.name)}</a>`).join('')}</div>` : '';
    }).join('')}</nav>`;
    pager = `<nav class="pager" aria-label="上一篇和下一篇">
      ${prev ? `<a class="card" href="${href('/docs/' + prev.id)}"><span>上一篇</span><b>${esc(prev.name)}</b></a>` : '<span></span>'}
      ${next ? `<a class="card next" href="${href('/docs/' + next.id)}"><span>下一篇</span><b>${esc(next.name)}</b></a>` : '<span></span>'}
    </nav>`;
  }

  return {
    title: item.name,
    html: `${hero}${top}
      <div class="detail-layout${type === 'doc' ? ' with-nav' : ''}">
        ${docNav}
        <div class="stack lg">
          <article class="prose" id="prose">${item.html}</article>
          ${pager}
          ${feedbackBox(item)}
          ${bottom}
        </div>
        <aside class="aside">${aside}</aside>
      </div>`,
    after: el => enhanceProse(el, { numbered, item })
  };
}

function heroBlock(item, crumbHtml, actions) {
  const tags = [maturityTag(item.maturity)];
  if (item.type === 'tool') tags.push(tag(RUN_MODE[item.run_mode][0], 'outline'));
  if (item.type === 'skill') tags.push(tag(item.topic, 'outline'));
  if (item.type === 'doc') tags.push(tag(item.kind, 'outline'));
  if (item.visibility === 'owner') tags.push(tag('仅所有者可见', 'outline'));
  return `
    ${crumbHtml}
    <header class="detail-hero">
      <div class="title-row">${tile(item)}<div class="stack sm"><div class="row">${tags.filter(Boolean).join('')}</div><h1>${esc(item.name)}</h1></div></div>
      ${item.aliases?.length ? `<p class="aliases">也叫：${item.aliases.map(esc).join('、')}</p>` : ''}
      <p class="lead">${esc(item.summary)}</p>
      ${actions ? `<div class="row">${actions}</div>` : ''}
    </header>`;
}

function infoCard(rows) {
  return `<div class="card"><h3>${icon('info', 'sm')}基本信息</h3><dl class="kv">${rows.map(([k, v, raw]) => `<dt>${esc(k)}</dt><dd>${raw ? v : esc(v)}</dd>`).join('')}</dl></div>`;
}

function versionStrip(r) {
  const v = r.versions || {};
  const cell = (val, label, unset = '—') => `<div>${val ? `<b>v${esc(val)}</b>` : `<b class="unset">${unset}</b>`}<span>${label}</span></div>`;
  return `<div class="version-strip" aria-label="版本">
    ${cell(r.recommended, '推荐版本', '未确定')}${cell(v.package, '下载包版本')}${cell(v.source, '源码版本')}${cell(v.tutorial, '教程适用版本')}
  </div>`;
}

function downloadsCard(r, os) {
  const current = r.releases.filter(x => x.status !== 'archived');
  const mineFirst = list => [...list].sort((a, b) => (b.os === os) - (a.os === os));
  const assetRow = a => {
    const [label, tone] = ASSET_STATE[a.state];
    const btn = a.state === 'ok'
      ? `<a class="btn sm primary" href="/downloads/${esc(a.id)}" data-download>${icon('download', 'sm')}下载</a>`
      : `<button class="btn sm" disabled>${a.state === 'pending' ? '待上传' : '不可下载'}</button>`;
    return `<div class="asset">
      <div class="asset-top"><b>${esc(a.label)}</b>${btn}</div>
      <div class="row tiny muted"><span class="tag ${tone}">${label}</span>${a.os && a.os === os ? '<span class="tag info">适合这台电脑</span>' : ''}<span>${fmtBytes(a.size)}</span></div>
      ${a.sha256 ? `<div class="hash"><span>SHA256</span><code title="${esc(a.sha256)}">${esc(a.sha256)}</code><button data-copy="${esc(a.sha256)}" aria-label="复制 SHA256">${icon('copy', 'sm')}</button></div>` : ''}
    </div>`;
  };
  return `<div class="card" id="downloads">
    <h3>${icon('download', 'sm')}版本与下载</h3>
    ${current.map(rel => `
      <div class="spread"><b class="mono">v${esc(rel.version)}</b>${rel.status === 'withdrawn' ? tag('已撤回', 'bad') : r.recommended === rel.version ? tag('推荐', 'ok') : tag('当前', 'outline')}</div>
      ${rel.status === 'withdrawn' && rel.replaced_by ? `<p class="small soft">请改用 v${esc(rel.replaced_by)}。</p>` : ''}
      ${mineFirst(rel.assets).map(assetRow).join('')}
      <p class="tiny muted">已验证系统：${rel.verified_on.length ? esc(rel.verified_on.join('、')) : '尚未登记实机验证'}</p>`).join('')}
    ${r.known_limits?.length ? `<p class="tiny muted">${r.known_limits.map(esc).join('<br>')}</p>` : ''}
    <a class="small" href="${href('/docs/download-verify')}">怎样确认下载的文件完整</a>
  </div>`;
}

function dedupeWidget() {
  const sample = ['blue water bottle', 'water bottle 1l', '  blue water bottle', 'stainless bottle', '', 'water bottle 1l', 'kids water bottle'].join('\n');
  return `<section class="card widget" id="widget">
    <div class="spread"><h2>文本去重整理</h2><span class="small muted">示例文本已填入，可直接替换</span></div>
    <div class="widget-grid">
      <div class="field"><label for="dd-in">原文本，每行一项</label><textarea id="dd-in" spellcheck="false">${esc(sample)}</textarea></div>
      <div class="field"><label for="dd-out">整理结果</label><textarea id="dd-out" readonly spellcheck="false"></textarea></div>
    </div>
    <div class="row"><button class="btn primary" data-act="dedupe">${icon('refresh', 'sm')}整理</button><button class="btn" data-act="copy-dedupe">${icon('copy', 'sm')}复制结果</button><span class="small muted" id="dd-stat" aria-live="polite"></span></div>
  </section>`;
}

function runDedupe() {
  const inp = document.getElementById('dd-in');
  const out = document.getElementById('dd-out');
  if (!inp || !out) return;
  const lines = inp.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const res = lines.filter(l => (seen.has(l) ? false : seen.add(l)));
  out.value = res.join('\n');
  document.getElementById('dd-stat').textContent = `${lines.length} 行 → ${res.length} 行，去掉 ${lines.length - res.length} 个重复`;
}

/** 正文渲染后的增强：步骤编号、提示词复制按钮、核对清单进度、目录高亮。 */
function enhanceProse(el, { numbered }) {
  const prose = el.querySelector('#prose');
  if (!prose) return;
  if (numbered) prose.querySelectorAll('h2').forEach((h, i) => h.insertAdjacentHTML('afterbegin', `<span class="step-n">${i + 1}</span>`));
  prose.querySelectorAll('pre[data-copyable]').forEach(pre => {
    pre.insertAdjacentHTML('afterbegin', `<button class="btn sm pre-copy" data-act="copy-pre">${icon('copy', 'sm')}复制</button>`);
  });
  prose.querySelectorAll('.checklist').forEach(list => {
    list.insertAdjacentHTML('beforebegin', '<div class="check-progress"><span>核对进度</span><span class="bar"><i></i></span><span class="count">0 / 0</span></div>');
    const bar = list.previousElementSibling;
    const update = () => {
      const all = list.querySelectorAll('input');
      const done = list.querySelectorAll('input:checked').length;
      bar.querySelector('i').style.width = all.length ? `${(done / all.length) * 100}%` : '0';
      bar.querySelector('.count').textContent = `${done} / ${all.length}`;
    };
    list.addEventListener('change', update);
    update();
  });
  prose.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  if (el.querySelector('#dd-in')) runDedupe();

  const toc = el.querySelector('#toc');
  if (toc && 'IntersectionObserver' in window) {
    const links = new Map([...toc.querySelectorAll('a')].map(a => [a.dataset.toc, a]));
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach(a => a.classList.remove('on'));
        links.get(e.target.id)?.classList.add('on');
      }
    }, { rootMargin: '-80px 0px -65% 0px' });
    prose.querySelectorAll('h2[id]').forEach(h => io.observe(h));
  }
}

/* ---------- 搜索 ---------- */
function score(i, q) {
  const has = s => String(s || '').toLowerCase().includes(q);
  let s = 0;
  if (i.name.toLowerCase() === q) s += 30;
  if (has(i.name)) s += 12;
  if ((i.aliases || []).some(has)) s += 10;
  if ((i.tags || []).some(has)) s += 5;
  if (has(i.topic) || has(i.scene) || has(i.kind)) s += 4;
  if (has(i.summary)) s += 3;
  if (has(i.output)) s += 2;
  return s;
}

function viewSearch(q) {
  const query = q.trim();
  const ql = query.toLowerCase();
  const c = state.catalog;
  const all = [...c.tools, ...c.skills, ...c.docs];
  const hits = ql ? all.map(i => ({ i, s: score(i, ql) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.i) : [];
  const groups = ['tool', 'skill', 'doc'].map(t => [t, hits.filter(h => h.type === t)]).filter(([, l]) => l.length);
  setTimeout(() => { const inp = document.getElementById('top-q'); if (inp) inp.value = query; });
  const resultCard = i => {
    const alias = (i.aliases || []).find(a => a.toLowerCase().includes(ql) && !i.name.toLowerCase().includes(ql));
    return `<a class="card result" href="${href(itemPath(i))}">${tile(i)}<span class="grow">
      <span class="row"><b>${highlight(i.name, query)}</b>${maturityTag(i.maturity)}</span>
      ${alias ? `<span class="small muted">旧称：${highlight(alias, query)}</span>` : ''}
      <p>${highlight(i.summary, query)}</p></span></a>`;
  };
  return {
    title: query ? `搜索：${query}` : '搜索',
    html: `
    <header class="page-head">
      <span class="eyebrow">搜索</span>
      <h1>${query ? `「${esc(query)}」的搜索结果` : '搜索'}</h1>
      <p>${query ? `找到 ${hits.length} 条，只包含你有权查看的内容。` : '输入工具名、旧称或用途，例如「报表更新器」。'}</p>
    </header>
    ${groups.length ? groups.map(([t, l]) => `<section class="result-group"><div class="section-title"><h2>${TYPE_LABEL[t]}</h2><span class="small muted">${l.length} 条</span></div>${l.map(resultCard).join('')}</section>`).join('')
      : query ? emptyState('没有找到相关内容', '试试更短的关键词，或者用程序的旧称搜索。', `<a class="btn sm" href="${href('/tools')}">查看全部工具</a><a class="btn sm" href="${href('/docs')}">浏览知识库</a>`) : ''}`
  };
}

/* ---------- 管理 ---------- */
async function viewAdmin(tab) {
  if (state.user.role !== 'owner') return forbidden('只有站点所有者可以查看这一页。');
  const tabs = `<nav class="tabs" aria-label="站点管理">
    <a href="${href('/admin')}"${tab === 'members' ? ' aria-current="page"' : ''}>成员</a>
    <a href="${href('/admin/status')}"${tab === 'status' ? ' aria-current="page"' : ''}>站点状态</a>
  </nav>`;
  if (tab === 'members') {
    const { members } = await api('/api/admin/members');
    const secret = state.adminSecret;
    state.adminSecret = null;
    const row = m => {
      const self = m.account === state.user.account;
      const conf = state.confirm?.account === m.account ? state.confirm.action : null;
      let actions;
      if (self) actions = '<span class="small muted">当前账号</span>';
      else if (conf) actions = `<span class="confirm">${conf === 'disable' ? '确定停用？' : '确定重置密码？'}<button class="btn sm ${conf === 'disable' ? 'danger' : 'primary'}" data-act="member" data-action="${conf}" data-account="${esc(m.account)}">确定</button><button class="btn sm ghost" data-act="cancel-confirm">取消</button></span>`;
      else actions = `<div class="row">${m.enabled ? `<button class="btn sm" data-act="ask" data-action="disable" data-account="${esc(m.account)}">停用</button>` : `<button class="btn sm" data-act="member" data-action="enable" data-account="${esc(m.account)}">恢复</button>`}<button class="btn sm ghost" data-act="ask" data-action="reset" data-account="${esc(m.account)}">重置密码</button></div>`;
      return `<tr>
        <td><div class="row"><span class="avatar">${esc(m.name.slice(0, 1))}</span><span class="stack sm"><b>${esc(m.name)}</b><span class="mono tiny muted">${esc(m.account)}</span></span></div></td>
        <td>${m.role === 'owner' ? '所有者' : '成员'}</td>
        <td>${m.enabled ? (m.mustChange ? tag('待修改初始密码', 'warn') : tag('可登录', 'ok')) : tag('已停用')}</td>
        <td class="small soft">${fmtDateTime(m.lastLoginAt)}</td>
        <td>${actions}</td>
      </tr>`;
    };
    return {
      title: '成员',
      html: `
      <header class="page-head"><span class="eyebrow">站点管理</span><h1>成员</h1><p>账号由你开通。临时密码只显示一次，请私下发给同事；对方首次登录后必须修改。</p></header>
      ${tabs}
      <form class="card pad stack" id="add-member">
        <h3>开通新成员</h3>
        <div class="form-row">
          <div class="field"><label for="m-name">姓名</label><input id="m-name" name="name" required maxlength="40" placeholder="例如：张三"></div>
          <div class="field"><label for="m-account">登录账号</label><input id="m-account" name="account" required pattern="[a-z0-9][a-z0-9_.\\-]{1,31}" placeholder="小写字母或数字" autocapitalize="off"></div>
          <div class="field"><label for="m-role">角色</label><select id="m-role" name="role"><option value="member">成员</option><option value="owner">所有者</option></select></div>
          <button class="btn primary" type="submit">${icon('plus', 'sm')}开通</button>
        </div>
        <p class="form-error" id="add-error" role="alert"></p>
      </form>
      ${secret ? `<div class="secret">${icon('key')}<span>${esc(secret.title)}</span><code id="secret-pw">${esc(secret.password)}</code><button class="btn sm" data-copy="${esc(secret.password)}">${icon('copy', 'sm')}复制</button><span class="small soft">离开此页后不再显示。</span></div>` : ''}
      <div class="table-wrap mid"><table>
        <thead><tr><th>成员</th><th>角色</th><th>状态</th><th>最近登录</th><th>操作</th></tr></thead>
        <tbody>${members.map(row).join('')}</tbody>
      </table></div>
      ${callout('info', '停用后会怎样', '对方立即无法登录和下载，已登录的设备在下一次操作时退出。已经下载到对方电脑上的程序仍能运行，已复制的资料无法收回。')}`
    };
  }

  const s = await api('/api/admin/status');
  return {
    title: '站点状态',
    html: `
    <header class="page-head"><span class="eyebrow">站点管理</span><h1>站点状态</h1><p>内容检查、下载文件校验和最近的下载记录。</p></header>
    ${tabs}
    <div class="stat-row">
      <div class="card stat"><b>${s.counts.tool}</b><span>已发布工具</span></div>
      <div class="card stat"><b>${s.counts.skill}</b><span>已发布 SKILL</span></div>
      <div class="card stat"><b>${s.counts.doc}</b><span>教程与问答</span></div>
      <div class="card stat"><b>${s.sessions}</b><span>当前登录会话</span></div>
    </div>
    ${s.problems.length ? callout('danger', `发现 ${s.problems.length} 个问题`, s.problems.map(esc).join('<br>')) : callout('ok', '内容检查通过', `草稿 ${s.counts.draft} 篇，仅所有者可见 ${s.counts.ownerOnly} 篇。`)}
    <section class="stack">
      <h2>下载文件</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>文件</th><th>工具 · 版本</th><th>状态</th><th class="num">大小</th><th>SHA256</th></tr></thead>
        <tbody>${s.assets.map(a => `<tr><td>${esc(a.label)}</td><td class="small">${esc(a.tool)} · <span class="mono">${esc(a.version)}</span></td><td>${tag(ASSET_STATE[a.state][0], ASSET_STATE[a.state][1])}</td><td class="num small">${fmtBytes(a.size)}</td><td class="mono tiny muted">${a.sha256 ? esc(a.sha256.slice(0, 16)) + '…' : '未登记'}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="small muted">待上传的文件：在你的电脑上运行 <code class="mono">npm run release -- --asset 文件ID --file 本机路径</code> 登记后同步到服务器。</p>
    </section>
    <section class="stack">
      <h2>内容反馈</h2>
      ${s.feedback?.summary.length ? `<div class="table-wrap"><table><thead><tr><th>内容</th><th class="num">有帮助</th><th class="num">没帮助</th></tr></thead><tbody>${s.feedback.summary.map(f => `<tr><td>${esc(f.name)}</td><td class="num">${f.up}</td><td class="num">${f.down ? `<b class="bad-text">${f.down}</b>` : 0}</td></tr>`).join('')}</tbody></table></div>
        ${s.feedback.recent.filter(f => f.comment).length ? `<div class="card comment-list">${s.feedback.recent.filter(f => f.comment).map(f => `<div class="comment"><div class="row tiny muted"><span>${fmtDateTime(f.at)}</span><span class="mono">${esc(f.account)}</span><span>${esc(f.name)}</span>${f.helpful ? tag('有帮助', 'ok') : tag('没帮助', 'bad')}</div><p>${esc(f.comment)}</p></div>`).join('')}</div>` : ''}`
        : '<p class="soft small">还没有收到反馈。成员在文章和工具页面底部点「有帮助／没帮助」后会显示在这里。</p>'}
    </section>
    <section class="stack">
      <h2>最近下载</h2>
      ${s.downloads.length ? `<div class="table-wrap"><table><thead><tr><th>时间</th><th>账号</th><th>文件</th><th>版本</th></tr></thead><tbody>${s.downloads.map(d => `<tr><td class="small">${fmtDateTime(d.at)}</td><td class="mono small">${esc(d.account)}</td><td class="small">${esc(d.asset)}</td><td class="mono small">${esc(d.version)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="soft small">还没有下载记录。</p>`}
    </section>`
  };
}

/* ---------- 账号 ---------- */
function passwordForm(forced) {
  return `<form class="${forced ? 'auth-form' : 'card pad stack'}" id="pw-form">
    ${forced ? `<div class="stack sm"><h2>设置你的密码</h2><p class="soft small">这是你第一次登录，或站主刚为你重置了密码。请换成只有你知道的密码。</p></div>` : '<h3>修改密码</h3>'}
    <div class="field"><label for="pw-current">${forced ? '临时密码' : '当前密码'}</label><input id="pw-current" type="password" autocomplete="current-password" required></div>
    <div class="field"><label for="pw-next">新密码</label><input id="pw-next" type="password" autocomplete="new-password" minlength="8" required><span class="hint">至少 8 位，不要与其他网站相同。</span></div>
    <div class="field"><label for="pw-again">再输入一次</label><input id="pw-again" type="password" autocomplete="new-password" minlength="8" required></div>
    <p class="form-error" id="pw-error" role="alert"></p>
    <div class="row"><button class="btn primary ${forced ? 'lg' : ''}" type="submit">保存新密码</button>${forced ? '<button class="btn ghost" type="button" data-act="logout">退出</button>' : ''}</div>
  </form>`;
}

function viewAccount() {
  return {
    title: '修改密码',
    html: `<header class="page-head"><span class="eyebrow">账号</span><h1>修改密码</h1><p>修改后，你在其他设备上的登录会失效，需要重新登录。</p></header>
      <div class="two">${passwordForm(false)}<div class="card pad stack"><h3>${icon('shield', 'sm')}账号信息</h3><dl class="kv"><dt>姓名</dt><dd>${esc(state.user.name)}</dd><dt>账号</dt><dd class="mono">${esc(state.user.account)}</dd><dt>角色</dt><dd>${state.user.role === 'owner' ? '站点所有者' : '团队成员'}</dd></dl><p class="small soft">忘记密码时，请联系站主重置。</p></div></div>`
  };
}

function authLayout(inner) {
  root.innerHTML = `<div class="auth">
    <section class="auth-art">
      <span class="brand">${brandMark()}<span class="brand-name"><b>造物册</b><span>zaowuce.com</span></span></span>
      <div class="stack lg">
        <h1>团队的工具工作台<br>与知识库</h1>
        <p>常用工具、AI 工作方法和操作教程放在一处。知道该用什么，照着做完，再按清单核对。</p>
      </div>
      <ul class="auth-points">
        <li>${icon('laptop')}<span>进销存表格在你自己的电脑上处理，网站不收文件</span></li>
        <li>${icon('shield')}<span>每个下载包都登记了 SHA256，校验通过才提供</span></li>
        <li>${icon('lock')}<span>仅限受邀成员访问，停用后立即失效</span></li>
      </ul>
    </section>
    <section class="auth-form-wrap">${inner}</section>
  </div>`;
}

function renderLogin() {
  document.title = '登录 · 造物册';
  authLayout(`<form class="auth-form" id="login-form">
      <div class="stack sm"><h2>登录</h2><p class="soft small">${DEMO ? '演示版：任意账号和密码都能登录。' : '使用站主为你开通的账号。'}</p></div>
      <div class="field"><label for="l-account">账号</label><input id="l-account" autocomplete="username" autocapitalize="off" required ${DEMO ? 'value="member-a"' : ''}></div>
      <div class="field"><label for="l-password">密码</label><input id="l-password" type="password" autocomplete="current-password" required ${DEMO ? 'value="demo-password"' : ''}></div>
      <p class="form-error" id="login-error" role="alert"></p>
      <button class="btn primary lg" type="submit">登录</button>
      <p class="small muted">没有账号或忘记密码，请联系站主。</p>
    </form>`);
}

function renderForcedPassword() {
  document.title = '设置密码 · 造物册';
  authLayout(passwordForm(true));
}

function renderFatal(e) {
  root.innerHTML = `<div class="auth-form-wrap"><div class="auth-form">${errorView(e).html}</div></div>`;
}

/* ---------- 状态页 ---------- */
function notFound(msg) {
  return {
    title: '找不到页面',
    html: `<div class="empty"><span class="tile">${icon('compass', 'lg')}</span><b>找不到这个页面</b><span>${esc(msg || '链接可能已失效，或内容已被撤回。')}</span><div class="row"><a class="btn sm primary" href="${href('/')}">回到工作台</a><a class="btn sm" href="${href('/tools')}">查看全部工具</a></div></div>`
  };
}
function forbidden(msg) {
  return {
    title: '没有权限',
    html: `<div class="empty"><span class="tile">${icon('lock', 'lg')}</span><b>没有权限查看</b><span>${esc(msg || '如果你需要这部分内容，请联系站主。')}</span><a class="btn sm" href="${href('/')}">回到工作台</a></div>`
  };
}
function errorView(e) {
  return {
    title: '出错了',
    html: `<div class="empty"><span class="tile">${icon('alert', 'lg')}</span><b>页面加载失败</b><span>${esc(e?.message || '请稍后重试。')}</span><button class="btn sm" data-act="reload">${icon('refresh', 'sm')}重试</button></div>`
  };
}

/* ---------- 快速搜索 ---------- */
function initPalette() {
  state.palette = createPalette({
    items: allItems,
    recents: recentItems,
    score,
    open: ({ item, search }) => navigate(item ? itemPath(item) : '/search?q=' + encodeURIComponent(search)),
    actions: () => {
      const list = [
        { label: '回到工作台', icon: 'home', run: () => navigate('/') },
        { label: '工具目录', icon: 'tools', run: () => navigate('/tools') },
        { label: 'SKILL', icon: 'skill', run: () => navigate('/skills') },
        { label: '知识库', icon: 'book', run: () => navigate('/docs') },
        { label: '更新记录', icon: 'history', run: () => navigate('/changelog') },
        { label: '切换深浅色', icon: 'moon', hint: '当前为' + (isDark() ? '深色' : '浅色'), run: toggleTheme },
        { label: '修改密码', icon: 'key', run: () => navigate('/account') }
      ];
      if (state.user?.role === 'owner') list.push({ label: '成员管理', icon: 'users', run: () => navigate('/admin') }, { label: '站点状态', icon: 'activity', run: () => navigate('/admin/status') });
      return list;
    }
  });
}

async function toggleFavorite(btn) {
  const key = btn.dataset.key;
  const on = !state.favorites.has(key);
  btn.disabled = true;
  try {
    const r = await api('/api/favorites', { method: 'POST', body: { key, on } });
    state.favorites = new Set(r.favorites);
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('span').textContent = on ? '已收藏' : '收藏';
    toast(on ? '已收藏，首页「我的收藏」里可以找到' : '已取消收藏');
  } catch (e) { toast(e.message, 'bad'); }
  btn.disabled = false;
}

/* ---------- 事件 ---------- */
function bindGlobal() {
  document.addEventListener('click', async e => {
    const a = e.target.closest('a[href]');
    if (a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !a.target) {
      const raw = a.getAttribute('href');
      if (a.hasAttribute('data-download')) {
        if (DEMO) { e.preventDefault(); toast('演示版不提供下载'); }
        return;
      }
      if (raw.startsWith('#') && !raw.startsWith('#/')) {
        e.preventDefault();
        document.getElementById(raw.slice(1))?.scrollIntoView({ behavior: smooth(), block: 'start' });
        return;
      }
      const path = raw.startsWith('#/') ? raw.slice(1) : raw.startsWith('/') && !raw.startsWith('/downloads/') && !raw.startsWith('/api/') ? raw : null;
      if (path) { e.preventDefault(); navigate(path); return; }
    }

    const t = e.target.closest('[data-act],[data-filter],[data-copy],[data-q]');
    if (!t) return;
    if (t.dataset.filter) { state.filters[t.dataset.filter] = t.dataset.v; render(); return; }
    if (t.dataset.copy) { copyText(t.dataset.copy); return; }
    if (t.dataset.q) { navigate('/search?q=' + encodeURIComponent(t.dataset.q)); return; }
    const act = t.dataset.act;
    if (act === 'menu') openMenu();
    if (act === 'palette') state.palette?.show();
    if (act === 'fav') toggleFavorite(t);
    if (act === 'fb-vote') {
      const box = t.closest('.feedback');
      const helpful = t.dataset.v === '1';
      box.dataset.helpful = String(helpful);
      box.innerHTML = `<form class="fb-form stack" data-fb>
        <label for="fb-text"><b>${helpful ? '谢谢！还有什么可以写得更清楚？' : '哪里没讲清楚，或者缺了什么？'}</b><span class="small muted">（可选，站主会看到）</span></label>
        <textarea id="fb-text" maxlength="500" rows="3" placeholder="例如：第 2 步里的「源报表」不知道去哪里导出"></textarea>
        <div class="row"><button class="btn sm primary" type="submit">提交</button><button class="btn sm ghost" type="submit" data-skip>不写了，直接提交</button></div>
      </form>`;
      box.querySelector('textarea').focus();
    }
    if (act === 'theme') toggleTheme();
    if (act === 'reload') render();
    if (act === 'logout') {
      try { await api('/api/logout', { method: 'POST' }); } catch { /* 会话可能已失效 */ }
      state.user = null; state.catalog = null;
      if (!HASH) history.replaceState(null, '', '/');
      renderLogin();
    }
    if (act === 'clear-filters') { state.filters.run = 'all'; state.filters.maturity = 'all'; render(); }
    if (act === 'goto-downloads') document.getElementById('downloads')?.scrollIntoView({ behavior: smooth(), block: 'start' });
    if (act === 'goto-widget') { document.getElementById('widget')?.scrollIntoView({ behavior: smooth(), block: 'start' }); document.getElementById('dd-in')?.focus(); }
    if (act === 'dedupe') runDedupe();
    if (act === 'copy-dedupe') { const o = document.getElementById('dd-out'); copyText(o.value, o); }
    if (act === 'copy-prompt') { const pre = document.querySelector('pre[data-copyable] code'); if (pre) copyText(pre.textContent, pre); }
    if (act === 'copy-pre') { const code = t.closest('pre').querySelector('code'); copyText(code.textContent, code); }
    if (act === 'ask') { state.confirm = { account: t.dataset.account, action: t.dataset.action }; render(); }
    if (act === 'cancel-confirm') { state.confirm = null; render(); }
    if (act === 'member') {
      state.confirm = null;
      try {
        const r = await api(`/api/admin/members/${encodeURIComponent(t.dataset.account)}/${t.dataset.action}`, { method: 'POST' });
        if (r.password) state.adminSecret = { title: `${r.member.name} 的新临时密码`, password: r.password };
        toast({ disable: `已停用 ${r.member.name}`, enable: `已恢复 ${r.member.name}`, reset: `已重置 ${r.member.name} 的密码` }[t.dataset.action]);
      } catch (err) { toast(err.message, 'bad'); }
      render();
    }
  });

  document.addEventListener('click', e => { if (e.target.id === 'scrim') closeMenu(); });

  document.addEventListener('submit', async e => {
    const f = e.target;
    if (f.matches('[data-search]')) {
      e.preventDefault();
      const q = new FormData(f).get('q')?.toString().trim();
      if (q) navigate('/search?q=' + encodeURIComponent(q));
      return;
    }
    if (f.matches('[data-fb]')) {
      e.preventDefault();
      const box = f.closest('.feedback');
      const skip = e.submitter?.hasAttribute('data-skip');
      try {
        await api('/api/feedback', { method: 'POST', body: { key: box.dataset.key, helpful: box.dataset.helpful === 'true', comment: skip ? '' : f.querySelector('textarea').value } });
        box.innerHTML = `<div class="fb-done">${icon('checkCircle')}<span>已收到，谢谢你的反馈。</span></div>`;
      } catch (ex) { toast(ex.message, 'bad'); }
      return;
    }
    if (f.id === 'login-form') {
      e.preventDefault();
      const err = document.getElementById('login-error');
      const btn = f.querySelector('button[type="submit"]');
      btn.disabled = true; err.textContent = '';
      try {
        const r = await api('/api/login', { method: 'POST', body: { account: f.querySelector('#l-account').value, password: f.querySelector('#l-password').value } });
        state.user = r.user;
        root.innerHTML = '';
        render();
      } catch (ex) {
        err.textContent = ex.message;
        btn.disabled = false;
      }
      return;
    }
    if (f.id === 'pw-form') {
      e.preventDefault();
      const err = document.getElementById('pw-error');
      const next = f.querySelector('#pw-next').value;
      if (next !== f.querySelector('#pw-again').value) { err.textContent = '两次输入的新密码不一致'; return; }
      try {
        await api('/api/password', { method: 'POST', body: { current: f.querySelector('#pw-current').value, next } });
        state.user = { ...state.user, mustChange: false };
        toast('密码已更新');
        root.innerHTML = '';
        if (!HASH && location.pathname === '/account') history.replaceState(null, '', '/');
        else if (HASH) history.replaceState(null, '', '#/');
        render();
      } catch (ex) { err.textContent = ex.message; }
      return;
    }
    if (f.id === 'add-member') {
      e.preventDefault();
      const err = document.getElementById('add-error');
      try {
        const r = await api('/api/admin/members', { method: 'POST', body: { name: f.querySelector('#m-name').value, account: f.querySelector('#m-account').value, role: f.querySelector('#m-role').value } });
        state.adminSecret = { title: `${r.member.name}（${r.member.account}）的临时密码`, password: r.password };
        toast(`已开通 ${r.member.name}`);
        render();
      } catch (ex) { err.textContent = ex.message; }
    }
  });

  window.addEventListener(HASH ? 'hashchange' : 'popstate', () => render());
  window.addEventListener('scroll', () => document.getElementById('topbar')?.classList.toggle('scrolled', scrollY > 4), { passive: true });
  document.addEventListener('keydown', e => {
    if (!state.user || !document.getElementById('content')) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      state.palette.isOpen() ? state.palette.close() : state.palette.show();
      return;
    }
    if (e.key === '/' && !typing && !state.palette.isOpen()) { e.preventDefault(); state.palette.show(); }
    if (e.key === 'Escape') closeMenu();
  });
}

const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

boot();
