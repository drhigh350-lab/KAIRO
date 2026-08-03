export interface AnswerFeedbackProps {
  correct: boolean;
  title: string;
  detail?: string;
  dark?: boolean;
}

export function AnswerFeedback({ correct, title, detail, dark = false }: AnswerFeedbackProps) {
  const tone = correct
    ? { border: dark ? 'var(--dark-success)' : 'var(--state-success)', bg: dark ? 'var(--dark-success-bg)' : 'var(--state-success-bg)', color: dark ? 'var(--dark-success)' : 'var(--state-success)' }
    : { border: dark ? 'var(--dark-danger)' : 'var(--state-danger)', bg: dark ? 'var(--dark-danger-bg)' : 'var(--state-danger-bg)', color: dark ? 'var(--dark-danger)' : 'var(--state-danger)' };
  return (
    <div style={{
      borderLeft: `4px solid ${tone.border}`, background: tone.bg, borderRadius: 'var(--radius-md)',
      padding: '14px 16px', fontFamily: 'var(--font-body)', display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ color: tone.color, fontSize: 20, lineHeight: 1 }}>{correct ? '✓' : '✕'}</span>
      <div>
        <div style={{ fontWeight: 700, color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)', fontSize: 'var(--fs-body)' }}>{title}</div>
        {detail && <div style={{ fontSize: 'var(--fs-body-sm)', color: dark ? 'var(--dark-text-muted)' : 'var(--text-muted)', marginTop: 4 }}>{detail}</div>}
      </div>
    </div>
  );
}
