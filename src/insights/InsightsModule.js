/**
 * Kairo — InsightsModule
 * Weekly Review, Monthly Wrapped, UTME Recap, and real-time learning analytics.
 */

import { WeeklyReflection, MonthlyWrapped } from "../motivation/WeeklyReflection.js";

export class InsightsModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  // ═══════════════════════════════════════════════════════════════
  // WEEKLY REVIEW
  // ═══════════════════════════════════════════════════════════════

  getWeeklyReview() {
    const ref = new WeeklyReflection(this.engine.profile, this.engine.graph);
    const data = ref.generate();
    const kaiNote = this.engine.kai.generateWeeklyReflection(data);

    return {
      type: 'weekly',
      period: 'last_7_days',
      data,
      kaiNote,
      highlights: this._weeklyHighlights(data),
      shareable: false
    };
  }

  _weeklyHighlights(data) {
    const highlights = [];
    if (data.reinforced.length >= 3) {
      highlights.push({
        type: 'milestone',
        text: `${data.reinforced.length} concepts reinforced this week`,
        icon: 'memory'
      });
    }
    if (data.sessionCount >= 5) {
      highlights.push({
        type: 'consistency',
        text: `${data.sessionCount} sessions completed`,
        icon: 'calendar'
      });
    }
    return highlights;
  }

  // ═══════════════════════════════════════════════════════════════
  // MONTHLY WRAPPED
  // ═══════════════════════════════════════════════════════════════

  getMonthlyWrapped() {
    const wrapped = new MonthlyWrapped(this.engine.profile, this.engine.graph);
    const data = wrapped.generate();

    return {
      type: 'monthly',
      period: 'last_30_days',
      data,
      visualCards: this._generateWrappedCards(data),
      shareable: true,
      shareText: this._generateShareText(data)
    };
  }

  _generateWrappedCards(data) {
    return [
      {
        title: 'Concepts Reinforced',
        value: data.reinforcedCount,
        subtitle: 'moved from Fading to Reinforced',
        color: 'gold'
      },
      {
        title: 'Total Sessions',
        value: data.totalSessions,
        subtitle: 'practice sessions this month',
        color: 'blue'
      },
      {
        title: 'Biggest Turnaround',
        value: data.biggestTurnaround?.name || '—',
        subtitle: data.biggestTurnaround?.subject || '',
        color: 'green'
      },
      {
        title: 'Score Trend',
        value: data.scoreTrend > 0 ? `+${data.scoreTrend}` : data.scoreTrend,
        subtitle: 'Elite Score change',
        color: data.scoreTrend >= 0 ? 'green' : 'orange'
      }
    ];
  }

  _generateShareText(data) {
    return `This month on Kairo: ${data.reinforcedCount} concepts reinforced, ${data.totalSessions} sessions completed. Think Smart. Perform Elite. #KairoWrapped`;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTME RECAP (future feature — data structures prepared)
  // ═══════════════════════════════════════════════════════════════

  generateUTMERecap() {
    const profile = this.engine.profile;
    const graph = this.engine.graph;
    const concepts = Array.from(graph.nodes.values());
    const sessions = profile.sessions;

    // Total journey stats
    const totalQuestions = profile.totalQuestionsAnswered;
    const totalCorrect = profile.totalCorrect;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Retention journey
    const reinforcedCount = concepts.filter(c => c.retentionState === 'reinforced').length;
    const heldCount = concepts.filter(c => c.retentionState === 'held').length;
    const totalConcepts = concepts.length;

    // Subject breakdown
    const bySubject = {};
    for (const c of concepts) {
      if (!bySubject[c.subject]) bySubject[c.subject] = { total: 0, mastered: 0 };
      bySubject[c.subject].total++;
      if (c.retentionState === 'held' || c.retentionState === 'reinforced') {
        bySubject[c.subject].mastered++;
      }
    }

    // Session timeline
    const sessionTimeline = sessions.map((s, i) => ({
      session: i + 1,
      date: s.completedAt,
      accuracy: s.questionsAnswered > 0 ? Math.round((s.correctCount / s.questionsAnswered) * 100) : 0,
      questions: s.questionsAnswered
    }));

    // Kai's personal letter
    const kaiLetter = this._generateKaiLetter({
      name: profile.name,
      totalSessions: sessions.length,
      reinforcedCount,
      accuracy,
      streakMax: profile.streakData?.currentMomentum || 0
    });

    return {
      type: 'utme_recap',
      studentName: profile.name,
      journey: {
        totalSessions: sessions.length,
        totalQuestions,
        accuracy,
        daysActive: new Set(sessions.map(s => new Date(s.completedAt).toDateString())).size,
        streakMax: profile.streakData?.currentMomentum || 0
      },
      retention: {
        totalConcepts,
        reinforced: reinforcedCount,
        held: heldCount,
        masteryRate: totalConcepts > 0 ? Math.round(((reinforcedCount + heldCount) / totalConcepts) * 100) : 0
      },
      bySubject: Object.entries(bySubject).map(([subject, data]) => ({
        subject,
        ...data,
        masteryPct: Math.round((data.mastered / data.total) * 100)
      })),
      sessionTimeline,
      kaiLetter,
      shareable: true
    };
  }

  _generateKaiLetter({ name, totalSessions, reinforcedCount, accuracy, streakMax }) {
    const parts = [`Dear ${name},`];

    parts.push(`You showed up ${totalSessions} times. That alone matters more than any score.`);

    if (reinforcedCount > 0) {
      parts.push(`${reinforcedCount} concepts moved from "I think I know this" to "I actually remember this." That is the real work.`);
    }

    if (accuracy >= 70) {
      parts.push(`Your accuracy trend shows you were thinking, not guessing. Keep that discipline.`);
    } else {
      parts.push(`The accuracy will come. What matters is that you kept returning. Consistency compounds.`);
    }

    if (streakMax >= 7) {
      parts.push(`Your longest streak was ${streakMax} days. You proved you can build a habit.`);
    }

    parts.push(`Whatever happens on exam day, you are not the same student who started this journey.`);
    parts.push(`— Kai`);

    return parts.join('\n\n');
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
