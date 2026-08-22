import { useState, type ReactNode } from 'react';

export interface KaiMessageProps {
  children: ReactNode;
  compact?: boolean;
}

export function KaiMessage({ children, compact = false }: KaiMessageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--font-body)' }}>
      <div className={loaded ? undefined : 'kairo-skeleton'} style={{
        width: 36, height: 36, borderRadius: '50%', background: loaded ? 'var(--kairo-blue-100)' : undefined, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <img src="/assets/illustration-kai-mascot.png" alt="Kai" onLoad={() => setLoaded(true)} style={{ width: '160%', height: '160%', objectFit: 'cover', objectPosition: '20% 30%', opacity: loaded ? 1 : 0, transition: 'opacity var(--dur-base, 200ms)' }} />
      </div>
      <div style={{
        background: compact ? 'transparent' : 'var(--kairo-blue-100)', padding: compact ? 0 : '10px 14px',
        borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)', lineHeight: 1.5, maxWidth: 320,
      }}>
        {children}
      </div>
    </div>
  );
}
