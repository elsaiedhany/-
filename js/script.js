document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery-grid');
  const prefix = 'images/';

  // Generate gallery images with lazy loading and fade-in
  for (let i = 1; i <= 32; i++) {
    const pic = document.createElement('picture');
    pic.classList.add('gallery-item');
    pic.innerHTML = `
      <img src="${prefix}Kitchen${i}.jpg" alt="مطابخ ألومنيوم مودرن ${i}" loading="lazy">
    `;
    gallery.appendChild(pic);
  }

  // IntersectionObserver for fade-in effect
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  const onIntersect = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(onIntersect, observerOptions);
  document.querySelectorAll('.gallery-item').forEach(item => {
    observer.observe(item);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // close mobile menu if open
      const menuToggle = document.getElementById('menu-toggle');
      const navMenu = document.getElementById('nav-menu');
      if (menuToggle.classList.contains('open')) {
        menuToggle.classList.remove('open');
        navMenu.style.display = 'none';
      }
    });
  });

  // Hamburger toggle for mobile
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    if (navMenu.style.display === 'flex') {
      navMenu.style.display = 'none';
    } else {
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'column';
    }
  });

  // Back-to-top button
  const backBtn = document.createElement('button');
  backBtn.id = 'back-to-top';
  backBtn.innerHTML = '&#8679;';
  document.body.appendChild(backBtn);
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('show');
    } else {
      backBtn.classList.remove('show');
    }
  });

  // Lightbox for gallery images
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  document.body.appendChild(lightbox);
  lightbox.addEventListener('click', e => {
    if (e.target !== e.currentTarget) return;
    lightbox.classList.remove('active');
  });
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      lightbox.innerHTML = '';
      const imgClone = img.cloneNode();
      lightbox.appendChild(imgClone);
      lightbox.classList.add('active');
    });
  });

});
