"use server";

import type { GoalWizardInput } from "./schemas";

/**
 * Stub server action — replaced when E0-4 (Database) lands.
 * Kept here so component imports remain stable across the swap.
 */
export async function createGoal(
  input: GoalWizardInput,
): Promise<{ ok: false; error: string }> {
  void input;
  return {
    ok: false,
    error: "E0-4 (Database) is paused — wire `useCreateGoal` mock until then.",
  };
}
