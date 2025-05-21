document.addEventListener('DOMContentLoaded', function() {
    
    // --- قائمة التنقل المتجاوبة (Mobile Navigation) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const siteHeader = document.querySelector('.site-header');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active'); // لتغيير شكل أيقونة الهمبرجر
            // منع التمرير عند فتح القائمة (اختياري)
            // document.body.classList.toggle('no-scroll', navLinks.classList.contains('active'));
        });
    }

    // إغلاق القائمة عند الضغط على رابط فيها (لصفحات الـ Single Page)
    if (navLinks) {
        navLinks.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    // document.body.classList.remove('no-scroll');
                }
            });
        });
    }
    
    // --- تغيير خلفية الهيدر عند التمرير (اختياري) ---
    // window.addEventListener('scroll', function() {
    //     if (siteHeader) {
    //         if (window.scrollY > 50) {
    //             siteHeader.classList.add('scrolled');
    //         } else {
    //             siteHeader.classList.remove('scrolled');
    //         }
    //     }
    // });


    // --- تحديث سنة الحقوق تلقائيًا في الفوتر ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- جلب وعرض صور الأعمال الديناميكية ---
    const portfolioGrid = document.getElementById('portfolioGrid');

    if (portfolioGrid) {
        portfolioGrid.innerHTML = '<p class="loading-message">جاري تحميل أحدث الأعمال...</p>';
        fetchPortfolioImages();
    }

    async function fetchPortfolioImages() {
        // !!! هام جداً يا سعيد: 
        // !!! استبدل '/api/altaqwa/images' بالرابط الفعلي لنقطة النهاية (API endpoint)
        // !!! التي ستنشئها في لوحة التحكم الخاصة بك (الباك إند).
        const apiUrl = '/api/altaqwa/images'; // <--- عدّل هذا الرابط ليتناسب مع الباك إند عندك

        // مثال لبيانات صور وهمية لاختبار الواجهة الأمامية إذا لم يكن الباك إند جاهزاً بعد
        // يمكنك حذف هذا الجزء أو التعليق عليه عندما يكون الباك إند جاهزاً
        const mockImages = [
             { imageUrl: "https://via.placeholder.com/400x300/2c3e50/d4af37?text=مطبخ+مثال+1", caption: "تصميم مطبخ عصري - مثال" },
             { imageUrl: "https://via.placeholder.com/400x300/d4af37/2c3e50?text=مطبخ+مثال+2", caption: "مطبخ كلاسيكي فاخر - مثال" },
             { imageUrl: "https://via.placeholder.com/400x300/343a40/ffffff?text=مطبخ+مثال+3", caption: "استغلال المساحات الصغيرة - مثال" }
        ];
        // --- نهاية البيانات الوهمية ---

        try {
            // لإلغاء استخدام البيانات الوهمية واستخدام الـ API الفعلي:
            // 1. احذف أو علّق متغير mockImages أعلاه.
            // 2. أزل التعليق من الأسطر التالية التي تقوم بعمل fetch:
            /*
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`فشل الاتصال بالخادم: ${response.status} ${response.statusText}`);
            }
            const images = await response.json();
            */

            // لاستخدام البيانات الوهمية مؤقتاً (احذف هذا السطر عند استخدام الـ API الحقيقي):
            const images = await new Promise(resolve => setTimeout(() => resolve(mockImages), 1500)); // محاكاة تأخير الشبكة


            if (!Array.isArray(images)) {
                throw new Error("البيانات المستلمة من الخادم ليست بالتنسيق المتوقع (مصفوفة).");
            }
            renderPortfolioImages(images);

        } catch (error) {
            console.error("فشل في جلب أو عرض صور الأعمال:", error);
            if (portfolioGrid) {
                 portfolioGrid.innerHTML = `<p class="error-message">عفواً، لم نتمكن من تحميل صور الأعمال حالياً.<br> (${error.message})</p>`;
            }
        }
    }

    function renderPortfolioImages(images) {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = ''; // إفراغ رسالة التحميل أو المحتوى القديم

        if (images.length === 0) {
            portfolioGrid.innerHTML = '<p class="text-center" style="padding: 2rem 0;">لا توجد أعمال لعرضها حالياً. ترقبوا جديدنا!</p>';
            return;
        }

        images.forEach(imageInfo => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('portfolio-item');
            // تأثير ظهور تدريجي للعناصر (اختياري)
            // portfolioItem.style.opacity = '0'; 
            // portfolioItem.style.transform = 'translateY(20px)';
            // portfolioItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';


            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.imageUrl; 
            imgElement.alt = imageInfo.caption || "أحد أعمال شركة التقوى للمطابخ";
            
            imgElement.onload = () => {
                imgElement.classList.add('loaded');
                // لتأثير الظهور التدريجي
                // portfolioItem.style.opacity = '1';
                // portfolioItem.style.transform = 'translateY(0)';
            }
            imgElement.onerror = () => {
                imgElement.alt = "فشل تحميل الصورة";
                // يمكنك هنا وضع صورة احتياطية إذا أردت
                // imgElement.src = 'images/placeholder-image-error.png'; 
                // imgElement.classList.add('loaded'); // لتحريك التأثير حتى لو كانت صورة خطأ
            }

            const captionElement = document.createElement('div');
            captionElement.classList.add('portfolio-caption');
            captionElement.textContent = imageInfo.caption || "تصميم فريد من التقوى";

            portfolioItem.appendChild(imgElement);
            portfolioItem.appendChild(captionElement);
            portfolioGrid.appendChild(portfolioItem);
        });
    }

    // --- التعامل مع نموذج الحجز ---
    const bookingForm = document.getElementById('bookingForm');
    const formMessage = document.getElementById('form-message');

    if (bookingForm && formMessage) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // منع الإرسال التقليدي للنموذج
            formMessage.innerHTML = ''; // مسح أي رسائل سابقة
            formMessage.className = 'form-message'; // إعادة تعيين الكلاس

            // جمع بيانات النموذج (يمكنك إضافة المزيد من التحقق هنا)
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const notes = document.getElementById('notes').value.trim();

            if (!name || !phone) {
                formMessage.textContent = 'يرجى إدخال الاسم ورقم الموبايل.';
                formMessage.classList.add('error');
                return;
            }
            
            // هنا، ستقوم بإرسال هذه البيانات إلى الواجهة الخلفية (الباك إند)
            // التي ستنشئها لمعالجة طلبات الحجز (مثلاً عبر fetch API).
            // حالياً، سنعرض رسالة نجاح وهمية.

            console.log("بيانات النموذج:", { name, phone, address, notes });
            formMessage.textContent = 'شكراً لك! تم إرسال طلبك بنجاح. سيقوم م. هاني بالتواصل معك قريباً.';
            formMessage.classList.add('success');
            bookingForm.reset(); // إفراغ النموذج بعد الإرسال الناجح (الوهمي)

            // مثال لكيفية إرسال البيانات للباك إند (عندما يكون جاهزاً):
            /*
            fetch('/api/submit-booking', { // استبدل بالـ API endpoint الصحيح
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, address, notes })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    formMessage.textContent = 'تم إرسال طلبك بنجاح!';
                    formMessage.classList.add('success');
                    bookingForm.reset();
                } else {
                    formMessage.textContent = data.message || 'حدث خطأ أثناء إرسال الطلب.';
                    formMessage.classList.add('error');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
                formMessage.classList.add('error');
            });
            */
        });
    }

});
