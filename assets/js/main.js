/**
 * Володимир Яросвіт — Персональний сайт
 * Vanilla JS Engine (Slider, Lightbox, Mobile Nav, FAQ Accordion, LazyLoad)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLazyLoad();
  initMobileMenu();
  initSlider();
  initFAQ();
  initGalleryLightbox();
  highlightActiveMenu();
});

/* ==========================================================================
   1. Lazy Loading for Images
   ========================================================================== */
function initLazyLoad() {
  const lazyImages = document.querySelectorAll('img[data-src], img.lazyload');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '400px 0px 400px 0px' });

    lazyImages.forEach(img => observer.observe(img));
  } else {
    lazyImages.forEach(img => loadImage(img));
  }

  function loadImage(img) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    if (srcset) {
      img.srcset = srcset;
    }
    if (src) {
      img.src = src;
    }
    img.classList.remove('lazyload');
    img.classList.add('lazyloaded');
    
    img.onload = () => {
      const placeholder = img.parentElement ? img.parentElement.querySelector('canvas.placeholder, canvas.logo-placeholder') : null;
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    };
  }
}

/* ==========================================================================
   2. Mobile Menu (Drawer)
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
   3. Fullscreen Hero Slider (Index page)
   ========================================================================== */
function initSlider() {
  const slider = document.querySelector('.slider.js-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide.js-slide');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const delay = parseInt(slider.getAttribute('data-delay') || '5000', 10);
  let timer = null;

  slides.forEach((slide, idx) => {
    slide.style.position = 'absolute';
    slide.style.top = '0';
    slide.style.left = '0';
    slide.style.width = '100%';
    slide.style.height = '100%';
    slide.style.transition = 'opacity 1.2s ease-in-out';
    slide.style.opacity = idx === 0 ? '1' : '0';
    slide.style.zIndex = idx === 0 ? '2' : '1';
    slide.style.pointerEvents = idx === 0 ? 'auto' : 'none';
  });

  function showSlide(index) {
    slides[currentIndex].style.opacity = '0';
    slides[currentIndex].style.zIndex = '1';
    slides[currentIndex].style.pointerEvents = 'none';

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].style.opacity = '1';
    slides[currentIndex].style.zIndex = '2';
    slides[currentIndex].style.pointerEvents = 'auto';

    const img = slides[currentIndex].querySelector('img');
    if (img && img.getAttribute('data-src') && (!img.src || !img.src.includes('http'))) {
      img.src = img.getAttribute('data-src');
      if (img.getAttribute('data-srcset')) img.srcset = img.getAttribute('data-srcset');
      img.classList.add('lazyloaded');
    }
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, delay);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  slider.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  let startX = 0;
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        showSlide(currentIndex + 1);
      } else {
        showSlide(currentIndex - 1);
      }
    }
    startAutoplay();
  }, { passive: true });

  startAutoplay();
}

/* ==========================================================================
   4. FAQ Accordion
   ========================================================================== */
function initFAQ() {
  const accordionItems = document.querySelectorAll('.accordion-section .item, .section-container .item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.header, h3');
    const content = item.querySelector('.content');
    if (!header || !content) return;

    if (!item.classList.contains('is-open')) {
      content.style.display = 'none';
    }

    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        item.classList.remove('is-open');
        content.style.display = 'none';
      } else {
        item.classList.add('is-open');
        content.style.display = 'block';
      }
    });
  });
}

/* ==========================================================================
   5. Fullscreen Lightbox Gallery
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
   6. Highlight Active Menu Link
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
