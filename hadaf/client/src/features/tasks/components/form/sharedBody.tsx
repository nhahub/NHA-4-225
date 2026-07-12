// Shared body composes the four TaskHeader / TaskScheduling / TaskPriority / TaskChecklist
// sub-components plus the difficulty picker so Edit* forms can render them without
// repeating the FormProvider wiring.

import { TaskHeader } from './TaskHeader';
import { TaskScheduling } from './TaskScheduling';
import { TaskPriorityPicker } from './TaskPriority';
import { TaskChecklist } from './TaskSubtasks';

export const TaskFormBody = () => (
  <div className="space-y-6">
    <TaskHeader />
    <TaskScheduling />
    <TaskPriorityPicker />
    <TaskChecklist />
  </div>
);

export type { TaskFormValues } from './formValues';
