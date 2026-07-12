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

const DAY_MS = 1000 * 60 * 60 * 24;

const dayDiff = (aStr, bStr) =>
  Math.round((new Date(`${bStr}T00:00:00.000Z`).getTime() - new Date(`${aStr}T00:00:00.000Z`).getTime()) / DAY_MS);

/**
 * Current streak of consecutive completed days ending at today (or yesterday,
 * so an unfinished "today" doesn't zero the streak prematurely).
 *
 * @param {string[]} sortedDateStrs unique YYYY-MM-DD strings, ascending
 * @param {string} todayStr logical today YYYY-MM-DD
 * @returns {number}
 */
exports.calculateCurrentStreak = (sortedDateStrs, todayStr) => {
  if (!sortedDateStrs || sortedDateStrs.length === 0) return 0;

  const last = sortedDateStrs[sortedDateStrs.length - 1];
  const gapToToday = dayDiff(last, todayStr);
  // Streak is alive only if the latest completion is today or yesterday.
  if (gapToToday < 0 || gapToToday > 1) return 0;

  let streak = 1;
  for (let i = sortedDateStrs.length - 1; i > 0; i--) {
    if (dayDiff(sortedDateStrs[i - 1], sortedDateStrs[i]) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Longest run of consecutive completed days anywhere in the list.
 *
 * @param {string[]} sortedDateStrs unique YYYY-MM-DD strings, ascending
 * @returns {number}
 */
exports.calculateLongestStreak = (sortedDateStrs) => {
  if (!sortedDateStrs || sortedDateStrs.length === 0) return 0;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDateStrs.length; i++) {
    if (dayDiff(sortedDateStrs[i - 1], sortedDateStrs[i]) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
};
