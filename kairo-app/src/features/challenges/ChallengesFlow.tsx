import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChallengesHub } from './ChallengesHub';
import { ChallengePreview } from './ChallengePreview';
import { ChallengeGetReady } from './ChallengeGetReady';
import { ChallengeAttempt } from './ChallengeAttempt';
import { ChallengeResults } from './ChallengeResults';
import type { Challenge, ChallengeQuestion } from './data';
import {
  listChallenges, getMyAttempt, joinChallenge, joinChallengeAsGuest, getGuestAttempt, startGuestSession, getGuestToken, getCurrentStudentId, getChallengeQuestions, submitChallengeAttempt, submitGuestChallengeAttempt,
  mapDbChallenge, type DbChallenge, type DbChallengeAttempt, type SubmitAttemptResult,
} from '../../lib/challengesApi';
import { useBackIntercept } from '../../lib/useBackIntercept';

type Screen = 'hub' | 'preview' | 'getReady' | 'attempt' | 'results';

export function ChallengesFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [screen, setScreen] = useState<Screen>('hub');
  const [history, setHistory] = useState<Screen[]>([]);

  const [dbChallenges, setDbChallenges] = useState<DbChallenge[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDb, setSelectedDb] = useState<DbChallenge | null>(null);
  const [myAttempt, setMyAttempt] = useState<DbChallengeAttempt | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SubmitAttemptResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listChallenges()
      .then(setDbChallenges)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load challenges.'));
  }, []);

  // Deep link from a "Challenge a Friend" share (ChallengesHub) —
  // /challenges/<id> jumps straight to that challenge's preview instead of
  // leaving a friend who followed the link stuck picking it out of the hub.
  useEffect(() => {
    if (!dbChallenges || screen !== 'hub') return;
    const match = location.pathname.match(/^\/(?:challenges|arena\/challenge)\/([^/]+)$/);
    if (match) selectChallenge(match[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbChallenges]);

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
    setMyAttempt(null);
    // Show the Arena preview immediately. The attempt lookup is secondary
    // metadata and must never leave the student staring at a blank hub while
    // Supabase responds.
    go('preview');
    setBusy(true);
    try {
      const attempt = getCurrentStudentId() ? await getMyAttempt(id) : await (async () => {
        const saved = localStorage.getItem('kairo.arena.guest_attempt_id');
        const guestAttempt = saved ? await getGuestAttempt(saved) : null;
        return guestAttempt?.challenge_id === id ? guestAttempt : null;
      })();
      setMyAttempt(attempt);
    } catch {
      setMyAttempt(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!selectedDb) return;
    setBusy(true);
    try {
      if (!getCurrentStudentId() && !getGuestToken()) {
        const nickname = window.prompt('Choose a name for the Arena leaderboard');
        if (!nickname?.trim()) throw new Error('A display name is required to enter Arena.');
        await startGuestSession(nickname);
      }
      // Unlimited replays: joinChallenge always creates a fresh attempt row
      // now (see join_arena_challenge) rather than reusing an in-progress
      // one — only the FIRST ever attempt at a challenge counts toward the
      // leaderboard (counts_toward_leaderboard, set server-side).
      const attempt = myAttempt && !myAttempt.completed_at ? myAttempt : getCurrentStudentId() ? await joinChallenge(selectedDb.id) : await joinChallengeAsGuest(selectedDb.id);
      if (!getCurrentStudentId()) localStorage.setItem('kairo.arena.guest_attempt_id', attempt.id);
      const qs = await getChallengeQuestions(selectedDb.id);
      const restoredAnswers: Record<number, number> = {};
      const storedResults = (attempt.question_results as { question_id: string; selected_option?: string | null }[]) || [];
      qs.forEach((q, index) => {
        const stored = storedResults.find((row) => row.question_id === q.id);
        if (stored?.selected_option) restoredAnswers[index] = stored.selected_option.toUpperCase().charCodeAt(0) - 65;
      });
      setAnswers(restoredAnswers);
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
      const qs = await getChallengeQuestions(selectedDb.id);
      setQuestions(qs);
      const questionResults = (myAttempt.question_results as { question_id: string; correct: boolean; selected_option: string | null; correct_option: string }[]) || [];
      const restoredAnswers: Record<number, number> = {};
      const answerKey: Record<string, string> = {};
      qs.forEach((q, i) => {
        const found = questionResults.find((r) => r.question_id === q.id);
        if (found) {
          answerKey[q.id] = found.correct_option;
          if (found.selected_option) restoredAnswers[i] = found.selected_option.toUpperCase().charCodeAt(0) - 65;
        }
      });
      setAnswers(restoredAnswers);
      setResult({
        score: myAttempt.score || 0,
        total: qs.length,
        accuracyPct: myAttempt.accuracy || 0,
        timeTakenMs: myAttempt.time_taken_ms || 0,
        rankInChallenge: myAttempt.rank_in_challenge,
        participantCount: 0,
        betterThanPct: null,
        isWin: false,
        isFirstAttempt: myAttempt.counts_toward_leaderboard,
        attemptNumber: 1,
        previousBestScore: null,
        improvedBy: null,
        answerKey,
      });
      go('results');
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish(finalAnswers: Record<number, number>, timeTakenMs: number) {
    setAnswers(finalAnswers);
    if (!attemptId) { go('results'); return; }
    setBusy(true);
    try {
      const questionResults = questions.map((q, i) => ({
        questionId: q.id,
        // finalAnswers[i] is an option INDEX (0=A, 1=B, ...) — the RPC
        // wants the option LABEL, since that's what's actually stored on
        // each question's options array.
        selectedOption: finalAnswers[i] != null ? String.fromCharCode(65 + finalAnswers[i]) : '',
        responseTimeMs: 0, // per-question timing isn't tracked in this flow yet — total time is what's scored
      }));
      const submitted = getCurrentStudentId()
        ? await submitChallengeAttempt({ attemptId, questionResults, timeTakenMs })
        : await submitGuestChallengeAttempt({ attemptId, questionResults, timeTakenMs });
      setResult(submitted);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not submit this attempt.');
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
        initialAnswers={answers}
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
