function Review() {
  const { Card, Badge, Button } = window.KairoDesignSystem_1c2e7f;
  const categories = [
    { label: 'Due for Review', desc: '2 concepts are starting to fade — a quick pass now keeps them from slipping further.', count: 2 },
    { label: 'Recent Mistakes', desc: 'From your last 3 sessions.', count: 4 },
    { label: 'Weak Topics', desc: 'Organic Chemistry could use a confidence check.', count: 3 },
    { label: 'Bookmarks', desc: 'Questions you\u2019ve saved for later.', count: 6 },
  ];
  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Review</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>3 things are ready to come back to you.</div>
      <Card style={{ background: 'var(--kairo-navy-900)', color: '#fff' }}>
        <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--kairo-blue-300)', fontWeight: 700 }}>SUGGESTED REVIEW</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>Quick pass on 2 fading concepts</div>
        <div style={{ fontSize: 13, color: 'var(--kairo-blue-200)', marginTop: 8 }}>About 10 minutes</div>
        <Button variant="gold" size="md" style={{ marginTop: 16 }} fullWidth>Start Review</Button>
      </Card>
      {categories.map((c) => (
        <Card key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>{c.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, maxWidth: 240 }}>{c.desc}</div>
          </div>
          <Badge tone="neutral">{c.count}</Badge>
        </Card>
      ))}
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Review = Review;
