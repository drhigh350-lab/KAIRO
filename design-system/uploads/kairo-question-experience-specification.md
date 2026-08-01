# KAIRO QUESTION EXPERIENCE
## Product Specification — The Universal Question Interface

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the
Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the
Product Experience Blueprint, the Home Dashboard, and the Practice Module Specification. Does
not redesign any of them. This document defines the single screen those systems all eventually
render through — the moment a student is actually looking at a question and deciding what to
do about it.)*

---

## 0. THE GOVERNING QUESTION

Every decision in this specification exists to answer one question:

**"In the few seconds a student's eyes are on a question, is anything on this screen competing
with their thinking — and if so, why is it still there?"**

Not: what could we show. Not: what would look impressive. Not: how do we remind the student
Kairo is intelligent. **What does a student need in front of them to read clearly, decide
honestly, and answer without friction — and what does Kairo need to quietly capture in the
background to keep getting smarter about them?**

If an element can't be traced back to one of those two needs, it doesn't belong on this screen.

---

## 1. PRODUCT PURPOSE

### 1.1 What the Question Experience is

The Question Experience is not a feature. It is the shared rendering surface — the single
interface definition that Practice, Learn, CBT Exam Mode, and Challenges all use to present a
question to a student. Practice specifies *what* question to show and *when* (Practice Module
§4–5). The Question Experience specifies *how that question actually appears and behaves* once
chosen.

Designing this once, rather than once per feature, is a direct expression of the TECHMED
brand standard's Consistency principle (Branding Standard §12): *a student should be able to
encounter TECHMED in different places and still recognise the same organisation.* A student who
answers a question inside a Challenge and a question inside CBT Exam Mode should recognise it
as the same product wearing different context — not two different apps stitched together.

### 1.2 What it is for

The Question Experience exists to make the single highest-frequency moment in the entire
product — a student looking at one question — as frictionless and as information-rich as
possible, simultaneously. This is a real tension, not a solved problem stated once: every pixel
that helps Kairo learn about the student is a pixel that risks distracting the student from the
question itself. Section 2 resolves this tension with a standing rule, not a case-by-case
judgment call.

### 1.3 How it supports each feature

| Feature | What it needs from the Question Experience |
|---|---|
| **Practice** | Adaptive, forgiving, explanatory, linear (Practice Module §1.3) — feedback appears immediately, explanations are one tap away, the student is never rushed |
| **Learn** | The same player rendering a single question anchored to a concept, entered from an explanation or a concept summary rather than from a queue (Product Experience Blueprint §5) — often just one question at a time, not a session |
| **CBT Exam Mode** | Exam-authentic, non-adaptive mid-attempt, freely navigable via a question grid, explanations withheld until submission (Product Experience Blueprint §3) |
| **Challenges** | Fast, low-stakes, visually lighter, built for a student who may not even have an account yet (Product Experience Blueprint §4) |

The Question Experience does not choose which of these postures applies. It receives a **mode
flag** from whichever feature launched it and adjusts its own behaviour accordingly — the
screen anatomy in Section 3 stays structurally the same across all four; what changes is
covered fully in Section 10.

### 1.4 The one-sentence purpose statement

**The Question Experience is the moment Kairo's intelligence and a student's thinking meet
face to face — and the entire design obligation is to make sure the student never notices the
intelligence, only the clarity.**

---

## 2. DESIGN PHILOSOPHY

### 2.1 Maximum focus

At any given moment, exactly one thing should be asking for the student's attention: the
question, or the feedback about the question they just answered. Never both at once, and never
either alongside something unrelated (a promotion, a streak reminder, a score animation). This
is the screen-level expression of "Clarity is a product feature" (Branding Standard §4.1)
applied to its most literal case — the fewer things competing for attention, the more clearly a
student can think.

### 2.2 Minimal distractions

Every persistent UI element (header, progress bar, bottom actions) must justify its permanent
presence against the cost of occupying screen space during focused reading. Elements that don't
need to be visible during reading — bookmark, report, exit — are present but visually quiet
(Section 3.9), never competing in size or colour with the question itself.

### 2.3 Fast decision-making

