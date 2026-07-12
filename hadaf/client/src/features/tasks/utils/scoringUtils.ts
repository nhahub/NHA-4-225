export interface ScoreBreakdown {
  base: number;
  bonus: number;
  total: number;
  breakdownDetails?: {
    priorityMultiplier: number;
    accuracyMultiplier: number;
  };
}

const getPriorityMultiplier = (priority: string) => {
  switch (priority) {
    case 'urgent': return 2.0;
    case 'high': return 1.7;
    case 'medium': return 1.3;
    case 'low': return 1.0;
    default: return 1.0;
  }
};

// Mirrors the server-side calculateTaskPoints in server/utils/scoring.js so the UI
// can preview the formula before completion. Server is still the source of truth —
// this is only used for the live breakdown rendered above the confirm button.
export const calculateTaskPointsPreview = ({
  type,
  actualMinutes,
  plannedMinutes,
  priority = 'medium',
}: {
  type: 'scheduled' | 'flexible' | 'quick';
  actualMinutes?: number;
  plannedMinutes?: number;
  priority?: string;
}): ScoreBreakdown => {
  if (type === 'quick') {
    return { base: 2, bonus: 0, total: 2 };
  }

  const safeActual = actualMinutes ?? plannedMinutes ?? 0;
  const planned = Math.max(0, plannedMinutes ?? 0);

  // Base points are locked to the PLANNED duration to prevent gaming.
  // If no planned duration exists (ad-hoc task), we use the actual time.
  const referenceTime = planned > 0 ? planned : safeActual;
  
  const basePoints = Math.max(1, Math.ceil(referenceTime / 10));
  const priorityMultiplier = getPriorityMultiplier(priority);

  let accuracyMultiplier = 1.0;
  if (planned > 0) {
    const diff = planned - safeActual;
    if (diff > 15) {
      accuracyMultiplier = 1.5; // Early finish
    } else if (Math.abs(safeActual - planned) <= 15) {
      accuracyMultiplier = 1.2; // Time accuracy
    }
  }

  const baseWithPriority = Math.ceil(basePoints * priorityMultiplier);
  
  let accuracyPoints = 0;
  if (accuracyMultiplier > 1.0) {
      accuracyPoints = Math.max(1, Math.ceil(basePoints * priorityMultiplier * accuracyMultiplier) - baseWithPriority);
  }

  const total = baseWithPriority + accuracyPoints;

  return {
    base: baseWithPriority,
    bonus: accuracyPoints,
    total,
    breakdownDetails: {
      priorityMultiplier,
      accuracyMultiplier,
    }
  };
};

export const getPointsBreakdown = (
  _type: 'scheduled' | 'flexible' | 'quick',
  actualMinutes: number,
  plannedMinutes = 0,
  priority = 'medium'
): ScoreBreakdown =>
  calculateTaskPointsPreview({
    type: _type,
    actualMinutes,
    plannedMinutes,
    priority,
  });
