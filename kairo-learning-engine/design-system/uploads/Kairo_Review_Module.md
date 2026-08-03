# KAIRO REVIEW MODULE
## Product Specification — Where Mistakes Become Understanding

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Product Experience Blueprint, the Home Dashboard, the Practice Module, the Question Experience, and the Learn Module. Does not redesign any of them. Learn exists to fix a gap in understanding the moment it's diagnosed. Review exists for the reflective work that happens after — consolidating, resurfacing, and proving that what was fixed actually stayed fixed.)*

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student, per completed unit of work:

**"Now that this is done, what should the student actually take away from it — and how do we make sure that takeaway sticks?"**

Not: how many did they get right. Not: what's the next thing to show them. Not: how do we make this screen feel comprehensive. **What does this specific student need to reflect on, reinforce, or revisit — and how do we get them there without making them relive every mistake as a small verdict against them?**

If a design decision can't be traced back to that question, it doesn't belong in Review.

---

## SECTION 1 — PRODUCT PURPOSE

### 1.1 What Review is

Review is Kairo's consolidation layer — the module a student returns to after the doing is finished. Where Practice is the loop of attempt and adapt (Practice Module §1.1), and Learn is the deliberate detour into understanding (Learn Module §1.1), Review is neither a loop nor a detour. It is the place a student steps back, sees what actually happened across a session, a week, or a month, and turns that raw activity into something durable: a corrected misconception, a reinforced concept, a pattern noticed, a piece of progress made visible.

Review is the direct student-facing expression of the Memory & Revision Scheduling engine (Learning Engine Phase 2 §5) and the Subject Knowledge Graph's Revision Paths (Subject Knowledge Graph §9) — but it is more than a scheduling surface. It is also where a student examines *why* something happened, not only *what* is due next. This is what distinguishes Review from a bare spaced-repetition queue: a spaced-repetition queue asks "is it time to see this again?" Review asks that question and also "what should this student actually understand about their own attempt before seeing it again?"

### 1.2 What Review is explicitly not

Review is not a scoreboard. It is not a report card, a list of failures, or a place where a student is confronted with everything they got wrong in an unfiltered dump. TECHMED's own standard is explicit that a poor score should never simply communicate "you failed" (TECHMED Brand Overview §10.6) — Review is the module where that standard is tested hardest, because it is, structurally, built entirely from moments a student didn't get right on the first try. If Review ever reads like an accusation, it has failed regardless of how technically accurate its content is.

Review is also not Learn. Learn exists to repair a specific gap in comprehension, one concept at a time, anchored to a single moment of contact (Learn Module §1.1, §2.1). Review exists to organize and resurface *across* moments — a session, a week, a subject, a mistake pattern — and to decide *when* something should come back, not primarily *why* it went wrong in the first place. The two are natural partners (Section 3 covers the handoffs explicitly), but Review must resist becoming a second, redundant Learn — its job is retrieval and consolidation, not fresh explanation.

### 1.3 How Review differs from Practice

Practice is forward-moving — attempt, feedback, adapt, continue, always pressing toward new ground within the day's mission (Practice Module §1.1–1.3). Review is backward-looking by design: it exists specifically to revisit what has already happened, whether that's a single session just completed or a Fading concept from three weeks ago. A student opens Practice to move forward. A student opens Review to make sure what they've already learned actually stays learned. Both write to the same Concept Node data (Learning Engine §1.1), but they read the student's intent differently — Practice assumes "I want to do something new or due"; Review assumes "I want to look back and make sure it held."

### 1.4 How Review differs from Learn

This distinction is already stated precisely in the Learn Module and is restated here because it governs Review's own boundaries just as much as Learn's: **Review is about timing, Learn is about comprehension** (Learn Module §1.4). A concept can be perfectly understood and still need Review, because it's simply due to fade. A concept can be freshly attempted and still need Learn, because it was never understood in the first place. Review's job is to notice *when* something needs to come back and to give the student a structured way to revisit it — including a short reflective read on their own mistake — but the moment a genuine comprehension gap is detected (not just a timing gap), Review's correct behavior is to hand off to Learn, not to attempt the explanation itself (Section 3.9, Section 7 will detail this handoff).

### 1.5 How Review differs from CBT Exam Mode

CBT Exam Mode produces a Performance Report at the moment of submission — a structured, exam-specific breakdown (score by subject, time-per-question, flagged-question review — Product Experience Blueprint §3). That report is CBT Mode's own immediate artifact. Review is where a *completed* CBT exam's content re-enters the ordinary rhythm of the student's ongoing learning — its mistakes feeding the same Fading queues, weak-topic detection, and misconception patterns as any other attempt (Section 6, Section 7). CBT Mode tells a student how the mock went. Review is where that mock's lessons actually get absorbed into what happens next.

### 1.6 How Review differs from Challenges

A Challenge is fast, shareable, low-stakes, and frequently anonymous at the point of attempt (Product Experience Blueprint §4). Its errors still quietly feed the Misconception Library and Insights (Product Experience Blueprint §4, Data flow), but a Challenge participant is not, in the moment of finishing a Challenge, expecting a reflective review experience — that would work against the format's own designed lightness. Review becomes relevant to Challenge content only once a student has a full account and revisits their Challenge history deliberately (Section 3.4), not as an automatic next step after every Challenge completion the way it is after Practice, Learn, or CBT Mode.

### 1.7 The one-sentence purpose statement

**Review exists to turn what a student has already done into something they can trust they'll remember — replacing the question "how did I score?" with the more useful one, "what do I now understand that I didn't before?"**

---

## SECTION 2 — REVIEW PHILOSOPHY

### 2.1 Reflection before correction

A student's first encounter with a past mistake inside Review should be an invitation to reconsider it, not an immediate correction slammed in front of them. Where appropriate to the format (Section 5 will define exactly where), Review gives a student a beat to reread their own answer and the question before the "right answer" reasserts itself — because reflection that the student does themselves produces a stronger, more durable correction than one that is simply handed over. This mirrors a principle already established platform-wide: `guessed` answers are met with a diagnostic question, not an immediate lecture (Learning Engine Phase 2 §7.3) — Review extends that same respect for the student's own thinking process into the retrospective context.

### 2.2 Understanding before memorisation

Review is not a flashcard drill. A concept resurfacing in Review is not there to be pattern-matched or memorized in isolation — it is there because the underlying understanding needs to prove it survived time, per the Retention State system's own design (Learning Engine §2.2, §2.4). Where a resurfaced item reveals that a student only ever memorized a specific question rather than understanding the concept beneath it — the "memorised, not understood" misconception category (Question Intelligence Model §4.1) — Review's job is to notice this and route toward genuine understanding (via Learn, Section 3.9) rather than to let the student re-memorize the same specific item a second time, which would simply defer the same false-positive indefinitely.

### 2.3 Progress before perfection

Review is not interested in whether a student got everything right the second time. It is interested in whether the student is measurably closer to lasting understanding than they were before. This is the same standard the Elite/KAIRO Score itself is built on — Retention specifically rewards *surviving* forgetting, not flawless first-pass accuracy (Student Intelligence Model §7.2) — and Review is where a student experiences that standard directly, not just as a number but as a felt sense of "I'm getting better at holding onto this," even on days when a resurfaced concept still trips them up. A session that reveals three concepts still fading is not a failed Review session; it is Review doing exactly its job — catching the drift before the student is standing in an exam hall discovering it for the first time.

### 2.4 Encouragement before criticism

