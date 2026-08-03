function SessionSummary({ onDone }) {
  const { SessionSummaryCard, Button, Card } = window.KairoDesignSystem_1c2e7f;
  return (
    <div style={{ padding: '32px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-gold-bg)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-gold-600)" strokeWidth="2"><path d="M12 2c1 4-3 5-3 9a3 3 0 006 0c0-1-.5-2-1-2 1 3-1 4-2 4a2 2 0 01-2-2c0-3 3-4 2-9z"/></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)', marginTop: 14 }}>Session Complete</div>
      </div>
      <Card>
        <SessionSummaryCard
          headline="You reinforced 2 concepts and steadied 1 that was fading"
          strengths={['Cell Division — Reinforced', 'Newton\u2019s Second Law — Held']}
          nextSteps={['Review: Atomic Structure (still fading)', 'Come back tomorrow — that\u2019s enough for today']}
          scoreDelta={12}
        />
      </Card>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
        "You remembered the redox concept yesterday — that's the second time it's stuck."
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={onDone} style={{ marginTop: 'auto' }}>Back to Home</Button>
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.SessionSummary = SessionSummary;
