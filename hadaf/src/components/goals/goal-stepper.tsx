import { cn } from "@/lib/utils";

const STEP_LABELS = ["1", "2", "3"] as const;

type GoalStepperProps = {
  currentStep: 1 | 2 | 3;
};

export function GoalStepper({ currentStep }: GoalStepperProps) {
  return (
    <ol
      aria-label={`Step ${currentStep} of 3`}
      className="flex items-center justify-center gap-2"
    >
      {STEP_LABELS.map((label, idx) => {
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
            {idx < STEP_LABELS.length - 1 ? (
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
