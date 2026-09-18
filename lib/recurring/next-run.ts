export type RecurringFrequency = "weekly" | "monthly";

/**
 * Advances a YYYY-MM-DD date string by one occurrence of the given
 * frequency. Pure date-string math in UTC so it's never off by an hour
 * around a DST boundary. "monthly" clamps to the last day of the target
 * month when the start date doesn't exist there (e.g. Jan 31 -> Feb 28).
 */
export function nextRunDate(current: string, frequency: RecurringFrequency): string {
  const [year, month, day] = current.split("-").map(Number);

  if (frequency === "weekly") {
    const d = new Date(Date.UTC(year, month - 1, day + 7));
    return toDateString(d);
  }

  // monthly
  const targetMonthIndex = month - 1 + 1; // zero-based month, +1 month
  const daysInTargetMonth = new Date(
    Date.UTC(year, targetMonthIndex + 1, 0)
  ).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);
  const d = new Date(Date.UTC(year, targetMonthIndex, clampedDay));
  return toDateString(d);
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** True if `dateStr` (YYYY-MM-DD) is today or earlier, compared in UTC. */
export function isDueByUTC(dateStr: string, now: Date = new Date()): boolean {
  const todayUTC = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  );
  return dateStr <= todayUTC;
}
