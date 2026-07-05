"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export function WizardStepMilestones() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<GoalWizardFormInput>();
  const { t } = useLocale();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "milestones",
  });

  const onAdd = () => {
    append({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `m_${Date.now()}_${fields.length}`,
      title: "",
      sortOrder: fields.length,
      isCompleted: false,
    });
  };

  return (
    <section className="flex flex-col gap-4" aria-label={t("newGoal.stepHeadingMilestones")}>
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-semibold">
          {t("newGoal.stepHeadingMilestones")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("newGoal.stepHeadingMilestonesHint")}
        </p>
      </header>

      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border bg-muted/40 p-3 text-sm">
          {t("newGoal.noMilestones")}
        </p>
      ) : null}

      <ol className="flex flex-col gap-3">
        {fields.map((field, idx) => {
          const err = errors.milestones?.[idx]?.title?.message;
          const n = idx + 1;
          return (
            <li
              key={field.id}
              className="flex items-start gap-2 rounded-lg border bg-card p-2"
            >
              <span
                aria-hidden="true"
                className="text-muted-foreground mt-1.5 w-6 shrink-0 text-center text-xs tabular-nums"
              >
                {n}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Input
                  placeholder={t("newGoal.milestonePlaceholder", { n })}
                  autoComplete="off"
                  aria-invalid={Boolean(err) || undefined}
                  {...register(`milestones.${idx}.title` as const)}
                />
                <FieldError message={err} />
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={idx === 0}
                  onClick={() => move(idx, idx - 1)}
                  aria-label={t("newGoal.moveUpAria", { n })}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={idx === fields.length - 1}
                  onClick={() => move(idx, idx + 1)}
                  aria-label={t("newGoal.moveDownAria", { n })}
                >
                  <ArrowDownIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(idx)}
                  aria-label={t("newGoal.removeAria", { n })}
                >
                  <XIcon />
                </Button>
              </div>
            </li>
          );
        })}
      </ol>

      <div>
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={onAdd}
          disabled={fields.length >= 12}
        >
          <PlusIcon />
          {t("newGoal.addMilestone")}
        </Button>
      </div>
    </section>
  );
}