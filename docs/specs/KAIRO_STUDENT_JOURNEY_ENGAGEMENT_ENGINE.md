# KAIRO STUDENT JOURNEY & ENGAGEMENT ENGINE
## Product Specification

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Product Experience Blueprint, the Home Dashboard, the Practice Module, the Question Experience, the Learn Module, the Review Module, the CBT Exam Mode Module, and the Challenges Module. Does not redesign any of them. Every module built so far governs a single session, a single concept, or a single event. This document governs none of those — it governs the months.)*

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student, across the full arc of their UTME preparation:

**"Where is this student in their journey, and what does Kairo owe them right now, given how long they've been here and how that relationship has actually gone?"**

Not: what should today's session contain (that is the Daily Decision Engine's question, DDE §0). Not: is this concept fading (that is the Learning Engine's question, Learning Engine §0). **Is this student still on the path from first opening Kairo to walking into the exam hall — and if they've drifted from it, gotten stuck on it, or moved faster than expected along it, what does Kairo do about that at the scale of weeks and months, not minutes?**

If a design decision can't be traced back to that question, it doesn't belong in this document.

---

## 1. PRODUCT PURPOSE

### 1.1 What the Student Journey & Engagement Engine is

Every module specified so far operates inside a session or a moment: Practice inside a sitting, Learn inside a lesson, Review inside a pass, CBT Mode inside an attempt, Challenges inside an event. Macro-States (Learning Engine §3) and Learning States (Student Intelligence Model §5) already track trajectory — but they are read *by* the Daily Decision Engine to shape *today*. Nothing in the architecture so far is responsible for the shape of the whole journey itself: the arc from a student's first tap on Kairo to the morning of the exam, and, where relevant, beyond it.

The Student Journey & Engagement Engine (SJEE) is that missing layer. It does not decide what a session contains — the DDE already owns that (DDE §1.3) — and it does not decide what a student knows — the Learning Engine already owns that (Learning Engine §0). It decides **where a student sits on the calendar of their own preparation**, and it orchestrates everything that operates at that longer timescale: onboarding, activation, the long middle stretch of ordinary use, dormancy and win-back, milestone recognition across the whole product rather than one subject, and the handoff into and through the exam itself.

### 1.2 What the SJEE is explicitly not

It is not a second Macro-State system. Macro-States (Orienting, Building, Compounding, Wavering, At Risk, Recovering, Peak Readiness — Learning Engine §3) describe a student's *learning trajectory* and are computed from *academic* behavioural signal — accuracy, retention, session cadence within a rolling window. The SJEE's **Journey Stage** (Section 3) describes a student's *product lifecycle position* — how long they've been here, how deeply the relationship has taken root, and how close the calendar is to exam day. The two systems read each other constantly (Section 3.6 details this) but they are not the same axis, and collapsing them would corrupt both: a student can be academically Wavering while still deep into the Established Journey Stage, or academically Compounding while still in early Activation.

It is not the Motivation Engine restated. Streaks, Weekly/Monthly Reflection, and celebration logic already exist inside the Learning Engine (Learning Engine Phase 2 §7–9) and are scoped to *learning* motivation. The SJEE is scoped one level up — it is what decides, for example, that a student's Monthly Reflection this month should be framed against the fact that they're entering the final stretch before UTME, or that a win-back message should exist at all for a student who's been gone three weeks, which channel it should arrive on, and what it should — and must never — say.

It is not the Challenges Module restated. Challenges is a specific, event-based engagement mechanic (Challenges §1). The SJEE is the layer that decides *when in a student's journey* a Challenge suggestion is even appropriate to surface, alongside every other engagement lever available — it orchestrates across mechanics, it isn't one itself.

### 1.3 Why this layer has to exist separately

Without it, every module ends up quietly reinventing its own notion of "how long has this student been here" and "should we nudge them," and those private notions inevitably disagree — Practice's cold-start framing (Practice Module §3.4), Learn's empty state (Learn Module §4.5), CBT Mode's first-mock framing (CBT Exam Mode §10.1), and Challenges' streak-recovery nudging (Challenges §9.2) are all independently reasonable but were never required to agree with each other on the single underlying question of where this student actually stands. The SJEE exists so there is exactly one authoritative answer to that question, which every module then reads rather than re-derives — the same discipline the Student Intelligence Model already enforces for academic data (Student Intelligence Model §6, §8), applied here to journey and engagement data instead.

This also directly answers TECHMED's own stated strategic priority: *"Build a learning system that remembers the student"* is written at the level of a single session's memory in the Learning Engine, but the operating document's actual ambition — *"the student should not feel like a stranger every time they return"* (TECHMED Brand Overview §10.5) — is a claim about months, not minutes. The SJEE is the architectural home for that claim.

### 1.4 The one-sentence purpose statement

**The Student Journey & Engagement Engine exists to make sure Kairo always knows how far into the student's real, months-long journey it currently is — and to make sure every nudge, milestone, and moment of silence Kairo offers is calibrated to that, never to a generic notion of "engagement" borrowed from products that aren't walking someone toward a specific exam on a specific date.**

---

## 2. ENGAGEMENT PHILOSOPHY

### 2.1 Engagement is a symptom, not a target

The Learning Engine already refuses to optimise for time-in-app or question volume as ends in themselves (Learning Engine §4.3), and the Daily Decision Engine restates this as a standing principle (DDE §14, rule 5: "time-in-app is never an optimization target"). The SJEE inherits this without exception, at the longer timescale it operates on: a student who opens Kairo every day but never actually improves is not a success the SJEE should be engineered to produce. Every mechanic in this document is judged by whether it moves a student closer to genuine exam-day readiness, never by whether it moves a session-count or streak-length number.

### 2.2 A journey has a destination, not just a rhythm

Most consumer engagement systems are built to sustain indefinite, undirected usage — there is no "done." Kairo's journey is different in kind: it has a real, external, non-negotiable endpoint (UTME exam day), and the SJEE's entire design must be shaped by that fact. A win-back message, a milestone, a re-engagement nudge — all of these mean something different three weeks after a student registers than they do three weeks before their exam date. Generic engagement-engineering patterns borrowed wholesale from products with no fixed horizon will misfire here, sometimes badly (Section 9 details failure modes this produces if ignored).

### 2.3 Silence is sometimes the correct response

Directly inherited from Kai's hard tone constraints (Learning Engine Phase 2 §7.2, rule 3) and restated at journey scale: not every gap in a student's activity deserves a nudge, and not every nudge deserves to be a push notification. The SJEE's re-engagement logic (Section 6) starts from the presumption that a student's life outside Kairo is real and legitimate — a gap is data, not an emergency, until the student's own historical rhythm (Behaviour Profile, Student Intelligence Model §3) says otherwise. This mirrors the CBT Exam Mode's own governing discipline of authenticity over comfort (CBT Exam Mode §2.2) inverted: here the discipline is *restraint over presence* — Kairo earns the right to speak by having something genuinely useful to say, not by a fixed cadence.

### 2.4 Milestones are earned, never manufactured

The Wisdom Spark's rarity principle (Learning Engine Phase 2 §7.6) already governs micro-moments inside a session. The SJEE extends the identical discipline to the macro scale: a journey milestone (30 days in, halfway to exam date, first Reinforced concept in a new subject, first completed mock) is only ever surfaced when it is genuinely true and genuinely meaningful for *this* student's actual journey — never a templated "congratulations on day 7!" that would land identically for a student thriving and a student barely hanging on. A milestone that doesn't feel earned corrodes trust in every subsequent milestone, the same way empty praise is eventually discounted and stops working (Learning Engine Phase 2 §7.1).

### 2.5 The relationship compounds, or it doesn't exist

A student's second week with Kairo should feel meaningfully different from their first, and their tenth week should feel meaningfully different again — not through new features appearing, but through Kairo visibly knowing more. This is the direct journey-scale expression of the Student Intelligence Model's own founding claim: delete the model and Kairo becomes a stateless quiz app again (Student Intelligence Model §0). The SJEE is where that claim becomes felt over calendar time specifically — a student who has been present for four months should never receive a message, a framing, or a milestone indistinguishable from what a brand-new student would receive.

---

## 3. THE STUDENT LIFECYCLE MODEL

### 3.1 Why a separate axis from Macro-State is necessary

Macro-State (Learning Engine §3) answers "how is this student's learning trajectory behaving *right now*, within a rolling window." It resets its own read constantly and has no memory of "how long has this been going on" beyond that window. Journey Stage answers a structurally different question: "how deep is this student's relationship with Kairo, and how close is the exam." A student who registered eight months ago and has been quietly, steadily Building the entire time is a different student — deserving different framing, different milestone recognition, different notification cadence — from a student who registered eight days ago and is also, this week, Building. Macro-State cannot see that difference. Journey Stage exists specifically to see it.

### 3.2 The six Journey Stages

| Stage | Definition | Typical duration | Primary SJEE responsibility |
|---|---|---|---|
| **Arrival** | From account creation through the first completed session | Minutes to a few days | Get the student to one genuine, completed moment of value as fast as possible — this stage has exactly one goal (Section 4) |
| **Activation** | First completed session through the point a repeatable habit is first evident (Section 4.4's activation criteria) | First 1–3 weeks, highly variable | Prove the product's core value before the novelty of "a new app" wears off — the single highest-leverage, highest-risk stage in the entire model |
| **Establishment** | A repeatable habit is evident; the student is a genuine regular | Weeks to months — the bulk of most students' journeys | Sustain quality of engagement, not just frequency; this is where most Practice, Learn, Review, and Challenge activity actually lives |
| **Intensification** | Exam-proximity crosses the same compression threshold the Learning Engine already defines (Learning Engine §5.2) | Final 6–8 weeks before exam | Reweight everything toward readiness framing; this stage's boundary is date-driven, not behaviour-driven, and is authoritative over Establishment the moment it's crossed |
| **Culmination** | The final days immediately surrounding the exam itself | Days | Minimise noise, maximise calm, hand off almost entirely to CBT Exam Mode and Review's Exam Sprint path (Subject Knowledge Graph §9) |
| **Continuation** | After the exam date has passed | Open-ended | Determine, per student, whether the relationship continues (repeat candidate, Post-UTME, a completely new season) or formally closes out — Section 10 covers this fully |

### 3.3 Stages are not Macro-States and do not share transition logic

Journey Stage transitions are driven primarily by **calendar facts and cumulative product history** (account age, cumulative sessions, exam date proximity, whether an exam date has passed) rather than by the rolling-window behavioural signal that drives Macro-State transitions (Learning Engine §3.3). This is a deliberate architectural choice: a student should not fall out of Establishment and back into Activation-style framing just because they had one Wavering week — that would be exactly the false-reset the Learning Engine already rejects for streaks (Learning Engine Phase 2 §6.4, "the Performance Score must never be reducible by missing a day"). Journey Stage is sticky and directional, moving forward through the six stages (with a defined exception in 3.4); Macro-State is a live, resettable read.

### 3.4 The one legitimate backward transition

A student can move from Establishment or Intensification back into a lighter Activation-style posture only in one specific case: a genuine long-gap return (crossing the same At Risk threshold already defined at the Daily Decision Engine level, personal and not fixed, DDE §8, "Student returns after two weeks"). This does not reset Journey Stage itself — the student's account age and history are never discarded (mirroring the Learning Engine's own multi-year data-retention principle, Learning Engine §12) — but it does temporarily apply an Activation-equivalent *framing posture* on top of whatever Journey Stage the student's history actually places them in, until the Recovering Macro-State (Learning Engine §3.1) resolves back to Building. This is a framing overlay, not a stage regression — the distinction matters because it determines what a returning long-term student sees versus what a genuinely new student sees, even during the same "gentle reconnection" moment.

### 3.5 Stage boundaries are soft, never a hard gate

Consistent with the platform-wide rejection of rigid, punitive thresholds (Learning Engine Phase 2 §6.4, DDE §14 rule 9 — "a missed day is never treated as lost progress"), no Journey Stage transition is a hard cutoff a student can "fail" to cross. A student who takes six weeks to reach Establishment's activation criteria is not flagged as behind schedule — Section 4.4's criteria describe *what Establishment looks like when it arrives*, not a deadline by which it must arrive. The only stage boundary with genuine calendar rigidity is the Intensification threshold, because that one is anchored to an external, non-negotiable fact (the exam date itself, Learning Engine §5.2) rather than to the student's own pace.

### 3.6 How Journey Stage and Macro-State interact

Journey Stage sets the **outer framing envelope**; Macro-State sets the **moment-to-moment posture** inside it. A student in Establishment who is currently Wavering (Learning Engine §3.1) receives Wavering's usual tone calibration (Learning Engine Phase 2 §7.4) from Kai during sessions — the SJEE does not override that. What Journey Stage adds is context Macro-State alone cannot supply: it is what lets the SJEE recognise that *this particular* Wavering week is unusual for a student with four months of steady Establishment-stage history behind them (and therefore worth a slightly different kind of attention than the identical Wavering week would warrant from a brand-new Activation-stage student who has never yet proven a rhythm exists at all). This distinction feeds directly into Section 6's re-engagement calibration and Section 7's milestone logic.

### 3.7 Journey Stage is never surfaced to the student directly

Consistent with the Daily Decision Engine's standing rule that internal state labels are never shown verbatim (DDE §12.3) and the Question Intelligence Model's identical design note (Question Intelligence Model §2, "Design note"): a student never sees "Activation" or "Establishment" as a label anywhere in the product. Journey Stage exists purely to calibrate what Kai says, what gets recommended, and what milestone or re-engagement logic applies — exactly as Macro-State and Emotional Profile already operate invisibly behind Kai's voice (Student Intelligence Model §4).

---

## SECTION 4 — ONBOARDING & ACTIVATION

### 4.1 Purpose

Arrival and Activation (Section 3.2) are the two highest-mortality stages in the entire Journey Stage model — more students are lost here than in any subsequent stage, and unlike a Wavering Macro-State (which the Learning Engine can detect and respond to using rich behavioural history), a student who abandons during Arrival leaves almost no signal behind to diagnose. This section exists to compress the distance between "downloaded/opened Kairo" and "experienced something that felt like it understood me" as aggressively as the product honestly can, without ever compromising the honesty of that experience (Section 4.5).

### 4.2 Why onboarding cannot simply be Practice's cold-start handling restated

Practice's own cold-start edge case (Practice Module §3.4, Learning Engine §11) already handles a first Smart Practice session honestly — diagnostic, low-stakes, framed as "getting to know you." That remains correct and unchanged. But onboarding, as owned by the SJEE, is broader than that single session: it includes everything *before* a student reaches their first question at all — account creation, goal capture, expectation-setting — and it includes the orchestration of *which* module a brand-new student is even routed toward first, a decision no single module (Practice, Learn, CBT Mode) is positioned to make about itself, since each module can only ever see its own entry point, not the full set of options a Journey-Stage-aware system can see.

### 4.3 The Arrival sequence

```
Account creation
   ↓
Minimum-viable Identity capture (Student Intelligence Model §1 — only
what's genuinely required to route the first session, not the full profile)
   ↓
Expectation-setting moment (what Kairo is, what today's first
experience will feel like, framed honestly per 4.5)
   ↓
First Session Routing Decision (4.6)
   ↓
First completed session (any module — see 4.6)
   ↓
Arrival ends; Activation begins
```

### 4.4 Minimum-viable Identity capture

Consistent with the Daily Decision Engine's founding rejection of forcing a decision before value is delivered (DDE §1.2, §14 rule 2), Arrival captures only the Student Identity fields (Student Intelligence Model §1) that are genuinely load-bearing for the *first session* to be personalised at all — Exam type, target course (if known), and subject combination. Everything else in Section 1 of the Student Intelligence Model (preferred study duration, preferred study period, target university, target score) is deferred to Profile (Product Experience Blueprint §8) and captured opportunistically over the Activation stage, never demanded up front. A student who doesn't yet know their target course is never blocked — "not sure yet" is a first-class, fully supported answer, and the DDE's exam-proximity and content-scoping logic (DDE §2.1, §2.4) already degrades gracefully on incomplete Identity data exactly as it does on incomplete dependency data elsewhere (Subject Knowledge Graph §10.3).

### 4.5 Expectation-setting, honestly

The single screen (or short sequence) that precedes the first session must accomplish, without overstaying its welcome, what the Learning Engine's cold-start posture already promises implicitly: the student should understand that Kairo doesn't yet know them, and that the first session's job is discovery, not evaluation. This directly prevents a specific failure mode — a new student interpreting a deliberately broad, diagnostic first session as evidence Kairo is generic or unfocused, when in fact the breadth is the honest, correct behaviour for a system with zero data (Learning Engine §11). Naming this plainly up front — "Your first session helps me get to know you; it's not a test" — converts what could read as a weakness into a demonstration of the product's own honesty standard (TECHMED Brand Overview §10.6 applied at the very first moment of contact).

### 4.6 The First Session Routing Decision

This is the SJEE's own contribution, distinct from anything Practice's cold-start logic decides internally. Given the Identity fields captured in 4.4, the SJEE chooses **which module** a brand-new student's first session actually happens inside — not merely how Practice's own diagnostic pass behaves once entered:

| Signal available | First session routed to | Rationale |
|---|---|---|
| Standard case — Identity captured, no other signal | Practice's Smart Practice diagnostic pass (Practice Module §2.2, Learning Engine §11) | The default, most broadly appropriate first experience |
| Student arrived via a shared Challenge link (Challenges §5.3) and has just converted | Directly into a Learn or Practice flow addressing whatever the Challenge revealed, rather than a second, redundant diagnostic pass | The Challenge attempt itself already supplied real diagnostic signal (Challenges §9.3) — re-diagnosing from zero would waste it and feel repetitive |
| Student arrived specifically seeking exam-format familiarity (e.g., explicit intent signal during Identity capture) | A short, clearly-labelled Timed Practice Exam rather than untimed diagnostic Practice | Respects explicit stated intent over the platform's own default assumption (mirrors DDE §2.5's synthesis rule — no single input, including the default itself, overrides a clear signal) |
| Low-connectivity signal detected at Setup (mirroring CBT Exam Mode §4.7's device check, applied here at Arrival) | An offline-safe Practice diagnostic, never a media-heavy Learn lesson | Protects the first impression from being a loading spinner |

### 4.7 Activation criteria — what "activated" actually means

A student exits Activation and enters Establishment (Section 3.2) when their behaviour demonstrates a **repeatable rhythm**, not merely repeated presence. Consistent with the Elite/KAIRO Score's own rejection of raw volume as a proxy for anything meaningful (Student Intelligence Model §7.2), Activation is not defined as "N sessions completed" but as:

- At least one session completed on **two separate, non-consecutive calendar days** (a single long first sitting, however thorough, does not by itself demonstrate a returning habit)
- At least one instance of the student returning **without an external prompt** having caused it (i.e., not solely in response to a notification — Section 5.7 details how this is distinguished)
- Enough attempt history for the Learning Engine to have moved at least one concept out of Unseen into a genuine Forming or Held state (Learning Engine §2.2) — evidence the diagnostic pass actually produced a usable Knowledge Map, not just click data

A student who meets these criteria activates regardless of how many or how few days it took — per Section 3.5, there is no clock this is measured against. A student who has opened Kairo many times but never crosses this bar remains in Activation indefinitely, which is itself a meaningful, actionable signal (Section 4.9).

### 4.8 What Activation-stage framing changes, module by module

| Module | Activation-stage difference |
|---|---|
| **Home Dashboard** | Mission Card language stays closer to discovery framing longer than it would for an Establishment-stage student with an identical Macro-State (Home Dashboard §6, "New student" row extended across the whole stage, not just the very first session) |
| **Practice** | Personalised Suggestions carousel (Practice Module §3.2, item 6) stays suppressed longer — an Activation-stage student has too little history for these to be genuinely honest yet (Practice Module §3.4) |
| **Learn** | Recommended Concepts leans on whatever thin signal exists rather than waiting for a fuller Weak Concepts picture — small amounts of real diagnostic evidence are surfaced eagerly, since an Activation-stage student benefits more from seeing *any* personalisation land correctly than from waiting for statistically ideal confidence |
| **Insights** | KAIRO Score's badge, while always present (Home Dashboard §4.12), is accompanied by extra plain-language framing during Activation specifically ("this number will get more accurate the more you practice") — preventing an early, thin-data score from being over-interpreted by a student who doesn't yet have the history to contextualise it |
| **Challenges** | Never withheld, but never proactively pushed during Arrival itself (Section 4.3) — a Challenge is a legitimate Activation-stage engagement lever (it can itself be the "return without a prompt" evidence Section 4.7 looks for) but is not the *first* thing a brand-new student sees, consistent with Challenges' own stated relationship to the core journey as strengthening it, not replacing it (Challenges §9.4) |

### 4.9 Failure to activate

A student who remains in Activation well beyond what similar students' histories suggest is typical (a relative, cohort-informed signal, not a fixed day-count — mirroring the At Risk threshold's own personal-not-fixed design, Learning Engine §3.1) is not treated as a lost cause requiring aggressive win-back tactics. Instead, this state feeds Section 5's notification orchestration with a specific, narrow objective: surface the *single* highest-leverage remaining barrier (an incomplete Identity capture, a first session abandoned mid-way, a diagnostic pass that never produced a usable Knowledge Map) rather than a generic "come back" message — consistent with the platform-wide rule against guilt-based re-engagement (Learning Engine Phase 2 §7.2, rule 3) applied to the very first relationship-building attempt, where it matters most because there is no accumulated trust yet to draw on if the tone misfires.

