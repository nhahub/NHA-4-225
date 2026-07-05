import Link from "next/link";
import { TargetIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyGoalsState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-full"
      >
        <TargetIcon className="size-5" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="font-heading text-base font-semibold">
          No goals yet
        </h2>
        <p className="text-muted-foreground text-sm">
          Start with one 12-week goal. Three short steps — name it, set the
          cycle, and break it into a few milestones.
        </p>
      </div>
      <Button render={<Link href="/goals/new" />}>
        Create your first goal
      </Button>
    </div>
  );
}