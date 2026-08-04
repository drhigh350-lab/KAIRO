/**
 * Kairo — StudentProfile
 * The living identity of the student inside the engine.
 */

import { MacroState, SessionConstants } from "../utils/constants.js";
import { daysBetween, inRollingWindow } from "../utils/helpers.js";

export class StudentProfile {
  constructor({
    studentId,
    name,
    examDate = null,
    targetSubjects = [],
    targetCourse = null,
    authUserId = null,

    // ─── Student Intelligence Model §1 — Identity (declared, not inferred) ───
    dateOfBirth = null,           // used to derive age-appropriate tone; DOB itself never surfaced
    examType = 'UTME',            // UTME | Post-UTME | IJMB | JUPEB
    examYear = null,              // sitting year — distinct from examDate, supports repeat candidates
    targetUniversity = null,
    targetUTMEScore = null,       // student's own definition of "ready" (§6 Exam Readiness benchmark)
    registrationDate = null,      // anchors "days until exam" + cohort analysis; set once, never changes
    preferredStudyDurationMin = null,  // session-length default, e.g. 20 or 45
    preferredStudyPeriod = null,       // 'morning' | 'evening' | 'late_night' — notification timing only
    device = null,                     // { os, connectivityQuality, appVersion } — diagnostics only, never personalizes content
    referralSource = null,             // marketing-layer only — must never leak into Kai's tone or recommendations
    parentGuardianContact = null,      // optional, dormant — reserved for future Parent Dashboard
    languageRegion = null,             // lets Kai choose relatable analogies — never a proxy for ability
    email = null,
    avatar = null,
    pushExternalId = null  // OneSignal external_id this student's device subscription is tagged with, set by the client once it registers with the OneSignal SDK — never invented/looked-up server-side
  }) {
    this.studentId = studentId;
    this.name = name;
    this.email = email;
    this.avatar = avatar;
    this.pushExternalId = pushExternalId;
    this.examDate = examDate;
    this.targetSubjects = targetSubjects;
    this.targetCourse = targetCourse;
    this.authUserId = authUserId;

    this.dateOfBirth = dateOfBirth;
    this.examType = examType;
    this.examYear = examYear;
    this.targetUniversity = targetUniversity;
    this.targetUTMEScore = targetUTMEScore;
    this.registrationDate = registrationDate ?? Date.now();
    this.preferredStudyDurationMin = preferredStudyDurationMin;
    this.preferredStudyPeriod = preferredStudyPeriod;
    this.device = device;
    this.referralSource = referralSource;
    this.parentGuardianContact = parentGuardianContact;
    this.languageRegion = languageRegion;

    // Dynamic state
    this.macroState = MacroState.ORIENTING;
    this.macroStateHistory = []; // { state, timestamp }
    this.learningState = 'new_learner';
    this.learningStateHistory = []; // { from, to, at }
    this.journeyStage = 'arrival';
    this.journeyStageHistory = []; // { from, to, at }
    this.reEngagement = null;      // ReEngagementEngine.toJSON() snapshot
    this.crossModuleMilestones = null; // CrossModuleMilestones.toJSON() snapshot
    this.continuation = null;      // ContinuationEngine.toJSON() snapshot
    this.comms = null;             // CommsService.toJSON() snapshot
    this.learn = null;             // LearnModule.toJSON() snapshot
    this.onboarding = null;        // OnboardingEngine.toJSON() snapshot (kairo.students.onboarding) — previously never snapshotted at all, so closing/reopening mid-onboarding always restarted from step 0
    this.notificationHistory = []; // NotificationEngine's local candidate history (kairo.students.notification_history)
    this.completedChallenges = []; // ChallengesModule.finishChallenge()'s completed real-Challenge-id list (kairo.students.completed_challenges)
    this.challengeStreak = null;   // ChallengesModule._recordCompletion()'s { current, lastCompletedDate, type } (kairo.students.challenge_streak)
    this.totalXP = 0;              // LevelSystem.update()'s recalculated XP (kairo.students.total_xp)
    this.badges = [];              // BadgeSystem.checkAndAward()'s earned-badge-id list (kairo.students.badges)
    this.preferences = null;       // ProfileSettings.updatePreferences()'s snapshot (kairo.students.preferences)
    this.sessions = [];          // completed session metadata
    this.responseTimeBaselines = {};
    this.eliteScoreHistory = [];
    this.createdAt = Date.now();
    this.lastSessionAt = null;
    this.totalQuestionsAnswered = 0;
    this.totalCorrect = 0;
    this.streakData = {
      currentMomentum: 0,
      protectedGapsUsed: 0,
      lastSessionDate: null,
      windowSessions: []
    };

    // Recovery tracking
    this.atRiskTriggeredAt = null;
    this.recoverySessionCount = 0;
  }

