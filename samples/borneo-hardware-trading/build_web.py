"""Build the self-contained web dashboard: index.html.
Brand-matched to EastStar (navy/gold mission-control). Data embedded inline so the
single file opens offline and shares cleanly over WhatsApp. SVG charts, live branch filter."""
import json
from pathlib import Path

HERE = Path(__file__).parent
data = json.loads((HERE/"data.json").read_text())
# Trim records to what the dashboard needs (keeps file lean)
recs = [{"m":r["month"],"b":r["branch"],"r":r["rep"],"c":r["category"],
         "p":r["product"],"a":r["amount"],"paid":r["paid"]} for r in data["records"]]
payload = {"months": data["meta"]["months"], "branches": data["meta"]["branches"],
           "records": recs}
DATA_JSON = json.dumps(payload, separators=(",",":"))

HTML = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Borneo Hardware Trading · Sales Dashboard · EastStar Analytics</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --navy:#0c1b30; --navy2:#13294b; --navy3:#1B365D; --gold:#D4A017; --gold-soft:#e7c46b;
  --blue:#5a7daa; --whatsapp:#25D366; --ink:#eaf0fb; --muted:#8ea3c4; --line:rgba(138,163,204,.16);
  --card:rgba(255,255,255,.035);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  font-family:'Montserrat',sans-serif; color:var(--ink); background:var(--navy);
  background-image:
    radial-gradient(900px 500px at 12% -8%, rgba(212,160,23,.10), transparent 60%),
    radial-gradient(800px 600px at 110% 0%, rgba(90,125,170,.14), transparent 55%),
    linear-gradient(180deg,#0c1b30,#0a1526 60%,#091222);
  min-height:100vh; -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;
  background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);
  background-size:44px 44px;mask-image:radial-gradient(circle at 50% 30%,#000 0%,transparent 80%)}
.wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:34px 22px 70px}
.mono{font-family:'IBM Plex Mono',monospace}

/* header */
header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap;
  border-bottom:1px solid var(--line);padding-bottom:22px;margin-bottom:30px;
  animation:rise .7s cubic-bezier(.2,.7,.2,1) both}
.brand{display:flex;align-items:center;gap:13px}
.emblem{width:42px;height:42px;flex:none;position:relative}
.emblem svg{width:100%;height:100%;animation:spin 18s linear infinite}
@media(prefers-reduced-motion:reduce){.emblem svg{animation:none}}
.brand .label{font-family:'IBM Plex Mono',monospace;letter-spacing:.34em;font-size:10px;color:var(--gold);font-weight:600}
.brand .name{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;letter-spacing:.02em;margin-top:3px}
.htitle{text-align:right}
.htitle .tag{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.28em;color:var(--gold);
  border:1px solid rgba(212,160,23,.4);padding:4px 9px;border-radius:30px;display:inline-block;margin-bottom:9px}
.htitle h1{font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(20px,3.4vw,30px);line-height:1.05;letter-spacing:-.01em}
.htitle .sub{color:var(--muted);font-size:12px;margin-top:7px}

/* filter */
.filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:26px;
  animation:rise .7s .08s cubic-bezier(.2,.7,.2,1) both}
.filters .flabel{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);margin-right:4px}
.chip{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.06em;color:var(--muted);
  background:var(--card);border:1px solid var(--line);padding:8px 15px;border-radius:30px;cursor:pointer;
  transition:.25s;user-select:none}
.chip:hover{color:var(--ink);border-color:rgba(212,160,23,.45)}
.chip.active{background:linear-gradient(180deg,var(--gold),#b8870f);color:#1a1206;border-color:transparent;font-weight:600;
  box-shadow:0 6px 20px -8px rgba(212,160,23,.7)}

/* kpis */
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px}
@media(max-width:760px){.kpis{grid-template-columns:repeat(2,1fr)}}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 18px 16px;position:relative;overflow:hidden;
  animation:rise .7s cubic-bezier(.2,.7,.2,1) both}
.kpi:nth-child(1){animation-delay:.12s}.kpi:nth-child(2){animation-delay:.18s}
.kpi:nth-child(3){animation-delay:.24s}.kpi:nth-child(4){animation-delay:.30s}
.kpi::after{content:"";position:absolute;left:0;top:0;height:3px;width:100%;background:linear-gradient(90deg,var(--gold),transparent 70%)}
.kpi .k-label{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase}
.kpi .k-val{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(18px,2.1vw,25px);margin-top:9px;letter-spacing:-.02em;white-space:nowrap}
.kpi .k-val .cur{font-size:.5em;color:var(--gold);font-weight:700;margin-right:3px;vertical-align:.16em;letter-spacing:.02em}
.kpi .k-note{font-size:10.5px;color:var(--muted);margin-top:5px}
.kpi.warn .k-val{color:var(--gold-soft)}

/* panels */
.grid{display:grid;grid-template-columns:1.55fr 1fr;gap:16px}
@media(max-width:860px){.grid{grid-template-columns:1fr}}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;
  animation:rise .7s cubic-bezier(.2,.7,.2,1) both;animation-delay:.34s}
