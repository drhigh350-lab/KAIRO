# KAIRO CBT EXAM MODE
## Product Specification — The Examination Simulation Layer

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Product Experience Blueprint, the Home Dashboard, the Practice Module, the Question Experience, the Learn Module, and the Review Module. Does not redesign any of them. Every other module in Kairo is built to teach. This one is built to test — faithfully, honestly, and without interference — so that everything else Kairo has taught actually gets proven under real conditions.)*

---

Confirmed. CBT Exam Mode faithfully simulates the real JAMB CBT experience — exam-authentic, non-adaptive, uninterrupted — while Kairo's intelligence brackets that experience on either side: shaping what a mock should focus on beforehand, and turning its results into genuine learning afterward through Review and Learn. During the exam itself, Kairo steps back entirely.

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student, per attempt:

**"If this student walked into a real JAMB CBT centre tomorrow, would today's simulation have honestly prepared them for what that room, that clock, and that screen will actually feel like?"**

Not: how do we make this exam mode feel smart. Not: how do we keep the Intelligence Engine involved. **What does exam-day reality actually require of a student, and how do we recreate exactly that — no more supportive, no less demanding, than the real thing?**

If a design decision can't be traced back to that question, it doesn't belong in CBT Exam Mode.

---

## SECTION 1 — PRODUCT PURPOSE

### 1.1 What CBT Exam Mode is

CBT Exam Mode is Kairo's examination simulation layer — the module that exists to replicate the real JAMB Computer-Based Test experience as faithfully as the product can manage, so that a student's first encounter with that format, that pressure, and that interface is not on the actual exam day. It was already named as a first-class module in the Product Experience Blueprint (§3) and given its own posture within the shared Question Experience (§1.3, §10) — this document is where that posture becomes a complete, standalone specification.

Every other module built so far exists to help a student get better at the underlying material. CBT Exam Mode exists to help a student get better at *performing* that material under the specific, artificial, high-stakes conditions of a real timed computer-based exam — a distinct skill from subject mastery, and one that TECHMED's own campaign architecture treats as its own phase of preparation ("Phase Four: The Pressure Test" and "Phase Six: Examination").

### 1.2 What CBT Exam Mode is explicitly not

CBT Exam Mode is not Practice wearing a timer. Practice is deliberately adaptive, forgiving, and explanatory — built to teach (Practice Module §1.3). CBT Exam Mode is deliberately the opposite in posture during the attempt itself: non-adaptive, unexplained, and exam-authentic. It is also not a second Review surface — Review consolidates and reflects on what has already happened (Review Module §1.1); CBT Exam Mode produces the raw, exam-condition material Review and Learn will later work with, but does not itself reflect, teach, or coach while an attempt is live. And it is not a Challenge — Challenges are fast, shareable, and low-stakes by design (Product Experience Blueprint §4); CBT Exam Mode is deliberately high-fidelity and consequential-feeling, because that feeling is the entire point.

### 1.3 The two-phase identity

CBT Exam Mode has a split personality, by design, and this split is the single most important architectural fact about the module:

**Before and during the exam, Kairo behaves like a real examination platform.** Setup is procedural. Instructions are JAMB-authentic. The attempt itself is silent, non-adaptive, and unassisted — no hints, no explanations, no coaching, no AI assistance, no concept reminders, no motivational interruptions. This is not Kairo being withholding — it is Kairo being honest about what a real exam room will actually be like.

**After submission, Kairo becomes an intelligent coach again.** The instant an attempt ends, the wall comes down — the Performance Report, Review Module handoff, Learn routing, and Insights integration all activate at full strength (Sections 6–8). The two phases are separated by a hard, deliberate boundary — a submission event — not a gradual transition, because a gradual softening during the exam would defeat the entire purpose of the simulation.

### 1.4 How CBT Exam Mode relates to every other module

| Module | Relationship to CBT Exam Mode |
|---|---|
| **Practice** | The teaching loop that builds the mastery CBT Exam Mode tests — CBT Mode never teaches, it only measures (Practice Module §1.3) |
| **Learn** | Explanations are withheld entirely during an attempt (Learn Module §1.5) — Learn only becomes reachable from the Performance Report, once the exam-condition attempt is fully over |
| **Review** | CBT Mode's own Performance Report is the exam's immediate artifact; Review is where a completed mock's mistakes re-enter the ordinary rhythm of consolidation and revisiting (Review Module §1.5, §3.4) |
| **Question Experience** | CBT Mode is one of the four modes the shared Question Experience renders — the one deviation being grid-navigable, non-adaptive, and feedback-withheld (Question Experience §10) |
| **Daily Decision Engine** | A completed mock is treated as a strong trigger for re-planning the next several days' Practice priorities (Product Experience Blueprint §3, "Intelligence Engine interactions") |

### 1.5 The one-sentence purpose statement

**CBT Exam Mode exists to make the real JAMB exam room feel familiar before a student ever sits in one — by being, for the duration of a single timed attempt, exactly as silent, exactly as procedural, and exactly as unaided as the real thing, and only becoming Kairo again the moment the exam ends.**

---

## SECTION 2 — CBT PHILOSOPHY

### 2.1 Familiarity is the product

A student's greatest exam-day disadvantage is rarely pure subject ignorance — it is often the compounding effect of an unfamiliar interface, an unfamiliar clock, and unfamiliar navigation arriving at the same moment as genuine academic pressure. TECHMED's own brand philosophy already identifies this exact failure mode by name: reducing confusion and decision fatigue applies as much to the mechanics of an exam as to the content of one (TECHMED Brand Overview §3). CBT Exam Mode's core value is not that it teaches anything new — it is that by exam day, the interface itself has become invisible, so a student's full attention can go to the questions rather than to figuring out how the software works.

### 2.2 Authenticity over comfort

Every other module in Kairo actively works to reduce friction, soften difficulty, and protect a student's confidence (Practice Module §1.3, Learn Module §2.2, Review Module §2.4). CBT Exam Mode deliberately does not do this during an active attempt. A timer that doesn't flash red is appropriate in Timed Practice (Practice Module §5.4) because that mode exists to build pacing skill gently; the same softened timer inside CBT Exam Mode would be a lie about what the real exam clock feels like. Where Kairo's platform-wide instinct is "make this feel supportive," CBT Exam Mode's instinct must instead be "make this feel real" — and where those two instincts conflict, authenticity wins, because the module's entire reason for existing is to close the gap between practice and the real thing, not to make practice itself more pleasant.

### 2.3 Separation of testing and teaching

