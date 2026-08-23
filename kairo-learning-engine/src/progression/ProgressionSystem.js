/**
 * Kairo — ProgressionSystem
 * Levels and Kairo Points that reward learning behavior, not just volume.
 *
 * Kairo Points is a "Tight Economy" ledger, deliberately distinct from
 * Kairo Score (EliteScore.js): Kairo Score is a bounded 0-100 recompute-
 * from-scratch quality curve, meant to plateau — a UTME-readiness gauge.
 * Kairo Points is unbounded but strictly linear — every award is a flat,
 * predictable function of one completed session's own real results (+2
 * per correct answer, plus at most one flat session-type bonus), never a
 * scan of cumulative graph/profile state. A prior "milestone ledger"
 * design (crediting lifetime firsts — a concept reaching Held, a topic
 * crossing 80% mastery) let several such firsts land in the same session
 * and stack into a payout with no relationship to session length — this
 * design deliberately can't do that: total earned this call is always
 * exactly correctCount * CORRECT_ANSWER + sessionBonus.
 */
import { KairoPointsAwards } from '../utils/constants.js';

export class LevelSystem {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.levels = this._defineLevels();
    this.current = this._calculateCurrentLevel();
  }

  _defineLevels() {
    // Kairo Points here is a proxy for "learning actions" — but weighted by quality
    return [
      { level: 1,  name: 'First Step',      pointsRequired: 0,    tagline: 'You began.' },
      { level: 2,  name: 'Curious Mind',    pointsRequired: 100,  tagline: 'Questions are becoming familiar.' },
      { level: 3,  name: 'Pattern Seeker',  pointsRequired: 300,  tagline: 'You are noticing how concepts connect.' },
      { level: 4,  name: 'Steady Builder',  pointsRequired: 600,  tagline: "You're settling into a real rhythm." },
      { level: 5,  name: 'Knowledge Keeper',pointsRequired: 1000, tagline: 'You are remembering after time passes.' },
      { level: 6,  name: 'Strategist',      pointsRequired: 1500, tagline: 'You think before you answer.' },
      { level: 7,  name: 'Elite Scholar',   pointsRequired: 2200, tagline: 'Hard concepts are becoming routine.' },
      { level: 8,  name: 'Master Learner',  pointsRequired: 3000, tagline: 'You understand the system.' },
      { level: 9,  name: 'Grandmaster',     pointsRequired: 4000, tagline: 'Others could learn from your rhythm.' },
      { level: 10, name: 'Kairo Legend',    pointsRequired: 5500, tagline: 'Think Smart. Perform Elite.' }
    ];
  }

  _calculateCurrentLevel() {
    const points = this.profile.kairoPoints || 0;
    let level = this.levels[0];
    for (const l of this.levels) {
      if (points >= l.pointsRequired) level = l;
    }
    return level;
  }

  /**
   * Credits this session's Kairo Points: +2 per correct answer (0 for
   * incorrect/skipped/unsure), plus at most one flat session-type bonus
   * (RECOMMENDATION_SESSION / VERIFICATION_SESSION / CBT_SESSION / 0 for
   * everything else — see the caller). Strictly linear, never a scan of
   * graph/profile state, so a session's payout is always exactly
   * predictable from its own results. Call once per completed session
   * (endSession(), CBTExamMode.finish(), RapidFireEngine.finish()).
   */
  update(correctCount, sessionBonus = 0) {
    const basePoints = Math.max(0, correctCount) * KairoPointsAwards.CORRECT_ANSWER;
    const earned = basePoints + sessionBonus;
    this.profile.kairoPoints = (this.profile.kairoPoints || 0) + earned;

    const newLevel = this._calculateCurrentLevel();
    const leveledUp = newLevel.level > this.current.level;
    this.current = newLevel;
    return {
      pointsEarned: earned,
      totalPoints: this.profile.kairoPoints,
      level: newLevel,
      leveledUp,
      nextLevelPoints: this._nextLevelPoints()
    };
  }

  _nextLevelPoints() {
    const next = this.levels.find(l => l.level === this.current.level + 1);
    return next ? next.pointsRequired : null;
  }

  getProgress() {
    const nextPoints = this._nextLevelPoints();
    const currentPoints = this.profile.kairoPoints || 0;
    const prevPoints = this.levels.find(l => l.level === this.current.level)?.pointsRequired || 0;
    const progress = nextPoints
      ? Math.min(100, Math.round(((currentPoints - prevPoints) / (nextPoints - prevPoints)) * 100))
      : 100;
    return {
      level: this.current.level,
      name: this.current.name,
      tagline: this.current.tagline,
      points: currentPoints,
      nextLevelPoints: nextPoints,
      progressPercent: progress
    };
  }
}

