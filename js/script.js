// إدارة القائمة المتنقلة
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// إدارة الكوكيز
const cookieBanner = document.getElementById('cookie-consent');

function checkCookies() {
    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.classList.add('visible');
    }
}

document.getElementById('accept-cookies').addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.classList.remove('visible');
});

document.getElementById('reject-cookies').addEventListener('click', () => {
    cookieBanner.classList.remove('visible');
});

// التمرير السلس
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Lazy Load للصور
const lazyImages = document.querySelectorAll('.lazy-image');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy-image');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// إرسال النموذج
document.querySelector('.contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('https://api.example.com/contact', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('تم إرسال طلبك بنجاح!');
            e.target.reset();
        } else {
            throw new Error('فشل في الإرسال');
        }
    } catch (error) {
        alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
});

// تهيئة الموقع
document.addEventListener('DOMContentLoaded', () => {
    checkCookies();
    
    // إضافة أنيميشن للبطاقات
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});
