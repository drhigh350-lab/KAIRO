# KAIRO DAILY DECISION ENGINE (DDE)
## The Operational Brain of KAIRO

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the
Question Intelligence Model, and the Subject Knowledge Graph. Does not redesign any of them.
The Learning Engine knows what a student knows. The Student Intelligence Model remembers who
they are. The Question Intelligence Model turns questions into sensors. The Subject Knowledge
Graph maps how everything connects. None of that becomes an experience until something decides,
every single day, what a student should actually see and do. That is the Daily Decision
Engine.)*

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student, every time they
open KAIRO:

**"Given everything I know about this student right now, what is the single best experience I
should create today?"**

Not: what could I show them. Not: what's next in a queue. Not: what keeps them tapping.
**What is the one thing, right now, that moves this specific student closer to being ready —
without asking them to figure that out themselves.**

If a design decision can't be traced back to that question, it doesn't belong in the engine.

---

## SECTION 1 — DAILY DECISION PHILOSOPHY

### 1.1 The problem the DDE exists to solve

Every system built so far — the Knowledge Model, the Retention States, the Elite Score, the
Subject Knowledge Graph — produces *understanding*. None of it produces an *experience*. A
student does not open an app to inspect a knowledge graph. They open it to be told, credibly and
quickly, what to do next. Everything upstream of the DDE is intelligence. The DDE is the only
part of KAIRO a student actually lives inside.

This is the direct product-level expression of the TECHMED principle already established: *the
student comes before the feature.* The DDE is where that principle either becomes real or stays
a slogan.

### 1.2 Why cognitive load is the enemy, not the content

A student preparing for UTME is not short on content. Nigeria's students are drowning in PDFs,
groups, past questions, and advice. What they are short on is a trustworthy answer to one
question: *what should I actually do right now, out of everything I could do?* Every unresolved
decision a student has to make before they start learning — which subject, which topic, how
long, how hard — is friction that competes directly with the studying itself.

This is why the DDE's core advantage is not that it knows more than the student. It's that it
removes the need for the student to decide at all. The moment KAIRO asks "what would you like to
study today?" as an open menu, it has already failed the "Reduce Decision Fatigue" principle
(TECHMED Brand Overview §10.2) at the most important moment of the entire session — the first
five seconds.

### 1.3 The DDE's actual job

The DDE does not teach. It does not score. It does not explain. Those are the Learning Engine's
and Kai's jobs. The DDE's single job is **arbitration**: taking everything the upstream systems
know and collapsing it into one clear, defensible, personal answer to "what now?" — for the day,
for the session, and for the next thirty seconds.

### 1.4 Why this has to feel like understanding, not automation

