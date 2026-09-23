import { useEffect, useRef } from 'react';
import { KairoStateView, useAsyncState } from '../../components/feedback/AsyncState';
import { useNavigate } from 'react-router-dom';
import { KaiMark } from './shared';
import { connectGoogleAccount, describeError } from '../../lib/kairoEngine';
import { claimStoredGuestSession } from '../../lib/challengesApi';

/** Lands here after the Google OAuth redirect completes — routes a first-time student into onboarding (pre-filled with their Google name), or a returning one straight home. */
export function GoogleAuthCallback() {
  const navigate = useNavigate();
  const authState = useAsyncState('loading', 7000);
  const requestId = useRef(0);

  async function finishAuth() {
    const currentRequest = ++requestId.current;
    if (!authState.isOnline) {
      authState.setState('offline');
      return;
    }
    authState.start();
    try {
      const { isNewStudent, name } = await connectGoogleAccount();
      await claimStoredGuestSession().catch(() => false);
      if (currentRequest !== requestId.current) return;
      authState.succeed();
      if (isNewStudent) navigate('/onboarding', { replace: true, state: { googleName: name || 'there' } });
      else navigate('/dashboard', { replace: true });
    } catch {
      if (currentRequest === requestId.current) authState.fail();
    }
  }

  useEffect(() => {
    void finishAuth();
    return () => { requestId.current += 1; };
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <KaiMark size={48} tone="white" />
      {authState.state !== 'success' && <KairoStateView state={authState.state === 'idle' ? 'loading' : authState.state} loadingMessage="Finishing sign-in…" slowMessage="Sign-in is taking longer than usual." errorMessage="We couldn’t finish sign-in right now." offlineMessage="You’re offline. Reconnect to finish signing in." onRetry={() => void finishAuth()} onContinueOffline={() => navigate('/login', { replace: true })} />}
      {authState.state === 'error' && <button type="button" onClick={() => navigate('/login', { replace: true })} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Sign In</button>}
    </div>
  );
}
