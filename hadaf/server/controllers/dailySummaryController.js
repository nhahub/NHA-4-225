const DailySummary = require("../models/DailySummary");
const catchAsync = require("../utils/catchAsync");

exports.updateDayType = catchAsync(async (req, res) => {
  const { date } = req.params;
  const { dayType } = req.body;

  // Basic validation of date string YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "Invalid date format. Must be YYYY-MM-DD.",
    });
  }

  if (!["work", "light", "off"].includes(dayType)) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "Invalid dayType. Must be work, light, or off.",
    });
  }

  const summary = await DailySummary.findOneAndUpdate(
    { userId: req.user.id, date },
    { $set: { dayType } },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  res.status(200).json({
    success: true,
    data: summary,
  });
});

const { resolveLogicalDate } = require("../utils/date");
const { calculateDailyCapacity, calculatePlannedTime } = require("../utils/capacity");
const User = require("../models/User");
const Task = require("../models/Task");

exports.getCapacity = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(404).json({ success: false, errorCode: "UNKNOWN", error: "errors.unauthorized" });
  }

  const { work_hours_start, work_hours_end, day_start, off_days } = user.settings;

  // Resolve logical "today"
  const todayStr = resolveLogicalDate(new Date(), day_start);

  // Determine day type
  const dayType = await resolveDayType(req.user.id, todayStr, off_days);

  // Fetch today's tasks (pending or completed)
  const tasks = await Task.find({
    userId: req.user.id,
    date: todayStr,
    status: { $in: ["pending", "completed"] }
  }).lean();

  const totalCapacityMinutes = calculateDailyCapacity(work_hours_start, work_hours_end, dayType);
  const totalPlannedMinutes = calculatePlannedTime(tasks);

  res.status(200).json({
    success: true,
    data: {
      date: todayStr,
      dayType,
      totalCapacityMinutes,
      totalPlannedMinutes
    }
  });
});

const { getLogicalDateRange } = require("../utils/date");
const { calculateDayState, calculateAdaptiveDailyTarget } = require("../utils/dayState");
const { calculateHabitPoints, calculateCounterHabitPoints, MILESTONE_BONUS_POINTS } = require("../utils/scoring");
const Goal = require("../models/Goal");
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const Milestone = require("../models/Milestone");

async function resolveDayType(userId, dateStr, offDays) {
  const summary = await DailySummary.findOne({ userId, date: dateStr }).lean();
  
  if (summary && summary.dayType) {
    return summary.dayType;
  }
  
  const dateObj = new Date(dateStr);
  const weekdayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const weekday = weekdayNames[dateObj.getUTCDay()];
  
  if (offDays && offDays.includes(weekday)) {
    return "off";
  }
  
  return "work";
}

exports.upsertDailySummaryHelper = async (userId, dateStr) => {
  const user = await User.findById(userId).lean();
  if (!user) return;

  const { day_start, off_days } = user.settings;

  // 1. Resolve Day Type
  const dayType = await resolveDayType(userId, dateStr, off_days);

  // 2. Fetch completed tasks points
  const tasks = await Task.find({ userId, date: dateStr, status: "completed" }).lean();
  const tasksCompleted = tasks.length;
  const taskPoints = tasks.reduce((sum, t) => sum + (t.pointsEarned || 0), 0);

  // 3. Fetch completed habits points
  const userHabits = await Habit.find({ userId }).lean();
  const habitMap = Object.fromEntries(userHabits.map((h) => [h._id.toString(), h]));
  const logs = await HabitLog.find({
    habitId: { $in: userHabits.map((h) => h._id) },
    date: dateStr
  }).lean();
  
  let habitsCompleted = 0;
  let habitPoints = 0;
  for (const log of logs) {
    const habit = habitMap[log.habitId.toString()];
    if (!habit) continue;
    
    let pts = 0;
    if (habit.type === "boolean" || habit.type === "quit") {
      if (habit.type === "boolean" && log.value > 0) habitsCompleted++;
      pts = calculateHabitPoints(habit.type, log.isMvd);
    } else if (habit.type === "counter") {
      if (log.value > 0) habitsCompleted++;
      pts = calculateCounterHabitPoints(log.value, habit.targetValue, habit.mvdValue);
    }
    habitPoints += pts;
  }

  // 4. Fetch milestone bonus points
  const userGoals = await Goal.find({ userId }).select("_id").lean();
  const { startOfDay, endOfDay } = getLogicalDateRange(dateStr, day_start);
  
  const milestones = await Milestone.find({
    goalId: { $in: userGoals.map((g) => g._id) },
    is_completed: true,
    completed_at: { $gte: startOfDay, $lt: endOfDay }
  }).lean();
  const milestonePoints = milestones.length * MILESTONE_BONUS_POINTS;

  const totalPoints = taskPoints + habitPoints + milestonePoints;

  // 5. Adaptive target
  const pastSummaries = await DailySummary.find({
    userId,
    date: { $lt: dateStr }
  }).sort({ date: -1 }).limit(7).lean();
  
  const recentPoints = pastSummaries.map((s) => s.pointsEarned || 0);
  const dailyTarget = calculateAdaptiveDailyTarget(recentPoints, dayType);

  // 6. Day State
  const dayState = calculateDayState(totalPoints, dailyTarget);

  // 7. Upsert
  return DailySummary.findOneAndUpdate(
    { userId, date: dateStr },
    {
      $set: {
        dayType,
        tasksCompleted,
        habitsCompleted,
        pointsEarned: totalPoints,
        dailyTarget,
        dayState
      }
    },
    { upsert: true, new: true, runValidators: true }
  ).lean();
};

exports.getToday = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select("settings.day_start").lean();
  if (!user) {
    return res.status(404).json({ success: false, errorCode: "UNKNOWN", error: "errors.unauthorized" });
  }

  const todayStr = resolveLogicalDate(new Date(), user.settings.day_start);

  let summary = await DailySummary.findOne({ userId: req.user.id, date: todayStr }).lean();
  
  if (!summary) {
    // Missing summary for today, run the full helper to generate a blank/computed one
    await exports.upsertDailySummaryHelper(req.user.id, todayStr);
    summary = await DailySummary.findOne({ userId: req.user.id, date: todayStr }).lean();
  }

  res.status(200).json({
    success: true,
    data: summary || { date: todayStr, dayType: "work", tasksCompleted: 0, habitsCompleted: 0, pointsEarned: 0, dayState: "good_enough" }
  });
});
