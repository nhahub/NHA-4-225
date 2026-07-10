// Verified against Docs/Architecture.md §3.1 — 2026-07-10 (E0-3.1)
const mongoose = require("mongoose");
const zod = require("zod");
const z = zod.z || zod;

const dailySummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  dayType: { type: String, enum: ['work', 'light', 'off'], default: 'work' },
  tasksCompleted: { type: Number, default: 0 },
  habitsCompleted: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  dailyTarget: { type: Number, default: 0 },
  dayState: { 
    type: String, 
    enum: ['legendary', 'amazing', 'perfect', 'good_enough', 'low'] 
  },
  summaryShown: { type: Boolean, default: false }
}, { timestamps: true });

dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

const dailySummaryValidationSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  dayType: z.enum(['work', 'light', 'off']).default('work'),
  tasksCompleted: z.number().int().nonnegative().default(0),
  habitsCompleted: z.number().int().nonnegative().default(0),
  pointsEarned: z.number().nonnegative().default(0),
  dailyTarget: z.number().nonnegative().default(0),
  dayState: z.enum(['legendary', 'amazing', 'perfect', 'good_enough', 'low']).optional(),
  summaryShown: z.boolean().default(false)
});

const DailySummary = mongoose.model("DailySummary", dailySummarySchema);

DailySummary.dailySummaryValidationSchema = dailySummaryValidationSchema;

module.exports = DailySummary;
