/**
 * Kairo — TimingEngine
 * Notifications & Communication Systems §7 — Delivery Timing.
 *
 * Resolves an approved candidate's ideal timing window into an actual
 * send time. Never decides whether to send (§1.3's boundary) — only
 * when, given that it should.
 */

import { CommsConstants, Channel } from "../utils/constants.js";

export class TimingEngine {
  /**
   * §7.2 — the timing resolution hierarchy. Each level only consulted
   * if the one above doesn't fully determine send time.
   * @param {object} candidate - { tier, category, intrinsicDeadline?,
   *   preferredStudyPeriod? } — intrinsicDeadline is a timestamp for
   *   genuinely scheduled events (a mock start); preferredStudyPeriod
   *   is Student Intelligence Model §1's declared/inferred field.
   * @returns {number} resolved send timestamp
   */
  resolveSendTime(candidate) {
    // Level 4 — immediate, for Time-critical and Account & Administrative.
    if (candidate.tier === 'time_critical' || candidate.category === 'account_administrative') {
      return this._applyQuietHoursOverride(Date.now(), candidate, true);
    }

    // Level 1 — intrinsic deadline, scheduled with lead time.
    if (candidate.intrinsicDeadline) {
      const leadTimeMs = candidate.leadTimeMs || 30 * 60 * 1000; // default 30 min lead
      const target = candidate.intrinsicDeadline - leadTimeMs;
      return this._applyQuietHoursOverride(Math.max(target, Date.now()), candidate, false);
    }

    // Level 2 — Preferred Study Period.
    if (candidate.preferredStudyPeriod) {
      const target = this._nextOccurrenceOfPeriod(candidate.preferredStudyPeriod);
      return this._applyQuietHoursOverride(target, candidate, false);
    }

    // Level 3 — category-appropriate default window.
    const target = this._categoryDefaultWindow(candidate.category);
    return this._applyQuietHoursOverride(target, candidate, false);
  }

  _nextOccurrenceOfPeriod(period) {
    const now = new Date();
    const target = new Date(now);
    const hours = { morning: 8, afternoon: 14, evening: 18, late_night: 21 };
    target.setHours(hours[period] ?? 18, 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  _categoryDefaultWindow(category) {
    const now = new Date();
    const target = new Date(now);
    // Motivational content defaults toward early evening (§7.2 level 3 example).
    target.setHours(18, 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  /**
   * §7.3 — quiet hours suppress push/SMS for every category except
   * genuine Account & Administrative and Exam-Critical tied to an
   * imminent, unmovable deadline. Held and re-evaluated at the next
   * window, never silently discarded.
   */
  _applyQuietHoursOverride(timestamp, candidate, bypassAllowed) {
    if (bypassAllowed) return timestamp; // Time-critical/Account-Admin bypass quiet hours entirely

    const hour = new Date(timestamp).getHours();
    const inQuietHours = hour >= CommsConstants.QUIET_HOURS_START_HOUR || hour < CommsConstants.QUIET_HOURS_END_HOUR;

    if (!inQuietHours) return timestamp;

    // Push the send time forward to the end of quiet hours.
    const adjusted = new Date(timestamp);
    if (hour >= CommsConstants.QUIET_HOURS_START_HOUR) {
      adjusted.setDate(adjusted.getDate() + 1);
    }
    adjusted.setHours(CommsConstants.QUIET_HOURS_END_HOUR, 0, 0, 0);
    return adjusted.getTime();
  }

  /**
   * §7.6 — batch multiple Informational-tier candidates for the same
   * student within a short window into one in-app digest entry, but
   * only within the Informational tier, never across categories
   * (§3.4's single-category rule still applies to a digest).
   */
  batchInformational(candidates) {
    const byCategory = {};
    for (const c of candidates) {
      if (c.tier !== 'informational') continue;
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push(c);
    }
    return Object.entries(byCategory).map(([category, items]) => ({
      category,
      isDigest: items.length > 1,
      items
    }));
  }
}
