import { useState } from 'react';
import { Input, Button } from '../../components';
import { KaiMark, OrDivider, GoogleButton } from './shared';
import { signInAndConnect, signInWithGoogle, requestPasswordReset, describeError } from '../../lib/kairoEngine';

export interface SignInProps {
  onBack: () => void;
  onSignedIn: () => void;
  onGoToSignUp: () => void;
  /** Pre-fills the email field — e.g. when arriving here from SignUp after an
   * "already registered" bounce, so the student doesn't have to retype it. */
  initialEmail?: string;
}

export function SignIn({ onBack, onSignedIn, onGoToSignUp, initialEmail }: SignInProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  // Batch 4 (pre-launch bug fix): "Forgot password?" previously pointed
  // nowhere (href="#", no handler) — this drives a real
  // resetPasswordForEmail() call, using whatever email is already typed.
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [resetError, setResetError] = useState('');
  const canSubmit = email.trim() && password.length > 0 && !submitting;

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await signInAndConnect({ email: email.trim(), password });
      onSignedIn();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setResetError('Enter your email above first, then tap Forgot password.');
      return;
    }
    setResetError('');
    setResetState('sending');
    try {
      await requestPasswordReset(email.trim());
      setResetState('sent');
    } catch (err) {
      setResetError(describeError(err));
      setResetState('idle');
    }
  }

  async function handleGoogle() {
    if (googleSubmitting) return;
    setError('');
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // Success navigates the whole browser away to Google — nothing left to do here.
    } catch (err) {
      setError(describeError(err));
      setGoogleSubmitting(false);
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
        <Input tone="dark" label="Password" type="password" passwordToggle placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} error={error || undefined} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          {resetState === 'sent' ? (
            <span style={{ color: 'var(--dark-text-muted)' }}>Reset link sent — check your email.</span>
          ) : (
            <a href="#" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }} style={{ color: 'var(--dark-accent-blue)', fontWeight: 600 }}>
              {resetState === 'sending' ? 'Sending…' : 'Forgot password?'}
            </a>
          )}
        </div>
        {resetError && <div style={{ fontSize: 12.5, color: 'var(--dark-danger)', marginTop: -8 }}>{resetError}</div>}
        <Button variant="darkAccent" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>{submitting ? 'Signing in…' : 'Sign In'}</Button>
        <OrDivider tone="dark" />
        <GoogleButton tone="dark" onClick={handleGoogle}>{googleSubmitting ? 'Connecting…' : 'Continue with Google'}</GoogleButton>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 'auto' }}>
        New to Kairo? <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignUp(); }} style={{ color: 'var(--dark-accent-blue)' }}>Create an account</a>
      </div>
    </div>
  );
}
