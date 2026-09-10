import { getSupabase } from './supabaseClient';
import { getEngine } from './kairoEngine';
import type { Challenge, ChallengeAccent, ChallengeQuestion, ChallengeStatus } from '../features/challenges/data';

/**
 * Real Challenges data — queried directly from Supabase. kairo.challenges /
 * kairo.challenge_attempts and two SECURITY DEFINER RPCs are the real
 * backing for this screen:
 *   - get_challenge_questions_safe(challenge_id): returns questions WITHOUT
 *     the answer key. The previous version of this file selected
 *     kairo.questions directly (including correct_option) and sent it to
 *     the browser before the student answered — a real answer-leak, fixed
 *     here by using this RPC instead of a raw table select.
 *   - submit_arena_attempt(attempt_id, question_results, time_taken_ms):
 *     re-scores the attempt SERVER-SIDE against the real answer key and
 *     returns the verified score/rank/participant_count. The client never
 *     computes or trusts its own score for what gets stored — only for the
 *     instant per-question right/wrong flash during play, which is a UI
 *     nicety, not the record of truth.
 */

export interface DbChallenge {
  id: string;
  type: string;
  title: string;
  theme: string | null;
  description: string | null;
  subject: string | null;
  difficulty: string | null;
  question_ids: string[];
  community_question_ids?: string[];
  scoring_formula: 'accuracy' | 'speed' | 'hybrid';
  starts_at: string;
  ends_at: string;
  late_join_allowed: boolean;
  leaderboard_visible: boolean;
  status: 'scheduled' | 'live' | 'concluded' | 'archived';
}

export interface DbChallengeAttempt {
  id: string;
  challenge_id: string;
  student_id: string;
  joined_at: string;
  completed_at: string | null;
  counts_toward_leaderboard: boolean;
  score: number | null;
  accuracy: number | null;
  time_taken_ms: number | null;
  question_results: unknown[];
  rank_in_challenge: number | null;
}

export interface ChallengeLeaderboardRow {
  student_id: string;
  student_name: string;
  score: number;
  accuracy: number;
  time_taken_ms: number | null;
  rank: number;
}

export function getCurrentStudentId(): string | null {
  const kairo = getEngine();
  const id = kairo?.profile?.studentId;
  return id && id !== 'pending' ? id : null;
}
const currentStudentId = getCurrentStudentId;
const GUEST_TOKEN_KEY = 'kairo.arena.guest_token';

export function getGuestToken(): string | null {
  try { return localStorage.getItem(GUEST_TOKEN_KEY); } catch { return null; }
}

export async function claimStoredGuestSession(): Promise<boolean> {
  const token = getGuestToken();
  if (!token) return false;
  const supabase = getSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const authUserId = userData.user?.id;
  if (!authUserId) return false;
  const { error } = await supabase.schema('kairo').rpc('claim_guest_session', { p_token: token, p_auth_user_id: authUserId });
  if (error) return false;
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem('kairo.arena.guest_attempt_id');
  return true;
}

export async function trackArenaEvent(eventType: string, payload: Record<string, unknown> = {}): Promise<void> {
  const studentId = getCurrentStudentId();
  if (!studentId) return;
  const supabase = getSupabase();
  await supabase.schema('kairo').from('activity_events').insert({ student_id: studentId, event_type: eventType, payload });
}

export async function startGuestSession(nickname: string): Promise<{ token: string; studentId: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('start_guest_session', { p_nickname: nickname.trim() });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.token || !row?.student_id) throw new Error('Could not start a guest Arena session.');
  localStorage.setItem(GUEST_TOKEN_KEY, row.token);
  return { token: row.token, studentId: row.student_id };
}

async function requireGuestToken(): Promise<string> {
  const token = getGuestToken();
  if (!token) throw new Error('Start a guest Arena session first.');
  return token;
}

export async function getGuestAttempt(attemptId: string): Promise<DbChallengeAttempt | null> {
  const token = getGuestToken();
  if (!token) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('guest_get_attempt', { p_token: token, p_attempt_id: attemptId });
  if (error) return null;
  return data || null;
}

export async function joinChallengeAsGuest(challengeId: string): Promise<DbChallengeAttempt> {
  const token = await requireGuestToken();
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('guest_join_challenge', { p_token: token, p_challenge_id: challengeId });
  if (error) throw error;
  const { data: attempt, error: attemptError } = await supabase.schema('kairo').rpc('guest_get_attempt', { p_token: token, p_attempt_id: data });
  if (attemptError || !attempt) throw attemptError || new Error('Could not load the guest Arena attempt.');
  return attempt;
}

