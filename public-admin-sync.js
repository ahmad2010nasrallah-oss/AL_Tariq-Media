import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


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


const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];


function text(element, value) {
  if (
    element &&
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  ) {
    element.textContent = value;
  }
}


/* =========================================
   WEBSITE SETTINGS
========================================= */

function applySettings(settings = {}) {

  if (
    !settings ||
    typeof settings !== "object"
  ) {
    return;
  }


  if (settings.seoTitle) {
    document.title = settings.seoTitle;
  }


  const meta =
    $('meta[name="description"]');

  if (
    meta &&
    settings.seoDescription
  ) {
    meta.content =
      settings.seoDescription;
  }


  text(
    $(".hero-content h1"),
    settings.heroTitle
  );


  text(
    $(".hero-content p"),
    settings.heroDescription
  );


  const footerCopy =
    $("footer .copyright, .footer .copyright, footer p:last-child");

  if (
    footerCopy &&
    settings.copyright
  ) {
    footerCopy.textContent =
      settings.copyright;
  }


  const phone =
    $('.contact-list a[href^="tel:"]');

  if (
    phone &&
    settings.whatsapp
  ) {

    phone.href =
      "tel:" + settings.whatsapp;

    phone.textContent =
      settings.whatsapp;

  }


  const mail =
    $('.contact-list a[href^="mailto:"]');

  if (
    mail &&
    settings.email
  ) {

    mail.href =
      "mailto:" + settings.email;

    mail.textContent =
      settings.email;

  }


  const address =
    [...$$(".contact-item")]
      .find(item =>
        item.textContent.includes("العنوان")
      )
      ?.querySelector("span");

  text(
    address,
    settings.address
  );


  if (settings.whatsapp) {

    $$('a[href*="wa.me"]')
      .forEach(link => {

        link.href =
          "https://wa.me/" +
          String(settings.whatsapp)
            .replace(/\D/g, "");

      });

  }


  const servicesSection =
    $("#publicServicesGrid")
      ?.closest("section");

  if (servicesSection) {

    servicesSection.style.display =
      settings.showServices === false
        ? "none"
        : "";

  }


  const portfolio =
    $("#portfolio");

  const portfolioNav =
    $('[data-page="portfolio"]');

  if (portfolio) {

    portfolio.style.display =
      settings.showWorks === false
        ? "none"
        : "";

  }

  if (portfolioNav) {

    portfolioNav.style.display =
      settings.showWorks === false
        ? "none"
        : "";

  }


  const contact =
    $("#contact");

  const contactNav =
    $('[data-page="contact"]');

  if (contact) {

    contact.style.display =
      settings.showContact === false
        ? "none"
        : "";

  }

  if (contactNav) {

    contactNav.style.display =
      settings.showContact === false
        ? "none"
        : "";

  }

}


/* =========================================
   HELPERS
========================================= */