---

## SECTION 5 — NOTIFICATION ORCHESTRATION

### 5.1 Purpose

Every module specified so far has, at some point, gestured at a notification: Challenges' discovery pushes (Challenges §4.2), CBT Mode's mock-readiness suggestions (CBT Exam Mode §3.2, §3.5), the Motivation Engine's streak-recovery framing (Learning Engine Phase 2 §9.2), Review's "due for review" signals. None of these modules can see each other's notification decisions. Without a single arbitrating layer, a student could plausibly receive a Challenge push, a streak nudge, and a Review reminder within the same hour — each individually well-reasoned, collectively overwhelming, and collectively a direct violation of "Reduce Decision Fatigue" (TECHMED Brand Overview §10.2) applied to the notification tray itself. The SJEE's Notification Orchestrator is that single arbitrating layer.

### 5.2 The governing constraint

**No module sends a notification directly.** Every module that wants to notify a student instead submits a **candidate notification** to the Orchestrator, carrying its own priority, content, and ideal timing window. The Orchestrator — and only the Orchestrator — decides what actually reaches the student, in what order, and how many per day. This is structurally identical to the relationship the Daily Decision Engine already has with every other module's recommendation logic (DDE §2.5, "No single input is ever allowed to make the decision alone. Every one of the above is a vote, not a verdict") — applied here to outbound communication instead of inbound session planning.

