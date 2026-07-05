"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { GoalWizardFormInput } from "@/features/goals/schemas";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive text-xs leading-tight">
      {message}
    </p>
  );
}

export function WizardStepWhat() {
  const {
    register,
    formState: { errors },
  } = useFormContext<GoalWizardFormInput>();

  return (
    <section className="flex flex-col gap-4" aria-label="Goal and measure">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-semibold">
          What is the goal, and how will you measure it?
        </h2>
        <p className="text-muted-foreground text-sm">
          A specific outcome beats a vague intention. Measurement is what
          separates goals from wishes.
        </p>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-title" className="text-sm font-medium">
          Goal title
        </label>
        <Input
          id="goal-title"
          placeholder="e.g., Submit my thesis draft"
          autoComplete="off"
          aria-invalid={Boolean(errors.title) || undefined}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-description" className="text-sm font-medium">
          Description <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="goal-description"
          placeholder="A line or two of context — why this, who it serves"
          autoComplete="off"
          aria-invalid={Boolean(errors.description) || undefined}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-measure" className="text-sm font-medium">
          How will you measure success?
        </label>
        <Input
          id="goal-measure"
          placeholder="e.g., Final PDF submitted and approved by supervisor"
          autoComplete="off"
          aria-invalid={Boolean(errors.measure) || undefined}
          {...register("measure")}
        />
        <FieldError message={errors.measure?.message} />
      </div>
    </section>
  );
}
