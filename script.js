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
    let currentLanguage = localStorage.getItem('altaqwaLanguage') || 'ar';
    let translations = {}; // سيتم ملؤها من translations.json

    async function loadTranslations() {
        try {
            const response = await fetch('translations.json'); // تأكد أن مسار هذا الملف صحيح
            if (!response.ok) {
                console.error('فشل تحميل ملف الترجمة. الحالة:', response.status, response.statusText);
                setLanguageDisplayFallback(); // عرض الأزرار بلغة افتراضية
                return; // لا يمكن المتابعة بدون ملف الترجمة
            }
            translations = await response.json();
            setLanguage(currentLanguage); // طبق اللغة الحالية بعد تحميل الترجمات
        } catch (error) {
            console.error('خطأ في تحميل أو تحليل ملف الترجمة:', error);
            setLanguageDisplayFallback(); // عرض الأزرار بلغة افتراضية
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
        // قد تحتاج لتحديث أي عناصر أخرى تعتمد على اللغة هنا إذا فشل تحميل الترجمة
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('altaqwaLanguage', currentLanguage);
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        if (Object.keys(translations).length === 0 || !translations[currentLanguage]) {
            console.warn(`ملف الترجمة لم يتم تحميله أو أن اللغة '${lang}' غير موجودة. لن يتم تطبيق الترجمة الكاملة.`);
            setLanguageDisplayFallback();
             // إذا كان portfolioGrid موجوداً، حاول تحديث نصوصه الافتراضية هنا أيضاً
            if (portfolioGrid && portfolioGrid.querySelector('.loading-message')) {
                portfolioGrid.querySelector('.loading-message').textContent = lang === 'ar' ? 'جاري تحميل أحدث إبداعاتنا...' : 'Loading our latest creations...';
            }
            if (portfolioGrid && portfolioGrid.querySelector('.no-portfolio-items-text')) {
                portfolioGrid.querySelector('.no-portfolio-items-text').textContent = lang === 'ar' ? 'لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!' : 'No featured works to display currently. Stay tuned for our new additions!';
            }
            return;
        }

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[currentLanguage] && translations[currentLanguage][key] !== undefined) {
                const translationValue = translations[currentLanguage][key];
                if (element.innerHTML.includes('<span') || element.innerHTML.includes('<br')) {
                    // إذا كان المحتوى معقد (يحتوي على HTML)، استبدل المحتوى بالكامل
                    element.innerHTML = translationValue;
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
                        element.placeholder = translationValue;
                    } else if (element.value !== undefined && element.type !== 'submit' && element.type !== 'button') { // لا تترجم قيمة أزرار الإرسال هنا
                        // element.value = translationValue; // كن حذراً مع ترجمة قيم الحقول
                    }
                } else {
                    // لمعظم العناصر النصية البسيطة
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

        if (languageToggleButton && translations.ar && translations.en) {
            const langToggleTextElement = languageToggleButton.querySelector('span');
            if (langToggleTextElement) {
                 langToggleTextElement.textContent = currentLanguage === 'ar' ? (translations.en.lang_switch_text_short || 'EN') : (translations.ar.lang_switch_text_short || 'AR');
            }
        }
        observeFadeInElements(); // استدعاء لتأثيرات الدخول بعد تغيير اللغة
    }

    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', () => {
            const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
            // تأكد أن الترجمات محملة قبل التبديل
            if (Object.keys(translations).length > 0 && translations[newLang]) {
                setLanguage(newLang);
            } else {
                // إذا لم تكن الترجمات محملة أو اللغة الجديدة غير موجودة، حاول تحميلها ثم التبديل
                loadTranslations().then(() => {
                    if (Object.keys(translations).length > 0 && translations[newLang]) {
                         setLanguage(newLang);
                    } else {
                        // إذا فشل التحميل أو اللغة ما زالت غير موجودة، فقط غير لغة العرض الافتراضية
                        currentLanguage = newLang;
                        localStorage.setItem('altaqwaLanguage', currentLanguage);
                        setLanguageDisplayFallback();
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
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // منع الـ scroll للجسم عند فتح القائمة
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }
    // إغلاق القائمة عند الضغط على رابط فيها (مفيد للصفحات ذات القسم الواحد)
    if (navLinks) {
        navLinks.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // لا تغلق القائمة إذا كان الرابط هو زر تغيير اللغة أو الثيم
                if (this.id === 'language-toggle-link' || this.id === 'theme-toggle') return;

                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = ''; // إعادة الـ scroll للجسم
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
        // استخدام مفتاح ترجمة هنا أيضاً
        portfolioGrid.innerHTML = `<p class="loading-message" data-translate-key="loading_portfolio">جاري تحميل أحدث إبداعاتنا...</p>`;
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        // !!! هام جداً: تأكد أن هذا الـ IP والـ Port صحيحان للباك اند الذي يعمل على تيرمكس !!!
        // !!! إذا كنت تجرب الفرونت اند من نفس الموبايل الذي عليه تيرمكس، استخدم 'http://localhost:5000' !!!
        // !!! إذا كنت تجرب من جهاز آخر على نفس شبكة الواي فاي، استخدم الـ IP المحلي لموبايلك (مثل 192.168.X.X:5000) !!!
        const backendBaseUrl = 'http://192.168.1.4:5000'; // <--- هذا هو الـ IP الذي ظهر لك سابقاً، تأكد منه!
                                                       // أو استخدم 'http://localhost:5000' للتجربة من نفس الموبايل

        const apiUrl = `${backendBaseUrl}/api/get-my-kitchen-images`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json', // نطلب JSON
                }
            });

            if (!response.ok) {
                let errorData = { message: `فشل الاتصال بالخادم لجلب الصور (الحالة: ${response.status})` };
                try {
                    // محاولة قراءة رسالة الخطأ من الخادم إذا كانت JSON
                    const errJson = await response.json();
                    if (errJson && errJson.error) errorData.message = errJson.error;
                } catch (e) {
                    // إذا لم تكن رسالة الخطأ JSON، استخدم النص العادي من الرد
                    const errText = await response.text();
                    if (errText) errorData.message = errText;
                    console.warn("رسالة الخطأ من الخادم لم تكن JSON:", errText);
                }
                throw new Error(errorData.message);
            }

            const images = await response.json(); // نتوقع أن الخادم يرجع JSON

            if (!Array.isArray(images)) {
                console.error("البيانات المستلمة من الخادم بخصوص الصور ليست مصفوفة:", images);
                throw new Error("التنسيق المستلم من الخادم لبيانات الصور غير صحيح.");
            }
            renderPortfolioImages(images); // لا نحتاج لتمرير backendBaseUrl هنا لأن الـ API يرجع روابط كاملة

        } catch (error) {
            console.error("فشل في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                 // استخدم مفتاح ترجمة إذا أردت
                 portfolioGrid.innerHTML = `<p class="error-message" data-translate-key="portfolio_load_error">عفواً، حدث خطأ أثناء تحميل صور الأعمال من الخادم.<br> (${error.message})</p>`;
                 setLanguage(currentLanguage); // أعد تطبيق الترجمة
            }
        }
    }

    function renderPortfolioImages(images) {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = ''; // مسح رسالة التحميل أو أي محتوى قديم

        if (images.length === 0) {
            portfolioGrid.innerHTML = `<p class="text-center no-portfolio-items-text" style="padding: 2rem 0;" data-translate-key="no_portfolio_items">لا توجد أعمال مميزة لعرضها حالياً. ترقبوا جديدنا قريباً!</p>`;
            setLanguage(currentLanguage); // أعد تطبيق الترجمة
            return;
        }

        images.forEach((imageInfo, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            // لتأثير الدخول المتتابع
            portfolioItem.style.setProperty('--animation-delay', `${index * 100}ms`);

            const imgElement = document.createElement('img');
            // بما أن imageInfo.imageUrl أصبح الرابط الكامل من الـ API (بفضل _external=True في Flask)
            // نستخدمه مباشرة
            imgElement.src = imageInfo.imageUrl || 'images/placeholder-kitchen.png'; // صورة احتياطية
            imgElement.alt = imageInfo.caption || "مطبخ من تصميم شركة التقوى"; // استخدم مفتاح ترجمة لو أمكن
            imgElement.loading = "lazy"; // لتحسين الأداء
            imgElement.onload = () => imgElement.classList.add('loaded'); // لإضافة تأثير بعد التحميل لو أردت
            imgElement.onerror = () => { // في حالة فشل تحميل الصورة
                imgElement.alt = "حدث خطأ أثناء تحميل هذه الصورة"; // استخدم مفتاح ترجمة
                imgElement.src = 'images/placeholder-kitchen-error.png'; // صورة خطأ احتياطية
                imgElement.classList.add('loaded'); // لإزالة أي spinners أو placeholders
            };

            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || "تصميم مطابخ التقوى"; // استخدم مفتاح ترجمة لو أمكن

            portfolioItem.appendChild(imgElement);
            portfolioItem.appendChild(captionElement);
            portfolioGrid.appendChild(portfolioItem);
        });
        observeFadeInElements(); // استدعاء لتأثيرات الدخول للعناصر الجديدة
        // لا داعي لـ setLanguage هنا إلا إذا كانت العناصر الجديدة نفسها تحتوي على data-translate-key
        // وكان من المفترض أن يتم ترجمتها مباشرة عند الإنشاء لو كانت مفاتيح الترجمة موضوعة عليها
    }

    // --- الجزء الخاص بطلبات الحجز (كما هو في كودك، أو يمكنك تعديله ليرسل للباك اند) ---
    const bookingForm = document.getElementById('bookingForm');
    const formMessage = document.getElementById('form-message'); // الرسالة التي تظهر بعد الإرسال

    if (bookingForm && formMessage) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // منع الإرسال التقليدي للفورم

            // مسح أي رسائل سابقة وإعادة الـ class
            formMessage.innerHTML = '';
            formMessage.className = 'form-message'; // افترض أن هذا هو الـ class الأساسي

            // جلب البيانات من الحقول
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const notes = document.getElementById('notes').value.trim();

            // التحقق من الحقول الإلزامية
            if (!name || !phone) {
                // استخدم مفتاح ترجمة هنا إذا أردت
                formMessage.textContent = translations[currentLanguage]?.validation_name_phone_required || 'يرجى إدخال الاسم ورقم الموبايل، فهما حقلان إلزاميان.';
                formMessage.classList.add('error'); // افترض أن لديك class اسمه error للرسائل الخاطئة
                return;
            }

            // طباعة البيانات في الـ console (للتجربة)
            console.log("بيانات طلب الحجز (سيتم إرسالها للباك اند لاحقاً إذا أردت):", { name, phone, address, notes });

            // عرض رسالة نجاح للمستخدم (مؤقتة، يمكنك تعديلها لترسل البيانات فعلياً)
            // استخدم مفتاح ترجمة هنا إذا أردت
            formMessage.textContent = translations[currentLanguage]?.booking_success_message || 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success'); // افترض أن لديك class اسمه success للرسائل الناجحة

            bookingForm.reset(); // مسح حقول الفورم بعد الإرسال الناجح

            /*
            // ----- مثال لكيفية إرسال البيانات للباك اند (إذا عملت API للحجز) -----
            // const formData = { name, phone, address, notes };
            // const bookingApiUrl = 'http://192.168.1.4:5000/api/submit-booking-request'; // افترض أن هذا هو الـ API

            // // إظهار رسالة "جاري الإرسال..."
            // formMessage.textContent = translations[currentLanguage]?.booking_sending_message || 'جاري إرسال طلبك...';
            // formMessage.classList.remove('error', 'success'); // إزالة أي classes سابقة

            // fetch(bookingApiUrl, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => {
            //     if (!response.ok) {
            //         // محاولة قراءة رسالة الخطأ من الخادم
            //         return response.json().then(err => { throw new Error(err.message || `خطأ ${response.status}`) });
            //     }
            //     return response.json(); // افترض أن الخادم يرجع رسالة نجاح
            // })
            // .then(data => {
            //     formMessage.textContent = data.message || translations[currentLanguage]?.booking_success_message || 'تم إرسال طلبك بنجاح!';
            //     formMessage.classList.add('success');
            //     bookingForm.reset();
            // })
            // .catch(error => {
            //     console.error('خطأ في إرسال طلب الحجز:', error);
            //     formMessage.textContent = error.message || translations[currentLanguage]?.booking_error_message || 'عفواً، حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.';
            //     formMessage.classList.add('error');
            // });
            */
        });
    }

    // --- دالة مراقبة العناصر لتأثيرات الدخول عند الـ scroll ---
    function observeFadeInElements() {
        const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-on-scroll');

        // إذا كان المتصفح لا يدعم IntersectionObserver، أظهر كل العناصر مباشرة
        if (!("IntersectionObserver" in window)) {
            fadeInElements.forEach(el => {
                el.classList.add('is-visible'); // اجعلها مرئية
                 if(el.classList.contains('fade-in-up')) el.classList.add('visible'); // للأنيميشن الإضافي
            });
            return;
        }

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    if(entry.target.classList.contains('fade-in-up')) entry.target.classList.add('visible');
                    observerInstance.unobserve(entry.target); // أوقف المراقبة بعد ظهور العنصر
                }
            });
        }, { threshold: 0.05 }); // يظهر العنصر عندما يكون 5% منه مرئياً

        fadeInElements.forEach(el => {
            // تطبيق الـ delay إذا كان موجوداً كـ data attribute أو style property
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) {
                el.style.transitionDelay = delay;
            }
            observer.observe(el);
        });
    }

    // --- استدعاء تحميل الترجمات عند تحميل الصفحة لأول مرة ---
    loadTranslations(); // مهم جداً لبدء نظام الترجمة

});
