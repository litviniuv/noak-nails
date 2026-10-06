(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sets = Array.prototype.slice.call(document.querySelectorAll('.d-set'));
  var caption = document.querySelector('.d-caption');
  var labels = ['Френч и хром', 'Нюд и цвет', 'Дизайн'];
  var idx = 0;
  var hero = document.querySelector('.d-hero');

  function show(i) {
    sets.forEach(function (s, n) {
      s.classList.toggle('is-active', n === i);
      s.classList.remove('is-in');
    });
    if (caption) caption.textContent = labels[i] || '';
    var active = sets[i];
    if (!active) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { active.classList.add('is-in'); });
    });
  }
  show(0);

  if (sets.length > 1 && hero) {
    var locked = false;
    function onScroll() {
      if (locked) return;
      var h = hero.offsetHeight || 1;
      var y = window.scrollY || 0;
      var progress = Math.max(0, Math.min(0.999, y / (h * 0.85)));
      var next = Math.min(sets.length - 1, Math.floor(progress * sets.length));
      if (next !== idx) { idx = next; show(idx); }
    }
    window.addEventListener('scroll', function () {
      if (!locked) { locked = true; requestAnimationFrame(function () { locked = false; onScroll(); }); }
    }, { passive: true });
  }

  var works = document.querySelector('.gallery-works');
  if (works) {
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { works.classList.add('is-dropped'); io.unobserve(works); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      io.observe(works);
    } else {
      works.classList.add('is-dropped');
    }
  }
})();
