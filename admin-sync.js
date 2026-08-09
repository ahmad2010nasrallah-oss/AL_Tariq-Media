/* ============================================================
   AL-TARIQ MEDIA
   admin-sync.js

   ADMIN PROJECTS
        ↓
   CLOUDINARY
        ↓
   FIRESTORE
        ↓
   PUBLIC WEBSITE

   IMPORTANT:
   - NO Firebase Storage
   - NO atob()
   - NO manual Base64 decoding
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
   CLOUDINARY
============================================================ */

const CLOUDINARY_CLOUD_NAME =
  "ql544zkl";

const CLOUDINARY_UPLOAD_PRESET =
  "altariq_projects_upload";

const CLOUDINARY_UPLOAD_ENDPOINT =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* ============================================================
   LOCAL ADMIN STORAGE
============================================================ */

const SETTINGS_KEY =
  "altariq_media_website_settings_v1";

const DB_NAME =
  "altariq_media_admin_database_v2";

const STORE_NAME =
  "projects";


/* ============================================================
   CACHE

   Prevents the same Base64 image from being uploaded
   repeatedly every time syncAll runs.
============================================================ */

const CLOUDINARY_CACHE_KEY =
  "altariq_project_cloudinary_cache_v3";


function readCloudinaryCache() {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(
          CLOUDINARY_CACHE_KEY
        ) || "{}"
      );

    return (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    )
      ? value
      : {};

  } catch (error) {

    console.warn(
      "Cloudinary cache read error:",
      error
    );

    return {};
  }
}


let cloudinaryCache =
  readCloudinaryCache();


function saveCloudinaryCache() {

  try {

    localStorage.setItem(
      CLOUDINARY_CACHE_KEY,
      JSON.stringify(
        cloudinaryCache
      )
    );

  } catch (error) {

    console.warn(
      "Cloudinary cache save error:",
      error
    );
  }
}


/* ============================================================
   BASIC HELPERS
============================================================ */

function str(value) {

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
    str(value)
  );
}


function isCloudinaryUrl(value) {

  return /^https:\/\/res\.cloudinary\.com\//i.test(
    str(value)
  );
}


function isDataImage(value) {

  return /^data:image\//i.test(
    str(value)
  );
}


function isBlobUrl(value) {

  return /^blob:/i.test(
    str(value)
  );
}


function projectId(project) {

  if (
    project?.id !== undefined &&
    project?.id !== null &&
    str(project.id)
  ) {

    return str(
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
      "Website settings read error:",
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

            database
              .createObjectStore(
                STORE_NAME,
                {
                  keyPath: "id"
                }
              );
          }
        };
    }
  );
}


/* ============================================================
   READ PROJECTS
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
   GET PROJECT IMAGE

   Supports several versions of your admin.
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
   DRIVE LINK
============================================================ */

function getProjectDriveLink(project) {

  if (!project) {
    return "";
  }

  return str(
    project.driveLink ||
    project.driveUrl ||
    project.driveURL ||
    project.drive_url ||
    project.link ||
    ""
  );
}


/* ============================================================
   IMAGE SIGNATURE

   Used only for local cache.
============================================================ */

function createImageSignature(
  project,
  image
) {

  const id =
    projectId(
      project
    );


  if (
    typeof image === "string"
  ) {

    return JSON.stringify([
      id,
      project.updated || "",
      image.length,
      image.substring(0, 80),
      image.substring(
        Math.max(
          0,
          image.length - 80
        )
      )
    ]);
  }


  if (
    image instanceof Blob
  ) {

    return JSON.stringify([
      id,
      project.updated || "",
      image.size,
      image.type
    ]);
  }


  return JSON.stringify([
    id,
    project.updated || "",
    "no-image"
  ]);
}


/* ============================================================
   CLOUDINARY UPLOAD

   IMPORTANT:

   If the image is:
   data:image/jpeg;base64,...

   we send the Data URI DIRECTLY to Cloudinary.

   NO:
   atob()
   FileReader conversion
   manual Base64 decoding
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


  /* ----------------------------------------------------------
     DATA URI
  ---------------------------------------------------------- */

  if (
    typeof source === "string" &&
    isDataImage(source)
  ) {

    formData.append(
      "file",
      source
    );

  }


  /* ----------------------------------------------------------
     FILE / BLOB
  ---------------------------------------------------------- */

  else if (
    source instanceof Blob
  ) {

    formData.append(
      "file",
      source,
      `project-${id}.jpg`
    );

  }


  /* ----------------------------------------------------------
     BLOB URL

     Convert browser blob URL into an actual Blob.
  ---------------------------------------------------------- */

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
        "تعذر قراءة الصورة المحلية."
      );
    }


    const blob =
      await blobResponse.blob();


    formData.append(
      "file",
      blob,
      `project-${id}.jpg`
    );

  }


  /* ----------------------------------------------------------
     HTTP IMAGE

     Cloudinary can receive remote URLs too.
  ---------------------------------------------------------- */

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
      "نوع الصورة غير مدعوم."
    );
  }


  /* ----------------------------------------------------------
     UNSIGNED PRESET
  ---------------------------------------------------------- */

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );


  formData.append(
    "context",
    `project_id=${id}`
  );


  console.info(
    `☁️ Uploading project ${id} image to Cloudinary...`
  );


  const response =
    await fetch(
      CLOUDINARY_UPLOAD_ENDPOINT,
      {
        method: "POST",
        body: formData
      }
    );


  let result;


  try {

    result =
      await response.json();

  } catch {

    throw new Error(
      "Cloudinary returned an invalid response."
    );
  }


  if (!response.ok) {

    console.error(
      "❌ Cloudinary response:",
      result
    );


    throw new Error(
      result?.error?.message ||
      "فشل رفع الصورة إلى Cloudinary."
    );
  }


  if (
    !result.secure_url
  ) {

    console.error(
      "Cloudinary upload result:",
      result
    );


    throw new Error(
      "Cloudinary لم يرجع رابط الصورة."
    );
  }


  console.info(
    `✅ Project ${id} uploaded to Cloudinary.`
  );


  console.info(
    `🖼️ ${result.secure_url}`
  );


  return result.secure_url;
}


