// Batch 2's Time-Locked Engine — pure date logic, no DOM/storage/fetch.
// The Weekly Drop only reveals on Sunday: a running/live number would
// defeat the point of a weekly reveal (and would just repeat whatever the
// Actionable Insights carousel already shows in real time). The
// underlying data (InsightsModule.getWeeklyDrop()) is always computed
// regardless — this only gates whether it's actually shown.

/** True only on a real Sunday, in the caller's local time. */
export function isWeeklyDropUnlocked(now: Date = new Date()): boolean {
  return now.getDay() === 0;
}

/** Days remaining until the next Sunday (0 on a Sunday itself), for the locked-state copy. */
export function daysUntilNextDrop(now: Date = new Date()): number {
  return (7 - now.getDay()) % 7;
}
