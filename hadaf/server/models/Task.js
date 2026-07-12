// Verified against Docs/Architecture.md §3.1 — 2026-07-10 (E0-3.1)
const mongoose = require("mongoose");
const zod = require("zod");
const z = zod.z || zod;

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', index: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['scheduled', 'flexible', 'quick'], default: 'quick' },
  priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium', index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  timeBlockStart: { type: String }, // Format: HH:MM
  timeBlockEnd: { type: String },
  plannedDurationMinutes: { type: Number },
  actualDurationMinutes: { type: Number },
  checklist: [{
    title: { type: String, required: true },
    is_completed: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['pending', 'completed', 'postponed'], default: 'pending' },
  pointsEarned: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

// Compound index for getByDate queries: userId + date are always paired, priority sorted in app-code
// NOTE: 'priority' is a string enum ('high'|'medium'|'low'). MongoDB sorts strings alphabetically,
// which produces medium > low > high — NOT the desired High→Medium→Low order.
// Do NOT use .sort({ priority: -1 }) in E2-3. Instead, sort in application code using:
//   const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };
//   tasks.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])

// Exported so the controller and (later) any client-side mirror logic agree on rank order.
const PRIORITY_RANK = { urgent: 4, high: 3, medium: 2, low: 1 };

taskSchema.index({ userId: 1, date: 1 }); // idx_tasks_user_date

// Compound index for goal-scoped task queries (Architecture.md idx_tasks_user_goal)
taskSchema.index({ userId: 1, goalId: 1 }); // idx_tasks_user_goal

const createTaskSchema = z.object({
  goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID").optional().or(z.literal('')),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(['scheduled', 'flexible', 'quick']).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).default('medium'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeBlockStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().or(z.literal('')),
  timeBlockEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().or(z.literal('')),
  plannedDurationMinutes: z.number().int().nonnegative().optional(),
  checklist: z.array(z.object({
    title: z.string().min(1, "Checklist item title is required"),
    is_completed: z.boolean().default(false)
  })).optional()
})
// Both-or-neither: providing only one time-block bound is invalid
.refine(
  (d) => (!!d.timeBlockStart === !!d.timeBlockEnd),
  { message: "timeBlockStart and timeBlockEnd must both be provided or both omitted", path: ["timeBlockStart"] }
);

const completeTaskSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Task ID"),
  actualDurationMinutes: z.number().int().nonnegative().optional()
});

const rescheduleTaskSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Task ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeBlockStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().or(z.literal('')),
  timeBlockEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().or(z.literal('')),
})
// Both-or-neither: providing only one time-block bound is invalid
.refine(
  (d) => (!!d.timeBlockStart === !!d.timeBlockEnd),
  { message: "timeBlockStart and timeBlockEnd must both be provided or both omitted", path: ["timeBlockStart"] }
);

const Task = mongoose.model("Task", taskSchema);

Task.PRIORITY_RANK = PRIORITY_RANK;
Task.createTaskSchema = createTaskSchema;
Task.completeTaskSchema = completeTaskSchema;
Task.rescheduleTaskSchema = rescheduleTaskSchema;

module.exports = Task;
