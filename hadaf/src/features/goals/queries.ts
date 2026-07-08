import { eq, and } from "drizzle-orm";

import { db } from "@/data/db/client";
import { goals, milestones, tasks } from "@/data/db/schema";
import type { Goal } from "@/features/goals/schemas";
import { getAuthUser } from "@/lib/auth/session";
import { calculateHybridProgress, calculateGoalHealth } from "@/domain/goal-progress";

export async function getGoals(): Promise<Goal[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, user.id));

  const result: Goal[] = [];
  for (const goal of userGoals) {
    const goalMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.goalId, goal.id))
      .orderBy(milestones.sortOrder);

    const goalTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.goalId, goal.id));

    const progress = calculateHybridProgress(goalTasks, goalMilestones, goal.manualProgress);
    const health = calculateGoalHealth(progress, new Date(goal.cycleStart), new Date(goal.cycleEnd));

    result.push({
      id: goal.id,
      title: goal.title,
      description: goal.description ?? undefined,
      category: goal.category,
      customCategory: goal.customCategory ?? undefined,
      measure: goal.measure,
      relevance: goal.relevance ?? "",
      cycleStart: new Date(goal.cycleStart),
      cycleEnd: new Date(goal.cycleEnd),
      milestones: goalMilestones.map((m) => ({
        id: m.id,
        title: m.title,
        sortOrder: m.sortOrder,
        isCompleted: m.isCompleted,
        completedAt: m.completedAt ?? undefined,
      })),
      progress,
      health,
      createdAt: goal.createdAt,
    });
  }

  return result;
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  if (!goal) return null;

  const goalMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.goalId, goal.id))
    .orderBy(milestones.sortOrder);

  const goalTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.goalId, goal.id));

  const progress = calculateHybridProgress(goalTasks, goalMilestones, goal.manualProgress);
  const health = calculateGoalHealth(progress, new Date(goal.cycleStart), new Date(goal.cycleEnd));

  return {
    id: goal.id,
    title: goal.title,
    description: goal.description ?? undefined,
    category: goal.category,
    customCategory: goal.customCategory ?? undefined,
    measure: goal.measure,
    relevance: goal.relevance ?? "",
    cycleStart: new Date(goal.cycleStart),
    cycleEnd: new Date(goal.cycleEnd),
    milestones: goalMilestones.map((m) => ({
      id: m.id,
      title: m.title,
      sortOrder: m.sortOrder,
      isCompleted: m.isCompleted,
      completedAt: m.completedAt ?? undefined,
    })),
    progress,
    health,
    createdAt: goal.createdAt,
  };
}

export async function getAllGoalIds(): Promise<string[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const userGoals = await db
    .select({ id: goals.id })
    .from(goals)
    .where(eq(goals.userId, user.id));

  return userGoals.map((g) => g.id);
}