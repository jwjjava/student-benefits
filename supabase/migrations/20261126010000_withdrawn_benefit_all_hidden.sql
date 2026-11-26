-- 비공개 혜택은 검수 여부와 관계없이 모두 상세 링크에서 '종료된 혜택'으로 보여 준다(팀 결정, 2026-11-26).
-- 이전에는 검수 완료(verified_at 있음)만 돌려줬다. 여전히 slug 하나로 한 건만 조회할 수 있고 목록은 열지 않는다.
create or replace function public.get_withdrawn_benefit(p_slug text)
returns setof public.benefits
language sql
stable
security definer
set search_path = ''
as $$
  select b.*
  from public.benefits b
  where b.slug = p_slug
    and not b.is_published
  limit 1;
$$;
