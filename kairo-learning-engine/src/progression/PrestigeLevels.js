/**
 * Kairo — Prestige Levels
 * A second, additional axis layered on top of the same lifetime
 * profile.kairoPoints number LevelSystem already reads — deliberately NOT
 * a replacement for LevelSystem's own "Level" concept (First Step/Curious
 * Mind/.../Kairo Legend). Level is the fast-moving, session-to-session
 * gamification ladder (10 tiers, tops out at 5,500 points); Prestige is a
 * slower, coarser status band (5 tiers, tops out at 15,000+) meant to read
 * as a lasting rank on the Profile header the way a competitive game's
 * "Diamond/Master" band sits above its per-match XP bar — both derived
 * from the exact same never-decreasing kairoPoints ledger, never blended
 * into one number.
 *
 * Pure and stateless by design (same shape as LevelSystem's own
 * _calculateCurrentLevel()) — a tier is always fully recomputable from
 * kairoPoints alone, so there's nothing here to persist or migrate.
 */

// Five tiers, most-permissive-first-match style (matches LevelSystem's own
// _calculateCurrentLevel() loop). borderToken names a CSS custom property
// this repo's frontend already defines (--kairo-slate/bronze/silver/gold/
// amber) rather than a raw hex, so Avatar.tsx and the Profile header stay
// in sync with the rest of the dark-navy/gold design system automatically.
export const PrestigeTiers = Object.freeze([
  { tierIndex: 0, name: 'The Candidate', minPoints: 0, borderToken: 'slate', glow: false, message: "Every strategist starts here. Let's build." },
  { tierIndex: 1, name: 'The Strategist', minPoints: 500, borderToken: 'bronze', glow: false, message: "You're building real, repeatable momentum." },
  { tierIndex: 2, name: 'The Scholar', minPoints: 2500, borderToken: 'silver', glow: false, message: 'This is genuine, sustained depth — not a burst.' },
  { tierIndex: 3, name: 'The Elite', minPoints: 7500, borderToken: 'gold', glow: false, message: "Elite-level consistency. This is who you've become." },
  // The Outlier is the one tier that gets the amber glow treatment — the
  // same visual language Batch 2's top badge tier reuses, so "you're in
  // rarefied territory" reads consistently everywhere it appears.
  { tierIndex: 4, name: 'The Outlier', minPoints: 15000, borderToken: 'amber', glow: true, message: 'Very few reach this. You are operating at a different level.' }
]);

/**
 * Map a lifetime kairoPoints total to its Prestige tier. Never decreases
 * with normal use since kairoPoints itself is unbounded/never decreases
 * (ProgressionSystem.js's Tight Economy) — Math.max(0, ...) below only
 * guards a corrupt/negative value, not a real gameplay path.
 */
export function getPrestigeTier(kairoPoints) {
  const points = Math.max(0, kairoPoints || 0);
  let tier = PrestigeTiers[0];
  for (const t of PrestigeTiers) {
    if (points >= t.minPoints) tier = t;
  }
  const next = PrestigeTiers[tier.tierIndex + 1] || null;
  const progressPercent = next
    ? Math.min(100, Math.round(((points - tier.minPoints) / (next.minPoints - tier.minPoints)) * 100))
    : 100;

  return {
    name: tier.name,
    tierIndex: tier.tierIndex,
    borderToken: tier.borderToken,
    glow: tier.glow,
    message: tier.message,
    points,
    nextTierName: next ? next.name : null,
    nextTierMinPoints: next ? next.minPoints : null,
    pointsToNext: next ? Math.max(0, next.minPoints - points) : 0,
    progressPercent
  };
}
