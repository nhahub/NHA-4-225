/**
 * Resolves the logical date string (YYYY-MM-DD) for a given timestamp,
 * anchoring "today" to the user's configured day_start rather than midnight.
 *
 * For example, if day_start is "04:00", then any time between 00:00 and 03:59
 * logically belongs to the *previous* day.
 *
 * @param {Date} utcNow The current date/time
 * @param {string} dayStartStr The user's day_start setting (e.g. "04:00")
 * @returns {string} The logical date string in YYYY-MM-DD format
 */
exports.resolveLogicalDate = (utcNow, dayStartStr = "04:00") => {
  const [hours, minutes] = dayStartStr.split(":").map(Number);
  
  // Subtract the day_start offset from the current time.
  // This effectively shifts the "day boundary" back to midnight for calculation purposes.
  // E.g., if day_start is 4 hours, then 03:00 becomes -1 hour (previous day),
  // and 04:00 becomes 0 hours (current day).
  const offsetMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  const logicalTime = new Date(utcNow.getTime() - offsetMs);
  
  return logicalTime.toISOString().split("T")[0];
};

/**
 * Creates a Date range (start and end) for a given logical date string,
 * anchored to the user's day_start.
 * 
 * @param {string} logicalDateStr YYYY-MM-DD
 * @param {string} dayStartStr "HH:MM"
 * @returns {{ startOfDay: Date, endOfDay: Date }}
 */
exports.getLogicalDateRange = (logicalDateStr, dayStartStr = "04:00") => {
  const [hours, minutes] = dayStartStr.split(":").map(Number);
  
  const startOfDay = new Date(`${logicalDateStr}T00:00:00.000Z`);
  startOfDay.setUTCHours(startOfDay.getUTCHours() + hours, startOfDay.getUTCMinutes() + minutes, 0, 0);
  
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  
  return { startOfDay, endOfDay };
};
