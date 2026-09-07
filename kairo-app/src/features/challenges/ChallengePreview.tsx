import { useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { Challenge, ChallengeQuestion } from './data';
import { getChallengeQuestions, getChallengeLeaderboard, getCompletedCount } from '../../lib/challengesApi';
import type { ChallengeLeaderboardRow } from '../../lib/challengesApi';
import { ArenaTabs, ArenaBottomSpace } from './ArenaTabs';

export interface ChallengePreviewProps {
  challenge: Challenge;
  challengeId: string;
  alreadyCompleted: boolean;
  busy: boolean;
  onBack: () => void;
  onJoin: () => void;
  onViewResult: () => void;
  onGoToCbt: () => void;
}

const scoringLabel: Record<Challenge['scoringFormula'], string> = { accuracy: 'Accuracy', speed: 'Speed', hybrid: 'Accuracy + speed' };

/** Arena-style challenge landing screen, adapted to KAIRO's existing authenticated challenge API. */
export function ChallengePreview({ challenge, challengeId, alreadyCompleted, busy, onBack, onJoin, onViewResult, onGoToCbt }: ChallengePreviewProps) {
  const isMockUtme = challenge.type === 'mock_utme';
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<ChallengeQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardRow[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCompletedCount(challengeId).then(setCompletedCount).catch(() => setCompletedCount(null));
    getChallengeLeaderboard(challengeId, 5).then(setLeaderboard).catch(() => setLeaderboard([]));
    if (challenge.questionIds?.length) {
      getChallengeQuestions(challenge.questionIds)
        .then(setPreviewQuestions)
        .catch(() => setPreviewQuestions([]));
    }
  }, [challengeId, challenge.questionIds]);

  const live = challenge.status === 'live';
  const primaryLabel = isMockUtme ? 'Go to CBT Exam Mode' : alreadyCompleted ? 'See Your Result' : live ? 'Start Challenge' : challenge.status === 'upcoming' ? 'Not Live Yet' : 'Challenge Ended';

  return (
    <div className="arena-flow" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', fontFamily: 'var(--font-body)', background: 'var(--arena-navy-deep)' }}>
      <ScreenHeader onBack={onBack} title="KAIRO ARENA" tone="dark" />
      <div style={{ padding: '16px 20px 120px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="arena-top-card" style={{ padding: 18, borderRadius: 14, border: '1px solid rgba(201,162,39,.38)', background: 'linear-gradient(145deg, rgba(201,162,39,.15), rgba(9,71,110,.65))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--arena-gold)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>{live ? "Today's Challenge" : challenge.theme}</div>
            <Badge tone={live ? 'success' : 'darkNeutral'}>{live ? 'Live now' : challenge.timingLabel}</Badge>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 25, lineHeight: 1.15, color: '#fff', margin: '14px 0 0', fontWeight: 800 }}>{challenge.title}</h1>
          <p style={{ color: 'var(--arena-blue-soft)', margin: '10px 0 0', fontSize: 13, lineHeight: 1.5 }}>{challenge.description || 'Compete, learn, and see how you perform against the KAIRO community.'}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 13 }}>
            <ArenaPill>{challenge.subject || 'Mixed'}</ArenaPill>
            <ArenaPill>{challenge.difficulty || 'Mixed difficulty'}</ArenaPill>
            <ArenaPill>{challenge.timingLabel}</ArenaPill>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <ArenaStat label="Questions" value={String(challenge.questionCount)} />
          <ArenaStat label="Scored on" value={scoringLabel[challenge.scoringFormula]} />
          <ArenaStat label="Players completed" value={completedCount == null ? '—' : completedCount.toLocaleString()} />
          <ArenaStat label="Format" value={isMockUtme ? 'CBT simulation' : 'Challenge'} />
        </div>

        {previewQuestions.length > 0 && (
          <Card style={{ background: 'var(--arena-blue-surface)', border: '1px solid rgba(201,162,39,.3)', borderRadius: 14, boxShadow: 'none', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>Arena question file</div>
              <span style={{ color: 'var(--arena-gold)', fontSize: 12, fontWeight: 800 }}>{previewQuestions.length} questions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {previewQuestions.map((question, index) => (
                <div key={question.id} style={{ borderRadius: 11, border: '1px solid rgba(152,176,196,.16)', background: 'var(--arena-blue-elevated)', padding: 13 }}>
                  <div style={{ color: 'var(--arena-gold)', fontSize: 10, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>Question {index + 1}</div>
                  {question.imageUrl && <img src={question.imageUrl} alt={`Diagram for question ${index + 1}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} style={{ display: 'block', width: '100%', maxHeight: 190, objectFit: 'contain', borderRadius: 8, background: '#fff', padding: 6, marginTop: 9 }} />}
                  <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5, fontWeight: 700, marginTop: question.imageUrl ? 10 : 8 }}>{question.stem}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    {question.options.map((option, optionIndex) => <div key={`${question.id}-${optionIndex}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--arena-blue-soft)', fontSize: 12, lineHeight: 1.4 }}><span style={{ color: 'var(--arena-gold)', fontWeight: 900 }}>{String.fromCharCode(65 + optionIndex)}.</span><span>{option}</span></div>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ color: 'var(--arena-blue-soft)', fontSize: 11, lineHeight: 1.45, marginTop: 12 }}>This is the complete Arena question file. Diagrams appear inside the questions that use them; answers are kept hidden until you submit your attempt.</div>
          </Card>
        )}

        <Card style={{ background: 'var(--arena-blue-surface)', border: '1px solid rgba(152,176,196,.14)', borderRadius: 14, boxShadow: 'none', padding: 16 }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>How Arena works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 13 }}>
            <Rule number="01" text="Answer each question with your best first read." />
            <Rule number="02" text="KAIRO tracks accuracy and completion time." />
            <Rule number="03" text="Review your result and keep practising your weak areas." />
          </div>
        </Card>

        {leaderboard.length > 0 && (
          <Card style={{ background: 'var(--arena-blue-surface)', border: '1px solid rgba(152,176,196,.14)', borderRadius: 14, boxShadow: 'none', padding: 16 }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>Leaderboard</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {leaderboard.map((row, index) => <div key={`${row.student_id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--arena-blue-soft)', fontSize: 12 }}><span><b style={{ color: 'var(--arena-gold)', marginRight: 8 }}>{index + 1}</b>{row.student_name || 'Player'}</span><strong style={{ color: '#fff' }}>{row.score}</strong></div>)}
            </div>
          </Card>
        )}

        {alreadyCompleted && <div style={{ color: 'var(--arena-blue-soft)', fontSize: 12, lineHeight: 1.5 }}>You have already completed this challenge. You can play again, but only your first attempt counts toward the leaderboard.</div>}

        <div style={{ marginTop: 'auto' }}>
          {isMockUtme ? (
            <Button variant="darkAccent" size="lg" fullWidth onClick={onGoToCbt}>{primaryLabel}</Button>
          ) : alreadyCompleted ? (
            <Button variant="darkAccent" size="lg" fullWidth disabled={busy} onClick={onViewResult}>{primaryLabel}</Button>
          ) : live ? (
            <Button variant="gold" size="lg" fullWidth disabled={busy} onClick={onJoin}>{busy ? 'Joining Arena…' : primaryLabel}</Button>
          ) : (
            <Button variant="secondary" size="lg" fullWidth disabled>{primaryLabel}</Button>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="button" onClick={() => { const text = `${challenge.title} — think you can beat me? ${window.location.origin}/challenges/${challengeId}`; if (navigator.share) navigator.share({ title: challenge.title, text, url: `${window.location.origin}/challenges/${challengeId}` }).catch(() => {}); else navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }} style={{ flex: 1, border: 'none', borderRadius: 999, padding: '11px 10px', background: '#25D366', color: '#fff', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>{copied ? 'Copied ✓' : 'Share Challenge'}</button>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/challenges/${challengeId}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }} style={{ border: '1px solid rgba(152,176,196,.25)', borderRadius: 999, padding: '11px 14px', background: 'transparent', color: 'var(--arena-blue-soft)', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--arena-blue-soft)', fontSize: 11, marginTop: 12 }}>Powered by TECHMED · KAIRO Arena</div>
          <ArenaBottomSpace />
        </div>
      </div>
      <ArenaTabs />
    </div>
  );
}

function ArenaStat({ label, value }: { label: string; value: string }) {
  return <div style={{ padding: '11px 12px', borderRadius: 9, background: 'var(--arena-blue-elevated)' }}><div style={{ color: 'var(--arena-blue-soft)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div><div style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginTop: 4, textTransform: 'capitalize' }}>{value}</div></div>;
}

function Rule({ number, text }: { number: string; text: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--arena-gold)', fontSize: 11, fontWeight: 900 }}>{number}</span><span style={{ color: 'var(--arena-blue-soft)', fontSize: 12.5, lineHeight: 1.4 }}>{text}</span></div>;
}

function ArenaPill({ children }: { children: string }) {
  return <span style={{ borderRadius: 999, padding: '5px 9px', background: 'rgba(0,29,54,.35)', color: 'var(--arena-blue-soft)', fontSize: 10, fontWeight: 700 }}>{children}</span>;
}
