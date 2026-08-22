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
      targetUTMEScore: p.targetUTMEScore,
      preferredStudyDurationMin: p.preferredStudyDurationMin,
      preferredStudyPeriod: p.preferredStudyPeriod,
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
    const allowed = ['name', 'email', 'targetCourse', 'targetUniversity', 'targetSubjects', 'examDate', 'avatar', 'dailyQuestionGoal', 'targetUTMEScore', 'preferredStudyDurationMin', 'preferredStudyPeriod'];
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
   *
   * total/mastered stay concept-based (that's the right unit for a
   * meaningful mastery %) — but a topic maps to ~1 concept in almost all
   * seeded content, so "total concepts" badly understates how much a
   * student can actually practice here when that one concept has many
   * real questions attached. questionCount is the real, deduplicated
   * count of live questions reachable from this subject/topic/subtopic's
   * concepts (a question tested across multiple concepts in the same
   * topic is only counted once) — what the UI should show for "how much
   * is here," separate from the mastery-percentage math.
   */
  getLearningJourney() {
    const concepts = Array.from(this.engine.graph.nodes.values());
    const questionGraph = this.engine.questionGraph;
    const subjects = {};

    for (const c of concepts) {
      if (!subjects[c.subject]) {
        subjects[c.subject] = { topics: {}, total: 0, mastered: 0, questionIds: new Set(), attemptedQuestionIds: new Set(), correctAttempts: 0, totalAttempts: 0 };
      }
      if (!subjects[c.subject].topics[c.topic]) {
        subjects[c.subject].topics[c.topic] = { subtopics: {}, total: 0, mastered: 0, questionIds: new Set(), attemptedQuestionIds: new Set(), correctAttempts: 0, totalAttempts: 0 };
      }
      if (!subjects[c.subject].topics[c.topic].subtopics[c.subtopic]) {
        subjects[c.subject].topics[c.topic].subtopics[c.subtopic] = { concepts: [], total: 0, mastered: 0, questionIds: new Set(), attemptedQuestionIds: new Set(), correctAttempts: 0, totalAttempts: 0 };
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

      for (const q of questionGraph.getQuestionsForConcept(c.id)) {
        sub.questionIds.add(q.id);
        subjects[c.subject].topics[c.topic].questionIds.add(q.id);
        subjects[c.subject].questionIds.add(q.id);
      }

      // Attempted: X / Total and real accuracy (Practice Module — topic
      // progress screens) — distinct from masteryPct, which reflects
      // retention *state* (a concept can be Held without every question
      // in its pool ever being attempted, and an attempted question isn't
      // automatically "mastered").
      for (const attempt of c.attemptHistory || []) {
        if (attempt.questionId) {
          sub.attemptedQuestionIds.add(attempt.questionId);
          subjects[c.subject].topics[c.topic].attemptedQuestionIds.add(attempt.questionId);
          subjects[c.subject].attemptedQuestionIds.add(attempt.questionId);
        }
        sub.totalAttempts++;
        subjects[c.subject].topics[c.topic].totalAttempts++;
        subjects[c.subject].totalAttempts++;
        if (attempt.correct) {
          sub.correctAttempts++;
          subjects[c.subject].topics[c.topic].correctAttempts++;
          subjects[c.subject].correctAttempts++;
        }
      }

      if (c.retentionState === 'held' || c.retentionState === 'reinforced') {
        sub.mastered++;
        subjects[c.subject].mastered++;
        subjects[c.subject].topics[c.topic].mastered++;
      }
    }

    // Calculate percentages and flatten questionIds -> questionCount
    for (const subject in subjects) {
      const sj = subjects[subject];
      sj.masteryPct = Math.round((sj.mastered / sj.total) * 100);
      sj.questionCount = sj.questionIds.size;
      sj.attempted = sj.attemptedQuestionIds.size;
      sj.accuracyPct = sj.totalAttempts > 0 ? Math.round((sj.correctAttempts / sj.totalAttempts) * 100) : 0;
      delete sj.questionIds;
      delete sj.attemptedQuestionIds;
      for (const topic in sj.topics) {
        const t = sj.topics[topic];
        t.masteryPct = Math.round((t.mastered / t.total) * 100);
        t.questionCount = t.questionIds.size;
        t.attempted = t.attemptedQuestionIds.size;
        t.accuracyPct = t.totalAttempts > 0 ? Math.round((t.correctAttempts / t.totalAttempts) * 100) : 0;
        delete t.questionIds;
        delete t.attemptedQuestionIds;
        for (const subtopic in t.subtopics) {
          const s = t.subtopics[subtopic];
          s.masteryPct = Math.round((s.mastered / s.total) * 100);
          s.questionCount = s.questionIds.size;
          s.attempted = s.attemptedQuestionIds.size;
          s.accuracyPct = s.totalAttempts > 0 ? Math.round((s.correctAttempts / s.totalAttempts) * 100) : 0;
          delete s.questionIds;
          delete s.attemptedQuestionIds;
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
    // Every subsystem built against the old profile object directly
    // (decayModel, eliteScore, kai, streak, this.engine.settings itself...)
    // would otherwise keep writing to the now-detached old profile forever
    // — see KairoEngine._rebuildProfileBoundSubsystems()'s own docstring.
    this.engine._rebuildProfileBoundSubsystems();
    return { deleted: true };
  }
}
