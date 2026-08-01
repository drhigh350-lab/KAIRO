/**
 * Kairo — TemplateEngine
 * Notifications & Communication Systems §5 — Content & Template System.
 *
 * Computes no new intelligence (§5.1) — renders intelligence already
 * produced elsewhere (Learning Engine, Review, Insights, SJEE) into
 * compliant, channel-appropriate text. Never a second Orchestrator
 * (§1.2): whether to send, at what priority, is entirely the SJEE
 * Notification Orchestrator's authority. This module answers only
 * "given that it should be sent, what exactly does it say."
 *
 * Three-layer model (§5.2):
 *   Layer 1 — Data payload (supplied by the originating module)
 *   Layer 2 — Message template (category-specific, 5-slot structure)
 *   Layer 3 — Rendering (locale, channel format, personalisation)
 */

import { NotificationCategory, TemplateSlot, CommsConstants, Channel } from "../utils/constants.js";

export class TemplateEngine {
  /**
   * Render a notification instance from a candidate.
   * @param {object} candidate
   * @param {string} candidate.category - NotificationCategory
   * @param {object} candidate.data - Layer 1 payload (facts only — this
   *   engine never invents a fact)
   * @param {string} candidate.channel - Channel, resolved upstream
   * @param {string} [candidate.macroState]
   * @param {string} [candidate.journeyStage]
   * @param {string} [candidate.studentName]
   * @returns {object|null} { text, subject?, slots } or null if the
   *   candidate cannot produce a compliant, specific render — per
   *   §5.7, there is no filler template; absence of specific content
   *   IS the signal that nothing should be sent.
   */
  render(candidate) {
    const slots = this._buildSlots(candidate);
    if (!slots) return null; // §5.7 — no genuinely specific Observation available

    const channelSlots = this._resolveChannelSlots(candidate.channel, candidate.category, slots);
    const text = this._composeText(channelSlots, candidate.channel);
    const subject = candidate.channel === Channel.EMAIL ? this._composeSubject(slots) : undefined;

    const rendered = { text, subject, slots: channelSlots, category: candidate.category, channel: candidate.channel };

    const compliance = this.checkCompliance(rendered);
    if (!compliance.compliant) {
      // §5.5 — auto-correct where mechanical, otherwise discard and log.
      const corrected = this._attemptAutoCorrect(rendered, compliance.failures);
      if (!corrected) return null;
      return corrected;
    }

    return rendered;
  }

  /**
   * §5.4 — build the up-to-five-slot structure from the candidate's
   * data payload. Returns null if Observation (always mandatory)
   * cannot be populated with something specific and true.
   */
  _buildSlots(candidate) {
    const { data } = candidate;
    if (!data || !data.observation || typeof data.observation !== 'string' || data.observation.trim() === '') {
      return null; // §5.7 — no specific fact, no notification
    }

    const slots = { [TemplateSlot.OBSERVATION]: data.observation };

    if (data.reason) slots[TemplateSlot.REASON] = data.reason;
    if (data.benefit) slots[TemplateSlot.BENEFIT] = data.benefit;

    // Action is mandatory except for Account & Administrative
    // informational notices (§5.4).
    if (candidate.category !== NotificationCategory.ACCOUNT_ADMIN && !data.action) {
      return null;
    }
    if (data.action) slots[TemplateSlot.ACTION] = data.action;

    slots[TemplateSlot.VOICE_MARKER] = this._resolveVoiceMarker(candidate);

    return slots;
  }

  /**
   * §8.2 — voice calibration reads exactly two inputs: Macro-State and
   * Journey Stage. Emotional Profile is never read here — it gates
   * upstream (whether this render happens at all), never shapes word
   * choice, per §8.2's explicit prohibition.
   */
  _resolveVoiceMarker(candidate) {
    const macroState = candidate.macroState;
    const gentleStates = ['wavering', 'at_risk', 'recovering'];
    const sharpStates = ['compounding', 'peak_readiness'];

    if (macroState && gentleStates.includes(macroState)) return 'gentle';
    if (macroState && sharpStates.includes(macroState)) return 'direct';
    return 'steady';
  }

