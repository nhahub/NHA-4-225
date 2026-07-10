const Task = require("../models/Task");
const Goal = require("../models/Goal");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const catchAsync = require("../utils/catchAsync");
const { detectTaskType, calculateBlockDuration } = require("../utils/task-type");
const { predictTaskPoints, calculateTaskPoints } = require("../utils/scoring");

// ─── Streak helper ────────────────────────────────────────────────────────────

const { resolveLogicalDate } = require("../utils/date");

/**
 * Counts the number of consecutive days (ending yesterday, logical timezone) on which the
 * user completed at least one task. Looks back at most 60 days.
 *
 * @param {string} userId
 * @param {string} dayStartStr
 * @returns {Promise<number>} streakDays
 */
async function getStreakDays(userId, dayStartStr = "04:00") {
  const now = new Date();
  const todayStr = resolveLogicalDate(now, dayStartStr);

  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setUTCDate(sixtyDaysAgo.getUTCDate() - 60);

  const completions = await Task.find({
    userId,
    status: "completed",
    completedAt: { $gte: sixtyDaysAgo },
  })
    .select("completedAt")
    .lean();

  const completedDates = new Set(
    completions.map((t) => resolveLogicalDate(t.completedAt, dayStartStr))
  );

  let streak = 0;
  // Cursor walks backwards in logical dates
  const cursorDate = new Date(`${todayStr}T12:00:00Z`); // start safely in the middle of today
  cursorDate.setUTCDate(cursorDate.getUTCDate() - 1); // move to yesterday

  const cutoffStr = resolveLogicalDate(sixtyDaysAgo, dayStartStr);

  while (true) {
    const dateStr = cursorDate.toISOString().split("T")[0];
    if (dateStr < cutoffStr) break;
    if (!completedDates.has(dateStr)) break;
    streak++;
    cursorDate.setUTCDate(cursorDate.getUTCDate() - 1);
  }

  return streak;
}


// ─── Create Task (E2-1) ────────────────────────────────────────────────────────

exports.createTask = catchAsync(async (req, res) => {
  const validation = Task.createTaskSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const {
    goalId,
    title,
    description,
    difficulty,
    priority,
    date,
    timeBlockStart,
    timeBlockEnd,
    plannedDurationMinutes,
    checklist,
  } = validation.data;

  // Verify goalId exists and belongs to the authenticated user
  // This is an authorization check — Zod only validates format, not ownership
  if (goalId) {
    const goal = await Goal.findOne({ _id: goalId, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({
        success: false,
        errorCode: "VALIDATION",
        error: "tasks.errors.goalNotFound",
        field: "goalId",
      });
    }
  }

  // Auto-detect task type from supplied fields (Architecture.md §6.5)
  const type = detectTaskType({ timeBlockStart, timeBlockEnd, plannedDurationMinutes });

  // If a time block is provided, derive the planned duration from it
  let resolvedPlannedMinutes = plannedDurationMinutes ?? 0;
  if (type === "scheduled" && timeBlockStart && timeBlockEnd) {
    resolvedPlannedMinutes = calculateBlockDuration(timeBlockStart, timeBlockEnd);
  }

  // Predicted points for the live preview (returned in response, not stored yet)
  const predictedPoints = predictTaskPoints({ type, difficulty, plannedMinutes: resolvedPlannedMinutes });

  const task = await Task.create({
    userId: req.user.id,
    goalId: goalId || undefined, // strip empty string from optional field
    title,
    description,
    type,
    difficulty,
    priority,
    date,
    timeBlockStart,
    timeBlockEnd,
    plannedDurationMinutes: resolvedPlannedMinutes || undefined,
    checklist,
    status: "pending",
  });

  await AnalyticsEvent.create({
    userId: req.user.id,
    eventType: "task_created",
    eventData: { taskId: task._id, type, difficulty, date },
  });

  res.status(201).json({
    success: true,
    data: { ...task.toObject(), predictedPoints },
  });
});

// ─── Complete Task (E2-2) ─────────────────────────────────────────────────────

exports.completeTask = catchAsync(async (req, res) => {
  const validation = Task.completeTaskSchema.safeParse({
    taskId: req.params.id,
    actualDurationMinutes: req.body?.actualDurationMinutes,
  });
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { taskId, actualDurationMinutes } = validation.data;

  // Load the task to read its type/difficulty/plannedMinutes for scoring.
  // No status check here — the atomic write below owns that check.
  const task = await Task.findOne({ _id: taskId, userId: req.user.id });
  if (!task) {
    return res.status(404).json({
      success: false,
      errorCode: "UNKNOWN",
      error: "tasks.errors.notFound",
    });
  }

  // Non-quick tasks require actualDurationMinutes — the client MUST send it
  // (schema marks it optional because quick tasks don't need it, so we guard here)
  if (task.type !== "quick" && (actualDurationMinutes === undefined || actualDurationMinutes === null)) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "tasks.errors.actualDurationRequired",
      field: "actualDurationMinutes",
    });
  }

  // Compute streak: consecutive completed-task days ending yesterday (Architecture.md §7.2)
  const User = require("../models/User");
  const user = await User.findById(req.user.id).select("settings.day_start").lean();
  const streakDays = await getStreakDays(req.user.id, user ? user.settings.day_start : "04:00");

  const pointsEarned = calculateTaskPoints({
    type:           task.type,
    difficulty:     task.difficulty,
    actualMinutes:  actualDurationMinutes,
    plannedMinutes: task.plannedDurationMinutes ?? 0,
    streakDays,
  });

  // Build $set conditionally — never include actualDurationMinutes for quick tasks.
  // Avoids "?? undefined" which has ambiguous Mongoose behavior when ignoreUndefined is unset.
  const completionFields = {
    status:      "completed",
    pointsEarned,
    completedAt: new Date(),
  };
  if (actualDurationMinutes != null) {
    completionFields.actualDurationMinutes = actualDurationMinutes;
  }

  // Atomic check-and-set: the status: { $ne: "completed" } condition and the write
  // happen in one MongoDB operation, so two near-simultaneous requests can't both
  // pass the check — only the first write wins; the second gets null back.
  const updated = await Task.findOneAndUpdate(
    { _id: taskId, userId: req.user.id, status: { $ne: "completed" } },
    { $set: completionFields },
    { new: true }
  );

  if (!updated) {
    // Atomic write returned null — task was already completed (race loser or double-tap).
    // The task.status we read earlier may now be stale; return the correct error.
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "tasks.errors.alreadyCompleted",
    });
  }

  await AnalyticsEvent.create({
    userId: req.user.id,
    eventType: "task_complete",
    eventData: {
      taskId:    task._id,
      type:      task.type,
      points:    pointsEarned,
      streakDays,
    },
  });

  const { upsertDailySummaryHelper } = require("./dailySummaryController");
  await upsertDailySummaryHelper(req.user.id, updated.date);

  res.status(200).json({
    success: true,
    data: { ...updated.toObject(), streakDays },
  });
});

