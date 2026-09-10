# KAIRO ARENA V1 — Functional Implementation Plan

## Product decision

The product is **KAIRO ARENA**, not JAMB Quest Arena and not a standalone quiz-sharing prototype. Arena is KAIRO’s competitive participation layer. The product architecture will keep three distinct but connected concepts:

| Concept | Purpose | Example |
|---|---|---|
| **Quiz** | The academic content object containing canonical questions | Genetics Mastery |
| **Challenge** | A competitive activity built from a quiz | Genetics Under Pressure |
| **Event** | A larger organized competition containing one or more challenges | KAIRO Biology Cup |

The implementation will use the existing KAIRO question, learner, progression, and analytics infrastructure. It will not create a second question engine or a parallel XP/streak system.

## What the current code already provides

The repository already has a useful authenticated Challenge Mode foundation. It loads challenge records from `kairo.challenges`, fetches playable questions through `get_challenge_questions_safe`, creates attempts through `join_arena_challenge`, submits answers through the server-scored `submit_arena_attempt` RPC, and retrieves challenge leaderboard rows. The client also has a challenge preview, gameplay, results, share/copy controls, and a Home entry point.

The seeded Arena work adds Arena Home, discovery, community quiz creation, and community-question APIs. These are useful building blocks, but they currently behave as an authenticated partial flow rather than the complete Arena V1 loop.

## What must be preserved

The following behavior should remain intact while Arena is expanded:

1. Canonical question IDs remain the source of challenge questions; question data is not duplicated into a second engine.
2. Answer keys remain server-protected during gameplay. The safe question RPC must continue to exclude correct answers.
3. Final scoring and leaderboard placement remain server-authoritative through the existing scoring RPC.
4. Existing KAIRO Points, streak, profile, practice, and learning systems remain the systems of record.
5. Existing shareable challenge links and authenticated challenge attempts continue to work.
6. Official content and community content remain visibly and conceptually separate.

## V1 functional loop

The definition of done is:

> A learner receives a challenge link, opens that challenge directly, plays without registration, answers persist through refresh where possible, the challenge finishes or expires, the learner sees an accurate result and placement, shares the challenge or result, and another learner can open and play it. An authenticated learner’s performance feeds KAIRO progression and learning data.

### P0 implementation order

| Priority | Work | Acceptance criteria |
|---|---|---|
| P0.1 | Live schema/RPC audit | Confirm actual challenge, attempt, question, auth, analytics, progression, and policy definitions before adding migrations or RPCs. |
| P0.2 | KAIRO ARENA information architecture | Home, Discover, Challenges, Create, and Profile entry points; no prototype-only social tabs. |
| P0.3 | Guest challenge entry | A guest can open a valid challenge link, receive a temporary session identity/nickname, and start without registration. |
| P0.4 | Durable attempt state | Answers, current question, start timestamp, and attempt status survive refresh/network interruptions using the safest existing storage/backend path. |
| P0.5 | Canonical timer and expiry | The challenge’s server timestamps determine whether play can begin and whether submission is accepted. Client countdown is display logic only. |
| P0.6 | Results and placement | Score, percentage, correct/incorrect count, time, challenge placement, and honest guest placement language are shown immediately. |
| P0.7 | Share loop | WhatsApp first, then native share, then copy link; share events are recorded without requiring registration. |
| P0.8 | Deep links and dead-end funnels | Stable challenge slug URLs open directly; ended, invalid, and deleted challenges show branded recovery states with Live Challenges and Practice Topic CTAs. |
| P0.9 | Analytics | Instrument view, play, guest start, challenge start, answer, completion, abandonment, result, rank, share, registration, and migration events using the existing analytics architecture. |
| P0.10 | KAIRO learning integration | Authenticated attempts contribute questions attempted, answers, correctness, time, topics, completion/abandonment, score, and repeat participation to existing progression data. |

### P1 after the loop is reliable

Recommended For You based on weak topics, richer Discover filters, live/cached participation counts, creator profiles, subject arenas, basic achievements, friend challenges, and a lean activity feed can follow once P0 is verified. Rankings should remain challenge-accurate; global rankings and divisions should only be shown if the live schema genuinely supports them.

