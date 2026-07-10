const {
  calculateHybridProgress,
  getCurrentWeek,
  calculateGoalHealth,
  calculateWeeklyExecutionScore,
} = require("../utils/goal-progress");

describe("Goal Progress Utility Tests", () => {
  describe("calculateHybridProgress", () => {
    test("should return null (manual status) when there are no tasks and no milestones", () => {
      expect(calculateHybridProgress(0, 0, 0, 0)).toBe(null);
    });

    test("should use 100% weight of tasks when no milestones exist", () => {
      expect(calculateHybridProgress(10, 5, 0, 0)).toBe(50);
      expect(calculateHybridProgress(4, 3, 0, 0)).toBe(75);
    });

    test("should use 100% weight of milestones when no tasks exist", () => {
      expect(calculateHybridProgress(0, 0, 5, 2)).toBe(40);
      expect(calculateHybridProgress(0, 0, 3, 3)).toBe(100);
    });

    test("should apply 60% task + 40% milestone weight when both exist", () => {
      expect(calculateHybridProgress(10, 5, 5, 1)).toBe(38);
    });

    test("should round progress to the nearest integer", () => {
      expect(calculateHybridProgress(3, 1, 3, 1)).toBe(33);
    });
  });

  describe("getCurrentWeek", () => {
    test("should return week 1 if today is before or equal to cycleStart", () => {
      expect(getCurrentWeek("2026-07-10", "2026-07-09")).toBe(1);
      expect(getCurrentWeek("2026-07-10", "2026-07-10")).toBe(1);
    });

    test("should calculate elapsed week correctly within 12-week boundaries", () => {
      expect(getCurrentWeek("2026-07-01", "2026-07-07")).toBe(1);
      expect(getCurrentWeek("2026-07-01", "2026-07-08")).toBe(2);
      expect(getCurrentWeek("2026-07-01", "2026-07-15")).toBe(3);
    });

    test("should cap week count at 12", () => {
      expect(getCurrentWeek("2026-07-01", "2026-10-01")).toBe(12);
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
