import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';

export interface CardProps {
  children: ReactNode;
  padding?: number;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, padding = 20, style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e as unknown as Parameters<typeof onClick>[0]); } } : undefined}
      style={{
        background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
        padding, fontFamily: 'var(--font-body)',
        ...(onClick ? { outlineOffset: 2 } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
