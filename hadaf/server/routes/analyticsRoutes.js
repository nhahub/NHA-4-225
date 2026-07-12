const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// Endpoints registered by controllers/analyticsController.js (Epic 6 —
// Analytics). Mounted at /api/analytics in app.js.

module.exports = router;
