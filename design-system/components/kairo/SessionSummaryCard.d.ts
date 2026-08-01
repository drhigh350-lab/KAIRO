export interface SessionSummaryCardProps {
  headline: string;
  strengths?: string[];
  nextSteps?: string[];
  scoreDelta?: number;
}
export function SessionSummaryCard(props: SessionSummaryCardProps): JSX.Element;
