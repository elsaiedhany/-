// js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // كود السحب للنموذج إذا كان عندك زر Scroll
  const scrollBtns = document.querySelectorAll('[data-scroll-to="booking"]');
  scrollBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // التعامل مع جميع نماذج الحجز
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', sendBooking);
  });
});

function sendBooking(event) {
  event.preventDefault();  // يمنع إعادة تحميل الصفحة
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  // التحقق من صحة البيانات
  if (!name || !phone) {
    alert('من فضلك املأ الاسم ورقم التليفون.');
    return;
  }
  // بناء رسالة الواتساب
  const text = `حجز+من+مطابخ+التقوي%0Aالاسم:+${encodeURIComponent(name)}%0Aرقم:+${encodeURIComponent(phone)}`;
  // فتح تطبيق واتساب في تبويب جديد
  window.open(`https://wa.me/201003515207?text=${text}`, '_blank');
}