function esc(value = "") {

  return String(value)
    .replace(
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


function safeUrl(value = "") {

  const url =
    String(value || "")
      .trim();

  return /^(https?:|data:image\/|blob:)/i
    .test(url)
    ? url
    : "";

}


/* =========================================
   DEFAULT SERVICES
========================================= */

const defaultServices = [

  {
    id: "01",
    number: "01",
    icon: "◉",
    kicker: "Digital Growth",
    name: "Social Media Management",
    title: "Social Media Management",
    description:
      "إدارة المحتوى، التخطيط، النشر وبناء الهوية الرقمية للحسابات.",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=84",
    order: 1,
    visible: true,
    published: true
  },

  {
    id: "02",
    number: "02",
    icon: "◎",
    kicker: "Visual Production",
    name: "Photography",
    title: "Photography",
    description:
      "تصوير المنتجات والحملات التجارية بأسلوب احترافي متوافق مع العلامة.",
    image:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=84",
    order: 2,
    visible: true,
    published: true
  },

  {
    id: "03",
    number: "03",
    icon: "▶",
    kicker: "Motion & Editing",
    name: "Video Editing",
    title: "Video Editing",
    description:
      "مونتاج الفيديوهات الإعلانية والقصيرة مع معالجة بصرية احترافية.",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=84",
    order: 3,
    visible: true,
    published: true
  },

  {
    id: "04",
    number: "04",
    icon: "⌘",
    kicker: "Web Experience",
    name: "Web Design",
    title: "Web Design",
    description:
      "تصميم مواقع سريعة ومتجاوبة تعكس هوية المشروع وتخدم أهدافه.",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1400&q=84",
    order: 4,
    visible: true,
    published: true
  }

];


/* =========================================
   SERVICE CARD
========================================= */

function serviceCard(service) {

  const article =
    document.createElement("article");

  article.className =
    "admin-service-card";


  const image =
    safeUrl(service.image);


  article.innerHTML = `

    <div class="admin-service-visual">

      ${
        image
          ? `<img
              src="${esc(image)}"
              alt="${esc(
                service.name ||
                service.title ||
                "Service"
              )}"
              loading="lazy"
            >`
          : `<div class="admin-service-placeholder">✦</div>`
      }

      <span class="admin-service-number">

        ${esc(
          service.number ||
          String(
            service.order || ""
          ).padStart(2, "0")
        )}

      </span>


      <div
        class="admin-service-icon"
        aria-hidden="true"
      >

        ${esc(
          service.icon || "✦"
        )}

      </div>

    </div>


    <div class="admin-service-content">

      <span class="admin-service-kicker">

        ${esc(
          service.kicker ||
          "Service"
        )}

      </span>


      <h3>

        ${esc(
          service.name ||
          service.title ||
          "خدمة"
        )}

      </h3>


      <p>

        ${esc(
          service.description ||
          ""
        )}

      </p>

    </div>

  `;


  return article;

}


/* =========================================
   RENDER SERVICES
========================================= */

function renderServices(items) {

  const grid =
    $("#publicServicesGrid");

  if (!grid) return;


  const list = (
    Array.isArray(items) &&
    items.length
      ? items
      : defaultServices
  )
    .filter(service =>
      service.visible !== false &&
      service.published !== false
    )
    .sort(
      (a, b) =>
        (Number(a.order) || 99) -
        (Number(b.order) || 99)
    );


  grid.replaceChildren(
    ...list.map(serviceCard)
  );

}


/* =========================================
   PROJECT CARD
========================================= */

function workCard(project) {

  const article =
    document.createElement("article");

  article.className =
    "admin-work-card";


  const image =
    safeUrl(
      project.publicImage ||
      project.imageUrl ||
      project.image ||
      project.image_data
    );


  const link =
    String(
      project.driveUrl ||
      project.driveLink ||
      project.drive_url ||
      project.link ||
      ""
    ).trim();


  article.innerHTML = `

    <div class="admin-work-image">

      ${
        image
          ? `<img
              src="${esc(image)}"
              alt="${esc(
                project.title ||
                project.name ||
                "مشروع"
              )}"
              loading="lazy"
            >`
          : "✦"
      }

      <span class="admin-work-status">
        منشور
      </span>

    </div>


    <div class="admin-work-body">

      <div class="admin-work-meta">

        <span class="admin-work-category">

          ${esc(
            project.category ||
            "أعمالنا"
          )}

        </span>


        <span class="admin-work-id">

          #${esc(
            String(
              project.id || ""
            )
              .slice(0, 6)
              .toUpperCase()
          )}

        </span>

      </div>


      <h3>

        ${esc(
          project.title ||
          project.name ||
          "مشروع"
        )}

      </h3>


      <p>

        ${esc(
          project.description ||
          ""
        )}

      </p>


      ${
        link
          ? `<a
              class="admin-work-link"
              href="${esc(link)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              مشاهدة المشروع ↗
            </a>`
          : ""
      }

    </div>

  `;


  return article;

}


/* =========================================
   RENDER PROJECTS
========================================= */

function renderProjects(items) {

  const grid =
    $("#portfolioProjectsGrid");

  if (!grid) return;


  const list =
    (
      Array.isArray(items)
        ? items
        : []
    )

      .filter(project =>

        project.published === true ||

        String(
          project.status || ""
        )
          .toLowerCase() ===
          "published"

      )

      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
            b.updated ||
            0
          )
          -
          new Date(
            a.updatedAt ||
            a.updated ||
            0
          )
      );


  if (!list.length) {

    grid.innerHTML = `

      <div class="admin-empty-card">
        لا توجد أعمال منشورة حالياً.
      </div>

    `;

    return;

  }


  grid.replaceChildren(
    ...list.map(workCard)
  );

}


