-- Root cause of the "~1,000 seeded Biology questions never appeared live"
-- report: kairo.questions.lifecycle_state defaults to 'imported', and the
-- app's fetchQuestions() (kairo-learning-engine/src/supabase/
-- SupabaseSyncAdapter.js) hard-filters .eq('lifecycle_state', 'live').
-- The Chemistry/Mathematics/Physics/Use of English seed migrations all
-- explicitly set lifecycle_state on insert; the Biology seed batches
-- (applied directly against the live project -- no matching .sql files
-- ever existed in this repo) never did, so every one of those rows
-- silently fell back to the 'imported' default and was invisible to
-- Practice/RapidFire/CBT/Learn, even though the content itself is
-- complete and well-formed (verified: 0 rows with missing stem/options/
-- correct_option/explanation/concept link across all 1,082 affected rows).
--
-- Also folds in 3 rows where a topic name was written into `subject`
-- instead of 'Biology' (biology_0639, biology_0523, biology_0621) --
-- otherwise they'd stay invisible even after this fix, since the app
-- filters strictly by subject. `topic` on those 3 is left as-is
-- (not yet one of the 23 official JAMB Biology topics) -- proper
-- topic/subtopic/concept classification for them is deferred to the
-- full Biology taxonomy batch, same as the rest of the subject.

update kairo.questions
set subject = 'Biology'
where subject in ('Evolution & Evidence of Evolution', 'Excretion & Osmoregulation', 'Human Impact on the Environment');

update kairo.questions
set lifecycle_state = 'live'
where subject = 'Biology' and lifecycle_state = 'imported';
