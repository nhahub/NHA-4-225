/**
 * Calculates hybrid progress based on tasks and milestones.
 * Formula: (tasksProgress * 60%) + (milestonesProgress * 40%)
 * If only tasks or only milestones exist, that metric takes 100% weight.
 * If neither exists, returns null (indicating "Manual" status per PRD).
 *
 * @param {number} tasksCount - Total tasks linked to goal
 * @param {number} completedTasksCount - Completed tasks linked to goal
 * @param {number} milestonesCount - Total milestones in goal
 * @param {number} completedMilestonesCount - Completed milestones in goal
 * @returns {number|null} Progress percentage capped at 100 (rounded) or null
 */
exports.calculateHybridProgress = (
  tasksCount = 0,
  completedTasksCount = 0,
  milestonesCount = 0,
  completedMilestonesCount = 0
) => {
  const hasTasks = tasksCount > 0;
  const hasMilestones = milestonesCount > 0;

  if (!hasTasks && !hasMilestones) return null;

  const tasksProgress = hasTasks ? (completedTasksCount / tasksCount) * 100 : 0;
  const milestonesProgress = hasMilestones ? (completedMilestonesCount / milestonesCount) * 100 : 0;

  if (hasTasks && !hasMilestones) {
    return Math.round(tasksProgress);
  }

  if (hasMilestones && !hasTasks) {
    return Math.round(milestonesProgress);
  }

  // Both exist: apply hybrid weight (60% tasks + 40% milestones)
  const hybrid = tasksProgress * 0.6 + milestonesProgress * 0.4;
  return Math.round(hybrid);
};

/**
 * Calculates current week number (1-12) of the goal cycle.
 *
 * @param {Date|string} cycleStart
 * @param {Date|string} today
 * @returns {number} Week number (1-12)
 */
exports.getCurrentWeek = (cycleStart, today = new Date()) => {
  const start = new Date(cycleStart);
  const now = new Date(today);

  start.setUTCHours(0, 0, 0, 0);
  now.setUTCHours(0, 0, 0, 0);

  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1;

  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(12, week);
};

/**
 * Determines goal health based on actual progress vs expected progress.
 * Expected progress is linear: (currentWeek / totalWeeks) * 100.
 * Health boundaries: actual/expected ratio.
 * >= 85% -> green (🟢)
 * >= 70% -> yellow (🟡)
 * >= 50% -> orange (🟠)
 * < 50% -> red (🔴)
 *
 * @param {number|null} actualProgress - Current progress percentage (0-100) or null
 * @param {number} currentWeek - Current week of the cycle (1-12)
 * @param {number} totalWeeks - Total weeks in cycle (default 12)
 * @returns {string} Health state ('green' | 'yellow' | 'orange' | 'red')
 */
exports.calculateGoalHealth = (actualProgress, currentWeek, totalWeeks = 12) => {
  // If progress is null (manual/new goal) or no weeks have elapsed, default to green
  if (actualProgress === null || currentWeek <= 0) return "green";

  const expectedProgress = (currentWeek / totalWeeks) * 100;
  if (expectedProgress <= 0) return "green";

  const ratio = actualProgress / expectedProgress;

  if (ratio >= 0.85) return "green";
  if (ratio >= 0.70) return "yellow";
  if (ratio >= 0.50) return "orange";
  return "red";
};

/**
 * Calculates the weekly execution score (FR6.2).
 * Returns rounded percent of completed units over total units.
 * Defaults to 100 if no units are planned.
 *
 * @param {number} completedCount
 * @param {number} totalCount
 * @returns {number} Execution score (0-100)
 */
exports.calculateWeeklyExecutionScore = (completedCount = 0, totalCount = 0) => {
  if (totalCount <= 0) return 100;
  return Math.round((completedCount / totalCount) * 100);
};
