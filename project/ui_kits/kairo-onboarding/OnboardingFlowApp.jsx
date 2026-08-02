const onbStyles = {
  shell: { maxWidth: 420, margin: '40px auto', background: '#fff', minHeight: 844, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', position: 'relative' },
  statusBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 6px', fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' },
};
function OnbStatusBar() {
  const color = 'var(--text-heading)';
  return (
    <div style={onbStyles.statusBar}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="1" fill={color} /><rect x="5" y="5" width="3" height="7" rx="1" fill={color} /><rect x="10" y="3" width="3" height="9" rx="1" fill={color} /><rect x="15" y="0" width="3" height="12" rx="1" fill={color} /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={color} /><rect x="2" y="2" width="16" height="8" rx="1.5" fill={color} /><rect x="22" y="4" width="1.5" height="4" rx="0.75" fill={color} /></svg>
      </span>
    </div>
  );
}

// segmented indicator covers Sign Up -> Account Ready
const SEQ = ['signup', 'about', 'ready'];

function KairoOnboardingApp() {
  const U = window.KairoOnboardingUI;
  const [screen, setScreen] = React.useState('intro');
  const [history, setHistory] = React.useState([]);
  const [data, setData] = React.useState({ name: '', email: '', examYear: null, course: null, subjects: [] });

  function go(next) { setHistory((h) => [...h, screen]); setScreen(next); }
  function back() { setHistory((h) => { const n = [...h]; const prev = n.pop(); if (prev) setScreen(prev); return n; }); }

  const total = SEQ.length;
  const stepIndex = SEQ.indexOf(screen) + 1;

  let body;
  if (screen === 'intro') body = <U.IntroCarousel onDone={() => go('welcome')} />;
  else if (screen === 'welcome') body = <U.Welcome onSignUp={() => go('signup')} onSignIn={() => go('signin')} />;
  else if (screen === 'signin') body = <U.SignIn onBack={back} onSignedIn={() => go('home')} onGoToSignUp={() => go('signup')} />;
  else if (screen === 'signup') body = <U.SignUp step={stepIndex} total={total} onBack={back}
    onGoogleSignUp={() => { setData((d) => ({ ...d, name: d.name || 'Wisdom Adeyemi', email: d.email || 'wisdom@gmail.com' })); go('about'); }}
    onEmailSignUp={({ name, email }) => { setData((d) => ({ ...d, name, email })); go('about'); }}
    onGoToSignIn={() => go('signin')} />;
  else if (screen === 'about') body = <U.AboutYou step={stepIndex} total={total} onBack={back} data={data} setData={setData} onContinue={() => go('ready')} />;
  else if (screen === 'ready') body = <U.AccountReady step={stepIndex} total={total} onBack={back} data={data} onStart={() => go('home')} />;
  else if (screen === 'home') body = <U.HomeDashboardNew data={data} onStartDiagnostic={() => {}} />;

  return (
    <div style={onbStyles.shell}>
      <OnbStatusBar />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {body}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<KairoOnboardingApp />);
