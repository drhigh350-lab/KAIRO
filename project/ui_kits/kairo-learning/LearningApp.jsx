const lrnStyles = {
  shell: { maxWidth: 420, margin: '40px auto', background: '#fff', minHeight: 844, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', position: 'relative' },
};

function ModeSelect({ onPractice, onCbt, onQuick, hasHistory }) {
  const { Card } = window.KairoDesignSystem_1c2e7f;
  const quickActions = [
    { key: 'subject', label: 'Subject Practice' },
    { key: 'topic', label: 'Topic Practice' },
    { key: 'mixed', label: 'Mixed Practice' },
    { key: 'weak', label: 'Weak Areas', locked: !hasHistory },
    { key: 'suggested', label: "Today's Mission" },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '32px 20px', fontFamily: 'var(--font-body)', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--text-heading)' }}>Learn</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Two ways to move forward, both built around questions.</div>
      <div onClick={onPractice} style={{ cursor: 'pointer' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-heading)' }}>Practice Mode</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Untimed, focused practice with explanations and Kai's guidance after every question.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {quickActions.map((a) => (
              <span key={a.key} onClick={(e) => { e.stopPropagation(); if (!a.locked) onQuick(a.key); }} style={{
                fontSize: 12, fontWeight: 600, padding: '8px 12px', borderRadius: 'var(--radius-pill)', cursor: a.locked ? 'default' : 'pointer',
                opacity: a.locked ? 0.5 : 1, border: '1px solid var(--color-border-subtle)', color: 'var(--kairo-navy-900)', background: '#fff',
              }}>{a.label}</span>
            ))}
          </div>
        </Card>
      </div>
      <div onClick={onCbt} style={{ cursor: 'pointer' }}>
        <Card style={{ background: 'var(--kairo-navy-900)', color: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>CBT Exam Mode</div>
          <div style={{ fontSize: 13, color: 'var(--kairo-blue-200)', lineHeight: 1.5 }}>A realistic, timed JAMB simulation — question palette, calculator, and all.</div>
        </Card>
      </div>
    </div>
  );
}

function KairoLearningApp() {
  const U = window.KairoLearningUI;
  const [screen, setScreen] = React.useState('mode');
  const [history, setHistory] = React.useState([]);
  const [subject, setSubject] = React.useState(null);
  const [topic, setTopic] = React.useState(null);
  const [subtopic, setSubtopic] = React.useState(null);
  const [difficulty, setDifficulty] = React.useState(null);
  const [length, setLength] = React.useState(10);
  const [practiceType, setPracticeType] = React.useState(null);
  const [entryFlow, setEntryFlow] = React.useState('subject');
  const [recentKeys, setRecentKeys] = React.useState([]);
  const [hasHistory, setHasHistory] = React.useState(false);
  const [qIndex, setQIndex] = React.useState(0);
  const [results, setResults] = React.useState([]);
  const [cbtAnswers, setCbtAnswers] = React.useState({});
  const [cbtQuestions, setCbtQuestions] = React.useState([]);

  function go(next) { setHistory((h) => [...h, screen]); setScreen(next); }
  function back() { setHistory((h) => { const n = [...h]; const prev = n.pop(); if (prev) setScreen(prev); return n; }); }
  function toHome() { setScreen('mode'); setHistory([]); setQIndex(0); setResults([]); setSubject(null); setTopic(null); setSubtopic(null); setDifficulty(null); }

  function startQuick(kind) {
    setEntryFlow(kind);
    if (kind === 'subject') { go('subject'); }
    else if (kind === 'topic') { go('subject'); }
    else if (kind === 'mixed') { setSubject({ key: 'mixed', label: 'All Subjects' }); setTopic(null); setSubtopic(null); go('practiceHub'); }
    else if (kind === 'weak') { setSubject({ key: 'weak', label: 'Weak Areas' }); setTopic(null); setSubtopic(null); go('practiceHub'); }
    else if (kind === 'suggested') { setSubject(window.KairoLearningData.subjects[0]); setDifficulty('adaptive'); setLength(5); setQIndex(0); setResults([]); go('practiceQuestion'); }
  }

  const practiceQuestions = window.KairoLearningData.practiceQuestions;

  function handleNextQuestion({ correct, confidence }) {
    const newResults = [...results, { correct, confidence, time: 40 + Math.floor(Math.random() * 30) }];
    setResults(newResults);
    if (qIndex + 1 >= practiceQuestions.length) { setHasHistory(true); go('practiceSummary'); }
    else { setQIndex(qIndex + 1); }
  }

  function summaryFor() {
    let s = subject ? subject.label : '';
    if (topic) s += ` \u2192 ${topic.label}`;
    if (subtopic) s += ` \u2192 ${subtopic}`;
    if (difficulty) s += ` \u2022 ${difficulty[0].toUpperCase() + difficulty.slice(1)}`;
    return s || 'Mixed practice';
  }

  let body;
  if (screen === 'mode') body = <ModeSelect onPractice={() => startQuick('subject')} onCbt={() => go('examSetup')} onQuick={startQuick} hasHistory={hasHistory} />;
  else if (screen === 'subject') body = <U.SubjectSelect onBack={toHome} recentKeys={recentKeys} onPick={(s) => { setSubject(s); setRecentKeys((k) => [s.key, ...k.filter((x) => x !== s.key)].slice(0, 3)); if (entryFlow === 'topic') { go('topic'); } else { go('practiceHub'); } }} />;
  else if (screen === 'practiceHub') body = <U.PracticeHub subject={subject} hasHistory={hasHistory} lockedType={entryFlow === 'mixed' ? 'mixed' : entryFlow === 'weak' ? 'weak' : undefined} onBack={back} onStart={({ type, difficulty, length }) => { setPracticeType(type); setDifficulty(difficulty); setLength(length); if (type === 'topic') { go('topic'); } else { setTopic(null); setSubtopic(null); setQIndex(0); setResults([]); go('practiceQuestion'); } }} />;
  else if (screen === 'topic') body = <U.TopicSelect subject={subject} onBack={back} onPick={(t) => { setTopic(t); if (t.subtopics.length) go('subtopic'); else { setQIndex(0); setResults([]); go('practiceQuestion'); } }} />;
  else if (screen === 'subtopic') body = <U.SubtopicSelect subject={subject} topic={topic} onBack={back} onPick={(s) => { setSubtopic(s); setQIndex(0); setResults([]); go('practiceQuestion'); }} onSkip={() => { setQIndex(0); setResults([]); go('practiceQuestion'); }} />;
  else if (screen === 'practiceQuestion') body = <U.PracticeQuestion key={practiceQuestions[qIndex].id} question={practiceQuestions[qIndex]} index={qIndex} total={practiceQuestions.length} onNext={handleNextQuestion} onExit={toHome} />;
  else if (screen === 'practiceSummary') body = <U.PracticeSummary results={results} onHome={toHome} onAction={(key) => {
    if (key === 'weak') { setSubject({ key: 'weak', label: 'Weak Areas' }); setEntryFlow('weak'); go('practiceHub'); }
    else if (key === 'retry') { setQIndex(0); go('practiceQuestion'); }
    else if (key === 'challenge') { setDifficulty('hard'); setQIndex(0); setResults([]); go('practiceQuestion'); }
    else if (key === 'cbt') { go('examSetup'); }
    else if (key === 'review') { setQIndex(0); go('practiceQuestion'); }
  }} />;
  else if (screen === 'examSetup') body = <U.ExamSetup onBack={toHome} onContinue={() => go('examInstructions')} />;
  else if (screen === 'examInstructions') body = <U.ExamInstructions onBack={back} onBegin={() => go('cbtExam')} />;
  else if (screen === 'cbtExam') body = <U.CbtExam onExit={toHome} onSubmit={(answers, questions) => { setCbtAnswers(answers); setCbtQuestions(questions); go('cbtSummary'); }} />;
  else if (screen === 'cbtSummary') body = <U.CbtSummary answers={cbtAnswers} questions={cbtQuestions} onHome={toHome} onReview={() => go('cbtReview')} />;
  else if (screen === 'cbtReview') body = <U.CbtReview answers={cbtAnswers} questions={cbtQuestions} onBack={back} />;

  return (
    <div style={lrnStyles.shell}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>{body}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<KairoLearningApp />);
