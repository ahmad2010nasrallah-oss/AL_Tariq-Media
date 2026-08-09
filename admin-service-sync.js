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
   FIREBASE
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
  authDomain: "al-tariq-media.firebaseapp.com",
  projectId: "al-tariq-media",
  storageBucket: "al-tariq-media.firebasestorage.app",
  messagingSenderId: "616239800441",
  appId: "1:616239800441:web:53edc96e1cc872702cb4a8",
  measurementId: "G-42KJKNDJDF"
};


const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);


const db = getFirestore(app);


/* =========================================================
   CLOUDINARY
========================================================= */

const CLOUDINARY_CLOUD_NAME =
  "ql544zkl";

const CLOUDINARY_UPLOAD_PRESET =
  "altariq_services_upload";


/* =========================================================
   SERVICES CONFIG
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

const $ = (
  selector,
  root = document
) => root.querySelector(selector);


const $$ = (
  selector,
  root = document
) => [...root.querySelectorAll(selector)];


function cleanText(value = "") {

  return String(
    value || ""
  ).trim();

}


function escapeHtml(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]
  );

}


function showMessage(message) {

  if (
    typeof window.showToast ===
    "function"
  ) {

    window.showToast(message);

  } else {

    console.log(message);

  }

}


/* =========================================================
   FIX SERVICES PAGE TITLE
   خدمات الخدمات → الخدمات
========================================================= */

function fixServicesTitle() {

  if (!servicesPage) {
    return;
  }


  const headings =
    servicesPage.querySelectorAll(
      "h1, h2, h3"
    );


  headings.forEach(
    heading => {

      const text =
        cleanText(
          heading.textContent
        );


      /*
        العنوان الرئيسي فقط
      */

      if (
        text === "خدمات الخدمات" ||
        text === "Company Services" ||
        text === "Services Services"
      ) {

        heading.innerHTML = `
          <span
            style="
              color:#ffc400;
              font-weight:900;
            "
          >
            الخدمات
          </span>
        `;

      }

    }
  );

}


/* =========================================================
   READ ORIGINAL SERVICES
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
          new Date()
            .toISOString()

      };

    }
  );

}


const ORIGINAL_SERVICES =
  readOriginalServices();


/* =========================================================
   LOAD LOCAL DATA
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

    services =
      local;

  } else {

    services =
      [...ORIGINAL_SERVICES];

  }

} catch {

  services =
    [...ORIGINAL_SERVICES];

}


/* =========================================================
   SAVE LOCAL
========================================================= */

