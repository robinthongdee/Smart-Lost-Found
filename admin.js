var ST=["กำลังตามหา","พบแล้ว","ติดต่อแล้ว","คืนแล้ว"];
var CAT={"โทรศัพท์":"📱","กระเป๋า":"👜","กุญแจ":"🔑","บัตรนักศึกษา":"🪪","อื่น ๆ":"📦"};
var PL=["ห้องเรียน","โรงอาหาร","ห้องสมุด","ลานจอดรถ","อาคารกิจกรรม","สนามกีฬา"];
// session แยกจากหน้า user (storageKey คนละชื่อ) และไม่ล็อกอินแบบไม่ระบุตัวตน
var sb=supabase.createClient("https://htxdnqhzyaxuvomziqzr.supabase.co","sb_publishable_AyNg4TJiuiw54uEsaq7kcQ_Sns--xgk",{auth:{storageKey:"slf-admin-auth"}});
var items=[],tab="dash",q="",fs="",email="";
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function toast(m){var t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(t._h);t._h=setTimeout(function(){t.style.display="none"},2800)}
function fd(s){return new Date(s).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+" น."}
function closeD(){$("mo").classList.remove("on")}
$("mo").addEventListener("click",function(e){if(e.target===this)closeD()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeD()});
function get(i){return items.filter(function(x){return x.id===i})[0]}
function words(s){return s.toLowerCase().split(/\s+/).filter(function(w){return w.length>1})}
function match(a,b){if(a.draft||b.draft||a.kind===b.kind||a.cat!==b.cat)return false;if(a.place===b.place)return true;return words(a.name).some(function(x){return b.name.toLowerCase().indexOf(x)>-1})}

async function start(){var s=await sb.auth.getSession();if(!s.data.session){loginV();return}email=s.data.session.user.email||"";await enter()}
async function enter(){var r=await sb.rpc("is_admin");
if(r.data!==true){await sb.auth.signOut();loginV("บัญชีนี้ไม่มีสิทธิ์แอดมิน");return}
await load();render()}
async function load(){var r=await sb.from("items").select("*").order("at",{ascending:false});if(r.error){toast("โหลดข้อมูลไม่สำเร็จ: "+r.error.message);return}items=r.data}
function loginV(msg){$("nav").innerHTML="";
$("app").innerHTML='<div style="max-width:380px;margin:40px auto"><h1>เข้าสู่ระบบผู้ดูแล</h1><p class="s">สำหรับผู้ดูแลระบบเท่านั้น</p>'+(msg?'<p class="m" style="color:#dc2626">'+esc(msg)+'</p>':'')+
'<div class="fm"><label>อีเมล<input id="ae" type="email" autocomplete="email"></label><label>รหัสผ่าน<input id="ap" type="password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')login()"></label><button class="pri" onclick="login()">เข้าสู่ระบบ</button></div></div>'}
async function login(){var e=$("ae").value.trim(),p=$("ap").value;if(!e||!p){toast("กรุณากรอกอีเมลและรหัสผ่าน");return}
var r=await sb.auth.signInWithPassword({email:e,password:p});if(r.error){toast("เข้าสู่ระบบไม่สำเร็จ: "+r.error.message);return}
email=e;await enter()}
async function logout(){await sb.auth.signOut();items=[];loginV()}
function nav(){$("nav").innerHTML=[["dash","Dashboard"],["manage","จัดการรายการ"]].map(function(x){return '<button class="'+(tab===x[0]?"on":"")+'" onclick="tab=\''+x[0]+'\';render()">'+x[1]+'</button>'}).join("")+'<button onclick="logout()">ออกจากระบบ ('+esc(email)+')</button>'}
function render(){nav();tab==="dash"?dashV():manageV()}

function bars(o){var m=Math.max.apply(null,o.map(function(x){return x[1]}).concat([1]));return '<div class="bars">'+o.map(function(x){return '<div class="br"><span>'+esc(x[0])+'</span><div class="pbar"><i style="width:'+Math.round(x[1]/m*100)+'%"></i></div><b>'+x[1]+'</b></div>'}).join("")+'</div>'}
function dashV(){var A=items.filter(function(i){return !i.draft}),op=A.filter(function(i){return i.st<3}),
L=op.filter(function(i){return i.kind==="lost"}),F=op.filter(function(i){return i.kind==="found"}),
dr=items.filter(function(i){return i.draft}).length,
mt=L.filter(function(a){return F.some(function(b){return match(a,b)})}).length,
old=op.filter(function(i){return Date.now()-new Date(i.at)>=7*864e5}).length,days=[];
for(var d=6;d>=0;d--){var s=new Date();s.setHours(0,0,0,0);s.setDate(s.getDate()-d);var a0=s.getTime(),a1=a0+864e5;days.push([s.toLocaleDateString("th-TH",{day:"numeric",month:"short"}),A.filter(function(i){var t=new Date(i.at).getTime();return t>=a0&&t<a1}).length])}
var k=function(n,t){return '<div class="kc"><b>'+n+'</b><span>'+t+'</span></div>'};
$("app").innerHTML='<h1>Dashboard</h1><p class="s">ภาพรวมระบบ (รายการที่คืนแล้วถูกลบตามนโยบาย PDPA จึงไม่นับรวม)</p>'+
'<div class="kpi">'+k(items.length,"รายการทั้งหมด")+k(L.length,"ของหายที่ยังตามหา")+k(F.length,"ของที่พบรอเจ้าของ")+k(mt,"ของหายที่มีคู่อาจตรง")+k(old,"ค้างเกิน 7 วัน")+k(dr,"ฉบับร่าง")+'</div>'+
'<div class="dg"><div class="imp"><h2>สถานะ (ที่ยังเปิดอยู่)</h2>'+bars(ST.slice(0,3).map(function(s,i){return[s,op.filter(function(x){return x.st===i}).length]}))+'</div>'+
'<div class="imp"><h2>รายการใหม่ 7 วันล่าสุด</h2>'+bars(days)+'</div>'+
'<div class="imp"><h2>ตามประเภท</h2>'+bars(Object.keys(CAT).map(function(c){return[CAT[c]+" "+c,A.filter(function(x){return x.cat===c}).length]}))+'</div>'+
'<div class="imp"><h2>ตามสถานที่</h2>'+bars(PL.map(function(p){return[p,A.filter(function(x){return x.place===p}).length]}))+'</div></div>'}

