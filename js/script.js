// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  // Hamburger toggle
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-menu');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('show');
  });

  // Generate gallery of 52 images
  const gallery = document.querySelector('.gallery-grid');
  for (let i = 1; i <= 52; i++) {
    const pic = document.createElement('picture');
    pic.innerHTML = `
      <source srcset="images/kitchen${i}.webp" type="image/webp">
      <img src="images/kitchen${i}.jpg" alt="مطابخ ألمنيوم مودرن ${i}" loading="lazy">
    `;
    gallery.appendChild(pic);
  }
});
