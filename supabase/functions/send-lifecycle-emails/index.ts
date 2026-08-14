// send-lifecycle-emails
//
// Scheduled (not user-facing) — invoked by a pg_cron job via pg_net once a
// day, never by a browser. Auth is a shared secret in the x-cron-secret
// header, not a user JWT (verify_jwt is off for this function), matching
// how pay-webhook authenticates Paystack instead of a signed-in user.
//
// Sends three kinds of Resend emails, all consent-gated at the SQL layer
// (kairo.get_streak_risk_candidates / kairo.get_new_achievement_candidates
// / kairo.get_reengagement_candidates — see migrations
// add_lifecycle_email_infrastructure and add_reengagement_candidates_rpc)
// exactly like every other Kairo send path: silence is the default,
// delivery requires explicit consent (ConsentManager.canSend()'s own
// rule, restated here for this channel):
//
//   - streak_risk: a student's momentum streak breaks tomorrow if they
//     don't practice today (MomentumStreak's own break rule — gap > 3 days
//     halves it). One nudge per calendar day per student, never more.
//   - achievement: a badge id present in kairo.students.badges that has
//     never been emailed before. Copy is pulled verbatim from
//     ProgressionSystem.js's BADGE_CATALOG (kept in sync manually below) —
//     never reworded or invented here.
//   - reengagement: ReEngagementEngine.js's real gap-severity ladder
//     (Student Journey & Engagement Engine §6), narrowed to its two
//     rungs reachable without persisted winBackAttempts state — see the
//     RPC's own doc comment for exactly what's simplified and why. Copy
//     is ReEngagementEngine._composeInvitation()'s own template, verbatim
//     — never references absence length or past performance (§6.4/§6.8).
//     One nudge per ISO week per student (dedupe_key comes straight from
//     the RPC, not recomputed here, so the filter and the write always
//     agree on the same key format).
//
// kairo.email_log is the idempotency record for all three — a send is only
// logged after Resend actually accepts it, so a failed send is retried
// on the next run rather than silently lost.

import { createClient } from "jsr:@supabase/supabase-js@2";

// Keep in sync with ProgressionSystem.js's BadgeSystem.getBadgeCatalog().
// Copy is never reworded here — an id missing from this map is skipped
// and logged, not guessed at.
const BADGE_CATALOG: Record<string, { name: string; desc: string }> = {
  first_reinforced: { name: "Memory Builder", desc: "First concept moved to Reinforced" },
  ten_reinforced: { name: "Retention Master", desc: "10 concepts in Reinforced state" },
  fifty_reinforced: { name: "Unforgettable", desc: "50 concepts in Reinforced state" },
  three_day_streak: { name: "Rhythm Starter", desc: "Studied 3 days in a row" },
  seven_day_streak: { name: "Daily Habit", desc: "7 days of consistent practice" },
  fourteen_day_streak: { name: "Unstoppable", desc: "14 days of momentum" },
  perfect_session: { name: "Clean Sheet", desc: "100% accuracy in a session of 10+ questions" },
  rapid_fire_ace: { name: "Speed Demon", desc: "Completed Rapid Fire with 90%+ accuracy under average 10s per question" },
  comeback_kid: { name: "Comeback Kid", desc: "Returned after an At Risk gap and completed a session" },
  topic_master: { name: "Topic Master", desc: "Mastered an entire topic (80%+ Held/Reinforced)" },
  subject_conqueror: { name: "Subject Conqueror", desc: "Mastered an entire subject" },
  university_contributor: { name: "Proud Representative", desc: "Contributed 100+ points to your university leaderboard" },
  night_owl: { name: "Night Owl", desc: "Completed 5 sessions after 10 PM" },
  early_bird: { name: "Early Bird", desc: "Completed 5 sessions before 7 AM" },
};

