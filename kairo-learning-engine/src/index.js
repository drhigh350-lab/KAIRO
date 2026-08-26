/**
 * Kairo Learning Engine — Main Entry Point
 * 
 * Usage:
 *   const kairo = new KairoEngine({ studentId, name, examDate });
 *   await kairo.init();
 *   const plan = kairo.startSession();
 *   const decision = kairo.submitAnswer({ conceptId, correct, ... });
 *   const kaiMessage = kairo.getKaiMessage(decision);
 */

import { StudentProfile } from "./student/StudentProfile.js";
import { KnowledgeGraph } from "./core/KnowledgeGraph.js";
import { ConceptNode } from "./core/ConceptNode.js";
import { DecayModel } from "./core/DecayModel.js";
import { RecommendationEngine } from "./engine/RecommendationEngine.js";
import { ErrorPatternClassifier } from "./engine/ErrorPatternClassifier.js";
import { EliteScore } from "./engine/EliteScore.js";
import { AdaptiveDifficulty } from "./engine/AdaptiveDifficulty.js";
import { KaiBehavior } from "./kai/KaiBehavior.js";
import { RevisionScheduler } from "./memory/RevisionScheduler.js";
import { MomentumStreak } from "./motivation/MomentumStreak.js";
import { EmotionalProfile } from "./student/EmotionalProfile.js";
import { LearningStateTracker } from "./student/LearningStateTracker.js";
import { JourneyStageTracker } from "./sjee/JourneyStageTracker.js";
import { NotificationOrchestrator } from "./sjee/NotificationOrchestrator.js";
import { ReEngagementEngine } from "./sjee/ReEngagementEngine.js";
import { CrossModuleMilestones } from "./sjee/CrossModuleMilestones.js";
import { ContinuationEngine } from "./sjee/ContinuationEngine.js";
import { CommsService } from "./comms/CommsService.js";
import { WeeklyReflection, MonthlyWrapped } from "./motivation/WeeklyReflection.js";
import { LocalStore, STORES } from "./data/LocalStore.js";
import { SyncManager } from "./sync/SyncManager.js";
import { conceptId, shuffleArray, isCalculationQuestion } from "./utils/helpers.js";
import { KairoPointsAwards, ReviewConstants } from "./utils/constants.js";

// Practice Modes
import { RapidFireEngine } from "./practice/RapidFireEngine.js";
import { CustomPracticeEngine } from "./practice/CustomPracticeEngine.js";
import { TopicPracticeEngine } from "./practice/TopicPracticeEngine.js";

// Leaderboard
import { SegmentedLeaderboard, UniversityLeaderboard } from "./leaderboard/LeaderboardSystem.js";

// Progression
import { LevelSystem, BadgeSystem } from "./progression/ProgressionSystem.js";
import { getPrestigeTier, PrestigeTiers } from "./progression/PrestigeLevels.js";

// Onboarding
import { OnboardingEngine } from "./onboarding/OnboardingEngine.js";

// Offline
import { ContentPackManager } from "./offline/ContentPackManager.js";

// Supabase
import { SupabaseSyncAdapter } from "./supabase/SupabaseSyncAdapter.js";
import { LearnModule } from "./learn/LearnModule.js";
import { ReviewModule } from "./review/ReviewModule.js";
import { CBTExamMode } from "./cbt/CBTExamMode.js";
import { ChallengesModule } from "./challenges/ChallengesModule.js";
import { InsightsModule } from "./insights/InsightsModule.js";
import { NotificationEngine } from "./notifications/NotificationEngine.js";
import { ProfileSettings } from "./profile/ProfileSettings.js";
import { AdminCMS } from "./admin/AdminCMS.js";
import { Question } from "./qim/Question.js";
import { QuestionRelationshipGraph } from "./qim/QuestionRelationshipGraph.js";
import { MisconceptionLibrary } from "./qim/MisconceptionLibrary.js";
import { ExplanationEngine } from "./qim/ExplanationEngine.js";
import { QuestionLifecycle } from "./qim/QuestionLifecycle.js";

export class KairoEngine {
  constructor({ studentId, name, examDate = null, targetSubjects = [], targetCourse = null, targetUniversity = null }) {
    this.profile = new StudentProfile({ studentId, name, examDate, targetSubjects, targetCourse, targetUniversity });
    this.graph = new KnowledgeGraph();
    this.decayModel = new DecayModel(this.profile);
    this.recommendation = null;
    this.classifier = new ErrorPatternClassifier(this.profile);
    this.eliteScore = new EliteScore(this.profile);
    this.difficulty = new AdaptiveDifficulty(this.profile);
    this.kai = new KaiBehavior(this.profile);
    this.scheduler = new RevisionScheduler(this.decayModel, examDate);
    this.streak = new MomentumStreak(this.profile);
    this.emotionalProfile = new EmotionalProfile(this.profile);
    this.learningState = new LearningStateTracker(this.profile);
    this.journeyStage = new JourneyStageTracker(this.profile);
    this.notificationOrchestrator = new NotificationOrchestrator(this.profile);
    this.reEngagement = new ReEngagementEngine(this.profile);
    this.crossModuleMilestones = new CrossModuleMilestones(this.profile);
    this.continuation = new ContinuationEngine(this.profile);
    this.comms = new CommsService(this.profile);
    this.store = new LocalStore();
    this.sync = new SyncManager(this.store);

    // Subsystems
    this.rapidFire = new RapidFireEngine(this);
    this.customPractice = new CustomPracticeEngine(this);
    this.topicPractice = new TopicPracticeEngine(this);
    this.segmentedLeaderboard = new SegmentedLeaderboard();
    this.universityLeaderboard = new UniversityLeaderboard();
    this.levelSystem = new LevelSystem(this.profile);
    this.badgeSystem = new BadgeSystem(this.profile);
    this.onboarding = new OnboardingEngine(this);
    this.learn = new LearnModule(this);
    this.review = new ReviewModule(this);
    this.cbt = new CBTExamMode(this);
    this.challenges = new ChallengesModule(this);
    this.insights = new InsightsModule(this);
    this.notifications = new NotificationEngine(this);
    this.settings = new ProfileSettings(this);
    this.questionGraph = new QuestionRelationshipGraph();
    this.misconceptions = MisconceptionLibrary.seedDefaults();
    this.explanations = new ExplanationEngine(this.kai, this.misconceptions);
    this.questionLifecycle = new QuestionLifecycle();
    this.contentPacks = new ContentPackManager(this.store);

    this.currentSession = null;
    this.sessionStartTime = null;

    // Spaced Sandbox protocol — questionId -> verifyAfter (ms), an explicit
    // "I Understand" acknowledgment that overrides the natural
    // answered_at-derived cooldown ReviewModule computes for every other
    // missed question. Not profile-bound (not part of _rebuildProfileBoundSubsystems),
    // not persisted locally — hydrated fresh from kairo.mistake_patches on
    // each connect, same as bookmarks.
    this.mistakePatches = new Map();

    // Hydration state — a caller gating access on auth/onboarding status
    // (e.g. a route guard) needs a safe thing to await: `ready` stays
    // false until init() has actually read IndexedDB, and _initPromise
    // memoizes init() so calling it from more than one place (app boot
    // + a guard, or two components mounting concurrently) never re-runs
    // the IndexedDB load concurrently or rebuilds subsystems mid-hydration.
    this.ready = false;
    this._initPromise = null;
  }

  /**
   * Every subsystem constructed with `this.profile` directly (not `this`,
   * the engine) captures a reference to that exact profile object — if
   * `this.profile` is later replaced wholesale without also rebuilding
   * these, they keep reading/writing the orphaned old profile forever.
   * ProfileSettings.deleteAllData() resets this.profile/this.graph but has
   * no reason to know the other ~18 subsystems below exist, let alone
   * reconstruct them one by one — it calls this instead.
   */
  _rebuildProfileBoundSubsystems() {
    this.decayModel = new DecayModel(this.profile);
    this.classifier = new ErrorPatternClassifier(this.profile);
    this.eliteScore = new EliteScore(this.profile);
    this.difficulty = new AdaptiveDifficulty(this.profile);
    this.kai = new KaiBehavior(this.profile);
    this.scheduler = new RevisionScheduler(this.decayModel, this.profile.examDate);
    this.streak = new MomentumStreak(this.profile);
    this.emotionalProfile = new EmotionalProfile(this.profile);
    this.learningState = new LearningStateTracker(this.profile);
    this.journeyStage = new JourneyStageTracker(this.profile);
    this.notificationOrchestrator = new NotificationOrchestrator(this.profile);
    this.reEngagement = new ReEngagementEngine(this.profile);
    this.crossModuleMilestones = new CrossModuleMilestones(this.profile);
    this.continuation = new ContinuationEngine(this.profile);
    this.comms = new CommsService(this.profile);
    this.levelSystem = new LevelSystem(this.profile);
    this.badgeSystem = new BadgeSystem(this.profile);
    this.settings = new ProfileSettings(this);
  }

