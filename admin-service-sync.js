import {
  initializeApp,
  getApps
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
  authDomain: "al-tariq-media.firebaseapp.com",
  projectId: "al-tariq-media",
  storageBucket: "al-tariq-media.firebasestorage.app",
  messagingSenderId: "616239800441",
  appId: "1:616239800441:web:53edc96e1cc872702cb4a8"
};


const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   CLOUDINARY CONFIG
========================================================= */

const CLOUDINARY_CLOUD_NAME =
  "ql544zkl";

const CLOUDINARY_UPLOAD_PRESET =
  "altariq_services_upload";


/* =========================================================
   SERVICES SETTINGS
========================================================= */

const SERVICES_COLLECTION =
  "services";

const SERVICES_KEY =
  "altariq_media_services_v1";

const servicesPage =
  document.querySelector("#services");

const originalCards = [
  ...document.querySelectorAll(
    "#services .service-card"
  )
];


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];


function cleanText(value = "") {
  return String(value || "").trim();
}


function escapeHtml(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );

}


function showMessage(message) {

  if (
    typeof window.showToast ===
    "function"
  ) {

    window.showToast(message);

  } else {

    console.info(message);

  }

}


/* =========================================================
   READ ORIGINAL SERVICES FROM ADMIN
========================================================= */

function readOriginalServices() {

  return originalCards.map(
    (card, index) => {

      const id =
        String(index + 1)
          .padStart(2, "0");


      const name =
        cleanText(
          card.querySelector("h3")
            ?.textContent
        ) ||
        `Service ${index + 1}`;


      return {

        id,

        order:
          index + 1,

        number:
          cleanText(
            card.querySelector(
              ".service-number"
            )?.textContent
          ) ||
          id,

        icon:
          cleanText(
            card.querySelector(
              ".service-icon"
            )?.textContent
          ) ||
          "✦",

        kicker:
          cleanText(
            card.querySelector(
              ".service-kicker"
            )?.textContent
          ) ||
          "Service",

        name,

        title:
          name,

        description:
          cleanText(
            card.querySelector("p")
              ?.textContent
          ),

        image:
          card.querySelector("img")
            ?.src ||
          "",

        visible:
          true,

        published:
          true,

        updated:
          new Date().toISOString()

      };

    }
  );

}


const ORIGINAL_SERVICES =
  readOriginalServices();


/* =========================================================
   LOAD LOCAL SERVICES
========================================================= */

let services = [];

try {

  const local =
    JSON.parse(
      localStorage.getItem(
        SERVICES_KEY
      ) || "[]"
    );


  if (
    Array.isArray(local) &&
    local.length
  ) {

    services = local;

  } else {

    services =
      [...ORIGINAL_SERVICES];

  }

} catch {

  services =
    [...ORIGINAL_SERVICES];

}


/* =========================================================
   SAVE LOCAL COPY
========================================================= */

function saveLocal() {

  localStorage.setItem(
    SERVICES_KEY,
    JSON.stringify(services)
  );


  window.dispatchEvent(
    new CustomEvent(
      "altariq:services-updated",
      {
        detail: services
      }
    )
  );

}


/* =========================================================
   NEXT SERVICE ID
========================================================= */

function getNextServiceId() {

  const numbers =
    services
      .map(service =>
        Number(service.id)
      )
      .filter(number =>
        Number.isFinite(number)
      );


  const next =
    numbers.length
      ? Math.max(...numbers) + 1
      : 1;


  return String(next)
    .padStart(2, "0");

}


/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

async function uploadImageToCloudinary(file) {

  if (!file) {
    return "";
  }


  if (
    !file.type.startsWith("image/")
  ) {

    throw new Error(
      "الملف المختار ليس صورة."
    );

  }


  /*
    10 MB maximum from admin.
  */

  if (
    file.size >
    10 * 1024 * 1024
  ) {

    throw new Error(
      "حجم الصورة أكبر من 10MB."
    );

  }


  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );


  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );


  const endpoint =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


  const response =
    await fetch(
      endpoint,
      {
        method: "POST",
        body: formData
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    console.error(
      "Cloudinary upload error:",
      result
    );


    throw new Error(
      result?.error?.message ||
      "تعذر رفع الصورة إلى Cloudinary."
    );

  }


  if (!result.secure_url) {

    throw new Error(
      "لم يرجع Cloudinary رابط الصورة."
    );

  }


  return result.secure_url;

}


