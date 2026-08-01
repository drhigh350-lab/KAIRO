import React from 'react';

export function Card({ children, padding = 20, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
      padding, fontFamily: 'var(--font-body)', ...style,
    }}>
      {children}
    </div>
  );
}
