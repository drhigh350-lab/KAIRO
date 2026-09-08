import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnswerFeedback, Badge, Button, Card } from '../../components';
import { InlineToast, StatTile } from '../learning/shared';
import type { Challenge, ChallengeQuestion } from './data';
import { getChallengeLeaderboard, getCompletedCount, getCurrentStudentId, getQuestionExplanations, type ChallengeLeaderboardRow, type SubmitAttemptResult } from '../../lib/challengesApi';

export interface ChallengeResultsProps {
  challenge: Challenge;
  challengeId: string;
  questions: ChallengeQuestion[];
  /** The option index the student picked for each question, by question index. */
  answers: Record<number, number>;
  /**
   * The verified result from submitChallengeAttempt — this, not the
   * client's own guess, is the record of truth for score/rank/correctness.
   * answerKey maps question id -> correct option LABEL ("A"/"B"/...),
   * only populated once submission has actually happened server-side.
   */
  result: SubmitAttemptResult;
  onBackToHub: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60), s = totalSec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function labelToIndex(label: string): number {
  return label.toUpperCase().charCodeAt(0) - 65;
}

export function ChallengeResults({ challenge, challengeId, questions, answers, result, onBackToHub }: ChallengeResultsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardRow[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string | null>>({});

  const { score, accuracyPct, timeTakenMs, isFirstAttempt, attemptNumber, improvedBy, answerKey } = result;
  const total = questions.length;
  const myStudentId = getCurrentStudentId();

  useEffect(() => {
    Promise.all([
      getChallengeLeaderboard(challengeId),
      getCompletedCount(challengeId),
      // Safe now — the attempt is already submitted and scored, nothing
      // left to leak. Falls back to no explanation text if a question is
      // community-authored (this fetch only covers the official bank).
      getQuestionExplanations(questions.map((q) => q.id)),
    ])
      .then(([rows, count, expl]) => {
        setLeaderboard(rows);
        setTotalParticipants(count);
        setExplanations(expl);
      })
      .catch(() => { setLeaderboard([]); setTotalParticipants(null); })
      .finally(() => setLoading(false));
  }, [challengeId]);

  const myRow = leaderboard.find((r) => r.student_id === myStudentId);
  const yourRank = myRow?.rank ?? null;

  const badges: string[] = [];
  if (accuracyPct === 100) badges.push('Perfect Score');
  if (yourRank != null && totalParticipants != null && totalParticipants > 0 && yourRank <= Math.max(1, Math.ceil(totalParticipants * 0.1))) badges.push('Top 10%');

  const band = accuracyPct >= 80 ? 'high' : accuracyPct >= 50 ? 'mid' : 'low';

  // Replays get their own message (improvement-focused, per the "no
  // Practice Mode label, just tell them how much better they did" rule) —
  // never the plain first-attempt encouragement copy.
  const encouragement = !isFirstAttempt
    ? (improvedBy != null && improvedBy > 0
        ? `Huge jump — you improved by ${improvedBy}% on attempt #${attemptNumber}. Only your first attempt counts for the leaderboard, but that growth is real.`
        : `Attempt #${attemptNumber} done. Only your first attempt counts for the leaderboard — this one was just for you.`)
    : band === 'high'
      ? `Strong run — ${score} of ${total} correct. This kind of consistency is exactly what keeps a streak like this worth showing up for.`
      : band === 'mid'
        ? `Solid effort — ${score} of ${total} correct, with a clear pattern in what's worth reviewing next.`
        : `You showed up and finished it — that's the part that actually matters. Most students improve by their 2nd attempt on this one.`;

  function share() {
    const shareData = {
      title: challenge.title,
      text: `I scored ${score} points (${accuracyPct}% accuracy) on ${challenge.title} on Kairo!`,
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
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>
          {isFirstAttempt ? 'Results are in' : `Attempt #${attemptNumber} — results are in`}
        </div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex' }}>
            <StatTile dark label="Score" value={score} />
            <StatTile dark label="Accuracy" value={`${accuracyPct}%`} />
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
              {!isFirstAttempt
                ? 'Replays aren\u2019t ranked'
                : yourRank != null && totalParticipants != null ? `You're #${yourRank} of ${totalParticipants}` : 'Not ranked yet'}
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
              {questions.map((q, i) => {
                const correctLabel = answerKey[q.id];
                const correctIndex = correctLabel ? labelToIndex(correctLabel) : -1;
                const isCorrect = correctIndex >= 0 && answers[i] === correctIndex;
                return (
                  <div key={q.id}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 6 }}>{i + 1}. {q.stem}</div>
                    <AnswerFeedback
                      dark
                      correct={isCorrect}
                      title={isCorrect || correctIndex < 0 ? 'Correct' : `Correct answer: ${String.fromCharCode(65 + correctIndex)}`}
                      detail={explanations[q.id] ?? undefined}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Share your result</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{challenge.title} · {score} points · {accuracyPct}% accuracy</div>
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
