# Kairo — Supabase Backend Setup

This documents the actual, current state of the Supabase integration —
what's live, what you still need to configure by hand, and how the
frontend is expected to call it. Nothing here is aspirational; if a
step is marked "required," the engine will fail without it.

## 1. What already exists (done, live)

- Project: `TechMed-Daily` (Supabase project ref `unbgborbhxzsotaieiun`),
  same project as RoboMed/TechMed, different schema.
- Schema: `kairo` — fully separate from `public.*` (RoboMed's tables).
  Tables: `students`, `concepts`, `concept_states`, `questions`,
  `sessions`, `attempts`, `notifications`.
- Row Level Security is enabled on every `kairo.*` table. Model:
  every row belongs to an authenticated user
  (`kairo.students.auth_user_id = auth.uid()`). **There is no
  anonymous path** — a signed-in Supabase Auth user is required
  before any `kairo.*` row can be created or read.
- `src/supabase/SupabaseSyncAdapter.js` — maps the engine's in-memory
  shapes (StudentProfile, ConceptNode, attempts) to/from the real
  `kairo.*` columns (snake_case, correct types).
- `src/sync/SyncManager.js` — queues local changes and, once an
  adapter is attached, pushes/pulls through it.
- `KairoEngine.connectSupabase()` — the one call that wires
  everything together (see below).

## 2. What you still need to do by hand (required, one-time)

**Expose the `kairo` schema in the API settings.** By default,
Supabase's REST API (PostgREST) only exposes the `public` schema.
Go to:

> Dashboard → TechMed-Daily project → Settings → API → Exposed schemas

and add `kairo` to the list alongside `public`. Without this step,
every call in `SupabaseSyncAdapter.js` fails with a
"schema must be one of the schemas exposed" error — this is a
platform-level setting, not something a migration can set.

## 3. How the frontend connects

```js
import { createClient } from '@supabase/supabase-js';
import { KairoEngine } from 'kairo-learning-engine';

const supabase = createClient(
  'https://unbgborbhxzsotaieiun.supabase.co',
  '<anon key>' // safe to expose client-side — RLS enforces access
);

const kairo = new KairoEngine({
  studentId: 'temp-local-id', // replaced once connected, see below
  name: 'Ada',
  examDate: Date.parse('2027-04-15'),
  targetSubjects: ['Chemistry', 'Physics', 'Biology'],
  targetCourse: 'Medicine and Surgery',
  targetUniversity: 'University of Lagos'
});

await kairo.init(); // loads any local (IndexedDB) state first

// Sign-up (new student) — do this once, e.g. from an onboarding screen:
const adapter = new SupabaseSyncAdapter(supabase, kairo.store);
await adapter.signUp(email, password, { name: 'Ada' });

// Sign-in (returning student) + connect the engine to kairo.*:
await kairo.connectSupabase(supabase, { email, password });

// From here, kairo.profile.studentId is the real kairo.students.id,
// and kairo.sync.sync() will actually push/pull instead of
// returning { status: 'offline' }.
await kairo.sync.sync();
```

`connectSupabase()` does **not** call `signUp` itself — sign-up is a
distinct, deliberate action (it's how the "account required from
first visit" onboarding decision gets enforced), so the calling code
should decide when to show a sign-up form versus a login form.

## 4. Sync behavior

- `sync.queue({ type: 'attempt', data })` / `sync.queue({ type: 'session', data })`
  — called automatically by the engine (`submitAnswer()` queues an
  attempt; `endSession()` queues the completed session) to mark
  something as pending. `kairo.sessions` has carried a matching column
  shape since the schema was created, but nothing queued a session for
  it until this was wired up — Practice's session-completion writes
  were silently never reaching Supabase.
- `sync.sync()` — no-ops with `{ status: 'offline' }` if either the
  browser is offline or no adapter/engine has been attached yet
  (i.e. before `connectSupabase()` has succeeded). Once connected, it
  runs `SupabaseSyncAdapter.fullSync()`: pushes the local profile,
  concept states, any queued attempts, and any queued sessions, then
  pulls the authoritative remote copies back — and now actually
  **applies** that pulled copy onto the live engine
  (`SyncManager._applyRemote()`). Previously `fullSync()` fetched
  `remoteProfile`/`remoteConceptStates`/`remoteAttempts` and returned
  them to the caller, but nothing consumed them — sync was push-only
  in practice, so a second device's changes never reached this one.
- Conflict rule (unchanged from the original design, now actually
  enforced by `_applyRemote`): most recent `lastSeenAt`/`updated_at`
  wins for concept *state*; every attempt — local or remote — is
  retained via union + dedupe, never truncated. Profile scalar/history
  fields (macro state, learning state, journey stage, streak data,
  Elite Score history, etc.) adopt the remote copy only when remote's
  `lastSessionAt` is genuinely newer than this device's own.
- `kairo.notifications` is **read + mark-read only** from the client —
  `pullNotifications(studentId)` and `markNotificationRead(id)`. Its
  RLS grants `SELECT`/`UPDATE` to the owning student but no `INSERT`;
  rows are meant to be created server-side. This is separate from
  `NotificationEngine.js`'s own local candidate history, which
  round-trips through `kairo.students.notification_history` instead
  (that field existed on the live table since the schema was created,
  but `StudentProfile.js` never declared it, so it was silently
  dropped on every save — also fixed).

## 5. What was fixed in this pass (previously silent sync gaps)

Verified directly against the live `TechMed-Daily` project
(`unbgborbhxzsotaieiun`), not just the code:

- **`kairo.students` was missing columns for the Student Intelligence
  Model §1 Identity fields**, the Learning State fields, and the
  entire SJEE/Notifications-Comms/Learn Module state (journey stage,
  re-engagement, cross-module milestones, continuation, comms, learn)
  — none of these had a column, so pushing them would have failed
  outright the moment the code tried. Migration
  `add_sjee_comms_learn_and_identity_columns_to_students` adds all of
  them (purely additive `ADD COLUMN IF NOT EXISTS`; the table had 0
  rows, so no migration risk). `_profileToRow`/`_rowToProfile` in
  `SupabaseSyncAdapter.js` now map every field on
  `StudentProfile.toJSON()`.
- **`pushSession()` was fully implemented but never called** — see §4.
- **The pulled-back half of "bidirectional sync" was never applied** —
  see §4's `_applyRemote()` note.
- **`kairo.students.notification_history` existed but was unused** —
  `StudentProfile.js` didn't declare the field, so `NotificationEngine
  .markAsRead()`'s existing write to it was silently discarded on
  every serialize.

### Second pass — root-cause fix for Rapid Fire, CBT, Custom/Topic Practice

The previous pass fixed the *plumbing* (columns, `pushSession()`,
`_applyRemote()`); this pass found and fixed a *functional* bug that
was the actual reason four of the six session modes never reached
Supabase at all:

- **`engine.submitAnswer()` unconditionally threw `"No active
  session. Call startSession() first."`** unless `this.recommendation`
  (only ever set by `startSession()`/`startRecoverySession()`) was
  present. RapidFire and CBT Exam Mode both call `submitAnswer()`
  directly from their own independent lifecycles and never call
  `startSession()` — so **every RapidFire attempt crashed on
  `submitRapidFireAnswer()`, and every completed CBT mock crashed
  inside `finish()`** the moment it tried to record a concept-tested
  question. Neither mode could ever complete, so neither had anything
  to sync. Verified directly (see `tests/engine.test.js`, "RapidFire:
  submitAnswer no longer requires an active adaptive session" and
  "CBT: finish() no longer throws..."). Fixed by making
  `this.recommendation` and `this.currentSession` optional inside
  `submitAnswer()` — the concept-state/attempt-recording work (the
  part every module's spec calls "the shared Learning Engine
  primitive") no longer depends on the Practice-specific adaptive
  session object.
- **RapidFire and CBT now each queue their own `kairo.sessions` row**
  on `finish()`, tagged `mode: 'rapid_fire'` / `mode: 'cbt_exam'` —
  neither is threaded through `engine.currentSession`, so unlike
  standard Practice/Recovery, nothing else was ever going to queue a
  session row for them.
- **Custom Practice and Topic Practice could never produce a session
  with the right `mode` at all.** `buildCustomPractice()` /
  `buildTopicSession()` only ever returned a plan/queue preview —
  there was no method that actually ran that plan through a session,
  and `startSession()` always built its own adaptive plan and always
  hardcoded `mode: 'standard'`, so even a caller that manually drove
  the returned queue through `submitAnswer()`/`endSession()` would
  have synced it mislabeled as a standard session. `startSession()`
  now accepts `{ mode, plan }`; new `startCustomPractice()` /
  `startTopicPractice()` wrappers on `KairoEngine` build the plan and
  start a correctly-tagged session in one call.
- **CBT Exam Mode's default question count didn't match JAMB's real
  format** — a uniform 40-per-subject default gave 160 questions for
  a 4-subject combination instead of the real 180 (English carries 60,
  every other subject carries 40). Fixed in `CBTExamMode.setup()`.
- **CBT Exam Mode leaked correctness feedback (`isCorrect`,
  `correctOption`, `explanation`) on every `submitAnswer()` call
  during a live attempt** — a direct violation of the CBT Exam Mode
  spec's governing constraint (§2.3, §5.2, §5.4: no correctness signal
  of any kind until full submission). Unrelated to sync directly, but
  found and fixed in the same pass since it's in the same code path.
- **Five more profile fields were written directly onto
  `this.engine.profile.*` without ever being declared on
  `StudentProfile`**, so — exactly like `notification_history` before
  it — every one of them was silently dropped on every serialize:
  `completedChallenges` (`ChallengesModule.checkAndAward()`),
  `totalXP` (`LevelSystem.update()` — meant a returning student's
  level would incorrectly show Level 1 on every fresh load until their
  next completed session recalculated it), `badges`
  (`BadgeSystem.checkAndAward()` — meant every earned badge was lost
  on reload and silently re-awarded, and re-notified, the next time
  its condition was re-checked), `preferences`
  (`ProfileSettings.updatePreferences()` — meant a student's
  notification/practice/accessibility/privacy/offline settings reset
  to defaults on every fresh load), and `email`/`avatar`
  (`ProfileSettings.updateProfile()`). Migration
  `add_progression_settings_and_contact_columns_to_students` adds the
  five matching columns (`total_xp`, `badges`, `preferences`, `email`,
  `avatar`); `StudentProfile.js` now declares all five and
  `SupabaseSyncAdapter.js` maps them in both directions. The
  structural round-trip test (`tests/engine.test.js`) now asserts
  every `StudentProfile.toJSON()` key automatically, so a sixth
  instance of this same bug would fail the suite immediately rather
  than going unnoticed again.

### Third pass — seeded the question bank live and wired it to the practice loop

The previous two passes fixed sync plumbing and session-lifecycle bugs,
but `kairo.questions`/`kairo.concepts` were still empty and nothing in
the engine ever called `fetchQuestions()`/`fetchConcepts()` — the
question bank existed only as local JSON with no path into a real
session. This pass closed that end to end:

- **Seeded all 800 questions live** (Biology/Chemistry/Physics/Use of
  English, 200 each) into `kairo.questions` — verified zero data-quality
  issues (option counts, duplicate ids, jsonb typing) post-import.
- **Derived and seeded 201 concepts into `kairo.concepts`** — one per
  distinct `(subject, topic)` pair actually present in the seeded
  questions (subtopic was deliberately excluded from concept identity;
  it behaves as a coarse grouping above topic in this data, not a finer
  one below it — only Biology's "Reproduction" topic has more than one
  distinct subtopic value). IDs were generated by importing and calling
  the real `conceptId()` hash from `src/utils/helpers.js`, not
  reimplementing it, so they're identical to what `engine.addConcept()`
  would independently compute for the same inputs.
- **Linked every question to its concept** via
  `kairo.questions.concepts_tested` (a join on `subject`+`topic` against
  the new concepts table) — previously `[]` on all 800 rows, which meant
  `QuestionRelationshipGraph.getQuestionsForConcept()` could never match
  a question to a concept even if both existed.
- **Backfilled `learning_objective` and promoted all 800 questions to
  `lifecycle_state: 'live'`.** `QuestionLifecycle.validate()`'s Gate 1
  hard-fails on a missing/short learning objective, which blocks
  `promote()` — and `fetchQuestions()`/`getQuestionsForConcept()` both
  hard-filter on `lifecycle_state = 'live'`, so this was the one
  remaining hard blocker keeping every seeded question permanently
  invisible to the engine. Backfilled using the exact fallback template
  `LearnModule.js` already uses when a question has no learning
  objective (`"Understand {topic} well enough to apply it, not just
  recall it."`) rather than authoring new placeholder copy — reusing an
  already-spec-sanctioned string, not inventing content.
- **Added `KairoEngine.loadContentCatalog({ subjects })`** — the bridge
  that was missing entirely: fetches concepts + live questions from
  Supabase via the now-actually-called `fetchConcepts()`/
  `fetchQuestions()`, adds real `ConceptNode`s to `this.graph` and real
  `Question`s to `this.questionGraph` (IDs taken verbatim from the row,
  never recomputed), and mirrors a flattened copy of every question into
  `ContentPackManager`'s local queue so `CBTExamMode.buildPaper()` (via
  `contentPacks.getOfflineQuestions()`) sees real content without a
  separate "download pack" step. Requires `connectSupabase()` to have
  run first.
- **Added `KairoEngine.getQuestionForConcept(conceptId)`** — closes the
  last gap between a session plan (which is only ever a list of concept
  IDs — see `RecommendationEngine.buildSessionPlan()`) and something a
  caller can actually render. Returns one live question for that
  concept in the flat `{ text, options, correctOption, conceptId,
  difficulty, ... }` shape CBTExamMode/RapidFire callers already expect,
  translated from the canonical QIM `Question` shape (`.stem`,
  `.conceptsTested[]`) in one place (`_flattenQuestion()`) instead of
  duplicated per consumer.
- **Fixed `OnboardingEngine.buildInitialPlan()`**, which previously
  seeded a fictional knowledge graph — a hardcoded 5-topic-per-subject
  stub (e.g. Biology → `['Cell Biology', 'Genetics', 'Ecology',
  'Physiology', 'Evolution']`), each turned into a concept named
  `"{topic} Fundamentals"` with a fake `questionPoolIds: ['Biology_Cell
  Biology_q1']` placeholder that matched no real question. Every
  student's very first knowledge map was disconnected from the real
  content, regardless of the fixes above. Now calls
  `loadContentCatalog({ subjects })` directly, so onboarding seeds the
  student's graph from the real catalog; a subject with no seeded
  content yet simply seeds 0 concepts rather than fabricating
  placeholders. `completeOnboarding()` is now `async` to match.

## 5b. Fourth pass — anti-cheat write validation

RLS on `kairo.attempts`/`kairo.sessions` only ever checked *ownership*
(`student_id` belongs to the caller) — nothing checked plausibility, so a
client could edit its own request payload to insert an attempt asserting
`correct: true` regardless of what was actually answered. Closed via two
`BEFORE INSERT`/`BEFORE INSERT OR UPDATE` trigger functions
(`kairo.check_attempt_before_insert`, `kairo.check_session_before_upsert`,
migration `add_kairo_anti_cheat_validation` + follow-up
`fix_anti_cheat_audit_log_rollback_bug`):

- **Attempts are checked against the live question, not just trusted.**
  When `question_id` is present, the trigger looks up the real
  `kairo.questions` row and rejects the write if `correct_option` doesn't
  match, or if `correct` is inconsistent with `selected_option` vs the
  actual `correct_option`. This is stronger than RoboMed's
  `check_player_before_update` (which can only bound XP/streak deltas,
  since `public.players` has no ground truth to check against) —
  `kairo.attempts` carries `question_id`, so correctness is verifiable
  directly.
- `response_time_ms < 150` and `question_difficulty` outside 1–5 are
  rejected on attempts. On sessions: negative `questions_answered`,
  `correct_count` exceeding `questions_answered`, `completed_at` before
  `started_at`, and an implausible average time per question
  (< 150ms/question across the whole session) are rejected.
- **A first version also inserted a `kairo.cheat_audit_log` row before
  raising the exception — verified by test to never actually persist.**
  `RAISE EXCEPTION` unwinds everything done since the start of that
  (sub)transaction, including an insert made moments earlier in the same
  trigger invocation, so the audit table would always read empty (RoboMed's
  `cheat_audit_log` likely has the identical latent bug via the same
  pattern in `check_player_before_update`). Making it durable needs an
  autonomous transaction (e.g. `dblink` to a loopback connection, not
  installed) — real operational fragility for a debugging aid. Simplified
  to a plain `RAISE EXCEPTION` with a descriptive message instead; that
  message is captured in Supabase's own Postgres logs (`get_advisors`/
  `get_logs`), which is a truthful audit trail, unlike a table that always
  reads empty. Verified end-to-end with a test transaction exercising all
  6 paths (2 valid inserts, 4 forged/implausible ones correctly rejected).

