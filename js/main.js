(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // Mobile nav toggle
  // ---------------------------------------------------------------
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    primaryNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------------------------------------------------------------
  // Hero: interactive self-portrait reveal. Hover/focus-within handle
  // the desktop preview entirely in CSS; this just makes the reveal
  // persist on click/tap (mobile has no hover to fall back on) and
  // keeps aria-expanded in sync for assistive tech.
  // ---------------------------------------------------------------
  var heroStage = document.getElementById('heroStage');
  var heroTrigger = document.getElementById('heroTrigger');

  if (heroStage && heroTrigger) {
    var setHeroExpanded = function (expanded) {
      heroTrigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    heroTrigger.addEventListener('click', function () {
      var revealed = heroStage.classList.toggle('is-revealed');
      setHeroExpanded(revealed);
    });

    heroTrigger.addEventListener('focus', function () {
      setHeroExpanded(true);
    });

    heroTrigger.addEventListener('blur', function () {
      setHeroExpanded(heroStage.classList.contains('is-revealed'));
    });
  }

  // ---------------------------------------------------------------
  // Reveal-on-scroll (plain fade, no motion tricks)
  // ---------------------------------------------------------------
  var revealTargets = document.querySelectorAll(
    '.feature, .interrupt, .collection, .standalone, .art-section, .about-teaser'
  );

  revealTargets.forEach(function (el) {
    el.setAttribute('data-reveal', '');
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ---------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------
  // Footer clock (local time, status-bar style)
  // ---------------------------------------------------------------
  var clockEl = document.getElementById('clock');
  if (clockEl) {
    var updateClock = function () {
      var now = new Date();
      var hh = String(now.getHours()).padStart(2, '0');
      var mm = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = hh + ':' + mm;
    };
    updateClock();
    setInterval(updateClock, 15000);
  }

  // ---------------------------------------------------------------
  // Click-to-enlarge lightbox for case study screenshots
  // ---------------------------------------------------------------
  var caseImages = document.querySelectorAll('.case-image img');
  if (caseImages.length) {
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML =
      '<button type="button" class="lightbox-close">[ Close ]</button>' +
      '<div class="lightbox-content">' +
      '<img src="" alt="">' +
      '<figcaption></figcaption>' +
      '</div>';
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector('img');
    var lightboxCaption = lightbox.querySelector('figcaption');
    var lightboxClose = lightbox.querySelector('.lightbox-close');
    var lastFocused = null;

    var openLightbox = function (img) {
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || '';
      var figure = img.closest('.case-image');
      var caption = figure ? figure.querySelector('figcaption') : null;
      lightboxCaption.textContent = caption ? caption.textContent : '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lightboxImg.src = '';
      if (lastFocused) { lastFocused.focus(); }
    };

    caseImages.forEach(function (img) {
      img.addEventListener('click', function () {
        openLightbox(img);
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) { closeLightbox(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }
})();
