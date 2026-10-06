/* Noak Nails · demo · sticky chrome, mobile menu scroll-lock (measure target while lock
   active — no jump-to-top), YClients booking dialog, click-to-load map, reveal. */
(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  root.classList.add('js');
  var chrome = document.querySelector('.site-chrome');
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('site-menu');
  var label = btn ? btn.querySelector('.menu-label') : null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isOpen = false;
  var savedY = 0;
  var lockDepth = 0;

  function chromeHeight() { return chrome ? Math.round(chrome.getBoundingClientRect().height) : 0; }
  function syncChrome() { if (!isOpen) root.style.setProperty('--chrome-h', chromeHeight() + 'px'); }
  syncChrome();
  window.addEventListener('resize', syncChrome);
  if (chrome && 'ResizeObserver' in window) new ResizeObserver(syncChrome).observe(chrome);

  function jumpTo(y) {
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    root.style.scrollBehavior = prev;
  }
  /* document Y; valid normally and while body is fixed (menu lock active) */
  function docTop(el) {
    var base = root.classList.contains('menu-open') ? savedY : (window.scrollY || window.pageYOffset || 0);
    return Math.max(0, Math.round(el.getBoundingClientRect().top + base - chromeHeight()));
  }

  function lockScroll(cls) {
    if (lockDepth === 0) {
      savedY = window.scrollY || window.pageYOffset || 0;
      body.style.position = 'fixed';
      body.style.top = (-savedY) + 'px';
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
    }
    lockDepth++;
    root.classList.add(cls);
  }
  function unlockScroll(cls, destY) {
    root.classList.remove(cls);
    lockDepth = Math.max(0, lockDepth - 1);
    if (lockDepth > 0) return;
    var y = typeof destY === 'number' ? destY : savedY;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    jumpTo(y);
    requestAnimationFrame(function () { if (Math.abs((window.scrollY || 0) - y) > 1) jumpTo(y); });
  }

  function setMenuLabel(text) {
    if (label) label.textContent = text;
    else if (btn) btn.textContent = text;
  }

  function openMenu() {
    if (!menu || isOpen) return;
    var h = chromeHeight();
    root.style.setProperty('--chrome-h', h + 'px');
    menu.style.top = h + 'px';
    lockScroll('menu-open');
    menu.hidden = false;
    menu.scrollTop = 0;
    btn.setAttribute('aria-expanded', 'true');
    setMenuLabel('Закрыть');
    isOpen = true;
  }
  function closeMenu(restoreFocus, destY) {
    if (!menu || !isOpen) return;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    setMenuLabel('Меню');
    isOpen = false;
    unlockScroll('menu-open', destY);
    if (restoreFocus) btn.focus({ preventScroll: true });
  }

  if (btn && menu) {
    btn.addEventListener('click', function () { if (isOpen) closeMenu(true); else openMenu(); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeMenu(true); return; }
      if (e.key === 'Tab') {
        var items = [btn].concat(Array.prototype.slice.call(menu.querySelectorAll('a[href]')));
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
      }
    });
    menu.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (a && a.getAttribute('href').charAt(0) !== '#') closeMenu(false);
    });
    var mq = window.matchMedia('(min-width: 960px)');
    var onMq = function (m) { if (m.matches) closeMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  function focusSection(el) {
    var heading = el.querySelector('h1, h2') || el;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var dest = id === 'top' ? 0 : docTop(el);
    if (isOpen) {
      closeMenu(false, dest);
    } else if (!reduceMotion) {
      window.scrollTo({ top: dest, behavior: 'smooth' });
    } else {
      jumpTo(dest);
    }
    if (history.pushState) history.pushState(null, '', '#' + id);
    if (id !== 'top' && id !== 'main') focusSection(el);
  });
  function landHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (el) jumpTo(docTop(el));
  }
  window.addEventListener('hashchange', landHash);
  if (location.hash.length > 1) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('load', function () { syncChrome(); landHash(); setTimeout(landHash, 150); });
  }

  /* YClients booking panel */
  var dialog = document.getElementById('booking-dialog');
  var lastTrigger = null;
  if (dialog && typeof dialog.showModal === 'function') {
    var frame = dialog.querySelector('iframe');
    var closeBtn = dialog.querySelector('.booking-close');
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-booking]') : null;
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      if (isOpen) closeMenu(false);
      lastTrigger = a;
      if (!frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-src'));
      lockScroll('dialog-open');
      dialog.showModal();
      closeBtn.focus();
    });
    closeBtn.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () {
      unlockScroll('dialog-open');
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
  }

  /* Click-to-load map */
  var mapWrap = document.querySelector('.map-wrap[data-map-src]');
  if (mapWrap) {
    var mapBtn = mapWrap.querySelector('[data-map-load]');
    if (mapBtn) {
      mapBtn.addEventListener('click', function () {
        if (mapWrap.classList.contains('is-loaded')) return;
        var src = mapWrap.getAttribute('data-map-src');
        if (!src) return;
        var iframe = document.createElement('iframe');
        iframe.title = mapWrap.getAttribute('data-map-title') || 'Noak Nails на Яндекс Картах';
        iframe.src = src;
        iframe.setAttribute('loading', 'lazy');
        iframe.allowFullscreen = true;
        mapWrap.appendChild(iframe);
        mapWrap.classList.add('is-loaded');
      });
    }
  }

  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
