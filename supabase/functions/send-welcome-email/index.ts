import { createClient } from "jsr:@supabase/supabase-js@2";

const FROM_ADDRESS = "Kai from Kairo <kai@kairo.techmedng.com>";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emailShell(bodyHtml: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#012748">${bodyHtml}<p style="font-size:13px;color:#6C87A0;margin-top:32px">— Kai</p></div>`;
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) return jsonResponse({ error: "unauthorized" }, 401);
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);

  let body: { student_id?: string; email?: string; name?: string };
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid JSON body" }, 400); }
  if (!body.student_id || !body.email) return jsonResponse({ skipped: true, reason: "missing student_id or email" });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: already } = await supabase.schema("kairo").from("email_log").select("id").eq("student_id", body.student_id).eq("category", "welcome").maybeSingle();
  if (already) return jsonResponse({ skipped: true, reason: "already sent" });

  const firstName = (body.name || "there").trim().split(/\s+/)[0] || "there";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: body.email,
      subject: "Welcome to Kairo — let's get your UTME sorted",
      html: emailShell(`<p>Hey ${firstName},</p><p>I'm Kai — I'll be with you through every practice session, mock exam, and review between now and your UTME.</p><p>Open Kairo and answer your first question to get started.</p>`),
    }),
  });
  if (!res.ok) return jsonResponse({ error: `Resend API error (${res.status})` }, 502);

  const { error } = await supabase.schema("kairo").from("email_log").insert({ student_id: body.student_id, category: "welcome", dedupe_key: "welcome" });
  if (error) return jsonResponse({ error: "email sent but delivery log failed" }, 500);
  return jsonResponse({ sent: true });
});
