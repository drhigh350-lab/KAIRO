import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Switch } from '../../components';
import { ScreenHeader, Modal } from '../learning/shared';
import {
  getConsentSummary, grantChannelConsent, revokeChannelConsent, setCategoryConsent,
  setEditorialConsent, setHardStopConsent, CONSENT_PRODUCT_CATEGORIES,
  type ConsentChannel, type ConsentCategory, type ConsentSummary,
} from '../../lib/kairoEngine';

const CATEGORY_COPY: Record<ConsentCategory, { label: string; on: string; off: string }> = {
  academic_nudge: { label: 'Academic Nudges', on: 'Fading concepts, review reminders.', off: "Off — they'll still show up inside Review when you open the app." },
  motivational_consistency: { label: 'Motivational & Consistency', on: 'Streak and consistency encouragement.', off: 'Off — your streak still tracks in the background.' },
  milestone_celebration: { label: 'Milestone & Celebration', on: 'Genuine wins worth celebrating.', off: 'Off — badges still appear in your Profile.' },
  community_social: { label: 'Community & Social', on: 'Challenges and community events.', off: "Off — Challenges is still there when you open it." },
  reengagement_winback: { label: 'Re-engagement', on: "A nudge back if you've been away.", off: 'Off — no come-back messages if you go quiet.' },
  exam_critical: { label: 'Exam-Critical', on: 'Exam-window and mock-start alerts.', off: 'Off — check Home for exam timing instead.' },
  account_administrative: { label: 'Account & Administrative', on: '', off: '' },
  editorial_broadcast: { label: 'Editorial & Broadcast', on: 'TECHMED campaign updates and community content.', off: 'Off — no campaign or community content.' },
};

const emptyConsent: ConsentSummary = {
  channelPermissions: { push: false, in_app_badge: true, whatsapp: false, email: false, sms: false },
  categoryPreferences: {},
  hardStopActive: false,
  editorialConsent: false,
};

