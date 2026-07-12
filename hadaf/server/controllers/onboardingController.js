const User = require("../models/User");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const catchAsync = require("../utils/catchAsync");

// Mark the authenticated user's onboarding as complete.
// Idempotent: re-calling on an already-completed user is a no-op
// (flag stays true; a second AnalyticsEvent row IS still written so
// the funnel count reflects actual "finish" presses, not first-time
// only — this matches how `register`/`login` events are handled).
exports.completeOnboarding = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { onboardingCompleted: true } },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: "UNKNOWN",
      error: "errors.unauthenticated",
    });
  }

  await AnalyticsEvent.create({
    userId: user._id,
    eventType: "onboarding_complete",
  });

  // Mirror the authController user-shape exactly so the client can refresh
  // its Zustand store from this response without a separate /auth/refresh.
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
        settings: user.settings,
      },
    },
  });
});