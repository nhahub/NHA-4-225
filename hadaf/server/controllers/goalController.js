const Goal = require("../models/Goal");
const Milestone = require("../models/Milestone");
const Task = require("../models/Task");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const {
  calculateHybridProgress,
  calculateGoalHealth,
  getCurrentWeek,
  calculateWeeklyExecutionScore,
} = require("../utils/goal-progress");
const catchAsync = require("../utils/catchAsync");

// Compile helper for goal details and active goal list calculations
const compileGoalProgress = async (goal) => {
  const currentWeek = getCurrentWeek(goal.cycleStart);

  // Calculate current week date boundaries in UTC to prevent timezone drift
  const weekStart = new Date(goal.cycleStart);
  weekStart.setUTCDate(weekStart.getUTCDate() + (currentWeek - 1) * 7);
  weekStart.setUTCHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  weekEnd.setUTCMilliseconds(-1);

  // Convert Date objects to YYYY-MM-DD strings matching DB storage format
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const [
    tasksCount,
    completedTasksCount,
    milestonesCount,
    completedMilestonesCount,
    weeklyTasksCount,
    weeklyCompletedTasksCount,
    cycleTasks,
  ] = await Promise.all([
    Task.countDocuments({ goalId: goal._id }),
    Task.countDocuments({ goalId: goal._id, status: "completed" }),
    Milestone.countDocuments({ goalId: goal._id }),
    Milestone.countDocuments({ goalId: goal._id, is_completed: true }),
    Task.countDocuments({ goalId: goal._id, date: { $gte: weekStartStr, $lte: weekEndStr } }),
    Task.countDocuments({ goalId: goal._id, status: "completed", date: { $gte: weekStartStr, $lte: weekEndStr } }),
    Task.find({ goalId: goal._id, date: { $gte: goal.cycleStart.toISOString().split("T")[0], $lte: goal.cycleEnd.toISOString().split("T")[0] } }, { date: 1, status: 1 }).lean(),
  ]);

  let progress = calculateHybridProgress(
    tasksCount,
    completedTasksCount,
    milestonesCount,
    completedMilestonesCount
  );

  // If manualProgress override is present, use it
  let isOverride = false;
  if (goal.manualProgress !== undefined && goal.manualProgress !== null) {
    progress = goal.manualProgress;
    isOverride = true;
  }

  const health = calculateGoalHealth(progress, currentWeek);
  const weeklyExecutionScore = calculateWeeklyExecutionScore(
    weeklyCompletedTasksCount,
    weeklyTasksCount
  );

  // Build per-week completion buckets (12 weeks per cycle).
  // Each bucket carries `total` (any task scheduled that week) and `completed`
  // (subset whose status is 'completed'). Weeks outside the cycle clamp to 1/12.
  const weeklyCompletion = buildWeeklyCompletionBuckets(cycleTasks, goal.cycleStart);

  return {
    ...goal.toObject(),
    progress,
    health,
    isOverride,
    weeklyExecutionScore,
    stats: {
      tasksCount,
      completedTasksCount,
      milestonesCount,
      completedMilestonesCount,
    },
    weeklyCompletion,
  };
};

// Bucket task documents into 12 ISO-week buckets relative to a goal's cycleStart.
// Pure of Express/Mongoose concerns — accepts pre-fetched task lean docs.
function buildWeeklyCompletionBuckets(tasks, cycleStart) {
  const buckets = Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    total: 0,
    completed: 0,
    ratio: 0,
  }));

  const start = new Date(cycleStart);
  start.setUTCHours(0, 0, 0, 0);

  for (const task of tasks) {
    if (!task.date) continue;
    const taskDate = new Date(task.date);
    if (isNaN(taskDate.getTime())) continue;
    taskDate.setUTCHours(0, 0, 0, 0);

    const diffDays = Math.floor((taskDate - start) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) continue;

    const idx = Math.min(11, Math.floor(diffDays / 7));
    buckets[idx].total += 1;
    if (task.status === "completed") buckets[idx].completed += 1;
  }

  for (const b of buckets) {
    b.ratio = b.total > 0 ? Math.round((b.completed / b.total) * 100) : 0;
  }
  return buckets;
}

// Create Goal
exports.createGoal = catchAsync(async (req, res, next) => {
  const validation = Goal.createGoalSchema.safeParse(req.body);
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
    title,
    description,
    category,
    customCategory,
    measure,
    relevance,
    cycleStart,
    cycleEnd,
    milestones,
  } = validation.data;

  // Enforce 5 active goals limit
  const activeCount = await Goal.countDocuments({
    userId: req.user.id,
    status: "active",
  });

  if (activeCount >= 5) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.limitReached",
    });
  }

  const goal = await Goal.create({
    userId: req.user.id,
    title,
    description,
    category,
    customCategory,
    measure,
    relevance,
    cycleStart,
    cycleEnd,
    status: "active",
  });

  if (milestones && milestones.length > 0) {
    const milestoneDocs = milestones.map((m, index) => ({
      goalId: goal._id,
      title: m,
      sort_order: index,
      is_completed: false,
    }));
    await Milestone.insertMany(milestoneDocs);
  }

  await AnalyticsEvent.create({
    userId: req.user.id,
    eventType: "goal_created",
    eventData: { goalId: goal._id, title },
  });

  res.status(201).json({
    success: true,
    data: goal,
  });
});

