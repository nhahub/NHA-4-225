/**
 * Stable mock dataset for the Adaptive Home (E2 / E3).
 * Replaced by a real data source in a later epic. The contract here is what
 * the Home consumes; the implementation may swap.
 *
 * Dates are computed relative to "now" so today's tasks / habits always look
 * sensible regardless of when the dev runs the app.
 */

export type DayType = "work" | "light" | "off";

export type TaskType = "scheduled" | "flexible" | "quick";

export type TaskStatus = "todo" | "done";

export type DayTask = {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  /** ISO time of day for scheduled tasks, e.g. "09:30" */
  scheduledAt?: string;
  /** estimated minutes for flexible / scheduled */
  estimatedMinutes?: number;
  /** priority 1..3, 1 highest */
  priority?: 1 | 2 | 3;
  /** linked goal id, for the Contribution Pulse */
  goalId?: string;
  goalTitle?: string;
};

export type HabitKind = "boolean" | "counter" | "quit";

export type DayHabit = {
  id: string;
  title: string;
  kind: HabitKind;
  /** MVD = minimum viable version, shown on light days */
  mvdTitle?: string;
  /** counter goal for the day, when kind === "counter" */
  target?: number;
  /** units string e.g. "pages" */
  unit?: string;
  /** current progress for counter habits */
  progress?: number;
  completed: boolean;
};

export type BacklogTask = {
  id: string;
  title: string;
  /** days carry-over, used to label the chip */
  carryOverDays: number;
};

export type TodaySnapshot = {
  dayType: DayType;
  /** localized YYYY-MM-DD */
  dateIso: string;
  tasks: DayTask[];
  habits: DayHabit[];
  backlog: BacklogTask[];
};

const DAY_MS = 86_400_000;

export const MOCK_TODAY: TodaySnapshot = {
  dayType: "work",
  dateIso: new Date().toISOString().slice(0, 10),
  tasks: [
    {
      id: "t_001",
      title: "Outline chapter 1 and review with advisor",
      type: "scheduled",
      status: "todo",
      scheduledAt: "09:30",
      estimatedMinutes: 45,
      priority: 1,
      goalId: "g_thesis",
      goalTitle: "Finish the thesis proposal",
    },
    {
      id: "t_002",
      title: "Run 3K easy pace",
      type: "flexible",
      status: "todo",
      estimatedMinutes: 25,
      priority: 2,
      goalId: "g_run10k",
      goalTitle: "Run a continuous 10K",
    },
    {
      id: "t_003",
      title: "Email supervisor the proposal draft",
      type: "quick",
      status: "done",
      priority: 2,
      goalId: "g_thesis",
      goalTitle: "Finish the thesis proposal",
    },
    {
      id: "t_004",
      title: "Read two pages of Arabic Quran",
      type: "quick",
      status: "todo",
      estimatedMinutes: 8,
      priority: 3,
      goalId: "g_quran",
      goalTitle: "Finish reading the Quran in Arabic",
    },
    {
      id: "t_005",
      title: "Plan route for the family weekend",
      type: "flexible",
      status: "todo",
      estimatedMinutes: 30,
      priority: 3,
      goalId: "g_trip",
      goalTitle: "Family weekend trip to the coast",
    },
    {
      id: "t_006",
      title: "Confirm dashboard staging deploy notes",
      type: "quick",
      status: "done",
      priority: 2,
      goalId: "g_dashboard",
      goalTitle: "Ship the new product dashboard",
    },
  ],
  habits: [
    {
      id: "h_001",
      title: "Read 20 pages",
      kind: "counter",
      mvdTitle: "Read 1 page",
      target: 20,
      unit: "pages",
      progress: 8,
      completed: false,
    },
    {
      id: "h_002",
      title: "Stretch 5 minutes",
      kind: "boolean",
      mvdTitle: "Stretch 1 minute",
      completed: true,
    },
    {
      id: "h_003",
      title: "No caffeine after 14:00",
      kind: "quit",
      completed: false,
    },
  ],
  backlog: [
    {
      id: "b_001",
      title: "Reply to advisor about chapter 1 outline",
      carryOverDays: 2,
    },
    {
      id: "b_002",
      title: "Book the trip's outbound flight",
      carryOverDays: 4,
    },
    {
      id: "b_003",
      title: "Refill water bottle at the office",
      carryOverDays: 1,
    },
  ],
};

/**
 * Helper used in the day snapshot fixtures to express "yesterday" without
 * recomputing everywhere.
 */
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}