/* 纯虚构演示数据：由固定种子生成，不来自任何真实业务工作簿。
   SKU 统一使用 DEMO- 前缀、ASIN 使用 B0DEMO 前缀，人员为“运营甲/乙/丙/丁”。
   列位置（如 US!BE:BP）只用于“来源定位”提示，取自需求包的字段证据文档。 */
const DEMO = (() => {
  let seed = 20261014;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));
  const pick = arr => arr[Math.floor(rnd() * arr.length)];

  const BASE_DATE = '2026-10-11';          // 数据基准日 / 销量截止日（示例）
  const BASE = { y: 2026, m: 10, d: 11 };
  const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const FISCAL = ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];
  const SEASON = [0.86, 0.8, 0.9, 0.95, 1, 1.02, 1.1, 1.05, 1, 1.06, 1.24, 1.4];
  const YF = { 2022: 0.52, 2023: 0.68, 2024: 0.84, 2025: 1, 2026: 1.12 };
  const OWNERS = ['运营甲', '运营乙', '运营丙', '运营丁'];
  const TRANSFER_WH = ['B2B', 'TEMU', 'TIKTOK', '独立站', '套装辅料'];

  // ——— 国家配置：覆盖差异来自字段证据 ———
  const C = (o) => o;
  const COUNTRIES = [
    C({ code: 'US', name: '美国', ownerField: '销售负责人', tier: 'full', monthYears: [2024, 2025, 2026], annualOnly: [2022, 2023], weeks: true, half: true, fiscal: true, variant: true, domestic: true, awd: true, transitDays: 42, inTotalStock: true,
      src: { id: 'A:J', inv: 'K:T', awd: 'U / AG / AH', transit: 'AI', batch: 'AJ:BA', m2024: 'BE:BP / BQ', m2025: 'BR:CC / CD', m2026: 'CE:CP / CQ', w2024: 'CS:DX', w2025: 'DZ:FY', w2026: 'FZ:HM', avg: 'HN / HO', monthEnd: 'HP:HR', sea: 'HS', plan: 'HT:HW', days: 'HX:IA', grade: 'IC:IE', fiscal: 'IF:IQ', half: 'IR:JK' } }),
    C({ code: 'CA', name: '加拿大', ownerField: '销售负责人', tier: 'full', monthYears: [2024, 2025, 2026], annualOnly: [2022, 2023], weeks: true, half: true, fiscal: true, variant: true, domestic: true, transitDays: 38, inTotalStock: true,
      src: { id: 'A:J', inv: 'K:T', transit: 'U', batch: 'V:AL', m2024: 'AP:BA / BB', m2025: 'BC:BN / BO', m2026: 'BP:CA / CB', w2024: 'CD:DI', w2025: 'DK:FJ', w2026: 'FK:GX', avg: 'GY / GZ', monthEnd: 'HA:HC', sea: 'HD', plan: 'HE:HH', days: 'HI:HL', grade: 'HN:HP', fiscal: 'HQ:IB', half: 'IC:IV' } }),
    C({ code: 'AU', name: '澳大利亚', ownerField: '负责人', tier: 'full', monthYears: [2024, 2025, 2026], annualOnly: [2022, 2023], weeks: true, half: true, fiscal: true, variant: true, domestic: true, transitDays: 35, inTotalStock: true,
      src: { id: 'A:J', inv: 'K:T', transit: 'U', batch: 'V:AH（含“2月整”等非标准标题）', m2024: 'AL:AW / AX', m2025: 'AY:BJ / BK', m2026: 'BL:BW / BX', w2024: 'BZ:DE', w2025: 'DG:FF', w2026: 'FG:GT', avg: 'GU / GV', monthEnd: 'GW:GY', sea: 'GZ', plan: 'HA:HD', days: 'HE:HH', grade: 'HJ:HL', fiscal: 'HM:HX', half: 'HY:IR' } }),
    C({ code: 'UK', name: '英国', ownerField: '所属运营', tier: 'full', monthYears: [2024, 2025, 2026], annualOnly: [2022, 2023], weeks: true, half: true, fiscal: true, variant: true, domestic: true, transitDays: 40, inTotalStock: true,
      src: { id: 'A:J', inv: 'K:T', transit: 'U', batch: 'V:AI', m2024: 'AM:AX / AY', m2025: 'AZ:BK / BL', m2026: 'BM:BX / BY', w2024: 'CA:DF', w2025: 'DH:FG', w2026: 'FH:GU', avg: 'GV / GW', monthEnd: 'GX:GZ', sea: 'HA', plan: 'HB:HE', days: 'HF:HI', grade: 'HK:HM', fiscal: 'HN:HY', half: 'HZ:IS' } }),
    C({ code: 'EU', name: '欧洲', ownerField: '负责人（发货）', tier: 'full', monthYears: [2024, 2025, 2026], annualOnly: [], weeks: true, half: true, fiscal: true, variant: true, domestic: true, transitDays: 40, inTotalStock: true, fbaPool: 'DE',
      src: { id: 'A:J', inv: 'K:T', transit: 'U', batch: 'V:AI', m2024: 'AK:AV / AW', m2025: 'AX:BI / BJ', m2026: 'BK:BV / BW', w2024: 'BY:DC', w2025: 'DE:FD', w2026: 'FE:GR（年份证据：FE2/GR2 引用 US!FZ2/HM2）', avg: 'GS / GT', monthEnd: 'GU:GW', sea: 'GX', plan: 'GY:HB', days: 'HC:HF', grade: 'HH:HJ', fiscal: 'HK:HV', half: 'HW:IP' } }),
    C({ code: 'AE', name: '阿联酋', ownerField: '销售负责人', tier: 'ae', monthYears: [2025, 2026], annualOnly: [], weeks: false, half: false, fiscal: false, variant: false, domestic: true, inTotalStock: false, stocking: true,
      src: { id: 'A:F', inv: 'G/H', aging: 'J:M', stocking: 'I 备货数量', transit: 'N', batch: 'O:P', domestic: 'Q', m2025: 'R:AC / AD', m2026: 'AE:AP / AQ' } }),
    C({ code: 'SA', name: '沙特', ownerField: '销售负责人', tier: 'sa', monthYears: [2025], annualOnly: [2026], saMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9], weeks: false, half: false, fiscal: false, variant: false, domestic: false, inTotalStock: false,
      src: { id: 'A:F', inv: 'G/H', aging: 'I:L', transit: 'M', batch: 'N', m2025: 'P:X（2025-JAN 至 SEP，无 OCT—DEC 列）', annual: 'Y（2025）/ Z（2026）' } }),
  ];
  const CMAP = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));
  const FIVE = ['US', 'CA', 'AU', 'UK', 'EU'];

  // ——— 商品（纯虚构） ———
  // [sku, 品名, 装率, 等级, 尺寸分段, 标签, 变体组, 国家, 月销基数]
  const P_RAW = [
    ['DEMO-ACR-24', '示例·丙烯颜料 24色 60ml', 48, 'A', '标准-小', '常规', 'G-ACR', 'US CA AU UK EU AE SA', 620],
    ['DEMO-ACR-12', '示例·丙烯颜料 12色 60ml', 48, 'A', '标准-小', '常规', 'G-ACR', 'US CA UK EU AE', 410],
    ['DEMO-ACR-48', '示例·丙烯颜料 48色 22ml', 36, 'B', '标准-小', '常规', 'G-ACR', 'US CA UK EU', 260],
    ['DEMO-PAD-16K', '示例·水彩本 16K 粗纹', 10, 'A', '标准-大', '季节性', 'G-PAD', 'US CA AU UK EU', 330],
    ['DEMO-PAD-32K', '示例·水彩本 32K 粗纹', 10, 'B', '标准-大', '季节性', 'G-PAD', 'US AU UK EU', 210],
    ['DEMO-BRS-10', '示例·尼龙画笔 10支', 60, 'B', '标准-小', '常规', 'G-BRS', 'US CA AU UK EU AE', 290],
    ['DEMO-BRS-20', '示例·尼龙画笔 20支', 40, 'C', '标准-小', '常规', 'G-BRS', 'US AU UK', 120],
    ['DEMO-BAG-A2', '示例·软边作品袋 A2', 12, 'A', '大件', '常规', null, 'US CA AU UK EU SA', 380],
    ['DEMO-OIL-24', '示例·油画颜料 22ml 24色', 16, 'A', '标准-大', '常规', null, 'US CA UK EU AE', 450],
    ['DEMO-EAS-FOLD', '示例·折叠画架', 20, 'B', '标准-大', '常规', null, 'US CA AU EU', 240],
    ['DEMO-SKB-A4', '示例·素描本 A4', 50, 'B', '标准-小', '常规', null, 'US UK EU AE SA', 300],
    ['DEMO-PAL-WOOD', '示例·木质调色板', 100, 'C', '标准-小', '清货', null, 'US CA AU', 90],
    ['DEMO-CNV-3040', '示例·画布板 30×40cm', 24, 'B', '标准-大', '常规', null, 'US CA AU UK EU', 200],
    ['DEMO-MKR-60', '示例·酒精马克笔 60色', 80, 'A', '标准-小', '常规', null, 'US CA AU UK EU AE SA', 520],
    ['DEMO-CLY-KID', '示例·儿童超轻黏土', 30, 'B', '标准-小', '新品', null, 'US UK EU', 140],
    ['DEMO-WC-36', '示例·固体水彩 36色', 72, 'A', '标准-小', '常规', null, 'US CA AU UK EU AE', 360],
    ['DEMO-TAPE-MSK', '示例·美纹纸胶带', 40, 'C', '标准-小', '常规', null, 'US CA UK', 110],
    ['DEMO-PCL-72', '示例·油性彩铅 72色', 120, 'A', '标准-小', '常规', null, 'US CA AU UK EU SA', 480],
    ['DEMO-EAS-XL', '示例·落地画架 大号', null, 'B', '大件', '常规', null, 'US CA EU', 170],
    ['DEMO-DRY-RACK', '示例·画作晾干架', 8, 'C', '大件', '季节性', null, 'US AU UK', 95],
    ['DEMO-KNF-5', '示例·油画刮刀 5件套', 24, '新品', '标准-小', '新品', null, 'US CA UK EU AE SA', 160],
    ['DEMO-GES-1L', '示例·石膏底料 1L', 100, 'C', '标准-小', '季节性', null, 'US CA AU UK EU', 130],
  ];

  const PRODUCTS = [];
  const LISTINGS = [];
  const rowCounter = {};

  const monthSeries = (L, y, opts = {}) => MONTHS.map((_, i) => {
    if (y === BASE.y && i + 1 > BASE.m) return 'FU';
    let v = Math.round(L * SEASON[i] * YF[y] * (0.84 + rnd() * 0.32));
    if (y === BASE.y && i + 1 === BASE.m) v = Math.round(v * BASE.d / 31);
    return v;
  });

  const isoWeekStart = (y, w) => { const d = new Date(Date.UTC(y, 0, 4)); const dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow + (w - 1) * 7); return d; };
  const iso = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
  // 源表周区：2024 年不从 WK1 开始；2026 截至最新完整周 W41（10/05–10/11）
  const WEEK_BLOCKS = [{ srcYear: 2024, from: 21, to: 52 }, { srcYear: 2025, from: 1, to: 52 }, { srcYear: 2026, from: 1, to: 41 }];
  const WEEKS = [];
  WEEK_BLOCKS.forEach(b => { for (let w = b.from; w <= b.to; w++) { const s = isoWeekStart(b.srcYear, w); const e = addDays(s, 6); WEEKS.push({ key: `${b.srcYear}-W${String(w).padStart(2, '0')}`, isoYear: b.srcYear, week: w, start: iso(s), end: iso(e), srcYear: b.srcYear, crossYear: iso(s).slice(0, 4) !== iso(e).slice(0, 4) || iso(s).slice(0, 4) !== String(b.srcYear), latest: b.srcYear === 2026 && w === 41 }); } });

  // 半月计划 20 期：2026-07 上 至 2027-04 下
  const HALF = [];
  for (let k = 0; k < 10; k++) { const m0 = 6 + k; const y = 2026 + Math.floor(m0 / 12); const m = (m0 % 12) + 1; ['上', '下'].forEach(h => HALF.push({ key: `${y}-${String(m).padStart(2, '0')}${h}`, y, m, h, label: `${String(y).slice(2)}年${m}月${h}`, start: `${y}-${String(m).padStart(2, '0')}-${h === '上' ? '01' : '16'}` })); }
  // 总销量 EG:EU 另 15 期保存预测（至 2027-02 上）
  const HALF15 = HALF.slice(0, 15);

  P_RAW.forEach((r, pi) => {
    const [sku, name, pack, grade, size, label, group, cs, L] = r;
    const pid = `P-${String(pi + 1).padStart(3, '0')}`;
    const countries = cs.split(' ');
    const tL = L * countries.length * 0.55;
    const total = { monthly: {}, annual: {} };
    [2023, 2024, 2025, 2026].forEach(y => { total.monthly[y] = monthSeries(tL, y); total.annual[y] = total.monthly[y].reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0); });
    const amz = ri(0, 1) ? ri(200, 2600) : ri(0, 300);
    const p = {
      pid, sku, name, packRate: pack, grade, size, label, group, countries,
      totalOwner: pick(OWNERS),
      total,
      domestic: { avail: amz, pending: ri(0, 1) ? ri(100, 1500) : 0, transfer: Object.fromEntries(TRANSFER_WH.map(w => [w, ri(0, 3) ? ri(0, 180) : 0])) },
      domesticAging: { lt90: ri(0, amz), d90_180: ri(0, 200), gt180: ri(0, 120) },
      cost: null, // 原表采购价/成本仅回查，演示不提供
      invValue: ri(8, 80) * 1000, agingValue: ri(0, 12) * 500,
      weight: [1, 1.1, 0.9, 1.2][pi % 4], turnover: ri(35, 160),
      srcRowTotal: pi + 3,
    };
    if (sku === 'DEMO-BAG-A2') p.domestic.avail = 0; // 国内现货真实0
    const mth = p.total.monthly[2026];
    p.avg3 = Math.round(((mth[6] + mth[7] + mth[8]) / 3) * p.weight);
    p.netGap = HALF.map(() => ri(-400, 900));              // CR:DK 采购关联区：仅回查
    p.saved15 = HALF15.map(() => ri(0, 1) ? ri(50, 600) : null); // EG:EU
    PRODUCTS.push(p);

    countries.forEach(cc => {
      const cfg = CMAP[cc];
      const nList = (sku === 'DEMO-ACR-24' && cc === 'US') || (sku === 'DEMO-PAD-16K' && cc === 'UK') ? 2 : 1;
      for (let li = 0; li < nList; li++) {
        rowCounter[cc] = (rowCounter[cc] || 0) + 1;
        const lid = `L-${cc}-${String(rowCounter[cc]).padStart(3, '0')}`;
        const cL = Math.max(8, Math.round(L * { US: 1, CA: 0.35, AU: 0.3, UK: 0.45, EU: 0.55, AE: 0.15, SA: 0.12 }[cc] * (li ? 0.45 : 1)));
        const owner = (() => {
          if (sku === 'DEMO-ACR-24' && cc === 'US') return li ? '运营乙' : '运营甲';
          if (sku === 'DEMO-GES-1L' && (cc === 'CA' || cc === 'UK')) return null;
          if (sku === 'DEMO-KNF-5' && cc === 'SA') return null;
          if (sku === 'DEMO-CLY-KID' && cc === 'EU') return null;
          return OWNERS[(pi + FIVE.indexOf(cc) + 4 + (cc === 'AE' ? 2 : 0) + (cc === 'SA' ? 3 : 0)) % 4];
        })();
        const asin = `B0DEMO${String(1000 + pi * 3 + li).padStart(4, '0')}`;
        const short = sku.replace('DEMO-', '').replace(/-/g, '');
        const l = {
          lid, pid, country: cc, sku, asin, msku: `${cc}-${short}${li ? '-B' : ''}-FBA`, owner, srcRow: rowCounter[cc] + 2,
          monthly: {}, annual: {}, monthStatus: {},
        };
        // —— 月历史（按国家实际覆盖） ——
        cfg.monthYears.forEach(y => {
          let arr = monthSeries(cL, y);
          if (cc === 'SA') arr = arr.map((v, i) => cfg.saMonths.includes(i + 1) ? v : 'NF');
          l.monthly[y] = arr;
          l.annual[y] = arr.reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
        });
        cfg.annualOnly.forEach(y => { l.annual[y] = Math.round(cL * 12 * YF[y] * (0.9 + rnd() * 0.2)); });
        if (cc === 'SA') { l.annual[2025] = l.annual[2025] + ri(30, 160); } // 年度源字段含未列月份，不拆分
        // —— 周历史 ——
        if (cfg.weeks) l.weekly = WEEKS.map(w => { const m = Number(w.start.slice(5, 7)) - 1; return Math.round(cL / 4.35 * SEASON[m] * YF[w.isoYear] * (0.8 + rnd() * 0.4)); });
        // —— 库存 ——
        l.fba = Math.round(cL * (0.8 + rnd() * 2.8));
        l.aging = { lt180: Math.round(l.fba * 0.7), m180_365: Math.round(l.fba * 0.22), gt365: l.fba - Math.round(l.fba * 0.7) - Math.round(l.fba * 0.22) };
        l.value180 = (l.aging.m180_365 + l.aging.gt365) * ri(4, 11);
        if (cfg.half) {
          l.weight = [1, 1.1, 0.9, 1.05][ri(0, 3)];
          const last4 = l.weekly.slice(-4).reduce((a, b) => a + b, 0) / 4;
          l.avg4 = Math.round(last4 * l.weight);
          l.seaEnd = Math.max(0, Math.round(l.fba + cL * 0.6 - (l.avg4 / 7) * cfg.transitDays));
          l.monthEnd = [0, 1, 2].map(k => Math.max(0, l.fba - Math.round(cL * (k + 1) * 0.9)));
          l.monthEndDays = [0, 1, 2].map(k => l.avg4 ? Math.round(l.monthEnd[k] / (l.avg4 / 7)) : null);
          l.daysNow = l.avg4 ? Math.round(l.fba / (l.avg4 / 7)) : null;
          l.daysTotal = l.avg4 ? Math.round((l.fba + cL) / (l.avg4 / 7)) : null;
          l.suggest = ri(0, 2) ? `示例建议 ${Math.round(cL * 0.8 / 10) * 10}` : '';
          l.domesticEnough = ri(0, 3) ? '是' : '否';
          l.half = HALF.map((h, k) => k < 2 ? Math.round(cL / 2 * (0.9 + rnd() * 0.2)) : (rnd() < 0.08 ? null : Math.round(cL / 2 * SEASON[h.m - 1] * YF[2026] * (0.85 + rnd() * 0.3))));
          l.fiscal = FISCAL.map((_, k) => Math.round(cL * SEASON[(k + 3) % 12] * 1.15 / 10) * 10);
        }
        if (cc === 'US') { l.awd = { available: ri(0, 400), reserved: ri(0, 80), outbound: ri(0, 120) }; l.overseas = ri(0, 1) ? ri(20, 300) : 0; l.awdOverseasSrc = l.awd.available + l.awd.reserved + l.awd.outbound + l.overseas; }
        if (cc === 'AE') l.stocking = ri(0, 1) ? ri(1, 4) * 20 : null;
        l.grade = grade; l.labels = [label];
        LISTINGS.push(l);
      }
    });
  });

  const byId = Object.fromEntries(LISTINGS.map(l => [l.lid, l]));
  const pById = Object.fromEntries(PRODUCTS.map(p => [p.pid, p]));
  const findL = (sku, cc, i = 0) => LISTINGS.filter(l => l.sku === sku && l.country === cc)[i];

  // ——— 指定异常与边界案例（演示用） ———
  const ISSUES = []; // {id, lid|pid, module, level, title, detail, source}
  const issue = (o) => { o.id = `ISS-${String(ISSUES.length + 1).padStart(3, '0')}`; ISSUES.push(o); };
  // 1) 缺报月份（不是0）
  { const l = findL('DEMO-OIL-24', 'US'); l.monthly[2025][2] = 'NP'; l.annual[2025] += 0; l.annualSrcDiff = { year: 2025 }; l.annual[2025] = l.monthly[2025].reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0) + 37;
    issue({ lid: l.lid, module: '月历史', level: 'review', title: '2025年3月缺报；年度源值与月合计相差 37', detail: '年度字段为源表原值，月份缺报显示“未提供”，不补0、不反推。', source: 'US!BR:CC / CD' }); }
  // 2) AU LED 组：真实0销量 → 零分母
  ['DEMO-BRS-10', 'DEMO-BRS-20'].forEach(s => { const l = findL(s, 'AU'); l.monthly[2025] = l.monthly[2025].map(() => 0); l.annual[2025] = 0; l.weekly = l.weekly.map((v, i) => WEEKS[i].isoYear === 2025 || (WEEKS[i].isoYear === 2026 && WEEKS[i].week > 30) ? 0 : v); l.avg4 = 0; l.daysNow = null; l.daysTotal = null; l.monthEndDays = [null, null, null]; });
  // 3) 漏周：无完整来源，不补
  { const l = findL('DEMO-PCL-72', 'CA'); const k = WEEKS.findIndex(w => w.key === '2025-W33'); l.weekly[k] = 'NP';
    issue({ lid: l.lid, module: '周历史', level: 'review', title: '2025-W33 遗漏周，无完整来源未补齐', detail: '只有完整周来源才能补；已有非空历史周、真实0、含公式历史周不当缺口。', source: 'CA!DK:FJ' }); }
  // 4) 海外仓小计与组成不一致（模板检查）
  { const l = findL('DEMO-EAS-FOLD', 'US'); l.awdOverseasSrc += 25;
    issue({ lid: l.lid, module: '库存', level: 'review', title: 'US U列“AWD&海外仓总数量”比 AG+AH 多 25', detail: '模板检查发现小计差异，仅展示待核对，不改源值追平。', source: 'US!U / AG / AH' }); }
  // 5) 国内字段空白
  { const l = findL('DEMO-KNF-5', 'AE'); l.domesticBlank = true;
    issue({ lid: l.lid, module: '国内库存', level: 'review', title: 'AE Q列国内库存为空白', detail: '空白不是0；共享国内库存池在SKU详情仍可查，本行显示待核对。', source: 'AE!Q' }); }
  // 6) 变体：手工比例 / 组外引用 / 上游错误 / 零分母
  const variantSpecial = {};
  ['DEMO-PAD-16K', 'DEMO-PAD-32K'].forEach((s, i) => { variantSpecial[findL(s, 'EU').lid] = { kind: 'manual', ratio: i ? 0.4 : 0.6 }; });
  variantSpecial[findL('DEMO-ACR-48', 'UK').lid] = { kind: 'outgroup' };
  variantSpecial[findL('DEMO-ACR-12', 'CA').lid] = { kind: 'referr' };
  ['DEMO-BRS-10', 'DEMO-BRS-20'].forEach(s => { variantSpecial[findL(s, 'AU').lid] = { kind: 'zeroden' }; });
  issue({ lid: findL('DEMO-BRS-10', 'AU').lid, module: '变体比例', level: 'review', title: 'AU G-BRS 组年销量合计为0（零分母）', detail: '组内真实0销量；不均分、不填0掩盖，标待核对。', source: 'AU!G' });
  issue({ lid: findL('DEMO-ACR-48', 'UK').lid, module: '变体比例', level: 'review', title: 'UK 变体比例分子引用组外行', detail: '原公式引用了组外行，按待核对展示，不自动重组分组。', source: 'UK!G' });
  issue({ lid: findL('DEMO-ACR-12', 'CA').lid, module: '变体比例', level: 'error', title: 'CA 变体比例上游 #REF!', detail: '上游错误值不当作0或未知数参与计算。', source: 'CA!G' });
  // 7) 缺装率
  issue({ pid: pById['P-019'].pid, module: '发货计划', level: 'review', title: 'DEMO-EAS-XL 缺装率', detail: '箱数无法计算，显示“缺装率”；不按品名猜包装。', source: '箱规!B/L' });

  // 变体比例计算（国家层：按原分组；演示引用2025年合计）
  LISTINGS.forEach(l => {
    const cfg = CMAP[l.country];
    if (!cfg.variant) { l.variant = { kind: 'na' }; return; }
    const sp = variantSpecial[l.lid];
    const p = pById[l.pid];
    if (sp && sp.kind === 'manual') { l.variant = { kind: 'manual', ratio: sp.ratio, group: p.group }; return; }
    if (sp) { l.variant = { kind: sp.kind, group: p.group }; return; }
    if (!p.group) { l.variant = { kind: 'standalone', ratio: 1 }; return; }
    const members = LISTINGS.filter(x => x.country === l.country && pById[x.pid].group === p.group);
    const den = members.reduce((a, x) => a + (x.annual[2025] || 0), 0);
    l.variant = { kind: 'formula', group: p.group, num: l.annual[2025], den, ratio: den ? l.annual[2025] / den : null, members: members.map(x => x.lid) };
  });
  // 总销量层变体比例 K（按原分组；演示引用2025年合计）
  PRODUCTS.forEach(p => {
    if (!p.group) { p.variant = { kind: 'standalone', ratio: 1 }; return; }
    const mem = PRODUCTS.filter(x => x.group === p.group);
    const den = mem.reduce((a, x) => a + x.total.annual[2025], 0);
    p.variant = { kind: 'formula', group: p.group, num: p.total.annual[2025], den, ratio: den ? p.total.annual[2025] / den : null };
  });

  // ——— 国内库存原始明细（含非业务部门，统计只纳入亚马逊二部） ———
  const DOMESTIC_RAW = [];
  PRODUCTS.forEach(p => {
    DOMESTIC_RAW.push({ sku: p.sku, dept: '亚马逊二部', wh: '亚马逊仓', avail: p.domestic.avail, pending: p.domestic.pending });
    TRANSFER_WH.forEach(w => { if (p.domestic.transfer[w]) DOMESTIC_RAW.push({ sku: p.sku, dept: '亚马逊二部', wh: w, avail: p.domestic.transfer[w], pending: 0 }); });
    if (ri(0, 2) === 0) DOMESTIC_RAW.push({ sku: p.sku, dept: '国内电商部', wh: '亚马逊仓', avail: ri(10, 400), pending: ri(0, 100) });
    if (ri(0, 3) === 0) DOMESTIC_RAW.push({ sku: p.sku, dept: '亚马逊二部', wh: '退货暂存仓', avail: ri(1, 40), pending: 0 });
  });

  // ——— FBA ERP 导出原始明细（EU 共享池在多个站点重复出现） ———
  const FBA_RAW = [];
  LISTINGS.forEach(l => {
    if (l.country === 'EU') ['DE', 'FR', 'IT', 'ES'].forEach(site => FBA_RAW.push({ lid: l.lid, site, physical: 'EU 共享池', msku: l.msku, asin: l.asin, fbaAvail: l.fba, used: site === 'DE' }));
    else FBA_RAW.push({ lid: l.lid, site: l.country, physical: l.country, msku: l.msku, asin: l.asin, fbaAvail: l.fba, used: true });
  });
  // 库龄：同 ASIN 重复 MSKU 行按最大值
  const AGING_RAW = [];
  { const l = findL('DEMO-MKR-60', 'US');
    AGING_RAW.push({ lid: l.lid, asin: l.asin, msku: l.msku, lt180: l.aging.lt180, m180_365: l.aging.m180_365, gt365: l.aging.gt365 });
    AGING_RAW.push({ lid: l.lid, asin: l.asin, msku: 'US-MKR60-OLD', lt180: Math.round(l.aging.lt180 * 0.6), m180_365: l.aging.m180_365, gt365: Math.max(0, l.aging.gt365 - 3) }); }

  // ——— 发货批次（业务批次日人工指定，含多货件） ———
  const BATCHES = [];
  let shipSeq = 0;
  const mkBatch = (cc, bizDate, status, opts = {}) => {
    const lst = LISTINGS.filter(l => l.country === cc);
    const take = opts.lids ? opts.lids.map(x => byId[x]) : lst.filter((_, i) => (i + bizDate.length + Number(bizDate.slice(8))) % (opts.every || 3) === 0).slice(0, opts.max || 8);
    const ships = (opts.ships || [bizDate]).map(cd => ({ shipId: `FBA-DEMO-${cc}${String(++shipSeq).padStart(4, '0')}`, created: cd, shipped: ['shipped', 'receiving', 'closed'].includes(status) ? iso(addDays(new Date(cd + 'T00:00:00Z'), 2)) : null }));
    const b = { bid: `B-${cc}-${bizDate}`, country: cc, bizDate, label: `${bizDate.slice(5, 7)}${bizDate.slice(8)}${opts.sy ? ' SY' : ''}`, kind: opts.sy ? 'SY' : 'FBA', status, ships, evidence: opts.evidence !== false, note: opts.note || '', lines: [] };
    take.forEach((l, i) => {
      const declared = Math.max(12, Math.round(l.fba * (0.3 + rnd() * 0.5) / 4) * 4);
      const line = { lid: l.lid, shipId: ships[i % ships.length].shipId, declared, received: null, diffField: '接收差异', diffRaw: null, srcRow: 2 + i };
      if (status === 'closed') { line.received = declared; line.diffRaw = 0; }
      if (status === 'receiving') { const r = ri(0, 3); line.received = r === 0 ? declared : (r === 1 ? declared - ri(1, 6) : (r === 2 ? declared + ri(1, 4) : null)); line.diffRaw = line.received == null ? null : declared - line.received; }
      b.lines.push(line);
    });
    BATCHES.push(b);
    return b;
  };
  // US
  const usB1 = mkBatch('US', '2026-07-20', 'closed', { ships: ['2026-07-16', '2026-07-18'] });
  usB1.lines[0].declared = 100; usB1.lines[0].received = 96; usB1.lines[0].diffRaw = 4;
  usB1.lines[1].declared = 100; usB1.lines[1].received = 104; usB1.lines[1].diffRaw = -4;
  usB1.lines[2].declared = 100; usB1.lines[2].received = 100; usB1.lines[2].diffRaw = 0;
  mkBatch('US', '2026-08-15', 'receiving', { ships: ['2026-08-10', '2026-08-12', '2026-08-14'] });
  mkBatch('US', '2026-09-15', 'shipped', { ships: ['2026-09-10', '2026-09-11', '2026-09-14'], note: '9/10–9/14 创建的货件统一归属 0915 批次（人工指定）' });
  mkBatch('US', '2026-09-28', 'shipped', { every: 4, sy: true, note: '列标题带 SY：海外仓批次（与 FBA 批次区分，是否计入 FBA 在途待确认）' });
  mkBatch('US', '2026-10-08', 'created', { every: 5, note: '新建货件按申报量导入，尚未 SHIPPED' });
  // CA
  const caB1 = mkBatch('CA', '2026-08-02', 'receiving', { every: 2 });
  caB1.lines[0].declared = 72; caB1.lines[0].received = null; caB1.lines[0].diffField = '收发差异'; caB1.lines[0].diffRaw = 2; caB1.lines[0].receivedFromErp = 74;
  caB1.lines[1].received = null; caB1.lines[1].diffRaw = 0; caB1.lines[1].writtenOff = true;
  mkBatch('CA', '2026-09-06', 'shipped', { every: 3 });
  mkBatch('CA', '2026-10-01', 'created', { every: 4 });
  // AU
  mkBatch('AU', '2026-07-28', 'closed', { every: 3 });
  mkBatch('AU', '2026-09-12', 'receiving', { every: 2 });
  mkBatch('AU', '2026-10-05', 'shipped', { every: 3 });
  // UK
  mkBatch('UK', '2026-08-20', 'receiving', { every: 2 });
  mkBatch('UK', '2026-09-24', 'shipped', { every: 3, sy: true, note: '列标题带 SY：海外仓批次' });
  // EU
  mkBatch('EU', '2026-08-09', 'receiving', { every: 2 });
  mkBatch('EU', '2026-09-03', 'shipped', { every: 3, evidence: false, note: '只有日期表头，无本国原发货依据：本次接收快照对该批跳过' });
  mkBatch('EU', '2026-09-30', 'shipped', { every: 3 });
  // AE / SA
  mkBatch('AE', '2026-08-25', 'receiving', { every: 1, max: 4 });
  mkBatch('AE', '2026-09-26', 'shipped', { every: 2 });
  mkBatch('SA', '2026-09-01', 'shipped', { every: 1, max: 4 });

  // 每行当前值：未开始接收=原申报；接收后=带符号差异（少收正、多收负；ERP收发差异反号）
  BATCHES.forEach(b => b.lines.forEach(ln => {
    if (ln.writtenOff) { ln.current = 0; return; }
    if (ln.diffField === '收发差异' && ln.diffRaw != null) { ln.current = -ln.diffRaw; ln.received = ln.received ?? ln.receivedFromErp; return; }
    ln.current = ln.diffRaw == null ? ln.declared : ln.diffRaw;
  }));
  const TRANSIT_SEL = {
    US: ['B-US-2026-08-15', 'B-US-2026-09-15', 'B-US-2026-09-28', 'B-US-2026-10-08'],
    CA: ['B-CA-2026-08-02', 'B-CA-2026-09-06'],
    AU: ['B-AU-2026-09-12', 'B-AU-2026-10-05'],
    UK: ['B-UK-2026-08-20', 'B-UK-2026-09-24'],
    EU: ['B-EU-2026-08-09', 'B-EU-2026-09-03', 'B-EU-2026-09-30'],
    AE: ['B-AE-2026-08-25', 'B-AE-2026-09-26'],
    SA: null, // 本次未上传货件：保留原范围
  };
  issue({ lid: null, country: 'EU', module: '批次接收', level: 'skip', title: 'EU 0903 批次无原发货依据，接收快照整批跳过', detail: '只有日期标题不足以核销；不用其他国家记录证明本国归属。', source: '货件详情 · EU' });
  issue({ lid: null, country: 'UK', module: '批次接收', level: 'isolated', title: 'UK 接收快照含未知SKU（DEMO-XXX-UNK）1行，已隔离', detail: '无法唯一匹配，不并入任何商品；同批其他SKU正常更新。', source: '货件详情 · UK 第14行' });
  issue({ lid: null, country: 'CA', module: '批次接收', level: 'skip', title: 'CA 0802 批次存在两份接收快照（数量不同）', detail: '同一国家/同一批次多份快照不相加；冲突全部跳过并保持旧值。', source: '货件详情_a.xlsx / 货件详情_b.xlsx' });
  issue({ lid: null, country: 'US', module: '批次接收', level: 'isolated', title: 'US 正负差异无法归属：+3 与 −3 未抵消', detail: '隔离项保留各自符号，不相抵掩盖归属问题。', source: '货件详情 · US 第22/23行' });

  // ——— 发货计划初始值（演示） ———
  const PLANS = {};
  LISTINGS.forEach((l, i) => {
    const cfg = CMAP[l.country];
    if (!cfg.half && !cfg.stocking) return;
    const p = pById[l.pid];
    let qty = null;
    if (cfg.stocking) qty = l.stocking;
    else if (i % 3 === 0) qty = (p.packRate || 10) * ri(1, 6);
    PLANS[l.lid] = { planId: `PL-${l.lid.slice(2)}`, qty, note: i % 7 === 0 ? '示例备注：跟随0915批次' : '', status: qty ? (i % 5 === 0 ? 'confirmed' : 'draft') : 'draft', version: 1, editedBy: qty ? pick(OWNERS) : null, updatedAt: '2026-10-12 16:20' };
  });

  // ——— 数据来源更新状态（逐模块） ———
  const FRESHNESS = [
    { key: 'sales', label: '销量', date: '2026-10-11', mode: '连续报表确认', state: 'updated' },
    { key: 'fba', label: 'FBA库存', date: '2026-10-11', state: 'updated' },
    { key: 'domestic', label: '国内库存', date: '2026-10-11', state: 'updated' },
    { key: 'awd', label: 'US AWD', date: '2026-10-04', state: 'stale', note: '本次未提供AWD文件，沿用 10/04 旧周期' },
    { key: 'ship', label: '货件/批次', date: '2026-10-12', state: 'updated', note: 'SA 未上传货件，保留原范围' },
    { key: 'aging', label: '库龄', date: '2026-10-11', state: 'updated' },
  ];

  const SHEETS = [
    ['US', '国家进销存 · 美国', 'country:US', '有US专属AWD/海外仓；保留原公式来源'],
    ['CA', '国家进销存 · 加拿大', 'country:CA', '字段与参数按本国原表，不套用US列位置'],
    ['AU', '国家进销存 · 澳大利亚', 'country:AU', '运营字段名“负责人”；批次含“2月整”等非标准标题'],
    ['UK', '国家进销存 · 英国', 'country:UK', '运营字段名“所属运营”'],
    ['EU', '国家进销存 · 欧洲', 'country:EU', 'FBA共享池取DE；“负责人（发货）”角色保留'],
    ['AE', '国家进销存 · 阿联酋', 'country:AE', '2025/2026月年历史、备货数量；无周/运输期/变体/半月区'],
    ['SA', '国家进销存 · 沙特', 'country:SA', '部分2025月份+2025/2026年总量；无国内库存字段'],
    ['总销量', '总销量', 'total', '2023—2026月年历史、AVG/权重、库转、货值库龄、20/20/15期右侧区块；覆盖国家待逐公式核验'],
    ['总库存', '库存汇总 · 原总库存', 'stock:total', '原口径五国FBA+在途，US AWD另列；不是七国全量'],
    ['FBA库存数', '库存汇总 · FBA与ERP导出', 'stock:fba', '辅助来源；源“FBA可用库存”映射原“FBA可售库存”'],
    ['库龄', '库存汇总 · 库龄', 'stock:aging', '同Listing/ASIN重复MSKU按最大值，不叠加'],
    ['国内库存', '库存汇总 · 国内库存', 'stock:domestic', '原始全量保留；业务统计仅“亚马逊二部”；5个可调拨仓'],
    ['FBA库存--ERP导出', '库存汇总 · FBA与ERP导出', 'stock:fba', '原始明细，物理国家与业务国家区分'],
    ['Craft&Fresh', '原表回查（角色待确认）', 'coverage', '仅确认工作表存在；业务角色待确认，不删除、不猜映射'],
    ['箱规', '商品资料 · 装率来源', 'country:US:info', '国家装率按箱规B/L查找；箱数依赖装率'],
    ['Sheet1', '原表回查（角色待确认）', 'coverage', '仅确认工作表存在；业务角色待确认，不当无用表删除'],
  ];

  return { BASE_DATE, BASE, MONTHS, FISCAL, OWNERS, TRANSFER_WH, COUNTRIES, CMAP, FIVE, PRODUCTS, LISTINGS, byId, pById, WEEKS, HALF, HALF15, ISSUES, DOMESTIC_RAW, FBA_RAW, AGING_RAW, BATCHES, TRANSIT_SEL, PLANS, FRESHNESS, SHEETS };
})();
