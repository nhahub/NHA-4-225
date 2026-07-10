/**
 * Calculates the number of days since a user relapsed on a quit habit.
 * Falls back to the habit's creation date if no relapse has ever occurred.
 *
 * @param {string|null} lastRelapseDateStr YYYY-MM-DD of the last relapse (or null if none)
 * @param {string|Date} createdAt Habit creation date (to fallback if no relapse)
 * @param {string} [todayStr] YYYY-MM-DD of today (defaults to current UTC date)
 * @returns {number} Days since relapse (0 if relapsed today)
 */
exports.calculateDaysSinceRelapse = (lastRelapseDateStr, createdAt, todayStr) => {
  if (!todayStr) {
    todayStr = new Date().toISOString().split("T")[0];
  }

  // If no relapse, fallback to the date the habit was created (in YYYY-MM-DD)
  const startDateStr = lastRelapseDateStr 
    ? lastRelapseDateStr 
    : new Date(createdAt).toISOString().split("T")[0];

  const start = new Date(startDateStr);
  const today = new Date(todayStr);

  const diffTime = today.getTime() - start.getTime();
  
  // If the relapse date is somehow in the future (client drift/mocked), return 0
  if (diffTime < 0) return 0;

  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