.panel h2{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;letter-spacing:.01em;display:flex;align-items:center;gap:9px;margin-bottom:4px}
.panel h2 .idx{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--gold);font-weight:600}
.panel .ph-sub{font-size:11px;color:var(--muted);margin-bottom:16px}
.span2{grid-column:1/-1}

/* svg chart */
.chart{width:100%}
.bar-row{display:grid;grid-template-columns:130px 1fr 78px;align-items:center;gap:12px;margin:9px 0;font-size:12px}
.bar-row .bl{color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-track{height:9px;background:rgba(255,255,255,.05);border-radius:6px;overflow:hidden}
.bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,var(--blue),var(--gold));width:0;transition:width .9s cubic-bezier(.2,.8,.2,1)}
.bar-row .bv{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted);text-align:right}
@media(max-width:760px){.bar-row{grid-template-columns:100px 1fr 64px;gap:8px}.bar-row .bl{font-size:11px}}

footer{margin-top:42px;border-top:1px solid var(--line);padding-top:26px;display:flex;justify-content:space-between;
  align-items:center;gap:20px;flex-wrap:wrap}
.foot-tag{font-family:'Syne',sans-serif;font-weight:700;font-size:15px}
.foot-tag span{color:var(--gold)}
.foot-sub{font-size:11px;color:var(--muted);margin-top:5px}
.cta{display:inline-flex;align-items:center;gap:9px;background:var(--whatsapp);color:#053018;font-weight:600;
  font-size:13px;padding:12px 20px;border-radius:30px;text-decoration:none;transition:.25s;
  box-shadow:0 10px 30px -10px rgba(37,211,102,.6)}
.cta:hover{transform:translateY(-2px);box-shadow:0 16px 34px -10px rgba(37,211,102,.75)}
.disclaimer{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(--muted);opacity:.7;text-align:center;margin-top:26px}

