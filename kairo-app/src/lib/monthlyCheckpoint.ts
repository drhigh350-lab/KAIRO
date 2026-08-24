// Batch 6's Monthly Checkpoint — pure date logic, no DOM/storage/fetch.
// Unlocks only on the real last day of the current calendar month.

function lastDayOfMonth(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** True only on the actual last calendar day of the month, in the caller's local time. */
export function isMonthlyCheckpointUnlocked(now: Date = new Date()): boolean {
  return now.getDate() === lastDayOfMonth(now);
}

/** Days remaining until the month's last day (0 on that day itself), for the locked-state copy. */
export function daysUntilMonthlyCheckpoint(now: Date = new Date()): number {
  return lastDayOfMonth(now) - now.getDate();
}
