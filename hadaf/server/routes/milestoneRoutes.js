const express = require("express");
const milestonesController = require("../controllers/milestoneController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect); // Ensure all milestone endpoints require authentication

router.patch("/:id/toggle", milestonesController.toggleMilestone);
router.put("/reorder", milestonesController.reorderMilestones);

module.exports = router;
