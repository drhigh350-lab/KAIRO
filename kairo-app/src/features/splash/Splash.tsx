import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoMark, KairoWordmark } from '../../components';
import { restoreSession } from '../../lib/kairoEngine';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));
    Promise.all([minDelay, restoreSession().catch(() => false)]).then(([, restored]) => {
      if (cancelled) return;
      navigate(restored ? '/home' : '/onboarding', { replace: true });
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
        background: 'var(--kairo-navy-900)',
        cursor: 'pointer',
      }}
    >
      <KairoMark tone="white" size={56} />
      <KairoWordmark tone="white" width={148} />
    </div>
  );
}
