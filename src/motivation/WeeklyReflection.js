/**
 * Kairo — WeeklyReflection & MonthlyWrapped
 * Personal, reflective, and shareable insights.
 */

import { daysBetween } from "../utils/helpers.js";

export class WeeklyReflection {
  constructor(studentProfile, knowledgeGraph) {
    this.profile = studentProfile;
    this.graph = knowledgeGraph;
  }

  generate() {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const reinforced = [];
    const fading = [];
    let patternObservation = null;

    for (const concept of this.graph.nodes.values()) {
      // Check for Reinforced transitions this week
      const recentAttempts = concept.attemptHistory.filter(a => a.timestamp > weekAgo);
      const hadFadingThenCorrect = concept.retentionState === 'reinforced' &&
        recentAttempts.some(a => a.correct);
      if (hadFadingThenCorrect) reinforced.push(concept);

      // Fading concepts
      if (concept.retentionState === 'fading') fading.push(concept);
    }

    // Pattern observation from sessions
    const recentSessions = this.profile.sessions.filter(s => s.completedAt > weekAgo);
    if (recentSessions.length >= 3) {
      const times = recentSessions.map(s => new Date(s.completedAt).getHours());
      const avgHour = times.reduce((a, b) => a + b, 0) / times.length;
      if (Math.max(...times) - Math.min(...times) <= 3) {
        patternObservation = `You tend to study around ${Math.round(avgHour)}:00 — that's a real habit forming.`;
      }
    }

    return {
      reinforced: reinforced.map(c => ({ id: c.id, name: c.name })),
      fading: fading.map(c => ({ id: c.id, name: c.name })),
      patternObservation,
      sessionCount: recentSessions.length,
      timestamp: now
    };
  }
}

export class MonthlyWrapped {
  constructor(studentProfile, knowledgeGraph) {
    this.profile = studentProfile;
    this.graph = knowledgeGraph;
  }

  generate() {
    const now = Date.now();
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const reinforcedThisMonth = [];
    let biggestTurnaround = null;
    let maxTurnaroundScore = 0;

    for (const concept of this.graph.nodes.values()) {
      const monthAttempts = concept.attemptHistory.filter(a => a.timestamp > monthAgo);
      const wasFading = monthAttempts.some(a => !a.correct);
      const nowReinforced = concept.retentionState === 'reinforced';

      if (wasFading && nowReinforced) {
        reinforcedThisMonth.push(concept);
      }

      // Biggest turnaround: most attempts going from wrong to right
      const wrongCount = monthAttempts.filter(a => !a.correct).length;
      const rightCount = monthAttempts.filter(a => a.correct).length;
      const turnaround = rightCount - wrongCount;
      if (turnaround > maxTurnaroundScore) {
        maxTurnaroundScore = turnaround;
        biggestTurnaround = concept;
      }
    }

    const eliteHistory = this.profile.eliteScoreHistory || [];
    const monthScores = eliteHistory.filter(h => h.timestamp > monthAgo);
    const scoreTrend = monthScores.length >= 2
      ? monthScores[monthScores.length - 1].total - monthScores[0].total
      : 0;

    return {
      reinforcedCount: reinforcedThisMonth.length,
      reinforcedNames: reinforcedThisMonth.slice(0, 5).map(c => c.name),
      biggestTurnaround: biggestTurnaround ? {
        name: biggestTurnaround.name,
        subject: biggestTurnaround.subject
      } : null,
      scoreTrend,
      totalSessions: this.profile.sessions.filter(s => s.completedAt > monthAgo).length,
      totalQuestions: this.profile.totalQuestionsAnswered,
      timestamp: now,
      shareable: true
    };
  }
}
