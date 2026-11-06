// ธีมสว่าง/มืด ใช้ร่วมกันทั้งหน้า user และ admin (จำค่าไว้ในเบราว์เซอร์; ถ้ายังไม่เคยเลือกจะตามธีมของเครื่อง)
(function(){var t;try{t=localStorage.getItem("slf-theme")}catch(e){}
if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";
var h=document.documentElement;h.setAttribute("data-theme",t);
window.themeLabel=function(){return"ธีม: "+(h.getAttribute("data-theme")==="dark"?"มืด":"สว่าง")};
window.toggleTheme=function(){var n=h.getAttribute("data-theme")==="dark"?"light":"dark";h.setAttribute("data-theme",n);
try{localStorage.setItem("slf-theme",n)}catch(e){}
document.querySelectorAll("[data-themebtn]").forEach(function(b){b.textContent=themeLabel()})}})();
