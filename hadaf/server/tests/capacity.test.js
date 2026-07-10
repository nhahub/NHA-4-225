const { parseTimeToMinutes, calculateDailyCapacity, calculatePlannedTime } = require("../utils/capacity");

describe("capacity utilities", () => {
  describe("parseTimeToMinutes", () => {
    it("parses valid times correctly", () => {
      expect(parseTimeToMinutes("09:00")).toBe(540);
      expect(parseTimeToMinutes("17:30")).toBe(1050);
      expect(parseTimeToMinutes("00:15")).toBe(15);
    });

    it("handles invalid or missing inputs gracefully", () => {
      expect(parseTimeToMinutes("")).toBe(0);
      expect(parseTimeToMinutes(null)).toBe(0);
      expect(parseTimeToMinutes("invalid")).toBe(0);
    });
  });

  describe("calculateDailyCapacity", () => {
    // 09:00 to 17:00 is 8 hours (480 mins)
    // 480 - 60 (lunch) = 420 mins raw
    it("computes 80% capacity for a work day", () => {
      expect(calculateDailyCapacity("09:00", "17:00", "work")).toBe(Math.floor(420 * 0.8)); // 336
    });

    it("computes 50% capacity for a light day", () => {
      expect(calculateDailyCapacity("09:00", "17:00", "light")).toBe(Math.floor(420 * 0.5)); // 210
    });

    it("explicitly returns 0 for an off day", () => {
      expect(calculateDailyCapacity("09:00", "17:00", "off")).toBe(0);
    });

    it("handles overnight shifts correctly", () => {
      // 22:00 to 06:00 is 8 hours (480 mins)
      // 480 - 60 = 420 mins raw
      expect(calculateDailyCapacity("22:00", "06:00", "work")).toBe(336);
    });

    it("clamps to 0 if raw minutes is negative (e.g. very short window)", () => {
      // 09:00 to 09:30 is 30 mins
      // 30 - 60 (lunch) = -30 -> clamped to 0
      expect(calculateDailyCapacity("09:00", "09:30", "work")).toBe(0);
    });
  });

  describe("calculatePlannedTime", () => {
    it("sums plannedDurationMinutes normally", () => {
      const tasks = [
        { plannedDurationMinutes: 30 },
        { plannedDurationMinutes: 45 },
      ];
      expect(calculatePlannedTime(tasks)).toBe(75);
    });

    it("falls back to actualDurationMinutes if completed and planned is missing", () => {
      const tasks = [
        { plannedDurationMinutes: 30 },
        { status: "completed", actualDurationMinutes: 20 }, // Falls back to 20
        { status: "pending", actualDurationMinutes: 20 }, // Ignores actual because pending
      ];
      expect(calculatePlannedTime(tasks)).toBe(50);
    });

    it("returns 0 for empty arrays or invalid inputs", () => {
      expect(calculatePlannedTime([])).toBe(0);
      expect(calculatePlannedTime(null)).toBe(0);
    });
  });
});
