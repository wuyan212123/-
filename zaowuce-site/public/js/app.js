import { icon, brandMark } from './icons.js';
import { api, useBackend } from './api.js';
import { createPalette } from './palette.js';
import { esc, fmtBytes, fmtDateTime, greeting, highlight, toast, copyText, RUN_MODE, ASSET_STATE, TYPE_LABEL } from './ui.js';

const DEMO = !!document.querySelector('meta[name="zw-demo"]');
const HASH = DEMO; // 演示版放在单个页面里，用 # 路由
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MAC = /mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform || '');
const KEY_HINT = IS_MAC ? '⌘ K' : 'Ctrl K';
const root = document.getElementById('app');

const state = {
  user: null,
  catalog: null,
  favorites: new Set(),
  filters: { run: 'all', topic: 'all' },
  adminSecret: null,
  confirm: null,
  palette: null
};

/* ---------- 路由 ---------- */
const href = p => (HASH ? '#' + p : p);
function currentUrl() {
  const raw = HASH ? (location.hash.slice(1) || '/') : location.pathname + location.search;
  return new URL(raw.startsWith('/') ? raw : '/', 'http://local');
}
function navigate(path, { replace = false } = {}) {
  if (HASH) {
    if (replace) { history.replaceState(null, '', '#' + path); render(); } else location.hash = path;
    return;
  }
  history[replace ? 'replaceState' : 'pushState'](null, '', path);
  render();
}

const ROUTES = [
  [/^\/$/, () => viewHome()],
  [/^\/tools$/, () => viewTools()],
  [/^\/tools\/([\w-]+)$/, m => viewTool(m[1])],
  [/^\/skills$/, () => viewSkills()],
  [/^\/skills\/([\w-]+)$/, m => viewSkill(m[1])],
  [/^\/docs$/, () => viewDocs()],
  [/^\/docs\/([\w-]+)$/, m => viewDoc(m[1])],
  [/^\/changelog$/, () => viewChangelog()],
  [/^\/search$/, (m, url) => viewSearch(url.searchParams.get('q') || '')],
  [/^\/admin$/, () => viewAdmin('members')],
  [/^\/admin\/status$/, () => viewAdmin('status')],
  [/^\/account$/, () => viewAccount()]
];

/* ---------- 启动 ---------- */
async function boot() {
  if (!REDUCED) document.documentElement.classList.add('js-reveal');
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
  closeOverlays();
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading"><span class="spinner" aria-label="正在加载"></span></div>';

  let view;
  const route = ROUTES.find(([re]) => re.test(url.pathname));
  try {
    view = route ? await route[1](url.pathname.match(route[0]), url) : notFound();
  } catch (e) {
    if (e.status === 401) { state.user = null; return renderLogin(); }
    view = e.status === 404 ? notFound(e.message) : e.status === 403 ? forbidden(e.message) : errorView(e);
  }
  if (seq !== renderSeq) return;
  document.title = view.title ? `${view.title} - 造物册` : '造物册';
  document.getElementById('lnav-slot').innerHTML = view.lnav || '';
  content.innerHTML = view.html;
  window.scrollTo(0, 0);
  view.after?.(content);
  revealOnScroll(content);
}

/* ---------- 外壳：全局导航与页脚 ---------- */
const NAV = [['/tools', '工具'], ['/skills', 'SKILL'], ['/docs', '知识库'], ['/changelog', '更新记录']];

function renderShell() {
  const u = state.user;
  const owner = u.role === 'owner';
  root.innerHTML = `
  <header class="gnav" id="gnav">
    <nav class="gnav-inner" aria-label="全局">
      <a class="gnav-logo" href="${href('/')}">${brandMark()}<span>造物册</span></a>
      <div class="gnav-links" id="gnav-links"></div>
      <div class="gnav-actions">
        <button class="gnav-icon" data-act="palette" aria-label="搜索（${KEY_HINT}）" title="搜索（${KEY_HINT}）">${icon('search')}</button>
        <button class="gnav-icon" data-act="account" aria-label="账号" aria-expanded="false" aria-controls="acct-menu"><span class="gnav-avatar">${esc(u.name.slice(0, 1))}</span></button>
        <button class="gnav-icon gnav-burger" data-act="burger" aria-label="菜单" aria-expanded="false" aria-controls="sheet">${icon('menu')}</button>
      </div>
    </nav>
  </header>
  <div class="gnav-menu" id="acct-menu" hidden>
    <div class="who"><b>${esc(u.name)}</b><span>${owner ? '站点所有者' : '团队成员'} · ${esc(u.account)}</span></div>
    <a href="${href('/account')}">${icon('key', 'sm')}修改密码</a>
    ${owner ? `<a href="${href('/admin')}">${icon('users', 'sm')}成员管理</a><a href="${href('/admin/status')}">${icon('activity', 'sm')}站点状态</a>` : ''}
    <button data-act="logout">${icon('logout', 'sm')}退出登录</button>
  </div>
  <nav class="gnav-sheet" id="sheet" hidden aria-label="菜单">
    <a href="${href('/')}">工作台</a>
    ${NAV.map(([p, l]) => `<a href="${href(p)}">${l}</a>`).join('')}
    <div class="sheet-small">
      <a href="${href('/account')}">修改密码</a>
      ${owner ? `<a href="${href('/admin')}">成员管理</a><a href="${href('/admin/status')}">站点状态</a>` : ''}
      <a href="#" data-act="logout">退出登录</a>
    </div>
  </nav>
  <div id="lnav-slot"></div>
  <main id="content" tabindex="-1"></main>
  <footer class="gfoot" id="gfoot"></footer>`;
}

