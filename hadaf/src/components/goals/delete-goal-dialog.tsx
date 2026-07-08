"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteGoal } from "@/features/goals/actions";
import { useLocale } from "@/providers/locale-provider";

type DeleteGoalDialogProps = {
  goalId: string;
  goalTitle: string;
};

const MIN_REASON = 2;
const MAX_REASON = 500;

export function DeleteGoalDialog({ goalId, goalTitle }: DeleteGoalDialogProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const trimmed = reason.trim();
  const isValid = trimmed.length >= MIN_REASON && trimmed.length <= MAX_REASON;

  const handleConfirm = () => {
    if (!isValid) return;
    startTransition(async () => {
      const result = await deleteGoal({ goalId, reason: trimmed });
      if (result.ok) {
        toast.success(t("goalDetail.deleteSuccess"));
        setOpen(false);
        router.push("/goals");
      } else {
        toast.error(result.error || t("goalDetail.deleteError"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            aria-label={`${t("goalDetail.deleteTitle")}: ${goalTitle}`}
          />
        }
      >
        <TrashIcon aria-hidden="true" />
        {t("goalDetail.deleteTitle")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {t("goalDetail.deleteTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("goalDetail.deleteHelper")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`delete-reason-${goalId}`}
            className="text-foreground text-xs font-medium"
          >
            {t("goalDetail.deleteReasonLabel")}
          </label>
          <textarea
            id={`delete-reason-${goalId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("goalDetail.deleteReasonPlaceholder")}
            disabled={isPending}
            rows={3}
            maxLength={MAX_REASON}
            className="border-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-lg border px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <span className="text-muted-foreground text-end text-[0.65rem] tabular-nums">
            {trimmed.length}/{MAX_REASON}
          </span>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("common.cancel")}
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isPending}
          >
            {t("goalDetail.deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}