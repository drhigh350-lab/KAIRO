/**
 * Kairo — AdaptiveDifficulty
 * Per-concept difficulty calibration, not a global "student level."
 */

import { RetentionState, SessionConstants } from "../utils/constants.js";
import { clamp } from "../utils/helpers.js";

export class AdaptiveDifficulty {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.sessionSoftening = false; // temporary pullback flag
  }

  /**
   * Determine the difficulty tier for the next question on a concept.
   * @param {ConceptNode} concept
   * @param {string} macroState
   * @returns {number} difficultyTier 1–5
   */
  selectDifficulty(concept, macroState = 'building') {
    let tier = 1;

    // Base tier from concept state
    switch (concept.retentionState) {
      case RetentionState.UNSEEN:
      case RetentionState.FORMING:
        tier = 1;
        break;
      case RetentionState.HELD:
        tier = 2 + Math.floor(concept.confidenceScore * 2); // 2–4
        break;
      case RetentionState.FADING:
        tier = 2; // review at moderate difficulty
        break;
      case RetentionState.REINFORCED:
        tier = 3 + Math.floor(concept.confidenceScore * 2); // 3–5
        break;
    }

    // Macro-state ceiling
    const ceiling = this._macroStateCeiling(macroState);
    tier = Math.min(tier, ceiling);

    // Session-level temporary pullback (fatigue detection)
    if (this.sessionSoftening) {
      tier = Math.max(1, tier - 1);
    }

    // Two consecutive guessed/slip in window → temporary pullback
    const recent = concept.attemptHistory.slice(-2);
    const recentTags = recent.map(a => a.errorTag);
    if (recentTags.includes('guessed') || recentTags.includes('careless_slip')) {
      const windowOk = recent.every(a =>
        Date.now() - a.timestamp < SessionConstants.DIFFICULTY_PULLBACK_WINDOW_MS
      );
      if (windowOk) {
        tier = Math.max(1, tier - 1);
      }
    }

    return clamp(Math.round(tier), 1, 5);
  }

  _macroStateCeiling(macroState) {
    switch (macroState) {
      case 'orienting':
      case 'recovering':
        return 2;
      case 'wavering':
        return 3;
      case 'building':
        return 4;
      case 'compounding':
      case 'peak_readiness':
        return 5;
      default:
        return 4;
    }
  }

  /**
   * Call when fatigue is detected to soften the rest of the session.
   */
  softenSession() {
    this.sessionSoftening = true;
  }

  resetSession() {
    this.sessionSoftening = false;
  }

  /**
   * Get a human-readable framing for the student.
   */
  explainTier(tier, conceptName) {
    const messages = {
      1: `Starting light with "${conceptName}" — building the foundation first.`,
      2: `Solidifying "${conceptName}" with standard practice.`,
      3: `"${conceptName}" is stepping up — you're ready for applied questions.`,
      4: `"${conceptName}" at challenge level — cross-concept and deeper reasoning.`,
      5: `Elite tier for "${conceptName}" — exam-pressure simulation. You've earned this.`
    };
    return messages[tier] || messages[1];
  }
}
