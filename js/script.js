document.addEventListener('DOMContentLoaded', () => {
  // تفعيل القائمة للهاتف
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-menu');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('show');
  });

  // توليد معرض الصور
  const gallery = document.querySelector('.gallery-grid');
  const prefix = 'images/';  // مسار الصور
  const totalImages = 32;
  for (let i = 1; i <= totalImages; i++) {
    const pic = document.createElement('picture');
    pic.innerHTML = `
      <source srcset="${prefix}Kitchen${i}.webp" type="image/webp">
      <img src="${prefix}Kitchen${i}.jpg" alt="مطابخ ألمنيوم مودرن ${i}" loading="lazy">
    `;
    gallery.appendChild(pic);
  }
});
