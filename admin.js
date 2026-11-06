"use strict";
// หน้าแอดมิน: ไม่มีฟอร์มล็อกอินของตัวเอง ถ้ายังไม่ล็อกอิน/ไม่มีสิทธิ์ จะกลับไปหน้า login เดิม (index.html#admin)
const SB_URL="https://htxdnqhzyaxuvomziqzr.supabase.co",SB_KEY="sb_publishable_AyNg4TJiuiw54uEsaq7kcQ_Sns--xgk";
const sb=supabase.createClient(SB_URL,SB_KEY,{auth:{storageKey:"slf-admin-auth"}});
const ST=["กำลังตามหา","พบแล้ว","ติดต่อแล้ว","คืนแล้ว"];
const CAT={"โทรศัพท์":"📱","กระเป๋า":"👜","กุญแจ":"🔑","บัตรนักศึกษา":"🪪","อื่น ๆ":"📦"};
const PL=["ห้องเรียน","โรงอาหาร","ห้องสมุด","ลานจอดรถ","อาคารกิจกรรม","สนามกีฬา"];
const DAY=864e5,PER=10,LOGIN="index.html#admin";
const C={lost:"#f97316",found:"#0d9488",ac:"#4f46e5",blue:"#2563eb",warn:"#d97706"};
let items=[],me="",tab="over",openId=null,editing=false,upd=null,editImg;
const F={q:"",kind:"",st:"",place:"",cat:"",sort:"at",dir:-1,page:1},sel=new Set();

const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const N=n=>Number(n).toLocaleString("th-TH");
const I={
grid:'<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
refresh:'<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M3 21v-5h5"/>',
dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',
trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
box:'<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01"/>',
hand:'<path d="M18 11V6a2 2 0 0 0-4 0v4M14 10V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8l-1.5-1.5a2 2 0 0 0-3 2.6L6 20a6 6 0 0 0 5 2h3a6 6 0 0 0 6-6v-5a2 2 0 0 0-4 0"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6"/>',
next:'<path d="m9 18 6-6-6-6"/>',prev:'<path d="m15 18-6-6 6-6"/>',check:'<path d="M20 6 9 17l-5-5"/>'};
const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),2800)}
function ask(title,msg,okText,danger){return new Promise(ok=>{const c=$("cf");
c.innerHTML=`<div role="alertdialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(msg)}</p><div class="acts"><button class="btn" id="cfn">ยกเลิก</button><button class="btn ${danger?"bad":"pri"}" id="cfy">${esc(okText)}</button></div></div>`;
c.classList.add("on");const done=v=>{c.classList.remove("on");ok(v)};$("cfn").onclick=()=>done(false);$("cfy").onclick=()=>done(true);$("cfn").focus()})}

// ---------- helpers ----------
const age=i=>Math.floor((Date.now()-new Date(i.at))/DAY);
const open_=()=>items.filter(i=>!i.draft&&i.st<3);
const fd=s=>new Date(s).toLocaleString("th-TH",{day:"numeric",month:"short",year:"2-digit",hour:"2-digit",minute:"2-digit"})+" น.";
function rel(s){const m=Math.round((Date.now()-new Date(s))/6e4);if(m<1)return"เมื่อสักครู่";if(m<60)return m+" นาทีที่แล้ว";const h=Math.round(m/60);if(h<24)return h+" ชม.ที่แล้ว";return Math.round(h/24)+" วันที่แล้ว"}
const words=s=>s.toLowerCase().split(/\s+/).filter(w=>w.length>1);
function match(a,b){if(a.draft||b.draft||a.kind===b.kind||a.cat!==b.cat)return false;if(a.place===b.place)return true;return words(a.name).some(x=>b.name.toLowerCase().indexOf(x)>-1)}
function pairs(){const o=open_(),L=o.filter(i=>i.kind==="lost"),Fd=o.filter(i=>i.kind==="found"),r=[];L.forEach(l=>Fd.forEach(f=>{if(match(l,f))r.push({l,f})}));return r}
const get=id=>items.find(x=>x.id===id);
const thumb=i=>`<div class="th">${i.img?`<img src="${esc(i.img)}" alt="" loading="lazy">`:CAT[i.cat]||"📦"}</div>`;
const kindPill=k=>`<span class="pill ${k}">${k==="lost"?"ของหาย":"พบของ"}</span>`;
const stPill=i=>i.draft?'<span class="pill draft">ฉบับร่าง</span>':`<span class="pill s${i.st}">${ST[i.st]}</span>`;

