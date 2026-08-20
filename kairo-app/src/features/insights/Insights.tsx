import { useEffect, useState } from 'react';
import { Card, ProgressBar, ScoreBadge } from '../../components';
import { getInsightsSummary, getWeeklyReviewSummary, getMonthlyWrapped } from '../../lib/kairoEngine';
import { generateKaiText } from '../../lib/kaiAi';
import { KairoScoreInfo } from '../learning/shared';

const trendCopy: Record<string, string> = {
  rising: "Your score moved up mostly because you're getting harder questions right more often, not just more questions overall.",
  falling: "Your score dipped a little — that's normal after a tougher session. Keep showing up.",
  stable: 'Your score is holding steady. Consistency like this is what compounds over time.',
  insufficient_data: "I'll be able to show a trend once you've completed a few more sessions.",
};

export function Insights() {
  const insights = getInsightsSummary();
  const weekly = getWeeklyReviewSummary();
  const monthly = getMonthlyWrapped();
  const hasScore = !!insights?.eliteScore;
  const subjectHealth = insights?.strengths ?? [];
  const reinforcedNames: string[] = weekly?.reinforced?.map((c: { name: string }) => c.name) ?? [];
  const hasMonthlyStory = !!monthly && (monthly.reinforcedCount > 0 || monthly.biggestTurnaround || monthly.totalSessions > 0);

  // Both reflections already have a real, template-generated Kai note
  // (weekly.kaiNote) or no note at all (monthly has none yet) — this
  // quietly upgrades to a freshly-generated version in Kai's voice once
  // Gemini responds, using only the same already-computed facts. Nothing
  // on screen ever depends on this call succeeding.
  const [weeklyKaiNote, setWeeklyKaiNote] = useState<string | null>(weekly?.kaiNote ?? null);
  const [monthlyKaiNote, setMonthlyKaiNote] = useState<string | null>(null);

  useEffect(() => {
    setWeeklyKaiNote(weekly?.kaiNote ?? null);
    if (!weekly || !weekly.sessionCount) return;
    let cancelled = false;
    generateKaiText('weekly_reflection', {
      reinforced: (weekly.reinforced ?? []).map((c: { name: string; subject?: string }) => ({ name: c.name, subject: c.subject })),
      fading: (weekly.fading ?? []).map((c: { name: string; subject?: string }) => ({ name: c.name, subject: c.subject })),
      patternObservation: weekly.patternObservation ?? null,
      sessionCount: weekly.sessionCount,
    }).then((text) => {
      if (!cancelled && text) setWeeklyKaiNote(text);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekly?.timestamp]);

  useEffect(() => {
    setMonthlyKaiNote(null);
    if (!hasMonthlyStory) return;
    let cancelled = false;
    generateKaiText('monthly_wrapped', {
      totalSessions: monthly.totalSessions,
      totalQuestions: monthly.totalQuestions,
      reinforcedCount: monthly.reinforcedCount,
      reinforcedNames: monthly.reinforcedNames ?? [],
      biggestTurnaround: monthly.biggestTurnaround ?? null,
      scoreTrend: monthly.scoreTrend ?? null,
    }).then((text) => {
      if (!cancelled && text) setMonthlyKaiNote(text);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMonthlyStory, monthly?.timestamp]);

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)' }}>Insights</div>

      {/* Desktop (>=900px): the reflective, narrative cards (This Week,
          Kairo Wrapped) as the main column, the at-a-glance numbers
          (score, subject health) as a sticky sidebar — reading vs.
          scanning, rather than one long stacked column. */}
      <div className="desktop-grid">
        <div className="desktop-main">
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)' }}>This Week</div>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>
              {weekly && weekly.sessionCount > 0
                ? `You showed up ${weekly.sessionCount} time${weekly.sessionCount === 1 ? '' : 's'} this week — that's the rhythm that moves your score.`
                : 'No sessions yet this week — your first one will show up here.'}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Reinforced</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)' }}>{weekly?.reinforced?.length ?? 0}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Score trend</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dark-success)', textTransform: 'capitalize' }}>{insights?.scoreTrend?.replace('_', ' ') ?? 'Not enough data'}</div>
              </div>
            </div>
            {reinforcedNames.length > 0 && (
              <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 12 }}>Including {reinforcedNames.slice(0, 3).join(', ')} — that's the hardest thing to fake.</div>
            )}
            {weeklyKaiNote && (
              <div style={{ fontSize: 13, color: 'var(--dark-text-body)', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--dark-border)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{weeklyKaiNote}</div>
            )}
          </Card>

          {hasMonthlyStory && (
            <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>THIS MONTH — KAIRO WRAPPED</div>
              <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Sessions</div>
                  <div style={{ fontWeight: 800, fontSize: 20, marginTop: 2 }}>{monthly.totalSessions}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Questions</div>
                  <div style={{ fontWeight: 800, fontSize: 20, marginTop: 2 }}>{monthly.totalQuestions}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Reinforced</div>
                  <div style={{ fontWeight: 800, fontSize: 20, marginTop: 2 }}>{monthly.reinforcedCount}</div>
                </div>
              </div>
              {monthly.biggestTurnaround && (
                <div style={{ fontSize: 13, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
                  Biggest turnaround this month: <strong>{monthly.biggestTurnaround.name}</strong> ({monthly.biggestTurnaround.subject}).
                </div>
              )}
              {monthlyKaiNote && (
                <div style={{ fontSize: 13, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.25)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{monthlyKaiNote}</div>
              )}
            </Card>
          )}
        </div>

        <div className="desktop-sidebar">
          {hasScore ? (
            <Card style={{ textAlign: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ScoreBadge dark score={insights.eliteScore} />
                <span style={{ marginLeft: 6, marginTop: 2 }}><KairoScoreInfo /></span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 12 }}>{trendCopy[insights.scoreTrend] ?? trendCopy.insufficient_data}</div>
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>Your picture is just getting started — this fills in as you practise.</div>
            </Card>
          )}

          {subjectHealth.length > 0 && (
            <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)' }}>Subject Health</div>
              {subjectHealth.map(({ subject, masteryPct }: { subject: string; masteryPct: number }) => (
                <div key={subject} style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--dark-text-body)', marginBottom: 6 }}><span>{subject}</span></div>
                  <ProgressBar value={masteryPct} tone={masteryPct < 60 ? 'gold' : 'dark'} />
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
