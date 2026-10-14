/* ========== 数据可视化：趋势小图、同月逐年对比图、月表色阶 ==========
   规则（dataviz 方法）：
   - 趋势小图：单序列，弱化灰线；最近一个完整月为强调色端点；当月未完整不画入，避免假下跌。
   - 逐年对比：强调式（当年 = 强调蓝，往年 = 有序灰阶，越早越浅，已用校验脚本验证）；
     ≥2 条线必有图例 + 选择性端点标注；十字准线 + 提示框（数值在前、年份在后）；
     下方月销量矩阵就是它的表格视图。
   - 色阶：单色顺序色（强调蓝 5 档），按每个 Listing 自身最大值分档，未完整月不着色。 */
const SPARK_N = 18;
function lastCompleteYM() { let y = Number(S.baseDate.slice(0, 4)), m = Number(S.baseDate.slice(5, 7)) - 1; if (m === 0) { y--; m = 12; } return { y, m }; }
function sparkPoints(monthly) {
  const end = lastCompleteYM(); const pts = [];
  for (let i = SPARK_N - 1; i >= 0; i--) {
    let y = end.y, m = end.m - i; while (m <= 0) { m += 12; y--; }
    const arr = monthly && monthly[y]; const v = arr ? arr[m - 1] : undefined;
    pts.push({ y, m, v: isNum(v) ? v : null });
  }
  return pts;
}
const ymLabel = p => `${p.y}-${String(p.m).padStart(2, '0')}`;
function sparkCell(l) {
  const pts = sparkPoints(l.monthly); const vals = pts.filter(p => p.v != null);
  if (vals.length < 2) return V('NF', {});
  const W = 80, H = 24, pad = 3; const max = Math.max(1, ...vals.map(p => p.v));
  const x = i => pad + i * (W - pad * 2) / (SPARK_N - 1); const yy = v => H - pad - v / max * (H - pad * 2);
  let d = '', pen = false;
  pts.forEach((p, i) => { if (p.v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${yy(p.v).toFixed(1)}`; pen = true; });
  const li = pts.map(p => p.v != null).lastIndexOf(true); const last = pts[li];
  const hi = vals.reduce((a, b) => (b.v > a.v ? b : a)); const lo = vals.reduce((a, b) => (b.v < a.v ? b : a));
  const desc = `近${SPARK_N}个月月销量（${ymLabel(pts[0])} 至 ${ymLabel(pts[SPARK_N - 1])}）：最新 ${ymLabel(last)} ${fmt(last.v)}，最高 ${ymLabel(hi)} ${fmt(hi.v)}，最低 ${ymLabel(lo)} ${fmt(lo.v)}${vals.length < SPARK_N ? `；${SPARK_N - vals.length} 个月无数据` : ''}`;
  return `<svg class="spark" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(desc)}"><title>${esc(desc)}</title><path d="${d}"/><circle cx="${x(li).toFixed(1)}" cy="${yy(last.v).toFixed(1)}" r="2.6"/></svg>`;
}

/* —— 同月逐年对比折线图（渲染后按容器宽度绘制） —— */
const CHARTS = {};
function chartSlot(id, spec) { CHARTS[id] = spec; return `<div class="yoy" id="${id}" tabindex="0" role="group" aria-label="${esc(spec.title)}，左右方向键逐月查看；完整数值见下方月销量表"></div>`; }
const niceMax = v => { if (v <= 0) return 10; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
const compact = v => v >= 10000 ? (v / 1000).toFixed(0) + 'K' : v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(v);
function drawCharts() {
  Object.keys(CHARTS).forEach(id => {
    const el = document.getElementById(id); if (!el) { delete CHARTS[id]; return; }
    if (CHARTS[id].type === 'proj') drawProj(el, CHARTS[id]); else drawYoy(el, CHARTS[id]);
  });
}
function drawYoy(el, spec) {
  const W = Math.max(280, Math.round(el.clientWidth)); const narrow = W < 520;
  const H = narrow ? 200 : 230; const m = { l: 40, r: narrow ? 12 : 46, t: 10, b: 26 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const series = spec.series; // [{year, vals:[12], partial: idx|null, color, cur}]
  if (!series.length) { el.innerHTML = `<div class="empty small"><h2>所选年份没有月度数据</h2></div>`; return; }
  const all = series.flatMap(s => s.vals.filter(isNum)); const ymax = niceMax(Math.max(...all, 0));
  const X = i => m.l + (i + 0.5) * iw / 12; const Y = v => m.t + ih - v / ymax * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * ymax);
  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:${W}px;height:${H}px" aria-hidden="true">`;
  svg += ticks.map(t => `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}"/><text class="tick" x="${m.l - 6}" y="${(Y(t) + 3.5).toFixed(1)}" text-anchor="end">${compact(t)}</text>`).join('');
  svg += D.MONTHS.map((mo, i) => (!narrow || i % 2 === 0) ? `<text class="tick" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${narrow ? i + 1 : mo}</text>` : '').join('');
  svg += `<line class="xhair" id="${el.id}-x" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" style="display:none"/>`;
  // 先画往年（灰），后画当年（强调色），当年在最上层
  const ordered = series.slice().sort((a, b) => (a.cur ? 1 : 0) - (b.cur ? 1 : 0) || a.year - b.year);
  const ends = [];
  ordered.forEach(s => {
    let d = '', pen = false, lastI = -1;
    s.vals.forEach((v, i) => { if (!isNum(v) || i === s.partial) { pen = false; return; } d += `${pen ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`; pen = true; lastI = i; });
    svg += `<path class="ln" d="${d}" style="stroke:${s.color}"/>`;
    if (lastI >= 0) { svg += `<circle class="end" cx="${X(lastI).toFixed(1)}" cy="${Y(s.vals[lastI]).toFixed(1)}" r="4" style="fill:${s.color}"/>`; ends.push({ s, i: lastI, y: Y(s.vals[lastI]) }); }
    if (s.partial != null && isNum(s.vals[s.partial])) svg += `<circle class="partial" cx="${X(s.partial).toFixed(1)}" cy="${Y(s.vals[s.partial]).toFixed(1)}" r="4" style="stroke:${s.color}"/>`;
  });
  // 端点标注：只在不相互挤压时标出；挤压时交给图例与提示框
  if (!narrow) {
    const placed = [];
    ends.sort((a, b) => (b.s.cur ? 1 : 0) - (a.s.cur ? 1 : 0) || b.s.year - a.s.year).forEach(e => {
      if (placed.some(p => Math.abs(p - e.y) < 13)) return; placed.push(e.y);
      svg += `<text class="endlab${e.s.cur ? ' cur' : ''}" x="${(X(e.i) + 8).toFixed(1)}" y="${(e.y + 4).toFixed(1)}">${e.s.year}</text>`;
    });
  }
  svg += `<rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}"/></svg>`;
  const legend = `<div class="yoy-legend">${series.slice().sort((a, b) => b.year - a.year).map(s => `<span><i style="background:${s.color}"></i>${s.year}${s.cur ? '（当年）' : ''}</span>`).join('')}${series.some(s => s.partial != null) ? `<span><i class="hollow"></i>${esc(curMonthLabel())}（未完整月）</span>` : ''}</div>`;
  el.innerHTML = legend + `<div class="yoy-plot">${svg}<div class="yoy-tip" hidden></div></div>`;
  const plot = el.querySelector('.yoy-plot'), tip = el.querySelector('.yoy-tip'), xh = el.querySelector(`#${CSS.escape(el.id)}-x`);
  const show = i => {
    if (i == null) { tip.hidden = true; xh.style.display = 'none'; return; }
    xh.setAttribute('x1', X(i)); xh.setAttribute('x2', X(i)); xh.style.display = '';
    tip.textContent = '';
    const h = document.createElement('div'); h.className = 'tt-h'; h.textContent = D.MONTHS[i]; tip.appendChild(h);
    series.slice().sort((a, b) => b.year - a.year).forEach(s => {
      const r = document.createElement('div'); r.className = 'tt-r';
      const k = document.createElement('i'); k.style.background = s.color; r.appendChild(k);
      const v = document.createElement('b'); const val = s.vals[i]; v.textContent = isNum(val) ? fmt(val) : val === 'FU' ? '未发生' : val === 'NP' ? '未提供' : '无数据'; r.appendChild(v);
      const y = document.createElement('span'); y.textContent = `${s.year}${i === s.partial ? ' · ' + curMonthLabel() : ''}`; r.appendChild(y);
      tip.appendChild(r);
    });
    tip.hidden = false;
    const tx = X(i) + 12, tw = tip.offsetWidth; tip.style.left = (tx + tw > W ? X(i) - tw - 12 : tx) + 'px'; tip.style.top = m.t + 'px';
  };
  const idxAt = cx => { const r = plot.getBoundingClientRect(); const px = cx - r.left; const i = Math.floor((px - m.l) / (iw / 12)); return i >= 0 && i < 12 ? i : null; };
  plot.onpointermove = ev => show(idxAt(ev.clientX));
  plot.onpointerleave = () => show(null);
  el.onkeydown = ev => { if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return; ev.preventDefault(); el._i = el._i == null ? 0 : Math.min(11, Math.max(0, el._i + (ev.key === 'ArrowRight' ? 1 : -1))); show(el._i); };
  el.onblur = () => { el._i = null; show(null); };
}
/** 已用 validate_palette.js 校验：浅色 #5e5e63/#86868c/#acacb2（白底），深色 #c4c4c9/#97979d/#727278（#29292c 底） */
const YOY_GRAYS = { light: ['#5e5e63', '#86868c', '#acacb2'], dark: ['#c4c4c9', '#97979d', '#727278'] };
const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
/** 把“年份行”转成逐年折线；仅取有月度字段的年份（仅年总量的年份不入图） */
function yoySeries(yearRows) {
  const rows = yearRows.filter(r => r.type === 'month').sort((a, b) => b.y - a.y);
  const grays = YOY_GRAYS[isDark() ? 'dark' : 'light'];
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--link').trim() || '#007aff';
  let gi = 0;
  return rows.map(r => ({ year: r.y, vals: r.arr, partial: r.cutM ? r.cutM - 1 : null, cur: r.y === D.BASE.y, color: r.y === D.BASE.y ? accent : grays[Math.min(gi++, grays.length - 1)] }));
}

/* —— 月表色阶（可选） —— */
function heatLevel(v, max) { if (!isNum(v) || !max) return 0; return Math.min(5, Math.max(1, Math.ceil(v / max * 5))); }

/* 主题切换或窗口变化时重绘（颜色随主题取值，宽度随容器） */
let chartFrame = 0;
function scheduleCharts() { if (chartFrame) return; chartFrame = requestAnimationFrame(() => { chartFrame = 0; drawCharts(); }); }
function drawChartsThemed() { Object.keys(CHARTS).forEach(id => { const sp = CHARTS[id]; if (!sp.series) return; const grays = YOY_GRAYS[isDark() ? 'dark' : 'light']; const accent = getComputedStyle(document.documentElement).getPropertyValue('--link').trim(); let gi = 0; sp.series.slice().sort((a, b) => b.year - a.year).forEach(s => { s.color = s.cur ? accent : grays[Math.min(gi++, grays.length - 1)]; }); }); drawCharts(); }
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => drawChartsThemed()); } catch (e) { /* 旧浏览器忽略 */ }