// ---------- auth / load ----------
async function start(){
const s=await sb.auth.getSession();
if(!s.data.session||!s.data.session.user.email){location.replace(LOGIN);return}
me=s.data.session.user.email;
const r=await sb.rpc("is_admin");
if(r.data!==true){await sb.auth.signOut();location.replace("index.html#admin-denied");return}
await load();shell();view();
setInterval(()=>{if(!openId&&!document.hidden)refresh(true)},60000)}
async function load(){const r=await sb.from("items").select("*").order("at",{ascending:false});
if(r.error){toast("โหลดข้อมูลไม่สำเร็จ: "+r.error.message);return false}
items=r.data;upd=new Date();return true}
async function refresh(quiet){const b=$("rf");if(b)b.classList.add("spinning");
const ok=await load();if(b)b.classList.remove("spinning");if(ok){view(true);if(!quiet)toast("อัปเดตข้อมูลแล้ว")}}
async function logout(){await sb.auth.signOut();location.replace(LOGIN)}

// ---------- shell ----------
const TABS=[["over","ภาพรวม","grid"],["items","รายการทั้งหมด","list"],["match","จับคู่","link"]];
const TTL={over:["ภาพรวมระบบ","สรุปสถานการณ์ของหายและของที่พบในมหาวิทยาลัย"],items:["รายการทั้งหมด","ค้นหา กรอง แก้ไข เลื่อนสถานะ และลบได้ทุกรายการ"],match:["รายการที่อาจตรงกัน","คู่ของหาย–ของที่พบที่ระบบกฎคัดมาให้ตรวจ"]};
function shell(){$("root").innerHTML=`<div class="shell"><aside class="side"><div class="brand"><i>⚙</i><div>Smart Lost &amp; Found<small>ผู้ดูแลระบบ</small></div></div>
<nav id="nav"></nav><div class="who"><span>เข้าสู่ระบบเป็น</span><b>${esc(me)}</b><button onclick="logout()">${ic("out",16)} ออกจากระบบ</button><a href="index.html">← หน้าผู้ใช้</a></div></aside>
<div class="main"><div class="top"><div><h1 id="ttl"></h1><p id="tsub"></p></div><div class="acts"><span class="upd" id="upd"></span><button class="btn" data-themebtn onclick="toggleTheme()">${themeLabel()}</button><button class="btn" id="rf" onclick="refresh()">${ic("refresh",16)} รีเฟรช</button></div></div><section id="view"></section></div></div>`}
function nav(){const stale=open_().filter(i=>age(i)>=7).length,mt=pairs().length,bd={items:stale,match:mt};
$("nav").innerHTML=TABS.map(t=>`<button class="${tab===t[0]?"on":""}" onclick="setTab('${t[0]}')">${ic(t[2])}<span>${t[1]}</span>${bd[t[0]]?`<b>${bd[t[0]]}</b>`:""}</button>`).join("");
$("ttl").textContent=TTL[tab][0];$("tsub").textContent=TTL[tab][1];$("upd").textContent=upd?"อัปเดตล่าสุด "+upd.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})+" น.":""}
function setTab(t){tab=t;sel.clear();view()}
function view(keep){nav();({over:overV,items:itemsV,match:matchV})[tab](keep)}

