/**
 * Kairo — InsightsModule
 * Real-time learning analytics for the dashboard/Insights screen.
 *
 * Weekly Review and Monthly Wrapped are computed by KairoEngine directly
 * (getWeeklyReflection()/getMonthlyWrapped() in index.js — the flat shapes
 * Insights.tsx actually renders) rather than here. This module used to
 * carry its own second implementation of both (getWeeklyReview()/
 * getMonthlyWrapped(), plus a UTME recap that was never wired to
 * anything), each independently re-instantiating WeeklyReflection/
 * MonthlyWrapped and recomputing the same numbers — removed as dead code
 * with no caller anywhere in kairo-app or kairo-learning-engine.
 */

export class InsightsModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  // ═══════════════════════════════════════════════════════════════
  // REAL-TIME INSIGHTS (for dashboard)
  // ═══════════════════════════════════════════════════════════════

  getDashboardInsights() {
    const graph = this.engine.graph;
    const profile = this.engine.profile;
    const concepts = Array.from(graph.nodes.values());

    // Strengths (top 3 subjects by mastery)
    const subjectMastery = {};
    for (const c of concepts) {
      if (!subjectMastery[c.subject]) subjectMastery[c.subject] = { total: 0, mastered: 0 };
      subjectMastery[c.subject].total++;
      if (c.retentionState === 'held' || c.retentionState === 'reinforced') {
        subjectMastery[c.subject].mastered++;
      }
    }
    const strengths = Object.entries(subjectMastery)
      .map(([subject, data]) => ({ subject, masteryPct: Math.round((data.mastered / data.total) * 100) }))
      .sort((a, b) => b.masteryPct - a.masteryPct)
      .slice(0, 3);

    // Weaknesses (bottom 3)
    const weaknesses = Object.entries(subjectMastery)
      .map(([subject, data]) => ({ subject, masteryPct: Math.round((data.mastered / data.total) * 100) }))
      .sort((a, b) => a.masteryPct - b.masteryPct)
      .slice(0, 3);

    // Urgent: Fading concepts
    const urgent = concepts.filter(c => c.retentionState === 'fading').length;

    // Trend
    const scoreTrend = this.engine.eliteScore.getTrend(7);

    return {
      strengths,
      weaknesses,
      urgentReviewCount: urgent,
      scoreTrend,
      macroState: profile.macroState,
      currentStreak: profile.streakData?.currentMomentum || 0,
      eliteScore: profile.eliteScoreHistory?.length > 0
        ? profile.eliteScoreHistory[profile.eliteScoreHistory.length - 1].total
        : 0,
      nextMilestone: this._nextMilestone(profile, concepts)
    };
  }

  _nextMilestone(profile, concepts) {
    const reinforced = concepts.filter(c => c.retentionState === 'reinforced').length;
    const nextThreshold = Math.ceil((reinforced + 1) / 10) * 10;
    return {
      type: 'reinforced_concepts',
      current: reinforced,
      target: nextThreshold,
      remaining: nextThreshold - reinforced
    };
  }
}
