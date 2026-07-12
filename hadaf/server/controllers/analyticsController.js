const zod = require("zod");
const z = zod.z || zod;
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const Task = require("../models/Task");
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const DailySummary = require("../models/DailySummary");
const { resolveLogicalDate } = require("../utils/date");
const {
  resolveRange,
  fillDailyTrend,
  bucketProductiveHours,
  bucketWeekdays,
  computeAccuracy,
  computeTotals,
  daysBetweenInclusive,
} = require("../utils/analytics");
const {
  calculateDaysSinceRelapse,
  calculateCurrentStreak,
  calculateLongestStreak,
} = require("../utils/habit-streak");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 92; // one full 12-week cycle + slack

const rangeQuerySchema = z
  .object({
    from: z.string().regex(DATE_RE, "Invalid date format. Must be YYYY-MM-DD.").optional(),
    to: z.string().regex(DATE_RE, "Invalid date format. Must be YYYY-MM-DD.").optional(),
  })
  .refine((q) => !(q.from && q.to) || q.from <= q.to, {
    message: "from must be before or equal to to",
    path: ["from"],
  });

/**
 * Validates the query and resolves the effective range against the user's
 * logical "today". Sends the 400/404 itself and returns null on failure.
 */
async function resolveValidatedRange(req, res) {
  const validation = rangeQuerySchema.safeParse(req.query);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: validation.error.issues[0].message,
      field: validation.error.issues[0].path[0],
    });
    return null;
  }

  const user = await User.findById(req.user.id).select("settings.day_start").lean();
  if (!user) {
    res.status(404).json({ success: false, errorCode: "UNKNOWN", error: "errors.unauthorized" });
    return null;
  }

  const todayStr = resolveLogicalDate(new Date(), user.settings.day_start);
  const range = resolveRange(validation.data, todayStr);

  if (daysBetweenInclusive(range.from, range.to) > MAX_RANGE_DAYS) {
    res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: `Range too large. Maximum span is ${MAX_RANGE_DAYS} days.`,
      field: "from",
    });
    return null;
  }

  return range;
}

exports.getOverview = catchAsync(async (req, res) => {
  const range = await resolveValidatedRange(req, res);
  if (!range) return;
  const { from, to } = range;

  const [summaries, completedTasks] = await Promise.all([
    DailySummary.find({ userId: req.user.id, date: { $gte: from, $lte: to } }).lean(),
    Task.find({ userId: req.user.id, date: { $gte: from, $lte: to }, status: "completed" }).lean(),
  ]);

  const dailyTrend = fillDailyTrend(summaries, from, to);
  const totals = computeTotals(dailyTrend);
  // Completed tasks are authoritative for the task count (summaries may lag
  // on days where the roll-up never ran).
  totals.tasksCompleted = completedTasks.length;

  const { productiveHours, unscheduledCompleted } = bucketProductiveHours(completedTasks);

  res.status(200).json({
    success: true,
    data: {
      range: { from, to },
      totals,
      dailyTrend,
      productiveHours,
      unscheduledCompleted,
      weekdays: bucketWeekdays(dailyTrend),
      accuracy: computeAccuracy(completedTasks),
    },
  });
});

exports.getHabitsAnalytics = catchAsync(async (req, res) => {
  const range = await resolveValidatedRange(req, res);
  if (!range) return;
  const { from, to } = range;

  const user = await User.findById(req.user.id).select("settings.day_start").lean();
  const todayStr = resolveLogicalDate(new Date(), user.settings.day_start);
  const daysInRange = daysBetweenInclusive(from, to);

  const habits = await Habit.find({ userId: req.user.id, isArchived: { $ne: true } })
    .select("title category type frequency targetValue mvdValue mvdDescription createdAt")
    .lean();

  const logs = await HabitLog.find({
    habitId: { $in: habits.map((h) => h._id) },
    date: { $gte: from, $lte: to },
  }).lean();

  const logsByHabit = new Map();
  for (const log of logs) {
    const key = log.habitId.toString();
    if (!logsByHabit.has(key)) logsByHabit.set(key, []);
    logsByHabit.get(key).push(log);
  }

  const data = await Promise.all(
    habits.map(async (habit) => {
      const habitLogs = logsByHabit.get(habit._id.toString()) || [];

      // A "completed" day: a non-relapse log with a positive value.
      const completedDates = [
        ...new Set(habitLogs.filter((l) => !l.isRelapse && l.value > 0).map((l) => l.date)),
      ].sort();
      const relapses = habitLogs
        .filter((l) => l.isRelapse)
        .map((l) => l.date)
        .sort();

      const completedLogs = habitLogs.filter((l) => !l.isRelapse && l.value > 0);
      const mvdCount = completedLogs.filter((l) => l.isMvd).length;

      let daysSinceRelapse = null;
      if (habit.type === "quit") {
        // Most recent relapse overall (not range-clipped) — same read-time
        // pattern habitController.getHabits uses.
        const lastRelapse = await HabitLog.findOne({ habitId: habit._id, isRelapse: true })
          .sort({ date: -1 })
          .select("date")
          .lean();
        daysSinceRelapse = calculateDaysSinceRelapse(
          lastRelapse ? lastRelapse.date : null,
          habit.createdAt,
          todayStr
        );
      }

      return {
        habitId: habit._id,
        title: habit.title,
        type: habit.type,
        category: habit.category,
        mvdValue: habit.mvdValue,
        targetValue: habit.targetValue,
        daysInRange,
        daysLogged: completedDates.length,
        completionRate: Math.round((completedDates.length / daysInRange) * 100) / 100,
        mvdRate: completedLogs.length
          ? Math.round((mvdCount / completedLogs.length) * 100) / 100
          : 0,
        currentStreak: calculateCurrentStreak(completedDates, todayStr),
        longestStreak: calculateLongestStreak(completedDates),
        relapses,
        daysSinceRelapse,
      };
    })
  );

  res.status(200).json({ success: true, data: { range: { from, to }, habits: data } });
});
