const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

exports.getSettings = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select("settings").lean();
  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: "UNKNOWN",
      error: "errors.unauthorized",
    });
  }
  res.status(200).json({ success: true, data: user.settings });
});

exports.updateSettings = catchAsync(async (req, res) => {
  const validation = User.updateSettingsSchema.safeParse(req.body);
  
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  // We want to merge the updated settings with existing settings
  // Construct dot notation object for mongoose to only update specific nested fields
  const setPayload = {};
  for (const [key, value] of Object.entries(validation.data)) {
    if (key === "notifications" && typeof value === "object") {
      for (const [notifKey, notifValue] of Object.entries(value)) {
        setPayload[`settings.notifications.${notifKey}`] = notifValue;
      }
    } else {
      setPayload[`settings.${key}`] = value;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: setPayload },
    { new: true, runValidators: true }
  ).select("settings").lean();

  res.status(200).json({
    success: true,
    data: updatedUser.settings
  });
});
