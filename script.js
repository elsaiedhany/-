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
            const response = await fetch('translations.json');
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
                if (element.hasAttribute('data-translate-html')) {
                    element.innerHTML = translationValue;
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
                        element.placeholder = translationValue;
                    }
                } else {
                    element.textContent = translationValue;
                }
                if (key === "page_title" && element.tagName === 'TITLE') document.title = translationValue;
                if (key === "meta_description" && element.tagName === 'META' && element.name === 'description') element.content = translationValue;
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
        observeFadeInElements();
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

    const menuToggle = document.getElementById('menu-toggle-btn');
    const navLinksUl = document.getElementById('nav-links-ul');
    if (menuToggle && navLinksUl) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinksUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }
    if (navLinksUl) {
        navLinksUl.querySelectorAll('a').forEach(anchor => {
            anchor.addEventListener('click', function () {
                if (this.id === 'language-toggle-btn' || (this.parentElement && this.parentElement.id === 'language-toggle-btn') || this.id === 'theme-toggle') return;
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

    // --- Lightbox Elements and Functions ---
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    function openLightbox(imgSrc, captionText) {
        if (lightbox && lightboxImg && lightboxCaption) {
            lightbox.style.display = "flex"; // Changed to flex for centering
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = captionText;
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }
    // Assign close function to close button (if it's part of the lightbox HTML)
    const lightboxCloseButton = document.querySelector('.lightbox-close');
    if(lightboxCloseButton) {
        lightboxCloseButton.onclick = closeLightbox;
    }
    // Close lightbox when clicking on the background
    if (lightbox) {
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && lightbox && lightbox.style.display === "flex") {
            closeLightbox();
        }
    });


    // --- Portfolio Section Logic (with Load More and Lightbox) ---
    const portfolioGrid = document.getElementById('portfolioGrid');
    const loadMoreButton = document.getElementById('loadMorePortfolio');
    const portfolioControlsDiv = document.querySelector('.portfolio-controls'); // The div containing the button

    let allPortfolioImages = []; 
    let currentlyDisplayedImagesCount = 0;
    const imagesPerLoad = 3; // <--  عدل هذا الرقم لعدد الصور التي تريد عرضها في كل مرة (مثلاً 3، 6، 9)

    if (portfolioGrid) { // Check if portfolioGrid exists before proceeding
        portfolioGrid.innerHTML = `<p class="loading-message" data-translate-key="loading_portfolio">جاري تحميل أحدث إبداعاتنا...</p>`;
        // Apply translation to initial message if translations are already loaded
        if (Object.keys(translations).length > 0 && translations[currentLanguage]?.loading_portfolio) {
            const loadingMsgEl = portfolioGrid.querySelector('.loading-message');
            if(loadingMsgEl) loadingMsgEl.textContent = translations[currentLanguage].loading_portfolio;
        }
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        const backendBaseUrl = 'http://localhost:5000'; // تأكد أن هذا هو العنوان الصحيح
        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`;
        console.log(`INFO: محاولة جلب الصور من: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorDetail = `فشل الاتصال بالخادم (الحالة: ${response.status} ${response.statusText})`;
                try { const errJson = await response.json(); if (errJson && errJson.error) errorDetail = errJson.error; } 
                catch (e) { const errText = await response.text(); if (errText) errorDetail = errText.substring(0, 300); }
                console.error(`ERROR: ${errorDetail}`);
                throw new Error(errorDetail);
            }
            const images = await response.json();
            if (!Array.isArray(images)) {
                console.error("البيانات المستلمة من الخادم بخصوص الصور ليست مصفوفة:", images);
                throw new Error("التنسيق المستلم من الخادم لبيانات الصور غير صحيح.");
            }
            
            allPortfolioImages = images;
            currentlyDisplayedImagesCount = 0;
            if(portfolioGrid) portfolioGrid.innerHTML = ''; // Clear loading message or previous items

            appendPortfolioImages(); // Display initial set of images

        } catch (error) {
            console.error("فشل كلي في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                const errorKey = "portfolio_load_error";
                const fallbackMessage = `عفواً، حدث خطأ أثناء تحميل صور الأعمال من الخادم.<br> (${error.message})`;
                portfolioGrid.innerHTML = `<p class="error-message portfolio-load-error-text" data-translate-key="${errorKey}">${translations[currentLanguage]?.[errorKey]?.replace('{errorMessage}', error.message) || fallbackMessage}</p>`;
                if(portfolioControlsDiv) portfolioControlsDiv.style.display = 'none'; // Hide load more button on error
                if(Object.keys(translations).length > 0 && translations[currentLanguage]) setLanguage(currentLanguage);
            }
        }
    }

    function appendPortfolioImages() {
        if (!portfolioGrid) return;

        const startIndex = currentlyDisplayedImagesCount;
        const endIndex = startIndex + imagesPerLoad;
        const imagesToDisplayThisLoad = allPortfolioImages.slice(startIndex, endIndex);

        if (imagesToDisplayThisLoad.length === 0 && startIndex === 0) { // No images at all
            const noItemsKey = "no_portfolio_items";
            const fallbackMessage = "لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!";
            portfolioGrid.innerHTML = `<p class="text-center no-portfolio-items-text" style="padding: 2rem 0;" data-translate-key="${noItemsKey}">${translations[currentLanguage]?.[noItemsKey] || fallbackMessage}</p>`;
            if(portfolioControlsDiv) portfolioControlsDiv.style.display = 'none';
            if(Object.keys(translations).length > 0 && translations[currentLanguage]) setLanguage(currentLanguage);
            return;
        }

        imagesToDisplayThisLoad.forEach((imageInfo, localIndex) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            portfolioItem.style.setProperty('--animation-delay', `${(startIndex + localIndex) * 100}ms`);

            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.imageUrl || 'images/placeholder-kitchen.png';
            const altText = imageInfo.caption || (translations[currentLanguage]?.default_image_alt || "مطبخ من تصميم شركة التقوى");
            imgElement.alt = altText;
            imgElement.loading = "lazy";
            
            imgElement.onload = () => imgElement.classList.add('loaded');
            imgElement.onerror = () => {
                imgElement.alt = translations[currentLanguage]?.image_load_error_alt || "حدث خطأ أثناء تحميل هذه الصورة";
                imgElement.src = 'images/placeholder-kitchen-error.png';
                imgElement.classList.add('loaded');
            };
            // Add click listener for Lightbox
            imgElement.addEventListener('click', function() {
                openLightbox(this.src, imageInfo.caption || (translations[currentLanguage]?.default_image_caption || "تصميم مطابخ التقوى"));
            });

            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || (translations[currentLanguage]?.default_image_caption || "تصميم مطابخ التقوى");
            
            portfolioItem.appendChild(imgElement);
            portfolioItem.appendChild(captionElement);
            portfolioGrid.appendChild(portfolioItem);
        });

        currentlyDisplayedImagesCount += imagesToDisplayThisLoad.length;

        // Update "Load More" button visibility
        if (currentlyDisplayedImagesCount >= allPortfolioImages.length) {
            if(loadMoreButton) loadMoreButton.style.display = 'none';
            if(portfolioControlsDiv && currentlyDisplayedImagesCount > 0) { // Keep div if items were loaded
                 // Optionally hide the div if the button is hidden and you want to reclaim space
                 // portfolioControlsDiv.style.display = 'none'; 
            }
        } else {
            if(loadMoreButton) loadMoreButton.style.display = 'inline-block';
            if(portfolioControlsDiv) portfolioControlsDiv.style.display = 'block'; // Ensure div is visible
        }
        observeFadeInElements();
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', appendPortfolioImages);
    }


    // --- Booking Form Logic ---
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
            console.log("بيانات طلب الحجز (للتجربة، لم يتم إرسالها):", { name, phone, address, notes });
            formMessage.textContent = translations[currentLanguage]?.booking_success_message || 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset();
        });
    }

    // --- Animation Observer ---
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
        }, { threshold: 0.05 }); // Adjust threshold as needed
        fadeInElements.forEach(el => {
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) el.style.transitionDelay = delay;
            observer.observe(el);
        });
    }
    
    loadTranslations(); // Initial call to load translations and set up the page
});
