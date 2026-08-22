// Batch 3's "persistent queue" rule applied to Home's own Daily
// Recommendation: kairoEngine.getTodayFocus() (see TodayFocus there) is a
// non-committal *preview* — it recomputes RecommendationEngine.buildSessionPlan()
// fresh on every call, straight off whatever the graph's retention states
// happen to be right now. That's the right behavior for "what would
// starting a session pick this instant", but Home calls it as "today's
// recommendation", and retention states shift the moment the student does
// *any* other practice (Mixed, a topic session, CBT) in between — so the
// #1 spot could silently point at a different concept after a visit to
// Home, Practice, and back, even though the original recommendation was
// never actually completed. This wraps it with a same-day pin: the first
// real pick of the day is persisted and returned as-is on every later call,
// until hasCompletedTodaysRecommendation() flips true (the flame lights),
// at which point a fresh pin is free to form for the rest of the day if
// asked again (there's nothing left to protect once it's done).
import { getEngine, getTodayFocus, hasCompletedTodaysRecommendation, type TodayFocus } from './kairoEngine';
import { toLocalIso } from './planner/plannerEngine';

const STORAGE_PREFIX = 'kairo_daily_recommendation_pin_v1';

interface PinnedFocus {
  pinnedOnIso: string;
  focus: TodayFocus;
}

function storageKey(studentId: string | null | undefined): string | null {
  if (!studentId || studentId === 'pending') return null;
  return `${STORAGE_PREFIX}:${studentId}`;
}

function readPin(key: string): PinnedFocus | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PinnedFocus) : null;
  } catch {
    return null;
  }
}

/**
 * Today's Daily Recommendation, pinned. Same signature/shape as
 * kairoEngine.getTodayFocus() — a drop-in replacement for Home's own call
 * to it — except the #1 pick, once made for today, stays stable across
 * whatever other practice happens in between.
 */
export function getPinnedTodayFocus(): TodayFocus | null {
  const kairo = getEngine();
  const studentId = kairo?.profile?.studentId;
  const key = storageKey(studentId);
  const todayIso = toLocalIso(new Date());

  // No stable per-student key (signed out / pending) — nothing to pin against, fall back to the live preview.
  if (!key) return getTodayFocus();

  if (!hasCompletedTodaysRecommendation()) {
    const existing = readPin(key);
    if (existing && existing.pinnedOnIso === todayIso) return existing.focus;
  }

  const fresh = getTodayFocus();
  try {
    if (fresh) localStorage.setItem(key, JSON.stringify({ pinnedOnIso: todayIso, focus: fresh } satisfies PinnedFocus));
    else localStorage.removeItem(key);
  } catch {
    // Storage full/unavailable — the pin is a convenience, never worth surfacing an error for (same reasoning as sessionResume.ts).
  }
  return fresh;
}
