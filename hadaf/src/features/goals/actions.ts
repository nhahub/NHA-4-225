"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/data/db/client";
import { goals, milestones } from "@/data/db/schema";
import { getAuthUser } from "@/lib/auth/session";
import { goalWizardSchema, type GoalWizardInput } from "./schemas";
import { analyticsRepo } from "@/data/repositories/analytics.repo";

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

    if (activeGoalsCount.length >= 5) {
      return { ok: false, error: "لديك ٥ أهداف نشطة. أرشف هدفًا أولاً." };
    }

    // Insert goal
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

    // Insert milestones if any
    if (validated.data.milestones && validated.data.milestones.length > 0) {
      await db.insert(milestones).values(
        validated.data.milestones.map((m, idx) => ({
          goalId: newGoal.id,
          title: m.title,
          sortOrder: idx,
          isCompleted: false,
        }))
      );
    }

    // Log analytics
    await analyticsRepo.log(user.id, "goal_created", { goalId: newGoal.id });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "Failed to create goal" };
  }
}
