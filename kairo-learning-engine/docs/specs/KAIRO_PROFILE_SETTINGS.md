\*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Product Experience Blueprint, the Home Dashboard, the Practice Module, the Question Experience, the Learn Module, the Review Module, CBT Exam Mode, the Challenges Module, Insights, the Student Journey & Engagement Engine, and Notifications & Communication Systems. Does not redesign any of them. Profile was already sketched at the Product Experience Blueprint level — Profile Overview, Goals, Achievements & Badges, Account Settings (Product Experience Blueprint §8) — as the one editable surface for Student Identity (Student Intelligence Model §1). This document is where that sketch becomes the complete specification: not just what a student can see, but what they can change, and what changing it sets in motion across every other system that reads Identity.)\*

## ## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per student, per field they might touch:

\*\*If this student changes this one thing about themselves, what does the rest of Kairo owe them as a consequence — and have we made that consequence honest, immediate, and never a surprise?\*\*

Not: what can we let students edit. Not: how do we make settings feel comprehensive. \*\*Every editable field in Kairo is a promise that changing it will actually change something real — a target, a countdown, a scope, a voice — and this document exists to keep every one of those promises traceable, not silent.\*\*

If a design decision can't be traced back to that question, it doesn't belong in Profile & Settings.

## ## SECTION 1 — PRODUCT PURPOSE

## ### 1.1 What Profile & Settings is

