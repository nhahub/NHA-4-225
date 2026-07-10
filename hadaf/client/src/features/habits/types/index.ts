export type HabitCategory =
  | 'education_work'
  | 'family'
  | 'health'
  | 'religion_spirituality'
  | 'other';

export type HabitType = 'boolean' | 'counter' | 'quit';

export interface HabitFrequency {
  type: string;
  daysOfWeek?: string[];
}

export interface Habit {
  _id: string;
  userId?: string;
  title: string;
  category: HabitCategory;
  type: HabitType;
  frequency: HabitFrequency;
  targetValue?: number;
  mvdValue?: number;
  mvdDescription?: string;
  isSpiritual?: boolean;
  isArchived?: boolean;
  /** Computed by the server for quit habits. */
  daysSinceRelapse?: number | null;
  createdAt?: string;
}

export interface HabitLog {
  _id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  isMvd: boolean;
  isRelapse?: boolean;
}

export interface CreateHabitInput {
  title: string;
  category: HabitCategory;
  type: HabitType;
  targetValue?: number;
  mvdValue?: number;
  mvdDescription?: string;
}

export interface LogHabitInput {
  date: string;
  value: number;
  isMvd?: boolean;
}

export interface RelapseInput {
  /** date string defaults to today client-side. Kept server-derived today for now. */
  date?: string;
}
