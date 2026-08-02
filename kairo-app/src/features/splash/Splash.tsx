import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoMark, KairoWordmark } from '../../components';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding', { replace: true }), 1400);
    return () => clearTimeout(timer);
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
