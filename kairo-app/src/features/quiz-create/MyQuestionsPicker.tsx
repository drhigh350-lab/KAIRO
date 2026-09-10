import { useEffect, useState } from 'react';
import { getMyCommunityQuestions, type MyCommunityQuestion, type QuestionRef } from '../../lib/quizApi';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', processing: 'Processing', needs_fixes: 'Needs Fixes',
  under_review: 'Under Review', published: 'Published', rejected: 'Rejected', archived: 'Archived',
};

export function MyQuestionsPicker({
  selected, onToggle,
}: {
  selected: QuestionRef[];
  onToggle: (ref: QuestionRef) => void;
}) {
  const [questions, setQuestions] = useState<MyCommunityQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCommunityQuestions().then(setQuestions).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '20px 0', textAlign: 'center' }}>Loading…</div>;
  if (questions.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '20px 0', textAlign: 'center' }}>You haven't written any questions yet — try "Write New".</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {questions.map((q) => {
        const isSelected = selected.some((r) => r.id === q.id);
        const statusColor = q.status === 'published' ? 'var(--dark-win, #4E9E7B)' : q.status === 'rejected' || q.status === 'needs_fixes' ? 'var(--dark-danger)' : 'var(--dark-text-muted)';
        return (
          <button
            key={q.id}
            onClick={() => onToggle({ source: 'community', id: q.id, stem: q.stem })}
            style={{
              textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'inherit',
              border: `1.5px solid ${isSelected ? 'var(--arena-gold)' : 'var(--dark-border)'}`,
              background: isSelected ? 'rgba(201,162,39,0.08)' : 'var(--dark-bg-surface)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            <span style={{ marginTop: 1 }}>{isSelected ? '✅' : '⬜'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.4 }}>{q.stem}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{STATUS_LABEL[q.status] ?? q.status}</span>
                {q.validationErrors.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--dark-danger)' }}>{q.validationErrors.length} issue{q.validationErrors.length === 1 ? '' : 's'}</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
