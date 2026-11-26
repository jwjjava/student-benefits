# CLAUDE.md

이 파일은 이 저장소에서 코드를 작성할 때 항상 지켜야 할 기준이다. 기능을 추가하거나 바꾸기 전에 먼저 읽고, 여기와 다르게 해야 하면 코드보다 이 문서를 먼저 고친다.

> **Next.js 16.4 주의:** 이 프로젝트의 Next.js는 학습 데이터와 API가 다르다(`AGENTS.md` 참고). 라우팅·캐싱·데이터 패칭 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 문서를 먼저 읽는다.

---

## 1. 프로젝트 개요

**대학생 혜택 모음 웹서비스.** 흩어진 대학생 혜택을 한곳에서 찾고, 조건을 확인하고, 저장했다가 다시 꺼내 보게 한다.

- **문제(가설):** 대학생은 혜택을 검색·학교 공지·SNS·지인 등 여러 경로로 알게 되고, 캘린더·메모장에 따로 적어 둔다. 그래서 다시 찾기 어렵거나 늦게 알아 기회를 놓치는지 **검증하는 것**이 이번 목표다.
- **이번 버전의 성격:** 완성된 제품이 아니라 **수요 검증용 MVP**다. 기능을 늘리는 것보다 **행동을 정확히 측정하는 것**이 우선이다.
- **핵심 사용 흐름**
  1. 공유 링크로 접속
  2. 분야를 고르거나 검색해 혜택을 찾음
  3. 대상·기간·이용 방법 확인
  4. 찜하거나 외부 신청 페이지로 이동
  5. 돌아오면 이용 여부 팝업에 선택적으로 응답
  6. 필요할 때 찜 목록에서 다시 확인

### 성공 기준 (공개 14일 후 측정)

| 지표 | 기준 | 코드에서 필요한 것 |
| --- | --- | --- |
| 외부 이용 링크 클릭 | 방문자 30명 이상, 그중 30% 이상 클릭 | `page_view`, `outbound_click` 이벤트와 익명 방문자 ID |
| 몰랐던 혜택의 실제 이용 | 신청·예약·구매 완료 응답 5명 이상 | `survey_responses` (`response = 'used'`, `knew_before = false`) |
| 찜한 혜택 재확인 | 10명 중 8명 이상이 도움 없이 다시 찾음 (공개 전 과제) | 찜 목록에서 혜택과 조건이 바로 보일 것 |

### 기획 문서

- Notion: 개발 범위·개발 구조, PRD
- Figma `대학생-할인-혜택`: `[기획] 와이어프레임`, `[디자인] UI`(화면 + 디자인 가이드), `[기획] 화면설계서, 기능명세서`(SCR-DETAIL-01/02, SCR-POP-01, 기능 D-01~03·B-01·E-01~03)

---

## 2. 개발 범위

### 이번에 만드는 것

| 기능 | 구현 | 우선순위 |
| --- | --- | --- |
| 혜택 탐색 | 목록 · 분야 칩 · 정렬(추천순/인기순/가까운 순) · 검색(최근·인기 검색어) | 필수 |
| 혜택 상세 | 로고·분야/제공처 · 대표 이미지 · 이용 대상 · 기간 및 이용 방법 · 출처 · 신청 링크 · 종료 표시 | 필수 |
| 찜 | 카드·상세의 하트로 저장·해제 | 필수 |
| 찜 목록 / 최근 본 항목 | 메뉴에서 진입. 브라우저에 저장 | 필수 |
| 행동 측정 | 방문 · 상세 조회 · 찜 · 외부 링크 클릭 · 검색 · 정렬/분야 선택 | 필수 |
| 이용 여부 팝업 | 외부 신청 페이지에서 돌아오면 표시 + 기존 인지 여부 추가 질문 | 필수 |
| 정보 오류 제보 | 상세 하단에서 유형 선택 + 내용 | 필수 |
| 개인화 추천 | 관심 분야 기반 추천 | 협의 (미구현) |
| 맞춤 알림 | 신규 · 마감 임박 혜택 안내 (사이트 내 표시) | 후순위 (카드·상세의 `D-n` 표시만) |

### 이번에 만들지 않는 것 (요청이 있어도 먼저 확인할 것)

