KAIRO LEARN MODULE
## Product Specification — Where Mistakes Become Mastery

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Product Experience Blueprint, the Home Dashboard, the Practice Module, and the Question Experience. Does not redesign any of them. Those documents define what Kairo knows, decides, and how a student answers a question. This document defines what happens in the moment right after — when a student needs to actually understand something, not just be told the right answer.)*

---

## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student, per concept:

**"What, specifically, prevented this student from answering correctly — and what is the shortest honest path from that specific gap back to genuine understanding?"**

Not: what does the syllabus say about this topic. Not: how much content can we show. Not: how do we make this feel comprehensive. **What is actually missing, and how do we fix only that, quickly enough that the student wants to go straight back to practising?**

If a design decision can't be traced back to that question, it doesn't belong in Learn.

---

## SECTION 1 — PRODUCT PURPOSE

### 1.1 What Learn is

Learn is Kairo's understanding-repair layer. It is the module a student reaches when a question has just revealed a gap, and the honest next step is not "try again" but "understand this first." Where every other module in Kairo is built around *doing* — answering, practising, competing, simulating — Learn is the one module built around *understanding*, and it exists in the smallest possible footprint that understanding actually requires.

Learn is not where Kairo teaches a syllabus. It is where Kairo explains a mistake.

### 1.2 What Learn is explicitly not

TECHMED already has tutorials, Booster Systems, live classes, and Tutor TechMed's own teaching content (About Tutor TechMed, "Academic & Teaching Impact") for genuine first-pass instruction. Kairo's Learn Module does not compete with or duplicate that. A student who has never encountered a concept at all is a teaching problem TECHMED solves elsewhere — Learn exists for the narrower, sharper moment of a student who has *already* been taught something and is now finding out, through their own attempt, exactly where that teaching didn't fully land.

This distinction matters architecturally, not just philosophically. It means Learn's lessons are short by design, not short because of a content-production shortcut. A digital textbook can afford to be comprehensive because a student chose to open it looking for depth. Learn cannot afford that, because a student arrives here mid-momentum, having just been interrupted by a wrong answer — the module's entire value proposition depends on returning that momentum quickly, not consuming it.

### 1.3 How Learn differs from Practice

Practice is the *loop* — attempt, feedback, adapt, continue (Practice Module §1.1–1.2). Learn is what a student steps into when that loop needs a deliberate pause. Practice's Question Player already surfaces a collapsed or auto-expanded explanation inline (Question Experience §6) precisely so a student doesn't have to leave the loop for a short fix. Learn is where that same explanation, or the concept underneath it, gets room to breathe when a short inline fix isn't enough — a `conceptual_gap` on a Forming concept, a repeated miss, or a student who deliberately wants to go deeper (Question Experience §6.3, §6.2 point 8). Practice never stops being the primary loop; Learn is a deliberate detour from it, always designed to return the student to it.

### 1.4 How Learn differs from Review

