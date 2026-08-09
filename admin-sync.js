/* ============================================================
   AL-TARIQ MEDIA - ADMIN PROJECT SYNC
   Local Admin → Cloudinary → Firestore → Public Website

   IMPORTANT:
   - No Firebase Storage
   - Handles old Base64 images
   - Uploads project images to Cloudinary
   - Saves public image URLs in Firestore
============================================================ */


/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import {
  initializeApp,
  getApps
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* ============================================================
   FIREBASE CONFIG
============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
  authDomain: "al-tariq-media.firebaseapp.com",
  projectId: "al-tariq-media",
  storageBucket: "al-tariq-media.firebasestorage.app",
  messagingSenderId: "616239800441",
  appId: "1:616239800441:web:53edc96e1cc872702cb4a8",
  measurementId: "G-42KJKNDJDF"
};

const app =
  getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig);

const db =
  getFirestore(app);


/* ============================================================
   CLOUDINARY CONFIG
============================================================ */

const CLOUDINARY_CLOUD_NAME =
  "ql544zkl";

const CLOUDINARY_UPLOAD_PRESET =
  "altariq_projects_upload";

const CLOUDINARY_UPLOAD_ENDPOINT =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* ============================================================
   LOCAL DATABASE CONFIG
============================================================ */

const SETTINGS_KEY =
  "altariq_media_website_settings_v1";

const DB_NAME =
  "altariq_media_admin_database_v2";

const STORE_NAME =
  "projects";


/* ============================================================
   CLOUDINARY CACHE
============================================================ */

const IMAGE_CACHE_KEY =
  "altariq_project_cloudinary_cache_v4";

function readImageCache() {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(
          IMAGE_CACHE_KEY
        ) || "{}"
      );

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      return value;
    }

  } catch (error) {

    console.warn(
      "Image cache read error:",
      error
    );
  }

  return {};
}

let imageCache =
  readImageCache();

function saveImageCache() {

  try {

    localStorage.setItem(
      IMAGE_CACHE_KEY,
      JSON.stringify(
        imageCache
      )
    );

  } catch (error) {

    console.warn(
      "Image cache save error:",
      error
    );
  }
}


/* ============================================================
   HELPERS
============================================================ */

function text(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}


function isHttpUrl(value) {

  return /^https?:\/\//i.test(
    text(value)
  );
}


function isCloudinaryUrl(value) {

  return /^https:\/\/res\.cloudinary\.com\//i.test(
    text(value)
  );
}


function isDataImage(value) {

  return /^data:image\//i.test(
    text(value)
  );
}


function isBlobUrl(value) {

  return /^blob:/i.test(
    text(value)
  );
}


function getProjectId(project) {

  if (
    project &&
    project.id !== undefined &&
    project.id !== null &&
    text(project.id)
  ) {

    return text(
      project.id
    );
  }

  return crypto.randomUUID();
}


/* ============================================================
   WEBSITE SETTINGS
============================================================ */

function readSettings() {

  try {

    return JSON.parse(
      localStorage.getItem(
        SETTINGS_KEY
      ) || "{}"
    );

  } catch (error) {

    console.warn(
      "Settings read error:",
      error
    );

    return {};
  }
}


/* ============================================================
   INDEXEDDB
============================================================ */

function openAdminDatabase() {

  return new Promise(
    (resolve, reject) => {

      const request =
        indexedDB.open(
          DB_NAME,
          1
        );

      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error
          );
        };

      request.onupgradeneeded =
        event => {

          const database =
            event.target.result;

          if (
            !database.objectStoreNames
              .contains(
                STORE_NAME
              )
          ) {

            database.createObjectStore(
              STORE_NAME,
              {
                keyPath:
                  "id"
              }
            );
          }
        };
    }
  );
}


/* ============================================================
   READ LOCAL PROJECTS
============================================================ */

async function readLocalProjects() {

  const database =
    await openAdminDatabase();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        database.transaction(
          STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.getAll();

      request.onsuccess =
        () => {

          resolve(
            request.result || []
          );
        };

      request.onerror =
        () => {

          reject(
            request.error
          );
        };
    }
  );
}


/* ============================================================
   PROJECT IMAGE
============================================================ */

function getProjectImage(project) {

  if (!project) {
    return "";
  }

  return (
    project.publicImage ||
    project.imageUrl ||
    project.imageURL ||
    project.image ||
    project.image_data ||
    project.imageData ||
    project.photo ||
    project.thumbnail ||
    ""
  );
}


/* ============================================================
   PROJECT DRIVE LINK
============================================================ */

