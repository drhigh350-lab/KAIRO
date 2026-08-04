import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '../../components';
import { ScreenHeader, ChevronRight } from '../learning/shared';
import { getEngine, getProfileSummary, signOutAndDisconnect } from '../../lib/kairoEngine';

export function Profile() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const profile = getProfileSummary();
  const signedIn = !!getEngine();
  const badges = getEngine()?.getBadges();
  const earnedBadges: { id: string; name: string }[] = badges?.earned ?? [];

  const firstName = profile?.name || 'there';
  const initial = profile?.name ? profile.name.trim().charAt(0).toUpperCase() : null;
  const daysToGo = profile?.examDate ? Math.max(0, Math.ceil((profile.examDate - Date.now()) / 86400000)) : null;

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAndDisconnect();
    navigate('/onboarding');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Profile" tone="dark" />
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Card style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--dark-bg-elevated)', border: '2px solid var(--dark-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {initial ? (
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--dark-accent-blue)' }}>{initial}</span>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" /></svg>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)' }}>{firstName}</div>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>
              {signedIn
                ? (daysToGo != null ? `UTME Candidate · ${daysToGo} days to go` : 'UTME Candidate')
                : 'Not signed in'}
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
        <Card onClick={() => navigate('/profile/notifications')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', cursor: 'pointer' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark-text-heading)' }}>Notifications</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>Channels, categories, and what Kairo sends you</div>
          </div>
          <span style={{ color: 'var(--dark-text-faint)' }}><ChevronRight /></span>
        </Card>

        {signedIn ? (
          <Button variant="secondary" size="lg" fullWidth disabled={signingOut} onClick={handleSignOut}>
            {signingOut ? 'Signing Out…' : 'Sign Out'}
          </Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth onClick={() => navigate('/onboarding')}>
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
