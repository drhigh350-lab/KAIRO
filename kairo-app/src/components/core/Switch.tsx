export interface SwitchProps {
  checked: boolean;
  onChange?: () => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 46, height: 26, borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
        background: checked ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-100)', position: 'relative', transition: 'background var(--dur-fast)',
        padding: 3, display: 'inline-flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start',
      }}
    >
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'all var(--dur-fast)' }} />
    </button>
  );
}