/* ============================================================
   READ CURRENT FIRESTORE PROJECTS
============================================================ */

async function getRemoteProjects() {

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
          id: item.id,
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

function getRemotePublicImage(
  remoteProject
) {

  if (!remoteProject) {
    return "";
  }


  const image =
    remoteProject.publicImage ||
    remoteProject.imageUrl ||
    remoteProject.image ||
    "";


  return isHttpUrl(image)
    ? image
    : "";
}


/* ============================================================
   PREPARE ONE PROJECT
============================================================ */

async function preparePublicProject(
  localProject,
  remoteProject
) {

  const id =
    projectId(
      localProject
    );


  const localImage =
    getProjectImage(
      localProject
    );


  const remoteImage =
    getRemotePublicImage(
      remoteProject
    );


  let publicImage =
    "";


  /* ========================================================
     CASE 1:
     Image already points to Cloudinary.
  ======================================================== */

  if (
    typeof localImage === "string" &&
    isCloudinaryUrl(localImage)
  ) {

    publicImage =
      localImage;
  }


  /* ========================================================
     CASE 2:
     Any existing normal HTTP image.

     Keep it public without re-uploading it.
  ======================================================== */

  else if (
    typeof localImage === "string" &&
    isHttpUrl(localImage)
  ) {

    publicImage =
      localImage;
  }


  /* ========================================================
     CASE 3:
     DATA URI / BLOB / BLOB URL.
  ======================================================== */

  else if (
    isDataImage(localImage) ||
    isBlobUrl(localImage) ||
    localImage instanceof Blob
  ) {

    const signature =
      createImageSignature(
        localProject,
        localImage
      );


    /* -------------------------------------------------------
       Already uploaded in current browser.
    ------------------------------------------------------- */

    if (
      cloudinaryCache[
        signature
      ]
    ) {

      publicImage =
        cloudinaryCache[
          signature
        ];


      console.info(
        `♻️ Using cached Cloudinary image for ${id}`
      );
    }


    /* -------------------------------------------------------
       Existing Firestore Cloudinary image.

       If project image did not appear to change,
       preserve it.
    ------------------------------------------------------- */

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


      cloudinaryCache[
        signature
      ] =
        publicImage;


      saveCloudinaryCache();


      console.info(
        `♻️ Preserving Firestore Cloudinary image for ${id}`
      );
    }


    /* -------------------------------------------------------
       Upload.
    ------------------------------------------------------- */

    else {

      publicImage =
        await uploadToCloudinary(
          localImage,
          id
        );


      cloudinaryCache[
        signature
      ] =
        publicImage;


      saveCloudinaryCache();
    }
  }


  /* ========================================================
     CASE 4:
     No usable local image.

     Preserve image already stored in Firestore.
  ======================================================== */

  else if (
    remoteImage
  ) {

    publicImage =
      remoteImage;


    console.info(
      `♻️ Existing Firestore image preserved for ${id}`
    );
  }


  /* ========================================================
     PROJECT DETAILS
  ======================================================== */

  const title =
    str(
      localProject.title ||
      localProject.name ||
      remoteProject?.title ||
      remoteProject?.name ||
      "مشروع"
    );


  const category =
    str(
      localProject.category ||
      remoteProject?.category ||
      "أعمالنا"
    );


  const description =
    str(
      localProject.description ||
      remoteProject?.description ||
      ""
    );


  const driveLink =
    getProjectDriveLink(
      localProject
    ) ||
    getProjectDriveLink(
      remoteProject || {}
    );


  /* ========================================================
     PUBLISHED
  ======================================================== */

  let published;


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
    str(
      localProject.status
    )
  ) {

    const status =
      str(
        localProject.status
      ).toLowerCase();


    published =
      (
        status === "published" ||
        status === "منشور"
      );
  }


  else {

    published =
      remoteProject?.published !==
      false;
  }


  const updated =
    localProject.updated ||
    localProject.updatedAt ||
    new Date()
      .toISOString();


  /* ========================================================
     FINAL FIRESTORE DOCUMENT
  ======================================================== */

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


    /* -------------------------------------------------------
       PUBLIC IMAGE

       Store same URL under all old/new field names so
       public-admin-sync.js can always find it.
    ------------------------------------------------------- */

    image:
      publicImage,

    publicImage:
      publicImage,

    imageUrl:
      publicImage,


    /* -------------------------------------------------------
       Never send Base64 into Firestore.
    ------------------------------------------------------- */

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


