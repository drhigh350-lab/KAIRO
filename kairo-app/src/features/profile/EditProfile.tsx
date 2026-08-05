import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { allSubjects } from '../onboarding/data';
import { getProfileSummary, updateProfileDetails } from '../../lib/kairoEngine';

export function EditProfile() {
  const navigate = useNavigate();
  const profile = getProfileSummary();

  const [name, setName] = useState(profile?.name || '');
  const [course, setCourse] = useState(profile?.targetCourse || '');
  const [university, setUniversity] = useState(profile?.targetUniversity || '');
  const [examDate, setExamDate] = useState(profile?.examDate ? new Date(profile.examDate).toISOString().slice(0, 10) : '');
  const [subjects, setSubjects] = useState<string[]>(profile?.targetSubjects || []);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [targetScore, setTargetScore] = useState(profile?.targetUTMEScore != null ? String(profile.targetUTMEScore) : '');
  const [studyDuration, setStudyDuration] = useState(profile?.preferredStudyDurationMin != null ? String(profile.preferredStudyDurationMin) : '');
  const [studyPeriod, setStudyPeriod] = useState(profile?.preferredStudyPeriod || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const subjectMatches = allSubjects.filter((s) => !subjects.includes(s) && s.toLowerCase().includes(subjectQuery.toLowerCase()));

  function toggleSubject(subj: string) {
    setSubjects((s) => (s.includes(subj) ? s.filter((x) => x !== subj) : [...s, subj]));
  }
  function addSubject(subj: string) {
    if (!subjects.includes(subj)) setSubjects((s) => [...s, subj]);
    setSubjectQuery('');
  }

  async function handleSave() {
    if (!name.trim()) { setError('Enter your name.'); return; }
    setSaving(true);
    setError('');
    try {
      const parsedScore = parseInt(targetScore, 10);
      const parsedDuration = parseInt(studyDuration, 10);
      await updateProfileDetails({
        name: name.trim(),
        targetCourse: course.trim() || null,
        targetUniversity: university.trim() || null,
        targetSubjects: subjects,
        examDate: examDate || null,
        targetUTMEScore: Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : null,
        preferredStudyDurationMin: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : null,
        preferredStudyPeriod: (studyPeriod as 'morning' | 'evening' | 'late_night') || null,
      });
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Edit Profile" tone="dark" />
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input tone="dark" label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} error={error || undefined} />

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Target course</div>
          <Input tone="dark" placeholder="e.g. Medicine & Surgery" value={course} onChange={(e) => setCourse(e.target.value)} />
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Target university</div>
          <Input tone="dark" placeholder="e.g. University of Lagos" value={university} onChange={(e) => setUniversity(e.target.value)} />
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Exam date</div>
          <Input tone="dark" type="date" min={today} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Target UTME score</div>
          <Input tone="dark" type="number" min="0" max="400" placeholder="e.g. 320" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} />
          <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', marginTop: 6 }}>Your own definition of "ready" — applies from today forward, past reports won't change.</div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Preferred study duration</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[20, 45, 60].map((n) => {
              const active = studyDuration === String(n);
              return (
                <button type="button" key={n} aria-pressed={active} onClick={() => setStudyDuration(String(n))} style={{
                  flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                  border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
                }}>{n} min</button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Preferred study period</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ key: 'morning', label: 'Morning' }, { key: 'evening', label: 'Evening' }, { key: 'late_night', label: 'Late night' }].map((p) => {
              const active = studyPeriod === p.key;
              return (
                <button type="button" key={p.key} aria-pressed={active} onClick={() => setStudyPeriod(p.key)} style={{
                  flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                  border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
                }}>{p.label}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', marginTop: 6 }}>Used only for notification timing — never a hard constraint.</div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Subjects</div>
          {subjects.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {subjects.map((s) => (
                <button type="button" key={s} onClick={() => toggleSubject(s)} style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--dark-accent-blue)', background: 'rgba(46,124,246,0.15)',
                  padding: '6px 10px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                }}>{s} ✕</button>
              ))}
            </div>
          )}
          <Input tone="dark" placeholder="Search subjects to add" value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)} />
          {subjectQuery && (
            <div style={{ marginTop: 6, background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', maxHeight: 180, overflowY: 'auto' }}>
              {subjectMatches.map((s) => (
                <button type="button" key={s} onClick={() => addSubject(s)} style={{
                  width: '100%', padding: '12px 16px', fontSize: 14, color: 'var(--dark-text-heading)', cursor: 'pointer', minHeight: 'var(--touch-min)',
                  border: 'none', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', background: 'none', fontFamily: 'inherit',
                }}>{s} <span style={{ color: 'var(--dark-accent-blue)', fontWeight: 600 }}>+ Add</span></button>
              ))}
              {subjectMatches.length === 0 && <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--dark-text-muted)' }}>No matching subject.</div>}
            </div>
          )}
        </div>

        <Button variant="darkAccent" size="lg" fullWidth disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
