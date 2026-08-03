/**
 * Kairo — OneSignalTransport
 *
 * The literal "transport layer, outside this module, actually delivers
 * it" that CommsService.js's own docstring defers to (§1.3's pipeline:
 * Orchestrator decides send/hold/discard -> CommsService resolves
 * channel/content/timing -> transport layer delivers -> interaction
 * logs back). CommsService/TemplateEngine never call this directly —
 * a caller takes CommsService.resolve()'s output and hands it here.
 *
 * Talks to OneSignal's real REST API (push, email, sms) using
 * credentials from the environment — this is a separate OneSignal app
 * connection from any MCP/dashboard access a developer might have;
 * ONESIGNAL_APP_ID/ONESIGNAL_API_KEY must be set wherever this code
 * actually runs (server-side only — the API key must never ship to a
 * client bundle).
 *
 * Not wired into any caller yet. CommsService.resolve() only ever
 * produces a valid { rendered } payload once the SJEE Notification
 * Orchestrator's candidate shape and TemplateEngine's expected
 * { category, data: { observation, reason, benefit, action } } shape
 * are reconciled (docs/SUPABASE_SETUP.md §6) — that's a content/copy
 * decision, not something this transport can work around. Until then,
 * this module has no valid input to send, by design — it's not stubbed
 * or faked to look connected.
 */

import { Channel } from "../../utils/constants.js";

const ONESIGNAL_API_BASE = 'https://api.onesignal.com';

export class OneSignalTransport {
  /**
   * @param {object} [options]
   * @param {string} [options.appId] - defaults to process.env.ONESIGNAL_APP_ID
   * @param {string} [options.apiKey] - defaults to process.env.ONESIGNAL_API_KEY
   * @param {Function} [options.fetchImpl] - injectable for testing; never
   *   hits the real API in tests
   */
  constructor({ appId, apiKey, fetchImpl } = {}) {
    this.appId = appId ?? (typeof process !== 'undefined' ? process.env?.ONESIGNAL_APP_ID : undefined);
    this.apiKey = apiKey ?? (typeof process !== 'undefined' ? process.env?.ONESIGNAL_API_KEY : undefined);
    this.fetch = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);
  }

  /**
   * @param {object} resolved - CommsService.resolve()'s return value:
   *   { channel, rendered: { text, subject, slots }, sendTime, category,
   *     deliveryGuarantee }
   * @param {string} externalId - the student's OneSignal external_id,
   *   set at subscription-registration time client-side. This transport
   *   never invents or looks up a targeting identity.
   * @returns {Promise<{sent: boolean, oneSignalId?: string, reason?: string}>}
   */
  async send(resolved, externalId) {
    if (!this.appId || !this.apiKey) {
      throw new Error('OneSignalTransport requires ONESIGNAL_APP_ID and ONESIGNAL_API_KEY to be configured.');
    }
    if (!this.fetch) {
      throw new Error('OneSignalTransport requires a fetch implementation (global fetch, or pass fetchImpl).');
    }
    if (!externalId) {
      throw new Error('OneSignalTransport.send() requires a target externalId.');
    }

    // Channels this transport cannot deliver — returned as a non-error,
    // handled outcome (§6.2's "no silent failures or ambiguous states"),
    // not thrown, since a caller iterating multiple resolved candidates
    // shouldn't have one unsupported channel abort the batch.
    if (resolved.channel === Channel.IN_APP) {
      return { sent: false, reason: 'in_app_badge renders client-side; nothing to deliver externally' };
    }
    if (resolved.channel === Channel.WHATSAPP) {
      return { sent: false, reason: 'OneSignal has no WhatsApp channel — needs a separate transport (e.g. Twilio)' };
    }

    const payload = this._buildPayload(resolved, externalId);

    const res = await this.fetch(`${ONESIGNAL_API_BASE}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OneSignal send failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    return { sent: true, oneSignalId: data.id };
  }

  _buildPayload(resolved, externalId) {
    const targetChannel = resolved.channel === Channel.EMAIL ? 'email'
      : resolved.channel === Channel.SMS ? 'sms'
      : 'push';

    const base = {
      app_id: this.appId,
      include_aliases: { external_id: [externalId] },
      target_channel: targetChannel
    };

    if (targetChannel === 'email') {
      return {
        ...base,
        email_subject: resolved.rendered.subject || 'Kairo',
        email_body: `<p>${resolved.rendered.text}</p>`
      };
    }

    // push and sms both use `contents`
    return { ...base, contents: { en: resolved.rendered.text } };
  }
}
