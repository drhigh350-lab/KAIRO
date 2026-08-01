# Kairo Learning Engine — Architecture Document

## 1. The Governing Question

> "What is the next best thing this student should do right now to improve?"

Every subsystem, every line of code, every design decision must trace back to this question.

## 2. The Knowledge Model

### 2.1 Content Map vs Knowledge Map

- **Content Map** (static): `Subject → Topic → Subtopic → Concept → Question Pool`
- **Knowledge Map** (dynamic, per student): A graph of **ConceptNodes**

Each ConceptNode carries:
- `retention_state` — Unseen | Forming | Held | Fading | Reinforced
- `confidence_score` — inferred from behavior, not self-reported
- `decay_estimate` — predicted current retention strength
- `attempt_history` — full sequence, not just tallies
- `error_pattern_tags` — *why* the student tends to get it wrong
- `dependency_links` — prerequisite concept IDs

### 2.2 Dependency Graph

Nigerian UTME subjects have real prerequisite chains. If a student fails an advanced concept, the engine's first move is to **check prerequisites**, not assign more of the same.

### 2.3 Confidence is Inferred

From:
- Accuracy trend (recent weighted more)
- Response time relative to personal baseline
- Consistency across multiple exposures
- Performance under **varied question framing**

## 3. Retention State System

### Why Not Binary Mastery?

A concept "mastered" three weeks ago is not the same as one mastered yesterday. Retention decays. The model must say so.

### The Five States

| State | Entered By |
|---|---|
| Unseen | Default |
| Forming | First 1–3 exposures |
| Held | Sustained accuracy + confidence |
| Fading | Decay estimate drops below threshold |
| Reinforced | Correct answer while in Fading |

**Reinforced is the most valuable state.** A concept that survives forgetting and is successfully recalled is measurably more durable.

### Decay Model

- Base decay rate per concept difficulty
- Personalized per student (observed retention patterns)
- Reinforced cycles slow future decay
- Exam proximity compresses all intervals

## 4. Student Macro-States

| State | Signal | Engine Behavior |
|---|---|---|
| **Orienting** | < 5 sessions | Breadth diagnostics, explain the system |
| **Building** | Steady cadence | Standard recommendation loop |
| **Compounding** | High Reinforced ratio | Increase difficulty ceiling, cross-topic questions |
| **Wavering** | Gaps increasing, accuracy dropping | Reduce cognitive load, confidence-building wins |
| **At Risk** | Long absence | Recovery flow triggers (no guilt) |
| **Recovering** | Just returned | Deliberately easier reconnection session |
| **Peak Readiness** | Close to exam, low Fading count | Mock conditions, timed sets, execution focus |

Transitions are **engine-driven**, never self-declared.

## 4.5 Emotional Profile (Student Intelligence Model §4)

Inferred patterns, not clinical states — exists purely to calibrate Kai's tone. Never shown to the student, never a single-signal trigger, never a mental-health diagnostic.

| State | Built from | Implemented in |
|---|---|---|
| Highly motivated | Rising session frequency | `EmotionalProfile._isHighlyMotivated` |
| Losing confidence | Rising guessed/careless_slip, declining completion | `_isLosingConfidence` |
| Recovering | Macro-State is Recovering | `_isRecovering` |
| Discouraged | Completion + accuracy + session length all declining together | `_isDiscouraged` |
| Overconfident | Guessed tags rising + accuracy falling | `_isOverconfident` |
| Exam pressure increasing | Exam proximity + rising frequency + late-night trend | `_isExamPressureIncreasing` |
| Needs encouragement | Fresh Reinforced transition not yet surfaced | `_needsEncouragement` |
| Needs challenge | High Held/Reinforced ratio, flat difficulty, strong accuracy | `_needsChallenge` |

More than one state can be true at once (`EmotionalProfile.compute()` returns an array). Device-dependent signals (e.g. late-night session trend) degrade gracefully to `'unknown'` rather than assuming absence means decline, per the sparse-data honesty principle applied elsewhere in the engine.

## 4.6 Learning State (Student Intelligence Model §5)

Operational — describes what mode the *current stretch of work* is in, distinct from and nested inside Macro-State. Exactly one state is active at a time. Never surfaced to the student as a badge.

