"use client";

import { useCallback, useState } from "react";
import type { GoalWizardFormOutput } from "./schemas";

const STORAGE_KEY = "hadaf:draft-goal";

export type CreateGoalResult =
  | { ok: true; data: GoalWizardFormOutput }
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
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
          console.log("[useCreateGoal:mock] payload ->", input);
        }
        setData(input);
        return { ok: true, data: input };
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