/**
 * Kairo — Badge Vault
 * Replaces the old flat one-off badge catalog with a tiered-track model:
 * 4 tracks (3 universal + 1 per-subject), 3 tiers each, where a track only
 * ever shows its CURRENT tier — a higher tier replaces the lower one it
 * grew out of, the way a Duolingo league badge does, rather than the
 * old catalog's "collect all 14 forever" shape.
 *
 * Persistence deliberately reuses the existing profile.badges: string[]
 * column/field as-is (no schema migration) by encoding both the track+tier
 * identity AND the real achieved-at timestamp straight into the id string:
 *   "<trackKey>::tier<N>@<epochMs>"
 * e.g. "consistency::tier2@1755993600000" or
 *      "subject:Biology::tier1@1755993600000"
 * `::` (not a bare colon) separates the track key from the tier+timestamp
 * so a subject name that happens to contain no colon of its own (none of
 * Kairo's seeded subjects do) never gets misparsed. Each track keeps at
 * most one live entry — checkAndAward() below removes a track's previous
 * entry the moment a higher tier is reached, same "only current tier is
 * live" rule the display itself follows.
 */
export class BadgeSystem {
  static TRACK_SEP = '::';

  constructor(studentProfile) {
    this.profile = studentProfile;
    this.earned = studentProfile.badges || [];
  }

  /**
   * Tier metadata for the 3 universal tracks. Per-subject tracks reuse this
   * same 3-tier shape with subject-templated names (see _subjectTierMeta).
   */
  static TRACK_CATALOG = {
    consistency: {
      label: 'Consistency',
      tiers: [
        { name: 'Momentum Builder', desc: 'Kept a real practice rhythm going for a full week.' },
        { name: 'The Unbreakable', desc: 'A month of consistent momentum — a genuine habit now.' },
        { name: 'The Relentless', desc: '100 days of momentum. This is who you are now, not just what you do.' }
      ]
    },
    resilience: {
      label: 'Resilience',
      tiers: [
        { name: 'The Comeback', desc: 'Came back after a real gap and got straight back to work.' },
        { name: 'Ironclad Foundation', desc: 'Rebuilt several concepts that had started slipping — and made them stick.' },
        { name: 'The Architect', desc: 'A proven pattern of recovering and rebuilding, again and again.' }
      ]
    },
    execution: {
      label: 'Execution',
      tiers: [
        { name: 'Sharp Shooter', desc: 'Strong accuracy holding up across a real volume of questions.' },
        { name: 'The Sniper', desc: "You're getting faster and sharper at these." },
        { name: 'Elite Operator', desc: 'Exam-day precision, sustained — not a lucky run.' }
      ]
    }
  };

  static _subjectTierMeta(subject) {
    return [
      { name: `${subject} Initiate`, desc: `Real ground covered in ${subject}.` },
      { name: `${subject} Specialist`, desc: `Most of ${subject} is now Held or Reinforced.` },
      { name: `${subject} Authority`, desc: `${subject} is about as solid as it gets.` }
    ];
  }

  // ─── Signal computation — one method per track, each a pure read of
  // real graph/profile state, never a hand-maintained context object. ───

  /**
   * Consistency: profile.streakData.longestMomentum, not the live
   * currentMomentum — longestMomentum only ever rises (see
   * StudentProfile's own comment on it), so a tier earned here can't be
   * silently un-earned by a later real streak break, matching the sticky-
   * signal convention EliteScore/everReachedHeld already use elsewhere in
   * this engine. Day thresholds (7/30/100) are a first, documented
   * engineering judgment call — a week, a month, and roughly a full term
   * of daily practice — not derived from real usage data yet.
   */
  static _consistencyValue(profile) {
    return profile.streakData?.longestMomentum || 0;
  }
  static _consistencyTier(value) {
    if (value >= 100) return 3;
    if (value >= 30) return 2;
    if (value >= 7) return 1;
    return 0;
  }

