/**
 * Kairo V1 shell — demo content + demo progress seeding.
 *
 * IMPORTANT SCOPE NOTE: in a real deployment this never runs. A real
 * client calls `engine.connectSupabase()` then `engine.loadContentCatalog()`
 * (see docs/HANDOFF_BRIEFS.md) to pull the real 877-question live bank from
 * `kairo.questions`/`kairo.concepts`. This shell has no Supabase credentials
 * to connect with, so it seeds a small, hand-authored, real-content demo
 * bank directly into the same `engine.graph` / `engine.questionGraph`
 * `loadContentCatalog()` would otherwise populate — same shapes, same
 * public methods (`engine.addConcept`, `Question`, `questionGraph.addQuestion`),
 * no engine logic reimplemented here.
 *
 * The retention states below are not hardcoded — they're produced by
 * feeding real (backdated) attempts through `ConceptNode.recordAttempt()`,
 * the actual state-machine entry point, so every screen that reads
 * `concept.retentionState`/`decayEstimate` is reading a genuinely computed
 * value, not a UI fixture.
 */
import { Question } from '../../../src/index.js';

const DAY = 24 * 60 * 60 * 1000;
const ago = (days) => Date.now() - days * DAY;

const CONCEPTS = [
  { key: 'mole', name: 'Mole Concept', subject: 'Chemistry', topic: 'Stoichiometry', subtopic: 'Mole Calculations', difficultyWeight: 1.0 },
  { key: 'balancing', name: 'Equation Balancing', subject: 'Chemistry', topic: 'Stoichiometry', subtopic: 'Balancing Equations', difficultyWeight: 1.8, dependsOn: 'mole' },
  { key: 'periodicTrends', name: 'Periodic Trends', subject: 'Chemistry', topic: 'Periodic Table', subtopic: 'Trends', difficultyWeight: 1.2 },
  { key: 'cellStructure', name: 'Cell Structure', subject: 'Biology', topic: 'Cell Biology', subtopic: 'Organelles', difficultyWeight: 1.0 },
  { key: 'cellDivision', name: 'Cell Division', subject: 'Biology', topic: 'Cell Biology', subtopic: 'Mitosis', difficultyWeight: 1.4, dependsOn: 'cellStructure' },
  { key: 'inheritance', name: 'Mendelian Inheritance', subject: 'Biology', topic: 'Genetics', subtopic: 'Punnett Squares', difficultyWeight: 1.3 }
];

