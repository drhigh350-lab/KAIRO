/**
 * Kairo — Comprehensive Engine Test Suite
 * Run with: node tests/engine.test.js
 */

import { KairoEngine, Question, LearnModule, SupabaseSyncAdapter, CBTExamMode, KnowledgeGraph, ConceptNode, DecayModel, LevelSystem, BadgeSystem, getPrestigeTier, PrestigeTiers } from "../src/index.js";
import { StudentProfile } from "../src/student/StudentProfile.js";
import { RetentionState, ErrorTag, StreakConstants, KairoPointsAwards, DashboardConstants } from "../src/utils/constants.js";
import { isPrimaryConceptLink } from "../src/utils/helpers.js";
import { MomentumStreak } from "../src/motivation/MomentumStreak.js";
import { RecommendationEngine } from "../src/engine/RecommendationEngine.js";
import { PlannerBridge } from "../src/engine/PlannerBridge.js";
import { LocalStore, STORES } from "../src/data/LocalStore.js";
import { EliteScore } from "../src/engine/EliteScore.js";

let passCount = 0;
let failCount = 0;

// Supports both sync and async test functions — a sync fn's return value
// isn't thenable, so it falls through to the original synchronous path
// unchanged; an async fn's rejection is caught the same way a sync throw
// is. Call sites for async tests must `await test(...)` themselves (top-
// level await is already used elsewhere in this file).
function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(() => {
        passCount++;
        console.log(`  ✅ ${name}`);
      }).catch(err => {
        failCount++;
        console.log(`  ❌ ${name}: ${err.message}`);
        console.log(`     ${err.stack?.split('\n')[1]?.trim() || ''}`);
      });
    }
    passCount++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failCount++;
    console.log(`  ❌ ${name}: ${err.message}`);
    console.log(`     ${err.stack?.split('\n')[1]?.trim() || ''}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(`${message} — expected "${b}", got "${a}"`);
}

await test('content catalog reconciliation removes deleted local questions and replaces changed records', async () => {
  const store = new LocalStore();
  await store.init();
  await store.put(STORES.QUEUE, { queueId: 'catalog_a', id: 'catalog_a', subject: 'Biology', text: 'old A' });
  await store.put(STORES.QUEUE, { queueId: 'catalog_deleted', id: 'catalog_deleted', subject: 'Biology', text: 'deleted' });
  await store.put(STORES.QUEUE, { queueId: 'other_subject', id: 'other_subject', subject: 'Physics', text: 'keep' });

  await store.reconcileQuestionQueue('Biology', [
    { queueId: 'catalog_a', id: 'catalog_a', subject: 'Biology', text: 'new A' },
    { queueId: 'catalog_b', id: 'catalog_b', subject: 'Biology', text: 'new B' },
  ]);

  const biology = (await store.getAll(STORES.QUEUE)).filter(q => q.subject === 'Biology');
  assertEqual(biology.length, 2, 'Biology mirror should contain only the current live rows');
  assertEqual(biology.find(q => q.id === 'catalog_a').text, 'new A', 'changed rows should overwrite stale local data');
  assert(!biology.some(q => q.id === 'catalog_deleted'), 'deleted rows should be removed from the local mirror');
  assert((await store.get(STORES.QUEUE, 'other_subject')).text === 'keep', 'other subjects should not be affected');
});

await test('CBT uses live Supabase questions online, including current image URLs', async () => {
  const cbtEngine = new KairoEngine({ studentId: 'cbt_live_test', name: 'Test', examDate: Date.now() + 86400000, targetSubjects: ['Biology'] });
  await cbtEngine.init();
  await cbtEngine.store.put(STORES.QUEUE, { queueId: 'deleted_local', id: 'deleted_local', subject: 'Biology', text: 'stale question' });
  cbtEngine.sync.attachRemote({
    fetchQuestions: async () => [{
      id: 'live_question', subject: 'Biology', topic: 'Cells', stem: 'Current question',
      options: [{ label: 'A', text: 'One' }], correctOption: 'A', explanation: 'Because',
      conceptsTested: [], prerequisiteConcepts: [], difficultyRating: 2, lifecycleState: 'live',
      imageUrl: 'https://example.com/current-diagram.png'
    }]
  }, cbtEngine);

  cbtEngine.cbt.setup({ subjects: ['Biology'], examType: 'custom', customQuestionCounts: { Biology: 1 }, customTotalTimeMin: 1 });
  const paper = await cbtEngine.cbt.buildPaper();
  assertEqual(paper.paper[0].questionId, 'live_question', 'online CBT should not serve a deleted local question');
  assertEqual(paper.paper[0].imageUrl, 'https://example.com/current-diagram.png', 'online CBT should carry the current image URL');
});

// ═══════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════
const engine = new KairoEngine({
  studentId: 'test_student_001',
  name: 'Test Student',
  examDate: Date.now() + (60 * 24 * 60 * 60 * 1000),
  targetSubjects: ['Chemistry', 'Physics', 'Biology'],
  targetCourse: 'Medicine and Surgery',
  targetUniversity: 'University of Lagos'
});

await engine.init();

// Seed concepts
const moleId = engine.addConcept({
  name: 'Mole Concept',
  subject: 'Chemistry',
  topic: 'Stoichiometry',
  subtopic: 'Mole Calculations',
  difficultyWeight: 1.2,
  questionPoolIds: ['q1', 'q2', 'q3']
});

const stoichId = engine.addConcept({
  name: 'Stoichiometry',
  subject: 'Chemistry',
  topic: 'Stoichiometry',
  subtopic: 'Equation Balancing',
  difficultyWeight: 1.8,
  dependencies: [{ subject: 'Chemistry', topic: 'Stoichiometry', subtopic: 'Mole Calculations', name: 'Mole Concept' }],
  questionPoolIds: ['q4', 'q5']
});

const periodicId = engine.addConcept({
  name: 'Periodic Table Trends',
  subject: 'Chemistry',
  topic: 'Periodic Table',
  subtopic: 'Trends',
  difficultyWeight: 0.8,
  questionPoolIds: ['q6', 'q7']
});

console.log('\n🧪 Kairo Learning Engine — Comprehensive Test Suite\n');

// ═══════════════════════════════════════════════════════════════
// CORE ENGINE TESTS
// ═══════════════════════════════════════════════════════════════

test('ConceptNode initializes as UNSEEN', () => {
  const c = engine.graph.getConcept(moleId);
  assertEqual(c.retentionState, RetentionState.UNSEEN, 'Initial state');
});

test('First correct attempt transitions to FORMING', () => {
  engine.startSession();
  engine.submitAnswer({
    conceptId: moleId, correct: true, responseTimeMs: 15000,
    selectedOption: 'A', correctOption: 'A', questionId: 'q1', questionDifficulty: 1
  });
  const c = engine.graph.getConcept(moleId);
  assertEqual(c.retentionState, RetentionState.FORMING, 'After 1 correct');
});

test('Multiple correct attempts can reach HELD', () => {
  for (let i = 0; i < 4; i++) {
    engine.submitAnswer({
      conceptId: moleId, correct: true, responseTimeMs: 12000,
      selectedOption: 'B', correctOption: 'B', questionId: `q${i + 10}`, questionDifficulty: 2
    });
  }
  const c = engine.graph.getConcept(moleId);
  assert(c.retentionState === RetentionState.HELD || c.retentionState === RetentionState.FORMING,
    `Should progress toward HELD, got ${c.retentionState}`);
});

test('Wrong answer on HELD concept drops to FADING', () => {
  const c = engine.graph.getConcept(moleId);
  c.retentionState = RetentionState.HELD;
  c.confidenceScore = 0.8;
  c.attemptHistory = []; // reset for clean test

  engine.submitAnswer({
    conceptId: moleId, correct: false, responseTimeMs: 8000,
    selectedOption: 'C', correctOption: 'A', questionId: 'q_error', questionDifficulty: 2,
    questionDistractorTags: ['misread']
  });

  const after = engine.graph.getConcept(moleId);
  assertEqual(after.retentionState, RetentionState.FADING, 'Should fade after wrong answer on HELD');
});

test('Fading → correct = REINFORCED', () => {
  const c = engine.graph.getConcept(moleId);
  c.retentionState = RetentionState.FADING;
  c.decayEstimate = 0.3;

  engine.submitAnswer({
    conceptId: moleId, correct: true, responseTimeMs: 10000,
    selectedOption: 'A', correctOption: 'A', questionId: 'q_reinforce', questionDifficulty: 2
  });

  const after = engine.graph.getConcept(moleId);
  assertEqual(after.retentionState, RetentionState.REINFORCED, 'Should reinforce');
  assert(after.reinforcedCycles >= 1, 'Should increment reinforced cycle');
});

test('Elite Score never decreases, even after a concept decays back down', () => {
  const before = engine.eliteScore.calculate(engine.graph, engine.profile.sessions);

  const c = engine.graph.getConcept(moleId);
  assertEqual(c.retentionState, RetentionState.REINFORCED, 'Precondition: concept should still be Reinforced from the prior test');
  engine.submitAnswer({
    conceptId: moleId, correct: false, responseTimeMs: 9000,
    selectedOption: 'B', correctOption: 'A', questionId: 'q_decay', questionDifficulty: 2
  });
  assertEqual(engine.graph.getConcept(moleId).retentionState, RetentionState.FADING, 'Concept should have decayed back to Fading after a wrong answer');

  const after = engine.eliteScore.calculate(engine.graph, engine.profile.sessions);
  assert(after.total >= before.total, `Elite Score total should never decrease (before: ${before.total}, after: ${after.total})`);
  assert(after.retention >= before.retention, `Retention subscore should never decrease even after the concept decays (before: ${before.retention}, after: ${after.retention})`);
});

test('ConceptNode.everReachedHeld stays true even if the concept later regresses all the way to Forming', () => {
  const node = new ConceptNode({ id: 'sticky_held_test', name: 'Sticky Held Test Concept', subject: 'Biology', topic: 'Sticky Test Topic' });
  for (let i = 0; i < 5; i++) {
    node.recordAttempt({ correct: true, responseTimeMs: 5000, timestamp: Date.now(), questionId: `sticky_q${i}`, difficulty: 1 });
  }
  assertEqual(node.retentionState, RetentionState.HELD, 'Precondition: should reach Held after a run of correct answers');
  assert(node.everReachedHeld, 'everReachedHeld should be set the first time Held is reached');

  node.recordAttempt({ correct: false, responseTimeMs: 5000, timestamp: Date.now(), questionId: 'sticky_wrong1', difficulty: 1 });
  assertEqual(node.retentionState, RetentionState.FADING, 'A wrong answer on Held should drop to Fading');

  node.recordAttempt({ correct: false, responseTimeMs: 5000, timestamp: Date.now(), errorTag: ErrorTag.CONCEPTUAL_GAP, questionId: 'sticky_wrong2', difficulty: 1 });
  assertEqual(node.retentionState, RetentionState.FORMING, 'A conceptual gap on Fading should drop all the way back to Forming');

  assert(node.everReachedHeld, 'everReachedHeld should still be true even after regressing to Forming — EliteScore must not lose credit for a real, past achievement');
});

test('Recommendation engine builds non-empty session plan', () => {
  const plan = engine.startSession();
  assert(plan.queue.length > 0, 'Session plan should have concepts');
  assert(plan.macroState, 'Should have macro state');
  assert(plan.kaiMessage, 'Should have Kai open message');
});

test('Elite Score calculates with three components', () => {
  engine.endSession();
  const score = engine.eliteScore.calculate(engine.graph, engine.profile.sessions);
  assert(typeof score.total === 'number', 'Total should be number');
  assert(typeof score.accuracy === 'number', 'Accuracy should be number');
  assert(typeof score.retention === 'number', 'Retention should be number');
  assert(typeof score.consistency === 'number', 'Consistency should be number');
  assert(score.total >= 0 && score.total <= 100, 'Total in range 0-100');
});

test('Error classifier tags conceptual gaps', () => {
  const tag = engine.classifier.classify({
    concept: engine.graph.getConcept(stoichId),
    selectedOption: 'D', correctOption: 'A', responseTimeMs: 25000,
    question: { id: 'q_hard', distractorTags: [], difficulty: 3, type: 'multi_step' }
  });
  assertEqual(tag, ErrorTag.CONCEPTUAL_GAP, 'Slow wrong answer should be conceptual gap');
});

test('Error classifier detects guessing', () => {
  const tag = engine.classifier.classify({
    concept: engine.graph.getConcept(periodicId),
    selectedOption: 'B', correctOption: 'A', responseTimeMs: 1500,
    question: { id: 'q_guess', distractorTags: [], difficulty: 1, type: 'single' }
  });
  assertEqual(tag, ErrorTag.GUESSED, 'Very fast wrong should be guessed');
});

test('EliteScore.computeSessionDelta: pure organic movement only, no flat bonus for any session type — Kairo Score stays untouched by bonuses', () => {
  const rec = EliteScore.computeSessionDelta(40, 42.3, 'recommendation');
  assertEqual(rec.total, 3, 'Delta should round UP (2.3 -> 3), with no bonus added');

  const cbt = EliteScore.computeSessionDelta(40, 42.3, 'cbt');
  assertEqual(cbt.total, 3, 'CBT session type earns no Kairo Score bonus either — that reward lives in Kairo Points instead');

  const standard = EliteScore.computeSessionDelta(40, 42.3, 'standard');
  assertEqual(standard.total, 3, 'Delta is identical regardless of session type — session type never affects Kairo Score');

  const steady = EliteScore.computeSessionDelta(50, 50, 'recommendation');
  assertEqual(steady.total, 0, 'No organic movement should floor at 0, not go negative, and no bonus should inflate it');
});

test('Adaptive difficulty respects macro-state ceiling', () => {
  engine.profile.macroState = 'recovering';
  const tier = engine.difficulty.selectDifficulty(
    engine.graph.getConcept(moleId), 'recovering'
  );
  assert(tier <= 2, `Recovery ceiling should be 2, got ${tier}`);
});

test('Momentum streak records session with status', () => {
  const status = engine.streak.recordSession(Date.now());
  assert(typeof status.momentum === 'number', 'Momentum should be number');
  assert(status.message && (status.message.text || status.message.level), 'Should have status message');
});

test('Momentum streak increments by exactly 1 per consecutive day, never silently decreases', () => {
  const p = new StudentProfile({ studentId: 's_streak', name: 'S' });
  const streak = new MomentumStreak(p);
  const day = 24 * 60 * 60 * 1000;
  const t0 = Date.parse('2026-06-01T09:00:00Z');
  const s1 = streak.recordSession(t0);
  assertEqual(s1.momentum, 1, 'First-ever session should start the streak at 1');
  const s2 = streak.recordSession(t0 + day);
  assertEqual(s2.momentum, 2, 'A session the very next calendar day should increment by 1');
  // Same-day second session (e.g. re-called defensively) must not double count.
  const s2b = streak.recordSession(t0 + day + 3600000);
  assertEqual(s2b.momentum, 2, 'A second session the same calendar day should not increment again');
  const s3 = streak.recordSession(t0 + 2 * day);
  assertEqual(s3.momentum, 3, 'Third consecutive day should reach 3');
  // Regression guard for the previous rolling-window bug: momentum must
  // never drop below its last known value without a genuine, unbridged gap.
  assert(s3.momentum >= s2.momentum, 'Momentum must never silently decrease across consecutive real sessions');
});

test('Momentum streak: a genuine unbridged gap resets to 1, not a silent partial decrement', () => {
  const p = new StudentProfile({ studentId: 's_streak_break', name: 'S' });
  const streak = new MomentumStreak(p);
  const day = 24 * 60 * 60 * 1000;
  const t0 = Date.parse('2026-06-01T09:00:00Z');
  streak.recordSession(t0);
  streak.recordSession(t0 + day);
  streak.recordSession(t0 + 2 * day); // momentum = 3, no freezes earned
  const broken = streak.recordSession(t0 + 10 * day); // 7-day gap, far beyond grace/freeze
  assertEqual(broken.momentum, 1, 'A real, unbridged gap should reset the streak to 1');
});

test('Streak Freeze: earned on onboarding, capped at FREEZE_CAPACITY, and bridges a missed day without breaking the streak', () => {
  const p = new StudentProfile({ studentId: 's_freeze', name: 'S' });
  const streak = new MomentumStreak(p);
  assertEqual(streak.data.freezesAvailable, 0, 'No freezes before any are earned');
  streak.earnFreeze(StreakConstants.FREEZE_EARNED_ON_ONBOARDING);
  assertEqual(streak.data.freezesAvailable, 1, 'Onboarding should award exactly one freeze');
  streak.earnFreeze(5); // attempt to over-earn
  assertEqual(streak.data.freezesAvailable, StreakConstants.FREEZE_CAPACITY, 'Freezes should never exceed FREEZE_CAPACITY');

  const p2 = new StudentProfile({ studentId: 's_freeze_use', name: 'S' });
  const streak2 = new MomentumStreak(p2);
  streak2.earnFreeze(1);
  const day = 24 * 60 * 60 * 1000;
  const t0 = Date.parse('2026-06-01T09:00:00Z');
  streak2.recordSession(t0);
  // 3 missed days: 1 beyond what the free PROTECTED_GAP_DAYS (2) grace
  // alone would cover — exactly what the single earned freeze should bridge.
  const afterGap = streak2.recordSession(t0 + 4 * day);
  assertEqual(afterGap.momentum, 2, 'A spent Streak Freeze should bridge a gap beyond the free grace and continue the streak');
  assertEqual(afterGap.freezesAvailable, 0, 'The freeze used to bridge the gap should be spent, not refunded');

  // Without a freeze, the same size gap should genuinely break the streak.
  const p3 = new StudentProfile({ studentId: 's_freeze_none', name: 'S' });
  const streak3 = new MomentumStreak(p3);
  streak3.recordSession(t0);
  const brokenNoFreeze = streak3.recordSession(t0 + 4 * day);
  assertEqual(brokenNoFreeze.momentum, 1, 'The same gap with no freeze available should reset the streak to 1');
});

test('Weekly reflection generates data', () => {
  const { data, kaiNote } = engine.getWeeklyReflection();
  assert(Array.isArray(data.reinforced), 'Reinforced should be array');
  assert(Array.isArray(data.fading), 'Fading should be array');
  assert(typeof data.sessionCount === 'number', 'Session count should be number');
});

test('Knowledge graph finds prerequisites', () => {
  // moleId may have been promoted to HELD/REINFORCED by earlier tests in this shared engine.
  // Force it back to a weak state to test the actual behavior being verified here:
  // findWeakPrerequisites correctly surfaces prerequisites that are unseen/forming/fading.
  const mole = engine.graph.getConcept(moleId);
  mole.retentionState = RetentionState.FORMING;

  const prereqs = engine.graph.findWeakPrerequisites(stoichId);
  assert(prereqs.length > 0, 'Stoichiometry should have weak prerequisites');
});

test('Decay model computes next review in future', () => {
  const c = engine.graph.getConcept(moleId);
  const next = engine.decayModel.computeNextReview(c, engine.profile.examDate);
  assert(next > Date.now(), 'Next review should be in future');
  assert(c.nextReviewEstimate === next, 'Should update concept nextReview');
});

test('DecayModel.getDueConcepts() no longer throws a ReferenceError on a concept with no nextReviewEstimate (RetentionState was used without being imported)', () => {
  const graph = new KnowledgeGraph();
  const fresh = new ConceptNode({ id: 'decay_due_unseen', name: 'Due Test', subject: 'Chemistry', topic: 'Regression', subtopic: 'Test' });
  graph.addConcept(fresh);

  const profile = new StudentProfile({ studentId: 'decay_due_test', name: 'Decay Tester' });
  const decay = new DecayModel(profile);

  const due = decay.getDueConcepts(graph);
  assert(Array.isArray(due), 'getDueConcepts() should return an array without throwing');
  assert(!due.includes(fresh), 'A fresh Unseen concept with no nextReviewEstimate should not be considered due');

  fresh.retentionState = RetentionState.FADING;
  const dueAfter = decay.getDueConcepts(graph);
  assert(dueAfter.includes(fresh), 'A non-Unseen concept with no nextReviewEstimate should be considered due');
});

test('Export/import preserves state', () => {
  const exported = engine.exportState();
  assert(exported.profile, 'Should export profile');
  assert(exported.graph, 'Should export graph');
  assert(exported.graph.nodes.length > 0, 'Should have nodes');
});

// ═══════════════════════════════════════════════════════════════
// PRACTICE MODES
// ═══════════════════════════════════════════════════════════════

test('Rapid Fire starts with queue and config', () => {
  // Rapid Fire only draws from held/fading/reinforced concepts — ensure at least one
  // qualifies, rather than depending on leftover state from earlier tests.
  engine.graph.getConcept(periodicId).retentionState = RetentionState.HELD;

  const rf = engine.startRapidFire({ questionCount: 5, timePerQuestionSec: 20 });
  assertEqual(rf.mode, 'rapid_fire', 'Mode should be rapid_fire');
  assert(rf.totalQuestions > 0, 'Should have questions');
  assertEqual(rf.timePerQuestion, 20, 'Time per question should match config');
});

test('Rapid Fire submits answers and tracks streak', () => {
  engine.startRapidFire({ questionCount: 3 });
  const r1 = engine.submitRapidFireAnswer({
    conceptId: moleId, correct: true, responseTimeMs: 8000,
    selectedOption: 'A', correctOption: 'A', questionId: 'rf1'
  });
  assert(r1.streak >= 1, 'Should track streak');
  const r2 = engine.submitRapidFireAnswer({
    conceptId: periodicId, correct: false, responseTimeMs: 10000,
    selectedOption: 'B', correctOption: 'A', questionId: 'rf2'
  });
  assertEqual(r2.streak, 0, 'Streak should reset on wrong');
});

test('Rapid Fire finish returns summary', () => {
  const summary = engine.finishRapidFire();
  assert(typeof summary.totalQuestions === 'number', 'Should have totalQuestions');
  assert(typeof summary.accuracy === 'number', 'Should have accuracy');
  assert(typeof summary.durationSec === 'number', 'Should have duration');
});

test('Custom Practice builds session with filters', () => {
  const session = engine.buildCustomPractice({
    subjects: ['Chemistry'],
    count: 5
  });
  assertEqual(session.mode, 'custom_practice', 'Mode should be custom_practice');
  assert(session.queue.length > 0, 'Should have queued concepts');
});

test('Topic Practice generates journey', () => {
  const journey = engine.getTopicJourney('Chemistry', 'Stoichiometry');
  assertEqual(journey.subject, 'Chemistry', 'Subject should match');
  assertEqual(journey.topic, 'Stoichiometry', 'Topic should match');
  assert(Array.isArray(journey.subtopics), 'Should have subtopics array');
  assert(typeof journey.overallMastery === 'number', 'Should have mastery %');
});

test('getTopicJourney() and getLearningJourney() report real question counts, not just concept counts', () => {
  // Regression test: a topic/subtopic maps to ~1 concept in almost all
  // seeded content, so the picker screens showed "1 concept" no matter how
  // many real questions that one concept actually had — misrepresenting
  // how much a student could practice.
  const conceptId = engine.addConcept({ name: 'Question Count Concept', subject: 'Chemistry', topic: 'Question Count Topic', subtopic: 'Question Count Subtopic' });
  for (let i = 0; i < 4; i++) {
    engine.questionGraph.addQuestion(new Question({
      id: `qcount_q${i}`, subject: 'Chemistry', topic: 'Question Count Topic', subtopic: 'Question Count Subtopic',
      conceptsTested: [{ conceptId, weight: 1 }],
      stem: `S${i}`, options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
      lifecycleState: 'live'
    }));
  }

  const topicJourney = engine.getTopicJourney('Chemistry', 'Question Count Topic');
  const subtopicEntry = topicJourney.subtopics.find((s) => s.name === 'Question Count Subtopic');
  assertEqual(subtopicEntry.total, 1, 'Concept count should still be 1 (one concept in this subtopic)');
  assertEqual(subtopicEntry.questionCount, 4, 'Question count should reflect the real 4-question pool, not the 1-concept count');

  const learningJourney = engine.settings.getLearningJourney();
  const topicEntry = learningJourney['Chemistry'].topics['Question Count Topic'];
  assertEqual(topicEntry.total, 1, 'Concept count should still be 1 at the topic level too');
  assertEqual(topicEntry.questionCount, 4, 'getLearningJourney() should also report the real question count at the topic level');
});

// ═══════════════════════════════════════════════════════════════
// PROGRESSION
// ═══════════════════════════════════════════════════════════════

test('Level system calculates Kairo Points and progress', () => {
  const progress = engine.getLevelProgress();
  assert(typeof progress.level === 'number', 'Should have level');
  assert(typeof progress.points === 'number', 'Should have Kairo Points');
  assert(typeof progress.progressPercent === 'number', 'Should have progress %');
  assert(progress.level >= 1, 'Should be at least level 1');
});

test('LevelSystem.update() is a strictly linear "Tight Economy" — no multipliers, no milestone stacking, only +2/correct plus a flat session bonus', () => {
  const profile = new StudentProfile({ studentId: 'kp_tight_economy_test', name: 'Kairo Points Tester' });
  const level = new LevelSystem(profile);

  // Regression for a real reported bug: a 5-question Rapid Fire round paid
  // out 360 Kairo Points under the old milestone-ledger design (several
  // concepts crossing Held/Reinforced/topic-mastery thresholds in the same
  // session stacked into one huge payout, with no relationship to session
  // length). The Tight Economy can't do that — a 5-question session with
  // every answer correct is capped at 5 * CORRECT_ANSWER, plus at most one
  // flat session bonus.
  const five = level.update(5, 0);
  assertEqual(five.pointsEarned, 10, 'A 5-question, all-correct session with no session bonus should earn exactly 10 points (5 * 2), never more');

  // A wrong/skipped/unsure answer earns nothing — no partial credit, no
  // guessing upside. Only the 6 real corrects (of 10) count.
  const partial = level.update(6, 0);
  assertEqual(partial.pointsEarned, 12, 'Incorrect/skipped/unsure answers should earn 0 — only correct answers count toward the base');

  // The three real session-type bonuses, each applied exactly once and
  // additively on top of the base — never stacked with each other.
  const recommendation = level.update(8, KairoPointsAwards.RECOMMENDATION_SESSION);
  assertEqual(recommendation.pointsEarned, 26, '8 correct + the Daily Recommendation bonus should be 16 + 10 = 26');

  const verification = level.update(9, KairoPointsAwards.VERIFICATION_SESSION);
  assertEqual(verification.pointsEarned, 28, '9 correct + the Verification Session bonus should be 18 + 10 = 28');

  const cbt = level.update(120, KairoPointsAwards.CBT_SESSION);
  assertEqual(cbt.pointsEarned, 290, '120 correct + the full CBT Simulation bonus should be 240 + 50 = 290');

  const totalSoFar = 10 + 12 + 26 + 28 + 290;
  assertEqual(profile.kairoPoints, totalSoFar, 'kairoPoints should be the exact running sum of every update() call — no hidden extra credit anywhere');
});

test('Badge system has catalog and checks', () => {
  const badges = engine.getBadges();
  assert(Array.isArray(badges.earned), 'Should have earned badges array');
  assert(Array.isArray(badges.available), 'Should have available badges array');
  assert(badges.available.length > 0, 'Should have available badges');
});

// ═══════════════════════════════════════════════════════════════
// PRESTIGE LEVELS (Batch 1)
// ═══════════════════════════════════════════════════════════════

test('getPrestigeTier() maps kairoPoints to the correct tier at every real boundary', () => {
  assertEqual(getPrestigeTier(0).name, 'The Candidate', '0 points is The Candidate');
  assertEqual(getPrestigeTier(499).name, 'The Candidate', '499 points is still The Candidate');
  assertEqual(getPrestigeTier(500).name, 'The Strategist', '500 points crosses into The Strategist');
  assertEqual(getPrestigeTier(2499).name, 'The Strategist', '2,499 points is still The Strategist');
  assertEqual(getPrestigeTier(2500).name, 'The Scholar', '2,500 points crosses into The Scholar');
  assertEqual(getPrestigeTier(7499).name, 'The Scholar', '7,499 points is still The Scholar');
  assertEqual(getPrestigeTier(7500).name, 'The Elite', '7,500 points crosses into The Elite');
  assertEqual(getPrestigeTier(14999).name, 'The Elite', '14,999 points is still The Elite');
  assertEqual(getPrestigeTier(15000).name, 'The Outlier', '15,000 points crosses into The Outlier');
  assertEqual(getPrestigeTier(50000).name, 'The Outlier', 'Any points beyond 15,000 stays The Outlier — it never overflows past the top tier');
});

test('getPrestigeTier() reports the correct border tokens, glow, and next-tier framing', () => {
  const candidate = getPrestigeTier(0);
  assertEqual(candidate.borderToken, 'slate', 'The Candidate should carry the slate border token');
  assertEqual(candidate.glow, false, 'Only The Outlier gets the glow treatment');
  assertEqual(candidate.nextTierName, 'The Strategist', 'The Candidate should point at The Strategist as next');
  assertEqual(candidate.pointsToNext, 500, 'A fresh student needs exactly 500 points to reach The Strategist');

  const strategist = getPrestigeTier(1200);
  assertEqual(strategist.borderToken, 'bronze', 'The Strategist should carry the bronze border token');
  assertEqual(strategist.nextTierName, 'The Scholar', '1,200 points should point at The Scholar as next');
  assertEqual(strategist.pointsToNext, 2500 - 1200, 'pointsToNext should be the exact real gap to the next tier boundary');

  const outlier = getPrestigeTier(20000);
  assertEqual(outlier.borderToken, 'amber', 'The Outlier should carry the amber border token');
  assertEqual(outlier.glow, true, 'The Outlier is the one tier with the glow effect');
  assertEqual(outlier.nextTierName, null, 'The Outlier has no next tier to point at — it is the top');
  assertEqual(outlier.pointsToNext, 0, 'pointsToNext should be 0 once at the top tier');
  assertEqual(outlier.progressPercent, 100, 'progressPercent should read 100 at the top tier');
});

test('getPrestigeTier() is monotonic and stateless — five tiers defined, never decreases as points rise', () => {
  assertEqual(PrestigeTiers.length, 5, 'Exactly 5 Prestige tiers, per spec');
  let lastTierIndex = -1;
  for (const points of [0, 499, 500, 1000, 2499, 2500, 5000, 7499, 7500, 10000, 14999, 15000, 30000]) {
    const tier = getPrestigeTier(points);
    assert(tier.tierIndex >= lastTierIndex, `Tier index must never decrease as points rise — regressed at ${points}`);
    lastTierIndex = tier.tierIndex;
  }
});

// ═══════════════════════════════════════════════════════════════
// BADGE VAULT (Batch 2) — tiered tracks
// ═══════════════════════════════════════════════════════════════

test('Badge Vault — Consistency track thresholds (7/30/100-day longestMomentum, sticky signal)', () => {
  const profile = new StudentProfile({ studentId: 'vault_consistency', name: 'V' });
  profile.streakData = { longestMomentum: 6 };
  assertEqual(BadgeSystem._consistencyTier(BadgeSystem._consistencyValue(profile)), 0, '6-day longest momentum should still be locked (tier 0)');

  profile.streakData.longestMomentum = 7;
  assertEqual(BadgeSystem._consistencyTier(BadgeSystem._consistencyValue(profile)), 1, '7-day longest momentum should unlock tier 1 (Momentum Builder)');

  profile.streakData.longestMomentum = 30;
  assertEqual(BadgeSystem._consistencyTier(BadgeSystem._consistencyValue(profile)), 2, '30-day longest momentum should unlock tier 2 (The Unbreakable)');

  profile.streakData.longestMomentum = 100;
  assertEqual(BadgeSystem._consistencyTier(BadgeSystem._consistencyValue(profile)), 3, '100-day longest momentum should unlock tier 3 (The Relentless)');

  // Sticky: a real streak break (currentMomentum reset) must not undo a tier
  // already earned via longestMomentum, which never decreases.
  profile.streakData.currentMomentum = 1;
  assertEqual(BadgeSystem._consistencyTier(BadgeSystem._consistencyValue(profile)), 3, 'A live streak break should not un-earn a Consistency tier already reached via longestMomentum');
});

test('Badge Vault — Resilience track combines recovery count and rebuilt-concept count', () => {
  const profile = new StudentProfile({ studentId: 'vault_resilience', name: 'V' });
  const graph = new KnowledgeGraph();

  assertEqual(BadgeSystem._resilienceTier(BadgeSystem._resilienceValue(profile, graph)), 0, 'No recoveries and no rebuilt concepts should stay locked');

  profile.macroStateHistory = [{ from: 'at_risk', to: 'recovering', at: Date.now() }];
  assertEqual(BadgeSystem._resilienceTier(BadgeSystem._resilienceValue(profile, graph)), 1, 'A single real recovery should unlock tier 1 (The Comeback)');

  for (let i = 0; i < 5; i++) {
    const c = new ConceptNode({ id: `resil_${i}`, name: `C${i}`, subject: 'Biology', topic: 'T' });
    c.reinforcedCycles = 1;
    graph.addConcept(c);
  }
  assertEqual(BadgeSystem._resilienceTier(BadgeSystem._resilienceValue(profile, graph)), 2, '5 concepts rebuilt from Fading should unlock tier 2 (Ironclad Foundation), even with only 1 recovery');

  profile.macroStateHistory.push(
    { from: 'at_risk', to: 'recovering', at: Date.now() },
    { from: 'at_risk', to: 'recovering', at: Date.now() }
  );
  for (let i = 5; i < 15; i++) {
    const c = new ConceptNode({ id: `resil_${i}`, name: `C${i}`, subject: 'Biology', topic: 'T' });
    c.reinforcedCycles = 2;
    graph.addConcept(c);
  }
  assertEqual(BadgeSystem._resilienceTier(BadgeSystem._resilienceValue(profile, graph)), 3, '3 recoveries + 15 rebuilt concepts together should unlock tier 3 (The Architect)');
});

test('Badge Vault — Execution track requires both a rising accuracy bar and a rising sample-size floor', () => {
  function fakeSessions(count, accuracy) {
    return Array.from({ length: count }, () => ({ questionsAnswered: 10, correctCount: Math.round(10 * accuracy) }));
  }
  const profile = new StudentProfile({ studentId: 'vault_execution', name: 'V' });

  profile.sessions = fakeSessions(1, 1.0); // 10 questions, 100% — high accuracy but too small a sample
  assertEqual(BadgeSystem._executionTier(BadgeSystem._executionValue(profile)), 0, 'A single perfect 10-question session should not be enough volume for tier 1');

  profile.sessions = fakeSessions(2, 0.8); // 20 questions, 80%
  assertEqual(BadgeSystem._executionTier(BadgeSystem._executionValue(profile)), 1, '20 questions at 80% accuracy should unlock tier 1 (Sharp Shooter)');

  profile.sessions = fakeSessions(5, 0.9); // 50 questions, 90%
  assertEqual(BadgeSystem._executionTier(BadgeSystem._executionValue(profile)), 2, '50 questions at 90% accuracy should unlock tier 2 (The Sniper)');

  profile.sessions = fakeSessions(10, 0.95); // 100 questions, 95%
  assertEqual(BadgeSystem._executionTier(BadgeSystem._executionValue(profile)), 3, '100 questions at 95% accuracy should unlock tier 3 (Elite Operator)');

  profile.sessions = fakeSessions(20, 0.99); // 200 questions at very high accuracy, but window caps at the most recent 20 sessions
  assertEqual(BadgeSystem._executionTier(BadgeSystem._executionValue(profile)), 3, 'Still tier 3 — the rolling window is capped, not unbounded');
});

test('Badge Vault — Subject track needs real seeded volume (MIN_SUBJECT_CONCEPTS) before mastery % counts at all', () => {
  const graph = new KnowledgeGraph();
  for (let i = 0; i < 4; i++) {
    const c = new ConceptNode({ id: `sub_small_${i}`, name: `C${i}`, subject: 'Geography', topic: 'T' });
    c.retentionState = 'reinforced';
    graph.addConcept(c);
  }
  assertEqual(BadgeSystem._subjectValues(graph).find(s => s.subject === 'Geography'), undefined, 'A subject with fewer than MIN_SUBJECT_CONCEPTS concepts should not get a track at all, even at 100% mastery');

  const graph2 = new KnowledgeGraph();
  for (let i = 0; i < 8; i++) {
    const c = new ConceptNode({ id: `sub_big_${i}`, name: `C${i}`, subject: 'Physics', topic: 'T' });
    c.retentionState = i < 2 ? 'held' : 'unseen'; // 2/8 = 25%
    graph2.addConcept(c);
  }
  const physics = BadgeSystem._subjectValues(graph2).find(s => s.subject === 'Physics');
  assertEqual(BadgeSystem._subjectTier(physics.masteryPct), 1, '25% mastery across 8 real concepts should unlock tier 1 (Initiate)');

  for (const c of graph2.nodes.values()) c.retentionState = 'reinforced';
  const physicsFull = BadgeSystem._subjectValues(graph2).find(s => s.subject === 'Physics');
  assertEqual(BadgeSystem._subjectTier(physicsFull.masteryPct), 3, '100% mastery should unlock tier 3 (Authority)');
});

test('Badge Vault — checkAndAward() persists exactly one live entry per track and never re-fires an already-reached tier', () => {
  const profile = new StudentProfile({ studentId: 'vault_persist', name: 'V' });
  const graph = new KnowledgeGraph();
  const badgeSystem = new BadgeSystem(profile);

  profile.streakData = { longestMomentum: 7 };
  const first = badgeSystem.checkAndAward(graph);
  assertEqual(first.length, 1, 'Reaching Consistency tier 1 for the first time should report exactly one newly-earned badge');
  assertEqual(first[0].trackKey, 'consistency', 'The newly-earned badge should be on the consistency track');
  assertEqual(first[0].tier, 1, 'The newly-earned badge should be tier 1');
  assertEqual(first[0].name, 'Momentum Builder', 'Tier 1 Consistency should be named Momentum Builder');
  assert(profile.badges.some(id => id.startsWith('consistency::tier1@')), 'profile.badges should carry the encoded consistency tier-1 id with a real timestamp');

  const second = badgeSystem.checkAndAward(graph);
  assertEqual(second.length, 0, 'Calling checkAndAward() again with no new real progress should award nothing — no duplicate awards for a tier already held');

  // Advance to tier 2 — the old tier-1 entry for this track must be
  // replaced, not accumulated (a track shows only its CURRENT tier).
  profile.streakData.longestMomentum = 30;
  const third = badgeSystem.checkAndAward(graph);
  assertEqual(third.length, 1, 'Crossing into tier 2 should report exactly one newly-earned badge');
  assertEqual(third[0].tier, 2, 'The newly-earned badge should be tier 2 (The Unbreakable)');
  const consistencyEntries = profile.badges.filter(id => id.startsWith('consistency::'));
  assertEqual(consistencyEntries.length, 1, 'Only one live consistency entry should ever be persisted — the tier-1 entry must be replaced by tier-2, not kept alongside it');
  assert(consistencyEntries[0].startsWith('consistency::tier2@'), 'The one live consistency entry should now be tier 2');
});

test('Badge Vault — getVault() reports achieved date, next-tier framing, and getDisplayBadges() caps at 4', () => {
  const profile = new StudentProfile({ studentId: 'vault_display', name: 'V' });
  const graph = new KnowledgeGraph();
  const badgeSystem = new BadgeSystem(profile);

  const vault = badgeSystem.getVault(graph);
  assert(vault.tracks.consistency.locked, 'A fresh profile should start with Consistency locked');
  assertEqual(vault.tracks.consistency.achievedAt, null, 'A locked track has no achieved date');
  assertEqual(vault.tracks.consistency.nextTier.name, 'Momentum Builder', 'A locked track should frame tier 1 as the next challenge');
  assertEqual(vault.subjects.length, 0, 'No graph content means no subject tracks at all');

  profile.streakData = { longestMomentum: 30 };
  badgeSystem.checkAndAward(graph);
  const vault2 = badgeSystem.getVault(graph);
  assert(!vault2.tracks.consistency.locked, 'Consistency should now be unlocked');
  assertEqual(vault2.tracks.consistency.currentTierName, 'The Unbreakable', 'The current tier should be the highest one actually reached (tier 2), not tier 1');
  assert(typeof vault2.tracks.consistency.achievedAt === 'number', 'An unlocked track should carry a real achieved-at timestamp');
  assertEqual(vault2.tracks.consistency.nextTier.name, 'The Relentless', 'The next tier framing should point at tier 3');

  for (let i = 0; i < 6; i++) {
    const c = new ConceptNode({ id: `disp_${i}`, name: `C${i}`, subject: 'Mathematics', topic: 'T' });
    c.retentionState = 'reinforced';
    graph.addConcept(c);
  }
  const display = badgeSystem.getDisplayBadges(graph);
  assert(display.length <= 4, 'getDisplayBadges() must never return more than 4 entries');
  assertEqual(display.length, 4, 'With Consistency unlocked and a real qualifying subject present, all 4 slots should be filled');
  assertEqual(display[3].trackKey, 'subject:Mathematics', 'The 4th slot should be the single strongest subject track');
});

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATION ENGINE — SUBJECT GUARDRAIL
// ═══════════════════════════════════════════════════════════════

test('RecommendationEngine.buildSessionPlan() hard-filters out concepts from non-enrolled subjects', () => {
  const graph = new KnowledgeGraph();
  const enrolledConcept = new ConceptNode({ id: 'guardrail_enrolled', name: 'Enrolled Subject Concept', subject: 'Physics', topic: 'Motion' });
  const nonEnrolledConcept = new ConceptNode({ id: 'guardrail_not_enrolled', name: 'Non-Enrolled Subject Concept', subject: 'Mathematics', topic: 'Algebra' });
  graph.addConcept(enrolledConcept);
  graph.addConcept(nonEnrolledConcept);

  const profile = new StudentProfile({ studentId: 'guardrail_student', name: 'S', targetSubjects: ['Physics'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });
  const plan = rec.buildSessionPlan();

  assert(plan.includes('guardrail_enrolled'), 'Enrolled-subject concept should be eligible for the recommendation queue');
  assert(!plan.includes('guardrail_not_enrolled'), 'A concept from a subject the student is not enrolled in must never surface in the daily recommendation');
});

// ═══════════════════════════════════════════════════════════════
// KAIRO V1 DASHBOARD — THREE SESSION TYPES + CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════

test('buildFocusedSprint(): a brand-new student with only Forming concepts (real onboarding shape — a concept can only become Forming on its first attempt, never Fading) still gets an eligible Sprint', () => {
  const graph = new KnowledgeGraph();
  const forming = new ConceptNode({ id: 'sprint_forming', name: 'Balancing Equations', subject: 'Chemistry', topic: 'Stoichiometry' });
  forming.retentionState = 'forming';
  graph.addConcept(forming);
  const profile = new StudentProfile({ studentId: 'sprint_new', name: 'S', targetSubjects: ['Chemistry'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  const sprint = rec.buildFocusedSprint();
  assert(sprint.eligible, 'A Forming-only graph should still produce an eligible Focused Sprint, not require Fading');
  assertEqual(sprint.topic, 'Stoichiometry', 'Sprint should target the Forming topic');
});

test('buildFocusedSprint(): a topic with a Fading concept outranks a topic that is only Forming', () => {
  const graph = new KnowledgeGraph();
  const fading = new ConceptNode({ id: 'sprint_fading', name: 'Titration', subject: 'Chemistry', topic: 'Acids and Bases' });
  fading.retentionState = 'fading';
  fading.decayEstimate = 0.3;
  graph.addConcept(fading);
  const forming = new ConceptNode({ id: 'sprint_forming2', name: 'Balancing Equations', subject: 'Chemistry', topic: 'Stoichiometry' });
  forming.retentionState = 'forming';
  graph.addConcept(forming);
  const profile = new StudentProfile({ studentId: 'sprint_pick', name: 'S', targetSubjects: ['Chemistry'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  const sprint = rec.buildFocusedSprint();
  assertEqual(sprint.topic, 'Acids and Bases', 'A Fading topic should always outrank a Forming-only topic for the Sprint slot');
});

test('_conceptUrgencyScore(): a MORE-forgotten Fading concept outranks a LESS-forgotten one (fixed tiebreaker — was previously inverted)', () => {
  const graph = new KnowledgeGraph();
  const badlyForgotten = new ConceptNode({ id: 'urgency_bad', name: 'Opportunity Cost', subject: 'Economics', topic: 'Basic Concepts' });
  badlyForgotten.retentionState = 'fading';
  badlyForgotten.decayEstimate = 0.1; // almost completely forgotten
  const barelyForgotten = new ConceptNode({ id: 'urgency_barely', name: 'Elasticity of Demand', subject: 'Economics', topic: 'Basic Concepts' });
  barelyForgotten.retentionState = 'fading';
  barelyForgotten.decayEstimate = 0.9; // barely forgotten
  graph.addConcept(badlyForgotten);
  graph.addConcept(barelyForgotten);
  const profile = new StudentProfile({ studentId: 'urgency_student', name: 'S', targetSubjects: ['Economics'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  assert(rec._conceptUrgencyScore(badlyForgotten) > rec._conceptUrgencyScore(barelyForgotten),
    'The more-forgotten Fading concept must score higher than the less-forgotten one');
});

test('_conceptUrgencyScore(): exam-proximity pressure-test boost applies to Reinforced too, not just Held (fixed asymmetry)', () => {
  const soonExam = Date.now() + 20 * 24 * 60 * 60 * 1000;
  const graph = new KnowledgeGraph();
  const reinforced = new ConceptNode({ id: 'urgency_reinforced', name: 'Supply and Demand', subject: 'Economics', topic: 'Market Forces' });
  reinforced.retentionState = 'reinforced';
  reinforced.decayEstimate = 0.5;
  graph.addConcept(reinforced);
  const profile = new StudentProfile({ studentId: 'urgency_exam', name: 'S', targetSubjects: ['Economics'], examDate: soonExam });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: soonExam });

  assert(rec._conceptUrgencyScore(reinforced) >= 200, 'A Reinforced concept close to exam should receive the pressure-test boost, previously Held-only');
});

test('buildFrontierPush(): only surfaces genuinely Unseen concepts, never something already in progress', () => {
  const graph = new KnowledgeGraph();
  graph.addConcept(new ConceptNode({ id: 'frontier_unseen', name: 'Federalism', subject: 'Government', topic: 'Systems of Government' }));
  const inProgress = new ConceptNode({ id: 'frontier_forming', name: 'Fundamental Rights', subject: 'Government', topic: 'Constitution' });
  inProgress.retentionState = 'forming';
  graph.addConcept(inProgress);
  const profile = new StudentProfile({ studentId: 'frontier_student', name: 'S', targetSubjects: ['Government'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  const frontier = rec.buildFrontierPush();
  assert(frontier.eligible, 'An Unseen topic should make Frontier Push eligible');
  assert(frontier.conceptIds.includes('frontier_unseen'), 'Frontier Push should include the Unseen concept');
  assert(!frontier.conceptIds.includes('frontier_forming'), 'Frontier Push must never include a concept already in progress');
});

test('buildUtmeMix(): ineligible without critical mass or peak_readiness; eligible once macroState is peak_readiness regardless of ratio', () => {
  const graph = new KnowledgeGraph();
  const held = new ConceptNode({ id: 'mix_held', name: 'Photosynthesis', subject: 'Biology', topic: 'Plant Nutrition' });
  held.retentionState = 'held';
  graph.addConcept(held);
  const profile = new StudentProfile({ studentId: 'mix_student', name: 'S', targetSubjects: ['Biology'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  assert(!rec.buildUtmeMix().eligible, 'One touched concept is nowhere near critical mass and macroState is not peak_readiness — UTME Mix should not be offered yet');

  profile.macroState = 'peak_readiness';
  assert(rec.buildUtmeMix().eligible, 'peak_readiness should make UTME Mix eligible regardless of Held ratio — pressure-testing everything matters this close to the exam');
});

test('buildUtmeMix(): genuinely interleaves across subjects rather than sorting one subject to the front', () => {
  const graph = new KnowledgeGraph();
  const now = Date.now();
  for (let i = 0; i < 6; i++) {
    const c = new ConceptNode({ id: `mix_bio_${i}`, name: `Biology Concept ${i}`, subject: 'Biology', topic: 'Genetics' });
    c.retentionState = 'held';
    c.nextReviewEstimate = now - 1000; // due
    graph.addConcept(c);
  }
  const physicsOne = new ConceptNode({ id: 'mix_phys_0', name: "Ohm's Law", subject: 'Physics', topic: 'Electricity' });
  physicsOne.retentionState = 'reinforced';
  physicsOne.nextReviewEstimate = now - 1000;
  graph.addConcept(physicsOne);

  const profile = new StudentProfile({ studentId: 'mix_interleave', name: 'S', targetSubjects: ['Biology', 'Physics'] });
  profile.macroState = 'peak_readiness';
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  const mix = rec.buildUtmeMix();
  assert(mix.eligible, 'Should be eligible under peak_readiness');
  const firstPhysicsIndex = mix.conceptIds.indexOf('mix_phys_0');
  assert(firstPhysicsIndex >= 0 && firstPhysicsIndex <= 1,
    'The lone Physics concept should surface within the first couple of slots, not buried after all six Biology concepts — a genuine cross-subject mix, not a single-subject sort');
});

test('getDashboardOptions(): the Circuit Breaker pivots Focused Sprint to a different subject, but still offers the blocked subject via a type with no alternative', () => {
  const graph = new KnowledgeGraph();
  const physicsFading = new ConceptNode({ id: 'cb_physics_fading', name: 'Projectile Motion', subject: 'Physics', topic: 'Mechanics' });
  physicsFading.retentionState = 'fading';
  physicsFading.decayEstimate = 0.3;
  graph.addConcept(physicsFading);
  // Physics is the ONLY subject with an Unseen concept, so Frontier Push
  // has nowhere else to pivot to when Physics is blocked.
  graph.addConcept(new ConceptNode({ id: 'cb_physics_unseen', name: 'Thermodynamics Basics', subject: 'Physics', topic: 'Heat' }));
  const chemistryForming = new ConceptNode({ id: 'cb_chem_forming', name: 'Mole Concept', subject: 'Chemistry', topic: 'Stoichiometry' });
  chemistryForming.retentionState = 'forming';
  graph.addConcept(chemistryForming);

  const profile = new StudentProfile({ studentId: 'cb_student', name: 'S', targetSubjects: ['Physics', 'Chemistry'] });
  profile.lastFrustratedSubject = 'Physics';
  profile.lastFrustratedAt = Date.now();
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  const { primary, secondary } = rec.getDashboardOptions();
  assertEqual(primary.type, 'focused_sprint', 'Focused Sprint should still take Primary...');
  assertEqual(primary.subject, 'Chemistry', '...but pivoted to Chemistry since Physics just frustrated the student, per the spec\'s own "pivot to a Chemistry or Biology Sprint" example');
  assert(secondary && secondary.subject === 'Physics', 'Physics should still surface as Secondary via Frontier Push, since Frontier has no other subject to pivot to');
  assertEqual(secondary.type, 'frontier_push', 'The Secondary offering should be the Frontier Push, not a second Sprint');
});

test('getDashboardOptions(): never returns an empty dashboard when the student has any enrolled concept at all', () => {
  const graph = new KnowledgeGraph();
  const held = new ConceptNode({ id: 'fallback_held', name: 'Cell Division', subject: 'Biology', topic: 'Cell Biology' });
  held.retentionState = 'held';
  graph.addConcept(held);
  const profile = new StudentProfile({ studentId: 'fallback_student', name: 'S', targetSubjects: ['Biology'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  const { primary } = rec.getDashboardOptions();
  assert(primary !== null, 'A student with only comfortably-Held concepts and no critical mass yet must still get a real Primary option, never an empty dashboard');
  assert(primary.conceptIds.includes('fallback_held'), 'The fallback should surface the concept that actually exists');
});

test("recordSessionOutcome()/recordSprintDodged(): Circuit Breaker sets and clears correctly, Avoidance Tracker crosses its threshold and resets on completion", () => {
  const graph = new KnowledgeGraph();
  const profile = new StudentProfile({ studentId: 'avoid_student', name: 'S', targetSubjects: ['Mathematics'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  rec.recordSessionOutcome({ type: 'focused_sprint', subject: 'Mathematics', accuracy: 0.3 });
  assertEqual(profile.lastFrustratedSubject, 'Mathematics', 'A sub-threshold accuracy should set the Circuit Breaker for that subject');

  rec.recordSessionOutcome({ type: 'focused_sprint', subject: 'Mathematics', accuracy: 0.8 });
  assertEqual(profile.lastFrustratedSubject, null, 'A later strong session in the same subject should clear the Circuit Breaker');

  for (let i = 1; i < DashboardConstants.AVOIDANCE_STREAK_THRESHOLD; i++) {
    assert(!rec.recordSprintDodged('Mathematics'), `Dodge #${i} should not yet cross the avoidance threshold`);
  }
  assert(rec.recordSprintDodged('Mathematics'), `Dodge #${DashboardConstants.AVOIDANCE_STREAK_THRESHOLD} should cross AVOIDANCE_STREAK_THRESHOLD`);

  rec.recordSessionOutcome({ type: 'focused_sprint', subject: 'Mathematics', accuracy: 1.0 });
  assertEqual(profile.avoidanceStreaks['Mathematics'], 0, "Actually completing the subject's Sprint should reset its avoidance streak");
});