The path from reading a question to submitting an answer must never require more taps than the
decision itself needs. One tap to select an option. One tap to confirm, where confirmation
exists at all (Section 4.3). No modal dialogs, no "are you sure" interruptions for an ordinary
answer submission — reserving friction for the rare cases that actually warrant it (exiting
mid-CBT-attempt, submitting an exam).

### 2.4 Comfortable reading

UTME questions are frequently dense — multi-clause stems, embedded conditions, sometimes a
table or diagram the student must cross-reference while reading. The screen must be engineered
for sustained, comfortable reading on a mobile device first, not a repurposed desktop layout —
generous line height, adequate contrast, and typography that does not fatigue a student
attempting their fortieth question of the session (Kairo Visual Identity Part 2, referenced
directly in Practice Module §5.2).

### 2.5 Accessibility

A student on an older or smaller device, a student who is colour-blind, a student with a long
diagram-heavy question — none of these should experience a degraded or unfair version of the
Question Experience. Accessibility is treated as a baseline requirement of the screen, not an
enhancement layered on afterward (full treatment in Section 8).

### 2.6 Confidence-building

The screen's tone — through colour, wording, and pacing — should never make a student feel
surveilled or judged while they're still deciding. Confidence-building happens through what
happens *after* an answer (Section 5), but it starts with the screen not feeling like a test
even when, in CBT Exam Mode, it technically is one.

### 2.7 Mobile-first

Every specification in this document assumes a mobile screen as the primary canvas, per
Kairo's own accessibility standard (Practice Module §5.9) and the reality of the audience
(TECHMED Brand Overview §6 — students consuming most content on phones with variable
connectivity). Larger screens receive a scaled-up version of the same layout, never a
functionally different one.

### 2.8 The governing design test

Before any element is added to this screen, it must pass: **does this help the student think
more clearly, or does it just look like Kairo is doing something intelligent?** Only the first
justifies a place on the screen. The second belongs in Insights, where a student goes
specifically to see Kairo's intelligence made visible (Product Experience Blueprint §7) — not
here, where they came to think.

---

## 3. SCREEN ANATOMY

### 3.1 Header

Contains only what a student needs to orient themselves in under a second: which subject/topic
this belongs to, and where they are in the current session. Never contains promotional content,
streak counters, or score deltas — those belong to Session Completion (Practice Module §6), not
mid-question.

### 3.2 Progress indicator

A segmented bar or a simple "Question 4 of 12" label — never a raw percentage (Practice Module
§5.2 already establishes this rule; restated here as the universal standard, since Learn and
Challenges also need a lightweight sense of "how much is left," even outside a fixed-length
session). In modes without a fixed question count (e.g., an open-ended Practice queue that
adapts live), the indicator shows elapsed progress within the current mission rather than a
count against an unknown total, so it never silently becomes inaccurate.

### 3.3 Subject/topic label

Rendered in the student-facing vocabulary from the Subject Knowledge Graph (Subject Knowledge
Graph §2.2 — Topic/Sub-topic level), never a raw Concept Node name. Present because it answers
"why am I looking at this right now" at a glance, without requiring the student to open the
"Why this?" explanation (Practice Module §3.2).

### 3.4 Difficulty indicator (conditional)

