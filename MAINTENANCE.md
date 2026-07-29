# 홈페이지 관리 가이드

RHL 연구실 홈페이지를 고치는 방법입니다. **터미널이나 Git 명령어를 몰라도 브라우저에서 전부 할 수 있습니다.**

- 사이트 주소: **https://soonseok-song.github.io**
- 저장소: **https://github.com/Soonseok-Song/soonseok-song.github.io**

---

## 가장 중요한 두 가지

**① 수정한 뒤 `Commit changes` 를 눌러야 반영됩니다.** 커밋하면 1~2분 뒤 사이트가 갱신됩니다.

**② 내용은 대부분 `data/` 폴더의 JSON 파일에 있습니다.** HTML을 건드릴 일은 거의 없습니다.

> HTML 파일 안에서 `<!-- BEGIN:... -->` 과 `<!-- END:... -->` 사이는 **자동으로 채워지는 구역**입니다. 직접 고쳐도 다음 갱신 때 지워지니, 그 안의 내용을 바꾸시려면 `data/` 의 JSON을 고치세요.

---

## 브라우저에서 파일 고치는 방법 (공통)

1. 저장소로 갑니다 → https://github.com/Soonseok-Song/soonseok-song.github.io
2. 고칠 파일을 클릭합니다 (예: `data` 폴더 → `publications.json`)
3. 오른쪽 위 **연필 아이콘**(Edit this file)을 누릅니다
4. 내용을 고칩니다
5. 아래 **`Commit changes`** → 초록 버튼 **`Commit changes`**
6. 1~2분 뒤 사이트에서 확인합니다

> 여러 파일을 한 번에 고치려면 저장소 화면에서 **`.` 키**를 누르세요. 브라우저에 VSCode가 열립니다 (무료).

---

## 무엇을 하려면 어디를 고치나

| 하고 싶은 것 | 고칠 파일 | 소요 |
|---|---|---|
| 논문 추가 | `data/publications.json` | 2분 |
| 연구과제 추가 | `data/projects.json` | 2분 |
| 소식 추가 | `data/news.json` | 1분 |
| 학생 추가 / 졸업 처리 | `data/people.json` | 3분 |
| h-index·피인용수 갱신 | `data/metrics.json` | 30초 |
| 갤러리 사진 올리기 | `images/gallery/` 폴더에 업로드 | 1분 |
| 연구 분야 설명 수정 | `research.html` | 5분 |
| 첫 페이지 소개글 수정 | `index.html` | 5분 |
| 연락처·모집 안내 수정 | `contact.html` | 3분 |

---

## 1. 논문 추가

`data/publications.json` 을 열고, `"journal": [` 바로 다음에 아래를 붙여넣습니다. **맨 위에 넣으면 최신 논문이 위에 옵니다.**

```json
    {
      "year": 2027,
      "authors": "Kim, K., et al.",
      "title": "여기에 논문 제목",
      "venue": "Ocean Engineering",
      "detail": "370: 128000",
      "doi": "10.1016/j.oceaneng.2027.128000"
    },
```

- `detail` — 권(호): 페이지 또는 논문번호. 없으면 `""`
- `doi` — 없으면 `""` 로 두세요. 넣으면 제목 뒤에 링크가 생깁니다 (`10.` 으로 시작하는 부분만, `https://doi.org/` 는 빼고)
- **마지막 항목 뒤에는 쉼표를 붙이지 않습니다**

논문 번호는 자동으로 매겨집니다. 오래된 논문이 1번이라 새 논문을 추가해도 기존 번호가 바뀌지 않습니다.

**학회 발표는 이 페이지에 싣지 않습니다.** 학술지 논문만 나옵니다. 학회 발표도 보여주기로 하시면 알려주세요 — 목록과 화면을 다시 만들면 됩니다.

## 2. 연구과제 추가

`data/projects.json` 의 `"projects": [` 다음에:

```json
    {
      "title_en": "English project title",
      "title_ko": "국문 과제명",
      "agency_en": "Korea Research Institute of Ships and Ocean Engineering (KRISO)",
      "agency_ko": "선박해양플랜트연구소",
      "period": "2027–2029",
      "scope": "hydrodynamics"
    },
```

`scope` 는 아래 여섯 개 중 하나입니다. Projects 페이지의 필터 버튼과 연결됩니다.

| scope 값 | 버튼 이름 |
|---|---|
| `resistance` | Ship Resistance |
| `hydrodynamics` | Ship Hydrodynamics |
| `polar` | Polar & Ice |
| `renewable` | Renewable Energy |
| `environmental` | Environmental |
| `other` | Other |

