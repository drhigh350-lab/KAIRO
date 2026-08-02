export interface AnswerFeedbackProps {
  correct: boolean;
  title: string;
  detail?: string;
}

export function AnswerFeedback({ correct, title, detail }: AnswerFeedbackProps) {
  const tone = correct
    ? { border: 'var(--state-success)', bg: 'var(--state-success-bg)', color: 'var(--state-success)' }
    : { border: 'var(--state-danger)', bg: 'var(--state-danger-bg)', color: 'var(--state-danger)' };
  return (
    <div style={{
      borderLeft: `4px solid ${tone.border}`, background: tone.bg, borderRadius: 'var(--radius-md)',
      padding: '14px 16px', fontFamily: 'var(--font-body)', display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ color: tone.color, fontSize: 20, lineHeight: 1 }}>{correct ? '✓' : '✕'}</span>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--fs-body)' }}>{title}</div>
        {detail && <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{detail}</div>}
      </div>
    </div>
  );
}
