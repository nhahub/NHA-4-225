// Trivial smoke test — confirms the Vitest runner actually executes
// under the server's plain-JS ESM setup. Real unit tests will land here
// as feature work adds pure utils (scoring, capacity, day-state, etc.).
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});