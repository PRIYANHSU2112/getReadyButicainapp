export const radius = {
  none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
  round: 30, pill: 9999, card: 16, button: 12, input: 12,
  modal: 24, sheet: 24, badge: 6,
} as const;
export type Radius = typeof radius;
