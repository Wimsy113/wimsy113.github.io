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
  var heroInteractive = document.getElementById('heroInteractive');
  var heroTrigger = document.getElementById('heroTrigger');

  if (heroInteractive && heroTrigger) {
    var setHeroExpanded = function (expanded) {
      heroTrigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    heroTrigger.addEventListener('click', function () {
      var revealed = heroInteractive.classList.toggle('is-revealed');
      setHeroExpanded(revealed);
    });

    heroTrigger.addEventListener('focus', function () {
      setHeroExpanded(true);
    });

    heroTrigger.addEventListener('blur', function () {
      setHeroExpanded(heroInteractive.classList.contains('is-revealed'));
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

  // ---------------------------------------------------------------
  // Workbench (art page): stage tabs bring a different pass of the
  // same piece forward in place -- nothing else on the page moves.
  // Every piece also opens an accessible full-size viewer, with its
  // own stage buttons when it has more than one, and prev/next to
  // move to the next piece on the table. Escape, arrow keys, and
  // touch all work; nothing here depends on hover.
  // ---------------------------------------------------------------
  var wbPieces = Array.prototype.slice.call(document.querySelectorAll('.wb-piece'));
  if (wbPieces.length) {
    wbPieces.forEach(function (piece) {
      var img = piece.querySelector('.wb-stack-trigger img');
      var tabs = Array.prototype.slice.call(piece.querySelectorAll('.wb-tab'));
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          img.src = tab.getAttribute('data-src');
          img.alt = tab.getAttribute('data-alt') || '';
          tabs.forEach(function (t) {
            var active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
        });
      });
    });

    // -------------------------------------------------------------
    // Bring-to-front + drag. Every piece keeps its authored --z; this
    // only ever raises it, and only in response to the visitor's own
    // interaction. Reset Table restores the authored value.
    // -------------------------------------------------------------
    var wbZTop = 10;
    var wbOriginalZ = new Map();
    wbPieces.forEach(function (piece) {
      wbOriginalZ.set(piece, piece.style.getPropertyValue('--z') || '1');
    });

    function wbBringToFront(piece) {
      wbZTop += 1;
      piece.style.setProperty('--z', String(wbZTop));
    }

    // Dragging is a bonus for a mouse/trackpad -- never wired up for a
    // coarse (touch) primary pointer, so it can never fight with page
    // scrolling. Every piece stays fully usable without it.
    var wbFinePointer = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
    var WB_DRAG_THRESHOLD = 6;

    wbPieces.forEach(function (piece) {
      var trigger = piece.querySelector('.wb-stack-trigger');

      trigger.addEventListener('focus', function () { wbBringToFront(piece); });

      if (!wbFinePointer) { return; }

      var isDragging = false;
      var startX = 0, startY = 0, baseX = 0, baseY = 0, activePointerId = null;

      var onPointerMove = function (e) {
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (!isDragging && Math.hypot(dx, dy) > WB_DRAG_THRESHOLD) {
          isDragging = true;
          piece.classList.add('is-dragging');
        }
        if (isDragging) {
          piece.style.setProperty('--drag-x', (baseX + dx) + 'px');
          piece.style.setProperty('--drag-y', (baseY + dy) + 'px');
        }
      };

      var onPointerUp = function () {
        if (activePointerId !== null) {
          try { trigger.releasePointerCapture(activePointerId); } catch (err) { /* no-op */ }
        }
        trigger.removeEventListener('pointermove', onPointerMove);
        trigger.removeEventListener('pointerup', onPointerUp);
        trigger.removeEventListener('pointercancel', onPointerUp);
        piece.classList.remove('is-dragging');
        if (isDragging) {
          var suppressNextClick = function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            trigger.removeEventListener('click', suppressNextClick, true);
          };
          trigger.addEventListener('click', suppressNextClick, true);
        }
        isDragging = false;
        activePointerId = null;
      };

      trigger.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch' || (e.button !== undefined && e.button !== 0)) { return; }
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        baseX = parseFloat(piece.style.getPropertyValue('--drag-x')) || 0;
        baseY = parseFloat(piece.style.getPropertyValue('--drag-y')) || 0;
        wbBringToFront(piece);
        trigger.setPointerCapture(activePointerId);
        trigger.addEventListener('pointermove', onPointerMove);
        trigger.addEventListener('pointerup', onPointerUp);
        trigger.addEventListener('pointercancel', onPointerUp);
      });
    });

    var wbResetBtn = document.getElementById('wbReset');
    if (wbResetBtn) {
      wbResetBtn.addEventListener('click', function () {
        wbPieces.forEach(function (piece) {
          piece.style.removeProperty('--drag-x');
          piece.style.removeProperty('--drag-y');
          piece.style.setProperty('--z', wbOriginalZ.get(piece));
        });
      });
    }

    // Work index: reach any piece without hunting the canvas, and the
    // only path that doesn't assume a mouse.
    Array.prototype.slice.call(document.querySelectorAll('.wb-index-item')).forEach(function (item) {
      item.addEventListener('click', function () {
        var piece = document.getElementById(item.getAttribute('data-target'));
        if (!piece) { return; }
        wbBringToFront(piece);
        piece.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        var trigger = piece.querySelector('.wb-stack-trigger');
        if (trigger) { trigger.focus({ preventScroll: true }); }
      });
    });

    var wbLightbox = document.createElement('div');
    wbLightbox.className = 'wb-lightbox';
    wbLightbox.setAttribute('role', 'dialog');
    wbLightbox.setAttribute('aria-modal', 'true');
    wbLightbox.setAttribute('aria-hidden', 'true');
    wbLightbox.innerHTML =
      '<button type="button" class="wb-lightbox-prev" aria-label="Previous piece">&#8592;</button>' +
      '<figure class="wb-lightbox-figure">' +
      '<img src="" alt="">' +
      '<div class="wb-lightbox-stages"></div>' +
      '<figcaption class="wb-lightbox-caption"></figcaption>' +
      '</figure>' +
      '<button type="button" class="wb-lightbox-next" aria-label="Next piece">&#8594;</button>' +
      '<button type="button" class="wb-lightbox-close">[ Close ]</button>';
    document.body.appendChild(wbLightbox);

    var wbLightboxImg = wbLightbox.querySelector('img');
    var wbLightboxStages = wbLightbox.querySelector('.wb-lightbox-stages');
    var wbLightboxCaption = wbLightbox.querySelector('.wb-lightbox-caption');
    var wbLightboxClose = wbLightbox.querySelector('.wb-lightbox-close');
    var wbLightboxPrev = wbLightbox.querySelector('.wb-lightbox-prev');
    var wbLightboxNext = wbLightbox.querySelector('.wb-lightbox-next');
    var wbLastFocused = null;
    var wbCurrentPieceIndex = 0;

    var showWbStage = function (piece, src, alt) {
      wbLightboxImg.src = src;
      wbLightboxImg.alt = alt || '';
      var title = piece.getAttribute('data-title') || '';
      var medium = piece.getAttribute('data-medium') || '';
      wbLightboxCaption.innerHTML =
        (title ? '<span class="wb-caption-title"></span>' : '') +
        (medium ? '<span class="wb-caption-meta"></span>' : '');
      if (title) { wbLightboxCaption.querySelector('.wb-caption-title').textContent = title; }
      if (medium) { wbLightboxCaption.querySelector('.wb-caption-meta').textContent = medium; }
    };

    var showWbPiece = function (index) {
      wbCurrentPieceIndex = (index + wbPieces.length) % wbPieces.length;
      var piece = wbPieces[wbCurrentPieceIndex];
      var img = piece.querySelector('.wb-stack-trigger img');
      var tabs = Array.prototype.slice.call(piece.querySelectorAll('.wb-tab'));

      showWbStage(piece, img.currentSrc || img.src, img.alt);

      wbLightboxStages.innerHTML = '';
      tabs.forEach(function (tab) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wb-tab' + (tab.classList.contains('is-active') ? ' is-active' : '');
        btn.textContent = tab.getAttribute('data-label') || tab.textContent;
        btn.setAttribute('aria-pressed', tab.classList.contains('is-active') ? 'true' : 'false');
        btn.addEventListener('click', function () {
          tab.click();
          showWbStage(piece, tab.getAttribute('data-src'), tab.getAttribute('data-alt'));
          Array.prototype.slice.call(wbLightboxStages.children).forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');
        });
        wbLightboxStages.appendChild(btn);
      });
    };

    var openWbLightbox = function (index) {
      wbLastFocused = document.activeElement;
      showWbPiece(index);
      wbLightbox.classList.add('is-open');
      wbLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      wbLightboxClose.focus();
    };

    var closeWbLightbox = function () {
      wbLightbox.classList.remove('is-open');
      wbLightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      wbLightboxImg.src = '';
      if (wbLastFocused) { wbLastFocused.focus(); }
    };

    wbPieces.forEach(function (piece, index) {
      piece.querySelector('.wb-stack-trigger').addEventListener('click', function () {
        wbBringToFront(piece);
        openWbLightbox(index);
      });
    });

    wbLightboxClose.addEventListener('click', closeWbLightbox);
    wbLightboxPrev.addEventListener('click', function () { showWbPiece(wbCurrentPieceIndex - 1); });
    wbLightboxNext.addEventListener('click', function () { showWbPiece(wbCurrentPieceIndex + 1); });
    wbLightbox.addEventListener('click', function (e) {
      if (e.target === wbLightbox) { closeWbLightbox(); }
    });
    document.addEventListener('keydown', function (e) {
      if (!wbLightbox.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { closeWbLightbox(); }
      if (e.key === 'ArrowLeft') { showWbPiece(wbCurrentPieceIndex - 1); }
      if (e.key === 'ArrowRight') { showWbPiece(wbCurrentPieceIndex + 1); }
    });
  }
})();
