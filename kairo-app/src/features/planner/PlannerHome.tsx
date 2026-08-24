import { useState } from 'react';
import { Button } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { PlannedTopic, PlannerPlan } from '../../lib/planner/plannerEngine';
import { getWeekForDate, toLocalIso } from '../../lib/planner/plannerEngine';
import type { PlannerState } from '../../lib/planner/plannerApi';
import type { DueTopic } from '../../lib/planner/plannerSrs';
import { PlannerRoadmap } from './PlannerRoadmap';

type PlannerView = 'week' | 'roadmap';

/** Batch 3's two-way toggle — a plain local segment picker, not a route, since both views read off the same already-loaded plan/state. */
function ViewToggle({ view, onChange }: { view: PlannerView; onChange: (v: PlannerView) => void }) {
  const segments: { key: PlannerView; label: string }[] = [{ key: 'week', label: 'This Week' }, { key: 'roadmap', label: 'Full Roadmap' }];
  return (
    <div style={{ display: 'flex', padding: 3, borderRadius: 'var(--radius-pill)', background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-border)' }}>
      {segments.map((s) => {
        const active = view === s.key;
        return (
          <button key={s.key} type="button" onClick={() => onChange(s.key)} style={{
            flex: 1, padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
            background: active ? 'var(--kairo-gold-500)' : 'transparent',
            color: active ? 'var(--kairo-navy-900)' : 'var(--dark-text-muted)',
            transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast)',
          }}>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export interface PlannerHomeProps {
  onBack: () => void;
  onAdjustPlan: () => void;
  plan: PlannerPlan;
  state: PlannerState;
  pinnedRecommendation: DueTopic | null;
  /** Checks/unchecks a topic — parent owns the persisted key set so this component can stay a plain render of whatever it's given. */
  onToggleTopic: (topic: PlannedTopic, done: boolean) => void;
  /** Launches the strictly-scoped 10-question Verification Session for one topic — bypasses every picker screen (Batch 2's "Trust, but Verify" loop). */
  onStartVerification: (topic: PlannedTopic) => void;
}

/** A dark-tone checkbox row — the shared Checkbox component is light-only (hardcoded light border/label colors), so this stays a small local inline treatment rather than fighting it, matching how the rest of the dark screens (HomeDashboard, ExamSetup) build their own inline-styled interactive rows instead of reusing light-toned primitives. */
function DarkCheckboxLabel({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange} aria-pressed={checked} style={{
      display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: `2px solid ${checked ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
        background: checked ? 'var(--dark-accent-blue)' : 'transparent', transition: 'all var(--dur-fast)',
      }}>
        {checked && <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5L4.5 8.5L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{label}</span>
    </button>
  );
}

/** Batch 2's open-loop indicator: a topic that's checked done but hasn't been through the Verification Session yet — quiet enough not to nag, but present enough that "done" never quietly reads as "verified." */
function PendingVerificationTag() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: 'var(--kairo-gold-500)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--kairo-gold-500)', flexShrink: 0 }} />
      Pending Verification
    </span>
  );
}

function TopicRow({
  topic, done, pending, justCompleted, onToggle, onStartVerification, onDismissCta,
}: {
  topic: PlannedTopic; done: boolean; pending: boolean; justCompleted: boolean;
  onToggle: (done: boolean) => void;
  onStartVerification: () => void;
  onDismissCta: () => void;
}) {
  return (
    <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <DarkCheckboxLabel checked={done} onChange={() => onToggle(!done)} label={topic.topicTitle} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-text-faint)', whiteSpace: 'nowrap' }}>{topic.subjectName}</span>
          {done && pending && !justCompleted && <PendingVerificationTag />}
        </div>
      </div>
      {justCompleted && (
        <div style={{ padding: '14px 16px', background: 'var(--dark-bg-elevated)', borderTop: '1px solid var(--dark-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--dark-text-heading)', lineHeight: 1.4 }}>
            Topic Completed. Take a 5-minute quiz to lock it in.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="gold" size="sm" onClick={onStartVerification}>Start Quiz</Button>
            <Button variant="ghost" size="sm" onClick={onDismissCta}>Not now</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const TIER_COPY: Record<DueTopic['tier'], { title: string; detail: string }> = {
  critical: { title: 'Critical Gap', detail: 'You scored below 50% here — this needs another pass before moving on.' },
  forming: { title: 'Due for Review', detail: "You're still forming this one — a quick pass keeps it from fading." },
  mastery: { title: 'Scheduled Review', detail: 'A spaced check-in on something you already mastered.' },
};

/** The Study Planner's main screen — this week's checklist plus the pinned recommendation from Batch 3's tiered SRS. Reachable topics are read straight off the current week; the recommendation banner is independent of "this week" since a due resurface can span weeks the student ignored the plan for. */
export function PlannerHome({ onBack, onAdjustPlan, plan, state, pinnedRecommendation, onToggleTopic, onStartVerification }: PlannerHomeProps) {
  const [justCompletedKey, setJustCompletedKey] = useState<string | null>(null);
  const [view, setView] = useState<PlannerView>('week');
  const todayIso = toLocalIso(new Date());
  const week = getWeekForDate(plan, todayIso);
  const completed = new Set(state.completedTopicKeys);
  const pending = new Set(state.pendingVerificationKeys);
  const weekDoneCount = week ? week.topics.filter((t) => completed.has(t.key)).length : 0;

  const allTopicsByKey = new Map<string, PlannedTopic>();
  for (const w of plan.weeks) {
    for (const t of [...w.topics, ...w.reviewTopics]) allTopicsByKey.set(t.key, t);
  }
  const recommendedTopic = pinnedRecommendation ? allTopicsByKey.get(pinnedRecommendation.topicKey) : null;
  // Prerequisite Fallback: pinnedRecommendation.topicKey is the earlier
  // topic being routed to, not the one that actually failed Verification —
  // rerouteFromKey names that original topic, for the "why am I seeing
  // this" copy below.
  const rerouteFromTopic = pinnedRecommendation?.rerouteFromKey ? allTopicsByKey.get(pinnedRecommendation.rerouteFromKey) : null;

  function handleToggle(topic: PlannedTopic, done: boolean) {
    onToggleTopic(topic, done);
    setJustCompletedKey(done ? topic.key : null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader
        onBack={onBack}
        title="Study Planner"
        tone="dark"
        right={(
          <button type="button" onClick={onAdjustPlan} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)' }}>
            Adjust
          </button>
        )}
      />
      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ViewToggle view={view} onChange={setView} />

        {view === 'roadmap' && <PlannerRoadmap plan={plan} completed={completed} pending={pending} />}

        {view === 'week' && (
          <>
        {pinnedRecommendation && recommendedTopic && (
          <div style={{
            borderRadius: 'var(--radius-lg)', padding: 18,
            background: pinnedRecommendation.isCriticalGap ? 'var(--dark-danger-bg, #3a1414)' : 'var(--dark-bg-elevated)',
            border: `1.5px solid ${pinnedRecommendation.isCriticalGap ? 'var(--dark-danger, #e5484d)' : 'var(--dark-accent-blue)'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: pinnedRecommendation.isCriticalGap ? 'var(--dark-danger, #e5484d)' : 'var(--dark-accent-blue)', marginBottom: 6 }}>
              {rerouteFromTopic ? 'PREREQUISITE GAP' : TIER_COPY[pinnedRecommendation.tier].title.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--dark-text-heading)' }}>{recommendedTopic.topicTitle}</div>
            <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 4, lineHeight: 1.4 }}>
              {rerouteFromTopic
                ? `You scored below 50% on "${rerouteFromTopic.topicTitle}" — it depends on this topic, so let's shore it up first.`
                : TIER_COPY[pinnedRecommendation.tier].detail}
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant={pinnedRecommendation.isCriticalGap ? 'danger' : 'darkAccent'} size="sm" onClick={() => onStartVerification(recommendedTopic)}>
                Start Verification
              </Button>
            </div>
          </div>
        )}

        {week && week.topics.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 10 }}>
              THIS WEEK <span style={{ color: 'var(--dark-text-faint)', fontWeight: 700 }}>({weekDoneCount}/{week.topics.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {week.topics.map((t) => (
                <TopicRow
                  key={t.key}
                  topic={t}
                  done={completed.has(t.key)}
                  pending={pending.has(t.key)}
                  justCompleted={justCompletedKey === t.key}
                  onToggle={(done) => handleToggle(t, done)}
                  onStartVerification={() => { setJustCompletedKey(null); onStartVerification(t); }}
                  onDismissCta={() => setJustCompletedKey(null)}
                />
              ))}
            </div>
          </div>
        )}

        {week && week.reviewTopics.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 10 }}>
              {week.isReviewWeek ? 'REVIEW WEEK' : 'SPACED REVIEW'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {week.reviewTopics.map((t) => (
                <TopicRow
                  key={`${t.key}-review`}
                  topic={t}
                  done={completed.has(t.key)}
                  pending={pending.has(t.key)}
                  justCompleted={justCompletedKey === `${t.key}-review`}
                  onToggle={(done) => { onToggleTopic(t, done); setJustCompletedKey(done ? `${t.key}-review` : null); }}
                  onStartVerification={() => { setJustCompletedKey(null); onStartVerification(t); }}
                  onDismissCta={() => setJustCompletedKey(null)}
                />
              ))}
            </div>
          </div>
        )}

        {week && week.topics.length === 0 && week.reviewTopics.length === 0 && (
          <div style={{ fontSize: 13.5, color: 'var(--dark-text-muted)', textAlign: 'center', padding: '40px 20px' }}>
            Nothing scheduled for this week — check back once your plan's next week starts.
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
