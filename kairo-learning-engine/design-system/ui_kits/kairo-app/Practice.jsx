function Practice({ onFinish, onExit }) {
  const { IconButton, ProgressBar, AnswerFeedback, Button } = window.KairoDesignSystem_1c2e7f;
  const [selected, setSelected] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const correctIndex = 1;
  const options = ['2 m/s²', '3 m/s²', '4 m/s²', '5 m/s²'];

  function submit() { setSubmitted(true); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-canvas)', fontFamily: 'var(--font-body)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 8px' }}>
        <IconButton onClick={onExit}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg></IconButton>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Question 4 of 12</div>
        <IconButton><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></IconButton>
      </div>
      <div style={{ padding: '0 20px' }}><ProgressBar value={4} max={12} /></div>
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', textTransform: 'uppercase' }}>Physics · Mechanics</div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--text-body)', marginTop: 14, fontWeight: 500 }}>
          A body of mass 2kg is acted on by a constant force of 10N. What is its acceleration?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = submitted && i === correctIndex;
            const isWrongPick = submitted && isSelected && i !== correctIndex;
            let border = 'var(--color-border-subtle)';
            let bg = '#fff';
            if (!submitted && isSelected) { border = 'var(--kairo-navy-900)'; bg = 'var(--kairo-blue-100)'; }
            if (isCorrect) { border = 'var(--state-success)'; bg = 'var(--state-success-bg)'; }
            if (isWrongPick) { border = 'var(--state-danger)'; bg = 'var(--state-danger-bg)'; }
            return (
              <button key={i} disabled={submitted} onClick={() => setSelected(i)} style={{
                textAlign: 'left', minHeight: 48, padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${border}`,
                background: bg, color: 'var(--text-body)', fontSize: 15, cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${isSelected || isCorrect ? border : 'var(--kairo-ink-300)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, background: isSelected && !submitted ? 'var(--kairo-navy-900)' : isCorrect ? 'var(--state-success)' : isWrongPick ? 'var(--state-danger)' : 'transparent', color: (isSelected && !submitted) || isCorrect || isWrongPick ? '#fff' : 'var(--text-muted)' }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
        {submitted && (
          <div style={{ marginTop: 20 }}>
            <AnswerFeedback correct={selected === correctIndex} title={selected === correctIndex ? "Nice — that's correct" : 'Not quite'} detail={selected === correctIndex ? 'You correctly applied a = F / m = 10 / 2.' : 'Try dividing force by mass: a = F / m.'} />
          </div>
        )}
      </div>
      <div style={{ padding: '16px 20px 24px' }}>
        {!submitted ? (
          <Button variant="primary" size="lg" fullWidth disabled={selected === null} onClick={submit}>Submit Answer</Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={onFinish}>Next</Button>
        )}
      </div>
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Practice = Practice;
