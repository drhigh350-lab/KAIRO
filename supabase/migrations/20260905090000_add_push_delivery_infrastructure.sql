-- KAIRO Web Push delivery infrastructure.
-- The browser stores subscriptions, but delivery must happen server-side with
-- the VAPID private key; clients must never receive that key.
create table if not exists kairo.push_delivery_log (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references kairo.students(id) on delete cascade,
  subscription_id uuid not null references kairo.push_subscriptions(id) on delete cascade,
  category text not null,
  dedupe_key text not null,
  sent_at timestamptz not null default now(),
  unique (subscription_id, category, dedupe_key)
);

alter table kairo.push_delivery_log enable row level security;

create or replace function kairo.get_push_review_candidates()
returns table(
  student_id uuid,
  name text,
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  concept_name text,
  dedupe_key text
)
language sql security definer
set search_path to kairo, pg_temp
as $function$
  with due as (
    select distinct on (cs.student_id)
      cs.student_id,
      c.name as concept_name
    from kairo.concept_states cs
    join kairo.concepts c on c.id = cs.concept_id
    where cs.next_review_estimate is not null
      and cs.next_review_estimate <= now()
      and cs.retention_state in ('held', 'reinforced', 'fading')
    order by cs.student_id, cs.next_review_estimate asc
  )
  select s.id, s.name, p.id, p.endpoint, p.p256dh, p.auth,
         d.concept_name, to_char(current_date, 'YYYY-MM-DD')
  from due d
  join kairo.students s on s.id = d.student_id
  join kairo.push_subscriptions p on p.student_id = s.id
  where coalesce((s.comms -> 'consent' -> 'channelPermissions' ->> 'push')::boolean, false)
    and coalesce((s.comms -> 'consent' -> 'categoryPreferences' -> 'push' ->> 'academic_nudge')::boolean, true)
    and not exists (
      select 1 from kairo.push_delivery_log l
      where l.subscription_id = p.id
        and l.category = 'spaced_review'
        and l.dedupe_key = to_char(current_date, 'YYYY-MM-DD')
    );
$function$;

revoke all on function kairo.get_push_review_candidates() from public;
grant execute on function kairo.get_push_review_candidates() to service_role;
