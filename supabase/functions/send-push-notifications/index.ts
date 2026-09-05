// Scheduled Web Push delivery. Invoke daily with x-cron-secret.
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.0.1";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) return json({ error: "unauthorized" }, 401);
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:privacy@techmedng.com";
  if (!vapidPublicKey || !vapidPrivateKey) return json({ error: "VAPID keys are not configured" }, 500);
  webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: candidates, error } = await supabase.schema("kairo").rpc("get_push_review_candidates");
  if (error) return json({ error: error.message }, 500);
  const result = { sent: 0, expired: 0, failed: 0 };

  for (const candidate of candidates ?? []) {
    const payload = JSON.stringify({
      title: "A concept is ready for review",
      body: `${candidate.concept_name} is due. A short practice session keeps it fresh.`,
      tag: `spaced-review-${candidate.student_id}`,
      url: "/review",
    });
    try {
      await webpush.sendNotification({ endpoint: candidate.endpoint, keys: { p256dh: candidate.p256dh, auth: candidate.auth } }, payload);
      const { error: logError } = await supabase.schema("kairo").from("push_delivery_log").insert({
        student_id: candidate.student_id,
        subscription_id: candidate.subscription_id,
        category: "spaced_review",
        dedupe_key: candidate.dedupe_key,
      });
      if (logError) throw logError;
      result.sent++;
    } catch (error) {
      const status = error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 0;
      if (status === 404 || status === 410) {
        await supabase.schema("kairo").from("push_subscriptions").delete().eq("id", candidate.subscription_id);
        result.expired++;
      } else {
        console.error("push delivery failed", candidate.subscription_id, error);
        result.failed++;
      }
    }
  }
  return json(result);
});
