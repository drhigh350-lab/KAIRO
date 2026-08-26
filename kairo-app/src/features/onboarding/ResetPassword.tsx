import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../components';
import { KaiMark } from './shared';
import { getSupabase } from '../../lib/supabaseClient';
import { confirmPasswordReset, describeError } from '../../lib/kairoEngine';

/**
 * Batch 4 (pre-launch bug fix) — the other half of "Forgot password?"
 * (SignIn.tsx calls requestPasswordReset() to send this link). Supabase's
 * client already parses the recovery token out of the URL and activates a
 * real session before this ever mounts (detectSessionInUrl is on by
 * default), so this only needs to confirm that session exists, then let
 * the student actually set a new password — without it, the reset email
 * had nowhere for its link to go.
 */
export function ResetPasswordCallback() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSupabase().auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (!data.session) setInvalid(true);
      setReady(true);
    }).catch(() => {
      if (!cancelled) { setInvalid(true); setReady(true); }
    });
    return () => { cancelled = true; };
  }, []);

  const passwordValid = password.length >= 8 && /\d/.test(password);
  const canSubmit = passwordValid && password === confirm && !submitting;

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await confirmPasswordReset(password);
      setDone(true);
      // OnboardingFlow's own boot check (restoreSession() + isOnboarded())
      // takes it from here — straight home for an already-onboarded
      // student, or the normal landing flow otherwise.
      setTimeout(() => navigate('/onboarding', { replace: true }), 1400);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <KaiMark size={44} tone="white" />
      </div>
    );
  }

  if (invalid) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>This reset link is invalid or has expired.</div>
        <button type="button" onClick={() => navigate('/onboarding', { replace: true })} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Sign In</button>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <KaiMark size={48} tone="white" check />
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)' }}>Password updated</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Taking you in…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <KaiMark size={56} tone="white" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Set a new password</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 6 }}>This also migrates a legacy TechMed/RoboMed account into Kairo.</div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Input tone="dark" label="New Password" type="password" passwordToggle placeholder="Create a new password" value={password} onChange={(e) => setPassword(e.target.value)} error={error || undefined} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
          {!error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--dark-accent-blue)" stroke="none"><path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5z" /></svg>
              At least 8 characters with a number
            </div>
          )}
        </div>
        <Input tone="dark" label="Confirm Password" type="password" passwordToggle placeholder="Re-enter your new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={confirm && password !== confirm ? "Passwords don't match" : undefined} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
        <Button variant="darkAccent" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>{submitting ? 'Updating…' : 'Update Password'}</Button>
      </div>
    </div>
  );
}
