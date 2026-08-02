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
}

export function BottomNav({ items, active, onChange }: BottomNavProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#fff',
      borderTop: '1px solid var(--color-border-subtle)', padding: '10px 4px', fontFamily: 'var(--font-body)',
    }}>
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button key={item.key} onClick={() => onChange && onChange(item.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none',
            color: isActive ? 'var(--kairo-navy-900)' : 'var(--text-faint)', cursor: 'pointer', minWidth: 48, minHeight: 48,
            fontWeight: isActive ? 700 : 500,
          }}>
            <span style={{ display: 'flex' }}>{item.icon}</span>
            <span style={{ fontSize: 11 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
