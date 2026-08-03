export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'blue' | 'gold' | 'light';
  height?: number;
}
export function ProgressBar(props: ProgressBarProps): JSX.Element;
