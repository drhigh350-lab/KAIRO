// Batch 4's "Streak Savior" gate — the single place that decides whether
// "back to Home" after a completed session should detour through the
// interstitial (features/home/StreakSavior.tsx) first. Shared by every
// flow controller with a Summary/Results screen (Practice, CBT, Rapid
// Fire) rather than duplicated in each, since the rule is the same
// everywhere: any *completed* non-recommendation session, with today's
// real Daily Recommendation still undone, gets intercepted — never a
// silent trip back to Home that lets the streak lapse unnoticed.
import type { NavigateFunction } from 'react-router-dom';
import { hasCompletedTodaysRecommendation } from './kairoEngine';

/**
 * `isRecommendationSession` is true only for the one session type that can
 * itself light the flame (a 'suggested'-entry Practice session) — that one
 * never re-routes into its own interstitial, completed or not.
 */
export function goHomeOrStreakSavior(navigate: NavigateFunction, isRecommendationSession: boolean): void {
  const path = !isRecommendationSession && !hasCompletedTodaysRecommendation() ? '/streak-savior' : '/home';
  navigate(path);
}
