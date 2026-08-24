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
import { KairoPointsAwards } from "../utils/constants.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
    const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
    const now = Date.now();
    const groups = {
      confident: { correct: 0, total: 0 },
      hesitated: { correct: 0, total: 0 }
    };
    let changesInLast30Days = 0;
    let flippedRightToWrongInLast30Days = 0;

    for (const concept of this.engine.graph.nodes.values()) {
      for (const attempt of concept.attemptHistory) {
        if (typeof attempt.answerChangeCount !== 'number') continue;
        const group = attempt.answerChangeCount >= 1 ? groups.hesitated : groups.confident;
        group.total++;
        if (attempt.correct) group.correct++;

        if (attempt.answerChangeCount >= 1 && attempt.timestamp > now - THIRTY_DAYS_MS) {
          changesInLast30Days++;
          // wasFirstPickCorrect is only ever set (non-null) on a hesitated
          // attempt (see KairoEngine.submitAnswer()) — true here means the
          // student's own first instinct was right before they talked
          // themselves out of it.
          if (attempt.wasFirstPickCorrect === true && !attempt.correct) flippedRightToWrongInLast30Days++;
        }
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
      penalty,
      changesInLast30Days,
      flippedRightToWrongInLast30Days
    };
  }

  /**
   * The Weekly Drop (Batch 2): real week-over-week deltas, never a running/
   * lifetime total. "This week" / "last week" are both trailing 7-day
   * windows (now-7d..now, now-14d..now-7d) — the same rolling-window
   * convention WeeklyReflection/MonthlyWrapped already use, not a calendar
   * Mon-Sun week, so the numbers stay live rather than resetting at a
   * fixed boundary mid-week. Whether this is actually SHOWN to the student
   * (locked until Sunday) is a UI concern — see kairo-app's weeklyDrop.ts
   * — this always computes the real data so the lock never has to wait on
   * anything.
   *
   * Kairo Points earned per week is reconstructed from profile.sessions
   * (correctCount * KairoPointsAwards.CORRECT_ANSWER + the session-type
   * bonus) rather than read off kairoPoints directly — that field is a
   * lifetime, never-decreasing ledger with no timestamped history of its
   * own. LevelSystem.update()'s own doc comment confirms a session's
   * payout is "always exactly predictable from its own results," which is
   * exactly what this replays. isVerification isn't a column on
   * kairo.sessions, so a verification bonus can only be reconstructed for
   * a session still in memory from this device — a conservative
   * undercount on cross-device history, never an inflated one.
   *
   * Returns null before the student has completed a single session this
   * week — there is genuinely nothing to drop yet.
   */
  getWeeklyDrop() {
    const now = Date.now();
    const weekAgo = now - 7 * ONE_DAY_MS;
    const twoWeeksAgo = now - 14 * ONE_DAY_MS;

    const sessionPoints = (s) => {
      const base = Math.max(0, s.correctCount || 0) * KairoPointsAwards.CORRECT_ANSWER;
      const bonus = s.mode === 'standard' ? KairoPointsAwards.RECOMMENDATION_SESSION
        : s.mode === 'cbt_exam' ? KairoPointsAwards.CBT_SESSION
        : (s.isVerification ? KairoPointsAwards.VERIFICATION_SESSION : 0);
      return base + bonus;
    };

    const sessions = this.engine.profile.sessions || [];
    const thisWeekSessions = sessions.filter(s => s.completedAt > weekAgo);
    if (thisWeekSessions.length === 0) return null;
    const lastWeekSessions = sessions.filter(s => s.completedAt > twoWeeksAgo && s.completedAt <= weekAgo);

    const pointsThisWeek = thisWeekSessions.reduce((sum, s) => sum + sessionPoints(s), 0);
    const pointsLastWeek = lastWeekSessions.reduce((sum, s) => sum + sessionPoints(s), 0);
    const pointsDeltaPct = pointsLastWeek > 0 ? Math.round(((pointsThisWeek - pointsLastWeek) / pointsLastWeek) * 100) : null;

    const accuracyOf = (list) => {
      const total = list.reduce((s, sess) => s + (sess.questionsAnswered || 0), 0);
      const correct = list.reduce((s, sess) => s + (sess.correctCount || 0), 0);
      return total > 0 ? Math.round((correct / total) * 100) : null;
    };
    const accuracyThisWeek = accuracyOf(thisWeekSessions);
    const accuracyLastWeek = accuracyOf(lastWeekSessions);
    const accuracyDeltaPts = (accuracyThisWeek != null && accuracyLastWeek != null) ? accuracyThisWeek - accuracyLastWeek : null;

    // Weak Topics Mastered: concepts genuinely mastered THIS week that were
    // genuinely weak before it — at least one wrong attempt before this
    // week, at least one correct one this week, and sitting at Held/
    // Reinforced right now. "Weak Topics Mastered" (not "fading concepts")
    // is deliberate, encouraging language for the same underlying signal.
    // Also buckets every attempt by subject::topic for Biggest Turnaround
    // below, in the same pass.
    let weakTopicsMastered = 0;
    const topicBuckets = new Map();

    for (const concept of this.engine.graph.nodes.values()) {
      const before = concept.attemptHistory.filter(a => a.timestamp <= weekAgo);
      const thisWeek = concept.attemptHistory.filter(a => a.timestamp > weekAgo);

      const isMasteredNow = concept.retentionState === 'held' || concept.retentionState === 'reinforced';
      const wasEverWrongBefore = before.some(a => !a.correct);
      const masteredThisWeek = thisWeek.some(a => a.correct);
      if (isMasteredNow && wasEverWrongBefore && masteredThisWeek) weakTopicsMastered++;

      const key = `${concept.subject}::${concept.topic}`;
      const bucket = topicBuckets.get(key) || { subject: concept.subject, topic: concept.topic, beforeCorrect: 0, beforeTotal: 0, weekCorrect: 0, weekTotal: 0 };
      bucket.beforeTotal += before.length;
      bucket.beforeCorrect += before.filter(a => a.correct).length;
      bucket.weekTotal += thisWeek.length;
      bucket.weekCorrect += thisWeek.filter(a => a.correct).length;
      topicBuckets.set(key, bucket);
    }

    // Biggest Turnaround: at least a 40-percentage-point accuracy jump,
    // across a minimum of 10 questions answered within the week, measured
    // against a real (not one-question-lucky) pre-week baseline.
    const MIN_WEEK_QUESTIONS = 10;
    const MIN_BASELINE_QUESTIONS = 3;
    const MIN_TURNAROUND_DELTA = 0.40;
    let biggestTurnaround = null;
    let biggestDelta = 0;
    for (const bucket of topicBuckets.values()) {
      if (bucket.weekTotal < MIN_WEEK_QUESTIONS || bucket.beforeTotal < MIN_BASELINE_QUESTIONS) continue;
      const beforeAccuracy = bucket.beforeCorrect / bucket.beforeTotal;
      const weekAccuracy = bucket.weekCorrect / bucket.weekTotal;
      const delta = weekAccuracy - beforeAccuracy;
      if (delta >= MIN_TURNAROUND_DELTA && delta > biggestDelta) {
        biggestDelta = delta;
        biggestTurnaround = {
          subject: bucket.subject,
          topic: bucket.topic,
          beforeAccuracy: Math.round(beforeAccuracy * 100),
          weekAccuracy: Math.round(weekAccuracy * 100),
          deltaPts: Math.round(delta * 100)
        };
      }
    }

    // The "One Thing" Focus (Batch 3): the single most urgent Fading
    // concept right now is the "emerging threat" — Kairo's own decay
    // model already identifies exactly this ("starting to slip"), ranked
    // by decayEstimate so it's the genuinely most urgent one, not just the
    // first one iterated.
    const fadingConcepts = Array.from(this.engine.graph.nodes.values())
      .filter(c => c.retentionState === 'fading')
      .sort((a, b) => b.decayEstimate - a.decayEstimate);
    const threat = fadingConcepts[0] || null;

    let oneThingCopy = null;
    if (biggestTurnaround && threat) {
      oneThingCopy = `Your biggest turnaround this week was ${biggestTurnaround.topic}. But ${threat.name} is starting to slip. Let's attack it on Monday.`;
    } else if (biggestTurnaround) {
      oneThingCopy = `Your biggest turnaround this week was ${biggestTurnaround.topic} — real, measurable progress. Keep the momentum going.`;
    } else if (threat) {
      oneThingCopy = `${threat.name} is starting to slip. Let's attack it on Monday, before it turns into a real gap.`;
    }

    return {
      pointsThisWeek,
      pointsDeltaPct,
      accuracyThisWeek,
      accuracyDeltaPts,
      weakTopicsMastered,
      biggestTurnaround,
      oneThingCopy,
      sessionCount: thisWeekSessions.length
    };
  }

  /**
   * The Velocity Matrix: per-subject time-to-answer vs. accuracy, isolating
   * calculation questions specifically (the same heuristic Theory vs.
   * Calculation reads — see isCalculationQuestion()) rather than a
   * subject's overall pace. A subject can read as merely "hard" in
   * aggregate when the real story is that its calculation-heavy questions
   * alone are eating the clock; a subject the student is fast AND accurate
   * in is the real contrast to show it against. Surfaces null unless both
   * sides genuinely exist and are different subjects.
   */
  getVelocityMatrix() {
    const MIN_SUBJECT_ATTEMPTS = 8;
    const MIN_CALC_ATTEMPTS = 5;
    const MIN_ACCURACY_FOR_FAST_PCT = 60;

    const bySubject = new Map();
    for (const concept of this.engine.graph.nodes.values()) {
      for (const attempt of concept.attemptHistory) {
        if (attempt.responseTimeMs == null) continue;
        const bucket = bySubject.get(concept.subject) || { subject: concept.subject, totalTimeMs: 0, totalCount: 0, correctCount: 0, calcTimeMs: 0, calcCount: 0 };
        bucket.totalTimeMs += attempt.responseTimeMs;
        bucket.totalCount++;
        if (attempt.correct) bucket.correctCount++;

        const question = attempt.questionId ? this.engine.questionGraph.getQuestion(attempt.questionId) : null;
        if (question && isCalculationQuestion(question.stem)) {
          bucket.calcTimeMs += attempt.responseTimeMs;
          bucket.calcCount++;
        }
        bySubject.set(concept.subject, bucket);
      }
    }

    const subjects = Array.from(bySubject.values());
    const fastCandidates = subjects.filter(s => s.totalCount >= MIN_SUBJECT_ATTEMPTS && (s.correctCount / s.totalCount) * 100 >= MIN_ACCURACY_FOR_FAST_PCT);
    const slowCandidates = subjects.filter(s => s.calcCount >= MIN_CALC_ATTEMPTS);
    if (fastCandidates.length === 0 || slowCandidates.length === 0) return null;

    const fastest = fastCandidates.reduce((a, b) => (a.totalTimeMs / a.totalCount) < (b.totalTimeMs / b.totalCount) ? a : b);
    const slowestCalc = slowCandidates.reduce((a, b) => (a.calcTimeMs / a.calcCount) > (b.calcTimeMs / b.calcCount) ? a : b);
    if (fastest.subject === slowestCalc.subject) return null; // no real contrast to report

    return {
      fastSubject: fastest.subject,
      fastAvgSeconds: Math.round(fastest.totalTimeMs / fastest.totalCount / 1000),
      slowSubject: slowestCalc.subject,
      slowCalcAvgSeconds: Math.round(slowestCalc.calcTimeMs / slowestCalc.calcCount / 1000)
    };
  }

  /**
   * The Endurance Curve: accuracy mapped against question position within
   * a session, pooled across every real session. Sessions don't store
   * per-question order themselves, so this reconstructs it from each
   * attempt's own timestamp falling inside that session's real
   * [startedAt, completedAt] window (both real stopwatch values, never
   * estimated), sorted chronologically. Detects a genuine fatigue point —
   * the position where a smoothed (moving-average) accuracy curve
   * sustainably drops well below its early-session peak — rather than
   * reacting to one noisy late-session miss.
   */
  getEnduranceCurve() {
    const MIN_TOTAL_ATTEMPTS = 60;
    const MIN_BUCKET_SAMPLE = 5;
    const SMOOTHING_WINDOW = 5;
    const MIN_FATIGUE_DROP_PTS = 20;

    const sessions = (this.engine.profile.sessions || []).filter(s => s.startedAt && s.completedAt);
    if (sessions.length === 0) return null;

    const allAttempts = [];
    for (const concept of this.engine.graph.nodes.values()) {
      for (const a of concept.attemptHistory) allAttempts.push(a);
    }
    if (allAttempts.length < MIN_TOTAL_ATTEMPTS) return null;

    const positionBuckets = new Map();
    for (const session of sessions) {
      const inSession = allAttempts
        .filter(a => a.timestamp >= session.startedAt && a.timestamp <= session.completedAt)
        .sort((a, b) => a.timestamp - b.timestamp);
      inSession.forEach((a, idx) => {
        const pos = idx + 1;
        const bucket = positionBuckets.get(pos) || { correct: 0, total: 0 };
        bucket.total++;
        if (a.correct) bucket.correct++;
        positionBuckets.set(pos, bucket);
      });
    }

    const positions = Array.from(positionBuckets.keys())
      .filter(p => positionBuckets.get(p).total >= MIN_BUCKET_SAMPLE)
      .sort((a, b) => a - b);
    if (positions.length < SMOOTHING_WINDOW * 2) return null;

    const accuracyAt = (p) => {
      const b = positionBuckets.get(p);
      return (b.correct / b.total) * 100;
    };

    const smoothed = positions.map((p, i) => {
      const windowPositions = positions.slice(Math.max(0, i - SMOOTHING_WINDOW + 1), i + 1);
      const avg = windowPositions.reduce((s, wp) => s + accuracyAt(wp), 0) / windowPositions.length;
      return { position: p, accuracy: avg };
    });

    let peak = smoothed[0];
    let fatiguePoint = null;
    for (const point of smoothed) {
      if (point.accuracy > peak.accuracy) peak = point;
      if (point.position > peak.position && peak.accuracy - point.accuracy >= MIN_FATIGUE_DROP_PTS) {
        fatiguePoint = point;
        break;
      }
    }
    if (!fatiguePoint) return null;

    return {
      peakAccuracy: Math.round(peak.accuracy),
      fatigueAccuracy: Math.round(fatiguePoint.accuracy),
      fatiguePosition: fatiguePoint.position
    };
  }
}
