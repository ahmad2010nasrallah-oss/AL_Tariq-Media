/* ============================================================
   AL-TARIQ MEDIA — PUBLIC WEBSITE ANALYTICS
   Tracks anonymous website interactions to Firestore / site_events
   No IP address, email, phone or personal information is collected.
============================================================ */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:"AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
  authDomain:"al-tariq-media.firebaseapp.com",
  projectId:"al-tariq-media",
  storageBucket:"al-tariq-media.firebasestorage.app",
  messagingSenderId:"616239800441",
  appId:"1:616239800441:web:53edc96e1cc872702cb4a8",
  measurementId:"G-42KJKNDJDF"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const VISITOR_KEY = "altariq_visitor_id_v1";
const SESSION_KEY = "altariq_session_id_v1";
const MAX_TEXT = 120;

function randomId(prefix){
  if(window.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,12)}`;
}

function visitorId(){
  let id=localStorage.getItem(VISITOR_KEY);
  if(!id){
    id=randomId("v");
    localStorage.setItem(VISITOR_KEY,id);
  }
  return id;
}

function sessionId(){
  let id=sessionStorage.getItem(SESSION_KEY);
  if(!id){
    id=randomId("s");
    sessionStorage.setItem(SESSION_KEY,id);
  }
  return id;
}

function clean(value){
  return String(value ?? "").trim().slice(0,MAX_TEXT);
}

function currentPage(){
  const hash=(location.hash || "").replace(/^#/,"").toLowerCase();
  if(hash.includes("portfolio") || hash.includes("works") || hash.includes("اعمال")) return "portfolio";
  if(hash.includes("contact") || hash.includes("تواصل")) return "contact";
  if(hash.includes("service") || hash.includes("خدمات")) return "services";

  const active=document.querySelector('[data-page].active, section.active[id], .page.active[id]');
  const id=(active?.dataset?.page || active?.id || "").toLowerCase();
  if(id.includes("portfolio") || id.includes("works")) return "portfolio";
  if(id.includes("contact")) return "contact";
  if(id.includes("service")) return "services";
  return "home";
}

async function track(event_type, extra={}){
  const allowed = {
    event_type: clean(event_type),
    visitor_id: visitorId(),
    session_id: sessionId(),
    page: clean(extra.page || currentPage()),
    target: clean(extra.target),
    project_id: clean(extra.project_id),
    project_name: clean(extra.project_name),
    service_id: clean(extra.service_id),
    service_name: clean(extra.service_name),
    created_at: serverTimestamp()
  };

  Object.keys(allowed).forEach(key=>{
    if(allowed[key] === "") delete allowed[key];
  });

  try{
    await addDoc(collection(db,"site_events"),allowed);
  }catch(error){
    console.warn("Analytics event was not saved:",event_type,error?.code || error?.message || error);
  }
}

function elementText(el){
  return clean(
    el?.dataset?.projectName ||
    el?.dataset?.serviceName ||
    el?.querySelector?.("h3,h2,.title,.project-title,.service-title")?.textContent ||
    el?.textContent ||
    ""
  );
}

function projectInfo(target){
  const card=target.closest(
    "[data-project-id], .admin-work-card, .work-card, .portfolio-card, .project-card, .portfolio-item"
  );
  if(!card) return null;
  return {
    project_id:clean(card.dataset.projectId || card.dataset.id || ""),
    project_name:elementText(card)
  };
}

function serviceInfo(target){
  const card=target.closest(
    "[data-service-id], .admin-service-card, .service-card, .services-card, .service-item"
  );
  if(!card) return null;
  return {
    service_id:clean(card.dataset.serviceId || card.dataset.id || ""),
    service_name:elementText(card)
  };
}

/* First page view per load */
track("page_view",{page:currentPage()});

/* Track browser back/forward hash changes */
window.addEventListener("hashchange",()=>{
  const page=currentPage();
  track("page_view",{page});
  if(page==="portfolio") track("portfolio_view",{page:"portfolio"});
});

/* Universal click tracking */
document.addEventListener("click",event=>{
  const target=event.target.closest("a,button,[data-page],[data-go],.service-card,.project-card,.work-card,.portfolio-card,[data-project-id],[data-service-id]");
  if(!target) return;

  const href=target.closest("a")?.href || "";
  const text=clean(target.textContent).toLowerCase();
  const dataPage=clean(target.dataset?.page || target.dataset?.go).toLowerCase();

  /* Contact */
  if(
    /wa\.me|whatsapp/i.test(href) ||
    /^tel:|^mailto:/i.test(href) ||
    text.includes("تواصل") ||
    text.includes("contact")
  ){
    let contactTarget="contact";
    if(/wa\.me|whatsapp/i.test(href)) contactTarget="whatsapp";
    else if(/^tel:/i.test(href)) contactTarget="phone";
    else if(/^mailto:/i.test(href)) contactTarget="email";
    track("contact_click",{target:contactTarget});
  }

  /* Portfolio navigation */
  if(
    dataPage==="portfolio" ||
    dataPage==="works" ||
    /#(portfolio|works)/i.test(href) ||
    text.includes("عرض أعمالنا") ||
    text.includes("our works")
  ){
    track("portfolio_view",{page:"portfolio"});
  }

  /* Google Drive / Docs */
  if(/drive\.google\.com|docs\.google\.com/i.test(href)){
    const p=projectInfo(target);
    track("drive_click",{
      target:"google_drive",
      project_id:p?.project_id || "",
      project_name:p?.project_name || ""
    });
  }

  /* Project card */
  const p=projectInfo(target);
  if(p && !target.closest(".service-card,[data-service-id]")){
    track("project_open",p);
  }

  /* Service card */
  const s=serviceInfo(target);
  if(s){
    track("service_click",s);
  }
},{capture:true});

/* Expose optional manual API for custom buttons */
window.altariqTrack = track;

console.info("✅ Al-Tariq anonymous website analytics active.");
