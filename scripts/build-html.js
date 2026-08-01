/* ==========================================================================
   data/*.json 을 읽어 HTML 파일 안에 목록을 직접 써 넣습니다.

   왜 이렇게 하나
     예전에는 브라우저가 페이지를 연 뒤에 JavaScript 가 JSON 을 읽어 목록을
     그렸습니다. 사람 눈에는 문제가 없지만, 검색엔진이 받아가는 파일에는
     논문도 학생 이름도 들어 있지 않았습니다. 구글은 나중에 JavaScript 를
     실행해 보기라도 하지만 네이버·다음은 그러지 않습니다.

     이제 이 스크립트가 커밋될 때마다 GitHub Actions 에서 돌면서 HTML 안에
     목록을 완성해 둡니다. 관리하는 쪽에서는 예전과 똑같이 data/*.json 만
     고치면 됩니다.

   어떻게 찾아 바꾸나
     HTML 안의 <!-- BEGIN:이름 --> 과 <!-- END:이름 --> 사이만 갈아끼웁니다.
     그 바깥은 건드리지 않으므로 페이지 구조를 마음대로 손봐도 됩니다.

   직접 돌려보려면
     node scripts/build-html.js
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ── 유틸 ─────────────────────────────────────────────────────────────── */

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', name), 'utf8'));
}

/* ── 소식 ─────────────────────────────────────────────────────────────── */

function buildNews(news, limit) {
  let items = news || [];
  if (limit) items = items.slice(0, limit);
  if (!items.length) return '<p class="loading">No news yet.</p>';
  return '<ul class="news-list">' + items.map(n =>
    '<li class="news-item">' +
    '<span class="news-date">' + esc(n.date) + '</span>' +
    '<p class="news-body">' + esc(n.text) + '</p>' +
    '</li>'
  ).join('') + '</ul>';
}

/* ── 인용 지표 ────────────────────────────────────────────────────────── */

function buildMetrics(m) {
  const cells = [
    { v: m.h_index,   l: 'h-index' },
    { v: m.i10_index, l: 'i10-index' },
    { v: m.citations, l: 'Citations' }
  ].filter(c => c.v !== undefined && c.v !== null);

  let html = '<div class="metric-row">' + cells.map(c =>
    '<div class="metric">' +
    '<span class="metric-value">' + esc(c.v) + '</span>' +
    '<span class="metric-label">' + esc(c.l) + '</span>' +
    '</div>'
  ).join('');

  let src = 'Source: ' + esc(m.source || '') + (m.updated ? ', ' + esc(m.updated) : '');
  if (m.scholar_url) {
    src += ' &middot; <a href="' + esc(m.scholar_url) + '" rel="noopener">Google Scholar profile &rarr;</a>';
  }
  return html + '<p class="metric-source">' + src + '</p></div>';
}

/* ── 논문 ─────────────────────────────────────────────────────────────── */

function buildPublications(journal) {
  if (!journal.length) return '<p class="loading">No publications listed.</p>';

  const list = journal.slice().sort((a, b) => (b.year || 0) - (a.year || 0));

  const order = [];
  const byYear = {};
  list.forEach(p => {
    const y = p.year || '—';
    if (!byYear[y]) { byYear[y] = []; order.push(y); }
    byYear[y].push(p);
  });

  // 오래된 것이 1번. 새 논문을 넣어도 기존 번호가 바뀌지 않습니다.
  let seq = list.length;
  let html = '<section class="pub-section">';
  order.forEach(y => {
    html += '<h3 class="pub-year">' + esc(y) + '</h3><ol class="pub-list">';
    byYear[y].forEach(p => {
      const venue  = p.venue ? '<span class="pub-venue">' + esc(p.venue) + '</span>' : '';
      const detail = p.detail ? ', ' + esc(p.detail) : '';
      const doi = p.doi
        ? ' <a class="pub-doi" href="https://doi.org/' + esc(p.doi) + '" rel="noopener">doi:' + esc(p.doi) + '</a>'
        : '';
      html += '<li class="pub-item">' +
              '<span class="pub-num">' + (seq--) + '</span>' +
              '<span><span class="pub-authors">' + esc(p.authors) + '</span> ' +
              '<span class="pub-title">' + esc(p.title) + '</span>. ' +
              venue + detail + doi + '</span>' +
              '</li>';
    });
    html += '</ol>';
  });
  return html + '</section>';
}

