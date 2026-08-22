import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { getPinnedTodayFocus } from '../../lib/dailyRecommendation';

/**
 * Batch 4's "Streak Savior" — a dedicated interstitial (its own route,
 * outside AppTabs, same reasoning as /review/session) that intercepts the
 * trip back to Home after any completed non-recommendation session
 * (Mixed Practice, a topic session, CBT, Rapid Fire, a Planner Verification
 * Session…) while today's real Daily Recommendation is still undone. Exactly
 * two choices, per the product's KISS mandate: secure the streak right now,
 * or explicitly choose to risk it and move on — never a silent third way
 * back to Home that skips the recommendation without the student noticing.
 */
export function StreakSavior() {
  const navigate = useNavigate();
  const todayFocus = getPinnedTodayFocus();

  function secureStreak() {
    navigate('/practice', { replace: true, state: { entry: 'suggested', anchorConceptId: todayFocus?.conceptId ?? null } });
  }
  function maybeLater() {
    navigate('/home', { replace: true });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', gap: 20 }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(224,160,57,0.15)', border: '2px solid var(--kairo-gold-500, #e0a039)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--kairo-gold-500, #e0a039)" stroke="var(--kairo-gold-500, #e0a039)" strokeWidth="1.5">
            <path d="M12 2c1 4-4 5-4 9a4 4 0 008 0c1.5 1 2 3 2 4a6 6 0 01-12 0c0-5 3-6 3-9 0-1.5.5-3 3-4z" />
          </svg>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)' }}>
            Great practice, but your streak is still at risk!
          </div>
          <div style={{ fontSize: 14.5, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.5, maxWidth: 320 }}>
            Complete today's Recommendation to ignite your flame.
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button variant="gold" size="lg" fullWidth onClick={secureStreak}>Secure My Streak</Button>
        <Button variant="ghost" size="lg" fullWidth onClick={maybeLater}>Maybe Later</Button>
      </div>
    </div>
  );
}
