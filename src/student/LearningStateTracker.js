/**
 * Kairo — LearningStateTracker
 * Student Intelligence Model §5.
 *
 * Learning States describe what MODE the current stretch of work is in.
 * A student can cycle through several of these within a single
 * Macro-State (Phase 1 §3) — e.g. a student in the "Building" Macro-State
 * might move between Discovering, Practising, and Reinforcing week to
 * week. Learning States are operational, never surfaced to the student
 * as a badge or status (§5, closing line).
 *
 * Exactly one Learning State is active at a time (unlike EmotionalProfile,
 * where multiple states can co-occur).
 */

import { LearningState, MacroState } from "../utils/constants.js";
import { daysBetween } from "../utils/helpers.js";

const PLATEAU_WINDOW_SESSIONS = 10; // "extended window" for plateau detection

export class LearningStateTracker {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.currentState = LearningState.NEW_LEARNER;
    this.stateHistory = []; // { from, to, at }
  }

  /**
   * Recompute the current Learning State from the student's behavior
   * and knowledge graph. Entry/exit conditions per §5's table.
   */
  compute(graph) {
    const concepts = Array.from(graph.nodes.values());
    const sessions = this.profile.sessions;
    const next = this._determine(concepts, sessions);
    return this._transitionTo(next);
  }

  _determine(concepts, sessions) {
    // New learner: zero or near-zero attempt history.
    if (this.profile.totalQuestionsAnswered < 5) {
      return LearningState.NEW_LEARNER;
    }

    // Recovering takes priority — mirrors Macro-State's own Recovering
    // (Phase 1 §3.1), entered on return after an At Risk gap.
    if (this.profile.macroState === MacroState.RECOVERING) {
      return LearningState.RECOVERING;
    }

    // Exam sprint: inside the final 1-2 weeks pre-exam. Overtakes
    // everything except Recovering, per §5's stated priority ordering
    // (exam sprint is listed as entered "inside the final 1-2 weeks
    // pre-exam" regardless of other conditions).
    if (this.profile.examDate) {
      const daysToExam = daysBetween(Date.now(), this.profile.examDate);
      if (daysToExam >= 0 && daysToExam <= 14) {
        return LearningState.EXAM_SPRINT;
      }
      // Revising: exam proximity crosses the compression threshold
      // (Phase 2 §5.2's 6-8 week window) but hasn't reached sprint yet.
      if (daysToExam > 14 && daysToExam <= 56) {
        return LearningState.REVISING;
      }
    }

    // Plateau: sustained Practising/Building behavior with no Elite
    // Score or Reinforced-count movement over an extended window.
    if (this._isPlateaued()) {
      return LearningState.PLATEAU;
    }

    // Discovering: diagnostic pass complete but concept map still
    // mostly Forming/Unseen.
    const unseenOrForming = concepts.filter(c => ['unseen', 'forming'].includes(c.retentionState)).length;
    const majorityUnseenOrForming = concepts.length > 0 && (unseenOrForming / concepts.length) > 0.5;
    if (majorityUnseenOrForming) {
      return LearningState.DISCOVERING;
    }

    // Mastery maintenance: subject/topic mastery consistently high
    // with low active Fading.
    const heldOrReinforced = concepts.filter(c => ['held', 'reinforced'].includes(c.retentionState)).length;
    const fading = concepts.filter(c => c.retentionState === 'fading').length;
    const highMastery = concepts.length > 0 && (heldOrReinforced / concepts.length) > 0.8;
    const lowFading = concepts.length > 0 && (fading / concepts.length) < 0.1;
    if (highMastery && lowFading) {
      return LearningState.MASTERY_MAINTENANCE;
    }

    // Reinforcing: high density of Fading concepts due for revision.
    const fadingRatio = concepts.length > 0 ? fading / concepts.length : 0;
    if (fadingRatio > 0.3) {
      return LearningState.REINFORCING;
    }

    // Default working mode — most session time lives here.
    return LearningState.PRACTISING;
  }

  /**
   * "Sustained Practising/Building behavior with no Elite Score or
   * Reinforced-count movement over an extended window."
   */
  _isPlateaued() {
    const history = this.profile.eliteScoreHistory.slice(-PLATEAU_WINDOW_SESSIONS);
    if (history.length < PLATEAU_WINDOW_SESSIONS) return false;

    const scores = history.map(h => h.total ?? h.score ?? 0);
    const scoreMovement = Math.max(...scores) - Math.min(...scores);
    const noScoreMovement = scoreMovement < 2; // effectively flat

    // Plateau requires flat score AND the student is still putting in
    // sustained sessions (otherwise this is At Risk/Wavering territory,
    // not plateau) — only Practising/Building-shaped Macro-States count.
    const inNormalOperatingMode = [MacroState.BUILDING, MacroState.COMPOUNDING].includes(this.profile.macroState);

    return noScoreMovement && inNormalOperatingMode;
  }

  _transitionTo(newState) {
    if (this.currentState !== newState) {
      this.stateHistory.push({ from: this.currentState, to: newState, at: Date.now() });
      this.currentState = newState;
    }
    // Mirror onto the profile object (same pattern as macroState/
    // macroStateHistory) so it round-trips through StudentProfile's
    // existing toJSON()/fromJSON() without a separate persistence path.
    this.profile.learningState = this.currentState;
    this.profile.learningStateHistory = this.stateHistory;
    return this.currentState;
  }

  toJSON() {
    return {
      currentState: this.currentState,
      stateHistory: this.stateHistory
    };
  }

  static fromJSON(profile, data) {
    const tracker = new LearningStateTracker(profile);
    if (data) {
      tracker.currentState = data.currentState || LearningState.NEW_LEARNER;
      tracker.stateHistory = data.stateHistory || [];
    } else if (profile.learningState) {
      // Fall back to reading straight off the profile if no explicit
      // tracker snapshot was passed (e.g. profile loaded independently).
      tracker.currentState = profile.learningState;
      tracker.stateHistory = profile.learningStateHistory || [];
    }
    return tracker;
  }
}
