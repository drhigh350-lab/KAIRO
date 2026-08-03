function Home({ onStartMission }) {
  const { MissionCard, StreakBadge, Badge, Card, KaiMessage } = window.KairoDesignSystem_1c2e7f;
  const quickActions = [
    { label: 'Subject Practice', d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z' },
    { label: 'Topic Practice', d: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z' },
    { label: 'Mixed Practice', d: 'M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5' },
    { label: 'Weak Areas', d: 'M3 17l6-6 4 4 8-8M14 6h7v7' },
    { label: 'Mistake Review', d: 'M1 4v6h6M3.5 15a9 9 0 1 0 2-9.4L1 10' },
    { label: 'Bookmarked', d: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' },
  ];
  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Kairo</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--kairo-blue-100)' }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Good morning, Wisdom 👋</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text-heading)', marginTop: 2 }}>Seize the Moment.</div>
        <div style={{ marginTop: 10 }}><StreakBadge days={12} /> <span style={{ marginLeft: 8 }}><Badge tone="neutral">Level 4</Badge></span></div>
      </div>
      <MissionCard title="Continue Biology: Cell Division" reason="You're 68% complete" duration="Last studied yesterday · Focus: Weak areas" progress={68} onStart={onStartMission} />
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>Quick Actions</div>
          <a href="#" style={{ fontSize: 13 }}>See all</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
          {quickActions.map((q) => (
            <Card key={q.label} padding={14} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-blue-700)" strokeWidth="2"><path d={q.d}/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{q.label}</span>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>Continue Where You Left Off</div>
          <a href="#" style={{ fontSize: 13 }}>See all</a>
        </div>
        <Card style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--kairo-blue-100)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>Chemistry: Atomic Structure</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>34% complete · Last opened 2 days ago</div>
          </div>
        </Card>
      </div>
      <Card style={{ background: 'var(--kairo-blue-100)' }}>
        <KaiMessage compact>"Small consistent steps today create big results tomorrow."</KaiMessage>
      </Card>
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Home = Home;
