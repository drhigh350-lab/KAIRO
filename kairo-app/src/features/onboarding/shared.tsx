import type { ReactNode } from 'react';
import { Button } from '../../components';

export interface KaiMarkProps {
  size?: number;
  tone?: 'navy' | 'white';
  check?: boolean;
}

/**
 * Kai's own portrait (the goat mascot, /assets/kai-avatar.png — same asset
 * KaiPanel/KaiMessage/ProfileInsights already use) in a ringed circle,
 * with an optional confirmation badge. Previously this rendered an
 * abstract placeholder — a plain ring/disc/dot built from CSS, no actual
 * likeness of Kai — across every auth/status interstitial (Sign In,
 * Reset Password, Google callback, Account Ready, Check Your Inbox,
 * Learn's lesson open/close). tone only ever arrives as 'white' in
 * practice (this app has one dark theme throughout) but stays supported
 * for the 'navy' case (used nowhere today).
 */
export function KaiMark({ size = 64, tone = 'navy', check = false }: KaiMarkProps) {
  const ring = tone === 'white' ? 'rgba(255,255,255,0.35)' : 'var(--kairo-blue-500)';
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
        border: `2px solid ${ring}`, background: 'var(--dark-bg-elevated)',
      }}>
        <img src="/assets/kai-avatar.png" alt="Kai" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {check && (
        <div style={{
          position: 'absolute', width: '36%', height: '36%', bottom: '-3%', right: '-3%', borderRadius: '50%',
          background: 'var(--dark-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--dark-bg-canvas)',
        }}>
          <svg width="58%" height="58%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
        </div>
      )}
    </div>
  );
}

export interface StepIndicatorProps {
  step: number;
  total: number;
  tone?: 'light' | 'dark';
}

export function StepIndicator({ step, total, tone = 'light' }: StepIndicatorProps) {
  const dark = tone === 'dark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i <= step - 1;
        const current = i === step - 1;
        const activeColor = dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)';
        const inactiveColor = dark ? 'var(--dark-border)' : 'var(--kairo-ink-100)';
        return <div key={i} style={{ width: current ? 22 : 8, height: 8, borderRadius: 4, background: active ? activeColor : inactiveColor, transition: 'all var(--dur-base)' }} />;
      })}
    </div>
  );
}

export interface FlowHeaderProps {
  onBack: () => void;
  step?: number | null;
  total: number;
  tone?: 'light' | 'dark';
}

export function FlowHeader({ onBack, step, total, tone = 'light' }: FlowHeaderProps) {
  const dark = tone === 'dark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px 8px' }}>
      <button type="button" onClick={onBack} aria-label="Back" style={{
        width: 32, height: 32, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', margin: '-8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)',
        background: 'none', border: 'none', padding: 0, borderRadius: '50%',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      {step != null && <StepIndicator step={step} total={total} tone={tone} />}
      <div style={{ width: 32 }} />
    </div>
  );
}

export interface SkipLinkProps {
  children: ReactNode;
  onClick: () => void;
  tone?: 'light' | 'dark';
}

export function SkipLink({ children, onClick, tone = 'light' }: SkipLinkProps) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'center', fontSize: 13, color: tone === 'dark' ? 'var(--dark-text-muted)' : 'var(--text-muted)', cursor: 'pointer',
      textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', border: 'none', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
    }}>{children}</button>
  );
}

export interface OrDividerProps {
  tone?: 'light' | 'dark';
}

export function OrDivider({ tone = 'light' }: OrDividerProps) {
  const dark = tone === 'dark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: dark ? 'var(--dark-text-faint)' : 'var(--text-faint)', fontSize: 12 }}>
      <div style={{ flex: 1, height: 1, background: dark ? 'var(--dark-border)' : 'var(--color-border-subtle)' }} /> OR <div style={{ flex: 1, height: 1, background: dark ? 'var(--dark-border)' : 'var(--color-border-subtle)' }} />
    </div>
  );
}

export interface GoogleButtonProps {
  onClick: () => void;
  children?: ReactNode;
  disabled?: boolean;
  tone?: 'light' | 'dark';
}

export function GoogleButton({ onClick, children = 'Continue with Google', disabled = false, tone = 'light' }: GoogleButtonProps) {
  return (
    <div>
      <Button variant="secondary" size="lg" fullWidth disabled={disabled} onClick={onClick}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" /><path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5C9.6 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.5 5.5C41.4 36 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z" /></svg>
          {children}
        </span>
      </Button>
      {disabled && (
        <div style={{ fontSize: 11, textAlign: 'center', marginTop: 6, color: tone === 'dark' ? 'var(--dark-text-faint)' : 'var(--text-faint)' }}>Coming soon — use email for now</div>
      )}
    </div>
  );
}
