# 학생혜택 · 대학생 혜택 모음

흩어진 대학생 혜택을 한곳에서 찾고, 조건을 확인하고, 찜해 두었다가 다시 꺼내 보는 웹서비스입니다. 수요 검증용 MVP라서 사용자 행동을 측정하는 것을 우선으로 합니다.

- 프로덕션: https://student-benefits-ten.vercel.app
- 기술 스택: Next.js 16.4 · React 19.3 · TypeScript · Tailwind CSS 4 · Supabase
- 코드 규칙·폴더 구조·도메인 용어: [CLAUDE.md](CLAUDE.md) (작업 전에 꼭 읽어 주세요)

## 시작하기

Node.js 20.9 이상과 npm이 필요합니다.

```powershell
git clone https://github.com/jwjjava/student-benefits.git
cd student-benefits
npm install
Copy-Item .env.example .env.local   # macOS·Linux: cp .env.example .env.local
npm run dev
```

http://localhost:3000 을 엽니다.

### 환경변수 (`.env.local`)

| 이름 | 값 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.example`에 이미 들어 있음 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable 키 `sb_publishable_…`. 팀 채팅에서 받거나 Supabase 대시보드 > Project Settings > API Keys에서 복사 |

- 키가 없으면 **샘플 모드**로 동작합니다. `supabase/sample-benefits.json`으로 화면을 그리고 상단에 "개발용 샘플 데이터" 배너가 뜹니다. 기록·설문·제보는 콘솔에만 남습니다. UI 작업만 한다면 키 없이도 됩니다.
- 키를 넣고 로컬에서 테스트하면 기록이 **실제 DB에 쌓입니다.** 테스트한 내용은 팀에 알려 주세요.
- `.env.local`은 커밋하지 않습니다. service role(secret) 키와 DB 비밀번호는 어디에도 공유하거나 넣지 않습니다.

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 라우트 타입 생성 후 타입 검사 |
| `npm test` | Vitest 단위 테스트 |
| `npm run db:seed` | `supabase/sample-benefits.json` → `supabase/seed.sql` 생성 |

커밋 전에 `lint`, `typecheck`, `test`, `build`를 통과시켜 주세요.

## 혜택 데이터 관리

혜택은 Supabase 대시보드의 Table Editor에서 직접 편집합니다. 관리자 화면은 따로 없습니다.

1. 새 혜택은 `benefits` 테이블에 `is_published = false`로 넣습니다.
2. 공식 출처에서 내용을 확인한 뒤 `verified_at`을 채우고 `is_published`를 `true`로 바꿉니다. `verified_at`이 비어 있으면 공개할 수 없습니다.
3. 이미지는 Storage `benefit-images` 버킷에 올리고 공개 URL을 `image_url`/`logo_url`에 넣습니다.

수정 내용은 배포 없이 최대 5분 안에 사이트에 반영됩니다. 테이블 구조를 바꿀 때는 대시보드가 아니라 `supabase/migrations/`에 SQL 파일을 추가합니다. 대시보드 권한이 필요하면 Supabase 조직 멤버 초대를 요청하세요.

## 배포

`main`에 푸시하면 Vercel이 프로덕션에 자동 배포하고, 다른 브랜치는 프리뷰로 배포합니다. 환경변수는 Vercel 프로젝트 설정에 들어 있습니다.

## 폴더

```
src/app/        라우팅·화면 조립
src/features/   기능별 코드 (benefits, saved, recent, location, analytics, feedback)
src/components/ 공용 UI·레이아웃
src/lib/        Supabase 클라이언트, 브라우저 저장소 등
supabase/       마이그레이션, 샘플 데이터, seed
mobile/         React Native(Expo) UI 시안. 웹과 별도로 실행 (mobile/README.md)
```

자세한 구조와 규칙은 [CLAUDE.md](CLAUDE.md)에 있습니다.
