/* =========================================================
   AL-TARIQ MEDIA
   ADMIN PROJECTS SYNC

   Local Admin
        ↓
   Cloudinary
        ↓
   Firestore / projects
        ↓
   Public Website
========================================================= */


/* =========================================================
   FIREBASE IMPORTS
========================================================= */

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


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",

  authDomain:
    "al-tariq-media.firebaseapp.com",

  projectId:
    "al-tariq-media",

  storageBucket:
    "al-tariq-media.firebasestorage.app",

  messagingSenderId:
    "616239800441",

  appId:
    "1:616239800441:web:53edc96e1cc872702cb4a8",

  measurementId:
    "G-42KJKNDJDF"

};


const app =
  getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig);


const db =
  getFirestore(app);


/* =========================================================
   CLOUDINARY CONFIG
========================================================= */

const CLOUDINARY_CLOUD_NAME =
  "ql544zkl";


const CLOUDINARY_UPLOAD_PRESET =
  "altariq_projects_upload";


const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* =========================================================
   LOCAL ADMIN STORAGE
========================================================= */

const SETTINGS_KEY =
  "altariq_media_website_settings_v1";


const DB_NAME =
  "altariq_media_admin_database_v2";


const STORE =
  "projects";


/* =========================================================
   CLOUDINARY IMAGE CACHE
========================================================= */

const IMAGE_CACHE_KEY =
  "altariq_project_cloudinary_cache_v2";


function loadImageCache() {

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
  loadImageCache();


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


/* =========================================================
   HELPERS
========================================================= */

function cleanString(value) {

  return typeof value === "string"
    ? value.trim()
    : "";

}


function isHttpUrl(value) {

  return /^https?:\/\//i.test(
    cleanString(value)
  );

}


function isCloudinaryUrl(value) {

  return /^https:\/\/res\.cloudinary\.com\//i.test(
    cleanString(value)
  );

}


function isDataImage(value) {

  return /^data:image\//i.test(
    cleanString(value)
  );

}


function createProjectId(project) {

  if (
    project &&
    project.id !== undefined &&
    project.id !== null &&
    String(project.id).trim()
  ) {

    return String(
      project.id
    );

  }


  return crypto.randomUUID();

}


/* =========================================================
   READ WEBSITE SETTINGS
========================================================= */

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


/* =========================================================
   INDEXEDDB
========================================================= */

