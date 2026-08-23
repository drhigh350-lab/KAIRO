/**
 * Kairo — ProgressionSystem
 * Levels and Kairo Points that reward learning behavior, not just volume.
 *
 * Kairo Points is a "Tight Economy" ledger, deliberately distinct from
 * Kairo Score (EliteScore.js): Kairo Score is a bounded 0-100 recompute-
 * from-scratch quality curve, meant to plateau — a UTME-readiness gauge.
 * Kairo Points is unbounded but strictly linear — every award is a flat,
 * predictable function of one completed session's own real results (+2
 * per correct answer, plus at most one flat session-type bonus), never a
 * scan of cumulative graph/profile state. A prior "milestone ledger"
 * design (crediting lifetime firsts — a concept reaching Held, a topic
 * crossing 80% mastery) let several such firsts land in the same session
 * and stack into a payout with no relationship to session length — this
 * design deliberately can't do that: total earned this call is always
 * exactly correctCount * CORRECT_ANSWER + sessionBonus.
 */
import { KairoPointsAwards } from '../utils/constants.js';

export class LevelSystem {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.levels = this._defineLevels();
    this.current = this._calculateCurrentLevel();
  }

  _defineLevels() {
    // Kairo Points here is a proxy for "learning actions" — but weighted by quality
    return [
      { level: 1,  name: 'First Step',      pointsRequired: 0,    tagline: 'You began.' },
      { level: 2,  name: 'Curious Mind',    pointsRequired: 100,  tagline: 'Questions are becoming familiar.' },
      { level: 3,  name: 'Pattern Seeker',  pointsRequired: 300,  tagline: 'You are noticing how concepts connect.' },
      { level: 4,  name: 'Steady Builder',  pointsRequired: 600,  tagline: "You're settling into a real rhythm." },
      { level: 5,  name: 'Knowledge Keeper',pointsRequired: 1000, tagline: 'You are remembering after time passes.' },
      { level: 6,  name: 'Strategist',      pointsRequired: 1500, tagline: 'You think before you answer.' },
      { level: 7,  name: 'Elite Scholar',   pointsRequired: 2200, tagline: 'Hard concepts are becoming routine.' },
      { level: 8,  name: 'Master Learner',  pointsRequired: 3000, tagline: 'You understand the system.' },
      { level: 9,  name: 'Grandmaster',     pointsRequired: 4000, tagline: 'Others could learn from your rhythm.' },
      { level: 10, name: 'Kairo Legend',    pointsRequired: 5500, tagline: 'Think Smart. Perform Elite.' }
    ];
  }

  _calculateCurrentLevel() {
    const points = this.profile.kairoPoints || 0;
    let level = this.levels[0];
    for (const l of this.levels) {
      if (points >= l.pointsRequired) level = l;
    }
    return level;
  }

  /**
   * Credits this session's Kairo Points: +2 per correct answer (0 for
   * incorrect/skipped/unsure), plus at most one flat session-type bonus
   * (RECOMMENDATION_SESSION / VERIFICATION_SESSION / CBT_SESSION / 0 for
   * everything else — see the caller). Strictly linear, never a scan of
   * graph/profile state, so a session's payout is always exactly
   * predictable from its own results. Call once per completed session
   * (endSession(), CBTExamMode.finish(), RapidFireEngine.finish()).
   */
  update(correctCount, sessionBonus = 0) {
    const basePoints = Math.max(0, correctCount) * KairoPointsAwards.CORRECT_ANSWER;
    const earned = basePoints + sessionBonus;
    this.profile.kairoPoints = (this.profile.kairoPoints || 0) + earned;

    const newLevel = this._calculateCurrentLevel();
    const leveledUp = newLevel.level > this.current.level;
    this.current = newLevel;
    return {
      pointsEarned: earned,
      totalPoints: this.profile.kairoPoints,
      level: newLevel,
      leveledUp,
      nextLevelPoints: this._nextLevelPoints()
    };
  }

  _nextLevelPoints() {
    const next = this.levels.find(l => l.level === this.current.level + 1);
    return next ? next.pointsRequired : null;
  }

  getProgress() {
    const nextPoints = this._nextLevelPoints();
    const currentPoints = this.profile.kairoPoints || 0;
    const prevPoints = this.levels.find(l => l.level === this.current.level)?.pointsRequired || 0;
    const progress = nextPoints
      ? Math.min(100, Math.round(((currentPoints - prevPoints) / (nextPoints - prevPoints)) * 100))
      : 100;
    return {
      level: this.current.level,
      name: this.current.name,
      tagline: this.current.tagline,
      points: currentPoints,
      nextLevelPoints: nextPoints,
      progressPercent: progress
    };
  }
}

