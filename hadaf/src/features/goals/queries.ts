import type { Goal } from "@/features/goals/schemas";
import { MOCK_GOALS } from "@/lib/mock-data/goals";

/**
 * Read-side data access for goals. E1-2 reads from in-memory mocks so the
 * UI can be built and reviewed before the database lands. The contract is
 * stable; E0-4 swaps the implementation, the consumers do not change.
 */

function clone<T>(value: T): T {
  return structuredClone(value);
}

export async function getGoals(): Promise<Goal[]> {
  return clone(MOCK_GOALS);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const found = MOCK_GOALS.find((g) => g.id === id);
  return found ? clone(found) : null;
}

export async function getAllGoalIds(): Promise<string[]> {
  return MOCK_GOALS.map((g) => g.id);
}