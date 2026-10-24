/* Homepage motion system.
   One vocabulary for four behaviours, sharing one engine:
   1. Entrance      — the composition assembles: rules draw, the cicada opens from its axis line,
                      the name rises out of its baseline and EWING slides in across the wing.
   2. Living        — the cicada leans toward the cursor while the name and glass panel counter-move;
                      letters near the cursor lift and hollow out; a needle rides the tick rule.
   3. Projects      — switching projects collapses the old screen to a line, rolls the stage numeral,
                      turns the ring, re-crops the cicada behind the display, and raises the title.
   4. The flight    — click the cicada and it takes off, buzzing through the layout; the same letter
                      physics now push the name out of its way, then it lands and lights up.
   Each part boots in its own try/catch; the page works without this file. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var wideQ = window.matchMedia('(min-width: 1100px)');
  var phoneQ = window.matchMedia('(max-width: 699px)');
  var canAnimate = typeof Element.prototype.animate === 'function';
  var OUT = 'cubic-bezier(.16, 1, .3, 1)';
  var IN_OUT = 'cubic-bezier(.65, 0, .35, 1)';
  var ARC = 'cubic-bezier(.45, 0, .55, 1)';

  function boot(name, fn) {
    try { fn(); } catch (err) {
      html.classList.remove('entrance');
      if (window.console) console.error('[motion] ' + name + ' failed:', err);
    }
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var hero = $('.hero');
  var fig = $('.hero__cicada');
  var name = $('.hero__name');
  var deck = $('.deck');
  var heroTop = $('.hero__top');
  var hit = fig && $('.cicada-hit', fig);

  /* Split text into letters (kept in unbreakable words), with one readable copy for assistive tech. */
  function splitLetters(el) {
    if (!el) return [];
    if (el.getAttribute('data-split')) return $$('.ch', el);
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement('span');
        word.className = 'word';
        word.setAttribute('aria-hidden', 'true');
        part.split('').forEach(function (c) {
          var s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          word.appendChild(s);
        });
        frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.insertBefore(sr, el.firstChild);
    el.setAttribute('data-split', '1');
    return $$('.ch', el);
  }

  var nameLetters = splitLetters(name);

  /* ======================================================================
     The engine: smoothed pointer, letter physics, and an optional attractor
     (the flying cicada) that pushes the composition around.
     ====================================================================== */
  var Engine = (function () {
    var raf = 0, enabled = false, heroInView = true, idleTimer = 0;
    var tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    var pointer = { x: 0, y: 0, active: false };
    var attractor = null;
    var deckOff = { x: 0, y: 0 };
    var letters = nameLetters.map(function (el) { return { el: el, x: 0, y: 0, r: 0, hollow: false }; });
    var marker = null;

    if (heroTop) {
      marker = document.createElement('span');
      marker.className = 'hero__marker';
      marker.setAttribute('aria-hidden', 'true');
      heroTop.appendChild(marker);
    }

    function step() {
      raf = 0;
      var phone = phoneQ.matches;

      // Reads first, writes after: no layout thrash.
      var src = null, mode = 'lift';
      if (attractor) { src = attractor(); mode = 'repel'; }
      else if (pointer.active && enabled) src = pointer;
      var rects = src ? letters.map(function (L) { return L.el.getBoundingClientRect(); }) : null;
      var deckRect = (src && mode === 'repel' && deck) ? deck.getBoundingClientRect() : null;
      var topRect = (marker && pointer.active && enabled && !attractor) ? heroTop.getBoundingClientRect() : null;

      var moving = false;
      cur.x += (tgt.x - cur.x) * 0.075;
      cur.y += (tgt.y - cur.y) * 0.075;
      if (Math.abs(tgt.x - cur.x) > 0.0008 || Math.abs(tgt.y - cur.y) > 0.0008) moving = true;

      if (fig && !phone) {
        fig.style.setProperty('--fx', (cur.x * 26).toFixed(2) + 'px');
        fig.style.setProperty('--fy', (cur.y * 16).toFixed(2) + 'px');
        fig.style.setProperty('--fr', (cur.x * 1.8).toFixed(3) + 'deg');
      }
      if (name) {
        name.style.setProperty('--nx', (cur.x * -16).toFixed(2) + 'px');
        name.style.setProperty('--ny', (cur.y * -9).toFixed(2) + 'px');
      }
      if (deck) {
        deck.style.setProperty('--dry', (cur.x * 5).toFixed(3) + 'deg');
        deck.style.setProperty('--drx', (cur.y * -4).toFixed(3) + 'deg');
      }

      letters.forEach(function (L, i) {
        var tx = 0, ty = 0, tr = 0, hollow = false;
        if (src) {
          var r = rects[i];
          var cx = r.left + r.width / 2 - L.x, cy = r.top + r.height / 2 - L.y;
          var dx = cx - src.x, dy = cy - src.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (mode === 'lift') {
            var k = Math.max(0, 1 - d / 190); k *= k;
            ty = -k * 26; tr = (dx > 0 ? 1 : -1) * k * 7; hollow = k > 0.4;
          } else {
            var k2 = Math.max(0, 1 - d / 360);
            tx = dx / d * k2 * 95; ty = dy / d * k2 * 75; tr = (dx > 0 ? 1 : -1) * k2 * 26;
          }
        }
        L.x += (tx - L.x) * 0.16; L.y += (ty - L.y) * 0.16; L.r += (tr - L.r) * 0.16;
        if (Math.abs(tx - L.x) > 0.05 || Math.abs(ty - L.y) > 0.05 || Math.abs(tr - L.r) > 0.05) moving = true;
        L.el.style.setProperty('--cx', L.x.toFixed(2) + 'px');
        L.el.style.setProperty('--cy', L.y.toFixed(2) + 'px');
        L.el.style.setProperty('--cr', L.r.toFixed(2) + 'deg');
        if (hollow !== L.hollow) { L.hollow = hollow; L.el.classList.toggle('is-hollow', hollow); }
      });

      if (deck) {
        var dtx = 0, dty = 0;
        if (deckRect) {
          var ddx = deckRect.left + deckRect.width / 2 - deckOff.x - src.x;
          var ddy = deckRect.top + deckRect.height / 2 - deckOff.y - src.y;
          var dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1, k3 = Math.max(0, 1 - dd / 560);
          dtx = ddx / dd * k3 * 46; dty = ddy / dd * k3 * 28;
        }
        deckOff.x += (dtx - deckOff.x) * 0.12; deckOff.y += (dty - deckOff.y) * 0.12;
        if (Math.abs(dtx - deckOff.x) > 0.05 || Math.abs(dty - deckOff.y) > 0.05) moving = true;
        deck.style.setProperty('--dsx', deckOff.x.toFixed(2) + 'px');
        deck.style.setProperty('--dsy', deckOff.y.toFixed(2) + 'px');
      }

      if (marker) {
        if (topRect) {
          marker.style.setProperty('--mkx', clamp(pointer.x - topRect.left, 0, topRect.width).toFixed(1) + 'px');
          marker.style.setProperty('--mko', '1');
        } else {
          marker.style.setProperty('--mko', '0');
        }
      }

      if (moving || attractor) raf = window.requestAnimationFrame(step);
    }
    function kick() { if (!raf) raf = window.requestAnimationFrame(step); }

    function rest() {
      tgt.x = 0; tgt.y = 0; pointer.active = false;
      kick();
    }

    if (fine && !reduce) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        pointer.x = e.clientX; pointer.y = e.clientY;
        pointer.active = heroInView;
        if (enabled && heroInView) {
          tgt.x = clamp(e.clientX / window.innerWidth * 2 - 1, -1, 1);
          tgt.y = clamp(e.clientY / window.innerHeight * 2 - 1, -1, 1);
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(rest, 4500); // idle: everything settles back
        kick();
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', rest);
      window.addEventListener('scroll', function () { if (pointer.active) kick(); }, { passive: true });
    }
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroInView = entries[0].isIntersecting;
        if (!heroInView) rest();
      }).observe(hero);
    }

    return {
      enable: function () { enabled = true; kick(); },
      attract: function (fn) { attractor = fn; kick(); },
      release: function () { attractor = null; kick(); }
    };
  })();

  /* ======================================================================
     1. Entrance
     ====================================================================== */
  boot('entrance', function () {
    if (!html.classList.contains('entrance') || !canAnimate || !hero) {
      html.classList.remove('entrance');
      Engine.enable();
      return;
    }
    var full = html.getAttribute('data-entrance') === 'full';
    var phone = phoneQ.matches;
    var anims = [];
    function a(el, keyframes, opts) {
      if (!el) return null;
      var o = { duration: 800, delay: 0, easing: OUT, fill: 'backwards' };
      for (var k in opts) o[k] = opts[k];
      var an = el.animate(keyframes, o);
      anims.push(an);
      return an;
    }
    var nav = $('nav[aria-label="Primary"]');
    var bar = $('#mobileBar');
    var role = $('.hero__role');
    var strip = $('.hero__strip');
    var axis = fig && $('.hero__axis', fig);
    var ring = fig && $('.hero__ring', fig);
    var img = fig && $('img', fig);
    var words = name ? $$('.hero__name > span:not(.sr-only)') : [];

    if (full) {
      // The rules draw first, like an instrument warming up.
      a(heroTop, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 100 });
      $$('.hero__scale', hero).forEach(function (s, i) {
        a(s, [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }],
          { duration: 1100, delay: 150 + i * 1000, easing: IN_OUT });
      });
      // The cicada opens from its own axis line — the same move as a project screen switching on.
      a(fig, [
        { opacity: 0, clipPath: 'inset(49.6% 0 49.6% 0)', filter: 'brightness(3.5)' },
        { opacity: 1, clipPath: 'inset(49.6% 0 49.6% 0)', filter: 'brightness(3.5)', offset: 0.22 },
        { opacity: 1, clipPath: 'inset(0% 0 0% 0)', filter: 'brightness(1.6)', offset: 0.62 },
        { opacity: 1, clipPath: 'inset(0% 0 0% 0)', filter: 'brightness(1)' }
      ], { duration: 1500, delay: 300, easing: 'cubic-bezier(.2, .7, .2, 1)' });
      a(img, [{ scale: '1.16' }, { scale: '1' }], { duration: 2400, delay: 300 });
      a(axis, phone ? [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }] : [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 1000, delay: 450, easing: IN_OUT });
      a(ring, [{ opacity: 0, rotate: '-140deg', scale: '.3' }, { opacity: 0.55, rotate: '0deg', scale: '1' }], { duration: 1500, delay: 700 });

      // KRYSTYNA rises out of its baseline; EWING slides in across the wing and overshoots.
      if (name) name.classList.add('is-entering');
      if (words[0]) $$('.ch', words[0]).forEach(function (ch, i) {
        a(ch, [{ transform: 'translate3d(0, 105%, 0) rotate(6deg)' }, { transform: 'translate3d(0, 0, 0) rotate(0deg)' }],
          { duration: 1000, delay: 900 + i * 55 });
      });
      if (words[1]) $$('.ch', words[1]).forEach(function (ch, i) {
        a(ch, [
          { transform: 'translate3d(65vw, 0, 0) skewX(-18deg)', opacity: 0 },
          { transform: 'translate3d(-0.08em, 0, 0) skewX(5deg)', opacity: 1, offset: 0.72 },
          { transform: 'translate3d(0, 0, 0) skewX(0deg)', opacity: 1 }
        ], { duration: 1300, delay: 1150 + i * 70 });
      });
      a(role, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 900, delay: 1800, easing: 'steps(18, end)' });

      // The glass panel opens from a line too, then its contents step in.
      a(deck, [{ opacity: 0, clipPath: 'inset(50% 0 50% 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0% 0)' }], { duration: 800, delay: 1450, easing: IN_OUT });
      if (deck) Array.prototype.forEach.call(deck.children, function (c, i) {
        a(c, [{ opacity: 0, transform: 'translate3d(0, 16px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }], { duration: 700, delay: 1700 + i * 110 });
      });
      a(strip, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1900 });
      $$('.indicators .led', hero).forEach(function (led, i) {
        a(led, [{ opacity: 0.1, filter: 'brightness(.2)' }, { opacity: 1, filter: 'brightness(1)' }], { duration: 240, delay: 2050 + i * 140, easing: 'steps(2, end)' });
      });
      a(nav, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 600 });
      if (nav) $$('a, button', nav).forEach(function (it, i) {
        a(it, [{ opacity: 0, translate: '0 -18px' }, { opacity: 1, translate: '0 0' }], { duration: 500, delay: 700 + i * 80 });
      });
      a(bar, [{ opacity: 0, transform: 'translate3d(0, -100%, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }], { duration: 700, delay: 200 });
    } else {
      // Returning in the same visit, or arriving at a section: a quick version of the same moves.
      a(fig, [{ opacity: 0, clipPath: 'inset(49.6% 0 49.6% 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0% 0)' }], { duration: 650, easing: IN_OUT });
      a(name, [{ opacity: 0, transform: 'translate3d(0, 16px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }], { duration: 600, delay: 80 });
      [heroTop, role, deck, strip, nav, bar].forEach(function (el, i) {
        a(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 120 + i * 40 });
      });
    }

    // Hand over from the CSS hold to the animations in the same frame.
    html.classList.remove('entrance');

    var events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    function skip() { anims.forEach(function (an) { try { an.finish(); } catch (e) {} }); }
    events.forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });
    var finished = anims.map(function (an) { return an.finished.catch(function () {}); });
    Promise.all(finished).then(function () {
      events.forEach(function (ev) { window.removeEventListener(ev, skip, { passive: true }); });
      if (name) name.classList.remove('is-entering');
      Engine.enable();
    });
  });

  /* ======================================================================
     3. Project transitions
     ====================================================================== */
  boot('stage', function () {
    var cases = $('.cases');
    if (!cases) return;
    var panels = $$('.case', cases);
    panels.forEach(function (p) { splitLetters($('.case__title', p)); });

    var stage = document.createElement('div');
    stage.className = 'stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '<div class="stage__wing"></div><div class="stage__axis"></div><div class="stage__ring"></div>' +
      '<div class="stage__num"><span>01</span></div><div class="stage__sweep"></div>';
    cases.insertBefore(stage, cases.firstChild);
    var wing = $('.stage__wing', stage), ringEl = $('.stage__ring', stage), num = $('.stage__num', stage), sweep = $('.stage__sweep', stage);
    var crops = ['18% 46%', '76% 22%', '48% 88%', '96% 64%']; // a different part of the same cicada behind each project

    var keys = $$('#caseKeys .selkey');
    var current = Math.max(0, keys.map(function (k) { return k.getAttribute('aria-selected'); }).indexOf('true'));
    var angle = current * 90;
    function settle(to) {
      wing.style.setProperty('--wing-pos', crops[to % crops.length]);
      ringEl.style.setProperty('--sr', angle + 'deg');
      num.firstElementChild.textContent = pad(to + 1);
    }
    settle(current);

    function rise(panel, delay) {
      if (reduce || !canAnimate || !panel) return;
      $$('.case__title .ch', panel).forEach(function (ch, i) {
        ch.animate([{ transform: 'translate3d(0, .9em, 0) rotate(5deg)', opacity: 0 }, { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 }],
          { duration: 700, delay: (delay || 0) + i * 26, easing: OUT, fill: 'backwards' });
      });
      ['.case__meta', '.case__tagline', '.case__dek', '.case__links'].forEach(function (sel, i) {
        var el = $(sel, panel);
        if (el) el.animate([{ opacity: 0, transform: 'translate3d(0, 10px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
          { duration: 600, delay: (delay || 0) + 80 + i * 70, easing: OUT, fill: 'backwards' });
      });
    }

    document.addEventListener('ke:channel', function (e) {
      var d = e.detail || {};
      if (d.from === d.to) return;
      angle += (d.to - d.from) * 90;
      current = d.to;
      wing.style.setProperty('--wing-pos', crops[d.to % crops.length]);
      ringEl.style.setProperty('--sr', angle + 'deg');
      if (reduce || !canAnimate) { num.firstElementChild.textContent = pad(d.to + 1); return; }

      // The numeral rolls like a counter, in the direction of travel.
      var dir = d.to > d.from ? 1 : -1;
      $$('span', num).slice(1).forEach(function (s) { s.parentNode.removeChild(s); });
      var old = num.firstElementChild;
      var nu = document.createElement('span');
      nu.textContent = pad(d.to + 1);
      num.appendChild(nu);
      old.animate([{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(0, ' + (-100 * dir) + '%, 0)' }], { duration: 520, easing: IN_OUT, fill: 'forwards' });
      nu.animate([{ transform: 'translate3d(0, ' + (100 * dir) + '%, 0)' }, { transform: 'translate3d(0, 0, 0)' }], { duration: 640, delay: 90, easing: OUT, fill: 'backwards' })
        .finished.then(function () { if (old.parentNode) old.parentNode.removeChild(old); }, function () {});

      // A line sweeps the whole stage; the cicada behind the display re-opens from a line.
      sweep.animate([
        { top: '0%', opacity: 0 }, { top: '0%', opacity: 1, offset: 0.08 },
        { top: '100%', opacity: 0.9, offset: 0.85 }, { top: '100%', opacity: 0 }
      ], { duration: 620, easing: 'cubic-bezier(.5, 0, .2, 1)' });
      wing.animate([{ clipPath: 'inset(50% 0 50% 0)', opacity: 0.6 }, { clipPath: 'inset(0% 0 0% 0)', opacity: 0.2 }], { duration: 800, easing: OUT });
      rise(d.panel, 160);
    });

    // First time the projects come into view: raise the visible title(s).
    if ('IntersectionObserver' in window) {
      var seen = typeof WeakSet === 'function' ? new WeakSet() : null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || (seen && seen.has(en.target))) return;
          if (seen) seen.add(en.target);
          var panel = en.target.closest('.case');
          if (panel && !panel.hidden) rise(panel, 0);
          io.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      panels.forEach(function (p) { var t = $('.case__title', p); if (t) io.observe(t); });
    }
    // Keep the stage numeral in sync if the layout switches between stacked and tabbed.
    var resync = function () { settle(Math.max(0, keys.map(function (k) { return k.getAttribute('aria-selected'); }).indexOf('true'))); };
    if (wideQ.addEventListener) wideQ.addEventListener('change', resync); else wideQ.addListener(resync);
  });

  /* ======================================================================
     4. The flight
     ====================================================================== */
  boot('flight', function () {
    if (!fig || !hit) return;
    var img = $('img', fig);
    var flying = false;

    // Landing (or the whole interaction, with reduced motion): the cicada lights up and fades back.
    function flash() {
      fig.classList.add('is-landed');
      setTimeout(function () {
        fig.classList.add('is-settling');
        fig.classList.remove('is-landed');
        setTimeout(function () { fig.classList.remove('is-settling'); }, 1200);
      }, 380);
    }

    // [offset, x (viewport widths), y (viewport heights), extra rotation, scale]
    var DESK = [[0, 0, 0, 0, 1], [0.1, 0, -0.05, -4, 1.04], [0.27, -0.2, 0.16, -26, 0.52], [0.45, 0.0, 0.36, 10, 0.42],
                [0.62, 0.28, 0.14, 34, 0.46], [0.78, 0.12, -0.12, -14, 0.62], [0.9, 0.02, -0.03, -3, 0.95], [1, 0, 0, 0, 1]];
    var PHONE = [[0, 0, 0, 0, 1], [0.1, 0, -0.02, 0, 1.03], [0.3, 0.16, 0.22, 22, 0.6], [0.5, -0.16, 0.4, -24, 0.5],
                 [0.7, 0.12, 0.2, 16, 0.62], [0.88, 0, 0.02, -4, 0.95], [1, 0, 0, 0, 1]];

    function fly() {
      flying = true;
      var phone = phoneQ.matches;
      var W = window.innerWidth, H = window.innerHeight;
      var base = getComputedStyle(fig).transform;
      if (!base || base === 'none') base = '';
      var frames = (phone ? PHONE : DESK).map(function (p) {
        return {
          offset: p[0], easing: ARC,
          transform: 'translate3d(' + (p[1] * W).toFixed(1) + 'px, ' + (p[2] * H).toFixed(1) + 'px, 0) ' + base + ' rotate(' + p[3] + 'deg) scale(' + p[4] + ')'
        };
      });
      var DUR = 2800;

      html.classList.add('is-cicada-flying');
      fig.classList.add('is-flying');

      // Two fading echoes trail it on larger screens.
      var echoes = [];
      if (!phone) [0.34, 0.16].forEach(function (op, n) {
        var c = fig.cloneNode(false);
        c.className = fig.className + ' cicada-echo';
        c.setAttribute('aria-hidden', 'true');
        c.style.cssText = fig.style.cssText;
        c.style.opacity = op;
        var ci = img.cloneNode(false);
        ci.alt = '';
        c.appendChild(ci);
        fig.parentNode.insertBefore(c, fig.nextSibling);
        c.animate(frames, { duration: DUR, delay: (n + 1) * 75, fill: 'both' });
        echoes.push(c);
      });

      var main = fig.animate(frames, { duration: DUR });
      img.animate(phone ? [{ scale: '1 1' }, { scale: '.8 1' }, { scale: '1 1' }] : [{ scale: '1 1' }, { scale: '1 .8' }, { scale: '1 1' }],
        { duration: 64, iterations: Math.floor(DUR * 0.8 / 64), delay: DUR * 0.07 });

      // The same letter physics the cursor uses, now pushed away by the cicada's body.
      Engine.attract(function () { return center(hit); });

      function land() {
        echoes.forEach(function (c) { if (c.parentNode) c.parentNode.removeChild(c); });
        fig.classList.remove('is-flying');
        html.classList.remove('is-cicada-flying');
        Engine.release();
        flash();
        flying = false;
      }
      main.finished.then(land, land);
    }

    hit.addEventListener('click', function () {
      if (flying) return;
      if (reduce || !canAnimate) { flash(); return; }
      fly();
    });
  });
})();