A recommendation engine that is *correct* but feels *arbitrary* still fails the student, because
trust is part of the product. Every decision the DDE makes must be traceable back to a reason a
human mentor could plausibly give ("your mole concept is fading and it's holding back
stoichiometry" beats an unexplained topic switch). This is why Section 12 (Explainability) is
not a UI nicety bolted on afterward — it is a structural requirement the DDE is designed around
from the start, the same way Kai's tone rules were never optional polish on top of the Learning
Engine.

### 1.5 The philosophy in one line

**The DDE's job is to make the next right action feel obvious, so the only decision left for
the student to make is whether to start.**

---

## SECTION 2 — DECISION INPUTS

The DDE does not generate new data. It reads from the systems already built and synthesizes
across them. Below is every signal it consumes, grouped by source, with its specific effect on
today's plan.

### 2.1 From the Student Intelligence Model

| Signal | Effect on today's plan |
|---|---|
| **Macro-State** (Orienting, Building, Compounding, Wavering, At Risk, Recovering, Peak Readiness) | Sets the outer bounds on everything else — difficulty ceiling, session length default, and Kai's posture are all first filtered through this before any other input is considered |
| **Learning State** (Discovering, Practising, Reinforcing, Revising, Exam sprint, Plateau, Mastery maintenance) | Determines session *composition* — what mix of new material, revision, and pressure-testing today's plan should contain |
| **Emotional Profile** (motivated, losing confidence, discouraged, overconfident, exam pressure rising) | Shapes tone and pacing, never content selection itself — this signal is never allowed to override what the student actually needs to review, only *how* it's delivered |
| **Behaviour Profile** (preferred study time, average session length, completion rate, fatigue pattern, recovery ability) | Sets realistic defaults for session length and timing rather than a fixed platform default |
| **Progress Metrics** (Learning Momentum, Memory Strength, Exam Readiness, Improvement Velocity) | Feeds directly into the priority framework (Section 3) as the quantified inputs the ranking logic operates on |
| **KAIRO Score trend** | A legibility input, not a decision input — used to explain *why* today's plan looks the way it does, never used to decide what today's plan contains |

### 2.2 From the Learning Engine (Phase 1 & 2)

| Signal | Effect on today's plan |
|---|---|
| **Concept mastery per node** (retention_state, confidence_score) | The raw material for weak/strong concept identification |
| **Weak concepts** (Forming, Fading, below-threshold confidence) | Primary candidates for today's Core Practice block |
| **Recent mistakes and error_pattern_tags** | Determines whether today needs a foundational insert, a light nudge, or a diagnostic — read at both the session-planning level and the live question-level |
| **decay_estimate / memory decay** | Directly drives Urgent Decay, the highest standing priority in the framework (Section 3) |
| **Confidence level (confidence_score)** | Used to distinguish a real gap from a fluke — low accuracy with high confidence is a different problem than low accuracy with low confidence |
| **Study momentum** (Fading→Reinforced and Forming→Held transition rate) | A rising trend is permission to raise difficulty; a flat trend triggers the Plateau check |
| **Previous session's queue state** (if interrupted or incomplete) | Determines whether today resumes an unfinished plan or generates a fresh one |
| **Question history / attempt log** | Feeds session variety — the DDE avoids repeating recent question types verbatim, per the Question Intelligence Model's Alternative Representation logic |

### 2.3 From the Subject Knowledge Graph

| Signal | Effect on today's plan |
|---|---|
| **Concept Importance** (how many nodes depend on it) | Weights which weak concept wins when several are competing for the same session slot |
| **Gap severity** (Critical, Recoverable, Hidden, Repeated) | Critical gaps compete directly with Urgent Decay; Recoverable gaps fold into ordinary composition; Hidden gaps quietly bias question *type*, not session structure |
| **Cross-Subject Connections** | Used by the breadth allocation to select a "different subject" question that reinforces a currently weak cross-cutting skill rather than picking at random |
| **Recovery routes** | Supplies the exact shortest path back to solid footing when a prerequisite gap is diagnosed mid-session |

### 2.4 From context outside the knowledge model

| Signal | Effect on today's plan |
|---|---|
| **Available study time today** (stated or inferred from Behaviour Profile) | The single hardest external constraint — everything else is fit inside this envelope, never the reverse |
| **Exam countdown** | Shifts weighting from long-term spacing toward maximum readiness as the countdown compresses (Learning Engine §5.2's proximity override) |
| **Time of day** | Used only for tone and pacing calibration (e.g., lighter framing late at night) — never used to gate access |
| **Weekly goal progress** | A soft signal — if a student is behind their own stated weekly rhythm, today's plan may lean toward Consistency-building over depth, but this never overrides an Urgent Decay or Critical gap |
| **Learning fatigue signal** (within-session decline curve from recent sessions) | Caps today's planned length and difficulty ceiling proactively, before fatigue actually shows up again |
| **Device/connectivity context** | Determines whether today's plan should favor offline-safe content, per TECHMED's offline-first principle |

### 2.5 The synthesis rule

No single input is ever allowed to make the decision alone. Every one of the above is a vote,
not a verdict — Section 3 defines how the votes are weighted and what happens when they
disagree.

---

## SECTION 3 — DECISION PRIORITY FRAMEWORK

### 3.1 Why a strict hierarchy is necessary

Signals will frequently disagree. A weak concept might want attention on the same day a decaying
concept demands it, on the same day the student only has ten minutes and is showing fatigue
signs. Without an explicit ranking, the engine either becomes indecisive (bad, because it
reintroduces the exact decision fatigue KAIRO exists to remove) or inconsistent (worse, because
it stops feeling intelligent and starts feeling random). The hierarchy below exists so every
conflict has a predetermined winner.

### 3.2 The priority hierarchy

1. **Protect the student's continuation.** Macro-State constraints (Wavering, Recovering, At
   Risk recovery flow) outrank every academic consideration below. A technically optimal
   session that risks losing a fragile student is not optimal. This mirrors the Learning
   Engine's own §4.1 priority 3 and is restated here as the absolute ceiling on the whole
   framework, not just a session-planning input.
2. **Urgent memory decay.** Concepts that were Held and have crossed into Fading get the next
   claim, because forgetting is the one problem in this list that is actively time-sensitive —
   everything else can wait a day without cost; decay compounds.
3. **Critical knowledge gaps.** A missing, high-Importance prerequisite that is actively
   blocking the topic the student is about to (or already trying to) work on. This is ranked
   above ordinary weak-concept remediation because an unaddressed critical gap corrupts the
   value of everything built on top of it.
4. **Exam-proximity override.** As the countdown compresses into the final weeks, this reorders
   priorities 2 and 3 toward mixed, timed, exam-realistic practice over isolated concept drilling
   — not because decay and gaps stop mattering, but because "maximum readiness on exam day" and
   "optimal long-term spacing" genuinely diverge near the end, and the engine must know which
   goal it is currently serving.
5. **Ordinary weak-concept strengthening.** Forming concepts and lower-Importance gaps that
   aren't urgent but are part of steady, expected progress.
6. **Breadth guarantee.** A small, protected allocation to touch something the student hasn't
   seen in a while, so the plan never over-fits to only the loudest signals.
7. **Challenge / stretch content.** Only offered when Macro-State is Compounding or Peak
   Readiness and nothing above is competing for the slot — earned, never scheduled by default.

### 3.3 Resolving specific conflicts

**Weak concept vs. exam proximity.** Proximity wins on format (timed, mixed, exam-realistic)
but the weak concept still gets addressed — it simply gets addressed *inside* an
exam-realistic frame instead of an isolated drill. The two are reconciled, not traded off.

**Confidence vs. difficulty.** A student with high accuracy but low confidence_score (memorized,
not understood — Question Intelligence Model §4.1) is treated as *not yet ready* for difficulty
escalation, even though raw accuracy would suggest otherwise. Confidence, not accuracy, gates
difficulty increases, because accuracy alone is exactly the metric that's easiest to fake.

**Memory review vs. new learning.** Memory review wins whenever Urgent Decay (priority 2) is
active. New learning is never withheld entirely — Breadth guarantee (priority 6) always protects
some room for it — but it never competes head-to-head against something actively decaying.

**Speed improvement vs. accuracy improvement.** Accuracy always outranks speed. Speed is folded
in only as a secondary modifier (Learning Engine §6.2) and is never allowed to justify moving a
student forward if accuracy on the underlying concept is still shaky — a fast wrong answer is
worse signal than a slow right one, never better.

**Consistency vs. mastery.** For a student below the Consistency threshold (Elite Score §6.2),
the engine treats *returning tomorrow* as more valuable than squeezing extra depth out of today
— a shorter, easier, more inviting session that gets completed beats a harder one that gets
abandoned. For a student with strong consistency already established, the trade reverses:
today's session can afford to push depth, because the rhythm is already secure.

### 3.4 What never appears in the hierarchy

Engagement metrics (time-in-app, session count, streak length as a target) are deliberately
absent from this list. They are consequences the engine may observe, never inputs it optimizes
for — directly inherited from the Learning Engine's own refusal to optimize for volume (§4.3).

---

## SECTION 4 — TODAY'S MISSION GENERATOR

### 4.1 Purpose

Before a single question appears, the student should be handed one clear, personal,
low-friction object: **today's mission.** This is the DDE's single most important
output-facing artifact — the plain-language translation of everything Sections 2 and 3 just
computed.

### 4.2 Mission structure

| Component | What it contains | Design rule |
|---|---|---|
| **Mission title** | A short, specific, human name for today's focus (e.g., "Steady the Mole Concept," not "Chemistry Session 14") | Named after the *concept or purpose*, never a generic session number — this is what makes the mission feel personal rather than templated |
| **Estimated duration** | A realistic range, derived from the student's Available Study Time input and Behaviour Profile average, not a fixed platform default | Always shown as a range ("about 20–25 minutes"), never a false-precision exact figure |
| **Primary objective** | One sentence, plain language, stating the single thing today's session is actually for | Must be answerable in one breath — if it needs a paragraph, the mission is trying to do too much |
| **Concept focus** | The specific Concept Node(s) from Section 3's winning priority, named in student-facing (Topic/Sub-topic) language, not raw Concept Node IDs | Pulled from the Subject Knowledge Graph's human-facing levels (Section 2.2 of the SKG document), never the internal node name |
| **Difficulty** | Framed relatively ("about where you left off," "a step up," "deliberately easier today"), never as a raw number | Matches the Question Intelligence Model's rule that difficulty is only ever shown as a relative signal (QIM §2.3) |
| **Expected outcome** | What should be true *after* the session that wasn't true before ("you'll have recalled two things you were starting to forget") | States a learning outcome, never an activity count ("10 questions") — reinforces Progress Over Activity |
| **Kai's introduction** | A short, specific opening line from Kai framing *why* this mission was chosen | Must satisfy Section 12's explainability standard — no mission ships without a reason a student can understand |
| **Success criteria** | What "a good session" looks like today, stated honestly (not "100% correct," but something like "engaging with the two Fading concepts, even if some answers are wrong") | Deliberately decoupled from perfect accuracy, consistent with the Elite Score's own design (Student Intelligence Model §7) |
| **Reflection** | A short closing prompt or observation, generated after the session, connecting back to the original objective | Not a generic "great job" — must reference something specific that happened during the session |

### 4.3 Personalization mechanics

Two students with the same weak concept will not receive the same mission if their Macro-States,
available time, or recent emotional signals differ. The mission generator always passes the
Section 3 output through the student's current Macro-State and Emotional Profile before final
wording is produced — the *substance* of the mission is decided by priority ranking; the *frame*
is decided by who the student is right now.

---

## SECTION 5 — SESSION STRUCTURE GENERATOR

### 5.1 The available blocks

| Block | Purpose |
|---|---|
| **Welcome** | Orients the student in under five seconds — confirms the mission, sets expectation for length |
| **Warm-up** | Low-stakes, high-confidence questions to build momentum before anything difficult — especially important for Wavering/Recovering states |
| **Core Practice** | The actual substance of today's mission — the weak/decaying/gap concept(s) from Section 3 |
| **Learning Moment** | A fresh explanation, triggered specifically by a `conceptual_gap` tag mid-session — not scheduled in advance, inserted live |
| **Review** | Interleaved revision of Fading concepts, per the Learning Engine's interleaving principle (§5.3) — never a separate blocked-off "revision section" |
| **Confidence Builder** | A short run of Held-state, high-confidence questions — used specifically to close a session on a genuine win, not an artificial one |
| **Challenge Question** | Optional, gated by Macro-State (Compounding/Peak Readiness only) — an earned stretch, never a default inclusion |
| **Reflection** | The Mission Generator's closing artifact (Section 4.2) — always present, always specific |
| **Celebration** | Reserved for genuine milestones (Reinforced transitions, Macro-State upgrades) — per the Wisdom Spark's rarity principle, this block does not appear every session |

### 5.2 When each block appears or disappears

- **Welcome** and **Reflection** are the only two blocks present in every session without
  exception — everything between them is assembled dynamically.
- **Warm-up** is included by default for Orienting, Wavering, and Recovering states; it is
  optional and often skipped for Compounding and Peak Readiness students who have shown they
  don't need it (skipping it saves session time for students whose Behaviour Profile shows they
  don't need the ramp).
- **Core Practice** is always present — it is the mission itself — but its *size* flexes
  entirely against Available Study Time (Section 6).
- **Learning Moment** never appears in the planned structure ahead of time. It exists purely as
  a live insertion trigger (Section 7) — its presence in a given session is a symptom of what
  happened, not a scheduled feature.
- **Review** appears whenever Urgent Decay (Section 3, priority 2) is active — interleaved, not
  blocked, per Learning Engine §5.3.
- **Confidence Builder** is mandatory whenever the session's Core Practice ran hard against a
  weak or Fading concept — a session that spends its middle on struggle should never be allowed
  to end there. It is optional (and short) when the session was already largely composed of
  Held-state material.
- **Challenge Question** appears only in Compounding/Peak Readiness sessions, and only after
  Core Practice and Review needs are already satisfied within the available time.
- **Celebration** appears only when Section 7 or Section 9's triggers actually fire during the
  session — never scheduled preemptively, since a celebration the system knew about in advance
  before it happened would read as hollow.

---

## SECTION 6 — DYNAMIC ADAPTATION

### 6.1 Unexpectedly poor performance mid-session

The engine does not wait until session end to react. Two or more consecutive misses on
concepts previously rated Held triggers an immediate re-plan: Core Practice pulls back toward
easier variants of the *same* concept (via the Question Intelligence Model's Lower-difficulty
relationship, §6.2) rather than pressing forward, and the session is quietly shortened toward
a Confidence Builder close rather than continuing to plan length. The Macro-State model isn't
changed off one bad stretch — but the *session* adapts immediately, because protecting the
student inside the moment matters more than completing an original plan that reality has
already outdated.

### 6.2 Unexpectedly strong performance mid-session

A run of fast, accurate answers on concepts flagged Forming or Fading is treated cautiously, not
celebrated immediately — per the Learning Engine's "gaming the system" edge case (§11), an
abnormally fast 100% run is checked against response-time baselining before being trusted. If it
holds up as genuine (consistent with the student's own baseline, not just fast), the session
extends the Challenge Question allocation and Kai explicitly names the moment ("you're ready for
something harder") rather than silently upgrading difficulty without comment — this satisfies
both Section 3.3's confidence-gates-difficulty rule and Section 12's explainability standard.

### 6.3 Ten-minute session

Core Practice compresses to a single, highest-priority item from Section 3's ranking — Urgent
Decay or Critical Gap, whichever wins. Warm-up and Challenge Question are dropped entirely.
Confidence Builder shrinks to one or two items, never zero — a session should not end on
struggle even at ten minutes. The mission's stated objective narrows accordingly ("today we're
just steadying one thing") so the student's expectation matches what's actually deliverable —
this is a direct expression of "the next step should be obvious," scaled to the time available.

### 6.4 One-hour session

The engine does not simply multiply Core Practice by six. It uses the extra time to satisfy
*more* of the priority hierarchy at once — Urgent Decay, a Critical Gap, ordinary weak-concept
work, and the Breadth guarantee can all get real room, rather than the same concept being
drilled for an hour, which would produce diminishing returns and risk fatigue. Longer sessions
also unlock a Deep Revision pass (Subject Knowledge Graph §9) instead of Quick Revision only,
because there's room to check whether a Fading concept quietly pulled a prerequisite down with
it.

---

## SECTION 7 — DECISION AFTER EVERY QUESTION

The DDE consumes the Learning Engine's question-level interrupt loop (Phase 1 §4.2) directly.
After every answered question, the following can change in real time:

| What can change | Trigger |
|---|---|
| **Next question** | Always re-selected from the live queue, never pre-fixed — the queue is a living plan (Learning Engine §4.2) |
| **Difficulty** | Adjusts per Section 9.2's rules (Subject Knowledge Graph-informed) — up on sustained Held/Reinforced performance, down on fatigue-pattern clusters |
| **Explanation depth** | Shorter for `careless_slip`, longer for `conceptual_gap` on a Forming concept — per Question Intelligence Model §9.3 |
| **Concept focus** | Can shift entirely if a prerequisite gap is diagnosed mid-question — the session detours to the nearest recovery route (Subject Knowledge Graph §5.4) before returning |
| **Session length** | Can shrink (fatigue detected) or, rarely, offer to extend (student is in flow and has stated time remaining) — extension is always offered, never forced |
| **Encouragement** | Kai's proactive moments (Learning Engine Phase 2 §7.5) — a Reinforced transition is surfaced the instant it happens, not batched to session end |
| **Revision scheduling** | `decay_estimate` recalculates live; a concept can move onto tomorrow's priority list based on a single answer today |
| **Challenge level offering** | Can unlock mid-session if the student's live performance clears the Compounding threshold, even if they started the session in Building |
| **Kai's messaging** | Tone recalibrates against the current Macro-State and the specific error_pattern_tag — this is the most frequently changing element in the entire system |

---

## SECTION 8 — RECOVERY DECISIONS

| Situation | KAIRO's response |
|---|---|
| **Student fails repeatedly (same concept)** | After the second consecutive failure on the same concept in one session, the engine stops re-attempting it at the same level and instead inserts the Question Intelligence Model's misconception-informed re-explanation (a *different* framing than the original teaching, per Learning Engine §7.3's `conceptual_gap` response) — repeating the identical remediation a third time is treated as already failed, per the Repeated gap classification (Subject Knowledge Graph §8.2) |
| **Student guesses** | The `guessed` tag routes to a short, neutral, lower-stakes diagnostic question — no judgment language, no re-teaching until the diagnostic establishes real footing (Learning Engine §7.3) |
| **Student leaves halfway** | The session state is preserved exactly as it stood, not discarded. On return within the same day, KAIRO offers to resume, not restart — restarting would silently discard genuine progress and misrepresent what the student actually knows |
| **Student returns tomorrow (normal)** | Standard daily re-plan — yesterday's incomplete queue items are re-evaluated (some may have naturally resolved in priority, others may now be more urgent) rather than blindly appended to today's plan |
| **Student misses three days** | Below the At Risk threshold for most students (which is personal, not fixed — Learning Engine §3.1) — treated as a normal gap. Today's plan re-checks decay estimates honestly (some Held concepts may now show early Fading signal) but does not trigger the full Recovering flow |
| **Student returns after two weeks** | Triggers the full At Risk → Recovering flow: no recap of what was missed, a deliberately reduced-difficulty reconnection session (Learning Engine §10.2), decay estimates recalculated across the board before any new content is introduced, and Momentum Streak slack applied automatically without the student needing to ask |

---

## SECTION 9 — RECOMMENDATION CATEGORIES

| Category | When it appears |
|---|---|
| **Continue** | Default state — steady Building macro-state, no urgent competing priority |
| **Review** | Urgent Decay is active; a Held concept has crossed into Fading |
| **Strengthen** | A Forming concept exists with below-threshold confidence but no urgency yet |
| **Recover** | Post At-Risk-gap re-entry, or mid-session prerequisite-gap detour |
| **Challenge** | Compounding/Peak Readiness macro-state, sustained Held/Reinforced ratio, session time available beyond core needs |
| **Celebrate** | A genuine Reinforced transition, Macro-State upgrade, or milestone recall just occurred |
| **Slow Down** | Fatigue-pattern cluster detected (e.g., two consecutive careless_slip/guessed tags) mid-session |
| **Speed Up** | Sustained slow-but-correct pattern where response-time trend suggests the student could move faster without losing accuracy — offered gently, never as pressure |
| **Revise** | Exam-proximity window active; Learning State has shifted to Revising or Exam sprint |
| **Master** | A Topic or Sub-topic's aggregate mastery has cleared threshold — offered as the student-legible "you've got this one" moment (Subject Knowledge Graph §9's Weak-topic review, in reverse) |
| **Prepare** | Peak Readiness macro-state, exam date imminent — shifts framing from acquisition to confidence and pressure-testing |
| **Explore** | Breadth guarantee slot — introducing a concept the student hasn't touched recently, framed as low-stakes discovery, not obligation |

---

## SECTION 10 — PERSONALISATION RULES

| Dimension | How it changes the recommendation |
|---|---|
| **Learning style** (inferred from performance across concept types — e.g., formulas vs. definitions) | Shapes which explanation style and question framing Kai reaches for first, per the personal decay-rate logic already in the Learning Engine (§2.3) |
| **Confidence** | Gates difficulty escalation independently of raw accuracy (Section 3.3) — two students with identical accuracy can receive different difficulty trajectories |
| **Progress** (Learning Momentum, Improvement Velocity) | Determines how much of today's plan is spent consolidating vs. advancing |
| **Exam timeline** | Reweights the entire priority hierarchy toward the proximity override (Section 3.2, priority 4) as the countdown shrinks |
| **Consistency** | A student with fragile consistency gets shorter, more inviting sessions prioritizing completion; a student with strong consistency gets sessions that can afford more depth and challenge |
| **Subject strengths** | Breadth allocation (Section 3.2, priority 6) is biased toward reinforcing cross-subject weak points relevant to the student's actual target course, not generic coverage |
| **Behaviour** (preferred time, fatigue pattern, completion rate) | Sets realistic session-length and timing defaults per student rather than a platform-wide default |
| **Motivation / Emotional Profile** | Shapes tone and pacing exclusively — never content or priority selection (Section 2.1) |

No two students in the same Macro-State and Learning State receive an identical mission,
because the personalization layer is applied *after* the priority ranking, not instead of it —
the substance can be structurally similar; the delivery never is.

---

## SECTION 11 — KAI'S DECISION LAYER

Every time Kai is about to speak, it runs the same internal reasoning sequence, sourced entirely
from data this document and its predecessors already define — nothing here introduces a new
signal, only a fixed order of questions:

1. **What happened?** — Pull the specific event (an answer, a session milestone, a return after
   absence) directly from the Learning Engine's live state.
2. **Why?** — Match it against the relevant error_pattern_tag, Macro-State, or Progress Metric
   that explains it, so Kai's next line is never a guess.
3. **What emotion is likely present?** — Read the Emotional Profile (Student Intelligence Model
   §4) — inferred, never asked, and never spoken aloud as a label to the student.
4. **What learning intervention is best?** — Cross-reference Kai's response library (Learning
   Engine Phase 2 §7.3, §7.4) against the tag and Macro-State identified above.
5. **What tone should I use?** — Apply the hard tone constraints (Learning Engine Phase 2 §7.2)
   — never a standalone "wrong," never comparative framing, never guilt-based language.
6. **What should happen next?** — Hand the answer back to the DDE's live decision loop (Section
   7) so Kai's words and the system's actual next action are always in sync — Kai should never
   say something the engine's next move contradicts.

