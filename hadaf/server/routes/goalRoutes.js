const express = require("express");
const goalsController = require("../controllers/goalController");
const milestonesController = require("../controllers/milestoneController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect); // Ensure all goal endpoints require authentication

router.route("/")
  .get(goalsController.getGoals)
  .post(goalsController.createGoal);

router.route("/active")
  .get(goalsController.getActiveGoals);

router.route("/:id")
  .get(goalsController.getGoalDetails)
  .patch(goalsController.updateGoal)
  .delete(goalsController.softDeleteGoal);

router.post("/:id/replace", goalsController.replaceGoal);

router.patch("/:id/override", goalsController.overrideProgress);

router.post("/:id/milestones", milestonesController.addMilestone);

module.exports = router;
