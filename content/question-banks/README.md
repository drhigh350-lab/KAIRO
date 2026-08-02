# Question Banks

Raw and QIM-imported UTME question content, kept separate from `src/`
(engine code) the same way `design-system/` is kept separate — this is
content, not implementation.

Each subject folder holds:
- the original CSV as delivered (provenance / source of truth for re-import)
- a generated `*.json` in QIM `Question` shape (`src/qim/Question.js`),
  produced by `scripts/import-question-bank.js`

## biology/ — Biology UTME Revelation (200 questions)

- Source: partner-provided, pre-verified question bank (content
  accuracy already crosschecked upstream — not re-verified here).
- Structural import: 200/200 rows converted, 0 skipped (every row has
  exactly one correct option, a non-empty stem, and both a correct-answer
  explanation and distractor rationale).
- `lifecycleState: 'imported'` — these have NOT yet been through the
  remaining `QuestionLifecycle` QA gates (concept attachment, difficulty
  calibration, misconception mapping to distractors, duplicate detection
  against existing content). `conceptsTested`, `prerequisiteConcepts`,
  `distractors[].misconceptionId`, and `learningObjective` are placeholders
  (empty/null) pending that pass — this file is not yet safe to serve
  live; it needs to move through `reviewed → tagged → linked → assigned →
  ready` first, same as any other imported content.
- Not yet seeded into `kairo.questions` in Supabase (that table is still
  empty — see `docs/SUPABASE_SETUP.md` §6).

## chemistry/ — TechMed JAMB Chemistry Question Bank (200 questions)

- Source: `TechMed_JAMB_Chemistry_Questions.csv`, columns `Subject, Topic,
  Q#, Question, Option A-D, Correct Answer, Explanation, Why Other
  Options Are Wrong` (a different column-naming convention from the
  Biology bank — the importer now handles both).
- Structural import: 200/200 rows converted, 0 skipped (same checks as
  Biology: exactly one correct option per row, non-empty stem, non-empty
  explanation and distractor rationale, no duplicate Q# or duplicate
  question text). Single subject (Chemistry), 17 topics.
- `lifecycleState: 'imported'` — same caveat as Biology: not yet through
  the remaining QA gates (concept attachment, misconception mapping,
  difficulty calibration), and not yet seeded into `kairo.questions`.
- Content accuracy has not been independently re-verified here (mirrors
  how Biology was handled) — flag any suspected error back through the
  normal review path rather than treating this as QA-passed content.

## Regenerating the JSON from CSV

```
node scripts/import-question-bank.js \
  content/question-banks/biology/Biology_UTME_Revelation_200_Questions.csv \
  content/question-banks/biology/biology_utme_revelation_200.json \
  --subject Biology --examBody JAMB --source "UTME Revelation"

node scripts/import-question-bank.js \
  content/question-banks/chemistry/TechMed_JAMB_Chemistry_Questions.csv \
  content/question-banks/chemistry/chemistry_jamb_200.json \
  --examBody JAMB --source "TechMed JAMB Question Bank"
```

The importer accepts either column convention: `Question Number` or
`Q#`; `Explanation (Why Correct)` or `Explanation`; an explicit
`--subject` flag or a `Subject` column in the CSV itself.
