
        import { initializeApp } from
            "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

        import {
            getFirestore,
            collection,
            onSnapshot,
            addDoc,
            serverTimestamp
        } from
            "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAyUMzv-Zw_XtNe4OKJPg2FrwyLSJh5i9A",
            authDomain: "al-tariq-media.firebaseapp.com",
            projectId: "al-tariq-media",
            storageBucket: "al-tariq-media.firebasestorage.app",
            messagingSenderId: "616239800441",
            appId: "1:616239800441:web:53edc96e1cc872702cb4a8",
            measurementId: "G-42KJKNDJDF"
        };

        const firebaseApp = initializeApp(firebaseConfig);
        const firestoreDatabase = getFirestore(firebaseApp);
        const productsContainer =
            document.getElementById("firebaseProductsContainer");
        const portfolioProjectsContainer = null;
        const portfolioFileButton =
            document.querySelector(".portfolio-pdf-button");
        const portfolioFileImage =
            document.querySelector(".portfolio-pdf-icon img");
        const portfolioFileTitle =
            document.querySelector(".portfolio-pdf-box h2");
        const portfolioFileDescription =
            document.querySelector(".portfolio-pdf-box p");

        function createId() {
            if (window.crypto && typeof window.crypto.randomUUID === "function") {
                return window.crypto.randomUUID();
            }
            return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
        }

        function getPersistentId(storage, key) {
            try {
                let value = storage.getItem(key);
                if (!value) {
                    value = createId();
                    storage.setItem(key, value);
                }
                return value;
            } catch {
                return createId();
            }
        }

        const visitorId = getPersistentId(localStorage, "altariq_visitor_id_v1");
        const sessionId = getPersistentId(sessionStorage, "altariq_session_id_v1");

        function currentPageId() {
            return document.querySelector(".page.active")?.id || "home";
        }

        function deviceLabel() {
            const width = window.innerWidth || screen.width || 0;
            if (width <= 760) return "mobile";
            if (width <= 1100) return "tablet";
            return "desktop";
        }

        async function trackSiteEvent(eventType, extraData = {}) {
            const allowedTypes = ["page_view", "whatsapp_click", "product_view", "custom_click"];
            if (!allowedTypes.includes(eventType)) return;

            const cleanExtra = {
                page: String(extraData.page || currentPageId()).slice(0, 60),
                action: String(extraData.action || "").slice(0, 160),
                product_id: String(extraData.product_id || "").slice(0, 120),
                product_name: String(extraData.product_name || "").slice(0, 160)
            };

            try {
                await addDoc(collection(firestoreDatabase, "site_events"), {
                    event_type: eventType,
                    visitor_id: visitorId,
                    session_id: sessionId,
                    page: cleanExtra.page,
                    path: String(location.pathname || "/").slice(0, 300),
                    action: cleanExtra.action,
                    product_id: cleanExtra.product_id,
                    product_name: cleanExtra.product_name,
                    referrer: String(document.referrer || "direct").slice(0, 500),
                    device: deviceLabel(),
                    client_created_at: new Date().toISOString(),
                    created_at: serverTimestamp()
                });
            } catch (error) {
                console.warn("Visitor analytics write failed:", error?.code || error);
            }
        }

        window.trackSiteEvent = trackSiteEvent;

        /* تسجيل أول مشاهدة عند فتح الموقع */
        trackSiteEvent("page_view", { page: currentPageId(), action: "initial_load" });

        /* تسجيل الانتقال بين صفحات الموقع الداخلية */
        if (typeof window.showPage === "function") {
            const originalShowPage = window.showPage;
            window.showPage = function (pageId) {
                originalShowPage(pageId);
                trackSiteEvent("page_view", { page: pageId, action: "internal_navigation" });
            };
        }

        /* تسجيل الضغطات المهمة */
        document.addEventListener("click", function (event) {
            const whatsappLink = event.target.closest(".whatsapp-button");
            if (whatsappLink) {
                trackSiteEvent("whatsapp_click", {
                    page: currentPageId(),
                    action: "floating_whatsapp"
                });
                return;
            }

            const trackedControl = event.target.closest(
                ".button, .header-button, .portfolio-cta-banner, .home-ad-banner"
            );

            if (trackedControl && !trackedControl.closest(".firebase-product-card")) {
                trackSiteEvent("custom_click", {
                    page: currentPageId(),
                    action: (trackedControl.textContent || trackedControl.getAttribute("aria-label") || "button_click")
                        .trim()
                        .slice(0, 160)
                });
            }
        });

        function createProductCard(product) {
            const card = document.createElement("article");
            card.className = "firebase-product-card";
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", "مشاهدة " + (product.name || "العمل"));

            const imageBox = document.createElement("div");
            imageBox.className = "firebase-product-image";

            const image = document.createElement("img");
            image.src = String(product.image_data || product.image || "").trim();
            image.alt = product.name
                ? "صورة " + product.name
                : "صورة أحد أعمال الطريق ميديا";
            image.loading = "lazy";

            const placeholder = document.createElement("div");
            placeholder.className = "firebase-product-placeholder";
            placeholder.textContent = "✦";
            placeholder.setAttribute("aria-hidden", "true");

            if (!String(product.image_data || product.image || "").trim()) {
                image.style.display = "none";
                placeholder.style.display = "grid";
            }

            image.addEventListener("error", function () {
                image.style.display = "none";
                placeholder.style.display = "grid";
            });

            imageBox.appendChild(image);
            imageBox.appendChild(placeholder);

            const content = document.createElement("div");
            content.className = "firebase-product-content";

            const title = document.createElement("h3");
            title.textContent = product.name || "عمل جديد";

            const description = document.createElement("p");
            description.textContent =
                product.description || "تفاصيل هذا العمل ستُضاف قريباً.";

            content.appendChild(title);
            content.appendChild(description);

            card.appendChild(imageBox);
            card.appendChild(content);

            let viewed = false;
            function registerProductView() {
                if (viewed) return;
                viewed = true;
                trackSiteEvent("product_view", {
                    page: "portfolio",
                    product_id: product.id,
                    product_name: product.name || "عمل جديد",
                    action: "firebase_product_card"
                });
                setTimeout(() => { viewed = false; }, 1500);
            }

            card.addEventListener("click", registerProductView);
            card.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    registerProductView();
                }
            });

            return card;
        }

        function productDriveUrl(product) {
            return String(product.drive_url || product.drive_link || product.link || product.url || "").trim();
        }

        function createPortfolioCard(product) {
            const driveUrl = productDriveUrl(product);
            const card = document.createElement(driveUrl ? "a" : "article");
            card.className = "project-card";
            if (driveUrl) {
                card.href = driveUrl;
                card.target = "_blank";
                card.rel = "noopener noreferrer";
                card.style.display = "block";
                card.style.color = "inherit";
                card.style.textDecoration = "none";
            }

            const imageBox = document.createElement("div");
            imageBox.className = "project-image";
            const imageUrl = String(product.image_data || product.image || "").trim();
            if (imageUrl) {
                const image = document.createElement("img");
                image.src = imageUrl;
                image.alt = product.title || product.name || "أحد أعمال الطريق ميديا";
                image.loading = "lazy";
                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "contain";
                image.style.backgroundColor = "#ffffff";
                imageBox.appendChild(image);
            } else {
                const placeholder = document.createElement("div");
                placeholder.className = "project-placeholder";
                placeholder.textContent = "✦";
                imageBox.appendChild(placeholder);
            }

            const category = document.createElement("span");
            category.className = "project-category";
            category.textContent = product.category || "أعمالنا";
            imageBox.appendChild(category);

            const content = document.createElement("div");
            content.className = "project-content";
            const title = document.createElement("h3");
            title.textContent = product.title || product.name || "عمل جديد";
            const description = document.createElement("p");
            description.textContent = product.description || "تفاصيل هذا العمل ستُضاف قريباً.";
            content.appendChild(title);
            content.appendChild(description);
            card.appendChild(imageBox);
            card.appendChild(content);

            card.addEventListener("click", function () {
                trackSiteEvent("product_view", {
                    page:"portfolio",
                    product_id:product.id,
                    product_name:product.title || product.name || "عمل جديد",
                    action:"portfolio_project_card"
                });
            });
            return card;
        }

        function updatePortfolioFileBox(product) {
            if (!product) return;
            const driveUrl = productDriveUrl(product);
            if (portfolioFileButton && driveUrl) portfolioFileButton.href = driveUrl;
            if (portfolioFileImage && String(product.image_data || product.image || "").trim()) {
                portfolioFileImage.src = String(product.image_data || product.image).trim();
            }
            if (portfolioFileTitle) portfolioFileTitle.textContent = product.title || product.name || "شاهد معرض أعمالنا الكامل";
            if (portfolioFileDescription) portfolioFileDescription.textContent = product.description || "تصفّح ملف معرض أعمال الطريق ميديا.";
        }

        function renderProducts(snapshot) {
            if (!productsContainer) return;

            const products = snapshot.docs.map(function (documentSnapshot) {
                const data = documentSnapshot.data();
                const createdValue = data.created_at || data.createdAt;

                return {
                    id: documentSnapshot.id,
                    ...data,
                    sortTime:
                        createdValue && typeof createdValue.seconds === "number"
                            ? createdValue.seconds
                            : 0
                };
            }).filter(function (product) { return product.visible !== false; });

            products.sort(function (firstProduct, secondProduct) {
                const firstOrder = Number(firstProduct.order);
                const secondOrder = Number(secondProduct.order);
                if (Number.isFinite(firstOrder) || Number.isFinite(secondOrder)) {
                    return (Number.isFinite(firstOrder) ? firstOrder : 999) - (Number.isFinite(secondOrder) ? secondOrder : 999);
                }
                return secondProduct.sortTime - firstProduct.sortTime;
            });

            const portfolioFile = products.find(function (product) {
                return product.id === "website-full-portfolio" || product.display_area === "portfolio_file";
            });
            const portfolioGridItems = products.filter(function (product) {
                return product !== portfolioFile;
            });
            updatePortfolioFileBox(portfolioFile);
            if (portfolioProjectsContainer && portfolioGridItems.length) {
                portfolioProjectsContainer.replaceChildren();
                portfolioGridItems.forEach(function (product) {
                    portfolioProjectsContainer.appendChild(createPortfolioCard(product));
                });
            }

            productsContainer.replaceChildren();

            if (products.length === 0) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "firebase-products-message";
                emptyMessage.textContent = "لا توجد أعمال مضافة حالياً.";
                productsContainer.appendChild(emptyMessage);
                return;
            }

            products.forEach(function (product) {
                productsContainer.appendChild(createProductCard(product));
            });
        }

        function showFirebaseError(error) {
            console.error("Firestore connection error:", error);
            if (!productsContainer) return;

            const errorMessage = document.createElement("div");
            errorMessage.className = "firebase-products-message error";
            errorMessage.textContent =
                "تعذر تحميل الأعمال حالياً. تأكد من نشر قواعد Firestore.";
            productsContainer.replaceChildren(errorMessage);
        }

        onSnapshot(
            collection(firestoreDatabase, "products"),
            renderProducts,
            showFirebaseError
        );
    
