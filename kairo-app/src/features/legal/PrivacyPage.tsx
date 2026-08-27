import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../learning/shared';
import { LegalSection, LegalList, LegalLink } from './shared';

export function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--dark-bg-canvas)', fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Privacy Policy" tone="dark" />
      <div style={{ padding: '24px 20px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>Last updated: August 27, 2026</div>

        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.65 }}>
          Kairo is a UTME exam-prep app built by TechMed. This policy explains what information we collect
          when you use Kairo, why we collect it, and what choices you have. It covers Kairo at{' '}
          <LegalLink href="https://kairo.techmedng.com">kairo.techmedng.com</LegalLink> — not TechMed's other products,
          except where noted below.
        </div>

        <LegalSection heading="1. Information We Collect">
          <div><strong style={{ color: 'var(--dark-text-heading)' }}>Account information.</strong> When you create a Kairo
            account, you give us your name, email address, and a password — or sign in with Google, in which case Google
            shares your name and email with us. We never see or store your password in plain text; Supabase, our
            authentication provider, holds it in encrypted form only.</div>
          <div><strong style={{ color: 'var(--dark-text-heading)' }}>Your study profile.</strong> To personalize Kairo, we
            ask for your target UTME exam date, the course you're aiming for, and the subjects you're preparing. You can
            optionally add your target university, target UTME score, and preferred study times — none of that is
            required to use Kairo.</div>
          <div><strong style={{ color: 'var(--dark-text-heading)' }}>Your learning activity.</strong> As you use Practice,
            CBT mock exams, Rapid Fire, and the Study Planner, we record what you answered, whether you got it right, how
            long you took, your streaks, badges, Kairo Points, and your mastery of each topic. This is the core of how
            Kairo adapts to you — without it, Kairo can't recommend what to study next.</div>
          <div><strong style={{ color: 'var(--dark-text-heading)' }}>Notifications.</strong> If you turn on push
            notifications, your browser gives us a subscription address (a routing address, not a readable message) so we
            can send reminders. We also keep a record of which notification categories you've enabled and a short history
            of what's been sent to you.</div>
          <div><strong style={{ color: 'var(--dark-text-heading)' }}>Feedback you send us.</strong> If you report a
            problem with a question or send us feedback, we store what you wrote so it can be reviewed and acted on.</div>
          <div><strong style={{ color: 'var(--dark-text-heading)' }}>Basic technical information.</strong> Your browser
            identifies itself (e.g. "Chrome on Android") so push notifications can be delivered correctly. We don't use
            this to track you across other sites.</div>
        </LegalSection>

        <LegalSection heading="2. What We Don't Collect">
          <LegalList
            items={[
              "No third-party analytics, advertising, or tracking scripts run on Kairo — no Google Analytics, no ad pixels, no cross-site trackers.",
              'No tracking cookies. The only things stored in your browser are functional — your sign-in session, an in-progress practice/CBT session so you can resume it, and today’s recommended focus topic. None of it is shared with third parties or used to track you elsewhere.',
              "No payment information — Kairo is currently free, so there's nothing to collect. If that changes, we'll update this policy and tell you directly before asking you to pay for anything.",
              "No age, date of birth, or parent/guardian contact — Kairo doesn't currently ask for or verify these. See “Children & Minors” below for what that means in practice.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="3. How We Use Your Information">
          <LegalList
            items={[
              'To run Kairo: serve the right practice questions, track your progress, run your streak and points, and build your Study Planner.',
              "To communicate with you: exam-date reminders and streak nudges you've opted into, plus essential account emails like verifying your address or resetting your password.",
              'To improve Kairo: understanding, in aggregate, where students struggle helps us fix bad questions and build better content — we don’t need your name to see that a question confuses a lot of people.',
              'To keep your account secure and respond to bugs or abuse you report.',
            ]}
          />
          <div>We do not sell your information to anyone, for any reason.</div>
        </LegalSection>

        <LegalSection heading="4. Who We Share Information With">
          <div>We use a small number of service providers to run Kairo, and only share what each one needs to do its job:</div>
          <LegalList
            items={[
              'Supabase — hosts our database and handles sign-in. Your account and study data live here, protected by row-level security rules that only ever let your signed-in account read your own data.',
              'Resend — delivers the transactional emails Kairo sends (verification, password reset, reminders).',
              'Cloudflare — hosts the Kairo app itself.',
              "Your browser's own push service (run by Google, Mozilla, or Apple, depending on your browser) — how any web app's push notifications reach your device.",
            ]}
          />
          <div>None of these providers may use your data for their own purposes.</div>
          <div>One thing worth knowing: Kairo shares its sign-in system with other TechMed products (including a legacy
            product, RoboMed). Your email and password authenticate you across TechMed's products through one shared
            identity system — but your Kairo study data (answers, progress, streaks, profile) lives in Kairo's own
            database and isn't used by or shared with those other products.</div>
        </LegalSection>

        <LegalSection heading="5. How Long We Keep Your Information">
          <div>We keep your account and study data for as long as your account is active, so your progress and history
            stay intact. If you ask us to delete your account, we delete your personal information, other than what
            we're required to retain for legal or security reasons (like a record that a deletion happened).</div>
        </LegalSection>

        <LegalSection heading="6. Your Choices">
          <LegalList
            items={[
              'Update your profile — your exam date, target course, subjects, university, and target score are editable anytime from Edit Profile.',
              'Control notifications — turn channels and categories on or off anytime from Notification Settings.',
              <>Delete your account or request a copy of your data — Kairo doesn't yet have a self-service button for this. Until it does, email <LegalLink href="mailto:privacy@techmedng.com">privacy@techmedng.com</LegalLink> and we'll handle it directly, typically within 30 days.</>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="7. Children & Minors">
          <div>Many Kairo students preparing for UTME are teenagers, often under 18. Kairo doesn't currently ask for or
            verify anyone's age, and there's no separate parental-consent flow. If you're a parent or guardian and
            believe your child has created a Kairo account and you'd like to review, adjust, or delete their
            information, contact us at <LegalLink href="mailto:privacy@techmedng.com">privacy@techmedng.com</LegalLink> and
            we'll work with you directly.</div>
        </LegalSection>

        <LegalSection heading="8. Security">
          <div>We rely on Supabase's encrypted infrastructure and enforce row-level security so your data is only ever
            readable by your own signed-in account. All traffic between your device and Kairo is encrypted (HTTPS). No
            system is perfectly secure, but we take reasonable, industry-standard steps to protect your information.</div>
        </LegalSection>

        <LegalSection heading="9. Changes to This Policy">
          <div>If we materially change how we handle your information, we'll update this page and the "Last updated" date
            above. For significant changes, we'll also try to notify you directly — by email or in-app.</div>
        </LegalSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)' }}>Contact Us</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.65 }}>
            Questions about this policy or your data? Email <LegalLink href="mailto:privacy@techmedng.com">privacy@techmedng.com</LegalLink>.
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', marginTop: 6 }}>
            TechMed, operator of Kairo — kairo.techmedng.com. This policy is governed by the laws of the Federal
            Republic of Nigeria.
          </div>
        </div>
      </div>
    </div>
  );
}