// ---------- charts ----------
function areaChart(days){const W=640,H=230,p={l:34,r:12,t:12,b:28},w=W-p.l-p.r,h=H-p.t-p.b,mx=Math.max(4,...days.flatMap(d=>[d.lost,d.found])),step=Math.ceil(mx/4),top=step*4;
const x=i=>p.l+i*w/(days.length-1),y=v=>p.t+h-v/top*h;
const path=k=>days.map((d,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(d[k]).toFixed(1)).join("");
const area=k=>path(k)+`L${x(days.length-1)} ${p.t+h}L${x(0)} ${p.t+h}Z`;
let g="";for(let v=0;v<=top;v+=step)g+=`<line class="gl" x1="${p.l}" x2="${W-p.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${p.l-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
const lab=days.map((d,i)=>i%2===0||i===days.length-1?`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${esc(d.l)}</text>`:"").join("");
const dots=k=>days.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d[k])}" r="3.5" fill="${C[k]}" stroke="var(--sf)" stroke-width="2"><title>${esc(d.l)} · ${k==="lost"?"ของหาย":"ของที่พบ"} ${d[k]} รายการ</title></circle>`).join("");
return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="จำนวนรายการใหม่ต่อวัน 14 วันล่าสุด"><defs><linearGradient id="gl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.lost}" stop-opacity=".28"/><stop offset="1" stop-color="${C.lost}" stop-opacity="0"/></linearGradient><linearGradient id="gl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.found}" stop-opacity=".28"/><stop offset="1" stop-color="${C.found}" stop-opacity="0"/></linearGradient></defs>${g}${lab}
<path d="${area("lost")}" fill="url(#gl1)"/><path d="${area("found")}" fill="url(#gl2)"/>
<path d="${path("lost")}" fill="none" stroke="${C.lost}" stroke-width="2.5" stroke-linejoin="round"/><path d="${path("found")}" fill="none" stroke="${C.found}" stroke-width="2.5" stroke-linejoin="round"/>${dots("lost")}${dots("found")}</svg>`}
function donut(parts,label){const tot=parts.reduce((a,b)=>a+b.v,0),R=52,CI=2*Math.PI*R;let off=0;
const arcs=tot?parts.filter(p=>p.v).map(p=>{const len=p.v/tot*CI,s=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${p.c}" stroke-width="18" stroke-dasharray="${len} ${CI-len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${esc(p.l)} ${p.v}</title></circle>`;off+=len;return s}).join(""):"";
return `<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="${esc(label)}"><circle r="${R}" cx="70" cy="70" fill="none" stroke="var(--sf2)" stroke-width="18"/>${arcs}<text class="c" x="70" y="74" text-anchor="middle">${tot}</text><text class="t" x="70" y="92" text-anchor="middle">${esc(label)}</text></svg>
<div class="dl">${parts.map(p=>`<div><i style="background:${p.c}"></i>${esc(p.l)}<b>${p.v}</b></div>`).join("")}</div></div>`}
function hbars(rows,color){const mx=Math.max(1,...rows.map(r=>r[1]));return `<div class="hb">${rows.map(r=>`<div class="r"><span title="${esc(r[0])}">${esc(r[0])}</span><div class="bar"><i style="width:${Math.round(r[1]/mx*100)}%;background:${color||C.ac}"></i></div><b>${r[1]}</b></div>`).join("")}</div>`}
function heat(list){const cats=Object.keys(CAT);let mx=1;const cell={};PL.forEach(p=>cats.forEach(c=>{const n=list.filter(i=>i.place===p&&i.cat===c).length;cell[p+"|"+c]=n;mx=Math.max(mx,n)}));
return `<div class="heat"><div class="row hdr"><span></span>${cats.map(c=>`<span title="${esc(c)}">${CAT[c]}</span>`).join("")}</div>${PL.map(p=>`<div class="row"><span>${esc(p)}</span>${cats.map(c=>{const n=cell[p+"|"+c];return `<i title="${esc(p)} · ${esc(c)}: ${n}" style="${n?`background:color-mix(in srgb,var(--ac) ${Math.round(18+n/mx*70)}%,var(--sf2));color:${n/mx>.5?"#fff":"var(--ink)"}`:"color:var(--mut)"}">${n||"·"}</i>`}).join("")}</div>`).join("")}</div>`}

