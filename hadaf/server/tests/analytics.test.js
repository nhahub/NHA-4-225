const {
  addDays,
  daysBetweenInclusive,
  resolveRange,
  fillDailyTrend,
  bucketProductiveHours,
  bucketWeekdays,
  computeAccuracy,
  computeTotals,
} = require("../utils/analytics");
const {
  calculateCurrentStreak,
  calculateLongestStreak,
} = require("../utils/habit-streak");

describe("analytics utils", () => {
  describe("addDays / daysBetweenInclusive", () => {
    test("addDays crosses month boundaries", () => {
      expect(addDays("2026-06-30", 1)).toBe("2026-07-01");
      expect(addDays("2026-07-01", -1)).toBe("2026-06-30");
    });

    test("daysBetweenInclusive counts both endpoints", () => {
      expect(daysBetweenInclusive("2026-07-01", "2026-07-01")).toBe(1);
      expect(daysBetweenInclusive("2026-07-01", "2026-07-07")).toBe(7);
    });
  });

  describe("resolveRange", () => {
    test("defaults to last 30 days ending today", () => {
      const { from, to } = resolveRange({}, "2026-07-12");
      expect(to).toBe("2026-07-12");
      expect(from).toBe("2026-06-13");
      expect(daysBetweenInclusive(from, to)).toBe(30);
    });

    test("respects explicit from/to", () => {
      expect(resolveRange({ from: "2026-07-01", to: "2026-07-07" }, "2026-07-12")).toEqual({
        from: "2026-07-01",
        to: "2026-07-07",
      });
    });
  });

  describe("fillDailyTrend", () => {
    test("gap-fills missing days with zeros and null dayState", () => {
      const summaries = [
        { date: "2026-07-10", pointsEarned: 20, tasksCompleted: 2, habitsCompleted: 1, dayState: "perfect" },
      ];
      const trend = fillDailyTrend(summaries, "2026-07-09", "2026-07-11");
      expect(trend).toHaveLength(3);
      expect(trend[0]).toEqual({ date: "2026-07-09", points: 0, tasksCompleted: 0, habitsCompleted: 0, dayState: null });
      expect(trend[1].points).toBe(20);
      expect(trend[1].dayState).toBe("perfect");
      expect(trend[2].date).toBe("2026-07-11");
    });
  });

  describe("bucketProductiveHours", () => {
    test("buckets by timeBlockStart hour and counts unscheduled separately", () => {
      const tasks = [
        { timeBlockStart: "09:00", actualDurationMinutes: 50 },
        { timeBlockStart: "09:30", plannedDurationMinutes: 30 },
        { timeBlockStart: "14:00", actualDurationMinutes: 60 },
        { timeBlockStart: null },
        {},
      ];
      const { productiveHours, unscheduledCompleted } = bucketProductiveHours(tasks);
      expect(unscheduledCompleted).toBe(2);
      expect(productiveHours).toEqual([
        { hour: 9, tasksCompleted: 2, minutes: 80 },
        { hour: 14, tasksCompleted: 1, minutes: 60 },
      ]);
    });
  });

  describe("bucketWeekdays", () => {
    test("aggregates a dense trend into 7 weekday buckets", () => {
      // 2026-07-05 is a Sunday
      const trend = fillDailyTrend(
        [
          { date: "2026-07-05", pointsEarned: 10, tasksCompleted: 1, habitsCompleted: 0, dayState: "low" },
          { date: "2026-07-12", pointsEarned: 30, tasksCompleted: 3, habitsCompleted: 0, dayState: "perfect" },
        ],
        "2026-07-05",
        "2026-07-12"
      );
      const weekdays = bucketWeekdays(trend);
      expect(weekdays).toHaveLength(7);
      const sunday = weekdays.find((w) => w.weekday === "sunday");
      expect(sunday.daysCounted).toBe(2);
      expect(sunday.points).toBe(40);
      expect(sunday.avgPoints).toBe(20);
      const monday = weekdays.find((w) => w.weekday === "monday");
      expect(monday.points).toBe(0);
      expect(monday.daysCounted).toBe(1);
    });
  });

  describe("computeAccuracy", () => {
    test("returns null rates on empty sample instead of NaN", () => {
      expect(computeAccuracy([])).toEqual({
        sampleSize: 0,
        plannedMinutes: 0,
        actualMinutes: 0,
        avgRatio: null,
        onTargetRate: null,
      });
    });

    test("computes avgRatio and onTargetRate over valid samples only", () => {
      const tasks = [
        { plannedDurationMinutes: 60, actualDurationMinutes: 60 }, // ratio 1.0, on target
        { plannedDurationMinutes: 60, actualDurationMinutes: 90 }, // ratio 1.5, off target
        { plannedDurationMinutes: 0, actualDurationMinutes: 10 }, // excluded
        { actualDurationMinutes: 10 }, // excluded
      ];
      const acc = computeAccuracy(tasks);
      expect(acc.sampleSize).toBe(2);
      expect(acc.plannedMinutes).toBe(120);
      expect(acc.actualMinutes).toBe(150);
      expect(acc.avgRatio).toBe(1.25);
      expect(acc.onTargetRate).toBe(0.5);
    });
  });

  describe("computeTotals", () => {
    test("sums trend, counts active days, finds best day", () => {
      const trend = [
        { date: "2026-07-10", points: 0, tasksCompleted: 0, habitsCompleted: 0 },
        { date: "2026-07-11", points: 25, tasksCompleted: 2, habitsCompleted: 1 },
        { date: "2026-07-12", points: 40, tasksCompleted: 3, habitsCompleted: 2 },
      ];
      const totals = computeTotals(trend);
      expect(totals.pointsEarned).toBe(65);
      expect(totals.activeDays).toBe(2);
      expect(totals.bestDay).toEqual({ date: "2026-07-12", points: 40 });
    });

    test("bestDay is null when no active days", () => {
      const totals = computeTotals([{ date: "2026-07-12", points: 0, tasksCompleted: 0, habitsCompleted: 0 }]);
      expect(totals.bestDay).toBeNull();
      expect(totals.activeDays).toBe(0);
    });
  });
});