Everything Kai's tone rules already establish (Learning Engine Phase 2 §7.2) applies to Review with, if anything, extra weight — because Review's entire raw material is composed of things that already went wrong once. A module built from a student's own mistakes carries genuine emotional risk if handled carelessly (a concern the Learn Module names explicitly for itself, Learn Module §9.1, and one Review inherits in full, since Review's content is, if anything, an even denser concentration of past misses across a wider time window). Review must never let the *volume* of resurfaced mistakes compound into something that reads as an indictment. A student revisiting five old mistakes in one sitting should feel like they're doing serious, valuable work — not like they're being shown a growing pile of evidence against themselves.

### 2.5 The philosophy in practice

Together, these four principles produce a recognizable pattern across every Review interaction:

- A past mistake is never re-presented as a bare correction — the student gets a genuine moment to reconsider before the answer resolves (2.1).
- A resurfacing item that reveals rote memorization rather than real understanding is treated as valuable diagnostic signal, routed toward Learn, not repeated as-is (2.2).
- Session summaries measure movement — closed gaps, concepts that held up — never a raw tally of what's still wrong (2.3).
- Volume of mistakes is never allowed to compound into an emotional pile-up; framing, pacing, and session sizing all actively protect against this (2.4).

This is the same underlying discipline already applied to Learn (Learn Module §2.6) and to the Question Experience (Question Experience §2.8) — extended here to a module whose entire content is, by definition, retrospective. Nothing in Review exists to remind a student how much they've gotten wrong. Everything in Review exists to prove, concretely and honestly, that they're holding onto more than they were before.

---

## SECTION 3 — STUDENT ENTRY POINTS

### 3.1 Design principle governing all entry points

Consistent with the entry-point discipline already established for Practice (Practice Module §2.1) and Learn (Learn Module §3.1), every entry point into Review carries context — which session, which subject, which concept, which mistake pattern brought the student here. Review never opens as a blank, undifferentiated list of "everything you've ever gotten wrong." It always already knows why the student is there, or, where the entry is self-directed, it organizes itself around the student's own diagnostic history rather than presenting an undifferentiated archive (Section 4 will detail Review Home's structure).

### 3.2 Immediately after a Practice Session

The primary, highest-frequency entry point. Practice's own Session Completion screen already surfaces strengths, weaknesses, and recommended next actions (Practice Module §6.2) — Review is the natural next destination for a student who wants to sit with that session's mistakes specifically, beyond the summary's own brief framing. This entry point carries full session context: which questions were missed, which concepts are newly Fading or flagged, and which `error_pattern_tags` were assigned, so a Review session entered this way never has to reconstruct what just happened.

### 3.3 Immediately after a Learn Session

