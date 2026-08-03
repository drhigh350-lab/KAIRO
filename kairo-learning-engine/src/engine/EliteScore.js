/**
 * Kairo — EliteScore
 * Replaces generic XP. Rewards learning quality, not volume.
 * 
 * Components:
 *   Accuracy (45%)   — weighted by difficulty and recency
 *   Retention (35%)  — successful Reinforced transitions
 *   Consistency (20%) — sustainable rhythm across rolling window
 */

import { EliteScoreWeights, SessionConstants } from "../utils/constants.js";
import { weightedRecencyAverage, inRollingWindow, clamp } from "../utils/helpers.js";

export class EliteScore {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.history = studentProfile.eliteScoreHistory || []; // { total, accuracy, retention, consistency, timestamp }
  }

  /**
   * Recalculate the full Elite Score from scratch.
   * Call this after each session or periodically.
   */
  calculate(knowledgeGraph, sessions) {
    const accuracy = this._accuracyComponent(knowledgeGraph);
    const retention = this._retentionComponent(knowledgeGraph);
    const consistency = this._consistencyComponent(sessions);

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

  _accuracyComponent(graph) {
    const concepts = Array.from(graph.nodes.values()).filter(n => n.attemptHistory.length > 0);
    if (concepts.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const c of concepts) {
      for (const attempt of c.attemptHistory) {
        const difficulty = attempt.difficulty || 1;
        const recencyWeight = this._recencyWeight(attempt.timestamp);
        const isHardRecall = (c.retentionState === 'fading' || c.retentionState === 'reinforced');
        const difficultyMultiplier = isHardRecall ? difficulty * 1.5 : difficulty;

        const value = attempt.correct ? 1 : 0;
        weightedSum += value * recencyWeight * difficultyMultiplier;
        totalWeight += recencyWeight * difficultyMultiplier;
      }
    }

    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  }

  _retentionComponent(graph) {
    const concepts = Array.from(graph.nodes.values());
    if (concepts.length === 0) return 0;

    // Reward Reinforced concepts heavily
    const reinforced = concepts.filter(c => c.retentionState === 'reinforced').length;
    const held = concepts.filter(c => c.retentionState === 'held').length;
    const total = concepts.filter(c => c.attemptHistory.length > 0).length || 1;

    // Retention score: reinforced = full, held = partial, fading/forming = none
    const raw = ((reinforced * 1.0) + (held * 0.4)) / total;

    // Speed bonus: quick correct recalls on Reinforced concepts
    let speedBonus = 0;
    for (const c of concepts) {
      if (c.retentionState === 'reinforced') {
        const recentCorrect = c.attemptHistory
          .slice(-3)
          .filter(a => a.correct);
        const avgTime = recentCorrect.reduce((s, a) => s + (a.responseTimeMs || 20000), 0)
          / (recentCorrect.length || 1);
        if (avgTime < 10000) speedBonus += 0.5; // small bonus for fast, accurate recall
      }
    }

    return clamp((raw * 100) + Math.min(speedBonus, 5), 0, 100);
  }

  _consistencyComponent(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const windowDays = SessionConstants.CONSISTENCY_ROLLING_WINDOW_DAYS;
    const recent = inRollingWindow(
      sessions.map(s => ({ timestamp: s.completedAt, value: 1 })),
      windowDays
    );

    if (recent.length === 0) return 0;

    // Ideal: frequent short sessions across the window
    const uniqueDays = new Set(recent.map(r => {
      const d = new Date(r.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;

    const totalDays = windowDays;
    const density = uniqueDays / totalDays;

    // Reward distributed practice over cramming
    const sessionCountsPerDay = {};
    for (const r of recent) {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      sessionCountsPerDay[key] = (sessionCountsPerDay[key] || 0) + 1;
    }
    const maxPerDay = Math.max(...Object.values(sessionCountsPerDay));
    const crammingPenalty = maxPerDay > 3 ? 0.7 : 1.0;

    return clamp(density * 100 * crammingPenalty, 0, 100);
  }

  _recencyWeight(timestamp, halfLifeDays = 7) {
    const ageDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    return Math.exp(-(Math.log(2) / halfLifeDays) * ageDays);
  }

  /**
   * Generate a human-readable explanation of why the score changed.
   */
  explainChange(previous, current) {
    const diff = current.total - previous.total;
    const direction = diff >= 0 ? 'up' : 'down';
    const absDiff = Math.abs(diff).toFixed(1);

    const reasons = [];
    if (current.accuracy > previous.accuracy + 2) {
      reasons.push('your accuracy on harder concepts improved');
    }
    if (current.retention > previous.retention + 2) {
      reasons.push('you successfully remembered concepts after time had passed');
    }
    if (current.consistency > previous.consistency + 2) {
      reasons.push('your study rhythm became more distributed');
    }
    if (current.accuracy < previous.accuracy - 2) {
      reasons.push('recent accuracy dropped on practiced material');
    }

    if (reasons.length === 0) {
      reasons.push('small shifts across multiple components');
    }

    return {
      direction,
      delta: absDiff,
      text: `Your Elite Score went ${direction} by ${absDiff} because ${reasons.join(' and ')}.`,
      components: {
        accuracy: current.accuracy,
        retention: current.retention,
        consistency: current.consistency
      }
    };
  }

  getTrend(windowEntries = 7) {
    const recent = this.history.slice(-windowEntries);
    if (recent.length < 2) return 'insufficient_data';
    const first = recent[0].total;
    const last = recent[recent.length - 1].total;
    if (last > first + 3) return 'rising';
    if (last < first - 3) return 'falling';
    return 'stable';
  }
}
