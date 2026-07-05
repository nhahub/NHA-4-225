"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ContributionPulseProps = {
  /** Triggered whenever the counter advances. Re-renders the fade text. */
  trigger: number;
  /** Last pulse delta, e.g. 8 */
  delta: number;
  /** Goal the pulse points to, e.g. "Finish the thesis proposal" */
  goalTitle?: string;
  /** Localized prefix (e.g. "+") */
  prefix: string;
  /** Localized connector word (e.g. "نحو" / "toward") */
  connector: string;
  /** Localized percent unit ("٪" / "%") */
  unit: string;
};

/**
 * CSS-fade Contribution Pulse — appears for ~3 seconds after a task
 * completion, then fades out. Renders the brass accent color.
 * No framer-motion; just CSS transitions on opacity + transform.
 */
export function ContributionPulse({
  trigger,
  delta,
  goalTitle,
  prefix,
  connector,
  unit,
}: ContributionPulseProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(id);
  }, [trigger]);

  if (delta === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex items-end justify-center"
    >
      <span
        className={cn(
          "rounded-full bg-accent px-4 py-1.5 text-sm font-medium tabular-nums text-accent-foreground shadow-lg ring-1 ring-foreground/10 transition-fast",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {prefix}
        {delta}
        {unit} {connector} {goalTitle ?? ""}
      </span>
    </div>
  );
}