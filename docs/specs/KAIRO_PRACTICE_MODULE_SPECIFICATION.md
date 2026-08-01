# KAIRO PRACTICE MODULE
## Product Specification — The Core Experience of Kairo

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the
Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the
Product Experience Blueprint, and the Home Dashboard. Does not redesign any of them. Those
documents define what Kairo knows and decides. This document defines what a student actually
does, screen by screen, decision by decision, inside Practice — the single destination where
most of a student's time, and most of Kairo's intelligence, actually gets spent.)*

---

## 0. THE GOVERNING QUESTION

Every decision in this specification exists to answer one question:

**"When a student sits down to practise, what is the single clearest, most personal, least
effortful path from opening the app to actually learning something today?"**

Not: what questions are available. Not: what would look impressive on a dashboard. Not: how do
we maximise time-in-app. **What does this specific student need to do right now, and how do we
get them there with the fewest possible decisions standing in the way?**

If a design decision can't be traced back to that question, it doesn't belong in Practice.

---

## 1. PRODUCT PURPOSE

### 1.1 What Practice is

Practice is the primary, everyday learning surface of Kairo. It is the direct student-facing
expression of the Recommendation Engine (Learning Engine §4) and the Daily Decision Engine's
Today's Mission (DDE §4–5). It is where the Intelligence Engine's understanding of a student —
their Knowledge Map, Macro-State, weak concepts, decaying concepts — becomes a lived experience
rather than a stored model.

Practice is not a quiz screen. It is the place where Kairo's promise — *the system should
remember the student and help the student know what to do next* — is either kept or broken,
every single day, for most students, most of the time they spend inside the app.

### 1.2 What Practice is for

Practice exists to answer, continuously: **what is the most useful thing this student could
practise right now, and how do we make starting effortless?**

This means Practice must simultaneously:
- Feel personal (never a generic quiz bank)
- Feel adaptive (visibly respond to how the student is doing, without exposing the machinery)
- Feel low-friction (starting should never require a form)
- Feel honest (a good session is one that helped the student learn, not one with a high score)

### 1.3 How Practice differs from CBT Exam Mode

CBT Exam Mode exists to replicate the real JAMB exam experience faithfully — timed, full-length,
non-adaptive mid-attempt, navigable in any order, deliberately exam-authentic rather than
teaching-oriented (Product Experience Blueprint §3). Practice is the opposite in posture:
adaptive in real time, forgiving, explanatory, linear, and built to teach rather than to
simulate pressure. A student attempts CBT Mode to find out where they stand under real
conditions. A student attempts Practice to actually get better. Practice sessions feed the same
Knowledge Model as CBT attempts, but CBT attempts are never adaptive mid-session, and Practice
sessions never enforce exam-authentic constraints like forced navigation grids or hard timers
unless the student explicitly chooses a timed practice mode (Section 4.5).

### 1.4 How Practice differs from Challenges

Challenges are administrator-curated, competitive, shareable, and format-optimised for fun,
speed, and organic growth — many Challenge participants aren't even signed-in students yet
(Product Experience Blueprint §4). Practice is personal, private by default, never
administrator-curated question-by-question, and never designed around virality. A Challenge
attempt quietly feeds the Knowledge Model in the background; a Practice session *is* the
Knowledge Model's primary input. Challenges are a door into Kairo. Practice is the house itself.

### 1.5 How Practice differs from Learn

Learn is anchored to a single concept or a single missed question — it exists to answer "why
did I get this wrong, and what do I need to understand" (Product Experience Blueprint §5).
Learn is reachable *from* Practice (after an explanation, a student can go deeper), but Learn
itself contains no question-answering loop of its own beyond a small related-questions
carousel. Practice is the ongoing loop of attempt → feedback → adapt; Learn is the ground a
student stands on when they step out of that loop to understand something more deeply before
stepping back in.

### 1.6 The one-sentence purpose statement

