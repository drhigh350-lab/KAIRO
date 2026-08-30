/**
 * Kairo Learning Engine — Global Constants
 * Platform-agnostic ES module. Works in browser, Node, and Cloudflare Workers.
 */

// ─── Retention States ───
export const RetentionState = Object.freeze({
  UNSEEN:     'unseen',
  FORMING:    'forming',
  HELD:       'held',
  FADING:     'fading',
  REINFORCED: 'reinforced'
});

// ─── Student Macro-States ───
export const MacroState = Object.freeze({
  ORIENTING:      'orienting',
  BUILDING:       'building',
  COMPOUNDING:    'compounding',
  WAVERING:       'wavering',
  AT_RISK:        'at_risk',
  RECOVERING:     'recovering',
  PEAK_READINESS: 'peak_readiness'
});

// ─── Error Pattern Tags ───
export const ErrorTag = Object.freeze({
  CONCEPTUAL_GAP:      'conceptual_gap',
  CARELESS_SLIP:       'careless_slip',
  MISAPPLIED_RULE:     'misapplied_rule',
  PARTIAL_UNDERSTANDING:'partial_understanding',
  GUESSED:             'guessed',
  MISREAD_QUESTION:    'misread_question'
});

// ─── Emotional Profile (Student Intelligence Model §4) ───
// Inferred patterns, never self-reported, never shown to the student.
// Explicitly NOT a mental-health diagnostic system.
export const EmotionalState = Object.freeze({
  HIGHLY_MOTIVATED:        'highly_motivated',
  LOSING_CONFIDENCE:       'losing_confidence',
  RECOVERING:              'recovering',
  DISCOURAGED:             'discouraged',
  OVERCONFIDENT:           'overconfident',
  EXAM_PRESSURE_INCREASING:'exam_pressure_increasing',
  NEEDS_ENCOURAGEMENT:     'needs_encouragement',
  NEEDS_CHALLENGE:         'needs_challenge'
});

// ─── Learning State (Student Intelligence Model §5) ───
// Operational — describes what mode the CURRENT stretch of work is in.
// Distinct from Macro-State, which describes overall trajectory.
// Never surfaced to the student as a badge or status.
export const LearningState = Object.freeze({
  NEW_LEARNER:         'new_learner',
  DISCOVERING:         'discovering',
  PRACTISING:          'practising',
  REINFORCING:         'reinforcing',
  REVISING:            'revising',
  RECOVERING:          'recovering',
  EXAM_SPRINT:         'exam_sprint',
  PLATEAU:             'plateau',
  MASTERY_MAINTENANCE: 'mastery_maintenance'
});

// ─── Elite Score Weights ───
export const EliteScoreWeights = Object.freeze({
  ACCURACY:    0.45,
  RETENTION:   0.35,
  CONSISTENCY: 0.20
});

// Monotonic-by-design (Kairo Score only ever rises): each component
// accrues points from append-only/sticky signals — correct attempts ever
// made, Held/Reinforced achievements ever reached, distinct days ever
// practiced — none of which can un-happen, so the raw point totals can
// only grow. SCALE is the point value at which a component's curved 0–100
// subscore reaches ~63 (1 − 1/e); tuned as a reasonable first estimate,
// not from real usage data yet.
export const EliteScorePointScale = Object.freeze({
  ACCURACY: 400,
  RETENTION: 150,
  CONSISTENCY: 90
});

export const EliteScorePoints = Object.freeze({
  HELD_BONUS: 8,             // one-time, first time a concept ever reaches Held
  REINFORCED_CYCLE_BONUS: 20, // per Fading→Reinforced cycle survived (ConceptNode.reinforcedCycles)
  CONSISTENCY_DAY_BONUS: 3    // per distinct calendar day a session was ever completed
});

