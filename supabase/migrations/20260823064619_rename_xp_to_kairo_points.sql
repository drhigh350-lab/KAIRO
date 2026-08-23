-- Kairo Score / Kairo Points decoupling (approved architecture directive).
-- "XP" is renamed to Kairo Points everywhere, including here: it's a
-- strictly additive, unbounded gamification ledger, deliberately distinct
-- from Kairo Score (elite_score_history) — a bounded, recompute-from-
-- scratch UTME-readiness gauge that stays untouched by flat bonuses.
--
-- total_xp already holds real per-student data, so it's renamed in place
-- (never dropped/recreated) to preserve every existing balance.
--
-- kairo_points_progress is the "already credited" ledger (which specific
-- concept/day/topic ids have already earned their one-time Kairo Points
-- award) that makes ProgressionSystem.js's LevelSystem strictly monotonic —
-- see awardFromProgress().
--
-- streak_longest_momentum is the Profile-tab-only "longest streak ever"
-- stat, split out from streak_current_momentum (Home dashboard) per the
-- approved directive that Home shows only the active current streak.

alter table kairo.students
  rename column total_xp to kairo_points;

alter table kairo.students
  add column if not exists kairo_points_progress jsonb not null default '{"reinforcedConceptIds":[],"heldConceptIds":[],"consistencyDays":[],"masteredTopics":[]}'::jsonb,
  add column if not exists streak_longest_momentum integer not null default 0;

-- Backfill: a student's longest streak so far is at least their current
-- streak (streak_current_momentum was never allowed to exceed the true
-- longest run, since it only ever increments by 1 or resets to 1).
update kairo.students
  set streak_longest_momentum = streak_current_momentum
  where streak_longest_momentum < streak_current_momentum;