  /**
   * Resilience: two independent real signals, combined —
   *   recoveryCount — how many times macroStateHistory actually
   *     transitioned INTO 'recovering' (a genuine return from an At-Risk
   *     gap, per StudentProfile.computeMacroState()'s own AT_RISK ->
   *     RECOVERING edge).
   *   rebuiltCount — how many concepts in the current graph have
   *     ConceptNode.reinforcedCycles >= 1, i.e. have genuinely survived at
   *     least one real Fading -> Reinforced rebuild.
   * Tier 1 only needs a single real comeback (the hardest part is often
   * just returning at all). Tier 2 needs a real base of rebuilt concepts
   * (5) rather than another comeback, since a student can build a very
   * resilient knowledge base through steady rebuilding without ever
   * having hit At-Risk. Tier 3 ("The Architect") requires BOTH a
   * sustained comeback pattern (3+) and a large rebuilt base (15+) — a
   * judgment call that the top tier should demand the full pattern, not
   * just one strong signal.
   */
  static _resilienceValue(profile, graph) {
    const recoveryCount = (profile.macroStateHistory || []).filter(h => h.to === 'recovering').length;
    const concepts = graph ? Array.from(graph.nodes.values()) : [];
    const rebuiltCount = concepts.filter(c => (c.reinforcedCycles || 0) >= 1).length;
    return { recoveryCount, rebuiltCount };
  }
  static _resilienceTier({ recoveryCount, rebuiltCount }) {
    if (recoveryCount >= 3 && rebuiltCount >= 15) return 3;
    if (rebuiltCount >= 5) return 2;
    if (recoveryCount >= 1) return 1;
    return 0;
  }

  /**
   * Execution: rolling accuracy over the student's most recent sessions
   * (every mode — standard/topic/custom/rapid_fire/cbt_exam all feed
   * profile.sessions via recordSession(), so a CBT simulation's real
   * performance counts here the same as any other session). Paired
   * sample-size floors (20/50/100 questions) rise alongside the accuracy
   * bar so the top tier demands sustained precision at real volume, not a
   * short lucky streak — a 6-question 100% run should never read the same
   * as 100 real questions at 92%. Window capped at the most recent 20
   * sessions so a strong recent stretch can still move this even for a
   * student with a long history the accuracy bar might otherwise average out.
   */
  static _executionValue(profile) {
    const recent = (profile.sessions || []).slice(-20);
    const totalQuestions = recent.reduce((s, sess) => s + (sess.questionsAnswered || 0), 0);
    const totalCorrect = recent.reduce((s, sess) => s + (sess.correctCount || 0), 0);
    const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    return { totalQuestions, accuracy };
  }
  static _executionTier({ totalQuestions, accuracy }) {
    if (totalQuestions >= 100 && accuracy >= 0.92) return 3;
    if (totalQuestions >= 50 && accuracy >= 0.85) return 2;
    if (totalQuestions >= 20 && accuracy >= 0.75) return 1;
    return 0;
  }

  /**
   * Subject: real per-subject mastery — (Held + Reinforced concepts) /
   * (total concepts) for every subject with real seeded content in the
   * current graph. A subject needs at least MIN_CONCEPTS concepts before
   * it gets a track at all — a subject with, say, 1-2 seeded concepts
   * would otherwise trivially hit 100% mastery and read as a false
   * "Authority" the student barely touched. 25/60/90% mirror familiar
   * curriculum-completion milestones (a quarter in, past the halfway
   * point, essentially done) — a judgment call, not derived from
   * real usage data yet.
   */
  static MIN_SUBJECT_CONCEPTS = 5;
  static _subjectValues(graph) {
    if (!graph) return [];
    const bySubject = new Map();
    for (const c of graph.nodes.values()) {
      if (!bySubject.has(c.subject)) bySubject.set(c.subject, { total: 0, mastered: 0 });
      const s = bySubject.get(c.subject);
      s.total++;
      if (c.retentionState === 'held' || c.retentionState === 'reinforced') s.mastered++;
    }
    return Array.from(bySubject.entries())
      .filter(([, s]) => s.total >= BadgeSystem.MIN_SUBJECT_CONCEPTS)
      .map(([subject, s]) => ({ subject, masteryPct: s.mastered / s.total, total: s.total, mastered: s.mastered }));
  }
  static _subjectTier(masteryPct) {
    if (masteryPct >= 0.90) return 3;
    if (masteryPct >= 0.60) return 2;
    if (masteryPct >= 0.25) return 1;
    return 0;
  }

