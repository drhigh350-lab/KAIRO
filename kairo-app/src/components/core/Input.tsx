import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  icon?: ReactNode;
  type?: string;
  error?: string;
}

export function Input({ label, placeholder, icon, type = 'text', error, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ fontFamily: 'var(--font-body)', width: '100%' }}>
      {label && <div style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 8 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', height: 'var(--touch-min)',
        borderRadius: 'var(--radius-md)', background: '#fff',
        border: `1.5px solid ${error ? 'var(--state-danger)' : focused ? 'var(--kairo-blue-700)' : 'var(--color-border-subtle)'}`,
        boxShadow: focused ? 'var(--focus-ring)' : 'none', transition: 'border var(--dur-fast), box-shadow var(--dur-fast)',
      }}>
        {icon && <span style={{ color: 'var(--kairo-blue-700)', display: 'flex' }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'inherit', color: 'var(--text-body)', background: 'transparent' }}
          {...rest}
        />
      </div>
      {error && <div style={{ color: 'var(--state-danger)', fontSize: 'var(--fs-caption)', marginTop: 6 }}>{error}</div>}
    </div>
  );
}
