import { Card, ProgressBar, ScoreBadge } from '../../components';
import { getInsightsSummary, getWeeklyReviewSummary } from '../../lib/kairoEngine';

const trendCopy: Record<string, string> = {
  rising: "Your score moved up mostly because you're getting harder questions right more often, not just more questions overall.",
  falling: "Your score dipped a little — that's normal after a tougher session. Keep showing up.",
  stable: 'Your score is holding steady. Consistency like this is what compounds over time.',
  insufficient_data: "I'll be able to show a trend once you've completed a few more sessions.",
};

export function Insights() {
  const insights = getInsightsSummary();
  const weekly = getWeeklyReviewSummary();
  const hasScore = !!insights?.eliteScore;
  const subjectHealth = insights?.strengths ?? [];

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Insights</div>

      {hasScore ? (
        <Card style={{ textAlign: 'center' }}>
          <ScoreBadge score={insights.eliteScore} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>{trendCopy[insights.scoreTrend] ?? trendCopy.insufficient_data}</div>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Your picture is just getting started — this fills in as you practise.</div>
        </Card>
      )}

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>This Week</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          {weekly && weekly.sessionCount > 0
            ? `You showed up ${weekly.sessionCount} time${weekly.sessionCount === 1 ? '' : 's'} this week — that's the rhythm that moves your score.`
            : 'No sessions yet this week — your first one will show up here.'}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Reinforced</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-heading)' }}>{weekly?.reinforced.length ?? 0}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Score trend</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--state-success)', textTransform: 'capitalize' }}>{insights?.scoreTrend?.replace('_', ' ') ?? 'Not enough data'}</div>
          </div>
        </div>
      </Card>

      {subjectHealth.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>Subject Health</div>
          {subjectHealth.map(({ subject, masteryPct }: { subject: string; masteryPct: number }) => (
            <div key={subject} style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-body)', marginBottom: 6 }}><span>{subject}</span></div>
              <ProgressBar value={masteryPct} tone={masteryPct < 60 ? 'gold' : 'blue'} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
