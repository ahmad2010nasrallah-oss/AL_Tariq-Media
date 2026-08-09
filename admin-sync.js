/* =========================================================
   AL-TARIQ MEDIA
   ADMIN PROJECTS → CLOUDINARY → FIRESTORE SYNC
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
   LOCAL ADMIN DATABASE
========================================================= */

const SETTINGS_KEY =
  "altariq_media_website_settings_v1";


const DB_NAME =
  "altariq_media_admin_database_v2";


const STORE =
  "projects";


/* =========================================================
   CLOUDINARY CACHE
========================================================= */

/*
  نحفظ روابط الصور التي سبق رفعها حتى
  لا يعيد رفع نفس الصورة كل مرة يعمل Sync.
*/

const IMAGE_CACHE_KEY =
  "altariq_cloudinary_project_images_v1";


function readImageCache() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          IMAGE_CACHE_KEY
        ) || "{}"
      );


    return (
      data &&
      typeof data === "object"
    )
      ? data
      : {};

  } catch {

    return {};

  }

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
      "Could not save image cache:",
      error
    );

  }

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

  } catch {

    return {};

  }

}


/* =========================================================
   OPEN INDEXEDDB
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

            database
              .createObjectStore(
                STORE,
                {
                  keyPath: "id"
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
   CHECK PUBLIC HTTP IMAGE
========================================================= */

function isPublicImageUrl(value) {

  if (
    typeof value !== "string"
  ) {

    return false;

  }


  return /^https?:\/\//i.test(
    value.trim()
  );

}


/* =========================================================
   CHECK DATA IMAGE
========================================================= */

function isDataImage(value) {

  if (
    typeof value !== "string"
  ) {

    return false;

  }


  return /^data:image\//i.test(
    value
  );

}


/* =========================================================
   CREATE IMAGE SIGNATURE
========================================================= */

function createImageSignature(
  project,
  image
) {

  return [

    String(
      project.id || ""
    ),

    String(
      project.updated ||
      project.updatedAt ||
      ""
    ),

    String(
      image?.length || 0
    )

  ].join(":");

}


/* =========================================================
   DATA URL → FILE
========================================================= */

function dataUrlToFile(
  dataUrl,
  filename = "project-image.jpg"
) {

  const parts =
    dataUrl.split(",");


  if (
    parts.length < 2
  ) {

    throw new Error(
      "Invalid image data."
    );

  }


  const mimeMatch =
    parts[0].match(
      /data:([^;]+);base64/i
    );


  const mimeType =
    mimeMatch
      ? mimeMatch[1]
      : "image/jpeg";


  const binary =
    atob(parts[1]);


  const bytes =
    new Uint8Array(
      binary.length
    );


  for (
    let i = 0;
    i < binary.length;
    i++
  ) {

    bytes[i] =
      binary.charCodeAt(i);

  }


  return new File(
    [bytes],
    filename,
    {
      type:
        mimeType
    }
  );

}


/* =========================================================
   UPLOAD FILE TO CLOUDINARY
========================================================= */

async function uploadFileToCloudinary(
  file
) {

  if (!file) {

    throw new Error(
      "No image selected."
    );

  }


  /*
    Maximum 10 MB.
  */

  if (
    file.size >
    10 * 1024 * 1024
  ) {

    throw new Error(
      "حجم صورة المشروع أكبر من 10MB."
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
      "Cloudinary error:",
      result
    );


    throw new Error(
      result?.error?.message ||
      "تعذر رفع صورة المشروع إلى Cloudinary."
    );

  }


  if (
    !result.secure_url
  ) {

    throw new Error(
      "Cloudinary did not return a secure image URL."
    );

  }


  return result.secure_url;

}


/* =========================================================
   GET PROJECT IMAGE
========================================================= */

function getOriginalProjectImage(
  project
) {

  /*
    نحاول قراءة الصورة من جميع أسماء
    الحقول المستخدمة في نسخ الأدمن السابقة.
  */

  return (

    project.image ||

    project.image_data ||

    project.imageData ||

    project.publicImage ||

    project.imageUrl ||

    ""

  );

}


/* =========================================================
   PREPARE PROJECT FOR PUBLIC WEBSITE
========================================================= */