### Defer

DMs, comments, clubs, complex follows, tournaments, rewards marketplaces, AI-generated challenges, elaborate referral systems, and any new social graph should not block Arena V1.

## Question creation and bulk import

Manual question entry should not be the primary creator workflow. The attached KAIRO ARENA format is suitable as an authoring format because it is readable, editable, versionable, and easy to generate in bulk. The application should support **Markdown import as the friendly authoring layer**, while the backend stores normalized structured question records.

The import workflow should be:

1. Creator opens **Create Quiz**.
2. Creator downloads the official Markdown template and a short example file.
3. Creator uploads one `.md` file containing one or more questions.
4. The parser splits question blocks and validates every required field.
5. The UI shows a row-level preview and error list before anything is submitted.
6. Creator can edit individual parsed questions, delete/reorder them, or upload a corrected file without losing the draft.
7. Valid questions are saved as a draft/import batch.
8. Submission moves the quiz and its community questions into moderation; imported content does not enter the official question bank automatically.
9. Once approved, the quiz can be published and converted into a Challenge.

### Recommended Markdown format

```md
# KAIRO ARENA QUESTION

Question: Which organelle is primarily responsible for aerobic respiration in a cell?

A. Ribosome
B. Mitochondrion
C. Golgi apparatus
D. Lysosome

Correct Answer: B

Explanation: The mitochondrion is the main site of aerobic respiration in eukaryotic cells and produces ATP through the major stages of cellular respiration.

Option A: Ribosomes synthesize proteins; they are not the main site of aerobic respiration.
Option B: Correct. Mitochondria carry out the major stages of aerobic respiration and ATP production.
Option C: The Golgi apparatus modifies, sorts, and packages proteins.
Option D: Lysosomes digest unwanted materials and cellular components.

Hint: Think about the organelle associated with releasing usable energy from food.

Subject: Biology
Topic: Cell Biology
Subtopic: Cell Organelles
Difficulty: medium
Year: 2024
Source: KAIRO content team
Image: optional/path-or-upload-id

---
```

The parser should also accept the exact section-heading style in the supplied format. The canonical internal representation should contain the stem, exactly four labeled options, one correct option, explanation, distractor explanations, hint, subject, topic, subtopic, difficulty, optional year/source/image reference, creator ID, import batch ID, and moderation status.

### Import validation rules

The first validation pass must reject missing fields, non-A–D answer keys, duplicate questions within the batch, invalid subjects/topics/difficulty values, empty options, fewer or more than four options, multiple correct answers, unsupported image references, and malformed blocks. It should also flag quality warnings such as explanations that are too short, missing distractor explanations, likely duplicate options, or a hint that contains the answer.

Validation should be explicit and repairable. For example:

| Location | Error |
|---|---|
| Question 7 | Missing Correct Answer |
| Question 14 | Correct Answer must be A, B, C, or D |
| Question 22 | Subject is not in the allowed KAIRO subject taxonomy |

The Markdown parser is not an AI judge and should not silently “fix” factual content. Optional AI-assisted review can be added later as a separate moderation aid, but deterministic format validation and human review remain the source of truth.

## Backend model direction

Before adding tables, inspect the live Supabase schema. The likely durable separation is:

- `quizzes`: content objects and ownership/status.
- `community_questions` or the existing equivalent: imported question records with moderation status.
- `quiz_questions`: ordered references from quiz to question.
- `challenges`: competitive instances referencing a quiz/question set and event rules.
- `challenge_attempts`: guest or authenticated participation and server-scored outcomes.
- `challenge_attempt_answers` or durable attempt payload: resumable answer state where supported.
- `import_batches` and `import_errors`: auditable Markdown uploads and validation output.
- Existing activity, analytics, progression, and notification structures: reuse rather than duplicate.

No migration should be created until the live connector confirms whether equivalent structures already exist.

## Immediate next step

