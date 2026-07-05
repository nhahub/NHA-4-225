"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { CategoryPicker } from "@/components/goals/category-picker";
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

const TEXTAREA_CLASSES =
  "flex w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

export function WizardStepWhen() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<GoalWizardFormInput>();
  const { t } = useLocale();

  const category = watch("category");
  const cycleStart = watch("cycleStart");

  const handleCycleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setValue("cycleStart", new Date(raw), {
      shouldValidate: false,
      shouldDirty: true,
    });
    if (raw) {
      const start = new Date(raw);
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start.getTime() + 84 * 86_400_000);
        setValue("cycleEnd", end, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  };

  const cycleStartStr =
    cycleStart instanceof Date
      ? cycleStart.toISOString().slice(0, 10)
      : typeof cycleStart === "string"
        ? cycleStart.slice(0, 10)
        : "";

  return (
    <section className="flex flex-col gap-4" aria-label={t("newGoal.stepHeadingWhen")}>
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-semibold">
          {t("newGoal.stepHeadingWhen")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("newGoal.stepHeadingWhenHint")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cycle-start" className="text-sm font-medium">
            {t("newGoal.fields.cycleStart")}
          </label>
          <Input
            id="cycle-start"
            type="date"
            value={cycleStartStr}
            onChange={handleCycleStartChange}
            aria-invalid={Boolean(errors.cycleStart) || undefined}
          />
          <FieldError message={errors.cycleStart?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cycle-end" className="text-sm font-medium">
            {t("newGoal.fields.cycleEnd")}{" "}
            <span className="text-muted-foreground">
              {t("newGoal.fields.cycleEndHint")}
            </span>
          </label>
          <Input
            id="cycle-end"
            type="date"
            readOnly
            aria-invalid={Boolean(errors.cycleEnd) || undefined}
            {...register("cycleEnd")}
          />
          <FieldError message={errors.cycleEnd?.message} />
        </div>
      </div>

      <CategoryPicker />

      {category === "other" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="custom-category" className="text-sm font-medium">
            {t("newGoal.fields.customCategory")}
          </label>
          <Input
            id="custom-category"
            placeholder={t("newGoal.fields.customCategoryPlaceholder")}
            autoComplete="off"
            aria-invalid={Boolean(errors.customCategory) || undefined}
            {...register("customCategory")}
          />
          <FieldError message={errors.customCategory?.message} />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-relevance" className="text-sm font-medium">
          {t("newGoal.fields.relevance")}
        </label>
        <textarea
          id="goal-relevance"
          rows={3}
          placeholder={t("newGoal.fields.relevancePlaceholder")}
          className={TEXTAREA_CLASSES}
          aria-invalid={Boolean(errors.relevance) || undefined}
          {...register("relevance")}
        />
        <FieldError message={errors.relevance?.message} />
      </div>
    </section>
  );
}