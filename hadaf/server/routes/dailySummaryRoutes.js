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

// /api/daily-summaries/:date/summary-shown  (HOME-1 toast gating)
router.route("/:date/summary-shown")
  .patch(dailySummaryController.markSummaryShown);

module.exports = router;
