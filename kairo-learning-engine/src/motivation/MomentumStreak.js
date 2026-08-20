/**
 * Kairo — MomentumStreak
 * Redesigned to not punish real life.
 * Tracks consistency across a rolling window with protected gap days.
 */

import { StreakConstants } from "../utils/constants.js";
import { daysBetween } from "../utils/helpers.js";

export class MomentumStreak {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.data = studentProfile.streakData || {
      currentMomentum: 0,
      protectedGapsUsed: 0,
      lastSessionDate: null,
      windowSessions: [] // timestamps of sessions in rolling window
    };
  }

  /**
   * Record a completed session.
   */
  recordSession(sessionTimestamp) {
    const windowMs = StreakConstants.ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const now = sessionTimestamp;

    // Clean old sessions outside window
    this.data.windowSessions = this.data.windowSessions.filter(ts => now - ts < windowMs);
    this.data.windowSessions.push(now);

    // Check gap from last session
    if (this.data.lastSessionDate) {
      const gapDays = daysBetween(now, this.data.lastSessionDate);
      if (gapDays > 1) {
        // Used a protected gap day?
        if (gapDays <= StreakConstants.PROTECTED_GAP_DAYS + 1) {
          this.data.protectedGapsUsed++;
        } else {
          // Momentum breaks, but recovery framing applies
          this.data.currentMomentum = Math.floor(this.data.currentMomentum * 0.5);
          this.data.protectedGapsUsed = 0;
        }
      }
    }

    // Calculate momentum score based on session density in window
    const uniqueDays = new Set(this.data.windowSessions.map(ts => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;

    this.data.currentMomentum = uniqueDays;
    this.data.lastSessionDate = now;
    this._save();

    return {
      momentum: this.data.currentMomentum,
      protectedGapsRemaining: Math.max(0, StreakConstants.PROTECTED_GAP_DAYS - this.data.protectedGapsUsed),
      message: this._statusMessage()
    };
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
      protectedGapsUsed: this.data.protectedGapsUsed,
      lastSessionDate: this.data.lastSessionDate,
      message: this._statusMessage()
    };
  }
}
