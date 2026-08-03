import { useState } from 'react';
import { Input, Button } from '../../components';
import { KaiMark, OrDivider, GoogleButton } from './shared';
import { signInAndConnect } from '../../lib/kairoEngine';

export interface SignInProps {
  onBack: () => void;
  onSignedIn: () => void;
  onGoToSignUp: () => void;
}

export function SignIn({ onBack, onSignedIn, onGoToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = email.trim() && password.length > 0 && !submitting;

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await signInAndConnect({ email: email.trim(), password });
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <button type="button" onClick={onBack} aria-label="Back" style={{
        width: 32, height: 32, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', margin: '-8px',
        display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--dark-text-heading)',
        background: 'none', border: 'none', padding: 0, borderRadius: '50%',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <KaiMark size={56} tone="white" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Welcome back.</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 6 }}>Continue where you left off.</div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input tone="dark" label="Email Address" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM4 6l8 7 8-7" /></svg>} />
        <Input tone="dark" label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} error={error || undefined} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
        <div style={{ textAlign: 'right', fontSize: 13 }}><a href="#" style={{ color: 'var(--dark-accent-blue)' }}>Forgot password?</a></div>
        <Button variant="darkAccent" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>{submitting ? 'Signing in…' : 'Sign In'}</Button>
        <OrDivider tone="dark" />
        <GoogleButton onClick={onSignedIn} />
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 'auto' }}>
        New to Kairo? <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignUp(); }} style={{ color: 'var(--dark-accent-blue)' }}>Create an account</a>
      </div>
    </div>
  );
}
