export type DayState =
  | 'legendary'
  | 'amazing'
  | 'perfect'
  | 'good_enough'
  | 'low';

export interface AnalyticsRange {
  from: string;
  to: string;
}

export interface TrendDay {
  date: string;
  points: number;
  tasksCompleted: number;
  habitsCompleted: number;
  dayState: DayState | null;
}

export interface HourBucket {
  hour: number;
  tasksCompleted: number;
  minutes: number;
}

export interface WeekdayBucket {
  weekday:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  tasksCompleted: number;
  points: number;
  avgPoints: number;
  daysCounted: number;
}

export interface AccuracySummary {
  sampleSize: number;
  plannedMinutes: number;
  actualMinutes: number;
  avgRatio: number | null;
  onTargetRate: number | null;
}

export interface AnalyticsTotals {
  pointsEarned: number;
  tasksCompleted: number;
  habitsCompleted: number;
  activeDays: number;
  bestDay: { date: string; points: number } | null;
}

export interface AnalyticsOverview {
  range: AnalyticsRange;
  totals: AnalyticsTotals;
  dailyTrend: TrendDay[];
  productiveHours: HourBucket[];
  unscheduledCompleted: number;
  weekdays: WeekdayBucket[];
  accuracy: AccuracySummary;
}

export interface HabitAnalytics {
  habitId: string;
  title: string;
  type: 'boolean' | 'counter' | 'quit';
  category: string;
  mvdValue?: number;
  targetValue?: number;
  daysInRange: number;
  daysLogged: number;
  /** 0–1 share of range days with a completed log. */
  completionRate: number;
  /** 0–1 share of completed logs that were MVD-level. */
  mvdRate: number;
  currentStreak: number;
  longestStreak: number;
  /** Relapse dates (quit habits) inside the range. */
  relapses: string[];
  /** Days since last relapse ever — quit habits only, null otherwise. */
  daysSinceRelapse: number | null;
}

export interface HabitsAnalyticsResponse {
  range: AnalyticsRange;
  habits: HabitAnalytics[];
}

/** Preset spans for the range picker. */
export type RangePreset = 7 | 30 | 90;
