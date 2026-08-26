// Immediate image and animation visibility enforcer
(function() {
  if (document.body) document.body.classList.remove('js-animated');
  function enforce() {
    if (document.body) document.body.classList.remove('js-animated');
    document.querySelectorAll('img').forEach(function(img) {
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      var dsrc = img.getAttribute('data-src');
      if (dsrc && (!img.getAttribute('src') || img.getAttribute('src').indexOf('data:image') === 0)) {
        img.setAttribute('src', dsrc);
      }
    });
    document.querySelectorAll('.lazy-image').forEach(function(li) {
      li.classList.add('is-loaded');
    });
  }
  enforce();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforce);
  }
  window.addEventListener('load', enforce);
})();

/**
 * Володимир Яросвіт — Персональний сайт
 * Vanilla JS Engine (Slider, Lightbox, Mobile Nav, FAQ Accordion, Order Modal, Back to Top, Share)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSlider();
  initFAQ();
  initOrderModal();
  initFloatingButtons();
  initGalleryLightbox();
  highlightActiveMenu();
});

/* ==========================================================================
   1. Fullscreen Hero Slider & Slide Counter
   ========================================================================== */
function initSlider() {
  const slider = document.querySelector('.slider.js-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide.js-slide');
  if (slides.length === 0) return;

  let currentIndex = 0;
  const delay = parseInt(slider.getAttribute('data-delay') || '5000', 10);
  let timer = null;

  const currCountEl = document.querySelector('.js-slider-current-slide');
  const totalCountEl = document.querySelector('.js-slider-total-slides');

  if (totalCountEl) {
    totalCountEl.textContent = slides.length;
  }

  slides.forEach((slide, idx) => {
    slide.style.position = 'absolute';
    slide.style.top = '0';
    slide.style.left = '0';
    slide.style.width = '100%';
    slide.style.height = '100%';
    slide.style.transition = 'opacity 1s ease-in-out, visibility 1s ease-in-out';
    slide.style.opacity = idx === 0 ? '1' : '0';
    slide.style.zIndex = idx === 0 ? '2' : '1';
    slide.style.visibility = idx === 0 ? 'visible' : 'hidden';
    slide.style.pointerEvents = idx === 0 ? 'auto' : 'none';
  });

  function updateCounter() {
    if (currCountEl) {
      currCountEl.textContent = currentIndex + 1;
    }
  }

  function showSlide(index) {
    slides[currentIndex].style.opacity = '0';
    slides[currentIndex].style.visibility = 'hidden';
    slides[currentIndex].style.zIndex = '1';
    slides[currentIndex].style.pointerEvents = 'none';

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].style.visibility = 'visible';
    slides[currentIndex].style.opacity = '1';
    slides[currentIndex].style.zIndex = '2';
    slides[currentIndex].style.pointerEvents = 'auto';

    const img = slides[currentIndex].querySelector('img');
    if (img && img.getAttribute('data-src') && (!img.src || img.src.includes('data:image'))) {
      img.src = img.getAttribute('data-src');
    }

    updateCounter();
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, delay);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  // Cover Arrows
  const prevBtns = document.querySelectorAll('.js-slider-prev');
  const nextBtns = document.querySelectorAll('.js-slider-next');

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      startAutoplay();
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      startAutoplay();
    });
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe for mobile
  let startX = 0;
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    startAutoplay();
  }, { passive: true });

  updateCounter();
  startAutoplay();
}

/* ==========================================================================
   2. Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
  const header = document.querySelector('.page-header');
  if (!header) return;

  let btn = header.querySelector('.menu-button');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'menu-button js-menu-button';
    btn.setAttribute('aria-label', 'Меню');
    btn.innerHTML = '<span class="menu-button-icon"></span>';
    const inner = header.querySelector('.inner');
    if (inner) inner.appendChild(btn);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('mobile-menu-open');
  });

  const menuLinks = header.querySelectorAll('.menu-list a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('mobile-menu-open');
    });
  });

  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('mobile-menu-open') && !header.contains(e.target)) {
      document.body.classList.remove('mobile-menu-open');
    }
  });
}

/* ==========================================================================
   3. FAQ Accordion (Answers Expand / Collapse)
   ========================================================================== */
function initFAQ() {
  const questions = document.querySelectorAll('.questions-list-section .question, .js-question');
  
  questions.forEach(question => {
    const title = question.querySelector('.title, .js-question-title');
    const answer = question.querySelector('.answer, .js-answer');
    if (!title || !answer) return;

    title.addEventListener('click', (e) => {
      e.preventDefault();
      const isActive = question.classList.contains('is-active');

      questions.forEach(q => {
        if (q !== question) {
          q.classList.remove('is-active');
          const ans = q.querySelector('.answer');
          if (ans) ans.style.display = 'none';
        }
      });

      if (isActive) {
        question.classList.remove('is-active');
        answer.style.display = 'none';
      } else {
        question.classList.add('is-active');
        answer.style.display = 'block';
        answer.style.opacity = '1';
      }
    });
  });
}

