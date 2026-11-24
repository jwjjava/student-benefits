-- 대학생 혜택 모음 초기 스키마
-- 혜택 원본(categories, benefits)과 익명 수집 테이블(events, survey_responses, error_reports)

-- ───────────────────────── 분야 ─────────────────────────
create table public.categories (
  id text primary key,                       -- 'food', 'subscription', 'it', 'beauty'
  name text not null,                        -- 화면에 보이는 이름
  sort_order int not null default 100
);

-- ───────────────────────── 혜택 ─────────────────────────
create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  provider text not null,                    -- 제공처(브랜드·매장명)
  category_id text not null references public.categories (id),
  card_note text not null default '',        -- 카드 보조 정보 (예: '매장 방문')
  eligibility text[] not null default '{}',  -- 이용 대상
  usage_method text not null default '',     -- 이용 방법
  start_date date,
  end_date date,
  is_always_open boolean not null default false,
  apply_url text not null check (apply_url ~ '^https?://'),
  source_name text not null,
  source_url text not null check (source_url ~ '^https?://'),
  logo_url text,
  image_url text,
  place_name text,                           -- 오프라인 매장 이름(가까운 순 정렬용)
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  tags text[] not null default '{}',
  recommend_rank int not null default 100,   -- 추천순 정렬 (작을수록 위)
  is_published boolean not null default false,
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint benefits_period_check check (
    is_always_open or start_date is not null or end_date is not null
  ),
  constraint benefits_location_check check (
    (latitude is null) = (longitude is null)
  ),
  constraint benefits_published_verified check (
    not is_published or verified_at is not null
  )
);

create index benefits_published_idx on public.benefits (is_published, recommend_rank);
create index benefits_category_idx on public.benefits (category_id);

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger benefits_set_updated_at
before update on public.benefits
for each row execute function public.set_updated_at();

-- ───────────────────────── 행동 이벤트 ─────────────────────────
create table public.events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  name text not null check (name in (
    'page_view', 'benefit_view', 'search', 'category_select', 'sort_select',
    'benefit_save', 'benefit_unsave', 'outbound_click',
    'survey_open', 'survey_submit', 'survey_dismiss', 'report_submit'
  )),
  benefit_id uuid references public.benefits (id) on delete set null,
  path text check (char_length(path) <= 300),
  props jsonb not null default '{}' check (pg_column_size(props) <= 2000),
  created_at timestamptz not null default now()
);

create index events_name_created_idx on public.events (name, created_at);
create index events_benefit_idx on public.events (benefit_id);

-- ───────────────────────── 이용 결과 설문 ─────────────────────────
create table public.survey_responses (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  benefit_id uuid not null references public.benefits (id) on delete cascade,
  response text not null check (response in ('used', 'not_yet')),
  knew_before boolean,                       -- 원래 알고 있던 혜택인지 (used일 때만)
  created_at timestamptz not null default now()
);

create index survey_responses_benefit_idx on public.survey_responses (benefit_id);

-- ───────────────────────── 오류 제보 ─────────────────────────
create table public.error_reports (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  benefit_id uuid not null references public.benefits (id) on delete cascade,
  kind text not null check (kind in ('period', 'eligibility', 'link', 'other')),
  message text not null default '' check (char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

create index error_reports_benefit_idx on public.error_reports (benefit_id);

-- ───────────────────────── RLS ─────────────────────────
alter table public.categories enable row level security;
alter table public.benefits enable row level security;
alter table public.events enable row level security;
alter table public.survey_responses enable row level security;
alter table public.error_reports enable row level security;

create policy "누구나 분야를 읽을 수 있음"
  on public.categories for select to anon, authenticated
  using (true);

create policy "공개된 혜택만 읽을 수 있음"
  on public.benefits for select to anon, authenticated
  using (is_published);

create policy "익명 이벤트 기록"
  on public.events for insert to anon, authenticated
  with check (true);

create policy "익명 설문 응답"
  on public.survey_responses for insert to anon, authenticated
  with check (
    knew_before is null or response = 'used'
  );

create policy "익명 오류 제보"
  on public.error_reports for insert to anon, authenticated
  with check (true);

-- 수집 테이블은 insert만 허용 (select·update·delete 정책 없음)
revoke select, update, delete on public.events, public.survey_responses, public.error_reports from anon, authenticated;

-- ───────────────────────── 인기순 집계 ─────────────────────────
-- 최근 30일 저장·외부 링크 클릭 수. events를 직접 읽지 못하게 하고 집계 결과만 노출한다.
create function public.benefit_popularity()
returns table (benefit_id uuid, score bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select e.benefit_id, count(*)::bigint as score
  from public.events e
  join public.benefits b on b.id = e.benefit_id and b.is_published
  where e.name in ('benefit_save', 'outbound_click')
    and e.created_at > now() - interval '30 days'
  group by e.benefit_id;
$$;

revoke execute on function public.benefit_popularity() from public;
grant execute on function public.benefit_popularity() to anon, authenticated;

-- ───────────────────────── 이미지 저장소 ─────────────────────────
insert into storage.buckets (id, name, public)
values ('benefit-images', 'benefit-images', true)
on conflict (id) do nothing;
