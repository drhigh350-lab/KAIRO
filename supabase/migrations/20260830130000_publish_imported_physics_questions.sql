-- Same bug as the Biology fix (20260819120000_publish_imported_biology_questions.sql):
-- kairo.questions.lifecycle_state defaults to 'imported', and the app's
-- fetchQuestions() (kairo-learning-engine/src/supabase/SupabaseSyncAdapter.js)
-- hard-filters .eq('lifecycle_state', 'live'). 673 of Physics's 873 seeded
-- questions (seeded 2026-08-20, applied directly against the live project --
-- no matching .sql files ever existed in this repo) never had lifecycle_state
-- flipped, so they silently stayed 'imported' and were invisible to
-- Practice/RapidFire/CBT/Learn. Verified: 0 rows with missing stem/options/
-- correct_option/explanation/concept link across all 673 affected rows, and
-- no rows with a topic name leaked into the subject column this time.

update kairo.questions
set lifecycle_state = 'live'
where subject = 'Physics' and lifecycle_state = 'imported';
