const Milestone = require("../models/Milestone");
const Goal = require("../models/Goal");
const catchAsync = require("../utils/catchAsync");

// Toggle Milestone Checked State
exports.toggleMilestone = catchAsync(async (req, res, next) => {
  const milestone = await Milestone.findById(req.params.id).populate("goalId");

  if (!milestone || milestone.goalId.userId.toString() !== req.user.id) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "milestones.errors.notFound",
    });
  }

  milestone.is_completed = !milestone.is_completed;
  milestone.completed_at = milestone.is_completed ? new Date() : null;
  await milestone.save();

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
