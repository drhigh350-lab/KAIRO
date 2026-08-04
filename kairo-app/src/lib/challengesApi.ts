import { getSupabase } from './supabaseClient';
import { getEngine } from './kairoEngine';
import { toUiQuestion, type EngineFlatQuestion } from './engineAdapter';
import type { Challenge, ChallengeAccent, ChallengeQuestion, ChallengeStatus } from '../features/challenges/data';

/**
 * Real Challenges data — queried directly from Supabase rather than
 * through KairoEngine, since the vendored engine's own `ChallengesModule`
 * is an unrelated feature (personal daily/weekly achievement checks, not
 * admin-authored public events). kairo.challenges/challenge_attempts and
 * the get_challenge_leaderboard() RPC are the real backing for this
 * screen — this file is the only place that touches them.
 */

export interface DbChallenge {
  id: string;
  type: string;
  title: string;
  theme: string | null;
  question_ids: string[];
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

export async function listChallenges(): Promise<DbChallenge[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('challenges').select('*').order('starts_at', { ascending: true });
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
    status,
    timingLabel: timingLabel(status, db.starts_at, db.ends_at),
    questionCount: db.question_ids?.length || 0,
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

export async function getChallengeQuestions(questionIds: string[]): Promise<ChallengeQuestion[]> {
  if (!questionIds.length) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('questions')
    .select('id, subject, topic, stem, options, correct_option, explanation')
    .in('id', questionIds);
  if (error) throw error;
  const byId = new Map((data || []).map((row: Record<string, unknown>) => [row.id, row]));
  return questionIds
    .map((id) => byId.get(id))
    .filter((row): row is Record<string, unknown> => !!row)
    .map((row) => {
      const flat: EngineFlatQuestion = {
        id: row.id as string,
        subject: row.subject as string,
        topic: row.topic as string,
        text: row.stem as string,
        options: row.options as EngineFlatQuestion['options'],
        correctOption: row.correct_option as string,
        explanation: row.explanation as string | null,
      };
      const ui = toUiQuestion(flat);
      return { id: ui.id, stem: ui.stem, options: ui.options, correct: ui.correct, why: ui.why };
    });
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
  const { data, error } = await supabase.schema('kairo').from('challenge_attempts')
    .insert({ id: crypto.randomUUID(), challenge_id: challengeId, student_id: studentId })
    .select().single();
  if (error) throw error;
  return data;
}

export interface SubmitAttemptArgs {
  attemptId: string;
  score: number;
  accuracy: number;
  timeTakenMs: number;
  questionResults: { questionId: string; correct: boolean; selectedOption: string | null }[];
}

export async function submitChallengeAttempt({ attemptId, score, accuracy, timeTakenMs, questionResults }: SubmitAttemptArgs): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.schema('kairo').from('challenge_attempts').update({
    completed_at: new Date().toISOString(),
    score,
    accuracy,
    time_taken_ms: timeTakenMs,
    question_results: questionResults,
  }).eq('id', attemptId);
  if (error) throw error;
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
