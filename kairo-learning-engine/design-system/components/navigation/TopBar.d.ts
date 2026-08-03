import { ReactNode } from 'react';
export interface TopBarProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}
export function TopBar(props: TopBarProps): JSX.Element;
