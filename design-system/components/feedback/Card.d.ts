import { ReactNode, CSSProperties } from 'react';
export interface CardProps {
  children: ReactNode;
  padding?: number;
  style?: CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
