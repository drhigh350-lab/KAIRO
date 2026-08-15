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
import { conceptId } from "./utils/helpers.js";

// Practice Modes
import { RapidFireEngine } from "./practice/RapidFireEngine.js";
import { CustomPracticeEngine } from "./practice/CustomPracticeEngine.js";
import { TopicPracticeEngine } from "./practice/TopicPracticeEngine.js";

// Leaderboard
import { SegmentedLeaderboard, UniversityLeaderboard } from "./leaderboard/LeaderboardSystem.js";

// Progression
import { LevelSystem, BadgeSystem } from "./progression/ProgressionSystem.js";

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

  async init() {
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
    Object.assign(this.profile, remoteProfileFields);
    this.profile.authUserId = user.id;

    // profile.sessions has no column of its own on kairo.students (it lives
    // in the separate kairo.sessions table), so the Object.assign above
    // never touches it — without this, it silently reset to empty on every
    // single connect/reload, feeding wrong data into Today's Progress,
    // EliteScore's consistency component, Macro State, and Level/XP. A
    // failure here (e.g. offline) shouldn't block sign-in — same session
    // just stays empty until the next successful connect, same as before.
    try {
      this.profile.sessions = await adapter.fetchSessions(remoteProfile.studentId);
    } catch {
      // best-effort
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
      storedAt: Date.now()
    };
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
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return this._flattenQuestion(chosen);
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
  startSession({ mode = 'standard', plan: externalPlan = null } = {}) {
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
      prompted: false
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
  submitAnswer({ conceptId: cid, correct, responseTimeMs, selectedOption, correctOption, questionId, questionDifficulty, questionDistractorTags = [], questionType = 'single' }) {
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
      genuineConfidence: genuine
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
          difficulty: questionDifficulty
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

    const streakUpdate = this.streak.recordSession(this.currentSession.completedAt);
    const score = this.eliteScore.calculate(this.graph, this.profile.sessions);
    const levelUpdate = this.levelSystem.update(this.graph, this.profile.sessions);

    // Check badges
    const badgeContext = this._buildBadgeContext();
    const newBadges = this.badgeSystem.checkAndAward(badgeContext);

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

    await this.store.saveGraph(this.graph);
    this._snapshotSjeeState();
    await this.store.saveProfile(this.profile);
    await this.sync.sync();

    const result = {
      session: this.currentSession,
      eliteScore: score,
      streak: streakUpdate,
      macroState: this.profile.macroState,
      level: levelUpdate,
      newBadges
    };

    this.currentSession = null;
    this.recommendation = null;
    return result;
  }

  _buildBadgeContext() {
    const concepts = Array.from(this.graph.nodes.values());
    const sessions = this.profile.sessions;
    const recent = sessions.slice(-1)[0];

    return {
      reinforcedCount: concepts.filter(c => c.retentionState === 'reinforced').length,
      momentum: this.profile.streakData?.currentMomentum || 0,
      perfectSession: recent && recent.questionsAnswered >= 10 && recent.correctCount === recent.questionsAnswered,
      rapidFireAce: false, // set by RapidFireEngine
      recoverySession: this.profile.macroState === 'recovering',
      masteredTopics: 0, // calculate from graph
      masteredSubjects: 0,
      uniContribution: 0,
      nightSessions: sessions.filter(s => new Date(s.completedAt).getHours() >= 22).length,
      earlySessions: sessions.filter(s => new Date(s.completedAt).getHours() <= 7).length
    };
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
  startTopicPractice(subject, topic, subtopic, count) {
    const built = this.topicPractice.buildSubtopicSession(subject, topic, subtopic, count);
    const session = this.startSession({ mode: 'topic_practice', plan: built.queue });
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

  getBadges() {
    return {
      earned: this.badgeSystem.getEarned(),
      available: this.badgeSystem.getAvailable()
    };
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
