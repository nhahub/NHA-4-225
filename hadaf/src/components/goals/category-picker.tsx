"use client";

import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import {
  CATEGORY_GLYPH_EN,
  CATEGORY_LABEL_EN,
  GOAL_CATEGORIES,
  type GoalCategory,
} from "@/features/goals/schemas";
import type { GoalWizardFormInput } from "@/features/goals/schemas";

export function CategoryPicker() {
  const { setValue, watch } = useFormContext<GoalWizardFormInput>();
  const selected = watch("category");

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium leading-none">
        Choose a category
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {GOAL_CATEGORIES.map((value) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() =>
                setValue("category", value as GoalCategory, {
                  shouldValidate: true,
                })
              }
              aria-pressed={isActive}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border bg-background px-2 py-3 text-xs transition-base outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-primary ring-2 ring-ring/40"
                  : "border-border hover:bg-muted",
              )}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {CATEGORY_GLYPH_EN[value]}
              </span>
              <span className="text-foreground text-center font-medium leading-tight">
                {CATEGORY_LABEL_EN[value]}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
