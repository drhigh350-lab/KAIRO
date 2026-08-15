/**
 * Kairo — NotificationOrchestrator
 * Student Journey & Engagement Engine §5 — Notification Orchestration.
 *
 * Governing constraint (§5.2): NO module sends a notification directly.
 * Every module that wants to notify a student submits a candidate here;
 * this is the only thing that decides what actually reaches the student,
 * in what order, and how many per day.
 *
 * This class does not send anything itself (no push/SMS/WhatsApp
 * transport) — it decides WHAT survives and on WHICH channel, and
 * hands the surviving candidates to whatever transport layer the
 * caller wires in (kept out of this module deliberately, so it stays
 * testable without a real notification provider).
 */

import { NotificationTier, JourneyStage } from "../utils/constants.js";

const MAX_CANDIDATE_QUEUE = 200; // sanity ceiling, not a spec'd number

export class NotificationOrchestrator {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.candidates = [];          // pending, not yet arbitrated
    this.deliveryLog = [];         // { candidateId, deliveredAt, channel, tier }
    this.dismissalLog = [];        // { candidateType, dismissedAt }
    // Per-student, per-candidate-type effective priority adjustment —
    // §5.8, inferred from behavior, never a global tuning knob.
    this.typeSuppressionScores = {}; // { candidateType: number of consecutive dismissals }
    // §9.7 — an explicit, direct "stop contacting me" request. Distinct
    // from ordinary Profile-level notification tuning (§5.6): this
    // overrides EVERY candidate and EVERY tier including Time-critical.
    // The one exception (account-critical, non-marketing communication
    // like a security notice) sits entirely outside this class's scope
    // by design — it is never routed through the Orchestrator at all,
    // so there is nothing here that would need to bypass this flag.
    this.hardOptOut = false;
  }

  /**
   * §9.7 — honour an explicit, direct request to stop all outbound
   * contact immediately and completely. This is stronger than any
   * per-candidate-type suppression or Profile-level frequency setting;
   * once set, arbitrate() returns nothing at all until cleared.
   */
  setHardOptOut(value) {
    this.hardOptOut = value;
  }

  /**
   * Submit a candidate notification. Does not send it — just queues it
   * for the next arbitration pass. Matches §5.3's shape: every source
   * module supplies its own priority claim and content, but the
   * Orchestrator alone decides what survives.
   *
   * @param {object} candidate
   * @param {string} candidate.type - e.g. 'urgent_decay', 'challenge_live', 'streak_slack'
   * @param {string} candidate.tier - NotificationTier
   * @param {string} candidate.title
   * @param {string} candidate.body
   * @param {string} [candidate.action]
   * @param {number} [candidate.deadline] - timestamp; required for time_critical
   * @param {string[]} [candidate.validJourneyStages] - omit = valid at any stage
   */
  submit(candidate) {
    if (this.candidates.length >= MAX_CANDIDATE_QUEUE) {
      this.candidates.shift(); // drop oldest rather than grow unbounded
    }
    this.candidates.push({
      ...candidate,
      candidateId: `cand_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      submittedAt: Date.now()
    });
  }

  /**
   * Run the full arbitration pass: hard gates -> priority selection ->
   * frequency budget -> channel selection. Returns the notifications
   * that should actually be delivered right now.
   *
   * @param {object} kaiToneChecker - anything with .isCompliant(text) —
   *   injected rather than imported directly, so this module doesn't
   *   need to know KaiBehavior's internals, only that a tone check exists.
   */
  arbitrate(kaiToneChecker = null) {
    // §9.7 — overrides everything else, including Time-critical.
    // Candidates remain queued (not discarded) in case the opt-out is
    // later cleared, but nothing is delivered while it's active.
    if (this.hardOptOut) {
      return [];
    }

    const surviving = this.candidates.filter(c =>
      this._passesToneGate(c, kaiToneChecker) &&
      this._passesJourneyStageGate(c) &&
      !this._isSuppressed(c)
    );

    const selected = this._applyFrequencyBudget(surviving);

    const withChannel = selected.map(c => ({
      ...c,
      channel: this._selectChannel(c)
    }));

    // Remove selected + any hard-gate-failed candidates from the queue —
    // failed candidates are discarded silently per §5.4, not retried.
    const selectedIds = new Set(selected.map(c => c.candidateId));
    this.candidates = this.candidates.filter(c =>
      !selectedIds.has(c.candidateId) && surviving.includes(c)
    );

    for (const c of withChannel) {
      this.deliveryLog.push({
        candidateId: c.candidateId,
        deliveredAt: Date.now(),
        channel: c.channel,
        tier: c.tier
      });
    }

    return withChannel;
  }

  /**
   * §5.4 Gate 1 — tone compliance. A push notification IS Kai speaking,
   * so it's held to the identical hard tone rules (Learning Engine
   * Phase 2 §7.2). No guilt language, no comparative framing survives.
   */
  _passesToneGate(candidate, kaiToneChecker) {
    if (!kaiToneChecker || typeof kaiToneChecker.isCompliant !== 'function') {
      // No checker wired in — fail open with a conservative built-in
      // check rather than silently skipping the gate entirely.
      return this._basicToneCheck(candidate.body) && this._basicToneCheck(candidate.title || '');
    }
    return kaiToneChecker.isCompliant(candidate.body) && kaiToneChecker.isCompliant(candidate.title || '');
  }

  /**
   * Conservative fallback tone check — catches the most obvious
   * violations (guilt language, comparison) when no full KaiBehavior
   * checker is wired in. Not a substitute for the real thing.
   */
  _basicToneCheck(text) {
    const banned = [
      /falling behind/i, /you should have/i, /everyone else/i,
      /other students/i, /you failed/i, /you're behind/i, /catch up or/i
    ];
    return !banned.some(re => re.test(text));
  }

  /**
   * §5.4 Gate 2 — Journey Stage appropriateness. A candidate valid for
   * one stage (e.g. a streak-recovery nudge, which assumes streak
   * history) may be meaningless or wrong at another (an Activation-stage
   * student with no streak yet).
   */
  _passesJourneyStageGate(candidate) {
    if (!candidate.validJourneyStages) return true; // no restriction declared
    const currentStage = this.profile.journeyStage || JourneyStage.ARRIVAL;
    return candidate.validJourneyStages.includes(currentStage);
  }

  /**
   * §5.8 — a candidate type consistently dismissed has its effective
   * priority lowered for this student; three or more consecutive
   * dismissals of the identical type suppresses it outright until the
   * pattern breaks. Never overrides an explicit Profile-level opt-out,
   * which is checked separately by the caller before candidates are
   * even submitted (this method only handles the inferred signal).
   */
  _isSuppressed(candidate) {
    const score = this.typeSuppressionScores[candidate.type] || 0;
    return score >= 3 && candidate.tier !== NotificationTier.TIME_CRITICAL;
  }

  /**
   * Call when a delivered notification is dismissed without leading to
   * a session — feeds §5.8's per-student, per-type learning.
   */
  recordDismissal(candidateType) {
    this.dismissalLog.push({ candidateType, dismissedAt: Date.now() });
    this.typeSuppressionScores[candidateType] = (this.typeSuppressionScores[candidateType] || 0) + 1;
  }

  /**
   * Call when a delivered notification DOES lead to a session — resets
   * the suppression counter, since the pattern broke.
   */
  recordEngagement(candidateType) {
    this.typeSuppressionScores[candidateType] = 0;
  }

  /**
   * §5.6 — the frequency budget. At most one Standard-tier push per
   * day, at most one Low-tier notification per 3-day window.
   * Time-critical overrides the budget (§5.5 — the student's own prior
   * action created the urgency). Informational never competes for a
   * slot at all (§5.5) — always delivered, just through the lowest-
   * friction channel.
   */
  _applyFrequencyBudget(candidates) {
    const timeCritical = candidates.filter(c => c.tier === NotificationTier.TIME_CRITICAL);
    const informational = candidates.filter(c => c.tier === NotificationTier.INFORMATIONAL);
    const standard = candidates.filter(c => c.tier === NotificationTier.STANDARD);
    const low = candidates.filter(c => c.tier === NotificationTier.LOW);

    const selected = [...timeCritical, ...informational];

    if (!this._hasStandardToday()) {
      const bestStandard = this._selectHighestPriority(standard);
      if (bestStandard) selected.push(bestStandard);
    }

    if (!this._hasLowInWindow(3)) {
      const bestLow = this._selectHighestPriority(low);
      if (bestLow) selected.push(bestLow);
    }

    return selected;
  }

  _hasStandardToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.deliveryLog.some(d => d.tier === NotificationTier.STANDARD && d.deliveredAt >= startOfDay.getTime());
  }

  _hasLowInWindow(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.deliveryLog.some(d => d.tier === NotificationTier.LOW && d.deliveredAt >= cutoff);
  }

  /**
   * Where multiple Standard-tier candidates compete for the single
   * daily slot, selection uses the same priority logic as session
   * planning (DDE §3.2) — Urgent Decay and Critical gaps outrank
   * ordinary weak-concept/backlog candidates. Modeled here via an
   * explicit priorityWeight the submitting module can set; defaults
   * to a neutral weight if omitted.
   */
  _selectHighestPriority(candidates) {
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => (b.priorityWeight || 0) - (a.priorityWeight || 0))[0];
  }

  /**
   * §5.9 Channel selection table.
   */
  _selectChannel(candidate) {
    if (candidate.tier === NotificationTier.TIME_CRITICAL) return 'push';
    if (candidate.tier === NotificationTier.INFORMATIONAL) return 'in_app_badge';
    if (candidate.tier === NotificationTier.LOW) {
      const dismissedOften = (this.typeSuppressionScores[candidate.type] || 0) >= 1;
      return dismissedOften ? 'in_app_badge' : 'push';
    }
    return 'push'; // standard tier default
  }

  /**
   * Persist the frequency budget, suppression learning, and dismissal/
   * delivery history — this class had no toJSON()/fromJSON() at all, so
   * every one of these silently reset to empty on every reload. That
   * broke §5.6's "at most one Standard push per day, one Low per 3-day
   * window" the moment a student refreshed mid-day (the budget forgot
   * anything had been sent), and §5.8's per-type suppression learning
   * never survived past the current tab. `candidates` (still-pending,
   * unarbitrated submissions) is deliberately NOT persisted — those are
   * regenerated fresh from live state on the next check, not a queue
   * that should survive a reload stale.
   */
  toJSON() {
    return {
      deliveryLog: this.deliveryLog,
      dismissalLog: this.dismissalLog,
      typeSuppressionScores: this.typeSuppressionScores,
      hardOptOut: this.hardOptOut
    };
  }

  static fromJSON(profile, data) {
    const orchestrator = new NotificationOrchestrator(profile);
    if (data) {
      orchestrator.deliveryLog = data.deliveryLog || [];
      orchestrator.dismissalLog = data.dismissalLog || [];
      orchestrator.typeSuppressionScores = data.typeSuppressionScores || {};
      orchestrator.hardOptOut = data.hardOptOut || false;
    }
    return orchestrator;
  }
}
