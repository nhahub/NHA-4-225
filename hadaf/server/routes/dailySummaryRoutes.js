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

// /api/daily-summaries/:date/shown
router.route("/:date/shown")
  .patch(dailySummaryController.markShown);

// /api/daily-summaries/:date — generic getter (HOME-1's "yesterday" lookup).
// Registered last: Express matches literal routes (/today, /capacity) before
// this param route regardless of registration order for those exact paths,
// but keeping this last avoids any ambiguity with the more specific
// /:date/day-type and /:date/shown routes above.
router.route("/:date")
  .get(dailySummaryController.getByDate);

module.exports = router;
