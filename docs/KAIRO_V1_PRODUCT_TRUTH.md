# Kairo V1 — Product Truth

> This document governs the V1 rebuild. Every screen, feature, and prioritization
> call is checked against it before it's built. It does not specify screens,
> navigation, or visual design — those come after this is settled. It combines
> the technical inventory (`docs/ARCHITECTURE.md`, the repo audit) with product
> context from real student interviews.

## 1. What Kairo V1 Is

Kairo is not a quiz app with a knowledge graph bolted on. It is a **student
intelligence and learning system**. The engine (`src/`) already behaves like
one — retention states, decay curves, error classification, a journey model.
The problem V1 has to solve is that almost none of that intelligence is
currently *legible* to a student. The rebuild's job is exposure and
experience design, not new backend invention.

V1 exists to solve exactly two problems, well:

| Pillar | The student's problem | What "solved" feels like |
|---|---|---|
| **Clarity** | "I don't know where I am, what matters today, or what to do next." | "I open the app and I'm already looking at the one thing that matters right now, and I know why." |
| **Retention** | "I study things and then lose them. I can't tell if I actually understand something or just recognize it." | "What I keep is what actually stuck — and Kairo knows the difference before I do." |

Everything else — gamification, social features, exam simulation, admin
tooling — is real, built, and often good, but is **not** what makes V1
succeed or fail. Section 6 draws that line explicitly.

## 2. The Governing Test

Before any V1 feature, screen, or interaction ships, it has to answer yes to
at least one of these, and no to the third:

1. Does this make the student clearer about where they are, what matters
   now, or what to do next? *(Clarity)*
2. Does this help the student keep what they've learned, rather than
   re-discover it later? *(Retention)*
3. Is this only in scope because it existed in the old design-system's
   5-tab structure, not because it earns its place here?

A feature that fails 1 and 2 and passes 3 gets cut from V1, not redesigned.

## 3. Non-Negotiable UX Law: Recommend, Never Command

This is the single biggest behavioral commitment of the rebuild, and it is
already how the engine is built — the risk in a rebuild is a screen design
that accidentally makes it feel more rigid than the backend actually is.

- Kairo **recommends** a next action (`RecommendationEngine.buildSessionPlan()`,
  `ReviewModule.getPreSessionRecap()`) — it does not generate a locked
  timetable the student is failing if they deviate from.
- Every recommendation carries a **reason** the student can see in one
  sentence — the engine already computes this (`decision.reason` in
  `processAnswer()`, `AdaptiveDifficulty.explainTier()`, Kai's proactive
  session-open message) but almost none of it currently reaches a screen.
- The student can always choose a **different valid action** — practice a
  different subject, do a shorter session, skip today. The engine already
  supports this (Custom Practice, Topic Practice exist precisely so a
  student isn't boxed into the adaptive queue) — V1's job is making that
  choice feel like a real, respected option, not a hidden escape hatch.
- Missing a day **never** reduces Elite Score (`EliteScore` is explicitly
  decoupled from streaks) and never triggers guilt copy — `KaiRules` and
  `CommsConstants.BANNED_PHRASES` already hard-block "we miss you," "falling
  behind," "don't lose your streak," etc. at the template layer. V1 must not
  reintroduce that tone at the UI layer just because it's a common app
  pattern.
- Recovery is a designed re-entry, not a guilt screen: `MomentumStreak`'s
  protected gap days, `StudentProfile`'s Recovering macro-state (a
  deliberately softened, shorter reconnection session), and
  `ReEngagementEngine`'s content-or-silence rule (a nudge only fires with
  something real to point at — a genuine Fading concept — never a generic
  "come back" template) are the actual mechanism for this. V1 needs to
  surface this state, not build a new one.

## 4. Engine Capability → Pillar Map

This is the honest inventory of what already exists, organized by which
pillar it serves, and whether a student can currently see any of it.

### Clarity

