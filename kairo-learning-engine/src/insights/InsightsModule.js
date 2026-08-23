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

import { isCalculationQuestion } from "../utils/helpers.js";

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

  // ═══════════════════════════════════════════════════════════════
  // PROFILE ACTION CARDS — three real, behavior-derived insights.
  // Each returns null (never a fabricated/zero number) until there's
  // genuinely enough real data behind it — a caller renders that as a
  // "still gathering data" state rather than an empty or misleading card.
  // ═══════════════════════════════════════════════════════════════

  /**
   * Theory vs. Calculation: splits the student's own attempt history by
   * isCalculationQuestion(stem) (see utils/helpers.js — no authored
   * calculationLoad tag exists to read instead, see that function's own
   * doc comment) and compares accuracy between the two. Requires at least
   * MIN_PER_CATEGORY resolvable attempts in EACH category — an "88%
   * Theory | 35% Math" headline built on 2 calculation questions would be
   * noise, not signal.
   */
  getTheoryVsCalculationSplit() {
    const MIN_PER_CATEGORY = 5;
    const buckets = {
      theory: { correct: 0, total: 0 },
      calculation: { correct: 0, total: 0 }
    };

    for (const concept of this.engine.graph.nodes.values()) {
      for (const attempt of concept.attemptHistory) {
        if (!attempt.questionId) continue;
        const question = this.engine.questionGraph.getQuestion(attempt.questionId);
        if (!question) continue; // question not resolvable this session — skip rather than guess
        const bucket = isCalculationQuestion(question.stem) ? buckets.calculation : buckets.theory;
        bucket.total++;
        if (attempt.correct) bucket.correct++;
      }
    }

    if (buckets.theory.total < MIN_PER_CATEGORY || buckets.calculation.total < MIN_PER_CATEGORY) return null;

    const theoryAccuracy = Math.round((buckets.theory.correct / buckets.theory.total) * 100);
    const calculationAccuracy = Math.round((buckets.calculation.correct / buckets.calculation.total) * 100);
    const weakerCategory = calculationAccuracy < theoryAccuracy ? 'calculation' : 'theory';

    return {
      theoryAccuracy,
      calculationAccuracy,
      theoryCount: buckets.theory.total,
      calculationCount: buckets.calculation.total,
      weakerCategory,
      gap: Math.abs(theoryAccuracy - calculationAccuracy)
    };
  }

  /**
   * Cognitive Prime Time: buckets every completed session
   * (profile.sessions — real started_at/completed_at timestamps, see
   * SupabaseSyncAdapter.pushSession()) by local hour-of-day and compares
   * accuracy across windows. A window only counts once it has
   * MIN_SESSIONS_PER_WINDOW real sessions in it — one lucky 9pm session
   * isn't "your best time," it's one data point.
   */
  getCognitivePrimeTime() {
    const MIN_SESSIONS_PER_WINDOW = 2;
    const WINDOWS = [
      { key: 'early_morning', label: 'Early Morning', startHour: 5, endHour: 8 },
      { key: 'morning', label: 'Morning', startHour: 8, endHour: 12 },
      { key: 'afternoon', label: 'Afternoon', startHour: 12, endHour: 17 },
      { key: 'evening', label: 'Evening', startHour: 17, endHour: 21 },
      { key: 'night', label: 'Night', startHour: 21, endHour: 29 } // wraps past midnight (21:00-05:00, expressed as 21-29)
    ];

    const windowForHour = (hour) => WINDOWS.find(w => {
      const h = hour < w.startHour ? hour + 24 : hour;
      return h >= w.startHour && h < w.endHour;
    });

    const stats = new Map(WINDOWS.map(w => [w.key, { sessions: 0, correct: 0, total: 0, label: w.label }]));
    for (const session of (this.engine.profile.sessions || [])) {
      if (!session.startedAt || !session.questionsAnswered) continue;
      const hour = new Date(session.startedAt).getHours();
      const win = windowForHour(hour);
      if (!win) continue;
      const s = stats.get(win.key);
      s.sessions++;
      s.total += session.questionsAnswered;
      s.correct += session.correctCount || 0;
    }

    const reliable = Array.from(stats.values()).filter(s => s.sessions >= MIN_SESSIONS_PER_WINDOW && s.total > 0);
    if (reliable.length < 2) return null; // not enough spread of session times to compare yet

    const scored = reliable.map(s => ({ ...s, accuracy: Math.round((s.correct / s.total) * 100) }));
    scored.sort((a, b) => b.accuracy - a.accuracy);
    const best = scored[0];
    const worst = scored[scored.length - 1];
    if (best.accuracy === worst.accuracy) return null; // genuinely no difference to act on

    return {
      bestWindowLabel: best.label,
      bestAccuracy: best.accuracy,
      bestSessionCount: best.sessions,
      worstWindowLabel: worst.label,
      worstAccuracy: worst.accuracy,
      gap: best.accuracy - worst.accuracy
    };
  }

  /**
   * Hesitation Penalty: compares accuracy on attempts where the student
   * changed their selected option at least once before submitting
   * (answerChangeCount >= 1 — real per-question instrumentation from
   * PracticeQuestion.tsx, see KairoEngine.submitAnswer()) against attempts
   * where they went with their first pick. Only counts attempts that
   * actually carry the field — anything answered before this
   * instrumentation shipped has answerChangeCount === undefined and is
   * correctly excluded rather than silently treated as "no hesitation."
   * Requires MIN_PER_GROUP real attempts in both groups.
   */
  getHesitationPenalty() {
    const MIN_PER_GROUP = 8;
    const groups = {
      confident: { correct: 0, total: 0 },
      hesitated: { correct: 0, total: 0 }
    };

    for (const concept of this.engine.graph.nodes.values()) {
      for (const attempt of concept.attemptHistory) {
        if (typeof attempt.answerChangeCount !== 'number') continue;
        const group = attempt.answerChangeCount >= 1 ? groups.hesitated : groups.confident;
        group.total++;
        if (attempt.correct) group.correct++;
      }
    }

    if (groups.confident.total < MIN_PER_GROUP || groups.hesitated.total < MIN_PER_GROUP) return null;

    const confidentAccuracy = Math.round((groups.confident.correct / groups.confident.total) * 100);
    const hesitatedAccuracy = Math.round((groups.hesitated.correct / groups.hesitated.total) * 100);
    const penalty = confidentAccuracy - hesitatedAccuracy;
    if (penalty <= 0) return null; // hesitating isn't actually costing this student anything — no flaw to report

    return {
      confidentAccuracy,
      hesitatedAccuracy,
      confidentCount: groups.confident.total,
      hesitatedCount: groups.hesitated.total,
      penalty
    };
  }
}
