# KAIRO Phase 2 Roadmap

## Purpose

The pasted product review points toward one strategic outcome: KAIRO should become an exam-preparation operating system, not only a question bank or CBT interface. The differentiator is the intelligence loop:

> Question → mistake → concept → mastery → personalised drill → mock → readiness → next action.

This roadmap turns that direction into an implementation sequence that respects the current repository. It deliberately prioritises a few connected capabilities over adding many disconnected screens.

## What already exists in the repository

KAIRO already has meaningful foundations for the proposed direction:

| Capability | Current foundation |
|---|---|
| Personalised recommendations | `kairo-learning-engine/src/engine/RecommendationEngine.js`, pinned dashboard recommendations, focused sprint/frontier push/UTME mix |
| Concept and mastery graph | `KnowledgeGraph`, `ConceptNode`, retention states, decay model, adaptive difficulty |
| Mistake repair | mistake ledger, 72-hour cooling, `Review`, mistake patches, learn-from-incorrect-answer flow |
| CBT | setup, instructions, timed exam, palette/flags, calculator, review, summary, server-backed result flow |
| Daily planning | planner engine, syllabus taxonomy, SRS tiers, offline-first planner state |
| Offline operation | IndexedDB/local engine store, queued sync, content-pack manager, online reconciliation |
| Competition | Arena, challenges, public links, guest attempts, leaderboard surfaces |
| AI teaching | Kai explanation and learning flows, `LearnModule`, question-aware explanations |
| Onboarding and profile | onboarding flow, target subjects/course/exam date, profile/settings |

The work is therefore an integration and depth programme, not a greenfield rebuild.

## Delivery sequence

### Cross-cutting reliability hardening

**Status: first P0 slice implemented.**

Session restoration now has a hard 12-second boundary with retries, shared Practice/CBT catalog loading has a hard 15-second boundary that clears the shared promise, cold-boot recommendation prefetch waits briefly for the first UI to settle and prepares one queue instead of four, and the splash screen no longer adds a fixed 1.4-second delay after slow restoration. The remaining audit should add contextual slow/error/offline states to high-traffic screens, verify duplicate-tap protection across async actions, and run the CBT interruption matrix under slow/offline/refresh conditions.

### Phase 1 — Mission Control and truthful personalisation

**Status: started in this change.**

The home experience should answer “what should I do next?” using only signals KAIRO can support today. The first slice adds a Mission Control panel that reuses the pinned recommendation, today’s real progress, exam countdown, and repair queue. It must never display invented mastery or readiness numbers.

Next engineering steps:

1. Persist a structured daily mission record, including the recommendation snapshot, completion state, and the source signal that caused each task to be selected.
2. Add a pure readiness calculator over observed data: accuracy, speed, consistency, exam endurance, and coverage. Each dimension must have a minimum-data threshold and an explicit “still gathering data” state.
3. Add concept-level drill generation that consumes `DashboardOption` and repair-queue signals rather than creating a second recommendation system.
4. Add a post-session explanation of what changed: mastery movement, repair count, speed trend, or coverage movement.

### Phase 2 — Mistake intelligence and KAIRO Teach

**Status: foundation exists; depth remains.**

Build the complete closed loop: mistake classification → targeted explanation → worked example → similar question → harder/trap question → mastery check. Reuse the existing `ErrorPatternClassifier`, `ExplanationEngine`, `LearnModule`, question relationship graph, and review ledger.

Engineering work that can be done in-repo:

- Group mistakes by subject, topic, concept, and error tag.
- Add a “Why you are losing marks” view with sample size and confidence thresholds.
- Add a repair-session state machine and progress tracking.
- Add explicit “same mistake again” and “weakness resolved” outcomes.
- Add tests for error classification, repair selection, and mastery verification.

### Phase 3 — Exam Day Mode and pressure simulation

**Status: CBT foundation exists; pressure layer is new.**

Keep the existing CBT flow, then add named simulation profiles rather than changing ordinary practice:

| Profile | Behaviour to implement |
|---|---|
| Normal conditions | Standard JAMB-style paper and timer |
| Behind schedule | Injects a time-pressure event and records recovery behaviour |
| Difficult English | Uses a selected paper composition and time profile |
| High pressure | Full paper with stricter interruption and review constraints |

The important output is not just a score. The summary should distinguish knowledge loss from time-management loss using observed timing and unanswered/changed answers. Exact question counts, subject distribution, calculator rules, and timing must be confirmed against the current official exam specification before production release.

### Phase 4 — Readiness profile

**Status: first evidence-contract slice implemented.**