  /**
   * Compute macro-state from recent behavior.
   * This is engine-driven, not self-declared.
   */
  computeMacroState(knowledgeGraph) {
    const recentSessions = this.sessions.slice(-SessionConstants.MACRO_STATE_WINDOW_SESSIONS);
    const now = Date.now();

    // Cold start
    if (this.sessions.length < 3) {
      return this._transitionTo(MacroState.ORIENTING);
    }

    const daysSinceLastSession = this.lastSessionAt
      ? daysBetween(now, this.lastSessionAt)
      : Infinity;

    // AT RISK: absence relative to personal rhythm
    const avgGap = this._averageSessionGap();
    if (daysSinceLastSession > avgGap * 3 && daysSinceLastSession > 3) {
      return this._transitionTo(MacroState.AT_RISK);
    }

    // RECOVERING: just returned from At Risk
    if (this.macroState === MacroState.AT_RISK && daysSinceLastSession < 2) {
      return this._transitionTo(MacroState.RECOVERING);
    }
    if (this.macroState === MacroState.RECOVERING && this.recoverySessionCount < 3) {
      return MacroState.RECOVERING; // stay in recovery for a few sessions
    }

    // Exam proximity → Peak Readiness
    if (this.examDate && daysBetween(now, this.examDate) <= 14 && daysBetween(now, this.examDate) > 0) {
      return this._transitionTo(MacroState.PEAK_READINESS);
    }

    // WAVERING: accuracy drop or increasing gaps
    const recentAccuracy = this._recentAccuracy(recentSessions);
    const gapTrend = this._gapTrend(recentSessions);
    if (recentAccuracy < 0.5 || gapTrend === 'widening') {
      return this._transitionTo(MacroState.WAVERING);
    }

    // COMPOUNDING: high Reinforced ratio, strong consistency
    const concepts = Array.from(knowledgeGraph.nodes.values());
    const reinforcedRatio = concepts.filter(c => c.retentionState === 'reinforced').length
      / (concepts.length || 1);
    const consistency = this._consistencyScore(recentSessions);
    if (reinforcedRatio > 0.3 && consistency > 70 && recentAccuracy > 0.7) {
      return this._transitionTo(MacroState.COMPOUNDING);
    }

    // Default
    return this._transitionTo(MacroState.BUILDING);
  }

  _transitionTo(newState) {
    if (this.macroState !== newState) {
      this.macroStateHistory.push({ from: this.macroState, to: newState, at: Date.now() });
      this.macroState = newState;

      if (newState === MacroState.RECOVERING) {
        this.recoverySessionCount = 0;
      }
      if (newState === MacroState.AT_RISK) {
        this.atRiskTriggeredAt = Date.now();
      }
    }
    return this.macroState;
  }

  recordSession(session) {
    this.sessions.push(session);
    this.lastSessionAt = session.completedAt;
    this.totalQuestionsAnswered += session.questionsAnswered || 0;
    this.totalCorrect += session.correctCount || 0;

    if (this.macroState === MacroState.RECOVERING) {
      this.recoverySessionCount++;
    }
  }

