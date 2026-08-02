function SingleSelectScreen({ step, total, onBack, heading, subcopy, options, value, onChange, onContinue, onSkip }) {
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const { FlowHeader, SkipLink } = window.KairoOnboardingUI;
  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <FlowHeader onBack={onBack} step={step} total={total} />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-heading)' }}>{heading}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>{subcopy}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((o) => {
          const active = value === o.key;
          return (
            <div key={o.key} onClick={() => onChange(o.key)} style={{
              padding: '16px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 15, fontWeight: 500,
              border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-blue-100)' : '#fff', color: 'var(--text-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {o.label}
              {active && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2.5"><path d="M4 12l5 5L20 6" /></svg>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Button variant="primary" size="lg" fullWidth disabled={!value} onClick={onContinue}>Continue</Button>
        <SkipLink onClick={onSkip}>Skip for now</SkipLink>
      </div>
    </div>
  );
}

function CurrentLevel({ step, total, onBack, value, onChange, onContinue, onSkip }) {
  const { levels } = window.KairoOnboardingData;
  return <SingleSelectScreen step={step} total={total} onBack={onBack} heading="Where are you starting from?" subcopy="Be honest — this only helps Kairo meet you at the right level." options={levels} value={value} onChange={onChange} onContinue={onContinue} onSkip={onSkip} />;
}

function PersonalGoal({ step, total, onBack, value, onChange, onContinue, onSkip }) {
  const { goals } = window.KairoOnboardingData;
  return <SingleSelectScreen step={step} total={total} onBack={onBack} heading="What's your main goal?" subcopy="Kairo will shape your practice around this." options={goals} value={value} onChange={onChange} onContinue={onContinue} onSkip={onSkip} />;
}

function Notifications({ step, total, onBack, onAllow, onSkip }) {
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const { FlowHeader } = window.KairoOnboardingUI;
  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <FlowHeader onBack={onBack} step={step} total={total} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--kairo-blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--text-heading)' }}>Would you like reminders to stay on track?</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.55 }}>Kairo sends occasional, useful nudges — never guilt, never noise. You can change this anytime in Settings.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onAllow}>Allow Notifications</Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onSkip}>Skip</Button>
      </div>
    </div>
  );
}

function AccountReady({ step, total, onBack, data, onStart }) {
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const { FlowHeader, KaiMark } = window.KairoOnboardingUI;
  const firstName = (data.name || '').split(' ')[0] || 'there';
  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}>
      <FlowHeader onBack={onBack} step={step} total={total} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
        <KaiMark size={72} check />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-heading)' }}>You're all set, {firstName}.</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>Kairo will guide you one question at a time until you're ready for UTME.</div>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SummaryRow label="Name" value={data.name || '—'} />
        <SummaryRow label="Course" value={data.course ? data.course.name : 'Not set yet'} />
        <SummaryRow label="Exam Year" value={data.examYear || '—'} />
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Subjects</div>
          {data.subjects.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.subjects.map((s) => <span key={s} style={{ fontSize: 12, fontWeight: 600, color: 'var(--kairo-blue-700)', background: 'var(--kairo-blue-100)', padding: '5px 10px', borderRadius: 'var(--radius-pill)' }}>{s}</span>)}
            </div>
          ) : <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Not chosen yet</div>}
        </div>
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={onStart}>Start Learning</Button>
    </div>
  );
}
function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

window.KairoOnboardingUI = { ...window.KairoOnboardingUI, CurrentLevel, PersonalGoal, Notifications, AccountReady };
