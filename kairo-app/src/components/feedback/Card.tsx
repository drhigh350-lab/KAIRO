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
      style={{
        background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
        padding, fontFamily: 'var(--font-body)', ...style,
      }}
    >
      {children}
    </div>
  );
}
