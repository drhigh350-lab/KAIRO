export interface StreakBadgeProps {
  days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-pill)',
      background: 'var(--accent-gold-bg)', color: 'var(--kairo-gold-600)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--fs-body-sm)',
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-3 5-3 9a3 3 0 006 0c0-1-.5-2-1-2 1 3-1 4-2 4a2 2 0 01-2-2c0-3 3-4 2-9z"/></svg>
      {days} day streak
    </span>
  );
}
