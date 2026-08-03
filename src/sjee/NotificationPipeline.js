/**
 * Kairo — NotificationPipeline
 *
 * The missing glue between the two halves of §1.3's pipeline:
 * "SJEE Orchestrator approves a candidate (send/hold/discard, tier,
 * timing window) -> CommsService resolves: channel, rendered content,
 * send time -> (transport layer, outside this module, actually
 * delivers it)". Before this, NotificationOrchestrator/CommsService/
 * TemplateEngine were each fully built and unit-tested in isolation but
 * never called from anywhere live — nothing gathered real candidates,
 * submitted them, or fed an approved candidate into CommsService in the
 * shape it actually expects.
 *
 * The two layers expect genuinely different candidate shapes: every
 * candidate source (NotificationEngine, ReEngagementEngine,
 * ContinuationEngine) produces pre-composed { type, tier, title, body,
 * action } — a finished sentence, already written to each module's own
 * spec-mandated tone rules. TemplateEngine.render() instead expects
 * { category, data: { observation, reason, benefit, action } } — raw
 * fact *slots* it composes into text itself. This module bridges that
 * by treating the already-composed `body` as the `observation` fact
 * verbatim — it does not rewrite, split, or invent any copy; every word
 * a student sees was already written by the module that generated the
 * candidate. TemplateEngine's own compliance/channel/voice logic still
 * runs on top of it exactly as designed.
 */

import { NotificationCategory } from "../utils/constants.js";

// type -> NotificationCategory. Covers every candidate type the current
// sources produce; an unmapped type falls back to ACADEMIC_NUDGE rather
// than being silently dropped, since that's the platform's default,
// lowest-stakes category.
const TYPE_TO_CATEGORY = {
  daily_recap: NotificationCategory.ACADEMIC_NUDGE,
  streak_gentle: NotificationCategory.MOTIVATIONAL,
  exam_proximity: NotificationCategory.EXAM_CRITICAL,
  weekly_reflection: NotificationCategory.MOTIVATIONAL,
  recovery: NotificationCategory.MOTIVATIONAL,
  reengagement_notable_gap: NotificationCategory.REENGAGEMENT,
  reengagement_at_risk: NotificationCategory.REENGAGEMENT,
  win_back: NotificationCategory.REENGAGEMENT,
  post_exam_acknowledgment: NotificationCategory.MOTIVATIONAL
};

function categoryFor(candidate) {
  if (candidate.type?.startsWith('milestone_')) return NotificationCategory.MILESTONE;
  return TYPE_TO_CATEGORY[candidate.type] || NotificationCategory.ACADEMIC_NUDGE;
}

/**
 * { type, tier, title, body, action } -> the shape CommsService.resolve()/
 * TemplateEngine.render() expects. `body` becomes the `observation` fact
 * verbatim — never split, reworded, or supplemented.
 */
export function candidateToTemplateInput(candidate, { macroState, journeyStage } = {}) {
  return {
    ...candidate,
    category: categoryFor(candidate),
    data: {
      observation: candidate.body,
      action: candidate.action || null
    },
    macroState,
    journeyStage
  };
}

export class NotificationPipeline {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  /**
   * §8.2/§10.2 — the post-exam immediate window suppresses ordinary
   * SJEE machinery entirely; anything worth saying in that window is
   * ContinuationEngine's own single acknowledgment, nothing else.
   */
  _gatherCandidates() {
    if (this.engine.continuation.isInImmediateWindow()) {
      const ack = this.engine.continuation.checkImmediateWindow();
      return ack ? [ack] : [];
    }

    const candidates = [];

    candidates.push(...this.engine.notifications.checkNotifications());

    const reengageCandidate = this.engine.reEngagement.generateCandidate(this.engine.graph);
    if (reengageCandidate) candidates.push(reengageCandidate);

    const emotionalStates = this.engine.emotionalProfile.compute(this.engine.graph);
    const milestones = this.engine.crossModuleMilestones.check(this.engine.graph, emotionalStates);
    for (const m of milestones) {
      candidates.push({
        type: `milestone_${m.category}`,
        tier: 'informational',
        title: 'Milestone',
        body: m.framing,
        action: null
      });
    }

    return candidates;
  }

  /**
   * Full pass: gather -> submit -> arbitrate -> resolve. Returns the
   * list of { candidate, resolved } pairs actually cleared for
   * delivery — `resolved` is CommsService.resolve()'s output (channel,
   * rendered text, send time), ready to hand to a transport (e.g.
   * OneSignalTransport). Candidates that don't survive arbitration or
   * resolution (no consent, tone failure, dedup) are simply absent —
   * per §5.4/§10.8, that's a legitimate "say nothing" outcome, not an
   * error.
   *
   * Delivery/transport is deliberately NOT done here — same boundary
   * CommsService.resolve() itself already draws ("transport layer,
   * outside this module"). The caller decides what "actually send it"
   * means (OneSignalTransport, a queue, whatever).
   */
  run() {
    const candidates = this._gatherCandidates();
    for (const c of candidates) {
      this.engine.notificationOrchestrator.submit(c);
    }

    const approved = this.engine.notificationOrchestrator.arbitrate();

    const deliverable = [];
    for (const candidate of approved) {
      const templateInput = candidateToTemplateInput(candidate, {
        macroState: this.engine.profile.macroState,
        journeyStage: this.engine.profile.journeyStage
      });
      const resolved = this.engine.comms.resolve(templateInput);
      if (resolved) {
        deliverable.push({ candidate, resolved });
      }
    }

    return deliverable;
  }

  /**
   * Call once a deliverable candidate has actually been handed to
   * transport — records it (NotificationEngine's one-time dedup +
   * CommsService's own dedup/interaction log) so it isn't reconsidered
   * on the next run().
   */
  recordDelivered(candidate, resolved) {
    this.engine.notifications.markAsRead(candidate.id || candidate.candidateId || candidate.type);
    this.engine.comms.recordSent(candidate, resolved);
  }
}
