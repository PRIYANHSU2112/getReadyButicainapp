export const animations = {
  duration: { instant: 100, fast: 200, normal: 300, slow: 500, splash: 1200 },
  easing: { standard: "ease-in-out", decelerate: "ease-out", accelerate: "ease-in" },
  spring: { damping: 15, stiffness: 120, mass: 1 },
  scale: { pressed: 0.96, active: 0.98, badgePop: 1.15 },
} as const;
export type AnimationsToken = typeof animations;
