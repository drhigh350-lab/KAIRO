import { ReactNode } from 'react';
export interface KaiMessageProps {
  children: ReactNode;
  compact?: boolean;
}
export function KaiMessage(props: KaiMessageProps): JSX.Element;
