document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const ham     = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  ham.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    ham.classList.toggle('open');
  });

  // 2. Generate Gallery with Lazy Loading & WebP Fallback
  const gallery = document.getElementById('galleryGrid');
  for (let i = 1; i <= 30; i++) {
    const picture = document.createElement('picture');
    picture.classList.add('gallery__item');
    picture.innerHTML = `
      <source srcset="images/Kitchen${i}.webp" type="image/webp">
      <img src="images/Kitchen${i}.jpg" alt="مطابخ مودرن ${i}" loading="lazy" decoding="async">
    `;
    gallery.appendChild(picture);
  }
  // IntersectionObserver for fade-in
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.gallery__item').forEach(el => io.observe(el));

  // 3. Back-to-Top Button
  const backBtn = document.createElement('button');
  backBtn.id = 'back-to-top';
  backBtn.innerHTML = '⬆';
  Object.assign(backBtn.style, {
    position: 'fixed', bottom: '2rem', right: '2rem',
    padding: '0.75rem', borderRadius: '50%',
    background: 'var(--primary)', color: 'var(--light)',
    display: 'none', cursor: 'pointer', border: 'none'
  });
  document.body.append(backBtn);
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    backBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
});