export class BadgeSystem {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.earned = studentProfile.badges || [];
  }

  /**
   * Define all available badges.
   */
  static getBadgeCatalog() {
    return [
      // Retention badges
      { id: 'first_reinforced', name: 'Memory Builder', desc: 'First concept moved to Reinforced', condition: (ctx) => ctx.reinforcedCount >= 1 },
      { id: 'ten_reinforced', name: 'Retention Master', desc: '10 concepts in Reinforced state', condition: (ctx) => ctx.reinforcedCount >= 10 },
      { id: 'fifty_reinforced', name: 'Unforgettable', desc: '50 concepts in Reinforced state', condition: (ctx) => ctx.reinforcedCount >= 50 },

      // Consistency badges
      { id: 'three_day_streak', name: 'Rhythm Starter', desc: 'Studied 3 days in a row', condition: (ctx) => ctx.momentum >= 3 },
      { id: 'seven_day_streak', name: 'Daily Habit', desc: '7 days of consistent practice', condition: (ctx) => ctx.momentum >= 7 },
      { id: 'fourteen_day_streak', name: 'Unstoppable', desc: '14 days of momentum', condition: (ctx) => ctx.momentum >= 14 },

      // Accuracy badges
      { id: 'perfect_session', name: 'Clean Sheet', desc: '100% accuracy in a session of 10+ questions', condition: (ctx) => ctx.perfectSession },
      { id: 'rapid_fire_ace', name: 'Speed Demon', desc: 'Completed Rapid Fire with 90%+ accuracy under average 10s per question', condition: (ctx) => ctx.rapidFireAce },

      // Recovery badges
      { id: 'comeback_kid', name: 'Comeback Kid', desc: 'Returned after an At Risk gap and completed a session', condition: (ctx) => ctx.recoverySession },

      // Topic badges
      { id: 'topic_master', name: 'Topic Master', desc: 'Mastered an entire topic (80%+ Held/Reinforced)', condition: (ctx) => ctx.masteredTopics >= 1 },
      { id: 'subject_conqueror', name: 'Subject Conqueror', desc: 'Mastered an entire subject', condition: (ctx) => ctx.masteredSubjects >= 1 },

      // Social/Community badges
      { id: 'university_contributor', name: 'Proud Representative', desc: 'Contributed 100+ points to your university leaderboard', condition: (ctx) => ctx.uniContribution >= 100 },

      // Special
      { id: 'night_owl', name: 'Night Owl', desc: 'Completed 5 sessions after 10 PM', condition: (ctx) => ctx.nightSessions >= 5 },
      { id: 'early_bird', name: 'Early Bird', desc: 'Completed 5 sessions before 7 AM', condition: (ctx) => ctx.earlySessions >= 5 }
    ];
  }

  checkAndAward(context) {
    const catalog = BadgeSystem.getBadgeCatalog();
    const newlyEarned = [];

    for (const badge of catalog) {
      if (this.earned.includes(badge.id)) continue;
      if (badge.condition(context)) {
        this.earned.push(badge.id);
        newlyEarned.push(badge);
      }
    }

    this.profile.badges = this.earned;
    return newlyEarned;
  }

  getEarned() {
    const catalog = BadgeSystem.getBadgeCatalog();
    return this.earned.map(id => catalog.find(b => b.id === id)).filter(Boolean);
  }

  getAvailable() {
    const catalog = BadgeSystem.getBadgeCatalog();
    return catalog.filter(b => !this.earned.includes(b.id));
  }
}
