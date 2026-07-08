import type { GoalHealth } from "../features/goals/schemas";
import { currentWeekIndex } from "../features/goals/week";

interface ProgressInputTask {
  status: string; // 'completed' or 'pending'
}

interface ProgressInputMilestone {
  isCompleted: boolean;
}

/**
 * Calculates the hybrid progress of a goal based on tasks and milestones.
 * Formula: (tasks completion rate * 0.6) + (milestones completion rate * 0.4)
 * If manualProgressOverride is provided, it takes precedence.
 */
export function calculateHybridProgress(
  tasks: ProgressInputTask[],
  milestones: ProgressInputMilestone[],
  manualProgressOverride?: number | null
): number {
  if (manualProgressOverride !== undefined && manualProgressOverride !== null) {
    return Math.min(Math.max(manualProgressOverride / 100, 0), 1);
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.isCompleted).length;
  const milestoneProgress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;

  return (taskProgress * 0.6) + (milestoneProgress * 0.4);
}

/**
 * Computes the health of a goal based on its current progress and time elapsed in its 12-week cycle.
 */
export function calculateGoalHealth(
  progress: number,
  cycleStart: Date,
  cycleEnd: Date,
  now: Date = new Date()
): GoalHealth {
  const currentWeek = currentWeekIndex(cycleStart, cycleEnd, now);
  const totalWeeks = 12;
  const expected = currentWeek / totalWeeks;
  const delta = progress - expected;

  if (delta >= -0.05) return "on_track";
  if (delta >= -0.2) return "needs_attention";
  if (delta >= -0.4) return "behind";
  return "at_risk";
}

/**
 * Returns the current week index (1-12) of a goal cycle.
 */
export function getCurrentWeek(
  start: Date,
  end: Date,
  now: Date = new Date()
): number {
  return currentWeekIndex(start, end, now);
}

/**
 * Calculates the weekly execution score based on average goal progress (0-100%).
 */
export function calculateWeeklyExecutionScore(goals: { progress: number }[]): number {
  if (goals.length === 0) return 0;
  const avg = goals.reduce((acc, g) => acc + g.progress, 0) / goals.length;
  return Math.round(avg * 100);
}