| Capability | Where it lives | Exposed to a student today? |
|---|---|---|
| "What matters right now" queue | `RecommendationEngine.buildSessionPlan()` | No — no screen calls this and shows *why* a concept is queued |
| Pre-session recap ("here's what's urgent before you start") | `ReviewModule.getPreSessionRecap()` / `buildDailyRecap()` | No — fully built, zero UI consumer in the repo |
| Real-time dashboard (top/bottom subjects, urgent Fading count, next milestone) | `InsightsModule.getDashboardInsights()` | No |
| "Why this difficulty" explanation | `AdaptiveDifficulty.explainTier()` | No — method exists, nothing calls it |
| One clear score instead of scattered stats | `EliteScore` (45% accuracy / 35% retention / 20% consistency) | Partially — computed and persisted (`elite_score_history`), never shown with its one-sentence reason (`explainChange()`) |
| Session-end summary in plain language | `KairoEngine.endSession()` return shape, `ExplanationEngine` | No dedicated summary screen exists in the repo |
| Momentum without shame | `MomentumStreak.getStatus()` (protected gaps remaining) | No |
| Journey framing (arrival → establishment → intensification → …) | `sjee/JourneyStageTracker.js` | Correctly never shown directly, but should shape copy/tone — currently doesn't reach any UI at all |

### Retention

| Capability | Where it lives | Exposed to a student today? |
|---|---|---|
| Five-state retention memory model | `core/ConceptNode.js`, `RetentionState.js` | No — internal only, by design never shown as a raw label, but its *consequences* (what's due, what's fading) should be visible and aren't |
| Personalized forgetting curve | `core/DecayModel.js` | No |
| Revision folded into ordinary sessions (no separate "revise now" decision) | `memory/RevisionScheduler.js` | Architecturally correct, but nothing today shows the student *that* this is happening — it needs to be legible, not just true |
| Diagnoses *why* an answer was wrong | `engine/ErrorPatternClassifier.js` (6 tags) | Feeds Kai's response text per-answer; the aggregate pattern ("you tend to guess under time pressure") is never surfaced even though `MisconceptionLibrary.analyzeStudentPattern()` computes exactly that |
| Comprehension repair, not just re-attempt | `learn/LearnModule.js` | No dedicated UI; `ExplanationEngine` output (mental models, misconceptions, memory anchors) has nowhere to render |
| Questions that test the same concept in a different frame | `qim/QuestionRelationshipGraph.js` (`alternativeWording`, `higherDifficulty`, `bridge` relationships) | Built, essentially unused by any consumer — this is one of the most product-differentiating pieces of the engine and it currently does nothing visible |
| Practice as a diagnostic signal, not just a score | `CBTExamMode` (zero feedback until submission, then full breakdown), `Question.recordAttempt()` | Partially — CBT's invariant is correctly enforced, but the *review* of that breakdown has no screen |
| Reinforced-promotion discipline (Learn can close a gap, only Review can prove it survived forgetting) | `LearnModule.submitReinforcementAttempt()` cap at Held | Invisible mechanic, correctly so — but the *outcome* ("you got this back after forgetting it — that's real") is the single most motivating moment in the whole model and currently has no screen either |

**The pattern across both tables is the same finding:** the backend is not
missing intelligence. It is missing a mouth. Nearly every "invisible"
row above is a fully computed value with nowhere to render — V1's highest-
leverage work is building the small number of surfaces that expose what
already exists, not writing new logic.

## 5. The Smallest Coherent V1 Loop

Not a screen spec — a description of the one loop V1 has to get right, tested
directly against the interview stress-test:

1. **Open.** Kairo has already computed macro-state, journey stage, Fading
   concepts, and session plan. The student sees one clear "here's what
   matters today, and here's why" — sourced from `ReviewModule.getPreSessionRecap()`
   + `RecommendationEngine`, not a wall of stats. This directly answers "I
   over-read because I can't judge what I understand" — Kairo has already
   judged it.
2. **Choose.** The recommendation is a default, not an order. A visibly
   equal, easy alternative exists (different subject, shorter session, or
   "not today"). This directly answers "I have school/work/family and can't
   obey a rigid plan."
3. **Practice.** One adaptive loop. Per-answer feedback that names *why* an
   answer was right or wrong (`ErrorPatternClassifier` + Kai's response
   library) — not just correct/incorrect. Difficulty adapts per concept
   silently.
4. **Repair, inline.** A revealed gap doesn't send the student hunting
   through a menu — `LearnModule` is a detour inside the same flow, not a
   separate destination. This directly answers "I don't know whether to
   revisit, practise, move on, or review" — Kairo decides in the moment,
   the student isn't left holding that decision.
5. **Close.** A plain-language summary: what got Reinforced (survived
   forgetting — the real win), what's still Fading (named honestly, not
   hidden), Elite Score movement with its one-sentence reason. No raw
   percentage without a sentence attached, matching the design system's own
   existing content rule.