export function NotificationSettings() {
  const navigate = useNavigate();
  const [consent, setConsent] = useState<ConsentSummary>(() => getConsentSummary() || emptyConsent);
  const [busy, setBusy] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const signedIn = !!getConsentSummary();

  useEffect(() => {
    const summary = getConsentSummary();
    if (summary) setConsent(summary);
  }, []);

  function refresh() {
    const summary = getConsentSummary();
    if (summary) setConsent(summary);
  }

  async function toggleChannel(channel: ConsentChannel) {
    setBusy(channel);
    try {
      if (consent.channelPermissions[channel]) {
        await revokeChannelConsent(channel);
      } else if (channel === 'push' && typeof Notification !== 'undefined') {
        const result = await Notification.requestPermission();
        if (result === 'granted') await grantChannelConsent(channel);
      } else {
        await grantChannelConsent(channel);
      }
      refresh();
    } finally {
      setBusy(null);
    }
  }

  const grantedChannels = (Object.keys(consent.channelPermissions) as ConsentChannel[]).filter((c) => consent.channelPermissions[c]);

  /**
   * The settings screen shows one row per category (spec §7.2 item 2),
   * not a full channel×category matrix — so a toggle here applies
   * uniformly across every channel the student has currently granted,
   * keeping "do I want Academic Nudges?" a single yes/no regardless of
   * how many channels happen to be permitted.
   */
  async function toggleCategory(category: ConsentCategory) {
    const current = grantedChannels.some((c) => consent.categoryPreferences[c]?.[category] === true);
    setBusy(category);
    try {
      for (const channel of grantedChannels) {
        await setCategoryConsent(channel, category, !current);
      }
      refresh();
    } finally {
      setBusy(null);
    }
  }

  async function toggleEditorial() {
    setBusy('editorial');
    try {
      await setEditorialConsent(!consent.editorialConsent);
      refresh();
    } finally {
      setBusy(null);
    }
  }

  async function confirmStop() {
    setBusy('stop');
    try {
      await setHardStopConsent(true);
      refresh();
    } finally {
      setBusy(null);
      setShowStopConfirm(false);
    }
  }

  async function resume() {
    setBusy('resume');
    try {
      await setHardStopConsent(false);
      refresh();
    } finally {
      setBusy(null);
    }
  }

  const anyChannelGranted = consent.channelPermissions.push || consent.channelPermissions.email
    || consent.channelPermissions.whatsapp || consent.channelPermissions.sms;

  const channelRows: { channel: ConsentChannel; label: string; desc: string; available: boolean }[] = [
    { channel: 'push', label: 'Push Notifications', desc: 'Alerts on this device.', available: typeof window !== 'undefined' && 'Notification' in window },
    { channel: 'email', label: 'Email', desc: 'Sent to your account email.', available: true },
    { channel: 'whatsapp', label: 'WhatsApp', desc: 'Not set up yet — no number on file.', available: false },
    { channel: 'sms', label: 'SMS', desc: 'Not set up yet — no number on file.', available: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Notifications" tone="dark" />
      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {!signedIn && (
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>Sign in to manage your notification preferences.</div>
          </Card>
        )}

        <div style={{ opacity: signedIn ? 1 : 0.5, pointerEvents: signedIn ? 'auto' : 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>CHANNELS</div>
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {channelRows.map((row, i) => (
              <div key={row.channel} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--dark-border)' : 'none', opacity: row.available ? 1 : 0.5,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>{row.desc}</div>
                </div>
                {row.available ? (
                  <Switch dark checked={!!consent.channelPermissions[row.channel]} onChange={() => signedIn && busy !== row.channel && toggleChannel(row.channel)} />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Unavailable</span>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>WHAT YOU HEAR ABOUT</div>
          {!anyChannelGranted && (
            <div style={{ fontSize: 12.5, color: 'var(--dark-text-faint)', marginBottom: 10, lineHeight: 1.5 }}>Enable a channel above to choose what's sent there.</div>
          )}
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 0, opacity: anyChannelGranted ? 1 : 0.5, pointerEvents: anyChannelGranted ? 'auto' : 'none' }}>
            {CONSENT_PRODUCT_CATEGORIES.map((category, i) => {
              const copy = CATEGORY_COPY[category];
              const allowed = grantedChannels.some((c) => consent.categoryPreferences[c]?.[category] === true);
              return (
                <div key={category} style={{ padding: '12px 0', borderTop: i > 0 ? '1px solid var(--dark-border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{copy.label}</div>
                    <Switch dark checked={allowed} onChange={() => anyChannelGranted && toggleCategory(category)} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 3 }}>{allowed ? copy.on : copy.off}</div>
                </div>
              );
            })}
          </Card>
        </div>

        <div style={{ opacity: anyChannelGranted ? 1 : 0.5, pointerEvents: anyChannelGranted ? 'auto' : 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>EDITORIAL &amp; BROADCAST</div>
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)' }}>TECHMED Campaigns</div>
              <Switch dark checked={consent.editorialConsent} onChange={() => anyChannelGranted && toggleEditorial()} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 3 }}>{consent.editorialConsent ? CATEGORY_COPY.editorial_broadcast.on : CATEGORY_COPY.editorial_broadcast.off}</div>
          </Card>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--dark-text-faint)', lineHeight: 1.55, padding: '0 4px' }}>
          Security and account notices are always delivered, regardless of the settings above. Kairo also caps how often it reaches out even within categories you've enabled.
        </div>

        <div style={{ opacity: signedIn ? 1 : 0.5, pointerEvents: signedIn ? 'auto' : 'none' }}>
          {consent.hardStopActive ? (
            <Button variant="secondary" size="lg" fullWidth disabled={busy === 'resume'} onClick={resume}>
              {busy === 'resume' ? 'Resuming…' : 'Resume Notifications'}
            </Button>
          ) : (
            <Button variant="secondary" size="lg" fullWidth onClick={() => setShowStopConfirm(true)}>Stop All Notifications</Button>
          )}
        </div>
      </div>

      {showStopConfirm && (
        <Modal onClose={() => setShowStopConfirm(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)' }}>Stop all notifications?</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.5 }}>
            This stops every channel and category, including exam-critical alerts. Security and account notices still come through. You can resume any time.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <div style={{ flex: 1 }}><Button variant="secondary" fullWidth onClick={() => setShowStopConfirm(false)}>Keep Notifications</Button></div>
            <div style={{ flex: 1 }}><Button variant="darkAccent" fullWidth disabled={busy === 'stop'} onClick={confirmStop}>{busy === 'stop' ? 'Stopping…' : 'Stop All'}</Button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
