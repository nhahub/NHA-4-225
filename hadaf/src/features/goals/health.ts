import type { GoalHealth } from "@/features/goals/schemas";

/**
 * Maps a GoalHealth value to its CSS background-class token.
 *
 * Per DESIGN.md §2 (Status table), the four-tier health system uses:
 *   at_risk          -> status-low (red)
 *   behind           -> status-warning (orange)
 *   needs_attention  -> status-attention (yellow)
 *   on_track         -> status-great (green)
 *
 * Note: status-good (purple) is intentionally NOT used for health —
 * it is reserved for the 4-tier progress ring tier 61–85%.
 */

const HEALTH_BG: Record<GoalHealth, string> = {
  at_risk: "bg-status-low",
  behind: "bg-status-warning",
  needs_attention: "bg-status-attention",
  on_track: "bg-status-great",
};

const HEALTH_RING: Record<GoalHealth, string> = {
  at_risk: "ring-status-low/40",
  behind: "ring-status-warning/40",
  needs_attention: "ring-status-attention/40",
  on_track: "ring-status-great/40",
};

export function healthBackgroundClass(health: GoalHealth): string {
  return HEALTH_BG[health];
}

export function healthRingClass(health: GoalHealth): string {
  return HEALTH_RING[health];
}

/**
 * MVP heuristic: compare actual progress against the progress we would
 * expect given how far through the cycle we are. A small lead is fine,
 * a small lag is "needs attention", and a meaningful lag escalates to
 * "behind" or "at risk".
 *
 * This is a documented stub. The real algorithm (factoring task
 * completion velocity, milestone state, and recent day quality) is
 * a separate story.
 */
export function progressToHealth(
  progress: number,
  currentWeek: number,
  totalWeeks: number,
): GoalHealth {
  const expected = currentWeek / totalWeeks;
  const delta = progress - expected;

  if (delta >= -0.05) return "on_track";
  if (delta >= -0.2) return "needs_attention";
  if (delta >= -0.4) return "behind";
  return "at_risk";
}