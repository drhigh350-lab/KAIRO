/**
 * Kairo — SegmentedLeaderboard
 * Groups of ~20 students with similar strengths/weaknesses.
 * Never raw national ranking that demoralizes.
 */

export class SegmentedLeaderboard {
  constructor() {
    this.segments = new Map(); // segmentKey -> { students: [], lastUpdated }
  }

  /**
   * Assign a student to a segment based on their profile.
   * Segments by: targetCourse + approximate skill band (Elite Score tier).
   */
  getSegmentKey(studentProfile) {
    const score = studentProfile.eliteScoreHistory?.length > 0
      ? studentProfile.eliteScoreHistory[studentProfile.eliteScoreHistory.length - 1].total
      : 0;
    const tier = Math.floor(score / 20) * 20; // 0-20, 20-40, 40-60, 60-80, 80-100
    const course = studentProfile.targetCourse || 'general';
    return `${course}::tier_${tier}`;
  }

  addStudent(studentProfile) {
    const key = this.getSegmentKey(studentProfile);
    if (!this.segments.has(key)) {
      this.segments.set(key, { students: [], lastUpdated: Date.now() });
    }
    const segment = this.segments.get(key);

    // Remove if already present (re-segmenting)
    segment.students = segment.students.filter(s => s.studentId !== studentProfile.studentId);

    segment.students.push({
      studentId: studentProfile.studentId,
      name: studentProfile.name,
      eliteScore: studentProfile.eliteScoreHistory?.length > 0
        ? studentProfile.eliteScoreHistory[studentProfile.eliteScoreHistory.length - 1].total
        : 0,
      streak: studentProfile.streakData?.currentMomentum || 0,
      lastActive: studentProfile.lastSessionAt
    });

    // Sort by Elite Score descending
    segment.students.sort((a, b) => b.eliteScore - a.eliteScore);
    segment.lastUpdated = Date.now();

    return { segmentKey: key, rank: segment.students.findIndex(s => s.studentId === studentProfile.studentId) + 1 };
  }

  getLeaderboard(studentProfile, limit = 20) {
    const key = this.getSegmentKey(studentProfile);
    const segment = this.segments.get(key);
    if (!segment) return [];
    return segment.students.slice(0, limit).map((s, i) => ({
      rank: i + 1,
      ...s,
      isCurrentUser: s.studentId === studentProfile.studentId
    }));
  }

  /**
   * Get segments this student could move into (aspirational view).
   */
  getNextTier(studentProfile) {
    const currentKey = this.getSegmentKey(studentProfile);
    const score = studentProfile.eliteScoreHistory?.length > 0
      ? studentProfile.eliteScoreHistory[studentProfile.eliteScoreHistory.length - 1].total
      : 0;
    const nextTier = Math.floor(score / 20) * 20 + 20;
    const course = studentProfile.targetCourse || 'general';
    const nextKey = `${course}::tier_${nextTier}`;
    const nextSegment = this.segments.get(nextKey);

    if (!nextSegment) return null;
    return {
      tier: nextTier,
      lowestScore: nextSegment.students[nextSegment.students.length - 1]?.eliteScore || 0,
      students: nextSegment.students.slice(0, 5)
    };
  }
}

export class UniversityLeaderboard {
  constructor() {
    this.universities = new Map(); // universityName -> { totalScore, studentCount, students: [] }
  }

  recordPractice(studentProfile, sessionScore) {
    const uni = studentProfile.targetUniversity || studentProfile.targetCourse || 'Undecided';
    if (!this.universities.has(uni)) {
      this.universities.set(uni, { name: uni, totalScore: 0, studentCount: 0, students: [] });
    }
    const entry = this.universities.get(uni);

    // Update or add student
    const existing = entry.students.find(s => s.studentId === studentProfile.studentId);
    if (existing) {
      existing.contribution += sessionScore;
    } else {
      entry.students.push({
        studentId: studentProfile.studentId,
        name: studentProfile.name,
        contribution: sessionScore
      });
      entry.studentCount++;
    }

    entry.totalScore = entry.students.reduce((s, st) => s + st.contribution, 0);
    return entry;
  }

  getRankings(limit = 20) {
    const all = Array.from(this.universities.values())
      .map(u => ({
        ...u,
        avgScore: u.studentCount > 0 ? Math.round(u.totalScore / u.studentCount) : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    return all.slice(0, limit).map((u, i) => ({
      rank: i + 1,
      university: u.name,
      totalScore: u.totalScore,
      studentCount: u.studentCount,
      avgScore: u.avgScore
    }));
  }

  getUniversityDetail(universityName) {
    return this.universities.get(universityName) || null;
  }
}
