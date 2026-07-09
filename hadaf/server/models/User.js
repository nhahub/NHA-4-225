const mongoose = require("mongoose");
const { z } = require("zod");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String },
  avatarUrl: { type: String },
  passwordHash: { type: String, required: true },
  refreshToken: { type: String },
  refreshTokenExp: { type: Date },
  onboardingCompleted: { type: Boolean, default: false },
  settings: {
    work_hours_start: { type: String, default: "09:00" },
    work_hours_end: { type: String, default: "17:00" },
    day_start: { type: String, default: "04:00" },
    off_days: { type: [String], default: ["friday", "saturday"] },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    language: { type: String, enum: ["ar", "en"], default: "ar" },
    notifications: {
      time_block_reminder: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

const userSettingsValidationSchema = z.object({
  work_hours_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").default("09:00"),
  work_hours_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").default("17:00"),
  day_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").default("04:00"),
  off_days: z.array(z.string()).default(["friday", "saturday"]),
  theme: z.enum(["light", "dark", "system"]).default("light"),
  language: z.enum(["ar", "en"]).default("ar"),
  notifications: z.object({
    time_block_reminder: z.boolean().default(true)
  }).default({ time_block_reminder: true })
});

const userValidationSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  name: z.string().optional(),
  avatarUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  passwordHash: z.string().min(1, "Password hash is required"),
  refreshToken: z.string().optional(),
  refreshTokenExp: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()).optional(),
  onboardingCompleted: z.boolean().default(false),
  settings: userSettingsValidationSchema.default({})
});

const updateSettingsSchema = userSettingsValidationSchema.partial();

const User = mongoose.model("User", userSchema);

User.userValidationSchema = userValidationSchema;
User.updateSettingsSchema = updateSettingsSchema;

module.exports = User;