/* =========================================================
   STYLES
========================================================= */

const style =
  document.createElement("style");


style.textContent = `

.service-edit-chip{

  position:absolute;

  z-index:20;

  top:14px;

  right:14px;

  border:
    1px solid rgba(255,255,255,.18);

  background:
    rgba(2,11,24,.84);

  color:#fff;

  border-radius:999px;

  padding:
    8px 12px;

  font-size:11px;

  cursor:pointer;

  backdrop-filter:
    blur(10px);

  box-shadow:
    0 8px 25px rgba(0,0,0,.25);

}


.service-edit-chip:hover{

  border-color:
    rgba(255,196,0,.65);

}


/* ======================================
   MODAL
====================================== */

.service-modal-backdrop{

  position:fixed;

  inset:0;

  z-index:30000;

  display:none;

  place-items:center;

  padding:20px;

  background:
    rgba(0,5,13,.84);

  backdrop-filter:
    blur(14px);

}


.service-modal-backdrop.open{

  display:grid;

}


.service-modal{

  width:
    min(780px,100%);

  max-height:
    92vh;

  overflow:auto;

  padding:
    26px;

  border-radius:
    28px;

  background:
    linear-gradient(
      145deg,
      rgba(11,29,55,.99),
      rgba(4,13,28,.99)
    );

  border:
    1px solid rgba(255,255,255,.12);

  box-shadow:
    0 30px 100px rgba(0,0,0,.58);

}


.service-modal-head{

  display:flex;

  align-items:center;

  justify-content:
    space-between;

  gap:15px;

  margin-bottom:
    22px;

}


.service-modal-head h3{

  margin:0;

  color:#fff;

  font-size:24px;

}


.service-modal-close{

  width:42px;

  height:42px;

  border-radius:12px;

  border:
    1px solid rgba(255,255,255,.12);

  background:
    rgba(255,255,255,.06);

  color:#fff;

  cursor:pointer;

  font-size:18px;

}


.service-modal-grid{

  display:grid;

  grid-template-columns:
    1fr 1fr;

  gap:15px;

}


.service-modal-grid .full{

  grid-column:
    1 / -1;

}


.service-modal label{

  display:grid;

  gap:8px;

  color:#fff;

  font-size:12px;

}


.service-modal input,
.service-modal textarea{

  width:100%;

  box-sizing:
    border-box;

  padding:
    12px 14px;

  border-radius:
    13px;

  border:
    1px solid rgba(255,255,255,.12);

  background:
    rgba(255,255,255,.055);

  color:#fff;

  outline:none;

}


.service-modal input:focus,
.service-modal textarea:focus{

  border-color:
    rgba(255,196,0,.65);

}


.service-modal textarea{

  min-height:
    110px;

  resize:vertical;

}


/* ======================================
   FILE UPLOAD
====================================== */

.service-file-box{

  border:
    1px dashed rgba(255,196,0,.4);

  border-radius:
    18px;

  padding:
    18px;

  background:
    rgba(255,196,0,.035);

}


.service-file-box input[type="file"]{

  cursor:pointer;

}


.service-file-note{

  margin-top:
    6px;

  color:
    #ffcf52;

  font-size:
    10px;

  line-height:
    1.7;

}


/* ======================================
   IMAGE PREVIEW
====================================== */

.service-preview-wrap{

  display:none;

  position:relative;

  min-height:
    220px;

  border-radius:
    18px;

  overflow:hidden;

  background:
    #071326;

  border:
    1px solid rgba(255,255,255,.1);

}


.service-preview-wrap.visible{

  display:grid;

  place-items:center;

}


.service-preview-wrap img{

  width:100%;

  max-height:340px;

  object-fit:contain;

  display:block;

}


.service-upload-status{

  display:none;

  align-items:center;

  gap:8px;

  padding:
    11px 13px;

  border-radius:
    12px;

  background:
    rgba(255,196,0,.08);

  color:
    #ffd54d;

  font-size:
    12px;

}


.service-upload-status.show{

  display:flex;

}


/* ======================================
   CHECKBOX
====================================== */

.service-visible-row{

  display:flex !important;

  align-items:center;

  gap:10px !important;

}


.service-visible-row input{

  width:auto;

}


/* ======================================
   ACTIONS
====================================== */

.service-modal-actions{

  display:flex;

  justify-content:flex-end;

  gap:10px;

  margin-top:22px;

}


.service-modal-actions button{

  border-radius:
    14px;

  padding:
    12px 18px;

  cursor:pointer;

  font-weight:800;

}


.service-modal-save{

  border:0;

  background:
    linear-gradient(
      135deg,
      #ffc400,
      #ffdc61
    );

  color:
    #071326;

}


.service-modal-save:disabled{

  opacity:.55;

  cursor:not-allowed;

}


.service-modal-cancel{

  border:
    1px solid rgba(255,255,255,.12);

  background:
    rgba(255,255,255,.055);

  color:#fff;

}


/* ======================================
   DYNAMIC SERVICE
====================================== */

.dynamic-service-card{

  position:relative;

}


.dynamic-service-placeholder{

  width:100%;

  min-height:300px;

  display:grid;

  place-items:center;

  color:#ffc400;

  font-size:52px;

  background:
    #09101c;

}


.hidden-service-admin{

  opacity:.55;

}


@media(max-width:680px){

  .service-modal-grid{

    grid-template-columns:
      1fr;

  }


  .service-modal-grid .full{

    grid-column:auto;

  }

}

`;


