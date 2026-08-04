import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Card, Switch } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { getEngine, getProfileSummary } from '../../lib/kairoEngine';

export function Profile() {
  const navigate = useNavigate();
  const [notif, setNotif] = useState(true);
  const profile = getProfileSummary();
  const badges = getEngine()?.getBadges();
  const earnedBadges: { id: string; name: string }[] = badges?.earned ?? [];

  const firstName = profile?.name || 'there';
  const daysToGo = profile?.examDate ? Math.max(0, Math.ceil((profile.examDate - Date.now()) / 86400000)) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Profile" tone="dark" />
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Card style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--dark-bg-elevated)', border: '2px solid var(--dark-accent-blue)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)' }}>{firstName}</div>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>
              {daysToGo != null ? `UTME Candidate · ${daysToGo} days to go` : 'UTME Candidate'}
            </div>
          </div>
        </Card>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)', marginBottom: 10 }}>What I'm Aiming For</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dark-text-muted)' }}>Target University</span><span style={{ fontWeight: 600, color: 'var(--dark-text-heading)' }}>{profile?.targetUniversity || 'Not set yet'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dark-text-muted)' }}>Target Course</span><span style={{ fontWeight: 600, color: 'var(--dark-text-heading)' }}>{profile?.targetCourse || 'Not set yet'}</span></div>
          </div>
        </Card>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Achievement Highlights</div>
          {earnedBadges.length ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {earnedBadges.map((b) => <Badge key={b.id} tone="gold">{b.name}</Badge>)}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>Nothing to show yet — this fills in as you practise.</div>
          )}
        </Card>
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark-text-heading)' }}>Academic Nudges</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>Fading concepts &amp; review reminders</div>
          </div>
          <Switch dark checked={notif} onChange={() => setNotif(!notif)} />
        </Card>
      </div>
    </div>
  );
}