@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
.axis-l{font-family:'IBM Plex Mono',monospace;font-size:9px;fill:var(--muted)}
.gridline{stroke:var(--line);stroke-width:1}
.area{fill:url(#ag)}
.line{fill:none;stroke:var(--gold);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.dot{fill:var(--navy);stroke:var(--gold);stroke-width:2}
.dot-hit{fill:transparent;cursor:pointer}
.tip{font-family:'IBM Plex Mono',monospace;font-size:10px;fill:var(--ink)}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <div class="emblem">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A017" stroke-opacity=".35" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="#5a7daa" stroke-opacity=".4" stroke-width="1"/>
          <path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42 Z" fill="#D4A017"/>
        </svg>
      </div>
      <div>
        <div class="label">EASTSTAR ANALYTICS</div>
        <div class="name">Empowering Sarawak.</div>
      </div>
    </div>
    <div class="htitle">
      <div class="tag">SAMPLE · LIVE DEMO</div>
      <h1>Borneo Hardware Trading</h1>
      <div class="sub mono">SALES PERFORMANCE · FY2025 · KUCHING</div>
    </div>
  </header>

  <div class="filters" id="filters">
    <span class="flabel">BRANCH ▸</span>
  </div>

  <div class="kpis" id="kpis"></div>

  <div class="grid">
    <div class="panel">
      <h2><span class="idx">01</span> Monthly Revenue Trend</h2>
      <div class="ph-sub">Total sales by month — RM</div>
      <div id="trend" class="chart"></div>
    </div>
    <div class="panel">
      <h2><span class="idx">02</span> Revenue by Sales Rep</h2>
      <div class="ph-sub">Who's driving the numbers</div>
      <div id="reps"></div>
    </div>
    <div class="panel">
      <h2><span class="idx">03</span> Revenue by Category</h2>
      <div class="ph-sub">Product mix across the catalogue</div>
      <div id="cats"></div>
    </div>
    <div class="panel">
      <h2><span class="idx">04</span> Top Products</h2>
      <div class="ph-sub">Best sellers by revenue</div>
      <div id="prods"></div>
    </div>
  </div>

  <footer>
    <div>
      <div class="foot-tag">Empowering Sarawak. <span>Driving Excellence.</span></div>
      <div class="foot-sub">This dashboard was built from a messy 12-tab Excel file — the same kind you already have.</div>
    </div>
    <a class="cta" href="#" onclick="return false;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#053018"><path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-3-.2-.3A8 8 0 1112 20z"/></svg>
      Get this for your numbers
    </a>
  </footer>
  <div class="disclaimer">SAMPLE DATA · GENERATED FOR DEMONSTRATION · NOT A REAL COMPANY · © EASTSTAR ANALYTICS</div>
</div>

<script>
const DATA = __DATA__;
const fmt = n => n.toLocaleString('en-MY',{maximumFractionDigits:0});
const fmtK = n => n>=1e6? (n/1e6).toFixed(2)+'M' : n>=1e3? Math.round(n/1e3)+'k' : Math.round(n);
let branch = 'All';

function filtered(){ return branch==='All'? DATA.records : DATA.records.filter(r=>r.b===branch); }
function rollup(rows,key){const m={};rows.forEach(r=>m[r[key]]=(m[r[key]]||0)+r.a);return m;}

function buildFilters(){
  const f=document.getElementById('filters');
  ['All',...DATA.branches].forEach(b=>{
    const c=document.createElement('div');c.className='chip'+(b===branch?' active':'');c.textContent=b;
    c.onclick=()=>{branch=b;[...f.querySelectorAll('.chip')].forEach(x=>x.classList.toggle('active',x.textContent===b));render();};
    f.appendChild(c);
  });
}

function animateVal(el,target,prefix){
  const dur=900,t0=performance.now();
  function step(t){const k=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-k,3);
    el.innerHTML=(prefix||'')+fmt(Math.round(target*e));if(k<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
}

function render(){
  const rows=filtered();
  const total=rows.reduce((s,r)=>s+r.a,0);
  const orders=rows.length;
  const avg=orders?total/orders:0;
  const outstanding=rows.filter(r=>!r.paid).reduce((s,r)=>s+r.a,0);

  const kpis=[
    {l:'Total Revenue',v:total,cur:true},
    {l:'Total Orders',v:orders},
    {l:'Avg Order Value',v:avg,cur:true},
    {l:'Outstanding (Unpaid)',v:outstanding,cur:true,warn:true},
  ];
  const kc=document.getElementById('kpis');kc.innerHTML='';
  kpis.forEach(k=>{
    const d=document.createElement('div');d.className='kpi'+(k.warn?' warn':'');
    d.innerHTML=`<div class="k-label">${k.l}</div><div class="k-val">${k.cur?'<span class="cur">RM</span>':''}<span class="num">0</span></div>
      <div class="k-note mono">${k.warn?'≈ '+Math.round(outstanding/total*100)+'% of revenue uncollected':branch==='All'?'all branches':branch+' branch'}</div>`;
    kc.appendChild(d);animateVal(d.querySelector('.num'),k.v);
  });

  // trend
  drawTrend(DATA.months.map(m=>({m, v: rows.filter(r=>r.m===m).reduce((s,r)=>s+r.a,0)})));
  // bars
  bars('reps', rollup(rows,'r'), true);
  bars('cats', rollup(rows,'c'), true);
  bars('prods', rollup(rows,'p'), true, 6);
}

function bars(id,map,sort,limit){
  let entries=Object.entries(map);
  if(sort)entries.sort((a,b)=>b[1]-a[1]);
  if(limit)entries=entries.slice(0,limit);
  const max=Math.max(1,...entries.map(e=>e[1]));
  const host=document.getElementById(id);host.innerHTML='';
  entries.forEach(([k,v],i)=>{
    const row=document.createElement('div');row.className='bar-row';
    row.innerHTML=`<div class="bl" title="${k}">${k}</div>
      <div class="bar-track"><div class="bar-fill"></div></div>
      <div class="bv">RM ${fmtK(v)}</div>`;
    host.appendChild(row);
    const fill=row.querySelector('.bar-fill');
    requestAnimationFrame(()=>setTimeout(()=>fill.style.width=(v/max*100)+'%', i*55));
  });
}

function drawTrend(series){
  const W=640,H=210,pl=44,pr=14,pt=14,pb=26;
  const max=Math.max(...series.map(s=>s.v))*1.12||1;
  const iw=W-pl-pr,ih=H-pt-pb;
  const x=i=>pl+ (series.length>1? i/(series.length-1)*iw : iw/2);
  const y=v=>pt+ih-(v/max)*ih;
  let grid='',lbl='';
  for(let g=0;g<=4;g++){const gy=pt+ih-(g/4)*ih;const gv=max*g/4;
    grid+=`<line class="gridline" x1="${pl}" y1="${gy}" x2="${W-pr}" y2="${gy}"/>`;
    lbl+=`<text class="axis-l" x="${pl-7}" y="${gy+3}" text-anchor="end">${fmtK(gv)}</text>`;}
  const pts=series.map((s,i)=>[x(i),y(s.v)]);
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=`M${pl} ${pt+ih} `+pts.map(p=>'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+` L${W-pr} ${pt+ih} Z`;
  let dots='',xl='';
  series.forEach((s,i)=>{
    dots+=`<circle class="dot" cx="${x(i)}" cy="${y(s.v)}" r="3.2"><title>${s.m}: RM ${fmt(s.v)}</title></circle>`;
    if(i%1===0)xl+=`<text class="axis-l" x="${x(i)}" y="${H-8}" text-anchor="middle">${s.m}</text>`;
  });
  document.getElementById('trend').innerHTML=
   `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D4A017" stop-opacity=".34"/>
        <stop offset="1" stop-color="#D4A017" stop-opacity="0"/></linearGradient></defs>
      ${grid}<path class="area" d="${area}"/><path class="line" d="${line}"/>${dots}${lbl}${xl}
    </svg>`;
}

buildFilters();render();
</script>
</body>
</html>'''

html = HTML.replace("__DATA__", DATA_JSON)
out = HERE/"3_web_dashboard.html"
out.write_text(html)
print("saved", out.name, f"({len(html)//1024} KB, {len(recs)} records embedded)")
