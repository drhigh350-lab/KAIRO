/**
 * Kairo — RecommendationEngine
 * The brain that decides: "What is the next best thing this student should do right now?"
 * 
 * Operates at two levels:
 *   1. Session-level: builds a prioritized queue when a student opens Kairo.
 *   2. Question-level: re-evaluates after EVERY answer and can interrupt the queue.
 */

import { RetentionState, SessionConstants, ErrorTag } from "../utils/constants.js";
import { clamp, seededShuffle, daysBetween } from "../utils/helpers.js";

export class RecommendationEngine {
  constructor({ knowledgeGraph, studentProfile, decayModel, examDate = null }) {
    this.graph = knowledgeGraph;
    this.profile = studentProfile;
    this.decayModel = decayModel;
    this.examDate = examDate;
    this.sessionQueue = [];        // ordered list of concept IDs for this session
    this.sessionHistory = [];      // concepts already covered this session
    this.fatigueCounter = 0;       // consecutive careless slips
    this.interruptionBuffer = [];  // concepts inserted mid-session (prerequisites, diagnostics)
  }

  // ═══════════════════════════════════════════════════════════════
  // SESSION-LEVEL: Build the plan when student opens Kairo
  // ═══════════════════════════════════════════════════════════════

  buildSessionPlan() {
    const all = Array.from(this.graph.nodes.values());
    const scored = all.map(c => ({
      concept: c,
      score: this._sessionPriorityScore(c)
    }));

    scored.sort((a, b) => b.score - a.score);

    // Respect macro-state session length cap
    const maxLen = this._sessionLengthCap();
    const selected = scored.slice(0, maxLen).map(s => s.concept.id);

    // Interleave: don't put all revision first, mix with new
    this.sessionQueue = this._interleaveQueue(selected);
    this.sessionHistory = [];
    this.fatigueCounter = 0;
    this.interruptionBuffer = [];

    return this.sessionQueue.slice(); // return copy
  }

  _sessionPriorityScore(concept) {
    let score = 0;

    // 1. URGENT DECAY (highest priority)
    if (concept.retentionState === RetentionState.FADING) {
      score += 1000 + (concept.decayEstimate * 100);
    }

    // 2. ACTIVE GAPS blocking progress
    if (concept.retentionState === RetentionState.FORMING) {
      const isPrerequisite = Array.from(this.graph.nodes.values())
        .some(n => n.dependencyIds.includes(concept.id) && n.retentionState !== RetentionState.UNSEEN);
      score += isPrerequisite ? 600 : 400;
    }

    // 3. MACRO-STATE adjustment (handled via session length cap, not score)
    // Wavering/Recovering students get shorter sessions via _sessionLengthCap()

    // 4. EXAM PROXIMITY: boost mixed-topic readiness
    if (this.examDate) {
      const weeksOut = daysBetween(Date.now(), this.examDate) / 7;
      if (weeksOut <= 8 && weeksOut > 0) {
        // Prioritize Held concepts that haven't been seen recently (pressure-testing)
        if (concept.retentionState === RetentionState.HELD && concept.decayEstimate < 0.7) {
          score += 200;
        }
      }
    }

    // 5. BREADTH GUARANTEE: touch unseen or stale topics
    if (concept.retentionState === RetentionState.UNSEEN) {
      score += 50;
    }

    // Penalize recently practiced (unless Fading)
    const hoursSince = concept.lastSeenAt
      ? (Date.now() - concept.lastSeenAt) / (1000 * 60 * 60)
      : Infinity;
    if (hoursSince < 2 && concept.retentionState !== RetentionState.FADING) {
      score -= 300;
    }

    return score;
  }

  _interleaveQueue(conceptIds) {
    // Split into revision (Fading/Forming) and new/compounding (Held/Reinforced/Unseen)
    const revision = [];
    const fresh = [];
    for (const id of conceptIds) {
      const c = this.graph.getConcept(id);
      if (c.retentionState === RetentionState.FADING || c.retentionState === RetentionState.FORMING) {
        revision.push(id);
      } else {
        fresh.push(id);
      }
    }

    // Interleave: revision, fresh, revision, fresh...
    const interleaved = [];
    let r = 0, f = 0;
    while (r < revision.length || f < fresh.length) {
      if (r < revision.length) interleaved.push(revision[r++]);
      if (f < fresh.length) interleaved.push(fresh[f++]);
    }
    return interleaved;
  }

