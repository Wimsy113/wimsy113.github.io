/* Case study dossier enhancements (ResiliencePoint).
   Everything here is additive: the page is complete and readable without it.
   All annotation, callout and comparison text is quoted verbatim from the case study. */
(function () {
  'use strict';

  var html = document.documentElement;
  var main = document.getElementById('main');
  if (!main) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phoneQ = window.matchMedia('(max-width: 859px)');

  function boot(name, fn) { try { fn(); } catch (err) { if (window.console) console.error('[dossier] ' + name + ' failed:', err); } }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  html.classList.add('dz');
  if (!reduce && 'IntersectionObserver' in window) html.classList.add('dz-motion');

  var sections = $$('section[id]', main).filter(function (s) { return s.parentNode === main; });
  var tocLinks = $$('#toc-list a');

  /* ---------- Figure bleed: wide figures run to the page edge on large screens ---------- */
  boot('bleed', function () {
    function measure() {
      var vw = document.documentElement.clientWidth;
      if (vw < 1100) { main.style.setProperty('--dz-bleed', '0px'); return; }
      var rail = parseFloat(getComputedStyle(html).getPropertyValue('--rail-w')) || 48;
      var gap = Math.max(0, vw - rail - main.getBoundingClientRect().right - 32);
      main.style.setProperty('--dz-bleed', Math.round(gap) + 'px');
    }
    measure();
    window.addEventListener('resize', measure);
  });

  /* ---------- Annotations: pins on screenshots, with a key quoting the text ---------- */
  var NOTES = {
    2: { cite: '04 · Designing the Dashboard', pins: [
      [52, 5, 'the interface surfaced the top ten hazards'],
      [5.5, 24, 'redesigning the side menu'],
      [55, 40, 'Map behavior changed depending on the type of jurisdiction being viewed'],
      [30, 72, 'Quick statistics and trend cards gave users an immediate snapshot of preparedness']
    ] },
    5: { cite: '05 · The Problem We Found', pins: [[50, 7, 'controls that behaved more like dashboard dropdowns']] },
    6: { cite: '06 · The Pivot', pins: [[40, 47, 'Selections were visible.']] },
    7: { cite: '07 · Designing for Real Questions', pins: [[39, 11, 'Adding a resident/visitor toggle allowed emergency managers to investigate the preparedness experience of each group separately.']] }
  };
  boot('annotations', function () {
    Object.keys(NOTES).forEach(function (k) {
      var btn = $('.fig-btn[data-fig="' + k + '"]', main);
      if (!btn) return;
      var fig = btn.closest('figure');
      var note = NOTES[k];
      var legend = el('ol', 'dz-legend');
      legend.setAttribute('aria-hidden', 'true'); // verbatim repeats of the text above; don't read twice
      var pins = [];
      note.pins.forEach(function (p, i) {
        var pin = el('span', 'dz-pin');
        pin.setAttribute('data-n', String(i + 1));
        pin.style.left = p[0] + '%';
        pin.style.top = p[1] + '%';
        pin.setAttribute('aria-hidden', 'true');
        btn.appendChild(pin);
        pins.push(pin);
        var li = el('li');
        li.appendChild(el('b', null, String(i + 1)));
        var body = el('span');
        body.appendChild(el('q', null, p[2]));
        body.appendChild(el('cite', null, note.cite));
        li.appendChild(body);
        li.addEventListener('pointerenter', function () { pin.classList.add('is-hot'); li.classList.add('is-hot'); });
        li.addEventListener('pointerleave', function () { pin.classList.remove('is-hot'); li.classList.remove('is-hot'); });
        legend.appendChild(li);
      });
      fig.appendChild(legend);
    });
  });

  /* ---------- Callouts: figures the text already states, in the margin ---------- */
  var CALLOUTS = [
    { s: 's04', before: 1, big: '10', label: '“the interface surfaced the top ten hazards”' },
    { s: 's07', before: -1, big: '400–500 ft', label: '“a roughly 400 to 500 foot geographic buffer”' },
    { s: 's08', before: -1, big: 'PNG · PDF', label: '“visualizations and information to be exported as PNG or PDF”' },
    { s: 's09', before: 1, big: '4', label: '“four inclusivity showstoppers”' },
    { s: 's11', before: 1, big: 'May–Aug 2024', label: '“acceptance testing between approximately May and August 2024”' }
  ];
  boot('callouts', function () {
    CALLOUTS.forEach(function (c) {
      var sec = document.getElementById(c.s);
      if (!sec) return;
      var paras = $$(':scope > p', sec).slice(1); // skip the chapter label
      var anchor = c.before === -1 ? paras[paras.length - 1] : paras[c.before - 1];
      if (!anchor) return;
      var box = el('aside', 'dz-callout');
      box.setAttribute('aria-hidden', 'true');
      box.appendChild(el('b', null, c.big));
      box.appendChild(el('span', null, c.label));
      sec.insertBefore(box, anchor);
    });
  });

  /* ---------- FIG. 06 ↔ FIG. 07: shift emphasis between the two approaches ---------- */
  boot('compare', function () {
    var s06 = document.getElementById('s06');
    var b06 = $('.fig-btn[data-fig="5"]', main), b07 = $('.fig-btn[data-fig="6"]', main);
    if (!s06 || !b06 || !b07) return;

    var wrap = el('div', 'dz-compare');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Compare FIG. 06 and FIG. 07');
    var head = el('div', 'dz-compare__head');
    var title = el('p', 'dz-compare__title');
    title.innerHTML = 'FIG. 06 <span aria-hidden="true">→</span> FIG. 07';
    head.appendChild(title);
    head.appendChild(el('p', 'dz-compare__hint', 'Drag to shift emphasis · select a screen to inspect'));
    wrap.appendChild(head);

    var stage = el('div', 'dz-compare__stage');
    function side(cls, srcBtn, num, caption, quote, cite) {
      var f = el('figure', 'dz-compare__side ' + cls);
      var frame = el('button', 'dz-compare__frame');
      frame.type = 'button';
      frame.setAttribute('aria-label', 'Inspect ' + num + ' · ' + caption);
      var img = srcBtn.querySelector('img').cloneNode(false);
      img.removeAttribute('style');
      img.removeAttribute('loading'); // its original is already loaded or loading; don't leave an empty frame
      frame.appendChild(img);
      frame.addEventListener('click', function () { srcBtn.click(); }); // opens the page's own viewer
      var cap = el('p', 'dz-compare__cap');
      cap.innerHTML = '<span>' + num + '</span> · ' + caption;
      var q = el('blockquote', 'dz-compare__quote', quote);
      q.setAttribute('aria-hidden', 'true');
      q.appendChild(el('cite', null, cite));
      f.appendChild(frame); f.appendChild(cap); f.appendChild(q);
      return f;
    }
    var before = side('is-before', b06, 'FIG. 06', 'Earlier dropdown/filter design',
      'Filtering was originally handled through controls that behaved more like dashboard dropdowns. That approach worked while the number of options was small. It did not scale.',
      '05 · The Problem We Found');
    var after = side('is-after', b07, 'FIG. 07', 'The redesigned, full-page query builder',
      'Instead of opening several dropdowns and trying to remember what had been selected, users could progressively build a query. Selections were visible.',
      '06 · The Pivot');
    stage.appendChild(before); stage.appendChild(after);
    wrap.appendChild(stage);

    var controls = el('div', 'dz-compare__controls');
    var left = el('button', 'dz-compare__end', 'FIG. 06'); left.type = 'button';
    var right = el('button', 'dz-compare__end', 'FIG. 07'); right.type = 'button';
    var range = el('input', 'dz-compare__range');
    range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50';
    range.setAttribute('aria-label', 'Emphasis, from FIG. 06 (earlier design) to FIG. 07 (redesigned query builder)');
    controls.appendChild(left); controls.appendChild(range); controls.appendChild(right);
    wrap.appendChild(controls);

    function apply(v) {
      var m = clamp(v / 100, 0, 1);
      stage.style.setProperty('--m', m.toFixed(3));
      // Set directly too, for engines that don't resolve calc() inside flex-grow.
      before.style.flexGrow = (0.75 + (1 - m) * 1.05).toFixed(3);
      after.style.flexGrow = (0.75 + m * 1.05).toFixed(3);
      range.setAttribute('aria-valuetext', m < 0.34 ? 'FIG. 06 emphasised' : m > 0.66 ? 'FIG. 07 emphasised' : 'Both shown equally');
      left.setAttribute('aria-pressed', m < 0.34 ? 'true' : 'false');
      right.setAttribute('aria-pressed', m > 0.66 ? 'true' : 'false');
    }
    range.addEventListener('input', function () { apply(+range.value); });
    left.addEventListener('click', function () { range.value = '0'; apply(0); });
    right.addEventListener('click', function () { range.value = '100'; apply(100); });
    apply(50);

    var fig07 = b07.closest('figure');
    fig07.parentNode.insertBefore(wrap, fig07.nextSibling);
  });

  /* ---------- Contents navigator: active chapter, per-chapter and overall progress ---------- */
  var chapbar = null;
  boot('navigator', function () {
    var bar = el('div', 'dz-progress');
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    tocLinks.forEach(function (a) {
      var t = el('span', 'dz-tocbar');
      t.setAttribute('aria-hidden', 'true');
      t.appendChild(el('i'));
      a.appendChild(t);
    });
    var list = $('#toc-list');
    var readout = el('p', 'dz-readout');
    readout.setAttribute('aria-hidden', 'true');
    readout.innerHTML = '<span>Reading</span><b>0%</b>';
    if (list) list.parentNode.insertBefore(readout, list);
    var readoutNum = $('b', readout);

    // Phone / small tablet chapter bar
    chapbar = el('div', 'dz-chapbar');
    var cbBtn = el('button', 'dz-chapbar__btn');
    cbBtn.type = 'button';
    cbBtn.setAttribute('aria-expanded', 'false');
    cbBtn.setAttribute('aria-controls', 'dz-chapters');
    var cbNum = el('span', 'dz-chapbar__num', '01');
    var cbName = el('span', 'dz-chapbar__name', 'Overview');
    cbBtn.appendChild(el('span', 'sr-dz', 'Chapter: '));
    cbBtn.lastChild.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    cbBtn.appendChild(cbNum); cbBtn.appendChild(cbName);
    var cbNav = el('nav');
    cbNav.setAttribute('aria-label', 'Chapters');
    var cbList = el('ol', 'dz-chapbar__list');
    cbList.id = 'dz-chapters';
    cbList.hidden = true;
    var cbLinks = tocLinks.map(function (a) {
      var li = el('li');
      var c = el('a', null, a.textContent.replace(/[■□]/g, '').trim());
      c.href = a.getAttribute('href');
      c.addEventListener('click', function () { setOpen(false); });
      li.appendChild(c);
      cbList.appendChild(li);
      return c;
    });
    cbNav.appendChild(cbList);
    chapbar.appendChild(cbBtn); chapbar.appendChild(cbNav);
    document.body.appendChild(chapbar);
    function setOpen(open) { cbBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); cbList.hidden = !open; }
    cbBtn.addEventListener('click', function () { setOpen(cbBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cbList.hidden) { setOpen(false); cbBtn.focus(); } });

    var tops = [], heights = [], mainTop = 0, mainH = 1;
    function measure() {
      var y = window.scrollY;
      sections.forEach(function (s, i) { var r = s.getBoundingClientRect(); tops[i] = r.top + y; heights[i] = r.height; });
      var mr = main.getBoundingClientRect();
      mainTop = mr.top + y; mainH = Math.max(1, mr.height);
    }
    var active = -1, queued = false;
    function frame() {
      queued = false;
      measure(); // live positions: lazy images keep changing section heights
      var y = window.scrollY, vh = window.innerHeight, line = y + vh * 0.35;
      var total = clamp((y + vh - mainTop) / mainH, 0, 1);
      bar.style.setProperty('--dz-p', total.toFixed(4));
      readoutNum.textContent = Math.round(total * 100) + '%';
      var idx = 0;
      sections.forEach(function (s, i) {
        var p = clamp((line - tops[i]) / heights[i], 0, 1);
        if (tocLinks[i]) tocLinks[i].style.setProperty('--sp', p.toFixed(3));
        if (tops[i] <= line) idx = i;
        if (!reduce) {
          var near = tops[i] < y + vh && tops[i] + heights[i] > y;
          if (near) s.style.setProperty('--chp', clamp((y + vh - tops[i]) / (vh + heights[i]), 0, 1).toFixed(3));
        }
      });
      if (idx !== active) {
        active = idx;
        tocLinks.forEach(function (a, i) { if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        cbLinks.forEach(function (a, i) { if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        var label = tocLinks[idx] ? tocLinks[idx].textContent.replace(/[■□]/g, '').trim() : '';
        var m = label.match(/^(\d+)\s+(.*)$/);
        cbNum.textContent = m ? m[1] : '';
        cbName.textContent = m ? m[2] : label;
      }
    }
    function queue() { if (!queued) { queued = true; window.requestAnimationFrame(frame); } }
    measure(); frame();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { measure(); queue(); });
    window.addEventListener('load', function () { measure(); queue(); });
    // Lazy images change section heights as they load.
    $$('img', main).forEach(function (img) { if (!img.complete) img.addEventListener('load', function () { measure(); queue(); }); });
  });

  /* ---------- Scroll-triggered chapter and figure entrances (never hide text paragraphs) ---------- */
  boot('reveal', function () {
    if (!html.classList.contains('dz-motion')) {
      sections.forEach(function (s) { s.classList.add('is-in'); });
      return;
    }
    $$('figure', main).forEach(function (f) { if (f.querySelector('.fig-btn')) f.classList.add('dz-reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    sections.forEach(function (s) { io.observe(s); });
    $$('figure.dz-reveal', main).forEach(function (f) { io.observe(f); });
    // Anything already above the fold (e.g. arriving via a #chapter link) shows at once.
    var vh = window.innerHeight;
    sections.concat($$('figure.dz-reveal', main)).forEach(function (t) { if (t.getBoundingClientRect().top < vh) t.classList.add('is-in'); });
  });

  /* ---------- Viewer: 1:1 zoom with drag-to-pan, and a figure counter ---------- */
  boot('viewer', function () {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var stage = lb.children[1];
    var barEl = lb.children[2];
    var next = document.getElementById('lbNext');
    var caption = document.getElementById('lbCaption');
    var imgs = $$('img', stage);

    var zoom = el('button', 'lb-nav', 'Zoom 1:1');
    zoom.type = 'button';
    zoom.setAttribute('aria-pressed', 'false');
    zoom.style.cssText = "font:700 12px/1 'Space Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#F2F0E9;background:transparent;border:1px solid #F2F0E9;padding:0 16px;min-height:44px;cursor:pointer";
    var counter = el('span', null, '');
    counter.style.cssText = "font:700 12px/1 'Space Mono',monospace;letter-spacing:.08em;color:#A8FF00;margin-right:10px";
    if (barEl && next) barEl.insertBefore(zoom, next);
    // Beside the caption, not inside it: the page's own script rewrites the caption text.
    if (caption) {
      var capWrap = el('div');
      capWrap.style.cssText = 'display:flex;align-items:baseline;justify-content:center;flex-wrap:wrap;gap:4px';
      caption.parentNode.insertBefore(capWrap, caption);
      capWrap.appendChild(counter);
      capWrap.appendChild(caption);
    }

    function activeImg() { return imgs.filter(function (i) { return i.getAttribute('data-active') === 'true'; })[0]; }
    function setZoom(on) {
      var img = activeImg();
      zoom.setAttribute('aria-pressed', on ? 'true' : 'false');
      zoom.textContent = on ? 'Fit to screen' : 'Zoom 1:1';
      stage.style.overflow = on ? 'auto' : '';
      stage.style.alignItems = on ? 'flex-start' : '';
      stage.style.justifyContent = on ? 'flex-start' : '';
      stage.style.cursor = on ? 'grab' : '';
      imgs.forEach(function (i) { i.style.maxWidth = ''; i.style.maxHeight = ''; i.style.cursor = 'zoom-in'; });
      if (on && img) {
        img.style.maxWidth = 'none'; img.style.maxHeight = 'none'; img.style.cursor = 'grab';
        stage.scrollLeft = (img.scrollWidth - stage.clientWidth) / 2;
        stage.scrollTop = 0;
      }
    }
    function sync() {
      setTimeout(function () {
        var img = activeImg();
        if (img) counter.textContent = String(+img.getAttribute('data-fig-img') + 1).padStart(2, '0') + ' / ' + String(imgs.length).padStart(2, '0');
        setZoom(false);
      }, 0);
    }
    zoom.addEventListener('click', function () { setZoom(zoom.getAttribute('aria-pressed') !== 'true'); });
    imgs.forEach(function (i) {
      i.style.cursor = 'zoom-in';
      i.addEventListener('click', function () { if (!moved) setZoom(zoom.getAttribute('aria-pressed') !== 'true'); });
    });
    // Drag to pan while zoomed.
    var drag = null, moved = false;
    stage.addEventListener('pointerdown', function (e) {
      if (zoom.getAttribute('aria-pressed') !== 'true') return;
      drag = { x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop }; moved = false;
      stage.setPointerCapture(e.pointerId); stage.style.cursor = 'grabbing';
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      stage.scrollLeft = drag.l - dx; stage.scrollTop = drag.t - dy;
    });
    function endDrag() { if (drag) { drag = null; stage.style.cursor = 'grab'; setTimeout(function () { moved = false; }, 0); } }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); setZoom(zoom.getAttribute('aria-pressed') !== 'true'); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Escape') sync();
    });
    ['lbPrev', 'lbNext', 'lbClose'].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener('click', sync); });
    $$('.fig-btn').forEach(function (b) { b.addEventListener('click', sync); });
  });
})();
