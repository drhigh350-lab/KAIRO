import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoWordmark } from '../../components';
import { LandingPage } from '../onboarding/LandingPage';
import { restoreSession, isOnboarded, hasStoredAuthSession } from '../../lib/kairoEngine';

/**
 * The public "/" route. A returning, signed-in student gets the same
 * brief branded moment as before, then lands straight in the app — but a
 * signed-out visitor (including Google's crawler) now sees Kairo's real
 * marketing content directly at this URL instead of a loading spinner
 * that always redirects into /onboarding via JS. That redirect used to be
 * the *only* way to ever reach LandingPage's content at all, which made
 * "/" a dead end for both SEO and a plain, un-authenticated visit.
 */
export function Splash() {
  const navigate = useNavigate();
  // No persisted session means nothing to restore — render the landing page
  // on the very first frame instead of waiting on any auth call.
  const [checking, setChecking] = useState(() => hasStoredAuthSession() || /[?&#](code|access_token)=/.test(window.location.search + window.location.hash));
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!checking) return;
    const timer = setTimeout(() => setSlow(true), 3_000);
    return () => clearTimeout(timer);
  }, [checking]);

  useEffect(() => {
    if (!checking) return;
    let cancelled = false;
    const startedAt = Date.now();
    restoreSession().catch(() => false).then((restored) => {
      if (cancelled) return;
      if (!restored) {
        // Nothing to redirect into — show the real page immediately
        // rather than holding a signed-out visitor (or a crawler) on a
        // branded loading beat that was only ever meaningful pre-redirect.
        setChecking(false);
        return;
      }
      // A restored session only means "authenticated" — a student who
      // signed up but never finished onboarding (no targetSubjects/
      // examDate/targetCourse set yet) restores successfully too, and
      // previously landed straight on a blank Home instead of picking
      // back up where they left off.
      // Keep a tiny branded beat only when restoration was effectively
      // instantaneous. Never add 1.4s after a real network/IndexedDB wait.
      const remainingBrandTime = Math.max(0, 350 - (Date.now() - startedAt));
      const minDelay = new Promise((resolve) => setTimeout(resolve, remainingBrandTime));
      minDelay.then(() => {
        if (!cancelled) navigate(isOnboarded() ? '/dashboard' : '/onboarding', { replace: true });
      });
    });
    return () => {
      cancelled = true;
    };
    // Only the initial check matters; flipping `checking` off cancels navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (!checking) {
    return <LandingPage onGetStarted={() => navigate('/signup')} onSignIn={() => navigate('/login')} />;
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'var(--dark-bg-canvas)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="kairo-splash-mark"><KairoWordmark tone="white" width={260} /></div>
      {/* The wordmark mask is tagline-free (kairo-wordmark-mask.png carries only
          "Kairo") — this is the one place "Seize the Moment" renders, not a
          repeat of anything baked into the logo. */}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 600, color: '#fff', textAlign: 'center', letterSpacing: '.01em' }}>Seize the Moment</div>
      <div className="kairo-loading-dots" style={{ gap: 8, marginTop: 28 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: i === 1 ? 10 : 8, height: i === 1 ? 10 : 8, borderRadius: '50%',
            background: i === 1 ? 'var(--dark-accent-blue)' : 'rgba(46,124,246,0.45)',
          }} />
        ))}
      </div>
      <div aria-live="polite" style={{ minHeight: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {slow && (
          <>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              Slow connection — still signing you in…
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 999, padding: '8px 18px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in manually
            </button>
          </>
        )}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 260, height: 100, borderRadius: '50%', background: 'var(--dark-accent-blue-glow)',
        filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none',
      }} />
    </div>
  );
}
