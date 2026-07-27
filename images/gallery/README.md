# 갤러리 사진 올리는 곳

이 폴더에 사진을 올리면 **갤러리 페이지에 자동으로 나타납니다.** 목록 파일은 건드리지 않아도 됩니다.

## 올리는 방법

1. 이 폴더에서 오른쪽 위 **`Add file`** → **`Upload files`**
2. 사진을 드래그해서 놓습니다
3. 아래 초록 버튼 **`Commit changes`**
4. 1~2분 뒤 https://soonseok-song.github.io/gallery.html 에서 확인

## 파일 이름을 `날짜-설명` 으로 지으세요

두 가지가 한꺼번에 해결됩니다 — **최신 사진이 앞에 오고, 설명도 자동으로 붙습니다.**

```
2026-07-26-isope-conference.jpg    →  갤러리에 "Isope conference" 라고 표시
2026-06-14-towing-tank-test.jpg    →  "Towing tank test"
```

하이픈이 공백으로 바뀌고 첫 글자가 대문자가 됩니다. 날짜 접두사가 없으면 설명 없이 사진만 나옵니다.

대문자를 정확히 쓰고 싶거나(`ISOPE 2026, Seoul`) 파일명이 이미 `KakaoTalk_2026...` 처럼 되어 있으면, `data/gallery.json` 의 `captions` 에 직접 넣으면 됩니다. 자세한 건 [MAINTENANCE.md](../../MAINTENANCE.md) 참고.

## 지켜주세요

- **폭 1200px 이하, 500KB 이하**로 줄여서 올려주세요. 휴대폰 원본(5MB 이상)을 그대로 올리면 사이트가 느려집니다.
- 이 저장소는 **공개**입니다. 사진에 찍힌 사람의 동의를 받고, 화면에 미공개 자료가 보이지 않는지 확인해 주세요.
- **한 번 올린 파일은 지워도 저장소 이력에 남습니다.** 올리기 전에 한 번 더 확인해 주세요.
- 지원 형식: `.jpg` `.jpeg` `.png` `.webp` `.avif`

사진에 설명을 붙이려면 `data/gallery.json` 의 `captions` 를 보세요. 자세한 내용은
저장소 최상단의 [MAINTENANCE.md](../../MAINTENANCE.md) 에 있습니다.
