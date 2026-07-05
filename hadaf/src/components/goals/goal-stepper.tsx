"use client";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type GoalStepperProps = {
  currentStep: 1 | 2 | 3;
};

export function GoalStepper({ currentStep }: GoalStepperProps) {
  const { t } = useLocale();
  const labels = ["1", "2", "3"] as const;
  const total = labels.length;

  return (
    <ol
      aria-label={t("newGoal.stepOf", { current: currentStep, total })}
      className="flex items-center justify-center gap-2"
    >
      {labels.map((label, idx) => {
        const stepNum = (idx + 1) as 1 | 2 | 3;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full text-xs font-medium tabular-nums transition-base",
                isActive && "bg-primary text-primary-foreground",
                isDone && "bg-muted-foreground text-primary-foreground",
                !isActive && !isDone && "bg-muted text-muted-foreground",
              )}
            >
              {label}
            </span>
            {idx < labels.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-10 transition-base sm:w-14",
                  stepNum < currentStep ? "bg-muted-foreground" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}