function getProjectDriveLink(project) {

  if (!project) {
    return "";
  }

  return text(
    project.driveLink ||
    project.driveUrl ||
    project.driveURL ||
    project.drive_url ||
    project.link ||
    ""
  );
}


/* ============================================================
   CLEAN OLD BASE64 / DATA URL
============================================================ */

function cleanDataImage(dataUrl) {

  if (
    typeof dataUrl !== "string"
  ) {

    throw new Error(
      "بيانات الصورة غير صحيحة."
    );
  }


  let value =
    dataUrl.trim();


  const commaIndex =
    value.indexOf(",");


  if (
    commaIndex === -1
  ) {

    throw new Error(
      "صيغة الصورة القديمة غير صحيحة."
    );
  }


  let header =
    value.substring(
      0,
      commaIndex
    );


  let base64 =
    value.substring(
      commaIndex + 1
    );


  /* Remove line breaks */

  base64 =
    base64
      .replace(/\r/g, "")
      .replace(/\n/g, "")
      .replace(/\s/g, "");


  /* Handle URI encoded Base64 */

  try {

    if (
      /%[0-9a-f]{2}/i.test(
        base64
      )
    ) {

      base64 =
        decodeURIComponent(
          base64
        );
    }

  } catch (error) {

    console.warn(
      "Old image URI decode warning:",
      error
    );
  }


  /* Convert URL-safe Base64 */

  base64 =
    base64
      .replace(/-/g, "+")
      .replace(/_/g, "/");


  /* Remove illegal characters */

  base64 =
    base64.replace(
      /[^A-Za-z0-9+/=]/g,
      ""
    );


  /*
    Remove excessive padding before
    recreating correct padding.
  */

  base64 =
    base64.replace(
      /=+$/g,
      ""
    );


  while (
    base64.length % 4 !== 0
  ) {

    base64 += "=";
  }


  if (
    !/^data:image\//i.test(
      header
    )
  ) {

    throw new Error(
      "نوع الصورة القديمة غير صحيح."
    );
  }


  if (
    !/;base64$/i.test(
      header
    )
  ) {

    header =
      header.replace(
        /;$/,
        ""
      );

    header +=
      ";base64";
  }


  return `${header},${base64}`;
}


/* ============================================================
   DATA IMAGE → BLOB

   We intentionally avoid window.atob().
============================================================ */

async function dataImageToBlob(
  dataUrl
) {

  const cleanDataUrl =
    cleanDataImage(
      dataUrl
    );


  try {

    const response =
      await fetch(
        cleanDataUrl
      );


    const blob =
      await response.blob();


    if (
      !blob ||
      blob.size === 0
    ) {

      throw new Error(
        "الصورة فارغة."
      );
    }


    if (
      blob.type &&
      !blob.type.startsWith(
        "image/"
      )
    ) {

      throw new Error(
        "البيانات ليست صورة."
      );
    }


    return blob;


  } catch (error) {

    console.error(
      "Old image conversion error:",
      error
    );


    throw new Error(
      "صورة المشروع القديمة تالفة. أعد رفعها من صفحة الأدمن."
    );
  }
}


/* ============================================================
   CLOUDINARY UPLOAD
============================================================ */

async function uploadToCloudinary(
  source,
  id
) {

  if (!source) {

    throw new Error(
      "لا توجد صورة لرفعها."
    );
  }


  const formData =
    new FormData();


  /* ========================================================
     DATA IMAGE
  ======================================================== */

  if (
    typeof source === "string" &&
    isDataImage(source)
  ) {

    const blob =
      await dataImageToBlob(
        source
      );


    formData.append(
      "file",
      blob,
      `project-${id}.jpg`
    );

  }


  /* ========================================================
     FILE / BLOB
  ======================================================== */

  else if (
    source instanceof Blob
  ) {

    formData.append(
      "file",
      source,
      `project-${id}.jpg`
    );

  }


  /* ========================================================
     BLOB URL
  ======================================================== */

  else if (
    typeof source === "string" &&
    isBlobUrl(source)
  ) {

    const blobResponse =
      await fetch(
        source
      );


    if (!blobResponse.ok) {

      throw new Error(
        "تعذر قراءة صورة المشروع."
      );
    }


    const blob =
      await blobResponse.blob();


    if (
      !blob ||
      blob.size === 0
    ) {

      throw new Error(
        "صورة المشروع فارغة."
      );
    }


    formData.append(
      "file",
      blob,
      `project-${id}.jpg`
    );

  }


  /* ========================================================
     PUBLIC URL
  ======================================================== */

  else if (
    typeof source === "string" &&
    isHttpUrl(source)
  ) {

    formData.append(
      "file",
      source
    );

  }


  else {

    throw new Error(
      "صيغة الصورة غير مدعومة."
    );
  }


  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );


  console.info(
    `☁️ Uploading project ${id} image to Cloudinary...`
  );


  const response =
    await fetch(
      CLOUDINARY_UPLOAD_ENDPOINT,
      {
        method:
          "POST",

        body:
          formData
      }
    );


  let result =
    {};


  try {

    result =
      await response.json();

  } catch (error) {

    console.error(
      "Cloudinary JSON error:",
      error
    );
  }


  if (!response.ok) {

    console.error(
      `❌ Cloudinary upload failed for ${id}:`,
      result
    );


    throw new Error(
      result?.error?.message ||
      "فشل رفع صورة المشروع إلى Cloudinary."
    );
  }


  if (
    !result.secure_url
  ) {

    throw new Error(
      "Cloudinary لم يرجع رابط الصورة."
    );
  }


  console.info(
    `✅ Project ${id} image uploaded successfully.`
  );


  console.info(
    `🖼️ ${result.secure_url}`
  );


  return result.secure_url;
}