test("KairoEngine.recordSprintDodged(): stays silent until the avoidance streak crosses threshold, then returns Kai's explicitly-authorized direct-tone message", () => {
  const engine = new KairoEngine({ studentId: 'avoidance_kai_student', name: 'S', targetSubjects: ['Physics'] });

  for (let i = 1; i < DashboardConstants.AVOIDANCE_STREAK_THRESHOLD; i++) {
    const result = engine.recordSprintDodged('Physics');
    assertEqual(result.thresholdCrossed, false, `Dodge #${i} should not cross the threshold`);
    assertEqual(result.kaiMessage, null, `No Kai message should be generated before the threshold is crossed`);
  }

  const final = engine.recordSprintDodged('Physics');
  assertEqual(final.thresholdCrossed, true, 'The final dodge should cross AVOIDANCE_STREAK_THRESHOLD');
  assert(final.kaiMessage !== null, 'Crossing the threshold should produce a real Kai message');
  assertEqual(final.kaiMessage.text, "Look, you've avoided Physics all week. The UTME won't let you skip it. Give me 5 minutes to help you fix this.",
    'The message must be the exact, product-owner-authorized copy, with the real subject interpolated');
});

test('_sessionLengthCap()/shouldEndSession(): at_risk gets the same gentle treatment as wavering/recovering (was previously falling through to the 15-question default)', () => {
  const graph = new KnowledgeGraph();
  const profile = new StudentProfile({ studentId: 'at_risk_student', name: 'S', targetSubjects: ['Biology'] });
  profile.macroState = 'at_risk';
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null });

  assertEqual(rec._sessionLengthCap(), 5, 'at_risk should get the same 5-question gentle cap as wavering/recovering, not the 15-question default');

  rec.sessionQueue = ['x']; // non-empty, so only the gentle-limit branch can trigger "end"
  rec.sessionHistory = new Array(8).fill('y');
  assertEqual(rec.shouldEndSession().end, true, 'at_risk should also trigger the gentle 8-question early-end, matching wavering/recovering');
});

