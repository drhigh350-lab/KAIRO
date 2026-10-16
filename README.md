# Kairo — Adaptive UTME/JAMB Learning Operating System

Kairo is a full-featured, mobile-first React application and adaptive learning engine designed to prepare students for Nigerian UTME/JAMB examinations. Built for genuine long-term memory retention rather than surface-level pattern recognition.

---

## Architecture & Features

### Core Modules
- **Adaptive Practice Engine (`PracticeFlow`)**: Dynamic topic and subtopic selection across UTME subjects (Mathematics, Chemistry, Physics, Biology, Use of English) with knowledge graph retention tracking (Fresh, Forming, Held, Fading, Forgotten).
- **CBT Exam Mode (`CbtFlow`)**: Authentic JAMB computer-based test simulation with authentic exam timing, per-subject question banks, live calculator, flag/review controls, and comprehensive exam analytics.
- **Study Planner (`PlannerFlow`)**: Intelligent study schedule generator aligned with official JAMB syllabi, tracking daily milestones, spaced repetition revision sessions, and verification tests.
- **Arena & Challenge Hub (`ChallengesFlow`, `CreateQuizFlow`, `DiscoverScreen`)**: Public and peer-to-peer challenges, daily rotations, and community quiz creation.
- **Spaced Sandbox & Mistake Triage (`Review`)**: Error pattern classifier, distractor analysis, misconception diagnostics, and mistake patching with 72-hour cooling windows.
- **Student Profile & Readiness (`Profile`, `Leaderboard`)**: UTME target score estimation, weekly momentum streaks, Kai Points, badge vault, and leaderboard rankings.
- **Intelligent Feedback (`KaiAi`, `ExplanationEngine`)**: Pedagogical mentor guidance, calculation breakdowns, and distractor traps analysis.

---

## Tech Stack
- **Framework**: React 19 (Vite)
- **Routing**: React Router v7
- **Types**: TypeScript
- **Styling**: Design System CSS variables & responsive layout tokens
- **Math/Formulas**: KaTeX
- **Persistence & Cloud**: Supabase (Auth, Postgres, Realtime Sync) with offline-first local caching
- **PWA**: Service Worker caching, offline support, install prompt

---

## Development & Build

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Run test suite
npm test --workspace=kairo-learning-engine

# Build for production
npm run build
```
