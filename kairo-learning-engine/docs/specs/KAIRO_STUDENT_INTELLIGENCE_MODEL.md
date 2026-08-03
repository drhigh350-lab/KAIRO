# KAIRO STUDENT INTELLIGENCE MODEL
## The Complete Student Data Architecture Powering KAIRO

*(Builds directly on Phase 1 — Knowledge Model, Retention States, Macro-States, Recommendation
Engine — and Phase 2 — Memory Scheduling, Elite Score, Kai's Behavioral Framework, Motivation,
Adaptive Difficulty, Recovery. This document does not redesign that engine. It defines the
complete student-level data structure that engine reads from and writes to.)*

---

## 0. WHAT THIS DOCUMENT IS

Phase 1 and 2 defined how KAIRO *thinks*. This document defines what KAIRO permanently *knows*
about a single student — the substrate every decision is computed from.

If the Recommendation Engine, Kai, the Elite Score, and the Motivation Engine are the brain,
this is the memory. Delete this and KAIRO becomes a stateless quiz app again — every session
starting from zero, every mentorship illusion gone.

The model is organized into nine layers. Each layer answers a different question about the
student. None of them work in isolation — Section 8 shows how they connect into one continuous
loop.

---

## SECTION 1 — STUDENT IDENTITY

This is the stable, mostly-static layer: who the student is and what they are aiming for. It
changes rarely, but every field here silently shapes recommendations, tone, and content
selection elsewhere.

| Field | Why it exists | Required | Can change | How it influences KAIRO |
|---|---|---|---|---|
| **Full name / preferred name** | Personalization, Kai's voice, shareable Monthly Reflection | Yes | Rare | Used directly in Kai's messages and generated reports |
| **Age / date of birth** | Age-appropriate tone, content sensitivity | Yes | No | Keeps Kai's language calibrated (14 vs 21-year-old candidate) |
| **Exam type** (UTME, Post-UTME, IJMB, JUPEB) | Determines which content map and syllabus applies | Yes | Occasionally (repeat candidates) | Selects the entire Content Map subtree the student's Knowledge Map draws from |
| **Exam year / sitting** | Determines exam-proximity weighting (Phase 2 §5.2, §9) | Yes | Yes (repeat candidates) | Directly drives revision-interval compression and Macro-State timing |
| **Target university** | Contextualizes admission-strategy content, cut-off benchmarking | No | Yes | Personalizes "how ready am I" framing against real cut-off data |
| **Target course** (e.g., Medicine, Pharmacy) | Determines subject combination relevance, competitiveness framing | Yes | Rare | Filters which subjects matter most; shapes urgency messaging |
| **Target UTME score** | Student's own definition of "ready" | No | Yes | Personal Exam Readiness benchmark (Section 6) instead of a generic pass mark |
| **Subject combination** (e.g., Chemistry, Biology, Physics, English) | Defines the active Concept Node subgraph | Yes | Rare | Scopes which Content Map subtrees are "live" for this student |
| **Registration date** | Anchors "days until exam" calculations, cohort analysis | Yes | No | Feeds exam-proximity weighting and onboarding cohort logic |
| **Preferred study duration** (e.g., 20 min / 45 min sessions) | Session-length default | No | Yes | Session-level planning (Phase 2 §4.1) caps session size around this baseline |
| **Preferred study period** (morning / evening / late night) | Notification timing, not a hard constraint | No | Yes | Re-engagement messages are timed around this rather than sent generically |
| **Device information** (OS, connectivity quality, app version) | Diagnoses offline needs, rules out bugs vs. behavior | No | Yes | Feeds the offline-sync edge case (Phase 2 §11) and support diagnostics — never used to personalize learning content |
| **Referral source** (WhatsApp, friend, campaign, organic) | Growth and campaign-effectiveness insight, not learning-relevant | No | No | Feeds TECHMED's marketing layer only — must never leak into Kai's tone or recommendations |
| **Parent/guardian contact** (optional) | Enables a future parent-visibility layer without redesign | No | Yes | Currently dormant; reserved for Section 9's Parent Dashboard extension point |
| **Language/region context** | Some students may prefer explanations with local framing or examples | No | Rare | Lets Kai choose relatable analogies without assuming — never a proxy for ability |