### 5.3 Candidate notification sources

| Source module | Example candidate | Typical priority tier (5.5) |
|---|---|---|
| Learning Engine / DDE | Urgent Decay reminder ("2 things are starting to fade") | Standard |
| Review | A large Fading backlog crossing a threshold Review Home would otherwise only show passively (Review Module §4.3) | Standard |
| Challenges | New live challenge, challenge ending soon (Challenges §4.2) | Low, opt-in-weighted |
| CBT Exam Mode | Readiness-triggered mock suggestion (CBT Exam Mode §3.5) | Low |
| Motivation Engine | Momentum Streak slack applied after a gap (Learning Engine Phase 2 §8.1) | Informational, not a nudge |
| SJEE itself | Activation-stage barrier nudge (Section 4.9), re-engagement message (Section 6), milestone recognition (Section 7) | Variable — see own sections |

### 5.4 What the Orchestrator checks before anything else

Before evaluating priority or timing, every candidate is checked against three hard gates, any one of which silently discards the candidate regardless of its source's own priority claim:

1. **Tone compliance** — the candidate's copy is checked against Kai's hard tone rules (Learning Engine Phase 2 §7.2) exactly as if Kai were speaking it directly, because from the student's perspective, a push notification *is* Kai speaking. No guilt language, no comparative framing, no "you're falling behind" phrasing survives this gate regardless of which module authored it.
2. **Journey Stage appropriateness** — a candidate appropriate for an Establishment-stage student (e.g., a Challenge streak-recovery nudge) may be entirely wrong for an Activation-stage student who has no streak history to recover (Section 4.8's suppression rules apply here identically).
3. **Frequency budget** — Section 5.6.

### 5.5 Priority tiers

| Tier | Examples | Governing rule |
|---|---|---|
| **Time-critical** | A live, time-boxed event the student explicitly opted into (a scheduled Official TECHMED Mock Event, CBT Exam Mode §3.8; a Challenge window closing that the student already joined) | Can override the frequency budget (5.6) because the student's own prior action created the time-sensitivity — this is not the Orchestrator manufacturing urgency, it's honouring a commitment the student already made |
| **Standard** | Urgent Decay, a Critical gap surfaced by the Subject Knowledge Graph (§8.2), a significant Review backlog | Subject to the frequency budget; competes with other Standard candidates for the day's allotted slot(s) |
| **Low, opt-in-weighted** | New Challenge live, a "Prepare" category mock suggestion | Only sent to students who have not shown a pattern of dismissing this candidate type (5.8); never sent to a student who has explicitly opted out of the relevant category |
| **Informational** | Momentum Streak slack confirmation, a milestone (Section 7) | Never competes for a "nudge" slot at all — these are always delivered, but through the lowest-friction channel available (in-app badge over push, where both are legitimate options), since their job is to inform, not to pull the student back in |

### 5.6 The frequency budget

Consistent with Challenges' own stated principle that "frequency is deliberately capped to avoid fatigue" (Challenges §4.2) — restated here as a platform-wide constraint the Orchestrator enforces on every module's behalf, not just Challenges' own: a student receives **at most one Standard-tier push notification per day**, and **at most one Low-tier notification across any 3-day window**, regardless of how many candidates are queued. Where multiple Standard-tier candidates compete for the single daily slot, the Orchestrator selects using the identical priority logic the Daily Decision Engine already applies to session planning (DDE §3.2) — Urgent Decay and Critical gaps outrank ordinary weak-concept or Review-backlog candidates, exactly as they would inside a session itself. This budget is personalisable downward by the student (Profile's notification settings, Product Experience Blueprint §8) but never upward by any module regardless of how urgent that module's own signal feels internally.