function openDB() {

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
              .contains(STORE)
          ) {

            database.createObjectStore(
              STORE,
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


/* =========================================================
   READ PROJECTS FROM INDEXEDDB
========================================================= */

async function readProjects() {

  const database =
    await openDB();


  return new Promise(
    (resolve, reject) => {


      const transaction =
        database.transaction(
          STORE,
          "readonly"
        );


      const objectStore =
        transaction.objectStore(
          STORE
        );


      const request =
        objectStore.getAll();


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


/* =========================================================
   GET IMAGE FROM PROJECT

   Supports old versions of admin.
========================================================= */

function getProjectImage(project) {

  if (!project) {
    return "";
  }


  return (

    project.image ||

    project.publicImage ||

    project.imageUrl ||

    project.imageURL ||

    project.image_data ||

    project.imageData ||

    project.photo ||

    ""

  );

}


/* =========================================================
   GET DRIVE LINK
========================================================= */

function getDriveLink(project) {

  return cleanString(

    project.driveLink ||

    project.driveUrl ||

    project.driveURL ||

    project.drive_url ||

    project.link ||

    ""

  );

}


/* =========================================================
   SAFE DATA URL → FILE

   IMPORTANT:
   This replaces atob().
   Browser fetch() decodes the Data URL safely.
========================================================= */

async function dataUrlToFile(
  dataUrl,
  filename = "project-image.jpg"
) {

  if (
    typeof dataUrl !== "string" ||
    !dataUrl.startsWith("data:image/")
  ) {

    throw new Error(
      "بيانات الصورة غير صحيحة."
    );

  }


  try {


    /*
      We intentionally do NOT use atob().
      fetch() handles base64 and encoded
      Data URLs safely.
    */

    const response =
      await fetch(
        dataUrl
      );


    if (!response.ok) {

      throw new Error(
        "Could not read local image."
      );

    }


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
        "الملف ليس صورة."
      );

    }


    let extension =
      "jpg";


    switch (
      blob.type
    ) {

      case "image/png":

        extension =
          "png";

        break;


      case "image/webp":

        extension =
          "webp";

        break;


      case "image/gif":

        extension =
          "gif";

        break;


      case "image/avif":

        extension =
          "avif";

        break;


      case "image/jpeg":

      default:

        extension =
          "jpg";

        break;

    }


    const cleanFilename =
      String(filename)
        .replace(
          /\.[a-z0-9]+$/i,
          ""
        );


    return new File(

      [blob],

      `${cleanFilename}.${extension}`,

      {

        type:
          blob.type ||
          "image/jpeg"

      }

    );


  } catch (error) {


    console.error(
      "Data URL conversion error:",
      error
    );


    throw new Error(
      "تعذر قراءة صورة المشروع من الجهاز."
    );

  }

}


/* =========================================================
   IMAGE SIGNATURE

   Prevents uploading same image every 2 seconds.
========================================================= */

function createImageSignature(
  project,
  image
) {

  const value =
    typeof image === "string"
      ? image
      : "";


  return [

    createProjectId(
      project
    ),

    project.updated ||
    project.updatedAt ||
    project.savedAt ||
    "",

    value.length,

    value.slice(
      0,
      50
    ),

    value.slice(
      -50
    )

  ].join(
    "::"
  );

}


/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

async function uploadFileToCloudinary(
  file,
  projectId
) {

  if (!file) {

    throw new Error(
      "لم يتم العثور على صورة."
    );

  }


  if (
    file.size >
    10 * 1024 * 1024
  ) {

    throw new Error(
      "حجم صورة العمل أكبر من 10MB."
    );

  }


  if (
    file.type &&
    !file.type.startsWith(
      "image/"
    )
  ) {

    throw new Error(
      "الملف المختار ليس صورة."
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


  /*
    Optional context only.
    Asset folder is controlled
    by Cloudinary Upload Preset.
  */

  if (projectId) {

    formData.append(
      "context",
      `project_id=${String(projectId)}`
    );

  }


  console.info(
    `☁️ Uploading project ${projectId} image to Cloudinary...`
  );


  const response =
    await fetch(

      CLOUDINARY_UPLOAD_URL,

      {

        method:
          "POST",

        body:
          formData

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
      "Cloudinary upload response:",
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

    throw new Error(
      "لم يرجع Cloudinary رابط الصورة."
    );

  }


  console.info(
    `✅ Project ${projectId} image uploaded successfully.`
  );


  console.info(
    `🖼️ ${result.secure_url}`
  );


  return result.secure_url;

}


/* =========================================================
   READ FIRESTORE PROJECTS
========================================================= */

async function readFirestoreProjects() {

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
    snapshotDocument => {

      map.set(

        snapshotDocument.id,

        {

          id:
            snapshotDocument.id,

          ...snapshotDocument.data()

        }

      );

    }
  );


  return {

    snapshot,

    map

  };

}


/* =========================================================
   PREPARE PUBLIC PROJECT
========================================================= */

async function preparePublicProject(
  project,
  remoteProject = null
) {

  const id =
    createProjectId(
      project
    );


  const localImage =
    getProjectImage(
      project
    );


  /*
    Existing public image in Firestore.
    Important so we do not accidentally
    erase uploaded images.
  */

  const remoteImage =
    remoteProject
      ? (
          remoteProject.publicImage ||
          remoteProject.imageUrl ||
          remoteProject.image ||
          ""
        )
      : "";


  let publicImage =
    "";


  /* =====================================================
     CASE 1
     Local image is already public HTTP URL
  ===================================================== */

  if (
    isHttpUrl(
      localImage
    )
  ) {

    publicImage =
      cleanString(
        localImage
      );

  }


  /* =====================================================
     CASE 2
     Local image is Data URL/Base64
  ===================================================== */

  else if (
    isDataImage(
      localImage
    )
  ) {


    const signature =
      createImageSignature(
        project,
        localImage
      );


    /*
      Already uploaded in this browser.
    */

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
        `♻️ Using cached Cloudinary image for ${id}.`
      );

    }


    /*
      Firestore already has Cloudinary image.
      If the project did not change,
      reuse it.
    */

    else if (
      isCloudinaryUrl(
        remoteImage
      )
      &&
      (
        !project.updated
        ||
        project.updated ===
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
        `♻️ Using Firestore image for ${id}.`
      );

    }


    /*
      Upload new image.
    */

    else {


      const file =
        await dataUrlToFile(

          localImage,

          `project-${id}.jpg`

        );


      publicImage =
        await uploadFileToCloudinary(
          file,
          id
        );


      imageCache[
        signature
      ] =
        publicImage;


      saveImageCache();

    }

  }


  /* =====================================================
     CASE 3
     IndexedDB contains Blob/File
  ===================================================== */

  else if (
    localImage instanceof Blob
  ) {


    const file =

      localImage instanceof File

        ? localImage

        : new File(

            [localImage],

            `project-${id}.jpg`,

            {

              type:
                localImage.type ||
                "image/jpeg"

            }

          );


    publicImage =
      await uploadFileToCloudinary(
        file,
        id
      );

  }


  /* =====================================================
     CASE 4
     No local image.

     Preserve existing Firestore image.
  ===================================================== */

  else if (
    isHttpUrl(
      remoteImage
    )
  ) {

    publicImage =
      remoteImage;


    console.info(
      `♻️ Preserving existing image for ${id}.`
    );

  }


  /* =====================================================
     NORMALIZE PROJECT DATA
  ===================================================== */

  const title =
    cleanString(
      project.title ||
      project.name ||
      remoteProject?.title ||
      remoteProject?.name ||
      "مشروع"
    );


  const category =
    cleanString(
      project.category ||
      remoteProject?.category ||
      "أعمالنا"
    );


  const description =
    cleanString(
      project.description ||
      remoteProject?.description ||
      ""
    );


  const driveLink =
    getDriveLink(
      project
    ) ||
    getDriveLink(
      remoteProject || {}
    );


  const status =
    cleanString(
      project.status ||
      remoteProject?.status ||
      ""
    );


  let published;


  if (
    typeof project.published ===
    "boolean"
  ) {

    published =
      project.published;

  }

  else if (
    typeof project.visible ===
    "boolean"
  ) {

    published =
      project.visible;

  }

  else if (
    status
  ) {

    published =
      status.toLowerCase() ===
      "published";

  }

  else {

    published =
      remoteProject?.published !==
      false;

  }


  const updated =

    project.updated ||

    project.updatedAt ||

    new Date()
      .toISOString();


  /*
    IMPORTANT:
    publicImage, imageUrl and image
    all contain the same public URL.

    This keeps old and new website
    scripts compatible.
  */

  return {

    ...project,

    id,

    name:
      title,

    title,

    category,

    description,

    driveLink,

    driveUrl:
      driveLink,

    image:
      publicImage,

    publicImage:
      publicImage,

    imageUrl:
      publicImage,

    /*
      Never upload large Base64 strings
      into Firestore.
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


/* =========================================================
   SYNC CONTROL
========================================================= */

let busy =
  false;


let lastSignature =
  "";


/* =========================================================
   CREATE SYNC SIGNATURE
========================================================= */

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


          return [

            project.id,

            project.updated,

            project.updatedAt,

            project.status,

            project.published,

            project.visible,

            project.name,

            project.title,

            project.category,

            project.description,

            project.driveLink,

            project.driveUrl,

            typeof image === "string"
              ? image.length
              : (
                  image instanceof Blob
                    ? image.size
                    : 0
                )

          ];

        }
      )

    ]
  );

}