The engine now exposes a structured readiness profile with Knowledge/Mastery, Accuracy, Speed, Consistency, Retention, Exam Endurance, subject risks, evidence counts, confidence states, and an explicit overall status. The Profile/Insights screen shows the dimensions and explains what KAIRO knows, what remains provisional, and what evidence should be collected next. Sparse students see a baseline state rather than a fabricated score, and overall demonstrated performance remains unavailable until the stronger evidence gate is met.

Create a readiness profile with dimensions that are honest about evidence:

- Knowledge: concept mastery and syllabus coverage.
- Accuracy: recent, weighted accuracy by subject/topic.
- Speed: response-time distribution by question type and difficulty.
- Consistency: variance across recent sessions.
- Endurance: performance decay across longer sessions and mocks.

No score should be shown until the minimum evidence threshold is met. The profile should produce risks and recommended next actions, not a single opaque number only. The current demonstrated-performance estimate is intentionally a provisional engineering placeholder until the official JAMB calibration and subject-combination model are approved; it must not be marketed as an official score predictor yet.

### Phase 5 — Content graph expansion

**Status: requires product/content work.**

Extend the existing question → concept → topic → syllabus objective metadata model to every major UTME subject. The app code can support new subjects, taxonomy validation, import tooling, migration templates, and coverage dashboards. The actual questions, explanations, diagrams, provenance, licensing, and editorial review cannot be safely invented by engineering.

### Phase 6 — Classroom and teacher workflows

**Status: requires product, privacy, and backend decisions.**

Build teacher/classroom entities, invitations, role-based access, assignments, class analytics, and generated assessments only after the following are decided: teacher identity model, student consent, retention/deletion rules, school ownership, permissions, and whether centres can administer multiple cohorts.

### Phase 7 — Arena depth and social competition

**Status: Arena V1 exists.**

The repository can safely extend Arena with skill-based matchmaking, friend battles, school competitions, tournaments, seasons, and subject rankings. Production rollout requires moderation rules, abuse reporting, anti-cheat policy, leaderboard privacy, and the definition of what “anonymous national ranking” means.

### Phase 8 — Offline completeness and reconciliation hardening

**Status: strong foundation exists; needs an audit.**

Audit every student-facing capability against the offline contract: downloaded subjects, question images, explanations, history, bookmarks, mistakes, planner, and CBT. Then test conflict cases: two devices, repeated submissions, changed question content, deleted questions, and interrupted sync. The current IndexedDB and sync architecture should be extended rather than replaced.

## Work KAIRO engineering can do autonomously

- Add pure TypeScript/JavaScript calculators and tests.
- Add UI surfaces using existing tokens and components.
- Wire existing engine signals into dashboard, review, insights, and post-session screens.
- Add route-level flows for pressure simulations and readiness details.
- Add migration files and typed API contracts after the data model is approved.
- Add import validation and taxonomy tooling for new subjects.
- Improve offline tests, sync reconciliation, and content-pack diagnostics.
- Prepare pull requests and reviewable commits.

## Decisions and inputs needed from you

| Area | Decision or material needed |
|---|---|
| Official exam behaviour | Confirm the exact JAMB subject distributions, duration, calculator policy, navigation rules, and any pressure-simulation boundaries KAIRO may claim to reproduce. |
| Content expansion | Choose the next subjects, provide or approve the question/explanation sources, and confirm licensing/editorial review ownership. |
| AI tutoring | Choose the production model/provider, budget, privacy posture, prompt/content review process, and whether student answers may be sent to an external provider. No API key should be committed to the repository. |
| Readiness score | Approve the user-facing meaning of “ready”, the target-score relationship, the minimum evidence required before displaying each dimension, and the official calibration mapping from observed subject performance to an approximate UTME score. |
| Classroom | Decide whether the first customer is an individual teacher, tutorial centre, or school; define roles, invitations, consent, analytics visibility, and data retention. |
| Competition | Approve moderation, anti-cheat, age/safety, school ranking privacy, and tournament rules. |
| Admission information | Choose a maintained source or data owner for universities, courses, cut-offs, and admission guidance. |
| Production operations | Confirm the Supabase project/deployment workflow, observability expectations, notification providers, and any legal review required before launch. |

## Recommended next decision

The next product decision should be the **readiness profile contract**: which metrics are shown, their evidence thresholds, and the language used when KAIRO is still learning about a student. Once that contract is approved, the engineering work can implement the calculator and connect it to Mission Control without inventing a misleading readiness score.

## Verification rule

Every new personalisation feature must answer three questions before release:

1. What real student evidence powers this output?
2. What happens when there is not enough evidence?
3. Can the student understand and act on the recommendation?

If any answer is unclear, the feature remains in an explicitly labelled “gathering data” state rather than presenting a fabricated metric.
