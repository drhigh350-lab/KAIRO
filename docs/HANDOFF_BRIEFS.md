# Kairo — Handoff Briefs

Two ready-to-send briefs: one for the product designer (consent flow), one
for whoever builds the frontend (wiring the real backend in). Copy each
section as-is, or trim before sending.

---

## 1. For the product designer — consent flow

**Subject: Consent flow needed — push/email notification backend is live, waiting on this**

The backend for push (OneSignal) and email (Resend) notifications is fully
built and deployed — streak reminders, achievement emails, daily recaps,
exam alerts, etc. all work end-to-end and are tested. But **nothing will
ever send to a real student** until there's a UI moment that captures
their consent. Right now every student's consent record is empty, and the
system is deliberately built to stay silent rather than guess — so this is
the one missing piece standing between "built" and "live."

**What needs designing:** a consent flow with two layers (already defined
in the existing Notifications & Comms spec, §10):

1. **Channel-level permission** — does the student allow push at all?
   Email? WhatsApp? SMS? The spec's existing guidance: **arrival/onboarding
   should only ask for one baseline channel (typically push)** —
   email/WhatsApp/SMS should be requested *separately and opportunistically*
   later, never bundled into one blanket "allow everything" prompt at
   signup.
2. **Category-level preference, per channel** — once a channel is allowed,
   does the student want *this kind* of message on it? The categories that
   exist today: daily recap/academic nudges, streak & consistency
   reminders, milestone/achievement celebrations, exam-critical alerts,
   re-engagement/win-back messages, and editorial/broadcast
   (marketing-style) content. Default is opt-in once a channel is granted,
   but a student can turn any category down — never up beyond what the
   product would otherwise send.

**Also needed somewhere in Settings:** a way to revoke a channel entirely
(hard stop) and see/change category preferences per channel — this
doesn't need to be built on day one, but the data model already supports
it.

**What I need back from this:** the actual screens/copy/timing (when in
onboarding, what it looks like, what language is used to ask) — that's
entirely your call. Once that flow exists and calls the profile's
consent-update method with the right values, the whole pipeline turns on
automatically. No backend changes needed on my end once that's designed.

---

## 2. For the frontend engineer — wire the real backend in

**Subject: Wire the frontend to the real Kairo backend — it's currently a static site sitting on top of a fully built engine**

Right now `kairo-app` (the deployed Cloudflare Worker) only serves static
assets — nothing on it is actually calling the backend. Every piece
described below already exists, is tested, and is live. This is an
integration job, not something waiting on new backend work.

### 1. Bootstrap — auth, engine, content

```js
import { KairoEngine } from 'kairo-learning-engine';

const engine = new KairoEngine({ studentId, name, examDate, targetSubjects, targetCourse, targetUniversity });
await engine.init();                                    // loads local IndexedDB state
await engine.connectSupabase(supabaseClient, { email, password }); // real Supabase auth + kairo.students row
await engine.loadContentCatalog({ subjects: engine.profile.targetSubjects }); // real questions/concepts from kairo.questions/concepts
```

`connectSupabase()` is what turns this from a local-only demo into a real
account — it authenticates against Supabase Auth and links
`kairo.students.auth_user_id`. Everything past this point reads/writes
real rows, gated by the RLS policies already in place (a student only
ever sees their own data).

### 2. Practice sessions

All of these return a session plan of real questions once the catalog is
loaded:

```js
engine.startSession({ mode: 'standard' })
engine.startRapidFire(options)
engine.buildCustomPractice(options) / engine.startCustomPractice(options)
engine.startTopicPractice(subject, topic, subtopic, count)
engine.cbt.setup(subjects)   // CBT Exam Mode — JAMB-accurate question counts, no live feedback mid-attempt
engine.submitAnswer({...}) / engine.submitRapidFireAnswer(answer)
engine.endSession()
```

None of this should be hardcoded question data — `getQuestionForConcept()`
/ the catalog loader are the only source of truth.

### 3. Profile & progress screens

```js
engine.settings.getProfile() / engine.settings.updateProfile(updates)
engine.getLevelProgress()      // XP, level, tagline
engine.getBadges()             // earned badges
engine.getStreakStatus()       // momentum streak
engine.getWeeklyReflection() / engine.getMonthlyWrapped()
engine.getEliteScoreTrend()
engine.settings.getLearningJourney()   // subject/topic/subtopic mastery tree
```

### 4. Leaderboard & Challenges

Real cross-student data, not mocked:

```js
engine.getMyLeaderboard(limit) / engine.getUniversityRankings(limit)
engine.challenges.createChallenge(...) / joinChallenge(...) / finishChallenge(...) / getLeaderboard(...)
```

### 5. Learn / Review

```js
engine.learn.fromIncorrectAnswer(...) / completeLesson(...)
engine.review...  // spaced repetition surfacing
```

### 6. Onboarding

```js
engine.startOnboarding() / engine.submitOnboardingStep(input) / engine.completeOnboarding()
engine.onboarding.getDiagnosticQuestions(count)  // real questions for the diagnostic, not filler
```

State now survives a closed app mid-onboarding — no need to build your own
draft-saving.

### 7. Notifications — the two things this actually needs from the frontend

- **OneSignal SDK registration**: once the client registers a device
  subscription and gets an `external_id` back, call
  `engine.settings.updateProfile({ pushExternalId })` — this is the one
  link the backend cannot create itself.
- **Consent UI**: see brief #1 above — once that flow exists and sets
  consent via the engine's comms/consent methods,
  `engine.sendNotifications()` (server-side trigger) and the daily Resend
  email cron both activate automatically.

### 8. Already wired, not your job

The materials/booster PDF checkout (`materials.html` → `pay-initiate` →
Paystack → `pay-webhook` → Resend download email) is a separate,
already-functioning flow on the marketing site — nothing to touch there.

### What to explicitly stop doing

Anything currently rendering mock/hardcoded questions, fake leaderboard
rows, static badge lists, or a fake streak counter — all of it has a real
backend source now. If a screen shows data, it should be coming from one
of the calls above.
