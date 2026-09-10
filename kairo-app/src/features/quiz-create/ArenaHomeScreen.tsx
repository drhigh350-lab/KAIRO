import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../learning/shared';
import { ArenaTabs, ArenaBottomSpace } from '../challenges/ArenaTabs';
import { listChallenges, mapDbChallenge } from '../../lib/challengesApi';
import type { Challenge } from '../challenges/data';
import { getArenaHomeSummary, getDailyArenaChallenge, getTrendingChallenges, getRecentActivity, type ArenaHomeSummary, type TrendingChallenge, type RecentActivityItem } from '../../lib/arenaHomeApi';

function activityLine(item: RecentActivityItem): string {
  const who = item.studentName ?? 'A Kairo student';
  if (item.eventType === 'challenge_won') {
    const score = item.payload.score;
    return `${who} won an Arena match${typeof score === 'number' ? ` scoring ${score}` : ''}`;
  }
  return `${who} was active`;
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function ArenaHomeScreen() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ArenaHomeSummary | null>(null);
  const [today, setToday] = useState<Challenge | null>(null);
  const [trending, setTrending] = useState<TrendingChallenge[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getArenaHomeSummary(),
      Promise.all([getDailyArenaChallenge(), listChallenges()]).then(([daily, rows]) => rows.map(mapDbChallenge).find((c) => c.id === daily?.id) || null),
      getTrendingChallenges(5),
      getRecentActivity(8),
    ])
      .then(([s, t, tr, a]) => { setSummary(s); setToday(t); setTrending(tr); setActivity(a); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={() => navigate('/home')} title="Arena" tone="dark" />

      <div style={{ padding: '0 20px 40px', flex: 1 }}>
        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', textAlign: 'center', padding: '40px 0' }}>Loading…</div>
        ) : (
          <>
            {summary && (
              <section style={{ display: 'flex', gap: 8, padding: '16px 0 20px' }}>
                <SummaryTile label="Kairo Points" value={summary.kairoPoints.toLocaleString()} accent="gold" />
                <SummaryTile label="Streak" value={`${summary.streak}🔥`} />
                <SummaryTile label="Win Rate" value={`${Math.round(summary.arenaWinRate)}%`} />
              </section>
            )}

            <section style={{ marginBottom: 24 }}>
              <SectionLabel>TODAY IN ARENA</SectionLabel>
              {today ? (
                <button
                  onClick={() => navigate(`/arena/challenge/${today.id}`)}
                  style={{
                    width: '100%', textAlign: 'left', padding: 16, borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontFamily: 'inherit',
                    background: 'linear-gradient(135deg, rgba(201,162,39,0.15), rgba(201,162,39,0.04))', border: '1px solid rgba(201,162,39,0.35)',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--arena-gold)', letterSpacing: '.03em' }}>{today.theme}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--dark-text-heading)', marginTop: 4, fontFamily: 'var(--font-heading)' }}>{today.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>{today.questionCount} questions · {today.timingLabel}</div>
                </button>
              ) : (
                <EmptyRow text="No live Arena match right now — check back soon." />
              )}
            </section>

            <section style={{ marginBottom: 24 }}>
              <SectionLabel>TRENDING NOW</SectionLabel>
              {trending.length === 0 ? (
                <EmptyRow text="Nothing trending in the last 48 hours yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {trending.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/arena/challenge/${c.id}`)}
                      style={{
                        width: '100%', textAlign: 'left', padding: 12, borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'inherit',
                        background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--arena-gold)', width: 18 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--dark-text-heading)' }}>{c.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--dark-text-muted)', marginTop: 1 }}>{c.subject ?? 'Mixed'} · {c.recentAttempts} attempt{c.recentAttempts === 1 ? '' : 's'} in 48h</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <SectionLabel>RECENT ACTIVITY</SectionLabel>
              {activity.length === 0 ? (
                <EmptyRow text="No recent activity to show yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activity.map((a) => (
                    <div key={a.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--dark-bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--dark-text-body)' }}>🏆 {activityLine(a)}</span>
                      <span style={{ fontSize: 11, color: 'var(--dark-text-faint)', flexShrink: 0 }}>{timeAgo(a.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <ArenaBottomSpace />
      <ArenaTabs />
    </div>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent?: 'gold' }) {
  return (
    <div style={{ flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-md)', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: accent === 'gold' ? 'var(--arena-gold)' : 'var(--dark-text-heading)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--dark-text-faint)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.02em' }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 10 }}>{children}</div>;
}

function EmptyRow({ text }: { text: string }) {
  return <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '16px 0' }}>{text}</div>;
}
