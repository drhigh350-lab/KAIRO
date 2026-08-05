import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengesHub } from './ChallengesHub';
import { ChallengePreview } from './ChallengePreview';
import { ChallengeGetReady } from './ChallengeGetReady';
import { ChallengeAttempt } from './ChallengeAttempt';
import { ChallengeResults } from './ChallengeResults';
import type { Challenge, ChallengeQuestion } from './data';
import {
  listChallenges, getMyAttempt, joinChallenge, getChallengeQuestions, submitChallengeAttempt,
  mapDbChallenge, type DbChallenge, type DbChallengeAttempt,
} from '../../lib/challengesApi';
import { useBackIntercept } from '../../lib/useBackIntercept';

type Screen = 'hub' | 'preview' | 'getReady' | 'attempt' | 'results';

export function ChallengesFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('hub');
  const [history, setHistory] = useState<Screen[]>([]);

  const [dbChallenges, setDbChallenges] = useState<DbChallenge[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDb, setSelectedDb] = useState<DbChallenge | null>(null);
  const [myAttempt, setMyAttempt] = useState<DbChallengeAttempt | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; accuracy: number; timeTakenMs: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listChallenges()
      .then(setDbChallenges)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load challenges.'));
  }, []);

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
  function toHub() {
    setScreen('hub');
    setHistory([]);
  }

  // Challenges' screens all share one route (/challenges/*), same as
  // Practice/CBT — without this, the phone/browser back button skips the
  // whole flow in one tap instead of stepping through hub -> preview ->
  // getReady -> attempt -> results like the in-screen back arrow does.
  useBackIntercept(history.length, back);

  const challenges: Challenge[] = (dbChallenges || []).map(mapDbChallenge);
  const selected: Challenge | null = selectedDb ? mapDbChallenge(selectedDb) : null;

  async function selectChallenge(id: string) {
    const db = (dbChallenges || []).find((c) => c.id === id);
    if (!db) return;
    setSelectedDb(db);
    setBusy(true);
    try {
      const attempt = await getMyAttempt(id);
      setMyAttempt(attempt);
    } catch {
      setMyAttempt(null);
    } finally {
      setBusy(false);
      go('preview');
    }
  }

  async function handleJoin() {
    if (!selectedDb) return;
    setBusy(true);
    try {
      const attempt = myAttempt && !myAttempt.completed_at ? myAttempt : await joinChallenge(selectedDb.id);
      const qs = await getChallengeQuestions(selectedDb.question_ids);
      setAttemptId(attempt.id);
      setQuestions(qs);
      go('getReady');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not join this challenge.');
    } finally {
      setBusy(false);
    }
  }

  async function handleViewResult() {
    if (!myAttempt || !selectedDb) return;
    setBusy(true);
    try {
      const qs = await getChallengeQuestions(selectedDb.question_ids);
      setQuestions(qs);
      const questionResults = (myAttempt.question_results as { questionId: string; correct: boolean; selectedOption: string | null }[]) || [];
      const restoredAnswers: Record<number, number> = {};
      qs.forEach((q, i) => {
        const found = questionResults.find((r) => r.questionId === q.id);
        if (found) restoredAnswers[i] = found.correct ? q.correct : (q.options.findIndex((_, oi) => oi !== q.correct) ?? -1);
      });
      setAnswers(restoredAnswers);
      setResult({ score: myAttempt.score || 0, accuracy: myAttempt.accuracy || 0, timeTakenMs: myAttempt.time_taken_ms || 0 });
      go('results');
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish(finalAnswers: Record<number, number>, timeTakenMs: number) {
    setAnswers(finalAnswers);
    if (!attemptId) { go('results'); return; }
    const total = questions.length;
    const correctCount = questions.filter((q, i) => finalAnswers[i] === q.correct).length;
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    const score = correctCount * 10;
    setResult({ score, accuracy, timeTakenMs });
    setBusy(true);
    try {
      await submitChallengeAttempt({
        attemptId,
        score,
        accuracy,
        timeTakenMs,
        questionResults: questions.map((q, i) => ({ questionId: q.id, correct: finalAnswers[i] === q.correct, selectedOption: finalAnswers[i] != null ? String(finalAnswers[i]) : null })),
      });
    } catch {
      // best-effort — the student still sees their own result even if the write fails
    } finally {
      setBusy(false);
      go('results');
    }
  }

  if (loadError && screen === 'hub') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>{loadError}</div>
        <button type="button" onClick={toHome} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Home</button>
      </div>
    );
  }

  if (screen === 'hub') {
    return <ChallengesHub loading={dbChallenges === null} challenges={challenges} onBack={toHome} onSelect={selectChallenge} />;
  }

  if (screen === 'preview' && selected) {
    return (
      <ChallengePreview
        challenge={selected}
        challengeId={selectedDb!.id}
        alreadyCompleted={!!myAttempt?.completed_at}
        busy={busy}
        onBack={back}
        onJoin={handleJoin}
        onViewResult={handleViewResult}
        onGoToCbt={() => navigate('/cbt')}
      />
    );
  }

  if (screen === 'getReady' && selected) {
    return <ChallengeGetReady challenge={selected} onStart={() => go('attempt')} />;
  }

  if (screen === 'attempt' && selected) {
    return (
      <ChallengeAttempt
        challenge={selected}
        questions={questions}
        onFinish={handleFinish}
        onExit={toHub}
      />
    );
  }

  if (screen === 'results' && selected && result) {
    return (
      <ChallengeResults
        challenge={selected}
        challengeId={selectedDb!.id}
        questions={questions}
        answers={answers}
        result={result}
        onBackToHub={toHub}
      />
    );
  }

  return null;
}
