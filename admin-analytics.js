import { initializeApp as analyticsInitApp, getApps as analyticsGetApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getFirestore as analyticsGetFirestore, collection as analyticsCollection, onSnapshot as analyticsOnSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

  const analyticsFirebaseConfig = {
    apiKey:"AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
    authDomain:"al-tariq-media.firebaseapp.com",
    projectId:"al-tariq-media",
    storageBucket:"al-tariq-media.firebasestorage.app",
    messagingSenderId:"616239800441",
    appId:"1:616239800441:web:53edc96e1cc872702cb4a8",
    measurementId:"G-42KJKNDJDF"
  };

  const analyticsApp = analyticsGetApps().length ? analyticsGetApps()[0] : analyticsInitApp(analyticsFirebaseConfig);
  const analyticsDb = analyticsGetFirestore(analyticsApp);

  const analyticsState = { events:[], unsubscribe:null };

  const eventLabels = {
    page_view:"مشاهدة صفحة",
    contact_click:"ضغط تواصل",
    drive_click:"فتح رابط Drive",
    portfolio_view:"زيارة عرض الأعمال",
    project_open:"فتح مشروع",
    service_click:"ضغط خدمة"
  };

  function eventDate(event){
    const value = event.created_at;
    if(value?.toDate) return value.toDate();
    if(value?.seconds) return new Date(value.seconds * 1000);
    const parsed = new Date(value || event.createdAt || 0);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  function filteredEvents(){
    const select = document.getElementById("analyticsPeriod");
    const period = select?.value || "30";
    if(period === "all") return [...analyticsState.events];
    const days = Number(period) || 30;
    const since = Date.now() - days * 86400000;
    return analyticsState.events.filter(e => eventDate(e).getTime() >= since);
  }

  function countBy(items, keyFn){
    const map = new Map();
    items.forEach(item=>{
      const key = String(keyFn(item) || "غير معروف");
      map.set(key,(map.get(key)||0)+1);
    });
    return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  }

  function esc(value=""){
    return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  function setText(id,value){
    const el=document.getElementById(id);
    if(el) el.textContent=String(value);
  }

  function renderInterest(events){
    const interest = {
      "عرض الأعمال": events.filter(e => e.event_type==="portfolio_view" || e.event_type==="project_open").length,
      "روابط Drive": events.filter(e => e.event_type==="drive_click").length,
      "الخدمات": events.filter(e => e.event_type==="service_click").length,
      "التواصل": events.filter(e => e.event_type==="contact_click").length,
      "الصفحة الرئيسية": events.filter(e => e.event_type==="page_view" && (e.page==="home" || !e.page)).length
    };

    const sorted = Object.entries(interest).sort((a,b)=>b[1]-a[1]);
    const total = sorted.reduce((sum,[,v])=>sum+v,0);
    const box = document.getElementById("waInterestBars");
    const insight = document.getElementById("waTopInsight");
    if(!box || !insight) return;

    if(total===0){
      box.innerHTML='<div class="wa-empty">لا توجد بيانات كافية بعد. بعد تركيب كود التتبع ستظهر الإحصائيات هنا.</div>';
      insight.textContent="لا توجد بيانات كافية بعد.";
      return;
    }

    box.innerHTML = sorted.map(([name,value])=>{
      const pct = Math.round((value/total)*100);
      return `<div class="wa-bar-row">
        <div class="wa-bar-label"><span>${esc(name)}</span><b>${pct}% · ${value}</b></div>
        <div class="wa-bar-track"><div class="wa-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join("");

    const [topName,topValue] = sorted[0];
    const topPct = Math.round((topValue/total)*100);
    insight.innerHTML = `أعلى اهتمام حاليًا: <b>${esc(topName)}</b> بنسبة تقريبية <b>${topPct}%</b> من التفاعلات القابلة للقياس في الفترة المحددة.`;
  }

  function renderRankedList(id, rows, emptyText){
    const box=document.getElementById(id);
    if(!box) return;
    if(!rows.length){
      box.innerHTML=`<div class="wa-empty">${esc(emptyText)}</div>`;
      return;
    }
    box.innerHTML=rows.slice(0,8).map(([name,count])=>`
      <div class="wa-list-row">
        <div class="wa-main"><b>${esc(name)}</b><small>تفاعلات مسجلة</small></div>
        <span class="wa-count">${count}</span>
      </div>`).join("");
  }

  function renderRecent(events){
    const box=document.getElementById("waRecentEvents");
    if(!box) return;
    const rows=[...events].sort((a,b)=>eventDate(b)-eventDate(a)).slice(0,10);
    if(!rows.length){
      box.innerHTML='<div class="wa-empty">لا يوجد نشاط مسجل حتى الآن.</div>';
      return;
    }
    box.innerHTML=rows.map(e=>{
      const label=eventLabels[e.event_type] || e.event_type || "نشاط";
      const detail=e.project_name || e.service_name || e.page || e.target || "";
      const date=eventDate(e);
      return `<div class="wa-list-row">
        <div class="wa-main"><b>${esc(label)}</b><small>${esc(detail)} · ${date.toLocaleString("ar-JO")}</small></div>
      </div>`;
    }).join("");
  }

  function renderDaily(events){
    const box=document.getElementById("waDailyChart");
    if(!box) return;
    const map=new Map();
    events.forEach(e=>{
      const d=eventDate(e);
      if(d.getTime()===0) return;
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      map.set(key,(map.get(key)||0)+1);
    });
    const rows=[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-30);
    if(!rows.length){
      box.innerHTML='<div class="wa-empty" style="width:100%">لا توجد بيانات يومية بعد.</div>';
      return;
    }
    const max=Math.max(...rows.map(r=>r[1]),1);
    box.innerHTML=rows.map(([day,count])=>{
      const pct=Math.max(4,Math.round((count/max)*100));
      const label=day.slice(5);
      return `<div class="wa-day"><b>${count}</b><div class="wa-day-bar" style="height:${pct}%"></div><small>${label}</small></div>`;
    }).join("");
  }

  function renderAnalytics(){
    const events=filteredEvents();
    const visitors=new Set(events.map(e=>e.visitor_id).filter(Boolean));

    setText("waUniqueVisitors",visitors.size);
    setText("waPageViews",events.filter(e=>e.event_type==="page_view").length);
    setText("waContactClicks",events.filter(e=>e.event_type==="contact_click").length);
    setText("waPortfolioViews",events.filter(e=>e.event_type==="portfolio_view" || (e.event_type==="page_view" && e.page==="portfolio")).length);
    setText("waDriveClicks",events.filter(e=>e.event_type==="drive_click").length);
    setText("waProjectOpens",events.filter(e=>e.event_type==="project_open").length);

    renderInterest(events);

    const projectRows=countBy(
      events.filter(e=>e.event_type==="project_open" || e.event_type==="drive_click"),
      e=>e.project_name || e.project_id || "مشروع غير محدد"
    );
    renderRankedList("waTopProjects",projectRows,"لم يتم فتح مشاريع بعد.");

    const serviceRows=countBy(
      events.filter(e=>e.event_type==="service_click"),
      e=>e.service_name || e.service_id || "خدمة غير محددة"
    );
    renderRankedList("waTopServices",serviceRows,"لم يتم تسجيل ضغطات على الخدمات بعد.");

    renderRecent(events);
    renderDaily(events);
  }

  function subscribe(){
    if(typeof analyticsState.unsubscribe==="function") analyticsState.unsubscribe();
    analyticsState.unsubscribe=analyticsOnSnapshot(
      analyticsCollection(analyticsDb,"site_events"),
      snapshot=>{
        analyticsState.events=snapshot.docs.map(d=>({id:d.id,...d.data()}));
        renderAnalytics();
        console.info(`📊 Website analytics loaded: ${analyticsState.events.length} event(s).`);
      },
      error=>{
        console.error("Website analytics read error:",error);
        const hint=document.getElementById("waTopInsight");
        if(hint) hint.textContent="تعذر قراءة site_events. راجع Firestore Rules.";
      }
    );
  }

  document.getElementById("analyticsPeriod")?.addEventListener("change",renderAnalytics);
  document.getElementById("analyticsRefresh")?.addEventListener("click",renderAnalytics);
  window.addEventListener("altariq:analytics-refresh",renderAnalytics);

  subscribe();
  console.info("✅ Admin Website Activity analytics ready.");