  // ─── Id encode/decode ───

  static _makeId(trackKey, tier, achievedAt) {
    return `${trackKey}${BadgeSystem.TRACK_SEP}tier${tier}@${achievedAt}`;
  }
  static _parseId(id) {
    const [trackKey, rest] = id.split(BadgeSystem.TRACK_SEP);
    if (!rest) return null;
    const [tierPart, tsPart] = rest.split('@');
    const tier = parseInt(tierPart.replace('tier', ''), 10);
    const achievedAt = parseInt(tsPart, 10);
    if (!trackKey || Number.isNaN(tier) || Number.isNaN(achievedAt)) return null;
    return { trackKey, tier, achievedAt };
  }

  /** Highest recorded tier + its achieved-at timestamp, per track key. */
  _recordedByTrack() {
    const map = new Map();
    for (const id of this.earned) {
      const parsed = BadgeSystem._parseId(id);
      if (!parsed) continue;
      const existing = map.get(parsed.trackKey);
      if (!existing || parsed.tier > existing.tier) map.set(parsed.trackKey, parsed);
    }
    return map;
  }

  static _trackMeta(trackKey) {
    if (trackKey.startsWith(`subject:`)) {
      const subject = trackKey.slice('subject:'.length);
      return { label: subject, tiers: BadgeSystem._subjectTierMeta(subject) };
    }
    return BadgeSystem.TRACK_CATALOG[trackKey];
  }

  /**
   * Recompute every track against the current graph/profile and persist
   * any newly-reached tier. Call once per completed session (endSession(),
   * CBTExamMode.finish(), RapidFireEngine.finish() — the same three call
   * sites LevelSystem.update() already has), same "recompute from real
   * state, never a hand-tracked context object" spirit as EliteScore.
   */
  checkAndAward(graph) {
    const now = Date.now();
    const recorded = this._recordedByTrack();
    const newlyEarned = [];

    const liveStates = this._liveTrackStates(graph);
    for (const state of liveStates) {
      const prevTier = recorded.get(state.trackKey)?.tier || 0;
      if (state.tier > prevTier && state.tier > 0) {
        const id = BadgeSystem._makeId(state.trackKey, state.tier, now);
        this.earned = this.earned.filter(existingId => {
          const parsed = BadgeSystem._parseId(existingId);
          return !(parsed && parsed.trackKey === state.trackKey);
        });
        this.earned.push(id);
        const meta = BadgeSystem._trackMeta(state.trackKey);
        newlyEarned.push({
          trackKey: state.trackKey,
          label: meta.label,
          tier: state.tier,
          name: meta.tiers[state.tier - 1].name,
          desc: meta.tiers[state.tier - 1].desc,
          achievedAt: now
        });
      }
    }

    this.profile.badges = this.earned;
    return newlyEarned;
  }

  /** Every track's current live-computed tier — the 3 universal tracks plus one per real seeded subject. */
  _liveTrackStates(graph) {
    const states = [
      { trackKey: 'consistency', tier: BadgeSystem._consistencyTier(BadgeSystem._consistencyValue(this.profile)) },
      { trackKey: 'resilience', tier: BadgeSystem._resilienceTier(BadgeSystem._resilienceValue(this.profile, graph)) },
      { trackKey: 'execution', tier: BadgeSystem._executionTier(BadgeSystem._executionValue(this.profile)) }
    ];
    for (const s of BadgeSystem._subjectValues(graph)) {
      states.push({ trackKey: `subject:${s.subject}`, tier: BadgeSystem._subjectTier(s.masteryPct), masteryPct: s.masteryPct });
    }
    return states;
  }

