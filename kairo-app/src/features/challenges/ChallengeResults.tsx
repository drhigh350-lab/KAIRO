import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnswerFeedback, Badge, Button, Card } from '../../components';
import { InlineToast, StatTile } from '../learning/shared';
import type { Challenge, ChallengeQuestion } from './data';
import { getChallengeLeaderboard, getCompletedCount, getCurrentStudentId, type ChallengeLeaderboardRow } from '../../lib/challengesApi';

export interface ChallengeResultsProps {
  challenge: Challenge;
  challengeId: string;
  questions: ChallengeQuestion[];
  answers: Record<number, number>;
  result: { score: number; accuracy: number; timeTakenMs: number };
  onBackToHub: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60), s = totalSec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function ChallengeResults({ challenge, challengeId, questions, answers, result, onBackToHub }: ChallengeResultsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardRow[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);

  const { score, accuracy, timeTakenMs } = result;
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
  const myStudentId = getCurrentStudentId();

  useEffect(() => {
    Promise.all([
      getChallengeLeaderboard(challengeId),
      getCompletedCount(challengeId),
    ])
      .then(([rows, count]) => {
        setLeaderboard(rows);
        setTotalParticipants(count);
      })
      .catch(() => { setLeaderboard([]); setTotalParticipants(null); })
      .finally(() => setLoading(false));
  }, [challengeId]);

  const myRow = leaderboard.find((r) => r.student_id === myStudentId);
  const yourRank = myRow?.rank ?? null;

  const badges: string[] = [];
  if (accuracy === 100) badges.push('Perfect Score');
  if (yourRank != null && totalParticipants != null && totalParticipants > 0 && yourRank <= Math.max(1, Math.ceil(totalParticipants * 0.1))) badges.push('Top 10%');

  const band = accuracy >= 80 ? 'high' : accuracy >= 50 ? 'mid' : 'low';
  const encouragement =
    band === 'high'
      ? `Strong run — ${correctCount} of ${total} correct. This kind of consistency is exactly what keeps a streak like this worth showing up for.`
      : band === 'mid'
        ? `Solid effort — ${correctCount} of ${total} correct, with a clear pattern in what's worth reviewing next.`
        : `You showed up and finished it — that's the part that actually matters. Most students improve by their 2nd attempt on this one.`;

  function share() {
    const shareData = {
      title: challenge.title,
      text: `I scored ${score} points (${accuracy}% accuracy) on ${challenge.title} on Kairo!`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      setToastMsg('Result ready to share — copy your score and post it!');
      setTimeout(() => setToastMsg(null), 2400);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Calculating your results…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--dark-bg-canvas)' }}>
      {toastMsg && (
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 20, display: 'flex', justifyContent: 'center' }}>
          <InlineToast>{toastMsg}</InlineToast>
        </div>
      )}

      <div style={{ padding: '32px 20px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)' }}>{challenge.title}</div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>Results are in</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex' }}>
            <StatTile dark label="Score" value={score} />
            <StatTile dark label="Accuracy" value={`${accuracy}%`} />
            <StatTile dark label="Time" value={formatTime(timeTakenMs)} />
          </div>
        </Card>

        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {badges.map((b) => <Badge key={b} tone="gold">{b}</Badge>)}
          </div>
        )}

        <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.55 }}>{encouragement}</div>
        </Card>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em' }}>LEADERBOARD</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>
              {yourRank != null && totalParticipants != null ? `You're #${yourRank} of ${totalParticipants}` : 'Not ranked yet'}
            </div>
          </div>
          {leaderboard.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '8px 0' }}>Leaderboard fills in as more students finish.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {leaderboard.map((e) => (
                <div key={e.student_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px',
                  borderRadius: 'var(--radius-sm)', background: e.student_id === myStudentId ? 'var(--dark-bg-elevated)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-muted)', width: 20 }}>{e.rank}</span>
                    <span style={{ fontSize: 13, fontWeight: e.student_id === myStudentId ? 700 : 500, color: 'var(--dark-text-heading)' }}>{e.student_id === myStudentId ? 'You' : e.student_name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{e.score}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <button type="button" onClick={() => setShowReview((v) => !v)} aria-expanded={showReview} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%',
            background: 'none', border: 'none', padding: 0, minHeight: 'var(--touch-min)', fontFamily: 'inherit',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em' }}>QUESTION REVIEW</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-accent-blue)' }}>{showReview ? 'Hide' : 'Show'}</span>
          </button>
          {showReview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {questions.map((q, i) => (
                <div key={q.id}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 6 }}>{i + 1}. {q.stem}</div>
                  <AnswerFeedback
                    dark
                    correct={answers[i] === q.correct}
                    title={answers[i] === q.correct ? 'Correct' : `Correct answer: ${String.fromCharCode(65 + q.correct)}`}
                    detail={q.why}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Share your result</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{challenge.title} · {score} points · {accuracy}% accuracy</div>
          <Button variant="gold" size="md" fullWidth onClick={share}>Share Result</Button>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/practice', { state: { entry: 'weak' } })}>Practice {challenge.theme}</Button>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onBackToHub}>Back to Challenges</Button>
      </div>
    </div>
  );
}