**Practice is where Kairo's intelligence becomes a daily habit: the place a student returns to,
without having to decide what to do, and leaves having genuinely moved forward — whether that
session felt easy, hard, or humbling.**

---

## 2. STUDENT ENTRY POINTS

### 2.1 Design principle governing all entry points

Every entry point must resolve, within one tap, to either (a) a fully-formed session ready to
start, or (b) a single, short selection screen — never a multi-field form. This is the direct
Practice-level expression of the Daily Decision Engine's core rule: *the student should never
have to choose from a menu to begin* (DDE §14, principle 2). Entry points differ in *how a
student arrives*, not in how much friction they encounter once they do.

### 2.2 Recommended by Kairo (primary entry point)

The default, most-used path. Surfaced as "Start Mission" on the Home Dashboard and as the first,
largest card on Practice Home (Section 3.2). Requires zero input — the Daily Decision Engine has
already resolved subject, topic, concept focus, difficulty, and length (DDE §3–4) before the
student ever opens the screen. Tapping it goes directly into the Question Player (Section 5),
skipping Session Creation entirely. This is Smart Practice in its purest form and should be
positioned as the obvious, default choice — everything else in this section is for a student who
wants to override that default.

### 2.3 By subject

A student who wants to focus on one subject specifically (e.g., "I want to do Chemistry today").
Selecting a subject routes into Session Creation (Section 4) with Subject pre-filled and Smart
Practice pre-selected as the default composition mode within that subject — the student has
narrowed scope, not taken over curation.

### 2.4 By topic

A student who wants a specific, named topic (e.g., "Ionic Bonding") — reachable via subject
drill-down or via search. Pre-fills Subject and Topic in Session Creation; question composition
within that topic still defers to Smart Practice by default (mixing Forming, Fading, and
Held-appropriate difficulty within the topic) unless the student switches to Manual Practice
(Section 4.6).

### 2.5 Continue previous session

Appears only when an interrupted session exists (Section 8.1). Resumes exactly where the student
left off — same queue state, same question position, no re-planning. This entry point takes
priority of placement whenever it's available, since an abandoned session represents a student
who was mid-thought and deserves to pick that thought back up, not restart it.

### 2.6 Practise weak areas

Pulls directly from the Academic Profile's Weak Concepts field (Student Intelligence Model §2)
across the student's full active subject combination. Resolves immediately into a ready session
— no subject-picker required, since "weak areas" is itself the scope. This is functionally a
direct entry point into the Subject Knowledge Graph's Weak-topic review path (Subject Knowledge
Graph §9) but triggered proactively by the student rather than surfaced only in Review.

### 2.7 Practise bookmarked topics/questions

Pulls from the student's bookmarked items (Section 5.7). Resolves into a session composed
entirely of bookmarked questions and their Reinforcement/Alternative-wording relatives (Question
Intelligence Model §6.2) — never the identical bookmarked question repeated verbatim if a
close variant exists, consistent with the platform-wide rule against testing memorisation of a
specific question rather than the underlying concept.

### 2.8 Quick practice

For a student with very little time or low intent to configure anything. Produces a short
(5–10 question), single-priority session — pulling the single highest-priority item from the
Daily Decision Engine's ranking (DDE §3.2) and nothing else. No subject/topic selection at all.
This is distinct from "Recommended by Kairo" only in that it explicitly signals brevity up
front — the student is telling Kairo "keep this short," and the session length envelope (DDE
§6.3) is set accordingly before the mission is even generated.

### 2.9 Revision practice

Routes directly into the Subject Knowledge Graph's revision paths (Subject Knowledge Graph §9)
— Quick, Deep, Confidence Rebuilding, or Forgotten-concept review, selected automatically based
on current Fading queue size and Macro-State, exactly as Review's category logic already
specifies (Product Experience Blueprint §6). This entry point exists inside Practice as a
shortcut for a student who wants revision *right now* without navigating to the Review tab —
it produces the same session type Review would produce, just reached from a different door,
consistent with the Interconnection Principle (Product Experience Blueprint §9).