// Same verified Resend sending domain pay-webhook/pay-initiate already use
// (techmedng.com) — only the local part differs, since this is Kai's voice,
// not a transactional receipt.
const FROM_ADDRESS = "Kai from Kairo <kai@techmedng.com>";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emailShell(name: string, bodyHtml: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #012748;">
      ${bodyHtml}
      <p style="font-size: 13px; color: #6C87A0; margin-top: 32px;">— Kai</p>
    </div>
  `;
}

async function sendEmail(resendApiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error (${res.status}): ${text}`);
  }
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not set in Edge Function secrets");
    return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const results = {
    streakRisk: { sent: 0, failed: 0 },
    achievement: { sent: 0, failed: 0 },
    reengagement: { sent: 0, failed: 0 },
  };

  // ---- Streak-at-risk ----
  const { data: streakCandidates, error: streakErr } = await supabase
    .schema("kairo")
    .rpc("get_streak_risk_candidates");

  if (streakErr) {
    console.error("get_streak_risk_candidates failed:", streakErr);
  } else {
    for (const c of streakCandidates ?? []) {
      try {
        await sendEmail(
          resendApiKey,
          c.email,
          `${c.name}, your ${c.momentum}-day rhythm is still there`,
          emailShell(
            c.name,
            `<p>Hey ${c.name},</p>\n             <p>You've built a ${c.momentum}-day momentum streak. One session in the next day keeps it going — no pressure if today's been a lot, just didn't want you to lose the rhythm without knowing.</p>`,
          ),
        );
        const { error: logErr } = await supabase.schema("kairo").from("email_log").insert({
          student_id: c.student_id,
          category: "streak_risk",
          dedupe_key: new Date().toISOString().slice(0, 10),
        });
        if (logErr) console.error("email_log insert failed (streak_risk):", c.student_id, logErr);
        results.streakRisk.sent++;
      } catch (e) {
        console.error("streak_risk send failed:", c.student_id, e);
        results.streakRisk.failed++;
      }
    }
  }

  // ---- New achievements ----
  const { data: achievementCandidates, error: achErr } = await supabase
    .schema("kairo")
    .rpc("get_new_achievement_candidates");

  if (achErr) {
    console.error("get_new_achievement_candidates failed:", achErr);
  } else {
    for (const c of achievementCandidates ?? []) {
      const badge = BADGE_CATALOG[c.badge_id];
      if (!badge) {
        console.error("Unknown badge_id — BADGE_CATALOG out of sync:", c.badge_id);
        continue;
      }
      try {
        await sendEmail(
          resendApiKey,
          c.email,
          `You earned ${badge.name}`,
          emailShell(
            c.name,
            `<p>Hey ${c.name},</p>\n             <p><strong>${badge.name}</strong> — ${badge.desc}.</p>`,
          ),
        );
        const { error: logErr } = await supabase.schema("kairo").from("email_log").insert({
          student_id: c.student_id,
          category: "achievement",
          dedupe_key: c.badge_id,
        });
        if (logErr) console.error("email_log insert failed (achievement):", c.student_id, c.badge_id, logErr);
        results.achievement.sent++;
      } catch (e) {
        console.error("achievement send failed:", c.student_id, c.badge_id, e);
        results.achievement.failed++;
      }
    }
  }

  // ---- Re-engagement (ReEngagementEngine.js's real gap ladder — see the
  // get_reengagement_candidates() RPC's doc comment for the exact scope) ----
  const { data: reengagementCandidates, error: reErr } = await supabase
    .schema("kairo")
    .rpc("get_reengagement_candidates");

  if (reErr) {
    console.error("get_reengagement_candidates failed:", reErr);
  } else {
    for (const c of reengagementCandidates ?? []) {
      try {
        // ReEngagementEngine._composeInvitation()'s exact template — never
        // references absence length or past performance (§6.4/§6.8).
        const body = c.concept_name
          ? `Ready when you are — I kept your place. ${c.concept_name} is ready to come back.`
          : "Ready when you are — I kept your place.";
        await sendEmail(
          resendApiKey,
          c.email,
          "Ready when you are",
          emailShell(c.name, `<p>Hey ${c.name},</p>\n             <p>${body}</p>`),
        );
        const { error: logErr } = await supabase.schema("kairo").from("email_log").insert({
          student_id: c.student_id,
          category: "reengagement",
          dedupe_key: c.dedupe_key,
        });
        if (logErr) console.error("email_log insert failed (reengagement):", c.student_id, logErr);
        results.reengagement.sent++;
      } catch (e) {
        console.error("reengagement send failed:", c.student_id, e);
        results.reengagement.failed++;
      }
    }
  }

  return jsonResponse(results);
});
