/**
 * Kairo — ChannelSelector
 * Notifications & Communication Systems §4 — Channel Architecture.
 *
 * Resolves which of the five channels a given, already-approved
 * candidate should travel through — never decides WHETHER to send
 * (that's the SJEE Orchestrator, §1.3's boundary).
 */

import { Channel, NotificationCategory } from "../utils/constants.js";

export class ChannelSelector {
  constructor(consentManager) {
    this.consent = consentManager;
  }

  /**
   * §4.1's primary-use table + §4.5/§4.7's reserved-use restrictions.
   * Returns the best available, consented channel, or null if none is
   * available (§10.8 — silence, not delivery, when consent can't be
   * confirmed).
   * @param {object} candidate - { category, tier, isSharedArtifact?,
   *   winBackStage? } — tier from SJEE (time_critical/standard/low/
   *   informational), winBackStage/isSharedArtifact flag the WhatsApp
   *   reserved-use exceptions (§4.5) explicitly rather than inferring them.
   */
  selectChannel(candidate) {
    const { category, tier } = candidate;

    // §4.4 — Informational-tier content, and Milestone specifically,
    // defaults to the in-app centre — the lowest-friction channel,
    // never competes for the frequency budget, always available.
    if (category === NotificationCategory.MILESTONE) {
      return Channel.IN_APP;
    }
    if (tier === 'informational') {
      return Channel.IN_APP;
    }

    // §3.5 — Account & Administrative: SMS for security codes
    // specifically is more reliable than push for this narrow function.
    if (category === NotificationCategory.ACCOUNT_ADMIN) {
      if (candidate.isSecurityCode && this.consent.canSend(Channel.SMS, category)) {
        return Channel.SMS;
      }
      if (this.consent.canSend(Channel.PUSH, category)) return Channel.PUSH;
      if (this.consent.canSend(Channel.EMAIL, category)) return Channel.EMAIL;
      return Channel.IN_APP; // account admin still always visible in-app
    }

    // §3.1/§4.7 — Exam-Critical uses SMS specifically where connectivity
    // failure would be a real risk (flagged explicitly by the caller,
    // never inferred).
    if (category === NotificationCategory.EXAM_CRITICAL) {
      if (candidate.connectivityRisk && this.consent.canSend(Channel.SMS, category)) {
        return Channel.SMS;
      }
      if (this.consent.canSend(Channel.PUSH, category)) return Channel.PUSH;
      if (this.consent.canSend(Channel.SMS, category)) return Channel.SMS; // fallback per §4.8
      return null;
    }

    // §4.5 — WhatsApp reserved use: only for (a) Editorial content
    // explicitly followed, (b) win-back's broadened-channel stage,
    // (c) shareable artifacts the student is sending, not receiving
    // unprompted. Never for routine Academic Nudges/Standard reminders.
    if (category === NotificationCategory.EDITORIAL_BROADCAST && this.consent.canSend(Channel.WHATSAPP, category)) {
      return Channel.WHATSAPP;
    }
    if (category === NotificationCategory.REENGAGEMENT && candidate.winBackStage >= 1 &&
        this.consent.canSend(Channel.WHATSAPP, category)) {
      return Channel.WHATSAPP;
    }
    if (candidate.isSharedArtifact && this.consent.canSend(Channel.WHATSAPP, category)) {
      return Channel.WHATSAPP;
    }

    // §4.6 — Email reserved for archival/low-frequency content
    // (extended-absence win-back also eligible per SJEE §6.6).
    if (category === NotificationCategory.REENGAGEMENT && candidate.winBackStage >= 1 &&
        this.consent.canSend(Channel.EMAIL, category)) {
      return Channel.EMAIL;
    }

    // Default path — push if consented, else fall back to in-app so
    // the student still sees it the moment they open the product.
    if (this.consent.canSend(Channel.PUSH, category)) return Channel.PUSH;
    return Channel.IN_APP;
  }

  /**
   * §4.8 — fallback logic for Time-critical candidates specifically.
   * Escalates to the next most reliable channel on a delivery-failure
   * signal, never silently retrying the same channel, and never
   * escalating to WhatsApp without explicit opt-in for that purpose.
   */
  resolveFallback(candidate, failedChannel) {
    if (candidate.tier !== 'time_critical') return null; // fallback only applies to Time-critical

    if (failedChannel === Channel.PUSH && this.consent.canSend(Channel.SMS, candidate.category)) {
      return Channel.SMS;
    }
    return null; // no further fallback — never silently escalate to WhatsApp
  }
}
