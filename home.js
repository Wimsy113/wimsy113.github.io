/* Krystyna Ewing — homepage behaviour.
   Every feature boots inside its own try/catch so one failure can't take the
   rest of the page down; the HTML is fully usable with this file missing. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function boot(name, fn) {
    try { fn(); } catch (err) { if (window.console) console.error('[home] ' + name + ' failed:', err); }
  }

  /* ---------- Theme toggle (shares the ke-theme key with the rest of the site) ---------- */
  // Same labels and behaviour as the rail on the case study pages.
  boot('theme', function () {
    var tt = document.getElementById('themeToggle');
    var ttm = document.getElementById('themeToggleMobile');
    var ttml = document.getElementById('themeToggleMobileLabel');
    function sync() {
      var light = html.getAttribute('data-theme') === 'light';
      if (tt) {
        tt.textContent = light ? 'DARK' : 'LIGHT';
        tt.setAttribute('aria-pressed', light ? 'true' : 'false');
        tt.setAttribute('aria-label', 'Switch to ' + (light ? 'dark' : 'light') + ' mode');
      }
      if (ttm) ttm.setAttribute('aria-pressed', light ? 'true' : 'false');
      if (ttml) ttml.textContent = light ? 'Dark' : 'Light';
    }
    function toggle() {
      var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (next === 'dark') html.removeAttribute('data-theme'); else html.setAttribute('data-theme', 'light');
      try { localStorage.setItem('ke-theme', next); } catch (e) {}
      sync();
    }
    if (tt) tt.addEventListener('click', toggle);
    if (ttm) ttm.addEventListener('click', toggle);
    sync();
  });

  /* ---------- Mobile menu (as on the case study pages) ---------- */
  boot('mobileMenu', function () {
    var btn = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    if (!btn || !menu) return;
    var locked = false, savedY = 0;
    function lock() {
      if (locked) return;
      savedY = window.scrollY;
      var s = document.body.style;
      s.position = 'fixed'; s.top = (-savedY) + 'px'; s.left = '0'; s.right = '0'; s.overflow = 'hidden';
      locked = true;
    }
    function unlock() {
      if (!locked) return;
      var s = document.body.style;
      s.position = ''; s.top = ''; s.left = ''; s.right = ''; s.overflow = '';
      html.style.scrollBehavior = 'auto'; // restore instantly; a smooth restore would fight any jump that follows
      window.scrollTo(0, savedY || 0);
      html.style.scrollBehavior = '';
      locked = false;
    }
    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'CLOSE' : 'MENU';
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.style.display = open ? 'grid' : 'none';
      if (backdrop) backdrop.style.display = open ? 'block' : 'none';
      if (open) lock(); else unlock();
    }
    function close() { if (btn.getAttribute('aria-expanded') === 'true') setOpen(false); }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    if (backdrop) backdrop.addEventListener('click', close);
    // Close (and restore the page) first, then make the jump ourselves so nothing undoes it.
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        var target = href.charAt(0) === '#' ? document.getElementById(href.slice(1)) : null;
        close();
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView();
        if (history.pushState) history.pushState(null, '', href); else location.hash = href;
      });
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 860) close(); });
  });

  /* ---------- Bio drawer ---------- */
  boot('drawer', function () {
    var btn = document.getElementById('bioToggle');
    var drawer = document.getElementById('bio');
    if (!btn || !drawer) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close the long version' : 'Read the long version';
      drawer.classList.toggle('is-open', open);
    });
  });

  /* ---------- Screens power on once as they scroll into view ---------- */
  boot('screens', function () {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-powering');
        io.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-power]'), function (el) { io.observe(el); });
  });

  /* ---------- Cicada drifts slower than the page as it scrolls away ---------- */
  boot('parallax', function () {
    var fig = document.querySelector('.hero__cicada');
    if (!fig || reduceMotion.matches) return;
    var pending = false;
    function run() {
      pending = false;
      var y = window.scrollY;
      if (y > window.innerHeight * 1.5) return;
      fig.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; window.requestAnimationFrame(run); }
    }, { passive: true });
    run();
  });

  /* ---------- Case selector: real tabs on wide screens, all cases stacked below that ---------- */
  boot('cases', function () {
    var bank = document.getElementById('caseKeys');
    if (!bank) return;
    var keys = Array.prototype.slice.call(bank.querySelectorAll('.selkey'));
    var panels = keys.map(function (k) { return document.getElementById(k.getAttribute('data-case')); });
    var needle = bank.querySelector('.selector__needle');
    var wide = window.matchMedia('(min-width: 1100px)');
    var current = 0;

    function placeNeedle() {
      if (!needle || !wide.matches) return;
      var k = keys[current];
      needle.style.setProperty('--needle-x', k.offsetLeft + 'px');
      needle.style.setProperty('--needle-w', k.offsetWidth + 'px');
    }

    function select(i, focus) {
      current = i;
      keys.forEach(function (k, n) {
        var on = n === i;
        k.setAttribute('aria-selected', on ? 'true' : 'false');
        k.setAttribute('tabindex', on ? '0' : '-1');
        panels[n].hidden = !on;
      });
      placeNeedle();
      if (focus) keys[i].focus();
      var screen = panels[i].querySelector('[data-power]');
      if (screen && !reduceMotion.matches) {
        screen.classList.remove('is-powering');
        void screen.offsetWidth; // restart the power-on animation
        screen.classList.add('is-powering');
      }
    }

    function enable() {
      bank.setAttribute('role', 'tablist');
      bank.setAttribute('aria-label', 'Case studies');
      bank.setAttribute('aria-orientation', 'horizontal');
      keys.forEach(function (k, n) {
        k.setAttribute('role', 'tab');
        k.setAttribute('aria-controls', panels[n].id);
        k.id = k.id || 'tab-' + panels[n].id;
        panels[n].setAttribute('role', 'tabpanel');
        panels[n].setAttribute('aria-labelledby', k.id);
      });
      select(current, false);
    }

    function disable() {
      bank.removeAttribute('role'); bank.removeAttribute('aria-label'); bank.removeAttribute('aria-orientation');
      keys.forEach(function (k, n) {
        ['role', 'aria-controls', 'aria-selected', 'tabindex'].forEach(function (a) { k.removeAttribute(a); });
        panels[n].removeAttribute('role');
        panels[n].setAttribute('aria-labelledby', panels[n].id + '-h');
        panels[n].hidden = false;
      });
    }

    keys.forEach(function (k, n) {
      k.addEventListener('click', function (e) {
        if (!wide.matches) return;
        e.preventDefault();
        select(n, false);
      });
      k.addEventListener('keydown', function (e) {
        if (!wide.matches) return;
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (n + 1) % keys.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (n - 1 + keys.length) % keys.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = keys.length - 1;
        else if (e.key === ' ') next = n;
        if (next === null) return;
        e.preventDefault();
        select(next, true);
      });
    });

    function apply() { if (wide.matches) enable(); else disable(); }
    if (wide.addEventListener) wide.addEventListener('change', apply); else wide.addListener(apply);
    apply();
    window.addEventListener('resize', placeNeedle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeNeedle); // row heights change once fonts load

    // A deep link such as index.html#case-tl opens that case.
    var fromHash = panels.map(function (p) { return '#' + p.id; }).indexOf(location.hash);
    if (fromHash > -1 && wide.matches) select(fromHash, false);
  });

  /* ---------- Cutting-mat ruler numbers (decorative) ---------- */
  boot('rulers', function () {
    function fill(el, axis) {
      if (!el) return;
      el.innerHTML = '';
      var len = axis === 'x' ? el.clientWidth : el.clientHeight;
      for (var i = 1; i * 120 < len; i++) {
        var s = document.createElement('span');
        s.textContent = i;
        s.style[axis === 'x' ? 'left' : 'top'] = (i * 120) + 'px';
        el.appendChild(s);
      }
    }
    var top = document.querySelector('.mat__ruler--top');
    var left = document.querySelector('.mat__ruler--left');
    function run() { fill(top, 'x'); fill(left, 'y'); }
    run();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(run, 150); });
  });

  /* ---------- Workbench: drag prints around, click to open the loupe ---------- */
  var prints = Array.prototype.slice.call(document.querySelectorAll('.print'));

  boot('loupe', function () {
    var dlg = document.getElementById('loupe');
    if (!dlg || typeof dlg.showModal !== 'function') {
      // No <dialog> support: the print buttons open the image directly.
      prints.forEach(function (p) { p.addEventListener('click', function () { if (!p.dataset.dragged) window.open(p.dataset.full, '_blank', 'noopener'); }); });
      return;
    }
    var img = document.getElementById('loupeImg');
    var view = img.parentNode;
    var title = document.getElementById('loupeTitle');
    var sub = document.getElementById('loupeSub');
    var detail = document.getElementById('loupeDetail');
    var index = 0, showingDetail = false, opener = null;

    function show(i) {
      index = (i + prints.length) % prints.length;
      var p = prints[index];
      var source = p.querySelector('img');
      showingDetail = false;
      img.src = p.dataset.full;
      img.alt = source ? source.alt : '';
      title.textContent = p.dataset.title || '';
      sub.textContent = p.dataset.sub || '';
      view.classList.toggle('is-paper', p.classList.contains('print--paper'));
      detail.hidden = !p.dataset.detail;
      detail.textContent = 'Detail';
    }
    detail.addEventListener('click', function () {
      var p = prints[index];
      showingDetail = !showingDetail;
      img.src = showingDetail ? p.dataset.detail : p.dataset.full;
      img.alt = showingDetail ? 'Close-up detail of ' + (p.dataset.title || 'the piece') + '.' : p.querySelector('img').alt;
      detail.textContent = showingDetail ? 'Full view' : 'Detail';
    });
    document.getElementById('loupePrev').addEventListener('click', function () { show(index - 1); });
    document.getElementById('loupeNext').addEventListener('click', function () { show(index + 1); });
    document.getElementById('loupeClose').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); // backdrop
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });
    dlg.addEventListener('close', function () { img.removeAttribute('src'); if (opener) opener.focus(); });

    prints.forEach(function (p, n) {
      p.setAttribute('aria-label', 'Look closer: ' + (p.dataset.title || '') + (p.dataset.sub ? ', ' + p.dataset.sub : ''));
      p.addEventListener('click', function (e) {
        if (p.dataset.dragged) { e.preventDefault(); delete p.dataset.dragged; return; }
        opener = p;
        show(n);
        dlg.showModal();
        document.getElementById('loupeClose').focus();
      });
    });
  });

  boot('drag', function () {
    var spread = document.getElementById('spread');
    var canDrag = window.matchMedia('(min-width: 1100px) and (pointer: fine)');
    if (!spread || !window.PointerEvent) return;
    var z = 30;

    prints.forEach(function (p) {
      var startX, startY, baseX, baseY, moved, id = null;

      p.addEventListener('pointerdown', function (e) {
        if (!canDrag.matches || e.button !== 0) return;
        id = e.pointerId; moved = false;
        startX = e.clientX; startY = e.clientY;
        baseX = p.offsetLeft; baseY = p.offsetTop;
        p.setPointerCapture(id);
      });
      p.addEventListener('pointermove', function (e) {
        if (id !== e.pointerId) return;
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return;
        if (!moved) { moved = true; p.classList.add('is-dragging'); p.style.zIndex = ++z; }
        var maxX = spread.clientWidth - p.offsetWidth * 0.4;
        var maxY = spread.clientHeight - p.offsetHeight * 0.3;
        var x = Math.max(-p.offsetWidth * 0.3, Math.min(maxX, baseX + dx));
        var y = Math.max(-20, Math.min(maxY, baseY + dy));
        p.style.setProperty('--x', (x / spread.clientWidth * 100) + '%');
        p.style.setProperty('--y', (y / spread.clientHeight * 100) + '%');
      });
      function end(e) {
        if (id !== e.pointerId) return;
        id = null;
        if (moved) {
          p.dataset.dragged = '1'; // swallow the click that follows a drag
          p.classList.remove('is-dragging');
          setTimeout(function () { delete p.dataset.dragged; }, 80);
        }
      }
      p.addEventListener('pointerup', end);
      p.addEventListener('pointercancel', end);
    });
  });

  /* ---------- Nav: light the key for the section in view ---------- */
  boot('scrollspy', function () {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('nav[aria-label="Primary"] a, #mobileMenu a'));
    var ids = ['work', 'workbench', 'about', 'contact'];
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var hash = '#' + e.target.id;
        links.forEach(function (a) {
          if (a.getAttribute('href') === hash) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  });
})();
