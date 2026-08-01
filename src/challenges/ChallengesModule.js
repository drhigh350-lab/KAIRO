/**
 * Kairo — ChallengesModule
 * Daily/weekly challenges that motivate without punishing.
 * Focused on learning behavior, not just volume.
 */

export class ChallengesModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
    this.activeChallenges = [];
  }

  static getChallengeCatalog() {
    return [
      // Daily challenges
      {
        id: 'daily_5_reinforced',
        type: 'daily',
        title: 'Memory Keeper',
        description: 'Move 2 concepts from Fading to Reinforced today',
        rewardXP: 50,
        check: (engine) => {
          const today = new Date().toDateString();
          const transitions = Array.from(engine.graph.nodes.values()).filter(c => {
            const recent = c.attemptHistory.filter(a => {
              const d = new Date(a.timestamp);
              return d.toDateString() === today && a.correct;
            });
            return c.retentionState === 'reinforced' && recent.length > 0;
          });
          return transitions.length >= 2;
        }
      },
      {
        id: 'daily_consistency',
        type: 'daily',
        title: 'Steady Rhythm',
        description: 'Complete one session today',
        rewardXP: 20,
        check: (engine) => {
          const today = new Date().toDateString();
          return engine.profile.sessions.some(s =>
            new Date(s.completedAt).toDateString() === today
          );
        }
      },
      {
        id: 'daily_weakness',
        type: 'daily',
        title: 'Face the Fear',
        description: 'Practice 5 questions from your weakest topic',
        rewardXP: 40,
        check: (engine) => {
          // Would track via session metadata in real implementation
          return false;
        }
      },
      // Weekly challenges
      {
        id: 'weekly_3_subjects',
        type: 'weekly',
        title: 'Balanced Scholar',
        description: 'Practice in 3 different subjects this week',
        rewardXP: 100,
        check: (engine) => {
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const subjects = new Set();
          for (const c of engine.graph.nodes.values()) {
            const recent = c.attemptHistory.filter(a => a.timestamp > weekAgo);
            if (recent.length > 0) subjects.add(c.subject);
          }
          return subjects.size >= 3;
        }
      },
      {
        id: 'weekly_perfect_day',
        type: 'weekly',
        title: 'Clean Sheet',
        description: 'Achieve 90%+ accuracy in a single session of 15+ questions',
        rewardXP: 80,
        check: (engine) => {
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          return engine.profile.sessions.some(s => {
            return s.completedAt > weekAgo &&
              s.questionsAnswered >= 15 &&
              (s.correctCount / s.questionsAnswered) >= 0.9;
          });
        }
      },
      {
        id: 'weekly_streak',
        type: 'weekly',
        title: 'Unbroken',
        description: 'Maintain momentum for 5 days this week',
        rewardXP: 75,
        check: (engine) => {
          return (engine.profile.streakData?.currentMomentum || 0) >= 5;
        }
      },
      // Special challenges
      {
        id: 'special_comeback',
        type: 'special',
        title: 'Comeback King',
        description: 'Return after 3+ days away and complete 2 sessions',
        rewardXP: 150,
        check: (engine) => {
          return engine.profile.macroState === 'recovering' &&
            engine.profile.recoverySessionCount >= 2;
        }
      },
      {
        id: 'special_night_owl',
        type: 'special',
        title: 'Night Owl',
        description: 'Complete 3 sessions after 10 PM',
        rewardXP: 60,
        check: (engine) => {
          return engine.profile.sessions.filter(s =>
            new Date(s.completedAt).getHours() >= 22
          ).length >= 3;
        }
      }
    ];
  }

  /**
   * Generate today's active challenges.
   */
  getDailyChallenges() {
    const catalog = ChallengesModule.getChallengeCatalog();
    const all = catalog.filter(c => c.type === 'daily' || c.type === 'special');

    // Check completion status
    return all.map(c => ({
      ...c,
      completed: c.check(this.engine),
      progress: this._estimateProgress(c)
    }));
  }

  getWeeklyChallenges() {
    const catalog = ChallengesModule.getChallengeCatalog();
    const all = catalog.filter(c => c.type === 'weekly');

    return all.map(c => ({
      ...c,
      completed: c.check(this.engine),
      progress: this._estimateProgress(c)
    }));
  }

  _estimateProgress(challenge) {
    // Simplified progress estimation
    if (challenge.completed) return 100;
    return 0; // Would need more granular tracking in production
  }

  /**
   * Check all challenges and award completed ones.
   */
  checkAndAward() {
    const catalog = ChallengesModule.getChallengeCatalog();
    const earned = this.engine.profile.completedChallenges || [];
    const newlyCompleted = [];

    for (const c of catalog) {
      if (earned.includes(c.id)) continue;
      if (c.check(this.engine)) {
        earned.push(c.id);
        newlyCompleted.push(c);
      }
    }

    this.engine.profile.completedChallenges = earned;
    return newlyCompleted;
  }
}
