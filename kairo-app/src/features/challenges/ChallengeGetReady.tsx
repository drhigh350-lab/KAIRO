import { Button } from '../../components';
import { KaiPanel } from '../learning/shared';
import type { Challenge } from './data';

export interface ChallengeGetReadyProps {
  challenge: Challenge;
  onStart: () => void;
}

export function ChallengeGetReady({ challenge, onStart }: ChallengeGetReadyProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', fontFamily: 'var(--font-body)', justifyContent: 'space-between', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ padding: '48px 24px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--dark-accent-blue)' }}>Get Ready</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--dark-text-heading)', marginTop: 10 }}>{challenge.title}</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55 }}>
          {challenge.questionCount} question{challenge.questionCount === 1 ? '' : 's'}
          {challenge.timeLimitSec ? ` · ${Math.round(challenge.timeLimitSec / 60)} min total` : ' · no hard timer'}
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <KaiPanel tone="dark" note="Answer with your first honest read — this is meant to feel fast and light, not high-stakes." />
      </div>

      <div style={{ padding: '24px' }}>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onStart}>Start</Button>
      </div>
    </div>
  );
}