- **로그인·회원가입**: 모든 사용자는 익명이다.
- **관리자 화면**: 혜택은 팀원이 Supabase 대시보드(Table Editor)에서 직접 검수·수정한다.
- **서버에 저장되는 찜·최근 본 항목**: 브라우저 저장소에만 둔다.
- **자체 예약·결제**: 공식 신청 페이지로 보낸다.
- **푸시 알림, 앱, 별점·후기, AI 자동 공개.**

### 화면

| 화면 (Figma) | 경로 | 비고 |
| --- | --- | --- |
| 홈 · IT 선택 · 정렬 선택 | `/` | 분야·정렬은 `?category=`, `?sort=`로 유지 |
| 위치 권한 요청 · 내 위치 기준 · 권한 미허용 안내 · 에리카 주변 탐색 | `/?sort=nearby` | 위치 동의는 브라우저에 기억 |
| 검색 입력 · 검색 결과 · 검색 결과 없음 | `/search` | 검색어는 `?q=` |
| 혜택 상세 · 혜택 상세(종료) · 혜택 이용 여부 | `/benefits/[slug]` | SCR-DETAIL-01/02, SCR-POP-01 |
| 메뉴 패널 | 헤더 ≡ | 찜, 최근 본 항목 |
| 찜 · 빈 상태(찜) | `/saved` | 브라우저에서만 렌더 |
| 최근 본 항목 · 빈 상태(최근) | `/recent` | 브라우저에서만 렌더 |
| 404 | `not-found.tsx` | 없는 slug |

### 정책 (기획서에서 '미정'이던 것을 이렇게 정했다)

- **종료된 혜택:** 목록·검색에서는 숨기고, 찜·최근 본 항목·상세 URL에서는 "종료" 표시와 비활성 버튼(`종료된 혜택이에요`)으로 보여 준다.
- **비공개 혜택:** `is_published = false`인 혜택은 검수 여부와 관계없이 목록·검색에서 숨기고, 상세 URL로 들어오면 종료된 혜택과 똑같이 보여 준다(`get_withdrawn_benefit()`, 팀 결정 2026-11-26). 그래서 slug를 아는 사람은 검수 전 초안도 볼 수 있다. 초안에 확인되지 않은 내용을 넣지 않는다. DB에 없는 slug만 404다.
- **이용 여부 팝업:** 신청 링크를 누르고 3초 이상 지난 뒤 같은 상세로 돌아오면 한 번 묻는다(탭 단위 `sessionStorage`). '나중에 답할게요'는 `survey_dismiss`만 기록하고 다시 묻지 않는다. '네, 이용했어요'를 고르면 "원래 알고 있었나요?"를 이어서 묻는다(성공 기준용).
- **가까운 순:** 매장 좌표(`latitude`, `longitude`)가 있는 혜택만 보여 준다. 위치를 거부·실패하면 한양대 ERICA 캠퍼스 기준.
- **인기순:** 최근 30일 찜 + 외부 링크 클릭 수(`benefit_popularity()` 함수).
- **인기 검색어:** 지금은 `SearchView.tsx`의 상수 `POPULAR_KEYWORDS`. 검색 기록이 쌓이면 집계로 바꾼다.

---

## 3. 기술 스택

- **Next.js 16.4 (App Router, Turbopack)** + **React 19.3** + **TypeScript** (`strict`)
  - `cacheComponents`와 `partialPrefetching`을 켜 두었다.
- **Tailwind CSS 4** (`globals.css`의 `@theme` 토큰)
- **Pretendard** 폰트 (`pretendard` 패키지)
- **Supabase** (`@supabase/supabase-js`): 혜택 원본 + 기록·설문·제보 수집 (4.3 참고)
- **zod 4**: DB 행·샘플 JSON·브라우저 저장소 값 검증
- **Vitest**: 순수 함수 단위 테스트
- 패키지 매니저: **npm** (이 PC에 pnpm이 없어 npm으로 정했다)
- 배포: Vercel

### 저장소·배포

- GitHub: `jwjjava/student-benefits` (비공개). 기본 브랜치 `main`.
- Vercel: 팀 `jwj3`, 프로젝트 `student-benefits`, 프로덕션 https://student-benefits-ten.vercel.app
  - GitHub 연동으로 `main`에 푸시하면 프로덕션, 다른 브랜치는 프리뷰로 자동 배포된다.
  - 환경변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 Vercel 프로젝트 설정에 있다.
  - 이 PC는 컴퓨터 이름이 한글이라 Vercel CLI 로그인이 실패한다. 배포 설정은 대시보드에서 한다.
