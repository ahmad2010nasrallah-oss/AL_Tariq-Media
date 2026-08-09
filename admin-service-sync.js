import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const cfg = {
  apiKey: "AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
  authDomain: "al-tariq-media.firebaseapp.com",
  projectId: "al-tariq-media",
  storageBucket: "al-tariq-media.firebasestorage.app",
  messagingSenderId: "616239800441",
  appId: "1:616239800441:web:53edc96e1cc872702cb4a8"
};


const app = getApps().length
  ? getApps()[0]
  : initializeApp(cfg);

const db = getFirestore(app);


const KEY = "altariq_media_services_v1";

const cards = [
  ...document.querySelectorAll("#services .service-card")
];


function initial() {

  return cards.map((card, index) => ({

    id: String(index + 1).padStart(2, "0"),

    order: index + 1,

    number:
      card.querySelector(".service-number")
        ?.textContent.trim()
      ||
      String(index + 1).padStart(2, "0"),

    icon:
      card.querySelector(".service-icon")
        ?.textContent.trim()
      ||
      "✦",

    kicker:
      card.querySelector(".service-kicker")
        ?.textContent.trim()
      ||
      "Service",

    name:
      card.querySelector("h3")
        ?.textContent.trim()
      ||
      "Service",

    title:
      card.querySelector("h3")
        ?.textContent.trim()
      ||
      "Service",

    description:
      card.querySelector("p")
        ?.textContent.trim()
      ||
      "",

    image:
      card.querySelector("img")
        ?.src
      ||
      "",

    visible: true,

    published: true

  }));

}


let services;

try {

  services =
    JSON.parse(
      localStorage.getItem(KEY) || "null"
    );

} catch {

  services = null;

}


if (
  !Array.isArray(services) ||
  !services.length
) {

  services = initial();

}


function saveLocal() {

  localStorage.setItem(
    KEY,
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


function draw() {

  cards.forEach((card, index) => {

    const service =
      services[index] ||
      initial()[index];

    if (!service) return;


    card.dataset.serviceId =
      service.id;


    const number =
      card.querySelector(
        ".service-number"
      );

    if (number) {
      number.textContent =
        service.number ||
        String(index + 1).padStart(2, "0");
    }


    const icon =
      card.querySelector(
        ".service-icon"
      );

    if (icon) {
      icon.textContent =
        service.icon || "✦";
    }


    const kicker =
      card.querySelector(
        ".service-kicker"
      );

    if (kicker) {
      kicker.textContent =
        service.kicker || "Service";
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
        service.description || "";
    }


    const image =
      card.querySelector("img");

    if (
      image &&
      service.image
    ) {
      image.src = service.image;
    }


    card.style.display =
      service.visible === false
        ? "none"
        : "";


    if (
      !card.querySelector(
        ".service-edit-chip"
      )
    ) {

      const button =
        document.createElement("button");

      button.type = "button";

      button.className =
        "service-edit-chip";

      button.textContent =
        "✎ تعديل الخدمة";


      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          openEditor(index);

        }
      );


      card.appendChild(button);

    }

  });

}


const style =
  document.createElement("style");

style.textContent = `

.service-edit-chip{
  position:absolute;
  z-index:7;
  top:14px;
  right:14px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(2,11,24,.8);
  color:#fff;
  border-radius:999px;
  padding:8px 11px;
  font-size:11px;
  cursor:pointer;
  backdrop-filter:blur(10px)
}

#serviceEditorBackdrop{
  position:fixed;
  inset:0;
  z-index:1000;
  display:none;
  place-items:center;
  background:rgba(0,5,13,.78);
  backdrop-filter:blur(12px);
  padding:18px
}

#serviceEditorBackdrop.open{
  display:grid
}

.service-editor{
  width:min(760px,100%);
  max-height:92vh;
  overflow:auto;
  border-radius:26px;
  padding:22px;
  background:
    linear-gradient(
      145deg,
      rgba(11,29,55,.97),
      rgba(4,13,28,.98)
    );
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 28px 90px rgba(0,0,0,.5)
}

.service-editor h3{
  margin:0 0 18px
}

.service-editor-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:13px
}

.service-editor-grid .full{
  grid-column:1/-1
}

.service-editor label{
  display:grid;
  gap:7px;
  font-size:11px
}

.service-editor input,
.service-editor textarea{
  width:100%;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.055);
  color:#fff;
  border-radius:13px;
  padding:11px 12px
}

.service-editor textarea{
  min-height:90px;
  resize:vertical
}

.service-editor-actions{
  display:flex;
  gap:10px;
  justify-content:flex-end;
  margin-top:18px
}

.service-editor-preview{
  width:100%;
  max-height:250px;
  object-fit:contain;
  background:#071326;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.1)
}

.service-image-warning{
  display:block;
  color:#ffcf52;
  font-size:10px;
  line-height:1.7;
  margin-top:5px
}

@media(max-width:650px){

  .service-editor-grid{
    grid-template-columns:1fr
  }

  .service-editor-grid .full{
    grid-column:auto
  }

}

`;