### 2.10 Entry point summary table

| Entry Point | Requires Session Creation? | Scope resolved by |
|---|---|---|
| Recommended by Kairo | No | Daily Decision Engine, fully automatic |
| By subject | Yes (narrowed) | Student (subject only), Kairo (rest) |
| By topic | Yes (narrowed) | Student (subject + topic), Kairo (rest) |
| Continue previous session | No | Preserved session state |
| Practise weak areas | No | Academic Profile's Weak Concepts |
| Practise bookmarked | No | Student's bookmark list |
| Quick practice | No | Daily Decision Engine, top priority only |
| Revision practice | No | Subject Knowledge Graph's revision-path logic |

---

## 3. PRACTICE HOME

### 3.1 Purpose

Practice Home is the landing screen when a student taps the Practice tab directly (rather than
arriving pre-routed from Home's "Start Mission"). It must accomplish two things at once: make
the recommended action impossible to miss, and make every alternative entry point from Section
2 reachable without scrolling through clutter.

### 3.2 Layout, top to bottom

1. **Primary Mission Card** (largest element on the screen)
   - Mission title (e.g., "Steady the Mole Concept"), estimated duration, one-line objective,
     and a single large "Start" button — this is the direct render of the DDE's Mission
     Generator output (DDE §4.2), identical in content to what "Start Mission" on Home would
     produce, since both are doors to the same object.
   - A small "Why this?" affordance beneath the card expands Kai's one-line explanation
     (DDE §12.2) without leaving the screen.

2. **Quick Actions row** (horizontally scrollable chips, not a dropdown menu)
   - Weak Areas · Bookmarks · Quick Practice · Revision · By Subject
   - Each chip routes per Section 2's corresponding entry point. Kept as visually lightweight
     chips, not cards, so they read as shortcuts rather than competing with the Primary Mission
     Card for attention.

3. **Continue Session banner** (conditional — only rendered when an interrupted session
   exists, per Section 2.5)
   - Rendered above Quick Actions when present, since resuming should outrank starting fresh.

4. **Progress Snapshot strip**
   - Three compact indicators: today's KAIRO Score movement (if any sessions completed today),
     current Momentum Streak, and a one-line Subject Health summary ("Chemistry: strong,
     Physics: needs attention") — deliberately terse, expanding into full detail only in
     Insights (Product Experience Blueprint §7), never duplicating Insights' depth here.

5. **Recent Activity list**
   - Last 3–5 completed sessions, each showing subject/topic, a one-line outcome ("2 concepts
     reinforced"), and a tap-through to that session's summary (Section 6). This gives a sense
     of continuity and momentum without requiring a trip to Insights.

6. **Personalised Suggestions carousel**
   - 2–4 secondary suggestions the DDE's Recommendation Categories (DDE §9) surfaced but didn't
     select as today's primary mission — e.g., a "Challenge" category suggestion for a
     Compounding-state student, or an "Explore" suggestion for breadth. Framed as optional,
     lower-key alternatives, never competing visually with the Primary Mission Card.

### 3.3 What Practice Home deliberately does not contain

No subject grid as the default landing view (that would reintroduce the exact "choose from a
menu to begin" failure mode the DDE was built to eliminate). No raw analytics or charts (those
live in Insights). No administrator or promotional content (that belongs to Challenges or
Home's own dashboard surface, not here).

### 3.4 Empty/cold-start state

A brand-new student sees the same layout, but the Primary Mission Card is explicitly framed as
a diagnostic ("Let's get to know your starting point"), Recent Activity is replaced with a
short welcome note from Kai, and Personalised Suggestions is suppressed entirely until enough
data exists to generate honest ones — an empty carousel reads worse than no carousel at all.

---

## 4. SESSION CREATION FLOW

### 4.1 Governing principle

Session Creation is only ever seen by a student who has *chosen* to narrow or configure — it
never appears between a student and the Recommended-by-Kairo path. Every field below has a
sensible default; a student can tap "Start" after setting zero of them, in which case Smart
Practice fills in every remaining decision exactly as the Daily Decision Engine would for an
unconfigured session.

### 4.2 Subject(s)

- Single or multi-select, defaulting to the student's full active Subject Combination
  (Student Intelligence Model §1) if the student arrived via a general entry point, or
  pre-filled and locked-lighter (easily changeable, not forced) if arrived via Section 2.3.
- Multi-subject selection is supported for students who want a mixed session — the Recommendation
  Engine's breadth logic (Learning Engine §4.1, priority 5) governs the mix if the student
  doesn't specify proportions.

### 4.3 Topic selection

- Optional, nested under whichever subject(s) are selected, using the Subject Knowledge Graph's
  student-facing levels (Topic/Sub-topic, Subject Knowledge Graph §2.2) — never raw Concept
  Node names.
- Leaving this unset means "let Kairo choose within the subject," which is the recommended and
  pre-selected default.

### 4.4 Number of questions

- Presented as a small set of presets (e.g., Short / Standard / Long) mapped to realistic
  question-count ranges, rather than a numeric input field — precise counts are avoided because
  the DDE deliberately does not optimise for volume (DDE §5.1) and offering a bare number field
  would silently reintroduce that framing.
- Default preset is derived from the student's Behaviour Profile average session length
  (Student Intelligence Model §3), not a fixed platform default.

### 4.5 Timed vs. untimed

- Untimed is the default for ordinary Practice — consistent with Practice's identity as the
  teaching-oriented mode (Section 1.3), where thinking time should never feel penalised.
- A Timed Practice toggle is available for students who specifically want lighter, un-gamified
  time pressure without going all the way to CBT Exam Mode's full simulation. Timed Practice
  still allows requesting explanations and does not enforce CBT's linear/no-review constraints
  — it changes pacing pressure only, not the pedagogical posture of the mode.

### 4.6 Smart Practice vs. Manual Practice

- **Smart Practice** (default, recommended, visually the more prominent option): the
  Recommendation Engine and Daily Decision Engine fully determine concept mix, difficulty
  progression, and interleaving within whatever scope (subject/topic) the student has set.
- **Manual Practice** (secondary option, clearly available but not pushed): the student
  explicitly picks difficulty level and/or specific sub-topics themselves, overriding the
  engine's session-composition logic. Manual Practice still writes to the same Knowledge Model
  — the *selection* is manual, but every attempt is still tagged, scored, and fed back into the
  system exactly as a Smart Practice attempt would be. Difficulty selection here is presented
  relative and plain-language ("Foundational / Standard / Advanced"), never as a raw numeric
  difficulty rating, consistent with the Question Intelligence Model's rule that difficulty is
  only ever a relative signal to the student (QIM §2.3).

### 4.7 Confirmation and handoff

Once settings are set (or left at default), a single "Start Practice" action hands off directly
into the Question Player (Section 5) — there is no intermediate "review your settings" screen,
since the settings themselves were the only screen.

---

## 5. QUESTION PLAYER

### 5.1 Purpose

The Question Player is the tightest, most frequently-experienced loop in all of Kairo. Every
element on this screen must serve either comprehension of the current question or trust that
the system is behaving fairly — nothing else earns screen space here.

### 5.2 Layout

- **Top bar:** progress indicator (e.g., "Question 4 of 12" or a segmented progress bar —
  never a raw percentage, which reads as more clinical than helpful), a pause/exit affordance,
  and, only in Timed Practice or CBT-adjacent modes, a visible timer.
- **Question stem area:** the question text, rendered with generous line height and mobile-safe
  typography (per Kairo's own typography system — Arial, 16–18pt body, 150% line height, Kairo
  Visual Identity Part 2).
- **Supporting image area** (conditional): renders inline below the stem when the question
  includes a diagram, graph, or figure; images scale to container width and never require
  horizontal scrolling or pinch-zoom to read on a small screen.
- **Answer options:** rendered as full-width tappable option cards (not a cramped radio-button
  list), each with a minimum 48px touch target per Kairo's mobile accessibility standard (Kairo
  Visual Identity Part 3).
- **Bottom action row:** bookmark toggle, report-issue affordance, and the primary "Submit
  Answer" action (disabled until an option is selected, to prevent accidental blank submits).

### 5.3 Navigation

- **Linear by default:** Practice questions are presented one at a time, in the order the live
  queue determines (Learning Engine §4.2), with no free jump-around navigation grid — this is a
  deliberate contrast with CBT Exam Mode's navigator grid (Product Experience Blueprint §3),
  since Practice is not simulating exam-day question ordering constraints.
- **No going back to change a submitted answer.** Once submitted and feedback is shown, the
  question is locked — consistent with the platform-wide principle that a wrong answer is a
  diagnostic event (Question Intelligence Model §4.1), not something to be quietly revised
  after the fact.
- **Forward navigation is queue-driven, not student-driven.** The student taps "Next," but what
  "next" actually contains is decided live by the Learning Engine's interrupt logic (Learning
  Engine §4.2) — a foundational insert, a diagnostic question, or the next queued item,
  depending on what was just learned about the student thirty seconds ago.

### 5.4 Time tracking

- Response time is tracked silently per question, compared against both the question's
  population-calibrated Estimated Solving Time and the student's own personal baseline
  (Question Intelligence Model §2.3, Learning Engine §1.3).
- **Never shown to the student as a stopwatch or countdown in untimed Practice** — surfacing a
  visible timer in untimed mode would quietly convert every session into a de facto timed one
  and contradict the mode's own design intent. In Timed Practice, a visible timer is shown, but
  framed as a pacing aid, not a penalty countdown (no red flashing, no aggressive urgency
  styling).

### 5.5 Confidence indicators

- Kairo's confidence_score is inferred behaviourally (Learning Engine §1.3) and is explicitly
  **not** collected via a self-report confidence slider on every question — this would
  reintroduce exactly the self-report unreliability the Knowledge Model was designed to avoid.
- Where a lightweight, optional self-check is valuable (e.g., "How sure were you?" after
  submitting), it may be offered as a small, skippable, two-tap affordance immediately after
  feedback is shown, used only as an *additional* weak signal that supplements — never
  replaces — the behavioural confidence_score. It must never gate progression or be required to
  continue.

### 5.6 Feedback presentation

- Immediate, per-question, styled per the Visual Identity's success/error conventions (Green
  left-border for correct, Red left-border for incorrect — Kairo Visual Identity Part 3) but
  worded per Kai's hard tone rules (Learning Engine Phase 2 §7.2): never a bare "Incorrect,"
  always a reframing toward the reasoning.
- Feedback text length adapts to the error_pattern_tag exactly as specified (Question
  Intelligence Model §9.3) — short for `careless_slip`, fuller for `conceptual_gap`.
- A "See full explanation" affordance expands into the complete Learn-style explanation
  structure (Question Intelligence Model §9.2) without leaving the Question Player, so a
  student doesn't have to break session flow to understand a miss.

### 5.7 Bookmarking

- A single-tap bookmark toggle available on every question, before or after answering.
- Bookmarking a question adds both the question and its underlying concept to the student's
  saved set, retrievable later via the "Practise bookmarked" entry point (Section 2.7) and via
  Review's Bookmarks category (Product Experience Blueprint §6).
- Bookmarking never interrupts the session flow or requires confirmation.

### 5.8 Reporting issues

- A low-visual-weight "Report an issue" affordance (e.g., a small flag icon) on every question,
  opening a short, structured form (wrong answer key, unclear wording, broken image, other) — a
  free-text field is available but not required.
- Reports feed directly into the Question Intelligence Model's QA pipeline (Question
  Intelligence Model §11) and do not affect the reporting student's own score or state in any
  way — this must be communicated implicitly through the flow's neutral framing (no "are you
  sure this isn't just you" language).

