-- KAIRO Arena: one server-created Daily Arena rotation per UTC day.
-- Each rotation contains 10 live official-bank questions: 2 with diagrams and 8 without.
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

  with diagrams as (
    select id, 1 as bucket
    from kairo.questions
    where lifecycle_state = 'live' and image_url is not null and btrim(image_url) <> ''
    order by random() limit 2
  ), standard as (
    select id, 2 as bucket
    from kairo.questions
    where lifecycle_state = 'live' and (image_url is null or btrim(image_url) = '')
    order by random() limit 8
  ), selected as (
    select * from diagrams union all select * from standard
  )
  select array_agg(id order by bucket, random()) into v_ids from selected;

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
    'public', true, 'Ten questions every day — including two diagram questions from the KAIRO bank.',
    null, '{}', 'mixed', true
  ) on conflict (id) do nothing;

  select * into v_challenge from kairo.challenges where id = v_id;
  return v_challenge;
end;
$$;

grant execute on function kairo.get_or_create_daily_arena() to anon, authenticated;
