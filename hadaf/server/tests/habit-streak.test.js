const { calculateDaysSinceRelapse } = require("../utils/habit-streak");

describe("calculateDaysSinceRelapse", () => {
  const MOCK_TODAY = "2026-07-10";

  test("relapsed today returns 0", () => {
    // If the last relapse was today, days since relapse is 0
    expect(calculateDaysSinceRelapse(MOCK_TODAY, "2026-01-01", MOCK_TODAY)).toBe(0);
  });

  test("relapsed yesterday returns 1", () => {
    expect(calculateDaysSinceRelapse("2026-07-09", "2026-01-01", MOCK_TODAY)).toBe(1);
  });

  test("relapsed a week ago returns 7", () => {
    expect(calculateDaysSinceRelapse("2026-07-03", "2026-01-01", MOCK_TODAY)).toBe(7);
  });

  test("never relapsed - falls back to creation date", () => {
    // Habit created 5 days ago, never relapsed -> streak is 5
    expect(calculateDaysSinceRelapse(null, "2026-07-05", MOCK_TODAY)).toBe(5);
  });

  test("never relapsed, created today - returns 0", () => {
    expect(calculateDaysSinceRelapse(null, MOCK_TODAY, MOCK_TODAY)).toBe(0);
  });

  test("handles future relapse date safely (e.g. client drift)", () => {
    // If somehow a log exists in the future relative to today, clamp to 0
    expect(calculateDaysSinceRelapse("2026-07-15", "2026-01-01", MOCK_TODAY)).toBe(0);
  });
});
