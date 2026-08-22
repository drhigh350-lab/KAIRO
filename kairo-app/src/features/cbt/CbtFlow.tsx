import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamSetup } from './ExamSetup';
import { ExamInstructions } from './ExamInstructions';
import { CbtExam } from './CbtExam';
import { CbtSummary, type CbtResults } from './CbtSummary';
import { CbtReview } from './CbtReview';
import { CbtHistory } from './CbtHistory';
import { startCbtExam, finishCbtExam, CBT_DEFAULT_SUBJECTS, type CbtPaperQuestion, type CbtExamType } from '../../lib/kairoEngine';
import { useBackIntercept } from '../../lib/useBackIntercept';
import { useSetBottomNavHidden } from '../../layout/AppTabs';
import { goHomeOrStreakSavior } from '../../lib/streakSavior';

type Screen = 'setup' | 'instructions' | 'starting' | 'exam' | 'summary' | 'review' | 'history';

// CBT's screens all share one route (/cbt/*), so the physical back button
// only ever sees one browser history entry for the whole flow — without
// this, pressing it (instead of a screen's own back arrow) skips straight
// past setup/instructions/history/review to wherever /cbt was entered from.
// 'exam' intentionally has nowhere to go (Section 5.11/2.3 — no casual way
// out of a live attempt); 'starting' is a transient load, also swallowed.
const SCREEN_DEPTH: Record<Screen, number> = {
  setup: 0,
  history: 1,
  instructions: 1,
  starting: 1,
  exam: 1,
  summary: 1,
  review: 2,
};

/** Controller for CBT Exam Mode: setup -> instructions -> exam -> summary -> review, driven by the real kairo.cbt (CBTExamMode) instance. */
export function CbtFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('setup');
  // Persistent bottom nav (AppTabs) hides for the live exam itself and the
  // brief 'starting' transition into it — both already treat a casual exit
  // as unavailable (see useBackIntercept below); every other CBT screen
  // (setup, instructions, history, summary, review) keeps the nav visible.
  useSetBottomNavHidden(screen === 'exam' || screen === 'starting');
  const [paper, setPaper] = useState<CbtPaperQuestion[]>([]);
  const [totalTimeMin, setTotalTimeMin] = useState(120);
  const [results, setResults] = useState<CbtResults | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const [examType, setExamType] = useState<CbtExamType>('full');
  const [subject, setSubject] = useState(CBT_DEFAULT_SUBJECTS[1]);
  const [customSubjects, setCustomSubjects] = useState<string[]>(CBT_DEFAULT_SUBJECTS);
  const [customTotalPreset, setCustomTotalPreset] = useState(80);

  function toggleCustomSubject(s: string) {
    setCustomSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const toHome = () => navigate('/home');
  // CBT is inherently a non-recommendation session type — Batch 4's Streak
  // Savior always applies to its Summary screen's "back to Home" (button or
  // physical back button below), whether or not today's real recommendation
  // is done; goHomeOrStreakSavior itself checks that and no-ops to /home
  // when it's already been completed.
  const fromSummaryToHome = () => goHomeOrStreakSavior(navigate, false);

  useBackIntercept(SCREEN_DEPTH[screen], () => {
    if (screen === 'history' || screen === 'instructions') { setScreen('setup'); return; }
    if (screen === 'review') { setScreen('summary'); return; }
    if (screen === 'summary') { fromSummaryToHome(); return; }
    // 'exam' / 'starting': swallowed, no navigation — protects a live attempt from an accidental exit.
  });

  async function handleBegin() {
    setStartError(null);
    setScreen('starting');
    try {
      let started;
      if (examType === 'subject') {
        started = await startCbtExam({ examType: 'subject', subjects: [subject] });
      } else if (examType === 'custom') {
        const per = Math.floor(customTotalPreset / customSubjects.length);
        const remainder = customTotalPreset - per * customSubjects.length;
        const customQuestionCounts: Record<string, number> = {};
        customSubjects.forEach((s, i) => { customQuestionCounts[s] = per + (i < remainder ? 1 : 0); });
        started = await startCbtExam({ examType: 'custom', subjects: customSubjects, customQuestionCounts });
      } else {
        started = await startCbtExam({ examType: 'full' });
      }
      if (started.paper.length === 0) {
        setStartError("Kairo couldn't find questions for this combination yet.");
        setScreen('setup');
        return;
      }
      setPaper(started.paper);
      setTotalTimeMin(started.totalTimeMin);
      setScreen('exam');
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Could not start the exam.');
      setScreen('setup');
    }
  }

  async function handleSubmit() {
    const finished = await finishCbtExam();
    setResults(finished);
    setScreen('summary');
  }

  if (screen === 'setup') {
    if (startError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>{startError}</div>
          <button type="button" onClick={toHome} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Home</button>
        </div>
      );
    }
    return (
      <ExamSetup
        onBack={toHome}
        onContinue={() => setScreen('instructions')}
        onViewHistory={() => setScreen('history')}
        examType={examType}
        onExamTypeChange={setExamType}
        subject={subject}
        onSubjectChange={setSubject}
        customSubjects={customSubjects}
        onToggleCustomSubject={toggleCustomSubject}
        customTotalPreset={customTotalPreset}
        onCustomTotalPresetChange={setCustomTotalPreset}
      />
    );
  }
  if (screen === 'history') {
    return <CbtHistory onBack={() => setScreen('setup')} />;
  }
  if (screen === 'instructions') {
    return <ExamInstructions onBack={() => setScreen('setup')} onBegin={handleBegin} />;
  }
  if (screen === 'starting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Preparing your exam…</div>
      </div>
    );
  }
  if (screen === 'exam') {
    return <CbtExam paper={paper} totalTimeMin={totalTimeMin} onSubmit={handleSubmit} onExit={toHome} />;
  }
  if (screen === 'summary' && results) {
    return <CbtSummary results={results} onHome={fromSummaryToHome} onReview={() => setScreen('review')} />;
  }
  if (screen === 'review' && results) {
    return <CbtReview paper={paper} questionResults={results.questionResults ?? []} onBack={() => setScreen('summary')} />;
  }
  return null;
}
