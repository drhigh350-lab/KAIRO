import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PracticeHome } from './PracticeHome';
import { SubjectSelect } from './SubjectSelect';
import { TopicSelect } from './TopicSelect';
import { SubtopicSelect } from './SubtopicSelect';
import { PracticeHub } from './PracticeHub';
import { PracticeQuestion, type PracticeQuestionResult } from './PracticeQuestion';
import { PracticeSummary, type PracticeResult, type PracticeSummaryAction, type EngineSessionSummary } from './PracticeSummary';
import { PracticeReview } from './PracticeReview';
import { subjects, type Subject } from './data';
import { getEngine, startSuggestedSession, startCustomSession, startTopicPracticeSession, startLearnFromIncorrectAnswer } from '../../lib/kairoEngine';
import { toUiQuestion, selectedOptionLabel, type EngineFlatQuestion } from '../../lib/engineAdapter';
import { useBackIntercept } from '../../lib/useBackIntercept';

type Screen = 'practiceHome' | 'subject' | 'practiceHub' | 'topic' | 'subtopic' | 'practiceQuestion' | 'practiceSummary' | 'practiceReview';
type SubjectLike = Subject | { key: string; label: string };
type EntryKind = 'home' | 'subject' | 'topic' | 'mixed' | 'weak' | 'suggested';

interface InitialState {
  screen: Screen;
  entryFlow: string;
  subject: SubjectLike | null;
  difficulty: string | null;
  length: number;
  qIndex: number;
  results: PracticeResult[];
}

function computeInitial(entry: string): InitialState {
  const kind = entry as EntryKind;
  const base: InitialState = {
    screen: 'subject',
    entryFlow: kind,
    subject: null,
    difficulty: null,
    length: 10,
    qIndex: 0,
    results: [],
  };
  if (kind === 'home') {
    return { ...base, screen: 'practiceHome' };
  }
  if (kind === 'mixed') {
    return { ...base, subject: { key: 'mixed', label: 'All Subjects' }, screen: 'practiceHub' };
  }
  if (kind === 'weak') {
    return { ...base, subject: { key: 'weak', label: 'Weak Areas' }, screen: 'practiceHub' };
  }
  if (kind === 'suggested') {
    return { ...base, subject: subjects[0], difficulty: 'adaptive', length: 5, screen: 'practiceQuestion' };
  }
  // 'subject' and 'topic' (and any unrecognized entry) both start at the subject picker.
  return base;
}

