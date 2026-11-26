# AI 혜택 후보 수집 사용법

OpenAI 웹 검색으로 **공식 출처**에서 대학생 혜택 후보를 찾고, 사람이 검수한 것만 Supabase에 **비공개**로 넣는 도구다. 사이트 화면에는 아무것도 추가되지 않는다. 팀원이 자기 컴퓨터 터미널에서 실행한다.

```
benefits:discover ──▶ 검수용 JSON ──(사람이 원문 확인, reviewed: true)──▶ benefits:sql ──▶ 등록 SQL
                                                                                   │
                       Table Editor에서 verified_at·is_published 설정 ◀── SQL Editor에서 실행 (비공개 행)
```

> **AI 결과는 후보일 뿐이다.** 원문을 직접 확인하지 않은 항목은 `reviewed: true`로 바꾸지 않는다. 비공개 혜택도 slug를 알면 상세 주소에서 '종료된 혜택'으로 보이므로, 검수 전 내용이 DB에 들어가면 외부에 노출될 수 있다.

---

## 0. 준비

1. 프로젝트를 최신으로 받고 의존성을 설치한다.

   ```powershell
   git pull
   npm install
   ```

2. OpenAI API 키를 준비한다(OpenAI 플랫폼에서 발급. 호출한 만큼 요금이 나간다).
3. **키는 파일에 저장하지 않는다.** 실행할 터미널 창에서만 설정한다. 창을 닫으면 사라진다.

   ```powershell
   $env:OPENAI_API_KEY = "sk-..."
   # 선택: 웹 검색을 지원하는 다른 모델 (기본값 gpt-5-mini)
   $env:OPENAI_MODEL = "gpt-5-mini"
   ```

4. 결과 파일을 모을 폴더를 만든다. `review/`는 `.gitignore`에 들어 있어 커밋되지 않는다.

   ```powershell
   New-Item -ItemType Directory -Force review
   ```

---

## 1. 후보 찾기: `benefits:discover`

```powershell
npm run benefits:discover -- --topic "한국 대학생 개발 도구" --domains "jetbrains.com,github.com" --limit 5 --output "review/dev-tools.json"
```

| 옵션 | 필수 | 설명 |
| --- | --- | --- |
| `--topic` | ✓ | 찾을 주제 (1~500자). 분야·대상을 구체적으로 적을수록 좋다. 예: `"대학생 음악 스트리밍 구독 할인"` |
| `--domains` | ✓ | 검색을 허용할 **공식 도메인**, 쉼표로 구분 (최대 100개). 하위 도메인도 포함된다(`github.com` → `education.github.com`). 제공처·학교 공식 사이트만 넣는다. 블로그·커뮤니티·쿠폰 사이트는 넣지 않는다. |
| `--limit` |  | 최대 후보 수, 1~10 (기본 5) |
| `--output` | ✓ | 저장할 JSON 경로. **이미 있는 파일이면 덮어쓰지 않고 멈춘다.** 폴더는 미리 있어야 한다. |

`--help`를 붙이면 사용법이 나온다: `npm run benefits:discover -- --help`

### 자동으로 걸러지는 것

다음 후보는 AI가 내놓아도 파일에 남지 않는다.

- 출처 링크(`source_url`)나 신청 링크(`apply_url`)가 `--domains` 밖에 있는 후보
- 두 링크 중 하나라도 **실제 검색 결과에 나오지 않은** 후보 (AI가 지어낸 링크 차단)
- 오늘(서울 기준) 이미 끝났거나 아직 시작하지 않은 혜택, 기간이 애매한 혜택
- 같은 slug, 또는 같은 제공처·제목인 중복 후보
- 형식이 맞지 않는 후보 (https가 아닌 링크, 잘못된 날짜, 너무 긴 문구 등)

후보가 0건이어도 정상이다. 주제를 바꾸거나 도메인을 늘려 다시 실행한다.

### 결과 파일 모양

```json
{
  "topic": "한국 대학생 개발 도구",
  "searched_on": "2026-11-26",
  "allowed_domains": ["jetbrains.com", "github.com"],
  "candidates": [
    {
      "slug": "provider-student-discount",
      "title": "학생 무료 이용",
      "provider": "제공처 이름",
      "category_id": "it",
      "card_note": "학교 이메일 인증",
      "eligibility": ["재학 중인 대학생"],
      "usage_method": "공식 페이지에서 학교 이메일로 신청",
      "start_date": null,
      "end_date": null,
      "is_always_open": true,
      "apply_url": "https://...",
      "source_name": "제공처 학생 혜택 안내",
      "source_url": "https://...",
      "evidence": "AI가 정리한 근거 요약",
      "reviewed": false
    }
  ]
}
```

---

## 2. 사람이 검수하기 (가장 중요)

JSON을 에디터로 열고 후보마다 아래를 확인한다.

