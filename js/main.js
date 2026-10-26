/* Lagom Ceramics — landing. © 2026 Полунин Лев */
(function () {
  'use strict';

  var IG_DM = 'https://ig.me/m/lagom_ceramics';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 4200);
  }

  /* ---------- Copy + open direct ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function sendToMasha(text) {
    // Окно открываем синхронно, чтобы Safari не заблокировал всплывающее окно
    var win = window.open(IG_DM, '_blank', 'noopener');
    copyText(text).then(function (ok) {
      toast(ok ? 'Текст заявки скопирован — вставьте его в сообщение Маше' : 'Откройте директ @lagom_ceramics и опишите заявку');
      if (!win) window.location.href = IG_DM;
    });
  }

  /* ---------- Burger ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1020 && nav.classList.contains('is-open')) setMenu(false); });
  }

  /* ---------- Master-class picker ---------- */
  var CLASSES = {
    wheel: {
      title: 'Гончарный круг', price: 4500, max: 2, hours: '2 часа',
      desc: 'Здесь получаются ровные и симметричные формы. Глина крутится, а вы учитесь её центровать и вытягивать стенки — Маша страхует каждое движение.',
      make: ['чашку', 'стакан', 'мисочку', 'кашпо', 'небольшую вазу', 'кувшин'],
      limit: 'За кругом — до 2 гостей',
      photos: [['g-rings-sm', 'Чашка-гусеница из колец, сделанная на гончарном круге'], ['g-stripes-sm', 'Мисочка с белыми полосками'], ['g-cupwhite-sm', 'Белая чашка с ручкой-крендельком']]
    },
    hand: {
      title: 'Ручная лепка', price: 4000, max: 8, hours: '2 часа',
      desc: 'Работаем без гончарного круга. Формы выходят неровные, с вмятинками от пальцев — зато простора для фантазии больше всего.',
      make: ['подставку под благовония', 'тарелку любой формы', 'фигурку', 'подсвечник', 'баночку с крышкой', 'чашку', 'стакан', 'мисочку'],
      limit: 'На лепке — до 8 гостей',
      photos: [['g-leopard', 'Леопардовая подставка ручной лепки'], ['g-cat', 'Подставка с котиком ручной лепки'], ['g-jar-sm', 'Ребристое кашпо с охристыми пятнами']]
    },
    paint: {
      title: 'Роспись керамики', price: 2000, max: 8, hours: '1,5 часа',
      desc: 'После сушки и обжига Маша сама покрывает работы глазурью в один цвет. Хотите необычные сочетания — приходите расписывать через 2–3 недели после лепки. Маша расскажет, какие бывают глазури и как с ними работать.',
      make: ['свою чашку или миску', 'потёки и градиенты', 'узоры и пятна', 'надписи'],
      limit: 'Приходите той же компанией',
      photos: [['g-blue', 'Мятая ваза в синей потёчной глазури'], ['g-mug', 'Кружка с медовой глазурью'], ['g-set', 'Расписанные работы гостей: кувшин, тарелка и соковыжималка']]
    }
  };

  var picker = $('[data-picker]');
  if (picker) {
    var state = { key: 'wheel', guests: 1 };
    var tabs = $$('.ptab', picker);
    var panel = $('#panel-class');
    var f = function (n) { return $('[data-f="' + n + '"]', picker); };
    var photos = $('[data-photos]', picker);
    var minus = $('[data-step="-1"]', picker);
    var plus = $('[data-step="1"]', picker);

    function guestsWord(n) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return 'гостя';
      return 'гостей';
    }

    function renderTotals() {
      var c = CLASSES[state.key];
      f('guests').textContent = state.guests;
      f('sum').textContent = fmt(c.price * state.guests);
      f('sumnote').textContent = 'за ' + state.guests + ' ' + guestsWord(state.guests) + ', ' + c.hours;
      minus.disabled = state.guests <= 1;
      plus.disabled = state.guests >= c.max;
    }

    function renderClass(swapPhotos) {
      var c = CLASSES[state.key];
      f('title').textContent = c.title;
      f('desc').textContent = c.desc;
      f('limit').textContent = c.limit;
      f('make').innerHTML = c.make.map(function (m) { return '<li>' + m + '</li>'; }).join('');
      if (state.guests > c.max) state.guests = c.max;
      renderTotals();
      if (swapPhotos) {
        photos.classList.add('is-swapping');
        setTimeout(function () {
          photos.innerHTML = c.photos.map(function (p) {
            return '<picture><source srcset="img/' + p[0] + '.webp" type="image/webp"><img src="img/' + p[0] + '.jpg" alt="' + p[1] + '"></picture>';
          }).join('');
          // ждём загрузку, затем плавно показываем
          var imgs = $$('img', photos), left = imgs.length;
          var done = function () { if (--left <= 0) photos.classList.remove('is-swapping'); };
          imgs.forEach(function (im) { if (im.complete) done(); else { im.onload = done; im.onerror = done; } });
          setTimeout(function () { photos.classList.remove('is-swapping'); }, 900);
        }, 220);
      }
    }

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      if (focus) tab.focus();
      if (state.key !== tab.dataset.class) { state.key = tab.dataset.class; renderClass(true); }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    [minus, plus].forEach(function (b) {
      b.addEventListener('click', function () {
        var c = CLASSES[state.key];
        state.guests = Math.min(c.max, Math.max(1, state.guests + Number(b.dataset.step)));
        renderTotals();
      });
    });
    $('[data-book]', picker).addEventListener('click', function () {
      var c = CLASSES[state.key];
      var day = ($('input[name="day"]:checked', picker) || {}).value || 'ближайший день';
      var text = 'Здравствуйте, Маша! Хочу записаться на мастер-класс «' + c.title + '» (' + c.hours + '). ' +
        'Нас будет ' + state.guests + ' ' + (state.guests === 1 ? 'человек' : 'человека') + ', удобно в ' + day + '. ' +
        'Сумма по сайту: ' + fmt(c.price * state.guests).replace(/ /g, ' ') + '. Подскажите свободное время?';
      sendToMasha(text);
    });
    renderClass(false);
  }

  /* ---------- Basket ---------- */
  var tray = $('[data-tray]');
  var basket = {};
  var STORE = 'lagom-basket-v1';
  try { basket = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { basket = {}; }
  var items = $$('.item');
  var byId = {};
  items.forEach(function (it) { byId[it.dataset.id] = { name: it.dataset.name, price: Number(it.dataset.price), el: it }; });
  Object.keys(basket).forEach(function (k) { if (!byId[k]) delete basket[k]; });

  function save() { try { localStorage.setItem(STORE, JSON.stringify(basket)); } catch (e) { /* приватный режим */ } }

  function renderBasket() {
    var keys = Object.keys(basket);
    var count = 0, sum = 0;
    keys.forEach(function (k) { count += basket[k]; sum += basket[k] * byId[k].price; });
    items.forEach(function (it) {
      var on = !!basket[it.dataset.id];
      var b = $('.item__btn', it);
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'Отложено ✓' : 'Отложить';
    });
    tray.hidden = count === 0;
    if (!count) { setTray(false); }
    $('[data-tray-count]').textContent = count;
    $('[data-tray-sum]').textContent = fmt(sum);
    $('[data-tray-list]').innerHTML = keys.map(function (k) {
      return '<li><span>' + byId[k].name + '</span>' +
        '<span class="tray__qty"><button type="button" data-q="-1" data-k="' + k + '" aria-label="Убрать одну: ' + byId[k].name + '">−</button>' +
        '<span>' + basket[k] + '</span>' +
        '<button type="button" data-q="1" data-k="' + k + '" aria-label="Добавить ещё: ' + byId[k].name + '">+</button></span>' +
        '<span>' + fmt(basket[k] * byId[k].price) + '</span></li>';
    }).join('');
    save();
  }
  function setTray(open) {
    var body = $('[data-tray-body]');
    var head = $('[data-tray-toggle]');
    body.hidden = !open;
    head.setAttribute('aria-expanded', String(open));
  }

  if (tray) {
    items.forEach(function (it) {
      $('.item__btn', it).addEventListener('click', function () {
        var k = it.dataset.id;
        if (basket[k]) delete basket[k];
        else { basket[k] = 1; toast('«' + byId[k].name + '» отложено'); }
        renderBasket();
      });
    });
    $('[data-tray-toggle]').addEventListener('click', function () {
      setTray($('[data-tray-body]').hidden);
    });
    $('[data-tray-list]').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]');
      if (!b) return;
      var k = b.dataset.k;
      basket[k] = (basket[k] || 0) + Number(b.dataset.q);
      if (basket[k] <= 0) delete basket[k];
      if (basket[k] > 20) basket[k] = 20;
      renderBasket();
    });
    $('[data-order]').addEventListener('click', function () {
      var lines = [], sum = 0;
      Object.keys(basket).forEach(function (k) {
        sum += basket[k] * byId[k].price;
        lines.push('— ' + byId[k].name + ' × ' + basket[k]);
      });
      var text = 'Здравствуйте, Маша! Хочу заказать посуду из наличия:\n' + lines.join('\n') +
        '\nИтого по сайту: ' + fmt(sum).replace(/ /g, ' ') + ' + доставка Яндексом. Город доставки: ';
      sendToMasha(text);
    });
    renderBasket();
  }

  /* ---------- Reviews slider ---------- */
  var slider = $('[data-slider]');
  if (slider) {
    var track = $('[data-track]', slider);
    var slides = $$('.review', track);
    var dotsWrap = $('[data-dots]');
    var prev = $('[data-prev]');
    var next = $('[data-next]');
    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'отзыв');
      s.setAttribute('aria-label', (i + 1) + ' из ' + slides.length);
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(d);
    });
    var dots = $$('button', dotsWrap);
    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function current() { return Math.round(track.scrollLeft / step()); }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * step(), behavior: 'smooth' });
    }
    function update() {
      var i = current();
      var maxScroll = track.scrollWidth - track.clientWidth - 2;
      dots.forEach(function (d, j) { d.setAttribute('aria-selected', String(j === i)); });
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= maxScroll;
    }
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    if (prev) prev.addEventListener('click', function () { go(current() - 1); });
    if (next) next.addEventListener('click', function () { go(current() + 1); });
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', 'Отзывы, листайте стрелками');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });
    update();
  }

  /* ---------- Lazy map + kiln gauge ---------- */
  var mapBox = $('[data-map]');
  var kiln = $('.kiln');
  function loadMap() {
    var fr = $('iframe', mapBox);
    if (fr && !fr.src) fr.src = fr.getAttribute('data-src');
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        if (en.target === mapBox) loadMap();
        if (en.target === kiln) kiln.classList.add('is-on');
        io.unobserve(en.target);
      });
    }, { rootMargin: '300px 0px' });
    if (mapBox) io.observe(mapBox);
    if (kiln) io.observe(kiln);
  } else {
    if (mapBox) loadMap();
    if (kiln) kiln.classList.add('is-on');
  }
})();
