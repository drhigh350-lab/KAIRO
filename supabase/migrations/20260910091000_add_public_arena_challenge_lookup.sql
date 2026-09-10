-- Public share links need one challenge lookup without exposing the full Arena list.
create or replace function kairo.get_public_challenge(p_challenge_id text)
returns kairo.challenges
language sql
stable
security definer
set search_path = kairo, pg_temp
as $$
  select c
  from kairo.challenges c
  where c.id = p_challenge_id
    and c.status <> 'archived'
  limit 1;
$$;

grant execute on function kairo.get_public_challenge(text) to anon, authenticated;
