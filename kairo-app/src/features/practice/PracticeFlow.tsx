import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubjectSelect } from './SubjectSelect';
import { TopicSelect } from './TopicSelect';
import { SubtopicSelect } from './SubtopicSelect';
import { PracticeHub } from './PracticeHub';
import { PracticeQuestion } from './PracticeQuestion';
import { PracticeSummary, type PracticeResult, type PracticeSummaryAction } from './PracticeSummary';
import { subjects, practiceQuestions, type Subject, type Topic } from './data';
import type { ConfidenceLevel } from '../learning/shared';

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
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subtopic, setSubtopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(init.difficulty);
  const [length, setLength] = useState(init.length);
  const [entryFlow, setEntryFlow] = useState(init.entryFlow);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [qIndex, setQIndex] = useState(init.qIndex);
  const [results, setResults] = useState<PracticeResult[]>(init.results);

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

  function handleNextQuestion({ correct, confidence }: { correct: boolean; confidence: ConfidenceLevel | null }) {
    const newResults = [...results, { correct, confidence, time: 40 + Math.floor(Math.random() * 30) }];
    setResults(newResults);
    if (qIndex + 1 >= practiceQuestions.length) {
      setHasHistory(true);
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
          if (t.subtopics.length) go('subtopic');
          else {
            setQIndex(0);
            setResults([]);
            go('practiceQuestion');
          }
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
          go('practiceQuestion');
        }}
        onSkip={() => {
          setQIndex(0);
          setResults([]);
          go('practiceQuestion');
        }}
      />
    );
  }
  if (screen === 'practiceQuestion') {
    return (
      <PracticeQuestion
        key={practiceQuestions[qIndex].id}
        question={practiceQuestions[qIndex]}
        index={qIndex}
        total={practiceQuestions.length}
        onNext={handleNextQuestion}
        onExit={toHome}
      />
    );
  }
  if (screen === 'practiceSummary') {
    return <PracticeSummary results={results} onHome={toHome} onAction={handleSummaryAction} />;
  }

  return null;
}