A completed Learn lesson closes with a Mini Reinforcement Activity and a specific handoff (Learn Module §5.10, §5.12) — typically routing back into Practice. Where a student instead wants to see how a just-repaired concept sits alongside their other recent work, Review is reachable as a secondary path from a Learn completion screen. This entry point is lower-frequency by design (Learn's own standard is a fast handoff back into momentum, Learn Module §2.5) but remains available for a student who wants the fuller picture rather than an immediate return to practice.

### 3.4 Immediately after finishing a CBT Exam

CBT Exam Mode's Performance Report (Product Experience Blueprint §3) is the exam's own immediate artifact, but a full mock inevitably surfaces more misses in one sitting than an ordinary Practice session — this is exactly the moment Review's session-pacing safeguards (Section 2.4, Section 5) matter most. From the Performance Report, a student can move directly into a Review session scoped to that exam's flagged and missed questions, distinct from the exam-authentic report itself, which does not carry Review's reflective framing (per Learn Module §1.5, explanations were withheld until submission — Review is where a student actually engages with them at reflective pace, once the exam-condition attempt is fully over).

### 3.5 After completing a Challenge

As established in Section 1.6, this is not an automatic next step — a Challenge participant's experience should stay fast and light. Review becomes reachable for Challenge content only once a student, with a full account, deliberately revisits their Challenge history (most naturally from Insights or a Challenges Hub, Product Experience Blueprint §4), at which point that history's mistakes are treated identically to any other Review content.

### 3.6 From the Dashboard ("Continue Reviewing")

Mirroring the Home Dashboard's own precedent for surfacing an interrupted activity (Quick Resume, Home Dashboard §4.3), an incomplete Review session is surfaced from Home as a small, low-visual-weight card — never competing with the Mission Card for the student's first five seconds (Home Dashboard §2), consistent with Review's supporting, non-primary role in the overall product architecture (Product Experience Blueprint §1, navigation tier).

### 3.7 From Subject Pages

A student looking at a subject's own mastery view (Insights' Subject/Topic Mastery Screen, Product Experience Blueprint §7, or the Home Dashboard's Subject Health strip, Home Dashboard §4.11) can drop directly into a Review session scoped to that subject — the Subject Knowledge Graph's Weak-topic review path (Subject Knowledge Graph §9), reached from a subject-first rather than a session-first starting point.

### 3.8 From Weak Areas

Pulling directly from the Academic Profile's Weak Concepts field (Student Intelligence Model §2), mirroring Practice's own "Practise weak areas" entry point (Practice Module §2.6) but framed reflectively rather than as fresh practice — a student arriving here wants to understand and consolidate existing weak spots, not necessarily generate new attempt volume.

### 3.9 From Bookmarks

Questions and concepts a student has explicitly flagged (Practice Module §5.7, Question Experience §3.12) are reachable as their own Review category, carrying a self-identified-importance signal distinct from the engine's own detection — mirroring the acknowledgment already established for Learn's equivalent entry point (Learn Module §3.9): the student marked this themselves, and Review should treat that intent as legitimate on its own terms, not only as a symptom of a diagnosed gap.

### 3.10 From Session History

A straightforward, chronological entry point for a student who wants to look back at a specific past session — a particular day's Practice, a specific CBT mock, a specific Learn lesson — rather than a concept- or category-organized view. This is Review's most literal "look back" entry point, useful specifically when a student remembers *when* something happened more clearly than *what* concept it involved.

### 3.11 From Weekly Review recommendations

The Weekly Reflection (Learning Engine Phase 2 §8.2) already surfaces what got Reinforced, what's currently Fading, and one honest pattern observation — deliberately non-comparative and personal. Review is the natural destination when a student wants to act on that reflection immediately rather than only read it, turning the Weekly Reflection's "here's what's true" into Review's "here's what to do about it."

### 3.12 From Monthly Review recommendations

The Monthly Reflection ("Kairo Wrapped," Learning Engine Phase 2 §8.3) is shareable and celebratory by design, built around genuine, earned highlights. Where it surfaces something that still needs attention alongside its celebrations, it links into Review exactly as the Weekly Reflection does — the shareable artifact and the actionable one stay cleanly separated, consistent with the platform-wide rule that a student's private reflective content and their shareable content serve different purposes (Learning Engine Phase 2 §8.2–8.3).

### 3.13 From future AI recommendations

Not part of the initial build, but the architecture should anticipate a future state where a more generative recommendation layer (per the Learning Engine's own stated future-scalability note on richer AI explanation generation, Learning Engine Phase 2 §12) can proactively suggest a Review session based on patterns it notices — this attaches as a new *trigger* into the same entry-point structure defined here, not a new module.

### 3.14 Entry point summary table

| Entry Point | Context carried | Emotional framing |
|---|---|---|
| After Practice Session | Full session mistakes, tags, newly Fading concepts | Immediate consolidation — "let's make sure this sticks" |
| After Learn Session | The just-repaired concept, alongside recent related work | Optional deeper check — "see how this fits with everything else" |
| After CBT Exam | Exam-scoped misses and flagged questions | Reflective pace, post-exam-pressure — "now let's actually look at these" |
| After Challenge | Anonymous/light data, relevant only post-conversion | Self-directed, low-frequency — "if and when you want to dig in" |
| Dashboard ("Continue Reviewing") | Preserved incomplete Review session | Resumption — "pick up where you left off" |
| Subject Pages | Subject-scoped mastery view | Analytical, subject-first — "let's strengthen this subject" |
| Weak Areas | Academic Profile's Weak Concepts | Consolidation-focused — "let's make sure these actually hold" |
| Bookmarks | Self-flagged questions/concepts | Acknowledged intent — "you marked this as worth revisiting" |
| Session History | A specific past session, chronologically located | Literal look-back — "let's see what happened that day" |
| Weekly Review recommendation | Weekly Reflection's Fading/Reinforced summary | Acting on a private, honest reflection |
| Monthly Review recommendation | Monthly Wrapped's residual action items | Acting on a celebratory, earned rollup |
| Future AI recommendations | Pattern-detected trigger (reserved) | Proactive, not yet specified |


# KAIRO REVIEW MODULE
## Product Specification — Part 2

---

## SECTION 4 — REVIEW HOME

### 4.1 Purpose

Review Home is the landing screen when a student navigates to Review directly — via the Dashboard's "Continue Reviewing" card (Section 3.6), the persistent navigation (Product Experience Blueprint §1's secondary tier), or any of the self-directed entry points in Section 3 — rather than arriving pre-routed into a specific scoped session from Practice, Learn, or CBT Mode. Its job, like Learn Home's (Learn Module §4.1), is not to make "start" effortless in the way Practice Home does, because Review is never a session's default first action. Instead, Review Home's job is to feel like an honest, organized ledger of what's worth revisiting — calm enough that opening it doesn't feel like opening a drawer of old mistakes, and clear enough that a student always knows exactly what each category will ask of them before they tap in.

### 4.2 Governing design constraint

Review Home must never feel like an archive. Every section on this page is a *query over the student's own retrospective data* — due-for-revision concepts, recent mistakes, bookmarks, session history — never a static, browsable catalogue of everything that has ever happened. This mirrors Learn Home's own governing constraint against becoming a course catalog (Learn Module §4.2): here, the equivalent failure mode is becoming a permanent, growing record of failure. Every category must therefore be framed by what it *offers* the student today, not by how much history it contains.

### 4.3 Layout, top to bottom

1. **Kai's framing line** (not a generic header)
   A short, specific line grounding the screen in something real and current — "3 things are ready to come back to you" or, on a genuinely clear day, "You're caught up — nothing urgent right now" (mirroring Review's empty-state precedent set in the Product Experience Blueprint, §6, Edge cases). Never a static "Welcome to Review."

2. **Continue Reviewing** (conditional)
   If a Review session was left incomplete, this is the single highest-priority card, positioned above every category below — mirroring the precedence rule already established for Practice's Quick Resume (Practice Module §2.5, §3.2) and Learn's Continue Learning card (Learn Module §4.3, item 2). Resuming an interrupted Review session always outranks starting a fresh category.

3. **Due for Review**
   The direct render of the Memory Scheduling engine's current Fading queue (Learning Engine Phase 2 §5.1–5.2) — concepts whose `decay_estimate` has crossed the trust threshold and are eligible for resurfacing. Presented as a short, plain-language count with a one-line reason where useful ("2 concepts are starting to fade — a quick pass now keeps them from slipping further"), never as a raw list of decay percentages (Daily Decision Engine §12.3's rule against surfacing raw internal state applies identically here).

4. **Recent Mistakes**
   Mistakes from the last few days across Practice, Learn's own reinforcement attempts, and CBT Mode, organized as a short, scoped category rather than an open-ended archive — this is the direct entry point for Section 3.2's "immediately after a Practice Session" flow when a student returns to it later rather than acting on it right away. Bounded to a recent, meaningful window (not "all mistakes ever"), so the category stays actionable rather than becoming exactly the kind of accumulating pile Section 2.4 warns against.

5. **Weak Topics**
   The Topic-level view (Subject Knowledge Graph §2.2) mirroring Learn Home's own Weak Topics section (Learn Module §4.3, item 4) but framed toward consolidation and resurfacing rather than fresh explanation — "3 concepts in Organic Chemistry could use a confidence check" rather than "let's learn this."

6. **Bookmarks**
   The student's self-flagged questions and concepts (Section 3.9), organized as their own clearly-labeled category — distinct from the engine-detected categories above it, since the framing here should acknowledge the student's own intent directly rather than presenting it as a diagnosed gap.

7. **Session History**
   A straightforward, reverse-chronological list of past sessions across Practice, Learn, CBT Mode, and (once converted) Challenges — the literal "look back at a specific day" entry point (Section 3.10). Kept visually quiet and low in the hierarchy, since most students arrive at Review wanting to act on something current, not browse history for its own sake.

8. **Reinforced This Month**
   A quiet, positive counterbalance mirroring Learn Home's Mastered Concepts section (Learn Module §4.3, item 6) — concepts that have successfully survived a Fading → Reinforced cycle recently. Kept collapsed or minimized by default so it doesn't compete with the actionable categories above it, but present because seeing genuine retention accumulate is part of what makes Review feel like progress rather than only ever confronting what's still shaky.

9. **Suggested Review Session**
   A single, closing recommendation — not a menu, a specific suggestion — synthesizing whichever category above the Daily Decision Engine currently considers highest priority (DDE §3.2) into one ready-to-start session, functioning as Review's own equivalent of Practice's "Recommended by Kairo" entry point (Practice Module §2.2). This exists so a student who doesn't want to choose a category at all still has exactly one clear, sensible thing to tap.

### 4.4 What Review Home deliberately does not contain

No raw score history displayed as a primary element. No leaderboard or comparative content (consistent with the Motivation Engine's opt-in-only, never-primary stance on comparative framing, Learning Engine Phase 2 §8.4). No open-ended "browse all mistakes" list presented as a first-class action — every category is bounded and purposeful, never an unfiltered dump. No administrative or promotional content.

### 4.5 Empty / cold-start state

A brand-new student, or a student with too little attempt history for meaningful Fading/weak-topic data yet, sees Due for Review, Recent Mistakes, and Weak Topics replaced with a single honest note from Kai ("Once you've done a bit of practice, I'll know what's worth revisiting here") — mirroring the empty-state discipline already established for Learn Home (Learn Module §4.5) and the Home Dashboard (Home Dashboard §7). Session History and Bookmarks remain visible but genuinely empty rather than padded, since an empty list here is honest, not broken.

### 4.6 The genuinely clear day

A student who is fully caught up — nothing Fading, no recent unaddressed mistakes, no pending bookmarks — should see this reflected as an unambiguous, positive state, not an empty-feeling screen. Kai's framing line (Section 4.3, item 1) carries this explicitly ("You're caught up — nothing urgent right now"), and the Suggested Review Session (item 9) either recommends a light Confidence Rebuilding pass (Subject Knowledge Graph §9) or is itself absent with an honest note, rather than manufacturing a session out of nothing to fill the space.

---

## SECTION 5 — REVIEW SESSION EXPERIENCE

### 5.1 Purpose

Where Review Home organizes *what's available* to revisit, this section specifies what actually happens once a student starts a Review session — the sequence of moments a student moves through, and how those moments differ, deliberately, from an ordinary Practice session. Review sessions reuse the Question Experience's shared rendering surface (Question Experience §1.1) exactly as every other module does, but with its own mode-specific posture, exactly as Practice, Learn, CBT Mode, and Challenges each have their own (Question Experience §10).

### 5.2 How a Review session differs from a Practice session

Practice is forward-adaptive — the live queue interrupts itself in response to what it learns thirty seconds ago (Learning Engine §4.2). A Review session is scoped in advance to a specific category (Due for Review, Recent Mistakes, a subject, a bookmark set) and, within that scope, still interleaves and adapts — Review does not abandon the interleaving principle already established for revision content generally (Learning Engine Phase 2 §5.3) — but its *composition* is drawn from already-known, already-attempted material rather than new territory. A Practice session can introduce a student to a concept for the first time; a Review session, by definition, never does — every item it contains has already been touched by the student at least once.

### 5.3 The session flow

```
Session Framing
   ↓
Reflection Moment (per item, where applicable)
   ↓
Resolution (correct answer + reasoning)
   ↓
Pattern Surfacing (when relevant)
   ↓
Reinforcement Attempt
   ↓
Session Consolidation Summary
```

### 5.4 Session Framing

The session opens by naming, plainly, what this specific Review session is and why it was assembled — mirroring Learn's own opening discipline of never starting cold (Learn Module §2.1, §5.3), applied here to a session rather than a single lesson. "This is a quick pass on 3 things that are starting to fade" or "Let's look back at Tuesday's Chemistry session" — the framing states scope and purpose in one sentence before any content appears, consistent with the Daily Decision Engine's explainability standard (DDE §12.1–12.2) applied to Review's own entry rather than only to Practice's Mission Card.

### 5.5 The Reflection Moment

This is Review's most distinctive structural element, directly implementing Section 2.1's principle. For a resurfaced item where the student previously answered incorrectly, the session does not immediately re-present the correct answer. Instead, the student's own original question and their own original answer are shown first, with a brief prompt to reconsider ("Take another look — what would you answer now?") before either reattempting or revealing the resolution. This is distinct from the Question Player's live-Practice flow (Question Experience §4), where a fresh attempt is simply a fresh attempt with no prior-answer framing — here, the prior answer is a deliberate, visible part of the moment, because confronting one's own past reasoning is itself part of what makes the correction durable.

Where an item is being resurfaced not because it was wrong before but purely because it's due for spaced revisit (a Held concept crossing into Fading, Learning Engine §2.3), the Reflection Moment is lighter — there is no "wrong answer" to reconsider, so the item behaves closer to an ordinary fresh attempt, simply framed with the context of *why* it's appearing ("This one's coming back around before you forget it").

### 5.6 Resolution

Once the student has reconsidered (Section 5.5) and either reattempted or indicated readiness to see the answer, the resolution renders using the same explanation structure already fully specified in the Question Experience (Question Experience §6.2) — correct reasoning, why other options are wrong, drawn from the Misconception Library (Question Intelligence Model §4). Review does not maintain a separate explanation format; it renders the same trusted structure every other module uses, consistent with the platform-wide principle that this structure is a shared rendering surface, not a per-module reinvention (Question Experience §1.1).

### 5.7 Pattern Surfacing

Where a session contains more than one item connected by the same underlying signal — the same concept resurfacing more than once, the same misconception type appearing across different concepts (Question Intelligence Model §4.2), or a genuine Repeated gap (Subject Knowledge Graph §8.2) — the session should name that pattern explicitly, once, rather than let the student notice three separate near-identical mistakes without comment. This is Review's most valuable analytical contribution beyond what any single item's explanation could offer on its own: "This is the second time mole ratio has tripped up a stoichiometry question this week" is a genuinely new piece of information a per-item explanation can't surface, because it only becomes visible at the session level.

### 5.8 Reinforcement Attempt

Each reviewed item closes with a genuine attempt at a Reinforcement or Alternative Representation variant of the same concept (Question Intelligence Model §6.2) — never the identical original question, consistent with the platform-wide rule against testing memorization of a specific item rather than the underlying concept (Practice Module §8.5, Learn Module §5.10). This attempt is a real, logged data point feeding the Learning Engine's update loop (Section 7 will detail this fully) — Review's Reflection Moment does not substitute for genuine retrieval practice; it precedes and sets up genuine retrieval practice.

### 5.9 Session Consolidation Summary

The session closes with a summary structured around movement, not volume — consistent with Section 2.3's principle. "2 concepts held up, 1 needs another look soon" rather than a raw accuracy percentage as the headline. Where a genuine Reinforced transition occurred during the session — the single most valuable event the Learning Engine tracks (Learning Engine §2.2) — it is named specifically here, with the Wisdom Spark reserved for exactly this kind of genuine inflection point (Learning Engine Phase 2 §7.6), never for routine session completion.

### 5.10 Session length and pacing

Consistent with Section 2.4's protection against emotional pile-up, Review sessions are deliberately capped shorter than the Fading queue might technically justify in a single sitting — mirroring the Daily Decision Engine's own session-length discipline (DDE §5, §6.3–6.4). A student with a large backlog after a long gap is not shown all of it at once; the session composes a manageable, honest slice, with the remainder still visible on Review Home (Section 4.3, item 3) as due, not silently hidden or artificially compressed to look smaller than it is.

### 5.11 What a Review session never does

It never re-presents an identical question verbatim as the "test" of whether a concept has improved (Section 5.8). It never opens with a bare list of what was gotten wrong before any framing or reflection (Section 5.4–5.5). It never ends on an unresolved miss without at least naming what happens next (mirroring Learn's own rule against ending on explanation alone, Learn Module §2.4) — a Review session that closes with "this one's still shaky" always pairs that with when and how it will come back, never leaving the student to wonder if it simply vanished.

---

## SECTION 6 — QUESTION ANALYSIS

### 6.1 Purpose

Where Section 5 defines the session-level experience, this section defines what a student sees when they look closely at a *single* reviewed question — the detailed, retrospective counterpart to the Question Experience's Explanation Experience (Question Experience §6), adapted for Review's reflective posture rather than Practice's forward-moving one.

### 6.2 What Question Analysis adds beyond the standard explanation

The standard explanation structure (Question Experience §6.2) answers "why was this the right answer, and why were the others wrong." Question Analysis, reachable from within a Review session or from Session History (Section 3.10), adds a layer the standard explanation doesn't carry: the student's *own historical context* on this specific question — when it was first attempted, what was answered then, whether it's been seen again since, and how confidence and correctness have moved across those attempts. This is only meaningful in a retrospective context, which is why it lives in Review rather than being added to the inline Question Experience explanation, where it would be irrelevant noise for a first-time attempt (per the Question Experience's own governing test, §2.8 — does this help the student think more clearly right now).

### 6.3 The structure

1. **The question, as originally presented** — rendered identically to how the student first saw it, never edited or clarified after the fact, since the point is genuine reconstruction of that original moment.
2. **What was answered, and when** — the student's actual historical selection, dated, shown plainly and without judgment framing (Section 5.5's Reflection Moment principle carried into the detail view).
3. **The full explanation** — the standard Question Experience structure (Question Experience §6.2) rendered in full, since a student opening Question Analysis has already signaled intent to go deep, unlike the collapsed-by-default inline version.
4. **The specific misconception, if applicable** — drawn from the Misconception Library (Question Intelligence Model §4.1) and named precisely, exactly as Learn does for its own equivalent moment (Learn Module §5.7) — the same underlying data, surfaced here in its retrospective context instead.
5. **Attempt history on this concept** — a short, honest timeline: Forming → Held → Fading → Reinforced, or wherever the concept currently sits (Learning Engine §2.2), shown in plain language, never as raw state labels (Daily Decision Engine §12.3).
6. **Related questions attempted since** — where the student has since answered Reinforcement or Alternative Representation variants of the same concept (Question Intelligence Model §6.2), a short list showing how those went, giving the student real evidence of trajectory rather than a single static snapshot.
7. **A route into Learn** — where the underlying data suggests a genuine comprehension gap rather than a timing-driven fade (Section 1.4's timing-vs-comprehension distinction), Question Analysis surfaces a direct, one-tap link into the relevant Learn lesson rather than attempting to explain the concept from scratch itself — Review diagnoses and points; Learn repairs (Section 7 details this handoff mechanism fully).

### 6.4 Tone

Question Analysis is the single place in Review where a student is looking most closely and most literally at a specific past mistake, which makes it the place where Section 2.4's encouragement-before-criticism principle is most load-bearing. Framing throughout stays observational and forward-looking — "Here's how this one has moved over time" rather than "Here's proof you struggled with this." Kai's presence in this view follows the same tone rules already established platform-wide (Learning Engine Phase 2 §7.2) — never a bare judgment, never comparative language, specificity over generic enthusiasm.

### 6.5 When Question Analysis is and isn't offered

Offered as an optional deeper view from within any Review session item (Section 5.6) and from Session History (Section 3.10) — never forced as a mandatory step, since a student who just wants the quick Reflection-Moment-to-Resolution flow (Section 5.5–5.6) should be able to complete a Review session without opening this level of detail on every item. This mirrors the Question Experience's own "Link to Learn" as an available-not-mandatory affordance (Question Experience §6.2, item 8) — depth is always one tap away, never imposed.

### 6.6 Data source discipline

Consistent with Section 7.8's principle (Learn Module §7.8, restated here as it governs Review identically): Question Analysis computes nothing new. Every field in Section 6.3 is a read against the Learning Engine, the Question Intelligence Model, and the Student Intelligence Model exactly as they already exist — Review's Question Analysis view is a *lens*, not a second source of truth, protecting against the "two numbers on the same screen quietly contradicting each other" failure mode the Student Intelligence Model explicitly warns against (Student Intelligence Model §6).

# KAIRO REVIEW MODULE
## Product Specification — Part 3

---

## SECTION 7 — LEARNING INTELLIGENCE INTEGRATION

### 7.1 Purpose

Review does not run a separate intelligence layer of its own. Every read it performs and every write it produces flows through the exact systems already specified upstream — the Learning Engine, the Student Intelligence Model, the Question Intelligence Model, and the Subject Knowledge Graph. This section maps each of those interactions explicitly, so Review's place in the overall architecture stays as a *consumer and contributor* to one continuously-updating model (Student Intelligence Model §8), never a parallel dataset that could drift out of sync — the same discipline already established for Learn (Learn Module §7.1).

### 7.2 Reading the Fading queue

Review Home's Due for Review section (Section 4.3, item 3) and the Suggested Review Session (item 9) read directly from `decay_estimate` and `next_review_estimate` as computed by the Memory Scheduling engine (Learning Engine Phase 2 §5.1–5.2). Review does not compute its own decay model or maintain a second notion of "what's due" — it renders the same queue the Recommendation Engine already uses to prioritize Urgent Decay in Practice sessions (Learning Engine §4.1, priority 1). This is what keeps Review and Practice from ever silently disagreeing about what's fading.

### 7.3 Writing attempt data

Every Reinforcement Attempt inside a Review session (Section 5.8) flows through the identical question-level update loop every other attempt in Kairo uses (Learning Engine §4.2 — Concept Node update, outcome classification, `error_pattern_tag` if wrong). These are treated as fully legitimate attempts, not synthetic or lesser signal, with one important distinction that mirrors Learn's own conservative posture (Learn Module §7.3): a correct Reinforcement Attempt on a concept that was in Fading state *is* the exact mechanism by which a Reinforced transition is evaluated (Learning Engine §2.2) — this is, in fact, Review's single most important write to the model, since Reinforced specifically requires successful recall *after* time has passed, and Review is the module where that time-passed recall actually happens. Practice can produce first-pass Held states; Learn's fresh-instruction attempts cannot yet produce Reinforced (Learn Module §7.3); **Review is where Reinforced is earned.**

### 7.4 The Reflection Moment as signal

The Reflection Moment (Section 5.5) generates a subtle but genuine signal of its own, distinct from the reattempt that follows it: whether a student's reconsidered answer (before resolution is shown) differs from their original wrong answer, and whether it differs *correctly*. A student who reconsiders and immediately self-corrects, even before seeing the resolution, is showing evidence the original error may have been closer to a `careless_slip` than a `conceptual_gap` (Question Intelligence Model §4.1) — this is logged as a supplementary signal that can refine the error_pattern_tag's confidence, though it never overrides the tag on its own, consistent with the platform-wide rule that any single behavioral signal is a vote, not a verdict (Daily Decision Engine §2.5).

### 7.5 Pattern surfacing and the Misconception Library

Section 5.7's Pattern Surfacing draws directly from the Misconception Library's accumulation logic (Question Intelligence Model §4.2) — when the same misconception type recurs across concepts within a single Review session, this is exactly the cross-concept pattern detection the QIM was built to support. Review is where this accumulated signal becomes most visible to the student in one sitting, since a Review session by design aggregates multiple past mistakes together in a way a single Practice session rarely does. Review does not maintain its own misconception-tracking logic — it queries the same accumulated profile the QIM already maintains per student (Question Intelligence Model §4.2).

### 7.6 The Learn handoff

This is Review's most structurally important integration point, and it deserves explicit mechanical detail beyond the boundary already stated in Section 1.4 and Section 6.3, item 7. The handoff triggers when either of two conditions is met during a Review session or Question Analysis view:

- **A genuine Repeated gap** (Subject Knowledge Graph §8.2) — a concept that has cycled Fading → attempted remediation → Fading again more than once — is encountered during Review. This is the same escalation the Daily Decision Engine already applies mid-Practice-session (DDE §8, "Student fails repeatedly"), and Review must not attempt to resolve it with a bare Reinforcement Attempt, since repeating the identical remediation a third time is assumed to have already failed (DDE §8).
- **A Reflection Moment reconsideration is itself incorrect** — the student reconsiders and still cannot produce the right answer even with the prompt to slow down (Section 5.5) — this is a stronger signal of a genuine comprehension gap than a first-pass miss alone, since the student has now had two honest opportunities and neither landed.

In either case, Review's own behavior is to stop, name the situation plainly ("This one might need a fresh explanation rather than another look — want to jump into a quick lesson?"), and route directly into the relevant Learn lesson (Learn Module §3.5's own entry point for exactly this trigger), never to attempt an inline re-explanation itself. This keeps the Section 1.4 boundary mechanically enforced, not just philosophically stated: **Review diagnoses timing and surfaces patterns; Learn repairs comprehension.**

### 7.7 Feeding the Daily Decision Engine

A completed Review session feeds directly back into the DDE's input set for the next Practice session (DDE §2.2) exactly as a completed Learn lesson does (Learn Module §7.5) — concepts that were reinforced or resolved during Review de-prioritize from the Urgent Decay and gap queues (Subject Knowledge Graph §8.3), freeing that session slot in tomorrow's mission for the next-highest priority. Where a Review session revealed a Repeated gap that was routed to Learn (Section 7.6) rather than resolved within Review itself, that concept remains flagged exactly as it would if Review had never touched it — Review's role here is triage, not premature resolution.

### 7.8 KAIRO Score influence

Reinforcement Attempts (Section 5.8) contribute to the Accuracy and Retention components of the KAIRO Score using the same weighting logic as any other attempt (Student Intelligence Model §7.3) — there is no separate "Review score." Because Review's Reinforcement Attempts are, definitionally, the mechanism by which genuine Reinforced transitions are recognized (Section 7.3), Review sessions are disproportionately likely to move the Retention component specifically — this is not a special case or a bonus; it is simply Retention's own design working exactly as intended, since Retention was built to reward the thing Review sessions are structurally positioned to produce (Student Intelligence Model §7.4).

### 7.9 Consistency contribution

A completed Review session counts toward the Consistency component (Student Intelligence Model §7.3, "sessions across a rolling window") on the same basis as a Practice session — a student who returns for a short, honest Review pass is engaging in a genuinely valuable, spaced touchpoint, and the Elite/KAIRO Score's own design already anticipates this: "a student who studies 30 minutes across 5 sessions" scores higher on Consistency than one long single-day session (Learning Engine Phase 2 §6.2). Review sessions are exactly the kind of short, distinct-day touchpoint this component was designed to reward.

### 7.10 What Review never computes independently

Consistent with the discipline already established for Learn (Learn Module §7.8), Review never independently decides Macro-State, Learning State, gap severity, or exam-proximity weighting — it reads all of these from the Student Intelligence Model and Subject Knowledge Graph exactly as authored elsewhere. Review's only original contribution to the shared model is genuine new attempt data (Section 7.3) and the Reflection Moment's supplementary signal (Section 7.4) — everything else it displays is a lens on data computed elsewhere, protecting against the same "two numbers quietly contradicting each other" failure mode the Student Intelligence Model warns against (Student Intelligence Model §6).

---

## SECTION 8 — PERSONALISATION

### 8.1 Governing principle

Two students with an identical Fading queue do not necessarily need an identical Review session. Personalisation in Review operates on the same substance-versus-framing split already established throughout Kairo (Daily Decision Engine §10, Learn Module §8.1) — *which* concepts are due is determined by the shared Learning Engine; *how* the session is paced, framed, and sized flexes around who the specific student is right now.

### 8.2 Macro-State

A student in Wavering or Recovering (Learning Engine §3.1) receives a shorter, gentler Review session — fewer items, more Reflection Moments framed with extra warmth, and a Consolidation Summary (Section 5.9) that leans harder into what held up rather than what's still shaky. A student in Compounding or Peak Readiness can be offered a denser session, including Deep Revision passes that check whether a Fading concept quietly pulled a prerequisite down with it (Subject Knowledge Graph §9's Deep revision path). This mirrors the Macro-State-first filtering rule already established as the DDE's outer bound on every other decision (Daily Decision Engine §2.1).

