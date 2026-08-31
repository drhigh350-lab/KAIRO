// Small, purely-cosmetic constants mirrored from the engine's real source
// of truth, kept in sync manually rather than imported — same pattern
// PracticeHub's own EXAM_PACE_SEC already uses for crossing the JS-engine/
// TS-app boundary for a display-only value (kairo-learning-engine has no
// TypeScript declarations to import from cleanly, and this one number
// changing is rare enough that a manual sync comment is the pragmatic
// choice over adding a build step for it).

/**
 * Mirrors DashboardConstants.AVOIDANCE_STREAK_THRESHOLD
 * (kairo-learning-engine/src/utils/constants.js) — the real threshold
 * RecommendationEngine.recordSprintDodged() actually enforces. Used only
 * to compute the Mentor Copy Generator's `avoidanceActive` flag for
 * display (Home and Practice Home read profile.avoidanceStreaks directly
 * and compare against this), never to gate the real engine-side logic —
 * the engine's own constant is what actually decides when
 * reportSprintDodged() returns thresholdCrossed: true.
 */
export const AVOIDANCE_STREAK_THRESHOLD = 3;
