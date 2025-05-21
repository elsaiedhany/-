document.addEventListener('DOMContentLoaded', function() {
    
    // --- التحكم في الوضع الفاتح/الغامق ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    // جلب السمة من localStorage أو استخدام 'light' كافتراضي
    const currentTheme = localStorage.getItem('altaqwaTheme') || 'light'; 

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            if(themeIconMoon) themeIconMoon.style.display = 'none';
            if(themeIconSun) themeIconSun.style.display = 'inline-block';
        } else {
            if(themeIconMoon) themeIconMoon.style.display = 'inline-block';
            if(themeIconSun) themeIconSun.style.display = 'none';
        }
    }
    applyTheme(currentTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('altaqwaTheme', newTheme); // حفظ السمة المختارة
        });
    }

    // --- قائمة التنقل المتجاوبة ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // منع التمرير في body عند فتح القائمة
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // إغلاق القائمة عند الضغط على رابط فيها (مفيد لـ Single Page Applications أو التنقل الداخلي)
    if (navLinks) {
        navLinks.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = ''; // السماح بالتمرير مرة أخرى
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
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
        portfolioGrid.innerHTML = '<p class="loading-message">جاري تحميل أحدث إبداعاتنا...</p>';
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        // !!! هام جداً يا سعيد: 
        // !!! استبدل هذا الرابط بالرابط الفعلي لنقطة النهاية (API endpoint)
        // !!! التي ستنشئها في لوحة التحكم الخاصة بك (الباك إند).
        const apiUrl = '/api/altaqwa-kitchens/portfolio'; // <--- عدّل هذا الرابط 

        // بيانات وهمية للاختبار (احذفها أو علقها عند ربط الـ API الحقيقي)
        const mockImages = [
             { imageUrl: "https://via.placeholder.com/450x350/222831/d4af37?text=مطبخ+فخم+1", caption: "تصميم مودرن بخامات أوروبية فاخرة" },
             { imageUrl: "https://via.placeholder.com/450x350/d4af37/222831?text=مطبخ+أنيق+2", caption: "مطبخ كلاسيكي بلمسة عصرية راقية" },
             { imageUrl: "https://via.placeholder.com/450x350/333333/ffffff?text=مطبخ+عملي+3", caption: "استغلال ذكي للمساحات المحدودة بأناقة" },
             { imageUrl: "https://via.placeholder.com/450x350/503922/f0f0f0?text=مطبخ+خشبي+4", caption: "مطبخ خشبي بتفاصيل أنيقة ودافئة" }
        ];
        try {
            // لاستخدام البيانات الوهمية مؤقتاً:
            const images = await new Promise(resolve => setTimeout(() => resolve(mockImages), 1200));
            
            /* // لإلغاء البيانات الوهمية واستخدام الـ API الفعلي (أزل التعليق من هذا الجزء):
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`فشل الاتصال بالخادم لجلب الصور: ${response.status} ${response.statusText}`);
            }
            const images = await response.json(); 
            */

            if (!Array.isArray(images)) {
                throw new Error("البيانات المستلمة من الخادم بخصوص الصور ليست بالتنسيق المتوقع (يجب أن تكون مصفوفة).");
            }
            renderPortfolioImages(images);
        } catch (error) {
            console.error("فشل في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                 portfolioGrid.innerHTML = `<p class="error-message">عفواً، حدث خطأ أثناء تحميل صور الأعمال.<br> (${error.message})</p>`;
            }
        }
    }

    function renderPortfolioImages(images) {
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
            imgElement.src = imageInfo.imageUrl; 
            imgElement.alt = imageInfo.caption || "مطبخ من تصميم شركة التقوى للمطابخ";
            imgElement.loading = "lazy"; // تفعيل التحميل الكسول للصور (Lazy Loading)
            
            imgElement.onload = () => {
                imgElement.classList.add('loaded');
            }
            imgElement.onerror = () => { 
                imgElement.alt = "حدث خطأ أثناء تحميل هذه الصورة";
                // يمكنك هنا وضع صورة placeholder للخطأ إذا أردت
                // مثال: imgElement.src = 'images/image-error-placeholder.png';
                // imgElement.classList.add('loaded'); // لتحريك التأثير حتى لو كانت صورة خطأ
            };

            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || "تصميم مطابخ التقوى";

            portfolioItem.appendChild(imgElement);
            portfolioItem.appendChild(captionElement);
            portfolioGrid.appendChild(portfolioItem);
        });
        // مهم: إعادة تفعيل مراقب الـ Intersection Observer بعد إضافة العناصر الجديدة ديناميكياً
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
                formMessage.textContent = 'يرجى إدخال الاسم ورقم الموبايل، فهما حقلان إلزامیان.';
                formMessage.classList.add('error');
                return;
            }
            
            // محاكاة إرسال ناجح للبيانات (لأغراض العرض فقط حالياً)
            console.log("بيانات طلب الحجز:", { name, phone, address, notes });
            formMessage.textContent = 'شكراً جزيلاً لك! تم استلام طلبك بنجاح. سيقوم م. هاني الفقي بالتواصل معك في أقرب فرصة خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset(); // إفراغ حقول النموذج بعد الإرسال الناجح (الوهمي)

            // لإرسال فعلي للباك إند (عندما يكون جاهزًا):
            /*
            const formData = { name, phone, address, notes };
            fetch('/api/your-booking-endpoint', { // استبدل بالـ API endpoint الصحيح
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    // محاولة قراءة رسالة الخطأ من السيرفر إذا كانت موجودة
                    return response.json().then(errData => {
                        throw new Error(errData.message || `خطأ من الخادم: ${response.status}`);
                    }).catch(() => { // إذا لم تكن هناك بيانات JSON في الخطأ
                        throw new Error(`خطأ من الخادم: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) { // افترض أن الباك إند يعيد success: true
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
            // إذا كان المتصفح لا يدعم IntersectionObserver، أظهر كل العناصر مباشرة
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
            threshold: 0.1 
        });

        fadeInElements.forEach(el => {
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) {
                el.style.transitionDelay = delay;
            }
            observer.observe(el);
        });
    }
    observeFadeInElements(); // استدعاء أولي للمراقب

});
