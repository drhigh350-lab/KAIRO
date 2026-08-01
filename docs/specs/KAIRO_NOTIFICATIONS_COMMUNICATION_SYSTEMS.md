# # KAIRO NOTIFICATIONS & COMMUNICATION SYSTEMS ## Product Specification — Part 1 of 4: Sections 0–4

\*(Builds on the KAIRO Learning Engine — Phase 1 & 2 — the Student Intelligence Model, the Question Intelligence Model, the Subject Knowledge Graph, the Daily Decision Engine, the Product Experience Blueprint, the Home Dashboard, the Practice Module, the Question Experience, the Learn Module, the Review Module, CBT Exam Mode, the Challenges Module, Insights, and the Student Journey & Engagement Engine. Does not redesign any of them. The SJEE already defined the Notification Orchestrator — the arbitration layer that decides, from candidates submitted by every other module, what reaches a student, in what order, and how often (SJEE §5). This document does not re-decide any of that. It defines what the Orchestrator's decisions actually become once they leave Kairo: the full taxonomy of what Kairo ever says outside a session, the channels it says it through, and the infrastructure that makes every one of those messages sound like the same organisation speaking, regardless of which module triggered it.)\*

## ## 0. THE GOVERNING QUESTION

Every subsystem below exists to answer one question, continuously, per message, before it ever reaches a device:

\*\*If a student saw only this one notification, with no other context, would it still sound like Kairo — clear, specific, and worth their attention — or does it only make sense because we know everything that produced it?\*\*\*

Not: how do we get this message delivered. Not: which channel has the best open rate. \*\*Does this message, standing completely alone on a lock screen or in a WhatsApp thread, do the one job a notification is allowed to do — tell the student something true and useful, in a voice they'd recognise?\*\*

If a design decision can't be traced back to that question, it doesn't belong in this document.

## ## SECTION 1 — PRODUCT PURPOSE

## ### 1.1 What this module is

The Notifications & Communication Systems module is Kairo's \*\*execution and infrastructure layer\*\* for everything that reaches a student outside an open session. The SJEE's Notification Orchestrator (SJEE §5) already decides \*whether\* a candidate notification should exist, \*which one wins\* when several compete, and \*how often\* a student hears from Kairo at all. This

module picks up immediately after that decision is made: it defines the complete catalogue of message types Kairo is capable of sending (Section 3), the channels each one can travel through and why (Section 4), the content and template system that keeps every message on-voice regardless of which module authored it (Part 2), the technical delivery infrastructure that makes messages arrive reliably even under Nigeria's variable connectivity conditions (Part 2), and the personalisation, localisation, and compliance layers that govern the whole system (Part 3).

Where the SJEE answers "should Kairo say something right now, and about what," this module answers "given that it should, what exactly does it say, through which channel, in what format, and how do we guarantee it actually arrives and reads correctly."

## ### 1.2 What this module is explicitly not

This is not a second Orchestrator. The priority tiers, frequency budget, gap-severity ladder, and tone floor already fully specified at SJEE §5–6 are binding here without modification — this document consumes those decisions, it does not re-litigate them. Where SJEE §5.4 already established that a notification is checked against Kai's tone rules "exactly as if Kai were speaking it directly," this document is where that check becomes a concrete, enforceable content-QA gate (Part 2) rather than a stated principle.

This is also not the Insights Module restated. Insights is a destination a student navigates to and reflects inside (Insights §1). This module is what pulls a student's attention \*toward\* a destination from outside it — a Weekly Review's existence is Insights' concern; the notification that says "your Weekly Review is ready" is this module's concern.

Nor is this the Challenges Module's own discovery layer restated (Challenges §4). Challenges already defined its own discovery surfaces, including push and in-app notification behaviour specific to challenge cadence. This document does not redesign that — it absorbs Challenges' notification candidates into the same taxonomy (Section 3) and the same channel infrastructure (Section 4) every other module's candidates already flow through, so that a Challenge notification and a Review notification are, from the delivery system's point of view, the same kind of object with different content — never two parallel notification systems that happen to share a device.

## ### 1.3 Relationship to the Notification Orchestrator

The relationship is strictly sequential and one-directional in authority:

Any module generates a candidate (content + intent)
↓
SJEE Orchestrator decides: send / hold / discard, priority tier, timing window (SJEE §5)
↓

```txt
[THIS MODULE] resolves: which channel, what exact rendered content, what template, what language/locale, what device/connectivity handling, delivery confirmation, and interaction logging
↓
Message reaches the student
↓
Interaction outcome (opened, dismissed, acted-upon, ignored) logged back
↓
Feeds SJEE §5.8's per-candidate-type learning loop
```

This module never overrides an Orchestrator decision to send, hold, or discard — that authority belongs entirely to SJEE §5. What this module owns is everything the Orchestrator's own specification deliberately left as "elaborated elsewhere": the actual channel selection logic beyond SJEE §5.9's high-level table, the content template system, the multi-channel infrastructure (push, in-app, email, SMS, WhatsApp), and the compliance layer none of the prior documents needed to address because none of them were responsible for \*sending\* anything themselves.

## ### 1.4 Why WhatsApp requires its own first-class treatment here

Every prior TECHMED and Kairo document has named WhatsApp as more than an incidental channel — the TECHMED Brand Overview identifies the WhatsApp ecosystem as simultaneously "a community... a communication channel... a distribution engine... a growth mechanism... a retention layer... a place where students already spend time" (TECHMED Brand Overview §9.4), and Challenges' entire virality loop is architected around WhatsApp/Telegram sharing as its primary growth mechanic (Challenges §8). No prior document, however, specified WhatsApp as a formal notification \*channel\* Kairo sends through — only as a destination content gets shared \*to\*. This module is where that gap closes: WhatsApp is treated in Section 4 as a genuine, first-class delivery channel with its own rules, distinct from push notifications, because for a meaningful share of TECHMED's audience it is the channel with the highest trust and the lowest friction, not a fallback.

## ### 1.5 The one-sentence purpose statement

\*\*This module exists to make sure that everything Kairo ever says to a student outside an active session — however it's decided, whatever module it came from, whatever channel it travels through — sounds like the same trustworthy voice, arrives reliably even on a bad connection, and never asks the student to do more work to understand it than the Orchestrator already promised it would.\*\*

The SJEE already established the governing tone floor (SJEE §6.4), the frequency budget (SJEE §5.6), and the restraint-over-presence principle (SJEE §2.3). This section adds only what is genuinely new at the communication-systems layer: how voice and trust survive translation across channels and formats.

## ### 2.1 One voice, many surfaces

A push notification, a WhatsApp message, an email, and an in-app badge are different \*formats\*, never different \*personalities\*. A student who receives a WhatsApp message from TECHMED and, minutes later, an in-app notification inside Kairo should experience both as the same speaker — this is the communication-layer expression of the Branding Standard's own consistency mandate: "a student should be able to encounter TECHMED in different places and still recognise the same organisation" (TECHMED Branding Standard §12, Public Representation Standard, "Consistent"). Section 4 defines format constraints per channel; none of them are licence to shift tone.

## ### 2.2 Brevity is not a push-notification-only constraint

Every channel in this module, including email and WhatsApp — which technically permit far more text than a push notification's character limit — is held to the same brevity discipline a push notification enforces by necessity. A long email is not a more thorough message; it is a message that assumes the student has more attention to spare than a notification-worthy moment actually warrants. This directly extends the Learn Module's own governing constraint that short, focused content beats long reading (Learn Module §2.3) to the communication layer: if a message needs paragraphs to make its point, the point belongs inside the app (Insights, Review, a Learn lesson), and the outbound message's only job is to point there.

## ### 2.3 A message is a door, not a destination

No notification, on any channel, is designed to be the end of the interaction. Every message this module sends exists to open a door back into the product — a specific screen, a specific session, a specific piece of content already fully specified elsewhere (Practice, Learn, Review, Insights, Challenges). This module never duplicates content that lives natively inside the app; it only ever summarises and links to it. A notification that tries to \*be\* the Weekly Reflection instead of announcing it has failed this principle regardless of how well-written it is.

## ### 2.4 Channel choice is a trust decision, not just a delivery-optimisation one

Different channels carry different implicit weight for a Nigerian student audience specifically. A push notification is low-commitment and easily dismissed. An in-app badge is invisible until the student is already inside the product, asking nothing of them externally. WhatsApp — per the Brand Overview's own audience psychology section, noting students "consume large amounts of WhatsApp content" and are "influenced by peers and community" (TECHMED Brand

Overview §6, Audience Psychology) — carries the highest relational weight of any channel Kairo has access to, closer to a message from a trusted person than a system notification. This module treats channel selection accordingly: WhatsApp is reserved for messages that earn that weight (Section 4.5), never used simply because it has better deliverability than push.

