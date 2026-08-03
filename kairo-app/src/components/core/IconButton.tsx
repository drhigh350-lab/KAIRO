import type { ReactNode } from 'react';

export interface IconButtonProps {
  children: ReactNode;
  variant?: 'ghost' | 'filled';
  size?: number;
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  dark?: boolean;
}

export function IconButton({ children, variant = 'ghost', size = 44, active = false, onClick, ariaLabel, dark = false }: IconButtonProps) {
  const bg = active ? (dark ? 'var(--dark-bg-elevated)' : 'var(--kairo-blue-100)') : variant === 'filled' ? (dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)') : 'transparent';
  const color = variant === 'filled' ? '#fff' : dark ? 'var(--dark-text-heading)' : 'var(--kairo-navy-900)';
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: size, height: size, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)',
        borderRadius: '50%', border: 'none', background: bg, color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard)',
      }}
    >
      {children}
    </button>
  );
}
