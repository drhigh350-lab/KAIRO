# KAIRO LEARNING ENGINE — ARCHITECTURE
## Phase 1: Knowledge Model, Mastery States, Student States, Recommendation Logic

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student:

**"What is the next best thing this student should do right now to improve?"**

Not: what can they do. Not: what's next in a syllabus order. Not: what keeps them clicking.
**What actually moves their capability forward, given everything Kairo currently knows about them.**

If a design decision can't be traced back to that question, it doesn't belong in the engine.

---

## 1. THE KNOWLEDGE MODEL

### 1.1 What Kairo tracks knowledge *as*

Most quiz platforms track knowledge as a subject → topic → question hierarchy. That's a content
map, not a knowledge map. Kairo needs both, but they are not the same thing.

**Content Map** (static, built by curriculum team):
`Subject → Topic → Subtopic → Concept → Question Pool`

**Knowledge Map** (dynamic, unique per student):
A graph of **Concept Nodes**, where each node represents one atomic, testable unit of
understanding (e.g., "balancing redox equations," not "Chemistry" or even "Electrochemistry").

Each Concept Node, per student, carries a small state object — not just "correct/incorrect
count." This is the actual unit the engine reasons over:

- `retention_state` — see Section 2
- `confidence_score` — derived, not self-reported (see 1.3)
- `last_seen_at`
- `decay_estimate` — predicted current retention strength (see Section 2.3)
- `attempt_history` — sequence of outcomes, not just a tally
- `error_pattern_tags` — *why* the student tends to get it wrong (see 1.4)
- `dependency_links` — prerequisite concepts this one relies on

### 1.2 Concept Nodes are connected, not isolated

Nigerian UTME subjects have real prerequisite chains (e.g., you cannot reliably master
stoichiometry if mole concept is shaky). The knowledge map encodes these as directed edges:
`prerequisite_of` / `depends_on`.

**Why this matters practically:** if a student is repeatedly failing an advanced concept, the
engine's first move is not "give more practice on the advanced concept." It's: **check whether
a prerequisite node is actually the weak point**, and route practice there first. This is one of
the clearest ways Kairo behaves like a mentor instead of a quiz machine — a human tutor would
do exactly this diagnostic step before assigning more of the same.

### 1.3 Confidence is inferred, not asked

We do not ask "how confident do you feel?" (self-report is unreliable and adds friction).
Confidence is computed from behavioral signal:

- Accuracy trend on the concept (recent weighted more than distant)
- Response time relative to the student's own personal baseline (not a global benchmark —
  a slow-but-correct student isn't "bad," they may just be careful)
