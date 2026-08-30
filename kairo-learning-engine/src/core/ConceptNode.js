/**
 * Kairo — ConceptNode
 * The atomic unit of the knowledge graph. Every testable idea is a ConceptNode.
 */

import { RetentionState, DecayConstants, ErrorTag } from "../utils/constants.js";
import { clamp, daysBetween } from "../utils/helpers.js";

export class ConceptNode {
  constructor({
    id,
    name,
    subject,
    topic,
    subtopic,
    difficultyWeight = 1.0,      // 0.5 = easy fact, 2.0 = abstract multi-step
    dependencyIds = [],           // prerequisite concept IDs
    questionPoolIds = []
  }) {
    this.id = id;
    this.name = name;
    this.subject = subject;
    this.topic = topic;
    this.subtopic = subtopic;
    this.difficultyWeight = difficultyWeight;
    this.dependencyIds = dependencyIds;
    this.questionPoolIds = questionPoolIds;

    // Dynamic per-student state
    this.retentionState = RetentionState.UNSEEN;
    this.confidenceScore = 0;           // 0–1, inferred
    this.lastSeenAt = null;
    this.decayEstimate = 0;             // 0–1, current predicted retention strength
    this.nextReviewEstimate = null;       // timestamp
    this.attemptHistory = [];             // {correct, responseTimeMs, timestamp, errorTag, questionId}
    this.errorPatternTags = new Map();    // tag -> count
    this.reinforcedCycles = 0;            // how many Fading→Reinforced transitions survived
    this.personalDecayRate = 1.0;         // multiplier relative to base (1.0 = average)
    // Sticky once true — unlike retentionState (which can fall back through
    // Fading/Forming later), this records that Held was genuinely reached at
    // least once. EliteScore's retention points read this instead of the
    // live retentionState so a later decay can't retroactively erase points
    // already earned for a real, past achievement.
    this.everReachedHeld = false;
  }

  /**
   * Record a new attempt and update internal state.
   * @param {Object} attempt — {correct, responseTimeMs, timestamp, errorTag, questionId, difficulty}
   */
  recordAttempt(attempt) {
    this.attemptHistory.push(attempt);
    this.lastSeenAt = attempt.timestamp;

    // Update error pattern frequency
    if (attempt.errorTag) {
      this.errorPatternTags.set(
        attempt.errorTag,
        (this.errorPatternTags.get(attempt.errorTag) || 0) + 1
      );
    }

    // State transitions
    this._updateState(attempt);
    this._updateConfidence();
    this._recalculateDecay();
  }

  _updateState(attempt) {
    const { correct, errorTag } = attempt;

    switch (this.retentionState) {
      case RetentionState.UNSEEN:
        this.retentionState = RetentionState.FORMING;
        break;

      case RetentionState.FORMING:
        if (correct && this._recentAccuracy() >= DecayConstants.HELD_CONFIDENCE_THRESHOLD) {
          this.retentionState = RetentionState.HELD;
          this.everReachedHeld = true;
        }
        break;

      case RetentionState.HELD:
        if (!correct) {
          // Was assumed Held but got it wrong — decay model was wrong
          this.retentionState = RetentionState.FADING;
          this.personalDecayRate = Math.min(2.0, this.personalDecayRate * 1.15);
        }
        break;

      case RetentionState.FADING:
        if (correct) {
          this.retentionState = RetentionState.REINFORCED;
          this.reinforcedCycles++;
          this.personalDecayRate = Math.max(0.5, this.personalDecayRate * 0.9);
        } else if (errorTag === ErrorTag.CONCEPTUAL_GAP) {
          // Genuine gap, drop to Forming for re-teach
          this.retentionState = RetentionState.FORMING;
        }
        break;

      case RetentionState.REINFORCED:
        if (!correct) {
          // Even Reinforced can decay; go back to Fading, not all the way
          this.retentionState = RetentionState.FADING;
        }
        break;
    }
  }

