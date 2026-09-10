import { getSupabase } from './supabaseClient';
import { getCurrentStudentId } from './challengesApi';

/**
 * Arena Home dashboard data — every number here traces back to a real
 * column or a real computed query. No placeholder/fake activity.
 * Uses streak_current_momentum (the SAME streak the main app's Home
 * FlameIndicator already shows) rather than the unused challenge_streak
 * jsonb column, since nothing writes to that yet — one real streak
 * number, not a second invented one.
 */

export interface ArenaHomeSummary {
  kairoPoints: number;
  streak: number;
  arenaWins: number;
  arenaCompleted: number;
  arenaWinRate: number;
}

export async function getDailyArenaChallenges(): Promise<{ id: string; track: 'medical' | 'engineering' }[]> {
  const supabase = getSupabase();
  const rows = await Promise.all((['medical', 'engineering'] as const).map(async (track) => {
    const { data, error } = await supabase.schema('kairo').rpc('get_or_create_daily_arena', { p_track: track });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return row?.id ? { id: row.id, track } : null;
  }));
  return rows.filter((row): row is { id: string; track: 'medical' | 'engineering' } => !!row);
}

export async function getArenaHomeSummary(): Promise<ArenaHomeSummary | null> {
  const studentId = getCurrentStudentId();
  if (!studentId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('students')
    .select('kairo_points, streak_current_momentum, arena_wins, arena_completed, arena_win_rate')
    .eq('id', studentId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    kairoPoints: data.kairo_points, streak: data.streak_current_momentum,
    arenaWins: data.arena_wins, arenaCompleted: data.arena_completed, arenaWinRate: data.arena_win_rate,
  };
}

export interface TrendingChallenge {
  id: string;
  title: string;
  subject: string | null;
  questionCount: number;
  recentAttempts: number;
}

/**
 * "Trending" = real completed attempts in the last 48 hours, most first.
 * Not a fabricated feed — a challenge with zero recent attempts simply
 * doesn't appear here, rather than being padded with placeholder cards.
 */
export async function getTrendingChallenges(limit = 5): Promise<TrendingChallenge[]> {
  const supabase = getSupabase();
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: attempts, error } = await supabase.schema('kairo').from('challenge_attempts')
    .select('challenge_id').not('completed_at', 'is', null).gte('completed_at', cutoff);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of attempts || []) counts.set(row.challenge_id, (counts.get(row.challenge_id) || 0) + 1);
  if (counts.size === 0) return [];

  const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
  const { data: challenges } = await supabase.schema('kairo').from('challenges')
    .select('id, title, subject, question_ids').in('id', topIds)
    .eq('status', 'live').eq('visibility', 'public');

  return (challenges || [])
    .map((c) => ({
      id: c.id, title: c.title, subject: c.subject,
      questionCount: (c.question_ids || []).length, recentAttempts: counts.get(c.id) || 0,
    }))
    .sort((a, b) => b.recentAttempts - a.recentAttempts);
}

export interface RecentActivityItem {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
  studentName: string | null;
}

/**
 * Real rows from kairo.activity_events only — currently only populated
 * by challenge wins (submit_arena_attempt). Genuinely empty until real
 * activity happens; the screen shows an honest empty state rather than
 * inventing entries.
 */
export async function getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('activity_events')
    .select('id, event_type, payload, created_at, student_id')
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;

  const studentIds = [...new Set((data || []).map((r) => r.student_id).filter(Boolean))];
  const nameMap = new Map<string, string>();
  if (studentIds.length) {
    const { data: creators } = await supabase.schema('kairo').from('public_creator_info')
      .select('id, name, display_handle').in('id', studentIds);
    for (const c of creators || []) nameMap.set(c.id, c.display_handle ? `@${c.display_handle}` : c.name ?? 'A Kairo student');
  }

  return (data || []).map((row) => ({
    id: row.id, eventType: row.event_type, payload: row.payload || {}, createdAt: row.created_at,
    studentName: nameMap.get(row.student_id) ?? null,
  }));
}
