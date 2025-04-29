// =================== js/script.js ===================
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === location.pathname.split('/').pop()) a.classList.add('active');
  });
  document.querySelectorAll('[data-scroll-to]')
    .forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      const target = btn.getAttribute('data-scroll-to');
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }));
  document.querySelectorAll('form')
    .forEach(form => form.addEventListener('submit', sendBooking));
});

function sendBooking(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.querySelector('input[name="name"]').value.trim();
  const phone = form.querySelector('input[name="phone"]').value.trim();
  if (!name || !phone) { alert('من فضلك املأ الاسم ورقم التليفون'); return; }
  const text = `حجز+من+مطابخ+التقوي%0Aالاسم:+${encodeURIComponent(name)}%0Aرقم:+${encodeURIComponent(phone)}`;
  window.open(`https://wa.me/201003515207?text=${text}`, '_blank');
}
