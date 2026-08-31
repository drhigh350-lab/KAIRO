// Kairo V1 Dashboard — Mentor Copy Generator.
//
// Turns a { primaryOption, secondaryOption } DashboardOptions payload into
// the Recommendation Card's actual on-screen text: a Hook (about the
// Primary action) concatenated with a Pivot (about the Secondary action),
// plus button labels for both. Every string below is used EXACTLY as
// specified by the product owner — this file's only job is picking which
// one applies and filling in the real topic/subject, never rewording them.
//
// Type mapping (confirmed 2026-08-30, since the original spec named 4 Hook
// categories and 3 Pivot categories against an engine that only has 3 real
// DashboardOption.type values):
//   - "Targeted Gap" Hook           <- primaryOption.type === 'focused_sprint' (not avoidance-active)
//   - "Spaced Retrieval" Hook       <- primaryOption.type === 'utme_mix'
//       (RecommendationEngine.buildUtmeMix()'s own doc comment calls it
//       "UTME Mix (Spaced Retrieval)" — same real type, this is just what
//       it's called when it lands in the Primary slot)
//   - "Avoidance (3-Dodge)" Hook    <- primaryOption.type === 'focused_sprint' AND avoidanceActive
//   - "Planner Sync" Hook           <- DEFERRED (needs a plannerInfluenced
//       flag on DashboardOption that doesn't exist yet — every
//       focused_sprint falls to Targeted Gap until that signal is added)
//   - "Frontier Push" Pivot         <- secondaryOption.type === 'frontier_push'
//   - "UTME Mix" Pivot              <- secondaryOption.type === 'utme_mix'
//   - "Spaced Retrieval" Pivot      <- intentionally UNUSED: with utme_mix
//       already covering both Primary ("Spaced Retrieval") and Secondary
//       ("UTME Mix") slots, there's no 4th type left for this string to
//       describe. Left here as a comment, not code, so a future reader
//       knows it wasn't forgotten.
//
// Two real gaps the original spec didn't cover, because they're reachable
// states this engine can produce that weren't in the given dictionary:
// frontier_push CAN land in the Primary slot (e.g. nothing is Fading/
// Forming and there isn't yet enough Held/Reinforced volume for a UTME
// Mix), and focused_sprint CAN land in the Secondary slot (the Circuit
// Breaker's pivot-or-keep-blocked logic). Both get a Hook/Pivot/Button
// written in the same voice as the specified ones, clearly marked below —
// flag if you want different exact wording for these two.
import type { DashboardOption } from './kairoEngine';

export interface MentorCopy {
  title: string;
  body: string;
  primary_button: string;
  secondary_button: string | null;
}

const FALLBACK_TOPIC_LABEL = 'your recent topics';

function primaryTopicOrSubject(option: DashboardOption): string {
  return option.topic ?? option.subject ?? FALLBACK_TOPIC_LABEL;
}

/** Card title — not covered by the "use exactly these strings" mandate (only body/buttons were specified), so this reuses the same session-type framing the dashboard already used before this generator existed. */
function buildTitle(option: DashboardOption, avoidanceActive: boolean): string {
  if (option.type === 'focused_sprint' && avoidanceActive) {
    return option.subject ? `Time to face ${option.subject}` : 'Time to face it';
  }
  switch (option.type) {
    case 'focused_sprint': return option.topic ? `Focused Sprint: ${option.topic}` : 'Focused Sprint';
    case 'frontier_push': return option.topic ? `New Topic: ${option.topic}` : 'Frontier Push';
    case 'utme_mix': return 'UTME Mix';
    default: return 'Start Practising';
  }
}

function buildHook(option: DashboardOption, avoidanceActive: boolean): string {
  if (option.type === 'focused_sprint' && avoidanceActive) {
    // Avoidance (3-Dodge) Hook — exact string, product-owner-authorized.
    return `Look, you've avoided ${option.subject ?? 'this subject'} all week. The UTME won't let you skip it. Let's fix this now,`;
  }
  if (option.type === 'focused_sprint') {
    // Targeted Gap Hook — exact string.
    return `${primaryTopicOrSubject(option)} gave you some trouble recently. Let's lock that down now,`;
  }
  if (option.type === 'utme_mix') {
    // Spaced Retrieval Hook — exact string.
    return `You nailed ${primaryTopicOrSubject(option)} a few days ago. Let's do a quick memory check,`;
  }
  // frontier_push as Primary — not in the original dictionary (see file
  // header). Same voice/shape as the specified Hooks: names the topic,
  // ends in a comma to lead into a Pivot.
  return `${primaryTopicOrSubject(option)} hasn't come up yet — let's bring it into rotation,`;
}

