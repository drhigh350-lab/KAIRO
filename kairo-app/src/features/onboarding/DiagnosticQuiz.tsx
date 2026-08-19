import { useRef, useState } from 'react';
import { PracticeQuestion, type PracticeExplanation } from '../practice/PracticeQuestion';
import { toUiQuestion, selectedOptionLabel, type EngineFlatQuestion } from '../../lib/engineAdapter';
import { submitDiagnosticAnswer, type DiagnosticAnswer } from '../../lib/kairoEngine';

export interface DiagnosticQuizProps {
  questions: EngineFlatQuestion[];
  onComplete: (answers: DiagnosticAnswer[]) => void;
  onExit: () => void;
}

/** The real 5-question diagnostic, reusing the same PracticeQuestion UI every other real session already uses. */
export function DiagnosticQuiz({ questions, onComplete, onExit }: DiagnosticQuizProps) {
  const [index, setIndex] = useState(0);
  const [explanation, setExplanation] = useState<PracticeExplanation | null>(null);
  const [kaiNote, setKaiNote] = useState<string | null>(null);
  const answers = useRef<DiagnosticAnswer[]>([]);

  const q = questions[index];
  return (
    <PracticeQuestion
      key={q.id}
      question={toUiQuestion(q)}
      index={index}
      total={questions.length}
      explanation={explanation}
      kaiNote={kaiNote}
      onExit={onExit}
      onAnswered={({ correct, selectedIndex, responseTimeMs }) => {
        // Records the real attempt the moment it's answered (mirroring
        // Practice's own submitAnswer() call) — the same rich
        // per-distractor "why each option is wrong" breakdown Practice
        // renders now shows here too, instead of a flat, placeholder-ish
        // `why` line. Previously every diagnostic answer was only
        // recorded in bulk after the whole quiz finished, so there was
        // no real explanation data to show per question.
        const result = submitDiagnosticAnswer(q, selectedIndex, correct, responseTimeMs);
        setExplanation(result.explanation);
        setKaiNote(result.kaiNote);
        answers.current.push({
          conceptId: q.conceptId ?? null,
          correct,
          responseTimeMs,
          selectedOption: selectedOptionLabel(q, selectedIndex),
          correctOption: q.correctOption,
          questionId: q.id,
        });
      }}
      onNext={() => {
        if (index + 1 >= questions.length) {
          onComplete(answers.current);
        } else {
          setExplanation(null);
          setKaiNote(null);
          setIndex(index + 1);
        }
      }}
    />
  );
}
