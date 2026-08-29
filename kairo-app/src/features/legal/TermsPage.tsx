import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../learning/shared';
import { LegalSection, LegalList, LegalLink } from './shared';

export function TermsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--dark-bg-canvas)', fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Terms of Service" tone="dark" />
      <div style={{ padding: '24px 20px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>Last updated: August 27, 2026</div>

        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.65 }}>
          These Terms of Service ("Terms") govern your use of Kairo, a UTME exam-preparation app built by Techmed
          Integrated Services ("TechMed"), available at{' '}
          <LegalLink href="https://kairo.techmedng.com">kairo.techmedng.com</LegalLink>. By creating an
          account or using Kairo, you agree to these Terms. If you don't agree, please don't use Kairo.
        </div>

        <LegalSection heading="1. What Kairo Is">
          <div>Kairo helps you prepare for Nigeria's UTME exam through practice questions, CBT-style mock exams, a
            diagnostic assessment, a personalized Study Planner, and progress tracking. Kairo is an independent study
            tool — it is not affiliated with, endorsed by, or operated on behalf of the Joint Admissions and
            Matriculation Board (JAMB). Practice questions and mock scores are study aids, not a guarantee of your real
            exam outcome.</div>
        </LegalSection>

        <LegalSection heading="2. Your Account">
          <LegalList
            items={[
              'You need an account to use Kairo, created with an email and password or via Google sign-in.',
              "You're responsible for keeping your password secure and for anything that happens under your account. Tell us right away if you think someone else has access to it.",
              'Give us accurate information — your exam date, target course, and subjects help Kairo recommend the right content, and outdated information means worse recommendations.',
              "One account per person. Don't share your login or create accounts on someone else's behalf without them knowing.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="3. Kairo Is Free (For Now)">
          <div>Kairo is currently free to use, with no paid tiers or in-app purchases. If we ever introduce paid
            features, we'll tell you clearly before asking you to pay for anything, and Kairo's free features will
            continue to work without it.</div>
        </LegalSection>

        <LegalSection heading="4. Acceptable Use">
          <div>Don't:</div>
          <LegalList
            items={[
              'Try to break, disrupt, or gain unauthorized access to Kairo or other students’ accounts.',
              "Scrape, copy, or redistribute Kairo's question bank, explanations, or other content outside the app.",
              "Reverse-engineer, decompile, or attempt to extract Kairo's underlying systems.",
              'Use Kairo for anything illegal, or to harass or harm anyone else, including through the question-report or feedback tools.',
              "Impersonate someone else or misrepresent your affiliation with TechMed.",
            ]}
          />
          <div>We can suspend or terminate accounts that violate these rules.</div>
        </LegalSection>

        <LegalSection heading="5. Content & Ownership">
          <div>Kairo — including its practice questions, explanations, the Kai mascot and branding, the Kairo name, and
            the app itself — belongs to TechMed. Using Kairo doesn't give you ownership of any of it. You may use
            Kairo's content for your own personal exam prep; you may not republish, resell, or distribute it.</div>
          <div>Your answers, progress, and any feedback or question reports you submit remain associated with your
            account, as described in our <LegalLink href="/privacy">Privacy Policy</LegalLink>. By submitting a question
            report or feedback, you give us permission to use its content to improve Kairo — for example, fixing the
            reported question.</div>
        </LegalSection>

        <LegalSection heading="6. No Guarantees">
          <div>Kairo is a study tool. We work hard to keep questions accurate and explanations clear, but we don't
            guarantee that using Kairo will result in any particular UTME score or admission outcome. Kairo is provided
            "as is," without warranties of any kind, to the fullest extent the law allows.</div>
        </LegalSection>

        <LegalSection heading="7. Limitation of Liability">
          <div>To the fullest extent permitted by law, TechMed isn't liable for indirect, incidental, or consequential
            damages arising from your use of Kairo, including reliance on practice content or mock exam results. Nothing
            in these Terms limits liability that can't be limited by law.</div>
        </LegalSection>

        <LegalSection heading="8. Ending Your Account">
          <div>You can stop using Kairo anytime; email <LegalLink href="mailto:privacy@techmedng.com">privacy@techmedng.com</LegalLink>{' '}
            to request account deletion (see our <LegalLink href="/privacy">Privacy Policy</LegalLink>). We may suspend
            or terminate your account if you violate these Terms, or if we discontinue Kairo, with notice where
            reasonably possible.</div>
        </LegalSection>

        <LegalSection heading="9. Changes to These Terms">
          <div>We may update these Terms as Kairo grows. We'll update the "Last updated" date above, and let you know
            directly if a change is significant.</div>
        </LegalSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--dark-text-heading)' }}>Contact Us</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.65 }}>
            Questions about these Terms? Email <LegalLink href="mailto:support@techmedng.com">support@techmedng.com</LegalLink>.
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', marginTop: 6 }}>
            Techmed Integrated Services, operator of Kairo — kairo.techmedng.com. These Terms are governed by the laws
            of the Federal Republic of Nigeria.
          </div>
        </div>
      </div>
    </div>
  );
}
