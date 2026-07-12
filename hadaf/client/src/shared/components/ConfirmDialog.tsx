// src/shared/components/ConfirmDialog.tsx
//
// POL-4 — generic confirmation dialog wrapper around the shared
// `AlertDialog` primitive. Used by every destructive action (task delete,
// habit archive, goal delete/archive). Renders nothing until `isOpen`.
//
// Accomplishment-first copy: describes what will happen, never blames.
// Confirm button is variant-aware (`primary` for soft-destructive actions
// like archive, `danger` for hard deletes).

import type { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/AlertDialog';
import { cn } from '@/shared/utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  /** Localized headline. */
  title: string;
  /** Localized body copy. Optional. */
  body?: ReactNode;
  /** Localized cancel-button label. */
  cancelLabel?: string;
  /** Localized confirm-button label. */
  confirmLabel?: string;
  /** `primary` (default) for soft actions like archive; `danger` for deletes. */
  variant?: 'primary' | 'danger';
  onCancel: () => void;
  onConfirm: () => void;
  /**
   * Disable confirm while the mutation is pending; the dialog stays open
   * so the parent can re-open it after `isPending` flips back to false.
   */
  isPending?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  body,
  cancelLabel,
  confirmLabel,
  variant = 'primary',
  onCancel,
  onConfirm,
  isPending,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {body && <AlertDialogDescription asChild>{typeof body === 'string' ? <span>{body}</span> : body}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              variant === 'danger' &&
                'bg-danger-500 hover:bg-danger-600 focus:ring-danger-500',
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