function updateShell(path) {
  const active = p => path === p || path.startsWith(p + '/');
  document.getElementById('gnav-links').innerHTML = NAV.map(([p, l]) => `<a href="${href(p)}"${active(p) ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  document.getElementById('gfoot').innerHTML = footer();
}

function footer() {
  const c = state.catalog;
  const owner = state.user.role === 'owner';
  const col = (title, links) => `<div><h4>${title}</h4>${links.join('')}</div>`;
  const a = (p, t) => `<a href="${href(p)}">${esc(t)}</a>`;
  return `<div class="wrap">
    <p class="gfoot-note">标有「试用版」的工具还在验收中，使用后请按页面上的核对清单检查结果。进销存表格只在你自己的电脑上处理，造物册不接收业务文件。</p>
    <div class="gfoot-cols">
      ${col('工具', c.tools.map(t => a('/tools/' + t.id, t.name)))}
      ${col('SKILL', c.skills.slice(0, 5).map(s => a('/skills/' + s.id, s.name)))}
      ${col('知识库', c.docs.filter(d => d.kind !== '常见问题').slice(0, 5).map(d => a('/docs/' + d.id, d.name)))}
      ${col('常见问题', c.docs.filter(d => d.kind === '常见问题').slice(0, 5).map(d => a('/docs/' + d.id, d.name)))}
      ${col('账号', [a('/account', '修改密码'), owner ? a('/admin', '成员管理') : '', owner ? a('/admin/status', '站点状态') : '', a('/changelog', '更新记录'), '<button data-act="logout">退出登录</button>'])}
    </div>
    <div class="gfoot-fine"><span>© ${new Date().getFullYear()} 造物册 · zaowuce.com · 仅限受邀成员使用</span><span>快速搜索：任意页面按 ${KEY_HINT}</span></div>
  </div>`;
}

function closeOverlays() {
  const menu = document.getElementById('acct-menu');
  const sheet = document.getElementById('sheet');
  if (menu) menu.hidden = true;
  if (sheet) sheet.hidden = true;
  root.querySelector('[data-act="account"]')?.setAttribute('aria-expanded', 'false');
  root.querySelector('[data-act="burger"]')?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

/* ---------- 共用片段 ---------- */
const chev = '<span class="chev" aria-hidden="true">›</span>';
const more = (p, text) => `<a class="more" href="${href(p)}">${esc(text)}${chev}</a>`;
const itemPath = i => ({ tool: '/tools/', skill: '/skills/', doc: '/docs/' }[i.type] + i.id);
const keyOf = i => `${i.type}:${i.id}`;
const allItems = () => (state.catalog ? [...state.catalog.tools, ...state.catalog.skills, ...state.catalog.docs] : []);
const byKey = k => allItems().find(i => keyOf(i) === k);
const DOC_KINDS = ['入门', '教程', '常见问题', '案例'];

const STATUS = { formal: ['正式版', ''], trial: ['试用版', 'new'], sample: ['示例', ''], history: ['历史版本', ''], upcoming: ['即将推出', 'new'] };
const statusLine = m => (STATUS[m] ? `<p class="eyebrow ${STATUS[m][1]}">${STATUS[m][0]}</p>` : '');

function favButton(item, cls = 'pill quiet') {
  const on = state.favorites.has(keyOf(item));
  return `<button class="${cls} fav${on ? ' on' : ''}" data-act="fav" data-key="${esc(keyOf(item))}" aria-pressed="${on}"><span>${on ? '已收藏' : '收藏'}</span></button>`;
}

function feedbackBox(item) {
  return `<section class="feedback" data-key="${esc(keyOf(item))}" aria-label="反馈">
    <div class="fb-ask"><span>这页内容对你有帮助吗？</span><div class="ctas">
      <button class="pill small quiet" data-act="fb-vote" data-v="1">有帮助</button>
      <button class="pill small quiet" data-act="fb-vote" data-v="0">没帮助</button>
    </div></div>
  </section>`;
}

function relatedRow(list) {
  if (!list?.length) return '';
  return `<div class="rel-row">${list.slice(0, 6).map(r => `<a class="rcard" href="${href(itemPath(r))}"><small>${esc(TYPE_LABEL[r.type])}${r.kind ? ' · ' + esc(r.kind) : ''}</small><b>${esc(r.name)}</b><span class="more">查看${chev}</span></a>`).join('')}</div>`;
}

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

/* ---------- 电脑系统识别：优先给出适合这台电脑的安装包 ---------- */
function detectOS() {
  const ua = navigator.userAgent || '';
  if (/iphone|ipad|android|mobile/i.test(ua)) return 'mobile';
  const p = (navigator.userAgentData?.platform || navigator.platform || ua).toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'macos';
  return null;
}
const OS_LABEL = { windows: 'Windows', macos: 'macOS' };

/* ---------- 插图：全部由 HTML/CSS 绘制 ---------- */
function mockWindow() {
  const rows = [['SKU-A001', 120, 40, 35], ['SKU-A002', 80, 0, 22], ['SKU-B014', 200, 60, 71], ['SKU-B020', 45, 30, 12], ['SKU-C003', 310, 0, 48]];
  return `<div class="mock" aria-hidden="true">
    <div class="mock-bar"><i></i><i></i><i></i><span>进销存表格更新</span></div>
    <div class="mock-body">
      <div class="mock-side"><b>本次更新</b><div class="ms done">准备文件</div><div class="ms done">预检</div><div class="ms on">生成结果</div><div class="ms">核对</div><div class="ms">保留文件</div></div>
      <div class="mock-main">
        <div class="mock-head"><div><small>业务基准日</small><b>2026-10-16</b></div><span class="mock-ok">预检通过</span></div>
        <table class="mock-table"><thead><tr><th>SKU</th><th class="opt">期初</th><th>入库</th><th>出库</th><th>期末</th></tr></thead>
        <tbody>${rows.map(([s, a, b, c]) => `<tr><td>${s}</td><td class="opt">${a}</td><td class="up">${b ? '+' + b : '0'}</td><td class="down">−${c}</td><td class="end">${a + b - c}</td></tr>`).join('')}</tbody></table>
        <div class="mock-foot"><span class="mock-file">主结果.xlsx</span><span class="mock-file rec">更新记录.xlsx</span></div>
      </div>
    </div>
  </div>`;
}

const ART = {
  dedupe: () => `<div class="art-dedupe" aria-hidden="true"><ul><li>water bottle 1l</li><li>blue bottle</li><li class="dup">water bottle 1l</li><li>kids bottle</li><li class="dup">blue bottle</li></ul><span class="to">→</span><ul class="clean"><li>water bottle 1l</li><li>blue bottle</li><li>kids bottle</li></ul></div>`,
  chart: () => `<div class="art-chart" aria-hidden="true"><div class="ac-head"><span><b>库存与计划</b>按 SKU · 国家 · 人员</span><span>团队共用一份</span></div><div class="bars"><i class="h3"></i><i class="h5"></i><i class="h2"></i><i class="h6"></i><i class="h4"></i><i class="h7"></i><i class="h5"></i><i class="h8"></i></div></div>`,
  orb: () => `<div class="art-orb" aria-hidden="true"><span>AI</span></div>`,
  books: () => `<div class="art-books" aria-hidden="true"><div class="b1"><b>入门</b><i></i><i class="s"></i><i></i></div><div class="b2"><b>教程</b><i></i><i></i><i class="s"></i></div><div class="b3"><b>常见问题</b><i></i><i class="s"></i><i></i></div></div>`,
  script: () => `<div class="art-script" aria-hidden="true"><b>' 进销存更新 V2.10.7</b><br>Sub 更新进销存()<br>&nbsp;&nbsp;' 已由「进销存表格更新」取代<br>End Sub</div>`
};
const TOOL_ART = { 'inventory-visualizer': 'chart', 'text-dedupe': 'dedupe', 'script-update': 'script' };
const GLYPH = { download: 'laptop', browser: 'globe', online: 'cloud', doc: 'file' };

/* ---------- 工作台 ---------- */
async function viewHome() {
  const c = state.catalog;
  const featured = c.tools.find(t => t.featured) || c.tools[0];
  const name = (state.user.name || '').trim();
  const tutorial = c.docs.find(d => d.id === featured?.tutorial);
  const guide = c.docs.find(d => d.id === 'getting-started');
  const visualizer = c.tools.find(t => t.id === 'inventory-visualizer');
  const dedupe = c.tools.find(t => t.run_mode === 'browser');
  const favs = [...state.favorites].map(byKey).filter(Boolean).slice(0, 4);
  const recents = recentItems().filter(i => !state.favorites.has(keyOf(i))).slice(0, 4);
  const STEP_TEXT = {
    准备文件: '主表、更新记录和本期源报表，放在同一个文件夹里。',
    运行: '选好文件先预检，通过后再生成。预检不通过，正式结果不会被改动。',
    核对结果: '显示完成不等于可以交付。按核对清单逐项检查。',
    保留文件: '主结果和更新记录一起归档，下次更新两个都要用。'
  };
  const linkRow = i => `<a href="${href(itemPath(i))}"><span><b>${esc(i.name)}</b><small>${esc(TYPE_LABEL[i.type])}${i.kind ? ' · ' + esc(i.kind) : ''}</small></span>${chev}</a>`;
  const news = c.changelog?.[0];

  return {
    title: '工作台',
    html: `
    <section class="hero-xl">
      <div class="wrap">
        <p class="hello">${greeting()}，${esc(name)}。</p>
        <h1 class="hero-title">把做事的方法，<br>装订成册。</h1>
        <p class="hero-sub">团队的工具、AI 工作方法和操作教程，都在这里。照着做完，再按清单核对。</p>
        <form class="search-big hero-search" role="search" data-search>
          ${icon('search')}
          <input type="search" name="q" placeholder="搜索工具、SKILL、教程，或输入旧称" aria-label="搜索" autocomplete="off">
        </form>
        <div class="ctas">
          ${featured ? `<a class="pill" href="${href('/tools/' + featured.id)}">更新进销存表格</a>` : ''}
          ${more('/tools', '浏览全部工具')}
        </div>
      </div>
      <div class="hero-art" data-reveal-art>${mockWindow()}<p class="mock-cap">进销存表格更新 · 界面示意，表中数字为虚构示例</p></div>
    </section>

    ${favs.length || recents.length ? `
    <section class="section tight gray">
      <div class="wrap continue">
        <div><h3>我的收藏</h3><p class="note">保存在你的账号里，换一台电脑也在。</p>
          ${favs.length ? `<div class="plain-links">${favs.map(linkRow).join('')}</div>` : '<p class="empty-line">在工具或文章页面点「收藏」，常用内容会出现在这里。</p>'}</div>
        <div><h3>最近访问</h3><p class="note">只记在这台设备上。</p>
          ${recents.length ? `<div class="plain-links">${recents.map(linkRow).join('')}</div>` : `<p class="empty-line">你打开过的页面会列在这里。随时按 ${KEY_HINT} 也能快速找到。</p>`}</div>
      </div>
    </section>` : ''}

    ${featured?.steps?.length ? `
    <section class="section">
      <div class="wrap">
        <div class="section-head reveal"><h2>四步，完成一次更新。</h2><p>第一次使用，先用练习样表完整走一遍，再处理正式表格。</p></div>
        <div class="steps4 reveal">${featured.steps.map((s, i) => `<div class="step4"><span class="step4-n">0${i + 1}</span><h3>${esc(s)}</h3><p>${esc(STEP_TEXT[s] || '')}</p></div>`).join('')}</div>
        <div class="spacer-56"></div>
        <div class="ctas reveal">
          <a class="pill" href="${href('/tools/' + featured.id)}">打开工具</a>
          ${tutorial ? more('/docs/' + tutorial.id, '阅读完整教程') : ''}
        </div>
      </div>
    </section>` : ''}

    <section class="wrap-wide tiles">
      ${visualizer ? `<a class="tile-xl reveal" href="${href('/tools/' + visualizer.id)}">
        ${statusLine(visualizer.maturity)}<h2 class="tile-title">${esc(visualizer.name)}</h2>
        <p class="tile-sub">一份库存与计划，团队一起看、一起改。</p>
        <div class="ctas"><span class="more">了解更多${chev}</span></div>
        <div class="tile-art">${ART.chart()}</div></a>` : ''}
      <a class="tile-xl dark reveal" href="${href('/skills')}">
        <h2 class="tile-title">AI 工作方法</h2>
        <p class="tile-sub">${c.skills.length} 份 SKILL，复制到你自己的 AI 工具里就能用。</p>
        <div class="ctas"><span class="more">浏览 SKILL${chev}</span></div>
        <div class="tile-art">${ART.orb()}</div></a>
      ${dedupe ? `<a class="tile-xl white reveal" href="${href('/tools/' + dedupe.id)}">
        ${statusLine(dedupe.maturity)}<h2 class="tile-title">${esc(dedupe.name)}</h2>
        <p class="tile-sub">粘贴，一键去重。文本不会离开你的浏览器。</p>
        <div class="ctas"><span class="more">立即使用${chev}</span></div>
        <div class="tile-art">${ART.dedupe()}</div></a>` : ''}
      <a class="tile-xl reveal" href="${href(guide ? '/docs/' + guide.id : '/docs')}">
        <h2 class="tile-title">照着做，就不会错。</h2>
        <p class="tile-sub">入门、教程和常见问题，每篇都标明适用的版本。</p>
        <div class="ctas"><span class="more">从入门开始${chev}</span></div>
        <div class="tile-art">${ART.books()}</div></a>
    </section>

    ${c.skills.length ? `
    <section class="section dark">
      <div class="wrap"><div class="section-head reveal"><h2>复制，即可使用。</h2><p>每份 SKILL 写明适用场景、需要准备的输入，以及怎样检查 AI 的输出。</p></div></div>
      <div class="scroller reveal" tabindex="0" aria-label="SKILL 列表">
        ${c.skills.map(s => `<a class="scard" href="${href('/skills/' + s.id)}"><p class="eyebrow">${esc(s.topic)}${s.maturity === 'sample' ? ' · 示例' : ''}</p><h3>${esc(s.name)}</h3><p>${esc(s.summary)}</p><div class="foot"><span class="mono">${esc(s.version)}</span><span class="plus" aria-hidden="true">+</span></div></a>`).join('')}
      </div>
    </section>` : ''}

    <section class="section gray">
      <div class="wrap">
        <div class="section-head left-head reveal"><h2>从这里开始。</h2></div>
        <div class="quick reveal">${c.docs.filter(d => d.kind !== '常见问题').slice(0, 6).map(d => `<a href="${href('/docs/' + d.id)}"><span>${esc(d.name)}<small>${esc(d.summary)}</small></span>${chev}</a>`).join('')}</div>
      </div>
    </section>

    ${news ? `<section class="section tight"><div class="wrap news"><b>${esc(news.date)} 更新</b><span>${esc(news.items[0] || '')}</span>${more('/changelog', '全部更新记录')}</div></section>` : ''}`
  };
}

/* ---------- 列表页 ---------- */
function prodCard(i, dark = false) {
  const foot = i.type === 'tool' ? esc(RUN_MODE[i.run_mode][0]) : `<span class="mono">${esc(i.version || '')}</span>`;
  return `<a class="prod${dark ? ' dark' : ''}" href="${href(itemPath(i))}">
    <span class="glyph">${icon(i.type === 'tool' ? GLYPH[i.run_mode] : 'skill')}</span>
    ${statusLine(i.maturity)}
    <h3>${esc(i.name)}</h3>
    <p>${esc(i.summary)}</p>
    <div class="foot"><span>${foot}</span><span class="more">了解更多${chev}</span></div>
  </a>`;
}

function segmented(key, opts) {
  return `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-filter="${key}" data-v="${esc(v)}" aria-pressed="${state.filters[key] === v}">${esc(l)}</button>`).join('')}</div>`;
}

function viewTools() {
  const f = state.filters;
  const list = state.catalog.tools.filter(t => f.run === 'all' || t.run_mode === f.run);
  return {
    title: '工具',
    html: `
    <section class="wrap page-hero"><h1>工具。</h1><p>每个工具只有一个页面，版本、安装包和教程都在里面。</p></section>
    <div class="wrap">
      <div class="seg-row">${segmented('run', [['all', '全部'], ['download', '下载后本机'], ['browser', '浏览器内'], ['online', '在线服务'], ['doc', '仅文档']])}</div>
      ${list.length ? `<div class="prod-grid">${list.map(t => prodCard(t)).join('')}</div>`
        : emptyState('没有这类工具', '换一个分类看看。', '<button class="pill quiet" data-act="clear-filters">显示全部</button>')}
    </div>
    <div class="section tight"></div>`
  };
}

function viewSkills() {
  const topics = [...new Set(state.catalog.skills.map(s => s.topic))];
  const list = state.catalog.skills.filter(s => state.filters.topic === 'all' || s.topic === state.filters.topic);
  return {
    title: 'SKILL',
    html: `
    <section class="wrap page-hero"><h1>SKILL。</h1><p>复制到你自己的 AI 工具里使用。造物册不运行 AI，也不会收到你粘贴给 AI 的内容。</p></section>
    <div class="wrap">
      <div class="seg-row">${segmented('topic', [['all', '全部'], ...topics.map(t => [t, t])])}</div>
      ${list.length ? `<div class="prod-grid">${list.map(s => prodCard(s, true)).join('')}</div>` : emptyState('这个主题下还没有 SKILL', '换一个主题看看。')}
    </div>
    <div class="section tight"></div>`
  };
}

function viewDocs() {
  const groups = DOC_KINDS.map(k => [k, state.catalog.docs.filter(d => d.kind === k)]).filter(([, l]) => l.length);
  return {
    title: '知识库',
    html: `
    <section class="wrap page-hero"><h1>知识库。</h1><p>每篇都标明适用的程序版本。版本不一致时，文章开头会提醒你。</p></section>
    <div class="wrap doc-groups">
      ${groups.map(([k, list]) => `<section class="doc-group reveal"><h2>${esc(k)}</h2><div class="plain-links">${list.map(d => `<a href="${href('/docs/' + d.id)}"><span><b>${esc(d.name)}</b><small>${esc(d.summary)}</small></span>${chev}</a>`).join('')}</div></section>`).join('')}
    </div>
    <div class="section tight"></div>`
  };
}

/* ---------- 工具详情（产品页结构） ---------- */
async function viewTool(id) {
  const item = await api(`/api/items/tool/${id}`);
  recordRecent(item);
  const os = detectOS();
  const r = item.release;
  const download = item.run_mode === 'download';
  const tutorial = item.related.find(x => x.type === 'doc' && x.id === item.tutorial) || item.related.find(x => x.type === 'doc' && x.kind === '教程');
  const current = r?.releases.find(x => x.status === 'current' && (!r.recommended || x.version === r.recommended));
  const mine = OS_LABEL[os] && current?.assets.find(a => a.os === os && (a.variant || 'standard') === 'standard');
  const dlLabel = OS_LABEL[os] ? `下载 ${OS_LABEL[os]} 版` : '下载';

  const primaryFor = cls => {
    if (download) return mine?.state === 'ok'
      ? `<a class="${cls}" href="/downloads/${esc(mine.id)}" data-download>${dlLabel}</a>`
      : `<a class="${cls}" href="#buy">${dlLabel}</a>`;
    if (item.run_mode === 'browser') return `<a class="${cls}" href="#use">开始使用</a>`;
    if (item.run_mode === 'online') return item.maturity === 'upcoming' ? `<button class="${cls}" disabled>即将推出</button>` : `<a class="${cls}" href="${esc(item.url || '#')}">打开工具</a>`;
    return '';
  };

  const sections = [['overview', '概览'], ...(item.widget ? [['use', '使用']] : []), ['how', download ? '使用步骤' : '说明'], ...(r ? [['buy', '版本与下载']] : []), ['help', '帮助']];
  const lnav = `<nav class="lnav" aria-label="${esc(item.name)}"><div class="lnav-inner">
    <a class="lnav-title" href="#overview">${esc(item.name)}</a>
    <div class="lnav-right"><div class="lnav-links">${sections.map(([a, l]) => `<a href="#${a}" data-sec="${a}">${l}</a>`).join('')}</div>${primaryFor('pill small')}</div>
  </div></nav>`;

  const notes = [];
  if (download && os === 'mobile') notes.push(['warn', '请在电脑上下载', '这个工具需要在 Windows 或 macOS 电脑上运行。手机上可以先看步骤和教程。']);
  if (item.data_location) notes.push(['', '文件在哪里处理', item.data_location]);
  if (item.unavailable_reason) notes.push(['warn', '为什么还没开放', item.unavailable_reason]);
  if (r?.notice) notes.push(['warn', '版本提示', r.notice]);
  const notesHtml = notes.length ? `<div class="band-stack">${notes.map(([tone, t, b]) => `<div class="band-note ${tone}">${icon(tone ? 'alert' : 'lock')}<span><b>${esc(t)}。</b>${esc(b)}</span></div>`).join('')}</div>` : '';

  const facts = download ? `<div class="facts reveal">
    <div class="fact"><b>本机处理</b><span>表格不上传到网站</span></div>
    <div class="fact"><b>${item.steps?.length || 4} 步</b><span>完成一次更新</span></div>
    <div class="fact"><b class="mono">v${esc(r?.versions?.package || '—')}</b><span>当前下载包</span></div>
    <div class="fact${r?.recommended ? '' : ' warn'}"><b>${r?.recommended ? 'v' + esc(r.recommended) : '待定'}</b><span>推荐版本</span></div>
  </div>` : '';

  const heroArt = item.id === 'inventory-table-update'
    ? `<div class="hero-art" data-reveal-art>${mockWindow()}<p class="mock-cap">界面示意，表中数字为虚构示例</p></div>`
    : TOOL_ART[item.id] ? `<div class="tile-art p-art">${ART[TOOL_ART[item.id]]()}</div>` : '';

  return {
    title: item.name,
    lnav,
    html: `
    <section class="p-hero${heroArt ? '' : ' compact'}" id="overview">
      <div class="wrap">
        ${statusLine(item.maturity)}
        <h1>${esc(item.name)}</h1>
        <p class="tagline">${esc(item.summary)}</p>
        ${item.aliases?.length ? `<p class="aka">也叫 ${item.aliases.map(esc).join(' · ')}</p>` : ''}
        <div class="ctas">${primaryFor('pill')}${tutorial ? more('/docs/' + tutorial.id, '查看教程') : ''}${favButton(item)}</div>
      </div>
      ${heroArt}
    </section>

    ${facts || notesHtml ? `<section class="section tight"><div class="wrap">${facts}${facts && notesHtml ? '<div class="spacer-56"></div>' : ''}${notesHtml}</div></section>` : ''}

    ${item.widget === 'dedupe' ? `<section class="section gray" id="use">${dedupeWidget()}</section>` : ''}

    <section class="section" id="how">
      <article class="wrap article" id="prose">${item.html}</article>
    </section>

    ${r ? buySection(r, os) : ''}

    <section class="section" id="help">
      <div class="wrap">
        ${item.related.length ? `<div class="section-head left-head"><h2>相关内容</h2></div>${relatedRow(item.related)}<div class="spacer-56"></div>` : ''}
        ${feedbackBox(item)}
      </div>
    </section>`,
    after: el => { enhanceProse(el, { numbered: download }); trackSections(); }
  };
}

function buySection(r, os) {
  const current = r.releases.filter(x => x.status !== 'archived');
  const variant = a => {
    const [text, tone] = ASSET_STATE[a.state];
    return `<div class="variant">
      <div class="variant-top"><b>${esc(a.label.split('·').pop().trim())}</b>${a.state === 'ok'
        ? `<a class="pill small" href="/downloads/${esc(a.id)}" data-download>下载</a>`
        : `<button class="pill small" disabled>${a.state === 'pending' ? '待上传' : '不可下载'}</button>`}</div>
      <div class="variant-meta"><span class="state-${tone || 'muted'}">${text}</span><span>${fmtBytes(a.size)}</span></div>
      ${a.sha256 ? `<div class="hash"><span>SHA256</span><code title="${esc(a.sha256)}">${esc(a.sha256)}</code><button data-copy="${esc(a.sha256)}" aria-label="复制 SHA256">${icon('copy', 'sm')}</button></div>` : ''}
    </div>`;
  };

  const cards = current.map(rel => {
    const groups = {};
    for (const a of rel.assets) (groups[a.os || 'other'] ||= []).push(a);
    const order = Object.keys(groups).sort((a, b) => (b === os) - (a === os));
    return order.map(k => `<div class="buy-card${k === os ? ' mine' : ''}">
      <div class="os"><h3>${esc(OS_LABEL[k] || '其他')}</h3>${k === os ? '<span class="mine-note">适合这台电脑</span>' : ''}</div>
      <p class="small muted">v${esc(rel.version)}${rel.status === 'withdrawn' ? ' · 已撤回' : r.recommended === rel.version ? ' · 推荐版本' : ''}</p>
      ${groups[k].map(variant).join('')}
    </div>`).join('');
  }).join('');

  const v = r.versions || {};
  const vcell = (val, l, unset = '—') => `<div>${val ? `<b>v${esc(val)}</b>` : `<b class="unset">${unset}</b>`}<span>${l}</span></div>`;
  const sample = r.attachments?.[0];
  const verified = current.flatMap(x => x.verified_on || []);

  return `<section class="section gray" id="buy">
    <div class="wrap">
      <div class="section-head reveal"><h2>选择适合你的电脑。</h2><p>每个文件都登记了 SHA256，服务器核对一致才提供下载。</p></div>
      <div class="buy reveal">${cards}</div>
      <div class="versions">${vcell(r.recommended, '推荐版本', '待定')}${vcell(v.package, '下载包')}${vcell(v.source, '源码')}${vcell(v.tutorial, '教程适用')}</div>
      <div class="buy-foot">
        ${sample ? `<span>${esc(sample.label)}：${sample.state === 'ok' ? `<a href="/downloads/${esc(sample.id)}" data-download>下载</a>` : esc(ASSET_STATE[sample.state][0])}</span>` : ''}
        <span>已验证系统：${verified.length ? esc(verified.join('、')) : '尚未登记'}</span>
        ${more('/docs/download-verify', '怎样确认下载的文件完整')}
      </div>
      ${r.known_limits?.length ? `<p class="buy-foot">${r.known_limits.map(esc).join(' ')}</p>` : ''}
    </div>
  </section>`;
}

function dedupeWidget() {
  const sample = ['blue water bottle', 'water bottle 1l', '  blue water bottle', 'stainless bottle', '', 'water bottle 1l', 'kids water bottle'].join('\n');
  return `<div class="widget">
    <div class="widget-grid">
      <div class="field"><label for="dd-in">原文本，每行一项</label><textarea id="dd-in" spellcheck="false">${esc(sample)}</textarea></div>
      <div class="field"><label for="dd-out">整理结果</label><textarea id="dd-out" readonly spellcheck="false"></textarea></div>
    </div>
    <div class="ctas start"><button class="pill" data-act="dedupe">整理</button><button class="pill secondary" data-act="copy-dedupe">复制结果</button><span class="small muted" id="dd-stat" aria-live="polite"></span></div>
    <p class="small muted">已填入示例文本，直接替换成你的内容即可。文本只在当前浏览器里处理。</p>
  </div>`;
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

/* ---------- SKILL 详情 ---------- */
async function viewSkill(id) {
  const item = await api(`/api/items/skill/${id}`);
  recordRecent(item);
  return {
    title: item.name,
    html: `
    <section class="skill-hero">
      <div class="wrap">
        ${statusLine(item.maturity)}
        <h1>${esc(item.name)}</h1>
        <p class="tagline">${esc(item.summary)}</p>
        <div class="ctas">
          ${item.hasPrompt ? '<button class="pill light" data-act="copy-prompt">复制提示词</button>' : ''}
          <a class="pill ghost-dark" href="${DEMO ? '#' : `/api/skills/${esc(item.id)}/file`}" data-download>下载 SKILL 文件</a>
          ${favButton(item, 'pill ghost-dark')}
        </div>
        <div class="spec"><span>版本<b class="mono">${esc(item.version)}</b></span><span>主题<b>${esc(item.topic)}</b></span><span>适用<b>${esc(item.env || '—')}</b></span></div>
      </div>
    </section>
    ${item.maturity === 'sample' || item.inputs?.length ? `<section class="section tight"><div class="wrap band-stack">
      ${item.maturity === 'sample' ? `<div class="band-note warn">${icon('alert')}<span><b>这是一份示例。</b>还没有用真实任务验证过，请对照文末「检查 AI 的输出」逐项核对。</span></div>` : ''}
      ${item.inputs?.length ? `<div class="band-note">${icon('folder')}<span><b>使用前准备：</b>${item.inputs.map(esc).join('、')}。</span></div>` : ''}
    </div></section>` : ''}
    <section class="section tight"><article class="wrap article" id="prose">${item.html}</article></section>
    <section class="section">
      <div class="wrap">
        ${item.related.length ? `<div class="section-head left-head"><h2>相关内容</h2></div>${relatedRow(item.related)}<div class="spacer-56"></div>` : ''}
        ${feedbackBox(item)}
      </div>
    </section>`,
    after: el => enhanceProse(el, {})
  };
}

/* ---------- 文章详情 ---------- */
async function viewDoc(id) {
  const item = await api(`/api/items/doc/${id}`);
  recordRecent(item);
  let mismatch = '';
  const tool = item.related.find(x => x.type === 'tool');
  if (item.applies_to?.length && tool) {
    try {
      const t = await api(`/api/items/tool/${tool.id}`);
      const pkg = t.release?.recommended || t.release?.versions?.package;
      if (pkg && !item.applies_to.includes(pkg)) mismatch = `<div class="band-note warn">${icon('alert')}<span><b>版本可能不一致。</b>本文适用于 v${esc(item.applies_to.join('、v'))}，${esc(tool.name)} 当前推荐的是 v${esc(pkg)}。</span></div><div class="spacer-40"></div>`;
    } catch { /* 工具不可见时不提示 */ }
  }
  const ordered = DOC_KINDS.flatMap(k => state.catalog.docs.filter(d => d.kind === k));
  const at = ordered.findIndex(d => d.id === item.id);
  const prev = ordered[at - 1];
  const next = ordered[at + 1];
  return {
    title: item.name,
    html: `
    <div class="wrap">
      <header class="doc-hero">
        <nav class="crumbs" aria-label="位置"><a href="${href('/docs')}">知识库</a>${chev}<span>${esc(item.kind)}</span></nav>
        <h1>${esc(item.name)}</h1>
        <p class="lead">${esc(item.summary)}</p>
        <div class="doc-meta">${item.applies_to?.length ? `<span>适用 v${esc(item.applies_to.join('、v'))}</span>` : ''}<span>更新于 ${esc(item.updated)}</span>${favButton(item, 'btn-text')}</div>
      </header>
      ${mismatch}
      <div class="doc-layout">
        <article class="article" id="prose">${item.html}</article>
        ${item.toc.length > 1 ? `<nav class="toc" id="toc" aria-label="本页目录"><b>本页内容</b>${item.toc.map(t => `<a href="#${t.id}" data-toc="${t.id}">${esc(t.title)}</a>`).join('')}</nav>` : '<span></span>'}
      </div>
      <div class="spacer-56"></div>
      <nav class="pager" aria-label="上一篇和下一篇">
        ${prev ? `<a href="${href('/docs/' + prev.id)}"><small>上一篇</small><b>${esc(prev.name)}</b></a>` : '<span></span>'}
        ${next ? `<a class="next" href="${href('/docs/' + next.id)}"><small>下一篇</small><b>${esc(next.name)}</b></a>` : '<span></span>'}
      </nav>
      <div class="spacer-40"></div>
      ${feedbackBox(item)}
      ${item.related.length ? `<div class="spacer-56"></div><div class="section-head left-head"><h2>相关内容</h2></div>${relatedRow(item.related)}` : ''}
    </div>
    <div class="section tight"></div>`,
    after: el => enhanceProse(el, {})
  };
}

/** 正文增强：步骤编号、提示词复制、核对清单进度、目录高亮。 */
function enhanceProse(el, { numbered }) {
  const prose = el.querySelector('#prose');
  if (!prose) return;
  if (numbered) prose.querySelectorAll(':scope > h2').forEach((h, i) => h.insertAdjacentHTML('afterbegin', `<span class="step-n">0${i + 1}</span>`));
  prose.querySelectorAll('pre[data-copyable]').forEach(pre => pre.insertAdjacentHTML('afterbegin', '<button class="pill small ghost-dark pre-copy" data-act="copy-pre">复制</button>'));
  prose.querySelectorAll('.checklist').forEach(list => {
    list.insertAdjacentHTML('beforebegin', '<div class="check-progress"><span>核对进度</span><span class="bar"><i></i></span><span class="count"></span></div>');
    const bar = list.previousElementSibling;
    const update = () => {
      const all = list.querySelectorAll('input').length;
      const done = list.querySelectorAll('input:checked').length;
      bar.querySelector('i').style.width = all ? `${(done / all) * 100}%` : '0';
      bar.querySelector('.count').textContent = `${done} / ${all}`;
      if (all && done === all && !list.dataset.done) { list.dataset.done = '1'; toast('全部核对完成'); }
      if (done < all) delete list.dataset.done;
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
      for (const e of entries) if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); links.get(e.target.id)?.classList.add('on'); }
    }, { rootMargin: '-90px 0px -65% 0px' });
    prose.querySelectorAll('h2[id]').forEach(h => io.observe(h));
  }
}

