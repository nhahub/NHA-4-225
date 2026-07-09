const mongoose = require("mongoose");
const { z } = require("zod");

const habitLogSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  value: { type: Number, default: 0 },
  isMvd: { type: Boolean, default: false },
  isRelapse: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Prevent duplicate log for same habit on same date
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

const logHabitSchema = z.object({
  habitId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Habit ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  value: z.number().nonnegative().default(0),
  isMvd: z.boolean().default(false),
  isRelapse: z.boolean().optional().default(false)
});

const HabitLog = mongoose.model("HabitLog", habitLogSchema);

HabitLog.logHabitSchema = logHabitSchema;

module.exports = HabitLog;
