import { Badge, Card, StreakBadge } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { Challenge } from './data';
import { getStreakStatus } from '../../lib/kairoEngine';

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

function ChallengeCard({ challenge, onSelect }: { challenge: Challenge; onSelect: (id: string) => void }) {
  const style = accentStyle(challenge.accent);
  const onGradient = challenge.accent === 'navy';
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
      <div style={{ fontSize: 12, fontWeight: 600, color: onGradient ? 'rgba(255,255,255,0.85)' : 'var(--dark-text-muted)' }}>
        {challenge.questionCount} question{challenge.questionCount === 1 ? '' : 's'} · {scoringLabel[challenge.scoringFormula]}
      </div>
    </Card>
  );
}

export function ChallengesHub({ loading, challenges, onBack, onSelect }: ChallengesHubProps) {
  const live = challenges.filter((c) => c.status === 'live');
  const upcoming = challenges.filter((c) => c.status === 'upcoming');
  const ended = challenges.filter((c) => c.status === 'ended');
  const streak = getStreakStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
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
              {live.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} />)}
            </div>
          </div>
        )}

        {!loading && upcoming.length > 0 && (
          <div>
            <SectionLabel>Starting Soon</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {upcoming.map((c) => <ChallengeCard key={c.id} challenge={c} onSelect={onSelect} />)}
            </div>
          </div>
        )}

        {!loading && ended.length > 0 && (
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
  return <div style={{ fontWeight: 700, color: 'var(--dark-text-heading)', fontSize: 15 }}>{children}</div>;
}
