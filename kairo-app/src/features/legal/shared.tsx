import type { ReactNode } from 'react';

/** Shared typography for PrivacyPage/TermsPage — long-form legal copy rendered
 * with the app's existing dark-theme tokens rather than a pasted-in document look. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 18, borderBottom: '1px solid var(--dark-border)' }}>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)' }}>{heading}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.65 }}>
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.6 }}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} style={{ color: 'var(--dark-accent-blue)', fontWeight: 600, textDecoration: 'none' }}>{children}</a>
  );
}
