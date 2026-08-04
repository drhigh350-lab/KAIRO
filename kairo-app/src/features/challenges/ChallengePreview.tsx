import { Badge, Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { Challenge } from './data';

export interface ChallengePreviewProps {
  challenge: Challenge;
  onBack: () => void;
  onJoin: () => void;
  onViewResult: () => void;
  onGoToCbt: () => void;
}

export function ChallengePreview({ challenge, onBack, onJoin, onViewResult, onGoToCbt }: ChallengePreviewProps) {
  const isMockUtme = challenge.type === 'mock_utme';
  const timeLabel = challenge.timeLimitSec
    ? `${Math.round(challenge.timeLimitSec / 60)} min`
    : 'No hard timer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Challenge Preview" tone="dark" />

      <div style={{ padding: '4px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dark-accent-blue)' }}>{challenge.theme}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--dark-text-heading)', marginTop: 6 }}>{challenge.title}</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.55, marginTop: 10 }}>{challenge.description}</div>
        </div>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Questions" value={isMockUtme ? `${challenge.questionCount} (full combination)` : String(challenge.questionCount)} />
            <Row label="Time limit" value={isMockUtme ? '60 min, exam-authentic' : timeLabel} />
            <Row label="Difficulty" value={challenge.difficulty} />
            <Row label="Status" value={challenge.status === 'live' ? 'Live now' : challenge.timingLabel} />
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge tone="darkNeutral">{challenge.participantCount.toLocaleString()} students already joined</Badge>
        </div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        {isMockUtme ? (
          <Button variant="darkAccent" size="lg" fullWidth onClick={onGoToCbt}>Go to CBT Exam Mode</Button>
        ) : challenge.status === 'ended' ? (
          <Button variant="darkAccent" size="lg" fullWidth onClick={onViewResult}>See Your Result</Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth disabled={challenge.status !== 'live'} onClick={onJoin}>
            {challenge.status === 'live' ? 'Join Challenge' : 'Not Live Yet'}
          </Button>
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