- GitHub CLI는 `C:\Program Files\GitHub CLI\gh.exe`에 있다(PATH에 없을 수 있음).

새 라이브러리는 꼭 필요할 때만 추가하고, 추가할 때는 이유를 PR이나 커밋 메시지에 적는다.

### 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 라우트 타입 생성(`next typegen`) 후 `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run db:seed` | `supabase/sample-benefits.json` → `supabase/seed.sql` 생성 |

---

## 4. 아키텍처

### 4.1 원칙

1. **서버에서 읽고, 캐시로 내보내기.** 혜택은 `features/benefits/data.ts`의 `getCatalog()`가 서버에서 한 번에 읽는다. 이 함수는 `'use cache'` + `cacheLife({ stale: 300, revalidate: 300, expire: 86400 })` + `cacheTag('benefits')`로 캐시된다. 대시보드 수정은 배포 없이 최대 5분 안에 반영된다. (Next 16에서는 `export const revalidate` 대신 이 방식을 쓴다.)
2. **목록 전체를 내려보내고 클라이언트에서 거른다.** 혜택은 100개 안팎이므로 분야 필터·정렬·검색·거리 계산은 브라우저에서 순수 함수(`search.ts`)로 한다.
3. **데이터 접근은 한 곳에서.** 혜택 조회는 `getCatalog()`, `getBenefitBySlug()`로만 한다. 컴포넌트나 페이지에서 Supabase 쿼리를 직접 쓰지 않는다. DB 행(snake_case) → `Benefit`(camelCase) 변환은 `schema.ts`의 zod 스키마가 한다.
4. **브라우저 저장소는 `createLocalStore()`로만.** `lib/local-store.ts`가 zod 검증·`useSyncExternalStore` 구독·다른 탭 동기화를 맡는다. 컴포넌트에서 `localStorage`를 직접 쓰지 않는다.
5. **측정은 `track()` 하나로.** 실패해도 기다리지 않고 사용자 흐름을 막지 않는다. 설문·제보는 `features/feedback/api.ts`로만 보낸다.
6. **클라이언트 컴포넌트는 최소로.** 찜 버튼, 분야·정렬, 검색, 팝업처럼 상태가 필요한 곳만 `"use client"`.
7. **Supabase 환경변수가 없으면 샘플 모드.** `supabase/sample-benefits.json`으로 화면을 그리고 상단에 "개발용 샘플 데이터" 배너를 띄운다. 기록·설문·제보는 콘솔에만 남는다.

### 4.2 데이터 흐름

```
팀원(Supabase 대시보드) ──▶ benefits · categories 테이블
                                   │ select (서버, 'use cache' 5분)
                                   ▼
             features/benefits/data.ts getCatalog() ── zod 검증·기간 상태·인기 점수
                                   │
                                   ▼
              서버 컴포넌트 페이지 ──props──▶ 클라이언트 목록(BenefitExplorer, SearchView …)

localStorage  ◀── lib/local-store.ts ◀── 찜(saved) · 최근 본 항목/검색어(recent) · 방문자 ID · 위치 동의
sessionStorage ◀── feedback/pending.ts ◀── 외부 신청 페이지로 나간 혜택 (이용 여부 팝업용)

Supabase insert ◀── analytics/track.ts ◀── 행동 이벤트
Supabase insert ◀── feedback/api.ts    ◀── 이용 여부 응답 · 오류 제보
```

### 4.3 Supabase 사용 범위

개발 구조 문서는 "검수한 혜택 JSON 관리"였지만, 팀원이 배포 없이 혜택을 고치고 오류 제보를 바로 반영할 수 있도록 **혜택 데이터를 Supabase에 둔다**(팀 결정, 2026-11-24). 로그인과 서버 찜 목록은 만들지 않는다.

