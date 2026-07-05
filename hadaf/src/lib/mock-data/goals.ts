import type { Goal, Milestone } from "@/features/goals/schemas";

/**
 * Stable mock dataset for E1-2. Replaced by a real data source in E0-4.
 * Dates are computed relative to "now" so the 12-week bars always look
 * sensible regardless of when the dev runs the app.
 */

const DAY_MS = 86_400_000;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * DAY_MS);
}

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "m_001",
    title: "Read three foundational papers and summarise each in one page",
    sortOrder: 0,
    isCompleted: true,
    completedAt: daysAgo(20),
  },
  {
    id: "m_002",
    title: "Define the research question and write a one-paragraph proposal",
    sortOrder: 1,
    isCompleted: true,
    completedAt: daysAgo(11),
  },
  {
    id: "m_003",
    title: "Outline chapter 1 and get feedback from advisor",
    sortOrder: 2,
    isCompleted: false,
  },
  {
    id: "m_004",
    title: "Draft introduction and related-work section",
    sortOrder: 3,
    isCompleted: false,
  },
  {
    id: "m_005",
    title: "Submit full first draft to advisor",
    sortOrder: 4,
    isCompleted: false,
  },

  {
    id: "m_010",
    title: "Book the flight and accommodation",
    sortOrder: 0,
    isCompleted: false,
  },
  {
    id: "m_011",
    title: "Plan weekend route with the kids",
    sortOrder: 1,
    isCompleted: false,
  },

  {
    id: "m_020",
    title: "Run a continuous 5K without walking",
    sortOrder: 0,
    isCompleted: true,
    completedAt: daysAgo(30),
  },
  {
    id: "m_021",
    title: "Run a continuous 10K without walking",
    sortOrder: 1,
    isCompleted: false,
  },

  {
    id: "m_030",
    title: "Choose the Arabic edition and reading pace",
    sortOrder: 0,
    isCompleted: false,
  },

  {
    id: "m_040",
    title: "Ship the new dashboard to staging",
    sortOrder: 0,
    isCompleted: true,
    completedAt: daysAgo(7),
  },
  {
    id: "m_041",
    title: "Run a usability test with five users",
    sortOrder: 1,
    isCompleted: true,
    completedAt: daysAgo(2),
  },
  {
    id: "m_042",
    title: "Address usability feedback and ship to production",
    sortOrder: 2,
    isCompleted: true,
    completedAt: daysAgo(1),
  },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: "g_thesis",
    title: "Finish the thesis proposal",
    description:
      "Get a defensible, advisor-approved proposal I can build the rest of the semester around.",
    measure:
      "Advisor signs off on a written proposal that names the research question, three papers, and a chapter outline.",
    category: "education_work",
    customCategory: "",
    relevance:
      "This is the spine of the semester — without it, every later task becomes an emergency.",
    cycleStart: daysAgo(28),
    cycleEnd: daysFromNow(56),
    createdAt: daysAgo(28),
    progress: 0.42,
    health: "needs_attention",
    milestones: MOCK_MILESTONES.filter((m) =>
      ["m_001", "m_002", "m_003", "m_004", "m_005"].includes(m.id),
    ),
  },
  {
    id: "g_trip",
    title: "Family weekend trip to the coast",
    description: "A real, planned, off-the-laptop weekend with the kids.",
    measure:
      "We have booked flights, a route, and we actually go — no work emails opened.",
    category: "family",
    customCategory: "",
    relevance:
      "Without something on the calendar, weekends quietly fill with work.",
    cycleStart: daysAgo(7),
    cycleEnd: daysFromNow(77),
    createdAt: daysAgo(7),
    progress: 0.08,
    health: "at_risk",
    milestones: MOCK_MILESTONES.filter((m) =>
      ["m_010", "m_011"].includes(m.id),
    ),
  },
  {
    id: "g_run10k",
    title: "Run a continuous 10K",
    description: "Build from a 5K base to a 10K I can finish without walking.",
    measure:
      "Complete a 10K run outdoors without walking breaks, at any pace.",
    category: "health",
    customCategory: "",
    relevance:
      "It is the smallest goal that makes every morning easier for the rest of the year.",
    cycleStart: daysAgo(21),
    cycleEnd: daysFromNow(63),
    createdAt: daysAgo(21),
    progress: 0.2,
    health: "behind",
    milestones: MOCK_MILESTONES.filter((m) =>
      ["m_020", "m_021"].includes(m.id),
    ),
  },
  {
    id: "g_quran",
    title: "Finish reading the Quran in Arabic",
    description: "A calm, daily reading practice that closes the year.",
    measure:
      "Reach the final surah at a steady pace I can sustain, not a sprint.",
    category: "religion_spirituality",
    customCategory: "",
    relevance:
      "It is the practice that grounds everything else; I want it back in my day.",
    cycleStart: daysAgo(14),
    cycleEnd: daysFromNow(70),
    createdAt: daysAgo(14),
    progress: 0.55,
    health: "on_track",
    milestones: MOCK_MILESTONES.filter((m) => ["m_030"].includes(m.id)),
  },
  {
    id: "g_dashboard",
    title: "Ship the new product dashboard",
    description: "Get the redesigned dashboard in front of real users.",
    measure:
      "Dashboard is live in production and at least 80% of weekly active users have opened it.",
    category: "education_work",
    customCategory: "",
    relevance:
      "It unblocks the next two quarters of work and clears the largest user-complaint theme.",
    cycleStart: daysAgo(70),
    cycleEnd: daysFromNow(14),
    createdAt: daysAgo(70),
    progress: 1,
    health: "on_track",
    milestones: MOCK_MILESTONES.filter((m) =>
      ["m_040", "m_041", "m_042"].includes(m.id),
    ),
  },
];