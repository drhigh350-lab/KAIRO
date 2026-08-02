# Kairo Design System

Kairo is **TECHMED's** AI-powered UTME Learning Operating System — built to help Nigerian students preparing for the UTME (JAMB) exam study intelligently through structured practice, personalised learning, and consistent progress. TECHMED's parent brand promise is "Think Smart. Perform Elite."; Kairo's own promise is "Seize the Moment."

Kairo's philosophy: **students learn through questions, not digital textbooks.** The product is organised around eight intent-based destinations — Home, Practice, CBT Exam Mode, Challenges, Learn, Review, Insights, Profile — all reading from one continuously-updating Student Intelligence Model. A mascot/AI companion named **Kai** speaks throughout the product in a calm, specific, evidence-based mentor voice — never generic, never guilt-based, never comparative.

This design system is the single source of truth for every Kairo interface. **Never redesign approved components unless explicitly instructed.**

## Sources provided
- Brand marks: Kairo splash/login screenshots, TECHMED logo (mark + lockups, navy & white)
- Product screenshots: onboarding carousels (x2), login, home dashboard (iOS status-bar mockups)
- Product specifications (markdown, TECHMED/Kairo internal docs — no code repo or Figma file was attached, so this system was built from these specs + screenshots, not a live codebase):
  - kairo-product-experience-blueprint.md — the 8-destination IA
  - kairo-home-dashboard.md — Today's Mission Card, dashboard hierarchy
  - kairo-practice-module-specification.md — Practice entry points, session creation, question player
  - kairo-question-experience-specification.md — shared question/answer/explanation UI used by every mode
  - Kairo Learning Module.md — Learn (understanding-repair lessons)
  - Kairo_Review_Module.md — Review (consolidation, Reflection Moment, Pattern Surfacing)
  - _KAIRO INSIGHTS MODULE.md — Daily/Weekly/Monthly reflection, KAIRO Score
  - kairo-student-journey-engagement-engine.md — onboarding, milestones, notifications strategy
  - KAIRO NOTIFICATIONS & COMMUNICATION SYSTEMS.md — notification taxonomy & channels
  - KAIRO PROFILE & SETTINGS.md — Profile/Goals/Achievements/Account Settings

No GitHub repo or Figma file was attached. If one exists, re-attach it via the Import menu so future updates can be pulled from source rather than from screenshots + specs.

## Design principles
1. **Calm over noisy** — one primary action per screen; supporting data is quiet and secondary.
2. **Premium over playful** — restrained motion, no cartoonish flourishes; Gold is earned, not decorative.
3. **Structured over cluttered** — plain-language hierarchy (Mission → why → action), never a wall of stats.
4. **Motivating without becoming childish** — specific, evidence-based encouragement; never generic praise.
5. **Intelligent without feeling intimidating** — Kai explains "why" in one sentence; internal state (scores, decay %) is never shown raw.

## Content fundamentals
- **Voice:** Kai — a mentor who has been quietly paying attention, not a system reporting metrics. First-person system language ("I have recorded 47 attempts") is banned; observational, human language is used instead ("You worked through a lot this week, and it shows most clearly in Chemistry").
- **Address:** direct second-person ("you"/"your"). Kai refers to itself in first person sparingly and warmly, never clinically.
- **Specificity over generic praise:** every encouraging line names something real — a concept, a subject, a count, a day. "Great job!" is never acceptable output; "You remembered the redox concept yesterday — that's the second time it's stuck" is the standard.
- **Never:** bare judgment ("wrong", "failed", "behind"), comparative/leaderboard language in personal feedback, guilt or urgency framing ("we miss you", "don't lose your streak", "you're falling behind"), raw internal metrics shown unexplained (a percentage or score always ships with a one-sentence plain-language reason).
- **Sentence rhythm:** short, declarative, warm. Headlines are punchy fragments with a full stop ("Built to Last.", "Small Steps. Big Results.", "Seize the Moment."). Body copy explains in one or two calm sentences, never a paragraph.
- **Casing:** Sentence case throughout — headings, buttons, labels. Never ALL CAPS except tiny eyebrow labels (e.g. "TODAY'S MISSION") at small size with letter-spacing.
- **Emoji:** essentially unused. The one sanctioned exception in source material is a single wave "👋" in a home-dashboard greeting ("Good morning, Wisdom 👋") — treat emoji as rare, human punctuation, never decoration, never in buttons/headings/system copy.
- **Numbers:** always paired with meaning, never standalone ("68% accuracy — and specifically weaker on multi-step Chemistry questions" rather than "68%").