export async function submitGuestChallengeAttempt({ attemptId, questionResults, timeTakenMs }: SubmitAttemptArgs): Promise<SubmitAttemptResult> {
  const token = await requireGuestToken();
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('guest_submit_attempt', {
    p_token: token,
    p_attempt_id: attemptId,
    p_question_results: questionResults.map((r) => ({ question_id: r.questionId, selected_option: r.selectedOption, response_time_ms: r.responseTimeMs })),
    p_time_taken_ms: timeTakenMs,
  });
  if (error) throw error;
  const answerKey: Record<string, string> = {};
  const { data: attemptRow } = await supabase.schema('kairo').rpc('guest_get_attempt', { p_token: token, p_attempt_id: attemptId });
  for (const r of (attemptRow?.question_results as { question_id: string; correct_option: string }[]) || []) answerKey[r.question_id] = r.correct_option;
  return { score: data.score, total: data.total, accuracyPct: data.accuracy_pct, timeTakenMs: data.time_taken_ms, rankInChallenge: data.rank_in_challenge, participantCount: data.participant_count, betterThanPct: data.better_than_pct, isWin: data.is_win, isFirstAttempt: data.is_first_attempt, attemptNumber: data.attempt_number, previousBestScore: data.previous_best_score, improvedBy: data.improved_by, answerKey };
}

