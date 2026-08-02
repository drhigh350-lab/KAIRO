import { Button, KairoWordmark } from '../../components';

export interface WelcomeProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export function Welcome({ onSignUp, onSignIn }: WelcomeProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '56px 28px 32px', fontFamily: 'var(--font-body)', background: 'var(--color-bg-canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, textAlign: 'center' }}>
        <KairoWordmark width={132} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--text-heading)', lineHeight: 1.25 }}>Begin something meaningful.</div>
          <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6, maxWidth: 290 }}>Kairo guides you one question at a time, building calm, steady progress toward UTME.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onSignUp}>Get Started</Button>
        <SkipLinkAlt onClick={onSignIn} />
      </div>
    </div>
  );
}

interface SkipLinkAltProps {
  onClick: () => void;
}

function SkipLinkAlt({ onClick }: SkipLinkAltProps) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'center', fontSize: 14, color: 'var(--text-link)', cursor: 'pointer', fontWeight: 500,
      background: 'none', border: 'none', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
    }}>I already have an account</button>
  );
}
