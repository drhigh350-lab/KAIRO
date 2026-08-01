/**
 * Kairo QIM — MisconceptionLibrary
 * Pre-analyzed distractor misconceptions. A wrong answer is a diagnostic event,
 * not just a scoring event. Each distractor carries a known misconception mapping.
 */

export class MisconceptionLibrary {
  constructor() {
    this.misconceptions = new Map(); // id -> { id, name, description, category, commonInSubjects }
    this.distractorMappings = new Map(); // questionId -> { option -> misconceptionId }
  }

  /**
   * Register a misconception type.
   */
  register({ id, name, description, category, commonInSubjects = [] }) {
    this.misconceptions.set(id, { id, name, description, category, commonInSubjects });
  }

  /**
   * Map a distractor to a misconception for a specific question.
   */
  mapDistractor(questionId, optionLabel, misconceptionId) {
    if (!this.distractorMappings.has(questionId)) {
      this.distractorMappings.set(questionId, {});
    }
    this.distractorMappings.get(questionId)[optionLabel] = misconceptionId;
  }

  /**
   * Get the misconception for a student's wrong answer.
   */
  diagnose(questionId, selectedOption) {
    const mappings = this.distractorMappings.get(questionId);
    if (!mappings) return null;

    const misconceptionId = mappings[selectedOption];
    if (!misconceptionId) return null;

    return this.misconceptions.get(misconceptionId) || null;
  }

  /**
   * Get all misconceptions for a question (for explanation generation).
   */
  getQuestionMisconceptions(questionId) {
    const mappings = this.distractorMappings.get(questionId);
    if (!mappings) return [];

    return Object.entries(mappings).map(([option, misconceptionId]) => ({
      option,
      misconception: this.misconceptions.get(misconceptionId)
    })).filter(m => m.misconception);
  }

  /**
   * Check if a misconception pattern recurs across concepts for a student.
   * This is the accumulated profile that lets Kai say "I noticed..." with evidence.
   */
  analyzeStudentPattern(studentAttempts) {
    // studentAttempts: [{ questionId, selectedOption, conceptId, timestamp }]
    const misconceptionCounts = {};
    const byConcept = {};

    for (const attempt of studentAttempts) {
      if (!attempt.selectedOption || attempt.correct) continue;

      const diag = this.diagnose(attempt.questionId, attempt.selectedOption);
      if (!diag) continue;

      misconceptionCounts[diag.id] = (misconceptionCounts[diag.id] || 0) + 1;

      if (!byConcept[diag.id]) byConcept[diag.id] = new Set();
      byConcept[diag.id].add(attempt.conceptId);
    }

    // Find recurring misconceptions across multiple concepts
    const recurring = Object.entries(misconceptionCounts)
      .filter(([id, count]) => count >= 2 && byConcept[id].size >= 2)
      .map(([id, count]) => ({
        misconception: this.misconceptions.get(id),
        count,
        affectedConcepts: [...byConcept[id]]
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalMisconceptions: Object.keys(misconceptionCounts).length,
      recurring,
      dominant: recurring[0] || null
    };
  }

  /**
   * Seed the library with common UTME misconception categories.
   */
  static seedDefaults() {
    const lib = new MisconceptionLibrary();

    const defaults = [
      { id: 'memorized_not_understood', name: 'Memorized, Not Understood', category: 'retention', description: 'Can reproduce fact/formula but cannot apply when wording changes.' },
      { id: 'rushed_under_pressure', name: 'Rushed Under Time Pressure', category: 'execution', description: 'Error would not occur if student re-read the question carefully.' },
      { id: 'guessed_no_reasoning', name: 'Guessed — No Real Reasoning', category: 'engagement', description: 'Response pattern inconsistent with genuine reasoning.' },
      { id: 'confused_similar_concepts', name: 'Confused Similar Concepts', category: 'conceptual', description: 'Wrong option corresponds to answer correct under an adjacent, different rule.' },
      { id: 'missing_prerequisite', name: 'Missing Prerequisite Knowledge', category: 'foundational', description: 'Error consistent with gap further down the dependency chain.' },
      { id: 'misunderstood_terminology', name: 'Misunderstood Terminology', category: 'comprehension', description: 'Misread what a specific term means, not the underlying science.' },
      { id: 'sign_error', name: 'Sign Error', category: 'careless', description: 'Correct approach but lost track of positive/negative signs.' },
      { id: 'unit_conversion_error', name: 'Unit Conversion Error', category: 'careless', description: 'Failed to convert units correctly before calculating.' },
      { id: 'formula_recall_error', name: 'Formula Recall Error', category: 'retention', description: 'Used wrong formula or forgot formula entirely.' },
      { id: 'arithmetic_slip', name: 'Arithmetic Slip', category: 'careless', description: 'Correct method but simple calculation error.' },
      { id: 'misread_graph', name: 'Misread Graph/Diagram', category: 'comprehension', description: 'Misinterpreted visual data representation.' },
      { id: 'overgeneralized_rule', name: 'Overgeneralized Rule', category: 'conceptual', description: 'Applied a rule beyond its valid domain.' }
    ];

    for (const d of defaults) lib.register(d);
    return lib;
  }
}
