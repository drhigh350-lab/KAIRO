/**
 * Kairo — JourneyStageTracker
 * Student Journey & Engagement Engine §3 — The Student Lifecycle Model.
 *
 * Answers "how deep is this student's relationship with Kairo, and how
 * close is the exam" — a structurally different question from
 * Macro-State (Learning Engine §3, "how is this student's learning
 * trajectory behaving right now"). Journey Stage is sticky and
 * directional; Macro-State is a live, resettable read (§3.3).
 *
 * Never surfaced to the student directly (§3.7).
 */

import { JourneyStage, MacroState, JourneyConstants } from "../utils/constants.js";
import { daysBetween } from "../utils/helpers.js";

export class JourneyStageTracker {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.currentStage = JourneyStage.ARRIVAL;
    this.stageHistory = []; // { from, to, at } — permanent, never rewritten
    // §3.4 — the one legitimate backward transition is a FRAMING OVERLAY,
    // not a real stage regression. This flag is what "temporarily applies
    // an Activation-equivalent framing posture" without touching
    // currentStage/stageHistory.
    this.activationFramingOverlayActive = false;
  }

  /**
   * Recompute Journey Stage from calendar facts and cumulative history.
   * Per §3.3, this does NOT read rolling-window behavioral signal the
   * way Macro-State does — only account age, cumulative sessions, exam
   * date proximity, and whether an exam date has passed.
   * @param {KnowledgeGraph} [graph] - when provided, Activation's
   *   Knowledge Map movement criterion (§4.7) is checked properly.
   *   When omitted, that single criterion is skipped rather than
   *   assumed failed — callers without graph access (e.g. a nightly
   *   batch job) still get correct date-driven stage transitions.
   */
  compute(graph = null) {
    // Continuation is authoritative once exam date has passed — §3.2.
    if (this.profile.examDate && Date.now() > this.profile.examDate) {
      return this._transitionTo(JourneyStage.CONTINUATION);
    }

    // Culmination and Intensification are date-driven and authoritative
    // over Establishment the moment crossed (§3.2, §3.5 — "the only
    // stage boundary with genuine calendar rigidity"). This overrides
    // even an Arrival/Activation student — an exam that's imminent
    // matters regardless of how little history exists.
    if (this.profile.examDate) {
      const daysToExam = daysBetween(Date.now(), this.profile.examDate);
      if (daysToExam <= JourneyConstants.CULMINATION_DAYS_BEFORE_EXAM) {
        return this._transitionTo(JourneyStage.CULMINATION);
      }
      if (daysToExam <= JourneyConstants.INTENSIFICATION_WEEKS_BEFORE_EXAM * 7) {
        return this._transitionTo(JourneyStage.INTENSIFICATION);
      }
    }

    // §9.4 — if this student was previously Intensification/Culmination
    // (date-driven) but the exam date has since moved out past both
    // thresholds, drop back to Establishment. This is the other
    // legitimate backward transition besides §3.4's framing overlay —
    // driven by the calendar fact changing, not by behavior regressing.
    if ([JourneyStage.INTENSIFICATION, JourneyStage.CULMINATION].includes(this.currentStage)) {
      return this._transitionTo(JourneyStage.ESTABLISHMENT);
    }

    // Below this point, stage is driven by account history, not the
    // calendar — and per §3.3/§3.5, is one-directional. Never regress
    // out of Establishment once reached (except the §3.4 overlay, which
    // is handled separately via checkBackwardFramingOverlay(), not here).
    if (this._stageRank(this.currentStage) >= this._stageRank(JourneyStage.ESTABLISHMENT)) {
      return this.currentStage;
    }

    if (this._hasActivated(graph)) {
      return this._transitionTo(JourneyStage.ESTABLISHMENT);
    }

    if (this.profile.sessions.length >= 1) {
      return this._transitionTo(JourneyStage.ACTIVATION);
    }

    return this.currentStage; // still Arrival
  }

  /**
   * §4.7 — Activation criteria. Not "N sessions completed" but a
   * repeatable rhythm: two separate non-consecutive calendar days,
   * at least one unprompted return, and real Knowledge Map movement.
   * @param {KnowledgeGraph} graph - optional; when omitted, only the
   *   session/prompting criteria are checked (graph movement assumed
   *   satisfied elsewhere, e.g. by the caller passing it explicitly).
   */
  _hasActivated(graph = null) {
    const distinctDays = new Set(
      this.profile.sessions
        .filter(s => s.completedAt)
        .map(s => {
          const d = new Date(s.completedAt);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    );
    if (distinctDays.size < 2) return false;

    const hasUnpromptedReturn = this.profile.sessions.some(s => s.prompted === false);
    if (!hasUnpromptedReturn) return false;

    if (graph) {
      const concepts = Array.from(graph.nodes.values());
      const hasMovement = concepts.some(c => ['forming', 'held', 'reinforced'].includes(c.retentionState));
      if (!hasMovement) return false;
    }

    return true;
  }

  /**
   * §3.4 — the one legitimate backward transition. A long-gap return
   * (crossing the same At Risk threshold, personal not fixed) applies
   * a temporary Activation-equivalent FRAMING overlay without touching
   * currentStage/stageHistory. Resolves once Macro-State returns to
   * Building from Recovering.
   */
  checkBackwardFramingOverlay(macroState) {
    if (macroState === MacroState.RECOVERING &&
        this._stageRank(this.currentStage) >= this._stageRank(JourneyStage.ESTABLISHMENT)) {
      this.activationFramingOverlayActive = true;
    } else if (macroState === MacroState.BUILDING && this.activationFramingOverlayActive) {
      this.activationFramingOverlayActive = false;
    }
    return this.activationFramingOverlayActive;
  }

  /**
   * The effective stage for framing purposes — applies the §3.4 overlay
   * on top of the real (never-rewritten) currentStage.
   */
  effectiveStage() {
    if (this.activationFramingOverlayActive) return JourneyStage.ACTIVATION;
    return this.currentStage;
  }

  /**
   * §9.4 — exam date change recomputes Intensification threshold with
   * no retroactive rewriting. A student can legitimately move BACKWARD
   * from Intensification to Establishment if their exam date moves out
   * — this is the one other case besides §3.4 where stage moves
   * backward, and it's driven by the calendar fact changing, not by
   * behavior.
   */
  onExamDateChanged() {
    return this.compute();
  }

  _stageRank(stage) {
    const order = [
      JourneyStage.ARRIVAL,
      JourneyStage.ACTIVATION,
      JourneyStage.ESTABLISHMENT,
      JourneyStage.INTENSIFICATION,
      JourneyStage.CULMINATION,
      JourneyStage.CONTINUATION
    ];
    return order.indexOf(stage);
  }

  _transitionTo(newStage) {
    // §9.4 exception aside, Intensification/Culmination/Continuation are
    // date-driven and can legitimately move backward (exam date pushed
    // out) — everything below Establishment is otherwise one-directional.
    const isDateDriven = [JourneyStage.INTENSIFICATION, JourneyStage.CULMINATION, JourneyStage.CONTINUATION]
      .includes(newStage) || [JourneyStage.INTENSIFICATION, JourneyStage.CULMINATION, JourneyStage.CONTINUATION]
      .includes(this.currentStage);

    const isForwardOrDateDriven = this._stageRank(newStage) > this._stageRank(this.currentStage) || isDateDriven;

    if (this.currentStage !== newStage && isForwardOrDateDriven) {
      this.stageHistory.push({ from: this.currentStage, to: newStage, at: Date.now() });
      this.currentStage = newStage;
    }
    // Mirror onto the profile (same pattern as macroState/learningState)
    // so other SJEE modules (NotificationOrchestrator's Journey Stage
    // gate, CrossModuleMilestones' transition check) and persistence
    // can read it without holding a reference to this tracker instance.
    this.profile.journeyStage = this.currentStage;
    this.profile.journeyStageHistory = this.stageHistory;
    return this.currentStage;
  }

  toJSON() {
    return {
      currentStage: this.currentStage,
      stageHistory: this.stageHistory,
      activationFramingOverlayActive: this.activationFramingOverlayActive
    };
  }

  static fromJSON(profile, data) {
    const tracker = new JourneyStageTracker(profile);
    if (data) {
      tracker.currentStage = data.currentStage || JourneyStage.ARRIVAL;
      tracker.stageHistory = data.stageHistory || [];
      tracker.activationFramingOverlayActive = data.activationFramingOverlayActive || false;
    } else if (profile.journeyStage) {
      tracker.currentStage = profile.journeyStage;
      tracker.stageHistory = profile.journeyStageHistory || [];
    }
    return tracker;
  }

  /**
   * §8.2 — Journey Stage as the primary personalisation axis. Every
   * other SJEE module filters through this table FIRST before applying
   * any other signal, mirroring the DDE's own Macro-State-first rule
   * (DDE §2.1) at the SJEE's own layer. Returns the posture other
   * modules should read rather than maintaining their own private
   * per-stage logic (§11.4's "two-numbers problem" guard, applied to
   * personalization posture specifically).
   */
  static personalizationPosture(stage) {
    const postures = {
      [JourneyStage.ARRIVAL]: {
        notificationTone: 'minimal_outbound',
        milestoneSensitivity: 'none', // product experience must prove value first
        reEngagementPosture: 'not_applicable' // §4.9 activation-failure territory, not re-engagement
      },
      [JourneyStage.ACTIVATION]: {
        notificationTone: 'minimal_outbound',
        milestoneSensitivity: 'earliest_foundational_only',
        reEngagementPosture: 'not_applicable'
      },
      [JourneyStage.ESTABLISHMENT]: {
        notificationTone: 'standard',
        milestoneSensitivity: 'full_range',
        reEngagementPosture: 'standard_ladder'
      },
      [JourneyStage.INTENSIFICATION]: {
        notificationTone: 'exam_readiness_skewed',
        milestoneSensitivity: 'exam_readiness_leaning',
        reEngagementPosture: 'higher_internal_priority_same_tone_floor'
      },
      [JourneyStage.CULMINATION]: {
        notificationTone: 'near_zero',
        milestoneSensitivity: 'suspended',
        reEngagementPosture: 'suspended'
      },
      [JourneyStage.CONTINUATION]: {
        notificationTone: 'governed_by_continuation_engine',
        milestoneSensitivity: 'governed_by_continuation_engine',
        reEngagementPosture: 'governed_by_continuation_engine'
      }
    };
    return postures[stage] || postures[JourneyStage.ARRIVAL];
  }
}
