import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubjectSelect } from './SubjectSelect';
import { TopicSelect } from './TopicSelect';
import { SubtopicSelect } from './SubtopicSelect';
import { PracticeHub } from './PracticeHub';
import { PracticeQuestion, type PracticeQuestionResult } from './PracticeQuestion';
import { PracticeSummary, type PracticeResult, type PracticeSummaryAction, type EngineSessionSummary } from './PracticeSummary';
import { subjects, type Subject } from './data';
import { getEngine, startSuggestedSession, startCustomSession, startTopicPracticeSession } from '../../lib/kairoEngine';
import { toUiQuestion, selectedOptionLabel, type EngineFlatQuestion } from '../../lib/engineAdapter';

type Screen = 'subject' | 'practiceHub' | 'topic' | 'subtopic' | 'practiceQuestion' | 'practiceSummary';
type SubjectLike = Subject | { key: string; label: string };
type EntryKind = 'subject' | 'topic' | 'mixed' | 'weak' | 'suggested';

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
  const entry = (location.state as { entry?: string } | null)?.entry ?? 'subject';

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
  const startedSuggested = useRef(false);

  useEffect(() => {
    if (entryFlow !== 'suggested' || startedSuggested.current) return;
    startedSuggested.current = true;
    startSuggestedSession(5)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions to start with just yet.");
        } else {
          setEngineQuestions(questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
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

  function handleNextQuestion({ correct, confidence, selectedIndex }: PracticeQuestionResult) {
    const newResults = [...results, { correct, confidence, time: 40 + Math.floor(Math.random() * 30) }];
    setResults(newResults);

    if (!engineQuestions) return;
    const kairo = getEngine();
    const eq = engineQuestions[qIndex];
    if (kairo && eq) {
      kairo.submitAnswer({
        conceptId: eq.conceptId ?? null,
        correct,
        responseTimeMs: 15000,
        selectedOption: selectedOptionLabel(eq, selectedIndex),
        correctOption: eq.correctOption,
        questionId: eq.id,
        questionDifficulty: eq.difficulty,
      });
    }
    if (qIndex + 1 >= engineQuestions.length) {
      setHasHistory(true);
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
      setQIndex(0);
      go('practiceQuestion');
    }
  }

  const activeSubject = subject ?? { key: 'mixed', label: 'All Subjects' };
  const lockedType = entryFlow === 'mixed' ? 'mixed' : entryFlow === 'weak' ? 'weak' : undefined;

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
      />
    );
  }
  if (screen === 'practiceSummary') {
    return <PracticeSummary results={results} onHome={toHome} onAction={handleSummaryAction} engineSummary={sessionSummary} />;
  }

  return null;
}
