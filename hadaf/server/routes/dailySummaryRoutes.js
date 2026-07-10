const express = require("express");
const dailySummaryController = require("../controllers/dailySummaryController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Ensure all endpoints require authentication

// /api/daily-summaries/today
router.route("/today")
  .get(dailySummaryController.getToday);

// /api/daily-summaries/capacity
router.route("/capacity")
  .get(dailySummaryController.getCapacity);

// /api/daily-summaries/:date/day-type
router.route("/:date/day-type")
  .patch(dailySummaryController.updateDayType);

module.exports = router;