**Design principle:** Identity fields are the only layer that is *declared*, not *inferred*.
Everything from Section 2 onward is computed from behavior, never self-reported, because
self-report is exactly what the Knowledge Model (Phase 1 §1.3) already rejected for confidence.

---

## SECTION 2 — ACADEMIC PROFILE

This is the student's academic memory — the aggregated, human-readable surface of the
Concept Node graph defined in Phase 1 §1. Where the Knowledge Model is the raw graph, the
Academic Profile is the rolled-up view every other system queries instead of re-walking the
whole graph each time.

| Field | What it is | How it evolves |
|---|---|---|
| **Subject mastery** | Weighted aggregate of concept-level mastery within a subject | Recomputed after every session; weighted toward Held/Reinforced concepts, penalized by active Fading count |
| **Topic mastery** | Same aggregate, one level down (e.g., "Organic Chemistry" inside Chemistry) | Same recompute cadence; this is the level shown in most dashboards, since subject-level is too coarse and concept-level is too granular for a summary view |
| **Concept mastery** | The raw retention_state + confidence_score per Concept Node (Phase 1 §1.1) | Updated on every attempt (Phase 2 §4.2 loop) |
| **Weak concepts** | Concepts in Forming or Fading state with below-threshold confidence_score | Recalculated continuously; feeds directly into session-level priority #1–2 (Phase 2 §4.1) |
| **Strong concepts** | Concepts in Held or Reinforced state with high confidence_score | Recalculated continuously; used to select "confidence-building easier wins" during Wavering states |
| **Frequently forgotten concepts** | Concepts that have cycled Held → Fading more than once, i.e. low personal decay resistance | A rolling count, not a snapshot — a concept only earns this label after repeat cycles, not one bad week |
| **Confidence per topic** | Aggregated confidence_score across a topic's concepts | Distinct from mastery — a topic can be "mastered" on paper but low-confidence if recent recalls were slow or shaky |
| **Question history** | Full attempt log — question, timestamp, correctness, response time, device/session context | Append-only; never overwritten (Phase 2 §11 offline integrity requirement) |
| **Error history** | The tagged subset of question history (error_pattern_tags, Phase 1 §1.4) | Append-only; this is the raw material the `conceptual_gap` / `careless_slip` / `guessed` remediation logic reads from |
| **Learning velocity** | Rate at which Forming concepts move to Held, and Held concepts survive to Reinforced, over a rolling window | Recalculated weekly; a slowing velocity with steady effort is the plateau signal (Phase 2 §11) |
| **Knowledge gaps** | Concepts flagged Unseen or Forming that are prerequisites (Phase 1 §1.2) for concepts the student is actively attempting | Recomputed whenever the dependency graph is walked during session planning; this is what triggers prerequisite rerouting |

**Evolution principle:** nothing in this layer is a static snapshot. Every field is a live
read against the Concept Node graph, refreshed on the cadence the underlying data changes —
per-attempt for concept-level fields, per-session for aggregated ones.

---

## SECTION 3 — BEHAVIOUR PROFILE

This layer tracks *how* the student engages, independent of *what* they know. It's what lets
KAIRO tell the difference between a student who is struggling with Chemistry and a student who
is tired, distracted, or studying at the wrong time of day for their own rhythm.

