import { Badge, Button, Card } from '../../components';
import { getReviewSummary, getWeaknessReview } from '../../lib/kairoEngine';

export function Review() {
  const recap = getReviewSummary();
  const weakness = getWeaknessReview();

  const categories: { label: string; desc: string; count: number }[] = [];
  if (recap?.recap.breakdown.recentlyMissed) {
    categories.push({ label: 'Recent Mistakes', desc: 'From your last few sessions.', count: recap.recap.breakdown.recentlyMissed });
  }
  if (recap?.recap.breakdown.stale) {
    categories.push({ label: 'Slipping Away', desc: "Held steady for a while but haven't come up recently.", count: recap.recap.breakdown.stale });
  }
  if (weakness?.dominantWeakness) {
    categories.push({
      label: 'Weak Topics',
      desc: weakness.kaiMessage,
      count: weakness.dominantWeakness.conceptCount,
    });
  }

  const totalWaiting = (recap?.fadingCount ?? 0) + categories.reduce((s, c) => s + c.count, 0);

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Review</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        {totalWaiting > 0
          ? `${totalWaiting} thing${totalWaiting === 1 ? ' is' : 's are'} ready to come back to you.`
          : "Nothing's waiting for review right now — that changes as you practise."}
      </div>

      {recap?.hasUrgentReview && (
        <Card style={{ background: 'var(--kairo-navy-900)', color: '#fff' }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--kairo-blue-300)', fontWeight: 700 }}>SUGGESTED REVIEW</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>
            Quick pass on {recap.fadingCount} fading concept{recap.fadingCount === 1 ? '' : 's'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--kairo-blue-200)', marginTop: 8 }}>About {recap.recap.estimatedTimeMin} minutes</div>
          <div style={{ marginTop: 16 }}>
            <Button variant="gold" size="md" fullWidth>Start Review</Button>
          </div>
        </Card>
      )}

      {categories.map((c) => (
        <Card key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>{c.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, maxWidth: 240 }}>{c.desc}</div>
          </div>
          <Badge tone="neutral">{c.count}</Badge>
        </Card>
      ))}
    </div>
  );
}