/** 工具页局部导航：高亮当前所在的区块。 */
function trackSections() {
  const links = document.querySelectorAll('.lnav-links a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.dataset.sec === e.target.id));
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.getElementById(a.dataset.sec); if (s) io.observe(s); });
}

/** 滚动到可见区域时淡入；进入视口前的内容不影响阅读，首屏立即显示。 */
function revealOnScroll(el) {
  const targets = el.querySelectorAll('.reveal, [data-reveal-art]');
  if (REDUCED || !('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
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
  const hits = ql ? allItems().map(i => ({ i, s: score(i, ql) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.i) : [];
  const groups = ['tool', 'skill', 'doc'].map(t => [t, hits.filter(h => h.type === t)]).filter(([, l]) => l.length);
  const row = i => {
    const alias = (i.aliases || []).find(a => a.toLowerCase().includes(ql) && !i.name.toLowerCase().includes(ql));
    return `<a class="result" href="${href(itemPath(i))}"><b>${highlight(i.name, query)}</b>${alias ? `<small>旧称：${highlight(alias, query)}</small>` : ''}<p>${highlight(i.summary, query)}</p></a>`;
  };
  return {
    title: query ? `搜索：${query}` : '搜索',
    html: `
    <section class="wrap page-hero"><h1>搜索。</h1>
      <form class="search-big" role="search" data-search>${icon('search')}<input type="search" name="q" value="${esc(query)}" placeholder="工具名、旧称或用途" aria-label="搜索" autocomplete="off"></form>
      ${query ? `<p class="small">找到 ${hits.length} 条结果，只包含你有权查看的内容。</p>` : ''}
    </section>
    <div class="wrap">
      ${groups.length ? `<div class="results">${groups.map(([t, l]) => `<section><h2>${TYPE_LABEL[t]}</h2>${l.map(row).join('')}</section>`).join('')}</div>`
        : query ? emptyState('没有找到相关内容', '试试更短的关键词，或者用程序以前的名字搜索。', `<a class="pill quiet" href="${href('/tools')}">查看全部工具</a>${more('/docs', '浏览知识库')}`) : ''}
    </div>
    <div class="section tight"></div>`
  };
}

/* ---------- 更新记录 ---------- */
async function viewChangelog() {
  const { entries } = await api('/api/changelog');
  return {
    title: '更新记录',
    html: `
    <section class="wrap page-hero"><h1>更新记录。</h1><p>新增的工具、内容和网站功能都记在这里，新的在上。</p></section>
    <div class="wrap">
      ${entries.length ? `<div class="log">${entries.map(e => `<article class="log-entry reveal"><time datetime="${esc(e.date)}">${esc(e.date)}</time><div class="article">${e.html}</div></article>`).join('')}</div>`
        : emptyState('还没有更新记录', '站主发布更新后会出现在这里。')}
    </div>
    <div class="section tight"></div>`
  };
}

/* ---------- 管理 ---------- */
async function viewAdmin(tab) {
  if (state.user.role !== 'owner') return forbidden('只有站点所有者可以查看这一页。');
  const tabs = `<div class="admin-tabs"><nav class="seg" aria-label="站点管理">
    <a href="${href('/admin')}"${tab === 'members' ? ' aria-current="page"' : ''}>成员</a>
    <a href="${href('/admin/status')}"${tab === 'status' ? ' aria-current="page"' : ''}>站点状态</a>
  </nav></div>`;

  if (tab === 'members') {
    const { members } = await api('/api/admin/members');
    const secret = state.adminSecret;
    state.adminSecret = null;
    const row = m => {
      const self = m.account === state.user.account;
      const conf = state.confirm?.account === m.account ? state.confirm.action : null;
      let actions;
      if (self) actions = '<span class="small muted">当前账号</span>';
      else if (conf) actions = `<span class="confirm">${conf === 'disable' ? '确定停用？' : '确定重置密码？'}<button class="pill small" data-act="member" data-action="${conf}" data-account="${esc(m.account)}">确定</button><button class="btn-text small" data-act="cancel-confirm">取消</button></span>`;
      else actions = `<span class="confirm">${m.enabled ? `<button class="btn-text small" data-act="ask" data-action="disable" data-account="${esc(m.account)}">停用</button>` : `<button class="btn-text small" data-act="member" data-action="enable" data-account="${esc(m.account)}">恢复</button>`}<button class="btn-text small" data-act="ask" data-action="reset" data-account="${esc(m.account)}">重置密码</button></span>`;
      const st = m.enabled ? (m.mustChange ? '<span class="state-warn">待修改初始密码</span>' : '<span class="state-ok">可登录</span>') : '<span class="muted">已停用</span>';
      return `<tr><td><div class="who-cell"><span class="avatar">${esc(m.name.slice(0, 1))}</span><span><b>${esc(m.name)}</b><small>${esc(m.account)}</small></span></div></td><td>${m.role === 'owner' ? '所有者' : '成员'}</td><td>${st}</td><td class="small muted">${fmtDateTime(m.lastLoginAt)}</td><td>${actions}</td></tr>`;
    };
    return {
      title: '成员',
      html: `
      <section class="wrap page-hero"><h1>成员。</h1><p>账号由你开通。临时密码只显示一次，请私下发给同事，对方首次登录后必须修改。</p></section>
      <div class="wrap">
        ${tabs}
        <form class="panel" id="add-member">
          <h3>开通新成员</h3>
          <div class="form-row">
            <div class="field"><label for="m-name">姓名</label><input id="m-name" required maxlength="40" placeholder="例如：张三"></div>
            <div class="field"><label for="m-account">登录账号</label><input id="m-account" required pattern="[a-z0-9][a-z0-9_.\\-]{1,31}" placeholder="小写字母或数字" autocapitalize="off"></div>
            <div class="field"><label for="m-role">角色</label><select id="m-role"><option value="member">成员</option><option value="owner">所有者</option></select></div>
            <button class="pill" type="submit">开通</button>
          </div>
          <p class="form-error" id="add-error" role="alert"></p>
        </form>
        ${secret ? `<div class="spacer-24"></div><div class="secret">${icon('key')}<span>${esc(secret.title)}</span><code>${esc(secret.password)}</code><button class="pill small quiet" data-copy="${esc(secret.password)}">复制</button><span class="small muted">离开此页后不再显示。</span></div>` : ''}
        <div class="admin-block">
          <div class="table-wrap"><table class="data-table"><thead><tr><th>成员</th><th>角色</th><th>状态</th><th>最近登录</th><th>操作</th></tr></thead><tbody>${members.map(row).join('')}</tbody></table></div>
          <div class="band-note">${icon('info')}<span><b>停用后：</b>对方立即无法登录和下载，已登录的设备在下一次操作时退出。已经下载到对方电脑上的程序仍能运行，已复制的资料无法收回。</span></div>
        </div>
      </div>
      <div class="section tight"></div>`
    };
  }

  const s = await api('/api/admin/status');
  return {
    title: '站点状态',
    html: `
    <section class="wrap page-hero"><h1>站点状态。</h1><p>内容检查、下载文件校验、成员反馈和下载记录。</p></section>
    <div class="wrap">
      ${tabs}
      <div class="stats">
        <div class="stat"><b>${s.counts.tool}</b><span>已发布工具</span></div>
        <div class="stat"><b>${s.counts.skill}</b><span>已发布 SKILL</span></div>
        <div class="stat"><b>${s.counts.doc}</b><span>教程与问答</span></div>
        <div class="stat"><b>${s.sessions}</b><span>当前登录会话</span></div>
      </div>
      ${s.problems.length
        ? `<div class="band-note warn">${icon('alert')}<span><b>发现 ${s.problems.length} 个问题：</b>${s.problems.map(esc).join('；')}</span></div>`
        : `<div class="band-note">${icon('checkCircle')}<span><b>内容检查通过。</b>草稿 ${s.counts.draft} 篇，仅所有者可见 ${s.counts.ownerOnly} 篇。</span></div>`}
      <div class="admin-block">
        <h2>下载文件</h2>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>文件</th><th>工具与版本</th><th>状态</th><th class="num">大小</th><th>SHA256</th></tr></thead>
        <tbody>${s.assets.map(a => `<tr><td>${esc(a.label)}</td><td class="small">${esc(a.tool)} · <span class="mono">${esc(a.version)}</span></td><td><span class="state-${ASSET_STATE[a.state][1] || 'muted'}">${ASSET_STATE[a.state][0]}</span></td><td class="num small">${fmtBytes(a.size)}</td><td class="mono tiny muted">${a.sha256 ? esc(a.sha256.slice(0, 16)) + '…' : '未登记'}</td></tr>`).join('')}</tbody></table></div>
        <p class="small muted">待上传的文件：在你的电脑上运行 <code class="mono">npm run release -- --asset 文件ID --file 本机路径</code>，然后发布。</p>
      </div>
      <div class="admin-block">
        <h2>内容反馈</h2>
        ${s.feedback?.summary.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>内容</th><th class="num">有帮助</th><th class="num">没帮助</th></tr></thead><tbody>${s.feedback.summary.map(f => `<tr><td>${esc(f.name)}</td><td class="num">${f.up}</td><td class="num">${f.down ? `<span class="state-bad">${f.down}</span>` : 0}</td></tr>`).join('')}</tbody></table></div>
          ${s.feedback.recent.filter(f => f.comment).map(f => `<div class="comment"><div class="meta"><span>${fmtDateTime(f.at)}</span><span class="mono">${esc(f.account)}</span><span>${esc(f.name)}</span><span class="${f.helpful ? 'state-ok' : 'state-bad'}">${f.helpful ? '有帮助' : '没帮助'}</span></div><p>${esc(f.comment)}</p></div>`).join('')}`
          : '<p class="muted">还没有收到反馈。成员在页面底部点「有帮助」或「没帮助」后会显示在这里。</p>'}
      </div>
      <div class="admin-block">
        <h2>最近下载</h2>
        ${s.downloads.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>时间</th><th>账号</th><th>文件</th><th>版本</th></tr></thead><tbody>${s.downloads.map(d => `<tr><td class="small">${fmtDateTime(d.at)}</td><td class="mono small">${esc(d.account)}</td><td class="small">${esc(d.asset)}</td><td class="mono small">${esc(d.version)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">还没有下载记录。</p>'}
      </div>
    </div>
    <div class="section tight"></div>`
  };
}

/* ---------- 账号 ---------- */
function passwordFields(forced) {
  if (forced) return `
    <div class="ffield"><input id="pw-current" type="password" autocomplete="current-password" required placeholder=" "><label for="pw-current">临时密码</label></div>
    <div class="ffield"><input id="pw-next" type="password" autocomplete="new-password" minlength="8" required placeholder=" "><label for="pw-next">新密码，至少 8 位</label></div>
    <div class="ffield"><input id="pw-again" type="password" autocomplete="new-password" minlength="8" required placeholder=" "><label for="pw-again">再输入一次</label></div>
    <p class="form-error" id="pw-error" role="alert"></p>`;
  return `
    <div class="field"><label for="pw-current">当前密码</label><input id="pw-current" type="password" autocomplete="current-password" required></div>
    <div class="field"><label for="pw-next">新密码</label><input id="pw-next" type="password" autocomplete="new-password" minlength="8" required><span class="hint">至少 8 位，不要与其他网站相同。</span></div>
    <div class="field"><label for="pw-again">再输入一次</label><input id="pw-again" type="password" autocomplete="new-password" minlength="8" required></div>
    <p class="form-error" id="pw-error" role="alert"></p>`;
}

function viewAccount() {
  return {
    title: '修改密码',
    html: `
    <section class="wrap page-hero"><h1>修改密码。</h1><p>修改后，你在其他设备上的登录会失效，需要重新登录。</p></section>
    <div class="wrap narrow">
      <form class="panel" id="pw-form">${passwordFields(false)}<div class="ctas start"><button class="pill" type="submit">保存新密码</button></div></form>
      <p class="small muted center-text">${esc(state.user.name)} · ${esc(state.user.account)} · ${state.user.role === 'owner' ? '站点所有者' : '团队成员'}。忘记密码时请联系站主重置。</p>
    </div>
    <div class="section tight"></div>`
  };
}

function authPage(inner) {
  root.innerHTML = `<main class="auth">
    <div class="auth-brand">${brandMark()}<h1>造物册</h1><p>团队的工具工作台与知识库</p></div>
    ${inner}
    <div class="auth-points"><span>${icon('laptop', 'sm')}表格在你自己的电脑上处理</span><span>${icon('shield', 'sm')}下载包逐个校验 SHA256</span><span>${icon('lock', 'sm')}仅限受邀成员</span></div>
  </main>`;
}

function renderLogin() {
  document.title = '登录 - 造物册';
  authPage(`<form class="auth-form" id="login-form">
    <p class="lead">${DEMO ? '演示版：任意账号和密码都能登录。' : '使用站主为你开通的账号登录。'}</p>
    <div class="ffield"><input id="l-account" autocomplete="username" autocapitalize="off" required placeholder=" " ${DEMO ? 'value="member-a"' : ''}><label for="l-account">账号</label></div>
    <div class="ffield"><input id="l-password" type="password" autocomplete="current-password" required placeholder=" " ${DEMO ? 'value="demo-password"' : ''}><label for="l-password">密码</label></div>
    <p class="form-error" id="login-error" role="alert"></p>
    <button class="pill" type="submit">登录</button>
    <p class="fine">没有账号或忘记密码，请联系站主。</p>
  </form>`);
}

function renderForcedPassword() {
  document.title = '设置密码 - 造物册';
  authPage(`<form class="auth-form" id="pw-form">
    <h2>设置你的密码</h2>
    <p class="lead">这是你第一次登录，或站主刚为你重置了密码。</p>
    ${passwordFields(true)}
    <button class="pill" type="submit">保存并进入</button>
    <p class="fine"><button class="btn-text" type="button" data-act="logout">退出登录</button></p>
  </form>`);
}

function renderFatal(e) {
  root.innerHTML = `<main class="wrap">${errorView(e).html}</main>`;
}

/* ---------- 状态页 ---------- */
function emptyState(title, body, actions = '') {
  return `<div class="empty"><b>${esc(title)}</b><span>${esc(body)}</span>${actions ? `<div class="ctas">${actions}</div>` : ''}</div>`;
}
function notFound(msg) {
  return { title: '找不到页面', html: `<div class="wrap">${emptyState('找不到这个页面。', msg || '链接可能已失效，或内容已被撤回。', `<a class="pill" href="${href('/')}">回到工作台</a>${more('/tools', '查看全部工具')}`)}</div>` };
}
function forbidden(msg) {
  return { title: '没有权限', html: `<div class="wrap">${emptyState('没有权限查看。', msg || '如果你需要这部分内容，请联系站主。', `<a class="pill" href="${href('/')}">回到工作台</a>`)}</div>` };
}
function errorView(e) {
  return { title: '出错了', html: `<div class="wrap">${emptyState('页面没有加载出来。', e?.message || '请稍后重试。', '<button class="pill" data-act="reload">重试</button>')}</div>` };
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
        { label: '工具', icon: 'tools', run: () => navigate('/tools') },
        { label: 'SKILL', icon: 'skill', run: () => navigate('/skills') },
        { label: '知识库', icon: 'book', run: () => navigate('/docs') },
        { label: '更新记录', icon: 'history', run: () => navigate('/changelog') },
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
    btn.classList.toggle('on', on);
    btn.querySelector('span').textContent = on ? '已收藏' : '收藏';
    toast(on ? '已收藏，首页「我的收藏」里可以找到' : '已取消收藏');
  } catch (e) { toast(e.message, 'bad'); }
  btn.disabled = false;
}

async function logout() {
  try { await api('/api/logout', { method: 'POST' }); } catch { /* 会话可能已失效 */ }
  state.user = null;
  state.catalog = null;
  if (!HASH) history.replaceState(null, '', '/');
  renderLogin();
}

/* ---------- 事件 ---------- */
function bindGlobal() {
  document.addEventListener('click', async e => {
    // 点击菜单外部时收起账号菜单
    const menu = document.getElementById('acct-menu');
    if (menu && !menu.hidden && !e.target.closest('#acct-menu, [data-act="account"]')) closeOverlays();

    const a = e.target.closest('a[href]');
    if (a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !a.target) {
      const raw = a.getAttribute('href');
      if (a.hasAttribute('data-download')) {
        if (DEMO) { e.preventDefault(); toast('演示版不提供下载'); }
        return;
      }
      if (a.dataset.act === 'logout') { e.preventDefault(); logout(); return; }
      if (raw.startsWith('#') && !raw.startsWith('#/')) {
        e.preventDefault();
        if (raw.length > 1) document.getElementById(raw.slice(1))?.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      const path = raw.startsWith('#/') ? raw.slice(1) : raw.startsWith('/') && !raw.startsWith('/downloads/') && !raw.startsWith('/api/') ? raw : null;
      if (path) { e.preventDefault(); closeOverlays(); navigate(path); return; }
    }

    const t = e.target.closest('[data-act],[data-filter],[data-copy]');
    if (!t) return;
    if (t.dataset.filter) { state.filters[t.dataset.filter] = t.dataset.v; render(); return; }
    if (t.dataset.copy) { copyText(t.dataset.copy); return; }
    const act = t.dataset.act;
    if (act === 'palette') { closeOverlays(); state.palette.show(); }
    if (act === 'account') {
      const open = menu.hidden;
      closeOverlays();
      menu.hidden = !open;
      t.setAttribute('aria-expanded', String(open));
    }
    if (act === 'burger') {
      const sheet = document.getElementById('sheet');
      const open = sheet.hidden;
      closeOverlays();
      sheet.hidden = !open;
      t.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    }
    if (act === 'reload') render();
    if (act === 'logout') logout();
    if (act === 'clear-filters') { state.filters.run = 'all'; render(); }
    if (act === 'dedupe') { runDedupe(); toast('已整理'); }
    if (act === 'copy-dedupe') { const o = document.getElementById('dd-out'); copyText(o.value, o); }
    if (act === 'copy-prompt') { const pre = document.querySelector('pre[data-copyable] code'); if (pre) copyText(pre.textContent, pre); }
    if (act === 'copy-pre') { const code = t.closest('pre').querySelector('code'); copyText(code.textContent, code); }
    if (act === 'fav') toggleFavorite(t);
    if (act === 'fb-vote') {
      const box = t.closest('.feedback');
      const helpful = t.dataset.v === '1';
      box.dataset.helpful = String(helpful);
      box.innerHTML = `<form class="fb-form" data-fb>
        <label for="fb-text">${helpful ? '谢谢！还有什么可以写得更清楚？' : '哪里没讲清楚，或者缺了什么？'}<span class="muted">（可选，站主会看到）</span></label>
        <textarea id="fb-text" maxlength="500" rows="3" placeholder="例如：第 2 步里的「源报表」不知道去哪里导出"></textarea>
        <div class="ctas start"><button class="pill small" type="submit">提交</button><button class="btn-text small" type="submit" data-skip>不写了，直接提交</button></div>
      </form>`;
      box.querySelector('textarea').focus();
    }
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
      btn.disabled = true;
      btn.textContent = '正在登录…';
      err.textContent = '';
      try {
        const r = await api('/api/login', { method: 'POST', body: { account: f.querySelector('#l-account').value, password: f.querySelector('#l-password').value } });
        state.user = r.user;
        root.innerHTML = '';
        render();
      } catch (ex) {
        err.textContent = ex.message;
        btn.disabled = false;
        btn.textContent = '登录';
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
        if (HASH) history.replaceState(null, '', '#/'); else if (location.pathname === '/account') history.replaceState(null, '', '/');
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
  document.addEventListener('keydown', e => {
    if (!state.user || !document.getElementById('content')) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (state.palette.isOpen()) state.palette.close(); else { closeOverlays(); state.palette.show(); }
      return;
    }
    if (e.key === '/' && !typing && !state.palette.isOpen()) { e.preventDefault(); state.palette.show(); }
    if (e.key === 'Escape') closeOverlays();
  });
}

boot();
