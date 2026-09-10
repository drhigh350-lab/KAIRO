import { getSupabase } from './supabaseClient';
import { getCurrentStudentId } from './challengesApi';

/**
 * Quiz + community-question creation API. Mirrors challengesApi.ts's
 * conventions (getSupabase, .schema('kairo'), getCurrentStudentId).
 *
 * The "official question bank" (kairo.questions, ~5,300 rows) is separate
 * from community-authored questions (kairo.community_questions) and never
 * auto-merges — community questions require review before a quiz using
 * them can be published. A quiz can mix both sources.
 */

export interface OfficialQuestionSummary {
  id: string;
  subject: string;
  topic: string | null;
  stem: string;
  difficultyRating: number;
}

/** Real subjects, exactly as stored in kairo.questions.subject — no "Computer Science", no invented subjects. */
export const REAL_SUBJECTS = ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Use of English'] as const;
export type RealSubject = (typeof REAL_SUBJECTS)[number];

export async function searchOfficialQuestions(subject: string, searchText: string, limit = 20): Promise<OfficialQuestionSummary[]> {
  const supabase = getSupabase();
  let query = supabase.schema('kairo').from('questions')
    .select('id, subject, topic, stem, difficulty_rating')
    .eq('subject', subject)
    .eq('lifecycle_state', 'live')
    .limit(limit);
  if (searchText.trim()) query = query.ilike('stem', `%${searchText.trim()}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, subject: row.subject, topic: row.topic, stem: row.stem, difficultyRating: row.difficulty_rating,
  }));
}

export interface QuestionOptionInput {
  label: string;
  text: string;
  isCorrect: boolean;
}

/**
 * Structural validation only (missing fields, wrong option count, no/
 * multiple correct answers) — calls the real validate_community_question
 * RPC so the rules live in one place (the database), not duplicated here.
 * Does not write anything.
 */
export async function validateCommunityQuestion(args: {
  stem: string;
  options: QuestionOptionInput[];
  explanation: string;
  distractorExplanations: Record<string, string>;
  hint: string;
  subject: string;
  difficulty: string;
}): Promise<{ field: string; message: string }[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('validate_community_question', {
    p_stem: args.stem,
    p_options: args.options,
    p_explanation: args.explanation,
    p_distractor_explanations: args.distractorExplanations,
    p_hint: args.hint,
    p_subject: args.subject,
    p_difficulty: args.difficulty,
  });
  if (error) throw error;
  return data || [];
}

export interface CreatedCommunityQuestion {
  id: string;
  stem: string;
  status: string;
  validationErrors: { field: string; message: string }[];
}

export async function createCommunityQuestion(args: {
  subject: string;
  topic: string;
  stem: string;
  options: QuestionOptionInput[];
  explanation: string;
  distractorExplanations: Record<string, string>;
  hint: string;
  difficulty: string;
}): Promise<CreatedCommunityQuestion> {
  const studentId = getCurrentStudentId();
  if (!studentId) throw new Error('Sign in first.');
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('create_community_question', {
    p_creator_id: studentId,
    p_subject: args.subject,
    p_topic: args.topic || null,
    p_stem: args.stem,
    p_options: args.options,
    p_explanation: args.explanation,
    p_distractor_explanations: args.distractorExplanations,
    p_hint: args.hint,
    p_difficulty: args.difficulty,
  });
  if (error) throw error;
  return {
    id: data.id, stem: data.stem, status: data.status,
    validationErrors: data.validation_errors || [],
  };
}

export interface MyCommunityQuestion {
  id: string;
  subject: string;
  topic: string | null;
  stem: string;
  status: string;
  validationErrors: { field: string; message: string }[];
}

export async function getMyCommunityQuestions(): Promise<MyCommunityQuestion[]> {
  const studentId = getCurrentStudentId();
  if (!studentId) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('community_questions')
    .select('id, subject, topic, stem, status, validation_errors')
    .eq('creator_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, subject: row.subject, topic: row.topic, stem: row.stem, status: row.status,
    validationErrors: row.validation_errors || [],
  }));
}

export type QuestionRef = { source: 'official' | 'community'; id: string; stem: string };

export interface CreatedQuiz {
  id: string;
  title: string;
  status: string;
}

export async function createQuiz(args: {
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: string;
  visibility: 'public' | 'link_only' | 'followers_only' | 'private';
  estimatedDurationMinutes: number | null;
  questionRefs: QuestionRef[];
}): Promise<CreatedQuiz> {
  const studentId = getCurrentStudentId();
  if (!studentId) throw new Error('Sign in first.');
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('create_quiz', {
    p_creator_id: studentId,
    p_title: args.title,
    p_description: args.description || null,
    p_subject: args.subject,
    p_topic: args.topic || null,
    p_subtopic: null,
    p_difficulty: args.difficulty,
    p_cover_image_url: null,
    p_estimated_duration_minutes: args.estimatedDurationMinutes,
    p_visibility: args.visibility,
    p_tags: [],
    p_question_refs: args.questionRefs.map((r) => ({ source: r.source, id: r.id })),
  });
  if (error) throw error;
  return { id: data.id, title: data.title, status: data.status };
}

export interface MyQuiz {
  id: string;
  title: string;
  subject: string;
  status: string;
  moderationNotes: string | null;
  shareSlug: string | null;
  attemptCount: number;
  likeCount: number;
}

export async function getMyQuizzes(): Promise<MyQuiz[]> {
  const studentId = getCurrentStudentId();
  if (!studentId) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('quizzes')
    .select('id, title, subject, status, moderation_notes, share_slug, attempt_count, like_count')
    .eq('creator_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, title: row.title, subject: row.subject, status: row.status,
    moderationNotes: row.moderation_notes, shareSlug: row.share_slug,
    attemptCount: row.attempt_count, likeCount: row.like_count,
  }));
}

/**
 * A creator reviewing/approving their OWN submitted quiz — only works if
 * this student's row has is_official_account = true in the database.
 * Everyone else's call to this will be correctly rejected server-side.
 */
export async function reviewQuiz(quizId: string, approve: boolean, notes?: string): Promise<void> {
  const studentId = getCurrentStudentId();
  if (!studentId) throw new Error('Sign in first.');
  const supabase = getSupabase();
  const { error } = await supabase.schema('kairo').rpc('review_quiz', {
    p_quiz_id: quizId,
    p_reviewer_id: studentId,
    p_approve: approve,
    p_notes: notes ?? null,
  });
  if (error) throw error;
}

export async function createChallengeFromQuiz(quizId: string, title: string): Promise<{ id: string; shareSlug: string | null }> {
  const studentId = getCurrentStudentId();
  if (!studentId) throw new Error('Sign in first.');
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('create_challenge_from_quiz', {
    p_quiz_id: quizId,
    p_creator_id: studentId,
    p_title: title,
    p_type: 'open',
    p_visibility: 'public',
  });
  if (error) throw error;
  return { id: data.id, shareSlug: data.share_slug };
}