Enable the Supabase connector in the task so the live schema, RPCs, row-level security policies, and existing progression/analytics functions can be inspected. Then implement P0 in the order above, beginning with the guest/deep-link/attempt-state contract and the Markdown import validator, followed by the UI and moderation workflow.


## Verified live Supabase audit — 2026-09-10

The connected Supabase project is **KAIRO** (`unbgborbhxzsotaieiun`). The live database already contains the core Arena foundation and should be reused rather than redesigned.

| Live structure | Current state | Implication |
|---|---:|---|
| `kairo.challenges` | 1 row | The challenge model already supports `share_slug`, visibility, official/community distinction, topics, difficulty, quiz provenance, time window, one-attempt rules, and community-question IDs. |
| `kairo.challenge_attempts` | 4 rows | Server-scored attempt records already exist with completion, accuracy, time, question results, and challenge rank. |
| `kairo.quizzes` | 0 rows | The quiz object is ready but the creation/discovery flow has not yet produced live content. |
| `kairo.community_questions` | 0 rows | The moderation-ready community question table is ready but empty. |
| `kairo.question_import_batches` | 0 rows | The batch-import audit table already exists with filename, format, row counts, errors, and status. |
| `kairo.guest_sessions` | 0 rows | Guest-session infrastructure already exists, including claim/migration support. |
| `kairo.activity_events` | 2 rows | Activity infrastructure exists; current server scoring logs wins and challenge creation logs are supported. |

The live database already exposes `start_guest_session`, `guest_join_challenge`, `guest_get_attempt`, `guest_submit_attempt`, `claim_guest_session`, `get_challenge_questions_safe`, `submit_arena_attempt`, `create_quiz`, `create_community_question`, `validate_community_question`, `create_arena_challenge`, and `create_challenge_from_quiz`. This means guest gameplay and Markdown import can be implemented against existing backend contracts without inventing new authentication or question systems.

### Important architectural conclusions

1. **KAIRO ARENA is the product name in the UI and product plan.** The attached notes use JAMB Quest in places, but the current product instruction is authoritative: do not label the product JAMB Quest Arena.
2. **Arena is not JAMB/CBT mode.** Official JAMB-style questions can be used as content, but Arena is the competitive layer. A normal Study/CBT flow should not be reused as the Arena information architecture.
3. **Guest access is already possible at the database layer.** The missing work is client routing/state: the current protected route guard and `challengesApi.ts` only support authenticated students. The client must add guest-token storage, guest join/get/submit calls, and guest-to-auth claim after registration.
4. **Markdown import is feasible without a new backend engine.** The existing `create_community_question` RPC validates the exact KAIRO Arena quality contract and stores questions as `under_review` or `needs_fixes`. The client parser can convert Markdown blocks into the existing `QuestionOptionInput` and distractor-explanation structures, show a repairable preview, then submit valid rows through that RPC.
5. **The import batch table is an audit destination, not yet a complete import API.** There is no live import-specific RPC in the current function inventory. A first implementation can use deterministic client parsing plus the existing question RPC, but a later migration should add an atomic import-batch RPC that records `question_import_batches`, associates each community question with `import_batch_id`, and prevents partial imports.
6. **Official and community sources are already separated.** `quizzes.is_official`, `challenges.is_official`, `community_questions.status`, and the creator fields support the required visual and moderation distinction.
7. **Global ranking/division UI should remain deferred.** The live students table contains legacy division columns explicitly marked unused by the owner realignment. The live `rankings_snapshot` is available, but Arena V1 should show challenge placement unless a verified global-rank contract is established.

### Immediate implementation sequence

1. Add an Arena public/deep-link route that can render a challenge without passing through the authenticated onboarding guard.
2. Add a guest session client adapter over the existing guest RPCs and persist only the guest token/attempt resume metadata locally.
3. Add server-timestamp-aware attempt resume and expiry handling in the challenge flow.
4. Add share event instrumentation and branded ended/invalid challenge funnels.
5. Add Markdown template download, deterministic parser, row-level validation, editable preview, and submit-to-moderation flow.
6. Add an atomic import-batch RPC only after the first client flow is verified against the live validation contract.
