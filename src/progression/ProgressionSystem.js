/**
 * Kairo — ProgressionSystem
 * Levels and badges that reward learning behavior, not just volume.
 */

export class LevelSystem {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.levels = this._defineLevels();
    this.current = this._calculateCurrentLevel();
  }

  _defineLevels() {
    // XP here is proxy for "learning actions" — but weighted by quality
    return [
      { level: 1,  name: 'First Step',      xpRequired: 0,    tagline: 'You began.' },
      { level: 2,  name: 'Curious Mind',    xpRequired: 100,  tagline: 'Questions are becoming familiar.' },
      { level: 3,  name: 'Pattern Seeker',  xpRequired: 300,  tagline: 'You are noticing how concepts connect.' },
      { level: 4,  name: 'Steady Builder',  xpRequired: 600,  tagline: 'Consistency is forming.' },
      { level: 5,  name: 'Knowledge Keeper',xpRequired: 1000, tagline: 'You are remembering after time passes.' },
      { level: 6,  name: 'Strategist',      xpRequired: 1500, tagline: 'You think before you answer.' },
      { level: 7,  name: 'Elite Scholar',   xpRequired: 2200, tagline: 'Hard concepts are becoming routine.' },
      { level: 8,  name: 'Master Learner',  xpRequired: 3000, tagline: 'You understand the system.' },
      { level: 9,  name: 'Grandmaster',     xpRequired: 4000, tagline: 'Others could learn from your rhythm.' },
      { level: 10, name: 'Kairo Legend',    xpRequired: 5500, tagline: 'Think Smart. Perform Elite.' }
    ];
  }

  /**
   * Calculate XP from real learning signals.
   * NOT raw question count. Weighted by:
   * - Reinforced transitions (highest)
   * - Correct on Fading concepts
   * - Consistent daily sessions
   * - Topic completion
   */
  calculateXP(graph, sessions) {
    let xp = 0;
    const concepts = Array.from(graph.nodes.values());

    // Reinforced transitions: 50 XP each
    const reinforcedCount = concepts.filter(c => c.retentionState === 'reinforced').length;
    xp += reinforcedCount * 50;

    // Held concepts: 20 XP each
    const heldCount = concepts.filter(c => c.retentionState === 'held').length;
    xp += heldCount * 20;

    // Session consistency bonus
    const uniqueDays = new Set(sessions.map(s => {
      const d = new Date(s.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;
    xp += uniqueDays * 10;

    // Topic completion bonus
    const topics = new Set(concepts.map(c => `${c.subject}:${c.topic}`));
    const completedTopics = Array.from(topics).filter(topicKey => {
      const [subject, topic] = topicKey.split(':');
      const topicConcepts = concepts.filter(c => c.subject === subject && c.topic === topic);
      const mastered = topicConcepts.filter(c => c.retentionState === 'held' || c.retentionState === 'reinforced').length;
      return mastered / topicConcepts.length >= 0.8;
    }).length;
    xp += completedTopics * 100;

    return xp;
  }

  _calculateCurrentLevel() {
    const xp = this.profile.totalXP || 0;
    let level = this.levels[0];
    for (const l of this.levels) {
      if (xp >= l.xpRequired) level = l;
    }
    return level;
  }

  update(graph, sessions) {
    const xp = this.calculateXP(graph, sessions);
    this.profile.totalXP = xp;
    const newLevel = this._calculateCurrentLevel();
    const leveledUp = newLevel.level > this.current.level;
    this.current = newLevel;
    return {
      xp,
      level: newLevel,
      leveledUp,
      nextLevelXP: this._nextLevelXP()
    };
  }

  _nextLevelXP() {
    const next = this.levels.find(l => l.level === this.current.level + 1);
    return next ? next.xpRequired : null;
  }

  getProgress() {
    const nextXP = this._nextLevelXP();
    const currentXP = this.profile.totalXP || 0;
    const prevXP = this.levels.find(l => l.level === this.current.level)?.xpRequired || 0;
    const progress = nextXP
      ? Math.min(100, Math.round(((currentXP - prevXP) / (nextXP - prevXP)) * 100))
      : 100;
    return {
      level: this.current.level,
      name: this.current.name,
      tagline: this.current.tagline,
      xp: currentXP,
      nextLevelXP: nextXP,
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