function manageV(){
$("app").innerHTML='<h1>จัดการรายการ</h1><p class="s">แอดมินแก้ไขและลบได้ทุกรายการ</p><div class="f" style="grid-template-columns:2fr 1fr"><input id="q" type="search" placeholder="ค้นหาชื่อ รายละเอียด สถานที่" value="'+esc(q)+'" oninput="q=this.value;rows()"><select onchange="fs=this.value;rows()"><option value="">ทุกสถานะ</option>'+ST.slice(0,3).map(function(s,i){return '<option value="'+i+'"'+(fs===""+i?" selected":"")+'>'+s+'</option>'}).join("")+'<option value="d"'+(fs==="d"?" selected":"")+'>ฉบับร่าง</option></select></div><div class="imp"><div class="rc"><span id="cnt"></span></div><div class="tw"><table class="tb" id="tb"></table></div></div>';rows()}
function rows(){var t=q.trim().toLowerCase();
var r=items.filter(function(i){return(!fs||(fs==="d"?i.draft:!i.draft&&i.st===+fs))&&(!t||(i.name+i.desc+i.cat+i.place).toLowerCase().indexOf(t)>-1)});
$("cnt").textContent="พบ "+r.length+" รายการ";
$("tb").innerHTML='<tr><th>ชื่อ</th><th>ชนิด</th><th>สถานะ</th><th>สถานที่</th><th>เวลา</th><th></th></tr>'+r.map(function(i){return '<tr><td>'+esc(i.name)+(i.draft?' <span class="tag mt">ร่าง</span>':'')+'</td><td><span class="tag '+i.kind+'">'+(i.kind==="lost"?"หาย":"พบ")+'</span></td><td>'+ST[i.st]+'</td><td>'+esc(i.place)+'</td><td>'+fd(i.at)+'</td><td><button class="sec sm" onclick="editD('+i.id+')">แก้ไข</button> <button class="sec sm" style="color:#dc2626" onclick="delIt('+i.id+')">ลบ</button></td></tr>'}).join("")}
function opts(a,v){return a.map(function(x,i){var val=Array.isArray(a)&&typeof x==="string"?x:i;return '<option value="'+esc(val)+'"'+(String(val)===String(v)?" selected":"")+'>'+esc(x)+'</option>'}).join("")}
function editD(id){var i=get(id);if(!i)return;
$("md").innerHTML='<div class="cb"><h2>แก้ไขรายการ</h2><div class="fm" style="border:0;padding:0">'+
'<label>ชื่อสิ่งของ<input id="en" maxlength="80" value="'+esc(i.name)+'"></label>'+
'<div class="r2"><label>ประเภท<select id="ec">'+opts(Object.keys(CAT),i.cat)+'</select></label><label>สถานที่<select id="ep">'+opts(PL,i.place)+'</select></label></div>'+
'<div class="r2"><label>สถานะ<select id="es">'+opts(ST.slice(0,3),i.st)+'</select></label><label>เผยแพร่<select id="ed"><option value="0"'+(i.draft?"":" selected")+'>ประกาศแล้ว</option><option value="1"'+(i.draft?" selected":"")+'>ฉบับร่าง</option></select></label></div>'+
'<label>รายละเอียด<textarea id="ex" rows="3" maxlength="500">'+esc(i.desc)+'</textarea></label>'+
'<label>ช่องทางติดต่อ<input id="et" maxlength="60" value="'+esc(i.contact)+'"></label>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="pri" onclick="saveD('+i.id+')">บันทึก</button><button class="sec" onclick="closeD()">ยกเลิก</button></div></div></div>';
$("mo").classList.add("on")}
async function saveD(id){var n=$("en").value.trim(),t=$("et").value.trim();if(!n||!t){toast("ชื่อสิ่งของและช่องทางติดต่อต้องไม่ว่าง");return}
var row={name:n,cat:$("ec").value,place:$("ep").value,st:+$("es").value,draft:$("ed").value==="1",desc:$("ex").value.trim()||"ไม่มีรายละเอียดเพิ่มเติม",contact:t};
var r=await sb.from("items").update(row).eq("id",id).select().single();
if(r.error){toast("บันทึกไม่สำเร็จ: "+r.error.message);return}
items[items.findIndex(function(x){return x.id===id})]=r.data;closeD();toast("บันทึกแล้ว");render()}
async function delIt(id){if(!confirm("ลบรายการนี้ถาวร?"))return;
var d=await sb.from("items").delete().eq("id",id).select();
if(d.error||!d.data.length){toast("ลบไม่สำเร็จ: "+(d.error?d.error.message:"ไม่มีสิทธิ์ (ตรวจ policy admin ใน Supabase)"));return}
items=items.filter(function(x){return x.id!==id});toast("ลบรายการแล้ว");render()}
start();
