# Kairo Learning Engine

> **Think Smart. Perform Elite.**

Kairo is the AI-powered learning engine behind [TECHMED](https://techmed.pages.dev/). It is not a quiz app. It is an academic operating system designed to help Nigerian students become better learners — not just better test-takers.

## Philosophy

Every subsystem exists to answer one question, continuously, per student:

**"What is the next best thing this student should do right now to improve?"**

If a design decision can't be traced back to that question, it doesn't belong in the engine.

## What Makes Kairo Different

| Standard CBT App | Kairo |
|---|---|
| Tracks correct/incorrect counts | Tracks *why* you got it wrong |
| Static question banks | Living knowledge graph with prerequisite chains |
| Generic XP points | **Elite Score** — rewards retention and consistency, not volume |
| Binary "mastered / not mastered" | Five retention states: Unseen → Forming → Held → Fading → Reinforced |
| Fixed difficulty | Per-concept adaptive difficulty with macro-state awareness |
| Punishing streaks | **Momentum Streak** with protected gap days |
| Generic "Great job!" | **Kai** — a senior mentor who notices specific things |
| Online-only | Offline-first with intelligent sync |

## Architecture

```
kairo-learning-engine/
├── src/
│   ├── core/              # Knowledge graph, retention states, decay curves
│   ├── engine/            # Recommendation, scoring, difficulty, error classification
│   ├── kai/               # Behavioral framework for the AI mentor
│   ├── memory/            # Spaced repetition & revision scheduling
│   ├── student/           # Macro-states, profile, recovery
│   ├── motivation/          # Momentum streak, reflections, wrapped
│   ├── data/              # Offline-first IndexedDB storage
│   ├── sync/              # Conflict resolution & merge logic
│   └── utils/             # Constants, helpers, math utilities
├── tests/                 # Core engine test suite
└── docs/                  # Architecture documentation
```

## Quick Start

```javascript
import { KairoEngine } from './src/index.js';

const kairo = new KairoEngine({
  studentId: 'student_001',
  name: 'Wisdom',
  examDate: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days to UTME
  targetSubjects: ['Chemistry', 'Physics', 'Biology'],
  targetCourse: 'Medicine and Surgery'
});

await kairo.init();

// Add curriculum concepts
const moleId = kairo.addConcept({
  name: 'Mole Concept',
  subject: 'Chemistry',
  topic: 'Stoichiometry',
  subtopic: 'Mole Calculations',
  difficultyWeight: 1.2,
  questionPoolIds: ['q1', 'q2', 'q3']
});

// Start a session
const session = kairo.startSession();
console.log(session.kaiMessage.text);
console.log('Plan:', session.queue);

// Answer a question
const result = kairo.submitAnswer({
  conceptId: moleId,
  correct: true,
  responseTimeMs: 12000,
  selectedOption: 'A',
  correctOption: 'A',
  questionId: 'q1',
  questionDifficulty: 1
});

console.log(result.kaiResponse.text);
console.log('Next concept:', result.decision.nextConceptId);

// End session
const summary = await kairo.endSession();
console.log('Elite Score:', summary.eliteScore.total);
```

## Core Concepts

### Retention States

| State | Meaning |
|---|---|
| **Unseen** | No exposure yet |
| **Forming** | Currently learning; needs more practice |
| **Held** | Demonstrated understanding; subject to decay |
| **Fading** | Decay estimate dropped — urgent review needed |
| **Reinforced** | Successfully recalled after fading. *This is real learning.* |

### Elite Score (Replaces XP)

- **Accuracy (45%)** — weighted by difficulty and recency
- **Retention (35%)** — rewards Reinforced transitions
- **Consistency (20%)** — sustainable rhythm, not unbroken streaks

*The score is never reduced by missing a day.*

### Error Pattern Classification

Every wrong answer is tagged with *why* it happened:
- `conceptual_gap` — doesn't understand the idea
- `careless_slip` — understood, execution error
- `misapplied_rule` — confused two adjacent concepts
- `partial_understanding` — right approach, wrong final step
- `guessed` — no real reasoning detected
- `misread_question` — comprehension error, not knowledge gap

### Kai's Behavioral Rules

1. Never say "wrong" as a standalone judgment
2. Never compare the student to others in 1-on-1 moments
3. Never use guilt-based re-engagement
4. Match energy to macro-state (warm when wavering, sharp when compounding)
5. Specificity over enthusiasm
6. Explain the *system*, not just the answer

## Running Tests

```bash
node tests/engine.test.js
```

## Integration Notes

- **Frontend (PWA):** Import `KairoEngine` directly. It uses IndexedDB for offline storage.
- **Backend (Cloudflare Workers / Node):** Use the same engine logic server-side for analytics and cross-device sync.
- **Sync:** `SyncManager.merge()` handles conflicts — most recent attempt wins for state, all attempts are retained.

## Brand

- **TECHMED** — The ecosystem
- **Kairo** — The learning intelligence platform
- **Kai** — The AI study companion
- **Tagline:** Think Smart. Perform Elite.

## License

MIT — Built for Nigerian students. Built to last.
