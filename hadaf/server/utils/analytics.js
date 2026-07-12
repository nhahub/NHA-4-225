/**
 * Pure aggregation helpers for the Analytics epic (Epic 6).
 * All functions operate on plain lean() documents / date strings so they can
 * be unit-tested without a database, matching the utils/ convention.
 *
 * Dates are logical YYYY-MM-DD strings throughout (same convention as
 * Task.date / DailySummary.date / HabitLog.date).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** Adds `days` (may be negative) to a YYYY-MM-DD string. */
exports.addDays = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return new Date(d.getTime() + days * DAY_MS).toISOString().split("T")[0];
};

/** Inclusive day count between two YYYY-MM-DD strings (from <= to). */
exports.daysBetweenInclusive = (fromStr, toStr) => {
  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T00:00:00.000Z`);
  return Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;
};

/**
 * Resolves the requested range, defaulting to the last 30 logical days.
 * Validation (format, from <= to, span cap) happens in the controller's zod
 * schema — this only fills defaults.
 *
 * @param {{from?: string, to?: string}} query
 * @param {string} todayStr logical today (YYYY-MM-DD)
 * @returns {{from: string, to: string}}
 */
exports.resolveRange = (query, todayStr) => {
  const to = query.to || todayStr;
  const from = query.from || exports.addDays(to, -29);
  return { from, to };
};

/**
 * Produces a dense day-by-day trend across [from, to], filling days that have
 * no DailySummary with zeros (dayState: null) so charts render gap-free.
 *
 * @param {Array} summaries lean DailySummary docs within range
 * @param {string} from YYYY-MM-DD
 * @param {string} to YYYY-MM-DD
 */
exports.fillDailyTrend = (summaries, from, to) => {
  const byDate = new Map(summaries.map((s) => [s.date, s]));
  const days = exports.daysBetweenInclusive(from, to);
  const trend = [];

  for (let i = 0; i < days; i++) {
    const date = exports.addDays(from, i);
    const s = byDate.get(date);
    trend.push({
      date,
      points: s ? s.pointsEarned || 0 : 0,
      tasksCompleted: s ? s.tasksCompleted || 0 : 0,
      habitsCompleted: s ? s.habitsCompleted || 0 : 0,
      dayState: s ? s.dayState || null : null,
    });
  }

  return trend;
};

/**
 * Buckets completed tasks into 24 hourly bins keyed by the local-time
 * timeBlockStart hour. Tasks completed without a time block are counted
 * separately (unscheduledCompleted) instead of being guessed from
 * completedAt (a UTC instant with no stored user timezone).
 *
 * @param {Array} completedTasks lean Task docs with status "completed"
 * @returns {{productiveHours: Array<{hour:number,tasksCompleted:number,minutes:number}>, unscheduledCompleted: number}}
 */
exports.bucketProductiveHours = (completedTasks) => {
  const bins = new Map();
  let unscheduledCompleted = 0;

  for (const task of completedTasks) {
    const start = task.timeBlockStart;
    if (!start || !/^\d{1,2}:\d{2}$/.test(start)) {
      unscheduledCompleted++;
      continue;
    }
    const hour = Number(start.split(":")[0]);
    const minutes = task.actualDurationMinutes ?? task.plannedDurationMinutes ?? 0;
    const bin = bins.get(hour) || { hour, tasksCompleted: 0, minutes: 0 };
    bin.tasksCompleted++;
    bin.minutes += minutes;
    bins.set(hour, bin);
  }

  const productiveHours = [...bins.values()].sort((a, b) => a.hour - b.hour);
  return { productiveHours, unscheduledCompleted };
};

/**
 * Aggregates a dense daily trend (from fillDailyTrend) into per-weekday
 * buckets. Zero days are included in daysCounted so avgPoints reflects the
 * real average for that weekday across the range.
 *
 * @param {Array<{date:string,points:number,tasksCompleted:number}>} trend
 * @returns {Array<{weekday:string,tasksCompleted:number,points:number,avgPoints:number,daysCounted:number}>}
 */
exports.bucketWeekdays = (trend) => {
  const buckets = new Map(
    WEEKDAY_NAMES.map((name) => [
      name,
      { weekday: name, tasksCompleted: 0, points: 0, avgPoints: 0, daysCounted: 0 },
    ])
  );

  for (const day of trend) {
    const weekday = WEEKDAY_NAMES[new Date(`${day.date}T00:00:00.000Z`).getUTCDay()];
    const bucket = buckets.get(weekday);
    bucket.tasksCompleted += day.tasksCompleted;
    bucket.points += day.points;
    bucket.daysCounted++;
  }

  for (const bucket of buckets.values()) {
    bucket.avgPoints = bucket.daysCounted
      ? Math.round((bucket.points / bucket.daysCounted) * 10) / 10
      : 0;
  }

  return WEEKDAY_NAMES.map((name) => buckets.get(name));
};

/**
 * Planned-vs-actual accuracy over completed tasks that carry both a positive
 * plannedDurationMinutes and a recorded actualDurationMinutes.
 * onTarget = actual within ±20% of planned.
 *
 * @param {Array} completedTasks lean Task docs
 * @returns {{sampleSize:number,plannedMinutes:number,actualMinutes:number,avgRatio:number|null,onTargetRate:number|null}}
 */
exports.computeAccuracy = (completedTasks) => {
  const sample = completedTasks.filter(
    (t) =>
      typeof t.plannedDurationMinutes === "number" &&
      t.plannedDurationMinutes > 0 &&
      typeof t.actualDurationMinutes === "number"
  );

  if (sample.length === 0) {
    return { sampleSize: 0, plannedMinutes: 0, actualMinutes: 0, avgRatio: null, onTargetRate: null };
  }

  let plannedMinutes = 0;
  let actualMinutes = 0;
  let ratioSum = 0;
  let onTarget = 0;

  for (const t of sample) {
    plannedMinutes += t.plannedDurationMinutes;
    actualMinutes += t.actualDurationMinutes;
    const ratio = t.actualDurationMinutes / t.plannedDurationMinutes;
    ratioSum += ratio;
    if (ratio >= 0.8 && ratio <= 1.2) onTarget++;
  }

  return {
    sampleSize: sample.length,
    plannedMinutes,
    actualMinutes,
    avgRatio: Math.round((ratioSum / sample.length) * 100) / 100,
    onTargetRate: Math.round((onTarget / sample.length) * 100) / 100,
  };
};

/**
 * Range totals from the dense trend: overall sums, active-day count and the
 * best (highest-points) day.
 *
 * @param {Array<{date:string,points:number,tasksCompleted:number,habitsCompleted:number}>} trend
 */
exports.computeTotals = (trend) => {
  const totals = {
    pointsEarned: 0,
    tasksCompleted: 0,
    habitsCompleted: 0,
    activeDays: 0,
    bestDay: null,
  };

  for (const day of trend) {
    totals.pointsEarned += day.points;
    totals.tasksCompleted += day.tasksCompleted;
    totals.habitsCompleted += day.habitsCompleted;
    if (day.points > 0) totals.activeDays++;
    if (day.points > 0 && (!totals.bestDay || day.points > totals.bestDay.points)) {
      totals.bestDay = { date: day.date, points: day.points };
    }
  }

  return totals;
};
