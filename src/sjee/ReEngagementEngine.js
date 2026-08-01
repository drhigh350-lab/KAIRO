/**
 * Kairo — ReEngagementEngine
 * Student Journey & Engagement Engine §6 — Re-engagement & Win-back.
 *
 * Owns exactly one question: should Kairo say anything to a student who
 * hasn't opened the app at all, and if so what, when, and through which
 * channel. This happens entirely outside a session (by definition,
 * before one has resumed) — distinct from the DDE's in-session return
 * mechanics and the Learning Engine's Recovering Macro-State framing,
 * which this module coordinates with but never duplicates.
 *
 * Produces candidates for NotificationOrchestrator — never sends
 * anything directly, per §5.2's platform-wide constraint.
 */

import { GapSeverity, NotificationTier, JourneyConstants } from "../utils/constants.js";
import { daysBetween } from "../utils/helpers.js";
import { JourneyStageTracker } from "./JourneyStageTracker.js";

export class ReEngagementEngine {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.winBackAttempts = []; // { at, tier, respondedTo }
    this.isDormant = false;
  }

  /**
   * §6.2 — the student's own historical between-session interval, in
   * days. Never a platform default. Falls back to a conservative
   * "not enough history" signal (null) rather than guessing.
   */
  _typicalIntervalDays() {
    const completed = this.profile.sessions
      .filter(s => s.completedAt)
      .sort((a, b) => a.completedAt - b.completedAt);
    if (completed.length < 4) return null; // not enough history to trust a rhythm

    const intervals = [];
    for (let i = 1; i < completed.length; i++) {
      intervals.push(daysBetween(completed[i].completedAt, completed[i - 1].completedAt));
    }
    intervals.sort((a, b) => a - b);
    const mid = Math.floor(intervals.length / 2);
    // Median, not mean — resistant to one unusually long historical gap
    // skewing what counts as "typical."
    return intervals.length % 2 === 0
      ? (intervals[mid - 1] + intervals[mid]) / 2
      : intervals[mid];
  }

  /**
   * §6.3 — the gap severity ladder, computed relative to the student's
   * own rhythm, not a fixed day count.
   */
  classifyGap() {
    const lastSession = [...this.profile.sessions].filter(s => s.completedAt).sort((a, b) => b.completedAt - a.completedAt)[0];
    if (!lastSession) return GapSeverity.WITHIN_RHYTHM; // no history at all — not this module's concern (that's Arrival/Activation)

    const daysSinceLast = daysBetween(Date.now(), lastSession.completedAt);
    const typicalInterval = this._typicalIntervalDays();

    if (this.isDormant) return GapSeverity.DORMANT;

    if (this.winBackAttempts.length >= 1) {
      return GapSeverity.EXTENDED_ABSENCE;
    }

    // At Risk threshold — mirrors Learning Engine §3.1's own Macro-State
    // trigger, read here rather than re-derived, so the two systems
    // never define "At Risk" differently.
    if (this.profile.macroState === 'at_risk') {
      return GapSeverity.AT_RISK_GAP;
    }

    if (typicalInterval === null) {
      // Not enough history to know this student's rhythm — fall back to
      // a conservative absolute read rather than manufacturing false
      // precision, but stay on the gentle end of the ladder.
      return daysSinceLast > 7 ? GapSeverity.NOTABLE_GAP : GapSeverity.WITHIN_RHYTHM;
    }

    if (daysSinceLast <= typicalInterval) {
      return GapSeverity.WITHIN_RHYTHM;
    }

    return GapSeverity.NOTABLE_GAP;
  }

  /**
   * §6.5 — content must be drawn from something genuinely true and
   * specific. Returns null if nothing honest is available, which per
   * §6.5.3 means: don't send anything, not "fall back on a template."
   * @param {KnowledgeGraph} graph
   */
  _findHonestContent(graph) {
    const concepts = Array.from(graph.nodes.values());

    // Preference 1: a specific Fading concept genuinely due for review.
    const fading = concepts
      .filter(c => c.retentionState === 'fading')
      .sort((a, b) => (b.decayEstimate || 0) - (a.decayEstimate || 0));
    if (fading.length > 0) {
      return { type: 'fading_concept', concept: fading[0] };
    }

    // Preference 2: a near-but-unreached milestone — deliberately not
    // implemented here to avoid this module reaching into
    // CrossModuleMilestones' own near-miss logic and risking the
    // "manufacturing near-miss urgency" trap §6.5.2 warns against.
    // Left as an explicit gap rather than a shortcut.

    return null; // honest absence of content — the caller must not send
  }

  /**
   * Generates a candidate for the Orchestrator, or null if nothing
   * should be sent right now (either within rhythm, or no honest
   * content available, or an explicit pause is active).
   * @param {KnowledgeGraph} graph
   */
  generateCandidate(graph) {
    if (this.profile.pausedUntil && Date.now() < this.profile.pausedUntil) {
      return null; // §6.8 — an explicit pause is a boundary, not an absence to win back from
    }

    // §8.2 — Journey Stage is the primary personalisation axis, checked
    // before any other signal. Arrival/Activation: no formal
    // re-engagement applies (that's activation-failure territory,
    // §4.9). Culmination: suspended entirely — a pre-exam gap of a day
    // or two is plausibly deliberate rest, not absence.
    const posture = JourneyStageTracker.personalizationPosture(this.profile.journeyStage);
    if (posture.reEngagementPosture === 'not_applicable' || posture.reEngagementPosture === 'suspended') {
      return null;
    }

    const severity = this.classifyGap();

    if (severity === GapSeverity.WITHIN_RHYTHM || severity === GapSeverity.DORMANT) {
      return null;
    }

    if (severity === GapSeverity.EXTENDED_ABSENCE) {
      return this._generateWinBackCandidate(graph);
    }

    const content = this._findHonestContent(graph);
    if (!content) return null; // §6.5.3 — silence over a generic template

    const body = this._composeInvitation(content);

    if (severity === GapSeverity.NOTABLE_GAP) {
      return {
        type: 'reengagement_notable_gap',
        tier: NotificationTier.LOW,
        title: 'Ready when you are',
        body,
        action: 'resume_session'
      };
    }

    if (severity === GapSeverity.AT_RISK_GAP) {
      return {
        type: 'reengagement_at_risk',
        tier: NotificationTier.STANDARD,
        title: 'Ready when you are',
        body,
        action: 'resume_session',
        priorityWeight: 8
      };
    }

    return null;
  }

  /**
   * §6.4 — the standing invitation template. Never references the
   * absence length, never uses past performance as leverage (§6.8).
   */
  _composeInvitation(content) {
    if (content.type === 'fading_concept') {
      return `Ready when you are — I kept your place. ${content.concept.name} is ready to come back.`;
    }
    return 'Ready when you are — I kept your place.';
  }

  /**
   * §6.6 — extended-absence win-back. Cadence widens (never narrows),
   * content/tone standards identical to ordinary re-engagement, and a
   * fixed small ceiling on attempts before the student becomes Dormant.
   */
  _generateWinBackCandidate(graph) {
    if (this.winBackAttempts.length >= JourneyConstants.WIN_BACK_MAX_ATTEMPTS) {
      this.isDormant = true;
      return null; // §6.7 — sequence has a designed endpoint, not a fade-out
    }

    const lastAttempt = this.winBackAttempts[this.winBackAttempts.length - 1];
    if (lastAttempt) {
      const minGapDays = 7 * Math.pow(2, this.winBackAttempts.length); // widening cadence, never narrower
      if (daysBetween(Date.now(), lastAttempt.at) < minGapDays) {
        return null; // too soon for the next widened attempt
      }
    }

    const content = this._findHonestContent(graph);
    if (!content) return null;

    const candidate = {
      type: 'win_back',
      tier: NotificationTier.STANDARD,
      title: 'Ready when you are',
      body: this._composeInvitation(content),
      action: 'resume_session',
      priorityWeight: 6,
      // §6.6 — channel MAY broaden on later attempts, but only where
      // the student has provided and opted into it. The caller (whoever
      // wires this to real transport) decides the actual channel;
      // this flag just signals eligibility.
      allowBroadenedChannel: this.winBackAttempts.length >= 1
    };

    this.winBackAttempts.push({ at: Date.now(), tier: candidate.tier, respondedTo: false });
    return candidate;
  }

  /**
   * Call when the student returns after any win-back attempt was sent —
   * clears the sequence, since the pattern of non-response broke.
   */
  recordReturn() {
    if (this.winBackAttempts.length > 0) {
      this.winBackAttempts[this.winBackAttempts.length - 1].respondedTo = true;
    }
    this.winBackAttempts = [];
    this.isDormant = false;
  }

  toJSON() {
    return {
      winBackAttempts: this.winBackAttempts,
      isDormant: this.isDormant
    };
  }

  static fromJSON(profile, data) {
    const engine = new ReEngagementEngine(profile);
    if (data) {
      engine.winBackAttempts = data.winBackAttempts || [];
      engine.isDormant = data.isDormant || false;
    }
    return engine;
  }
}
