import { useState } from 'react';
import { Input, Button } from '../../components';
import { FlowHeader, OrDivider, GoogleButton } from './shared';
import { InlineToast } from '../learning/shared';
import { signUpAndConnect, signInWithGoogle, describeError } from '../../lib/kairoEngine';

export interface SignUpProps {
  step: number;
  total: number;
  onBack: () => void;
  onEmailSignUp: (data: { name: string; email: string }) => void;
  onNeedsEmailVerification: (email: string) => void;
  onGoToSignIn: (email?: string) => void;
}

/** Supabase Auth is one shared user pool across every product on this project (RoboMed/TechMed's
 * `public.*` schema and Kairo's `kairo.*` schema both sit on the same auth.users) — so a student
 * with an existing TechMed/RoboMed login hits this on their very first Kairo sign-up, for an
 * account they don't think of as a "Kairo account" at all. Detected by Supabase's own stable
 * error_code rather than sniffing the message text, which is more likely to drift. */
function isAlreadyRegistered(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'user_already_exists') return true;
  return /already registered|already exists/i.test(describeError(err));
}

export function SignUp({ step, total, onBack, onEmailSignUp, onNeedsEmailVerification, onGoToSignIn }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  // Batch 4 (pre-launch bug fix): a highly-visible toast, not just the
  // inline field error below, so a legacy TechMed/RoboMed account hitting
  // this on their first Kairo sign-up understands *why* — this is the
  // "migrate to Kairo" moment, not a generic "account exists" dead end.
  const [showMigrateToast, setShowMigrateToast] = useState(false);
  const passwordValid = password.length >= 8 && /\d/.test(password);
  const canSubmit = name.trim() && email.trim() && passwordValid && !submitting;

  async function handleSubmit() {
    setError('');
    setAlreadyRegistered(false);
    setSubmitting(true);
    try {
      const result = await signUpAndConnect({ name: name.trim(), email: email.trim(), password });
      if (result && typeof result === 'object' && 'needsEmailVerification' in result) {
        onNeedsEmailVerification(result.email);
      } else {
        onEmailSignUp({ name: name.trim(), email: email.trim() });
      }
    } catch (err) {
      if (isAlreadyRegistered(err)) {
        // This is expected and recoverable, not a dead end — say so plainly, with the one
        // action that actually gets them in (this is exactly what "it says I already have an
        // account" reports turned out to be: a real TechMed/RoboMed login, not a bug).
        setAlreadyRegistered(true);
        setError('An account already exists for this email — sign in with your existing TechMed/RoboMed password instead.');
        setShowMigrateToast(true);
        setTimeout(() => setShowMigrateToast(false), 4000);
      } else {
        setError(describeError(err));
      }
    } finally {
      setSubmitting(false);
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
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, flex: 1, background: 'var(--dark-bg-canvas)', position: 'relative' }}>
      {showMigrateToast && <InlineToast tone="caution">Account exists. Please reset your password to migrate to Kairo.</InlineToast>}
      <FlowHeader onBack={onBack} step={step} total={total} tone="dark" />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--dark-text-heading)' }}>Create your account</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 6 }}>Let's get you started on your journey to success.</div>
      </div>
      <GoogleButton tone="dark" onClick={handleGoogle}>{googleSubmitting ? 'Connecting…' : 'Continue with Google'}</GoogleButton>
      <OrDivider tone="dark" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input tone="dark" label="Full Name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>} />
        <Input tone="dark" label="Email Address" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM4 6l8 7 8-7" /></svg>} />
        <div>
          <Input tone="dark" label="Password" type="password" passwordToggle placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} error={error || undefined} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
          {!error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--dark-accent-blue)" stroke="none"><path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5z" /></svg>
              At least 8 characters with a number
            </div>
          )}
        </div>
      </div>
      {alreadyRegistered ? (
        <Button variant="darkAccent" size="lg" fullWidth onClick={() => onGoToSignIn(email.trim())}>Sign In Instead</Button>
      ) : (
        <Button variant="darkAccent" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>{submitting ? 'Creating account…' : 'Get Started'}</Button>
      )}
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 'auto' }}>
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignIn(email.trim()); }} style={{ color: 'var(--dark-accent-blue)' }}>Sign In</a>
      </div>
    </div>
  );
}
