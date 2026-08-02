function Onboarding({ onDone }) {
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const slides = [
    { title: 'Built to Last.', body: "Preparation isn't built in one night. Every question you answer, every mistake you correct, every day you return — moves you closer to your goal.", img: '../../assets/illustration-student-studying.png' },
    { title: 'Learn by Doing.', body: 'Kairo doesn\u2019t replace your teacher. It helps you understand concepts through carefully selected questions, clear explanations, and consistent practice.', img: null },
    { title: 'Meet Kai.', body: 'Kai encourages you, explains difficult concepts, celebrates your progress, and keeps you moving — even on difficult days.', img: '../../assets/illustration-kai-mascot.png' },
    { title: 'Small Steps. Big Results.', body: "Your progress isn't measured by speed alone. Kairo helps you build consistency, improve accuracy, and become more confident over time.", img: null },
    { title: 'Seize the Moment.', body: 'Every great result begins with a single decision to start. Your journey begins now.', img: '../../assets/illustration-seize-the-moment.png', final: true },
  ];
  const [i, setI] = React.useState(0);
  const s = slides[i];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px 28px', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={onDone}>{!s.final && 'Skip'}</div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--text-heading)', lineHeight: 1.15 }}>{s.title}</div>
        <div style={{ width: 40, height: 3, background: 'var(--kairo-gold-500)', margin: '10px 0 14px' }} />
        <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.55 }}>{s.body}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        {s.img && <img src={s.img} style={{ maxHeight: 260, borderRadius: 16 }} />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
        {slides.map((_, idx) => (
          <span key={idx} style={{ width: idx === i ? 18 : 6, height: 6, borderRadius: 3, background: idx === i ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-100)', transition: 'all var(--dur-base)' }} />
        ))}
      </div>
      {s.final ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" fullWidth icon={<span>&rarr;</span>} onClick={onDone}>Get Started</Button>
          <Button variant="secondary" size="lg" fullWidth onClick={onDone}>I Already Have an Account</Button>
        </div>
      ) : (
        <Button variant="primary" size="lg" fullWidth icon={<span>&rarr;</span>} onClick={() => setI(i + 1)}>Continue</Button>
      )}
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Onboarding = Onboarding;