Shown only where difficulty is meaningful to display — Manual Practice sessions (Practice
Module §4.6) and Challenge attempts, where a student explicitly chose or is curious about
difficulty. Always relative and plain-language ("Foundational / Standard / Advanced" or "a step
up"), per the Question Intelligence Model's standing rule that difficulty is never shown as a
raw number (Question Intelligence Model §2.3). Hidden entirely in Smart Practice, Learn, and
CBT Exam Mode, where surfacing it would either be noise (Smart Practice — the student didn't
choose it) or would compromise exam authenticity (CBT Mode — JAMB itself doesn't label
difficulty per question).

### 3.5 Question number

Folded into the progress indicator (Section 3.2) rather than duplicated as a separate element —
a screen that shows "Question 4 of 12" alongside a segmented bar showing the same thing is
redundant, and redundancy is itself a form of visual noise this specification exists to avoid.

### 3.6 Timer behaviour

| Context | Timer shown? | Framing |
|---|---|---|
| Untimed Practice (default) | No | N/A — surfacing a hidden stopwatch would quietly convert the mode, per Practice Module §5.4 |
| Timed Practice (opt-in) | Yes | Pacing aid — no red flashing, no urgency styling (Practice Module §5.4) |
| Learn | No | Learn is explicitly not time-pressured; a timer here would contradict its purpose (Section 1.5 of the Practice Module) |
| CBT Exam Mode | Yes, always | Exam-authentic — mirrors the real JAMB countdown, since familiarity with real exam pacing pressure is part of the value (Product Experience Blueprint §3) |
| Challenges | Depends on the Challenge's own configuration | Administrator-set per Challenge (Product Experience Blueprint §4) — shown plainly, framed as part of the game, not a penalty clock |

### 3.7 Question text

The dominant visual element on the screen by a wide margin. Rendered at minimum 16pt on mobile,
150% line height, mobile-safe typography (Practice Module §5.2, Kairo Visual Identity Part 2).
Long stems (Section 11) receive no special truncation — they render in full, with the layout
accommodating length rather than hiding it.

### 3.8 Images/diagrams

Render inline directly beneath the relevant portion of the stem, scaled to container width,
never requiring horizontal scroll or pinch-zoom to read legibly on a small screen (Practice
Module §5.2). A tap-to-expand affordance is available for diagrams with fine detail (e.g., a
densely labelled Biology diagram), opening into a full-screen, pinch-zoomable view that returns
cleanly to the question on dismiss.

### 3.9 Mathematical expressions

Rendered using proper mathematical typesetting (fractions, exponents, subscripts, root signs,
chemical formulae with correct subscript/superscript placement) rather than plain-text
approximations — a garbled equation is a reading-load problem masquerading as a subject-
knowledge problem, and the Question Intelligence Model already treats reading load as a
distinct, trackable dimension from concept difficulty (Question Intelligence Model §2.3). Poor
math rendering would silently corrupt that distinction at the point of display.

### 3.10 Options

Full-width, tappable option cards, minimum 48px touch target (Practice Module §5.2). Never a
cramped radio-button list. Selected-but-unsubmitted state is visually distinct from both the
default state and the post-submission feedback states (Section 5), so a student always knows,
at a glance, which of the three states they're currently in.

### 3.11 Navigation controls

- **Linear (Practice, Learn, Challenges):** a single forward action, contextually labelled
  ("Submit Answer" before answering, "Next" after feedback is shown) — no back navigation to a
  previously submitted question, consistent with the platform-wide rule that a submitted answer
  is locked (Practice Module §5.3).
- **Grid-navigable (CBT Exam Mode only):** a question navigator grid showing answered, flagged,
  and unanswered items, allowing free jump-around in either direction — the one structural
  deviation from the shared player, justified entirely by exam authenticity (Section 10.3).

### 3.12 Bookmark

A single-tap toggle, available on every question, in every mode, before or after answering
(Practice Module §5.7). Low visual weight — an icon, not a labelled button — since it is a
secondary action a student reaches for occasionally, not a primary one competing for attention.

### 3.13 Report Question

A low-visual-weight flag icon opening a short, structured, non-blocking form (Practice Module
§5.8). Present in every mode except live CBT Exam Mode attempts, where surfacing a report
affordance mid-timed-exam would be a distraction inconsistent with exam authenticity — CBT
questions can still be reported from the post-submission Performance Report screen instead
(Product Experience Blueprint §3).

### 3.14 Exit button

Present in every mode, always low-visual-weight, positioned in the header where it won't be
mistaken for a primary action. Behaviour differs sharply by mode (Section 10) but the
*affordance itself* — a clearly available, honest way out — is universal. A student should
never feel trapped inside a question screen.

---

## 4. STUDENT INTERACTION FLOW

```
Question loads
   ↓
Student reads (silently tracked: reading time, Section 9)
   ↓
Student selects an answer
   → Selection is visually confirmed (card state change) but not yet submitted
   → Student may change their selection freely at this stage — this is not
     the "changed answer" case in Section 5, which refers to post-submission
   ↓
Student confirms
   → In Practice/Learn/Challenges: selecting an option IS the confirmation
     for most flows — a single tap both selects and arms the Submit action,
     which the student then taps deliberately. No separate "are you sure"
     modal.
   → In CBT Exam Mode: identical mechanic, but submission for the *whole
     exam* (not a single question) requires an explicit, deliberate
     Submission Confirmation screen (Product Experience Blueprint §3) —
     because the stakes of accidentally submitting an entire timed exam
     are categorically different from a single practice question.
   ↓
Feedback — immediate or delayed depending on mode (Section 10)
   ↓
Explanation (optional expand, Section 6) — available immediately in
Practice/Learn/Challenges; withheld entirely until after submission in
CBT Exam Mode
   ↓
Related learning surfaces (Section 6's Suggested Reinforcement Questions,
Learn deep-link) — presented, never forced
   ↓
Next question — queue-driven in Practice (Learning Engine §4.2), student-
chosen in Learn, grid-driven in CBT Exam Mode, session-fixed in Challenges
```

### 4.1 Every decision point is a data point

Each arrow in the flow above corresponds to a signal captured for the Intelligence Engine
(Section 9) — this flow is not merely a UI sequence, it is the literal trace the Question
Intelligence Model's per-attempt update cascade consumes (Question Intelligence Model §8).

---

## 5. ANSWER FEEDBACK

### 5.1 Governing rule

Feedback must always follow Kai's hard tone constraints exactly as defined upstream (Learning
Engine Phase 2 §7.2): never a bare "wrong" as standalone judgment, never comparative language,
feedback length adapted to the `error_pattern_tag` (Question Intelligence Model §9.3). This
section is the visual and interaction-level implementation of a tone system already fully
specified elsewhere — nothing here introduces a new tone rule.