test('getQuestionForConcept({enforceVolumeLock}): a failed question stays locked until BOTH the 24h time lock and the topic-volume lock clear', () => {
  const engine = new KairoEngine({ studentId: 'hybrid_lock_student', name: 'S', targetSubjects: ['Physics'] });
  const conceptId = engine.addConcept({ name: 'Vectors', subject: 'Physics', topic: 'Kinematics' });

  // 6 real questions in the topic -> volume lock = min(30, floor(6 * 0.5)) = 3.
  for (let i = 1; i <= 6; i++) {
    engine.questionGraph.addQuestion(new Question({
      id: `hl_q${i}`, subject: 'Physics', topic: 'Kinematics', stem: `Question ${i}`,
      conceptsTested: [{ conceptId, weight: 1 }],
      options: [{ label: 'A', text: 'A', isCorrect: true }], correctOption: 'A', lifecycleState: 'live'
    }));
  }

  const concept = engine.graph.getConcept(conceptId);
  const failTime = Date.now() - 25 * 60 * 60 * 1000; // 25h ago — the time lock alone is already satisfied
  concept.attemptHistory.push({ conceptId, questionId: 'hl_q1', correct: false, timestamp: failTime, responseTimeMs: 4000 });

  const lockedUntil = engine._questionCooldownUntil('hl_q1', concept, { enforceVolumeLock: true });
  assert(lockedUntil > Date.now(), 'Past the 24h time lock but with zero practice volume since the failure, the question must still be locked');

  const withoutVolumeLock = engine._questionCooldownUntil('hl_q1', concept, { enforceVolumeLock: false });
  assert(withoutVolumeLock <= Date.now(), 'The plain (non-Sprint) time-only lock should already be satisfied at 25h, confirming the volume lock above is what is actually holding it back');

  // 3 more real attempts in the same topic since the failure — satisfies the volume lock.
  for (let i = 0; i < 3; i++) {
    concept.attemptHistory.push({ conceptId, questionId: `hl_q${i + 2}`, correct: true, timestamp: failTime + 1000 * (i + 1), responseTimeMs: 4000 });
  }
  const unlockedNow = engine._questionCooldownUntil('hl_q1', concept, { enforceVolumeLock: true });
  assert(unlockedNow <= Date.now(), 'Once both the time lock and the topic-volume lock are satisfied, the failed question should unlock');
});

test('KairoEngine.getDashboardOptions(): exposes overflowConceptIds so a real session can be built beyond the preview length', () => {
  const engine = new KairoEngine({ studentId: 'dashboard_overflow_student', name: 'S', targetSubjects: ['Chemistry'] });
  const fadingId = engine.addConcept({ name: 'Titration', subject: 'Chemistry', topic: 'Acids, bases and salts' });
  engine.graph.getConcept(fadingId).retentionState = 'fading';
  const otherFadingId = engine.addConcept({ name: 'pH Scale', subject: 'Chemistry', topic: 'Water' });
  engine.graph.getConcept(otherFadingId).retentionState = 'fading';

  const { primary } = engine.getDashboardOptions();
  assert(primary !== null, 'A student with Fading concepts should get a real Primary Focused Sprint option');
  assert(Array.isArray(primary.overflowConceptIds), 'overflowConceptIds must be present on the resolved dashboard option, not just used internally');
});

// ═══════════════════════════════════════════════════════════════
// PLANNER HANDSHAKE — PlannerBridge
// ═══════════════════════════════════════════════════════════════

test('PlannerBridge.getSignal(): no mapping at all (Mathematics/Use of English today) always returns none', () => {
  const bridge = new PlannerBridge([], { completed_topic_keys: [], topic_progress: {} });
  assertEqual(bridge.getSignal('Mathematics', 'Indices and Logarithms', 86400000).signal, 'none',
    'An engine topic with no reviewed planner_topic_map row must never guess a signal');
});

test('PlannerBridge.getSignal(): due_critical fires for an unresolved critical gap, stripping the real stageOrder-bearing topicKey correctly', () => {
  const mapRows = [{ subject_slug: 'chemistry', topic_title: 'Chemical Equilibrium', engine_subject: 'Chemistry', engine_topics: ['Chemical equilibria'] }];
  // Real shape: plannerEngine.ts's topicKey() = `${subjectSlug}::${stageOrder}::${topicTitle}`.
  const plannerState = { completed_topic_keys: [], topic_progress: { 'chemistry::3::Chemical Equilibrium': { tier: 'critical', criticalGap: true, resurfaceDates: [], lastAttemptedAt: new Date().toISOString() } } };
  const bridge = new PlannerBridge(mapRows, plannerState);

  const signal = bridge.getSignal('Chemistry', 'Chemical equilibria', 86400000);
  assertEqual(signal.signal, 'due_critical', 'An unresolved critical gap on the mapped Planner topic should surface as due_critical');
});

test('PlannerBridge.getSignal(): due_critical also fires for a plain resurface date that has arrived (not just a critical gap)', () => {
  const mapRows = [{ subject_slug: 'physics', topic_title: 'Kinetic Theory & Gas Laws', engine_subject: 'Physics', engine_topics: ['Kinetic Theory of Matter', 'Gas Laws'] }];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const plannerState = { completed_topic_keys: [], topic_progress: { 'physics::2::Kinetic Theory & Gas Laws': { tier: 'forming', criticalGap: false, resurfaceDates: [yesterday], lastAttemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() } } };
  const bridge = new PlannerBridge(mapRows, plannerState);

  assertEqual(bridge.getSignal('Physics', 'Gas Laws', 86400000).signal, 'due_critical',
    'One Planner topic mapping to multiple engine topics (the genuine one-to-many case) should surface the signal on every mapped engine topic');
});

test('PlannerBridge.getSignal(): recently_completed fires within the quarantine window, but a stale (old) completion falls through to whatever is actually due instead', () => {
  const mapRows = [{ subject_slug: 'biology', topic_title: 'Nutrition', engine_subject: 'Biology', engine_topics: ['Nutrition'] }];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const freshState = { completed_topic_keys: ['biology::1::Nutrition'], topic_progress: { 'biology::1::Nutrition': { tier: 'mastery', criticalGap: false, resurfaceDates: [], lastAttemptedAt: oneHourAgo } } };
  const freshBridge = new PlannerBridge(mapRows, freshState);
  assertEqual(freshBridge.getSignal('Biology', 'Nutrition', 86400000).signal, 'recently_completed',
    'A completion within the 24h window should quarantine the topic');

  const longAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayIso = new Date().toISOString().slice(0, 10);
  const staleState = { completed_topic_keys: ['biology::1::Nutrition'], topic_progress: { 'biology::1::Nutrition': { tier: 'forming', criticalGap: false, resurfaceDates: [todayIso], lastAttemptedAt: longAgo } } };
  const staleBridge = new PlannerBridge(mapRows, staleState);
  assertEqual(staleBridge.getSignal('Biology', 'Nutrition', 86400000).signal, 'due_critical',
    'A completion from a month ago is not "recently completed" — a genuinely due resurface since then should still surface');
});

test('RecommendationEngine._conceptUrgencyScore(): Planner Handshake zeroes a just-completed concept regardless of Fading, and boosts a due-critical one', () => {
  const graph = new KnowledgeGraph();
  const justVerified = new ConceptNode({ id: 'ph_verified', name: 'Titration', subject: 'Chemistry', topic: 'Acids, bases and salts' });
  justVerified.retentionState = 'fading';
  justVerified.decayEstimate = 0.1; // badly forgotten by the engine's own data
  graph.addConcept(justVerified);
  const dueCritical = new ConceptNode({ id: 'ph_critical', name: 'Neutralisation', subject: 'Chemistry', topic: 'Energy changes' });
  dueCritical.retentionState = 'held'; // otherwise unremarkable to the engine
  dueCritical.decayEstimate = 0.9;
  graph.addConcept(dueCritical);

  const mapRows = [
    { subject_slug: 'chemistry', topic_title: 'Acids, Bases & Salts', engine_subject: 'Chemistry', engine_topics: ['Acids, bases and salts'] },
    { subject_slug: 'chemistry', topic_title: 'Energy Changes', engine_subject: 'Chemistry', engine_topics: ['Energy changes'] }
  ];
  const plannerState = {
    completed_topic_keys: ['chemistry::9::Acids, Bases & Salts'],
    topic_progress: {
      'chemistry::9::Acids, Bases & Salts': { tier: 'mastery', criticalGap: false, resurfaceDates: [], lastAttemptedAt: new Date().toISOString() },
      'chemistry::12::Energy Changes': { tier: 'critical', criticalGap: true, resurfaceDates: [], lastAttemptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    }
  };
  const bridge = new PlannerBridge(mapRows, plannerState);
  const profile = new StudentProfile({ studentId: 'planner_urgency_student', name: 'S', targetSubjects: ['Chemistry'] });
  const rec = new RecommendationEngine({ knowledgeGraph: graph, studentProfile: profile, decayModel: null, examDate: null, plannerBridge: bridge });

  assertEqual(rec._conceptUrgencyScore(justVerified), 0,
    'A badly-Fading concept whose Planner topic was just verified should be zeroed out for the quarantine window, not ranked urgent');
  assert(rec._conceptUrgencyScore(dueCritical) >= DashboardConstants.PLANNER_DUE_CRITICAL_BOOST,
    'An otherwise-unremarkable Held concept whose Planner topic is an unresolved critical gap should get the Planner boost');
});

// ═══════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════

test('Onboarding starts with welcome step', () => {
  const step = engine.startOnboarding();
  assertEqual(step.id, 'welcome', 'First step should be welcome');
  assert(step.title, 'Should have title');
  assert(step.body, 'Should have body');
});

test('Onboarding progresses through steps', () => {
  engine.submitOnboardingStep(); // welcome
  const nameStep = engine.submitOnboardingStep('Test Student'); // name
  assertEqual(nameStep.id, 'goal', 'Should move to goal step');
});

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════

test('Segmented leaderboard assigns student', () => {
  const result = engine.segmentedLeaderboard.addStudent(engine.profile);
  assert(result.segmentKey, 'Should return segment key');
  assert(typeof result.rank === 'number', 'Should have rank');
});

test('Segmented leaderboard returns rankings', () => {
  const board = engine.getMyLeaderboard();
  assert(Array.isArray(board), 'Should return array');
  assert(board.length > 0, 'Should have at least current user');
  const me = board.find(b => b.isCurrentUser);
  assert(me, 'Should find current user in leaderboard');
});

test('University leaderboard records practice', () => {
  engine.universityLeaderboard.recordPractice(engine.profile, 75);
  const rankings = engine.getUniversityRankings();
  assert(Array.isArray(rankings), 'Should return rankings array');
  assert(rankings.length > 0, 'Should have university entries');
});

// ═══════════════════════════════════════════════════════════════
// CONTENT PACKS
// ═══════════════════════════════════════════════════════════════

test('Content pack manager lists available packs', () => {
  const packs = engine.contentPacks.constructor.getAvailablePacks();
  assert(packs.length > 0, 'Should have available packs');
  assert(packs[0].subject, 'Pack should have subject');
  assert(packs[0].questions, 'Pack should have question count');
});

test('Content pack manager tracks storage', async () => {
  const usage = await engine.contentPacks.getStorageUsage();
  assert(typeof usage.totalMB === 'number', 'Should have totalMB');
  assert(typeof usage.totalQuestions === 'number', 'Should have totalQuestions');
});

await test('prefetchRecommendationQueues()/popPrefetchedQueue(): builds real, resolved offline queues and pops them oldest-first without disturbing a live session', async () => {
  const engine = new KairoEngine({ studentId: 'prefetch1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  for (let i = 0; i < 15; i++) {
    const cid = engine.addConcept({ name: `Prefetch Concept ${i}`, subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
    engine.questionGraph.addQuestion(new Question({
      id: `prefetch_q${i}`, subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
      conceptsTested: [{ conceptId: cid, weight: 1 }],
      stem: `S${i}`, options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
      lifecycleState: 'live'
    }));
  }

  // A real session already in progress must be completely unaffected.
  const before = engine.startSession({ mode: 'standard' });

  const { queued } = await engine.prefetchRecommendationQueues({ queueCount: 2, questionsPerQueue: 10 });
  assertEqual(queued, 2, '15 concepts / 10 per queue should produce exactly 2 non-empty queues (10 + 5)');
  assertEqual(engine.currentSession.plan, before.queue, 'Prefetching must never touch the already-in-progress live session plan');

  const first = await engine.popPrefetchedQueue();
  assert(first, 'First pop should return a real cached queue');
  assertEqual(first.questions.length, 10, 'First (oldest) queue should carry its full 10 resolved questions');
  assert(first.questions[0].id, 'Cached questions should be real, already-resolved question objects, not bare concept IDs');

  const second = await engine.popPrefetchedQueue();
  assert(second, 'Second pop should return the other cached queue');
  assert(second.queueId !== first.queueId, 'Each pop should consume a distinct queue, not the same one twice');

  const third = await engine.popPrefetchedQueue();
  assertEqual(third, null, 'Once every cached queue is popped, there should honestly be nothing left rather than a fabricated one');
});

// ═══════════════════════════════════════════════════════════════
// STUDENT INTELLIGENCE MODEL — Emotional Profile & Learning State
// ═══════════════════════════════════════════════════════════════

test('Emotional profile computes without error on a fresh engine', () => {
  const states = engine.emotionalProfile.compute(engine.graph);
  assert(Array.isArray(states), 'Should return an array of states');
});

test('Emotional profile detects needs_challenge for a coasting student', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'emo_test_001', name: 'Coasting Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  for (let i = 0; i < 5; i++) {
    const id = testEngine.addConcept({
      name: `Coast Concept ${i}`, subject: 'Chemistry', topic: 'T', subtopic: 'S',
      questionPoolIds: ['q1']
    });
    testEngine.graph.getConcept(id).retentionState = RetentionState.HELD;
  }
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  testEngine.profile.sessions = [
    { completedAt: now - 3 * day, questionsAnswered: 10, correctCount: 9 },
    { completedAt: now - 2 * day, questionsAnswered: 10, correctCount: 9 },
    { completedAt: now - 1 * day, questionsAnswered: 10, correctCount: 9 }
  ];
  const states = testEngine.emotionalProfile.compute(testEngine.graph);
  assert(states.includes('needs_challenge'), 'Should detect needs_challenge for a high-mastery, flat-difficulty student');
});

test('Learning state starts at new_learner for a fresh student', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'ls_test_001', name: 'Fresh Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const state = testEngine.learningState.compute(testEngine.graph);
  assertEqual(state, 'new_learner', 'Fresh student should start in new_learner');
});

test('Learning state moves to exam_sprint inside the final 2 weeks', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'ls_test_002', name: 'Sprint Student',
    examDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.profile.totalQuestionsAnswered = 100;
  const id = testEngine.addConcept({ name: 'Sprint Concept', subject: 'Chemistry', topic: 'T', subtopic: 'S', questionPoolIds: ['q1'] });
  testEngine.graph.getConcept(id).retentionState = RetentionState.HELD;
  const state = testEngine.learningState.compute(testEngine.graph);
  assertEqual(state, 'exam_sprint', 'Student within 14 days of exam should be in exam_sprint');
});

test('Learning state persists through StudentProfile serialization', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'ls_test_003', name: 'Persist Student',
    examDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.profile.totalQuestionsAnswered = 100;
  testEngine.learningState.compute(testEngine.graph);
  const serialized = testEngine.profile.toJSON();
  assertEqual(serialized.learningState, 'exam_sprint', 'learningState should be present on serialized profile');
});

// ═══════════════════════════════════════════════════════════════
// STUDENT JOURNEY & ENGAGEMENT ENGINE (SJEE)
// ═══════════════════════════════════════════════════════════════

test('Journey stage starts at arrival and is readable via KairoEngine', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_001', name: 'Journey Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const stage = testEngine.journeyStage.compute(testEngine.graph);
  assertEqual(stage, 'arrival', 'Fresh engine should start at arrival');
  assertEqual(testEngine.profile.journeyStage, 'arrival', 'Should mirror onto profile');
});

await test('A real session started via startSession() is marked unprompted, letting Activation genuinely progress to Establishment', async () => {
  // Regression: startSession() never set session.prompted at all, so
  // JourneyStageTracker._hasActivated()'s `s.prompted === false` check
  // (undefined === false) was always false — no student could ever
  // reach Establishment on real behavior, only via exam-date proximity
  // overrides. Every other SJEE-area test mocked `prompted` directly on
  // hand-built session objects, so this never got caught.
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_007', name: 'Activation Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  await testEngine.init();
  const cId = testEngine.addConcept({ name: 'ActC1', subject: 'Chemistry', topic: 'T', subtopic: 'S', questionPoolIds: ['aq1'] });

  testEngine.startSession({ mode: 'standard', plan: [cId] });
  assertEqual(testEngine.currentSession.prompted, false, 'A real session should be recorded as unprompted — nothing currently prompts a return');
  testEngine.submitAnswer({ conceptId: cId, correct: true, responseTimeMs: 4000, selectedOption: 'A', correctOption: 'A', questionId: 'aq1' });
  testEngine.currentSession.questionsAnswered = 1;
  testEngine.currentSession.correctCount = 1;
  await testEngine.endSession();

  // Backdate the one real session so a second, later one lands on a
  // distinct calendar day (Activation needs two non-consecutive days).
  testEngine.profile.sessions[0].completedAt -= 24 * 60 * 60 * 1000;

  testEngine.startSession({ mode: 'standard', plan: [cId] });
  testEngine.submitAnswer({ conceptId: cId, correct: true, responseTimeMs: 4000, selectedOption: 'A', correctOption: 'A', questionId: 'aq1' });
  testEngine.currentSession.questionsAnswered = 1;
  testEngine.currentSession.correctCount = 1;
  await testEngine.endSession();

  const stage = testEngine.journeyStage.compute(testEngine.graph);
  assertEqual(stage, 'establishment', 'Two distinct real practice days with real concept movement should reach Establishment');
});

