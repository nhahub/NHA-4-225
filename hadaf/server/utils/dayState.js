/**
 * Calculates the day state classification based on points earned vs target.
 *
 * @param {number} points 
 * @param {number} target 
 * @returns {'legendary'|'amazing'|'perfect'|'good_enough'|'low'}
 */
exports.calculateDayState = (points, target) => {
  if (target === 0) {
    return points > 0 ? 'legendary' : 'good_enough';
  }

  const ratio = points / target;

  if (ratio >= 1.5) return 'legendary';
  if (ratio >= 1.2) return 'amazing';
  if (ratio >= 1.0) return 'perfect';
  if (ratio >= 0.5) return 'good_enough';
  return 'low';
};

/**
 * Calculates the adaptive daily target based on the 7-day moving average.
 *
 * @param {number[]} recentDailyPoints Array of points from the last 7 days (or fewer)
 * @param {'work'|'light'|'off'} dayType 
 * @returns {number}
 */
exports.calculateAdaptiveDailyTarget = (recentDailyPoints, dayType) => {
  if (!recentDailyPoints || recentDailyPoints.length === 0) {
    return 0; // Or a baseline minimum, but logic dictates 0 for now
  }

  const sum = recentDailyPoints.reduce((acc, p) => acc + (p || 0), 0);
  const avg = sum / recentDailyPoints.length;

  // TODO (Product Sign-off): Multipliers for adaptive targets on light/off days are assumed.
  // FR45 says target is based on 7-day average, but doesn't mention scaling it by day type.
  let multiplier = 1.0;
  if (dayType === 'light') multiplier = 0.5;
  if (dayType === 'off') multiplier = 0.2;

  return Math.max(1, Math.ceil(avg * multiplier)); // Ensure target is at least 1 if avg > 0
};
