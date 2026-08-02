import React from 'react';

export function ProgressBar({ value, max = 100, tone = 'blue', height = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === 'gold' ? 'var(--kairo-gold-500)' : tone === 'light' ? '#fff' : 'var(--kairo-blue-500)';
  const track = tone === 'light' ? 'rgba(255,255,255,0.25)' : 'var(--kairo-blue-100)';
  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--radius-pill)', background: track, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-pill)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
    </div>
  );
}
