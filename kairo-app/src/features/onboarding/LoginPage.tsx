import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignIn } from './SignIn';
import { CheckYourInbox } from './CheckYourInbox';
import { getEngine, isOnboarded, beginOnboarding } from '../../lib/kairoEngine';

/**
 * The real, dedicated /login URL — SignIn used to be one internal screen
 * state inside OnboardingFlow's own state machine, reachable only by first
 * landing on /onboarding, which meant there was never a stable, deep-
 * linkable, indexable URL for "sign in" on its own (and /onboarding
 * couldn't be locked down to genuinely new-signup traffic while it also
 * had to double as the sign-in screen).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email;
  const [checkInboxEmail, setCheckInboxEmail] = useState<string | null>(null);

  if (checkInboxEmail) {
    return <CheckYourInbox email={checkInboxEmail} onReturnToLogin={() => setCheckInboxEmail(null)} />;
  }

  return (
    <SignIn
      onBack={() => navigate('/')}
      initialEmail={initialEmail}
      onSignedIn={() => {
        const profile = getEngine()?.profile;
        if (isOnboarded()) {
          navigate('/dashboard', {
            state: {
              name: profile?.name || 'there',
              course: profile?.targetCourse ? { name: profile.targetCourse, subjects: profile.targetSubjects || [] } : null,
              examDate: profile?.examDate ? new Date(profile.examDate).toISOString().slice(0, 10) : null,
              subjects: profile?.targetSubjects || [],
            },
          });
          return;
        }
        // Signed in successfully but never finished the diagnostic — e.g. a legacy
        // TechMed/RoboMed account signing into Kairo for the first time, or a student
        // who closed the app mid-onboarding. Resume onboarding instead of dead-ending,
        // pre-filled with whatever's already saved on the account — same
        // beginOnboarding() entry point the sign-up path uses.
        beginOnboarding(profile?.name || '');
        navigate('/onboarding', { state: { name: profile?.name || '', email: profile?.email || initialEmail || '' } });
      }}
      onGoToSignUp={() => navigate('/signup')}
      onNeedsEmailVerification={(email) => setCheckInboxEmail(email)}
    />
  );
}
