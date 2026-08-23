/**
 * Kairo — OnboardingEngine
 * Addresses the #1 pain point from Robomed: students didn't understand what to do.
 * Simple, endearing, no decision fatigue. The system guides, the student follows.
 */

import { StreakConstants, KairoPointsAwards } from "../utils/constants.js";

export class OnboardingEngine {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
    this.step = 0;
    this.state = 'not_started'; // not_started | in_progress | complete
    this.data = {
      name: null,
      targetCourse: null,
      targetUniversity: null,
      weakSubjects: [],
      strongSubjects: [],
      studyHoursPerWeek: null,
      examDate: null,
      diagnosticResults: []
    };
  }

  /**
   * Get the next onboarding step. Never asks the student to figure it out alone.
   */
  getNextStep() {
    const steps = [
      {
        id: 'welcome',
        type: 'message',
        title: 'Welcome to Kairo',
        body: "I'm Kai, your study companion. I'm going to understand where you are and build a path forward with you. No pressure — just clarity.",
        action: 'continue',
        kaiMessage: "Let's start with something simple."
      },
      {
        id: 'name',
        type: 'input',
        field: 'name',
        title: 'What should I call you?',
        placeholder: 'Your first name',
        action: 'save_and_continue'
      },
      {
        id: 'goal',
        type: 'choice',
        field: 'targetCourse',
        title: 'What are you preparing for?',
        subtitle: 'This helps me recommend the right topics and difficulty.',
        options: [
          'Medicine and Surgery',
          'Nursing',
          'Pharmacy',
          'Medical Laboratory Science',
          'Engineering',
          'Computer Science',
          'Law',
          'Other Competitive Course',
          'Not sure yet'
        ],
        action: 'save_and_continue'
      },
      {
        id: 'exam_date',
        type: 'date',
        field: 'examDate',
        title: 'When is your UTME?',
        subtitle: "If you don't know exactly, guess close. I'll adjust as we go.",
        action: 'save_and_continue'
      },
      {
        id: 'subjects',
        type: 'multi_choice',
        field: 'subjects',
        title: 'Which subjects are you taking?',
        options: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Government', 'Economics', 'Literature'],
        action: 'save_and_continue'
      },
      {
        id: 'diagnostic_intro',
        type: 'message',
        title: 'Quick Check-In',
        body: "Let's find out exactly what you already know — and what needs work. 5 quick questions, no wrong answers.",
        action: 'start_diagnostic'
      },
      {
        id: 'diagnostic',
        type: 'diagnostic_quiz',
        count: 5,
        action: 'process_diagnostic'
      },
      {
        id: 'results',
        type: 'message',
        title: "Here's what I noticed",
        action: 'show_plan'
      },
      {
        id: 'first_session',
        type: 'action',
        title: 'Your first session is ready',
        body: "I've built a short practice set based on what I learned about you. It's 10 questions — about 10 minutes.",
        action: 'start_first_session'
      }
    ];

    if (this.step >= steps.length) {
      this.state = 'complete';
      return { complete: true, message: 'Onboarding complete. Welcome to Kairo.' };
    }

    return steps[this.step];
  }

  submitStep(input) {
    const step = this.getNextStep();
    if (step.complete) return step;

    // Save data
    if (step.field) {
      this.data[step.field] = input;
    }

    // Special handling
    if (step.id === 'diagnostic') {
      this.data.diagnosticResults = input; // array of {conceptId, correct, responseTimeMs}
    }

    this.step++;
    return this.getNextStep();
  }

  /**
   * After diagnostic, generate the student's initial knowledge map.
   * Concepts come from the real kairo.concepts/kairo.questions catalog
   * (loadContentCatalog(), requires connectSupabase() to have already run —
   * Kairo requires an account from first visit) — previously this seeded a
   * fictional 5-topic-per-subject stub ("Cell Biology Fundamentals" etc.)
   * with a fake questionPoolIds placeholder that matched nothing real, so
   * a student's very first knowledge map could never surface an actual
   * seeded question. A subject with no seeded content yet simply seeds 0
   * concepts here rather than fabricating placeholder ones.
   */
  async buildInitialPlan() {
    const { subjects, targetCourse, examDate } = this.data;

    const { conceptsLoaded } = await this.engine.loadContentCatalog({ subjects });

    // Diagnostic answers are recorded live, one submitAnswer() call per
    // question as the student actually answers it (see the app's
    // submitDiagnosticAnswer()) — this used to also replay every answer
    // here in bulk, which double-recorded each attempt (once live, once
    // again here) and skewed the very first retention-state/confidence
    // numbers a student's knowledge map ever gets. this.data.diagnosticResults
    // is still read directly by _summarizeDiagnostic() below for its tally.

    // Set profile data
    this.engine.profile.name = this.data.name;
    this.engine.profile.targetCourse = targetCourse;
    this.engine.profile.targetUniversity = this.data.targetUniversity;
    this.engine.profile.examDate = examDate ? new Date(examDate).getTime() : null;
    this.engine.profile.targetSubjects = subjects || [];
    // The one durable "has this student actually taken the diagnostic"
    // signal — set only here, at the genuine end of the flow, so it stays
    // false even if profile fields above get saved early (e.g. right
    // after the "About You" step, before the diagnostic runs) elsewhere
    // in the flow. A route guard checks this, not targetSubjects, so
    // dashboard access stays blocked until the diagnostic is really done.
    this.engine.profile.diagnosticCompleted = true;

    // First Streak Freeze, earned once, right here — the one genuine
    // "onboarding complete" moment (see the comment on diagnosticCompleted
    // above). Capped by MomentumStreak.earnFreeze() itself, so calling this
    // again (e.g. a retried/duplicate buildInitialPlan()) can never push a
    // student past FREEZE_CAPACITY.
    this.engine.streak.earnFreeze(StreakConstants.FREEZE_EARNED_ON_ONBOARDING);

    // Flat, one-time Kairo Points welcome bonus — same shape as every other
    // session-completion award (endSession()/CBTExamMode.finish()/
    // RapidFireEngine.finish() all call levelSystem.update() exactly once).
    // correctCount is 0 here: diagnostic answers already went through
    // submitAnswer() live as the student answered each question, and
    // submitAnswer() never itself calls levelSystem.update() — CORRECT_ANSWER
    // points are only ever credited at session completion, and the
    // diagnostic isn't a scored session, so this call can't double-pay them.
    const levelUpdate = this.engine.levelSystem.update(0, KairoPointsAwards.ONBOARDING_BONUS);

    // Generate personalized first session
    const plan = this.engine.startSession();

    return {
      seededConcepts: conceptsLoaded,
      diagnosticSummary: this._summarizeDiagnostic(),
      pointsEarned: levelUpdate.pointsEarned,
      totalPoints: levelUpdate.totalPoints,
      firstSession: plan,
      profile: this.engine.profile.toJSON()
    };
  }

  /**
   * Three tiers by real accuracy, not a single pass/fail cutoff — each
   * framed as diagnosis rather than judgment (Failure/Discouragement and
   * Confidence frameworks: a low score is useful data, not a verdict).
   * Average response time is a light secondary signal, only surfaced when
   * it's genuinely fast alongside a strong result — with just 5 questions,
   * pace alone isn't reliable enough to drive the message on its own.
   */
  _summarizeDiagnostic() {
    const results = this.data.diagnosticResults || [];
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgResponseTimeMs = total > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / total)
      : 0;
    const fastPace = avgResponseTimeMs > 0 && avgResponseTimeMs < 8000;

    let message;
    if (accuracy >= 80) {
      message = fastPace
        ? "Strong start, and quick too. Kairo will move fast and keep challenging you."
        : "Strong start. Kairo will move fast and keep challenging you.";
    } else if (accuracy >= 40) {
      message = "You've got a real foundation here, with a few clear gaps. That's exactly what Kairo needs to build your plan.";
    } else {
      message = `A ${correct}/${total} right now is actually useful — it shows exactly where to focus before the exam. Let's fix the biggest gap first.`;
    }

    return { total, correct, accuracy, avgResponseTimeMs, message };
  }

  isComplete() {
    return this.state === 'complete';
  }

  toJSON() {
    return {
      step: this.step,
      state: this.state,
      data: this.data
    };
  }

  static fromJSON(data, engine) {
    const ob = new OnboardingEngine(engine);
    ob.step = data.step || 0;
    ob.state = data.state || 'not_started';
    ob.data = data.data || ob.data;
    return ob;
  }
}