### 8.3 Number of prior reconsiderations

Where a Reflection Moment (Section 5.5) has already been offered on the same item in a previous Review session and the student still couldn't resolve it correctly, a subsequent encounter skips straight to the Learn handoff (Section 7.6) rather than offering a third Reflection Moment — repeating the same reflective prompt a third time without new framing would itself become a form of the identical-repetition failure mode Learn explicitly guards against (Learn Module §10.2).

### 8.4 Session history length

A student with a long attempt history has richer Question Analysis data available (Section 6.3, item 6 — related questions attempted since) than a newer student, and the view adapts accordingly — a newer student's Question Analysis naturally emphasizes the Reflection Moment and immediate explanation more heavily, since there isn't yet a meaningful trajectory to show.

### 8.5 Confidence pattern

Where a student's behavioral signal suggests overconfidence — high accuracy with rising `guessed` tags (Student Intelligence Model §4's "Overconfident" emotional pattern) — Review sessions lean more heavily on Alternative Representation items (varied framing of the same concept) rather than familiar-format reattempts, since the goal is to test whether understanding transfers, not whether the student recognizes a familiar pattern. This mirrors the Question Intelligence Model's own stated mechanism for producing an honest confidence_score (Question Intelligence Model §1.3).

### 8.6 Exam timeline

