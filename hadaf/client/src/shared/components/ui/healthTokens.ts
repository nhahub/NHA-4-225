/**
 * Generic four-level progress/health indicator. Used by both goals (GoalHealth
 * alias) and the weekly bar visualization, and reusable by any other feature
 * that needs the same green/yellow/orange/red semantics.
 */
export type HealthLevel = 'green' | 'yellow' | 'orange' | 'red';

export const HEALTH_COLOR: Record<HealthLevel, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};
