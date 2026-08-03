/**
 * Kairo — SegmentedLeaderboard / UniversityLeaderboard
 * Groups of ~20 students with similar strengths/weaknesses.
 * Never raw national ranking that demoralizes.
 *
 * Backed by kairo.students directly (elite_score_history,
 * streak_current_momentum, target_course/university already sync there
 * via pushProfile()) — no separate write path or table. Previously
 * these were pure in-memory Maps scoped to a single KairoEngine
 * instance: addStudent()/recordPractice() only ever added the CURRENT
 * student to their own empty, ephemeral registry, so a real
 * multi-student deployment could never show real ranking through
 * getLeaderboard()/getRankings() — every student saw themselves alone.
 */

export class SegmentedLeaderboard {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  _requireAdapter() {
    if (!this.engine.sync.adapter) {
      throw new Error('SegmentedLeaderboard requires connectSupabase() first — a leaderboard is shared, cross-student data, not local-only state.');
    }
    return this.engine.sync.adapter;
  }

  /**
   * Segment key for display purposes only now (course + approximate
   * Elite Score tier) — the actual bucketing happens server-side in
   * kairo.get_segmented_leaderboard(), computed identically.
   */
  getSegmentKey(studentProfile) {
    const score = studentProfile.eliteScoreHistory?.length > 0
      ? studentProfile.eliteScoreHistory[studentProfile.eliteScoreHistory.length - 1].total
      : 0;
    const tier = Math.floor(score / 20) * 20;
    const course = studentProfile.targetCourse || 'general';
    return `${course}::tier_${tier}`;
  }

  async getLeaderboard(studentProfile, limit = 20) {
    const rows = await this._requireAdapter().fetchSegmentedLeaderboard(studentProfile.studentId, limit);
    return rows.map(r => ({ ...r, studentId: r.studentId, isCurrentUser: r.isCurrentUser }));
  }
}

export class UniversityLeaderboard {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  _requireAdapter() {
    if (!this.engine.sync.adapter) {
      throw new Error('UniversityLeaderboard requires connectSupabase() first — a leaderboard is shared, cross-student data, not local-only state.');
    }
    return this.engine.sync.adapter;
  }

  async getRankings(limit = 20) {
    return this._requireAdapter().fetchUniversityRankings(limit);
  }

  async getUniversityDetail(universityName, limit = 50) {
    const all = await this.getRankings(limit);
    return all.find(u => u.university === universityName) || null;
  }
}
