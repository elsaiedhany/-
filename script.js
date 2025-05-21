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
            // تأكد أن ملف translations.json موجود في نفس مستوى index.html
            const response = await fetch('translations.json'); 
            if (!response.ok) {
                console.error('فشل تحميل ملف الترجمة. الحالة:', response.status);
                // يمكنك عرض رسالة للمستخدم أو استخدام لغة افتراضية مدمجة إذا فشل التحميل
                // حالياً، سيكمل بدون ترجمة إذا فشل التحميل
                return;
            }
            translations = await response.json();
            setLanguage(currentLanguage); 
        } catch (error) {
            console.error('خطأ في تحميل أو تحليل ملف الترجمة:', error);
        }
    }

    function setLanguage(lang) {
        currentLanguage = lang; 
        localStorage.setItem('altaqwaLanguage', currentLanguage); 
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        if (Object.keys(translations).length === 0) {
            console.warn("ملف الترجمة لم يتم تحميله أو فارغ. لن يتم تطبيق الترجمة.");
            // تحديث نص زر اللغة حتى لو فشلت باقي الترجمات
            if (languageToggleButton) {
                const langToggleTextElement = languageToggleButton.querySelector('span');
                if (langToggleTextElement) {
                    langToggleTextElement.textContent = currentLanguage === 'ar' ? 'EN' : 'AR';
                }
            }
            return; // الخروج من الدالة إذا لم يتم تحميل الترجمات
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
            } else {
                // console.warn(`مفتاح الترجمة '${key}' غير موجود للغة '${currentLanguage}'`);
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
            if (Object.keys(translations).length > 0) { // فقط قم بتبديل اللغة إذا تم تحميل الترجمات
                setLanguage(newLang);
            } else {
                // إذا لم يتم تحميل الترجمات، حاول تحميلها مرة أخرى ثم قم بالتبديل
                loadTranslations().then(() => {
                    if (Object.keys(translations).length > 0) {
                         setLanguage(newLang);
                    } else {
                        // تغيير نص الزر يدوياً كحل احتياطي إذا فشل كل شيء
                        const langToggleTextElement = languageToggleButton.querySelector('span');
                        if (langToggleTextElement) {
                            langToggleTextElement.textContent = newLang === 'ar' ? 'AR' : 'EN';
                        }
                         document.documentElement.lang = newLang;
                         document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                    }
                });
            }
        });
    }
    
    // --- قائمة التنقل المتجاوبة ---
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
    
    // --- تحديث سنة الحقوق ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- جلب وعرض صور الأعمال ---
    const portfolioGrid = document.getElementById('portfolioGrid'); // تأكد أن هذا العنصر موجود في HTML

    if (portfolioGrid) {
        portfolioGrid.innerHTML = '<p class="loading-message">جاري تحميل أحدث إبداعاتنا...</p>';
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        // !!! هام جداً يا سعيد: 
        // !!! استبدل 'YOUR_PHONE_IP_OR_SERVER_URL' بعنوان IP الخاص بهاتفك (الذي يشغل Termux)
        // !!! أو عنوان السيرفر الحقيقي إذا رفعت الباك إند على استضافة.
        // !!! وتأكد أن البورت (5000) صحيح أو غيره إذا استخدمت بورت مختلف.
        const backendBaseUrl = 'http://YOUR_PHONE_IP_OR_SERVER_URL:5000'; // <--- عدّل هذا
        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`; 

        // بيانات وهمية للاختبار إذا لم يكن الباك إند جاهزاً (علّقها أو احذفها عند ربط الباك إند الفعلي)
        const mockImages = [ 
             { imageUrl: "https://via.placeholder.com/450x350/121212/d4af37?text=مطبخ+وهمي+1", caption: "وصف تجريبي لمطبخ وهمي 1" },
             { imageUrl: "https://via.placeholder.com/450x350/d4af37/121212?text=مطبخ+وهمي+2", caption: "وصف تجريبي لمطبخ وهمي 2" }
        ];
        // --- نهاية البيانات الوهمية ---

        try {
            // --- لاستخدام الـ API الحقيقي، أزل التعليق من الأسطر التالية ---
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorData = { message: `فشل الاتصال بالخادم لجلب الصور: ${response.status}` };
                try {
                    const errJson = await response.json();
                    if (errJson && errJson.error) errorData.message = errJson.error;
                } catch (e) { /* لا مشكلة إذا لم يكن الخطأ JSON */ }
                throw new Error(errorData.message);
            }
            const images = await response.json(); 
            // --- نهاية جزء الـ API الحقيقي ---

            // --- لاستخدام البيانات الوهمية مؤقتاً (علّق أو احذف هذا السطر عند استخدام الـ API الحقيقي) ---
            // const images = await new Promise(resolve => setTimeout(() => resolve(mockImages), 500));
            // --- نهاية استخدام البيانات الوهمية ---
            
            if (!Array.isArray(images)) {
                throw new Error("البيانات المستلمة من الخادم بخصوص الصور ليست بالتنسيق المتوقع (مصفوفة).");
            }
            renderPortfolioImages(images, backendBaseUrl); // تمرير backendBaseUrl هنا

        } catch (error) {
            console.error("فشل في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) { 
                 portfolioGrid.innerHTML = `<p class="error-message">عفواً، حدث خطأ أثناء تحميل صور الأعمال من السيرفر.<br> (${error.message})</p>`;
            }
        }
    }

    function renderPortfolioImages(images, backendBaseUrl) { // استقبال backendBaseUrl
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
            
            // تعديل هام: التأكد من أن imageUrl هو مسار نسبي من الباك إند
            // إذا كان imageUrl بالفعل يحتوي على /uploads/filename.jpg
            // فإننا نحتاج لجمع المسار الكامل باستخدام backendBaseUrl
            // أما إذا كان الباك إند يرجع مساراً كاملاً، فهذا السطر لا يحتاج تعديل كبير
            if (imageInfo.imageUrl.startsWith('/uploads/')) { // نفترض أن الباك إند يرجع مساراً يبدأ بـ /uploads/
                imgElement.src = `${backendBaseUrl}${imageInfo.imageUrl}`;
            } else {
                // إذا كان الباك إند يرجع رابطاً كاملاً للصورة (مثلاً من خدمة تخزين سحابي)
                imgElement.src = imageInfo.imageUrl; 
            }
            
            imgElement.alt = imageInfo.caption || "مطبخ من تصميم شركة التقوى";
            imgElement.loading = "lazy"; 
            
            imgElement.onload = () => {
                imgElement.classList.add('loaded');
            }
            imgElement.onerror = () => { 
                imgElement.alt = "حدث خطأ أثناء تحميل هذه الصورة";
                // يمكنك هنا وضع صورة placeholder للخطأ إذا أردت
                // مثال: imgElement.src = 'images/image-error-placeholder.png'; // صورة محلية
                // imgElement.classList.add('loaded'); 
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

    // --- التعامل مع نموذج الحجز ---
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
            
            // محاكاة إرسال ناجح للبيانات (لأغراض العرض فقط حالياً)
            console.log("بيانات طلب الحجز:", { name, phone, address, notes });
            formMessage.textContent = 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset(); 

            // لإرسال فعلي للباك إند (عندما يكون جاهزًا):
            /*
            const formData = { name, phone, address, notes };
            const bookingApiUrl = 'http://YOUR_PHONE_IP_OR_SERVER_URL:5000/api/submit-booking-request'; // <--- عدّل هذا
            fetch(bookingApiUrl, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || `خطأ من الخادم: ${response.status}`);
                    }).catch(() => { 
                        throw new Error(`خطأ من الخادم: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) { 
                    formMessage.textContent = data.message || 'تم إرسال طلبك بنجاح!';
                    formMessage.classList.add('success');
                    bookingForm.reset();
                } else {
                    formMessage.textContent = data.message || 'حدث خطأ أثناء إرسال الطلب.';
                    formMessage.classList.add('error');
                }
            })
            .catch(error => {
                console.error('Error submitting booking form:', error);
                formMessage.textContent = `حدث خطأ في الشبكة أو الاتصال بالخادم. يرجى المحاولة مرة أخرى. (${error.message})`;
                formMessage.classList.add('error');
            });
            */
        });
    }

    // --- Intersection Observer للأنيميشن عند التمرير ---
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
        }, {
            threshold: 0.05 
        });

        fadeInElements.forEach(el => {
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) {
                el.style.transitionDelay = delay;
            }
            observer.observe(el);
        });
    }
    
    // استدعاء تحميل الترجمة عند بدء تشغيل الصفحة
    // هذا سيقوم بتطبيق اللغة ثم استدعاء observeFadeInElements داخلياً بعد تطبيق الترجمة
    loadTranslations(); 

});