Review is about **timing** — it exists to resurface concepts that are Fading, forgotten, or due for spaced revisit, independent of whether the student currently understands them (Subject Knowledge Graph §9, Product Experience Blueprint §6). Learn is about **comprehension** — it exists to fix a gap in understanding, independent of when that gap will next need revisiting. A concept can be perfectly understood and still need Review (it's simply due to fade). A concept can be freshly attempted and still need Learn (it was never understood in the first place). The two modules read from and write to the same Concept Node data, but they answer different questions: Review asks "when should this come back," Learn asks "why did this break."

### 1.5 How Learn differs from CBT Exam Mode

CBT Exam Mode deliberately withholds explanations until after submission, to preserve exam authenticity (Product Experience Blueprint §3, Question Experience §10). Learn is where those withheld explanations actually get engaged with, once the exam-condition attempt is over — a student finishing a mock with several misses moves naturally from the Performance Report into Learn for the concepts that need repair, not back into a re-simulated exam.

### 1.6 How Learn differs from Challenges

Challenges are fast, shareable, competitive, and often anonymous — built for virality and low-friction entry, not depth (Product Experience Blueprint §4). A Challenge participant who gets something wrong is not, in that moment, a candidate for a deep concept lesson — the format itself would be broken by the detour. Learn is reachable *after* a Challenge, once a student has converted into a full account and is looking at their results with intent to actually improve, never mid-Challenge.

### 1.7 The one-sentence purpose statement

**Learn exists to turn the shortest possible honest explanation of one specific mistake into lasting understanding — never to become a place a student browses, and never to replace the teaching TECHMED already provides elsewhere.**

---

## SECTION 2 — LEARNING PHILOSOPHY

### 2.1 Learning begins with a question

Every lesson in Learn has an origin: a specific question the student answered, or a specific concept flagged by the Intelligence Engine as weak, Fading, or gap-adjacent (Subject Knowledge Graph §8, Student Intelligence Model §2). There is no lesson in Learn that exists independent of a real moment of contact between the student and their own knowledge. This is the literal product-level expression of the Question Intelligence Model's founding claim that a question is a sensor, not an inert object (Question Intelligence Model §1) — Learn is where the signal that sensor captured gets converted into something the student can actually use.

Practically, this means Learn never opens with "choose a topic to study." It opens with "here's what just happened, and here's what it means" (Section 4, Section 5). A student who wants to explore a concept they're merely curious about, with no diagnostic trigger behind it, can still reach Learn (Section 3.6 — Home Dashboard, Section 3.7 — Insights, future search per Section 3.8) — but even then, the framing stays diagnostic in spirit: "here's what you currently know about this," not "here's a chapter."

### 2.2 Mistakes are opportunities, not verdicts

This principle is already load-bearing throughout the Learning Engine — a wrong answer is a diagnostic event, not a scoring event (Question Intelligence Model §4.1), and Kai never treats a low score as evidence of low intelligence or worth (Learning Engine Phase 2 §7.7). Learn is where this principle becomes most visible to the student, because it is the module explicitly built *from* mistakes. Every lesson's opening frame should communicate, implicitly through tone and explicitly through Kai's language, that arriving here is a sign the system is working correctly — the mistake did its job by revealing something, and now that something gets fixed. A student should never feel that reaching Learn is a punishment lap.

### 2.3 Short, focused learning beats long reading

A lesson in Learn is built to be read in the time a student would otherwise spend deciding whether to skip the explanation entirely. This is a hard design constraint, not an aspiration — every structural choice in Section 6 exists to protect it. Long-form explanation has real value, but it belongs to TECHMED's tutorials and Booster Systems (Section 1.2), not to a module a student reaches mid-practice-session with attention already partially spent on the question that triggered it. The Question Intelligence Model's own explanation structure already established this discipline at the inline level (Question Intelligence Model §9.2, "not ten paragraphs") — Learn extends the same discipline to a full lesson, not just a quick explanation.

### 2.4 Every lesson ends with reinforcement

Understanding that is never tested again is not yet trusted by Kairo's own knowledge model (Learning Engine §2.1 — binary mastery lies to the system). A lesson that ends on explanation alone, with no attempt to apply it, produces exactly the kind of unearned green checkmark the Retention State system was built to prevent (Learning Engine §2.4). Every Learn lesson therefore closes with a small, low-stakes attempt at the concept just explained (Section 5, Section 6) — not to re-test rigorously, but to give the Intelligence Engine one honest, fresh data point before the student leaves, and to give the student the far more motivating feeling of "I just got that right" rather than "I just read that."

### 2.5 Students should return to Practice feeling more confident

Learn's success is not measured by how thorough a lesson feels — it's measured by whether the student's next Practice session goes better than it would have without the detour. This is the same standard the Elite/KAIRO Score applies to itself (Student Intelligence Model §7.4 — "it survives a bad week") applied to a single learning module: Learn is not there to make the student feel like they've completed an assignment. It's there to make the student feel ready to try again. Every lesson's closing screen (Section 6, "Completion") is designed around this exact emotional handoff back into Practice, not around a sense of having "finished a topic."

### 2.6 How these principles shape every interaction

Together, these five principles produce a specific, recognizable interaction pattern across all of Learn:

- A lesson never opens cold — it always references the real moment that triggered it (2.1).
- A lesson never opens with judgment — the tone is diagnostic and forward-looking, never corrective in a shaming sense (2.2).
- A lesson is never allowed to sprawl — every screen justifies its own existence against the cost of the student's patience (2.3).
- A lesson never ends on explanation alone — there is always one more small thing to do before leaving (2.4).
- A lesson is judged by its exit velocity back into Practice, not by its own perceived completeness (2.5).

This is the same underlying discipline the Question Experience applies to a single screen (Question Experience §2.8 — "does this help the student think more clearly, or does it just look like Kairo is doing something intelligent?") extended across an entire module. Nothing in Learn exists to demonstrate that Kairo has a lot to teach. Everything in Learn exists to close one specific gap and get out of the way.

---

## SECTION 3 — STUDENT ENTRY POINTS

### 3.1 Design principle governing all entry points

Every entry point into Learn carries **context** with it — which question, which concept, which error pattern, which trigger. There is no entry point that drops a student into Learn without Kairo already knowing why they're there. This mirrors the Practice Module's own entry-point discipline (Practice Module §2.1) — the destination screen is never a blank slate the student has to orient themselves within; it always already knows what brought them here.

### 3.2 After answering a question incorrectly

The primary, highest-frequency entry point. Triggered directly from the Question Experience's feedback and explanation flow (Question Experience §6, "Link to Learn") when a student wants to go beyond the inline explanation into the fuller Concept Summary and lesson structure (Section 5, Section 6). This entry point carries the richest possible context: the specific question, the specific wrong option selected, the `error_pattern_tag` already classified (Question Intelligence Model §4.1), and the exact concept(s) attached. A lesson entered this way never has to guess what the student needs — it already knows.

### 3.3 From the Practice summary

Practice's Session Completion screen explicitly routes "Weaknesses" and "Recommended next actions" into Learn deep-dives for specific concepts flagged during that session (Practice Module §6.2, points 3–5). This entry point differs from 3.2 in scope — rather than one question's specific miss, it carries a session's worth of pattern (e.g., two separate `conceptual_gap` misses on the same concept), which lets the lesson open with slightly more confidence about what actually needs fixing, since the signal is corroborated across multiple attempts rather than a single data point.

### 3.4 From Review

Review's categorized queues (Mistakes, Bookmarks, Fading Concepts, Weak Topics — Product Experience Blueprint §6) each link into Learn for any item where the honest next step is understanding rather than just re-attempting. This is the natural pairing the two modules were designed for (Section 1.4): Review identifies *what's due*, and for anything where "due" and "not understood" overlap, Review hands off to Learn rather than sending the student straight back into a revision attempt that would likely fail again for the same underlying reason.

### 3.5 From weak-topic recommendations

The Daily Decision Engine's Today's Mission can itself recommend a Learn detour before Core Practice, specifically when a Critical or Repeated gap (Subject Knowledge Graph §8.2) has been diagnosed and the DDE's own logic (DDE §8, "Student fails repeatedly") has already determined that another practice attempt at the same level would not produce a different outcome. This entry point is proactive rather than reactive — the student hasn't necessarily just gotten something wrong in this exact session; the system has recognized, from accumulated pattern, that a concept needs direct attention before more practice on it will be productive.

### 3.6 From the Home Dashboard

The Home Dashboard does not feature Learn as a primary surface (its signature element is the Mission Card, pointing toward Practice — Home Dashboard §5), but a student can reach Learn from the Dashboard in two ways: tapping into a Recent Achievement to see the fuller concept story behind a Reinforced transition, or — for a returning student with a specific known weak spot — a small, secondary link surfaced only when a weak concept is significant enough to be worth a direct nudge outside of a mission. This entry point is deliberately minor in visual weight, consistent with the Dashboard's own restraint principle (Home Dashboard §2) — Learn is never positioned as competing with the Mission Card for the student's first five seconds.

### 3.7 From Insights

Insights' Subject/Topic Mastery screen and Weekly/Monthly Reflections (Product Experience Blueprint §7) surface concept-level detail a student may want to act on immediately — "Chemistry: needs attention" or a named weak concept in a Weekly Reflection links directly into the relevant Learn lesson. This entry point is analytical in origin (a student actively looking at their own data) rather than reactive (a student who just got something wrong), so the lesson framing here can lean slightly more into "let's strengthen this" than "let's fix what just happened" — the emotional context is self-directed improvement rather than immediate recovery.

### 3.8 Through search (future)

Not part of the initial build, but the architecture should anticipate a future state where a student can search for a concept by name directly, bypassing any diagnostic trigger entirely. Per Section 2.1's framing discipline, even a search-originated lesson should open by grounding itself in what Kairo already knows about the student's standing on that concept ("here's where you currently stand on this") rather than presenting a generic, studentagnostic article — search is a new *entry point*, not an exception to the governing philosophy.

### 3.9 From bookmarked concepts

A student who bookmarked a question or concept mid-Practice (Practice Module §5.7, Question Experience §3.12) can reach a Learn lesson for that concept directly from their saved set, reachable via Review's Bookmarks category (Product Experience Blueprint §6) or Practice's "Practise bookmarked" entry point (Practice Module §2.7). This entry point carries a self-identified-importance signal distinct from the engine's own weak-concept detection (Question Experience §9.1) — the student flagged this themselves, so the lesson can acknowledge that intent directly ("you bookmarked this — let's make sure it's solid") rather than framing it purely as a diagnosed gap.

### 3.10 Entry point summary table

| Entry Point | Context carried | Emotional framing |
|---|---|---|
| After incorrect answer | Specific question, wrong option, error_pattern_tag, concept | Immediate recovery — "let's fix what just happened" |
| Practice summary | Session-level pattern across multiple attempts | Corroborated gap — "this came up more than once" |
| Review | Concept flagged as due *and* not understood | Combined timing + comprehension repair |
| Weak-topic recommendation | Critical/Repeated gap, proactively diagnosed | Preventative — "let's fix this before it blocks more" |
| Home Dashboard | Achievement story or a significant known weak spot | Minor, secondary — never competing with the Mission Card |
| Insights | Self-directed analytical interest | Self-improvement — "let's strengthen this" |
| Search (future) | Student-initiated, no diagnostic trigger | Grounded in current standing, not generic content |
| Bookmarked concepts | Self-flagged importance | Acknowledged intent — "you marked this as worth revisiting" |

# KAIRO LEARN MODULE
## Product Specification — Part 2

---

## SECTION 4 — LEARN HOME

### 4.1 Purpose

Learn Home is the landing screen when a student navigates to Learn directly (via Home Dashboard, Insights, or the persistent nav — Product Experience Blueprint §5) rather than arriving pre-routed into a specific lesson from an entry point in Section 3. Its job is narrower than Practice Home's (Practice Module §3): it does not need to make "start" effortless in the same way, because Learn is never the default first action of a session (Section 2.5 — Learn is a detour, not a destination in its own right). Instead, Learn Home's job is to feel like a calm, organized return point for a student who wants to see the state of their own understanding and act on it deliberately.

### 4.2 Governing design constraint

Learn Home must never feel like a course catalog. Every section on this page is a *query over the student's own diagnostic history* (weak concepts, recent mistakes, bookmarks, mastery), never a browsable list of "everything Kairo could teach you." This is the direct extension of Section 2.1's principle — even the landing page stays diagnostic in character, not encyclopedic.

### 4.3 Layout, top to bottom

1. **Kai's framing line** (not a generic header)
   A short, specific line from Kai summarizing the current state of the student's understanding in one sentence — e.g., referencing a genuine recent pattern ("You've been working through a couple of Chemistry gaps this week — here's where things stand"). Never a static "Welcome to Learn."

2. **Continue Learning** (conditional)
   If a lesson was left incomplete (Section 10.1), this is the single highest-priority card — positioned above Recommended Concepts, mirroring Practice Home's own "Continue previous session" precedence rule (Practice Module §2.5, §3.2). Resuming an interrupted lesson always outranks starting a new one.

3. **Recommended Concepts**
   The direct student-facing render of whatever the Intelligence Engine currently considers highest-priority for understanding-repair — pulled from Critical/Repeated gaps (Subject Knowledge Graph §8.2), recent `conceptual_gap` tags, and Fading concepts with low confidence_score (Hidden gaps, Subject Knowledge Graph §8.2). Presented as 2–4 concept cards, each with a one-line reason ("This came up twice this week"), never a bare topic name.

4. **Weak Topics**
   A slightly broader, Topic-level view (Subject Knowledge Graph §2.2) for a student who wants to see the shape of their standing across a subject rather than one concept at a time — this is the Learn-side counterpart to Insights' Subject Health strip (Home Dashboard §4.11), but framed actionably ("3 concepts here could use attention") rather than analytically.

5. **Recently Learned Concepts**
   A short list of lessons completed in the last few days, each showing whether the follow-up reinforcement (Section 2.4) landed successfully — this gives the student a visible sense of forward motion, distinct from Insights' fuller Achievements history (Home Dashboard §4.8), and deliberately brief here.

6. **Mastered Concepts** (collapsed by default)
   A quiet, positive counterbalance — concepts that have moved to Held/Reinforced through Learn-driven repair. Kept collapsed or minimized by default so it doesn't compete visually with the actionable sections above it, but present because seeing genuine mastery accumulate is part of what makes returning to Learn feel worthwhile rather than only ever confronting weakness.

7. **Trending Topics** (optional, low priority)
   Only where genuinely useful — e.g., concepts many students in the same exam-proximity window are currently working through. This section must never become comparative or leaderboard-like in tone (consistent with Kai's hard rule against comparative framing, Learning Engine Phase 2 §7.2) — it is informational context, not a ranking, and is the first section suppressed on a small screen or for a student who hasn't opted into any community layer (Motivation Engine §8.4).

8. **Suggested Next Lessons**
   A small, closing carousel — the Learn-side equivalent of Practice Home's Personalised Suggestions (Practice Module §3.2, point 6) — surfacing 2–3 lower-priority but still relevant concepts the Recommendation Engine didn't select as top priority. Optional, quiet, never pushy.

### 4.4 What Learn Home deliberately does not contain

No subject/topic browsing grid as a primary navigation method (that would reintroduce the textbook-browsing failure mode Section 1.2 and 2.1 explicitly reject). No raw scores or percentages. No promotional or administrative content. No open-ended "explore" affordance presented as a first-class action — exploration is always secondary to the diagnostic sections above it.

### 4.5 Empty / cold-start state

A brand-new student with little or no attempt history sees Recommended Concepts and Weak Topics replaced with a short, honest note from Kai ("Once you've done a bit of practice, I'll know exactly what to help you understand here") — never a zeroed-out or templated-looking set of cards. Recently Learned and Mastered Concepts are simply absent rather than shown empty, consistent with the Home Dashboard's own empty-state discipline (Home Dashboard §7).

---

## SECTION 5 — CONCEPT LEARNING FLOW

### 5.1 Purpose

This section specifies the *journey* a student moves through inside a single lesson — the sequence of moments, not yet the literal screen contents (Section 6 handles structure). The flow exists to answer, at each step, "does the student now know enough to move to the next step, or would moving on leave a gap?"

### 5.2 The flow

```
Question
   ↓
Explanation
   ↓
Core Concept
   ↓
Simple Breakdown
   ↓
Common Misconceptions
   ↓
How JAMB Typically Tests This
   ↓
Memory Aid (when useful)
   ↓
Mini Reinforcement Activity
   ↓
Related Questions
   ↓
Return to Practice
```

### 5.3 Question

The lesson opens by re-anchoring the student to the exact moment that brought them here — the specific question, their specific answer, shown plainly (Section 2.1). This is not new content; it is the same question already seen in the Question Experience, restated here as the lesson's starting point so the student never has to wonder "wait, what was this about again." For entry points without a specific question (Section 3.6, 3.7, 3.8, 3.9), this step is replaced by a short, honest framing of *why* this concept was selected (a weak-topic signal, a bookmark, a search) — the principle (ground the lesson in something real and specific to this student) holds even when the trigger isn't a single question.

### 5.4 Explanation

The same explanation structure already defined at the inline level (Question Experience §6.2) is restated here, but this is the point where a lesson can afford to let it breathe slightly more than the collapsed inline version would — since the student has now deliberately chosen to go deeper (or was routed here because the inline version wasn't sufficient, Question Experience §6.3). This step answers "why was my answer wrong, specifically" before the lesson moves to the broader concept underneath it.

### 5.5 Core Concept

The lesson lifts from the specific question to the general idea it was testing — pulling directly from the Subject Knowledge Graph's Core Concept object (Subject Knowledge Graph §3.1: Name, Description, Learning Objective). This is the first point in the lesson where the framing shifts from "this question" to "this idea," and it must do so without losing the thread back to why the student is here — the concept is introduced as "the thing this question was really testing," not as a free-standing topic header.

### 5.6 Simple Breakdown

A short, plain-language decomposition of the Core Concept — for composite concepts, this may draw on the Micro Concept layer (Subject Knowledge Graph §2.2) to show the specific sub-step that likely broke, rather than re-explaining the whole concept from scratch. This step is where the lesson does its actual teaching work, and per Section 2.3, it must stay tightly scoped: one idea, explained clearly, not a survey of everything adjacent to it.

### 5.7 Common Misconceptions

Drawn directly from the concept's Typical Misconceptions rollup (Subject Knowledge Graph §3.1) and the specific Misconception Library entry tied to the wrong answer the student selected, where applicable (Question Intelligence Model §4.1). This step exists to name the *specific* confusion, not a generic list of ways to get the topic wrong — consistent with the platform-wide rule that a misconception explanation names the exact reasoning error, never a generic "this is incorrect" (Question Intelligence Model §9.2).

### 5.8 How JAMB Typically Tests This

A short, transferable framing of how this concept tends to appear in real UTME questions — tied to the Skills Assessed field (Question Intelligence Model §2.4) and, where relevant, the concept's Frequently Revised Together and Cross-Subject Connection relationships (Subject Knowledge Graph §4, §7). This step is what makes the lesson feel exam-relevant rather than academic for its own sake — it directly answers "why does this matter for the exam I'm actually preparing for," which ties back into the Built to Last campaign's core promise (Campaign Theme, "Built for Performance").

### 5.9 Memory Aid (when useful)

Not every concept benefits from a mnemonic or memory hook — this step is explicitly conditional, drawing from the Question Intelligence Model's Memory Anchor field (Question Intelligence Model §9.2) only where one genuinely exists and adds value. A forced or gimmicky memory aid attached to a concept that doesn't need one would violate Section 2.3's discipline more than it would help — this step is omitted cleanly, never padded, when it isn't warranted.

### 5.10 Mini Reinforcement Activity

The lesson's application of Section 2.4's principle — a short, low-stakes attempt (typically one to three questions) at the concept just explained, pulled from the Question Intelligence Model's relationship graph (Reinforcement, Alternative Representation — Question Intelligence Model §6.2), never the identical question the lesson opened with. This is not scored with the same weight as a full Practice attempt (Section 7.3), but it is a real attempt, tagged and logged like any other, giving the Intelligence Engine one fresh, honest data point.

### 5.11 Related Questions

A short, optional carousel of further questions the student *may* attempt if they want more — pulled from Extension and Reinforcement relationships (Question Intelligence Model §6.2), presented as available but never mandatory. This is where a motivated student can go deeper without the lesson itself forcing that depth on every student.

### 5.12 Return to Practice

The lesson's explicit close, engineered around Section 2.5's standard — a short, specific handoff line from Kai (not a generic "lesson complete") and a single, clear action returning the student to wherever they came from: back into the interrupted Practice session (Practice Module §8.1) if that's where they arrived from, or into a fresh Recommended-by-Kairo mission (Practice Module §2.2) if they arrived via Learn Home. The lesson never strands the student wondering what to do next.

### 5.13 Flow flexibility

Not every entry point or every concept requires all nine steps in full. A `careless_slip`-triggered lesson (rare, since careless slips are usually handled inline without a full Learn detour — Question Intelligence Model §9.3) might compress directly from Question to a brief Explanation and straight to Reinforcement, skipping Core Concept and Simple Breakdown entirely, since the underlying understanding was already sound. A `conceptual_gap` on a genuinely new-feeling Forming concept gets the full sequence. The flow is a maximum shape, not a mandatory checklist — mirroring the Subject Knowledge Graph's own stated principle that its hierarchy is "a maximum structure, not a mandatory one" (Subject Knowledge Graph §2.4).

---

## SECTION 6 — LESSON STRUCTURE

### 6.1 Purpose

Where Section 5 defines the *journey*, this section defines the *screen-level unit* — what a lesson actually looks like as a piece of content, ready for the curriculum and content team to author against, and for Kai to render consistently every time.

### 6.2 The structure

1. **Learning Objective**
   One plain-language sentence, drawn directly from the Core Concept's Learning Objective field (Subject Knowledge Graph §3.1) — states what the student will be able to do after this lesson, not what topic it covers. ("You'll be able to correctly identify oxidation states in a redox equation," not "This lesson is about redox reactions.")

2. **Concept Summary**
   A short paragraph — genuinely short, two to four sentences — giving the Core Concept's Description (Subject Knowledge Graph §3.1) in plain language, explicitly noting what the concept does and does not cover where that boundary is commonly confused.

3. **Key Idea**
   The single most important sentence in the entire lesson, visually distinguished (e.g., a Tip-style callout per the Kairo Visual Identity's callout system, Kairo Visual Identity Part 3) — if a student remembers exactly one thing from this lesson, this is it.

4. **Visual Example** (where applicable)
   A diagram, worked example, or illustration rendered per the Question Experience's media standards (Question Experience §7) — conditional, omitted cleanly when the concept doesn't benefit from one, never forced to satisfy a template.

5. **Common Mistakes**
   The Section 5.7 misconceptions, rendered as a short, named list — each entry stating the specific error, not a vague warning.

6. **Exam Insight**
   The Section 5.8 JAMB-testing pattern, framed as a transferable strategy line.

7. **Reinforcement Questions**
   The Section 5.10 mini-activity, embedded directly in the lesson body using the same Question Experience component used everywhere else in Kairo (Question Experience §1.1 — shared rendering surface) — a student should never feel like they've left the lesson to answer these; feedback is immediate, per Learn's own mode flag (Section 7.5).

8. **Mastery Check**
   A brief, honest signal — not a percentage, not a pass/fail gate — reflecting whether the reinforcement attempt suggests the gap has closed ("That's looking solid" / "Let's come back to this one soon") framed per the same legibility principle the KAIRO Score uses (Student Intelligence Model §7.3). This never blocks the student from finishing the lesson regardless of outcome — mirroring the Recommendation Engine's own refusal to gate on volume or performance (Learning Engine §4.3).

9. **Completion**
   The Section 5.12 handoff — Kai's specific closing line and the single return action.

### 6.3 Mobile optimization

Every component in Section 6.2 follows the same typography, spacing, and touch-target standards already established platform-wide (Kairo Visual Identity Part 2–3, restated in Question Experience §2.4, §2.7 as universal). A lesson must be fully readable and completable on a 320px-width screen without horizontal scroll, and the total lesson — excluding the optional Related Questions carousel (Section 5.11) — should be scannable in well under the time it would take to abandon it out of impatience. This is a design constraint that directly serves Section 2.3, not a generic mobile-accessibility checkbox.

### 6.4 Content authoring implication

Because Sections 5 and 6 are both maximum shapes rather than mandatory templates, a lesson that is fully populated end-to-end and a lesson that skips Visual Example and Memory Aid are both "complete" — the content team's QA standard (mirroring the Question Intelligence Model's own QA gate, Question Intelligence Model §11) is that every *applicable* component is present and accurate, not that every possible component is filled in regardless of fit.

# KAIRO LEARN MODULE
## Product Specification — Part 3

---

## SECTION 7 — INTELLIGENCE ENGINE INTEGRATION

### 7.1 Purpose

Learn does not run a separate intelligence layer of its own. Every read it performs and every write it produces flows through the exact systems already specified upstream — the Learning Engine, the Student Intelligence Model, the Question Intelligence Model, and the Subject Knowledge Graph. This section maps each of those interactions explicitly, so Learn's place in the overall architecture stays as a *consumer and contributor* to one continuously-updating model (Student Intelligence Model §8), never a parallel dataset that could drift out of sync.

### 7.2 Weak-topic prioritisation

Learn Home's Recommended Concepts (Section 4.3, item 3) and the proactive weak-topic entry point (Section 3.5) both read directly from the Academic Profile's Weak Concepts field and the Subject Knowledge Graph's gap-severity classification (Student Intelligence Model §2, Subject Knowledge Graph §8.2). Critical and Repeated gaps are weighted above ordinary Forming concepts, exactly as they are in the Daily Decision Engine's own priority hierarchy (DDE §3.2) — Learn does not invent a separate ranking logic; it renders the same ranking the DDE already computes, filtered to what's actionable through a lesson specifically.

### 7.3 Mastery updates

The Mini Reinforcement Activity (Section 5.10, 6.2 item 7) generates real attempts that flow through the identical question-level update loop every other attempt in Kairo uses (Learning Engine §4.2 — Concept Node update, outcome classification, `error_pattern_tag` if wrong). These attempts are not treated as a lesser or synthetic signal — they update `retention_state`, `confidence_score`, and `decay_estimate` exactly as a Practice attempt would. The one distinction: because these attempts occur immediately after direct instruction, the Learning Engine's own gaming-detection logic (Learning Engine §11, "abnormal patterns") is applied slightly more conservatively here — a correct reinforcement answer moves a concept from Forming toward Held, but does not, on its own, promote a concept all the way to Reinforced, since Reinforced specifically requires successful recall *after* time has passed and forgetting has had a chance to occur (Learning Engine §2.2) — a freshly-taught correct answer cannot yet demonstrate that.

### 7.4 Confidence improvement

Because `confidence_score` is inferred behaviourally, not self-reported (Learning Engine §1.3), a Learn lesson does not directly set confidence — it creates the conditions (varied question framing via Alternative Representation relationships, Section 5.10 and 5.11) under which confidence can be honestly demonstrated. A student who completes a lesson and then performs well on Related Questions (Section 5.11) — if attempted — contributes a stronger confidence signal than the Mastery Check alone, since it represents transfer beyond the immediate reinforcement item. This mirrors the Subject Knowledge Graph's own asymmetry principle (Subject Knowledge Graph §6.3): a single lesson completion is not allowed to inflate confidence broadly; only demonstrated, varied-framing success earns that.

### 7.5 Recommendation adjustments

A completed lesson feeds directly back into the Daily Decision Engine's input set for the *next* Practice session (DDE §2.2) — specifically, the concept just addressed either exits or de-prioritizes from the Critical/Recoverable gap queue (Subject Knowledge Graph §8.3), freeing that session slot for the next-highest priority. Where the Mastery Check (Section 6.2, item 8) suggests the gap is not yet closed, the concept is *not* artificially cleared — it remains flagged, and the DDE's Repeated-gap escalation logic (DDE §8, "Student fails repeatedly") governs what happens if the pattern continues, exactly as it would without Learn's involvement. Learn can close a gap; it cannot manufacture the appearance of one being closed.

### 7.6 Kairo Score influence

Reinforcement-activity attempts (Section 5.10) contribute to the Accuracy and Retention components of the KAIRO Score using the same weighting logic as any other attempt (Student Intelligence Model §7.3) — there is no separate "Learn score." Consistent with 7.3's caution around premature Reinforced-state promotion, a burst of correct answers immediately following instruction does not produce an outsized Retention boost, since Retention specifically rewards *surviving* forgetting (Student Intelligence Model §7.2) — a lesson well-completed is a legitimate but modest contributor to the Score, not a shortcut to inflating it.

### 7.7 Revision scheduling

Once a lesson closes, the concept's `decay_estimate` and `next_review_estimate` (Learning Engine §5.2) are recalculated using the same personalized decay model as everywhere else — a concept that has just been freshly taught starts its revision clock from that moment, typically with a shorter initial interval than a concept the student has held for a long time (Learning Engine §5.2, "concept difficulty weight" and "personal decay rate"). This is what ensures a Learn-repaired concept actually re-enters the Review and Memory Scheduling systems (Subject Knowledge Graph §9) rather than falling out of the loop the moment the lesson ends — Learn fixes the gap, but the Learning Engine, not Learn itself, is still responsible for making sure it stays fixed.

### 7.8 What Learn never computes independently

Consistent with 7.1, Learn never independently decides Macro-State, Learning State, gap severity, or exam-proximity weighting — it reads all of these from the Student Intelligence Model and Subject Knowledge Graph exactly as authored elsewhere, and only ever writes new attempt data back into the same shared model. This is the direct architectural safeguard against the "two numbers on the same screen quietly contradicting each other" failure mode the Student Intelligence Model explicitly warns against (Student Intelligence Model §6).

---

## SECTION 8 — PERSONALISATION

### 8.1 Governing principle

Two students hitting the same concept do not necessarily need the same lesson. Personalisation in Learn operates the same way it does throughout Kairo — the *substance* of what's being taught is anchored to the Subject Knowledge Graph's stable concept content (Subject Knowledge Graph §3.1), but the *framing, depth, and entry emphasis* flex around who the specific student is (Daily Decision Engine §10's own personalisation dimensions apply directly here).

### 8.2 Previous mistakes

If a student's specific wrong answer maps to a known misconception (Question Intelligence Model §4.1), the lesson opens Section 5.7 (Common Misconceptions) by naming that exact one first, before any others — the student's own error becomes the lesson's entry point into the broader misconception library, rather than a generic list presented in arbitrary order.

### 8.3 Number of failed attempts

A first miss on a concept produces a standard-depth lesson following the full flow (Section 5.13). A second or third miss on the same concept — the Repeated gap case (Subject Knowledge Graph §8.2) — triggers the DDE's own instruction to use "an explicitly different framing than what's already been tried" (Learning Engine §11, "plateau" case) — the lesson's Simple Breakdown (Section 6.2, item 2) is generated or selected to differ meaningfully from the explanation the student already saw and which evidently didn't land, rather than repeating it verbatim a second time.

### 8.4 Subject

Lesson tone calibrates lightly by subject convention where genuinely useful (e.g., a Mathematics-adjacent Chemistry calculation lesson may lean more heavily on worked-example visual structure; an English comprehension lesson may lean more on annotated-text breakdown) — this is a content-authoring guideline, not a structural difference in the flow itself, since Section 5's flow is explicitly subject-agnostic by design (mirroring the Subject Knowledge Graph's own subject-agnostic architecture, Subject Knowledge Graph §12).

### 8.5 Topic mastery

A student with otherwise strong mastery in the surrounding topic (e.g., strong across Chemical Bonding generally, but shaky on one specific sub-topic) gets a lesson that explicitly acknowledges that surrounding strength ("You've got the rest of this topic solid — this is just one piece") rather than a lesson that treats the concept as isolated. This uses the Subject Knowledge Graph's Major Theme/Topic rollups (Subject Knowledge Graph §2.2) to give Kai's framing genuine context, consistent with Kai's specificity principle (Learning Engine Phase 2 §7.1).

### 8.6 Time remaining before UTME

As exam proximity compresses (Learning Engine §5.2's proximity override), Learn lessons shift emphasis toward Section 5.8 (How JAMB Typically Tests This) and compress Section 5.6 (Simple Breakdown) where the concept is already partially understood — mirroring the Subject Knowledge Graph's own Exam Sprint Learning State (Student Intelligence Model §5), which prioritizes readiness framing over long-term conceptual scaffolding in the final stretch. Lessons never skip understanding entirely under time pressure, but they do prioritize exam-relevant framing more heavily as the countdown shrinks.

### 8.7 Student consistency

A student with fragile consistency (low Study Consistency metric, Student Intelligence Model §6) receives a shorter, more tightly-scoped lesson by default — trimming toward the minimum viable flow (Section 5.13) to maximize the chance of actual completion, mirroring the Daily Decision Engine's own consistency-based session-shaping rule (DDE §3.3, "Consistency vs. mastery"). A student with strong, established consistency can be offered the fuller flow including optional Related Questions (Section 5.11) by default, since completion risk is lower.

### 8.8 Previous lesson completion

A student who has a pattern of abandoning lessons partway (Section 10.1) is not shown progressively longer lessons — the system instead biases toward shorter, more frequent, single-concept lessons rather than attempting to compensate with more thorough single sessions. This is the Learn-specific application of the Behaviour Profile's Recovery Ability and completion-rate signals (Student Intelligence Model §3) already used to shape Practice session length.

### 8.9 The personalisation boundary

Per Section 7.8 and the Emotional Profile's own hard boundary (Student Intelligence Model §4), personalisation in Learn never extends to labeling a student ("you struggle with Chemistry") or exposing any internal state or diagnosis. Every personalisation dimension above shapes *delivery* — what gets emphasized, how long the lesson runs, which framing leads — never the student's own visible sense of who they are as a learner.

---

## SECTION 9 — MOTIVATION STRATEGY

### 9.1 Governing principle

A module built entirely from a student's own mistakes carries real emotional risk if handled carelessly — arriving in Learn too often, or experiencing it as repetitive correction, could easily start to feel like punishment rather than support. Section 2.2 already establishes the philosophical stance (mistakes are opportunities); this section defines the concrete interaction patterns that keep that stance genuinely felt rather than merely stated.

### 9.2 Acknowledging improvement

Where a student's Mastery Check (Section 6.2, item 8) or a subsequent Practice attempt shows a previously-repaired concept holding up, Kai should say so specifically and later — not inside the lesson itself (where it would be premature, per 7.3's caution against over-crediting a freshly-taught answer), but the *next* time that concept resurfaces successfully, whether in Practice, Review, or a Weekly Reflection (Learning Engine Phase 2 §8.2). "That concept from Tuesday's lesson — it held up today" is a stronger, more honest acknowledgment than anything the lesson's own closing screen could offer, because it's evidence gathered after time has actually passed.

### 9.3 Celebrating understanding

Reserved for genuine moments — a concept that was a Repeated gap (Subject Knowledge Graph §8.2, the hardest category) finally clearing, or a concept surfacing as a true Reinforced transition after Learn-driven repair. This uses the same Wisdom Spark rarity principle already established platform-wide (Learning Engine Phase 2 §7.6) — Learn does not invent its own celebration mechanic; it earns access to the existing one only when the underlying event is genuinely significant.

### 9.4 Encouraging another attempt

When a Mastery Check suggests the gap isn't yet closed, the lesson's Completion step (Section 5.12, 6.2 item 9) frames this without alarm — "This one might need a little more time. Let's come back to it soon" — never framing an unresolved gap as a failure of the lesson or the student. This directly extends Kai's hard tone constraint against bare judgment language (Learning Engine Phase 2 §7.2, rule 1) into Learn's specific context of a lesson that didn't fully land.

### 9.5 Reducing anxiety after repeated mistakes

For a Repeated gap (Section 8.3), the lesson's opening (Section 5.3/5.4) explicitly normalizes the repetition rather than drawing attention to it as a pattern of failure — "Let's look at this from a different angle" carries the same information as "you've gotten this wrong multiple times" without the second framing's implicit judgment. This mirrors the Recovering Macro-State's own explicit permission-giving language ("We're starting light today, on purpose" — Learning Engine Phase 2 §7.4) applied to the specific anxiety of repeated conceptual failure rather than absence.

### 9.6 What Learn's motivational language avoids

No generic motivational quotes, no exclamation-mark-heavy enthusiasm, no comparison to other students, no guilt-based framing referencing how long a gap has persisted. Every piece of encouraging language in Learn must be traceable to something specific and true about this student's actual attempt history — consistent with the platform-wide principle that empty praise is eventually discounted and stops working (Learning Engine Phase 2 §7.1). A lesson that says "Great job!" after a correct reinforcement answer has failed Learn's own standard; a lesson that says "You got that redox step right this time — that was the exact part that tripped you up before" has met it.

### 9.7 The motivational throughline

Every interaction pattern in this section exists to protect one outcome: a student should be able to return to Learn repeatedly, even for the same recurring difficulty, without that repetition itself becoming a source of shame. Learn's entire value proposition — mistakes are opportunities, not verdicts (Section 2.2) — is only real if the module's actual tone holds up under the hardest case, which is a student who keeps needing it for the same thing. That is the case Section 9 is designed around, not the easy case of a single, quickly-resolved gap.
# KAIRO LEARN MODULE
## Product Specification — Part 4

---

## SECTION 10 — EDGE CASES

### 10.1 Students abandoning lessons

Lesson state is preserved exactly as it stood the moment a student leaves — current step within the flow (Section 5.2), any reinforcement attempts already made — mirroring the platform-wide session-preservation rule already established for Practice (Practice Module §8.1) and the Question Experience (Question Experience §11.4). On return, Learn Home's Continue Learning card (Section 4.3, item 2) offers to resume from the exact step, never to restart the lesson from the Question step. A lesson abandoned before the Mini Reinforcement Activity (Section 5.10) is not treated as a failed attempt — it simply remains an open, resumable lesson, since no scored attempt occurred.

If a student abandons the same lesson multiple times without completing it, this is logged as a signal distinct from a `guessed` or `careless_slip` tag — it suggests either the lesson's length or framing isn't working for this student (feeding back into Section 8.8's shorter-lesson bias) or that the entry point itself was mistimed (e.g., triggered mid-Practice-session when the student's real intent was to keep momentum, not detour). Repeated abandonment on the *same concept specifically* should bias the next attempt toward the compressed flow (Section 5.13) rather than repeating the same full-length lesson a third time.

### 10.2 Repeating the same concept

Handled directly by Section 8.3's failed-attempts personalisation and Section 9.5's anxiety-reduction framing — but structurally, the system must also guard against presenting an identical lesson twice. Where a concept resurfaces for a second or third lesson, at minimum the Simple Breakdown (Section 6.2, item 2) and ideally the Visual Example (item 4) should differ from what the student already saw, drawing on Alternative Representation content for the same concept (Subject Knowledge Graph §4) rather than the Question Intelligence Model simply re-serving the same authored explanation. A concept lesson that looks and reads identically to one already attempted and already insufficient is a content gap, not an acceptable fallback.

### 10.3 Concepts already mastered

If a student reaches a Learn entry point (most commonly Section 3.6 or 3.7, self-directed) for a concept that is already Held or Reinforced with high confidence_score, the lesson should not pretend otherwise. Rather than running the full remediation flow, Learn Home and the lesson opening should reflect this honestly — "You've already got a solid handle on this one" — and offer a lighter-weight option: jump straight to Related Questions (Section 5.11) for a confidence check, or exit back to Practice, rather than forcing a student through Core Concept and Simple Breakdown for something they don't need explained again. This mirrors the Subject Knowledge Graph's asymmetry principle (§6.3) in reverse — genuine mastery should be respected quickly, not re-litigated.

### 10.4 Concepts with limited supporting material

Per the Subject Knowledge Graph's own acknowledgment that content coverage will start uneven, especially early in TECHMED's phased build (Subject Knowledge Graph §10.1, Question Intelligence Model §11's "sparse-data subject" edge case), a concept may not yet have a fully authored Visual Example, Memory Aid, or a deep Related Questions pool. Per Section 6.4, these components are simply omitted rather than padded — but critically, the lesson must never look broken or incomplete as a result. Where content genuinely doesn't yet exist for a required component (e.g., no Common Misconceptions have been authored yet for a newly-added concept), the lesson should say so honestly ("This one's still being built out — here's what we do have") rather than silently rendering an empty section, consistent with the platform-wide principle of surfacing "more coming soon" honestly instead of recycling or faking depth (Learning Engine §11).

### 10.5 Offline access (future)

Not part of the initial build, but per TECHMED's offline-first principle (TECHMED Brand Overview §4.2, applied throughout Practice — Practice Module §8.2), Learn's architecture should anticipate that lesson content (being largely static text/media, unlike live-adapting Practice queues) is a strong candidate for pre-caching. A lesson already loaded should degrade gracefully on connectivity loss exactly as the Question Experience already specifies (Question Experience §11.1) — cached content remains readable, and only the final write-back of the reinforcement attempt needs to sync on reconnect.

### 10.6 Very long concepts

Some concepts are genuinely more complex than others (e.g., a multi-step organic mechanism vs. a single vocabulary definition). Rather than allowing a single lesson to sprawl in violation of Section 2.3, a concept whose Simple Breakdown would require excessive length should be authored using the Micro Concept decomposition already defined in the Subject Knowledge Graph (Subject Knowledge Graph §2.2) — presented as a short sequence of tightly-scoped mini-lessons across the composite concept's parts, rather than one long lesson. Each mini-lesson still follows the full structure of Section 6 at reduced scope, and the Mini Reinforcement Activity checks the specific sub-step just covered, not the whole composite concept at once. This keeps every individual screen within Learn's own length discipline even when the underlying concept genuinely has more to it.

---

## SECTION 11 — FUTURE SCALABILITY

The Learn Module is deliberately structured so the following attach without requiring this specification to be redesigned:

**AI-generated explanations.** Section 6's lesson structure is already content-component-driven (Learning Objective, Concept Summary, Key Idea, etc.) rather than prose-driven — this mirrors the Question Intelligence Model's own explanation architecture (QIM §9.3, §12), which is explicitly designed to accept a more generative content layer underneath the same structural components without changing how Learn renders them. A future AI-generated Simple Breakdown or misconception explanation would populate the identical fields a human-authored one does today.

**Voice narration.** Every component in Section 6.2 is text-content-driven and medium-agnostic, consistent with the Question Experience's own explanation model (Question Experience §12). A voice mode would consume the same underlying lesson content and Kai's existing tone rules, requiring a new playback affordance rather than new pedagogical content.

**Interactive diagrams.** The Visual Example component (Section 6.2, item 4) already uses the same tap-to-expand media pattern established platform-wide (Question Experience §7, §12) — an interactive version would expand into the same allotted space with added interaction layered on top, not a new lesson region.

**Video supplements.** Slots in alongside or in place of the Visual Example component using the same medium-agnostic principle already established for voice narration — the lesson's structural shape doesn't change; only the rendering of one component does.

**Tutor-created learning paths.** TECHMED's existing tutorial and Booster System content (Section 1.2) could eventually link *into* a Learn lesson as a deeper-dive option — e.g., a "Want a full class on this?" link surfaced only for a student who has already been through the short Learn lesson and wants more than Learn's own scope permits. This preserves the boundary in Section 1.2 (Learn is not a textbook) while giving TECHMED's broader teaching content a natural, non-competing on-ramp from inside Kairo.

**Community tips.** A future layer where students (opted-in, per the Motivation Engine's cohort principles, Learning Engine Phase 2 §8.4) could contribute plain-language tips or mnemonics for a concept — this would attach as an optional, clearly-labeled supplementary section beneath the Memory Aid (Section 6.2, item 3 area), moderated through the same QA discipline the Question Intelligence Model already applies to authored content (QIM §11), never blended into Kai's own authoritative voice.

**Formula sheets.** Would attach as an optional, on-demand reference affordance reachable from a lesson (most naturally from the Simple Breakdown or Key Idea components) — consistent with the Question Experience's own future formula-sheet scalability note (Question Experience §12), a new supporting panel rather than a change to the core lesson structure.

**Rich media generally.** Section 7 (Media Support, from the Question Experience) already establishes the shared rendering standard every module in Kairo draws from — Learn does not need its own media architecture; any new media type built for Practice, CBT Mode, or Challenges is automatically available to Learn's Visual Example and Related Questions components without additional design work.

The general principle, consistent with every other Kairo architecture document: each of these is a new *consumer* of Learn's existing structure, not a reason to change it.

---

## FINAL OUTPUT — WHY LEARN IS KAIRO'S REPAIR SHOP, NOT ITS LIBRARY

Every other module built so far — Home, Practice, the Question Experience — exists to keep a student moving forward through honest, adaptive practice. None of them are built to stop and explain. That deliberate gap is exactly where Learn belongs, and exactly why it must stay small, sharp, and disciplined rather than growing into the comprehensive teaching resource TECHMED already provides elsewhere.

A student does not open Learn to study. They arrive because a question just showed them, honestly and specifically, where their understanding gave way — and Learn's only job is to close that exact gap as briefly as the gap allows, prove it closed with one small honest attempt, and hand the student back to Practice more capable than they were five minutes earlier. Every structural choice in this specification — the question-anchored entry points, the maximum-not-mandatory flow, the reinforcement that never lets an explanation go untested, the tone that treats a repeated mistake as information rather than a verdict — exists in service of that single handoff.

If Learn ever starts to feel like a place a student browses, or a place a student dreads returning to, it has failed its own purpose, regardless of how much content it contains. Its success is invisible by design: a Practice session that goes a little better than it would have, a concept that quietly stops causing trouble, a student who trusts that when Kairo says "let's understand this first," the detour will be short, honest, and worth taking.

**Think Smart. Perform Elite.**


