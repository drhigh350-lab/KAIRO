-- Streak Freeze (KAIRO V1 Engine & UX Upgrade, Batch 2) — a discrete,
-- earned/spent resource distinct from the automatic PROTECTED_GAP_DAYS
-- grace MomentumStreak already had. One is earned the moment onboarding
-- completes (OnboardingEngine.buildInitialPlan()); capacity never exceeds
-- StreakConstants.FREEZE_CAPACITY (2). Purely additive columns, same
-- pattern as the other streak_* columns already on this table.

alter table kairo.students
  add column if not exists streak_freezes_available integer not null default 0,
  add column if not exists streak_freezes_used integer not null default 0;
