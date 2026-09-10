import { useEffect, useState } from 'react';
import { searchOfficialQuestions, type OfficialQuestionSummary, type QuestionRef } from '../../lib/quizApi';

export function OfficialQuestionPicker({
  subject, selected, onToggle,
}: {
  subject: string;
  selected: QuestionRef[];
  onToggle: (ref: QuestionRef) => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<OfficialQuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      searchOfficialQuestions(subject, search, 25).then(setResults).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [subject, search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${subject} questions…`}
        className="input-dark"
        style={{
          width: '100%', height: 'var(--touch-min)', padding: '0 16px', marginBottom: 12,
          borderRadius: 'var(--radius-md)', border: '1.5px solid var(--dark-border)', background: 'var(--dark-bg-surface)',
          color: 'var(--dark-text-heading)', fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box',
        }}
      />
      {loading ? (
        <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '20px 0', textAlign: 'center' }}>Searching…</div>
      ) : results.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', padding: '20px 0', textAlign: 'center' }}>No questions found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((q) => {
            const isSelected = selected.some((r) => r.id === q.id);
            return (
              <button
                key={q.id}
                onClick={() => onToggle({ source: 'official', id: q.id, stem: q.stem })}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${isSelected ? 'var(--arena-gold)' : 'var(--dark-border)'}`,
                  background: isSelected ? 'rgba(201,162,39,0.08)' : 'var(--dark-bg-surface)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}
              >
                <span style={{ marginTop: 1 }}>{isSelected ? '✅' : '⬜'}</span>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.4 }}>{q.stem}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', marginTop: 4 }}>{q.topic ?? 'General'}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