### 5.2 Correct answers

Green left-border treatment (Kairo Visual Identity Part 3) paired with an icon and a short
affirming label — colour is never the sole carrier of meaning (Section 8.4). Where the concept
was in a Fading state and this answer is a candidate Reinforced transition, the feedback
includes the Wisdom Spark, reserved for genuinely meaningful moments (Learning Engine Phase 2
§7.6) — not fired on an ordinary correct answer on an already-Held concept.

### 5.3 Incorrect answers

Red left-border treatment, paired with an icon and text label. The feedback text itself is
generated from the specific `error_pattern_tag` (Question Intelligence Model §9.3): a
`careless_slip` gets a brief, light-touch acknowledgment that the reasoning was sound; a
`conceptual_gap` gets a fuller reframing toward the underlying idea. Never a bare "Incorrect"
with no accompanying reasoning.

### 5.4 Skipped questions

Available only where skipping is meaningful — CBT Exam Mode (a student can leave a question
unanswered and move on via the grid) and, sparingly, Practice (where "I don't know this one"
is itself a valid signal, distinct from a wrong answer). A skip is never penalized visually the
way an incorrect answer is — it renders as neutral, unmarked, and (in CBT Mode) flagged on the
navigator grid as unanswered rather than wrong.

### 5.5 Changed answers

Refers specifically to CBT Exam Mode, where free navigation (Section 3.11) allows a student to
return to a previously answered question before final submission and change their selection.
The interface shows the new selection with no judgment framing and no history of the prior
answer surfaced during the attempt — this is standard exam behaviour, not a diagnostic event,
and is treated as such. Outside CBT Mode, "changing" an answer isn't possible post-submission by
design (Section 3.11) — a student who wants another attempt at the same concept gets a
Reinforcement or Alternative Representation question instead (Question Intelligence Model
§6.2), never a re-roll of the identical item.

### 5.6 Timed-out questions