  /**
   * Full Vault display model: every track's current earned tier (or
   * locked), its real achieved-at date, and what the next tier needs —
   * framed as a challenge for the Vault bottom sheet's copy, not a raw
   * threshold number. Subjects are returned as a ranked array (highest
   * tier, then highest mastery%, first) — getDisplayBadges() below picks
   * just the top one for the 4-icon summary row.
   */
  getVault(graph) {
    const recorded = this._recordedByTrack();
    const liveStates = this._liveTrackStates(graph);

    function buildEntry(trackKey, liveTier) {
      const meta = BadgeSystem._trackMeta(trackKey);
      const rec = recorded.get(trackKey);
      const currentTier = rec?.tier || 0;
      const locked = currentTier === 0;
      const nextTierIndex = currentTier; // 0-based tier array index of the NEXT tier
      const nextTier = nextTierIndex < 3 ? { tier: nextTierIndex + 1, ...meta.tiers[nextTierIndex] } : null;
      return {
        trackKey,
        label: meta.label,
        locked,
        currentTier,
        currentTierName: locked ? null : meta.tiers[currentTier - 1].name,
        currentTierDesc: locked ? null : meta.tiers[currentTier - 1].desc,
        achievedAt: rec?.achievedAt || null,
        isMaxTier: currentTier >= 3,
        nextTier,
        liveTier // the freshly-computed tier as of right now, for detecting "about to level up" UI if ever wanted
      };
    }

    const tracks = {
      consistency: buildEntry('consistency', liveStates.find(s => s.trackKey === 'consistency').tier),
      resilience: buildEntry('resilience', liveStates.find(s => s.trackKey === 'resilience').tier),
      execution: buildEntry('execution', liveStates.find(s => s.trackKey === 'execution').tier)
    };

    const subjects = liveStates
      .filter(s => s.trackKey.startsWith('subject:'))
      .map(s => buildEntry(s.trackKey, s.tier))
      .sort((a, b) => (b.currentTier - a.currentTier) || ((b.liveTier ?? 0) - (a.liveTier ?? 0)));

    return { tracks, subjects };
  }

  /**
   * Up to 4 badges for the compact Profile/Vault summary row: the 3
   * universal tracks (always present — they're not gated on real seeded
   * subject content the way the subject track is) plus the single
   * strongest subject track, when the student has one. Fewer than 4 only
   * when there's no qualifying subject yet (no seeded content, or none
   * past MIN_SUBJECT_CONCEPTS) — every track shown, locked ones included
   * (grayscale is a UI concern, not a filtering one here).
   */
  getDisplayBadges(graph) {
    const vault = this.getVault(graph);
    const entries = [vault.tracks.consistency, vault.tracks.resilience, vault.tracks.execution];
    if (vault.subjects.length > 0) entries.push(vault.subjects[0]);
    return entries;
  }

  /**
   * Backward-compatible {earned, available} shape (getBadges()'s existing
   * contract) — earned is every track's current live badge (one per
   * unlocked track), available is every track's next tier not yet
   * reached, so a fresh, all-locked student still sees a real Vault to
   * work toward instead of an empty list.
   */
  getEarned(graph) {
    const vault = this.getVault(graph);
    const all = [vault.tracks.consistency, vault.tracks.resilience, vault.tracks.execution, ...vault.subjects];
    return all
      .filter(t => !t.locked)
      .map(t => ({ id: `${t.trackKey}::tier${t.currentTier}`, name: t.currentTierName, desc: t.currentTierDesc, achievedAt: t.achievedAt }));
  }

  getAvailable(graph) {
    const vault = this.getVault(graph);
    const all = [vault.tracks.consistency, vault.tracks.resilience, vault.tracks.execution, ...vault.subjects];
    return all
      .filter(t => !t.isMaxTier)
      .map(t => ({ id: `${t.trackKey}::tier${(t.currentTier || 0) + 1}`, name: t.nextTier.name, desc: t.nextTier.desc }));
  }
}