`new_learner → discovering → practising ⇄ reinforcing → revising → exam_sprint`, with `recovering`, `plateau`, and `mastery_maintenance` as branches off the main line. Priority order in `LearningStateTracker._determine()`: Recovering (mirrors Macro-State) → Exam sprint (final 14 days) → Revising (final 6–8 weeks) → Plateau (flat Elite Score over a 10-session window in a normal operating Macro-State) → Discovering (>50% concepts Unseen/Forming) → Mastery maintenance (>80% Held/Reinforced, <10% Fading) → Reinforcing (>30% Fading) → Practising (default).

Persists through `StudentProfile` the same way `macroState` does — `learningState`/`learningStateHistory` fields, written by `LearningStateTracker._transitionTo()` on every `compute()` call, no separate persistence path needed.

## 5. Recommendation Engine

### Session-Level (on app open)

Builds a prioritized queue weighing:
1. **Urgent decay** — Fading concepts first
2. **Active gaps blocking progress** — weak prerequisites
3. **Macro-state cap** — Wavering/Recovering get shorter sessions
4. **Exam proximity** — mixed-topic and timed format prioritized
5. **Breadth guarantee** — touch unseen/stale topics

### Question-Level (after every answer)

The queue is **living** — it re-evaluates after every answer:
- `conceptual_gap` on prerequisite → reroute to foundational question
- `guessed` → insert diagnostic question
- `careless_slip` → brief nudge, continue
- 3+ consecutive slips → fatigue detection, difficulty pullback
- Correct + Fading → Reinforced transition (Wisdom Spark)

### What It Does NOT Optimize For

- Number of questions per session
- Time in app
- Streak preservation

If the honest recommendation is "you've done enough for today," the engine says so.

## 6. Elite Score

Replaces generic XP. Three inputs:

| Component | Weight | What It Rewards |
|---|---|---|
| **Accuracy** | 45% | Correct answers on hard, previously-Fading concepts |
| **Retention** | 35% | Successful Reinforced transitions (hardest to fake) |
| **Consistency** | 20% | Distributed practice across rolling window |

**Explicitly decoupled from streaks.** Missing a day never reduces the score.

## 7. Kai's Behavioral Framework

### Core Identity Contract

Kai is:
- A senior student who has been through this exact journey
- Someone who **notices specific things**, not generic praise
- Someone whose encouragement is **earned and evidence-based**
- Someone who can say a hard thing without it landing as an attack

### Hard Constraints

1. Never "wrong" as standalone judgment → "not quite — here's where it went sideways"
2. Never compare to other students in 1-on-1 feedback
3. Never guilt-based re-engagement → "Ready when you are — I kept your place"
4. Match energy to macro-state
5. Specificity over enthusiasm
6. Explain the *system* when relevant

### Response Library by Error Tag

| Tag | Kai Response |
|---|---|
| conceptual_gap | Full re-explanation with different framing, then scaffolded question |
| careless_slip | Light touch — "small slip in the arithmetic," move on |
| misapplied_rule | Name both concepts, draw the distinction directly |
| partial_understanding | Affirm what was right, isolate the broken step |
| guessed | No judgment — lower-stakes diagnostic to find real level |
| misread_question | Flag comprehension issue directly, not subject-knowledge |

### Response Library by Macro-State

| State | Kai Posture |
|---|---|
| Orienting | Explicit narration of what's happening and why |
| Building | Standard mentor mode — steady, specific |
| Compounding | "You're ready for something harder" — earned trust |
| Wavering | Shorter messages, acknowledge effort over outcome |
| At Risk | Never appears in guilt-laced push notifications |
| Recovering | "We're starting light today, on purpose" |
| Peak Readiness | Clinical, confidence-building, coach-before-game energy |

## 8. Memory & Revision Scheduling

### Revision is Not a Separate Mode

There is no "revision tab." Fading concepts become high-priority items in the next session's queue. The student never decides "should I revise now?" — Kairo decides and folds it in seamlessly.

### Interleaving, Not Blocked Review

When multiple concepts are due, they are interleaved with new material and each other. Blocked repetition produces an illusion of fluency that collapses under exam conditions.

### What Happens When Forgotten

- Not treated as student failure — treated as a correction to the system's model
- Concept drops to Fading (not all the way to Forming, unless conceptual gap detected)
- Personal decay rate for that concept-type is adjusted faster

## 9. Adaptive Difficulty

- **Per-concept**, not global. A student can be advanced in one subtopic and foundational in another.
- Held/Reinforced → harder variants or cross-concept questions
- Forming → stays low and scaffolded
- Two consecutive `guessed`/`careless_slip` → temporary pullback (fatigue signal)
- Session ceiling capped by macro-state

