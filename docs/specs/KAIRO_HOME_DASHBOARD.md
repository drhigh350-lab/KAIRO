# KAIRO HOME DASHBOARD
## The Student Command Centre

*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the
Question Intelligence Model, the Subject Knowledge Graph, and the Daily Decision Engine. Does
not redesign any of them. Every intelligence system built so far produces understanding and,
through the DDE, a decision. The Home Dashboard is the first place a student ever sees that
decision made visible. This document does not introduce new intelligence — it specifies how
existing intelligence becomes an experience.)*

---

## SECTION 1 — FIRST IMPRESSION

A student opens KAIRO after school, tired, possibly anxious, possibly having skipped yesterday,
possibly comparing themselves to a friend who "seems to be doing better." Within five seconds
they should feel three things, in this order:

1. **Recognition** — "This knows me. This isn't a generic app I'm starting over on."
2. **Relief** — "I don't have to figure out what to do. It already knows."
3. **Momentum** — "There's one clear thing in front of me, and I can start right now."

What they should *not* feel: evaluated, behind, judged, or confronted with a wall of numbers.
The dashboard's emotional job is closer to a coach meeting a student at the door with a plan
already in hand than a report card waiting to be opened. The single most important design
outcome of the first five seconds is that the student's attention lands on **one thing to do**,
not a menu of things to consider.

---

## SECTION 2 — DASHBOARD PHILOSOPHY

**The dashboard is an action page, not an analytics page.**

Analytics pages answer "how am I doing." Action pages answer "what do I do now." KAIRO needs
both truths available, but only one of them belongs at the top of the screen. Progress data
exists to *justify* the action being recommended, not to compete with it for attention.

Governing principles:

- **One primary action, always.** The dashboard has exactly one thing it wants the student to
  do. Everything else is supporting context, collapsed or secondary.
- **Show, don't summarize.** "3 concepts fading" is a summary. "Steady the mole concept before
  it slips" is a mission. The dashboard speaks like Kai, not like a stats panel.
- **Never open on a blank judgment.** No screen should greet a student with a number that could
  read as a verdict (a score, a percentage, a red streak-broken icon) before it greets them with
  a plan.
- **Progress is proof, not the point.** Momentum, streaks, and scores exist on the dashboard to
  make the day's mission feel credible and earned — never as the headline.
- **The dashboard should be legible at a glance on a cracked mid-range Android screen in
  direct sunlight**, per TECHMED's "test on the oldest Android device you can find" standard.

---

## SECTION 3 — INFORMATION HIERARCHY

Ranked by the order attention should actually land, top to bottom:

1. **Kai's greeting + Today's Mission Card** — the single non-negotiable first thing seen.
2. **Quick Resume** (if a session is mid-flight) — supersedes Today's Mission visually when
   present, since resuming an interrupted session is a stronger claim on attention than
   starting a fresh one.
3. **Exam countdown** — present but restrained; a persistent, quiet anchor, not a headline.
4. **Learning Momentum / current focus strip** — one glance of "here's where you stand," in
   plain language, not a chart-first presentation.
5. **Weak concepts needing review** — folded into or directly beneath the mission, never a
   separate anxiety-inducing list unless the student deliberately taps in.
6. **Study streak / Momentum Streak** — visible but small; a companion stat, not competing with
   the mission for size or color weight.
7. **Recent achievements / Reinforced moments** — surfaces only when genuinely recent, otherwise
   absent rather than padded.
8. **KAIRO Score** — accessible, never large, never the first number a student's eye meets.
9. **Weekly progress summary** — a single line, expandable, not a chart occupying primary space.
10. **Community / notifications** — smallest visual weight, bottom of the primary view or
    behind a tap.

The rule underneath the ranking: **anything that describes the student outranks anything that
scores the student**, and **anything actionable outranks anything merely informative.**

---

## SECTION 4 — DASHBOARD SECTIONS