test('Notification orchestrator enforces the single daily standard-tier slot', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_002', name: 'Notif Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.notificationOrchestrator.submit({
    type: 'urgent_decay', tier: 'standard', title: 'Fading', body: 'A concept is starting to fade.', priorityWeight: 10
  });
  testEngine.notificationOrchestrator.submit({
    type: 'review_backlog', tier: 'standard', title: 'Review', body: 'Some items are ready.', priorityWeight: 5
  });
  const first = testEngine.notificationOrchestrator.arbitrate();
  assertEqual(first.length, 1, 'Only one standard-tier candidate should survive the first pass');

  testEngine.notificationOrchestrator.submit({
    type: 'another', tier: 'standard', title: 'X', body: 'Something else worth saying.', priorityWeight: 20
  });
  const second = testEngine.notificationOrchestrator.arbitrate();
  assertEqual(second.length, 0, 'Budget already used today — nothing should get through');
});

test('Notification orchestrator tone gate blocks guilt-language copy', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_003', name: 'Tone Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.notificationOrchestrator.submit({
    type: 'bad', tier: 'informational', title: 'Careful', body: 'You are falling behind everyone else.'
  });
  const result = testEngine.notificationOrchestrator.arbitrate();
  assertEqual(result.length, 0, 'Guilt-language candidate should be silently discarded');
});

test('Re-engagement engine withholds a candidate when no honest content exists', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_004', name: 'Reengage Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  testEngine.profile.sessions = [
    { completedAt: now - 20 * day, questionsAnswered: 5, correctCount: 4 },
    { completedAt: now - 15 * day, questionsAnswered: 5, correctCount: 4 },
    { completedAt: now - 10 * day, questionsAnswered: 5, correctCount: 4 },
    { completedAt: now - 12 * day, questionsAnswered: 5, correctCount: 4 }
  ];
  const candidate = testEngine.reEngagement.generateCandidate(testEngine.graph);
  assertEqual(candidate, null, 'No fading concepts exist — silence is correct, not a generic template');
});

test('Cross-module milestones do not fire during a discouraged emotional state', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_005', name: 'Milestone Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const found = testEngine.crossModuleMilestones.check(testEngine.graph, ['discouraged']);
  assertEqual(found.length, 0, 'Milestones should be suppressed during a visible rough patch');
});

test('Cross-module milestones surface only one at a time and queue the rest (§9.5)', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_006', name: 'Priority Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry', 'Physics'], targetCourse: 'Medicine and Surgery'
  });
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  testEngine.profile.sessions = [
    { completedAt: now - 2 * day, prompted: true, questionsAnswered: 5, correctCount: 4 },
    { completedAt: now - 1 * day, prompted: false, questionsAnswered: 5, correctCount: 4 }
  ];
  const c1Id = testEngine.addConcept({ name: 'C1', subject: 'Chemistry', topic: 'T', subtopic: 'S', questionPoolIds: ['q1'] });
  const c2Id = testEngine.addConcept({ name: 'C2', subject: 'Physics', topic: 'T', subtopic: 'S', questionPoolIds: ['q2'] });
  testEngine.graph.getConcept(c1Id).retentionState = RetentionState.REINFORCED;
  testEngine.graph.getConcept(c2Id).retentionState = RetentionState.REINFORCED;
  testEngine.journeyStage.compute(testEngine.graph); // triggers arrival->establishment

  const first = testEngine.crossModuleMilestones.check(testEngine.graph, []);
  assertEqual(first.length, 1, 'Only one milestone should surface even though two qualify simultaneously');
  assert(testEngine.crossModuleMilestones.pendingQueue.length >= 1, 'The other qualifying milestone should be queued, not discarded');

  const second = testEngine.crossModuleMilestones.check(testEngine.graph, []);
  assertEqual(second.length, 1, 'The queued milestone should be delivered on the next check');
});

test('Notification orchestrator hard opt-out overrides even time-critical (§9.7)', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_007', name: 'OptOut Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.notificationOrchestrator.submit({
    type: 'urgent', tier: 'time_critical', title: 'Live', body: 'Your mock starts in 10 minutes.'
  });
  testEngine.notificationOrchestrator.setHardOptOut(true);
  const result = testEngine.notificationOrchestrator.arbitrate();
  assertEqual(result.length, 0, 'Hard opt-out should block even time-critical candidates');
});

test('Continuation engine sends exactly one post-exam acknowledgment', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_008', name: 'PostExam Student',
    examDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const first = testEngine.continuation.checkImmediateWindow();
  assert(first !== null, 'Should send an acknowledgment the day after the exam');
  const second = testEngine.continuation.checkImmediateWindow();
  assertEqual(second, null, 'Should not send a second acknowledgment');
});

test('Continuation engine never solicits an outcome', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_009', name: 'NoSolicit Student',
    examDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  assertEqual(testEngine.continuation.shouldSolicitOutcome(), false, 'Should never solicit outcome data');
});

test('runNotificationPulse() respects a hard stop and delivers nothing', () => {
  // Regression: this is the real entrypoint that finally invokes
  // ReEngagementEngine/CrossModuleMilestones/ContinuationEngine/
  // NotificationEngine — all fully built, individually tested, but never
  // actually called from anywhere in the running app until now.
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_010', name: 'HardStop Student',
    examDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // exam just passed -> real continuation candidate available
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.comms.consent.setHardStop(true);
  const delivered = testEngine.runNotificationPulse();
  assertEqual(delivered.length, 0, 'A real "Stop All Notifications" hard-stop should block every candidate, including the post-exam acknowledgment');
  assertEqual(testEngine.notificationOrchestrator.hardOptOut, true, 'Orchestrator hardOptOut should mirror the real, persisted consent hard-stop rather than drifting independently');
});

test('runNotificationPulse() surfaces a real Journey Stage transition milestone end-to-end', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_011', name: 'Pulse Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  testEngine.profile.sessions = [
    { completedAt: now - 2 * day, prompted: true, questionsAnswered: 5, correctCount: 4 },
    { completedAt: now - 1 * day, prompted: false, questionsAnswered: 5, correctCount: 4 }
  ];
  const cId = testEngine.addConcept({ name: 'PulseC1', subject: 'Chemistry', topic: 'T', subtopic: 'S', questionPoolIds: ['pq1'] });
  testEngine.graph.getConcept(cId).retentionState = RetentionState.REINFORCED;
  testEngine.journeyStage.compute(testEngine.graph); // triggers arrival -> establishment

  const delivered = testEngine.runNotificationPulse();
  const milestone = delivered.find(c => c.type === 'milestone_journey_stage_transition');
  assert(milestone, 'The real Establishment transition milestone should survive submit -> arbitrate and come back out of runNotificationPulse()');
  assertEqual(milestone.tier, 'informational', 'Milestones are always Informational-tier (§7.5)');
});

test('recordNotificationOutcome() marks a NotificationEngine-sourced candidate read so it stops resurfacing', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'sjee_test_012', name: 'Recap Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const cId = testEngine.addConcept({ name: 'RecapC1', subject: 'Chemistry', topic: 'T', subtopic: 'S', questionPoolIds: ['rq1'] });
  testEngine.graph.getConcept(cId).retentionState = RetentionState.FADING;

  const first = testEngine.runNotificationPulse();
  const recap = first.find(c => c.type === 'daily_recap');
  assert(recap, 'A Fading concept with no session today should surface the real daily-recap candidate');

  testEngine.recordNotificationOutcome(recap, 'dismissed');
  const second = testEngine.notifications.checkNotifications();
  assertEqual(second.some(n => n.type === 'daily_recap'), false, 'Once acknowledged, the identical daily-recap item should not resurface on the next check');
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS & COMMUNICATION SYSTEMS
// ═══════════════════════════════════════════════════════════════

test('Comms service withholds delivery without consent, for a category with no in-app fallback', () => {
  // Exam-Critical has no ChannelSelector in-app fallback (§4.7 — Push or
  // SMS only), so it's the real "consent genuinely blocks delivery" case.
  const testEngine = new (engine.constructor)({
    studentId: 'comms_test_001', name: 'NoConsent Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const resolved = testEngine.comms.resolve({
    category: 'exam_critical', tier: 'time_critical',
    data: { observation: 'Your mock exam window opens in 10 minutes.', action: 'Open Kairo now.' }
  });
  assertEqual(resolved, null, 'No push/SMS permission granted and no in-app fallback for Exam-Critical — should resolve to null, not deliver');
});

test('Comms service falls back to in-app when no external channel is consented (§13.1)', () => {
  // Regression: ConsentManager.canSend() used to gate Channel.IN_APP
  // identically to every external channel, requiring an explicit
  // categoryPreferences[in_app_badge][category] === true entry that no UI
  // anywhere ever sets (Notification Settings only lists push/email/
  // whatsapp/sms) — so ChannelSelector's own "fall back to in-app so the
  // student still sees it" default silently resolved to null every time,
  // for every student, contradicting §13.1's "still receives full in-app
  // content" even with zero external channels granted.
  const testEngine = new (engine.constructor)({
    studentId: 'comms_test_001b', name: 'NoExternalConsent Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const resolved = testEngine.comms.resolve({
    category: 'academic_nudge', tier: 'standard',
    data: { observation: 'Mole Concept is starting to fade.', action: 'Review it now.' }
  });
  assert(resolved, 'Should still resolve — in-app is the graceful fallback, never gated behind unreachable per-channel consent');
  assertEqual(resolved.channel, 'in_app_badge', 'Should fall back to the in-app channel specifically');
});

test('Comms service resolves a full pipeline with consent granted', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'comms_test_002', name: 'Consented Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.comms.consent.grantChannelPermission('push');
  testEngine.comms.consent.setCategoryPreference('push', 'academic_nudge', true);

  const resolved = testEngine.comms.resolve({
    category: 'academic_nudge', tier: 'standard', macroState: 'building',
    data: { observation: 'Mole Concept is starting to fade.', action: 'Review it now.' }
  });
  assert(resolved !== null, 'Should resolve with consent granted');
  assertEqual(resolved.channel, 'push', 'Should select push channel');
  assert(resolved.rendered.text.includes('Mole Concept'), 'Rendered text should carry the specific concept name');
});

test('Comms service tone gate discards guilt-language candidates', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'comms_test_003', name: 'Tone Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.comms.consent.grantChannelPermission('push');
  testEngine.comms.consent.setCategoryPreference('push', 'reengagement_winback', true);

  const resolved = testEngine.comms.resolve({
    category: 'reengagement_winback', tier: 'standard',
    data: { observation: 'We miss you!', action: 'Come back.' }
  });
  assertEqual(resolved, null, 'Guilt-language content should be discarded, not delivered');
});

test('Comms service deduplicates the same fact within a delivery window', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'comms_test_004', name: 'Dedup Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  testEngine.comms.consent.grantChannelPermission('push');
  testEngine.comms.consent.setCategoryPreference('push', 'academic_nudge', true);

  const candidate = {
    category: 'academic_nudge', tier: 'standard', factKey: 'concept:c1:fading',
    data: { observation: 'Mole Concept is starting to fade.', action: 'Review it now.' }
  };
  const first = testEngine.comms.resolve(candidate);
  testEngine.comms.recordSent(candidate, first);
  const second = testEngine.comms.resolve(candidate);
  assertEqual(second, null, 'Same fact should not be delivered twice in the same window');
});


// ═══════════════════════════════════════════════════════════════
// LEARN MODULE TESTS
// ═══════════════════════════════════════════════════════════════

const learnEngine = new (engine.constructor)({
  studentId: 'learn_test_001', name: 'Learn Student',
  examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
  targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
});
await learnEngine.init();

const learnConceptId = learnEngine.addConcept({
  name: 'Balancing Redox Equations',
  subject: 'Chemistry', topic: 'Electrochemistry', subtopic: 'Redox Reactions',
  difficultyWeight: 1.3
});

const learnQuestion = new Question({
  id: 'lq1',
  subject: 'Chemistry', topic: 'Electrochemistry', subtopic: 'Redox Reactions',
  learningObjective: 'Assign oxidation states correctly before balancing a redox equation.',
  conceptsTested: [{ conceptId: learnConceptId, weight: 'primary' }],
  difficultyRating: 3, cognitiveLevel: 'application', calculationLoad: 'moderate',
  stem: 'Balance the following redox equation...',
  options: [
    { label: 'A', text: 'Option A', isCorrect: true },
    { label: 'B', text: 'Option B', isCorrect: false },
    { label: 'C', text: 'Option C', isCorrect: false }
  ],
  correctOption: 'A',
  explanation: 'Assign oxidation states to each atom, then balance electrons lost and gained.',
  distractors: [
    { option: 'B', misconceptionId: 'confused_similar_concepts', explanation: 'This mixes up oxidation and reduction.' }
  ],
  lifecycleState: 'live'
});
learnEngine.questionGraph.addQuestion(learnQuestion);
learnEngine.misconceptions.mapDistractor('lq1', 'B', 'confused_similar_concepts');

test('Learn: fromIncorrectAnswer builds a full lesson for a conceptual gap', () => {
  const lesson = learnEngine.learn.fromIncorrectAnswer({
    questionId: 'lq1', conceptId: learnConceptId, selectedOption: 'B', errorTag: ErrorTag.CONCEPTUAL_GAP
  });
  assert(!lesson.compressed, 'A conceptual_gap lesson should not be compressed');
  assert(lesson.steps.coreConcept.learningObjective.includes('oxidation states'), 'Learning objective should come from the anchoring question');
  assert(lesson.steps.commonMisconceptions[0].ownMistake === true, "Student's own mistake should be named first");
  assert(lesson.steps.examInsight, 'Exam insight should be present');
  // ExplanationEngine only fabricates a memory anchor for concepts with a
  // real, hand-authored one — none exist for this test fixture's concept,
  // so keyIdea should be cleanly omitted (null), not filled with generic text.
  assertEqual(lesson.steps.keyIdea, null, 'Key idea should be omitted when no genuine memory anchor exists for this concept');
  // Same discipline as memory anchors: TEACHING_HOOKS only covers the
  // Mathematics batch — this test fixture's concept isn't in it.
  assertEqual(lesson.steps.teachingHook, null, 'Teaching hook should be omitted when no genuine hook is authored for this concept');
});

test('Learn: careless_slip compresses to a light lesson', () => {
  const lesson2 = learnEngine.learn.fromIncorrectAnswer({
    questionId: 'lq1', conceptId: learnConceptId, selectedOption: 'B', errorTag: ErrorTag.CARELESS_SLIP
  });
  assert(lesson2.compressed, 'careless_slip should trigger compression');
  assertEqual(lesson2.steps.coreConcept.conceptSummary, null, 'Compressed lesson should skip the fuller concept summary');
});

test('Learn: teachingHook surfaces the real authored hook for a Mathematics concept, and is stripped when compressed', () => {
  const mathConceptId = learnEngine.addConcept({ name: 'Number Bases', subject: 'Mathematics', topic: 'Number Bases', subtopic: 'Base Conversion' });
  const mathQuestion = new Question({
    id: 'hook_q1', subject: 'Mathematics', topic: 'Number Bases', subtopic: 'Base Conversion',
    conceptsTested: [{ conceptId: mathConceptId, weight: 1 }],
    stem: 'Convert 110101₂ to base 10.',
    options: [{ label: 'A', text: '53', isCorrect: true }, { label: 'B', text: '43', isCorrect: false }],
    correctOption: 'A', explanation: 'Place values double moving left, giving 53.',
    lifecycleState: 'live'
  });
  learnEngine.questionGraph.addQuestion(mathQuestion);

  const lesson = learnEngine.learn.fromIncorrectAnswer({
    questionId: 'hook_q1', conceptId: mathConceptId, selectedOption: 'B', errorTag: ErrorTag.CONCEPTUAL_GAP
  });
  assert(lesson.steps.teachingHook, 'A concept with a real authored hook should surface it');
  assert(lesson.steps.teachingHook.hook.includes('number systems'), 'Should return the exact authored hook text for Number Bases');
  assert(lesson.steps.teachingHook.analogy.includes('Base ten'), 'Should return the exact authored analogy text for Number Bases');

  const compressedLesson = learnEngine.learn.fromIncorrectAnswer({
    questionId: 'hook_q1', conceptId: mathConceptId, selectedOption: 'B', errorTag: ErrorTag.CARELESS_SLIP
  });
  assertEqual(compressedLesson.steps.teachingHook, null, 'A compressed (careless_slip) lesson should strip the teaching hook along with the rest of the fuller content');
});

test('Learn: reinforcement attempt caps a Fading->Reinforced jump at Held', () => {
  const concept = learnEngine.graph.getConcept(learnConceptId);
  concept.retentionState = RetentionState.FADING;
  concept.decayEstimate = 0.3;
  const result = learnEngine.learn.submitReinforcementAttempt({ conceptId: learnConceptId, correct: true, responseTimeMs: 15000, questionId: 'lq1' });
  assertEqual(result.conceptState, RetentionState.HELD, 'A freshly-taught correct answer should cap at Held, not Reinforced');
  assert(result.masteryCheck.cappedToHeld, 'masteryCheck should flag the cap');
  assert(result.masteryCheck.holding, 'Held counts as holding for the Mastery Check');
});

test('Learn: completing a lesson clears it from active and records history', () => {
  const outcome = learnEngine.learn.completeLesson({ conceptId: learnConceptId });
  assertEqual(outcome.masteryHolding, true, 'Mastery check from the prior reinforcement attempt should carry through');
  assertEqual(learnEngine.learn.resumeLesson(learnConceptId), null, 'Completed lesson should no longer be resumable');
  assertEqual(learnEngine.learn.completedLessons.length, 1, 'Completed lesson should be recorded');
});

test('Learn: re-generating a lesson without completing counts as an abandonment', () => {
  learnEngine.learn.fromBookmark({ conceptId: learnConceptId }); // opens a fresh lesson
  learnEngine.learn.fromBookmark({ conceptId: learnConceptId }); // abandons the first, opens a second
  assertEqual(learnEngine.learn.abandonCounts.get(learnConceptId), 1, 'Reopening an unfinished lesson should count as one abandonment');
});

test('Learn: repeated abandonment biases the next lesson toward compression', () => {
  // A fresh, still-Forming concept — the earlier reinforcement-attempt test
  // already made learnConceptId genuinely Held/mastered, which would
  // (correctly, per §10.3) route back through the already-mastered branch
  // instead of exercising the abandonment-bias path this test targets.
  const abandonConceptId = learnEngine.addConcept({
    name: 'Half-Reactions', subject: 'Chemistry', topic: 'Electrochemistry', subtopic: 'Redox Reactions'
  });
  learnEngine.graph.getConcept(abandonConceptId).recordAttempt({
    conceptId: abandonConceptId, correct: false, responseTimeMs: 20000,
    timestamp: Date.now(), errorTag: ErrorTag.CONCEPTUAL_GAP, questionId: null
  });

  learnEngine.learn.fromBookmark({ conceptId: abandonConceptId }); // open 1
  learnEngine.learn.fromBookmark({ conceptId: abandonConceptId }); // abandons #1 -> count 1
  learnEngine.learn.fromBookmark({ conceptId: abandonConceptId }); // abandons #2 -> count 2
  const lesson3 = learnEngine.learn.fromBookmark({ conceptId: abandonConceptId }); // abandons #3 -> count 3

  assert(lesson3.compressionReasons.includes('repeated_abandonment'), 'Two or more abandonments should bias toward the compressed flow');
  learnEngine.learn.completeLesson({ conceptId: abandonConceptId }); // clean up
});

test('Learn: already-mastered concept gets a lightweight lesson, not a full remediation', () => {
  const heldConceptId = learnEngine.addConcept({
    name: 'Mole Concept', subject: 'Chemistry', topic: 'Stoichiometry', subtopic: 'Mole Calculations'
  });
  const heldConcept = learnEngine.graph.getConcept(heldConceptId);
  heldConcept.retentionState = RetentionState.HELD;
  heldConcept.confidenceScore = 0.9;

  const lesson = learnEngine.learn.fromInsights({ conceptId: heldConceptId });
  assert(lesson.alreadyMastered, 'A confidently Held concept should not get a full remediation lesson');
  assertEqual(lesson.steps.coreConcept, null, 'Already-mastered lesson skips Core Concept entirely');
});

test('Learn: a concept with no linked questions is marked sparse, not padded', () => {
  const sparseConceptId = learnEngine.addConcept({
    name: 'Untagged Concept', subject: 'Chemistry', topic: 'New Topic', subtopic: 'Nothing Authored Yet'
  });
  const lesson = learnEngine.learn.fromWeakTopicRecommendation({ conceptId: sparseConceptId });
  assert(lesson.contentSparse, 'A concept with zero linked live questions should be marked sparse');
  assertEqual(lesson.steps.simpleBreakdown.sparse, true, 'Simple breakdown should honestly report sparse content');
});

test('Learn Home surfaces a genuinely Forming concept as a recommended repair candidate', () => {
  const formingId = learnEngine.addConcept({
    name: 'Formal Charge', subject: 'Chemistry', topic: 'Electrochemistry', subtopic: 'Redox Reactions'
  });
  const formingConcept = learnEngine.graph.getConcept(formingId);
  formingConcept.recordAttempt({ conceptId: formingId, correct: false, responseTimeMs: 20000, timestamp: Date.now(), errorTag: ErrorTag.CONCEPTUAL_GAP, questionId: null });

  const home = learnEngine.learn.getLearnHome();
  assert(home.recommendedConcepts.some(c => c.id === formingId), 'A Forming concept should surface as a recommended concept in Learn Home');
  assert(!home.coldStart, 'Learn Home should not report cold-start once real attempt history exists');
});

test('Learn Module state round-trips through toJSON/fromJSON', () => {
  const snapshot = learnEngine.learn.toJSON();
  const restored = LearnModule.fromJSON(learnEngine, snapshot);
  assertEqual(restored.completedLessons.length, learnEngine.learn.completedLessons.length, 'Restored module should carry completed lesson history');
  assertEqual(restored.activeLessons.size, learnEngine.learn.activeLessons.size, 'Restored module should carry active lesson state');
});

// ═══════════════════════════════════════════════════════════════
// MISCONCEPTION WIRING TESTS
// ExplanationEngine/LearnModule previously diagnosed misconceptions via
// MisconceptionLibrary.diagnose(), which reads distractorMappings — a
// side-table only ever populated by mapDistractor(), which nothing in
// production calls. Real content authors misconceptionId directly on a
// question's own distractors (Question §2.4); these tests exercise that
// path with no mapDistractor() call anywhere in sight, matching the real
// shape of live seeded content.
// ═══════════════════════════════════════════════════════════════

test("MisconceptionLibrary: ExplanationEngine diagnoses straight from the question's own distractor data (no mapDistractor() call)", () => {
  const q = new Question({
    id: 'mc_wire_1',
    subject: 'Biology', topic: 'Cell Biology', subtopic: 'Organelles',
    stem: 'Which organelle is the site of aerobic respiration?',
    options: [
      { label: 'A', text: 'Mitochondrion', isCorrect: true },
      { label: 'B', text: 'Nucleus', isCorrect: false }
    ],
    correctOption: 'A',
    explanation: 'The mitochondrion is the site of aerobic respiration.',
    distractors: [
      { option: 'B', misconceptionId: 'confused_similar_concepts', explanation: 'The nucleus stores genetic material; it does not generate ATP.' }
    ],
    lifecycleState: 'live'
  });

  const explanation = learnEngine.explanations.generate({
    question: q,
    attempt: { correct: false, selectedOption: 'B', errorTag: ErrorTag.CONCEPTUAL_GAP },
    concept: null,
    macroState: 'building'
  });
  const distractorPart = explanation.parts.find(p => p.type === 'distractor_breakdown');
  const bOption = distractorPart.content.find(d => d.label === 'B');
  assert(bOption.misconception, 'A question with a real misconceptionId on its distractor should produce a non-null misconception diagnosis without mapDistractor() ever being called');
  assertEqual(bOption.misconception.id, 'confused_similar_concepts', 'The diagnosed misconception should match the id authored on the question itself');
});

