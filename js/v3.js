(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('g-ready'); }); });

  var img = document.querySelector('.g-bg img');
  if (img && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var raf = 0, mx = 0, my = 0;
    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5);
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        img.style.transform = 'scale(1.06) translate(' + (-mx * 16).toFixed(1) + 'px,' + (-my * 12).toFixed(1) + 'px)';
      });
    }, { passive: true });
  }

  var hero = document.querySelector('.g-hero');
  var ticking = false;
  function veil() {
    ticking = false;
    var h = hero ? hero.offsetHeight : window.innerHeight;
    var v = Math.max(0, Math.min(1, (window.scrollY || 0) / (h * .8)));
    root.style.setProperty('--veil', v.toFixed(3));
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(veil); } }, { passive: true });
  veil();

  var shots = document.querySelectorAll('.circle-in');
  if ('IntersectionObserver' in window && !reduce) {
    var groups = [];
    shots.forEach(function (s) {
      var parent = s.parentNode;
      var g = groups.filter(function (x) { return x.el === parent; })[0];
      if (!g) { g = { el: parent, items: [] }; groups.push(g); }
      s.style.transitionDelay = (g.items.length * 0.12).toFixed(2) + 's';
      g.items.push(s);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        groups.forEach(function (g) { if (g.el === en.target) g.items.forEach(function (s) { s.classList.add('is-open'); }); });
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    groups.forEach(function (g) { io.observe(g.el); });
  } else {
    shots.forEach(function (s) { s.classList.add('is-open'); });
  }
})();