/* =========================================================
   MAIN SYNC
========================================================= */

async function syncAll() {

  if (busy) {

    return;

  }


  busy =
    true;


  try {


    const settings =
      readSettings();


    const projects =
      await readProjects();


    const signature =
      createSyncSignature(
        settings,
        projects
      );


    if (
      signature ===
      lastSignature
    ) {

      return;

    }


    console.info(
      `🔄 Starting project sync: ${projects.length} project(s).`
    );


    /* =====================================================
       WEBSITE CONFIG
    ===================================================== */

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

        /*
          Keep existing settings that may
          not currently exist in localStorage.
        */

        merge:
          true

      }

    );


    /* =====================================================
       CURRENT FIRESTORE PROJECTS
    ===================================================== */

    const {
      snapshot:
        existingSnapshot,

      map:
        existingMap

    } =
      await readFirestoreProjects();


    /* =====================================================
       PREPARE PROJECTS
    ===================================================== */

    const publicProjects =
      [];


    for (
      const project
      of projects
    ) {


      const id =
        createProjectId(
          project
        );


      const remoteProject =
        existingMap.get(
          id
        ) || null;


      try {


        const publicProject =
          await preparePublicProject(
            {
              ...project,
              id
            },
            remoteProject
          );


        publicProjects.push(
          publicProject
        );


      } catch (error) {


        console.error(
          `❌ Project ${id} image upload failed:`,
          error
        );


        /*
          Important:
          Preserve old remote image if the
          new local image fails to upload.
        */

        const fallbackImage =

          remoteProject?.publicImage ||

          remoteProject?.imageUrl ||

          remoteProject?.image ||

          "";


        publicProjects.push({

          ...project,

          id,

          image:
            fallbackImage,

          publicImage:
            fallbackImage,

          imageUrl:
            fallbackImage,

          image_data:
            "",

          imageData:
            "",

          driveLink:
            getDriveLink(
              project
            ),

          driveUrl:
            getDriveLink(
              project
            ),

          updated:
            project.updated ||
            project.updatedAt ||
            new Date()
              .toISOString()

        });

      }

    }


    /* =====================================================
       WRITE BATCH
    ===================================================== */

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


    /* =====================================================
       DELETE REMOVED PROJECTS

       Safety:
       If IndexedDB suddenly returns zero projects,
       we do NOT wipe Firestore.
    ===================================================== */

    if (
      projects.length > 0
    ) {


      existingSnapshot.forEach(
        snapshotDocument => {


          if (
            !localIds.has(
              snapshotDocument.id
            )
          ) {

            batch.delete(
              snapshotDocument.ref
            );

          }

        }
      );

    }


    /* =====================================================
       SAVE PROJECTS
    ===================================================== */

    for (
      const project
      of publicProjects
    ) {


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


    await batch.commit();


    lastSignature =
      signature;


    console.info(
      "✅ Projects synced to Firestore successfully."
    );


    /* =====================================================
       PRINT IMAGE LINKS
    ===================================================== */

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


    busy =
      false;

  }

}


/* =========================================================
   MANUAL SYNC COMMAND

   You can run this in Console:

   altariqSyncProjects()
========================================================= */

window.altariqSyncProjects =
  syncAll;


/* =========================================================
   SETTINGS EVENT
========================================================= */

window.addEventListener(

  "altariq:website-settings-updated",

  () => {

    lastSignature =
      "";

    syncAll();

  }

);


/* =========================================================
   STORAGE EVENT
========================================================= */

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


/* =========================================================
   OPTIONAL PROJECT UPDATE EVENTS

   If admin.html dispatches these,
   sync happens immediately.
========================================================= */

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


/* =========================================================
   INITIAL SYNC
========================================================= */

setTimeout(

  () => {

    syncAll();

  },

  800

);


/* =========================================================
   PERIODIC SYNC
========================================================= */

setInterval(

  () => {

    syncAll();

  },

  2000

);


/* =========================================================
   READY
========================================================= */

console.info(
  "✅ Project Cloudinary sync ready."
);


console.info(
  `☁️ Cloudinary: ${CLOUDINARY_CLOUD_NAME}`
);


console.info(
  `📁 Projects preset: ${CLOUDINARY_UPLOAD_PRESET}`
);
