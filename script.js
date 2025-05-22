document.addEventListener('DOMContentLoaded', function() {

    // --- التحكم في الوضع الفاتح/الغامق ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    // Ensure correct initial theme based on localStorage or system preference or default
    let preferredTheme = localStorage.getItem('altaqwaTheme') || 
                         (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (!document.documentElement.hasAttribute('data-theme')) { // Set if not already set by HTML
        document.documentElement.setAttribute('data-theme', preferredTheme);
    } else { // If set by HTML, use that as the initial source of truth for the session
        preferredTheme = document.documentElement.getAttribute('data-theme');
    }


    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIconMoon && themeIconSun) {
            if (theme === 'dark') {
                themeIconMoon.style.display = 'none';
                themeIconSun.style.display = 'inline-block';
            } else { // theme === 'light'
                themeIconMoon.style.display = 'inline-block';
                themeIconSun.style.display = 'none';
            }
        }
    }
    applyTheme(preferredTheme); // Apply the initial theme

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
            // تأكد أن مسار ملف translations.json صحيح (يفترض أنه في نفس مستوى index.html)
            const response = await fetch('translations.json'); 
            if (!response.ok) {
                console.error(`فشل تحميل ملف الترجمة. الحالة: ${response.status} ${response.statusText}. المسار: ${response.url}`);
                setLanguageDisplayFallback(); // Fallback if file not found
                return false; // Indicate failure
            }
            translations = await response.json();
            return true; // Indicate success
        } catch (error) {
            console.error('خطأ في تحميل أو تحليل ملف الترجمة:', error);
            setLanguageDisplayFallback();
            return false; // Indicate failure
        }
    }
    
    function setLanguageDisplayFallback() {
        // This function is a minimal fallback if translations.json fails to load
        // It mainly sets the button text for language toggle and page direction
        if (languageToggleButton) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                langToggleTextElement.textContent = currentLanguage === 'ar' ? 'EN' : 'AR';
            }
        }
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        // You might want to update some critical aria-labels here if needed
        updateDynamicTextFallbacks(currentLanguage); // Update texts that might be dynamically set
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('altaqwaLanguage', currentLanguage);
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        if (Object.keys(translations).length === 0 || !translations[currentLanguage]) {
            console.warn(`ملف الترجمة لم يتم تحميله أو أن اللغة '${lang}' غير موجودة. سيتم عرض النصوص الافتراضية.`);
            setLanguageDisplayFallback(); // Use fallback if translations aren't ready for this lang
            return;
        }

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            const translationValue = translations[currentLanguage]?.[key];

            if (translationValue !== undefined) {
                if (element.hasAttribute('data-translate-html')) {
                    element.innerHTML = translationValue; // For elements with HTML in translation
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
                        element.placeholder = translationValue;
                    } else if (element.value !== undefined && element.hasAttribute('data-translate-value')) {
                         element.value = translationValue; // For pre-filling input values if needed
                    } else {
                        // Fallback for inputs if no specific attribute for translation type
                        element.textContent = translationValue; 
                    }
                } else if (element.tagName === 'META' && element.name) { // For meta tags
                    element.content = translationValue;
                } else if (element.tagName === 'META' && element.getAttribute('property')) { // For OpenGraph meta tags
                     element.content = translationValue;
                } else if (element.tagName === 'TITLE') {
                    document.title = translationValue;
                } else {
                    element.textContent = translationValue;
                }

                // Specific for ARIA labels or titles if they also have a translate key
                if (element.hasAttribute('aria-label') && element.hasAttribute('data-translate-key-aria-label')) {
                     element.setAttribute('aria-label', translationValue);
                }
                if (element.hasAttribute('title') && element.hasAttribute('data-translate-key-title')) {
                     element.setAttribute('title', translationValue);
                }

            } else {
                 // console.warn(`Translation key '${key}' not found for language '${currentLanguage}'.`);
            }
        });

        if (languageToggleButton) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                 const switchToLang = currentLanguage === 'ar' ? 'en' : 'ar';
                 // Try to get the button text from translations, otherwise default
                 langToggleTextElement.textContent = translations[switchToLang]?.lang_switch_text_short || (switchToLang === 'en' ? 'EN' : 'AR');
            }
        }
        
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        if(menuToggleBtn && menuToggleBtn.hasAttribute('data-translate-key') && translations[currentLanguage]?.[menuToggleBtn.getAttribute('data-translate-key')]) {
            const label = translations[currentLanguage][menuToggleBtn.getAttribute('data-translate-key')];
            menuToggleBtn.setAttribute('aria-label', label);
            menuToggleBtn.setAttribute('title', label);
        }
        
        updateDynamicTextFallbacks(currentLanguage); // Ensure dynamic texts are also updated
        observeFadeInElements(); // Re-observe elements if language change affects visibility/layout
    }
    
    function updateDynamicTextFallbacks(lang) {
        // This function updates texts that are dynamically inserted by JS,
        // ensuring they also respect the current language if translations.json failed.
        const loadingEl = portfolioGrid?.querySelector('.loading-message');
        if (loadingEl && loadingEl.getAttribute('data-translate-key') === "loading_portfolio") {
            loadingEl.textContent = (translations[lang]?.loading_portfolio || (lang === 'ar' ? 'جاري تحميل أحدث إبداعاتنا...' : 'Loading our latest creations...'));
        }
        
        const noItemsEl = portfolioGrid?.querySelector('.no-portfolio-items-text');
        if (noItemsEl && noItemsEl.getAttribute('data-translate-key') === "no_portfolio_items") {
            noItemsEl.textContent = (translations[lang]?.no_portfolio_items || (lang === 'ar' ? 'لا توجد أعمال مميزة لعرضها حالياً.' : 'No featured works to display.'));
        }

        const form = document.getElementById('bookingForm');
        if (form) {
            const nameInput = form.querySelector('#name');
            const phoneInput = form.querySelector('#phone');
            if (nameInput && nameInput.getAttribute('data-translate-key') === "form_name_placeholder") {
                 nameInput.placeholder = translations[lang]?.form_name_placeholder || (lang === 'ar' ? 'الاسم الكريم' : 'Full Name');
            }
            if (phoneInput && phoneInput.getAttribute('data-translate-key') === "form_phone_placeholder") {
                 phoneInput.placeholder = translations[lang]?.form_phone_placeholder || (lang === 'ar' ? '01xxxxxxxxx' : '01xxxxxxxxx');
            }
        }
    }


    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
            if (Object.keys(translations).length === 0 || !translations[newLang]) {
                // Translations not loaded or target language missing, try loading first
                const loaded = await loadTranslations();
                if (loaded && translations[newLang]) {
                    setLanguage(newLang);
                } else {
                    // If still not available after trying to load, just switch dir and button text
                    currentLanguage = newLang; // Update currentLanguage state
                    localStorage.setItem('altaqwaLanguage', currentLanguage); // Save preference
                    setLanguageDisplayFallback(); // Apply minimal changes
                    console.warn(`لم يتم العثور على ترجمات للغة '${newLang}' بعد محاولة التحميل.`);
                }
            } else {
                // Translations already loaded and target language exists
                setLanguage(newLang);
            }
        });
    }

    // --- Mobile Menu ---
    const menuToggle = document.getElementById('menu-toggle-btn');
    const navLinksUl = document.getElementById('nav-links-ul');
    if (menuToggle && navLinksUl) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinksUl.classList.toggle('active');
            menuToggle.classList.toggle('active'); // For styling the toggle button itself if needed
            menuToggle.setAttribute('aria-expanded', isActive.toString());
            // Prevent body scroll when mobile menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close mobile menu when a link is clicked
        navLinksUl.querySelectorAll('a.nav-link').forEach(anchor => {
            anchor.addEventListener('click', function () {
                if (navLinksUl.classList.contains('active')) {
                    navLinksUl.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = ''; // Restore body scroll
                }
            });
        });
    }

    // --- Update Copyright Year ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // --- <<<<< ------ بداية قسم الـ Lightbox المُعدل ------ >>>>> ---
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCloseButton = lightbox?.querySelector('.lightbox-close');

    function openLightbox(imgSrc, captionText) {
        if (lightbox && lightboxImg && lightboxCaption) {
            lightbox.style.display = "flex"; // Using flex for centering defined in CSS
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = captionText || (translations[currentLanguage]?.default_image_caption || "صورة مكبرة");
            document.body.classList.add('lightbox-open'); // <<-- مُعدل: إضافة كلاس للـ body
            if (lightbox.focus) lightbox.focus(); // For accessibility (Escape key to close)
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = "none";
            document.body.classList.remove('lightbox-open'); // <<-- مُعدل: إزالة الكلاس من الـ body
        }
    }

    if(lightboxCloseButton) {
        lightboxCloseButton.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        // Close lightbox when clicking on the background (the lightbox element itself)
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) { 
                closeLightbox();
            }
        });
    }
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && lightbox && lightbox.style.display === "flex") { // Check for flex as it's set in openLightbox
            closeLightbox();
        }
    });
    // --- <<<<< ------ نهاية قسم الـ Lightbox المُعدل ------ >>>>> ---

    // --- Portfolio Section Logic (with Load More and Lightbox integration) ---
    const portfolioGrid = document.getElementById('portfolioGrid');
    const loadMorePortfolioButton = document.getElementById('loadMorePortfolio');
    const portfolioControlsContainer = document.querySelector('.portfolio-controls');

    let allPortfolioImages = []; 
    let currentlyDisplayedImagesCount = 0;
    const imagesPerLoad = 6; 

    async function fetchPortfolioImages() {
        // !! هام: تأكد أن هذا الرابط صحيح ويعمل لديك على Termux
        // إذا كان الباك اند على نفس الجهاز الذي تفتح منه المتصفح، localhost مناسب
        const backendBaseUrl = 'http://127.0.0.1:5000'; // أو http://localhost:5000
        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`;
        console.log(`INFO: محاولة جلب الصور من: ${apiUrl}`);

        if(portfolioGrid && !portfolioGrid.querySelector('.loading-message')) { // Add loading message if not present
             portfolioGrid.innerHTML = `<p class="loading-message" data-translate-key="loading_portfolio">${translations[currentLanguage]?.loading_portfolio || (currentLanguage === 'ar' ? 'جاري تحميل...' : 'Loading...')}</p>`;
        }
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorDetail = `فشل الاتصال بالخادم (الحالة: ${response.status} ${response.statusText})`;
                try { 
                    const errJson = await response.json(); 
                    if (errJson && errJson.error) errorDetail = errJson.error; 
                } catch (e) { 
                    const errText = await response.text(); 
                    if (errText) errorDetail = errText.substring(0, 300); 
                }
                throw new Error(errorDetail);
            }
            const images = await response.json();
            if (!Array.isArray(images)) {
                throw new Error("التنسيق المستلم من الخادم لبيانات الصور غير صحيح (يجب أن يكون مصفوفة).");
            }
            
            allPortfolioImages = images; // Store all fetched images
            currentlyDisplayedImagesCount = 0; // Reset count
            if(portfolioGrid) portfolioGrid.innerHTML = ''; // Clear loading message or old items
            appendPortfolioImages(); // Display initial set
            
        } catch (error) {
            console.error("فشل كلي في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                const errorKey = "portfolio_load_error";
                const fallbackMessage = `عفواً، حدث خطأ أثناء تحميل صور الأعمال.<br> (${error.message})`;
                portfolioGrid.innerHTML = `<p class="error-message portfolio-load-error-text" data-translate-key="${errorKey}">${(translations[currentLanguage]?.[errorKey]?.replace('{errorMessage}', error.message)) || fallbackMessage}</p>`;
            }
            if(portfolioControlsContainer) portfolioControlsContainer.style.display = 'none'; // Hide load more button on error
        }
    }

    function appendPortfolioImages() {
        if (!portfolioGrid || !allPortfolioImages) return;

        const startIndex = currentlyDisplayedImagesCount;
        const endIndex = startIndex + imagesPerLoad;
        const imagesToDisplayThisLoad = allPortfolioImages.slice(startIndex, endIndex);

        if (imagesToDisplayThisLoad.length === 0 && startIndex === 0 && allPortfolioImages.length === 0) {
            // This means fetchPortfolioImages returned an empty array initially
            const noItemsKey = "no_portfolio_items";
            const fallbackMessage = "لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا!";
            portfolioGrid.innerHTML = `<p class="text-center no-portfolio-items-text" style="padding: 2rem 0;" data-translate-key="${noItemsKey}">${translations[currentLanguage]?.[noItemsKey] || fallbackMessage}</p>`;
            if(portfolioControlsContainer) portfolioControlsContainer.style.display = 'none';
            return;
        }

        imagesToDisplayThisLoad.forEach((imageInfo, localIndex) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll'); // Added fade-in for items
            // Delay animation for staggered effect
            portfolioItem.style.setProperty('--animation-delay', `${(localIndex) * 100}ms`);


            const imgElement = document.createElement('img');
            // Prepend backendBaseUrl if imageUrl is relative (e.g., /uploads/image.jpg)
            // If imageUrl from backend is already absolute, this is not needed.
            // Assuming imageInfo.imageUrl is like "uploads/filename.jpg" from backend
            const backendBaseUrlForImage = 'http://127.0.0.1:5000'; // Make sure this matches your backend serving static files
            imgElement.src = imageInfo.imageUrl.startsWith('http') ? imageInfo.imageUrl : `${backendBaseUrlForImage}/${imageInfo.imageUrl.replace(/^\//, '')}`;
            
            const altText = imageInfo.caption || (translations[currentLanguage]?.default_image_alt || "أحد أعمال شركة التقوى للمطابخ");
            imgElement.alt = altText;
            imgElement.loading = "lazy"; // Lazy load images
            
            imgElement.onload = () => imgElement.classList.add('loaded'); // For CSS opacity transition
            imgElement.onerror = () => {
                imgElement.alt = translations[currentLanguage]?.image_load_error_alt || "حدث خطأ أثناء تحميل هذه الصورة";
                // You can set a placeholder error image here if you have one
                // imgElement.src = 'images/placeholder-kitchen-error.png'; 
                imgElement.classList.add('loaded'); // Still add loaded to trigger any style changes
            };
            
            // Event listener to open lightbox when image is clicked
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

        // Show or hide "Load More" button
        if (loadMorePortfolioButton && portfolioControlsContainer) {
            if (currentlyDisplayedImagesCount >= allPortfolioImages.length) {
                loadMorePortfolioButton.style.display = 'none'; // All images loaded
                 if(allPortfolioImages.length > 0) { // Only hide container if there were images
                    // Optional: you might want to keep the container visible for consistent layout or add a "no more images" message
                 } else {
                     portfolioControlsContainer.style.display = 'none'; // No images at all
                 }
            } else {
                loadMorePortfolioButton.style.display = 'inline-block';
                portfolioControlsContainer.style.display = 'block'; // Ensure container is visible
            }
        }
        observeFadeInElements(); // Re-observe for newly added items
    }

    if (loadMorePortfolioButton) {
        loadMorePortfolioButton.addEventListener('click', appendPortfolioImages);
    }

    // --- Booking Form Submission ---
    const bookingForm = document.getElementById('bookingForm');
    const formMessage = document.getElementById('form-message');
    if (bookingForm && formMessage) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formMessage.innerHTML = ''; // Clear previous messages
            formMessage.className = 'form-message'; // Reset class

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim(); // Optional
            const notes = document.getElementById('notes').value.trim(); // Optional

            if (!name || !phone) {
                formMessage.textContent = translations[currentLanguage]?.validation_name_phone_required || 'يرجى إدخال الاسم ورقم الموبايل.';
                formMessage.classList.add('error');
                return;
            }
            
            // Placeholder for actual form submission (e.g., via fetch to a backend)
            console.log("بيانات طلب الحجز (للاختبار):", { name, phone, address, notes });
            formMessage.textContent = translations[currentLanguage]?.booking_success_message || 'شكراً لك! تم استلام طلبك بنجاح. سنتواصل معك قريباً.';
            formMessage.classList.add('success');
            bookingForm.reset(); // Clear form after (mock) submission
        });
    }

    // --- Scroll Animations ---
    function observeFadeInElements() {
        const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-on-scroll');
        if (!("IntersectionObserver" in window)) {
            // Fallback for older browsers
            fadeInElements.forEach(el => {
                el.classList.add('is-visible'); // Make them visible directly
                 if(el.classList.contains('fade-in-up')) el.classList.add('visible'); // Specific class for fade-in-up
            });
            return;
        }

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    if(entry.target.classList.contains('fade-in-up')) entry.target.classList.add('visible');
                    observerInstance.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        fadeInElements.forEach(el => {
            // Apply animation delay from data-attribute or inline style if present
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) el.style.transitionDelay = delay;
            observer.observe(el);
        });
    }
    
    // --- Initializations ---
    async function initializePage() {
        const translationsLoaded = await loadTranslations(); // Load translations first
        if (translationsLoaded) {
            setLanguage(currentLanguage); // Apply language based on loaded translations
        } else {
            // If translations failed to load, setLanguageDisplayFallback would have been called.
            // We might still want to try applying language to ensure texts are updated if some default keys exist
            setLanguage(currentLanguage); 
        }
        if (portfolioGrid) { // Fetch portfolio images after translations are attempted
            fetchPortfolioImages();
        }
        observeFadeInElements(); // Initial call for elements visible on load
    }

    initializePage();

});
