"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overrideProgress } from "@/features/goals/actions";
import type { Goal } from "@/features/goals/schemas";
import { calculateHybridProgress } from "@/domain/goal-progress";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type ManualProgressOverrideProps = {
  goal: Goal;
};

const DEBOUNCE_MS = 300;

/**
 * Manual progress override slider (FR7).
 *
 * Per FR7 + the contrast-discipline rule:
 *   - The "Manual" badge uses the `accent` (brass) fill with dark ink
 *     text — never white. White-on-brass measures ~2.4:1 (fails).
 *   - The revert button is only visible when an override is set.
 *   - Slider writes are debounced 300 ms so a drag doesn't fire N writes.
 */
export function ManualProgressOverride({ goal }: ManualProgressOverrideProps) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();

  // The computed baseline — what `progress` would be if no override
  // existed. Recomputed client-side from the milestone state so the
  // user can see what they're overriding.
  const computedBaseline = useMemo(() => {
    const tasks: { status: string }[] = [];
    const milestones = goal.milestones.map((m) => ({
      isCompleted: m.isCompleted,
    }));
    return calculateHybridProgress(tasks, milestones, null);
  }, [goal.milestones]);

  const initialValue = goal.manualProgress ?? Math.round(computedBaseline * 100);
  const isOverridden = goal.manualProgress !== null;
  const [value, setValue] = useState<number>(initialValue);

  // Reset local state when the server state changes (e.g. after revert).
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounced commit: only fires the server action after the user stops
  // dragging for `DEBOUNCE_MS`. Skips a redundant write when the slider
  // value equals the server-side value.
  useEffect(() => {
    if (value === goal.manualProgress) return;
    const handle = setTimeout(() => {
      startTransition(async () => {
        const result = await overrideProgress({
          goalId: goal.id,
          value,
        });
        if (!result.ok) {
          toast.error(t("goalDetail.manualOverrideError"));
        }
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [value, goal.manualProgress, goal.id, startTransition, t]);

  const handleRevert = () => {
    startTransition(async () => {
      const result = await overrideProgress({
        goalId: goal.id,
        value: null,
      });
      if (result.ok) {
        setValue(Math.round(computedBaseline * 100));
        toast.success(t("goalDetail.manualOverrideSuccess"));
      } else {
        toast.error(t("goalDetail.manualOverrideError"));
      }
    });
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          <span className="inline-flex items-center gap-2">
            {t("goalDetail.manualOverrideTitle")}
            {isOverridden ? (
              <span
                className={cn(
                  "bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
                )}
              >
                {t("goalDetail.manualBadge")}
              </span>
            ) : null}
          </span>
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {t("goalDetail.manualOverrideHelper")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            disabled={isPending}
            aria-label={t("goalDetail.manualOverrideTitle")}
            className={cn(
              "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
          <span
            className={cn(
              "font-heading w-12 shrink-0 text-end text-base font-semibold tabular-nums",
              isOverridden ? "text-accent-foreground" : "text-foreground",
            )}
            aria-live="polite"
          >
            {value}
            {t("home.progressPercentUnit")}
          </span>
        </div>

        <div className="text-muted-foreground flex items-center justify-between gap-3 text-xs">
          <span className="tabular-nums">
            {t("goalDetail.manualOverrideComputedLabel")}:{" "}
            {Math.round(computedBaseline * 100)}
            {t("home.progressPercentUnit")}
          </span>
          {isOverridden ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevert}
              disabled={isPending}
            >
              <RotateCcwIcon aria-hidden="true" />
              {t("goalDetail.manualOverrideRevert")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}