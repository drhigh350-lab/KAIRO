-- NotificationOrchestrator (Student Journey & Engagement Engine §5) had no
-- toJSON()/fromJSON() persistence at all, so its frequency budget
-- (deliveryLog), per-type suppression learning (typeSuppressionScores),
-- and hard opt-out flag all silently reset to empty on every reload —
-- breaking §5.6's "at most one Standard push per day" the moment a
-- student refreshed mid-day. This column is the same jsonb-snapshot
-- pattern already used for re_engagement/cross_module_milestones/
-- continuation/comms.

alter table kairo.students
  add column if not exists notification_orchestrator jsonb;