> `period` 의 가운데 기호는 en dash(`–`)입니다. 보통 하이픈(`-`)을 써도 표시에는 문제없습니다.

> **예산 금액이나 미공개 산업체 과제 내용은 넣지 마세요.**

## 3. 소식 추가

`data/news.json` 의 `"news": [` 다음에. **맨 위가 최신입니다.**

```json
    {
      "date": "March 2027",
      "text": "One-sentence description of the news."
    },
```

`date` 는 적은 그대로 화면에 나옵니다. `March 2027` 처럼 월-연도까지만 쓰는 걸 권합니다.

> 소식은 **비어 있거나 오래된 게 가장 나쁩니다.** 1년 넘게 새 항목이 없으면 사이트가 방치된 것처럼 보입니다. 학기마다 한 번은 확인해 주세요.

## 4. 학생 추가 / 졸업 처리

`data/people.json` 을 엽니다.

**신입생 추가** — `"current": [` 안에:

```json
    {
      "name_en": "Gildong Hong",
      "name_ko": "홍길동",
      "photo": "hong-gildong.jpg",
      "topic": "Tidal turbines; propeller modelling"
    },
```

사진은 먼저 `images/people/` 폴더에 업로드해야 합니다 (아래 규격 참고). 사진이 아직 없으면 `"photo": null` 로 두세요 — 회색 칸으로 표시됩니다.

**졸업 처리** — `current` 에서 해당 항목을 지우고 `"alumni": [` 안에 추가합니다:

```json
    {
      "name_en": "Wooseok Choi",
      "name_ko": "최우석",
      "graduated": "2025",
      "thesis": "Thesis title",
      "position": "Hanwha Ocean"
    },
```

> **졸업생의 회사 이메일이나 개인 연락처는 넣지 마세요.** 현재 직장을 적을 때도 본인 동의를 받는 것이 좋습니다.

**졸업생 취업처** — People 페이지의 Alumni 제목 바로 아래, 사람 사진보다 먼저 나오는 목록입니다. 같은 파일의 `"alumni_destinations": [` 안에 한 줄 추가하면 됩니다:

```json
    { "name_en": "Hyundai Heavy Industries", "name_ko": "현대중공업" },
```

기관 이름만 적는 자리라 개인 정보가 들어가지 않습니다. 한 사람이 어디로 갔는지는 위의 졸업생 카드에 `"position"` 으로 적습니다.

## 5. h-index 갱신

`data/metrics.json` — 숫자만 고치면 됩니다.

```json
{
  "h_index": 24,
  "i10_index": 33,
  "citations": 1820,
  "source": "Google Scholar",
  "updated": "June 2027"
}
```

Google Scholar 프로필에서 숫자를 확인하고 `updated` 도 함께 바꿔주세요. **연 1회면 충분합니다.**

## 6. 갤러리 사진 올리기 — 학생에게 맡길 수 있는 작업

1. 저장소에서 `images` → `gallery` 폴더로 들어갑니다
2. 오른쪽 위 **`Add file`** → **`Upload files`**
3. 사진을 드래그해서 놓습니다
4. 아래 **`Commit changes`**

**목록 파일은 건드리지 않아도 됩니다.** GitHub Actions가 `data/gallery.json` 을 자동으로 갱신합니다.

**파일명을 날짜로 시작하면 최신 사진이 앞에 옵니다:**

```
2026-07-26-isope-conference.jpg
2026-06-14-towing-tank-test.jpg
```

갤러리에서 **사진을 클릭하면 크게 보입니다.** 좌우 화살표 키나 버튼으로 넘길 수 있고, `Esc` 로 닫습니다.

### 사진에 설명 붙이기

**방법 1 — 파일명이 곧 설명입니다 (추가 작업 없음)**

파일 이름을 **`(연도.월) 설명`** 으로 지으세요.

```
(2026.07) Visit to Durham.jpg
(2026.07) Visit to Durham (1 of 2).jpg      같은 행사가 여러 장이면
(2024.11) 2024 대한조선학회 추계 학술대회.jpg     한글도 그대로 나옵니다
```

확장자만 떼고 이름을 **그대로** 설명으로 보여줍니다. 손대지 않으니 지으신 대로 나옵니다.

**맨 앞 `(연도.월)` 이 정렬 기준입니다.** 최신 사진이 앞에 오고, **나중에 옛날 사진을 올려도 알아서 제자리에 들어갑니다.**

같은 행사 사진이 여러 장이면 뒤에 `(1 of 2)`, `(2 of 2)` 를 붙이세요. 번호 순으로 나옵니다. (파일명에 `/` 는 쓸 수 없어 `of` 를 씁니다.)

