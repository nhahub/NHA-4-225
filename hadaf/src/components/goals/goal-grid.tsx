"use client";

import { useMemo, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoalCard } from "@/components/goals/goal-card";
import { categoryLabel } from "@/features/goals/labels";
import type { Goal } from "@/features/goals/schemas";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type GoalGridProps = {
  goals: Goal[];
};

/**
 * Client-side search/filter wrapper for the goal grid (PRD gap-fill PT6).
 * Filters by title, category label, or custom category — instant on
 * keystroke, no extra DB round-trip. The wrapper above (12-Week Bar,
 * Weekly Heatmap, Execution Score) is intentionally NOT filtered so
 * the user retains context of their full active set.
 */
export function GoalGrid({ goals }: GoalGridProps) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return goals;
    return goals.filter((goal) => {
      const titleMatch = goal.title.toLowerCase().includes(q);
      const categoryText =
        goal.category === "other" && goal.customCategory
          ? goal.customCategory
          : categoryLabel(locale, goal.category);
      const categoryMatch = categoryText.toLowerCase().includes(q);
      const customMatch =
        goal.customCategory?.toLowerCase().includes(q) ?? false;
      return titleMatch || categoryMatch || customMatch;
    });
  }, [goals, query, locale]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <SearchIcon
          className="text-muted-foreground absolute top-1/2 start-2.5 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("goals.searchPlaceholder")}
          aria-label={t("goals.searchPlaceholder")}
          className="h-9 ps-9 pe-9"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQuery("")}
            aria-label={t("goals.searchClear")}
            className="absolute top-1/2 end-1 -translate-y-1/2"
          >
            <XIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border bg-card/50 px-6 py-10 text-center text-sm">
          <p>{t("goals.searchNoResults", { query })}</p>
          <Button variant="outline" size="sm" onClick={() => setQuery("")}>
            {t("goals.searchClear")}
          </Button>
        </div>
      ) : (
        <ul
          role="list"
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {filtered.map((goal) => (
            <li key={goal.id}>
              <GoalCard goal={goal} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}