## 5c. Fifth pass — repeatable content-catalog seeding script

`scripts/seed-content-catalog.js` closes the "no admin/service-role
tooling" gap: given one or more QIM-shaped question-bank JSON files (the
output of `scripts/import-question-bank.js`), it derives concepts,
links `conceptsTested`, and upserts both tables using the service role
key — the same steps done by hand this session, now repeatable. Dry-run
by default (prints what it would do; nothing is written until `--apply`,
since the service role key bypasses every RLS policy in the project, not
just `kairo`). `--promote-live` runs each question through the real
`QuestionLifecycle.validate()` (imported from `src/qim/`, never
reimplemented) and only sets `lifecycle_state: 'live'` on rows that
actually pass every QA gate — content that fails is left alone and
reported, never force-promoted. Verified against the real 800-question/
201-concept local content: dry run reports the identical 201 concepts
and 800/800 passing QA gates that are actually live today.

Building this surfaced a real drift bug: the `learningObjective`
backfill and `live` promotion from §5 (Third pass) were applied directly
to the live table via SQL, but never written back to the local
`content/question-banks/*.json` files — so the repo's own copy of the
content still had `learningObjective: null` and `lifecycleState:
'imported'`, silently out of sync with what's actually live. Fixed by
applying the identical backfill to the local files; `git diff` against
this pass is now just that sync fix, nothing else changed.

