import { Button } from '../../components';
import { ScreenHeader } from '../learning/shared';

export interface RapidFireIntroProps {
  onBack: () => void;
  onStart: () => void;
  starting: boolean;
  error: string | null;
}

export function RapidFireIntro({ onBack, onStart, starting, error }: RapidFireIntroProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Rapid Fire" tone="dark" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, padding: '0 24px' }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', background: 'var(--dark-bg-elevated)', border: '2px solid var(--dark-accent-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" /></svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Timed burst practice.</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>
            Quick-fire questions from concepts you've already studied — no explanations in between. Answer fast, build your streak.
          </div>
        </div>
        {error && <div style={{ fontSize: 13, color: 'var(--dark-danger)' }}>{error}</div>}
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="darkAccent" size="lg" fullWidth disabled={starting} onClick={onStart}>
          {starting ? 'Preparing…' : 'Start Rapid Fire'}
        </Button>
      </div>
    </div>
  );
}
