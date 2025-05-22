// افترض أن هذا هو ملف main.js أو script.js الخاص بك بالكامل
document.addEventListener('DOMContentLoaded', function() {

    // --- التحكم في الوضع الفاتح/الغامق ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    let preferredTheme = localStorage.getItem('altaqwaTheme') || document.documentElement.getAttribute('data-theme') || 'dark';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            if(themeIconMoon) themeIconMoon.style.display = 'none';
            if(themeIconSun) themeIconSun.style.display = 'inline-block';
        } else { // theme === 'light'
            if(themeIconMoon) themeIconMoon.style.display = 'inline-block';
            if(themeIconSun) themeIconSun.style.display = 'none';
        }
    }
    applyTheme(preferredTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('altaqwaTheme', newTheme);
        });
    }

    // --- نظام الترجمة ---
    const languageToggleButton = document.getElementById('language-toggle-btn');
    let currentLanguage = localStorage.getItem('altaqwaLanguage') || document.documentElement.lang || 'ar';
    let translations = {};

    async function loadTranslations() {
        try {
            const response = await fetch('translations.json'); // تأكد أن مسار هذا الملف صحيح
            if (!response.ok) {
                console.error(`فشل تحميل ملف الترجمة. الحالة: ${response.status} ${response.statusText}. المسار المطلوب: ${response.url}`);
                setLanguageDisplayFallback();
                return;
            }
            translations = await response.json();
            setLanguage(currentLanguage);
        } catch (error) {
            console.error('خطأ في تحميل أو تحليل ملف الترجمة:', error);
            setLanguageDisplayFallback();
        }
    }

    function setLanguageDisplayFallback() {
        if (languageToggleButton) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                langToggleTextElement.textContent = currentLanguage === 'ar' ? 'EN' : 'AR';
            }
        }
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        updateDynamicTextFallbacks(currentLanguage);
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('altaqwaLanguage', currentLanguage);
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        if (Object.keys(translations).length === 0 || !translations[currentLanguage]) {
            console.warn(`ملف الترجمة لم يتم تحميله أو أن اللغة '${lang}' غير موجودة. سيتم عرض النصوص الافتراضية.`);
            setLanguageDisplayFallback();
            return;
        }

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            const translationValue = translations[currentLanguage]?.[key];

            if (translationValue !== undefined) {
                if (element.hasAttribute('data-translate-html')) { // للترجمات التي تحتوي على HTML
                    element.innerHTML = translationValue;
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
                        element.placeholder = translationValue;
                    }
                } else {
                    element.textContent = translationValue;
                }
                // SEO: تحديث عنوان الصفحة ووصف الميتا
                if (key === "page_title" && element.tagName === 'TITLE') document.title = translationValue;
                if (key === "meta_description" && element.tagName === 'META' && element.name === 'description') element.content = translationValue;
                // SEO: تحديث Open Graph و Twitter Card (إذا أضفت مفاتيح ترجمة لها)
                if (key === "og_title" && element.tagName === 'META' && element.getAttribute('property') === 'og:title') element.content = translationValue;
                if (key === "og_description" && element.tagName === 'META' && element.getAttribute('property') === 'og:description') element.content = translationValue;
                if (key === "twitter_title" && element.tagName === 'META' && element.name === 'twitter:title') element.content = translationValue;
                if (key === "twitter_description" && element.tagName === 'META' && element.name === 'twitter:description') element.content = translationValue;

            }
        });

        if (languageToggleButton) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                 const switchToLang = currentLanguage === 'ar' ? 'en' : 'ar';
                 langToggleTextElement.textContent = translations[switchToLang]?.lang_switch_text_short || (switchToLang === 'en' ? 'EN' : 'AR');
            }
        }
        observeFadeInElements(); // استدعاء لتأثيرات الدخول بعد تغيير اللغة
    }
    
    function updateDynamicTextFallbacks(lang) {
        const loadingEl = portfolioGrid?.querySelector('.loading-message[data-translate-key="loading_portfolio"]');
        if (loadingEl) loadingEl.textContent = lang === 'ar' ? 'جاري تحميل أحدث إبداعاتنا...' : 'Loading our latest creations...';
        
        const noItemsEl = portfolioGrid?.querySelector('.no-portfolio-items-text[data-translate-key="no_portfolio_items"]');
        if (noItemsEl) noItemsEl.textContent = lang === 'ar' ? 'لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!' : 'No featured works to display currently. Stay tuned for our new additions!';
    }


    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
            if (Object.keys(translations).length > 0 && translations[newLang]) {
                setLanguage(newLang);
            } else {
                loadTranslations().then(() => {
                    if (Object.keys(translations).length > 0 && translations[newLang]) {
                         setLanguage(newLang);
                    } else {
                        currentLanguage = newLang;
                        localStorage.setItem('altaqwaLanguage', currentLanguage);
                        setLanguageDisplayFallback();
                        console.warn(`لم يتم العثور على ترجمات للغة '${newLang}' بعد محاولة التحميل.`);
                    }
                });
            }
        });
    }

    const menuToggle = document.getElementById('menu-toggle-btn'); // استخدام ID لزر القائمة
    const navLinksUl = document.getElementById('nav-links-ul');     // استخدام ID لقائمة الروابط

    if (menuToggle && navLinksUl) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinksUl.classList.toggle('active');
            menuToggle.classList.toggle('active'); // لستايل زر القائمة (مثل تغيير الأيقونة)
            menuToggle.setAttribute('aria-expanded', isActive); // لسهولة الوصول
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }
    if (navLinksUl) {
        navLinksUl.querySelectorAll('a').forEach(anchor => {
            anchor.addEventListener('click', function () {
                // لا تغلق القائمة إذا كان العنصر المضغوط عليه هو زر تغيير اللغة أو الثيم داخل القائمة
                if (this.id === 'language-toggle-btn' || (this.parentElement && this.parentElement.id === 'language-toggle-btn') || this.id === 'theme-toggle') {
                    return; 
                }
                if (navLinksUl.classList.contains('active')) {
                    navLinksUl.classList.remove('active');
                    if(menuToggle) {
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                    document.body.style.overflow = '';
                }
            });
        });
    }

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
        portfolioGrid.innerHTML = `<p class="loading-message" data-translate-key="loading_portfolio">جاري تحميل أحدث إبداعاتنا...</p>`;
        if (Object.keys(translations).length > 0 && translations[currentLanguage]?.loading_portfolio) {
            portfolioGrid.querySelector('.loading-message').textContent = translations[currentLanguage].loading_portfolio;
        }
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        // !!! لو بتفتح الفرونت اند من نفس الموبايل اللي عليه تيرمكس، استخدم localhost:5000 !!!
        const backendBaseUrl = 'http://localhost:5000'; 

        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`;
        console.log(`INFO: محاولة جلب الصور من: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorDetail = `فشل الاتصال بالخادم (الحالة: ${response.status} ${response.statusText})`;
                try {
                    const errJson = await response.json();
                    if (errJson && errJson.error) errorDetail = errJson.error;
                } catch (e) {
                    const errText = await response.text();
                    if (errText) errorDetail = errText.substring(0, 300); // نص قصير من الخطأ
                }
                console.error(`ERROR: ${errorDetail}`);
                throw new Error(errorDetail);
            }
            const images = await response.json();
            if (!Array.isArray(images)) {
                console.error("البيانات المستلمة من الخادم بخصوص الصور ليست مصفوفة:", images);
                throw new Error("التنسيق المستلم من الخادم لبيانات الصور غير صحيح.");
            }
            renderPortfolioImages(images);
        } catch (error) {
            console.error("فشل كلي في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                const errorKey = "portfolio_load_error";
                const fallbackMessage = `عفواً، حدث خطأ أثناء تحميل صور الأعمال من الخادم.<br> (${error.message})`;
                portfolioGrid.innerHTML = `<p class="error-message portfolio-load-error-text" data-translate-key="${errorKey}">${translations[currentLanguage]?.[errorKey]?.replace('{errorMessage}', error.message) || fallbackMessage}</p>`;
                if(Object.keys(translations).length > 0 && translations[currentLanguage]) setLanguage(currentLanguage);
            }
        }
    }

    function renderPortfolioImages(images) {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = '';
        if (images.length === 0) {
            const noItemsKey = "no_portfolio_items";
            const fallbackMessage = "لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!";
            portfolioGrid.innerHTML = `<p class="text-center no-portfolio-items-text" style="padding: 2rem 0;" data-translate-key="${noItemsKey}">${translations[currentLanguage]?.[noItemsKey] || fallbackMessage}</p>`;
            if(Object.keys(translations).length > 0 && translations[currentLanguage]) setLanguage(currentLanguage);
            return;
        }
        images.forEach((imageInfo, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            portfolioItem.style.setProperty('--animation-delay', `${index * 100}ms`);
            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.imageUrl || 'images/placeholder-kitchen.png'; // صورة احتياطية
            imgElement.alt = imageInfo.caption || (translations[currentLanguage]?.default_image_alt || "مطبخ من تصميم شركة التقوى");
            imgElement.loading = "lazy";
            imgElement.onload = () => imgElement.classList.add('loaded');
            imgElement.onerror = () => {
                imgElement.alt = translations[currentLanguage]?.image_load_error_alt || "حدث خطأ أثناء تحميل هذه الصورة";
                imgElement.src = 'images/placeholder-kitchen-error.png';
                imgElement.classList.add('loaded');
            };
            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || (translations[currentLanguage]?.default_image_caption || "تصميم مطابخ التقوى");
            portfolioItem.appendChild(imgElement);
            portfolioItem.appendChild(captionElement);
            portfolioGrid.appendChild(portfolioItem);
        });
        observeFadeInElements();
    }

    const bookingForm = document.getElementById('bookingForm');
    const formMessage = document.getElementById('form-message');
    if (bookingForm && formMessage) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formMessage.innerHTML = '';
            formMessage.className = 'form-message'; // إعادة تعيين الكلاس
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const notes = document.getElementById('notes').value.trim();
            if (!name || !phone) {
                formMessage.textContent = translations[currentLanguage]?.validation_name_phone_required || 'يرجى إدخال الاسم ورقم الموبايل، فهما حقلان إلزاميان.';
                formMessage.classList.add('error');
                return;
            }
            // هنا يمكنك إضافة كود لإرسال البيانات للباك اند إذا أردت عمل API للحجز
            console.log("بيانات طلب الحجز (للتجربة، لم يتم إرسالها):", { name, phone, address, notes });
            formMessage.textContent = translations[currentLanguage]?.booking_success_message || 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset();
        });
    }

    function observeFadeInElements() {
        const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-on-scroll');
        if (!("IntersectionObserver" in window)) {
            fadeInElements.forEach(el => {
                el.classList.add('is-visible');
                 if(el.classList.contains('fade-in-up')) el.classList.add('visible');
            });
            return;
        }
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    if(entry.target.classList.contains('fade-in-up')) entry.target.classList.add('visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });
        fadeInElements.forEach(el => {
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) el.style.transitionDelay = delay;
            observer.observe(el);
        });
    }
    loadTranslations(); // بدء تحميل الترجمة عند تحميل الصفحة
});
