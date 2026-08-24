import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, ProgressBar } from '../../components';
import { ScreenHeader, ChevronRight, KairoScoreInfo, KairoPointsInfo, Modal } from '../learning/shared';
import { getProfileSummary, getPrestigeProgress, getDisplayBadges, getBadgeVault, isOnboarded, signOutAndDisconnect } from '../../lib/kairoEngine';
import { BadgeVaultRow, BadgeVaultSheet } from './BadgeVault';
import { InsightsHub } from './ProfileInsights';

export function Profile() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [openTrackKey, setOpenTrackKey] = useState<string | null>(null);
  const profile = getProfileSummary();
  const prestige = getPrestigeProgress();
  const displayBadges = getDisplayBadges();
  const vault = getBadgeVault();
  const onboarded = isOnboarded();

  const firstName = profile?.name || 'there';
  const daysToGo = profile?.examDate ? Math.max(0, Math.ceil((profile.examDate - Date.now()) / 86400000)) : null;

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAndDisconnect();
    navigate('/onboarding');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Profile" tone="dark" />

      {/* 1) Identity & Prestige Rank */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '0 20px' }}>
        <Card style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <Avatar name={profile?.name} size={56} prestigeTier={prestige ? { borderToken: prestige.borderToken, glow: prestige.glow } : null} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)' }}>{firstName}</div>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>
              {daysToGo != null ? `UTME Candidate · ${daysToGo} days to go` : 'UTME Candidate'}
            </div>
          </div>
          <button type="button" onClick={() => navigate('/profile/edit')} aria-label="Edit profile" style={{
            width: 36, height: 36, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-border)', cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" /></svg>
          </button>
        </Card>
        {prestige && (
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: 'var(--dark-text-muted)' }}>PRESTIGE RANK</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>{prestige.name}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <ProgressBar value={prestige.progressPercent} tone="gold" height={7} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 8 }}>
              {prestige.nextTierName
                ? `${prestige.points.toLocaleString()} / ${prestige.nextTierMinPoints?.toLocaleString()} pts to unlock ${prestige.nextTierName}`
                : prestige.message}
            </div>
          </Card>
        )}
        {profile?.stats && (
          <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>KAIRO SCORE</div>
                  <KairoScoreInfo iconColor="rgba(255,255,255,0.75)" />
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginTop: 4 }}>{Math.round(profile.stats.eliteScore)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>LEVEL {profile.stats.level?.level ?? 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{profile.stats.level?.name || '—'}</div>
                {/* Secondary metric, deliberately never merged with Kairo Score above — Kairo Points is the unbounded effort ledger, Kairo Score is the bounded readiness gauge. */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{(profile.stats.kairoPoints ?? 0).toLocaleString()} Kairo Points</span>
                  <KairoPointsInfo iconColor="rgba(255,255,255,0.75)" />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 14, columnGap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Current Streak</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{profile.stats.currentStreak} day{profile.stats.currentStreak === 1 ? '' : 's'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Longest Streak</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{profile.stats.longestStreak ?? 0} day{(profile.stats.longestStreak ?? 0) === 1 ? '' : 's'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Accuracy</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{profile.stats.accuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Questions</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{profile.stats.totalQuestions}</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 2) The Insights Hub — Weekly Drop, Actionable Carousel, Subject Health, Monthly Checkpoint (see ProfileInsights.tsx) */}
      <InsightsHub />

      {/* 3) Targets & Badge Vault, etc. */}
      <div className="desktop-grid" style={{ padding: '0 20px 24px' }}>
        <div className="desktop-main">
          <Card onClick={() => navigate('/profile/edit')} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', cursor: 'pointer' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)', marginBottom: 10 }}>What I'm Aiming For</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dark-text-muted)' }}>Target University</span><span style={{ fontWeight: 600, color: 'var(--dark-text-heading)' }}>{profile?.targetUniversity || 'Not set yet'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dark-text-muted)' }}>Target Course</span><span style={{ fontWeight: 600, color: 'var(--dark-text-heading)' }}>{profile?.targetCourse || 'Not set yet'}</span></div>
            </div>
          </Card>
        </div>

        <div className="desktop-sidebar">
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Badge Vault</div>
            <BadgeVaultRow badges={displayBadges} onboarded={onboarded} onSelect={setOpenTrackKey} />
          </Card>
          <Card onClick={() => navigate('/profile/notifications')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark-text-heading)' }}>Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>Channels, categories, and what Kairo sends you</div>
            </div>
            <span style={{ color: 'var(--dark-text-faint)' }}><ChevronRight /></span>
          </Card>
          <Card onClick={() => navigate('/profile/leaderboard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark-text-heading)' }}>Leaderboard</div>
              <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>Opt-in only — off by default</div>
            </div>
            <span style={{ color: 'var(--dark-text-faint)' }}><ChevronRight /></span>
          </Card>

          <Button variant="secondary" size="lg" fullWidth disabled={signingOut} onClick={handleSignOut}>
            {signingOut ? 'Signing Out…' : 'Sign Out'}
          </Button>
        </div>
      </div>
      {openTrackKey && vault && (
        <Modal onClose={() => setOpenTrackKey(null)} tone="dark">
          <BadgeVaultSheet trackKey={openTrackKey} vault={vault} />
        </Modal>
      )}
    </div>
  );
}
