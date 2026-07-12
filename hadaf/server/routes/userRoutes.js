const express = require("express");
const settingsController = require("../controllers/settingsController");
const onboardingController = require("../controllers/onboardingController");
const {protect} = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Ensure endpoints require authentication

router.route("/settings")
  .get(settingsController.getSettings)
  .patch(settingsController.updateSettings);

router.post("/onboarding/complete", onboardingController.completeOnboarding);

module.exports = router;
