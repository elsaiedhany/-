document.addEventListener('DOMContentLoaded', function() {

    // --- التحكم في الوضع الفاتح/الغامق ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    // قيمة data-theme الافتراضية من HTML لو موجودة، أو 'dark'
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
    applyTheme(preferredTheme); // تطبيق الثيم المفضل عند تحميل الصفحة

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('altaqwaTheme', newTheme);
        });
    }

    // --- نظام الترجمة ---
    const languageToggleButton = document.getElementById('language-toggle-btn');
    let currentLanguage = localStorage.getItem('altaqwaLanguage') || document.documentElement.lang || 'ar'; // الأولوية لـ localStorage ثم لغة الـ HTML ثم العربية
    let translations = {}; // سيتم ملؤها من translations.json

    async function loadTranslations() {
        try {
            // تأكد أن مسار ملف الترجمة صحيح بالنسبة لموقع ملف الـ HTML
            const response = await fetch('translations.json');
            if (!response.ok) {
                console.error(`فشل تحميل ملف الترجمة. الحالة: ${response.status} ${response.statusText}. المسار المطلوب: ${response.url}`);
                setLanguageDisplayFallback();
                return;
            }
            translations = await response.json();
            setLanguage(currentLanguage); // طبق اللغة الحالية بعد تحميل الترجمات
        } catch (error) {
            console.error('خطأ في تحميل أو تحليل ملف الترجمة:', error);
            setLanguageDisplayFallback();
        }
    }

    function setLanguageDisplayFallback() {
        // هذه الدالة مسؤولة عن تحديث لغة زر التبديل واتجاه الصفحة إذا فشل تحميل الترجمات
        if (languageToggleButton) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                langToggleTextElement.textContent = currentLanguage === 'ar' ? 'EN' : 'AR';
            }
        }
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('altaqwaLanguage', currentLanguage);
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        if (Object.keys(translations).length === 0 || !translations[currentLanguage]) {
            console.warn(`ملف الترجمة لم يتم تحميله أو أن اللغة '${lang}' غير موجودة. سيتم عرض النصوص الافتراضية.`);
            setLanguageDisplayFallback();
            // تحديث النصوص التي قد تكون افتراضية في HTML إذا فشلت الترجمة
            updateDynamicTextFallbacks(lang);
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
                    // يمكن إضافة ترجمة للـ value إذا لزم الأمر لأنواع معينة من الـ input
                } else {
                    element.textContent = translationValue;
                }

                // ترجمة خاصة لعنوان الصفحة والوصف
                if (key === "page_title" && element.tagName === 'TITLE') {
                    document.title = translationValue;
                }
                if (key === "meta_description" && element.tagName === 'META' && element.name === 'description') {
                    element.content = translationValue;
                }
            } else {
                 // console.warn(`مفتاح الترجمة '${key}' غير موجود للغة '${currentLanguage}'`);
            }
        });

        // تحديث نص زر تبديل اللغة
        if (languageToggleButton) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                 const switchToLang = currentLanguage === 'ar' ? 'en' : 'ar';
                 // تأكد أن مفتاح الترجمة لنص زر التبديل موجود
                 langToggleTextElement.textContent = translations[switchToLang]?.lang_switch_text_short || (switchToLang === 'en' ? 'EN' : 'AR');
            }
        }
        observeFadeInElements();
    }
    
    // دالة لتحديث النصوص الافتراضية عند فشل الترجمة
    function updateDynamicTextFallbacks(lang) {
        if (portfolioGrid && portfolioGrid.querySelector('.loading-message')) {
            portfolioGrid.querySelector('.loading-message').textContent = lang === 'ar' ? 'جاري تحميل أحدث إبداعاتنا...' : 'Loading our latest creations...';
        }
        const noPortfolioItemsEl = portfolioGrid?.querySelector('.no-portfolio-items-text');
        if (noPortfolioItemsEl) {
            noPortfolioItemsEl.textContent = lang === 'ar' ? 'لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!' : 'No featured works to display currently. Stay tuned for our new additions!';
        }
         const portfolioErrorEl = portfolioGrid?.querySelector('.portfolio-load-error-text');
        if (portfolioErrorEl) {
            // النص الأساسي للخطأ سيأتي من error.message، هذا فقط للنص الثابت
            // portfolioErrorEl.textContent = lang === 'ar' ? 'عفواً، حدث خطأ أثناء تحميل صور الأعمال من الخادم.' : 'Sorry, an error occurred while loading portfolio images from the server.';
        }
    }


    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', (e) => {
            e.preventDefault(); // منع أي سلوك افتراضي للرابط
            const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
            if (Object.keys(translations).length > 0 && translations[newLang]) {
                setLanguage(newLang);
            } else {
                loadTranslations().then(() => { // حاول تحميل الترجمات مرة أخرى إذا لم تكن محملة
                    if (Object.keys(translations).length > 0 && translations[newLang]) {
                         setLanguage(newLang);
                    } else {
                        currentLanguage = newLang;
                        localStorage.setItem('altaqwaLanguage', currentLanguage);
                        setLanguageDisplayFallback();
                        updateDynamicTextFallbacks(newLang);
                        console.warn(`لم يتم العثور على ترجمات للغة '${newLang}' بعد محاولة التحميل.`);
                    }
                });
            }
        });
    }

    // --- القائمة (Menu Toggle) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(anchor => { // تم التعديل ليشمل كل الروابط داخل القائمة
            anchor.addEventListener('click', function () {
                // لا تغلق القائمة إذا كان العنصر المضغوط عليه هو زر تغيير اللغة أو الثيم داخل القائمة
                if (this.id === 'language-toggle-btn' || this.parentElement.id === 'language-toggle-btn' || this.id === 'theme-toggle') {
                    return; 
                }
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // --- تحديث السنة الحالية في الـ Footer ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- الجزء الخاص بجلب وعرض صور الأعمال من الباك اند ---
    const portfolioGrid = document.getElementById('portfolioGrid');

    if (portfolioGrid) {
        portfolioGrid.innerHTML = `<p class="loading-message" data-translate-key="loading_portfolio">جاري تحميل أحدث إبداعاتنا...</p>`;
        // تأكد من تطبيق الترجمة على الرسالة الأولية إذا كانت الترجمات قد تم تحميلها بالفعل
        if (Object.keys(translations).length > 0 && translations[currentLanguage]?.loading_portfolio) {
            portfolioGrid.querySelector('.loading-message').textContent = translations[currentLanguage].loading_portfolio;
        }
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        // ========================== هام جداً يا سعيد ==========================
        // 1. لو بتفتح الفرونت اند ده (صفحة GitHub Pages) من نفس الموبايل
        //    اللي شغال عليه تيرمكس والباك اند، استخدم:
        //    const backendBaseUrl = 'http://localhost:5000';
        //
        // 2. لو بتفتح الفرونت اند ده من جهاز تاني (كمبيوتر أو موبايل تاني)
        //    والجهاز ده متوصل على نفس شبكة الواي فاي اللي عليها موبايل تيرمكس،
        //    استخدم الـ IP اللي بيظهر في تيرمكس لما بتشغل python app.py
        //    (زي 'http://192.168.1.4:5000' اللي ظهرلك قبل كده).
        //    !!! اتأكد إن الـ IP ده هو الصحيح حالياً !!!
        // =====================================================================
        const backendBaseUrl = 'http://192.168.1.4:5000'; // <--- عدل هذا السطر حسب الحالة!

        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`;
        console.log(`محاولة جلب الصور من: ${apiUrl}`); // للتأكد من الرابط في الـ console

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                let errorDetail = `الحالة: ${response.status} ${response.statusText}`;
                try {
                    // محاولة قراءة رسالة الخطأ من الخادم إذا كانت JSON
                    const errJson = await response.json();
                    if (errJson && errJson.error) errorDetail = errJson.error;
                } catch (e) {
                    // إذا لم تكن رسالة الخطأ JSON، حاول قراءة النص العادي
                    const errText = await response.text();
                    if (errText) errorDetail = errText.substring(0, 200); // نص قصير من الخطأ
                    console.warn("رسالة الخطأ من الخادم لم تكن JSON أو طويلة جداً:", errText);
                }
                throw new Error(errorDetail); // استخدام رسالة الخطأ من الخادم إن وجدت
            }

            const images = await response.json();

            if (!Array.isArray(images)) {
                console.error("البيانات المستلمة من الخادم بخصوص الصور ليست مصفوفة:", images);
                throw new Error("التنسيق المستلم من الخادم لبيانات الصور غير صحيح.");
            }
            renderPortfolioImages(images);

        } catch (error) {
            console.error("فشل في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                const errorKey = "portfolio_load_error";
                const fallbackMessage = `عفواً، حدث خطأ أثناء تحميل صور الأعمال.<br> (${error.message})`;
                portfolioGrid.innerHTML = `<p class="error-message portfolio-load-error-text" data-translate-key="${errorKey}">${translations[currentLanguage]?.[errorKey]?.replace('{errorMessage}', error.message) || fallbackMessage}</p>`;
                // أعد تطبيق الترجمة على رسالة الخطأ الجديدة إذا كانت الترجمات محملة
                if(Object.keys(translations).length > 0) setLanguage(currentLanguage);
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
            if(Object.keys(translations).length > 0) setLanguage(currentLanguage); // أعد تطبيق الترجمة
            return;
        }

        images.forEach((imageInfo, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            portfolioItem.style.setProperty('--animation-delay', `${index * 100}ms`);

            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.imageUrl || 'images/placeholder-kitchen.png';
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
        // إذا كانت الـ captions نفسها تحتاج ترجمة بمفاتيح خاصة، ستحتاج لاستدعاء setLanguage هنا
        // أو إضافة data-translate-key للـ captionElement إذا كان النص ثابتاً
    }

    // --- الجزء الخاص بطلبات الحجز ---
    const bookingForm = document.getElementById('bookingForm');
    const formMessage = document.getElementById('form-message');

    if (bookingForm && formMessage) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formMessage.innerHTML = '';
            formMessage.className = 'form-message';

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const notes = document.getElementById('notes').value.trim();

            if (!name || !phone) {
                formMessage.textContent = translations[currentLanguage]?.validation_name_phone_required || 'يرجى إدخال الاسم ورقم الموبايل، فهما حقلان إلزاميان.';
                formMessage.classList.add('error');
                return;
            }
            console.log("بيانات طلب الحجز:", { name, phone, address, notes });
            formMessage.textContent = translations[currentLanguage]?.booking_success_message || 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset();
        });
    }

    // --- دالة مراقبة العناصر لتأثيرات الدخول عند الـ scroll ---
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

    // --- استدعاء تحميل الترجمات عند تحميل الصفحة لأول مرة ---
    loadTranslations();

});
