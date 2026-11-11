
/* ---------- 结构示意图（通用，不是实拍图） ----------
   fig({k:"pens", n, ink:"black"|"rainbow"|"custom", cols:[颜色，写 "ink" 表示跟随主题的黑色], tips:[标签], pack:"blister"|"pouch"|"wallet"|"box"})
   其他 k：refill / brush / dual / kit / spring / erase / pad / multi / book / block / cards / accordion / workbook / bookkit / pans / tubes / cups / bottles / droppers / easel / sticks
   stand：画架、画箱、画柜，用 v 指定结构（aframe / hframe / crank / flat / tripod / wc / pochade / french / kit / cn / tablebox / tableh / tablea / tablemetal / board / kids / kidstable / display / displaywood / mini / artbox / toolbox / taboret / flatfile / rack / dryrack / easelcab / roll）
   pants：裤装，v 指定版型（skinny / straight / wide / flare / jogger / bootcut），waist（elastic 宽松紧 / draw 抽绳 / button 扣 + 拉链 / panel 孕妇托腹），
         fly（zip 真门襟 / faux 假门襟 / none），pk（real 真口袋 / faux 假口袋 / none），wash（dark / mid / light / black / print），rib 罗纹裤脚，kid 童装比例，fleece 加绒
   新品类需要新图形时，在这里加一个 k 分支即可。 */