/* ── 연구 소개 페이지의 관련 논문 ─────────────────────────────────────── */

/**
 * 한 연구분야의 논문 편수와 목록으로 가는 링크 한 줄.
 *
 * 처음에는 논문 제목까지 늘어놓았는데, 그러면 분야 하나가 화면을 다 채워
 * 아래에 내용이 더 있다는 걸 알기 어려웠습니다. 편수만 알리고 나머지는
 * Publications 페이지에 맡깁니다.
 *
 * 아직 논문이 없는 분야(극지·환경)는 아무것도 내놓지 않습니다.
 */
function buildScopePapers(journal, scope) {
  const n = journal.filter(p => p.scope === scope).length;
  if (!n) return '';

  return '<p class="scope-papers"><a href="publications.html">' +
         n + ' paper' + (n === 1 ? '' : 's') + ' in this area &rarr;</a></p>';
}

/* ── 연구과제 ─────────────────────────────────────────────────────────── */

const SCOPE_LABELS = {
  resistance:    'Ship Resistance',
  hydrodynamics: 'Ship Hydrodynamics',
  polar:         'Polar & Ice',
  renewable:     'Renewable Energy',
  environmental: 'Environmental',
  other:         'Other'
};

function buildProjectFilters(all) {
  const present = [];
  all.forEach(p => { if (p.scope && present.indexOf(p.scope) === -1) present.push(p.scope); });
  const order = Object.keys(SCOPE_LABELS);
  present.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return '<button class="filter-btn" type="button" data-scope="all" aria-pressed="true">' +
         'All <span class="meta">(' + all.length + ')</span></button>' +
         present.map(s => {
           const n = all.filter(p => p.scope === s).length;
           return '<button class="filter-btn" type="button" data-scope="' + esc(s) + '" aria-pressed="false">' +
                  esc(SCOPE_LABELS[s] || s) + ' <span class="meta">(' + n + ')</span></button>';
         }).join('');
}

/**
 * 과제 전체를 한 번에 써 둡니다. 분야 버튼은 목록을 다시 그리지 않고
 * 해당하지 않는 항목을 숨기기만 하므로, JavaScript 가 없어도 전체가 보입니다.
 */
function buildProjects(all) {
  if (!all.length) return '<p class="loading">No projects listed.</p>';

  return '<ul class="project-list">' + all.map(p => {
    const ko = p.title_ko ? '<p class="project-title-ko">' + esc(p.title_ko) + '</p>' : '';
    const agency = p.agency_en
      ? '<span class="project-agency">' + esc(p.agency_en) +
        (p.agency_ko ? ' &middot; ' + esc(p.agency_ko) : '') + '</span>'
      : '';
    return '<li class="project-item" data-scope="' + esc(p.scope || 'other') + '">' +
           '<div class="project-meta">' +
           '<span class="project-period">' + esc(p.period) + '</span>' +
           agency +
           '</div>' +
           '<p class="project-title-en">' + esc(p.title_en) + '</p>' + ko +
           '</li>';
  }).join('') + '</ul>' +
  '<p class="project-empty" hidden>No projects in this area.</p>';
}

/* ── 구성원 ───────────────────────────────────────────────────────────── */

