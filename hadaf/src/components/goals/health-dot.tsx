"use client";

import { healthLabel } from "@/features/goals/labels";
import type { GoalHealth } from "@/features/goals/schemas";
import { healthBackgroundClass } from "@/features/goals/health";
import { useLocale } from "@/providers/locale-provider";
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
  const { locale, t } = useLocale();
  const label = healthLabel(locale, health);

  return (
    <span
      role="img"
      aria-label={`${t("goals.healthAriaPrefix")} ${label}`}
      className={cn(
        "inline-block shrink-0 rounded-full",
        SIZE_CLASS[size],
        healthBackgroundClass(health),
        className,
      )}
    />
  );
}