/* ==========================================================================
   RHL 사이트 공통 스크립트

   하는 일
     1. 내비게이션에서 현재 페이지 표시
     2. data/*.json 을 읽어 목록을 그려줌
        (논문·프로젝트·구성원·소식·갤러리)

   페이지마다 <body data-page="..."> 값을 보고 필요한 것만 실행합니다.
   내용을 고치고 싶으면 이 파일이 아니라 data/*.json 을 고치세요.
   ========================================================================== */

(function () {
  'use strict';

  /* ── 공통 유틸 ────────────────────────────────────────────────────────── */

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** HTML 특수문자를 이스케이프 — JSON 내용을 안전하게 삽입하기 위해 */
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** JSON 읽기. 실패하면 화면에 이유를 남깁니다. */
  function loadJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error(path + ' — HTTP ' + res.status);
      return res.json();
    });
  }

  function showError(target, err) {
    if (!target) return;
    var isFile = location.protocol === 'file:';
    target.innerHTML =
      '<p class="loading">' +
      (isFile
        ? '데이터를 불러올 수 없습니다. 브라우저에서 파일을 직접 열면(file://) ' +
          '보안 정책 때문에 JSON을 읽지 못합니다. VSCode의 Live Server 확장이나 ' +
          '<code>python -m http.server</code> 로 열어보세요. 게시된 사이트에서는 정상 동작합니다.'
        : '데이터를 불러오지 못했습니다: ' + esc(err.message)) +
      '</p>';
    console.error(err);
  }

  /**
   * 주저자·공저자 SCIE 논문 수를 한 줄로 만듭니다.
   * 둘 다 0이거나 papers 항목이 없으면 아무것도 표시하지 않습니다.
   */
  function papersLine(p) {
    if (!p || !p.papers) return '';
    var f = p.papers.first || 0;
    var c = p.papers.co || 0;
    if (!f && !c) return '';
    var parts = [];
    if (f) parts.push(f + ' first-author');
    if (c) parts.push(c + ' co-author');
    return '<p class="person-papers">' + parts.join(' &middot; ') +
           ' SCIE ' + ((f + c) === 1 ? 'paper' : 'papers') + '</p>';
  }

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

  /* ── 2. 소식 ──────────────────────────────────────────────────────────── */

  function renderNews(limit) {
    var box = $('[data-news]');
    if (!box) return;
    loadJSON('data/news.json').then(function (d) {
      var items = d.news || [];
      if (limit) items = items.slice(0, limit);
      if (!items.length) { box.innerHTML = '<p class="loading">No news yet.</p>'; return; }
      box.innerHTML = '<ul class="news-list">' + items.map(function (n) {
        return '<li class="news-item">' +
               '<span class="news-date">' + esc(n.date) + '</span>' +
               '<p class="news-body">' + esc(n.text) + '</p>' +
               '</li>';
      }).join('') + '</ul>';
    }).catch(function (e) { showError(box, e); });
  }

  /* ── 3. 인용 지표 ─────────────────────────────────────────────────────── */

  function renderMetrics() {
    var box = $('[data-metrics]');
    if (!box) return;
    loadJSON('data/metrics.json').then(function (m) {
      var cells = [
        { v: m.h_index,   l: 'h-index' },
        { v: m.i10_index, l: 'i10-index' },
        { v: m.citations, l: 'Citations' }
      ].filter(function (c) { return c.v !== undefined && c.v !== null; });

      var html = '<div class="metric-row">' + cells.map(function (c) {
        return '<div class="metric">' +
               '<span class="metric-value">' + esc(c.v) + '</span>' +
               '<span class="metric-label">' + esc(c.l) + '</span>' +
               '</div>';
      }).join('');

      var src = 'Source: ' + esc(m.source || '') + (m.updated ? ', ' + esc(m.updated) : '');
      if (m.scholar_url) {
        src += ' &middot; <a href="' + esc(m.scholar_url) + '" rel="noopener">Google Scholar profile &rarr;</a>';
      }
      html += '<p class="metric-source">' + src + '</p></div>';
      box.innerHTML = html;
    }).catch(function (e) { showError(box, e); });
  }

  /* ── 4. 논문 목록 ─────────────────────────────────────────────────────── */

  /** 한 묶음(학술지 또는 학회)을 연도별로 그려줍니다. */
  function renderPubGroup(list) {
    list = list.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });

    var order = [];
    var byYear = {};
    list.forEach(function (p) {
      var y = p.year || '—';
      if (!byYear[y]) { byYear[y] = []; order.push(y); }
      byYear[y].push(p);
    });

    // 오래된 것이 1번이 되도록 매깁니다. 새 논문이 추가돼도 기존 번호가 그대로입니다.
    var seq = list.length;
    var html = '';
    order.forEach(function (y) {
      html += '<h3 class="pub-year">' + esc(y) + '</h3><ol class="pub-list">';
      byYear[y].forEach(function (p) {
        var venue = p.venue ? '<span class="pub-venue">' + esc(p.venue) + '</span>' : '';
        var detail = p.detail ? ', ' + esc(p.detail) : '';
        var doi = p.doi
          ? ' <a class="pub-doi" href="https://doi.org/' + esc(p.doi) + '" rel="noopener">doi:' + esc(p.doi) + '</a>'
          : '';
        html += '<li class="pub-item">' +
                '<span class="pub-num">' + seq-- + '</span>' +
                '<span><span class="pub-authors">' + esc(p.authors) + '</span> ' +
                '<span class="pub-title">' + esc(p.title) + '</span>. ' +
                venue + detail + doi + '</span>' +
                '</li>';
      });
      html += '</ol>';
    });
    return html;
  }

  function renderPublications() {
    var box = $('[data-publications]');
    if (!box) return;
    loadJSON('data/publications.json').then(function (d) {
      var journal = d.journal || [];
      if (!journal.length) {
        box.innerHTML = '<p class="loading">No publications listed.</p>';
        return;
      }

      box.innerHTML = '<section class="pub-section">' +
                      renderPubGroup(journal) + '</section>';

      var count = $('[data-pub-count]');
      if (count) count.textContent = journal.length;
    }).catch(function (e) { showError(box, e); });
  }

  /* ── 5. 프로젝트 (분야 필터 포함) ─────────────────────────────────────── */

  var SCOPE_LABELS = {
    resistance:    'Ship Resistance',
    hydrodynamics: 'Ship Hydrodynamics',
    polar:         'Polar & Ice',
    renewable:     'Renewable Energy',
    environmental: 'Environmental',
    other:         'Other'
  };

  function renderProjects() {
    var box = $('[data-projects]');
    if (!box) return;
    var filterBox = $('[data-project-filters]');

    loadJSON('data/projects.json').then(function (d) {
      var all = d.projects || [];
      if (!all.length) { box.innerHTML = '<p class="loading">No projects listed.</p>'; return; }

      // 데이터에 실제로 존재하는 분야만 버튼으로 만듭니다
      var present = [];
      all.forEach(function (p) {
        if (p.scope && present.indexOf(p.scope) === -1) present.push(p.scope);
      });
      var order = Object.keys(SCOPE_LABELS);
      present.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });

      if (filterBox) {
        filterBox.innerHTML =
          '<button class="filter-btn" type="button" data-scope="all" aria-pressed="true">' +
          'All <span class="meta">(' + all.length + ')</span></button>' +
          present.map(function (s) {
            var n = all.filter(function (p) { return p.scope === s; }).length;
            return '<button class="filter-btn" type="button" data-scope="' + esc(s) + '" aria-pressed="false">' +
                   esc(SCOPE_LABELS[s] || s) + ' <span class="meta">(' + n + ')</span></button>';
          }).join('');
      }

      function draw(scope) {
        var items = (scope === 'all') ? all : all.filter(function (p) { return p.scope === scope; });
        if (!items.length) {
          box.innerHTML = '<p class="project-empty">No projects in this area.</p>';
          return;
        }
        box.innerHTML = '<ul class="project-list">' + items.map(function (p) {
          var ko = p.title_ko ? '<p class="project-title-ko">' + esc(p.title_ko) + '</p>' : '';
          var agency = p.agency_en
            ? '<span class="project-agency">' + esc(p.agency_en) +
              (p.agency_ko ? ' &middot; ' + esc(p.agency_ko) : '') + '</span>'
            : '';
          return '<li class="project-item">' +
                 '<div class="project-meta">' +
                 '<span class="project-period">' + esc(p.period) + '</span>' +
                 agency +
                 '</div>' +
                 '<p class="project-title-en">' + esc(p.title_en) + '</p>' + ko +
                 '</li>';
        }).join('') + '</ul>';
      }

      draw('all');

      if (filterBox) {
        filterBox.addEventListener('click', function (ev) {
          var btn = ev.target.closest('.filter-btn');
          if (!btn) return;
          $$('.filter-btn', filterBox).forEach(function (b) {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          draw(btn.getAttribute('data-scope'));
        });
      }
    }).catch(function (e) { showError(box, e); });
  }

  /* ── 6. 구성원 ────────────────────────────────────────────────────────── */

  function renderPeople() {
    var piBox      = $('[data-pi]');
    var currentBox = $('[data-current]');
    var alumniBox  = $('[data-alumni]');
    if (!piBox && !currentBox && !alumniBox) return;

    loadJSON('data/people.json').then(function (d) {

      /* PI 프로필 */
      if (piBox && d.pi) {
        var pi = d.pi;
        var photo = pi.photo
          ? '<div class="pi-photo"><img src="images/people/' + esc(pi.photo) +
            '" alt="' + esc(pi.name_en) + '" width="340" height="454"></div>'
          : '';

        var facts = '';
        if (pi.email)  facts += '<div><span class="k">Email</span><span class="v"><a href="mailto:' + esc(pi.email) + '">' + esc(pi.email) + '</a></span></div>';
        if (pi.office) facts += '<div><span class="k">Office</span><span class="v">' + esc(pi.office) + '</span></div>';
        if (pi.phone)  facts += '<div><span class="k">Tel</span><span class="v">' + esc(pi.phone) + '</span></div>';
        if (pi.interests && pi.interests.length) {
          facts += '<div><span class="k">Interests</span><span class="v">' + pi.interests.map(esc).join(' &middot; ') + '</span></div>';
        }

        function block(title, rows) {
          if (!rows || !rows.length) return '';
          return '<h3>' + title + '</h3><ul>' + rows.join('') + '</ul>';
        }

        var edu = (pi.education || []).map(function (e) {
          return '<li>' + esc(e.degree) + ', <em>' + esc(e.school) + '</em>' + (e.year ? ' (' + esc(e.year) + ')' : '') + '</li>';
        });
        var exp = (pi.experience || []).map(function (e) {
          return '<li><strong>' + esc(e.role) + '</strong>, ' + esc(e.org) + (e.period ? ' &mdash; ' + esc(e.period) : '') + '</li>';
        });
        var awd = (pi.awards || []).map(function (a) {
          return '<li>' + esc(a.year) + ' &mdash; ' + esc(a.text) + '</li>';
        });
        var svc = (pi.service || []).map(function (s) {
          return '<li>' + esc(s.period) + ' &mdash; ' + esc(s.text) + '</li>';
        });

        piBox.innerHTML =
          '<div class="pi">' + photo +
          '<div>' +
          '<h2 class="pi-name">' + esc(pi.name_en) +
          (pi.name_ko ? ' <span class="person-name-ko">(' + esc(pi.name_ko) + ')</span>' : '') + '</h2>' +
          '<p class="pi-title">' + esc(pi.title) + '<br>' + esc(pi.department) + ', ' + esc(pi.university) + '</p>' +
          '<div class="pi-facts">' + facts + '</div>' +
          block('Education', edu) +
          block('Experience', exp) +
          block('Awards', awd) +
          block('Professional service', svc) +
          '</div></div>';
      }

      /* 재학생 */
      if (currentBox) {
        var cur = d.current || [];
        currentBox.innerHTML = cur.map(function (p) {
          var img = p.photo
            ? '<img src="images/people/' + esc(p.photo) + '" alt="' + esc(p.name_en) + '" width="300" height="400" loading="lazy">'
            : '';
          return '<div class="person">' +
                 '<div class="person-photo">' + img + '</div>' +
                 '<p class="person-name">' + esc(p.name_en) +
                 (p.name_ko ? ' <span class="person-name-ko">(' + esc(p.name_ko) + ')</span>' : '') + '</p>' +
                 (p.topic ? '<p class="person-topic">' + esc(p.topic) + '</p>' : '') +
                 papersLine(p) +
                 '</div>';
        }).join('');
      }

      /* 졸업생 취업처 — 사람 카드보다 먼저 나옵니다 */
      var destBox = $('[data-destinations]');
      if (destBox) {
        var dest = d.alumni_destinations || [];
        destBox.innerHTML = dest.length
          ? '<p class="section-label">Career destinations</p>' +
            '<ul class="destinations">' + dest.map(function (o) {
              return '<li>' + esc(o.name_en) +
                     (o.name_ko ? ' <span class="person-name-ko">(' + esc(o.name_ko) + ')</span>' : '') +
                     '</li>';
            }).join('') + '</ul>'
          : '';
      }

      /* 졸업생 — 재학생과 같은 카드 형태로 (사진 크기를 맞추기 위해) */
      if (alumniBox) {
        var al = d.alumni || [];
        if (!al.length) {
          alumniBox.innerHTML = '<p class="loading">Alumni list will be added.</p>';
        } else {
          alumniBox.innerHTML = '<div class="people-grid">' + al.map(function (a) {
            var img = a.photo
              ? '<img src="images/people/' + esc(a.photo) + '" alt="' + esc(a.name_en) + '" width="300" height="400" loading="lazy">'
              : '';
            var line = [];
            if (a.graduated) line.push('Graduated ' + esc(a.graduated));
            if (a.position)  line.push(esc(a.position));
            return '<div class="person">' +
                   '<div class="person-photo">' + img + '</div>' +
                   '<p class="person-name">' + esc(a.name_en) +
                   (a.name_ko ? ' <span class="person-name-ko">(' + esc(a.name_ko) + ')</span>' : '') + '</p>' +
                   (a.topic ? '<p class="person-topic">' + esc(a.topic) + '</p>' : '') +
                   (line.length ? '<p class="person-meta">' + line.join(' &middot; ') + '</p>' : '') +
                   papersLine(a) +
                   (a.thesis ? '<p class="person-thesis">' + esc(a.thesis) + '</p>' : '') +
                   '</div>';
          }).join('') + '</div>';
        }
      }
    }).catch(function (e) {
      showError(piBox || currentBox || alumniBox, e);
    });
  }

  /* ── 7. 갤러리 ────────────────────────────────────────────────────────── */

  /* 카메라·메신저가 자동으로 붙이는 이름 조각. 설명이 되지 못하므로 걸러냅니다. */
  var FILENAME_NOISE = /^(kakaotalk|kakao|img|image|dsc|dscn|dscf|pxl|photo|picture|screenshot|screen|shot|capture|untitled|new|copy|스크린샷|사진|캡처|이미지)$/i;

  /**
   * 사진 설명을 정합니다.
   *   1) gallery.json 의 captions 에 파일명이 있으면 그 값
   *   2) 없으면 확장자만 떼고 파일명을 그대로 씁니다
   *        Visit to Durham 2026 July (1 of 2).jpg
   *          → "Visit to Durham 2026 July (1 of 2)"
   *   3) 단, KakaoTalk_20260727_085520601.jpg, IMG_1234.jpg 처럼
   *      기계가 붙인 이름뿐이면 설명 없이 사진만 보여줍니다.
   */
  function galleryCaption(file, caps) {
    if (caps && caps[file]) return caps[file];

    var base = file.replace(/\.[^.]+$/, '').trim();   // 확장자만 제거
    if (!base) return '';

    // 사람이 지은 이름인지 확인 — 의미 있는 낱말이 하나라도 있어야 설명으로 씁니다
    var meaningful = base.replace(/[-_.]+/g, ' ').split(/\s+/).filter(function (w) {
      if (!w) return false;
      if (/^\d+$/.test(w)) return false;                            // 숫자뿐인 조각
      if (FILENAME_NOISE.test(w)) return false;                     // IMG, KakaoTalk 등
      if (/^(img|dsc|dscn|dscf|pxl|p)\d+$/i.test(w)) return false;  // IMG1234, DSC00123
      return true;
    });
    if (!meaningful.length) return '';

    return base;   // 사람이 지은 이름은 손대지 않고 그대로
  }

  /** 사진을 클릭하면 크게 보여주는 오버레이 */
  function setupLightbox(container, items, captions) {
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
      if (e.key === 'Escape')     { close(); }
      else if (e.key === 'ArrowLeft')  { show(idx - 1); }
      else if (e.key === 'ArrowRight') { show(idx + 1); }
    });
  }

  function renderGallery() {
    var box = $('[data-gallery]');
    if (!box) return;
    loadJSON('data/gallery.json').then(function (d) {
      var items = d.items || [];
      var caps = d.captions || {};
      if (!items.length) {
        box.innerHTML =
          '<div class="gallery-empty">' +
          '<p>No photos yet.</p>' +
          '<p class="meta">Photos added to <code>images/gallery/</code> appear here automatically.</p>' +
          '</div>';
        return;
      }

      var captions = items.map(function (f) { return galleryCaption(f, caps); });

      box.innerHTML = '<div class="gallery-grid">' + items.map(function (f, i) {
        var cap = captions[i];
        return '<figure class="gallery-item">' +
               '<button type="button" class="gallery-btn" data-index="' + i + '" aria-label="' +
               esc(cap || 'Open photo') + '">' +
               '<img src="images/gallery/' + esc(f) + '" alt="' + esc(cap || 'Laboratory photo') + '" loading="lazy">' +
               '</button>' +
               (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') +
               '</figure>';
      }).join('') + '</div>';

      setupLightbox(box, items, captions);
    }).catch(function (e) { showError(box, e); });
  }

  /* ── 8. 영상 자동재생 ─────────────────────────────────────────────────── */

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
    setupVideoAutoplay();

    var page = document.body.getAttribute('data-page');

    if (page === 'home') {
      renderNews(4);
    } else if (page === 'publications') {
      renderMetrics();
      renderPublications();
    } else if (page === 'projects') {
      renderProjects();
    } else if (page === 'people') {
      renderPeople();
    } else if (page === 'gallery') {
      renderGallery();
    } else if (page === 'contact') {
      renderNews();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
