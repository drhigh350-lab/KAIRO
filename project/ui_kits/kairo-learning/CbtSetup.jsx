function ExamSetup({ onBack, onContinue }) {
  const { ScreenHeader } = window.KairoLearningUI;
  const { cbtSubjects } = window.KairoLearningData;
  const { Button, Card } = window.KairoDesignSystem_1c2e7f;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="CBT Exam Mode" />
      <div style={{ padding: '10px 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your subject combination for this simulation.</div>
        <Card>
          {cbtSubjects.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < cbtSubjects.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)' }}>{s}</span>
              {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', background: 'var(--kairo-blue-100)', padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>Compulsory</span>}
            </div>
          ))}
        </Card>
        <Card style={{ background: 'var(--kairo-blue-100)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', marginBottom: 8 }}>THIS SESSION</div>
          <Row label="Questions" value="16 total (4 per subject)" />
          <Row label="Duration" value="20 minutes" />
          <Row label="Mode" value="Simulated JAMB CBT" />
        </Card>
        <Button variant="primary" size="lg" fullWidth onClick={onContinue} style={{ marginTop: 'auto' }}>Continue to Instructions</Button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{value}</span>
    </div>
  );
}

function ExamInstructions({ onBack, onBegin }) {
  const { ScreenHeader } = window.KairoLearningUI;
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const rules = [
    'This session simulates the real JAMB CBT experience.',
    'Each subject has its own timer and question set.',
    'You may skip, flag, and return to any question before submitting.',
    'The question palette shows answered, flagged, and unanswered questions at a glance.',
    'Once submitted, answers cannot be changed.',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Instructions" />
      <div style={{ padding: '10px 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--text-heading)' }}>Before you begin</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rules.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--kairo-blue-100)', color: 'var(--kairo-navy-900)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.55 }}>{r}</div>
            </div>
          ))}
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onBegin} style={{ marginTop: 'auto' }}>Begin Exam</Button>
      </div>
    </div>
  );
}

window.KairoLearningUI = { ...window.KairoLearningUI, ExamSetup, ExamInstructions };