Relevant only where a hard per-question or whole-exam timer exists (CBT Exam Mode, some
Challenges). On time-up, the current state is auto-submitted exactly as-is — whatever was
selected counts, and an unanswered question times out as unanswered, never silently marked
wrong in a way that misrepresents what actually happened. The framing is neutral ("Time's up —
here's what was submitted"), never alarming.

---

## 6. EXPLANATION EXPERIENCE

### 6.1 Purpose

This is the direct, screen-level rendering of the Question Intelligence Model's Explanation
Intelligence structure (Question Intelligence Model §9) — the single feature the Question
Experience is most responsible for making feel valuable, since it is where a wrong (or even a
right, but shaky) answer turns into actual understanding.

### 6.2 Structure, rendered in order

1. **Correct answer** — stated plainly and immediately, first, so there is no suspense standing
   between the student and the fact they need before absorbing the reasoning.
2. **Why it is correct** — the shortest accurate reasoning path, anchored to the question's
   tagged concept (Question Intelligence Model §9.2).
3. **Why other options are incorrect** — each wrong option's explanation is drawn from the
   Misconception Library (Question Intelligence Model §4), naming the specific reasoning error
   it represents, never a generic "this is incorrect."
4. **Key concept** — the Learning Objective in plain language (Subject Knowledge Graph §3.1),
   giving the student the concept's name and purpose, not just this question's mechanics.
5. **Common student misconception** — surfaced only when genuinely common, backed by empirical
   distractor-selection data (Question Intelligence Model §9.2), framed neutrally.
6. **JAMB exam insight** — a transferable strategy tied to the question's Skills Assessed field
   (Question Intelligence Model §2.4), useful beyond this specific question.
7. **Memory tip** — a short, concrete hook built for recall at the next Fading-state encounter
   (Question Intelligence Model §9.2's "Memory anchor").
8. **Link to Learn** — a one-tap route into the full Concept Summary screen (Product Experience
   Blueprint §5) for a student who wants to go deeper than this explanation goes.
9. **Suggested reinforcement questions** — pulled from the question's Reinforcement or
   Extension relationships (Question Intelligence Model §6.2), never random.
10. **Kai's encouragement** — generated per the established tone rules (Learning Engine Phase 2
    §7.2–7.3), specific and evidence-based, closing the explanation on a forward-looking note.

### 6.3 Length is adaptive

Per Question Intelligence Model §9.3: shorter for `careless_slip` or a rare miss on an
otherwise-Held concept; fuller for `conceptual_gap` on a Forming concept, or when the student's
Macro-State is Orienting and the system should over-explain rather than under-explain (Learning
Engine Phase 2 §7.4). The Question Experience implements this by defaulting to a collapsed
"See full explanation" affordance for short cases and an already-expanded view for cases the
engine has determined warrant full attention — the student is never made to tap through
unnecessary steps to reach content the system already knows they need.

### 6.4 What the explanation never becomes

It never reconstructs a textbook chapter. Ten structural components (Section 6.2) does not mean
ten paragraphs — each component is one to a few sentences, and several (Common Misconception,
JAMB Insight) are omitted entirely when not genuinely applicable to the specific question,
rather than padded out to fill the template.

---

## 7. MEDIA SUPPORT

| Media type | Rendering approach |
|---|---|
| **Images** | Inline, scaled to container width, tap-to-expand for detail (Section 3.8) |
| **Tables** | Rendered as true responsive tables where the column count allows; where a table is too wide for mobile, it becomes horizontally scrollable *within its own bounded area* only — the rest of the screen never scrolls sideways |
| **Graphs** | Rendered as crisp vector or high-resolution raster images with tap-to-expand; axis labels and gridlines must remain legible at default (unexpanded) size, since many Physics/Economics questions depend on reading a graph accurately without necessarily needing to zoom |
| **Chemical structures** | Rendered via proper chemical structure notation (bond lines, correct atom labelling) rather than plain-text formula approximations, consistent with Section 3.9's mathematical-expression standard |
| **Mathematical notation** | Proper typesetting per Section 3.9 — never plain-text approximations of fractions, exponents, or roots |
| **Biology diagrams** | Same tap-to-expand treatment as Images/Graphs; labelled diagrams (e.g., cell structure) must remain legible at default size, since label-reading is frequently the actual skill being tested |
| **Physics illustrations** | Same standard as Biology diagrams — legible at default size, expandable for detail |

### 7.1 The shared principle

No media type should ever force a student to leave the question screen, rotate their device, or
struggle to read something legible in the original source material. If a piece of media cannot
be rendered legibly within these constraints, the Question Intelligence Model's QA gate should
have caught it before the question reached live rotation (Question Intelligence Model §11) —
the Question Experience's job is to render correctly, not to compensate for bad content.

---

## 8. ACCESSIBILITY

### 8.1 Smaller phones

The layout must remain fully functional at the smallest common mobile viewport without
horizontal scrolling of the primary content column. Option cards stack vertically without
becoming so compressed that touch targets fall below the 48px minimum (Section 3.10).

### 8.2 Larger screens

Content scales up proportionally rather than simply stretching — line length is capped at a
comfortable reading width even on a large screen or tablet, with generous margin rather than
edge-to-edge text, since unbounded line length actively hurts reading comprehension.

### 8.3 Slow devices

Media (Section 7) loads progressively, with a lightweight placeholder shown immediately so the
question text is readable before an image or diagram finishes loading — a student should never
be blocked from starting to read by a slow image fetch.

### 8.4 Colour-blind users

Correct/incorrect feedback (Section 5) always pairs colour with an icon and a text label, never
relying on colour alone to carry meaning (Practice Module §5.9, restated here as the universal
standard across every mode, not just Practice).

### 8.5 Long question stems

No truncation, no forced scrolling within a bounded text box — the stem renders at full length
within the natural page scroll, exactly like any other long-form text on the screen (Section
11.8 covers this further as an edge case for extreme length).

### 8.6 Large diagrams

Tap-to-expand (Section 3.8) is the standard answer — a diagram never forces the entire question
layout to compress or become illegible to accommodate its own size; it scales to fit and offers
detail on demand instead.

---

## 9. INTELLIGENCE ENGINE INTEGRATION

### 9.1 What is captured, and why

| Signal | What it feeds |
|---|---|
| **Time spent reading** (question load → first interaction) | Reading load calibration (Question Intelligence Model §2.3), and helps distinguish a `misread_question` error from a genuine subject-knowledge gap (Learning Engine §1.4) |
| **Time spent deciding** (first interaction → submission) | Response-time baselining against the student's own personal baseline, never a global benchmark (Learning Engine §1.3) |
| **Answer accuracy** | Direct input to `retention_state`, `confidence_score`, and the KAIRO Score's Accuracy component (Student Intelligence Model §7.3) |
| **Confidence level** (only where the optional, skippable self-check is used, Practice Module §5.5) | An additional, weak, supplementary signal only — never a replacement for the behaviourally-inferred `confidence_score` |
| **Question difficulty** | Feeds the empirical calibration loop (Question Intelligence Model §5.3) — real population performance over time refines the question's difficulty rating |
| **Topic / concept** | The join key into the Concept Node graph (Question Intelligence Model §3.1) — every other signal is meaningless without this attribution |
| **Repeated mistakes** | Feeds the Misconception Library's accumulation logic (Question Intelligence Model §4.2) and, at the concept level, the Repeated-gap classification (Subject Knowledge Graph §8.2) |
| **Hint usage** (future — see Section 12) | Reserved field; not yet active, but the data model already anticipates it so no rework is needed at launch |
| **Explanation viewed** (and how much — collapsed vs. expanded) | A signal of engagement with the teaching moment itself, feeding the Plateau-detection logic when repeated re-explanation requests occur on the same concept (Learning Engine §11) |
| **Question revisited** (CBT Mode navigation back to a prior item) | Feeds response-time and confidence baselining specifically for exam-condition behaviour, distinct from Practice-mode baselining |
| **Bookmark behaviour** | Feeds the student's saved set (Practice Module §5.7) and is itself a mild signal of self-identified importance, distinct from the engine's own weak-concept detection |

### 9.2 The standing rule

Every signal captured here flows into systems already fully specified upstream — the Question
Experience does not introduce new inference logic of its own. Its job is faithful, complete
capture at the point of contact; the reasoning about what the capture *means* belongs entirely
to the Learning Engine, the Question Intelligence Model, and the Student Intelligence Model.

### 9.3 What is never captured or inferred here

No clinical or diagnostic labelling happens at this layer (Student Intelligence Model §4's
hard boundary applies fully). No raw internal state — `retention_state`, `decay_estimate`,
`confidence_score` — is ever displayed back to the student on this screen (Daily Decision
Engine §12.3); this screen writes signal upstream, it does not render the machinery back down.

---

## 10. BEHAVIOUR ACROSS DIFFERENT MODES

| Dimension | Practice | Learn | CBT Exam Mode | Challenges |
|---|---|---|---|---|
| **Navigation** | Linear, queue-driven (Section 3.11) | Linear, single question or short carousel | Grid-navigable, free jump-around | Linear, fixed set |
| **Feedback timing** | Immediate | Immediate | Withheld until full submission | Immediate |
| **Explanation availability** | Immediate, full structure (Section 6) | Immediate, full structure — this *is* the destination | Withheld until after submission | Immediate, but may be abbreviated for pacing (Product Experience Blueprint §4) |
| **Timer** | Off by default; optional pacing aid | Off | Always on, exam-authentic | Per-Challenge configuration |
| **Difficulty indicator** | Hidden (Smart) / relative label (Manual) | Hidden | Hidden — JAMB itself doesn't label difficulty | Sometimes shown, per Challenge design |
| **Bookmark** | Available | Available | Available | Available |
| **Report Question** | Available | Available | Deferred to post-submission report screen | Available |
| **Exit behaviour** | Preserves session state exactly, resumable (Section 8.1 of Practice Module) | No session state to preserve — exiting is simply leaving | Requires explicit confirmation given the stakes of an in-progress timed exam | Preserves attempt where technically possible; may forfeit an in-progress timed Challenge, communicated clearly before exit |
| **Answer changeability** | No — locked on submission | No — locked on submission | Yes — until final exam submission, via grid navigation | No — locked on submission |
| **Adaptivity mid-session** | Full live adaptation (Learning Engine §4.2) | N/A — one question or a short fixed carousel | None — fixed, non-adaptive, exam-authentic | None — administrator-curated, fixed |

### 10.1 The shared foundation

Despite the differences in the table above, every mode uses the *identical* screen anatomy
(Section 3) and the *identical* accessibility standard (Section 8). What changes is exclusively
behavioural — which controls are active, when feedback appears, whether navigation is linear or
free. A student should never feel like they've landed on a different product when they move
between modes; they should feel like the same product wearing a different, purposeful posture.

---

## 11. EDGE CASES

### 11.1 Internet interruption

Per the offline-first principle already established (Practice Module §8.2), a question already
loaded continues to function from locally cached data. Submission is queued locally and synced
on reconnect. The student sees a calm, non-alarming "you're offline — your answer is saved"
indicator, never an error state that implies data loss.

### 11.2 Missing images

If an image reference fails to resolve, the question renders with a clearly-labelled
placeholder ("Image unavailable") rather than a broken-image icon or blank space that could be
mistaken for a rendering bug — and the question is flagged automatically for the content
pipeline (feeding the same reporting mechanism as a manual report, Section 3.13).

### 11.3 Corrupt question data

Handled per the Practice Module's established fallback (Practice Module §8.4): the player fails
gracefully, skips the malformed item silently, logs it for the content pipeline, and substitutes
the next queued item — never surfacing a broken screen or blocking session progress.

### 11.4 Session interruption

Preserved exactly as it stood, per the Practice Module's session-state rule (Practice Module
§8.1) — this applies identically inside the Question Experience regardless of which feature
launched it, since the underlying session-state mechanism is shared, not feature-specific.

