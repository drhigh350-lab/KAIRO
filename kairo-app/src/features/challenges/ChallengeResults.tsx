import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnswerFeedback, Badge, Button, Card } from '../../components';
import { InlineToast, StatTile } from '../learning/shared';
import { buildLeaderboard, type Challenge } from './data';

export interface ChallengeResultsProps {
  challenge: Challenge;
  answers: Record<number, number>;
  onBackToHub: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function ChallengeResults({ challenge, answers, onBackToHub }: ChallengeResultsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const total = challenge.questions.length;
  const correctCount = challenge.questions.filter((q, i) => answers[i] === q.correct).length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const timeTaken = challenge.timeLimitSec ? challenge.timeLimitSec : total * 35;
  const score = correctCount * 10;

  const { entries, yourRank, totalParticipants } = buildLeaderboard(score, total);

  const badges: string[] = [];
  if (accuracy === 100) badges.push('Perfect Score');
  if (yourRank <= Math.ceil(totalParticipants * 0.1)) badges.push('Top 10%');

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
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Calculating your results…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative' }}>
      {toastMsg && (
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 20, display: 'flex', justifyContent: 'center' }}>
          <InlineToast>{toastMsg}</InlineToast>
        </div>
      )}

      <div style={{ padding: '32px 20px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>{challenge.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Results are in</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex' }}>
            <StatTile label="Score" value={score} />
            <StatTile label="Accuracy" value={`${accuracy}%`} />
            <StatTile label="Time" value={formatTime(timeTaken)} />
          </div>
        </Card>

        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {badges.map((b) => <Badge key={b} tone="gold">{b}</Badge>)}
          </div>
        )}

        <Card style={{ background: 'var(--kairo-blue-100)' }}>
          <div style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.55 }}>{encouragement}</div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em' }}>LEADERBOARD</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You're #{yourRank} of {totalParticipants}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {entries.map((e) => (
              <div key={e.rank} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px',
                borderRadius: 'var(--radius-sm)', background: e.isYou ? 'var(--kairo-blue-100)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>{e.rank}</span>
                  <span style={{ fontSize: 13, fontWeight: e.isYou ? 700 : 500, color: 'var(--text-heading)' }}>{e.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>{e.score}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div onClick={() => setShowReview((v) => !v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em' }}>QUESTION REVIEW</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--kairo-blue-700)' }}>{showReview ? 'Hide' : 'Show'}</span>
          </div>
          {showReview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {challenge.questions.map((q, i) => (
                <div key={q.id}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 6 }}>{i + 1}. {q.stem}</div>
                  <AnswerFeedback
                    correct={answers[i] === q.correct}
                    title={answers[i] === q.correct ? 'Correct' : `Correct answer: ${String.fromCharCode(65 + q.correct)}`}
                    detail={q.why}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ background: 'var(--kairo-navy-900)', color: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Share your result</div>
          <div style={{ fontSize: 12, color: 'var(--kairo-blue-200)' }}>{challenge.title} · {score} points · {accuracy}% accuracy</div>
          <Button variant="gold" size="md" fullWidth onClick={share}>Share Result</Button>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/practice', { state: { entry: 'weak' } })}>Practice {challenge.theme}</Button>
        <Button variant="primary" size="lg" fullWidth onClick={onBackToHub}>Back to Challenges</Button>
      </div>
    </div>
  );
}