/* =========================================
   LOCAL SERVICE FALLBACK
========================================= */

try {

  const localServices =
    JSON.parse(
      localStorage.getItem(
        "altariq_media_services_v1"
      ) ||
      "null"
    );


  renderServices(
    localServices ||
    defaultServices
  );

} catch {

  renderServices(
    defaultServices
  );

}


/* =========================================
   FIRESTORE WEBSITE SETTINGS
========================================= */

onSnapshot(

  doc(
    db,
    "website_config",
    "main"
  ),

  snapshot => {

    if (
      snapshot.exists()
    ) {

      applySettings(
        snapshot.data()
      );

    }

  },

  error => {

    console.warn(
      "Settings sync:",
      error
    );

  }

);


/* =========================================
   FIRESTORE PROJECTS
========================================= */

onSnapshot(

  collection(
    db,
    "projects"
  ),

  snapshot => {

    const projects =
      snapshot.docs
        .map(
          documentSnapshot => ({
            id:
              documentSnapshot.id,

            ...documentSnapshot.data()
          })
        );


    renderProjects(
      projects
    );

  },

  error => {

    console.warn(
      "Projects sync:",
      error
    );

  }

);


/* =========================================
   FIRESTORE SERVICES
========================================= */

onSnapshot(

  collection(
    db,
    "services"
  ),

  snapshot => {

    const services =
      snapshot.docs
        .map(
          documentSnapshot => ({
            id:
              documentSnapshot.id,

            ...documentSnapshot.data()
          })
        );


    renderServices(
      services.length
        ? services
        : defaultServices
    );

  },

  error => {

    console.warn(
      "Services sync:",
      error
    );

  }

);


/* =========================================
   LOCAL STORAGE EVENTS
========================================= */

window.addEventListener(
  "storage",
  event => {

    if (
      event.key ===
        "altariq_media_website_settings_v1" &&
      event.newValue
    ) {

      try {

        applySettings(
          JSON.parse(
            event.newValue
          )
        );

      } catch {}

    }


    if (
      event.key ===
      "altariq_media_services_v1"
    ) {

      try {

        renderServices(
          JSON.parse(
            event.newValue ||
            "[]"
          )
        );

      } catch {}

    }

  }
);


/* =========================================
   LOCAL PROJECT BRIDGE
========================================= */

const LOCAL_PROJECT_DB =
  "altariq_media_admin_database_v2";

const LOCAL_PROJECT_STORE =
  "projects";


function openLocalProjectDb() {

  return new Promise(
    (resolve, reject) => {

      const request =
        indexedDB.open(
          LOCAL_PROJECT_DB,
          1
        );


      request.onsuccess = () => {

        resolve(
          request.result
        );

      };


      request.onerror = () => {

        reject(
          request.error
        );

      };


      request.onupgradeneeded =
        event => {

          const database =
            event.target.result;


          if (
            !database
              .objectStoreNames
              .contains(
                LOCAL_PROJECT_STORE
              )
          ) {

            database
              .createObjectStore(
                LOCAL_PROJECT_STORE,
                {
                  keyPath: "id"
                }
              );

          }

        };

    }
  );

}


async function readLocalProjects() {

  try {

    const database =
      await openLocalProjectDb();


    return await new Promise(
      (resolve, reject) => {

        const transaction =
          database.transaction(
            LOCAL_PROJECT_STORE,
            "readonly"
          );


        const request =
          transaction
            .objectStore(
              LOCAL_PROJECT_STORE
            )
            .getAll();


        request.onsuccess = () => {

          resolve(
            request.result || []
          );

        };


        request.onerror = () => {

          reject(
            request.error
          );

        };

      }
    );


  } catch {

    return [];

  }

}


let localProjectSignature =
  "";


async function refreshLocalProjects() {

  const items =
    await readLocalProjects();


  if (!items.length) {
    return;
  }


  const signature =
    JSON.stringify(

      items.map(
        project => [

          project.id,

          project.updated,

          project.status,

          project.name,

          project.image?.length

        ]
      )

    );


  if (
    signature !==
    localProjectSignature
  ) {

    localProjectSignature =
      signature;

    renderProjects(
      items
    );

  }

}


setInterval(
  refreshLocalProjects,
  1200
);


setTimeout(
  refreshLocalProjects,
  250
);
