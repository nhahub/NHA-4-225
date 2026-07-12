export interface ScoreBreakdown {
  base: number;
  bonus: number;
  total: number;
}

// Mirrors the server-side calculateTaskPoints in server/utils/scoring.js so the UI
// can preview the formula before completion. Server is still the source of truth —
// this is only used for the live breakdown rendered above the confirm button.
export const calculateTaskPointsPreview = ({
  type,
  actualMinutes,
  plannedMinutes,
}: {
  type: 'scheduled' | 'flexible' | 'quick';
  actualMinutes?: number;
  plannedMinutes?: number;
}): ScoreBreakdown => {
  if (type === 'quick') {
    return { base: 2, bonus: 0, total: 2 };
  }

  const basePer10Min = 1;
  const actual = Math.max(0, actualMinutes ?? plannedMinutes ?? 0);
  const planned = Math.max(0, plannedMinutes ?? 0);

  const cappedActual = planned > 0 ? Math.min(actual, planned * 3) : actual;

  const onTime =
    planned > 0 && Math.abs(actual - planned) <= 15 ? 1.15 : 1.0;

  const raw = (cappedActual / 10) * basePer10Min * onTime;
  return {
    base: Math.ceil((cappedActual / 10) * basePer10Min),
    bonus: Math.ceil(raw - Math.ceil((cappedActual / 10) * basePer10Min)),
    total: Math.ceil(raw),
  };
};

export const getPointsBreakdown = (
  _type: 'scheduled' | 'flexible' | 'quick',
  actualMinutes: number,
  plannedMinutes = 0,
): ScoreBreakdown =>
  calculateTaskPointsPreview({
    type: _type,
    actualMinutes,
    plannedMinutes,
  });
