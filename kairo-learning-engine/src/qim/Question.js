/**
 * Kairo QIM — Question
 * A question is not an inert object. It is a diagnostic instrument.
 * Every field answers: "What does this question know, and what can it teach the system?"
 */

export class Question {
  constructor({
    // Identity
    id,

    // 2.1 Curriculum Placement
    subject,
    topic,
    subtopic,
    learningObjective,

    // 2.2 Concept Attachment
    conceptsTested = [],        // [{ conceptId, weight: 'primary'|'secondary' }]
    prerequisiteConcepts = [],

    // 2.3 Difficulty & Cognitive Load
    difficultyRating = 1,       // 1–5, calibrated empirically
    cognitiveLevel = 'recall',  // recall | application | analysis | synthesis
    estimatedSolvingTimeSec = 30,
    readingLoad = 'low',        // low | medium | high
    calculationLoad = 'none',   // none | light | moderate | heavy

    // 2.4 Diagnostic Fields
    distractors = [],           // [{ option, misconceptionId, explanation }]
    skillsAssessed = [],

    // 2.5 Provenance
    source = 'techmed_authored',
    year = null,
    examBody = 'JAMB',

    // 2.6 Relational Fields (populated by QuestionRelationshipGraph)
    relatedQuestionIds = [],

    // Content
    stem,
    options = [],               // [{ label, text, isCorrect }]
    correctOption,
    explanation,
    distractorRationale = null, // free-text "why other options are wrong", distinct from per-distractor.explanation above

    // QIM Runtime
    lifecycleState = 'imported', // imported | reviewed | tagged | linked | assigned | ready | live | deprecated
    empiricalStats = {          // updated from real attempt data
      totalAttempts: 0,
      correctCount: 0,
      avgResponseTimeMs: 0,
      distractorSelectionCounts: {} // option -> count
    }
  }) {
    this.id = id;
    this.subject = subject;
    this.topic = topic;
    this.subtopic = subtopic;
    this.learningObjective = learningObjective;
    this.conceptsTested = conceptsTested;
    this.prerequisiteConcepts = prerequisiteConcepts;
    this.difficultyRating = difficultyRating;
    this.cognitiveLevel = cognitiveLevel;
    this.estimatedSolvingTimeSec = estimatedSolvingTimeSec;
    this.readingLoad = readingLoad;
    this.calculationLoad = calculationLoad;
    this.distractors = distractors;
    this.skillsAssessed = skillsAssessed;
    this.source = source;
    this.year = year;
    this.examBody = examBody;
    this.relatedQuestionIds = relatedQuestionIds;
    this.stem = stem;
    this.options = options;
    this.correctOption = correctOption;
    this.explanation = explanation;
    this.distractorRationale = distractorRationale;
    this.lifecycleState = lifecycleState;
    this.empiricalStats = empiricalStats;
  }

  /**
   * Get the primary concept this question tests.
   */
  getPrimaryConcept() {
    return this.conceptsTested.find(c => c.weight === 'primary');
  }

  /**
   * Get all concept IDs this question touches.
   */
  getAllConceptIds() {
    return this.conceptsTested.map(c => c.conceptId);
  }

  /**
   * Get the misconception mapped to a specific wrong option.
   */
  getMisconceptionForOption(optionLabel) {
    const d = this.distractors.find(dist => dist.option === optionLabel);
    return d ? d.misconceptionId : null;
  }

  /**
   * Get explanation for why a specific option is wrong.
   */
  getDistractorExplanation(optionLabel) {
    const d = this.distractors.find(dist => dist.option === optionLabel);
    return d ? d.explanation : null;
  }

  /**
   * Tags on a specific wrong option — e.g. 'misread_trap' (the option a
   * student picks if they misread the question, not a subject error),
   * 'adjacent_rule' (a real rule from a neighboring concept applied
   * incorrectly here), 'final_step' (reachable only by getting everything
   * right except the last step of a calculation). Optional per-distractor
   * metadata (distractors[].tags), same shape as misconceptionId — powers
   * ErrorPatternClassifier's misread_question/misapplied_rule/
   * partial_understanding branches.
   */
  getDistractorTags(optionLabel) {
    const d = this.distractors.find(dist => dist.option === optionLabel);
    return d?.tags || [];
  }

  /**
   * Update empirical stats after an attempt.
   */
  recordAttempt({ correct, responseTimeMs, selectedOption }) {
    const s = this.empiricalStats;
    s.totalAttempts++;
    if (correct) s.correctCount++;

    // Update average response time
    s.avgResponseTimeMs = ((s.avgResponseTimeMs * (s.totalAttempts - 1)) + responseTimeMs) / s.totalAttempts;

    // Track distractor selection
    if (!correct && selectedOption) {
      s.distractorSelectionCounts[selectedOption] = (s.distractorSelectionCounts[selectedOption] || 0) + 1;
    }

    // Recalibrate difficulty if enough data
    if (s.totalAttempts >= 20) {
      const accuracy = s.correctCount / s.totalAttempts;
      // Override estimated difficulty with empirical
      if (accuracy < 0.3) this.difficultyRating = Math.min(5, this.difficultyRating + 1);
      else if (accuracy > 0.8) this.difficultyRating = Math.max(1, this.difficultyRating - 1);
    }
  }

  /**
   * Check if this question is appropriate for a student's current state.
   */
  isAppropriateFor(studentConceptStates, macroState) {
    // Check prerequisites are Held or Reinforced
    for (const prereqId of this.prerequisiteConcepts) {
      const state = studentConceptStates[prereqId];
      if (!state || (state !== 'held' && state !== 'reinforced')) {
        return { appropriate: false, reason: 'prerequisite_gap', missingPrereq: prereqId };
      }
    }

    // Check macro-state ceiling
    const macroCeiling = { orienting: 2, recovering: 2, wavering: 3, building: 4, compounding: 5, peak_readiness: 5 };
    if (this.difficultyRating > (macroCeiling[macroState] || 4)) {
      return { appropriate: false, reason: 'difficulty_too_high' };
    }

    return { appropriate: true };
  }

  toJSON() {
    return {
      id: this.id,
      subject: this.subject,
      topic: this.topic,
      subtopic: this.subtopic,
      learningObjective: this.learningObjective,
      conceptsTested: this.conceptsTested,
      prerequisiteConcepts: this.prerequisiteConcepts,
      difficultyRating: this.difficultyRating,
      cognitiveLevel: this.cognitiveLevel,
      estimatedSolvingTimeSec: this.estimatedSolvingTimeSec,
      readingLoad: this.readingLoad,
      calculationLoad: this.calculationLoad,
      distractors: this.distractors,
      skillsAssessed: this.skillsAssessed,
      source: this.source,
      year: this.year,
      examBody: this.examBody,
      relatedQuestionIds: this.relatedQuestionIds,
      stem: this.stem,
      options: this.options,
      correctOption: this.correctOption,
      explanation: this.explanation,
      distractorRationale: this.distractorRationale,
      lifecycleState: this.lifecycleState,
      empiricalStats: this.empiricalStats
    };
  }

  static fromJSON(data) {
    return new Question(data);
  }
}