This sequence runs in the same order every time, which is what keeps Kai feeling like a
consistent mentor rather than a set of disconnected response templates.

---

## SECTION 12 — EXPLAINABILITY

### 12.1 Why this is structural, not decorative

A recommendation a student doesn't understand is a recommendation that erodes trust, even if
it's correct. "Clarity is a product feature" (TECHMED Brand Overview §10.1) applies as literally
to the DDE as to any onboarding screen. Every output this document defines — the mission, a
mid-session difficulty shift, a revision item, a recovery flow — must carry a plain-language
reason a student can read in one glance.

### 12.2 The pattern

Every explanation follows the same shape: **name the observation, name the reason, name the
benefit** — in one or two short sentences, never a data dump.

Representative examples, mapped to the categories in Section 9:

- **Review:** "We're revisiting this because it's starting to fade — catching it now beats
  relearning it later."
- **Strengthen:** "This topic keeps affecting your Chemistry score, so today leans into it."
- **Challenge:** "You've improved enough here to try harder questions — this is earned, not
  random."
- **Recover:** "We're starting light today, on purpose, to get your footing back."
- **Explore:** "You haven't touched this one in a while — a quick look keeps it from going
  quiet."

### 12.3 What is never surfaced

Raw scores, decay percentages, confidence_score numbers, and internal state labels
(retention_state, Macro-State names) are never shown verbatim to the student — per the Question
Intelligence Model's own design note (§2, "Design note") that internal metadata stays internal.
Kai translates; the system never displays its own machinery.

