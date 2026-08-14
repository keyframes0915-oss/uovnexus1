/* ============================================================
   UoV Nexus — Career Fair 2026  |  main.js
   ============================================================ */

'use strict';

(function initLogoIntro() {
  const intro = document.getElementById('logoIntro');
  const mark = intro?.querySelector('.logo-intro-mark');
  const markImage = intro?.querySelector('.logo-intro-mark img');
  const cardLogo = document.querySelector('#badge img');
  if (!intro || !mark || !markImage || !cardLogo) return;

  // Always replay the opening sequence on refresh instead of restoring the
  // visitor at the final scroll position from the previous visit.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
  document.body.classList.add('intro-active');
  let done = false;
  let frame;
  const finish = () => {
    if (done) return;
    done = true;
    intro.classList.add('landed');
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-complete');
    document.dispatchEvent(new Event('introcomplete'));
    window.scrollTo(0, 0);
    setTimeout(() => intro.remove(), 650);
  };
  const update = () => {
    const travel = Math.max(intro.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, window.scrollY / travel));
    intro.style.setProperty('--intro-progress', progress.toFixed(3));
    const destination = cardLogo.getBoundingClientRect();
    const dx = destination.left + destination.width / 2 - window.innerWidth / 2;
    const dy = destination.top + destination.height / 2 - window.innerHeight / 2;
    const scale = Math.max(.06, destination.width / markImage.offsetWidth);
    mark.style.transform = `translate3d(${dx * progress}px, ${dy * progress}px, 0) scale(${1 - (1 - scale) * progress})`;
    if (progress >= .985) finish();
    frame = undefined;
  };
  const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
  else {
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
  }
  window.addEventListener('pageshow', () => {
    if (!done) {
      window.scrollTo(0, 0);
      requestUpdate();
    }
  });
})();

(function placePartnersAfterHero() {
  const hero = document.querySelector('.hero');
  const partners = document.getElementById('partners');
  if (hero && partners) hero.insertAdjacentElement('afterend', partners);
})();

/* ── PRELOADER ───────────────────────────────────────────────── */
(function initPreloader() {
  const loader = document.getElementById('preloader');
  const skip   = document.getElementById('skipLoader');
  if (!loader) return;

  const hideLoader = () => {
    if (loader.classList.contains('done')) return;
    loader.classList.add('done');
    document.body.classList.remove('locked');
    document.body.classList.add('site-ready');
    setTimeout(() => loader.remove(), 800);
  };

  const startLoader = () => {
    document.body.classList.add('locked');
    if (document.readyState === 'complete') setTimeout(hideLoader, 2800);
    else window.addEventListener('load', () => setTimeout(hideLoader, 2800), { once: true });
  };
  if (document.body.classList.contains('intro-active')) {
    document.addEventListener('introcomplete', startLoader, { once: true });
  } else {
    startLoader();
  }
  skip?.addEventListener('click', hideLoader);
})();

(function initHeroLogoScroll() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame;
  const update = () => {
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    hero.style.setProperty('--logo-scroll', progress.toFixed(3));
    frame = undefined;
  };
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
})();

(function initActivityPhone() {
  const phone = document.querySelector('.activity-phone');
  const feed = document.querySelector('.phone-feed');
  if (!phone || !feed) return;

  [...feed.children].forEach(item => feed.appendChild(item.cloneNode(true)));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  phone.addEventListener('pointermove', event => {
    const rect = phone.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    phone.style.transform = `rotateX(${7 - y * 8}deg) rotateY(${-18 + x * 10}deg)`;
  });
  phone.addEventListener('pointerleave', () => { phone.style.transform = ''; });
})();


/* ── STICKY HEADER ───────────────────────────────────────────── */
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── MOBILE MENU ─────────────────────────────────────────────── */
(function initMobileMenu() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.querySelector('.site-header nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // close on link click
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (header && !header.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ── SCROLL REVEAL ───────────────────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.section, .contact');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target); // fire once
      }
    });
  }, { threshold: 0.10 });

  targets.forEach(el => observer.observe(el));
})();


