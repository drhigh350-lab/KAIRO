import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KaiMark } from './shared';
import { connectGoogleAccount, describeError } from '../../lib/kairoEngine';

/** Lands here after the Google OAuth redirect completes — routes a first-time student into onboarding (pre-filled with their Google name), or a returning one straight home. */
export function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectGoogleAccount()
      .then(({ isNewStudent, name }) => {
        if (isNewStudent) {
          navigate('/onboarding', { replace: true, state: { googleName: name || 'there' } });
        } else {
          navigate('/home', { replace: true });
        }
      })
      .catch((err) => setError(describeError(err)));
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <KaiMark size={48} tone="white" />
      {error ? (
        <>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>{error}</div>
          <button type="button" onClick={() => navigate('/onboarding', { replace: true })} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Sign In</button>
        </>
      ) : (
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Finishing sign-in…</div>
      )}
    </div>
  );
}
