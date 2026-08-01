import React from 'react';

export function Toast({ children, tone = 'default' }) {
  const bg = tone === 'success' ? 'var(--state-success)' : tone === 'danger' ? 'var(--state-danger)' : 'var(--kairo-navy-900)';
  return (
    <div style={{
      background: bg, color: '#fff', padding: '14px 18px', borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', boxShadow: 'var(--shadow-md)',
      display: 'inline-flex', alignItems: 'center', gap: 10, maxWidth: 340,
    }}>
      {children}
    </div>
  );
}
