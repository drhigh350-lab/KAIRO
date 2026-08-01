# KAIRO SUBJECT KNOWLEDGE GRAPH (SKG)
## The Academic Backbone of KAIRO

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, and the
Question Intelligence Model. Does not redesign any of them. The Learning Engine decides what a
student should do next. The Student Intelligence Model remembers who the student is. The
Question Intelligence Model turns individual questions into sensors. None of those systems can
function without a shared map of the subject matter itself — that map is the Subject Knowledge
Graph.)*

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, independent of any single
student or any single question:

**"How does everything a UTME student needs to know actually connect together?"**

Not: what order does the syllabus list things in. Not: what topic does this question belong to.
**What genuinely depends on what, what reinforces what, and what would a student need to
already understand before this makes sense?**

If a design decision can't be traced back to that question, it doesn't belong in the graph.

---

## SECTION 1 — PHILOSOPHY

### 1.1 Why a graph, not a list

A syllabus is a list. A list tells you *what exists*. It does not tell you *how it connects*.
Most CBT platforms inherit the syllabus's list structure directly into their product —
Subject → Topic → Questions — because it is the easiest structure to build and the easiest to
display. It is also the reason those platforms cannot answer the questions the Learning Engine
was designed around: *why* a student is stuck, *what* is really causing an advanced concept to
keep failing, *which* forgotten idea from three months ago is quietly breaking this week's
work.

A graph tells you *how things depend on each other*. That is not a cosmetic difference — it is
the difference between a system that can diagnose and a system that can only record.

### 1.2 Knowledge is not flat

Nigerian UTME subjects are not collections of independent facts. They are built out of real
dependency chains: you cannot reliably understand stoichiometry without mole concept; you
cannot interpret a velocity-time graph without understanding gradient; you cannot answer a
genetics cross without understanding probability and basic algebra. These dependencies exist
whether or not a platform chooses to represent them. A flat question bank pretends they don't
exist. The SKG makes them explicit, so the rest of KAIRO can act on them instead of guessing.

### 1.3 What the graph makes possible

With a graph structure instead of a list, KAIRO can answer the exact diagnostic questions a
human tutor would ask, but at scale and per student:

- What concept is this student actually struggling with — not the topic label, the atomic idea.
- What prerequisite is silently missing underneath the concept that's visibly failing.
- What is the single most useful next thing to learn, given everything already Held.
- Which concept, forgotten weeks ago, is quietly resurfacing as today's error.
- Which questions would genuinely reinforce the same understanding, not just look similar.

None of these are answerable from a list. All of them are native to a graph.

### 1.4 The graph serves retention, not just sequencing

Most curriculum maps exist to answer "what comes next in the syllabus." The SKG has a second,
equally important job: it is the structural surface the Memory Scheduling system (Learning
Engine Phase 2 §5) and the Misconception Library (Question Intelligence Model §4) actually run
on. A concept's position in the graph — how many things depend on it, how central it is to the
subject — is not just curricular trivia. It directly determines how aggressively it should be
protected from decay. A foundational, heavily-depended-upon concept fading is a much more
urgent event than a rarely-used advanced one fading. The graph is what lets the Learning
Engine tell the difference.

### 1.5 The brand principle underneath this

TECHMED's standard asks, of everything: does this reduce confusion, or does it add to it? A
student's confusion is very often not "I don't understand this concept" — it is "I don't
understand *why* I don't understand this concept, or what I'm actually missing underneath it."
The SKG exists to answer that second, more useful question. This is the structural expression
of "From Confusion to Mastery," not just a supporting brand line, but a literal description of
what traversing this graph in the right direction should feel like to a student.

---

## SECTION 2 — SUBJECT HIERARCHY

### 2.1 The seven-level structure

```
Subject
  ↓
Major Theme
  ↓
Topic
  ↓
Sub-topic
  ↓
Core Concept
  ↓
Micro Concept
  ↓
Learning Objective
  ↓
Question
```

### 2.2 Why each level exists