// ═══════════════════════════════════════════════════════════════
// EXPLANATION ENGINE — exam tip / memory anchor coverage
// _generateExamTip() only ever indexed tips by calculationLoad, whose
// lookup table was missing a 'light' key and never consulted readingLoad
// at all — despite carrying a 'high' tip clearly written for it. Checked
// directly against production: calculationLoad='light' (36 real
// questions) and readingLoad='high' (5 real questions) both silently got
// no exam tip. _generateMemoryAnchor()'s old 5-entry hardcoded map also
// matched zero of the 201 real seeded concepts, so every question fell
// through to generic filler text presented as a "memory anchor."
// ═══════════════════════════════════════════════════════════════

test('ExplanationEngine: calculationLoad="light" gets a real exam tip, not silently omitted', () => {
  const q = new Question({
    id: 'tip_light_1', subject: 'Physics', topic: 'Motion', subtopic: 'Speed',
    calculationLoad: 'light', cognitiveLevel: 'application', readingLoad: 'low',
    stem: 'A car travels 60 km in 2 hours. What is its average speed?',
    options: [{ label: 'A', text: '30 km/h', isCorrect: true }, { label: 'B', text: '120 km/h', isCorrect: false }],
    correctOption: 'A', explanation: 'Speed = distance / time = 60 / 2 = 30 km/h.',
    lifecycleState: 'live'
  });
  const explanation = learnEngine.explanations.generate({ question: q, attempt: { correct: true }, concept: null, macroState: 'building' });
  const examTipPart = explanation.parts.find(p => p.type === 'exam_tip');
  assert(examTipPart, 'calculationLoad="light" should still produce an exam tip part');
  assert(typeof examTipPart.content === 'string' && examTipPart.content.length > 0, 'The exam tip content should be a real, non-empty string');
});

test('ExplanationEngine: readingLoad="high" surfaces the stem-reading tip, even over a calculation-heavy question', () => {
  const q = new Question({
    id: 'tip_reading_1', subject: 'Use of English', topic: 'Comprehension & Summary', subtopic: 'Passage',
    calculationLoad: 'heavy', cognitiveLevel: 'analysis', readingLoad: 'high',
    stem: 'Read the long passage below and answer the question that follows...',
    options: [{ label: 'A', text: 'Option A', isCorrect: true }, { label: 'B', text: 'Option B', isCorrect: false }],
    correctOption: 'A', explanation: 'The passage states this directly in paragraph two.',
    lifecycleState: 'live'
  });
  const explanation = learnEngine.explanations.generate({ question: q, attempt: { correct: true }, concept: null, macroState: 'building' });
  const examTipPart = explanation.parts.find(p => p.type === 'exam_tip');
  assert(examTipPart, 'readingLoad="high" should produce an exam tip part');
  assert(examTipPart.content.includes('Read the stem twice'), 'A reading-heavy question should get the stem-reading tip, not the calculation tip');
});

test('ExplanationEngine: memory_anchor is omitted (not filler text) when no genuine anchor exists for the concept', () => {
  const q = new Question({
    id: 'anchor_none_1', subject: 'Chemistry', topic: 'Organic Chemistry', subtopic: 'Alkanes',
    stem: 'What is the general formula for an alkane?',
    options: [{ label: 'A', text: 'CnH2n+2', isCorrect: true }, { label: 'B', text: 'CnH2n', isCorrect: false }],
    correctOption: 'A', explanation: 'Alkanes are saturated hydrocarbons with formula CnH2n+2.',
    lifecycleState: 'live'
  });
  const explanation = learnEngine.explanations.generate({ question: q, attempt: { correct: true }, concept: null, macroState: 'building' });
  const memoryAnchorPart = explanation.parts.find(p => p.type === 'memory_anchor');
  assert(!memoryAnchorPart, 'No memory_anchor part should be present when nothing genuine exists for this concept');
});

test('ExplanationEngine: distractor_breakdown ("why other options are wrong") is included on a CORRECT attempt too, not just incorrect ones', () => {
  const q = new Question({
    id: 'distractor_on_correct_1', subject: 'Chemistry', topic: 'Organic Chemistry', subtopic: 'Alkanes',
    stem: 'What is the general formula for an alkane?',
    options: [
      { label: 'A', text: 'CnH2n+2', isCorrect: true },
      { label: 'B', text: 'CnH2n', isCorrect: false },
      { label: 'C', text: 'CnH2n-2', isCorrect: false },
    ],
    correctOption: 'A', explanation: 'Alkanes are saturated hydrocarbons with formula CnH2n+2.',
    lifecycleState: 'live'
  });
  const correctExplanation = learnEngine.explanations.generate({ question: q, attempt: { correct: true }, concept: null, macroState: 'building' });
  const breakdownOnCorrect = correctExplanation.parts.find(p => p.type === 'distractor_breakdown');
  assert(breakdownOnCorrect, 'distractor_breakdown should be present even when the attempt was correct');
  assertEqual(breakdownOnCorrect.content.length, 2, 'Should include both wrong options');

  const incorrectExplanation = learnEngine.explanations.generate({ question: q, attempt: { correct: false }, concept: null, macroState: 'building' });
  const breakdownOnIncorrect = incorrectExplanation.parts.find(p => p.type === 'distractor_breakdown');
  assert(breakdownOnIncorrect, 'distractor_breakdown should still be present on an incorrect attempt');
});

test("Learn: commonMisconceptions come from the question's own distractor data, not the legacy mapDistractor() table", () => {
  const freshConceptId = learnEngine.addConcept({ name: 'Osmosis', subject: 'Biology', topic: 'Cell Biology', subtopic: 'Transport' });
  const freshQuestion = new Question({
    id: 'mc_wire_2',
    subject: 'Biology', topic: 'Cell Biology', subtopic: 'Transport',
    conceptsTested: [{ conceptId: freshConceptId, weight: 'primary' }],
    stem: 'Water moves from a region of...',
    options: [
      { label: 'A', text: 'Low solute concentration to high solute concentration', isCorrect: true },
      { label: 'B', text: 'High solute concentration to low solute concentration', isCorrect: false }
    ],
    correctOption: 'A',
    explanation: 'Osmosis moves water toward the higher solute concentration.',
    distractors: [
      { option: 'B', misconceptionId: 'overgeneralized_rule', explanation: 'This reverses the direction of osmotic flow.' }
    ],
    lifecycleState: 'live'
  });
  learnEngine.questionGraph.addQuestion(freshQuestion);

  const lesson = learnEngine.learn.fromIncorrectAnswer({
    questionId: 'mc_wire_2', conceptId: freshConceptId, selectedOption: 'B', errorTag: ErrorTag.CONCEPTUAL_GAP
  });
  assert(lesson.steps.commonMisconceptions.length > 0, "Common misconceptions should be populated from the question's own distractor data");
  assert(lesson.steps.commonMisconceptions[0].ownMistake === true, "Student's own mistake should still be named first");
  assertEqual(lesson.steps.commonMisconceptions[0].id, 'overgeneralized_rule', 'Should resolve the exact misconceptionId authored on the question, without mapDistractor() ever being called for it');
});

// ═══════════════════════════════════════════════════════════════
// ADAPTIVE DIFFICULTY / FATIGUE PULLBACK WIRING TESTS
// RecommendationEngine's fatigue interrupt only ever set
// profile._tempSoftening, a flag nothing read. AdaptiveDifficulty checks
// its own separate this.sessionSoftening, only ever set by its own
// softenSession(), which nothing called — so a 'difficulty_pullback'
// decision had zero effect on the difficulty of the next question served.
// ═══════════════════════════════════════════════════════════════

await test('AdaptiveDifficulty: a difficulty_pullback decision actually softens future difficulty selection, not just an unread profile flag', async () => {
  const engine = new KairoEngine({
    studentId: 'diff1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry']
  });
  await engine.init();
  const conceptId = engine.addConcept({ name: 'Fatigue Concept', subject: 'Chemistry', topic: 'Reaction Rates' });
  const concept = engine.graph.getConcept(conceptId);
  concept.confidenceScore = 1; // push the Held tier toward the top of its band so a pullback is visible

  engine.startSession({ mode: 'standard', plan: [] });
  assertEqual(engine.difficulty.sessionSoftening, false, 'A fresh session should not start already softened');

  concept.retentionState = 'held';
  const tierBefore = engine.difficulty.selectDifficulty(concept, engine.profile.macroState);

  // Three careless slips in a row: fast-but-not-instant wrong answers on a
  // concept classify() sees as Held/Reinforced (ratio 6000/20000 = 0.3,
  // satisfying isStrongHistory && ratio < 0.6 && responseTimeMs > 3000).
  // A wrong answer flips Held -> Fading (ConceptNode._updateState), which
  // would break isStrongHistory on the next loop iteration, so it's reset
  // between submissions — this test is isolating the fatigue/difficulty
  // wiring, not exercising retention-state transition rules.
  let lastDecision = null;
  for (let i = 0; i < 3; i++) {
    concept.retentionState = 'held';
    const result = engine.submitAnswer({
      conceptId, correct: false, responseTimeMs: 6000,
      selectedOption: 'B', correctOption: 'A', questionId: `dq${i}`, questionDifficulty: 3
    });
    lastDecision = result.decision;
  }

  assertEqual(lastDecision.action, 'difficulty_pullback', 'Three careless slips in a row should trigger the fatigue interrupt');
  assertEqual(engine.difficulty.sessionSoftening, true, "AdaptiveDifficulty's own sessionSoftening flag should now be set by the fatigue interrupt");
  const tierAfter = engine.difficulty.selectDifficulty(concept, engine.profile.macroState);
  assert(tierAfter < tierBefore, `Difficulty tier should genuinely drop after a pullback (was ${tierBefore}, now ${tierAfter})`);

  // A new session should not inherit softening from a previous one — it's
  // meant to be temporary and session-scoped, not sticky forever.
  engine.startSession({ mode: 'standard', plan: [] });
  assertEqual(engine.difficulty.sessionSoftening, false, 'Starting a new session should reset temporary softening from a previous one');
});

test('getQuestionForConcept: maxDifficulty narrows the pool but never returns nothing when real questions exist above it', () => {
  const engine = new KairoEngine({
    studentId: 'diff2', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Physics']
  });
  const conceptId = engine.addConcept({ name: 'Difficulty Pool Concept', subject: 'Physics', topic: 'Mechanics' });
  for (const [id, difficultyRating] of [['dp_easy', 1], ['dp_hard1', 4], ['dp_hard2', 5]]) {
    engine.questionGraph.addQuestion(new Question({
      id, subject: 'Physics', topic: 'Mechanics',
      conceptsTested: [{ conceptId, weight: 'primary' }],
      difficultyRating, stem: `Q ${id}`,
      options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
      correctOption: 'A', lifecycleState: 'live'
    }));
  }

  const capped = engine.getQuestionForConcept(conceptId, { maxDifficulty: 2 });
  assertEqual(capped.id, 'dp_easy', 'With a ceiling of 2, only the difficulty-1 question qualifies');

  const noneQualify = engine.getQuestionForConcept(conceptId, { excludeIds: ['dp_hard1', 'dp_hard2'], maxDifficulty: 2 });
  assertEqual(noneQualify.id, 'dp_easy', 'Still returns the one real question left, even excluding the harder ones');

  const tooStrict = engine.getQuestionForConcept(conceptId, { excludeIds: ['dp_easy'], maxDifficulty: 2 });
  assert(['dp_hard1', 'dp_hard2'].includes(tooStrict.id), 'When nothing meets the ceiling, falls back to the full remaining pool rather than returning null');
});

// ═══════════════════════════════════════════════════════════════
// PRACTICE DIFFICULTY PICKER WIRING TESTS (P0-5)
// PracticeHub's Easy/Medium/Hard/Adaptive picker was selected in the UI
// and never sent to the engine — every session ran at whatever the
// adaptive engine picked regardless of the student's choice. These prove
// getQuestionForConcept()'s minDifficulty/maxDifficulty window (the
// mechanism kairo-app now threads the picker through) actually shifts
// which questions get served.
// ═══════════════════════════════════════════════════════════════

test("getQuestionForConcept: minDifficulty + maxDifficulty together select a real difficulty window, and 'Easy' vs 'Hard' genuinely differ", () => {
  const engine = new KairoEngine({
    studentId: 'diff3', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry']
  });
  const conceptId = engine.addConcept({ name: 'Difficulty Window Concept', subject: 'Chemistry', topic: 'Acids' });
  for (const [id, difficultyRating] of [['dw1', 1], ['dw2', 2], ['dw3', 4], ['dw4', 5]]) {
    engine.questionGraph.addQuestion(new Question({
      id, subject: 'Chemistry', topic: 'Acids',
      conceptsTested: [{ conceptId, weight: 'primary' }],
      difficultyRating, stem: `Q ${id}`,
      options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
      correctOption: 'A', lifecycleState: 'live'
    }));
  }

  // "Hard" (min 4, max 5) should only ever serve the two hardest questions.
  for (let i = 0; i < 10; i++) {
    const q = engine.getQuestionForConcept(conceptId, { minDifficulty: 4, maxDifficulty: 5 });
    assert(['dw3', 'dw4'].includes(q.id), `Hard window should only serve difficulty 4-5 questions, got ${q.id}`);
  }

  // "Easy" (min 1, max 2) should only ever serve the two easiest questions
  // — genuinely disjoint from Hard's pool above, not overlapping.
  for (let i = 0; i < 10; i++) {
    const q = engine.getQuestionForConcept(conceptId, { minDifficulty: 1, maxDifficulty: 2 });
    assert(['dw1', 'dw2'].includes(q.id), `Easy window should only serve difficulty 1-2 questions, got ${q.id}`);
  }

  // A window matching nothing real falls back to the full pool rather than null.
  const impossible = engine.getQuestionForConcept(conceptId, { minDifficulty: 3, maxDifficulty: 3 });
  assert(impossible !== null, 'A window matching no real question should fall back to the full pool, not return null');
});

// ═══════════════════════════════════════════════════════════════
// ERROR TAXONOMY WIRING TESTS (P0-7)
// misread_question/misapplied_rule/partial_understanding were permanently
// unreachable for two independent reasons: nothing ever populated
// distractorTags, and the branches themselves were broken regardless —
// misread_question's condition (`selectedOption === correctOption +
// '_trap'`) could never match any real option label, and misapplied_rule/
// final_step read a whole-question distractorTags array instead of the
// tags on the option the student actually picked. Both fixed; these tests
// use synthetic Question fixtures (not real production content — see
// P0-7's completion note on why real content wasn't hand-tagged here).
// ═══════════════════════════════════════════════════════════════

test('Question.getDistractorTags() reads per-option tags, empty for an untagged or unknown option', () => {
  const q = new Question({
    id: 'tag_q1', subject: 'Biology', topic: 'T', stem: 'S',
    options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
    correctOption: 'A',
    distractors: [{ option: 'B', misconceptionId: 'confused_similar_concepts', explanation: 'x', tags: ['misread_trap'] }],
    lifecycleState: 'live'
  });
  assertEqual(JSON.stringify(q.getDistractorTags('B')), JSON.stringify(['misread_trap']), "Should return the tags authored on option B's distractor");
  assertEqual(JSON.stringify(q.getDistractorTags('A')), '[]', 'The correct option has no distractor entry, so no tags');
  assertEqual(JSON.stringify(q.getDistractorTags('C')), '[]', 'An option with no distractor entry at all should return [], not throw');
});

