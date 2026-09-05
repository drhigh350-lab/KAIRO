-- Lifecycle email idempotency and actionable summary candidates.
create table if not exists kairo.email_log (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references kairo.students(id) on delete cascade,
  category text not null,
  dedupe_key text not null,
  sent_at timestamptz not null default now(),
  unique (student_id, category, dedupe_key)
);

alter table kairo.email_log enable row level security;

create or replace function kairo.get_welcome_email_candidates()
returns table(student_id uuid, name text, email text, dedupe_key text)
language sql security definer set search_path to kairo, pg_temp
as $function$
  select s.id, s.name, s.email, coalesce(s.registration_date::text, current_date::text)
  from kairo.students s
  where s.email is not null
    and s.registration_date >= current_date - interval '1 day'
    and not exists (select 1 from kairo.email_log l where l.student_id = s.id and l.category = 'welcome');
$function$;

create or replace function kairo.get_weekly_summary_candidates()
returns table(student_id uuid, name text, email text, sessions_count bigint, questions_count bigint, accuracy numeric, focus_topic text, dedupe_key text)
language sql security definer set search_path to kairo, pg_temp
as $function$
  with activity as (
    select s.id as student_id,
      count(distinct se.id) as sessions_count,
      count(a.id) as questions_count,
      coalesce(round(avg(case when a.correct then 100 else 0 end), 0), 0) as accuracy
    from kairo.students s
    left join kairo.sessions se on se.student_id = s.id and se.completed_at >= now() - interval '7 days'
    left join kairo.attempts a on a.student_id = s.id and a.answered_at >= now() - interval '7 days'
    group by s.id
  ), focus as (
    select distinct on (cs.student_id) cs.student_id, c.name
    from kairo.concept_states cs join kairo.concepts c on c.id = cs.concept_id
    where cs.retention_state in ('fading', 'forming')
    order by cs.student_id, cs.decay_estimate asc nulls first
  )
  select s.id, s.name, s.email, a.sessions_count, a.questions_count, a.accuracy, f.name,
    to_char(current_date, 'IYYY-IW')
  from kairo.students s join activity a on a.student_id = s.id left join focus f on f.student_id = s.id
  where s.email is not null and a.questions_count > 0
    and coalesce((s.comms -> 'consent' -> 'channelPermissions' ->> 'email')::boolean, false)
    and coalesce((s.comms -> 'consent' -> 'categoryPreferences' -> 'email' ->> 'academic_nudge')::boolean, true)
    and not exists (select 1 from kairo.email_log l where l.student_id = s.id and l.category = 'weekly_summary' and l.dedupe_key = to_char(current_date, 'IYYY-IW'));
$function$;

create or replace function kairo.get_monthly_summary_candidates()
returns table(student_id uuid, name text, email text, sessions_count bigint, questions_count bigint, accuracy numeric, focus_topic text, dedupe_key text)
language sql security definer set search_path to kairo, pg_temp
as $function$
  with activity as (
    select s.id as student_id, count(distinct se.id) as sessions_count, count(a.id) as questions_count,
      coalesce(round(avg(case when a.correct then 100 else 0 end), 0), 0) as accuracy
    from kairo.students s
    left join kairo.sessions se on se.student_id = s.id and se.completed_at >= now() - interval '30 days'
    left join kairo.attempts a on a.student_id = s.id and a.answered_at >= now() - interval '30 days'
    group by s.id
  ), focus as (
    select distinct on (cs.student_id) cs.student_id, c.name
    from kairo.concept_states cs join kairo.concepts c on c.id = cs.concept_id
    where cs.retention_state in ('fading', 'forming')
    order by cs.student_id, cs.decay_estimate asc nulls first
  )
  select s.id, s.name, s.email, a.sessions_count, a.questions_count, a.accuracy, f.name, to_char(current_date, 'YYYY-MM')
  from kairo.students s join activity a on a.student_id = s.id left join focus f on f.student_id = s.id
  where s.email is not null and a.questions_count > 0
    and coalesce((s.comms -> 'consent' -> 'channelPermissions' ->> 'email')::boolean, false)
    and coalesce((s.comms -> 'consent' -> 'categoryPreferences' -> 'email' ->> 'academic_nudge')::boolean, true)
    and not exists (select 1 from kairo.email_log l where l.student_id = s.id and l.category = 'monthly_summary' and l.dedupe_key = to_char(current_date, 'YYYY-MM'));
$function$;

revoke all on function kairo.get_welcome_email_candidates() from public;
revoke all on function kairo.get_weekly_summary_candidates() from public;
revoke all on function kairo.get_monthly_summary_candidates() from public;
grant execute on function kairo.get_welcome_email_candidates() to service_role;
grant execute on function kairo.get_weekly_summary_candidates() to service_role;
grant execute on function kairo.get_monthly_summary_candidates() to service_role;
