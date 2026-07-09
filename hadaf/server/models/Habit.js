const mongoose = require("mongoose");
const { z } = require("zod");

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['education_work', 'family', 'health', 'religion_spirituality', 'other'], 
    required: true 
  },
  type: { type: String, enum: ['boolean', 'counter', 'quit'], default: 'boolean' },
  frequency: {
    type: { type: String, default: "daily" } // Frequency config (e.g. daily, weekly)
  },
  targetValue: { type: Number },
  mvdValue: { type: Number },
  mvdDescription: { type: String },
  isSpiritual: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

const createHabitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(['education_work', 'family', 'health', 'religion_spirituality', 'other']),
  type: z.enum(['boolean', 'counter', 'quit']).default('boolean'),
  frequency: z.object({
    type: z.string().default("daily")
  }).default({ type: "daily" }),
  targetValue: z.number().nonnegative().optional(),
  mvdValue: z.number().nonnegative().optional(),
  mvdDescription: z.string().optional(),
  isSpiritual: z.boolean().default(false)
});

const Habit = mongoose.model("Habit", habitSchema);

Habit.createHabitSchema = createHabitSchema;

module.exports = Habit;
