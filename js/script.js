document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery-grid');
    const prefix = 'images/';

    // Generate gallery images with lazy loading and fade-in
    for (let i = 1; i <= 32; i++) {
        const pic = document.createElement('picture');
        pic.classList.add('gallery-item');
        pic.innerHTML = `
            <img src="${prefix}Kitchen${i}.jpg" alt="مطابخ ألومنيوم مودرن ${i}" loading="lazy" class="lazyload">
            <source srcset="${prefix}Kitchen${i}.webp" type="image/webp">
            <img src="${prefix}Kitchen${i}.jpg" alt="مطابخ ألومنيوم مودرن ${i}" loading="lazy">
        `;
        gallery.appendChild(pic);
    }

    // Smooth scroll for nav links
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
