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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Profile" />
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Card style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--kairo-blue-100)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-heading)' }}>{firstName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {daysToGo != null ? `UTME Candidate · ${daysToGo} days to go` : 'UTME Candidate'}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)', marginBottom: 10 }}>What I'm Aiming For</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Target University</span><span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{profile?.targetUniversity || 'Not set yet'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Target Course</span><span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{profile?.targetCourse || 'Not set yet'}</span></div>
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)', marginBottom: 10 }}>Achievement Highlights</div>
          {earnedBadges.length ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {earnedBadges.map((b) => <Badge key={b.id} tone="gold">{b.name}</Badge>)}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Nothing to show yet — this fills in as you practise.</div>
          )}
        </Card>
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-heading)' }}>Academic Nudges</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Fading concepts &amp; review reminders</div>
          </div>
          <Switch checked={notif} onChange={() => setNotif(!notif)} />
        </Card>
      </div>
    </div>
  );
}
