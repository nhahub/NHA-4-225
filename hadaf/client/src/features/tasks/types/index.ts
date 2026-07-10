export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SubTask {
  id?: number | string;
  title: string;
  isCompleted: boolean;
  taskId?: number | string;
}

export interface Task {
  id?: number | string;
  name: string;
  description?: string;
  
  day: Date; 
  
  startTime?: Date;
  endTime?: Date;
  
  // ✅ تعريف الحقول بدقة لتطابق الباك إند
  actualStartTime?: Date;
  actualendTime?: Date; 

  priority: TaskPriority;
  done: boolean;
  points: number;
  
  subTasks: SubTask[];

  // حقول للواجهة (Optional)
  isTimeSet?: boolean;
}

export interface DragResult {
  source: {
    index: number;
    droppableId: string;
  };
  destination?: {
    index: number;
    droppableId: string;
  }; 
}