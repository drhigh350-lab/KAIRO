function Insights() {
  const { Card, ScoreBadge, ProgressBar } = window.KairoDesignSystem_1c2e7f;
  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Insights</div>
      <Card style={{ textAlign: 'center' }}>
        <ScoreBadge score={842} delta={12} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Your score moved up mostly because you're getting harder questions right more often, not just more questions overall.</div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>This Week</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>You showed up four different days this week — that's the rhythm that moves your score.</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Accuracy</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-heading)' }}>78%</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Confidence</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--state-success)' }}>Rising</div>
          </div>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>Subject Health</div>
        {[['Chemistry', 82], ['Physics', 54], ['Biology', 91]].map(([s, v]) => (
          <div key={s} style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-body)', marginBottom: 6 }}><span>{s}</span></div>
            <ProgressBar value={v} tone={v < 60 ? 'gold' : 'blue'} />
          </div>
        ))}
      </Card>
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Insights = Insights;
