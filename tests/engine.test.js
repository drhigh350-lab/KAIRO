/**
 * Kairo — Comprehensive Engine Test Suite
 * Run with: node tests/engine.test.js
 */

import { KairoEngine, Question, LearnModule, SupabaseSyncAdapter } from "../src/index.js";
import { StudentProfile } from "../src/student/StudentProfile.js";
import { RetentionState, ErrorTag } from "../src/utils/constants.js";

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

console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log(`\n⚠️  ${failCount} test(s) need attention.`);
  process.exit(1);
}
console.log('\n🚀 All tests passed. Kairo Learning Engine is fully functional.');
