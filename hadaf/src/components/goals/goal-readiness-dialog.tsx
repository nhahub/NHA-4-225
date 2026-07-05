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
import { useLocale } from "@/providers/locale-provider";

type GoalReadinessDialogProps = {
  defaultOpen?: boolean;
};

export function GoalReadinessDialog({
  defaultOpen = true,
}: GoalReadinessDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {t("readinessDialog.title")}
          </DialogTitle>
          <DialogDescription>{t("readinessDialog.body")}</DialogDescription>
        </DialogHeader>

        <div className="text-muted-foreground flex flex-col gap-3 text-sm">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-foreground font-medium">
              {t("readinessDialog.goalExampleTitle")}
            </p>
            <p className="mt-1 text-xs">{t("readinessDialog.goalExampleHint")}</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-foreground font-medium">
              {t("readinessDialog.habitExampleTitle")}
            </p>
            <p className="mt-1 text-xs">
              {t("readinessDialog.habitExampleHint")}
            </p>
          </div>
          <p className="text-xs">{t("readinessDialog.limitNote")}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("readinessDialog.secondary")}
          </Button>
          <Button onClick={() => setOpen(false)}>
            {t("readinessDialog.primary")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}