document.head.appendChild(style);


const backdrop =
  document.createElement("div");

backdrop.id =
  "serviceEditorBackdrop";


backdrop.innerHTML = `

<form
  class="service-editor"
  id="serviceEditorForm"
>

  <h3>تعديل الخدمة</h3>

  <div class="service-editor-grid">

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
        maxlength="4"
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

      <small class="service-image-warning">

        استخدم رابط صورة مباشر يبدأ بـ
        https://

      </small>

    </label>


    <div class="full">

      <img
        class="service-editor-preview"
        id="sePreview"
        alt="معاينة"
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


  <div class="service-editor-actions">

    <button
      type="button"
      class="secondary-btn"
      id="seCancel"
    >
      إلغاء
    </button>


    <button
      class="primary-btn"
      type="submit"
    >
      حفظ ونشر
    </button>

  </div>

</form>

`;

document.body.appendChild(backdrop);


let editIndex = -1;

const q =
  id =>
    document.getElementById(id);


function openEditor(index) {

  editIndex = index;

  const service =
    services[index];


  q("seName").value =
    service.name ||
    service.title ||
    "";


  q("seKicker").value =
    service.kicker || "";


  q("seNumber").value =
    service.number || "";


  q("seIcon").value =
    service.icon || "";


  q("seDescription").value =
    service.description || "";


  q("seImageUrl").value =
    service.image || "";


  q("sePreview").src =
    service.image || "";


  q("seVisible").checked =
    service.visible !== false;


  backdrop.classList.add(
    "open"
  );

}


q("seCancel").onclick = () => {

  backdrop.classList.remove(
    "open"
  );

};


backdrop.addEventListener(
  "click",
  event => {

    if (
      event.target === backdrop
    ) {

      backdrop.classList.remove(
        "open"
      );

    }

  }
);


q("seImageUrl").addEventListener(
  "input",
  event => {

    q("sePreview").src =
      event.target.value.trim();

  }
);


q("serviceEditorForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (editIndex < 0) return;


      const old =
        services[editIndex];


      const button =
        event.submitter;


      button.disabled = true;

      button.textContent =
        "جاري الحفظ...";


      try {

        const name =
          q("seName")
            .value
            .trim();


        const image =
          q("seImageUrl")
            .value
            .trim();


        const service = {

          ...old,

          id:
            String(
              old.id ||
              editIndex + 1
            ),

          name,

          title: name,

          kicker:
            q("seKicker")
              .value
              .trim(),

          number:
            q("seNumber")
              .value
              .trim(),

          icon:
            q("seIcon")
              .value
              .trim(),

          description:
            q("seDescription")
              .value
              .trim(),

          image,

          visible:
            q("seVisible")
              .checked,

          published:
            q("seVisible")
              .checked,

          order:
            old.order ||
            editIndex + 1,

          updated:
            new Date()
              .toISOString()

        };


        services[editIndex] =
          service;


        saveLocal();

        draw();


        await setDoc(

          doc(
            db,
            "services",
            service.id
          ),

          service,

          {
            merge: false
          }

        );


        backdrop.classList.remove(
          "open"
        );


        console.info(
          "✅ Service saved to Firestore:",
          service.name
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
          "❌ Service sync error:",
          error
        );


        alert(
          "تعذر نشر الخدمة على Firebase."
        );

      } finally {

        button.disabled = false;

        button.textContent =
          "حفظ ونشر";

      }

    }
  );


draw();

saveLocal();


onSnapshot(

  collection(
    db,
    "services"
  ),

  snapshot => {

    if (
      snapshot.empty
    ) {
      return;
    }


    const remote =
      snapshot.docs
        .map(documentSnapshot => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data()
        }))
        .sort(
          (a, b) =>
            (a.order || 99) -
            (b.order || 99)
        );


    if (remote.length) {

      services = remote;

      saveLocal();

      draw();

    }

  },

  error => {

    console.error(
      "❌ Services listener error:",
      error
    );

  }

);