## 6. What is still NOT done

- **The onboarding subject picker offers 8 subjects
  (`OnboardingEngine.getNextStep()`'s `'subjects'` step: English,
  Mathematics, Physics, Chemistry, Biology, Government, Economics,
  Literature) but only 4 have seeded content, and one of those doesn't
  match by name** — the picker says `'English'`, the seeded subject
  string is `'Use of English'`, and `loadContentCatalog()` filters by
  exact string equality, so a student who selects "English" gets 0
  concepts even though Use of English content exists. Picking
  Mathematics/Government/Economics/Literature currently seeds 0
  concepts for that subject regardless, since none of those have any
  seeded content at all. This is a product/content decision (trim the
  picker to what's seeded, rename the label, or seed the other 4
  subjects) — flagged, not changed, since the picker's copy and options
  are product-owned.
- **The onboarding diagnostic quiz (`'diagnostic'` step, 5 questions)
  still has no code path that selects real questions to ask** — it only
  accepts already-answered `{conceptId, correct, responseTimeMs}` input
  via `submitStep()`. Whatever drives that step client-side needs a way
  to pick 5 real live questions before `loadContentCatalog()` has
  necessarily run for the student's chosen subjects; not addressed in
  this pass.
- **Review, CBT Exam Mode content (paper/results detail beyond the
  session summary), Challenges (see below), Insights, Leaderboard,
  and Onboarding module state have no Supabase table at all** —
  they're entirely local/in-memory today (some of that may be fine to
  stay ephemeral or purely derived from `attempts`/`concept_states`;
  some of it may not). Progression's levels/badges/XP now round-trip
  through `kairo.students` (§5), so that one's resolved. This needs a
  product/engineering decision on which of the rest genuinely need
  server-side persistence before any schema work happens — not
  something to guess at silently.
