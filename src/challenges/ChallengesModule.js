/**
 * Kairo — ChallengesModule
 * Challenges Module Spec (docs/specs/KAIRO_CHALLENGES_MODULE.md).
 *
 * Event-based, admin-curated challenges (§2.3: "Only TECHMED
 * administrators can create Challenges") — distinct from Practice/Learn's
 * continuous, self-paced study. This module owns the DATA and BUSINESS
 * LOGIC an admin tool or student-facing UI would call: creating/
 * scheduling challenges, joining, scoring, and leaderboards. It
 * deliberately does NOT implement:
 *   - Discovery surfaces (§4), the in-challenge UI chrome (§6), or
 *     shareable result-card rendering (§8) — those are UI/product
 *     surfaces, not backend engine concerns.
 *   - A full admin dashboard (§10) — createChallenge()/updateChallenge()
 *     are the engine-level operations such a dashboard would call, not
 *     the dashboard itself. Roles/permissions beyond a single is_admin
 *     flag (§10.5's Content/Growth/senior-admin distinction) are future
 *     work, not built here.
 *   - Push/notification delivery (§4.2) — left to the notification
 *     pipeline (see docs/SUPABASE_SETUP.md §6 for that gap).
 * All of the above are flagged, not silently skipped.
 */

import { ChallengeType, ChallengeStatus, ScoringFormula, CHALLENGE_TYPES_DEFAULT_NO_LATE_JOIN } from "../utils/constants.js";

