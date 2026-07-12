/**
 * Calculates goal progress from points earned on completed goal-linked tasks.
 * Progress = earned / targetPoints, capped at 100.
 *
 * Legacy fallback: if the goal has linked tasks but none of them carry point values
 * (pre-migration data), fall back to a simple completed/total task ratio so old goals
 * don't regress to 0%.
 *
 * @param {number} targetPoints - Goal's target points pool
 * @param {number} earnedPoints - Sum of goalPointsEarned across completed tasks
 * @param {number} tasksCount - Total tasks linked to goal (for legacy fallback)
 * @param {number} completedTasksCount - Completed tasks linked to goal (for legacy fallback)
 * @param {boolean} anyTaskHasPoints - Whether at least one linked task carries goalPointsPlanned
 * @returns {number} Progress percentage 0-100 (rounded)
 */
exports.calculateGoalPointsProgress = (
  targetPoints = 100,
  earnedPoints = 0,
  tasksCount = 0,
  completedTasksCount = 0,
  anyTaskHasPoints = false
) => {
  if (anyTaskHasPoints) {
    if (!targetPoints || targetPoints <= 0) return 0;
    return Math.min(100, Math.round((earnedPoints / targetPoints) * 100));
  }

  // Legacy fallback: no points recorded on any linked task
  if (tasksCount <= 0) return 0;
  return Math.min(100, Math.round((completedTasksCount / tasksCount) * 100));
};

/**
 * Calculates a single milestone's progress from its own linked tasks' points.
 * Falls back to completed/total ratio when tasks carry no point values.
 *
 * @param {number} plannedPoints - Sum of goalPointsPlanned across the milestone's tasks
 * @param {number} earnedPoints - Sum of goalPointsEarned across the milestone's completed tasks
 * @param {number} tasksCount - Total tasks linked to milestone
 * @param {number} completedTasksCount - Completed tasks linked to milestone
 * @returns {number} Progress percentage 0-100 (rounded)
 */
exports.calculateMilestoneProgress = (
  plannedPoints = 0,
  earnedPoints = 0,
  tasksCount = 0,
  completedTasksCount = 0
) => {
  if (tasksCount <= 0) return 0;
  if (plannedPoints > 0) {
    return Math.min(100, Math.round((earnedPoints / plannedPoints) * 100));
  }
  return Math.min(100, Math.round((completedTasksCount / tasksCount) * 100));
};

/**
 * Derives the total number of whole weeks in a goal's cycle from its start/end dates.
 *
 * @param {Date|string} cycleStart
 * @param {Date|string} cycleEnd
 * @returns {number} Total weeks (minimum 1)
 */
exports.getTotalWeeks = (cycleStart, cycleEnd) => {
  const start = new Date(cycleStart);
  const end = new Date(cycleEnd);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.round(diffDays / 7));
};

/**
 * Calculates current week number (1-totalWeeks) of the goal cycle.
 *
 * @param {Date|string} cycleStart
 * @param {Date|string} today
 * @param {number} totalWeeks - Total weeks in cycle (default 12)
 * @returns {number} Week number (1-totalWeeks)
 */
exports.getCurrentWeek = (cycleStart, today = new Date(), totalWeeks = 12) => {
  const start = new Date(cycleStart);
  const now = new Date(today);

  start.setUTCHours(0, 0, 0, 0);
  now.setUTCHours(0, 0, 0, 0);

  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1;

  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(totalWeeks, week);
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
 * @param {number} currentWeek - Current week of the cycle (1-totalWeeks)
 * @param {number} totalWeeks - Total weeks in cycle (default 12)
 * @returns {string} Health state ('green' | 'yellow' | 'orange' | 'red')
 */
exports.calculateGoalHealth = (actualProgress, currentWeek, totalWeeks = 12) => {
  // If progress is null (new goal with no tasks yet) or no weeks have elapsed, default to green
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
