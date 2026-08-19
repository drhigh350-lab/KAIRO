import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  icon?: ReactNode;
  type?: string;
  error?: string;
  tone?: 'light' | 'dark';
  /** Adds a show/hide toggle button on the right. Only takes effect when type="password". */
  passwordToggle?: boolean;
  /** Adds an inline 'X' clear button on the right, shown only while `value` is non-empty. Mutually exclusive with passwordToggle in practice — no field needs both. */
  onClear?: () => void;
}

function EyeIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function EyeOffIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0112 5c7 0 10.5 7 10.5 7a13.2 13.2 0 01-3.1 3.9M6.6 6.6C3.6 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 004.4-.9" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>;
}
function ClearIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}

export function Input({ label, placeholder, icon, type = 'text', error, tone = 'light', passwordToggle = false, onClear, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const dark = tone === 'dark';
  const isPasswordToggle = passwordToggle && type === 'password';
  const resolvedType = isPasswordToggle && revealed ? 'text' : type;
  const showClear = !!onClear && typeof rest.value === 'string' && rest.value.length > 0;
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
          type={resolvedType}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={dark ? 'input-dark' : undefined}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'inherit', color: dark ? 'var(--dark-text-heading)' : 'var(--text-body)', background: 'transparent' }}
          {...rest}
        />
        {isPasswordToggle && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexShrink: 0, color: dark ? 'var(--dark-text-muted)' : 'var(--text-muted)' }}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear"
            style={{
              width: 20, height: 20, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: dark ? 'var(--dark-bg-elevated)' : 'var(--color-border-subtle)', border: 'none', padding: 0, cursor: 'pointer',
              color: dark ? 'var(--dark-text-muted)' : 'var(--text-muted)',
            }}
          >
            <ClearIcon />
          </button>
        )}
      </div>
      {error && <div style={{ color: 'var(--state-danger)', fontSize: 'var(--fs-caption)', marginTop: 6 }}>{error}</div>}
    </div>
  );
}
