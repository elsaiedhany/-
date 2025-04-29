// تأثير دخول الصفحة
window.addEventListener('DOMContentLoaded', () => document.body.classList.add('fade-in'));

// انتقل لنموذج الحجز
function scrollToBooking() {
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// أرسل بيانات الحجز عبر واتساب
function sendBooking(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!name || !phone) return alert('من فضلك ادخل بياناتك كاملة');
  const text = encodeURIComponent(`حجز من مطابخ التقوي\nالاسم: ${name}\nرقم: ${phone}`);
  window.open(`https://wa.me/201003515207?text=${text}`, '_blank');
}

// تأثير fade-out عند تغيير الصفحة
document.querySelectorAll('.fade-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.body.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => window.location = link.href, 500);
  });
});
