-- Kairo — Study Planner state
--
-- Cross-device sync for the Study Planner (ported from the TECHMED
-- marketing site's plannerEngine.ts/syllabus.ts — see
-- kairo-app/src/lib/planner/). The planner itself is pure client-side
-- logic (buildPlan() takes the student's own inputs and the static
-- Blueprint data, returns a plan); this table only persists the two
-- things that can't be recomputed from scratch: what the student actually
-- told the planner (plan_input) and which topics they've checked off
-- (completed_topic_keys), plus the per-topic tiered-SRS progress from
-- Verification Sessions (topic_progress). One row per student — like
-- kairo.bookmarks, this is client-owned state with no admin-authored
-- content of its own, unlike kairo.questions.
create table kairo.planner_state (
  student_id uuid primary key references kairo.students(id) on delete cascade,
  -- PlannerInput (target date, available days/hours, per-subject
  -- confidence/starting stage) — see PlannerInput in plannerEngine.ts.
  -- Null until the student finishes the initial planner setup.
  plan_input jsonb,
  -- Topic keys (subjectSlug::stageOrder::topicTitle — see topicKey() in
  -- plannerEngine.ts) the student has checked off. A plain text array
  -- rather than jsonb since it's a flat set with no per-entry shape.
  completed_topic_keys text[] not null default '{}',
  -- Per-topic-key tiered-SRS state from Verification Session results —
  -- { [topicKey]: { tier, lastAccuracyPct, resurfaceDates, lastAttemptedAt } }.
  -- See classifyAccuracyTier()/computeResurfaceDates() in plannerSrs.ts.
  topic_progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table kairo.planner_state enable row level security;

create policy "Upsert own planner state" on kairo.planner_state
  for insert
  with check (
    exists (
      select 1 from kairo.students s
      where s.id = planner_state.student_id and s.auth_user_id = auth.uid()
    )
  );

create policy "Read own planner state" on kairo.planner_state
  for select
  using (
    exists (
      select 1 from kairo.students s
      where s.id = planner_state.student_id and s.auth_user_id = auth.uid()
    )
  );

create policy "Update own planner state" on kairo.planner_state
  for update
  using (
    exists (
      select 1 from kairo.students s
      where s.id = planner_state.student_id and s.auth_user_id = auth.uid()
    )
  );
