const Milestone = require("../models/Milestone");
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const catchAsync = require("../utils/catchAsync");

// Toggle Milestone Checked State (manual — only allowed when the milestone has no
// linked tasks; once tasks exist, completion is derived automatically)
exports.toggleMilestone = catchAsync(async (req, res, next) => {
  const milestone = await Milestone.findById(req.params.id).populate("goalId");

  if (!milestone || milestone.goalId.userId.toString() !== req.user.id) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "milestones.errors.notFound",
    });
  }

  const linkedTaskCount = await Task.countDocuments({ milestoneId: milestone._id });
  if (linkedTaskCount > 0) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "milestones.errors.derivedFromTasks",
    });
  }

  milestone.is_completed = !milestone.is_completed;
  milestone.completed_at = milestone.is_completed ? new Date() : null;
  await milestone.save();

  const { upsertDailySummaryHelper } = require("./dailySummaryController");
  const { resolveLogicalDate } = require("../utils/date");
  const User = require("../models/User");

  // Recompute summary for the logical date of the toggle event
  const user = await User.findById(req.user.id).lean();
  if (user) {
    const todayStr = resolveLogicalDate(new Date(), user.settings.day_start);
    await upsertDailySummaryHelper(req.user.id, todayStr);
  }

  res.status(200).json({
    success: true,
    data: {
      id: milestone._id,
      title: milestone.title,
      is_completed: milestone.is_completed,
      completed_at: milestone.completed_at,
    },
  });
});

// Reorder Milestones inside a Goal
exports.reorderMilestones = catchAsync(async (req, res, next) => {
  const { milestones } = req.body;

  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "milestones.errors.invalidArray",
    });
  }

  // Verify ownership using the first milestone
  const sampleMilestone = await Milestone.findById(milestones[0].id).populate("goalId");
  if (!sampleMilestone || sampleMilestone.goalId.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      errorCode: "AUTH",
      error: "errors.unauthorized",
    });
  }

  // Perform bulk updates
  const bulkOps = milestones.map((m) => ({
    updateOne: {
      filter: { _id: m.id, goalId: sampleMilestone.goalId._id },
      update: { sort_order: m.sort_order },
    },
  }));

  await Milestone.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    data: null,
  });
});

// Add Milestone to an existing Goal
exports.addMilestone = catchAsync(async (req, res, next) => {
  const goalId = req.params.id;
  const { title, startDate, endDate } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION',
      error: 'Title is required',
    });
  }

  const goal = await Goal.findById(goalId);
  if (!goal || goal.userId.toString() !== req.user.id) {
    return res.status(404).json({
      success: false,
      errorCode: 'VALIDATION',
      error: 'goals.errors.notFound',
    });
  }

  const milestoneCount = await Milestone.countDocuments({ goalId });

  const milestone = await Milestone.create({
    goalId,
    title,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sort_order: milestoneCount,
    is_completed: false,
  });

  res.status(201).json({
    success: true,
    data: {
      id: milestone._id,
      title: milestone.title,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      is_completed: milestone.is_completed,
      sort_order: milestone.sort_order,
    },
  });
});
