function PracticeQuestion({ question, index, total, onNext, onExit }) {
  const { BookmarkIcon, ReportIcon, FlagIcon, CalcIcon, OverflowIcon, KaiPanel, ConfidenceRating, Toast, Modal, OverflowMenu, MiniCalculator } = window.KairoLearningUI;
  const { ProgressBar, AnswerFeedback, Button, IconButton } = window.KairoDesignSystem_1c2e7f;
  const [selected, setSelected] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [confidence, setConfidence] = React.useState(null);
  const [reported, setReported] = React.useState(false);
  const [flagged, setFlagged] = React.useState(false);
  const [hideElim, setHideElim] = React.useState(false);
  const [showOverflow, setShowOverflow] = React.useState(false);
  const [showCalc, setShowCalc] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState(null);

  function submit() { setSubmitted(true); }
  function flashToast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2200); }
  function report() { setReported(true); flashToast("Thanks — we'll take a look at this question."); }
  function toggleFlag() { setFlagged((f) => !f); flashToast(!flagged ? 'Flagged for review.' : 'Flag removed.'); }
  function sendFeedback() { flashToast('Feedback sent — thanks for helping Kai improve.'); }

  const isCorrect = selected === question.correct;

  const overflowItems = [
    { label: flagged ? 'Unflag question' : 'Flag question', icon: <FlagIcon filled={flagged} />, onClick: toggleFlag },
    { label: 'Report question', icon: <ReportIcon />, onClick: report, tone: 'danger' },
    { label: hideElim ? 'Show elimination marks' : 'Hide elimination marks', icon: <CloseIconSmall />, onClick: () => setHideElim((h) => !h) },
    { label: 'Question feedback', icon: <FeedbackIconSmall />, onClick: sendFeedback },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative' }}>
      {toastMsg && <Toast>{toastMsg}</Toast>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 8px' }}>
        <IconButton onClick={onExit}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></IconButton>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Question {index + 1} of {total}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton active={bookmarked} onClick={() => setBookmarked(!bookmarked)}><BookmarkIcon filled={bookmarked} /></IconButton>
          <IconButton onClick={() => setShowCalc(true)}><CalcIcon /></IconButton>
          <IconButton onClick={() => setShowOverflow(true)}><OverflowIcon /></IconButton>
        </div>
      </div>
      {showOverflow && <OverflowMenu items={overflowItems} onClose={() => setShowOverflow(false)} />}
      {showCalc && (
        <Modal onClose={() => setShowCalc(false)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', marginBottom: 14 }}>Calculator</div>
          <MiniCalculator />
        </Modal>
      )}
      <div style={{ padding: '0 20px' }}><ProgressBar value={index + 1} max={total} /></div>

      <div style={{ padding: '22px 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{question.subject} · {question.topic}</div>
        <div style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--text-body)', marginTop: 16, fontWeight: 500 }}>{question.stem}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && i === question.correct;
            const showWrongPick = submitted && isSelected && i !== question.correct;
            let border = 'var(--color-border-subtle)', bg = '#fff';
            if (!submitted && isSelected) { border = 'var(--kairo-navy-900)'; bg = 'var(--kairo-blue-100)'; }
            if (showCorrect) { border = 'var(--state-success)'; bg = 'var(--state-success-bg)'; }
            if (showWrongPick && !hideElim) { border = 'var(--state-danger)'; bg = 'var(--state-danger-bg)'; }
            return (
              <button key={i} disabled={submitted} onClick={() => setSelected(i)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`,
                background: bg, color: 'var(--text-body)', fontSize: 15, cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', gap: 10, alignItems: 'center', transition: 'background var(--dur-base), border-color var(--dur-base)',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${isSelected || showCorrect ? border : 'var(--kairo-ink-300)'}`,
                  background: (isSelected && !submitted) ? 'var(--kairo-navy-900)' : showCorrect ? 'var(--state-success)' : showWrongPick ? 'var(--state-danger)' : 'transparent',
                  color: ((isSelected && !submitted) || showCorrect || showWrongPick) ? '#fff' : 'var(--text-muted)',
                }}>{showCorrect ? '\u2713' : (showWrongPick && !hideElim) ? '\u2715' : String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <AnswerFeedback correct={isCorrect} title={isCorrect ? "That's correct" : `Correct answer: ${String.fromCharCode(65 + question.correct)}`} detail={question.why} />

            <ExplanationBlock question={question} />

            <KaiPanel note={question.kai} />

            <ConfidenceRating value={confidence} onChange={setConfidence} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px 24px' }}>
        {!submitted ? (
          <Button variant="primary" size="lg" fullWidth disabled={selected === null} onClick={submit}>Submit Answer</Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => onNext({ correct: isCorrect, confidence })}>{index + 1 === total ? 'Finish Session' : 'Next Question'}</Button>
        )}
      </div>
    </div>
  );
}

function CloseIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h10" /></svg>;
}
function FeedbackIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
}

function ExplanationBlock({ question }) {
  const rows = [
    { label: 'Common mistake', body: question.mistake },
    { label: 'Key concept', body: question.concept },
    { label: 'Exam tip', body: question.tip },
  ];
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>Why this matters</div>
      {rows.map((r) => (
        <div key={r.label}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{r.label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.55, marginTop: 4 }}>{r.body}</div>
        </div>
      ))}
    </div>
  );
}

window.KairoLearningUI = { ...window.KairoLearningUI, PracticeQuestion };