| Field | How it's inferred | How it affects recommendations |
|---|---|---|
| **Preferred study time** | Clustering of session start timestamps over time | Notification timing (Section 1); not used to gate access |
| **Average session duration** | Rolling mean of completed session lengths | Sets the realistic default for session-level planning (Phase 2 §4.1) instead of a fixed platform default |
| **Session completion rate** | % of started sessions finished vs. abandoned mid-way | A dropping completion rate is an early Wavering signal — often earlier than accuracy drop |
| **Days most likely to miss study** | Day-of-week absence pattern over a rolling window | Used only to soften expectations and time recovery messaging — never to shame ("you usually skip Fridays") |
| **Recovery ability** | Historical time-to-return and post-gap performance after previous At Risk periods | Personalizes how gentle/short the reconnection session (Phase 2 §10.2) needs to be — some students bounce back fast, others need more ramp |
| **Streak/Momentum behaviour** | Pattern of Momentum Streak (Phase 2 §8.1) breaks and recoveries over time | Distinct from the streak number itself — this is the *pattern*, used to predict At Risk risk before it happens |
| **Study consistency** | Session-count-across-distinct-days within a rolling window (same basis as Elite Score's Consistency component, Phase 2 §6.2) | Directly feeds the Elite Score and the Weekly Reflection's "pattern" observation |
| **Fatigue patterns** | Within-session accuracy/speed decline curves — does performance drop after N minutes or N questions? | Informs ideal session length recommendations, and helps the engine distinguish a `careless_slip` cluster caused by fatigue from one caused by a real gap (Phase 2 §9.2) |
| **Speed trend** | Response time trend per concept type, relative to the student's own baseline (Phase 1 §1.3) — never a global benchmark | Feeds confidence_score computation; a slowing trend on previously-fast concepts can flag emerging fatigue or forgetting before accuracy drops |
| **Accuracy trend** | Rolling accuracy, weighted by recency (Phase 2 §6.2) | Feeds Elite Score directly and is one of the clearest Macro-State transition signals |

**Design constraint:** behavioural data is diagnostic, not evaluative. None of these fields are
ever shown to the student as a raw judgment ("you have a 62% completion rate") — they are
inputs Kai and the engine use internally, surfaced only through the plain-language framing
principle established in Phase 2 §6.3 and §9.3.

---

## SECTION 4 — EMOTIONAL PROFILE

KAIRO infers emotional *patterns*, not clinical states. This layer exists to let Kai calibrate
tone (Phase 2 §7.2, §7.4) — it is explicitly not a mental-health diagnostic system, and must
never be framed or marketed as one.

| Inferred state | Signal pattern it's built from | How it shapes Kai's communication |
|---|---|---|
| **Highly motivated** | Rising session frequency, voluntary extra sessions, fast re-engagement after breaks | Kai can be more direct, offer harder challenges, use less cushioning language |
| **Losing confidence** | Rising `guessed`/`careless_slip` clusters, slowing response time on previously-strong concepts, session abandonment rising | Kai shifts toward Wavering posture (Phase 2 §7.4) — shorter messages, easier wins surfaced first |
| **Recovering** | Post-gap re-entry, early session in a reconnection flow | Kai uses the explicit permission-giving language from Phase 2 §10.2 |
| **Discouraged** | Sustained low completion rate + declining accuracy + declining session length together (not any single signal alone) | Kai reduces information density, avoids naming decline directly, leans on effort-acknowledgment |
| **Overconfident** | High self-selected difficulty attempts with rising `guessed` tags and falling accuracy — confidence outpacing actual mastery | Kai gently reality-checks through evidence ("this one slipped — let's make sure it's solid") rather than direct confrontation |
| **Exam pressure increasing** | Proximity to exam date combined with rising session frequency and declining sleep-adjacent time-of-day patterns (where device data allows) | Kai shifts toward the Peak Readiness posture (Phase 2 §7.4) — calmer, more clinical, confidence-reinforcing |
| **Needs encouragement** | A `Reinforced` transition or milestone recall just occurred but hasn't been surfaced yet | Triggers a proactive Kai moment (Phase 2 §7.5) |
| **Needs challenge** | Sustained Held/Reinforced ratio with flat difficulty exposure — the student is coasting | Triggers the Compounding-state posture shift (Phase 2 §7.4) |

**How these states are inferred:** every state above is a *combination* of behavioural and
academic signals over a rolling window — never a single data point, and never self-reported.
This mirrors the Macro-State design principle (Phase 1 §3.3): the student never declares their
own emotional state, and KAIRO never presents these labels back to the student directly. They
exist purely to steer Kai's tone, silently, the same way a good human mentor reads a room
without narrating that they're doing so.

**Hard boundary:** this layer must never be used to infer or flag clinical mental-health
conditions, and no such claim should ever appear in product copy, marketing, or Kai's dialogue.
If a student's pattern looks concerning beyond normal academic discouragement, the appropriate
response is a human-facing, low-pressure prompt toward real support — not an in-app diagnosis.

---

## SECTION 5 — LEARNING STATE

Where Macro-States (Phase 1 §3) describe the student's overall trajectory, Learning States
describe *what mode the current stretch of work is in*. A student can be in the "Building"
Macro-State while cycling through several Learning States within it.

| State | Entry conditions | Exit conditions | Purpose |
|---|---|---|---|
| **New learner** | Zero or near-zero attempt history | First lightweight diagnostic pass completes (Phase 2 §11) | Populate an initial Knowledge Map fast, without pretending to already know the student |
| **Discovering** | Diagnostic pass complete but Concept Map still mostly Forming/Unseen | Majority of touched concepts reach Held | Broad, exploratory practice — breadth over depth |
| **Practising** | Steady mix of Forming → Held movement, standard cadence | Sustained high Reinforced ratio, or a gap triggers Recovering | Default working mode — this is where most session time lives |
| **Reinforcing** | High density of Fading concepts due for revision (Phase 2 §5) | Fading queue clears back below threshold | Revision-weighted sessions, interleaved per Phase 2 §5.3 |
| **Revising** | Exam proximity crosses the compression threshold (Phase 2 §5.2) | Exam date passes, or student exits proximity window (repeat-candidate replanning) | Interval compression, timed/mixed-format practice takes priority |
| **Recovering** | Return after an At Risk gap (Phase 1 §3.1) | Reconnection session completes successfully | Deliberately reduced difficulty/length rebuild (Phase 2 §10.2) |
| **Exam sprint** | Inside the final 1–2 weeks pre-exam | Exam date passes | Maximum-readiness framing overtakes long-term retention optimization (Phase 2 §5.2) |
| **Plateau** | Sustained Practising/Building behavior with no Elite Score or Reinforced-count movement over an extended window (Phase 2 §11) | A changed explanation approach produces measurable movement again | Triggers alternate explanation styles rather than repeating the same remediation loop |
| **Mastery maintenance** | Subject/topic mastery consistently high with low active Fading | New syllabus content is introduced, or exam proximity reopens revision needs | Light-touch spaced check-ins only — protects earned mastery without wasting session time re-teaching what's solid |

Learning States are **operational**, not identity labels — a student moves through several per
week, and the label is used internally to shape session composition, never surfaced to the
student as a badge or status.

---

## SECTION 6 — PROGRESS METRICS

These are the computed metrics that summarize the layers above into something Kai, the
dashboard, and the Recommendation Engine can act on without recomputing raw data each time.

| Metric | Conceptual calculation | Increases with | Decreases with | How Kai uses it |
|---|---|---|---|---|
| **Learning Momentum** | Rate of Forming→Held and Held→Reinforced transitions over a rolling window | Sustained, spaced practice; successful recalls | Long gaps; concepts stalling in Forming | Primary driver of Compounding vs. Wavering Macro-State framing |
| **Memory Strength** | Aggregate inverse of decay_estimate across active concepts (Phase 1 §2.3) | Successful Reinforced transitions; survived recall cycles | Time elapsed since last correct recall; higher-difficulty concept types | Determines urgency of the Fading queue (Phase 2 §5) |
| **Concept Mastery** | Per-concept retention_state + confidence_score (Section 2) | Correct, varied-framing recalls | Errors, especially `conceptual_gap` tags | Base unit nearly everything else rolls up from |
| **Recovery Rate** | Average speed and completeness of return-to-baseline performance after an At Risk gap | Consistent reconnection-session completion | Repeated failed re-entries (student returns then drops again) | Calibrates how gentle future reconnection sessions need to be |
| **Study Consistency** | Sessions-across-distinct-days within a rolling window (Phase 2 §6.2) | Frequent, spaced sessions | Clustered single-day cramming | Direct Elite Score input; also feeds Weekly Reflection |
| **Exam Readiness** | Weighted combination of Held/Reinforced ratio, Memory Strength, and mock/timed-format performance, benchmarked against the student's own target score (Section 1) | Sustained mastery across the full subject combination, strong pressure-test performance | High active Fading count close to exam date; weak pressure-test scores despite good untimed accuracy | Central metric of Peak Readiness posture and Phase 5–6 campaign framing ("Built to Last") |
| **Improvement Velocity** | Same basis as Learning Velocity (Section 2) expressed as a trend line rather than a point value | Accelerating concept transitions | Plateau periods | Plateau detection (Section 5) |
| **Confidence Growth** | Trend of confidence_score across touched concepts over time | Correct performance under varied framing, not just repetition | Guessing patterns inflating short-term accuracy without real confidence gain | Distinguishes "getting better" from "getting lucky" for Kai's evidence-based encouragement (Phase 2 §7.1) |
| **Retention Score** | Proportion of Held concepts that survive to Reinforced rather than decaying back to Forming | Successful spaced recall | Concepts repeatedly dropping to Forming rather than just Fading | The clearest single proxy for "real learning" — the number the Elite Score's Retention component (Phase 2 §6.2) is built from |

Every metric here is a *lens on the same underlying data*, not a separately maintained number —
this keeps the model internally consistent and prevents the classic dashboard failure mode
where two numbers on the same screen quietly contradict each other.

---

## SECTION 7 — THE KAIRO SCORE

### 7.1 Starting point

Phase 2 §6 already designed this under the working name **Elite Score**, with a settled
Accuracy 45% / Retention 35% / Consistency 20% weighting, explicitly decoupled from streaks.
This section confirms that design as the final model for the Student Intelligence Model, and
evaluates it against the alternatives it was chosen over — this is the systems-level
justification, not a redesign.

### 7.2 Alternatives considered and rejected

**Raw accuracy percentage.** Rejected — rewards students who only attempt easy, already-known
material and never touch weak areas (directly gameable, and actively punishes the students most
willing to challenge themselves).

**Raw XP / volume-based scoring.** Rejected — rewards quantity over quality, directly
contradicting "Progress Over Activity" (TECHMED Brand Overview §10.3). A student who
rapid-fires easy questions would outscore one doing genuinely hard, slow, careful work.

**Speed-weighted scoring.** Rejected as a primary input (though retained as a secondary
modifier within Retention, Phase 2 §6.2) — speed alone rewards guessing and penalizes the
careful, methodical students UTME strategy legitimately rewards.

**Streak-based scoring.** Rejected as a core score input — this is precisely the design flaw
"Built to Last" was written to reject: a single missed day due to real life should never
collapse a student's sense of their own progress. Streaks remain a separate, optional
motivational layer (Phase 2 §8.1) precisely so the two never get tangled.

**Comparative/percentile scoring** (ranking against other students as the core score). Rejected
as a core mechanic — demoralizing for most students by construction, and contradicts Kai's rule
against comparative framing in 1:1 feedback (Phase 2 §7.2). Retained only as an opt-in,
cohort-based layer (Phase 2 §8.4), never the primary number.

### 7.3 The final model

**KAIRO Score = 45% Accuracy (difficulty & recency weighted) + 35% Retention (Reinforced-
transition based) + 20% Consistency (engagement-pattern based)**

This weighting is deliberately Retention-heavy relative to a naive scoring model, because
Retention is architecturally the hardest component to fake and the most predictive of actual
exam-day performance — a student cannot inflate it through volume, guessing, or short-term
cramming, only through genuinely durable learning.

### 7.4 Why this is the right model

- It cannot be gamed by attempting only easy questions (Accuracy is difficulty-weighted).
- It cannot be gamed by cramming the night before and forgetting the next week (Retention
  specifically rewards *surviving* forgetting).
- It cannot be gamed by daily-login volume with shallow engagement (Consistency measures
  spaced, distinct-session engagement, not raw frequency).
- It is legible: Kai can always explain a score movement in one plain sentence (Phase 2 §6.3),
  because every component maps to something the student did, not an opaque formula.
- It survives a bad week: because it excludes streak/attendance entirely, one missed day cannot
  crater it — a direct architectural expression of "missing a day should not mean losing the
  journey" (Built to Last campaign).

---

## SECTION 8 — RELATIONSHIPS BETWEEN DATA

None of the layers above function alone. Every student action flows through the full stack in
one continuous loop:

```
Question Attempt
   ↓ (Phase 2 §4.2 loop: update Concept Node, classify outcome)
Concept Mastery  (Section 2 — retention_state, confidence_score, error_pattern_tags)
   ↓ (aggregated across concepts/topics)
Academic Profile  (Section 2 — subject/topic mastery, weak/strong concepts, velocity)
   ↓ (combined with Behaviour + Emotional signals)
Learning Momentum / Memory Strength / other Progress Metrics  (Section 6)
   ↓ (rolled into the composite)
KAIRO Score  (Section 7)
   ↓ (all of the above read together)
Learning State + Macro-State  (Section 5, Phase 1 §3)
   ↓ (state determines posture and constraints)
Today's Session Plan  (Phase 2 §4.1 — urgent decay, gaps, macro-state caps, exam weighting, breadth)
   ↓ (executed question-by-question, re-evaluated live — Phase 2 §4.2)
Kai's Communication  (Phase 2 §7 — tone, specificity, proactive moments)
   ↓ (weekly rollup)
Weekly Reflection  (Phase 2 §8.2)
   ↓ (monthly rollup)
Monthly Reflection / Kairo Wrapped  (Phase 2 §8.3)
   ↓ (exam-proximity rollup)
Exam Readiness  (Section 6)
   ↓
Kai's Recommendation
   ↓ (feeds back into)
Next Question Attempt
```

**The critical property of this loop:** it is circular, not linear. Every attempt updates the
model that determines the next attempt. This is what separates KAIRO from a static quiz bank —
the system's understanding of the student is never more than one attempt stale, and every layer
downstream is a *view* on the same underlying Knowledge Map and Behaviour history, never a
separately maintained parallel dataset that can drift out of sync.

---

## SECTION 9 — FUTURE-PROOFING

The model is deliberately layered so new features attach to existing structures rather than
requiring new ones.

**AI tutoring / richer explanation generation.** Slots directly under the existing
`error_pattern_tags` taxonomy (Phase 1 §1.4, Phase 2 §12) — the taxonomy is the durable part;
a generative explanation layer replaces only the template logic underneath it, using the same
Concept Node and Academic Profile data already collected.

**Voice conversations.** Would consume the same Emotional Profile (Section 4) and Learning
State (Section 5) signals that currently drive Kai's text tone — no new inference layer needed,
only a new output channel for the same underlying state.

**Parent dashboards.** The dormant Parent/guardian field (Section 1) and the Weekly/Monthly
Reflection structures (Phase 2 §8.2–8.3) already contain shareable, non-invasive summaries.
A parent view would read a filtered subset of Progress Metrics (Section 6) — never raw
Emotional Profile data, which stays internal to Kai by design.

**Scholarship tracking.** Attaches to Student Identity (Section 1 — target course/university)
and Progress Metrics (exam readiness) to power eligibility matching, without touching the
learning engine at all.

**Post-UTME preparation / university learning.** The Content Map is already explicitly
subject-agnostic by design (Phase 2 §12) — a new exam type is new content nodes under the same
Concept Node + dependency graph structure, plus a new Student Identity `exam type` value
(Section 1). No re-architecture required.

**Career guidance.** Would draw on long-horizon Academic Profile trends (Learning Velocity,
subject-level strength patterns) already tracked in Section 2 — a new interpretation layer on
existing longitudinal data, not a new data source.

**The general principle:** every future feature listed above is a new *consumer* of the
Student Intelligence Model, not a reason to modify it. That is the test for whether the
architecture is sound — features should be able to read from this model without requiring it
to be reshaped around them.

---

## FINAL OUTPUT — THE STUDENT INTELLIGENCE MODEL, IN ONE PARAGRAPH

The Student Intelligence Model is the complete, continuously-evolving representation of a
single KAIRO student — combining a stable Identity layer, a live Academic Profile built from
the Concept Node knowledge graph, an inferred Behaviour Profile, a tone-calibrating Emotional
Profile, an operational Learning State, a set of honest Progress Metrics, and a single legible
KAIRO Score — all connected in one continuous loop where every question attempt updates the
model that determines the next recommendation. If KAIRO lost everything else — every screen,
every line of interface code, every content asset — but retained this model intact for every
student, the platform could be rebuilt around it in weeks, because this is not a record of what
students clicked; it is the actual, durable understanding of what each student knows, how they
learn, what state they're in, and what they genuinely need next. The interface is replaceable.
This model is KAIRO.
