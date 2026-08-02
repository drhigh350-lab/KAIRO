import React from 'react';

const sizes = {
  sm: { padding: '10px 18px', fontSize: 'var(--fs-body-sm)' },
  md: { padding: '14px 24px', fontSize: 'var(--fs-body)' },
  lg: { padding: '16px 28px', fontSize: 'var(--fs-body-lg)' },
};

const variantStyle = (variant, disabled) => {
  if (disabled) {
    return { background: 'var(--kairo-ink-100)', color: 'var(--text-faint)', border: 'none' };
  }
  switch (variant) {
    case 'secondary':
      return { background: 'var(--color-bg-surface)', color: 'var(--kairo-navy-900)', border: '1.5px solid var(--kairo-navy-900)' };
    case 'ghost':
      return { background: 'transparent', color: 'var(--kairo-blue-700)', border: 'none' };
    case 'gold':
      return { background: 'var(--kairo-gold-500)', color: 'var(--kairo-navy-900)', border: 'none' };
    default:
      return { background: 'var(--kairo-navy-900)', color: '#fff', border: 'none' };
  }
};

export function Button({ children, variant = 'primary', size = 'md', disabled = false, icon, fullWidth = false, onClick, ...rest }) {
  const vs = variantStyle(variant, disabled);
  const sz = sizes[size] || sizes.md;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 'var(--touch-min)',
        width: fullWidth ? '100%' : 'auto', transition: 'background var(--dur-fast) var(--ease-standard), opacity var(--dur-fast)',
        ...sz, ...vs,
      }}
      onMouseOver={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--kairo-navy-800)'; }}
      onMouseOut={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--kairo-navy-900)'; }}
      {...rest}
    >
      {children}
      {icon}
    </button>
  );
}
