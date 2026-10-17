import { icon } from './icons.js';
import { esc, highlight, tile, TYPE_LABEL } from './ui.js';

/**
 * 全站快速搜索（Ctrl/⌘ K）。参考 Linear、Vercel 的命令面板：
 * 空白时列出最近访问和常用入口；输入后即时匹配工具、SKILL、文章；方向键选择，回车打开。
 */
export function createPalette({ items, recents, actions, open, score }) {
  let el = null;
  let results = [];
  let active = 0;
  let lastFocus = null;

  function build() {
    el = document.createElement('div');
    el.className = 'palette-wrap';
    el.hidden = true;
    el.innerHTML = `
      <div class="palette-scrim" data-close></div>
      <div class="palette" role="dialog" aria-modal="true" aria-label="快速搜索">
        <div class="palette-input">
          ${icon('search')}
          <input id="palette-q" type="text" placeholder="搜索工具、SKILL、文章，或输入旧称" autocomplete="off" spellcheck="false"
            role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list">
          <kbd>Esc</kbd>
        </div>
        <div class="palette-list" id="palette-list" role="listbox"></div>
        <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></div>
      </div>`;
    document.body.append(el);
    const input = el.querySelector('#palette-q');
    input.addEventListener('input', () => { active = 0; update(); });
    input.addEventListener('keydown', onKey);
    el.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return close();
      const opt = e.target.closest('[data-i]');
      if (opt) choose(Number(opt.dataset.i));
    });
    el.addEventListener('mousemove', e => {
      const opt = e.target.closest('[data-i]');
      if (opt && Number(opt.dataset.i) !== active) { active = Number(opt.dataset.i); paintActive(); }
    });
  }

  function update() {
    const q = el.querySelector('#palette-q').value.trim();
    const ql = q.toLowerCase();
    const groups = [];
    if (!q) {
      const rec = recents().slice(0, 6);
      if (rec.length) groups.push(['最近访问', rec.map(i => ({ kind: 'item', item: i }))]);
      groups.push(['常用入口', actions().map(a => ({ kind: 'action', action: a }))]);
    } else {
      const hits = items().map(i => ({ i, s: score(i, ql) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 8);
      if (hits.length) groups.push(['匹配结果', hits.map(h => ({ kind: 'item', item: h.i }))]);
      groups.push(['', [{ kind: 'search', q }]]);
      const acts = actions().filter(a => a.label.toLowerCase().includes(ql));
      if (acts.length) groups.push(['操作', acts.map(a => ({ kind: 'action', action: a }))]);
    }
    results = groups.flatMap(([, list]) => list);
    if (active >= results.length) active = 0;

    let n = 0;
    const row = r => {
      const i = n++;
      if (r.kind === 'item') {
        const it = r.item;
        const alias = q && (it.aliases || []).find(a => a.toLowerCase().includes(ql) && !it.name.toLowerCase().includes(ql));
        return `<div class="palette-opt" role="option" id="po-${i}" data-i="${i}">${tile(it)}<span class="grow"><b>${highlight(it.name, q)}</b><span>${alias ? `旧称：${highlight(alias, q)}` : esc(it.summary)}</span></span><span class="palette-type">${esc(TYPE_LABEL[it.type])}</span></div>`;
      }
      if (r.kind === 'search') return `<div class="palette-opt" role="option" id="po-${i}" data-i="${i}"><span class="tile doc">${icon('search')}</span><span class="grow"><b>查看「${esc(r.q)}」的全部搜索结果</b></span>${icon('arrow', 'sm')}</div>`;
      return `<div class="palette-opt" role="option" id="po-${i}" data-i="${i}"><span class="tile doc">${icon(r.action.icon)}</span><span class="grow"><b>${esc(r.action.label)}</b>${r.action.hint ? `<span>${esc(r.action.hint)}</span>` : ''}</span></div>`;
    };
    el.querySelector('#palette-list').innerHTML = groups.map(([title, list]) => `${title ? `<div class="palette-group">${title}</div>` : ''}${list.map(row).join('')}`).join('')
      || '<div class="palette-empty">没有找到相关内容</div>';
    paintActive();
  }

  function paintActive() {
    el.querySelectorAll('.palette-opt').forEach(o => o.setAttribute('aria-selected', String(Number(o.dataset.i) === active)));
    const cur = el.querySelector(`#po-${active}`);
    el.querySelector('#palette-q').setAttribute('aria-activedescendant', cur ? cur.id : '');
    cur?.scrollIntoView({ block: 'nearest' });
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(results.length, 1); paintActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % Math.max(results.length, 1); paintActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') e.preventDefault();
  }

  function choose(i) {
    const r = results[i];
    if (!r) return;
    close();
    if (r.kind === 'item') open({ item: r.item });
    else if (r.kind === 'search') open({ search: r.q });
    else r.action.run();
  }

  function show(initial = '') {
    if (!el) build();
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add('no-scroll');
    const input = el.querySelector('#palette-q');
    input.value = initial;
    active = 0;
    update();
    input.focus();
  }

  function close() {
    if (!el || el.hidden) return;
    el.hidden = true;
    document.body.classList.remove('no-scroll');
    lastFocus?.focus?.();
  }

  return { show, close, isOpen: () => !!el && !el.hidden };
}
