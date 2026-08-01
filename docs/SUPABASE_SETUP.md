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

- `sync.queue({ type: 'attempt', data })` — called automatically by
  the engine (e.g. after `submitAnswer`) to mark something as
  pending.
- `sync.sync()` — no-ops with `{ status: 'offline' }` if either the
  browser is offline or no adapter/engine has been attached yet
  (i.e. before `connectSupabase()` has succeeded). Once connected, it
  runs `SupabaseSyncAdapter.fullSync()`: pushes the local profile,
  concept states, and any queued attempts, then pulls the
  authoritative remote copies back.
- Conflict rule (unchanged from the original design): most recent
  `lastSeenAt` wins for concept *state*; all attempts are retained
  (`kairo.attempts` is intentionally append-only — no UPDATE/DELETE
  RLS policy exists for it).

## 5. What is NOT done yet

- **`kairo.students` is missing columns for the Student Intelligence Model
  §1 Identity fields** added to `StudentProfile.js` (age/DOB, exam type,
  exam year, target UTME score, subject combination detail, registration
  date, study duration/period preferences, device info, referral source,
  parent/guardian contact, language/region) — these currently only exist
  in the JS layer and `LocalStore`, not in the live schema. Needs a
  migration before `connectSupabase()`'s profile sync will carry them
  through.
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
