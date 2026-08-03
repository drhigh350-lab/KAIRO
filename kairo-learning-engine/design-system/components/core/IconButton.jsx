import React from 'react';

export function IconButton({ children, variant = 'ghost', size = 44, active = false, onClick, ...rest }) {
  const bg = active ? 'var(--kairo-blue-100)' : variant === 'filled' ? 'var(--kairo-navy-900)' : 'transparent';
  const color = variant === 'filled' ? '#fff' : 'var(--kairo-navy-900)';
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)',
        borderRadius: '50%', border: 'none', background: bg, color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard)',
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