- **프로젝트:** `student-benefits` (ref `xalahmhyzmumxctowcdx`, 서울 `ap-northeast-2`, 조직 `jwj`, 무료 요금제). 이 앱 전용이다. 같은 조직의 `jwjjava's Project`는 다른 앱의 DB이므로 건드리지 않는다.
- **로컬 연결:** `.env.local`에 URL과 publishable 키(`sb_publishable_…`)가 있다. 이 파일은 커밋하지 않는다. Vercel에는 같은 두 값을 환경변수로 넣는다.

| 테이블·함수 | 용도 | `anon` 권한 (RLS) |
| --- | --- | --- |
| `categories` | 분야 목록 | `select` |
| `benefits` | 혜택 원본 | `is_published = true`인 행만 `select` |
| `events` | 행동 이벤트 | `insert`만 |
| `survey_responses` | 이용 여부 응답 | `insert`만 |
| `error_reports` | 오류 제보 | `insert`만 |
| `benefit_popularity()` | 인기 점수 (security definer) | `execute` |
| `get_withdrawn_benefit(slug)` | 비공개 혜택 하나를 slug로 조회 (security definer) | `execute` |
| Storage `benefit-images` | 혜택 이미지·로고 (public) | 읽기 |

- **혜택 편집:** 대시보드 Table Editor에서 한다. 새 혜택은 `is_published = false`로 넣고, 검수가 끝나면 `verified_at`을 채우고 `true`로 바꾼다(`verified_at` 없이는 공개할 수 없게 DB 제약이 걸려 있다).
- **이미지:** `benefit-images` 버킷에 올리고 공개 URL을 `image_url`/`logo_url`에 넣는다. `next.config.ts`는 `*.supabase.co`의 공개 Storage 경로만 허용한다. 이미지가 없으면 분야 색 바탕에 제공처 이름이 나온다.
- **키:** 앱은 publishable(anon) 키만 쓴다. service role 키는 앱 코드·`.env.example`·저장소 어디에도 넣지 않는다.
- **타입:** `src/lib/supabase/database.types.ts`는 지금 손으로 맞춘 버전이다. 프로젝트를 연결하면 `supabase gen types`로 다시 생성해 덮어쓴다.
- **스키마 변경:** `supabase/migrations/`의 SQL로만 한다. 대시보드에서는 행만 편집한다.
- **초기 데이터:** `supabase/seed.sql`은 `npm run db:seed`로 만든다. 모두 비공개로 들어간다.
- **개인정보:** 이름·이메일·전화번호 등은 수집하지 않는다. 사용자 구분은 `localStorage`의 랜덤 `visitorId`(UUID)로만 한다. 제보 입력창에도 개인정보를 적지 말라고 안내한다.
- **실패 처리:** 혜택 조회가 실패하면 캐시 재생성이 실패하게 둔다(이전 페이지가 계속 서비스된다). 인기 점수 조회 실패는 0점으로 처리한다. 기록 전송 실패는 무시하고, 설문·제보 실패는 안내만 한다.

### 4.4 폴더 구조

```
.
├─ CLAUDE.md · AGENTS.md
├─ .env.example                       # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ scripts/generate-seed.mjs          # sample-benefits.json → seed.sql
├─ supabase/
│  ├─ migrations/                     # 테이블 + RLS + benefit_popularity() + Storage 버킷
│  ├─ sample-benefits.json            # Figma 시안 예시(검수 전). 샘플 모드 데이터
│  └─ seed.sql                        # 자동 생성. 직접 고치지 않음
└─ src/
   ├─ app/                            # 라우팅·화면 조립만
   │  ├─ layout.tsx                   # 모바일 폭 컨테이너, Pretendard, PageViewTracker
   │  ├─ page.tsx                     # 홈
   │  ├─ search/page.tsx
   │  ├─ benefits/[slug]/page.tsx
   │  ├─ saved/page.tsx · recent/page.tsx
   │  └─ not-found.tsx · globals.css
   ├─ features/
   │  ├─ benefits/
   │  │  ├─ components/               # BenefitExplorer, BenefitCard, BenefitGrid, BenefitThumbnail,
   │  │  │                            # CategoryChips, SortMenu, SearchView, BenefitDetail, ApplyBar,
   │  │  │                            # StoredBenefitList, SampleDataBanner
   │  │  ├─ data.ts                   # getCatalog, getBenefitBySlug (서버 전용, 'use cache')
   │  │  ├─ schema.ts                 # Benefit 타입, DB 행·샘플 JSON zod 스키마
   │  │  ├─ types.ts                  # BenefitView, Catalog, SortKey
   │  │  ├─ period.ts                 # 기간 상태·날짜 표시
   │  │  └─ search.ts                 # 검색·필터·정렬·거리 계산
   │  ├─ saved/                       # 찜: storage.ts, useSavedBenefits.ts, SaveButton, SavedList
   │  ├─ recent/                      # 최근 본 항목·최근 검색어: storage.ts, RecentList, RecordRecentView
   │  ├─ location/                    # 가까운 순 기준 위치: useNearbyOrigin, LocationDialogs
   │  ├─ analytics/                   # events.ts, track.ts, visitor.ts, PageViewTracker
   │  └─ feedback/                    # 이용 여부 팝업·오류 제보: api.ts, pending.ts, components/
   ├─ components/
   │  ├─ ui/                          # Button, Dialog(<dialog>), EmptyState, icons
   │  └─ layout/                      # PageHeader, BackButton, MenuDrawer
   └─ lib/
      ├─ supabase/                    # server.ts (server-only), browser.ts, database.types.ts
      ├─ local-store.ts               # 브라우저 저장소 + useSyncExternalStore
      ├─ env.ts · site.ts · utils.ts
```