document.head.appendChild(style);


/* =========================================================
   CREATE ONE MODAL FOR ADD + EDIT
========================================================= */

const backdrop =
  document.createElement("div");


backdrop.className =
  "service-modal-backdrop";


backdrop.id =
  "serviceManagerBackdrop";


backdrop.innerHTML = `

<form
  class="service-modal"
  id="serviceManagerForm"
>

  <div class="service-modal-head">

    <h3 id="serviceManagerTitle">
      إضافة خدمة جديدة
    </h3>

    <button
      type="button"
      class="service-modal-close"
      id="serviceManagerClose"
    >
      ✕
    </button>

  </div>


  <div class="service-modal-grid">


    <label>

      اسم الخدمة

      <input
        id="serviceName"
        required
      >

    </label>


    <label>

      العنوان الصغير

      <input
        id="serviceKicker"
        placeholder="Visual Production"
      >

    </label>


    <label>

      الرقم

      <input
        id="serviceNumber"
      >

    </label>


    <label>

      الأيقونة

      <input
        id="serviceIcon"
        maxlength="8"
        placeholder="✦"
      >

    </label>


    <label>

      الترتيب

      <input
        id="serviceOrder"
        type="number"
        min="1"
      >

    </label>


    <label class="service-visible-row">

      <input
        id="serviceVisible"
        type="checkbox"
        checked
      >

      إظهار الخدمة في الموقع

    </label>


    <label class="full">

      وصف الخدمة

      <textarea
        id="serviceDescription"
      ></textarea>

    </label>


    <label class="full service-file-box">

      اختر صورة من الجهاز

      <input
        id="serviceImageFile"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
      >

      <span class="service-file-note">

        اختر الصورة من الكمبيوتر مباشرة.
        الحد الأقصى من صفحة الأدمن 10MB.

      </span>

    </label>


    <div
      class="full service-preview-wrap"
      id="servicePreviewWrap"
    >

      <img
        id="servicePreview"
        alt="معاينة الصورة"
      >

    </div>


    <div
      class="full service-upload-status"
      id="serviceUploadStatus"
    >

      ⏳ جاري رفع الصورة...

    </div>


  </div>


  <div class="service-modal-actions">


    <button
      type="button"
      class="service-modal-cancel"
      id="serviceManagerCancel"
    >

      إلغاء

    </button>


    <button
      type="submit"
      class="service-modal-save"
      id="serviceManagerSave"
    >

      حفظ ونشر

    </button>


  </div>

</form>

`;


document.body.appendChild(
  backdrop
);


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const modalForm =
  $("#serviceManagerForm");

