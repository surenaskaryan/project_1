/* =========================================================
   AD VERBUM — интерактив и анимации
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Настройки ----------
     formEndpoint — URL обработчика заявок (PHP/CRM/Telegram-бот).
     Пока он пустой, заявка уходит менеджеру через WhatsApp:
     форма открывает чат с заполненным текстом. */
  var CONFIG = {
    phoneRaw: '79777822555',
    whatsapp: 'https://wa.me/79777822555',
    formEndpoint: ''
  };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ================= Появление элементов ================= */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.setProperty('--delay', (el.dataset.delay || 0) + 'ms');
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ================= Прогресс прокрутки, шапка, кнопки ================= */
  (function scrollUi() {
    var bar = $('#scrollBar');
    var header = $('#header');
    var floaties = $('#floaties');
    var mobilebar = $('#mobilebar');
    var ticking = false;

    function update() {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (header) header.classList.toggle('is-stuck', y > 12);
      if (floaties) {
        floaties.classList.toggle('is-visible', y > 400);
        floaties.classList.toggle('show-top', y > window.innerHeight * 1.5);
      }
      if (mobilebar) mobilebar.classList.toggle('is-visible', y > 400);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();

    var toTop = $('#toTop');
    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ================= Мобильное меню ================= */
  (function menu() {
    var burger = $('#burger');
    var nav = $('#nav');
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    $$('a', nav).forEach(function (a) { a.addEventListener('click', close); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080) close(); });
  })();

  /* ================= Подсветка активного пункта меню ================= */
  (function scrollSpy() {
    var links = $$('#nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var section = document.getElementById(link.getAttribute('href').slice(1));
      if (section) map[section.id] = link;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* ================= Счётчики ================= */
  (function counters() {
    var nums = $$('.js-count');
    if (!nums.length) return;

    // 40000 читается хуже, чем 40 000
    function format(n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function run(el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      if (reduced) { el.textContent = format(target); return; }
      var duration = 1100;
      var start = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ================= Смена слов в заголовке ================= */
  (function rotator() {
    var box = $('#rotator');
    if (!box || reduced) return;
    var items = $$('.rotator__item', box);
    if (items.length < 2) return;
    var i = 0;

    setInterval(function () {
      var current = items[i];
      i = (i + 1) % items.length;
      var next = items[i];
      current.classList.add('is-leaving');
      current.classList.remove('is-active');
      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      setTimeout(function () { current.classList.remove('is-leaving'); }, 600);
    }, 2600);
  })();

  /* ================= Бесконечная лента языков ================= */
  (function marquee() {
    var track = $('#marqueeTrack');
    if (!track) return;
    track.innerHTML += track.innerHTML; // дубль для бесшовной прокрутки
  })();

  /* ================= Заполнение линии шагов ================= */
  (function stepsLine() {
    var steps = $('#steps');
    var line = $('#stepsLine');
    if (!steps || !line) return;
    var vertical = window.matchMedia('(max-width: 900px)');
    var ticking = false;

    function update() {
      var rect = steps.getBoundingClientRect();
      var start = window.innerHeight * 0.85;
      var progress = (start - rect.top) / (rect.height * 0.9);
      progress = Math.max(0, Math.min(1, progress));
      if (vertical.matches) {
        line.style.height = progress * 100 + '%';
        line.style.width = '100%';
      } else {
        line.style.width = progress * 100 + '%';
        line.style.height = '100%';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ================= Наклон карточек за курсором ================= */
  (function tilt() {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;

    $$('.js-tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
        card.style.setProperty('--ry', (x - 0.5) * 6 + 'deg');
        card.style.setProperty('--rx', (0.5 - y) * 6 + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  })();

  /* ================= Магнитные кнопки ================= */
  (function magnetic() {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;

    $$('.btn--magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.14 + 'px,' + (y * 0.2 - 2) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  })();

  /* ================= Поиск по языкам ================= */
  (function langSearch() {
    var input = $('#langSearch');
    var groups = $('#langGroups');
    var empty = $('#langEmpty');
    if (!input || !groups) return;

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var total = 0;

      $$('.langs__group', groups).forEach(function (group) {
        var shown = 0;
        $$('li', group).forEach(function (li) {
          var match = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
          li.classList.toggle('is-hidden', !match);
          li.classList.toggle('is-match', Boolean(q) && match);
          if (match) shown++;
        });
        group.classList.toggle('is-hidden', shown === 0);
        total += shown;
      });

      if (empty) empty.hidden = total !== 0;
    });
  })();

  /* ================= Модальные окна ================= */
  var modals = (function () {
    var lastFocused = null;

    function open(id, service) {
      var modal = document.getElementById(id);
      if (!modal) return;
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('is-locked');

      if (service) {
        var select = $('select[name="service"]', modal);
        if (select) {
          $$('option', select).forEach(function (opt) {
            if (opt.textContent.trim() === service) select.value = opt.value || opt.textContent;
          });
        }
      }

      var focusable = $$('button, [href], input, select, textarea', modal)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (focusable[1]) focusable[1].focus({ preventScroll: true });

      modal.addEventListener('keydown', trap);
    }

    function trap(e) {
      if (e.key === 'Escape') { closeAll(); return; }
      if (e.key !== 'Tab') return;
      var focusable = $$('button, [href], input, select, textarea', e.currentTarget)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function closeAll() {
      $$('.modal').forEach(function (modal) {
        if (modal.hidden) return;
        modal.hidden = true;
        modal.removeEventListener('keydown', trap);
      });
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus({ preventScroll: true });
    }

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('.js-open-modal');
      if (opener) {
        e.preventDefault();
        open('modal', opener.dataset.service);
        return;
      }
      if (e.target.closest('.js-close-modal')) closeAll();
    });

    return { open: open, closeAll: closeAll };
  })();

  /* ================= Загрузка файлов ================= */
  (function dropzones() {
    $$('.js-dropzone').forEach(function (zone) {
      var input = $('input[type="file"]', zone);
      var text = $('.dropzone__text', zone);
      if (!input || !text) return;
      var initial = text.innerHTML;

      function render() {
        if (input.files && input.files.length) {
          zone.classList.add('is-filled');
          text.textContent = input.files.length === 1
            ? input.files[0].name
            : 'Выбрано файлов: ' + input.files.length;
        } else {
          zone.classList.remove('is-filled');
          text.innerHTML = initial;
        }
      }

      input.addEventListener('change', render);

      ['dragenter', 'dragover'].forEach(function (type) {
        zone.addEventListener(type, function (e) { e.preventDefault(); zone.classList.add('is-drag'); });
      });
      ['dragleave', 'drop'].forEach(function (type) {
        zone.addEventListener(type, function (e) { e.preventDefault(); zone.classList.remove('is-drag'); });
      });
      zone.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          render();
        }
      });
    });
  })();

  /* ================= Маска телефона ================= */
  (function phoneMask() {
    $$('input[type="tel"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var digits = input.value.replace(/\D/g, '');
        if (digits[0] === '8') digits = '7' + digits.slice(1);
        if (digits[0] !== '7') digits = '7' + digits;
        digits = digits.slice(0, 11);

        var out = '+7';
        if (digits.length > 1) out += ' (' + digits.slice(1, 4);
        if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
        if (digits.length >= 7) out += '-' + digits.slice(7, 9);
        if (digits.length >= 9) out += '-' + digits.slice(9, 11);
        input.value = out;
      });

      input.addEventListener('focus', function () {
        if (!input.value) input.value = '+7 ';
      });
      input.addEventListener('blur', function () {
        if (input.value.replace(/\D/g, '').length <= 1) input.value = '';
      });
    });
  })();

  /* ================= Отправка заявок ================= */
  (function forms() {
    function invalid(field, yes) {
      field.classList.toggle('is-invalid', yes);
      return !yes;
    }

    function validate(form) {
      var ok = true;

      var name = $('input[name="name"]', form);
      if (name) {
        var nameOk = name.value.trim().length >= 2;
        ok = invalid(name.closest('.field'), !nameOk) && ok;
      }

      var phone = $('input[name="phone"]', form);
      if (phone) {
        var phoneOk = phone.value.replace(/\D/g, '').length === 11;
        ok = invalid(phone.closest('.field'), !phoneOk) && ok;
      }

      return ok;
    }

    function collect(form) {
      var get = function (name) {
        var el = $('[name="' + name + '"]', form);
        return el ? el.value.trim() : '';
      };
      return {
        service: get('service'),
        name: get('name'),
        phone: get('phone'),
        comment: get('comment'),
        page: location.href
      };
    }

    function toWhatsApp(data, hasFiles) {
      var lines = [
        'Здравствуйте! Заявка с сайта adverbum.ru',
        'Услуга: ' + data.service,
        'Имя: ' + data.name,
        'Телефон: ' + data.phone
      ];
      if (data.comment) lines.push('Комментарий: ' + data.comment);
      if (hasFiles) lines.push('Скан документа отправлю следующим сообщением.');
      return CONFIG.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    // Через WhatsApp клиент дожимает отправку сам — обещать доставку нельзя
    function succeed(form, viaWhatsApp) {
      var success = $('.form__success', form);
      if (success && viaWhatsApp) {
        var title = $('.form__success-title', success);
        var text = $('.form__success-text', success);
        if (title) title.textContent = 'Откройте WhatsApp';
        if (text) {
          text.textContent = 'Мы подготовили сообщение с вашими данными — нажмите в чате «Отправить», и менеджер свяжется с вами.';
        }
      }
      if (success) success.hidden = false;
      form.reset();
      $$('.dropzone.is-filled', form).forEach(function (z) { z.classList.remove('is-filled'); });
      if (window.ym || window.gtag) {
        try {
          if (window.gtag) window.gtag('event', 'lead_submit');
          if (window.ym && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', 'lead_submit');
        } catch (err) { /* аналитика не должна ломать форму */ }
      }
    }

    $$('.js-lead-form').forEach(function (form) {
      $$('input', form).forEach(function (input) {
        input.addEventListener('input', function () {
          var field = input.closest('.field');
          if (field) field.classList.remove('is-invalid');
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) {
          var firstBad = $('.field.is-invalid input', form);
          if (firstBad) firstBad.focus();
          return;
        }

        var btn = $('.js-submit', form);
        var data = collect(form);
        var fileInput = $('input[type="file"]', form);
        var hasFiles = Boolean(fileInput && fileInput.files && fileInput.files.length);
        if (btn) btn.classList.add('is-loading');

        var finish = function (viaWhatsApp) {
          if (btn) btn.classList.remove('is-loading');
          succeed(form, viaWhatsApp);
        };

        if (CONFIG.formEndpoint) {
          fetch(CONFIG.formEndpoint, {
            method: 'POST',
            body: new FormData(form)
          }).then(function () { finish(false); }).catch(function () {
            window.open(toWhatsApp(data, hasFiles), '_blank', 'noopener');
            finish(true);
          });
        } else {
          window.open(toWhatsApp(data, hasFiles), '_blank', 'noopener');
          setTimeout(function () { finish(true); }, 600);
        }
      });
    });
  })();

  /* ================= Уведомление об обработке данных ================= */
  (function cookieNotice() {
    var box = $('#cookieNotice');
    if (!box) return;

    // Согласие помним в браузере посетителя, на сервер ничего не уходит.
    // Если хранилище закрыто (приватный режим) — показываем уведомление снова.
    var KEY = 'adverbum-privacy-ack';
    var accepted = false;
    try { accepted = localStorage.getItem(KEY) === 'y'; } catch (err) { /* хранилище закрыто */ }
    if (accepted) return;

    setTimeout(function () { box.classList.add('is-shown'); }, 1200);

    var btn = $('.cookie__btn', box);
    if (btn) {
      btn.addEventListener('click', function () {
        box.classList.remove('is-shown');
        try { localStorage.setItem(KEY, 'y'); } catch (err) { /* не страшно */ }
      });
    }
  })();

  /* ================= Мелочи ================= */
  (function misc() {
    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    // Плавная прокрутка с учётом «липкой» шапки
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  })();
})();
