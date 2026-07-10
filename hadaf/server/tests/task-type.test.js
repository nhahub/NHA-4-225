const {
  detectTaskType,
  calculateBlockDuration,
} = require("../utils/task-type");


// ─── detectTaskType ───────────────────────────────────────────────────────────

describe("detectTaskType", () => {
  test("returns 'quick' when only a title is provided (no time or duration)", () => {
    expect(detectTaskType({})).toBe("quick");
  });

  test("returns 'quick' when fields are explicitly undefined", () => {
    expect(detectTaskType({ timeBlockStart: undefined, timeBlockEnd: undefined, plannedDurationMinutes: undefined })).toBe("quick");
  });

  test("returns 'quick' when timeBlockStart/End are empty strings", () => {
    expect(detectTaskType({ timeBlockStart: "", timeBlockEnd: "" })).toBe("quick");
  });

  test("returns 'flexible' when plannedDurationMinutes > 0 and no time block", () => {
    expect(detectTaskType({ plannedDurationMinutes: 30 })).toBe("flexible");
  });

  test("returns 'flexible' for duration only (time fields absent)", () => {
    expect(detectTaskType({ plannedDurationMinutes: 90 })).toBe("flexible");
  });

  test("returns 'scheduled' when both timeBlockStart and timeBlockEnd are present", () => {
    expect(detectTaskType({ timeBlockStart: "09:00", timeBlockEnd: "10:30" })).toBe("scheduled");
  });

  test("returns 'scheduled' even when plannedDurationMinutes is also set (time block wins)", () => {
    expect(detectTaskType({ timeBlockStart: "09:00", timeBlockEnd: "10:30", plannedDurationMinutes: 60 })).toBe("scheduled");
  });

  test("returns 'quick' when only timeBlockStart is provided (partial time block)", () => {
    // A time block requires BOTH start AND end
    expect(detectTaskType({ timeBlockStart: "09:00" })).toBe("quick");
  });

  test("returns 'quick' when only timeBlockEnd is provided", () => {
    expect(detectTaskType({ timeBlockEnd: "10:00" })).toBe("quick");
  });

  test("returns 'quick' when plannedDurationMinutes is 0", () => {
    expect(detectTaskType({ plannedDurationMinutes: 0 })).toBe("quick");
  });
});

// ─── calculateBlockDuration ───────────────────────────────────────────────────

describe("calculateBlockDuration", () => {
  test("calculates standard same-day block (09:00 → 10:30 = 90 min)", () => {
    expect(calculateBlockDuration("09:00", "10:30")).toBe(90);
  });

  test("calculates a 1-hour block (14:00 → 15:00 = 60 min)", () => {
    expect(calculateBlockDuration("14:00", "15:00")).toBe(60);
  });

  test("calculates a 15-minute block", () => {
    expect(calculateBlockDuration("08:45", "09:00")).toBe(15);
  });

  test("handles zero-duration block (same start and end = 0)", () => {
    expect(calculateBlockDuration("10:00", "10:00")).toBe(0);
  });

  test("handles midnight boundary (23:30 → 00:00 = 30 min overnight)", () => {
    expect(calculateBlockDuration("23:30", "00:00")).toBe(30);
  });

  test("handles overnight wrap (23:00 → 01:00 = 120 min)", () => {
    expect(calculateBlockDuration("23:00", "01:00")).toBe(120);
  });
});