const modalTitle =
  $("#serviceManagerTitle");

const serviceName =
  $("#serviceName");

const serviceKicker =
  $("#serviceKicker");

const serviceNumber =
  $("#serviceNumber");

const serviceIcon =
  $("#serviceIcon");

const serviceOrder =
  $("#serviceOrder");

const serviceVisible =
  $("#serviceVisible");

const serviceDescription =
  $("#serviceDescription");

const serviceImageFile =
  $("#serviceImageFile");

const servicePreview =
  $("#servicePreview");

const servicePreviewWrap =
  $("#servicePreviewWrap");

const serviceUploadStatus =
  $("#serviceUploadStatus");

const serviceSaveButton =
  $("#serviceManagerSave");


/* =========================================================
   CURRENT EDIT STATE
========================================================= */

let modalMode =
  "add";

let editingServiceId =
  null;

let currentImageUrl =
  "";

let selectedImageFile =
  null;

let previewObjectUrl =
  null;


/* =========================================================
   RESET IMAGE PREVIEW
========================================================= */

function clearPreviewObjectUrl() {

  if (previewObjectUrl) {

    URL.revokeObjectURL(
      previewObjectUrl
    );

    previewObjectUrl =
      null;

  }

}


function showImagePreview(url) {

  if (!url) {

    servicePreview
      .removeAttribute("src");

    servicePreviewWrap
      .classList
      .remove("visible");

    return;

  }


  servicePreview.src =
    url;


  servicePreviewWrap
    .classList
    .add("visible");

}


/* =========================================================
   OPEN ADD SERVICE
========================================================= */

function openAddService() {

  modalMode =
    "add";

  editingServiceId =
    null;

  currentImageUrl =
    "";

  selectedImageFile =
    null;


  clearPreviewObjectUrl();


  modalForm.reset();


  modalTitle.textContent =
    "إضافة خدمة جديدة";


  const id =
    getNextServiceId();


  serviceNumber.value =
    id;


  serviceOrder.value =
    Number(id);


  serviceIcon.value =
    "✦";


  serviceVisible.checked =
    true;


  serviceImageFile.value =
    "";


  showImagePreview("");


  backdrop.classList.add(
    "open"
  );

}


/* =========================================================
   OPEN EDIT SERVICE
========================================================= */

function openEditService(id) {

  const service =
    services.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!service) {

    console.warn(
      "Service not found:",
      id
    );

    return;

  }


  modalMode =
    "edit";

  editingServiceId =
    String(service.id);

  currentImageUrl =
    service.image || "";

  selectedImageFile =
    null;


  clearPreviewObjectUrl();


  modalForm.reset();


  modalTitle.textContent =
    "تعديل الخدمة";


  serviceName.value =
    service.name ||
    service.title ||
    "";


  serviceKicker.value =
    service.kicker ||
    "";


  serviceNumber.value =
    service.number ||
    service.id ||
    "";


  serviceIcon.value =
    service.icon ||
    "✦";


  serviceOrder.value =
    Number(
      service.order ||
      service.id ||
      1
    );


  serviceDescription.value =
    service.description ||
    "";


  serviceVisible.checked =
    service.visible !== false;


  serviceImageFile.value =
    "";


  showImagePreview(
    currentImageUrl
  );


  backdrop.classList.add(
    "open"
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeServiceModal() {

  backdrop.classList.remove(
    "open"
  );


  selectedImageFile =
    null;


  serviceImageFile.value =
    "";


  clearPreviewObjectUrl();

}


/* =========================================================
   CLOSE EVENTS
========================================================= */

$("#serviceManagerClose")
  .addEventListener(
    "click",
    closeServiceModal
  );


$("#serviceManagerCancel")
  .addEventListener(
    "click",
    closeServiceModal
  );


backdrop.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      backdrop
    ) {

      closeServiceModal();

    }

  }
);


/* =========================================================
   SELECT IMAGE FROM DEVICE
========================================================= */