  /**
   * Snapshot ReEngagementEngine, CrossModuleMilestones, and LearnModule
   * state onto the profile so it round-trips through
   * StudentProfile.toJSON() — these hold structured records that don't
   * fit the simple current-value mirroring pattern macroState/
   * learningState/journeyStage use, so they're snapshotted explicitly
   * before save rather than written on every internal state change.
   */
  _snapshotSjeeState() {
    this.profile.notificationOrchestrator = this.notificationOrchestrator.toJSON();
    this.profile.reEngagement = this.reEngagement.toJSON();
    this.profile.crossModuleMilestones = this.crossModuleMilestones.toJSON();
    this.profile.continuation = this.continuation.toJSON();
    this.profile.comms = this.comms.toJSON();
    this.profile.learn = this.learn.toJSON();
  }

  /**
   * Memoized — safe to call from multiple places (app boot, a route
   * guard, etc.) without re-reading IndexedDB or re-running hydration
   * concurrently. Every caller gating auth/onboarding-sensitive access
   * on engine state must await this before trusting this.ready or
   * reading this.profile/this.onboarding.
   */
  async init() {
    if (!this._initPromise) this._initPromise = this._doInit();
    return this._initPromise;
  }

  async _doInit() {
    await this.store.init();
    const savedProfile = await this.store.loadProfile(this.profile.studentId);
    if (savedProfile) {
      this.profile = StudentProfile.fromJSON(savedProfile);
      this.decayModel = new DecayModel(this.profile);
      this.classifier = new ErrorPatternClassifier(this.profile);
      this.eliteScore = new EliteScore(this.profile);
      this.difficulty = new AdaptiveDifficulty(this.profile);
      this.kai = new KaiBehavior(this.profile);
      this.scheduler = new RevisionScheduler(this.decayModel, this.profile.examDate);
      this.streak = new MomentumStreak(this.profile);
      this.emotionalProfile = new EmotionalProfile(this.profile);
      this.learningState = LearningStateTracker.fromJSON(this.profile);
      this.journeyStage = JourneyStageTracker.fromJSON(this.profile);
      this.notificationOrchestrator = NotificationOrchestrator.fromJSON(this.profile, savedProfile.notificationOrchestrator);
      this.reEngagement = ReEngagementEngine.fromJSON(this.profile, savedProfile.reEngagement);
      this.crossModuleMilestones = CrossModuleMilestones.fromJSON(this.profile, savedProfile.crossModuleMilestones);
      this.continuation = ContinuationEngine.fromJSON(this.profile, savedProfile.continuation);
      this.comms = CommsService.fromJSON(this.profile, savedProfile.comms);
      this.learn = LearnModule.fromJSON(this, savedProfile.learn);
      this.levelSystem = new LevelSystem(this.profile);
      this.badgeSystem = new BadgeSystem(this.profile);
      // engine.settings was the one subsystem this block never rebuilt —
      // ProfileSettings.preferences is computed once, at construction time,
      // from whatever profile existed then (the fresh default one built
      // above, before this block replaces it with the real saved one).
      // Without this, a returning student's saved preferences were
      // silently ignored by engine.settings.getPreferences() forever after
      // the first reload, even though they were correctly saved and loaded
      // onto this.profile.
      this.settings = new ProfileSettings(this);
    }

    const savedGraph = await this.store.loadGraph();
    if (savedGraph && savedGraph.nodes.length > 0) {
      this.graph = KnowledgeGraph.fromJSON(savedGraph);
      this.decayModel.refreshAll(this.graph);
    }

    // Anything queued for Supabase before the app closed/reloaded while
    // still offline — without this, those attempts/sessions/cbt_results
    // were silently lost forever (SyncManager.pendingSync is otherwise
    // memory-only).
    await this.sync.rehydrate();

    this.ready = true;
  }

