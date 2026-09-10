-- KAIRO Arena: two JAMB-valid Daily Arena rotations per UTC day.
-- Medical: English 4, Biology 2, Chemistry 2, Physics 2.
-- Engineering: English 4, Mathematics 2, Chemistry 2, Physics 2.
create or replace function kairo.get_or_create_daily_arena(p_track text)
returns kairo.challenges
language plpgsql
security definer
set search_path = kairo, pg_temp
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_track text := lower(trim(p_track));
  v_id text;
  v_title text;
  v_theme text;
  v_description text;
  v_ids text[];
  v_challenge kairo.challenges;
begin
  if v_track not in ('medical', 'engineering') then
    raise exception 'Daily Arena track must be medical or engineering';
  end if;
  v_id := 'daily_arena_' || v_track || '_' || to_char(v_day, 'YYYYMMDD');
  v_title := case when v_track = 'medical' then 'KAIRO Daily Arena — Medical' else 'KAIRO Daily Arena — Engineering' end;
  v_theme := case when v_track = 'medical' then 'Medical Combination' else 'Engineering Combination' end;
  v_description := case when v_track = 'medical'
    then 'JAMB Medical combination: English 4, Biology 2, Chemistry 2, Physics 2.'
    else 'JAMB Engineering combination: English 4, Mathematics 2, Chemistry 2, Physics 2.' end;

  select * into v_challenge from kairo.challenges where id = v_id;
  if v_challenge.id is not null then return v_challenge; end if;

  with selected as (
    select id from (select id from kairo.questions where lifecycle_state = 'live' and subject = 'Use of English' order by random() limit 4) english
    union all select id from (select id from kairo.questions where lifecycle_state = 'live' and subject = case when v_track = 'medical' then 'Biology' else 'Mathematics' end order by random() limit 2) core
    union all select id from (select id from kairo.questions where lifecycle_state = 'live' and subject = 'Chemistry' order by random() limit 2) chemistry
    union all select id from (select id from kairo.questions where lifecycle_state = 'live' and subject = 'Physics' order by random() limit 2) physics
  )
  select array_agg(id order by random()) into v_ids from selected;

  if coalesce(array_length(v_ids, 1), 0) < 10 then
    raise exception 'not enough live questions for the % Daily Arena', v_track;
  end if;

  insert into kairo.challenges (
    id, type, title, theme, question_ids, community_question_ids, scoring_formula,
    starts_at, ends_at, late_join_allowed, leaderboard_visible, status, created_by,
    visibility, is_official, description, subject, topics, difficulty, one_attempt_only
  ) values (
    v_id, 'daily', v_title, v_theme, v_ids, '{}', 'hybrid',
    v_day at time zone 'utc', (v_day + 1) at time zone 'utc', true, true, 'live', null,
    'public', true, v_description, v_track,
    case when v_track = 'medical'
      then array['Use of English', 'Biology', 'Chemistry', 'Physics']
      else array['Use of English', 'Mathematics', 'Chemistry', 'Physics'] end,
    'mixed', true
  ) on conflict (id) do nothing;

  select * into v_challenge from kairo.challenges where id = v_id;
  return v_challenge;
end;
$$;

create or replace function kairo.get_or_create_daily_arena()
returns kairo.challenges
language sql
security definer
set search_path = kairo, pg_temp
as $$ select kairo.get_or_create_daily_arena('medical'); $$;

grant execute on function kairo.get_or_create_daily_arena(text) to anon, authenticated;
grant execute on function kairo.get_or_create_daily_arena() to anon, authenticated;

-- Preserve historical attempts while removing the former mixed daily challenges.
update kairo.challenges
set status = 'archived', ends_at = least(ends_at, now()), updated_at = now()
where type = 'daily' and status = 'live';

select kairo.get_or_create_daily_arena('medical');
select kairo.get_or_create_daily_arena('engineering');
