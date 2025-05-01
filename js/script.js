// Enhanced JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  
  document.querySelectorAll('[data-lightbox]').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.close-lightbox').addEventListener('click', () => {
    lightbox.close();
  });

  // Form Validation
  const form = document.getElementById('contactForm');
  const phoneInput = document.getElementById('phone');
  
  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9+]/, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim()
    };
    
    // Validate form
    let isValid = true;
    
    if(formData.name.length < 3) {
      showError(form.name, 'الاسم يجب أن يكون 3 أحرف على الأقل');
      isValid = false;
    }
    
    if(!/^01[0125][0-9]{8}$/.test(formData.phone)) {
      showError(form.phone, 'رقم هاتف غير صحيح');
      isValid = false;
    }
    
    if(isValid) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess('تم إرسال الرسالة بنجاح!');
        form.reset();
      } catch (error) {
        showError(null, 'حدث خطأ أثناء الإرسال');
      }
    }
  });

  function showError(field, message) {
    if(field) {
      const errorElement = field.nextElementSibling;
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      field.classList.add('error');
    } else {
      const messageElement = document.getElementById('formMessage');
      messageElement.textContent = message;
      messageElement.classList.add('error');
      messageElement.style.display = 'block';
    }
  }

  function showSuccess(message) {
    const messageElement = document.getElementById('formMessage');
    messageElement.textContent = message;
    messageElement.classList.remove('error');
    messageElement.classList.add('success');
    messageElement.style.display = 'block';
    setTimeout(() => messageElement.style.display = 'none', 5000);
  }

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('SW registration failed:', err));
  }
});

// Smooth scroll for keyboard users
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.documentElement.style.scrollBehavior = 'smooth';
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    }, 1000);
  }
});