const HUES = ["#d6453d","#e8892b","#e6c229","#5bab4a","#2a9d8f","#2f78c4","#5a4fcf","#a855b5","#d9579b","#8b5a2b","#6b7280","#1f8a70"];
function fig(spec){
  const W=240,H=150; let s="";
  const lab=(x,y,t,size=8,anchor="middle")=>`<text x="${x}" y="${y}" class="sv-lab" font-size="${size}" text-anchor="${anchor}">${t}</text>`;
  const capFill=(i)=>{ if(spec.ink==="black") return ' class="sv-ink"'; const c=(spec.cols||HUES)[i%(spec.cols||HUES).length]; return c==="ink" ? ' class="sv-ink"' : ` fill="${c}"`; };
  const pen=(cx,top,pw,i,t,opts={})=>{
    const capH=opts.capH||26, bodyH=opts.bodyH||62, tipH=10, y0=top+capH+bodyH; let p="";
    p+=`<rect x="${cx-pw/2}" y="${top}" width="${pw}" height="${capH}" rx="2"${capFill(i)}/>`;
    p+=`<rect x="${cx-pw/2}" y="${top+capH}" width="${pw}" height="${bodyH}" rx="1" class="sv-body"/>`;
    if(t==="BR"||t==="B") p+=`<path d="M${cx-pw/2+1} ${y0} Q${cx} ${y0+tipH+6} ${cx+pw/2-1} ${y0}" class="sv-ink"/>`;
    else if(t==="CH") p+=`<path d="M${cx-pw/2+1} ${y0} L${cx+pw/2-1} ${y0} L${cx-pw/2+1} ${y0+tipH}Z" class="sv-ink"/>`;
    else { const v=parseFloat(t)||0.3, tw=Math.max(1.4,Math.min(pw*0.5,(String(t).length===3&&String(t)[0]==="0"&&!String(t).includes(".")?v*10:v*4))); p+=`<path d="M${cx-pw/2+1} ${y0} L${cx-tw/2} ${y0+tipH} L${cx+tw/2} ${y0+tipH} L${cx+pw/2-1} ${y0}Z" class="sv-ink"/>`; }
    return p;
  };
  if(spec.k==="pens"){
    const n=spec.n, pad=14, avail=W-2*pad-16, step=avail/n, pw=Math.min(14,step*0.62);
    if(spec.pack==="blister"){ s+=`<rect x="6" y="6" width="${W-12}" height="${H-12}" rx="6" class="sv-paper"/><rect x="6" y="6" width="${W-12}" height="16" rx="6" class="sv-soft"/>`+lab(W/2,17,"吸塑卡",8); }
    else if(spec.pack==="pouch"){ s+=`<rect x="6" y="10" width="${W-12}" height="${H-16}" rx="14" class="sv-paper"/><path d="M20 20 H${W-20}" class="sv-line" stroke-dasharray="3 2"/>`+lab(W-24,17,"笔袋",8,"end"); }
    else if(spec.pack==="wallet"){ s+=`<rect x="6" y="14" width="${W-12}" height="${H-20}" rx="4" class="sv-paper"/><path d="M6 14 L${W/2} 30 L${W-6} 14" class="sv-line"/>`+lab(W/2,12,"收纳夹",8); }
    else { s+=`<rect x="6" y="8" width="${W-12}" height="${H-14}" rx="2" class="sv-paper"/>`+lab(W/2,19,spec.packLabel||"纸盒",8); }
    for(let i=0;i<n;i++){ const cx=pad+8+step*i+step/2; s+=pen(cx,28,pw,i,spec.tips[i]||""); s+=lab(cx,H-12,spec.tips[i]||"",n>10?6.5:8); }
  } else if(spec.k==="dual"){
    const n=spec.n||6, step=(W-40)/n, pw=Math.min(12,step*.6);
    for(let i=0;i<n;i++){ const cx=28+step*i+step/2, col=(spec.cols||HUES)[i%12];
      s+=`<path d="M${cx-pw/2+1} 30 Q${cx} 14 ${cx+pw/2-1} 30Z" fill="${col}"/><rect x="${cx-pw/2}" y="30" width="${pw}" height="16" rx="2" fill="${col}"/>`;
      s+=`<rect x="${cx-pw/2}" y="46" width="${pw}" height="58" class="sv-body"/><rect x="${cx-pw/2}" y="104" width="${pw}" height="14" rx="2" fill="${col}"/><path d="M${cx-pw/2+1} 118 L${cx-1} 128 L${cx+1} 128 L${cx+pw/2-1} 118Z" class="sv-ink"/>`; }
    s+=lab(14,24,"刷头",8,"start")+lab(14,140,"细头",8,"start");
  } else if(spec.k==="kit"){
    for(let i=0;i<3;i++) s+=pen(36+i*26,24,12,i,["0.1","0.5","BR"][i]);
    s+=`<rect x="128" y="24" width="10" height="96" class="sv-body"/><path d="M128 120 L133 134 L138 120Z" class="sv-ink"/>`+lab(133,146,"铅笔",7.5);
    s+=`<rect x="156" y="88" width="34" height="18" rx="3" class="sv-soft" stroke="currentColor"/>`+lab(173,120,"橡皮",7.5);
    s+=`<rect x="200" y="40" width="28" height="70" rx="2" class="sv-paper"/>`+lab(214,124,"练习纸",7.5)+lab(62,146,"针管笔 + 刷笔",7.5);
  } else if(spec.k==="spring"){
    s+=`<rect x="30" y="36" width="30" height="78" rx="3" class="sv-body"/><rect x="30" y="20" width="30" height="16" rx="3" class="sv-ink"/>`;
    s+=`<path d="M38 114 L52 114 L50 124 L40 124Z" class="sv-metal"/><path d="M44 124 V134" class="sv-line" stroke-width="2"/>`;
    s+=`<path d="M38 96 l14 -4 l-14 -4 l14 -4 l-14 -4 l14 -4" class="sv-line"/>`+lab(45,146,"弹簧缓冲",8);
    s+=`<rect x="150" y="36" width="30" height="78" rx="3" class="sv-body"/><rect x="150" y="20" width="30" height="16" rx="3" class="sv-ink"/>`;
    s+=`<path d="M158 114 L172 114 L168 128 L162 128Z" class="sv-soft" stroke="currentColor"/>`+lab(165,146,"塑料弹性尖",8);
  } else if(spec.k==="erase"){
    const cols=spec.cols||HUES;
    for(let i=0;i<4;i++){ const cx=40+i*26; s+=`<rect x="${cx-6}" y="20" width="12" height="10" rx="3" class="sv-soft" stroke="currentColor"/><rect x="${cx-6}" y="30" width="12" height="22" fill="${cols[i]}"/><rect x="${cx-6}" y="52" width="12" height="54" class="sv-body"/><path d="M${cx-5} 106 L${cx-1} 116 L${cx+1} 116 L${cx+5} 106Z" class="sv-ink"/>`; }
    s+=`<path d="M150 60 Q170 40 190 60 T228 60" fill="none" stroke="${cols[0]}" stroke-width="2"/><path d="M150 92 Q170 72 190 92" fill="none" stroke="${cols[5]}" stroke-width="2"/><path d="M190 92 Q209 112 228 92" fill="none" stroke="${cols[5]}" stroke-width="2" stroke-dasharray="2 4" opacity=".5"/>`;
    s+=lab(80,134,"尾端橡胶摩擦",8)+lab(190,124,"摩擦生热后消色",8);
  } else if(spec.k==="refill"){
    s+=`<rect x="20" y="40" width="150" height="16" rx="3" class="sv-metal"/><path d="M170 40 L196 46 L196 50 L170 56Z" class="sv-ink"/><rect x="196" y="47" width="14" height="2" class="sv-ink"/>`+lab(95,32,"金属杆（可重复用）",8);
    s+=`<rect x="40" y="88" width="100" height="10" rx="2" class="sv-soft"/><rect x="40" y="88" width="70" height="10" rx="2" class="sv-ink" opacity=".75"/>`+lab(90,112,"替换墨囊 / 注墨",8);
    s+=`<path d="M160 88 L184 92 L184 96 L160 100Z" class="sv-ink"/><rect x="184" y="93" width="12" height="2" class="sv-ink"/>`+lab(178,112,"替换笔头",8);
    s+=`<path d="M90 60 V84 M180 60 V84" class="sv-line" stroke-dasharray="3 2"/>`+lab(W/2,138,"可续用结构示意",8);
  } else if(spec.k==="brush"){
    for(let i=0;i<3;i++){ const cx=60+i*60; s+=`<rect x="${cx-8}" y="20" width="16" height="24" rx="2"${capFill(i)}/><rect x="${cx-8}" y="44" width="16" height="56" class="sv-body"/><path d="M${cx-7} 100 Q${cx-2} ${118+i*3} ${cx+1} ${124+i*4} Q${cx+6} 116 ${cx+7} 100Z" class="sv-ink"/>`+lab(cx,140,["S","M","B"][i],8); }
  } else if(spec.k==="pad"){
    s+=`<rect x="54" y="22" width="132" height="116" class="sv-paper"/><rect x="54" y="132" width="132" height="6" class="sv-soft"/>`;
    for(let i=0;i<12;i++) s+=`<circle cx="${62+i*10.5}" cy="20" r="3.4" class="sv-line"/>`;
    s+=lab(120,84,spec.label||"9 × 12 in",11)+lab(120,100,spec.sub||"300g 冷压 · 30 张",8);
  } else if(spec.k==="multi"){
    [[36,30],[66,20],[96,10]].forEach(([x,y],i)=>{ s+=`<rect x="${x}" y="${y+12}" width="104" height="${118-y}" class="${i===2?"sv-paper":"sv-soft"}" stroke="currentColor"/>`; for(let j=0;j<8;j++) s+=`<circle cx="${x}" cy="${y+22+j*12}" r="3" class="sv-line"/>`; });
    s+=lab(150,82,"2–3 本装",11)+lab(150,98,"同款 / 多尺寸",8);
  } else if(spec.k==="book"){
    if(spec.orient==="spread"){
      s+=`<path d="M20 36 Q70 28 120 38 V128 Q70 118 20 126Z" class="sv-paper"/><path d="M220 36 Q170 28 120 38 V128 Q170 118 220 126Z" class="sv-paper"/><path d="M120 38 V128" class="sv-line"/>`;
      s+=lab(120,24,"180° 平摊跨页",9)+lab(70,86,spec.l||"全棉 300g",8)+lab(170,86,"锁线装订",8);
    } else {
      s+=`<rect x="34" y="34" width="172" height="96" rx="4" class="sv-paper"/><rect x="34" y="34" width="10" height="96" class="sv-ink"/>`;
      if(spec.elastic) s+=`<rect x="186" y="34" width="5" height="96" class="sv-acc"/>`;
      s+=lab(122,82,spec.label||"横翻 5 × 8 in",11)+lab(122,98,spec.sub||"锁线精装 · 松紧带",8);
    }
  } else if(spec.k==="block"){
    for(let i=4;i>=0;i--) s+=`<rect x="${44+i*2}" y="${30+i*3}" width="150" height="96" class="sv-paper"/>`;
    s+=`<rect x="44" y="30" width="150" height="96" class="sv-glue"/><rect x="110" y="122" width="16" height="4" class="sv-soft"/>`;
    s+=lab(119,76,"四面封胶",11)+lab(119,92,"全棉 300g · 20 张",8)+lab(119,144,"↑ 起纸缺口",7);
  } else if(spec.k==="cards"){
    s+=`<rect x="18" y="40" width="92" height="64" class="sv-paper"/><rect x="124" y="40" width="54" height="54" class="sv-paper"/><circle cx="208" cy="67" r="24" class="sv-paper"/>`;
    s+=lab(64,120,"4 × 6",8)+lab(151,110,"方形",8)+lab(208,110,"圆形",8);
  } else if(spec.k==="accordion"){
    let p="M20 50"; for(let i=0;i<8;i++){ p+=` L${20+(i+1)*25} ${i%2?50:66}`; }
    s+=`<path d="${p} L220 106 ${[...Array(8)].map((_,i)=>`L${220-(i+1)*25} ${i%2?106:122}`).join(" ")} Z" class="sv-paper"/>`;
    for(let i=1;i<8;i++) s+=`<path d="M${20+i*25} ${i%2?66:50} V${i%2?122:106}" class="sv-line"/>`;
    s+=lab(120,140,"展开 15 × 100–200 cm",8);
  } else if(spec.k==="workbook"){
    s+=`<rect x="44" y="18" width="152" height="116" class="sv-paper"/>`;
    s+=`<g class="sv-line"><circle cx="120" cy="66" r="10"/>${[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3,x=120+20*Math.cos(a),y=66+20*Math.sin(a); return `<ellipse cx="${x}" cy="${y}" rx="11" ry="7" transform="rotate(${i*60} ${x} ${y})"/>`;}).join("")}<path d="M120 86 Q116 110 120 126 M120 108 Q134 100 142 104"/></g>`;
    s+=lab(120,146,"预印线稿 · 留白待上色",8);
  } else if(spec.k==="bookkit"){
    s+=`<rect x="20" y="30" width="96" height="100" rx="3" class="sv-paper"/><rect x="20" y="30" width="8" height="100" class="sv-ink"/>`+lab(70,84,"水彩本 / 块",9);
    s+=`<rect x="128" y="40" width="92" height="50" rx="4" class="sv-metal"/>`;
    for(let i=0;i<8;i++) s+=`<rect x="${134+(i%4)*21}" y="${46+Math.floor(i/4)*21}" width="16" height="16" rx="2" fill="${HUES[i]}"/>`;
    s+=`<path d="M136 112 L206 104" stroke="currentColor" stroke-width="3"/><path d="M206 104 Q218 100 222 106 Q214 110 206 108Z" class="sv-ink"/>`+lab(174,128,"颜料 + 画笔",8);
  }
  else if(spec.k==="pans"){            /* 固体水彩：金属盒 + 半块，n 块，rows 行 */
    const n=spec.n||24, rows=spec.rows||(n>24?4:n>12?2:1), per=Math.ceil(n/rows), cw=Math.min(18,170/per), chh=Math.min(20,(84-(rows-1)*4)/rows);
    s+=`<rect x="12" y="16" width="216" height="104" rx="6" class="sv-metal"/><rect x="18" y="22" width="${per*(cw+3)+6}" height="92" rx="3" class="sv-paper"/>`;
    for(let i=0;i<n;i++){ const r=Math.floor(i/per), c=i%per; s+=`<rect x="${24+c*(cw+3)}" y="${28+r*(chh+4)}" width="${cw}" height="${chh}" rx="2" fill="${(spec.cols||HUES)[i%(spec.cols||HUES).length]}"${spec.shine?' stroke="#c9b37a" stroke-width="1.4"':""}/>`; }
    s+=lab(W/2,138,spec.label||`${n} 色半块`,8);
  } else if(spec.k==="tubes"){         /* 管装颜料：n 支横放 */
    const n=Math.min(spec.n||12,12), step=96/n;
    s+=`<rect x="10" y="10" width="220" height="114" rx="4" class="sv-paper"/>`;
    for(let i=0;i<n;i++){ const y=18+i*step, col=(spec.cols||HUES)[i%12], h=Math.max(5,step-2.5);
      s+=`<path d="M40 ${y} H170 L182 ${y+h*0.2} V${y+h*0.8} L170 ${y+h} H40 Z" class="sv-body"/><rect x="40" y="${y}" width="40" height="${h}" fill="${col}"/><rect x="182" y="${y+h*0.15}" width="14" height="${h*0.7}" class="sv-ink"/>`; }
    s+=lab(W/2,140,spec.label||"管装",8);
  } else if(spec.k==="cups"){          /* 果冻杯：两排带盖小杯 */
    const n=spec.n||12, per=Math.ceil(n/2), cw=Math.min(26,200/per-4);
    for(let i=0;i<n;i++){ const r=Math.floor(i/per), c=i%per, x=20+c*(cw+4), y=26+r*52, col=(spec.cols||HUES)[i%12];
      s+=`<rect x="${x}" y="${y}" width="${cw}" height="34" rx="4" class="sv-paper"/><ellipse cx="${x+cw/2}" cy="${y+14}" rx="${cw/2-3}" ry="9" fill="${col}"/>`; }
    s+=`<path d="M14 18 H226" class="sv-line" stroke-dasharray="3 2"/>`+lab(W/2,140,spec.label||"果冻杯 · 带盖",8);
  } else if(spec.k==="bottles"){       /* 挤压瓶 */
    const n=spec.n||6, step=200/n, bw=Math.min(26,step*0.7);
    for(let i=0;i<n;i++){ const cx=20+step*i+step/2, col=(spec.cols||HUES)[i%12];
      s+=`<rect x="${cx-bw/2}" y="44" width="${bw}" height="72" rx="6" class="sv-body"/><rect x="${cx-bw/2}" y="70" width="${bw}" height="34" fill="${col}"/><path d="M${cx-bw/3} 44 L${cx-bw/4} 30 H${cx+bw/4} L${cx+bw/3} 44 Z" class="sv-ink"/><rect x="${cx-2}" y="22" width="4" height="8" class="sv-ink"/>`; }
    s+=lab(W/2,138,spec.label||"2 fl oz 挤压瓶",8);
  } else if(spec.k==="droppers"){      /* 液体水彩滴瓶 */
    for(let i=0;i<5;i++){ const cx=34+i*43, col=HUES[(i*2)%12];
      s+=`<rect x="${cx-14}" y="60" width="28" height="56" rx="4" class="sv-paper"/><rect x="${cx-12}" y="80" width="24" height="34" rx="2" fill="${col}" opacity=".85"/><rect x="${cx-6}" y="44" width="12" height="16" class="sv-ink"/><ellipse cx="${cx}" cy="40" rx="8" ry="7" class="sv-ink"/>`; }
    s+=lab(W/2,138,"滴管瓶 · 浓缩液体",8);
  } else if(spec.k==="easel"){         /* 颜料 + 画布 + 画架 */
    s+=`<path d="M60 128 L90 24 L120 128 M90 24 V128 M66 100 H114" class="sv-line" stroke-width="2"/><rect x="66" y="40" width="48" height="56" class="sv-paper"/><path d="M72 84 Q86 60 100 76 T110 66" fill="none" stroke="${HUES[5]}" stroke-width="2"/>`;
    for(let i=0;i<5;i++){ const y=36+i*16; s+=`<path d="M140 ${y} H200 L208 ${y+3} V${y+9} L200 ${y+12} H140 Z" class="sv-body"/><rect x="140" y="${y}" width="18" height="12" fill="${HUES[i*2]}"/>`; }
    s+=`<path d="M146 122 L220 110" stroke="currentColor" stroke-width="3"/>`+lab(90,144,"画架 + 画布",8)+lab(180,144,"颜料 + 画笔",8);
  } else if(spec.k==="sticks"){        /* 颜料棒：粗圆棒，半包纸套 */
    const n=Math.min(spec.n||6,10), step=200/n, bw=Math.min(18,step*0.6);
    s+=`<rect x="10" y="14" width="220" height="110" rx="4" class="sv-paper"/>`;
    for(let i=0;i<n;i++){ const cx=20+step*i+step/2, col=(spec.cols||HUES)[i%12];
      s+=`<rect x="${cx-bw/2}" y="26" width="${bw}" height="88" rx="${bw/2}" fill="${col}"/><rect x="${cx-bw/2}" y="62" width="${bw}" height="52" rx="2" class="sv-body"/>`; }
    s+=lab(W/2,140,spec.label||"颜料棒",8);

  } else if(spec.k==="pants"){         /* 裤装：v 版型，waist 腰头，fly 门襟，pk 口袋，wash 洗色 */
    const WASH={dark:"#2b3f63",mid:"#4f6f9c",light:"#8fb0d4",black:"#2e2e33",print:"#5d7fae"};
    const col=WASH[spec.wash||"mid"], v=spec.v||"skinny", kid=!!spec.kid;
    const cx=120, top=kid?30:16, wb=spec.waist==="panel"?0:(spec.waist==="elastic"||spec.waist==="draw"?13:8), hipW=kid?64:76, crotch=top+wb+(kid?34:40), bot=kid?124:136;
    const k=kid?0.8:1, hemW=k*({skinny:15,straight:22,wide:32,flare:35,jogger:16,bootcut:27}[v]||22), kneeW=k*({skinny:19,straight:23,wide:29,flare:20,jogger:23,bootcut:21}[v]||23);
    const L0=cx-hipW/2, R0=cx+hipW/2, gap=2, kneeY=crotch+(bot-crotch)*0.45;
    const leg=(side)=>{ const outer=side<0?L0:R0, X=d=>cx+side*(gap+d), thigh=hipW/2-gap-4;
      return `M${outer} ${top+wb} L${X(thigh)} ${crotch} Q${X(kneeW+1)} ${kneeY-8} ${X(kneeW)} ${kneeY} L${X(hemW)} ${bot} L${X(1)} ${bot} L${X(1)} ${crotch+4} Q${X(0)} ${crotch} ${cx} ${crotch} L${cx} ${top+wb}Z`; };
    s+=`<path d="${leg(-1)}" fill="${col}"/><path d="${leg(1)}" fill="${col}"/>`;
    if(spec.wash==="print") s+=`<path d="${leg(-1)}" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="1 3" opacity=".7"/><path d="${leg(1)}" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="1 3" opacity=".7"/>`;
    if(spec.wash==="light"||spec.wash==="mid") s+=`<ellipse cx="${cx-hipW/4}" cy="${kneeY-6}" rx="7" ry="14" fill="#fff" opacity=".22"/><ellipse cx="${cx+hipW/4}" cy="${kneeY-6}" rx="7" ry="14" fill="#fff" opacity=".22"/>`;
    if(spec.waist==="panel"){ s+=`<path d="M${L0+4} ${top+16} Q${cx} ${top-18} ${R0-4} ${top+16} L${R0} ${top+22} L${L0} ${top+22}Z" class="sv-soft"/>`+lab(cx,top+8,"托腹",7); }
    else { s+=`<rect x="${L0}" y="${top}" width="${hipW}" height="${wb}" rx="2" fill="${spec.waist==="button"?col:"#3d4a5e"}" stroke="rgba(255,255,255,.35)"/>`;
      if(spec.waist==="elastic"||spec.waist==="draw") for(let i=1;i<8;i++) s+=`<path d="M${L0+i*hipW/8} ${top+2} V${top+wb-2}" stroke="#fff" stroke-width=".6" opacity=".5"/>`;
      if(spec.waist==="draw") s+=`<path d="M${cx-3} ${top+wb} q-4 14 -8 18 M${cx+3} ${top+wb} q4 14 8 18" stroke="#fff" stroke-width="1.4" fill="none"/>`;
      if(spec.waist==="button") s+=`<circle cx="${cx}" cy="${top+wb/2}" r="2.4" fill="#d9b44a"/>`+[L0+10,cx-14,cx+14,R0-10].map(x=>`<rect x="${x-1.5}" y="${top-1}" width="3" height="${wb+3}" fill="${col}" stroke="rgba(255,255,255,.4)" stroke-width=".5"/>`).join(""); }
    const fy=top+wb;
    if(spec.fly==="zip"||spec.fly==="faux") s+=`<path d="M${cx} ${fy} V${fy+22} Q${cx-2} ${fy+28} ${cx-9} ${fy+26}" stroke="#e2c36b" stroke-width="1" fill="none" stroke-dasharray="${spec.fly==="faux"?"2 2":"none"}"/>`;
    if(spec.pk==="real"||spec.pk==="faux"){ const d=spec.pk==="faux"?' stroke-dasharray="2 2"':""; s+=`<path d="M${L0+3} ${fy+2} Q${L0+14} ${fy+14} ${L0+20} ${fy+2}" stroke="#e2c36b" stroke-width="1" fill="none"${d}/><path d="M${R0-3} ${fy+2} Q${R0-14} ${fy+14} ${R0-20} ${fy+2}" stroke="#e2c36b" stroke-width="1" fill="none"${d}/>`; }
    if(spec.rib||v==="jogger") s+=[-1,1].map(sd=>{ const a=cx+sd*(gap+1), b=cx+sd*(gap+hemW), x0=Math.min(a,b); return `<rect x="${x0}" y="${bot-8}" width="${Math.abs(b-a)}" height="8" fill="#3d4a5e"/>`; }).join("");
    if(spec.fleece) s+=`<path d="M${L0+8} ${bot-30} h12 M${R0-20} ${bot-30} h12" stroke="#f3eadb" stroke-width="3" stroke-linecap="round"/>`+lab(R0+18,bot-26,"加绒",7,"start");
    s+=lab(W/2,148,spec.label||"",8);
  } else if(spec.k==="stand"){         /* 画架 / 画箱 / 画柜：v 指定结构 */
    const v=spec.v, cv=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="sv-paper"/><path d="M${x+6} ${y+h-10} Q${x+w*0.4} ${y+h*0.3} ${x+w*0.6} ${y+h*0.6} T${x+w-6} ${y+12}" fill="none" stroke="${HUES[5]}" stroke-width="2"/>`;
    const wheels=(xs,y)=>xs.map(x=>`<circle cx="${x}" cy="${y}" r="4" class="sv-ink"/>`).join("");
    const drawers=(x,y,w,h,n)=>{ let r=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="sv-wood"/>`; const dh=h/n; for(let i=0;i<n;i++) r+=`<rect x="${x+3}" y="${y+i*dh+2}" width="${w-6}" height="${dh-4}" class="sv-body"/><rect x="${x+w/2-6}" y="${y+i*dh+dh/2-1.5}" width="12" height="3" class="sv-ink"/>`; return r; };
    const L={aframe:"A 字架",hframe:"H 架",crank:"H 架 · 摇柄升降",flat:"可平放 H 架",tripod:"铝合金三脚架",wc:"平放水彩写生架",french:"法式画箱架",pochade:"写生画箱 + 三脚架",tablebox:"抽屉画箱（桌面画架）",tableh:"桌面 H 架",tablea:"桌面 A 字 / 三角架",tablemetal:"金属桌面三脚架",board:"桌面倾斜画板",kids:"双面儿童画架 + 卷纸",kidstable:"儿童桌面画架",display:"金属展示架 + 指示牌",displaywood:"木质展示架",mini:"迷你画架多支装",artbox:"多抽屉木画箱",toolbox:"手提分层工具箱",taboret:"画室边柜 / 推车",flatfile:"平面图纸柜",rack:"画布收纳架",dryrack:"晾画架",easelcab:"画架 + 收纳柜一体",roll:"画架卷纸",kit:"写生全套（架 + 凳 + 包）",cn:"美术生画架 + 画板"};
    if(v==="aframe"||v==="displaywood"){ s+=`<path d="M120 14 L84 136 M120 14 L156 136 M120 14 L120 132 L150 140" class="sv-wl"/><rect x="88" y="96" width="64" height="7" class="sv-wood"/>`+(v==="aframe"?cv(94,34,52,60):`<rect x="96" y="40" width="48" height="54" fill="none" stroke="#b8902a" stroke-width="5"/><rect x="101" y="45" width="38" height="44" class="sv-soft"/>`); }
    else if(v==="hframe"||v==="crank"||v==="flat"||v==="easelcab"){ const by=v==="easelcab"?96:132; s+=`<path d="M92 12 V${by} M148 12 V${by} M120 6 V${by} M82 ${by} H158" class="sv-wl"/><rect x="88" y="${v==="easelcab"?80:86}" width="64" height="7" class="sv-wood"/>`+(v==="flat"?`<rect x="70" y="66" width="100" height="14" class="sv-paper" transform="rotate(-8 120 73)"/>`:cv(94,v==="easelcab"?22:28,52,56));
      if(v==="crank") s+=`<circle cx="160" cy="100" r="8" class="sv-line"/><path d="M160 100 L168 92" class="sv-ml"/>`;
      if(v==="easelcab") s+=drawers(78,96,84,36,3)+wheels([84,156],136); }
    else if(v==="tripod"||v==="wc"||v==="pochade"){ s+=`<path d="M120 70 L86 140 M120 70 L154 140 M120 70 L122 140 M120 70 V${v==="tripod"?20:64}" class="sv-ml"/>`;
      if(v==="tripod") s+=cv(96,24,48,40)+`<rect x="94" y="64" width="52" height="4" class="sv-ink"/>`;
      else if(v==="wc") s+=`<path d="M78 54 L162 54 L170 64 L70 64 Z" class="sv-paper"/><rect x="88" y="56" width="20" height="6" fill="${HUES[5]}" opacity=".6"/>`;
      else s+=`<rect x="90" y="52" width="60" height="14" class="sv-wood"/><rect x="90" y="18" width="60" height="34" class="sv-wood" transform="skewX(-8)"/>`+cv(98,22,40,26); }
    else if(v==="french"){ const lg=spec.alu?"sv-ml":"sv-wl"; s+=`<path d="M100 74 L80 140 M140 74 L160 140 M120 74 L122 140" class="${lg}"/><rect x="90" y="62" width="60" height="16" class="${spec.alu?"sv-metal":"sv-wood"}"/><path d="M120 62 V10" class="${lg}"/>`+cv(96,14,48,44); }
    else if(v==="kit"){ s+=`<path d="M70 60 L50 136 M70 60 L90 136 M70 60 V136" class="sv-ml"/>`+cv(52,20,36,38)+`<path d="M140 108 L176 108 M146 108 L170 136 M170 108 L146 136" class="sv-ml"/><rect x="186" y="70" width="34" height="56" rx="6" class="sv-soft"/>`; }
    else if(v==="cn"){ s+=`<path d="M100 20 L80 136 M140 20 L160 136 M120 20 L120 136" class="sv-ml"/><rect x="82" y="34" width="76" height="58" class="sv-wood"/><rect x="88" y="40" width="64" height="46" class="sv-paper"/><path d="M96 78 Q110 50 130 66 T146 52" fill="none" stroke="var(--ink-2)" stroke-width="1.4"/>`; }
    else if(v==="tablebox"){ s+=`<path d="M20 132 H220" class="sv-line"/>`+drawers(70,100,100,32,2)+`<path d="M90 100 L110 34 M150 100 L130 34" class="sv-wl"/>`+cv(96,30,48,44); }
    else if(v==="tableh"){ s+=`<path d="M20 132 H220" class="sv-line"/><path d="M98 30 V128 M142 30 V128 M120 22 V128 M88 128 H152" class="sv-wl"/><rect x="92" y="96" width="56" height="6" class="sv-wood"/>`+cv(100,40,40,52); }
    else if(v==="tablea"){ s+=`<path d="M20 132 H220" class="sv-line"/><path d="M120 40 L96 128 M120 40 L144 128 M120 40 L130 128" class="sv-wl"/><rect x="98" y="98" width="44" height="5" class="sv-wood"/>`+cv(102,52,36,44); }
    else if(v==="tablemetal"){ s+=`<path d="M20 132 H220" class="sv-line"/><path d="M120 60 L100 128 M120 60 L140 128 M120 60 L124 128 M120 60 V36" class="sv-ml"/><rect x="94" y="30" width="52" height="40" class="sv-soft"/><path d="M98 100 H142" class="sv-ml"/>`; }
    else if(v==="board"){ s+=`<path d="M20 132 H220" class="sv-line"/><path d="M60 124 L180 124 L170 64 L70 64 Z" class="sv-wood"/><rect x="82" y="72" width="76" height="44" class="sv-paper" transform="skewX(-4)"/><path d="M170 64 L180 124" class="sv-ml"/>`; }
    else if(v==="kids"){ s+=`<path d="M120 22 L76 140 M120 22 L164 140" class="sv-wl"/><rect x="84" y="30" width="72" height="62" class="sv-paper"/><rect x="90" y="36" width="60" height="50" class="sv-ink" opacity=".85"/><path d="M98 76 Q112 52 128 64" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="80" y="18" width="80" height="10" rx="5" class="sv-paper"/><rect x="82" y="94" width="76" height="8" class="sv-wood"/>`+[0,1,2].map(i=>`<rect x="${92+i*20}" y="86" width="10" height="8" fill="${HUES[i*2]}"/>`).join(""); }
    else if(v==="kidstable"){ s+=`<path d="M20 132 H220" class="sv-line"/><path d="M120 40 L84 128 M120 40 L156 128" class="sv-wl"/><rect x="92" y="48" width="56" height="44" class="sv-paper"/><rect x="96" y="52" width="48" height="36" class="sv-ink" opacity=".85"/><rect x="88" y="36" width="64" height="8" rx="4" class="sv-paper"/>`; }
    else if(v==="display"){ s+=`<path d="M120 50 L90 140 M120 50 L150 140 M120 50 L122 140 M120 50 V14" class="sv-ml"/><rect x="72" y="18" width="96" height="70" class="sv-paper"/>${lab(120,50,"WELCOME",11)}<path d="M84 60 H156" class="sv-line"/><path d="M70 88 H170" class="sv-ml"/>`; }
    else if(v==="mini"){ for(let i=0;i<5;i++){ const x=36+i*40; s+=`<path d="M${x} 70 L${x-14} 128 M${x} 70 L${x+14} 128 M${x} 70 L${x+4} 128" class="sv-wl" style="stroke-width:3"/><rect x="${x-13}" y="80" width="26" height="22" fill="${HUES[i*2]}" opacity=".7"/><rect x="${x-15}" y="102" width="30" height="3" class="sv-wood"/>`; } }
    else if(v==="roll"){ for(let i=0;i<3;i++){ const x=40+i*58; s+=`<rect x="${x}" y="40" width="48" height="80" class="sv-paper"/><ellipse cx="${x+24}" cy="40" rx="24" ry="8" class="sv-paper"/><ellipse cx="${x+24}" cy="40" rx="6" ry="2.5" class="sv-ink"/>`; } }
    else if(v==="artbox"){ s+=drawers(60,30,120,96,4)+`<rect x="56" y="24" width="128" height="8" class="sv-wood"/><rect x="104" y="14" width="32" height="10" rx="4" class="sv-line"/>`; }
    else if(v==="toolbox"){ s+=`<rect x="50" y="56" width="140" height="72" rx="6" class="sv-soft"/><path d="M60 56 L80 34 H160 L180 56" class="sv-line"/><rect x="74" y="40" width="92" height="12" class="sv-body"/>`+[0,1,2,3,4].map(i=>`<rect x="${82+i*16}" y="42" width="5" height="8" fill="${HUES[i*2]}"/>`).join("")+`<path d="M100 28 H140" class="sv-ml"/>`; }
    else if(v==="taboret"){ s+=`<rect x="64" y="26" width="112" height="10" class="sv-wood"/>`+drawers(70,36,100,54,3)+`<path d="M70 92 H170 M70 112 H170 M70 36 V130 M170 36 V130" class="sv-wl" style="stroke-width:3"/>`+wheels([76,164],136)+[0,1].map(i=>`<circle cx="${84+i*16}" cy="22" r="6" class="sv-paper"/>`).join(""); }
    else if(v==="flatfile"){ s+=`<rect x="30" y="50" width="180" height="76" class="sv-wood"/>`+[0,1,2,3,4].map(i=>`<rect x="36" y="${54+i*14}" width="168" height="11" class="sv-body"/><rect x="112" y="${58+i*14}" width="16" height="3" class="sv-ink"/>`).join("")+`<path d="M34 126 V134 M206 126 V134" class="sv-ml"/>`; }
    else if(v==="rack"){ s+=`<rect x="40" y="96" width="160" height="12" class="sv-wood"/>`+[0,1,2,3,4,5,6,7].map(i=>`<path d="M${52+i*20} 96 V40" class="sv-wl" style="stroke-width:3"/>`).join("")+[0,1,2].map(i=>cv(58+i*46,46+i*6,10,50-i*6)).join("")+wheels([50,190],114); }
    else if(v==="dryrack"){ s+=`<path d="M70 20 V130 M170 20 V130" class="sv-ml"/>`+[0,1,2,3,4,5,6,7].map(i=>`<path d="M70 ${28+i*12} H170" class="sv-line"/>`).join("")+`<rect x="80" y="36" width="46" height="4" fill="${HUES[1]}"/><rect x="110" y="72" width="50" height="4" fill="${HUES[5]}"/>`+wheels([70,170],136); }
    s+=lab(W/2,148,spec.label||L[v]||"",8);
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="结构示意图">${s}</svg>`;
}
