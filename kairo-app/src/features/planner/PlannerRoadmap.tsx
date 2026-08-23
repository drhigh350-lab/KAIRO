import { useState } from 'react';
import { Card, Badge } from '../../components';
import { getSubjects } from '../../lib/planner/syllabus';
import { flattenSubjectTopics, type PlannedTopic, type PlannerPlan } from '../../lib/planner/plannerEngine';

interface PhaseGroup {
  key: string;
  subjectName: string;
  stageOrder: number;
  stageName: string;
  topics: PlannedTopic[];
}

/**
 * Groups the *complete* Blueprint each chosen subject is responsible for (from its own
 * startingStageIndex onward — flattenSubjectTopics, the same function buildPlan() itself uses) by
 * real TECHMED stage, not the trimmed subset that actually made it into the schedule. A subject
 * short on time (see PlannerPlan.warnings) still shows its whole roadmap here — the point of this
 * view is "everything ahead," which a coverage warning shouldn't quietly hide.
 */
function buildPhaseGroups(plan: PlannerPlan): PhaseGroup[] {
  const subjectsBySlug = new Map(getSubjects().map((s) => [s.slug, s]));
  const groups: PhaseGroup[] = [];
  for (const subjectInput of plan.input.subjects) {
    const subject = subjectsBySlug.get(subjectInput.slug);
    if (!subject) continue;
    const topics = flattenSubjectTopics(subject, subjectInput.startingStageIndex);
    const byStage = new Map<number, PhaseGroup>();
    for (const topic of topics) {
      let group = byStage.get(topic.stageOrder);
      if (!group) {
        group = { key: `${subject.slug}::${topic.stageOrder}`, subjectName: subject.name, stageOrder: topic.stageOrder, stageName: topic.stageName, topics: [] };
        byStage.set(topic.stageOrder, group);
      }
      group.topics.push(topic);
    }
    groups.push(...[...byStage.values()].sort((a, b) => a.stageOrder - b.stageOrder));
  }
  return groups;
}

function TopicStatusRow({ topic, verified, pendingVerification }: { topic: PlannedTopic; verified: boolean; pendingVerification: boolean }) {
  const dotColor = verified ? 'var(--dark-success, #2ecc8f)' : pendingVerification ? 'var(--kairo-gold-500)' : 'var(--dark-text-faint)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: verified || pendingVerification ? 'var(--dark-text-body)' : 'var(--dark-text-faint)', flex: 1 }}>{topic.topicTitle}</span>
      {pendingVerification && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--kairo-gold-500)', whiteSpace: 'nowrap' }}>Pending</span>}
    </div>
  );
}

/** Batch 3's Full Roadmap: a flat list of collapsible (subject, Blueprint stage) accordions — deliberately not nested subject-then-stage, and collapsed by default, so the whole syllabus doesn't read as one long scroll. */
export function PlannerRoadmap({ plan, completed, pending }: { plan: PlannerPlan; completed: Set<string>; pending: Set<string> }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const groups = buildPhaseGroups(plan);

  if (groups.length === 0) {
    return (
      <div style={{ fontSize: 13.5, color: 'var(--dark-text-muted)', textAlign: 'center', padding: '40px 20px' }}>
        Your roadmap will show up here once your plan's subjects are set.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {groups.map((g) => {
        const doneCount = g.topics.filter((t) => completed.has(t.key)).length;
        const isOpen = expandedKey === g.key;
        return (
          <Card key={g.key} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 0 }}>
            <button type="button" onClick={() => setExpandedKey(isOpen ? null : g.key)} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>{g.subjectName}</div>
                <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4, maxWidth: 240 }}>{g.stageName}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge tone="darkNeutral">{doneCount}/{g.topics.length} Topics Completed</Badge>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--dark-border)' }}>
                {g.topics.map((t) => (
                  <TopicStatusRow key={t.key} topic={t} verified={completed.has(t.key) && !pending.has(t.key)} pendingVerification={pending.has(t.key)} />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
