import { ReactNode } from 'react';
export interface BottomNavItem {
  key: string;
  label: string;
  icon: ReactNode;
}
/**
 * @startingPoint section="Components" subtitle="5-item persistent bottom navigation" viewport="700x100"
 */
export interface BottomNavProps {
  items: BottomNavItem[];
  active: string;
  onChange?: (key: string) => void;
}
export function BottomNav(props: BottomNavProps): JSX.Element;
