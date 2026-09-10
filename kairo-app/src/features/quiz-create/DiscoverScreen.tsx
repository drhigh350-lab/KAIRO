import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../learning/shared';
import { getDiscoverQuizzes, getDiscoverChallenges, type DiscoverQuiz, type DiscoverChallenge } from '../../lib/discoverApi';
import { REAL_SUBJECTS } from '../../lib/quizApi';

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    border: `1.5px solid ${active ? 'var(--arena-gold)' : 'var(--dark-border)'}`,
    background: active ? 'rgba(201,162,39,0.15)' : 'var(--dark-bg-surface)',
    color: active ? 'var(--arena-gold)' : 'var(--dark-text-muted)',
    whiteSpace: 'nowrap', flexShrink: 0,
  };
}

export function DiscoverScreen() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<DiscoverQuiz[]>([]);
  const [challenges, setChallenges] = useState<DiscoverChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDiscoverQuizzes(subject ?? undefined),
      getDiscoverChallenges(subject ?? undefined),
    ])
      .then(([q, c]) => { setQuizzes(q); setChallenges(c); })
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={() => navigate('/home')} title="Discover" tone="dark" />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 20px 16px' }}>
        <button onClick={() => setSubject(null)} style={pillStyle(!subject)}>All</button>
        {REAL_SUBJECTS.map((s) => (
          <button key={s} onClick={() => setSubject(s)} style={pillStyle(subject === s)}>{s}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px 40px', flex: 1 }}>
        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', textAlign: 'center', padding: '40px 0' }}>Loading…</div>
        ) : (
          <>
            <section style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 10 }}>LIVE CHALLENGES</div>
              {challenges.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '16px 0' }}>No live challenges in this subject right now.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {challenges.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/challenges/${c.id}`)}
                      style={{
                        textAlign: 'left', padding: 14, borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontFamily: 'inherit',
                        background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', display: 'flex', gap: 10, alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.isOfficial && (
                            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--arena-gold)', background: 'rgba(201,162,39,0.15)', padding: '2px 6px', borderRadius: 4 }}>OFFICIAL</span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--dark-text-faint)' }}>{c.subject ?? 'Mixed'}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)', marginTop: 2 }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>{c.questionCount} questions</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2.5"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--arena-gold)', letterSpacing: '.03em', marginBottom: 10 }}>COMMUNITY QUIZZES</div>
              {quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', marginBottom: 12 }}>
                    No published quizzes yet{subject ? ` in ${subject}` : ''} — be the first to create one.
                  </div>
                  <button
                    onClick={() => navigate('/quiz-create')}
                    style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', background: 'var(--arena-gold)', color: '#1a1200' }}
                  >
                    Create a Quiz
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {quizzes.map((q) => (
                    <div key={q.id} style={{ padding: 14, borderRadius: 'var(--radius-lg)', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {q.isOfficial ? (
                          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--arena-gold)', background: 'rgba(201,162,39,0.15)', padding: '2px 6px', borderRadius: 4 }}>OFFICIAL</span>
                        ) : (
                          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--dark-accent-blue)', background: 'rgba(46,124,246,0.15)', padding: '2px 6px', borderRadius: 4 }}>COMMUNITY</span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--dark-text-faint)' }}>{q.subject}{q.topic ? ` · ${q.topic}` : ''}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)', marginTop: 4 }}>{q.title}</div>
                      {q.description && <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 4 }}>{q.description}</div>}
                      <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 8 }}>
                        by {q.creatorHandle ? `@${q.creatorHandle}` : q.creatorName ?? 'a Kairo student'} · {q.questionCount} questions · {q.attemptCount} attempts · {q.likeCount} likes
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
