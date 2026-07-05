import { MOCK_TODAY, type TodaySnapshot } from "@/lib/mock-data/day";

/**
 * Read-side data access for the Adaptive Home (E3). Returns the today
 * snapshot. Read-only clone so consumers can safely mutate optimistic state.
 */

function clone<T>(value: T): T {
  return structuredClone(value);
}

export async function getTodaySnapshot(): Promise<TodaySnapshot> {
  return clone(MOCK_TODAY);
}