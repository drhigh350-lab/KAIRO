import { useEffect, useState } from 'react';
import { Card } from '../../components';
import { KairoLoading, ScreenHeader } from '../learning/shared';
import { Row } from './ExamSetup';
import { getCbtHistory, type CbtHistoryEntry, type CbtPaperQuestion } from '../../lib/kairoEngine';
import { CbtReview } from './CbtReview';

export interface CbtHistoryProps {
  onBack?: () => void;
}

/** Real past-exam log from kairo.cbt_results — every completed mock, in date order, with the same per-subject breakdown the summary screen showed right after finishing it. */
export function CbtHistory({ onBack }: CbtHistoryProps) {
  const [entries, setEntries] = useState<CbtHistoryEntry[] | null>(null);
  const [selected, setSelected] = useState<CbtHistoryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCbtHistory()
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your exam history.'));
  }, []);

  const avgPct = entries && entries.length ? Math.round(entries.reduce((s, e) => s + e.percentage, 0) / entries.length) : null;
  const bestPct = entries && entries.length ? Math.max(...entries.map((e) => e.percentage)) : null;

  if (selected) {
    const paper: CbtPaperQuestion[] = (selected.questionResults || []).map((r) => ({
      globalIndex: r.globalIndex,
      subject: r.subject,
      questionId: r.questionId || `history_${selected.id}_${r.globalIndex}`,
      text: r.text || 'Question text unavailable',
      options: r.options || [],
      imageUrl: r.imageUrl || null,
    }));
    return <CbtReview paper={paper} questionResults={selected.questionResults || []} onBack={() => setSelected(null)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Exam History" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20 }}>{error}</div>}
        {!error && entries === null && <KairoLoading title="Loading your exam log" detail="Pulling your latest scores and question snapshots…" />}
        {!error && entries && entries.length === 0 && (
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40, lineHeight: 1.5 }}>
            No exams taken yet. Complete a CBT simulation to see your history here.
          </div>
        )}
        {entries && entries.length > 0 && (
          <>
            <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 8 }}>OVERALL</div>
              <Row label="Exams taken" value={String(entries.length)} />
              <Row label="Average score" value={`${avgPct}%`} />
              <Row label="Best score" value={`${bestPct}%`} />
            </Card>
            {entries.map((e) => (
              <Card key={e.id} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>
                    {new Date(e.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: e.percentage >= 60 ? 'var(--dark-success)' : 'var(--dark-danger)' }}>{e.score}/{e.maxScore} · {e.percentage}%</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4 }}>{e.subjects.join(', ')}</div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--dark-border)' }}>
                  {e.bySubject.map((s) => (
                    <div key={s.subject} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ fontSize: 12.5, color: 'var(--dark-text-body)' }}>{s.subject}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: s.percentage >= 60 ? 'var(--dark-success)' : 'var(--dark-danger)' }}>{s.percentage}%</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="kairo-pressable" onClick={() => setSelected(e)} disabled={!e.questionResults?.length} style={{ width: '100%', marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--dark-accent-blue)', background: 'transparent', color: 'var(--dark-accent-blue)', fontFamily: 'inherit', fontWeight: 700, cursor: e.questionResults?.length ? 'pointer' : 'not-allowed', opacity: e.questionResults?.length ? 1 : .5 }}>
                  {e.questionResults?.length ? 'Open question review' : 'Question review unavailable for this exam'}
                </button>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
