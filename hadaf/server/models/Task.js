const mongoose = require("mongoose");
const { z } = require("zod");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', index: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['scheduled', 'flexible', 'quick'], default: 'quick' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium', index: true },
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

// Index for query sorting: scheduled by priority + date
taskSchema.index({ userId: 1, date: 1, priority: -1 });

const createTaskSchema = z.object({
  goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID").optional().or(z.literal('')),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(['scheduled', 'flexible', 'quick']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeBlockStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().or(z.literal('')),
  timeBlockEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().or(z.literal('')),
  plannedDurationMinutes: z.number().int().nonnegative().optional(),
  checklist: z.array(z.object({
    title: z.string().min(1, "Checklist item title is required"),
    is_completed: z.boolean().default(false)
  })).optional()
});

const completeTaskSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Task ID"),
  actualDurationMinutes: z.number().int().nonnegative().optional()
});

const Task = mongoose.model("Task", taskSchema);

Task.createTaskSchema = createTaskSchema;
Task.completeTaskSchema = completeTaskSchema;

module.exports = Task;