## 10. Recovery Mechanisms

### At Risk Threshold

Computed relative to the student's own historical rhythm, not a fixed day-count.

### Re-Entry Flow

1. **No guilt, no recap of what was missed.** Kai's first message is forward-looking.
2. **Short "reconnection" session** — deliberately easier than where they left off.
3. **Immediate decay re-check** — Held concepts may now be Fading; time did pass.
4. **Momentum Streak slack applied automatically.**

### Re-Engagement Messaging

Invitation-based: "Ready when you are — I kept your place."
Never shame-based: "You're falling behind."

## 11. Motivation Engine

### Momentum Streak

- Tracks consistency across rolling window, not unbroken daily attendance
- Protected gap days built in (framed as normal, not limited resource)
- If momentum breaks, recovery framing applies immediately

### Weekly Reflection

Personal, private, reflective. Reads like a note from Kai:
- What got Reinforced this week
- What's Fading and will show up soon
- One honest observation about pattern

### Monthly Wrapped ("Kairo Wrapped")

Shareable, visually rich:
- Concepts that moved Fading → Reinforced
- Elite Score trend, framed narratively
- Genuinely personal highlight from real pattern data
- Designed for WhatsApp status / Instagram

## 12. Data Architecture

### Offline-First

- IndexedDB in browser for full offline functionality
- All attempts stored locally first
- Sync when connection returns

### Conflict Resolution

- Most recent completed attempt wins for current state
- No attempt data is discarded — all retained for decay math
- Multi-device: student-level state, not device-level

## 13. Edge Cases

| Case | Handling |
|---|---|
| Cold start | Lightweight diagnostic pass, explicitly framed as "getting to know you" |
| Sparse question pool | Detect low pool depth, avoid pattern-matching from repetition |
| Offline sync conflicts | Merge by timestamp, retain all attempts |
| Multi-device | Student-level identity, resume from same knowledge model |
| Gaming the system | Detect rapid-fire / suspicious patterns, lower confidence in state updates |
| Missing prerequisite tags | Degrade gracefully — "no known prerequisite" ≠ "no prerequisite exists" |
| Long plateau | Route to different explanation styles, not infinite remediation loop |
| Repeat UTME candidates | Knowledge model persists across attempt-years |

## 14. Future Scalability

- **More subjects/exams:** Concept Node structure is subject-agnostic
- **Group/classroom features:** Cohort-based leaderboard groundwork already laid
- **Richer AI explanations:** Response library is template-driven now, structured for generative layer later
- **UTME Recap:** Monthly Wrapped data structures built with full-season rollup in mind
- **Multi-year students:** Prior knowledge map is valuable signal, never discarded

## 15. Quality Filter

Before any feature ships:
1. Does this help the student think more clearly?
2. Does this reduce decision fatigue?
3. Does this reward actual learning over activity?
4. Does this respect that the student is human?
5. Does this work offline?
6. Can Kai explain why this happened?

## 16. Student Journey & Engagement Engine (SJEE)

A structurally separate layer from the Learning Engine — answers "how deep is this student's relationship with Kairo, and how close is the exam," not "how is their learning trajectory behaving right now" (that's Macro-State, §4). Journey Stage and Macro-State are read side by side but never conflated (§11.4's "two-numbers problem"). Lives in `src/sjee/`.

### 16.1 Journey Stage (`JourneyStageTracker.js`)

Six stages, calendar- and history-driven rather than rolling-window: `arrival → activation → establishment → intensification → culmination → continuation`. One-directional except two legitimate backward cases — a temporary Activation-equivalent framing overlay on a long-gap return (never rewrites real history), and a genuine stage regression when an exam date is pushed out far enough that Intensification/Culmination no longer apply.

### 16.2 Notification Orchestrator (`NotificationOrchestrator.js`)