// ---------- overview ----------
function overV(){const all=items,A=all.filter(i=>!i.draft),op=open_(),L=op.filter(i=>i.kind==="lost"),Fd=op.filter(i=>i.kind==="found"),
mt=pairs(),stale=op.filter(i=>age(i)>=7),dr=all.filter(i=>i.draft),w7=A.filter(i=>age(i)<7).length;
const days=[];for(let d=13;d>=0;d--){const s=new Date();s.setHours(0,0,0,0);s.setDate(s.getDate()-d);const a=s.getTime(),b=a+DAY,
in_=k=>A.filter(i=>{const t=new Date(i.at).getTime();return i.kind===k&&t>=a&&t<b}).length;days.push({l:s.toLocaleDateString("th-TH",{day:"numeric",month:"short"}),lost:in_("lost"),found:in_("found")})}
const kpi=(cls,icon,n,l,d)=>`<div class="kpi"><div class="ic ${cls}">${ic(icon,20)}</div><div class="n">${N(n)}</div><div class="l">${l}</div><div class="d">${d}</div></div>`;
const buckets=[["วันนี้–เมื่อวาน",op.filter(i=>age(i)<2).length],["2–3 วัน",op.filter(i=>age(i)>=2&&age(i)<4).length],["4–6 วัน",op.filter(i=>age(i)>=4&&age(i)<7).length],["7 วันขึ้นไป",stale.length]];
const todo=[];
if(stale.length)todo.push(["w","clock",stale.length,"ค้างเกิน 7 วัน","ติดตามเจ้าของหรือผู้พบ",()=>`jumpItems({st:'',age:7})`]);
if(mt.length)todo.push(["a","link",mt.length,"คู่ที่อาจตรงกัน","ตรวจและช่วยประสานงาน",()=>`setTab('match')`]);
if(dr.length)todo.push(["g","file",dr.length,"ฉบับร่างยังไม่ประกาศ","ผู้ใช้ยังไม่กดประกาศ",()=>`jumpItems({st:'d'})`]);
$("view").innerHTML=`<div class="kpis">${kpi("a","box",all.length,"รายการทั้งหมด",`<b>+${w7}</b> ใน 7 วันล่าสุด`)+kpi("l","help",L.length,"ของหายที่ยังตามหา","ผู้ใช้กำลังรอ")+kpi("f","hand",Fd.length,"ของที่พบรอเจ้าของ","ยังไม่มีผู้มารับ")+kpi("b","link",mt.length,"คู่ที่อาจตรงกัน","จากระบบกฎ")+kpi("w","clock",stale.length,"ค้างเกิน 7 วัน",stale.length?"ควรติดตาม":"ไม่มีรายการค้าง")+kpi("g","file",dr.length,"ฉบับร่าง","ยังไม่ประกาศ")}</div>
<div class="g c21"><div class="card"><div class="hd"><div><h2>รายการใหม่ 14 วันล่าสุด</h2><p class="sub">นับตามวันที่ของหาย/พบ</p></div><div class="leg"><span><i style="background:${C.lost}"></i>ของหาย</span><span><i style="background:${C.found}"></i>ของที่พบ</span></div></div>${areaChart(days)}</div>
<div class="card"><h2>สัดส่วนที่ยังเปิดอยู่</h2><p class="sub">แยกตามสถานะ</p>${donut(ST.slice(0,3).map((s,i)=>({l:s,v:op.filter(x=>x.st===i).length,c:[C.warn,C.blue,C.found][i]})),"รายการ")}
<p class="sub" style="margin:14px 0 0">รายการที่ “คืนแล้ว” ถูกลบออกตามนโยบาย PDPA จึงไม่นับรวม</p></div></div>
<div class="g c3"><div class="card"><h2>ตามสถานที่</h2><p class="sub">รายการที่ยังเปิดอยู่</p>${hbars(PL.map(p=>[p,op.filter(i=>i.place===p).length]).sort((a,b)=>b[1]-a[1]),C.ac)}</div>
<div class="card"><h2>ตามประเภทสิ่งของ</h2><p class="sub">รายการที่ยังเปิดอยู่</p>${hbars(Object.keys(CAT).map(c=>[CAT[c]+" "+c,op.filter(i=>i.cat===c).length]).sort((a,b)=>b[1]-a[1]),C.found)}</div>
<div class="card"><h2>อายุรายการที่ค้าง</h2><p class="sub">นับจากวันที่ของหาย/พบ</p>${hbars(buckets,C.warn)}</div></div>
<div class="g c21"><div class="card"><h2>จุดที่เกิดบ่อย</h2><p class="sub">สถานที่ × ประเภท (สีเข้ม = มาก)</p>${heat(op)}</div>
<div class="card"><h2>ต้องดำเนินการ</h2><p class="sub">สิ่งที่ควรดูก่อน</p>${todo.length?`<div class="todo">${todo.map(t=>`<button onclick="${t[5]()}"><span class="ic ${t[0]}">${ic(t[1],18)}</span><span><b>${t[3]}</b><small>${t[4]}</small></span><span class="n">${t[2]}</span></button>`).join("")}</div>`:'<div class="empty">ไม่มีงานค้าง 🎉</div>'}</div></div>
<div class="card"><div class="hd"><div><h2>รายการล่าสุด</h2><p class="sub">10 รายการที่เพิ่งเกิดขึ้น</p></div><button class="btn sm" onclick="setTab('items')">ดูทั้งหมด ${ic("next",14)}</button></div>${tbl(all.slice(0,10),false)}</div>`}
function jumpItems(o){Object.assign(F,{q:"",kind:"",st:o.st||"",place:"",cat:"",page:1,minAge:o.age||0,sort:"at",dir:1});tab="items";sel.clear();view()}

