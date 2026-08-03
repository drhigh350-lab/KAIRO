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
  CONSISTENCY_ROLLING_WINDOW_DAYS: 21
});

// ─── Momentum Streak ───
export const StreakConstants = Object.freeze({
  ROLLING_WINDOW_DAYS: 14,
  PROTECTED_GAP_DAYS: 2,
  MIN_SESSIONS_PER_WINDOW: 3
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
