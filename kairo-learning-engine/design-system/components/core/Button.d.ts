import { ReactNode } from 'react';

/**
 * @startingPoint section="Components" subtitle="Primary pill button with variants and states" viewport="700x260"
 */
export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
}

export function Button(props: ButtonProps): JSX.Element;
