/*
 * Единственный скрипт превью: переключатель «компьютер / телефон» и полный
 * экран на странице запуска. Ничего из содержимого страниц он не рисует —
 * весь HTML статический, чтобы превью открывалось и без JS.
 *
 * © 2026, владелец fosemberg.github.io. Все права защищены.
 */
(function () {
  var KEY = 'yagames-preview-view';

  function apply(view) {
    document.documentElement.classList.toggle('force-mobile', view === 'mobile');
    var btns = document.querySelectorAll('.preview-bar__switch [data-view]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-view') === view));
    }
  }

  var saved = 'desktop';
  try {
    saved = localStorage.getItem(KEY) || 'desktop';
  } catch (e) {
    /* приватный режим — просто остаёмся на десктопе */
  }
  apply(saved);

  /*
   * Рамка с игрой: если за FRAME_TIMEOUT она не сказала load, показываем
   * запасную панель со ссылкой. Узнать причину отказа изнутри нельзя —
   * кросс-доменный iframe молчит и про сеть, и про запрет встраивания.
   */
  /*
   * Пояснение про адрес игры гаснет через NOTE_LINGER: оно объясняет макет, а
   * не игру, и держать его поверх кадра всё время значит отъедать у игрока низ
   * экрана. Вернуть — кнопка «ℹ» в шапке.
   */
  var NOTE_LINGER = 6000;
  var note = document.querySelector('[data-note-text]');
  var noteTimer = null;
  function hideNote() {
    if (note) note.classList.add('game-root__note_gone');
  }
  function showNote() {
    if (!note) return;
    note.classList.remove('game-root__note_gone');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(hideNote, NOTE_LINGER);
  }
  if (note) noteTimer = setTimeout(hideNote, NOTE_LINGER);

  var frame = document.getElementById('game-frame');
  var fallback = document.querySelector('[data-frame-fallback]');
  if (frame && fallback) {
    var loaded = false;
    frame.addEventListener('load', function () {
      loaded = true;
      fallback.hidden = true;
    });
    setTimeout(function () {
      if (!loaded) fallback.hidden = false;
    }, 8000);
  }

  document.addEventListener('click', function (e) {
    var viewBtn = e.target.closest('.preview-bar__switch [data-view]');
    if (viewBtn) {
      var view = viewBtn.getAttribute('data-view');
      apply(view);
      try {
        localStorage.setItem(KEY, view);
      } catch (err) {
        /* не смогли запомнить — вид всё равно переключился */
      }
      return;
    }

    if (e.target.closest('[data-note]')) {
      showNote();
      return;
    }

    var fs = e.target.closest('[data-fullscreen]');
    if (fs) {
      var root = document.querySelector('.game-root') || document.documentElement;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (root.requestFullscreen) {
        root.requestFullscreen().catch(function () {
          /* браузер отказал — кнопка просто ничего не делает */
        });
      }
    }
  });
})();