### 5.9 Accessibility considerations

- Minimum 16pt body text on mobile, never smaller, per Kairo's own typography rule (Kairo
  Visual Identity Part 2).
- All interactive elements meet the 48px minimum touch target.
- Colour is never the sole carrier of meaning — correct/incorrect feedback pairs colour with an
  icon and text label, not colour alone, to remain usable for colour-blind students.
- All images require alt-text/description metadata at the content-authoring stage (feeding into
  the Question Intelligence Model's metadata completeness QA gate, QIM §11) so a future
  screen-reader mode has data to work from without content rework.
- The player must remain fully usable with degraded connectivity — see Section 8.2.

---

## 6. SESSION COMPLETION

### 6.1 Purpose

The end-of-session screen is the second-most-important screen in Practice after the Question
Player itself, because it is where a student's honest sense of "did that help?" gets formed. It
must never feel like a scoreboard and must always feel like a mirror held up to what actually
happened.

### 6.2 Structure

1. **Session Summary headline** — plain language, specific, never a bare percentage as the
   lead ("You reinforced 2 concepts and steadied 1 that was fading" beats "80% correct").
2. **Strengths** — concepts confirmed Held or newly Reinforced this session, named specifically
   (Subject Knowledge Graph §11's Kai-encouragement pattern), not just counted.
3. **Weaknesses** — concepts still Forming, newly Fading, or newly flagged with a
   `conceptual_gap` tag, framed as "what's next," never as a verdict on the student.
4. **Recommended next actions** — 1–3 concrete follow-ups: a Review session for what's still
   fading, a Learn deep-dive for a concept that needs more explanation, or simply "come back
   tomorrow" if the session was complete and nothing urgent remains — this last option must be
   allowed to be the recommendation; the DDE is explicitly capable of saying a student has done
   enough for today (Learning Engine §4.3).
5. **Links to Learn / Review** — direct, one-tap routes into the specific concept's Learn
   explanation or into the appropriate Review category, never a generic "go explore" link.
6. **KAIRO Score impact** — shown as a plain-language delta with a one-line reason ("Your score
   moved up — mostly from remembering things you'd struggled with before"), consistent with the
   Score's legibility principle (Student Intelligence Model §7.3), never a bare number with no
   explanation.
7. **Reflection note from Kai** — the DDE Mission Generator's closing Reflection artifact
   (DDE §4.2), referencing something specific that happened in this exact session.
8. **Celebration** (conditional) — rendered only when a genuine milestone fired during the
   session (a Reinforced transition, a Macro-State upgrade), using the Wisdom Spark, and never
   scheduled or expected in advance (Learning Engine Phase 2 §7.6, DDE §5.2).

### 6.3 What this screen never does

Never presents a raw leaderboard position or comparison to other students. Never uses guilt or
urgency language regardless of how the session went. Never ends on an unresolved weakness
without an accompanying next step — a student should never leave this screen unsure what to do
with what they just learned about themselves.

---

## 7. INTELLIGENCE ENGINE INTEGRATION

Practice is the single largest source of write-traffic into the Intelligence Engine. Every
attempt inside a Practice session triggers the full update cascade already specified upstream;
this section maps each downstream effect explicitly to its origin inside Practice.

### 7.1 Weak-topic detection

Every attempt updates the relevant Concept Node's `retention_state` and `confidence_score`
(Learning Engine §1.1, §4.2). Aggregated across a session, this directly refreshes the Academic
Profile's Weak Concepts and Strong Concepts fields (Student Intelligence Model §2), which in
turn is what "Practise weak areas" (Section 2.6) reads from on the student's *next* visit — the
loop is continuous, not batch-processed overnight.

### 7.2 Review scheduling

Any concept that moves into Fading during or after a session becomes eligible for the Memory
Scheduling engine (Learning Engine Phase 2 §5) and appears in Review's Fading Concepts category
(Product Experience Blueprint §6) immediately, not after a delay. A Reinforced transition
achieved inside Practice is the single most valuable event this system produces (Learning
Engine §2.2) and is surfaced to Kai for a proactive moment the instant it happens (Learning
Engine Phase 2 §7.5).

### 7.3 Learning recommendations

Every session's outcomes feed directly back into the Daily Decision Engine's input set (DDE
§2.2) — a completed Practice session is one of the strongest signals the DDE reads when
generating the *next* day's Today's Mission, alongside decay estimates, Macro-State shifts, and
Learning State transitions (Student Intelligence Model §5).

### 7.4 Streaks

Session completion (not mere app opening) contributes to the Momentum Streak (Learning Engine
Phase 2 §8.1) — a session that is started but abandoned before meaningful engagement does not
count, but a short, honestly-completed Quick Practice session does. Streaks are strictly
read-only outputs of Practice activity; Practice's session planning and difficulty logic are
never adjusted to protect or extend a streak (Learning Engine §4.3, DDE §3.4), which keeps
Practice's core teaching function insulated from the motivational layer sitting on top of it.

### 7.5 KAIRO Score

Every attempt contributes to the Accuracy, Retention, and Consistency components exactly as
specified (Student Intelligence Model §7.3) — Accuracy and Retention update per-attempt;
Consistency updates per completed session, since it measures engagement pattern across sessions
rather than any single answer. Manual Practice attempts (Section 4.6) contribute identically to
Smart Practice attempts — the Score does not distinguish by session-creation mode, only by
attempt quality.

### 7.6 Analytics

All Practice activity — session length, completion rate, time-of-day, fatigue curves — feeds the
Behaviour Profile (Student Intelligence Model §3) and, in aggregate, Insights' trend views
(Product Experience Blueprint §7). Practice itself surfaces none of this raw analytics directly
(Section 3.3); it only ever contributes to the layer where analytics are meant to live.

---

## 8. EDGE CASES

### 8.1 Session interruption / leaving mid-session

Session state is preserved exactly as it stood — current queue position, all attempts already
made, elapsed time — the moment the student leaves, whether by explicit exit or by simply
closing the app. On return within a reasonable window, the "Continue previous session" entry
point (Section 2.5) offers to resume, never to restart, since restarting would silently discard
genuine signal about what the student already did (Daily Decision Engine §8, "Student leaves
halfway").

### 8.2 Internet loss mid-session

Per Kairo's offline-first principle (TECHMED Brand Overview §4.2), a Practice session already
in progress must continue to function using locally cached question data where the relevant
content was pre-fetched for the session. Answered questions are queued locally and synced on
reconnect; attempt-history integrity is preserved exactly as the offline-sync edge case
specifies (Learning Engine §11) — no attempt data is discarded, and if any ambiguity exists
about which attempt is authoritative, the most recent completed attempt wins for state purposes
while all raw attempts are retained. The student should see a calm, non-alarming "you're
offline — your answers are saved" indicator rather than an error state.

### 8.3 Returning later (same day vs. much later)

- **Same day, session incomplete:** resumes exactly (Section 8.1).
- **Same day, session already complete, student opens Practice again:** a new
  Recommended-by-Kairo mission is generated only if there is genuinely something left to do
  within the day's plan; otherwise Practice Home honestly reflects that the student has done
  enough today (Section 6.2, point 4) rather than manufacturing a second forced session.
- **Days later:** standard daily re-plan applies (Daily Decision Engine §8) — decay estimates
  are honestly recalculated before a new mission is generated, and if the gap crosses the
  student's own At Risk threshold, the Recovering flow (Learning Engine Phase 2 §10.2) governs
  the next session's difficulty and framing rather than Practice's ordinary logic.

### 8.4 Invalid question data

If a question reaches the Question Player with genuinely missing or malformed data (a broken
image reference, a missing option, an incomplete explanation due to a QA gap that slipped
through), the player must fail gracefully — skip the question silently, log it for the content
pipeline, and substitute the next queued item — rather than surfacing a broken screen or
blocking session progress. This should be a rare, defensive fallback, since the Question
Intelligence Model's QA gate (QIM §11) is designed to prevent incomplete questions from ever
reaching live rotation in the first place.

### 8.5 Duplicate questions

The live queue must never present the identical question twice within the same session, and
should avoid presenting it again across a short window of subsequent sessions on the same
concept, favouring Alternative Representation or Reinforcement relatives instead (Question
Intelligence Model §6.2) — this is both a pedagogical requirement (testing the concept, not
memorisation of the specific item) and a trust requirement (a student who notices exact
repetition will reasonably suspect the system isn't really adapting to them).

---

## 9. FUTURE SCALABILITY

The Practice Module is deliberately structured so the following can attach without requiring
this specification to be redesigned:

**AI-assisted explanations.** The Question Player's "See full explanation" affordance and the
Session Completion screen's concept call-outs already render from the Question Intelligence
Model's explanation structure (QIM §9), which is explicitly designed to accept a more
generative content layer underneath the same structural components (QIM §12) without any change
to how Practice displays them.

**Voice learning.** The Question Player's stem, feedback, and explanation content are all
text-content-driven today; a future voice mode would consume the identical underlying content
components (QIM §9.3's medium-agnostic explanation structure) and Kai's existing tone rules
(Learning Engine Phase 2 §7.2), requiring a new rendering surface rather than new pedagogical
logic.

**Collaborative practice.** Nothing in this specification assumes a session is single-player at
the data layer — session state, attempt logging, and Concept Node updates are already
student-scoped and could extend to a shared session context (e.g., two students working through
the same mission together) as an additive session-creation mode (Section 4.6), without altering
how individual attempts feed the Knowledge Model.

**Premium practice packs.** Curated, possibly paid question sets would enter through the same
Question Intelligence Model lifecycle (QIM §10 — Imported → Reviewed → Tagged → Linked) as any
other content, surfaced as an additional entry point or Session Creation filter (Section 4)
rather than a separate module.

**Institution-specific practice.** A school- or partner-specific question pool or subject
emphasis would attach via the same Exam Body / provenance tagging already defined (Question
Intelligence Model §2.5) and could be surfaced as an additional Subject-selection filter
(Section 4.2), consistent with the Subject Knowledge Graph's stated extension path for new exam
bodies (Subject Knowledge Graph §12).

**Advanced adaptive difficulty.** The Adaptive Difficulty engine already operates per-concept,
per-attempt, and is designed to accept richer signal over time (Learning Engine Phase 2 §9,
Question Intelligence Model §5.3's empirical-calibration override) — Practice's difficulty
framing to the student (Section 4.6's relative labels) does not need to change even as the
underlying calibration becomes significantly more sophisticated.

The general principle, consistent with every other Kairo architecture document: each of these
is a new *consumer* of Practice's existing structure, not a reason to change it.

---

## FINAL OUTPUT — WHY PRACTICE IS KAIRO'S CORE EXPERIENCE

Every other module in Kairo — Home, Learn, Review, CBT Exam Mode, Challenges, Insights — either
feeds Practice, is fed by Practice, or exists to help a student return to Practice more
effectively. The Learning Engine, Student Intelligence Model, Question Intelligence Model,
Subject Knowledge Graph, and Daily Decision Engine are all, ultimately, systems that exist to
make one screen — the Question Player, inside one flow — feel personal, adaptive, and honest,
every single time a student opens it.

A student does not experience a Knowledge Map, a Macro-State, or a decay_estimate. They
experience a mission with their name on it, a question that feels chosen just for them, an
explanation that actually addresses what went wrong, and a summary that tells them the truth
about how they're doing without ever making them feel small. That experience is Practice. Every
other module supports it, surrounds it, or extends it — but Practice is where Kairo actually
happens.

**Think Smart. Perform Elite.**