// ---------- items table ----------
function tbl(rows,full){if(!rows.length)return '<div class="empty">ไม่พบรายการ</div>';
return `<div class="tw"><table><thead><tr>${full?`<th><input type="checkbox" aria-label="เลือกทั้งหน้า" id="all" onchange="togAll(this.checked)"></th>`:""}${full?hd("name","ชื่อสิ่งของ"):"<th>ชื่อสิ่งของ</th>"}${full?hd("kind","ชนิด"):"<th>ชนิด</th>"}${full?hd("cat","ประเภท"):"<th>ประเภท</th>"}${full?hd("place","สถานที่"):"<th>สถานที่</th>"}${full?hd("st","สถานะ"):"<th>สถานะ</th>"}${full?hd("at","วันที่"):"<th>วันที่</th>"}<th></th></tr></thead><tbody>${rows.map(i=>`<tr class="${sel.has(i.id)?"sel":""}">${full?`<td><input type="checkbox" aria-label="เลือก ${esc(i.name)}" ${sel.has(i.id)?"checked":""} onchange="tog(${i.id},this.checked)"></td>`:""}<td class="nm">${thumb(i)}<b title="${esc(i.name)}">${esc(i.name)}</b></td><td>${kindPill(i.kind)}</td><td>${esc(i.cat)}</td><td>${esc(i.place)}</td><td>${stPill(i)}${!i.draft&&i.st<3&&age(i)>=7?' <span class="pill old" title="ค้างเกิน 7 วัน">'+age(i)+" วัน</span>":""}</td><td title="${esc(fd(i.at))}">${rel(i.at)}</td><td><button class="btn sm" onclick="openDr(${i.id})">รายละเอียด</button></td></tr>`).join("")}</tbody></table></div>`}
const hd=(k,t)=>`<th class="s" onclick="sortBy('${k}')" aria-sort="${F.sort===k?(F.dir>0?"ascending":"descending"):"none"}">${t}<span class="ar">${F.sort===k?(F.dir>0?"▲":"▼"):"↕"}</span></th>`;
function sortBy(k){if(F.sort===k)F.dir*=-1;else{F.sort=k;F.dir=1}F.page=1;drawTbl()}
function filtered(){const q=F.q.trim().toLowerCase();
let r=items.filter(i=>(!F.kind||i.kind===F.kind)&&(!F.place||i.place===F.place)&&(!F.cat||i.cat===F.cat)&&
(!F.st||(F.st==="d"?i.draft:!i.draft&&i.st===+F.st))&&(!F.minAge||(!i.draft&&i.st<3&&age(i)>=F.minAge))&&
(!q||(i.name+" "+i.desc+" "+i.cat+" "+i.place+" "+i.contact).toLowerCase().indexOf(q)>-1));
const k=F.sort;r.sort((a,b)=>{let x=a[k],y=b[k];if(k==="at"){x=new Date(x);y=new Date(y)}else if(typeof x==="string")return x.localeCompare(y,"th")*F.dir;return(x>y?1:x<y?-1:0)*F.dir});return r}
function opt(a,v,all){return(all?`<option value="">${all}</option>`:"")+a.map(x=>`<option value="${esc(x[0])}"${String(x[0])===String(v)?" selected":""}>${esc(x[1])}</option>`).join("")}
function itemsV(keep){
if(!keep||!$("tbl"))$("view").innerHTML=`<div class="tools"><div class="s">${ic("search",16)}<input id="q" type="search" placeholder="ค้นหาชื่อ รายละเอียด สถานที่ ช่องทางติดต่อ" value="${esc(F.q)}" oninput="F.q=this.value;F.page=1;drawTbl()" aria-label="ค้นหา"></div>
<select onchange="F.kind=this.value;F.page=1;drawTbl()" aria-label="ชนิด">${opt([["lost","ของหาย"],["found","ของที่พบ"]],F.kind,"ทุกชนิด")}</select>
<select onchange="F.st=this.value;F.page=1;drawTbl()" aria-label="สถานะ">${opt([["0","กำลังตามหา"],["1","พบแล้ว"],["2","ติดต่อแล้ว"],["d","ฉบับร่าง"]],F.st,"ทุกสถานะ")}</select>
<select onchange="F.place=this.value;F.page=1;drawTbl()" aria-label="สถานที่">${opt(PL.map(p=>[p,p]),F.place,"ทุกสถานที่")}</select>
<select onchange="F.cat=this.value;F.page=1;drawTbl()" aria-label="ประเภท">${opt(Object.keys(CAT).map(p=>[p,p]),F.cat,"ทุกประเภท")}</select>
<button class="btn" onclick="clearF()">ล้าง</button><button class="btn" onclick="exportCsv()">${ic("dl",16)} ส่งออก CSV</button></div><div id="bulk"></div><div id="tbl"></div>`;
drawTbl()}
function clearF(){Object.assign(F,{q:"",kind:"",st:"",place:"",cat:"",page:1,minAge:0});itemsV()}
let pageIds=[];
function drawTbl(){const r=filtered(),pages=Math.max(1,Math.ceil(r.length/PER));if(F.page>pages)F.page=pages;
const rows=r.slice((F.page-1)*PER,F.page*PER);pageIds=rows.map(i=>i.id);
$("tbl").innerHTML=tbl(rows,true)+`<div class="pager"><span>พบ ${N(r.length)} รายการ${F.minAge?` · เฉพาะที่ค้างเกิน ${F.minAge} วัน`:""}</span><div><button class="btn sm" ${F.page<=1?"disabled":""} onclick="pg(-1)" aria-label="ก่อนหน้า">${ic("prev",14)}</button><span style="align-self:center">หน้า ${F.page} / ${pages}</span><button class="btn sm" ${F.page>=pages?"disabled":""} onclick="pg(1)" aria-label="ถัดไป">${ic("next",14)}</button></div></div>`;
const a=$("all");if(a){a.checked=rows.length>0&&rows.every(i=>sel.has(i.id));}
drawBulk()}
function pg(d){F.page+=d;drawTbl()}
function tog(id,on){on?sel.add(id):sel.delete(id);drawTbl()}
function togAll(on){pageIds.forEach(id=>on?sel.add(id):sel.delete(id));drawTbl()}
function drawBulk(){const b=$("bulk");if(!b)return;if(!sel.size){b.innerHTML="";return}
b.innerHTML=`<div class="bulk"><b>เลือกแล้ว ${sel.size} รายการ</b><button class="btn sm" onclick="bulkAdv()">${ic("check",14)} เลื่อนสถานะ</button><button class="btn sm" onclick="exportCsv(true)">${ic("dl",14)} ส่งออกที่เลือก</button><button class="btn sm bad" onclick="bulkDel()">${ic("trash",14)} ลบ</button><button class="btn sm" onclick="sel.clear();drawTbl()">ยกเลิกเลือก</button></div>`}