- **`ChallengesModule.js` implements a different feature than the
  Challenges Module spec** (`docs/specs/KAIRO_CHALLENGES_MODULE.md`)
  describes — the spec is admin-curated, event-based challenges with
  discovery/leaderboards/sharing; the code is a personal
  achievement/badge system with no admin curation or shared-event
  model. `completedChallenges` now syncs correctly for what the code
  actually does today, but that's a different question from whether
  the code does what the spec asks for — flagged in the same audit
  that closed the sync gaps, not something to build without a product
  conversation first given the scope (admin roles, leaderboards,
  sharing infra).
- **The notification stack is not "two parallel systems" — it's three
  non-interoperating layers, and the deeper two don't fit each other.**
  Investigated properly this pass rather than just re-flagging the
  existing note:
  1. `src/notifications/NotificationEngine.js` — legacy, live, generates
     6 candidate types (daily recap, streak, exam proximity, challenge
     complete, weekly reflection, recovery) and delivers them itself
     directly into its own queue/history. This is the only one of the
     three actually wired into the running engine today.
  2. `src/sjee/NotificationOrchestrator.js` — spec-accurate arbitration
     (tone gate, journey-stage gate, frequency budget, channel
     selection). Fully built and unit-tested in isolation, but
     `new NotificationOrchestrator(this.profile)` in `index.js` is its
     only reference anywhere — `.submit()`/`.arbitrate()` are never
     called by anything live. Same for `ReEngagementEngine`,
     `CrossModuleMilestones`, and `ContinuationEngine`, which are all
     candidate *sources* meant to feed it (confirmed by grepping for
     every call site of each — none exist outside their own tests).
  3. `src/comms/CommsService.js` + `TemplateEngine.js` — also fully
     built and unit-tested, also never called from anywhere live.
  
  **The blocker to wiring 2 into 3 isn't missing glue code — the two
  layers expect genuinely different candidate shapes.** `arbitrate()`
  returns candidates from `NotificationOrchestrator`/`ReEngagementEngine`/
  `ContinuationEngine` as pre-composed `{ type, tier, title, body,
  action }` — a finished sentence. `TemplateEngine.render()` expects
  `{ category, data: { observation, reason, benefit, action } }` — raw
  fact *slots* that IT composes into text (§5.2's "Layer 1 data payload
  ... Layer 2 template ... Layer 3 rendering", with its own voice
  calibration and compliance auto-correction). Passing an
  Orchestrator-shaped candidate into `CommsService.resolve()` today
  would silently return `null` on every single call, since `data` is
  undefined and `_buildSlots()` requires `data.observation`.
  
  Reconciling this means either rewriting every candidate-generating
  module's already-composed prose (`_composeInvitation()` and
  equivalents) into structured observation/reason/benefit fact payloads
  — genuinely touching what Kai says to students — or building a
  translation layer that can't mechanically reconstruct facts from
  already-composed sentences. Both are product-facing copy decisions,
  not a wiring task, so this is flagged with the real shape of the
  problem rather than fixed blind.
- **`kairo.students` RLS/security posture is clean** — every advisory
  finding on this project is on the legacy `public.*` RoboMed tables
  and functions, unrelated to the `kairo` schema.
