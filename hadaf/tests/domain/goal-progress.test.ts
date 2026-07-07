import { describe, it, expect } from "vitest";
import {
  calculateHybridProgress,
  calculateGoalHealth,
  getCurrentWeek,
  calculateWeeklyExecutionScore
} from "../../src/domain/goal-progress";

describe("Goal Progress Calculations", () => {
  describe("calculateHybridProgress", () => {
    it("should return manual override if specified", () => {
      const result = calculateHybridProgress([], [], 85);
      expect(result).toBe(0.85);
    });

    it("should calculate based on 60% tasks and 40% milestones", () => {
      // 1 of 2 tasks completed (50% task progress)
      // 1 of 4 milestones completed (25% milestone progress)
      // expected: (0.5 * 0.6) + (0.25 * 0.4) = 0.3 + 0.1 = 0.4 (40%)
      const tasks = [{ status: "completed" }, { status: "pending" }];
      const milestones = [
        { isCompleted: true },
        { isCompleted: false },
        { isCompleted: false },
        { isCompleted: false }
      ];
      const result = calculateHybridProgress(tasks, milestones, null);
      expect(result).toBeCloseTo(0.4, 5);
    });

    it("should handle empty tasks or milestones", () => {
      expect(calculateHybridProgress([], [], null)).toBe(0);
    });
  });

  describe("calculateGoalHealth", () => {
    const cycleStart = new Date("2026-06-01T00:00:00Z");
    const cycleEnd = new Date(cycleStart.getTime() + 84 * 86400000); // exactly 12 weeks

    it("should return on_track if progress matches or exceeds time elapsed", () => {
      // Week 2 index (start of week 2), expected is ~2/12 = 16.6%
      // 30% progress is on track
      const now = new Date(cycleStart.getTime() + 10 * 86400000); // Day 10
      const health = calculateGoalHealth(0.3, cycleStart, cycleEnd, now);
      expect(health).toBe("on_track");
    });

    it("should downgrade health to needs_attention, behind, or at_risk if progress lags", () => {
      const now = new Date(cycleStart.getTime() + 42 * 86400000); // Day 42 (Week 7, expected ~58%)
      
      // Lags slightly, verify precise limits:
      // Let's verify precise limits:
      // expected = 7/12 = 0.5833
      // progress = 0.55 -> delta = -0.0333 -> on_track (>= -0.05)
      // progress = 0.50 -> delta = -0.0833 -> needs_attention (>= -0.2)
      // progress = 0.30 -> delta = -0.2833 -> behind (>= -0.4)
      // progress = 0.10 -> delta = -0.4833 -> at_risk
      expect(calculateGoalHealth(0.55, cycleStart, cycleEnd, now)).toBe("on_track");
      expect(calculateGoalHealth(0.50, cycleStart, cycleEnd, now)).toBe("needs_attention");
      expect(calculateGoalHealth(0.30, cycleStart, cycleEnd, now)).toBe("behind");
      expect(calculateGoalHealth(0.10, cycleStart, cycleEnd, now)).toBe("at_risk");
    });
  });

  describe("getCurrentWeek", () => {
    it("should return the correct week index", () => {
      const cycleStart = new Date("2026-06-01T00:00:00Z");
      const cycleEnd = new Date(cycleStart.getTime() + 84 * 86400000);
      const now = new Date(cycleStart.getTime() + 10 * 86400000); // Day 10 is week 2
      const result = getCurrentWeek(cycleStart, cycleEnd, now);
      expect(result).toBe(2);
    });
  });

  describe("calculateWeeklyExecutionScore", () => {
    it("should return 0 for empty goals list", () => {
      expect(calculateWeeklyExecutionScore([])).toBe(0);
    });

    it("should average progress of goals and return percent", () => {
      const goals = [
        { progress: 0.8 },
        { progress: 0.5 },
        { progress: 0.5 }
      ];
      // avg is (0.8 + 0.5 + 0.5) / 3 = 0.60
      expect(calculateWeeklyExecutionScore(goals)).toBe(60);
    });
  });
});