As exam proximity compresses into the Exam Sprint window (Learning Engine §5.2), Review sessions shift toward the Exam Sprint Review path already defined in the Subject Knowledge Graph (§9) — interleaved, difficulty-compressed, covering the full active exam-proximity window rather than optimal long-term spacing. Session framing (Section 5.4) explicitly names this shift ("We're in the final stretch, so today's pass covers a bit more ground than usual") rather than silently changing scope without explanation, consistent with the Daily Decision Engine's explainability standard (DDE §12).

### 8.7 Recovery ability

A student's historical Recovery Rate (Student Intelligence Model §6 — average speed and completeness of return-to-baseline after a gap) shapes how a post-At-Risk-gap Review session is paced — a student who has historically bounced back quickly from gaps can be offered a slightly fuller Review session sooner; a student whose Recovery Ability signal suggests they need more ramp gets a smaller, more tightly-scoped first Review pass, mirroring the Recovering Macro-State's own explicit permission-giving posture (Learning Engine Phase 2 §10.2, §7.4) carried into Review's specific context.

### 8.8 Subject-specific framing

Lesson tone within Question Analysis and Pattern Surfacing calibrates lightly by subject convention where genuinely useful — mirroring the same light, non-structural calibration already described for Learn (Learn Module §8.4) — a Mathematics-adjacent Chemistry calculation review may lean on the worked-example structure; an English comprehension review may lean on annotated-text framing. This is a content-authoring guideline, never a structural difference in the session flow itself (Section 5), since that flow is explicitly subject-agnostic by design.

