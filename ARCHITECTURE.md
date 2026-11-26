# 🏗️ CHALDEA SUMMON SIMULATOR — 아키텍처 & 모듈 가이드 (`ARCHITECTURE.md`)

별도 빌드 도구나 번들러 없이 정적 호스팅(GitHub Pages) 및 로컬 브라우저에서 즉시 동작하는 **순수 HTML5 / CSS3 / Vanilla ES6+ PWA** 아키텍처입니다.

---

## 📂 디렉터리 구조
```text
fgo-gacha/
├── index.html              # 7개 탭(소환·배틀·영기일람·마이룸·공방·통계·설정) + 모달/소환 스테이지 마크업
├── style.css               # 칼데아 테마, 원작 FGO 대사창, 3D 카드 플립, B/A/Q 배틀 UI, 반응형 스타일
├── servant_catalog.js      # FGO 전체 마테리얼 카탈로그 (No.001~487: 플레이어블 475기 + 미실장 프로필 12기, 179KB 경량 포맷)
├── data.js                 # 19개 클래스 메타(Beast/UnBeast 포함), 475기 서번트 하이드레이션, 28종 개념예장, 12개 배너(커스텀·프렌드 포함)
├── atlas_images.js         # 핵심 45기 서번트 & 28종 예장 Atlas Academy KR CDN URL 맵 (나머지 430기는 art.js에서 KR/JP CDN 자동 해석)
├── kr_lore.js              # 핵심 45기 한그오 공식 원문 대사·프로필 (신규 430기는 상세/마이룸 진입 시 Atlas API 온디맨드 자동 로드)
├── audio.js                # Web Audio API 프로시저럴 사운드 엔진 (볼륨 제어 · 음소거 · FGO 효과음)
├── art.js                  # 공식 일러스트 + ★0 흑테 / ★1~2 동테 / ★3 은테 / ★4~5 금테 SVG 프레임 & 오프라인 폴백
├── summon_fx.js            # Canvas 2D 3D 바닥 소환진 · 3광구 회전 · 치직 승격 · 타자기 대사창 연출 엔진
├── game.js                 # 성정석/커스텀/프렌드 가챠 엔진, 487 마테리얼 도감, 마이룸 육성(★0~★5), 순례의 축제, 통계, 설정, ChaldeaBridge
├── battle.js               # 6인 FGO 커맨드 카드 배틀 엔진 (상성·히든속성·Beast/UnBeast·영주·FP 보상·자동저장 이어하기)
├── pwa.js                  # PWA 원클릭 설치(beforeinstallprompt) & iOS 홈 화면 안내 컨트롤러
├── sw.js                   # 오프라인 지원 Service Worker (v7 · 앱 파일 Network-First + 일러스트 Cache-First)
├── manifest.webmanifest    # PWA 스탠드얼론 앱 매니페스트
├── icons/                  # 전용 PNG 앱 아이콘 (192×192, 512×512, 180×180 Apple Touch)
├── .nojekyll               # GitHub Pages 정적 파일 직서빙 설정
├── README.md               # 프로젝트 소개 및 접속/설치 안내
├── SERVANT_CATALOG.md      # No.001~487 전체 서번트 마테리얼 ID 명세표
├── HIDDEN_STATUS.md        # 전체 487기 히든 스테이터스(성별·속성·성향·특성) & 보구 특공 명세표
├── GAME_SPEC.md            # 가챠·프렌드 소환·배틀·상성·특공·QP 강화 상세 명세서
├── ARCHITECTURE.md         # 본 아키텍처 문서
└── CHANGELOG.md            # 버전별 패치 노트
```

---

## 🔗 모듈 간 통신 & 데이터 흐름

1. **데이터 하이드레이션 (로드 순서)**
   - `servant_catalog.js` → `data.js` → `atlas_images.js` → `kr_lore.js` → `audio.js` → `art.js` → `summon_fx.js` → `game.js` → `battle.js` → `pwa.js`
   - `data.js` 초기화 시 `SERVANT_CATALOG_COMPACT`(475기)를 공식 마테리얼 ID 순서(`001 → 487`)로 확장하며, 기존 45기의 레거시 ID(`sv_castoria`, `sv_oberon` 등)를 100% 보존해 기존 `localStorage` 세이브와 완벽 호환됩니다.
   - `game.js`는 신규 430기의 상세 모달·마이룸 진입 시 `https://api.atlasacademy.io/nice/{KR|JP}/servant/{atlasId}?lore=true`를 1회 온디맨드 조회해 공식 소환 대사·프로필·CV·일러레·마이룸 대사를 자동 채웁니다.
2. **`window.ChaldeaBridge` (가챠 ↔ 배틀 상태 연동)**
   - `game.js`가 노출하는 안전한 상태 브리지:
     - `getState()` — 보유 서번트(레벨/보구/스킬Lv/재림), 개념예장, 성정석 조회
     - `getCommandSpells()` / `consumeCommandSpells(n)` — 매일 0시 자동 전회복 영주 3획 관리
     - `spendSqForRevive()` — 전멸 시 성정석 1개 영기복원
     - `grantBattleRewards(rewards, partyIds)` — 퀘스트 보상 지급 및 출격 보유 서번트 인연 상승
     - `switchToBattleTab()` / `toast(msg)`

---

## 💾 `localStorage` 저장 키 목록
| 키 이름 | 용도 |
| :--- | :--- |
| `fgo_gacha_sim_save_v1` | 마스터 재화, 보유 서번트(레벨·보구·재림·성배·인연·스킬Lv), 개념예장, 배너 천장, 통계, 설정, 영주 |
| `fgo_gacha_active_battle_v1` | 진행 중인 전투 스냅샷 (앱 종료/새로고침 시 이어하기 모달 복원용) |
| `fgo_gacha_custom_imgs_v1` | 사용자가 상세 모달에서 업로드한 커스텀 카드 이미지 DataURL 맵 |
| `fgo_gacha_art_mode_v1` | 일러스트 모드 (`official` / `svg`) |
| `fgo_gacha_muted` / `fgo_gacha_vol` | 사운드 음소거 여부 및 마스터 볼륨 (`0.0 ~ 1.0`) |

---

## 🖼️ 외부 에셋 및 오프라인 폴백 정책
- **공식 일러스트**: `https://static.atlasacademy.io/KR/CharaGraph/...` 및 `Faces/...` (CORS 및 `referrerpolicy="no-referrer"` 적용)
- **오프라인 폴백**: `sw.js`가 한 번 불러온 공식 일러스트를 `chaldea-gacha-art-v1` 캐시에 보관하며, 미캐시 오프라인 환경에서는 `<img>`의 `onerror`가 즉시 SVG 포트레이트 폴백을 노출합니다.