  /**
   * Connect this engine to a real Supabase backend (kairo schema).
   * Kairo requires an account from first visit — call this with an
   * already-authenticated Supabase client (post sign-in/sign-up), or
   * pass email/password to sign in as part of this call.
   *
   * On success: this.profile is replaced with (or merged into) the
   * student's kairo.students row, and this.sync gains a working
   * remote so subsequent this.sync.sync() calls actually push/pull
   * instead of returning { status: 'offline' }.
   */
  async connectSupabase(supabaseClient, { email, password } = {}) {
    const adapter = new SupabaseSyncAdapter(supabaseClient, this.store);

    if (email && password) {
      await adapter.signIn(email, password).catch(async (err) => {
        // If sign-in fails because the account doesn't exist yet, the
        // caller should use signUp explicitly — we don't silently
        // create accounts here to avoid surprising auth side effects.
        throw err;
      });
    }

    const user = await adapter.getCurrentUser();
    if (!user) {
      throw new Error('connectSupabase requires a signed-in user — sign in first or pass email/password.');
    }

    const remoteProfile = await adapter.ensureStudentRow(user.id, this.profile.toJSON());

    // Hydrate the full remote profile onto this profile instance. Every
    // caller of connectSupabase() (sign-up, sign-in, restoreSession,
    // Google) starts from a brand-new StudentProfile with nothing local to
    // protect yet, so this previously only copying studentId/authUserId
    // over meant every other real field — name, targetSubjects,
    // targetCourse, targetUniversity, exam date, streak/elite-score
    // history, question totals — silently stayed at StudentProfile's
    // blank defaults after every single sign-in, no matter what was
    // actually saved server-side. That's what surfaced as "my progress is
    // gone" on sign-out/sign-in even though the row itself was intact.
    const { _isNewStudent, ...remoteProfileFields } = remoteProfile;

    // The one caller that ISN'T starting from a blank profile: restoreSession()
    // (a page reload of an already-signed-in student) calls init() before
    // this, which loads the real local profile from IndexedDB first. If a
    // session finished and saved locally (endSession()/finishCbtExam()/
    // finishRapidFire() now await that save — see their own comments) but
    // its Supabase push hasn't landed yet — still offline, or simply
    // hasn't had time to run — this device's local copy of the
    // gamification/progress cluster is the more current truth. Blindly
    // Object.assign-ing remote over it here would silently revert a
    // student's just-earned score/streak/progress back to the stale
    // server row on every single reload — the exact "streak/Kairo Score
    // resets on refresh" bug reported in production, and the reason those
    // saves being awaited elsewhere wasn't enough on its own to fix it.
    // Every other caller has local.lastSessionAt unset, so this guard
    // never blocks them from adopting a real remote history.
    const localIsFresher = (this.profile.lastSessionAt || 0) > (remoteProfileFields.lastSessionAt || 0);
    const preserveIfLocalFresher = localIsFresher ? {
      eliteScoreHistory: this.profile.eliteScoreHistory,
      streakData: this.profile.streakData,
      totalQuestionsAnswered: this.profile.totalQuestionsAnswered,
      totalCorrect: this.profile.totalCorrect,
      lastSessionAt: this.profile.lastSessionAt,
      macroState: this.profile.macroState,
      macroStateHistory: this.profile.macroStateHistory,
      badges: this.profile.badges,
      kairoPoints: this.profile.kairoPoints,
      kairoPointsProgress: this.profile.kairoPointsProgress,
      atRiskTriggeredAt: this.profile.atRiskTriggeredAt,
      recoverySessionCount: this.profile.recoverySessionCount
    } : null;

    Object.assign(this.profile, remoteProfileFields);
    if (preserveIfLocalFresher) Object.assign(this.profile, preserveIfLocalFresher);
    this.profile.authUserId = user.id;

    // profile.sessions has no column of its own on kairo.students (it lives
    // in the separate kairo.sessions table), so the Object.assign above
    // never touches it — without this, it silently reset to empty on every
    // single connect/reload, feeding wrong data into Today's Progress,
    // EliteScore's consistency component, Macro State, and Level/XP. A
    // failure here (e.g. offline) shouldn't block sign-in — same session
    // just stays empty until the next successful connect, same as before.
    //
    // Merged with whatever was already loaded locally (init() ran before
    // this and already hydrated this.profile.sessions from IndexedDB),
    // never blindly replaced by it: a session completed and durably saved
    // locally moments before this exact reload (endSession() awaits both
    // saveGraph()/saveProfile() before ever resolving) can genuinely still
    // be sitting in the pending-sync queue, not yet reflected in this
    // fetch — connectSupabase() runs before sync.sync() on every restore
    // path. Overwriting outright would make that just-completed session
    // silently vanish from Today's Progress/streak/Insights for this whole
    // page load, exactly the "cleared unexpectedly" failure mode the
    // offline-first contract exists to prevent. Union + dedupe by
    // sessionId, same pattern SyncManager._applyRemoteConceptStates()
    // already uses for attempts.
    try {
      const localSessions = this.profile.sessions || [];
      const remoteSessions = await adapter.fetchSessions(remoteProfile.studentId);
      const merged = new Map();
      for (const s of remoteSessions) merged.set(s.sessionId, s);
      for (const s of localSessions) if (!merged.has(s.sessionId)) merged.set(s.sessionId, s);
      this.profile.sessions = Array.from(merged.values()).sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));
    } catch {
      // best-effort — offline or a failed fetch leaves the local copy untouched, not emptied
    }

    // Every module below was constructed once, at engine-construction time,
    // against a blank profile — the Object.assign above overwrites
    // profile.journeyStage/reEngagement/crossModuleMilestones/continuation/
    // comms/notificationOrchestrator with the real remote values, but these
    // LIVE instances never re-read them on their own. Without this rebuild,
    // the very next _snapshotSjeeState() call a few lines down would
    // overwrite the just-fetched remote state with each instance's still-
    // blank in-memory defaults — silently resetting a student's saved
    // notification consent (including an active "Stop All Notifications"
    // hard-stop), win-back history, and awarded milestones on every single
    // sign-in or page-reload restore. journeyStage specifically also feeds
    // the very next startSession() call's compute(), which runs against
    // whatever this.journeyStage.currentStage says — leaving it stale at
    // 'arrival' would make that recomputation start from the wrong state.
    this.journeyStage = JourneyStageTracker.fromJSON(this.profile);
    this.reEngagement = ReEngagementEngine.fromJSON(this.profile, this.profile.reEngagement);
    this.crossModuleMilestones = CrossModuleMilestones.fromJSON(this.profile, this.profile.crossModuleMilestones);
    this.continuation = ContinuationEngine.fromJSON(this.profile, this.profile.continuation);
    this.comms = CommsService.fromJSON(this.profile, this.profile.comms);
    this.notificationOrchestrator = NotificationOrchestrator.fromJSON(this.profile, this.profile.notificationOrchestrator);
    this.learn = LearnModule.fromJSON(this, this.profile.learn);

    // The rest of this engine's profile-bound subsystems have the exact
    // same staleness problem as the six above, just not yet caught in
    // production: constructed once at engine-construction time against a
    // blank profile, and never rebuilt here even though Object.assign()
    // just replaced this.profile's score/streak/level/badge fields with
    // real remote values. Confirmed live: a genuinely fresh sign-in (a new
    // device, or any browser with no IndexedDB profile yet — the exact
    // path _doInit()'s own `if (savedProfile)` rebuild block never runs
    // for) left this.eliteScore/this.streak/this.levelSystem/this.settings
    // etc. silently reading their original construction-time snapshot —
    // Insights' score trend stuck on "insufficient_data" and Home's streak
    // flame/Profile's Level both showing stale defaults, even though
    // this.profile itself held the correct just-synced numbers the whole
    // time. Same fix _doInit() already applies when local data exists.
    this.decayModel = new DecayModel(this.profile);
    this.classifier = new ErrorPatternClassifier(this.profile);
    this.eliteScore = new EliteScore(this.profile);
    this.difficulty = new AdaptiveDifficulty(this.profile);
    this.kai = new KaiBehavior(this.profile);
    this.scheduler = new RevisionScheduler(this.decayModel, this.profile.examDate);
    this.streak = new MomentumStreak(this.profile);
    this.emotionalProfile = new EmotionalProfile(this.profile);
    this.learningState = LearningStateTracker.fromJSON(this.profile);
    this.levelSystem = new LevelSystem(this.profile);
    this.badgeSystem = new BadgeSystem(this.profile);
    this.settings = new ProfileSettings(this);

    this.sync.attachRemote(adapter, this);
    this._snapshotSjeeState();
    await this.store.saveProfile(this.profile);

    return { ...remoteProfile, isNewStudent: !!remoteProfile._isNewStudent };
  }

  /**
   * Pull the shared content catalog — kairo.concepts and live
   * kairo.questions — from Supabase into this engine. Until this runs,
   * this.graph/this.questionGraph only ever contain whatever a caller
   * added by hand, and every "which question do I show for concept X"
   * lookup (Practice, RapidFire, CBT) comes back empty even though the
   * question bank is fully seeded server-side.
   *
   * Concept/question IDs are taken verbatim from the row — kairo.concepts
   * IDs are already the canonical conceptId() hash computed at seed time,
   * so this never recomputes or collides with addConcept()'s own hashing.
   *
   * Also mirrors a flattened copy of every question into
   * ContentPackManager's local queue (the same store getOfflineQuestions()
   * reads from), so CBTExamMode.buildPaper() and any other
   * contentPacks.getOfflineQuestions() caller see real content without
   * needing a separate "download pack" step.
   */
  async loadContentCatalog({ subjects = null } = {}) {
    if (!this.sync.adapter) {
      throw new Error('loadContentCatalog requires connectSupabase() first.');
    }

    const subjectList = subjects && subjects.length > 0 ? subjects : this.profile.targetSubjects;
    const filters = subjectList && subjectList.length > 0 ? subjectList.map(subject => ({ subject })) : [{}];

    let conceptsLoaded = 0;
    let questionsLoaded = 0;

    for (const filter of filters) {
      const concepts = await this.sync.adapter.fetchConcepts(filter);
      for (const data of concepts) {
        if (this.graph.hasConcept(data.id)) continue;
        this.graph.addConcept(new ConceptNode(data));
        conceptsLoaded++;
      }

      const questions = await this.sync.adapter.fetchQuestions(filter);
      for (const data of questions) {
        if (!this.questionGraph.getQuestion(data.id)) {
          this.questionGraph.addQuestion(new Question(data));
          questionsLoaded++;
        }
        await this.store.put(STORES.QUEUE, this._flattenQuestion(data));
      }
    }

    this.questionGraph.autoBuildRelationships();

    return { conceptsLoaded, questionsLoaded };
  }

  /**
   * Canonical Question shape (.stem, .conceptsTested[]) -> the flat
   * .text/.conceptId consumer shape CBTExamMode and ContentPackManager's
   * offline queue expect. Keeps the field-name translation in one place
   * instead of duplicated across every consumer.
   */
  _flattenQuestion(q) {
    return {
      queueId: q.id,
      id: q.id,
      questionId: q.id,
      subject: q.subject,
      topic: q.topic,
      text: q.stem,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation,
      conceptId: q.conceptsTested?.[0]?.conceptId || null,
      difficulty: q.difficultyRating,
      imageUrl: q.imageUrl || null,
      storedAt: Date.now()
    };
  }

  /**
   * Spaced Sandbox protocol — when a specific question is next eligible for
   * retest. An explicit "I Understand" acknowledgment (this.mistakePatches)
   * always wins; absent one, a question whose most recent attempt on *that
   * exact question* was wrong gets the same minimum cooldown by default,
   * counted from the wrong answer itself — every mistake is covered, not
   * just ones a student has actively engaged with. Returns 0 (always ripe)
   * for a question that's never been attempted or was last answered correctly.
   */
  _questionCooldownUntil(questionId, concept) {
    let lastAttempt = null;
    for (const a of concept?.attemptHistory || []) {
      if (a.questionId === questionId && (!lastAttempt || a.timestamp > lastAttempt.timestamp)) lastAttempt = a;
    }
    if (!lastAttempt || lastAttempt.correct) return 0;
    const natural = lastAttempt.timestamp + ReviewConstants.MISTAKE_COOLDOWN_MS;
    const explicit = this.mistakePatches.get(questionId);
    // An "I Understand" ack from *before* this exact wrong attempt (a stale
    // patch left over from an earlier miss on the same question, already
    // retested and missed again since) must never let a brand-new mistake
    // skip its own cooldown — max() keeps whichever is genuinely later,
    // and an ack made *after* this attempt (the normal case) is naturally
    // later than `natural` anyway, so this never shortens a real ack either.
    return explicit != null ? Math.max(explicit, natural) : natural;
  }

  /**
   * Pick a live question that tests the given concept — the missing link
   * between a session plan (a list of concept IDs) and something a
   * consumer can actually render. Returns the flat consumer shape (see
   * _flattenQuestion) so callers get the same {text, options, conceptId, ...}
   * shape regardless of which mode requested it.
   */
  getQuestionForConcept(cid, { excludeIds = [], maxDifficulty = null, minDifficulty = null } = {}) {
    let candidates = this.questionGraph.getQuestionsForConcept(cid)
      .filter(q => !excludeIds.includes(q.id));
    // Never let a difficulty window produce an honest "no questions" when
    // real ones exist outside it — narrow the pool when it helps, fall
    // back to the full pool rather than returning nothing. Ceiling and
    // floor are applied as two independent narrowing passes (each with
    // its own fallback), not a single combined filter, so a floor with
    // nothing above it doesn't wipe out a ceiling that already found
    // real matches.
    if (maxDifficulty != null) {
      const easier = candidates.filter(q => q.difficultyRating <= maxDifficulty);
      if (easier.length > 0) candidates = easier;
    }
    if (minDifficulty != null) {
      const harder = candidates.filter(q => q.difficultyRating >= minDifficulty);
      if (harder.length > 0) candidates = harder;
    }
    if (candidates.length === 0) return null;

    // The real "unseen questions" pool: this student's own attemptHistory
    // for this concept, not just excludeIds (which only ever tracked
    // questions already picked within the *current* queue build). Without
    // this, a topic bank bigger than one session's worth of questions
    // still kept resurfacing the same handful every session, since nothing
    // remembered what had already been asked in a previous one. Falls back
    // to the full (now-difficulty-filtered) candidate pool only once every
    // question for this concept has genuinely been attempted before.
    const concept = this.graph.getConcept(cid);
    const attemptedIds = new Set((concept?.attemptHistory || []).map(a => a.questionId));
    const unseen = candidates.filter(q => !attemptedIds.has(q.id));
    let pool = unseen.length > 0 ? unseen : candidates;

    // Spaced Sandbox protocol: a question still cooling down from a recent
    // miss never gets handed back through ordinary recommendation/practice
    // selection either, not just the dedicated Smart Patch session — same
    // fallback-if-it-empties-the-pool philosophy as the difficulty window
    // above, so a concept with only one real question (which happens to be
    // cooling down) still gets *a* question rather than none at all.
    const now = Date.now();
    const ripe = pool.filter(q => this._questionCooldownUntil(q.id, concept) <= now);
    if (ripe.length > 0) pool = ripe;

    // Shuffle rather than a single Math.random() index pick — this pool
    // backs every 10-slot recommendation/practice queue, so it must be
    // randomized before selection, not just individually sampled from the
    // same static ordering (Map insertion order == DB fetch order) every
    // single call.
    const chosen = shuffleArray(pool)[0];
    return this._flattenQuestion(chosen);
  }

  /**
   * The Synthesis Injector: for a student ranked The Scholar or higher
   * (lifetime kairoPoints >= 2,500 — PrestigeTiers' own threshold, the same
   * rank Profile's badge reads), a strictly single-topic 10-question queue
   * gets exactly 2 slots (4 and 8, 1-indexed — index 3/7 here) replaced
   * with a real question from a DIFFERENT topic the student has already
   * mastered (Held/Reinforced). Deliberate context-switching friction: a
   * single-topic drill never demands the topic-to-topic jumps a real JAMB/
   * UTME paper does, so this is the one place that skill gets exercised.
   *
   * No-op below The Scholar, for anything other than a full 10-question
   * queue (slots 4/8 aren't meaningful at any other length), or when
   * there's no real mastered question outside this queue's own topic(s) to
   * draw from — `questions` is returned unchanged in every one of those
   * cases, never padded or shortened to force the shape.
   */
  injectSynthesisQuestions(questions, primaryConceptIds = []) {
    const SYNTHESIS_SLOTS = [3, 7]; // 0-indexed -> "slot 4 and slot 8"
    const SCHOLAR_TIER_INDEX = 2;
    if (questions.length !== 10) return questions;
    if (getPrestigeTier(this.profile.kairoPoints).tierIndex < SCHOLAR_TIER_INDEX) return questions;

    const primaryTopics = new Set(
      primaryConceptIds
        .map(id => this.graph.getConcept(id))
        .filter(Boolean)
        .map(c => `${c.subject}::${c.topic}`)
    );

    const masteredElsewhere = Array.from(this.graph.nodes.values()).filter(c =>
      (c.retentionState === 'held' || c.retentionState === 'reinforced') &&
      !primaryTopics.has(`${c.subject}::${c.topic}`)
    );
    if (masteredElsewhere.length === 0) return questions;

    const pool = shuffleArray(masteredElsewhere);
    const injected = questions.slice();
    const usedIds = new Set(questions.map(q => q.id));
    let poolIndex = 0;

    for (const slot of SYNTHESIS_SLOTS) {
      while (poolIndex < pool.length) {
        const concept = pool[poolIndex++];
        const q = this.getQuestionForConcept(concept.id, { excludeIds: Array.from(usedIds) });
        if (q) {
          injected[slot] = q;
          usedIds.add(q.id);
          break;
        }
      }
    }
    return injected;
  }

  /**
   * The Profile Insights "Launch Speed Drill" / "Launch Theory Drill" CTA:
   * a real, resolved session queue scoped to exactly one heuristic category
   * (see isCalculationQuestion() in utils/helpers.js) — not a generic
   * mixed/weak-areas session, since the whole point of the Theory vs.
   * Calculation Insight (and the Velocity Matrix's subject-specific "speed
   * drill") is to let a student drill the specific skill they're weaker
   * on. `subjects` defaults to every enrolled subject; the Velocity Matrix
   * CTA passes a single subject (e.g. ['Chemistry']) to scope the drill to
   * exactly the subject its own insight named. Returns
   * { questions, conceptIds } — conceptIds is the deduplicated list of
   * concepts backing those questions, for a caller to set as the real
   * session plan (see startSession()'s `plan` override) the same way
   * startCustomSession()/startTopicPracticeSession() already do.
   */
  buildHeuristicDrillQueue(category, limit = 10, subjects = null) {
    const enrolled = subjects && subjects.length > 0 ? subjects : this.profile.targetSubjects;
    const wantsCalculation = category === 'calculation';

    const candidates = Array.from(this.questionGraph.questions.values()).filter(q => {
      if (q.lifecycleState !== 'live') return false;
      if (enrolled && enrolled.length > 0 && !enrolled.includes(q.subject)) return false;
      return isCalculationQuestion(q.stem) === wantsCalculation;
    });

    const shuffled = shuffleArray(candidates).slice(0, limit);
    const questions = shuffled.map(q => this._flattenQuestion(q));
    const conceptIds = Array.from(new Set(questions.map(q => q.conceptId).filter(Boolean)));
    return { questions, conceptIds };
  }

  /**
   * Fetch one exact, specific question by ID — unlike getQuestionForConcept
   * (which picks any question that tests a concept), this is for Review's
   * Reflection Moment (Review Module §5.5), which must reconstruct the
   * *exact* original question a student answered, not a fresh one.
   * Returns null if that question's subject hasn't been loaded into
   * questionGraph yet via loadContentCatalog().
   */
  getQuestionById(questionId) {
    const q = this.questionGraph.getQuestion(questionId);
    return q ? this._flattenQuestion(q) : null;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONCEPT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  addConcept({ name, subject, topic, subtopic, difficultyWeight = 1.0, dependencies = [], questionPoolIds = [] }) {
    const id = conceptId(subject, topic, subtopic, name);
    if (this.graph.hasConcept(id)) return id;

    const depIds = dependencies.map(d =>
      typeof d === 'string' ? d : conceptId(d.subject, d.topic, d.subtopic, d.name)
    );

    const node = new ConceptNode({
      id, name, subject, topic, subtopic,
      difficultyWeight,
      dependencyIds: depIds,
      questionPoolIds
    });
    this.graph.addConcept(node);
    return id;
  }

  // ═══════════════════════════════════════════════════════════════
  // SESSION LIFECYCLE (Adaptive Engine)
  // ═══════════════════════════════════════════════════════════════

  /**
   * mode/plan let Custom Practice and Topic Practice drive a real, correctly-
   * tagged session through the same adaptive engine and the same sync path
   * as standard Practice — their own build*() methods only ever produced a
   * queue with nowhere to run it, so a session in either mode could never
   * actually be recorded or synced (mode always defaulted to 'standard').
   */
  startSession({ mode = 'standard', plan: externalPlan = null, isVerification = false } = {}) {
    this.profile.computeMacroState(this.graph);
    this.emotionalProfile.compute(this.graph);
    this.learningState.compute(this.graph);
    this.journeyStage.compute(this.graph);
    this.recommendation = new RecommendationEngine({
      knowledgeGraph: this.graph,
      studentProfile: this.profile,
      decayModel: this.decayModel,
      examDate: this.profile.examDate
    });
    // this.difficulty is a single instance that lives for the whole profile
    // (see _rebuildProfileBoundSubsystems()), not recreated per session —
    // its "temporary" pullback needs an explicit reset at session start or
    // it silently stays softened forever after the first fatigue detection.
    this.difficulty.resetSession();

    const plan = externalPlan || this.recommendation.buildSessionPlan();
    this.sessionStartTime = Date.now();
    this.currentSession = {
      sessionId: `sess_${Date.now()}`,
      mode, // overridden to 'recovery' by startRecoverySession(); matches kairo.sessions' mode CHECK constraint
      startedAt: this.sessionStartTime,
      plan,
      completed: [],
      questionsAnswered: 0,
      correctCount: 0,
      // JourneyStageTracker._hasActivated() (SJEE §4.7) requires "at least
      // one unprompted return" to leave Activation — this field was never
      // set on any session anywhere, so that check silently failed every
      // time (undefined !== false) and no student could ever reach
      // Establishment on behavior alone. No code path currently starts a
      // session *because of* a Kairo-sent notification (that delivery
      // pipeline isn't wired to a launch action yet), so every real
      // session today genuinely is unprompted — false is the honest
      // default, not a placeholder.
      prompted: false,
      // Set by the Study Planner's Verification CTA loop (a topic_practice
      // session under the hood — see startTopicPractice()) so endSession()
      // can apply the Kairo Points Tight Economy's VERIFICATION_SESSION
      // bonus. Deliberately not folded into `mode` itself: kairo.sessions'
      // mode CHECK constraint has no 'verification' value, and this is a
      // Kairo Points concern, not a session-analytics one.
      isVerification
    };

    const kaiOpen = this.kai.proactiveMessage('session_open');
    return {
      macroState: this.profile.macroState,
      queue: plan,
      kaiMessage: kaiOpen,
      sessionLengthCap: this.recommendation._sessionLengthCap()
    };
  }

  /**
   * A lightweight, non-committal preview of what startSession() would pick
   * as today's top-priority concept, and why — for surfaces like Home that
   * need to explain the day's recommendation before the student commits to
   * actually starting a session. Uses a throwaway RecommendationEngine so
   * nothing here touches this.currentSession or this.recommendation (a real
   * startSession() call still builds its own plan independently afterward).
   */
  getTodayFocus() {
    this.profile.computeMacroState(this.graph);
    const preview = new RecommendationEngine({
      knowledgeGraph: this.graph,
      studentProfile: this.profile,
      decayModel: this.decayModel,
      examDate: this.profile.examDate
    });
    const plan = preview.buildSessionPlan();
    const topConceptId = plan[0] || null;
    const concept = topConceptId ? this.graph.getConcept(topConceptId) : null;
    return {
      macroState: this.profile.macroState,
      conceptId: topConceptId,
      conceptName: concept?.name || null,
      subject: concept?.subject || null,
      topic: concept?.topic || null,
      reason: concept ? preview.explainTopPick(concept, this.profile.macroState, this.profile.examDate) : null
    };
  }

  /**
   * Pre-assembles several sessions' worth of the daily recommendation
   * queue while online — real, resolved Question objects already
   * attached (not just concept IDs), so a later "Start Session" for the
   * recommendation while offline never needs questionGraph/network at
   * all. Same throwaway-RecommendationEngine pattern as getTodayFocus():
   * never touches this.currentSession/this.recommendation, safe to call
   * whether or not a real session happens to be in progress.
   */
  async prefetchRecommendationQueues({ queueCount = 4, questionsPerQueue = 10 } = {}) {
    if (!this.ready) return { queued: 0 };
    this.profile.computeMacroState(this.graph);
    const preview = new RecommendationEngine({
      knowledgeGraph: this.graph,
      studentProfile: this.profile,
      decayModel: this.decayModel,
      examDate: this.profile.examDate
    });
    const ranked = preview.buildRankedQueue(queueCount * questionsPerQueue);

    const queues = [];
    for (let i = 0; i < queueCount; i++) {
      const slice = ranked.slice(i * questionsPerQueue, (i + 1) * questionsPerQueue);
      if (slice.length === 0) break;
      const questions = [];
      const seenIds = [];
      for (const conceptId of slice) {
        const q = this.getQuestionForConcept(conceptId, { excludeIds: seenIds });
        if (q) { questions.push(q); seenIds.push(q.id); }
      }
      if (questions.length === 0) continue; // nothing real resolvable for this chunk — don't cache an empty queue
      queues.push({
        queueId: `prefetch_${this.profile.studentId}_${Date.now()}_${i}`,
        conceptIds: slice,
        questions,
        builtAt: Date.now()
      });
    }

    // Replace whatever was cached before — a stale prefetch (built against
    // yesterday's retention states) is worse than none, since it could
    // resurface exactly the concepts a real session since then already
    // resolved (e.g. a Fading concept the student already reviewed).
    const existing = await this.store.getPrefetchedQueues();
    for (const q of existing) await this.store.deletePrefetchedQueue(q.queueId);
    for (const q of queues) await this.store.savePrefetchedQueue(q);

    return { queued: queues.length };
  }

  /**
   * Pop the oldest still-cached prefetched queue (the one built first is
   * the one whose retention-state snapshot is closest to going stale).
   * Returns null if nothing is cached — the caller's own online path is
   * the honest fallback, not a fabricated queue.
   */
  async popPrefetchedQueue() {
    const queues = await this.store.getPrefetchedQueues();
    if (!queues.length) return null;
    queues.sort((a, b) => a.builtAt - b.builtAt);
    const next = queues[0];
    await this.store.deletePrefetchedQueue(next.queueId);
    return next;
  }

  /**
   * Collects candidates from every SJEE/notification-producing module —
   * NotificationEngine's client heuristics (daily recap, streak, exam
   * proximity, weekly reflection, recovery welcome), ReEngagementEngine,
   * CrossModuleMilestones, ContinuationEngine's post-exam window — submits
   * them to the Orchestrator, and returns whatever survives arbitration.
   * Each of those modules was fully built and individually tested but
   * never actually invoked from anywhere in the running app; this is that
   * missing entrypoint. Call once per app open and once after a session
   * ends (callers are expected to render the result as an in-app banner;
   * no external transport — push/email/WhatsApp/SMS — exists yet, so
   * everything returned here is in-app-only regardless of the tier/
   * channel the Orchestrator assigned).
   *
   * Real, persisted consent (Notification Settings' "Stop All
   * Notifications") is the single source of truth for whether ANYTHING
   * gets delivered — mirrored onto the Orchestrator's own flag here since
   * nothing else keeps them in sync. Per-category toggles intentionally do
   * NOT gate this in-app path (Notification Settings' own copy is explicit
   * that turning a category off only stops external sends — "they'll
   * still show up inside Review when you open the app" — matching §13.1's
   * "in-app content is never gated the way external channels are").
   */
  runNotificationPulse() {
    this.notificationOrchestrator.setHardOptOut(this.comms.consent.hardStopActive);
    if (this.comms.consent.hardStopActive) return [];

    this.profile.computeMacroState(this.graph);
    const emotionalStates = this.emotionalProfile.compute(this.graph);

    const priorityToTier = { high: 'standard', medium: 'low', low: 'informational' };
    for (const n of this.notifications.checkNotifications()) {
      this.notificationOrchestrator.submit({
        type: n.type,
        tier: priorityToTier[n.priority] || 'informational',
        title: n.title,
        body: n.body,
        action: n.action,
        sourceId: n.id
      });
    }

    const reengageCandidate = this.reEngagement.generateCandidate(this.graph);
    if (reengageCandidate) this.notificationOrchestrator.submit(reengageCandidate);

    for (const m of this.crossModuleMilestones.check(this.graph, emotionalStates)) {
      this.notificationOrchestrator.submit({
        type: `milestone_${m.category}`,
        tier: 'informational',
        title: 'A milestone worth noting',
        body: m.framing,
        action: null
      });
    }

    const postExamCandidate = this.continuation.checkImmediateWindow();
    if (postExamCandidate) this.notificationOrchestrator.submit(postExamCandidate);

    return this.notificationOrchestrator.arbitrate(this.kai);
  }

  /**
   * Call when a delivered notification (from runNotificationPulse()) is
   * dismissed without leading to a session, or tapped through — feeds
   * §5.8's per-type suppression learning either way. For a candidate
   * sourced from NotificationEngine's own client heuristics (sourceId
   * set), also marks it read there so checkNotifications() stops
   * resurfacing the identical item once the student has actually seen it.
   */
  recordNotificationOutcome(candidate, outcome) {
    if (outcome === 'dismissed') this.notificationOrchestrator.recordDismissal(candidate.type);
    if (outcome === 'engaged') this.notificationOrchestrator.recordEngagement(candidate.type);
    if (candidate.sourceId) this.notifications.markAsRead(candidate.sourceId);
  }

  /**
   * The shared "record an attempt against the Learning Engine" primitive —
   * every module's spec (Practice, CBT, Learn, Review) says the same thing:
   * "does not run a separate intelligence layer, every write flows through
   * the Learning Engine." this.recommendation/this.currentSession are only
   * present for an adaptive Practice-style session (started via
   * startSession()); RapidFire and CBT Exam Mode manage their own queue and
   * call this directly with neither set, so both are optional here — only
   * the concept-state/attempt-recording work below is universal.
   */
  submitAnswer({ conceptId: cid, correct, responseTimeMs, selectedOption, correctOption, questionId, questionDifficulty, questionDistractorTags = [], questionType = 'single', answerChangeCount = 0, firstSelectedOption = null }) {
    const concept = this.graph.getConcept(cid);
    if (!concept) {
      throw new Error(`Concept ${cid} not found.`);
    }

    let errorTag = null;
    if (!correct) {
      // The real Question (with its own distractors[].tags, authored
      // per-option) is what actually powers misread_question/
      // misapplied_rule/partial_understanding — the caller-supplied
      // questionDistractorTags below was always [] in practice, since
      // nothing ever sent it. Falls back to the caller-supplied shape when
      // the question isn't resolvable (e.g. content not loaded yet), same
      // degrade-gracefully pattern as the explanation lookup further down.
      const questionObj = questionId ? this.questionGraph.getQuestion(questionId) : null;
      errorTag = this.classifier.classify({
        concept,
        selectedOption,
        correctOption,
        responseTimeMs,
        question: questionObj || {
          id: questionId,
          distractorTags: questionDistractorTags,
          difficulty: questionDifficulty,
          type: questionType
        }
      });
    } else {
      this.classifier.updateBaseline(concept, responseTimeMs);
    }

    const genuine = this.classifier.detectGaming(concept, correct, responseTimeMs);

    // selectedOption/correctOption were computed above for classification
    // but never actually carried into the persisted attempt — kairo.attempts
    // has had real selected_option/correct_option columns (and
    // SupabaseSyncAdapter._attemptToRow has mapped them) since the schema
    // was created, so every synced attempt has been writing null into both.
    // Recording them here is also what lets Review's Reflection Moment
    // (CBT Exam Mode Spec's Review Module §5.5) show a student their own
    // original answer later — there is no other place that answer is kept.
    // answerChangeCount/firstSelectedOption (Hesitation Penalty Insight):
    // how many times the student switched their selected option before
    // hitting Submit, and what their very first pick was — real
    // instrumentation from PracticeQuestion.tsx, not derived from anything
    // already recorded. wasFirstPickCorrect (derived here, not stored
    // separately) is what lets the insight report the specific "you
    // changed a right answer to a wrong one" count, not just an aggregate
    // accuracy comparison. Carried on `attempt` for local storage/Review's
    // "reconstruct the original answer" use, and separately on the object
    // handed to processAnswer() below so it lands on
    // concept.attemptHistory too (RecommendationEngine.processAnswer()
    // passes that object straight into concept.recordAttempt()) — that's
    // the read path InsightsModule.getHesitationPenalty() actually uses.
    // Deliberately NOT added to SupabaseSyncAdapter._attemptToRow(): no
    // matching columns exist on kairo.attempts yet, so this stays a
    // local-only (same-device) signal until that migration lands.
    const wasFirstPickCorrect = answerChangeCount > 0 && firstSelectedOption != null
      ? firstSelectedOption === correctOption
      : null;
    const attempt = {
      conceptId: cid,
      correct,
      responseTimeMs,
      timestamp: Date.now(),
      errorTag,
      questionId,
      selectedOption,
      correctOption,
      difficulty: questionDifficulty,
      genuineConfidence: genuine,
      answerChangeCount,
      wasFirstPickCorrect
    };

    this.store.logAttempt(attempt);
    this.sync.queue({ type: 'attempt', data: attempt });

    const decision = this.recommendation
      ? this.recommendation.processAnswer({
          conceptId: cid,
          correct,
          responseTimeMs,
          timestamp: attempt.timestamp,
          errorTag,
          questionId,
          selectedOption,
          correctOption,
          difficulty: questionDifficulty,
          answerChangeCount,
          wasFirstPickCorrect
        })
      : null;

    // RecommendationEngine's fatigue interrupt only ever flipped
    // profile._tempSoftening — a flag nothing reads. AdaptiveDifficulty
    // checks its own separate this.sessionSoftening, set only by its own
    // softenSession(), which nothing called. The two never actually talked
    // to each other, so a 'difficulty_pullback' decision had zero effect on
    // difficulty selection independent of how questions get fetched.
    if (decision?.action === 'difficulty_pullback') {
      this.difficulty.softenSession();
    }

    if (this.currentSession) {
      this.currentSession.questionsAnswered++;
      if (correct) this.currentSession.correctCount++;
      this.currentSession.completed.push(attempt);
    }

    const isMilestone = concept.retentionState === 'reinforced' &&
      concept.attemptHistory.filter(a => a.correct).length >= 2;

    const kaiResponse = this.kai.respondToAnswer({
      result: { correct, errorTag, conceptName: concept.name, responseTimeMs },
      conceptState: concept.retentionState,
      macroState: this.profile.macroState,
      isMilestone
    });

    const nextDifficulty = decision?.nextConceptId
      ? this.difficulty.selectDifficulty(
          this.graph.getConcept(decision.nextConceptId),
          this.profile.macroState
        )
      : null;

    const endCheck = this.recommendation
      ? this.recommendation.shouldEndSession()
      : { end: false, reason: null };

    // The same ExplanationEngine LearnModule already uses (Question
    // Experience spec's "same trusted explanation structure everywhere") —
    // Practice was the one mode still building its own flat question.why
    // text instead of the real distractor breakdown / misconception
    // diagnosis / exam tip this.explanations already knows how to produce.
    // Looked up from questionGraph rather than trusting a caller-passed
    // shape, so it's a real Question instance with getDistractorExplanation()
    // available, not the flattened object the UI works with. Never allowed
    // to break answer submission — a missing/unloaded question degrades to
    // no explanation, not a thrown error.
    let explanation = null;
    if (questionId) {
      try {
        const questionObj = this.questionGraph.getQuestion(questionId);
        if (questionObj) {
          explanation = this.explanations.generate({
            question: questionObj,
            attempt,
            concept,
            macroState: this.profile.macroState
          });
        }
      } catch {
        explanation = null;
      }
    }

    return {
      decision,
      kaiResponse,
      nextDifficulty,
      shouldEnd: endCheck.end,
      endReason: endCheck.reason,
      conceptState: concept.retentionState,
      confidenceScore: concept.confidenceScore,
      decayEstimate: concept.decayEstimate,
      genuineConfidence: genuine,
      attempt,
      explanation
    };
  }

  async endSession() {
    if (!this.currentSession) return null;

    this.currentSession.completedAt = Date.now();
    this.profile.recordSession(this.currentSession);

    // Streak growth is restricted to the daily recommendation session
    // (mode 'standard' — the zero-input suggested/anchored queue built by
    // startSession(), distinct from 'custom_practice'/'topic_practice'/
    // 'rapid_fire'/'cbt_exam'/'recovery'). Practising a specific weak
    // topic or a custom set is real, valuable work, but the streak is
    // meant to reward showing up for what Kairo actually recommended
    // that day, not any session. MomentumStreak.recordSession() already
    // computes momentum from unique *days* in the window, so a second
    // recommendation completed the same day is naturally a no-op, not
    // something this gate needs to track separately.
    const streakUpdate = this.currentSession.mode === 'standard'
      ? this.streak.recordSession(this.currentSession.completedAt)
      : null;

    // Captured before calculate() pushes this session's fresh snapshot —
    // the real, honest pre-session total the display delta below is
    // measured against.
    const previousTotal = this.eliteScore.history.length > 0
      ? this.eliteScore.history[this.eliteScore.history.length - 1].total
      : 0;
    const score = this.eliteScore.calculate(this.graph, this.profile.sessions);
    // 'standard' is the daily recommendation (see the streak comment
    // above). Kairo Score itself never receives a flat bonus — it stays
    // pure and untouched (see EliteScore.js); every bonus lives on Kairo
    // Points instead.
    const sessionType = this.currentSession.mode === 'standard' ? 'recommendation' : 'standard';
    const scoreDelta = EliteScore.computeSessionDelta(previousTotal, score.total, sessionType);
    // Kairo Points Tight Economy: a flat, capped session-type bonus, never
    // stacked with anything else — the daily recommendation and a Study
    // Planner verification session each earn one, everything else (custom
    // practice, plain topic practice, rapid fire, recovery) earns 0 bonus
    // and only the +2-per-correct-answer base below.
    const pointsBonus = sessionType === 'recommendation'
      ? KairoPointsAwards.RECOMMENDATION_SESSION
      : this.currentSession.isVerification
        ? KairoPointsAwards.VERIFICATION_SESSION
        : 0;
    const levelUpdate = this.levelSystem.update(this.currentSession.correctCount, pointsBonus);

    // Badge Vault: recomputed from real graph/profile state every session
    // end, same spirit as EliteScore.calculate() — never a hand-tracked
    // context object (see BadgeSystem's own doc comment).
    const newBadges = this.badgeSystem.checkAndAward(this.graph);

    // Update leaderboards
    this.segmentedLeaderboard.addStudent(this.profile);
    this.universityLeaderboard.recordPractice(this.profile, score.total);

    const touched = [...new Set(this.currentSession.completed.map(a => a.conceptId))];
    this.scheduler.scheduleNextReviews(this.graph, touched);

    // kairo.sessions has carried a full row shape for this since the schema
    // was created (pushSession() below), but nothing ever queued a session
    // for it — Practice's single largest write-traffic source (per the
    // Practice Module spec) was silently never reaching Supabase.
    this.sync.queue({
      type: 'session',
      data: {
        id: this.currentSession.sessionId,
        mode: this.currentSession.mode || 'standard',
        plan: this.currentSession.plan,
        questionsAnswered: this.currentSession.questionsAnswered,
        correctCount: this.currentSession.correctCount,
        eliteScore: score,
        startedAt: this.currentSession.startedAt,
        completedAt: this.currentSession.completedAt
      }
    });

    // The IndexedDB writes are awaited — the score/streak/badges/progress
    // this method is about to return are about to be shown to the student
    // as real and final (the summary screen, the Home flame, "Today's
    // Progress"), so they must actually be durable before this resolves.
    // Previously both the local save AND the Supabase push sat in one
    // detached (never-awaited) tail: a refresh, tab close, or backgrounded
    // browser in the second or two right after a session ended — exactly
    // when a student is most likely to look away or reload — could win the
    // race against that tail and leave *neither* copy updated. On the next
    // load, init() reads the stale local profile and connectSupabase()
    // then overwrites it with the equally stale Supabase row, so the
    // student's just-earned score/streak/progress silently vanishes back
    // to whatever was last durably saved — reproduced against a real
    // report: a streak that lit up and showed "1 day" right after a
    // session reset to 0 on reload, and a Kairo Score shown as "+40" on
    // the summary screen never actually moved the total by anywhere near
    // that much.
    await this.store.saveGraph(this.graph);
    this._snapshotSjeeState();
    await this.store.saveProfile(this.profile);

    // Only the network half stays detached — a real Supabase round trip
    // that shouldn't hold up the summary screen from rendering a number
    // it already has durably saved locally. SyncManager's own durable
    // pending-sync queue (queued above via this.sync.queue(), rehydrated
    // on next boot) covers retrying this specific half if it fails or
    // never gets the chance to run at all.
    this.sync.sync().catch(() => {
      // Best-effort — a failure here doesn't undo the session or its
      // score, which are already safely on disk via the awaited saves above.
    });

    const result = {
      session: this.currentSession,
      eliteScore: score,
      scoreDelta,
      streak: streakUpdate,
      macroState: this.profile.macroState,
      level: levelUpdate,
      newBadges
    };

    this.currentSession = null;
    this.recommendation = null;
    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  // PRACTICE MODES
  // ═══════════════════════════════════════════════════════════════

  startRapidFire(options = {}) {
    this.rapidFire = new RapidFireEngine(this, options);
    return this.rapidFire.start();
  }

  submitRapidFireAnswer(answer) {
    return this.rapidFire.submitAnswer(answer);
  }

  finishRapidFire() {
    return this.rapidFire.finish();
  }

  buildCustomPractice(options) {
    return this.customPractice.buildSession(options);
  }

  /**
   * buildCustomPractice() only ever produced a plan preview with nowhere to
   * run it — startSession() always built its own adaptive plan and always
   * tagged mode: 'standard', so a Custom Practice session could never
   * actually be recorded or synced with the mode the schema reserves for it.
   * This runs the plan through the real adaptive session lifecycle instead.
   */
  startCustomPractice(options) {
    const built = this.customPractice.buildSession(options);
    const session = this.startSession({ mode: 'custom_practice', plan: built.queue });
    return { ...session, ...built };
  }

  getTopicJourney(subject, topic) {
    return this.topicPractice.getTopicJourney(subject, topic);
  }

  buildTopicSession(subject, topic, subtopic, count) {
    return this.topicPractice.buildSubtopicSession(subject, topic, subtopic, count);
  }

  /** Same fix as startCustomPractice(), for Topic Practice's subtopic sessions. */
  startTopicPractice(subject, topic, subtopic, count, { isVerification = false } = {}) {
    const built = this.topicPractice.buildSubtopicSession(subject, topic, subtopic, count);
    const session = this.startSession({ mode: 'topic_practice', plan: built.queue, isVerification });
    return { ...session, ...built };
  }

  // ═══════════════════════════════════════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════════════════════════════════════

  getMyLeaderboard(limit = 20) {
    return this.segmentedLeaderboard.getLeaderboard(this.profile, limit);
  }

  getUniversityRankings(limit = 20) {
    return this.universityLeaderboard.getRankings(limit);
  }

  // ═══════════════════════════════════════════════════════════════
  // PROGRESSION
  // ═══════════════════════════════════════════════════════════════

  getLevelProgress() {
    return this.levelSystem.getProgress();
  }

  /** Prestige tier (Batch 1) — a coarser, slower-moving status band derived from the same lifetime kairoPoints LevelSystem reads, never blended with Level. */
  getPrestigeProgress() {
    return getPrestigeTier(this.profile.kairoPoints);
  }

  /** Backward-compatible {earned, available} shape — see BadgeSystem.getEarned/getAvailable's own doc comments. */
  getBadges() {
    return {
      earned: this.badgeSystem.getEarned(this.graph),
      available: this.badgeSystem.getAvailable(this.graph)
    };
  }

  /** Full Badge Vault (Batch 2) — every track's current tier, achieved-at date, and next-tier challenge framing, for the Vault bottom sheet. */
  getBadgeVault() {
    return this.badgeSystem.getVault(this.graph);
  }

  /** Up to 4 badge icons (3 universal tracks + the single strongest subject track) for the compact Profile summary row. */
  getDisplayBadges() {
    return this.badgeSystem.getDisplayBadges(this.graph);
  }

  // ═══════════════════════════════════════════════════════════════
  // ONBOARDING
  // ═══════════════════════════════════════════════════════════════

  startOnboarding() {
    return this.onboarding.getNextStep();
  }

  submitOnboardingStep(input) {
    return this.onboarding.submitStep(input);
  }

  async completeOnboarding() {
    return await this.onboarding.buildInitialPlan();
  }

  // ═══════════════════════════════════════════════════════════════
  // INSIGHTS & MOTIVATION
  // ═══════════════════════════════════════════════════════════════

  getWeeklyReflection() {
    const ref = new WeeklyReflection(this.profile, this.graph);
    const data = ref.generate();
    const kaiNote = this.kai.generateWeeklyReflection(data);
    return { data, kaiNote };
  }

  getMonthlyWrapped() {
    const wrapped = new MonthlyWrapped(this.profile, this.graph);
    return wrapped.generate();
  }

  getStreakStatus() {
    return this.streak.getStatus();
  }

  getEliteScoreTrend() {
    return this.eliteScore.getTrend();
  }

  // ═══════════════════════════════════════════════════════════════
  // RECOVERY
  // ═══════════════════════════════════════════════════════════════

  async startRecoverySession() {
    this.profile.computeMacroState(this.graph);
    this.emotionalProfile.compute(this.graph);
    this.learningState.compute(this.graph);
    this.journeyStage.compute(this.graph);
    this.profile.macroState = 'recovering';
    this.profile.recoverySessionCount = 0;

    const welcome = this.kai.proactiveMessage('recovery_welcome');
    const plan = this.startSession();
    this.currentSession.mode = 'recovery';
    plan.kaiMessage = welcome;
    plan.isRecovery = true;
    return plan;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  getConceptStatus(cid) {
    const c = this.graph.getConcept(cid);
    if (!c) return null;
    return {
      name: c.name,
      state: c.retentionState,
      confidence: c.confidenceScore,
      decay: c.decayEstimate,
      nextReview: c.nextReviewEstimate,
      historyLength: c.attemptHistory.length
    };
  }

  getAllConcepts(filter = {}) {
    return this.graph.filter(filter).map(c => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      topic: c.topic,
      subtopic: c.subtopic,
      state: c.retentionState,
      confidence: c.confidenceScore
    }));
  }

  /**
   * Real topics the student has actually attempted, ranked by genuine
   * failure rate (incorrect / total attempts across every concept in
   * that topic) — the data "Boost Weak Areas" selects from, replacing a
   * single session that silently mixed every failed concept from every
   * topic together. A topic with zero attempts never appears (no
   * fabricated weakness from a topic never seen), so the list can
   * legitimately be empty for a brand-new student.
   */
  getWeakTopics({ subject = null, limit = 5 } = {}) {
    const concepts = Array.from(this.graph.nodes.values())
      .filter(c => !subject || c.subject === subject);

    const byTopic = new Map();
    for (const c of concepts) {
      const key = `${c.subject}::${c.topic}`;
      if (!byTopic.has(key)) byTopic.set(key, { subject: c.subject, topic: c.topic, concepts: [] });
      byTopic.get(key).concepts.push(c);
    }

    const ranked = Array.from(byTopic.values())
      .map(t => {
        const totalAttempts = t.concepts.reduce((s, c) => s + c.attemptHistory.length, 0);
        const incorrectAttempts = t.concepts.reduce(
          (s, c) => s + c.attemptHistory.filter(a => !a.correct).length, 0
        );
        return {
          subject: t.subject,
          topic: t.topic,
          conceptCount: t.concepts.length,
          totalAttempts,
          incorrectAttempts,
          failureRate: totalAttempts > 0 ? incorrectAttempts / totalAttempts : 0
        };
      })
      .filter(t => t.totalAttempts > 0 && t.incorrectAttempts > 0);

    ranked.sort((a, b) => b.failureRate - a.failureRate || b.incorrectAttempts - a.incorrectAttempts);
    return ranked.slice(0, limit);
  }

  /**
   * Review's Weak Topics context-aware CTA — the same regex heuristic
   * buildHeuristicDrillQueue() already uses to tell a calculation question
   * from a theory one, majority-voted across every live question actually
   * seeded for this topic. Defaults to 'theory' for a topic with no live
   * questions loaded yet rather than claiming a false split.
   */
  classifyTopicCategory(subject, topic) {
    const questions = Array.from(this.questionGraph.questions.values())
      .filter(q => q.subject === subject && q.topic === topic && q.lifecycleState === 'live');
    if (questions.length === 0) return 'theory';
    const calcCount = questions.filter(q => isCalculationQuestion(q.stem)).length;
    return calcCount / questions.length >= 0.4 ? 'calculation' : 'theory';
  }

  // ═══════════════════════════════════════════════════════════════
  // SPACED SANDBOX — Review Tab's mistake retest cooldown (Batch 2)
  // ═══════════════════════════════════════════════════════════════

  /** In-memory only — the caller (kairo-app) persists the real row to kairo.mistake_patches and calls this afterward to keep live question selection in sync without a full resync. */
  setMistakePatch(questionId, verifyAfterMs) {
    this.mistakePatches.set(questionId, verifyAfterMs);
  }

  /** Batch 1's Hero Metric — Fading concepts + ripe (cooldown-elapsed) mistakes. */
  getPendingRepairsCount() {
    return this.review.getPendingRepairsCount();
  }

  /** Batch 1's Smart Patch — question ids for every ripe repair, ready to hand straight to a CBT-style session builder. */
  buildSmartPatchQuestionIds(limit = 20) {
    return this.review.buildSmartPatchQuestionIds(limit);
  }

  /** Batch 2's Triage Inbox — full ledger entries for mistakes still cooling down (missed in the last 72h, not yet acknowledged). */
  getRecentMistakes(limit = 20) {
    return this.review.getRecentMistakes(limit);
  }

  exportState() {
    return {
      profile: this.profile.toJSON(),
      graph: this.graph.toJSON()
    };
  }

  async importState(state) {
    if (state.profile) {
      this.profile = StudentProfile.fromJSON(state.profile);
    }
    if (state.graph) {
      this.graph = KnowledgeGraph.fromJSON(state.graph);
    }
    await this.store.saveGraph(this.graph);
    this._snapshotSjeeState();
    await this.store.saveProfile(this.profile);
  }
}

// Export all subsystems for advanced usage
export {
  StudentProfile,
  KnowledgeGraph,
  ConceptNode,
  DecayModel,
  RecommendationEngine,
  ErrorPatternClassifier,
  EliteScore,
  AdaptiveDifficulty,
  KaiBehavior,
  RevisionScheduler,
  MomentumStreak,
  WeeklyReflection,
  MonthlyWrapped,
  LocalStore,
  SyncManager,
  RapidFireEngine,
  CustomPracticeEngine,
  TopicPracticeEngine,
  SegmentedLeaderboard,
  UniversityLeaderboard,
  LevelSystem,
  BadgeSystem,
  getPrestigeTier,
  PrestigeTiers,
  OnboardingEngine,
  ContentPackManager,
  SupabaseSyncAdapter,
  LearnModule,
  ReviewModule,
  CBTExamMode,
  ChallengesModule,
  InsightsModule,
  NotificationEngine,
  ProfileSettings,
  AdminCMS,
  Question,
  QuestionRelationshipGraph,
  MisconceptionLibrary,
  ExplanationEngine,
  QuestionLifecycle
};
