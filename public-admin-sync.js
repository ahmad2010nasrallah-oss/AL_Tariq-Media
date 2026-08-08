import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",authDomain:"al-tariq-media.firebaseapp.com",projectId:"al-tariq-media",storageBucket:"al-tariq-media.firebasestorage.app",messagingSenderId:"616239800441",appId:"1:616239800441:web:53edc96e1cc872702cb4a8",measurementId:"G-42KJKNDJDF"};
const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
const db=getFirestore(app);
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function text(el,v){if(el && v!==undefined && v!==null && String(v).trim()!=="") el.textContent=v}
function applySettings(s={}){
  if(!s||typeof s!=="object")return;
  if(s.seoTitle)document.title=s.seoTitle;
  const meta=$('meta[name="description"]'); if(meta&&s.seoDescription)meta.content=s.seoDescription;
  text($('.hero-content h1'),s.heroTitle); text($('.hero-content p'),s.heroDescription);
  const footerCopy=$('footer .copyright, .footer .copyright, footer p:last-child'); if(footerCopy&&s.copyright)footerCopy.textContent=s.copyright;
  const phone=$('.contact-list a[href^="tel:"]'); if(phone&&s.whatsapp){phone.href='tel:'+s.whatsapp; phone.textContent=s.whatsapp;}
  const mail=$('.contact-list a[href^="mailto:"]'); if(mail&&s.email){mail.href='mailto:'+s.email; mail.textContent=s.email;}
  const address=[...$$('.contact-item')].find(x=>x.textContent.includes('العنوان'))?.querySelector('span'); text(address,s.address);
  if(s.whatsapp) $$('a[href*="wa.me"]').forEach(a=>a.href='https://wa.me/'+String(s.whatsapp).replace(/\D/g,''));
  const servicesSection=$('#publicServicesGrid')?.closest('section'); if(servicesSection) servicesSection.style.display=s.showServices===false?'none':'';
  const portfolio=$('#portfolio'), pNav=$('[data-page="portfolio"]'); if(portfolio)portfolio.style.display=s.showWorks===false?'none':''; if(pNav)pNav.style.display=s.showWorks===false?'none':'';
  const contact=$('#contact'), cNav=$('[data-page="contact"]'); if(contact)contact.style.display=s.showContact===false?'none':''; if(cNav)cNav.style.display=s.showContact===false?'none':'';
}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeUrl(v=''){const s=String(v||'').trim(); return /^(https?:|data:image\/|blob:)/i.test(s)?s:''}

