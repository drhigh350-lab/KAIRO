export interface SessionSummaryCardProps {
  headline: string;
  strengths?: string[];
  nextSteps?: string[];
  scoreDelta?: number;
}

export function SessionSummaryCard({ headline, strengths = [], nextSteps = [], scoreDelta }: SessionSummaryCardProps) {
  return (
    <div style={{ fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--text-heading)' }}>{headline}</div>
      {strengths.length > 0 && (
        <div>
          <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 700, color: 'var(--state-success)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Strengths</div>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--text-body)', fontSize: 'var(--fs-body-sm)' }}>
            {strengths.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
          </ul>
        </div>
      )}
      {nextSteps.length > 0 && (
        <div>
          <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Recommended next</div>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--text-body)', fontSize: 'var(--fs-body-sm)' }}>
            {nextSteps.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
          </ul>
        </div>
      )}
      {scoreDelta != null && (
        <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>
          KAIRO Score {scoreDelta >= 0 ? 'moved up' : 'dipped'} <b style={{ color: 'var(--text-heading)' }}>{Math.abs(scoreDelta)}</b> — mostly from remembering things you'd struggled with before.
        </div>
      )}
    </div>
  );
}
