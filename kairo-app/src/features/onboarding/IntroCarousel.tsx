import { useState } from 'react';
import { Button } from '../../components';
import { KaiMark } from './shared';

interface Slide {
  title: string;
  body: string;
  img: string | null;
  mark?: boolean;
  final?: boolean;
}

const slides: Slide[] = [
  { title: 'Built to Last.', body: "Preparation isn't built in one night. Every question you answer, every mistake you correct, every day you return — moves you closer to your goal.", img: '/assets/illustration-student-studying.png' },
  { title: 'Learn by Doing.', body: "Kairo doesn't replace your teacher. It helps you understand concepts through carefully selected questions, clear explanations, and consistent practice.", img: null },
  { title: 'Meet Kai.', body: 'Kai encourages you, explains difficult concepts, celebrates your progress, and keeps you moving — even on difficult days.', img: null, mark: true },
  { title: 'Small Steps. Big Results.', body: "Your progress isn't measured by speed alone. Kairo helps you build consistency, improve accuracy, and become more confident over time.", img: null },
  { title: 'Seize the Moment.', body: 'Every great result begins with a single decision to start. Your journey begins now.', img: '/assets/illustration-seize-the-moment.png', final: true },
];

export interface IntroCarouselProps {
  onDone: () => void;
}

export function IntroCarousel({ onDone }: IntroCarouselProps) {
  const [i, setI] = useState(0);
  const s = slides[i];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '20px 24px 28px', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', minHeight: 18 }} onClick={onDone}>{!s.final && 'Skip'}</div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--text-heading)', lineHeight: 1.15 }}>{s.title}</div>
        <div style={{ width: 40, height: 3, background: 'var(--kairo-gold-500)', margin: '10px 0 14px' }} />
        <div style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.55 }}>{s.body}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        {s.img && <img src={s.img} style={{ maxHeight: 260, borderRadius: 16 }} />}
        {s.mark && <KaiMark size={160} />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
        {slides.map((_, idx) => (
          <span key={idx} style={{ width: idx === i ? 18 : 6, height: 6, borderRadius: 3, background: idx === i ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-100)', transition: 'all var(--dur-base)' }} />
        ))}
      </div>
      {s.final ? (
        <Button variant="primary" size="lg" fullWidth onClick={onDone}>Continue</Button>
      ) : (
        <Button variant="primary" size="lg" fullWidth onClick={() => setI(i + 1)}>Continue</Button>
      )}
    </div>
  );
}
