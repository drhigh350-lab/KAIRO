import { useState } from 'react';
import { Button } from '../../components';
import { ScreenHeader, SearchIcon } from '../learning/shared';
import { subjects, type Subject } from './data';

export interface SubjectSelectProps {
  onBack?: () => void;
  onPick: (subject: Subject) => void;
  recentKeys?: string[];
}

interface RowProps {
  s: Subject;
  active: boolean;
  favourite: boolean;
  onClick: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
}

function Row({ s, active, favourite, onClick, onToggleFav }: RowProps) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-blue-100)' : '#fff', marginBottom: 8,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-heading)' }}>{s.label}</div>
      <svg onClick={onToggleFav} width="18" height="18" viewBox="0 0 24 24" fill={favourite ? 'var(--kairo-gold-500)' : 'none'} stroke={favourite ? 'var(--kairo-gold-600)' : 'var(--kairo-ink-300)'} strokeWidth="2"><path d="M12 17.3l-6.2 3.6 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z" /></svg>
    </div>
  );
}

export function SubjectSelect({ onBack, onPick, recentKeys }: SubjectSelectProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Record<string, boolean>>({});

  const recents = (recentKeys || []).map((k) => subjects.find((s) => s.key === k)).filter((s): s is Subject => Boolean(s));
  const favSubjects = subjects.filter((s) => favourites[s.key]);
  const filtered = subjects.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  function toggleFav(e: React.MouseEvent, key: string) { e.stopPropagation(); setFavourites((f) => ({ ...f, [key]: !f[key] })); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Practice" />
      <div style={{ padding: '10px 20px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Choose a subject to practise.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border-subtle)', marginBottom: 20 }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}><SearchIcon /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subjects" style={{
            border: 'none', outline: 'none', flex: 1, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text-heading)', background: 'transparent',
          }} />
        </div>

        {!query && recents.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 8 }}>RECENT</div>
            {recents.map((s) => <Row key={s.key} s={s} active={selected === s.key} favourite={!!favourites[s.key]} onClick={() => setSelected(s.key)} onToggleFav={(e) => toggleFav(e, s.key)} />)}
          </div>
        )}
        {!query && favSubjects.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 8 }}>FAVOURITES</div>
            {favSubjects.map((s) => <Row key={s.key} s={s} active={selected === s.key} favourite={!!favourites[s.key]} onClick={() => setSelected(s.key)} onToggleFav={(e) => toggleFav(e, s.key)} />)}
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 8 }}>{query ? 'RESULTS' : 'ALL SUBJECTS'}</div>
          {filtered.map((s) => <Row key={s.key} s={s} active={selected === s.key} favourite={!!favourites[s.key]} onClick={() => setSelected(s.key)} onToggleFav={(e) => toggleFav(e, s.key)} />)}
        </div>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="primary" size="lg" fullWidth disabled={!selected} onClick={() => { const s = subjects.find((s) => s.key === selected); if (s) onPick(s); }}>Continue</Button>
      </div>
    </div>
  );
}
