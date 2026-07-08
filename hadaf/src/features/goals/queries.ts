import type { Goal } from "@/features/goals/schemas";
import { getAuthUser } from "@/lib/auth/session";
import { goalsRepo } from "@/data/repositories/goals.repo";

export async function getActiveGoals(): Promise<Goal[]> {
  const user = await getAuthUser();
  if (!user) return [];
  return goalsRepo.getActiveGoals(user.id);
}

export async function getGoals(): Promise<Goal[]> {
  const user = await getAuthUser();
  if (!user) return [];
  return goalsRepo.getGoals(user.id);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return goalsRepo.getById(user.id, id);
}

export async function getAllGoalIds(): Promise<string[]> {
  const user = await getAuthUser();
  if (!user) return [];
  return goalsRepo.getAllIds(user.id);
}

export async function getWeeklyTaskDensity(
  goalId: string,
): Promise<Array<{ weekIndex: number; completed: number }>> {
  const user = await getAuthUser();
  if (!user) return [];
  return goalsRepo.getWeeklyTaskDensity(user.id, goalId);
}