// ─── Kairo Points (ProgressionSystem.LevelSystem) — "Tight Economy" ───
// Two deliberately different kinds of number, never blended:
//   Kairo Score (above) — bounded 0-100, asymptotic, recomputed fresh from
//     cumulative signals every session. A true UTME-readiness gauge: it
//     can plateau, and is meant to.
//   Kairo Points (here) — unbounded but strictly linear: every award is a
//     flat, predictable function of what actually happened in *this*
//     session, never a scan of cumulative graph/profile state. The prior
//     design (LevelSystem.awardFromProgress()) credited lifetime milestones
//     — a concept reaching Held/Reinforced, a topic crossing 80% mastery —
//     which meant several concepts crossing a threshold in the same
//     session (routine on a student's first session, or after any bulk
//     state change) could stack into a huge one-time payout with no
//     relationship to session length — a 5-question round paying out 360
//     points was that design working as built, not a bug in it. No
//     multipliers, time bonuses, or difficulty scalers ever applied here —
//     only these two flat numbers.
export const KairoPointsAwards = Object.freeze({
  CORRECT_ANSWER: 2,           // per correct answer, every mode, no exceptions — incorrect/skipped/unsure earn 0
  RECOMMENDATION_SESSION: 10,  // flat bonus for completing the daily recommendation (mode 'standard')
  VERIFICATION_SESSION: 10,    // flat bonus for completing a Study Planner verification session
  CBT_SESSION: 50,             // flat bonus for completing a full CBT simulation
  ONBOARDING_BONUS: 50         // flat, one-time bonus for finishing the onboarding diagnostic — see OnboardingEngine.buildInitialPlan()
});

// ─── Decay & Scheduling ───
export const DecayConstants = Object.freeze({
  BASE_DECAY_HALF_LIFE_DAYS: 7,
  MIN_INTERVAL_DAYS: 1,
  MAX_INTERVAL_DAYS: 90,
  EXAM_PROXIMITY_WEEKS: 6,
  EXAM_PROXIMITY_COMPRESSION: 0.5,  // intervals halved in final weeks
  FORMING_EXPOSURE_THRESHOLD: 3,    // exposures to exit Forming
  HELD_CONFIDENCE_THRESHOLD: 0.65,
  FADING_DECAY_THRESHOLD: 0.40
});

// ─── Session & Difficulty ───
export const SessionConstants = Object.freeze({
  DEFAULT_SESSION_LENGTH: 15,
  MIN_SESSION_LENGTH: 5,
  MAX_SESSION_LENGTH: 40,
  FATIGUE_SLIP_THRESHOLD: 3,         // careless slips in a row = fatigue
  DIFFICULTY_PULLBACK_WINDOW_MS: 5 * 60 * 1000, // 5 min
  MACRO_STATE_WINDOW_SESSIONS: 14,
  CONSISTENCY_ROLLING_WINDOW_DAYS: 21,
  // General-purpose "don't immediately re-serve a question the student just
  // failed" lock used by getQuestionForConcept() (Practice, Focused Sprint,
  // Frontier Push, UTME Mix, Rapid Fire, CBT) — deliberately SEPARATE from
  // ReviewConstants.MISTAKE_COOLDOWN_MS below, which stays 72h and governs
  // only the dedicated Review Module (Spaced Sandbox/Smart Patch/Triage
  // Inbox). Two different jobs: Review's 72h window is "how long before a
  // mistake even becomes eligible for deliberate retesting"; this 24h
  // window is "how long before ordinary practice is allowed to hand the
  // same question back at all." Never merge these into one constant again —
  // that's exactly the kind of shared-meaning drift this fix exists to
  // avoid, not reintroduce.
  QUESTION_REQUEUE_COOLDOWN_MS: 24 * 60 * 60 * 1000
});

// ─── Spaced Sandbox (Review Module — mistake retest cooldown) ───
export const ReviewConstants = Object.freeze({
  // A missed question is never re-tested immediately — the default cooldown
  // (from the wrong attempt's own timestamp) and an explicit "I Understand"
  // acknowledgment (from the moment it's tapped) both use this same minimum,
  // so short-term rote memorization can't pass as real retention.
  MISTAKE_COOLDOWN_MS: 72 * 60 * 60 * 1000
});

