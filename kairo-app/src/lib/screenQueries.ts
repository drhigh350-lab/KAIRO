import { prefetchQuery } from './queryCache';
import { listChallenges, mapDbChallenge } from './challengesApi';
import type { Challenge } from '../features/challenges/data';
import { getArenaHomeSummary, getDailyArenaChallenges, getTrendingChallenges, getRecentActivity, type ArenaHomeSummary, type TrendingChallenge, type RecentActivityItem } from './arenaHomeApi';
import { loadCurrentPlan, getPinnedRecommendation, type PlannerState, type DueTopic } from './planner/plannerApi';
import type { PlannerPlan } from './planner/plannerEngine';
import {
  loadReviewData, getRecentMistakes, getBookmarkedQuestions, getSessionHistory,
  type MistakeTicket, type BookmarkedQuestion, type SessionHistoryEntry,
} from './kairoEngine';

export const ARENA_HOME_KEY = 'arena-home';
export const PLANNER_KEY = 'planner';
export const REVIEW_KEY = 'review';

export interface ArenaHomeData {
  summary: ArenaHomeSummary | null;
  today: Challenge[];
  trending: TrendingChallenge[];
  activity: RecentActivityItem[];
}

export async function fetchArenaHome(): Promise<ArenaHomeData> {
  const [summary, today, trending, activity] = await Promise.all([
    getArenaHomeSummary(),
    Promise.all([getDailyArenaChallenges(), listChallenges()]).then(([daily, rows]) => {
      const mapped = rows.map(mapDbChallenge);
      return daily.map(({ id }) => mapped.find((challenge) => challenge.id === id)).filter((challenge): challenge is Challenge => !!challenge);
    }),
    getTrendingChallenges(5),
    getRecentActivity(8),
  ]);
  return { summary, today, trending, activity };
}

export interface PlannerData {
  plan: PlannerPlan | null;
  state: PlannerState | null;
  pinned: DueTopic | null;
}

export async function fetchPlanner(): Promise<PlannerData> {
  const current = await loadCurrentPlan();
  if (!current) return { plan: null, state: null, pinned: null };
  const pinned = await getPinnedRecommendation();
  return { plan: current.plan, state: current.state, pinned };
}

export interface ReviewData {
  mistakes: MistakeTicket[];
  bookmarks: BookmarkedQuestion[];
  history: SessionHistoryEntry[];
}

export async function fetchReview(): Promise<ReviewData> {
  await loadReviewData();
  const [mistakes, bookmarks, history] = await Promise.all([
    getRecentMistakes(20).catch(() => [] as MistakeTicket[]),
    getBookmarkedQuestions(20).catch(() => [] as BookmarkedQuestion[]),
    getSessionHistory(20).catch(() => [] as SessionHistoryEntry[]),
  ]);
  return { mistakes, bookmarks, history };
}

/** Warms the data behind the most-visited secondary screens so opening them is instant. */
export function prefetchScreenData(): void {
  prefetchQuery(REVIEW_KEY, fetchReview);
  prefetchQuery(ARENA_HOME_KEY, fetchArenaHome);
  prefetchQuery(PLANNER_KEY, fetchPlanner);
}
