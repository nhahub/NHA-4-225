"use client";

import { useCallback, useState } from "react";
import type { GoalWizardFormOutput } from "./schemas";
import { createGoal } from "./actions";

export type CreateGoalResult =
  | { ok: true }
  | { ok: false; error: string };

export function useCreateGoal() {
  const [data, setData] = useState<GoalWizardFormOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const submit = useCallback(
    async (input: GoalWizardFormOutput): Promise<CreateGoalResult> => {
      setIsPending(true);
      setError(null);
      try {
        const res = await createGoal(input);
        if (res.ok) {
          setData(input);
          return { ok: true };
        } else {
          setError(res.error || "Failed to create goal");
          return { ok: false, error: res.error || "Failed to create goal" };
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { submit, data, error, isPending };
}
