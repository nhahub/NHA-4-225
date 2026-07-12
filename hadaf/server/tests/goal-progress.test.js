const {
  calculateGoalPointsProgress,
  calculateMilestoneProgress,
  getTotalWeeks,
  getCurrentWeek,
  calculateGoalHealth,
  calculateWeeklyExecutionScore,
} = require("../utils/goal-progress");

describe("Goal Progress Utility Tests", () => {
  describe("calculateGoalPointsProgress", () => {
    test("should return 0 when the goal has no linked tasks", () => {
      expect(calculateGoalPointsProgress(100, 0, 0, 0, false)).toBe(0);
    });

    test("should compute earned/target percentage when tasks carry points", () => {
      expect(calculateGoalPointsProgress(100, 50, 2, 1, true)).toBe(50);
      expect(calculateGoalPointsProgress(40, 30, 3, 2, true)).toBe(75);
    });

    test("should cap progress at 100 even if earned exceeds target", () => {
      expect(calculateGoalPointsProgress(50, 80, 2, 2, true)).toBe(100);
    });

    test("should fall back to completed/total task ratio for legacy tasks with no points", () => {
      expect(calculateGoalPointsProgress(100, 0, 10, 5, false)).toBe(50);
      expect(calculateGoalPointsProgress(100, 0, 4, 3, false)).toBe(75);
    });

    test("should round progress to the nearest integer", () => {
      expect(calculateGoalPointsProgress(3, 1, 1, 0, true)).toBe(33);
    });
  });

  describe("calculateMilestoneProgress", () => {
    test("should return 0 when the milestone has no linked tasks", () => {
      expect(calculateMilestoneProgress(0, 0, 0, 0)).toBe(0);
    });

    test("should compute earned/planned percentage when tasks carry points", () => {
      expect(calculateMilestoneProgress(20, 10, 2, 1)).toBe(50);
    });

    test("should cap progress at 100", () => {
      expect(calculateMilestoneProgress(10, 25, 2, 2)).toBe(100);
    });

    test("should fall back to completed/total ratio when no points are planned", () => {
      expect(calculateMilestoneProgress(0, 0, 4, 1)).toBe(25);
    });
  });

  describe("getTotalWeeks", () => {
    test("should derive 12 weeks from an 84-day cycle", () => {
      expect(getTotalWeeks("2026-07-01", "2026-09-23")).toBe(12);
    });

    test("should derive shorter/longer cycles from their date range", () => {
      expect(getTotalWeeks("2026-07-01", "2026-07-29")).toBe(4);
      expect(getTotalWeeks("2026-01-01", "2026-12-31")).toBe(52);
    });

    test("should never return less than 1 week", () => {
      expect(getTotalWeeks("2026-07-01", "2026-07-01")).toBe(1);
    });
  });

  describe("getCurrentWeek", () => {
    test("should return week 1 if today is before or equal to cycleStart", () => {
      expect(getCurrentWeek("2026-07-10", "2026-07-09")).toBe(1);
      expect(getCurrentWeek("2026-07-10", "2026-07-10")).toBe(1);
    });

    test("should calculate elapsed week correctly within cycle boundaries", () => {
      expect(getCurrentWeek("2026-07-01", "2026-07-07")).toBe(1);
      expect(getCurrentWeek("2026-07-01", "2026-07-08")).toBe(2);
      expect(getCurrentWeek("2026-07-01", "2026-07-15")).toBe(3);
    });

    test("should cap week count at the cycle's total weeks", () => {
      expect(getCurrentWeek("2026-07-01", "2026-10-01", 12)).toBe(12);
      expect(getCurrentWeek("2026-07-01", "2026-08-01", 4)).toBe(4);
    });
  });

  describe("calculateGoalHealth", () => {
    test("should return green if expected progress is 0 or actualProgress is null", () => {
      expect(calculateGoalHealth(null, 5)).toBe("green");
      expect(calculateGoalHealth(50, 0)).toBe("green");
    });

    test("should correctly determine health status based on progress ratio", () => {
      // expected progress for week 6 (of 12 total weeks) is 50%
      const currentWeek = 6;
      const totalWeeks = 12;

      // Actual 45% / Expected 50% = 0.90 -> green (>= 85%)
      expect(calculateGoalHealth(45, currentWeek, totalWeeks)).toBe("green");

      // Actual 36% / Expected 50% = 0.72 -> yellow (>= 70%)
      expect(calculateGoalHealth(36, currentWeek, totalWeeks)).toBe("yellow");

      // Actual 26% / Expected 50% = 0.52 -> orange (>= 50%)
      expect(calculateGoalHealth(26, currentWeek, totalWeeks)).toBe("orange");

      // Actual 20% / Expected 50% = 0.40 -> red (< 50%)
      expect(calculateGoalHealth(20, currentWeek, totalWeeks)).toBe("red");
    });
  });

  describe("calculateWeeklyExecutionScore", () => {
    test("should return 100 if total count is 0", () => {
      expect(calculateWeeklyExecutionScore(0, 0)).toBe(100);
    });

    test("should return correct percentage score", () => {
      expect(calculateWeeklyExecutionScore(3, 4)).toBe(75);
      expect(calculateWeeklyExecutionScore(1, 3)).toBe(33);
      expect(calculateWeeklyExecutionScore(5, 5)).toBe(100);
    });
  });
});