export async function listChallenges(): Promise<DbChallenge[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('challenges').select('*').neq('status', 'archived').order('starts_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

function mapStatus(status: DbChallenge['status']): ChallengeStatus {
  if (status === 'live') return 'live';
  if (status === 'scheduled') return 'upcoming';
  return 'ended'; // concluded | archived
}

function mapAccent(type: string): ChallengeAccent {
  if (type === 'mock_utme' || type === 'marathon' || type === 'special_campaign') return 'navy';
  if (type === 'daily' || type === 'weekly') return 'gold';
  return 'blue';
}

function relativeTimeLabel(fromNow: number): string {
  const abs = Math.abs(fromNow);
  const mins = Math.round(abs / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function timingLabel(status: ChallengeStatus, startsAt: string, endsAt: string): string {
  const now = Date.now();
  if (status === 'upcoming') return `Starts in ${relativeTimeLabel(new Date(startsAt).getTime() - now)}`;
  if (status === 'live') return `Ends in ${relativeTimeLabel(new Date(endsAt).getTime() - now)}`;
  return `Ended ${relativeTimeLabel(now - new Date(endsAt).getTime())} ago`;
}

/** Maps a raw kairo.challenges row to the UI-facing Challenge shape. No fields are invented — every value traces back to a real column. */
export function mapDbChallenge(db: DbChallenge): Challenge {
  const status = mapStatus(db.status);
  return {
    id: db.id,
    type: db.type,
    title: db.title,
    theme: db.theme || db.type,
    description: db.description,
    subject: db.subject,
    difficulty: db.difficulty,
    status,
    timingLabel: timingLabel(status, db.starts_at, db.ends_at),
    questionCount: (db.question_ids?.length || 0) + (db.community_question_ids?.length || 0),
    questionIds: db.question_ids || [],
    scoringFormula: db.scoring_formula,
    accent: mapAccent(db.type),
  };
}

/** Real count of students who've completed this challenge (and count toward its leaderboard) — the honest equivalent of a "participants" figure. */
export async function getCompletedCount(challengeId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('get_challenge_leaderboard', {
    p_challenge_id: challengeId,
    p_around_student_id: null,
    p_window: 0,
  });
  if (error) throw error;
  return (data || []).length;
}

/**
 * Fetches questions for play WITHOUT the answer key, via
 * get_challenge_questions_safe. Do not replace this with a direct
 * `.from('questions').select(...)` — that column includes correct_option
 * and would send the answer to the browser before the student answers.
 */
export async function getChallengeQuestions(challengeId: string): Promise<ChallengeQuestion[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('get_challenge_questions_safe', {
    p_challenge_id: challengeId,
  });
  if (error) throw error;
  return (data || [])
    .sort((a: { q_position: number }, b: { q_position: number }) => a.q_position - b.q_position)
    .map((row: { id: string; stem: string; options: { label: string; text: string }[]; image_url: string | null }) => ({
      id: row.id,
      stem: row.stem,
      options: (row.options || []).map((o) => o.text),
      imageUrl: row.image_url,
    }));
}

/** The signed-in student's own attempt for this challenge, or null if they haven't joined. */
export async function getMyAttempt(challengeId: string): Promise<DbChallengeAttempt | null> {
  const studentId = currentStudentId();
  if (!studentId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('challenge_attempts')
    .select('*').eq('challenge_id', challengeId).eq('student_id', studentId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function joinChallenge(challengeId: string): Promise<DbChallengeAttempt> {
  const studentId = currentStudentId();
  if (!studentId) throw new Error('No active engine — sign in first.');
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('join_arena_challenge', {
    p_challenge_id: challengeId,
    p_student_id: studentId,
  });
  if (error) throw error;
  // join_arena_challenge returns the new attempt id (text) — fetch the full row
  // so callers get the same shape they did before.
  const attempt = await getMyAttempt(challengeId);
  if (!attempt) throw new Error('Could not load the attempt that was just created.');
  return attempt;
}

export interface SubmitAttemptArgs {
  attemptId: string;
  questionResults: { questionId: string; selectedOption: string; responseTimeMs: number }[];
  timeTakenMs: number;
}

export interface SubmitAttemptResult {
  score: number;
  total: number;
  accuracyPct: number;
  timeTakenMs: number;
  rankInChallenge: number | null;
  participantCount: number;
  betterThanPct: number | null;
  isWin: boolean;
  isFirstAttempt: boolean;
  attemptNumber: number;
  previousBestScore: number | null;
  improvedBy: number | null;
  /** Correct option label per question id, returned only now that the attempt is submitted — safe to show on the results screen. */
  answerKey: Record<string, string>;
}

/**
 * Submits an attempt for SERVER-SIDE scoring via submit_arena_attempt.
 * This re-derives correctness against the real answer key in the database
 * — the client's own guess at right/wrong (used only for the instant
 * per-question flash during play) is never what gets stored or ranked.
 */
export async function submitChallengeAttempt({ attemptId, questionResults, timeTakenMs }: SubmitAttemptArgs): Promise<SubmitAttemptResult> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('submit_arena_attempt', {
    p_attempt_id: attemptId,
    p_question_results: questionResults.map((r) => ({
      question_id: r.questionId,
      selected_option: r.selectedOption,
      response_time_ms: r.responseTimeMs,
    })),
    p_time_taken_ms: timeTakenMs,
  });
  if (error) throw error;

  const answerKey: Record<string, string> = {};
  // submit_arena_attempt doesn't currently return per-question correct
  // options in its jsonb payload — pull them from challenge_attempts.
  // question_results, which the RPC writes with the verified answer key.
  const { data: attemptRow } = await supabase.schema('kairo').from('challenge_attempts')
    .select('question_results').eq('id', attemptId).maybeSingle();
  for (const r of (attemptRow?.question_results as { question_id: string; correct_option: string }[]) || []) {
    answerKey[r.question_id] = r.correct_option;
  }

  return {
    score: data.score,
    total: data.total,
    accuracyPct: data.accuracy_pct,
    timeTakenMs: data.time_taken_ms,
    rankInChallenge: data.rank_in_challenge,
    participantCount: data.participant_count,
    betterThanPct: data.better_than_pct,
    isWin: data.is_win,
    isFirstAttempt: data.is_first_attempt,
    attemptNumber: data.attempt_number,
    previousBestScore: data.previous_best_score,
    improvedBy: data.improved_by,
    answerKey,
  };
}

/** Real cross-student leaderboard via the get_challenge_leaderboard() SECURITY DEFINER RPC — a window of rows around the signed-in student. */
export async function getChallengeLeaderboard(challengeId: string, windowSize = 10): Promise<ChallengeLeaderboardRow[]> {
  const supabase = getSupabase();
  const studentId = currentStudentId();
  const { data, error } = await supabase.schema('kairo').rpc('get_challenge_leaderboard', {
    p_challenge_id: challengeId,
    p_around_student_id: studentId,
    p_window: windowSize,
  });
  if (error) throw error;
  return data || [];
}

/**
 * Explanations for the Results review screen — safe to fetch directly
 * (unlike during play) because the attempt is already submitted and
 * scored by this point; there's no answer left to leak. Kept as its own
 * call rather than folded into submit_arena_attempt so that RPC's job
 * stays scoring, not content delivery.
 */
export async function getQuestionExplanations(questionIds: string[]): Promise<Record<string, string | null>> {
  if (!questionIds.length) return {};
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('questions')
    .select('id, explanation').in('id', questionIds);
  if (error) throw error;
  const out: Record<string, string | null> = {};
  for (const row of data || []) out[row.id] = row.explanation;
  return out;
}
