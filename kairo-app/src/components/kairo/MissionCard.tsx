export interface MissionCardProps {
  eyebrow?: string;
  title: string;
  reason?: string;
  duration?: string;
  progress?: number;
  ctaLabel?: string;
  onStart?: () => void;
}

export function MissionCard({ eyebrow = "TODAY'S MISSION", title, reason, duration, progress, ctaLabel = 'Start Mission', onStart }: MissionCardProps) {
  return (
    <div style={{
      background: 'var(--kairo-navy-900)', borderRadius: 'var(--radius-xl)', padding: 24, color: '#fff',
      fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--kairo-blue-300)', fontWeight: 700 }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, marginTop: 10, lineHeight: 1.25 }}>{title}</div>
      {reason && <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--kairo-blue-200)', marginTop: 10 }}>{reason}</div>}
      {duration && <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--kairo-blue-300)', marginTop: 8 }}>{duration}</div>}
      {progress != null && (
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#fff' }} />
          </div>
        </div>
      )}
      <button onClick={onStart} style={{
        marginTop: 20, width: '100%', minHeight: 'var(--touch-min)', background: '#fff', color: 'var(--kairo-navy-900)',
        border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', cursor: 'pointer',
      }}>
        {ctaLabel}
      </button>
    </div>
  );
}
