document.addEventListener('DOMContentLoaded', function() {
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const siteHeader = document.querySelector('.site-header');

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
    
    // window.addEventListener('scroll', function() {
    //     if (siteHeader) {
    //         siteHeader.classList.toggle('scrolled', window.scrollY > 50);
    //     }
    // });

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
        const apiUrl = '/api/altaqwa/kitchen-gallery'; //  !!! عدّل هذا الرابط لباك إندك !!!
        const mockImages = [
             { imageUrl: "https://via.placeholder.com/450x350/222831/d4af37?text=مطبخ+التقوى+1", caption: "تصميم مودرن بخامات أوروبية" },
             { imageUrl: "https://via.placeholder.com/450x350/d4af37/222831?text=مطبخ+التقوى+2", caption: "مطبخ كلاسيكي بلمسة عصرية" },
             { imageUrl: "https://via.placeholder.com/450x350/333333/ffffff?text=مطبخ+التقوى+3", caption: "استغلال ذكي للمساحات المحدودة" },
             { imageUrl: "https://via.placeholder.com/450x350/503922/f0f0f0?text=مطبخ+التقوى+4", caption: "مطبخ خشبي بتفاصيل أنيقة" }
        ];

        try {
            // لاستخدام البيانات الوهمية (احذف هذا عند ربط الـ API الحقيقي):
            const images = await new Promise(resolve => setTimeout(() => resolve(mockImages), 1200));
            
            /* // لإلغاء البيانات الوهمية واستخدام الـ API الفعلي (أزل التعليق):
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`فشل الاتصال بالخادم: ${response.status}`);
            const images = await response.json();
            */

            if (!Array.isArray(images)) throw new Error("بيانات الصور غير صالحة.");
            renderPortfolioImages(images);
        } catch (error) {
            console.error("فشل تحميل صور الأعمال:", error);
            if (portfolioGrid) portfolioGrid.innerHTML = `<p class="error-message">عفواً، خطأ في تحميل الصور.<br> (${error.message})</p>`;
        }
    }

    function renderPortfolioImages(images) {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = ''; 

        if (images.length === 0) {
            portfolioGrid.innerHTML = '<p class="text-center" style="padding: 2rem 0;">لا توجد أعمال مميزة لعرضها حالياً.</p>';
            return;
        }

        images.forEach((imageInfo, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item', 'fade-in-on-scroll');
            // إضافة تأخير متزايد لعناصر البورتفوليو لمزيد من الجمالية
            portfolioItem.style.setProperty('--animation-delay', `${index * 150}ms`);


            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.imageUrl; 
            imgElement.alt = imageInfo.caption || "مطبخ من تصميم شركة التقوى";
            imgElement.loading = "lazy"; // تفعيل التحميل الكسول للصور
            
            imgElement.onload = () => imgElement.classList.add('loaded');
            imgElement.onerror = () => { 
                imgElement.alt = "خطأ في تحميل الصورة";
                // يمكنك وضع صورة placeholder للخطأ هنا
            };

            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || "تصميم مطابخ التقوى";

            portfolioItem.appendChild(imgElement);
            portfolioItem.appendChild(captionElement);
            portfolioGrid.appendChild(portfolioItem);
        });
        // إعادة تفعيل مراقب الـ Intersection Observer بعد إضافة العناصر الجديدة
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
            
            if (!name || !phone) {
                formMessage.textContent = 'الاسم ورقم الموبايل حقول إلزامية.';
                formMessage.classList.add('error');
                return;
            }
            
            // محاكاة إرسال ناجح
            console.log("بيانات الطلب:", { name, phone, address: document.getElementById('address').value.trim(), notes: document.getElementById('notes').value.trim() });
            formMessage.textContent = 'شكراً لاهتمامك! تم استلام طلبك بنجاح، وسيقوم م. هاني الفقي بالتواصل معك خلال 24 ساعة.';
            formMessage.classList.add('success');
            bookingForm.reset(); 

            // لإرسال فعلي للباك إند (عندما يكون جاهزًا)
            /*
            fetch('/api/booking-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
            // ... إلخ
            */
        });
    }

    // --- Intersection Observer للأنيميشن عند التمرير ---
    function observeFadeInElements() {
        const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-on-scroll');
        
        if (!fadeInElements.length) return;

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible'); // CSS class for visible state
                    if(entry.target.classList.contains('fade-in-up')) entry.target.classList.add('visible'); // old class for hero

                    observerInstance.unobserve(entry.target); // لإيقاف المراقبة بعد ظهور العنصر مرة واحدة
                }
            });
        }, {
            threshold: 0.1 // النسبة المئوية لظهور العنصر في الشاشة لتفعيل الأنيميشن
        });

        fadeInElements.forEach(el => {
            // تطبيق تأخير الأنيميشن إذا كان محدداً في data-delay
            const delay = el.dataset.delay || el.style.getPropertyValue('--animation-delay');
            if (delay) {
                el.style.transitionDelay = delay;
            }
            observer.observe(el);
        });
    }
    observeFadeInElements(); // استدعاء أولي للمراقب

});
