import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengesHub } from './ChallengesHub';
import { ChallengePreview } from './ChallengePreview';
import { ChallengeGetReady } from './ChallengeGetReady';
import { ChallengeAttempt } from './ChallengeAttempt';
import { ChallengeResults } from './ChallengeResults';
import type { Challenge } from './data';

type Screen = 'hub' | 'preview' | 'getReady' | 'attempt' | 'results';

function mockPastAnswers(challenge: Challenge): Record<number, number> {
  const answers: Record<number, number> = {};
  challenge.questions.forEach((q, i) => {
    const gotItRight = Math.random() < 0.7;
    if (gotItRight) {
      answers[i] = q.correct;
    } else {
      const wrongOptions = q.options.map((_, oi) => oi).filter((oi) => oi !== q.correct);
      answers[i] = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    }
  });
  return answers;
}

export function ChallengesFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('hub');
  const [history, setHistory] = useState<Screen[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

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

  if (screen === 'hub') {
    return (
      <ChallengesHub
        onBack={toHome}
        onSelect={(c) => { setChallenge(c); go('preview'); }}
      />
    );
  }

  if (screen === 'preview' && challenge) {
    return (
      <ChallengePreview
        challenge={challenge}
        onBack={back}
        onJoin={() => go('getReady')}
        onViewResult={() => { setAnswers(mockPastAnswers(challenge)); go('results'); }}
        onGoToCbt={() => navigate('/cbt')}
      />
    );
  }

  if (screen === 'getReady' && challenge) {
    return <ChallengeGetReady challenge={challenge} onStart={() => go('attempt')} />;
  }

  if (screen === 'attempt' && challenge) {
    return (
      <ChallengeAttempt
        challenge={challenge}
        onFinish={(finalAnswers) => { setAnswers(finalAnswers); go('results'); }}
        onExit={() => { setScreen('hub'); setHistory([]); }}
      />
    );
  }

  if (screen === 'results' && challenge) {
    return (
      <ChallengeResults
        challenge={challenge}
        answers={answers}
        onBackToHub={() => { setScreen('hub'); setHistory([]); }}
      />
    );
  }

  return null;
}