describe("habit streak functions", () => {
  const TODAY = "2026-07-12";

  describe("calculateCurrentStreak", () => {
    test("empty list returns 0", () => {
      expect(calculateCurrentStreak([], TODAY)).toBe(0);
    });

    test("streak ending today counts consecutive run", () => {
      expect(calculateCurrentStreak(["2026-07-09", "2026-07-10", "2026-07-11", "2026-07-12"], TODAY)).toBe(4);
    });

    test("streak ending yesterday is still alive", () => {
      expect(calculateCurrentStreak(["2026-07-10", "2026-07-11"], TODAY)).toBe(2);
    });

    test("gap before today breaks the streak", () => {
      expect(calculateCurrentStreak(["2026-07-08", "2026-07-09"], TODAY)).toBe(0);
    });

    test("gap inside the run stops counting at the gap", () => {
      expect(calculateCurrentStreak(["2026-07-07", "2026-07-10", "2026-07-11", "2026-07-12"], TODAY)).toBe(3);
    });

    test("single log today returns 1", () => {
      expect(calculateCurrentStreak(["2026-07-12"], TODAY)).toBe(1);
    });
  });

  describe("calculateLongestStreak", () => {
    test("empty list returns 0", () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    test("finds the longest run anywhere in history", () => {
      expect(
        calculateLongestStreak(["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-07-10", "2026-07-11"])
      ).toBe(4);
    });

    test("non-consecutive days return 1", () => {
      expect(calculateLongestStreak(["2026-06-01", "2026-06-05", "2026-06-09"])).toBe(1);
    });
  });
});
