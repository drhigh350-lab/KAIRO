import { useState } from 'react';
import { MissionCard, Card, Button, AvoidanceInterventionModal } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { getEngine, getInsightsSummary, getStreakStatus, reportSprintDodged, type DashboardOption } from '../../lib/kairoEngine';
import { getPinnedDashboardOptions } from '../../lib/dailyRecommendation';
import { generateMentorCopy } from '../../lib/mentorCopyGenerator';
import { AVOIDANCE_STREAK_THRESHOLD } from '../../lib/dashboardDisplayConstants';

export interface PracticeHomeProps {
  onBack: () => void;
  onStartSuggested: () => void;
  /** Kairo V1 2-Option Dashboard — start a real session from the exact tapped Primary/Secondary DashboardOption. Falls back to onStartSuggested above when nothing is eligible (mirrors HomeDashboard.tsx's identical fallback). */
  onStartDashboard: (option: DashboardOption) => void;
  onBySubject: () => void;
  onByTopic: () => void;
  onMixed: () => void;
  onWeak: () => void;
  /** Present when a Practice session was left mid-way (Quick Resume, Practice Module §2.5/§3.2) — null when there's nothing to resume. */
  resumeSummary?: { subjectLabel: string; topic: string | null; questionsDone: number; questionsTotal: number } | null;
  onResume?: () => void;
}

const quickActions = [
  { key: 'subject', label: 'Subject Practice', benefit: 'Build depth in one subject at a time.' },
  { key: 'topic', label: 'Topic Practice', benefit: 'Go deep on exactly the topic you need.' },
  { key: 'mixed', label: 'Mixed Practice', benefit: 'Simulate the real spread of exam day.' },
  { key: 'weak', label: 'Weak Areas', benefit: "Fix what's actually costing you marks." },
] as const;

/**
 * Practice Home — the landing screen when a student taps the Practice tab
 * directly (Practice Module Spec §3), rather than a bare subject picker.
 * A student should never have to choose from a menu to begin (§2.1) — the
 * Recommended Mission is the primary action; Quick Actions are for a
 * student who wants to override that default.
 */
export function PracticeHome({ onBack, onStartSuggested, onStartDashboard, onBySubject, onByTopic, onMixed, onWeak, resumeSummary, onResume }: PracticeHomeProps) {
  const insights = getInsightsSummary();
  const streak = getStreakStatus();
  const profile = getEngine()?.profile;
  const sessions: { subject?: string; topic?: string; questionsAnswered?: number; correctCount?: number; completedAt?: number }[] = profile?.sessions || [];
  const recent = [...sessions].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)).slice(0, 5);
  const subjectHealth = insights?.strengths ?? [];

  const actionHandlers: Record<(typeof quickActions)[number]['key'], () => void> = {
    subject: onBySubject,
    topic: onByTopic,
    mixed: onMixed,
    weak: onWeak,
  };

  // Kairo V1 2-Option Dashboard — same pinned read + Mentor Copy Generator
  // Home's MissionCard uses, so Practice Home's own recommendation card
  // (previously fully static — "Start Practising" / "Kairo builds this
  // from your check-in and recent activity", regardless of real engine
  // state) actually reflects it too.
  const dashboardOptions = getPinnedDashboardOptions();
  const primaryOption = dashboardOptions?.primary ?? null;
  const secondaryOption = dashboardOptions?.secondary ?? null;
  const avoidanceActive = !!(
    primaryOption?.type === 'focused_sprint' &&
    primaryOption.subject &&
    (profile?.avoidanceStreaks?.[primaryOption.subject] ?? 0) >= AVOIDANCE_STREAK_THRESHOLD
  );
  const mentorCopy = generateMentorCopy(primaryOption, secondaryOption, avoidanceActive);
  const [avoidanceIntervention, setAvoidanceIntervention] = useState<{ text: string; targetOption: DashboardOption } | null>(null);

  function handlePrimaryStart() {
    if (primaryOption) onStartDashboard(primaryOption);
    else onStartSuggested();
  }

  function handleSecondaryStart() {
    if (!secondaryOption) return;
    if (primaryOption?.type === 'focused_sprint' && primaryOption.subject) {
      const { thresholdCrossed, kaiMessage } = reportSprintDodged(primaryOption.subject);
      if (thresholdCrossed && kaiMessage) {
        setAvoidanceIntervention({ text: kaiMessage.text, targetOption: primaryOption });
        return;
      }
    }
    onStartDashboard(secondaryOption);
  }

  function handleInterventionAcknowledge() {
    if (!avoidanceIntervention) return;
    const target = avoidanceIntervention.targetOption;
    setAvoidanceIntervention(null);
    onStartDashboard(target);
  }

  function handleInterventionDismiss() {
    setAvoidanceIntervention(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Practice" tone="dark" />
      <div style={{ padding: '4px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {resumeSummary && onResume && (
          <Card style={{ background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-accent-blue)', boxShadow: 'none' }}>
            <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--dark-accent-blue)', fontWeight: 700 }}>CONTINUE WHERE YOU LEFT OFF</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)', marginTop: 8 }}>
              {resumeSummary.subjectLabel}{resumeSummary.topic ? ` · ${resumeSummary.topic}` : ''}
            </div>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>
              {resumeSummary.questionsDone} of {resumeSummary.questionsTotal} done
            </div>
            <div style={{ marginTop: 14 }}>
              <Button variant="darkAccent" size="md" fullWidth onClick={onResume}>Resume Session</Button>
            </div>
          </Card>
        )}

        <MissionCard
          badge="Recommended"
          title={mentorCopy.title}
          reason={mentorCopy.body}
          chips={['≈5 min', 'Adaptive']}
          ctaLabel={mentorCopy.primary_button}
          onStart={handlePrimaryStart}
          secondary={secondaryOption && mentorCopy.secondary_button ? { label: mentorCopy.secondary_button, onStart: handleSecondaryStart } : undefined}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {quickActions.map((q) => (
            <button type="button" key={q.key} onClick={actionHandlers[q.key]} style={{
              textAlign: 'left', padding: '14px 14px', borderRadius: 'var(--radius-md)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
              border: '1.5px solid var(--dark-border)', background: 'var(--dark-bg-surface)', color: 'var(--dark-text-body)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{q.label}</span>
              <span style={{ fontSize: 12, color: 'var(--dark-text-muted)', lineHeight: 1.4 }}>{q.benefit}</span>
            </button>
          ))}
        </div>

        {/*
          The total Kairo Score is deliberately restricted to Home, Profile,
          and Insights — Practice Home doesn't repeat it, so this card only
          ever shows Streak/subject-health, never the score itself.
        */}
        {(streak || subjectHealth[0]) && (
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', gap: 18 }}>
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

      {avoidanceIntervention && (
        <AvoidanceInterventionModal
          text={avoidanceIntervention.text}
          onAcknowledge={handleInterventionAcknowledge}
          onDismiss={handleInterventionDismiss}
        />
      )}
    </div>
  );
}
