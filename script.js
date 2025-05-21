document.addEventListener('DOMContentLoaded', function() {
    
    // --- التحكم في الوضع الفاتح/الغامق ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    // الافتراضي الآن هو 'dark' كما هو محدد في وسم <html>
    // إذا لم يكن هناك شيء في localStorage، سيأخذ القيمة من السمة data-theme
    let preferredTheme = localStorage.getItem('altaqwaTheme') || document.documentElement.getAttribute('data-theme') || 'dark';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            if(themeIconMoon) themeIconMoon.style.display = 'none'; // القمر يختفي في الوضع الداكن
            if(themeIconSun) themeIconSun.style.display = 'inline-block'; // الشمس تظهر للتبديل إلى الفاتح
        } else { // theme === 'light'
            if(themeIconMoon) themeIconMoon.style.display = 'inline-block'; // القمر يظهر للتبديل إلى الداكن
            if(themeIconSun) themeIconSun.style.display = 'none'; // الشمس تختفي في الوضع الفاتح
        }
    }
    applyTheme(preferredTheme); // تطبيق السمة عند التحميل

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('altaqwaTheme', newTheme);
        });
    }

    // --- نظام الترجمة ---
    const languageToggleButton = document.getElementById('language-toggle-btn');
    let currentLanguage = localStorage.getItem('altaqwaLanguage') || 'ar'; 
    let translations = {};

    async function loadTranslations() {
        try {
            const response = await fetch('translations.json'); // تأكد أن هذا الملف موجود في الجذر
            if (!response.ok) {
                console.error('فشل تحميل ملف الترجمة.');
                // يمكنك عرض رسالة للمستخدم هنا أو استخدام لغة افتراضية مدمجة
                return;
            }
            translations = await response.json();
            setLanguage(currentLanguage); // تطبيق اللغة بعد تحميل الملف
        } catch (error) {
            console.error('خطأ في تحميل أو تحليل ملف الترجمة:', error);
        }
    }

    function setLanguage(lang) {
        currentLanguage = lang; // تحديث اللغة الحالية
        localStorage.setItem('altaqwaLanguage', currentLanguage); // حفظ اختيار اللغة
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[currentLanguage] && translations[currentLanguage][key] !== undefined) {
                // التعامل مع النصوص التي قد تحتوي HTML (مثل العناوين الرئيسية)
                if (element.innerHTML.includes('<span') || element.innerHTML.includes('<br')) { // تحقق بسيط
                    element.innerHTML = translations[currentLanguage][key];
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
                         element.placeholder = translations[currentLanguage][key];
                    } else {
                        // إذا كان حقل إدخال ولكن لا نترجم placeholder، اتركه (أو تعامل معه بشكل مختلف)
                    }
                } else {
                     element.textContent = translations[currentLanguage][key];
                }
                
                if (key === "page_title" && element.tagName === 'TITLE') {
                    document.title = translations[currentLanguage][key];
                }
                if (key === "meta_description" && element.tagName === 'META' && element.name === 'description') {
                    element.content = translations[currentLanguage][key];
                }
            } else {
                // console.warn(`مفتاح الترجمة '${key}' غير موجود للغة '${currentLanguage}'`);
            }
        });
        
        // تحديث نص زر تبديل اللغة ليعرض اللغة "الأخرى"
        if (languageToggleButton && translations.ar && translations.en) { // التأكد من تحميل الترجمات
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                 langToggleTextElement.textContent = currentLanguage === 'ar' ? translations.en.lang_switch_text_short || 'EN' : translations.ar.lang_switch_text_short || 'AR';
            }
        }
        // استدعاء مراقب الأنيميشن بعد تطبيق الترجمة لضمان أن العناصر بالارتفاع الصحيح
        observeFadeInElements();
    }

    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', () => {
            const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
            setLanguage(newLang);
        });
    }
    
    // --- باقي أكواد JavaScript (قائمة التنقل، سنة الحقوق، جلب الصور، نموذج الحجز، الأنيميشن) ---
    // ... (الكود كما هو من الإجابة السابقة، مع التأكد أن استدعاء observeFadeInElements يتم بشكل صحيح)

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }
    if (navLinks) {
        navLinks.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
    
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
        portfolioGrid.innerHTML = '<p class="loading-message">جاري تحميل أحدث إبداعاتنا...</p>';
        fetchPortfolioImages();
    }
    async function fetchPortfolioImages() {
        const apiUrl = '/api/altaqwa-kitchens/portfolio-v2'; //  !!! عدّل هذا الرابط يا سعيد !!!
        const mockImages = [ 
             { imageUrl: "https://via.placeholder.com/450x350/121212/d4af37?text=مطبخ+فخم+1", caption: "تصميم مودرن بخامات أوروبية فاخرة" },
             { imageUrl: "https://via.placeholder.com/450x350/d4af37/121212?text=مطبخ+أنيق+2", caption: "مطبخ كلاسيكي بلمسة عصرية راقية" },
             { imageUrl: "https://via.placeholder.com/450x350/1e1e1e/e0e0e0?text=مطبخ+عملي+3", caption: "استغلال ذكي للمساحات المحدودة بأناقة" },
             { imageUrl: "https://via.placeholder.com/450x350/bda042/1f232b?text=مطبخ+خشبي+4", caption: "مطبخ خشبي بتفاصيل أنيقة ودافئة" }
        ];
        try {
            const images = await new Promise(resolve => setTimeout(() => resolve(mockImages), 1200));
            if (!Array.isArray(images)) throw new Error("بيانات صور البورتفوليو غير صالحة.");
            renderPortfolioImages(images);
        } catch (error) {
            console.error("فشل تحميل صور البورتفوليو:", error);
            if (portfolioGrid) portfolioGrid.innerHTML = `<p class="error-message">عفواً، خطأ في تحميل الصور.<br> (${error.message})</p>`;
        }
    }
    function renderPortfolioImages(images) {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = ''; 
        if (images.length === 0) {
            portfolioGrid.innerHTML = '<p class="text-center" style="padding: 2rem 0;">لا توجد أعمال مميزة لعرضها حالياً.</p>'; return;
        }
        images.forEach((imageInfo, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            portfolioItem.style.setProperty('--animation-delay', `${index * 150}ms`);
            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.imageUrl; 
            imgElement.alt = imageInfo.caption || "مطبخ من تصميم شركة التقوى";
            imgElement.loading = "lazy";
            imgElement.onload = () => imgElement.classList.add('loaded');
            imgElement.onerror = () => { imgElement.alt = "خطأ في تحميل الصورة"; };
            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || "تصميم مطابخ التقوى";
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
            formMessage.innerHTML = ''; formMessage.className = 'form-message';
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            if (!name || !phone) {
                formMessage.textContent = 'الاسم ورقم الموبايل حقول إلزامية.';
                formMessage.classList.add('error'); return;
            }
            console.log("بيانات الطلب:", { name, phone, address: document.getElementById('address').value.trim(), notes: document.getElementById('notes').value.trim() });
            formMessage.textContent = 'شكراً لاهتمامك! تم استلام طلبك بنجاح، وسيقوم م. هاني الفقي بالتواصل معك خلال 24 ساعة.';
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
        }, { threshold: 0.05 }); // تقليل النسبة قليلاً لبدء الأنيميشن أسرع
        fadeInElements.forEach(el => {
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) el.style.transitionDelay = delay;
            observer.observe(el);
        });
    }
    
    // استدعاء تحميل الترجمة عند بدء تشغيل الصفحة
    loadTranslations(); // هذا سيقوم بتطبيق اللغة ثم استدعاء observeFadeInElements داخلياً

});
