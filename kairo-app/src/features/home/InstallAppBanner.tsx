import { Card, Button } from '../../components';
import { useInstallPrompt } from '../../lib/useInstallPrompt';

/**
 * Renders nothing until Chrome/Edge actually hand over a `beforeinstallprompt`
 * event (never on iOS Safari, never once the PWA is already installed) —
 * there's no point showing an "Install" button the browser can't act on.
 */
export function InstallAppBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--dark-bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-gold-500)" strokeWidth="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2" strokeLinecap="round" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)' }}>Install Kairo</div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>Add to your home screen for one-tap access.</div>
        </div>
        <Button variant="gold" size="sm" onClick={promptInstall}>Install</Button>
      </div>
    </Card>
  );
}