| Level | What it represents | Why it can't be collapsed into a neighboring level |
|---|---|---|
| **Subject** | Chemistry, Physics, Biology, Mathematics, English, etc. | The top-level scope boundary — determines which Subject Combination (Student Intelligence Model §1) applies |
| **Major Theme** | A large organizing idea within a subject (e.g., "Chemical Bonding," "Mechanics," "Cell Biology") | Themes are how a subject is taught conceptually, not how it's tested — this level lets Kai speak about a student's standing at a level a human would recognize ("your bonding is solid, your kinetics is shaky"), which no lower level does well |
| **Topic** | The syllabus-recognizable unit (e.g., "Ionic Bonding," "Newton's Laws") | This is the level students and the JAMB syllabus itself use — needed so KAIRO's language maps onto the language a student already has in their head |
| **Sub-topic** | A finer slice of a topic (e.g., "Formation of Ionic Compounds," "Lattice Energy") | Topics are often too broad for a single retention state to be meaningful — a student can be strong in one sub-topic and weak in an adjacent one under the same topic label |
| **Core Concept** | The Concept Node vocabulary from the Learning Engine (Phase 1 §1.1) — one atomic, testable unit of understanding | This is the actual unit the engine reasons over. Everything above this level is human-facing organization; everything at and below it is what retention_state, decay_estimate, and confidence_score attach to |
| **Micro Concept** | A component piece of a Core Concept, used only where a concept is genuinely composite (e.g., "balancing redox equations" decomposes into "assigning oxidation states" + "balancing electrons" + "balancing charge") | Not every Core Concept needs this level — it exists specifically to let multi-step diagnostic tagging (Question Intelligence Model §3.3) attribute a wrong answer to the exact step that broke, not the whole concept |
| **Learning Objective** | A plain-language statement of what mastery of this concept demonstrates | This is what Kai actually says to explain *why* a question was chosen — the human-readable face of a Core Concept |
| **Question** | The individual item, as defined fully in the Question Intelligence Model | The leaf of the tree — where all of the above becomes something a student actually does |

### 2.3 Why seven levels and not fewer

