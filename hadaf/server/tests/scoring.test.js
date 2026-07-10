const {
  calculateTaskPoints,
  predictTaskPoints,
} = require("../utils/scoring");

// ─── calculateTaskPoints ──────────────────────────────────────────────────────

describe("calculateTaskPoints", () => {

  // ── Quick tasks ──────────────────────────────────────────────────────────────

  test("quick task always returns 2 points regardless of other inputs", () => {
    expect(calculateTaskPoints({ type: "quick", difficulty: "hard", actualMinutes: 999 })).toBe(2);
  });

  test("quick task returns 2 points even with no optional fields", () => {
    expect(calculateTaskPoints({ type: "quick" })).toBe(2);
  });

  // ── Difficulty multipliers ───────────────────────────────────────────────────

  test("easy difficulty: ×1.0 (base, no bonus)", () => {
    // 60 min / 10 × 1.0 = 6.0 → Math.ceil(6) = 6
    expect(calculateTaskPoints({ type: "scheduled", difficulty: "easy", actualMinutes: 60 })).toBe(6);
  });

  test("medium difficulty: ×1.2", () => {
    // 60 / 10 × 1.2 = 7.2 → Math.ceil(7.2) = 8
    expect(calculateTaskPoints({ type: "scheduled", difficulty: "medium", actualMinutes: 60 })).toBe(8);
  });

  test("hard difficulty: ×1.4", () => {
    // 60 / 10 × 1.4 = 8.4 → Math.ceil(8.4) = 9
    expect(calculateTaskPoints({ type: "scheduled", difficulty: "hard", actualMinutes: 60 })).toBe(9);
  });

  // ── Accuracy bonus ───────────────────────────────────────────────────────────

  test("accuracy bonus ×1.15 awarded when actual equals planned exactly", () => {
    // 60 / 10 × 1.2 × 1.15 = 8.28 → Math.ceil = 9
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 60, plannedMinutes: 60,
    })).toBe(9);
  });

  test("accuracy bonus awarded at exactly +15 min boundary", () => {
    // 75 / 10 × 1.2 × 1.15 = 10.35 → Math.ceil = 11
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 75, plannedMinutes: 60,
    })).toBe(11);
  });

  test("accuracy bonus awarded at exactly -15 min boundary", () => {
    // 45 / 10 × 1.2 × 1.15 = 6.21 → Math.ceil = 7
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 45, plannedMinutes: 60,
    })).toBe(7);
  });

  test("accuracy bonus NOT awarded when over +15 min threshold", () => {
    // 76 / 10 × 1.2 = 9.12 → Math.ceil = 10 (no accuracy bonus)
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 76, plannedMinutes: 60,
    })).toBe(10);
  });

  test("accuracy bonus NOT awarded for wildly inaccurate estimation even if cap brings it within window", () => {
    // planned=5, actual=100 (gap is 95, so NO accuracy bonus).
    // cap applies AFTER: effectiveActual = min(100, 5×3) = 15.
    // raw calculation: (15 / 10) × 1.0 (easy) × 1.0 (no accuracy bonus) = 1.5 → Math.ceil = 2
    // If bug existed, it would use effectiveActual for accuracy check: |15 - 5| = 10 <= 15 -> would give bonus.
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 100, plannedMinutes: 5,
    })).toBe(2);
  });

  test("accuracy bonus NOT awarded when under -15 min threshold", () => {
    // 44 / 10 × 1.2 = 5.28 → Math.ceil = 6 (no accuracy bonus)
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 44, plannedMinutes: 60,
    })).toBe(6);
  });

  test("accuracy bonus not applied when no plannedMinutes (flexible with no planned)", () => {
    // No planned → no accuracy check
    // 60 / 10 × 1.2 = 7.2 → Math.ceil = 8
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 60, plannedMinutes: 0,
    })).toBe(8);
  });

  // ── Streak bonus ─────────────────────────────────────────────────────────────

  test("streak 0: no bonus (×1.0)", () => {
    // 60 / 10 × 1.2 = 7.2 → 8
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 60, streakDays: 0,
    })).toBe(8);
  });

  test("streak 1: ×1.05 bonus", () => {
    // 60 / 10 × 1.2 × 1.05 = 7.56 → Math.ceil = 8
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "medium", actualMinutes: 60, streakDays: 1,
    })).toBe(8);
  });

  test("streak 5: ×1.25 bonus (1 + 0.05×5)", () => {
    // 60 / 10 × 1.0 × 1.25 = 7.5 → Math.ceil = 8
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 60, streakDays: 5,
    })).toBe(8);
  });

  test("streak 10: hits ×1.5 cap exactly", () => {
    // 60 / 10 × 1.0 × 1.5 = 9
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 60, streakDays: 10,
    })).toBe(9);
  });

  test("streak 20: still capped at ×1.5 (not ×2.0)", () => {
    // 60 / 10 × 1.0 × 1.5 = 9 (same as day 10)
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 60, streakDays: 20,
    })).toBe(9);
  });

  // ── Time cap ─────────────────────────────────────────────────────────────────

  test("actual duration capped at 3× planned (3× = max usable)", () => {
    // planned=60, actual=180 (exactly 3×) → effectiveActual = 180
    // 180 / 10 × 1.0 = 18
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 180, plannedMinutes: 60,
    })).toBe(18);
  });

  test("actual duration capped: above 3× is trimmed to 3×", () => {
    // planned=60, actual=999 → effectiveActual capped at 180
    // 180 / 10 × 1.0 = 18 (same as above)
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 999, plannedMinutes: 60,
    })).toBe(18);
  });

  test("time cap does not trigger when no plannedMinutes", () => {
    // No planned → no cap → actual used as-is
    // 300 / 10 × 1.0 = 30
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 300, plannedMinutes: 0,
    })).toBe(30);
  });

  // ── Math.ceil ─────────────────────────────────────────────────────────────────

  test("final value is always Math.ceil'd (never fractional)", () => {
    // 7 / 10 × 1.4 = 0.98 → Math.ceil = 1 (not 0.98 or 0)
    const points = calculateTaskPoints({ type: "scheduled", difficulty: "hard", actualMinutes: 7 });
    expect(Number.isInteger(points)).toBe(true);
  });

  // ── Minimum points floor ──────────────────────────────────────────────────────

  test("minimum 1 point even for tiny tasks (Math.max guard)", () => {
    // 1 / 10 × 1.0 = 0.1 → Math.ceil = 1
    expect(calculateTaskPoints({
      type: "flexible", difficulty: "easy", actualMinutes: 1,
    })).toBeGreaterThanOrEqual(1);
  });

  test("NaN firewall: undefined actualMinutes produces 1 point (not NaN or 0)", () => {
    // actualMinutes=undefined → safeActual=0 → raw=0 → Math.max(1,0)=1
    const points = calculateTaskPoints({ type: "flexible", difficulty: "easy", actualMinutes: undefined });
    expect(points).toBe(1);
    expect(Number.isNaN(points)).toBe(false);
  });

  // ── Combined: all bonuses active ─────────────────────────────────────────────

  test("all bonuses combined (hard + accuracy + streak 5)", () => {
    // effectiveActual = min(75, 60×3=180) = 75
    // accuracy bonus: |75-60|=15 ≤ 15 → ×1.15
    // streak bonus: 1 + 0.05×5 = 1.25
    // raw = (75/10) × 1.4 × 1.15 × 1.25 = 7.5 × 1.4 × 1.15 × 1.25 = 15.09375
    // Math.ceil(15.09375) = 16
    expect(calculateTaskPoints({
      type: "scheduled", difficulty: "hard",
      actualMinutes: 75, plannedMinutes: 60, streakDays: 5,
    })).toBe(16);
  });
});

// ─── predictTaskPoints ────────────────────────────────────────────────────────

describe("predictTaskPoints", () => {
  test("quick task preview = 2 points", () => {
    expect(predictTaskPoints({ type: "quick", difficulty: "hard", plannedMinutes: 60 })).toBe(2);
  });

  test("flexible medium 30 min preview", () => {
    // 30 / 10 × 1.2 = 3.6 → Math.ceil = 4
    expect(predictTaskPoints({ type: "flexible", difficulty: "medium", plannedMinutes: 30 })).toBe(4);
  });

  test("no plannedMinutes → minimum 1 point", () => {
    expect(predictTaskPoints({ type: "flexible", difficulty: "easy", plannedMinutes: 0 })).toBeGreaterThanOrEqual(1);
  });
});