const QUESTIONS = {
  mole: [
    {
      stem: 'How many moles are present in 44.8 dm³ of a gas at STP?',
      options: [{ label: 'A', text: '0.5' }, { label: 'B', text: '1' }, { label: 'C', text: '2' }, { label: 'D', text: '4' }],
      correctOption: 'C',
      explanation: 'At STP, 1 mole of any gas occupies 22.4 dm³. 44.8 dm³ ÷ 22.4 dm³/mol = 2 mol.',
      difficultyRating: 2
    },
    {
      stem: 'What is the mass of 0.5 mol of CaCO₃? (Ca = 40, C = 12, O = 16)',
      options: [{ label: 'A', text: '25 g' }, { label: 'B', text: '50 g' }, { label: 'C', text: '100 g' }, { label: 'D', text: '150 g' }],
      correctOption: 'B',
      explanation: 'Molar mass of CaCO₃ = 40 + 12 + (16 × 3) = 100 g/mol. Mass = moles × molar mass = 0.5 × 100 = 50 g.',
      difficultyRating: 2
    }
  ],
  balancing: [
    {
      stem: 'Balance: __N₂ + __H₂ → __NH₃. What are the coefficients, in order?',
      options: [{ label: 'A', text: '1, 3, 2' }, { label: 'B', text: '2, 3, 2' }, { label: 'C', text: '1, 2, 3' }, { label: 'D', text: '2, 1, 2' }],
      correctOption: 'A',
      explanation: 'N₂ + 3H₂ → 2NH₃ balances both nitrogen (2 = 2) and hydrogen (6 = 6).',
      difficultyRating: 3
    },
    {
      stem: 'In the balanced equation 2Mg + O₂ → 2MgO, how many moles of MgO form from 4 moles of Mg?',
      options: [{ label: 'A', text: '2' }, { label: 'B', text: '4' }, { label: 'C', text: '6' }, { label: 'D', text: '8' }],
      correctOption: 'B',
      explanation: 'The mole ratio of Mg to MgO is 2:2, i.e. 1:1 — so 4 mol of Mg produces 4 mol of MgO.',
      difficultyRating: 2
    }
  ],
  periodicTrends: [
    {
      stem: 'Which of these Group 1 elements has the largest atomic radius?',
      options: [{ label: 'A', text: 'Lithium (Li)' }, { label: 'B', text: 'Sodium (Na)' }, { label: 'C', text: 'Potassium (K)' }, { label: 'D', text: 'Rubidium (Rb)' }],
      correctOption: 'D',
      explanation: 'Atomic radius increases down a group as more electron shells are added — of these four, rubidium is lowest in the group and therefore largest.',
      difficultyRating: 2
    },
    {
      stem: "Across a period, from left to right, an element's first ionization energy generally:",
      options: [{ label: 'A', text: 'Decreases' }, { label: 'B', text: 'Increases' }, { label: 'C', text: 'Stays constant' }, { label: 'D', text: 'Changes randomly' }],
      correctOption: 'B',
      explanation: 'Across a period, nuclear charge rises while shielding stays roughly constant, pulling electrons in tighter — so ionization energy generally increases left to right.',
      difficultyRating: 2
    }
  ],
  cellStructure: [
    {
      stem: 'Which organelle is the main site of aerobic respiration in a cell?',
      options: [{ label: 'A', text: 'Nucleus' }, { label: 'B', text: 'Mitochondrion' }, { label: 'C', text: 'Ribosome' }, { label: 'D', text: 'Golgi apparatus' }],
      correctOption: 'B',
      explanation: 'The mitochondrion is the site of aerobic respiration, producing ATP through the Krebs cycle and oxidative phosphorylation.',
      difficultyRating: 1
    },
    {
      stem: 'Which structure controls what enters and leaves an animal cell?',
      options: [{ label: 'A', text: 'Cell wall' }, { label: 'B', text: 'Cell membrane' }, { label: 'C', text: 'Nucleolus' }, { label: 'D', text: 'Vacuole' }],
      correctOption: 'B',
      explanation: 'The cell (plasma) membrane is selectively permeable and regulates the movement of substances into and out of the cell.',
      difficultyRating: 1
    }
  ],
  cellDivision: [
    {
      stem: "During which phase of mitosis do chromosomes line up at the cell's equator?",
      options: [{ label: 'A', text: 'Prophase' }, { label: 'B', text: 'Metaphase' }, { label: 'C', text: 'Anaphase' }, { label: 'D', text: 'Telophase' }],
      correctOption: 'B',
      explanation: 'In metaphase, chromosomes align along the metaphase plate before being pulled apart in anaphase.',
      difficultyRating: 2
    },
    {
      stem: 'Mitosis produces how many daughter cells, and how do they compare to the parent genetically?',
      options: [{ label: 'A', text: '2 cells, genetically identical' }, { label: 'B', text: '2 cells, genetically different' }, { label: 'C', text: '4 cells, genetically identical' }, { label: 'D', text: '4 cells, genetically different' }],
      correctOption: 'A',
      explanation: 'Mitosis produces two daughter cells that are genetically identical to the parent cell and to each other.',
      difficultyRating: 1
    }
  ],
  inheritance: [
    {
      stem: 'Two heterozygous (Aa) parents are crossed. What fraction of offspring is expected to show the recessive phenotype?',
      options: [{ label: 'A', text: '1/4' }, { label: 'B', text: '1/2' }, { label: 'C', text: '3/4' }, { label: 'D', text: '0' }],
      correctOption: 'A',
      explanation: 'Aa × Aa gives a 1:2:1 genotype ratio (AA:Aa:aa) — 1/4 of offspring are aa, showing the recessive phenotype.',
      difficultyRating: 2
    },
    {
      stem: 'A dominant allele is one that:',
      options: [{ label: 'A', text: 'Is always the most common in a population' }, { label: 'B', text: 'Expresses its trait even when only one copy is present' }, { label: 'C', text: 'Only expresses when two copies are present' }, { label: 'D', text: 'Never mutates' }],
      correctOption: 'B',
      explanation: 'A dominant allele expresses its phenotype in the heterozygous state — only one copy is needed for the trait to show.',
      difficultyRating: 1
    }
  ]
};

let seeded = false;

export function seedDemoContent(engine) {
  if (seeded || engine.graph.nodes.size > 0) return;
  seeded = true;

  const ids = {};
  for (const c of CONCEPTS) {
    ids[c.key] = engine.addConcept({
      name: c.name,
      subject: c.subject,
      topic: c.topic,
      subtopic: c.subtopic,
      difficultyWeight: c.difficultyWeight,
      dependencies: c.dependsOn
        ? [{ subject: CONCEPTS.find(x => x.key === c.dependsOn).subject, topic: CONCEPTS.find(x => x.key === c.dependsOn).topic, subtopic: CONCEPTS.find(x => x.key === c.dependsOn).subtopic, name: CONCEPTS.find(x => x.key === c.dependsOn).name }]
        : []
    });
  }

  for (const c of CONCEPTS) {
    const conceptId = ids[c.key];
    (QUESTIONS[c.key] || []).forEach((q, i) => {
      engine.questionGraph.addQuestion(new Question({
        id: `${c.key}_q${i + 1}`,
        subject: c.subject,
        topic: c.topic,
        subtopic: c.subtopic,
        learningObjective: `Understand ${c.name} well enough to apply it, not just recall it.`,
        conceptsTested: [{ conceptId, weight: 'primary' }],
        difficultyRating: q.difficultyRating,
        stem: q.stem,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        lifecycleState: 'live'
      }));
    });
  }
  engine.questionGraph.autoBuildRelationships();

  seedDemoProgress(engine, ids);
  return ids;
}

