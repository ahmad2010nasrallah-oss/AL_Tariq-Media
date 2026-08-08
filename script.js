
        function showPage(pageId) {
            const pages = document.querySelectorAll(".page");
            const navigationButtons = document.querySelectorAll(".nav-button");

            pages.forEach(function (page) {
                page.classList.remove("active");
            });

            navigationButtons.forEach(function (button) {
                button.classList.remove("active");
            });

            const selectedPage = document.getElementById(pageId);

            if (selectedPage) {
                selectedPage.classList.add("active");
            }

            const selectedButton = document.querySelector(
                '.nav-button[data-page="' + pageId + '"]'
            );

            if (selectedButton) {
                selectedButton.classList.add("active");
            }

            document.getElementById("mainMenu").classList.remove("open");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        function toggleMenu() {
            document.getElementById("mainMenu").classList.toggle("open");
        }

        const contactForm = document.getElementById("contactForm");
        const whatsappSubmitButton = document.getElementById("whatsappSubmitButton");
        let whatsappIsSending = false;

        async function sendToWhatsApp(event) {
            event.preventDefault();

            /* يمنع تنفيذ الإرسال مرتين عند الضغط المتكرر */
            if (whatsappIsSending) {
                return;
            }

            whatsappIsSending = true;

            if (whatsappSubmitButton) {
                whatsappSubmitButton.disabled = true;
            }

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const service = document.getElementById("service").value;
            const message = document.getElementById("message").value.trim();

            /* عدّل رقم واتساب الشركة من هنا، اكتبه بدون + وبدون مسافات */
            const whatsappNumber = "962779947243";

            const whatsappMessage =
                "مرحباً، أرغب بالاستفسار عن خدمات الطريق ميديا." +
                "\n\n" +
                "الاسم: " + name +
                "\n" +
                "رقم الهاتف: " + phone +
                "\n" +
                "الخدمة المطلوبة: " + service +
                "\n" +
                "تفاصيل الطلب: " + message;

            const whatsappLink =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(whatsappMessage);

            /* تسجيل الضغط قبل فتح واتساب، مع مهلة قصيرة حتى لا يتأخر المستخدم */
            if (typeof window.trackSiteEvent === "function") {
                try {
                    await Promise.race([
                        window.trackSiteEvent("whatsapp_click", {
                            page: "contact",
                            action: "contact_form"
                        }),
                        new Promise(function (resolve) { setTimeout(resolve, 700); })
                    ]);
                } catch (error) {
                    console.warn("WhatsApp tracking failed:", error);
                }
            }

            /* فتح رابط واحد فقط */
            window.location.href = whatsappLink;

            /* إعادة تفعيل الزر إذا عاد المستخدم إلى الصفحة */
            setTimeout(function () {
                whatsappIsSending = false;

                if (whatsappSubmitButton) {
                    whatsappSubmitButton.disabled = false;
                }
            }, 2000);
        }

        /* ربط النموذج مرة واحدة فقط بدون onsubmit أو onclick داخل HTML */
        if (contactForm) {
            contactForm.addEventListener("submit", sendToWhatsApp);
        }

        /* إظهار الإعلان المتحرك عند الوصول إليه */
        const homeAdBanner = document.getElementById("homeAdBanner");
        if (homeAdBanner) {
            if ("IntersectionObserver" in window) {
                const adObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
                    });
                }, { threshold: 0.25 });
                adObserver.observe(homeAdBanner);
            } else { homeAdBanner.classList.add("is-visible"); }
        }

        document.getElementById("currentYear").textContent =
            new Date().getFullYear();
    


        (function () {
            "use strict";

            const body = document.body;
            const preloader = document.getElementById("sitePreloader");
            const header = document.querySelector("header");
            const progress = document.getElementById("scrollProgress");
            const dot = document.getElementById("cursorDot");
            const ring = document.getElementById("cursorRing");

            /* المثلث الداخلي ثابت، والمثلث الخارجي الأصفر وحده يُرسم تدريجياً */
            const preloaderAnimationStartedAt = performance.now();
            window.requestAnimationFrame(function () {
                preloader?.classList.add("is-animating");
            });

            window.addEventListener("load", function () {
                const elapsed = performance.now() - preloaderAnimationStartedAt;
                const remainingAnimationTime = Math.max(320, 2820 - elapsed);

                window.setTimeout(function () {
                    preloader?.classList.add("is-hidden");
                }, remainingAnimationTime);
            });

            /* شريط تقدم التصفح + حالة الهيدر */
            function updateScrollUI() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
                if (progress) progress.style.width = Math.min(100, percentage) + "%";
                header?.classList.toggle("is-scrolled", scrollTop > 24);
            }
            updateScrollUI();
            window.addEventListener("scroll", updateScrollUI, { passive: true });

            /* مؤشر فأرة دائري مخصص — يعمل على أجهزة الفأرة فقط */
            if (window.matchMedia("(pointer: fine)").matches && dot && ring) {
                let mouseX = -100;
                let mouseY = -100;
                let ringX = -100;
                let ringY = -100;

                document.addEventListener("mousemove", function (event) {
                    mouseX = event.clientX;
                    mouseY = event.clientY;
                    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
                    body.classList.add("cursor-ready");
                });

                function animateRing() {
                    ringX += (mouseX - ringX) * .16;
                    ringY += (mouseY - ringY) * .16;
                    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
                    requestAnimationFrame(animateRing);
                }
                animateRing();

                document.addEventListener("mouseover", function (event) {
                    if (event.target.closest("a, button, input, textarea, select, [role='button'], .project-card, .service-card")) {
                        ring.classList.add("is-active");
                    }
                });

                document.addEventListener("mouseout", function (event) {
                    if (event.target.closest("a, button, input, textarea, select, [role='button'], .project-card, .service-card")) {
                        ring.classList.remove("is-active");
                    }
                });

                document.addEventListener("mouseleave", function () {
                    body.classList.remove("cursor-ready");
                });
            }

            /* ظهور العناصر عند التمرير */
            const revealSelector = [
                ".section-header", ".service-card", ".process-card", ".testimonial-card",
                ".about-image", ".about-content", ".project-card", ".contact-box",
                ".portfolio-pdf-box", ".portfolio-cta-banner", ".home-ad-banner"
            ].join(",");

            function registerRevealElements(root = document) {
                const elements = root.querySelectorAll(revealSelector + ", .firebase-product-card");
                elements.forEach(function (element, index) {
                    if (element.dataset.revealReady) return;
                    element.dataset.revealReady = "true";
                    element.classList.add("reveal-premium");
                    element.style.transitionDelay = Math.min(index % 4, 3) * 70 + "ms";
                    revealObserver?.observe(element);
                });
            }

            const revealObserver = "IntersectionObserver" in window
                ? new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: .12, rootMargin: "0px 0px -35px" })
                : null;

            if (revealObserver) registerRevealElements();
            else document.querySelectorAll(revealSelector).forEach(el => el.classList.add("is-visible"));

            /* تطبيق الأنيميشن على المنتجات التي تصل لاحقاً من Firebase */
            const productsRoot = document.getElementById("firebaseProductsContainer");
            if (productsRoot && "MutationObserver" in window) {
                new MutationObserver(function () {
                    registerRevealElements(productsRoot);
                }).observe(productsRoot, { childList: true, subtree: true });
            }

            /* تأثير مغناطيسي خفيف للأزرار على الكمبيوتر */
            if (window.matchMedia("(pointer: fine)").matches) {
                document.querySelectorAll(".button, .header-button").forEach(function (button) {
                    button.classList.add("magnetic");
                    button.addEventListener("mousemove", function (event) {
                        const rect = button.getBoundingClientRect();
                        const x = event.clientX - rect.left - rect.width / 2;
                        const y = event.clientY - rect.top - rect.height / 2;
                        button.style.transform = `translate(${x * .09}px, ${y * .12}px)`;
                    });
                    button.addEventListener("mouseleave", function () {
                        button.style.transform = "";
                    });
                });
            }

            /* إعادة تفعيل تأثير الظهور عند الانتقال بين الصفحات الداخلية */
            if (typeof window.showPage === "function") {
                const premiumOriginalShowPage = window.showPage;
                window.showPage = function (pageId) {
                    premiumOriginalShowPage(pageId);
                    document.body.dataset.activePage = pageId;
                    window.setTimeout(function () {
                        const activePage = document.getElementById(pageId);
                        if (activePage) registerRevealElements(activePage);
                    }, 80);
                };
            }
        })();
    