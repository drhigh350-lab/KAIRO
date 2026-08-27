// React Email template for notifications-email/index.ts — rendered to HTML
// server-side (see @react-email/render usage there) before being handed to
// Resend. Kept as its own component (not inline template-literal HTML, the
// pattern send-lifecycle-emails/index.ts uses) so this one, user-facing
// send path is a real React Email template, per the V1 spec.

import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "npm:@react-email/components@1.0.12";
import * as React from "npm:react@19.2.8";

export interface NotificationEmailProps {
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  previewText?: string;
}

const NAVY = "#0f172a";
const GOLD = "#C9A227";

export default function NotificationEmail({ heading, body, ctaLabel, ctaUrl, previewText }: NotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText || heading}</Preview>
      <Body style={{ backgroundColor: "#f1f5f9", fontFamily: "Arial, Helvetica, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden", maxWidth: 480, margin: "0 auto" }}>
          <Section style={{ backgroundColor: NAVY, padding: "24px 32px" }}>
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "0.02em" }}>KAIRO</Text>
          </Section>
          <Section style={{ padding: "32px" }}>
            <Heading style={{ fontSize: 20, color: NAVY, margin: "0 0 16px", fontFamily: "Arial, Helvetica, sans-serif" }}>{heading}</Heading>
            <Text style={{ fontSize: 15, color: "#334155", lineHeight: 1.6, margin: "0 0 24px" }}>{body}</Text>
            {ctaLabel && ctaUrl && (
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: GOLD, color: NAVY, fontWeight: 700, fontSize: 14,
                  padding: "12px 28px", borderRadius: 999, textDecoration: "none", display: "inline-block",
                }}
              >
                {ctaLabel}
              </Button>
            )}
            <Hr style={{ borderColor: "#e2e8f0", margin: "32px 0 16px" }} />
            <Text style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>— Kai, from Kairo</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