### 11.5 Phone call interruption / app backgrounding

Treated identically to any other interruption (Section 11.4) — current state (selected-but-
unsubmitted answer, elapsed reading/deciding time up to that point) is preserved locally. On
return to the foreground, the question resumes exactly as left; a submitted-but-not-yet-synced
answer (Section 11.1) resumes its sync attempt rather than being lost.

### 11.6 Duplicate taps

The Submit action is disabled immediately upon the first tap and re-enabled only if submission
genuinely fails and needs retrying — a double-tap on a slow connection must never result in two
recorded attempts for the same question.

### 11.7 Very long questions

No special truncation (Section 8.5) — the screen simply scrolls naturally. The one exception:
in CBT Exam Mode, where the progress/timer header must remain visible during scroll (a sticky
header), since exam-condition students need constant access to time-remaining regardless of
how far they've scrolled into a long stem.

### 11.8 CBT-specific: exiting mid-exam

Given the stakes (Section 10 table), exiting an in-progress CBT attempt requires an explicit
confirmation step distinct from the ordinary exit affordance (Section 3.14) — this is one of
the few places in the entire Question Experience where added friction is the correct design
choice, because the cost of an accidental exit (losing exam-condition context, confusing the
readiness data collected) genuinely outweighs the cost of one extra tap.

