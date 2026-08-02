import { Badge, Card, StreakBadge } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { challenges, liveChallenge, type Challenge } from './data';

export interface ChallengesHubProps {
  onBack: () => void;
  onSelect: (challenge: Challenge) => void;
}

function accentStyle(accent: Challenge['accent']) {
  if (accent === 'navy') return { background: 'var(--kairo-navy-900)', color: '#fff' };
  if (accent === 'gold') return { background: 'var(--accent-gold-bg)', color: 'var(--text-heading)' };
  return { background: '#fff', color: 'var(--text-heading)' };
}

function ChallengeCard({ challenge, onSelect }: { challenge: Challenge; onSelect: (c: Challenge) => void }) {
  const style = accentStyle(challenge.accent);
  const dark = challenge.accent === 'navy';
  return (
    <Card
      onClick={() => onSelect(challenge)}
      style={{ ...style, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: dark ? 'var(--kairo-blue-300)' : 'var(--kairo-blue-700)' }}>{challenge.theme}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginTop: 4 }}>{challenge.title}</div>
        </div>
        <Badge tone={challenge.status === 'live' ? 'success' : 'neutral'}>{challenge.status === 'live' ? 'Live now' : challenge.timingLabel}</Badge>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: dark ? 'var(--kairo-blue-200)' : 'var(--text-muted)' }}>{challenge.description}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: dark ? 'var(--kairo-blue-200)' : 'var(--text-muted)' }}>
        {challenge.participantCount.toLocaleString()} students already joined
      </div>
    </Card>
  );
}

export function ChallengesHub({ onBack, onSelect }: ChallengesHubProps) {
  const live = challenges.filter((c) => c.status === 'live');
  const upcoming = challenges.filter((c) => c.status === 'upcoming');
  const ended = challenges.filter((c) => c.status === 'ended');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Challenges" right={<StreakBadge days={5} />} />

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {liveChallenge
            ? `${liveChallenge.title} is live right now — ${liveChallenge.participantCount.toLocaleString()} students already joined.`
            : "Nothing live right now — here's what's coming up."}
        </div>

        {live.length > 0 && (
          <div>
            <SectionLabel>Live Now</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {live.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} />)}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <SectionLabel>Starting Soon</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {upcoming.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} />)}
            </div>
          </div>
        )}

        {ended.length > 0 && (
          <div>
            <SectionLabel>Recently Concluded</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {ended.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>{children}</div>;
}