- Consistency across multiple exposures over time (one lucky correct answer ≠ mastery)
- Performance under **varied question framing** of the same concept (can they apply it when
  it's asked differently, not just recognize a familiar phrasing?)

This produces a `confidence_score` (0–1) that is more honest than raw accuracy percentage,
because raw accuracy is easy to inflate through guessing or memorized question patterns.

### 1.4 Error pattern tags — the real innovation surface

This is where "every mistake creates intelligence" actually gets implemented. A wrong answer
is tagged with a *reason category*, not just marked wrong:

- `conceptual_gap` — doesn't understand the underlying idea
- `careless_slip` — understands it, made an execution error (common under time pressure)
- `misapplied_rule` — applied a real rule from an adjacent concept incorrectly
- `partial_understanding` — got the right approach, wrong final step
- `guessed` — response time and pattern suggest no real reasoning occurred
- `misread_question` — evidence suggests comprehension error, not subject error

Early on, tagging can be rules-based (keyed off wrong-answer choice + response time + whether
the question has known "distractor" traps). Over time this becomes a genuine classification
model. **This tag is what determines the remediation path** — a `conceptual_gap` gets a fresh
explanation; a `careless_slip` gets a "slow down" nudge and a similar question, not a re-teach;
a `guessed` triggers a diagnostic question, not a scolding.

This is the single biggest differentiator from a standard CBT practice site: **Kairo doesn't
just know that a student got something wrong. It has a working theory of why.**

---

## 2. THE RETENTION STATE SYSTEM (Mastery Model)

### 2.1 Why not just "mastered / not mastered"

Binary mastery lies to the student and to the system. A concept a student "mastered" three
weeks ago and hasn't touched since is not in the same state as one they mastered yesterday —
even though a naive system would show both as ✅. Retention decays. The model has to say so.

### 2.2 The five retention states

Each Concept Node sits in one of these states, per student, at any given moment:

| State | Meaning | How it's entered |
|---|---|---|
| **Unseen** | No exposure yet | Default state |
| **Forming** | Currently being learned; too early to trust the signal | First 1–3 exposures |
| **Held** | Demonstrated correct understanding across varied framings | Sustained accuracy + reasonable confidence_score |
| **Fading** | Was Held, but decay_estimate has dropped below a trust threshold | Time-based decay function (2.3) |
| **Reinforced** | Successfully recalled *after* fading — this is real learning, stronger than first-pass Held | Correct answer while in Fading state |

**Reinforced is the most valuable state in the entire system.** A concept that survives forgetting
and gets successfully recalled is measurably more durable than one just learned. The engine
should treat Reinforced concepts as lower priority for review and Fading/Forming ones as
the active battlefield.

### 2.3 Decay is modeled, not guessed

`decay_estimate` uses a forgetting-curve-style function per concept, but personalized:

- Base decay rate depends on concept difficulty and how many prior successful recalls it has
  survived (more survived recalls → slower future decay — this is standard spaced-repetition
  logic, but applied at the *concept* level with Kairo's own state names, not a bolted-on
  flashcard app bolted beside the quiz engine).
- Decay rate is adjusted per student based on their observed personal retention pattern on
  similar concepts (some students retain formulas better than definitions, etc. — the engine
  should notice this over time and adjust).
- When `decay_estimate` crosses below a threshold, the state flips from Held → Fading, and the
  concept becomes eligible for the recommendation engine to resurface — *before* the student
  has actually forgotten it, ideally, not after.

### 2.4 What this state system prevents

It prevents the classic false-positive of gamified learning apps: a dashboard full of green
checkmarks that don't correspond to actual exam-day readiness. Kairo's internal picture of
a student should always be more conservative and more honest than what a leaderboard would
suggest.

---

## 3. STUDENT MACRO-STATES

Concept Nodes track *what* a student knows. Macro-States track *how the student is doing
as a whole* — this is what lets Kai behave like a mentor who "knows the student's journey"
rather than resetting to zero context every session.

### 3.1 The states

| Macro-State | Signal pattern | Kairo's responsibility |
|---|---|---|
| **Orienting** | New student, <5 sessions, knowledge map mostly Unseen | Establish a starting picture fast, without overwhelming. Prioritize breadth diagnostics over depth. |
| **Building** | Steady session cadence, mix of Forming/Held concepts growing | Normal operating mode — standard recommendation loop applies |
| **Compounding** | High proportion of Reinforced concepts, strong session consistency | Increase difficulty ceiling, introduce cross-topic and mixed-format questions |
| **Wavering** | Session gaps increasing, accuracy dropping, or self-reported difficulty rising | Reduce cognitive load per session, re-inject confidence-building easier wins, surface encouragement from Kai |
| **At Risk** | Long absence (defined relative to the student's own historical rhythm, not a fixed number) or sharp accuracy collapse | Recovery flow triggers (Phase 2) — never a guilt-based re-engagement message |
| **Recovering** | Returning after an At Risk gap | Deliberately *not* dropped back into where they left off at full difficulty — short "reconnection" session first |
| **Peak Readiness** | Close to exam date, high Held/Reinforced ratio, low active Fading count | Shift from acquisition to confidence + pressure-testing (mock conditions, timed sets) |

### 3.2 Why macro-state matters for every other subsystem

The Recommendation Engine, Kai's tone, session length defaults, and difficulty curve should
all read the current Macro-State before making a decision. This is what makes the system feel
like it *remembers* the student rather than treating every login as a fresh transaction. A
student in "Wavering" gets a different session shape than a student in "Compounding," even
if their raw knowledge maps look similar on a given day.

### 3.3 Transitions are engine-driven, not self-declared

Students never pick their own state. Transitions are computed from behavior. This matters for
credibility — a system where students can just claim "I'm ready" defeats the purpose of an
honest knowledge model.

---

## 4. THE RECOMMENDATION ENGINE

This is the actual "what's next" decision-maker. It runs at two levels: **session-level**
(what should today's session contain) and **question-level** (what's the single next question).

### 4.1 Session-level decision

When a student opens Kairo, before any question is shown, the engine builds a session plan by
weighing five inputs, in this priority order:

1. **Urgent decay** — any Held concepts that have crossed into Fading get first claim on
   session time. Forgetting is time-sensitive; everything else can wait a day, decay can't.
2. **Active gaps blocking progress** — Forming/conceptual_gap-tagged concepts that are
   prerequisites for topics the student is about to encounter next.
3. **Macro-state adjustment** — Wavering/Recovering states cap session difficulty and length
   regardless of what 1 and 2 would otherwise suggest. Protecting the student's continuation
   outranks theoretical optimal review order.
4. **Exam-proximity weighting** — as exam date approaches, mixed-topic and timed-format
   questions get prioritized over single-concept drilling, to build the actual skill of
   exam-day performance, not just topic knowledge.
5. **Breadth guarantee** — a small allocation is always reserved for touching a concept the
   student hasn't seen recently at all, so the system doesn't over-fit to only the loudest
   signals and quietly let other topics go completely stale.

The output is not a fixed quiz — it's a **prioritized queue** that question-level logic pulls
from and can re-order in real time based on how the session is actually going.

### 4.2 Question-level decision (runs after every single answer)

This is the tightest loop in the system and the one that has to feel invisible and instant:

```
Student answers
  → Update the specific Concept Node (retention_state, confidence_score, decay params)
  → Classify the outcome (correct / error_pattern_tag if wrong)
  → Ask: does this change what should happen next in THIS session?
      - conceptual_gap on a prerequisite → insert a foundational question before continuing
        the original topic (don't just move to the next queued question)
      - careless_slip → don't re-teach; next question can proceed normally, but flag for a
        brief "check your work" nudge from Kai, not a full explanation
      - guessed → insert a lower-stakes diagnostic question to find the real level
      - correct + Fading state → mark as candidate for Reinforced, continue queue
      - correct + already Held → this question likely wasn't needed; slightly reduce future
        priority weight for that concept next time the queue is built
  → Re-check Macro-State triggers (e.g., three careless_slips in a row may indicate fatigue,
    not lack of knowledge — this should soften difficulty, not flag a knowledge gap)
```

The key design principle here: **the engine is allowed to interrupt its own queue.** A rigid
pre-built quiz can't respond to what it just learned about the student thirty seconds ago.
Kairo's queue is a living plan, re-evaluated after every answer, not a fixed sequence.

### 4.3 What the engine deliberately does NOT optimize for

- It does not optimize for number of questions answered per session.
- It does not optimize for keeping the student in the app longer than necessary.
- It does not chase streak-preservation as a goal in itself (streak mechanics are a *motivation
  layer* concern, covered in Phase 2 — they must never be allowed to distort what the
  Recommendation Engine decides is actually good for the student's learning).

If the honest recommendation is "you've done enough for today, this concept needs to sit and
consolidate — come back tomorrow," the engine should be capable of saying that, even though
every instinct in typical app design pushes toward "give them one more thing to do."

---

## What Phase 1 gives you

With Sections 1–4, Kairo can already:
- Represent what a student actually knows (not just what they've clicked through)
- Know when that knowledge is going stale, before it's fully forgotten
- Understand *why* a student got something wrong, not just that they did
- Read the student's overall trajectory and adjust its whole posture accordingly
- Decide, moment to moment, what the single best next action is — and interrupt itself when
  new information changes that answer

## What's still needed (Phase 2)

- **Memory & Revision Scheduling** — the concrete spaced-repetition mechanics that consume
  `decay_estimate` and turn it into an actual revision calendar
- **Performance Score** — replacing XP, using the retention states above as its real inputs
- **Kai's Behavioral Framework** — how Kai talks, when it intervenes, what it says for each
  error_pattern_tag and Macro-State
- **Motivation Engine** — streaks, weekly/monthly reflections, celebration logic — designed so
  it never fights against what the Recommendation Engine knows is true
- **Adaptive Difficulty** — the actual difficulty-adjustment curve
- **Recovery Mechanisms** — the concrete flow for At Risk → Recovering
- **Edge cases & scalability** — cold-start students, offline sync conflicts, sparse-data
  subjects, multi-device use

Want me to go straight into Phase 2, or focus first on any one of those (e.g., Kai's
behavioral framework, since that's the most user-facing)?
