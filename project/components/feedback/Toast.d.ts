import { ReactNode } from 'react';
export interface ToastProps {
  children: ReactNode;
  tone?: 'default' | 'success' | 'danger';
}
export function Toast(props: ToastProps): JSX.Element;