  _sessionLengthCap() {
    const macro = this.profile.macroState;
    switch (macro) {
      case 'wavering':
      case 'recovering':
        return SessionConstants.MIN_SESSION_LENGTH;
      case 'orienting':
        return 10;
      case 'peak_readiness':
        return SessionConstants.MAX_SESSION_LENGTH;
      default:
        return SessionConstants.DEFAULT_SESSION_LENGTH;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // QUESTION-LEVEL: Decide the very next question after each answer
  // ═══════════════════════════════════════════════════════════════

  /**
   * Call this after EVERY student answer.
   * @param {Object} result — {conceptId, correct, responseTimeMs, errorTag, questionId, difficulty}
   * @returns {Object} decision — { nextConceptId, action, reason }
   */
  processAnswer(result) {
    const concept = this.graph.getConcept(result.conceptId);
    if (!concept) {
      return { nextConceptId: this._peekQueue(), action: 'continue', reason: 'Concept not found' };
    }

    // Update the concept node
    concept.recordAttempt(result);
    this.sessionHistory.push(result.conceptId);

    // Update fatigue tracking
    if (result.errorTag === ErrorTag.CARELESS_SLIP) {
      this.fatigueCounter++;
    } else if (result.correct) {
      this.fatigueCounter = Math.max(0, this.fatigueCounter - 1);
    } else {
      this.fatigueCounter = 0;
    }

    // ═══ INTERRUPT LOGIC ═══

    // A. Prerequisite gap detected
    if (result.errorTag === ErrorTag.CONCEPTUAL_GAP) {
      const weakPrereqs = this.graph.findWeakPrerequisites(result.conceptId);
      if (weakPrereqs.length > 0) {
        const target = weakPrereqs[0];
        this.interruptionBuffer.push(target.id);
        return {
          nextConceptId: target.id,
          action: 'reroute_prerequisite',
          reason: `Prerequisite "${target.name}" needs reinforcement before continuing.`
        };
      }
    }

    // B. Guessed → diagnostic
    if (result.errorTag === ErrorTag.GUESSED) {
      return {
        nextConceptId: result.conceptId,
        action: 'diagnostic',
        reason: 'Response pattern suggests guessing. Serving a lower-stakes diagnostic question.'
      };
    }

    // C. Careless slip → brief nudge, continue normally
    if (result.errorTag === ErrorTag.CARELESS_SLIP) {
      // Don't re-teach; just flag for Kai
    }

    // D. Fatigue detection
    if (this.fatigueCounter >= SessionConstants.FATIGUE_SLIP_THRESHOLD) {
      this.profile._softenSessionTemporarily();
      return {
        nextConceptId: this._peekQueue(),
        action: 'difficulty_pullback',
        reason: 'Multiple careless slips detected. Temporarily reducing difficulty.'
      };
    }

    // E. Correct on Fading → mark Reinforced candidate, continue
    if (result.correct && concept.retentionState === RetentionState.REINFORCED) {
      // This is a milestone moment — caller should trigger Wisdom Spark
    }

    // F. Correct on already-Held → reduce future priority slightly
    if (result.correct && concept.retentionState === RetentionState.HELD) {
      // Handled by priority score naturally (lastSeenAt updated)
    }

    // Pull from interruption buffer first, then main queue
    const nextId = this._dequeueNext();
    return {
      nextConceptId: nextId,
      action: nextId ? 'continue' : 'end_session',
      reason: nextId ? 'Proceeding to next queued concept.' : 'Session queue complete.'
    };
  }

  _peekQueue() {
    if (this.interruptionBuffer.length > 0) return this.interruptionBuffer[0];
    if (this.sessionQueue.length > 0) return this.sessionQueue[0];
    return null;
  }

  _dequeueNext() {
    if (this.interruptionBuffer.length > 0) {
      return this.interruptionBuffer.shift();
    }
    while (this.sessionQueue.length > 0) {
      const id = this.sessionQueue.shift();
      // Skip if already done enough this session
      const timesThisSession = this.sessionHistory.filter(h => h === id).length;
      if (timesThisSession < 2) return id;
    }
    return null;
  }

  /**
   * Check if session should end early.
   * The engine is allowed to say "you've done enough for today."
   */
  shouldEndSession() {
    const macro = this.profile.macroState;
    const sessionLen = this.sessionHistory.length;

    // Wavering/Recovering: shorter sessions
    if ((macro === 'wavering' || macro === 'recovering') && sessionLen >= 8) {
      return { end: true, reason: 'Gentle session limit reached. Come back tomorrow.' };
    }

    // Queue exhausted
    if (this.sessionQueue.length === 0 && this.interruptionBuffer.length === 0) {
      return { end: true, reason: 'All planned concepts covered.' };
    }

    return { end: false };
  }
}
