# Kairo logo branding guidelines

_Started 2026-08-01 16:55 UTC_

---

## User

Continuing from "Brand illustrations update".

## Assistant

We've been building the Kairo Design System from scratch—a comprehensive design kit for TECHMED's AI-powered UTME learning platform. Kairo helps Nigerian students prepare for exams through structured practice, emphasizing calm, premium, intelligent, and motivating interfaces.

We started by exploring your uploaded assets (product specs, screenshots, and illustrations), then created the full system foundation: color tokens (Deep Navy primary, Professional Blue secondary, Soft Blue support, Gold for achievements), typography (Poppins/Montserrat for headlines, Inter for body), and extracted brand assets (logo lockup, mark, and six key illustrations—Kai mascot, student studying, seize-the-moment, etc.). Built 12 foundation specimen cards showing colors, type scales, and spacing systems.

Authored a 19-component library (core primitives like Button, Input, Card; feedback components like Badge and Toast; navigation like BottomNav and TopBar; and Kairo-specific composites like PracticeCard, ProgressRing, and StreakBadge). Each component has `.jsx`, `.d.ts` (props contract), and `.prompt.md` (usage guide).

Created a full mobile UI kit with 8 interactive screens: onboarding carousel, login, home dashboard, practice session, session summary, review module, insights, and profile—all wired together with click-through navigation and real component composition. Everything renders correctly via the auto-compiled bundle.

Recent edits corrected asset references in foundation cards (logo and illustration specimen cards now point to the correct files).

**Current state:** Design system is complete and verified. Bundle compiles cleanly (`_ds_bundle.js` generated). All 12 foundation cards render correctly in the Design System tab. UI kit onboarding carousel and full navigation flow working. readme.md, SKILL.md, and token/component/asset files all in place.

