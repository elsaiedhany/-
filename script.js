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
    let currentLanguage = localStorage.getItem('altaqwaLanguage') || 'ar'; 
    let translations = {};

    async function loadTranslations() {
        try {
            const response = await fetch('translations.json'); 
            if (!response.ok) {
                console.error('فشل تحميل ملف الترجمة. الحالة:', response.status);
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
    }
    
    function setLanguage(lang) {
        currentLanguage = lang; 
        localStorage.setItem('altaqwaLanguage', currentLanguage); 
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        if (Object.keys(translations).length === 0) {
            console.warn("ملف الترجمة لم يتم تحميله أو فارغ. لن يتم تطبيق الترجمة الكاملة.");
            setLanguageDisplayFallback(); 
            return; 
        }

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[currentLanguage] && translations[currentLanguage][key] !== undefined) {
                if (element.innerHTML.includes('<span') || element.innerHTML.includes('<br')) { 
                    element.innerHTML = translations[currentLanguage][key];
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
                         element.placeholder = translations[currentLanguage][key];
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
            }
        });
        
        if (languageToggleButton && translations.ar && translations.en) { 
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                 langToggleTextElement.textContent = currentLanguage === 'ar' ? (translations.en.lang_switch_text_short || 'EN') : (translations.ar.lang_switch_text_short || 'AR');
            }
        }
        observeFadeInElements();
    }

    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', () => {
            const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
            if (Object.keys(translations).length > 0) { 
                setLanguage(newLang);
            } else {
                loadTranslations().then(() => {
                    if (Object.keys(translations).length > 0) {
                         setLanguage(newLang);
                    } else {
                        currentLanguage = newLang; 
                        localStorage.setItem('altaqwaLanguage', currentLanguage);
                        setLanguageDisplayFallback();
                    }
                });
            }
        });
    }
    
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
                if (this.id === 'language-toggle-link' || this.id === 'theme-toggle') return;
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
        // !!! تم تعديل السطر التالي بناءً على الـ IP الذي ظهر لك !!!
        const backendBaseUrl = 'http://192.168.1.4:5000'; // <--- هذا هو الـ IP من مخرجاتك
        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`; 

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorData = { message: `فشل الاتصال بالخادم لجلب الصور: ${response.status}` };
                try {
                    const errJson = await response.json();
                    if (errJson && errJson.error) errorData.message = errJson.error;
                } catch (e) { /* لا مشكلة */ }
                throw new Error(errorData.message);
            }
            const images = await response.json(); 
            
            if (!Array.isArray(images)) {
                throw new Error("البيانات المستلمة من الخادم بخصوص الصور ليست بالتنسيق المتوقع (مصفوفة).");
            }
            renderPortfolioImages(images, backendBaseUrl);

        } catch (error) {
            console.error("فشل في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) { 
                 portfolioGrid.innerHTML = `<p class="error-message">عفواً، حدث خطأ أثناء تحميل صور الأعمال من السيرفر.<br> (${error.message})</p>`;
            }
        }
    }

    function renderPortfolioImages(images, backendBaseUrl) { 
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = ''; 

        if (images.length === 0) {
            portfolioGrid.innerHTML = '<p class="text-center" style="padding: 2rem 0;">لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!</p>';
            return;
        }

        images.forEach((imageInfo, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            portfolioItem.style.setProperty('--animation-delay', `${index * 150}ms`);
            const imgElement = document.createElement('img');
            if (imageInfo.imageUrl && imageInfo.imageUrl.startsWith('/uploads/')) { 
                imgElement.src = `${backendBaseUrl}${imageInfo.imageUrl}`;
            } else {
                imgElement.src = imageInfo.imageUrl || 'images/placeholder-kitchen.png'; 
            }
            imgElement.alt = imageInfo.caption || "مطبخ من تصميم شركة التقوى";
            imgElement.loading = "lazy"; 
            imgElement.onload = () => imgElement.classList.add('loaded');
            imgElement.onerror = () => { 
                imgElement.alt = "حدث خطأ أثناء تحميل هذه الصورة";
                imgElement.src = 'images/placeholder-kitchen-error.png'; 
                imgElement.classList.add('loaded'); 
            };
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
            formMessage.innerHTML = ''; 
            formMessage.className = 'form-message'; 
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const notes = document.getElementById('notes').value.trim();
            if (!name || !phone) {
                formMessage.textContent = 'يرجى إدخال الاسم ورقم الموبايل، فهما حقلان إلزاميان.';
                formMessage.classList.add('error');
                return;
            }
            console.log("بيانات طلب الحجز:", { name, phone, address, notes });
            formMessage.textContent = 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset(); 
            /*
            const formData = { name, phone, address, notes };
            const bookingApiUrl = 'http://192.168.1.4:5000/api/submit-booking-request'; // <--- عدّل هذا عند عمل API الحجز
            fetch(bookingApiUrl, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            // ... (باقي معالجة الإرسال)
            */
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
    
    loadTranslations(); 
});
