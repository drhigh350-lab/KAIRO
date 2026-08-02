import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamSetup } from './ExamSetup';
import { ExamInstructions } from './ExamInstructions';
import { CbtExam, type ExamQuestion } from './CbtExam';
import { CbtSummary } from './CbtSummary';
import { CbtReview } from './CbtReview';

type Screen = 'setup' | 'instructions' | 'exam' | 'summary' | 'review';

/** Controller for CBT Exam Mode: setup -> instructions -> exam -> summary -> review. */
export function CbtFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('setup');
  const [cbtAnswers, setCbtAnswers] = useState<Record<number, number>>({});
  const [cbtQuestions, setCbtQuestions] = useState<ExamQuestion[]>([]);

  const toHome = () => navigate('/home');

  if (screen === 'setup') {
    return <ExamSetup onBack={toHome} onContinue={() => setScreen('instructions')} />;
  }
  if (screen === 'instructions') {
    return <ExamInstructions onBack={() => setScreen('setup')} onBegin={() => setScreen('exam')} />;
  }
  if (screen === 'exam') {
    return (
      <CbtExam
        onExit={toHome}
        onSubmit={(answers, questions) => {
          setCbtAnswers(answers);
          setCbtQuestions(questions);
          setScreen('summary');
        }}
      />
    );
  }
  if (screen === 'summary') {
    return (
      <CbtSummary
        answers={cbtAnswers}
        questions={cbtQuestions}
        onHome={toHome}
        onReview={() => setScreen('review')}
      />
    );
  }
  return (
    <CbtReview answers={cbtAnswers} questions={cbtQuestions} onBack={() => setScreen('summary')} />
  );
}
