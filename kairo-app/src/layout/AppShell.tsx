import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * The application's real viewport shell. Kairo is a mobile-first responsive
 * web app, not a phone mockup — this renders directly into whatever browser
 * viewport it's running in. No fake status bar, no device frame, no fixed
 * device height. The browser already provides time, battery, network, and
 * chrome; Kairo never duplicates them.
 *
 * On wide viewports the content column caps at a comfortable reading width
 * (see layout.css) — a responsive expansion, not a separate design.
 */
export function AppShell({ children }: AppShellProps) {
  return <div className="app-shell">{children}</div>;
}
