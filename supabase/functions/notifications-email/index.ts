// notifications-email
//
// V1 architecture Batch 3 — the on-demand, user-facing counterpart to
// send-lifecycle-emails (which is cron-only and never called by a
// browser). Any signed-in student can call this directly via
// `supabase.functions.invoke('notifications-email', { body: {...} })` to
// have Kairo send *them* a branded transactional email — e.g. a manually
// triggered recap, confirmation, or reminder that doesn't fit the daily
// lifecycle-email cron's fixed categories.
//
// Auth model deliberately differs from send-lifecycle-emails: this is a
// real user-facing endpoint, so it relies on the platform's default JWT
// verification (no x-cron-secret, no verify_jwt override) and further
// resolves the caller's own auth.users row — the recipient is always the
// authenticated caller's own email, never an arbitrary address a client
// could pass in, so this can't be turned into an open mail relay.
//
// The template itself is a real React Email component (_templates/
// notification-email.tsx), rendered to HTML server-side, then sent
// through the same raw Resend HTTP call send-lifecycle-emails already
// uses (no need to pull in the full `resend` SDK just for this).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { render } from "npm:@react-email/render@2.1.0";
import * as React from "npm:react@19.2.8";
import NotificationEmail from "./_templates/notification-email.tsx";

const FROM_ADDRESS = "Kai from Kairo <kai@techmedng.com>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

interface EmailPayload {
  subject?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  previewText?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not set in Edge Function secrets");
    return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  // Resolves the caller's identity from their own JWT (passed straight
  // through via the Authorization header) rather than a service-role key —
  // this function should only ever be able to act as the signed-in caller.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user?.email) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const { subject, heading, body, ctaLabel, ctaUrl, previewText } = payload;
  if (!subject || !heading || !body) {
    return jsonResponse({ error: "subject, heading, and body are required" }, 400);
  }

  const html = await render(
    React.createElement(NotificationEmail, { heading, body, ctaLabel, ctaUrl, previewText }),
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: userData.user.email, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Resend API error (${res.status}):`, text);
    return jsonResponse({ error: `Resend API error (${res.status})` }, 502);
  }

  return jsonResponse({ sent: true });
});
