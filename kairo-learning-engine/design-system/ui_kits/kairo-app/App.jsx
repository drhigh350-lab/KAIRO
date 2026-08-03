const kairoStyles = {
  shell: { maxWidth: 420, margin: '40px auto', background: '#fff', minHeight: 844, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', position: 'relative' },
  statusBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 6px', fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' },
};

function StatusBar({ dark }) {
  const color = dark ? '#fff' : 'var(--text-heading)';
  return (
    <div style={{ ...kairoStyles.statusBar, color }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="1" fill={color}/><rect x="5" y="5" width="3" height="7" rx="1" fill={color}/><rect x="10" y="3" width="3" height="9" rx="1" fill={color}/><rect x="15" y="0" width="3" height="12" rx="1" fill={color}/></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={color}/><rect x="2" y="2" width="16" height="8" rx="1.5" fill={color}/><rect x="22" y="4" width="1.5" height="4" rx="0.75" fill={color}/></svg>
      </span>
    </div>
  );
}

function BottomNavBar({ active, onChange }) {
  const { BottomNav } = window.KairoDesignSystem_1c2e7f;
  const icon = (d) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={d}/></svg>;
  return (
    <BottomNav active={active} onChange={onChange} items={[
      { key: 'home', label: 'Home', icon: icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z') },
      { key: 'practice', label: 'Practice', icon: icon('M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z') },
      { key: 'review', label: 'Review', icon: icon('M1 4v6h6M3.5 15a9 9 0 1 0 2-9.4L1 10') },
      { key: 'insights', label: 'Insights', icon: icon('M4 20V10M12 20V4M20 20v-7') },
      { key: 'profile', label: 'Profile', icon: icon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z') },
    ]} />
  );
}

function App() {
  const [screen, setScreen] = React.useState('onboarding');
  const [tab, setTab] = React.useState('home');

  const showNav = ['home', 'practice-hub', 'review', 'insights', 'profile'].includes(screen);

  function go(next) { setScreen(next); }
  function onTabChange(key) {
    setTab(key);
    if (key === 'practice') setScreen('practice-hub'); else setScreen(key);
  }

  let body;
  if (screen === 'onboarding') body = <window.KairoUI.Onboarding onDone={() => go('login')} />;
  else if (screen === 'login') body = <window.KairoUI.Login onSignIn={() => { go('home'); setTab('home'); }} />;
  else if (screen === 'home') body = <window.KairoUI.Home onStartMission={() => go('practice')} />;
  else if (screen === 'practice-hub') body = <window.KairoUI.Home onStartMission={() => go('practice')} />;
  else if (screen === 'practice') body = <window.KairoUI.Practice onFinish={() => go('summary')} onExit={() => go('home')} />;
  else if (screen === 'summary') body = <window.KairoUI.SessionSummary onDone={() => { go('home'); setTab('home'); }} />;
  else if (screen === 'review') body = <window.KairoUI.Review />;
  else if (screen === 'insights') body = <window.KairoUI.Insights />;
  else if (screen === 'profile') body = <window.KairoUI.Profile />;

  const dark = screen === 'practice' || screen === 'onboarding';

  return (
    <div style={kairoStyles.shell}>
      {screen !== 'practice' && <StatusBar dark={false} />}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {body}
      </div>
      {showNav && <BottomNavBar active={tab} onChange={onTabChange} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
