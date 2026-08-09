import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch
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


const SETTINGS_KEY = "altariq_media_website_settings_v1";
const DB_NAME = "altariq_media_admin_database_v2";
const STORE = "projects";


function readSettings() {
  try {
    return JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );
  } catch {
    return {};
  }
}


function openDB() {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = event => {

      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(
          STORE,
          { keyPath: "id" }
        );
      }

    };

  });

}


async function readProjects() {

  const database = await openDB();

  return new Promise((resolve, reject) => {

    const transaction =
      database.transaction(STORE, "readonly");

    const request =
      transaction.objectStore(STORE).getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };

  });

}


/*
  لأن Firebase Storage غير متاح على الخطة الحالية،
  الصور من نوع Base64 لن يتم رفعها إلى Firebase.

  إذا كانت الصورة عبارة عن رابط HTTPS مباشر،
  سنرسل الرابط للموقع.
*/

function preparePublicProject(project) {

  let publicImage = "";

  const image =
    project.publicImage ||
    project.imageUrl ||
    project.image ||
    "";

  if (
    typeof image === "string" &&
    (
      image.startsWith("https://") ||
      image.startsWith("http://")
    )
  ) {
    publicImage = image;
  }


  return {

    ...project,

    /*
      الحقول الجديدة التي يستخدمها موقع الزوار
    */

    title:
      project.title ||
      project.name ||
      "",

    description:
      project.description ||
      "",

    category:
      project.category ||
      "",

    driveUrl:
      project.driveUrl ||
      project.driveLink ||
      "",

    published:
      project.published === true ||
      String(
        project.status || ""
      ).toLowerCase() === "published",

    image: publicImage,

    publicImage: publicImage,

    updatedAt:
      project.updatedAt ||
      project.updated ||
      new Date().toISOString()

  };

}


let busy = false;
let lastSignature = "";


async function syncAll() {

  if (busy) return;

  busy = true;


  try {

    const settings = readSettings();

    const projects =
      await readProjects();


    const signature =
      JSON.stringify([
        settings.savedAt,

        projects.map(project => [
          project.id,
          project.updated,
          project.status,
          project.name,
          project.title,
          project.driveLink,
          project.driveUrl
        ])
      ]);


    if (signature === lastSignature) {
      return;
    }


    /*
      مزامنة إعدادات الموقع
    */

    await setDoc(
      doc(
        db,
        "website_config",
        "main"
      ),

      {
        ...settings,
        syncedAt:
          new Date().toISOString()
      },

      {
        merge: false
      }
    );


    /*
      المشاريع الموجودة حاليًا في Firestore
    */

    const existingSnapshot =
      await getDocs(
        collection(
          db,
          "projects"
        )
      );


    const adminProjectIds =
      new Set(
        projects.map(project =>
          String(project.id)
        )
      );


    const batch =
      writeBatch(db);


    /*
      حذف المشروع من الموقع
      إذا حُذف من الأدمن
    */

    existingSnapshot.forEach(
      documentSnapshot => {

        if (
          !adminProjectIds.has(
            documentSnapshot.id
          )
        ) {

          batch.delete(
            documentSnapshot.ref
          );

        }

      }
    );


    /*
      إضافة / تحديث المشاريع
    */

    for (const project of projects) {

      const id =
        String(
          project.id ||
          crypto.randomUUID()
        );


      const publicProject =
        preparePublicProject({
          ...project,
          id
        });


      batch.set(

        doc(
          db,
          "projects",
          id
        ),

        publicProject,

        {
          merge: false
        }

      );

    }


    await batch.commit();


    lastSignature =
      signature;


    console.info(
      "✅ Projects synced to Firestore successfully."
    );


  } catch (error) {

    console.error(
      "❌ Public sync failed:",
      error
    );

  } finally {

    busy = false;

  }

}


/*
  تحديث بعد تعديل إعدادات الموقع
*/

window.addEventListener(
  "altariq:website-settings-updated",
  syncAll
);


/*
  تحديث عند تغيير LocalStorage
*/

window.addEventListener(
  "storage",
  event => {

    if (
      event.key === SETTINGS_KEY
    ) {
      syncAll();
    }

  }
);


/*
  فحص التغييرات كل 1.8 ثانية
*/

setInterval(
  syncAll,
  1800
);


/*
  تشغيل أول مزامنة بعد فتح الأدمن
*/

setTimeout(
  syncAll,
  700
);
