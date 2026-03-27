/* ═══════════════════════════════════════════════════════════
   DR T MOODLEY INC — MAIN JAVASCRIPT
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── NAV: SCROLL BEHAVIOUR ─────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const dropdownTriggers = document.querySelectorAll('.nav__link--dropdown-trigger');
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    if (y > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile toggle */
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Dropdown triggers (keyboard + click for mobile) */
  dropdownTriggers.forEach(trigger => {
    const item = trigger.closest('.nav__item--has-dropdown');

    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const isOpen = item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      }
    });

    /* Desktop: keyboard support */
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      }
      if (e.key === 'Escape') {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  });

  /* Close dropdowns when clicking outside */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item--has-dropdown')) {
      document.querySelectorAll('.nav__item--has-dropdown.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* Close mobile menu on resize */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
})();

/* ─── HERO CANVAS: PARTICLE FIELD ───────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles = [], animId;
  const COUNT = 80;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createParticle() {
    return {
      x:    rand(0, w),
      y:    rand(0, h),
      r:    rand(0.5, 1.8),
      vx:   rand(-0.12, 0.12),
      vy:   rand(-0.18, -0.05),
      a:    rand(0.1, 0.6),
      life: rand(0.4, 1),
      decay: rand(0.001, 0.003),
    };
  }

  function initParticles() {
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(77, 143, 255, ${p.a * p.life})`;
    ctx.fill();
  }

  function connectParticles() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(26, 107, 255, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > w + 10) {
        particles[i] = createParticle();
        particles[i].y = h + 2;
      }

      drawParticle(p);
    });

    connectParticles();
    animId = requestAnimationFrame(tick);
  }

  /* Only run if user has no preference for reduced motion */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resize();
    initParticles();
    tick();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas.parentElement);
  }
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach(el => io.observe(el));
  } else {
    elements.forEach(el => el.classList.add('revealed'));
  }
})();

/* ─── TESTIMONIALS SLIDER ────────────────────────────────── */
(function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const prev  = document.getElementById('testimonialPrev');
  const next  = document.getElementById('testimonialNext');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  /* Build dots dynamically */
  dotsContainer.innerHTML = '';
  const dots = Array.from({ length: total }, (_, i) => {
    const btn = document.createElement('button');
    btn.className = 'testimonials__dot' + (i === 0 ? ' testimonials__dot--active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(i === 0));
    btn.setAttribute('aria-label', `Testimonial ${i + 1}`);
    btn.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsContainer.appendChild(btn);
    return btn;
  });

  function goTo(index) {
    current = ((index % total) + total) % total;
    const cardWidth = track.parentElement.offsetWidth;
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('testimonials__dot--active', i === current);
      dot.setAttribute('aria-selected', String(i === current));
    });
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  prev?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  next?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  /* Touch swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      goTo(dx < 0 ? current + 1 : current - 1);
      resetAuto();
    }
  });

  window.addEventListener('resize', () => goTo(current));

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startAuto();
  }

  goTo(0);
})();

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ─── FOOTER YEAR ────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ─── ADD REVEAL CLASSES TO SECTIONS ────────────────────── */
(function addRevealClasses() {
  const sections = [
    '.comprehensive__image-col',
    '.comprehensive__text-col',
    '.meet-doctor__text',
    '.meet-doctor__image',
    '.service-card',
    '.aviation__badge',
    '.aviation__title',
    '.aviation__body',
    '.testimonials__header',
    '.testimonial-card',
  ];

  sections.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0 && i < 5) el.classList.add(`reveal--delay-${i}`);
    });
  });

  /* Re-init reveal after adding classes */
  const elements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(el => io.observe(el));
  } else {
    elements.forEach(el => el.classList.add('revealed'));
  }
})();
