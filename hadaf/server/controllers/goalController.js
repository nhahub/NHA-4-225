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
  ] = await Promise.all([
    Task.countDocuments({ goalId: goal._id }),
    Task.countDocuments({ goalId: goal._id, status: "completed" }),
    Milestone.countDocuments({ goalId: goal._id }),
    Milestone.countDocuments({ goalId: goal._id, is_completed: true }),
    Task.countDocuments({ goalId: goal._id, date: { $gte: weekStartStr, $lte: weekEndStr } }),
    Task.countDocuments({ goalId: goal._id, status: "completed", date: { $gte: weekStartStr, $lte: weekEndStr } }),
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
  };
};

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
  const { progress } = req.body;

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

  const progressNum = Number(progress);
  if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "goals.errors.invalidProgressValue",
    });
  }

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