serviceImageFile.addEventListener(
  "change",
  event => {

    const file =
      event.target.files?.[0];


    if (!file) {

      selectedImageFile =
        null;

      return;

    }


    if (
      !file.type.startsWith("image/")
    ) {

      alert(
        "اختر ملف صورة فقط."
      );

      event.target.value =
        "";

      return;

    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      alert(
        "الصورة أكبر من 10MB."
      );

      event.target.value =
        "";

      return;

    }


    selectedImageFile =
      file;


    clearPreviewObjectUrl();


    previewObjectUrl =
      URL.createObjectURL(
        file
      );


    showImagePreview(
      previewObjectUrl
    );

  }
);


/* =========================================================
   UPDATE ORIGINAL CARD
========================================================= */

function updateOriginalCard(
  card,
  service
) {

  if (!card) {
    return;
  }


  card.dataset.serviceId =
    service.id;


  const number =
    card.querySelector(
      ".service-number"
    );

  if (number) {

    number.textContent =
      service.number ||
      service.id;

  }


  const icon =
    card.querySelector(
      ".service-icon"
    );

  if (icon) {

    icon.textContent =
      service.icon ||
      "✦";

  }


  const kicker =
    card.querySelector(
      ".service-kicker"
    );

  if (kicker) {

    kicker.textContent =
      service.kicker ||
      "Service";

  }


  const title =
    card.querySelector("h3");

  if (title) {

    title.textContent =
      service.name ||
      service.title ||
      "Service";

  }


  const description =
    card.querySelector("p");

  if (description) {

    description.textContent =
      service.description ||
      "";

  }


  const image =
    card.querySelector("img");


  if (image) {

    if (service.image) {

      image.src =
        service.image;

      image.style.display =
        "";

    } else {

      image.style.display =
        "none";

    }

  }


  if (
    service.visible === false
  ) {

    card.classList.add(
      "hidden-service-admin"
    );

  } else {

    card.classList.remove(
      "hidden-service-admin"
    );

  }


  let editButton =
    card.querySelector(
      ".service-edit-chip"
    );


  if (!editButton) {

    editButton =
      document.createElement(
        "button"
      );

    editButton.type =
      "button";

    editButton.className =
      "service-edit-chip";

    editButton.textContent =
      "✎ تعديل الخدمة";


    card.appendChild(
      editButton
    );

  }


  editButton.onclick =
    event => {

      event.preventDefault();

      event.stopPropagation();


      openEditService(
        service.id
      );

    };

}


/* =========================================================
   RENDER SERVICES IN ADMIN
========================================================= */

function renderServices() {

  services.sort(
    (a, b) =>
      Number(
        a.order ||
        a.id ||
        999
      )
      -
      Number(
        b.order ||
        b.id ||
        999
      )
  );


  /*
    First original HTML cards.
  */

  originalCards.forEach(
    (card, index) => {

      const service =
        services[index];


      if (!service) {

        card.style.display =
          "none";

        return;

      }


      card.style.display =
        "";


      updateOriginalCard(
        card,
        service
      );

    }
  );


  /*
    Remove old dynamic cards.
  */

  $$(".dynamic-service-card")
    .forEach(
      card =>
        card.remove()
    );


  const grid =
    originalCards[0]
      ?.parentElement;


  if (!grid) {

    return;

  }


  /*
    Extra services: 05, 06...
  */

  services
    .slice(
      originalCards.length
    )
    .forEach(
      service => {

        /*
          Clone the original service card
          so the new service has the same
          exact design as the admin.
        */

        const card =
          originalCards[0]
            .cloneNode(true);


        card.classList.add(
          "dynamic-service-card"
        );


        /*
          Avoid duplicate element IDs.
        */

        if (card.id) {

          card.removeAttribute(
            "id"
          );

        }


        card
          .querySelectorAll("[id]")
          .forEach(
            element =>
              element.removeAttribute(
                "id"
              )
          );


        /*
          Remove previous edit button
          copied from original.
        */

        card
          .querySelectorAll(
            ".service-edit-chip"
          )
          .forEach(
            button =>
              button.remove()
          );


        updateOriginalCard(
          card,
          service
        );


        grid.appendChild(
          card
        );

      }
    );

}


/* =========================================================
   SAVE ADD / EDIT SERVICE
========================================================= */

modalForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    serviceSaveButton.disabled =
      true;


    serviceSaveButton.textContent =
      selectedImageFile
        ? "جاري رفع الصورة..."
        : "جاري الحفظ...";


    try {

      let imageUrl =
        currentImageUrl;


      /*
        Upload selected file first.
      */

      if (selectedImageFile) {

        serviceUploadStatus
          .classList
          .add("show");


        imageUrl =
          await uploadImageToCloudinary(
            selectedImageFile
          );


        serviceUploadStatus
          .classList
          .remove("show");


        currentImageUrl =
          imageUrl;


        showImagePreview(
          imageUrl
        );

      }


      const name =
        cleanText(
          serviceName.value
        );


      if (!name) {

        throw new Error(
          "اكتب اسم الخدمة."
        );

      }


      let id;


      if (
        modalMode === "edit"
      ) {

        id =
          editingServiceId;

      } else {

        id =
          getNextServiceId();

      }


      const service = {

        id:

          String(id),

        name,

        title:
          name,

        kicker:
          cleanText(
            serviceKicker.value
          ) ||
          "Service",

        number:
          cleanText(
            serviceNumber.value
          ) ||
          String(id),

        icon:
          cleanText(
            serviceIcon.value
          ) ||
          "✦",

        order:
          Number(
            serviceOrder.value
          ) ||
          Number(id) ||
          1,

        description:
          cleanText(
            serviceDescription.value
          ),

        image:
          imageUrl || "",

        visible:
          serviceVisible.checked,

        published:
          serviceVisible.checked,

        updated:
          new Date()
            .toISOString()

      };


      /*
        Save to Firestore.
      */

      await setDoc(

        doc(
          db,
          SERVICES_COLLECTION,
          String(id)
        ),

        service,

        {
          merge: false
        }

      );


      /*
        Update local immediately.
      */

      const existingIndex =
        services.findIndex(
          item =>
            String(item.id) ===
            String(id)
        );


      if (
        existingIndex >= 0
      ) {

        services[
          existingIndex
        ] =
          service;

      } else {

        services.push(
          service
        );

      }


      saveLocal();

      renderServices();


      closeServiceModal();


      console.info(
        `✅ Service ${id} saved successfully.`,
        service
      );


      showMessage(
        modalMode === "add"
          ? "تمت إضافة الخدمة ونشرها."
          : "تم تعديل الخدمة ونشرها."
      );


    } catch (error) {


      serviceUploadStatus
        .classList
        .remove("show");


      console.error(
        "❌ Service save error:",
        error
      );


      alert(
        error.message ||
        "حدث خطأ أثناء حفظ الخدمة."
      );


    } finally {


      serviceSaveButton.disabled =
        false;


      serviceSaveButton.textContent =
        "حفظ ونشر";

    }

  }
);


/* =========================================================
   FIRESTORE LIVE LISTENER
========================================================= */

onSnapshot(

  collection(
    db,
    SERVICES_COLLECTION
  ),

  snapshot => {

    /*
      Ignore old random test documents.
      We use numeric IDs like:
      01, 02, 03...
    */

    const remoteServices =
      snapshot.docs

        .map(
          documentSnapshot => ({
            id:
              documentSnapshot.id,

            ...documentSnapshot.data()
          })
        )

        .filter(
          service =>
            /^\d+$/.test(
              String(
                service.id
              )
            )
        )

        .sort(
          (a, b) =>
            Number(
              a.order ||
              a.id ||
              999
            )
            -
            Number(
              b.order ||
              b.id ||
              999
            )
        );


    if (
      !remoteServices.length
    ) {

      return;

    }


    services =
      remoteServices;


    saveLocal();

    renderServices();

  },

  error => {

    console.error(
      "❌ Services Firestore listener:",
      error
    );

  }

);


/* =========================================================
   SEED ONLY MISSING ORIGINAL SERVICES
========================================================= */

