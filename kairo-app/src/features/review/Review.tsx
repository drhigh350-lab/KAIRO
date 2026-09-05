import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '../../components';
import { InlineToast } from '../learning/shared';
import { CbtReview } from '../cbt/CbtReview';
import {
  loadReviewData, getPendingRepairsCount, getRecentMistakes, markMistakeUnderstood, getWeakTopicsForReview,
  getBookmarkedQuestions, removeBookmark, getSessionHistory, getCbtHistory,
  type MistakeTicket, type WeakTopicForReview, type BookmarkedQuestion, type SessionHistoryEntry, type CbtHistoryEntry, type CbtPaperQuestion,
} from '../../lib/kairoEngine';

function relativeDay(ts: number): string {
  const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString();
}

function ChevronIcon({ open }: { open: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)', flexShrink: 0 }}><path d="M6 9l6 6 6-6" /></svg>;
}

function CheckIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-gold-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>;
}

/**
 * Batch 1's Hero Metric + Smart Patch. "Loaded" gates both the number and
 * the CTA — Exposed Gaps reads live graph/attempt state that only exists
 * once loadReviewData() has resolved at least once this session (Review
 * can be the very first screen a student lands on), so a flash of
 * "0 Exposed Gaps" before that would misreport, not just look empty.
 */
function HeroCard({ loaded, pendingCount, onStartSmartPatch }: { loaded: boolean; pendingCount: number; onStartSmartPatch: () => void }) {
  const zero = loaded && pendingCount === 0;
  return (
    <Card style={{
      background: 'var(--dark-bg-surface)',
      border: zero ? '1.5px solid var(--kairo-gold-500)' : '1px solid var(--dark-border)',
      boxShadow: 'none', textAlign: 'center', padding: 28,
    }}>
      {zero ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,162,39,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckIcon />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 46, color: 'var(--dark-text-heading)', lineHeight: 1 }}>0</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--dark-text-muted)', textTransform: 'uppercase', marginTop: 8 }}>Exposed Gaps</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 8 }}>Your recall is locked in. Zero fading concepts in the queue. Go attack new topics.</div>
          <div style={{ marginTop: 20 }}>
            <Button variant="ghost" size="lg" fullWidth disabled>0 Exposed Gaps. Go Attack New Topics.</Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 46, color: 'var(--dark-text-heading)', lineHeight: 1 }}>
            {loaded ? pendingCount : '—'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--dark-text-muted)', textTransform: 'uppercase', marginTop: 8 }}>Exposed Gaps</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 8 }}>Your retention is dropping on these concepts. Patch the leaks before the examiner finds them.</div>
          <div style={{ marginTop: 20 }}>
            <Button variant="gold" size="lg" fullWidth disabled={!loaded} onClick={onStartSmartPatch}>Execute Smart Patch</Button>
          </div>
        </>
      )}
    </Card>
  );
}

/** Batch 2's "Ticket" card — bg-white/5, expands to the explanation + the two-button action row. */
function MistakeTicket({ ticket, expanded, busy, onToggle, onReTestLater, onUnderstand }: {
  ticket: MistakeTicket; expanded: boolean; busy: boolean;
  onToggle: () => void; onReTestLater: () => void; onUnderstand: () => void;
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <button type="button" onClick={onToggle} style={{
        width: '100%', textAlign: 'left', padding: 14, background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, minHeight: 'var(--touch-min)',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
            {ticket.subject}{ticket.topic ? ` · ${ticket.topic}` : ''}
          </div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-body)', marginTop: 6, lineHeight: 1.4 }}>{ticket.stem}</div>
        </div>
        <ChevronIcon open={expanded} />
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.55, paddingTop: 12 }}>
            {ticket.explanation || 'No explanation available for this question yet.'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1 }}><Button variant="secondary" size="sm" fullWidth onClick={onReTestLater}>Re-test Me Later</Button></div>
            <div style={{ flex: 1 }}><Button variant="gold" size="sm" fullWidth disabled={busy} onClick={onUnderstand}>{busy ? 'Saving…' : 'I Understand'}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Accuracy-coded left border — gold for a strong session, red for a rough one, quiet neutral in between or when nothing was answered. */
function sessionAccentColor(entry: SessionHistoryEntry): string {
  if (entry.questionsAnswered === 0) return 'var(--dark-border)';
  const accuracy = entry.correctCount / entry.questionsAnswered;
  if (accuracy > 0.8) return 'var(--kairo-gold-500)';
  if (accuracy < 0.5) return 'var(--dark-danger)';
  return 'var(--dark-border)';
}

