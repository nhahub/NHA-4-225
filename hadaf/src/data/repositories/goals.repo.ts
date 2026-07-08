import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";

import { db } from "../db/client";
import { goals, milestones, tasks } from "../db/schema";
import {
  calculateHybridProgress,
  calculateGoalHealth,
} from "@/domain/goal-progress";
import { currentWeekIndex } from "@/features/goals/week";
import type { Goal, Milestone } from "@/features/goals/schemas";

/**
 * Goals repository — all DB access for the `goals` and `milestones` tables.
 *
 * Methods are pure data access: auth scoping is enforced by taking `userId`
 * as the first argument and including it in every WHERE clause. Server
 * actions in `features/goals/actions.ts` are responsible for verifying the
 * caller's session and passing the resolved `userId` in.
 */

const TOTAL_WEEKS = 12;
const DAY_MS = 86_400_000;

type MilestoneRow = typeof milestones.$inferSelect;

function mapMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    title: row.title,
    sortOrder: row.sortOrder,
    isCompleted: row.isCompleted,
    completedAt: row.completedAt ?? undefined,
  };
}

function dateOnly(value: string | Date): Date {
  if (value instanceof Date) return value;
  return new Date(`${value}T00:00:00`);
}

function buildGoal(
  goal: typeof goals.$inferSelect,
  goalMilestones: MilestoneRow[],
): Goal {
  const cycleStart = dateOnly(goal.cycleStart);
  const cycleEnd = dateOnly(goal.cycleEnd);
  const progress = calculateHybridProgress(
    [], // tasks are not loaded here — query layer passes the computed value
    goalMilestones.map((m) => ({ isCompleted: m.isCompleted })),
    goal.manualProgress,
  );
  const health = calculateGoalHealth(progress, cycleStart, cycleEnd);
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description ?? undefined,
    category: goal.category,
    customCategory: goal.customCategory ?? undefined,
    measure: goal.measure,
    relevance: goal.relevance ?? "",
    cycleStart,
    cycleEnd,
    milestones: goalMilestones.map(mapMilestone),
    progress,
    health,
    manualProgress: goal.manualProgress ?? null,
    createdAt: goal.createdAt,
  };
}

async function loadGoalWithMilestones(
  userId: string,
  where: ReturnType<typeof eq> | ReturnType<typeof and>,
): Promise<Goal | null> {
  const [goal] = await db.select().from(goals).where(where).limit(1);
  if (!goal) return null;
  const goalMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.goalId, goal.id))
    .orderBy(asc(milestones.sortOrder));
  return buildGoal(goal, goalMilestones);
}

