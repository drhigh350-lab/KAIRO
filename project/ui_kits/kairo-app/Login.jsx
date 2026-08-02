function Login({ onSignIn }) {
  const { Input, Button } = window.KairoDesignSystem_1c2e7f;
  return (
    <div style={{ padding: '32px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 130, height: 60, backgroundColor: 'var(--kairo-navy-900)', WebkitMaskImage: `url('${window.KAIRO_LOGO_MASKS.wordmark}')`, maskImage: `url('${window.KAIRO_LOGO_MASKS.wordmark}')`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-heading)' }}>Welcome back.</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Continue where you left off.</div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Email Address" placeholder="Enter your email" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4zM4 6l8 7 8-7"/></svg>} />
        <Input label="Password" type="password" placeholder="Enter your password" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>} />
        <div style={{ textAlign: 'right', fontSize: 13 }}><a href="#">Forgot Password?</a></div>
        <Button variant="primary" size="lg" fullWidth onClick={onSignIn}>Sign In</Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-faint)', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} /> OR <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
        </div>
        <Button variant="secondary" size="lg" fullWidth>Continue with Google</Button>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 'auto' }}>
        Don't have an account? <a href="#">Create one</a>
      </div>
    </div>
  );
};
window.KairoUI = window.KairoUI || {};
window.KairoUI.Login = Login;