**의존 방향:** `app → features → components / lib`. `components/`와 `lib/`는 `features/`를 import하지 않는다. `data.ts`와 `lib/supabase/server.ts`는 `import "server-only"`.

---

## 5. 도메인 용어

UI 문구는 한국어, 코드 식별자는 영어. 화면에서는 **'찜'**, 코드에서는 `saved`/`save`를 쓴다.

| 한국어(UI) | 코드 이름 | 뜻 |
| --- | --- | --- |
| 혜택 | `Benefit` / 화면용 `BenefitView` | 대학생이 받을 수 있는 할인·무료 이용 하나 |
| 분야 | `Category` (`food`, `subscription`, `it`, `beauty`) | 목록 필터 칩 |
| 제공처 | `provider` | 브랜드·매장 이름 |
| 카드 보조 정보 | `cardNote` | 카드 셋째 줄 (예: '매장 방문', '학교 이메일 · 1인 워크스페이스') |
| 이용 대상 | `eligibility` | 누가 받을 수 있는지. 화면에서 ` · `로 잇는다 |
| 이용 방법 | `usageMethod` | 상세 '이용' 행 |
| 기간 | `period` (`startDate`, `endDate`, `isAlwaysOpen`) | 신청·이용 가능 기간 |
| 기간 상태 | `PeriodStatus` (`always`·`upcoming`·`open`·`closingSoon`·`closed`) | 서울 날짜 기준. 마감 임박은 7일 이내 |
| 종료 | `status === "closed"` | 기간이 지난 혜택 (D-02) |
| 출처 | `source` (`name`, `url`) | 정보를 확인한 공식 출처 |
| 신청 링크 | `applyUrl` | 외부 신청·예약·결제 페이지 (E-01) |
| 검수일 | `verifiedAt` | 사람이 마지막으로 확인한 날짜 |
| 매장 위치 | `place` (`name`, `latitude`, `longitude`) | 가까운 순 정렬용 |
| 추천순 / 인기순 / 가까운 순 | `SortKey` (`recommended`·`popular`·`nearby`) | 정렬 |
| 추천 순위 | `recommendRank` | 작을수록 위. 대시보드에서 조정 |
| 인기 점수 | `popularity` | 최근 30일 찜 + 외부 링크 클릭 |
| 찜 / 찜 해제 | `save` / `unsave`, `savedStore` | 하트 토글 (B-01) |
| 최근 본 항목 | `recentViewStore` | 상세를 연 혜택 (최대 30개) |
| 최근 검색어 | `recentSearchStore` | 최대 10개 |
| 방문자 | `visitorId` | 브라우저 단위 익명 ID |
| 이용 여부 팝업 | `UsageSurveyDialog`, `survey_responses` | '혜택을 이용하셨나요?' (E-02, E-03) |
| 기존 인지 여부 | `knew_before` | 이용했다고 답한 사람에게만 묻는다 |
| 오류 제보 | `ErrorReport`, `error_reports` (`period`·`eligibility`·`link`·`other`) | 잘못된 정보 알리기 |
| 샘플 모드 | `Catalog.isSample` | Supabase 미설정 시 예시 데이터 |

