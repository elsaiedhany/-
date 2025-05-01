document.addEventListener('DOMContentLoaded', () => {
  // إخفاء شاشة التحميل بعد تحميل الصفحة
  window.addEventListener('load', () => {
    document.getElementById('loading').close();
  });

  // توليد معرض الصور ديناميكيًا
  const galleryGrid = document.querySelector('.gallery-grid');
  for (let i = 1; i <= 37; i++) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img 
        data-src="images/Kitchen${i}.webp" 
        alt="تصميم مطبخ ألومنيوم مودرن ${i}"
        loading="lazy"
      >
    `;
    galleryGrid.appendChild(item);
  }

  // إدارة القائمة المتنقلة
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // إغلاق القائمة عند النقر خارجها
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu') && !e.target.closest('#menu-toggle')) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });

  // التمرير السلس للروابط
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  });

  // Lightbox مع إمكانية التنقل
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  document.body.appendChild(lightbox);
  
  let currentImageIndex = 0;
  const images = Array.from(document.querySelectorAll('.gallery-item img'));

  function showImage(index) {
    currentImageIndex = index;
    lightbox.innerHTML = `
      <img src="${images[index].src}" alt="${images[index].alt}">
      <div class="lightbox-nav">
        <button class="prev" aria-label="الصورة السابقة"><i class="fa-solid fa-chevron-right"></i></button>
        <button class="next" aria-label="الصورة التالية"><i class="fa-solid fa-chevron-left"></i></button>
      </div>
      <div class="image-counter">${index + 1} / ${images.length}</div>
    `;
    
    lightbox.querySelector('.prev').addEventListener('click', () => navigate(-1));
    lightbox.querySelector('.next').addEventListener('click', () => navigate(1));
    lightbox.classList.add('active');
  }

  function navigate(direction) {
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    showImage(currentImageIndex);
  }

  // فتح Lightbox عند النقر على الصورة
  document.querySelectorAll('.gallery-item img').forEach((img, index) => {
    img.addEventListener('click', () => showImage(index));
  });

  // إغلاق Lightbox عند النقر خارج الصورة
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });

  // التنقل في Lightbox باستخدام لوحة المفاتيح
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'Escape') lightbox.classList.remove('active');
    }
  });

  // Lazy Loading للصور مع Intersection Observer
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => img.style.opacity = '1';
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px',
    threshold: 0.1
  });

  document.querySelectorAll('.gallery-item img[data-src]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    observer.observe(img);
  });

  // إضافة تأثيرات AOS
  AOS.init({
    once: true,
    duration: 800,
    offset: 120,
    easing: 'ease-in-out-quad'
  });

  // تحسينات الأداء
  let timeout;
  window.addEventListener('scroll', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      AOS.refresh();
    }, 100);
  });

  // تحسينات الوصول
  document.querySelectorAll('img').forEach(img => {
    if (!img.alt) img.alt = 'صورة توضيحية لشركة التقوي للألومنيوم';
  });
});
