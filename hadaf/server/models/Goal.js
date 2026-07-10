const mongoose = require("mongoose");
const zod = require("zod");
const z = zod.z || zod;

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['education_work', 'family', 'health', 'religion_spirituality', 'other'], 
    required: true 
  },
  customCategory: { type: String },
  measure: { type: String, required: true },
  relevance: { type: String },
  cycleStart: { type: Date, required: true },
  cycleEnd: { type: Date, required: true },
  manualProgress: { type: Number },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'archived', 'replaced'], 
    default: 'active',
    index: true
  },
  deletionReason: { type: String }
}, { timestamps: true });

// Composite index for fast goal list queries
goalSchema.index({ userId: 1, status: 1 });

// Cascade delete milestones and nullify tasks on goal delete
goalSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await Promise.all([
      mongoose.model('Milestone').deleteMany({ goalId: this._id }),
      mongoose.model('Task').updateMany({ goalId: this._id }, { $unset: { goalId: "" } })
    ]);
    next();
  } catch (err) {
    next(err);
  }
});

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(['education_work', 'family', 'health', 'religion_spirituality', 'other']),
  customCategory: z.string().optional(),
  measure: z.string().min(1, "Measure is required"),
  relevance: z.string().optional(),
  cycleStart: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()),
  cycleEnd: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()),
  milestones: z.array(z.string().min(1)).optional()
}).refine((data) => {
  const start = new Date(data.cycleStart);
  const end = new Date(data.cycleEnd);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diffDays === 84;
}, {
  message: "Goal cycle must be exactly 12 weeks (84 days)",
  path: ["cycleEnd"]
}).refine((data) => {
  if (data.category === 'other') {
    return !!data.customCategory && data.customCategory.trim().length > 0;
  }
  return true;
}, {
  message: "Custom category is required when category is 'other'",
  path: ["customCategory"]
});

const softDeleteGoalSchema = z.object({
  goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID"),
  reason: z.string().min(1, "Deletion reason is required")
});

const updateGoalSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  category: z.enum(['education_work', 'family', 'health', 'religion_spirituality', 'other']).optional(),
  customCategory: z.string().optional(),
  measure: z.string().min(1, "Measure is required").optional(),
  relevance: z.string().optional(),
});

const replaceGoalSchema = createGoalSchema.extend({
  reason: z.string().min(1, "Replacement reason is required")
});

const Goal = mongoose.model("Goal", goalSchema);

Goal.createGoalSchema = createGoalSchema;
Goal.softDeleteGoalSchema = softDeleteGoalSchema;
Goal.updateGoalSchema = updateGoalSchema;
Goal.replaceGoalSchema = replaceGoalSchema;

module.exports = Goal;
