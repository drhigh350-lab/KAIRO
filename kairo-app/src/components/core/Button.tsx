import type { CSSProperties, ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const sizes: Record<string, CSSProperties> = {
  sm: { padding: '10px 18px', fontSize: 'var(--fs-body-sm)' },
  md: { padding: '14px 24px', fontSize: 'var(--fs-body)' },
  lg: { padding: '16px 28px', fontSize: 'var(--fs-body-lg)' },
};

function variantStyle(variant: string, disabled: boolean): CSSProperties {
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
}

export function Button({ children, variant = 'primary', size = 'md', disabled = false, icon, fullWidth = false, onClick, type = 'button' }: ButtonProps) {
  const vs = variantStyle(variant, disabled);
  const sz = sizes[size] || sizes.md;
  return (
    <button
      type={type}
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
    >
      {children}
      {icon}
    </button>
  );
}
