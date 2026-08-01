/* ==========================================================================
   RHL 사이트 공통 스크립트

   하는 일
     1. 내비게이션에서 현재 페이지 표시
     2. 갤러리 사진을 눌렀을 때 크게 보여주기
     3. 연구과제 분야 버튼으로 목록 걸러 보기
     4. 화면에 들어온 영상 자동 재생

   여기에 없는 것 — 목록 만들기
     논문·구성원·연구과제·갤러리·소식 목록은 예전에 이 파일이 브라우저에서
     그렸지만, 지금은 scripts/build-html.js 가 HTML 안에 미리 써 둡니다.
     검색엔진이 받아가는 파일에 내용이 들어 있어야 하기 때문입니다.

     내용을 고치려면 data/*.json 을 고치세요. 커밋하면 GitHub Actions 가
     1~2분 안에 HTML 을 갱신합니다.

   이 파일은 이제 '있으면 더 좋은' 기능만 맡습니다. JavaScript 가 꺼져 있어도
   사진 목록도 과제 목록도 전부 보입니다.
   ========================================================================== */

(function () {
  'use strict';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ── 1. 내비게이션 현재 페이지 표시 ──────────────────────────────────── */

  function markCurrentNav() {
    var here = location.pathname.split('/').pop() || 'index.html';
    $$('.site-nav a').forEach(function (a) {
      var target = a.getAttribute('href');
      if (target === here || (here === '' && target === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ── 2. 갤러리 확대 보기 ──────────────────────────────────────────────── */

  /**
   * 사진을 클릭하면 크게 보여주는 오버레이.
   * 사진 목록은 이미 HTML 에 들어 있으므로, 버튼에 붙은 data-file / data-caption
   * 을 읽어 씁니다.
   */
  function setupLightbox() {
    var container = $('[data-gallery]');
    if (!container) return;

    var btns = $$('.gallery-btn', container);
    if (!btns.length) return;

    var items    = btns.map(function (b) { return b.getAttribute('data-file') || ''; });
    var captions = btns.map(function (b) { return b.getAttribute('data-caption') || ''; });

    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
      '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<figure class="lb-figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-nav lb-next" type="button" aria-label="Next photo">&#8250;</button>' +
      '<p class="lb-count"></p>';
    document.body.appendChild(lb);

    var lbImg   = $('img', lb);
    var lbCap   = $('figcaption', lb);
    var lbCount = $('.lb-count', lb);
    var idx = 0;
    var lastFocus = null;

    if (items.length < 2) {
      $('.lb-prev', lb).style.display = 'none';
      $('.lb-next', lb).style.display = 'none';
    }

    function show(i) {
      idx = (i + items.length) % items.length;
      lbImg.src = 'images/gallery/' + items[idx];
      lbImg.alt = captions[idx] || 'Laboratory photo';
      lbCap.textContent = captions[idx] || '';
      lbCap.style.display = captions[idx] ? '' : 'none';
      lbCount.textContent = items.length > 1 ? (idx + 1) + ' / ' + items.length : '';
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('.lb-close', lb).focus();
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    container.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.gallery-btn') : null;
      if (!btn) return;
      open(parseInt(btn.getAttribute('data-index'), 10) || 0);
    });

    lb.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('.lb-close')) { close(); return; }
      if (t.closest('.lb-prev'))  { show(idx - 1); return; }
      if (t.closest('.lb-next'))  { show(idx + 1); return; }
      if (!t.closest('.lb-figure')) close();     // 배경을 누르면 닫기
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')          { close(); }
      else if (e.key === 'ArrowLeft')  { show(idx - 1); }
      else if (e.key === 'ArrowRight') { show(idx + 1); }
    });
  }

  /* ── 3. 연구분야로 거르기 (논문·연구과제 공용) ────────────────────────── */

  /**
   * 목록은 이미 HTML 에 전부 들어 있습니다. 버튼은 목록을 다시 그리지 않고
   * 해당하지 않는 항목을 숨기기만 하므로, JavaScript 가 없어도 전체가 보입니다.
   *
   * 항목 하나가 여러 분야에 걸칠 수 있어 data-scopes 에 공백으로 나열합니다.
   *
   * 주소 끝에 #분야 가 붙어 있으면 그 분야로 시작합니다 — Research 페이지의
   * "See papers in this area" 링크가 이것을 씁니다.
   */
  function setupFilter(filterSel, listSel) {
    var filterBox = $(filterSel);
    var listBox   = $(listSel);
    if (!filterBox || !listBox) return;

    var items = $$('[data-scopes]', listBox);
    if (!items.length) return;

    var groups = $$('.pub-year-group', listBox);   // 논문은 연도로 묶여 있습니다
    var empty  = $('.filter-empty', listBox);

    function apply(scope) {
      var shown = 0;
      items.forEach(function (el) {
        var mine  = (el.getAttribute('data-scopes') || '').split(/\s+/);
        var match = (scope === 'all') || mine.indexOf(scope) !== -1;
        el.hidden = !match;
        if (match) shown++;
      });

      // 남은 논문이 없는 해는 연도 제목까지 숨깁니다
      groups.forEach(function (g) {
        g.hidden = !$$('[data-scopes]', g).some(function (el) { return !el.hidden; });
      });

      if (empty) empty.hidden = shown > 0;

      $$('.filter-btn', filterBox).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-scope') === scope));
      });
    }

    filterBox.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.filter-btn') : null;
      if (!btn) return;
      var scope = btn.getAttribute('data-scope');
      apply(scope);
      // 주소에 남겨 두면 새로고침하거나 링크를 보내도 같은 화면이 열립니다
      if (history.replaceState) {
        history.replaceState(null, '', scope === 'all' ? location.pathname : '#' + scope);
      }
    });

    var hash = (location.hash || '').slice(1);
    if (hash && $('.filter-btn[data-scope="' + hash + '"]', filterBox)) apply(hash);
  }

  /* ── 4. 영상 자동재생 ─────────────────────────────────────────────────── */

  /**
   * autoplay 속성이 붙은 영상을 화면에 들어올 때 재생하고, 벗어나면 멈춥니다.
   *
   * autoplay 속성만으로는 재생되지 않는 경우가 많습니다 — 브라우저의 자동재생
   * 정책(데이터 절약 모드, 배터리 절약, 한 페이지의 동시 재생 개수 제한) 때문입니다.
   * 그래서 muted 를 프로퍼티로 확실히 지정한 뒤 play() 를 직접 호출합니다.
   * 화면 밖 영상은 정지시키므로 데이터와 배터리도 덜 씁니다.
   */
  function setupVideoAutoplay() {
    var vids = $$('video[autoplay]');
    if (!vids.length) return;

    vids.forEach(function (v) {
      // muted 는 속성뿐 아니라 프로퍼티로도 지정해야 재생이 허용됩니다
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.playsInline = true;
      v.loop = true;
    });

    function tryPlay(v) {
      var p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { /* 정책상 차단된 경우 — 조용히 넘어갑니다 */ });
      }
    }

    if (!('IntersectionObserver' in window)) {
      vids.forEach(tryPlay);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.readyState < 2) { try { v.load(); } catch (err) { /* 무시 */ } }
          tryPlay(v);
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '300px 0px', threshold: 0.01 });

    vids.forEach(function (v) { io.observe(v); });

    // 탭을 다시 활성화했을 때 멈춰 있는 영상을 되살립니다
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      vids.forEach(function (v) {
        var r = v.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) tryPlay(v);
      });
    });
  }

  /* ── 실행 ─────────────────────────────────────────────────────────────── */

  function init() {
    markCurrentNav();
    setupLightbox();
    setupFilter('[data-project-filters]', '[data-projects]');
    setupFilter('[data-pub-filters]',     '[data-publications]');
    setupVideoAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
