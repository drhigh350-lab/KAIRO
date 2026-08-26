export type ChallengeStatus = 'live' | 'upcoming' | 'ended';
export type ChallengeAccent = 'navy' | 'blue' | 'gold';

export interface ChallengeQuestion {
  id: string;
  stem: string;
  options: string[];
  correct: number;
  why: string;
  imageUrl?: string | null;
}

/** UI-facing shape, mapped from a real kairo.challenges row — see lib/challengesApi.ts. */
export interface Challenge {
  id: string;
  type: string;
  title: string;
  theme: string;
  status: ChallengeStatus;
  timingLabel: string;
  questionCount: number;
  scoringFormula: 'accuracy' | 'speed' | 'hybrid';
  accent: ChallengeAccent;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isYou?: boolean;
}
