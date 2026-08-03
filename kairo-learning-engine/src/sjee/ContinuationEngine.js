/**
 * Kairo — ContinuationEngine
 * Student Journey & Engagement Engine §10 — Continuation: The Post-Exam Journey.
 *
 * Owns what happens once a student's exam date has passed. The exam
 * date is not the end of the data (§10.1) — the Knowledge Map, attempt
 * history, and full Student Intelligence Model persist untouched
 * (append-only, per Student Intelligence Model §2). What changes is
 * what Kairo is FOR, from the student's perspective.
 */

import { ContinuationPath, JourneyStage, JourneyConstants } from "../utils/constants.js";

export class ContinuationEngine {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.postExamAcknowledgmentSent = false;
    this.continuationPath = null; // set once the immediate window passes and a path is determined
  }

  /**
   * §10.2 — the immediate post-exam window. Returns a single, low-key
   * acknowledgment candidate if one hasn't been sent yet and the exam
   * has just passed — never presumes the outcome, never asks for a
   * result.
   */
  checkImmediateWindow() {
    if (!this.profile.examDate) return null;
    const daysSinceExam = (Date.now() - this.profile.examDate) / (24 * 60 * 60 * 1000);
    if (daysSinceExam < 0) return null; // exam hasn't happened yet

    if (daysSinceExam <= JourneyConstants.POST_EXAM_QUIET_WINDOW_DAYS) {
      if (!this.postExamAcknowledgmentSent) {
        this.postExamAcknowledgmentSent = true;
        return {
          type: 'post_exam_acknowledgment',
          tier: 'informational',
          title: 'Kairo',
          body: "Your exam is behind you now. However it went, the work you put in was real.",
          action: null
        };
      }
      return null; // within the quiet window but acknowledgment already sent — stay silent
    }

    return null; // past the quiet window — checkContinuationPath() takes over
  }

  /**
   * Whether the immediate post-exam window is still active — callers
   * (Orchestrator, re-engagement, milestones) use this to suppress
   * their own ordinary machinery per §10.2/§8.2's Culmination-mirroring
   * near-silence.
   */
  isInImmediateWindow() {
    if (!this.profile.examDate) return false;
    const daysSinceExam = (Date.now() - this.profile.examDate) / (24 * 60 * 60 * 1000);
    return daysSinceExam >= 0 && daysSinceExam <= JourneyConstants.POST_EXAM_QUIET_WINDOW_DAYS;
  }

  /**
   * §10.3 — determine the Continuation path. Never inferred silently
   * for a decision this consequential — routes on explicit student
   * input (profile.continuationIntent) where available, falling back
   * to the standard result-pending case otherwise.
   * @param {string} [explicitIntent] - 'repeat' | 'post_utme' | 'departure', student-declared
   */
  determineContinuationPath(explicitIntent = null) {
    if (this.isInImmediateWindow()) return null; // too early to route

    if (explicitIntent === 'repeat') {
      this.continuationPath = ContinuationPath.REPEAT_CANDIDATE;
    } else if (explicitIntent === 'post_utme') {
      this.continuationPath = ContinuationPath.POST_UTME;
    } else if (explicitIntent === 'departure') {
      this.continuationPath = ContinuationPath.DEPARTURE;
    } else if (!this.continuationPath) {
      // Standard case — no explicit signal yet, results not confirmed.
      this.continuationPath = ContinuationPath.RESULT_PENDING;
    }

    return this.continuationPath;
  }

  /**
   * §10.4 — a repeat candidate's Journey Stage restarts at
   * Establishment, never Arrival. This is a "new season," not a new
   * relationship — the prior Knowledge Map is preserved and treated as
   * valuable signal.
   * @param {JourneyStageTracker} journeyStageTracker
   */
  applyRepeatCandidateReset(journeyStageTracker) {
    if (this.continuationPath !== ContinuationPath.REPEAT_CANDIDATE) {
      throw new Error('applyRepeatCandidateReset() called without a confirmed repeat-candidate path — call determineContinuationPath("repeat") first.');
    }
    journeyStageTracker.currentStage = JourneyStage.ESTABLISHMENT;
    journeyStageTracker.stageHistory.push({
      from: JourneyStage.CONTINUATION,
      to: JourneyStage.ESTABLISHMENT,
      at: Date.now(),
      note: 'repeat_candidate_new_season'
    });
    journeyStageTracker.profile.journeyStage = JourneyStage.ESTABLISHMENT;
    journeyStageTracker.profile.journeyStageHistory = journeyStageTracker.stageHistory;

    // Reset the exam-countdown-driven fields so Journey Stage
    // recomputation works correctly for the new attempt.
    this.postExamAcknowledgmentSent = false;
    this.continuationPath = null;
  }

  /**
   * §10.5 — never solicit an outcome for product purposes. This method
   * exists specifically so no other module accidentally builds a
   * "let us know how it went!" style prompt — that request belongs to
   * TECHMED's marketing/community layers, not the SJEE.
   */
  shouldSolicitOutcome() {
    return false;
  }

  toJSON() {
    return {
      postExamAcknowledgmentSent: this.postExamAcknowledgmentSent,
      continuationPath: this.continuationPath
    };
  }

  static fromJSON(profile, data) {
    const engine = new ContinuationEngine(profile);
    if (data) {
      engine.postExamAcknowledgmentSent = data.postExamAcknowledgmentSent || false;
      engine.continuationPath = data.continuationPath || null;
    }
    return engine;
  }
}
