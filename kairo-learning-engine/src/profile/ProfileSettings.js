/**
 * Kairo — ProfileSettings
 * Student profile management, preferences, and data controls.
 */

export class ProfileSettings {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
    this.defaults = {
      notifications: {
        dailyRecap: true,
        streakReminders: true,
        examAlerts: true,
        challengeUpdates: true,
        weeklyReflection: true,
        studyReminders: true,
        reminderTime: '18:00'
      },
      practice: {
        defaultSessionLength: 15,
        autoShowExplanation: true,
        soundEffects: true,
        hapticFeedback: true,
        darkMode: false
      },
      accessibility: {
        fontSize: 'medium', // small | medium | large
        highContrast: false,
        reduceMotion: false,
        screenReaderOptimized: false
      },
      privacy: {
        shareProgressPublicly: false,
        appearOnLeaderboard: true,
        allowAnalytics: true
      },
      offline: {
        autoDownloadPacks: false,
        maxStorageMB: 100,
        wifiOnlyDownloads: true
      }
    };

    // Merge with saved preferences
    this.preferences = {
      ...this.defaults,
      ...(kairoEngine.profile.preferences || {})
    };
  }

  getProfile() {
    const p = this.engine.profile;
    return {
      studentId: p.studentId,
      name: p.name,
      email: p.email || null,
      avatar: p.avatar || null,
      targetCourse: p.targetCourse,
      targetUniversity: p.targetUniversity,
      targetSubjects: p.targetSubjects,
      examDate: p.examDate,
      dailyQuestionGoal: p.dailyQuestionGoal,
      macroState: p.macroState,
      joinedAt: p.createdAt,
      stats: {
        totalSessions: p.sessions.length,
        totalQuestions: p.totalQuestionsAnswered,
        totalCorrect: p.totalCorrect,
        accuracy: p.totalQuestionsAnswered > 0
          ? Math.round((p.totalCorrect / p.totalQuestionsAnswered) * 100)
          : 0,
        currentStreak: p.streakData?.currentMomentum || 0,
        eliteScore: p.eliteScoreHistory?.length > 0
          ? p.eliteScoreHistory[p.eliteScoreHistory.length - 1].total
          : 0,
        level: this.engine.levelSystem.getProgress()
      }
    };
  }

  updateProfile(updates) {
    const allowed = ['name', 'email', 'targetCourse', 'targetUniversity', 'targetSubjects', 'examDate', 'avatar', 'dailyQuestionGoal'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        this.engine.profile[key] = updates[key];
      }
    }
    return this.getProfile();
  }

  getPreferences() {
    return this.preferences;
  }

  updatePreferences(category, settings) {
    if (this.preferences[category]) {
      this.preferences[category] = { ...this.preferences[category], ...settings };
      this.engine.profile.preferences = this.preferences;
    }
    return this.preferences;
  }

  /**
   * Learning Journey: visible progress across all subjects/topics.
   */
  getLearningJourney() {
    const concepts = Array.from(this.engine.graph.nodes.values());
    const subjects = {};

    for (const c of concepts) {
      if (!subjects[c.subject]) {
        subjects[c.subject] = { topics: {}, total: 0, mastered: 0 };
      }
      if (!subjects[c.subject].topics[c.topic]) {
        subjects[c.subject].topics[c.topic] = { subtopics: {}, total: 0, mastered: 0 };
      }
      if (!subjects[c.subject].topics[c.topic].subtopics[c.subtopic]) {
        subjects[c.subject].topics[c.topic].subtopics[c.subtopic] = { concepts: [], total: 0, mastered: 0 };
      }

      const sub = subjects[c.subject].topics[c.topic].subtopics[c.subtopic];
      sub.concepts.push({
        id: c.id,
        name: c.name,
        state: c.retentionState,
        confidence: c.confidenceScore
      });
      sub.total++;
      subjects[c.subject].total++;
      subjects[c.subject].topics[c.topic].total++;

      if (c.retentionState === 'held' || c.retentionState === 'reinforced') {
        sub.mastered++;
        subjects[c.subject].mastered++;
        subjects[c.subject].topics[c.topic].mastered++;
      }
    }

    // Calculate percentages
    for (const subject in subjects) {
      subjects[subject].masteryPct = Math.round((subjects[subject].mastered / subjects[subject].total) * 100);
      for (const topic in subjects[subject].topics) {
        const t = subjects[subject].topics[topic];
        t.masteryPct = Math.round((t.mastered / t.total) * 100);
        for (const subtopic in t.subtopics) {
          const s = t.subtopics[subtopic];
          s.masteryPct = Math.round((s.mastered / s.total) * 100);
        }
      }
    }

    return subjects;
  }

  /**
   * Data export for student (GDPR-style portability).
   */
  exportData() {
    return {
      profile: this.engine.profile.toJSON(),
      graph: this.engine.graph.toJSON(),
      preferences: this.preferences,
      exportedAt: Date.now()
    };
  }

  /**
   * Delete all local data (account deletion).
   */
  async deleteAllData() {
    // Clear IndexedDB
    await this.engine.store.delete('profile', this.engine.profile.studentId);
    const allConcepts = await this.engine.store.getAll('concepts');
    for (const c of allConcepts) {
      await this.engine.store.delete('concepts', c.id);
    }
    // Reset in-memory
    this.engine.graph = new (await import('../core/KnowledgeGraph.js')).KnowledgeGraph();
    this.engine.profile = new (await import('../student/StudentProfile.js')).StudentProfile({
      studentId: this.engine.profile.studentId,
      name: this.engine.profile.name
    });
    return { deleted: true };
  }
}
