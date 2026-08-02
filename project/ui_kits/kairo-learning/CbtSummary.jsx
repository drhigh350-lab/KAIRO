function CbtSummary({ answers, questions, onHome, onReview }) {
  const { StatTile } = window.KairoLearningUI;
  const { Card, Button } = window.KairoDesignSystem_1c2e7f;
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const bySubject = {};
  questions.forEach((q, i) => {
    bySubject[q.subject] = bySubject[q.subject] || { correct: 0, total: 0 };
    bySubject[q.subject].total += 1;
    if (answers[i] === q.correct) bySubject[q.subject].correct += 1;
  });
  const subjectEntries = Object.entries(bySubject).map(([s, v]) => ({ subject: s, pct: Math.round((v.correct / v.total) * 100) }));
  const strongest = subjectEntries.slice().sort((a, b) => b.pct - a.pct)[0];
  const weakest = subjectEntries.slice().sort((a, b) => a.pct - b.pct)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '36px 20px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--kairo-blue-100)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z" /></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)', marginTop: 14 }}>Exam Submitted</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Here's how your simulation went.</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex' }}>
            <StatTile label="Answered" value={`${Object.keys(answers).length}/${total}`} />
            <StatTile label="Accuracy" value={`${accuracy}%`} />
            <StatTile label="Avg / question" value="75s" />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', marginBottom: 12 }}>BY SUBJECT</div>
          {subjectEntries.map((s) => (
            <div key={s.subject} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: 'var(--text-body)' }}>{s.subject}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.pct >= 60 ? 'var(--state-success)' : 'var(--state-danger)' }}>{s.pct}%</span>
            </div>
          ))}
        </Card>

        <Card style={{ background: 'var(--kairo-navy-900)', color: '#fff' }}>
          <div style={{ fontSize: 11, color: 'var(--kairo-blue-300)', fontWeight: 700, letterSpacing: '.04em' }}>KAIRO SCORE</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>+{Math.max(6, correctCount * 2)}</div>
          <div style={{ fontSize: 12, color: 'var(--kairo-blue-200)', marginTop: 8 }}>Strongest: {strongest ? strongest.subject : '\u2014'} · Weakest: {weakest ? weakest.subject : '\u2014'}</div>
        </Card>

        <Card style={{ background: 'var(--kairo-blue-100)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', marginBottom: 6 }}>SUGGESTED NEXT</div>
          <div style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5 }}>Review your incorrect {weakest ? weakest.subject : ''} questions while they're fresh.</div>
          <Button variant="secondary" size="md" fullWidth style={{ marginTop: 14 }} onClick={onReview}>Review Incorrect Questions</Button>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="primary" size="lg" fullWidth onClick={onHome}>Back to Home</Button>
      </div>
    </div>
  );
}

function CbtReview({ answers, questions, onBack }) {
  const { ScreenHeader } = window.KairoLearningUI;
  const { Card } = window.KairoDesignSystem_1c2e7f;
  const incorrect = questions.map((q, i) => ({ ...q, i })).filter((q) => answers[q.i] !== q.correct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Incorrect Questions" />
      <div style={{ padding: '10px 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {incorrect.length === 0 && <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>No incorrect answers — well done.</div>}
        {incorrect.map((q) => (
          <Card key={q.i}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{q.subject} · Q{q.i + 1}</div>
            <div style={{ fontSize: 14, color: 'var(--text-body)', marginTop: 8, lineHeight: 1.5 }}>{q.stem}</div>
            <div style={{ fontSize: 12, color: 'var(--state-danger)', marginTop: 10 }}>Your answer: {answers[q.i] !== undefined ? q.options[answers[q.i]] : 'Not answered'}</div>
            <div style={{ fontSize: 12, color: 'var(--state-success)', marginTop: 4 }}>Correct answer: {q.options[q.correct]}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

window.KairoLearningUI = { ...window.KairoLearningUI, CbtSummary, CbtReview };
