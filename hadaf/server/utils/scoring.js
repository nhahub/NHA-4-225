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

const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.4,
};

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

/**
 * Calculates the final points earned when a task is completed (E2-2 scoring).
 *
 * @param {object} input
 * @param {'scheduled'|'flexible'|'quick'} input.type               - Task type
 * @param {'easy'|'medium'|'hard'}         input.difficulty          - Task difficulty
 * @param {number}                          input.actualMinutes       - Actual time spent (required for non-quick tasks;
 *                                                                        undefined is treated as 0 — the controller must
 *                                                                        validate presence before calling this function)
 * @param {number}                          [input.plannedMinutes=0]  - Originally planned duration
 * @param {number}                          [input.streakDays=0]      - Consecutive days with ≥1 completed task.
 *                                                                        Bonus is LINEAR: 1 + (0.05 × n), capped at 1.5×.
 *                                                                        Cap is reached at exactly day 10.
 * @returns {number} Points earned (always ≥ 1)
 */
exports.calculateTaskPoints = ({
  type,
  difficulty = "medium",
  actualMinutes,
  plannedMinutes = 0,
  streakDays = 0,
}) => {
  // Quick tasks always earn exactly 2 points
  if (type === "quick") return QUICK_TASK_POINTS;

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1.0;

  // Defensive guard: undefined actualMinutes (e.g. client omitted it for non-quick task)
  // produces 0 here. The E2-2 controller must 400 before reaching this point for
  // scheduled/flexible tasks, so this is a last-resort NaN firewall, not primary validation.
  const safeActual = actualMinutes ?? 0;

  // Accuracy bonus: evaluated against the RAW actual, before the time cap is applied.
  // If we checked against effectiveActual (post-cap), a wildly inaccurate estimate (e.g.
  // planned=5min, actual=100min) would get capped to 15min and then appear "accurate"
  // (|15-5|=10 <= 15) — defeating the purpose of the bonus entirely.
  const accuracyBonus =
    plannedMinutes > 0 &&
    Math.abs(safeActual - plannedMinutes) <= ACCURACY_WINDOW_MINUTES
      ? ACCURACY_BONUS
      : 1.0;

  // Cap actual duration at 3× planned to prevent gaming (applied AFTER accuracy check)
  const effectiveActual = plannedMinutes > 0
    ? Math.min(safeActual, plannedMinutes * TIME_CAP_MULTIPLIER)
    : safeActual;

  // Streak bonus: linear +0.05 per consecutive day, hard-capped at ×1.5 (cap at day 10)
  // PRD: "×1.05 لكل يوم" = each day adds a flat 5% to the multiplier, not compounding
  const streakBonus = streakDays > 0
    ? Math.min(1 + STREAK_BONUS_PER_DAY * streakDays, STREAK_BONUS_CAP)
    : 1.0;

  const raw = (effectiveActual / 10) * difficultyMultiplier * accuracyBonus * streakBonus;
  return Math.max(1, Math.ceil(raw));
};

/**
 * Predicts points a task will earn before completion (live preview, E2-1).
 * Uses planned duration as the proxy for actual duration — no streak bonus applied.
 *
 * @param {object} input
 * @param {'scheduled'|'flexible'|'quick'} input.type
 * @param {'easy'|'medium'|'hard'}         input.difficulty
 * @param {number}                          [input.plannedMinutes=0]
 * @returns {number} Predicted points
 */
exports.predictTaskPoints = ({ type, difficulty = "medium", plannedMinutes = 0 }) => {
  if (type === "quick") return QUICK_TASK_POINTS;

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1.0;
  const raw = (plannedMinutes / 10) * difficultyMultiplier;
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