  /**
   * §5.6 — channel-format resolution. Same Layer 2 slots, different
   * subset rendered per channel, never rewritten content.
   */
  _resolveChannelSlots(channel, category, slots) {
    const tables = {
      [Channel.PUSH]: [TemplateSlot.OBSERVATION, TemplateSlot.ACTION],
      [Channel.IN_APP]: [TemplateSlot.OBSERVATION, TemplateSlot.REASON, TemplateSlot.ACTION],
      [Channel.WHATSAPP]: [TemplateSlot.OBSERVATION, TemplateSlot.REASON, TemplateSlot.BENEFIT, TemplateSlot.ACTION, TemplateSlot.VOICE_MARKER],
      [Channel.EMAIL]: [TemplateSlot.OBSERVATION, TemplateSlot.REASON, TemplateSlot.BENEFIT, TemplateSlot.ACTION, TemplateSlot.VOICE_MARKER],
      [Channel.SMS]: [TemplateSlot.OBSERVATION, TemplateSlot.ACTION]
    };
    const allowedSlots = tables[channel] || [TemplateSlot.OBSERVATION, TemplateSlot.ACTION];
    const resolved = {};
    for (const slot of allowedSlots) {
      if (slots[slot]) resolved[slot] = slots[slot];
    }
    return resolved;
  }

  _composeText(slots, channel) {
    const parts = [];
    if (slots[TemplateSlot.OBSERVATION]) parts.push(slots[TemplateSlot.OBSERVATION]);
    if (slots[TemplateSlot.REASON]) parts.push(slots[TemplateSlot.REASON]);
    if (slots[TemplateSlot.BENEFIT]) parts.push(slots[TemplateSlot.BENEFIT]);
    let text = parts.join(' ');
    if (slots[TemplateSlot.ACTION]) {
      text += text ? ` ${slots[TemplateSlot.ACTION]}` : slots[TemplateSlot.ACTION];
    }
    return text.trim();
  }

  /**
   * Email subject line follows push-notification brevity discipline
   * (§5.6) — Observation alone, truncated if needed.
   */
  _composeSubject(slots) {
    const observation = slots[TemplateSlot.OBSERVATION] || '';
    return observation.length > 60 ? observation.slice(0, 57) + '...' : observation;
  }

  /**
   * §5.5 — the Kai-voice compliance checklist, as literal automatable
   * gates rather than a prose principle.
   */
  checkCompliance(rendered) {
    const failures = [];
    const fullText = `${rendered.text} ${rendered.subject || ''}`;

    // 1 & 3 — bare judgment / guilt / loss-framing language.
    for (const pattern of CommsConstants.BANNED_PHRASES) {
      if (pattern.test(fullText)) {
        failures.push({ rule: 'banned_phrase', detail: pattern.source });
      }
    }

    // 4 — raw internal metric surfaced unexplained. A bare percentage
    // with no surrounding explanatory language.
    if (/\b\d{1,3}%\b/.test(fullText) && !/(because|since|so that|to help|means)/i.test(fullText)) {
      failures.push({ rule: 'unexplained_metric', detail: 'raw percentage with no plain-language why' });
    }
    if (/\b(unseen|forming|held|fading|reinforced)\b/i.test(fullText)) {
      failures.push({ rule: 'raw_internal_label', detail: 'internal retention_state label leaked into copy' });
    }

    // 6 — specificity over generic enthusiasm. A render with no
    // concrete noun (heuristic: a capitalized word beyond sentence
    // start, or a digit) fails this gate.
    const hasConcreteNoun = /[A-Z][a-z]+/.test(rendered.text.slice(1)) || /\d/.test(rendered.text);
    if (!hasConcreteNoun && rendered.category !== NotificationCategory.ACCOUNT_ADMIN) {
      failures.push({ rule: 'generic_no_specificity', detail: 'no concrete noun or count in rendered text' });
    }

    return { compliant: failures.length === 0, failures };
  }

  /**
   * §5.5 — "auto-corrected where the failure is mechanical... or
   * discarded." Only the unexplained-metric failure is mechanically
   * correctable here (strip the bare number); everything else — banned
   * phrases, leaked internal labels, genuine lack of specificity —
   * reflects a problem with the candidate's own data payload that this
   * layer has no business patching over, so those are discarded.
   */
  _attemptAutoCorrect(rendered, failures) {
    const onlyMechanical = failures.every(f => f.rule === 'unexplained_metric');
    if (!onlyMechanical) return null;

    const corrected = { ...rendered, text: rendered.text.replace(/\b\d{1,3}%\b/g, '').replace(/\s+/g, ' ').trim() };
    const recheck = this.checkCompliance(corrected);
    return recheck.compliant ? corrected : null;
  }
}
