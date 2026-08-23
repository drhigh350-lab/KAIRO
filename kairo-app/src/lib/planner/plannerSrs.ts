// Tiered Spaced Repetition for Planner topics — pure functions, same style
// as plannerEngine.ts (no DOM/storage/fetch). Scoped deliberately to
// Planner topics (subjectSlug::stageOrder::topicTitle keys from
// topicKey()), not to the vendored kairo-learning-engine's own concept-level
// DecayModel/RevisionScheduler (a continuous half-life curve over
// KnowledgeGraph concepts, already exercised across Practice/Review/CBT).
// Rewriting that engine to a fixed-tier schedule would ripple across every
// module that reads retentionState; this instead gives the Planner's own
// "topic completed -> when should it resurface" loop the exact three-tier
// behavior specified, without touching concept-level scheduling at all.
export type SrsTier = 'mastery' | 'forming' | 'critical';

const MASTERY_THRESHOLD = 80;
const FORMING_THRESHOLD = 50;

/** Mastery: 80%+ final accuracy. Forming: 50-79%. Critical: below 50%. */
export function classifyAccuracyTier(accuracyPct: number): SrsTier {
  if (accuracyPct >= MASTERY_THRESHOLD) return 'mastery';
  if (accuracyPct >= FORMING_THRESHOLD) return 'forming';
  return 'critical';
}

// Velocity Tracking: a question answered correctly but slowly is real
// signal the student hasn't built fluency yet, not genuine mastery -- JAMB/
// UTME is timed, so "eventually correct" isn't the same skill as "correct
// at exam pace." A single slow answer is normal friction; more than one in
// the same Verification Session means the pattern is real.
export const HIGH_FRICTION_SECONDS = 60;
const HIGH_FRICTION_MASTERY_THROTTLE_COUNT = 2;

export interface TimedAnswer {
  correct: boolean;
  /** Real elapsed seconds on this question. */
  timeSec: number;
}

/** A correct answer that took longer than HIGH_FRICTION_SECONDS -- "eventually right," not "exam-ready." */
export function isHighFrictionPass(answer: TimedAnswer): boolean {
  return answer.correct && answer.timeSec > HIGH_FRICTION_SECONDS;
}

export function countHighFrictionPasses(answers: TimedAnswer[]): number {
  return answers.filter(isHighFrictionPass).length;
}

/**
 * Accuracy alone drives Critical/Forming; Mastery additionally requires
 * getting there at real exam pace. Two or more High-Friction Passes in the
 * same session throttle what would otherwise be a Mastery result down to
 * Forming (+1/+3/+7 days) instead of Mastery (+3/+7/+14/+21) -- the student
 * needs to come back sooner and build speed, not just eventual accuracy.
 * Never throttles Forming/Critical further -- a slow-but-correct answer at
 * a tier that already isn't Mastery carries no additional penalty.
 */
export function classifyTier(accuracyPct: number, highFrictionPassCount: number): SrsTier {
  const tier = classifyAccuracyTier(accuracyPct);
  if (tier === 'mastery' && highFrictionPassCount >= HIGH_FRICTION_MASTERY_THROTTLE_COUNT) return 'forming';
  return tier;
}

const MASTERY_OFFSETS_DAYS = [3, 7, 14, 21];
const FORMING_OFFSETS_DAYS = [1, 3, 7];

/**
 * Decay-timer resurface dates (ISO, local calendar day) from a given
 * attempt date. Critical topics get no resurface schedule at all — per
 * spec they're a prerequisite gap flagged for immediate next practice, not
 * something deferred to a future date (see isImmediateNextRecommendation()
 * / TopicProgress.criticalGap below).
 */
export function computeResurfaceDates(tier: SrsTier, fromDateIso: string): string[] {
  const offsets = tier === 'mastery' ? MASTERY_OFFSETS_DAYS : tier === 'forming' ? FORMING_OFFSETS_DAYS : [];
  return offsets.map((days) => addDaysIso(fromDateIso, days));
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface TopicProgress {
  tier: SrsTier;
  lastAccuracyPct: number;
  /** Pending (not yet consumed) resurface dates for mastery/forming — empty for critical. */
  resurfaceDates: string[];
  /** True while this topic is an unresolved critical gap — cleared once it's re-attempted. */
  criticalGap: boolean;
  lastAttemptedAt: string;
}

export type TopicProgressMap = Record<string, TopicProgress>;

/** Applies one Verification/topic-session result to a topic's SRS state — the write side of the decay timer. `highFrictionPassCount` (see classifyTier above) can throttle what would otherwise be a Mastery result down to Forming. */
export function recordTopicAttempt(topicKey: string, accuracyPct: number, nowIso: string, progress: TopicProgressMap, highFrictionPassCount = 0): TopicProgressMap {
  const tier = classifyTier(accuracyPct, highFrictionPassCount);
  return {
    ...progress,
    [topicKey]: {
      tier,
      lastAccuracyPct: accuracyPct,
      resurfaceDates: computeResurfaceDates(tier, nowIso),
      criticalGap: tier === 'critical',
      lastAttemptedAt: nowIso,
    },
  };
}

export interface DueTopic {
  topicKey: string;
  tier: SrsTier;
  /** True for a critical prerequisite gap; false for a due mastery/forming resurface. */
  isCriticalGap: boolean;
  /**
   * Set when this DueTopic is a Prerequisite Fallback reroute: topicKey is
   * NOT the topic that actually failed Verification (<50%) but the earlier
   * topic it depends on, per the Blueprint's dependency data. rerouteFromKey
   * holds the original failed topic's key so callers can explain why this
   * topic is being recommended instead. See findPrerequisiteTopicKey()
   * (plannerEngine.ts) and getPinnedRecommendation() (plannerApi.ts).
   */
  rerouteFromKey?: string;
}

/**
 * The single next topic the Planner should recommend, right now — critical
 * gaps first (queued as the immediate next recommendation per spec), then
 * whichever due mastery/forming resurface has been waiting longest. Null
 * when nothing is due. Callers combine this with pinPlannerRecommendation()
 * below to hold it steady across other practice in the meantime.
 */
export function getNextDueTopic(progress: TopicProgressMap, todayIso: string): DueTopic | null {
  const critical = Object.entries(progress).find(([, p]) => p.criticalGap);
  if (critical) return { topicKey: critical[0], tier: 'critical', isCriticalGap: true };

  const due = Object.entries(progress)
    .flatMap(([topicKey, p]) => {
      const earliestDue = p.resurfaceDates.filter((d) => d <= todayIso).sort()[0];
      return earliestDue ? [{ topicKey, tier: p.tier, dueSince: earliestDue }] : [];
    })
    .sort((a, b) => (a.dueSince < b.dueSince ? -1 : 1));

  if (due.length === 0) return null;
  return { topicKey: due[0].topicKey, tier: due[0].tier, isCriticalGap: false };
}
