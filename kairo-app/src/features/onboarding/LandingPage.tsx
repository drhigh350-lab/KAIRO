import { Button, KairoWordmark } from '../../components';
import { SkipLink } from './shared';

export interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

interface Beat {
  title: string;
  body: string;
  img: string | null;
}

const beats: Beat[] = [
  { title: 'Built to Last.', body: "Preparation isn't built in one night. Every question you answer, every mistake you correct, every day you return — moves you closer to your goal.", img: '/assets/illustration-student-studying.png' },
  { title: 'Learn by Doing.', body: "Kairo doesn't replace your teacher. It helps you understand concepts through carefully selected questions, clear explanations, and consistent practice.", img: null },
  { title: 'Meet Kai.', body: 'Kai encourages you, explains difficult concepts, celebrates your progress, and keeps you moving — even on difficult days.', img: '/assets/illustration-kai-goat.jpg' },
  { title: 'Small Steps. Big Results.', body: "Your progress isn't measured by speed alone. Kairo helps you build consistency, improve accuracy, and become more confident over time.", img: null },
];

/**
 * A single, continuously scrollable page telling Kairo's story before
 * asking for anything — replaces the old paginated IntroCarousel + a
 * separate Welcome bridge screen with one place a student can scroll at
 * their own pace and land on one real decision at the bottom: get
 * started, or sign in.
 */
export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, padding: '64px 28px 40px' }}>
        <KairoWordmark tone="white" width={220} />
        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--dark-text-heading)', maxWidth: 300, lineHeight: 1.5 }}>
          Seize the Moment. Study smarter for your UTME, one question at a time.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, padding: '8px 28px 56px' }}>
        {beats.map((beat) => (
          <div key={beat.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
            {beat.img && (
              <img src={beat.img} alt="" style={{ maxHeight: 260, maxWidth: '100%', borderRadius: 16, objectFit: 'cover' }} />
            )}
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--dark-text-heading)', lineHeight: 1.2 }}>{beat.title}</div>
              <div style={{ width: 40, height: 3, background: 'var(--dark-accent-blue)', margin: '12px auto 14px' }} />
              <div style={{ fontSize: 15, color: 'var(--dark-text-muted)', lineHeight: 1.6, maxWidth: 320 }}>{beat.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'sticky', bottom: 0, padding: '20px 24px 28px', background: 'linear-gradient(to top, var(--dark-bg-canvas) 60%, transparent)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onGetStarted}>Get Started</Button>
        <SkipLink tone="dark" onClick={onSignIn}>I already have an account</SkipLink>
      </div>
    </div>
  );
}
