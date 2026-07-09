const mongoose = require("mongoose");
const { z } = require("zod");

const analyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventType: { type: String, required: true },
  eventData: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
});

analyticsEventSchema.index({ userId: 1, createdAt: -1 });

const analyticsEventValidationSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
  eventType: z.string().min(1, "Event type is required"),
  eventData: z.record(z.any()).optional(),
  createdAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()).optional()
});

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

AnalyticsEvent.analyticsEventValidationSchema = analyticsEventValidationSchema;

module.exports = AnalyticsEvent;