/** One expandable "passive reference" accordion — shared shell for Weak Topics and both Vault sections, matching the app's existing accordion language. */
function AccordionCard({ label, desc, count, open, onToggle, children }: {
  label: string; desc: string; count: number; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 0 }}>
      <button type="button" onClick={onToggle} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4, maxWidth: 260 }}>{desc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge tone="darkNeutral">{count}</Badge>
          <ChevronIcon open={open} />
        </div>
      </button>
      {open && <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--dark-border)' }}>{children}</div>}
    </Card>
  );
}

export function Review() {
  const navigate = useNavigate();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [weakTopics, setWeakTopics] = useState<WeakTopicForReview[]>([]);

  const [mistakes, setMistakes] = useState<MistakeTicket[] | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [savingTicket, setSavingTicket] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[] | null>(null);
  const [history, setHistory] = useState<SessionHistoryEntry[] | null>(null);
  const [selectedCbtReview, setSelectedCbtReview] = useState<CbtHistoryEntry | null>(null);
  const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadReviewData().then(() => {
      setPendingCount(getPendingRepairsCount());
      setWeakTopics(getWeakTopicsForReview());
      setDataLoaded(true);
    });
    getRecentMistakes(20).then(setMistakes).catch(() => setMistakes([]));
    getBookmarkedQuestions(20).then(setBookmarks).catch(() => setBookmarks([]));
    getSessionHistory(20).then(setHistory).catch(() => setHistory([]));
  }, []);

  function handleUnderstand(ticket: MistakeTicket) {
    setSavingTicket(ticket.questionId);
    markMistakeUnderstood(ticket.questionId, ticket.conceptId)
      .then(() => {
        setMistakes((prev) => prev?.filter((m) => m.questionId !== ticket.questionId) ?? prev);
        setExpandedTicket((cur) => (cur === ticket.questionId ? null : cur));
        setToast('Ticket closed. Kai will re-test this in 3 days to verify mastery, not just memory.');
        setTimeout(() => setToast(null), 3200);
      })
      .catch(() => {
        // Best-effort — leave the ticket in place so the student can retry.
      })
      .finally(() => setSavingTicket(null));
  }

  async function handleOpenSession(entry: SessionHistoryEntry) {
    if (entry.mode !== 'cbt_exam') return;
    setReviewingSessionId(entry.id);
    try {
      const cbtResults = await getCbtHistory(50);
      const result = cbtResults.find((item) => item.id === entry.id);
      if (result) setSelectedCbtReview(result);
      else {
        setToast('This exam does not have a saved question review yet.');
        setTimeout(() => setToast(null), 3200);
      }
    } catch {
      setToast('Kairo could not load this exam review right now.');
      setTimeout(() => setToast(null), 3200);
    } finally {
      setReviewingSessionId(null);
    }
  }

  async function handleRemoveBookmark(questionId: string) {
    setBookmarks((prev) => prev?.filter((b) => b.id !== questionId) ?? prev);
    try {
      await removeBookmark(questionId);
    } catch {
      getBookmarkedQuestions(20).then(setBookmarks).catch(() => {});
    }
  }

  if (selectedCbtReview) {
    const paper: CbtPaperQuestion[] = (selectedCbtReview.questionResults || []).map((r) => ({
      globalIndex: r.globalIndex,
      subject: r.subject,
      questionId: r.questionId || `history_${selectedCbtReview.id}_${r.globalIndex}`,
      text: r.text || 'Question text unavailable',
      options: r.options || [],
      imageUrl: r.imageUrl || null,
    }));
    return <CbtReview paper={paper} questionResults={selectedCbtReview.questionResults || []} onBack={() => setSelectedCbtReview(null)} />;
  }

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--dark-bg-canvas)', flex: 1, position: 'relative' }}>
      {toast && <InlineToast tone="caution">{toast}</InlineToast>}
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)' }}>Review</div>

      <div className="desktop-grid">
        <div className="desktop-main" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <HeroCard loaded={dataLoaded} pendingCount={pendingCount} onStartSmartPatch={() => navigate('/cbt', { state: { entry: 'smartPatch' } })} />

          <AccordionCard
            label="Active Traps"
            desc="Mistakes from your last 72 hours. Don't just memorize the correct option—diagnose why you fell for it."
            count={mistakes?.length ?? 0}
            open={expandedSection === 'mistakes'}
            onToggle={() => setExpandedSection((s) => (s === 'mistakes' ? null : 'mistakes'))}
          >
            {mistakes == null && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>Loading…</div>}
            {mistakes?.length === 0 && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>No active traps right now.</div>}
            {mistakes?.map((m) => (
              <MistakeTicket
                key={m.questionId}
                ticket={m}
                expanded={expandedTicket === m.questionId}
                busy={savingTicket === m.questionId}
                onToggle={() => setExpandedTicket((cur) => (cur === m.questionId ? null : m.questionId))}
                onReTestLater={() => setExpandedTicket(null)}
                onUnderstand={() => handleUnderstand(m)}
              />
            ))}
          </AccordionCard>

          <AccordionCard
            label="Weak Topics"
            desc="Kai caught a failing pattern. These areas will heavily drag your score down if we don't rebuild them now."
            count={weakTopics.length}
            open={expandedSection === 'weak'}
            onToggle={() => setExpandedSection((s) => (s === 'weak' ? null : 'weak'))}
          >
            {weakTopics.length === 0 && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>Nothing under 50% yet.</div>}
            {weakTopics.map((t) => (
              <div key={`${t.subject}::${t.topic}`} style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-body)' }}>{t.topic}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-text-muted)', marginTop: 2 }}>{t.subject} · {Math.round((1 - t.failureRate) * 100)}% accuracy</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/practice', { state: { entry: 'drill', drillCategory: t.drillCategory, drillSubjects: [t.subject] } })}
                >
                  {t.drillCategory === 'calculation' ? 'Launch Calculation Drill' : 'Launch Theory Drill'}
                </Button>
              </div>
            ))}
          </AccordionCard>
        </div>

        <div className="desktop-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--dark-text-faint)', textTransform: 'uppercase', padding: '0 2px' }}>The Vault</div>

          <AccordionCard
            label="Your Bookmarks"
            desc="Your saved high-yield questions. Guard these for your final revision."
            count={bookmarks?.length ?? 0}
            open={expandedSection === 'bookmarks'}
            onToggle={() => setExpandedSection((s) => (s === 'bookmarks' ? null : 'bookmarks'))}
          >
            {bookmarks?.length === 0 && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>No bookmarks yet.</div>}
            {bookmarks?.map((b) => (
              <div key={b.id} style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.4 }}>{b.stem}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-text-muted)', marginTop: 2 }}>{b.subject} · {b.topic}</div>
                </div>
                <button type="button" onClick={() => handleRemoveBookmark(b.id)} style={{
                  background: 'none', border: 'none', color: 'var(--dark-text-faint)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, minHeight: 'var(--touch-min)',
                }}>Remove</button>
              </div>
            ))}
          </AccordionCard>

          <AccordionCard
            label="Your Session History"
            desc="The raw data of your daily grind. Every session, every score, zero excuses."
            count={history?.length ?? 0}
            open={expandedSection === 'history'}
            onToggle={() => setExpandedSection((s) => (s === 'history' ? null : 'history'))}
          >
            {history?.length === 0 && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>No sessions yet.</div>}
            {history?.map((s) => (
              <button type="button" key={s.id} onClick={() => handleOpenSession(s)} disabled={s.mode !== 'cbt_exam' || reviewingSessionId === s.id} aria-label={s.mode === 'cbt_exam' ? `Review ${s.modeLabel}` : `${s.modeLabel} session`} style={{
                width: '100%', textAlign: 'left', marginTop: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)',
                border: 'none', borderLeft: `3px solid ${sessionAccentColor(s)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 13,
                fontFamily: 'inherit', cursor: s.mode === 'cbt_exam' ? 'pointer' : 'default', opacity: reviewingSessionId === s.id ? .65 : 1,
              }}>
                <div>
                  <span style={{ color: 'var(--dark-text-body)', fontWeight: 600 }}>{s.modeLabel}</span>
                  <span style={{ color: 'var(--dark-text-muted)', marginLeft: 8 }}>
                    {s.questionsAnswered} question{s.questionsAnswered === 1 ? '' : 's'}{s.questionsAnswered > 0 ? `, ${s.correctCount} correct` : ''}
                  </span>
                </div>
                <span style={{ color: 'var(--dark-text-faint)', flexShrink: 0 }}>{reviewingSessionId === s.id ? 'Loading review…' : relativeDay(s.startedAt)}</span>
              </button>
            ))}
          </AccordionCard>
        </div>
      </div>
    </div>
  );
}
