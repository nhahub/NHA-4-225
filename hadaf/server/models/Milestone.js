// Verified against Docs/Architecture.md §3.1 — 2026-07-10 (E0-3.1)
const mongoose = require("mongoose");
const zod = require("zod");
const z = zod.z || zod;

const milestoneSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
  title: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  sort_order: { type: Number, default: 0 },
  is_completed: { type: Boolean, default: false },
  completed_at: { type: Date }
}, { timestamps: true });

// Index for ordering milestones within a specific goal
milestoneSchema.index({ goalId: 1, sort_order: 1 });

const optionalDateField = z.preprocess((arg) => {
  if (arg === undefined || arg === null || arg === "") return undefined;
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date().optional());

const milestoneValidationSchema = z.object({
  goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID"),
  title: z.string().min(1, "Title is required"),
  startDate: optionalDateField,
  endDate: optionalDateField,
  sort_order: z.number().int().nonnegative().default(0),
  is_completed: z.boolean().default(false),
  completed_at: optionalDateField
});

const Milestone = mongoose.model("Milestone", milestoneSchema);

Milestone.milestoneValidationSchema = milestoneValidationSchema;

module.exports = Milestone;
