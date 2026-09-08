export type ChallengeStatus = 'live' | 'upcoming' | 'ended';
export type ChallengeAccent = 'navy' | 'blue' | 'gold';

/**
 * During PLAY, the correct answer is deliberately not known on the client
 * — get_challenge_questions_safe() never returns it, so there is nothing
 * to leak over the network before the student answers. Once an attempt is
 * submitted, submit_arena_attempt() re-scores it server-side and returns
 * a verified answer key (see SubmitAttemptResult.answerKey in
 * lib/challengesApi.ts) — that's the only place `correctOption` /
 * `explanation` become available, for the Results review screen only.
 */
export interface ChallengeQuestion {
  id: string;
  stem: string;
  options: string[];
  imageUrl?: string | null;
}

/** UI-facing shape, mapped from a real kairo.challenges row — see lib/challengesApi.ts. */
export interface Challenge {
  id: string;
  type: string;
  title: string;
  theme: string;
  description?: string | null;
  subject?: string | null;
  difficulty?: string | null;
  status: ChallengeStatus;
  timingLabel: string;
  questionCount: number;
  questionIds?: string[];
  scoringFormula: 'accuracy' | 'speed' | 'hybrid';
  accent: ChallengeAccent;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isYou?: boolean;
}
