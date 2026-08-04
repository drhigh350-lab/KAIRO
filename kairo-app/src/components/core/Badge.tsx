import type { CSSProperties, ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'gold' | 'success' | 'danger' | 'navy' | 'darkNeutral';
}

const tones: Record<string, CSSProperties> = {
  neutral: { background: 'var(--kairo-blue-100)', color: 'var(--kairo-navy-900)' },
  gold: { background: 'rgba(240,177,42,0.14)', color: 'var(--kairo-gold-500)' },
  success: { background: 'var(--dark-success-bg)', color: 'var(--dark-success)' },
  danger: { background: 'var(--dark-danger-bg)', color: 'var(--dark-danger)' },
  navy: { background: 'var(--kairo-navy-900)', color: '#fff' },
  darkNeutral: { background: 'var(--dark-bg-elevated)', color: 'var(--dark-accent-blue)' },
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', fontWeight: 600, ...t,
    }}>
      {children}
    </span>
  );
}