/* ── STAGGERED CHILDREN REVEAL ───────────────────────────────── */
(function initStaggerReveal() {
  // Activity cards, objective articles, tier cards, excl rows
  const groups = document.querySelectorAll(
    '.activity-grid, .objective-list, .outcome-pills, .oc-grid, .contact-details'
  );

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const children = entry.target.children;
      Array.from(children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 60}ms`;
        child.classList.add('stagger-in');
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  groups.forEach(g => observer.observe(g));
})();


/* ── ID CARD FLIP (tap / click) ──────────────────────────────── */
(function initIdCardFlip() {
  const cards = document.querySelectorAll('.id-card');
  if (!cards.length) return;

  cards.forEach(card => {
    // click to toggle
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    // keyboard (Enter / Space)
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });

    // 3-D tilt on pointer move (front face only)
    card.addEventListener('pointermove', e => {
      if (card.classList.contains('flipped')) return;
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left)  / r.width  - 0.5;
      const y  = (e.clientY - r.top)   / r.height - 0.5;
      card.style.setProperty('--rx', `${-y * 9}deg`);
      card.style.setProperty('--ry', `${ x * 11}deg`);
      card.querySelector('.id-card-inner').style.transform =
        `rotateX(${-y * 9}deg) rotateY(${x * 11}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      if (card.classList.contains('flipped')) return;
      card.querySelector('.id-card-inner').style.transform = '';
    });
  });
})();


/* ── SPONSORSHIP TIER CARD FLIP ──────────────────────────────── */
/* Removed — sponsorship section deleted per user request */


/* ── LOGO MARQUEE PAUSE ON FOCUS ─────────────────────────────── */
(function initMarquee() {
  document.querySelectorAll('.logo-track').forEach(track => {
    track.addEventListener('focusin',  () => track.style.animationPlayState = 'paused');
    track.addEventListener('focusout', () => track.style.animationPlayState = 'running');
  });
})();


/* ── OUTCOME PILLS — MAGNETIC CURSOR ─────────────────────────── */
(function initMagneticPills() {
  const pills = document.querySelectorAll('.outcome-pills span');

  pills.forEach(pill => {
    pill.addEventListener('pointermove', e => {
      const r   = pill.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) * 0.22;
      const dy  = (e.clientY - cy) * 0.22;
      pill.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
    });

    pill.addEventListener('pointerleave', () => {
      pill.style.transform = '';
    });
  });
})();


/* ── ACTIVITY CARDS — SUBTLE TILT ────────────────────────────── */
(function initActivityTilt() {
  const cards = document.querySelectorAll('.activity:not(.feature)');

  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ── HERO PARALLAX (lightweight) ────────────────────────────── */
(function initHeroParallax() {
  const hero    = document.querySelector('.hero');
  const glowOne = document.querySelector('.glow-one');
  const glowTwo = document.querySelector('.glow-two');
  if (!hero || !glowOne || !glowTwo) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      glowOne.style.transform = `translateY(${y * 0.12}px)`;
      glowTwo.style.transform = `translateY(${y * -0.08}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();


/* ── MAGNETIC BUTTONS ───────────────────────────────────────── */
(function initMagneticButtons() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.button, .nav-cta').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
})();


/* ── ACTIVE NAVIGATION ──────────────────────────────────────── */
(function initActiveNavigation() {
  const links = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
  const pairs = links
    .map(link => [link, document.querySelector(link.getAttribute('href'))])
    .filter(([, section]) => section);
  if (!pairs.length) return;

  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    pairs.forEach(([link, section]) => link.classList.toggle('is-active', section === visible.target));
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2] });

  pairs.forEach(([, section]) => observer.observe(section));
})();


/* ── COUNTER ANIMATION (outcome numbers) ────────────────────── */
/* Animates any element with data-count attribute */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const animateCount = (el, target, duration = 1400) => {
    const start = performance.now();
    const update = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(ease(progress) * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const target = parseInt(e.target.dataset.count, 10);
      if (!isNaN(target)) animateCount(e.target, target);
      observer.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
})();


/* ── EXCLUSIVE TABLE ROW HIGHLIGHT ──────────────────────────── */
/* Removed — exclusive table section deleted per user request */


/* ── SMOOTH ANCHOR SCROLL (offset for fixed header) ─────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // header height
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── ADD STAGGER CSS IF NOT PRESENT ─────────────────────────── */
(function injectStaggerCSS() {
  const style = document.createElement('style');
  style.textContent = `
    /* stagger base state */
    .activity-grid .activity,
    .objective-list article,
    .outcome-pills span,
    .oc-grid .id-card,
    .contact-details .contact-person {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity .5s ease, transform .5s ease, background .25s, padding .2s;
    }

    /* stagger triggered state */
    .activity-grid .activity.stagger-in,
    .objective-list article.stagger-in,
    .outcome-pills span.stagger-in,
    .oc-grid .id-card.stagger-in,
    .contact-details .contact-person.stagger-in {
      opacity: 1;
      transform: translateY(0);
    }

    /* ID card inner tilt override handled in JS */
    .id-card .id-card-inner {
      transition: transform .65s cubic-bezier(.4,.2,.2,1), box-shadow .3s;
    }

    /* activity tilt */
    .activity:not(.feature) { will-change: transform; }

    /* logo card hover lift */
    .company-logo-img { will-change: transform; }
  `;
  document.head.appendChild(style);
})();