  _updateConfidence() {
    // Confidence = weighted accuracy + consistency + speed relative to baseline
    const recent = this.attemptHistory.slice(-10);
    if (recent.length === 0) {
      this.confidenceScore = 0;
      return;
    }

    const accuracy = recent.filter(a => a.correct).length / recent.length;

    // Consistency: low variance in response times suggests mastery
    const times = recent.map(a => a.responseTimeMs).filter(t => t > 0);
    let consistency = 0.5;
    if (times.length >= 3) {
      const mean = times.reduce((a, b) => a + b, 0) / times.length;
      const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
      consistency = clamp(1 - cv, 0, 1);
    }

    // Varied framing bonus: if attempts came from different questions, boost confidence
    const uniqueQuestions = new Set(recent.map(a => a.questionId)).size;
    const framingBonus = Math.min(0.1, (uniqueQuestions / recent.length) * 0.1);

    this.confidenceScore = clamp(
      accuracy * 0.6 + consistency * 0.3 + framingBonus,
      0, 1
    );
  }

  _recalculateDecay() {
    // Base decay rate modified by personal rate, difficulty, and reinforced cycles
    const baseHalfLife = DecayConstants.BASE_DECAY_HALF_LIFE_DAYS;
    const recallBonus = Math.pow(1.3, this.reinforcedCycles); // each cycle slows decay
    const difficultyPenalty = this.difficultyWeight;
    const adjustedHalfLife = (baseHalfLife * recallBonus) / (this.personalDecayRate * difficultyPenalty);

    const daysSinceLastSeen = this.lastSeenAt
      ? daysBetween(Date.now(), this.lastSeenAt)
      : 0;

    // Exponential decay: R = e^(-λt)
    const lambda = Math.log(2) / Math.max(0.5, adjustedHalfLife);
    this.decayEstimate = Math.exp(-lambda * daysSinceLastSeen);

    // Auto-transition to Fading if decay drops below threshold
    if (this.retentionState === RetentionState.HELD && this.decayEstimate < DecayConstants.FADING_DECAY_THRESHOLD) {
      this.retentionState = RetentionState.FADING;
    }
  }

  _recentAccuracy(window = 5) {
    const recent = this.attemptHistory.slice(-window);
    if (recent.length === 0) return 0;
    return recent.filter(a => a.correct).length / recent.length;
  }

  // Note: this class used to also carry a getPriorityScore() method — a
  // second, never-called scoring function that duplicated (and diverged
  // from) RecommendationEngine's own logic. Its correct half (rewarding
  // the MORE-forgotten Fading concept, `100 * (1 - decayEstimate)`) is now
  // the one actually live, inside RecommendationEngine._conceptUrgencyScore().
  // Removed rather than left as dead code once its logic had a real home.

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      subject: this.subject,
      topic: this.topic,
      subtopic: this.subtopic,
      difficultyWeight: this.difficultyWeight,
      dependencyIds: this.dependencyIds,
      questionPoolIds: this.questionPoolIds,
      retentionState: this.retentionState,
      confidenceScore: this.confidenceScore,
      lastSeenAt: this.lastSeenAt,
      decayEstimate: this.decayEstimate,
      nextReviewEstimate: this.nextReviewEstimate,
      attemptHistory: this.attemptHistory,
      errorPatternTags: Object.fromEntries(this.errorPatternTags),
      reinforcedCycles: this.reinforcedCycles,
      personalDecayRate: this.personalDecayRate,
      everReachedHeld: this.everReachedHeld
    };
  }

  static fromJSON(data) {
    const node = new ConceptNode(data);
    node.retentionState = data.retentionState;
    node.confidenceScore = data.confidenceScore;
    node.lastSeenAt = data.lastSeenAt;
    node.decayEstimate = data.decayEstimate;
    node.nextReviewEstimate = data.nextReviewEstimate;
    node.attemptHistory = data.attemptHistory || [];
    node.errorPatternTags = new Map(Object.entries(data.errorPatternTags || {}));
    node.reinforcedCycles = data.reinforcedCycles || 0;
    node.personalDecayRate = data.personalDecayRate || 1.0;
    // Backward-compatible for concepts saved before this field existed —
    // infer it from retentionState so a concept that's currently Held,
    // Fading, or Reinforced (all of which require having passed through
    // Held at least once, per _updateState()'s transition graph) doesn't
    // lose credit it already earned before this field was added.
    node.everReachedHeld = data.everReachedHeld
      ?? ['held', 'fading', 'reinforced'].includes(data.retentionState);
    return node;
  }
}