### 5.7 Distinguishing prompted from unprompted return

Directly feeding Section 4.7's Activation criteria and Section 6's re-engagement calibration: every session is tagged, at open, with whether it followed a notification within a short attribution window or occurred independently. This is not used to judge the student — it's used so the SJEE can tell the difference between a habit that's forming on its own (unprompted returns increasing over time) and a habit that only exists because of external prompting (sessions that stop entirely the moment notifications are throttled or ignored) — the second pattern is a signal that the *product experience itself*, not the notification cadence, needs attention, and no amount of additional nudging is the correct response to it.

### 5.8 Learning from dismissal, not just delivery

Where a specific candidate type (a particular Challenge category, a particular mock-suggestion framing) is consistently dismissed, ignored, or leads to no subsequent session, the Orchestrator lowers that candidate type's effective priority for that specific student going forward — this is a per-student, per-candidate-type signal, not a global tuning knob, and it never overrides an explicit Profile-level opt-out (5.6), which always takes precedence over any inferred preference. This mirrors the Behaviour Profile's own general posture (Student Intelligence Model §3) — inferred from behaviour, never asked directly, and never presented back to the student as a judgment ("you don't seem interested in challenges").

### 5.9 Channel selection

| Channel | Used for | Never used for |
|---|---|---|
| **Push notification** | Time-critical and Standard-tier candidates the student has not opted out of | Informational-tier content (5.5) — a milestone doesn't need to interrupt a student's day |
| **In-app badge / icon count** | Informational-tier content, Low-tier content for students who've shown ambivalence toward push for that category | Time-critical content, where the whole point is that the student sees it before the window closes |
| **Preferred study period** (Student Intelligence Model §1) | The default timing anchor for any candidate without its own hard deadline | Time-critical candidates, which respect their own actual deadline instead |

The student's declared or inferred Preferred Study Period is the default scheduling anchor for anything without an intrinsic deadline — consistent with the Behaviour Profile's stated purpose (Student Intelligence Model §3, "Preferred study time... Notification timing; not used to gate access"), restated here as the Orchestrator's binding default rather than a passive data field waiting to be read.

### 5.10 What the Orchestrator never does

It never sends a notification whose sole content is a raw internal metric (a KAIRO Score number, a decay percentage) — every candidate is translated into the same plain-language framing standard the Daily Decision Engine already enforces for in-session recommendations (DDE §12.2, "name the observation, name the reason, name the benefit"). It never stacks multiple candidates into a single combined notification to route around the frequency budget — if two things are both worth saying, one waits, per 5.6, rather than both arriving compressed into one message that dilutes each. It never re-sends a dismissed candidate of the identical type within the same short window on the theory that the student "just missed it" — a dismissal is respected as a dismissal, not treated as evidence the message needs repeating.

---

## SECTION 6 — RE-ENGAGEMENT & WIN-BACK

### 6.1 Purpose

The Daily Decision Engine already defines the *in-session* mechanics of a return after absence (DDE §8 — three days is a normal gap, two weeks triggers Recovering) and the Learning Engine already defines the *academic* recovery flow that follows (Learning Engine Phase 2 §10). Neither of those systems is responsible for the question this section owns: **should Kairo say anything to a student who hasn't opened the app at all, and if so, what, when, and through which channel.** That decision happens entirely outside a session — by definition, before one has resumed — which places it squarely in the SJEE's territory, not the DDE's or the Learning Engine's.

### 6.2 Why this cannot be a simple absence-triggered timer

A fixed "notify after N days of inactivity" rule fails the same way a fixed At Risk day-count would fail (Learning Engine §3.1 already rejects this for the identical reason) — a student who studies twice a week has a completely different meaning attached to a five-day gap than a student who has historically studied daily. Re-engagement timing is therefore always computed against the student's own Behaviour Profile rhythm (Student Intelligence Model §3, "Days most likely to miss study," "Recovery ability"), never a platform-wide default, restated here as binding rather than merely available.

### 6.3 The gap severity ladder

