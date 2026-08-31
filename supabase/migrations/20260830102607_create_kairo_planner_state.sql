-- Supersedes the never-applied 20260822100000_create_planner_state_table.sql
-- (removed in this same PR): that migration was committed to main but was
-- never actually run against the live project — kairo-app's
-- plannerApi.ts has been unconditionally querying/upserting
-- kairo.planner_state on every Planner load/save regardless, so every
-- call was silently throwing and falling back to the local IndexedDB-only
-- copy. No student's Study Planner progress has ever actually synced
-- across devices until this table existed. Created now because
-- RecommendationEngine.getPlannerSignal() (the Planner Handshake) needs a
-- student's real topic_progress/completed_topic_keys reachable from
-- kairo-learning-engine, a separate package from kairo-app that has no
-- access to its IndexedDB mirror.
create table kairo.planner_state (
  student_id           uuid primary key references kairo.students(id) on delete cascade,
  plan_input           jsonb,
  completed_topic_keys text[] not null default '{}',
  topic_progress       jsonb not null default '{}'::jsonb,
  updated_at           timestamptz not null default now()
);

comment on table kairo.planner_state is 'Study Planner cross-device sync (kairo-app/src/lib/planner/plannerApi.ts loadPlannerState()/persist()). pinnedDueTopic/pendingVerificationKeys are deliberately NOT columns here — plannerApi.ts''s own PlannerState type marks both local-only by design (never synced, never clobbered by a remote pull), so this table intentionally does not carry them.';

alter table kairo.planner_state enable row level security;

create policy "Read own planner state"
  on kairo.planner_state for select
  using (exists (select 1 from kairo.students s where s.id = planner_state.student_id and s.auth_user_id = auth.uid()));

create policy "Insert own planner state"
  on kairo.planner_state for insert
  with check (exists (select 1 from kairo.students s where s.id = planner_state.student_id and s.auth_user_id = auth.uid()));

create policy "Update own planner state"
  on kairo.planner_state for update
  using (exists (select 1 from kairo.students s where s.id = planner_state.student_id and s.auth_user_id = auth.uid()))
  with check (exists (select 1 from kairo.students s where s.id = planner_state.student_id and s.auth_user_id = auth.uid()));