A three-level structure (Subject → Topic → Question) is what most CBT platforms use, and it is
too coarse for anything the Learning Engine needs — a "Topic" is not small enough to carry an
honest `retention_state`. A structure with more than seven levels becomes unusable for the
curriculum team to actually populate and for Kai to reason about in plain language. Seven is
the point where every level earns its existence: each one is consumed by a different part of
KAIRO (student-facing summaries, syllabus alignment, the engine's core unit, diagnostic
attribution, Kai's explanations) and none of them is redundant with its neighbor.

### 2.4 Not every subject needs every level fully populated

English Language, for example, rarely needs a Micro Concept layer — its Core Concepts
(e.g., "identifying the main idea in a passage") are rarely decomposable into clean sub-steps
the way a calculation-heavy Chemistry concept is. The hierarchy is a maximum structure, not a
mandatory one — a subject uses as many levels as its own internal logic actually requires.

---

## SECTION 3 — CONCEPT NODES

### 3.1 The concept object

A Core Concept (and, where used, a Micro Concept) is the unit everything else in the SKG
attaches to. Its structural fields — separate from the per-student state fields already defined
in the Learning Engine (Phase 1 §1.1) — are:

| Field | What it is | Why it exists |
|---|---|---|
| **Name** | The atomic, precise name of the idea (e.g., "balancing redox equations," not "Electrochemistry") | Precision here is what lets every downstream system — QIM concept attachment, Kai's explanations, the Learning Engine's diagnostic logic — refer to the same exact thing without ambiguity |
| **Description** | A short, unambiguous statement of what this concept actually covers, and — just as importantly — what it does *not* cover | Prevents scope drift where two curriculum contributors tag questions to the same concept name but mean slightly different things |
| **Learning objective** | The plain-language "a student who has mastered this can..." statement | Feeds Kai's explanation layer (Question Intelligence Model §9.1) and the student-facing framing of *why* something was recommended |
| **Importance** | A structural weighting of how central this concept is within the graph — a function of how many other concepts depend on it (Section 4), not a subjective curriculum-team opinion | Drives how aggressively decay is protected (Section 1.4) and how heavily a gap here should propagate warnings elsewhere (Section 8) |
| **Prerequisites** | The set of Core Concepts that must be at least Held before this concept can be fairly attempted | The direct implementation of "check the prerequisite before assuming the advanced concept is the problem" (Learning Engine §1.2) |
| **Dependent concepts** | The inverse of prerequisites — everything that lists this concept as a prerequisite | Lets the engine calculate blast radius: if this concept is Fading, what else is put at risk |
| **Difficulty** | The concept-level difficulty baseline, distinct from any single question's difficulty rating (Question Intelligence Model §5) | Question difficulty is calibrated per-item; concept difficulty is the structural baseline those individual calibrations are checked against |
| **Typical misconceptions** | The concept-level rollup of the Misconception Library (Question Intelligence Model §4) — the patterns that recur across many questions testing this concept, not just one | Lets Kai speak about a *concept-level* pattern ("this is the third time confusing mole ratio with molar mass has shown up") rather than only question-level ones |
| **Memory difficulty** | A structural estimate of how fast this *type* of concept tends to decay across students in general (e.g., multi-step mechanisms decay faster than fixed facts) — the concept-level starting point that the Learning Engine's personalized decay model (Phase 2 §5.2) then adjusts per student | Gives the personalized decay function a sane, subject-informed starting point instead of a flat universal default |
| **Recommended revision interval** | The structural default spacing before any student-specific decay data exists | Used only during a student's early Forming/Orienting period (Learning Engine §3.1), before enough personal data exists to override it |
| **Related questions** | Pointer into the Question Intelligence Model's question pool tagged to this concept | The join point between the SKG and the QIM (Question Intelligence Model §3.1) |
| **Related concepts** | Non-hierarchical connections — see Section 4 for the full relationship taxonomy | Distinguishes "connected to" from "depends on," since not every meaningful relationship is a dependency |
| **Mastery threshold** | The confidence_score and accuracy pattern required for this specific concept to be considered Held (Learning Engine §2.2) | Not every concept should require the same bar — a foundational, high-stakes concept (e.g., mole concept) may reasonably require a stricter threshold than a peripheral one |

### 3.2 Why concept-level fields are separate from student-level state

The Learning Engine already tracks `retention_state`, `confidence_score`, and `decay_estimate`
*per student, per concept* (Phase 1 §1.1). The fields above are deliberately **not**
per-student — they describe the concept itself, once, regardless of how many students exist.
This separation is what keeps the graph a stable, shared structure that many students'
individual Knowledge Maps can all reference, rather than something that has to be duplicated or
re-derived per student.

---

## SECTION 4 — RELATIONSHIPS BETWEEN CONCEPTS

A dependency edge (Section 3.1's Prerequisites/Dependents) is only one kind of connection.
Real understanding is a richer network than a strict tree.

| Relationship | Meaning | When it's used |
|---|---|---|
| **Prerequisite** | Concept A must be at least Held before Concept B can be fairly attempted | The load-bearing relationship — drives prerequisite-routing (Learning Engine §1.2) and locked/recommended progression (Section 5) |
| **Builds Upon** | Concept B extends Concept A without strictly requiring full mastery first — a softer dependency | Used where a concept is *helped by* prior exposure but not blocked without it, allowing more flexible progression than a hard Prerequisite |
| **Reinforces** | Practicing Concept B measurably strengthens retention of Concept A, without B being a prerequisite of A | Powers interleaving decisions (Learning Engine §5.3) — lets the engine choose a session mix that quietly protects older concepts while teaching new ones |
| **Often Confused With** | Two concepts that students commonly mix up, independent of any shared prerequisite | The structural source of `misapplied_rule` tagging (Learning Engine §1.4) — this relationship is what lets a question's distractor be pre-identified as "the answer you'd get if you confused these two" |
| **Extension Of** | Concept B is the natural next step after Concept A, going deeper into the same idea rather than a different one | Powers Extension-type question relationships (Question Intelligence Model §6.2) and the Compounding Macro-State's push toward harder material on the same concept family |
| **Alternative Representation** | The same underlying idea, expressed through a different lens (e.g., a rate law expressed algebraically vs. graphically) | Powers "varied question framing" (Learning Engine §1.3) — the mechanism that produces an honest confidence_score rather than one inflated by pattern-recognition of a single phrasing |
| **Foundation For** | The inverse framing of Prerequisite, expressed from the foundational concept's point of view — used specifically to identify high-leverage foundational concepts | Distinguishes "this is *a* prerequisite of one thing" from "this is *the* foundation many things sit on" — feeds the Importance field (Section 3.1) |
| **Frequently Revised Together** | Concepts that empirically tend to fade on a similar timeline for the same students, independent of any conceptual link | A purely empirical relationship, discovered from real decay data rather than authored by the curriculum team — used to batch efficient revision sessions (Section 9) |
| **Cross-Subject Connection** | A dependency or reinforcement relationship that crosses a subject boundary entirely | Covered fully in Section 7 — kept as its own relationship type because it behaves differently in the engine (it can't be used for hard prerequisite-locking the way an in-subject relationship can, since subjects are often studied out of sync with each other) |

### 4.1 Authored vs. discovered relationships

Prerequisite, Builds Upon, Often Confused With, Extension Of, Alternative Representation, and
Foundation For are **authored** — the curriculum team defines them deliberately, because they
reflect real structural facts about the subject matter. Reinforces and Frequently Revised
Together can be **either authored or discovered** — they start as curriculum-team judgment but
are refined over time as real attempt data reveals patterns the original authoring didn't
anticipate (see Section 10). This mirrors the Question Intelligence Model's own posture toward
difficulty (QIM §5.3): structural authoring gives a sane starting point; behavior in the field
is trusted to refine it.

---

## SECTION 5 — LEARNING DEPENDENCIES

### 5.1 Locked progression

Reserved for genuinely hard Prerequisite relationships where attempting the dependent concept
without the prerequisite produces meaningless signal — not "harder," but actually
undiagnosable (e.g., attempting stoichiometry calculations with zero grasp of mole concept
doesn't tell the engine anything useful about the student's stoichiometry understanding; it
only confirms the mole gap it already suspected). Locking should be used sparingly — its cost is
real friction, and TECHMED's standard explicitly rejects unnecessary decision fatigue and
gatekeeping. It is reserved for cases where skipping ahead would actively corrupt the Knowledge
Model's data quality, not merely cases where the curriculum team thinks a student "should"
learn things in order.

### 5.2 Recommended progression

The default mode for the large majority of the graph. The Recommendation Engine (Learning
Engine §4.1) uses Prerequisite and Builds Upon edges to *bias* session planning toward a
sensible order, without hard-blocking a student from attempting something out of sequence. A
strong student who wants to attempt an advanced topic early should be able to — the engine
simply weights the session to quietly reinforce the underlying foundation alongside it, rather
than refusing the request outright.

### 5.3 Flexible progression

Applies where the graph itself doesn't impose a strict order — parallel topics within a Major
Theme that don't depend on each other (e.g., within Biology, "genetics" and "ecology" have no
real dependency relationship). Here the Recommendation Engine's breadth guarantee (Learning
Engine §4.1, priority 5) governs sequencing, not the graph's structure.

### 5.4 Recovery routes

When a student is diagnosed as missing a prerequisite mid-session (Learning Engine §4.2's
`conceptual_gap` handling), the graph must supply a **recovery route**: the shortest legitimate
path back to solid footing, not a demand to restart the entire dependency chain from the
beginning. This is typically a single prerequisite hop, using the nearest unmet Prerequisite
edge — the graph should never force a student searching for one missing piece to wade through
the full foundational sequence again, which would violate "Consistency Should Be Supported, Not
Punished" as surely as a broken streak would.

### 5.5 Bridge concepts

Some concepts exist structurally to *connect* two areas of the graph that would otherwise feel
unrelated to the student, even though they share real dependency (e.g., "using algebraic
substitution," which sits underneath both Chemistry equilibrium calculations and Physics
kinematics equations). Bridge concepts are explicitly flagged in the graph so that a gap in one
of them is recognized as a *cross-cutting* gap (Section 7), not mistakenly diagnosed as two
unrelated subject-specific weaknesses.

### 5.6 Confidence rebuilding

Where a Prerequisite gap is identified for a student who is otherwise performing well (a
Wavering or temporarily-disrupted student, not a genuinely New Learner), the recovery route
should be biased toward Alternative Representation and Reinforcement relationships on the
missing prerequisite, rather than a from-scratch re-teach — the goal is to reconnect existing,
mostly-intact understanding, not to imply the student is starting over. This is the graph-level
expression of the Recovering Macro-State's "we're starting light today, on purpose" posture
(Learning Engine Phase 2 §10.2).

---

## SECTION 6 — MASTERY ACROSS THE GRAPH

### 6.1 Mastery is not contagious by default

The single most important rule in this section: **mastering one concept does not automatically
mark a related concept as mastered.** A student who correctly answers ionic bonding questions
has not thereby demonstrated covalent bonding understanding, even though the two share a Major
Theme and even reference similar vocabulary. Propagating mastery by proximity would corrupt the
entire Knowledge Model with false positives — exactly the "dashboard full of green checkmarks
that don't correspond to actual exam-day readiness" failure mode the Learning Engine's retention
states were built to prevent (Learning Engine §2.4).

### 6.2 Where partial propagation is legitimate

Propagation is allowed only through specific, narrow mechanisms, and always as a *confidence
signal adjustment*, never as a direct state promotion:

- **Along Alternative Representation edges** — correctly answering the same concept expressed a
  new way modestly raises `confidence_score` for the concept as a whole (this is the intended
  behavior of "varied question framing" scoring, Learning Engine §1.3), because it's evidence
  of the *same* concept, not a related one.
- **Along Reinforces edges** — practicing Concept B nudges Concept A's `decay_estimate` slightly
  in the positive direction (Section 4), because genuine cognitive reinforcement is a real,
  studied phenomenon — but this never moves `retention_state` on its own; it only slows decay.
- **Along Foundation For edges, in the failure direction only** — if a heavily-depended-upon
  foundational concept drops to Fading or below, every concept that lists it as a Prerequisite
  should have its `decay_estimate` confidence *lowered* (not its state changed) as a precaution,
  because a shaky foundation genuinely puts everything built on it at real risk. This is
  propagation of *doubt*, which is safe to be liberal with, unlike propagation of *credit*,
  which must be conservative.

### 6.3 The asymmetry principle

Bad news should propagate more readily through the graph than good news. A gap discovered in a
foundational concept is a legitimate reason to flag every dependent concept for a closer look.
A success in one concept is *not* a legitimate reason to assume success in a related one. This
asymmetry is deliberate and mirrors the Learning Engine's own posture (Phase 1 §2.4): the
system's internal picture of a student should always be more conservative than what a
leaderboard would suggest, never the reverse.

---

## SECTION 7 — CROSS-SUBJECT INTELLIGENCE

### 7.1 Why this matters specifically for UTME

UTME subject combinations are not studied in isolation by real students, and the exam itself
does not respect subject boundaries the way a syllabus outline implies. A student's shaky
algebra doesn't just cost them in Mathematics — it silently costs them in Chemistry
stoichiometry, Physics kinematics, and even Economics graph interpretation. A platform that
treats subjects as fully separate silos will misdiagnose a single underlying gap as three or
four unrelated subject weaknesses, and will recommend three or four unrelated remediation paths
instead of one efficient one.

### 7.2 Representative cross-subject links

| Cross-subject connection | Underlying shared concept | Why it matters |
|---|---|---|
| Chemistry calculations ↔ Mathematics | Algebraic manipulation, ratio and proportion, unit conversion | A student who is strong in Chemistry theory but weak in these Mathematics fundamentals will consistently underperform on calculation-heavy Chemistry questions in a way that looks like a Chemistry gap but isn't |
| Physics graphs ↔ Mathematics | Gradient/slope interpretation, area under a curve | Misreading a velocity-time graph is very often a graph-literacy gap, not a kinematics gap — the SKG lets the engine tell the difference before recommending more Physics practice that won't fix the real problem |
| Biology genetics ↔ Mathematics/Chemistry | Probability, ratio reasoning; molecular structure concepts | Genetics crosses (e.g., Mendelian ratios) fail for students who understand biology fine but haven't internalized the underlying probability logic |
| English comprehension ↔ All subjects | Reading load, precise interpretation of multi-clause question stems | This is the most consequential cross-subject link in the whole graph — a `misread_question` tag (Learning Engine §1.4) in *any* subject may actually be an English comprehension gap wearing a different subject's clothes |

### 7.3 How KAIRO uses these links

- **Diagnostic reattribution.** When a `misapplied_rule` or `conceptual_gap` tag recurs across
  multiple subjects that share a Cross-Subject Connection, the engine reattributes the real gap
  to the shared underlying concept rather than treating each subject's symptom independently
  (this is the direct graph-level implementation of the Misconception Library's cross-concept
  pattern detection, Question Intelligence Model §4.2).
- **Efficient remediation.** Fixing one cross-cutting concept (e.g., algebraic manipulation)
  produces measurable improvement across every subject that depends on it — this is a
  legitimate case for flagging multiple subjects' dashboards simultaneously, since it's the same
  underlying fix, not several unrelated ones.
- **Session composition.** The Recommendation Engine's breadth guarantee (Learning Engine §4.1)
  can use Cross-Subject Connections to choose which "different subject" question to surface
  next — deliberately picking one that reinforces a currently-weak cross-cutting skill rather
  than a subject at random.

### 7.4 What Cross-Subject Connections are not used for

They are never used for hard prerequisite-locking (Section 5.1) across subjects, since students
legitimately study subjects out of sync with each other and locking Chemistry behind
Mathematics progress would violate the recommended-not-locked principle unnecessarily. They
inform diagnosis and recommendation; they never gate access.

---

## SECTION 8 — KNOWLEDGE GAPS

### 8.1 What a gap is, structurally

A knowledge gap is any concept the graph indicates *should* be Held (because it's a prerequisite
of something the student is actively attempting) but whose actual `retention_state` is Unseen,
Forming, or Fading. The SKG is what makes a gap *detectable* — the Learning Engine already
computes this per student (Phase 1 §1.2, Section 2 "Knowledge gaps" of the Student Intelligence
Model) by walking the graph's dependency edges; this section defines how the graph itself
classifies what kind of gap it's looking at.

### 8.2 Gap severity classification

| Severity | Definition | Engine response |
|---|---|---|
| **Critical gap** | A missing Prerequisite (Section 5.1-tier, hard dependency) that is also high-Importance (Section 3.1) — i.e., many other concepts depend on it | Highest-priority insertion in session planning (Learning Engine §4.1 priority 2), overriding most other queue considerations |
| **Recoverable gap** | A missing Builds Upon (soft) relationship, or a Prerequisite with low Importance | Recommended, not forced — folded into normal session planning rather than interrupting the current activity |
| **Hidden gap** | A concept marked Held on paper (correct answers exist) but with a low `confidence_score` or a confidence pattern suggesting the correct answers came from memorization rather than understanding (Question Intelligence Model §4.1's "memorised, not understood" misconception category) | Flagged for Alternative Representation practice (Section 4) rather than treated as solid — this is the graph-level defense against the Learning Engine's own stated failure mode of false-positive green checkmarks |
| **Repeated gap** | A concept that has cycled Fading → attempted remediation → Fading again more than once for the same student | Escalates from the standard `conceptual_gap` response (Learning Engine §7.3) to the Plateau-style alternate-explanation-approach response (Learning Engine §11, Student Intelligence Model §5's Plateau state) — repeating the identical remediation a third time is assumed to have already failed |

### 8.3 How gap severity shapes recommendations

Severity is not just a label — it's a weighting input into the Recommendation Engine's
session-level priority order (Learning Engine §4.1). Critical gaps compete directly with Urgent
Decay for the top slot; Recoverable gaps compete at the level of ordinary session composition;
Hidden gaps don't interrupt a session at all, but bias which *type* of question (Alternative
Representation, specifically) gets selected the next time that concept comes up naturally.

---

## SECTION 9 — REVISION PATHS

Instead of a single generic "revision" mode, the graph supports distinct navigation patterns,
each pulling a different slice of the graph for a different purpose. All of these consume the
Memory Scheduling mechanics already defined in the Learning Engine (Phase 2 §5) — this section
defines *which part of the graph* each path walks.

| Path | Graph traversal | Purpose |
|---|---|---|
| **Quick revision** | Highest-urgency Fading concepts only, no dependency walking, capped session length | For a short session window — surfaces what's most at risk without attempting a full sweep |
| **Deep revision** | Fading concepts plus their Prerequisite chain, checked for silent additional decay | For a longer, deliberate session — catches the case where a concept faded *and* quietly pulled a prerequisite down with it |
| **Confidence rebuilding** | Held/Reinforced concepts only, favoring Alternative Representation questions | Used specifically during a Wavering or post-gap Recovering state — deliberately avoids Fading concepts so the session produces genuine, evidence-based wins (Learning Engine §7.4) |
| **Exam sprint review** | Every concept within the active exam-proximity window (Learning Engine §5.2), interleaved and difficulty-compressed | Used in the final 6–8 weeks pre-exam — trades long-term optimal spacing for maximum exam-day readiness, per the engine's own stated proximity override |
| **Recovery review** | The specific recovery route (Section 5.4) for a single diagnosed prerequisite gap | The narrowest, most targeted path — a single hop back, not a general sweep |
| **Weak-topic review** | All concepts within a Topic or Sub-topic (Section 2) whose aggregate mastery (Student Intelligence Model §2) sits below threshold | Used when a student or Kai wants to address an entire recognizable topic, not just individual concepts — this is the level most legible to a student's own sense of "I'm bad at organic chemistry" |
| **Forgotten concept review** | Concepts currently in Fading state with the longest elapsed time since last correct recall, regardless of Importance | The pure decay-driven path — exists specifically to catch low-Importance concepts that would otherwise never win a priority contest against Critical gaps but still deserve to resurface eventually |

Each path is a different *query* over the same graph and the same underlying student state —
none of them require separate data structures, which keeps the model internally consistent
(the same principle the Student Intelligence Model applies to its own metrics, Section 6 of
that document).

---

## SECTION 10 — UPDATING THE GRAPH

### 10.1 The graph is living, not fixed at launch

Per TECHMED's own phased-build approach, the graph will start with real gaps in coverage —
some concepts under-populated with questions, some relationships not yet authored, some
subjects more thoroughly mapped than others. The graph must be designed to accept continuous
addition without structural rework.

### 10.2 Adding new questions

New questions attach to existing Core/Micro Concepts through the same tagging pipeline defined
in the Question Intelligence Model (§10, "Imported → Reviewed → Tagged → Linked to concepts").
If a genuinely new concept is required, it is added as a new node with its own Prerequisite
edges authored before the question goes live — a question is never allowed to attach to a
concept that doesn't yet exist in the graph, since that would silently create an untracked gap
in coverage.

### 10.3 Adding new concepts

New Core Concepts can be added at any level of the hierarchy without disturbing existing nodes,
provided their Prerequisite and Dependent relationships are authored at creation time. A
concept added with zero relationships is a structural error — it becomes an unreachable island
the Recommendation Engine can't reason about (no path in, no path out), so the graph's minimum
requirement for any new node is at least one relationship of any type.

### 10.4 Updating explanations and misconceptions

Explanation content (Question Intelligence Model §9) and misconception profiles (§4) update
independently of the concept structure itself — refining *how* a concept is taught or *which*
misconceptions are tracked never requires touching the concept's position in the graph. This
mirrors the QIM's own difficulty-calibration posture (§5.3): structural facts (what depends on
what) are stable; teaching content built on top of that structure is expected to keep
improving.

### 10.5 Responding to exam trend shifts

JAMB syllabus emphasis shifts over time — some topics become more heavily tested, others fade
from relevance. This is handled as a metadata update (adjusting a concept's Importance or a
topic's weighting) rather than a structural change to the graph. The dependency reality
underneath a subject doesn't change year to year even when exam emphasis does; the graph should
reflect that distinction by keeping the two kinds of information separately updatable.

### 10.6 Discovered relationships feeding back into authored ones

As described in Section 4.1, empirically-discovered relationships (Reinforces, Frequently
Revised Together) should periodically be reviewed by the curriculum team and, where they reveal
a genuine structural fact the original authoring missed, promoted into more formal relationship
types. This is the graph's own version of the Question Intelligence Model's difficulty
recalibration loop (§5.3) — real behavior is allowed to correct original design assumptions.

---

## SECTION 11 — KAI'S USE OF THE GRAPH

The graph itself is never shown to a student as a graph — no visible node map, no dependency
diagram. It is entirely internal infrastructure. Everything a student experiences from it
arrives translated into Kai's plain-language voice (Learning Engine Phase 2 §7), consistent
with "Clarity is a product feature" and the Question Intelligence Model's design note that raw
metadata stays internal.

| Kai moment | How the graph is used |
|---|---|
| **Explaining mistakes** | Pulls the failed concept's Prerequisite edges to check whether the real issue sits one level down, and its Often Confused With edges to name the specific adjacent idea that may have been substituted |
| **Choosing follow-up questions** | Walks Reinforcement, Extension, and Alternative Representation edges (Section 4) from the current concept, exactly as described in Question Intelligence Model §6.3 |
| **Detecting misconceptions** | Cross-references the concept's Typical Misconceptions field (Section 3.1) against the specific distractor selected, turning a wrong answer into a named pattern rather than a generic "incorrect" |
| **Giving encouragement** | Uses the Importance field (Section 3.1) to calibrate how meaningful a given Reinforced transition actually is — reinforcing a high-Importance foundational concept is a bigger deal than reinforcing a peripheral one, and Kai's specificity (Learning Engine §7.1) should reflect that difference |
| **Planning today's mission** | The Recommendation Engine's session plan (Learning Engine §4.1) is built by walking exactly the structures defined in this document — Prerequisite chains for gap-checking, Importance for urgency weighting, Cross-Subject Connections for breadth allocation |
| **Preparing weekly reports** | Uses Major Theme and Topic-level rollups (Section 2) to describe progress at the level a student actually recognizes, rather than listing raw Concept Node names |
| **Generating monthly insights** | Surfaces genuine structural milestones — e.g., a Foundation For concept finally reaching Held after being a recurring gap — since these are the most narratively meaningful, evidence-backed moments the Monthly Reflection (Learning Engine Phase 2 §8.3) can report |
| **Predicting exam readiness** | Exam Readiness (Student Intelligence Model §6) is weighted by concept Importance — being solid across many high-Importance foundational concepts contributes more to readiness than the same count of low-Importance peripheral ones |

---

## SECTION 12 — FUTURE EXPANSION

The SKG is deliberately built so the following extensions attach to the existing structure
rather than requiring it to be redesigned:

- **WAEC / NECO.** These share substantial conceptual overlap with the UTME syllabus at the
  Core Concept level, even where surface question style and topic emphasis differ. Expansion is
  primarily a matter of adding an exam-body tag (mirroring the Question Intelligence Model's
  Exam body field, §2.5) and authoring any exam-specific concepts not already present — the
  Subject → Theme → Topic → Concept spine does not need to change.
- **Post-UTME.** Post-UTME content frequently assumes UTME-level foundations are already Held —
  the SKG's existing dependency structure means Post-UTME concepts can be added as Extension Of
  and Builds Upon relationships on top of existing UTME concepts, rather than as a disconnected
  parallel graph.
- **University courses.** The same seven-level hierarchy and relationship taxonomy scale upward
  to first-year university content in the same subjects — a new Major Theme, not a new
  architecture, exactly as the Learning Engine's own scalability section anticipates (Learning
  Engine Phase 2 §12).
- **Scholarship exams.** Typically test a subset of existing concepts under different framing or
  time constraints — handled as a new exam-body tag plus, where needed, new Alternative
  Representation questions on existing concepts, not new graph structure.
- **Professional examinations.** Further out, but structurally the same pattern: new Subjects
  and Major Themes attach to the existing model without requiring the seven-level structure,
  the relationship taxonomy, or the mastery-propagation rules (Section 6) to be redesigned.

The general principle, consistent with every other TECHMED architecture document: new subject
matter is new *content* inside this structure, never a reason to change the structure itself.

---

## FINAL OUTPUT — WHY THE SUBJECT KNOWLEDGE GRAPH IS KAIRO'S MAP

The Learning Engine decides what a student should do next. The Student Intelligence Model
remembers who that student is over time. The Question Intelligence Model turns every question
into a sensor that teaches the system something. None of those three systems can function on
good instinct — they all need a shared, structural understanding of the subject matter itself,
one that is consistent whether it's being read by the engine, by Kai, or by the curriculum
team. That understanding is the Subject Knowledge Graph.

A syllabus is a list. A question bank organized by topic is a filing cabinet. The Subject
Knowledge Graph is neither — it is a map of how everything a UTME student needs to know
actually depends on, reinforces, and connects to everything else. Without it, a "prerequisite
gap" is just a guess, a "cross-subject weakness" is invisible, and a wrong answer only ever
means "incorrect" rather than pointing to something specific and fixable underneath it. With
it, every other system in KAIRO — recommendation, revision, diagnosis, Kai's voice — is reading
from the same honest picture of the subject, not reinventing its own fragmented understanding
independently.

This is what turns KAIRO from a question bank into something closer to what a great human
tutor actually carries in their head: not just a list of what a student got right or wrong, but
a real, structural understanding of how one piece of knowledge holds up everything built on
top of it — and therefore, at any given moment, exactly what a student should learn next, and
why.

**Think Smart. Perform Elite.**