/* ==========================================================================
   4. Order Modal ("Замовити фотосесію")
   ========================================================================== */
function initOrderModal() {
  const orderTriggers = document.querySelectorAll('.js-order-trigger, .button.-fill, a[href*="forms/orders"]');
  if (!orderTriggers.length) return;

  let modal = document.querySelector('.custom-order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'custom-order-modal';
    modal.innerHTML = `
      <div class="custom-order-modal-backdrop"></div>
      <div class="custom-order-modal-content">
        <button class="custom-order-modal-close" aria-label="Закрити">&times;</button>
        <h3 class="custom-order-modal-title">Замовити фотосесію</h3>
        <p class="custom-order-modal-subtitle">Володимир Яросвіт — весільний та портретний фотограф</p>
        
        <div class="custom-order-contacts">
          <a href="https://www.instagram.com/yarossvit_prod" target="_blank" rel="noopener noreferrer" class="custom-order-btn -instagram">
            <i class="fab fa-instagram"></i> Написати в Instagram
          </a>
          <a href="tel:+380986808278" class="custom-order-btn -phone">
            <i class="fal fa-phone-alt"></i> +380 98 680 82 78
          </a>
          <a href="mailto:yarossvit.prod@gmail.com" class="custom-order-btn -email">
            <i class="fal fa-envelope"></i> yarossvit.prod@gmail.com
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = modal.querySelector('.custom-order-modal-close');
  const backdrop = modal.querySelector('.custom-order-modal-backdrop');

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  orderTriggers.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. Floating Action Buttons (Back to Top & Share)
   ========================================================================== */
function initFloatingButtons() {
  const backToTop = document.querySelector('.js-back-to-top');
  const shareBtn = document.querySelector('.js-share-trigger');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Посилання скопійовано в буфер!');
        }).catch(() => {
          showToast(window.location.href);
        });
      }
    });
  }

  function showToast(msg) {
    let toast = document.querySelector('.custom-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'custom-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2500);
  }
}

/* ==========================================================================
   6. Fullscreen Lightbox Gallery (Photoswipe equivalent)
   ========================================================================== */
function initGalleryLightbox() {
  const galleryLinks = document.querySelectorAll('.js-gallery-link');
  if (!galleryLinks.length) return;

  let lightbox = document.querySelector('.custom-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'custom-lightbox';
    lightbox.innerHTML = `
      <div class="custom-lightbox-counter"></div>
      <button class="custom-lightbox-btn custom-lightbox-close" aria-label="Закрити">&times;</button>
      <button class="custom-lightbox-btn custom-lightbox-prev" aria-label="Попередня">&#10094;</button>
      <button class="custom-lightbox-btn custom-lightbox-next" aria-label="Наступна">&#10095;</button>
      <div class="custom-lightbox-img-wrap">
        <img class="custom-lightbox-img" src="" alt="Фотографія" />
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const imgElem = lightbox.querySelector('.custom-lightbox-img');
  const counterElem = lightbox.querySelector('.custom-lightbox-counter');
  const closeBtn = lightbox.querySelector('.custom-lightbox-close');
  const prevBtn = lightbox.querySelector('.custom-lightbox-prev');
  const nextBtn = lightbox.querySelector('.custom-lightbox-next');

  const items = [];
  galleryLinks.forEach((link, idx) => {
    let largeSrc = link.getAttribute('href');
    
    const versionsJson = link.getAttribute('data-gallery-versions');
    if (versionsJson) {
      try {
        const versions = JSON.parse(versionsJson);
        if (versions && versions.length) {
          versions.sort((a, b) => (b.w || 0) - (a.w || 0));
          let bestSrc = versions[0].src;
          if (bestSrc.startsWith('//')) bestSrc = 'https:' + bestSrc;
          largeSrc = bestSrc;
        }
      } catch (e) {}
    }
    
    if (largeSrc.startsWith('//')) largeSrc = 'https:' + largeSrc;

    items.push({
      src: largeSrc,
      el: link
    });

    link.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  let activeIndex = 0;

  function openLightbox(index) {
    activeIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = items[activeIndex];
    imgElem.src = item.src;
    counterElem.textContent = `${activeIndex + 1} / ${items.length}`;
  }

  function prevPhoto() {
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateLightbox();
  }

  function nextPhoto() {
    activeIndex = (activeIndex + 1) % items.length;
    updateLightbox();
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevPhoto(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextPhoto(); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('custom-lightbox-img-wrap')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) nextPhoto();
      else prevPhoto();
    }
  }, { passive: true });
}

/* ==========================================================================
   7. Highlight Active Menu Link
   ========================================================================== */
function highlightActiveMenu() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.menu-list a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.parentElement.classList.add('-active');
    }
  });
}