The single arbitrating layer — no module sends a notification directly; every candidate is submitted here. Pipeline: tone gate (identical hard rules to Kai's own tone, §7) → Journey Stage gate → per-type dismissal suppression → frequency budget (one Standard-tier push/day, one Low-tier/3-day window; Time-critical and Informational never compete for those slots) → channel selection. A hard opt-out (§9.7) overrides every tier including Time-critical.

### 16.3 Re-engagement & Win-back (`ReEngagementEngine.js`)

Gap severity is computed against the student's own historical median interval, never a fixed day count. Content must come from something genuinely true and specific (a real Fading concept); if nothing honest is available, the correct behavior is silence, not a generic template. Extended-absence win-back cadence widens (never narrows) with a fixed ceiling before the student is marked Dormant; a return at any point clears the entire sequence with zero recap of the gap.

### 16.4 Cross-Module Milestones (`CrossModuleMilestones.js`)

Product-scale milestones no single module can see alone. Always Informational-tier. Gated off during a visible rough patch (discouraged/losing-confidence emotional state) and during Culmination. When multiple milestones qualify simultaneously, only the single highest-priority one surfaces (Journey Stage transition > Cumulative learning > Consistency > Journey length) — the rest are genuinely queued for a later, separate moment, never bundled or discarded.

### 16.5 Continuation (`ContinuationEngine.js`)

Governs the post-exam relationship. All prior data persists untouched — what changes is what Kairo is *for*. An immediate low-key acknowledgment fires once, days after the exam, never presuming the outcome. Past that quiet window, routes to one of four paths (result-pending, repeat candidate, Post-UTME handoff, departure) based on explicit student signal, never inferred silently. A repeat candidate's Journey Stage restarts at Establishment, not Arrival — a new season, not a new relationship. Never solicits outcome data for product purposes.

### 16.6 Journey-Stage-first personalization (§8)

Every SJEE module filters through `JourneyStageTracker.personalizationPosture(stage)` before applying any other signal — mirrors the Recommendation Engine's own Macro-State-first rule at the SJEE's layer. Emotional Profile is permitted to gate and soften SJEE decisions but never to independently trigger one.

## 17. Notifications & Communication Systems

The execution/infrastructure layer downstream of the SJEE Notification Orchestrator (§16.2). Strictly sequential, one-directional authority (spec §1.3): the Orchestrator decides *whether* a candidate sends, at what priority, and how often; this layer decides, given that it should, *what exactly it says, through which channel, in what format*. Never a second Orchestrator — never overrides a send/hold/discard decision. Lives in `src/comms/`.

### 17.1 Template & Compliance (`TemplateEngine.js`)

Three-layer model: Layer 1 (data payload, supplied by the originating module — this engine never invents a fact), Layer 2 (category-specific 5-slot template: Observation, Reason, Benefit, Action, Voice marker), Layer 3 (channel-format rendering). Every render passes the Kai-voice compliance checklist as literal automated gates (banned phrases, unexplained raw metrics, leaked internal `retention_state` labels, genuine lack of specificity) — non-mechanical failures are discarded, never auto-softened into something that might still be wrong. No filler template exists: where Observation can't be populated with something specific and true, the correct output is `null`, not a generic fallback.

### 17.2 Consent (`ConsentManager.js`)

Three-level hierarchy: channel permission → category preference (never inferred upward — granting WhatsApp for one category doesn't unlock another) → hard stop (overrides everything, including Time-critical, except genuinely account-critical communication which sits outside this framework entirely). Lapsed or ambiguous consent always defaults to silence, never delivery.

### 17.3 Channel Selection (`ChannelSelector.js`)

Resolves the five-channel roster (push, in-app, WhatsApp, email, SMS) per category and consent. WhatsApp and SMS are reserved-use, never default — WhatsApp only for Editorial content followed, win-back's broadened stage, or student-shared artifacts; SMS only for connectivity-risk Exam-Critical alerts and security codes. Fallback (push failure → SMS) applies only to Time-critical candidates and never silently escalates to a channel the student hasn't opted into for that purpose.

### 17.4 Timing (`TimingEngine.js`)

Four-level resolution hierarchy: intrinsic deadline → Preferred Study Period → category default window → immediate (Time-critical/Account-Admin only). Quiet hours (22:00–06:00, device-local) hold and re-queue rather than discard. Informational-tier candidates may batch into a single in-app digest within their own category — never blended across categories.

### 17.5 Coordination (`CommsService.js`)

Ties the above together: an Orchestrator-approved candidate goes in, a resolved `{ channel, rendered, sendTime }` (or `null`, a legitimate "say nothing" outcome) comes out. Deduplicates at the point of send via a `factKey`, a defensive second gate beyond the Orchestrator's own selection stage. Produces the interaction log (delivered/opened/acted-upon) that feeds back into SJEE §5.8's dismissal-learning loop — this layer never interprets that log itself, only produces it.

---

*This is a living document. As real student behavior data starts to disagree with these assumptions, the architecture should be reviewed and revised — not treated as fixed spec.*
