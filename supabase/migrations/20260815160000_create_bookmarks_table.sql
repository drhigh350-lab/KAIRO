-- Kairo — Question Bookmarks
--
-- "Bookmark this question" existed only as a local useState toggle in
-- PracticeQuestion.tsx (setBookmarked(!bookmarked)) — no write path, no
-- read path, reset to false on every reload. LearnModule.fromBookmark()
-- (§3.9) has been a real entry point this whole time with no real
-- bookmark data to route from, and Review Home's planned Bookmarks
-- section (KAIRO_REVIEW_MODULE.md §4.3 item 6) had nothing to read.
--
-- Question-level (not concept-level): the one real UI touchpoint bookmarks
-- the specific question the student is looking at. Learn's fromBookmark()
-- resolves the underlying concept from the bookmarked question's primary
-- concept link.

create table kairo.bookmarks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references kairo.students(id) on delete cascade,
  question_id text not null references kairo.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, question_id)
);

create index bookmarks_student_id_idx on kairo.bookmarks(student_id);

alter table kairo.bookmarks enable row level security;

-- Unlike kairo.question_reports (append-only), a bookmark is a personal
-- organizational tool the student should be able to remove.
create policy "Insert own bookmarks" on kairo.bookmarks
  for insert
  with check (
    exists (
      select 1 from kairo.students s
      where s.id = bookmarks.student_id and s.auth_user_id = auth.uid()
    )
  );

create policy "Read own bookmarks" on kairo.bookmarks
  for select
  using (
    exists (
      select 1 from kairo.students s
      where s.id = bookmarks.student_id and s.auth_user_id = auth.uid()
    )
  );

create policy "Delete own bookmarks" on kairo.bookmarks
  for delete
  using (
    exists (
      select 1 from kairo.students s
      where s.id = bookmarks.student_id and s.auth_user_id = auth.uid()
    )
  );
