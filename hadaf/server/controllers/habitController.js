const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const catchAsync = require("../utils/catchAsync");

exports.createHabit = catchAsync(async (req, res) => {
  const validation = Habit.createHabitSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const habitData = { ...validation.data, userId: req.user.id };
  const habit = await Habit.create(habitData);
  const projectedHabit = await Habit.findById(habit._id)
    .select("title category type frequency targetValue mvdValue mvdDescription isArchived")
    .lean();

  res.status(201).json({ success: true, data: projectedHabit });
});

exports.logHabit = catchAsync(async (req, res) => {
  const validation = HabitLog.logHabitSchema.safeParse({ habitId: req.params.id, ...req.body });
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { habitId, date, value, isMvd } = validation.data;

  // Verify ownership before modifying logs
  const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
  if (!habit) {
    return res.status(404).json({
      success: false,
      errorCode: "UNKNOWN",
      error: "habits.errors.notFound",
    });
  }

  // Upsert the log for this specific date
  const log = await HabitLog.findOneAndUpdate(
    { habitId, date },
    { $set: { value, isMvd } },
    { upsert: true, new: true }
  ).select("-isRelapse -__v");

  const { upsertDailySummaryHelper } = require("./dailySummaryController");
  await upsertDailySummaryHelper(req.user.id, date);

  res.status(200).json({ success: true, data: log });
});

const { calculateDaysSinceRelapse } = require("../utils/habit-streak");

exports.getHabits = catchAsync(async (req, res) => {
  const habits = await Habit.find({ userId: req.user.id })
    .select("title category type frequency targetValue mvdValue mvdDescription isArchived createdAt")
    .lean();

  const todayStr = new Date().toISOString().split("T")[0];

  // Perform read-time streak computation for quit habits without exposing isRelapse
  const habitsWithStreak = await Promise.all(
    habits.map(async (habit) => {
      if (habit.type !== "quit") return habit;

      // Find the most recent relapse log
      const lastRelapse = await HabitLog.findOne({
        habitId: habit._id,
        isRelapse: true,
      })
        .sort({ date: -1 })
        .select("date")
        .lean();

      const lastRelapseDateStr = lastRelapse ? lastRelapse.date : null;
      const daysSinceRelapse = calculateDaysSinceRelapse(lastRelapseDateStr, habit.createdAt, todayStr);

      return { ...habit, daysSinceRelapse };
    })
  );

  res.status(200).json({ success: true, data: habitsWithStreak });
});

exports.getHabitLogs = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Retrieve user's habits to enforce ownership when querying logs
  const userHabits = await Habit.find({ userId: req.user.id }).select("_id").lean();
  const habitIds = userHabits.map((h) => h._id);

  const query = { habitId: { $in: habitIds } };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const logs = await HabitLog.find(query)
    .select("habitId date value isMvd")
    .lean();
  res.status(200).json({ success: true, data: logs });
});

exports.logRelapse = catchAsync(async (req, res) => {
  const habitId = req.params.id;

  const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
  if (!habit) {
    return res.status(404).json({
      success: false,
      errorCode: "UNKNOWN",
      error: "habits.errors.notFound",
    });
  }

  if (habit.type !== "quit") {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "habits.errors.notQuitType",
    });
  }

  const date = new Date().toISOString().split("T")[0];

  const log = await HabitLog.findOneAndUpdate(
    { habitId, date },
    { $set: { isRelapse: true } },
    { upsert: true, new: true }
  ).select("-isRelapse -__v");

  res.status(200).json({ success: true, data: log });
});