---

## SECTION 13 — FAILURE MODES

| Situation | Engine behavior |
|---|---|
| **Very little data exists** (cold-start) | Defaults to the Orienting Macro-State's lightweight diagnostic pass (Learning Engine §11) — explicitly framed as "getting to know you," never scored competitively, and the mission generator openly states this is a discovery session rather than pretending false confidence |
| **A student studies inconsistently** | The engine trusts the *personal* rhythm baseline (Behaviour Profile), not a platform norm — an inconsistent-but-real pattern is still a pattern the engine can plan around; it does not penalize the student for not matching an assumed "ideal" cadence |
| **Performance fluctuates** | Single-session swings are smoothed against the rolling-window metrics already defined (Learning Engine Phase 2 §6.2) — the DDE never over-reacts to one session the way it would under-react to a genuine multi-session trend |
| **The student changes goals** (target course, exam year) | Student Intelligence Model fields update (Section 1 of that document); the DDE re-scopes which Content Map subtree and countdown apply starting the next session — no retroactive rewriting of what already happened |
| **The student switches subjects mid-stream** | Handled natively — Concept Nodes are subject-scoped but the DDE's breadth and priority logic already operate across the full active subject combination, not one subject at a time |
| **Incomplete information** (a concept with no dependency data, or an under-tagged question) | Per the Subject Knowledge Graph's own rule (§10.3), missing data is treated as "unknown," never as "no issue exists" — the DDE flags low-confidence recommendations internally and biases toward safer, breadth-guarantee-style suggestions rather than confidently acting on a gap |
| **The recommendation engine is uncertain** (conflicting signals with no clear winner even after Section 3's hierarchy) | Defaults to the safest, least disruptive option — usually Continue or a Confidence Builder — rather than forcing a confident-sounding recommendation the underlying data doesn't actually support. An honest "steady as you go" beats a manufactured sense of certainty |

---

## SECTION 14 — PRINCIPLES

The Decision Engine must always obey the following twenty rules:

1. Never overwhelm — one mission, one clear next step, always.
2. Always reduce decision fatigue; the student should never have to choose from a menu to begin.
3. Protect confidence before pursuing depth.
4. Every recommendation must have a reason a human mentor could actually give.
5. Prioritise learning over engagement — time-in-app is never an optimization target.
6. Every recommendation should move the student closer to genuine exam readiness, not just
   activity.
7. Accuracy alone never justifies raising difficulty — confidence must agree.
8. Forgetting is treated as urgent; everything else can wait a day.
9. A missed day is never treated as lost progress.
10. No student sees a raw internal score, state name, or decay number.
11. Difficulty and content decisions are never driven by streaks or attendance.
12. A session should never end on struggle — a Confidence Builder always protects the close.
13. Celebration is rare and specific, never routine or unearned.
14. Kai's tone always matches the current Macro-State, never a fixed personality setting.
15. Recovery flows never recap what was missed — they are forward-looking only.
16. Comparative or ranking language never appears in 1:1 recommendations.
17. Uncertainty is met with the safest option, never a confidently wrong one.
18. Every mission must state what will be true afterward, not just what will be done.
19. The engine adapts live, mid-session — it never rigidly finishes a plan reality has outdated.
20. If a decision can't be traced to "what does this student actually need right now," it
    doesn't belong in the plan.

---

## FINAL OUTPUT — WHY THE DDE IS KAIRO'S OPERATING SYSTEM

The Learning Engine knows what a student knows. The Student Intelligence Model remembers who
they are. The Question Intelligence Model turns individual questions into sensors. The Subject
Knowledge Graph maps how everything connects. Every one of those systems is intelligence sitting
in storage until something decides, every single day, what to actually do with it. That is the
Daily Decision Engine.

An operating system is not the most visible part of a computer, but it is the part that decides
what the user actually experiences from everything running underneath. The DDE plays exactly
that role inside KAIRO. A student never sees a Concept Node, a decay_estimate, or a Macro-State
label — they see a mission with their name on it, a session that adjusts when they're struggling,
a Kai that seems to notice things, and a plan that always seems to know what they need next. That
feeling — of being understood rather than processed — is not a UI effect layered on top of the
architecture. It is what happens when every decision this document defines is made honestly,
in the right order, for the right reasons, every single day.

This is the difference between a platform with a powerful knowledge model and a platform that
feels, to a Nigerian student sitting down for twenty minutes between school and family
responsibilities, like something that genuinely understands where they are and what they need to
do next. Every other system in KAIRO makes that possible. The Daily Decision Engine is what
makes it real.

**Think Smart. Perform Elite.**
