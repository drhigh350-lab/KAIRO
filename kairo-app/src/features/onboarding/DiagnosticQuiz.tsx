import { useState } from 'react';
import { PracticeQuestion } from '../practice/PracticeQuestion';
import { toUiQuestion, selectedOptionLabel, type EngineFlatQuestion } from '../../lib/engineAdapter';
import type { DiagnosticAnswer } from '../../lib/kairoEngine';

export interface DiagnosticQuizProps {
  questions: EngineFlatQuestion[];
  onComplete: (answers: DiagnosticAnswer[]) => void;
  onExit: () => void;
}

/** The real 5-question diagnostic, reusing the same PracticeQuestion UI every other real session already uses. */
export function DiagnosticQuiz({ questions, onComplete, onExit }: DiagnosticQuizProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);

  const q = questions[index];
  return (
    <PracticeQuestion
      key={q.id}
      question={toUiQuestion(q)}
      index={index}
      total={questions.length}
      onExit={onExit}
      onNext={({ correct, selectedIndex }) => {
        const next = [...answers, {
          conceptId: q.conceptId ?? null,
          correct,
          responseTimeMs: 15000,
          selectedOption: selectedOptionLabel(q, selectedIndex),
          correctOption: q.correctOption,
          questionId: q.id,
        }];
        if (index + 1 >= questions.length) {
          onComplete(next);
        } else {
          setAnswers(next);
          setIndex(index + 1);
        }
      }}
    />
  );
}
