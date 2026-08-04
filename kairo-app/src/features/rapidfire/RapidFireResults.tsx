import { Button, Card } from '../../components';
import { StatTile } from '../learning/shared';
import type { RapidFireResults as RapidFireResultsData } from '../../lib/kairoEngine';

export interface RapidFireResultsProps {
  results: RapidFireResultsData;
  onHome: () => void;
  onRetry: () => void;
}

export function RapidFireResults({ results, onHome, onRetry }: RapidFireResultsProps) {
  const avgSec = Math.round(results.avgTimeMs / 100) / 10;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ padding: '36px 20px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--dark-bg-elevated)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" /></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)', marginTop: 14 }}>Round Complete</div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>{results.durationSec}s total</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex' }}>
            <StatTile dark label="Correct" value={`${results.correct}/${results.totalQuestions}`} />
            <StatTile dark label="Accuracy" value={`${results.accuracy}%`} />
            <StatTile dark label="Avg / question" value={`${avgSec}s`} />
          </div>
        </Card>

        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>BEST STREAK</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>🔥 {results.bestStreak}</div>
        </Card>

        <Button variant="secondary" size="md" fullWidth onClick={onRetry}>Go Again</Button>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onHome}>Back to Home</Button>
      </div>
    </div>
  );
}
