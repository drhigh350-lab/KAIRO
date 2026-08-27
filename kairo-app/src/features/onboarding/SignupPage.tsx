import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUp } from './SignUp';
import { CheckYourInbox } from './CheckYourInbox';
import { beginOnboarding } from '../../lib/kairoEngine';

/**
 * The real, dedicated /signup URL — see LoginPage.tsx for why this used to
 * be an internal OnboardingFlow screen state instead of its own route.
 * A step indicator (1 of 3) still carries across into OnboardingFlow's
 * own About You (2) / Account Ready (3) steps, even though the flow now
 * spans two separate routes.
 */
export function SignupPage() {
  const navigate = useNavigate();
  const [checkInboxEmail, setCheckInboxEmail] = useState<string | null>(null);

  if (checkInboxEmail) {
    return <CheckYourInbox email={checkInboxEmail} onReturnToLogin={() => navigate('/login')} />;
  }

  return (
    <SignUp
      step={1}
      total={3}
      onBack={() => navigate('/')}
      onEmailSignUp={({ name, email }) => {
        beginOnboarding(name);
        navigate('/onboarding', { state: { name, email } });
      }}
      onNeedsEmailVerification={(email) => setCheckInboxEmail(email)}
      onGoToSignIn={(email) => navigate('/login', email ? { state: { email } } : undefined)}
    />
  );
}