  _averageSessionGap() {
    if (this.sessions.length < 2) return 7;
    const gaps = [];
    for (let i = 1; i < this.sessions.length; i++) {
      gaps.push(daysBetween(this.sessions[i].completedAt, this.sessions[i - 1].completedAt));
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    return Math.max(1, avg); // minimum 1 day
  }

  _recentAccuracy(sessions) {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((s, sess) => s + (sess.questionsAnswered || 0), 0);
    const correct = sessions.reduce((s, sess) => s + (sess.correctCount || 0), 0);
    return total > 0 ? correct / total : 0;
  }

  _gapTrend(sessions) {
    if (sessions.length < 4) return 'stable';
    const gaps = [];
    for (let i = 1; i < sessions.length; i++) {
      gaps.push(daysBetween(sessions[i].completedAt, sessions[i - 1].completedAt));
    }
    const firstHalf = gaps.slice(0, Math.floor(gaps.length / 2));
    const secondHalf = gaps.slice(Math.floor(gaps.length / 2));
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avg2 > avg1 * 1.5) return 'widening';
    if (avg2 < avg1 * 0.7) return 'tightening';
    return 'stable';
  }

  _consistencyScore(sessions) {
    const recent = sessions.slice(-7);
    if (recent.length === 0) return 0;
    const uniqueDays = new Set(recent.map(s => {
      const d = new Date(s.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;
    return Math.min(100, (uniqueDays / 7) * 100);
  }

  /**
   * Derived age in years, for tone calibration only (Student Intelligence
   * Model §1 — "keeps Kai's language calibrated, 14 vs 21-year-old
   * candidate"). Returns null if dateOfBirth was never set.
   */
  age() {
    if (!this.dateOfBirth) return null;
    const ageMs = Date.now() - this.dateOfBirth;
    return Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
  }

  _softenSessionTemporarily() {
    // Flag used by AdaptiveDifficulty
    this._tempSoftening = true;
  }

  toJSON() {
    return {
      studentId: this.studentId,
      authUserId: this.authUserId,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      pushExternalId: this.pushExternalId,
      examDate: this.examDate,
      targetSubjects: this.targetSubjects,
      targetCourse: this.targetCourse,
      dateOfBirth: this.dateOfBirth,
      examType: this.examType,
      examYear: this.examYear,
      targetUniversity: this.targetUniversity,
      targetUTMEScore: this.targetUTMEScore,
      registrationDate: this.registrationDate,
      preferredStudyDurationMin: this.preferredStudyDurationMin,
      preferredStudyPeriod: this.preferredStudyPeriod,
      device: this.device,
      referralSource: this.referralSource,
      parentGuardianContact: this.parentGuardianContact,
      languageRegion: this.languageRegion,
      macroState: this.macroState,
      macroStateHistory: this.macroStateHistory,
      learningState: this.learningState,
      learningStateHistory: this.learningStateHistory,
      journeyStage: this.journeyStage,
      journeyStageHistory: this.journeyStageHistory,
      reEngagement: this.reEngagement,
      crossModuleMilestones: this.crossModuleMilestones,
      continuation: this.continuation,
      comms: this.comms,
      learn: this.learn,
      onboarding: this.onboarding,
      notificationHistory: this.notificationHistory,
      completedChallenges: this.completedChallenges,
      challengeStreak: this.challengeStreak,
      totalXP: this.totalXP,
      badges: this.badges,
      preferences: this.preferences,
      sessions: this.sessions,
      responseTimeBaselines: this.responseTimeBaselines,
      eliteScoreHistory: this.eliteScoreHistory,
      createdAt: this.createdAt,
      lastSessionAt: this.lastSessionAt,
      totalQuestionsAnswered: this.totalQuestionsAnswered,
      totalCorrect: this.totalCorrect,
      streakData: this.streakData,
      atRiskTriggeredAt: this.atRiskTriggeredAt,
      recoverySessionCount: this.recoverySessionCount
    };
  }

  static fromJSON(data) {
    const p = new StudentProfile(data);
    Object.assign(p, data);
    return p;
  }
}
