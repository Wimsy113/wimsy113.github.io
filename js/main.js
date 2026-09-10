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
  // Reveal-on-scroll (plain fade, no motion tricks)
  // ---------------------------------------------------------------
  var revealTargets = document.querySelectorAll(
    '.case-card, .quest-card, .skill-group, .about-copy, .art-feature, .art-copy, .off-clock-copy, .off-clock-photo'
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
  // Scramble-in project names on first scroll into view
  // ---------------------------------------------------------------
  var scrambleTargets = document.querySelectorAll(
    '.case-card-body h3, .case-card-body p, .quest-card-body h3, .quest-card-body p'
  );

  if (scrambleTargets.length && !reduceMotion) {
    var scrambleChars = '!@#$%^&*()_+-=[]{}|;:,.<>/?~`\\';

    var randomChar = function () {
      return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    };

    var scrambledString = function (text) {
      var out = '';
      for (var i = 0; i < text.length; i++) {
        out += text[i] === ' ' ? ' ' : randomChar();
      }
      return out;
    };

    var scrambleReveal = function (el, finalText) {
      var frameDelay = 45;
      var duration = Math.min(2000, 500 + finalText.length * 7);
      var totalFrames = Math.round(duration / frameDelay);
      var frame = 0;

      var tick = function () {
        var lockedCount = Math.floor((frame / totalFrames) * finalText.length);
        var out = '';
        for (var i = 0; i < finalText.length; i++) {
          if (i < lockedCount || finalText[i] === ' ') {
            out += finalText[i];
          } else {
            out += randomChar();
          }
        }
        // typewriter cursor at the current typing position
        if (lockedCount < finalText.length) {
          out = out.slice(0, lockedCount) + '▌' + out.slice(lockedCount + 1);
        }
        el.textContent = out;
        frame++;
        if (frame <= totalFrames) {
          setTimeout(function () { requestAnimationFrame(tick); }, frameDelay);
        } else {
          el.textContent = finalText;
        }
      };
      tick();
    };

    var scrambleData = [];
    scrambleTargets.forEach(function (el) {
      var finalText = el.textContent;
      el.textContent = scrambledString(finalText);
      scrambleData.push({ el: el, finalText: finalText });
    });

    if ('IntersectionObserver' in window) {
      var scrambleObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var data = scrambleData.filter(function (d) { return d.el === entry.target; })[0];
              if (data) { scrambleReveal(data.el, data.finalText); }
              scrambleObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      scrambleTargets.forEach(function (el) { scrambleObserver.observe(el); });
    } else {
      scrambleData.forEach(function (d) { d.el.textContent = d.finalText; });
    }
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