function saveLocal() {

  localStorage.setItem(
    SERVICES_KEY,
    JSON.stringify(
      services
    )
  );


  window.dispatchEvent(

    new CustomEvent(
      "altariq:services-updated",
      {
        detail:
          services
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
      .map(
        service =>
          Number(service.id)
      )
      .filter(
        value =>
          Number.isFinite(value)
      );


  const next =
    numbers.length
      ? Math.max(...numbers) + 1
      : 1;


  return String(next)
    .padStart(2, "0");

}


/* =========================================================
   CLOUDINARY IMAGE UPLOAD
========================================================= */

async function uploadImageToCloudinary(
  file
) {

  if (!file) {
    return "";
  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    throw new Error(
      "الملف المختار ليس صورة."
    );

  }


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


  const url =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


  const response =
    await fetch(
      url,
      {
        method:
          "POST",

        body:
          formData
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      "Cloudinary:",
      data
    );


    throw new Error(
      data?.error?.message ||
      "فشل رفع الصورة."
    );

  }


  if (!data.secure_url) {

    throw new Error(
      "لم يتم الحصول على رابط الصورة."
    );

  }


  return data.secure_url;

}


/* =========================================================
   CSS
========================================================= */

const style =
  document.createElement(
    "style"
  );


style.textContent = `

/* ==========================
   EDIT BUTTON
========================== */

.service-edit-chip{

  position:absolute;

  z-index:50;

  top:16px;

  right:16px;

  padding:9px 14px;

  border-radius:999px;

  border:
    1px solid rgba(255,255,255,.15);

  background:
    rgba(4,13,28,.85);

  color:#fff;

  font-size:12px;

  font-weight:700;

  cursor:pointer;

  backdrop-filter:
    blur(10px);

}


/* ==========================
   MODAL BACKDROP
========================== */

.service-manager-backdrop{

  position:fixed;

  inset:0;

  z-index:999999;

  display:none;

  align-items:center;

  justify-content:center;

  padding:20px;

  background:
    rgba(0,4,12,.85);

  backdrop-filter:
    blur(14px);

}


.service-manager-backdrop.open{

  display:flex;

}


/* ==========================
   MODAL
========================== */

.service-manager-modal{

  width:
    min(900px,100%);

  max-height:
    92vh;

  overflow:auto;

  padding:30px;

  border-radius:30px;

  border:
    1px solid rgba(255,255,255,.12);

  background:
    linear-gradient(
      145deg,
      #0b1e3a,
      #061326
    );

  box-shadow:
    0 40px 100px rgba(0,0,0,.55);

  color:#fff;

}


/* ==========================
   HEADER
========================== */

.service-manager-header{

  display:flex;

  align-items:center;

  justify-content:
    space-between;

  gap:20px;

  margin-bottom:25px;

}


.service-manager-header h2{

  margin:0;

  font-size:28px;

  color:#fff;

}


.service-manager-close{

  width:44px;

  height:44px;

  border:none;

  border-radius:14px;

  background:
    rgba(255,255,255,.08);

  color:#fff;

  font-size:18px;

  cursor:pointer;

}


/* ==========================
   GRID
========================== */

.service-manager-grid{

  display:grid;

  grid-template-columns:
    repeat(2,minmax(0,1fr));

  gap:18px;

}


.service-manager-grid .full{

  grid-column:
    1 / -1;

}


/* ==========================
   LABEL
========================== */

.service-manager-grid label{

  display:flex;

  flex-direction:column;

  gap:8px;

  font-size:13px;

  font-weight:700;

  color:#e8edf6;

}


/* ==========================
   INPUT
========================== */

.service-manager-grid input,
.service-manager-grid textarea{

  width:100%;

  box-sizing:
    border-box;

  padding:14px 16px;

  border-radius:14px;

  border:
    1px solid rgba(255,255,255,.12);

  outline:none;

  background:
    rgba(255,255,255,.055);

  color:#fff;

}


.service-manager-grid input:focus,
.service-manager-grid textarea:focus{

  border-color:#ffc400;

}


.service-manager-grid textarea{

  min-height:130px;

  resize:vertical;

}


/* ==========================
   FILE
========================== */

.service-upload-box{

  padding:20px;

  border:
    1px dashed rgba(255,196,0,.45);

  border-radius:18px;

  background:
    rgba(255,196,0,.035);

}


.service-upload-box small{

  display:block;

  margin-top:8px;

  color:#ffc400;

}


/* ==========================
   PREVIEW
========================== */

.service-preview-box{

  display:none;

  min-height:220px;

  align-items:center;

  justify-content:center;

  overflow:hidden;

  border-radius:20px;

  border:
    1px solid rgba(255,255,255,.1);

  background:#040b16;

}


.service-preview-box.show{

  display:flex;

}


.service-preview-box img{

  width:100%;

  max-height:350px;

  object-fit:contain;

}


/* ==========================
   CHECKBOX
========================== */

.service-checkbox{

  flex-direction:row !important;

  align-items:center;

  justify-content:flex-start;

  gap:12px !important;

}


.service-checkbox input{

  width:auto;

}


/* ==========================
   BUTTONS
========================== */

.service-manager-actions{

  display:flex;

  justify-content:flex-end;

  gap:12px;

  margin-top:25px;

}


.service-save-btn{

  padding:13px 22px;

  border:none;

  border-radius:15px;

  background:
    linear-gradient(
      135deg,
      #ffc400,
      #ffdc65
    );

  color:#071326;

  font-weight:900;

  cursor:pointer;

}


.service-save-btn:disabled{

  opacity:.55;

  cursor:not-allowed;

}


.service-cancel-btn{

  padding:13px 22px;

  border-radius:15px;

  border:
    1px solid rgba(255,255,255,.12);

  background:
    rgba(255,255,255,.055);

  color:#fff;

  font-weight:700;

  cursor:pointer;

}


/* ==========================
   STATUS
========================== */

.service-upload-status{

  display:none;

  padding:12px;

  margin-top:12px;

  border-radius:12px;

  background:
    rgba(255,196,0,.08);

  color:#ffc400;

}


.service-upload-status.show{

  display:block;

}


/* ==========================
   HIDDEN SERVICE ADMIN
========================== */

.service-hidden-admin{

  opacity:.55;

}


/* ==========================
   MOBILE
========================== */

@media(max-width:700px){

  .service-manager-grid{

    grid-template-columns:
      1fr;

  }


  .service-manager-grid .full{

    grid-column:auto;

  }

}

`;


document.head.appendChild(
  style
);


/* =========================================================
   CREATE MODAL
========================================================= */

const backdrop =
  document.createElement(
    "div"
  );


backdrop.className =
  "service-manager-backdrop";


backdrop.id =
  "serviceManagerBackdrop";


backdrop.innerHTML = `

<form
  class="service-manager-modal"
  id="serviceManagerForm"
>

  <div
    class="service-manager-header"
  >

    <h2
      id="serviceManagerTitle"
    >
      إضافة خدمة جديدة
    </h2>


    <button
      type="button"
      class="service-manager-close"
      id="serviceManagerClose"
    >
      ✕
    </button>

  </div>


  <div
    class="service-manager-grid"
  >


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
        placeholder="Digital Marketing"
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


    <label
      class="service-checkbox"
    >

      <input
        id="serviceVisible"
        type="checkbox"
        checked
      >

      إظهار الخدمة في الموقع

    </label>


    <label class="full">

      الوصف

      <textarea
        id="serviceDescription"
      ></textarea>

    </label>


    <label
      class="
        full
        service-upload-box
      "
    >

      اختر صورة من الجهاز

      <input
        id="serviceImageFile"
        type="file"
        accept="
          image/jpeg,
          image/png,
          image/webp,
          image/gif
        "
      >

      <small>

        JPG / PNG / WEBP —
        الحد الأقصى 10MB

      </small>

    </label>


    <div
      class="
        full
        service-preview-box
      "
      id="servicePreviewBox"
    >

      <img
        id="servicePreview"
        alt="معاينة الصورة"
      >

    </div>


    <div
      class="
        full
        service-upload-status
      "
      id="serviceUploadStatus"
    >

      ⏳ جاري رفع الصورة إلى Cloudinary...

    </div>


  </div>


  <div
    class="service-manager-actions"
  >


    <button
      type="button"
      class="service-cancel-btn"
      id="serviceCancel"
    >
      إلغاء
    </button>


    <button
      type="submit"
      class="service-save-btn"
      id="serviceSave"
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
   FORM ELEMENTS
========================================================= */

const form =
  $("#serviceManagerForm");


const modalTitle =
  $("#serviceManagerTitle");


const nameInput =
  $("#serviceName");


const kickerInput =
  $("#serviceKicker");


const numberInput =
  $("#serviceNumber");


const iconInput =
  $("#serviceIcon");


const orderInput =
  $("#serviceOrder");


const visibleInput =
  $("#serviceVisible");


const descriptionInput =
  $("#serviceDescription");


const imageFileInput =
  $("#serviceImageFile");


const preview =
  $("#servicePreview");


const previewBox =
  $("#servicePreviewBox");


const uploadStatus =
  $("#serviceUploadStatus");


const saveButton =
  $("#serviceSave");


/* =========================================================
   MODAL STATE
========================================================= */

let mode =
  "add";


let editingId =
  null;


let currentImage =
  "";


let selectedFile =
  null;


let objectUrl =
  null;


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function clearObjectUrl() {

  if (objectUrl) {

    URL.revokeObjectURL(
      objectUrl
    );

    objectUrl =
      null;

  }

}


function setPreview(url) {

  if (!url) {

    preview.removeAttribute(
      "src"
    );


    previewBox.classList.remove(
      "show"
    );


    return;

  }


  preview.src =
    url;


  previewBox.classList.add(
    "show"
  );

}


/* =========================================================
   OPEN ADD
========================================================= */

function openAddService() {

  mode =
    "add";


  editingId =
    null;


  currentImage =
    "";


  selectedFile =
    null;


  clearObjectUrl();


  form.reset();


  modalTitle.textContent =
    "إضافة خدمة جديدة";


  const id =
    getNextServiceId();


  numberInput.value =
    id;


  orderInput.value =
    Number(id);


  iconInput.value =
    "✦";


  visibleInput.checked =
    true;


  imageFileInput.value =
    "";


  setPreview("");


  backdrop.classList.add(
    "open"
  );

}


/* =========================================================
   OPEN EDIT
========================================================= */

function openEditService(id) {

  const service =
    services.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!service) {
    return;
  }


  mode =
    "edit";


  editingId =
    String(service.id);


  currentImage =
    service.image || "";


  selectedFile =
    null;


  clearObjectUrl();


  form.reset();


  modalTitle.textContent =
    "تعديل الخدمة";


  nameInput.value =
    service.name ||
    service.title ||
    "";


  kickerInput.value =
    service.kicker ||
    "";


  numberInput.value =
    service.number ||
    service.id ||
    "";


  iconInput.value =
    service.icon ||
    "✦";


  orderInput.value =
    service.order ||
    1;


  visibleInput.checked =
    service.visible !== false;


  descriptionInput.value =
    service.description ||
    "";


  imageFileInput.value =
    "";


  setPreview(
    currentImage
  );


  backdrop.classList.add(
    "open"
  );

}


/* =========================================================
   CLOSE
========================================================= */

function closeModal() {

  backdrop.classList.remove(
    "open"
  );


  selectedFile =
    null;


  clearObjectUrl();

}


/* =========================================================
   CLOSE EVENTS
========================================================= */

$("#serviceManagerClose")
  .addEventListener(
    "click",
    closeModal
  );


$("#serviceCancel")
  .addEventListener(
    "click",
    closeModal
  );


backdrop.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      backdrop
    ) {

      closeModal();

    }

  }
);


/* =========================================================
   SELECT IMAGE
========================================================= */

imageFileInput.addEventListener(
  "change",
  event => {

    const file =
      event.target.files?.[0];


    if (!file) {

      selectedFile =
        null;

      return;

    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "اختر صورة فقط."
      );


      imageFileInput.value =
        "";


      return;

    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      alert(
        "حجم الصورة أكبر من 10MB."
      );


      imageFileInput.value =
        "";


      return;

    }


    selectedFile =
      file;


    clearObjectUrl();


    objectUrl =
      URL.createObjectURL(
        file
      );


    setPreview(
      objectUrl
    );

  }
);


/* =========================================================
   UPDATE ORIGINAL CARD
========================================================= */

function updateCard(
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


  if (
    image &&
    service.image
  ) {

    image.src =
      service.image;

  }


  if (
    service.visible === false
  ) {

    card.classList.add(
      "service-hidden-admin"
    );

  } else {

    card.classList.remove(
      "service-hidden-admin"
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
   RENDER SERVICES
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


      updateCard(
        card,
        service
      );

    }
  );


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


  services
    .slice(
      originalCards.length
    )
    .forEach(
      service => {

        const baseCard =
          originalCards[0];


        if (!baseCard) {
          return;
        }


        const card =
          baseCard.cloneNode(
            true
          );


        card.classList.add(
          "dynamic-service-card"
        );


        card
          .querySelectorAll(
            ".service-edit-chip"
          )
          .forEach(
            element =>
              element.remove()
          );


        card
          .querySelectorAll(
            "[id]"
          )
          .forEach(
            element =>
              element.removeAttribute(
                "id"
              )
          );


        updateCard(
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
   SAVE SERVICE
========================================================= */

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    saveButton.disabled =
      true;


    saveButton.textContent =
      selectedFile
        ? "جاري رفع الصورة..."
        : "جاري الحفظ...";


    try {


      let imageUrl =
        currentImage;


      if (selectedFile) {

        uploadStatus.classList.add(
          "show"
        );


        imageUrl =
          await uploadImageToCloudinary(
            selectedFile
          );


        uploadStatus.classList.remove(
          "show"
        );

      }


      const serviceName =
        cleanText(
          nameInput.value
        );


      if (!serviceName) {

        throw new Error(
          "اكتب اسم الخدمة."
        );

      }


      const id =
        mode === "edit"
          ? editingId
          : getNextServiceId();


      const service = {

        id:
          String(id),

        name:
          serviceName,

        title:
          serviceName,

        kicker:
          cleanText(
            kickerInput.value
          ) ||
          "Service",

        number:
          cleanText(
            numberInput.value
          ) ||
          String(id),

        icon:
          cleanText(
            iconInput.value
          ) ||
          "✦",

        order:
          Number(
            orderInput.value
          ) ||
          Number(id) ||
          1,

        description:
          cleanText(
            descriptionInput.value
          ),

        image:
          imageUrl ||
          "",

        visible:
          visibleInput.checked,

        published:
          visibleInput.checked,

        updated:
          new Date()
            .toISOString()

      };


      await setDoc(

        doc(
          db,
          SERVICES_COLLECTION,
          String(id)
        ),

        service,

        {
          merge:false
        }

      );


      const index =
        services.findIndex(
          item =>
            String(item.id) ===
            String(id)
        );


      if (
        index >= 0
      ) {

        services[index] =
          service;

      } else {

        services.push(
          service
        );

      }


      saveLocal();

      renderServices();

      closeModal();


      showMessage(
        mode === "add"
          ? "تمت إضافة الخدمة."
          : "تم تعديل الخدمة."
      );


      console.log(
        `✅ Service ${id} saved successfully.`
      );


    } catch (error) {


      console.error(
        error
      );


      alert(
        error.message ||
        "حدث خطأ أثناء الحفظ."
      );


    } finally {


      uploadStatus.classList.remove(
        "show"
      );


      saveButton.disabled =
        false;


      saveButton.textContent =
        "حفظ ونشر";

    }

  }
);


/* =========================================================
   FIRESTORE LIVE SYNC
========================================================= */

onSnapshot(

  collection(
    db,
    SERVICES_COLLECTION
  ),

  snapshot => {


    const remote =
      snapshot.docs

        .map(
          item => ({
            id:
              item.id,

            ...item.data()
          })
        )

        .filter(
          item =>
            /^\d+$/.test(
              String(
                item.id
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


    if (!remote.length) {
      return;
    }


    services =
      remote;


    saveLocal();

    renderServices();

  },

  error => {

    console.error(
      "Services listener:",
      error
    );

  }

);


/* =========================================================
   SEED ORIGINAL SERVICES
========================================================= */

async function seedMissingServices() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          SERVICES_COLLECTION
        )
      );


    const ids =
      new Set(
        snapshot.docs.map(
          item =>
            String(
              item.id
            )
        )
      );


    for (
      let i = 0;
      i <
      ORIGINAL_SERVICES.length;
      i++
    ) {


      const id =
        String(i + 1)
          .padStart(2, "0");


      if (
        ids.has(id)
      ) {

        continue;

      }


      await setDoc(

        doc(
          db,
          SERVICES_COLLECTION,
          id
        ),

        {
          ...ORIGINAL_SERVICES[i],

          id,

          number:
            id,

          order:
            i + 1

        },

        {
          merge:false
        }

      );


      console.log(
        `✅ Service ${id} created.`
      );

    }


  } catch (error) {

    console.error(
      "Seed services:",
      error
    );

  }

}


/* =========================================================
   HEADER BUTTON
========================================================= */

let headerButton =
  null;


let originalHeaderContent =
  null;


function findHeaderButton() {

  const elements = [
    ...document.querySelectorAll(
      "button, a"
    )
  ];


  return elements.find(
    element => {

      const text =
        cleanText(
          element.textContent
        );


      return (
        text.includes(
          "إضافة مشروع جديد"
        )
        ||
        text.includes(
          "Add New Project"
        )
        ||
        element.dataset
          .serviceAdd ===
          "1"
      );

    }
  );

}


/* =========================================================
   CHECK IF SERVICES PAGE ACTIVE
========================================================= */

function isServicesPageActive() {

  if (!servicesPage) {
    return false;
  }


  if (
    servicesPage.classList
      .contains("active")
  ) {

    return true;

  }


  const computed =
    getComputedStyle(
      servicesPage
    );


  return (
    computed.display !== "none"
    &&
    computed.visibility !== "hidden"
    &&
    servicesPage.offsetParent !== null
  );

}


/* =========================================================
   UPDATE HEADER
========================================================= */

function updateServicesHeader() {

  fixServicesTitle();


  if (!headerButton) {

    headerButton =
      findHeaderButton();


    if (
      headerButton &&
      originalHeaderContent ===
      null
    ) {

      originalHeaderContent =
        headerButton.innerHTML;

    }

  }


  if (!headerButton) {
    return;
  }


  if (
    isServicesPageActive()
  ) {

    headerButton.innerHTML =
      "+ إضافة خدمة جديدة +";


    headerButton.dataset
      .serviceAdd =
        "1";

  } else {

    if (
      originalHeaderContent
    ) {

      headerButton.innerHTML =
        originalHeaderContent;

    }

  }

}


/* =========================================================
   INTERCEPT ADD BUTTON
========================================================= */

document.addEventListener(
  "click",
  event => {


    updateServicesHeader();


    if (
      !headerButton ||
      !isServicesPageActive()
    ) {

      return;

    }


    const clicked =
      event.target ===
      headerButton
      ||
      headerButton.contains(
        event.target
      );


    if (!clicked) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();

    event.stopImmediatePropagation();


    openAddService();

  },

  true
);


/* =========================================================
   WATCH PAGE CHANGES
========================================================= */

document.addEventListener(
  "click",
  () => {

    setTimeout(
      () => {

        updateServicesHeader();

        fixServicesTitle();

      },
      100
    );

  }
);


/*
  نراقب تغير اللغة أو الصفحة
*/

const pageObserver =
  new MutationObserver(
    () => {

      updateServicesHeader();

      fixServicesTitle();

    }
  );


pageObserver.observe(
  document.body,
  {
    subtree:true,
    childList:true,
    attributes:true,
    attributeFilter:[
      "class",
      "style",
      "hidden"
    ]
  }
);


/* =========================================================
   START
========================================================= */

saveLocal();

renderServices();

fixServicesTitle();


setTimeout(
  fixServicesTitle,
  150
);


setTimeout(
  updateServicesHeader,
  300
);


setTimeout(
  seedMissingServices,
  900
);


console.log(
  "✅ Services Manager Ready"
);


console.log(
  "✅ Services page title: الخدمات"
);


console.log(
  "☁️ Cloudinary:",
  CLOUDINARY_CLOUD_NAME
);


console.log(
  "📁 Upload preset:",
  CLOUDINARY_UPLOAD_PRESET
);
