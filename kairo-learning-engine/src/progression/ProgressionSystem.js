/**
 * Kairo — ProgressionSystem
 * Levels and Kairo Points that reward learning behavior, not just volume.
 *
 * Kairo Points is a strictly additive ledger, deliberately distinct from
 * Kairo Score (EliteScore.js): Kairo Score is a bounded 0-100 recompute-
 * from-scratch quality curve, meant to plateau — a UTME-readiness gauge.
 * Kairo Points is unbounded and never recomputed from a snapshot of
 * current state; every award below is a permanent, one-time credit for a
 * genuine milestone, checked against kairoPointsProgress (which specific
 * concepts/days/topics have already been credited) rather than derived
 * from a current count. A concept that later decays back out of
 * Reinforced doesn't claw back the points it already earned for reaching
 * it — the ledger only ever grows.
 */
import { KairoPointsAwards } from '../utils/constants.js';

export class LevelSystem {
  constructor(studentProfile) {
    this.profile = studentProfile;
    if (!this.profile.kairoPointsProgress) {
      this.profile.kairoPointsProgress = { reinforcedConceptIds: [], heldConceptIds: [], consistencyDays: [], masteredTopics: [] };
    }
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

  /**
   * Scans current graph/session state for milestones not yet present in
   * kairoPointsProgress and credits each exactly once. Safe to call every
   * session — a concept/day/topic already recorded is skipped even if it's
   * still true, and one that later becomes false (a concept decaying back
   * out of Reinforced) stays credited since its id was already banked.
   * Returns the points newly earned this call, not the running total.
   */
  awardFromProgress(graph, sessions) {
    const progress = this.profile.kairoPointsProgress;
    const reinforcedIds = new Set(progress.reinforcedConceptIds);
    const heldIds = new Set(progress.heldConceptIds);
    const days = new Set(progress.consistencyDays);
    const masteredTopics = new Set(progress.masteredTopics);
    let earned = 0;

    const concepts = Array.from(graph.nodes.values());
    for (const c of concepts) {
      if (c.retentionState === 'reinforced' && !reinforcedIds.has(c.id)) {
        reinforcedIds.add(c.id);
        earned += KairoPointsAwards.REINFORCED_CONCEPT;
      }
      if ((c.retentionState === 'held' || c.retentionState === 'reinforced') && !heldIds.has(c.id)) {
        heldIds.add(c.id);
        earned += KairoPointsAwards.HELD_CONCEPT;
      }
    }

    for (const s of sessions) {
      if (!s.completedAt) continue;
      const d = new Date(s.completedAt);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!days.has(dayKey)) {
        days.add(dayKey);
        earned += KairoPointsAwards.CONSISTENCY_DAY;
      }
    }

    const topicKeys = new Set(concepts.map(c => `${c.subject}:${c.topic}`));
    for (const topicKey of topicKeys) {
      if (masteredTopics.has(topicKey)) continue;
      const [subject, topic] = topicKey.split(':');
      const topicConcepts = concepts.filter(c => c.subject === subject && c.topic === topic);
      const masteredCount = topicConcepts.filter(c => c.retentionState === 'held' || c.retentionState === 'reinforced').length;
      if (topicConcepts.length > 0 && masteredCount / topicConcepts.length >= 0.8) {
        masteredTopics.add(topicKey);
        earned += KairoPointsAwards.TOPIC_MASTERED;
      }
    }

    progress.reinforcedConceptIds = [...reinforcedIds];
    progress.heldConceptIds = [...heldIds];
    progress.consistencyDays = [...days];
    progress.masteredTopics = [...masteredTopics];

    return earned;
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
   * Credits any newly-reached progress milestones, plus an optional flat
   * bonus (the High-Yield Session award — never part of progress-tracked
   * milestones, since it's per-session, not per-concept/day/topic), then
   * recomputes the level tier from the updated total. Call once per
   * completed session (Practice's endSession(), CBTExamMode.finish()).
   */
  update(graph, sessions, flatBonus = 0) {
    const progressEarned = this.awardFromProgress(graph, sessions);
    const earned = progressEarned + flatBonus;
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
