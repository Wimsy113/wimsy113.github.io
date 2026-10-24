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

    // Number keys 1–4 tune straight to a project while the work section is on screen.
    var workInView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { workInView = entries[0].isIntersecting; }, { threshold: 0.25 })
        .observe(document.getElementById('work'));
    }
    window.addEventListener('keydown', function (e) {
      if (!workInView || !wide.matches || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || document.querySelector('dialog[open]')) return;
      var n = ['1', '2', '3', '4'].indexOf(e.key);
      if (n < 0 || n >= keys.length) return;
      e.preventDefault();
      select(n, bank.contains(document.activeElement));
    });

    // A deep link such as index.html#case-tl opens that case.
    var fromHash = panels.map(function (p) { return '#' + p.id; }).indexOf(location.hash);
    if (fromHash > -1 && wide.matches) select(fromHash, false);
  });

  /* ---------- Work light: one cursor-driven light across the whole surface ---------- */
  boot('worklight', function () {
    var layer = document.querySelector('.surface-light');
    if (!layer) return;
    var root = html.style;
    var fig = document.querySelector('.hero__cicada');
    var veins = fig && fig.querySelector('.hero__veins');
    var ring = fig && fig.querySelector('.hero__ring');
    var mat = document.querySelector('.mat');
    var matPrints = Array.prototype.slice.call(document.querySelectorAll('.print'));
    // Only a real mouse or pen drives it; touch and reduced motion leave it resting in place.
    var live = window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches;
    var px = -1, py = -1, queued = false;

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function lightCicada() {
      var r = fig.getBoundingClientRect();
      if (py < r.top - 200 || py > r.bottom + 200) { veins.style.setProperty('--vo', '0'); return; }
      // Map the pointer into the figure's own (rotated) coordinates.
      var t = getComputedStyle(fig).transform;
      var a = 0;
      if (t && t !== 'none') { var m = t.match(/matrix\(([^,]+),\s*([^,]+)/); if (m) a = Math.atan2(parseFloat(m[2]), parseFloat(m[1])); }
      var w = fig.offsetWidth, h = fig.offsetHeight;
      var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      var cos = Math.cos(-a), sin = Math.sin(-a);
      var lx = dx * cos - dy * sin + w / 2, ly = dx * sin + dy * cos + h / 2;
      var inside = lx > -60 && lx < w + 60 && ly > -60 && ly < h + 60;
      veins.style.setProperty('--vx', lx.toFixed(0) + 'px');
      veins.style.setProperty('--vy', ly.toFixed(0) + 'px');
      veins.style.setProperty('--vo', inside ? '1' : '0');
      if (ring) {
        ring.style.setProperty('--rdx', clamp((lx - w * 0.29) * 0.05, -14, 14).toFixed(1) + 'px');
        ring.style.setProperty('--rdy', clamp((ly - h * 0.5) * 0.05, -14, 14).toFixed(1) + 'px');
      }
    }

    function lightMat() {
      var r = mat.getBoundingClientRect();
      var over = px > r.left - 80 && px < r.right + 80 && py > r.top - 80 && py < r.bottom + 80;
      mat.style.setProperty('--mo', over ? '1' : '.6');
      if (!over) return;
      mat.style.setProperty('--mx', (px - r.left).toFixed(0) + 'px');
      mat.style.setProperty('--my', (py - r.top).toFixed(0) + 'px');
      matPrints.forEach(function (p) {
        var pr = p.getBoundingClientRect();
        p.style.setProperty('--shx', clamp((pr.left + pr.width / 2 - px) / 40, -14, 14).toFixed(1));
        p.style.setProperty('--shy', clamp((pr.top + pr.height / 2 - py) / 40, -8, 14).toFixed(1));
      });
    }

    function frame() {
      queued = false;
      root.setProperty('--gy', (-(window.scrollY % 24)) + 'px'); // keep the lit grid on the page's grid
      if (!live || px < 0) return;
      root.setProperty('--lx', px + 'px');
      root.setProperty('--ly', py + 'px');
      root.setProperty('--lo', '1');
      if (fig && veins) lightCicada();
      if (mat) lightMat();
    }
    function queue() { if (!queued) { queued = true; window.requestAnimationFrame(frame); } }

    window.addEventListener('scroll', queue, { passive: true });
    if (live) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        px = e.clientX; py = e.clientY; queue();
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', function () {
        root.setProperty('--lo', '.55');
        if (veins) veins.style.setProperty('--vo', '0');
        if (mat) mat.style.setProperty('--mo', '.6');
      });
    }
    frame();
  });

  /* ---------- Case display: lean toward the cursor ---------- */
  boot('caseDisplay', function () {
    var fine = window.matchMedia('(pointer: fine)').matches;
    Array.prototype.forEach.call(document.querySelectorAll('.case__visual'), function (v) {
      var plane = v.querySelector('.plane');
      if (fine && !reduceMotion.matches && plane) {
        v.addEventListener('pointermove', function (e) {
          var r = v.getBoundingClientRect();
          var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
          plane.style.setProperty('--ty', (nx * 8).toFixed(2) + 'deg');
          plane.style.setProperty('--tx', (-ny * 6).toFixed(2) + 'deg');
        });
        v.addEventListener('pointerleave', function () {
          plane.style.setProperty('--ty', '0deg');
          plane.style.setProperty('--tx', '0deg');
        });
      }
    });
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