### 4.1 Kai's Greeting
- **Purpose:** Establish presence and continuity before anything else loads.
- **Shown:** Short, specific line from Kai — never a generic "Welcome back!" Draws from the
  DDE's Section 11 reasoning ("What happened, why, what tone") to open with something true and
  particular ("You remembered the redox concept yesterday — that's the second time it's stuck.").
- **Actions:** None required — this is atmosphere, not interaction.
- **Appears:** Every session, top of screen.
- **Hidden:** Never — even cold-start students get a version of this, framed as discovery
  (Section 7).

### 4.2 Today's Mission Card
The dashboard's signature element. Fully specified in Section 5.

### 4.3 Quick Resume
- **Purpose:** Protect an interrupted session (DDE §8) from being silently discarded or
  buried under a fresh mission.
- **Shown:** "You were mid-session on [concept] — pick up where you left off," with a visual
  progress indicator of how far through the session the student got.
- **Actions:** One tap resumes exactly where they stopped.
- **Appears:** Only when a session was left incomplete within a resumable window (same day, or
  a short grace window beyond it).
- **Hidden:** Once resumed or once the window lapses, at which point it folds back into a fresh
  Today's Mission.

### 4.4 Exam Countdown
- **Purpose:** Keep the real deadline present without turning every day into pressure.
- **Shown:** Days remaining, framed plainly ("74 days to UTME"), no color-coded urgency
  escalation until genuinely late-stage (Peak Readiness), at which point framing shifts to
  "Prepare" language rather than alarm language.
- **Actions:** Tap for phase context (which of the six Built-to-Last phases the student is in).
- **Appears:** Always, once a student has a confirmed exam date.
- **Hidden:** Before an exam date is set (onboarding not yet complete) — replaced with a prompt
  to confirm it, not a blank space.

