function buildExamQuestions() {
  const { cbtSubjects, cbtQuestions } = window.KairoLearningData;
  const all = [];
  cbtSubjects.forEach((subj) => { (cbtQuestions[subj] || []).forEach((q) => all.push({ ...q, subject: subj })); });
  return all;
}

function CbtExam({ onSubmit, onExit }) {
  const { CalcIcon, FlagIcon, Toast, Modal } = window.KairoLearningUI;
  const { Button, IconButton } = window.KairoDesignSystem_1c2e7f;
  const questions = React.useMemo(buildExamQuestions, []);
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [flagged, setFlagged] = React.useState({});
  const [showPalette, setShowPalette] = React.useState(false);
  const [showCalc, setShowCalc] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(20 * 60);
  const [warned, setWarned] = React.useState(false);

  React.useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    if (secondsLeft === 300 && !warned) setWarned(true);
    if (secondsLeft === 0) { onSubmit(answers, questions); }
  }, [secondsLeft]);

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const subjectStart = questions.findIndex((qq) => qq.subject === q.subject);
  const subjectQs = questions.map((qq, i) => ({ ...qq, i })).filter((qq) => qq.subject === q.subject);

  function selectOption(i) { setAnswers((a) => ({ ...a, [current]: i })); }
  function toggleFlag() { setFlagged((f) => ({ ...f, [current]: !f[current] })); }
  function jumpTo(i) { setCurrent(i); setShowPalette(false); }

  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60;
  const timeLow = secondsLeft <= 300;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--color-bg-canvas)' }}>
      {warned && secondsLeft > 295 && <Toast tone="caution">5 minutes remaining — review flagged questions if you can.</Toast>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px' }}>
        <IconButton onClick={onExit}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></IconButton>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{q.subject}</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: timeLow ? 'var(--state-danger)' : 'var(--text-heading)' }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton onClick={() => setShowCalc(true)}><CalcIcon /></IconButton>
          <IconButton onClick={() => setShowPalette(true)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg></IconButton>
        </div>
      </div>

      <div style={{ padding: '4px 18px 18px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Question {q.i !== undefined ? q.i + 1 : current + 1} of {questions.length}</div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--text-body)', marginTop: 12, fontWeight: 500 }}>{q.stem}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {q.options.map((opt, i) => {
            const isSelected = answers[current] === i;
            return (
              <button key={i} onClick={() => selectOption(i)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${isSelected ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: isSelected ? 'var(--kairo-blue-100)' : '#fff',
                color: 'var(--text-body)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${isSelected ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, background: isSelected ? 'var(--kairo-navy-900)' : 'transparent', color: isSelected ? '#fff' : 'var(--text-muted)' }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '10px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: flagged[current] ? 'var(--kairo-gold-600)' : 'var(--text-muted)', cursor: 'pointer' }}>
          <FlagIcon filled={!!flagged[current]} /> {flagged[current] ? 'Flagged for review' : 'Flag this question'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="lg" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))} style={{ flex: 1 }}>Previous</Button>
          {current + 1 === questions.length ? (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onClick={() => setShowConfirm(true)}>Submit</Button>
          ) : (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>Next</Button>
          )}
        </div>
      </div>

      {showPalette && (
        <Modal onClose={() => setShowPalette(false)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', marginBottom: 4 }}>Question Palette</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{answeredCount} of {questions.length} answered</div>
          {window.KairoLearningData.cbtSubjects.map((subj) => (
            <div key={subj} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>{subj}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {questions.map((qq, i) => {
                  if (qq.subject !== subj) return null;
                  const isAnswered = answers[i] !== undefined;
                  const isFlagged = flagged[i];
                  const isCurrent = i === current;
                  let bg = '#fff', color = 'var(--text-body)', border = 'var(--color-border-subtle)';
                  if (isAnswered) { bg = 'var(--kairo-blue-100)'; color = 'var(--kairo-navy-900)'; border = 'var(--kairo-blue-500)'; }
                  if (isFlagged) { bg = 'var(--accent-gold-bg)'; color = 'var(--kairo-gold-600)'; border = 'var(--kairo-gold-500)'; }
                  if (isCurrent) { border = 'var(--kairo-navy-900)'; }
                  return (
                    <div key={i} onClick={() => jumpTo(i)} style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${border}`, background: bg, color, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>{i + 1}</div>
                  );
                })}
              </div>
            </div>
          ))}
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowConfirm(true)}>Submit Exam</Button>
        </Modal>
      )}

      {showCalc && (
        <Modal onClose={() => setShowCalc(false)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', marginBottom: 14 }}>Calculator</div>
          <Calculator />
        </Modal>
      )}

      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text-heading)' }}>Submit exam?</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
            You've answered {answeredCount} of {questions.length} questions. Once submitted, you can't make changes.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>Keep Reviewing</Button>
            <Button variant="primary" size="lg" style={{ flex: 1 }} onClick={() => onSubmit(answers, questions)}>Submit</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Calculator() {
  const [expr, setExpr] = React.useState('');
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '\u2212', '0', '.', '=', '+'];
  function press(k) {
    if (k === '=') { try { setExpr(String(Function('return ' + expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\u2212/g, '-'))())); } catch (e) { setExpr('Error'); } }
    else setExpr((e) => e + k);
  }
  return (
    <div>
      <div style={{ background: 'var(--kairo-blue-100)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right', marginBottom: 14, minHeight: 32, overflowX: 'auto' }}>{expr || '0'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)} style={{ padding: '16px 0', borderRadius: 'var(--radius-md)', border: 'none', background: '#fff', boxShadow: 'var(--shadow-xs)', fontSize: 17, fontWeight: 600, color: 'var(--text-heading)', cursor: 'pointer' }}>{k}</button>
        ))}
      </div>
      <button onClick={() => setExpr('')} style={{ marginTop: 10, width: '100%', padding: '12px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', background: 'transparent', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>Clear</button>
    </div>
  );
}

window.KairoLearningUI = { ...window.KairoLearningUI, CbtExam, buildExamQuestions };