// ---------- actions ----------
async function bulkAdv(){const ids=[...sel].map(get).filter(i=>i&&!i.draft&&i.st<2);
if(!ids.length){toast("ไม่มีรายการที่เลื่อนได้ (ต้องไม่ใช่ฉบับร่าง และยังไม่ถึง “ติดต่อแล้ว”)");return}
if(!await ask("เลื่อนสถานะ",`เลื่อนสถานะไปอีก 1 ขั้น ให้ ${ids.length} รายการ`,"เลื่อนสถานะ"))return;
let fail=0;for(const s of [0,1]){const g=ids.filter(i=>i.st===s).map(i=>i.id);if(!g.length)continue;
const r=await sb.from("items").update({st:s+1}).in("id",g).select();if(r.error||r.data.length!==g.length)fail++;else r.data.forEach(n=>{items[items.findIndex(x=>x.id===n.id)]=n})}
sel.clear();toast(fail?"เลื่อนสถานะบางรายการไม่สำเร็จ (ตรวจสิทธิ์ใน Supabase)":"เลื่อนสถานะแล้ว");view()}
async function bulkDel(){const ids=[...sel];if(!await ask("ลบรายการ",`ลบ ${ids.length} รายการถาวร ย้อนกลับไม่ได้`,"ลบถาวร",true))return;await delIds(ids)}
async function delIds(ids){const r=await sb.from("items").delete().in("id",ids).select();
if(r.error||!r.data.length){toast("ลบไม่สำเร็จ: "+(r.error?r.error.message:"ไม่มีสิทธิ์ (รัน admin-setup.sql ใน Supabase หรือยัง?)"));return}
const gone=new Set(r.data.map(x=>x.id));items=items.filter(i=>!gone.has(i.id));gone.forEach(id=>sel.delete(id));closeDr();
toast(`ลบแล้ว ${gone.size} รายการ`+(gone.size<ids.length?` (ลบไม่ได้ ${ids.length-gone.size})`:""));view()}
function exportCsv(onlySel){const rows=onlySel?items.filter(i=>sel.has(i.id)):filtered();
const cols=[["id","รหัส"],["kind","ชนิด"],["name","ชื่อ"],["cat","ประเภท"],["place","สถานที่"],["st","สถานะ"],["at","วันที่"],["desc","รายละเอียด"],["contact","ช่องทางติดต่อ"],["draft","ฉบับร่าง"]];
const q=v=>{v=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
const val=(i,k)=>k==="kind"?(i.kind==="lost"?"ของหาย":"ของที่พบ"):k==="st"?ST[i.st]:k==="draft"?(i.draft?"ใช่":"ไม่"):i[k];
const csv="﻿"+cols.map(c=>q(c[1])).join(",")+"\n"+rows.map(i=>cols.map(c=>q(val(i,c[0]))).join(",")).join("\n");
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="lost-found-"+new Date().toISOString().slice(0,10)+".csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`ส่งออก ${rows.length} รายการแล้ว`)}

// ---------- matches ----------
function matchV(){const ps=pairs().sort((a,b)=>new Date(b.l.at)-new Date(a.l.at));
$("view").innerHTML=ps.length?ps.map(p=>`<div class="m-card"><div class="it">${thumb(p.l)}<div><b>${esc(p.l.name)}</b><small>${kindPill("lost")} ${esc(p.l.place)} · ${rel(p.l.at)}</small></div></div>
<div class="mid"><span>${ic("link",20)}</span><span>${p.l.place===p.f.place?"สถานที่ตรงกัน":"ชื่อคล้ายกัน"}</span></div>
<div class="it">${thumb(p.f)}<div><b>${esc(p.f.name)}</b><small>${kindPill("found")} ${esc(p.f.place)} · ${rel(p.f.at)}</small></div></div>
<div style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" onclick="openDr(${p.l.id})">ดูของหาย</button><button class="btn sm" onclick="openDr(${p.f.id})">ดูของที่พบ</button></div></div>`).join(""):'<div class="card empty">ยังไม่มีรายการที่อาจตรงกัน</div>'}

// ---------- drawer ----------
function openDr(id){openId=id;editing=false;editImg=undefined;drawDr();$("ov").classList.add("on");$("dr").classList.add("on")}
function closeDr(){openId=null;editing=false;editImg=undefined;$("ov").classList.remove("on");$("dr").classList.remove("on")}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if($("cf").classList.contains("on"))$("cfn").click();else closeDr()}});
function drawDr(){const i=get(openId);if(!i){closeDr();return}const d=$("dr");
if(editing){d.innerHTML=`<header><h2>แก้ไขรายการ</h2><button class="ib" onclick="editing=false;editImg=undefined;drawDr()" aria-label="ปิดฟอร์ม">${ic("x")}</button></header><div class="bd"><div class="fm">
<label>รูปภาพ<input type="file" accept="image/*" onchange="pickImg(this)"></label><div class="ip" id="ip"></div>
<label>ชื่อสิ่งของ<input id="en" maxlength="80" value="${esc(i.name)}"></label>
<div class="r2"><label>ประเภท<select id="ec">${opt(Object.keys(CAT).map(p=>[p,p]),i.cat)}</select></label><label>สถานที่<select id="ep">${opt(PL.map(p=>[p,p]),i.place)}</select></label></div>
<div class="r2"><label>สถานะ<select id="es">${opt(ST.slice(0,3).map((s,k)=>[k,s]),i.st)}</select></label><label>การเผยแพร่<select id="ed">${opt([["0","ประกาศแล้ว"],["1","ฉบับร่าง"]],i.draft?"1":"0")}</select></label></div>
<label>วันที่และเวลา<input id="ea" type="datetime-local" value="${new Date(new Date(i.at).getTime()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16)}"></label>
<label>รายละเอียด<textarea id="ex" rows="4" maxlength="500">${esc(i.desc)}</textarea></label>
<label>ช่องทางติดต่อ<input id="et" maxlength="60" value="${esc(i.contact)}"></label></div></div>
<div class="ft"><button class="btn pri" onclick="saveEdit()">บันทึก</button><button class="btn" onclick="editing=false;editImg=undefined;drawDr()">ยกเลิก</button></div>`;prevImg();return}
const ms=items.filter(o=>o.id!==i.id&&!o.draft&&o.st<3&&match(i,o));
d.innerHTML=`<header><h2>${esc(i.name)}</h2><button class="ib" onclick="closeDr()" aria-label="ปิด">${ic("x")}</button></header><div class="bd">
<div class="ph">${i.img?`<img src="${esc(i.img)}" alt="${esc(i.name)}">`:CAT[i.cat]||"📦"}</div>
<div>${kindPill(i.kind)} ${stPill(i)} ${!i.draft&&i.st<3&&age(i)>=7?`<span class="pill old">ค้าง ${age(i)} วัน</span>`:""}</div>
<div class="steps">${ST.map((s,k)=>`<div class="${k<=i.st?"d":""}">${s}</div>`).join("")}</div>
<dl><dt>ประเภท</dt><dd>${esc(i.cat)}</dd><dt>สถานที่</dt><dd>${esc(i.place)}</dd><dt>วันที่</dt><dd>${esc(fd(i.at))}</dd><dt>รายละเอียด</dt><dd>${esc(i.desc)}</dd><dt>ติดต่อ</dt><dd><b>${esc(i.contact)}</b></dd><dt>รหัสรายการ</dt><dd>#${i.id}</dd></dl>
${ms.length?`<div class="rel"><b>รายการที่อาจตรงกัน (${ms.length})</b>${ms.map(o=>`<a onclick="openDr(${o.id})">${CAT[o.cat]||""} ${esc(o.name)} · ${esc(o.place)}</a>`).join("")}</div>`:""}</div>
<div class="ft"><button class="btn" onclick="startEdit()">${ic("edit",16)} แก้ไข</button>${!i.draft&&i.st<2?`<button class="btn pri" onclick="advOne(${i.id})">เลื่อนเป็น “${ST[i.st+1]}”</button>`:""}${!i.draft&&i.st===2?`<button class="btn pri" onclick="returned(${i.id})">คืนของแล้ว (ลบรายการ)</button>`:""}<button class="btn bad" onclick="delOne(${i.id})">${ic("trash",16)} ลบ</button></div>`}
function startEdit(){editing=true;editImg=undefined;drawDr()}
function prevImg(){const i=get(openId),cur=editImg===undefined?i.img:editImg,b=$("ip");if(!b)return;
b.innerHTML=cur?`<img src="${esc(cur)}" alt="ตัวอย่างรูป"><button class="btn sm bad" type="button" onclick="editImg=null;prevImg()">ลบรูป</button>`:'<span class="upd">ไม่มีรูป</span>'}
function pickImg(el){const fl=el.files[0];if(!fl)return;
const bad=m=>{toast(m);el.value=""};
if(!/^image\/(jpeg|png|webp|gif)$/.test(fl.type)){bad("รองรับเฉพาะไฟล์รูป JPG, PNG, WEBP หรือ GIF");return}
if(fl.size>8*1048576){bad("ไฟล์ใหญ่เกิน 8 MB");return}
const rd=new FileReader();rd.onload=()=>{const im=new Image();
im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);editImg=c.toDataURL("image/jpeg",.8);prevImg()};
im.onerror=()=>bad("เปิดไฟล์รูปไม่ได้ ลองไฟล์อื่น");im.src=rd.result};
rd.onerror=()=>bad("อ่านไฟล์ไม่สำเร็จ");rd.readAsDataURL(fl)}
async function saveEdit(){const id=openId,n=$("en").value.trim(),t=$("et").value.trim();if(!n||!t){toast("ชื่อสิ่งของและช่องทางติดต่อต้องไม่ว่าง");return}
const row={name:n,cat:$("ec").value,place:$("ep").value,st:+$("es").value,draft:$("ed").value==="1",at:new Date($("ea").value||Date.now()).toISOString(),desc:$("ex").value.trim()||"ไม่มีรายละเอียดเพิ่มเติม",contact:t};
if(editImg!==undefined)row.img=editImg;
const r=await sb.from("items").update(row).eq("id",id).select().single();if(r.error){toast("บันทึกไม่สำเร็จ: "+r.error.message);return}
items[items.findIndex(x=>x.id===id)]=r.data;editing=false;editImg=undefined;toast("บันทึกแล้ว");drawDr();view(true)}
async function advOne(id){const i=get(id),r=await sb.from("items").update({st:i.st+1}).eq("id",id).select().single();if(r.error){toast("อัปเดตไม่สำเร็จ: "+r.error.message);return}
items[items.findIndex(x=>x.id===id)]=r.data;toast("อัปเดตสถานะแล้ว");drawDr();view(true)}
async function returned(id){if(!await ask("คืนของแล้ว","รายการจะถูกลบออกจากระบบตามนโยบาย PDPA","ยืนยัน"))return;await delIds([id])}
async function delOne(id){if(!await ask("ลบรายการ","ลบรายการนี้ถาวร ย้อนกลับไม่ได้","ลบถาวร",true))return;await delIds([id])}
start();