## Visual foundations
- **Colour:** Deep Navy `#012748` is the primary brand colour (headlines, primary buttons, the Mission Card surface). Professional Blue `#09476E` is the secondary accent (links, secondary actions, focus states). Soft Blue `#98B0C4` is used for backgrounds, dividers and supporting UI (illustration washes, disabled states, subtle borders). White `#F8F9FA` is the primary canvas. **Gold is reserved exclusively for achievements, milestones and celebration** — streak flames, the "Moment." wordmark accent, badge treatments — never for ordinary UI chrome or CTAs. Semantic green/red are used only for correct/incorrect answer feedback, always paired with an icon + label (never colour alone).
- **Typography:** Headlines in Poppins/Montserrat (geometric, rounded-adjacent, confident — matches the logo's geometric "Kairo" wordmark). Body text in Inter for maximum mobile legibility. Minimum 16pt/15px body size on mobile; question stems render at 16–18pt with 150% line height per the product spec.
- **Spacing & layout:** mobile-first, single-column, generous whitespace. One primary card/action per screen is the norm (Today's Mission Card, one question at a time). Bottom nav is max 5 items.
- **Backgrounds:** flat white/soft-blue canvases — no gradients, no busy patterns. The one exception is illustration/photography washes behind onboarding and auth screens (a soft radial soft-blue glow, desk/plant/lamp line art). No full-bleed photography inside the core app past onboarding.
- **Imagery:** two registers appear in source material — (a) warm, naturalistic illustrated portraits of Nigerian students studying (used in onboarding), and (b) a friendly rounded robot mascot "Kai" with a glowing "K" chest badge, rendered in the same illustration style. Imagery is warm, optimistic, soft-lit — never stock-photo cold, never black-and-white, no heavy grain.
- **Animation:** restraint is the rule. A single subtle settle-in/fade on card entrance; gentle fade-in on scroll reveal; no bounce, no confetti-style motion. The one exception is the rare "Wisdom Spark" celebration moment (genuine milestones only) — reserved so heavily that overuse would destroy its meaning.
- **Hover/press states:** hover darkens primary surfaces one step (Navy → darker Navy) or shifts text to Navy on link-blue; press states use a subtle scale/opacity dip, never a colour flip to an unrelated hue.
- **Borders & shadows:** correct/incorrect feedback uses a coloured **left border** treatment (green/red) paired with icon + label — never a full-card colour flood. Cards use soft, low-opacity Navy-tinted shadows (never black), 14–20px corner radius. Primary buttons and pills use fully-rounded (pill) corners; cards use 14–20px radius; the Mission Card — the signature surface — uses the largest radius (20px+) to read as the clear visual anchor.
- **Transparency/blur:** minimal — used only for subtle scrim/overlays behind modals, never as a primary surface treatment.
- **Corner radii:** buttons/pills fully rounded; cards 14–20px; small chips/badges 8–12px or pill.
- **Cards:** white surface, soft Navy-tinted shadow, no visible border in most cases (shadow does the separation), 16–20px internal padding, 14–20px radius. The Mission Card is the exception — it uses a **Navy-filled** surface (not white) to visually anchor it as the single most important element per screen.

## Iconography
No dedicated icon font or SVG icon library was included in the provided source material — screenshots show simple line icons (bell, envelope, lock, home/practice/CBT/review/insights tab icons, streak flame, target, book, shuffle, trend-arrow, bookmark) in a light, consistent stroke weight. Since no source icon set was attached, this system links **Lucide** icons (https://lucide.dev) from CDN as the closest stroke-weight/style match — flag this substitution to the user; if TECHMED has a proprietary icon set, re-attach it and this system should switch to it. Emoji are not used as icons. No unicode-character icons are used. The one Wisdom Spark / celebration motif and the streak "🔥"-style flame are rendered as proper icons (Lucide `flame`), not emoji, to stay consistent with the icon system.

## Logo & brand assets
- `assets/kairo-logo-lockup.png` — full Kairo lockup (K mark + wordmark + "Seize the Moment." tagline), on canvas background.
- `assets/kairo-mark.png` — the Kairo "K" mark alone, cropped for icon/favicon use.
- `assets/techmed-mark.png` — the TECHMED shield/wing mark alone (Kairo is "Powered by TECHMED").
- `assets/techmed-lockup-white.png` / `assets/techmed-lockup-navy.jpg` — full TECHMED lockups (mark + wordmark + "Think Smart. Perform Elite.") on white and on navy.
- `assets/illustration-student-studying.png`, `assets/illustration-kai-mascot.png`, `assets/illustration-seize-the-moment.png` — onboarding illustrations extracted from source screenshots (Kai mascot, studying student, "K on a pedestal" hero art).

These are the only real brand assets available. No additional logos, icons, or illustrations were invented.

## Fonts
Poppins, Montserrat and Inter are all standard, freely-licensed Google Fonts — no substitution was needed; `tokens/typography.css` loads them directly from Google Fonts CDN. If TECHMED has licensed static font files instead, drop them into `assets/fonts/` and swap the `@import` for `@font-face` rules.

## Index — what's in this project
- `styles.css` + `tokens/` — global CSS tokens (colors, typography, spacing, shadows, base resets)
- `assets/` — logos and illustrations (see above)
- `guidelines/` — foundation specimen cards (Design System tab: Brand, Colors, Type, Spacing groups)
- `components/` — reusable React UI primitives, grouped by concern:
  - `components/core/` — Button, IconButton, Input, Checkbox, Radio, Switch, Badge, Tag, Chip
  - `components/feedback/` — Card, AnswerFeedback, Toast, ProgressBar, StreakBadge, ScoreBadge
  - `components/navigation/` — BottomNav, TopBar, Tabs
  - `components/kairo/` — MissionCard, KaiMessage, QuestionCard, SessionSummaryCard (Kairo-specific composite components)
- `ui_kits/kairo-app/` — click-through recreation of the Kairo mobile app: onboarding, login, home dashboard, practice/question player, session summary, review, insights, profile
- `SKILL.md` — Claude-Code-compatible skill wrapper for this design system

## Intentional additions
No component-library source (codebase or Figma) was attached — only product specs and screenshots — so per the "brand-guidelines-only" path, a standard component set was authored, sized to what the specs and screenshots actually depict (no Tabs/Dialog/Tooltip were invented beyond what's needed for the UI kit screens shown).