## ### 2.5 Reliability is part of the message

A notification promising something ("your mock results are ready") that fails to open correctly, arrives hours late due to a delivery fault, or links to a broken screen does more damage to trust than not sending it at all — this extends the Brand Overview's own standing principle that "technical reliability is part of trust" (TECHMED Brand Overview §16) specifically to the communication layer, where a broken deep link or a duplicate, stale message is functionally the same trust failure as a login bug.

## ## SECTION 3 — NOTIFICATION TAXONOMY

This is the complete catalogue every module's candidates map onto. Every notification Kairo ever sends belongs to exactly one category below — a category a module cannot invent for itself; new notification needs are proposed as a new \*instance\* within this taxonomy (Part 4 covers governance), never as a parallel type outside it.

## ### 3.1 The eight categories

| Category | Purpose | Representative sources | Typical Orchestrator tier (SJEE §5.5) | ---|---|---|---|

| \*\*Academic Nudges\*\* | Time-sensitive learning signal — something is due, fading, or newly relevant | Urgent Decay (Learning Engine §5), Review backlog (Review Module §4.3), a Critical gap (Subject Knowledge Graph §8.2) | Standard |

| \*\*Motivational & Consistency\*\* | Supports rhythm without pressure — Momentum Streak slack, consistency-adjacent encouragement | Motivation Engine (Learning Engine Phase 2 §8.1) | Informational |

| \*\*Milestone & Celebration\*\* | Genuine, earned recognition of a real inflection point | Cross-module milestones (SJEE §7), Wisdom Spark-worthy moments (Learning Engine Phase 2 §7.6) | Informational |

| \*\*Community & Social\*\* | Event-based, opt-in-weighted, tied to shared or communal moments | Challenges discovery (Challenges §4.2), Official TECHMED Mock Events (CBT Exam Mode §3.8) | Low, opt-in-weighted |

| \*\*Re-engagement & Win-back\*\* | Invitation back after an absence, calibrated by gap severity | SJEE §6's full ladder | Standard / dedicated win-back sequence |

| \*\*Exam-Critical\*\* | Time-critical, tied to a commitment the student already made | Scheduled mock start, exam-window reminders (CBT Exam Mode §3.8), UTME Recap arrival (Insights §10) | Time-critical |

| Milestone & Celebration | Rare, specific, evidence-backed — SJEE §7.6's anti-generic-praise standard applies verbatim |

| \*\*Account & Administrative\*\* | Non-marketing, functionally necessary — security, sync status, data-integrity notices | Auth events, sync-conflict resolution notices (Learning Engine §11) | Outside SJEE arbitration entirely (Section 3.5) |

| \*\*Editorial & Broadcast\*\* | TECHMED-authored content distinct from Kairo's own personalised signal — campaign moments, UTME-calendar updates, community content | TECHMED 2027 campaign phases (TECHMED 2027 §6), 5 Minutes Forward episode drops | Governed separately (Section 3.6) |

## ### 3.2 Why eight categories, and not fewer

A flatter taxonomy (e.g., simply "urgent" vs. "not urgent") would collapse distinctions the rest of the architecture already depends on — Milestone content and Academic Nudge content both might carry Standard urgency in a given week, but they require entirely different tone, channel bias, and QA treatment (a milestone is never framed with any hint of obligation; an Academic Nudge always names a concrete next action). Eight is the point at which every category maps to a genuinely distinct \*voice posture and channel bias\*, mirroring the Subject Knowledge Graph's own justification for its seven-level hierarchy: each level earns its existence because a different downstream system consumes it differently (Subject Knowledge Graph §2.3).

## ### 3.3 Category-to-voice mapping

\### 3.4 Category exclusivity and the single-category rule

Every notification instance belongs to exactly one category, never two blended into one message. A candidate that seems to straddle categories (e.g., "your Momentum Streak reached 30 days, and here's a Challenge to celebrate it") is not merged — it is split into a Milestone notification and, separately and only if the Orchestrator's own frequency budget has room, a Community candidate, submitted as two distinct candidates competing normally rather than one hybrid message that dilutes both (this directly extends SJEE §5.10's standing rule against notification-stacking to category composition, not just volume).

## ### 3.5 Account & Administrative — outside SJEE arbitration

Unlike every other category, Account & Administrative notifications (password changes, new-device login confirmations, sync-conflict resolution requiring student input, data-export confirmations) do not pass through the Orchestrator's priority tiers or frequency budget at all — they are functionally necessary, never marketing or motivational in character, and are sent immediately and reliably regardless of how many other notifications the student has received that day. This mirrors SJEE §9.7's own carve-out for "genuinely account-critical, non-marketing communication," restated here as the category's defining boundary rather than an exception buried in an edge case.

## ### 3.6 Editorial & Broadcast — a distinct governance track

