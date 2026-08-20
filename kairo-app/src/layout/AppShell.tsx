import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  /** Set by App.tsx for hub/browsing screens (Home, Profile, Practice Home, Insights, Review) — a genuine multi-column desktop layout instead of the single reading-width column every focused question-answering screen keeps. */
  wide?: boolean;
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
export function AppShell({ children, wide = false }: AppShellProps) {
  return <div className={wide ? 'app-shell app-shell--wide' : 'app-shell'}>{children}</div>;
}
