import { useState } from 'react';
import { Input, Button } from '../../components';
import { FlowHeader, SkipLink } from './shared';
import { courses, allSubjects, type Course, type OnboardingData } from './data';
import { hasSeededContent } from '../../lib/kairoEngine';

function ComingSoonTag() {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--dark-text-muted)', background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-pill)', padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
      Coming soon
    </span>
  );
}

export interface AboutYouProps {
  step: number;
  total: number;
  onBack: () => void;
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onContinue: () => void;
}

const courseStyle: Record<string, { color: string; icon: string }> = {
  'Medicine & Surgery': { color: '#2E7CF6', icon: 'M9 3v4M15 3v4M9 21a4 4 0 004-4V9a4 4 0 118 0M5 9h4' },
  'Nursing Science': { color: '#E0568C', icon: 'M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z' },
  'Pharmacy': { color: '#2ECC8F', icon: 'M10 3L21 14a4 4 0 01-5.5 5.5L4 8l6-5zM8 10l6 6' },
  'Engineering (All)': { color: '#7C6CF0', icon: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1' },
  'Computer Science': { color: '#28B5C4', icon: 'M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12' },
  'Law': { color: '#9B6BE0', icon: 'M12 3v3M4 21h16M6 8l6-3 6 3M4 8h16l-2 6H6zM7 14v4M17 14v4' },
  'Accounting': { color: '#E0A039', icon: 'M4 5h16v14H4zM8 9h8M8 13h8M8 17h5' },
  'Economics': { color: '#2E7CF6', icon: 'M4 20V10M11 20V4M18 20v-7' },
  'Mass Communication': { color: '#E05555', icon: 'M4 10v4h4l6 4V6l-6 4H4zM17 8a4 4 0 010 8' },
  'Architecture': { color: '#93A6C9', icon: 'M4 21V9l8-6 8 6v12M9 21v-6h6v6' },
};
const defaultCourseStyle = { color: '#2E7CF6', icon: 'M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z' };

export function AboutYou({ step, total, onBack, data, setData, onContinue }: AboutYouProps) {
  const [query, setQuery] = useState(data.course ? data.course.name : '');
  const [showList, setShowList] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState('');
  const filtered = courses.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const subjectMatches = allSubjects.filter((s) => !data.subjects.includes(s) && s.toLowerCase().includes(subjectQuery.toLowerCase()));

  function pickCourse(c: Course | null) {
    setData({ ...data, course: c, subjects: c ? [...c.subjects] : [] });
    setQuery(c ? c.name : '');
    setShowList(false);
  }
  function toggleSubject(subj: string) {
    const subjects = data.subjects.includes(subj) ? data.subjects.filter((s) => s !== subj) : [...data.subjects, subj];
    setData({ ...data, subjects });
  }
  function addSubject(subj: string) {
    if (!data.subjects.includes(subj)) setData({ ...data, subjects: [...data.subjects, subj] });
    setSubjectQuery('');
  }
  const today = new Date().toISOString().slice(0, 10);
  const canContinue = !!data.examDate;

  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <FlowHeader onBack={onBack} step={step} total={total} tone="dark" />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--dark-text-heading)' }}>Let's personalize your experience</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 6 }}>Tell us a little about your UTME.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 6 }}>When is your UTME?</div>
        <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginBottom: 10 }}>If you don't know exactly, guess close — Kairo adjusts as you go.</div>
        <Input tone="dark" type="date" min={today} value={data.examDate ?? ''} onChange={(e) => setData({ ...data, examDate: e.target.value || null })}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>} />
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 10 }}>What course are you aiming for?</div>
        <Input tone="dark" placeholder="Search for your course" value={query} onFocus={() => setShowList(true)} onChange={(e) => { setQuery(e.target.value); setShowList(true); }} onClear={() => pickCourse(null)}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>} />
        {showList && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', maxHeight: 260, overflowY: 'auto', zIndex: 5 }}>
            {filtered.map((c) => {
              const cs = courseStyle[c.name] || defaultCourseStyle;
              const active = data.course?.name === c.name;
              const readyCount = c.subjects.filter(hasSeededContent).length;
              return (
                <button type="button" key={c.name} onClick={() => pickCourse(c)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)', cursor: 'pointer',
                  border: 'none', borderBottom: '1px solid var(--dark-border)', background: active ? 'rgba(46,124,246,0.12)' : 'none', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: `${cs.color}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cs.color} strokeWidth="2"><path d={cs.icon} /></svg>
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {c.name}
                    {readyCount < c.subjects.length && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-text-muted)', marginTop: 2 }}>
                        {readyCount} of {c.subjects.length} subjects ready now
                      </div>
                    )}
                  </span>
                  {active && <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--dark-accent-blue)" style={{ marginLeft: 'auto', flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" fill="none" stroke="#fff" strokeWidth="2" /></svg>}
                </button>
              );
            })}
            {filtered.length === 0 && <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--dark-text-muted)' }}>No matching course.</div>}
          </div>
        )}
        {!data.course && <div style={{ marginTop: 10 }}><SkipLink tone="dark" onClick={() => setShowList(false)}>Skip for now</SkipLink></div>}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 10 }}>We've prepared your subjects</div>
        {data.course && (
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginBottom: 10 }}>Based on your target course — deselect any, or add more below.</div>
        )}
        {data.subjects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {data.subjects.map((s) => (
              <button type="button" key={s} onClick={() => toggleSubject(s)} aria-label={`Remove ${s}`} aria-pressed style={{
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)',
                background: 'var(--dark-bg-surface)', border: '1px solid rgba(46,204,143,0.4)', padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)', width: '100%', textAlign: 'left',
              }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(46,204,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dark-success)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" /></svg>
                </span>
                <span style={{ flex: 1 }}>{s}</span>
                {!hasSeededContent(s) && <ComingSoonTag />}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--dark-success)"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" fill="none" stroke="var(--dark-bg-canvas)" strokeWidth="2" /></svg>
              </button>
            ))}
          </div>
        )}
        <Input tone="dark" placeholder="Search UTME subjects to add" value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>} />
        {subjectQuery && (
          <div style={{ marginTop: 6, background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', maxHeight: 180, overflowY: 'auto' }}>
            {subjectMatches.map((s) => (
              <button type="button" key={s} onClick={() => addSubject(s)} style={{
                width: '100%', padding: '12px 16px', fontSize: 14, color: 'var(--dark-text-heading)', cursor: 'pointer', minHeight: 'var(--touch-min)',
                border: 'none', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', background: 'none', fontFamily: 'inherit',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{s} {!hasSeededContent(s) && <ComingSoonTag />}</span>
                <span style={{ color: 'var(--dark-accent-blue)', fontWeight: 600 }}>+ Add</span>
              </button>
            ))}
            {subjectMatches.length === 0 && <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--dark-text-muted)' }}>No matching subject.</div>}
          </div>
        )}
        {!data.course && data.subjects.length === 0 && !subjectQuery && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--dark-text-muted)', padding: '14px 16px', marginTop: 10, background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /></svg>
            Need to make changes? You can edit your subjects if needed.
          </div>
        )}
      </div>

      <Button variant="darkAccent" size="lg" fullWidth disabled={!canContinue} onClick={onContinue}>Continue</Button>
    </div>
  );
}
