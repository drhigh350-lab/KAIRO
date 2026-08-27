import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoWordmark } from '../../components';
import { LandingPage } from '../onboarding/LandingPage';
import { restoreSession, isOnboarded } from '../../lib/kairoEngine';

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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));
      minDelay.then(() => {
        if (!cancelled) navigate(isOnboarded() ? '/dashboard' : '/onboarding', { replace: true });
      });
    });
    return () => {
      cancelled = true;
    };
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
      <KairoWordmark tone="white" width={260} />
      {/* The wordmark mask is tagline-free (kairo-wordmark-mask.png carries only
          "Kairo") — this is the one place "Seize the Moment" renders, not a
          repeat of anything baked into the logo. */}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 600, color: '#fff', textAlign: 'center', letterSpacing: '.01em' }}>Seize the Moment</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: i === 1 ? 10 : 8, height: i === 1 ? 10 : 8, borderRadius: '50%',
            background: i === 1 ? 'var(--dark-accent-blue)' : 'rgba(46,124,246,0.45)',
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 260, height: 100, borderRadius: '50%', background: 'var(--dark-accent-blue-glow)',
        filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none',
      }} />
    </div>
  );
}
