-- Review Tab rebuild — "Spaced Sandbox" protocol (Batch 2's Triage Inbox).
-- Every wrong attempt already carries an implicit 72h cooldown computed
-- from kairo.attempts.answered_at (no row needed here for that default
-- path) — this table exists only for the explicit override: a student
-- tapping "I Understand" on a mistake resets its clock to a full fresh
-- 72h from that acknowledgment moment, taking precedence over the
-- default answered_at-derived cooldown. One row per (student, question)
-- since the decision is "when is this specific question ripe again",
-- not tied to any one attempt.
create table kairo.mistake_patches (
  student_id uuid not null references kairo.students(id) on delete cascade,
  question_id text not null references kairo.questions(id) on delete cascade,
  concept_id text references kairo.concepts(id),
  verify_after timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, question_id)
);

comment on table kairo.mistake_patches is
  'Spaced Sandbox protocol: explicit "I Understand" acknowledgments on a missed question, each resetting that question''s retest cooldown to verify_after. The recommendation engine and Smart Patch/CBT session builder both exclude a question until now() >= verify_after.';

alter table kairo.mistake_patches enable row level security;

create policy "Read own mistake patches" on kairo.mistake_patches
  for select
  using (exists (select 1 from kairo.students s where s.id = mistake_patches.student_id and s.auth_user_id = auth.uid()));

create policy "Insert own mistake patches" on kairo.mistake_patches
  for insert
  with check (exists (select 1 from kairo.students s where s.id = mistake_patches.student_id and s.auth_user_id = auth.uid()));

create policy "Update own mistake patches" on kairo.mistake_patches
  for update
  using (exists (select 1 from kairo.students s where s.id = mistake_patches.student_id and s.auth_user_id = auth.uid()))
  with check (exists (select 1 from kairo.students s where s.id = mistake_patches.student_id and s.auth_user_id = auth.uid()));
