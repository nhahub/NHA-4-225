const express = require("express");
const goalsController = require("../controllers/goalController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect); // Ensure all goal endpoints require authentication

router.route("/")
  .post(goalsController.createGoal);

router.route("/active")
  .get(goalsController.getActiveGoals);

router.route("/:id")
  .get(goalsController.getGoalDetails)
  .patch(goalsController.updateGoal)
  .delete(goalsController.softDeleteGoal);

router.post("/:id/replace", goalsController.replaceGoal);

router.route("/:id/override")
  .patch(goalsController.overrideProgress);

module.exports = router;
