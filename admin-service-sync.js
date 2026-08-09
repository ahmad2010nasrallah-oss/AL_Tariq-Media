import {
  initializeApp,
  getApps
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc
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
   SETTINGS
========================================================= */

const SERVICES_KEY =
  "altariq_media_services_v1";

const SERVICES_COLLECTION =
  "services";


const cards = [
  ...document.querySelectorAll(
    "#services .service-card"
  )
];


/* =========================================================
   READ THE 4 ORIGINAL SERVICES FROM ADMIN HTML
========================================================= */

function readServicesFromAdminCards() {

  return cards.map(
    (card, index) => {

      const id =
        String(index + 1)
          .padStart(2, "0");


      const name =
        card.querySelector("h3")
          ?.textContent
          .trim()
        ||
        `Service ${index + 1}`;


      return {

        id,

        order:
          index + 1,

        number:
          card.querySelector(
            ".service-number"
          )
            ?.textContent
            .trim()
          ||
          id,

        icon:
          card.querySelector(
            ".service-icon"
          )
            ?.textContent
            .trim()
          ||
          "✦",

        kicker:
          card.querySelector(
            ".service-kicker"
          )
            ?.textContent
            .trim()
          ||
          "Service",

        name,

        title:
          name,

        description:
          card.querySelector("p")
            ?.textContent
            .trim()
          ||
          "",

        image:
          card.querySelector("img")
            ?.src
          ||
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


/*
  نحفظ نسخة أصلية فور تحميل الصفحة.
  مهم جدًا حتى لا تغير بيانات Firestore القديمة
  محتوى الخدمات الأربع قبل عملية الرفع.
*/

const ORIGINAL_ADMIN_SERVICES =
  readServicesFromAdminCards();


/* =========================================================
   LOAD LOCAL DATA
========================================================= */

let savedServices = [];

try {

  const parsed =
    JSON.parse(
      localStorage.getItem(
        SERVICES_KEY
      ) || "[]"
    );

  if (
    Array.isArray(parsed)
  ) {

    savedServices =
      parsed;

  }

} catch {

  savedServices = [];

}


/* =========================================================
   MERGE ORIGINAL SERVICES WITH LOCAL SAVED EDITS
========================================================= */

let services =
  ORIGINAL_ADMIN_SERVICES.map(
    original => {

      /*
        نأخذ فقط الخدمات ذات IDs الصحيحة
        01 / 02 / 03 / 04.

        أي ID عشوائي قديم لن يسيطر
        على الخدمات الأصلية.
      */

      const saved =
        savedServices.find(
          item =>
            String(item.id) ===
            String(original.id)
        );


      if (!saved) {

        return {
          ...original
        };

      }


      return {

        ...original,
        ...saved,

        id:
          original.id,

        order:
          original.order

      };

    }
  );


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
   DRAW SERVICES INSIDE ADMIN
========================================================= */

function drawServices() {

  cards.forEach(
    (card, index) => {

      const service =
        services[index];

      if (!service) {
        return;
      }


      card.dataset.serviceId =
        service.id;


      /* NUMBER */

      const number =
        card.querySelector(
          ".service-number"
        );

      if (number) {

        number.textContent =
          service.number ||
          service.id;

      }


      /* ICON */

      const icon =
        card.querySelector(
          ".service-icon"
        );

      if (icon) {

        icon.textContent =
          service.icon ||
          "✦";

      }


      /* KICKER */

      const kicker =
        card.querySelector(
          ".service-kicker"
        );

      if (kicker) {

        kicker.textContent =
          service.kicker ||
          "Service";

      }


      /* TITLE */

      const title =
        card.querySelector(
          "h3"
        );

      if (title) {

        title.textContent =
          service.name ||
          service.title ||
          "Service";

      }


      /* DESCRIPTION */

      const description =
        card.querySelector(
          "p"
        );

      if (description) {

        description.textContent =
          service.description ||
          "";

      }


      /* IMAGE */

      const image =
        card.querySelector(
          "img"
        );

      if (
        image &&
        service.image
      ) {

        image.src =
          service.image;

      }


      /* VISIBILITY */

      card.style.display =
        service.visible === false
          ? "none"
          : "";


      /* EDIT BUTTON */

      if (
        !card.querySelector(
          ".service-edit-chip"
        )
      ) {

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "service-edit-chip";

        button.textContent =
          "✎ تعديل الخدمة";


        button.addEventListener(
          "click",
          event => {

            event.stopPropagation();

            openServiceEditor(
              index
            );

          }
        );


        card.appendChild(
          button
        );

      }

    }
  );

}


/* =========================================================
   EDITOR CSS
========================================================= */

const editorStyle =
  document.createElement(
    "style"
  );


editorStyle.textContent = `

.service-edit-chip{
  position:absolute;
  z-index:7;
  top:14px;
  right:14px;

  border:
    1px solid rgba(255,255,255,.18);

  background:
    rgba(2,11,24,.82);

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
    rgba(255,196,0,.55);
}


#serviceEditorBackdrop{

  position:fixed;

  inset:0;

  z-index:10000;

  display:none;

  place-items:center;

  background:
    rgba(0,5,13,.80);

  backdrop-filter:
    blur(12px);

  padding:18px;
}


#serviceEditorBackdrop.open{
  display:grid;
}


.service-editor{

  width:
    min(760px,100%);

  max-height:
    92vh;

  overflow:auto;

  border-radius:
    26px;

  padding:
    22px;

  background:
    linear-gradient(
      145deg,
      rgba(11,29,55,.98),
      rgba(4,13,28,.99)
    );

  border:
    1px solid rgba(255,255,255,.12);

  box-shadow:
    0 28px 90px rgba(0,0,0,.55);
}


.service-editor h3{

  margin:
    0 0 18px;

  font-size:
    22px;
}


.service-editor-grid{

  display:grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    13px;
}


.service-editor-grid .full{

  grid-column:
    1 / -1;
}


.service-editor label{

  display:grid;

  gap:
    7px;

  font-size:
    11px;
}


.service-editor input,
.service-editor textarea{

  width:
    100%;

  box-sizing:
    border-box;

  border:
    1px solid rgba(255,255,255,.12);

  background:
    rgba(255,255,255,.055);

  color:
    #fff;

  border-radius:
    13px;

  padding:
    11px 12px;

  outline:
    none;
}


.service-editor input:focus,
.service-editor textarea:focus{

  border-color:
    rgba(255,196,0,.55);
}


.service-editor textarea{

  min-height:
    100px;

  resize:
    vertical;
}


.service-editor-actions{

  display:flex;

  gap:
    10px;

  justify-content:
    flex-end;

  margin-top:
    18px;
}


.service-editor-preview{

  width:
    100%;

  max-height:
    280px;

  object-fit:
    contain;

  background:
    #071326;

  border-radius:
    14px;

  border:
    1px solid rgba(255,255,255,.1);
}


.service-editor-help{

  color:
    #ffcf52;

  font-size:
    10px;

  line-height:
    1.7;
}


@media(max-width:650px){

  .service-editor-grid{
    grid-template-columns:1fr;
  }

  .service-editor-grid .full{
    grid-column:auto;
  }

}

`;


document.head.appendChild(
  editorStyle
);


/* =========================================================
   CREATE EDITOR
========================================================= */

const backdrop =
  document.createElement(
    "div"
  );


backdrop.id =
  "serviceEditorBackdrop";


backdrop.innerHTML = `

<form
  class="service-editor"
  id="serviceEditorForm"
>

  <h3>
    تعديل الخدمة
  </h3>


  <div
    class="service-editor-grid"
  >


    <label>

      اسم الخدمة

      <input
        id="seName"
        required
      >

    </label>


    <label>

      العنوان الصغير

      <input
        id="seKicker"
      >

    </label>


    <label>

      الرقم

      <input
        id="seNumber"
        maxlength="3"
      >

    </label>


    <label>

      الأيقونة

      <input
        id="seIcon"
        maxlength="8"
      >

    </label>


    <label class="full">

      الوصف

      <textarea
        id="seDescription"
      ></textarea>

    </label>


    <label class="full">

      رابط الصورة

      <input
        id="seImageUrl"
        dir="ltr"
        placeholder="https://example.com/image.jpg"
      >

      <small
        class="service-editor-help"
      >

        استخدم رابط صورة مباشر يبدأ بـ https://

      </small>

    </label>


    <div class="full">

      <img
        class="service-editor-preview"
        id="sePreview"
        alt="معاينة الصورة"
      >

    </div>


    <label>

      <input
        id="seVisible"
        type="checkbox"
      >

      إظهار الخدمة في الموقع

    </label>


  </div>


  <div
    class="service-editor-actions"
  >

    <button
      type="button"
      class="secondary-btn"
      id="seCancel"
    >
      إلغاء
    </button>


    <button
      type="submit"
      class="primary-btn"
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
   EDITOR VARIABLES
========================================================= */

const q =
  id =>
    document.getElementById(
      id
    );


let editIndex =
  -1;


/* =========================================================
   OPEN EDITOR
========================================================= */

function openServiceEditor(
  index
) {

  editIndex =
    index;


  const service =
    services[index];


  if (!service) {
    return;
  }


  q("seName").value =
    service.name ||
    service.title ||
    "";


  q("seKicker").value =
    service.kicker ||
    "";


  q("seNumber").value =
    service.number ||
    service.id ||
    "";


  q("seIcon").value =
    service.icon ||
    "";


  q("seDescription").value =
    service.description ||
    "";


  q("seImageUrl").value =
    service.image ||
    "";


  q("seVisible").checked =
    service.visible !== false;


  if (
    service.image
  ) {

    q("sePreview").src =
      service.image;

  } else {

    q("sePreview")
      .removeAttribute(
        "src"
      );

  }


  backdrop.classList.add(
    "open"
  );

}


/* =========================================================
   CLOSE EDITOR
========================================================= */

q("seCancel").onclick =
  () => {

    backdrop.classList.remove(
      "open"
    );

  };


backdrop.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      backdrop
    ) {

      backdrop.classList.remove(
        "open"
      );

    }

  }
);


/* =========================================================
   IMAGE PREVIEW
========================================================= */

q("seImageUrl")
  .addEventListener(
    "input",
    event => {

      const imageUrl =
        event.target
          .value
          .trim();


      if (imageUrl) {

        q("sePreview").src =
          imageUrl;

      } else {

        q("sePreview")
          .removeAttribute(
            "src"
          );

      }

    }
  );


/* =========================================================
   SAVE SERVICE
========================================================= */

q("serviceEditorForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (
        editIndex < 0
      ) {
        return;
      }


      const current =
        services[
          editIndex
        ];


      const submitButton =
        event.submitter;


      submitButton.disabled =
        true;


      submitButton.textContent =
        "جاري الحفظ...";


      try {


        /*
          IDs ثابتة حسب ترتيب البطاقة.
        */

        const id =
          String(
            editIndex + 1
          )
          .padStart(
            2,
            "0"
          );


        const name =
          q("seName")
            .value
            .trim();


        const service = {

          ...current,

          id,

          name,

          title:
            name,

          kicker:
            q("seKicker")
              .value
              .trim(),

          number:
            q("seNumber")
              .value
              .trim()
            ||
            id,

          icon:
            q("seIcon")
              .value
              .trim()
            ||
            "✦",

          description:
            q("seDescription")
              .value
              .trim(),

          image:
            q("seImageUrl")
              .value
              .trim(),

          order:
            editIndex + 1,

          visible:
            q("seVisible")
              .checked,

          published:
            q("seVisible")
              .checked,

          updated:
            new Date()
              .toISOString()

        };


        services[
          editIndex
        ] =
          service;


        saveLocal();

        drawServices();


        await setDoc(

          doc(
            db,
            SERVICES_COLLECTION,
            id
          ),

          service,

          {
            merge:
              false
          }

        );


        backdrop.classList.remove(
          "open"
        );


        console.info(
          `✅ Service ${id} saved to Firestore:`,
          name
        );


        if (
          typeof window.showToast ===
          "function"
        ) {

          window.showToast(
            "تم حفظ الخدمة ونشرها على الموقع"
          );

        }


      } catch (error) {


        console.error(
          "❌ Service save failed:",
          error
        );


        alert(
          "حدث خطأ أثناء نشر الخدمة."
        );


      } finally {


        submitButton.disabled =
          false;


        submitButton.textContent =
          "حفظ ونشر";


      }

    }
  );


/* =========================================================
   FIRESTORE LISTENER
========================================================= */

onSnapshot(

  collection(
    db,
    SERVICES_COLLECTION
  ),

  snapshot => {


    if (
      snapshot.empty
    ) {

      return;

    }


    /*
      نقرأ فقط IDs الصحيحة:
      01 / 02 / 03 / 04

      الـDocument العشوائي القديم
      نتجاهله بالكامل.
    */

    snapshot.docs.forEach(
      documentSnapshot => {

        const id =
          String(
            documentSnapshot.id
          );


        const allowedIds =
          [
            "01",
            "02",
            "03",
            "04"
          ];


        if (
          !allowedIds.includes(
            id
          )
        ) {

          return;

        }


        const index =
          Number(id) - 1;


        if (
          index < 0 ||
          index >= services.length
        ) {

          return;

        }


        services[index] = {

          ...services[index],

          ...documentSnapshot.data(),

          id,

          order:
            index + 1

        };

      }
    );


    saveLocal();

    drawServices();

  },

  error => {

    console.error(
      "❌ Services listener failed:",
      error
    );

  }

);


/* =========================================================
   FORCE SYNC THE 4 ADMIN SERVICES
========================================================= */

async function syncFourAdminServices() {

  try {


    console.log(
      "🔄 Starting 4 services sync..."
    );


    /*
      نستخدم النسخة الأصلية التي قرأناها
      من بطاقات الأدمن عند بداية تحميل الصفحة.
    */

    for (
      let index = 0;
      index < 4;
      index++
    ) {


      const original =
        ORIGINAL_ADMIN_SERVICES[
          index
        ];


      if (!original) {

        console.warn(
          `Service card ${
            index + 1
          } not found.`
        );

        continue;

      }


      const id =
        String(
          index + 1
        )
        .padStart(
          2,
          "0"
        );


      /*
        إذا توجد تعديلات محفوظة محليًا
        بنفس ID الصحيح نحتفظ فيها.
      */

      const local =
        services[
          index
        ] ||
        original;


      const name =
        local.name ||
        local.title ||
        original.name ||
        `Service ${index + 1}`;


      const service = {

        ...original,
        ...local,

        id,

        name,

        title:
          name,

        number:
          local.number ||
          id,

        order:
          index + 1,

        icon:
          local.icon ||
          original.icon ||
          "✦",

        kicker:
          local.kicker ||
          original.kicker ||
          "Service",

        description:
          local.description ||
          original.description ||
          "",

        image:
          local.image ||
          original.image ||
          "",

        visible:
          local.visible !== false,

        published:
          local.visible !== false,

        updated:
          local.updated ||
          new Date()
            .toISOString()

      };


      services[index] =
        service;


      await setDoc(

        doc(
          db,
          SERVICES_COLLECTION,
          id
        ),

        service,

        {
          merge:
            true
        }

      );


      console.info(
        `✅ Service ${id} uploaded: ${name}`
      );

    }


    saveLocal();

    drawServices();


    console.info(
      "✅ All 4 admin services synced to Firestore."
    );


  } catch (error) {


    console.error(
      "❌ Four services sync failed:",
      error
    );


  }

}


/* =========================================================
   START
========================================================= */

drawServices();

saveLocal();


/*
  بعد تحميل صفحة الأدمن بـ1.5 ثانية
  نرفع الأربع خدمات.
*/

setTimeout(
  syncFourAdminServices,
  1500
);
