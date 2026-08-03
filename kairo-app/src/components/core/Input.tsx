import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  icon?: ReactNode;
  type?: string;
  error?: string;
  tone?: 'light' | 'dark';
}

export function Input({ label, placeholder, icon, type = 'text', error, tone = 'light', ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const dark = tone === 'dark';
  return (
    <div style={{ fontFamily: 'var(--font-body)', width: '100%' }}>
      {label && <div style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)', marginBottom: 8 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', height: 'var(--touch-min)',
        borderRadius: 'var(--radius-md)', background: dark ? 'var(--dark-bg-surface)' : '#fff',
        border: `1.5px solid ${error ? 'var(--state-danger)' : focused ? (dark ? 'var(--dark-accent-blue)' : 'var(--kairo-blue-700)') : (dark ? 'var(--dark-border)' : 'var(--color-border-subtle)')}`,
        boxShadow: focused ? (dark ? '0 0 0 3px var(--dark-accent-blue-glow)' : 'var(--focus-ring)') : 'none', transition: 'border var(--dur-fast), box-shadow var(--dur-fast)',
      }}>
        {icon && <span style={{ color: dark ? 'var(--dark-text-muted)' : 'var(--kairo-blue-700)', display: 'flex' }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={dark ? 'input-dark' : undefined}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'inherit', color: dark ? 'var(--dark-text-heading)' : 'var(--text-body)', background: 'transparent' }}
          {...rest}
        />
      </div>
      {error && <div style={{ color: 'var(--state-danger)', fontSize: 'var(--fs-caption)', marginTop: 6 }}>{error}</div>}
    </div>
  );
}
