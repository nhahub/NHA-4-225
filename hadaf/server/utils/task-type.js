/**
 * Detects task type based on provided field inputs.
 *
 * Rules (Architecture.md §6.5):
 *   timeBlockStart AND timeBlockEnd  → 'scheduled'
 *   plannedDurationMinutes > 0       → 'flexible'
 *   neither                          → 'quick'
 *
 * @param {object} input
 * @param {string} [input.timeBlockStart] - HH:MM format
 * @param {string} [input.timeBlockEnd]   - HH:MM format
 * @param {number} [input.plannedDurationMinutes]
 * @returns {'scheduled'|'flexible'|'quick'}
 */
exports.detectTaskType = ({ timeBlockStart, timeBlockEnd, plannedDurationMinutes } = {}) => {
  const hasTimeBlock =
    timeBlockStart && timeBlockStart.trim() !== "" &&
    timeBlockEnd   && timeBlockEnd.trim()   !== "";

  if (hasTimeBlock) return "scheduled";

  if (plannedDurationMinutes && plannedDurationMinutes > 0) return "flexible";

  return "quick";
};

/**
 * Calculates the duration in minutes between two HH:MM time strings.
 * Handles overnight ranges (e.g. 23:00 → 01:00 = 120 min).
 *
 * @param {string} start - HH:MM format
 * @param {string} end   - HH:MM format
 * @returns {number} Duration in minutes (always positive)
 */
exports.calculateBlockDuration = (start, end) => {
  const [startH, startM] = start.split(":").map(Number);
  const [endH,   endM]   = end.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes   = endH   * 60 + endM;

  // Handle overnight wrap (e.g. 23:00 → 01:00)
  const duration = endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : 24 * 60 - startMinutes + endMinutes;

  return duration;
};