let lastSignature =
  "";


/* ============================================================
   CREATE SYNC SIGNATURE
============================================================ */

function createSyncSignature(
  settings,
  projects
) {

  return JSON.stringify(
    [

      settings.savedAt ||
      settings.updated ||
      "",


      projects.map(
        project => {

          const image =
            getProjectImage(
              project
            );


          let imageInfo =
            "";


          if (
            typeof image === "string"
          ) {

            imageInfo = [
              image.length,
              image.substring(
                0,
                30
              ),
              image.substring(
                Math.max(
                  0,
                  image.length - 30
                )
              )
            ];

          } else if (
            image instanceof Blob
          ) {

            imageInfo = [
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

            project.status,

            project.visible,

            project.published,

            project.updated,

            project.updatedAt,

            project.driveLink,

            project.driveUrl,

            imageInfo

          ];
        }
      )
    ]
  );
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
      lastSignature
    ) {

      return;
    }


    console.info(
      `🔄 Syncing ${localProjects.length} project(s)...`
    );


    /* ========================================================
       WEBSITE SETTINGS
    ======================================================== */

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
        merge: true
      }
    );


    /* ========================================================
       CURRENT FIRESTORE DATA
    ======================================================== */

    const {
      snapshot:
        remoteSnapshot,

      map:
        remoteMap

    } =
      await getRemoteProjects();


    /* ========================================================
       PREPARE PROJECTS ONE BY ONE
    ======================================================== */

    const publicProjects =
      [];


    for (
      const localProject
      of localProjects
    ) {

      const id =
        projectId(
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


        publicProjects.push(
          prepared
        );

      } catch (error) {

        console.error(
          `❌ Project ${id} image upload failed:`,
          error
        );


        /*
          Critical:
          If upload fails, DO NOT erase an image already
          successfully stored in Firestore.
        */

        const existingImage =
          getRemotePublicImage(
            remoteProject
          );


        const fallbackTitle =
          str(
            localProject.title ||
            localProject.name ||
            remoteProject?.title ||
            remoteProject?.name ||
            "مشروع"
          );


        publicProjects.push({

          ...localProject,

          id,

          name:
            fallbackTitle,

          title:
            fallbackTitle,

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


    /* ========================================================
       FIRESTORE BATCH
    ======================================================== */

    const batch =
      writeBatch(
        db
      );


    const localIds =
      new Set(
        publicProjects.map(
          project =>
            String(
              project.id
            )
        )
      );


    /* ========================================================
       DELETE PROJECTS REMOVED FROM ADMIN

       Safety:
       If IndexedDB unexpectedly returns no projects,
       don't delete entire Firestore collection.
    ======================================================== */

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


    /* ========================================================
       SAVE PROJECTS
    ======================================================== */

    publicProjects.forEach(
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
            merge: false
          }
        );
      }
    );


    await batch.commit();


    lastSignature =
      signature;


    console.info(
      "✅ Projects synced to Firestore successfully."
    );


    /* ========================================================
       LOG PUBLIC IMAGE URL
    ======================================================== */

    publicProjects.forEach(
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
   MANUAL COMMAND

   Open Console and execute:

   altariqSyncProjects()
============================================================ */

window.altariqSyncProjects =
  function () {

    lastSignature =
      "";

    return syncAll();
  };


/* ============================================================
   CLEAR IMAGE CACHE COMMAND

   Run only if you intentionally changed project images:

   altariqClearProjectImageCache()
============================================================ */

window.altariqClearProjectImageCache =
  function () {

    cloudinaryCache =
      {};


    localStorage.removeItem(
      CLOUDINARY_CACHE_KEY
    );


    lastSignature =
      "";


    console.info(
      "🧹 Project Cloudinary cache cleared."
    );


    syncAll();
  };


/* ============================================================
   EVENTS
============================================================ */

window.addEventListener(
  "altariq:website-settings-updated",
  () => {

    lastSignature =
      "";

    syncAll();
  }
);


window.addEventListener(
  "altariq:projects-updated",
  () => {

    lastSignature =
      "";

    syncAll();
  }
);


window.addEventListener(
  "altariq:project-updated",
  () => {

    lastSignature =
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

      lastSignature =
        "";

      syncAll();
    }
  }
);


/* ============================================================
   INITIAL SYNC
============================================================ */

setTimeout(
  () => {

    syncAll();

  },
  1000
);


/* ============================================================
   PERIODIC SYNC
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
  "✅ NEW admin-sync.js loaded — NO atob() used."
);


console.info(
  `☁️ Cloudinary: ${CLOUDINARY_CLOUD_NAME}`
);


console.info(
  `📁 Project preset: ${CLOUDINARY_UPLOAD_PRESET}`
);
