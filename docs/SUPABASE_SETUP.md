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

## 6. What is still NOT done

- **Anti-cheat / write validation on `kairo.attempts` and
  `kairo.sessions`.** RLS currently only checks *ownership*
  (`student_id` belongs to the caller), not plausibility (e.g.
  someone editing client code to submit a fabricated "correct: true"
  attempt). RoboMed's `public.*` tables have similar exposure today,
  mitigated there by triggers like `check_player_before_update`. No
  equivalent trigger exists yet for `kairo.*` — flagged, not built,
  pending a product decision on how strict to be.
- **`kairo.questions` and `kairo.concepts` are empty.** Nothing has
  seeded real UTME questions or concept nodes into this schema yet;
  the tables and their QIM-shaped columns exist, but the actual
  curriculum content is a separate content-population task.
- **No admin/service-role tooling** for writing to `kairo.questions`
  / `kairo.concepts` (both are read-only to authenticated clients by
  design — see the RLS policies). You'll need either the Supabase
  dashboard's SQL editor, or a small script run with the service role
  key, to populate them.
- **Review, CBT Exam Mode, Challenges, Insights, Leaderboard,
  Progression (levels/badges), and Onboarding module state have no
  Supabase table at all** — they're entirely local/in-memory today
  (some of that may be fine to stay ephemeral or purely derived from
  `attempts`/`concept_states`; some of it may not). This needs a
  product/engineering decision on which of those genuinely need
  server-side persistence before any schema work happens — not
  something to guess at silently.
- **Two parallel notification systems exist**: the legacy
  `src/notifications/NotificationEngine.js` (in-memory candidate
  generation, now correctly persisting to
  `kairo.students.notification_history`) and the spec-accurate
  `src/sjee/NotificationOrchestrator.js` + `src/comms/*` pipeline
  built later per the SJEE and Notifications & Communication Systems
  specs. They were never reconciled — worth a deliberate decision on
  consolidating rather than leaving both live.
- **Rapid Fire / Custom Practice / Topic Practice / CBT sessions don't
  queue a `kairo.sessions` row** — only the core `startSession()` /
  `submitAnswer()` / `endSession()` loop does. Each of those engines
  would need its own `sync.queue({ type: 'session', ... })` call at
  its own completion point.
- **`kairo.students` RLS/security posture is clean** — every advisory
  finding on this project is on the legacy `public.*` RoboMed tables
  and functions, unrelated to the `kairo` schema.
