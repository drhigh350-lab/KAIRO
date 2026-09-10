import { getSupabase } from './supabaseClient';

/**
 * Discover feed data — real published public quizzes + real live public
 * challenges. Creator display info comes from kairo.public_creator_info
 * (a narrow view exposing only name/handle/avatar) since kairo.students
 * itself is locked to "read your own row only" via RLS.
 */

export interface DiscoverQuiz {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  topic: string | null;
  difficulty: string | null;
  questionCount: number;
  attemptCount: number;
  likeCount: number;
  isOfficial: boolean;
  creatorName: string | null;
  creatorHandle: string | null;
}

export interface DiscoverChallenge {
  id: string;
  title: string;
  subject: string | null;
  questionCount: number;
  isOfficial: boolean;
}

export async function getDiscoverQuizzes(subject?: string): Promise<DiscoverQuiz[]> {
  const supabase = getSupabase();
  let query = supabase.schema('kairo').from('quizzes')
    .select('id, title, description, subject, topic, difficulty, attempt_count, like_count, is_official, creator_id')
    .eq('status', 'published').eq('visibility', 'public')
    .order('attempt_count', { ascending: false })
    .limit(30);
  if (subject) query = query.eq('subject', subject);
  const { data, error } = await query;
  if (error) throw error;
  const quizzes = data || [];

  const quizIds = quizzes.map((q) => q.id);
  const questionCounts = new Map<string, number>();
  if (quizIds.length) {
    const { data: qqRows } = await supabase.schema('kairo').from('quiz_questions')
      .select('quiz_id').in('quiz_id', quizIds);
    for (const row of qqRows || []) {
      questionCounts.set(row.quiz_id, (questionCounts.get(row.quiz_id) || 0) + 1);
    }
  }

  const creatorIds = [...new Set(quizzes.map((q) => q.creator_id).filter(Boolean))];
  const creatorMap = new Map<string, { name: string | null; display_handle: string | null }>();
  if (creatorIds.length) {
    const { data: creators } = await supabase.schema('kairo').from('public_creator_info')
      .select('id, name, display_handle').in('id', creatorIds);
    for (const c of creators || []) creatorMap.set(c.id, { name: c.name, display_handle: c.display_handle });
  }

  return quizzes.map((row) => {
    const creator = row.creator_id ? creatorMap.get(row.creator_id) : null;
    return {
      id: row.id, title: row.title, description: row.description, subject: row.subject, topic: row.topic,
      difficulty: row.difficulty, questionCount: questionCounts.get(row.id) ?? 0,
      attemptCount: row.attempt_count, likeCount: row.like_count, isOfficial: row.is_official,
      creatorName: creator?.name ?? null, creatorHandle: creator?.display_handle ?? null,
    };
  });
}

export async function getDiscoverChallenges(subject?: string): Promise<DiscoverChallenge[]> {
  const supabase = getSupabase();
  let query = supabase.schema('kairo').from('challenges')
    .select('id, title, subject, question_ids, is_official')
    .eq('status', 'live').eq('visibility', 'public')
    .order('starts_at', { ascending: false })
    .limit(30);
  if (subject) query = query.eq('subject', subject);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, title: row.title, subject: row.subject,
    questionCount: (row.question_ids || []).length, isOfficial: row.is_official,
  }));
}
