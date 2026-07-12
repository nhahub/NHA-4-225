const express = require("express");
const { protect } = require("../middleware/auth");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.use(protect);

// Epic 6 — Analytics. Mounted at /api/analytics in app.js.
router.get("/overview", analyticsController.getOverview);
router.get("/habits", analyticsController.getHabitsAnalytics);

module.exports = router;