### 8.9 The personalisation boundary

Per Section 7.10 and the Emotional Profile's own hard boundary (Student Intelligence Model §4), personalisation in Review never extends to labeling a student or exposing internal state or diagnosis. Every dimension above shapes *pacing, framing, and scope* — never the student's own visible sense of who they are as a learner. A student never sees "you are Overconfident" or "your Recovery Rate is low" — they experience a session that happens to be shaped a little differently, without ever being told why in those terms.

---

## SECTION 9 — MOTIVATION STRATEGY

### 9.1 Governing principle

Review's entire raw material is, by definition, composed of things that already went wrong once — this makes it the single module in Kairo where the emotional risk named generally in Section 2.4 is most concentrated, more so even than Learn, because a Review session routinely aggregates mistakes across multiple sessions, subjects, and days into one sitting (Section 5.10). This section defines the concrete interaction patterns that keep Section 2's stated philosophy genuinely felt, not merely stated, under exactly this hardest case.

### 9.2 Never let volume read as verdict

A Review session with five resurfaced mistakes must never feel five times as discouraging as a session with one. This is protected structurally, not just through wording: session length is capped (Section 5.10), Pattern Surfacing (Section 5.7) reframes multiple related mistakes as a single actionable insight rather than five separate failures, and the Consolidation Summary (Section 5.9) always leads with what held up before naming what's still in progress. The felt experience of a five-item session should be "here's one clear pattern worth fixing," not "here are five things you got wrong."

### 9.3 Acknowledging genuine improvement

Mirroring Learn's own precedent (Learn Module §9.2), where a concept previously flagged in Review later holds up successfully — whether in a subsequent Review session, in Practice, or in a Weekly Reflection — Kai should name this specifically and at the moment it's actually demonstrated, not inside the original Review session where it would be premature. "That mole concept from last week's review — it held up in yesterday's practice" is stronger and more honest than anything a same-session acknowledgment could offer, because it's evidence gathered after real time has passed, which is the entire point of what Review exists to produce (Section 7.3).

### 9.4 Celebrating Reinforced transitions

Reserved specifically for the moment a Reinforcement Attempt (Section 5.8) actually produces a Reinforced state — the platform-wide Wisdom Spark rarity principle (Learning Engine Phase 2 §7.6) applies with particular weight here, since Review is architecturally the primary place Reinforced transitions are earned (Section 7.3). This is Review's single best opportunity to make a student feel the tangible payoff of the reflective work they've just done — it should never be missed or buried in a generic session-complete message.

