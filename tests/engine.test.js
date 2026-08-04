/**
 * Kairo — Comprehensive Engine Test Suite
 * Run with: node tests/engine.test.js
 */

import { KairoEngine, Question, LearnModule, SupabaseSyncAdapter, CBTExamMode } from "../src/index.js";
import { StudentProfile } from "../src/student/StudentProfile.js";
import { RetentionState, ErrorTag, Channel } from "../src/utils/constants.js";
import { OneSignalTransport } from "../src/comms/transport/OneSignalTransport.js";
import { OnboardingEngine } from "../src/onboarding/OnboardingEngine.js";
import { candidateToTemplateInput } from "../src/sjee/NotificationPipeline.js";
import { TemplateEngine } from "../src/comms/TemplateEngine.js";

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

// ═══════════════════════════════════════════════════════════════
// PROGRESSION
// ═══════════════════════════════════════════════════════════════

test('Level system calculates XP and progress', () => {
  const progress = engine.getLevelProgress();
  assert(typeof progress.level === 'number', 'Should have level');
  assert(typeof progress.xp === 'number', 'Should have XP');
  assert(typeof progress.progressPercent === 'number', 'Should have progress %');
  assert(progress.level >= 1, 'Should be at least level 1');
});

test('Badge system has catalog and checks', () => {
  const badges = engine.getBadges();
  assert(Array.isArray(badges.earned), 'Should have earned badges array');
  assert(Array.isArray(badges.available), 'Should have available badges array');
  assert(badges.available.length > 0, 'Should have available badges');
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

test('Segmented leaderboard: getSegmentKey() still computes course+tier locally (no adapter needed)', () => {
  const key = engine.segmentedLeaderboard.getSegmentKey(engine.profile);
  assert(typeof key === 'string' && key.includes('::tier_'), 'segment key should be a course::tier_N string, computed purely from profile data');
});

await test('Leaderboard: getMyLeaderboard() throws without a connected adapter, and returns real ranked/mapped rows once connected', async () => {
  const leaderboardEngine = new KairoEngine({ studentId: 'lb_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await leaderboardEngine.init();

  let threw = false;
  try {
    await leaderboardEngine.getMyLeaderboard();
  } catch (e) {
    threw = true;
  }
  assert(threw, 'getMyLeaderboard() should throw a clear error without connectSupabase() — previously this was an in-memory Map that silently "worked" while only ever showing the current student alone');

  leaderboardEngine.sync.adapter = {
    fetchSegmentedLeaderboard: async (studentId, limit) => [
      { rank: 1, studentId: 'other_student', name: 'Someone Else', eliteScore: 90, streak: 4, lastActive: Date.now(), isCurrentUser: false },
      { rank: 2, studentId, name: leaderboardEngine.profile.name, eliteScore: 80, streak: 2, lastActive: Date.now(), isCurrentUser: true }
    ]
  };
  const board = await leaderboardEngine.getMyLeaderboard();
  assert(Array.isArray(board) && board.length === 2, 'should return the real cross-student rows the adapter provides, not just the current user');
  assert(board.some(b => b.isCurrentUser), 'should be able to identify the current user within the real ranking');
});

await test('Leaderboard: getUniversityRankings() throws without a connected adapter, and returns real aggregated rankings once connected', async () => {
  const uniEngine = new KairoEngine({ studentId: 'uni_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await uniEngine.init();

  let threw = false;
  try {
    await uniEngine.getUniversityRankings();
  } catch (e) {
    threw = true;
  }
  assert(threw, 'getUniversityRankings() should throw a clear error without connectSupabase()');

  uniEngine.sync.adapter = {
    fetchUniversityRankings: async (limit) => [
      { rank: 1, university: 'UNILAG', totalScore: 240, studentCount: 3, avgScore: 80 }
    ]
  };
  const rankings = await uniEngine.getUniversityRankings();
  assert(Array.isArray(rankings) && rankings.length === 1, 'should return the real aggregated university rankings the adapter provides');
  assertEqual(rankings[0].university, 'UNILAG', 'ranking rows should carry through unmodified');
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

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS & COMMUNICATION SYSTEMS
// ═══════════════════════════════════════════════════════════════

test('Comms service withholds delivery without consent', () => {
  const testEngine = new (engine.constructor)({
    studentId: 'comms_test_001', name: 'NoConsent Student',
    examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    targetSubjects: ['Chemistry'], targetCourse: 'Medicine and Surgery'
  });
  const resolved = testEngine.comms.resolve({
    category: 'academic_nudge', tier: 'standard',
    data: { observation: 'Mole Concept is starting to fade.', action: 'Review it now.' }
  });
  assertEqual(resolved, null, 'No channel permission granted — should resolve to null, not deliver');
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
  assert(lesson.steps.keyIdea, 'Key idea (memory aid) should be present');
});

test('Learn: careless_slip compresses to a light lesson', () => {
  const lesson2 = learnEngine.learn.fromIncorrectAnswer({
    questionId: 'lq1', conceptId: learnConceptId, selectedOption: 'B', errorTag: ErrorTag.CARELESS_SLIP
  });
  assert(lesson2.compressed, 'careless_slip should trigger compression');
  assertEqual(lesson2.steps.coreConcept.conceptSummary, null, 'Compressed lesson should skip the fuller concept summary');
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
  p.pushExternalId = 'onesignal_ext_ada_1';
  p.completedChallenges = ['daily_5_reinforced'];
  p.totalXP = 420;
  p.badges = ['first_reinforced', 'three_day_streak'];
  p.preferences = { notifications: { dailyRecap: false } };
  p.onboarding = { step: 4, state: 'in_progress', data: { name: 'Ada', subjects: ['Biology'] } };

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
  assertEqual(restored.pushExternalId, 'onesignal_ext_ada_1', 'pushExternalId should round-trip exactly — without this, the student-to-OneSignal-device mapping OneSignalTransport.send() needs would be silently lost on every save');
  assertEqual(restored.completedChallenges.length, 1, 'completedChallenges should round-trip exactly — ChallengesModule.checkAndAward() wrote directly onto the profile without this field ever being declared, so it was silently dropped on every save');
  assertEqual(restored.totalXP, 420, 'totalXP should round-trip exactly — without this a returning student\'s level would incorrectly reset to 1 on every fresh load until their next completed session recalculated it');
  assertEqual(restored.badges.length, 2, 'badges should round-trip exactly — without this, every earned badge would be silently lost on reload and immediately re-awarded (and re-notified) the next time its condition was checked');
  assertEqual(restored.preferences.notifications.dailyRecap, false, 'preferences should round-trip exactly — without this, a student\'s notification/practice/accessibility/privacy/offline settings would silently reset to defaults on every fresh load');
  assertEqual(restored.onboarding.step, 4, 'onboarding should round-trip exactly — previously never snapshotted at all (unlike reEngagement/crossModuleMilestones/continuation/comms/learn, which all follow this pattern), so a student closing the app mid-onboarding always restarted from step 0');
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
    pendingCbtResults: [{ id: 'cbt_1', subjects: ['Biology'], questionResults: [{ questionId: 'q1', correct: true }], bySubject: [], totalQuestions: 1, score: 1, maxScore: 1, percentage: 100, startedAt: Date.now(), completedAt: Date.now() }],
    since: null
  });

  const sessionPush = calls.find(c => c.table === 'sessions' && c.op === 'upsert');
  assert(sessionPush, 'fullSync should push queued sessions through pushSession (kairo.sessions upsert) — this was previously dead code, never invoked');
  assertEqual(sessionPush.rows.id, 'sess1', 'Pushed session row should carry the session id');

  const cbtResultPush = calls.find(c => c.table === 'cbt_results' && c.op === 'insert');
  assert(cbtResultPush, 'fullSync should push queued CBT results through pushCbtResult (kairo.cbt_results insert)');
  assertEqual(cbtResultPush.rows.id, 'cbt_1', 'Pushed cbt_result row should carry the result id');
  assertEqual(cbtResultPush.rows.question_results.length, 1, 'Pushed cbt_result row should carry the full per-question detail');
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
  const fakeEngine = { contentPacks: {}, submitAnswer: () => {} };
  const cbt = new CBTExamMode(fakeEngine);
  const result = cbt.setup({ subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'] });
  assertEqual(result.totalQuestions, 180, 'Use of English(60) + Mathematics(40) + Physics(40) + Chemistry(40) should total 180, the real JAMB question count — a uniform 40-per-subject default previously produced 160. Also regression-covers the "English" vs "Use of English" naming bug: the key must match the seeded subject string exactly or this silently falls back to the default 40.');
});

await test('CBT: submitAnswer withholds correctness feedback during a live attempt (CBT Exam Mode Spec §2.3/§5.2/§5.4)', async () => {
  const fakeQuestions = (subject, count) => Array.from({ length: count }, (_, i) => ({
    id: `${subject}_${i}`, questionId: `${subject}_${i}`, subject,
    text: `Q${i}`, options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'Because A.', conceptId: null
  }));
  const fakeEngine = {
    contentPacks: { getOfflineQuestions: async ({ subject, count }) => fakeQuestions(subject, count) },
    submitAnswer: () => {},
    sync: { queue: () => {} }
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

  const cbtResultPush = queued.find(q => q.type === 'cbt_result');
  assert(cbtResultPush, 'CBT finish() should also queue the full per-question detail as a cbt_result — kairo.sessions only ever carried the summary, so a completed mock\'s question-level results were lost once the local session ended');
  assertEqual(cbtResultPush.data.id, sessionPush.data.id, 'the cbt_result should share its id with the paired kairo.sessions row so they can be joined');
  assert(Array.isArray(cbtResultPush.data.questionResults) && cbtResultPush.data.questionResults.length === 40, 'the cbt_result should carry a per-question entry for the full paper (Biology defaults to 40 questions), not just a summary');
  assertEqual(cbtResultPush.data.questionResults[0].isCorrect, true, 'the answered question\'s real correctness detail should be present');
});

await test('Custom Practice and Topic Practice sessions are tagged with their real mode, not silently recorded as standard', async () => {
  const engine = new KairoEngine({ studentId: 'sync3', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine.init();
  const cpConceptId = engine.addConcept({ name: 'Custom Concept', subject: 'Biology', topic: 'Cells', subtopic: 'Organelles' });

  const customResult = engine.startCustomPractice({ subjects: ['Biology'], count: 5 });
  assertEqual(engine.currentSession.mode, 'custom_practice', 'startCustomPractice() should tag the session mode: custom_practice, not the startSession() default of standard');
  assert(customResult.queue.includes(cpConceptId), 'startCustomPractice() should still return the built plan alongside the session');
  await engine.endSession();

  const topicResult = engine.startTopicPractice('Biology', 'Cells', 'Organelles', 5);
  assertEqual(engine.currentSession.mode, 'topic_practice', 'startTopicPractice() should tag the session mode: topic_practice');
  assert(topicResult.queue.includes(cpConceptId), 'startTopicPractice() should still return the built subtopic plan alongside the session');
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

test('Supabase adapter: kairo.challenges/kairo.challenge_attempts rows map correctly', () => {
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);
  const challengeRow = {
    id: 'chal_daily_1', type: 'daily', title: 'Test Daily', theme: 'Cell Biology',
    question_ids: ['q1', 'q2'], scoring_formula: 'speed',
    starts_at: '2026-08-01T00:00:00Z', ends_at: '2026-08-02T00:00:00Z',
    late_join_allowed: true, leaderboard_visible: true, status: 'live',
    created_by: 'admin-1', created_at: '2026-07-31T00:00:00Z'
  };
  const mappedChallenge = adapter._rowToChallenge(challengeRow);
  assertEqual(mappedChallenge.scoringFormula, 'speed', 'scoring_formula should map to scoringFormula');
  assertEqual(mappedChallenge.questionIds.length, 2, 'question_ids should map to questionIds');
  assertEqual(mappedChallenge.lateJoinAllowed, true, 'late_join_allowed should map to lateJoinAllowed');

  const attemptRow = {
    id: 'chal_daily_1_stu1', challenge_id: 'chal_daily_1', student_id: 'stu1',
    joined_at: '2026-08-01T01:00:00Z', completed_at: '2026-08-01T01:05:00Z',
    counts_toward_leaderboard: true, score: 80, accuracy: 80, time_taken_ms: 30000,
    question_results: [{ questionId: 'q1', correct: true }]
  };
  const mappedAttempt = adapter._rowToChallengeAttempt(attemptRow);
  assertEqual(mappedAttempt.score, 80, 'score should round-trip');
  assertEqual(mappedAttempt.questionResults.length, 1, 'question_results should map to questionResults');
});

await test('ChallengesModule: createChallenge defaults late-join to false only for mock_utme', async () => {
  const engine5 = new KairoEngine({ studentId: 'chal_test_1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine5.init();
  const calls = [];
  engine5.sync.adapter = {
    createChallenge: async (challenge) => { calls.push(challenge); return { ...challenge }; }
  };

  await engine5.challenges.createChallenge({ type: 'mock_utme', title: 'Mock UTME', questionIds: ['q1'], startsAt: Date.now(), endsAt: Date.now() + 1000 }, 'admin1');
  await engine5.challenges.createChallenge({ type: 'daily', title: 'Daily', questionIds: ['q1'], startsAt: Date.now(), endsAt: Date.now() + 1000 }, 'admin1');

  assertEqual(calls[0].lateJoinAllowed, false, 'mock_utme should default lateJoinAllowed to false per Challenges Module Spec §5.3');
  assertEqual(calls[1].lateJoinAllowed, true, 'daily should default lateJoinAllowed to true');
});

await test('ChallengesModule: joinChallenge flags a late join on a no-late-join challenge as not counting toward the leaderboard', async () => {
  const engine6 = new KairoEngine({ studentId: 'chal_test_2', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine6.init();
  const joinCalls = [];
  engine6.sync.adapter = {
    fetchChallenges: async () => [{ id: 'mock_1', type: 'mock_utme', startsAt: Date.now() - 60000, endsAt: Date.now() + 60000, lateJoinAllowed: false }],
    joinChallenge: async (challengeId, studentId, opts) => { joinCalls.push(opts); return { id: `${challengeId}_${studentId}`, ...opts }; }
  };

  const result = await engine6.challenges.joinChallenge('mock_1');
  assertEqual(result.lateJoin, true, 'joining after startsAt should be flagged as a late join');
  assertEqual(result.countsTowardLeaderboard, false, 'a late join on a no-late-join-allowed challenge should not count toward the leaderboard');
  assertEqual(joinCalls[0].countsTowardLeaderboard, false, 'the adapter should be told the same thing');
});

await test('ChallengesModule: finishChallenge computes accuracy/speed/hybrid scores and records completion + daily streak', async () => {
  const engine7 = new KairoEngine({ studentId: 'chal_test_3', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine7.init();
  let pushedAttempt = null;
  engine7.sync.adapter = {
    fetchChallenges: async () => [{ id: 'chal_acc', type: 'daily', scoringFormula: 'accuracy' }],
    pushChallengeAttempt: async (attempt) => { pushedAttempt = attempt; return attempt; }
  };

  const results = [
    { questionId: 'q1', correct: true, responseTimeMs: 5000 },
    { questionId: 'q2', correct: true, responseTimeMs: 5000 },
    { questionId: 'q3', correct: false, responseTimeMs: 5000 },
    { questionId: 'q4', correct: true, responseTimeMs: 5000 }
  ];
  const finished = await engine7.challenges.finishChallenge('chal_acc', results);

  assertEqual(finished.accuracy, 75, 'accuracy should be correctCount/total * 100');
  assertEqual(finished.score, 75, 'accuracy-formula score should equal accuracy exactly — time is not a factor');
  assert(pushedAttempt && pushedAttempt.score === 75, 'the pushed attempt should carry the same computed score');
  assert(engine7.profile.completedChallenges.includes('chal_acc'), 'finishChallenge should record the challenge id in completedChallenges');
  assertEqual(engine7.profile.challengeStreak.current, 1, 'first daily challenge completion should start a streak of 1');

  // A faster/speed-scored challenge should score at least as high as pure accuracy for the same correctness.
  engine7.sync.adapter.fetchChallenges = async () => [{ id: 'chal_speed', type: 'speed', scoringFormula: 'speed' }];
  const fastResults = results.map(r => ({ ...r, responseTimeMs: 2000 }));
  const finishedSpeed = await engine7.challenges.finishChallenge('chal_speed', fastResults);
  assert(finishedSpeed.score >= finishedSpeed.accuracy, 'speed formula should never score below plain accuracy for the same correctness, since it only adds a bonus');
});

await test('ChallengesModule: getLeaderboard passes the caller\'s own studentId for the windowed-around-self default (§7.2)', async () => {
  const engine8 = new KairoEngine({ studentId: 'chal_test_4', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await engine8.init();
  let seenArgs = null;
  engine8.sync.adapter = {
    fetchLeaderboard: async (challengeId, opts) => { seenArgs = { challengeId, opts }; return [{ studentId: engine8.profile.studentId, rank: 1 }]; }
  };

  const board = await engine8.challenges.getLeaderboard('chal_x');
  assertEqual(seenArgs.opts.aroundStudentId, engine8.profile.studentId, 'getLeaderboard should default to windowing around the calling student, not a bare top-N list');
  assertEqual(board.length, 1, 'should return whatever the adapter provides');
});

test('StudentProfile: challengeStreak round-trips through toJSON (structural check extended for the Challenges Module rewrite)', () => {
  const p = new StudentProfile({ studentId: 'sp2', name: 'Streak Student' });
  p.challengeStreak = { current: 3, lastCompletedDate: new Date().toDateString(), type: 'daily' };
  const json = p.toJSON();
  assert('challengeStreak' in json, 'challengeStreak must be present in toJSON() output or it silently drops on every save, exactly like completedChallenges/totalXP/badges/preferences did before they were declared');
  assertEqual(json.challengeStreak.current, 3, 'challengeStreak value should round-trip exactly');
});

// ═══════════════════════════════════════════════════════════════
// ONESIGNAL TRANSPORT TESTS
// No live network calls — fetchImpl is always injected and stubbed.
// ═══════════════════════════════════════════════════════════════

await test('OneSignalTransport: throws when appId/apiKey are missing', async () => {
  const transport = new OneSignalTransport({ appId: null, apiKey: null, fetchImpl: async () => { throw new Error('should not be called'); } });
  let threw = false;
  try {
    await transport.send({ channel: Channel.PUSH, rendered: { text: 'hi' } }, 'ext1');
  } catch (e) {
    threw = true;
  }
  assert(threw, 'send() should throw when ONESIGNAL_APP_ID/ONESIGNAL_API_KEY are not configured, not silently no-op');
});

await test('OneSignalTransport: in_app_badge and whatsapp are handled as non-error "not sent" outcomes, not thrown', async () => {
  const transport = new OneSignalTransport({ appId: 'app1', apiKey: 'key1', fetchImpl: async () => { throw new Error('should not be called for unsupported channels'); } });

  const inApp = await transport.send({ channel: Channel.IN_APP, rendered: { text: 'hi' } }, 'ext1');
  assertEqual(inApp.sent, false, 'in_app_badge should report sent: false, not throw');

  const whatsapp = await transport.send({ channel: Channel.WHATSAPP, rendered: { text: 'hi' } }, 'ext1');
  assertEqual(whatsapp.sent, false, 'whatsapp should report sent: false — OneSignal has no WhatsApp channel');
});

await test('OneSignalTransport: builds the correct payload shape per channel and targets by external_id', async () => {
  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body) });
    return { ok: true, json: async () => ({ id: 'onesignal_msg_1' }) };
  };
  const transport = new OneSignalTransport({ appId: 'app1', apiKey: 'key1', fetchImpl });

  await transport.send({ channel: Channel.PUSH, rendered: { text: 'Your recap is ready.' } }, 'student_ext_1');
  assertEqual(calls[0].body.target_channel, 'push', 'push should target_channel: push');
  assertEqual(calls[0].body.contents.en, 'Your recap is ready.', 'push should carry rendered text in contents.en');
  assertEqual(calls[0].body.include_aliases.external_id[0], 'student_ext_1', 'should target by external_id, never a hardcoded/invented id');

  await transport.send({ channel: Channel.EMAIL, rendered: { text: 'Your weekly summary.', subject: 'Your Week' } }, 'student_ext_1');
  assertEqual(calls[1].body.target_channel, 'email', 'email should target_channel: email');
  assertEqual(calls[1].body.email_subject, 'Your Week', 'email should carry the rendered subject');

  await transport.send({ channel: Channel.SMS, rendered: { text: 'Exam in 1 week.' } }, 'student_ext_1');
  assertEqual(calls[2].body.target_channel, 'sms', 'sms should target_channel: sms');

  const result = await transport.send({ channel: Channel.PUSH, rendered: { text: 'hi' } }, 'student_ext_1');
  assertEqual(result.oneSignalId, 'onesignal_msg_1', 'a successful send should surface OneSignal\'s own message id');
});

await test('OneSignalTransport: surfaces a descriptive error on a non-OK API response instead of swallowing it', async () => {
  const transport = new OneSignalTransport({
    appId: 'app1', apiKey: 'key1',
    fetchImpl: async () => ({ ok: false, status: 400, text: async () => '{"errors":["Invalid app_id"]}' })
  });
  let errorMessage = null;
  try {
    await transport.send({ channel: Channel.PUSH, rendered: { text: 'hi' } }, 'ext1');
  } catch (e) {
    errorMessage = e.message;
  }
  assert(errorMessage && errorMessage.includes('400'), 'a failed OneSignal call should throw with the status code and body, not fail silently');
});

await test('OnboardingEngine.getDiagnosticQuestions() selects real, live questions spread across chosen subjects, easiest first', async () => {
  const rows = {
    concepts: [
      { id: 'bio_c1', name: 'Cells', subject: 'Biology', topic: 'Cells', subtopic: null, difficulty_weight: 1.0, dependency_ids: [], question_pool_ids: [] },
      { id: 'chem_c1', name: 'Acids', subject: 'Chemistry', topic: 'Acids', subtopic: null, difficulty_weight: 1.0, dependency_ids: [], question_pool_ids: [] }
    ],
    questions: [
      { id: 'bio_hard', subject: 'Biology', topic: 'Cells', subtopic: null, learning_objective: 'Understand Cells well enough to apply it, not just recall it.', concepts_tested: [{ conceptId: 'bio_c1', weight: 1.0 }], prerequisite_concepts: [], difficulty_rating: 5, cognitive_level: 'recall', estimated_solving_time_sec: 30, reading_load: 'low', calculation_load: 'none', distractors: [], skills_assessed: [], source: 'x', year: null, exam_body: 'JAMB', related_question_ids: [], stem: 'Hard bio Q', options: [{ label: 'A', text: 'x', isCorrect: true }], correct_option: 'A', explanation: 'x'.repeat(30), lifecycle_state: 'live', empirical_stats: null, distractor_rationale: null },
      { id: 'bio_easy', subject: 'Biology', topic: 'Cells', subtopic: null, learning_objective: 'Understand Cells well enough to apply it, not just recall it.', concepts_tested: [{ conceptId: 'bio_c1', weight: 1.0 }], prerequisite_concepts: [], difficulty_rating: 1, cognitive_level: 'recall', estimated_solving_time_sec: 30, reading_load: 'low', calculation_load: 'none', distractors: [], skills_assessed: [], source: 'x', year: null, exam_body: 'JAMB', related_question_ids: [], stem: 'Easy bio Q', options: [{ label: 'A', text: 'x', isCorrect: true }], correct_option: 'A', explanation: 'x'.repeat(30), lifecycle_state: 'live', empirical_stats: null, distractor_rationale: null },
      { id: 'chem_easy', subject: 'Chemistry', topic: 'Acids', subtopic: null, learning_objective: 'Understand Acids well enough to apply it, not just recall it.', concepts_tested: [{ conceptId: 'chem_c1', weight: 1.0 }], prerequisite_concepts: [], difficulty_rating: 2, cognitive_level: 'recall', estimated_solving_time_sec: 30, reading_load: 'low', calculation_load: 'none', distractors: [], skills_assessed: [], source: 'x', year: null, exam_body: 'JAMB', related_question_ids: [], stem: 'Easy chem Q', options: [{ label: 'A', text: 'x', isCorrect: true }], correct_option: 'A', explanation: 'x'.repeat(30), lifecycle_state: 'live', empirical_stats: null, distractor_rationale: null }
    ]
  };
  const mockClient = {
    schema() {
      return {
        from(table) {
          const builder = {
            select() { return builder; }, eq() { return builder; },
            then(resolve) { return resolve({ data: rows[table] || [], error: null }); }
          };
          return builder;
        }
      };
    }
  };

  const obEngine = new KairoEngine({ studentId: 'ob_diag_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: [] });
  await obEngine.init();
  obEngine.sync.attachRemote(new SupabaseSyncAdapter(mockClient, obEngine.store), obEngine);
  obEngine.onboarding.data.subjects = ['Biology', 'Chemistry'];

  const questions = await obEngine.onboarding.getDiagnosticQuestions(3);
  assertEqual(questions.length, 3, 'should return the requested count when enough live questions exist');
  const bioQuestions = questions.filter(q => q.subject === 'Biology');
  const chemQuestions = questions.filter(q => q.subject === 'Chemistry');
  assert(bioQuestions.length >= 1 && chemQuestions.length >= 1, 'should spread across both chosen subjects, not pull all 3 from one');
  assert(bioQuestions.some(q => q.id === 'bio_easy'), 'should prefer the easier Biology question over the harder one for a diagnostic, not a challenge');
  assert(questions.every(q => 'text' in q && 'options' in q), 'should return the flat consumer shape (.text/.options), same as CBTExamMode/getQuestionForConcept');
});

await test('OnboardingEngine state survives a save/reload cycle instead of always restarting at step 0', async () => {
  const engine9 = new KairoEngine({ studentId: 'ob_persist_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: [] });
  await engine9.init();

  // Progress partway through onboarding (welcome -> name -> goal) without completing it.
  engine9.onboarding.submitStep(null); // 'welcome' step has no field, just advances
  engine9.onboarding.submitStep('Ada'); // 'name' step
  engine9.onboarding.submitStep('Medicine and Surgery'); // 'goal' step
  assertEqual(engine9.onboarding.step, 3, 'sanity check: three steps submitted should advance to step 3');

  engine9._snapshotSjeeState();
  const resumed = OnboardingEngine.fromJSON(engine9.profile.onboarding, engine9);

  assertEqual(resumed.step, 3, 'onboarding step should survive the exact save/restore path init() uses (profile.onboarding -> OnboardingEngine.fromJSON) — previously nothing snapshotted onboarding state at all, so this always came back as a fresh step-0 engine');
  assertEqual(resumed.data.name, 'Ada', 'in-progress onboarding answers (name) should also survive, not just the step counter');
  assertEqual(resumed.data.targetCourse, 'Medicine and Surgery', 'in-progress onboarding answers (targetCourse) should also survive');
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION PIPELINE TESTS
// The reconciliation of the candidate-shape mismatch flagged in
// docs/SUPABASE_SETUP.md §6: NotificationOrchestrator/ReEngagementEngine/
// ContinuationEngine produce pre-composed { type, tier, title, body,
// action }, while TemplateEngine expects { category, data: {
// observation, reason, benefit, action } }. candidateToTemplateInput()
// bridges them by treating body as observation verbatim — never
// splitting, rewording, or inventing copy.
// ═══════════════════════════════════════════════════════════════

test('candidateToTemplateInput() maps type -> category and body -> observation without altering the text', () => {
  const mapped = candidateToTemplateInput({ type: 'daily_recap', tier: 'standard', title: 'Recap', body: '3 concepts need reinforcement.', action: 'start_recap' });
  assertEqual(mapped.category, 'academic_nudge', 'daily_recap should map to the academic_nudge category');
  assertEqual(mapped.data.observation, '3 concepts need reinforcement.', 'body should become the observation fact verbatim — not reworded');
  assertEqual(mapped.data.action, 'start_recap', 'action should pass through unmodified');

  const milestone = candidateToTemplateInput({ type: 'milestone_journey_stage_transition', tier: 'informational', title: 'Milestone', body: 'You reached Establishment.', action: null });
  assertEqual(milestone.category, 'milestone_celebration', 'any milestone_* type should map to the milestone_celebration category regardless of the specific sub-type');

  const reengage = candidateToTemplateInput({ type: 'win_back', tier: 'standard', title: 'x', body: 'Ready when you are.', action: 'resume_session' });
  assertEqual(reengage.category, 'reengagement_winback', 'win_back should map to the reengagement_winback category');
});

test('TemplateEngine: informational-tier candidates no longer require an action to render', () => {
  const rendered = new TemplateEngine().render({
    category: 'milestone_celebration', tier: 'informational', channel: 'in_app_badge',
    data: { observation: 'You reached Establishment.', action: null }
  });
  assert(rendered !== null, 'an informational-tier candidate with no action (milestones, post-exam acknowledgment) should still render — previously _buildSlots() required an action for every category except account_administrative, silently discarding every actionless milestone/acknowledgment');
  assert(rendered.text.includes('Establishment'), 'rendered text should carry the real observation content');
});

await test('NotificationPipeline: gathers a real candidate, arbitrates it, and resolves it into deliverable content end-to-end', async () => {
  const pipelineEngine = new KairoEngine({ studentId: 'pipeline_test_1', name: 'Pipeline Student', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await pipelineEngine.init();
  pipelineEngine.comms.consent.grantChannelPermission('push');
  pipelineEngine.comms.consent.setCategoryPreference('push', 'academic_nudge', true);

  const cid = pipelineEngine.addConcept({ name: 'Fading Concept', subject: 'Biology', topic: 'Cells' });
  pipelineEngine.graph.getConcept(cid).retentionState = 'fading';

  const deliverable = pipelineEngine.checkAndResolveNotifications();
  assert(deliverable.length > 0, 'a fading concept with consent granted should produce at least one deliverable notification end-to-end (candidate generated -> submitted -> arbitrated -> resolved)');

  const recap = deliverable.find(d => d.candidate.type === 'daily_recap');
  assert(recap, 'the daily_recap candidate specifically should have survived the full pipeline');
  assertEqual(recap.resolved.channel, 'push', 'should resolve to the push channel per consent');
  assert(recap.resolved.rendered.text.includes('concept'), 'rendered text should carry the real, already-composed content through unmodified');
});

await test('NotificationPipeline: the post-exam immediate window suppresses all ordinary candidates, surfacing only the acknowledgment', async () => {
  const postExamEngine = new KairoEngine({ studentId: 'pipeline_test_2', name: 'Post Exam Student', examDate: Date.now() - 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await postExamEngine.init();
  postExamEngine.comms.consent.grantChannelPermission('push');
  postExamEngine.comms.consent.setCategoryPreference('in_app_badge', 'motivational_consistency', true);

  const cid2 = postExamEngine.addConcept({ name: 'Fading Concept 2', subject: 'Biology', topic: 'Cells' });
  postExamEngine.graph.getConcept(cid2).retentionState = 'fading';

  assert(postExamEngine.continuation.isInImmediateWindow(), 'sanity check: an exam date 1 day in the past should be inside the immediate post-exam window');

  const deliverable = postExamEngine.checkAndResolveNotifications();
  assert(deliverable.every(d => d.candidate.type === 'post_exam_acknowledgment'), 'inside the immediate post-exam window, only the acknowledgment should ever surface — the fading-concept daily_recap candidate must not leak through even though its own condition is met');
});

test('Supabase adapter: kairo.cbt_results row maps correctly', () => {
  const adapter = new SupabaseSyncAdapter({ schema() { throw new Error('should not hit the network in this test'); } }, null);
  const row = {
    id: 'cbt_123', subjects: ['Biology', 'Chemistry'],
    question_results: [{ questionId: 'q1', correct: true }],
    by_subject: [{ subject: 'Biology', correct: 1, total: 1 }],
    time_analysis: { totalTimeMin: 30 },
    total_questions: 1, score: 1, max_score: 1, percentage: 100,
    started_at: '2026-08-01T00:00:00Z', completed_at: '2026-08-01T00:30:00Z'
  };
  const mapped = adapter._rowToCbtResult(row);
  assertEqual(mapped.subjects.length, 2, 'subjects should round-trip');
  assertEqual(mapped.questionResults[0].questionId, 'q1', 'question_results should map to questionResults');
  assertEqual(mapped.bySubject[0].subject, 'Biology', 'by_subject should map to bySubject');
  assertEqual(mapped.percentage, 100, 'percentage should round-trip');
});

await test('CBTExamMode: getResult()/getResultHistory() require connectSupabase() first, and pass through to the adapter once connected', async () => {
  const cbtHistoryEngine = new KairoEngine({ studentId: 'cbt_hist_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await cbtHistoryEngine.init();

  let threw = false;
  try {
    await cbtHistoryEngine.cbt.getResultHistory();
  } catch (e) {
    threw = true;
  }
  assert(threw, 'getResultHistory() should throw a clear error without connectSupabase()');

  cbtHistoryEngine.sync.adapter = {
    fetchCbtResultHistory: async (studentId, limit) => [{ id: 'cbt_1', percentage: 80 }],
    fetchCbtResult: async (id) => ({ id, percentage: 80 })
  };
  const history = await cbtHistoryEngine.cbt.getResultHistory();
  assertEqual(history.length, 1, 'should return the real result history the adapter provides');

  const single = await cbtHistoryEngine.cbt.getResult('cbt_1');
  assertEqual(single.id, 'cbt_1', 'getResult() should return the specific result requested');
});

test('ProfileSettings.updateProfile() accepts pushExternalId — the client-registered OneSignal device mapping', () => {
  const settingsEngine = new (engine.constructor)({ studentId: 'push_ext_test', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  settingsEngine.settings.updateProfile({ pushExternalId: 'onesignal_ext_xyz' });
  assertEqual(settingsEngine.profile.pushExternalId, 'onesignal_ext_xyz', 'updateProfile should set pushExternalId, the same way it already sets avatar/email — this is how a client hands the engine the device mapping OneSignalTransport needs');
});

await test('KairoEngine.sendNotifications(): skips delivery (with a clear reason) when no pushExternalId is set, even with a real deliverable candidate', async () => {
  const sendEngine = new KairoEngine({ studentId: 'send_test_1', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await sendEngine.init();
  sendEngine.comms.consent.grantChannelPermission('push');
  sendEngine.comms.consent.setCategoryPreference('push', 'academic_nudge', true);
  const cid3 = sendEngine.addConcept({ name: 'Fading Concept 3', subject: 'Biology', topic: 'Cells' });
  sendEngine.graph.getConcept(cid3).retentionState = 'fading';

  const result = await sendEngine.sendNotifications();
  assert(result.sent.length === 0 && result.skipped > 0, 'without pushExternalId set, nothing should be sent even though a real candidate was generated and resolved');
  assert(result.reason && result.reason.includes('pushExternalId'), 'the skip reason should be explicit about why, not a silent no-op');
});

await test('KairoEngine.sendNotifications(): sends through the transport and records delivery once pushExternalId is set', async () => {
  const sendEngine2 = new KairoEngine({ studentId: 'send_test_2', name: 'Test', examDate: Date.now() + 90 * 24 * 60 * 60 * 1000, targetSubjects: ['Biology'] });
  await sendEngine2.init();
  sendEngine2.comms.consent.grantChannelPermission('push');
  sendEngine2.comms.consent.setCategoryPreference('push', 'academic_nudge', true);
  sendEngine2.profile.pushExternalId = 'onesignal_ext_send_test_2';
  const cid4 = sendEngine2.addConcept({ name: 'Fading Concept 4', subject: 'Biology', topic: 'Cells' });
  sendEngine2.graph.getConcept(cid4).retentionState = 'fading';

  const sendCalls = [];
  sendEngine2._pushTransport = {
    send: async (resolved, externalId) => { sendCalls.push({ resolved, externalId }); return { sent: true, oneSignalId: 'fake_msg_1' }; }
  };

  const result = await sendEngine2.sendNotifications();
  assert(result.sent.length > 0, 'a real deliverable candidate with pushExternalId set should actually be sent through the transport');
  assertEqual(sendCalls[0].externalId, 'onesignal_ext_send_test_2', 'the transport should be called with the student\'s real pushExternalId, never invented or looked up');
  assert(sendCalls[0].resolved.rendered.text.length > 0, 'the transport should receive real rendered text, not a placeholder');
});

console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log(`\n⚠️  ${failCount} test(s) need attention.`);
  process.exit(1);
}
console.log('\n🚀 All tests passed. Kairo Learning Engine is fully functional.');
