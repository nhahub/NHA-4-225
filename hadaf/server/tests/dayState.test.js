const { calculateDayState, calculateAdaptiveDailyTarget } = require("../utils/dayState");

describe("dayState utilities", () => {
  describe("calculateDayState", () => {
    it("returns 'low' for <50% (e.g. 49%)", () => {
      expect(calculateDayState(49, 100)).toBe('low');
    });

    it("returns 'good_enough' for exactly 50%", () => {
      expect(calculateDayState(50, 100)).toBe('good_enough');
    });

    it("returns 'perfect' for exactly 100%", () => {
      expect(calculateDayState(100, 100)).toBe('perfect');
    });

    it("returns 'amazing' for exactly 120%", () => {
      expect(calculateDayState(120, 100)).toBe('amazing');
    });

    it("returns 'legendary' for exactly 150%", () => {
      expect(calculateDayState(150, 100)).toBe('legendary');
    });

    it("handles zero-target edge case correctly", () => {
      expect(calculateDayState(0, 0)).toBe('good_enough'); // 0 points on 0 target
      expect(calculateDayState(10, 0)).toBe('legendary');   // Any points on 0 target
    });
  });

  describe("calculateAdaptiveDailyTarget", () => {
    it("returns 0 if no recent points", () => {
      expect(calculateAdaptiveDailyTarget([], 'work')).toBe(0);
      expect(calculateAdaptiveDailyTarget(null, 'work')).toBe(0);
    });

    it("calculates moving average for work day (1.0x)", () => {
      const points = [100, 100, 100, 100]; // avg = 100
      expect(calculateAdaptiveDailyTarget(points, 'work')).toBe(100);
    });

    it("multiplies by 0.5 for light day", () => {
      const points = [100, 100, 100, 100]; // avg = 100
      expect(calculateAdaptiveDailyTarget(points, 'light')).toBe(50);
    });

    it("multiplies by 0.2 for off day", () => {
      const points = [100, 100, 100, 100]; // avg = 100
      expect(calculateAdaptiveDailyTarget(points, 'off')).toBe(20);
    });

    it("ensures target is at least 1 if average > 0 (ceil)", () => {
      const points = [2]; // avg = 2
      expect(calculateAdaptiveDailyTarget(points, 'off')).toBe(1); // 2 * 0.2 = 0.4 -> ceil -> 1
    });
  });
});
