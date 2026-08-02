import type { ReactNode } from 'react';

export interface PhoneShellProps {
  children: ReactNode;
  statusBarTone?: 'navy' | 'white';
  statusBarBg?: string;
  hideStatusBar?: boolean;
}

/**
 * The mobile-app frame every screen renders inside — matches the 420px max-width,
 * 32px-radius phone shell used consistently across every Claude Design prototype
 * (kairo-app/App.jsx, kairo-onboarding/OnboardingFlowApp.jsx, kairo-learning/LearningApp.jsx).
 */
export function PhoneShell({ children, statusBarTone = 'navy', statusBarBg = 'transparent', hideStatusBar = false }: PhoneShellProps) {
  return (
    <div
      style={{
        maxWidth: 420,
        width: '100%',
        margin: '40px auto',
        background: '#fff',
        minHeight: 844,
        borderRadius: 32,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
        position: 'relative',
      }}
    >
      {!hideStatusBar && <StatusBar tone={statusBarTone} bg={statusBarBg} />}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

function StatusBar({ tone, bg }: { tone: 'navy' | 'white'; bg: string }) {
  const color = tone === 'white' ? '#fff' : 'var(--text-heading)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 6px', fontSize: 13, fontWeight: 600, color, background: bg }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="1" fill={color} /><rect x="5" y="5" width="3" height="7" rx="1" fill={color} /><rect x="10" y="3" width="3" height="9" rx="1" fill={color} /><rect x="15" y="0" width="3" height="12" rx="1" fill={color} /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={color} /><rect x="2" y="2" width="16" height="8" rx="1.5" fill={color} /><rect x="22" y="4" width="1.5" height="4" rx="0.75" fill={color} /></svg>
      </span>
    </div>
  );
}
