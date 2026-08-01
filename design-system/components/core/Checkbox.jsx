import React from 'react';

export function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-body)' }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${checked ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`,
        background: checked ? 'var(--kairo-navy-900)' : 'transparent', transition: 'all var(--dur-fast)',
      }}>
        {checked && <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5L4.5 8.5L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  );
}
