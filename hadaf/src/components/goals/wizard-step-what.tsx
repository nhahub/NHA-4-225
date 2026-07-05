"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { GoalWizardFormInput } from "@/features/goals/schemas";
import { useLocale } from "@/providers/locale-provider";

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
  const { t } = useLocale();

  return (
    <section className="flex flex-col gap-4" aria-label={t("newGoal.stepHeadingWhat")}>
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-semibold">
          {t("newGoal.stepHeadingWhat")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("newGoal.stepHeadingWhatHint")}
        </p>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-title" className="text-sm font-medium">
          {t("newGoal.fields.title")}
        </label>
        <Input
          id="goal-title"
          placeholder={t("newGoal.fields.titlePlaceholder")}
          autoComplete="off"
          aria-invalid={Boolean(errors.title) || undefined}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-description" className="text-sm font-medium">
          {t("newGoal.fields.description")}{" "}
          <span className="text-muted-foreground">{t("common.optional")}</span>
        </label>
        <Input
          id="goal-description"
          placeholder={t("newGoal.fields.descriptionPlaceholder")}
          autoComplete="off"
          aria-invalid={Boolean(errors.description) || undefined}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-measure" className="text-sm font-medium">
          {t("newGoal.fields.measure")}
        </label>
        <Input
          id="goal-measure"
          placeholder={t("newGoal.fields.measurePlaceholder")}
          autoComplete="off"
          aria-invalid={Boolean(errors.measure) || undefined}
          {...register("measure")}
        />
        <FieldError message={errors.measure?.message} />
      </div>
    </section>
  );
}