// ─── Kairo V1 Dashboard — Three Session Types (Focused Sprint / Frontier
// Push / UTME Mix) + the 2-Option Dashboard that picks between them ───
export const DashboardConstants = Object.freeze({
  // Focused Sprint's Hybrid Lock (question-level): a previously-failed
  // question unlocks only once BOTH conditions hold — the time lock
  // (QUESTION_REQUEUE_COOLDOWN_MS above) AND a volume lock scoped to the
  // Sprint's own topic. A flat 30 is unreachable for real content today in
  // several subjects (e.g. every Mathematics topic currently has fewer
  // than 30 questions total, per the live kairo.questions counts checked
  // 2026-08-30) — so the volume threshold is computed at call time as
  // min(FOCUSED_SPRINT_VOLUME_LOCK_CAP, floor(topicPoolSize * FOCUSED_SPRINT_VOLUME_LOCK_RATIO)),
  // never this raw cap alone. A thin topic gets a proportionally smaller
  // requirement instead of a lock that can never lift; a rich topic (like
  // most of Biology/Chemistry) gets the real cap.
  FOCUSED_SPRINT_VOLUME_LOCK_CAP: 30,
  FOCUSED_SPRINT_VOLUME_LOCK_RATIO: 0.5,

  // Anti-Fatigue Circuit Breaker: a Focused Sprint or Frontier Push session
  // finishing below this accuracy marks its subject "frustrated" — that
  // subject is barred from the NEXT dashboard's Primary slot (it can still
  // appear as Secondary, or as Primary again the time after, once a
  // session in a different subject has happened). Deliberately not applied
  // to UTME Mix sessions, which mix subjects and can't fairly indict one.
  FRUSTRATION_ACCURACY_THRESHOLD: 0.5,

  // UTME Mix ("critical mass") eligibility: offered when the student is in
  // peak_readiness OR has built up enough Held/Reinforced concepts that
  // real cross-subject pressure-testing is worthwhile. The 0.3 ratio
  // mirrors computeMacroState()'s own COMPOUNDING threshold (reinforcedRatio
  // > 0.3) for consistency with how the rest of the engine already reads
  // "meaningfully ahead" — not a new, unrelated number. The minimum count
  // guards against a tiny early sample (e.g. 2 of 3 touched concepts
  // Held) satisfying the ratio by accident.
  UTME_MIX_HELD_RATIO_THRESHOLD: 0.3,
  UTME_MIX_MIN_TOUCHED_CONCEPTS: 15,

  // Avoidance Tracking: choosing the Secondary option over the same
  // subject's Focused Sprint this many times IN A ROW (reset the moment
  // that subject's Sprint is actually completed, not just offered) shifts
  // Kai's tone for that subject's next nudge from gentle to direct —
  // still bound by KaiRules.NEVER_GUILT_BASED_REENGAGEMENT and the
  // platform-wide banned-phrase list; "direct" means naming the pattern
  // plainly, not guilt or comparison.
  AVOIDANCE_STREAK_THRESHOLD: 3
});

// ─── Momentum Streak ───
export const StreakConstants = Object.freeze({
  ROLLING_WINDOW_DAYS: 14,
  PROTECTED_GAP_DAYS: 2,
  MIN_SESSIONS_PER_WINDOW: 3,
  // Streak Freeze: a discrete, earned/spent resource distinct from the
  // automatic PROTECTED_GAP_DAYS grace above. One is earned the moment
  // onboarding completes; capacity never exceeds 2 without a further
  // earn event (none defined yet beyond onboarding).
  FREEZE_CAPACITY: 2,
  FREEZE_EARNED_ON_ONBOARDING: 1
});