// ─── E2-3 Helpers & Endpoints ──────────────────────────────────────────────────

function sortTasks(tasks) {
  const scheduled = tasks.filter(t => t.type === "scheduled");
  const others = tasks.filter(t => t.type !== "scheduled");

  scheduled.sort((a, b) => (a.timeBlockStart ?? "").localeCompare(b.timeBlockStart ?? ""));
  others.sort((a, b) => {
    const rankDiff = Task.PRIORITY_RANK[b.priority] - Task.PRIORITY_RANK[a.priority];
    if (rankDiff !== 0) return rankDiff;
    return a.createdAt - b.createdAt; // stable tiebreak
  });

  return [...scheduled, ...others];
}

exports.getTasks = catchAsync(async (req, res) => {
  const { date, status, type, view } = req.query;
  const query = { userId: req.user.id };

  if (view === "backlog") {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("settings.day_start").lean();
    const todayStr = resolveLogicalDate(new Date(), user ? user.settings.day_start : "04:00");
    query.$or = [
      { status: "pending", date: { $lt: todayStr } },
      { status: "postponed" },
    ];
  } else {
    if (date) query.date = date;
    if (status) query.status = status;
    if (type) query.type = type;
  }

  const tasks = await Task.find(query).lean();
  const sorted = view === "backlog"
    ? tasks.sort((a, b) => a.date.localeCompare(b.date)) // backlog: oldest first
    : sortTasks(tasks);

  res.status(200).json({
    success: true,
    data: sorted,
    meta: view === "backlog" ? { count: sorted.length, overLimit: sorted.length > 10 } : undefined,
  });
});

exports.postponeTask = catchAsync(async (req, res) => {
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id, status: "pending" },
    { $set: { status: "postponed" } },
    { new: true }
  );
  if (!updated) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "tasks.errors.cannotPostpone",
    });
  }
  res.status(200).json({ success: true, data: updated });
});

exports.rescheduleTask = catchAsync(async (req, res) => {
  const validation = Task.rescheduleTaskSchema.safeParse({ taskId: req.params.id, ...req.body });
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({ success: false, errorCode: "VALIDATION", error: firstError.message, field: firstError.path[0] });
  }
  const { taskId, date, timeBlockStart, timeBlockEnd } = validation.data;

  const task = await Task.findOne({ _id: taskId, userId: req.user.id, status: { $in: ["pending", "postponed"] } });
  if (!task) {
    return res.status(404).json({ success: false, errorCode: "UNKNOWN", error: "tasks.errors.notFound" });
  }

  const type = detectTaskType({ timeBlockStart, timeBlockEnd, plannedDurationMinutes: task.plannedDurationMinutes });
  let plannedDurationMinutes = task.plannedDurationMinutes;
  
  if (type === "scheduled" && timeBlockStart && timeBlockEnd) {
    plannedDurationMinutes = calculateBlockDuration(timeBlockStart, timeBlockEnd);
  } else if (type !== "scheduled" && !timeBlockStart) {
    // time block was removed — keep existing plannedDurationMinutes (flexible tasks keep their manual estimate)
  }

  const updateFields = { date, type, status: "pending" };
  if (plannedDurationMinutes != null) {
    updateFields.plannedDurationMinutes = plannedDurationMinutes;
  }
  
  const updateQuery = { $set: updateFields };
  if (timeBlockStart && timeBlockEnd) {
    updateFields.timeBlockStart = timeBlockStart;
    updateFields.timeBlockEnd = timeBlockEnd;
  } else {
    // explicitly $unset to avoid `ignoreUndefined` ambiguity
    updateQuery.$unset = { timeBlockStart: "", timeBlockEnd: "" };
  }

  const updated = await Task.findOneAndUpdate(
    { _id: taskId, userId: req.user.id, status: { $in: ["pending", "postponed"] } },
    updateQuery,
    { new: true }
  );

  res.status(200).json({ success: true, data: updated });
});

exports.deleteTask = catchAsync(async (req, res) => {
  const deleted = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
    status: { $in: ["pending", "postponed"] },
  });
  if (!deleted) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "tasks.errors.cannotDelete",
    });
  }
  res.status(200).json({ success: true, data: { taskId: deleted._id } });
});

exports._sortTasksForTesting = sortTasks;
