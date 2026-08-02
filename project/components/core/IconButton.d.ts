import { ReactNode } from 'react';
export interface IconButtonProps {
  children: ReactNode;
  variant?: 'ghost' | 'filled';
  size?: number;
  active?: boolean;
  onClick?: () => void;
}
export function IconButton(props: IconButtonProps): JSX.Element;
