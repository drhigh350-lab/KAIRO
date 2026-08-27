import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../learning/shared';

/** Scaffolded route only — see PrivacyPage.tsx's doc comment; same reasoning applies here. */
export function TermsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--dark-bg-canvas)', fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Terms of Service" tone="dark" />
      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--dark-text-heading)' }}>We're finalizing this.</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.6, maxWidth: 480 }}>
          Kairo's full terms of service are being written and will appear here shortly. In the meantime, reach out to the TechMed team directly with any questions.
        </div>
      </div>
    </div>
  );
}
