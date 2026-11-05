var ST=["กำลังตามหา","พบแล้ว","ติดต่อแล้ว","คืนแล้ว"];
var CAT={"โทรศัพท์":"📱","กระเป๋า":"👜","กุญแจ":"🔑","บัตรนักศึกษา":"🪪","อื่น ๆ":"📦"};
var PL=["ห้องเรียน","โรงอาหาร","ห้องสมุด","ลานจอดรถ","อาคารกิจกรรม","สนามกีฬา"];
function ago(d,h){var t=new Date();t.setDate(t.getDate()-d);t.setHours(h,0,0,0);return t.toISOString()}
var sb=supabase.createClient("https://htxdnqhzyaxuvomziqzr.supabase.co","sb_publishable_AyNg4TJiuiw54uEsaq7kcQ_Sns--xgk");
var items=[],uid=null,notes=[],view="feed",f={q:"",cat:"",place:"",kind:""},mode="lost",img=null,seen=[],editId=null;
try{var sv=localStorage.getItem("slf4");if(sv)seen=JSON.parse(sv).seen||[]}catch(e){}
function save(){try{localStorage.setItem("slf4",JSON.stringify({seen:seen}))}catch(e){}}
function pairs(){var o=[];items.forEach(function(a){if(!a.mine||a.draft||a.st>2)return;items.forEach(function(b){if(b.id!==a.id&&b.st<3&&match(a,b))o.push({a:a.id,b:b.id,k:a.id+"-"+b.id})})});return o}
function unreadN(){return pairs().filter(function(p){return seen.indexOf(p.k)<0}).length}
function markSeen(){pairs().forEach(function(p){if(seen.indexOf(p.k)<0)seen.push(p.k)});save()}
function fix(x){x.mine=x.owner===uid?1:0;return x}
async function load(){var r=await sb.from("items").select("*").order("at",{ascending:false});if(r.error){toast("โหลดข้อมูลไม่สำเร็จ: "+r.error.message);return}items=r.data.map(fix)}
async function init(){try{var s=await sb.auth.getSession();if(!s.data.session){var a=await sb.auth.signInAnonymously();if(a.error)throw a.error;setMe(a.data.user)}else setMe(s.data.session.user);await load()}catch(e){toast("เชื่อมต่อ Supabase ไม่สำเร็จ: "+(e.message||e))}render()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function fd(s){return new Date(s).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+" น."}
function $(i){return document.getElementById(i)}
function rel(s){var m=Math.round((Date.now()-new Date(s))/6e4);if(m<1)return"เมื่อสักครู่";if(m<60)return m+" นาทีที่แล้ว";var h=Math.round(m/60);if(h<24)return h+" ชม.ที่แล้ว";return Math.round(h/24)+" วันที่แล้ว"}
function mp(i){if(i.st>2||i.draft)return'';var n=items.filter(function(o){return o.st<3&&match(i,o)}).length;return n?' <span class="tag mt">✨ อาจตรง '+n+'</span>':''}
function cp(id){var i=get(id),e=function(){toast("คัดลอกไม่สำเร็จ ลองเลือกข้อความด้วยตนเอง")};try{navigator.clipboard.writeText(i.contact).then(function(){toast("คัดลอกช่องทางติดต่อแล้ว")},e)}catch(x){e()}}
function toast(m){var t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(t._h);t._h=setTimeout(function(){t.style.display="none"},2800)}
function go(v,m){view=v;if(m)mode=m;img=null;editId=null;if(v==="notes")markSeen();render()}
function nav(){acc();var n=[["feed","ค้นหา"],["lost","แจ้งของหาย"],["found","แจ้งของที่พบ"],["mine","ของฉัน"],["notes","แจ้งเตือน"]];
$("nav").innerHTML=n.map(function(x){var on=(view==="form"?mode:view)===x[0];
return '<button class="'+(on?"on":"")+'" onclick="'+(x[0]==="lost"||x[0]==="found"?"go('form','"+x[0]+"')":"go('"+x[0]+"')")+'">'+x[1]+(x[0]==="notes"&&unreadN()?"<b>"+unreadN()+"</b>":"")+"</button>"}).join("")}
function thumb(i){var em=CAT[i.cat]||"📦";if(!i.img)return '<div class="th">'+em+"</div>";var u=String(i.img).replace(/"/g,"%22").replace(/'/g,"%27").replace(/\)/g,"%29").replace(/\(/g,"%28");return '<div class="th has" style="--u:url(\''+u+'\')"><img src="'+u+'" alt="'+esc(i.name||"รูปสิ่งของ")+'" loading="lazy" onerror="this.parentNode.classList.remove(\'has\');this.parentNode.removeAttribute(\'style\');this.parentNode.textContent=\''+em+'\'"></div>'}
function bar(s){return '<div class="st" aria-label="สถานะ: '+ST[s]+'">'+ST.map(function(_,k){return '<span class="'+(k<=s?"d":"")+'"></span>'}).join("")+"</div>"}
function card(i){return '<button class="c '+i.kind+'" onclick="openD('+i.id+')">'+thumb(i)+'<div class="cb"><span class="tag '+i.kind+'">'+(i.kind==="lost"?"ของหาย":"พบของ")+'</span> <span class="m">'+ST[i.st]+'</span>'+mp(i)+(i.draft?' <span class="tag mt">ฉบับร่าง</span>':'')+'<h3>'+esc(i.name)+'</h3><div class="m">📍 '+esc(i.place)+" · "+rel(i.at)+"</div>"+bar(i.st)+"</div></button>"}
function feed(){
var n=function(k){return items.filter(function(i){return !i.draft&&(k==='r'?i.st===3:k==='l'?i.kind==='lost'&&i.st<3:i.kind==='found'&&i.st<3)}).length};
var h='<div class="hero"><h1>ของหายในมหาวิทยาลัย ตามหาได้ที่เดียว</h1><p>ค้นหาของที่ทำหาย หรือดูว่ามีใครพบของที่ตรงกันหรือยัง</p><div class="stats"><span><b>'+n('l')+'</b> กำลังตามหา</span><span><b>'+n('f')+'</b> รอเจ้าของ</span></div><div class="cta"><button class="pri y" onclick="go(\'form\',\'lost\')">📢 แจ้งของหาย</button><button class="pri w" onclick="go(\'form\',\'found\')">🔍 แจ้งของที่พบ</button></div></div>';
h+='<div class="f"><input id="q" type="search" placeholder="ค้นหา เช่น โทรศัพท์ กุญแจ บัตรนักศึกษา" value="'+esc(f.q)+'" oninput="f.q=this.value;list()"><select onchange="f.place=this.value;list()"><option value="">ทุกสถานที่</option>'+PL.map(function(c){return "<option"+(f.place===c?" selected":"")+">"+c+"</option>"}).join("")+"</select></div>";
h+='<div class="f" style="grid-template-columns:1fr 1fr"><select onchange="f.when=this.value;list()">'+[["","ทุกช่วงเวลา"],["1","วันนี้"],["7","7 วันล่าสุด"]].map(function(o){return '<option value="'+o[0]+'"'+(f.when===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select><select onchange="f.st=this.value;list()">'+[["","ทุกสถานะ"],["0","กำลังตามหา"],["1","พบแล้ว"],["2","ติดต่อแล้ว"]].map(function(o){return '<option value="'+o[0]+'"'+(f.st===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></div>';
h+='<div class="seg">'+Object.keys(CAT).map(function(c){return '<button class="'+(f.cat===c?'on':'')+'" onclick="f.cat=f.cat===\''+c+'\'?\'\':\''+c+'\';render()">'+CAT[c]+' '+c+'</button>'}).join('')+'</div>';
h+='<div class="seg">'+[["","ทั้งหมด"],["lost","ของหาย"],["found","ของที่พบ"]].map(function(k){return '<button class="'+(f.kind===k[0]?"on":"")+'" onclick="f.kind=\''+k[0]+'\';render()">'+k[1]+"</button>"}).join("")+'</div><div class="rc"><span id="cnt"></span><button class="sec sm" onclick="f={q:\'\',cat:\'\',place:\'\',kind:\'\'};render()">ล้างตัวกรอง</button></div><div class="g" id="lst"></div>';
$("app").innerHTML=h;list()}
function list(){var q=f.q.trim().toLowerCase();
var r=items.filter(function(i){return i.st<3&&!i.draft&&(!f.kind||i.kind===f.kind)&&(!f.cat||i.cat===f.cat)&&(!f.place||i.place===f.place)&&(!f.when||Date.now()-new Date(i.at)<=f.when*864e5)&&(!f.st||i.st===+f.st)&&(!q||(i.name+i.desc+i.cat+i.place+ST[i.st]).toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return new Date(b.at)-new Date(a.at)});
$("cnt").textContent="พบ "+r.length+" รายการ";$("lst").innerHTML=r.length?r.map(card).join(""):'<div class="em" style="grid-column:1/-1">ไม่พบรายการที่ตรงกัน ลองเปลี่ยนคำค้นหา หรือแจ้งของหายเพื่อให้คนอื่นช่วยตามหา<br><br><button class="pri" onclick="go(\'form\',\'lost\')">แจ้งของหาย</button></div>'}
function form(){var L=mode==="lost",now=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
$("app").innerHTML='<h1>'+(editId?"แก้ไขฉบับร่าง":L?"แจ้งของหาย":"แจ้งของที่พบ")+'</h1><p class="s">'+(L?"กรอกรายละเอียดแล้วประกาศให้ทุกคนช่วยกันตามหา":"ลงข้อมูลของที่พบ เพื่อให้เจ้าของค้นเจอและติดต่อกลับได้")+'</p><div class="fm">'+
'<label>รูปภาพ<input type="file" accept="image/*" onchange="pick(this)"></label><div id="pv"></div>'+
'<label>ชื่อสิ่งของ<input id="n" maxlength="80" placeholder="เช่น iPhone เคสสีฟ้า"></label>'+
'<div class="r2"><label>ประเภท<select id="c">'+Object.keys(CAT).map(function(c){return "<option>"+c+"</option>"}).join("")+'</select></label><label>สถานที่<select id="p">'+PL.map(function(c){return "<option>"+c+"</option>"}).join("")+'</select></label></div>'+
'<label>วันที่และเวลา<input id="d" type="datetime-local" value="'+now+'"></label>'+
'<label>รายละเอียด <span class="m" style="font-weight:400">(ยิ่งละเอียด AI ยิ่งแม่น · ไม่ต้องใส่เบอร์โทรหรือ LINE ที่นี่ ให้ใส่ในช่องทางติดต่อ)</span><textarea id="x" rows="3" maxlength="500" placeholder="สี ยี่ห้อ รุ่น รอยตำหนิ พวงกุญแจ ของที่อยู่ข้างใน"></textarea></label>'+
'<label>ช่องทางติดต่อ<input id="t" maxlength="60" placeholder="เบอร์โทร หรือ LINE ID"></label>'+
'<label class="ck"><input type="checkbox" id="pd"><span>ข้าพเจ้ายินยอมให้เก็บและแสดงข้อมูลที่กรอก รวมถึงช่องทางติดต่อ เพื่อใช้ตามหาเจ้าของสิ่งของ และจะไม่ใส่เลขบัตรประชาชน ข้อมูลอ่อนไหว หรือเบอร์โทร/LINE ในช่องรายละเอียด (<a href="#" onclick="privacy();return false">อ่านนโยบายความเป็นส่วนตัว</a>)</span></label>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="pri" onclick="submit()">ประกาศ'+(L?"ของหาย":"ของที่พบ")+'</button><button class="sec" onclick="submit(1)">บันทึกฉบับร่าง</button></div></div>';
$("n").focus()}
function pick(el){var fl=el.files[0];if(!fl)return;
var bad=function(m){toast(m);el.value="";img=null;$("pv").innerHTML=""};
if(!/^image\/(jpeg|png|webp|gif)$/.test(fl.type)){bad("รองรับเฉพาะไฟล์รูป JPG, PNG, WEBP หรือ GIF");return}
if(fl.size>8*1048576){bad("ไฟล์ใหญ่เกิน 8 MB");return}
var r=new FileReader();r.onload=function(){var im=new Image();
im.onload=function(){var s=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);img=c.toDataURL("image/jpeg",.8);$("pv").innerHTML='<img src="'+img+'" alt="ตัวอย่างรูป" style="max-width:160px;border-radius:10px">'};
im.onerror=function(){bad("เปิดไฟล์รูปไม่ได้ ลองไฟล์อื่น")};im.src=r.result};
r.onerror=function(){bad("อ่านไฟล์ไม่สำเร็จ")};r.readAsDataURL(fl)}
function words(s){return s.toLowerCase().split(/\s+/).filter(function(w){return w.length>1})}
function match(a,b){if(a.draft||b.draft||a.kind===b.kind||a.cat!==b.cat)return false;if(a.place===b.place)return true;var w=words(a.name);return w.some(function(x){return b.name.toLowerCase().indexOf(x)>-1})}
function editD(id){var i=get(id);if(!i)return;editId=id;mode=i.kind;view="form";closeD();render();
$("n").value=i.name;$("c").value=i.cat;$("p").value=i.place;
$("d").value=new Date(new Date(i.at).getTime()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
$("x").value=i.desc==="ไม่มีรายละเอียดเพิ่มเติม"?"":i.desc;$("t").value=i.contact;img=i.img||null;
if(img)$("pv").innerHTML='<img src="'+img+'" alt="รูปเดิม" style="max-width:160px;border-radius:10px">'}
async function submit(dr){var n=$("n").value.trim(),t=$("t").value.trim();
if(!n){toast("กรุณากรอกชื่อสิ่งของ");$("n").focus();return}
if(!t){toast("กรุณาระบุช่องทางติดต่อ");$("t").focus();return}
if(!$("pd").checked){toast("กรุณาติ๊กยินยอมการเก็บข้อมูลก่อน");$("pd").focus();return}
var row={kind:mode,name:n,cat:$("c").value,place:$("p").value,at:new Date($("d").value||Date.now()).toISOString(),desc:$("x").value.trim()||"ไม่มีรายละเอียดเพิ่มเติม",contact:t,img:img,draft:!!dr};
if(editId){var eid=editId,u=await sb.from("items").update(row).eq("id",eid).select().single();
if(u.error){toast("แก้ไขไม่สำเร็จ: "+u.error.message);return}
var k=items.findIndex(function(x){return x.id===eid});if(k>=0)items[k]=fix(u.data);aiR={};
save();f={q:"",cat:"",place:"",kind:""};go(dr?"mine":"feed");toast(dr?"บันทึกฉบับร่างแล้ว":"ประกาศเรียบร้อยแล้ว");return}
row.st=mode==="lost"?0:1;
var r=await sb.from("items").insert(row).select().single();
if(r.error){toast("บันทึกไม่สำเร็จ: "+r.error.message);return}
var it=fix(r.data);
var ms=items.filter(function(o){return o.st<3&&match(it,o)});items.push(it);
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
'<div style="display:flex;gap:8px;flex-wrap:wrap">'+(i.draft?'<button class="pri" onclick="pub('+i.id+')">ประกาศเลย</button><button class="sec" onclick="editD('+i.id+')">แก้ไข</button>':i.st<3?(i.mine?'<button class="pri" onclick="adv('+i.id+')">อัปเดตเป็น “'+ST[i.st+1]+'”</button>':'<span class="m">เฉพาะเจ้าของประกาศที่อัปเดตสถานะได้</span>'):'<span class="m">รายการนี้ปิดแล้ว คืนของเรียบร้อย</span>')+'<button class="sec" onclick="cp('+i.id+')">คัดลอกช่องทางติดต่อ</button><button class="sec" onclick="closeD()">ปิด</button></div></div>';
$("mo").classList.add("on")}
function closeD(){$("mo").classList.remove("on")}
async function pub(id){var i=get(id);var r=await sb.from("items").update({draft:false}).eq("id",id);if(r.error){toast("ประกาศไม่สำเร็จ: "+r.error.message);return}i.draft=false;var ms=items.filter(function(o){return o.st<3&&match(i,o)});save();closeD();toast(ms.length?"ประกาศแล้ว พบ "+ms.length+" รายการที่อาจตรงกัน":"ประกาศเรียบร้อยแล้ว");render()}
$("mo").addEventListener("click",function(e){if(e.target===this)closeD()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeD()});
async function adv(id){var i=get(id);if(i.st<3){if(i.st===2){var d=await sb.from("items").delete().eq("id",id).select();if(d.error||!d.data.length){toast("ลบไม่สำเร็จ: "+(d.error?d.error.message:"ไม่มีสิทธิ์ลบ (ตรวจสอบ policy ใน Supabase)"));return}items=items.filter(function(x){return x.id!==id});save();closeD();toast("คืนของเรียบร้อย รายการถูกลบออกจากระบบแล้ว");render();return}var r=await sb.from("items").update({st:i.st+1}).eq("id",id);if(r.error){toast("อัปเดตไม่สำเร็จ: "+r.error.message);return}i.st++;save();if(i.st===3){closeD();toast("คืนของเรียบร้อย รายการถูกนำออกจากหน้าค้นหาแล้ว")}else{toast("อัปเดตสถานะเป็น “"+ST[i.st]+"” แล้ว");openD(id)}render()}}
function mineV(){var my=items.filter(function(i){return i.mine}).sort(function(a,b){return new Date(b.at)-new Date(a.at)}),dn=my.filter(function(i){return i.st===3&&!i.draft}).length,dr=my.filter(function(i){return i.draft}).length;
$("app").innerHTML='<h1>ของฉัน</h1><p class="s">รายการที่คุณประกาศ ติดตามและอัปเดตสถานะได้ที่นี่ เมื่อคืนของเรียบร้อย รายการจะถูกลบออกจากระบบเพื่อปกป้องข้อมูลส่วนบุคคล</p><div class="stats kp"><span><b>'+my.length+'</b> ทั้งหมด</span><span><b>'+dr+'</b> ฉบับร่าง</span></div>'+(my.length?'<div class="g" style="margin-top:14px">'+my.map(card).join("")+'</div>':'<div class="em">ยังไม่มีรายการของคุณ กดแจ้งของหายหรือแจ้งของที่พบเพื่อเริ่มต้น</div>')}
function todos(){var o=[];items.forEach(function(i){if(!i.mine||i.st>2)return;
if(i.draft){o.push({id:i.id,txt:'📝 ฉบับร่าง “<b>'+esc(i.name)+'</b>” ยังไม่ได้ประกาศ',btn:'เปิด'});return}
var d=Math.floor((Date.now()-new Date(i.at))/864e5);
if(d>=3)o.push({id:i.id,txt:'⏰ “<b>'+esc(i.name)+'</b>” ค้างที่สถานะ “'+ST[i.st]+'” มา '+d+' วัน อัปเดตหรือยัง?',btn:'อัปเดต'})});return o}
function notesV(){var ps=pairs(),td=todos(),h='<h1>แจ้งเตือน</h1><p class="s">เมื่อมีรายการที่ตรงหรือใกล้เคียงกับที่คุณประกาศ จะแสดงที่นี่ ผลประเมินจาก AI เป็นเพียงคำแนะนำ ควรตรวจสอบกับอีกฝ่ายก่อนส่งมอบของ</p>';
h+=td.map(function(t){return '<div class="nt tdo"><div>'+t.txt+'</div><button class="pri" onclick="openD('+t.id+')">'+t.btn+'</button></div>'}).join("");
h+=ps.length?ps.map(function(p){var a=get(p.a),b=get(p.b);
return '<div class="nt ai"><div class="nb"><div>ประกาศ “'+esc(a.name)+'” อาจตรงกับ<br><b>'+esc(b.name)+'</b> <span class="m">('+(b.kind==="found"?"พบที่":"หายที่")+" "+esc(b.place)+')</span></div><div id="ai-'+p.k+'"></div></div><div class="na"><button class="pri" onclick="openD('+b.id+')">ดู</button><button class="sec" onclick="aiCheck('+a.id+','+b.id+')">🤖 ให้ AI ตรวจ</button></div></div>'}).join(""):td.length?'':'<div class="em">ยังไม่มีการแจ้งเตือน ลองแจ้งของหายหรือของที่พบเพื่อดูการจับคู่</div>';
$("app").innerHTML=h;Object.keys(aiR).forEach(aiShow)}
var CONTACT_EMAIL="robin.tho@spumail.net";
var me={anon:true,email:""},aiR={};
function setMe(u){uid=u.id;me={anon:!!u.is_anonymous,email:u.email||""}}
function acc(){var b=$("acc");b.className="acc"+(view==="acct"?" on":"");b.textContent="👤 "+(me.anon?"บัญชี":me.email)}
function ftr(){$("app").insertAdjacentHTML("beforeend",'<p class="ft">🔒 <a href="#" onclick="privacy();return false">นโยบายความเป็นส่วนตัว</a> · ผลจาก AI เป็นเพียงคำแนะนำ อาจผิดพลาดได้</p>')}
function privacy(){$("md").innerHTML='<div class="cb"><h2>นโยบายความเป็นส่วนตัว (PDPA)</h2><ul class="m">'+
'<li><b>ข้อมูลที่เก็บ:</b> ชื่อสิ่งของ ประเภท สถานที่ เวลา รายละเอียด รูปภาพ (ถ้ามี) ช่องทางติดต่อ และรหัสผู้ใช้ (หรืออีเมลถ้าลงทะเบียน)</li>'+
'<li><b>วัตถุประสงค์:</b> ใช้จับคู่และติดต่อคืนของเท่านั้น</li>'+
'<li><b>ใครเห็นข้อมูล:</b> ช่องทางติดต่อที่กรอกจะแสดงให้ผู้ใช้ระบบเห็น จึงไม่ควรใส่เลขบัตรประชาชนหรือข้อมูลอ่อนไหว</li>'+
'<li><b>การใช้ AI:</b> เมื่อกด “ให้ AI ตรวจ” ระบบส่งเฉพาะชื่อ ประเภท สถานที่ เวลา และรายละเอียดของสองรายการไปยังผู้ให้บริการ AI (Google Gemini) ไม่ส่งช่องทางติดต่อ รูปภาพ หรืออีเมล ผลของ AI อาจผิดพลาด ควรตรวจสอบกับอีกฝ่ายก่อนส่งมอบของ</li>'+
'<li><b>การเก็บรักษา:</b> เมื่อเจ้าของกดอัปเดตเป็น “คืนแล้ว” รายการจะถูกลบออกจากระบบ</li>'+
'<li><b>ขอลบหรือแก้ไขข้อมูล:</b> '+esc(CONTACT_EMAIL)+'</li></ul>'+
'<div class="cta"><button class="sec" onclick="closeD()">ปิด</button></div></div>';$("mo").classList.add("on")}
function acctV(){var h='<h1>บัญชีผู้ใช้</h1>';
if(me.anon)h+='<p class="s">ตอนนี้คุณใช้งานแบบไม่ระบุตัวตน ถ้าล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง จะเข้าถึงรายการของคุณไม่ได้ ลงทะเบียนเพื่อเก็บรายการไว้กับอีเมล</p><div class="fm"><label>อีเมล<input id="ae" type="email" autocomplete="email"></label><label>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)<input id="ap" type="password" autocomplete="current-password"></label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="pri" onclick="reg()">ลงทะเบียน (เก็บรายการปัจจุบันไว้)</button><button class="sec" onclick="login()">เข้าสู่ระบบ</button></div><p class="m" style="margin:0">เข้าสู่ระบบจะเปลี่ยนไปใช้บัญชีที่เคยลงทะเบียนไว้ รายการที่ประกาศแบบไม่ระบุตัวตนบนเครื่องนี้จะไม่แสดงในบัญชีนั้น</p></div>';
else h+='<p class="s">เข้าสู่ระบบแล้ว รายการของคุณผูกกับอีเมลนี้</p><div class="fm"><div class="ct"><div class="m">อีเมล</div><b>'+esc(me.email)+'</b></div><div><button class="sec" onclick="logout()">ออกจากระบบ</button></div></div>';
$("app").innerHTML=h}
function cred(){var e=$("ae").value.trim(),p=$("ap").value;
if(!/^\S+@\S+\.\S+$/.test(e)){toast("กรุณากรอกอีเมลให้ถูกต้อง");$("ae").focus();return null}
if(p.length<6){toast("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");$("ap").focus();return null}
return{email:e,password:p}}
async function reg(){var c=cred();if(!c)return;
var r=await sb.auth.updateUser(c);if(r.error){toast("ลงทะเบียนไม่สำเร็จ: "+r.error.message);return}
setMe(r.data.user);toast(me.anon?"ส่งอีเมลยืนยันไปที่ "+c.email+" แล้ว กดลิงก์ในอีเมลเพื่อเสร็จสิ้นการลงทะเบียน":"ลงทะเบียนสำเร็จ รายการเดิมของคุณยังอยู่");render()}
async function login(){var c=cred();if(!c)return;
var r=await sb.auth.signInWithPassword(c);if(r.error){toast("เข้าสู่ระบบไม่สำเร็จ: "+r.error.message);return}
setMe(r.data.user);await load();view="feed";toast("เข้าสู่ระบบแล้ว");render()}
async function logout(){await sb.auth.signOut();var a=await sb.auth.signInAnonymously();
if(a.error){toast("เริ่มเซสชันใหม่ไม่สำเร็จ: "+a.error.message);return}
setMe(a.data.user);await load();view="feed";toast("ออกจากระบบแล้ว");render()}
function pk(i){return{kind:i.kind,name:i.name,cat:i.cat,place:i.place,at:i.at,desc:i.desc==="ไม่มีรายละเอียดเพิ่มเติม"?"":i.desc}}
function aiBox(k,h){var e=$("ai-"+k);if(e)e.innerHTML=h}
function aiShow(k){var j=aiR[k],e=$("ai-"+k);if(!j||!e)return;var p=k.split("-"),
V={match:["ตรงมาก","tag found"],maybe:["อาจตรง","tag mt"],no_match:["ไม่น่าตรง","tag lost"],insufficient:["ข้อมูลไม่พอ","tag mt"],out_of_scope:["วิเคราะห์ไม่ได้ (นอกขอบเขต)","tag lost"]}[j.verdict]||["ไม่ทราบ","tag mt"];
e.innerHTML='<div class="air"><span class="'+V[1]+'">🤖 '+V[0]+'</span> <span class="m">คะแนน '+j.score+'% · '+(j.ms/1000).toFixed(1)+' วิ</span><div class="pbar"><i style="width:'+j.score+'%"></i></div><p class="m" style="margin:6px 0 0">'+esc(j.reason)+'</p>'+(j.missing&&j.missing.length?'<p class="m" style="margin:4px 0 0">ควรเพิ่มรายละเอียด: '+j.missing.map(function(s){return esc(s)}).join(", ")+'</p>':'')+'<button class="sec sm" style="margin-top:8px" onclick="aiCheck('+p[0]+','+p[1]+',1)">ประเมินใหม่</button></div>'}
var aiQ=Promise.resolve(),aiBusy={};
function aiCheck(ai,bi,force){var k=ai+"-"+bi;if(aiBusy[k])return;if(aiR[k]&&!force){aiShow(k);return}
aiBusy[k]=1;aiBox(k,'<p class="m air" role="status">⏳ รอคิว…</p>');
aiQ=aiQ.then(function(){return aiRun(ai,bi,force)}).catch(function(){}).then(function(){return new Promise(function(o){setTimeout(o,3500)})}).then(function(){aiBusy[k]=0})}
async function aiRun(ai,bi,force){var A=get(ai),B=get(bi),k=ai+"-"+bi;if(!A||!B)return;
if(aiR[k]&&!force){aiShow(k);return}
aiBox(k,'<p class="m air" role="status">⏳ กำลังประมวลผล…</p>');var t0=Date.now();
try{var s=await sb.auth.getSession(),tk=s.data.session?s.data.session.access_token:"";
var r=await fetch("/api/match",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+tk},body:JSON.stringify({a:pk(A),b:pk(B)})});
var j=await r.json().catch(function(){return{}});
if(!r.ok)throw new Error(j.error||"HTTP "+r.status);
j.ms=Date.now()-t0;aiR[k]=j;aiShow(k)}
catch(e){aiBox(k,'<p class="m air">ใช้ AI ไม่ได้ชั่วคราว: '+esc(e.message||e)+' (ยังใช้ผลจับคู่ตามกฎด้านบนได้)</p>')}}
function render(){nav();view==="feed"?feed():view==="form"?form():view==="mine"?mineV():view==="acct"?acctV():notesV();ftr()}
document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b||matchMedia("(prefers-reduced-motion:reduce)").matches)return;var r=b.getBoundingClientRect(),s=document.createElement("span"),d=Math.max(r.width,r.height)*2;s.className="rp";s.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";b.appendChild(s);setTimeout(function(){s.remove()},600)});
init();