/**
 * Fabricates a "few weeks in" student by feeding real, backdated attempts
 * through the real state machine (ConceptNode.recordAttempt) and the real
 * session-recording methods (StudentProfile.recordSession,
 * MomentumStreak.recordSession, EliteScore.calculate). No screen or copy
 * decision is hardcoded here — every resulting retention state, decay
 * estimate, macro-state, streak, and score is genuinely computed.
 */
function seedDemoProgress(engine, ids) {
  const graph = engine.graph;

  // Mole Concept -> reaches Reinforced. Decay recalculates against REAL
  // elapsed time on every recordAttempt call (not "simulated" time at each
  // backdated step), so reaching Held from a 16-day-old attempt already
  // auto-reverts it to Fading before the 3rd call ever runs — the 3rd,
  // recent correct answer then completes the genuine Fading->Reinforced
  // transition, exactly the "forgot it, then recalled it" story, in one
  // fewer step than a naive reading of the state machine would suggest.
  const mole = graph.getConcept(ids.mole);
  mole.recordAttempt({ correct: true, responseTimeMs: 14000, timestamp: ago(18), questionId: 'mole_q1', difficulty: 2 });
  mole.recordAttempt({ correct: true, responseTimeMs: 11000, timestamp: ago(16), questionId: 'mole_q2', difficulty: 2 });
  mole.recordAttempt({ correct: true, responseTimeMs: 9000, timestamp: ago(2), questionId: 'mole_q1', difficulty: 2 });

  // Equation Balancing -> reaches Held, then genuinely fades from time
  // passing. Two attempts are enough: the 2nd (15 days old by the time
  // this recalculates against real "now") already pushes decay below the
  // Held threshold, auto-reverting to Fading — a 3rd correct attempt here
  // would instead complete a Fading->Reinforced transition (Mole
  // Concept's story, not this one), so seeding deliberately stops at two.
  const balancing = graph.getConcept(ids.balancing);
  balancing.recordAttempt({ correct: true, responseTimeMs: 24000, timestamp: ago(20), questionId: 'balancing_q1', difficulty: 3 });
  balancing.recordAttempt({ correct: true, responseTimeMs: 19000, timestamp: ago(15), questionId: 'balancing_q2', difficulty: 2 });

  // Periodic Trends -> left Unseen entirely.

  // Cell Structure -> reaches Held, recently seen.
  const cellStructure = graph.getConcept(ids.cellStructure);
  cellStructure.recordAttempt({ correct: true, responseTimeMs: 8000, timestamp: ago(5), questionId: 'cellStructure_q1', difficulty: 1 });
  cellStructure.recordAttempt({ correct: true, responseTimeMs: 7000, timestamp: ago(2), questionId: 'cellStructure_q2', difficulty: 1 });

  // Cell Division -> a single, genuine miss. First-ever attempt always
  // lands in Forming regardless of correctness — this is exactly a fresh,
  // real gap Learn should recommend closing.
  const cellDivision = graph.getConcept(ids.cellDivision);
  cellDivision.recordAttempt({ correct: false, responseTimeMs: 26000, timestamp: ago(1), questionId: 'cellDivision_q1', difficulty: 2, errorTag: 'conceptual_gap' });

  // Mendelian Inheritance -> left Unseen entirely.

  // Session history: even rhythm, no widening gaps, no accuracy crash —
  // real computeMacroState() (run by startSession()) lands this at
  // "building", not "orienting"/"wavering"/"at_risk".
  const sessionDays = [14, 9, 5, 2];
  const sessionStats = [{ answered: 10, correct: 8 }, { answered: 10, correct: 9 }, { answered: 10, correct: 8 }, { answered: 10, correct: 9 }];
  sessionDays.forEach((d, i) => {
    const completedAt = ago(d);
    engine.profile.recordSession({
      sessionId: `demo_seed_${i}`,
      mode: 'standard',
      questionsAnswered: sessionStats[i].answered,
      correctCount: sessionStats[i].correct,
      completedAt
    });
    engine.streak.recordSession(completedAt);
  });

  engine.eliteScore.calculate(engine.graph, engine.profile.sessions);
}
