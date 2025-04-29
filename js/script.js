document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery-grid');
  const prefix = 'images/';    // تأكد إنه هذا المسار بالضبط

  // لو ما عندكش WebP، احذف سطر الـ<source> وخلي الـ<img> لوحده
  for (let i = 1; i <= 32; i++) {
    const pic = document.createElement('picture');
    pic.innerHTML = `
      <img src="${prefix}Kitchen${i}.jpg" alt="مطابخ ألومنيوم مودرن ${i}" loading="lazy">
    `;
    gallery.appendChild(pic);
  }
});
