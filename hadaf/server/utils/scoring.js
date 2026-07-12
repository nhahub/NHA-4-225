/**
 * Scoring engine for task point calculations (Architecture.md §7, FR26).
 *
 * Task points formula:
 *   Math.ceil((actualMinutes / 10) × difficultyMultiplier × accuracyBonus × streakBonus)
 *
 * Special cases:
 *   - Quick tasks always = 2 points flat (no formula)
 *   - Actual duration is capped at 3× planned before applying the formula
 *
 * Multipliers:
 *   Difficulty: easy=1.0, medium=1.2, hard=1.4
 *   Accuracy:   ×1.15 if |actual − planned| ≤ 15 min
 *   Streak:     ×1.05 per consecutive day, capped at ×1.5
 */

const ACCURACY_BONUS = 1.15;
// Streak: each consecutive day adds +0.05 to the multiplier (linear), capped at ×1.5
// PRD (FR26): "×1.05 لكل يوم" = ×1.05 per day as a flat per-day addition.
// Linear hits cap cleanly at day 10 (1 + 0.05×10 = 1.5). Exponential (1.05^n) hits ~day 9
// messily and doesn't match the intended round cap behavior.
const STREAK_BONUS_PER_DAY = 0.05; // added per consecutive day
const STREAK_BONUS_CAP = 1.5;
const QUICK_TASK_POINTS = 2;
const TIME_CAP_MULTIPLIER = 3;
const ACCURACY_WINDOW_MINUTES = 15;
// Points awarded when a goal milestone is flipped to completed (E1-2, FR6.1).
// Rolled into DailySummary.pointsEarned by the dailySummary controller.
const MILESTONE_BONUS_POINTS = 10;

const getPriorityMultiplier = (priority) => {
  switch (priority) {
    case 'urgent': return 2.0;
    case 'high': return 1.7;
    case 'medium': return 1.3;
    case 'low': return 1.0;
    default: return 1.0;
  }
};

/**
 * Calculates the final points earned when a task is completed (E2-2 scoring).
 *
 * @param {object} input
 * @param {'scheduled'|'flexible'|'quick'} input.type               - Task type
 * @param {number}                          input.actualMinutes       - Actual time spent
 * @param {number}                          [input.plannedMinutes=0]  - Originally planned duration
 * @param {string}                          [input.priority='medium'] - Priority level
 * @param {number}                          [input.streakDays=0]      - Consecutive days with >=1 completed task.
 * @returns {number} Points earned (always >= 1)
 */
exports.calculateTaskPoints = ({
  type,
  actualMinutes,
  plannedMinutes = 0,
  priority = 'medium',
  streakDays = 0,
}) => {
  if (type === "quick") return QUICK_TASK_POINTS;

  const safeActual = actualMinutes ?? plannedMinutes ?? 0;
  
  // Base points are locked to the PLANNED duration to prevent gaming.
  // If no planned duration exists (ad-hoc task), we use the actual time.
  const referenceTime = plannedMinutes > 0 ? plannedMinutes : safeActual;
  const basePoints = Math.max(1, Math.ceil(referenceTime / 10));
  const priorityMultiplier = getPriorityMultiplier(priority);

  let accuracyBonus = 1.0;
  if (plannedMinutes > 0) {
    const diff = plannedMinutes - safeActual;
    if (diff > ACCURACY_WINDOW_MINUTES) {
      accuracyBonus = 1.5; // Early finish
    } else if (Math.abs(safeActual - plannedMinutes) <= ACCURACY_WINDOW_MINUTES) {
      accuracyBonus = 1.2; // Time accuracy
    }
  }

  // Streak bonus: x1.1 per day, capped at 1.5
  const streakBonus = streakDays > 0
    ? Math.min(1 + 0.1 * streakDays, STREAK_BONUS_CAP)
    : 1.0;

  const baseWithPriority = Math.ceil(basePoints * priorityMultiplier);
  
  let accuracyPoints = 0;
  if (accuracyBonus > 1.0) {
      accuracyPoints = Math.max(1, Math.ceil(basePoints * priorityMultiplier * accuracyBonus) - baseWithPriority);
  }

  let streakPoints = 0;
  if (streakBonus > 1.0) {
      const rawWithStreak = basePoints * priorityMultiplier * accuracyBonus * streakBonus;
      streakPoints = Math.max(1, Math.ceil(rawWithStreak) - (baseWithPriority + accuracyPoints));
  }

  return baseWithPriority + accuracyPoints + streakPoints;
};

/**
 * Predicts points a task will earn before completion (live preview, E2-1).
 *
 * @param {object} input
 * @param {'scheduled'|'flexible'|'quick'} input.type
 * @param {number}                          [input.plannedMinutes=0]
 * @param {string}                          [input.priority='medium']
 * @returns {number} Predicted points
 */
exports.predictTaskPoints = ({ type, plannedMinutes = 0, priority = 'medium' }) => {
  if (type === "quick") return QUICK_TASK_POINTS;

  const basePoints = Math.max(1, Math.ceil((plannedMinutes || 0) / 10));
  const priorityMultiplier = getPriorityMultiplier(priority);
  const raw = basePoints * priorityMultiplier;
  
  return Math.max(1, Math.ceil(raw));
};

// ─── Habit Scoring (E3) ────────────────────────────────────────────────────────

/**
 * Calculates points for boolean/quit habits.
 * @param {'boolean'|'quit'} type 
 * @param {boolean} isMvd 
 * @returns {number} Points earned
 */
exports.calculateHabitPoints = (type, isMvd) => {
  if (type === 'quit') return 0;
  if (isMvd) return 3;
  return 5;
};

/**
 * Calculates points for counter habits.
 * @param {number} value Logged value
 * @param {number} target Target value
 * @param {number} [mvd=0] Minimum viable dose value
 * @returns {number} Points earned
 */
exports.calculateCounterHabitPoints = (value, target, mvd = 0) => {
  if (value >= target) return 5;
  if (mvd > 0 && value >= mvd && value < target) return 4;
  if (value > 0 && value < mvd) return 3;
  return 0;
};

// Exposed for the DailySummary controller (E1-2). Single source of truth —
// before this move it was duplicated in dailySummaryController.js, which
// violated the SRP rule that controllers must not own scoring constants.
exports.MILESTONE_BONUS_POINTS = MILESTONE_BONUS_POINTS;
