/**
 * Kairo — ReviewModule
 * Dedicated revision experience, powered entirely by the Spaced Sandbox
 * protocol: Pending Repairs (Fading concepts + mistakes past their 72h
 * retest cooldown) and the Smart Patch session built from exactly those.
 */

import { RetentionState, ReviewConstants } from "../utils/constants.js";

export class ReviewModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  // ═══════════════════════════════════════════════════════════════
  // SPACED SANDBOX — Batch 1/2's Hero Metric + Triage Inbox
  // ═══════════════════════════════════════════════════════════════

  /**
   * Every question whose most recent attempt was incorrect, deduped to one
   * entry per question — a later *correct* attempt on the same question
   * clears it, since it's not a pending mistake anymore. Each entry's
   * cooldownUntil is either an explicit "I Understand" acknowledgment
   * (this.engine.mistakePatches) or, absent one, the natural 72h-from-the-
   * wrong-answer default — the Spaced Sandbox protocol covers every
   * mistake, not just ones a student has actively engaged with.
   */
  getMistakeLedger() {
    const graph = this.engine.graph;
    const patches = this.engine.mistakePatches;
    const latestByQuestion = new Map(); // questionId -> { attempt, conceptId, subject, topic }

    for (const concept of graph.nodes.values()) {
      for (const attempt of concept.attemptHistory) {
        if (!attempt.questionId) continue;
        const existing = latestByQuestion.get(attempt.questionId);
        if (!existing || attempt.timestamp > existing.attempt.timestamp) {
          latestByQuestion.set(attempt.questionId, { attempt, conceptId: concept.id, subject: concept.subject, topic: concept.topic });
        }
      }
    }

    const now = Date.now();
    const ledger = [];
    for (const [questionId, { attempt, conceptId, subject, topic }] of latestByQuestion) {
      if (attempt.correct) continue; // resolved by a later correct attempt
      const natural = attempt.timestamp + ReviewConstants.MISTAKE_COOLDOWN_MS;
      const explicit = patches.get(questionId);
      // A patch from *before* this exact wrong attempt (stale — an earlier
      // ack on a question that's since been missed again) must never let a
      // brand-new mistake skip its own cooldown; max() keeps whichever is
      // genuinely later, and a real ack made after this attempt (the normal
      // case) is naturally later than `natural` anyway.
      const cooldownUntil = explicit != null ? Math.max(explicit, natural) : natural;
      // "Acknowledged" (dismissed from the Triage Inbox) only when the
      // explicit patch actually governs this attempt — a stale patch that
      // lost to `natural` above describes a *previous* miss, not this one.
      const acknowledged = explicit != null && explicit >= natural;
      ledger.push({
        questionId,
        conceptId,
        subject,
        topic,
        missedAt: attempt.timestamp,
        errorTag: attempt.errorTag || null,
        cooldownUntil,
        ripe: cooldownUntil <= now,
        acknowledged
      });
    }
    return ledger.sort((a, b) => b.missedAt - a.missedAt);
  }

  /** Batch 1's Hero Metric — Fading concepts + ripe (cooldown-elapsed) mistakes. */
  getPendingRepairsCount() {
    const fadingCount = Array.from(this.engine.graph.nodes.values())
      .filter(c => c.retentionState === RetentionState.FADING).length;
    const ripeMistakes = this.getMistakeLedger().filter(m => m.ripe).length;
    return fadingCount + ripeMistakes;
  }

  /**
   * Batch 1's Smart Patch — a mixed session of exactly the ripe repairs:
   * every ripe mistake resurfaces the *exact same question* it missed
   * (retesting the same question is the whole point of "did this stick"),
   * topped up with one fresh question per fading concept not already
   * covered by one of those mistakes.
   */
  buildSmartPatchQuestionIds(limit = 20) {
    const fading = Array.from(this.engine.graph.nodes.values())
      .filter(c => c.retentionState === RetentionState.FADING);
    const ripeMistakes = this.getMistakeLedger().filter(m => m.ripe);

    const ids = [];
    const coveredConceptIds = new Set();
    for (const m of ripeMistakes) {
      if (ids.length >= limit) break;
      ids.push(m.questionId);
      if (m.conceptId) coveredConceptIds.add(m.conceptId);
    }
    for (const c of fading) {
      if (ids.length >= limit) break;
      if (coveredConceptIds.has(c.id)) continue;
      const q = this.engine.getQuestionForConcept(c.id, { excludeIds: ids });
      if (q) { ids.push(q.id); coveredConceptIds.add(c.id); }
    }
    return ids;
  }

  /** Batch 2's Triage Inbox — full ledger entries for mistakes missed in the last 72h, still cooling down and not yet acknowledged (an acknowledged one is dismissed from the inbox immediately, whether or not its cooldown has technically elapsed). */
  getRecentMistakes(limit = 20) {
    const now = Date.now();
    return this.getMistakeLedger()
      .filter(m => !m.acknowledged && (now - m.missedAt) < ReviewConstants.MISTAKE_COOLDOWN_MS)
      .slice(0, limit);
  }
}
