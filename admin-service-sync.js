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


const servicesPage =
  document.querySelector("#services");


const cards = [
  ...document.querySelectorAll(
    "#services .service-card"
  )
];


/* =========================================================
   READ ORIGINAL SERVICES FROM ADMIN HTML
========================================================= */

function readOriginalServices() {

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


const ORIGINAL_SERVICES =
  readOriginalServices();


/* =========================================================
   LOAD LOCAL SERVICES
========================================================= */

let localServices = [];

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

    localServices =
      parsed;

  }

} catch {

  localServices = [];

}


/* =========================================================
   PREPARE SERVICES
========================================================= */

let services =
  ORIGINAL_SERVICES.map(
    original => {

      const local =
        localServices.find(
          item =>
            String(item.id) ===
            String(original.id)
        );


      return local
        ? {
            ...original,
            ...local,
            id:
              original.id,
            order:
              original.order
          }
        : {
            ...original
          };

    }
  );


/*
  إضافة الخدمات الإضافية
  مثل 05 / 06 / 07 من LocalStorage
*/

localServices.forEach(
  item => {

    const exists =
      services.some(
        service =>
          String(service.id) ===
          String(item.id)
      );


    if (!exists) {

      services.push(
        item
      );

    }

  }
);


services.sort(
  (a, b) =>
    Number(a.order || 999)
    -
    Number(b.order || 999)
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
   HELPER
========================================================= */

function getNextServiceId() {

  const numbers =
    services
      .map(
        service =>
          Number(
            service.id
          )
      )
      .filter(
        number =>
          Number.isFinite(
            number
          )
      );


  const next =
    numbers.length
      ? Math.max(
          ...numbers
        ) + 1
      : 1;


  return String(next)
    .padStart(
      2,
      "0"
    );

}


/* =========================================================
   CSS
========================================================= */

const style =
  document.createElement(
    "style"
  );


style.textContent = `

.service-edit-chip{
  position:absolute;
  z-index:8;
  top:14px;
  right:14px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(2,11,24,.84);
  color:#fff;
  border-radius:999px;
  padding:8px 12px;
  font-size:11px;
  cursor:pointer;
  backdrop-filter:blur(10px);
  box-shadow:0 8px 25px rgba(0,0,0,.25);
}

.service-edit-chip:hover{
  border-color:rgba(255,196,0,.65);
}

.add-service-admin-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  margin:0 0 24px;
  border:0;
  border-radius:16px;
  padding:14px 22px;
  background:
    linear-gradient(
      135deg,
      #ffc400,
      #ffdc63
    );
  color:#071326;
  font-weight:900;
  font-size:15px;
  cursor:pointer;
  box-shadow:
    0 12px 35px rgba(255,196,0,.22);
  transition:.2s ease;
}

.add-service-admin-btn:hover{
  transform:
    translateY(-2px);
}

.service-modal-backdrop{
  position:fixed;
  inset:0;
  z-index:20000;
  display:none;
  place-items:center;
  padding:20px;
  background:
    rgba(0,5,13,.82);
  backdrop-filter:
    blur(12px);
}

.service-modal-backdrop.open{
  display:grid;
}

.service-modal{
  width:
    min(760px,100%);
  max-height:
    92vh;
  overflow:auto;
  border-radius:
    26px;
  padding:
    24px;
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

.service-modal h3{
  margin:
    0 0 20px;
  color:#fff;
  font-size:22px;
}

.service-modal-grid{
  display:grid;
  grid-template-columns:
    1fr 1fr;
  gap:14px;
}

.service-modal-grid .full{
  grid-column:
    1 / -1;
}

.service-modal label{
  display:grid;
  gap:7px;
  color:#fff;
  font-size:12px;
}

.service-modal input,
.service-modal textarea{
  width:100%;
  box-sizing:border-box;
  border:
    1px solid rgba(255,255,255,.12);
  background:
    rgba(255,255,255,.06);
  color:#fff;
  border-radius:13px;
  padding:12px;
  outline:none;
}

.service-modal input:focus,
.service-modal textarea:focus{
  border-color:
    rgba(255,196,0,.6);
}

.service-modal textarea{
  min-height:100px;
  resize:vertical;
}

.service-modal-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:20px;
}

.service-image-preview{
  width:100%;
  max-height:280px;
  object-fit:contain;
  border-radius:15px;
  background:#071326;
  border:
    1px solid rgba(255,255,255,.10);
}

.service-note{
  color:#ffcf52;
  font-size:10px;
  line-height:1.7;
}

.dynamic-service-card{
  position:relative;
  overflow:hidden;
  border-radius:26px;
  border:
    1px solid rgba(255,255,255,.10);
  background:
    #0c1d38;
}

.dynamic-service-image{
  position:relative;
  height:360px;
  overflow:hidden;
  background:
    #080d18;
}

.dynamic-service-image img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}

.dynamic-service-placeholder{
  height:100%;
  display:grid;
  place-items:center;
  color:#ffcf52;
  font-size:46px;
}

.dynamic-service-content{
  padding:24px;
}

.dynamic-service-kicker{
  display:block;
  color:#ffc400;
  font-size:12px;
  font-weight:800;
  margin-bottom:12px;
}

.dynamic-service-content h3{
  margin:0 0 12px;
  color:#fff;
  font-size:25px;
}

.dynamic-service-content p{
  margin:0;
  color:#aebbd0;
  line-height:1.7;
}

@media(max-width:650px){

  .service-modal-grid{
    grid-template-columns:
      1fr;
  }

  .service-modal-grid .full{
    grid-column:auto;
  }

}

`;


document.head.appendChild(
  style
);


/* =========================================================
   RENDER SERVICES
========================================================= */

function renderServices() {

  /*
    أول 4 خدمات:
    نعدّل البطاقات الأصلية الموجودة في HTML
  */

  cards.forEach(
    (card, index) => {

      const service =
        services[index];

      if (!service) {
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
        card.querySelector(
          "h3"
        );

      if (title) {

        title.textContent =
          service.name ||
          service.title ||
          "Service";

      }


      const description =
        card.querySelector(
          "p"
        );

      if (description) {

        description.textContent =
          service.description ||
          "";

      }


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


      card.style.display =
        service.visible === false
          ? "none"
          : "";


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

          event.stopPropagation();

          openEditServiceModal(
            service.id
          );

        };

    }
  );


  /*
    الخدمات الإضافية:
    05 وما بعدها
  */

  document
    .querySelectorAll(
      ".dynamic-service-card"
    )
    .forEach(
      element =>
        element.remove()
    );


  const grid =
    cards[0]
      ?.parentElement;


  if (!grid) {
    return;
  }


  services
    .slice(
      cards.length
    )
    .forEach(
      service => {

        if (
          service.visible === false
        ) {
          return;
        }


        const card =
          document.createElement(
            "article"
          );

        card.className =
          "service-card dynamic-service-card";


        const imageHtml =
          service.image
            ? `
              <img
                src="${service.image}"
                alt=""
              >
            `
            : `
              <div
                class="dynamic-service-placeholder"
              >
                ${
                  service.icon ||
                  "✦"
                }
              </div>
            `;


        card.innerHTML = `

          <div
            class="dynamic-service-image"
          >

            ${imageHtml}

            <button
              type="button"
              class="service-edit-chip"
            >
              ✎ تعديل الخدمة
            </button>

          </div>


          <div
            class="dynamic-service-content"
          >

            <span
              class="dynamic-service-kicker"
            >

              ${
                service.kicker ||
                "Service"
              }

            </span>


            <h3>

              ${
                service.name ||
                service.title ||
                "Service"
              }

            </h3>


            <p>

              ${
                service.description ||
                ""
              }

            </p>

          </div>

        `;


        card
          .querySelector(
            ".service-edit-chip"
          )
          .onclick =
            event => {

              event.stopPropagation();

              openEditServiceModal(
                service.id
              );

            };


        grid.appendChild(
          card
        );

      }
    );

}


/* =========================================================
   ADD SERVICE BUTTON
   ONLY INSIDE SERVICES PAGE
========================================================= */

if (servicesPage) {

  const addServiceButton =
    document.createElement(
      "button"
    );


  addServiceButton.type =
    "button";

  addServiceButton.id =
    "addServiceButton";

  addServiceButton.className =
    "add-service-admin-btn";

  addServiceButton.innerHTML =
    "+ إضافة خدمة جديدة +";


  const titleBlock =
    servicesPage.querySelector(
      ".section-header"
    )
    ||
    servicesPage.querySelector(
      ".page-header"
    )
    ||
    servicesPage.querySelector(
      "h2"
    );


  if (
    titleBlock &&
    titleBlock.parentElement
  ) {

    titleBlock.parentElement
      .insertBefore(
        addServiceButton,
        titleBlock.nextSibling
      );

  } else {

    servicesPage.prepend(
      addServiceButton
    );

  }

}


/* =========================================================
   ADD SERVICE MODAL
========================================================= */

const addBackdrop =
  document.createElement(
    "div"
  );


addBackdrop.className =
  "service-modal-backdrop";

addBackdrop.id =
  "addServiceBackdrop";


addBackdrop.innerHTML = `

<form
  class="service-modal"
  id="addServiceForm"
>

  <h3>
    إضافة خدمة جديدة
  </h3>


  <div
    class="service-modal-grid"
  >

    <label>

      اسم الخدمة

      <input
        id="addServiceName"
        required
      >

    </label>


    <label>

      العنوان الصغير

      <input
        id="addServiceKicker"
        placeholder="Digital Marketing"
      >

    </label>


    <label>

      الأيقونة

      <input
        id="addServiceIcon"
        maxlength="8"
        placeholder="✦"
      >

    </label>


    <label class="full">

      الوصف

      <textarea
        id="addServiceDescription"
        required
      ></textarea>

    </label>


    <label class="full">

      رابط الصورة

      <input
        id="addServiceImage"
        dir="ltr"
        placeholder="https://..."
      >

      <small
        class="service-note"
      >
        رابط صورة مباشر يبدأ بـ https://
      </small>

    </label>


    <div class="full">

      <img
        id="addServicePreview"
        class="service-image-preview"
        alt=""
      >

    </div>


    <label>

      <input
        id="addServiceVisible"
        type="checkbox"
        checked
      >

      إظهار الخدمة في الموقع

    </label>


  </div>


  <div
    class="service-modal-actions"
  >

    <button
      type="button"
      class="secondary-btn"
      id="cancelAddService"
    >
      إلغاء
    </button>


    <button
      type="submit"
      class="primary-btn"
    >
      إضافة ونشر
    </button>

  </div>

</form>

`;


document.body.appendChild(
  addBackdrop
);


/* =========================================================
   EDIT SERVICE MODAL
========================================================= */

const editBackdrop =
  document.createElement(
    "div"
  );


editBackdrop.className =
  "service-modal-backdrop";

editBackdrop.id =
  "editServiceBackdrop";


editBackdrop.innerHTML = `

<form
  class="service-modal"
  id="editServiceForm"
>

  <h3>
    تعديل الخدمة
  </h3>


  <div
    class="service-modal-grid"
  >

    <label>

      اسم الخدمة

      <input
        id="editServiceName"
        required
      >

    </label>


    <label>

      العنوان الصغير

      <input
        id="editServiceKicker"
      >

    </label>


    <label>

      الرقم

      <input
        id="editServiceNumber"
      >

    </label>


    <label>

      الأيقونة

      <input
        id="editServiceIcon"
        maxlength="8"
      >

    </label>


    <label class="full">

      الوصف

      <textarea
        id="editServiceDescription"
      ></textarea>

    </label>


    <label class="full">

      رابط الصورة

      <input
        id="editServiceImage"
        dir="ltr"
      >

    </label>


    <div class="full">

      <img
        id="editServicePreview"
        class="service-image-preview"
        alt=""
      >

    </div>


    <label>

      <input
        id="editServiceVisible"
        type="checkbox"
      >

      إظهار الخدمة في الموقع

    </label>


  </div>


  <div
    class="service-modal-actions"
  >

    <button
      type="button"
      class="secondary-btn"
      id="cancelEditService"
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
  editBackdrop
);


/* =========================================================
   DOM HELPERS
========================================================= */

const q =
  id =>
    document.getElementById(
      id
    );


/* =========================================================
   OPEN ADD MODAL
========================================================= */

if (
  q("addServiceButton")
) {

  q("addServiceButton")
    .onclick =
      () => {

        q("addServiceForm")
          .reset();


        q("addServiceVisible")
          .checked =
            true;


        q("addServicePreview")
          .removeAttribute(
            "src"
          );


        addBackdrop
          .classList
          .add(
            "open"
          );

      };

}


/* =========================================================
   ADD IMAGE PREVIEW
========================================================= */

q("addServiceImage")
  .addEventListener(
    "input",
    event => {

      const url =
        event.target
          .value
          .trim();


      if (url) {

        q("addServicePreview")
          .src =
            url;

      } else {

        q("addServicePreview")
          .removeAttribute(
            "src"
          );

      }

    }
  );


/* =========================================================
   CANCEL ADD
========================================================= */

q("cancelAddService")
  .onclick =
    () => {

      addBackdrop
        .classList
        .remove(
          "open"
        );

    };


/* =========================================================
   SAVE NEW SERVICE
========================================================= */

q("addServiceForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const button =
        event.submitter;


      button.disabled =
        true;

      button.textContent =
        "جاري الإضافة...";


      try {

        const id =
          getNextServiceId();


        const name =
          q("addServiceName")
            .value
            .trim();


        const service = {

          id,

          number:
            id,

          order:
            Number(id),

          name,

          title:
            name,

          kicker:
            q("addServiceKicker")
              .value
              .trim()
            ||
            "Service",

          icon:
            q("addServiceIcon")
              .value
              .trim()
            ||
            "✦",

          description:
            q("addServiceDescription")
              .value
              .trim(),

          image:
            q("addServiceImage")
              .value
              .trim(),

          visible:
            q("addServiceVisible")
              .checked,

          published:
            q("addServiceVisible")
              .checked,

          updated:
            new Date()
              .toISOString()

        };


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


        services.push(
          service
        );


        services.sort(
          (a, b) =>
            Number(
              a.order || 999
            )
            -
            Number(
              b.order || 999
            )
        );


        saveLocal();

        renderServices();


        addBackdrop
          .classList
          .remove(
            "open"
          );


        console.info(
          `✅ New service ${id} added:`,
          name
        );


        if (
          typeof window.showToast ===
          "function"
        ) {

          window.showToast(
            "تمت إضافة الخدمة ونشرها"
          );

        }


      } catch (error) {

        console.error(
          "❌ Add service error:",
          error
        );


        alert(
          "حدث خطأ أثناء إضافة الخدمة."
        );


      } finally {

        button.disabled =
          false;

        button.textContent =
          "إضافة ونشر";

      }

    }
  );


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

let editingServiceId =
  null;


function openEditServiceModal(
  id
) {

  const service =
    services.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!service) {
    return;
  }


  editingServiceId =
    String(id);


  q("editServiceName")
    .value =
      service.name ||
      service.title ||
      "";


  q("editServiceKicker")
    .value =
      service.kicker ||
      "";


  q("editServiceNumber")
    .value =
      service.number ||
      service.id ||
      "";


  q("editServiceIcon")
    .value =
      service.icon ||
      "";


  q("editServiceDescription")
    .value =
      service.description ||
      "";


  q("editServiceImage")
    .value =
      service.image ||
      "";


  q("editServiceVisible")
    .checked =
      service.visible !== false;


  if (
    service.image
  ) {

    q("editServicePreview")
      .src =
        service.image;

  } else {

    q("editServicePreview")
      .removeAttribute(
        "src"
      );

  }


  editBackdrop
    .classList
    .add(
      "open"
    );

}


/* =========================================================
   EDIT IMAGE PREVIEW
========================================================= */

q("editServiceImage")
  .addEventListener(
    "input",
    event => {

      const url =
        event.target
          .value
          .trim();


      if (url) {

        q("editServicePreview")
          .src =
            url;

      } else {

        q("editServicePreview")
          .removeAttribute(
            "src"
          );

      }

    }
  );


/* =========================================================
   CANCEL EDIT
========================================================= */

q("cancelEditService")
  .onclick =
    () => {

      editBackdrop
        .classList
        .remove(
          "open"
        );

    };


/* =========================================================
   SAVE EDIT
========================================================= */

q("editServiceForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (
        !editingServiceId
      ) {
        return;
      }


      const button =
        event.submitter;


      button.disabled =
        true;

      button.textContent =
        "جاري الحفظ...";


      try {

        const index =
          services.findIndex(
            item =>
              String(item.id) ===
              editingServiceId
          );


        if (
          index < 0
        ) {
          return;
        }


        const old =
          services[index];


        const name =
          q("editServiceName")
            .value
            .trim();


        const updatedService = {

          ...old,

          id:
            old.id,

          name,

          title:
            name,

          kicker:
            q("editServiceKicker")
              .value
              .trim(),

          number:
            q("editServiceNumber")
              .value
              .trim()
            ||
            old.id,

          icon:
            q("editServiceIcon")
              .value
              .trim()
            ||
            "✦",

          description:
            q("editServiceDescription")
              .value
              .trim(),

          image:
            q("editServiceImage")
              .value
              .trim(),

          visible:
            q("editServiceVisible")
              .checked,

          published:
            q("editServiceVisible")
              .checked,

          updated:
            new Date()
              .toISOString()

        };


        await setDoc(

          doc(
            db,
            SERVICES_COLLECTION,
            old.id
          ),

          updatedService,

          {
            merge:
              false
          }

        );


        services[index] =
          updatedService;


        saveLocal();

        renderServices();


        editBackdrop
          .classList
          .remove(
            "open"
          );


        console.info(
          `✅ Service ${old.id} updated`
        );


      } catch (error) {

        console.error(
          "❌ Update service error:",
          error
        );


        alert(
          "حدث خطأ أثناء تعديل الخدمة."
        );


      } finally {

        button.disabled =
          false;

        button.textContent =
          "حفظ ونشر";

      }

    }
  );


/* =========================================================
   CLOSE MODALS BY BACKDROP
========================================================= */

addBackdrop.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      addBackdrop
    ) {

      addBackdrop
        .classList
        .remove(
          "open"
        );

    }

  }
);


editBackdrop.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      editBackdrop
    ) {

      editBackdrop
        .classList
        .remove(
          "open"
        );

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


    const remote =
      snapshot.docs
        .map(
          documentSnapshot => ({
            id:
              documentSnapshot.id,

            ...documentSnapshot.data()
          })
        )
        .filter(
          item =>
            /^\d+$/.test(
              String(item.id)
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
      remote.length
    ) {

      services =
        remote;


      saveLocal();

      renderServices();

    }

  },

  error => {

    console.error(
      "❌ Services listener error:",
      error
    );

  }

);


/* =========================================================
   INITIAL SYNC OF ORIGINAL SERVICES
========================================================= */

async function syncOriginalServices() {

  try {

    for (
      let index = 0;
      index <
      ORIGINAL_SERVICES.length;
      index++
    ) {

      const original =
        ORIGINAL_SERVICES[index];


      const id =
        String(index + 1)
          .padStart(
            2,
            "0"
          );


      const existing =
        services.find(
          item =>
            String(item.id) ===
            id
        );


      const service =
        existing
          ? {
              ...original,
              ...existing,
              id,
              order:
                index + 1
            }
          : {
              ...original,
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
          merge:
            true
        }

      );

    }


    console.info(
      "✅ Original services synced."
    );


  } catch (error) {

    console.error(
      "❌ Original services sync error:",
      error
    );

  }

}


/* =========================================================
   START
========================================================= */

saveLocal();

renderServices();


setTimeout(
  syncOriginalServices,
  1200
);