async function preparePublicProject(
  project
) {

  const id =
    String(
      project.id ||
      crypto.randomUUID()
    );


  let originalImage =
    getOriginalProjectImage(
      project
    );


  let publicImage =
    "";


  /*
    الصورة أصلًا رابط عام؟
    نستخدمها كما هي.
  */

  if (
    isPublicImageUrl(
      originalImage
    )
  ) {

    publicImage =
      originalImage;

  }


  /*
    الصورة Base64 مخزنة محليًا؟
    نرفعها إلى Cloudinary.
  */

  else if (
    isDataImage(
      originalImage
    )
  ) {

    const signature =
      createImageSignature(
        project,
        originalImage
      );


    /*
      سبق رفع نفس الصورة.
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

    } else {

      console.info(
        `☁️ Uploading project ${id} image to Cloudinary...`
      );


      const file =
        dataUrlToFile(
          originalImage,
          `project-${id}.jpg`
        );


      publicImage =
        await uploadFileToCloudinary(
          file
        );


      imageCache[
        signature
      ] =
        publicImage;


      saveImageCache();


      console.info(
        `✅ Project ${id} image uploaded to Cloudinary.`
      );

    }

  }


  /*
    بعض نسخ الأدمن قد تخزن Blob/File
    داخل IndexedDB.
  */

  else if (
    originalImage instanceof Blob
  ) {

    const file =

      originalImage instanceof File

        ? originalImage

        : new File(
            [originalImage],
            `project-${id}.jpg`,
            {
              type:
                originalImage.type ||
                "image/jpeg"
            }
          );


    publicImage =
      await uploadFileToCloudinary(
        file
      );

  }


  /*
    مهم:
    نخزن رابط Cloudinary في أكثر من اسم
    لضمان التوافق مع public-admin-sync.js
    والنسخ القديمة من الموقع.
  */

  return {

    ...project,

    id,

    image:
      publicImage,

    publicImage:
      publicImage,

    imageUrl:
      publicImage,

    /*
      لا نرسل base64 إلى Firestore.
    */

    image_data:
      "",

    imageData:
      "",

    updated:
      project.updated ||
      new Date()
        .toISOString()

  };

}


/* =========================================================
   SYNC STATUS
========================================================= */

let busy =
  false;


let lastSignature =
  "";


/* =========================================================
   CREATE PROJECT SIGNATURE
========================================================= */

function createProjectSignature(
  settings,
  projects
) {

  return JSON.stringify(
    [

      settings.savedAt ||
      settings.updated ||
      "",


      projects.map(
        project => [

          project.id,

          project.updated,

          project.updatedAt,

          project.status,

          project.published,

          project.name,

          project.title,

          project.category,

          project.driveLink,

          project.driveUrl,

          getOriginalProjectImage(
            project
          )?.length || 0

        ]
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
      createProjectSignature(
        settings,
        projects
      );


    /*
      لا يوجد أي تغيير.
    */

    if (
      signature ===
      lastSignature
    ) {

      return;

    }


    console.info(
      `🔄 Syncing ${projects.length} project(s)...`
    );


    /* =====================================================
       WEBSITE SETTINGS
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
        merge:true
      }

    );


    /* =====================================================
       PREPARE PROJECTS
    ===================================================== */

    const publicProjects =
      [];


    for (
      const project
      of projects
    ) {

      try {

        const prepared =
          await preparePublicProject(
            project
          );


        publicProjects.push(
          prepared
        );


      } catch (imageError) {

        console.error(
          `❌ Project ${project.id} image upload failed:`,
          imageError
        );


        /*
          لا نوقف مزامنة باقي المشاريع.
          نخزن المشروع حتى لو فشل رفع صورته.
        */

        publicProjects.push({

          ...project,

          id:
            String(
              project.id ||
              crypto.randomUUID()
            ),

          image:
            isPublicImageUrl(
              project.image
            )
              ? project.image
              : "",

          publicImage:
            isPublicImageUrl(
              project.publicImage
            )
              ? project.publicImage
              : "",

          imageUrl:
            isPublicImageUrl(
              project.imageUrl
            )
              ? project.imageUrl
              : ""

        });

      }

    }


    /* =====================================================
       READ CURRENT FIRESTORE PROJECTS
    ===================================================== */

    const existingSnapshot =
      await getDocs(
        collection(
          db,
          "projects"
        )
      );


    const localIds =
      new Set(
        publicProjects.map(
          project =>
            String(project.id)
        )
      );


    const batch =
      writeBatch(db);


    /* =====================================================
       DELETE REMOVED PROJECTS

       حفاظًا على البيانات:
       لا نحذف كل Firestore لو IndexedDB فاضي فجأة.
    ===================================================== */

    if (
      projects.length > 0
    ) {

      existingSnapshot.forEach(
        documentSnapshot => {

          if (
            !localIds.has(
              documentSnapshot.id
            )
          ) {

            batch.delete(
              documentSnapshot.ref
            );

          }

        }
      );

    }


    /* =====================================================
       SAVE PROJECTS TO FIRESTORE
    ===================================================== */

    for (
      const project
      of publicProjects
    ) {

      const id =
        String(
          project.id
        );


      batch.set(

        doc(
          db,
          "projects",
          id
        ),

        project,

        {
          merge:false
        }

      );

    }


    await batch.commit();


    lastSignature =
      signature;


    console.info(
      "✅ Projects synced to Firestore successfully."
    );


    /*
      عرض روابط الصور للتأكد.
    */

    publicProjects.forEach(
      project => {

        if (
          project.publicImage
        ) {

          console.info(
            `🖼️ ${project.id}:`,
            project.publicImage
          );

        }

      }
    );


  } catch (error) {

    console.error(
      "❌ Public project sync failed:",
      error
    );


  } finally {

    busy =
      false;

  }

}


/* =========================================================
   ADMIN EVENTS
========================================================= */

window.addEventListener(

  "altariq:website-settings-updated",

  () => {

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

      syncAll();

    }

  }

);


/* =========================================================
   FORCE MANUAL SYNC FROM CONSOLE
========================================================= */

window.altariqSyncProjects =
  syncAll;


/* =========================================================
   AUTO SYNC
========================================================= */

/*
  أول مزامنة بعد تحميل الأدمن.
*/

setTimeout(
  syncAll,
  800
);


/*
  مزامنة دورية.
  2 ثوانٍ كافية للأدمن.
*/

setInterval(
  syncAll,
  2000
);


/* =========================================================
   READY
========================================================= */

console.info(
  "✅ Project Cloudinary sync ready."
);


console.info(
  "☁️ Cloudinary cloud:",
  CLOUDINARY_CLOUD_NAME
);


console.info(
  "📁 Project upload preset:",
  CLOUDINARY_UPLOAD_PRESET
);