> 옛 형식(`Visit to Durham 2026 July.jpg`, `2026-07-27-무엇.jpg`)도 여전히 인식합니다. 다만 `(2026.07)` 형식이 가장 확실하고, 파일 목록에서도 시간순으로 정렬돼 찾기 쉽습니다.

> 연월이 아예 없으면 맨 뒤로 갑니다.

**카메라나 메신저가 붙인 이름은 설명 없이 사진만 나옵니다.** 그런 이름은 설명이 되지 못하니 일부러 걸러냅니다:

```
KakaoTalk_20260727_085520601.jpg    →  (설명 없음)
IMG_1234.jpg  ·  DSC00123.JPG       →  (설명 없음)
Screenshot 2026-07-27 002533.jpg    →  (설명 없음)
untitled.png                        →  (설명 없음)
```

**방법 2 — 직접 써 넣기**

문장이나 대소문자를 정확히 지정하고 싶을 때(`ISOPE 2026, Seoul` 처럼), 또는 이미 올린 사진의 파일명이 `KakaoTalk_...` 인 경우입니다. `data/gallery.json` 의 `captions` 에 파일명을 키로 넣으면 **방법 1보다 우선합니다.**

```json
  "captions": {
    "KakaoTalk_20260727_085520601.jpg": "Towing tank test, July 2026",
    "2026-06-14-isope-conference.jpg": "ISOPE 2026, Seoul"
  },
```

> 이미 올린 사진은 **파일명을 바꾸는 것으로도 해결됩니다.** GitHub에서 그 파일을 열고 연필 아이콘을 누르면, 내용은 못 고쳐도 **파일명은 바꿀 수 있습니다.** 이름을 고치고 Commit하면 설명이 자동으로 붙습니다.

**사진을 지우려면** 파일을 삭제하면 됩니다 (파일 클릭 → 휴지통 아이콘 → Commit). 목록도 자동으로 갱신됩니다.

---

## 사진을 교체하거나 새로 넣을 때

**GitHub 웹 편집기는 텍스트 파일만 편집할 수 있습니다.** 이미지를 클릭해 연필 아이콘을
누르면 `binary file` 이라며 거부하는데, 정상입니다. 이미지는 *수정*이 아니라 *교체*를
합니다.

### 가장 쉬운 방법 — 같은 파일명으로 덮어쓰기

1. 새 사진의 파일명을 **기존 파일명과 똑같이** 바꿉니다 (예: `song-seunghee.jpg`)
2. 저장소에서 해당 폴더로 들어갑니다 (예: `images/people/`)
3. **`Add file`** → **`Upload files`** → 사진을 드래그
4. **`Commit changes`**

파일명이 같으면 GitHub이 자동으로 교체합니다. **기존 파일을 먼저 지울 필요 없습니다.**

### 파일명을 바꿔서 넣는 경우

두 단계가 필요합니다:

1. 새 파일을 `images/people/` 에 업로드
2. `data/people.json` 의 해당 사람 `"photo"` 값을 새 파일명으로 수정

그래서 **같은 이름으로 올리는 편이 훨씬 간단합니다.**

### 사진 지우기

파일을 클릭 → 오른쪽 위 **휴지통 아이콘** → `Commit changes`.
인물 사진을 지웠으면 `people.json` 의 `"photo"` 를 `null` 로 바꿔주세요
(그러면 회색 칸으로 표시됩니다).

---

## 이미지·영상 규격

| 용도 | 폴더 | 권장 |
|---|---|---|
| 인물 사진 | `images/people/` | 세로 3:4, 높이 480px 내외, **200KB 이하** |
| 연구 그림 | `images/research/` | 폭 900px 내외, **300KB 이하** |
| 갤러리 사진 | `images/gallery/` | 폭 1200px 이하, **500KB 이하** |
| 영상 | `videos/` | MP4(H.264), **3MB 이하** |

### ⚠️ GIF는 쓰지 마세요

GIF는 압축이 형편없어서 같은 애니메이션이 MP4보다 **10~20배 큽니다.** 실제로 이 사이트를 만들 때 pptx에서 뽑은 GIF 421MB를 MP4로 바꿨더니 **21MB**가 됐습니다.

