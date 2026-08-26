-- Batch 2 (pre-launch bug fix): 108 live kairo.questions rows already
-- reference "the diagram above" in their stem text with no way to actually
-- show one — there was never a column to hold a diagram's URL at all, not
-- just a broken frontend renderer. Nullable/additive: every existing row
-- keeps rendering exactly as before (no image) until content is attached.
alter table kairo.questions
  add column image_url text;

comment on column kairo.questions.image_url is
  'Public Supabase Storage URL (question-diagrams bucket) for a diagram this question''s stem references. Null when the question has no diagram.';
