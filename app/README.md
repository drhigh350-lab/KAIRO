# Kairo V1 shell

The first coherent shell of Kairo's V1 information architecture. This is a
real, running app — not a mockup — that imports `KairoEngine` directly from
`../src` and renders its actual decisions. It holds no learning logic of
its own; see `src/engine/EngineProvider.jsx` for the one integration
boundary every screen goes through.

## Run it

```
cd app
npm install
npm run dev
```

## What's real vs. temporary here

**Real, unmodified:** every engine call (`engine.startSession()`,
`engine.submitAnswer()`, `engine.review.buildDailyRecap()`,
`engine.learn.fromIncorrectAnswer()`, `engine.insights.getDashboardInsights()`,
etc.) — see `docs/KAIRO_V1_PRODUCT_TRUTH.md` and the root `docs/ARCHITECTURE.md`
for what each of these actually does.

**Temporary, and clearly isolated to make swapping it out obvious:**
- `src/engine/demoContent.js` — a small, hand-authored, real-content
  question bank (6 concepts, 12 questions, Chemistry + Biology), seeded
  directly into `engine.graph`/`engine.questionGraph` because this shell
  has no Supabase credentials to call `engine.connectSupabase()` +
  `engine.loadContentCatalog()` with. A real deployment deletes this file
  and calls those two methods instead — nothing else changes.
- `EngineProvider`'s fixed `DEMO_STUDENT_ID` — stands in for real
  Supabase Auth. A real deployment replaces this with `connectSupabase()`.

## Where things live

```
src/
  engine/
    EngineProvider.jsx   the one integration boundary — every screen calls useEngine()
    demoContent.js        temporary local seed data (see above)
  lib/
    copy.js               the only place internal engine vocabulary
                           (retentionState, macroState, errorTag) is
                           allowed to become a sentence
  components/
    TopBar.jsx, BottomNav.jsx
  screens/
    Home.jsx               Today — orientation layer
    Practice.jsx            the adaptive practice loop
    Review.jsx               retention surface
    Learn.jsx / LearnLesson.jsx   comprehension-repair
    Progress.jsx            retention/consistency signal, not a metrics wall
    Profile.jsx              quiet, secondary, reached via the top bar only
```
