import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getFirestore, collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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

  const CLOUD_NAME = "ql544zkl";
  const UPLOAD_PRESET = "altariq_services_upload";
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const LOCAL_KEY = "altariq_media_services_v1";

  const modal = document.getElementById("altariqServiceModal");
  const form = document.getElementById("altariqServiceForm");
  const fileInput = document.getElementById("altariqServiceImage");
  const preview = document.getElementById("altariqServicePreview");
  const description = document.getElementById("altariqServiceDescription");
  const count = document.getElementById("altariqServiceDescriptionCount");
  const status = document.getElementById("altariqServiceStatus");
  const submit = document.getElementById("altariqServiceSubmit");

  let previewObjectUrl = "";
  let editServiceId = null;
  let editServiceOrder = null;
  let editExistingImage = "";

  function setStatus(message, isError=false){
    status.textContent = message || "";
    status.style.color = isError ? "#ff9f9f" : "#cbd8eb";
  }

  function escapeHtml(value=""){
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[ch]));
  }

  function serviceCardMarkup(service){
    const image = String(service.image || service.imageUrl || service.publicImage || "").trim();
    const number = String(service.number || service.order || "").padStart(2,"0");
    const icon = String(service.icon || "✦");
    const kicker = String(service.kicker || "Service");
    const name = String(service.name || service.title || "خدمة");
    const description = String(service.description || "").slice(0,500);

    return `
      <article class="service-card glass" data-dynamic-service="1"
               data-service-id="${escapeHtml(service.id || "")}"
               data-service-order="${escapeHtml(service.order || service.number || "")}">
        <button type="button" class="altariq-service-edit-btn">✎ تعديل الخدمة</button>
        <div class="service-visual">
          ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" referrerpolicy="no-referrer">` : ""}
          <span class="service-number">${escapeHtml(number)}</span>
          <div class="service-icon" aria-hidden="true">${escapeHtml(icon)}</div>
        </div>
        <div class="service-content">
          <span class="service-kicker">${escapeHtml(kicker)}</span>
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(description)}</p>
        </div>
      </article>
    `;
  }

  function updateStaticCard(card, service){
    if(!card || !service) return;

    card.dataset.serviceId = String(service.id || "");
    card.dataset.serviceOrder = String(service.order || service.number || "");

    let editBtn = card.querySelector(".altariq-service-edit-btn");
    if(!editBtn){
      editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "altariq-service-edit-btn";
      editBtn.textContent = "✎ تعديل الخدمة";
      card.prepend(editBtn);
    }

    const image = String(service.image || service.imageUrl || service.publicImage || "").trim();
    const visual = card.querySelector(".service-visual");
    let img = visual?.querySelector("img");

    if(image){
      if(!img && visual){
        img = document.createElement("img");
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        visual.prepend(img);
      }
      if(img){
        img.src = image;
        img.alt = service.name || service.title || "خدمة";
      }
    }

    const numberEl = card.querySelector(".service-number");
    if(numberEl) numberEl.textContent = String(service.number || service.order || "").padStart(2,"0");

    const iconEl = card.querySelector(".service-icon");
    if(iconEl) iconEl.textContent = service.icon || "✦";

    const kickerEl = card.querySelector(".service-kicker");
    if(kickerEl) kickerEl.textContent = service.kicker || "Service";

    const nameEl = card.querySelector("h3");
    if(nameEl) nameEl.textContent = service.name || service.title || "خدمة";

    const descEl = card.querySelector("p");
    if(descEl) descEl.textContent = String(service.description || "").slice(0,500);

    card.style.display = service.visible === false ? "none" : "";
  }

  async function getAllServices(){
    const snap = await getDocs(collection(db,"services"));
    return snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>(Number(a.order || a.number)||99)-(Number(b.order || b.number)||99));
  }

  async function refreshAddedServices(){
    const grid = document.getElementById("adminServicesGrid");
    if(!grid) return;

    try{
      const items = await getAllServices();

      // Keep the original four cards and update their content from Firestore.
      const staticCards = [...grid.querySelectorAll(".service-card:not([data-dynamic-service='1'])")];
      const firstFour = items.filter(s => Number(s.order || s.number || 0) <= 4);

      staticCards.forEach((card,index)=>{
        const service = firstFour[index];
        if(service) updateStaticCard(card,service);
        else {
          // Even if Firestore is missing one of the original services, keep edit button visible.
          let editBtn = card.querySelector(".altariq-service-edit-btn");
          if(!editBtn){
            editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "altariq-service-edit-btn";
            editBtn.textContent = "✎ تعديل الخدمة";
            card.prepend(editBtn);
          }
          card.dataset.serviceOrder = String(index + 1);
        }
      });

      // Rebuild services after the original four.
      grid.querySelectorAll('[data-dynamic-service="1"]').forEach(el=>el.remove());

      items
        .filter(s => Number(s.order || s.number || 0) > 4)
        .forEach(service=>{
          grid.insertAdjacentHTML("beforeend", serviceCardMarkup(service));
        });

      console.info(`✅ ${items.length} service(s) rendered with edit buttons.`);
    }catch(error){
      console.warn("Could not refresh services:", error);

      // Fallback: at least add edit buttons to the four static cards.
      [...grid.querySelectorAll(".service-card")].forEach((card,index)=>{
        let editBtn = card.querySelector(".altariq-service-edit-btn");
        if(!editBtn){
          editBtn = document.createElement("button");
          editBtn.type = "button";
          editBtn.className = "altariq-service-edit-btn";
          editBtn.textContent = "✎ تعديل الخدمة";
          card.prepend(editBtn);
        }
        if(!card.dataset.serviceOrder) card.dataset.serviceOrder = String(index + 1);
      });
    }
  }

  function closePreviewUrl(){
    if(previewObjectUrl){
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = "";
    }
  }

  function resetForm(){
    closePreviewUrl();
    form.reset();
    editServiceId = null;
    editServiceOrder = null;
    editExistingImage = "";
    document.getElementById("altariqServiceIcon").value = "✦";
    document.getElementById("altariqServiceVisible").checked = true;
    preview.removeAttribute("src");
    preview.style.display = "none";
    count.textContent = "0";
    document.querySelector("#altariqServiceModal .asm-head h2").textContent = "إضافة خدمة جديدة";
    submit.textContent = "إضافة ونشر";
    setStatus("");
  }

  async function openServiceModal(){
    resetForm();
    document.getElementById("altariqServiceNumber").value = await getNextNumber();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    setTimeout(()=>document.getElementById("altariqServiceName")?.focus(),50);
  }

  async function openEditServiceModal(serviceId, serviceOrder){
    resetForm();

    try{
      const items = await getAllServices();
      let service = null;

      if(serviceId){
        service = items.find(s=>String(s.id)===String(serviceId)) || null;
      }

      if(!service && serviceOrder){
        service = items.find(s=>Number(s.order || s.number || 0)===Number(serviceOrder)) || null;
      }

      if(!service){
        setStatus("تعذر العثور على بيانات هذه الخدمة في Firebase.",true);
        modal.classList.add("open");
        modal.setAttribute("aria-hidden","false");
        return;
      }

      editServiceId = String(service.id);
      editServiceOrder = Number(service.order || service.number || 0) || null;
      editExistingImage = String(service.image || service.imageUrl || service.publicImage || "");

      document.querySelector("#altariqServiceModal .asm-head h2").textContent = "تعديل الخدمة";
      document.getElementById("altariqServiceName").value = service.name || service.title || "";
      document.getElementById("altariqServiceKicker").value = service.kicker || "";
      document.getElementById("altariqServiceNumber").value = String(service.number || service.order || "").padStart(2,"0");
      document.getElementById("altariqServiceIcon").value = service.icon || "✦";
      description.value = String(service.description || "").slice(0,500);
      count.textContent = String(description.value.length);
      document.getElementById("altariqServiceVisible").checked = service.visible !== false;

      if(editExistingImage){
        preview.src = editExistingImage;
        preview.style.display = "block";
      }

      submit.textContent = "حفظ التعديلات";
      modal.classList.add("open");
      modal.setAttribute("aria-hidden","false");
      setTimeout(()=>document.getElementById("altariqServiceName")?.focus(),50);
    }catch(error){
      console.error("Open service editor failed:",error);
      alert("تعذر فتح بيانات الخدمة للتعديل.");
    }
  }

  function closeServiceModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    closePreviewUrl();
  }

  // This is the bridge fired by the header "Add Service" button.
  window.addEventListener("altariq:add-service-requested", openServiceModal);

  // Also bind directly, so the button works even if the old bridge code changes later.
  document.getElementById("quickAddService")?.addEventListener("click",()=>{
    const servicesPage = document.getElementById("services");
    if(servicesPage?.classList.contains("active")){
      openServiceModal();
    }
  });

  document.getElementById("adminServicesGrid")?.addEventListener("click",event=>{
    const button = event.target.closest(".altariq-service-edit-btn");
    if(!button) return;

    event.preventDefault();
    event.stopPropagation();

    const card = button.closest(".service-card");
    if(!card) return;

    openEditServiceModal(
      card.dataset.serviceId || "",
      card.dataset.serviceOrder || ""
    );
  });

  document.getElementById("altariqServiceClose").addEventListener("click",closeServiceModal);
  document.getElementById("altariqServiceCancel").addEventListener("click",closeServiceModal);
  modal.addEventListener("click",e=>{ if(e.target===modal) closeServiceModal(); });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && modal.classList.contains("open")) closeServiceModal();
  });

  description.addEventListener("input",()=>{
    if(description.value.length > 500){
      description.value = description.value.slice(0,500);
    }
    count.textContent = String(description.value.length);
  });

  fileInput.addEventListener("change",()=>{
    const file = fileInput.files?.[0];
    closePreviewUrl();

    if(!file){
      preview.style.display="none";
      return;
    }

    if(!file.type.startsWith("image/")){
      alert("اختر ملف صورة فقط.");
      fileInput.value="";
      preview.style.display="none";
      return;
    }

    if(file.size > 10 * 1024 * 1024){
      alert("حجم الصورة أكبر من 10MB.");
      fileInput.value="";
      preview.style.display="none";
      return;
    }

    previewObjectUrl = URL.createObjectURL(file);
    preview.src = previewObjectUrl;
    preview.style.display = "block";
  });

  async function uploadImage(file){
    if(!file) return "";

    if(file.size > 10 * 1024 * 1024){
      throw new Error("حجم الصورة أكبر من 10MB.");
    }

    const body = new FormData();
    body.append("file",file);
    body.append("upload_preset",UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL,{
      method:"POST",
      body
    });

    const result = await response.json().catch(()=>({}));

    if(!response.ok){
      throw new Error(result?.error?.message || "فشل رفع الصورة إلى Cloudinary.");
    }

    if(!result.secure_url){
      throw new Error("Cloudinary لم يرجع رابط الصورة.");
    }

    return result.secure_url;
  }

  function updateLocalService(service){
    try{
      let list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      if(!Array.isArray(list)) list=[];

      const i = list.findIndex(x=>String(x.id)===String(service.id));
      if(i>=0) list[i]=service;
      else list.push(service);

      list.sort((a,b)=>(Number(a.order)||99)-(Number(b.order)||99));
      localStorage.setItem(LOCAL_KEY,JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("altariq:services-updated",{detail:list}));
    }catch(e){
      console.warn("Could not save service locally:",e);
    }
  }

  form.addEventListener("submit",async e=>{
    e.preventDefault();

    const isEditing = Boolean(editServiceId);
    const name = document.getElementById("altariqServiceName").value.trim();
    const kicker = document.getElementById("altariqServiceKicker").value.trim();
    const number = document.getElementById("altariqServiceNumber").value.trim() || await getNextNumber();
    const icon = document.getElementById("altariqServiceIcon").value.trim() || "✦";
    const desc = description.value.trim().slice(0,500);
    const visible = document.getElementById("altariqServiceVisible").checked;
    const file = fileInput.files?.[0] || null;

    if(!name){
      setStatus("اكتب اسم الخدمة.",true);
      return;
    }

    // New services require an image. Existing services can keep their current image.
    if(!isEditing && !file){
      setStatus("اختر صورة للخدمة من جهازك.",true);
      return;
    }

    submit.disabled = true;
    submit.textContent = isEditing ? "جاري حفظ التعديلات..." : "جاري الرفع والحفظ...";

    try{
      let image = editExistingImage;

      if(file){
        setStatus("جاري رفع صورة الخدمة إلى Cloudinary...");
        image = await uploadImage(file);
      }

      setStatus(isEditing ? "جاري حفظ التعديلات في Firebase..." : "تم رفع الصورة. جاري حفظ الخدمة في Firebase...");

      const numericOrder = Number(number) || editServiceOrder || 99;
      const id = isEditing ? editServiceId : `service-${String(number).padStart(2,"0")}-${Date.now()}`;
      const now = new Date().toISOString();

      const service = {
        id,
        number:String(number).padStart(2,"0"),
        order:numericOrder,
        icon,
        kicker,
        name,
        title:name,
        description:desc,
        image,
        imageUrl:image,
        publicImage:image,
        visible,
        published:visible,
        status:visible ? "Published" : "Draft",
        updated:now
      };

      if(!isEditing) service.createdAt = now;

      await setDoc(doc(db,"services",id),service,{merge:isEditing});

      try{
        await setDoc(doc(db,"website_services",id),service,{merge:isEditing});
      }catch(compatError){
        console.warn("website_services compatibility save skipped:",compatError);
      }

      updateLocalService(service);

      window.dispatchEvent(new CustomEvent("altariq:service-added",{detail:service}));
      window.dispatchEvent(new CustomEvent("altariq:services-updated"));

      await refreshAddedServices();

      setStatus(isEditing ? "✅ تم تعديل الخدمة بنجاح." : "✅ تم إضافة الخدمة ورفع الصورة ونشرها بنجاح.");
      closeServiceModal();

      setTimeout(()=>{
        try{
          document.querySelector('.nav-btn[data-page="services"]')?.click();
        }catch{}
      },250);

    }catch(error){
      console.error(isEditing ? "Edit service failed:" : "Add service failed:",error);
      setStatus("❌ " + (error?.message || (isEditing ? "تعذر تعديل الخدمة." : "تعذر إضافة الخدمة.")),true);
    }finally{
      submit.disabled=false;
      submit.textContent = editServiceId ? "حفظ التعديلات" : "إضافة ونشر";
    }
  });

  // Load services added after the original four whenever the admin opens.
  refreshAddedServices();

  // Also refresh when another part of the admin reports a services update.
  window.addEventListener("altariq:service-added", ()=>refreshAddedServices());

  console.info("✅ Service manager ready — Add + Edit + device upload + Cloudinary + Firestore.");