function papersLine(p) {
  if (!p || !p.papers) return '';
  const f = p.papers.first || 0;
  const c = p.papers.co || 0;
  if (!f && !c) return '';
  const parts = [];
  if (f) parts.push(f + ' first-author');
  if (c) parts.push(c + ' co-author');
  return '<p class="person-papers">' + parts.join(' &middot; ') +
         ' SCIE ' + ((f + c) === 1 ? 'paper' : 'papers') + '</p>';
}

function buildPI(pi) {
  if (!pi) return '';
  const photo = pi.photo
    ? '<div class="pi-photo"><img src="images/people/' + esc(pi.photo) +
      '" alt="' + esc(pi.name_en) + '" width="340" height="454"></div>'
    : '';

  let facts = '';
  if (pi.email)  facts += '<div><span class="k">Email</span><span class="v"><a href="mailto:' + esc(pi.email) + '">' + esc(pi.email) + '</a></span></div>';
  if (pi.office) facts += '<div><span class="k">Office</span><span class="v">' + esc(pi.office) + '</span></div>';
  if (pi.phone)  facts += '<div><span class="k">Tel</span><span class="v">' + esc(pi.phone) + '</span></div>';
  if (pi.interests && pi.interests.length) {
    facts += '<div><span class="k">Interests</span><span class="v">' + pi.interests.map(esc).join(' &middot; ') + '</span></div>';
  }

  const block = (title, rows) => (!rows || !rows.length) ? '' :
    '<h3>' + title + '</h3><ul>' + rows.join('') + '</ul>';

  const edu = (pi.education || []).map(e =>
    '<li>' + esc(e.degree) + ', <em>' + esc(e.school) + '</em>' + (e.year ? ' (' + esc(e.year) + ')' : '') + '</li>');
  const exp = (pi.experience || []).map(e =>
    '<li><strong>' + esc(e.role) + '</strong>, ' + esc(e.org) + (e.period ? ' &mdash; ' + esc(e.period) : '') + '</li>');
  const awd = (pi.awards || []).map(a =>
    '<li>' + esc(a.year) + ' &mdash; ' + esc(a.text) + '</li>');
  const svc = (pi.service || []).map(s =>
    '<li>' + esc(s.period) + ' &mdash; ' + esc(s.text) + '</li>');

  return '<div class="pi">' + photo +
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

function buildCurrent(cur) {
  return (cur || []).map(p => {
    const img = p.photo
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

function buildDestinations(dest) {
  if (!dest || !dest.length) return '';
  return '<p class="section-label">Career destinations</p>' +
         '<ul class="destinations">' + dest.map(o =>
           '<li>' + esc(o.name_en) +
           (o.name_ko ? ' <span class="person-name-ko">(' + esc(o.name_ko) + ')</span>' : '') +
           '</li>'
         ).join('') + '</ul>';
}

function buildAlumni(al) {
  if (!al || !al.length) return '<p class="loading">Alumni list will be added.</p>';
  return '<div class="people-grid">' + al.map(a => {
    const img = a.photo
      ? '<img src="images/people/' + esc(a.photo) + '" alt="' + esc(a.name_en) + '" width="300" height="400" loading="lazy">'
      : '';
    const line = [];
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

/* ── 갤러리 ───────────────────────────────────────────────────────────── */

/* 카메라·메신저가 자동으로 붙이는 이름 조각. 설명이 되지 못하므로 걸러냅니다. */
const FILENAME_NOISE = /^(kakaotalk|kakao|img|image|dsc|dscn|dscf|pxl|photo|picture|screenshot|screen|shot|capture|untitled|new|copy|스크린샷|사진|캡처|이미지)$/i;

function galleryCaption(file, caps) {
  if (caps && caps[file]) return caps[file];

  const base = file.replace(/\.[^.]+$/, '').trim();
  if (!base) return '';

  const meaningful = base.replace(/[-_.]+/g, ' ').split(/\s+/).filter(w => {
    if (!w) return false;
    if (/^\d+$/.test(w)) return false;
    if (FILENAME_NOISE.test(w)) return false;
    if (/^(img|dsc|dscn|dscf|pxl|p)\d+$/i.test(w)) return false;
    return true;
  });
  if (!meaningful.length) return '';

  return base;
}

function buildGallery(items, caps) {
  if (!items || !items.length) {
    return '<div class="gallery-empty">' +
           '<p>No photos yet.</p>' +
           '<p class="meta">Photos added to <code>images/gallery/</code> appear here automatically.</p>' +
           '</div>';
  }

  return '<div class="gallery-grid">' + items.map((f, i) => {
    const cap = galleryCaption(f, caps);
    // data-file 과 data-caption 은 확대 보기(라이트박스)가 읽어갑니다
    return '<figure class="gallery-item">' +
           '<button type="button" class="gallery-btn" data-index="' + i + '"' +
           ' data-file="' + esc(f) + '" data-caption="' + esc(cap) + '"' +
           ' aria-label="' + esc(cap || 'Open photo') + '">' +
           '<img src="images/gallery/' + esc(f) + '" alt="' + esc(cap || 'Laboratory photo') + '" loading="lazy">' +
           '</button>' +
           (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') +
           '</figure>';
  }).join('') + '</div>';
}

/* ── HTML 파일에 써 넣기 ──────────────────────────────────────────────── */

const changed = [];

function inject(file, key, html) {
  const p = path.join(ROOT, file);
  const src = fs.readFileSync(p, 'utf8');

  const begin = '<!-- BEGIN:' + key + ' -->';
  const end   = '<!-- END:' + key + ' -->';
  const i = src.indexOf(begin);
  const j = src.indexOf(end);

  if (i === -1 || j === -1) {
    throw new Error(file + ' 안에서 ' + begin + ' / ' + end + ' 을 찾지 못했습니다.');
  }
  if (j < i) {
    throw new Error(file + ' 의 ' + key + ' 마커 순서가 뒤바뀌어 있습니다.');
  }

  const next = src.slice(0, i + begin.length) + html + src.slice(j);
  if (next === src) return false;

  fs.writeFileSync(p, next);
  if (changed.indexOf(file) === -1) changed.push(file);
  return true;
}

/* ── 실행 ─────────────────────────────────────────────────────────────── */

function main() {
  const news    = readJSON('news.json');
  const metrics = readJSON('metrics.json');
  const pubs    = readJSON('publications.json');
  const projs   = readJSON('projects.json');
  const people  = readJSON('people.json');
  const gallery = readJSON('gallery.json');

  const journal  = pubs.journal || [];
  const projects = projs.projects || [];

  // 홈 — 소식 4건
  inject('index.html', 'news', buildNews(news.news, 4));

  // 연락처 — 소식 전체
  inject('contact.html', 'news', buildNews(news.news));

  // 논문
  inject('publications.html', 'metrics', buildMetrics(metrics));
  inject('publications.html', 'publications', buildPublications(journal));
  inject('publications.html', 'pub-count', String(journal.length));

  // 연구 소개 — 분야마다 논문 편수와 목록 링크
  ['roughness', 'manoeuvring', 'energy', 'arctic', 'fowt', 'tidal', 'environmental']
    .forEach(s => inject('research.html', 'papers-' + s, buildScopePapers(journal, s)));

  // 연구과제
  inject('projects.html', 'project-filters', buildProjectFilters(projects));
  inject('projects.html', 'projects', buildProjects(projects));

  // 구성원
  inject('people.html', 'pi', buildPI(people.pi));
  inject('people.html', 'current', buildCurrent(people.current));
  inject('people.html', 'destinations', buildDestinations(people.alumni_destinations));
  inject('people.html', 'alumni', buildAlumni(people.alumni));

  // 갤러리
  inject('gallery.html', 'gallery', buildGallery(gallery.items, gallery.captions));

  if (changed.length) {
    console.log('갱신됨: ' + changed.join(', '));
  } else {
    console.log('바뀐 내용 없음');
  }
}

main();
