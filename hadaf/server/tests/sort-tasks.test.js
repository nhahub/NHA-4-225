const { _sortTasksForTesting } = require("../controllers/taskController");

describe("sortTasks", () => {
  test("separates scheduled from non-scheduled and sorts scheduled by timeBlockStart", () => {
    const tasks = [
      { id: 1, type: "flexible", priority: "medium", createdAt: 2 },
      { id: 2, type: "scheduled", timeBlockStart: "14:00" },
      { id: 3, type: "scheduled", timeBlockStart: "09:00" },
      { id: 4, type: "quick", priority: "high", createdAt: 1 },
      { id: 5, type: "scheduled", timeBlockStart: "10:30" },
    ];

    const sorted = _sortTasksForTesting(tasks);

    // Scheduled tasks should be first (sorted by time)
    expect(sorted[0].id).toBe(3); // 09:00
    expect(sorted[1].id).toBe(5); // 10:30
    expect(sorted[2].id).toBe(2); // 14:00
    
    // Non-scheduled tasks next (sorted by priority: high > medium)
    expect(sorted[3].id).toBe(4); // high
    expect(sorted[4].id).toBe(1); // medium
  });

  test("sorts non-scheduled tasks by priority rank, then by createdAt stable tiebreak", () => {
    const tasks = [
      { id: 1, type: "flexible", priority: "low", createdAt: 1 },
      { id: 2, type: "quick", priority: "medium", createdAt: 3 },
      { id: 3, type: "flexible", priority: "high", createdAt: 2 },
      { id: 4, type: "flexible", priority: "medium", createdAt: 1 }, // Earlier than id:2
      { id: 5, type: "quick", priority: "high", createdAt: 4 }, // Later than id:3
    ];

    const sorted = _sortTasksForTesting(tasks);

    // high priority (earlier createdAt first)
    expect(sorted[0].id).toBe(3); // high, createdAt 2
    expect(sorted[1].id).toBe(5); // high, createdAt 4
    
    // medium priority (earlier createdAt first)
    expect(sorted[2].id).toBe(4); // medium, createdAt 1
    expect(sorted[3].id).toBe(2); // medium, createdAt 3
    
    // low priority
    expect(sorted[4].id).toBe(1); // low, createdAt 1
  });

  test("handles scheduled tasks with missing timeBlockStart safely", () => {
    const tasks = [
      { id: 1, type: "scheduled", timeBlockStart: "12:00" },
      { id: 2, type: "scheduled", timeBlockStart: undefined },
      { id: 3, type: "scheduled", timeBlockStart: "08:00" },
    ];

    const sorted = _sortTasksForTesting(tasks);

    // Missing timeBlockStart falls back to "" string, which sorts before "08:00"
    expect(sorted[0].id).toBe(2); // ""
    expect(sorted[1].id).toBe(3); // "08:00"
    expect(sorted[2].id).toBe(1); // "12:00"
  });
});
