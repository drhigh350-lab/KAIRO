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
   * Get the misconception for a student's wrong answer, via the
   * questionId -> distractorMappings side-table below. Kept for
   * analyzeStudentPattern() and anything else built against it, but
   * nothing in the live student experience should call this directly —
   * mapDistractor() is the only thing that populates distractorMappings,
   * and nothing in production ever calls it. Real diagnosis for a live
   * attempt should go through diagnoseQuestion()/misconceptionsForQuestion()
   * below, which read the misconceptionId already authored on the
   * question's own distractors (Question §2.4) instead.
   */
  diagnose(questionId, selectedOption) {
    const mappings = this.distractorMappings.get(questionId);
    if (!mappings) return null;

    const misconceptionId = mappings[selectedOption];
    if (!misconceptionId) return null;

    return this.misconceptions.get(misconceptionId) || null;
  }

  /**
   * Get all misconceptions for a question (for explanation generation),
   * via the same legacy distractorMappings side-table as diagnose() above.
   * See misconceptionsForQuestion() for the path that reads real content.
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
   * Resolve a misconception id (as authored directly on a question's own
   * distractor data) against the catalog.
   */
  resolve(misconceptionId) {
    return this.misconceptions.get(misconceptionId) || null;
  }

  /**
   * Diagnose a wrong answer using the misconceptionId authored on the
   * question's own distractor data (Question.getMisconceptionForOption()),
   * not the distractorMappings side-table diagnose() reads — that table is
   * only ever populated by mapDistractor(), which nothing in production
   * calls, so diagnose() silently returns null for every real attempt.
   */
  diagnoseQuestion(question, selectedOption) {
    if (!question || typeof question.getMisconceptionForOption !== 'function') return null;
    const misconceptionId = question.getMisconceptionForOption(selectedOption);
    return misconceptionId ? this.resolve(misconceptionId) : null;
  }

  /**
   * All misconceptions authored across a question's distractors — the
   * question-object-based equivalent of getQuestionMisconceptions() above,
   * for "common misconceptions on this concept" (see LearnModule).
   */
  misconceptionsForQuestion(question) {
    if (!question) return [];
    return (question.distractors || [])
      .filter(d => d.misconceptionId)
      .map(d => ({ option: d.option, misconception: this.resolve(d.misconceptionId) }))
      .filter(m => m.misconception);
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

    // Rewritten in second person, present as diagnosis rather than
    // judgment — no "student", no "failed"/"wrong", no flat absolute
    // claims about what happened in someone else's head (Kairo Copy &
    // Communication Framework: frame a miss as information, never blame).
    // `name`/`description` are display copy only; `id` is the stable key
    // real seeded questions reference and stays unchanged.
    const defaults = [
      { id: 'memorized_not_understood', name: 'Familiar, Not Yet Flexible', category: 'retention', description: "You know this one when it's asked the usual way — it just needed to stretch further than you'd practiced it." },
      { id: 'rushed_under_pressure', name: 'Moved a Little Fast', category: 'execution', description: "A slower, closer read of the question would likely have caught this." },
      { id: 'guessed_no_reasoning', name: 'A Quick Guess', category: 'engagement', description: "This one has the shape of a guess more than a worked answer — worth going back and reasoning through properly." },
      { id: 'confused_similar_concepts', name: 'Mixed Up Two Similar Ideas', category: 'conceptual', description: "You picked the answer that's correct under a different, related rule — an easy mix-up." },
      { id: 'missing_prerequisite', name: 'A Gap Further Back', category: 'foundational', description: "This traces back to something earlier in the chain that's worth reinforcing first." },
      { id: 'misunderstood_terminology', name: 'A Term Read Differently', category: 'comprehension', description: "The idea is there — one specific term just landed differently than it was meant." },
      { id: 'sign_error', name: 'A Sign Slipped', category: 'careless', description: "Right approach — a plus or minus sign got away partway through." },
      { id: 'unit_conversion_error', name: 'A Unit Conversion Slipped', category: 'careless', description: "The setup was right — the units just didn't get converted before the calculation." },
      { id: 'formula_recall_error', name: 'A Different Formula', category: 'retention', description: "A different formula got pulled in here — worth a quick refresh on which one applies." },
      { id: 'arithmetic_slip', name: 'A Calculation Slip', category: 'careless', description: "Right method, right setup — just a small slip in the arithmetic." },
      { id: 'misread_graph', name: 'A Graph Read Differently', category: 'comprehension', description: "The chart or diagram gave a different reading than what it actually shows." },
      { id: 'overgeneralized_rule', name: 'A Rule Stretched Too Far', category: 'conceptual', description: "This rule holds — just not quite this far. It has a boundary worth knowing." }
    ];

    for (const d of defaults) lib.register(d);
    return lib;
  }
}
