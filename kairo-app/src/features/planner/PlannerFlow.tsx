import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlannerSetup } from './PlannerSetup';
import { PlannerHome } from './PlannerHome';
import { getSubjects } from '../../lib/planner/syllabus';
import { toLocalIso, type PlannedTopic, type PlannerInput, type PlannerPlan } from '../../lib/planner/plannerEngine';
import { loadCurrentPlan, saveAndBuildPlan, markTopicComplete, getPinnedRecommendation, type PlannerState, type DueTopic } from '../../lib/planner/plannerApi';
import { getEngine } from '../../lib/kairoEngine';

type Screen = 'loading' | 'setup' | 'home';

/** Controller for the Study Planner: setup (once) -> home (weekly checklist + Batch 3's pinned recommendation), mirroring the simple screen-stack pattern CbtFlow/RapidFireFlow already use. */
export function PlannerFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('loading');
  const [plan, setPlan] = useState<PlannerPlan | null>(null);
  const [state, setState] = useState<PlannerState | null>(null);
  const [pinned, setPinned] = useState<DueTopic | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const current = await loadCurrentPlan();
    if (!current) {
      setPlan(null);
      setScreen('setup');
      return;
    }
    setPlan(current.plan);
    setState(current.state);
    setPinned(await getPinnedRecommendation());
    setScreen('home');
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toHome = () => navigate('/home');

  async function handleSetupSubmit(input: PlannerInput) {
    setSubmitting(true);
    try {
      await saveAndBuildPlan(input);
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleTopic(topic: PlannedTopic, done: boolean) {
    if (!state) return;
    const completedTopicKeys = await markTopicComplete(topic.key, done);
    setState({ ...state, completedTopicKeys });
  }

  /** Bypasses every custom-configuration modal (subject/topic/subtopic pickers) — the Batch 2 "Trust, but Verify" loop launches straight into a scoped 10-question session on this exact topic. */
  function handleStartVerification(topic: PlannedTopic) {
    navigate('/practice', {
      state: { entry: 'verify', subjectLabel: topic.subjectName, topic: topic.topicTitle, plannerTopicKey: topic.key },
    });
  }

  if (screen === 'setup') {
    const kairo = getEngine();
    const profile = kairo?.profile;
    const allSubjects = getSubjects();
    const targetSubjectNames: string[] = profile?.targetSubjects ?? [];
    const defaultSelectedSlugs = allSubjects.filter((s) => targetSubjectNames.includes(s.name)).map((s) => s.slug);
    const defaultTargetDateIso = profile?.examDate ? toLocalIso(new Date(profile.examDate)) : null;
    return (
      <PlannerSetup
        onBack={plan ? () => setScreen('home') : toHome}
        onSubmit={handleSetupSubmit}
        allSubjects={allSubjects}
        defaultSelectedSlugs={defaultSelectedSlugs}
        defaultTargetDateIso={defaultTargetDateIso}
        submitting={submitting}
      />
    );
  }

  if (screen === 'home' && plan && state) {
    return (
      <PlannerHome
        onBack={toHome}
        onAdjustPlan={() => setScreen('setup')}
        plan={plan}
        state={state}
        pinnedRecommendation={pinned}
        onToggleTopic={handleToggleTopic}
        onStartVerification={handleStartVerification}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Loading your plan…</div>
    </div>
  );
}
