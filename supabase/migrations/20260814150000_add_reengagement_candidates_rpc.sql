-- kairo.get_reengagement_candidates()
--
-- SQL-side mirror of ReEngagementEngine.generateCandidate()'s two reachable
-- rungs (NOTABLE_GAP, AT_RISK_GAP) — see kairo-learning-engine/src/sjee/
-- ReEngagementEngine.js. Deliberately narrower than the full JS engine:
--
--   - EXTENDED_ABSENCE/DORMANT (winBackAttempts-based) are out of scope —
--     nothing in production has ever called generateCandidate() to
--     populate kairo.students.re_engagement, so that state doesn't exist
--     for any real student yet. Revisit once it does.
--   - The JS engine's typical-interval-per-student (median historical gap)
--     is approximated here by its own conservative fallback for "not
--     enough history to trust a rhythm" (> 7 days since last session),
--     rather than replicating a median calculation in SQL. Documented
--     simplification, not an oversight.
--
-- Journey Stage gating mirrors JourneyStageTracker.personalizationPosture():
-- arrival/activation are "not_applicable", culmination is "suspended",
-- continuation is governed by ContinuationEngine (not this path) — only
-- establishment/intensification are eligible here.
--
-- Honest content (Student Journey & Engagement Engine §6.5): a candidate
-- only exists if the student has a real Fading concept to name. No fading
-- concept = no send, matching _findHonestContent()'s "silence over a
-- generic template" rule exactly.
--
-- Consent gated the same way as every other lifecycle email category,
-- using NotificationCategory.REENGAGEMENT ('reengagement_winback').
-- Dedupe is once per ISO week per student, not once per day — an ongoing
-- gap shouldn't produce a daily nudge from a single-rung, no-cooldown
-- SQL path the way the full Orchestrator's frequency budget would prevent.
-- Returns the exact dedupe key the WHERE clause filtered on, so the caller
-- (send-lifecycle-emails) writes back the identical value instead of
-- recomputing an ISO week independently in JS, which risks silently
-- producing a different string and defeating the dedupe.

CREATE FUNCTION kairo.get_reengagement_candidates()
RETURNS TABLE(
  student_id uuid,
  name text,
  email text,
  gap_severity text,
  concept_name text,
  dedupe_key text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'kairo', 'pg_temp'
AS $function$
  with fading as (
    select distinct on (cs.student_id)
      cs.student_id, c.name as concept_name
    from kairo.concept_states cs
    join kairo.concepts c on c.id = cs.concept_id
    where cs.retention_state = 'fading'
    order by cs.student_id, cs.decay_estimate desc nulls last
  ),
  last_session as (
    select student_id, max(completed_at) as last_completed_at
    from kairo.sessions
    where completed_at is not null
    group by student_id
  )
  select
    s.id,
    s.name,
    s.email,
    case when s.macro_state = 'at_risk' then 'at_risk_gap' else 'notable_gap' end,
    f.concept_name,
    to_char(current_date, 'IYYY-IW')
  from kairo.students s
  join fading f on f.student_id = s.id
  left join last_session ls on ls.student_id = s.id
  where s.email is not null
    and s.journey_stage in ('establishment', 'intensification')
    and (
      s.macro_state = 'at_risk'
      or (ls.last_completed_at is not null and ls.last_completed_at < now() - interval '7 days')
    )
    and coalesce((s.comms -> 'consent' ->> 'hardStopActive')::boolean, false) = false
    and coalesce((s.comms -> 'consent' -> 'channelPermissions' ->> 'email')::boolean, false) = true
    and coalesce((s.comms -> 'consent' -> 'categoryPreferences' -> 'email' ->> 'reengagement_winback')::boolean, false) = true
    and not exists (
      select 1 from kairo.email_log el
      where el.student_id = s.id
        and el.category = 'reengagement'
        and el.dedupe_key = to_char(current_date, 'IYYY-IW')
    );
$function$;
