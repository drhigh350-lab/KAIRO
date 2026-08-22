import { useState } from 'react';
import { Button } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { PlannedTopic, PlannerPlan } from '../../lib/planner/plannerEngine';
import { getWeekForDate, toLocalIso } from '../../lib/planner/plannerEngine';
import type { PlannerState } from '../../lib/planner/plannerApi';
import type { DueTopic } from '../../lib/planner/plannerSrs';

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

function TopicRow({
  topic, done, justCompleted, onToggle, onStartVerification, onDismissCta,
}: {
  topic: PlannedTopic; done: boolean; justCompleted: boolean;
  onToggle: (done: boolean) => void;
  onStartVerification: () => void;
  onDismissCta: () => void;
}) {
  return (
    <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <DarkCheckboxLabel checked={done} onChange={() => onToggle(!done)} label={topic.topicTitle} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-text-faint)', whiteSpace: 'nowrap', marginTop: 2 }}>{topic.subjectName}</span>
      </div>
      {justCompleted && (
        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
            Topic Completed. Take a 5-minute quiz to lock it in.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" size="sm" onClick={onStartVerification}>Start Quiz</Button>
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
  const todayIso = toLocalIso(new Date());
  const week = getWeekForDate(plan, todayIso);
  const completed = new Set(state.completedTopicKeys);

  const allTopicsByKey = new Map<string, PlannedTopic>();
  for (const w of plan.weeks) {
    for (const t of [...w.topics, ...w.reviewTopics]) allTopicsByKey.set(t.key, t);
  }
  const recommendedTopic = pinnedRecommendation ? allTopicsByKey.get(pinnedRecommendation.topicKey) : null;

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
        {pinnedRecommendation && recommendedTopic && (
          <div style={{
            borderRadius: 'var(--radius-lg)', padding: 18,
            background: pinnedRecommendation.isCriticalGap ? 'var(--dark-danger-bg, #3a1414)' : 'var(--dark-bg-elevated)',
            border: `1.5px solid ${pinnedRecommendation.isCriticalGap ? 'var(--dark-danger, #e5484d)' : 'var(--dark-accent-blue)'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: pinnedRecommendation.isCriticalGap ? 'var(--dark-danger, #e5484d)' : 'var(--dark-accent-blue)', marginBottom: 6 }}>
              {TIER_COPY[pinnedRecommendation.tier].title.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--dark-text-heading)' }}>{recommendedTopic.topicTitle}</div>
            <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 4, lineHeight: 1.4 }}>{TIER_COPY[pinnedRecommendation.tier].detail}</div>
            <div style={{ marginTop: 12 }}>
              <Button variant={pinnedRecommendation.isCriticalGap ? 'danger' : 'darkAccent'} size="sm" onClick={() => onStartVerification(recommendedTopic)}>
                Start Verification
              </Button>
            </div>
          </div>
        )}

        {week && week.topics.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 10 }}>THIS WEEK</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {week.topics.map((t) => (
                <TopicRow
                  key={t.key}
                  topic={t}
                  done={completed.has(t.key)}
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
      </div>
    </div>
  );
}
