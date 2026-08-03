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
        // 'Use of English' — JAMB's actual subject name, matching the exact
        // string seeded in kairo.questions/kairo.concepts. A bare 'English'
        // here matched nothing: loadContentCatalog() filters by exact
        // subject-string equality, so a student picking "English" got 0
        // concepts even though Use of English content exists. All 8 options
        // stay selectable (not trimmed to the 4 currently-seeded subjects) —
        // UTME subject combinations genuinely vary by course (e.g. Law needs
        // Government/Literature), so removing options would break course
        // paths the onboarding 'goal' step already offers. Mathematics/
        // Government/Economics/Literature still seed 0 concepts today
        // (no content yet) — a real content gap, not something this fix
        // papers over; loadContentCatalog() already degrades to that
        // cleanly rather than crashing.
        options: ['Use of English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Government', 'Economics', 'Literature'],
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
    const { subjects, targetCourse, examDate, diagnosticResults } = this.data;

    const { conceptsLoaded } = await this.engine.loadContentCatalog({ subjects });

    // Process diagnostic results into the knowledge graph
    for (const result of diagnosticResults || []) {
      if (result.conceptId) {
        this.engine.submitAnswer({
          conceptId: result.conceptId,
          correct: result.correct,
          responseTimeMs: result.responseTimeMs || 15000,
          selectedOption: result.selectedOption,
          correctOption: result.correctOption,
          questionId: result.questionId,
          questionDifficulty: 1
        });
      }
    }

    // Set profile data
    this.engine.profile.name = this.data.name;
    this.engine.profile.targetCourse = targetCourse;
    this.engine.profile.targetUniversity = this.data.targetUniversity;
    this.engine.profile.examDate = examDate ? new Date(examDate).getTime() : null;
    this.engine.profile.targetSubjects = subjects || [];

    // Generate personalized first session
    const plan = this.engine.startSession();

    return {
      seededConcepts: conceptsLoaded,
      diagnosticSummary: this._summarizeDiagnostic(),
      firstSession: plan,
      profile: this.engine.profile.toJSON()
    };
  }

  /**
   * The 'diagnostic' step (type: 'diagnostic_quiz') previously had no
   * code path that selected real questions to ask — submitStep() only
   * ever accepted already-answered {conceptId, correct, responseTimeMs}
   * input. A caller now calls this once subjects are known (the
   * 'subjects' step must already be submitted) to get real, currently-
   * live questions to actually render for the quiz.
   *
   * Spread as evenly as possible across the student's chosen subjects,
   * biased toward the easier end of the seeded difficulty range —
   * this is a first read before any attempt history exists, not a
   * challenge, so the hardest content in the bank isn't the right
   * sample. Requires connectSupabase() (loadContentCatalog() needs a
   * real adapter) — same requirement buildInitialPlan() already has.
   */
  async getDiagnosticQuestions(count = 5) {
    const subjects = this.data.subjects || [];
    if (subjects.length === 0) {
      throw new Error('getDiagnosticQuestions() requires the "subjects" step to already be submitted.');
    }

    await this.engine.loadContentCatalog({ subjects });

    const bySubject = (subject) => Array.from(this.engine.questionGraph.questions.values())
      .filter(q => q.subject === subject && q.lifecycleState === 'live')
      .sort((a, b) => a.difficultyRating - b.difficultyRating); // easiest first — a diagnostic, not a challenge

    const perSubject = Math.max(1, Math.floor(count / subjects.length));
    const picked = [];
    const pickedIds = new Set();
    for (const subject of subjects) {
      for (const q of bySubject(subject).slice(0, perSubject)) {
        picked.push(q);
        pickedIds.add(q.id);
      }
    }

    // Rounding (count not evenly divisible by subjects.length) can leave
    // a shortfall — top up from any chosen subject's easiest remaining
    // questions rather than under-filling the quiz.
    if (picked.length < count) {
      const remaining = subjects
        .flatMap(subject => bySubject(subject))
        .filter(q => !pickedIds.has(q.id));
      for (const q of remaining) {
        if (picked.length >= count) break;
        picked.push(q);
        pickedIds.add(q.id);
      }
    }

    return picked.slice(0, count).map(q => this.engine._flattenQuestion(q));
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
    if (data) {
      ob.step = data.step || 0;
      ob.state = data.state || 'not_started';
      ob.data = data.data || ob.data;
    }
    return ob;
  }
}
