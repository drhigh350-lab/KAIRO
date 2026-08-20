import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '../../components';
import {
  getEngine, getReviewSummary, getWeaknessReview, getMonthlyWrapped,
  getBookmarkedQuestions, removeBookmark, getSessionHistory,
  type BookmarkedQuestion, type SessionHistoryEntry,
} from '../../lib/kairoEngine';
import { getReviewSessionSnapshot, type ReviewSessionSnapshot } from '../../lib/sessionResume';

interface QueueItem { id: string; name: string; reason: string; priority: string }
interface WeaknessItem { concept: { id: string; name: string; subject: string; topic: string }; count: number }

function relativeDay(ts: number): string {
  const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString();
}

export function Review() {
  const navigate = useNavigate();
  const recap = getReviewSummary();
  const weakness = getWeaknessReview();
  const monthly = getMonthlyWrapped();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[] | null>(null);
  const [history, setHistory] = useState<SessionHistoryEntry[] | null>(null);
  const [resumeSnapshot, setResumeSnapshot] = useState<ReviewSessionSnapshot | null>(null);
  const [resumeItemsLeft, setResumeItemsLeft] = useState(0);

  useEffect(() => {
    getBookmarkedQuestions(20).then(setBookmarks).catch(() => setBookmarks([]));
    getSessionHistory(20).then(setHistory).catch(() => setHistory([]));
    const snapshot = getReviewSessionSnapshot(getEngine()?.profile?.studentId);
    setResumeSnapshot(snapshot);
    if (snapshot) {
      try {
        const parsedPlan = JSON.parse(snapshot.planJson) as { items: unknown[] };
        setResumeItemsLeft(Math.max(0, parsedPlan.items.length - snapshot.itemIndex));
      } catch {
        setResumeItemsLeft(0);
      }
    }
  }, []);

  async function handleRemoveBookmark(questionId: string) {
    setBookmarks((prev) => prev?.filter((b) => b.id !== questionId) ?? prev);
    try {
      await removeBookmark(questionId);
    } catch {
      // Re-fetch on failure rather than leaving the list silently wrong.
      getBookmarkedQuestions(20).then(setBookmarks).catch(() => {});
    }
  }

  const recentlyMissed: QueueItem[] = (recap?.recap.queue || []).filter((q: QueueItem) => q.reason === 'recently_missed');
  const stale: QueueItem[] = (recap?.recap.queue || []).filter((q: QueueItem) => q.reason === 'stale');
  const weakConcepts: WeaknessItem[] = weakness?.dominantWeakness ? (weakness.byErrorTag[weakness.dominantWeakness.tag] || []) : [];

  const categories: { key: string; label: string; desc: string; count: number; items: { id: string; name: string; sub?: string }[] }[] = [];
  if (recap?.recap.breakdown.recentlyMissed) {
    categories.push({ key: 'recent', label: 'Recent Mistakes', desc: 'From your last few sessions.', count: recap.recap.breakdown.recentlyMissed, items: recentlyMissed.map((q) => ({ id: q.id, name: q.name })) });
  }
  if (recap?.recap.breakdown.stale) {
    categories.push({ key: 'stale', label: 'Slipping Away', desc: "Held steady for a while but haven't come up recently.", count: recap.recap.breakdown.stale, items: stale.map((q) => ({ id: q.id, name: q.name })) });
  }
  if (weakness?.dominantWeakness) {
    categories.push({
      key: 'weak',
      label: 'Weak Topics',
      desc: weakness.kaiMessage,
      count: weakness.dominantWeakness.conceptCount,
      items: weakConcepts.map((w) => ({ id: w.concept.id, name: w.concept.name, sub: `${w.concept.subject} · ${w.concept.topic}` })),
    });
  }

  const totalWaiting = (recap?.fadingCount ?? 0) + categories.reduce((s, c) => s + c.count, 0);
  const hasReinforcedStory = !!monthly && monthly.reinforcedCount > 0;

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)' }}>Review</div>
      <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>
        {totalWaiting > 0
          ? `${totalWaiting} thing${totalWaiting === 1 ? ' is' : 's are'} ready to come back to you.`
          : "Nothing's waiting for review right now — that changes as you practise."}
      </div>

      {/* Desktop (>=900px): the active review queue (resume/suggested CTA +
          the engine-detected categories) as the main column; the quieter,
          self-directed items (bookmarks, reinforced-this-month, session
          history — already documented above as "kept visually quiet") as
          a sidebar, rather than one long stacked column. */}
      <div className="desktop-grid">
        <div className="desktop-main">
          {/* Continue Reviewing (Review Module §4.3 item 2) — always outranks starting a fresh category. */}
          {resumeSnapshot && resumeItemsLeft > 0 && (
            <Card style={{ background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-accent-blue)', boxShadow: 'none' }}>
              <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--dark-accent-blue)', fontWeight: 700 }}>CONTINUE REVIEWING</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)', marginTop: 8 }}>
                {resumeItemsLeft} thing{resumeItemsLeft === 1 ? '' : 's'} left in your last session
              </div>
              <div style={{ marginTop: 14 }}>
                <Button variant="darkAccent" size="md" fullWidth onClick={() => navigate('/review/session', { state: { resume: true } })}>Resume</Button>
              </div>
            </Card>
          )}

          {recap?.hasUrgentReview && (
            <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>SUGGESTED REVIEW</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>
                Quick pass on {recap.fadingCount} fading concept{recap.fadingCount === 1 ? '' : 's'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>About {recap.recap.estimatedTimeMin} minutes</div>
              <div style={{ marginTop: 16 }}>
                <Button variant="gold" size="md" fullWidth onClick={() => navigate('/review/session')}>Start Review</Button>
              </div>
            </Card>
          )}

          {categories.map((c) => {
            const isOpen = expanded === c.key;
            return (
              <Card key={c.key} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 0 }}>
                <button type="button" onClick={() => setExpanded(isOpen ? null : c.key)} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4, maxWidth: 240 }}>{c.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge tone="darkNeutral">{c.count}</Badge>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--dark-border)' }}>
                    {c.items.length === 0 && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>No specific concepts to list yet.</div>}
                    {c.items.map((it) => (
                      <div key={it.id} style={{ paddingTop: 10, fontSize: 13, color: 'var(--dark-text-body)' }}>
                        {it.name}
                        {it.sub && <span style={{ color: 'var(--dark-text-muted)', marginLeft: 8, fontSize: 12 }}>{it.sub}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="desktop-sidebar">
          {/* Bookmarks — the student's own self-flagged questions (Review Module §4.3 item 6), distinct from the engine-detected categories above. */}
          {bookmarks && bookmarks.length > 0 && (
            <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 0 }}>
              <button type="button" onClick={() => setExpanded(expanded === 'bookmarks' ? null : 'bookmarks')} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>Bookmarks</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4, maxWidth: 240 }}>Questions you marked as worth revisiting.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge tone="darkNeutral">{bookmarks.length}</Badge>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2" style={{ transform: expanded === 'bookmarks' ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </button>
              {expanded === 'bookmarks' && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--dark-border)' }}>
                  {bookmarks.map((b) => (
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
                </div>
              )}
            </Card>
          )}

          {/* Reinforced This Month — quiet, collapsed by default (Review Module §4.3 item 8). */}
          {hasReinforcedStory && (
            <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 0 }}>
              <button type="button" onClick={() => setExpanded(expanded === 'reinforced' ? null : 'reinforced')} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>Reinforced This Month</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4, maxWidth: 240 }}>Concepts that held up after a Fading scare.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge tone="darkNeutral">{monthly.reinforcedCount}</Badge>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2" style={{ transform: expanded === 'reinforced' ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </button>
              {expanded === 'reinforced' && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--dark-border)' }}>
                  {(monthly.reinforcedNames || []).length === 0 && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', paddingTop: 10 }}>No specific concepts to list yet.</div>}
                  {(monthly.reinforcedNames || []).map((name: string) => (
                    <div key={name} style={{ paddingTop: 10, fontSize: 13, color: 'var(--dark-text-body)' }}>{name}</div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Session History — reverse-chronological, kept visually quiet (Review Module §4.3 item 7). */}
          {history && history.length > 0 && (
            <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 0 }}>
              <button type="button" onClick={() => setExpanded(expanded === 'history' ? null : 'history')} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>Session History</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 4, maxWidth: 240 }}>A look back at your past sessions.</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2" style={{ transform: expanded === 'history' ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {expanded === 'history' && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--dark-border)' }}>
                  {history.map((s) => (
                    <div key={s.id} style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--dark-text-body)', fontWeight: 600 }}>{s.modeLabel}</span>
                        <span style={{ color: 'var(--dark-text-muted)', marginLeft: 8 }}>{s.questionsAnswered} question{s.questionsAnswered === 1 ? '' : 's'}{s.questionsAnswered > 0 ? `, ${s.correctCount} correct` : ''}</span>
                      </div>
                      <span style={{ color: 'var(--dark-text-faint)', flexShrink: 0 }}>{relativeDay(s.startedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
