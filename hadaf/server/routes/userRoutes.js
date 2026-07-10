const express = require("express");
const settingsController = require("../controllers/settingsController");
const {protect} = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Ensure endpoints require authentication

// /api/user/settings
router.route("/settings")
  .patch(settingsController.updateSettings);

module.exports = router;