export const goalsRepo = {
  /**
   * Dashboard query: only `status='active'`, newest first.
   */
  async getActiveGoals(userId: string): Promise<Goal[]> {
    const userGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")))
      .orderBy(desc(goals.createdAt));

    if (userGoals.length === 0) return [];

    // Fetch all milestones for these goals in a single round-trip. The
    // `milestones` table has no userId — it's joined via goalId only —
    // so we scope the IN clause with the goal IDs we already verified
    // belong to this user.
    const goalIds = userGoals.map((g) => g.id);
    const allMilestones = await db
      .select()
      .from(milestones)
      .where(inArray(milestones.goalId, goalIds))
      .orderBy(asc(milestones.sortOrder));

    // Group milestones by goalId — preserves per-goal sort_order.
    const byGoal = new Map<string, MilestoneRow[]>();
    for (const m of allMilestones) {
      const list = byGoal.get(m.goalId) ?? [];
      list.push(m);
      byGoal.set(m.goalId, list);
    }

    return userGoals.map((g) => buildGoal(g, byGoal.get(g.id) ?? []));
  },

  /**
   * All goals regardless of status — used by the home screen where
   * archived/completed goals still drive context.
   */
  async getGoals(userId: string): Promise<Goal[]> {
    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));

    if (userGoals.length === 0) return [];

    const byGoal = new Map<string, MilestoneRow[]>();
    for (const g of userGoals) {
      const ms = await db
        .select()
        .from(milestones)
        .where(eq(milestones.goalId, g.id))
        .orderBy(asc(milestones.sortOrder));
      byGoal.set(g.id, ms);
    }

    return userGoals.map((g) => buildGoal(g, byGoal.get(g.id) ?? []));
  },

  /**
   * Single goal with its milestones. Auth-scoped.
   */
  async getById(userId: string, id: string): Promise<Goal | null> {
    return loadGoalWithMilestones(
      userId,
      and(eq(goals.id, id), eq(goals.userId, userId)),
    );
  },

  /**
   * IDs of all goals the user owns — used by `generateStaticParams`.
   */
  async getAllIds(userId: string): Promise<string[]> {
    const rows = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.userId, userId));
    return rows.map((r) => r.id);
  },

  /**
   * Soft-delete (a.k.a. archive): sets `status='archived'` and records the
   * user's reason. Never hard-deletes (FR11.2).
   */
  async softDelete(
    userId: string,
    goalId: string,
    reason: string,
  ): Promise<void> {
    await db
      .update(goals)
      .set({
        status: "archived",
        deletionReason: reason,
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  },

  /**
   * Flip a milestone's completion state. Verifies the milestone belongs to
   * the caller's goal before writing — defense-in-depth against
   * cross-user mutation if a UUID is leaked.
   */
  async toggleMilestone(
    userId: string,
    milestoneId: string,
    next: boolean,
  ): Promise<void> {
    const [ms] = await db
      .select({
        id: milestones.id,
        goalId: milestones.goalId,
      })
      .from(milestones)
      .innerJoin(goals, eq(milestones.goalId, goals.id))
      .where(and(eq(milestones.id, milestoneId), eq(goals.userId, userId)))
      .limit(1);

    if (!ms) {
      throw new Error("Milestone not found or not owned by user");
    }

    await db
      .update(milestones)
      .set({
        isCompleted: next,
        completedAt: next ? new Date() : null,
      })
      .where(eq(milestones.id, milestoneId));
  },

  /**
   * Persist a new sort order for a goal's milestones. `orderedIds` must be
   * a permutation of every milestone belonging to `goalId`. We re-verify
   * ownership and completeness in JS before writing — Neon HTTP does not
   * support transactions, so we update sequentially and trust that
   * concurrent reorders on the same goal are rare in practice.
   */
  async reorderMilestones(
    userId: string,
    goalId: string,
    orderedIds: string[],
  ): Promise<void> {
    const owned = await db
      .select({ id: milestones.id })
      .from(milestones)
      .innerJoin(goals, eq(milestones.goalId, goals.id))
      .where(and(eq(milestones.goalId, goalId), eq(goals.userId, userId)));

    const ownedSet = new Set(owned.map((m) => m.id));
    if (ownedSet.size !== orderedIds.length) {
      throw new Error("Reorder set does not match goal's milestones");
    }
    for (const id of orderedIds) {
      if (!ownedSet.has(id)) {
        throw new Error(`Milestone ${id} does not belong to goal ${goalId}`);
      }
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(milestones)
        .set({ sortOrder: i })
        .where(eq(milestones.id, orderedIds[i]));
    }
  },

  /**
   * Set or clear the manual progress override. `value` is 0-100; pass
   * `null` to revert to the computed value.
   */
  async updateManualProgress(
    userId: string,
    goalId: string,
    value: number | null,
  ): Promise<void> {
    await db
      .update(goals)
      .set({
        manualProgress: value,
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  },

  /**
   * 12-row weekly task-completion density for a single goal. Each row is
   * `{ weekIndex: 1..12, completed: number }`, zero-filled. Computed in JS
   * from `tasks.completed_at` because Neon HTTP's date_trunc('week', ...)
   * semantics are locale-dependent and we want the cycle-relative bucket,
   * not the calendar week.
   */
  async getWeeklyTaskDensity(
    userId: string,
    goalId: string,
  ): Promise<Array<{ weekIndex: number; completed: number }>> {
    const [goal] = await db
      .select({
        cycleStart: goals.cycleStart,
        cycleEnd: goals.cycleEnd,
      })
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
      .limit(1);

    if (!goal) {
      return Array.from({ length: TOTAL_WEEKS }, (_, i) => ({
        weekIndex: i + 1,
        completed: 0,
      }));
    }

    const cycleStart = dateOnly(goal.cycleStart);
    const cycleEnd = dateOnly(goal.cycleEnd);

    const completedRows = await db
      .select({ completedAt: tasks.completedAt })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.goalId, goalId),
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, cycleStart),
          lte(tasks.completedAt, cycleEnd),
        ),
      );

    const buckets = new Array<number>(TOTAL_WEEKS).fill(0);
    for (const row of completedRows) {
      if (!row.completedAt) continue;
      const ms = row.completedAt.getTime() - cycleStart.getTime();
      if (ms < 0) continue;
      const weekIdx = Math.min(
        Math.floor(ms / (7 * DAY_MS)),
        TOTAL_WEEKS - 1,
      );
      buckets[weekIdx] += 1;
    }

    return buckets.map((completed, i) => ({ weekIndex: i + 1, completed }));
  },

  /**
   * Cycle-relative week index used to anchor the heatmap's current-week
   * highlight. Mirrors `currentWeekIndex` in `features/goals/week.ts`.
   */
  currentWeekIndex(cycleStart: Date, cycleEnd: Date): number {
    return currentWeekIndex(cycleStart, cycleEnd);
  },
};