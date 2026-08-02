function Profile() {
  const { Card, Badge, Switch } = window.KairoDesignSystem_1c2e7f;
  const [notif, setNotif] = React.useState(true);
  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Profile</div>
      <Card style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--kairo-blue-100)' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-heading)' }}>Wisdom Adeyemi</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>UTME 2027 Candidate · 74 days to go</div>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)', marginBottom: 10 }}>What I'm Aiming For</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Target University</span><span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>University of Lagos</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Target Course</span><span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Medicine &amp; Surgery</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Target Score</span><span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>320</span></div>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)', marginBottom: 10 }}>Achievement Highlights</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="gold">Reinforced: Mole Concept</Badge>
          <Badge tone="gold">12 Day Streak</Badge>
          <Badge tone="gold">First Full Mock</Badge>
        </div>
      </Card>
      <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-heading)' }}>Academic Nudges</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Fading concepts &amp; review reminders</div>
        </div>
        <Switch checked={notif} onChange={() => setNotif(!notif)} />
      </Card>
    </div>
  );
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Profile = Profile;
