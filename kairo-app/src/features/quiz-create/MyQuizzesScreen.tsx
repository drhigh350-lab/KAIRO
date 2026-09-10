import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { getMyQuizzes, reviewQuiz, createChallengeFromQuiz, type MyQuiz } from '../../lib/quizApi';
import { getCurrentStudentId } from '../../lib/challengesApi';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', processing: 'Processing', needs_fixes: 'Needs Fixes',
  under_review: 'Under Review', published: 'Published', rejected: 'Rejected', archived: 'Archived',
};

function statusColor(status: string): string {
  if (status === 'published') return '#4E9E7B';
  if (status === 'rejected' || status === 'needs_fixes') return 'var(--dark-danger)';
  return 'var(--arena-gold)';
}

export function MyQuizzesScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = (location.state as { justCreated?: boolean } | null)?.justCreated;

  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const rows = await getMyQuizzes();
    setQuizzes(rows);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleApprove(quiz: MyQuiz) {
    setBusyId(quiz.id);
    try {
      await reviewQuiz(quiz.id, true, 'Self-approved for testing');
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreateChallenge(quiz: MyQuiz) {
    setBusyId(quiz.id);
    try {
      const challenge = await createChallengeFromQuiz(quiz.id, quiz.title);
      if (challenge.shareSlug) navigate(`/challenges/${challenge.id}`);
      else navigate('/challenges');
    } finally {
      setBusyId(null);
    }
  }

  const studentId = getCurrentStudentId();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={() => navigate('/home')} title="My Quizzes" tone="dark"
        right={
          <button onClick={() => navigate('/quiz-create')} style={{ background: 'none', border: 'none', color: 'var(--arena-gold)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            + New
          </button>
        }
      />

      <div style={{ padding: '16px 20px 40px', flex: 1 }}>
        {justCreated && (
          <div style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid rgba(78,158,123,0.4)', background: 'rgba(78,158,123,0.08)', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4E9E7B' }}>✓ Quiz submitted for review.</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>It'll show as "Under Review" until approved — status shows below.</div>
          </div>
        )}

        {!studentId ? (
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', padding: '40px 0' }}>Sign in to see your quizzes.</div>
        ) : loading ? (
          <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', textAlign: 'center', padding: '40px 0' }}>Loading…</div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 16 }}>You haven't created any quizzes yet.</div>
            <Button variant="darkAccent" onClick={() => navigate('/quiz-create')}>Create Your First Quiz</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quizzes.map((q) => (
              <div key={q.id} style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--dark-text-faint)' }}>{q.subject}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)', marginTop: 2 }}>{q.title}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: statusColor(q.status), padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: `${statusColor(q.status)}22`, flexShrink: 0 }}>
                    {STATUS_LABEL[q.status] ?? q.status}
                  </span>
                </div>

                {(q.status === 'needs_fixes' || q.status === 'rejected') && q.moderationNotes && (
                  <div style={{ fontSize: 12, color: 'var(--dark-danger)', marginTop: 8 }}>{q.moderationNotes}</div>
                )}

                {q.status === 'under_review' && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginBottom: 8 }}>You can review your own submissions for testing.</div>
                    <button
                      onClick={() => handleApprove(q)}
                      disabled={busyId === q.id}
                      style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', background: '#4E9E7B', color: '#fff', opacity: busyId === q.id ? 0.5 : 1 }}
                    >
                      {busyId === q.id ? 'Approving…' : 'Approve & Publish'}
                    </button>
                  </div>
                )}

                {q.status === 'published' && (
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>{q.attemptCount} attempts · {q.likeCount} likes</span>
                    <button
                      onClick={() => handleCreateChallenge(q)}
                      disabled={busyId === q.id}
                      style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', background: 'var(--arena-gold)', color: '#1a1200', opacity: busyId === q.id ? 0.5 : 1 }}
                    >
                      {busyId === q.id ? 'Creating…' : 'Create Challenge'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
