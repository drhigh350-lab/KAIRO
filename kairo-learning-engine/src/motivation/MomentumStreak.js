/**
 * Kairo — MomentumStreak
 * Redesigned to not punish real life.
 * Tracks a true consecutive-day streak, with Streak Freeze covering a
 * missed day or two instead of the streak silently breaking.
 *
 * Deliberately NOT a rolling-window "unique days in the last N days" count
 * (the previous design) — that shape can quietly *decrease* between two
 * sessions with no missed day in between, purely because an old practiced
 * day ages out of the window as the window itself slides forward. A
 * streak a student is actively maintaining must never show a number lower
 * than what they last saw without an honest, explainable reason (a real
 * broken streak), so `currentMomentum` here only ever rises by exactly 1
 * per new distinct day, or resets to 1 on a genuine break — never a
 * silent partial decay.
 */

import { StreakConstants } from "../utils/constants.js";
import { daysBetween } from "../utils/helpers.js";

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export class MomentumStreak {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.data = studentProfile.streakData || {
      currentMomentum: 0,
      longestMomentum: 0,
      protectedGapsUsed: 0,
      lastSessionDate: null,
      windowSessions: [], // timestamps of sessions in rolling window (kept for history/analytics, not for the momentum count itself)
      freezesAvailable: 0,
      freezesUsed: 0
    };
    if (this.data.freezesAvailable == null) this.data.freezesAvailable = 0;
    if (this.data.freezesUsed == null) this.data.freezesUsed = 0;
    if (this.data.longestMomentum == null) this.data.longestMomentum = this.data.currentMomentum || 0;
  }

  /**
   * Record a completed session. Only ever called for the day's first
   * recommended session (KairoEngine.endSession() gates on
   * mode === 'standard') — a second standard session the same calendar
   * day is a genuine no-op here, not a double-increment.
   */
  recordSession(sessionTimestamp) {
    const now = sessionTimestamp;
    const windowMs = StreakConstants.ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    this.data.windowSessions = (this.data.windowSessions || []).filter(ts => now - ts < windowMs);
    this.data.windowSessions.push(now);

    if (this.data.lastSessionDate && dayKey(now) === dayKey(this.data.lastSessionDate)) {
      // Already recorded today — return current status unchanged.
      this._save();
      return {
        momentum: this.data.currentMomentum,
        longestMomentum: this.data.longestMomentum,
        protectedGapsRemaining: Math.max(0, StreakConstants.PROTECTED_GAP_DAYS - this.data.protectedGapsUsed),
        freezesAvailable: this.data.freezesAvailable,
        message: this._statusMessage()
      };
    }

    if (!this.data.lastSessionDate) {
      // First session ever.
      this.data.currentMomentum = 1;
    } else {
      const gapDays = Math.round(daysBetween(now, this.data.lastSessionDate));
      if (gapDays <= 1) {
        // Consecutive calendar day.
        this.data.currentMomentum += 1;
      } else {
        const missedDays = gapDays - 1;
        if (missedDays <= StreakConstants.PROTECTED_GAP_DAYS) {
          // Small gap within the automatic, free grace window — absorbed
          // without spending a Streak Freeze, streak continues.
          this.data.protectedGapsUsed++;
          this.data.currentMomentum += 1;
        } else {
          // Beyond the free grace — a Streak Freeze can cover exactly the
          // excess, so it genuinely extends coverage past what the free
          // grace already gives, rather than duplicating it.
          const extraNeeded = missedDays - StreakConstants.PROTECTED_GAP_DAYS;
          if (extraNeeded <= this.data.freezesAvailable) {
            this.data.freezesAvailable -= extraNeeded;
            this.data.freezesUsed += extraNeeded;
            this.data.protectedGapsUsed = StreakConstants.PROTECTED_GAP_DAYS;
            this.data.currentMomentum += 1;
          } else {
            // Genuine break. An honest reset to 1 — never a partial,
            // unexplained decrement of whatever the number used to be.
            // Freezes are only ever spent on a successful bridge, never
            // burned on an attempt that fails anyway.
            this.data.currentMomentum = 1;
            this.data.protectedGapsUsed = 0;
          }
        }
      }
    }

    this.data.lastSessionDate = now;
    this.data.longestMomentum = Math.max(this.data.longestMomentum || 0, this.data.currentMomentum);
    this._save();

    return {
      momentum: this.data.currentMomentum,
      longestMomentum: this.data.longestMomentum,
      protectedGapsRemaining: Math.max(0, StreakConstants.PROTECTED_GAP_DAYS - this.data.protectedGapsUsed),
      freezesAvailable: this.data.freezesAvailable,
      message: this._statusMessage()
    };
  }

  /**
   * Earn Streak Freeze(s) — currently only awarded once, on onboarding
   * completion (OnboardingEngine.buildInitialPlan()). Capped so the
   * student never holds more than FREEZE_CAPACITY at once.
   */
  earnFreeze(count = 1) {
    this.data.freezesAvailable = Math.min(
      StreakConstants.FREEZE_CAPACITY,
      (this.data.freezesAvailable || 0) + count
    );
    this._save();
    return this.data.freezesAvailable;
  }

  _statusMessage() {
    const m = this.data.currentMomentum;
    if (m >= 10) return { level: 'strong', text: 'Your rhythm is solid. Keep the pattern.' };
    if (m >= 5) return { level: 'building', text: "You're settling into a real rhythm. One more session this week keeps it going." };
    if (m >= 2) return { level: 'early', text: 'Momentum is starting. Small steps count.' };
    return { level: 'recovering', text: 'Ready when you are — I kept your place.' };
  }

  _save() {
    this.profile.streakData = this.data;
  }

  /**
   * Get current streak status for display.
   */
  getStatus() {
    return {
      momentum: this.data.currentMomentum,
      longestMomentum: this.data.longestMomentum,
      protectedGapsUsed: this.data.protectedGapsUsed,
      lastSessionDate: this.data.lastSessionDate,
      freezesAvailable: this.data.freezesAvailable,
      freezesUsed: this.data.freezesUsed,
      message: this._statusMessage()
    };
  }
}
