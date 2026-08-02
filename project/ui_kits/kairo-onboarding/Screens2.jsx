function VerifyEmail({ step, total, onBack, email, onVerified }) {
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const { FlowHeader } = window.KairoOnboardingUI;
  const [digits, setDigits] = React.useState(['', '', '', '', '', '']);
  const refs = React.useRef([]);
  function setDigit(i, v) {
    if (v && !/^[0-9]$/.test(v)) return;
    const next = [...digits]; next[i] = v; setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }
  const complete = digits.every((d) => d !== '');
  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 22, flex: 1 }}>
      <FlowHeader onBack={onBack} step={step} total={total} />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-heading)' }}>Verify your email</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>Enter the 6-digit code we sent to <strong style={{ color: 'var(--text-heading)' }}>{email || 'your email'}</strong>.</div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => (refs.current[i] = el)} value={d} onChange={(e) => setDigit(i, e.target.value)} maxLength={1} inputMode="numeric"
            style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', borderRadius: 'var(--radius-md)', border: `1.5px solid ${d ? 'var(--kairo-blue-700)' : 'var(--color-border-subtle)'}`, outline: 'none', fontFamily: 'var(--font-body)' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>Didn't get a code? <a href="#">Resend</a></div>
      <Button variant="primary" size="lg" fullWidth disabled={!complete} onClick={onVerified}>Verify &amp; Continue</Button>
    </div>
  );
}

function AboutYou({ step, total, onBack, data, setData, onContinue }) {
  const { Input, Checkbox, Button } = window.KairoDesignSystem_1c2e7f;
  const { FlowHeader, SkipLink } = window.KairoOnboardingUI;
  const { examYears, courses, allSubjects } = window.KairoOnboardingData;
  const [query, setQuery] = React.useState(data.course ? data.course.name : '');
  const [showList, setShowList] = React.useState(false);
  const [subjectQuery, setSubjectQuery] = React.useState('');
  const filtered = courses.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const subjectMatches = allSubjects.filter((s) => !data.subjects.includes(s) && s.toLowerCase().includes(subjectQuery.toLowerCase()));

  function pickCourse(c) {
    setData({ ...data, course: c, subjects: c ? [...c.subjects] : [] });
    setQuery(c ? c.name : '');
    setShowList(false);
  }
  function toggleSubject(subj) {
    const subjects = data.subjects.includes(subj) ? data.subjects.filter((s) => s !== subj) : [...data.subjects, subj];
    setData({ ...data, subjects });
  }
  function addSubject(subj) {
    if (!data.subjects.includes(subj)) setData({ ...data, subjects: [...data.subjects, subj] });
    setSubjectQuery('');
  }
  const canContinue = !!data.examYear;

  return (
    <div style={{ padding: '20px 24px 28px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
      <FlowHeader onBack={onBack} step={step} total={total} />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-heading)' }}>Tell us about yourself</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>This helps Kairo personalise your practice from day one.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 10 }}>Exam Year</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {examYears.map((y) => {
            const active = data.examYear === y;
            return (
              <div key={y} onClick={() => setData({ ...data, examYear: y })} style={{
                flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-navy-900)' : '#fff', color: active ? '#fff' : 'var(--text-body)',
              }}>{y}</div>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 10 }}>Intended Course</div>
        <Input placeholder="Search for your course" value={query} onFocus={() => setShowList(true)} onChange={(e) => { setQuery(e.target.value); setShowList(true); }}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>} />
        {showList && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', maxHeight: 220, overflowY: 'auto', zIndex: 5 }}>
            {filtered.map((c) => (
              <div key={c.name} onClick={() => pickCourse(c)} style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text-body)', cursor: 'pointer', borderBottom: '1px solid var(--color-border-subtle)' }}>{c.name}</div>
            ))}
            {filtered.length === 0 && <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>No matching course.</div>}
          </div>
        )}
        {data.course && !showList && <div style={{ marginTop: 8 }}><SkipLink onClick={() => pickCourse(null)}>Clear selection</SkipLink></div>}
        {!data.course && <div style={{ marginTop: 10 }}><SkipLink onClick={() => setShowList(false)}>Skip for now</SkipLink></div>}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 10 }}>Subjects</div>
        {data.course && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Suggested for {data.course.name} \u2014 deselect any, or add more below.</div>
        )}
        {data.subjects.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {data.subjects.map((s) => (
              <span key={s} onClick={() => toggleSubject(s)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--kairo-blue-700)', background: 'var(--kairo-blue-100)', padding: '7px 10px 7px 12px', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}>
                {s}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-blue-700)" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </span>
            ))}
          </div>
        )}
        <Input placeholder="Search UTME subjects to add" value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>} />
        {subjectQuery && (
          <div style={{ marginTop: 6, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', maxHeight: 180, overflowY: 'auto' }}>
            {subjectMatches.map((s) => (
              <div key={s} onClick={() => addSubject(s)} style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text-body)', cursor: 'pointer', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                {s} <span style={{ color: 'var(--kairo-blue-700)', fontWeight: 600 }}>+ Add</span>
              </div>
            ))}
            {subjectMatches.length === 0 && <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>No matching subject.</div>}
          </div>
        )}
        {!data.course && data.subjects.length === 0 && !subjectQuery && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '14px 16px', marginTop: 10, background: 'var(--kairo-blue-100)', borderRadius: 'var(--radius-md)' }}>Choose a course above for suggestions, or search to add subjects yourself.</div>
        )}
      </div>

      <Button variant="primary" size="lg" fullWidth disabled={!canContinue} onClick={onContinue}>Continue</Button>
    </div>
  );
}

window.KairoOnboardingUI = { ...window.KairoOnboardingUI, VerifyEmail, AboutYou };
