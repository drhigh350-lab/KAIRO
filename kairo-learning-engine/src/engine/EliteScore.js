/**
 * Kairo — EliteScore
 * Replaces generic XP. Rewards learning quality, not volume.
 *
 * Monotonic by design — the score only ever rises, never falls. Each of
 * the three components accrues points from signals that are themselves
 * append-only or sticky (a correct attempt once made, a concept once
 * reaching Held, a Fading→Reinforced cycle once survived, a calendar day
 * once practiced on — none of these can later un-happen), so recomputing
 * from scratch every time is naturally stable and non-decreasing. A raw
 * point total is then run through an asymptotic curve (approaches but
 * never reaches 100) to keep the displayed score in the same 0–100 range
 * the rest of the app already expects, while growth naturally slows as a
 * student's genuine mastery accumulates rather than being an unbounded
 * counter.
 *
 * Components:
 *   Accuracy (45%)   — correct attempts, weighted by difficulty and
 *                       discounted for suspected gaming (genuineConfidence)
 *   Retention (35%)  — Held reached (once) + Reinforced cycles survived
 *   Consistency (20%) — distinct calendar days ever practiced
 */

import { EliteScoreWeights, EliteScorePointScale, EliteScorePoints } from "../utils/constants.js";
import { clamp } from "../utils/helpers.js";

export class EliteScore {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.history = studentProfile.eliteScoreHistory || []; // { total, accuracy, retention, consistency, timestamp }
  }

  /**
   * Recalculate the full Elite Score from scratch. Call this after each
   * session. Always produces a total >= the previous entry in history,
   * since every input is append-only/sticky.
   */
  calculate(knowledgeGraph, sessions) {
    const accuracy = this._curve(this._accuracyPoints(knowledgeGraph), EliteScorePointScale.ACCURACY);
    const retention = this._curve(this._retentionPoints(knowledgeGraph), EliteScorePointScale.RETENTION);
    const consistency = this._curve(this._consistencyPoints(sessions), EliteScorePointScale.CONSISTENCY);

    const total = clamp(
      accuracy * EliteScoreWeights.ACCURACY +
      retention * EliteScoreWeights.RETENTION +
      consistency * EliteScoreWeights.CONSISTENCY,
      0, 100
    );

    const snapshot = {
      total: Math.round(total * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      retention: Math.round(retention * 10) / 10,
      consistency: Math.round(consistency * 10) / 10,
      timestamp: Date.now()
    };

    this.history.push(snapshot);
    this.profile.eliteScoreHistory = this.history;
    return snapshot;
  }

  /** Asymptotic 0–100 curve: monotonically increasing in `points`, approaches 100 but never reaches it. */
  _curve(points, scale) {
    if (points <= 0) return 0;
    return 100 * (1 - Math.exp(-points / scale));
  }

  _accuracyPoints(graph) {
    let points = 0;
    for (const c of graph.nodes.values()) {
      for (const attempt of c.attemptHistory) {
        if (!attempt.correct) continue;
        const difficulty = attempt.difficulty || 1;
        // genuineConfidence (ErrorPatternClassifier.detectGaming) is fixed
        // at attempt time and never changes afterward, so using it here
        // keeps this attempt's contribution stable forever — unlike the
        // concept's current retentionState, which can change later and
        // would otherwise let an old attempt's point value drift.
        const confidence = attempt.genuineConfidence ?? 1.0;
        points += difficulty * confidence;
      }
    }
    return points;
  }

  _retentionPoints(graph) {
    let points = 0;
    for (const c of graph.nodes.values()) {
      if (c.everReachedHeld) points += EliteScorePoints.HELD_BONUS;
      points += (c.reinforcedCycles || 0) * EliteScorePoints.REINFORCED_CYCLE_BONUS;
    }
    return points;
  }

  _consistencyPoints(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    const uniqueDays = new Set(
      sessions.filter(s => s.completedAt).map(s => {
        const d = new Date(s.completedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
    return uniqueDays.size * EliteScorePoints.CONSISTENCY_DAY_BONUS;
  }

  /**
   * Generate a human-readable explanation of why the score changed.
   * Always a rise or a hold — the score never falls.
   */
  explainChange(previous, current) {
    const diff = current.total - previous.total;

    if (diff <= 0) {
      return {
        direction: 'steady',
        delta: '0',
        text: "Your Kairo Score held steady — keep practicing to move it further.",
        components: { accuracy: current.accuracy, retention: current.retention, consistency: current.consistency }
      };
    }

    const reasons = [];
    if (current.accuracy > previous.accuracy + 2) {
      reasons.push('you answered more correctly, including on harder questions');
    }
    if (current.retention > previous.retention + 2) {
      reasons.push('you reached or re-earned real retention on concepts');
    }
    if (current.consistency > previous.consistency + 2) {
      reasons.push('you practiced on a new day, building your rhythm');
    }
    if (reasons.length === 0) {
      reasons.push('small gains across multiple components');
    }

    const roundedDelta = Math.max(1, Math.round(diff));
    return {
      direction: 'up',
      delta: String(roundedDelta),
      text: `Your Kairo Score went up by ${roundedDelta} because ${reasons.join(' and ')}.`,
      components: {
        accuracy: current.accuracy,
        retention: current.retention,
        consistency: current.consistency
      }
    };
  }

  /** The score is monotonic, so this only ever distinguishes genuine growth from a plateau — never a fall. */
  getTrend(windowEntries = 7) {
    const recent = this.history.slice(-windowEntries);
    if (recent.length < 2) return 'insufficient_data';
    const first = recent[0].total;
    const last = recent[recent.length - 1].total;
    return last > first + 1 ? 'rising' : 'stable';
  }
}
