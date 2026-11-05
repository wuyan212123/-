
/* ---------- 结构示意图（通用，不是实拍图） ----------
   fig({k:"pens", n, ink:"black"|"rainbow"|"custom", cols:[颜色，写 "ink" 表示跟随主题的黑色], tips:[标签], pack:"blister"|"pouch"|"wallet"|"box"})
   其他 k：refill / brush / dual / kit / spring / erase / pad / multi / book / block / cards / accordion / workbook / bookkit
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
  return `<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="结构示意图">${s}</svg>`;
}