export function PracticeFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  // Tapping the Practice tab directly (no entry state) lands on Practice Home,
  // never a bare subject picker — a student should never have to choose from
  // a menu to begin (Practice Module Spec §2.1). Explicit entry kinds (from
  // Home's own quick actions, or Practice Home's own actions below) still
  // route straight to their specific flow.
  const entry = (location.state as { entry?: string } | null)?.entry ?? 'home';

  const [init] = useState(() => computeInitial(entry));
  const [screen, setScreen] = useState<Screen>(init.screen);
  const [history, setHistory] = useState<Screen[]>([]);
  const [subject, setSubject] = useState<SubjectLike | null>(init.subject);
  const [topic, setTopic] = useState<string | null>(null);
  const [subtopic, setSubtopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(init.difficulty);
  const [length, setLength] = useState(init.length);
  const [entryFlow, setEntryFlow] = useState(init.entryFlow);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [qIndex, setQIndex] = useState(init.qIndex);
  const [results, setResults] = useState<PracticeResult[]>(init.results);
  const [engineQuestions, setEngineQuestions] = useState<EngineFlatQuestion[] | null>(null);
  const [engineLoadError, setEngineLoadError] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<EngineSessionSummary | null>(null);
  const [lastErrorTag, setLastErrorTag] = useState<string | null>(null);
  const [lastResponseTimeMs, setLastResponseTimeMs] = useState(15000);
  const startedSuggested = useRef(false);

  /** Recommended-by-Kairo session (Practice Module §2.2) — zero-input, real DDE-style queue. Shared by the initial-mount auto-start (arriving via entry:'suggested') and Practice Home's own "Start Session" tap. */
  function startSuggested() {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startSuggestedSession(5)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions to start with just yet.");
        } else {
          setEngineQuestions(questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  useEffect(() => {
    if (entryFlow !== 'suggested' || startedSuggested.current) return;
    startedSuggested.current = true;
    startSuggested();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Mixed Practice / Weak Areas from PracticeHub — same real session lifecycle as "suggested". */
  function startEngineCustomSession(subjectFilter: string[], includeFading: boolean, limit: number) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startCustomSession({ subjects: subjectFilter, includeFading, limit: limit || 10 })
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions to start with just yet.");
        } else {
          setEngineQuestions(questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  /** Topic Practice's final pick (or "practise all of this topic" skip) — same real session lifecycle, scoped to a subject/topic/subtopic. */
  function startTopicSession(subjectLabel: string, topicName: string, subtopicName?: string) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startTopicPracticeSession(subjectLabel, topicName, subtopicName, length || 10)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions for this topic yet.");
        } else {
          setEngineQuestions(questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  function go(next: Screen) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function back() {
    setHistory((h) => {
      const n = [...h];
      const prev = n.pop();
      if (prev) setScreen(prev);
      else navigate('/home');
      return n;
    });
  }
  function toHome() {
    navigate('/home');
  }

  // Makes the phone/browser back button step through Practice's own screens
  // one at a time (subject -> hub -> question -> ...), the same as tapping
  // the in-screen back arrow (which already calls back() above) — without
  // this, the physical back button skips the whole flow in one tap.
  useBackIntercept(history.length, back);

  /** Fires immediately when the answer is graded (before the student advances) — records the real attempt right away so "Understand this before moving on" has a real errorTag to hand Learn. */
  function handleAnswered({ correct, selectedIndex, responseTimeMs }: { correct: boolean; selectedIndex: number | null; responseTimeMs: number }) {
    if (!engineQuestions) return;
    const kairo = getEngine();
    const eq = engineQuestions[qIndex];
    if (!kairo || !eq) return;
    const { attempt } = kairo.submitAnswer({
      conceptId: eq.conceptId ?? null,
      correct,
      responseTimeMs,
      selectedOption: selectedOptionLabel(eq, selectedIndex),
      correctOption: eq.correctOption,
      questionId: eq.id,
      questionDifficulty: eq.difficulty,
    });
    setLastErrorTag(attempt?.errorTag ?? null);
    setLastResponseTimeMs(responseTimeMs);
  }

  function handleLearnThis() {
    if (!engineQuestions) return;
    const eq = engineQuestions[qIndex];
    if (!eq?.conceptId) return;
    startLearnFromIncorrectAnswer({
      questionId: eq.id,
      conceptId: eq.conceptId,
      errorTag: lastErrorTag,
      responseTimeMs: lastResponseTimeMs,
    });
    navigate(`/learn/${encodeURIComponent(eq.conceptId)}`, { state: { returnTo: '/practice' } });
  }

  function handleNextQuestion({ correct, confidence, selectedIndex, responseTimeMs }: PracticeQuestionResult) {
    const eq = engineQuestions?.[qIndex];
    const newResults = [...results, {
      correct, confidence, time: Math.round(responseTimeMs / 1000), subject: eq?.subject, topic: eq?.topic,
      review: eq ? {
        questionText: eq.text,
        options: eq.options.map((o) => ({ label: o.label, text: o.text })),
        correctOption: eq.correctOption,
        selectedOption: selectedOptionLabel(eq, selectedIndex) ?? null,
        explanation: eq.explanation,
      } : undefined,
    }];
    setResults(newResults);
    setLastErrorTag(null);

    if (!engineQuestions) return;
    if (qIndex + 1 >= engineQuestions.length) {
      setHasHistory(true);
      const kairo = getEngine();
      if (kairo) {
        kairo.endSession().then(setSessionSummary).catch(() => setSessionSummary(null));
      }
      go('practiceSummary');
    } else {
      setQIndex(qIndex + 1);
    }
  }

  function handleSummaryAction(key: PracticeSummaryAction) {
    if (key === 'weak') {
      setSubject({ key: 'weak', label: 'Weak Areas' });
      setEntryFlow('weak');
      go('practiceHub');
    } else if (key === 'retry') {
      setQIndex(0);
      go('practiceQuestion');
    } else if (key === 'challenge') {
      setDifficulty('hard');
      setQIndex(0);
      setResults([]);
      go('practiceQuestion');
    } else if (key === 'cbt') {
      navigate('/cbt');
    } else if (key === 'review') {
      go('practiceReview');
    }
  }

  const activeSubject = subject ?? { key: 'mixed', label: 'All Subjects' };
  const lockedType = entryFlow === 'mixed' ? 'mixed' : entryFlow === 'weak' ? 'weak' : undefined;

  if (screen === 'practiceHome') {
    return (
      <PracticeHome
        onBack={toHome}
        onStartSuggested={() => {
          setSubject(subjects[0]);
          setDifficulty('adaptive');
          setLength(5);
          setQIndex(0);
          setResults([]);
          setEntryFlow('suggested');
          startSuggested();
          go('practiceQuestion');
        }}
        onBySubject={() => {
          setEntryFlow('subject');
          go('subject');
        }}
        onByTopic={() => {
          setEntryFlow('topic');
          go('subject');
        }}
        onMixed={() => {
          setSubject({ key: 'mixed', label: 'All Subjects' });
          setEntryFlow('mixed');
          go('practiceHub');
        }}
        onWeak={() => {
          setSubject({ key: 'weak', label: 'Weak Areas' });
          setEntryFlow('weak');
          go('practiceHub');
        }}
      />
    );
  }
  if (screen === 'subject') {
    return (
      <SubjectSelect
        onBack={toHome}
        recentKeys={recentKeys}
        onPick={(s) => {
          setSubject(s);
          setRecentKeys((k) => [s.key, ...k.filter((x) => x !== s.key)].slice(0, 3));
          if (entryFlow === 'topic') go('topic');
          else go('practiceHub');
        }}
      />
    );
  }
  if (screen === 'practiceHub') {
    return (
      <PracticeHub
        subject={activeSubject}
        hasHistory={hasHistory}
        lockedType={lockedType}
        onBack={back}
        onStart={({ type, difficulty: d, length: len }) => {
          setDifficulty(d);
          setLength(len);
          if (type === 'topic') {
            go('topic');
          } else {
            setTopic(null);
            setSubtopic(null);
            setQIndex(0);
            setResults([]);
            const isGenericSubject = activeSubject.key === 'mixed' || activeSubject.key === 'weak';
            const subjectFilter = isGenericSubject ? [] : [activeSubject.label];
            startEngineCustomSession(subjectFilter, type === 'weak', len);
            go('practiceQuestion');
          }
        }}
      />
    );
  }
  if (screen === 'topic') {
    return (
      <TopicSelect
        subject={activeSubject as Subject}
        onBack={back}
        onPick={(t) => {
          setTopic(t);
          go('subtopic');
        }}
      />
    );
  }
  if (screen === 'subtopic' && topic) {
    return (
      <SubtopicSelect
        subject={activeSubject as Subject}
        topic={topic}
        onBack={back}
        onPick={(s) => {
          setSubtopic(s);
          setQIndex(0);
          setResults([]);
          startTopicSession(activeSubject.label, topic, s);
          go('practiceQuestion');
        }}
        onSkip={() => {
          setQIndex(0);
          setResults([]);
          startTopicSession(activeSubject.label, topic);
          go('practiceQuestion');
        }}
      />
    );
  }
  if (screen === 'practiceQuestion') {
    if (engineLoadError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>{engineLoadError}</div>
          <button type="button" onClick={toHome} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Home</button>
        </div>
      );
    }
    if (!engineQuestions) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Preparing your session…</div>
        </div>
      );
    }
    return (
      <PracticeQuestion
        key={engineQuestions[qIndex].id}
        question={toUiQuestion(engineQuestions[qIndex])}
        index={qIndex}
        total={engineQuestions.length}
        onNext={handleNextQuestion}
        onExit={toHome}
        onAnswered={handleAnswered}
        onLearnThis={engineQuestions[qIndex].conceptId ? handleLearnThis : undefined}
      />
    );
  }
  if (screen === 'practiceSummary') {
    return <PracticeSummary results={results} onHome={toHome} onAction={handleSummaryAction} engineSummary={sessionSummary} />;
  }
  if (screen === 'practiceReview') {
    return <PracticeReview results={results} onBack={back} />;
  }

  return null;
}
