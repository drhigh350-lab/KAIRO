import { useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { Challenge } from './data';
import { getCompletedCount } from '../../lib/challengesApi';

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

  useEffect(() => {
    getCompletedCount(challengeId).then(setCompletedCount).catch(() => setCompletedCount(null));
  }, [challengeId]);

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
          <p style={{ color: 'var(--arena-blue-soft)', margin: '10px 0 0', fontSize: 13, lineHeight: 1.5 }}>Compete, learn, and see how you perform against the KAIRO community.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <ArenaStat label="Questions" value={String(challenge.questionCount)} />
          <ArenaStat label="Scored on" value={scoringLabel[challenge.scoringFormula]} />
          <ArenaStat label="Players completed" value={completedCount == null ? '—' : completedCount.toLocaleString()} />
          <ArenaStat label="Format" value={isMockUtme ? 'CBT simulation' : 'Challenge'} />
        </div>

        <Card style={{ background: 'var(--arena-blue-surface)', border: '1px solid rgba(152,176,196,.14)', borderRadius: 14, boxShadow: 'none', padding: 16 }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>How Arena works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 13 }}>
            <Rule number="01" text="Answer each question with your best first read." />
            <Rule number="02" text="KAIRO tracks accuracy and completion time." />
            <Rule number="03" text="Review your result and keep practising your weak areas." />
          </div>
        </Card>

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
          <div style={{ textAlign: 'center', color: 'var(--arena-blue-soft)', fontSize: 11, marginTop: 12 }}>Powered by TECHMED · KAIRO Arena</div>
        </div>
      </div>
    </div>
  );
}

function ArenaStat({ label, value }: { label: string; value: string }) {
  return <div style={{ padding: '11px 12px', borderRadius: 9, background: 'var(--arena-blue-elevated)' }}><div style={{ color: 'var(--arena-blue-soft)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div><div style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginTop: 4, textTransform: 'capitalize' }}>{value}</div></div>;
}

function Rule({ number, text }: { number: string; text: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--arena-gold)', fontSize: 11, fontWeight: 900 }}>{number}</span><span style={{ color: 'var(--arena-blue-soft)', fontSize: 12.5, lineHeight: 1.4 }}>{text}</span></div>;
}
