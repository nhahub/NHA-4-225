const express = require("express");
const taskController = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // All task endpoints require authentication

router.route("/")
  .get(taskController.getTasks)
  .post(taskController.createTask);

router.route("/:id/complete")
  .patch(taskController.completeTask);

router.route("/:id/postpone")
  .patch(taskController.postponeTask);

router.route("/:id/reschedule")
  .patch(taskController.rescheduleTask);

router.route("/:id")
  .delete(taskController.deleteTask);


module.exports = router;