### 9.5 Framing a Repeated gap honestly, without alarm

Where Section 7.6's Learn handoff triggers, the framing must carry zero implied failure on the student's part — "This one might need a fresh explanation rather than another look" names the *situation*, never the student. This directly extends the same normalizing language already established for Learn's own Repeated-gap framing (Learn Module §9.5, "Let's look at this from a different angle") into Review's specific moment of recognizing the pattern in the first place, which is, if anything, the more emotionally sensitive moment, since it's where the student first learns a mistake has recurred.

### 9.6 The Reflection Moment's own motivational function

Beyond its diagnostic value (Section 7.4), the Reflection Moment (Section 5.5) is itself a motivational device: a student who reconsiders and gets it right *before* seeing the resolution experiences a small, genuine win that a passive "here's the answer" flow never offers. This should be acknowledged, briefly and specifically, when it happens ("You caught that yourself — good instinct") rather than treated as a silent formality on the way to the resolution screen.

### 9.7 Protecting the "caught up" feeling

The genuinely clear day (Section 4.6) is one of Review's most motivationally valuable states and must never be undersold. A student who opens Review Home and finds nothing urgent due should feel this as real, earned progress — proof that earlier Review and Practice work is holding — not as an anticlimactic empty screen. This is the positive mirror of Section 9.2: just as volume must never read as verdict, absence must always read as achievement.

### 9.8 What Review's motivational language avoids

No generic motivational language, no exclamation-mark-heavy enthusiasm, no comparison to other students, no reference to how long a concept has been fading or how many times a mistake has recurred as a way of manufacturing urgency. Every piece of encouraging or corrective language in Review must be traceable to something specific and true about this student's actual history — consistent with the platform-wide principle that empty praise is eventually discounted and stops working (Learning Engine Phase 2 §7.1). A Review summary that says "Great session!" has failed Review's own standard; one that says "Redox held up today — that's the second time it's survived a fade, which is exactly what durable learning looks like" has met it.

### 9.9 The motivational throughline

Every pattern in this section protects one outcome: a student should be able to open Review as often as the Fading queue genuinely requires — sometimes daily, sometimes after a real gap — without dreading it as a reckoning. Review's value proposition only holds if the module that is, by construction, built entirely from past mistakes manages to feel like the place a student goes to *prove they're getting better*, not the place they go to be reminded they once got something wrong. That is the standard every structural choice in Sections 5 through 9 has been built against.

---

Part 3 complete — Sections 7 through 9. The two decisions with the most downstream weight: **Section 7.3/7.8** establishes Review as the *primary mechanism* by which Reinforced transitions are actually earned (Practice produces Held, Learn can't yet produce Reinforced, Review is where recall-after-forgetting actually happens) — this gives Review real architectural teeth rather than making it a cosmetic wrapper around the Fading queue. And **Section 7.6** turns the Section 1.4 timing-vs-comprehension boundary into a concrete triggering mechanism (Repeated gap, or a failed Reflection Moment) so Review never quietly starts re-explaining things Learn should own.


# KAIRO REVIEW MODULE
## Product Specification — Part 4

---

## SECTION 10 — EDGE CASES

### 10.1 A student with an empty Fading queue but a large Recent Mistakes backlog

These are not the same category and must not be conflated. A student can be fully caught up on spaced revision (nothing genuinely decaying past threshold) while still carrying a backlog of recent, unprocessed mistakes from a busy week of Practice or a single CBT mock. Review Home (Section 4.3) must reflect this honestly — Due for Review can read "nothing urgent" while Recent Mistakes simultaneously shows real, bounded content. The Suggested Review Session (Section 4.3, item 9) resolves the ambiguity for the student rather than making them choose between two seemingly contradictory signals: it picks whichever category the Daily Decision Engine's priority hierarchy actually favors (DDE §3.2) and frames the session around that, without pretending the other category doesn't exist.

### 10.2 A student who never opens Review

Some students will lean almost entirely on Practice and rarely engage Review directly, even as their Fading queue grows. This is not treated as a failure state requiring guilt-based intervention — consistent with the platform-wide rule against guilt-based re-engagement (Learning Engine Phase 2 §7.2, rule 3; §9.3). Instead, the Daily Decision Engine's own Urgent Decay priority (DDE §3.2, priority 2) increasingly folds Fading content directly into ordinary Practice sessions the longer Review goes unused — mirroring the Learning Engine's original design principle that revision is dissolved into ordinary practice rather than requiring a separate destination the student must remember to visit (Learning Engine Phase 2 §5.1). Review remains available and useful for a student who wants the fuller reflective experience, but a student who avoids it entirely is not structurally penalized — their Fading concepts simply resurface through Practice instead, just without Review's added Reflection Moment and Pattern Surfacing depth.

### 10.3 A concept that fades again immediately after being marked Reinforced

Reinforced is not immunity from future decay (Learning Engine §2.3 — decay is modeled continuously, and even a concept with survived recall cycles will eventually decay again, just more slowly). Where a concept cycles Reinforced → Fading again within a short window, this is not automatically treated as a Repeated gap (Subject Knowledge Graph §8.2's stricter definition, requiring a Fading → remediation → Fading cycle) — a single fast re-fade after genuine reinforcement is more likely a sign the personal decay rate for that concept type needs recalibrating (Learning Engine §5.2's per-student decay-rate adjustment) than a sign of a comprehension gap. Review's framing reflects this distinction honestly: "This one's coming back a bit sooner than expected — that's useful information for how we pace your reviews" rather than treating a fast re-fade as a setback.

### 10.4 Conflicting signals between Review categories

A concept can simultaneously appear eligible for Due for Review (Section 4.3, item 3) and be flagged in a Weak Topics rollup (item 5) if it belongs to a broader topic with several other struggling concepts. Rather than surfacing the same underlying concept twice across two separate categories in a way that could read as double-counted urgency, Review Home's category logic deduplicates at render time — a concept already featured prominently in one category is either omitted or lightly cross-referenced ("also part of Organic Chemistry's weak spots") in the other, never presented as two independent, seemingly unrelated action items.

### 10.5 A student who disagrees with a resurfaced item

Occasionally a student will believe a resurfaced "mistake" was actually a fair alternative reading, an ambiguous question, or a genuine content error — not a real gap in their own understanding. The Report an Issue affordance already established platform-wide (Question Experience §3.13, Practice Module §5.8) remains available inside Review's Question Analysis view (Section 6) exactly as it is everywhere else, feeding the same Question Intelligence Model QA pipeline (Question Intelligence Model §11) without affecting the student's own score or state in any way. Review does not add a separate dispute mechanism — it inherits the one that already exists, consistent with the principle that Review renders shared infrastructure rather than reinventing it (Section 6.6).

### 10.6 Very sparse Review content for a new or under-populated subject

Per the Subject Knowledge Graph's own acknowledgment that content coverage starts uneven (Subject Knowledge Graph §10.1) and the Learning Engine's sparse-data-subject edge case (Learning Engine §11), a subject or topic with a thin question pool may not have enough Reinforcement or Alternative Representation variants available to populate a full Review session's reattempt step (Section 5.8) without risking near-duplicate items. Consistent with the platform-wide honesty standard, Review should surface this plainly ("More practice questions are coming soon for this topic — here's what we have for now") rather than silently recycling the same handful of items in a way that would let a student pattern-match answers instead of genuinely retrieving the concept.

### 10.7 A student who abandons a Review session mid-way

Mirroring the session-preservation rule already established for Practice (Practice Module §8.1), Learn (Learn Module §10.1), and the Question Experience (Question Experience §11.4), an abandoned Review session preserves its exact state — which items were completed, which Reflection Moments were shown, any reattempts already made. On return, the Continue Reviewing card (Section 4.3, item 2) offers to resume, never to restart. An item abandoned before its Reinforcement Attempt (Section 5.8) is not treated as a failed or skipped attempt — it simply remains part of the resumable session, since no scored data point occurred.

### 10.8 A concept resurfacing during Exam Sprint that was never fully understood

In the compressed final weeks before exam (Learning Engine §5.2's proximity override), Review's Exam Sprint path prioritizes breadth and readiness over ideal long-term spacing (Subject Knowledge Graph §9). Where this surfaces a concept that Section 7.6's Learn-handoff conditions would normally trigger on, the handoff still applies even under time pressure — a genuine comprehension gap discovered five days before an exam is more urgent to route to Learn, not less, since attempting to paper over it with a rushed Reinforcement Attempt would produce exactly the false-positive green checkmark the Retention State system was built to prevent (Learning Engine §2.4). Time pressure changes *pacing and breadth*; it never changes the standing rule that a real gap gets real repair.

### 10.9 Offline access

Not part of the initial build, but per TECHMED's offline-first principle (TECHMED Brand Overview §4.2) and the precedent already established for Practice (Practice Module §8.2) and anticipated for Learn (Learn Module §10.5), Review's architecture should anticipate that a scoped Review session's content (a bounded, pre-determined set of items, unlike Practice's live-adapting queue) is a reasonable candidate for pre-caching. Reflection Moments, resolutions, and reattempts should function from cached data with sync-on-reconnect for any new attempt data generated, exactly as the Question Experience already specifies for its own offline handling (Question Experience §11.1).

### 10.10 A student returning after a very long absence (multi-month gap)

Where a returning student's entire Knowledge Map has substantially decayed (a scenario the Learning Engine's multi-year scalability principle already anticipates as valuable signal rather than noise, Learning Engine §12), Review Home should not attempt to present the full, honest scope of "everything now technically Fading" as a single overwhelming category. Instead, this scenario routes through the same At Risk → Recovering flow already specified at the Daily Decision Engine level (DDE §8, "Student returns after two weeks") — Review's own Due for Review section is deliberately throttled during the Recovering Macro-State to a small, confidence-building slice (mirroring Section 8.7's Recovery Ability personalization), with the full scope of decayed content re-entering the queue gradually as the student's Macro-State stabilizes back toward Building, rather than all at once.

