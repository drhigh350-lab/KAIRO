/**
 * Kairo — CommsService
 * Notifications & Communication Systems — coordinates Sections 4–7.
 *
 * §1.3's pipeline, implemented:
 *   SJEE Orchestrator approves a candidate (send/hold/discard, tier, timing window)
 *   -> CommsService resolves: channel, rendered content, send time
 *   -> (transport layer, outside this module, actually delivers it)
 *   -> interaction outcome logs back, feeding SJEE §5.8's learning loop
 *
 * This service never overrides an Orchestrator send/hold/discard
 * decision — it only exists once that decision is already "send."
 */

import { TemplateEngine } from "./TemplateEngine.js";
import { ConsentManager } from "./ConsentManager.js";
import { ChannelSelector } from "./ChannelSelector.js";
import { TimingEngine } from "./TimingEngine.js";
import { NotificationCategory } from "../utils/constants.js";

export class CommsService {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.consent = new ConsentManager(studentProfile);
    this.channelSelector = new ChannelSelector(this.consent);
    this.templateEngine = new TemplateEngine();
    this.timingEngine = new TimingEngine();
    this.interactionLog = []; // { notificationId, delivered, opened, actedUpon }
    this.recentSends = []; // for §6.4 deduplication — { factKey, sentAt }
  }

  /**
   * Resolve an Orchestrator-approved candidate into an actual,
   * deliverable message: channel, rendered text, and send time.
   * Returns null if consent blocks every eligible channel, or if the
   * template system has nothing compliant/specific to say (§5.7) —
   * both are legitimate "say nothing" outcomes, not errors.
   *
   * @param {object} candidate - the Orchestrator's approved candidate,
   *   extended with category/data/macroState/journeyStage/factKey.
   */
  resolve(candidate) {
    const channel = this.channelSelector.selectChannel(candidate);
    if (!channel) return null;

    if (!this.consent.canSend(channel, candidate.category)) {
      return null; // §10.8 — ambiguous/absent consent defaults to silence
    }

    // §6.4 — deduplicate at the point of send, a defensive second gate
    // beyond the Orchestrator's own selection stage.
    if (candidate.factKey && this._isDuplicate(candidate.factKey)) {
      return null;
    }

    const rendered = this.templateEngine.render({ ...candidate, channel });
    if (!rendered) return null; // §5.7 — no compliant/specific content available

    const sendTime = this.timingEngine.resolveSendTime(candidate);

    return {
      channel,
      rendered,
      sendTime,
      category: candidate.category,
      deliveryGuarantee: candidate.deliveryGuarantee
    };
  }

  _isDuplicate(factKey) {
    const cutoffMs = 24 * 60 * 60 * 1000; // same delivery window ~= same day
    const recent = this.recentSends.filter(r => Date.now() - r.sentAt < cutoffMs);
    this.recentSends = recent; // prune while we're here
    return recent.some(r => r.factKey === factKey);
  }

  /**
   * Call once a resolved message has actually been handed to a
   * transport layer (push provider, WhatsApp API, etc.) — records it
   * for deduplication and interaction logging.
   */
  recordSent(candidate, resolved) {
    if (candidate.factKey) {
      this.recentSends.push({ factKey: candidate.factKey, sentAt: Date.now() });
    }
    this.interactionLog.push({
      notificationId: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      category: candidate.category,
      channel: resolved.channel,
      delivered: null,
      opened: false,
      actedUpon: false,
      sentAt: Date.now()
    });
  }

  /**
   * §6.5 — interaction logging. This module produces the raw log;
   * SJEE §5.8 remains the sole owner of interpreting it into priority
   * adjustments (this service never computes suppression itself).
   */
  recordInteraction(notificationId, outcome) {
    const entry = this.interactionLog.find(e => e.notificationId === notificationId);
    if (!entry) return;
    if (outcome === 'delivered') entry.delivered = true;
    if (outcome === 'opened') entry.opened = true;
    if (outcome === 'acted_upon') entry.actedUpon = true;
  }

  toJSON() {
    return {
      consent: this.consent.toJSON(),
      interactionLog: this.interactionLog,
      recentSends: this.recentSends
    };
  }

  static fromJSON(profile, data) {
    const service = new CommsService(profile);
    if (data) {
      service.consent = ConsentManager.fromJSON(profile, data.consent);
      service.channelSelector = new ChannelSelector(service.consent);
      service.interactionLog = data.interactionLog || [];
      service.recentSends = data.recentSends || [];
    }
    return service;
  }
}
