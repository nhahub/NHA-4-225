"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/data/db/client";
import { goals, milestones } from "@/data/db/schema";
import { goalsRepo } from "@/data/repositories/goals.repo";
import { analyticsRepo } from "@/data/repositories/analytics.repo";
import { getAuthUser } from "@/lib/auth/session";
import {
  goalWizardSchema,
  overrideProgressSchema,
  reorderMilestonesSchema,
  softDeleteGoalSchema,
  toggleMilestoneSchema,
  type GoalWizardInput,
  type OverrideProgressInput,
  type ReorderMilestonesInput,
  type SoftDeleteGoalInput,
  type ToggleMilestoneInput,
} from "./schemas";

type ActionResult = { ok: true } | { ok: false; error: string };

const ACTIVE_GOAL_LIMIT = 5;

export async function createGoal(
  input: GoalWizardInput,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const validated = goalWizardSchema.safeParse(input);
    if (!validated.success) {
      return { ok: false, error: "Invalid input data" };
    }

    const activeGoalsCount = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, user.id), eq(goals.status, "active")));

    if (activeGoalsCount.length >= ACTIVE_GOAL_LIMIT) {
      return { ok: false, error: "لديك ٥ أهداف نشطة. أرشف هدفًا أولاً." };
    }

    const [newGoal] = await db
      .insert(goals)
      .values({
        userId: user.id,
        title: validated.data.title,
        description: validated.data.description,
        category: validated.data.category,
        customCategory: validated.data.customCategory,
        measure: validated.data.measure,
        relevance: validated.data.relevance,
        cycleStart: validated.data.cycleStart.toISOString().split("T")[0],
        cycleEnd: validated.data.cycleEnd.toISOString().split("T")[0],
        status: "active",
      })
      .returning();

    if (validated.data.milestones && validated.data.milestones.length > 0) {
      await db.insert(milestones).values(
        validated.data.milestones.map((m, idx) => ({
          goalId: newGoal.id,
          title: m.title,
          sortOrder: idx,
          isCompleted: false,
        })),
      );
    }

    await analyticsRepo.log(user.id, "goal_created", { goalId: newGoal.id });

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create goal";
    return { ok: false, error: message };
  }
}

export async function deleteGoal(
  input: SoftDeleteGoalInput,
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const parsed = softDeleteGoalSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid input" };
    }

    await goalsRepo.softDelete(user.id, parsed.data.goalId, parsed.data.reason);
    await analyticsRepo.log(user.id, "goal_archived", {
      goalId: parsed.data.goalId,
    });

    revalidatePath("/goals");
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to archive goal";
    return { ok: false, error: message };
  }
}

export async function toggleMilestone(
  input: ToggleMilestoneInput,
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const parsed = toggleMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid input" };
    }

    await goalsRepo.toggleMilestone(
      user.id,
      parsed.data.milestoneId,
      parsed.data.next,
    );
    await analyticsRepo.log(user.id, "milestone_toggled", {
      milestoneId: parsed.data.milestoneId,
      next: parsed.data.next,
    });

    revalidatePath("/goals");
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to toggle milestone";
    return { ok: false, error: message };
  }
}

export async function reorderMilestones(
  input: ReorderMilestonesInput,
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const parsed = reorderMilestonesSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid input" };
    }

    await goalsRepo.reorderMilestones(
      user.id,
      parsed.data.goalId,
      parsed.data.orderedMilestoneIds,
    );
    await analyticsRepo.log(user.id, "milestones_reordered", {
      goalId: parsed.data.goalId,
      count: parsed.data.orderedMilestoneIds.length,
    });

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to reorder milestones";
    return { ok: false, error: message };
  }
}

export async function overrideProgress(
  input: OverrideProgressInput,
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const parsed = overrideProgressSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid input" };
    }

    await goalsRepo.updateManualProgress(
      user.id,
      parsed.data.goalId,
      parsed.data.value,
    );
    await analyticsRepo.log(user.id, "goal_progress_overridden", {
      goalId: parsed.data.goalId,
      value: parsed.data.value,
    });

    revalidatePath("/goals");
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update progress";
    return { ok: false, error: message };
  }
}