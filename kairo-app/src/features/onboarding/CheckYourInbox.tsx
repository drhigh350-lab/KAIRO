import { useState } from 'react';
import { KaiMark } from './shared';
import { InlineToast } from '../learning/shared';
import { resendSignUpConfirmation, describeError } from '../../lib/kairoEngine';

export interface CheckYourInboxProps {
  email: string;
  onReturnToLogin: () => void;
}

/**
 * Lands here instead of the dashboard whenever signUpAndConnect() reports
 * `needsEmailVerification` — Supabase's "Confirm email" is active, so the
 * account exists but has no session until the student clicks the link
 * just sent to their inbox. There's nothing else for this screen to wait
 * on: no polling, no auto-advance — the confirmation link itself lands on
 * /onboarding, where the boot check (restoreSession() + isOnboarded())
 * picks things up from there.
 */
export function CheckYourInbox({ email, onReturnToLogin }: CheckYourInboxProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    setError('');
    setResending(true);
    try {
      await resendSignUpConfirmation(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)',
    }}>
      {resent && <InlineToast tone="caution">Confirmation link resent — check your inbox.</InlineToast>}
      {error && <InlineToast tone="danger">{error}</InlineToast>}
      <KaiMark size={56} tone="white" />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Check your inbox</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>
          We sent a confirmation link to <strong style={{ color: 'var(--dark-text-heading)' }}>{email}</strong>. Click it to activate your account — this screen won't move on its own.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{
            background: 'none', border: 'none', color: 'var(--kairo-gold-500)', fontSize: 14, fontWeight: 700,
            cursor: resending ? 'default' : 'pointer', minHeight: 'var(--touch-min)', opacity: resending ? 0.6 : 1,
          }}
        >
          {resending ? 'Resending…' : 'Resend Link'}
        </button>
        <button
          type="button"
          onClick={onReturnToLogin}
          style={{ background: 'none', border: 'none', color: 'var(--dark-text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
