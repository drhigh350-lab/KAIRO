/**
 * Kairo QIM — QuestionLifecycle
 * Every question moves through defined stages before entering live rotation.
 * A wrongly-tagged or wrongly-keyed question corrupts every downstream system.
 */

export class QuestionLifecycle {
  constructor() {
    this.stages = ['imported', 'reviewed', 'tagged', 'linked', 'assigned', 'ready', 'live', 'deprecated'];
  }

  /**
   * Validate a question against all QA gates.
   * Returns { passed, stage, errors, warnings }.
   */
  validate(question) {
    const errors = [];
    const warnings = [];

    // Gate 1: Educational Quality
    if (!question.learningObjective || question.learningObjective.length < 10) {
      errors.push('Missing or vague learning objective');
    }
    if (!question.stem || question.stem.length < 20) {
      errors.push('Stem too short or missing');
    }

    // Gate 2: Accuracy
    if (!question.correctOption) {
      errors.push('No correct option marked');
    }
    if (!question.options || question.options.length < 2) {
      errors.push('Insufficient options');
    }
    const correctCount = question.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      errors.push(`Expected exactly 1 correct option, found ${correctCount}`);
    }

    // Gate 3: Clarity
    const ambiguousWords = ['maybe', 'sometimes', 'often', 'usually'];
    const hasAmbiguity = ambiguousWords.some(w => question.stem?.toLowerCase().includes(w));
    if (hasAmbiguity) {
      warnings.push('Stem contains potentially ambiguous language');
    }

    // Gate 4: Fairness
    if (!question.prerequisiteConcepts && question.difficultyRating > 2) {
      warnings.push('Advanced question has no prerequisites listed');
    }

    // Gate 5: Difficulty Validation
    if (question.difficultyRating < 1 || question.difficultyRating > 5) {
      errors.push('Difficulty rating out of range (1-5)');
    }
    if (!question.estimatedSolvingTimeSec || question.estimatedSolvingTimeSec < 5) {
      warnings.push('Unrealistic solving time (< 5 seconds)');
    }

    // Gate 6: Duplicate Detection (simplified)
    // In production, compare against existing question stems

    // Gate 7: Metadata Completeness
    const requiredFields = ['subject', 'topic', 'conceptsTested', 'difficultyRating', 'cognitiveLevel'];
    for (const field of requiredFields) {
      if (!question[field] || (Array.isArray(question[field]) && question[field].length === 0)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Gate 8: Explanation Quality
    if (!question.explanation || question.explanation.length < 30) {
      errors.push('Explanation too short or missing (< 30 chars)');
    }

    // Gate 9: Distractor Quality
    if (question.distractors.length === 0 && question.options.length > 1) {
      warnings.push('No distractor misconceptions mapped — error tagging will be reactive only');
    }
    const distractorCount = question.options.filter(o => !o.isCorrect).length;
    if (distractorCount < 3) {
      warnings.push(`Only ${distractorCount} distractors — 3+ recommended for UTME-style questions`);
    }

    // Gate 10: Syllabus Alignment
    if (!question.examBody) {
      warnings.push('No exam body specified');
    }

    const passed = errors.length === 0;
    const stage = passed ? 'ready' : 'tagged';

    return {
      passed,
      stage,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }

  /**
   * Promote a question to the next lifecycle stage.
   */
  promote(question) {
    const currentIndex = this.stages.indexOf(question.lifecycleState);
    if (currentIndex < 0 || currentIndex >= this.stages.length - 1) {
      return { success: false, reason: 'Already at final stage or invalid state' };
    }

    const validation = this.validate(question);
    if (!validation.passed && question.lifecycleState !== 'deprecated') {
      return { success: false, reason: 'QA gates not passed', validation };
    }

    const nextStage = this.stages[currentIndex + 1];
    question.lifecycleState = nextStage;

    return { success: true, newStage: nextStage, validation };
  }

  /**
   * Bulk validate a set of questions (e.g., after CSV import).
   */
  bulkValidate(questions) {
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const q of questions) {
      const result = this.validate(q);
      results.push({ questionId: q.id, ...result });
      if (result.passed) passed++;
      else failed++;
    }

    return {
      total: questions.length,
      passed,
      failed,
      passRate: Math.round((passed / questions.length) * 100),
      results
    };
  }

  /**
   * Deprecate a question that has quality issues in production.
   */
  deprecate(question, reason) {
    question.lifecycleState = 'deprecated';
    return {
      deprecated: true,
      reason,
      questionId: question.id,
      at: Date.now()
    };
  }
}