1. **`source_url`과 `apply_url`을 브라우저에서 직접 연다.** 링크가 살아 있는지, 정말 공식 페이지인지 본다.
2. **원문과 값을 하나씩 대조한다.** `evidence`는 AI가 쓴 요약이라 근거로 삼지 않는다.

   | 필드 | 확인할 것 |
   | --- | --- |
   | `title`, `provider` | 화면에 나갈 이름. 짧은 해요체 문구 기준에 맞게 다듬는다. |
   | `category_id` | `food` · `subscription` · `it` · `beauty` 중 하나 |
   | `eligibility` | 누가 받을 수 있는지. 한국 대학생이 실제로 받을 수 있는지 꼭 본다. |
   | `start_date`, `end_date`, `is_always_open` | `YYYY-MM-DD`. 상시면 `is_always_open: true`이고 두 날짜는 `null` |
   | `usage_method`, `card_note` | 상세 '이용' 행과 카드 셋째 줄 문구 |
   | `slug` | 영문 소문자·숫자·하이픈. 공개 후에는 바꾸지 않는 게 좋다(공유 링크). |

3. **사이트에 이미 있는 혜택과 겹치는지** Table Editor에서 확인한다.
4. 틀린 값은 JSON에서 바로 고친다.
5. 확인이 끝난 항목만 `"reviewed": false` → **`"reviewed": true`**. 확인 못 한 항목은 `false`로 두면 SQL에 들어가지 않는다.

---

## 3. 등록 SQL 만들기: `benefits:sql`

```powershell
npm run benefits:sql -- --input "review/dev-tools.json" --output "review/dev-tools.sql"
```

- `reviewed: true`인 후보만 SQL에 들어간다. 하나도 없으면 멈춘다.
- 검수하는 사이 기간이 끝난 항목이 있으면 SQL을 만들지 않고 멈춘다. 그 항목을 `false`로 돌리거나 지우고 다시 실행한다.
- 출력 파일이 이미 있으면 멈춘다. 다른 이름을 쓴다.

---

## 4. Supabase에 넣기

1. Supabase 대시보드 → `student-benefits` 프로젝트 → **SQL Editor**
2. 만든 `.sql` 파일 내용을 붙여 넣고 **Run**
3. 들어가는 행은 모두 `is_published = false`, `verified_at = null`이다.
4. 같은 slug나 같은 제공처·제목이 이미 DB에 있으면 그 항목은 건너뛴다(기존 행을 덮어쓰지 않는다). 여러 번 실행해도 안전하다.

> SQL Editor에서는 이 등록 SQL만 실행한다. 테이블 구조 변경은 `supabase/migrations/`로만 한다.

---

## 5. 다듬고 공개하기

**Table Editor → `benefits`** 에서 새 행을 연다.

1. 필요하면 이미지(`image_url`)·로고(`logo_url`)를 `benefit-images` 버킷에 올리고 공개 URL을 넣는다.
2. 매장 혜택이면 `place_name`, `latitude`, `longitude`를 넣는다(가까운 순 정렬용).
3. `recommend_rank`로 목록 순서를 조정한다(작을수록 위).
4. 마지막으로 원문을 한 번 더 확인하고 **`verified_at`에 오늘 날짜** → **`is_published`를 `true`**.

최대 5분 안에 사이트 목록에 나타난다. 공개하지 않을 후보는 행을 지우거나 비공개로 둔다.

---

## 문제 해결

| 메시지 | 해결 |
| --- | --- |
| `터미널의 OPENAI_API_KEY 환경 변수를 설정하세요.` | 0단계 3번을 같은 터미널 창에서 다시 실행 |
| `--domains에 공식 도메인을 쉼표로 구분해 지정하세요.` | `https://`나 경로 없이 도메인만 쓴다. 예: `github.com,jetbrains.com` |
| `출력 파일이 이미 있습니다.` | `--output`에 새 파일 이름 지정 |
| `ENOENT: no such file or directory` | `--input` 경로 확인, 또는 `--output` 폴더(`review/`)를 먼저 만든다 |
| `OpenAI API 요청 실패 (HTTP 401)` | 키가 틀렸거나 만료됨 |
| `OpenAI API 요청 실패 (HTTP 429)` | 사용량 한도·요금 확인 후 잠시 뒤 재시도 |
| `OpenAI 응답이 완료되지 않았습니다.` / `완료된 검색 결과가 없습니다.` | 주제를 좁히거나 `--limit`을 줄여 다시 실행 |
| `검수 완료(reviewed: true)로 표시된 후보가 없습니다.` | 2단계에서 확인한 항목을 `true`로 바꾼다 |

## 지켜야 할 것

- API 키, Supabase service role 키는 파일·커밋·채팅에 남기지 않는다.
- 결과 파일은 `review/` 폴더에 둔다. 다른 곳에 저장했다면 커밋에 섞이지 않았는지 확인한다.
- 처음 쓸 때는 `--limit 1`로 작게 시험한다.
- 스크립트가 DB에 직접 쓰거나 자동으로 공개하도록 바꾸지 않는다(이번 MVP 범위 밖).