// ─── Kai Tone Boundaries ───
export const KaiRules = Object.freeze({
  NEVER_SAY_WRONG_ALONE: true,
  NEVER_COMPARE_STUDENTS_1ON1: true,
  NEVER_GUILT_BASED_REENGAGEMENT: true,
  SPECIFICITY_OVER_ENTHUSIASM: true,
  EXPLAIN_SYSTEM_WHEN_RELEVANT: true
});

// ─── Journey Stage (Student Journey & Engagement Engine §3.2) ───
// Product lifecycle position — a separate axis from Macro-State.
// Driven by calendar facts and cumulative history, not rolling-window
// behavior. One-directional except for the single defined backward
// transition (SJEE §3.4). Never surfaced to the student directly.
export const JourneyStage = Object.freeze({
  ARRIVAL:         'arrival',
  ACTIVATION:      'activation',
  ESTABLISHMENT:   'establishment',
  INTENSIFICATION: 'intensification',
  CULMINATION:     'culmination',
  CONTINUATION:    'continuation'
});

// ─── Notification priority tiers (SJEE §5.5) ───
export const NotificationTier = Object.freeze({
  TIME_CRITICAL:  'time_critical',
  STANDARD:       'standard',
  LOW:            'low',
  INFORMATIONAL:  'informational'
});

// ─── Gap severity ladder (SJEE §6.3) ───
export const GapSeverity = Object.freeze({
  WITHIN_RHYTHM:      'within_rhythm',
  NOTABLE_GAP:        'notable_gap',
  AT_RISK_GAP:        'at_risk_gap',
  EXTENDED_ABSENCE:   'extended_absence',
  DORMANT:            'dormant'
});

// ─── Cross-module milestone categories (SJEE §7.3), in priority order ───
export const MilestoneCategory = Object.freeze({
  JOURNEY_STAGE_TRANSITION: 'journey_stage_transition',
  CUMULATIVE_LEARNING:      'cumulative_learning',
  CONSISTENCY:              'consistency',
  EXAM_READINESS:           'exam_readiness',
  JOURNEY_LENGTH:           'journey_length'
});

// ─── Continuation paths (SJEE §10.3) ───
export const ContinuationPath = Object.freeze({
  RESULT_PENDING:    'result_pending_quiet_period',
  REPEAT_CANDIDATE:  'repeat_candidate',
  POST_UTME:         'post_utme_admission_transition',
  DEPARTURE:         'departure'
});

// ─── Journey/Engagement constants ───
export const JourneyConstants = Object.freeze({
  INTENSIFICATION_WEEKS_BEFORE_EXAM: 8,   // matches Learning Engine §5.2 compression window (6-8 weeks)
  CULMINATION_DAYS_BEFORE_EXAM: 3,
  POST_EXAM_QUIET_WINDOW_DAYS: 5,
  MAX_STANDARD_PUSH_PER_DAY: 1,
  MAX_LOW_TIER_PER_WINDOW_DAYS: 3,
  WIN_BACK_MAX_ATTEMPTS: 3,
  MILESTONE_PRIORITY_ORDER: [
    'journey_stage_transition',
    'cumulative_learning',
    'consistency',
    'exam_readiness',
    'journey_length'
  ]
});

// ─── Notification categories (Notifications & Comms §3.1) ───
// Every notification belongs to exactly one — never invented ad hoc by
// a module, never blended (§3.4's single-category rule).
export const NotificationCategory = Object.freeze({
  ACADEMIC_NUDGE:        'academic_nudge',
  MOTIVATIONAL:          'motivational_consistency',
  MILESTONE:             'milestone_celebration',
  COMMUNITY_SOCIAL:      'community_social',
  REENGAGEMENT:          'reengagement_winback',
  EXAM_CRITICAL:         'exam_critical',
  ACCOUNT_ADMIN:         'account_administrative',
  EDITORIAL_BROADCAST:   'editorial_broadcast'
});

// ─── Channel roster (§4.1) ───
export const Channel = Object.freeze({
  PUSH:      'push',
  IN_APP:    'in_app_badge',
  WHATSAPP:  'whatsapp',
  EMAIL:     'email',
  SMS:       'sms'
});

