import { useNavigate } from 'react-router-dom';
import { Badge, Card, IconButton, KaiMessage, ProgressBar } from '../../components';
import { BackIcon } from '../learning/shared';

interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXP: number;
  progress: number;
  completed: boolean;
}

const daily: Challenge[] = [
  { id: 'daily_5_reinforced', title: 'Memory Keeper', description: 'Move 2 concepts from Fading to Reinforced today', rewardXP: 50, progress: 50, completed: false },
  { id: 'daily_consistency', title: 'Steady Rhythm', description: 'Complete one session today', rewardXP: 20, progress: 100, completed: true },
  { id: 'daily_weakness', title: 'Face the Fear', description: 'Practice 5 questions from your weakest topic', rewardXP: 40, progress: 60, completed: false },
];

const weekly: Challenge[] = [
  { id: 'weekly_3_subjects', title: 'Balanced Scholar', description: 'Practice in 3 different subjects this week', rewardXP: 100, progress: 67, completed: false },
  { id: 'weekly_perfect_day', title: 'Clean Sheet', description: 'Achieve 90%+ accuracy in a single session of 15+ questions', rewardXP: 80, progress: 89, completed: false },
  { id: 'weekly_streak', title: 'Unbroken', description: 'Maintain momentum for 5 days this week', rewardXP: 75, progress: 80, completed: false },
];

const special: Challenge[] = [
  { id: 'special_night_owl', title: 'Night Owl', description: 'Complete 3 sessions after 10 PM', rewardXP: 60, progress: 33, completed: false },
];

const totalXPEarned = 320;

export function Challenges() {
  const navigate = useNavigate();
  const dailyCompleted = daily.filter((c) => c.completed).length;
  const weeklyCompleted = weekly.filter((c) => c.completed).length;

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconButton onClick={() => navigate(-1)} ariaLabel="Back"><BackIcon /></IconButton>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)', flex: 1 }}>Challenges</div>
        <Badge tone="gold">{totalXPEarned} XP earned</Badge>
      </div>

      <Card style={{ background: 'var(--kairo-blue-100)' }}>
        <KaiMessage compact>"Challenges reward the habits that actually move your score — not just showing up."</KaiMessage>
      </Card>

      <ChallengeSection title="Today" completed={dailyCompleted} total={daily.length} items={daily} />
      <ChallengeSection title="This Week" completed={weeklyCompleted} total={weekly.length} items={weekly} />

      <div>
        <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>Special</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {special.map((c) => <ChallengeCard key={c.id} challenge={c} tone="special" />)}
        </div>
      </div>
    </div>
  );
}

function ChallengeSection({ title, completed, total, items }: { title: string; completed: number; total: number; items: Challenge[] }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>{title}</div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{completed}/{total} done</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        {items.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, tone = 'default' }: { challenge: Challenge; tone?: 'default' | 'special' }) {
  const { title, description, rewardXP, progress, completed } = challenge;
  const dark = tone === 'special';
  return (
    <Card style={{
      background: dark ? 'var(--kairo-navy-900)' : '#fff',
      opacity: completed && !dark ? 0.75 : 1,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {completed && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--state-success)" strokeWidth="3">
                <circle cx="12" cy="12" r="10" fill="var(--state-success-bg)" stroke="none" />
                <path d="M8 12l3 3 5-6" />
              </svg>
            )}
            <div style={{ fontWeight: 700, fontSize: 15, color: dark ? '#fff' : 'var(--text-heading)' }}>{title}</div>
          </div>
          <div style={{ fontSize: 13, color: dark ? 'var(--kairo-blue-200)' : 'var(--text-muted)', marginTop: 4 }}>{description}</div>
        </div>
        <Badge tone={completed ? 'success' : 'gold'}>+{rewardXP} XP</Badge>
      </div>
      <ProgressBar value={progress} tone={dark ? 'light' : progress >= 100 ? 'blue' : 'gold'} />
    </Card>
  );
}
