// Partner tiers from lifetime completed services and rating. One table drives the
// tier badge, the "next tier" hint and the Profile, so they can never disagree.
interface Tier {
  label: string;
  minCompleted: number;
  minRating: number;
}

// Ascending. A tier is reached only when both thresholds are met.
const TIERS: Tier[] = [
  {label: "Silver Expert", minCompleted: 25, minRating: 0},
  {label: "Gold Expert", minCompleted: 100, minRating: 4.2},
  {label: "Platinum Expert", minCompleted: 500, minRating: 4.5},
];

const reached = (t: Tier, completed: number, rating: number) =>
  completed >= t.minCompleted && rating >= t.minRating;

export const tierFor = (completed: number, rating: number): string | null => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (reached(TIERS[i], completed, rating)) return TIERS[i].label;
  }
  return completed > 0 ? "New Partner" : null;
};

export interface NextTier {
  label: string;
  // Bookings still needed; 0 means bookings are enough and rating is the blocker.
  remaining: number;
  minRating: number;
}

export const nextTier = (completed: number, rating: number): NextTier | null => {
  const next = TIERS.find(t => !reached(t, completed, rating));
  return next
    ? {label: next.label, remaining: Math.max(0, next.minCompleted - completed), minRating: next.minRating}
    : null;
};
