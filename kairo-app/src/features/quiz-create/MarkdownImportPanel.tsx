import { useMemo, useState } from 'react';
import { Button, Card } from '../../components';
import { createCommunityQuestion, type QuestionRef } from '../../lib/quizApi';
import { ARENA_MARKDOWN_TEMPLATE, parseArenaMarkdown, type ParsedMarkdownQuestion } from './markdownImport';

interface Props {
  defaultSubject: string;
  onImported: (refs: QuestionRef[]) => void;
}

export function MarkdownImportPanel({ defaultSubject, onImported }: Props) {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const parsed = useMemo(() => {
    if (!content.trim()) return [];
    try {
      return parseArenaMarkdown(content);
    } catch {
      return [{ row: 1, subject: defaultSubject, topic: '', stem: '', options: [], explanation: '', distractorExplanations: {}, hint: '', imageUrl: '', difficulty: 'medium' as const, warnings: [], errors: ['KAIRO could not read this Markdown file. Check the template and try again.'] }];
    }
  }, [content, defaultSubject]);
  const valid = parsed.filter((q) => q.errors.length === 0);

  function downloadTemplate() {
    const blob = new Blob([ARENA_MARKDOWN_TEMPLATE], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kairo-arena-question-template.md';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    if (!file.name.toLowerCase().endsWith('.md') && file.type !== 'text/markdown' && file.type !== 'text/plain') {
      setFileName('');
      setMessage('Please choose a Markdown file ending in .md.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileName('');
      setMessage('This file is larger than 2 MB. Split it into smaller Markdown files and try again.');
      return;
    }
    try {
      setFileName(file.name);
      setContent(await file.text());
    } catch {
      setFileName('');
      setMessage('KAIRO could not read that file. Try saving it as UTF-8 Markdown.');
    }
  }

  async function submitQuestions() {
    if (!valid.length || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const refs: QuestionRef[] = [];
      for (const question of valid) {
        const created = await createCommunityQuestion({
          subject: question.subject || defaultSubject,
          topic: question.topic,
          stem: question.stem,
          options: question.options,
          explanation: question.explanation,
          distractorExplanations: question.distractorExplanations,
          hint: question.hint,
          difficulty: question.difficulty,
        });
        if (created.status === 'needs_fixes') throw new Error(`Question ${question.row} needs fixes before it can be used.`);
        refs.push({ source: 'community', id: created.id, stem: created.stem });
      }
      onImported(refs);
      setMessage(`${refs.length} question${refs.length === 1 ? '' : 's'} submitted for moderation and added to this quiz.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not submit the imported questions.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-text-heading)', fontSize: 16 }}>Bulk upload in Markdown</div>
        <div style={{ color: 'var(--dark-text-muted)', fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
          Write many questions in one readable file. Arena checks the format before sending valid questions through KAIRO’s community moderation workflow.
        </div>
        <button type="button" onClick={downloadTemplate} style={{ marginTop: 12, border: 0, background: 'transparent', color: 'var(--arena-gold)', fontWeight: 800, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
          Download the KAIRO Arena template
        </button>
      </Card>

      <label style={{ border: '1px dashed var(--dark-border)', borderRadius: 'var(--radius-md)', padding: 18, color: 'var(--dark-text-muted)', textAlign: 'center', cursor: 'pointer' }}>
        <input type="file" accept=".md,text/markdown,text/plain" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />
        {fileName ? `Selected: ${fileName}` : 'Choose a .md file'}
      </label>
      <textarea value={content} onChange={(e) => { setContent(e.target.value); setFileName(''); }} placeholder="Paste your KAIRO Arena Markdown here…" rows={9} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)', background: 'var(--dark-bg-surface)', color: 'var(--dark-text-heading)', padding: 12, fontFamily: 'monospace', fontSize: 12 }} />

      {parsed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: 'var(--dark-text-muted)', fontSize: 12 }}>{valid.length} of {parsed.length} question{parsed.length === 1 ? '' : 's'} ready</div>
          {parsed.map((question) => <ImportRow key={question.row} question={question} />)}
          <Button variant="darkAccent" size="lg" disabled={!valid.length || submitting} onClick={submitQuestions}>
            {submitting ? 'Submitting questions…' : `Submit ${valid.length} question${valid.length === 1 ? '' : 's'} for review`}
          </Button>
        </div>
      )}
      {message && <div role="status" style={{ color: message.includes('Could not') || message.includes('needs fixes') ? 'var(--dark-danger)' : 'var(--arena-gold)', fontSize: 13, lineHeight: 1.45 }}>{message}</div>}
    </div>
  );
}

function ImportRow({ question }: { question: ParsedMarkdownQuestion }) {
  return (
    <Card style={{ background: 'var(--dark-bg-elevated)', border: `1px solid ${question.errors.length ? 'rgba(221,92,92,.55)' : 'var(--dark-border)'}`, boxShadow: 'none', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ color: 'var(--dark-text-heading)', fontSize: 13, fontWeight: 800 }}>Question {question.row}</div>
        <div style={{ color: question.errors.length ? 'var(--dark-danger)' : 'var(--arena-gold)', fontSize: 12, fontWeight: 700 }}>{question.errors.length ? `${question.errors.length} error${question.errors.length === 1 ? '' : 's'}` : 'Ready'}</div>
      </div>
      <div style={{ color: 'var(--dark-text-body)', fontSize: 13, lineHeight: 1.45, marginTop: 6 }}>{question.stem || 'No question text found'}</div>
      {question.errors.length > 0 && <ul style={{ color: 'var(--dark-danger)', fontSize: 12, lineHeight: 1.45, margin: '8px 0 0', paddingLeft: 18 }}>{question.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      {question.warnings.length > 0 && <div style={{ color: 'var(--dark-text-muted)', fontSize: 11, marginTop: 6 }}>{question.warnings.join(' · ')}</div>}
    </Card>
  );
}
