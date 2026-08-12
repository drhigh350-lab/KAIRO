/**
 * Kairo — DecayModel
 * Personalized forgetting curves per concept and per student.
 */

import { DecayConstants, RetentionState } from "../utils/constants.js";
import { clamp, daysBetween, isExamProximity } from "../utils/helpers.js";

export class DecayModel {
  constructor(studentProfile) {
    this.studentProfile = studentProfile;
  }

  /**
   * Compute the ideal next review timestamp for a concept.
   * @param {ConceptNode} concept
   * @param {number|null} examDate
   */
  computeNextReview(concept, examDate = null) {
    const now = Date.now();
    const baseIntervalDays = this._baseInterval(concept);
    let intervalDays = baseIntervalDays;

    // Personal decay adjustment
    intervalDays /= concept.personalDecayRate;

    // Exam proximity override: compress intervals
    if (examDate && isExamProximity(examDate)) {
      intervalDays *= DecayConstants.EXAM_PROXIMITY_COMPRESSION;
    }

    // Clamp
    intervalDays = clamp(
      intervalDays,
      DecayConstants.MIN_INTERVAL_DAYS,
      DecayConstants.MAX_INTERVAL_DAYS
    );

    const nextReview = now + (intervalDays * 24 * 60 * 60 * 1000);
    concept.nextReviewEstimate = nextReview;
    return nextReview;
  }

  _baseInterval(concept) {
    // Core spaced-repetition logic
    // More reinforced cycles = longer intervals
    const cycleMultiplier = Math.pow(2, concept.reinforcedCycles);
    const difficultyDivisor = concept.difficultyWeight;
    return (DecayConstants.BASE_DECAY_HALF_LIFE_DAYS * cycleMultiplier) / difficultyDivisor;
  }

  /**
   * Recalculate decayEstimate for all nodes (call periodically, e.g., on app open).
   */
  refreshAll(graph) {
    for (const node of graph.nodes.values()) {
      node._recalculateDecay();
    }
  }

  /**
   * Get all concepts whose nextReviewEstimate has passed.
   */
  getDueConcepts(graph, now = Date.now()) {
    return Array.from(graph.nodes.values()).filter(n => {
      if (!n.nextReviewEstimate) return n.retentionState !== RetentionState.UNSEEN;
      return n.nextReviewEstimate <= now;
    });
  }
}
