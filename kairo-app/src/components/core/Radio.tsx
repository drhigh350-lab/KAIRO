export interface RadioProps {
  checked: boolean;
  onChange?: () => void;
  label?: string;
}

export function Radio({ checked, onChange, label }: RadioProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-body)' }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${checked ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`,
      }}>
        {checked && <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--kairo-navy-900)' }} />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  );
}
