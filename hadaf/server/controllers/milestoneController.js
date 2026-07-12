const Milestone = require("../models/Milestone");
const Goal = require("../models/Goal");
const catchAsync = require("../utils/catchAsync");

// Milestone completion has no manual toggle — it is always derived from the
// points earned on its linked tasks (see taskController's
// recomputeMilestoneCompletion), so a milestone can never be marked done by
// clicking a checkbox, and never leaks unearned bonus points into a day's
// summary.

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