async function seedMissingOriginalServices() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          SERVICES_COLLECTION
        )
      );


    const existingIds =
      new Set(
        snapshot.docs.map(
          documentSnapshot =>
            String(
              documentSnapshot.id
            )
        )
      );


    for (
      let index = 0;
      index <
      ORIGINAL_SERVICES.length;
      index++
    ) {


      const id =
        String(index + 1)
          .padStart(2, "0");


      /*
        Don't overwrite services
        already edited in Firestore.
      */

      if (
        existingIds.has(id)
      ) {

        continue;

      }


      const service = {

        ...ORIGINAL_SERVICES[
          index
        ],

        id,

        number:
          id,

        order:
          index + 1

      };


      await setDoc(

        doc(
          db,
          SERVICES_COLLECTION,
          id
        ),

        service,

        {
          merge:false
        }

      );


      console.info(
        `✅ Missing service ${id} created.`
      );

    }

  } catch (error) {

    console.error(
      "❌ Original services seed error:",
      error
    );

  }

}


/* =========================================================
   HEADER BUTTON
   + ADD SERVICE ONLY ON SERVICES PAGE
========================================================= */

let headerButton =
  null;

let originalHeaderHtml =
  null;


function findHeaderAddButton() {

  const candidates = [
    ...document.querySelectorAll(
      "button, a"
    )
  ];


  return candidates.find(
    element => {

      const label =
        cleanText(
          element.textContent
        );


      return (
        label.includes(
          "إضافة مشروع جديد"
        )
        ||
        label.includes(
          "Add New Project"
        )
        ||
        element.dataset
          .servicesAddButton ===
          "true"
      );

    }
  );

}


/* =========================================================
   CHECK SERVICES PAGE ACTIVE
========================================================= */

function servicesPageIsActive() {

  if (!servicesPage) {
    return false;
  }


  /*
    Works with most admin page systems:
    active class / display none / hidden.
  */

  if (
    servicesPage.classList
      .contains("active")
  ) {

    return true;

  }


  const style =
    getComputedStyle(
      servicesPage
    );


  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    servicesPage.offsetParent !== null
  );

}


/* =========================================================
   UPDATE HEADER BUTTON TEXT
========================================================= */

function updateHeaderButton() {

  if (!headerButton) {

    headerButton =
      findHeaderAddButton();


    if (
      headerButton &&
      originalHeaderHtml ===
      null
    ) {

      originalHeaderHtml =
        headerButton.innerHTML;

    }

  }


  if (!headerButton) {
    return;
  }


  if (
    servicesPageIsActive()
  ) {

    headerButton.innerHTML =
      "+ إضافة خدمة جديدة +";


    headerButton.dataset
      .servicesAddButton =
        "true";

  } else {

    if (
      originalHeaderHtml !==
      null
    ) {

      headerButton.innerHTML =
        originalHeaderHtml;

    }

  }

}


/* =========================================================
   INTERCEPT HEADER BUTTON ON SERVICES PAGE
========================================================= */

document.addEventListener(
  "click",
  event => {

    if (!headerButton) {

      updateHeaderButton();

    }


    if (
      !headerButton
      ||
      !servicesPageIsActive()
    ) {

      return;

    }


    const clickedButton =
      event.target ===
        headerButton
      ||
      headerButton.contains(
        event.target
      );


    if (!clickedButton) {
      return;
    }


    /*
      Stop Add Project action only
      while Services page is active.
    */

    event.preventDefault();

    event.stopPropagation();

    event.stopImmediatePropagation();


    openAddService();

  },

  true
);


/* =========================================================
   WATCH ADMIN PAGE CHANGES
========================================================= */

document.addEventListener(
  "click",
  () => {

    setTimeout(
      updateHeaderButton,
      80
    );

  }
);


const observer =
  new MutationObserver(
    () => {

      updateHeaderButton();

    }
  );


observer.observe(
  document.body,
  {
    subtree:true,
    attributes:true,
    attributeFilter:[
      "class",
      "style",
      "hidden"
    ]
  }
);


/* =========================================================
   INITIAL START
========================================================= */

saveLocal();

renderServices();


setTimeout(
  updateHeaderButton,
  300
);


setTimeout(
  seedMissingOriginalServices,
  900
);


/* =========================================================
   READY
========================================================= */

console.info(
  "✅ Service manager ready."
);

console.info(
  "☁️ Cloudinary:",
  CLOUDINARY_CLOUD_NAME
);

console.info(
  "📁 Upload preset:",
  CLOUDINARY_UPLOAD_PRESET
);
