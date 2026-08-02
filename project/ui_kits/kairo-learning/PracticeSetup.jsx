function SubjectSelect({ onBack, onPick, recentKeys }) {
  const { ScreenHeader, SearchIcon } = window.KairoLearningUI;
  const { subjects } = window.KairoLearningData;
  const { Button } = window.KairoDesignSystem_1c2e7f;
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [favourites, setFavourites] = React.useState({});

  const recents = (recentKeys || []).map((k) => subjects.find((s) => s.key === k)).filter(Boolean);
  const favSubjects = subjects.filter((s) => favourites[s.key]);
  const filtered = subjects.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  function toggleFav(e, key) { e.stopPropagation(); setFavourites((f) => ({ ...f, [key]: !f[key] })); }

  function Row({ s }) {
    const active = selected === s.key;
    return (
      <div onClick={() => setSelected(s.key)} style={{
        padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-blue-100)' : '#fff', marginBottom: 8,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-heading)' }}>{s.label}</div>
        <svg onClick={(e) => toggleFav(e, s.key)} width="18" height="18" viewBox="0 0 24 24" fill={favourites[s.key] ? 'var(--kairo-gold-500)' : 'none'} stroke={favourites[s.key] ? 'var(--kairo-gold-600)' : 'var(--kairo-ink-300)'} strokeWidth="2"><path d="M12 17.3l-6.2 3.6 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z" /></svg>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Practice" />
      <div style={{ padding: '10px 20px 0', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
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
            {recents.map((s) => <Row key={s.key} s={s} />)}
          </div>
        )}
        {!query && favSubjects.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 8 }}>FAVOURITES</div>
            {favSubjects.map((s) => <Row key={s.key} s={s} />)}
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 8 }}>{query ? 'RESULTS' : 'ALL SUBJECTS'}</div>
          {filtered.map((s) => <Row key={s.key} s={s} />)}
        </div>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="primary" size="lg" fullWidth disabled={!selected} onClick={() => onPick(subjects.find((s) => s.key === selected))}>Continue</Button>
      </div>
    </div>
  );
}

function TopicSelect({ subject, onBack, onPick }) {
  const { ScreenHeader, OptionRow } = window.KairoLearningUI;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title={subject.label} />
      <div style={{ padding: '10px 20px 24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>Pick a topic.</div>
        {subject.topics.map((t) => <OptionRow key={t.key} label={t.label} subtitle={t.subtopics.length ? `${t.subtopics.length} sub-topics` : undefined} onClick={() => onPick(t)} />)}
      </div>
    </div>
  );
}

function SubtopicSelect({ subject, topic, onBack, onPick, onSkip }) {
  const { ScreenHeader, OptionRow } = window.KairoLearningUI;
  const { SkipLink } = window.KairoLearningUI;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title={topic.label} />
      <div style={{ padding: '10px 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>Narrow it down, or practise the whole topic.</div>
        {topic.subtopics.map((s) => <OptionRow key={s} label={s} onClick={() => onPick(s)} />)}
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--text-link)', cursor: 'pointer', fontWeight: 600 }} onClick={onSkip}>Practise all of {topic.label}</div>
      </div>
    </div>
  );
}

function DifficultySelect({ onBack, value, onChange, onContinue }) {
  const { ScreenHeader } = window.KairoLearningUI;
  const { difficulties } = window.KairoLearningData;
  const { Button } = window.KairoDesignSystem_1c2e7f;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Difficulty" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>How challenging should this session be?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {difficulties.map((d) => {
            const active = value === d.key;
            return (
              <div key={d.key} onClick={() => onChange(d.key)} style={{
                padding: '16px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-blue-100)' : '#fff',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>{d.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{d.desc}</div>
              </div>
            );
          })}
        </div>
        <Button variant="primary" size="lg" fullWidth disabled={!value} onClick={onContinue} style={{ marginTop: 'auto' }}>Continue</Button>
      </div>
    </div>
  );
}

function SessionSetup({ onBack, length, onLengthChange, onStart, summary }) {
  const { ScreenHeader } = window.KairoLearningUI;
  const { sessionLengths } = window.KairoLearningData;
  const { Button } = window.KairoDesignSystem_1c2e7f;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Session Setup" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: 'var(--kairo-blue-100)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em' }}>YOU'RE PRACTISING</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', marginTop: 6 }}>{summary}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 10 }}>How many questions?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {sessionLengths.map((n) => {
              const active = length === n;
              return (
                <div key={n} onClick={() => onLengthChange(n)} style={{
                  flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-navy-900)' : '#fff', color: active ? '#fff' : 'var(--text-body)',
                }}>{n}</div>
              );
            })}
          </div>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onStart} style={{ marginTop: 'auto' }}>Start Practice</Button>
      </div>
    </div>
  );
}

window.KairoLearningUI = { ...window.KairoLearningUI, SubjectSelect, TopicSelect, SubtopicSelect, DifficultySelect, SessionSetup };
