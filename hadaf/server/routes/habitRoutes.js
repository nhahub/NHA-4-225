const express = require("express");
const habitController = require("../controllers/habitController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Ensure all habit endpoints require authentication

router.route("/")
  .get(habitController.getHabits)
  .post(habitController.createHabit);

router.route("/logs")
  .get(habitController.getHabitLogs);

router.route("/:id/log")
  .post(habitController.logHabit);

router.route("/:id/relapse")
  .post(habitController.logRelapse);

module.exports = router;
