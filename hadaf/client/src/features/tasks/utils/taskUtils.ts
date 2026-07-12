import { Task, TaskPriority } from '../types';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) {
      // completed tasks sink to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
    }

    const priorityDiff =
      PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const dateDiff = (a.date || '').localeCompare(b.date || '');
    if (dateDiff !== 0) return dateDiff;

    const aStart = a.timeBlockStart || '23:59';
    const bStart = b.timeBlockStart || '23:59';
    return aStart.localeCompare(bStart);
  });
};

export const formatTime = (hhmm?: string): string => {
  if (!hhmm) return '--:--';
  const match = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return hhmm;
  const h = Number(match[1]);
  const m = match[2];
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
};
