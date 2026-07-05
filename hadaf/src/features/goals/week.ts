const TWELVE_WEEKS = 12;

export function currentWeekIndex(
  start: Date,
  end: Date,
  now: Date = new Date(),
): number {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const nowMs = now.getTime();

  if (nowMs < startMs) return 1;
  if (nowMs >= endMs) return TWELVE_WEEKS;

  const elapsedDays = (nowMs - startMs) / 86_400_000;
  const raw = Math.floor(elapsedDays / 7) + 1;
  return Math.min(Math.max(raw, 1), TWELVE_WEEKS);
}

export function cycleProgressPercent(
  start: Date,
  end: Date,
  now: Date = new Date(),
): number {
  const totalMs = end.getTime() - start.getTime();
  if (totalMs <= 0) return 0;
  const elapsedMs = now.getTime() - start.getTime();
  const ratio = Math.min(Math.max(elapsedMs / totalMs, 0), 1);
  return Math.round(ratio * 100);
}