/* ============================================================
   IMAGE SIGNATURE
============================================================ */

function createImageSignature(
  project,
  image
) {

  const id =
    getProjectId(
      project
    );


  if (
    typeof image === "string"
  ) {

    return JSON.stringify([
      id,

      project.updated ||
      project.updatedAt ||
      "",

      image.length,

      image.substring(
        0,
        60
      ),

      image.substring(
        Math.max(
          0,
          image.length - 60
        )
      )
    ]);
  }


  if (
    image instanceof Blob
  ) {

    return JSON.stringify([
      id,

      project.updated ||
      "",

      image.size,

      image.type
    ]);
  }


  return JSON.stringify([
    id,
    "none"
  ]);
}


/* ============================================================
   READ FIRESTORE PROJECTS
============================================================ */

async function readRemoteProjects() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "projects"
      )
    );


  const map =
    new Map();


  snapshot.forEach(
    item => {

      map.set(
        item.id,
        {
          id:
            item.id,

          ...item.data()
        }
      );
    }
  );


  return {
    snapshot,
    map
  };
}


/* ============================================================
   REMOTE IMAGE
============================================================ */

function getRemoteImage(
  project
) {

  if (!project) {
    return "";
  }


  const value =
    project.publicImage ||
    project.imageUrl ||
    project.image ||
    "";


  return isHttpUrl(value)
    ? value
    : "";
}


/* ============================================================
   PREPARE PROJECT
============================================================ */