// ─── Delivery guarantee tiers (§6.2) ───
export const DeliveryGuarantee = Object.freeze({
  BEST_EFFORT:            'best_effort',
  CONFIRMED_DELIVERY:     'confirmed_delivery',
  GUARANTEED_MULTICHANNEL:'guaranteed_multichannel'
});

// ─── Consent hierarchy levels (§10.2) ───
export const ConsentLevel = Object.freeze({
  CHANNEL:       'channel',   // baseline permission to reach a channel at all
  CATEGORY:      'category',  // which categories within a permitted channel
  HARD_STOP:     'hard_stop'  // SJEE §9.7's total override
});

// ─── Template slots (§5.4) ───
export const TemplateSlot = Object.freeze({
  OBSERVATION: 'observation',
  REASON:      'reason',
  BENEFIT:     'benefit',
  ACTION:      'action',
  VOICE_MARKER:'voice_marker'
});

export const CommsConstants = Object.freeze({
  // §3.1 category -> typical Orchestrator tier (informational default;
  // the SJEE Orchestrator remains sole authority on the actual tier
  // used per §1.3's one-directional boundary — this is a sensible
  // default a module can propose, not a binding override).
  CATEGORY_TYPICAL_TIER: {
    [NotificationCategory.ACADEMIC_NUDGE]: 'standard',
    [NotificationCategory.MOTIVATIONAL]: 'informational',
    [NotificationCategory.MILESTONE]: 'informational',
    [NotificationCategory.COMMUNITY_SOCIAL]: 'low',
    [NotificationCategory.REENGAGEMENT]: 'standard',
    [NotificationCategory.EXAM_CRITICAL]: 'time_critical',
    [NotificationCategory.ACCOUNT_ADMIN]: null, // outside SJEE arbitration entirely, §3.5
    [NotificationCategory.EDITORIAL_BROADCAST]: null // governed separately, §3.6
  },
  // §6.2 category -> delivery guarantee tier
  CATEGORY_DELIVERY_GUARANTEE: {
    [NotificationCategory.ACADEMIC_NUDGE]: DeliveryGuarantee.CONFIRMED_DELIVERY,
    [NotificationCategory.MOTIVATIONAL]: DeliveryGuarantee.BEST_EFFORT,
    [NotificationCategory.MILESTONE]: DeliveryGuarantee.CONFIRMED_DELIVERY,
    [NotificationCategory.COMMUNITY_SOCIAL]: DeliveryGuarantee.BEST_EFFORT,
    [NotificationCategory.REENGAGEMENT]: DeliveryGuarantee.CONFIRMED_DELIVERY,
    [NotificationCategory.EXAM_CRITICAL]: DeliveryGuarantee.GUARANTEED_MULTICHANNEL,
    [NotificationCategory.ACCOUNT_ADMIN]: DeliveryGuarantee.GUARANTEED_MULTICHANNEL,
    [NotificationCategory.EDITORIAL_BROADCAST]: DeliveryGuarantee.BEST_EFFORT
  },
  // §5.5's verbatim banned-phrase list, extended platform-wide (not just re-engagement)
  BANNED_PHRASES: [
    /we miss you/i,
    /your streak is at risk/i,
    /don'?t lose your progress/i,
    /falling behind/i,
    /you should have/i,
    /everyone else/i,
    /other students/i,
    /most students/i,
    /you failed\b/i,
    /you'?re behind/i,
    /catch up or/i
  ],
  QUIET_HOURS_START_HOUR: 22, // late night
  QUIET_HOURS_END_HOUR: 6,    // early morning
  MIN_EDITORIAL_SPACING_HOURS: 24
});

export const Brand = Object.freeze({
  NAME: 'Kairo',
  TAGLINE: 'Think Smart. Perform Elite.',
  PRIMARY_COLOR: '#012748',
  ACCENT_COLOR: '#C9A227',
  SOFT_BLUE: '#98B0C4',
  WHITE: '#F8F9FA'
});
