const POINTS_VALUE_RWF = 10;
const POINTS_PER_1000_RWF = 1;

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000,
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

export function getTier(points: number): Tier {
  if (points >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (points >= TIER_THRESHOLDS.gold) return 'gold';
  if (points >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

export function pointsToRwf(points: number) {
  return points * POINTS_VALUE_RWF;
}

export function rwfToPoints(rwf: number) {
  return Math.floor(rwf / 1000) * POINTS_PER_1000_RWF;
}