async function preparePublicProject(
  localProject,
  remoteProject
) {

  const id =
    getProjectId(
      localProject
    );


  const localImage =
    getProjectImage(
      localProject
    );


  const remoteImage =
    getRemoteImage(
      remoteProject
    );


  let publicImage =
    "";


  /* ========================================================
     CLOUDINARY URL ALREADY EXISTS
  ======================================================== */

  if (
    typeof localImage ===
      "string" &&
    isCloudinaryUrl(
      localImage
    )
  ) {

    publicImage =
      localImage;

  }


  /* ========================================================
     NORMAL PUBLIC URL
  ======================================================== */

  else if (
    typeof localImage ===
      "string" &&
    isHttpUrl(
      localImage
    )
  ) {

    publicImage =
      localImage;

  }


  /* ========================================================
     LOCAL IMAGE
  ======================================================== */

  else if (
    isDataImage(
      localImage
    ) ||
    isBlobUrl(
      localImage
    ) ||
    localImage instanceof Blob
  ) {

    const signature =
      createImageSignature(
        localProject,
        localImage
      );


    /* Cache */

    if (
      imageCache[
        signature
      ]
    ) {

      publicImage =
        imageCache[
          signature
        ];


      console.info(
        `♻️ Using cached Cloudinary image for ${id}`
      );

    }


    /*
      Existing Firestore image.

      If local project wasn't updated,
      keep existing Cloudinary image.
    */

    else if (
      isCloudinaryUrl(
        remoteImage
      ) &&
      (
        !localProject.updated ||
        localProject.updated ===
          remoteProject?.updated
      )
    ) {

      publicImage =
        remoteImage;


      imageCache[
        signature
      ] =
        publicImage;


      saveImageCache();


      console.info(
        `♻️ Preserving Cloudinary image for ${id}`
      );

    }


    /* Upload */

    else {

      publicImage =
        await uploadToCloudinary(
          localImage,
          id
        );


      imageCache[
        signature
      ] =
        publicImage;


      saveImageCache();

    }

  }


  /* ========================================================
     NO LOCAL IMAGE
  ======================================================== */

  else if (
    remoteImage
  ) {

    publicImage =
      remoteImage;


    console.info(
      `♻️ Existing Firestore image kept for ${id}`
    );
  }


  /* ========================================================
     PROJECT FIELDS
  ======================================================== */

  const title =
    text(
      localProject.title ||
      localProject.name ||
      remoteProject?.title ||
      remoteProject?.name ||
      "مشروع"
    );


  const category =
    text(
      localProject.category ||
      remoteProject?.category ||
      "أعمالنا"
    );


  const description =
    text(
      localProject.description ||
      remoteProject?.description ||
      ""
    );


  const driveLink =
    getProjectDriveLink(
      localProject
    ) ||
    getProjectDriveLink(
      remoteProject
    );


  /* ========================================================
     PUBLISHED STATUS
  ======================================================== */

  let published =
    true;


  if (
    typeof localProject.published ===
    "boolean"
  ) {

    published =
      localProject.published;

  }

  else if (
    typeof localProject.visible ===
    "boolean"
  ) {

    published =
      localProject.visible;

  }

  else if (
    text(
      localProject.status
    )
  ) {

    const status =
      text(
        localProject.status
      ).toLowerCase();


    published =
      (
        status === "published" ||
        status === "منشور"
      );
  }


  const updated =
    localProject.updated ||
    localProject.updatedAt ||
    new Date()
      .toISOString();


  return {

    ...localProject,

    id,

    name:
      title,

    title,

    category,

    description,

    driveLink,

    driveUrl:
      driveLink,


    /*
      IMPORTANT:
      Same public image URL stored
      under all supported names.
    */

    image:
      publicImage,

    publicImage:
      publicImage,

    imageUrl:
      publicImage,


    /*
      Never send Base64 to Firestore.
    */

    image_data:
      "",

    imageData:
      "",


    published,

    visible:
      published,

    status:
      published
        ? "Published"
        : "Draft",

    updated
  };
}


/* ============================================================
   SYNC STATE
============================================================ */

let syncBusy =
  false;


let lastSyncSignature =
  "";


/* ============================================================
   SYNC SIGNATURE
============================================================ */

function createSyncSignature(
  settings,
  projects
) {

  return JSON.stringify([
    settings.savedAt ||
    settings.updated ||
    "",

    projects.map(
      project => {

        const image =
          getProjectImage(
            project
          );


        let imageData =
          "";


        if (
          typeof image === "string"
        ) {

          imageData = [
            image.length,

            image.substring(
              0,
              40
            ),

            image.substring(
              Math.max(
                0,
                image.length - 40
              )
            )
          ];

        } else if (
          image instanceof Blob
        ) {

          imageData = [
            image.size,
            image.type
          ];
        }


        return [
          project.id,

          project.name,

          project.title,

          project.description,

          project.category,

          project.driveLink,

          project.driveUrl,

          project.status,

          project.visible,

          project.published,

          project.updated,

          project.updatedAt,

          imageData
        ];
      }
    )
  ]);
}


/* ============================================================
   MAIN SYNC
============================================================ */

