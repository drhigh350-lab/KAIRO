/**
 * Kairo — ConsentManager
 * Notifications & Communication Systems §10 — Consent, Privacy & Compliance.
 *
 * The permission architecture governing every channel — what a student
 * has agreed to, and the hard boundaries that override every other
 * system in this document, including the Orchestrator's own priority
 * tiers (§10.1).
 */

import { Channel, NotificationCategory, ConsentLevel } from "../utils/constants.js";

export class ConsentManager {
  constructor(studentProfile) {
    this.profile = studentProfile;
    // §10.2 level 1 — channel-level baseline permission.
    this.channelPermissions = {
      [Channel.PUSH]: false,
      [Channel.IN_APP]: true, // never requires external permission, §4.4/§13.1
      [Channel.WHATSAPP]: false,
      [Channel.EMAIL]: false,
      [Channel.SMS]: false
    };
    // §10.2 level 2 — category-level preference, per channel. Default
    // true (opted in) for every category once the channel itself is
    // permitted — a student adjusts downward, never upward beyond
    // what a module would otherwise send (§5.6/SJEE §5.6's "personalisable
    // downward... never upward" rule, restated here for consent specifically).
    this.categoryPreferences = {}; // { [channel]: { [category]: boolean } }
    // §10.2 level 3 — explicit stop request. Distinct from Editorial
    // consent (§10.5), tracked separately.
    this.hardStopActive = false;
    // §10.5 — Editorial & Broadcast consent tracked independently from
    // the five product-notification categories.
    this.editorialConsent = false;
  }

  /**
   * §10.4 — Arrival requests only baseline permissions (typically
   * push). WhatsApp/email/SMS are captured opportunistically and
   * separately, never bundled into one blanket prompt.
   */
  grantChannelPermission(channel) {
    if (channel in this.channelPermissions) {
      this.channelPermissions[channel] = true;
    }
  }

  revokeChannelPermission(channel) {
    if (channel in this.channelPermissions) {
      this.channelPermissions[channel] = false;
    }
  }

  /**
   * §10.3 — a category-channel combination requires its own explicit
   * or default-appropriate basis. Opting into WhatsApp for one purpose
   * (e.g. win-back) never implicitly grants every category on that
   * channel — the caller must set preferences per category explicitly
   * once the channel itself is granted.
   */
  setCategoryPreference(channel, category, allowed) {
    if (!this.categoryPreferences[channel]) this.categoryPreferences[channel] = {};
    this.categoryPreferences[channel][category] = allowed;
  }

  setEditorialConsent(allowed) {
    this.editorialConsent = allowed;
  }

  /**
   * §9.7 / §10.2 level 3 — overrides everything, including Time-critical,
   * except genuinely account-critical communication (§3.5), which sits
   * outside this consent architecture entirely rather than as an
   * override of it.
   */
  setHardStop(active) {
    this.hardStopActive = active;
  }

  /**
   * The single entry point every send must pass through. Returns
   * whether a given category may be sent on a given channel right now.
   * §10.8 — where consent cannot be confirmed, the default is silence,
   * not delivery.
   */
  canSend(channel, category) {
    // Account & Administrative sits outside this consent framework by
    // definition (§3.5, §10.8) — never blocked by hard stop or channel
    // permission state, since it's functionally necessary rather than
    // marketing/motivational.
    if (category === NotificationCategory.ACCOUNT_ADMIN) return true;

    if (this.hardStopActive) return false;

    if (!this.channelPermissions[channel]) return false;

    if (category === NotificationCategory.EDITORIAL_BROADCAST) {
      return this.editorialConsent;
    }

    // §10.8 — lapsed/ambiguous consent state defaults to silence, not
    // delivery. Explicit false blocks; explicit true allows; anything
    // else (undefined — never set) also blocks, since a channel being
    // permitted does not itself imply every category is wanted there —
    // the caller must have set an explicit default when the channel
    // was granted. This method never assumes true for missing data.
    const pref = this.categoryPreferences[channel]?.[category];
    return pref === true;
  }

  /**
   * §13.1 — a student who has opted out of every external channel
   * still receives full in-app content, since that channel asks
   * nothing of them outside the product. Never treated as requiring
   * escalation to an un-opted-in channel.
   */
  isFullyOptedOutExternally() {
    return !this.channelPermissions[Channel.PUSH] &&
      !this.channelPermissions[Channel.WHATSAPP] &&
      !this.channelPermissions[Channel.EMAIL] &&
      !this.channelPermissions[Channel.SMS];
  }

  /**
   * §10.6 — right to be forgotten. Purges stored channel identifiers
   * while retaining minimal record that a deletion occurred, to
   * prevent an accidental future re-contact attempt.
   */
  deleteContactData() {
    this.channelPermissions[Channel.WHATSAPP] = false;
    this.channelPermissions[Channel.EMAIL] = false;
    this.channelPermissions[Channel.SMS] = false;
    this.contactDataDeletedAt = Date.now();
  }

  toJSON() {
    return {
      channelPermissions: this.channelPermissions,
      categoryPreferences: this.categoryPreferences,
      hardStopActive: this.hardStopActive,
      editorialConsent: this.editorialConsent,
      contactDataDeletedAt: this.contactDataDeletedAt || null
    };
  }

  static fromJSON(profile, data) {
    const manager = new ConsentManager(profile);
    if (data) {
      manager.channelPermissions = data.channelPermissions || manager.channelPermissions;
      manager.categoryPreferences = data.categoryPreferences || {};
      manager.hardStopActive = data.hardStopActive || false;
      manager.editorialConsent = data.editorialConsent || false;
      manager.contactDataDeletedAt = data.contactDataDeletedAt || null;
    }
    return manager;
  }
}