Profile & Settings is the one place in Kairo where the student, not the Intelligence Engine, holds the pen. Every other module infers, computes, and recommends (Student Intelligence Model §1's own framing: "Identity fields are the only layer that is \*declared\*, not \*inferred\*"). Profile & Settings is where that declaration actually happens and is later revised — the sole editable surface for Student Identity (Student Intelligence Model §1), the sole surface for notification

consent management (Notifications §10.2's category-level preference tier), and the permanent, non-recent-activity home for Achievements & Badges (distinct from Home Dashboard's recency-scoped strip, Home Dashboard §4.8, and Insights' trend-contextualized rendering of the same events, Insights §9.6).

Where the Daily Decision Engine exists to remove decisions from a student's day (DDE §1.2, §14), Profile & Settings is the deliberate exception: this is the one part of Kairo explicitly built to \*ask\* the student things, because some facts about a student's own journey — their target course, their exam year, whether they want a push notification at 6am — are not inferable from behavior and should not be guessed at.

## ### 1.2 What Profile & Settings is explicitly not

It is not a second Insights. Insights interprets and narrates the student's \*learning\* data back to them (Insights §1.1) — accuracy, retention, trend. Profile & Settings never interprets; it displays raw, declared, or structural facts (a target score, a subscribed notification category, a badge earned) without narrative framing. A student opens Insights to understand their progress. A student opens Profile to change or confirm a fact about themselves.

It is not the Home Dashboard's Achievements strip restated, nor Insights' Achievements & Badges screen (Insights §6.3 item 7 for Monthly, Home Dashboard §4.8 for recent). Product Experience Blueprint §8 already drew this distinction — Home Dashboard shows \*recent\*, Insights shows \*achievement in context of a trend\*, Profile shows the \*full, permanent record\* (Product Experience Blueprint §8, "Achievements & Badges — full, permanent record — distinct from Insights' recent-activity framing"). This document treats that distinction as binding, not merely descriptive.

It is not the Notification Orchestrator (SJEE §5) and not the Notifications & Communication Systems module's consent architecture (Notifications §10) restated in full — both are consumed here, not redesigned. Profile & Settings is the \*surface\* a student uses to set the preferences those systems already fully specify how to enforce.

## ### 1.3 Why this module has to exist separately from every module that reads Identity

Nearly every prior specification reads Student Identity fields without owning them: the Daily Decision Engine reads Exam type and Target UTME Score to weight sessions (DDE §2.1); the Subject Knowledge Graph scopes content by Subject Combination (Subject Knowledge Graph §2.1); the SJEE computes Journey Stage boundaries from Registration date and exam countdown (SJEE §3.2, §8.4); CBT Exam Mode never introduces subjects outside the declared combination (CBT Exam Mode §4.4); Notifications resolves Preferred Study Period as its default scheduling anchor (Notifications §7.2, tier 2). Every one of these is a \*read\*. None of them is a \*write\* surface, and none of them should be — a student's target course should not be editable from inside a CBT Exam Mode setup screen, because a change that consequential deserves one canonical place to happen, with one canonical set of downstream effects triggered honestly and completely, not a scattered set of half-editable fields bolted onto whichever module happened to need one first.

## ### 1.4 The one-sentence purpose statement

\*\*Profile & Settings exists to be the one place a student's own stated facts about themselves — who they are, what they're aiming for, how they want to be reached, and what they've genuinely earned — live, get changed, and honestly propagate everywhere else in Kairo that depends on them.\*\*

## ## SECTION 2 — PROFILE PHILOSOPHY

## ### 2.1 Declared, never inferred — and never silently overridden by inference either

Student Intelligence Model §1 already draws this line: Identity is declared, everything else is inferred. Profile & Settings' governing discipline is protecting that line in both directions. A student's declared Target UTME Score is never quietly adjusted by the Intelligence Engine because behavioral data suggests a "more realistic" number — Exam Readiness (Student Intelligence Model §6) is \*benchmarked against\* the declared target, never used to \*rewrite\* it. The student's word on their own goals is final; Kairo's job is to be honest about the gap, not to edit the goalpost.

## ### 2.2 Every change is a consequence, not just a save

Consistent with the DDE's own explainability standard applied to every other student-facing decision (DDE §12, "name the observation, name the reason, name the benefit"), Profile & Settings extends that same discipline to the \*student's own actions\* on this screen. A field is never presented as an isolated input with a silent "Save" button — where a change has a genuine downstream effect (changing exam year re-scopes content, Section 5; changing target course reweights urgency messaging, DDE §2.1), that effect is named plainly, before or immediately after the change, exactly as DDE §13's "The student changes goals" edge case and SJEE §9.4's exam-date-change edge case already establish as the standard elsewhere. This document is where that standard gets its own dedicated screen-level treatment rather than living only as scattered edge-case footnotes.

## ### 2.3 Nothing here is ever a hard gate

Mirroring the Subject Knowledge Graph's own standing rule against unnecessary locking (Subject Knowledge Graph §5.1) and the SJEE's rejection of forced Identity capture (SJEE §4.4, "not sure yet" as a first-class answer): no Profile field is ever required beyond the genuine minimum needed to route a first session (SJEE §4.4). A student can leave target course, target university, and even target score unset indefinitely, and every downstream system already

degrades gracefully on missing Identity data exactly as it degrades on missing dependency data (Subject Knowledge Graph §10.3) — Profile & Settings never manufactures pressure to complete a field the rest of the architecture doesn't actually require.

## ### 2.4 Achievements are shown, never re-narrated

Per Section 1.2's boundary: Profile's Achievements & Badges screen (Section 8, later part) renders the same underlying event log Insights and the Home Dashboard already read (SJEE §7's cross-module milestone system, Learning Engine Phase 2 §7.6's Wisdom Spark events), but strips the narrative coaching voice those surfaces apply. A badge here is a fact with a date, not a story — the story already happened, once, in the moment it was earned (Home Dashboard §8's Wisdom Spark entrance, Insights §9.7's rarity-protected rendering). Profile is the trophy shelf, not the retelling.

## ### 2.5 Settings protect the student from the product, not the other way around

Mirroring Notifications §10.8's standing rule ("the default is silence, not delivery") and SJEE §9.7's absolute-override principle: every consent and preference control in this module exists to give the student power \*over\* Kairo's own behavior, never the reverse. A settings screen that made itself hard to find, hard to change, or that quietly reset a preference back to a platform default would violate the same trust-over-conversion standard already established platform-wide (TECHMED Branding Standard §13, "Credible... Do not manufacture proof... Trust is more valuable than a temporary conversion").

## ### 2.6 Privacy and account control are treated with the same seriousness as academic data

Consistent with the Emotional Profile's hard boundary against exposure (Student Intelligence Model §4) and the consent architecture's own retention discipline (Notifications §10.6), Profile & Settings is where a student exercises real control over their own data — not a buried, token gesture toward compliance, but a genuinely usable surface, held to the Branding Standard's own "Humanity" principle (TECHMED Branding Standard §4.5, §8) that a system should provide structure without treating students like machines, applied here to a student's control over their own account rather than to their learning experience.

## ## SECTION 3 — PROFILE DATA ARCHITECTURE

## ### 3.1 Purpose

This section defines the structural map every subsequent screen in this specification (Profile Overview, Goals, Achievements, Account Settings — Part 2) renders from. Consistent with every prior module's standing discipline (Learn Module §7.1, Review Module §7.1, SJEE §11.1, Notifications §5.1): \*\*Profile & Settings computes no new intelligence.\*\* It is the sole \*write\*

surface for one layer (Student Identity) and a \*read\* surface for two others (Achievements, derived Progress summaries) — never a parallel source of truth for data owned elsewhere.

## ### 3.2 The three-layer model

\*\*Layer 1 — Declared Identity (owned and written here).\*\* The full Student Identity field set already enumerated at the Student Intelligence Model level (§1) — name, age/DOB, exam type, exam year/sitting, target university, target course, target UTME score, subject combination, registration date (read-only, never editable — see 3.5), preferred study duration/period, device information (system-managed, not student-edited), referral source (system-managed), parent/guardian contact, language/region context. This is the only layer in the module a student directly edits.

\*\*Layer 2 — Consent & Preference (owned and written here, but structurally distinct from Identity).\*\* Notification category preferences (Notifications §10.2, tier 2), channel-level permissions (Notifications §10.2, tier 1), leaderboard/cohort opt-in status (Learning Engine Phase 2 §8.4), data/offline settings, language rendering preference (Notifications §9). Kept structurally separate from Layer 1 because a consent change and an Identity change trigger entirely different downstream systems (Section 3.4) even though both are "settings" a student sees on the same set of screens.

\*\*Layer 3 — Read-only Reflection (rendered, never written).\*\* Achievements & Badges history (SJEE §7's event log), Journey milestone summary (SJEE §3, never shown as a raw stage label per SJEE §3.7), and a light Progress summary consistent with Insights' own KAIRO Score legibility (Student Intelligence Model §7.3) but without Insights' interpretive coaching layer (Section 2.4).

## ### 3.3 Why Layer 1 and Layer 2 must not share a save action

A student changing their target course (Layer 1) and a student toggling off Challenge notifications (Layer 2) are, from the Intelligence Engine's perspective, unrelated events with unrelated consequences — the first re-scopes content and readiness benchmarking (Section 3.4); the second only affects the Notification Orchestrator's candidate filtering (Notifications §10.2). Bundling them into a single generic "Profile updated" event would force every downstream consumer to inspect \*what\* changed rather than simply subscribing to the change type it actually cares about — this mirrors the Notifications module's own single-category rule (Notifications §3.4) applied to the data layer instead of the message layer: one change type, one consequence path, never blended.

\### 3.4 The consequence map — what changes where

| Layer 1 field changed | Immediate downstream consequence | Owning system | ---|---|---|

| Exam type / exam year | Content Map subtree re-scoped; SJEE Intensification threshold recomputed | Subject Knowledge Graph §2.1; DDE §13; SJEE §9.4 |

| Subject combination | Active Concept Node subgraph changes; CBT Mode's default full-combination scope updates | Student Intelligence Model §1; CBT Exam Mode §4.4 | Target course / target university | Urgency and admission-strategy framing shifts; no relearning-of-content effect | Student Intelligence Model §1 |

| Target UTME score | Exam Readiness benchmark recalculates against the new target (never retroactively rewrites past readiness reads) | Student Intelligence Model §6 |

| Preferred study duration/period | Session-length defaults (Practice Module §4.4) and notification scheduling anchor (Notifications §7.2, tier 2) both update from the next instance onward | Practice Module §4.4; Notifications §7.2 |

| Language/region context | Kai's analogy and framing selection shifts; rendering locale updates (Notifications §9.2) | Student Intelligence Model §1; Notifications §9 |

| Parent/guardian contact | Activates the dormant Parent Dashboard extension point where built; otherwise stored inert | Student Intelligence Model §1, §9; Insights §11 (future) |

## ### 3.5 What is declared but never editable here

Registration date, device/connectivity history, and referral source are Identity fields (Student Intelligence Model §1) but are explicitly \*\*system-managed, read-only\*\* even inside Profile — displayed where genuinely useful (registration date, for a student curious about their own tenure) but never presented as an editable input, since editing them would corrupt the very cohort, journey, and diagnostic logic that depends on their integrity (SJEE §3.2's stage computation, CBT Exam Mode §4.7's connectivity diagnostics). This mirrors the Subject Knowledge Graph's own distinction between structural facts and content that's expected to evolve (Subject Knowledge Graph §10.4) — some fields are facts about \*what happened\*, not preferences, and Profile respects that difference by simply not offering an edit control where none should exist.

## ### 3.6 Why this architecture scales to every future settings need

Because every future addition — a new consent category, a new declared Identity field, a new read-only reflection surface — slots into one of exactly three layers with an already-defined write/read discipline and an already-defined consequence-mapping pattern (3.4), adding a new setting is a matter of extending a table, never redesigning the module. This is the same "new consumer, not new architecture" principle every prior Kairo specification has established for its own future scalability (Learning Engine Phase 2 §12, Subject Knowledge Graph §12, Notifications §14), applied here to the one module whose entire job is holding the facts every other module's architecture already assumes exist.

## # KAIRO PROFILE & SETTINGS

\## Product Specification — Part 2 of 4: Sections 4–6 \*(Continues directly from Part 1 — Sections 0–3. Builds on the same prior specifications without redesigning them. This part specifies the three primary screens Profile & Settings renders: Profile Overview, the Goals Screen, and Achievements & Badges.)\*

## ## SECTION 4 — PROFILE OVERVIEW SCREEN

## ### 4.1 Purpose

Profile Overview is the landing screen when a student navigates to Profile — the summary view a student sees before choosing to go deeper into Goals (Section 5), Achievements (Section 6), or Account Settings (Part 3). Its job is narrower than the Home Dashboard's (Home Dashboard §2): it is not an action page, and it does not need to make "start studying" effortless — that responsibility belongs entirely to the Mission Card (Home Dashboard §5). Profile Overview's job is to answer, at a glance, "who does Kairo think I am right now, and is that still right?"

## ### 4.2 Governing design constraint

Consistent with Section 2.4's boundary, Profile Overview never narrates. It states facts plainly, in the same register a form confirmation screen would use, not the register Kai uses elsewhere in the product. This is a deliberate register shift, not an inconsistency — a student on this screen is checking or correcting a record, not being coached, and the two moments call for different voices (mirroring the distinction Notifications §11.6 draws between Kai's mentor register and TECHMED's own organisational voice — Profile Overview speaks closer to the latter than the former, since it is fundamentally an administrative surface, not a learning one).

## ### 4.3 Layout, top to bottom

1. \*\*Identity header\*\* — preferred name, an avatar/initial treatment consistent with the Kairo Visual Identity's card system (Kairo Visual Identity Part 3), and the student's exam type and exam year stated plainly ("UTME 2027 Candidate"). No editable control lives directly in this header — it is a summary, not an entry point; edits route through Goals (Section 5).

2. \*\*Exam countdown context\*\* — the same countdown already rendered on the Home Dashboard (Home Dashboard §4.4), restated here without the Dashboard's restraint-driven de-emphasis, since a student who has navigated into Profile has already signaled intent to look at their own standing directly.

3. \*\*Target snapshot\*\* — target university, target course, and target UTME score, shown together as a single "what I'm aiming for" block, each with a quiet edit affordance routing into the Goals Screen (Section 5) rather than an inline edit on this screen — Profile Overview previews, Goals Screen is where the consequence-aware editing (Section 2.2) actually happens.

4. \*\*Subject combination summary\*\* — the active Subject Combination (Student Intelligence Model §1) listed plainly, with the same edit-routes-to-Goals pattern as item 3.

5. \*\*Achievement highlights\*\* — a small, quiet strip of 2–3 standout badges (not the full history — that's Section 6), functioning as a preview and single-tap route into the full Achievements & Badges screen, mirroring the Home Dashboard's own precedent for a bounded, non-exhaustive Recent Achievements card (Home Dashboard §4.8) but drawn from all-time significance rather than recency, consistent with this module's permanent-record character (Section 1.2).

6. \*\*Account & Settings entry point\*\* — a single, clearly-labelled route into Account Settings (Part 3), never inlined on this screen, keeping Profile Overview a summary rather than a settings form.

## ### 4.4 What Profile Overview deliberately does not contain

No KAIRO Score badge, no Insights-style trend framing, no raw analytics of any kind — those belong entirely to Insights (Insights §1.2's own boundary, restated here in reverse: Profile is not a lightweight Insights). No notification category toggles inline (Part 3). No promotional or Editorial & Broadcast content (Notifications §3.6) — Profile Overview is never a surface TECHMED's marketing layer writes to.

## ### 4.5 Empty and partial states

A student who has left target course, target university, or target score unset (a fully permitted state per Section 2.3) sees the Target Snapshot render those fields honestly as unset — "Not set yet" with a quiet, non-urgent invitation to add them — rather than a blank space or a manufactured placeholder value. This mirrors the Home Dashboard's own empty-state discipline (Home Dashboard §7): an honest absence, never a padded one. A cold-start student with no Achievements yet sees the Achievement Highlights strip omitted entirely rather than shown empty, consistent with the Wisdom Spark's rarity-protecting precedent (Home Dashboard §4.8, "an empty achievements shelf is worse than no shelf").

## ## SECTION 5 — THE GOALS SCREEN

## ### 5.1 Purpose

The Goals Screen is where Section 2.2's "every change is a consequence" principle does its heaviest lifting — this is the single screen in Kairo where editing Layer 1 Identity fields (Section 3.2) actually happens, and therefore the screen most directly responsible for keeping every downstream consequence in Section 3.4's table honest, visible, and never a surprise.

## ### 5.2 Governing design constraint

Every field on this screen answers, before a student commits a change, the same question Section 0 poses at the module level: \*what does the rest of Kairo owe the student as a result of this edit?\* Where a field's consequence is genuinely inert (changing a preferred name, for instance, touches nothing structural), no consequence messaging appears at all — manufacturing a warning where none is warranted would violate the same discipline the Notifications compliance checklist applies against unearned urgency (Notifications §5.5, rule 3's spirit extended here to Profile's own copy). Where a field's consequence is real, it is named plainly, in one sentence, before the change is confirmed — mirroring the DDE's "name the observation, name the reason, name the benefit" pattern (DDE §12.2) compressed to its first two beats, since Goals Screen consequences are stated, not sold.

## ### 5.3 Field groups and their consequence treatment

\*\*Exam type and exam year.\*\* The highest-consequence field pair on this screen (Section 3.4, row 1) — changing either re-scopes the entire active Content Map subtree (Subject Knowledge Graph §2.1) and recomputes the SJEE's Intensification-phase timing (SJEE §9.4). Because of this weight, a change here is the one place on the Goals Screen that receives an explicit, single-sentence confirmation step before it commits ("Changing your exam year to 2028 will reset your countdown and shift your revision pacing — your existing progress is kept, nothing is lost") — mirroring CBT Exam Mode's own precedent that added friction is the correct choice exactly where the stakes of an accidental change genuinely outweigh one extra tap (CBT Exam Mode §5.10). This is the single exception to Section 5.2's "no manufactured friction" default, justified by the same standard that justifies it everywhere else in Kairo.

\*\*Subject combination.\*\* Adding or removing a subject immediately changes which Concept Node subgraph is active (Student Intelligence Model §1) and which subjects CBT Exam Mode defaults a Full UTME Mock Exam to (CBT Exam Mode §4.4). Removing a subject never deletes that subject's historical Knowledge Map data — consistent with the append-only, never-discarded principle already established platform-wide (Student Intelligence Model §2, Review Module §10.4's identical handling of an out-of-combination CBT attempt) — it simply stops being "active," and can be re-added later with its prior history intact, framed to the student plainly ("Removing Physics won't delete your progress in it — you can bring it back anytime").

\*\*Target course and target university.\*\* Lower-consequence than the pair above: these shift urgency and admission-strategy framing (Student Intelligence Model §1) without touching the Content Map or any retention math. No confirmation step is required; the change simply takes effect, consistent with Section 5.2's proportionality principle.

\*\*Target UTME score.\*\* Editing this field recalculates the Exam Readiness benchmark going forward (Student Intelligence Model §6) but — per Section 3.4's explicit note — never retroactively rewrites past readiness reads a student may have already seen in Insights (Insights §9.2's own standing rule that a metric's history is never silently altered). The Goals

Screen states this plainly where relevant: "Your new target applies from today forward — past reports won't change."

\*\*Preferred study duration and preferred study period.\*\* The lowest-consequence editable pair on this screen — both simply update Practice's session-length default (Practice Module §4.4) and the Notification Timing Engine's scheduling anchor (Notifications §7.2, tier 2) from the next instance onward. No confirmation step; a quiet, immediate effect.

\*\*Parent/guardian contact.\*\* Optional, and per Student Intelligence Model §1 currently dormant pending the future Parent Dashboard extension point. Adding it here does not activate any current-facing behavior — the Goals Screen is honest about this rather than implying a feature exists before it does ("This is saved for a future parent view — it doesn't send anything yet").

## ### 5.4 What the Goals Screen never does

It never silently applies a change without at least a lightweight visible confirmation that the save succeeded (mirroring Notifications §2.5's "reliability is part of the message" principle, restated here as "reliability is part of the edit"). It never bundles a Layer 1 change with a Layer 2 consent change in the same save action (Section 3.3). It never presents a field as required when the underlying architecture treats it as optional (Section 2.3) — every optional field is visibly, honestly optional, never marked with an implied asterisk of obligation it doesn't actually carry.

## ### 5.5 Downstream confirmation, not downstream silence

Per Section 3.4's consequence map, several fields trigger effects that manifest \*elsewhere\* in the product rather than on this screen itself (a re-scoped Content Map, a new Mission Card framing, DDE §13's own next-session re-planning). The Goals Screen does not attempt to preview those downstream screens inline — doing so would duplicate content that lives natively elsewhere, the same discipline Notifications §2.3 already establishes for its own messages ("a message is a door, not a destination," restated here as "a settings change is a door, not a destination"). It states the consequence in one sentence (5.3) and trusts the receiving system — Practice, the DDE, Insights — to honor it faithfully the next time the student encounters it.

## ## SECTION 6 — ACHIEVEMENTS & BADGES SCREEN

## ### 6.1 Purpose

This is Profile's permanent record — the full, ungoverned-by-recency counterpart to the Home Dashboard's Recent Achievements strip (Home Dashboard §4.8) and Insights' trend-embedded achievement mentions (Insights §9.6). Where those two surfaces show an achievement \*in service of\* something else — momentum on the Dashboard, narrative context in Insights — this screen shows an achievement because a student came here specifically to see everything they've earned, in full, honestly.

## ### 6.2 What qualifies as an achievement here

Every genuine Wisdom Spark-worthy event already defined platform-wide (Learning Engine Phase 2 §7.6): Reinforced transitions on high-Importance concepts (Subject Knowledge Graph §3.1), Macro-State upgrades (Learning Engine §3), Momentum Streak milestones (Learning Engine Phase 2 §8.1), CBT Exam Mode personal-bests (CBT Exam Mode §9.7), and Challenge-specific badges (Challenges Module §7.2). This screen does not maintain its own achievement-detection logic — consistent with Section 3.1's standing rule, it is a pure read against the same cross-module milestone event log the SJEE, Home Dashboard, and Insights already consume (SJEE §7).

## ### 6.3 Layout

1. \*\*Badge grid\*\* — every earned badge, rendered chronologically-reversed by default (most recent first) with a filter to view by category (Streak, CBT, Challenges, Concept Mastery) — mirroring the Challenges Module's own badge-collection framing (Challenges Module §7.2, "collectible over time... a reason to build a personal trophy case") but scoped here to the full cross-module set, not Challenges alone.

2. \*\*Locked/upcoming badges\*\* (optional, low visual weight) — where a genuinely near-term badge is meaningfully close (mirroring the Wisdom Spark's own near-miss framing precedent, Notifications §3.1's Milestone category sourcing), it may be shown in a visibly distinct, muted "not yet earned" state — never a manipulative near-miss prompt, and never present at all if showing one would require inventing false proximity.

3. \*\*Badge detail on tap\*\* — date earned, the specific concept/subject/event that earned it, and a one-line factual description — explicitly \*not\* Kai's coaching voice (Section 2.4) — "Reinforced: Mole Concept — March 14" rather than a narrated sentence about what that meant for the student's week.

4. \*\*Milestone timeline\*\* (optional, for students with enough history) — a simple, chronological list view as an alternative to the grid, useful for a student who wants to see their journey in sequence rather than by category.

## ### 6.4 What this screen never does

It never applies comparative or leaderboard framing (the platform-wide rule against 1:1 comparative language, Learning Engine Phase 2 §7.2 rule 2, applies here as it does everywhere else a student's own achievements are shown). It never re-fires the Wisdom Spark animation on routine viewing — the Spark belongs to the moment of earning (Home Dashboard §8), and browsing an already-earned badge here is a calm, static view, never a re-triggered

celebration, consistent with the rarity principle's own logic (Learning Engine Phase 2 §7.6) that repetition erodes meaning. It never allows a badge to be deleted, hidden, or reordered by the student — this is a factual record, and Section 2.6's data-integrity seriousness applies to the record's completeness the same way it applies to consent history (Notifications §10.6).

## ### 6.5 Empty and sparse states

A cold-start or low-history student sees this screen framed honestly rather than as a discouraging empty grid — "Your achievements will show up here as you earn them" — mirroring the identical empty-state discipline already established for Learn Home's Mastered Concepts section (Learn Module §4.5) and Review Home's Reinforced This Month section (Review Module §4.5), both of which treat an early-stage absence as honest rather than broken. # KAIRO PROFILE & SETTINGS

\## Product Specification — Part 3 of 4: Sections 7–9

\*(Continues directly from Part 2 — Sections 4–6. Builds on the same prior specifications without redesigning them. This part specifies Account Settings: notification consent, privacy and data controls, and language/region preferences — the full Layer 2 surface defined structurally in Section 3.2.)\*

## ## SECTION 7 — NOTIFICATION CONSENT & CHANNEL PREFERENCES

## ### 7.1 Purpose

This section is the student-facing render of the consent hierarchy already fully specified at the Notifications module level (Notifications §10.2) — channel-level permission, category-level preference, and the explicit stop request. Nothing here is new logic; this screen is the \*interface\* onto architecture Notifications §10 already owns in full. Consistent with Section 3.1's standing rule, Profile & Settings writes preference values into that existing consent model — it does not maintain a second one.

## ### 7.2 Layout, top to bottom

1. \*\*Channel permissions\*\* — one row per channel in the roster (Notifications §4.1): push, WhatsApp, email, SMS. Each row shows current permission state (granted / not granted / not applicable to this device) and, where the channel requires it, a clear route to grant it (an OS-level permission prompt for push; a number/email capture flow for WhatsApp, SMS, or email where not yet provided). This directly renders Notifications §10.2 tier 1.

2. \*\*Category preferences\*\* — one row per notification category (Notifications §3.1): Academic Nudges, Motivational & Consistency, Milestone & Celebration, Community & Social, Re-engagement & Win-back, Exam-Critical, Editorial & Broadcast. Each row is independently toggleable, per Notifications §10.5's explicit rule that Editorial & Broadcast consent is tracked separately from the other categories — this screen renders that separation visibly, as two grouped sections rather than one flat list, so a student can decline campaign content while remaining fully subscribed to their own personal Academic Nudges, or the reverse.

3. \*\*Account & Administrative notice\*\* — a single, non-toggleable, clearly-labelled line explaining that security and account-critical notices (Notifications §3.5) are always delivered regardless of the preferences above, exactly as that category's binding exemption already specifies — stated honestly rather than hidden, since a student should never be surprised later that this category didn't respect a toggle it was never subject to.

4. \*\*Frequency context\*\* (informational, not a control) — a brief, honest note that Kairo caps how often it reaches out even within enabled categories (SJEE §5.6's frequency budget), framed per Notifications §13.6's precedent for a student who wants \*more\* contact: a link to request a higher personal ceiling, never a slider that pretends to control the Orchestrator's own tier logic directly.

5. \*\*Full stop control\*\* — a single, clearly separated, unambiguous action to stop all outbound contact (Notifications §10.2 tier 3), distinct in visual weight from the category toggles above it, consistent with its own status as an override that supersedes every other setting on this screen. Selecting it requires the same lightweight confirmation discipline already established for high-consequence Goals Screen changes (Section 5.3) — not to create friction, but to make sure the student understands this suppresses Exam-Critical alerts too, with the sole exception of genuine Account & Administrative notices (Notifications §10.2 tier 3).

## ### 7.3 What this screen never does

It never asks a student to justify or explain an opt-out — no "are you sure? you'll miss important updates" guilt-adjacent copy, consistent with the platform-wide ban on guilt-based framing extended here to the act of disabling notifications itself (Learning Engine Phase 2 §7.2 rule 3's spirit, restated at the settings layer). It never re-enables a category the student has turned off as a side effect of an unrelated update (mirroring Notifications §10.3's rule that consent is never inferred upward) — a platform update that adds a new notification type ships with that type defaulted off for existing students until they visit this screen, never silently on. It never displays a channel as available if the platform or regulatory constraint (Notifications §10.7) makes it currently ineligible — an ineligible channel is shown as such, honestly, rather than offered and failing silently later.

## ### 7.4 Consequence transparency

Per Section 2.2's module-wide principle, toggling a category off states, briefly, what that means in practice — not a warning, just an honest description: "You won't get nudges about fading concepts, but they'll still show up inside Review when you open the app" (mirroring Notifications §13.1's own precedent that a fully opted-out student is never fully silent \*inside\* Kairo, only

outside it). This keeps the student's mental model accurate rather than leaving them to guess whether turning something off here means losing the underlying feature.

## ## SECTION 8 — PRIVACY & DATA CONTROLS

## ### 8.1 Purpose

This section governs a student's control over their own data — leaderboard and cohort visibility, offline/sync behavior, and account-level data rights (export, deletion) — consistent with Section 2.6's standing that privacy controls are held to the same seriousness as academic data, not treated as a compliance afterthought.

## ### 8.2 Leaderboard and cohort visibility

A single, clearly-worded opt-in/opt-out control for cohort-based leaderboard participation (Learning Engine Phase 2 §8.4, Challenges Module §7.2's ranking context), defaulting to opted-out per the platform-wide standing rule that comparative content is never default-on (Learning Engine Phase 2 §7.2 rule 2, §8.4). Where a student is opted in, this control also lets them choose \*which\* cohort context they're visible within (a study group, a broad national pool, or none) where that granularity exists — mirroring the Challenges Module's own cohort-segmentation groundwork (Challenges Module §11.2, "Regional/Cohort Leaderboards") without expanding on it beyond what's already specified elsewhere. Turning this off removes the student from every leaderboard surface immediately, consistent with Section 2.5's "settings protect the student from the product" principle.

## ### 8.3 Offline and sync settings

A lightweight control surface over the offline-first behavior already fully specified at the infrastructure level (Practice Module §8.2, Question Experience §11.1, CBT Exam Mode §5.9) — primarily a visibility and troubleshooting aid rather than a place with many genuine choices to make, since offline-first behavior is largely automatic by design. What this screen does offer: a manual "sync now" action for a student who wants to confirm their offline work has landed, and a plain, honest display of last-sync status. It does not offer a toggle to disable offline caching entirely, since doing so would work against the student's own interest in a low-connectivity context (TECHMED Brand Overview §10.8) without solving any real problem a student credibly has.

## ### 8.4 Data export

Consistent with the same right-to-access principle implicit in Notifications §10.6's data-retention discipline, a student can request an export of their own data — attempt history, Knowledge Map summary, consent records — delivered through the Account & Administrative channel

(Notifications §3.5, §6.2's guaranteed-delivery tier) rather than left pending indefinitely. This is framed plainly, without upsell or friction, as a standing right rather than a favor.

## ### 8.5 Account deletion and the right to be forgotten

Directly implements Notifications §10.6's already-specified deletion behavior at its student-facing entry point: initiating deletion here purges stored channel identifiers and Identity data per that section's standard, while retaining the minimal fact that a deletion occurred (to prevent an accidental future re-contact attempt from a system that no longer remembers why it shouldn't). This screen states that distinction honestly rather than promising a total, systemless erasure the underlying architecture doesn't actually provide — consistent with Section 2.5 and the Branding Standard's own credibility principle (TECHMED Branding Standard §13) that Kairo does not manufacture reassurance it can't back up. Given the stakes, this action carries the same explicit confirmation discipline as Section 7.2 item 5's full-stop control, scaled up appropriately (a typed confirmation or equivalent deliberate step, not a single tap).

## ### 8.6 What Privacy & Data Controls never does

It never buries the deletion or export controls behind more than one additional tap from this screen's main view — mirroring Section 2.5's principle that these controls exist to give the student power \*over\* the product, and a hard-to-find control fails that purpose regardless of its underlying correctness. It never uses dark-pattern framing (a pre-selected opt-in, a deliberately confusing double-negative toggle) anywhere on this screen, consistent with the Branding Standard's explicit rejection of manufactured proof or manipulative design (TECHMED Branding Standard §13, §17).

## ## SECTION 9 — LANGUAGE, REGION & DISPLAY PREFERENCES

## ### 9.1 Purpose

This section is the student-facing control for the Student Intelligence Model's dormant "Language/region context" field (Student Intelligence Model §1) and the rendering-locale mechanics already specified at the Notifications level (Notifications §9). It governs \*framing\*, never underlying fact, consistent with that field's own original scoping.

## ### 9.2 What is controllable here

A single, clearly-explained preference for regionally-natural phrasing (Notifications §9.4) — framed to the student honestly as shaping \*how Kai talks\*, not \*what Kai teaches\*: "This helps Kai's explanations feel more natural to you — it doesn't change what you're being taught." This directly protects the boundary Notifications §9.2 and the Subject Knowledge Graph's own field definition already establish: local framing is never a proxy for ability, and this screen's copy makes that explicit rather than leaving it implicit.

## ### 9.3 What is not controllable here

Full alternate-language rendering (beyond regionally-natural English phrasing) is explicitly named as a future capability where it does not yet exist (Notifications §9.4, §14), rather than offered as a toggle that silently does nothing or falls back unexpectedly — consistent with the platform-wide honesty standard against manufacturing depth that isn't there (Subject Knowledge Graph §10.1's sparse-content precedent, restated here for a sparse-feature case instead).

## ### 9.4 Display preferences

Text size and, where platform-supported, high-contrast rendering — kept minimal and functional, consistent with the Kairo Visual Identity's own accessibility floor (Kairo Visual Identity Part 3, 48px touch targets, WCAG AA contrast) rather than introducing a large cosmetic theming system this module has no architectural reason to own.

## ### 9.5 What this section never does

It never conflates region/language preference with academic content difficulty or assumed ability (Section 9.2's boundary, restated as a hard "never"). It never infers a linguistic preference from a student's name, school, or location without an explicit signal (Notifications §9.6's identical standing rule, inherited unchanged here).

## # KAIRO PROFILE & SETTINGS

\## Product Specification — Part 4 of 4: Sections 10–12 & Executive Summary

\*(Continues directly from Part 3 — Sections 7–9. Closes the specification with Personalisation & Governance, Edge Cases, Future Scalability, and the Executive Summary.)\*

## ## SECTION 10 — PERSONALISATION & GOVERNANCE

## ### 10.1 Governing principle

Profile & Settings personalises less than any other module in Kairo, and deliberately so. Every other module reads Macro-State, Emotional Profile, and Journey Stage to calibrate tone and pacing (DDE §10, Learn Module §8, Review Module §8, Insights §7.5, Notifications §8.2). This module reads almost none of that, because its job is administrative, not mentoring (Section 4.2's register distinction) — a student correcting their target university should see the same plain, calm screen regardless of whether they're in Compounding or Wavering. Where personalisation does apply, it is narrower and more structural than anywhere else in Kairo, and this section defines the full, short list of what it actually touches.

## ### 10.2 What is personalised

\*\*Field defaults on first visit.\*\* Preferred study duration and preferred study period (Section 5.3) default to the Behaviour Profile's inferred values where enough session history exists (Student Intelligence Model §3), exactly as Practice's own Session Creation defaults already do (Practice Module §4.4) — a student never fills these in from a blank slate if Kairo already has an honest read on their rhythm.

\*\*Achievement grid emphasis.\*\* Section 6.3's badge grid may lead with the category most recently active for a given student (e.g., a student mid-CBT-mock-streak sees CBT badges surfaced slightly higher) — a display-ordering convenience only, never a filter that hides other categories, consistent with Section 6.4's rule that the record stays complete and student-uneditable.

\*\*Language/region framing suggestion.\*\* Where a genuine signal exists (an explicit prior preference, per Section 9.2), Section 9's control is pre-set to reflect it rather than defaulting to a blank choice — never inferred from name, school, or location (Section 9.5), only from what the student has already told Kairo.

## ### 10.3 What is never personalised

Consequence messaging (Section 5.2–5.3), the confirmation friction on high-stakes fields (exam year, subject combination, full-stop, account deletion), and every piece of copy on the Account Settings screens (Sections 7–9) render identically for every student regardless of Macro-State, Emotional Profile, or Journey Stage. This is a deliberate, hard boundary: administrative clarity does not flex for mood the way Kai's coaching voice does elsewhere, because a student in a fragile emotional state deserves \*more\* certainty about what a setting does, never a softened or vaguer version of the same fact. This mirrors the Emotional Profile's own standing hard boundary against being used for anything beyond tone-softening in contexts where it's permitted at all (Student Intelligence Model §4, SJEE §8.5) — Profile & Settings simply falls outside that permitted scope entirely.

## ### 10.4 Governance and admin visibility

Mirroring the audit and role-separation discipline already established for Notifications (Notifications §12.6–12.7) and Challenges (Challenges Module §10.5): every Layer 1 and Layer 2 change a student makes here is logged with a timestamp and prior value, readable by TECHMED support roles for the same dispute-resolution and diagnostic purposes Notifications §12.4's per-student history view already serves — never surfaced to other students, never used for anything beyond support and integrity purposes, and never editable by an admin on the

student's behalf without the student's own action initiating it, consistent with Section 2.5's principle that this module exists to give the student power over the product, not the reverse.

## ### 10.5 What governance never does

It never allows a TECHMED admin to silently change a student's declared Identity or consent state — an admin can view, diagnose, and (where a student explicitly requests help, e.g., a support ticket) walk a student through making a change themselves, but Layer 1 and Layer 2 remain the student's own hand on the pen (Section 1.1), even when TECHMED staff are directly assisting.

## ## SECTION 11 — EDGE CASES

## ### 11.1 A student changes exam year mid-journey (repeat candidate)

Handled per Section 5.3's confirmation-gated flow and consistent with the standing rule already established at the Learning Engine level (Learning Engine §12) and the Product Experience Blueprint's own Profile edge case (Product Experience Blueprint §8): the historical Knowledge Map is preserved in full, never discarded, and the new exam year simply re-scopes what's \*active\* going forward — a "new season" framing is applied on top where motivationally appropriate (Learning Engine §12), but the underlying data survives intact.

## ### 11.2 A student removes their entire subject combination down to zero subjects

Setup and every downstream module assume at least one active subject at all times (Content Map scoping, Subject Knowledge Graph §2.1; CBT Mode's default scope, CBT Exam Mode §4.4). The Goals Screen does not permit saving a fully empty combination — attempting to remove the last remaining subject surfaces a plain, honest block ("You need at least one active subject — add one before removing this") rather than allowing a save that would leave every downstream system with nothing to scope against.

\### 11.3 A student sets a target UTME score below their current demonstrated performance

Per Section 2.1's non-negotiable rule, the declared target is never edited or blocked by Kairo regardless of how it compares to current Exam Readiness data — the Goals Screen accepts the value as entered. Where the gap is unusually large in either direction, Insights' own existing framing (Insights §9.2–9.3) is where that honest context gets surfaced later, in its proper reflective register — never here, and never as a blocking validation message.

\### 11.4 A student toggles Exam-Critical notifications off

Because this category carries genuine safety weight (scheduled mock start times, exam-window reminders — Notifications §3.1), Section 7.2's category toggle for it is permitted (per the same student-sovereignty principle governing every other category) but surfaces a plain, single-sentence consequence note before confirming — not a block, consistent with Section 7.3's ban on guilt-adjacent friction, but an honest heads-up ("You won't get reminders before scheduled mocks or exam-window alerts") so the choice is genuinely informed rather than a default the student never considered.

## ### 11.5 A student requests data export or deletion while mid-session elsewhere

Both actions (Section 8.4–8.5) are handled asynchronously and never interrupt or invalidate an in-progress Practice, CBT, or Learn session elsewhere in the product — a deletion request begins the process defined in Notifications §10.6 but does not retroactively corrupt session state the student is actively using; any live session simply completes normally before the account-level change takes full effect.

## ### 11.6 A student's declared Identity conflicts with data inferred elsewhere

Where a Behaviour Profile signal (Student Intelligence Model §3) appears to contradict a declared field — for instance, session timestamps suggesting a different preferred study period than the one explicitly set — Section 2.1's rule holds without exception: the declared value governs, and the inferred signal is never used to silently override it. The Goals Screen may, at most, surface this gently as a suggestion ("Your sessions often happen in the evening — want to update your preferred study period to match?"), always requiring the student's own confirmation, never an automatic change.

## ### 11.7 A shared or multi-device household

Mirroring the identical multi-device data-architecture requirement already established at the Learning Engine level (Learning Engine §11) and restated for consent specifically at the Notifications level (Notifications §13.3): Profile & Settings state is tied to the authenticated account, never the device, so switching users on a shared device never leaks one student's Identity, consent, or achievement record into another's view.

## ### 11.8 A student wants to revert a recent change

There is no dedicated "undo" mechanism, but because every Layer 1 field is simply re-editable (Section 5) and Layer 2 toggles are simply re-toggleable (Section 7), reverting is always just making the same edit again — the Goals Screen and Account Settings never treat a field as locked after a single change, consistent with Section 2.3's rule that nothing here is a hard gate.

## ### 11.9 Sparse or missing Behaviour Profile data for default personalisation

Per Section 10.2's own scoping, where insufficient session history exists to infer a study duration/period default, the field simply renders with a sensible platform default (mirroring Practice Module §4.4's identical fallback) rather than an empty or broken-looking input — consistent with the honesty-over-padding discipline already established everywhere else in Kairo (Home Dashboard §7, Learn Module §4.5).

## ## SECTION 12 — FUTURE SCALABILITY

Profile & Settings is deliberately structured so the following attach without requiring this specification to be redesigned:

\*\*New Identity fields.\*\* Per Section 3.6, a new declared field slots into Layer 1 with its own row in the Section 3.4 consequence-map table — a documentation and routing exercise, never a new module.

\*\*New consent categories.\*\* A new Notification category or channel (Notifications §14's own anticipated extensions) renders as a new row in Section 7.2's category or channel lists, inheriting the identical toggle mechanics and default-off-for-existing-students rule (Section 7.3) automatically.

\*\*Parent Dashboard activation.\*\* Section 3.4's dormant Parent/guardian contact field and Section 5.3's honest "doesn't send anything yet" framing are the exact anticipation point already flagged at the Student Intelligence Model level (§1, §9) and the Insights level (§11) — when built, the Parent Dashboard consumes this field without requiring Profile's own capture flow to change, only its framing copy to be updated to reflect the now-live feature.

\*\*Full alternate-language rendering.\*\* Section 9.3 already scopes this as a defined future extension — when built, it attaches as a new selectable option within the existing Section 9.2 control, never a new screen.

\*\*Regional/cohort leaderboard granularity.\*\* Section 8.2's cohort-visibility control already anticipates the Challenges Module's own future cohort segmentation (Challenges Module §11.2) — richer cohort options extend the existing control's choice set, not its underlying mechanism.

\*\*Institutional or school-linked accounts.\*\* Should TECHMED extend Kairo into school-partnered contexts, a school-affiliation field would attach to Layer 1 alongside target university/course, with its own consequence-map row (visibility to a school-facing dashboard, mirroring the Parent Dashboard's own consent-gated pattern) rather than requiring new architecture.

\*\*Multi-year / repeat-candidate season framing.\*\* Section 11.1 already establishes the data-preservation behavior; a richer "new season" UI treatment (distinct visual framing for a repeat candidate's Goals Screen, for instance) is a future presentation-layer refinement over already-durable data, consistent with the append-only principle governing every other module's own multi-year anticipation (Learning Engine §12, Review Module §11, CBT Exam Mode §11).

The general principle, consistent with every other Kairo architecture document: each of these is a new \*consumer\* of Profile & Settings' existing structure, not a reason to change it.

## ## EXECUTIVE SUMMARY

## ### What Profile & Settings is

Profile & Settings is the one module in Kairo where the student, not the Intelligence Engine, holds the pen. Every other module infers, computes, recommends, and adapts. This one asks, records, and honors. It is the sole editable surface for Student Identity, the sole home for notification and privacy consent, and the permanent, honest record of everything a student has genuinely earned.

## ### The architecture in one line

A three-layer model — declared Identity, consent & preference, and read-only reflection (Section 3.2) — where every Layer 1 and Layer 2 change is mapped to an explicit, honestly-stated downstream consequence (Section 3.4), and Layer 3 renders the same cross-module achievement log every other surface already reads, stripped of narrative voice.

## ### The non-negotiable standard

Every screen in this module must pass the same test posed at its opening: if a student changes one thing about themselves here, does the rest of Kairo honor that change honestly, immediately, and without surprise? A settings screen that quietly reverts a preference, silently overrides a declared goal with an inferred one, or manufactures friction where none is warranted has failed this module's actual purpose regardless of how polished it looks.

## ### Why this module matters disproportionately

Every other Kairo specification has argued that its module is where a particular promise gets kept — Practice builds mastery, Review earns Reinforced, Insights turns data into self-understanding, Notifications carries Kairo's voice beyond the screen. Profile & Settings is where a different, quieter promise gets kept: that a student is never a passenger in their own data. TECHMED's own founding belief — that a student should never have to figure things out alone — has an inverse that matters just as much: a student should never feel like Kairo is figuring \*them\* out without their consent or their say. This module is where that trust is either earned in full or quietly eroded, one setting at a time.

\*\*Think Smart. Perform Elite.\*\*
