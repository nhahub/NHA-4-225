"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GoalReadinessDialogProps = {
  defaultOpen?: boolean;
};

export function GoalReadinessDialog({
  defaultOpen = true,
}: GoalReadinessDialogProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">A quick word first</DialogTitle>
          <DialogDescription>
            A <strong>goal</strong> is an outcome you can measure at the end of
            a cycle. A <strong>habit</strong> is a behaviour you repeat on most
            days.
          </DialogDescription>
        </DialogHeader>

        <div className="text-muted-foreground flex flex-col gap-3 text-sm">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-foreground font-medium">
              Goal · &quot;Submit my thesis draft by week 12&quot;
            </p>
            <p className="mt-1 text-xs">
              Clear finish line, one shot — good for a 12-week cycle.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-foreground font-medium">
              Habit · &quot;Read 20 pages a day&quot;
            </p>
            <p className="mt-1 text-xs">
              Repeats indefinitely — better tracked as a daily habit.
            </p>
          </div>
          <p className="text-xs">
            You can keep up to 5 active goals at a time. This is your first one.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Not now
          </Button>
          <Button onClick={() => setOpen(false)}>Got it — start</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