---

## 12. FUTURE SCALABILITY

The Question Experience is deliberately structured so the following attach without requiring
this specification to be redesigned:

**AI-powered hints.** The data model already reserves a "hint usage" field (Section 9.1) even
though no hint mechanism exists yet — when built, hints would slot in as an additional,
optional affordance near the answer options, consuming the same Question Intelligence Model
metadata (misconceptions, related concepts) already rendered in the Explanation Experience
(Section 6), rather than requiring new content infrastructure.

**Voice explanations.** Section 6's ten-component explanation structure is already
medium-agnostic (Question Intelligence Model §9.3) — a voice rendering would consume the
identical underlying content, requiring a new playback affordance, not new explanation content.

**Interactive diagrams.** The tap-to-expand media pattern (Section 7) is the natural entry point
— an interactive diagram would expand into the same full-screen space a static image currently
occupies, with added interaction layered on top rather than a new screen region required.

**Formula sheets.** Would attach as an additional, optional reference affordance available
during a question (most naturally in Practice and Learn, deliberately excluded from CBT Exam
Mode to preserve exam authenticity unless JAMB's real exam permits one) — a new supporting panel,
not a change to the core question layout.

**Video explanations.** Same medium-agnostic principle as voice explanations — the Explanation
Experience's structural components are the durable part; the rendering medium underneath can
evolve without touching Section 6's content model.

**Collaborative solving.** Nothing in the Question Experience's state model assumes a single
viewer — session state, attempt logging, and Concept Node updates remain student-scoped
(Practice Module §9), and a shared-session mode would be an additive context around the same
player rather than a redesign of it.

**Teacher annotations.** Would attach as a visible-only-to-the-relevant-audience layer on top
of the existing Explanation Experience (Section 6) — most naturally surfaced through a future
classroom/mentor extension of the platform, consuming the same underlying question and
explanation data already structured here.

**Premium learning enhancements.** Any paid enhancement (richer explanations, additional media,
expert-authored insight) enters through the same Question Intelligence Model content lifecycle
(Question Intelligence Model §10) and renders through the same Section 6 structure — a richer
*version* of an existing component, never a parallel screen.

The general principle, consistent with every other Kairo architecture document: each of these
is a new *consumer* of the Question Experience's existing structure, not a reason to change it.

---

## FINAL OUTPUT — WHY THE QUESTION EXPERIENCE IS KAIRO'S SHARED FOUNDATION

Every module built so far — the Learning Engine, the Student Intelligence Model, the Question
Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Home Dashboard,
the Practice Module — exists to answer one question honestly: *what should this student see
next, and why?* None of that intelligence means anything to a student until it renders as an
actual question, actually readable, actually answerable, on an actual phone screen. That
rendering surface is the Question Experience.

Designing it once, as a single specification every feature draws from, is what keeps Kairo
feeling like one coherent product instead of four different quiz interfaces wearing the same
logo. A student who moves from a quick Challenge shared on WhatsApp, into Practice, into a full
CBT mock, into a late-night Learn session chasing down one stubborn concept, should never once
feel like the ground shifted under them. The posture changes — forgiving here, exam-authentic
there — but the floor they're standing on, the actual experience of reading a question and
deciding what they think, stays exactly the same. That consistency is not a visual nicety. It
is what lets a student trust the product enough to stop thinking about the interface at all,
and just think about the question in front of them — which was the entire goal from the start.

**Think Smart. Perform Elite.**