**Open next steps:**
- Expand UI kit with additional screens (CBT Exam Mode, Learn lesson, Challenges) if needed.
- Add "starting points" for quick-start templates if desired.
- Swap Lucide icons for TECHMED's real icon set when available.
- Confirm gold hex (#D9A94C) against official TECHMED swatch.

**Key files:** readme.md, SKILL.md, tokens/*.css, components/*/[.jsx/.d.ts/.prompt.md], ui_kits/kairo_mobile/*, guidelines/brand-*.html, assets/*.png.

## User

Add tweakable controls to guidelines/brand-kairo-logo.html: The current Design System is treating the Kairo logo and wordmark as raster images with their original coloured background. This is incorrect. The Kairo logo and Kairo wordmark are brand assets, not image blocks. Update the Design System so that the official logo assets follow these rules everywhere in the product. Logo Rules The Kairo icon and wordmark should always be rendered as transparent brand assets. Do not display their original background. Do not place the navy square behind the logo. Remove the background completely so only the logo itself remains. The logo should inherit the appropriate brand colour for the surface it appears on. For light backgrounds: Use the approved Kairo Navy. For dark/navy backgrounds: Use white. Do not recreate the logo manually. Do not distort its proportions. Do not apply shadows, gradients, strokes, glows or effects. Maintain the approved clear space around the logo. These rules apply to: Splash Screen Onboarding Authentication Home Dashboard Settings Empty States Loading Screens Marketing Components Every future screen Update Existing Screens After updating the Design System, regenerate every screen that currently uses the incorrect logo implementation. Replace the embedded logo image with the corrected transparent brand asset. The layout, spacing and component hierarchy should remain unchanged. Only the logo implementation should change. The Design System should now treat the Kairo logo as an official vector-style brand asset rather than a pasted image

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: image_metadata]_

_[tool: image_metadata]_

_[tool: image_metadata]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: image_metadata]_

_[tool: image_metadata]_

_[tool: view_image]_

_[tool: grep]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: grep]_

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: image_metadata]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: view_image]_

Clean extraction, no shadows/artifacts. Delete the preview file and build the mask-based logo system.

_[tool: delete_file]_

_[tool: write_file]_

Now fix Login.jsx to use the same mask technique instead of the flattened navy-square image.

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

Correct token is `--kairo-navy-900`, not `--color-navy-900`. Fixing both files.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Also fix the `--color-bg-canvas` reference (not a real token) and thumbnail.html main-area logo, then verify.

_[tool: grep]_

_[tool: read_file]_

_[tool: show_html]_

_[tool: check_design_system]_

Clean, no issues.

_[tool: ready_for_verification]_

Extracted clean transparent mask assets (`kairo-mark-mask.png`, `kairo-wordmark-mask.png`) from the source lockup, discarding the navy background plate. Rebuilt `brand-kairo-logo.html` to render the logo via CSS `mask-image` + `background-color`, with a Light/Dark surface toggle that recolors it live (Navy on light, white on dark) — no background square, no shadow, proportions untouched. Also fixed the one other incorrect usage, the Login screen lockup, to use the same technique.

## User

Build the Kairo onboarding flow as one interactive React artifact, from the 
post-intro Welcome screen through to the new-user Home Dashboard.

CONTEXT (search project knowledge, don't ask me to re-paste):
- Design System (all 5 parts) for tokens, components, templates
- Student Journey & Engagement Engine §4 for onboarding intent — but note 
  this flow intentionally OVERRIDES §4.4/§4.6's original sequence per my 
  explicit direction below. Follow my screen list, not the original spec, 
  where they conflict.
- Home Dashboard spec §9.1 for the new-user dashboard structure

WHERE THIS PICKS UP:
A splash screen and a 5-screen intro carousel already exist before this — 
don't build those. Start at the Welcome screen below.

TOKEN CHANGE TO APPLY:
Primary buttons (Get Started, Continue, Create Account, Start Learning, etc.) 
use Deep Navy #012748 as fill, not Professional Blue #09476E. Apply this 
consistently across every primary CTA in this flow.

MASCOT:
Replace any humanoid robot imagery with Kai — a simple, geometric, abstract 
mark (not a literal creature illustration), consistent with the Design 
System's "warm but restrained, never cartoonish" onboarding illustration rule.

SCREENS, IN ORDER:

1. Welcome / device-recognition screen
   - Kai mark, short line acknowledging this is a new device/first visit
   - "Get Started" (navy, primary) → goes to Sign Up
   - "I already have an account" (secondary/text) → goes to Sign In

2. Sign In
   - Email, password, "Forgot password?" link
   - "Continue with Google" as an alternative
   - Link to Sign Up for new users

3. Sign Up
   - Only: Full Name, Email, Password
   - "Continue with Google" as the recommended alternative
   - CTA: Create Account. Nothing else on this screen.

4. Verify Email (email signup path only — skip this step entirely on Google signup)
   - Simple code entry, Verify → Continue

5. Tell us about yourself (one screen, three questions)
   - Exam Year: UTME 2027 / UTME 2028 / Other — required
   - Intended Course: searchable/filterable list (e.g. Medicine & Surgery, 
     Nursing, Pharmacy, Engineering, Computer Science) — include a 
     "Skip for now" option
   - Subjects: auto-suggested from the chosen course (e.g. Medicine → 
     English, Biology, Chemistry, Physics, pre-checked), editable checklist
   - Do NOT ask for target university anywhere in this flow

6. Current Level (single select, skippable)
   - "I'm just getting started" / "I know some topics but need structure" / 
     "I've been preparing for a while" / "I'm almost exam-ready"

7. Personal Goal (single select, skippable)
   - "Improve my understanding" / "Practise consistently" / "Increase my 
     score" / "Prepare for CBT" / "Identify my weak areas"

8. Notifications
   - "Would you like reminders to stay on track?"
   - "Allow Notifications" (navy) / "Skip" (secondary)

9. Account Ready
   - Personal framing, not "Account Created Successfully" — something like 
     "You're all set. Kairo will guide you one question at a time until 
     you're ready for UTME."
   - Summary card: Name, Course, Exam Year, Subjects
   - CTA: Start Learning → goes to Home Dashboard

10. Home Dashboard (new-user state)
    - Mission Card offers the first diagnostic session as a SUGGESTION, 
      not a gate — the account is already fully created before this point
    - Quick Actions grid: Subject Practice, Topic Practice, Mixed Practice, 
      Exam Mode, Challenges, See All — tappable, "See All" implies more 
      exist without listing them yet
    - Everything else in genuine new-user empty state per Home Dashboard §11 
      — no fabricated numbers, no zeroed charts

BUILD RULES:
- Single artifact, single file, internal state controls navigation — must 
  feel like real screen-to-screen clicking, not static frames
- use the component library 
- Every colour/type/spacing/radius traces to a named token
- Skip options must be visually secondary (text link, not a button) so they 
  never compete with the primary action
- Show a segmented step indicator (not a raw percentage) across screens 2–9 
  of the numbered flow (Sign Up through Account Ready)
The uploaded files serve only as guides and former design drafts I had not compulsory templates. The dashboard image I uploaded is a sample for a returning user I created earlier but not yet defined as the standard too, you can only get some ideas from it. The home dashboard of the new user will also have 2 different cards to quickly navigate them to either JAMB CBT Exam mode and challenges section too.

OUTPUT:
After building, list which screens deviate from the original SJEE onboarding 
spec and why, so I have a clear record of what's now intentionally different 
from the base documents.

## User

Build the Kairo onboarding flow as one interactive React artifact, from the 
post-intro Welcome screen through to the new-user Home Dashboard.

CONTEXT (search project knowledge, don't ask me to re-paste):
- Design System (all 5 parts) for tokens, components, templates
- Student Journey & Engagement Engine §4 for onboarding intent — but note 
  this flow intentionally OVERRIDES §4.4/§4.6's original sequence per my 
  explicit direction below. Follow my screen list, not the original spec, 
  where they conflict.
- Home Dashboard spec §9.1 for the new-user dashboard structure

WHERE THIS PICKS UP:
A splash screen and a 5-screen intro carousel already exist before this — 
don't build those. Start at the Welcome screen below.

TOKEN CHANGE TO APPLY:
Primary buttons (Get Started, Continue, Create Account, Start Learning, etc.) 
use Deep Navy #012748 as fill, not Professional Blue #09476E. Apply this 
consistently across every primary CTA in this flow.

MASCOT:
Replace any humanoid robot imagery with Kai — a simple, geometric, abstract 
mark (not a literal creature illustration), consistent with the Design 
System's "warm but restrained, never cartoonish" onboarding illustration rule.

SCREENS, IN ORDER:

1. Welcome / device-recognition screen
   - Kai mark, short line acknowledging this is a new device/first visit
   - "Get Started" (navy, primary) → goes to Sign Up
   - "I already have an account" (secondary/text) → goes to Sign In

2. Sign In
   - Email, password, "Forgot password?" link
   - "Continue with Google" as an alternative
   - Link to Sign Up for new users

3. Sign Up
   - Only: Full Name, Email, Password
   - "Continue with Google" as the recommended alternative
   - CTA: Create Account. Nothing else on this screen.

4. Verify Email (email signup path only — skip this step entirely on Google signup)
   - Simple code entry, Verify → Continue

5. Tell us about yourself (one screen, three questions)
   - Exam Year: UTME 2027 / UTME 2028 / Other — required
   - Intended Course: searchable/filterable list (e.g. Medicine & Surgery, 
     Nursing, Pharmacy, Engineering, Computer Science) — include a 
     "Skip for now" option
   - Subjects: auto-suggested from the chosen course (e.g. Medicine → 
     English, Biology, Chemistry, Physics, pre-checked), editable checklist
   - Do NOT ask for target university anywhere in this flow

6. Current Level (single select, skippable)
   - "I'm just getting started" / "I know some topics but need structure" / 
     "I've been preparing for a while" / "I'm almost exam-ready"

7. Personal Goal (single select, skippable)
   - "Improve my understanding" / "Practise consistently" / "Increase my 
     score" / "Prepare for CBT" / "Identify my weak areas"

8. Notifications
   - "Would you like reminders to stay on track?"
   - "Allow Notifications" (navy) / "Skip" (secondary)

9. Account Ready
   - Personal framing, not "Account Created Successfully" — something like 
     "You're all set. Kairo will guide you one question at a time until 
     you're ready for UTME."
   - Summary card: Name, Course, Exam Year, Subjects
   - CTA: Start Learning → goes to Home Dashboard

10. Home Dashboard (new-user state)
    - Mission Card offers the first diagnostic session as a SUGGESTION, 
      not a gate — the account is already fully created before this point
    - Quick Actions grid: Subject Practice, Topic Practice, Mixed Practice, 
      Exam Mode, Challenges, See All — tappable, "See All" implies more 
      exist without listing them yet
    - Everything else in genuine new-user empty state per Home Dashboard §11 
      — no fabricated numbers, no zeroed charts

BUILD RULES:
- Single artifact, single file, internal state controls navigation — must 
  feel like real screen-to-screen clicking, not static frames
- use the component library 
- Every colour/type/spacing/radius traces to a named token
- Skip options must be visually secondary (text link, not a button) so they 
  never compete with the primary action
- Show a segmented step indicator (not a raw percentage) across screens 2–9 
  of the numbered flow (Sign Up through Account Ready)
The uploaded files serve only as guides and former design drafts I had not compulsory templates. The dashboard image I uploaded is a sample for a returning user I created earlier but not yet defined as the standard too, you can only get some ideas from it. The home dashboard of the new user will also have 2 different cards to quickly navigate them to either JAMB CBT Exam mode and challenges section too.

OUTPUT:
After building, list which screens deviate from the original SJEE onboarding 
spec and why, so I have a clear record of what's now intentionally different 
from the base documents.

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now the new-user Home Dashboard, App shell, and index.html.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: get_webview_logs]_

No console errors. Let's step through the flow to confirm navigation works before handing off.

_[tool: check_design_system]_

Rename to avoid the collision.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: check_design_system]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: check_design_system]_

Clean.

_[tool: ready_for_verification]_

Built as `ui_kits/kairo-onboarding/` (Welcome → Sign In/Sign Up → Verify Email → About You → Current Level → Personal Goal → Notifications → Account Ready → new-user Home), all from design-system components/tokens, with a segmented step indicator, Google-signup path that skips email verification, and an abstract geometric Kai mark replacing any robot imagery.

Deviations from the base SJEE onboarding spec (per your explicit direction):
1. **Screen order/set overridden** — your 10-screen sequence replaces §4.4/§4.6's original onboarding order.
2. **Sign Up fields reduced** — only Full Name, Email, Password (no confirm-password, no target university), vs. a richer original form.
3. **Target university dropped entirely** — not asked anywhere, though earlier drafts included it.
4. **Verify Email is conditional** — skipped outright on Google sign-up, present only on email sign-up.
5. **Course selection is skippable and drives auto-suggested, editable subjects** — not just a static picker.
6. **Current Level and Personal Goal added as new standalone, skippable screens** — not in the original spec's flow.
7. **Account Ready copy is personal/narrative** ("You're all set...") rather than a transactional "Account Created Successfully."
8. **Home Dashboard is genuine new-user empty state** — Mission Card reframed as a suggested diagnostic (not a gate), no fabricated streak/level/history, plus two new dedicated CBT Exam Mode / Challenges promo cards beyond the Quick Actions grid.
9. **Primary CTA fill** now Deep Navy (`#012748`) throughout — the shared Button component already defaulted to Navy, confirmed consistent here.

Not done (flagging, didn't touch): didn't add CBT Exam Mode, Learn, or Challenges as built-out screens — Home just links out to them per your instruction to stop at the Home Dashboard.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

Now wire the data-URI constants into all three usage sites.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: check_design_system]_

_[tool: ready_for_verification]_

Switched to base64 data-URI mask sources (same-origin, so CSS masking works reliably) across `brand-kairo-logo.html`, `Login.jsx`, and the onboarding flow's `KairoWordmark`. Design system compiles clean.

## User

You are refining the existing onboarding flow—not redesigning it from scratch.

Keep the approved Kairo Design System completely unchanged.

Keep the visual language, spacing, typography, colours, components and interaction patterns exactly as they are.

Only improve the onboarding experience based on the following product feedback.


---

1. Replace the first screen completely

The current screen says:

> "We don't recognise this device."



Remove this screen entirely.

It creates unnecessary friction and starts the experience with a technical message instead of an emotional welcome.

The first screen after the Splash Screen should feel calm, premium and aspirational.

Its purpose is to welcome students into Kairo.

It should contain:

Kairo wordmark (no oversized logo treatment)

One strong headline

One short supporting paragraph

Primary button: Get Started

Secondary text button: I already have an account


Do not include any technical messaging about devices.

Do not include the circular graphic currently above the logo.

Use the extra space to create more breathing room.

The feeling should be:

> "You're beginning something meaningful."




---

2. Restore the onboarding introduction

Before account creation, introduce new users to Kairo.

The onboarding should remain concise.

Use the approved onboarding screens that communicate:

Built to Last.

Learn by Doing.

Meet Kai.

Small Steps. Big Results.

Seize the Moment.


Do not increase the number of onboarding screens.

Maintain the existing visual quality.


---

3. Keep Sign Up screen

The Create Account screen is approved.

No major redesign is needed.

Retain:

Continue with Google

Name

Email

Password


Only make minor spacing improvements if necessary.


---

4. Improve "Tell us about yourself"

This screen needs functional improvements.

Current behaviour is too restrictive.

Instead:

Exam Year

Keep as segmented buttons.

Intended Course

Keep searchable.

Subjects

Do NOT automatically lock students into the suggested subjects.

Instead:

When a course is selected:

Suggest the recommended UTME subjects.

Pre-select them.

Allow students to deselect any subject.

Allow students to search the complete UTME subject list and add/remove subjects freely.


This should feel like intelligent assistance, not forced automation.

The UI should clearly support:

✓ remove suggested subject

✓ add another subject

✓ search UTME subjects

Students remain in control.


---

5. Completion screen

Current completion screen is good.

Keep it.

Minor spacing refinements only.


---

6. Home Dashboard correction

The Challenges card is inaccurate.

Replace the current description.

Challenges are not self-practice.

Challenges are community competitions.

Update the copy to reflect that students compete against other learners.

Example direction:

> Compete with students across Nigeria.



> Climb the leaderboard.



> Test yourself against the community.



Do not imply Challenges are solo practice.

There should be a horizontal navbar as we rightly pointed at the bottom of the screen indicating navigating to home, practice, CBT, review and insights. The top right profile image is for navigation to profile area. we'll build that lat

---

7. Preserve Product Philosophy

Every screen should reinforce:

learning through questions

calm confidence

premium simplicity

intentional progress


Avoid generic educational app patterns.

Avoid unnecessary illustrations.

Avoid decorative graphics that do not serve the experience.

Whitespace should remain a primary design element.


---

Output

Refine the existing onboarding workflow using these instructions.

Do not redesign the Design System.

Do not generate alternative concepts.

Update the existing interactive prototype so it is production-ready and consistent with Kairo's product philosophy.


---

One additional recommendation: I would also simplify the flow itself. The ideal new-user journey would be:

1. Splash Screen (1–2 seconds)


2. Onboarding carousel (5 screens)


3. Welcome screen ("Seize the Moment." + Get Started / I already have an account)


4. Create Account / Sign In


5. Tell us about yourself


6. Account Ready


7. Home Dashboard



This sequence feels much more intentional than asking users to create an account immediately after the splash screen. It lets Kairo establish its identity before requesting information, while still keeping the onboarding short and focused.

Next is practice flow, question experience and CBT mode

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: dc_write]_

_[tool: delete_file]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update the App flow (remove verify/level/goal/notif from sequence, add intro carousel first) and Home Dashboard (Challenges copy + bottom nav).

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now Screens2/3 still export unused VerifyEmail/CurrentLevel/PersonalGoal/Notifications — harmless but let's verify compile and check.

_[tool: check_design_system]_

_[tool: show_html]_

_[tool: get_webview_logs]_

Clean, no console errors.

_[tool: ready_for_verification]_

Refined the flow per feedback:

- New sequence: Intro carousel (5 slides, unchanged) → Welcome → Sign Up/Sign In → Tell us about yourself → Account Ready → Home. Dropped Verify Email, Current Level, Personal Goal, Notifications steps entirely per your simplification.
- Welcome screen rewritten: wordmark only (no circular graphic), "Begin something meaningful." headline, calm supporting copy, no device/technical language.
- Subjects on "Tell us about yourself" are now suggested + pre-checked but freely removable (chip with ×), plus a searchable full UTME subject list to add more — no lock-in.
- Home Dashboard: Challenges card now reads "Compete with students across Nigeria. Climb the leaderboard." (community framing, not solo practice); added a bottom nav bar (Home/Practice/CBT/Review/Insights).
- Design system, tokens, and Sign Up/Account Ready screens untouched beyond minor spacing.

## User

We are now designing Kairo's core learning experience.

The Design System is LOCKED.

Do not redesign the Design System.
Do not introduce new colours, typography, spacing, shadows, or components.
Use only the approved Design System.

This is the heart of Kairo.

The experience must feel calm, intelligent, focused and premium.

Kairo is not a quiz app.

Students learn through questions.

Every screen should reinforce that philosophy.

----------------------------------------------------
DESIGN THE COMPLETE QUESTION EXPERIENCE
----------------------------------------------------

Create a complete production-ready interactive flow for:

1. Practice Mode
2. CBT Exam Mode

These should feel like two modes of the same operating system—not separate products.

====================================================
PART 1 — PRACTICE MODE
====================================================

Design the complete flow including:

• Subject selection
• Topic selection
• Sub-topic selection (where applicable)
• Difficulty selection (Adaptive, Easy, Medium, Hard)
• Session setup
• Question screen
• Correct answer state
• Wrong answer state
• Explanation screen
• AI teaching panel
• Bookmark question
• Report question
• Confidence rating after answering
• Continue to next question
• End of practice summary
• Performance insights
• Suggested next action

----------------------------------------------------
QUESTION SCREEN
----------------------------------------------------

This is the most important screen in Kairo.

The interface should feel extremely clean.

Large readable question.

Enough whitespace.

One question at a time.

No unnecessary decorations.

Include:

• Question number
• Progress indicator
• Timer (optional for timed sessions)
• Subject badge
• Bookmark
• Report icon
• Four answer options
• Submit button (disabled until an option is selected)

After answering:

Correct answer should animate subtly.

Wrong answer should clearly indicate the correct answer.

Never use loud celebration animations.

----------------------------------------------------
EXPLANATION EXPERIENCE
----------------------------------------------------

Every question becomes a learning opportunity.

Below every answered question display:

Why this answer is correct.

Why the other options are wrong.

Common mistake students make.

Key concept.

Exam tip.

If appropriate:

Kai provides a short personalised explanation.

Keep explanations concise.

----------------------------------------------------
KAI ASSISTANT
----------------------------------------------------

Kai should feel like a calm tutor.

Not a chatbot.

Possible actions:

Explain again

Give another example

Simplify

Teach from scratch

Show formula

Show memory trick

Never open a chat interface.

====================================================
PART 2 — CBT EXAM MODE
====================================================

Design a realistic JAMB CBT experience.

This mode should closely simulate the real examination.

Include:

Exam setup

Instructions

Subject combination

Question navigation

Question palette

Timer

Calculator (where appropriate)

Flag question

Previous

Next

Jump to question

Submit confirmation

Time warning

Exam submitted screen

Performance summary

Review incorrect questions (if allowed)

====================================================
QUESTION NAVIGATION
====================================================

Allow students to:

Skip questions

Return later

Flag difficult questions

Navigate through numbered questions

View remaining unanswered questions

====================================================
PERFORMANCE SUMMARY
====================================================

After every practice session and CBT session include:

Questions answered

Accuracy

Time spent

Average time per question

Strongest subject

Weakest subject

Topics needing attention

Kairo Score gained

Streak update

Suggested next session

====================================================
MOTION
====================================================

Animations should be subtle.

Fade.

Slide.

Gentle transitions.

No bouncing.

No gamified explosions.

====================================================
VISUAL FEEL
====================================================

Think:

Apple Health

Linear

Notion

Calm

Confident

Premium

Intentional

Whitespace is a feature.

====================================================
OUTPUT
====================================================

Produce a complete interactive mobile UI prototype for the entire Practice Mode and CBT Exam Mode.

Every screen should be connected into one seamless user journey.

Do not explain design decisions.

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now the main CBT exam screen — the most complex piece.

_[tool: write_file]_

Now the CBT submitted/summary screen and the App shell wiring everything.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: check_design_system]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: check_design_system]_

_[tool: show_html]_

_[tool: get_webview_logs]_

Clean — no console errors, no DS issues. Handing off for verification (this is a large flow, worth a real click-through pass).

_[tool: ready_for_verification]_

Built `ui_kits/kairo-learning/` — a single connected prototype covering both modes, using only locked design-system tokens/components:

**Practice Mode:** Mode select → Subject → Topic → Subtopic (skippable) → Difficulty → Session length setup → Question screen (progress bar, subject badge, bookmark, report) → submitted state (correct/wrong styling, no loud animation) → explanation block (mistake/concept/tip) → Kai panel (calm tutor actions: explain again, another example, simplify, teach from scratch, formula, memory trick — no chat UI) → confidence rating → next question → end-of-practice summary (accuracy, avg time, strongest/weakest subject, topic needing attention, Kairo Score, streak, suggested next action).

**CBT Exam Mode:** Exam setup (subject combination) → instructions → timed exam screen (countdown, subject badge, calculator modal, question palette modal with per-subject grids showing answered/flagged/current, flag toggle, prev/next) → 5-minute time warning toast → submit confirmation modal → auto-submit at 0:00 → submitted summary (by-subject accuracy, Kairo Score, suggested next) → review-incorrect-questions screen.

Motion is limited to fades/transitions on existing token durations, no bounce/celebration. Fixed a duplicate-component-name and a few literal `\u2014` escape bugs before verification.

## User

Found issues — fixing…

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Fixed: added a stable `key` to `PracticeQuestion` so it remounts fresh per question instead of carrying over stale state.

