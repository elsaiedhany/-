// =================== js/script.js ===================

// عندما يتم تحميل المحتوى
window.addEventListener('DOMContentLoaded', () => {
  // تفعيل رابط الصفحة الحالية
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === location.pathname.split('/').pop()) {
      a.classList.add('active');
    }
  });

  // تمرير سلس إلى نموذج الحجز
  document.querySelectorAll('[data-scroll-to="booking"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // إضافة مستمع للإرسال على جميع النماذج
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', sendBooking);
  });
});

function sendBooking(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.querySelector('input[name="name"]').value.trim();
  const phone = form.querySelector('input[name="phone"]').value.trim();
  if (!name || !phone) {
    alert('من فضلك املأ الاسم ورقم التليفون بشكل صحيح');
    return;
  }
  const text = `حجز+من+مطابخ+التقوي%0Aالاسم:+${encodeURIComponent(name)}%0Aرقم:+${encodeURIComponent(phone)}`;
  window.open(`https://wa.me/201003515207?text=${text}`, '_blank');
}