// List all Goals (filtered by status and/or category, scoped to user)
exports.getGoals = catchAsync(async (req, res) => {
  const { status, category } = req.query;
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (category) query.category = category;

  const goals = await Goal.find(query);
  const compiledGoals = await Promise.all(goals.map((g) => compileGoalProgress(g)));

  res.status(200).json({
    success: true,
    data: compiledGoals,
  });
});

// List Active Goals
exports.getActiveGoals = catchAsync(async (req, res, next) => {
  const goals = await Goal.find({
    userId: req.user.id,
    status: "active",
  });

  const compiledGoals = await Promise.all(goals.map((g) => compileGoalProgress(g)));

  res.status(200).json({
    success: true,
    data: compiledGoals,
  });
});

// Get Goal Details
exports.getGoalDetails = catchAsync(async (req, res, next) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.notFound",
    });
  }

  const [compiledGoal, milestones, tasks] = await Promise.all([
    compileGoalProgress(goal),
    Milestone.find({ goalId: goal._id }).sort({ sort_order: 1 }),
    Task.find({ goalId: goal._id }).sort({ date: 1, priority: -1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      goal: compiledGoal,
      milestones,
      tasks,
    },
  });
});

// Edit Goal configuration (title, description, category, measure, relevance - progress unaffected)
exports.updateGoal = catchAsync(async (req, res, next) => {
  const validation = Goal.updateGoalSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    validation.data,
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.notFound",
    });
  }

  const compiledGoal = await compileGoalProgress(goal);
  res.status(200).json({
    success: true,
    data: compiledGoal,
  });
});

// Replace Goal (Soft deletes/archives old goal as replaced and creates a new one from scratch)
exports.replaceGoal = catchAsync(async (req, res, next) => {
  // Validate target goal exists
  const oldGoal = await Goal.findOne({
    _id: req.params.id,
    userId: req.user.id,
    status: "active",
  });

  if (!oldGoal) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.notFound",
    });
  }

  // Validate the replacement goal payload
  const validation = Goal.replaceGoalSchema.safeParse(req.body);
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
    reason,
    title,
    description,
    category,
    customCategory,
    measure,
    relevance,
    cycleStart,
    cycleEnd,
    milestones,
  } = validation.data;

  // Perform archiving + new creation
  oldGoal.status = "replaced";
  oldGoal.deletionReason = reason;
  await oldGoal.save();

  const newGoal = await Goal.create({
    userId: req.user.id,
    title,
    description,
    category,
    customCategory,
    measure,
    relevance,
    cycleStart,
    cycleEnd,
    status: "active",
  });

  if (milestones && milestones.length > 0) {
    const milestoneDocs = milestones.map((m, index) => ({
      goalId: newGoal._id,
      title: m,
      sort_order: index,
      is_completed: false,
    }));
    await Milestone.insertMany(milestoneDocs);
  }

  // Log replacement analytics
  await AnalyticsEvent.create({
    userId: req.user.id,
    eventType: "goal_replaced",
    eventData: { oldGoalId: oldGoal._id, newGoalId: newGoal._id, title },
  });

  res.status(201).json({
    success: true,
    data: newGoal,
  });
});

// Soft Delete (Archive Goal)
exports.softDeleteGoal = catchAsync(async (req, res, next) => {
  const validation = Goal.softDeleteGoalSchema.safeParse({
    goalId: req.params.id,
    reason: req.body.reason,
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

  const { goalId, reason } = validation.data;

  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, userId: req.user.id },
    { status: "archived", deletionReason: reason },
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.notFound",
    });
  }

  res.status(200).json({
    success: true,
    data: null,
  });
});

// Override calculated progress manually
exports.overrideProgress = catchAsync(async (req, res, next) => {
  const validation = Goal.overrideGoalSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { progress } = validation.data;

  if (progress === undefined || progress === null) {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $unset: { manualProgress: "" } },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        errorCode: "VALIDATION",
        error: "goals.errors.notFound",
      });
    }

    const compiledGoal = await compileGoalProgress(goal);
    return res.status(200).json({
      success: true,
      data: compiledGoal,
    });
  }

  // `progress` is already a validated number 0–100 from `overrideGoalSchema`.
  const progressNum = progress;

  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { manualProgress: progressNum },
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.notFound",
    });
  }

  const compiledGoal = await compileGoalProgress(goal);
  res.status(200).json({
    success: true,
    data: compiledGoal,
  });
});
