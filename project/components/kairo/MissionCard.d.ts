/**
 * @startingPoint section="Components" subtitle="Kairo's signature Today's Mission card" viewport="700x360"
 */
export interface MissionCardProps {
  eyebrow?: string;
  title: string;
  reason?: string;
  duration?: string;
  progress?: number;
  ctaLabel?: string;
  onStart?: () => void;
}
export function MissionCard(props: MissionCardProps): JSX.Element;
