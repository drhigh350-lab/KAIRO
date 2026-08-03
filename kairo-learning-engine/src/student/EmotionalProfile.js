/**
 * Kairo — EmotionalProfile
 * Student Intelligence Model §4.
 *
 * Infers emotional PATTERNS, not clinical states, purely to let Kai
 * calibrate tone (Learning Engine Phase 2 §7.2, §7.4). This is
 * explicitly NOT a mental-health diagnostic system and must never be
 * framed, marketed, or exposed to the student as one.
 *
 * Hard boundary (§4, "Hard boundary"): this layer must never be used
 * to infer or flag clinical mental-health conditions. States here are
 * combinations of behavioral + academic signals over a rolling window
 * — never a single data point, and never self-reported. States are
 * never presented back to the student directly (§4, "How these states
 * are inferred").
 */

import { EmotionalState, ErrorTag, SessionConstants } from "../utils/constants.js";
import { daysBetween } from "../utils/helpers.js";

const ROLLING_SESSION_WINDOW = 7; // sessions considered "recent" for these signals

export class EmotionalProfile {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.lastComputed = null;
    this.currentStates = []; // more than one can be true at once
  }

  /**
   * Recompute the current set of inferred emotional states.
   * @param {KnowledgeGraph} graph
   * @returns {string[]} zero or more EmotionalState values
   */
  compute(graph) {
    const sessions = this.profile.sessions.slice(-ROLLING_SESSION_WINDOW);
    const concepts = Array.from(graph.nodes.values());
    const states = [];

    if (this._isHighlyMotivated(sessions)) states.push(EmotionalState.HIGHLY_MOTIVATED);
    if (this._isLosingConfidence(sessions, concepts)) states.push(EmotionalState.LOSING_CONFIDENCE);
    if (this._isRecovering()) states.push(EmotionalState.RECOVERING);
    if (this._isDiscouraged(sessions)) states.push(EmotionalState.DISCOURAGED);
    if (this._isOverconfident(concepts)) states.push(EmotionalState.OVERCONFIDENT);
    if (this._isExamPressureIncreasing(sessions)) states.push(EmotionalState.EXAM_PRESSURE_INCREASING);
    if (this._needsEncouragement(concepts)) states.push(EmotionalState.NEEDS_ENCOURAGEMENT);
    if (this._needsChallenge(concepts, sessions)) states.push(EmotionalState.NEEDS_CHALLENGE);

    this.currentStates = states;
    this.lastComputed = Date.now();
    return states;
  }

  has(state) {
    return this.currentStates.includes(state);
  }

  // ─────────────────────────────────────────────
  // Signal -> state rules (§4 table, right-hand column)
  // ─────────────────────────────────────────────

  /**
   * "Rising session frequency, voluntary extra sessions, fast
   * re-engagement after breaks."
   */
  _isHighlyMotivated(sessions) {
    if (sessions.length < 3) return false;
    const gaps = this._sessionGaps(sessions);
    const recentGaps = gaps.slice(-3);
    const earlierGaps = gaps.slice(0, -3);
    if (recentGaps.length === 0 || earlierGaps.length === 0) return false;
    const recentAvg = this._avg(recentGaps);
    const earlierAvg = this._avg(earlierGaps);
    // Session frequency rising = gaps shrinking
    return recentAvg < earlierAvg * 0.7;
  }

  /**
   * "Rising guessed/careless_slip clusters, slowing response time on
   * previously-strong concepts, session abandonment rising."
   */
  _isLosingConfidence(sessions, concepts) {
    const recentTagCounts = this._recentErrorTagCounts(concepts, 10);
    const guessedOrSlip = (recentTagCounts[ErrorTag.GUESSED] || 0) + (recentTagCounts[ErrorTag.CARELESS_SLIP] || 0);
    const abandonmentRising = this._completionRateTrend(sessions) === 'declining';
    return guessedOrSlip >= 3 || abandonmentRising;
  }

  /**
   * "Post-gap re-entry, early session in a reconnection flow."
   */
  _isRecovering() {
    return this.profile.macroState === 'recovering';
  }

  /**
   * "Sustained low completion rate + declining accuracy + declining
   * session length together (not any single signal alone)."
   */
  _isDiscouraged(sessions) {
    if (sessions.length < 4) return false;
    const completionDeclining = this._completionRateTrend(sessions) === 'declining';
    const accuracyDeclining = this._accuracyTrend(sessions) === 'declining';
    const lengthDeclining = this._sessionLengthTrend(sessions) === 'declining';
    // Explicitly requires all three together, per spec.
    return completionDeclining && accuracyDeclining && lengthDeclining;
  }

  /**
   * "High self-selected difficulty attempts with rising guessed tags
   * and falling accuracy — confidence outpacing actual mastery."
   */
  _isOverconfident(concepts) {
    const recentTagCounts = this._recentErrorTagCounts(concepts, 10);
    const guessedCount = recentTagCounts[ErrorTag.GUESSED] || 0;
    const recentAccuracy = this._recentConceptAccuracy(concepts, 10);
    return guessedCount >= 2 && recentAccuracy < 0.5;
  }

  /**
   * "Proximity to exam date combined with rising session frequency
   * and declining sleep-adjacent time-of-day patterns (where device
   * data allows)."
   */
  _isExamPressureIncreasing(sessions) {
    if (!this.profile.examDate) return false;
    const daysToExam = daysBetween(Date.now(), this.profile.examDate);
    if (daysToExam > 42 || daysToExam < 0) return false; // outside the proximity window entirely

    const gaps = this._sessionGaps(sessions);
    const frequencyRising = gaps.length >= 2 && gaps[gaps.length - 1] < this._avg(gaps);

    // Device data may not be available — degrade gracefully rather
    // than treat "unknown" as "declining."
    const lateNightRising = this._lateNightSessionTrend(sessions);

    return frequencyRising && (lateNightRising === 'rising' || lateNightRising === 'unknown');
  }

  /**
   * "A Reinforced transition or milestone recall just occurred but
   * hasn't been surfaced yet."
   * Note: the actual "hasn't been surfaced yet" bookkeeping lives with
   * whatever calls proactiveMessage() on KaiBehavior — this method only
   * answers "did a Reinforced transition happen recently."
   */
  _needsEncouragement(concepts) {
    return concepts.some(c => {
      const last = c.attemptHistory[c.attemptHistory.length - 1];
      return c.retentionState === 'reinforced' && last && last.correct &&
        (Date.now() - last.timestamp) < SessionConstants.DIFFICULTY_PULLBACK_WINDOW_MS * 6; // ~30 min freshness window
    });
  }

  /**
   * "Sustained Held/Reinforced ratio with flat difficulty exposure —
   * the student is coasting."
   */
  _needsChallenge(concepts, sessions) {
    if (concepts.length === 0) return false;
    const strongRatio = concepts.filter(c => ['held', 'reinforced'].includes(c.retentionState)).length / concepts.length;
    const recentAccuracy = this._accuracyForSessions(sessions);
    return strongRatio > 0.6 && recentAccuracy > 0.85 && sessions.length >= 3;
  }

  // ─────────────────────────────────────────────
  // Signal helpers
  // ─────────────────────────────────────────────

  _sessionGaps(sessions) {
    const gaps = [];
    for (let i = 1; i < sessions.length; i++) {
      gaps.push(daysBetween(sessions[i].completedAt, sessions[i - 1].completedAt));
    }
    return gaps;
  }

  _avg(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  _completionRate(sessions) {
    if (sessions.length === 0) return 1;
    const completed = sessions.filter(s => s.completedAt != null).length;
    return completed / sessions.length;
  }

  _completionRateTrend(sessions) {
    if (sessions.length < 4) return 'stable';
    const mid = Math.floor(sessions.length / 2);
    const earlier = this._completionRate(sessions.slice(0, mid));
    const recent = this._completionRate(sessions.slice(mid));
    if (recent < earlier - 0.15) return 'declining';
    return 'stable';
  }

  _accuracyForSessions(sessions) {
    const total = sessions.reduce((s, sess) => s + (sess.questionsAnswered || 0), 0);
    const correct = sessions.reduce((s, sess) => s + (sess.correctCount || 0), 0);
    return total > 0 ? correct / total : 0;
  }

  _accuracyTrend(sessions) {
    if (sessions.length < 4) return 'stable';
    const mid = Math.floor(sessions.length / 2);
    const earlier = this._accuracyForSessions(sessions.slice(0, mid));
    const recent = this._accuracyForSessions(sessions.slice(mid));
    if (recent < earlier - 0.1) return 'declining';
    return 'stable';
  }

  _sessionLengthTrend(sessions) {
    if (sessions.length < 4) return 'stable';
    const lengthOf = s => s.questionsAnswered || 0;
    const mid = Math.floor(sessions.length / 2);
    const earlierAvg = this._avg(sessions.slice(0, mid).map(lengthOf));
    const recentAvg = this._avg(sessions.slice(mid).map(lengthOf));
    if (recentAvg < earlierAvg * 0.7) return 'declining';
    return 'stable';
  }

  _recentErrorTagCounts(concepts, limit) {
    const allAttempts = concepts
      .flatMap(c => c.attemptHistory.map(a => ({ ...a, conceptId: c.id })))
      .filter(a => !a.correct && a.errorTag)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    const counts = {};
    for (const a of allAttempts) {
      counts[a.errorTag] = (counts[a.errorTag] || 0) + 1;
    }
    return counts;
  }

  _recentConceptAccuracy(concepts, limit) {
    const allAttempts = concepts
      .flatMap(c => c.attemptHistory)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    if (allAttempts.length === 0) return 1;
    return allAttempts.filter(a => a.correct).length / allAttempts.length;
  }

  /**
   * Device time-of-day data may not exist. Returns 'unknown' rather
   * than silently treating absence as a signal either way — per the
   * platform-wide rule against faking depth that isn't there
   * (Learning Engine §11's sparse-data honesty principle, applied
   * here to sparse device data).
   */
  _lateNightSessionTrend(sessions) {
    if (!this.profile.device || sessions.length < 4) return 'unknown';
    const lateNight = s => {
      const hour = new Date(s.completedAt).getHours();
      return hour >= 23 || hour < 5;
    };
    const mid = Math.floor(sessions.length / 2);
    const earlierRate = sessions.slice(0, mid).filter(lateNight).length / mid;
    const recentRate = sessions.slice(mid).filter(lateNight).length / (sessions.length - mid);
    if (recentRate > earlierRate + 0.2) return 'rising';
    return 'stable';
  }
}
