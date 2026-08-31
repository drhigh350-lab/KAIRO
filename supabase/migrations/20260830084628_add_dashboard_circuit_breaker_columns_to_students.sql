alter table kairo.students
  add column if not exists last_frustrated_subject text,
  add column if not exists last_frustrated_at timestamptz,
  add column if not exists avoidance_streaks jsonb not null default '{}'::jsonb;

comment on column kairo.students.last_frustrated_subject is 'Kairo V1 Dashboard Anti-Fatigue Circuit Breaker: subject of the most recent Focused Sprint/Frontier Push that finished below RecommendationEngine''s FRUSTRATION_ACCURACY_THRESHOLD. Bars that subject from the next dashboard''s Primary slot only.';
comment on column kairo.students.last_frustrated_at is 'Timestamp paired with last_frustrated_subject.';
comment on column kairo.students.avoidance_streaks is 'Kairo V1 Dashboard Avoidance Tracker: subject -> consecutive count of picking the Secondary option over that subject''s own offered Focused Sprint. Reset to 0 when that subject''s Sprint is actually completed.';
