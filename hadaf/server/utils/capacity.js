/**
 * Capacity intelligence utilities for Epic E4.
 */

// FR55.3 assumes a lunch break is used to calculate capacity, but there's no setting.
// Hardcoded to 60 minutes for MVP per product assumptions.
const LUNCH_BREAK_MINUTES = 60;

/**
 * Parses an HH:MM time string into total integer minutes.
 * @param {string} timeStr "HH:MM"
 * @returns {number}
 */
exports.parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

/**
 * Calculates total capacity in minutes based on day type and work hours.
 * @param {string} workStart "HH:MM"
 * @param {string} workEnd "HH:MM"
 * @param {'work'|'light'|'off'} dayType 
 * @returns {number} Capacity in minutes
 */
exports.calculateDailyCapacity = (workStart, workEnd, dayType) => {
  if (dayType === "off") return 0;

  const startMins = exports.parseTimeToMinutes(workStart);
  let endMins = exports.parseTimeToMinutes(workEnd);
  
  // Handle overnight shifts if end is earlier than start
  if (endMins < startMins) {
    endMins += 24 * 60;
  }

  const rawMins = Math.max(0, endMins - startMins - LUNCH_BREAK_MINUTES);

  if (dayType === "light") {
    return Math.floor(rawMins * 0.50);
  }

  return Math.floor(rawMins * 0.80);
};

/**
 * Calculates the total planned time in minutes for an array of tasks.
 * Falls back to actualDurationMinutes if a task is completed but has no planned time.
 * @param {Array<Object>} tasks 
 * @returns {number} Total planned minutes
 */
exports.calculatePlannedTime = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return 0;

  return tasks.reduce((sum, task) => {
    let taskTime = task.plannedDurationMinutes;
    if (taskTime == null || taskTime === 0) {
      if (task.status === "completed" && task.actualDurationMinutes != null) {
        taskTime = task.actualDurationMinutes;
      } else {
        taskTime = 0;
      }
    }
    return sum + taskTime;
  }, 0);
};
