import { ReactNode } from 'react';
export interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: ReactNode;
  type?: string;
  error?: string;
}
export function Input(props: InputProps): JSX.Element;
