function Welcome({ onSignUp, onSignIn }) {
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const { KairoWordmark } = window.KairoOnboardingUI;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '56px 28px 32px', fontFamily: 'var(--font-body)', background: 'var(--color-bg-canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, textAlign: 'center' }}>
        <KairoWordmark width={132} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--text-heading)', lineHeight: 1.25 }}>Begin something meaningful.</div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6, maxWidth: 290 }}>Kairo guides you one question at a time, building calm, steady progress toward UTME.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onSignUp}>Get Started</Button>
        <SkipLinkAlt onClick={onSignIn} />
      </div>
    </div>
  );
}
function SkipLinkAlt({ onClick }) {
  return <div onClick={onClick} style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-link)', cursor: 'pointer', fontWeight: 500 }}>I already have an account</div>;
}

function SignIn({ onBack, onSignedIn, onGoToSignUp }) {
  const { Input, Button } = window.KairoDesignSystem_1c2e7f;
  const { KaiMark, OrDivider, GoogleButton } = window.KairoOnboardingUI;
  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
      <div onClick={onBack} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-heading)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <KaiMark size={56} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--text-heading)' }}>Welcome back.</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Continue where you left off.</div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Email Address" placeholder="Enter your email" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM4 6l8 7 8-7" /></svg>} />
        <Input label="Password" type="password" placeholder="Enter your password" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
        <div style={{ textAlign: 'right', fontSize: 13 }}><a href="#">Forgot password?</a></div>
        <Button variant="primary" size="lg" fullWidth onClick={onSignedIn}>Sign In</Button>
        <OrDivider />
        <GoogleButton onClick={onSignedIn} />
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 'auto' }}>
        New to Kairo? <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignUp(); }}>Create an account</a>
      </div>
    </div>
  );
}

function SignUp({ step, total, onBack, onGoogleSignUp, onEmailSignUp, onGoToSignIn }) {
  const { Input, Button } = window.KairoDesignSystem_1c2e7f;
  const { FlowHeader, OrDivider, GoogleButton } = window.KairoOnboardingUI;
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const canSubmit = name.trim() && email.trim() && password.length >= 6;
  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
      <FlowHeader onBack={onBack} step={step} total={total} />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-heading)' }}>Create your account</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Let's get you started on your journey to success.</div>
      </div>
      <GoogleButton onClick={onGoogleSignUp} />
      <OrDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Full Name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>} />
        <Input label="Email Address" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM4 6l8 7 8-7" /></svg>} />
        <Input label="Password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>} />
      </div>
      <Button variant="primary" size="lg" fullWidth disabled={!canSubmit} onClick={() => onEmailSignUp({ name, email })}>Create Account</Button>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 'auto' }}>
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignIn(); }}>Sign In</a>
      </div>
    </div>
  );
}

window.KairoOnboardingUI = { ...window.KairoOnboardingUI, Welcome, SignIn, SignUp };
