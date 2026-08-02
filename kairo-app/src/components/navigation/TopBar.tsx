import type { ReactNode } from 'react';

export interface TopBarProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function TopBar({ title, left, right }: TopBarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px',
      fontFamily: 'var(--font-body)', background: 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 44 }}>{left}</div>
      <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: 'var(--text-heading)' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 44, justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}
