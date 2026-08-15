/**
 * Kairo — ErrorPatternClassifier
 * Determines WHY a student got something wrong, not just THAT they did.
 * 
 * This is the single biggest differentiator from standard CBT platforms.
 */

import { ErrorTag, RetentionState } from "../utils/constants.js";

export class ErrorPatternClassifier {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.baselines = studentProfile.responseTimeBaselines || {}; // per-concept-type baseline
  }

  /**
   * Classify an incorrect answer.
   * @param {Object} params
   *   - concept: ConceptNode
   *   - selectedOption: string/number
   *   - correctOption: string/number
   *   - responseTimeMs: number
   *   - question: { id, distractorTags, difficulty, type }
   *   - sessionContext: { questionsSoFar, avgSessionTime }
   * @returns {ErrorTag}
   */
  classify({
    concept,
    selectedOption,
    correctOption,
    responseTimeMs,
    question = {},
    sessionContext = {}
  }) {
    const baseline = this._getBaseline(concept);
    const ratio = baseline > 0 ? responseTimeMs / baseline : 1;
    // Tags on the option the student actually picked, not the whole
    // question — a question having *some* tagged trap on a different
    // option a student didn't pick shouldn't classify their answer.
    // Previously this was a whole-question distractorTags array plus a
    // condition (`selectedOption === correctOption + '_trap'`) that no
    // real option label could ever satisfy, so this branch — and
    // adjacent_rule/final_step below it — were permanently unreachable
    // regardless of any content authoring, independent of the fact that
    // nothing populated distractorTags either.
    const selectedTags = this._selectedDistractorTags(question, selectedOption);

    // 1. GUESSED: extremely fast, no reasoning time
    if (responseTimeMs < 3000 && ratio < 0.3) {
      return ErrorTag.GUESSED;
    }

    // 2. MISREAD_QUESTION: the picked option is a known misread trap for
    // this specific question.
    if (selectedTags.includes('misread_trap')) {
      return ErrorTag.MISREAD_QUESTION;
    }

    // 3. CARELESS_SLIP: fast but not instant, concept is Held/Reinforced historically
    const isStrongHistory = concept.retentionState === RetentionState.HELD ||
                            concept.retentionState === RetentionState.REINFORCED;
    if (isStrongHistory && ratio < 0.6 && responseTimeMs > 3000) {
      return ErrorTag.CARELESS_SLIP;
    }

    // 4. MISAPPLIED_RULE: the picked option matches a real rule from an
    // adjacent concept, applied where it doesn't belong.
    if (selectedTags.includes('adjacent_rule')) {
      return ErrorTag.MISAPPLIED_RULE;
    }

    // 5. PARTIAL_UNDERSTANDING: a calculation-heavy question, wrong at a
    // tagged final step. Question has no explicit "multi_step" type field
    // (the previous question.type === 'multi_step' check matched nothing
    // real) — calculationLoad is the actual signal on Question closest to
    // "this is a multi-step calculation," so it stands in for it here.
    if (question.calculationLoad && question.calculationLoad !== 'none' && selectedTags.includes('final_step')) {
      return ErrorTag.PARTIAL_UNDERSTANDING;
    }

    // 6. CONCEPTUAL_GAP: everything else, especially slow wrong answers on weak concepts
    if (concept.retentionState === RetentionState.UNSEEN ||
        concept.retentionState === RetentionState.FORMING ||
        ratio > 1.5) {
      return ErrorTag.CONCEPTUAL_GAP;
    }

    // Default fallback
    return ErrorTag.CONCEPTUAL_GAP;
  }

  /** Resolves tags for the option a student picked — works against a real Question instance (getDistractorTags()) or a plain test-double object carrying its own distractors array. */
  _selectedDistractorTags(question, selectedOption) {
    if (typeof question.getDistractorTags === 'function') {
      return question.getDistractorTags(selectedOption) || [];
    }
    const d = (question.distractors || []).find(dist => dist.option === selectedOption);
    return d?.tags || [];
  }

  _getBaseline(concept) {
    // Use student's personal baseline for this subject-topic, or global default
    const key = `${concept.subject}:${concept.topic}`;
    return this.baselines[key] || 20000; // default 20s
  }

  /**
   * Update baselines after each correct answer (only correct answers establish baselines).
   */
  updateBaseline(concept, responseTimeMs) {
    const key = `${concept.subject}:${concept.topic}`;
    const current = this.baselines[key] || responseTimeMs;
    // Exponential moving average
    this.baselines[key] = current * 0.7 + responseTimeMs * 0.3;
    this.profile.responseTimeBaselines = this.baselines;
  }

  /**
   * Detect gaming patterns: suspiciously fast 100% on previously-Fading concepts.
   * Returns confidence that this is genuine (0–1).
   */
  detectGaming(concept, correct, responseTimeMs) {
    if (!correct) return 1.0; // wrong answers are always treated honestly
    if (concept.retentionState !== RetentionState.FADING) return 1.0;

    const baseline = this._getBaseline(concept);
    if (responseTimeMs < baseline * 0.2) {
      // Too fast for a concept they were supposedly forgetting
      return 0.3; // low confidence — don't promote to Reinforced yet
    }
    return 1.0;
  }
}
