/**
 * Kairo — OnboardingEngine
 * Addresses the #1 pain point from Robomed: students didn't understand what to do.
 * Simple, endearing, no decision fatigue. The system guides, the student follows.
 */

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
        body: "I'm going to ask you 5 short questions across your subjects. Not a test — just so I know where to begin. There are no wrong answers here.",
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

    // Generate personalized first session
    const plan = this.engine.startSession();

    return {
      seededConcepts: conceptsLoaded,
      diagnosticSummary: this._summarizeDiagnostic(),
      firstSession: plan,
      profile: this.engine.profile.toJSON()
    };
  }

  _summarizeDiagnostic() {
    const results = this.data.diagnosticResults || [];
    const correct = results.filter(r => r.correct).length;
    return {
      total: results.length,
      correct,
      accuracy: results.length > 0 ? Math.round((correct / results.length) * 100) : 0,
      message: correct >= 3
        ? "You have a solid foundation. We'll build from here."
        : "No worries — we'll start with the basics and move up steadily."
    };
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
