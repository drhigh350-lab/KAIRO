-- Kairo — Question Reports
--
-- Captures "Report question" (a student flags a bad/wrong question) and
-- "Question feedback" from Practice's overflow menu. Both were previously
-- UI-only stubs in PracticeQuestion.tsx — they showed a toast and
-- persisted nothing. This gives them a real, append-only destination a
-- content team can review, scoped to kairo.students/kairo.questions
-- (public.problem_reports exists but keys off the unrelated players
-- table from a different product, so it isn't reused here).

create table kairo.question_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references kairo.students(id) on delete cascade,
  question_id text not null references kairo.questions(id) on delete cascade,
  kind text not null check (kind in ('report', 'feedback')),
  message text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index question_reports_question_id_idx on kairo.question_reports(question_id);
create index question_reports_student_id_idx on kairo.question_reports(student_id);

alter table kairo.question_reports enable row level security;

-- Append-only from the client, same convention as kairo.attempts: insert
-- and read own rows, no update/delete policy.
create policy "Insert own question reports" on kairo.question_reports
  for insert
  with check (
    exists (
      select 1 from kairo.students s
      where s.id = question_reports.student_id and s.auth_user_id = auth.uid()
    )
  );

create policy "Read own question reports" on kairo.question_reports
  for select
  using (
    exists (
      select 1 from kairo.students s
      where s.id = question_reports.student_id and s.auth_user_id = auth.uid()
    )
  );
