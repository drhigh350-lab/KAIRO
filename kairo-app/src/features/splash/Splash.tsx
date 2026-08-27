import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoWordmark } from '../../components';
import { restoreSession, isOnboarded } from '../../lib/kairoEngine';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));
    Promise.all([minDelay, restoreSession().catch(() => false)]).then(([, restored]) => {
      if (cancelled) return;
      // A restored session only means "authenticated" — a student who
      // signed up but never finished onboarding (no targetSubjects/
      // examDate/targetCourse set yet) restores successfully too, and
      // previously landed straight on a blank Home instead of picking
      // back up where they left off.
      navigate(restored && isOnboarded() ? '/home' : '/onboarding', { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div
      onClick={() => navigate('/onboarding', { replace: true })}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'var(--dark-bg-canvas)',
        cursor: 'pointer',
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
