"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  reorderMilestones,
  toggleMilestone,
} from "@/features/goals/actions";
import type { Milestone } from "@/features/goals/schemas";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type OptimisticAction =
  | { kind: "toggle"; id: string; next: boolean }
  | { kind: "reorder"; orderedIds: string[] };

function applyOptimistic(
  milestones: Milestone[],
  action: OptimisticAction,
): Milestone[] {
  if (action.kind === "toggle") {
    return milestones.map((m) =>
      m.id === action.id
        ? {
            ...m,
            isCompleted: action.next,
            completedAt: action.next ? new Date() : undefined,
          }
        : m,
    );
  }
  const indexById = new Map(action.orderedIds.map((id, i) => [id, i]));
  return [...milestones]
    .map((m) => ({ ...m, sortOrder: indexById.get(m.id) ?? m.sortOrder }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function SortableMilestoneRow({
  milestone,
  onToggle,
}: {
  milestone: Milestone;
  onToggle: (id: string, next: boolean) => void;
}) {
  const { t } = useLocale();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleLabel = milestone.isCompleted
    ? t("goalDetail.markIncompleteAria", { title: milestone.title })
    : t("goalDetail.markCompletedAria", { title: milestone.title });

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-card p-2 transition-base",
        isDragging && "opacity-60 ring-2 ring-ring/40",
      )}
    >
      <button
        type="button"
        aria-label={t("goalDetail.reorderAria", { title: milestone.title })}
        className="text-muted-foreground hover:text-foreground focus-visible:text-foreground rounded-sm p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" aria-hidden="true" />
      </button>
      <div className="flex min-w-0 flex-1 items-start gap-2 pt-0.5">
        <Checkbox
          checked={milestone.isCompleted}
          onCheckedChange={(next: boolean) => onToggle(milestone.id, next)}
          aria-label={toggleLabel}
        />
        <span
          className={cn(
            "text-sm leading-snug",
            milestone.isCompleted && "text-muted-foreground line-through",
          )}
        >
          {milestone.title}
        </span>
      </div>
    </li>
  );
}

export function MilestoneList({
  goalId,
  initialMilestones,
}: {
  goalId: string;
  initialMilestones: Milestone[];
}) {
  const { t } = useLocale();
  const sorted = [...initialMilestones].sort((a, b) => a.sortOrder - b.sortOrder);
  const [committed, setCommitted] = useState<Milestone[]>(sorted);
  const [optimistic, apply] = useOptimistic(committed, applyOptimistic);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onToggle = (id: string, next: boolean) => {
    startTransition(async () => {
      const previous = committed;
      apply({ kind: "toggle", id, next });
      const result = await toggleMilestone({
        milestoneId: id,
        next,
      });
      if (!result.ok) {
        setCommitted(previous);
        return;
      }
      setCommitted((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                isCompleted: next,
                completedAt: next ? new Date() : undefined,
              }
            : m,
        ),
      );
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = optimistic.map((m) => m.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(optimistic, oldIndex, newIndex);
    const orderedIds = reordered.map((m) => m.id);

    startTransition(async () => {
      const previous = committed;
      apply({ kind: "reorder", orderedIds });
      const result = await reorderMilestones({
        goalId,
        orderedMilestoneIds: orderedIds,
      });
      if (!result.ok) {
        setCommitted(previous);
        return;
      }
      setCommitted(reordered.map((m, i) => ({ ...m, sortOrder: i })));
    });
  };

  if (optimistic.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border bg-muted/40 p-3 text-sm">
        {t("goalDetail.emptyMilestones")}
      </p>
    );
  }

  const completedCount = optimistic.filter((m) => m.isCompleted).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="font-medium">{t("goalDetail.milestonesLabel")}</span>
        <span className="tabular-nums">
          {t("goalDetail.milestonesCount", {
            completed: completedCount,
            total: optimistic.length,
          })}
        </span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={optimistic.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col gap-2">
            {optimistic.map((m) => (
              <SortableMilestoneRow
                key={m.id}
                milestone={m}
                onToggle={onToggle}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}