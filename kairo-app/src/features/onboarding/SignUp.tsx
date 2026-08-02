import { useState } from 'react';
import { Input, Button } from '../../components';
import { FlowHeader, OrDivider, GoogleButton } from './shared';

export interface SignUpProps {
  step: number;
  total: number;
  onBack: () => void;
  onGoogleSignUp: () => void;
  onEmailSignUp: (data: { name: string; email: string }) => void;
  onGoToSignIn: () => void;
}

export function SignUp({ step, total, onBack, onGoogleSignUp, onEmailSignUp, onGoToSignIn }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
