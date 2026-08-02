/**
 * @startingPoint section="Components" subtitle="Correct/incorrect left-border answer feedback" viewport="700x220"
 */
export interface AnswerFeedbackProps {
  correct: boolean;
  title: string;
  detail?: string;
}
export function AnswerFeedback(props: AnswerFeedbackProps): JSX.Element;
