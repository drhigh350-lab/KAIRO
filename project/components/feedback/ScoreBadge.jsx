import React from 'react';

export function ScoreBadge({ score, delta }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontFamily: 'var(--font-body)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'var(--kairo-navy-900)' }}>{score}</span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>KAIRO Score</span>
      </div>
      {delta != null && (
        <span style={{ fontSize: 'var(--fs-caption)', color: delta >= 0 ? 'var(--state-success)' : 'var(--state-danger)', fontWeight: 600 }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}
        </span>
      )}
    </div>
  );
}