function buildPrimaryButton(option: DashboardOption, avoidanceActive: boolean): string {
  if (option.type === 'focused_sprint' && avoidanceActive) {
    return `Tackle ${option.subject ?? 'it'} Now →`; // Avoidance (Primary) — exact string.
  }
  if (option.type === 'focused_sprint') {
    return `Fix ${primaryTopicOrSubject(option)} →`; // Targeted Gap (Primary) — exact string.
  }
  if (option.type === 'utme_mix') {
    return `Review ${primaryTopicOrSubject(option)} →`; // Spaced Retrieval (Primary) — exact string.
  }
  return `Explore ${primaryTopicOrSubject(option)} →`; // frontier_push as Primary — not in the original dictionary.
}

function buildPivotAndSecondaryButton(option: DashboardOption | null): { pivot: string | null; button: string | null } {
  if (!option) return { pivot: null, button: null };
  if (option.type === 'frontier_push') {
    return {
      pivot: `or if you need a breather, we can push into some fresh ${option.subject ?? 'material'}.`, // Frontier Push Pivot — exact string.
      button: `Explore ${option.topic ?? option.subject ?? 'something new'} instead →`, // Frontier Push (Secondary) — exact string. Note: Secondary buttons use TOPIC, not subject.
    };
  }
  if (option.type === 'utme_mix') {
    return {
      pivot: 'or we can mix things up to keep your reflexes sharp across the board.', // UTME Mix Pivot — exact string.
      button: 'Try a Mixed Session →', // UTME Mix (Secondary) — exact string.
    };
  }
  // focused_sprint as Secondary — not in the original dictionary (see file
  // header): the Circuit Breaker's pivot logic can leave a blocked Sprint
  // here when no alternative-subject Sprint exists. Same voice as the
  // specified Pivots/buttons.
  return {
    pivot: `or if you'd rather, we can go fix ${option.subject ?? 'something else'} instead.`,
    button: `Fix ${option.topic ?? option.subject ?? 'it'} instead →`,
  };
}

/**
 * Builds the Recommendation Card's real copy from the pinned
 * DashboardOptions payload (see dailyRecommendation.ts's
 * getPinnedDashboardOptions() — always pass the PINNED read here, never a
 * fresh recompute, for the same reason startDashboardSession() takes the
 * exact tapped option rather than re-deriving it).
 *
 * @param avoidanceActive — profile.avoidanceStreaks[primaryOption.subject]
 *   >= the Avoidance Tracker's threshold (3 as of this writing — kept as a
 *   literal here rather than imported, same "small cross-boundary display
 *   constant kept in sync manually" pattern this file already uses
 *   elsewhere for EXAM_PACE_SEC; the real source of truth is
 *   DashboardConstants.AVOIDANCE_STREAK_THRESHOLD in the engine). Only
 *   meaningful when primaryOption.type === 'focused_sprint' — ignored
 *   otherwise, since the Avoidance Hook only makes sense for a Sprint
 *   that's actually being offered right now.
 */
export function generateMentorCopy(
  primaryOption: DashboardOption | null,
  secondaryOption: DashboardOption | null,
  avoidanceActive: boolean = false
): MentorCopy {
  if (!primaryOption) {
    return {
      title: 'Start Practising',
      body: "Kairo built your first session from your check-in — adaptive from here.",
      primary_button: 'Start Session →',
      secondary_button: null,
    };
  }

  const hook = buildHook(primaryOption, avoidanceActive);
  const { pivot, button: secondaryButton } = buildPivotAndSecondaryButton(secondaryOption);
  // Every Hook ends in a trailing comma to lead into a Pivot — when there's
  // no Secondary to pivot to, that comma needs to close the sentence
  // instead of dangling.
  const body = pivot ? `${hook} ${pivot}` : hook.replace(/,\s*$/, '.');

  return {
    title: buildTitle(primaryOption, avoidanceActive),
    body,
    primary_button: buildPrimaryButton(primaryOption, avoidanceActive),
    secondary_button: secondaryButton,
  };
}
