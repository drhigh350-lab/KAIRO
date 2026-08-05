import { MissionCard, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { getEngine, getInsightsSummary, getStreakStatus } from '../../lib/kairoEngine';

export interface PracticeHomeProps {
  onBack: () => void;
  onStartSuggested: () => void;
  onBySubject: () => void;
  onByTopic: () => void;
  onMixed: () => void;
  onWeak: () => void;
}

const quickActions = [
  { key: 'subject', label: 'By Subject' },
  { key: 'topic', label: 'By Topic' },
  { key: 'mixed', label: 'Mixed Practice' },
  { key: 'weak', label: 'Weak Areas' },
] as const;

/**
 * Practice Home — the landing screen when a student taps the Practice tab
 * directly (Practice Module Spec §3), rather than a bare subject picker.
 * A student should never have to choose from a menu to begin (§2.1) — the
 * Recommended Mission is the primary action; Quick Actions are for a
 * student who wants to override that default.
 */
export function PracticeHome({ onBack, onStartSuggested, onBySubject, onByTopic, onMixed, onWeak }: PracticeHomeProps) {
  const insights = getInsightsSummary();
  const streak = getStreakStatus();
  const sessions: { subject?: string; topic?: string; questionsAnswered?: number; correctCount?: number; completedAt?: number }[] = getEngine()?.profile?.sessions || [];
  const recent = [...sessions].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)).slice(0, 5);
  const subjectHealth = insights?.strengths ?? [];

  const actionHandlers: Record<(typeof quickActions)[number]['key'], () => void> = {
    subject: onBySubject,
    topic: onByTopic,
    mixed: onMixed,
    weak: onWeak,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Practice" tone="dark" />
      <div style={{ padding: '4px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <MissionCard
          badge="Recommended"
          title="Start Practising"
          reason="Kairo builds this from your check-in and recent activity — adaptive from here."
          chips={['≈5 min', 'Adaptive']}
          ctaLabel="Start Session"
          onStart={onStartSuggested}
        />

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {quickActions.map((q) => (
            <button type="button" key={q.key} onClick={actionHandlers[q.key]} style={{
              flexShrink: 0, padding: '10px 16px', borderRadius: 'var(--radius-pill)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
              border: '1.5px solid var(--dark-border)', background: 'var(--dark-bg-surface)', color: 'var(--dark-text-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{q.label}</button>
          ))}
        </div>

        {(insights?.eliteScore || streak) && (
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', gap: 18 }}>
            {insights?.eliteScore != null && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Kairo Score</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)', marginTop: 2 }}>{insights.eliteScore}</div>
              </div>
            )}
            {streak && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Streak</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)', marginTop: 2 }}>{streak.momentum} day{streak.momentum === 1 ? '' : 's'}</div>
              </div>
            )}
            {subjectHealth[0] && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{subjectHealth[0].subject}</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)', marginTop: 2 }}>{subjectHealth[0].masteryPct}%</div>
              </div>
            )}
          </Card>
        )}

        {recent.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recent.map((s, i) => (
                <Card key={i} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{s.subject || 'Mixed'}{s.topic ? ` · ${s.topic}` : ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>
                      {s.correctCount ?? 0}/{s.questionsAnswered ?? 0} correct
                    </div>
                  </div>
                  {s.completedAt && <div style={{ fontSize: 11, color: 'var(--dark-text-faint)' }}>{new Date(s.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
