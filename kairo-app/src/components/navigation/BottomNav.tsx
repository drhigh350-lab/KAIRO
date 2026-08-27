import type { ReactNode } from 'react';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  active: string;
  onChange?: (key: string) => void;
  dark?: boolean;
}

export function BottomNav({ items, active, onChange, dark = false }: BottomNavProps) {
  return (
    <div className="app-bottomnav" style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      borderTop: `1px solid ${dark ? 'var(--dark-border)' : 'var(--color-border-subtle)'}`, padding: '10px 4px 10px', fontFamily: 'var(--font-body)',
      background: dark ? 'var(--dark-bg-canvas)' : 'var(--kairo-white)',
    }}>
      <div className="app-bottomnav-inner" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
        {items.map((item) => {
          const isActive = item.key === active;
          const activeColor = dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)';
          const inactiveColor = dark ? 'var(--dark-text-faint)' : 'var(--text-faint)';
          return (
            <button key={item.key} onClick={() => onChange && onChange(item.key)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none',
              color: isActive ? activeColor : inactiveColor, cursor: 'pointer', minWidth: 48, minHeight: 48,
              fontWeight: isActive ? 700 : 500,
            }}>
              <span style={{ display: 'flex' }}>{item.icon}</span>
              <span style={{ fontSize: 11 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
