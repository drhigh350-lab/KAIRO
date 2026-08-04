import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '../../components';
import { getReviewSummary, getWeaknessReview } from '../../lib/kairoEngine';

interface QueueItem { id: string; name: string; reason: string; priority: string }
interface WeaknessItem { concept: { id: string; name: string; subject: string; topic: string }; count: number }

export function Review() {
  const navigate = useNavigate();
  const recap = getReviewSummary();
  const weakness = getWeaknessReview();
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)' }}>Review</div>
      <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>
        {totalWaiting > 0
          ? `${totalWaiting} thing${totalWaiting === 1 ? ' is' : 's are'} ready to come back to you.`
          : "Nothing's waiting for review right now — that changes as you practise."}
      </div>

      {recap?.hasUrgentReview && (
        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>SUGGESTED REVIEW</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>
            Quick pass on {recap.fadingCount} fading concept{recap.fadingCount === 1 ? '' : 's'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>About {recap.recap.estimatedTimeMin} minutes</div>
          <div style={{ marginTop: 16 }}>
            <Button variant="gold" size="md" fullWidth onClick={() => navigate('/practice', { state: { entry: 'weak' } })}>Start Review</Button>
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
  );
}