const defaultServices=[
 {id:'01',number:'01',icon:'◉',kicker:'Digital Growth',name:'Social Media Management',description:'إدارة المحتوى، التخطيط، النشر وبناء الهوية الرقمية للحسابات.',image:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=84',order:1,visible:true},
 {id:'02',number:'02',icon:'◎',kicker:'Visual Production',name:'Photography',description:'تصوير المنتجات والحملات التجارية بأسلوب احترافي متوافق مع العلامة.',image:'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=84',order:2,visible:true},
 {id:'03',number:'03',icon:'▶',kicker:'Motion & Editing',name:'Video Editing',description:'مونتاج الفيديوهات الإعلانية والقصيرة مع معالجة بصرية احترافية.',image:'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=84',order:3,visible:true},
 {id:'04',number:'04',icon:'⌘',kicker:'Web Experience',name:'Web Design',description:'تصميم مواقع سريعة ومتجاوبة تعكس هوية المشروع وتخدم أهدافه.',image:'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1400&q=84',order:4,visible:true}
];

function serviceCard(s){
  const article=document.createElement('article'); article.className='admin-service-card';
  const img=safeUrl(s.image);
  article.innerHTML=`<div class="admin-service-visual">${img?`<img src="${esc(img)}" alt="${esc(s.name||'خدمة')}" loading="lazy">`:''}<span class="admin-service-number">${esc(s.number||String(s.order||'').padStart(2,'0'))}</span><div class="admin-service-icon" aria-hidden="true">${esc(s.icon||'✦')}</div></div><div class="admin-service-content"><span class="admin-service-kicker">${esc(s.kicker||'Service')}</span><h3>${esc(s.name||'خدمة')}</h3><p>${esc(s.description||'')}</p></div>`;
  return article;
}
function renderServices(items){
  const grid=$('#publicServicesGrid'); if(!grid)return;
  const list=(Array.isArray(items)&&items.length?items:defaultServices).filter(x=>x.visible!==false).sort((a,b)=>(Number(a.order)||99)-(Number(b.order)||99));
  grid.replaceChildren(...list.map(serviceCard));
}

function workCard(p){
  const article=document.createElement('article'); article.className='admin-work-card';
  const img=safeUrl(p.publicImage||p.imageUrl||p.image||p.image_data);
  const link=String(p.driveLink||p.drive_url||p.link||'').trim();
  article.innerHTML=`<div class="admin-work-image">${img?`<img src="${esc(img)}" alt="${esc(p.name||p.title||'مشروع')}" loading="lazy">`:`<div class="admin-work-placeholder">✦</div>`}<span class="admin-work-status">منشور</span></div><div class="admin-work-body"><div class="admin-work-meta"><span class="admin-work-category">${esc(p.category||'أعمالنا')}</span><span class="admin-work-id">#${esc(String(p.id||'').slice(0,6).toUpperCase())}</span></div><h3>${esc(p.name||p.title||'مشروع')}</h3><p>${esc(p.description||'')}</p>${link?`<a class="admin-work-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">مشاهدة المشروع ↗</a>`:''}</div>`;
  return article;
}
function renderProjects(items){
  const grid=$('#portfolioProjectsGrid'); if(!grid)return;
  const list=(Array.isArray(items)?items:[])
.filter(p=>p.published===true || String(p.status||'').toLowerCase()==='published')
.sort((a,b)=>new Date(b.updated||0)-new Date(a.updated||0));
  if(!list.length){grid.innerHTML='<div class="admin-empty-card">لا توجد أعمال منشورة حالياً.</div>';return;}
  grid.replaceChildren(...list.map(workCard));
}

try{const local=JSON.parse(localStorage.getItem('altariq_media_services_v1')||'null');renderServices(local||defaultServices)}catch{renderServices(defaultServices)}

onSnapshot(doc(db,'website_config','main'),snap=>{if(snap.exists())applySettings(snap.data())},e=>console.warn('Settings sync:',e));
onSnapshot(collection(db,'projects'),snap=>renderProjects(snap.docs.map(d=>({id:d.id,...d.data()}))),e=>console.warn('Projects sync:',e));
onSnapshot(collection(db,'website_services'),snap=>{const items=snap.docs.map(d=>({id:d.id,...d.data()}));renderServices(items.length?items:defaultServices)},e=>console.warn('Services sync:',e));
window.addEventListener('storage',e=>{if(e.key==='altariq_media_website_settings_v1'&&e.newValue){try{applySettings(JSON.parse(e.newValue))}catch{}} if(e.key==='altariq_media_services_v1'){try{renderServices(JSON.parse(e.newValue||'[]'))}catch{}}});


// Local same-origin bridge: works instantly while previewing admin + website in the same browser.
const LOCAL_PROJECT_DB='altariq_media_admin_database_v2', LOCAL_PROJECT_STORE='projects';
function openLocalProjectDb(){return new Promise((res,rej)=>{const r=indexedDB.open(LOCAL_PROJECT_DB,1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);r.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains(LOCAL_PROJECT_STORE))d.createObjectStore(LOCAL_PROJECT_STORE,{keyPath:'id'})}})}
async function readLocalProjects(){try{const d=await openLocalProjectDb();return await new Promise((res,rej)=>{const t=d.transaction(LOCAL_PROJECT_STORE,'readonly'),r=t.objectStore(LOCAL_PROJECT_STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}catch{return []}}
let localProjectSignature='';
async function refreshLocalProjects(){const items=await readLocalProjects();if(!items.length)return;const sig=JSON.stringify(items.map(p=>[p.id,p.updated,p.status,p.name,p.image?.length]));if(sig!==localProjectSignature){localProjectSignature=sig;renderProjects(items)}}
setInterval(refreshLocalProjects,1200);setTimeout(refreshLocalProjects,250);
