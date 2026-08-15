import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { getLearnHome, startLearnFromWeakTopic, startLearnFromDashboard } from '../../lib/kairoEngine';

/**
 * Learn Module spec §4 — a query over the student's own diagnostic
 * history, never a browsable catalogue of everything Kairo could teach.
 * Previously the only way into Learn was reactive (right after a wrong
 * answer in Practice) — this is the proactive destination, reached from
 * Home, using capabilities (getLearnHome, fromWeakTopicRecommendation,
 * fromDashboard) that already existed engine-side with no caller.
 */
export function LearnHome() {
  const navigate = useNavigate();
  const home = getLearnHome();

  function openConcept(conceptId: string, starter: 'weak' | 'dashboard') {
    if (starter === 'weak') startLearnFromWeakTopic(conceptId);
    else startLearnFromDashboard(conceptId);
    navigate(`/learn/${encodeURIComponent(conceptId)}`, { state: { returnTo: '/home' } });
  }

  if (!home) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--dark-bg-canvas)' }}>
        <ScreenHeader onBack={() => navigate('/home')} title="Learn" tone="dark" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Sign in to see what's worth understanding right now.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={() => navigate('/home')} title="Learn" tone="dark" />
      <div style={{ padding: '4px 20px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.5 }}>{home.kaiFraming.text}</div>

        {home.continueLearning && (
          <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
            <div style={{ fontSize: 11, letterSpacing: '.06em', color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>CONTINUE LEARNING</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>{home.continueLearning.conceptName}</div>
            <div style={{ marginTop: 16 }}>
              <Button
                variant="gold"
                size="md"
                fullWidth
                onClick={() => navigate(`/learn/${encodeURIComponent(home.continueLearning!.conceptId)}`, { state: { returnTo: '/home' } })}
              >
                Pick up where you left off
              </Button>
            </div>
          </Card>
        )}

        {home.recommendedConcepts.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Recommended</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {home.recommendedConcepts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConcept(c.id, 'weak')}
                  style={{
                    textAlign: 'left', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)',
                    background: 'var(--dark-bg-surface)', cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>{c.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 3 }}>{c.reason}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {home.weakTopics.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Weak topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {home.weakTopics.map((t) => (
                <Card key={`${t.subject}::${t.topic}`} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--dark-text-heading)' }}>{t.topic}</div>
                    <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>{t.subject}</div>
                  </div>
                  <Badge tone="darkNeutral">{t.count}</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        {home.suggestedNextLessons.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Suggested next</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {home.suggestedNextLessons.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConcept(c.id, 'dashboard')}
                  style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)',
                    background: 'var(--dark-bg-surface)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--dark-text-body)', minHeight: 'var(--touch-min)',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {home.recentlyLearned.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--dark-text-heading)', marginBottom: 10 }}>Recently learned</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {home.recentlyLearned.map((l) => (
                <div key={l.conceptId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 2px' }}>
                  <span style={{ fontSize: 13, color: 'var(--dark-text-body)' }}>{l.conceptName}</span>
                  {l.holding && <Badge tone="darkNeutral">Holding</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {home.masteredConcepts.length > 0 && (
          <details>
            <summary style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--dark-text-muted)', cursor: 'pointer', listStyle: 'none' }}>
              Mastered ({home.masteredConcepts.length})
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {home.masteredConcepts.map((c) => (
                <div key={c.id} style={{ fontSize: 13, color: 'var(--dark-text-muted)', padding: '6px 2px' }}>{c.name}</div>
              ))}
            </div>
          </details>
        )}

        {home.coldStart && (
          <div style={{ padding: '40px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Once you've done a bit of practice, this is where Kairo will show you exactly what's worth understanding.</div>
            <div style={{ marginTop: 20 }}>
              <Button variant="darkAccent" size="md" onClick={() => navigate('/practice', { state: { entry: 'suggested' } })}>Start practising</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