async function syncAll() {

  if (
    syncBusy
  ) {
    return;
  }


  syncBusy =
    true;


  try {

    const settings =
      readSettings();


    const localProjects =
      await readLocalProjects();


    const signature =
      createSyncSignature(
        settings,
        localProjects
      );


    if (
      signature ===
      lastSyncSignature
    ) {

      return;
    }


    console.info(
      `🔄 Syncing ${localProjects.length} project(s)...`
    );


    /* ======================================================
       WEBSITE SETTINGS
    ====================================================== */

    await setDoc(
      doc(
        db,
        "website_config",
        "main"
      ),
      {
        ...settings,

        syncedAt:
          new Date()
            .toISOString()
      },
      {
        merge:
          true
      }
    );


    /* ======================================================
       FIRESTORE CURRENT PROJECTS
    ====================================================== */

    const {
      snapshot:
        remoteSnapshot,

      map:
        remoteMap

    } =
      await readRemoteProjects();


    /* ======================================================
       PREPARE PROJECTS
    ====================================================== */

    const preparedProjects =
      [];


    for (
      const localProject
      of localProjects
    ) {

      const id =
        getProjectId(
          localProject
        );


      const remoteProject =
        remoteMap.get(
          id
        ) ||
        null;


      try {

        const prepared =
          await preparePublicProject(
            {
              ...localProject,
              id
            },

            remoteProject
          );


        preparedProjects.push(
          prepared
        );


      } catch (error) {

        console.error(
          `❌ Project ${id} image upload failed:`,
          error
        );


        /*
          IMPORTANT:
          If old image is corrupted,
          keep any image already uploaded
          successfully to Firestore.
        */

        const existingImage =
          getRemoteImage(
            remoteProject
          );


        const title =
          text(
            localProject.title ||
            localProject.name ||
            remoteProject?.title ||
            remoteProject?.name ||
            "مشروع"
          );


        preparedProjects.push({

          ...localProject,

          id,

          name:
            title,

          title,

          image:
            existingImage,

          publicImage:
            existingImage,

          imageUrl:
            existingImage,

          image_data:
            "",

          imageData:
            "",

          driveLink:
            getProjectDriveLink(
              localProject
            ),

          driveUrl:
            getProjectDriveLink(
              localProject
            ),

          updated:
            localProject.updated ||
            localProject.updatedAt ||
            new Date()
              .toISOString()
        });
      }
    }


    /* ======================================================
       FIRESTORE BATCH
    ====================================================== */

    const batch =
      writeBatch(
        db
      );


    const localIds =
      new Set(
        preparedProjects.map(
          project =>
            String(
              project.id
            )
        )
      );


    /* ======================================================
       DELETE REMOVED PROJECTS
    ====================================================== */

    if (
      localProjects.length > 0
    ) {

      remoteSnapshot.forEach(
        remoteDocument => {

          if (
            !localIds.has(
              remoteDocument.id
            )
          ) {

            batch.delete(
              remoteDocument.ref
            );
          }
        }
      );
    }


    /* ======================================================
       SAVE PROJECTS
    ====================================================== */

    preparedProjects.forEach(
      project => {

        batch.set(
          doc(
            db,
            "projects",
            String(
              project.id
            )
          ),
          project,
          {
            merge:
              false
          }
        );
      }
    );


    await batch.commit();


    lastSyncSignature =
      signature;


    console.info(
      "✅ Projects synced to Firestore successfully."
    );


    /* ======================================================
       DISPLAY PUBLIC IMAGE LINKS
    ====================================================== */

    preparedProjects.forEach(
      project => {

        if (
          project.publicImage
        ) {

          console.info(
            `🖼️ ${project.id}: ${project.publicImage}`
          );
        }
      }
    );


  } catch (error) {

    console.error(
      "❌ Project sync failed:",
      error
    );

  } finally {

    syncBusy =
      false;
  }
}


/* ============================================================
   MANUAL SYNC COMMAND

   Run in Console:
   altariqSyncProjects()
============================================================ */

window.altariqSyncProjects =
  function () {

    lastSyncSignature =
      "";

    return syncAll();
  };


/* ============================================================
   CLEAR CLOUDINARY CACHE

   Run:
   altariqClearProjectImageCache()
============================================================ */

window.altariqClearProjectImageCache =
  function () {

    imageCache =
      {};


    localStorage.removeItem(
      IMAGE_CACHE_KEY
    );


    lastSyncSignature =
      "";


    console.info(
      "🧹 Project image cache cleared."
    );


    return syncAll();
  };


/* ============================================================
   EVENTS
============================================================ */

window.addEventListener(
  "altariq:website-settings-updated",
  () => {

    lastSyncSignature =
      "";

    syncAll();
  }
);


window.addEventListener(
  "altariq:projects-updated",
  () => {

    lastSyncSignature =
      "";

    syncAll();
  }
);


window.addEventListener(
  "altariq:project-updated",
  () => {

    lastSyncSignature =
      "";

    syncAll();
  }
);


window.addEventListener(
  "storage",
  event => {

    if (
      event.key ===
      SETTINGS_KEY
    ) {

      lastSyncSignature =
        "";

      syncAll();
    }
  }
);


/* ============================================================
   START
============================================================ */

setTimeout(
  () => {

    syncAll();

  },
  1000
);


/* ============================================================
   AUTO SYNC
============================================================ */

setInterval(
  () => {

    syncAll();

  },
  2500
);


/* ============================================================
   READY
============================================================ */

console.info(
  "✅ admin-sync.js V4 loaded successfully."
);

console.info(
  "✅ No manual atob() Base64 decoding."
);

console.info(
  `☁️ Cloudinary: ${CLOUDINARY_CLOUD_NAME}`
);

console.info(
  `📁 Projects preset: ${CLOUDINARY_UPLOAD_PRESET}`
);
