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

## 5e. Sixth pass — ChallengesModule rebuilt around the real spec

`ChallengesModule.js` previously implemented a different feature than
`docs/specs/KAIRO_CHALLENGES_MODULE.md` describes: the spec is
admin-curated, event-based challenges (§2.3 "Only TECHMED administrators
can create Challenges") with discovery/leaderboards/sharing; the code
was a personal achievement/badge system — a duplicate of what
`BadgeSystem`/`LevelSystem` (`src/progression/ProgressionSystem.js`)
already do independently. Rebuilt around the actual spec:

- **New tables**: `kairo.challenges` (type, title, theme, question_ids,
  scoring_formula, starts_at/ends_at, late_join_allowed,
  leaderboard_visible, status) and `kairo.challenge_attempts` (one row
  per student per challenge — score, accuracy, time_taken_ms,
  question_results, counts_toward_leaderboard for the §5.3 late-joiner
  case). Migrations `add_kairo_challenges_module`,
  `add_challenge_streak_to_students`.
- **Minimal admin gating**: `kairo.students.is_admin boolean default
  false` — there was no admin/role concept anywhere in `kairo.*` before
  this. RLS restricts `kairo.challenges` INSERT/UPDATE to
  `is_admin = true`; `§10.5`'s full Content/Growth/senior-admin role
  split is real future work, not built.
- **§7.2 leaderboard, windowed around the student's own rank by
  default** (not just top-N) via `kairo.get_challenge_leaderboard()`, a
  SQL function rather than a raw table policy — a plain RLS SELECT
  policy can't safely let a student read *other* students' rows only
  for ranking while keeping `question_results` (their actual answers)
  private, so the function returns only the ranking columns. Verified
  live: 3 test attempts placed correctly by score, then by
  time_taken_ms as tiebreak; a `p_window: 0` query around one student
  returned exactly that student's own row.
- **`ChallengesModule.js`**: `createChallenge()`/`updateChallengeStatus()`
  (admin-only per RLS — §10.2/§10.3, the *operations* an admin tool
  would call, not the dashboard itself), `joinChallenge()` (§5.3
  late-join handling — flags `counts_toward_leaderboard: false` rather
  than silently rejecting, per §6.2's "no silent failures"),
  `finishChallenge()` (computes score per the challenge's configured
  `scoringFormula` — accuracy/speed/hybrid, §10.2 — and also feeds
  `engine.submitAnswer()` per §9.3 "feeding data in": a challenge
  question is still a real attempt against the real knowledge graph),
  `getLeaderboard()`, `getPersonalBenchmark()` (§7.2 "your best Speed
  Challenge score yet").
- `completedChallenges` now means what its name says — completed real
  Challenge ids, not a locally-polled achievement catalog.
  `NotificationEngine`'s old "challenge completion" rule polled a
  `checkAndAward()` method that no longer exists; removed rather than
  left dangling, since completion is event-driven now
  (`finishChallenge()`), not something to poll for.
- Added `StudentProfile.challengeStreak` (§9.2 streaks) —
  `kairo.students.challenge_streak` — mapped in
  `SupabaseSyncAdapter` both directions and covered by the same
  structural round-trip discipline as the earlier profile-field bugs.

**Deliberately not built** (flagged, not silently skipped — these are
UI/product surfaces or larger systems, not backend engine work):
Discovery surfaces (§4 — home zone, dedicated tab, push copy),
in-challenge UI chrome (§6), shareable result-card rendering (§8 —
WhatsApp/Telegram branded images), the actual admin dashboard UI (§10 —
live monitoring, mid-challenge intervention UI, reporting views —
though the engine-level operations they'd call now exist), full
roles/permissions beyond the single `is_admin` flag (§10.5), and
challenge-related push notifications (blocked on the same notification
pipeline gap as §6 below).

## 5f. Seventh pass — real OneSignal transport code (not yet wired to a working pipeline)

A OneSignal app for TECHMED already exists in production (`Techmed app`,
with live subscriber segments) — connected as an MCP tool for this
session, which lets *me* inspect/manage it from chat but gives the
deployed Kairo app nothing; the codebase needs its own
`ONESIGNAL_APP_ID`/`ONESIGNAL_API_KEY` env vars (from the OneSignal
dashboard) wherever it actually runs, never hardcoded or committed.

`src/comms/transport/OneSignalTransport.js` is the literal "transport
layer, outside this module, actually delivers it" `CommsService.js`'s
own docstring already anticipated. It takes a `CommsService.resolve()`
result and a student's OneSignal `external_id` and calls the real
`POST /notifications` API for push/email/sms; `in_app_badge` (renders
client-side) and `whatsapp` (OneSignal has no WhatsApp channel — would
need Twilio) are handled as non-error "not sent" outcomes, not thrown.
4 tests, all against an injected `fetchImpl` — no live network calls in
the suite, and no real send was made against the live app during this
work (OneSignal's own `send_message` tool is explicitly gated
"HIGH IMPACT: confirmation required," and this session never had a
safe, explicitly-user-approved single test target to send to).

**Update (§6, below): the candidate-shape mismatch this depended on is
now reconciled** — `KairoEngine.checkAndResolveNotifications()`
produces real `CommsService.resolve()` output end-to-end. This
transport is ready to carry it; what's still missing is resolving a
student to their OneSignal `external_id` (see §6) — once that exists,
the loop is: `checkAndResolveNotifications()` → for each
`{candidate, resolved}` → `new OneSignalTransport().send(resolved,
externalId)`.

## 5g. Eighth pass — CRITICAL: `authenticated` had zero grants on the entire `kairo` schema

Discovered as a side effect of investigating whether Leaderboard needed
a real backend (§6, below): **no role other than the table owner
(`postgres`) had ever been granted access to `kairo` — not the schema
itself, not a single table.** Every RLS policy across every kairo table
was correctly written, but RLS only *restricts* rows for a role that
already has a `GRANT`; without one, `authenticated` has zero access
regardless of how permissive the policies are. Concretely: `SELECT
has_schema_privilege('authenticated', 'kairo', 'USAGE')` returned
`false`, and `information_schema.role_table_grants` had zero rows for
any `kairo.*` table for any role except `postgres`.

**This means no real signed-in app user could ever have reached
`kairo.*` through the actual Supabase client/PostgREST API — this
entire session (and however long before it).** Every verification done
throughout this document was via `execute_sql`, which runs as an
elevated role that bypasses RLS *and* grants entirely — so a working
migration + a passing test-transaction here never actually proved a
real user could do the same thing. Confirmed directly by simulating a
real request (`SET ROLE authenticated` + a JWT claim) before the fix:
a plain `SELECT` against any kairo table returned `permission denied
for schema kairo`, not an RLS-filtered empty result — a categorically
different failure, at a layer beneath RLS.

Fixed via `grant_authenticated_access_to_kairo_schema`: `GRANT USAGE ON
SCHEMA kairo TO authenticated`, then `SELECT`/`INSERT`/`UPDATE` (never
`DELETE` — no table has a delete policy) on every table, matched
exactly to what each table's existing RLS policies already permit
(e.g. `attempts` gets `SELECT, INSERT` only — append-only, no update
policy exists; `questions`/`concepts` get `SELECT` only). Also set
`ALTER DEFAULT PRIVILEGES IN SCHEMA kairo` so a *future* table doesn't
silently repeat this exact gap. Grants go to `authenticated` only,
never `anon` — matches the documented "no anonymous path" design.

This also exposed a related bug in `kairo.get_challenge_leaderboard()`
(§5e): it was `SECURITY INVOKER` (the default), so even with grants
fixed, a real authenticated caller would only ever see their *own* row
through it — the "own row only" RLS on `challenge_attempts`/`students`
applies inside a SECURITY INVOKER function exactly as it would to a
bare SELECT. Fixed in `fix_challenge_leaderboard_security_definer`:
marked `SECURITY DEFINER` with a pinned `search_path` (avoiding the
same `function_search_path_mutable` advisory already flagged on the
legacy `public.*` functions), `EXECUTE` revoked from `public` and
granted only to `authenticated`.

**Verified end-to-end**, not just re-read: created two throwaway
students + a challenge + attempts, simulated a real authenticated
request with a JWT `sub` matching neither student, and confirmed (a) a
direct `SELECT` on `challenge_attempts` now succeeds with 0 rows (RLS
correctly restricting instead of a permission error), and (b)
`get_challenge_leaderboard()` still returns both rows correctly ranked
regardless of caller identity. Test fixtures cleaned up after.

## 6. What is still NOT done

- ~~The onboarding subject picker offers 8 subjects but only 4 have
  seeded content, and one doesn't match by name~~ — **naming bug
  closed, scope kept.** The picker said `'English'`; the seeded/canonical
  subject string is `'Use of English'` (JAMB's actual subject name),
  so `loadContentCatalog()`'s exact-string filtering silently returned 0
  concepts for a student who picked "English." Fixed the string
  consistently everywhere it appeared as bare `'English'`:
  `OnboardingEngine`'s picker, `CBTExamMode.JAMB_QUESTION_COUNT` (this
  one was a second live bug — the 60-question JAMB rule for English
  silently fell back to the 40-question default for the same reason),
  and `ContentPackManager`'s mock catalog. All 8 subject options stay
  selectable — UTME combinations genuinely vary by course (Law needs
  Government/Literature, etc.), so trimming would break course paths the
  onboarding `'goal'` step already offers. Mathematics/Government/
  Economics/Literature still seed 0 concepts today since no content
  exists for them yet — a real content gap, not something this fix
  papers over, and already handled cleanly (no crash).
- ~~The onboarding diagnostic quiz has no code path that selects real
  questions to ask~~ — **closed.** `OnboardingEngine.getDiagnosticQuestions(count)`
  (call once the `'subjects'` step is submitted) loads the real catalog
  and picks live questions spread across the student's chosen subjects,
  biased toward the easiest available per subject — a diagnostic, not a
  challenge. Returns the same flat consumer shape (`.text`/`.options`)
  as `getQuestionForConcept()`/CBTExamMode. `submitStep()`'s handling of
  the answered results is unchanged — the caller still drives rendering
  and answer capture, this only supplies which real questions to ask.
- ~~Onboarding module state has no Supabase table at all~~ — **closed.**
  `OnboardingEngine.toJSON()`/`fromJSON()` existed but were never
  actually snapshotted onto the profile (unlike reEngagement/
  crossModuleMilestones/continuation/comms/learn, which all follow this
  exact pattern) — a student closing the app mid-onboarding always
  restarted at step 0, silently losing name/goal/exam date/subjects
  already entered. Fixed in `index.js`'s `_snapshotSjeeState()`/`init()`
  + `kairo.students.onboarding` (migration
  `add_onboarding_state_to_students`). Also fixed a latent bug this
  exposed: `OnboardingEngine.fromJSON()` didn't guard against `data`
  being `undefined` (it never needed to before, since nothing called it
  from a live path) — would have thrown on every profile saved before
  this fix.
- ~~Leaderboard has no Supabase table at all~~ — **closed, and it was
  worse than "no persistence": `SegmentedLeaderboard`/
  `UniversityLeaderboard` were pure in-memory `Map`s scoped to a single
  engine instance.** `addStudent()`/`recordPractice()` only ever added
  the CURRENT student to their own empty, ephemeral registry — in any
  real deployment (a fresh engine per session), every student would see
  themselves ranked alone, always. No new table needed: `kairo.students`
  already carries everything ranking needs (`elite_score_history`,
  `streak_current_momentum`, `target_course`/`target_university`) via
  the existing profile sync, so this was purely a read-side fix — two
  new `SECURITY DEFINER` functions (`get_segmented_leaderboard`,
  `get_university_rankings`, migration `add_real_leaderboard_functions`,
  correctly `SECURITY DEFINER` from the start this time, learning from
  the `get_challenge_leaderboard` mistake in §5g). `getMyLeaderboard()`/
  `getUniversityRankings()` are now async and require
  `connectSupabase()`, matching `ChallengesModule`'s pattern.
  `addStudent()`/`recordPractice()` were removed from `endSession()` —
  they added no persisted value beyond what profile sync already does.
  Verified end-to-end with the same simulated-real-request discipline as
  §5g: 4 throwaway students, confirmed a real authenticated caller sees
  correctly ranked *other* students (not just themselves), and
  university aggregation is correct (3 students → avg score of the sum).
- **Review and Insights genuinely need no Supabase table** — both are
  pure derived-view layers with zero instance state (verified by reading
  both files fully: every method computes fresh from
  `engine.graph`/`engine.profile`, which already persist via
  `concept_states`/`kairo.students`). This was the one part of the
  original "no Supabase table" list that turns out to be correctly
  ephemeral, not a gap.
- ~~CBT Exam Mode's full paper/results detail has no Supabase table~~ —
  **closed.** New `kairo.cbt_results` table (migration
  `add_cbt_results_table`) carries the full per-question detail
  (question-level correctness/timing, subject breakdown, time analysis)
  `finish()` already computed but only ever summarized into
  `kairo.sessions`. `CBTExamMode.finish()` now queues a second item
  (`type: 'cbt_result'`, sharing its id with the paired session row);
  `SyncManager`/`SupabaseSyncAdapter.fullSync()` route it through a new
  `pushCbtResult()`, same pattern as sessions/attempts. Added
  `CBTExamMode.getResult(id)`/`getResultHistory(limit)` for the read
  side (§7.2-style result review — "review each question, the correct
  answer, and a brief explanation" needs the full detail, not the
  summary). Append-only, same RLS/grant shape as `kairo.attempts`.
- **`ChallengesModule.js`'s backend (§5e) is now real, admin-curated,
  event-based challenges** — but the module's UI-facing half is
  deliberately not built (see §5e for exactly what is/isn't done).
- ~~The notification stack is three non-interoperating layers, and the
  deeper two don't fit each other~~ — **reconciled.** `src/sjee/
  NotificationPipeline.js` is the missing glue: gathers candidates from
  `NotificationEngine` (refactored to a pure candidate source — see
  below), `ReEngagementEngine`, and `CrossModuleMilestones` (translated
  from its `{category, key, framing}` shape); submits them to
  `NotificationOrchestrator`; arbitrates; and resolves each approved
  candidate through `CommsService`/`TemplateEngine`. `KairoEngine.
  checkAndResolveNotifications()` runs the whole pass and returns
  `{candidate, resolved}` pairs ready for a transport (e.g.
  `OneSignalTransport`) — actual sending is still deliberately left to
  the caller, the same boundary `CommsService.resolve()` itself draws.

  The blocker really was the candidate-shape mismatch, not missing glue
  code — solved via `candidateToTemplateInput()`, which maps `{type,
  tier, title, body, action}` to `{category, data: {observation, action}}`
  by treating the **already-composed `body` as the `observation` fact
  verbatim** — no copy is split, reworded, or invented; every word a
  student sees was already written by whichever module generated the
  candidate. `type -> NotificationCategory` uses an explicit lookup
  table (e.g. `daily_recap` -> `academic_nudge`, `win_back` -> 
  `reengagement_winback`, any `milestone_*` -> `milestone_celebration`).
  `TemplateEngine.render()`'s own compliance/channel/voice-calibration
  logic still runs on top exactly as designed — this pass didn't bypass
  it, it made it reachable for the first time.

  One real (small, defensible) rule change was needed along the way:
  `TemplateEngine._buildSlots()` required an `action` for every category
  except Account & Administrative — but milestones and the post-exam
  acknowledgment are informational-tier by design (§7.5: "always
  Informational-tier... never competes for the frequency budget") and
  genuinely have no next action. Extended the exemption to any
  Informational-tier candidate, not just `account_administrative` —
  a reading already implied by the existing comment's phrasing, not a
  new rule invented from nothing. Without this, every milestone and the
  post-exam acknowledgment would have silently rendered to `null` forever.

  `NotificationEngine` is now a pure candidate source (matches §5.2's
  "NO module sends a notification directly"): `checkNotifications()` no
  longer self-queues into its own `queue`/delivers via `getUnread()`/
  `clearAll()` (removed — superseded by the real pipeline); `history`/
  `_wasNotified()`/`markAsRead()` remain, since one-time-event dedup
  (never re-firing `exam_6weeks`) is a genuinely different concern from
  the Orchestrator's time-window frequency budget.

  Verified end-to-end with a real pipeline run (not per-piece unit
  tests only): a genuinely fading concept produced a `daily_recap`
  candidate that survived generation → Orchestrator arbitration →
  `CommsService` resolution → real rendered push text, and separately
  confirmed the post-exam immediate window correctly suppresses that
  same candidate down to just the acknowledgment.

  **Still not done**: actually wiring `checkAndResolveNotifications()`'s
  output into `OneSignalTransport` needs a way to resolve a student to
  their OneSignal `external_id`, which doesn't exist as a profile
  concept yet — left for whoever wires the client-side subscription
  registration, since that's a decision about the actual device/app
  identity scheme, not something to guess at here.
- **`kairo.students` RLS/security posture is clean** — every advisory
  finding on this project is on the legacy `public.*` RoboMed tables
  and functions, unrelated to the `kairo` schema.
