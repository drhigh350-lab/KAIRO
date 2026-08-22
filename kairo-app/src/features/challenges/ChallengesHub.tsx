import { useState } from 'react';
import { Badge, Card, StreakBadge } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { Challenge } from './data';
import { getStreakStatus } from '../../lib/kairoEngine';

/**
 * "Challenge Friends" (Batch 3.4) — an invite to a still-live, TECHMED-
 * curated challenge, not a bespoke peer-vs-peer challenge. The Challenges
 * Module spec (§2.2, §12) explicitly rules out peer-to-peer pressure
 * mechanics, but blesses exactly this shape under "Challenge Invites"
 * (§6.3): "a share format focused on inviting others to join a still-live
 * challenge... framed as 'come compete' rather than 'look what I did'."
 */
async function shareChallenge(challenge: Challenge) {
  const url = `${window.location.origin}/challenges/${challenge.id}`;
  const text = `Come compete with me on Kairo — "${challenge.title}" is ${challenge.status === 'live' ? 'live now' : 'starting soon'}.`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Kairo Challenge', text, url });
    } catch {
      // Share sheet dismissed — not an error worth surfacing.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return true;
  } catch {
    return false;
  }
}

export interface ChallengesHubProps {
  loading: boolean;
  challenges: Challenge[];
  onBack: () => void;
  onSelect: (challengeId: string) => void;
}

function accentStyle(accent: Challenge['accent']) {
  if (accent === 'navy') return { background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' };
  if (accent === 'gold') return { background: 'rgba(240,177,42,0.12)', color: 'var(--dark-text-heading)', border: '1px solid rgba(240,177,42,0.3)' };
  return { background: 'var(--dark-bg-surface)', color: 'var(--dark-text-heading)', border: '1px solid var(--dark-border)' };
}

const scoringLabel: Record<Challenge['scoringFormula'], string> = { accuracy: 'Accuracy scored', speed: 'Speed scored', hybrid: 'Accuracy + speed scored' };

function ChallengeCard({ challenge, onSelect, onShared }: { challenge: Challenge; onSelect: (id: string) => void; onShared: () => void }) {
  const style = accentStyle(challenge.accent);
  const onGradient = challenge.accent === 'navy';
  const canInvite = challenge.status === 'live' || challenge.status === 'upcoming';
  return (
    <Card
      onClick={() => onSelect(challenge.id)}
      style={{ ...style, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: style.boxShadow ?? 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: onGradient ? 'rgba(255,255,255,0.75)' : 'var(--dark-accent-blue)' }}>{challenge.theme}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginTop: 4 }}>{challenge.title}</div>
        </div>
        <Badge tone={challenge.status === 'live' ? 'success' : 'darkNeutral'}>{challenge.status === 'live' ? 'Live now' : challenge.timingLabel}</Badge>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: onGradient ? 'rgba(255,255,255,0.85)' : 'var(--dark-text-muted)' }}>
          {challenge.questionCount} question{challenge.questionCount === 1 ? '' : 's'} · {scoringLabel[challenge.scoringFormula]}
        </div>
        {canInvite && (
          <button type="button" onClick={async (e) => {
            e.stopPropagation();
            const copied = await shareChallenge(challenge);
            if (copied) onShared();
          }} style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minHeight: 'var(--touch-min)', padding: '6px 10px', borderRadius: 'var(--radius-pill)',
            border: `1px solid ${onGradient ? 'rgba(255,255,255,0.4)' : 'var(--dark-border)'}`, background: 'transparent',
            color: onGradient ? '#fff' : 'var(--dark-text-heading)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5l6.8-3.9M8.6 13.5l6.8 3.9" /></svg>
            Challenge Friends
          </button>
        )}
      </div>
    </Card>
  );
}

export function ChallengesHub({ loading, challenges, onBack, onSelect }: ChallengesHubProps) {
  const live = challenges.filter((c) => c.status === 'live');
  const upcoming = challenges.filter((c) => c.status === 'upcoming');
  const ended = challenges.filter((c) => c.status === 'ended');
  const streak = getStreakStatus();
  const [toast, setToast] = useState(false);
  function handleShared() {
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', position: 'relative' }}>
      {toast && (
        <div style={{ position: 'absolute', top: 10, left: 20, right: 20, zIndex: 40, textAlign: 'center', padding: '10px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--dark-bg-elevated)', color: 'var(--dark-text-heading)', fontSize: 13, fontWeight: 600 }}>
          Invite link copied — share it with a friend.
        </div>
      )}
      <ScreenHeader onBack={onBack} title="Challenges" right={streak?.momentum ? <StreakBadge dark days={streak.momentum} /> : undefined} tone="dark" />

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {loading && (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40 }}>Loading challenges…</div>
        )}

        {!loading && challenges.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40, lineHeight: 1.5 }}>
            Nothing scheduled right now — check back soon.
          </div>
        )}

        {!loading && live.length > 0 && (
          <div>
            <SectionLabel>Live Now</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {live.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} onShared={handleShared} />)}
            </div>
          </div>
        )}

        {!loading && upcoming.length > 0 && (
          <div>
            <SectionLabel>Starting Soon</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {upcoming.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} onShared={handleShared} />)}
            </div>
          </div>
        )}

        {!loading && ended.length > 0 && (
          <div>
            <SectionLabel>Recently Concluded</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {ended.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} onShared={handleShared} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontWeight: 700, color: 'var(--dark-text-heading)', fontSize: 15 }}>{children}</div>;
}
