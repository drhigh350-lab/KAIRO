/**
 * Kairo — CrossModuleMilestones
 * Student Journey & Engagement Engine §7 — Cross-Module Milestones.
 *
 * Surfaces product-scale milestones no single module can see on its
 * own (a first-month-across-everything, a full-combination Reinforced
 * sweep). Deliberately resists finding a milestone-shaped fact every
 * day even though it structurally could (§7.2) — a milestone is only
 * surfaced when genuinely rare for THIS student, never merely round.
 *
 * Always Informational-tier (§7.5) — never competes for the
 * Orchestrator's Standard-tier push slot. Delivered in-session, not
 * as an interruption.
 */

import { MilestoneCategory, JourneyStage } from "../utils/constants.js";
import { JourneyStageTracker } from "./JourneyStageTracker.js";

export class CrossModuleMilestones {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.awardedMilestones = []; // { category, key, awardedAt } — permanent, prevents re-firing
    this.pendingQueue = []; // milestones that qualified but lost the §9.5 priority competition
  }

  /**
   * Check all categories and return AT MOST ONE milestone — the single
   * highest-priority qualifying candidate, per §9.5. Any other
   * candidates that qualified in the same pass are queued (not
   * discarded) for a later, separate call rather than bundled together,
   * which would dilute each one's specificity (§7.6, §5.10's identical
   * anti-bundling rule for notifications).
   * @param {KnowledgeGraph} graph
   * @param {string[]} emotionalStates - current EmotionalProfile.compute() output
   */
  check(graph, emotionalStates = []) {
    // §7.4 — never celebrate the same week as a visible rough patch.
    if (emotionalStates.includes('discouraged') || emotionalStates.includes('losing_confidence')) {
      return [];
    }

    // §8.2 — Culmination suspends new milestones entirely; anything
    // worth celebrating in that window belongs to CBT Exam Mode's own
    // post-submission framing, not the SJEE.
    const posture = JourneyStageTracker.personalizationPosture(this.profile.journeyStage);
    if (posture.milestoneSensitivity === 'suspended') {
      return [];
    }

    // Drain the pending queue first — a milestone that qualified but
    // lost a prior priority competition is genuinely delivered on a
    // later call, not merely re-derived if its condition happens to
    // still hold. This is what makes "queued, never discarded" (§9.5)
    // actually true rather than incidental.
    if (this.pendingQueue.length > 0) {
      const winner = this.pendingQueue.shift();
      if (!this._alreadyAwarded(winner.category, winner.key)) {
        this.awardedMilestones.push({ category: winner.category, key: winner.key, awardedAt: Date.now() });
        return [winner];
      }
      // Already awarded through some other path since being queued —
      // fall through to check for fresh candidates instead.
    }

    // §9.5 priority order: Journey Stage transitions > Cumulative
    // learning > Consistency > Journey length. (Exam-readiness sits
    // between Cumulative and Consistency per §7.3's own table ordering,
    // but no _checkExamReadiness exists yet — Student Intelligence
    // Model §6's Exam Readiness metric isn't built; left as an
    // explicit gap rather than guessed at.)
    const candidates = [
      this._checkJourneyStageTransition(),
      this._checkCumulativeLearning(graph),
      this._checkConsistency(),
      this._checkJourneyLength()
    ].filter(Boolean);

    if (candidates.length === 0) return [];

    const [winner, ...rest] = candidates;

    this.awardedMilestones.push({ category: winner.category, key: winner.key, awardedAt: Date.now() });

    for (const r of rest) {
      const alreadyQueued = this.pendingQueue.some(p => p.category === r.category && p.key === r.key);
      if (!alreadyQueued) this.pendingQueue.push(r);
    }

    return [winner];
  }

  _alreadyAwarded(category, key) {
    return this.awardedMilestones.some(m => m.category === category && m.key === key);
  }

  /**
   * §7.3 — Journey Stage transitions. At most once per transition,
   * ever. Reads JourneyStageTracker's own history rather than
   * re-deriving it.
   */
  _checkJourneyStageTransition() {
    const history = this.profile.journeyStageHistory || [];
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    const key = `${last.from}_to_${last.to}`;
    if (this._alreadyAwarded(MilestoneCategory.JOURNEY_STAGE_TRANSITION, key)) return null;

    // Only Establishment and Intensification transitions are genuinely
    // milestone-worthy per §3.2's framing — Arrival/Activation/
    // Continuation transitions are structural, not earned moments.
    if (![JourneyStage.ESTABLISHMENT, JourneyStage.INTENSIFICATION].includes(last.to)) return null;

    const framing = last.to === JourneyStage.ESTABLISHMENT
      ? "You've built a real rhythm with your preparation — this is no longer a new habit, it's becoming yours."
      : "You're in the final stretch now. Everything from here is about sharpening what you've already built.";

    return { category: MilestoneCategory.JOURNEY_STAGE_TRANSITION, key, framing };
  }

  /**
   * §7.3 — cumulative learning. First Reinforced concept in every
   * subject of the active combination; full-breadth Knowledge Map
   * threshold. Rare by construction.
   */
  _checkCumulativeLearning(graph) {
    const concepts = Array.from(graph.nodes.values());
    const subjects = this.profile.targetSubjects || [];
    if (subjects.length === 0) return null;

    const key = 'full_combination_reinforced';
    if (this._alreadyAwarded(MilestoneCategory.CUMULATIVE_LEARNING, key)) return null;

    const reinforcedPerSubject = subjects.every(subj =>
      concepts.some(c => c.subject === subj && c.retentionState === 'reinforced')
    );

    if (reinforcedPerSubject) {
      return {
        category: MilestoneCategory.CUMULATIVE_LEARNING,
        key,
        framing: "You've now reached Reinforced in every subject you're preparing with — that's the first time your whole combination has held up under review."
      };
    }
    return null;
  }

  /**
   * §7.3 — consistency milestone. Personalised threshold, not a fixed
   * universal number: a meaningful streak length relative to this
   * student's own typical rhythm, read from MomentumStreak.
   */
  _checkConsistency() {
    const momentum = this.profile.streakData?.currentMomentum || 0;
    if (momentum === 0) return null;

    // "Meaningful for this student" — a momentum count that represents
    // roughly a month of their own typical cadence, not a flat number.
    const typicalWeeklySessions = this._estimateWeeklySessionRate();
    if (typicalWeeklySessions === null) return null;

    const meaningfulThreshold = Math.round(typicalWeeklySessions * 4); // ~1 month at their own pace
    if (meaningfulThreshold < 3) return null; // too low to be meaningful even personalized

    const key = `consistency_${meaningfulThreshold}`;
    if (this._alreadyAwarded(MilestoneCategory.CONSISTENCY, key)) return null;

    if (momentum >= meaningfulThreshold) {
      return {
        category: MilestoneCategory.CONSISTENCY,
        key,
        framing: "You've kept a steady rhythm going for about a month at your own pace — that consistency is exactly what makes the material stick."
      };
    }
    return null;
  }

  _estimateWeeklySessionRate() {
    const completed = this.profile.sessions.filter(s => s.completedAt);
    if (completed.length < 4) return null;
    const sorted = completed.sort((a, b) => a.completedAt - b.completedAt);
    const spanDays = (sorted[sorted.length - 1].completedAt - sorted[0].completedAt) / (24 * 60 * 60 * 1000);
    if (spanDays < 7) return null;
    return (completed.length / spanDays) * 7;
  }

  /**
   * §7.3 — journey-length milestones. Computed per-student from
   * registration date and exam date, never a calendar-wide date.
   */
  _checkJourneyLength() {
    if (!this.profile.registrationDate || !this.profile.examDate) return null;

    const midpoint = this.profile.registrationDate + (this.profile.examDate - this.profile.registrationDate) / 2;
    const key = 'registration_exam_midpoint';
    if (this._alreadyAwarded(MilestoneCategory.JOURNEY_LENGTH, key)) return null;

    const now = Date.now();
    // Fire once we've crossed the midpoint, within a small window so it
    // doesn't get missed entirely if the app wasn't opened exactly then.
    const withinWindow = now >= midpoint && now <= midpoint + 3 * 24 * 60 * 60 * 1000;

    if (withinWindow) {
      return {
        category: MilestoneCategory.JOURNEY_LENGTH,
        key,
        framing: "You're at the halfway point between when you started and your exam date — everything you've built so far is the foundation for what's next."
      };
    }
    return null;
  }

  toJSON() {
    return { awardedMilestones: this.awardedMilestones, pendingQueue: this.pendingQueue };
  }

  static fromJSON(profile, data) {
    const m = new CrossModuleMilestones(profile);
    if (data) {
      m.awardedMilestones = data.awardedMilestones || [];
      m.pendingQueue = data.pendingQueue || [];
    }
    return m;
  }
}
