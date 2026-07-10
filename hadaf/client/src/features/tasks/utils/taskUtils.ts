import { Task } from '../types';

export const sortTasks = (tasks: Task[]): Task[] => {
  const priorityWeight = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // 1. حالة الإنتهاء (المنتهي ينزل للأسفل)
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    // 2. الأولوية (الأعلى أولاً: Urgent -> Low)
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // 3. حجم المهمة (Big Task يظهر قبل Regular)
    if (a.type !== b.type) {
      return a.type === 'big_task' ? -1 : 1;
    }

    // 4. وقت البداية (الأقرب أولاً)
    const timeA = a.startTime || '23:59';
    const timeB = b.startTime || '23:59';
    return timeA.localeCompare(timeB);
  });
};