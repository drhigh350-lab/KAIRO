CLAUDE CODE EXECUTION SPECIFICATION: HOME DASHBOARD UI/UX POLISH "To ensure Claude respects the established aesthetic and doesn't inject generic AI design tropes into the Home Dashboard, we must command it to run a strict "Vetting Audit" before it touches a single line of code.
Here is the exact, multi-stage prompt to feed into Claude Code to execute this high-end UI polish for the Home screen.
### CLAUDE CODE EXECUTION SPECIFICATION: HOME DASHBOARD UI/UX POLISH
**CONTEXT:** Kairo is a premium, offline-first learning PWA for UTME candidates. The UI must feel like a high-end academic tool—authoritative, clean, and distraction-free.
**DESIGN FRAMEWORK DEFINITIONS (STRICT ADHERENCE REQUIRED):**
*   **Impeccable Framework (Audit Protocol):** Audit interfaces for visual noise. Level 1: Fix readability, mobile overflow, low contrast, and tap targets <44px. Level 2: Fix whitespace balance, grid alignment, and card density. Level 3: Polish hover states and subtle borders. 
*   **Emil's Skills (Interaction Rules):** If an animation doesn't give functional feedback, remove it. Keep transitions fast and snappy (150ms ease-out). Use `active:scale-[0.98]` for tactile button presses. 
*   **Frontend Design / Taste:** Avoid generic SaaS templates. No bouncy animations, no purple/blue gradients, and no heavy drop-shadows. Maintain a brutalist, clean, and highly technical editorial feel using the established dark navy and gold tokens.
**DESIGN TOKENS:**
 * **Backgrounds:** Deep dark navy.
 * **Surfaces:** Use bg-white/5 with subtle border-white/10 strokes for cards instead of muddy drop-shadows.
 * **Accents:** Pure gold/brown is strictly reserved for Primary Actions and Gamification highlights (Streak Flame, Kairo Score).
 * **Typography:** Clean sans-serif (e.g., Inter) for reading; Monospace for all numbers (Scores, Timers, Streaks) to convey data precision.
 * **Spacing:** Strict 8px/4px grid system (gap-2, gap-4, p-4).
#### STAGE 1: The "Impeccable" Vetting Audit (ACTION REQUIRED FIRST)
Before modifying the Home Dashboard component (e.g., Home.tsx or Dashboard.tsx), audit the existing code against Kairo's design tokens.
 1. **Identify Clutter:** Locate any redundant text, generic purple/blue gradients, or heavy drop shadows.
 2. **Evaluate Hierarchy:** Does the "Daily Recommendation" hold the absolute dominant visual weight? Are other practice options properly subordinated?
 3. **Report:** Output a bulleted list of UI violations and your proposed fixes for my approval before executing the code changes.
#### STAGE 2: Execute the Layout Refactor (Upon Approval)
Implement the following structural polish using the KISS principle (Keep It Short and Simple):
 * **The Header:** Consolidate any double/cluttered taglines into a single, clean welcome message emphasizing direction.
 * **Gamification Row (Top):**
   * **Kairo Score:** Render the total score using a monospace font. Include an unobtrusive (i) tooltip icon next to it explaining the +10 bonus rule.
   * **Streak Flame:** Render the flame icon with the streak number directly underneath it. If the daily recommendation is incomplete, render it dimmed (opacity-50 or grayscale).
 * **The Action Zone (Center):**
   * **Priority 1:** The Daily Recommendation card. This must have a subtle gold border or highlight. Use the student-centered copy framework (e.g., *"Let's secure your formula accuracy in Simple Interest"*).
   * **Priority 1.5 (Dynamic):** If a planner topic was just completed, inject the Verification CTA here: *"Topic Completed. Take a 5-minute quiz to lock it in."* (High-contrast, actionable).
   * **Priority 2:** Secondary Quick Actions (Topic Practice, CBT). These must be styled as flat or transparent ghost cards to avoid competing with the Recommendation.
#### STAGE 3: "Emil's Skills" (Micro-interactions & Polish)
 * Remove all slow, floaty UI animations.
 * Apply a snappy, tactile active:scale-[0.98] class to all clickable cards and buttons with a fast duration-150 ease-out transition.
 * Ensure SVG assets (like the Kai mascot or Flame) utilize the previously built shimmer/skeleton loaders to prevent layout shift.
By forcing Claude to output the Stage 1 Audit first, you retain total control over Kairo's visual direction.
Once Claude runs this audit on the Home screen, it will likely flag a few specific layout issues.
