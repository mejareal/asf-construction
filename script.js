/* ============================================
   ASF Construction – Main JavaScript
   ============================================ */

'use strict';

// ===== UTILITY =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initCounters();
  initFilter();
  initBeforeAfter();
  initTestimonials();
  initLightbox();
  initPhotoUpload();
  initScrollTop();
  setYear();
});

// ===== NAVIGATION =====
function initNav() {
  const header    = $('#site-header');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-link');

  // Sticky header
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target) && mobileMenu.classList.contains('open')) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active nav link on scroll
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-link');

  const highlightNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  if (!window.IntersectionObserver) {
    $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ===== COUNTERS =====
let countersStarted = false;

function initCounters() {
  const statEls = $$('.stat-num[data-count]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statEls.forEach(el => animateCounter(el));
          observer.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observe the first stat element
  if (statEls[0]) observer.observe(statEls[0]);
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 2000;
  const step     = target / (duration / 16);
  let   current  = 0;

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, 16);
}

// ===== PROJECT FILTER =====
function initFilter() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards with animation
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn .4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ===== BEFORE / AFTER SLIDER =====
function initBeforeAfter() {
  const range = $('#ba-range');
  const after = $('#ba-after-wrap');
  const handle = $('#ba-handle');

  if (!range || !after || !handle) return;

  const update = value => {
    const pct = Math.max(0, Math.min(100, Number(value)));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  };

  range.addEventListener('input', e => update(e.target.value));
  update(range.value);
}

// ===== TESTIMONIALS SLIDER =====
function initTestimonials() {
  const track  = $('#testimonials-track');
  const cards  = $$('.testimonial-card', track);
  const dotsEl = $('#t-dots');
  const prevBtn = $('#t-prev');
  const nextBtn = $('#t-next');

  if (!track || cards.length === 0 || !dotsEl || !prevBtn || !nextBtn) return;
  if (dotsEl) dotsEl.innerHTML = '';

  let current    = 0;
  let autoTimer  = null;
  let startX     = 0;

  // Setup: keep every testimonial as a real horizontal card.
  track.style.display = 'flex';
  track.style.transform = 'none';

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Yorum ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    const target = cards[current];
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: 'smooth'
    });

    $$('.t-dot', dotsEl).forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  goTo(0);

  function syncFromScroll() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft - track.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    });

    current = nearest;
    $$('.t-dot', dotsEl).forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  track.addEventListener('scroll', syncFromScroll, { passive: true });

  // Auto-advance
  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);

  // Touch/swipe
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
      resetAuto();
    } else {
      syncFromScroll();
    }
  }, { passive: true });

  // Keyboard
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });
}

// ===== LIGHTBOX =====
function initLightbox() {
  const lightbox = $('#lightbox');
  const closeBtn = $('#lightbox-close');
  const content  = $('#lightbox-content');
  const latestButtons = ['#latest-project-open', '#latest-project-play']
    .map(selector => $(selector))
    .filter(Boolean);

  function openLightbox(markup) {
    content.innerHTML = markup;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  latestButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      openLightbox(`
        <div class="lightbox-video-card">
          <video controls autoplay playsinline><source src="images/biten-son-projemiz.mp4" type="video/mp4">Tarayıcınız video oynatmayı desteklemiyor.</video>
          <div class="lightbox-video-caption">
            <h3>Biten Son Projemiz</h3>
            <p>Son teslim ettiğimiz projenin kısa videosu.</p>
          </div>
        </div>
      `);
    });
  });

  $$('.project-zoom').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card      = btn.closest('.project-card');
      const img       = card.querySelector('.project-photo');
      const title     = card.querySelector('h3')?.textContent || '';
      const desc      = card.querySelector('p')?.textContent || '';
      const imgSrc    = img?.getAttribute('src') || '';
      const imgAlt    = img?.getAttribute('alt') || title;

      openLightbox(`
        <div style="background:var(--clr-dark2);border-radius:var(--radius-lg);overflow:hidden;max-width:680px;width:90vw;">
          <div style="background:var(--clr-dark3);aspect-ratio:16/9;overflow:hidden;">
            ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" style="width:100%;height:100%;object-fit:cover;display:block;">` : ''}
          </div>
          <div style="padding:1.5rem;">
            <h3 style="font-family:var(--ff-display);font-size:1.5rem;font-weight:700;margin-bottom:.5rem;">${title}</h3>
            <p style="color:var(--clr-muted);font-size:.9rem;">${desc}</p>
          </div>
        </div>
      `);


    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

// ===== FORM SUBMIT =====
function initPhotoUpload() {
  const input = $('#project-photo');
  const label = $('#file-name');
  const form = $('.contact-form-card');
  const maxSize = 8 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!input || !label) return;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) {
      label.textContent = 'Henüz fotoğraf seçilmedi.';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      input.value = '';
      label.textContent = 'Lütfen JPG, PNG veya WebP formatında fotoğraf seçin.';
      return;
    }

    if (file.size > maxSize) {
      input.value = '';
      label.textContent = 'Fotoğraf 8 MB sınırını aşmamalı.';
      return;
    }

    label.textContent = `${file.name} seçildi.`;
  });

  form?.addEventListener('submit', e => {
    const file = input.files?.[0];
    if (file && (!allowedTypes.includes(file.type) || file.size > maxSize)) {
      e.preventDefault();
      label.textContent = 'Fotoğrafı kontrol edin: JPG, PNG veya WebP ve en fazla 8 MB olmalı.';
      return;
    }

    if (!form.checkValidity()) return;

    const btn = document.getElementById('submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/>
          <path d="M12 3a9 9 0 019 9" stroke-linecap="round"/>
        </svg>
        <span>Gönderiliyor...</span>
      `;
    }
  });
}

function handleFormSubmit(e) {
  const btn     = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');
  const name    = document.getElementById('name');
  const phone   = document.getElementById('phone');
  const service = document.getElementById('service');

  // Basic validation
  if (!name.value.trim()) {
    name.focus();
    name.style.borderColor = '#e53e3e';
    setTimeout(() => name.style.borderColor = '', 2000);
    return;
  }
  if (!phone.value.trim()) {
    phone.focus();
    phone.style.borderColor = '#e53e3e';
    setTimeout(() => phone.style.borderColor = '', 2000);
    return;
  }
  if (!service.value) {
    service.focus();
    service.style.borderColor = '#e53e3e';
    setTimeout(() => service.style.borderColor = '', 2000);
    return;
  }

  // Simulate submission
  btn.disabled = true;
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/>
      <path d="M12 3a9 9 0 019 9" stroke-linecap="round"/>
    </svg>
    <span>Gönderiliyor...</span>
  `;

  setTimeout(() => {
    btn.style.display = 'none';
    success.classList.add('show');
    // Reset form fields
    $$('.form-input, .form-textarea, .form-select').forEach(inp => {
      if (inp.tagName === 'SELECT') inp.selectedIndex = 0;
      else inp.value = '';
    });
  }, 1500);
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
  const btn = $('#scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== SET YEAR =====
function setYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

// ===== CSS ANIMATION =====
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .nav-link.active { color: var(--clr-gold) !important; }
  .nav-link.active::after { transform: scaleX(1) !important; }
`;
document.head.appendChild(style);






