import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RapidFireIntro } from './RapidFireIntro';
import { RapidFirePlay } from './RapidFirePlay';
import { RapidFireResults } from './RapidFireResults';
import {
  startRapidFireSession, finishRapidFire,
  type RapidFireQueuedQuestion, type RapidFireResults as RapidFireResultsData,
} from '../../lib/kairoEngine';

type Screen = 'intro' | 'play' | 'results';

/** Controller for Rapid Fire: intro -> play -> results, driven by the real kairo.rapidFire (RapidFireEngine) instance. */
export function RapidFireFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('intro');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<RapidFireQueuedQuestion[]>([]);
  const [timePerQuestionSec, setTimePerQuestionSec] = useState(30);
  const [results, setResults] = useState<RapidFireResultsData | null>(null);

  const toHome = () => navigate('/home');

  async function handleStart() {
    setStarting(true);
    setStartError(null);
    try {
      const started = await startRapidFireSession();
      if (started.questions.length === 0) {
        setStartError("Rapid Fire needs a bit of practice history first — come back once you've studied a few concepts.");
        return;
      }
      setQuestions(started.questions);
      setTimePerQuestionSec(started.timePerQuestionSec);
      setScreen('play');
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Could not start Rapid Fire.');
    } finally {
      setStarting(false);
    }
  }

  async function handleFinish() {
    const finished = await finishRapidFire();
    setResults(finished);
    setScreen('results');
  }

  if (screen === 'intro') {
    return <RapidFireIntro onBack={toHome} onStart={handleStart} starting={starting} error={startError} />;
  }
  if (screen === 'play') {
    return <RapidFirePlay questions={questions} timePerQuestionSec={timePerQuestionSec} onFinish={handleFinish} onExit={toHome} />;
  }
  if (screen === 'results' && results) {
    return <RapidFireResults results={results} onHome={toHome} onRetry={() => setScreen('intro')} />;
  }
  return null;
}
