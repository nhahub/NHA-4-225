import { GOAL_HEALTH_LABEL_EN, type GoalHealth } from "@/features/goals/schemas";
import { healthBackgroundClass } from "@/features/goals/health";
import { cn } from "@/lib/utils";

const SIZE_CLASS: Record<"sm" | "md", string> = {
  sm: "size-2",
  md: "size-2.5",
};

type HealthDotProps = {
  health: GoalHealth;
  size?: "sm" | "md";
  className?: string;
};

export function HealthDot({ health, size = "md", className }: HealthDotProps) {
  return (
    <span
      role="img"
      aria-label={`Health: ${GOAL_HEALTH_LABEL_EN[health]}`}
      className={cn(
        "inline-block shrink-0 rounded-full",
        SIZE_CLASS[size],
        healthBackgroundClass(health),
        className,
      )}
    />
  );
}