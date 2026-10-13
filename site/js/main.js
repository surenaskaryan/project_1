/* AD VERBUM — небольшой скрипт страницы: появление блоков и кнопка «наверх». */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Появление блоков при прокрутке
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (items.length) {
    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.setProperty('--delay', (entry.target.dataset.delay || 0) + 'ms');
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      items.forEach(function (el) { io.observe(el); });
    }
  }

  // Кнопка «наверх»
  var toTop = document.getElementById('toTop');
  if (toTop) {
    var ticking = false;
    var update = function () {
      toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Уведомление об обработке данных. Согласие помним в браузере посетителя,
  // на сервер ничего не уходит. Если хранилище недоступно (приватный режим,
  // запрет на cookie) — просто показываем уведомление каждый раз.
  var cookie = document.getElementById('cookieNotice');
  if (cookie) {
    var KEY = 'adverbum-privacy-ack';
    var accepted = false;
    try { accepted = localStorage.getItem(KEY) === 'y'; } catch (e) { /* хранилище закрыто */ }

    if (!accepted) {
      setTimeout(function () { cookie.classList.add('is-shown'); }, 900);
    }

    var btn = cookie.querySelector('.cookie__btn');
    if (btn) {
      btn.addEventListener('click', function () {
        cookie.classList.remove('is-shown');
        try { localStorage.setItem(KEY, 'y'); } catch (e) { /* не страшно */ }
      });
    }
  }
})();