export class ChallengesModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  _requireAdapter() {
    if (!this.engine.sync.adapter) {
      throw new Error('ChallengesModule requires connectSupabase() first — challenges are shared, server-curated content, not local-only state.');
    }
    return this.engine.sync.adapter;
  }

  // ═══════════════════════════════════════════════════════════════
  // ADMIN — §10.2 Challenge Creation Workflow, §10.3 Ongoing Management
  // RLS enforces is_admin server-side; this does not duplicate that
  // check client-side, so a non-admin caller gets Postgres's own error.
  // ═══════════════════════════════════════════════════════════════

  /**
   * @param {object} config
   * @param {string} config.type - ChallengeType
   * @param {string} config.title
   * @param {string} [config.theme]
   * @param {string[]} config.questionIds - curated from the existing
   *   question bank (§10.2 "Admin selects or curates questions from
   *   Kairo's existing question bank")
   * @param {string} [config.scoringFormula] - ScoringFormula, defaults
   *   to 'accuracy'
   * @param {number} config.startsAt - timestamp
   * @param {number} config.endsAt - timestamp
   * @param {boolean} [config.lateJoinAllowed] - defaults to false only
   *   for Mock UTME Events (§5.3); true otherwise unless overridden
   */
  async createChallenge(config, adminStudentId) {
    if (!Object.values(ChallengeType).includes(config.type)) {
      throw new Error(`Unknown challenge type: ${config.type}`);
    }
    const adapter = this._requireAdapter();

    const lateJoinAllowed = config.lateJoinAllowed !== undefined
      ? config.lateJoinAllowed
      : !CHALLENGE_TYPES_DEFAULT_NO_LATE_JOIN.includes(config.type);

    return adapter.createChallenge({
      id: config.id || `chal_${config.type}_${Date.now()}`,
      type: config.type,
      title: config.title,
      theme: config.theme || null,
      questionIds: config.questionIds || [],
      scoringFormula: config.scoringFormula || ScoringFormula.ACCURACY,
      startsAt: config.startsAt,
      endsAt: config.endsAt,
      lateJoinAllowed,
      leaderboardVisible: config.leaderboardVisible !== false,
      status: ChallengeStatus.SCHEDULED
    }, adminStudentId);
  }

  /**
   * §10.3 status transitions (scheduled -> live -> concluded ->
   * archived) and mid-challenge intervention (excluding a flawed
   * question from questionIds without invalidating the whole event).
   */
  async updateChallengeStatus(challengeId, status) {
    if (!Object.values(ChallengeStatus).includes(status)) {
      throw new Error(`Unknown challenge status: ${status}`);
    }
    return this._requireAdapter().updateChallenge(challengeId, { status });
  }

  async pullQuestionFromChallenge(challengeId, questionId, remainingQuestionIds) {
    return this._requireAdapter().updateChallenge(challengeId, { questionIds: remainingQuestionIds });
  }

  // ═══════════════════════════════════════════════════════════════
  // DISCOVERY (data only — §4's actual surfaces are UI work)
  // ═══════════════════════════════════════════════════════════════

  async getLiveChallenges() {
    return this._requireAdapter().fetchChallenges({ status: ChallengeStatus.LIVE });
  }

  async getUpcomingChallenges() {
    return this._requireAdapter().fetchChallenges({ status: ChallengeStatus.SCHEDULED });
  }

  // ═══════════════════════════════════════════════════════════════
  // JOINING — §5
  // ═══════════════════════════════════════════════════════════════

  /**
   * §5.3 late-joiner handling: a challenge already past its start time
   * either allows late entry (attempt counts toward the leaderboard) or
   * — for tightly time-boxed formats like Mock UTME Events — still lets
   * the student join, but the attempt is flagged as not counting toward
   * the leaderboard rather than silently rejected (§6.2 "no silent
   * failures or ambiguous states").
   */
  async joinChallenge(challengeId) {
    const adapter = this._requireAdapter();
    const [challenge] = await adapter.fetchChallenges({}).then(all => all.filter(c => c.id === challengeId));
    if (!challenge) throw new Error(`Challenge ${challengeId} not found.`);

    const now = Date.now();
    const alreadyStarted = now >= challenge.startsAt;
    const countsTowardLeaderboard = !alreadyStarted || challenge.lateJoinAllowed;

    const attempt = await adapter.joinChallenge(challengeId, this.engine.profile.studentId, { countsTowardLeaderboard });
    return { attempt, challenge, lateJoin: alreadyStarted, countsTowardLeaderboard };
  }

  /**
   * Record one answered question within a challenge attempt. Also
   * feeds the shared Learning Engine primitive (§9.3 "Feeding data in":
   * challenge performance enriches the same knowledge graph Practice/
   * Learn/Review write to) — a challenge question is still a real
   * attempt at a real concept, not a parallel, disconnected event.
   */
  submitChallengeAnswer({ conceptId, correct, responseTimeMs, selectedOption, correctOption, questionId, questionDifficulty }) {
    if (conceptId) {
      this.engine.submitAnswer({ conceptId, correct, responseTimeMs, selectedOption, correctOption, questionId, questionDifficulty });
    }
  }

  /**
   * §7 Results. Computes score per the challenge's configured scoring
   * formula (§10.2), then pushes the completed attempt and returns the
   * result the caller renders into the Results screen (§7.2) — the
   * emotional framing/copy of that screen (§7.3) is UI work, this only
   * supplies the numbers it's framed around.
   * @param {object[]} questionResults - [{ questionId, conceptId, correct, selectedOption, correctOption, responseTimeMs }]
   */
  async finishChallenge(challengeId, questionResults) {
    const adapter = this._requireAdapter();
    const [challenge] = await adapter.fetchChallenges({}).then(all => all.filter(c => c.id === challengeId));
    if (!challenge) throw new Error(`Challenge ${challengeId} not found.`);

    const total = questionResults.length;
    const correctCount = questionResults.filter(r => r.correct).length;
    const totalTimeMs = questionResults.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0);
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const score = this._computeScore(challenge.scoringFormula, { correctCount, total, totalTimeMs });

    const attempt = await adapter.pushChallengeAttempt({
      id: `${challengeId}_${this.engine.profile.studentId}`,
      completedAt: Date.now(),
      score,
      accuracy,
      timeTakenMs: totalTimeMs,
      questionResults
    });

    this._recordCompletion(challengeId, challenge.type);

    return { attempt, challenge, score, accuracy, timeTakenMs: totalTimeMs, correctCount, total };
  }

  /**
   * §10.2 "scoring formula (accuracy-weighted, speed-weighted, or
   * hybrid depending on challenge type)". Speed rewards correctness
   * first, then answering faster; hybrid blends both into one number.
   * Kept simple and documented rather than tuned against real data that
   * doesn't exist yet — same bootstrap-estimate posture as difficulty
   * calibration elsewhere in the QIM.
   */
  _computeScore(formula, { correctCount, total, totalTimeMs }) {
    if (total === 0) return 0;
    const accuracyScore = (correctCount / total) * 100;

    if (formula === ScoringFormula.SPEED) {
      const avgSec = (totalTimeMs / total) / 1000;
      const speedBonus = Math.max(0, 30 - avgSec); // faster average answers add up to 30 bonus points
      return Math.round(accuracyScore + (correctCount / total) * speedBonus);
    }

    if (formula === ScoringFormula.HYBRID) {
      const avgSec = (totalTimeMs / total) / 1000;
      const speedBonus = Math.max(0, 15 - avgSec / 2);
      return Math.round(accuracyScore * 0.7 + (correctCount / total) * speedBonus * 0.3 * (100 / 15));
    }

    return Math.round(accuracyScore); // 'accuracy' — time is not a factor
  }

  /**
   * §9.2 Streaks and Consistency Signals + StudentProfile.completedChallenges
   * (kairo.students.completed_challenges) — now genuinely "challenges
   * (real events) this student has completed," not a locally-detected
   * personal-achievement catalog (that job belongs to BadgeSystem/
   * LevelSystem, which already do exactly this pattern independently —
   * duplicating it here was the actual spec mismatch this rewrite closes).
   */
  _recordCompletion(challengeId, challengeType) {
    const earned = this.engine.profile.completedChallenges || [];
    if (!earned.includes(challengeId)) earned.push(challengeId);
    this.engine.profile.completedChallenges = earned;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const streak = this.engine.profile.challengeStreak || { current: 0, lastCompletedDate: null, type: null };
    if (challengeType === ChallengeType.DAILY) {
      if (streak.lastCompletedDate === yesterday) {
        streak.current += 1;
      } else if (streak.lastCompletedDate !== today) {
        streak.current = 1;
      }
      streak.lastCompletedDate = today;
      streak.type = ChallengeType.DAILY;
      this.engine.profile.challengeStreak = streak;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RESULTS — §7.2 Leaderboard & Ranking, Personal Performance Summary
  // ═══════════════════════════════════════════════════════════════

  /**
   * Windowed around the student's own rank by default (§7.2: "default
   * to showing a window around the student's own position ... not just
   * the top 10"). Pass no window to get the full board.
   */
  async getLeaderboard(challengeId, { window = 10 } = {}) {
    return this._requireAdapter().fetchLeaderboard(challengeId, {
      aroundStudentId: this.engine.profile.studentId,
      window
    });
  }

  /**
   * §7.2 "Your best Speed Challenge score yet" — self-referential
   * progress, emphasized at least as much as peer comparison per §7.2.
   */
  async getPersonalBenchmark(challengeType) {
    const adapter = this._requireAdapter();
    const past = await adapter.fetchChallenges({ type: challengeType, status: ChallengeStatus.CONCLUDED });
    let best = null;
    for (const challenge of past) {
      const attempt = await adapter.fetchChallengeAttempt(challenge.id, this.engine.profile.studentId);
      if (attempt && attempt.completedAt && (!best || attempt.score > best.score)) {
        best = attempt;
      }
    }
    return best ? { bestScore: best.score, challengeId: best.challengeId } : null;
  }
}
