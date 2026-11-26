-- 공개했다가 내린 혜택(검수 완료 + 비공개)을 slug로 하나만 돌려준다.
-- 공유 링크로 들어온 사용자에게 404 대신 '종료된 혜택'으로 상세를 보여 주기 위해 쓴다.
-- 검수 전 초안(verified_at 없음)은 돌려주지 않는다. 목록처럼 여러 건을 훑는 방법도 열지 않는다.
create function public.get_withdrawn_benefit(p_slug text)
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
    and b.verified_at is not null
  limit 1;
$$;

revoke execute on function public.get_withdrawn_benefit(text) from public;
grant execute on function public.get_withdrawn_benefit(text) to anon, authenticated;
