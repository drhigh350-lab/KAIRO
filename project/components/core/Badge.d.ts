import { ReactNode } from 'react';
export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'gold' | 'success' | 'danger' | 'navy';
}
export function Badge(props: BadgeProps): JSX.Element;
