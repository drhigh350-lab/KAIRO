-- KAIRO Arena: one server-created Daily Arena rotation per UTC day.
-- Each rotation contains ten live official-bank questions across Biology,
-- Chemistry, Physics, and Mathematics.
create or replace function kairo.get_or_create_daily_arena()
returns kairo.challenges
language plpgsql
security definer
set search_path = kairo, pg_temp
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_id text := 'daily_arena_' || to_char(v_day, 'YYYYMMDD');
  v_challenge kairo.challenges;
  v_ids text[];
begin
  select * into v_challenge from kairo.challenges where id = v_id;
  if v_challenge.id is not null then return v_challenge; end if;

  with selected as (
    select id
    from kairo.questions
    where lifecycle_state = 'live'
      and subject in ('Biology', 'Chemistry', 'Physics', 'Mathematics')
    order by random()
    limit 10
  )
  select array_agg(id order by random()) into v_ids from selected;

  if coalesce(array_length(v_ids, 1), 0) < 10 then
    raise exception 'not enough live questions to build the Daily Arena';
  end if;

  insert into kairo.challenges (
    id, type, title, theme, question_ids, community_question_ids, scoring_formula,
    starts_at, ends_at, late_join_allowed, leaderboard_visible, status, created_by,
    visibility, is_official, description, subject, topics, difficulty, one_attempt_only
  ) values (
    v_id, 'daily', 'KAIRO Daily Arena', 'Daily Arena', v_ids, '{}', 'hybrid',
    v_day at time zone 'utc', (v_day + 1) at time zone 'utc', true, true, 'live', null,
    'public', true, 'Ten questions refreshed daily from the KAIRO question bank.',
    null, '{}', 'mixed', true
  ) on conflict (id) do nothing;

  select * into v_challenge from kairo.challenges where id = v_id;
  return v_challenge;
end;
$$;

grant execute on function kairo.get_or_create_daily_arena() to anon, authenticated;

update kairo.challenges
set description = 'Ten questions refreshed daily from the KAIRO question bank.'
where id = 'daily_arena_' || to_char((now() at time zone 'utc')::date, 'YYYYMMDD');