test('ErrorPatternClassifier: misread_question fires for a tagged misread-trap option, not the previous always-false condition', () => {
  const engine = new KairoEngine({ studentId: 'tax1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  const conceptId = engine.addConcept({ name: 'Osmosis Direction', subject: 'Biology', topic: 'Transport' });
  engine.graph.getConcept(conceptId).retentionState = 'forming';
  const q = new Question({
    id: 'tag_q2', subject: 'Biology', topic: 'Transport', stem: 'Water moves from...',
    options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
    correctOption: 'A',
    distractors: [{ option: 'B', misconceptionId: null, explanation: 'Answers the reversed question.', tags: ['misread_trap'] }],
    lifecycleState: 'live'
  });
  const tag = engine.classifier.classify({
    concept: engine.graph.getConcept(conceptId),
    selectedOption: 'B', correctOption: 'A', responseTimeMs: 15000,
    question: q
  });
  assertEqual(tag, ErrorTag.MISREAD_QUESTION, 'A tagged misread-trap option should classify as misread_question, not conceptual_gap');
});

test('ErrorPatternClassifier: misapplied_rule fires for the actually-selected adjacent-rule option, not any tagged option on the question', () => {
  const engine = new KairoEngine({ studentId: 'tax2', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry'] });
  const conceptId = engine.addConcept({ name: 'Ionic vs Covalent', subject: 'Chemistry', topic: 'Bonding' });
  engine.graph.getConcept(conceptId).retentionState = 'forming';
  const q = new Question({
    id: 'tag_q3', subject: 'Chemistry', topic: 'Bonding', stem: 'S',
    options: [
      { label: 'A', text: 'A', isCorrect: true },
      { label: 'B', text: 'B', isCorrect: false },
      { label: 'C', text: 'C', isCorrect: false }
    ],
    correctOption: 'A',
    distractors: [
      { option: 'B', misconceptionId: null, explanation: 'Correct for covalent bonding, not ionic.', tags: ['adjacent_rule'] },
      { option: 'C', misconceptionId: null, explanation: 'Unrelated slip.', tags: [] }
    ],
    lifecycleState: 'live'
  });
  const pickedTagged = engine.classifier.classify({
    concept: engine.graph.getConcept(conceptId),
    selectedOption: 'B', correctOption: 'A', responseTimeMs: 15000, question: q
  });
  assertEqual(pickedTagged, ErrorTag.MISAPPLIED_RULE, 'Picking the tagged adjacent-rule option should classify as misapplied_rule');

  const pickedUntagged = engine.classifier.classify({
    concept: engine.graph.getConcept(conceptId),
    selectedOption: 'C', correctOption: 'A', responseTimeMs: 15000, question: q
  });
  assert(pickedUntagged !== ErrorTag.MISAPPLIED_RULE, "Picking a different, untagged option shouldn't inherit another option's adjacent_rule tag");
});

test('ErrorPatternClassifier: partial_understanding fires for a tagged final-step slip on a calculation-heavy question', () => {
  const engine = new KairoEngine({ studentId: 'tax3', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry'] });
  const conceptId = engine.addConcept({ name: 'Mole Ratio Calculations', subject: 'Chemistry', topic: 'Stoichiometry' });
  engine.graph.getConcept(conceptId).retentionState = 'forming';
  const q = new Question({
    id: 'tag_q4', subject: 'Chemistry', topic: 'Stoichiometry', stem: 'S',
    calculationLoad: 'heavy',
    options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
    correctOption: 'A',
    distractors: [{ option: 'B', misconceptionId: 'arithmetic_slip', explanation: 'Right setup, wrong final division.', tags: ['final_step'] }],
    lifecycleState: 'live'
  });
  const tag = engine.classifier.classify({
    concept: engine.graph.getConcept(conceptId),
    selectedOption: 'B', correctOption: 'A', responseTimeMs: 15000, question: q
  });
  assertEqual(tag, ErrorTag.PARTIAL_UNDERSTANDING, 'A calculation-heavy question with a tagged final-step slip should classify as partial_understanding');
});

await test('KairoEngine.submitAnswer(): resolves the real Question from questionGraph for classification, not an always-empty caller-supplied distractorTags param', async () => {
  const engine = new KairoEngine({ studentId: 'tax4', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const conceptId = engine.addConcept({ name: 'Enzyme Specificity', subject: 'Biology', topic: 'Enzymes' });
  engine.graph.getConcept(conceptId).retentionState = 'forming';
  const q = new Question({
    id: 'tag_q5', subject: 'Biology', topic: 'Enzymes', stem: 'S',
    conceptsTested: [{ conceptId, weight: 'primary' }],
    options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
    correctOption: 'A',
    distractors: [{ option: 'B', misconceptionId: null, explanation: 'Answers the reversed question.', tags: ['misread_trap'] }],
    lifecycleState: 'live'
  });
  engine.questionGraph.addQuestion(q);

  // Deliberately not passing questionDistractorTags — proving the real
  // fix is questionGraph resolution, not the caller having to supply it.
  const result = engine.submitAnswer({
    conceptId, correct: false, responseTimeMs: 15000,
    selectedOption: 'B', correctOption: 'A', questionId: 'tag_q5', questionDifficulty: 2
  });
  assertEqual(result.attempt.errorTag, ErrorTag.MISREAD_QUESTION, "submitAnswer() should classify via the real Question's own tagged distractor data");
});

// ═══════════════════════════════════════════════════════════════
// PRIMARY CONCEPT LINK WIRING TESTS (P1)
// Question.conceptsTested[i].weight === 'primary' was the original design,
// but every real seeded question uses a numeric weight instead (1.0,
// always — confirmed directly against all 800 concept links in
// production). Code that only checked the string silently treated every
// real concept link as non-primary in QuestionRelationshipGraph.
// findPrerequisiteCheck(), Question.getPrimaryConcept(), and
// LearnModule._representativeQuestion().
// ═══════════════════════════════════════════════════════════════

test('isPrimaryConceptLink(): accepts both the original string convention and the numeric one every real question actually uses', () => {
  assert(isPrimaryConceptLink({ weight: 'primary' }), "The originally-documented string convention should still count");
  assert(isPrimaryConceptLink({ weight: 1 }), 'weight: 1 (every real seeded question) should count as primary');
  assert(isPrimaryConceptLink({ weight: 1.0 }), 'weight: 1.0 (the exact value production data uses) should count as primary');
  assert(isPrimaryConceptLink({ weight: 2 }), 'A weight above 1 should still read as primary, not just exactly 1');
  assert(!isPrimaryConceptLink({ weight: 0.5 }), 'A fractional weight should read as partial/secondary, not primary');
  assert(!isPrimaryConceptLink({ weight: 'secondary' }), "The string 'secondary' should not count as primary");
  assert(!isPrimaryConceptLink({}), 'No weight at all should not count as primary');
});

test('Question.getPrimaryConcept() finds a numeric-weight link — the shape every real seeded question actually has', () => {
  const q = new Question({
    id: 'primary_q1', subject: 'Biology', topic: 'T', stem: 'S',
    conceptsTested: [{ conceptId: 'c1', weight: 1 }, { conceptId: 'c2', weight: 0.5 }],
    options: [{ label: 'A', text: 'A', isCorrect: true }],
    correctOption: 'A', lifecycleState: 'live'
  });
  const primary = q.getPrimaryConcept();
  assert(primary, 'getPrimaryConcept() should find the numeric-weight link — it returned nothing before this fix');
  assertEqual(primary.conceptId, 'c1', 'Should find the weight: 1 link, not the weight: 0.5 secondary one');
});

await test('QuestionRelationshipGraph.findPrerequisiteCheck() finds a prerequisite question tagged with a real, numeric-weight concept link', async () => {
  const engine = new KairoEngine({ studentId: 'prereq1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry'] });
  await engine.init();
  const prereqConceptId = engine.addConcept({ name: 'Mole Concept', subject: 'Chemistry', topic: 'Stoichiometry' });

  const mainQuestion = new Question({
    id: 'main_q1', subject: 'Chemistry', topic: 'Stoichiometry', stem: 'S',
    prerequisiteConcepts: [prereqConceptId],
    options: [{ label: 'A', text: 'A', isCorrect: true }],
    correctOption: 'A', lifecycleState: 'live'
  });
  const prereqQuestion = new Question({
    id: 'prereq_q1', subject: 'Chemistry', topic: 'Stoichiometry', stem: 'What is a mole?',
    conceptsTested: [{ conceptId: prereqConceptId, weight: 1 }], // real seeded shape — numeric, not the string 'primary'
    options: [{ label: 'A', text: 'A', isCorrect: true }],
    correctOption: 'A', lifecycleState: 'live'
  });
  engine.questionGraph.addQuestion(mainQuestion);
  engine.questionGraph.addQuestion(prereqQuestion);

  const found = engine.questionGraph.findPrerequisiteCheck('main_q1');
  assert(found.some(q => q.id === 'prereq_q1'), "findPrerequisiteCheck() should find the prerequisite question even though its concept link uses a numeric weight, not the string 'primary'");
});

// ═══════════════════════════════════════════════════════════════
// TODAY'S FOCUS / RECOMMENDATION REASONING TESTS
// Home's "why this session" sentence was static, client-authored copy,
// identical regardless of student state, even though the engine already
// computes macroState/decay/exam-proximity every session. getTodayFocus()
// surfaces the engine's own real reasoning instead.
// ═══════════════════════════════════════════════════════════════

test("KairoEngine.getTodayFocus(): picks the Fading concept and explains why in concept-specific, non-generic language", () => {
  const engine = new KairoEngine({ studentId: 'focus1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  const fadingId = engine.addConcept({ name: 'Enzyme Action', subject: 'Biology', topic: 'Metabolism' });
  engine.graph.getConcept(fadingId).retentionState = 'fading';
  engine.graph.getConcept(fadingId).decayEstimate = 0.9;

  const focus = engine.getTodayFocus();
  assertEqual(focus.conceptId, fadingId, 'The Fading concept should be picked as the highest-priority concept');
  assert(focus.reason.includes('Enzyme Action'), 'Reason should name the actual concept, not a placeholder');
  assert(focus.reason.toLowerCase().includes('forget'), 'A Fading concept should be explained in terms of forgetting, not a generic sentence');
});

test("KairoEngine.getTodayFocus(): two students in genuinely different states get different reasoning, not the same static sentence", () => {
  const soonExam = Date.now() + 20 * 24 * 60 * 60 * 1000; // inside the 6-week exam-proximity window
  const engineA = new KairoEngine({ studentId: 'focusA', name: 'A', examDate: soonExam, targetSubjects: ['Physics'] });
  const heldId = engineA.addConcept({ name: 'Projectile Motion', subject: 'Physics', topic: 'Mechanics' });
  engineA.graph.getConcept(heldId).retentionState = 'held';
  engineA.graph.getConcept(heldId).confidenceScore = 0.9;
  engineA.graph.getConcept(heldId).decayEstimate = 0.5;
  const focusA = engineA.getTodayFocus();

  const engineB = new KairoEngine({ studentId: 'focusB', name: 'B', examDate: Date.now() + 300 * 24 * 60 * 60 * 1000, targetSubjects: ['Physics'] });
  engineB.addConcept({ name: 'Simple Harmonic Motion', subject: 'Physics', topic: 'Mechanics' });
  const focusB = engineB.getTodayFocus();

  assert(focusA.reason !== focusB.reason, 'Two students with genuinely different concept states should not see identical recommendation reasoning');
  assert(focusA.reason.includes('exam approaching'), 'A Held concept close to exam should mention exam proximity');
  assert(focusB.reason.includes("hasn't come up yet"), 'An Unseen concept should be explained as a fresh starting point, not a review');
});

// ═══════════════════════════════════════════════════════════════
// SUPABASE SYNC TESTS
// No live network calls — SupabaseSyncAdapter's row-mapping and
// SyncManager's merge logic are pure functions over plain objects, so
// they're verified directly / against a minimal mocked PostgREST client.
// ═══════════════════════════════════════════════════════════════

test('Supabase adapter: every StudentProfile.toJSON() field survives the kairo.students row round-trip', () => {
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);

  const p = new StudentProfile({
    studentId: 'sp1', name: 'Ada', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery', targetUniversity: 'UNILAG',
    authUserId: 'auth-uuid-1', dateOfBirth: Date.now() - 17 * 365 * 24 * 60 * 60 * 1000,
    examType: 'UTME', examYear: 2027, targetUTMEScore: 300,
    preferredStudyDurationMin: 30, preferredStudyPeriod: 'evening',
    device: { os: 'android' }, referralSource: 'whatsapp',
    parentGuardianContact: { phone: '0800' }, languageRegion: 'yoruba'
  });
  p.macroState = 'compounding';
  p.macroStateHistory = [{ from: 'building', to: 'compounding', at: Date.now() }];
  p.learningState = 'reinforcing';
  p.learningStateHistory = [{ from: 'practising', to: 'reinforcing', at: Date.now() }];
  p.journeyStage = 'establishment';
  p.journeyStageHistory = [{ from: 'activation', to: 'establishment', at: Date.now() }];
  p.reEngagement = { some: 'state' };
  p.crossModuleMilestones = { some: 'state' };
  p.continuation = { some: 'state' };
  p.comms = { some: 'state' };
  p.learn = { some: 'state' };
  p.notificationHistory = [{ id: 'n1', readAt: Date.now() }];
  p.lastSessionAt = Date.now();
  p.totalQuestionsAnswered = 42;
  p.totalCorrect = 30;
  p.streakData = { currentMomentum: 5, protectedGapsUsed: 1, lastSessionDate: '2026-08-01', windowSessions: [1, 2] };
  p.atRiskTriggeredAt = Date.now() - 1000;
  p.recoverySessionCount = 2;
  p.eliteScoreHistory = [{ total: 70 }];
  p.responseTimeBaselines = { 'Chemistry:Stoichiometry': 15000 };
  p.email = 'ada@example.com';
  p.avatar = 'avatar_3.png';
  p.completedChallenges = ['daily_5_reinforced'];
  p.kairoPoints = 420;
  p.kairoPointsProgress = { reinforcedConceptIds: ['c1'], heldConceptIds: ['c1', 'c2'], consistencyDays: ['2026-8-1'], masteredTopics: ['Chemistry:Stoichiometry'] };
  p.badges = ['first_reinforced', 'three_day_streak'];
  p.preferences = { notifications: { dailyRecap: false } };

  const original = p.toJSON();
  const row = adapter._profileToRow(original, original.authUserId);
  row.id = 'row-id-1';                    // owned by the DB (primary key), not part of the push payload
  row.created_at = new Date().toISOString(); // DB-generated default
  const restored = adapter._rowToProfile(row);

  // Fields intentionally NOT covered by the students-row round-trip:
  // studentId (-> row id, a separate concern from the payload), sessions
  // (its own kairo.sessions table), createdAt (DB-generated, never pushed).
  const excluded = new Set(['studentId', 'sessions', 'createdAt']);

  for (const key of Object.keys(original)) {
    if (excluded.has(key)) continue;
    assert(key in restored, `Field "${key}" from StudentProfile.toJSON() has no matching entry in _rowToProfile()'s output — it would silently stop reaching Supabase.`);
  }

  // Spot-check value fidelity for the fields this fix specifically closed
  // (previously entirely absent from the mapping).
  assertEqual(restored.journeyStage, 'establishment', 'journeyStage should round-trip exactly');
  assertEqual(restored.learningState, 'reinforcing', 'learningState should round-trip exactly');
  assertEqual(restored.comms.some, 'state', 'comms JSONB blob should round-trip exactly');
  assertEqual(restored.learn.some, 'state', 'learn JSONB blob should round-trip exactly');
  assertEqual(restored.examYear, 2027, 'Identity field examYear should round-trip exactly');
  assertEqual(restored.notificationHistory.length, 1, 'notificationHistory should round-trip exactly');
  assertEqual(restored.email, 'ada@example.com', 'email should round-trip exactly');
  assertEqual(restored.avatar, 'avatar_3.png', 'avatar should round-trip exactly');
  assertEqual(restored.completedChallenges.length, 1, 'completedChallenges should round-trip exactly — ChallengesModule.checkAndAward() wrote directly onto the profile without this field ever being declared, so it was silently dropped on every save');
  assertEqual(restored.kairoPoints, 420, 'kairoPoints should round-trip exactly — without this a returning student\'s level would incorrectly reset to 1 on every fresh load until their next completed session recalculated it');
  assertEqual(restored.kairoPointsProgress.masteredTopics.length, 1, 'kairoPointsProgress should round-trip exactly — without this, already-credited milestones would be forgotten on reload and re-awarded, breaking the strictly-additive ledger guarantee');
  assertEqual(restored.badges.length, 2, 'badges should round-trip exactly — without this, every earned badge would be silently lost on reload and immediately re-awarded (and re-notified) the next time its condition was checked');
  assertEqual(restored.preferences.notifications.dailyRecap, false, 'preferences should round-trip exactly — without this, a student\'s notification/practice/accessibility/privacy/offline settings would silently reset to defaults on every fresh load');
});

test('streakData.lastSessionDate survives a kairo.students round-trip as a number, not a date-only string', () => {
  // Regression for a real production report: a streak that lit up right
  // after a session reset on the very next reload/sign-in — even for a
  // genuinely consecutive day. Root cause: streak_last_session_date is a
  // Postgres `date` column, so _rowToProfile() used to hand the raw
  // "YYYY-MM-DD" string straight back onto profile.streakData.lastSessionDate,
  // while MomentumStreak.recordSession() always sets it to an epoch-ms
  // number (Date.now()) locally. daysBetween()'s raw arithmetic
  // (`(a - b) / msPerDay`) subtracting a string from a number coerces to
  // NaN — not a parsed date — and NaN satisfies none of recordSession()'s
  // numeric branches, so every session after a round-trip fell straight
  // through to "genuine break," resetting momentum to 1 regardless of
  // whether the gap was real.
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);
  const realSessionTimestamp = new Date('2026-08-22T14:00:00').getTime(); // a real local epoch-ms value, exactly what MomentumStreak.recordSession() actually stores
  const row = adapter._profileToRow({ streakData: { lastSessionDate: realSessionTimestamp } }, 'auth1');
  assertEqual(row.streak_last_session_date, '2026-08-22', '_profileToRow() should store the local calendar date, not a UTC-shifted one');

  const restored = adapter._rowToProfile({ ...row, id: 'sp2' });
  assertEqual(typeof restored.streakData.lastSessionDate, 'number', '_rowToProfile() must hand back a number (matching MomentumStreak\'s own type), not the raw date-only string Postgres returns');

  // The real end-to-end check: a genuinely consecutive-day session against
  // a round-tripped lastSessionDate must increment, not reset.
  const streak = new MomentumStreak({ streakData: { currentMomentum: 5, protectedGapsUsed: 0, lastSessionDate: restored.streakData.lastSessionDate, windowSessions: [], freezesAvailable: 0, freezesUsed: 0 } });
  const nextDay = new Date('2026-08-23T09:00:00').getTime();
  const status = streak.recordSession(nextDay);
  assertEqual(status.momentum, 6, 'A real next-day session against a round-tripped lastSessionDate should extend the streak to 6, not silently reset it to 1');
});

test('SyncManager applies a genuinely newer remote concept state onto the live graph', () => {
  const syncEngine = new (engine.constructor)({
    studentId: 'sync_test_001', name: 'Sync Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const conceptId2 = syncEngine.addConcept({ name: 'Ionic Bonding', subject: 'Chemistry', topic: 'Bonding', subtopic: 'Ionic' });
  const localNode = syncEngine.graph.getConcept(conceptId2);
  localNode.retentionState = RetentionState.FORMING;
  localNode.lastSeenAt = Date.now() - 10000; // older than the remote row below
  syncEngine.sync.attachRemote(null, syncEngine); // real sync() only ever calls _applyRemote once an engine is attached

  syncEngine.sync._applyRemote({
    remoteProfile: null,
    remoteConceptStates: [{
      concept_id: conceptId2, retention_state: 'reinforced', confidence_score: 0.9,
      last_seen_at: new Date().toISOString(), decay_estimate: 0.95,
      next_review_estimate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      error_pattern_tags: {}, reinforced_cycles: 2, personal_decay_rate: 0.8
    }],
    remoteAttempts: [{
      concept_id: conceptId2, correct: true, response_time_ms: 8000,
      answered_at: new Date().toISOString(), error_tag: null,
      question_id: 'remote_q1', question_difficulty: 2
    }]
  });

  assertEqual(localNode.retentionState, RetentionState.REINFORCED, 'A genuinely newer remote state should overwrite local state');
  assert(localNode.attemptHistory.some(a => a.questionId === 'remote_q1'), 'Remote attempts should merge into local attempt history, not be discarded');
});

test('SyncManager never overwrites local concept state with a stale remote copy', () => {
  const syncEngine2 = new (engine.constructor)({
    studentId: 'sync_test_002', name: 'Sync Student 2',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const conceptId3 = syncEngine2.addConcept({ name: 'Covalent Bonding', subject: 'Chemistry', topic: 'Bonding', subtopic: 'Covalent' });
  const localNode2 = syncEngine2.graph.getConcept(conceptId3);
  localNode2.retentionState = RetentionState.HELD;
  localNode2.lastSeenAt = Date.now(); // newer than the stale remote row below
  syncEngine2.sync.attachRemote(null, syncEngine2);

  syncEngine2.sync._applyRemote({
    remoteProfile: null,
    remoteConceptStates: [{
      concept_id: conceptId3, retention_state: 'fading', confidence_score: 0.2,
      last_seen_at: new Date(Date.now() - 100000).toISOString(), decay_estimate: 0.3,
      next_review_estimate: null, error_pattern_tags: {}, reinforced_cycles: 0, personal_decay_rate: 1.2
    }],
    remoteAttempts: []
  });

  assertEqual(localNode2.retentionState, RetentionState.HELD, 'A stale remote copy should never overwrite a genuinely newer local state');
});

await test('fullSync pushes queued sessions through pushSession (kairo.sessions)', async () => {
  const calls = [];
  const mockClient = {
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; },
            gt() { return builder; }, is() { return builder; },
            maybeSingle() { return builder; }, single() { return builder; },
            insert(rows) { calls.push({ table, op: 'insert', rows }); return builder; },
            update(row) { calls.push({ table, op: 'update', row }); return builder; },
            upsert(rows) { calls.push({ table, op: 'upsert', rows }); return builder; },
            then(resolve) {
              if (table === 'students') return resolve({ data: { id: 'stu1', auth_user_id: 'auth1' }, error: null });
              return resolve({ data: [], error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  const adapter = new SupabaseSyncAdapter(mockClient, null);
  await adapter.fullSync({
    authUserId: 'auth1', studentId: 'stu1',
    profile: { name: 'Test' },
    conceptNodes: [],
    pendingAttempts: [],
    pendingSessions: [{ id: 'sess1', mode: 'standard', plan: [], questionsAnswered: 5, correctCount: 4, eliteScore: { total: 80 }, startedAt: Date.now(), completedAt: Date.now() }],
    since: null
  });

  const sessionPush = calls.find(c => c.table === 'sessions' && c.op === 'upsert');
  assert(sessionPush, 'fullSync should push queued sessions through pushSession (kairo.sessions upsert) — this was previously dead code, never invoked');
  assertEqual(sessionPush.rows.id, 'sess1', 'Pushed session row should carry the session id');
});

await test("fullSync: a rejected attempts batch (e.g. kairo.attempts' anti-cheat trigger) no longer takes an already-pushed session/cbt_result down with it", async () => {
  const calls = [];
  const mockClient = {
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; },
            gt() { return builder; }, is() { return builder; },
            maybeSingle() { return builder; }, single() { return builder; },
            insert(rows) {
              calls.push({ table, op: 'insert', rows });
              if (table === 'attempts') {
                // Simulates kairo.attempts' check_attempt_before_insert trigger
                // rejecting the whole batch — confirmed against real
                // production Postgres logs: "Invalid attempt:
                // response_time_ms implausibly low (0 ms)".
                return { then: (_resolve, reject) => reject(new Error('Invalid attempt: response_time_ms implausibly low (0 ms)')) };
              }
              return builder;
            },
            update(row) { calls.push({ table, op: 'update', row }); return builder; },
            upsert(rows) { calls.push({ table, op: 'upsert', rows }); return builder; },
            then(resolve) {
              if (table === 'students') return resolve({ data: { id: 'stu1', auth_user_id: 'auth1' }, error: null });
              return resolve({ data: [], error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  const adapter = new SupabaseSyncAdapter(mockClient, null);
  const result = await adapter.fullSync({
    authUserId: 'auth1', studentId: 'stu1',
    profile: { name: 'Test' },
    conceptNodes: [],
    pendingAttempts: [{ conceptId: 'c1', correct: false, responseTimeMs: 0, questionId: 'q1' }],
    pendingSessions: [{ id: 'sess1', mode: 'cbt_exam', plan: [], questionsAnswered: 1, correctCount: 1, startedAt: Date.now(), completedAt: Date.now() }],
    pendingCbtResults: [{ id: 'cbt1', subjects: ['Biology'], questionResults: [], bySubject: [], totalQuestions: 1, score: 1, maxScore: 1, percentage: 100, startedAt: Date.now(), completedAt: Date.now() }],
    since: null
  });

  const sessionPush = calls.find(c => c.table === 'sessions' && c.op === 'upsert');
  const cbtPush = calls.find(c => c.table === 'cbt_results' && c.op === 'insert');
  assert(sessionPush, 'The session should still push through even though the attempts batch failed — previously one failure aborted everything after it in the same try/catch');
  assert(cbtPush, 'The cbt_result should still push through for the same reason');
  assertEqual(result.failed.attempts.length, 1, 'The failed attempts batch should be reported back so the caller can retry just that, not silently dropped or conflated with a total sync failure');
  assertEqual(result.failed.sessions.length, 0, 'The session push succeeded, so it should not be reported as failed');
});

await test('Notifications: pull and mark-read only, matching the real RLS shape (no INSERT policy exists)', async () => {
  const calls2 = [];
  const mockClient2 = {
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; }, is() { return builder; },
            update(row) { calls2.push({ table, op: 'update', row }); return builder; },
            then(resolve) {
              return resolve({ data: table === 'notifications' ? [{ id: 'n1', read_at: null }] : null, error: null });
            }
          };
          return builder;
        }
      };
    }
  };
  const adapter2 = new SupabaseSyncAdapter(mockClient2, null);
  const unread = await adapter2.pullNotifications('stu1', { unreadOnly: true });
  assertEqual(unread.length, 1, 'pullNotifications should return the rows Supabase gives back');

  await adapter2.markNotificationRead('n1');
  const markCall = calls2.find(c => c.table === 'notifications' && c.op === 'update');
  assert(markCall && markCall.row.read_at, 'markNotificationRead should UPDATE read_at — the only write kairo.notifications RLS actually permits');
});

test('CBT: setup uses JAMB-accurate per-subject question counts (Use of English 60, others 40)', () => {
  // Was 'English' — CBTExamMode.JAMB_QUESTION_COUNT is keyed on 'Use of
  // English' (the real seeded subject name; JAMB itself calls the subject
  // "English", but Kairo's content doesn't), so this test was silently
  // exercising the default-40 fallback instead of the 60-question branch
  // it's actually meant to prove exists. Not a product bug — CBTExamMode.js
  // has its own comment explaining exactly this naming choice.
  const fakeEngine = { contentPacks: {}, submitAnswer: () => {} };
  const cbt = new CBTExamMode(fakeEngine);
  const result = cbt.setup({ subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'] });
  assertEqual(result.totalQuestions, 180, 'Use of English(60) + Mathematics(40) + Physics(40) + Chemistry(40) should total 180, the real JAMB question count — a uniform 40-per-subject default previously produced 160');
});

await test('CBT: submitAnswer withholds correctness feedback during a live attempt (CBT Exam Mode Spec §2.3/§5.2/§5.4)', async () => {
  const fakeQuestions = (subject, count) => Array.from({ length: count }, (_, i) => ({
    id: `${subject}_${i}`, questionId: `${subject}_${i}`, subject,
    text: `Q${i}`, options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'Because A.', conceptId: null
  }));
  const fakeEngine = {
    contentPacks: { getOfflineQuestions: async ({ subject, count }) => fakeQuestions(subject, count) },
    submitAnswer: () => {},
    sync: { queue: () => {} },
    // finish() calls this.engine.profile.recordSession(), this.engine.
    // eliteScore.calculate() (to update the real weighted Kairo Score for
    // a completed mock), and this.engine.levelSystem.update() (to award
    // Kairo Points) — every real KairoEngine has all three, so these were
    // missing only because this fake is deliberately minimal for testing
    // the mid-exam withholding behavior below, not because finish() is
    // broken (a real-engine test covers finish() itself further down this
    // file).
    profile: { recordSession: () => {}, sessions: [], streakData: {}, macroStateHistory: [] },
    graph: { nodes: new Map() },
    eliteScore: { history: [], calculate: () => ({ total: 0, accuracy: 0, retention: 0, consistency: 0, timestamp: Date.now() }) },
    levelSystem: { update: () => ({ pointsEarned: 0, totalPoints: 0, level: { level: 1 }, leveledUp: false, nextLevelPoints: 100 }) },
    badgeSystem: { checkAndAward: () => [] }
  };
  const cbt = new CBTExamMode(fakeEngine);
  cbt.setup({ subjects: ['Mathematics'] });
  await cbt.buildPaper();
  cbt.start();

  const result = cbt.submitAnswer(0, 'B', 5000);
  assert(!('isCorrect' in result), 'submitAnswer must not leak isCorrect during a live attempt — the spec calls withholding it "the single hardest constraint in the entire specification"');
  assert(!('correctOption' in result), 'submitAnswer must not leak the correct option during a live attempt');
  assert(!('explanation' in result), 'submitAnswer must not leak an explanation during a live attempt');

  const final = cbt.finish();
  assertEqual(final.correct, 0, 'The wrong answer is still scored correctly once the exam is actually submitted — withholding is temporal/procedural only, never informational (Spec §2.6)');
});

await test('RapidFire: submitAnswer no longer requires an active adaptive session, and finish() queues a kairo.sessions row', async () => {
  const engine = new KairoEngine({ studentId: 'sync1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const rfConceptId = engine.addConcept({ name: 'RF Concept', subject: 'Biology', topic: 'T' });
  engine.graph.getConcept(rfConceptId).retentionState = 'held';

  const queued = [];
  engine.sync.queue = (item) => queued.push(item);

  engine.startRapidFire({ questionCount: 1, subjects: ['Biology'] });
  const result = engine.submitRapidFireAnswer({ conceptId: rfConceptId, correct: true, responseTimeMs: 1000, selectedOption: 'A', correctOption: 'A', questionId: 'q1' });
  assert(!result.error, 'RapidFire submitAnswer must not require startSession() to have been called first — it previously threw "No active session" on every attempt');

  engine.finishRapidFire();
  const sessionPush = queued.find(q => q.type === 'session' && q.data.mode === 'rapid_fire');
  assert(sessionPush, 'RapidFire finish() should queue a kairo.sessions row tagged mode: rapid_fire — previously nothing did, so RapidFire sessions never reached Supabase');
});

await test('CBT: finish() no longer throws on a conceptId-bearing question, and queues a kairo.sessions row tagged cbt_exam', async () => {
  const engine = new KairoEngine({ studentId: 'sync2', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const cbtConceptId = engine.addConcept({ name: 'CBT Concept', subject: 'Biology', topic: 'T' });
  engine.contentPacks = {
    getOfflineQuestions: async ({ subject, count }) => Array.from({ length: count }, (_, i) => ({
      id: `${subject}_${i}`, questionId: `${subject}_${i}`, subject, text: `Q${i}`,
      options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'x', conceptId: cbtConceptId
    }))
  };

  const queued = [];
  engine.sync.queue = (item) => queued.push(item);

  engine.cbt.setup({ subjects: ['Biology'] });
  await engine.cbt.buildPaper();
  engine.cbt.start();
  engine.cbt.submitAnswer(0, 'A', 5000);
  const results = engine.cbt.finish();
  assertEqual(results.correct, 1, 'finish() should return real results instead of throwing — it previously crashed on the first conceptId-bearing question, so a completed CBT mock never actually finished');

  const sessionPush = queued.find(q => q.type === 'session' && q.data.mode === 'cbt_exam');
  assert(sessionPush, 'CBT finish() should queue a kairo.sessions row tagged mode: cbt_exam — previously nothing did, and the crash meant it never got this far anyway');

  assert(results.eliteScore, 'finish() should compute and return the real weighted eliteScore — previously nothing ever recalculated it for a completed CBT mock');
  assertEqual(results.scoreDelta.sessionType, 'cbt', 'A completed CBT mock should carry sessionType "cbt"');
  assert(!('bonus' in results.scoreDelta), 'Kairo Score delta should never carry a bonus field — Kairo Score stays pure and untouched by flat bonuses');
  assertEqual(engine.eliteScore.history[engine.eliteScore.history.length - 1].total, results.eliteScore.total, 'The engine\'s real eliteScoreHistory should reflect this CBT mock, not just the returned copy');
  assert(results.level, 'finish() should return a Kairo Points/level update — previously nothing ever awarded Kairo Points for a completed CBT mock');
  // Tight Economy: 1 correct answer * 2 = 2, plus the flat CBT_SESSION
  // bonus of 50 = 52. Strictly linear — no concept/day/topic milestones
  // involved at all.
  assertEqual(results.level.pointsEarned, 52, 'A full CBT simulation should earn 2 points for the correct answer plus the flat +50 CBT_SESSION bonus');
});

await test("CBT: finish() doesn't submit unanswered questions as attempts (they'd fail kairo.attempts' anti-cheat trigger and silently take the whole sync down)", async () => {
  const engine = new KairoEngine({ studentId: 'sync2b', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const cbtConceptId = engine.addConcept({ name: 'CBT Concept', subject: 'Biology', topic: 'T' });
  engine.contentPacks = {
    getOfflineQuestions: async ({ subject, count }) => Array.from({ length: count }, (_, i) => ({
      id: `${subject}_${i}`, questionId: `${subject}_${i}`, subject, text: `Q${i}`,
      options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'x', conceptId: cbtConceptId
    }))
  };

  const queued = [];
  engine.sync.queue = (item) => queued.push(item);

  engine.cbt.setup({ subjects: ['Biology'] });
  await engine.cbt.buildPaper();
  engine.cbt.start();
  engine.cbt.submitAnswer(0, 'A', 5000); // only question 0 gets answered; the rest (real exam default: timeSpentMs 0) are left blank
  engine.cbt.finish();

  const attemptPushes = queued.filter(q => q.type === 'attempt');
  assertEqual(attemptPushes.length, 1, 'Only the one genuinely answered question should be submitted as an attempt — not the ~39 left blank with the buildPaper() default of timeSpentMs: 0');
  assertEqual(attemptPushes[0].data.responseTimeMs, 5000, 'The one real attempt pushed should be the answered question, with its real response time');
});

await test('Custom Practice and Topic Practice sessions are tagged with their real mode, not silently recorded as standard', async () => {
  const engine = new KairoEngine({ studentId: 'sync3', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const cpConceptId = engine.addConcept({ name: 'Custom Concept', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  engine.questionGraph.addQuestion(new Question({
    id: 'cp_q1', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId: cpConceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));

  const customResult = engine.startCustomPractice({ subjects: ['Biology'], count: 5 });
  assertEqual(engine.currentSession.mode, 'custom_practice', 'startCustomPractice() should tag the session mode: custom_practice, not the startSession() default of standard');
  assert(customResult.queue.includes(cpConceptId), 'startCustomPractice() should still return the built plan alongside the session');
  await engine.endSession();

  const topicResult = engine.startTopicPractice('Biology', 'Cells', 'Organelles', 5);
  assertEqual(engine.currentSession.mode, 'topic_practice', 'startTopicPractice() should tag the session mode: topic_practice');
  assert(topicResult.queue.includes(cpConceptId), 'startTopicPractice() should still return the built subtopic plan alongside the session');
});

await test('endSession(): scoreDelta is a pure, bonus-free Kairo Score movement, while the Daily Recommendation bonus lands on Kairo Points instead for a standard (recommendation) session', async () => {
  const engine = new KairoEngine({ studentId: 'delta1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const conceptId = engine.addConcept({ name: 'Delta Concept', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  engine.questionGraph.addQuestion(new Question({
    id: 'delta_q1', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));

  engine.startSession({ mode: 'standard', plan: [conceptId] });
  engine.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'delta_q1', questionDifficulty: 1 });
  const result = await engine.endSession();

  assert(result.scoreDelta, 'endSession() should return a scoreDelta');
  assertEqual(result.scoreDelta.sessionType, 'recommendation', "mode 'standard' should map to sessionType 'recommendation'");
  assert(!('bonus' in result.scoreDelta), 'Kairo Score delta should never carry a bonus field — Kairo Score stays pure and untouched by flat bonuses');
  const latestSnapshot = engine.eliteScore.history[engine.eliteScore.history.length - 1];
  assertEqual(result.eliteScore.total, latestSnapshot.total, 'Returned eliteScore should be the real, unaltered weighted snapshot');
  assertEqual(result.scoreDelta.total, Math.ceil(latestSnapshot.total), 'scoreDelta.total should be exactly the organic movement (previousTotal was 0, this is the first session) — nothing added on top');
  // Tight Economy: 1 correct answer * 2 = 2, plus the flat
  // RECOMMENDATION_SESSION bonus of 10 = 12.
  assertEqual(result.level.pointsEarned, 12, 'A standard-mode (recommendation) session should earn 2 points for the correct answer plus the flat +10 Daily Recommendation bonus');
});

await test('endSession(): a custom/topic practice session earns no session bonus, only the base per-correct-answer points', async () => {
  const engine = new KairoEngine({ studentId: 'delta2', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const conceptId = engine.addConcept({ name: 'Delta Concept 2', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  engine.questionGraph.addQuestion(new Question({
    id: 'delta_q2', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));

  engine.startCustomPractice({ subjects: ['Biology'], count: 5 });
  engine.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'delta_q2', questionDifficulty: 1 });
  const result = await engine.endSession();

  assertEqual(result.scoreDelta.sessionType, 'standard', 'Custom practice should map to sessionType standard');
  assert(!('bonus' in result.scoreDelta), 'Kairo Score delta should never carry a bonus field');
  // Tight Economy: 1 correct answer * 2 = 2, no session bonus — custom
  // practice isn't the daily recommendation, a verification session, or a
  // full CBT simulation.
  assertEqual(result.level.pointsEarned, 2, 'Custom practice should earn only the base 2 points per correct answer — no session bonus');
});

await test("endSession(): a Study Planner verification session (topic_practice + isVerification) earns the VERIFICATION_SESSION bonus, a plain topic_practice session doesn't", async () => {
  const engine = new KairoEngine({ studentId: 'delta3', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const conceptId = engine.addConcept({ name: 'Delta Concept 3', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  engine.questionGraph.addQuestion(new Question({
    id: 'delta_q3', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));

  // Plain topic practice (isVerification defaults to false): no bonus.
  engine.startSession({ mode: 'topic_practice', plan: [conceptId] });
  engine.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'delta_q3', questionDifficulty: 1 });
  const plainResult = await engine.endSession();
  assertEqual(plainResult.level.pointsEarned, 2, 'A plain topic_practice session should earn only the base 2 points per correct answer');

  // Same shape, but flagged as a Verification Session (the Study Planner's
  // Verification CTA loop) — earns the flat VERIFICATION_SESSION bonus on
  // top, same base math.
  engine.startSession({ mode: 'topic_practice', plan: [conceptId], isVerification: true });
  engine.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'delta_q3', questionDifficulty: 1 });
  const verifyResult = await engine.endSession();
  assertEqual(verifyResult.level.pointsEarned, 2 + KairoPointsAwards.VERIFICATION_SESSION, 'A topic_practice session flagged isVerification should earn the base 2 points plus the flat +10 Verification Session bonus');
});

await test('finishRapidFire(): RapidFire now earns real Kairo Points under the Tight Economy (2 per correct answer, no session bonus)', async () => {
  // Regression: RapidFireEngine.finish() never called levelSystem.update()
  // at all — a completed Rapid Fire round earned zero Kairo Points no
  // matter what it did to the graph, unlike every other Practice mode.
  const engine = new KairoEngine({ studentId: 'rf_points_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const conceptId = engine.addConcept({ name: 'RF Points Concept', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  engine.questionGraph.addQuestion(new Question({
    id: 'rf_points_q1', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));
  engine.graph.getConcept(conceptId).retentionState = RetentionState.HELD;

  engine.startRapidFire({ questionCount: 1 });
  engine.submitRapidFireAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'rf_points_q1' });
  const result = engine.finishRapidFire();

  assert(result.level, 'finish() should return a Kairo Points/level update');
  // Tight Economy: 1 correct answer * 2 = 2, no session bonus — RapidFire
  // isn't the daily recommendation, a verification session, or a full CBT
  // simulation. Reaching Held on the concept earns nothing extra — the
  // milestone-ledger design that used to award +20/+50/+100 for exactly
  // this kind of state change (and could stack several such awards into
  // one huge payout) is gone.
  assertEqual(result.level.pointsEarned, 2, 'RapidFire should earn only the base 2 points per correct answer — no session bonus, no concept/topic milestone awards');
});

await test('endSession() durably saves locally before resolving — a reload immediately after sees the real score/streak, not a stale pre-session snapshot', async () => {
  // Regression for a real production report: a student's streak lit up
  // and their Kairo Score jumped right after a session, then both reset
  // (streak to 0, score back to its pre-session value) on refresh. Root
  // cause: endSession() used to compute score/streak/badges and hand them
  // back to the caller for an "instant" summary screen, while the actual
  // IndexedDB save (and the Supabase push riding on top of it) ran in a
  // detached, never-awaited tail — a refresh in the second or two right
  // after the summary rendered (exactly when a student is most likely to
  // look away) could win the race and leave nothing durably saved at all.
  const sessionA = new KairoEngine({ studentId: 'refresh_race_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await sessionA.init();
  const conceptId = sessionA.addConcept({ name: 'Refresh Race Concept', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  sessionA.questionGraph.addQuestion(new Question({
    id: 'refresh_race_q1', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));

  sessionA.startSession({ mode: 'standard', plan: [conceptId] });
  sessionA.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'refresh_race_q1', questionDifficulty: 1 });
  const result = await sessionA.endSession();

  // Simulate the refresh: a brand-new KairoEngine instance reading the
  // same persisted student back from storage, the same pattern the
  // "engine.settings is reconstructed on init() reload" test above uses.
  const sessionB = new KairoEngine({ studentId: 'refresh_race_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  sessionB.store.useMemory = true;
  sessionB.store.memoryFallback = sessionA.store.memoryFallback;
  await sessionB.init();

  assertEqual(sessionB.profile.streakData.currentMomentum, 1, 'The streak earned this session should survive an immediate reload, not reset to 0');
  const reloadedScore = sessionB.eliteScore.history[sessionB.eliteScore.history.length - 1];
  assert(reloadedScore, 'The elite score history entry from this session should exist after reload');
  assertEqual(reloadedScore.total, result.eliteScore.total, 'The exact score computed during the session should survive an immediate reload, not revert to the pre-session total');
});

test('TopicPracticeEngine.buildSubtopicSession fills the session from a concept\'s real question pool, not just one slot per concept', () => {
  // Regression test for a real bug: a subtopic almost always maps to
  // exactly one concept in seeded content, but that one concept can have
  // many real questions (checked directly against production: Biology's
  // "Evidence for Evolution" has 10). The old queue sliced distinct
  // concepts to `count`, so every topic-practice session was capped at 1
  // question — completely defeating a "deep-dive into a single topic"
  // feature — no matter how many real questions existed for that concept.
  const conceptId = learnEngine.addConcept({ name: 'Deep Dive Concept', subject: 'Biology', topic: 'Deep Dive Topic', subtopic: 'Deep Dive Subtopic' });
  for (let i = 0; i < 6; i++) {
    learnEngine.questionGraph.addQuestion(new Question({
      id: `deepdive_q${i}`, subject: 'Biology', topic: 'Deep Dive Topic', subtopic: 'Deep Dive Subtopic',
      conceptsTested: [{ conceptId, weight: 1 }],
      stem: `S${i}`, options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
      lifecycleState: 'live'
    }));
  }

  const session = learnEngine.topicPractice.buildSubtopicSession('Biology', 'Deep Dive Topic', 'Deep Dive Subtopic', 10);
  assertEqual(session.conceptCount, 1, 'This subtopic should map to exactly one concept, matching the real content pattern this bug came from');
  assertEqual(session.queue.length, 6, 'The queue should fill to the concept\'s real question pool size (6), not cap at 1 slot per distinct concept');
  assertEqual(session.queue.filter(id => id === conceptId).length, 6, 'Every queue slot should repeat the same (only) concept, so getQuestionForConcept can draw 6 distinct real questions from its pool via excludeIds');
});

test('Supabase adapter: kairo.concepts row maps correctly to ConceptNode shape', () => {
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);
  const row = { id: 'c1', name: 'Cell Structure', subject: 'Biology', topic: 'Cell Structure', subtopic: null, difficulty_weight: 1.0, dependency_ids: [], question_pool_ids: [] };
  const mapped = adapter._rowToConcept(row);
  assertEqual(mapped.id, 'c1', 'id should round-trip');
  assertEqual(mapped.name, 'Cell Structure', 'name should round-trip');
  assertEqual(mapped.difficultyWeight, 1.0, 'difficulty_weight should map to difficultyWeight');
});

test('Supabase adapter: kairo.questions row maps correctly to the Question constructor shape', () => {
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);
  const row = {
    id: 'q1', subject: 'Biology', topic: 'Cell Structure', subtopic: null,
    learning_objective: 'Understand cell structure well enough to apply it, not just recall it.',
    concepts_tested: [{ conceptId: 'c1', weight: 1.0 }], prerequisite_concepts: [],
    difficulty_rating: 2, cognitive_level: 'recall', estimated_solving_time_sec: 30,
    reading_load: 'low', calculation_load: 'none', distractors: [], skills_assessed: [],
    source: 'techmed_authored', year: null, exam_body: 'JAMB', related_question_ids: [],
    stem: 'What is the powerhouse of the cell?',
    options: [{ label: 'A', text: 'Mitochondria', isCorrect: true }], correct_option: 'A',
    explanation: 'Mitochondria produce ATP through cellular respiration.', lifecycle_state: 'live',
    empirical_stats: null, distractor_rationale: null
  };
  const mapped = adapter._rowToQuestion(row);
  assertEqual(mapped.stem, row.stem, 'stem should round-trip');
  assertEqual(mapped.conceptsTested[0].conceptId, 'c1', 'concepts_tested should map to conceptsTested');
  assertEqual(mapped.correctOption, 'A', 'correct_option should map to correctOption');
  assertEqual(mapped.lifecycleState, 'live', 'lifecycle_state should map to lifecycleState');
});

test('Supabase adapter: kairo.sessions row maps correctly to profile.sessions shape', () => {
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);
  const startedAt = Date.now() - 60000;
  const completedAt = Date.now();
  const row = {
    id: 'sess_map_1', mode: 'topic_practice', plan: ['c1', 'c1'], questions_answered: 5, correct_count: 4,
    elite_score: { total: 62.3 }, started_at: new Date(startedAt).toISOString(), completed_at: new Date(completedAt).toISOString()
  };
  const mapped = adapter._rowToSession(row);
  assertEqual(mapped.sessionId, 'sess_map_1', 'id should map to sessionId');
  assertEqual(mapped.mode, 'topic_practice', 'mode should round-trip');
  assertEqual(mapped.questionsAnswered, 5, 'questions_answered should map to questionsAnswered');
  assertEqual(mapped.correctCount, 4, 'correct_count should map to correctCount');
  assertEqual(mapped.startedAt, new Date(row.started_at).getTime(), 'started_at ISO string should map to an epoch-ms startedAt');
  assertEqual(mapped.completedAt, new Date(row.completed_at).getTime(), 'completed_at ISO string should map to an epoch-ms completedAt');
});

await test('fetchSessions() returns real past sessions oldest-first, and connectSupabase() uses it to restore profile.sessions', async () => {
  const now = Date.now();
  const sessionRows = [
    { id: 's_newer', mode: 'standard', plan: [], questions_answered: 3, correct_count: 3, elite_score: null, started_at: new Date(now - 86400000).toISOString(), completed_at: new Date(now - 86400000 + 60000).toISOString() },
    { id: 's_older', mode: 'standard', plan: [], questions_answered: 5, correct_count: 4, elite_score: null, started_at: new Date(now - 2 * 86400000).toISOString(), completed_at: new Date(now - 2 * 86400000 + 60000).toISOString() }
  ]; // deliberately newest-first, matching the real .order('started_at', {ascending:false}) query
  const studentRow = {
    id: 'stu_connect_test', auth_user_id: 'auth_connect_test', name: 'Ada', target_subjects: [],
    total_questions_answered: 8, total_correct: 7, elite_score_history: [], badges: [], completed_challenges: [],
    macro_state_history: [], response_time_baselines: {}, streak_window_sessions: [], notification_history: []
  };

  const mockClient = {
    auth: { async getUser() { return { data: { user: { id: 'auth_connect_test' } }, error: null }; } },
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; }, limit() { return builder; },
            maybeSingle() {
              if (table === 'students') return Promise.resolve({ data: studentRow, error: null });
              return Promise.resolve({ data: null, error: null });
            },
            then(resolve) {
              if (table === 'sessions') return resolve({ data: sessionRows, error: null });
              return resolve({ data: [], error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  const adapter = new SupabaseSyncAdapter(mockClient, null);
  const fetched = await adapter.fetchSessions('stu_connect_test');
  assertEqual(fetched.length, 2, 'fetchSessions should return both real rows');
  assertEqual(fetched[0].sessionId, 's_older', 'fetchSessions should return oldest-first, reversing the DB\'s newest-first order');
  assertEqual(fetched[1].sessionId, 's_newer', 'fetchSessions should return oldest-first, reversing the DB\'s newest-first order');

  const connectEngine = new KairoEngine({ studentId: 'pending', name: '', examDate: null, targetSubjects: [] });
  await connectEngine.init();
  const result = await connectEngine.connectSupabase(mockClient, {});
  assertEqual(result.studentId, 'stu_connect_test', 'connectSupabase should hydrate the real remote studentId');
  assertEqual(connectEngine.profile.sessions.length, 2, 'connectSupabase should populate profile.sessions from fetchSessions(), not leave it empty — this was the root cause of Today\'s Progress/EliteScore consistency/Macro State all resetting on every reload');
  assertEqual(connectEngine.profile.sessions[0].sessionId, 's_older', 'restored sessions should be chronologically ordered oldest-first, matching what _averageSessionGap() and other consumers assume');
});

await test('connectSupabase() merges fetchSessions() with local profile.sessions instead of overwriting — a session completed offline and durably saved locally, but not yet pushed (still in the pending-sync queue), must survive a reload that reconnects before that push lands', async () => {
  const now = Date.now();
  const remoteRows = [
    { id: 's_remote_only', mode: 'standard', plan: [], questions_answered: 3, correct_count: 3, elite_score: null, started_at: new Date(now - 2 * 86400000).toISOString(), completed_at: new Date(now - 2 * 86400000 + 60000).toISOString() }
  ];
  const studentRow = {
    id: 'stu_merge_test', auth_user_id: 'auth_merge_test', name: 'Ngozi', target_subjects: [],
    total_questions_answered: 3, total_correct: 3, elite_score_history: [], badges: [], completed_challenges: [],
    macro_state_history: [], response_time_baselines: {}, streak_window_sessions: [], notification_history: []
  };
  const mockClient = {
    auth: { async getUser() { return { data: { user: { id: 'auth_merge_test' } }, error: null }; } },
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; }, limit() { return builder; },
            maybeSingle() {
              if (table === 'students') return Promise.resolve({ data: studentRow, error: null });
              return Promise.resolve({ data: null, error: null });
            },
            then(resolve) {
              if (table === 'sessions') return resolve({ data: remoteRows, error: null });
              return resolve({ data: [], error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  const engine = new KairoEngine({ studentId: 'pending', name: '', examDate: null, targetSubjects: [] });
  await engine.init();
  // Simulate init() having already hydrated a locally-saved profile whose
  // sessions array includes one the remote fetch above doesn't know about
  // yet — the exact shape endSession() leaves behind right before a reload
  // races its own not-yet-run sync.sync() push.
  engine.profile.sessions = [{ sessionId: 's_local_pending', mode: 'standard', plan: [], questionsAnswered: 2, correctCount: 2, startedAt: now - 60000, completedAt: now }];

  await engine.connectSupabase(mockClient, {});

  assertEqual(engine.profile.sessions.length, 2, 'the local-only pending session must be merged in, not dropped when the remote fetch does not yet include it');
  const keys = engine.profile.sessions.map((s) => s.sessionId).sort();
  assertEqual(JSON.stringify(keys), JSON.stringify(['s_local_pending', 's_remote_only']), 'both the remote-confirmed session and the still-pending local one should be present after connectSupabase()');
});

await test('connectSupabase() rebuilds journeyStage/reEngagement/comms from the remote row instead of silently resetting them', async () => {
  // Regression: journeyStage/reEngagement/crossModuleMilestones/continuation/
  // comms/notificationOrchestrator are all constructed once, at engine-
  // construction time, against a blank profile. connectSupabase() used to
  // Object.assign the real remote values onto profile.* and then
  // immediately call _snapshotSjeeState(), which writes each LIVE
  // instance's still-blank in-memory state back onto profile.* —
  // overwriting the value that was just fetched. In particular this meant
  // an explicit "Stop All Notifications" hard-stop silently re-enabled
  // itself on every sign-in/reload.
  const studentRow = {
    id: 'stu_sjee_test', auth_user_id: 'auth_sjee_test', name: 'Chidi', target_subjects: [],
    total_questions_answered: 0, total_correct: 0, elite_score_history: [], badges: [], completed_challenges: [],
    macro_state_history: [], response_time_baselines: {}, streak_window_sessions: [], notification_history: [],
    journey_stage: 'establishment',
    journey_stage_history: [{ from: 'activation', to: 'establishment', at: Date.now() - 86400000 }],
    re_engagement: { winBackAttempts: [{ at: Date.now() - 86400000, tier: 'standard', respondedTo: false }], isDormant: false },
    comms: {
      consent: {
        channelPermissions: { push: true, in_app_badge: true, whatsapp: false, email: false, sms: false },
        categoryPreferences: {}, hardStopActive: true, editorialConsent: false, leaderboardOptIn: false
      },
      interactionLog: [], recentSends: []
    }
  };

  const mockClient = {
    auth: { async getUser() { return { data: { user: { id: 'auth_sjee_test' } }, error: null }; } },
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; }, limit() { return builder; },
            maybeSingle() {
              if (table === 'students') return Promise.resolve({ data: studentRow, error: null });
              return Promise.resolve({ data: null, error: null });
            },
            then(resolve) { return resolve({ data: [], error: null }); }
          };
          return builder;
        }
      };
    }
  };

  const connectEngine = new KairoEngine({ studentId: 'pending', name: '', examDate: null, targetSubjects: [] });
  await connectEngine.init();
  await connectEngine.connectSupabase(mockClient, {});

  assertEqual(connectEngine.journeyStage.currentStage, 'establishment', 'journeyStage tracker instance should be rebuilt from the remote row, not left at its constructed default of arrival');
  assertEqual(connectEngine.comms.consent.hardStopActive, true, 'A saved hard-stop should survive connectSupabase(), not silently re-enable notifications');
  assertEqual(connectEngine.reEngagement.winBackAttempts.length, 1, 'Real win-back history should survive connectSupabase()');

  // The real failure mode: _snapshotSjeeState() (called internally by
  // connectSupabase(), and again by every endSession()) must not clobber
  // what was just restored.
  connectEngine._snapshotSjeeState();
  assertEqual(connectEngine.profile.comms.consent.hardStopActive, true, '_snapshotSjeeState() after connect should preserve the hard-stop, not overwrite it with a fresh ConsentManager\'s default false');
  assertEqual(connectEngine.profile.reEngagement.winBackAttempts.length, 1, '_snapshotSjeeState() after connect should preserve win-back history, not overwrite it with an empty array');
});

await test('connectSupabase() never clobbers a fresher local score/streak/progress with a stale remote row', async () => {
  // Regression, the other half of the "streak/Kairo Score resets on
  // refresh" report: restoreSession() calls init() (loading the real,
  // possibly more current local profile from IndexedDB) BEFORE
  // connectSupabase() — but connectSupabase() used to unconditionally
  // Object.assign the remote kairo.students row over whatever local had,
  // with no check for which one was actually newer. If a session had
  // finished and saved locally (now durable — see the endSession() fix
  // above) but its own Supabase push hadn't landed yet — still offline,
  // or simply hadn't had time to run — every single reload would silently
  // revert the student's just-earned score/streak/progress back to
  // whatever the stale server row still said, even though the awaited
  // local save "fixed" the exact same symptom one layer down.
  const sessionA = new KairoEngine({ studentId: 'clobber_race_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await sessionA.init();
  const conceptId = sessionA.addConcept({ name: 'Clobber Race Concept', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });
  sessionA.questionGraph.addQuestion(new Question({
    id: 'clobber_race_q1', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles',
    conceptsTested: [{ conceptId, weight: 1 }],
    stem: 'S', options: [{ label: 'A', text: 'x', isCorrect: true }], correctOption: 'A',
    lifecycleState: 'live'
  }));
  sessionA.startSession({ mode: 'standard', plan: [conceptId] });
  sessionA.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'clobber_race_q1', questionDifficulty: 1 });
  const result = await sessionA.endSession();

  // A reload: a fresh engine instance sharing the same durable local
  // store (per the "engine.settings is reconstructed on init() reload"
  // pattern above) — init() loads the real, fresher local profile first,
  // exactly like restoreSession() does.
  const sessionB = new KairoEngine({ studentId: 'clobber_race_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  sessionB.store.useMemory = true;
  sessionB.store.memoryFallback = sessionA.store.memoryFallback;
  await sessionB.init();
  assertEqual(sessionB.profile.streakData.currentMomentum, 1, 'sanity check: the fresher local streak really did load first, same as the reload test above');

  // The stale remote row: as if this device's own Supabase push from
  // endSession() above genuinely never landed — an older lastSessionAt,
  // a blank streak, an empty score history. Same shape ensureStudentRow()
  // returns for an existing row.
  const staleRow = {
    id: 'clobber_race_test', auth_user_id: 'auth_clobber_race_test', name: 'Test',
    target_subjects: ['Biology'], total_questions_answered: 0, total_correct: 0,
    elite_score_history: [], badges: [], completed_challenges: [],
    macro_state: 'orienting', macro_state_history: [], response_time_baselines: {},
    last_session_at: new Date(sessionB.profile.lastSessionAt - 60000).toISOString(),
    streak_current_momentum: 0, streak_protected_gaps_used: 0, streak_last_session_date: null,
    streak_window_sessions: [], streak_freezes_available: 0, streak_freezes_used: 0,
    notification_history: [], learning_state_history: [], journey_stage_history: []
  };
  const mockClient = {
    auth: { async getUser() { return { data: { user: { id: 'auth_clobber_race_test' } }, error: null }; } },
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, order() { return builder; }, limit() { return builder; },
            maybeSingle() {
              if (table === 'students') return Promise.resolve({ data: staleRow, error: null });
              return Promise.resolve({ data: null, error: null });
            },
            then(resolve) { return resolve({ data: [], error: null }); }
          };
          return builder;
        }
      };
    }
  };

  await sessionB.connectSupabase(mockClient, {});

  assertEqual(sessionB.profile.streakData.currentMomentum, 1, "connectSupabase() should preserve the fresher local streak, not reset it to the stale remote row's 0");
  assertEqual(sessionB.profile.eliteScoreHistory.length, 1, "connectSupabase() should preserve the fresher local score history, not the stale remote row's empty array");
  assertEqual(sessionB.profile.eliteScoreHistory[0].total, result.eliteScore.total, 'The preserved score should be the exact one earned this session');
});

await test('loadContentCatalog() populates engine.graph and engine.questionGraph from Supabase, and getQuestionForConcept() bridges the practice loop to real seeded content', async () => {
  const conceptRow = { id: 'bio_c1', name: 'Photosynthesis', subject: 'Biology', topic: 'Photosynthesis', subtopic: null, difficulty_weight: 1.0, dependency_ids: [], question_pool_ids: [] };
  const questionRow = {
    id: 'bio_q1', subject: 'Biology', topic: 'Photosynthesis', subtopic: null,
    learning_objective: 'Understand Photosynthesis well enough to apply it, not just recall it.',
    concepts_tested: [{ conceptId: 'bio_c1', weight: 1.0 }], prerequisite_concepts: [],
    difficulty_rating: 2, cognitive_level: 'recall', estimated_solving_time_sec: 30,
    reading_load: 'low', calculation_load: 'none', distractors: [], skills_assessed: [],
    source: 'techmed_authored', year: null, exam_body: 'JAMB', related_question_ids: [],
    stem: 'Where does photosynthesis occur in a plant cell?',
    options: [{ label: 'A', text: 'Chloroplast', isCorrect: true }, { label: 'B', text: 'Nucleus', isCorrect: false }],
    correct_option: 'A', explanation: 'Photosynthesis occurs in the chloroplast, which contains chlorophyll.',
    lifecycle_state: 'live', empirical_stats: null, distractor_rationale: null
  };

  const mockClient = {
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; },
            then(resolve) {
              if (table === 'concepts') return resolve({ data: [conceptRow], error: null });
              if (table === 'questions') return resolve({ data: [questionRow], error: null });
              return resolve({ data: [], error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  const catalogEngine = new KairoEngine({ studentId: 'catalog_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await catalogEngine.init();
  const adapter = new SupabaseSyncAdapter(mockClient, catalogEngine.store);
  catalogEngine.sync.attachRemote(adapter, catalogEngine);

  const { conceptsLoaded, questionsLoaded } = await catalogEngine.loadContentCatalog({ subjects: ['Biology'] });
  assertEqual(conceptsLoaded, 1, 'loadContentCatalog should add the one fetched concept to engine.graph');
  assertEqual(questionsLoaded, 1, 'loadContentCatalog should add the one fetched question to engine.questionGraph');
  assert(catalogEngine.graph.hasConcept('bio_c1'), 'Concept fetched from Supabase should be a real ConceptNode in engine.graph, using the DB id verbatim — this was previously dead: fetchConcepts()/fetchQuestions() existed but nothing ever called them');

  const q = catalogEngine.getQuestionForConcept('bio_c1');
  assert(q, 'getQuestionForConcept should return a real question for a concept that has one live question linked to it');
  assertEqual(q.text, questionRow.stem, 'getQuestionForConcept should translate the canonical .stem field to the .text shape CBTExamMode/RapidFire consumers expect');
  assertEqual(q.conceptId, 'bio_c1', 'getQuestionForConcept should translate conceptsTested[0].conceptId to a flat singular .conceptId');
  assertEqual(q.correctOption, 'A', 'getQuestionForConcept should carry correctOption through untranslated');
});

await test('loadContentCatalog() rehydrates a brand-new concept\'s real attemptHistory/retentionState from Supabase, without ever calling sync() — fixing a bug where Active Traps/Weak Topics showed empty after signing back in on any device', async () => {
  const conceptRow = { id: 'chem_c1', name: 'Molarity', subject: 'Chemistry', topic: 'Molarity', subtopic: null, difficulty_weight: 1.0, dependency_ids: [], question_pool_ids: [] };
  const questionRow = {
    id: 'chem_q1', subject: 'Chemistry', topic: 'Molarity', subtopic: null,
    learning_objective: 'Understand Molarity well enough to apply it, not just recall it.',
    concepts_tested: [{ conceptId: 'chem_c1', weight: 1.0 }], prerequisite_concepts: [],
    difficulty_rating: 2, cognitive_level: 'recall', estimated_solving_time_sec: 30,
    reading_load: 'low', calculation_load: 'none', distractors: [], skills_assessed: [],
    source: 'techmed_authored', year: null, exam_body: 'JAMB', related_question_ids: [],
    stem: 'What is the molarity of a solution with 2 moles of solute in 1 liter?',
    options: [{ label: 'A', text: '2 M', isCorrect: true }, { label: 'B', text: '1 M', isCorrect: false }],
    correct_option: 'A', explanation: 'Molarity = moles of solute / liters of solution = 2/1 = 2 M.',
    lifecycle_state: 'live', empirical_stats: null, distractor_rationale: null
  };
  const remoteMissedAt = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago — long past the 72h Spaced Sandbox cooldown, so it should already be "ripe"
  const conceptStateRow = {
    student_id: 'rehydrate_test', concept_id: 'chem_c1', retention_state: 'fading',
    confidence_score: 0.3, last_seen_at: new Date(remoteMissedAt).toISOString(),
    decay_estimate: 0.6, next_review_estimate: null, error_pattern_tags: {},
    reinforced_cycles: 0, personal_decay_rate: 0.1
  };
  const attemptRow = {
    student_id: 'rehydrate_test', concept_id: 'chem_c1', question_id: 'chem_q1',
    correct: false, response_time_ms: 8000, answered_at: new Date(remoteMissedAt).toISOString(),
    error_tag: 'careless', question_difficulty: 2
  };

  const mockClient = {
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; }, in() { return builder; }, order() { return builder; },
            then(resolve) {
              if (table === 'concepts') return resolve({ data: [conceptRow], error: null });
              if (table === 'questions') return resolve({ data: [questionRow], error: null });
              if (table === 'concept_states') return resolve({ data: [conceptStateRow], error: null });
              if (table === 'attempts') return resolve({ data: [attemptRow], error: null });
              return resolve({ data: [], error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  // A brand-new engine with no prior sync() call at all — simulates the
  // exact post-sign-in-on-a-new-device state this bug affected.
  const freshEngine = new KairoEngine({ studentId: 'rehydrate_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry'] });
  await freshEngine.init();
  const adapter = new SupabaseSyncAdapter(mockClient, freshEngine.store);
  freshEngine.sync.attachRemote(adapter, freshEngine);

  await freshEngine.loadContentCatalog({ subjects: ['Chemistry'] });

  const node = freshEngine.graph.getConcept('chem_c1');
  assert(node, 'loadContentCatalog should still add the concept itself');
  assertEqual(node.retentionState, 'fading', 'the concept\'s real remote retentionState should be applied immediately, not left at the fresh-node default of unseen — this is what makes it show up under Weak Topics');
  assertEqual(node.attemptHistory.length, 1, 'the concept\'s real remote attempt should be merged into attemptHistory immediately, without a separate sync() call ever running');
  assertEqual(node.attemptHistory[0].questionId, 'chem_q1', 'the rehydrated attempt should be the real remote one');
  assertEqual(node.attemptHistory[0].correct, false, 'the rehydrated attempt should carry its real correct/incorrect outcome through');

  const ledger = freshEngine.getRecentMistakes(20);
  assert(ledger.length === 0, 'a mistake missed 10 days ago is past its 72h cooldown, so it belongs in Pending Repairs, not the still-cooling-down Recent Mistakes/Active Traps inbox');
  assertEqual(freshEngine.getPendingRepairsCount(), 2, 'getPendingRepairsCount() (the Review tab\'s Hero Metric — fading concepts + ripe mistakes counted separately) should count both the rehydrated fading concept and its ripe mistake immediately after loadContentCatalog(), proving Weak Topics/Active Traps reflect real Supabase history right after sign-in on a new device, not just after a later sync()');
});

await test('engine.settings is reconstructed on init() reload — saved preferences are not silently ignored', async () => {
  const sessionA = new KairoEngine({ studentId: 'settings_reload_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: [] });
  await sessionA.init();
  sessionA.settings.updatePreferences('notifications', { dailyRecap: false });
  await sessionA.store.saveProfile(sessionA.profile);

  // A real page reload is a brand-new KairoEngine instance reading the same
  // persisted student back from storage — simulate that here by sharing the
  // in-memory store's backing map (standing in for real IndexedDB, which
  // genuinely persists across reloads for the same origin/studentId, unlike
  // two independent LocalStore instances in this test harness).
  const sessionB = new KairoEngine({ studentId: 'settings_reload_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: [] });
  sessionB.store.useMemory = true;
  sessionB.store.memoryFallback = sessionA.store.memoryFallback;
  await sessionB.init();

  assertEqual(sessionB.profile.preferences.notifications.dailyRecap, false, 'sanity check: the saved preference really did reach engine.profile on reload');
  assertEqual(sessionB.settings.getPreferences().notifications.dailyRecap, false, 'engine.settings.getPreferences() should reflect the real saved preferences after a reload — ProfileSettings.preferences was previously computed once at construction (before init() replaced this.profile with the saved one) and never recomputed, so a returning student\'s settings screen would silently show defaults forever, even though the real preferences were correctly saved');
});

await test('ProfileSettings.deleteAllData() rebuilds every profile-bound subsystem, not just engine.profile/engine.graph', async () => {
  const engineDel = new KairoEngine({ studentId: 'delete_data_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry'] });
  await engineDel.init();

  // Give the pre-delete profile some real history and a custom preference,
  // and capture references to subsystems built against THAT profile.
  const cidBefore = engineDel.addConcept({ name: 'Old Concept', subject: 'Chemistry', topic: 'Old Topic' });
  engineDel.submitAnswer({ conceptId: cidBefore, correct: true, responseTimeMs: 5000, selectedOption: 'A', correctOption: 'A', questionId: 'old_q1', questionDifficulty: 1 });
  engineDel.settings.updatePreferences('accessibility', { reduceMotion: true });
  const eliteScoreBefore = engineDel.eliteScore;
  const kaiBefore = engineDel.kai;
  const settingsBefore = engineDel.settings;

  await engineDel.settings.deleteAllData();

  assert(engineDel.eliteScore !== eliteScoreBefore, 'engine.eliteScore should be a fresh instance after deleteAllData(), not the one still bound to the deleted profile');
  assert(engineDel.kai !== kaiBefore, 'engine.kai should be a fresh instance after deleteAllData()');
  assert(engineDel.settings !== settingsBefore, 'engine.settings should be a fresh instance after deleteAllData()');
  assertEqual(engineDel.settings.getPreferences().accessibility.reduceMotion, false, 'the fresh engine.settings should show real defaults, not the deleted profile\'s custom preference still sitting on the orphaned old ProfileSettings instance');
  assertEqual(engineDel.eliteScore.profile, engineDel.profile, 'engine.eliteScore should be bound to the current (post-delete) profile object, not a detached one — otherwise every future score calculation would silently write to data nothing ever reads again');

  // The new profile should behave like a genuinely fresh student, not
  // carry over the deleted one's history.
  const score = engineDel.eliteScore.calculate(engineDel.graph, engineDel.profile.sessions);
  assertEqual(score.total, 0, 'a freshly reset student with no graph/sessions should score 0, confirming eliteScore is reading the new empty profile, not the deleted one\'s history');
});

// ═══════════════════════════════════════════════════════════════
// SPACED SANDBOX — Review Tab's mistake retest cooldown
// ═══════════════════════════════════════════════════════════════

const MISTAKE_COOLDOWN_MS = 72 * 60 * 60 * 1000;

/** submitAnswer() only actually records onto concept.attemptHistory via RecommendationEngine.processAnswer() — this.recommendation stays null (and every submitAnswer() below a silent no-op) until startSession() has run at least once, same precedent every other submitAnswer()-using test in this file already follows. */
async function makeSandboxEngine(id) {
  const engine = new KairoEngine({
    studentId: id, name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Chemistry']
  });
  await engine.init();
  engine.startSession({ mode: 'standard', plan: [] });
  return engine;
}

/** Backdates the most recent attempt recorded for `questionId` on `conceptId` — the only way to exercise the 72h boundary deterministically without a real wait. */
function backdateLastAttempt(engine, conceptId, questionId, msAgo) {
  const concept = engine.graph.getConcept(conceptId);
  const attempt = [...concept.attemptHistory].reverse().find(a => a.questionId === questionId);
  attempt.timestamp = Date.now() - msAgo;
  return attempt;
}

await test('Spaced Sandbox: a mistake inside its 72h window is not yet a Pending Repair; past it, it is', async () => {
  const engine = await makeSandboxEngine('sandbox1');
  const conceptId = engine.addConcept({ name: 'Cooldown Concept', subject: 'Chemistry', topic: 'Acids' });
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb1_q1', questionDifficulty: 1 });

  assertEqual(engine.getPendingRepairsCount(), 0, 'A mistake missed moments ago is still cooling down — not yet a Pending Repair');
  const ledgerFresh = engine.review.getMistakeLedger();
  assertEqual(ledgerFresh.length, 1, 'The ledger tracks the mistake regardless of ripeness');
  assert(!ledgerFresh[0].ripe, 'A fresh mistake is not ripe');

  backdateLastAttempt(engine, conceptId, 'sb1_q1', MISTAKE_COOLDOWN_MS + 60 * 1000);
  assertEqual(engine.getPendingRepairsCount(), 1, 'Once 72h has genuinely elapsed since the wrong answer, it becomes a Pending Repair on its own — no explicit ack required');
});

await test('Spaced Sandbox: a later correct attempt on the same question clears it as a pending mistake', async () => {
  const engine = await makeSandboxEngine('sandbox2');
  const conceptId = engine.addConcept({ name: 'Resolved Concept', subject: 'Chemistry', topic: 'Acids' });
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb2_q1', questionDifficulty: 1 });
  backdateLastAttempt(engine, conceptId, 'sb2_q1', MISTAKE_COOLDOWN_MS + 60 * 1000);
  assertEqual(engine.getPendingRepairsCount(), 1, 'Ripe mistake counted before the retest');

  engine.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'sb2_q1', questionDifficulty: 1 });
  assertEqual(engine.getPendingRepairsCount(), 0, 'A later correct attempt on the exact same question resolves it — it is no longer a pending mistake');
});

await test('Spaced Sandbox: "I Understand" resets the cooldown to a fresh 72h from the acknowledgment, dismissing it from the Triage Inbox immediately', async () => {
  const engine = await makeSandboxEngine('sandbox3');
  const conceptId = engine.addConcept({ name: 'Ack Concept', subject: 'Chemistry', topic: 'Acids' });
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb3_q1', questionDifficulty: 1 });

  const inboxBefore = engine.getRecentMistakes(20);
  assertEqual(inboxBefore.length, 1, 'A fresh, unacknowledged mistake sits in the Triage Inbox');

  engine.setMistakePatch('sb3_q1', Date.now() + MISTAKE_COOLDOWN_MS);
  const inboxAfter = engine.getRecentMistakes(20);
  assertEqual(inboxAfter.length, 0, '"I Understand" removes it from the Triage Inbox immediately');
  assertEqual(engine.getPendingRepairsCount(), 0, 'and it is not a Pending Repair either, since its fresh cooldown has not elapsed yet');
});

await test('Spaced Sandbox: a stale "I Understand" patch from a resolved miss never lets a brand-new mistake on the same question skip its own cooldown', async () => {
  const engine = await makeSandboxEngine('sandbox4');
  const conceptId = engine.addConcept({ name: 'Stale Patch Concept', subject: 'Chemistry', topic: 'Acids' });

  // First miss, ten days ago, acknowledged an hour later, then genuinely
  // retested successfully — real chronological gaps between each step
  // (submitAnswer/setMistakePatch calls in a synchronous test can otherwise
  // land in the very same millisecond, which would make this scenario
  // impossible to tell apart from the normal "ack happened after the miss"
  // case — real students never manage that). The old patch is left sitting
  // in mistakePatches — nothing ever clears it.
  const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb4_q1', questionDifficulty: 1 });
  backdateLastAttempt(engine, conceptId, 'sb4_q1', Date.now() - tenDaysAgo);
  engine.setMistakePatch('sb4_q1', tenDaysAgo + 60 * 60 * 1000 + MISTAKE_COOLDOWN_MS); // acked 1h after that miss
  engine.submitAnswer({ conceptId, correct: true, responseTimeMs: 3000, selectedOption: 'A', correctOption: 'A', questionId: 'sb4_q1', questionDifficulty: 1 });
  backdateLastAttempt(engine, conceptId, 'sb4_q1', Date.now() - (tenDaysAgo + 2 * 60 * 60 * 1000)); // retested correctly 2h after the miss
  assertEqual(engine.getPendingRepairsCount(), 0, 'Resolved by the correct retest');

  // Missed again, right now — a brand-new mistake episode, ten days after
  // the acknowledged-and-resolved first one. The stale patch (whose value
  // is a full ~9 days in the past by now) must not let this new miss
  // appear ripe immediately.
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'C', correctOption: 'A', questionId: 'sb4_q1', questionDifficulty: 1 });
  assertEqual(engine.getPendingRepairsCount(), 0, 'A fresh mistake on a question with an old, now-irrelevant ack must still serve its own real 72h cooldown, not inherit the stale one');

  const ledger = engine.review.getMistakeLedger();
  const entry = ledger.find(m => m.questionId === 'sb4_q1');
  assert(!entry.acknowledged, 'The stale patch does not count as acknowledging this new miss');
  assert(entry.cooldownUntil > Date.now() + MISTAKE_COOLDOWN_MS - 60 * 1000, 'cooldownUntil reflects the new miss\'s own natural cooldown, not the old patch\'s timestamp');
});

await test('Spaced Sandbox: getQuestionForConcept excludes a cooling-down question but falls back to it when nothing else qualifies', async () => {
  const engine = await makeSandboxEngine('sandbox5');
  const conceptId = engine.addConcept({ name: 'Selection Concept', subject: 'Chemistry', topic: 'Acids' });
  for (const id of ['sb5_q1', 'sb5_q2']) {
    engine.questionGraph.addQuestion(new Question({
      id, subject: 'Chemistry', topic: 'Acids',
      conceptsTested: [{ conceptId, weight: 'primary' }],
      difficultyRating: 2, stem: `Q ${id}`,
      options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
      correctOption: 'A', lifecycleState: 'live'
    }));
  }
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb5_q1', questionDifficulty: 2 });

  for (let i = 0; i < 10; i++) {
    const q = engine.getQuestionForConcept(conceptId);
    assertEqual(q.id, 'sb5_q2', 'With a real, non-cooling alternative available, the cooling-down question is never served');
  }

  // Now make sb5_q2 cool down too — nothing ripe left for this concept.
  engine.submitAnswer({ conceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb5_q2', questionDifficulty: 2 });
  const fallback = engine.getQuestionForConcept(conceptId);
  assert(['sb5_q1', 'sb5_q2'].includes(fallback.id), 'When every real question for this concept is cooling down, falls back to the full pool rather than returning null');
});

await test('Spaced Sandbox: buildSmartPatchQuestionIds returns ripe mistakes plus a fresh question per uncovered fading concept', async () => {
  const engine = await makeSandboxEngine('sandbox6');
  const mistakeConceptId = engine.addConcept({ name: 'Ripe Mistake Concept', subject: 'Chemistry', topic: 'Acids' });
  engine.submitAnswer({ conceptId: mistakeConceptId, correct: false, responseTimeMs: 3000, selectedOption: 'B', correctOption: 'A', questionId: 'sb6_q1', questionDifficulty: 1 });
  backdateLastAttempt(engine, mistakeConceptId, 'sb6_q1', MISTAKE_COOLDOWN_MS + 60 * 1000);

  const fadingConceptId = engine.addConcept({ name: 'Fading Concept', subject: 'Chemistry', topic: 'Bonding' });
  engine.questionGraph.addQuestion(new Question({
    id: 'sb6_q2', subject: 'Chemistry', topic: 'Bonding',
    conceptsTested: [{ conceptId: fadingConceptId, weight: 'primary' }],
    difficultyRating: 2, stem: 'Q sb6_q2',
    options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
    correctOption: 'A', lifecycleState: 'live'
  }));
  engine.graph.getConcept(fadingConceptId).retentionState = RetentionState.FADING;

  assertEqual(engine.getPendingRepairsCount(), 2, 'One ripe mistake + one fading concept');
  const ids = engine.buildSmartPatchQuestionIds(20);
  assert(ids.includes('sb6_q1'), 'The ripe mistake resurfaces the exact question it missed');
  assert(ids.includes('sb6_q2'), 'The fading concept contributes a real question of its own');
  assertEqual(ids.length, 2, 'No duplicates, nothing extraneous');
});

await test('CBTExamMode.startFromQuestionIds builds a real, fresh, correctly-ordered paper from an explicit id list', async () => {
  const engine = await makeSandboxEngine('sandbox7');
  const conceptId = engine.addConcept({ name: 'Smart Patch Paper Concept', subject: 'Chemistry', topic: 'Acids' });
  for (const id of ['sb7_q1', 'sb7_q2']) {
    engine.questionGraph.addQuestion(new Question({
      id, subject: 'Chemistry', topic: 'Acids',
      conceptsTested: [{ conceptId, weight: 'primary' }],
      difficultyRating: 2, stem: `Stem ${id}`,
      options: [{ label: 'A', text: 'A', isCorrect: true }, { label: 'B', text: 'B', isCorrect: false }],
      correctOption: 'A', lifecycleState: 'live'
    }));
  }

  const started = engine.cbt.startFromQuestionIds(['sb7_q2', 'sb7_q1'], { subjects: ['Chemistry'], totalTimeMin: 12 });
  assert(started, 'Builds successfully when every id resolves');
  assertEqual(started.paper.length, 2, 'Both questions resolved');
  assertEqual(started.paper[0].questionId, 'sb7_q2', 'Preserves the exact order given, not a random pull');
  assertEqual(started.paper[1].questionId, 'sb7_q1', 'Preserves the exact order given');
  assertEqual(engine.cbt.state, 'running', 'A fresh Smart Patch session starts running immediately, same as any other CBT paper');
  assertEqual(Object.keys(engine.cbt.examData.answers).length, 0, 'Genuinely fresh — no answers carried over from anywhere');

  const missing = engine.cbt.startFromQuestionIds(['sb7_q1', 'does_not_exist'], { subjects: ['Chemistry'], totalTimeMin: 12 });
  assertEqual(missing, null, 'Aborts cleanly (rather than building a paper with a gap) when any id fails to resolve');
});

console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log(`\n⚠️  ${failCount} test(s) need attention.`);
  process.exit(1);
}
console.log('\n🚀 All tests passed. Kairo Learning Engine is fully functional.');
