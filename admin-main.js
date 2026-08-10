const LANGUAGE_KEY = "altariq_media_admin_language_v1";
    let currentLang = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";

    const STATIC_TRANSLATIONS = {
      "Admin Login": {en:"Admin Login", ar:"تسجيل دخول الإدارة"},
      "تسجيل الدخول إلى لوحة إدارة شركة الطريق ميديا": {en:"Sign in to the Al‑Tariq Media administration panel", ar:"تسجيل الدخول إلى لوحة إدارة شركة الطريق ميديا"},
      "Username / اسم المستخدم": {en:"Username", ar:"اسم المستخدم"},
      "Password / كلمة المرور": {en:"Password", ar:"كلمة المرور"},
      "Login to Dashboard": {en:"Login to Dashboard", ar:"الدخول إلى لوحة التحكم"},
      "Default account: Username": {en:"Default account: Username", ar:"الحساب الافتراضي: اسم المستخدم"},
      "— Password": {en:"— Password", ar:"— كلمة المرور"},
      "Al‑Tariq Media": {en:"Al‑Tariq Media", ar:"الطريق ميديا"},
      "Creative Admin System": {en:"Creative Admin System", ar:"نظام الإدارة الإبداعي"},
      "Dashboard": {en:"Dashboard", ar:"لوحة التحكم"},
      "لوحة التحكم": {en:"Overview", ar:"نظرة عامة"},
      "Our Works": {en:"Our Works", ar:"عرض أعمالنا"},
      "عرض أعمالنا": {en:"Portfolio", ar:"معرض المشاريع"},
      "Services": {en:"Services", ar:"الخدمات"},
      "خدمات الشركة": {en:"Company services", ar:"خدمات الشركة"},
      "Media Library": {en:"Media Library", ar:"مكتبة الوسائط"},
      "مكتبة الوسائط": {en:"Project media", ar:"وسائط المشاريع"},
      "Website Settings": {en:"Website Settings", ar:"إعدادات الويب سايت"},
      "إعدادات الويب سايت": {en:"Website configuration", ar:"إعدادات الموقع"},
      "Website": {en:"Website", ar:"إعدادات"},
      "إدارة بيانات الموقع، التواصل، محركات البحث والأقسام الظاهرة للزوار.": {en:"Manage website information, contact details, search settings and visible sections.", ar:"إدارة بيانات الموقع، التواصل، محركات البحث والأقسام الظاهرة للزوار."},
      "Open Website": {en:"Open Website", ar:"فتح الموقع"},
      "General Information": {en:"General Information", ar:"المعلومات العامة"},
      "معلومات وهوية الموقع": {en:"Website information and identity", ar:"معلومات وهوية الموقع"},
      "Contact & Social Media": {en:"Contact & Social Media", ar:"التواصل والسوشال ميديا"},
      "معلومات التواصل والحسابات": {en:"Contact information and social accounts", ar:"معلومات التواصل والحسابات"},
      "SEO Settings": {en:"SEO Settings", ar:"إعدادات محركات البحث"},
      "تهيئة الموقع لمحركات البحث": {en:"Search engine optimization", ar:"تهيئة الموقع لمحركات البحث"},
      "Visible Sections": {en:"Visible Sections", ar:"الأقسام الظاهرة"},
      "التحكم بما يظهر للزوار": {en:"Control what visitors can see", ar:"التحكم بما يظهر للزوار"},
      "Services Section": {en:"Services Section", ar:"قسم الخدمات"},
      "Our Works Section": {en:"Our Works Section", ar:"قسم أعمالنا"},
      "Testimonials Section": {en:"Testimonials Section", ar:"قسم آراء العملاء"},
      "Contact Section": {en:"Contact Section", ar:"قسم التواصل"},
      "Maintenance Mode": {en:"Maintenance Mode", ar:"وضع الصيانة"},
      "Reset Defaults": {en:"Reset Defaults", ar:"استعادة الافتراضي"},
      "Export Settings JSON": {en:"Export Settings JSON", ar:"تصدير إعدادات JSON"},
      "Save Website Settings": {en:"Save Website Settings", ar:"حفظ إعدادات الموقع"},
      "Settings": {en:"Settings", ar:"الإعدادات"},
      "الإعدادات": {en:"System settings", ar:"إعدادات النظام"},
      "System Status": {en:"System Status", ar:"حالة النظام"},
      "● All systems operational": {en:"● All systems operational", ar:"● جميع الأنظمة تعمل"},
      "＋ Add New Project": {en:"＋ Add New Project", ar:"＋ إضافة مشروع جديد"},
      "Manage your creative business from one premium workspace.": {en:"Manage your creative business from one premium workspace.", ar:"أدر أعمالك الإبداعية من مساحة احترافية واحدة."},
      "Creative Control Center": {en:"Creative Control Center", ar:"مركز التحكم الإبداعي"},
      "مرحباً بك في لوحة إدارة": {en:"Welcome to the administration panel of", ar:"مرحباً بك في لوحة إدارة"},
      "الطريق ميديا": {en:"Al‑Tariq Media", ar:"الطريق ميديا"},
      "إدارة احترافية لأعمال الهوية البصرية، السوشال ميديا، التصوير، المونتاج وتصميم المواقع. جميع مشاريع قسم": {en:"Professional management for visual identity, social media, photography, video editing and web design. All projects in", ar:"إدارة احترافية لأعمال الهوية البصرية، السوشال ميديا، التصوير، المونتاج وتصميم المواقع. جميع مشاريع قسم"},
      "قابلة للتعديل مباشرة بالنقر على البطاقة أو الصورة.": {en:"can be edited directly by clicking the card or image.", ar:"قابلة للتعديل مباشرة بالنقر على البطاقة أو الصورة."},
      "Total Projects": {en:"Total Projects", ar:"إجمالي المشاريع"},
      "↑ Portfolio database": {en:"↑ Portfolio database", ar:"↑ قاعدة بيانات الأعمال"},
      "Published Works": {en:"Published Works", ar:"الأعمال المنشورة"},
      "● Live & editable": {en:"● Live & editable", ar:"● منشورة وقابلة للتعديل"},
      "Core Services": {en:"Core Services", ar:"الخدمات الأساسية"},
      "Creative departments": {en:"Creative departments", ar:"الأقسام الإبداعية"},
      "Storage Mode": {en:"Storage Mode", ar:"طريقة التخزين"},
      "Browser saved": {en:"Browser saved", ar:"محفوظة في المتصفح"},
      "IndexedDB storage": {en:"IndexedDB storage", ar:"قاعدة بيانات داخل الجهاز"},
      "Recent Activity": {en:"Recent Activity", ar:"النشاط الأخير"},
      "آخر التعديلات على المشاريع": {en:"Latest project changes", ar:"آخر التعديلات على المشاريع"},
      "View all": {en:"View all", ar:"عرض الكل"},
      "Service Performance": {en:"Service Performance", ar:"أداء الخدمات"},
      "Business focus overview": {en:"Business focus overview", ar:"نظرة عامة على تركيز الأعمال"},
      "Social Media Management": {en:"Social Media Management", ar:"إدارة مواقع التواصل"},
      "Photography & Production": {en:"Photography & Production", ar:"التصوير والإنتاج"},
      "Video Editing": {en:"Video Editing", ar:"مونتاج الفيديو"},
      "Web Design": {en:"Web Design", ar:"تصميم المواقع"},
      "Digital Growth": {en:"Digital Growth", ar:"نمو رقمي"},
      "Visual Production": {en:"Visual Production", ar:"إنتاج بصري"},
      "Motion & Editing": {en:"Motion & Editing", ar:"حركة ومونتاج"},
      "Web Experience": {en:"Web Experience", ar:"تجربة ويب"},
      "انقر على أي مشروع أو صورة لتعديل الاسم، الوصف، التصنيف والصورة ثم احفظ التغييرات.": {en:"Click any project or image to edit its name, description, category and image, then save the changes.", ar:"انقر على أي مشروع أو صورة لتعديل الاسم، الوصف، التصنيف والصورة ثم احفظ التغييرات."},
      "＋ Add Project": {en:"＋ Add Project", ar:"＋ إضافة مشروع"},
      "All Categories": {en:"All Categories", ar:"جميع التصنيفات"},
      "Visual Identity": {en:"Visual Identity", ar:"هوية بصرية"},
      "Social Media": {en:"Social Media", ar:"مواقع التواصل"},
      "Photography": {en:"Photography", ar:"التصوير"},
      "Video Production": {en:"Video Production", ar:"إنتاج الفيديو"},
      "Reset Demo": {en:"Reset Demo", ar:"استعادة المشاريع التجريبية"},
      "Company": {en:"Company", ar:"خدمات"},
      "الخدمات الأساسية التي تقدمها شركة الطريق ميديا.": {en:"The core services provided by Al‑Tariq Media.", ar:"الخدمات الأساسية التي تقدمها شركة الطريق ميديا."},
      "إدارة المحتوى، التخطيط، النشر وبناء الهوية الرقمية للحسابات.": {en:"Content management, planning, publishing and building a consistent digital identity.", ar:"إدارة المحتوى، التخطيط، النشر وبناء الهوية الرقمية للحسابات."},
      "تصوير المنتجات والحملات التجارية بأسلوب احترافي متوافق مع العلامة.": {en:"Professional product and commercial campaign photography aligned with the brand.", ar:"تصوير المنتجات والحملات التجارية بأسلوب احترافي متوافق مع العلامة."},
      "مونتاج الفيديوهات الإعلانية والقصيرة مع معالجة بصرية احترافية.": {en:"Editing promotional and short videos with professional visual treatment.", ar:"مونتاج الفيديوهات الإعلانية والقصيرة مع معالجة بصرية احترافية."},
      "تصميم مواقع سريعة ومتجاوبة تعكس هوية المشروع وتخدم أهدافه.": {en:"Fast, responsive websites that reflect the project identity and support its goals.", ar:"تصميم مواقع سريعة ومتجاوبة تعكس هوية المشروع وتخدم أهدافه."},
      "Media": {en:"Media", ar:"مكتبة"},
      "Library": {en:"Library", ar:"الوسائط"},
      "جميع صور المشاريع المحفوظة حالياً داخل المتصفح.": {en:"All project images currently saved in this browser.", ar:"جميع صور المشاريع المحفوظة حالياً داخل المتصفح."},
      "System": {en:"System", ar:"إعدادات"},
      "إعدادات واجهة لوحة الإدارة والنسخ الاحتياطي.": {en:"Administration interface and backup settings.", ar:"إعدادات واجهة لوحة الإدارة والنسخ الاحتياطي."},
      "Interface Preferences": {en:"Interface Preferences", ar:"تفضيلات الواجهة"},
      "Display options": {en:"Display options", ar:"خيارات العرض"},
      "Glass Shine": {en:"Glass Shine", ar:"لمعة الزجاج"},
      "لمعة وتأثيرات الزجاج": {en:"Glass shine and blur effects", ar:"لمعة وتأثيرات الزجاج"},
      "Compact Cards": {en:"Compact Cards", ar:"بطاقات مضغوطة"},
      "Reduce portfolio spacing": {en:"Reduce portfolio spacing", ar:"تقليل المسافات بين المشاريع"},
      "Live Editing": {en:"Live Editing", ar:"التعديل المباشر"},
      "Click cards to edit instantly": {en:"Click cards to edit instantly", ar:"انقر على البطاقة لتعديلها مباشرة"},
      "Backup": {en:"Backup", ar:"النسخ الاحتياطي"},
      "النسخ الاحتياطي واستعادة البيانات": {en:"Back up and restore your data", ar:"النسخ الاحتياطي واستعادة البيانات"},
      "هذه النسخة تحفظ الأعمال داخل": {en:"This version stores projects in", ar:"هذه النسخة تحفظ الأعمال داخل"},
      "في نفس المتصفح. صدّر ملف JSON للاحتفاظ بنسخة آمنة، أو استورد نسخة سابقة لاستعادة المشاريع.": {en:"in the same browser. Export a JSON file to keep a safe copy, or import a previous backup to restore your projects.", ar:"في نفس المتصفح. صدّر ملف JSON للاحتفاظ بنسخة آمنة، أو استورد نسخة سابقة لاستعادة المشاريع."},
      "يُفضّل تصدير نسخة احتياطية بعد أي تعديل مهم، وقبل مسح بيانات المتصفح أو الانتقال إلى جهاز آخر.": {en:"Export a backup after important changes and before clearing browser data or moving to another device.", ar:"يُفضّل تصدير نسخة احتياطية بعد أي تعديل مهم، وقبل مسح بيانات المتصفح أو الانتقال إلى جهاز آخر."},
      "Data & Backup": {en:"Data & Backup", ar:"البيانات والنسخ الاحتياطي"},
      "Local project database": {en:"Local project database", ar:"قاعدة بيانات المشاريع المحلية"},
      "هذه النسخة تحفظ الأعمال داخل": {en:"This version stores projects in", ar:"هذه النسخة تحفظ الأعمال داخل"},
      "Local Storage": {en:"IndexedDB", ar:"قاعدة بيانات IndexedDB"},
      "في نفس المتصفح. استخدم زر التصدير للاحتفاظ بنسخة JSON من بيانات المشاريع.": {en:"in the same browser using IndexedDB, which supports larger images. Use Export to keep a JSON backup.", ar:"داخل المتصفح باستخدام IndexedDB التي تدعم الصور الكبيرة. استخدم زر التصدير للاحتفاظ بنسخة JSON."},
      "Export JSON": {en:"Export JSON", ar:"تصدير JSON"},
      "Import JSON": {en:"Import JSON", ar:"استيراد JSON"},
      "Account Credentials": {en:"Account Credentials", ar:"بيانات تسجيل الدخول"},
      "تغيير اسم المستخدم أو كلمة المرور": {en:"Change username or password", ar:"تغيير اسم المستخدم أو كلمة المرور"},
      "لتأكيد أي تغيير يجب إدخال كلمة المرور الحالية أولاً. بعد الحفظ سيتم تسجيل الخروج تلقائياً واستخدام البيانات الجديدة.": {en:"Enter the current password to confirm changes. After saving, you will be signed out and the new credentials will be used.", ar:"لتأكيد أي تغيير يجب إدخال كلمة المرور الحالية أولاً. بعد الحفظ سيتم تسجيل الخروج تلقائياً واستخدام البيانات الجديدة."},
      "Current Password / كلمة المرور الحالية": {en:"Current Password", ar:"كلمة المرور الحالية"},
      "New Username / اسم المستخدم الجديد": {en:"New Username", ar:"اسم المستخدم الجديد"},
      "New Password / كلمة المرور الجديدة": {en:"New Password", ar:"كلمة المرور الجديدة"},
      "Confirm New Password / تأكيد كلمة المرور": {en:"Confirm New Password", ar:"تأكيد كلمة المرور الجديدة"},
      "Save Login Credentials": {en:"Save Login Credentials", ar:"حفظ بيانات الدخول"},
      "Edit Project": {en:"Edit Project", ar:"تعديل المشروع"},
      "Update content and replace the image from your device.": {en:"Update content and replace the image from your device.", ar:"عدّل المحتوى واستبدل الصورة من جهازك."},
      "Project Name / اسم المشروع": {en:"Project Name", ar:"اسم المشروع"},
      "Category / التصنيف": {en:"Category", ar:"التصنيف"},
      "Description / الوصف": {en:"Description", ar:"الوصف"},
      "Google Drive Link / رابط Google Drive": {en:"Google Drive Link", ar:"رابط Google Drive"},
      "ألصق رابط المشاركة من Google Drive أو Google Docs. سيظهر زر فتح الرابط داخل بطاقة المشروع.": {en:"Paste a shared Google Drive or Google Docs link. An open-link button will appear on the project card.", ar:"ألصق رابط المشاركة من Google Drive أو Google Docs. سيظهر زر فتح الرابط داخل بطاقة المشروع."},
      "Project Image / صورة المشروع": {en:"Project Image", ar:"صورة المشروع"},
      "Replace project cover": {en:"Replace project cover", ar:"استبدال غلاف المشروع"},
      "اختر صورة من جهازك بحجم لا يتجاوز 10 ميجابايت. سيتم حفظها داخل المتصفح ويمكن تعديلها لاحقاً بالنقر على المشروع.": {en:"Choose an image from your device with a maximum size of 10 MB. It will be saved in the browser and can be changed later by opening the project.", ar:"اختر صورة من جهازك بحجم لا يتجاوز 10 ميجابايت. سيتم حفظها داخل المتصفح ويمكن تعديلها لاحقاً بالنقر على المشروع."},
      "Choose Image": {en:"Choose Image", ar:"اختيار صورة"},
      "Status": {en:"Status", ar:"الحالة"},
      "Published": {en:"Published", ar:"منشور"},
      "Draft": {en:"Draft", ar:"مسودة"},
      "Client / العميل": {en:"Client", ar:"العميل"},
      "Delete Project": {en:"Delete Project", ar:"حذف المشروع"},
      "Cancel": {en:"Cancel", ar:"إلغاء"},
      "Save Changes": {en:"Save Changes", ar:"حفظ التغييرات"},
      "Saved successfully": {en:"Saved successfully", ar:"تم الحفظ بنجاح"}
    };

    const ATTRIBUTE_TRANSLATIONS = {
      "شعار الطريق ميديا": {en:"Al‑Tariq Media logo", ar:"شعار الطريق ميديا"},
      "إظهار كلمة المرور": {en:"Show password", ar:"إظهار كلمة المرور"},
      "فتح القائمة": {en:"Open menu", ar:"فتح القائمة"},
      "Export data": {en:"Export data", ar:"تصدير البيانات"},
      "Toggle glow": {en:"Toggle glow", ar:"تبديل الإضاءة"},
      "Logout": {en:"Logout", ar:"تسجيل الخروج"},
      "Search projects / ابحث عن مشروع...": {en:"Search projects...", ar:"ابحث عن مشروع..."},
      "Glass shine": {en:"Glass shine", ar:"لمعة الزجاج"},
      "Compact cards": {en:"Compact cards", ar:"بطاقات مضغوطة"},
      "Live editing": {en:"Live editing", ar:"التعديل المباشر"},
      "Project preview": {en:"Project preview", ar:"معاينة المشروع"},
      "Client name": {en:"Client name", ar:"اسم العميل"},
      "Switch language": {en:"Switch to Arabic", ar:"التبديل إلى الإنجليزية"},
      "إدارة مواقع التواصل الاجتماعي": {en:"Social media management service", ar:"إدارة مواقع التواصل الاجتماعي"},
      "خدمة تصوير المنتجات والحملات": {en:"Product and campaign photography service", ar:"خدمة تصوير المنتجات والحملات"},
      "خدمة مونتاج وإنتاج الفيديو": {en:"Video editing and production service", ar:"خدمة مونتاج وإنتاج الفيديو"},
      "خدمة تصميم وتطوير المواقع": {en:"Website design and development service", ar:"خدمة تصميم وتطوير المواقع"}
    };

    const UI_TEXT = {
      pageDashboard:{en:"Dashboard",ar:"لوحة التحكم"},
      pageWorks:{en:"Our Works",ar:"عرض أعمالنا"},
      pageServices:{en:"Services",ar:"الخدمات"},
      pageMedia:{en:"Media Library",ar:"مكتبة الوسائط"},
      pageSettings:{en:"Settings",ar:"الإعدادات"},
      now:{en:"now",ar:"الآن"},
      minute:{en:"m",ar:"د"}, hour:{en:"h",ar:"س"}, day:{en:"d",ar:"ي"},
      clickEdit:{en:"Click to Edit",ar:"انقر للتعديل"},
      openDrive:{en:"Open Google Drive",ar:"فتح Google Drive"},
      noDescription:{en:"No description added.",ar:"لم تتم إضافة وصف."},
      noProjects:{en:"No projects found. Change the search or add a new project.",ar:"لم يتم العثور على مشاريع. غيّر البحث أو أضف مشروعاً جديداً."},
      mediaEmpty:{en:"Media library is empty.",ar:"مكتبة الوسائط فارغة."},
      addProject:{en:"Add New Project",ar:"إضافة مشروع جديد"},
      editProject:{en:"Edit Project",ar:"تعديل المشروع"},
      invalidLogin:{en:"Incorrect username or password.",ar:"اسم المستخدم أو كلمة المرور غير صحيحة."},
      wrongCurrentPassword:{en:"The current password is incorrect.",ar:"كلمة المرور الحالية غير صحيحة."},
      usernameRequired:{en:"The new username is required.",ar:"اسم المستخدم الجديد مطلوب."},
      passwordMismatch:{en:"The new passwords do not match.",ar:"كلمتا المرور الجديدتان غير متطابقتين."},
      credentialsUpdated:{en:"Login credentials changed. You will be signed out.",ar:"تم تغيير بيانات الدخول. سيتم تسجيل الخروج."},
      chooseImage:{en:"Please choose an image file.",ar:"يرجى اختيار ملف صورة."},
      imageLarge:{en:"Image size exceeds 10 MB. Please choose a smaller image.",ar:"حجم الصورة يتجاوز 10 ميجابايت. يرجى اختيار صورة أصغر."},
      saveFailed:{en:"Saving failed. Please close other tabs, check browser storage permissions, and try again.",ar:"فشل حفظ التغييرات. أغلق أي نسخة أخرى من الصفحة وتأكد أن المتصفح يسمح بالتخزين ثم حاول مجدداً."},
      loadFailed:{en:"Projects could not be loaded. Please refresh the page.",ar:"تعذّر تحميل المشاريع. يرجى تحديث الصفحة."},
      invalidDrive:{en:"Enter a valid Google Drive or Google Docs HTTPS link.",ar:"أدخل رابط Google Drive أو Google Docs صحيحاً ويبدأ بـ https://"},
      projectNameRequired:{en:"Project name is required.",ar:"اسم المشروع مطلوب."},
      projectSaved:{en:"Project saved successfully.",ar:"تم حفظ المشروع بنجاح."},
      deleteConfirm:{en:"Delete this project?",ar:"هل تريد حذف هذا المشروع؟"},
      projectDeleted:{en:"Project deleted.",ar:"تم حذف المشروع."},
      resetConfirm:{en:"Reset all projects to the original demo data?",ar:"هل تريد استعادة جميع المشاريع التجريبية الأصلية؟"},
      demoRestored:{en:"Demo projects restored.",ar:"تمت استعادة المشاريع التجريبية."},
      backupExported:{en:"JSON backup exported.",ar:"تم تصدير النسخة الاحتياطية JSON."},
      imported:{en:"Projects imported successfully.",ar:"تم استيراد المشاريع بنجاح."},
      invalidBackup:{en:"Invalid JSON backup file.",ar:"ملف النسخة الاحتياطية JSON غير صالح."},
      glowReduced:{en:"Glow reduced.",ar:"تم تقليل الإضاءة."},
      glowEnabled:{en:"Brand glow enabled.",ar:"تم تفعيل إضاءة الهوية."},
      pageWebsiteSettings:{en:"Website Settings",ar:"إعدادات الويب سايت"},
      websiteSettingsSaved:{en:"Website settings saved successfully.",ar:"تم حفظ إعدادات الويب سايت بنجاح."},
      websiteSettingsReset:{en:"Default website settings restored.",ar:"تمت استعادة إعدادات الويب سايت الافتراضية."},
      websiteSettingsExported:{en:"Website settings JSON exported.",ar:"تم تصدير إعدادات الويب سايت بصيغة JSON."},
      websiteSettingsResetConfirm:{en:"Restore all website settings to their default values?",ar:"هل تريد استعادة جميع إعدادات الويب سايت الافتراضية؟"},
      websiteUrlMissing:{en:"Add the website URL first.",ar:"أضف رابط الويب سايت أولاً."},
      invalidWebsiteUrl:{en:"One or more website or social links are invalid.",ar:"يوجد رابط غير صحيح في رابط الموقع أو روابط التواصل."},
      activityAdmin:{en:"Al‑Tariq Media Admin",ar:"إدارة الطريق ميديا"},
      statusPublished:{en:"Published",ar:"منشور"},
      statusDraft:{en:"Draft",ar:"مسودة"},
      categoryVisual:{en:"Visual Identity",ar:"هوية بصرية"},
      categorySocial:{en:"Social Media",ar:"مواقع التواصل"},
      categoryPhoto:{en:"Photography",ar:"التصوير"},
      categoryVideo:{en:"Video Production",ar:"إنتاج الفيديو"},
      categoryWeb:{en:"Web Design",ar:"تصميم المواقع"}
    };

    const staticTextNodes = [];
    const staticAttributeNodes = [];

    function uiText(key){ return UI_TEXT[key]?.[currentLang] || key; }

    function captureStaticTranslations(){
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while((node = walker.nextNode())){
        const parent = node.parentElement;
        if(!parent || ["SCRIPT","STYLE"].includes(parent.tagName)) continue;
        const key = node.nodeValue.trim().replace(/\s+/g," ");
        if(STATIC_TRANSLATIONS[key]){
          const match = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
          staticTextNodes.push({node,key,before:match?.[1]||"",after:match?.[3]||""});
        }
      }
      document.querySelectorAll("[placeholder],[aria-label],[alt],[title]").forEach(el=>{
        ["placeholder","aria-label","alt","title"].forEach(attr=>{
          const key = el.getAttribute(attr);
          if(key && ATTRIBUTE_TRANSLATIONS[key]) staticAttributeNodes.push({el,attr,key});
        });
      });
    }

    function translateActivityText(text=""){
      const exact = {
        "Portfolio system initialized":{en:"Portfolio system initialized",ar:"تم تشغيل نظام معرض الأعمال"},
        "Brand colors applied successfully":{en:"Brand colors applied successfully",ar:"تم تطبيق ألوان الهوية بنجاح"},
        "Editable works library is ready":{en:"Editable works library is ready",ar:"مكتبة الأعمال القابلة للتعديل جاهزة"},
        "Admin login credentials updated":{en:"Admin login credentials updated",ar:"تم تحديث بيانات دخول الإدارة"},
        "Demo portfolio restored":{en:"Demo portfolio restored",ar:"تمت استعادة معرض الأعمال التجريبي"},
        "Imported project backup":{en:"Imported project backup",ar:"تم استيراد نسخة المشاريع الاحتياطية"},
        "Website settings updated":{en:"Website settings updated",ar:"تم تحديث إعدادات الويب سايت"}
      };
      if(exact[text]) return exact[text][currentLang];
      const patterns = [
        [/^Updated project:\s*(.*)$/,{en:"Updated project: $1",ar:"تم تعديل المشروع: $1"}],
        [/^Added new project:\s*(.*)$/,{en:"Added new project: $1",ar:"تمت إضافة مشروع جديد: $1"}],
        [/^Deleted project:\s*(.*)$/,{en:"Deleted project: $1",ar:"تم حذف المشروع: $1"}]
      ];
      for(const [regex,value] of patterns){
        const match=text.match(regex);
        if(match) return value[currentLang].replace("$1",match[1]);
      }
      return text;
    }

    function translatedCategory(value=""){
      const keys={"Visual Identity":"categoryVisual","Social Media":"categorySocial","Photography":"categoryPhoto","Video Production":"categoryVideo","Web Design":"categoryWeb"};
      return keys[value] ? uiText(keys[value]) : value;
    }
    function translatedStatus(value=""){
      return value === "Published" ? uiText("statusPublished") : value === "Draft" ? uiText("statusDraft") : value;
    }
    function translatedDemoDescription(value=""){
      const descriptions={
        "نظام هوية بصرية متكامل يشمل الشعار، الألوان وتطبيقات العلامة.":"A complete visual identity system including the logo, colors and brand applications.",
        "حملة سوشال ميديا بمحتوى بصري موحد وقوالب إعلانية قابلة للتوسع.":"A social media campaign with consistent visual content and scalable advertising templates.",
        "تصوير منتجات بأسلوب تجاري نظيف مع إضاءة وظلال مناسبة للمتاجر الإلكترونية.":"Clean commercial product photography with lighting and shadows suitable for online stores.",
        "حزمة فيديوهات إطلاق تشمل المونتاج، التلوين والحركة البصرية.":"A launch video package including editing, color grading and motion graphics.",
        "تصميم واجهة موقع شركة حديثة، سريعة ومتجاوبة مع جميع الشاشات.":"A modern, fast and responsive corporate website interface.",
        "هوية عصرية مرنة مع دليل استخدام وتطبيقات رقمية ومطبوعات.":"A flexible modern identity with guidelines, digital applications and print materials."
      };
      return currentLang === "en" && descriptions[value] ? descriptions[value] : value;
    }

    function refreshLanguageButtons(){
      document.querySelectorAll("[data-language-toggle]").forEach(btn=>{
        const targetLang = currentLang === "ar" ? "en" : "ar";
        const code = btn.querySelector(".lang-code");
        const name = btn.querySelector(".lang-name");
        if(code) code.textContent = targetLang === "en" ? "EN" : "ع";
        if(name) name.textContent = targetLang === "en" ? "English" : "العربية";
        btn.setAttribute("aria-label", currentLang === "ar" ? "التبديل إلى الإنجليزية" : "Switch to Arabic");
        btn.title = currentLang === "ar" ? "التبديل إلى الإنجليزية" : "Switch to Arabic";
      });
    }

    function applyLanguage(lang, rerender=true){
      currentLang = lang === "en" ? "en" : "ar";
      localStorage.setItem(LANGUAGE_KEY,currentLang);
      document.documentElement.lang=currentLang;
      document.documentElement.dir=currentLang === "ar" ? "rtl" : "ltr";
      document.body.dataset.lang=currentLang;
      document.title=currentLang === "ar" ? "الطريق ميديا — لوحة الإدارة" : "Al‑Tariq Media — Admin Panel";
      staticTextNodes.forEach(item=>{
        item.node.nodeValue=item.before+STATIC_TRANSLATIONS[item.key][currentLang]+item.after;
      });
      staticAttributeNodes.forEach(item=>{
        item.el.setAttribute(item.attr,ATTRIBUTE_TRANSLATIONS[item.key][currentLang]);
      });
      refreshLanguageButtons();
      if(rerender && typeof projects !== "undefined"){
        renderWorks(); renderMedia(); renderActivity();
        const activePage=document.querySelector(".page.active")?.id || "dashboard";
        updatePageTitle(activePage);
        if(document.getElementById("projectModal")?.classList.contains("open")){
          document.getElementById("modalTitle").textContent=editingId?uiText("editProject"):uiText("addProject");
        }
      }
    }

    function updatePageTitle(pageId){
      const keys={dashboard:"pageDashboard",works:"pageWorks",services:"pageServices",media:"pageMedia","website-settings":"pageWebsiteSettings",settings:"pageSettings"};
      const title=document.getElementById("pageTitle");
      if(!title) return;
      if(pageId === "analytics"){
        title.textContent = currentLang === "ar" ? "نشاط الويب سايت" : "Website Activity";
        return;
      }
      title.textContent=uiText(keys[pageId]||"pageDashboard");
    }

    captureStaticTranslations();
    applyLanguage(currentLang,false);
    document.querySelectorAll("[data-language-toggle]").forEach(btn=>{
      btn.addEventListener("click",()=>applyLanguage(currentLang === "ar" ? "en" : "ar",true));
    });


    const AUTH_KEY = "altariq_media_admin_auth_v1";
    const SESSION_KEY = "altariq_media_admin_logged_in_v1";

    async function hashPassword(value){
      if(window.crypto?.subtle){
        const bytes = new TextEncoder().encode(String(value));
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
      }
      return btoa(unescape(encodeURIComponent(String(value))));
    }

    async function getAuthData(){
      let stored = null;
      try{ stored = JSON.parse(localStorage.getItem(AUTH_KEY)); }catch(e){}
      if(stored?.username && stored?.passwordHash) return stored;
      const defaults = {username:"ص", passwordHash:await hashPassword("1")};
      localStorage.setItem(AUTH_KEY, JSON.stringify(defaults));
      return defaults;
    }

    async function showAdmin(){
      document.getElementById("authScreen").classList.add("hidden");
      document.getElementById("adminApp").hidden = false;
      const auth = await getAuthData();
      const usernameField = document.getElementById("newUsername");
      if(usernameField) usernameField.value = auth.username;
    }

    function showLogin(){
      sessionStorage.removeItem(SESSION_KEY);
      document.getElementById("adminApp").hidden = true;
      document.getElementById("authScreen").classList.remove("hidden");
      document.getElementById("loginForm").reset();
      document.getElementById("loginError").textContent = "";
      setTimeout(()=>document.getElementById("loginUsername").focus(),80);
    }

    async function initializeAuth(){
      await getAuthData();
      if(sessionStorage.getItem(SESSION_KEY)==="yes") await showAdmin();
      else showLogin();
    }

    document.getElementById("loginForm").addEventListener("submit", async e=>{
      e.preventDefault();
      const auth = await getAuthData();
      const username = document.getElementById("loginUsername").value.trim();
      const passwordHash = await hashPassword(document.getElementById("loginPassword").value);
      if(username === auth.username && passwordHash === auth.passwordHash){
        sessionStorage.setItem(SESSION_KEY,"yes");
        document.getElementById("loginError").textContent = "";
        await showAdmin();
      }else{
        document.getElementById("loginError").textContent = uiText("invalidLogin");
        document.getElementById("loginPassword").value = "";
        document.getElementById("loginPassword").focus();
      }
    });

    document.querySelectorAll("[data-toggle-password]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const input = document.getElementById(btn.dataset.togglePassword);
        input.type = input.type === "password" ? "text" : "password";
        btn.textContent = input.type === "password" ? "◉" : "◌";
      });
    });

    document.getElementById("logoutBtn").addEventListener("click",()=>{
      showLogin();
    });

    document.getElementById("credentialsForm").addEventListener("submit", async e=>{
      e.preventDefault();
      const auth = await getAuthData();
      const currentHash = await hashPassword(document.getElementById("currentPassword").value);
      const newUsername = document.getElementById("newUsername").value.trim();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if(currentHash !== auth.passwordHash){
        showToast(uiText("wrongCurrentPassword"));
        return;
      }
      if(!newUsername){
        showToast(uiText("usernameRequired"));
        return;
      }
      if(newPassword !== confirmPassword){
        showToast(uiText("passwordMismatch"));
        return;
      }

      localStorage.setItem(AUTH_KEY, JSON.stringify({
        username:newUsername,
        passwordHash:await hashPassword(newPassword)
      }));
      document.getElementById("credentialsForm").reset();
      addActivity("Admin login credentials updated");
      showToast(uiText("credentialsUpdated"));
      setTimeout(showLogin,900);
    });

    const STORAGE_KEY = "altariq_media_admin_projects_v1"; // legacy migration only
    const ACTIVITY_KEY = "altariq_media_admin_activity_v1";
    const WEBSITE_SETTINGS_KEY = "altariq_media_website_settings_v1";
    const DEFAULT_WEBSITE_SETTINGS = Object.freeze({
      siteName:"الطريق ميديا",
      defaultLanguage:"ar",
      tagline:"حلول إبداعية تصنع الأثر",
      siteUrl:"",
      heroTitle:"نصنع حضوراً رقمياً يليق بعلامتك",
      heroDescription:"نقدّم حلولاً متكاملة في إدارة السوشال ميديا، تصوير المنتجات، إنتاج الفيديو وتصميم المواقع.",
      copyright:"© 2026 الطريق ميديا. جميع الحقوق محفوظة.",
      whatsapp:"",
      email:"",
      address:"الأردن",
      facebook:"",
      instagram:"",
      tiktok:"",
      youtube:"",
      seoTitle:"الطريق ميديا | حلول تسويق وإنتاج إبداعي",
      seoDescription:"الطريق ميديا تقدم إدارة صفحات السوشال ميديا، تصوير المنتجات، المونتاج، الحملات الإعلانية وتصميم المواقع.",
      seoKeywords:"تصميم مواقع، تصوير منتجات، إدارة سوشال ميديا، مونتاج، حملات إعلانية",
      showServices:true,
      showWorks:true,
      showTestimonials:true,
      showContact:true,
      maintenanceMode:false,
      savedAt:""
    });

    function loadWebsiteSettings(){
      try{
        const stored = JSON.parse(localStorage.getItem(WEBSITE_SETTINGS_KEY) || "{}");
        return {...DEFAULT_WEBSITE_SETTINGS,...stored};
      }catch(error){
        console.warn("Website settings could not be read.",error);
        return {...DEFAULT_WEBSITE_SETTINGS};
      }
    }

    let websiteSettings = loadWebsiteSettings();

    function persistWebsiteSettings(){
      localStorage.setItem(WEBSITE_SETTINGS_KEY,JSON.stringify(websiteSettings));
      window.AL_TARIQ_WEBSITE_SETTINGS = {...websiteSettings};
      window.dispatchEvent(new CustomEvent("altariq:website-settings-updated",{detail:{...websiteSettings}}));
    }

    function setWebsiteToggle(button,value){
      const enabled = Boolean(value);
      button.classList.toggle("on",enabled);
      button.setAttribute("aria-pressed",String(enabled));
    }

    function fillWebsiteSettingsForm(){
      const values = {
        websiteName:websiteSettings.siteName,
        websiteLanguage:websiteSettings.defaultLanguage,
        websiteTagline:websiteSettings.tagline,
        websiteUrl:websiteSettings.siteUrl,
        websiteHeroTitle:websiteSettings.heroTitle,
        websiteHeroDescription:websiteSettings.heroDescription,
        websiteCopyright:websiteSettings.copyright,
        websiteWhatsapp:websiteSettings.whatsapp,
        websiteEmail:websiteSettings.email,
        websiteAddress:websiteSettings.address,
        websiteFacebook:websiteSettings.facebook,
        websiteInstagram:websiteSettings.instagram,
        websiteTikTok:websiteSettings.tiktok,
        websiteYouTube:websiteSettings.youtube,
        websiteSeoTitle:websiteSettings.seoTitle,
        websiteSeoDescription:websiteSettings.seoDescription,
        websiteSeoKeywords:websiteSettings.seoKeywords
      };
      Object.entries(values).forEach(([id,value])=>{
        const field=document.getElementById(id);
        if(field) field.value=value || "";
      });
      document.querySelectorAll(".website-toggle").forEach(button=>{
        setWebsiteToggle(button,websiteSettings[button.dataset.setting]);
      });
      const savedAt=document.getElementById("websiteSettingsSavedAt");
      if(savedAt){
        savedAt.textContent=websiteSettings.savedAt
          ? new Date(websiteSettings.savedAt).toLocaleString(currentLang === "ar" ? "ar-JO" : "en-US")
          : "—";
      }
      window.AL_TARIQ_WEBSITE_SETTINGS = {...websiteSettings};
    }

    function validOptionalHttpUrl(value){
      const clean=String(value || "").trim();
      if(!clean) return true;
      try{
        const url=new URL(clean);
        return url.protocol === "http:" || url.protocol === "https:";
      }catch(error){ return false; }
    }
    const PROJECT_DB_NAME = "altariq_media_admin_database_v2";
    const PROJECT_STORE_NAME = "projects";
    let projectDbPromise = null;

    function openProjectDatabase(){
      if(projectDbPromise) return projectDbPromise;
      projectDbPromise = new Promise((resolve,reject)=>{
        if(!("indexedDB" in window)){
          reject(new Error("IndexedDB is not supported in this browser."));
          return;
        }
        const request = indexedDB.open(PROJECT_DB_NAME,1);
        request.onupgradeneeded = event => {
          const db = event.target.result;
          if(!db.objectStoreNames.contains(PROJECT_STORE_NAME)){
            db.createObjectStore(PROJECT_STORE_NAME,{keyPath:"id"});
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Unable to open project database."));
        request.onblocked = () => reject(new Error("Project database is blocked by another tab."));
      });
      return projectDbPromise;
    }

    async function readProjectsFromDatabase(){
      const db = await openProjectDatabase();
      return new Promise((resolve,reject)=>{
        const transaction = db.transaction(PROJECT_STORE_NAME,"readonly");
        const request = transaction.objectStore(PROJECT_STORE_NAME).getAll();
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
        request.onerror = () => reject(request.error || new Error("Unable to read projects."));
      });
    }

    async function writeProjectsToDatabase(items){
      const db = await openProjectDatabase();
      return new Promise((resolve,reject)=>{
        const transaction = db.transaction(PROJECT_STORE_NAME,"readwrite");
        const store = transaction.objectStore(PROJECT_STORE_NAME);
        store.clear();
        items.forEach(item=>store.put(item));
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error || new Error("Unable to save projects."));
        transaction.onabort = () => reject(transaction.error || new Error("Project save was aborted."));
      });
    }

    function svgCover(title, accent, bg, secondary){
      const safeTitle = String(title).replace(/[<>&"]/g, "");
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="880" viewBox="0 0 1200 880">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop stop-color="${bg}"/><stop offset="1" stop-color="${secondary}"/>
          </linearGradient>
          <filter id="s"><feDropShadow dx="0" dy="24" stdDeviation="22" flood-opacity=".28"/></filter>
        </defs>
        <rect width="1200" height="880" rx="50" fill="url(#g)"/>
        <circle cx="1070" cy="70" r="240" fill="${accent}" opacity=".14"/>
        <circle cx="125" cy="800" r="260" fill="#fff" opacity=".06"/>
        <g filter="url(#s)">
          <rect x="90" y="100" width="430" height="620" rx="34" fill="#fff" opacity=".96"/>
          <rect x="135" y="150" width="340" height="220" rx="18" fill="${accent}" opacity=".12"/>
          <circle cx="305" cy="260" r="72" fill="${accent}"/>
          <path d="M270 260h70M305 225v70" stroke="#fff" stroke-width="18" stroke-linecap="round"/>
          <rect x="135" y="420" width="270" height="22" rx="11" fill="${bg}" opacity=".86"/>
          <rect x="135" y="465" width="190" height="13" rx="7" fill="${bg}" opacity=".28"/>
          <rect x="135" y="500" width="255" height="13" rx="7" fill="${bg}" opacity=".18"/>
          <g transform="translate(575 160)">
            <rect width="500" height="280" rx="28" fill="#fff" opacity=".94"/>
            <rect x="38" y="38" width="160" height="160" rx="24" fill="${accent}"/>
            <rect x="230" y="55" width="220" height="24" rx="12" fill="${bg}" opacity=".86"/>
            <rect x="230" y="105" width="160" height="15" rx="8" fill="${bg}" opacity=".24"/>
            <rect x="230" y="140" width="205" height="15" rx="8" fill="${bg}" opacity=".16"/>
            <circle cx="105" cy="230" r="16" fill="${accent}"/>
            <circle cx="150" cy="230" r="16" fill="${bg}"/>
            <circle cx="195" cy="230" r="16" fill="#ffc400"/>
          </g>
          <g transform="translate(620 500) rotate(-7)">
            <rect width="400" height="210" rx="24" fill="${accent}"/>
            <circle cx="75" cy="75" r="38" fill="#fff" opacity=".9"/>
            <rect x="135" y="52" width="205" height="20" rx="10" fill="#fff" opacity=".9"/>
            <rect x="135" y="92" width="145" height="12" rx="6" fill="#fff" opacity=".55"/>
            <text x="36" y="176" font-family="Arial" font-size="24" font-weight="700" fill="#fff">${safeTitle}</text>
          </g>
        </g>
        <text x="90" y="815" font-family="Arial" font-size="34" font-weight="800" fill="#fff">${safeTitle}</text>
        <text x="1110" y="812" text-anchor="end" font-family="Arial" font-size="18" fill="#fff" opacity=".7">AL‑TARIQ MEDIA / BRAND SYSTEM</text>
      </svg>`;
      return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    }

    const demoProjects = [
      {
        id: crypto.randomUUID(), name:"Nova Brand Identity", category:"Visual Identity",
        description:"نظام هوية بصرية متكامل يشمل الشعار، الألوان وتطبيقات العلامة.",
        client:"Nova Market", status:"Published",
        image:svgCover("NOVA IDENTITY","#ffc400","#071b3b","#0b4d96"), updated:new Date().toISOString()
      },
      {
        id: crypto.randomUUID(), name:"Diva Social Campaign", category:"Social Media",
        description:"حملة سوشال ميديا بمحتوى بصري موحد وقوالب إعلانية قابلة للتوسع.",
        client:"Diva", status:"Published",
        image:svgCover("DIVA CAMPAIGN","#ffca26","#11152f","#743b90"), updated:new Date().toISOString()
      },
      {
        id: crypto.randomUUID(), name:"Product Photography Set", category:"Photography",
        description:"تصوير منتجات بأسلوب تجاري نظيف مع إضاءة وظلال مناسبة للمتاجر الإلكترونية.",
        client:"Al Neema Store", status:"Published",
        image:svgCover("PRODUCT SHOTS","#ffc400","#08214b","#154d78"), updated:new Date().toISOString()
      },
      {
        id: crypto.randomUUID(), name:"Launch Video Package", category:"Video Production",
        description:"حزمة فيديوهات إطلاق تشمل المونتاج، التلوين والحركة البصرية.",
        client:"Launch Lab", status:"Draft",
        image:svgCover("VIDEO LAUNCH","#f9bd00","#071325","#8a3d22"), updated:new Date().toISOString()
      },
      {
        id: crypto.randomUUID(), name:"Corporate Website UI", category:"Web Design",
        description:"تصميم واجهة موقع شركة حديثة، سريعة ومتجاوبة مع جميع الشاشات.",
        client:"Solo Coatings", status:"Published",
        image:svgCover("WEB EXPERIENCE","#ffc400","#041e3f","#0a67aa"), updated:new Date().toISOString()
      },
      {
        id: crypto.randomUUID(), name:"Orbit Visual System", category:"Visual Identity",
        description:"هوية عصرية مرنة مع دليل استخدام وتطبيقات رقمية ومطبوعات.",
        client:"Orbit", status:"Published",
        image:svgCover("ORBIT SYSTEM","#ffd33d","#081c35","#184a62"), updated:new Date().toISOString()
      }
    ];

    let projects = [];
    let editingId = null;
    let activities = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");

    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];

    async function loadProjects(){
      try{
        const stored = await readProjectsFromDatabase();
        if(stored.length) return stored;

        // Migrate projects saved by the older localStorage version.
        let legacy = [];
        try{
          const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
          if(Array.isArray(parsed) && parsed.length) legacy = parsed;
        }catch(error){
          console.warn("Legacy project data could not be read.",error);
        }

        const initialProjects = legacy.length
          ? legacy
          : demoProjects.map(project=>({...project}));

        await writeProjectsToDatabase(initialProjects);
        localStorage.removeItem(STORAGE_KEY);
        return initialProjects;
      }catch(error){
        console.error("Project loading failed:",error);
        showToast(uiText("loadFailed"));
        return demoProjects.map(project=>({...project}));
      }
    }

    async function saveProjects(){
      try{
        await writeProjectsToDatabase(projects);
        updateStats();
        renderWorks();
        renderMedia();
        return true;
      }catch(error){
        console.error("Project saving failed:",error);
        showToast(uiText("saveFailed"));
        return false;
      }
    }

    function addActivity(text){
      activities.unshift({text, time:new Date().toISOString()});
      activities = activities.slice(0,6);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
      renderActivity();
    }

    function relativeTime(iso){
      const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime())/60000));
      if(mins < 1) return uiText("now");
      if(mins < 60) return `${mins}${uiText("minute")}`;
      const hours = Math.floor(mins/60);
      if(hours < 24) return `${hours}${uiText("hour")}`;
      return `${Math.floor(hours/24)}${uiText("day")}`;
    }

    function renderActivity(){
      const list = $("#activityList");
      const source = activities.length ? activities : [
        {text:"Portfolio system initialized",time:new Date().toISOString()},
        {text:"Brand colors applied successfully",time:new Date(Date.now()-3600000).toISOString()},
        {text:"Editable works library is ready",time:new Date(Date.now()-7200000).toISOString()}
      ];
      list.innerHTML = source.map(item => `
        <div class="activity-item">
          <div class="activity-dot">✦</div>
          <div><strong>${escapeHtml(translateActivityText(item.text))}</strong><small>${uiText("activityAdmin")}</small></div>
          <span class="activity-time">${relativeTime(item.time)}</span>
        </div>`).join("");
    }

    function escapeHtml(value=""){
      return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
    }

    function normalizeGoogleDriveUrl(value=""){
      const raw = String(value).trim();
      if(!raw) return "";
      try{
        const url = new URL(raw);
        const host = url.hostname.toLowerCase();
        const allowedHost = host === "drive.google.com" || host === "docs.google.com";
        if(url.protocol !== "https:" || !allowedHost) return null;
        return url.href;
      }catch(e){
        return null;
      }
    }

    function filteredProjects(){
      const query = $("#searchInput")?.value.trim().toLowerCase() || "";
      const category = $("#categoryFilter")?.value || "all";
      return projects.filter(p => {
        const matchesText = [p.name,p.category,p.description,p.client].join(" ").toLowerCase().includes(query);
        const matchesCategory = category === "all" || p.category === category;
        return matchesText && matchesCategory;
      });
    }

    function projectCard(p, mediaOnly=false){
      return `
      <article class="work-card glass" data-id="${p.id}" tabindex="0" role="button" aria-label="${currentLang === "ar" ? "تعديل" : "Edit"} ${escapeHtml(p.name)}">
        <div class="work-image">
          <img src="${p.image}" alt="${escapeHtml(p.name)}">
          <span class="edit-chip">✎ ${uiText("clickEdit")}</span>
          <span class="status-chip">${escapeHtml(translatedStatus(p.status))}</span>
        </div>
        ${mediaOnly ? "" : `
        <div class="work-body">
          <div class="work-meta"><span class="category">${escapeHtml(translatedCategory(p.category))}</span><span class="work-id">#${p.id.slice(0,6).toUpperCase()}</span></div>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description ? translatedDemoDescription(p.description) : uiText("noDescription"))}</p>
          ${p.driveLink ? `
            <div class="project-links">
              <a
                class="drive-btn"
                href="${escapeHtml(p.driveLink)}"
                target="_blank"
                rel="noopener noreferrer"
                data-project-link
                aria-label="${currentLang === "ar" ? "فتح رابط Google Drive للمشروع" : "Open Google Drive link for"} ${escapeHtml(p.name)}"
              >☁ ${uiText("openDrive")}</a>
            </div>` : ""}
        </div>`}
      </article>`;
    }

    function bindCards(container){
      container.querySelectorAll(".work-card").forEach(card => {
        const open = () => openModal(card.dataset.id);
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => { if(e.key==="Enter" || e.key===" ") open(); });
        card.querySelectorAll("[data-project-link]").forEach(link=>{
          link.addEventListener("click",e=>e.stopPropagation());
          link.addEventListener("keydown",e=>e.stopPropagation());
        });
      });
    }

    function renderWorks(){
      const grid = $("#worksGrid");
      const list = filteredProjects();
      grid.innerHTML = list.length ? list.map(p => projectCard(p)).join("") : `<div class="empty glass">${uiText("noProjects")}</div>`;
      bindCards(grid);
    }

    function renderMedia(){
      const grid = $("#mediaGrid");
      grid.innerHTML = projects.length ? projects.map(p => projectCard(p,true)).join("") : `<div class="empty glass">${uiText("mediaEmpty")}</div>`;
      bindCards(grid);
    }

    function updateStats(){
      $("#statProjects").textContent = String(projects.length).padStart(2,"0");
      $("#statPublished").textContent = String(projects.filter(p=>p.status==="Published").length).padStart(2,"0");
    }

    function openModal(id=null){
      editingId = id;
      const isNew = !id;
      const p = isNew ? {
        id:"", name:"", category:"Visual Identity", description:"",
        client:"", status:"Published", driveLink:"",
        image:svgCover("NEW PROJECT","#ffc400","#071b3b","#0b4d96")
      } : projects.find(x=>x.id===id);
      if(!p) return;

      $("#modalTitle").textContent = isNew ? uiText("addProject") : uiText("editProject");
      $("#projectId").value = p.id || "";
      $("#projectName").value = p.name || "";
      $("#projectCategory").value = p.category || "Visual Identity";
      $("#projectDescription").value = p.description || "";
      $("#projectDriveLink").value = p.driveLink || "";
      $("#projectStatus").value = p.status || "Published";
      $("#projectClient").value = p.client || "";
      $("#projectImageData").value = p.image || "";
      $("#imagePreview").src = p.image || "";
      $("#deleteProject").style.visibility = isNew ? "hidden" : "visible";
      $("#projectModal").classList.add("open");
      $("#projectModal").setAttribute("aria-hidden","false");
      setTimeout(()=>$("#projectName").focus(),80);
    }

    function closeModal(){
      $("#projectModal").classList.remove("open");
      $("#projectModal").setAttribute("aria-hidden","true");
      $("#projectForm").reset();
      $("#projectImage").value = "";
      editingId = null;
    }

    function showToast(message){
      const toast = $("#toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(()=>toast.classList.remove("show"),2200);
    }

    function goToPage(pageId){
      $$(".page").forEach(p=>p.classList.toggle("active",p.id===pageId));
      $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===pageId));
      updatePageTitle(pageId);

      // زر إضافة مشروع يظهر فقط داخل صفحة عرض أعمالنا
      const quickAddButton = $("#quickAdd");
      if(quickAddButton){
        quickAddButton.style.display = pageId === "works" ? "inline-flex" : "none";
      }

      // زر إضافة خدمة يظهر فقط داخل صفحة الخدمات
      const quickAddServiceButton = $("#quickAddService");
      if(quickAddServiceButton){
        quickAddServiceButton.style.display = pageId === "services" ? "inline-flex" : "none";
      }

      $("#sidebar").classList.remove("open");
      window.scrollTo({top:0,behavior:"smooth"});
    }

    $$(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>goToPage(btn.dataset.page)));
    $$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>goToPage(btn.dataset.go)));
    $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $("#quickAdd").addEventListener("click",()=>{
      const worksPage = $("#works");
      if(worksPage && worksPage.classList.contains("active")) openModal();
    });

    $("#quickAddService").addEventListener("click",()=>{
      const servicesPage = $("#services");
      if(!servicesPage || !servicesPage.classList.contains("active")) return;

      const directButton =
        document.querySelector("#addService") ||
        document.querySelector("#addServiceBtn") ||
        document.querySelector("#serviceAddButton") ||
        document.querySelector("[data-add-service]") ||
        document.querySelector(".add-service-btn");

      if(directButton && directButton !== $("#quickAddService")){
        directButton.click();
        return;
      }

      const serviceButtons = [...servicesPage.querySelectorAll("button")];
      const labelButton = serviceButtons.find(btn=>{
        if(btn === $("#quickAddService")) return false;
        const label = (btn.textContent || "").trim().toLowerCase();
        return (
          label.includes("إضافة خدمة") ||
          label.includes("اضافة خدمة") ||
          label.includes("add service") ||
          label.includes("new service")
        );
      });

      if(labelButton){
        labelButton.click();
        return;
      }

      // Compatibility bridge for admin-service-sync.js
      window.dispatchEvent(new CustomEvent("altariq:add-service-requested"));
    });

    $("#addProject").addEventListener("click",()=>openModal());
    $("#closeModal").addEventListener("click",closeModal);
    $("#cancelModal").addEventListener("click",closeModal);
    $("#projectModal").addEventListener("click",e=>{ if(e.target.id==="projectModal") closeModal(); });
    document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeModal(); });

    $("#searchInput").addEventListener("input",renderWorks);
    $("#categoryFilter").addEventListener("change",renderWorks);

    $("#projectImage").addEventListener("change",e=>{
      const file = e.target.files[0];
      if(!file) return;

      const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

      if(!file.type.startsWith("image/")){
        e.target.value = "";
        return showToast(uiText("chooseImage"));
      }

      if(file.size > MAX_IMAGE_SIZE){
        e.target.value = "";
        return showToast(uiText("imageLarge"));
      }

      const reader = new FileReader();
      reader.onload = ev => {
        $("#imagePreview").src = ev.target.result;
        $("#projectImageData").value = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    $("#projectForm").addEventListener("submit",async e=>{
      e.preventDefault();
      const rawDriveLink = $("#projectDriveLink").value;
      const driveLink = normalizeGoogleDriveUrl(rawDriveLink);
      if(rawDriveLink.trim() && driveLink === null){
        return showToast(uiText("invalidDrive"));
      }
      const data = {
        id: editingId || crypto.randomUUID(),
        name: $("#projectName").value.trim(),
        category: $("#projectCategory").value,
        description: $("#projectDescription").value.trim(),
        driveLink: driveLink || "",
        client: $("#projectClient").value.trim(),
        status: $("#projectStatus").value,
        image: $("#projectImageData").value,
        updated:new Date().toISOString()
      };
      if(!data.name) return showToast(uiText("projectNameRequired"));
      if(editingId){
        projects = projects.map(p=>p.id===editingId ? data : p);
        addActivity(`Updated project: ${data.name}`);
      }else{
        projects.unshift(data);
        addActivity(`Added new project: ${data.name}`);
      }
      const saved = await saveProjects();
      if(!saved) return;
      closeModal();
      showToast(uiText("projectSaved"));
      goToPage("works");
    });

    $("#deleteProject").addEventListener("click",async ()=>{
      if(!editingId) return;
      const p = projects.find(x=>x.id===editingId);
      if(!confirm(`${uiText("deleteConfirm")}\n${p?.name || ""}`)) return;
      projects = projects.filter(p=>p.id!==editingId);
      addActivity(`Deleted project: ${p?.name || ""}`);
      const saved = await saveProjects();
      if(!saved) return;
      closeModal();
      showToast(uiText("projectDeleted"));
    });

    $("#resetDemo").addEventListener("click",async ()=>{
      if(!confirm(uiText("resetConfirm"))) return;
      projects = demoProjects.map(p=>({...p,id:crypto.randomUUID(),updated:new Date().toISOString()}));
      const saved = await saveProjects();
      if(!saved) return;
      addActivity("Demo portfolio restored");
      showToast(uiText("demoRestored"));
    });

    function exportData(){
      const payload = {company:"Al-Tariq Media",exportedAt:new Date().toISOString(),projects,websiteSettings};
      const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href=url;a.download="al-tariq-media-projects.json";a.click();
      URL.revokeObjectURL(url);
      showToast(uiText("backupExported"));
    }
    $("#exportBtn")?.addEventListener("click",exportData);
    $("#settingsExport").addEventListener("click",exportData);

    $("#importInput").addEventListener("change",e=>{
      const file=e.target.files[0]; if(!file) return;
      const reader=new FileReader();
      reader.onload=async ev=>{
        try{
          const parsed=JSON.parse(ev.target.result);
          const list=Array.isArray(parsed)?parsed:parsed.projects;
          if(!Array.isArray(list)) throw new Error();
          projects=list;
          if(parsed && !Array.isArray(parsed) && parsed.websiteSettings && typeof parsed.websiteSettings === "object"){
            websiteSettings={...DEFAULT_WEBSITE_SETTINGS,...parsed.websiteSettings};
            persistWebsiteSettings();
            fillWebsiteSettingsForm();
          }
          const saved = await saveProjects();
          if(!saved) return;
          addActivity("Imported project backup");
          showToast(uiText("imported"));
        }catch(err){showToast(uiText("invalidBackup"));}
      };
      reader.readAsText(file);
      e.target.value="";
    });

    document.querySelectorAll(".website-toggle").forEach(button=>{
      button.addEventListener("click",()=>{
        setWebsiteToggle(button,!button.classList.contains("on"));
      });
    });

    $("#websiteSettingsForm").addEventListener("submit",e=>{
      e.preventDefault();
      const urlValues=[
        $("#websiteUrl").value,
        $("#websiteFacebook").value,
        $("#websiteInstagram").value,
        $("#websiteTikTok").value,
        $("#websiteYouTube").value
      ];
      if(urlValues.some(value=>!validOptionalHttpUrl(value))){
        return showToast(uiText("invalidWebsiteUrl"));
      }
      const toggleValue=name=>document.querySelector(`.website-toggle[data-setting="${name}"]`)?.classList.contains("on") || false;
      websiteSettings={
        siteName:$("#websiteName").value.trim(),
        defaultLanguage:$("#websiteLanguage").value === "en" ? "en" : "ar",
        tagline:$("#websiteTagline").value.trim(),
        siteUrl:$("#websiteUrl").value.trim(),
        heroTitle:$("#websiteHeroTitle").value.trim(),
        heroDescription:$("#websiteHeroDescription").value.trim(),
        copyright:$("#websiteCopyright").value.trim(),
        whatsapp:$("#websiteWhatsapp").value.replace(/[^0-9+]/g,"").trim(),
        email:$("#websiteEmail").value.trim(),
        address:$("#websiteAddress").value.trim(),
        facebook:$("#websiteFacebook").value.trim(),
        instagram:$("#websiteInstagram").value.trim(),
        tiktok:$("#websiteTikTok").value.trim(),
        youtube:$("#websiteYouTube").value.trim(),
        seoTitle:$("#websiteSeoTitle").value.trim(),
        seoDescription:$("#websiteSeoDescription").value.trim(),
        seoKeywords:$("#websiteSeoKeywords").value.trim(),
        showServices:toggleValue("showServices"),
        showWorks:toggleValue("showWorks"),
        showTestimonials:toggleValue("showTestimonials"),
        showContact:toggleValue("showContact"),
        maintenanceMode:toggleValue("maintenanceMode"),
        savedAt:new Date().toISOString()
      };
      persistWebsiteSettings();
      fillWebsiteSettingsForm();
      addActivity("Website settings updated");
      showToast(uiText("websiteSettingsSaved"));
    });

    $("#resetWebsiteSettings").addEventListener("click",()=>{
      if(!confirm(uiText("websiteSettingsResetConfirm"))) return;
      websiteSettings={...DEFAULT_WEBSITE_SETTINGS,savedAt:new Date().toISOString()};
      persistWebsiteSettings();
      fillWebsiteSettingsForm();
      addActivity("Website settings updated");
      showToast(uiText("websiteSettingsReset"));
    });

    $("#exportWebsiteSettings").addEventListener("click",()=>{
      const payload={company:"Al-Tariq Media",exportedAt:new Date().toISOString(),websiteSettings};
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download="al-tariq-media-website-settings.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast(uiText("websiteSettingsExported"));
    });

    $("#openWebsitePreview").addEventListener("click",()=>{
      const url=$("#websiteUrl").value.trim() || websiteSettings.siteUrl;
      if(!url) return showToast(uiText("websiteUrlMissing"));
      if(!validOptionalHttpUrl(url)) return showToast(uiText("invalidWebsiteUrl"));
      window.open(url,"_blank","noopener,noreferrer");
    });

    $("#themeGlow").addEventListener("click",()=>{
      document.body.classList.toggle("no-glow");
      const noGlow=document.body.classList.contains("no-glow");
      document.body.style.background=noGlow ? "#061126" : "";
      showToast(noGlow ? uiText("glowReduced") : uiText("glowEnabled"));
    });

    $("#shineSwitch").addEventListener("click",e=>{
      e.currentTarget.classList.toggle("on");
      document.querySelectorAll(".glass").forEach(el=>{
        el.style.backdropFilter=e.currentTarget.classList.contains("on") ? "" : "none";
      });
    });

    $("#compactSwitch").addEventListener("click",e=>{
      e.currentTarget.classList.toggle("on");
      $("#worksGrid").style.gap=e.currentTarget.classList.contains("on") ? "10px" : "";
      $("#mediaGrid").style.gap=e.currentTarget.classList.contains("on") ? "10px" : "";
    });

    async function initializePortfolio(){
      projects = await loadProjects();
      renderWorks();
      renderMedia();
      renderActivity();
      updateStats();
      fillWebsiteSettingsForm();
    }

    applyLanguage(currentLang,true);
    initializeAuth();
    initializePortfolio();