| Gap tier | Definition (relative to the student's own rhythm) | SJEE response |
|---|---|---|
| **Within rhythm** | The gap is shorter than or consistent with the student's own historical between-session interval | No SJEE action at all — this is not absence, it's normal cadence, and treating it as a trigger would manufacture urgency where none exists (violating Section 2.3) |
| **Notable gap** | Exceeds the student's typical interval but hasn't crossed their personal At Risk threshold (DDE §8) | At most one Low-tier, invitation-framed candidate submitted to the Orchestrator (Section 5) — never more than one, never escalating in tone if unanswered |
| **At Risk gap** | Crosses the student's personal At Risk threshold (Learning Engine §3.1) | A single, warmer Standard-tier candidate, explicitly non-guilt, coordinated with (never duplicating) whatever the Recovering Macro-State's own in-app framing will show the moment the student does return (Learning Engine Phase 2 §10.3) |
| **Extended absence** | Weeks to months beyond the At Risk threshold, with no response to prior Notable or At Risk candidates | Section 6.6's dedicated win-back sequence, distinct in cadence and content from ordinary re-engagement |
| **Dormant** | No response across an extended absence's full sequence | Section 6.7 |

### 6.4 The non-negotiable tone floor

Every candidate this section produces is checked against the identical language already banned platform-wide (Learning Engine Phase 2 §7.2, rule 3; restated at the Orchestrator level, Section 5.4): no "we miss you," no "your streak is at risk," no "don't lose your progress," no countdown-style framing implying decay is a countdown to failure. The correct register is invitation, not summons — "Ready when you are — I kept your place" is the standing template the Learning Engine already specifies (Learning Engine Phase 2 §10.3), and this section does not introduce a new one; it defines *when* that existing template fires, not what it says.

### 6.5 Content varies by what actually changed, never by absence length alone

A re-engagement candidate's *content* is drawn from something genuinely true and specific about the student's Knowledge Map or journey — never a generic "come back" with no substance behind it, consistent with the platform-wide rejection of empty, non-evidence-based messaging (Learning Engine Phase 2 §7.1, restated identically by Learn, Review, and CBT Exam Mode's own motivational sections). Legitimate content sources, in order of preference:

1. A specific concept the student was working on that is now genuinely due for review (drawing directly from the Fading queue, Learning Engine Phase 2 §5) — "that mole concept you were working on is ready to come back" is concrete and true.
2. A milestone the student is close to but hasn't reached (Section 7) — used sparingly, since manufacturing near-miss urgency risks violating 6.4's spirit even without violating its letter.
3. Where neither of the above is honestly available (a student with too little history, or nothing genuinely due), the candidate is simply not sent — an absence of honest content is a reason for silence, not a reason to fall back on a generic template.

### 6.6 The extended-absence win-back sequence

Distinct from ordinary re-engagement (6.3) because the calculus changes once a student has already not responded to a well-calibrated, honest invitation. Escalating pressure is explicitly not the answer — consistent with 2.3 and 6.4, a second and third message do not increase in urgency or frequency. Instead:

- The **channel** may broaden (from in-app/push only to including, where the student has provided it and opted in, a lighter-touch channel such as email) — but content and tone standards from 6.4–6.5 apply identically regardless of channel.
- The **cadence** widens, not narrows — a second attempt arrives further apart from the first than the first was from the onset of the gap, never sooner, since repeated unanswered contact at increasing frequency is itself a pattern that reads as pressure regardless of individual message tone.
- After a small, fixed number of unanswered attempts (never more than a handful across the entire extended-absence window), the sequence stops entirely and the student moves to Dormant (6.7) — this is a deliberate, designed endpoint, not a sequence that simply peters out inconsistently.

### 6.7 Dormant students

A student who has not responded to the full win-back sequence is not pursued further through active outreach. This is a considered product stance, not an oversight: continuing to message a student who has demonstrated, through sustained non-response, that active outreach isn't working would cross from invitation into exactly the kind of pressure Section 2.3 and 6.4 exist to prevent. Dormant students remain fully able to return unprompted at any time — their entire Knowledge Map, history, and journey data are preserved untouched (Student Intelligence Model §2's append-only principle applies without exception here), and the moment they do return, they are routed through the identical long-gap Recovering flow (Learning Engine Phase 2 §10.2) any returning student receives, with zero recap of the gap itself (DDE Principle 15). A Dormant student may still legitimately be reached through TECHMED's broader marketing and campaign channels (TECHMED 2027, Phase-based campaign architecture) — that is a distinct decision belonging to TECHMED's marketing layer, not to Kairo's own product-level Orchestrator, and the two must not be conflated.

### 6.8 What re-engagement never does

It never references a specific number of days absent in the copy itself ("it's been 12 days!") — the *decision* to send is time-aware; the *language* never is, since naming the gap explicitly is itself a mild form of the guilt framing 6.4 forbids. It never uses a returning-student's own past performance data as leverage ("you were doing so well before") — this frames the gap as a loss rather than a pause, which contradicts the Learning Engine's own explicit stance that a gap in engagement is not a gap in the student's worth or capability (Learning Engine Phase 2 §7.7). It never sends a win-back message during a period the student has explicitly indicated (via Profile settings or an explicit "pause" signal, where such a feature exists) that they intend to be away — an explicit pause is not an absence to be won back from, it's a boundary to be respected.

---

## SECTION 7 — CROSS-MODULE MILESTONES

### 7.1 Purpose

Individual modules already recognise their own local milestones honestly: a Reinforced transition inside Practice or Review (Learning Engine §2.2), a Macro-State upgrade, a Wisdom Spark moment (Learning Engine Phase 2 §7.6). What none of them can see is the **product-scale** picture those local moments add up to — a student's first month across every module combined, their first full mock completed, the point at which their Knowledge Map first covers every subject in their combination at even a baseline level. These are milestones that only exist at the level the SJEE operates on, because no single module has visibility into the others' histories.

### 7.2 The governing constraint, inherited and sharpened

The Wisdom Spark's rarity principle (Learning Engine Phase 2 §7.6) already establishes that overuse destroys meaning. At the journey scale, the risk is worse, not equal: because the SJEE has visibility across every module simultaneously, it is structurally capable of finding *some* milestone-shaped fact to celebrate almost every single day if it wanted to (a session count round number, a subject touched for the first time, a badge threshold). The SJEE must actively resist this capability. A cross-module milestone is only surfaced when it is genuinely rare *for this student specifically* — never merely numerically round, and never simply because the underlying data made it computable.

### 7.3 Milestone categories

| Category | Example | Frequency discipline |
|---|---|---|
| **Journey Stage transitions** | Entering Establishment (Section 3.2), crossing into Intensification | At most once per transition, ever, per student — these cannot recur by definition |
| **Cumulative learning milestones** | First concept reaching Reinforced in every subject of the active combination; Knowledge Map crossing a genuine full-breadth threshold for the first time | Rare by construction — most students will encounter only a handful across their entire journey |
| **Consistency milestones** | A genuinely sustained Momentum Streak (Learning Engine Phase 2 §8.1) reaching a meaningful length *for this student's own typical pattern*, not a fixed universal number | Personalised threshold, not a global one — a student whose typical rhythm is twice-weekly hits a meaningful consistency milestone at a very different raw count than a daily student |
| **Exam-readiness milestones** | First full mock completed (CBT Exam Mode §6), Exam Readiness (Student Intelligence Model §6) crossing into genuinely strong territory for the first time | Tied to real Student Intelligence Model metrics, never a proxy for them |
| **Journey-length milestones** | Meaningful anniversaries relative to the student's own registration date and exam countdown (e.g., the literal midpoint between registration and exam date) | Computed per-student from Section 1 Identity fields, never a calendar-wide date |

### 7.4 What disqualifies a candidate milestone

A fact is **not** surfaced as a milestone, regardless of how celebratory it could be framed, if:

- It would be the *only* thing distinguishing this moment from an ordinary session (i.e., it exists purely as a number reaching a round value with no underlying qualitative change — this directly extends the Wisdom Spark's own standing rule against firing on "routine correct answers," Learning Engine Phase 2 §7.6, to the macro scale)
- Celebrating it would implicitly draw an unflattering comparison to a recent rough patch (e.g., surfacing a consistency milestone the same week a student is visibly Wavering reads as tone-deaf regardless of the underlying fact's truth — Emotional Profile signal, Student Intelligence Model §4, gates milestone delivery exactly as it gates Kai's ordinary tone)
- It would require exposing a raw internal metric to be understood (per DDE §12.3 and Question Intelligence Model §2's design note, restated here without exception)

### 7.5 How a cross-module milestone is delivered

Never as a push notification competing for the frequency budget's single Standard-tier slot (Section 5.6) — milestones are Informational-tier by definition (Section 5.5) and are delivered through the lowest-friction, least-interruptive channel that still does the moment justice: most often surfaced *inside* the next natural session (a dedicated, brief moment on the Home Dashboard or Session Completion screen, Practice Module §6.2 item 8's Celebration block extended to carry a cross-module milestone specifically) rather than as an out-of-session interruption. A milestone earns the student's attention by being present when they arrive, not by pulling them in specifically to see it — pulling a student in specifically for a celebration would itself smuggle in exactly the engagement-for-its-own-sake motive Section 2.1 forbids.

### 7.6 Milestone framing

Follows the identical evidence-specificity standard already established for Kai's ordinary encouragement (Learning Engine Phase 2 §7.1, restated by Review §9.8 and CBT Exam Mode §9.9 as the platform-wide anti-generic-praise rule): "You've now reached Reinforced in every subject you're preparing with — that's the first time your whole combination has held up under review" is a legitimate milestone framing; "Amazing milestone! Keep it up!" is not, regardless of what triggered it. Where a milestone maps naturally onto the Monthly Reflection's own "Kairo Wrapped" shareable format (Learning Engine Phase 2 §8.3), the SJEE hands it off there rather than duplicating a separate shareable artifact — one honest shareable moment per natural occasion, never two competing ones.

### 7.7 Milestones never become obligations

A milestone is never framed in a way that implies the *next* one is expected on a schedule ("you're on track for your next milestone in 2 weeks!") — this would convert an earned, retrospective recognition into a forward-looking target, which reintroduces exactly the volume-optimisation instinct Section 2.1 exists to prevent. Milestones look backward at what genuinely happened; they never set expectations for what should happen next.

---

## SECTION 8 — JOURNEY-SCALE PERSONALISATION

### 8.1 Governing principle

Every other module's personalisation (Daily Decision Engine §10, Learn Module §8, Review Module §8, CBT Exam Mode §9) operates on the same substance-versus-framing split: *what* gets recommended is decided by the shared Intelligence Engine; *how* it's delivered flexes around who the student is. The SJEE's personalisation is one level more restrained than any of those, because its outputs (notifications, milestones, re-engagement, stage-based framing) sit further from the core learning loop and therefore carry proportionally *more* risk of feeling intrusive if miscalibrated, and *less* direct benefit if done well than getting a single Practice question right does. The SJEE personalises sparingly and only where Sections 4–7 have already established a genuine, specific hook to personalise around.

### 8.2 Journey Stage as the primary personalisation axis

Every dimension below is filtered first through Journey Stage (Section 3) before any other signal is applied — this mirrors the Daily Decision Engine's own Macro-State-first filtering rule (DDE §2.1) at the SJEE's own layer:

| Journey Stage | Notification tone | Milestone sensitivity | Re-engagement posture |
|---|---|---|---|
| Arrival / Activation | Minimal outbound contact at all (Section 4.8) — the product experience itself must prove value before any nudge is credible | Only the earliest, most foundational milestones (first Reinforced concept, first completed session on a second day) are meaningful yet | No formal re-engagement logic applies during Arrival itself — a student who never returns after Arrival is an activation failure (4.9), not a re-engagement case |
| Establishment | Full Section 5–6 logic applies at standard calibration | Full range of milestone categories becomes available as history accumulates | Standard gap-severity ladder (6.3) |
| Intensification | Frequency budget (5.6) skews toward exam-readiness content specifically; Low-tier candidates unrelated to readiness (e.g., non-exam-relevant Challenge types) are suppressed more readily | Milestones lean toward Exam-readiness category (7.3) over Consistency or Cumulative-learning categories, mirroring the Learning Engine's own exam-proximity override (Learning Engine §5.2) | A gap during Intensification is treated with more urgency in *internal* prioritisation (it competes harder for the Standard-tier slot) without ever changing the tone floor (6.4) — urgency is expressed through selection frequency, never through harsher language |
| Culmination | Notification volume drops to near-zero by design — a student days from the exam does not need journey-scale engagement mechanics competing for attention with final preparation | No new milestones introduced during this window — anything worth celebrating here belongs to CBT Exam Mode's own post-submission framing (CBT Exam Mode §9.5–9.7), not the SJEE | Suspended entirely — a gap of a day or two immediately pre-exam is not a re-engagement signal, it's plausibly deliberate rest, and treating it as absence would be actively harmful |
| Continuation | Governed by Section 10 | Governed by Section 10 | Governed by Section 10 |

### 8.3 Recovery Ability as a secondary personalisation input

A student's historical Recovery Ability signal (Student Intelligence Model §3, §6) — already used by Learn (Learn Module §8.7), Review (Review Module §8.7), and the Learning Engine's own reconnection-session design (Learning Engine Phase 2 §10.1) to calibrate how gentle a return needs to be — is read identically by the SJEE to calibrate re-engagement pacing (6.3's ladder) and Journey Stage's backward-transition framing (3.4). A student who has historically bounced back quickly from gaps receives a lighter-touch, less frequent re-engagement sequence than a student whose history suggests gaps tend to compound — not because the second student is treated as more fragile in any labelled sense (the Emotional Profile's hard boundary against exposing internal state, Student Intelligence Model §4, applies without exception here too), but because the *pacing* that has actually worked for this specific student in the past is the most honest available predictor of what will work again.

### 8.4 Exam timeline as a continuous personalisation input, not just a stage gate

Beyond triggering the Intensification stage transition itself (Section 3.2), the literal number of days remaining continuously informs milestone eligibility (7.3's Journey-length category), re-engagement urgency weighting (8.2's Intensification row), and notification content selection (6.5) throughout every stage — a Notable gap (6.3) forty weeks before exam and an identical Notable gap six weeks before exam are computed identically in terms of *whether* to notify, but may differ in *what* the notification's honest content draws from, since Section 6.5's content-source priority naturally shifts toward exam-readiness facts as the countdown compresses.

### 8.5 What journey-scale personalisation never does

It never uses Emotional Profile data (Student Intelligence Model §4) as the primary input for any SJEE decision — Emotional Profile gates and softens (7.4, 8.3) but never independently triggers an SJEE action the way a Fading concept or a gap-severity tier does; this preserves the hard boundary already established that Emotional Profile exists to calibrate delivery, never to drive it (Student Intelligence Model §4, "Hard boundary"). It never personalises the *existence* of the tone floor (6.4) or the frequency budget (5.6) — these are platform-wide constraints every student receives identically, regardless of Journey Stage or Recovery Ability, because they exist to protect the student from the product, not to be tuned away for students the system predicts can "handle" more.

---

## SECTION 9 — FAILURE MODES & EDGE CASES

### 9.1 A student who activates instantly, then goes quiet

A student can satisfy Section 4.7's Activation criteria within days and then produce a gap that would ordinarily read as Notable or At Risk (Section 6.3) almost immediately afterward. This is not treated as activation "reversing" — Journey Stage transitions are one-directional except for the single defined case (Section 3.4), so the student remains Established in the model. The gap is handled entirely through the ordinary gap-severity ladder (6.3), but with one caution: because so little Behaviour Profile history exists yet, the "student's own rhythm" baseline (6.2) is itself low-confidence. The Orchestrator should bias toward the more conservative (later, gentler) end of the gap-severity thresholds until enough post-Activation history accumulates to trust the rhythm baseline fully — treating thin data as thin, exactly as the Subject Knowledge Graph already insists missing dependency data be treated as "unknown," never as "no issue exists" (Subject Knowledge Graph §10.3).

### 9.2 A student who never leaves Activation

Where Section 4.9's relative, cohort-informed threshold for "unusually long Activation" is crossed with no clear single barrier identifiable (unlike the specific cases 4.9 already names — incomplete Identity capture, an abandoned first session), the SJEE does not manufacture a diagnosis it doesn't have evidence for. Consistent with the Daily Decision Engine's own failure-mode discipline (DDE §13, "The recommendation engine is uncertain... defaults to the safest, least disruptive option"), the correct response is the safest available candidate — a single, low-pressure invitation back into whatever module the student's thin history suggests they engaged with most positively — rather than an escalating sequence built on a guess about what's actually wrong.

### 9.3 A returning long-absence student who is also newly Established by tenure

Section 3.4's backward-transition framing overlay can produce a specific tension: a student who registered ten months ago, was Established, then vanished for three months, is — by tenure — a deeply experienced Kairo user, but their *current* behavioural state genuinely needs the same gentle reconnection posture as someone much newer. The resolution is that the *Recovering Macro-State's* framing (Learning Engine Phase 2 §10.2) governs the in-session experience unconditionally, while the SJEE's own milestone and personalisation layers (Sections 7–8) continue to draw on the student's *full* history rather than pretending it doesn't exist — a returning student can simultaneously be told "we're starting light today, on purpose" inside their reconnection session and, weeks later once resettled, have a milestone framed against their genuine ten-month relationship with the product. The two timescales are allowed to disagree without contradiction because they answer different questions (Section 3.1).

### 9.4 A student who changes their exam date or exam year mid-journey

Mirroring the Daily Decision Engine's own handling of a changed goal (DDE §13, "The student changes goals") and the Profile module's identical edge case (Product Experience Blueprint §8, "Edge cases"): a changed exam date recomputes the SJEE's Intensification threshold and every downstream exam-timeline personalisation input (Section 8.4) starting from the moment of the change, with no retroactive rewriting of milestones or re-engagement decisions already made under the prior date. A student who was recently nudged into Intensification-stage framing under an old date and then pushes their exam date back is smoothly returned to Establishment-stage framing — this is a legitimate Journey Stage transition in the "wrong" direction that Section 3.4 did not originally anticipate as a category, but follows the identical principle: the calendar fact changed, so the stage that's driven by the calendar fact changes with it, without penalty or friction.

### 9.5 Multiple simultaneous milestone candidates

Where more than one genuine, qualifying milestone (Section 7.3) becomes true in the same session or the same day, they are never bundled into a single combined celebration — this would dilute each one's specificity (7.6) the same way the Orchestrator refuses to combine notifications (5.10). Instead, the single most significant candidate (Journey Stage transitions outrank Cumulative-learning milestones, which outrank Consistency milestones, which outrank Journey-length milestones, in that order) is surfaced, and the remainder are queued for their own separate, later moments rather than discarded — consistent with the platform-wide principle that missing or delayed content is honestly deferred, never silently dropped (Learning Engine §11's "sparse-data" honesty standard, applied here to milestone delivery pacing).

### 9.6 A cohort-wide disruption affecting Journey Stage data integrity

Mirroring CBT Exam Mode's own handling of a platform-wide technical disruption during an Official Mock Event (CBT Exam Mode §10.7): where a technical outage affects session logging or notification delivery across many students simultaneously, the SJEE does not silently treat the resulting gap in activity as a genuine behavioural absence for gap-severity purposes (6.3) — this is flagged for TECHMED's operations review exactly as the equivalent CBT Mode scenario is, and affected students' gap calculations are corrected retroactively once the disruption is confirmed, rather than allowing a platform failure to be misread as a student's personal disengagement.

### 9.7 A student who explicitly asks Kairo to stop contacting them

Distinct from ordinary Profile-level notification tuning (Section 5.6): an explicit, direct request to stop all outbound contact is honoured immediately and completely, overriding every candidate source and every priority tier including Time-critical (5.5) — the one exception being genuinely account-critical, non-marketing communication (e.g., a security notice), which sits entirely outside the SJEE's engagement-orchestration scope to begin with and is not affected by this preference either way. This is the SJEE's own expression of the platform-wide principle that the student's stated preference is never overridden by an inferred one (Section 5.8's standing rule, restated here at its strongest form).

---

## SECTION 10 — CONTINUATION: THE POST-EXAM JOURNEY

### 10.1 The exam date is not the end of the data, even if it's the end of the countdown

Every prior module's data — the Knowledge Map, attempt history, Question Intelligence Model signal, the full Student Intelligence Model — persists exactly as the append-only principle already guarantees (Student Intelligence Model §2). What changes at Culmination's close is not what Kairo knows, but what Kairo is *for*, from the student's perspective, starting the moment the exam is behind them.

### 10.2 The immediate post-exam window

In the days immediately following the exam date, the SJEE suppresses nearly all of Sections 5–7's ordinary machinery — no re-engagement logic applies (there is nothing to be re-engaged with yet, since the entire premise of the countdown has just resolved), and no new milestones fire, mirroring Culmination's own near-silence (Section 8.2). The one legitimate outbound moment is a single, low-key acknowledgment that the exam has happened — never presuming the outcome, never asking for a result, since Kairo has no way to know how the exam actually went and guessing wrong in either direction (over-celebratory or presumptively sympathetic) would be a serious tone failure at an unusually sensitive moment.

### 10.3 Determining the Continuation path

Once the immediate post-exam window passes, the SJEE routes a student down one of several Continuation paths based on Identity signal (Student Intelligence Model §1) and explicit student input where available — never inferred silently for a decision this consequential:

| Path | Trigger | SJEE behaviour |
|---|---|---|
| **Result-pending quiet period** | Standard case — results not yet released | Minimal contact, mirroring 10.2's restraint, extended until results are plausibly available |
| **Repeat candidate** | Student indicates (via Profile, mirroring the exam-year change handling in Section 9.4) they intend to sit UTME again | The full Journey Stage model restarts at Establishment, not Arrival — the prior Knowledge Map is explicitly preserved and treated as valuable signal, exactly as the Learning Engine's own multi-year scalability principle already specifies (Learning Engine §12) — this is a "new season," never a new relationship |
| **Post-UTME / admission transition** | Student's declared path moves toward Post-UTME preparation or admission-strategy content | Handed off toward TECHMED's Admission Intelligence ecosystem and Post-UTME content scope, which sits outside Kairo's own architecture — the SJEE's role narrows to a clean, well-framed handoff rather than continuing to orchestrate Kairo-specific engagement for content Kairo doesn't own |
| **Departure** | No further signal, or explicit indication the student's journey with TECHMED has concluded (e.g., admission secured, no further exam planned) | Moves to a dormant-equivalent state (mirroring Section 6.7) with no active SJEE outreach — the relationship's data is preserved, not pursued |

### 10.4 Repeat candidates deserve a genuinely different Arrival

A returning repeat candidate should never experience Section 4's onboarding sequence as if for the first time — their Identity capture (4.4) is pre-filled from history, their expectation-setting moment (4.5) is honestly reframed around continuation rather than introduction ("welcome back for another season" rather than "welcome to Kairo"), and their First Session Routing Decision (4.6) can draw on real prior signal rather than defaulting to a cold-start diagnostic pass — though the Learning Engine's own decay-recalculation discipline (Learning Engine Phase 2 §10.2's "the engine re-checks decay estimates immediately") still applies in full, since months have genuinely passed and the Knowledge Map must honestly reflect that, even while the *relationship* itself is not treated as new.

### 10.5 What Continuation never does

It never treats an unknown post-exam outcome as an opportunity to solicit one purely for product purposes (e.g., "let us know how it went!" framed as a data-collection ask rather than a genuine, optional check-in) — if TECHMED's broader ecosystem wants outcome data for legitimate purposes (testimonials, cohort analysis), that request belongs to TECHMED's marketing and community layers, not to the SJEE's own engagement orchestration, mirroring the same boundary already drawn in Section 6.7 between Kairo's product-level Orchestrator and TECHMED's marketing channels.

---

## SECTION 11 — INTELLIGENCE ENGINE INTEGRATION

### 11.1 Purpose

Consistent with every module before it (Learn Module §7.1, Review Module §7.1, CBT Exam Mode §8.1), the SJEE does not run an independent inference layer. This section maps its reads and writes explicitly against the shared model already fully specified upstream.

### 11.2 What the SJEE reads

| Source | What's read | Used for |
|---|---|---|
| Student Intelligence Model §1 (Identity) | Registration date, exam type/year, target course | Journey Stage boundary computation (§3.2), Arrival routing (§4.6) |
| Student Intelligence Model §3 (Behaviour Profile) | Session cadence, Recovery Ability, preferred study period | Gap-severity ladder baselines (§6.2), notification channel/timing defaults (§5.9), re-engagement pacing (§8.3) |
| Student Intelligence Model §4 (Emotional Profile) | Inferred motivational/discouragement state | Milestone delivery gating only (§7.4) — never a primary trigger (§8.5) |
| Learning Engine §2–3 (Retention States, Macro-State) | Current Macro-State, Reinforced transitions, decay estimates | Milestone eligibility (§7.3), re-engagement content sourcing (§6.5), Journey Stage/Macro-State interplay (§3.6) |
| Student Intelligence Model §6 (Progress Metrics) | Exam Readiness, Learning Momentum | Exam-readiness milestone eligibility (§7.3), Intensification-stage content weighting (§8.2) |
| Subject Knowledge Graph §8 (Knowledge Gaps) | Gap severity classification | Re-engagement content sourcing where a Critical gap is the honest hook (§6.5) |

### 11.3 What the SJEE writes

The SJEE's own original contributions to the shared model are narrow and specific: **Journey Stage** itself (a new, SJEE-owned field, not duplicated elsewhere), **notification interaction history** (delivered, dismissed, acted-upon — feeding §5.8's per-candidate-type learning), and **prompted-vs-unprompted session attribution** (§5.7). Everything else the SJEE displays or acts on is a read against data computed elsewhere — it never independently computes Macro-State, retention_state, decay_estimate, or any Learning Engine or Subject Knowledge Graph field, mirroring the identical standing rule every prior module has committed to (Learn Module §7.8, Review Module §7.10, CBT Exam Mode §8.9).

### 11.4 Guarding against the two-numbers problem

Because Journey Stage and Macro-State can superficially look like they're answering the same question, the SJEE is bound by the same discipline the Student Intelligence Model warns about generally (Student Intelligence Model §6): the two are never displayed, referenced, or reasoned about as if interchangeable, and no other module is permitted to invent its own private notion of "how long has this student been here" — Journey Stage is the single authoritative answer, and every module that previously handled its own cold-start or dormancy framing independently (Practice Module §3.4, Learn Module §4.5, CBT Exam Mode §10.1, Challenges §9.2) is understood, from this document forward, to be reading the SJEE's Journey Stage output rather than maintaining a silent, parallel guess of its own.

---

## SECTION 12 — FUTURE SCALABILITY

The Student Journey & Engagement Engine is deliberately structured so the following attach without requiring this specification to be redesigned:

**Cohort-aware Journey Stage calibration.** Section 4.9's "cohort-informed" activation threshold is currently a coarse relative signal; a future refinement could calibrate Journey Stage boundaries against genuinely comparable student cohorts (same exam year, same registration season) rather than the platform-wide population, without changing the six-stage model itself.

**Parent-facing journey summaries.** The dormant Parent/guardian field (Student Intelligence Model §1) and its already-anticipated Parent Dashboard extension point (Student Intelligence Model §9, Profile §8) could surface a filtered, non-invasive Journey Stage and milestone summary — reading exactly the Informational-tier content Section 7 already produces, never raw Emotional Profile or gap-severity detail, consistent with the hard boundary already established for that extension point.

**Multi-channel Orchestrator expansion.** Section 5.9's channel table is deliberately structured so a future channel (e.g., SMS for low-connectivity contexts, per TECHMED's offline-first commitment) attaches as a new row consuming the identical priority-tier and frequency-budget logic, not a parallel notification system.

**AI-generated re-engagement content.** Section 6.5's content-sourcing priority is currently rules-driven; a more generative layer could identify subtler honest hooks than the current rule set captures, attaching underneath the same tone-floor and content-specificity constraints (6.4–6.5) without changing them.

**Team/cohort journey features.** Should TECHMED's community layer (Forward Collective, TECHMED Brand Overview §4.5) ever want cohort-wide journey framing (e.g., "your registration cohort"), this attaches as a new milestone category (§7.3) and Discovery-adjacent signal, mirroring Challenges' own cohort-based leaderboard groundwork (Learning Engine Phase 2 §8.4) rather than requiring new architecture.

**Extension to Post-UTME and other exam bodies.** Exactly as every other Kairo document anticipates (Learning Engine §12, Subject Knowledge Graph §12, Question Intelligence Model §12), the SJEE's six-stage model and Intensification threshold logic are exam-date-driven, not UTME-specific — a new exam body is a new Identity field value (Student Intelligence Model §1) feeding the same stage-boundary computation, not a new journey model.

The general principle, consistent with every other Kairo architecture document: each of these is a new *consumer* of the SJEE's existing structure, not a reason to change it.

---

## FINAL OUTPUT — WHY THE STUDENT JOURNEY & ENGAGEMENT ENGINE IS KAIRO'S MEMORY OF TIME ITSELF

Every module built before this one understands a moment: a question answered, a concept learned, a session completed, an exam attempted. The Student Intelligence Model remembers who a student is. The Daily Decision Engine decides what today should be. None of that, on its own, can answer a question every real student's relationship with Kairo actually depends on: *has this been worth it so far, and does Kairo know that it has?*

That is what this document exists to protect. A student's first week deserves patience a returning tenth-month veteran doesn't need. A three-day gap deserves silence for one student and a single honest invitation for another — not because one student matters more, but because the two gaps mean genuinely different things, and pretending otherwise would be exactly the kind of generic, undifferentiated engagement TECHMED's own operating philosophy explicitly rejects. A milestone means something only because most days don't produce one. A win-back message earns its place only by having something true and specific to say, and earns its silence, eventually, by respecting when a student has stopped answering.

None of this is possible without a single, authoritative layer that knows where a student actually stands on the calendar of their own preparation — not their knowledge, which the Learning Engine already owns, and not their day, which the Daily Decision Engine already owns, but their *journey*: the shape of the whole thing, from the first uncertain tap on a new app to the morning a real exam either confirms or complicates everything that came before it, and — for many students — the season that follows. TECHMED's founding belief is that a student should not be forced to figure out their own path alone. The Student Journey & Engagement Engine is where that belief is kept true not for a single session, but for the entire distance.

**Think Smart. Perform Elite.**