MP4로 바꾸려면 [ffmpeg](https://ffmpeg.org)로:

```
ffmpeg -i input.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 30 -an output.mp4
```

HTML에서는 이렇게 넣으면 GIF처럼 자동재생·무한반복됩니다:

```html
<video src="videos/파일명.mp4" autoplay muted loop playsinline preload="metadata"></video>
```

`muted` 가 없으면 브라우저가 자동재생을 막습니다.

### 용량 한도

GitHub Pages 사이트는 **1GB**까지입니다. 현재 약 30MB를 쓰고 있어 여유가 많습니다. 다만 **한 번 커밋한 파일은 지워도 저장소 이력에 남습니다** — 큰 파일을 올리기 전에 크기를 줄여주세요.

30초를 넘는 영상은 저장소에 넣지 말고 **YouTube에 올려 임베드**하는 편이 낫습니다.

---

## 로컬에서 미리 보기

HTML 파일을 **더블클릭해서 브라우저로 열면 그대로 보입니다.** 논문 목록도 구성원도 다 나옵니다. 별도 프로그램이 필요 없습니다.

---

## 자동으로 돌아가는 것들

`.github/workflows/` 에 세 개가 있습니다. 손댈 필요 없습니다.

| 워크플로 | 언제 | 무엇을 |
|---|---|---|
| `build-html.yml` | `data/*.json` 변경 시 | **목록을 HTML 안에 다시 써 넣습니다** |
| `gallery-index.yml` | `images/gallery/` 변경 시 | 갤러리 목록 갱신 + HTML 갱신 |
| `validate-json.yml` | `data/*.json` 변경 시 | JSON 문법 검사 + 사진 파일 존재 확인 |

**JSON 문법이 틀리면 GitHub이 이메일로 알려줍니다.** 사이트가 조용히 깨지는 걸 막기 위한 것입니다. 실행 결과는 저장소 상단 **Actions** 탭에서 볼 수 있습니다.

### 목록이 HTML 안에 들어 있는 이유

논문·구성원·연구과제·갤러리·소식 목록은 `scripts/build-html.js` 가 JSON을 읽어 **HTML 파일 안에 직접 써 둡니다.** 예전에는 방문자의 브라우저가 페이지를 연 뒤에 목록을 그렸는데, 그러면 검색엔진이 받아가는 파일에는 논문도 학생 이름도 들어 있지 않았습니다. 구글은 나중에 JavaScript를 실행해 보기라도 하지만 **네이버와 다음은 그러지 않습니다.**

관리하는 방법은 예전과 같습니다 — `data/*.json` 만 고치시면 됩니다. 커밋하면 1~2분 뒤 HTML이 자동으로 갱신됩니다.

HTML 파일 안에 이런 표시가 보이면 그 사이는 자동으로 채워지는 구역입니다. **직접 고쳐도 다음 갱신 때 지워집니다.**

```html
<!-- BEGIN:publications -->  ... 자동 생성 ...  <!-- END:publications -->
```

바깥쪽은 마음대로 고치셔도 됩니다.

---

## 문제 해결

**사이트가 안 바뀐다**
1~2분 기다렸는지 확인하세요. 그래도 안 되면 저장소 **Actions** 탭에서 실패한 작업(빨간 X)이 있는지 봅니다. 브라우저 강력 새로고침은 `Ctrl+F5`.

**목록이 통째로 사라졌다**
JSON 문법 오류입니다. 거의 항상 원인은 셋입니다:
- 마지막 항목 뒤에 **쉼표가 남아 있다** (`},` → `}`)
- 항목 사이에 **쉼표가 빠졌다**
- 따옴표 짝이 안 맞는다

**Actions** 탭의 `Validate JSON` 결과를 보면 어느 줄인지 알려줍니다.

**사진이 빈 칸으로 나온다**
`people.json` 의 `photo` 값과 `images/people/` 의 실제 파일명이 정확히 같은지 확인하세요. **대소문자와 확장자(.jpg / .jpeg)를 구분합니다.**

**잘못 고쳐서 되돌리고 싶다**
저장소 상단 **`Commits`** → 되돌리고 싶은 커밋 클릭 → 오른쪽 **`...`** → **`Revert`**. 커밋 하나가 취소됩니다.

**AI에게 시키고 싶다**
Claude Code 같은 도구에 이 저장소 폴더를 열어주고 *"MAINTENANCE.md 읽고 논문 추가해줘"* 라고 하면 됩니다. 논문 여러 편을 한꺼번에 넣거나 디자인을 바꿀 때 편합니다.

---

## 파일 구조

```
soonseok-song.github.io/
├─ index.html            Home — 소개, 연구 분야 7개, 소식
├─ research.html         연구 분야 상세 (그림·영상)
├─ projects.html         연구과제 (분야 필터)
├─ publications.html     논문 목록
├─ people.html           구성원
├─ gallery.html          갤러리
├─ contact.html          연락처, 대학원 모집
│
├─ css/style.css         전체 디자인. 색을 바꾸려면 파일 맨 위 변수만 수정
├─ js/site.js            사진 확대·과제 필터·영상 재생 (목록은 여기서 안 만듭니다)
├─ scripts/
│   └─ build-html.js     JSON을 읽어 HTML 안에 목록을 써 넣습니다 (Actions가 실행)
├─ robots.txt            검색엔진 안내
├─ sitemap.xml           검색엔진용 페이지 목록. 페이지를 추가하면 여기도 추가
├─ googlecf60e...html    구글 소유 확인 파일 — 지우면 확인이 풀립니다
│
├─ data/                 ← 평소 고치는 것은 거의 다 여기
│   ├─ publications.json 논문
│   ├─ projects.json     연구과제
│   ├─ people.json       구성원 (PI·재학생·졸업생)
│   ├─ metrics.json      h-index 등
│   ├─ news.json         소식
│   └─ gallery.json      갤러리 목록 (자동 생성)
│
├─ images/
│   ├─ rhl-logo.svg      연구실 로고 — 상단 메뉴와 푸터에 표시
│   ├─ favicon.svg       브라우저 탭 아이콘
│   ├─ favicon-32.png    구형 브라우저용 탭 아이콘
│   ├─ apple-touch-icon.png  iPhone·iPad 홈 화면 아이콘
│   ├─ people/           인물 사진
│   ├─ research/         연구 그림 (파일명 s08~s36은 원본 슬라이드 번호)
│   └─ gallery/          갤러리 사진 ← 학생이 업로드하는 곳
├─ videos/               MP4 영상
│
├─ .github/workflows/    자동화 (건드릴 필요 없음)
├─ .nojekyll             GitHub의 Jekyll 처리를 끄는 빈 파일 — 지우지 마세요
└─ MAINTENANCE.md        이 문서
```

### 로고를 바꿀 때

로고는 두 곳에 쓰입니다.

| 파일 | 쓰이는 곳 | 파일 안의 색 |
|---|---|---|
| `images/rhl-logo.svg` | 상단 메뉴, 푸터 | **무시됩니다** |
| `images/favicon.svg` | 브라우저 탭, 즐겨찾기 | 그대로 나옵니다 |

`rhl-logo.svg`는 그림이 아니라 **모양 틀**로 쓰입니다. CSS가 이 모양대로 색을 칠하기 때문에, 파일 안의 색을 무엇으로 두든 화면에서는 밝은 배경에서 남색, 어두운 배경에서 하늘색, 푸터에서 회색으로 알아서 나옵니다. 로고를 바꾸실 때는 **색은 신경 쓰지 말고 모양만** 맞추시면 됩니다.

새 로고의 가로세로 비율이 지금과 다르면 `css/style.css`에서 `aspect-ratio: 1656 / 762`를 두 곳(`.brand-logo`, `.foot-logo`) 고쳐야 찌그러지지 않습니다. 숫자는 SVG 파일 첫 줄 `viewBox`의 셋째·넷째 값입니다.

탭 아이콘을 바꾸시려면 `favicon.svg`를 고친 뒤 **`favicon-32.png`와 `apple-touch-icon.png`도 같은 그림으로 다시 만들어야** 합니다(SVG를 지원하지 않는 브라우저와 iPhone이 이 둘을 봅니다). 이 변환은 AI에게 맡기시는 편이 빠릅니다.

### 내비게이션(상단 메뉴)을 고칠 때

메뉴는 **7개 HTML 파일에 각각 들어 있습니다.** 페이지를 추가하거나 메뉴 이름을 바꾸려면 7개를 모두 고쳐야 합니다. 빌드 도구 없이 순수 HTML로 만든 대가인데, 그 덕에 몇 년 뒤에도 이 사이트는 아무 설치 없이 열립니다. 이런 작업은 AI에게 맡기는 편이 빠릅니다.

---

## 절대 올리면 안 되는 것

이 저장소는 **공개(public)** 입니다. 커밋한 파일은 누구나 볼 수 있고, **나중에 지워도 이력에 영구히 남습니다.**

- 주민등록번호, 생년월일, 집 주소가 든 문서 (한글 이력서 등)
- 개인 휴대폰 번호
- 학생 개인 이메일
- 미공개 과제 제안서, 예산 자료, 산업체 기밀 문서
- 저작권이 출판사에 있는 논문 PDF (CC BY 오픈 액세스 논문은 출처 표시 후 사용 가능)

작업용 원본 파일(pptx, CV, 원본 사진)은 Dropbox의 `00_Claude_code\홈페이지\소스파일\` 에 두고 있습니다. 그쪽은 공개되지 않습니다.
