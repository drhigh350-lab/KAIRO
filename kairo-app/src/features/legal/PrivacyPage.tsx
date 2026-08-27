import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../learning/shared';

/**
 * Scaffolded route only — /privacy needs to exist (and be listed in the
 * sitemap) before there's real policy copy to put on it, since a stable
 * URL that 404s is worse for both SEO and a legal footer link than one
 * that says plainly "this is coming." Replace this body once the actual
 * privacy policy is written; nothing else about the route needs to change.
 */
export function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--dark-bg-canvas)', fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Privacy Policy" tone="dark" />
      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--dark-text-heading)' }}>We're finalizing this.</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.6, maxWidth: 480 }}>
          Kairo's full privacy policy is being written and will appear here shortly. In the meantime, reach out to the TechMed team directly with any questions about how your data is handled.
        </div>
      </div>
    </div>
  );
}
