import type { CSSProperties, ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'gold' | 'success' | 'danger' | 'navy' | 'darkNeutral';
}

const tones: Record<string, CSSProperties> = {
  neutral: { background: 'var(--kairo-blue-100)', color: 'var(--kairo-navy-900)' },
  gold: { background: 'var(--accent-gold-bg)', color: 'var(--kairo-gold-600)' },
  success: { background: 'var(--state-success-bg)', color: 'var(--state-success)' },
  danger: { background: 'var(--state-danger-bg)', color: 'var(--state-danger)' },
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