---

## SECTION 11 — FUTURE SCALABILITY

The Review Module is deliberately structured so the following attach without requiring this specification to be redesigned:

**AI-generated pattern insights.** Section 5.7's Pattern Surfacing is currently rules-driven, keyed off existing Misconception Library accumulation logic (Question Intelligence Model §4.2). This is structured so a more generative pattern-detection layer could eventually identify subtler, less rule-legible patterns across a student's mistake history — attaching underneath the same Pattern Surfacing UI component (Section 5.7) without changing how it's presented to the student.

**Voice-based Reflection Moments.** The Reflection Moment (Section 5.5) is currently a text-and-tap interaction. A future voice mode — consistent with the medium-agnostic principle already established for explanations platform-wide (Question Intelligence Model §9.3, Question Experience §12) — could let a student verbally reconsider an answer before resolution, using the identical underlying content and timing logic, requiring a new interaction surface rather than new reflective logic.

**Collaborative or peer Review.** Nothing in Review's session or state model assumes single-student use at the data layer — session state and attempt logging remain student-scoped (mirroring the same structural allowance already noted for Practice, Practice Module §9). A future shared-Review mode (e.g., a study group reviewing common weak concepts together) would be an additive session-creation context, not a redesign of individual attempt tracking.

**Richer trajectory visualisation in Question Analysis.** Section 6.3, item 6 (related questions attempted since) currently renders as a short list. As attempt history accumulates over a longer UTME preparation journey, this is a natural candidate for a lightweight trajectory view (a simple visual sense of movement over time) — this would be a rendering enhancement over already-captured data, not a new data requirement.

**Cross-subject Pattern Surfacing.** Section 5.7 currently operates primarily within a single Review session's scope. The Subject Knowledge Graph's Cross-Subject Connections (Subject Knowledge Graph §7) already anticipate this exact extension — a future version of Pattern Surfacing could name a pattern that spans subjects (e.g., a recurring algebraic-manipulation misconception showing up in both Chemistry and Physics reviews), using structure that already exists rather than requiring new architecture.

**Parent-facing Review summaries.** The dormant Parent Dashboard extension point already anticipated at the Student Intelligence Model level (Student Intelligence Model §9) could eventually surface a filtered, non-invasive version of Review's Consolidation Summaries (Section 5.9) — reading Progress Metrics and Reinforced-concept counts, never raw Emotional Profile or mistake-level detail, consistent with the hard boundary already established for that extension point.

**Multi-year / repeat-candidate Review.** Exactly as the Learning Engine's own scalability section anticipates (Learning Engine §12), a returning student's prior-year Knowledge Map remains valuable signal rather than being discarded — Review's Session History (Section 4.3, item 7) and Due for Review logic already operate on append-only, never-discarded attempt history (Student Intelligence Model §2), so this extension requires new UI framing for a "new season," not new data architecture.

**Institution or exam-body expansion.** Precisely as the Subject Knowledge Graph and Question Intelligence Model already anticipate (Subject Knowledge Graph §12, Question Intelligence Model §12), extending Review to WAEC, NECO, or Post-UTME content is a matter of the same exam-body tagging already defined elsewhere — Review's category structure (Due for Review, Recent Mistakes, Weak Topics) is exam-type-agnostic by construction.

The general principle, consistent with every other Kairo architecture document: each of these is a new *consumer* of Review's existing structure, not a reason to change it.

---

## FINAL OUTPUT — WHY REVIEW IS KAIRO'S PROOF OF LEARNING

Every other module built so far exists to move a student forward or to fix a gap the moment it's found. Practice presses ahead. Learn stops and repairs. Neither of them, on its own, can answer the one question that actually determines whether UTME preparation was worth anything at all: **did any of it last?**

That is Review's entire reason for existing. It is the only module in Kairo structurally positioned to answer that question honestly, because it is the only module that deliberately waits — that lets time pass, lets forgetting have its chance, and then checks whether understanding survived the gap. A Reinforced state, the single most valuable signal anywhere in Kairo's Knowledge Model (Learning Engine §2.2), cannot be manufactured by Practice and cannot yet be earned inside Learn's fresh-instruction moment (Learn Module §7.3). It is earned here, in Review, or nowhere at all.

This is also exactly why Review carries the heaviest emotional obligation of any module in the product. Its raw material — every item, every session, every pattern — is built from things that already went wrong once. A student who opens Review is, by definition, walking back into a room full of their own past mistakes. Every structural choice in this specification exists to make sure that room feels like a workshop, not a courtroom: the Reflection Moment that lets a student reconsider before being corrected, the Pattern Surfacing that turns five separate misses into one useful insight, the Consolidation Summary that leads with what held before naming what's still shaky, the honest and undersold-nowhere feeling of a genuinely clear day.

TECHMED's Built to Last campaign draws a direct line between preparation and durability — "understanding a topic today is not enough if it has been forgotten by the time the examination arrives" (Campaign Theme, "Built for Retention"). Review is where that promise is either kept or exposed as empty. Every student who opens KAIRO and does the work of Practice and Learn is, in a very real sense, only finding out whether that work actually mattered the day they come back to Review and it holds.

**Think Smart. Perform Elite.**

