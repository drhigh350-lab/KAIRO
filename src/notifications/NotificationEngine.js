/**
 * Kairo — NotificationEngine
 * Smart, contextual notifications. Never noise.
 * Follows Kai's rule: invitation-based, never guilt-based.
 *
 * A candidate SOURCE only, per §5.2's platform-wide constraint ("NO
 * module sends a notification directly"). checkNotifications() used to
 * self-deliver into its own queue, bypassing NotificationOrchestrator's
 * tone gate/frequency budget entirely — now it only returns candidates
 * for NotificationPipeline to submit. `history`/`_wasNotified()`/
 * `markAsRead()` remain: they're a genuinely different concern from the
 * Orchestrator's time-window frequency budget — per-type "don't repeat
 * this exact one-time event again" dedup (exam_6weeks firing once ever,
 * not once per day).
 */

export class NotificationEngine {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
    this.history = kairoEngine.profile.notificationHistory || [];
  }

  /**
   * Compute which candidates are worth submitting right now.
   * Call this on app open and periodically. Returns Orchestrator-shaped
   * candidates ({ type, tier, title, body, action, priorityWeight });
   * does not deliver anything itself.
   */
  checkNotifications() {
    const notifications = [];
    const profile = this.engine.profile;
    const now = Date.now();

    // 1. Daily Recap reminder (if Fading concepts exist and no session today)
    const fading = Array.from(this.engine.graph.nodes.values())
      .filter(c => c.retentionState === 'fading');
    const hasPracticedToday = profile.sessions.some(s =>
      new Date(s.completedAt).toDateString() === new Date().toDateString()
    );

    if (fading.length > 0 && !hasPracticedToday) {
      notifications.push({
        id: `recap_${now}`,
        type: 'daily_recap',
        tier: 'standard',
        priorityWeight: 10,
        title: 'Your Daily Recap is Ready',
        body: `${fading.length} concept${fading.length > 1 ? 's' : ''} need${fading.length > 1 ? '' : 's'} reinforcement. About ${Math.ceil(fading.length * 1.5)} minutes.`,
        action: 'start_recap'
      });
    }

    // 2. Streak maintenance (gentle, not anxious)
    const lastSession = profile.lastSessionAt;
    const daysSince = lastSession ? Math.floor((now - lastSession) / (24 * 60 * 60 * 1000)) : 99;
    const momentum = profile.streakData?.currentMomentum || 0;

    if (daysSince === 1 && momentum >= 3 && !hasPracticedToday) {
      notifications.push({
        id: `streak_${now}`,
        type: 'streak_gentle',
        tier: 'low',
        priorityWeight: 4,
        title: 'Your Rhythm is Building',
        body: "One session today keeps the pattern alive. No pressure — just when you're ready.",
        action: 'start_session'
      });
    }

    // 3. Exam proximity warning (6 weeks out)
    if (profile.examDate) {
      const weeksToExam = Math.ceil((profile.examDate - now) / (7 * 24 * 60 * 60 * 1000));
      if (weeksToExam === 6 && !this._wasNotified('exam_6weeks')) {
        notifications.push({
          id: `exam_6weeks_${now}`,
          type: 'exam_proximity',
          tier: 'standard',
          priorityWeight: 9,
          title: '6 Weeks to UTME',
          body: 'Kairo is shifting to exam-readiness mode. Your review intervals are now compressed.',
          action: 'view_plan'
        });
      }
      if (weeksToExam === 1 && !this._wasNotified('exam_1week')) {
        notifications.push({
          id: `exam_1week_${now}`,
          type: 'exam_proximity',
          tier: 'standard',
          priorityWeight: 9,
          title: 'One Week to Go',
          body: "You've done the work. Now it's about confidence and rest. I've prepared a light review.",
          action: 'start_peak_session'
        });
      }
    }

    // 4. Challenge completion — event-driven now (ChallengesModule
    // rewrite per the Challenges Module Spec: challenges are real
    // admin-curated events a student explicitly joins/finishes, not a
    // locally-polled personal-achievement catalog), so there is nothing
    // to poll for here anymore. A completion notification belongs at
    // the point ChallengesModule.finishChallenge() actually runs.

    // 5. Weekly reflection ready
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 && !hasPracticedToday && !this._wasNotified('weekly_reflection')) {
      notifications.push({
        id: `weekly_${now}`,
        type: 'weekly_reflection',
        tier: 'low',
        priorityWeight: 3,
        title: 'Your Week in Review',
        body: "Kai has prepared your weekly reflection. Take a moment to see how far you've come.",
        action: 'view_weekly'
      });
    }

    // 6. Recovery welcome (returning after gap)
    if (profile.macroState === 'recovering' && daysSince < 2) {
      notifications.push({
        id: `recovery_${now}`,
        type: 'recovery',
        tier: 'standard',
        priorityWeight: 8,
        title: 'Welcome Back',
        body: "I kept your place. We're starting light today — no need to make up for lost time.",
        action: 'start_recovery_session'
      });
    }

    return notifications.filter(n => !this._wasNotified(n.id));
  }

  _wasNotified(id) {
    return this.history.some(h => h.id === id || h.id.startsWith(id.split('_').slice(0, -1).join('_')));
  }

  /**
   * Call once NotificationPipeline has actually resolved+handed a
   * candidate to transport — records it so a one-time candidate type
   * (exam_6weeks, weekly_reflection) doesn't fire again.
   */
  markAsRead(notificationId) {
    this.history.push({ id: notificationId, readAt: Date.now() });
    this.engine.profile.notificationHistory = this.history;
  }

  getAll(limit = 50) {
    return this.history.slice(-limit).map(h => ({
      ...h,
      read: true
    }));
  }
}