### 4.5 Learning Momentum Strip
- **Purpose:** A single honest line answering "am I improving," without a chart.
- **Shown:** Plain-language momentum statement ("Momentum is building — three concepts moved
  from Fading to Reinforced this week") drawn directly from the Student Intelligence Model's
  Learning Momentum metric.
- **Actions:** Tap to expand into the fuller Subject Health view (not part of this document).
- **Appears:** Once enough attempt history exists to compute momentum honestly.
- **Hidden:** During Orienting Macro-State — replaced by the discovery framing in Section 7.

### 4.6 Weak Concepts Needing Review
- **Purpose:** Make the Fading queue visible without making it feel like a debt list.
- **Shown:** Usually absorbed directly into Today's Mission rather than shown as its own
  section — surfaced as a standalone strip only when Urgent Decay volume is high enough that
  it's genuinely useful context ("2 more things are fading — Kai's folding them into today").
- **Actions:** Tap to preview what's fading, without a "start" button that competes with the
  mission's own CTA.
- **Appears:** When Urgent Decay (DDE priority 2) exceeds what a single mission can absorb.
- **Hidden:** By default when the mission already covers it — avoiding double-surfacing the
  same anxiety in two places on one screen.

### 4.7 Study Streak (Momentum Streak)
- **Purpose:** Motivational layer, explicitly decoupled from the KAIRO Score (Student
  Intelligence Model §7).
- **Shown:** Current momentum count with slack visually implied (not a bare "0" ever shown
  after a break — see Section 7).
- **Actions:** Tap for a short explanation of how Momentum Streak works (slack days, no shame
  framing).
- **Appears:** Always, small and quiet.
- **Hidden:** Never fully hidden, but deliberately minimized in visual weight relative to the
  mission.

### 4.8 Recent Achievements
- **Purpose:** Surface genuine Reinforced transitions and milestones — the Wisdom Spark's home
  on this screen.
- **Shown:** Only real, specific, recent events ("Reinforced: mole concept, 3 days ago") — never
  a permanent trophy shelf that goes stale.
- **Actions:** Tap to see the Weekly Reflection in full.
- **Appears:** Only when something genuinely happened in the last few days.
- **Hidden:** Completely absent (not an empty placeholder) when nothing recent qualifies —
  per the Wisdom Spark's rarity principle, an empty achievements shelf is worse than no shelf.

### 4.9 Weekly Progress
- **Purpose:** A single-line rollup, not a dashboard-within-a-dashboard.
- **Shown:** One sentence ("4 sessions this week, steady pace") with a tap-through to the full
  Weekly Reflection.
- **Actions:** Expand on tap only.
- **Appears:** Always, collapsed.
- **Hidden:** Never — but never expanded by default.

### 4.10 Upcoming Reviews
- **Purpose:** Give the student a sense of what's coming without demanding action on it today.
- **Shown:** A soft preview ("Two more concepts will need attention this week") — informational
  only, never a second CTA competing with today's mission.
- **Actions:** None primary — read-only preview.
- **Appears:** When the Fading queue has near-term items beyond today's mission.
- **Hidden:** When today's mission already clears the near-term queue.

### 4.11 Subject Health
- **Purpose:** Give a bird's-eye, Topic-level view (Subject Knowledge Graph §2) for students who
  want it, without forcing it onto every visit.
- **Shown:** A compact strip of subject names with a plain-language state each ("Chemistry:
  steady," "Physics: needs attention") — never raw percentages on the home screen itself.
- **Actions:** Tap into a subject to reach its dedicated dashboard (future screen).
- **Appears:** Always, low visual weight.
- **Hidden:** Simplified to one line for students with only one active subject combination
  focus area at a time.

### 4.12 KAIRO Score
- **Purpose:** Available for students who want it, never imposed on students who don't.
- **Shown:** A small, tappable badge — number visible on tap/expand, not blaring on load.
- **Actions:** Tap to see the score's plain-language breakdown (Student Intelligence Model §7.3).
- **Appears:** Always present as a badge.
- **Hidden:** Never removed, but never large.

### 4.13 Notifications
- **Purpose:** Route anything requiring attention (system messages, community mentions,
  re-engagement invitations per the non-guilt framing) to one predictable place.
- **Shown:** A simple icon with a count, standard pattern.
- **Actions:** Tap to open the notification list.
- **Appears:** Always accessible, minimal footprint on the main view.
- **Hidden:** Never hidden as an icon, but its contents never auto-surface onto the dashboard
  body itself.

### 4.14 Community Highlights
- **Purpose:** Optional social layer per the Motivation Engine's opt-in cohort principle
  (Learning Engine Phase 2 §8.4).
- **Shown:** A single, low-key card only if the student has opted into a cohort/community —
  never a default leaderboard.
- **Actions:** Tap through to the Forward Collective / community space.
- **Appears:** Only for opted-in students.
- **Hidden:** Entirely absent for students who haven't opted in — no upsell nagging on the home
  screen itself.

---

## SECTION 5 — TODAY'S MISSION CARD

This is KAIRO's signature surface — the plain-language translation of everything the Daily
Decision Engine computed (DDE §4.2), given the largest, most confident visual real estate on
the screen.

**Layout:** A single, unmistakably primary card, positioned directly beneath Kai's greeting (or
directly beneath Quick Resume, if present). Large enough to be the clear visual anchor of the
page; everything else on the screen is visually subordinate to it.

**Information contained:**
- **Mission title** — specific and human ("Steady the Mole Concept"), never "Session 14."
- **Estimated duration** — a range, not a false-precision number.
- **Primary objective** — one plain sentence stating what today's session is for.
- **Concept focus** — named in student-facing Topic/Sub-topic language.
- **Kai's one-line reason** — the explainability line required by DDE §12.2 ("We're revisiting
  this because it's starting to fade — catching it now beats relearning it later.").

**Progress:** If the mission has multiple components (e.g., review + new material), a simple,
segmented progress indicator reflects composition — not a percentage bar that implies precision
the plan doesn't actually promise.

**CTA:** One button. One verb. "Start Mission." No secondary competing button on the card
itself — alternate actions (skip, see details) live in smaller, quieter affordances beneath it,
never equal in visual weight.

**Kai's message:** Sits directly on or beside the card, short, specific, matched to current
Macro-State tone (Learning Engine Phase 2 §7.4) — warmer and lighter for Wavering/Recovering,
sharper and more direct for Compounding/Peak Readiness.

**Dynamic behaviour:** The card is regenerated, not just re-labeled, every time the DDE's inputs
materially change — a new day, a returning student after a gap, or a live mid-session pivot
(DDE §7) all produce a card that reflects the current true state, never a stale cached version
of yesterday's plan.

---

## SECTION 6 — PERSONALISATION

| Student state | Dashboard behaviour |
|---|---|
| **New student** | Mission Card frames the first session as discovery ("Let's get to know your starting point"), no score/streak/momentum sections shown yet — replaced with a simple "Your picture is building" placeholder. |
| **Returning student (normal)** | Standard full dashboard; mission reflects the DDE's current top priority. |
| **High performer (Compounding/Peak Readiness)** | Momentum and Subject Health get slightly more visual room; Mission Card language shifts toward "earned challenge" framing; Warm-up/easy-win sections are minimized since the Behaviour Profile shows they aren't needed. |
| **Recovering from inactivity** | Mission Card explicitly reframes as a reconnection session ("Starting light today, on purpose") — no visible recap of what was missed anywhere on the screen; streak shown with slack applied automatically, never a bare broken counter. |
| **Near exam (Peak Readiness)** | Countdown becomes slightly more visually present; Mission Card shifts to "Prepare" framing (confidence + pressure-testing); Subject Health foregrounds Exam Readiness over long-term momentum language. |
| **Struggling (Wavering)** | Card copy shortens; information density across the whole screen reduces; Confidence-building framing is foregrounded; comparative/community sections are the first thing suppressed. |
| **Only a few minutes available** | If the student has indicated limited time (or Behaviour Profile infers it from time-of-day), the Mission Card itself states the compressed scope up front ("Today we're just steadying one thing — about 10 minutes") rather than showing a normal-length mission the student has to abandon partway. |

---

## SECTION 7 — EMPTY STATES

The dashboard is never allowed to look broken or blank — every empty state is a designed,
intentional moment, not a placeholder gap.

- **No progress yet (true cold start):** Kai's greeting introduces itself, the Mission Card
  presents the diagnostic pass explicitly as "getting to know you," and every score/streak/
  momentum section is replaced with a single reassuring line: "Your picture is just getting
  started — this fills in as you go."
- **No data yet for a specific section (e.g., Momentum before enough sessions exist):** The
  section is either hidden entirely (preferred, per Section 4's hide rules) or shows one honest
  sentence explaining why it's not ready yet — never a zeroed-out chart implying failure.
- **No completed sessions today:** Quick Resume is absent; Today's Mission simply presents as
  the day's fresh starting point — there is no "you haven't studied today" framing anywhere.
- **No recommendations available (data gap edge case, DDE §13):** Defaults to the safest
  Explore/Continue category — the Mission Card still shows something concrete and low-stakes
  rather than an apologetic blank card.
- **No internet connection:** The dashboard renders from the last successfully synced state,
  clearly but calmly marked as offline (a small, non-alarming indicator, not a red banner), and
  the Mission Card still offers an offline-safe action where the content allows it, per
  TECHMED's offline-first principle.

---

## SECTION 8 — MICRO-INTERACTIONS

Restraint is the design rule — animation exists only where it reinforces meaning, never as
decoration.

- **Wisdom Spark:** Fires only at genuine inflection points reachable from the dashboard — a
  Reinforced transition surfacing in Recent Achievements, a Macro-State upgrade, a milestone
  recall. It never appears on routine loads, taps, or streak increments, preserving its rarity
  (Learning Engine Phase 2 §7.6).
- **Mission Card entrance:** A single, subtle settle-in motion on load — communicates "this was
  prepared for you," not a flashy reveal.
- **Quick Resume progress fill:** A quiet, immediate visual confirmation when tapped, so the
  transition into the resumed session feels continuous rather than like a fresh reload.
- **Streak/Momentum tick-up:** A small, understated animation — deliberately less dramatic than
  the Wisdom Spark, so the hierarchy of "this matters more" (Reinforced transitions) versus
  "this is a nice-to-have" (streak count) is felt, not just stated.
- **Section reveal on scroll:** Gentle fade-in only, no bounce or attention-grabbing motion —
  the dashboard should never compete with itself for the student's focus.

---

## SECTION 9 — NAVIGATION

**Always accessible** (persistent bottom or top navigation): Home (this dashboard), Practice/
Study, Kai Chat, Progress/Subjects, Profile/Settings. Five items maximum — anything beyond that
becomes decision fatigue in the chrome itself.

**Reachable but not persistent:** Community/Forward Collective (only for opted-in students),
Notifications (icon badge, not a nav tab), Weekly/Monthly Reflection (reached through their
respective dashboard cards, not a standalone tab).

**Taps to start studying:** One. The Mission Card's "Start Mission" button is reachable the
instant the app opens — no menu, no subject picker, no settings gate between opening KAIRO and
beginning to learn. This is the dashboard's single hardest requirement, directly inherited from
the DDE's founding principle (DDE §1.2): removing the decision, not just answering it quickly.

---

## SECTION 10 — ACCESSIBILITY

- **Low-end Android devices:** No heavy animation libraries on the home screen; all
  micro-interactions (Section 8) must degrade gracefully to instant state-changes on
  lower-powered devices rather than stuttering.
- **Small screens:** The Mission Card and Kai's greeting must remain fully legible at 320px
  width without truncation; every other section collapses before the Mission Card ever does.
- **Inconsistent internet:** The dashboard must render meaningfully from cache before any
  network call resolves — a student should never see a spinner where the Mission Card belongs.
- **Font/contrast:** Follows the Kairo visual identity's WCAG AA standards throughout (Navy on
  White, Gold used sparingly and never for critical small text) — the dashboard is not exempt
  from the platform-wide accessibility bar just because it's information-dense.
- **Touch targets:** The Mission Card's CTA and all navigation items meet the 48px minimum
  standard already set in the Kairo visual identity guidelines.

---

## SECTION 11 — SUCCESS CRITERIA

A successful dashboard lets a student answer all five of the following within seconds of
opening the app, without tapping anything:

1. **What should I do now?** — Answered by the Mission Card's title and CTA.
2. **Why am I doing it?** — Answered by Kai's one-line reason on the card.
3. **How am I progressing?** — Answered by the Momentum strip and streak, glanced, not studied.
4. **Am I improving?** — Answered by Recent Achievements when genuinely present, or by the
   Momentum strip's plain-language framing.
5. **What happens next?** — Answered implicitly by the fact that starting the mission is the
   only obvious next action on the screen.

If a student has to scroll, tap into a menu, or interpret a chart to answer any of these five
questions, the dashboard has not met its own standard.

---

## FINAL OUTPUT — WHY THE HOME DASHBOARD IS THE HEART OF KAIRO

Every system built before this one — the Learning Engine, the Student Intelligence Model, the
Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine — exists to
produce one honest answer to "what should this student do right now." The Home Dashboard is the
only place that answer actually reaches the student. A perfect recommendation engine attached
to a confusing, cluttered, or anxiety-inducing home screen is, from the student's point of view,
indistinguishable from no recommendation engine at all.

This is why the dashboard is designed around one non-negotiable outcome: a student should feel
**guided, not overwhelmed.** Not shown everything KAIRO knows about them — shown the one true
thing that matters today, with enough visible reasoning to trust it, and enough restraint to
not bury it under numbers, charts, streaks, and community noise competing for the same five
seconds of attention.

Students will see this screen hundreds of times. Every one of those visits is either a small
renewal of trust — "this still understands me" — or a small erosion of it. If this screen gets
it right, every other screen in KAIRO inherits that trust before the student has even tapped
anything else. That is the entire argument for treating this as the single most important
surface in the product.

**Think Smart. Perform Elite.**