This is the single hardest constraint in the entire specification and the one every subsequent section is built to protect: **the exact moment a student needs Kairo's help most acutely — right after getting something wrong under exam pressure — is the exact moment CBT Exam Mode is structurally forbidden from providing it.** This is intentional, not an oversight. A real JAMB exam offers no hints either. A student who has never practiced enduring that silence, that lack of immediate correction, that requirement to keep moving despite uncertainty, is not genuinely exam-ready no matter how strong their underlying knowledge is. The Question Experience already establishes this boundary structurally (Question Experience §10, "Explanation availability: withheld until full submission") — this document is where that boundary is elevated to a governing philosophy, not just a table cell.

### 2.4 Time management as a trainable skill

UTME is not merely a knowledge test; it is a knowledge-under-a-clock test. A student who "knows" the material but has never practiced allocating time across 40, 50, or more questions of varying difficulty within a hard limit is still exposed on exam day. CBT Exam Mode exists to make time management itself a rehearsed skill, not an improvised one — this is why the timer is always on, always visible, always real, and why free navigation (Section 3, Question Experience §3.11) exists specifically to let a student practice the *strategy* of skipping, flagging, and returning — a skill the linear Practice flow never trains, because Practice was never meant to.

### 2.5 Building exam-day psychological readiness

Confidence on exam day is not manufactured through reassurance in the moment — it is built beforehand, through repetition of the exact conditions that will otherwise feel threatening for being unfamiliar. This mirrors the Built to Last campaign's own framing of confidence directly: *"Confidence is not pretending that the examination will be easy. It is knowing that you have built the capacity to face it."* Every mock a student completes is a small rehearsal of the specific psychological experience of exam day — the silence, the countdown, the navigator grid, the submission confirmation — so that by the time the real exam arrives, none of that experience is new. The content might still be hard. The format never should be.

### 2.6 Every mock still ultimately serves learning — just not during the mock

None of the above should be mistaken for CBT Exam Mode existing outside Kairo's learning mission. It exists entirely inside it — the same way a locked door exists inside a house, protecting something rather than standing apart from it. Every attempt's data flows fully into the same Learning Engine, Question Intelligence Model, and Student Intelligence Model as every other module (Section 8) — the withholding is temporal and procedural, never informational. Kairo does not forget what happened during a mock. It simply refuses to say anything about it until the exam-condition attempt is honestly, completely over.

### 2.7 The philosophy in one line

**Silence during the exam is not the absence of care — it is the most honest form of preparation Kairo can offer, and the coaching that follows the moment a student submits is where that care becomes visible again.**

---

## SECTION 3 — STUDENT ENTRY POINTS

### 3.1 Design principle governing all entry points

Consistent with the entry-point discipline already established for Practice (§2.1), Learn (§3.1), and Review (§3.1), every entry point into CBT Exam Mode carries context about *why* this mock is being attempted — but unlike those modules, CBT Exam Mode's own internal experience does not vary by entry point once the exam begins. The context an entry point carries shapes only **exam type and setup defaults** (Section 4) — never the exam-authentic behaviour of the attempt itself (Section 2.3's separation principle applies to entry points too: no entry point is permitted to soften or annotate the exam that follows it).

### 3.2 Home Dashboard

