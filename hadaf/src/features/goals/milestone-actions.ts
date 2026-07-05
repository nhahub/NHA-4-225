"use server";

import type { Milestone } from "@/features/goals/schemas";

/**
 * MVP stub actions — replaced when E0-4 (Database) lands.
 * The components use React 19 `useOptimistic` for instant UI feedback;
 * these actions resolve successfully so the optimistic state persists
 * for the session, exactly as a real implementation would behave.
 * Refreshing the page reverts to mock data (documented MVP limitation).
 */

export async function toggleMilestoneComplete(input: {
  goalId: string;
  milestoneId: string;
  nextCompleted: boolean;
}): Promise<{ ok: true; milestone: Milestone }> {
  void input;
  return {
    ok: true,
    milestone: {
      id: input.milestoneId,
      title: "",
      sortOrder: 0,
      isCompleted: input.nextCompleted,
      completedAt: input.nextCompleted ? new Date() : undefined,
    },
  };
}

export async function reorderMilestones(input: {
  goalId: string;
  orderedMilestoneIds: string[];
}): Promise<{ ok: true }> {
  void input;
  return { ok: true };
}