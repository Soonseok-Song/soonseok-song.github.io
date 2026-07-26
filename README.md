# RHL — Resistance Hydrodynamics Laboratory

Website source for the **Resistance Hydrodynamics Laboratory (RHL)**, Department of
Naval Architecture and Ocean Engineering, Inha University.

**Live site:** https://soonseok-song.github.io

## Maintaining this site

**→ [MAINTENANCE.md](MAINTENANCE.md)** — 관리 방법이 한국어로 정리되어 있습니다.
논문 추가, 갤러리 사진 업로드, 구성원 변경을 브라우저에서 하는 방법을 담고 있습니다.

Most content lives in `data/*.json`. The HTML rarely needs editing.

| Path | What it is |
|---|---|
| `*.html` | Seven pages — Home, Research, Projects, Publications, People, Gallery, Contact |
| `css/style.css` | All styling. Colours are CSS variables at the top of the file |
| `js/site.js` | Reads `data/*.json` and renders the lists |
| `data/` | Publications, projects, people, metrics, news, gallery index |
| `images/` | `people/`, `research/`, `gallery/` |
| `videos/` | Short MP4 loops converted from simulation animations |
| `.github/workflows/` | Gallery auto-indexing and JSON validation |

No build step and no dependencies — plain HTML, CSS and JavaScript. Changes pushed to
`main` are published automatically within a minute or two.

## Not in this repository

Working files (presentation decks, CVs, original photographs) are kept outside this
public repository and are never published. See the last section of MAINTENANCE.md.
