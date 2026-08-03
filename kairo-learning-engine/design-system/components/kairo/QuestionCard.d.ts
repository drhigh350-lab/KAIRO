/**
 * @startingPoint section="Components" subtitle="The shared question player used by Practice/Learn/Review/CBT" viewport="700x480"
 */
export interface QuestionCardProps {
  subject: string;
  progressLabel: string;
  stem: string;
  options: string[];
  onSubmit?: (index: number | null) => void;
}
export function QuestionCard(props: QuestionCardProps): JSX.Element;