### 데이터 규칙

- 찜·최근 본 항목에는 **`id` 배열만** 저장한다. `slug`는 바뀔 수 있으므로 키로 쓰지 않는다.
- 저장된 `id`가 공개 목록에 없으면(삭제·비공개) "더 이상 제공되지 않는 혜택 N개" 안내를 보여 준다. 조용히 지우지 않는다.
- 브라우저 저장소 키는 `benefits:<이름>:v1` 형식. 구조를 바꾸면 버전을 올린다.

### 이벤트 목록

DB `events.name` 체크 제약과 `features/analytics/events.ts`가 같아야 한다. 하나를 바꾸면 둘 다 바꾼다(마이그레이션 추가).

| 이벤트 | 시점 | 함께 기록 |
| --- | --- | --- |
| `page_view` | 경로 바뀔 때 | `path` |
| `benefit_view` | 상세 진입 | `benefit_id` |
| `search` | 검색 확정(엔터·검색어 칩) | `query`(50자), `resultCount` |
| `category_select` / `sort_select` | 분야·정렬 선택 | `category` / `sort` |
| `benefit_save` / `benefit_unsave` | 찜·해제 | `benefit_id`, `from` |
| `outbound_click` | 신청 링크 클릭 | `benefit_id`, `from` |
| `survey_open` / `survey_submit` / `survey_dismiss` | 이용 여부 팝업 | `benefit_id`, `response` |
| `report_submit` | 오류 제보 | `benefit_id`, `kind` |

`from`: `list` · `detail` · `saved` · `recent` · `search`. 모든 이벤트에 `visitor_id`, `created_at`이 붙는다.

---

## 6. 코딩 컨벤션

### TypeScript

- `strict`. `any` 금지(불가피하면 `unknown` 후 좁히기).
- 객체 모양은 `type`. `enum` 대신 문자열 리터럴 유니언과 `as const`.
- 외부 값(DB 결과, 샘플 JSON, 폼 입력, 쿼리 파라미터, 브라우저 저장소)은 zod로 검증한다.
- 경로 별칭 `@/*` → `src/*`. 상대 경로는 같은 feature 안에서만.
- `PageProps<'/경로'>`, `LayoutProps<'/'>`는 Next가 생성하는 전역 타입이다(`npm run typecheck`가 생성).

### React / Next.js 16

- 기본은 서버 컴포넌트. `"use client"`는 필요한 가장 작은 컴포넌트에만.
- 컴포넌트는 함수 선언형 + named export. `app/`의 `page.tsx`·`layout.tsx`·`not-found.tsx`만 default export.
- props 타입은 컴포넌트 바로 위에 `type XxxProps`.
- **캐시:** 서버 데이터 함수는 `'use cache'` + `cacheLife()` + `cacheTag()`를 함수 안에 직접 쓴다. `export const revalidate`·`dynamic`은 쓰지 않는다.
- **동적 라우트:** `generateStaticParams`는 최소 1개를 돌려줘야 한다(없으면 자리표시 값). `params`는 `<Suspense>` 안에서 `await`한다.
- **`useSearchParams`**를 쓰는 컴포넌트는 `<Suspense>`로 감싸고, fallback에는 기본값으로 그린 같은 화면을 넣는다(`BenefitExplorer`, `SearchView` 참고).
- **브라우저 저장소:** `createLocalStore().useValue()`로 읽는다(서버·하이드레이션에서는 fallback). 첫 렌더부터 저장소 값이 꼭 필요한 화면은 `use(browser("이유"))`로 브라우저 전용으로 만들고 `<Suspense>`로 감싼다(`SavedList`, `RecentList`).
- **effect 안에서 `setState`를 바로 부르지 않는다**(ESLint `react-hooks/set-state-in-effect`). 상태는 계산해서 얻고, effect에서는 외부 API 콜백 안에서만 바꾼다(`useNearbyOrigin` 참고).
- **모달**은 `components/ui/Dialog`(네이티브 `<dialog>` + `showModal`)를 쓴다.
- **외부 링크**는 `<a target="_blank" rel="noopener noreferrer">`. 신청 링크 클릭은 `outbound_click` 기록 + `pendingUsageStore` 설정을 함께 한다(`ApplyBar`).
- 혜택을 클라이언트에서 다시 fetch하지 않는다. React Query 같은 데이터 패칭 라이브러리는 쓰지 않는다.