Campaign-phase content (TECHMED 2027 §6's seven-phase campaign architecture), UTME calendar/registration updates, and 5 Minutes Forward episode drops are authored and scheduled by TECHMED's content and marketing layers, not generated as candidates by Kairo's own Learning Engine or Student Intelligence Model. This module still routes them through the same channel infrastructure (Section 4) and the same reliability guarantees (Part 2) — but their \*content\* is never subject to Layer 2 interpretation the way an Insights-sourced or SJEE-sourced message is (mirroring the boundary SJEE §6.7 and §10.5 already draw between Kairo's product-level orchestration and TECHMED's marketing channels). Editorial & Broadcast messages are still checked against the platform-wide tone floor (Branding Standard §10–11) but are exempt from the Orchestrator's per-student frequency budget, since they are addressed to TECHMED's broader audience, not individually arbitrated per student the way Kairo's own candidates are — Part 3 defines the separate, lighter-touch frequency governance this category uses instead.

## ## SECTION 4 — CHANNEL ARCHITECTURE

\### 4.1 The channel roster

| Channel | Core character | Primary use |
|---|---|---|

| \*\*Push notification\*\* | Low-commitment, interruptive, ephemeral | Time-critical and Standard-tier candidates the student hasn't opted out of (SJEE §5.9) |

| \*\*In-app badge / notification centre\*\* | Passive, non-interruptive, persistent until viewed | Informational-tier content, Low-tier content for students who've shown push-ambivalence (SJEE §5.9) |

| \*\*WhatsApp\*\* | High-trust, relationship-weighted, rich-media capable | Milestone shares, high-value Community candidates, Editorial/Broadcast content, win-back sequence's broadened-channel stage (SJEE §6.6) |

| \*\*Email\*\* | Low-frequency, archival, detail-tolerant | Account & Administrative notices, Monthly/UTME Recap arrival announcements, extended-absence win-back (SJEE §6.6) | \*\*SMS\*\* | Universal reach, connectivity-independent, minimal formatting | Exam-Critical time-sensitive alerts where push/data reliability is uncertain; Account & Administrative security codes |

## ### 4.2 Why five channels, not a single unified one

Nigerian students' access to each channel varies independently — a student may have unreliable mobile data (undermining push and in-app reliability at the moment it matters most) while WhatsApp, which many carriers zero-rate or bundle cheaply, remains reachable; another student may have a personal email they check rarely but a WhatsApp number checked constantly. This is the direct communication-layer expression of the Brand Overview's own offline-first commitment — "which parts of the student journey must work offline, which should work offline, and which genuinely require an internet connection" (TECHMED Brand Overview §4.2) — reframed here as a channel-selection question rather than an in-app one.

## ### 4.3 Push notification specifics

\- \*\*Format constraint:\*\* title + body only, no rich media, treated as the strictest test of Section 2.2's brevity discipline — if a message can't survive a push notification's character limit and still make sense, it is very likely the wrong content for \*any\* channel, not just this one.

\- \*\*Deep-linking requirement:\*\* every push notification carries a deep link into the exact screen its content refers to (a specific Learn lesson, a specific Review category, Insights' Weekly Review) — never a generic app-open with no destination, per Section 2.5's reliability-as-trust principle.

\- \*\*Never used for:\*\* Editorial & Broadcast content aimed at non-active or lapsed users (Section 4.5 covers this population separately), Account & Administrative codes requiring guaranteed delivery (SMS is more reliable for this specific function, Section 4.6).

## ### 4.4 In-app badge / notification centre specifics

\- The lowest-friction channel in the roster — never competes for the Orchestrator's frequency budget (SJEE §5.6) since it asks nothing of the student until they are already inside the product.
- Functions as the durable record: every notification sent through any channel is also logged here, so a student who dismissed a push notification without reading it can still find it later — no message is ever fully lost once sent, mirroring the append-only principle already established for attempt history (Student Intelligence Model §2) applied to communication history.
- The correct default channel for Milestone & Celebration content specifically (SJEE §7.5 already established that milestones are best delivered "inside the next natural session" rather than pulling a student in externally) — the badge is what makes a milestone visible the moment a student arrives on their own terms.

## ### 4.5 WhatsApp specifics

\- \*\*Reserved use, not default use.\*\* Given Section 2.4's trust-weighting principle, WhatsApp is used for: (a) Editorial & Broadcast content the student has explicitly followed a TECHMED WhatsApp channel/community for, (b) the broadened-channel stage of extended-absence win-back (SJEE §6.6) where a student has explicitly provided and opted into WhatsApp contact, (c) shareable Milestone and Monthly/UTME Recap artifacts the student is \*sending\*, not artifacts Kairo is pushing unprompted (Insights §6.5–6.6 already establish this content is student-shared, not system-broadcast).

\- \*\*Never used for:\*\* routine Academic Nudges or Standard-tier Review/Practice reminders — these stay inside push/in-app, since WhatsApp's relational weight would be devalued by routine, high-frequency use exactly the way an over-firing Wisdom Spark loses its meaning (Learning Engine Phase 2 §7.6's rarity principle, applied here to channel weight rather than a visual symbol).

\- \*\*Rich media support:\*\* the one channel in the roster where a full branded result/achievement card (Challenges §8.2) or a Monthly Wrapped card (Insights §6.4) renders natively and well — this is a deliberate technical fit, not a coincidence, since WhatsApp is also the platform's primary organic growth surface (Challenges §8.4).

## ### 4.6 Email specifics

\- Lowest-frequency channel by design — reserved for content with genuine archival value (Account & Administrative confirmations a student may need to reference later) or content where a longer attention window is realistically available (a Monthly Review "ready" announcement, sent once a month, is an appropriate email cadence in a way a daily Academic Nudge never would be).

\- Never the primary channel for time-sensitive content — email's delivery and open-rate reliability for this audience is treated as lower and slower than push, WhatsApp, or SMS, consistent with the Brand Overview's audience note that "a first-time student should not have to figure everything out alone" applied to channel choice: email should never be the \*only\* channel carrying something a student genuinely needs to see promptly.

## ### 4.7 SMS specifics

\- The connectivity-independent fallback — used specifically where a message is both time-critical (Section 3.1) and where data-connectivity failure would be a real, non-trivial risk (a scheduled Official TECHMED Mock Event start time, an exam-window reminder in the

Culmination journey stage where SJEE §8.2 already mandates near-zero notification volume but the few messages that do go out must land reliably).

\- Also the designated channel for Account & Administrative security codes specifically (verification codes, password-reset confirmations), since SMS delivery for this narrow function is a more dependable guarantee than push notification delivery, which depends on the app having a live token and the device having current connectivity.

\- Never used for ordinary Academic Nudges, Motivational content, or anything carrying real per-character cost at scale without a correspondingly strong reliability justification — SMS is the most expensive channel per message and is reserved accordingly.

## ### 4.8 Channel fallback logic

Where a Time-critical candidate (SJEE §5.5) is queued and the student's primary channel for that candidate type shows a recent delivery failure or low-connectivity signal (mirroring CBT Exam Mode §4.7's own device/connectivity check), the system escalates to the next most reliable channel for that specific message rather than simply retrying the same channel repeatedly — push failing escalates to SMS for genuinely Exam-Critical content; it never silently escalates to WhatsApp without the student having explicitly opted that channel in for this purpose (Section 4.5's reserved-use principle holds even under fallback pressure). Full fallback sequencing and retry timing is specified in Part 2's infrastructure section.

## ### 4.9 What channel selection never does

It never uses a higher-friction, higher-trust channel (WhatsApp, SMS) simply because a lower-friction one (push) has a lower open rate for that student — channel selection is governed by message category and student-provided consent, never by a raw engagement-optimisation instinct, which would directly violate the Learning Engine's own standing refusal to optimise for engagement as an end in itself (Learning Engine §4.3, restated at SJEE §2.1). A student who consistently ignores push notifications is not "escalated" to WhatsApp as a workaround — that pattern is read by SJEE §5.8's dismissal-learning logic and results in \*less\* contact of that candidate type, never a channel upgrade the student never asked for.

## # KAIRO NOTIFICATIONS & COMMUNICATION SYSTEMS

\## Product Specification — Part 2 of 4: Sections 5–7

## ## SECTION 5 — CONTENT & TEMPLATE SYSTEM

## ### 5.1 Purpose

Section 3 defined \*what kind\* of thing every notification is; this section defines \*how its actual words get produced\* — the system that guarantees a Practice-sourced Academic Nudge, a Review-sourced backlog alert, and an Insights-sourced Weekly Review announcement all

sound like the identical speaker, without requiring every module's engineers to independently re-derive Kai's tone rules each time they generate a candidate. Consistent with every prior module's own standing discipline (Learn Module §7.1, Review Module §7.1, SJEE §11.1): this system computes no new intelligence. It renders intelligence already produced elsewhere into compliant, channel-appropriate text.

## ### 5.2 The template architecture

Every notification is assembled from three layers, mirroring — and consuming — the three-layer model already established at Insights §3.2:

\*\*Layer 1 — Data payload.\*\* The raw facts a candidate carries: which concept, which subject, what count, what date, what score delta. Supplied entirely by the originating module (Learning Engine, Review, Insights, Challenges, SJEE) — this module never invents a fact.

\*\*Layer 2 — Message template.\*\* A category-specific, slot-based structure (Section 5.4) that determines \*shape\*: what must be named, in what order, with what mandatory components (per Section 5.5's Kai-voice checklist). One template family exists per notification category (Section 3.1) — never per module, since two different modules producing an Academic Nudge (say, Review's backlog alert and the Learning Engine's Urgent Decay alert) must render through the identical template family to guarantee they read as the same kind of message.

\*\*Layer 3 — Rendering.\*\* Locale, channel-format constraints (Section 5.6), and personalisation substitution (Part 3) applied last, producing the final string(s) actually delivered.

This mirrors the Insights Layer 1/2/3 split precisely, and deliberately: a system that has already proven this separation prevents both a "raw numbers dump" failure and an "empty generic encouragement" failure (Insights §3.2) is the correct model to reuse here rather than invent a parallel one.

## ### 5.3 Why templates, not free-authored copy per notification

A module that hand-writes each notification's copy independently will, over time, drift from Kai's tone — this is not a hypothetical risk; it is the exact failure the SJEE Orchestrator's tone-compliance gate (SJEE §5.4) exists to catch \*after the fact\*. Templates move that enforcement earlier: a module cannot produce non-compliant copy in the first place if it can only populate defined slots inside a pre-approved structure. This is the communication-layer expression of the same principle the Question Intelligence Model already applies to explanations — "rules/template-driven for reliability and tone control... structured so a more generative... layer could later slot in underneath" (Learning Engine Phase 2 §12) — templates now, with a defined path for a more generative Layer 2 later (Part 4, Future Scalability).

\### 5.4 The template slot structure

Every template, regardless of category, is built from a maximum of five slots — fewer than five is common; more than five never happens, since a notification that needs a sixth slot has exceeded what any channel in the roster should be carrying (Section 2.2):

| Slot | Function | Mandatory? |

|---|---|---|

| \*\*Observation\*\* | The specific, true fact driving this message | Always |

| \*\*Reason\*\* | Why it matters right now (mirrors DDE §12.2's "name the observation, name the reason, name the benefit" pattern, restated at the notification layer) | Category-dependent (Section 5.5) |

| \*\*Benefit / Stakes\*\* | What acting on this gets the student, framed forward, never as loss-avoidance | Category-dependent |

| \*\*Action\*\* | The single next step, matched to a deep link (Section 4.3) | Always, except Account & Administrative informational notices |

| \*\*Voice marker\*\* | A closing register cue (warmth, calm, energy) that channels the correct Macro-State/Journey-Stage-calibrated tone (SJEE §7.5, §8.2) | Always |

A template never fills all five slots at push-notification length (Section 4.3) — push renders Observation + Action only, by necessity; WhatsApp and email may render all five where the category and channel combination warrants it (Section 5.6).

## ### 5.5 The Kai-voice compliance checklist

Before any rendered message leaves this system, every instance is checked against a fixed, non-negotiable list — the same checklist that governs Kai everywhere else in the product (Learning Engine Phase 2 §7.2), restated here as literal, automatable QA gates rather than a prose principle a human author must remember:

1. No standalone "wrong," "failed," "behind," or equivalent bare-judgment language (rule 1).

2. No comparative or ranking reference to other students, in any form, including implicit ones ("most students have already...") — this rule extends the ban on 1:1 comparative framing (rule 2) to notification copy specifically, where it is easy to smuggle in a percentile-shaped phrase without naming a specific student.

3. No guilt or loss-framing language — the explicit banned phrase list from SJEE §6.4 ("we miss you," "your streak is at risk," "don't lose your progress," any countdown-to-failure framing) is enforced verbatim, extended to every category, not only re-engagement.

4. No raw internal metric surfaced unexplained — a decay percentage, a raw retention\_state label, or a bare KAIRO Score number without its plain-language "why" (DDE §12.3, Insights §9.3) fails this gate automatically.

5. Energy/intensity matched to the target student's current Macro-State and Journey Stage (rule 4, extended by SJEE §7.5, §8.2) — a message drafted for a Compounding-state student cannot be sent unmodified to a Wavering-state one.

6. Specificity over generic enthusiasm (rule 5) — a template instance that resolves to a sentence containing no concrete noun (a named concept, subject, or count) fails this gate; "Great job studying!" cannot be produced by any compliant template.

Any rendered instance that fails one or more checks is not sent — it is either auto-corrected where the failure is mechanical (e.g., a missing plain-language "why" can sometimes be auto-supplied from the same data payload) or discarded, with the originating module's candidate logged for review (Part 4).

## ### 5.6 Channel-format resolution

The same Layer 2 template renders differently per channel, never by rewriting content but by selectively omitting or expanding slots:

| Channel | Slots typically rendered | Character/format discipline | ---|---|---|

| Push | Observation + Action | \~40–60 characters body, per platform convention; title carries the category's implicit context (e.g., app name), never repeats the body |

| In-app badge/centre | Observation + Reason + Action | Full sentence(s), no hard limit, but still bound by Section 2.2's brevity discipline — never more than two short sentences |

| WhatsApp | All five slots where category warrants; media attached where applicable (Section 4.5) | Conversational register, may include emoji sparingly if consistent with Kai's established voice (never as a substitute for specificity) |

| Email | All five slots, plus a subject line rendered from Observation alone | Subject line follows the identical push-notification brevity discipline even though email itself is more tolerant, since the subject line is functionally a push notification for this channel |

| SMS | Observation + Action only, no branding overhead | Strict character-count discipline (single-segment where possible), since multi-segment SMS costs compound at scale and this channel is reserved for Exam-Critical/Administrative use (Section 4.7) |

## ### 5.7 Content sourcing discipline, restated as a system constraint

Mirroring SJEE §6.5's content-sourcing priority (a specific due concept, a near-miss milestone, or nothing at all): the template system has no "filler" template. Where an originating module's candidate cannot populate the Observation slot with something genuinely specific and true, the template system returns no renderable output at all, and the candidate is discarded upstream at the Orchestrator (SJEE §5.4's tone-compliance gate already anticipates this outcome) rather than falling back to a generic version of itself. There is no generic Academic Nudge template that fires when a specific one can't — the absence of specific content is itself the signal that no notification should exist right now.

## ### 6.1 Purpose

This section specifies the technical guarantees that make Section 2.5's "reliability is part of the message" principle actually true in production, particularly under the connectivity conditions the Brand Overview already identifies as a defining reality of TECHMED's audience (TECHMED Brand Overview §4.2, §10.8).

## ### 6.2 Delivery guarantee tiers

| Tier | Guarantee | Applies to |

|---|---|---|

| \*\*Best-effort\*\* | Sent once; no retry beyond platform-native retry behaviour | Motivational & Consistency, Community & Social (Low-tier) |

| \*\*Confirmed delivery\*\* | System requires a delivery receipt (device-level or channel-level) before considering the send complete; retries on a backoff schedule if unconfirmed | Academic Nudges, Milestone & Celebration, Re-engagement (Standard-tier and above) |

| \*\*Guaranteed multi-channel\*\* | Confirmed delivery on primary channel; automatic fallback (Section 4.8) to a secondary channel if unconfirmed within a defined window | Exam-Critical, Account & Administrative |

This tiering directly mirrors the Orchestrator's own priority-tier structure (SJEE §5.5) — higher-stakes categories get stronger delivery guarantees, exactly as they already get stronger priority treatment, keeping the two systems' notions of "importance" consistent rather than accidentally diverging.

## ### 6.3 Offline and low-connectivity handling

Consistent with the offline-first principle already established platform-wide (Practice Module §8.2, Question Experience §11.1, CBT Exam Mode §5.9): a notification generated while a student's device is offline is queued locally where the originating trigger occurred client-side (e.g., a Practice session completion that would normally trigger an Academic Nudge candidate), or queued server-side awaiting the device's next connectivity window for anything server-triggered (e.g., a Review backlog alert computed independently of the student's own session). In neither case is a queued notification silently dropped for having missed its "ideal" timing window (Section 7) — it is delivered at the next genuine opportunity, with its content re-validated against current data first (Section 6.6) so a student never receives a stale nudge about a concept that has since been resolved through some other channel.

## ### 6.4 Deduplication

Where the same underlying fact could plausibly generate more than one candidate (e.g., a concept simultaneously qualifying for Review's backlog alert and the Learning Engine's Urgent Decay signal), the delivery system deduplicates at the point of send, not merely at the

Orchestrator's selection stage — this is a defensive second gate protecting against the specific failure mode SJEE §5.10 already forbids ("it never re-sends a dismissed candidate of the identical type... on the theory the student just missed it") from recurring due to a race condition between two originating modules rather than deliberate re-sending. A student never receives two notifications about the same underlying fact within the same delivery window, regardless of how many modules independently noticed it.

## ### 6.5 Interaction logging

Every delivered notification, across every channel, logs three outcomes back into the system: \*\*delivered\*\* (confirmed receipt where the tier requires it, Section 6.2), \*\*opened/viewed\*\*, and \*\*acted-upon\*\* (the student followed the deep link and completed a meaningful action within a defined attribution window, mirroring SJEE §5.7's prompted-vs-unprompted session tagging). This is the exclusive data source feeding SJEE §5.8's per-candidate-type dismissal learning — this module produces the raw interaction log; the SJEE remains the sole owner of interpreting it into priority adjustments, consistent with the standing rule that this module computes no new intelligence (5.1).

## ### 6.6 Content re-validation before send

Because a notification can be queued (Section 6.3) or delayed by a delivery retry (Section 6.2) well after the moment its content was originally assembled, every

Confirmed-delivery-tier-and-above notification is re-validated against live data immediately before actual dispatch — a Review backlog alert queued while offline is re-checked against the current Fading queue before it fires, so a student who already resolved that backlog through an unrelated session in the meantime does not receive a now-false nudge. This mirrors the Question Intelligence Model's own standing preference for behavioural ground truth over stale assumptions (Question Intelligence Model §5.3) applied to notification timeliness specifically.

## ### 6.7 Rate limiting at the infrastructure layer

Independent of the Orchestrator's per-student frequency budget (SJEE §5.6, a product-and-tone decision), the delivery infrastructure enforces its own lower-level technical rate limits per channel (push provider throughput, WhatsApp Business API messaging tier limits, SMS gateway throughput) to protect deliverability and account standing with each channel provider. Where a technical rate limit and the Orchestrator's product-level budget would produce different send counts, the more conservative (lower) of the two always governs — this module never sends \*more\* than the Orchestrator authorised, but may, under genuine infrastructure constraint, need to further throttle below what the Orchestrator approved, in which case the highest-priority tier candidates are preserved first, exactly mirroring the Orchestrator's own tier-based selection logic (SJEE §5.5) rather than a first-in-first-out queue.

## ### 7.1 Purpose

The SJEE already established \*that\* a candidate's ideal timing window is part of what it submits to the Orchestrator (SJEE §5.2) and that Preferred Study Period is the default scheduling anchor for anything without an intrinsic deadline (SJEE §5.9). This section specifies how that anchor is actually resolved into a real send time, including the cases SJEE's own specification deliberately left to "elaborated further" here.

## ### 7.2 The timing resolution hierarchy

For any given approved candidate, send time is resolved in this order, each level only consulted if the one above doesn't fully determine it:

1. \*\*Intrinsic deadline\*\* — Exam-Critical candidates with a real external time (a scheduled mock's start, an exam-window reminder) are scheduled directly against that fact, with enough lead time for the message to be useful (never sent so close to the event that acting on it is impractical).

2. \*\*Preferred Study Period\*\* — Student Intelligence Model §1's declared or Behaviour-Profile-inferred field (Student Intelligence Model §3), used for the large majority of Standard and Low-tier candidates, exactly as SJEE §5.9 already mandates.

3. \*\*Category-appropriate default window\*\* — where neither of the above applies (a new student with no inferred rhythm yet, per SJEE §4.8's Activation-stage caution against over-trusting thin Behaviour Profile data), each category falls back to a sensible, non-intrusive default window (e.g., Motivational & Consistency content defaults toward early evening; Milestone content defaults toward whenever the student's own session-open pattern suggests, since Section 4.4 already prefers in-app delivery for this category over any push timing question at all).

4. \*\*Immediate\*\* — reserved exclusively for Time-critical-tier candidates (SJEE §5.5) and Account & Administrative notices (Section 3.5), which bypass scheduling windows entirely by design.

## ### 7.3 Quiet hours

A platform-wide quiet-hours default (late night through early morning, localised to the student's own device timezone) suppresses all push and SMS delivery for every category except genuine Account & Administrative security notices and Exam-Critical alerts tied to an imminent, unmovable deadline — mirroring CBT Exam Mode's own restraint principle that authenticity and urgency (CBT Exam Mode §2.2) never licenses disregard for a student's actual wellbeing, and directly extending the Brand Overview's "humanity" standard ("students may be tired... under pressure" — Branding Standard §4.5) to notification scheduling specifically. A candidate that would otherwise fire during quiet hours is held and re-evaluated at the next appropriate window per Section 7.2, never silently discarded.

## ### 7.4 Timezone and travel handling

Send-time resolution always uses the device's current, live timezone rather than a timezone cached at registration — a student travelling or relocating never receives a notification calibrated to a stale location. Where a device's timezone signal is unavailable (e.g., a queued offline notification, Section 6.3), the system falls back to the student's last-known timezone rather than a platform-wide default, minimizing the chance of a quiet-hours violation.

## ### 7.5 Frequency-budget-aware scheduling

Because the Orchestrator's frequency budget (SJEE §5.6) operates on a rolling daily/3-day basis rather than a fixed clock reset, the Timing Engine coordinates directly with the Orchestrator's own candidate queue before finalizing any send time — a candidate approved for "today" that would, once its ideal timing window is resolved, land after another higher-priority candidate has already consumed the day's Standard-tier slot, is automatically re-queued for its next valid window rather than either being dropped or double-sent. This is a scheduling-layer implementation detail; the underlying priority and budget logic itself remains entirely SJEE §5's authority (Section 1.3's boundary restated).

## ### 7.6 Batching and digest logic

Where multiple Informational-tier candidates (Section 3.1) accumulate for the same student within a short window — several small milestones, a handful of consistency confirmations — the Timing Engine may consolidate them into a single in-app notification-centre entry rather than firing each independently, but only within the Informational tier itself, and never by merging content across categories (Section 3.4's single-category rule still applies to a digest — a digest is multiple Milestone items shown together, never a Milestone item blended with an Academic Nudge). Standard-tier and above candidates are never batched or digested; each retains its own individual send per the Orchestrator's own one-at-a-time selection logic (SJEE §5.6).

## ### 7.7 What the Timing Engine never does

It never sends a candidate earlier than its resolved window simply because a delivery slot is available — arriving early defeats the purpose of Preferred Study Period personalisation as thoroughly as arriving too late does. It never uses "time since last notification" alone as a trigger to schedule the next one — every send is still justified by its own content and category, never by a cadence-maintenance instinct, which would directly reintroduce the engagement-for-its-own-sake failure mode Section 2 and the SJEE both already reject (SJEE §2.1).

\# KAIRO NOTIFICATIONS & COMMUNICATION SYSTEMS
## Product Specification — Part 3 of 4: Sections 8–11

# ## SECTION 8 — PERSONALISATION & VOICE CALIBRATION

## ### 8.1 Purpose

Sections 5–7 defined how a message is assembled, formatted, and timed identically for any student. This section defines the last, thinnest personalisation layer applied on top — deliberately thin, because every substantive personalisation decision (what to say, whether to say it at all, how urgently) has already been made upstream by the Orchestrator (SJEE §5), the originating module, and the template's own slot logic (Section 5.4). What remains for this layer is calibrating \*delivery register\* only, mirroring the restraint SJEE §8.1 already mandates for its own personalisation: "the SJEE personalises sparingly and only where [prior sections] have already established a genuine, specific hook to personalise around." This module inherits that restraint rather than re-opening the question.

## ### 8.2 The two inputs this layer reads

Consistent with the substance-versus-framing split already established at every layer of Kairo (DDE §10, Learn Module §8.1, Review Module §8.1, SJEE §8.1), this layer reads exactly two signals to calibrate voice, and no others:

1. \*\*Macro-State\*\* (Learning Engine §3) — governs intensity and information density, exactly per the established posture table (Learning Engine Phase 2 §7.4), applied here to notification copy rather than in-session Kai dialogue.

2. \*\*Journey Stage\*\* (SJEE §3) — governs the outer framing envelope, per SJEE §8.2's own stage-by-stage table, restated here as binding on notification voice specifically (an

Activation-stage student's Academic Nudge is gentler and more explanatory than an identical nudge sent to an Establishment-stage student who already understands how Kairo works).

Emotional Profile (Student Intelligence Model §4) is read only as a \*\*gate\*\*, never a trigger — consistent with SJEE §8.5's explicit prohibition on Emotional Profile driving any SJEE-adjacent action independently. A notification's \*content and timing\* are never decided by inferred emotional state; Emotional Profile can only soften or suppress a candidate template's tone within the bounds Section 5.5's compliance checklist already sets, never change what the message says.

## ### 8.3 Name and direct address

Every rendered notification uses the student's preferred name (Student Intelligence Model §1) wherever the channel format naturally supports direct address (WhatsApp, email, in-app centre) — never forced into push notification body text where it would consume disproportionate character budget for low return. This mirrors the memory-application principle already

established for Claude-adjacent personalisation patterns throughout Kairo's own design: personal detail is applied where it adds warmth without becoming the message's own content.

## ### 8.4 What personalisation never touches

Per Section 8.1's restraint principle, this layer never re-selects which template a category uses, never changes the Observation slot's underlying fact, and never overrides channel selection (Section 4) based on inferred preference beyond what SJEE §5.8's dismissal-learning loop already governs. Voice calibration is exclusively a matter of word choice within the template's existing slots — softer verbs, shorter sentences, or a more permission-giving closing register for a Wavering/Recovering student; sharper, more direct phrasing for a Compounding/Peak-Readiness one — never a structural change to what is being communicated.

## ### 8.5 Repeat candidates and Continuation-stage voice

Mirroring SJEE §10.4's own standing rule that a repeat candidate's Arrival sequence must never read as a first encounter: notification copy for a student in the Continuation journey stage (SJEE §3.2, §10.3) draws on genuine relationship history where a template's Observation slot allows it ("welcome back for another season" register rather than introductory register), without requiring a new template family — this is Section 8.2's Journey Stage input doing exactly the calibration work it's designed for, at its most consequential application.

## ## SECTION 9 — LOCALISATION

## ### 9.1 Purpose

TECHMED's audience is drawn from across Nigeria's linguistic and regional diversity (TECHMED Brand Overview §6). This section specifies how the communication system accommodates that without compromising the single-voice principle (Section 2.1) or introducing content the rest of Kairo hasn't already validated.

## ### 9.2 What is localised

Localisation in this module is restricted to \*\*language and regional framing of already-approved template content\*\* — it never extends to translating or reinterpreting the underlying facts a notification carries (Layer 1, Section 5.2 remains untouched by localisation). This mirrors the Subject Knowledge Graph's own "Language/region context" field, which already established the governing boundary at the content layer: local framing "lets Kai choose relatable analogies without assuming — never a proxy for ability" (Student Intelligence Model §1). Applied here: localisation lets a message sound natural to a student's own linguistic context; it never changes what the message is telling them.

## ### 9.3 Primary language default

English remains the default rendering language platform-wide, consistent with English being the medium of instruction and the UTME's own examination language — this is not a stylistic choice but a functional one, since a student preparing in English-medium content should encounter Kairo's own voice in the same register their actual exam will be conducted in.

## ### 9.4 Regional framing, not translation, as the primary lever

Rather than building parallel full-language template sets as a first priority, the system's primary localisation lever is \*\*regionally-relatable phrasing within English\*\* — word choice, idiom, and register calibrated to feel native rather than translated, mirroring exactly how the Subject Knowledge Graph's own Language/region field is scoped ("explanations with local framing or examples," Student Intelligence Model §1). Full alternate-language template families (e.g., Pidgin-inflected variants for channels where that register is genuinely more natural, such as WhatsApp specifically) are a defined extension point (Part 4) rather than a Part-3 requirement, since they multiply the QA burden of Section 5.5's compliance checklist by a full language set and must be governed carefully rather than introduced casually.

## ### 9.5 Channel-specific register variance

Consistent with Section 5.6's channel-format table, the same underlying template may legitimately render in a slightly more conversational register on WhatsApp than on push or email, without this constituting a "different voice" — WhatsApp's own cultural register in Nigeria is inherently warmer and more personal than a system push notification's, and matching that register on that specific channel is itself part of Section 2.1's "one voice, many surfaces" principle, not an exception to it: the same speaker naturally adjusts register by medium the way a person texts a close friend differently than they'd leave a formal voicemail, without becoming a different person.

## ### 9.6 What localisation never does

It never changes tone-compliance requirements (Section 5.5) per locale — the ban on guilt framing, comparative language, and bare judgment applies identically regardless of language or regional register, since these are Kai's character, not a translation artifact. It never infers a student's preferred linguistic register from assumptions about their name, location, or school — where genuine signal exists (an explicit student preference, Student Intelligence Model §1's "Language/region context" field), it is used; where it doesn't, English-default with regionally-natural phrasing is the safe, respectful baseline.

This section specifies the permission architecture governing every channel in Section 4 — what a student has agreed to, how that agreement is captured and respected, and the hard boundaries that override every other system in this document, including the Orchestrator's own priority tiers.

## ### 10.2 The consent hierarchy

Consent is captured and enforced at three levels, from broadest to narrowest, each level constraining everything beneath it:

1. \*\*Channel-level consent\*\* — whether a student can be reached on a given channel at all (push permission granted at the OS level; WhatsApp number provided and opted in; email address provided; phone number provided for SMS). No message is ever attempted on a channel without this baseline permission, regardless of category or priority tier.

2. \*\*Category-level preference\*\* — within a permitted channel, which notification categories (Section 3.1) a student wants to receive, adjustable per category in Profile (Product Experience Blueprint §8) exactly as Home Dashboard §4.13 and SJEE §5.6 already anticipate ("personalisable downward by the student... but never upward by any module").

3. \*\*Explicit stop requests\*\* — SJEE §9.7's standing rule, restated here as this module's binding enforcement mechanism: an explicit request to stop all outbound contact overrides every category preference, every channel permission, and every priority tier including Time-critical, with the sole exception of genuinely account-critical, non-marketing communication (Section 3.5), which sits outside this consent architecture by definition rather than as an override of it.

## ### 10.3 Consent is never inferred upward

Mirroring SJEE §5.8's standing rule that inferred preference never overrides an explicit opt-out: the reverse is equally binding here — a student's engagement with a channel (opening WhatsApp messages, clicking push notifications frequently) is never treated as implicit consent to \*expand\* what that channel is used for beyond what was explicitly granted. A student who has opted into WhatsApp for win-back sequences specifically (SJEE §6.6) has not thereby consented to routine Academic Nudges arriving there — each category-channel combination requires its own explicit or default-appropriate basis, never an inferred general willingness.

## ### 10.4 Default consent posture at Arrival

Consistent with SJEE §4.4's minimum-viable-capture principle, Arrival requests only the channel permissions genuinely needed for the product to function at a baseline (typically push, for in-session-adjacent nudges) — WhatsApp, email, and SMS consent are captured opportunistically and separately, each with its own clear explanation of what it will be used for (mirroring the same honesty-first framing already established for Identity capture, SJEE §4.5),

never bundled into a single blanket "allow notifications" prompt that obscures which channel is being granted for which purpose.

## ### 10.5 Editorial & Broadcast consent is separate and explicit

Because Editorial & Broadcast content (Section 3.6) is authored by TECHMED's marketing layer rather than generated per-student by Kairo's own intelligence, its consent basis is tracked independently from the five product-notification categories — a student can be fully opted into Academic Nudges and Milestones while declining Editorial & Broadcast content (campaign messaging, 5 Minutes Forward drops) entirely, and vice versa. This separation directly protects the boundary SJEE §6.7 and §10.5 already draw between Kairo's product-level orchestration and TECHMED's marketing channels — collapsing the two into a single consent toggle would blur a distinction both documents have been careful to keep clean.

## ### 10.6 Data retention and the right to be forgotten

Interaction logs (Section 6.5) and consent records are retained under the same append-only principle governing attempt history (Student Intelligence Model §2), but consent-specific records are exempt from that principle in one respect: where a student exercises a right to have their contact data deleted (distinct from an opt-out, which merely stops future contact while preserving history), the delivery infrastructure's stored channel identifiers (phone number, email, WhatsApp number) are purged, while the \*fact\* that a stop request or deletion occurred is retained minimally, only as needed to prevent an accidental future re-contact attempt from a system that no longer has memory of the original request.

## ### 10.7 Compliance with platform and regulatory constraints

Each channel's own platform rules (WhatsApp Business API messaging-window policies, mobile OS push permission models, SMS regulatory requirements for opt-out language) are treated as a hard floor beneath this module's own consent architecture — where a channel's own platform policy is stricter than Kairo's internal consent model (e.g., WhatsApp's 24-hour customer-service-window rules governing when a business-initiated message is permitted without a pre-approved template), the platform's constraint governs delivery eligibility, and the Timing Engine (Section 7) treats a policy-ineligible send exactly as it treats a quiet-hours suppression — held and re-evaluated at the next valid window, never silently dropped.

## ### 10.8 What compliance never does

It never treats a lapsed or ambiguous consent state as implicit permission — where the system cannot confirm a valid, current consent basis for a channel-category combination, the default is silence, not delivery, mirroring the Daily Decision Engine's own failure-mode discipline of defaulting to the safest, least disruptive option under uncertainty (DDE §13). It never uses a compliance requirement as an excuse to under-deliver genuinely important Account & Administrative content (Section 3.5) — that category's guaranteed-delivery tier (Section 6.2) is never weakened by consent-architecture complexity, since it sits outside the marketing-consent framework by design.

## ## SECTION 11 — EDITORIAL & BROADCAST GOVERNANCE

## ### 11.1 Purpose

Section 3.6 already established Editorial & Broadcast as a distinct category with its own governance track. This section specifies that track in full — who authors this content, how it's scheduled, and how it stays inside the same brand and reliability standards as every algorithmically-generated notification without being subject to the same per-student arbitration.

## ### 11.2 What qualifies as Editorial & Broadcast

Content authored by TECHMED's content, marketing, or growth functions rather than generated as a candidate from Kairo's own Learning Engine, Student Intelligence Model, or SJEE — UTME 2027 campaign-phase messaging (TECHMED 2027 §6), registration and calendar updates, 5 Minutes Forward episode announcements, Forward Collective community content, and TECHMED-wide announcements not tied to any individual student's own learning signal.

## ### 11.3 Authoring and approval workflow

Mirrors the Challenges Module's own admin governance model (Challenges §10) closely, since both are TECHMED-curated content streams distinct from Kairo's personalised intelligence: content is drafted by Growth/Marketing roles (mirroring Challenges §10.5's role structure), checked against the platform-wide tone and brand standard (Branding Standard §10–11, Section 2.1's single-voice principle applied to TECHMED's own broader voice rather than Kai's specifically), and requires the same second-level review threshold Challenges already establishes for high-visibility content (Challenges §10.4's "lightweight approval step... for Special Campaign and Sponsored/Partner Challenges" — applied here to any Broadcast content reaching the platform's full addressable audience rather than a segmented subset).

## ### 11.4 Scheduling and cadence

Unlike SJEE-arbitrated categories, Editorial & Broadcast content follows TECHMED's own campaign calendar (TECHMED 2027 §6's seven-phase structure) rather than a per-student Orchestrator decision — but it still passes through this module's Timing Engine (Section 7) for quiet-hours suppression (7.3) and timezone handling (7.4), and through the same delivery infrastructure (Section 6) for reliability guarantees. Its "frequency budget" is governed separately, at the campaign-calendar level rather than the individual-candidate level: TECHMED's own editorial calendar self-limits volume, and this module enforces only a floor — no Broadcast message may be sent within a minimum spacing window of the previous one,

protecting students from campaign-side volume the same way SJEE §5.6 protects them from product-side volume, even though the two budgets are computed independently.

## ### 11.5 Segmentation without personalisation drift

Editorial & Broadcast content may be segmented (e.g., only to students within a certain Journey Stage or exam-year cohort, mirroring the phase-based campaign architecture's own student-mindset targeting, TECHMED 2027 §6) — but segmentation here means \*audience selection\*, never per-student content generation. A Phase 4 "Intensification" campaign message is the same message for every student it's sent to; it does not run through Section 5's template-slot personalisation system, since it was never a data-driven candidate to begin with. This is the clean boundary that keeps Editorial content from quietly becoming a ninth notification category with its own intelligence layer — it stays TECHMED-authored, TECHMED-approved, and uniform within its addressed segment.

## ### 11.6 Brand-voice distinction from Kai

Editorial & Broadcast content speaks in TECHMED's own established brand voice (Branding Standard §10 — "Clarity over complexity. Insight over noise. Strategy over empty motivation") rather than Kai's specific mentor register (Learning Engine Phase 2 §7.1). This is a deliberate, visible distinction, not an inconsistency: a campaign announcement about UTME registration deadlines is TECHMED speaking as an organisation; a Weekly Review coaching note is Kai speaking as the student's own learning companion. Students should be able to tell the difference the way they can tell a company newsletter from a text from a friend — both trustworthy, both clearly TECHMED, but distinct in register per Section 9.5's own precedent for legitimate register variance by context.

## ### 11.7 What Editorial & Broadcast governance never does

It never borrows Kai's first-person mentor voice to add false intimacy to organisational content (Section 11.6's distinction is protective, not incidental — collapsing it would make Kai's genuine personalisation feel less trustworthy everywhere else, since a student who receives a campaign broadcast that impersonates Kai will reasonably start to wonder whether Kai's supposedly personal observations elsewhere are equally manufactured). It never uses Kairo's own behavioural or academic data (retention\_state, Macro-State, Emotional Profile) to target Broadcast content — segmentation draws only from Identity and Journey Stage fields already treated as appropriate for coarse, non-invasive targeting (SJEE §8.2's own stage table), never from the Learning Engine's more sensitive academic or emotional signal, protecting the same hard boundary the Emotional Profile already enforces against being used for anything beyond tone-softening (Student Intelligence Model §4, SJEE §8.5).

\*End of Part 3. Part 4 will cover Admin Tooling & Governance, Edge Cases, and Future Scalability.\*

\## Product Specification — Part 4 of 4: Sections 12–14 & Executive Summary

## ## SECTION 12 — ADMIN TOOLING & GOVERNANCE

## ### 12.1 Purpose

Every prior module with a curated or administered dimension (Challenges §10, CBT Exam Mode's Official Mock Events) already established that trust-critical systems need a control layer making their promises enforceable, not just aspirational. This section defines what TECHMED's team needs to reliably author, QA, monitor, and govern everything specified in Parts 1–3 — the taxonomy (Section 3), the templates (Section 5), the channels (Section 4), and the Editorial track (Section 11).

## ### 12.2 Template management workspace

A dedicated admin surface where template families (Section 5.2's Layer 2) are authored, versioned, and reviewed — never edited directly in production code, since a template is content infrastructure, not application logic, and content-team members (not only engineers) must be able to propose and revise slot copy. Every template revision passes through Section 5.5's compliance checklist as an automated gate before it can be published, exactly as a new question can't enter live rotation without clearing the Question Intelligence Model's own QA gate (Question Intelligence Model §11) — the same "reliability before complexity" discipline (TECHMED 2027, Primary Goal 3) applied to message content instead of question content.

## ### 12.3 Live monitoring dashboard

Mirroring Challenges' own Live Monitoring Dashboard (Challenges §10.3) closely: real-time visibility into send volume by category and channel, delivery confirmation rates, open/interaction rates, and — critically — dismissal-rate spikes for any specific template, which function as an early warning that a template has drifted out of tone-compliance in a way the automated checklist (5.5) didn't catch, or that its content has become stale or repetitive to the population receiving it. A sudden dismissal-rate spike on a previously healthy template is treated the same way a spike in exit rate at a specific CBT question is treated (CBT Exam Mode §10.3, "a spike in exits at question 4 signals a possible flawed question") — as a signal requiring investigation, not simply logged and ignored.

## ### 12.4 Per-student notification history view

A support-facing tool allowing TECHMED staff to see exactly what a specific student has received, on which channel, and what they did with it — necessary for resolving support queries ("I never got my mock reminder"), for auditing a specific student's consent state (Section 10.2) when a dispute arises, and for diagnosing SJEE-adjacent Orchestrator behaviour that appears to be misfiring for that student specifically. This view is read-only and internal; it is never surfaced to the student themselves in this raw form, consistent with the platform-wide rule that internal state and mechanics stay internal (DDE §12.3) — a student's own view into their notification history is the in-app notification centre (Section 4.4), not this admin tool.

## ### 12.5 Category and channel-level kill switches

Given Section 6.7's rate-limiting discipline and the real possibility of a template, channel integration, or Editorial campaign malfunctioning at scale, admin tooling includes an immediate, category-or-channel-scoped kill switch — the ability to halt all sends of a specific category (e.g., "pause all Milestone notifications") or through a specific channel (e.g., "pause WhatsApp entirely" during a provider outage) without requiring a full system deployment. This is the notification-system equivalent of Challenges' own "Mid-Challenge Intervention" capability (Challenges §10.3) — the ability to stop a live, in-flight problem surgically rather than only being able to fix it for the next release.

## ### 12.6 Content audit trail

Every sent notification retains a permanent record of exactly which template version, data payload, and rendering decisions produced it (Section 5.2's three layers, snapshotted at send time) — this is what makes Section 12.3's dismissal-spike investigation and Section 12.4's support-query resolution possible after the fact, and mirrors the append-only principle already governing attempt history (Student Intelligence Model §2) and consent records (Section 10.6) applied to message content itself.

## ### 12.7 Roles and permissions

| Role | Can do | Cannot do |

| \*\*Content Admins\*\* | Author and propose template revisions (12.2), draft Editorial content (Section 11.3) | Publish a template without compliance-gate clearance; bypass the second-level review threshold for high-visibility Broadcast content |

| \*\*Growth/Marketing Admins\*\* | Own Editorial & Broadcast scheduling and campaign-calendar cadence (Section 11.4), access engagement analytics | Modify SJEE-arbitrated category templates (Academic Nudges, Milestones) without Content Admin sign-off, since these carry Kai's voice specifically |

| \*\*Engineering/Platform Admins\*\* | Manage channel integrations, kill switches (12.5), delivery infrastructure configuration (Section 6) | Author or approve message copy — content and infrastructure authority stay separated |

| \*\*Senior Admins\*\* | Cross-category trend analysis, full audit trail access, override kill-switch authority | — |

This mirrors Challenges' own role-separation model (Challenges §10.5) directly — content authority, growth/scheduling authority, and technical authority remain distinct roles even where one person may hold more than one in practice, so that no single mistaken action can simultaneously break tone compliance and infrastructure reliability at once.

## ### 12.8 Governance review cadence

Consistent with TECHMED's own monthly and weekly operating review disciplines (TECHMED 2027 §9–10), this system's health is reviewed on the same cadence: a monthly pass over dismissal trends, tone-compliance gate failure rates, and consent-opt-out patterns (are students unsubscribing from a specific category at a rate that suggests a real problem, not just normal preference-tuning), feeding back into template revisions and, where a systemic issue is found, into the taxonomy itself (Section 3) rather than only into individual template fixes.

## ## SECTION 13 — EDGE CASES

## ### 13.1 A student who opts out of every channel

Where a student has withdrawn consent from push, WhatsApp, email, and SMS alike (short of an explicit full stop request, Section 10.2 tier 3), the system does not treat this as requiring escalation to a channel they haven't opted into — this mirrors SJEE §9.7's own binding rule at its logical extreme. The student continues to receive full in-app badge/centre content (Section 4.4), since that channel requires no external permission and asks nothing of the student outside the product itself — a fully opted-out student is never a fully silent one \*inside\* Kairo, only outside it.

## ### 13.2 A high-priority candidate arrives during a channel provider outage

Where the primary channel for a Time-critical or Guaranteed-multi-channel-tier candidate (Section 6.2) is experiencing a provider-side outage (push service down, WhatsApp Business API degraded), Section 4.8's fallback logic activates immediately rather than waiting for the confirmed-delivery retry window to lapse first — an outage detected at the infrastructure level (distinct from an individual failed send) triggers proactive fallback for every affected candidate in flight, mirroring CBT Exam Mode's own distinction between individual connectivity loss (handled gently and individually, CBT Exam Mode §5.9) and a cohort-wide technical disruption (flagged for operational review, CBT Exam Mode §10.7) — a provider outage here follows the cohort-wide path, not the individual one.

## ### 13.3 Conflicting consent signals across a household or shared device

Where a device is shared (a family device, a school computer) and channel-level consent was granted under one student's account but a different student is now the active user, the system relies on the same multi-device data-architecture requirement already established at the Learning Engine level (Learning Engine §11, "Multi-device use... a session on a shared device... must resume from the same knowledge model, not fragment into a second identity") — consent state is tied to the authenticated student account, not the device, so a channel permission never leaks across accounts sharing hardware.

\### 13.4 A student's Journey Stage and notification history disagree after a data migration or account merge

Where an account merge occurs (e.g., a Challenge participant's anonymous attempt history converting into a full account, Challenges §7.3's data flow, or a repeat candidate's history being reattached per SJEE §10.4), notification interaction history (Section 6.5) and consent records (Section 10.6) merge following the identical append-only, never-discarded principle already governing every other data type in this scenario — a student's notification history is treated with the same continuity guarantee as their Knowledge Map, since both are equally part of "the relationship," not disposable metadata.

\### 13.5 A template produces content that passes automated compliance but reads poorly in a specific edge context

Where the automated Section 5.5 checklist clears a rendered instance, but the specific combination of data payload and template produces something that reads awkwardly or insensitively in a particular student's actual circumstance (an edge case no automated gate can fully anticipate — e.g., a Milestone template's "first Reinforced concept in every subject" framing rendering oddly for a student whose active combination has only one subject), this is exactly the class of failure Section 12.3's dismissal-monitoring and Section 12.6's audit trail exist to catch after the fact, feeding back into template refinement (12.2) — the system's honest posture is that automated compliance is necessary but not sufficient, and human review of real-world dismissal patterns remains part of the governance loop, not a one-time launch task.

## ### 13.6 A student explicitly requests more contact, not less

Where a student actively seeks a channel or category they've been receiving sparingly (e.g., a highly-engaged Compounding-state student who wants more frequent Challenge notifications), the request is honoured as an explicit, positive consent signal exactly as an opt-out is honoured negatively (Section 10.3's symmetry) — but it still never overrides the Orchestrator's own frequency budget (SJEE §5.6) design intent, since that budget exists to protect decision-fatigue and cognitive load (TECHMED Brand Overview §10.2), not merely to reflect the median student's tolerance. A student's explicit request for more contact can widen their own personal frequency ceiling within Profile settings; it cannot be used to justify raising the platform-wide default for every student.

## ### 13.7 A candidate's deep link becomes invalid between send and open

Where content referenced by a notification's Action slot (Section 5.4) — a specific Learn lesson, a specific Review category — changes or is removed between the notification's send time and the student's eventual open (e.g., a content update, Question Intelligence Model §10's lifecycle loop revising a question), the deep link resolves gracefully to the nearest still-valid equivalent (the same concept's current Learn lesson, even if the specific question referenced has since been revised) rather than a broken link or dead screen — mirroring the Question Experience's own corrupt-question-data fallback discipline (Question Experience §11.3) applied to notification deep-linking specifically.

## ## SECTION 14 — FUTURE SCALABILITY

The Notifications & Communication Systems module is deliberately structured so the following attach without requiring this specification to be redesigned:

\*\*Generative Layer 2 templates.\*\* Section 5.3 already anticipates this explicitly, mirroring the Question Intelligence Model's own stated posture (Learning Engine Phase 2 §12): a more generative template-population layer could produce richer, less rigidly-slotted copy underneath the same five-slot structure and the same Section 5.5 compliance gate, without requiring the taxonomy (Section 3) or the channel architecture (Section 4) to change.

\*\*Full alternate-language template families.\*\* Section 9.4 already scopes this as a defined extension rather than a Part-3 requirement — additional full-language template sets (beyond regionally-natural English phrasing) attach as new Layer 3 rendering paths consuming the identical Layer 1/Layer 2 structure, governed by the same compliance checklist replicated per language.

\*\*Rich push notification formats.\*\* Where mobile platforms extend push capability (inline actions, rich media previews), this attaches as a new Section 5.6 channel-format row — richer rendering of the same five-slot template, never a reason to redesign the template system itself.

\*\*New channels (in-app chat, voice/call-based reminders).\*\* Section 4.2's channel-selection logic (each channel serves a distinct trust/reliability niche) already anticipates this pattern — a new channel is a new row in Section 4.1's roster and a new Section 6.2 delivery-guarantee mapping, not new architecture.

\*\*AI-driven send-time optimisation.\*\* Section 7.2's timing-resolution hierarchy could be refined with a more predictive per-student optimal-window model beyond Preferred Study Period and Behaviour Profile inference — this attaches at hierarchy level 2 (Section 7.2) without touching levels 1, 3, or 4, or the quiet-hours and frequency-budget constraints that remain binding regardless of how the window itself is computed.

\*\*Cohort/community-triggered Editorial segmentation.\*\* As the Forward Collective and cohort-based leaderboard groundwork mature (Learning Engine Phase 2 §8.4, SJEE §12), Editorial & Broadcast segmentation (Section 11.5) can extend to cohort-aware targeting without new architecture, since segmentation was already designed as audience-selection-only from the outset.

\*\*Sponsored/partner channel content.\*\* Mirroring Challenges' own anticipated Sponsored/Partner expansion (Challenges §11.2), a future sponsored-content notification stream would attach under Editorial & Broadcast governance (Section 11) with partner content held to the identical brand and compliance standard, never a lighter one, consistent with Challenges' own "TECHMED retains full content and QA control" principle.

\*\*Two-way conversational channels.\*\* Where WhatsApp or a future in-app chat evolves from a one-way delivery channel into a genuine two-way conversational surface (a student replying to a nudge, asking Kai a question via WhatsApp), this is explicitly out of scope for the current specification — it would introduce Kai's full conversational behaviour (Learning Engine Phase 2 §7) into a new surface, a materially different product decision requiring its own specification, not an extension of this module's one-way delivery infrastructure.

The general principle, consistent with every other Kairo architecture document: each of these is a new \*consumer\* of this module's existing structure, not a reason to change it.

## ## FINAL OUTPUT — WHY THIS MODULE IS KAIRO'S VOICE BEYOND THE SCREEN

Every module specified before this one governs something that happens while a student is looking at Kairo. The Learning Engine, the Student Intelligence Model, the Daily Decision Engine, Practice, Learn, Review, CBT Exam Mode, Challenges, Insights, and the Student Journey & Engagement Engine all, in the end, produce experiences a student walks \*into\*. This module is the only one that has to work when the student isn't there at all — when the phone is in a pocket, the app is closed, and the only thing representing Kairo in that moment is whatever arrives on a lock screen, in a WhatsApp thread, or in an inbox.

That is a harder problem than it looks, because it strips away every advantage the rest of the product has. Inside the app, tone can be reinforced by layout, by Kai's consistent visual presence, by the slow accumulation of trust built session after session. A notification has none of that scaffolding — it is a handful of words, alone, competing with everything else on a crowded lock screen, required to sound exactly like the mentor a student has come to trust, on the very first read, with no second chance to clarify. Section 0's governing question exists

because that is the actual, unforgiving standard every notification in this system has to clear: would it still sound like Kairo with nothing else around it?

The SJEE already decided that Kairo should speak sparingly and only with something true to say. This module is what makes sure that when it does speak, it arrives — through the right channel, in the right words, at the right hour, to a student who asked, in whatever way they could, to be reached that way and no other. TECHMED's own founding belief is that a student should never have to figure things out alone. This module is the proof of that belief in the moments furthest from the product itself — the quiet, in-between moments where trust is either quietly reinforced or quietly spent, one message at a time.

\*\*Think Smart. Perform Elite.\*\*
