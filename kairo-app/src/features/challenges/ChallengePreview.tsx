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

export function ChallengePreview({ challenge, challengeId, alreadyCompleted, busy, onBack, onJoin, onViewResult, onGoToCbt }: ChallengePreviewProps) {
  const isMockUtme = challenge.type === 'mock_utme';
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  useEffect(() => {
    getCompletedCount(challengeId).then(setCompletedCount).catch(() => setCompletedCount(null));
  }, [challengeId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Challenge Preview" tone="dark" />

      <div style={{ padding: '4px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dark-accent-blue)' }}>{challenge.theme}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--dark-text-heading)', marginTop: 6 }}>{challenge.title}</div>
        </div>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Questions" value={String(challenge.questionCount)} />
            <Row label="Scored on" value={scoringLabel[challenge.scoringFormula]} />
            <Row label="Status" value={challenge.status === 'live' ? 'Live now' : challenge.timingLabel} />
          </div>
        </Card>

        {completedCount != null && completedCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge tone="darkNeutral">{completedCount.toLocaleString()} student{completedCount === 1 ? ' has' : 's have'} completed this</Badge>
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        {isMockUtme ? (
          <Button variant="darkAccent" size="lg" fullWidth onClick={onGoToCbt}>Go to CBT Exam Mode</Button>
        ) : alreadyCompleted ? (
          <Button variant="darkAccent" size="lg" fullWidth disabled={busy} onClick={onViewResult}>See Your Result</Button>
        ) : challenge.status === 'live' ? (
          <Button variant="darkAccent" size="lg" fullWidth disabled={busy} onClick={onJoin}>{busy ? 'Joining…' : 'Join Challenge'}</Button>
        ) : challenge.status === 'upcoming' ? (
          <Button variant="darkAccent" size="lg" fullWidth disabled>Not Live Yet</Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth disabled>Challenge Ended</Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{value}</span>
    </div>
  );
}
