var ST=["กำลังตามหา","พบแล้ว","ติดต่อแล้ว","คืนแล้ว"];
var CAT={"โทรศัพท์":"📱","กระเป๋า":"👜","กุญแจ":"🔑","บัตรนักศึกษา":"🪪","อื่น ๆ":"📦"};
var PL=["ห้องเรียน","โรงอาหาร","ห้องสมุด","ลานจอดรถ","อาคารกิจกรรม","สนามกีฬา"];
function ago(d,h){var t=new Date();t.setDate(t.getDate()-d);t.setHours(h,0,0,0);return t.toISOString()}
var sb=supabase.createClient("https://htxdnqhzyaxuvomziqzr.supabase.co","sb_publishable_AyNg4TJiuiw54uEsaq7kcQ_Sns--xgk");
var items=[],uid=null,notes=[],view="feed",f={q:"",cat:"",place:"",kind:""},mode="lost",img=null,unread=0;
try{var sv=localStorage.getItem("slf4");if(sv)notes=JSON.parse(sv).notes||[]}catch(e){}
function save(){try{localStorage.setItem("slf4",JSON.stringify({notes:notes}))}catch(e){}}
function fix(x){x.mine=x.owner===uid?1:0;return x}
async function load(){var r=await sb.from("items").select("*").order("at",{ascending:false});if(r.error){toast("โหลดข้อมูลไม่สำเร็จ: "+r.error.message);return}items=r.data.map(fix)}
async function init(){try{var s=await sb.auth.getSession();if(!s.data.session){var a=await sb.auth.signInAnonymously();if(a.error)throw a.error;uid=a.data.user.id}else uid=s.data.session.user.id;await load()}catch(e){toast("เชื่อมต่อ Supabase ไม่สำเร็จ: "+(e.message||e))}render()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function fd(s){return new Date(s).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+" น."}
function $(i){return document.getElementById(i)}
function rel(s){var m=Math.round((Date.now()-new Date(s))/6e4);if(m<1)return"เมื่อสักครู่";if(m<60)return m+" นาทีที่แล้ว";var h=Math.round(m/60);if(h<24)return h+" ชม.ที่แล้ว";return Math.round(h/24)+" วันที่แล้ว"}
function mp(i){var n=items.filter(function(o){return o.st<3&&match(i,o)}).length;return n?' <span class="tag mt">✨ อาจตรง '+n+'</span>':''}
function cp(id){var i=get(id),e=function(){toast("คัดลอกไม่สำเร็จ ลองเลือกข้อความด้วยตนเอง")};try{navigator.clipboard.writeText(i.contact).then(function(){toast("คัดลอกช่องทางติดต่อแล้ว")},e)}catch(x){e()}}
function toast(m){var t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(t._h);t._h=setTimeout(function(){t.style.display="none"},2800)}
function go(v,m){view=v;if(m)mode=m;img=null;if(v==="notes")unread=0;render()}
function nav(){var n=[["feed","ค้นหา"],["lost","แจ้งของหาย"],["found","แจ้งของที่พบ"],["mine","ของฉัน"],["notes","แจ้งเตือน"]];
$("nav").innerHTML=n.map(function(x){var on=(view==="form"?mode:view)===x[0];
return '<button class="'+(on?"on":"")+'" onclick="'+(x[0]==="lost"||x[0]==="found"?"go('form','"+x[0]+"')":"go('"+x[0]+"')")+'">'+x[1]+(x[0]==="notes"&&unread?"<b>"+unread+"</b>":"")+"</button>"}).join("")}
function thumb(i){return '<div class="th"'+(i.img?' style="background-image:url('+i.img+')"':"")+">"+(i.img?"":CAT[i.cat]||"📦")+"</div>"}
function bar(s){return '<div class="st" aria-label="สถานะ: '+ST[s]+'">'+ST.map(function(_,k){return '<span class="'+(k<=s?"d":"")+'"></span>'}).join("")+"</div>"}
function card(i){return '<button class="c '+i.kind+'" onclick="openD('+i.id+')">'+thumb(i)+'<div class="cb"><span class="tag '+i.kind+'">'+(i.kind==="lost"?"ของหาย":"พบของ")+'</span> <span class="m">'+ST[i.st]+'</span>'+mp(i)+(i.draft?' <span class="tag mt">ฉบับร่าง</span>':'')+'<h3>'+esc(i.name)+'</h3><div class="m">📍 '+esc(i.place)+" · "+rel(i.at)+"</div>"+bar(i.st)+"</div></button>"}
function feed(){
var n=function(k){return items.filter(function(i){return !i.draft&&(k==='r'?i.st===3:k==='l'?i.kind==='lost'&&i.st<3:i.kind==='found'&&i.st<3)}).length};
var h='<div class="hero"><h1>ของหายในมหาวิทยาลัย ตามหาได้ที่เดียว</h1><p>ค้นหาของที่ทำหาย หรือดูว่ามีใครพบของที่ตรงกันหรือยัง</p><div class="stats"><span><b>'+n('l')+'</b> กำลังตามหา</span><span><b>'+n('f')+'</b> รอเจ้าของ</span><span><b>'+n('r')+'</b> คืนแล้ว</span></div><div class="cta"><button class="pri y" onclick="go(\'form\',\'lost\')">📢 แจ้งของหาย</button><button class="pri w" onclick="go(\'form\',\'found\')">🔍 แจ้งของที่พบ</button></div></div>';
h+='<div class="f"><input id="q" type="search" placeholder="ค้นหา เช่น โทรศัพท์ กุญแจ บัตรนักศึกษา" value="'+esc(f.q)+'" oninput="f.q=this.value;list()"><select onchange="f.place=this.value;list()"><option value="">ทุกสถานที่</option>'+PL.map(function(c){return "<option"+(f.place===c?" selected":"")+">"+c+"</option>"}).join("")+"</select></div>";
h+='<div class="f" style="grid-template-columns:1fr 1fr"><select onchange="f.when=this.value;list()">'+[["","ทุกช่วงเวลา"],["1","วันนี้"],["7","7 วันล่าสุด"]].map(function(o){return '<option value="'+o[0]+'"'+(f.when===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select><select onchange="f.st=this.value;list()">'+[["","ทุกสถานะ"],["0","กำลังตามหา"],["1","พบแล้ว"],["2","ติดต่อแล้ว"]].map(function(o){return '<option value="'+o[0]+'"'+(f.st===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></div>';
h+='<div class="seg">'+Object.keys(CAT).map(function(c){return '<button class="'+(f.cat===c?'on':'')+'" onclick="f.cat=f.cat===\''+c+'\'?\'\':\''+c+'\';render()">'+CAT[c]+' '+c+'</button>'}).join('')+'</div>';
h+='<div class="seg">'+[["","ทั้งหมด"],["lost","ของหาย"],["found","ของที่พบ"]].map(function(k){return '<button class="'+(f.kind===k[0]?"on":"")+'" onclick="f.kind=\''+k[0]+'\';render()">'+k[1]+"</button>"}).join("")+'</div><div class="rc"><span id="cnt"></span><button class="sec sm" onclick="f={q:\'\',cat:\'\',place:\'\',kind:\'\'};render()">ล้างตัวกรอง</button></div><div class="g" id="lst"></div>';
$("app").innerHTML=h;list()}
function list(){var q=f.q.trim().toLowerCase();
var r=items.filter(function(i){return i.st<3&&!i.draft&&(!f.kind||i.kind===f.kind)&&(!f.cat||i.cat===f.cat)&&(!f.place||i.place===f.place)&&(!f.when||Date.now()-new Date(i.at)<=f.when*864e5)&&(!f.st||i.st===+f.st)&&(!q||(i.name+i.desc+i.cat+i.place+ST[i.st]).toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return new Date(b.at)-new Date(a.at)});
$("cnt").textContent="พบ "+r.length+" รายการ";$("lst").innerHTML=r.length?r.map(card).join(""):'<div class="em" style="grid-column:1/-1">ไม่พบรายการที่ตรงกัน ลองเปลี่ยนคำค้นหา หรือแจ้งของหายเพื่อให้คนอื่นช่วยตามหา<br><br><button class="pri" onclick="go(\'form\',\'lost\')">แจ้งของหาย</button></div>'}
function form(){var L=mode==="lost",now=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
$("app").innerHTML='<h1>'+(L?"แจ้งของหาย":"แจ้งของที่พบ")+'</h1><p class="s">'+(L?"กรอกรายละเอียดแล้วประกาศให้ทุกคนช่วยกันตามหา":"ลงข้อมูลของที่พบ เพื่อให้เจ้าของค้นเจอและติดต่อกลับได้")+'</p><div class="fm">'+
'<label>รูปภาพ<input type="file" accept="image/*" onchange="pick(this)"></label><div id="pv"></div>'+
'<label>ชื่อสิ่งของ<input id="n" placeholder="เช่น iPhone เคสสีฟ้า"></label>'+
'<div class="r2"><label>ประเภท<select id="c">'+Object.keys(CAT).map(function(c){return "<option>"+c+"</option>"}).join("")+'</select></label><label>สถานที่<select id="p">'+PL.map(function(c){return "<option>"+c+"</option>"}).join("")+'</select></label></div>'+
'<label>วันที่และเวลา<input id="d" type="datetime-local" value="'+now+'"></label>'+
'<label>รายละเอียด<textarea id="x" rows="3" placeholder="ลักษณะเด่น สี รอยตำหนิ"></textarea></label>'+
'<label>ช่องทางติดต่อ<input id="t" placeholder="เบอร์โทร หรือ LINE ID"></label>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="pri" onclick="submit()">ประกาศ'+(L?"ของหาย":"ของที่พบ")+'</button><button class="sec" onclick="submit(1)">บันทึกฉบับร่าง</button></div></div>';
$("n").focus()}
function pick(el){var fl=el.files[0];if(!fl)return;var r=new FileReader();r.onload=function(){img=r.result;$("pv").innerHTML='<img src="'+img+'" alt="ตัวอย่างรูป" style="max-width:160px;border-radius:10px">'};r.readAsDataURL(fl)}
function words(s){return s.toLowerCase().split(/\s+/).filter(function(w){return w.length>1})}
function match(a,b){if(a.draft||b.draft||a.kind===b.kind||a.cat!==b.cat)return false;if(a.place===b.place)return true;var w=words(a.name);return w.some(function(x){return b.name.toLowerCase().indexOf(x)>-1})}
async function submit(dr){var n=$("n").value.trim(),t=$("t").value.trim();
if(!n){toast("กรุณากรอกชื่อสิ่งของ");$("n").focus();return}
if(!t){toast("กรุณาระบุช่องทางติดต่อ");$("t").focus();return}
var r=await sb.from("items").insert({kind:mode,name:n,cat:$("c").value,place:$("p").value,at:new Date($("d").value||Date.now()).toISOString(),desc:$("x").value.trim()||"ไม่มีรายละเอียดเพิ่มเติม",contact:t,st:mode==="lost"?0:1,img:img,draft:!!dr}).select().single();
if(r.error){toast("บันทึกไม่สำเร็จ: "+r.error.message);return}
var it=fix(r.data);
var ms=items.filter(function(o){return o.st<3&&match(it,o)});items.push(it);
ms.forEach(function(o){notes.unshift({a:it.id,b:o.id});unread++});
save();f={q:"",cat:"",place:"",kind:""};go(dr?"mine":"feed");
toast(dr?"บันทึกฉบับร่างแล้ว (ดูในแท็บของฉัน)":ms.length?"ประกาศแล้ว พบ "+ms.length+" รายการที่อาจตรงกัน (ดูในแจ้งเตือน)":"ประกาศเรียบร้อยแล้ว")}
function get(i){return items.filter(function(x){return x.id===i})[0]}
function openD(id){var i=get(id);if(!i)return;
var ms=items.filter(function(o){return o.st<3&&match(i,o)});
$("md").innerHTML=thumb(i)+'<div class="cb"><span class="tag '+i.kind+'">'+(i.kind==="lost"?"ของหาย":"พบของ")+'</span><h2 style="margin-top:6px">'+esc(i.name)+'</h2>'+
'<div class="flow">'+ST.map(function(s,k){return '<div class="'+(k<=i.st?"d":"")+'">'+s+"</div>"}).join("")+'</div>'+
'<dl><dt>ประเภท</dt><dd>'+esc(i.cat)+'</dd><dt>สถานที่</dt><dd>'+esc(i.place)+'</dd><dt>วันที่และเวลา</dt><dd>'+fd(i.at)+'</dd><dt>รายละเอียด</dt><dd>'+esc(i.desc)+'</dd></dl>'+
'<div class="ct"><div class="m">ติดต่อ'+(i.kind==="lost"?"เจ้าของ":"ผู้พบของ")+'</div><b>'+esc(i.contact)+'</b></div>'+
(ms.length?'<p class="m">รายการที่อาจตรงกัน: '+ms.map(function(o){return '<a href="#" onclick="openD('+o.id+');return false">'+esc(o.name)+"</a>"}).join(", ")+"</p>":"")+
'<div style="display:flex;gap:8px;flex-wrap:wrap">'+(i.draft?'<button class="pri" onclick="pub('+i.id+')">ประกาศเลย</button>':i.st<3?(i.mine?'<button class="pri" onclick="adv('+i.id+')">อัปเดตเป็น “'+ST[i.st+1]+'”</button>':'<span class="m">เฉพาะเจ้าของประกาศที่อัปเดตสถานะได้</span>'):'<span class="m">รายการนี้ปิดแล้ว คืนของเรียบร้อย</span>')+'<button class="sec" onclick="cp('+i.id+')">คัดลอกช่องทางติดต่อ</button><button class="sec" onclick="closeD()">ปิด</button></div></div>';
$("mo").classList.add("on")}
function closeD(){$("mo").classList.remove("on")}
async function pub(id){var i=get(id);var r=await sb.from("items").update({draft:false}).eq("id",id);if(r.error){toast("ประกาศไม่สำเร็จ: "+r.error.message);return}i.draft=false;var ms=items.filter(function(o){return o.st<3&&match(i,o)});ms.forEach(function(o){notes.unshift({a:i.id,b:o.id});unread++});save();closeD();toast(ms.length?"ประกาศแล้ว พบ "+ms.length+" รายการที่อาจตรงกัน":"ประกาศเรียบร้อยแล้ว");render()}
$("mo").addEventListener("click",function(e){if(e.target===this)closeD()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeD()});
async function adv(id){var i=get(id);if(i.st<3){var r=await sb.from("items").update({st:i.st+1}).eq("id",id);if(r.error){toast("อัปเดตไม่สำเร็จ: "+r.error.message);return}i.st++;save();if(i.st===3){closeD();toast("คืนของเรียบร้อย รายการถูกนำออกจากหน้าค้นหาแล้ว")}else{toast("อัปเดตสถานะเป็น “"+ST[i.st]+"” แล้ว");openD(id)}render()}}
function mineV(){var my=items.filter(function(i){return i.mine}).sort(function(a,b){return new Date(b.at)-new Date(a.at)}),dn=my.filter(function(i){return i.st===3&&!i.draft}).length,dr=my.filter(function(i){return i.draft}).length;
$("app").innerHTML='<h1>ของฉัน</h1><p class="s">รายการที่คุณประกาศ ติดตามและอัปเดตสถานะได้ที่นี่ รายการที่คืนแล้วเก็บไว้ในหน้านี้</p><div class="stats kp"><span><b>'+my.length+'</b> ทั้งหมด</span><span><b>'+dn+'</b> คืนแล้ว</span><span><b>'+dr+'</b> ฉบับร่าง</span></div>'+(my.length?'<div class="g" style="margin-top:14px">'+my.map(card).join("")+'</div>':'<div class="em">ยังไม่มีรายการของคุณ กดแจ้งของหายหรือแจ้งของที่พบเพื่อเริ่มต้น</div>')}
function notesV(){var h='<h1>แจ้งเตือน</h1><p class="s">เมื่อมีรายการที่ตรงหรือใกล้เคียงกับที่คุณประกาศ จะแสดงที่นี่</p>';
h+=notes.length?notes.map(function(n){var a=get(n.a),b=get(n.b);if(!a||!b||b.st===3)return"";
return '<div class="nt"><div>ประกาศ “'+esc(a.name)+'” อาจตรงกับ<br><b>'+esc(b.name)+'</b> <span class="m">('+(b.kind==="found"?"พบที่":"หายที่")+" "+esc(b.place)+")</span></div><button class=\"pri\" onclick=\"openD("+b.id+')">ดู</button></div>'}).join(""):'<div class="em">ยังไม่มีการแจ้งเตือน ลองแจ้งของหายหรือของที่พบเพื่อดูการจับคู่</div>';
$("app").innerHTML=h}
function render(){nav();view==="feed"?feed():view==="form"?form():view==="mine"?mineV():notesV()}
document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b||matchMedia("(prefers-reduced-motion:reduce)").matches)return;var r=b.getBoundingClientRect(),s=document.createElement("span"),d=Math.max(r.width,r.height)*2;s.className="rp";s.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";b.appendChild(s);setTimeout(function(){s.remove()},600)});
init();
