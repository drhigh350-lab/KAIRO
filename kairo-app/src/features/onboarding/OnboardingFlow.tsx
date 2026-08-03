import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IntroCarousel } from './IntroCarousel';
import { Welcome } from './Welcome';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { AboutYou } from './AboutYou';
import { AccountReady } from './AccountReady';
import type { OnboardingData } from './data';
import { getEngine } from '../../lib/kairoEngine';

type Screen = 'intro' | 'welcome' | 'signin' | 'signup' | 'about' | 'ready';

// segmented indicator covers Sign Up -> Account Ready
const SEQ: Screen[] = ['signup', 'about', 'ready'];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('intro');
  const [history, setHistory] = useState<Screen[]>([]);
  const [data, setData] = useState<OnboardingData>({ name: '', email: '', examYear: null, course: null, subjects: [] });

  function go(next: Screen) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function back() {
    setHistory((h) => {
      const n = [...h];
      const prev = n.pop();
      if (prev) setScreen(prev);
      return n;
    });
  }

  const total = SEQ.length;
  const stepIndex = SEQ.indexOf(screen) + 1;

  let body: ReactNode = null;
  if (screen === 'intro') {
    body = <IntroCarousel onDone={() => go('welcome')} />;
  } else if (screen === 'welcome') {
    body = <Welcome onSignUp={() => go('signup')} onSignIn={() => go('signin')} />;
  } else if (screen === 'signin') {
    body = (
      <SignIn
        onBack={back}
        onSignedIn={() => {
          const profile = getEngine()?.profile;
          navigate('/home', {
            state: {
              name: profile?.name || data.name || 'there',
              course: profile?.targetCourse ? { name: profile.targetCourse, subjects: profile.targetSubjects || [] } : data.course,
              examYear: data.examYear,
              subjects: profile?.targetSubjects?.length ? profile.targetSubjects : data.subjects,
            },
          });
        }}
        onGoToSignUp={() => go('signup')}
      />
    );
  } else if (screen === 'signup') {
    body = (
      <SignUp
        step={stepIndex}
        total={total}
        onBack={back}
        onGoogleSignUp={() => {
          setData((d) => ({ ...d, name: d.name || 'Wisdom Adeyemi', email: d.email || 'wisdom@gmail.com' }));
          go('about');
        }}
        onEmailSignUp={({ name, email }) => {
          setData((d) => ({ ...d, name, email }));
          go('about');
        }}
        onGoToSignIn={() => go('signin')}
      />
    );
  } else if (screen === 'about') {
    body = <AboutYou step={stepIndex} total={total} onBack={back} data={data} setData={setData} onContinue={() => go('ready')} />;
  } else if (screen === 'ready') {
    body = (
      <AccountReady
        step={stepIndex}
        total={total}
        onBack={back}
        data={data}
        onStart={async () => {
          const kairo = getEngine();
          if (kairo) {
            kairo.profile.targetCourse = data.course?.name ?? null;
            kairo.profile.targetSubjects = data.subjects;
            await kairo.sync.sync();
          }
          navigate('/home', { state: { name: data.name, course: data.course, examYear: data.examYear, subjects: data.subjects } });
        }}
      />
    );
  }

  return <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{body}</div>;
}