The Home Dashboard does not feature CBT Exam Mode as its primary surface — that role belongs to the Mission Card, pointing toward Practice (Home Dashboard §5). CBT Exam Mode is reachable from the Dashboard through a secondary, low-visual-weight surface, consistent with the Dashboard's own restraint principle (Home Dashboard §2) — most naturally as a quiet suggestion when a student's Macro-State and Learning State (Student Intelligence Model §5) indicate genuine readiness for a pressure-test (e.g., approaching Peak Readiness, or a Learning State shift toward Revising per the Subject Knowledge Graph's Exam Sprint window, §9). This entry point never competes with the Mission Card for the student's first five seconds.

### 3.3 Practice Module

Reachable as one of Practice Home's Personalised Suggestions (Practice Module §3.2, item 6) or as a Recommendation Category surfaced by the Daily Decision Engine (DDE §9 — most naturally under a "Prepare" or "Challenge" framing for a student in Compounding/Peak Readiness). This entry point is the most direct expression of Section 1.4's relationship table: Practice builds the mastery, and at the right moment, Practice itself gently points toward the mode that will test it.

### 3.4 Subject Pages

A student viewing a specific subject's mastery view (Insights' Subject/Topic Mastery Screen, Product Experience Blueprint §7, or the Home Dashboard's Subject Health strip, §4.11) can launch a Subject-Specific Mock directly scoped to that subject — the most natural route into a single-subject exam attempt, distinct from a full combination mock.

### 3.5 Dashboard Recommendations

Distinct from Section 3.2's passive Dashboard surface, this refers to an explicit, DDE-generated recommendation ("Prepare" category, DDE §9) that proactively suggests a mock when the engine's own signals — high Held/Reinforced ratio, strong session consistency, exam-proximity window — indicate a student is genuinely positioned to benefit from a pressure-test rather than more concept-level practice (mirroring the DDE's Compounding/Peak Readiness posture, DDE §2.1).

### 3.6 Weekly Review recommendations

The Weekly Reflection (Learning Engine Phase 2 §8.2) can surface a mock suggestion where its own honest pattern observation indicates readiness — e.g., a week of strong Reinforced transitions across a subject combination. Consistent with the Weekly Reflection's own private, non-comparative character, this suggestion is framed as an invitation tied to genuine recent evidence, never as a generic weekly nudge.

### 3.7 Monthly Review recommendations

The Monthly Reflection ("Kairo Wrapped," Learning Engine Phase 2 §8.3) can similarly close with a mock suggestion where a month's accumulated momentum supports it — this entry point inherits the Monthly Reflection's own celebratory, earned tone, framing a mock as the natural next milestone rather than an obligation.

### 3.8 Official TECHMED Mock Events

A distinct, administrator-scheduled exam type (Section 5, "Future Official TECHMED Mock Events") — these are time-bound, community-wide events analogous in spirit to the Consistency Cup's scheduled cadence, reachable from a dedicated promotional surface (Home Dashboard, community channels) rather than from the Intelligence Engine's personalised recommendations. Even here, once a student enters the actual attempt, the exam-authentic experience is identical to any other mock — only the setup context (a shared start window, a cohort framing) differs.

### 3.9 Challenge invitations (where applicable)

Ordinary Challenges remain fast, shareable, and low-stakes by design (Product Experience Blueprint §4) and do not route into CBT Exam Mode by default. Where a specific, administrator-curated Challenge is explicitly framed as an exam-simulation event (distinct from Kairo's everyday Challenge format), it can invite participants directly into a scoped CBT attempt — this is a deliberate exception reserved for genuinely exam-flavoured community events, not a blurring of the two modules' otherwise distinct postures.

### 3.10 Future AI recommendations

Not part of the initial build, but the architecture should anticipate a future state where a more generative recommendation layer (Learning Engine Phase 2 §12) could proactively suggest a mock based on subtler readiness patterns than the current rule-based DDE signals capture — this attaches as a new *trigger* into the same entry-point structure defined here, consistent with how Review's own equivalent future entry point was scoped (Review Module §3.13).

### 3.11 Entry point summary table

| Entry Point | What it determines | Emotional framing |
|---|---|---|
| Home Dashboard | Exam type default, low-visual-weight suggestion | Quiet invitation — "when you're ready" |
| Practice Module | Exam type default, readiness-triggered suggestion | Earned next step — "you're ready to test this" |
| Subject Pages | Subject-Specific Mock scoping | Analytical, subject-first — "see where this subject stands under pressure" |
| Dashboard Recommendations | Proactive DDE-triggered suggestion | Confidence-building — "prove what you've built" |
| Weekly Review recommendations | Suggestion tied to a strong week's evidence | Momentum-based — "this week supports it" |
| Monthly Review recommendations | Suggestion tied to a month's accumulated progress | Celebratory milestone — "the natural next step" |
| Official TECHMED Mock Events | Shared, scheduled cohort context | Community, event-scale — "a shared moment" |
| Challenge invitations | Exam-flavoured community event scoping | Competitive but still exam-authentic once inside |
| Future AI recommendations | Pattern-detected trigger (reserved) | Proactive, not yet specified |

---

## SECTION 4 — EXAM SETUP

### 4.1 Purpose

Setup is the only part of CBT Exam Mode where Kairo is permitted to look and feel like Kairo — helpful, personalised, informative — because setup is procedural preparation, not the exam itself (Section 2.3's separation principle draws its line precisely at the moment an attempt begins, not before). Once that line is crossed, Section 5 takes over entirely. This section exists to make sure everything a student needs to decide and configure happens *before* the wall goes up, so nothing interrupts the simulation once it starts.

### 4.2 Governing design constraint

Setup must be fast enough that it never becomes a barrier to attempting a mock, but thorough enough that a student never discovers, mid-exam, that they configured something incorrectly — because CBT Exam Mode offers no way to fix a setup mistake once the attempt begins (Section 5.11 confirms this explicitly). This is a sharper version of the Practice Module's own Session Creation discipline (Practice Module §4.1) — sensible defaults, minimal required input, but here every default must also be *exam-accurate*, not just convenient.

### 4.3 Exam Types

| Exam Type | What it is | Question source | Duration | Navigation |
|---|---|---|---|---|
| **Full UTME Mock Exam** | The complete, exam-authentic simulation — full subject combination, real JAMB question count and time allocation | Drawn across the student's full active Subject Combination (Student Intelligence Model §1) | JAMB-standard (e.g., ~2 hours for the full combination) | Grid-navigable across all subjects |
| **Subject-Specific Mock** | A single subject, full-length, exam-authentic pacing for that subject alone | One subject, proportional question count and time | Subject's JAMB-standard share of the full exam | Grid-navigable within that subject |
| **Custom Mock** | Student-configured scope (chosen subjects, chosen topics, chosen question count/duration) | Student-selected, defaulting to Smart selection within scope | Student-set, bounded by realistic presets (mirroring Practice's Short/Standard/Long pattern, Practice Module §4.4) | Grid-navigable within configured scope |
| **Timed Practice Exam** | A lighter-weight timed set — exam pacing pressure without full CBT authenticity (no navigator grid requirement, shorter length) | Smart Practice selection, timed | Shorter, student- or system-set | Can be linear or grid-navigable, configurable |
| **Past Question Simulation** | A specific historical JAMB paper, reproduced faithfully by year | A tagged, authentic past paper (Question Intelligence Model §2.5, Exam body/Year fields) | The original paper's real duration | Grid-navigable, exactly as the original |
| **Official TECHMED Mock Events** | Administrator-scheduled, cohort-wide, time-bound mock | TECHMED-curated question set for the event | Fixed, event-defined | Grid-navigable, identical to Full UTME Mock Exam |

All six types render through the identical underlying CBT engine and the identical Question Experience mode flag (Question Experience §1.3) — what varies is exclusively scope, duration, and question source, never the exam-authentic behaviour once an attempt is live. This mirrors the Subject Knowledge Graph's own principle that new exam-body or format variants are content and configuration, never new architecture (§12).

### 4.4 Subject combination selection

For Full UTME Mock Exam, defaults to the student's confirmed active Subject Combination (Student Intelligence Model §1) with no re-selection required. For Subject-Specific and Custom Mocks, the student selects from that same combination — CBT Exam Mode never introduces subjects outside a student's declared combination, since doing so would test material the student was never actually preparing to be examined on.

### 4.5 Duration and question count

Full UTME Mock Exam and Official TECHMED Mock Events use JAMB's own real, current duration and question-count standards — these are treated as ground truth, not configurable, because altering them would directly undermine Section 2.4's time-management training purpose. In practice this means English carries 60 questions and every other subject in the combination carries 40, totalling 180 for a standard 4-subject combination — a uniform per-subject count would misrepresent the exam format the module exists to rehearse. Custom Mock and Timed Practice Exam offer bounded presets rather than freeform numeric input (mirroring Practice's own question-count preset pattern, Practice Module §4.4), since an unrealistic self-selected duration would produce pacing data that doesn't actually transfer to exam day.

### 4.6 Pre-Exam Instructions Screen

A deliberately JAMB-authentic screen, rendered before every attempt regardless of exam type — mirroring the real CBT centre's own pre-exam instruction flow as closely as content and legal accuracy allow (Product Experience Blueprint §3). This screen covers: navigation mechanics (how the grid works, how flagging works), submission mechanics (manual vs. auto-submit on time-up), and a plain statement that no hints, explanations, or assistance will be available during the attempt (directly restating Section 2.3 to the student, not just enforcing it silently). Familiarity with *this exact screen* is itself part of the value — a student who has seen it a dozen times in Kairo will not be reading it for the first time, distracted, in a real CBT centre.

### 4.7 Device and environment checks

Before an attempt begins, a lightweight, non-blocking check confirms adequate connectivity and, where relevant, warns a student if their device or connection quality might make a full-length timed attempt risky (feeding the same Device/connectivity context signal already defined at the Daily Decision Engine level, DDE §2.4) — framed as a practical heads-up, not a gate, consistent with TECHMED's offline-first commitment (TECHMED Brand Overview §4.2) and Section 5.9's later handling of connectivity loss mid-exam.

### 4.8 Confirmation and handoff

Once exam type, scope, and duration are confirmed (or accepted at default), a single explicit "Begin Exam" action — not a casual "Start," mirroring the deliberate weight already established for full-exam submission — hands off directly into the Pre-Exam Instructions Screen (4.6) and then the live attempt (Section 5). There is no further configuration step once this action is taken.

### 4.9 What Setup deliberately does not do

Setup never previews question content, difficulty, or topics in a way that would let a student selectively avoid weak areas — Custom Mock's scope selection is about subject/topic breadth, never about cherry-picking easy material, since doing so would corrupt the exam's own diagnostic value. Setup never offers a "practice this exam type first" softened warm-up mode — that product exists already, and it's called Timed Practice, a genuinely distinct exam type (4.3), not a training-wheels version of the same one.

---

## SECTION 5 — THE CBT EXPERIENCE

### 5.1 Purpose

This section specifies what happens once "Begin Exam" is tapped and the Pre-Exam Instructions Screen is dismissed — the live attempt itself, rendered through the Question Experience's shared surface (Question Experience §1.1) under its CBT mode flag (§10). Everything here exists in service of Section 2's philosophy: authentic, silent, non-adaptive, uninterrupted.

### 5.2 The screen anatomy, inherited

CBT Exam Mode uses the identical screen anatomy already fully specified in the Question Experience (§3) — header, progress indicator, question text, options, bottom actions — with the mode-specific behaviours from that document's §10 table now treated as CBT Exam Mode's own binding defaults, not merely a comparison row. Specifically and non-negotiably during a live attempt:

- **Navigation:** Grid-navigable, free jump-around (Question Experience §3.11) — a question navigator grid showing answered, flagged, and unanswered items, exactly mirroring JAMB's own interface.
- **Feedback timing:** Withheld until full submission (Question Experience §5.1–5.6) — no green/red border, no correctness signal of any kind appears during the attempt.
- **Explanation availability:** Fully withheld until after submission (Question Experience §6, Learn Module §1.5) — the "See full explanation" affordance does not exist inside a live CBT attempt.
- **Timer:** Always on, exam-authentic, sticky through scroll on long stems (Question Experience §3.6, §11.7) — no pacing-aid framing, no softened styling; this is the real countdown.
- **Difficulty indicator:** Hidden entirely (Question Experience §3.4) — JAMB itself does not label difficulty per question, and neither does Kairo during a mock.
- **Bookmark:** Available (Question Experience §3.12) — bookmarking is a personal, silent action that does not interrupt exam authenticity, and its data is simply held until Section 6's post-submission phase.
- **Report Question:** Deferred entirely to the post-submission Performance Report (Question Experience §3.13) — no report affordance appears mid-attempt.

### 5.3 The question navigator grid

The single largest structural deviation from every other module's shared Question Player, and the one justified entirely by exam authenticity (Question Experience §3.11). The grid shows, at a glance, every question's status: **answered**, **flagged for review**, **unanswered**, and **current position** — using colour paired with icon/label per the platform's colour-blind accessibility standard (Question Experience §8.4). A student can jump to any question in any order, exactly as the real JAMB interface allows, and can change a previously submitted answer freely up until final exam submission (Question Experience §5.5) — this is standard exam behaviour, not a diagnostic event, and is rendered with no judgment framing whatsoever.

### 5.4 Silence as a designed behaviour, not an absence

Section 2.3 established this as philosophy; here it becomes explicit interaction specification. During a live attempt, the following are all structurally disabled, not merely hidden behind a tap:

- No Kai messages of any kind appear — no greeting, no proactive moment, no tone-calibrated encouragement.
- No Wisdom Spark fires, regardless of what the underlying Concept Node updates would otherwise trigger — the spark's rarity principle is protected by never appearing at all during CBT Mode, reserving it entirely for the post-submission phase.
- No streak, Momentum Streak, or KAIRO Score change is surfaced anywhere on screen — these continue to update silently in the background (Section 8) but render nowhere during the attempt.
- No adaptive difficulty shift occurs — every question in the set was fixed at Setup (Section 4) and does not change composition based on live performance, unlike Practice's queue-interrupt logic, which is explicitly Practice-only.

This is a genuine behavioural fork from every other module in Kairo, and it is deliberate: CBT Exam Mode is the one place in the entire product where the Intelligence Engine watches without acting.

### 5.5 Time pressure, rendered honestly

The timer counts down visibly and continuously, using standard, unstyled urgency conventions consistent with what a real CBT centre's countdown would show — this is the one explicit exception to the Question Experience's platform-wide "no aggressive urgency styling" default, because CBT Mode's entire purpose requires the real feeling of a closing window, not a softened approximation of one. As time runs low, the interface may intensify the timer's visual prominence (without introducing sound, vibration, or interruption that a real exam centre wouldn't produce) — the goal is authentic pressure, not manufactured alarm.

### 5.6 Answering and re-answering

Selecting an option updates that question's status on the navigator grid immediately (5.3). A student may leave a question unanswered and return later, change a previous answer any number of times, or flag a question for a deliberate second look — all without any judgment framing. No answer is locked until the exam's final submission (Section 6), which is the one structural point where CBT Exam Mode's answer-locking behaviour differs from every linear module (Practice, Learn, Challenges) that locks each answer individually on submission.

### 5.7 Flagging for review

A dedicated flag affordance on the question navigator (distinct from the Bookmark affordance in 5.2, which persists beyond the exam) lets a student mark a question as "come back to this" within the current attempt only — flagged status is visible on the grid (5.3) and cleared automatically once the exam is submitted, since it is a tool for in-exam strategy, not a persistent learning signal the way a Bookmark is.

### 5.8 What a student experiences reading a question

Question rendering itself — stem, images, mathematical notation, tables, diagrams — follows the identical Question Experience media and typography standards used everywhere else in Kairo (Question Experience §3.7–3.10, §7) — a diagram in CBT Mode looks and behaves exactly as it does in Practice, because the *rendering quality* of a question is not part of what CBT Mode is testing; only the *support surrounding* that question is withheld.

### 5.9 Connectivity loss mid-exam

Per the offline-first principle already established platform-wide (TECHMED Brand Overview §4.2, Practice Module §8.2, Question Experience §11.1): local state is preserved exactly, the exam resumes from the same point on reconnect, and — critically — timer behaviour during a genuine connectivity gap is communicated clearly and never silently penalises the student for a network failure outside their control. This is the one place where CBT Mode's authenticity principle (2.2) yields to fairness — a real JAMB centre does not expect a student to lose exam time to their own internet connection, and neither does Kairo.

### 5.10 Exiting mid-exam

Given the stakes, exiting an in-progress CBT attempt requires the explicit confirmation step already specified at the Question Experience level (§11.8) — this is one of the few places in all of Kairo where added friction is correct, because the cost of an accidental exit (losing exam-condition context, corrupting the readiness data being collected) genuinely outweighs one extra tap. A student who does confirm exit mid-attempt has that attempt marked incomplete, not scored — though genuinely substantial partial data may still inform Behaviour Profile fatigue signals (Section 8), the attempt itself never contributes a false readiness signal to Exam Readiness (Student Intelligence Model §6).

### 5.11 No setup mistakes are recoverable mid-exam

As flagged in Section 4.2: if a student realises mid-attempt that they configured the wrong scope, duration, or subject, there is no in-exam correction mechanism. The only available action is exit-and-restart (5.10), treated exactly as any other mid-exam exit. This is a deliberate constraint, not an oversight — a real JAMB exam offers no "actually, let me reconfigure" option either, and CBT Exam Mode's entire value depends on that constraint being real, not softened for convenience.

---

## SECTION 6 — SUBMISSION & RESULTS

### 6.1 Purpose

Submission is the hard boundary Section 2.3 has been building toward throughout this document — the single moment CBT Exam Mode transitions from silent examination platform back into intelligent coach. Everything before this line is withheld. Everything after it is not just permitted but actively delivered, richly and immediately, because the entire point of the silence during the exam was to make this moment's insight genuinely earned and genuinely trustworthy.

### 6.2 Submission Confirmation Screen

Full exam submission — as distinct from individual question answering, which never requires confirmation (5.6) — requires an explicit, deliberate Submission Confirmation step (already established at the Question Experience level, §4, "Student confirms"), because the stakes of accidentally submitting an entire timed exam are categorically different from a single practice question. This screen shows a clear summary before final commitment: how many questions are answered, flagged, and unanswered, with an explicit "Are you sure you want to submit?" — mirroring the real JAMB submission flow as closely as content accuracy allows, so this screen too becomes a rehearsed, familiar moment rather than a surprising one on exam day.

### 6.3 Manual vs. auto-submission

A student may submit manually at any point via the Submission Confirmation Screen (6.2), or the exam may auto-submit when the timer reaches zero — in the auto-submit case, whatever was selected at that instant counts exactly as-is, with no confirmation step (since none is meaningful once time has expired), consistent with the Question Experience's own Timed-out questions rule applied at the whole-exam level (§5.6). An unanswered question at auto-submit times out as unanswered, never silently marked wrong in a way that misrepresents what actually happened.

### 6.4 The moment of transition

The instant submission is confirmed (manual) or time expires (auto), the exam-authentic wall from Section 5.4 comes down completely and immediately — Kai's voice returns, the Wisdom Spark becomes available again, and the full Performance Report begins generating. There is no gradual re-introduction of Kairo's supportive presence; the transition is as deliberate and as immediate as the silence that preceded it, so the contrast itself reinforces that something real just concluded.

### 6.5 Performance Report Screen — structure

Rendered immediately post-submission, per the structure already outlined at the Product Experience Blueprint level (§3):

1. **Overall score** — plain, honest, exam-condition performance, shown first since this is the one screen in all of Kairo where a raw score leading the page is appropriate (the student has just taken a real exam and has earned the right to see the number immediately, unlike Practice's Session Completion screen, which deliberately leads with plain-language framing instead, Practice Module §6.2).
2. **Score by subject** — a subject-level breakdown, using the same student-facing Subject Health language established at the Home Dashboard level (§4.11) alongside the raw subject scores.
3. **Time-per-question analysis** — surfaces genuinely useful pacing insight ("You spent significantly longer on the last 10 Physics questions than the first 10 — that's a pacing pattern worth noticing"), feeding directly from the response-time baselining already captured throughout the attempt (Section 8).
4. **Flagged-question review** — every question the student flagged during the attempt (5.7), surfaced first in the post-submission review queue, since the student's own in-exam judgment that these deserved a second look is a meaningful signal worth honouring immediately.
5. **Comparison against the student's own target score** — read from Student Identity's declared Target UTME Score field (Student Intelligence Model §1), never against other students, consistent with the platform-wide rule against comparative framing in personal feedback (Learning Engine Phase 2 §7.2, rule 2).

### 6.6 What the Performance Report is not

It is not yet a Learn or Review session — it is a report, structurally closer to CBT Mode's own artifact than to Review's reflective, paced experience (Review Module §1.5 already draws this exact distinction). Explanations remain unavailable directly on this screen; the report's job is to summarise what happened, honestly and completely, and then hand off clearly to where deeper engagement belongs (Section 6.7).

### 6.7 The handoff onward

The Performance Report closes with clear, specific routing rather than leaving the student to decide what to do with a completed mock on their own — consistent with the Daily Decision Engine's explainability standard (DDE §12) applied to this moment specifically:

- A direct route into a **Review session scoped to this exam's misses and flagged questions** (Review Module §3.4), distinct from the exam-authentic report itself.
- Where individual questions reveal a genuine comprehension gap rather than a one-off miss, a direct route into the relevant **Learn lesson** (Learn Module §3.4's own "Practice summary" entry point, extended here to CBT-sourced signal).
- The **Report an Issue** affordance, deferred throughout the live attempt (5.2), becomes available here for any specific question the student wants to flag for content review (Question Experience §3.13, Practice Module §5.8).
- Where the mock reveals strong, exam-condition-validated performance, the report can instead route toward a **Challenge or Compounding-state Practice suggestion** (DDE §9), since a strong mock is itself evidence the DDE should read.

### 6.8 What Submission & Results never does

It never re-opens the exam for correction once submitted (6.2's confirmation exists precisely so this is never ambiguous). It never displays a raw comparative percentile against other students on this screen (6.5's comparison is target-score-based only). It never withholds the score itself while padding the report with framing first — unlike Practice's Session Completion screen, a completed exam's plain score is exactly what the student came here to find out, and the report respects that directly before doing anything else.

---

## SECTION 7 — REVIEW INTEGRATION

### 7.1 Purpose

This section specifies, in full mechanical detail, exactly how a completed CBT attempt flows into the Review Module — building on the handoff already gestured at in Section 6.7 and on the entry point Review itself already reserved for this exact moment (Review Module §3.4).

### 7.2 Why CBT attempts need Review's specific handling, not Practice's

A single CBT mock routinely surfaces more misses in one sitting than an ordinary Practice session — this is structurally guaranteed by the format itself, since a full mock forces breadth across an entire subject combination in one timed attempt rather than the narrower, adaptively-scoped slice Practice would ordinarily present. This is exactly the scenario Review's own session-pacing safeguards exist to protect against (Review Module §2.4, §5.10) — a CBT-sourced Review session is precisely the "large backlog after a long gap" case Review's pacing discipline was built to handle, except compressed into a single event rather than accumulated over days.

### 7.3 The CBT-scoped Review session

When a student routes from the Performance Report into Review (Section 6.7), the resulting session is explicitly scoped to that exam's content — its misses, its flagged questions, and any newly-Fading concepts the attempt revealed — rather than pulling from the general Fading queue Review Home would otherwise surface (Review Module §4.3, item 3). The CBT-scoped session still uses Review's own session-pacing cap (Review Module §5.10) — a mock with fifteen misses does not produce a fifteen-item Review session in one sitting; it produces a properly-sized first pass, with the remainder visible on Review Home as due.

### 7.4 Flagged questions take priority

Questions the student personally flagged during the attempt (Section 5.7) are surfaced first within the CBT-scoped Review session, ahead of questions the engine alone identified as weak — this respects the same self-identified-importance principle already established for Bookmarks throughout the platform (Practice Module §2.7, Learn Module §3.9, Review Module §3.9).

### 7.5 The Reflection Moment, adapted for exam-sourced misses

Review's signature interaction — showing the student their own original question and answer before resolving it (Review Module §5.5) — applies to CBT-sourced misses exactly as it does to any other Review content, with one addition specific to this context: because CBT Mode captured response time under genuine timed pressure (Section 5.5), the Reflection Moment for an exam-sourced item can honestly distinguish between "you didn't know this" and "you were running out of time and rushed this" — a distinction ordinary Practice misses rarely carry with the same clarity. This is surfaced gently, as context rather than excuse ("You had under 30 seconds left on this one — worth another look now, unhurried"), never as a way to soften the fact that the answer was still wrong.

### 7.6 Pattern Surfacing across a single exam

Review's Pattern Surfacing mechanism (Review Module §5.7) is unusually well-suited to CBT-sourced content specifically, because a single mock's breadth across an entire subject combination makes cross-subject patterns visible in a way a narrower Practice session rarely allows in one sitting.

### 7.7 The Learn handoff, inherited unchanged

Review's own triggering conditions for handing off to Learn — a genuine Repeated gap, or a failed Reflection Moment reconsideration (Review Module §7.6) — apply identically to CBT-sourced content, with no CBT-specific exception. A comprehension gap revealed under exam conditions is, if anything, a more urgent signal to route to Learn, not a less urgent one.

### 7.8 Reinforcement Attempts on exam-sourced concepts

Exactly as Review Module §5.8 and §7.3 already specify, every CBT-scoped Review item closes with a genuine Reinforcement or Alternative Representation attempt (Question Intelligence Model §6.2) — never the identical exam question repeated verbatim. This is where Reinforced transitions from CBT-sourced gaps are actually earned — the CBT attempt itself, like Practice, can only produce a first-pass Held state at most; genuine post-forgetting recall still has to happen in Review.

### 7.9 What CBT Exam Mode never does with Review

CBT Exam Mode does not maintain its own parallel revision-scheduling logic, its own misconception tracking, or its own notion of what's "due" for a concept — every one of those questions is answered by the same Learning Engine and Subject Knowledge Graph infrastructure Review already reads from. CBT Exam Mode's only original contribution is the exam-condition attempt data itself (Section 8); everything downstream is Review and the Learning Engine's job, exactly as it already is for every other source of attempt data in Kairo.

---

## SECTION 8 — INTELLIGENCE ENGINE INTEGRATION

### 8.1 Purpose

CBT Exam Mode, like every module before it, does not run a separate intelligence layer of its own. Every read it performs at Setup and every write it produces at and after Submission flows through the Learning Engine, the Student Intelligence Model, the Question Intelligence Model, and the Subject Knowledge Graph exactly as already specified.

### 8.2 Why CBT-sourced signal is uniquely valuable

Response-time baselining (Learning Engine §1.3) depends on comparing a student's pace against a stable reference point. CBT Exam Mode's standardised, timed, non-adaptive conditions make it the single most reliable data-collection context anywhere in Kairo for this purpose. Practice sessions vary in length, difficulty mix, and student mood session to session; a CBT mock's fixed, exam-authentic structure removes most of that variance, making its signal cleaner.

### 8.3 What is captured during a live attempt

| Signal | What it feeds | Distinct quality vs. other modules |
|---|---|---|
| **Time spent per question** | Response-time baselining (Learning Engine §1.3), the Performance Report's pacing analysis (§6.5, item 3) | Captured under genuine, unmodifiable time pressure — the cleanest pacing signal Kairo collects |
| **Answer changes before final submission** | A supplementary confidence signal (Question Experience §5.5), distinct from the accuracy of the final submitted answer | Only CBT Mode allows this — Practice, Learn, and Challenges lock on first submission (Question Experience §3.11) |
| **Flagged questions** | Review's priority ordering (§7.4) and a self-identified-uncertainty signal | Explicit, deliberate self-flagging under exam conditions, distinct from a Bookmark's more casual "worth revisiting" signal |
| **Question navigation order and revisits** | Exam-condition behavioural baselining, distinct from Practice-mode baselining (Question Experience §9.1) | Only meaningful in a grid-navigable context — Practice's linear flow generates no equivalent signal |
| **Final accuracy per question** | `retention_state`, `confidence_score`, and the KAIRO Score's Accuracy component, weighted for exam-condition performance (Product Experience Blueprint §3) | Carries a distinct evidentiary weight, per 8.4 |
| **Whole-exam completion and timing** | Behaviour Profile fatigue-pattern signals (Student Intelligence Model §3), especially for a full-length mock's late-exam performance decline | A full mock is one of the few contexts long enough to reveal genuine within-attempt fatigue curves |
| **Device/connectivity behaviour during the attempt** | Diagnostic signal only (§5.9), explicitly never used to personalise learning content | — |

### 8.4 Why exam-condition accuracy is weighted differently

A correct answer given under CBT Mode's genuine time pressure, with no hints and no adaptive support, is stronger evidence of durable understanding than the identical correct answer given in untimed Practice. This is the direct extension of the Learning Engine's own confidence-scoring logic, which already treats "performance under varied question framing" as more diagnostic than a single easy exposure (Learning Engine §1.3). CBT Mode's timed, unaided, single-attempt condition is simply the most demanding "framing" the platform offers, and `confidence_score` updates should weight it accordingly — a Held state confirmed under CBT conditions is trusted more readily than one confirmed only in Practice.

### 8.5 Why exam-condition CBT attempts still cannot alone produce Reinforced

Despite 8.4's weighting, a first-time correct answer inside a CBT mock — like a first-time correct answer inside Practice — cannot alone promote a concept to Reinforced, because Reinforced specifically requires successful recall *after* time has passed and forgetting has had a genuine chance to occur (Learning Engine §2.2, restated identically for Practice at Practice Module §7.2 and for Learn at Learn Module §7.3). A CBT mock is a single, high-fidelity moment in time — it cannot manufacture the passage of time the Reinforced state requires. What it can do is confirm a Held state with unusually high confidence (8.4), and flag exactly which concepts are now candidates for genuine Reinforced-transition testing the next time they resurface in Review (§7.8).

### 8.6 Feeding the Daily Decision Engine

A completed mock is one of the strongest single-event triggers the DDE's input set recognises (DDE §2.2). Concretely: newly-confirmed Held concepts de-prioritise from upcoming Practice sessions; newly-revealed gaps (whether Critical, Recoverable, or Hidden per the Subject Knowledge Graph's severity classification, §8.2) enter the priority queue at the appropriate tier; and a Macro-State reassessment is triggered where the mock's aggregate performance meaningfully diverges from the student's pre-exam Macro-State (e.g., a Building-state student performing at a Compounding level under exam conditions).

### 8.7 KAIRO Score influence

Every attempt inside a completed CBT mock contributes to the Accuracy and Retention components using the same weighting logic as any other attempt (Student Intelligence Model §7.3), with 8.4's exam-condition confidence weighting applied — there is no separate "CBT score" any more than there is a separate "Review score" or "Learn score." Consistency contribution follows the same session-completion basis already established platform-wide (Student Intelligence Model §7.3, Review Module §7.9) — a completed mock counts as a genuine, distinct-day engagement touchpoint.

### 8.8 An incomplete or exited mock's contribution

Per Section 5.10's standing rule, an exited-mid-attempt mock is marked incomplete and does not contribute to Exam Readiness (Student Intelligence Model §6) or the KAIRO Score, since a partial, abandoned attempt under exam conditions is not comparable evidence to a completed one — but per 8.3's fatigue-signal row, genuinely substantial partial data (e.g., a student who completed 35 of 50 questions before exiting) can still inform Behaviour Profile fatigue patterns, since that much data is meaningful signal about endurance even if it can't stand in for a full readiness measurement.

### 8.9 What CBT Exam Mode never computes independently

CBT Exam Mode never independently decides Macro-State, Learning State, gap severity, or exam-proximity weighting. It reads all of these from the Student Intelligence Model and Subject Knowledge Graph exactly as authored elsewhere, and its only original contributions to the shared model are the exam-condition attempt data itself (8.3) and the confidence-weighting signal that data carries (8.4).

---

## SECTION 9 — PERSONALISATION & MOTIVATION

### 9.1 Governing principle

Personalisation in CBT Exam Mode operates under a sharper constraint than anywhere else in Kairo: the same substance-versus-framing split that governs personalisation platform-wide still applies, but here the *substance itself* — the actual exam content and conditions during a live attempt — is explicitly off-limits to personalisation, per Section 2.2's authenticity-over-comfort principle. What personalises is exclusively **what happens before Setup and after Submission** — never the exam experience in between.

### 9.2 Personalising exam-type suggestions

Which exam type a student is nudged toward (Section 3's entry points) is personalised heavily — a student in Building Macro-State is rarely, if ever, proactively suggested a Full UTME Mock Exam; a student approaching Peak Readiness is.

### 9.3 Personalising Setup defaults, never exam content

Question count presets, duration defaults, and suggested subject scope for Custom Mocks (§4.5) draw from the student's Behaviour Profile (Student Intelligence Model §3) exactly as Practice's own Session Creation defaults do (Practice Module §4.4) — but critically, this personalises *how much exam a student is offered to attempt*, never *which specific questions* appear based on inferred weakness in a way that would make the mock artificially easier or harder than a genuine JAMB paper would be for that combination.

### 9.4 Personalising the pre-exam framing

Kai's tone in any surfaced entry-point suggestion (Section 3) calibrates to Macro-State exactly as it does everywhere else (Learning Engine Phase 2 §7.4) — warmer and more permission-giving for a Wavering or Recovering student being gently offered a lower-stakes Timed Practice Exam rather than a full mock; sharper and more directly challenge-framed for a Compounding or Peak Readiness student being offered a Full UTME Mock Exam as an earned test. This calibration ends the instant Setup's "Begin Exam" action is confirmed (§4.8) — Kai's voice does not follow the student into the Pre-Exam Instructions Screen or the attempt itself in any personalised form.

### 9.5 Personalising the post-submission framing

This is where CBT Exam Mode's motivational design does its real work, since Section 9.1 forecloses personalisation during the attempt entirely. The Performance Report's framing (§6.5) and Kai's return (§6.4) calibrate fully to Macro-State and Emotional Profile (Student Intelligence Model §4). Both students see the identical, unsoftened score (§6.5, item 1) — personalisation shapes *what surrounds* that number, never the number itself.

### 9.6 Motivating return after a difficult mock

A poor mock result carries real emotional risk, arguably more than any single Practice session. The platform-wide rule against guilt-based re-engagement (Learning Engine Phase 2 §7.2, rule 3) applies with full force here — the Performance Report never frames a poor result as evidence the student "isn't ready" in a global sense, and the routing in §6.7 always leads toward a concrete, bounded next action rather than leaving the student alone with a discouraging number.

### 9.7 Celebrating genuine exam-condition wins

The Wisdom Spark's rarity principle is honoured with particular weight in CBT Mode's post-submission phase — a strong mock result, a personal-best score, or a Held state newly confirmed under exam conditions (8.4) are exactly the kind of genuine, evidence-backed inflection points the Spark exists for. Because the Spark was entirely withheld during the attempt itself (§5.4), its appearance on the Performance Report carries unusual weight.

### 9.8 Building rehearsed confidence over repeated attempts

A student's *history* of CBT attempts is itself motivational material the Performance Report and subsequent Kai messaging can draw on — "Your pacing on the last 10 questions has improved across your last three mocks" is a genuine, specific, trajectory-based observation, never a generic "you're getting better!"

### 9.9 What CBT Exam Mode's motivational language avoids

No comparative or percentile framing anywhere in the Performance Report or its follow-up messaging. No urgency-manufacturing language about how many mocks "should" have been completed by a given point in the exam calendar. No generic enthusiasm ("Great exam!") standing in for a specific, evidence-based observation.

### 9.10 The motivational throughline

Every pattern in this section protects one outcome: a student should be able to walk away from any mock — strong or weak — with a clearer, more honest sense of where they actually stand than they had before attempting it, and with that clarity feeling like genuine progress toward exam-day readiness rather than a verdict on their worth as a student.

---

## SECTION 10 — EDGE CASES

### 10.1 A student who has never taken a mock before

A first-ever CBT attempt carries genuine diagnostic weight — it establishes the student's initial response-time baseline (§8.2) and their first Exam Readiness data point (Student Intelligence Model §6) — but it should not be treated by Setup or by Kai's pre-exam framing as a test the student is expected to have already calibrated for. A first mock's suggestion (Section 3) can be framed honestly as a first attempt at the format itself, not just the content. The Performance Report for this first attempt should explicitly avoid comparing it to a nonexistent history and instead frame it purely as a new, honest baseline.

### 10.2 A student who repeatedly abandons mocks before completion

Where a student's history shows a pattern of exiting mocks mid-attempt (§5.10) rather than completing them, this is a distinct signal from ordinary Practice abandonment — it suggests either genuine time-availability mismatch or a specific aversion to the exam-condition pressure itself. Rather than continuing to suggest the same exam type, subsequent entry-point suggestions (Section 3) should bias toward shorter, lower-stakes formats — Timed Practice Exam or a scoped Subject-Specific Mock rather than repeatedly offering the Full UTME Mock Exam.

### 10.3 A mock taken with insufficient remaining time

Where a student begins a Full UTME Mock Exam but the Device/environment check (§4.7) or an explicit student-stated time constraint suggests the full duration isn't realistically available, Setup should surface this plainly before "Begin Exam" is confirmed — recommending a shorter exam type instead. This is a Setup-phase safeguard, not an in-exam intervention (which Section 2.3 forbids).

### 10.4 Identical or near-identical mock attempts

Where a student retakes the same Past Question Simulation (§4.3) or an identical Custom Mock configuration, the resulting attempt is still valuable exam-condition-format practice, but its accuracy signal must be weighted with appropriate caution against the Learning Engine's own "gaming the system" edge case (Learning Engine §11) — an abnormally improved score on an identical paper is more likely partial memorisation of specific items than genuine concept mastery.

### 10.5 A mock interrupted by a genuine emergency

Distinct from ordinary mid-exam exit (5.10), a student may need to abandon a mock for a real, sudden reason unrelated to the exam itself. CBT Exam Mode has no mechanism to distinguish intent here — and per Section 2.2's authenticity principle, it should not try to. The attempt is marked incomplete exactly as any other exit, and Kai's return framing stays neutral and forward-looking rather than presuming discouragement.

### 10.6 A student whose exam-condition performance sharply contradicts their Macro-State

Where a mock reveals performance meaningfully stronger or weaker than the student's current Macro-State would predict, this is not silently absorbed into a single Concept Node update — it is a genuine Macro-State reassessment trigger (§8.6). A single mock is a strong signal but not treated as an instant override — the reassessment weighs the mock against the existing rolling-window evidence already governing Macro-State transitions elsewhere.

### 10.7 Official TECHMED Mock Events with technical issues affecting the cohort

Where a scheduled, shared Mock Event (§3.8, §4.3) experiences a platform-wide technical disruption affecting multiple students simultaneously, the event's results require administrative review before being treated as authoritative Exam Readiness data. This is flagged for TECHMED's content/operations team rather than silently accepted into the Student Intelligence Model.

### 10.8 A student attempting a mock outside their declared Subject Combination

Where a student attempts a Custom Mock or Past Question Simulation scoped to subjects outside their currently declared active Subject Combination, this is permitted, but the resulting data is tagged distinctly and does not silently overwrite Exam Readiness calculations tied to the student's primary declared combination — the historical Knowledge Map is preserved and valuable, never discarded, but it is not conflated with the student's primary readiness picture without an explicit combination change.

### 10.9 Sparse question pools for Past Question Simulation or Custom Mock scope

A specific past paper or a narrow Custom Mock scope may not yet have a complete, authentic question set available. Setup must surface this honestly before the attempt begins ("This paper isn't fully available yet — here's what we have, or choose a different year") rather than silently substituting unrelated questions into what a student believes is an authentic past paper.

---

## SECTION 11 — FUTURE SCALABILITY

The CBT Exam Mode is deliberately structured so the following attach without requiring this specification to be redesigned:

**Additional exam bodies (WAEC, NECO, institution-specific Post-UTME).** The Exam body and Year fields already established at the Question Intelligence Model level (§2.5) mean a new exam body is new content and a new Setup-level exam-type entry (§4.3), not new architecture.

**Richer post-submission analytics.** The Performance Report's structure (§6.5) is component-driven, not prose-driven — a future, more sophisticated pacing-visualisation layer or a deeper cross-subject correlation view would populate the same report structure with richer underlying computation.

**AI-generated mock configurations.** Custom Mock's current scope-selection (§4.3–4.4) is student-driven; a future generative layer could suggest an intelligently-scoped Custom Mock based on subtler readiness patterns than the current DDE-driven entry-point suggestions capture (§3.10's reserved future trigger).

**Proctoring or integrity features.** Should TECHMED ever need stronger attempt-integrity guarantees (e.g., for official, credential-bearing Mock Events, §3.8), this would attach as an additional Setup-phase and in-exam monitoring layer around the existing engine, consistent with the module's own strict separation between exam-authentic behaviour (Section 5, unchanged) and everything procedural surrounding it.

**Adaptive mock difficulty across attempts (not within one).** While Section 2.3 and §9.3 firmly establish that a single mock's *content* is never adaptively curated mid-attempt, a future capability could adjust which *Past Question Simulation year* or *Custom Mock scope* is suggested for a student's *next* mock based on their prior mock's results.

**Voice or accessibility-enhanced exam delivery.** The Question Experience's own medium-agnostic explanation architecture (§12) extends naturally to CBT Mode's question rendering.

**Multi-year / repeat-candidate mock history.** A repeat candidate's mock history across exam years remains valuable, never-discarded signal — CBT Exam Mode's attempt records are append-only by the same platform-wide convention (Student Intelligence Model §2).

**Collaborative or classroom mock sessions.** Nothing in this specification's session-state or attempt-logging model assumes single-student use at the data layer — a future proctored classroom mock event (distinct from the individual Official TECHMED Mock Events already specified, §3.8) would be an additive scheduling and cohort-context layer around the same individual attempt engine.

The general principle, consistent with every other Kairo architecture document: each of these is a new *consumer* of CBT Exam Mode's existing structure, not a reason to change it.

---

## FINAL OUTPUT — WHY CBT EXAM MODE IS KAIRO'S PROOF OF READINESS

Every other module in Kairo exists to build something — mastery through Practice, understanding through Learn, durability through Review. CBT Exam Mode is the only module that exists to *test* what all of that building actually amounts to, under the one set of conditions that will eventually matter more than any other: a real clock, a real screen, and no help coming.

This is why the module's defining feature is not intelligence but its deliberate, temporary absence. For the length of a single timed attempt, Kairo says nothing — no hint, no encouragement, no correction, no adaptive rescue. That silence is not a gap in the product. It is the product, doing the single most honest thing it can do for a student who will, on a real exam day, be facing that same silence with far higher stakes and far less rehearsal. A student who has sat through a dozen mocks in Kairo, watched that same countdown, navigated that same grid, and confirmed that same submission screen, walks into a real CBT centre having already spent the unfamiliarity. Only the questions are new. Everything else is, by then, routine.

And then the silence ends, and everything Kairo has always been comes back at once — the score, honestly stated; the pacing pattern, specifically named; the flagged questions, respected as the student's own judgment; the gaps, routed exactly where they belong, to Review for what needs consolidating and to Learn for what needs repairing. TECHMED's own Built to Last campaign already names this exact rhythm as the shape of real preparation: *"Pressure does not only reveal preparation. It reveals what still needs to be built."* CBT Exam Mode is where that revealing actually happens — briefly silent, then immediately, fully useful again, exactly the way a real exam and a real coach, in their proper turns, are supposed to be.

**Think Smart. Perform Elite.**