### 디자인 (Figma 디자인 가이드)

| 토큰 (`@theme`) | 값 | 용도 |
| --- | --- | --- |
| `brand` | `#465CF5` | 워드마크·주요 버튼·선택 상태 |
| `accent` | `#3789F5` | 카드의 분야·제공처 줄, 강조 숫자 |
| `like` | `#ED3134` | 찜 활성, 마감 임박 |
| `ink` / `ink-list` / `sub` | `#232632` / `#34373E` / `#626B7B` | 기본·목록·보조 텍스트 |
| `canvas` / `surface` / `field` | `#F7F8FB` / `#FFFFFF` / `#E9EBF2` | 화면 배경 / 팝업 / 검색 필드·구분선·썸네일 |

- 글꼴 Pretendard. 제목 자간 `tracking-title`(-1%), 본문 0%.
- 크기: 로고 24 Bold · 상세 제목 20 ExtraBold · 화면 제목 17 Bold · 카드 제목 16 Bold · 주요 버튼 15 Bold · 본문 14 · 필터 13 · 카드 분야·보조 12.
- 레이아웃은 최대 폭 430px 모바일 컬럼, 좌우 여백 20~24px, 카드 2열, 모서리 16px(카드)·12px(버튼·필드)·24px(팝업).
- 다크 모드는 범위 밖이다.

### 이름 규칙

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 컴포넌트 파일·이름 | PascalCase | `BenefitCard.tsx` |
| 훅 | `use` + camelCase | `useSavedBenefits.ts` |
| 그 밖의 파일 | kebab/camel 소문자 | `track.ts`, `local-store.ts` |
| 라우트 폴더 | kebab-case | `app/benefits/[slug]` |
| 상수 | UPPER_SNAKE_CASE | `SAVED_STORAGE_KEY` |
| 이벤트 이름·DB 컬럼 | snake_case | `outbound_click`, `benefit_id` |
| 불리언 | `is`/`has`/`show` 접두사 | `isSample`, `isAlwaysOpen` |

### 접근성·문구

- 아이콘 버튼에는 `aria-label`. 찜 버튼은 `aria-pressed`, 정렬 메뉴는 `menuitemradio`, 분야 칩은 `aria-pressed`.
- UI 문구는 짧은 해요체("찜하기", "혜택 신청 페이지 열기", "아직 저장한 혜택이 없어요").
- 날짜는 `YYYY.MM.DD`, 마감 7일 이내면 `D-n`(당일은 '오늘 마감').

### 혜택 데이터 관리

- `benefits`에는 **사람이 검수한 데이터만** 공개한다. Claude도 혜택 내용을 지어내 seed나 DB에 넣지 않는다.
- `supabase/sample-benefits.json`은 Figma 시안 예시를 옮긴 것으로, 일부 링크는 `example.com` 자리표시다. 실제 공개 전에 팀이 검수해 대시보드에서 고친다.
- 정보를 고치면 `verified_at`을 갱신한다. 형식이 잘못된 행은 목록에서 빠지고 서버 로그에 남는다.

### 테스트·검증

- 순수 함수(`period.ts`, `search.ts`, 저장소 헬퍼)는 같은 폴더에 `*.test.ts`로 Vitest 테스트를 둔다.
- 커밋 전에 `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`를 통과시킨다.
- UI 변경은 375px 폭에서 실제로 확인한다.

### Git

- 브랜치: `feat/…`, `fix/…`, `chore/…`, `docs/…`
- 커밋 메시지: `type: 요약` (Conventional Commits, 요약은 한국어 가능)
- `.env*`(`.env.example` 제외)는 커밋하지 않는다.

---

## 7. 작업할 때 기억할 것

- 이 서비스의 목적은 **가설 검증**이다. 새 기능은 성공 기준 측정에 도움이 되는지 먼저 따진다.
- 범위 밖 기능(로그인, 서버 찜 목록, 푸시, 후기 등)은 요청받아도 바로 만들지 말고 범위 변경인지 확인한다.
- 찜·외부 링크·팝업 관련 UI를 만들 때는 이벤트 기록을 같이 구현한다.