6. **Return, whenever.** Gap of a day or three: no guilt copy, a
   deliberately lighter reconnection session, an honest decay re-check
   ("some of this faded while you were away, and that's normal — here's
   where we start"), streak slack applied automatically. This directly
   answers "I need recovery, not punishment" and "emotional setbacks
   interrupt preparation."
7. **Reflect, lightly.** `WeeklyReflection` surfaces the retention narrative
   ("this is what actually stuck this week") on its own rhythm — not
   another daily obligation competing for attention.

Connectivity is a first-class constraint throughout, not an edge case: every
step above already has an offline-first path (`LocalStore` → `SyncManager`)
in the engine. V1 screens must never assume a live connection to render the
next recommended action.

## 6. What V1 Should Not Try to Be

These are real, working features. None of them are wrong to have built. None
of them should compete for space in V1's core loop or primary navigation.

| Feature | Why it's built and good | Why it's not V1-core |
|---|---|---|
| CBT Exam Mode | JAMB-accurate, zero-feedback invariant correctly enforced, full result detail persisted | A milestone/rehearsal moment for a student who is close to the exam (Peak Readiness / Intensification), not a daily-loop competitor. Belongs gated by journey stage or exam proximity, not a permanent primary tab. |
| Challenges Module | Real admin-curated event system, real leaderboard SQL, real anti-cheat | Explicitly documented as UI/discovery-surface-not-built even in the current backend log. A social/event layer — the interview context is about individual clarity and retention, not competition. Defer past V1. |
| Segmented / University Leaderboard | Real cross-student ranking, real backend | Comparative by nature — sits in tension with Kai's own hard rule to never compare a student to others in personal feedback. If it ships at all in V1 it should be quiet and opt-in, never a primary surface. |
| Levels / Badges / XP (`ProgressionSystem`) | Functioning gamification layer | Duplicates the job Elite Score already does, and the product's own positioning explicitly rejects "generic XP points" as a competitor's pattern (see `README.md`'s own comparison table). Risks re-introducing exactly what Kairo is supposed to not be. Candidate to cut from V1 surface entirely, or reduce to one quiet signal (streak) rather than a parallel scoring system. |
| Four separate practice entry points as equal top-level choices (Standard, RapidFire, Custom, Topic) | Each is real and has a purpose | Four parallel "which kind of practice do I want" decisions is decision fatigue, the exact thing V1 is supposed to reduce. V1 should have one clearly recommended practice action; the other modes become secondary, opt-into choices, not co-equal navigation items. |
| Full 5-channel notification/consent UI (push, in-app, WhatsApp, email, SMS) | Real, tested backend (`comms/`), correctly consent-gated | V1 needs a light "can we nudge you" moment, not a settings page enumerating five channels and per-category preferences on day one. The backend already defaults to silence when consent is unset — V1 can lean on that rather than force the full picker up front. |

## 7. Preserve — Non-Negotiable Engine Logic

Carried forward from the technical inventory, reconfirmed against this
product context. Refactor the code shape freely; do not refactor away the
rules themselves without a demonstrated bug:

- Retention FSM and its exact transition conditions (`core/ConceptNode.js`,
  `RetentionState.js`)
- Decay model and its formulas (`core/DecayModel.js`)
- Recommendation Engine's priority scoring and interrupt logic
  (`engine/RecommendationEngine.js`)
- Error Pattern Classifier and its tag-ordering rules
  (`engine/ErrorPatternClassifier.js`)
- The Learn/Review distinction, specifically the Reinforced-promotion cap
  (`learn/LearnModule.submitReinforcementAttempt()`)
- Revision Scheduler and the "no separate revision tab" principle
  (`memory/RevisionScheduler.js`)
- Question Intelligence Model in full — lifecycle gates, relationship
  graph, misconception library (`src/qim/`)
- CBT Exam Mode's zero-feedback-until-submission invariant
- Supabase RLS, anti-cheat triggers, and the "no anonymous path" model
- Sync/offline architecture and its conflict-resolution rule (most recent
  wins for state, all attempts retained)
- All four student state models (Macro-State, Emotional Profile, Learning
  State, Journey Stage) and their priority orderings
- Notification frequency budget, consent hierarchy, and default-deny
  posture (`sjee/NotificationOrchestrator.js`, `comms/ConsentManager.js`)
- Kai's voice safety constraints (`utils/constants.js` `KaiRules`,
  `CommsConstants.BANNED_PHRASES`)

## 8. Confirmed Safe Refactors

From the technical inventory, still valid and now prioritized by whether V1
actually depends on them:

- **Session-lifecycle inconsistency** (RapidFire/CBT/Custom/Topic each
  queueing sync differently outside `engine.currentSession`) — **should be
  fixed before or during V1**, since V1's "close" step (§5.5) depends on
  every practice mode reliably reaching Supabase the same way.
- `LevelSystem.calculateXP()`'s `concept.state` vs `.retentionState` bug —
  low priority if Levels/XP end up cut from V1's surface per §6; fix if
  the system stays even as a background computation.
- Missing `RetentionState` import in `DecayModel.getDueConcepts()` — small,
  isolated, fix regardless.
- `StudentProfile` ↔ `SupabaseSyncAdapter` ↔ live-schema field-mapping
  duplication — worth resolving before V1 adds new persisted fields (e.g.
  whatever a "why" explanation surface ends up needing), since every
  historical silently-dropped-field bug traces back to this exact pattern.
- Duplicated `BADGE_CATALOG` in the Deno Edge Function — low priority,
  tied to whether badges survive in V1 at all.

## 9. Presentation Layer — Fully Replaceable

`design-system/` and `design-system/ui_kits/kairo-app/` remain what the
technical inventory found: disconnected from `src/`, built from screenshots
and specs with no live-codebase reference, holding no state. Free to
redesign completely for V1. The one thing worth carrying forward is
content, not code: the existing voice/copy rules (no raw metric without a
one-sentence reason, sentence case, no comparative language, gold reserved
for genuine achievement) already agree with everything in this document and
don't need to be re-derived.

## 10. Kai's Instructional Philosophy — What Already Exists vs. What's Missing

| Instructional principle | Existing mechanism | Gap |
|---|---|---|
| Mechanism before jargon | `ExplanationEngine.generate()`'s ordered parts (reasoning before terminology) | None found — matches |
| Concrete mental models / relatable examples | `Question.explanation` content + `MisconceptionLibrary` distractor mapping | Content depends entirely on question-bank authoring quality, not engine logic — a content gap, not a code gap |
| Real-world connections where useful | Not a distinct explanation-part type today | `ExplanationEngine`'s part list (reasoning, distractor breakdown, common mistake, exam tip, memory anchor, related concept, follow-up) has no explicit "real-world analogy" slot — worth adding if authored content is meant to lean on this |
| Distinguish understanding from memorization | The entire retention FSM + `ErrorPatternClassifier`'s `guessed`/`careless_slip` tags | This is the engine's core strength — already the most-built part of the philosophy |
| Survive rearranged/tweaked questions | `QuestionRelationshipGraph`'s `alternativeWording`/`higherDifficulty`/`bridge` relationships | Built, essentially unused (see §4) — this is the direct mechanism for teaching transferable understanding rather than pattern-matching, and it's currently inert |
| Exam hacks only when they genuinely help | `ExplanationEngine`'s dedicated `examTip` part | Exists as a distinct, optional slot — matches the "only when it helps" framing already |
| Conversational, direct, mentally engaging | `KaiBehavior.js` response library, `KaiRules` | Matches |
| Avoid noisy / childish / excessive slang | `design-system` voice guidelines + `CommsConstants.BANNED_PHRASES` | Matches — this is content-authoring discipline more than code, and the rules already exist to hold authors to it |

The single clearest opportunity in this table: **`alternativeWording` and
related question-relationship types are built and completely unused.**
Wiring them into Practice/CBT ("here's the same idea, asked differently —
if you get this too, you actually understand it") is one of the most direct
ways to make "survive rearranged questions" a real, felt part of V1 rather
than an aspiration.

## 11. Open Questions for the Rebuild

Deliberately left open here — decisions for screen/navigation design, not
this document:

- Does Review remain a distinct primary destination, or fold into Home per
  `docs/ARCHITECTURE.md` §8's "there is no revision tab" principle? The
  old design-system's 5-tab structure (Home/Practice/Review/Insights/Profile)
  contradicts this stated principle and should not be assumed as V1's nav.
- Where, if anywhere, does CBT Exam Mode sit in V1 navigation — gated
  behind journey stage/exam proximity, or a standing but secondary entry
  point?
- Do Challenges and Leaderboard ship in V1 at all, even in reduced form, or
  wait for a post-V1 release?
- Does any gamification surface (streak count, badges) survive in V1 given
  Elite Score already carries that job, or does V1 lean entirely on Elite
  Score + retention language?
- What is the minimal, honest consent moment for V1 — a single
  "can we send you a nudge sometimes" prompt, deferring category-level
  granularity to Settings rather than onboarding?

## 12. What This Document Is Not

Not a screen spec. Not a navigation structure. Not a sprint plan. It is the
filter every one of those gets built against next.
